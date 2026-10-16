/**
*	@filename	Diablo.js
*	@author		kolton
*	@desc		clear Chaos Sanctuary and kill Diablo
*/

function Diablo() {
	// Sort function
	this.sort = function (a, b) {
		if (Config.BossPriority) {
			if ((a.spectype & 0x5) && (b.spectype & 0x5)) {
				return getDistance(me, a) - getDistance(me, b);
			}

			if (a.spectype & 0x5) {
				return -1;
			}

			if (b.spectype & 0x5) {
				return 1;
			}
		}

		// Entrance to Star / De Seis
		if (me.y > 5325 || me.y < 5260) {
			if (a.y > b.y) {
				return -1;
			}

			return 1;
		}

		// Vizier
		if (me.x < 7765) {
			if (a.x > b.x) {
				return -1;
			}

			return 1;
		}

		// Infector
		if (me.x > 7825) {
			if (!checkCollision(me, a, 0x1) && a.x < b.x) {
				return -1;
			}

			return 1;
		}

		return getDistance(me, a) - getDistance(me, b);
	};

	// general functions
	this.getLayout = function (seal, value) {
		var sealPreset = getPresetUnit(108, 2, seal);

		if (!seal) {
			throw new Error("Seal preset not found. Can't continue.");
		}

		if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
			return 1;
		}

		return 2;
	};

	this.initLayout = function () {
		this.vizLayout = this.getLayout(396, 5275);
		this.seisLayout = this.getLayout(394, 7773);
		this.infLayout = this.getLayout(392, 7893);
	};

	this.openSeal = function (classid) {
		var i, seal, warn;

		switch (classid) {
		case 396:
		case 394:
		case 392:
			warn = true;

			break;
		default:
			warn = false;

			break;
		}

		for (i = 0; i < 5; i += 1) {
			Pather.moveToPreset(108, 2, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);

			seal = getUnit(2, classid);

			if (!seal) {
				return false;
			}

			if (seal.mode) { // for pubbies
				if (warn) {
					say(Config.Diablo.SealWarning);
				}

				return true;
			}

			warn = false;

			if (classid === 394) {
				Misc.click(0, 0, seal);
			} else {
				seal.interact();
			}

			delay(classid === 394 ? 1000 : 500);

			if (!seal.mode) {
				// De Seis: never walk into nest — reclick only
				if (classid === 394) {
					delay(300);
				} else {
					Pather.moveTo(seal.x - 5, seal.y - 5);
					delay(500);
				}
			} else {
				return true;
			}
		}

		return false;
	};

	// Cast THIS char's configured attack at a spot — never a hardcoded skill
	this.castOwnAttack = function (x, y) {
		var k, sk, list = [Config.AttackSkill[1], Config.AttackSkill[2]];

		for (k = 0; k < list.length; k += 1) {
			sk = list[k];

			if (!sk || sk <= 0 || !Attack.canUseSkill(sk)) {
				continue;
			}

			if (Skill.isTimed(sk) && me.getState(121)) {
				continue;
			}

			return Skill.cast(sk, Skill.getHand(sk), x, y);
		}

		return false;
	};

	// True if a living seal boss with this name is still in the area
	this.sealBossAlive = function (name) {
		var u = getUnit(1, name);

		if (u) {
			do {
				if (Attack.checkMonster(u)) {
					return true;
				}
			} while (u.getNext());
		}

		return false;
	};

	this.chaosPreattack = function (name, amount) {
		var i, n, target, positions;

		switch (me.classid) {
		case 0:
			break;
		case 1:
			break;
		case 2:
			break;
		case 3:
			target = getUnit(1, name);

			if (!target) {
				return;
			}

			positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];

			for (i = 0; i < positions.length; i += 1) {
				if (Attack.validSpot(target.x + positions[i][0], target.y + positions[i][1])) { // check if we can move there
					Pather.moveTo(target.x + positions[i][0], target.y + positions[i][1]);
					Skill.setSkill(Config.AttackSkill[2], 0);

					for (n = 0; n < amount; n += 1) {
						Skill.cast(Config.AttackSkill[1], 1);
					}

					break;
				}
			}

			break;
		case 4:
			break;
		case 5:
			break;
		case 6:
			break;
		}
	};

	this.getBoss = function (name, pullFight, holdX, holdY, baitX, baitY) {
		var i, boss, dist, waitTicks, engageDist, glow, mon, best, bestD, d,
			idle, farIdle, outRange, engaged, sawBoss, baitPulses, deadPulses, giveUpDead, self = this;

		glow = getUnit(2, 131);
		waitTicks = pullFight ? 72 : 16;
		engageDist = pullFight ? 34 : 40;
		idle = 0;
		farIdle = 0;
		outRange = 0;
		engaged = false;
		sawBoss = false;
		baitPulses = 0;
		deadPulses = 0;
		giveUpDead = false;

		// Never personally saw the boss or any leftover pack after a bait pulse — he may
		// already be dead (killed by a teammate, or this is a script-restart mid-Chaos-Sanctuary).
		// Bail out after a couple of fruitless pulses instead of grinding the full wait budget.
		// Boss corpse present — he's already dead. getUnit(1, name) still returns the corpse,
		// Attack.checkMonster() rejects it, and without this the loop reads that as
		// "not spawned yet" and pulses forever.
		function bossCorpse() {
			var u = getUnit(1, name);

			if (u) {
				do {
					if (u.mode === 12 || u.hp <= 0) {
						return true;
					}
				} while (u.getNext());
			}

			return false;
		}

		function releaseHold() {
			snapHold();

			if (typeof ClassAttack !== "undefined") {
				ClassAttack._sealHoldX = undefined;
				ClassAttack._sealHoldY = undefined;
			}
		}

		function checkAlreadyDead() {
			if (bossCorpse()) {
				if (typeof self.status === "function") {
					self.status(name + " — corpse found, already dead");
				} else {
					print(name + " — corpse found, already dead");
				}

				return true;
			}

			if (sawBoss || engaged) {
				deadPulses = 0;
				return false;
			}

			if (packNear(25)) {
				deadPulses = 0;
				return false;
			}

			deadPulses += 1;

			if (deadPulses >= 2) {
				if (typeof self.status === "function") {
					self.status(name + " — not found after pulls, assuming already dead");
				} else {
					print(name + " — not found after pulls, assuming already dead");
				}

				return true;
			}

			return false;
		}

		function snapHold() {
			if (holdX === undefined || holdY === undefined) {
				return;
			}

			if (getDistance(me, holdX, holdY) > 5) {
				if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
					Pather.forceTeleportTo(holdX, holdY, 4);
				} else {
					Pather.teleport = true;
					Pather._lastTeleTick = 0;
					Pather.moveTo(holdX, holdY, 3);
				}
			}
		}

		function packNear(range) {
			mon = getUnit(1);

			if (mon) {
				do {
					if (Attack.checkMonster(mon) && getDistance(me, mon) <= range) {
						return true;
					}
				} while (mon.getNext());
			}

			return false;
		}

		function holdCast(range) {
			snapHold();
			best = null;
			bestD = 999;
			mon = getUnit(1);

			if (mon) {
				do {
					if (Attack.checkMonster(mon)) {
						d = getDistance(me, mon);

						if (d <= range && d < bestD) {
							best = copyUnit(mon);
							bestD = d;
						}
					}
				} while (mon.getNext());
			}

			if (best) {
				engaged = true;
				ClassAttack.doAttack(best, false);
			}

			snapHold();
		}

		// TP to bait for LOS/aggro, cast, snap back — never walk
		function pulseAggro() {
			var bx, by;

			bx = (baitX !== undefined) ? baitX : holdX;
			by = (baitY !== undefined) ? baitY : (holdY - 8);

			if (bx === undefined || by === undefined) {
				return;
			}

			baitPulses += 1;
			print("Seal pull — re-aggro pulse @ " + bx + "," + by);

			if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
				Pather.forceTeleportTo(bx, by, 4);
			} else {
				Pather.teleport = true;
				Pather._lastTeleTick = 0;
				Pather.moveTo(bx, by, 3);
			}

			delay(180 + me.ping);
			self.castOwnAttack(bx, by - 4);
			delay(120 + me.ping);
			snapHold();
		}

		// Only bait if nothing is already coming toward the hold
		function needAggro() {
			boss = getUnit(1, name);

			if (boss && Attack.checkMonster(boss) && getDistance(me, boss) <= engageDist) {
				return false;
			}

			if (packNear(22)) {
				return false;
			}

			return true;
		}

		function doAggro() {
			if (!needAggro()) {
				engaged = true;
				return;
			}

			pulseAggro();
		}

		// This char's cast range — clamped 4..20
		function ownRange() {
			var sk, r;

			sk = Config.AttackSkill[1] > 0 ? Config.AttackSkill[1] : Config.AttackSkill[2];

			if (!sk || sk <= 0) {
				return 6;
			}

			r = (typeof ClassAttack !== "undefined" && typeof ClassAttack.castRangeFor === "function") ? ClassAttack.castRangeFor(sk) : Skill.getRange(sk);

			return Math.max(4, Math.min(r || 6, 20));
		}

		// Boss visible but outside OUR cast range / LOS — TP to a spot at cast range, re-anchor hold there
		function approachBoss(unit) {
			var r, d, tx, ty, k, cand;

			if (!unit || !Attack.checkMonster(unit)) {
				return false;
			}

			r = Math.max(3, ownRange() - 1);
			d = getDistance(me, unit);

			if (d <= r && !checkCollision(me, unit, 0x4)) {
				return false;
			}

			cand = [
				[unit.x + (me.x - unit.x) * r / Math.max(d, 1), unit.y + (me.y - unit.y) * r / Math.max(d, 1)],
				[unit.x, unit.y + r],
				[unit.x - r, unit.y],
				[unit.x + r, unit.y],
				[unit.x, unit.y - r]
			];

			tx = undefined;

			for (k = 0; k < cand.length; k += 1) {
				if (Attack.validSpot(Math.round(cand[k][0]), Math.round(cand[k][1]))) {
					tx = Math.round(cand[k][0]);
					ty = Math.round(cand[k][1]);
					break;
				}
			}

			if (tx === undefined) {
				return false;
			}

			print("Seal pull — approach boss @ " + tx + "," + ty + " (range " + r + ")");

			if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
				Pather.forceTeleportTo(tx, ty, 4);
			} else {
				Pather.teleport = true;
				Pather._lastTeleTick = 0;
				Pather.moveTo(tx, ty, 3);
			}

			delay(150 + me.ping);
			holdX = me.x;
			holdY = me.y;

			if (typeof ClassAttack !== "undefined") {
				ClassAttack._sealHoldX = holdX;
				ClassAttack._sealHoldY = holdY;
			}

			engaged = true;
			sawBoss = true;

			return true;
		}

		function tpToBoss(unit) {
			var tx, ty;

			if (!unit || !Attack.checkMonster(unit)) {
				return false;
			}

			if (typeof ClassAttack !== "undefined") {
				ClassAttack._sealHoldX = undefined;
				ClassAttack._sealHoldY = undefined;
			}

			tx = Math.round(unit.x);
			ty = Math.round(unit.y + 6);

			if (!Attack.validSpot(tx, ty)) {
				tx = Math.round(unit.x);
				ty = Math.round(unit.y);
			}

			print("Seal pull — TP to boss @ " + tx + "," + ty);

			if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
				Pather.forceTeleportTo(tx, ty, 4);
			} else {
				Pather.teleport = true;
				Pather._lastTeleTick = 0;
				Pather.moveTo(tx, ty, 3);
			}

			delay(200 + me.ping);
			holdX = me.x;
			holdY = me.y;

			if (typeof ClassAttack !== "undefined") {
				ClassAttack._sealHoldX = holdX;
				ClassAttack._sealHoldY = holdY;
			}

			if (Attack.checkMonster(unit)) {
				self.castOwnAttack(unit.x, unit.y);
			}

			engaged = true;
			sawBoss = true;
			idle = 0;
			farIdle = 0;
			baitPulses = 0;

			return true;
		}

		if (pullFight) {
			if (typeof ClassAttack !== "undefined") {
				ClassAttack._sealHoldX = holdX;
				ClassAttack._sealHoldY = holdY;
			}

			snapHold();

			// Already dead before we even start (teammate / script restart) — skip the whole pull
			if (bossCorpse()) {
				if (typeof self.status === "function") {
					self.status(name + " — corpse found, already dead");
				}

				releaseHold();
				return true;
			}

			doAggro();

			for (i = 0; i < waitTicks; i += 1) {
				snapHold();

				if (bossCorpse()) {
					giveUpDead = true;
					break;
				}

				boss = getUnit(1, name);

				if (boss && Attack.checkMonster(boss)) {
					sawBoss = true;
					dist = getDistance(me, boss);

					if (dist <= engageDist || packNear(20)) {
						engaged = true;
						break;
					}

					holdCast(18);
					idle += 1;

					if (idle >= 6) {
						if (baitPulses < 2) {
							doAggro();
						} else {
							tpToBoss(boss);
							break;
						}

						idle = 0;
					}

					delay(120);
					continue;
				}

				if (packNear(18)) {
					engaged = true;
					holdCast(18);
					idle = 0;
				} else {
					idle += 1;

					if (idle >= 8) {
						doAggro();
						idle = 0;

						if (checkAlreadyDead()) {
							giveUpDead = true;
							break;
						}
					}
				}

				delay(120);
			}

			if (giveUpDead) {
				snapHold();

				if (typeof ClassAttack !== "undefined") {
					ClassAttack._sealHoldX = undefined;
					ClassAttack._sealHoldY = undefined;
				}

				return true;
			}

			this.chaosPreattack(name, 4);

			for (i = 0; i < 240; i += 1) {
				snapHold();

				// Killed (by us or anyone) — corpse means done, don't wait for the pack to fully disperse
				if (bossCorpse() && !packNear(15)) {
					releaseHold();
					return true;
				}

				boss = getUnit(1, name);

				if (boss && Attack.checkMonster(boss)) {
					sawBoss = true;
					dist = getDistance(me, boss);

					if (dist <= 36) {
						engaged = true;
						farIdle = 0;

						if (!ClassAttack.doAttack(boss, i % 15 === 0)) {
							outRange += 1;

							if (outRange >= 2) {
								approachBoss(boss);
								outRange = 0;
							}

							holdCast(16);
						} else {
							outRange = 0;
						}

						snapHold();
						continue;
					}

					holdCast(16);
					farIdle += 1;

					if (farIdle >= 6) {
						tpToBoss(boss);
						farIdle = 0;
					}

					delay(80);
					continue;
				}

				if (packNear(22)) {
					engaged = true;
					holdCast(20);
					farIdle = 0;
					continue;
				}

				// Saw him earlier but he's gone — only leave if he's actually dead (not teles away)
				if (engaged || sawBoss) {
					if (bossCorpse()) {
						releaseHold();
						return true;
					}

					delay(200);
					boss = getUnit(1, name);

					if (!(boss && Attack.checkMonster(boss)) && !packNear(18)) {
						// brief recheck — still gone and no pack
						delay(250);
						boss = getUnit(1, name);

						if (!(boss && Attack.checkMonster(boss))) {
							releaseHold();
							return true;
						}
					}

					farIdle += 1;

					if (farIdle >= 6) {
						doAggro();
						farIdle = 0;
					}

					delay(100);
					continue;
				}

				farIdle += 1;

				if (farIdle >= 8) {
					doAggro();
					farIdle = 0;

					if (checkAlreadyDead()) {
						snapHold();

						if (typeof ClassAttack !== "undefined") {
							ClassAttack._sealHoldX = undefined;
							ClassAttack._sealHoldY = undefined;
						}

						return true;
					}
				}

				delay(100);
			}

			snapHold();
			holdCast(18);
			boss = getUnit(1, name);

			if (typeof ClassAttack !== "undefined") {
				ClassAttack._sealHoldX = undefined;
				ClassAttack._sealHoldY = undefined;
			}

			return !(boss && Attack.checkMonster(boss));
		}

		for (i = 0; i < waitTicks; i += 1) {
			boss = getUnit(1, name);

			if (boss) {
				this.chaosPreattack(name, 8);

				return Attack.clear(40, 0, name, this.sort);
			}

			delay(250);
		}

		return !!glow;
	};

	this.vizierSeal = function () {
		print("Viz layout " + this.vizLayout);
		this.followPath(this.vizLayout === 1 ? this.starToVizA : this.starToVizB);

		if (!this.openSeal(395) || !this.openSeal(396)) {
			throw new Error("Failed to open Vizier seals.");
		}

		if (this.vizLayout === 1) {
			Pather.moveTo(7691, 5292);
		} else {
			Pather.moveTo(7695, 5316);
		}

		if (!this.getBoss(getLocaleString(2851))) {
			throw new Error("Failed to kill Vizier");
		}

		return true;
	};

	this.seisSeal = function () {
		var seal, pullX, pullY, baitX, baitY, i, savedTele, savedDelay, opened,
			dx, dy, dist, step, path;

		print("Seis layout " + this.seisLayout);

		// Walk-clear full corridor to pull hold before opening seal (tele hops skip packs)
		if (this.seisLayout === 1) {
			pullX = 7771;
			pullY = 5196;
		} else {
			pullX = 7798;
			pullY = 5186;
		}

		savedTele = Pather.teleport;
		Pather.teleport = false;
		this.followPath(this.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);
		Attack.clear(30, 0, false, this.sort);
		Pather.teleport = savedTele;

		savedTele = Pather.teleport;
		savedDelay = (typeof Config !== "undefined") ? Config.TeleDelay : undefined;
		Pather.teleport = true;

		if (typeof Config !== "undefined") {
			Config.TeleDelay = 0;
		}

		Pather._lastTeleTick = 0;
		opened = false;

		for (i = 0; i < 5; i += 1) {
			Pather._lastTeleTick = 0;
			Pather.moveToPreset(108, 2, 394, 4, 4);
			seal = getUnit(2, 394);

			if (!seal) {
				delay(200);
				continue;
			}

			if (seal.mode) {
				opened = true;
				break;
			}

			Misc.click(0, 0, seal);
			delay(400 + me.ping);
			seal = getUnit(2, 394);

			if (seal && seal.mode) {
				opened = true;
				break;
			}
		}

		seal = getUnit(2, 394);

		// Hold on stock kolbot post-seal node (~35-40y south); walk north to aggro
		if (this.seisLayout === 1) {
			pullX = 7771;
			pullY = 5196;
		} else {
			pullX = 7798;
			pullY = 5186;
		}

		if (!Attack.validSpot(pullX, pullY) && seal) {
			pullX = Math.round(seal.x - 8);
			pullY = Math.round(seal.y + 38);

			if (!Attack.validSpot(pullX, pullY)) {
				pullX = Math.round(seal.x + 6);
				pullY = Math.round(seal.y + 34);
			}
		}

		// Bait ~18y from hold along the walkable path to the seal (straight line hits the nest wall)
		if (seal) {
			try {
				path = getPath(me.area, Math.round(seal.x), Math.round(seal.y), pullX, pullY, 0, 4);
			} catch (ePath) {
				path = null;
			}

			if (path && path.length) {
				path.reverse();

				for (i = 0; i < path.length; i += 1) {
					if (getDistance(pullX, pullY, path[i].x, path[i].y) >= 18) {
						baitX = Math.round(path[i].x);
						baitY = Math.round(path[i].y);
						break;
					}
				}

				if (baitX === undefined && path.length > 1) {
					baitX = Math.round(path[path.length - 2].x);
					baitY = Math.round(path[path.length - 2].y);
				}
			}
		}

		if (seal && baitX === undefined) {
			dx = seal.x - pullX;
			dy = seal.y - pullY;
			dist = Math.sqrt(dx * dx + dy * dy);

			if (dist > 1) {
				step = Math.min(16, dist * 0.45);
				baitX = Math.round(pullX + dx * (step / dist));
				baitY = Math.round(pullY + dy * (step / dist));

				if (!Attack.validSpot(baitX, baitY)) {
					step = Math.min(10, dist * 0.3);
					baitX = Math.round(pullX + dx * (step / dist));
					baitY = Math.round(pullY + dy * (step / dist));
				}
			} else {
				baitX = pullX;
				baitY = pullY - 16;
			}
		} else if (baitX === undefined) {
			baitX = pullX;
			baitY = pullY - 16;
		}

		if (!Attack.validSpot(baitX, baitY)) {
			baitX = pullX;
			baitY = pullY - 10;
		}

		Pather._lastTeleTick = 0;

		if (!Pather.forceTeleportTo(pullX, pullY, 4)) {
			Pather.moveTo(pullX, pullY, 3);
		}

		if (typeof Config !== "undefined" && savedDelay !== undefined) {
			Config.TeleDelay = savedDelay;
		}

		Pather.teleport = savedTele;

		if (!opened) {
			throw new Error("Failed to open de Seis seal.");
		}

		print("Lord De Seis — TP pull @ " + pullX + "," + pullY + " (hold + TP aggro if needed)");

		if (!this.getBoss(getLocaleString(2852), true, pullX, pullY, baitX, baitY)) {
			throw new Error("Failed to kill de Seis");
		}

		if (this.sealBossAlive(getLocaleString(2852))) {
			throw new Error("de Seis still alive — not moving to Infector");
		}

		return true;
	};

	this.infectorSeal = function () {
		var savedTele, pullX, pullY, baitX, baitY, seal, dx, dy, dist, step;

		print("Inf layout " + this.infLayout);
		this.followPath(this.infLayout === 1 ? this.starToInfA : this.starToInfB);

		if (!this.openSeal(392)) {
			throw new Error("Failed to open Infector seals.");
		}

		if (this.infLayout === 1) {
			pullX = 7868;
			pullY = 5295;
		} else {
			pullX = 7870;
			pullY = 5286;
		}

		savedTele = Pather.teleport;
		Pather.teleport = true;
		Pather.moveTo(pullX, pullY, 3);
		Pather.teleport = savedTele;

		// Bait east toward nest/seal — holdY-8 is useless (~same tile as hold)
		seal = getUnit(2, 392) || getUnit(2, 393);

		if (seal) {
			dx = seal.x - pullX;
			dy = seal.y - pullY;
			dist = Math.sqrt(dx * dx + dy * dy);

			if (dist > 1) {
				step = Math.min(24, Math.max(16, dist * 0.45));
				baitX = Math.round(pullX + dx * (step / dist));
				baitY = Math.round(pullY + dy * (step / dist));

				if (!Attack.validSpot(baitX, baitY)) {
					step = Math.min(18, dist * 0.35);
					baitX = Math.round(pullX + dx * (step / dist));
					baitY = Math.round(pullY + dy * (step / dist));
				}
			}
		}

		if (baitX === undefined || !Attack.validSpot(baitX, baitY)) {
			baitX = pullX + 22;
			baitY = pullY;
		}

		print("Infector of Souls — TP pull @ " + pullX + "," + pullY + " bait " + baitX + "," + baitY);

		if (!this.getBoss(getLocaleString(2853), true, pullX, pullY, baitX, baitY)) {
			throw new Error("Failed to kill Infector");
		}

		if (this.sealBossAlive(getLocaleString(2853))) {
			throw new Error("Infector still alive");
		}

		if (!this.openSeal(393)) {
			throw new Error("Failed to open Infector seals.");
		}

		return true;
	};

	this.diabloPrep = function () {
		var trapCheck,
			tick = getTickCount();

		while (getTickCount() - tick < 30000) {
			if (getTickCount() - tick >= 8000) {
				switch (me.classid) {
				case 1: // Sorceress
					if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
						if (me.getState(121)) {
							delay(500);
						} else {
							Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);
						}

						break;
					}

					delay(500);

					break;
				case 3: // Paladin
					Skill.setSkill(Config.AttackSkill[2]);
					Skill.cast(Config.AttackSkill[1], 1);

					break;
				case 5: // Druid
					if (Config.AttackSkill[1] === 245) {
						Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);

						break;
					}

					delay(500);

					break;
				case 6: // Assassin
					if (Config.UseTraps) {
						trapCheck = ClassAttack.checkTraps({x: 7793, y: 5293});

						if (trapCheck) {
							ClassAttack.placeTraps({x: 7793, y: 5293, classid: 243}, trapCheck);

							break;
						}
					}

					delay(500);

					break;
				default:
					delay(500);

					break;
				}
			} else {
				delay(500);
			}

			if (getUnit(1, 243)) {
				return true;
			}
		}

		throw new Error("Diablo not found");
	};

	this.followPath = function (path) {
		var i;

		for (i = 0; i < path.length; i += 2) {
			if (this.cleared.length) {
				this.clearStrays();
			}

			Pather.moveTo(path[i], path[i + 1], 3, getDistance(me, path[i], path[i + 1]) > 50);
			Attack.clear(30, 0, false, this.sort);

			// Push cleared positions so they can be checked for strays
			this.cleared.push([path[i], path[i + 1]]);

			// After 5 nodes go back 2 nodes to check for monsters
			if (i === 10 && path.length > 16) {
				path = path.slice(6);
				i = 0;
			}
		}
	};

	this.clearStrays = function () {
		/*if (!Config.PublicMode) {
			return false;
		}*/

		var i,
			oldPos = {x: me.x, y: me.y},
			monster = getUnit(1);

		if (monster) {
			do {
				if (Attack.checkMonster(monster)) {
					for (i = 0; i < this.cleared.length; i += 1) {
						if (getDistance(monster, this.cleared[i][0], this.cleared[i][1]) < 30 && Attack.validSpot(monster.x, monster.y)) {
							me.overhead("we got a stray");
							Pather.moveToUnit(monster);
							Attack.clear(15, 0, false, this.sort);

							break;
						}
					}
				}
			} while (monster.getNext());
		}

		if (getDistance(me, oldPos.x, oldPos.y) > 5) {
			Pather.moveTo(oldPos.x, oldPos.y);
		}

		return true;
	};

	this.defendPlayers = function () {
		var player,
			oldPos = {x: me.x, y: me.y},
			monster = getUnit(1);

		if (monster) {
			do {
				if (Attack.checkMonster(monster)) {
					player = getUnit(0);

					if (player) {
						do {
							if (player.name !== me.name && getDistance(monster, player) < 30) {
								me.overhead("defending players");
								Pather.moveToUnit(monster);
								Attack.clear(15, 0, false, this.sort);
							}
						} while (player.getNext());
					}
				}
			} while (monster.getNext());
		}

		if (getDistance(me, oldPos.x, oldPos.y) > 5) {
			Pather.moveTo(oldPos.x, oldPos.y);
		}

		return true;
	};

	this.cleared = [];

	// path coordinates
	this.entranceToStar = [7794, 5517, 7791, 5491, 7768, 5459, 7775, 5424, 7817, 5458, 7777, 5408, 7769, 5379, 7777, 5357, 7809, 5359, 7805, 5330, 7780, 5317, 7791, 5293];
	this.starToVizA = [7759, 5295, 7734, 5295, 7716, 5295, 7718, 5276, 7697, 5292, 7678, 5293, 7665, 5276, 7662, 5314];
	this.starToVizB = [7759, 5295, 7734, 5295, 7716, 5295, 7701, 5315, 7666, 5313, 7653, 5284];
	// Seis: clear corridor down to pull hold (south of nest) — openSeal TPs to seal after
	this.starToSeisA = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7775, 5205, 7804, 5193, 7771, 5196];
	this.starToSeisB = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7811, 5218, 7807, 5194, 7779, 5193, 7798, 5186];
	this.starToInfA = [7809, 5268, 7834, 5306, 7852, 5280, 7868, 5295];
	this.starToInfB = [7809, 5268, 7834, 5306, 7852, 5280, 7870, 5286];
	Pather._teleport = Pather.teleport;

	// start
	Town.doChores();
	Pather.useWaypoint(Config.RandomPrecast ? "random" : 107);
	Precast.doPrecast(true);

	if (me.area !== 107) {
		Pather.useWaypoint(107);
	}

	// NM/Hell: clear River of Flame toward Chaos. Normal: tele straight to entrance.
	if (me.diff > 0) {
		if (!Pather.moveToExit(108, true, true)) {
			throw new Error("Failed to clear River of Flame to Chaos Sanctuary");
		}

		Pather.moveTo(7790, 5544);
	} else if (!Pather.moveTo(7790, 5544)) {
		throw new Error("Failed to move to Chaos Sanctuary");
	}

	this.initLayout();

	var origAttackSkill1 = Config.AttackSkill[1],
		origAttackSkill3 = Config.AttackSkill[3];

	if (me.diff > 0 && Config.Diablo.ChaosAttackSkill > 0) {
		Config.AttackSkill[1] = Config.Diablo.ChaosAttackSkill;
		Config.AttackSkill[3] = Config.Diablo.ChaosAttackSkill;
	}

	// NM/Hell (or Entrance config): clear Chaos from entrance to star
	if (Config.Diablo.Entrance || me.diff > 0) {
		Attack.clear(30, 0, false, this.sort);
		Pather.moveTo(7790, 5544);

		if (Config.PublicMode) {
			Pather.makePortal();
			say(Config.Diablo.EntranceTP);
			Pather.teleport = !Config.Diablo.WalkClear && Pather._teleport;
		}

		Pather.moveTo(7790, 5544);
		Precast.doPrecast(true);
		Attack.clear(30, 0, false, this.sort);
		this.followPath(this.entranceToStar);
	} else {
		Pather.moveTo(7774, 5305);
		Attack.clear(15, 0, false, this.sort);
	}

	Pather.moveTo(7791, 5293);

	if (Config.PublicMode) {
		Pather.makePortal();
		say(Config.Diablo.StarTP);
		Pather.teleport = !Config.Diablo.WalkClear && Pather._teleport;
	}

	Attack.clear(30, 0, false, this.sort);
	this.vizierSeal();
	this.seisSeal();
	Precast.doPrecast(true);
	this.infectorSeal();

	switch (me.classid) {
	case 1:
		Pather.moveTo(7792, 5294);

		break;
	default:
		Pather.moveTo(7788, 5292);

		break;
	}


	if (Config.PublicMode) {
		say(Config.Diablo.DiabloMsg);
	}

	Config.AttackSkill[1] = origAttackSkill1;
	Config.AttackSkill[3] = origAttackSkill3;
	this.diabloPrep();
	Attack.kill(243); // Diablo
	Pickit.pickItems();

	Pather.teleport = Pather._teleport;

	return true;
}