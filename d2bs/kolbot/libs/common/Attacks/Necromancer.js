/**
*	@filename	Necromancer.js
*	@author		kolton
*	@desc		Necromancer attack sequence
*/

var ClassAttack = {
	novaTick: 0,
	cursesSet: false,
	curseState: [],

	// Fallen / fetish / etc. shamans (same set as Attack.sortMonsters)
	shamanIds: [58, 59, 60, 61, 62, 101, 102, 103, 104, 105, 278, 279, 280, 281, 282, 298, 299, 300, 645, 646, 647, 662, 663, 664, 667, 668, 669, 670, 675, 676],

	isShaman: function (unit) {
		return !!(unit && this.shamanIds.indexOf(unit.classid) > -1);
	},

	// Nearest living shaman within range (Act1 peel)
	findPriorityShaman: function (range) {
		var unit = getUnit(1), best = null, bestD = 999, d;

		if (!unit) {
			return null;
		}

		do {
			try {
				if (typeof unit.x !== "number" || !this.isShaman(unit)) {
					continue;
				}

				if (!Attack.checkMonster(unit)) {
					continue;
				}

				d = getDistance(me, unit);

				if (d <= range && d < bestD) {
					bestD = d;
					best = copyUnit(unit);
				}
			} catch (eSh) {}
		} while (unit.getNext());

		return best;
	},

	// Skill known (hard points or soft). Skill 0 = always-on normal attack.
	hasSkill: function (skillId) {
		if (skillId === 0) {
			return true;
		}

		if (skillId === undefined || skillId < 0) {
			return false;
		}

		return !!me.getSkill(skillId, 1) || !!me.getStat(97, skillId);
	},

	hasDagger: function () {
		return typeof Town !== "undefined" && typeof Town.hasEquippedDagger === "function" && Town.hasEquippedDagger();
	},

	// Best live attack: PS+dagger → normal attack (need dagger) → Teeth only before PS
	bestAttackSkill: function () {
		if (this.hasSkill(73)) {
			if (this.hasDagger()) {
				return 73; // Poison Strike
			}

			// PS known but still on wand — don't Teeth; melee + shop dagger in town
			return 0;
		}

		if (this.hasSkill(67)) {
			return 67; // Teeth only as soft prereq before PS
		}

		return 0;
	},

	// Keep Config.AttackSkill in sync so Attack.clear / canAttack use the right range/element
	// Do NOT force AttackSkill[2]/[4] to 0 — that makes every swing also cast normal attack.
	// Skill 0 belongs only in LowManaSkill (or as primary when no PS/dagger yet).
	syncAttackSkills: function () {
		var sk = this.bestAttackSkill();

		if (Config.AttackSkill[1] !== sk) {
			Config.AttackSkill[1] = sk;
		}

		if (Config.AttackSkill[3] !== sk) {
			Config.AttackSkill[3] = sk;
		}
	},

	// Prefer configured skill; fall back Teeth / normal until dagger+PS
	// Skill 0 is only valid as a primary (no PS yet) — never as a "usable" untimed companion.
	usableSkill: function (skillId) {
		if (skillId === undefined || skillId < 0) {
			return -1;
		}

		if (skillId === 0) {
			return -1;
		}

		if (skillId === 73) {
			return this.bestAttackSkill();
		}

		if (this.hasSkill(skillId)) {
			return skillId;
		}

		return this.bestAttackSkill();
	},

	initCurses: function () {
		var i;

		for (i = 0; i < Config.Curse.length; i += 1) {
			switch (Config.Curse[i]) {
			case 0: //nothing
				this.curseState[i] = 0;

				break;
			case 66: //amplify damage
				this.curseState[i] = 9;

				break;
			case 71: //dim vision
				this.curseState[i] = 23;

				break;
			case 72: //weaken
				this.curseState[i] = 19;

				break;
			case 76: //iron maiden
				this.curseState[i] = 55;

				break;
			case 77: //terror
				this.curseState[i] = 56;

				break;
			case 81: //confuse
				this.curseState[i] = 59;

				break;
			case 82: //life tap
				this.curseState[i] = 58;

				break;
			case 86: //attract
				this.curseState[i] = 57;

				break;
			case 87: //decrepify
				this.curseState[i] = 60;

				break;
			case 91: //lower resist
				this.curseState[i] = 61;

				break;
			default:
				Config.Curse[i] = 0;
				print("Invalid curse id");

				break;
			}
		}

		this.cursesSet = true;
	},

	// Keep Config.Golem up — only when dead (not every swing / not mastery refill)
	_golemRetryTick: 0,

	ensureGolem: function () {
		var monstersNear;

		if (!Config.Golem || Config.Golem === "None" || Config.Golem === 0) {
			return false;
		}

		if (typeof Precast !== "undefined" && Precast.hasGolem && Precast.hasGolem()) {
			return true;
		}

		// Match Precast hard cooldown — mid-fight retries were stacking PD2 golems
		if (this._golemRetryTick && getTickCount() - this._golemRetryTick < 15000) {
			return false;
		}

		// Don't interrupt a melee swing when monsters are on top of us
		monstersNear = getUnit(1);

		if (monstersNear) {
			do {
				try {
					if (typeof monstersNear.x !== "number") {
						continue;
					}

					if (Attack.checkMonster(monstersNear) && getDistance(me, monstersNear) < 5) {
						return false;
					}
				} catch (eNear) {}
			} while (monstersNear.getNext());
		}

		this._golemRetryTick = getTickCount();

		if (typeof Precast === "undefined" || !Precast.ensureNecroGolem) {
			return false;
		}

		switch (Config.Golem) {
		case 3:
		case "Fire":
			return Precast.ensureNecroGolem(94, 85, 75);
		case 2:
		case "Blood":
			return Precast.ensureNecroGolem(85, 75);
		case 1:
		case "Clay":
			return Precast.ensureNecroGolem(75);
		default:
			return false;
		}
	},

	// Bone Armor only when missing — never mid-swing with pack in face
	ensureBoneArmor: function () {
		var monstersNear;

		if (!this.hasSkill(68) || me.getState(14)) {
			return true;
		}

		monstersNear = getUnit(1);

		if (monstersNear) {
			do {
				try {
					if (typeof monstersNear.x !== "number") {
						continue;
					}

					if (Attack.checkMonster(monstersNear) && getDistance(me, monstersNear) < 5) {
						return false;
					}
				} catch (eNear) {}
			} while (monstersNear.getNext());
		}

		Skill.cast(68, 0);
		delay(200 + me.ping);

		return !!me.getState(14);
	},

	doAttack: function (unit, preattack) {
		var shaman;

		if (!this.cursesSet) {
			this.initCurses();
		}

		this.syncAttackSkills();

		// Act1: peel shamans before stabbing fallen (packs revive otherwise)
		if (Config.NecroShamanFocus && me.act === 1 && unit && !this.isShaman(unit)) {
			shaman = this.findPriorityShaman(35);

			if (shaman) {
				unit = shaman;
			}
		}

		// Pre-dagger: raise skeletons from wand soft (skill 70) before swinging
		if (Config.ActiveSummon && !this.hasDagger() && this.hasSkill(70)) {
			this.raiseArmy();
		}

		if (Config.MercWatch && Town.needMerc()) {
			Town.visitTown();
		}

		if (preattack && Config.AttackSkill[0] > 0 && this.hasSkill(Config.AttackSkill[0]) && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return false;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return true;
		}

		var index, checkSkill,
			timedSkill = -1,
			untimedSkill = -1;

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		if (Config.Curse[0] > 0 && this.hasSkill(Config.Curse[0]) && this.isCursable(unit) && (unit.spectype & 0x7) && !unit.getState(this.curseState[0]) &&
				Skill.getManaCost(Config.Curse[0]) <= me.mp) {
			if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, 25, 0x4)) {
					return false;
				}
			}

			Skill.cast(Config.Curse[0], 0, unit);

			return true;
		}

		if (Config.Curse[1] > 0 && this.hasSkill(Config.Curse[1]) && this.isCursable(unit) && !(unit.spectype & 0x7) && !unit.getState(this.curseState[1]) &&
				Skill.getManaCost(Config.Curse[1]) <= me.mp) {
			if (getDistance(me, unit) > 25 || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, 25, 0x4)) {
					return false;
				}
			}

			Skill.cast(Config.Curse[1], 0, unit);

			return true;
		}

		// Get timed skill (fall back to normal attack until Poison Strike is learned)
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		checkSkill = this.usableSkill(checkSkill);

		// usableSkill maps PS→0 when no dagger; 0 as primary is OK. Untimed never uses 0 (see usableSkill).
		if (checkSkill === 0 || (checkSkill > 0 && Attack.checkResist(unit, checkSkill))) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > -1 && this.hasSkill(Config.AttackSkill[5]) && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			// Don't fall back to Teeth once Poison Strike is learned
			if (!(Config.AttackSkill[5] === 67 && this.hasSkill(73))) {
				timedSkill = Config.AttackSkill[5];
			}
		}

		// Get untimed skill (skill 0 rejected by usableSkill — LowMana only)
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[1];
		} else {
			checkSkill = Config.AttackSkill[index + 1];
		}

		checkSkill = this.usableSkill(checkSkill);

		if (checkSkill > 0 && Attack.checkResist(unit, checkSkill)) {
			untimedSkill = checkSkill;
		} else if (Config.AttackSkill[6] > -1 && this.hasSkill(Config.AttackSkill[6]) && Attack.checkResist(unit, Config.AttackSkill[6]) && ([56, 59].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			untimedSkill = Config.AttackSkill[6];
		}

		// Out of mana → normal attack only (LowManaSkill[0] === 0)
		if (timedSkill > 0 && Skill.getManaCost(timedSkill) > me.mp) {
			if (Config.LowManaSkill[0] === 0 || me.charlvl <= 18) {
				timedSkill = 0;
				untimedSkill = -1;
			} else if (Config.LowManaSkill[0] > 0 && this.hasSkill(Config.LowManaSkill[0]) && Attack.checkResist(unit, Config.LowManaSkill[0])) {
				timedSkill = Config.LowManaSkill[0];
				untimedSkill = -1;
			} else {
				timedSkill = 0;
				untimedSkill = -1;
			}
		}

		if (untimedSkill > 0 && Skill.getManaCost(untimedSkill) > me.mp && (timedSkill <= 0 || Skill.getManaCost(timedSkill) > me.mp)) {
			if (Config.LowManaSkill[1] === 0 || Config.LowManaSkill[0] === 0 || me.charlvl <= 18) {
				if (timedSkill <= 0) {
					timedSkill = 0;
				}

				untimedSkill = -1;
			} else if (Config.LowManaSkill[1] > 0 && this.hasSkill(Config.LowManaSkill[1]) && Attack.checkResist(unit, Config.LowManaSkill[1])) {
				untimedSkill = Config.LowManaSkill[1];
			} else {
				untimedSkill = -1;
			}
		}

		// No skills yet: both slots normal attack — cast once
		if (timedSkill < 0 && untimedSkill < 0) {
			timedSkill = 0;
			untimedSkill = -1;
		} else if (timedSkill < 0 && untimedSkill === 0) {
			timedSkill = 0;
			untimedSkill = -1;
		} else if (timedSkill === 0 && untimedSkill === 0) {
			untimedSkill = -1;
		}

		switch (this.doCast(unit, timedSkill, untimedSkill)) {
		case 0: // Fail
			break;
		case 1: // Success
			if (Config.ActiveSummon) {
				this.raiseArmy();
			}

			this.explodeCorpses(unit);

			return true;
		case 2: // Try to telestomp
			if (Config.TeleStomp && Attack.checkResist(unit, "physical") && !!me.getMerc()) {
				while (Attack.checkMonster(unit)) {
					if (getDistance(me, unit) > 3) {
						Pather.moveToUnit(unit);
					}

					this.doCast(unit, Config.AttackSkill[1], Config.AttackSkill[2]);

					if (Config.ActiveSummon) {
						this.raiseArmy();
					}

					this.explodeCorpses(unit);
				}

				return true;
			}

			break;
		}

		// Couldn't attack
		return false;
	},

	afterAttack: function () {
		Misc.unShift();
		Precast.doPrecast(false);

		// Refresh only when missing (golem dead / bone armor gone) — not every swing
		this.ensureBoneArmor();

		if (Config.ActiveSummon) {
			this.ensureGolem();
			this.raiseArmy();
		}

		this.novaTick = 0;
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, timedSkill, untimedSkill) {
		var i, walk;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		// Check for bodies to exploit for CorpseExplosion before committing to an attack for non-summoner type necros
		if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
			if (this.checkCorpseNearMonster(unit)) {
				this.explodeCorpses(unit);
			}
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
			switch (timedSkill) {
			case 92: // Poison Nova
				if (!this.novaTick || getTickCount() - this.novaTick > Config.PoisonNovaDelay * 1000) {
					if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
							return 0;
						}
					}

					if (!unit.dead && Skill.cast(timedSkill, Skill.getHand(timedSkill), unit)) {
						this.novaTick = getTickCount();
					}
				}

				break;
			case 500: // Pure Summoner
				if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4)) {
						return 0;
					}
				}

				delay(300);

				break;
			default:
				if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
					return 0;
				}

				if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
					// Allow short-distance walking for melee skills / normal attack
					walk = Skill.getRange(timedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

					if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, walk)) {
						return 0;
					}
				}

				if (!unit.dead) {
					Skill.cast(timedSkill, Skill.getHand(timedSkill), unit);
				}

				break;
			}
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
				// Allow short-distance walking for melee skills
				walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				Skill.cast(untimedSkill, Skill.getHand(untimedSkill), unit);
			}

			return 1;
		}

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(121)) {
				break;
			}

			delay(40);
		}

		// Delay for Poison Nova
		while (this.novaTick && getTickCount() - this.novaTick < Config.PoisonNovaDelay * 1000) {
			delay(40);
		}

		return 1;
	},

	isCursable: function (unit) {
		if (copyUnit(unit).name === undefined || unit.name.indexOf(getLocaleString(11086)) > -1) { // "Possessed"
			return false;
		}

		if (unit.getState(57)) { // attract can't be overridden
			return false;
		}

		switch (unit.classid) {
		case 206: // Foul Crow Nest
		case 258: // Water Watcher
		case 261: // Water Watcher
		case 266: // Flavie
		case 528: // Evil Demon Hut
			return false;
		}

		return true;
	},

	raiseArmy: function (range) {
		var i, tick, count, corpse, corpseList, skill, maxSkeletons, maxMages, maxRevives;

		if (!range) {
			range = 25;
		}

		if (Config.Skeletons === "max") {
			skill = me.getSkill(70, 1);
			maxSkeletons = skill < 4 ? skill : (Math.floor(skill / 3) + 2);
		} else {
			maxSkeletons = Config.Skeletons;
		}

		if (Config.SkeletonMages === "max") {
			skill = me.getSkill(80, 1);
			maxMages = skill < 4 ? skill : (Math.floor(skill / 3) + 2);
		} else {
			maxMages = Config.SkeletonMages;
		}

		if (Config.Revives === "max") {
			skill = me.getSkill(95, 1);
			maxRevives = skill;
		} else {
			maxRevives = Config.Revives;
		}

		for (i = 0; i < 3; i += 1) {
			corpse = getUnit(1, -1, 12);
			corpseList = [];

			if (corpse) {
				do {
					if (getDistance(me, corpse) <= range && this.checkCorpse(corpse)) { // within casting distance
						corpseList.push(copyUnit(corpse));
					}
				} while (corpse.getNext());
			}

MainLoop:
			while (corpseList.length > 0) {
				corpse = corpseList.shift();

				if (me.getMinionCount(4) < maxSkeletons) {
					if (!Skill.cast(70, 0, corpse)) {
						return false;
					}

					count = me.getMinionCount(4);
					tick = getTickCount();

					while (getTickCount() - tick < 200) {
						if (me.getMinionCount(4) > count) {
							break;
						}

						delay(10);
					}
				} else if (me.getMinionCount(5) < maxMages) {
					if (!Skill.cast(80, 0, corpse)) {
						return false;
					}

					count = me.getMinionCount(5);
					tick = getTickCount();

					while (getTickCount() - tick < 200) {
						if (me.getMinionCount(5) > count) {
							break;
						}

						delay(10);
					}
				} else if (me.getMinionCount(6) < maxRevives) {
					if (this.checkCorpse(corpse, true)) {
						print("Reviving " + corpse.name);

						if (!Skill.cast(95, 0, corpse)) {
							return false;
						}

						count = me.getMinionCount(6);
						tick = getTickCount();

						while (getTickCount() - tick < 200) {
							if (me.getMinionCount(6) > count) {
								break;
							}

							delay(10);
						}
					}
				} else {
					return true;
				}
			}
		}

		return true;
	},

	explodeCorpses: function (unit) {
		if (Config.ExplodeCorpses === 0 || unit.mode === 0 || unit.mode === 12) {
			return false;
		}

		var i,
			corpseList = [],
			range = Math.floor((me.getSkill(Config.ExplodeCorpses, 1) + 7) / 3),
			corpse = getUnit(1, -1, 12);

		if (corpse) {
			do {
				if (getDistance(unit, corpse) <= range && this.checkCorpse(corpse)) {
					corpseList.push(copyUnit(corpse));
				}
			} while (corpse.getNext());

			//Shuffle the corpseList so if running multiple necrobots they explode separate corpses not the same ones
			if (corpseList.length > 1) {
				corpseList = corpseList.shuffle();
			}

			if (Config.Skeletons + Config.SkeletonMages + Config.Revives === 0) {
				// We don't need corpses as we are not a Summoner Necro, Spam CE till monster dies or we run out of bodies.
				do {
					corpse = corpseList.shift();

					if (corpse) {
						if (!unit.dead && this.checkCorpse(corpse) && getDistance(corpse, unit) <= range) {
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name + " id:" + corpse.gid); // Added corpse ID so I can see when it blows another monster with the same ClassID and Name

							if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
								delay(me.ping + 1);
							}
						}
					}
				} while (corpseList.length > 0);
			} else {
				// We are a Summoner Necro, we should conserve corpses, only blow 2 at a time so we can check for needed re-summons.
				for (i = 0; i <= 1; i += 1) {
					if (corpseList.length > 0) {
						corpse = corpseList.shift();

						if (corpse) {
							me.overhead("Exploding: " + corpse.classid + " " + corpse.name);

							if (Skill.cast(Config.ExplodeCorpses, 0, corpse)) {
								delay(200);
							}
						}
					} else {
						break;
					}
				}
			}
		}

		return true;
	},

	checkCorpseNearMonster: function (monster, range) {
		var corpse = getUnit(1, -1, 12);

		if (range === undefined) { // Assume CorpseExplosion if no range specified
			range = Math.floor((me.getSkill(Config.ExplodeCorpses, 1) + 7) / 3);
		}

		if (corpse) {
			do {
				if (getDistance(corpse, monster) <= range) {
					return true;
				}
			} while (corpse.getNext());
		}

		return false;
	},

	checkCorpse: function (unit, revive) {
		if (unit.mode !== 12) {
			return false;
		}

		if (revive === undefined) {
			revive = false;
		}

		var baseId = getBaseStat("monstats", unit.classid, "baseid"),
			badList = [312, 571];

		if (revive && ((unit.spectype & 0x7) || badList.indexOf(baseId) > -1 || (Config.ReviveUnstackable && getBaseStat("monstats2", baseId, "sizex") === 3))) {
			return false;
		}

		if (!getBaseStat("monstats2", baseId, revive ? "revive" : "corpseSel")) {
			return false;
		}

		if (getDistance(me, unit) <= 25 && !checkCollision(me, unit, 0x4) &&
				!unit.getState(1) && // freeze
				!unit.getState(96) && // revive
				!unit.getState(99) && // redeemed
				!unit.getState(104) && // nodraw
				!unit.getState(107) && // shatter
				!unit.getState(118) // noselect
				) {
			return true;
		}

		return false;
	}
};