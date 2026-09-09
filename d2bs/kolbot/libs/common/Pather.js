/**
*	@filename	Pather.js
*	@author		kolton
*	@desc		handle player movement
*/

// Perform certain actions after moving to each node
var NodeAction = {
	// Run all the functions within NodeAction (except for itself)
	go: function (arg) {
		var i;

		for (i in this) {
			if (this.hasOwnProperty(i) && typeof this[i] === "function" && i !== "go") {
				this[i](arg);
			}
		}
	},

		// Kill monsters while pathing
	killMonsters: function (arg) {
		var monList;

		if (Config.Countess.KillGhosts && [21, 22, 23, 24, 25].indexOf(me.area) > -1) {
			monList = Attack.getMob(38, 0, 30);

			if (monList) {
				Attack.clearList(monList);
			}
		}

		// Claw Viper Temple — clear nearby while pathing (esp. L2 altar)
		if ([58, 61].indexOf(me.area) > -1) {
			Attack.clear(20, 0);
		}

		// Arcane Sanctuary without Teleport — platforms are packed; always clear while walking
		if (me.area === 74 && !(Pather.teleport && Pather.canTeleport())) {
			Attack.clear(15, 0);
		}

		if ((typeof Config.ClearPath === "number" || typeof Config.ClearPath === "object") && arg.clearPath === false) {
			switch (typeof Config.ClearPath) {
			case "number":
				Attack.clear(30, Config.ClearPath);

				break;
			case "object":
				if (!Config.ClearPath.hasOwnProperty("Areas") || Config.ClearPath.Areas.length === 0 || Config.ClearPath.Areas.indexOf(me.area) > -1) {
					Attack.clear(Config.ClearPath.Range, Config.ClearPath.Spectype);
				}

				break;
			}
		}

		if (arg.clearPath !== false) {
			Attack.clear(15, typeof arg.clearPath === "number" ? arg.clearPath : 0);
		} else if (Attack.shouldDangerClear()) {
			var dMon = Attack.inDanger();

			if (dMon) {
				// Travel legs with clearPath=false still peel what's already on us
				print("ÿc4Patherÿc0 :: danger " + (dMon.name || "?") + " d=" + Math.round(getDistance(me, dMon)) + " → clear");
				Attack.clear(Attack.dangerClearRange());
			}
		}
	},

	// Open chests while pathing — only ones we walk past (no moveTo detours)
	popChests: function () {
		if (!!Config.OpenChests) {
			Misc.openChests(5, {noMove: true});
		}
	},

	// Scan shrines while pathing
	getShrines: function () {
		if (!!Config.ScanShrines && Config.ScanShrines.length > 0) {
			Misc.scanShrines();
		}
	},

	// Use wells while pathing when low on life/mana
	getWells: function () {
		if (Config.UseWells !== false) {
			Misc.scanWells();
		}
	}
};

var PathDebug = {
	hooks: [],
	enableHooks: false,

	drawPath: function (path) {
		if (!this.enableHooks) {
			return;
		}

		this.removeHooks();

		var i;

		if (path.length < 2) {
			return;
		}

		for (i = 0; i < path.length - 1; i += 1) {
			this.hooks.push(new Line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y, 0x84, true));
		}
	},

	removeHooks: function () {
		var i;

		for (i = 0; i < this.hooks.length; i += 1) {
			this.hooks[i].remove();
		}

		this.hooks = [];
	},

	coordsInPath: function (path, x, y) {
		var i;

		for (i = 0; i < path.length; i += 1) {
			if (getDistance(x, y, path[i].x, path[i].y) < 5) {
				return true;
			}
		}

		return false;
	}
};

