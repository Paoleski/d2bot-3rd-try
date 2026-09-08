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
			idle, farIdle, engaged, sawBoss, baitPulses, self = this;

		glow = getUnit(2, 131);
		waitTicks = pullFight ? 72 : 16;
		engageDist = pullFight ? 34 : 40;
		idle = 0;
		farIdle = 0;
		engaged = false;
		sawBoss = false;
		baitPulses = 0;

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

			if (me.getSkill(44, 1)) {
				Skill.cast(44, 0);
				delay(80);
			}

			if (Config.AttackSkill[1] > 0) {
				Skill.cast(Config.AttackSkill[1], Skill.getHand(Config.AttackSkill[1]), bx, by - 4);
			}

			delay(120 + me.ping);
			snapHold();
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

			if (me.getSkill(44, 1)) {
				Skill.cast(44, 0);
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
			pulseAggro();

			for (i = 0; i < waitTicks; i += 1) {
				snapHold();
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
							pulseAggro();
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
						pulseAggro();
						idle = 0;
					}
				}

				delay(120);
			}

			this.chaosPreattack(name, 4);

			for (i = 0; i < 240; i += 1) {
				snapHold();
				boss = getUnit(1, name);

				if (boss && Attack.checkMonster(boss)) {
					sawBoss = true;
					dist = getDistance(me, boss);

					if (dist <= 36) {
						engaged = true;
						farIdle = 0;

						if (!ClassAttack.doAttack(boss, i % 15 === 0)) {
							holdCast(16);
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

				if (engaged || sawBoss) {
					snapHold();

					if (typeof ClassAttack !== "undefined") {
						ClassAttack._sealHoldX = undefined;
						ClassAttack._sealHoldY = undefined;
					}

					return true;
				}

				farIdle += 1;

				if (farIdle >= 8) {
					pulseAggro();
					farIdle = 0;
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
		var seal, pullX, pullY, baitX, baitY, i, savedTele, savedDelay, opened;

		print("Seis layout " + this.seisLayout);
		this.followPath(this.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);

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

		if (seal) {
			pullX = Math.round(seal.x);
			pullY = Math.round(seal.y + 12);
			baitX = Math.round(seal.x);
			baitY = Math.round(seal.y + 4);

			if (!Attack.validSpot(pullX, pullY)) {
				pullX = Math.round(seal.x - 8);
				pullY = Math.round(seal.y + 12);
				baitX = Math.round(seal.x - 8);
				baitY = Math.round(seal.y + 4);
			}

			if (!Attack.validSpot(pullX, pullY)) {
				pullX = Math.round(seal.x + 8);
				pullY = Math.round(seal.y + 14);
				baitX = Math.round(seal.x + 8);
				baitY = Math.round(seal.y + 6);
			}
		} else if (this.seisLayout === 1) {
			pullX = 7780;
			pullY = 5238;
			baitX = 7780;
			baitY = 5228;
		} else {
			pullX = 7800;
			pullY = 5228;
			baitX = 7800;
			baitY = 5218;
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

		if (!this.getBoss(getLocaleString(2852), true, pullX, pullY, baitX, baitY)) {
			throw new Error("Failed to kill de Seis");
		}

		return true;
	};

	this.infectorSeal = function () {
		var savedTele, pullX, pullY;

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

		if (!this.getBoss(getLocaleString(2853), true, pullX, pullY)) {
			throw new Error("Failed to kill Infector");
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
	// Seis: corridor mouth only — openSeal TPs to seal, pull holds south (never nest 5228/5218)
	this.starToSeisA = [7781, 5259, 7805, 5258];
	this.starToSeisB = [7781, 5259, 7805, 5258];
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

	if (!Pather.moveTo(7790, 5544)) {
		throw new Error("Failed to move to Chaos Sanctuary");
	}

	this.initLayout();

	if (Config.Diablo.Entrance) {
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

	this.diabloPrep();
	Attack.kill(243); // Diablo
	Pickit.pickItems();

	Pather.teleport = Pather._teleport;

	return true;
}