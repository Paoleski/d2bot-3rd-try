/**
*	@filename	Attack.js
*	@author		kolton
*	@desc		handle player attacks
*/

var Attack = {
	classes: ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"],
	infinity: false,
	clearing: false, // true while clear/clearList runs — blocks nested danger clears from Pather
	_dangerCache: null, // {tick, result, nearEmpty}
	_dangerCacheMs: 100,

	// Initialize attacks
	init: function () {
		if (Config.Wereform) {
			include("common/Attacks/wereform.js");
		} else {
			include("common/Attacks/" + this.classes[me.classid] + ".js");
		}

		if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
			showConsole();
			print("ÿc1Bad attack config. Don't expect your bot to attack.");
		}

		if (me.gametype === 1) {
			this.checkInfinity();
			this.getCharges();
		}
	},

	// Needed by Town.doChores (newer Town.js expects these on Attack)
	getPrimarySlot: function () {
		if (typeof Config.PrimarySlot === "undefined" || Config.PrimarySlot === -1) {
			return me.classic ? 0 : (me.weaponswitch || 0);
		}

		return Config.PrimarySlot;
	},

	weaponSwitch: function (slot) {
		return Precast.weaponSwitch(slot);
	},

	/** True if skill can be cast now (0 = normal attack always).
	 *  Uses soft level (hard + item +skills) and oskill (stat 97). */
	canUseSkill: function (skillId) {
		if (skillId === undefined || skillId === null || skillId < 0) {
			return false;
		}

		if (skillId === 0) {
			return true;
		}

		// Soft points include staff +1 to Fire Bolt, etc.
		if (me.getSkill(skillId, 1)) {
			return true;
		}

		// Oskill / "to skill" granted only as item skill (not always in getSkill soft)
		try {
			if (me.getStat(97, skillId)) {
				return true;
			}
		} catch (e) {}

		return false;
	},

	/** Prefer configured skill if owned; otherwise normal attack (0). */
	usableSkill: function (skillId) {
		if (this.canUseSkill(skillId)) {
			return skillId;
		}

		return 0;
	},

	// SoloPlay-style classid helpers (numbers — no sdk dependency)
	shamanIds: [58, 59, 60, 61, 62, 101, 102, 103, 104, 105, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676],
	fallenIds: [19, 20, 21, 22, 23, 642, 643, 644],
	// FoulCrow / BloodHawk / BlackVulture / CloudStalker / Sucker / Feeder / BloodHook / BloodWing nests
	nestIds: [206, 207, 208, 209, 334, 335, 336, 337],

	isShaman: function (unit) {
		return !!(unit && this.shamanIds.indexOf(unit.classid) > -1);
	},

	isFallen: function (unit) {
		return !!(unit && this.fallenIds.indexOf(unit.classid) > -1);
	},

	isMonsterNest: function (unit) {
		return !!(unit && this.nestIds.indexOf(unit.classid) > -1);
	},

	isUnraveler: function (unit) {
		if (!unit) {
			return false;
		}

		try {
			// monstats MonType Unraveler = 27
			return getBaseStat("monstats", unit.classid, "MonType") === 27;
		} catch (eU) {
			return false;
		}
	},

	/** Nearest attackable monster within range, or false. */
	findNearestMonster: function (range) {
		var mon, d, best = false, bestD;

		if (range === undefined) {
			range = 50;
		}

		bestD = range;
		mon = getUnit(1);

		if (mon) {
			do {
				if (this.checkMonster(mon) && this.skipCheck(mon)) {
					d = getDistance(me, mon);

					if (d < bestD) {
						bestD = d;
						best = copyUnit(mon);
					}
				}
			} while (mon.getNext());
		}

		return best;
	},

	/** Configured melee-danger radius, or 0 if DangerClear is off / pure walker. */
	dangerRange: function () {
		if (!Config.DangerClear || typeof Config.DangerClear !== "object") {
			return 0;
		}

		// Same gate as shouldDangerClear — lvl1 walk-leveling must not pay clear-loop tax
		if (!(Config.DangerClear.WhileWalking) && typeof Pather !== "undefined" && !Pather.canTeleport()) {
			return 0;
		}

		return Config.DangerClear.Range || 8;
	},

	/** Range used when clearing a danger interrupt. */
	dangerClearRange: function () {
		if (!this.dangerRange()) {
			return 0;
		}

		return Config.DangerClear.ClearRange || 12;
	},

	/**
	 * Melee peel radius while already in Attack.clear / clearList.
	 * DangerClear.WhileWalking=false skips mid-walk interrupts for pure walkers, but once we
	 * choose to fight we must still peel trash before chasing shamans (else packs surround).
	 */
	clearPeelRange: function () {
		var r = this.dangerRange();

		if (r > 0) {
			return r;
		}

		if (Config.DangerClear && typeof Config.DangerClear === "object" && Config.DangerClear.Range) {
			return Config.DangerClear.Range;
		}

		return 8;
	},

	/** Count attackable monsters within range of me (no sort — travel surround checks). */
	countNearMonsters: function (range) {
		var mon, n;

		if (range === undefined) {
			range = this.clearPeelRange();
		}

		n = 0;
		mon = getUnit(1);

		if (!mon) {
			return 0;
		}

		do {
			if (getDistance(me, mon) > range) {
				continue;
			}

			if (!this.checkMonster(mon) || !this.skipCheck(mon)) {
				continue;
			}

			n += 1;
		} while (mon.getNext());

		return n;
	},

	/**
	 * Pure-walker travel interrupt: 2+ hostiles in peel range (not a lone Fallen stutter).
	 * Tele chars keep normal DangerClear; this only gates mid-walk peels for walkers.
	 */
	walkerTravelThreat: function () {
		if (me.inTown || me.dead || this.clearing) {
			return false;
		}

		if (typeof Pather !== "undefined" && Pather.canTeleport()) {
			return false;
		}

		return this.countNearMonsters(this.clearPeelRange()) >= 2;
	},

	/**
	 * True when we should interrupt walking to clear melee threats.
	 * Skips town, nested clears, pure walkers (no tele), and tele-ready pathing
	 * unless WhileWalking / WhileTeleporting. Meant for TeleDelay gaps — not Act1 walk-leveling.
	 */
	shouldDangerClear: function () {
		if (!Config.DangerClear || me.inTown || me.dead || this.clearing) {
			return false;
		}

		// No teleport skill: continuous walk-leveling — never stop-mid-run to peel
		if (!(Config.DangerClear.WhileWalking) && typeof Pather !== "undefined" && !Pather.canTeleport()) {
			return false;
		}

		if (typeof Pather !== "undefined" && Pather.useTeleport && Pather.canTeleportNow() &&
				!(Config.DangerClear.WhileTeleporting)) {
			return false;
		}

		return true;
	},

	/**
	 * Nearest attackable monster within melee-danger range of me, or false.
	 * Cheap-first: distance → hp/mode → checkMonster → skipCheck. Memoized ~100ms.
	 * Cache also tracks nearEmpty (nothing within Range*2) for walkTo poll backoff.
	 */
	inDanger: function (range, coll) {
		var mon, d, best, bestD, tick, nearEmpty, result;

		if (!Config.DangerClear || me.inTown || me.dead) {
			return false;
		}

		if (range === undefined) {
			range = this.dangerRange();
		}

		if (!range) {
			return false;
		}

		tick = getTickCount();

		if (this._dangerCache && (tick - this._dangerCache.tick) < this._dangerCacheMs &&
				this._dangerCache.range === range && this._dangerCache.coll === coll) {
			return this._dangerCache.result;
		}

		best = false;
		bestD = range + 1;
		nearEmpty = true;
		mon = getUnit(1);

		if (mon) {
			do {
				d = getDistance(me, mon);

				if (d > range * 2) {
					continue;
				}

				nearEmpty = false;

				if (d > range || d >= bestD) {
					continue;
				}

				// Dead / dying — cheap before checkMonster
				if (mon.hp !== undefined && mon.hp <= 0) {
					continue;
				}

				if (mon.mode === 0 || mon.mode === 12) {
					continue;
				}

				if (coll !== undefined && checkCollision(me, mon, coll)) {
					continue;
				}

				if (!this.checkMonster(mon) || !this.skipCheck(mon)) {
					continue;
				}

				bestD = d;
				best = mon;
			} while (mon.getNext());
		}

		result = best ? copyUnit(best) : false;
		this._dangerCache = {
			tick: tick,
			result: result,
			nearEmpty: nearEmpty,
			range: range,
			coll: coll
		};

		return result;
	},

	getCustomAttack: function (unit) {
		var i;

		// Check if unit got invalidated
		if (!unit || !unit.name || !copyUnit(unit).x) {
			return false;
		}

		for (i in Config.CustomAttack) {
			if (Config.CustomAttack.hasOwnProperty(i) && unit.name.toLowerCase() === i.toLowerCase()) {
				return Config.CustomAttack[i];
			}
		}

		return false;
	},

	// Get items with charges
	getCharges: function () {
		if (!Skill.charges) {
			Skill.charges = [];
		}

		var i, stats,
			item = me.getItem(-1, 1);

		if (item) {
			do {
				stats = item.getStat(-2);

				if (stats.hasOwnProperty(204)) {
					if (stats[204] instanceof Array) {
						for (i = 0; i < stats[204].length; i += 1) {
							if (stats[204][i] !== undefined) {
								Skill.charges.push({
									unit: copyUnit(item),
									gid: item.gid,
									skill: stats[204][i].skill,
									level: stats[204][i].level,
									charges: stats[204][i].charges,
									maxcharges: stats[204][i].maxcharges
								});
							}
						}
					} else {
						Skill.charges.push({
							unit: copyUnit(item),
							gid: item.gid,
							skill: stats[204].skill,
							level: stats[204].level,
							charges: stats[204].charges,
							maxcharges: stats[204].maxcharges
						});
					}
				}
			} while (item.getNext());
		}

		return true;
	},

	// Check if player or his merc are using Infinity, and adjust resistance checks based on that
	checkInfinity: function () {
		var i, merc, item;

		for (i = 0; i < 3; i += 1) {
			merc = me.getMerc();

			if (merc) {
				break;
			}

			delay(50);
		}

		// Check merc infinity
		if (merc) {
			item = merc.getItem();

			if (item) {
				do {
					if (item.getPrefix(20566)) {
						this.infinity = true;

						return true;
					}
				} while (item.getNext());
			}
		}

		// Check player infinity
		item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.getPrefix(20566)) {
					this.infinity = true;

					return true;
				}
			} while (item.getNext());
		}

		return false;
	},

	// Kill a monster based on its classId, can pass a unit as well
	kill: function (classId) {
		if (Config.AttackSkill[1] < 0) {
			return false;
		}

		var i, target, gid,
			retry = 0,
			errorInfo = "",
			attackCount = 0;

		if (typeof classId === "object") {
			target = classId;
		}

		for (i = 0; !target && i < 5; i += 1) {
			target = getUnit(1, classId);

			delay(200);
		}

		if (!target) {
			throw new Error("Attack.kill: Target not found");
		}

		gid = target.gid;

		if (Config.MFLeader) {
			Pather.makePortal();
			say("kill " + classId);
		}

		while (attackCount < 300 && this.checkMonster(target) && this.skipCheck(target)) {
			Misc.townCheck();

			if (!target || !copyUnit(target).x) { // Check if unit got invalidated, happens if necro raises a skeleton from the boss's corpse.
				target = getUnit(1, -1, -1, gid);

				if (!target) {
					break;
				}
			}

			if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
				this.deploy(target, Config.DodgeRange, 5, 9);
			}

			if (Config.MFSwitchPercent && target.hp / 128 * 100 < Config.MFSwitchPercent) {
				Precast.weaponSwitch(Math.abs(Config.MFSwitch));
			}

			if (attackCount > 0 && attackCount % 15 === 0 && Skill.getRange(Config.AttackSkill[1]) < 4) {
				Packet.flash(me.gid);
			}

			if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
				if (retry++ > 3) {
					errorInfo = " (doAttack failed)";

					break;
				}

				Packet.flash(me.gid);
			} else {
				retry = 0;
			}

			attackCount += 1;
		}

		if (attackCount === 300) {
			errorInfo = " (attackCount exceeded)";
		}

		if (Config.MFSwitchPercent) {
			Precast.weaponSwitch(Math.abs(Config.MFSwitch - 1));
		}

		ClassAttack.afterAttack();

		if (!target || !copyUnit(target).x) {
			return true;
		}

		if (target.hp > 0 && target.mode !== 0 && target.mode !== 12) {
			throw new Error("Failed to kill " + target.name + errorInfo);
		}

		return true;
	},

	hurt: function (classId, percent) {
		var i, target,
			retry = 0,
			attackCount = 0;

		for (i = 0; i < 5; i += 1) {
			target = getUnit(1, classId);

			if (target) {
				break;
			}

			delay(200);
		}

		while (attackCount < 300 && Attack.checkMonster(target) && Attack.skipCheck(target)) {
			if (!ClassAttack.doAttack(target, attackCount % 15 === 0)) {
				if (retry++ > 3) {
					break;
				}

				Packet.flash(me.gid);
			} else {
				retry = 0;
			}

			if (!copyUnit(target).x) {
				return true;
			}

			attackCount += 1;

			if (target.hp * 100 / 128 <= percent) {
				break;
			}
		}

		return true;
	},

	getScarinessLevel: function (unit) {
		var scariness = 0, ids = [58, 59, 60, 61, 62, 101, 102, 103, 104, 105, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676];

		// Only handling monsters for now
		if (unit.type !== 1) {
			return undefined;
		}

		// Minion
		if (unit.spectype & 0x08) {
			scariness += 1;
		}

		// Champion
		if (unit.spectype & 0x02) {
			scariness += 2;
		}

		// Boss
		if (unit.spectype & 0x04) {
			scariness += 4;
		}

		// Summoner or the like
		if (ids.indexOf(unit.classid) > -1) {
			scariness += 8;
		}

		return scariness;
	},

	// Clear monsters in a section based on range and spectype or clear monsters around a boss monster
	clear: function (range, spectype, bossId, sortfunc, pickit) { // probably going to change to passing an object
		while (!me.gameReady) {
			delay(40);
		}

		if (Config.MFLeader && !!bossId) {
			Pather.makePortal();
			say("clear " + bossId);
		}

		if (range === undefined) {
			range = 25;
		}

		if (spectype === undefined) {
			spectype = 0;
		}

		if (bossId === undefined) {
			bossId = false;
		}

		if (sortfunc === undefined) {
			sortfunc = false;
		}

		if (pickit === undefined) {
			pickit = true;
		}

		if (typeof (range) !== "number") {
			throw new Error("Attack.clear: range must be a number.");
		}

		// Nested clear (moveTo → clear → moveTo → clear) blows the JS stack ("too much recursion")
		if (this.clearing) {
			return false;
		}

		var i, boss, orgx, orgy, target, result, monsterList, start, coord,
			retry = 0,
			gidAttack = [],
			attackCount = 0,
			peelR = this.clearPeelRange(),
			clearStart = getTickCount(),
			distMe, sweeps, dm;

		if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
			return false;
		}

		if (!sortfunc) {
			sortfunc = this.sortMonsters;
		}

		if (bossId) {
			for (i = 0; !boss && i < 5; i += 1) {
				boss = bossId > 999 ? getUnit(1, -1, -1, bossId) : getUnit(1, bossId);

				delay(200);
			}

			if (!boss) {
				throw new Error("Attack.clear: " + bossId + " not found");
			}

			orgx = boss.x;
			orgy = boss.y;
		} else {
			orgx = me.x;
			orgy = me.y;
		}

		this.clearing = true;
		this._dangerCache = null;

		try {
			monsterList = [];
			target = getUnit(1);

			if (target) {
				do {
					if (!this.checkMonster(target) || !this.skipCheck(target)) {
						continue;
					}

					distMe = getDistance(me, target);

					// Spectype filter (0 = all). Always include melee-peel threats even when
					// seeking champs only (0x7) — otherwise trash on us is invisible to clear.
					if (spectype && !(target.spectype & spectype)) {
						if (!(peelR > 0 && distMe <= peelR)) {
							continue;
						}
					}

					// Speed optimization - don't go through monster list until there's at least one within clear range
					if (!start && getDistance(target, orgx, orgy) <= range &&
							(Pather.teleSkill() > 0 || !Scripts.Follower || !checkCollision(me, target, 0x1))) {
						start = true;
					}

					// Also start if a melee peel mob is already on us
					if (!start && peelR && distMe <= peelR) {
						start = true;
					}

					monsterList.push(copyUnit(target));
				} while (target.getNext());
			}

			while (start && monsterList.length > 0 && attackCount < 300) {
				if (getTickCount() - clearStart > ((range <= 20 && !bossId) ? 25000 : 90000)) {
					print("ÿc1Attackÿc0 :: clear abort — timeout");
					break;
				}
				if (boss) {
					orgx = boss.x;
					orgy = boss.y;
				}

				if (me.dead) {
					return false;
				}

				if (peelR > 0) {
					// Peel-first: re-sort every swing so shamans never outrank trash on us
					for (i = 0; i < monsterList.length; i += 1) {
						if (monsterList[i].x !== undefined) {
							monsterList[i].distMe = getDistance(me, monsterList[i]);
						}
					}

					monsterList.sort(function (a, b) {
						var aThreat = a.distMe <= peelR,
							bThreat = b.distMe <= peelR;

						if (aThreat !== bThreat) {
							return aThreat ? -1 : 1;
						}

						return sortfunc(a, b);
					});
				} else if (attackCount === 0 || attackCount % 5 === 0) {
					// No peel radius: cheap re-sort only every few casts
					monsterList.sort(sortfunc);
				}

				target = copyUnit(monsterList[0]);
				distMe = target.x !== undefined ? getDistance(me, target) : 999;

				if (target.x !== undefined &&
						(getDistance(target, orgx, orgy) <= range ||
							(this.getScarinessLevel(target) > 7 && distMe <= range) ||
							(peelR > 0 && distMe <= peelR)) &&
						this.checkMonster(target)) {
					if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
						this.deploy(target, Config.DodgeRange, 5, 9);
					}

					// townCheck every 10 swings — every cast added large gaps between Fire Bolts
					if (attackCount % 10 === 0) {
						Misc.townCheck(true);
					}

					result = ClassAttack.doAttack(target, attackCount % 15 === 0);

					if (result) {
						retry = 0;

						for (i = 0; i < gidAttack.length; i += 1) {
							if (gidAttack[i].gid === target.gid) {
								break;
							}
						}

						if (i === gidAttack.length) {
							gidAttack.push({gid: target.gid, attacks: 0, name: target.name});
						}

						gidAttack[i].attacks += 1;
						attackCount += 1;

						// Desync/bad position handler
						switch (Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) {
						case 112:
							//print(gidAttack[i].name + " " + gidAttack[i].attacks);

							// Tele in random direction with Blessed Hammer
							if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 4 : 2) === 0) {
								//print("random move m8");
								coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 5);
								Pather.moveTo(coord.x, coord.y);
							}

							break;
						default:
							// Flash with melee skills
							if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 15 : 5) === 0 && Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) < 4) {
								Packet.flash(me.gid);
							}

							break;
						}

						// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
						if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
							print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
							monsterList.shift();
						}

						if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
							Pickit.fastPick();
						}
					} else {
						if (retry++ > 3) {
							monsterList.shift();
							retry = 0;
						}

						Packet.flash(me.gid);
					}
				} else {
					// Shaman / high-scariness: try walk-in a few times, then drop (never rotate forever)
					if (this.getScarinessLevel(target) > 7 && this.checkMonster(target) &&
							getDistance(me, target) <= range + 25 && retry < 5) {
						// Never dive for a shaman while trash is already on us
						if (peelR > 0 && this.findNearestMonster(peelR)) {
							monsterList.push(monsterList.shift());
							retry += 1;
						} else {
							Pather.moveToUnit(target);
							retry += 1;
							monsterList.push(monsterList.shift());
						}
					} else {
						monsterList.shift();
						retry = 0;
					}
				}
			}

			ClassAttack.afterAttack(pickit);
			this.openChests(range, orgx, orgy);
		} finally {
			this.clearing = false;
		}

		// Adjacent mob arrived mid-fight — peel it before pickit (only if we actually fought)
		if (attackCount > 0 && peelR > 0) {
			this._dangerCache = null;
			sweeps = 0;
			this.clearing = true;

			try {
				while (sweeps < 40 && (dm = this.inDanger(peelR))) {
					this._dangerCache = null;

					if (!ClassAttack.doAttack(dm, sweeps % 15 === 0)) {
						break;
					}

					sweeps += 1;

					if (dm.mode === 0 || dm.mode === 12 || Config.FastPick === 2) {
						Pickit.fastPick();
					}
				}
			} finally {
				this.clearing = false;
			}
		}

		if (attackCount > 0 && pickit) {
			Pickit.pickItems();
		}

		return true;
	},

	// Filter monsters based on classId, spectype and range
	getMob: function (classid, spectype, range, center) {
		var monsterList = [],
			monster = getUnit(1);

		if (range === undefined) {
			range = 25;
		}

		if (!center) {
			center = me;
		}

		switch (typeof classid) {
		case "number":
		case "string":
			monster = getUnit(1, classid);

			if (monster) {
				do {
					if (getDistance(center.x, center.y, monster.x, monster.y) <= range && (!spectype || (monster.spectype & spectype)) && this.checkMonster(monster)) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			break;
		case "object":
			monster = getUnit(1);

			if (monster) {
				do {
					if (classid.indexOf(monster.classid) > -1 && getDistance(center.x, center.y, monster.x, monster.y) <= range && (!spectype || (monster.spectype & spectype)) && this.checkMonster(monster)) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			break;
		}

		if (!monsterList.length) {
			return false;
		}

		return monsterList;
	},

	// Clear an already formed array of monstas
	clearList: function (mainArg, sortFunc, refresh) {
		var i, target, result, monsterList, coord,
			retry = 0,
			gidAttack = [],
			attackCount = 0,
			peelR = this.clearPeelRange();

		switch (typeof mainArg) {
		case "function":
			monsterList = mainArg.call();

			break;
		case "object":
			monsterList = mainArg.slice(0);

			break;
		case "boolean": // false from Attack.getMob()
			return false;
		default:
			throw new Error("clearList: Invalid argument");
		}

		if (!sortFunc) {
			sortFunc = this.sortMonsters;
		}

		if (this.clearing) {
			return false;
		}

		this.clearing = true;
		this._dangerCache = null;

		try {
			while (monsterList.length > 0 && attackCount < 300) {
				if (refresh && attackCount > 0 && attackCount % refresh === 0) {
					monsterList = mainArg.call();
				}

				if (me.dead) {
					return false;
				}

				if (peelR > 0) {
					for (i = 0; i < monsterList.length; i += 1) {
						if (monsterList[i].x !== undefined) {
							monsterList[i].distMe = getDistance(me, monsterList[i]);
						}
					}

					monsterList.sort(sortFunc);
				} else if (attackCount === 0 || attackCount % 5 === 0) {
					monsterList.sort(sortFunc);
				}

				target = copyUnit(monsterList[0]);

				if (target.x !== undefined && this.checkMonster(target)) {
					if (Config.Dodge && me.hp * 100 / me.hpmax <= Config.DodgeHP) {
						this.deploy(target, Config.DodgeRange, 5, 9);
					}

					if (attackCount % 10 === 0) {
						Misc.townCheck(true);
					}

					result = ClassAttack.doAttack(target, attackCount % 15 === 0);

					if (result) {
						retry = 0;

						for (i = 0; i < gidAttack.length; i += 1) {
							if (gidAttack[i].gid === target.gid) {
								break;
							}
						}

						if (i === gidAttack.length) {
							gidAttack.push({gid: target.gid, attacks: 0});
						}

						gidAttack[i].attacks += 1;

						// Desync/bad position handler
						switch (Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) {
						case 112:
							// Tele in random direction with Blessed Hammer
							if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 5 : 15) === 0) {
								coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
								Pather.moveTo(coord.x, coord.y);
							}

							break;
						default:
							// Flash with melee skills
							if (gidAttack[i].attacks > 0 && gidAttack[i].attacks % ((target.spectype & 0x7) ? 5 : 15) === 0 && Skill.getRange(Config.AttackSkill[(target.spectype & 0x7) ? 1 : 3]) < 4) {
								Packet.flash(me.gid);
							}

							break;
						}

						// Skip non-unique monsters after 15 attacks, except in Throne of Destruction
						if (me.area !== 131 && !(target.spectype & 0x7) && gidAttack[i].attacks > 15) {
							print("ÿc1Skipping " + target.name + " " + target.gid + " " + gidAttack[i].attacks);
							monsterList.shift();
						}

						attackCount += 1;

						if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
							Pickit.fastPick();
						}
					} else {
						if (retry++ > 3) {
							monsterList.shift();
							retry = 0;
						}

						Packet.flash(me.gid);
					}
				} else {
					// Shaman / high-scariness: try walk-in a few times, then drop (never rotate forever)
					if (target.x !== undefined && this.getScarinessLevel(target) > 7 && this.checkMonster(target) &&
							getDistance(me, target) <= 55 && retry < 5) {
						// Never dive for a shaman while trash is already on us
						if (peelR > 0 && this.findNearestMonster(peelR)) {
							monsterList.push(monsterList.shift());
							retry += 1;
						} else {
							Pather.moveToUnit(target);
							retry += 1;
							monsterList.push(monsterList.shift());
						}
					} else {
						monsterList.shift();
						retry = 0;
					}
				}
			}

			ClassAttack.afterAttack(true);
			this.openChests(30);

			if (attackCount > 0) {
				Pickit.pickItems();
			}
		} finally {
			this.clearing = false;
		}

		return true;
	},

	/**
	 * Pick a walkable spot away from a threat cluster (centroid of threatList).
	 * Ring-searches angles/distances like diabloStandOff — no hardcoded room coords.
	 * Scores by max distance to nearest threat, with a small penalty for distance from me.
	 * @returns {{x:number,y:number}|null}
	 */
	retreatSpotAwayFrom: function (threatList, minD, maxD) {
		var i, j, n, cx, cy, tx, ty, d, nearThreat, score, best, bestScore,
			angles, distances, ox;

		if (!threatList || !threatList.length) {
			return null;
		}

		minD = (minD === undefined) ? 12 : minD;
		maxD = (maxD === undefined) ? 18 : maxD;

		if (maxD < minD) {
			maxD = minD;
		}

		cx = 0;
		cy = 0;
		n = 0;

		for (i = 0; i < threatList.length; i += 1) {
			if (threatList[i] && threatList[i].x !== undefined && threatList[i].y !== undefined) {
				cx += threatList[i].x;
				cy += threatList[i].y;
				n += 1;
			}
		}

		if (!n) {
			return null;
		}

		cx = Math.round(cx / n);
		cy = Math.round(cy / n);

		angles = [0, 30, -30, 45, -45, 60, -60, 90, -90, 120, -120, 135, -135, 150, -150, 180];
		distances = [maxD, Math.round((minD + maxD) / 2), minD];
		best = null;
		bestScore = -9999;

		for (j = 0; j < distances.length; j += 1) {
			d = distances[j];

			for (i = 0; i < angles.length; i += 1) {
				tx = Math.round(cx + Math.cos(angles[i] * Math.PI / 180) * d);
				ty = Math.round(cy + Math.sin(angles[i] * Math.PI / 180) * d);

				if (!this.validSpot(tx, ty)) {
					continue;
				}

				nearThreat = 999;

				for (n = 0; n < threatList.length; n += 1) {
					if (threatList[n] && threatList[n].x !== undefined) {
						ox = getDistance(tx, ty, threatList[n].x, threatList[n].y);

						if (ox < nearThreat) {
							nearThreat = ox;
						}
					}
				}

				if (nearThreat < minD - 1) {
					continue;
				}

				// Prefer farther from threats; mild preference for spots closer to us
				score = nearThreat - (getDistance(me.x, me.y, tx, ty) * 0.15);

				if (score > bestScore) {
					bestScore = score;
					best = {x: tx, y: ty};
				}
			}
		}

		return best;
	},

	/**
	 * Engage for engageMs, then teleport/walk to a retreat spot away from remaining threats.
	 * Casters only (caller should gate) — no hardcoded skill IDs; damage via ClassAttack.doAttack.
	 *
	 * @param {function} getListFn - returns monster unit array (fresh each call)
	 * @param {object} [opts]
	 * @param {number} [opts.engageMs=3000] - ms to attack before each retreat
	 * @param {number} [opts.minRetreat=12]
	 * @param {number} [opts.maxRetreat=18]
	 * @param {number} [opts.maxCycles=60]
	 */
	hitAndRunClear: function (getListFn, opts) {
		var engageMs, minRetreat, maxRetreat, maxCycles,
			cycle, list, target, i, spot, result, attackCount, engageStart;

		// Defaults first — never read missing opts.* (SpiderMonkey Strict Warning on undefined props)
		opts = opts || {};
		engageMs = 3000;
		minRetreat = 12;
		maxRetreat = 18;
		maxCycles = 60;

		if (opts.hasOwnProperty("engageMs") && opts.engageMs > 0) {
			engageMs = opts.engageMs;
		}

		if (opts.hasOwnProperty("minRetreat") && opts.minRetreat !== undefined) {
			minRetreat = opts.minRetreat;
		}

		if (opts.hasOwnProperty("maxRetreat") && opts.maxRetreat !== undefined) {
			maxRetreat = opts.maxRetreat;
		}

		if (opts.hasOwnProperty("maxCycles") && opts.maxCycles > 0) {
			maxCycles = opts.maxCycles;
		}

		// Stand farther when primary has long range (Lightning 15 vs CB ~6)
		skRange = Skill.getRange(Config.AttackSkill[1]) || 0;

		if (skRange > minRetreat) {
			minRetreat = skRange;
		}

		if (skRange + 8 > maxRetreat) {
			maxRetreat = skRange + 8;
		}

		attackCount = 0;

		if (typeof getListFn !== "function") {
			throw new Error("hitAndRunClear: getListFn must be a function");
		}

		if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
			return false;
		}

		this.clearing = true;
		this._dangerCache = null;
		print("ÿc2Attackÿc0 :: hitAndRunClear (engage=" + engageMs + "ms retreat=" + minRetreat + "-" + maxRetreat +
			") AttackSkill[1]=" + Config.AttackSkill[1] + " [2]=" + Config.AttackSkill[2]);

		try {
			for (cycle = 0; cycle < maxCycles; cycle += 1) {
				if (me.dead) {
					return false;
				}

				list = getListFn();

				if (!list || !list.length) {
					break;
				}

				engageStart = getTickCount();

				// Engage for engageMs — doAttack handles getIntoPosition / teleport into range
				while (getTickCount() - engageStart < engageMs) {
					if (me.dead) {
						return false;
					}

					list = getListFn();

					if (!list || !list.length) {
						break;
					}

					for (i = 0; i < list.length; i += 1) {
						if (list[i].x !== undefined) {
							list[i].distMe = getDistance(me, list[i]);
						}
					}

					list.sort(this.sortMonsters);
					target = copyUnit(list[0]);

					if (!target || target.x === undefined || !this.checkMonster(target)) {
						break;
					}

					Misc.townCheck(true);
					result = ClassAttack.doAttack(target, attackCount % 15 === 0);

					if (!result) {
						// Timed skill on delay with no long-range filler — wait, don't abort the engage
						if (me.getState(121)) {
							delay(50 + me.ping);
							continue;
						}

						Packet.flash(me.gid);
						break;
					}

					attackCount += 1;

					// Debug every 4th cast so we can see Lightning is really firing
					if (attackCount === 1 || attackCount % 4 === 0) {
						print("ÿc2Attackÿc0 :: Trav cast #" + attackCount + " skill[1]=" + Config.AttackSkill[1] +
							" dist=" + Math.round(getDistance(me, target)));
						me.overhead("cast #" + attackCount + " sk=" + Config.AttackSkill[1]);
					}

					if (target.mode === 0 || target.mode === 12 || Config.FastPick === 2) {
						Pickit.fastPick();
					}
				}

				// Room cleared mid-cycle
				list = getListFn();

				if (!list || !list.length) {
					break;
				}

				// Retreat away from remaining cluster — forceTeleport so TeleDelay / walk pathing can't skip the dodge
				spot = this.retreatSpotAwayFrom(list, minRetreat, maxRetreat);

				if (!spot) {
					spot = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, Math.max(8, minRetreat));
				}

				if (spot && spot.x !== undefined) {
					if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
						if (!Pather.forceTeleportTo(spot.x, spot.y, 5)) {
							Pather.moveTo(spot.x, spot.y);
						}
					} else {
						Pather.moveTo(spot.x, spot.y);
					}
				}

				delay(50 + me.ping);
			}

			ClassAttack.afterAttack(true);
			this.openChests(30);

			if (attackCount > 0) {
				Pickit.pickItems();
			}
		} finally {
			this.clearing = false;
		}

		return true;
	},

	/**
	 * Travel to (x,y) along the real getPath route, clearing monsters after each hop.
	 * Unlike Pather.clearPath / Attack.clear, never targets excludeClassId (e.g. Mephisto 242).
	 * opts.nodeDist — tele/walk node spacing (default 30 tele / 5 walk)
	 * opts.refresh — clearList refresh interval (default 20)
	 */
	travelClearing: function (x, y, excludeClassId, opts) {
		var path, i, node, useTele, nodeDist, refresh, buildListFn, hop;

		opts = opts || {};
		refresh = 20;

		if (opts.hasOwnProperty("refresh") && opts.refresh > 0) {
			refresh = opts.refresh;
		}

		useTele = Pather.canTeleport();
		nodeDist = 5;

		if (opts.hasOwnProperty("nodeDist") && opts.nodeDist > 0) {
			nodeDist = opts.nodeDist;
		} else if (useTele) {
			nodeDist = 30;
		}

		buildListFn = function () {
			var monsterList = [],
				monster = getUnit(1);

			if (monster) {
				do {
					if (excludeClassId !== undefined && excludeClassId !== null &&
							monster.classid === excludeClassId) {
						continue;
					}

					if (Attack.checkMonster(monster)) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			return monsterList;
		};

		if (getDistance(me, x, y) < 5) {
			this.clearList(buildListFn, null, refresh);

			return true;
		}

		path = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, nodeDist);

		if (!path || !path.length) {
			print("ÿc8Attack.travelClearingÿc0 :: no path to " + x + "," + y + " — falling back to moveTo");

			if (useTele && typeof Pather.forceTeleportTo === "function") {
				if (!Pather.forceTeleportTo(x, y, 5)) {
					Pather.moveTo(x, y, 3, false);
				}
			} else {
				Pather.moveTo(x, y, 3, false);
			}

			this.clearList(buildListFn, null, refresh);

			return getDistance(me, x, y) < 8;
		}

		path.reverse();
		print("ÿc2Attackÿc0 :: travelClearing → " + x + "," + y + " nodes=" + path.length +
			" exclude=" + (excludeClassId !== undefined ? excludeClassId : "none") +
			" tele=" + useTele);

		for (i = 0; i < path.length; i += 1) {
			if (me.dead) {
				return false;
			}

			node = path[i];

			if (!node || node.x === undefined) {
				continue;
			}

			if (getDistance(me, node.x, node.y) < 3) {
				continue;
			}

			hop = false;

			if (useTele && typeof Pather.forceTeleportTo === "function") {
				hop = Pather.forceTeleportTo(node.x, node.y, 5);
			}

			if (!hop) {
				Pather.moveTo(node.x, node.y, 3, false);
			}

			delay(50 + me.ping);
			this.clearList(buildListFn, null, refresh);
			Misc.townCheck(true);
		}

		// Ensure we land on the destination and mop up once more
		if (getDistance(me, x, y) > 5) {
			if (useTele && typeof Pather.forceTeleportTo === "function") {
				if (!Pather.forceTeleportTo(x, y, 5)) {
					Pather.moveTo(x, y, 3, false);
				}
			} else {
				Pather.moveTo(x, y, 3, false);
			}
		}

		this.clearList(buildListFn, null, refresh);

		return getDistance(me, x, y) < 8;
	},

	/** True if configured primary attack is ranged (casters / bow) — not melee hug. */
	isRangedAttacker: function () {
		var sk;

		sk = Config.AttackSkill[1];

		if (sk < 0) {
			sk = Config.AttackSkill[3];
		}

		if (sk < 0) {
			return false;
		}

		return Skill.getRange(sk) > 4;
	},

	/** Light sorceress only (Config.AutoGearBuild === "light"). */
	isLightSorc: function () {
		var build;

		if (me.classid !== 1) {
			return false;
		}

		build = (Config.AutoGearBuild && String(Config.AutoGearBuild).toLowerCase()) || "";

		return build === "light";
	},

	/**
	 * Light sorc only: force Lightning (49) as sole attack if learned.
	 * No CB/Nova filler — wait out skill delay at range instead of walking in.
	 * tag - short label for debug prints/overhead (e.g. "Trav", "Meph"). Defaults to "Trav".
	 * Returns snapshot to restore, or null if not light sorc / Lightning unavailable.
	 */
	preferLightningOnly: function (tag) {
		var snap, hard, soft, fromSlot5, can;

		tag = tag || "Trav";

		if (!this.isLightSorc()) {
			print("ÿc2Attackÿc0 :: " + tag + " Lightning skip — not light sorc (build=" + Config.AutoGearBuild + ")");

			return null;
		}

		hard = me.getSkill(49, 0) || 0;
		soft = me.getSkill(49, 1) || 0;
		fromSlot5 = (Config.AttackSkill[5] === 49);
		can = this.canUseSkill(49);

		print("ÿc2Attackÿc0 :: " + tag + " Lightning debug — canUse=" + can +
			" hard=" + hard + " soft=" + soft +
			" AutoGearBuild=" + Config.AutoGearBuild +
			" AttackSkill=[1]=" + Config.AttackSkill[1] +
			" [2]=" + Config.AttackSkill[2] +
			" [3]=" + Config.AttackSkill[3] +
			" [5]=" + Config.AttackSkill[5]);

		if (!can) {
			print("ÿc1Attackÿc0 :: " + tag + " Lightning SKIP — skill 49 not usable (still on Charged Bolt)");
			me.overhead(tag + ": no Lightning");

			return null;
		}

		snap = {
			a1: Config.AttackSkill[1],
			a2: Config.AttackSkill[2],
			a3: Config.AttackSkill[3],
			a4: Config.AttackSkill[4]
		};

		Config.AttackSkill[1] = 49; // Lightning only
		Config.AttackSkill[2] = -1; // no short-range filler while on skill delay
		Config.AttackSkill[3] = 49;
		Config.AttackSkill[4] = -1;

		print("ÿc2Attackÿc0 :: " + tag + " Lightning ON — primary=49 range=" + Skill.getRange(49) +
			" (was " + snap.a1 + "/" + snap.a2 + ") slot5WasLightning=" + fromSlot5);
		me.overhead(tag + ": Lightning only");

		return snap;
	},

	/**
	 * Light sorc only: force Charged Bolt (38) for close-range boss telestomp (Mephisto).
	 * Returns snapshot to restore, or null if not light sorc / CB unavailable.
	 */
	preferChargedBolt: function (tag) {
		var snap, can;

		tag = tag || "Meph";

		if (!this.isLightSorc()) {
			return null;
		}

		can = this.canUseSkill(38);

		if (!can) {
			print("ÿc1Attackÿc0 :: " + tag + " Charged Bolt SKIP — skill 38 not usable");
			me.overhead(tag + ": no Charged Bolt");

			return null;
		}

		snap = {
			a1: Config.AttackSkill[1],
			a2: Config.AttackSkill[2],
			a3: Config.AttackSkill[3],
			a4: Config.AttackSkill[4]
		};

		Config.AttackSkill[1] = 38;
		Config.AttackSkill[2] = 38;
		Config.AttackSkill[3] = 38;
		Config.AttackSkill[4] = 38;

		print("ÿc2Attackÿc0 :: " + tag + " Charged Bolt ON — primary=38 (was " + snap.a1 + "/" + snap.a2 + ")");
		me.overhead(tag + ": Charged Bolt");

		return snap;
	},

	/** Travincal + light sorc only: force Lightning (49) as sole attack if learned. */
	preferTravLightning: function () {
		return this.preferLightningOnly("Trav");
	},

	/** @deprecated use preferLightningOnly */
	preferLongerAttackSkill: function () {
		return this.preferLightningOnly("Trav");
	},

	restoreAttackSkill: function (snap) {
		if (!snap) {
			return;
		}

		Config.AttackSkill[1] = snap.a1;
		Config.AttackSkill[2] = snap.a2;
		Config.AttackSkill[3] = snap.a3;
		Config.AttackSkill[4] = snap.a4;
		print("ÿc2Attackÿc0 :: skills restored — [1]=" + snap.a1 + " [2]=" + snap.a2 +
			" [3]=" + snap.a3 + " [4]=" + snap.a4);
	},

	securePosition: function (x, y, range, timer, skipBlocked, special) {
		/*if (arguments.length < 4) {
			throw new Error("securePosition needs 4 arguments");
		}*/

		var monster, monList, tick;

		if (skipBlocked === true) {
			skipBlocked = 0x4;
		}

		while (true) {
			if (getDistance(me, x, y) > 5) {
				Pather.moveTo(x, y);
			}

			monster = getUnit(1);
			monList = [];

			if (monster) {
				do {
					if (getDistance(monster, x, y) <= range && this.checkMonster(monster) && this.canAttack(monster) &&
							(!skipBlocked || !checkCollision(me, monster, skipBlocked)) &&
							((Pather.teleSkill() > 0) || !checkCollision(me, monster, 0x1))) {
						monList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			if (!monList.length) {
				if (!tick) {
					tick = getTickCount();
				}

				// only return if it's been safe long enough
				if (getTickCount() - tick >= timer) {
					return true;
				}
			} else {
				this.clearList(monList);

				// reset the timer when there's monsters in range
				if (tick) {
					tick = false;
				}
			}

			if (special) {
				switch (me.classid) {
				case 3: // Paladin Redemption addon
					if (me.getSkill(124, 1)) {
						Skill.setSkill(124, 0);
						delay(1000);
					}

					break;
				}
			}

			delay(100);
		}

		return true;
	},

	// Draw lines around a room on minimap
	markRoom: function (room, color) {
		var arr = [];

		arr.push(new Line(room.x * 5, room.y * 5, room.x * 5, room.y * 5 + room.ysize, color, true));
		arr.push(new Line(room.x * 5, room.y * 5, room.x * 5 + room.xsize, room.y * 5, color, true));
		arr.push(new Line(room.x * 5 + room.xsize, room.y * 5, room.x * 5 + room.xsize, room.y * 5 + room.ysize, color, true));
		arr.push(new Line(room.x * 5, room.y * 5 + room.ysize, room.x * 5 + room.xsize, room.y * 5 + room.ysize, color, true));
	},

	countUniques: function () {
		if (!this.uniques) {
			this.uniques = 0;
		}

		if (!this.ignoredGids) {
			this.ignoredGids = [];
		}

		var monster = getUnit(1);

		if (monster) {
			do {
				if ((monster.spectype & 0x5) && this.ignoredGids.indexOf(monster.gid) === -1) {
					this.uniques += 1;
					this.ignoredGids.push(monster.gid);
				}
			} while (monster.getNext());
		}
	},

	storeStatistics: function (area) {
		var obj;

		if (!FileTools.exists("statistics.json")) {
			Misc.fileAction("statistics.json", 1, "{}");
		}

		obj = JSON.parse(Misc.fileAction("statistics.json", 0));

		if (obj) {
			if (obj[area] === undefined) {
				obj[area] = {
					runs: 0,
					averageUniques: 0
				};
			}

			obj[area].averageUniques = ((obj[area].averageUniques * obj[area].runs + this.uniques) / (obj[area].runs + 1)).toFixed(4);
			obj[area].runs += 1;

			Misc.fileAction("statistics.json", 1, JSON.stringify(obj));
		}

		this.uniques = 0;
		this.ignoredGids = [];
	},

	// Clear an entire area based on monster spectype.
	// Always walk every room — getUnit only sees loaded monsters, so "empty room" checks
	// falsely skip distant tiles and strand full-clear quests (Den of Evil).
	clearLevel: function (spectype) {
		if (Config.MFLeader) {
			Pather.makePortal();
			say("clearlevel " + getArea().name);
		}

		var room, result, rooms, myRoom, currentArea, previousArea,
			levelStart = getTickCount(),
			moveFails = 0;

		function RoomSort(a, b) {
			return getDistance(myRoom[0], myRoom[1], a[0], a[1]) - getDistance(myRoom[0], myRoom[1], b[0], b[1]);
		}

		room = getRoom();

		if (!room) {
			return false;
		}

		if (spectype === undefined) {
			spectype = 0;
		}

		rooms = [];

		currentArea = getArea().id;

		do {
			rooms.push([room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2]);
		} while (room.getNext());

		while (rooms.length > 0) {
			if (getTickCount() - levelStart > 120000) {
				print("ÿc1Attackÿc0 :: clearLevel abort — timeout (area " + me.area + ")");
				break;
			}

			// get the first room + initialize myRoom var
			if (!myRoom) {
				room = getRoom(me.x, me.y);
			}

			if (room) {
				if (room instanceof Array) { // use previous room to calculate distance
					myRoom = [room[0], room[1]];
				} else { // create a new room to calculate distance (first room, done only once)
					myRoom = [room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2];
				}
			}

			rooms.sort(RoomSort);
			room = rooms.shift();

			result = Pather.getNearestWalkable(room[0], room[1], 18, 3);

			if (result) {
				if (!Pather.moveTo(result[0], result[1], 3, spectype)) {
					moveFails += 1;

					if (moveFails >= 3) {
						print("ÿc1Attackÿc0 :: clearLevel abort — path stuck (area " + me.area + ")");
						break;
					}

					continue;
				}

				moveFails = 0;
				previousArea = result;
				//this.countUniques();

				if (!this.clear(40, spectype)) {
					break;
				}
			}
			// Make sure bot does not get stuck in different area.
			else if (currentArea !== getArea().id) {
				Pather.moveTo(previousArea[0], previousArea[1], 3, spectype);
			}
		}

		//this.storeStatistics(Pather.getAreaName(me.area));

		return true;
	},

	// Sort monsters based on distance, spectype and classId (summoners are attacked first)
	sortMonsters: function (unitA, unitB) {
		var distA = unitA.distMe !== undefined ? unitA.distMe : getDistance(me, unitA),
			distB = unitB.distMe !== undefined ? unitB.distMe : getDistance(me, unitB),
			peelR = Attack.clearPeelRange(),
			aAdj, bAdj;

		// Melee peel: whatever is already on us before chasing shamans/bosses
		// (clearPeelRange works even when DangerClear.WhileWalking is off)
		if (peelR > 0) {
			aAdj = distA <= peelR;
			bAdj = distB <= peelR;

			if (aAdj && !bAdj) {
				return -1;
			}

			if (bAdj && !aAdj) {
				return 1;
			}

			if (aAdj && bAdj) {
				return distA - distB;
			}
		}

		// No special sorting for were-form
		if (Config.Wereform) {
			return distA - distB;
		}

		// Barb optimization
		if (me.classid === 4) {
			if (!Attack.checkResist(unitA, Attack.getSkillElement(Config.AttackSkill[(unitA.spectype & 0x7) ? 1 : 3]))) {
				return 1;
			}

			if (!Attack.checkResist(unitB, Attack.getSkillElement(Config.AttackSkill[(unitB.spectype & 0x7) ? 1 : 3]))) {
				return -1;
			}
		}

		var ids = Attack.shamanIds,
			aShaman, bShaman, aNear, bNear, focusRange;

		// Shamans: only prioritize ones near us. Far shamans sorted first used to get
		// shift()-dropped when out of clear range (packs keep reviving).
		focusRange = 40;
		aShaman = ids.indexOf(unitA.classid) > -1;
		bShaman = ids.indexOf(unitB.classid) > -1;
		aNear = distA <= focusRange;
		bNear = distB <= focusRange;

		if (aShaman && aNear && !(bShaman && bNear)) {
			return -1;
		}

		if (bShaman && bNear && !(aShaman && aNear)) {
			return 1;
		}

		if (aShaman && aNear && bShaman && bNear) {
			// Unique shamans (Bishibosh etc.) before normals
			if ((unitA.spectype & 0x04) && !(unitB.spectype & 0x04)) {
				return -1;
			}

			if ((unitB.spectype & 0x04) && !(unitA.spectype & 0x04)) {
				return 1;
			}

			return distA - distB;
		}

		// Neither is a nearby shaman — normal boss / distance sort
		if (Config.BossPriority) {
			if ((unitA.spectype & 0x5) && (unitB.spectype & 0x5)) {
				return distA - distB;
			}

			if (unitA.spectype & 0x5) {
				return -1;
			}

			if (unitB.spectype & 0x5) {
				return 1;
			}
		}

		return distA - distB;
	},

	// Check if a set of coords is valid/accessable
	validSpot: function (x, y) {
		var result;

		if (!me.area || !x || !y) { // Just in case
			return false;
		}

		try { // Treat thrown errors as invalid spot
			result = getCollision(me.area, x, y);
		} catch (e) {
			return false;
		}

		// Avoid non-walkable spots, objects
		if (result === undefined || (result & 0x1) || (result & 0x400)) {
			return false;
		}

		return true;
	},

	// Open chests when clearing
	openChests: function (range, x, y) {
		if (!Config.OpenChests) {
			return false;
		}

		if (typeof Pickit !== "undefined" && Pickit.unsafeToPick && Pickit.unsafeToPick()) {
			return false;
		}

		if (x === undefined || y === undefined) {
			x = me.x;
			y = me.y;
		}

		var i, unit,
			list = [],
			ids = ["chest", "chest3", "weaponrack", "armorstand"];

		unit = getUnit(2);

		if (unit) {
			do {
				if (unit.name && getDistance(unit, x, y) <= range && ids.indexOf(unit.name.toLowerCase()) > -1) {
					list.push(copyUnit(unit));
				}
			} while (unit.getNext());
		}

		while (list.length) {
			if (typeof Pickit !== "undefined" && Pickit.unsafeToPick && Pickit.unsafeToPick()) {
				return false;
			}

			list.sort(Sort.units);

			if (Misc.openChest(list.shift())) {
				Pickit.pickItems();
			}
		}

		return true;
	},

	buildMonsterList: function () {
		var monster,
			monList = [];

		monster = getUnit(1);

		if (monster) {
			do {
				if (this.checkMonster(monster)) {
					monList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		return monList;
	},

	// Densest visible cluster (loaded units only). Returns {unit, count} or false.
	findDensePack: function (minSize, clusterRange) {
		var list, i, j, count, bestUnit, bestCount;

		if (minSize === undefined) {
			minSize = 3;
		}

		if (clusterRange === undefined) {
			clusterRange = 18;
		}

		list = this.buildMonsterList();

		if (!list.length) {
			return false;
		}

		bestCount = 0;
		bestUnit = null;

		for (i = 0; i < list.length; i += 1) {
			count = 0;

			for (j = 0; j < list.length; j += 1) {
				if (getDistance(list[i].x, list[i].y, list[j].x, list[j].y) <= clusterRange) {
					count += 1;
				}
			}

			if (count > bestCount) {
				bestCount = count;
				bestUnit = list[i];
			}
		}

		if (!bestUnit || bestCount < minSize) {
			return false;
		}

		return {
			unit: bestUnit,
			count: bestCount
		};
	},

	deploy: function (unit, distance, spread, range) {
		if (arguments.length < 4) {
			throw new Error("deploy: Not enough arguments supplied");
		}

		var i, grid, index, currCount,
			tick = getTickCount(),
			monList = [],
			count = 999,
			idealPos = {
				x: Math.round(Math.cos(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.x),
				y: Math.round(Math.sin(Math.atan2(me.y - unit.y, me.x - unit.x)) * Config.DodgeRange + unit.y)
			};

		monList = this.buildMonsterList();

		monList.sort(Sort.units);

		if (this.getMonsterCount(me.x, me.y, 15, monList) === 0) {
			return true;
		}

		CollMap.getNearbyRooms(unit.x, unit.y);

		grid = this.buildGrid(unit.x - distance, unit.x + distance, unit.y - distance, unit.y + distance, spread);

		//print("Grid build time: " + (getTickCount() - tick));

		if (!grid.length) {
			return false;
		}

		function sortGrid(a, b) {
			//return getDistance(a.x, a.y, idealPos.x, idealPos.y) - getDistance(b.x, b.y, idealPos.x, idealPos.y);
			return getDistance(b.x, b.y, unit.x, unit.y) - getDistance(a.x, a.y, unit.x, unit.y);
		}

		grid.sort(sortGrid);

		for (i = 0; i < grid.length; i += 1) {
			if (!(CollMap.getColl(grid[i].x, grid[i].y, true) & 0x1) && !CollMap.checkColl(unit, {x: grid[i].x, y: grid[i].y}, 0x4)) {
				currCount = this.getMonsterCount(grid[i].x, grid[i].y, range, monList);

				if (currCount < count) {
					index = i;
					count = currCount;
				}

				if (currCount === 0) {
					break;
				}
			}
		}

		//print("Safest spot with " + count + " monsters.");

		if (typeof index === "number") {
			//print("Dodge build time: " + (getTickCount() - tick));

			return Pather.moveTo(grid[index].x, grid[index].y, 0);
		}

		return false;
	},

	getMonsterCount: function (x, y, range, list) {
		var i,
			fire,
			count = 0,
			ignored = [243];

		for (i = 0; i < list.length; i += 1) {
			if (ignored.indexOf(list[i].classid) === -1 && this.checkMonster(list[i]) && getDistance(x, y, list[i].x, list[i].y) <= range) {
				count += 1;
			}
		}

		fire = getUnit(2, "fire");

		if (fire) {
			do {
				if (getDistance(x, y, fire.x, fire.y) <= 4) {
					count += 100;
				}
			} while (fire.getNext());
		}

		return count;
	},

	buildGrid: function (xmin, xmax, ymin, ymax, spread) {
		if (xmin >= xmax || ymin >= ymax || spread < 1) {
			throw new Error("buildGrid: Bad parameters");
		}

		var i, j, coll,
			grid = [];

		for (i = xmin; i <= xmax; i += spread) {
			for (j = ymin; j <= ymax; j += spread) {
				coll = CollMap.getColl(i, j, true);

				if (typeof coll === "number") {
					grid.push({x: i, y: j, coll: coll});
				}
			}
		}

		return grid;
	},

	// Check if a monster is attackable
	checkMonster: function (unit) {
		if (!unit || !copyUnit(unit).x) {
			return false;
		}

		if (unit.area !== me.area) {
			return false;
		}

		if (unit.type === 0 && unit.mode !== 17) { // Player
			return true;
		}

		if (unit.hp === 0 || unit.mode === 0 || unit.mode === 12) { // Dead monster
			return false;
		}

		if (unit.getStat(172) === 2) {	// Friendly monster/NPC
			return false;
		}

		if (unit.charlvl < 1) { // catapults were returning a level of 0 and hanging up clear scripts
			return false;
		}

		if (getBaseStat("monstats", unit.classid, "neverCount")) { // neverCount base stat - hydras, traps etc.
			return false;
		}

		switch (unit.classid) {
		case 179: // An evil force - cow (lol)
			return false;
		case 543: // Baal in Throne
			if (me.area === 131) {
				return false;
			}

			break;
		case 110: // Vultures
		case 111:
		case 112:
		case 113:
		case 114:
		case 608:
			if (unit.mode === 8) { // Flying
				return false;
			}

			break;
		case 68: // Sand Maggots
		case 69:
		case 70:
		case 71:
		case 72:
		case 679:
		case 258: // Water Watchers
		case 259:
		case 260:
		case 261:
		case 262:
		case 263:
			if (unit.mode === 14) { // Submerged/Burrowed
				return false;
			}

			break;
		}

		return true;
	},

	skipCheck: function (unit) {
		if (me.area === 131) {
			return true;
		}

		if ((unit.spectype & 0x7) && Config.SkipException && Config.SkipException.indexOf(unit.name) > -1) {
			print("ÿc1Skip Exception: " + unit.name);
			return true;
		}

		var i, j, rval,
			tempArray = [];

EnchantLoop: // Skip enchanted monsters
		for (i = 0; i < Config.SkipEnchant.length; i += 1) {
			tempArray = Config.SkipEnchant[i].toLowerCase().split(" and ");

			for (j = 0; j < tempArray.length; j += 1) {
				switch (tempArray[j]) {
				case "extra strong":
					tempArray[j] = 5;

					break;
				case "extra fast":
					tempArray[j] = 6;

					break;
				case "cursed":
					tempArray[j] = 7;

					break;
				case "magic resistant":
					tempArray[j] = 8;

					break;
				case "fire enchanted":
					tempArray[j] = 9;

					break;
				case "lightning enchanted":
					tempArray[j] = 17;

					break;
				case "cold enchanted":
					tempArray[j] = 18;

					break;
				case "mana burn":
					tempArray[j] = 25;

					break;
				case "teleportation":
					tempArray[j] = 26;

					break;
				case "spectral hit":
					tempArray[j] = 27;

					break;
				case "stone skin":
					tempArray[j] = 28;

					break;
				case "multiple shots":
					tempArray[j] = 29;

					break;
				}
			}

			for (j = 0; j < tempArray.length; j += 1) {
				if (!unit.getEnchant(tempArray[j])) {
					break;
				}
			}

			if (j === tempArray.length) {
				//print("Skip Enchanted: " + unit.name);

				return false;
			}
		}

ImmuneLoop: // Skip immune monsters
		for (i = 0; i < Config.SkipImmune.length; i += 1) {
			tempArray = Config.SkipImmune[i].toLowerCase().split(" and ");

			for (j = 0; j < tempArray.length; j += 1) {
				if (this.checkResist(unit, tempArray[j])) { // Infinity calculations are built-in
					break;
				}
			}

			if (j === tempArray.length) {
				return false;
			}
		}

AuraLoop: // Skip monsters with auras
		for (i = 0; i < Config.SkipAura.length; i += 1) {
			rval = true;

			switch (Config.SkipAura[i].toLowerCase()) {
			case "fanaticism":
				if (unit.getState(49)) {
					rval = false;
				}

				break;
			case "might":
				if (unit.getState(33)) {
					rval = false;
				}

				break;
			case "holy fire":
				if (unit.getState(35)) {
					rval = false;
				}

				break;
			case "blessed aim":
				if (unit.getState(40)) {
					rval = false;
				}

				break;
			case "conviction":
				if (unit.getState(28)) {
					rval = false;
				}

				break;
			case "holy freeze":
				if (unit.getState(43)) {
					rval = false;
				}

				break;
			case "holy shock":
				if (unit.getState(46)) {
					rval = false;
				}

				break;
			}

			if (!rval) {
				return false;
			}
		}

		return true;
	},

	// Get element by skill number
	getSkillElement: function (skillId) {
		this.elements = ["physical", "fire", "lightning", "magic", "cold", "poison", "none"];

		switch (skillId) {
		case 0: // Normal Attack
			return "physical";
		case 74: // Corpse Explosion
		case 144: // Concentrate
		case 147: // Frenzy
		case 273: // Minge Blast
		case 500: // Summoner
			return "physical";
		case 101: // Holy Bolt
			return "holybolt"; // no need to use this.elements array because it returns before going over the array
		}

		var eType = getBaseStat("skills", skillId, "etype");

		if (typeof (eType) === "number") {
			return this.elements[eType];
		}

		return false;
	},

	// Get a monster's resistance to specified element
	getResist: function (unit, type) {
		if (!unit || !unit.getStat) {	// some scripts pass empty units in throne room
			return 100;
		}

		if (unit.type === 0) { // player
			return 0;
		}

		switch (type) {
		case "physical":
			return unit.getStat(36);
		case "fire":
			return unit.getStat(39);
		case "lightning":
			return unit.getStat(41);
		case "magic":
			return unit.getStat(37);
		case "cold":
			return unit.getStat(43);
		case "poison":
			return unit.getStat(45);
		case "none":
			return 0;
		case "holybolt": // check if a monster is undead
			if (getBaseStat("monstats", unit.classid, "lUndead") || getBaseStat("monstats", unit.classid, "hUndead")) {
				return 0;
			}

			return 100;
		}

		return 100;
	},

	// Check if a monster is immune to specified attack type
	checkResist: function (unit, val, maxres) {
		// Ignore player resistances
		if (unit.type === 0) {
			return true;
		}

		var damageType = typeof val === "number" ? this.getSkillElement(val) : val;

		// Unknown / missing etype (should not happen for skill 0 after mapping) — don't treat as immune
		if (damageType === false || damageType === undefined || damageType === null) {
			if (val === 0) {
				damageType = "physical";
			} else {
				return true;
			}
		}

		if (maxres === undefined) {
			maxres = 100;
		}

		// Static Field — PD2 floor 55/70/85; Config.CastStatic is stop-% (clamped up to floor)
		if (val === 42 && this.getResist(unit, damageType) < 100) {
			var thresh = 100;

			if (typeof ClassAttack !== "undefined" && ClassAttack.getStaticThreshold) {
				thresh = ClassAttack.getStaticThreshold();
			} else if (Config.CastStatic !== false && Config.CastStatic < 100) {
				thresh = Config.CastStatic;
			}

			return thresh < 100 && (unit.hp * 100 / (unit.hpmax || 128)) > thresh;
		}

		if (this.infinity && ["fire", "lightning", "cold"].indexOf(damageType) > -1 && unit.getState) { // baal in throne room doesn't have getState
			if (!unit.getState(28)) {
				return this.getResist(unit, damageType) < 117;
			}

			return this.getResist(unit, damageType) < maxres;
		}

		return this.getResist(unit, damageType) < maxres;
	},

	// Check if we have valid skills to attack a monster
	canAttack: function (unit) {
		if (unit.type === 1) {
			if (unit.spectype & 0x7) { // Unique/Champion
				if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[1])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[2]))) {
					return true;
				}
			} else {
				if (Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[3])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[4]))) {
					return true;
				}
			}

			if (Config.AttackSkill.length === 7) {
				return Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[5])) || Attack.checkResist(unit, this.getSkillElement(Config.AttackSkill[6]));
			}
		}

		return false;
	},

	// Detect use of bows/crossbows
	usingBow: function () {
		var item;

		item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.bodylocation === 4 || item.bodylocation === 5) {
					switch (item.itemType) {
					case 27: // Bows
					case 85: // Amazon Bows
						return "bow";
					case 35: // Crossbows
						return "crossbow";
					}
				}
			} while (item.getNext());
		}

		return false;
	},

	// Find an optimal attack position and move or walk to it
	getIntoPosition: function (unit, distance, coll, walk) {
		if (!unit || !unit.x || !unit.y) {
			return false;
		}

		if (walk === true) {
			walk = 1;
		}

		// NM/Hell Diablo: sit on him (0 range) so his lightning hose misses
		if (unit.classid === 243 && me.diff > 0) {
			distance = 0;
		}

		// Inside a clear: don't walk toward a far target while another mob is in our face
		if (this.clearing) {
			var dangerR = this.dangerRange(),
				danger;

			if (dangerR > 0 && getDistance(me, unit) > dangerR) {
				danger = this.inDanger(dangerR);

				if (danger && danger.gid !== unit.gid) {
					return false;
				}
			}
		}

		if (distance < 4 && (!unit.hasOwnProperty("mode") || (unit.mode !== 0 && unit.mode !== 12))) {
			//me.overhead("Short range");

			if (walk) {
				// Walk whenever outside the requested melee range (was hardcoded >8,
				// so dist 4–8 never closed in — OOM normal-attack stood and whiffed).
				if (getDistance(me, unit) > distance || checkCollision(me, unit, coll)) {
					Pather.walkTo(unit.x, unit.y, 3);
				}
			} else {
				Pather.moveTo(unit.x, unit.y, 0);
			}

			return !CollMap.checkColl(me, unit, coll);
		}

		var n, i, cx, cy, t,
			coords = [],
			fullDistance = distance,
			name = unit.hasOwnProperty("name") ? unit.name : "",
			angle = Math.round(Math.atan2(me.y - unit.y, me.x - unit.x) * 180 / Math.PI),
			angles = [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90, 135, -135, 180];

		t = getTickCount();

		for (n = 0; n < 3; n += 1) {
			if (n > 0) {
				distance -= Math.floor(fullDistance / 3 - 1);
			}

			for (i = 0; i < angles.length; i += 1) {
				cx = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * distance + unit.x);
				cy = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * distance + unit.y);

				if (Pather.checkSpot(cx, cy, 0x1, false)) {
					coords.push({x: cx, y: cy});
				}
			}

			//print("ÿc9potential spots: ÿc2" + coords.length);

			if (coords.length > 0) {
				coords.sort(Sort.units);

				for (i = 0; i < coords.length; i += 1) {
					// Valid position found
					if (!CollMap.checkColl({x: coords[i].x, y: coords[i].y}, unit, coll, 1)) {
						//print("ÿc9optimal pos build time: ÿc2" + (getTickCount() - t) + " ÿc9distance from target: ÿc2" + getDistance(cx, cy, unit.x, unit.y));

						switch (walk) {
						case 1:
							Pather.walkTo(coords[i].x, coords[i].y, 2);

							break;
						case 2:
							if (getDistance(me, coords[i]) < 6 && !CollMap.checkColl(me, coords[i], 0x5)) {
								Pather.walkTo(coords[i].x, coords[i].y, 2);
							} else {
								Pather.moveTo(coords[i].x, coords[i].y, 1);
							}

							break;
						default:
							Pather.moveTo(coords[i].x, coords[i].y, 1);

							break;
						}

						return true;
					}
				}
			}
		}

		if (name) {
			print("ÿc4Attackÿc0: No valid positions for: " + name);
		}

		return false;
	}
};