var Pather = {
	teleport: true,
	walkDistance: 5,
	teleDistance: 40,
	_lastTeleTick: 0,
	cancelFlags: [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x17, 0x19, 0x1A],
	wpAreas: [1, 3, 4, 5, 6, 27, 29, 32, 35, 40, 48, 42, 57, 43, 44, 52, 74, 46, 75, 76, 77, 78, 79, 80, 81, 83, 101, 103, 106, 107, 109, 111, 112, 113, 115, 123, 117, 118, 129],
	recursion: true,
	dangerCheck: false, // walkTo polls Attack.inDanger only when moveTo enables this
	dangerHit: false,   // walkTo sets true when it aborts for melee danger

	// 54 = Sorc Teleport / oskill; 367 = Necro Blood Warp (PD2); 0 = none
	teleSkill: function () {
		if (me.getStat(97, 54) || (me.classid === 1 && me.getSkill(54, 1))) {
			return 54;
		}

		if (me.classid === 2 && me.getSkill(367, 1)) {
			if (typeof Config !== "undefined" && Config.BloodWarp && Config.BloodWarp.Enabled === false) {
				return 0;
			}

			return 367;
		}

		return 0;
	},

	// True if we should path with Teleport / Blood Warp. Not overwritten by moveTo.
	canTeleport: function () {
		if (!this.teleport || me.inTown || me.getState(139) || me.getState(140)) {
			return false;
		}

		return this.teleSkill() > 0;
	},

	// Progressive *extra* wait between teles (ms). Walk/fight only while this is active.
	// Normal A1–A2: 10s → A3: 9s → A4: 8s → A5: 7s
	// NM A1: 6s → A2: 5s → A3: 4s → A4–A5: 3s/2s (necro / non-sorc)
	// Sorc: no bot TeleDelay from lvl 45+ anywhere, or from NM Act 4 onward before that
	// Hell: 0 = no bot delay (still waits on in-game cast frames / FCR in teleportTo)
	getTeleDelay: function () {
		var d, a, table;

		// Sorceress lvl 45+: never apply bot TeleDelay (game FCR / cast frames only)
		if (me.classid === 1 && me.charlvl >= 45) {
			return 0;
		}

		// Config.TeleDelay >= 0 forces a fixed extra delay; -1 / omit = progressive
		if (typeof Config !== "undefined" && Config.TeleDelay !== undefined && Config.TeleDelay >= 0) {
			return Config.TeleDelay;
		}

		// Sorceress: spam Teleport once past NM Act 3 (A4/A5 NM + Hell) even before 45
		if (me.classid === 1 && (me.diff >= 2 || (me.diff === 1 && me.act > 3))) {
			return 0;
		}

		table = [
			[10000, 10000, 9000, 8000, 7000], // Normal act 1–5
			[6000, 5000, 4000, 3000, 2000],   // Nightmare
			[0, 0, 0, 0, 0]                   // Hell — game cast recovery only
		];

		d = me.diff;
		a = me.act;

		if (d < 0 || d > 2) {
			d = 0;
		}

		if (a < 1 || a > 5) {
			a = 1;
		}

		return table[d][a - 1];
	},

	// Blood Warp game cooldown (ms). Soft points count so +skills reduce CD. 0 for skill 54.
	getTeleCooldownMs: function () {
		var sk, lvl;

		sk = this.teleSkill();

		if (sk !== 367) {
			return 0;
		}

		lvl = me.getSkill(367, 1) || 1;

		// 5.8s − 0.2s × (lvl−1), 0 at lvl 30+; +150ms buffer so we don't spam a rejected cast
		return Math.max(0, 5800 - 200 * (lvl - 1)) + 150;
	},

	// True when we may start a teleport cast (skill, mana/life, TeleDelay + Blood Warp CD).
	// Cast-frame recovery is handled in teleportTo — not here — so Hell (0ms) keeps tele pathing.
	canTeleportNow: function () {
		var delayMs, cdMs, waitMs, cost, sk, lvl, lifeCost, minPct, chickenFloor, afterHp;

		if (!this.canTeleport()) {
			return false;
		}

		sk = this.teleSkill();
		delayMs = this.getTeleDelay();
		cdMs = this.getTeleCooldownMs();
		waitMs = Math.max(delayMs || 0, cdMs || 0);

		if (waitMs > 0 && this._lastTeleTick && (getTickCount() - this._lastTeleTick) < waitMs) {
			return false;
		}

		cost = Skill.getManaCost(sk);

		if (cost > 0 && me.mp < cost) {
			return false;
		}

		// Blood Warp: 12% current life (min 2×lvl, cap 60) — refuse if post-cast HP is too low
		if (sk === 367) {
			lvl = me.getSkill(367, 1) || 1;
			lifeCost = Math.max(Math.floor(me.hp * 0.12), Math.min(2 * lvl, 60));
			afterHp = me.hp - lifeCost;
			minPct = (typeof Config !== "undefined" && Config.BloodWarp && Config.BloodWarp.MinLifePct !== undefined) ?
				Config.BloodWarp.MinLifePct : 50;
			chickenFloor = (typeof Config !== "undefined" && Config.LifeChicken > 0) ?
				Config.LifeChicken + 10 : 20;

			if (afterHp < Math.floor(me.hpmax * minPct / 100)) {
				return false;
			}

			if (afterHp <= Math.floor(me.hpmax * chickenFloor / 100)) {
				return false;
			}
		}

		return true;
	},

	/*
		Pather.moveTo(x, y, retry, clearPath, pop);
		x - the x coord to move to
		y - the y coord to move to
		retry - number of attempts before aborting
		clearPath - kill monsters while moving
		pop - remove last node
	*/
	moveTo: function (x, y, retry, clearPath, pop) {
		if (me.dead) { // Abort if dead
			return false;
		}

		var i, path, adjustedNode, cleared, moved, dMon,
			node = {x: x, y: y},
			fail = 0;

		for (i = 0; i < this.cancelFlags.length; i += 1) {
			if (getUIFlag(this.cancelFlags[i])) {
				me.cancel();
			}
		}

		if (getDistance(me, x, y) < 2) {
			return true;
		}

		if (x === undefined || y === undefined) {
			throw new Error("moveTo: Function must be called with at least 2 arguments.");
		}

		if (typeof x !== "number" || typeof y !== "number") {
			throw new Error("moveTo: Coords must be numbers");
		}

		if (retry === undefined) {
			retry = 3;
		}

		if (clearPath === undefined) {
			clearPath = false;
		}

		if (pop === undefined) {
			pop = false;
		}

		this.useTeleport = this.canTeleport();

		/* Disabling getPath optimizations, they are causing desync -- noah
		// Teleport without calling getPath if the spot is close enough
		if (this.useTeleport && getDistance(me, x, y) <= this.teleDistance) {
			//Misc.townCheck();

			return this.teleportTo(x, y);
		}

		// Walk without calling getPath if the spot is close enough
		if (!this.useTeleport && (getDistance(me, x, y) <= 5 || (getDistance(me, x, y) <= 25 && !CollMap.checkColl(me, {x: x, y: y}, 0x1)))) {
			return this.walkTo(x, y);
		}
		*/

		// pathIsTele tracks spacing of current path. During TeleDelay we walk (short nodes)
		// and clear; when canTeleportNow() flips, repath to tele spacing — never stand still.
		var pathIsTele = false,
			wantTele = false,
			teleDist = ([58, 61, 62, 63, 64].indexOf(me.area) > -1 ? 30 : this.teleDistance);

		var rebuildPath = function (useTele) {
			var dist = useTele ? teleDist : Pather.walkDistance,
				p = getPath(me.area, x, y, me.x, me.y, useTele ? 1 : 0, dist);

			if (!p) {
				return false;
			}

			p.reverse();

			if (pop) {
				p.pop();
			}

			path = p;
			pathIsTele = useTele;
			PathDebug.drawPath(path);

			return true;
		};

		wantTele = this.useTeleport && this.canTeleportNow();

		if (!rebuildPath(wantTele)) {
			throw new Error("moveTo: Failed to generate path.");
		}

		if (this.useTeleport && Config.TeleSwitch) {
			Misc.teleSwitch();
		}

		while (path.length > 0) {
			if (me.dead) { // Abort if dead
				return false;
			}

			for (i = 0; i < this.cancelFlags.length; i += 1) {
				if (getUIFlag(this.cancelFlags[i])) {
					me.cancel();
				}
			}

			// Tele ready again → jump spacing; on delay/OOM → walk + fight toward goal
			wantTele = this.useTeleport && this.canTeleportNow();

			if (wantTele !== pathIsTele) {
				if (!rebuildPath(wantTele)) {
					throw new Error("moveTo: Failed to generate path.");
				}

				if (!path.length) {
					break;
				}
			}

			node = path.shift();

			/* Right now getPath's first node is our own position so it's not necessary to take it into account
				This will be removed if getPath changes
			*/
			if (getDistance(me, node) > 2) {
				// Tight areas: Maggot Lair + Claw Viper Temple
				if ([58, 61, 62, 63, 64].indexOf(me.area) > -1) {
					adjustedNode = this.getNearestWalkable(node.x, node.y, 15, 3, 0x1 | 0x4 | 0x800 | 0x1000);

					if (adjustedNode) {
						node.x = adjustedNode[0];
						node.y = adjustedNode[1];
					}
				}

				// Only repath when we still have tele-spaced nodes on cooldown.
				// Walk paths can have long gaps in town — walking them is fine; repath+continue spins forever.
				if (!wantTele && pathIsTele && getDistance(me, node) > 12) {
					if (!rebuildPath(false)) {
						throw new Error("moveTo: Failed to generate path.");
					}

					continue;
				}

				// Pre-node: peel melee threats before walking into the next node
				if (!wantTele && Attack.shouldDangerClear()) {
					dMon = Attack.inDanger();

					if (dMon) {
						print("ÿc4Patherÿc0 :: danger " + (dMon.name || "?") + " d=" + Math.round(getDistance(me, dMon)) + " → clear");
						Attack.clear(Attack.dangerClearRange());
					}
				}

				this.dangerHit = false;
				this.dangerCheck = !wantTele && !me.inTown;

				moved = wantTele ? this.teleportTo(node.x, node.y) : this.walkTo(node.x, node.y, (fail > 0 || me.inTown) ? 2 : 4);

				this.dangerCheck = false;

				if (!wantTele && this.dangerHit) {
					this.dangerHit = false;
					dMon = Attack.inDanger();

					if (dMon) {
						print("ÿc4Patherÿc0 :: danger " + (dMon.name || "?") + " d=" + Math.round(getDistance(me, dMon)) + " → clear");
					}

					if (Attack.shouldDangerClear() || dMon) {
						Attack.clear(Attack.dangerClearRange() || 12);
					}

					path.unshift(node);
					continue;
				}

				if (moved) {
					if (wantTele) {
						this._lastTeleTick = getTickCount();
					}

					if (!me.inTown) {
						if (this.recursion) {
							this.recursion = false;

							// Always clear nearby during TeleDelay walks so we fight between teles
							NodeAction.go({clearPath: clearPath || (this.useTeleport && !this.canTeleportNow())});

							if (getDistance(me, node.x, node.y) > 5) {
								this.moveTo(node.x, node.y);
							}

							this.recursion = true;
						}

						Misc.townCheck();
					}
				} else {
					if (fail > 0 && !wantTele && !me.inTown) {
						// Don't go berserk on longer paths
						if (!cleared) {
							Attack.clear(Attack.dangerClearRange() || 12);

							cleared = true;
						}

						if (fail > 1 && me.getSkill(143, 1)) {
							Skill.cast(143, 0, node.x, node.y);
						}
					}

					// Retry with current mode (walk while delayed, tele when ready)
					wantTele = this.useTeleport && this.canTeleportNow();
					path = getPath(me.area, x, y, me.x, me.y, wantTele ? 1 : 0, wantTele ? rand(25, 35) : rand(10, 15));
					fail += 1;

					if (!path) {
						throw new Error("moveTo: Failed to generate path.");
					}

					path.reverse();
					pathIsTele = wantTele;
					PathDebug.drawPath(path);

					if (pop) {
						path.pop();
					}

					print("move retry " + fail);

					if (fail > 0 && fail >= retry) {
						break;
					}
				}
			}

			delay(5);
		}

		if (this.useTeleport && Config.TeleSwitch) {
			Precast.weaponSwitch(Misc.oldSwitch);
		}

		PathDebug.removeHooks();

		return getDistance(me, node.x, node.y) < 5;
	},

	/*
		Instant teleport that ignores progressive TeleDelay (Chaos seal pulls, etc.).
		Still waits in-game cast frames inside teleportTo.
	*/
	forceTeleportTo: function (x, y, maxRange) {
		var savedDelay, ok, sk, cdMs;

		if (!this.canTeleport()) {
			return false;
		}

		sk = this.teleSkill();
		cdMs = this.getTeleCooldownMs();

		// Blood Warp: never bypass game cooldown (TeleDelay may be forced to 0)
		if (sk === 367 && cdMs > 0 && this._lastTeleTick &&
				(getTickCount() - this._lastTeleTick) < cdMs) {
			return false;
		}

		savedDelay = (typeof Config !== "undefined") ? Config.TeleDelay : undefined;

		// Only clear bot TeleDelay tick for skill 54 — Blood Warp keeps _lastTeleTick for CD
		if (sk !== 367) {
			this._lastTeleTick = 0;
		}

		if (typeof Config !== "undefined") {
			Config.TeleDelay = 0;
		}

		ok = this.teleportTo(x, y, maxRange);

		if (typeof Config !== "undefined" && savedDelay !== undefined) {
			Config.TeleDelay = savedDelay;
		}

		return ok;
	},

	/*
		Pather.teleportTo(x, y);
		x - the x coord to teleport to
		y - the y coord to teleport to
	*/
	teleportTo: function (x, y, maxRange) {
		var i, tick, sk, startX, startY;

		if (maxRange === undefined) {
			maxRange = 5;
		}

		sk = this.teleSkill();

		if (!sk) {
			return false;
		}

		startX = me.x;
		startY = me.y;

		// In-game cast frames (FCR) — wait out current cast before next Teleport
		tick = getTickCount();

		while ((me.attacking || [4, 9].indexOf(me.mode) > -1) && getTickCount() - tick < 1200) {
			delay(10);
		}

		for (i = 0; i < 3; i += 1) {
			if (Config.PacketCasting) {
				Skill.setSkill(sk, 0);
				Packet.castSkill(0, x, y);
			} else {
				Skill.cast(sk, 0, x, y);
			}

			tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (getDistance(me.x, me.y, x, y) < maxRange) {
					this._lastTeleTick = getTickCount();

					// Finish cast recovery before caller tries another jump
					tick = getTickCount();

					while ((me.attacking || [4, 9].indexOf(me.mode) > -1) && getTickCount() - tick < 1200) {
						delay(10);
					}

					return true;
				}

				delay(10);
			}

			// Cast fired but we did not move (CD / life / reject) — stamp tick and stop retrying
			if (getDistance(me.x, me.y, startX, startY) < 3) {
				this._lastTeleTick = getTickCount();
				return false;
			}
		}

		return false;
	},

	/*
		Pather.walkTo(x, y);
		x - the x coord to walk to
		y - the y coord to walk to
		minDist - minimal distance from x/y before returning true
	*/
	walkTo: function (x, y, minDist) {
		while (!me.gameReady) {
			delay(100);
		}

		if (minDist === undefined) {
			minDist = me.inTown ? 2 : 4;
		}

		var i, angle, angles, nTimer, whereToClick, tick,
			nFail = 0,
			attemptCount = 0,
			lastDangerPoll = 0,
			nearEmpty = false,
			pollMs, dMon;

		// Poll Attack.inDanger on the PollMs cadence (backoff when area is empty).
		// Only active when moveTo set Pather.dangerCheck (direct walkTo from getIntoPosition skips this).
		var pollDanger = function () {
			if (!Pather.dangerCheck || me.inTown || Attack.clearing || !Attack.shouldDangerClear()) {
				return false;
			}

			pollMs = (Config.DangerClear && Config.DangerClear.PollMs) || 250;

			if (nearEmpty) {
				pollMs *= 2;
			}

			if (getTickCount() - lastDangerPoll < pollMs) {
				return false;
			}

			lastDangerPoll = getTickCount();
			dMon = Attack.inDanger();

			if (Attack._dangerCache) {
				nearEmpty = !!Attack._dangerCache.nearEmpty;
			}

			if (dMon) {
				Pather.dangerHit = true;
				Misc.click(0, 0, me.x, me.y); // stop walking

				return true;
			}

			return false;
		};

		// Stamina handler and Charge
		if (!me.inTown && !me.dead) {
			if (me.runwalk === 1 && me.stamina / me.staminamax * 100 <= 20) {
				me.runwalk = 0;
			}

			if (me.runwalk === 0 && me.stamina / me.staminamax * 100 >= 50) {
				me.runwalk = 1;
			}

			if (Config.Charge && me.classid === 3 && me.mp >= 9 && getDistance(me.x, me.y, x, y) > 8 && Skill.setSkill(107, 1)) {
				if (Config.Vigor) {
					Skill.setSkill(115, 0);
				}

				Misc.click(0, 1, x, y);

				while (me.mode !== 1 && me.mode !== 5 && !me.dead) {
					delay(40);
				}
			}
		}

		if (me.inTown && me.runwalk === 0) {
			me.runwalk = 1;
		}

		while (getDistance(me.x, me.y, x, y) > minDist && !me.dead) {
			if (me.classid === 3 && Config.Vigor) {
				Skill.setSkill(115, 0);
			}

			if (this.openDoors(x, y) && getDistance(me.x, me.y, x, y) <= minDist) {
				return true;
			}

			Misc.click(0, 0, x, y);

			attemptCount += 1;
			nTimer = getTickCount();

ModeLoop:
			while (me.mode !== 2 && me.mode !== 3 && me.mode !== 6) {
				if (me.dead) {
					return false;
				}

				if (pollDanger()) {
					return true;
				}

				if ((getTickCount() - nTimer) > 500) {
					nFail += 1;

					if (nFail >= 3) {
						return false;
					}

					angle = Math.atan2(me.y - y, me.x - x);
					angles = [Math.PI / 2, -Math.PI / 2];

					for (i = 0; i < angles.length; i += 1) {
						// TODO: might need rework into getnearestwalkable
						whereToClick = {
							x: Math.round(Math.cos(angle + angles[i]) * 5 + me.x),
							y: Math.round(Math.sin(angle + angles[i]) * 5 + me.y)
						};

						if (Attack.validSpot(whereToClick.x, whereToClick.y)) {
							Misc.click(0, 0, whereToClick.x, whereToClick.y);

							tick = getTickCount();

							while (getDistance(me, whereToClick) > 2 && getTickCount() - tick < 1000) {
								if (pollDanger()) {
									return true;
								}

								delay(40);
							}

							break;
						}
					}

					break ModeLoop;
				}

				delay(10);
			}

			// Wait until we're done walking - idle or dead
			while (getDistance(me.x, me.y, x, y) > minDist && me.mode !== 1 && me.mode !== 5 && !me.dead) {
				if (pollDanger()) {
					return true;
				}

				delay(10);
			}

			if (attemptCount >= 3) {
				return false;
			}
		}

		return !me.dead && getDistance(me.x, me.y, x, y) <= minDist;
	},

	/*
		Pather.openDoors(x, y);
		x - the x coord of the node close to the door
		y - the y coord of the node close to the door
	*/
	openDoors: function (x, y) {
		if (me.inTown) {
			return false;
		}

		// Regular doors
		var i, tick,
			door = getUnit(2, "door", 0);

		if (door) {
			do {
				if ((getDistance(door, x, y) < 4 && getDistance(me, door) < 9) || getDistance(me, door) < 4) {
					for (i = 0; i < 3; i += 1) {
						Misc.click(0, 0, door);
						//door.interact();

						tick = getTickCount();

						while (getTickCount() - tick < 1000) {
							if (door.mode === 2) {
								me.overhead("Opened a door!");

								return true;
							}

							delay(10);
						}
					}
				}
			} while (door.getNext());
		}

		// DO: Monsta doors (Barricaded)

		return false;
	},

	/*
		Pather.moveToUnit(unit, offX, offY, clearPath, pop);
		unit - a valid Unit or PresetUnit object
		offX - offset from unit's x coord
		offY - offset from unit's x coord
		clearPath - kill monsters while moving
		pop - remove last node
	*/
	moveToUnit: function (unit, offX, offY, clearPath, pop) {
		this.useTeleport = this.canTeleport();

		if (offX === undefined) {
			offX = 0;
		}

		if (offY === undefined) {
			offY = 0;
		}

		if (clearPath === undefined) {
			clearPath = false;
		}

		if (pop === undefined) {
			pop = false;
		}

		if (!unit || !unit.hasOwnProperty("x") || !unit.hasOwnProperty("y")) {
			throw new Error("moveToUnit: Invalid unit.");
		}

		if (unit instanceof PresetUnit) {
			return this.moveTo(unit.roomx * 5 + unit.x + offX, unit.roomy * 5 + unit.y + offY, 3, clearPath);
		}

		if (!this.useTeleport) {
			// The unit will most likely be moving so call the first walk with 'pop' parameter
			this.moveTo(unit.x + offX, unit.y + offY, 0, clearPath, true);
		}

		return this.moveTo(unit.x + offX, unit.y + offY, this.useTeleport && unit.type && unit.type === 1 ? 3 : 0, clearPath, pop);
	},

	/*
		Pather.moveToPreset(area, unitType, unitId, offX, offY, clearPath, pop);
		area - area of the preset unit
		unitType - type of the preset unit
		unitId - preset unit id
		offX - offset from unit's x coord
		offY - offset from unit's x coord
		clearPath - kill monsters while moving
		pop - remove last node
	*/
	moveToPreset: function (area, unitType, unitId, offX, offY, clearPath, pop) {
		if (area === undefined || unitType === undefined || unitId === undefined) {
			throw new Error("moveToPreset: Invalid parameters.");
		}

		if (offX === undefined) {
			offX = 0;
		}

		if (offY === undefined) {
			offY = 0;
		}

		if (clearPath === undefined) {
			clearPath = false;
		}

		if (pop === undefined) {
			pop = false;
		}

		var presetUnit;

		try {
			presetUnit = getPresetUnit(area, unitType, unitId);
		} catch (ePreset) {
			print("ÿc8Pather.moveToPresetÿc0 :: getPresetUnit failed area=" + area + " type=" + unitType + " id=" + unitId);

			return false;
		}

		if (!presetUnit) {
			throw new Error("moveToPreset: Couldn't find preset unit - id " + unitId);
		}

		return this.moveTo(presetUnit.roomx * 5 + presetUnit.x + offX, presetUnit.roomy * 5 + presetUnit.y + offY, 3, clearPath, pop);
	},

	/*
		Pather.moveToRakanishu(clearPath, pop);
		Stony Field → Rakanishu pack.
		Vanilla SuperUnique preset = 707. PD2 Stony Field dump uses other ids (1185 unique).
	*/
	moveToRakanishu: function (clearPath, pop) {
		var i, p, presets, counts, id, bestId, bestCount,
			ids = [707, 1185], // vanilla + PD2 dump (1185 appeared once)
			area = me.area;

		if (clearPath === undefined) {
			clearPath = false;
		}

		if (pop === undefined) {
			pop = true;
		}

		if (area !== 4) {
			if (!this.journeyTo(4)) {
				throw new Error("moveToRakanishu: Failed to reach Stony Field");
			}

			area = 4;
		}

		for (i = 0; i < ids.length; i += 1) {
			if (getPresetUnit(area, 1, ids[i])) {
				print("ÿc2Patherÿc0 :: Rakanishu preset id " + ids[i]);

				return this.moveToPreset(area, 1, ids[i], 0, 0, clearPath, pop);
			}
		}

		// Count preset ids — SuperUnique usually appears once; pack ids repeat
		presets = getPresetUnits(area, 1);
		counts = {};

		if (presets) {
			for (i = 0; i < presets.length; i += 1) {
				p = presets[i];

				if (p) {
					id = p.id;
					counts[id] = (counts[id] || 0) + 1;
					print("ÿc4Patherÿc0 :: Stony Field monster preset id " + id);
				}
			}

			bestId = -1;
			bestCount = 999;

			for (id in counts) {
				if (counts.hasOwnProperty(id) && counts[id] < bestCount) {
					bestCount = counts[id];
					bestId = parseInt(id, 10);
				}
			}

			// Prefer a singleton preset (Rakanishu-like)
			if (bestId > 0 && bestCount === 1 && getPresetUnit(area, 1, bestId)) {
				print("ÿc2Patherÿc0 :: Rakanishu using singleton preset id " + bestId);

				return this.moveToPreset(area, 1, bestId, 0, 0, clearPath, pop);
			}
		}

		// Landmark only — Cairn Stones always share Rakanishu's camp (not "Cain stone path")
		if (getPresetUnit(area, 2, 17)) {
			print("ÿc8Patherÿc0 :: No Rakanishu monster preset — pathing to Cairn Stones landmark");

			return this.moveToPreset(area, 2, 17, 0, 0, clearPath, false);
		}

		throw new Error("moveToRakanishu: No Rakanishu preset (tried 707/1185) and no Cairn Stones");
	},

	/*
		Pather.moveToBloodRaven(clearPath, pop);
		Burial Grounds → Blood Raven.
		Preset ids vary: vanilla list 775, many 1.13 scripts use 805 (+30). PD2 may use either.
	*/
	moveToBloodRaven: function (clearPath, pop) {
		var i, p, presets,
			ids = [775, 805],
			area = 17;

		if (clearPath === undefined) {
			clearPath = false;
		}

		if (pop === undefined) {
			pop = true;
		}

		if (me.area !== area) {
			if (!this.journeyTo(area)) {
				throw new Error("moveToBloodRaven: Failed to reach Burial Grounds");
			}
		}

		for (i = 0; i < ids.length; i += 1) {
			if (getPresetUnit(area, 1, ids[i])) {
				print("ÿc2Patherÿc0 :: Blood Raven preset id " + ids[i]);

				return this.moveToPreset(area, 1, ids[i], 0, 0, clearPath, pop);
			}
		}

		presets = getPresetUnits(area, 1);

		if (presets) {
			for (i = 0; i < presets.length; i += 1) {
				p = presets[i];

				if (p) {
					print("ÿc4Patherÿc0 :: Burial Grounds monster preset id " + p.id);
				}
			}

			for (i = 0; i < presets.length; i += 1) {
				p = presets[i];

				if (p && p.id >= 770 && p.id <= 820) {
					print("ÿc2Patherÿc0 :: Blood Raven using scanned preset id " + p.id);

					return this.moveTo(p.roomx * 5 + p.x, p.roomy * 5 + p.y, 3, clearPath, pop);
				}
			}

			if (presets.length > 0) {
				p = presets[0];
				print("ÿc4Patherÿc0 :: Burial Grounds fallback preset id " + p.id);

				return this.moveTo(p.roomx * 5 + p.x, p.roomy * 5 + p.y, 3, clearPath, pop);
			}
		}

		throw new Error("moveToBloodRaven: Couldn't find Blood Raven preset");
	},

	/*
		Pather.moveToExit(targetArea, use, clearPath);
		targetArea - area id or array of area ids to move to
		use - enter target area or last area in the array
		clearPath - kill monsters while moving
	*/
	moveToExit: function (targetArea, use, clearPath) {
		var i, j, area, exits, targetRoom, dest, currExit, tick, foundExit, matches, exitDist, bestDist,
			areas = [];

		if (targetArea instanceof Array) {
			areas = targetArea;
		} else {
			areas.push(targetArea);
		}

		for (i = 0; i < areas.length; i += 1) {
			// Wait for level data — getArea() can native-crash right after WP/area change
			tick = getTickCount();
			area = null;

			while (getTickCount() - tick < 5000) {
				try {
					if (getRoom() && getArea()) {
						area = getArea();
						break;
					}
				} catch (eWait) {}

				delay(100);
			}

			if (!area) {
				try {
					area = getArea();
				} catch (eArea) {
					print("ÿc8Pather.moveToExitÿc0 :: getArea failed in area " + me.area + " :: " + eArea);

					return false;
				}
			}

			if (!area) {
				print("ÿc8Pather.moveToExitÿc0 :: no getArea() in area " + me.area);

				return false;
			}

			exits = area.exits;

			if (!exits || !exits.length) {
				print("ÿc8Pather.moveToExitÿc0 :: no exits listed in area " + me.area + " → " + areas[i]);

				return false;
			}

			foundExit = false;
			matches = [];

			for (j = 0; j < exits.length; j += 1) {
				if (exits[j].target === areas[i]) {
					matches.push({
						x: exits[j].x,
						y: exits[j].y,
						type: exits[j].type,
						target: exits[j].target,
						tileid: exits[j].tileid
					});
				}
			}

			if (matches.length) {
				foundExit = true;

				// Multiple exits lead to the same target area (common in outdoor/jungle areas) —
				// use the nearest one to us, not just the first one listed. Locking onto a far exit
				// when a much closer one exists is a real roundabout-route bug, not a pathing quirk.
				currExit = matches[0];

				if (matches.length > 1) {
					bestDist = getDistance(me, currExit.x, currExit.y);

					for (j = 1; j < matches.length; j += 1) {
						exitDist = getDistance(me, matches[j].x, matches[j].y);

						if (exitDist < bestDist) {
							bestDist = exitDist;
							currExit = matches[j];
						}
					}
				}

				dest = this.getNearestWalkable(currExit.x, currExit.y, 5, 1);

				if (!dest) {
					return false;
				}

				if (!this.moveTo(dest[0], dest[1], 3, clearPath)) {
					return false;
				}

				/* i < areas.length - 1 is for crossing multiple areas.
					In that case we must use the exit before the last area.
				*/
				if (use || i < areas.length - 1) {
					switch (currExit.type) {
					case 1: // walk through
						targetRoom = this.getNearestRoom(areas[i]);

						if (targetRoom) {
							this.moveTo(targetRoom[0], targetRoom[1]);
						} else {
							// might need adjustments
							return false;
						}

						break;
					case 2: // stairs / cave mouth
						if (!this.openExit(areas[i]) && !this.useUnit(5, currExit.tileid, areas[i])) {
							// PD2 Flayer Jungle: fort(53) vs hole(54) — try sibling warp id before fallback
							if ((me.area === 78 && (areas[i] === 86 || areas[i] === 88)) ||
									((me.area === 86 || me.area === 88) && areas[i] === 78)) {
								if (currExit.tileid === 53 && this.useUnit(5, 54, areas[i])) {
									break;
								}

								if (currExit.tileid === 54 && this.useUnit(5, 53, areas[i])) {
									break;
								}
							}

							// PD2 Act 1 caves: LvlWarp 0–5 (cliff/floor in, cave up/down out)
							// getUnit(5, tileid) often fails — try siblings near this exit first
							if (this.tryAct1CaveWarps(areas[i], currExit)) {
								break;
							}

							// PD2: exit tileid often missing as getUnit(5,id) — walk/click warp or coords
							if (!this.useExitFallback(areas[i], currExit)) {
								// Last resort: treat cave mouth as walk-through (UG Passage ↔ Dark Wood etc.)
								if (!this.tryWalkThroughExit(areas[i], currExit)) {
									return false;
								}
							}
						}

						break;
					}
				}
			}

			// use=false used to return true even when no exit matched → stuck in place (Cathedral pack hunt)
			if (!foundExit) {
				print("ÿc8Pather.moveToExitÿc0 :: no exit " + me.area + " → " + areas[i] + " (exits=" + exits.length + ")");

				return false;
			}
		}

		if (use) {
			return typeof targetArea === "object" ? me.area === targetArea[targetArea.length - 1] : me.area === targetArea;
		}

		return true;
	},

	/*
		Pather.getNearestRoom(area);
		area - the id of area to search for the room nearest to the player character
	*/
	getNearestRoom: function (area) {
		var i, x, y, dist, room,
			minDist = 10000;

		for (i = 0; i < 5; i += 1) {
			room = getRoom(area);

			if (room) {
				break;
			}

			delay(200);
		}

		if (!room) {
			return false;
		}

		do {
			dist = getDistance(me, room.x * 5 + room.xsize / 2, room.y * 5 + room.ysize / 2);

			if (dist < minDist) {
				x = room.x * 5 + room.xsize / 2;
				y = room.y * 5 + room.ysize / 2;
				minDist = dist;
			}
		} while (room.getNext());

		room = getRoom(area, x, y);

		if (room) {
			CollMap.addRoom(room);

			return this.getNearestWalkable(x, y, 20, 4);
		}

		return [x, y];
	},

	/*
		Pather.openExit(targetArea);
		targetArea - area id of where the unit leads to
	*/
	openExit: function (targetArea) {
		switch (targetArea) {
		case 47:
			if (me.area === 40 && getDistance(me, 5218, 5180) < 20) {
				break;
			}
		case 65:
			return this.useUnit(2, 74, targetArea);
		case 93:
			return this.useUnit(2, 366, targetArea);
		case 94:
		case 95:
		case 96:
		case 97:
		case 98:
		case 99:
			return this.useUnit(2, "stair", targetArea);
		case 100:
			if (me.area === 101) {
				break;
			}

			return this.useUnit(2, 386, targetArea);
		case 128:
			if (me.area === 129) {
				break;
			}

			return this.useUnit(2, 547, targetArea);
		}

		return false;
	},

	/*
		Pather.openUnit(id);
		type - type of the unit to open
		id - id of the unit to open
	*/
	openUnit: function (type, id) {
		var i, tick, unit, coord;

		for (i = 0; i < 5; i += 1) {
			unit = getUnit(type, id);

			if (unit) {
				break;
			}

			delay(200);
		}

		if (!unit) {
			throw new Error("openUnit: Unit not found. ID: " + unit);
		}

		if (unit.mode != 0) {
			return true;
		}

		for (i = 0; i < 3; i += 1) {
			if (getDistance(me, unit) > 5) {
				this.moveToUnit(unit);
			}

			delay(300);
			sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);

			tick = getTickCount();

			while (getTickCount() - tick < 1500) {
				if (unit.mode != 0) {
					delay(100);

					return true;
				}

				delay(10);
			}

			coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
			this.moveTo(coord.x, coord.y);
		}

		return false;
	},

	/*
		Pather.isAct1CaveArea(area);
		Act 1 wilderness + cave/crypt dungeon ids used by outdoor cave mouths.
	*/
	isAct1CaveArea: function (area) {
		return area >= 2 && area <= 39;
	},

	/*
		Pather.tryAct1CaveWarps(targetArea, exitInfo);
		PD2: Act 1 LvlWarp 0–5 often missing as getUnit(5, exit.tileid).
		UG Passage has two Cave Ups (Stony + Dark Wood) — only click the one near this exit.
	*/
	tryAct1CaveWarps: function (targetArea, exitInfo) {
		var i, unit, best, ids, ax, ay, tick, preArea, d;

		if (!this.isAct1CaveArea(me.area) || !this.isAct1CaveArea(targetArea)) {
			return false;
		}

		preArea = me.area;
		ax = (exitInfo && exitInfo.x) ? exitInfo.x : me.x;
		ay = (exitInfo && exitInfo.y) ? exitInfo.y : me.y;
		ids = [0, 1, 2, 3, 4, 5];

		if (exitInfo && exitInfo.tileid !== undefined && ids.indexOf(exitInfo.tileid) < 0) {
			ids.unshift(exitInfo.tileid);
		}

		best = null;

		for (i = 0; i < ids.length; i += 1) {
			unit = getUnit(5, ids[i]);

			if (!unit) {
				continue;
			}

			do {
				d = getDistance(unit.x, unit.y, ax, ay);

				if (d < 15 && (!best || d < getDistance(best.x, best.y, ax, ay))) {
					best = copyUnit(unit);
				}
			} while (unit.getNext());
		}

		if (!best) {
			return false;
		}

		print("ÿc8Pather.tryAct1CaveWarpsÿc0 :: classid=" + best.classid + " @ " + best.x + "," + best.y + " → " + targetArea);

		if (getDistance(me, best) > 5) {
			this.moveToUnit(best);
		}

		Misc.click(0, 0, best);
		tick = getTickCount();

		while (getTickCount() - tick < 2500) {
			if (me.area === targetArea) {
				delay(100);

				return true;
			}

			if (me.area !== preArea) {
				print("ÿc8Pather.tryAct1CaveWarpsÿc0 :: wrong area " + me.area + " want " + targetArea);
				Town.goToTown();

				return false;
			}

			delay(50);
		}

		return me.area === targetArea;
	},

	/*
		Pather.tryWalkThroughExit(targetArea, exitInfo);
		Stand on cave mouth then path into destination room (type-1 style).
		Fixes PD2 UG Passage / Dark Wood when warp units never appear.
	*/
	tryWalkThroughExit: function (targetArea, exitInfo) {
		var room, preArea = me.area;

		if (exitInfo && exitInfo.x && exitInfo.y) {
			this.moveTo(exitInfo.x, exitInfo.y, 3);
			Misc.click(0, 0, exitInfo.x, exitInfo.y);
			delay(300 + me.ping);

			if (me.area === targetArea) {
				return true;
			}
		}

		room = this.getNearestRoom(targetArea);

		if (!room) {
			return false;
		}

		print("ÿc8Pather.tryWalkThroughExitÿc0 :: " + preArea + " → " + targetArea + " via room");
		this.moveTo(room[0], room[1], 3);

		return me.area === targetArea;
	},

	/*
		Pather.useExitFallback(targetArea, exitInfo);
		When getUnit(5, tileid) fails (common on PD2 Flayer Jungle caves + Act 1 mouths):
		click exit coords, try fort/hole / Act1 cave classids, then nearest type-5 warp.
		Only succeed on targetArea — Flayer Jungle has Swampy Pit(86) + Flayer Dungeon(88).
	*/
	useExitFallback: function (targetArea, exitInfo) {
		var i, j, unit, best, d, tick, preArea, coord, ids, anchorX, anchorY,
			tryClickUnit, waitTarget, leaveWrong;

		preArea = me.area;
		anchorX = (exitInfo && exitInfo.x) ? exitInfo.x : me.x;
		anchorY = (exitInfo && exitInfo.y) ? exitInfo.y : me.y;
		ids = [];

		if (exitInfo && exitInfo.tileid) {
			ids.push(exitInfo.tileid);
		}

		// Act 3 jungle dungeon warps: fort + hole (map layout picks one)
		if (preArea === 78 || targetArea === 78 || targetArea === 86 || targetArea === 88) {
			if (ids.indexOf(53) < 0) {
				ids.push(53);
			}

			if (ids.indexOf(54) < 0) {
				ids.push(54);
			}
		}

		// Act 1 wilderness ↔ cave mouths (UG Passage Level 1 → Dark Wood uses Cave Up id 4)
		if (this.isAct1CaveArea(preArea) || this.isAct1CaveArea(targetArea)) {
			for (i = 0; i <= 5; i += 1) {
				if (ids.indexOf(i) < 0) {
					ids.push(i);
				}
			}
		}

		waitTarget = function () {
			tick = getTickCount();

			while (getTickCount() - tick < 2500) {
				if (me.area === targetArea) {
					delay(100);

					return true;
				}

				if (me.area !== preArea) {
					return false; // wrong exit (e.g. Swampy instead of Flayer)
				}

				delay(50);
			}

			return me.area === targetArea;
		};

		leaveWrong = function () {
			if (me.area === targetArea || me.area === preArea) {
				return me.area === targetArea;
			}

			// Don't recurse through moveToExit — town and retry from WP
			print("ÿc8Pather.useExitFallbackÿc0 :: wrong area " + me.area + " want " + targetArea + " — town");
			Town.goToTown();

			return false;
		};

		tryClickUnit = function (u) {
			if (!u) {
				return false;
			}

			if (getDistance(me, u) > 5) {
				this.moveToUnit(u);
			}

			Misc.click(0, 0, u);

			if (waitTarget()) {
				return true;
			}

			return leaveWrong();
		};

		print("ÿc8Pather.useExitFallbackÿc0 :: area " + preArea + " → " + targetArea + " @ " + anchorX + "," + anchorY);

		if (exitInfo && exitInfo.x && exitInfo.y) {
			this.moveTo(anchorX, anchorY, 3);

			for (i = 0; i < 4; i += 1) {
				// PD2: warp often missing from getUnit — click the exit tile itself
				Misc.click(0, 0, anchorX, anchorY);

				if (waitTarget()) {
					return true;
				}

				if (me.area !== preArea) {
					leaveWrong();
					return false;
				}

				this.moveTo(anchorX + rand(-1, 1), anchorY + rand(-1, 1), 2);
			}
		}

		for (i = 0; i < 6; i += 1) {
			best = null;

			for (j = 0; j < ids.length; j += 1) {
				unit = getUnit(5, ids[j]);

				if (!unit) {
					unit = getUnit(2, ids[j]);
				}

				if (unit && getDistance(me, unit) < 30) {
					best = copyUnit(unit);
					break;
				}
			}

			if (!best) {
				unit = getUnit(5);

				if (unit) {
					do {
						d = getDistance(me, unit);

						if (d < 25 && getDistance(unit.x, unit.y, anchorX, anchorY) < 20 &&
								(!best || d < getDistance(me, best))) {
							best = copyUnit(unit);
						}
					} while (unit.getNext());
				}
			}

			if (tryClickUnit.call(this, best)) {
				return true;
			}

			if (me.inTown || (me.area !== preArea && me.area !== targetArea)) {
				return me.area === targetArea;
			}

			Misc.click(0, 0, anchorX, anchorY);

			if (waitTarget()) {
				return true;
			}

			if (me.area !== preArea) {
				leaveWrong();
				return false;
			}

			coord = CollMap.getRandCoordinate(anchorX, -2, 2, anchorY, -2, 2, 4);

			if (coord) {
				this.moveTo(coord.x, coord.y);
			}

			delay(200);
		}

		print("ÿc8Pather.useExitFallbackÿc0 :: still in " + me.area + " want " + targetArea);

		return me.area === targetArea;
	},

	/*
		Pather.useUnit(type, id, targetArea);
		type - type of the unit to use
		id - id of the unit to use
		targetArea - area id of where the unit leads to
	*/
	useUnit: function (type, id, targetArea) {
		var i, tick, unit, coord, scan, best, d,
			preArea = me.area;

		for (i = 0; i < 5; i += 1) {
			unit = getUnit(type, id);

			if (unit) {
				break;
			}

			delay(200);
		}

		// Prefer nearest match — Act 1 caves share Cave Up (id 4) on multiple exits
		if (unit && typeof id === "number") {
			best = copyUnit(unit);
			scan = getUnit(type, id);

			if (scan) {
				do {
					d = getDistance(me, scan);

					if (d < getDistance(me, best)) {
						best = copyUnit(scan);
					}
				} while (scan.getNext());
			}

			unit = best;
		}

		// PD2: stairs sometimes not returned by getUnit(type, id) — scan and match classid
		if (!unit && typeof id === "number") {
			scan = getUnit(type);

			if (scan) {
				do {
					if (scan.classid === id) {
						if (!unit || getDistance(me, scan) < getDistance(me, unit)) {
							unit = copyUnit(scan);
						}
					}
				} while (scan.getNext());
			}
		}

		if (!unit) {
			print("ÿc8Pather.useUnitÿc0 :: unit not found type=" + type + " id=" + id + " area=" + me.area);

			return false;
		}

		for (i = 0; i < 3; i += 1) {
			if (getDistance(me, unit) > 5) {
				this.moveToUnit(unit);
			}

			if (type === 2 && unit.mode === 0) {
				if ((me.area === 83 && targetArea === 100 && me.getQuest(21, 0) !== 1) || (me.area === 120 && targetArea === 128 && me.getQuest(39, 0) !== 1)) {
					throw new Error("useUnit: Incomplete quest.");
				}

				if (me.area === 92) {
					this.openUnit(2, 367);
				} else {
					this.openUnit(2, id);
				}
			}

			delay(300);

			// Match abroad: type-5 warps click; objects use interact packet
			if (type === 5) {
				Misc.click(0, 0, unit);
			} else {
				sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
			}

			tick = getTickCount();

			while (getTickCount() - tick < 3000) {
				if ((!targetArea && me.area !== preArea) || me.area === targetArea) {
					delay(100);

					return true;
				}

				delay(10);
			}

			coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 3);
			this.moveTo(coord.x, coord.y);
		}

		return targetArea ? me.area === targetArea : me.area !== preArea;
	},

	/*
		Pather.moveTo(targetArea, check);
		targetArea - id of the area to enter
		check - force the waypoint menu
	*/
	useWaypoint: function useWaypoint(targetArea, check) {
		switch (targetArea) {
		case undefined:
			throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
		case null:
		case "random":
			check = true;

			break;
		default:
			if (typeof targetArea !== "number") {
				throw new Error("useWaypoint: Invalid targetArea parameter");
			}

			if (this.wpAreas.indexOf(targetArea) < 0) {
				throw new Error("useWaypoint: Invalid area");
			}

			break;
		}

		var i, tick, wp, coord, retry;

		for (i = 0; i < 12; i += 1) {
			if (me.area === targetArea || me.dead) {
				break;
			}

			if (me.inTown) {
				Town.move("waypoint");
			}

			wp = getUnit(2, "waypoint");

			if (wp && wp.area === me.area) {
				if (!me.inTown && getDistance(me, wp) > 7) {
					this.moveToUnit(wp);
				}

				if (check || Config.WaypointMenu) {
					if (getDistance(me, wp) > 5) {
						this.moveToUnit(wp);
					}

					Misc.click(0, 0, wp);

					tick = getTickCount();

					while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
						if (getUIFlag(0x14)) { // Waypoint screen is open
							delay(500);

							switch (targetArea) {
							case "random":
								while (true) {
									targetArea = this.wpAreas[rand(0, this.wpAreas.length - 1)];

									// get a valid wp, avoid towns
									if ([1, 40, 75, 103, 109].indexOf(targetArea) === -1 && getWaypoint(this.wpAreas.indexOf(targetArea))) {
										break;
									}

									delay(5);
								}

								break;
							case null:
								me.cancel();

								return true;
							}

							if (!getWaypoint(this.wpAreas.indexOf(targetArea))) {
								me.cancel();
								me.overhead("Trying to get the waypoint");

								if (this.getWP(targetArea)) {
									return true;
								}

								throw new Error("Pather.useWaypoint: Failed to go to waypoint");
							}

							break;
						}

						delay(10);
					}

					if (!getUIFlag(0x14)) {
						print("waypoint retry " + (i + 1));
						retry = Math.min(i + 1, 5)
						coord = CollMap.getRandCoordinate(me.x, -5 * retry, 5 * retry, me.y, -5 * retry, 5 * retry);
						this.moveTo(coord.x, coord.y);
						delay(200 + me.ping);

						Packet.flash(me.gid);

						continue;
					}
				}

				if (!check || getUIFlag(0x14)) {
					delay(200);
					wp.interact(targetArea);

					tick = getTickCount();

					while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
						if (me.area === targetArea) {
							delay(100);

							return true;
						}

						delay(10);
					}

					me.cancel(); // In case lag causes the wp menu to stay open
				}

				Packet.flash(me.gid);

				if (i > 1) { // Activate check if we fail direct interact twice
					check = true;
				}
			} else {
				Packet.flash(me.gid);
			}

			delay(200 + me.ping);
		}

		if (me.area === targetArea) {
			return true;
		}

		// Soft fail — Barracks/etc. have no WP; callers should town first
		print("ÿc8Pather.useWaypointÿc0 :: failed area=" + me.area + " → " + targetArea);

		return false;
	},

	_lastPortalGid: null,

	// PD2 often returns blank getParent() on blue TPs
	isOwnPortal: function (portal) {
		var parent;

		if (!portal) {
			return false;
		}

		parent = portal.getParent();

		if (parent === me.name) {
			return true;
		}

		// Remembered gid from our last successful cast (PD2 blank parent)
		if (this._lastPortalGid && portal.gid === this._lastPortalGid) {
			return true;
		}

		return false;
	},

	findOwnPortal: function (maxDist) {
		var portal, best, dist, bestDist;

		if (maxDist === undefined) {
			maxDist = 40;
		}

		best = null;
		bestDist = 999;
		portal = getUnit(2, "portal");

		if (portal) {
			do {
				if (this.isOwnPortal(portal)) {
					dist = getDistance(me, portal);

					if (dist <= maxDist && dist < bestDist) {
						best = copyUnit(portal);
						bestDist = dist;
					}
				}
			} while (portal.getNext());
		}

		return best;
	},

	atLifeChicken: function () {
		return Config.LifeChicken > 0 && me.hpmax > 0 &&
			me.hp <= Math.floor(me.hpmax * Config.LifeChicken / 100);
	},

	/*
		Pather.makePortal(use);
		use - use the portal that was made
	*/
	makePortal: function (use) {
		if (me.inTown) {
			return true;
		}

		// LifeChicken exits the game — never burn TP charges on the way out
		if (this.atLifeChicken() || me.dead) {
			return false;
		}

		var portal, tick, tpTome, tpScroll, oldGids,
			finish = function (unit) {
				this._lastPortalGid = unit.gid;

				if (use) {
					return this.usePortal(null, null, copyUnit(unit));
				}

				return copyUnit(unit);
			};

		finish = finish.bind(this);

		// Reuse first — PD2 blank getParent used to skip this and spam new TPs
		portal = this.findOwnPortal(40);

		if (portal) {
			return finish(portal);
		}

		tpTome = me.findItem("tbk", 0, 3);

		if (tpTome && String(tpTome.code || "").toLowerCase() !== "tbk") {
			tpTome = false;
		}

		if (!tpTome) {
			tpTome = me.findItem(535, 0, 3);

			if (tpTome && String(tpTome.code || "").toLowerCase() !== "tbk") {
				tpTome = false;
			}
		}

		tpScroll = me.findItem("tsc", 0, 3);

		if (tpScroll && String(tpScroll.code || "").toLowerCase() !== "tsc") {
			tpScroll = false;
		}

		if (!tpScroll) {
			tpScroll = me.findItem(546, 0, 3);

			if (tpScroll && String(tpScroll.code || "").toLowerCase() !== "tsc") {
				tpScroll = false;
			}
		}

		// Don't throw — callers (Town.goToTown) can walk instead. Throwing exits the bot.
		if (!tpTome && !tpScroll) {
			print("ÿc8makePortalÿc0 :: No TP tome/scroll — cannot portal");
			return false;
		}

		if (tpTome && !tpTome.getStat(70) && !tpScroll) {
			print("ÿc8makePortalÿc0 :: TP tome empty and no loose scrolls");
			return false;
		}

		if (this.atLifeChicken()) {
			return false;
		}

		oldGids = [];
		portal = getUnit(2, "portal");

		if (portal) {
			do {
				oldGids.push(portal.gid);
			} while (portal.getNext());
		}

		// Single cast only — never retry (retry = multi-TP spam on PD2)
		if (tpTome && tpTome.getStat(70)) {
			tpTome.interact();
		} else if (tpScroll) {
			tpScroll.interact();
		} else {
			return false;
		}

		tick = getTickCount();

		while (getTickCount() - tick < Math.max(1200, me.ping * 3 + 400)) {
			if (this.atLifeChicken() || me.dead) {
				return false;
			}

			portal = getUnit(2, "portal");

			if (portal) {
				do {
					if (oldGids.indexOf(portal.gid) === -1 && getDistance(me, portal) <= 40) {
						return finish(portal);
					}
				} while (portal.getNext());
			}

			delay(10);
		}

		// Portal may exist but wait raced — accept any new nearby portal once
		portal = getUnit(2, "portal");

		if (portal) {
			do {
				if (oldGids.indexOf(portal.gid) === -1 && getDistance(me, portal) <= 40) {
					return finish(portal);
				}
			} while (portal.getNext());
		}

		print("ÿc8makePortalÿc0 :: portal cast but not found nearby");

		return false;
	},

	/*
		Pather.usePortal(targetArea, owner, unit);
		targetArea - id of the area the portal leads to
		owner - name of the portal's owner
		unit - use existing portal unit
	*/
	usePortal: function (targetArea, owner, unit) {
		if (targetArea && me.area === targetArea) {
			return true;
		}

		me.cancel();

		var i, tick, portal,
			preArea = me.area;

		for (i = 0; i < 10; i += 1) {
			if (me.dead) {
				break;
			}

			if (i > 0 && owner && me.inTown) {
				Town.move("portalspot");
			}

			portal = unit ? copyUnit(unit) : this.getPortal(targetArea, owner);

			if (portal) {
				if (portal.area === me.area) {
					if (getDistance(me, portal) > 5) {
						this.moveToUnit(portal);
					}

					if (i < 2) {
						sendPacket(1, 0x13, 4, 0x2, 4, portal.gid);
					} else {
						Misc.click(0, 0, portal);
					}
				}

				if (portal.classid === 298 && portal.mode !== 2) { // Portal to/from Arcane
					Misc.click(0, 0, portal);

					tick = getTickCount();

					while (getTickCount() - tick < 2000) {
						if (portal.mode === 2 || me.area === 74) {
							break;
						}

						delay(10);
					}
				}

				tick = getTickCount();

				while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
					if (me.area !== preArea) {
						delay(100);

						return true;
					}

					delay(10);
				}

				if (i > 1) {
					Packet.flash(me.gid);
				}
			} else {
				Packet.flash(me.gid);
			}

			delay(200 + me.ping);
		}

		return targetArea ? me.area === targetArea : me.area !== preArea;
	},

	/*
		Pather.getPortal(targetArea, owner, unit);
		targetArea - id of the area the portal leads to
		owner - name of the portal's owner
	*/
	getPortal: function (targetArea, owner) {
		var portal = getUnit(2, "portal"),
			parent;

		if (portal) {
			do {
				if (typeof targetArea !== "number" || portal.objtype === targetArea) {
					parent = portal.getParent();

					switch (owner) {
					case undefined: // Pather.usePortal(area) - red portal
						if (!parent) {
							return copyUnit(portal);
						}

						break;
					case null: // Pather.usePortal(area, null) - any blue portal leading to area
						if (parent === me.name || Misc.inMyParty(parent) ||
								(!parent && me.inTown)) { // PD2 blank parent in town
							return copyUnit(portal);
						}

						break;
					default: // owner name — PD2 blank getParent still match "my" portals
						if (parent === owner && (owner === me.name || Misc.inMyParty(owner))) {
							return copyUnit(portal);
						}

						if (owner === me.name && (!parent || parent === "")) {
							return copyUnit(portal);
						}

						break;
					}
				}
			} while (portal.getNext());
		}

		return false;
	},

	/*
		Pather.moveTo(x, y, range, step, coll);
		x - the starting x coord
		y - the starting y coord
		range - maximum allowed range from the starting coords
		step - distance between each checked dot on the grid
		coll - collision flag to avoid
	*/
	getNearestWalkable: function (x, y, range, step, coll, size) {
		if (!step) {
			step = 1;
		}

		if (coll === undefined) {
			coll = 0x1;
		}

		var i, j,
			distance = 1,
			result = false;

		// Check if the original spot is valid
		if (this.checkSpot(x, y, coll, false, size)) {
			result = [x, y];
		}

MainLoop:
		while (!result && distance < range) {
			for (i = -distance; i <= distance; i += 1) {
				for (j = -distance; j <= distance; j += 1) {
					// Check outer layer only (skip previously checked)
					if (Math.abs(i) >= Math.abs(distance) || Math.abs(j) >= Math.abs(distance)) {
						if (this.checkSpot(x + i, y + j, coll, false, size)) {
							result = [x + i, y + j];

							break MainLoop;
						}
					}
				}
			}

			distance += step;
		}

		CollMap.reset();

		return result;
	},

	/*
		Pather.moveTo(x, y, coll, cacheOnly);
		x - the x coord to check
		y - the y coord to check
		coll - collision flag to search for
		cacheOnly - use only cached room data
	*/
	checkSpot: function (x, y, coll, cacheOnly, size) {
		var dx, dy, value;

		if (coll === undefined) {
			coll = 0x1;
		}

		if (!size) {
			size = 1;
		}

		for (dx = -size; dx <= size; dx += 1) {
			for (dy = -size; dy <= size; dy += 1) {
				if (Math.abs(dx) !== Math.abs(dy)) {
					value = CollMap.getColl(x + dx, y + dy, cacheOnly);

					if (value & coll) {
						return false;
					}
				}
			}
		}

		return true;
	},

	/*
		Pather.accessToAct(act);
		act - the act number to check for access
		PD2 quest bits can be flaky — also trust me.act / town WP when already there.
	*/
	accessToAct: function (act) {
		var towns = [1, 40, 75, 103, 109],
			townArea, wpIdx;

		switch (act) {
		case 1:
			return true;
		case 2:
		case 3:
		case 4:
		case 5:
			if (me.act >= act) {
				return true;
			}

			townArea = towns[act - 1];
			wpIdx = this.wpAreas.indexOf(townArea);

			if (wpIdx > -1 && getWaypoint(wpIdx)) {
				return true;
			}

			// Quest "able to go to Act N" — check state 0 and 1 (PD2 flaky)
			if (act === 2) {
				return !!(me.getQuest(7, 0) || me.getQuest(7, 1));
			}

			if (act === 3) {
				return !!(me.getQuest(15, 0) || me.getQuest(15, 1));
			}

			if (act === 4) {
				return !!(me.getQuest(23, 0) || me.getQuest(23, 1));
			}

			return !!(me.getQuest(28, 0) || me.getQuest(28, 1));
		default:
			return false;
		}
	},

	/*
		Pather.getWP(area);
		area - the id of area to get the waypoint in
		clearPath - clear path
	*/
	getWP: function (area, clearPath) {
		var i, j, wp, preset, tick, obj, seenIds,
			wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

		if (area !== me.area) {
			if (!this.journeyTo(area) || me.area !== area) {
				print("ÿc8Pather.getWPÿc0 :: failed to reach area " + area + " (still " + me.area + ")");

				return false;
			}
		}

		// Wait until level data is accessible (avoids getPresetUnits native throw)
		tick = getTickCount();

		while (getTickCount() - tick < 3000) {
			try {
				if (getRoom() && getArea()) {
					break;
				}
			} catch (eWait) {}

			delay(100);
		}

		for (i = 0; i < wpIDs.length; i += 1) {
			try {
				preset = getPresetUnit(me.area, 2, wpIDs[i]);
			} catch (ePreset) {
				print("ÿc8Pather.getWPÿc0 :: getPresetUnit failed area=" + me.area + " id=" + wpIDs[i]);
				preset = null;
			}

			if (preset) {
				this.moveToUnit(preset, 0, 0, clearPath);

				wp = getUnit(2, "waypoint");

				if (wp) {
					for (j = 0; j < 10; j += 1) {
						Misc.click(0, 0, wp);
						//wp.interact();

						if (getUIFlag(0x14)) {
							delay(500);
							me.cancel();

							if (typeof CompLog !== "undefined") {
								CompLog.onWaypoint(me.area);
							}

							return true;
						}

						delay(500);
					}
				}
			}
		}

		// Fallback: none of the 16 known preset ids (or the "waypoint" name match) hit —
		// happens when this area's WP object uses a different id/name (e.g. modded level).
		// Blind-interact every nearby object and watch for the WP menu (UI flag 0x14) to open.
		seenIds = [];
		obj = getUnit(2);

		if (obj) {
			do {
				if (seenIds.indexOf(obj.id) < 0) {
					seenIds.push(obj.id);
				}

				if (getDistance(me, obj) <= 15) {
					for (j = 0; j < 5; j += 1) {
						if (getDistance(me, obj) > 5) {
							this.moveToUnit(obj, 0, 0, clearPath);
						}

						Misc.click(0, 0, obj);

						if (getUIFlag(0x14)) {
							delay(500);
							me.cancel();

							if (typeof CompLog !== "undefined") {
								CompLog.onWaypoint(me.area);
							}

							print("ÿc8Pather.getWPÿc0 :: WP found via blind object scan — id " + obj.id +
								" in area " + me.area + " (add this id to getWP's wpIDs list)");

							return true;
						}

						delay(500);
					}
				}
			} while (obj.getNext());
		}

		print("ÿc8Pather.getWPÿc0 :: no WP found in area " + me.area + " — nearby object ids: " + seenIds.join(","));

		return false;
	},

	/*
		Pather.journeyTo(area);
		area - the id of area to move to
	*/
	journeyTo: function (area) {
		var i, special, unit, tick, target;

		target = this.plotCourse(area, me.area);

		print(target.course);

		if (target.useWP) {
			Town.goToTown();
		}

		// handle variable flayer jungle entrances
		if (target.course.indexOf(78) > -1) {
			Town.goToTown(3); // without initiated act, getArea().exits will crash

			try {
				special = getArea(78);
			} catch (eFlayer) {
				print("ÿc8Pather.journeyToÿc0 :: getArea(78) failed :: " + eFlayer);
				special = null;
			}

			if (special) {
				special = special.exits;

				if (special) {
					for (i = 0; i < special.length; i += 1) {
						if (special[i].target === 77) {
							target.course.splice(target.course.indexOf(78), 0, 77); // add great marsh if needed

							break;
						}
					}
				}
			}
		}

		while (target.course.length) {
			if (!me.inTown) {
				Precast.doPrecast(false);
			}

			if (this.wpAreas.indexOf(me.area) > -1 && !getWaypoint(this.wpAreas.indexOf(me.area))) {
				this.getWP(me.area);
			}

			if (me.inTown && this.wpAreas.indexOf(target.course[0]) > -1 && getWaypoint(this.wpAreas.indexOf(target.course[0]))) {
				this.useWaypoint(target.course[0], !this.plotCourse_openedWpMenu);
				Precast.doPrecast(false);
			} else if (me.area === 109 && target.course[0] === 110) { // Harrogath -> Bloody Foothills
				this.moveTo(5026, 5095);

				unit = getUnit(2, 449); // Gate

				if (unit) {
					for (i = 0; i < 3; i += 1) {
						Misc.click(0, 0, unit);
						//unit.interact();

						tick = getTickCount();

						while (getTickCount() - tick < 3000) {
							if (unit.mode === 2) {
								delay(1000);

								break;
							}

							delay(10);
						}
					}
				}

				this.moveToExit(target.course[0], true);
			} else if (me.area === 4 && target.course[0] === 38) { // Stony Field -> Tristram
				this.moveToRakanishu(false, true);

				for (i = 0; i < 5; i += 1) {
					if (this.usePortal(38)) {
						break;
					}

					delay(1000);
				}
			} else if (me.area === 40 && target.course[0] === 47) { // Lut Gholein -> Sewers Level 1 (use Trapdoor)
				this.moveToPreset(me.area, 5, 19);
				this.useUnit(2, 74, 47);
			} else if (me.area === 74 && target.course[0] === 46) { // Arcane Sanctuary -> Canyon of the Magi
				this.moveToPreset(me.area, 2, 357);

				for (i = 0; i < 5; i += 1) {
					unit = getUnit(2, 357);

					Misc.click(0, 0, unit);
					delay(1000);
					me.cancel();

					if (this.usePortal(46)) {
						break;
					}
				}
			} else if (me.area === 54 && target.course[0] === 74) { // Palace -> Arcane
				this.moveTo(10073, 8670);
				this.usePortal(null);
			} else if (me.area === 109 && target.course[0] === 121) { // Harrogath -> Nihlathak's Temple
				Town.move(NPC.Anya);
				this.usePortal(121);
			} else if (me.area === 111 && target.course[0] === 125) { // Abaddon
				this.moveToPreset(111, 2, 60);
				this.usePortal(125);
			} else if (me.area === 112 && target.course[0] === 126) { // Pits of Archeon
				this.moveToPreset(112, 2, 60);
				this.usePortal(126);
			} else if (me.area === 117 && target.course[0] === 127) { // Infernal Pit
				this.moveToPreset(117, 2, 60);
				this.usePortal(127);
			} else {
				this.moveToExit(target.course[0], true);
			}

			target.course.shift();
		}

		return me.area === area;
	},

	plotCourse_openedWpMenu: false,

	/*
		Pather.plotCourse(dest, src);
		dest - destination area id
		src - starting area id
	*/
	plotCourse: function (dest, src) {
		var node, prevArea,
			useWP = false,
			arr = [],
			previousAreas = [0, 0, 1, 2, 3, 10, 5, 6, 2, 3, 4, 6, 7, 9, 10, 11, 12, 3, 17, 17, 6, 20, 21, 22, 23, 24, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 4, 1, 1, 40, 41, 42, 43, 44, 74, 40, 47, 48, 40, 50, 51, 52, 53, 41, 42, 56, 45, 55, 57, 58, 43, 62, 63, 44, 46, 46, 46, 46, 46, 46, 46, 1, 54, 1, 75, 76, 76, 78, 79, 80, 81, 82, 76, 76, 78, 86, 78, 88, 87, 89, 80, 92, 80, 80, 81, 81, 82, 82, 83, 100, 101, 1, 103, 104, 105, 106, 107, 1, 109, 110, 111, 112, 113, 113, 115, 115, 117, 118, 118, 109, 121, 122, 123, 111, 112, 117, 120, 128, 129, 130, 131, 109, 109, 109, 109],
			visitedNodes = [],
			toVisitNodes = [{from: dest, to: null}];

		if (!src) {
			src = me.area;
		}

		if (!this.plotCourse_openedWpMenu && me.inTown && Pather.useWaypoint(null)) {
			this.plotCourse_openedWpMenu = true;
		}

		while (toVisitNodes.length > 0) {
			node = toVisitNodes[0];

			// If we've already visited it, just move on
			if (visitedNodes[node.from] === undefined) {
				visitedNodes[node.from] = node.to;

				if (this.areasConnected(node.from, node.to)) {
					// If we have this wp we can start from there
					if ((me.inTown || // check wp in town
							((src !== previousAreas[dest] && dest !== previousAreas[src]) && // check wp if areas aren't linked
								previousAreas[src] !== previousAreas[dest])) && // check wp if areas aren't linked with a common area
								Pather.wpAreas.indexOf(node.from) > 0 && getWaypoint(Pather.wpAreas.indexOf(node.from))
							) {
						if (node.from !== src) {
							useWP = true;
						}

						src = node.from;
					}

					// We found it, time to go
					if (node.from === src) {
						break;
					}

					if ((prevArea = previousAreas[node.from]) !== 0 && visitedNodes.indexOf(prevArea) === -1) {
						toVisitNodes.push({from: prevArea, to: node.from});
					}

					for (prevArea = 1; prevArea < previousAreas.length; prevArea += 1) {
						// Only interested in those connected to node
						if (previousAreas[prevArea] === node.from && visitedNodes.indexOf(prevArea) === -1) {
							toVisitNodes.push({from: prevArea, to: node.from});
						}
					}
				}

				toVisitNodes.shift();
			} else {
				useWP = true;
			}
		}

		arr.push(src);

		node = src;

		while (node !== dest && node !== undefined) {
			arr.push(node = visitedNodes[node]);
		}

		// Something failed
		if (node === undefined) {
			return false;
		}

		return {course: arr, useWP: useWP};
	},

	/*
		Pather.areasConnected(src, dest);
		dest - destination area id
		src - starting area id
	*/
	areasConnected: function (src, dest) {
		if (src === 46 && dest === 74) {
			return false;
		}

		return true;
	},

	/*
		Pather.getAreaName(area);
		area - id of the area to get the name for
	*/
	getAreaName: function (area) {
		var areas = [
			"None",
			"Rogue Encampment",
			"Blood Moor",
			"Cold Plains",
			"Stony Field",
			"Dark Wood",
			"Black Marsh",
			"Tamoe Highland",
			"Den Of Evil",
			"Cave Level 1",
			"Underground Passage Level 1",
			"Hole Level 1",
			"Pit Level 1",
			"Cave Level 2",
			"Underground Passage Level 2",
			"Hole Level 2",
			"Pit Level 2",
			"Burial Grounds",
			"Crypt",
			"Mausoleum",
			"Forgotten Tower",
			"Tower Cellar Level 1",
			"Tower Cellar Level 2",
			"Tower Cellar Level 3",
			"Tower Cellar Level 4",
			"Tower Cellar Level 5",
			"Monastery Gate",
			"Outer Cloister",
			"Barracks",
			"Jail Level 1",
			"Jail Level 2",
			"Jail Level 3",
			"Inner Cloister",
			"Cathedral",
			"Catacombs Level 1",
			"Catacombs Level 2",
			"Catacombs Level 3",
			"Catacombs Level 4",
			"Tristram",
			"Moo Moo Farm",
			"Lut Gholein",
			"Rocky Waste",
			"Dry Hills",
			"Far Oasis",
			"Lost City",
			"Valley Of Snakes",
			"Canyon Of The Magi",
			"Sewers Level 1",
			"Sewers Level 2",
			"Sewers Level 3",
			"Harem Level 1",
			"Harem Level 2",
			"Palace Cellar Level 1",
			"Palace Cellar Level 2",
			"Palace Cellar Level 3",
			"Stony Tomb Level 1",
			"Halls Of The Dead Level 1",
			"Halls Of The Dead Level 2",
			"Claw Viper Temple Level 1",
			"Stony Tomb Level 2",
			"Halls Of The Dead Level 3",
			"Claw Viper Temple Level 2",
			"Maggot Lair Level 1",
			"Maggot Lair Level 2",
			"Maggot Lair Level 3",
			"Ancient Tunnels",
			"Tal Rashas Tomb #1",
			"Tal Rashas Tomb #2",
			"Tal Rashas Tomb #3",
			"Tal Rashas Tomb #4",
			"Tal Rashas Tomb #5",
			"Tal Rashas Tomb #6",
			"Tal Rashas Tomb #7",
			"Duriels Lair",
			"Arcane Sanctuary",
			"Kurast Docktown",
			"Spider Forest",
			"Great Marsh",
			"Flayer Jungle",
			"Lower Kurast",
			"Kurast Bazaar",
			"Upper Kurast",
			"Kurast Causeway",
			"Travincal",
			"Spider Cave",
			"Spider Cavern",
			"Swampy Pit Level 1",
			"Swampy Pit Level 2",
			"Flayer Dungeon Level 1",
			"Flayer Dungeon Level 2",
			"Swampy Pit Level 3",
			"Flayer Dungeon Level 3",
			"Sewers Level 1",
			"Sewers Level 2",
			"Ruined Temple",
			"Disused Fane",
			"Forgotten Reliquary",
			"Forgotten Temple",
			"Ruined Fane",
			"Disused Reliquary",
			"Durance Of Hate Level 1",
			"Durance Of Hate Level 2",
			"Durance Of Hate Level 3",
			"The Pandemonium Fortress",
			"Outer Steppes",
			"Plains Of Despair",
			"City Of The Damned",
			"River Of Flame",
			"Chaos Sanctuary",
			"Harrogath",
			"Bloody Foothills",
			"Frigid Highlands",
			"Arreat Plateau",
			"Crystalline Passage",
			"Frozen River",
			"Glacial Trail",
			"Drifter Cavern",
			"Frozen Tundra",
			"Ancient's Way",
			"Icy Cellar",
			"Arreat Summit",
			"Nihlathak's Temple",
			"Halls Of Anguish",
			"Halls Of Pain",
			"Halls Of Vaught",
			"Abaddon",
			"Pit Of Acheron",
			"Infernal Pit",
			"Worldstone Keep Level 1",
			"Worldstone Keep Level 2",
			"Worldstone Keep Level 3",
			"Throne Of Destruction",
			"The Worldstone Chamber",
			"Matron's Den",
			"Fogotten Sands",
			"Furnace of Pain",
			"Tristram"];

		return areas[area];
	}
};