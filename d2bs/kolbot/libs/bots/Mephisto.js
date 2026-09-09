/**
*	@filename	Mephisto.js
*	@author		kolton, njomnjomnjom
*	@desc		kill Mephisto
*/

function Mephisto() {
	// All Durance 3 monsters except Mephisto himself (classid 242) — clear the level
	// from range before engaging him instead of walking straight in and waking him.
	this.buildList = function () {
		var monsterList = [],
			monster = getUnit(1);

		if (monster) {
			do {
				if (monster.classid !== 242 && Attack.checkMonster(monster)) {
					monsterList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		return monsterList;
	};

	this.killMephisto = function () {
		var i, angle, angles,
			pos = {},
			attackCount = 0,
			meph = getUnit(1, 242);

		if (!meph) {
			throw new Error("Mephisto not found!");
		}

		if (Config.MFLeader) {
			Pather.makePortal();
			say("kill " + meph.classid);
		}

		while (attackCount < 300 && Attack.checkMonster(meph)) {
			//if (getUnit(3, 276)) {
			if (meph.mode === 5) {
			//if (attackCount % 2 === 0) {
				angle = Math.round(Math.atan2(me.y - meph.y, me.x - meph.x) * 180 / Math.PI);
				angles = me.y > meph.y ? [-30, -60, -90] : [30, 60, 90];

				for (i = 0; i < angles.length; i += 1) {
					//pos.dist = Math.round(getDistance(me, meph));
					pos.dist = 18;
					pos.x = Math.round((Math.cos((angle + angles[i]) * Math.PI / 180)) * pos.dist + meph.x);
					pos.y = Math.round((Math.sin((angle + angles[i]) * Math.PI / 180)) * pos.dist + meph.y);

					if (Attack.validSpot(pos.x, pos.y)) {
						me.overhead("move, bitch!");
						Pather.moveTo(pos.x, pos.y);

						break;
					}
				}
			}

			if (ClassAttack.doAttack(meph) < 2) {
				break;
			}

			attackCount += 1;
		}

		return (meph.mode === 0 || meph.mode === 12);
	};

	this.moat = function () {
		var count, distance, mephisto;

		count = 0;

		delay(350);
		Pather.moveTo(17563, 8072);

		mephisto = getUnit(1, 242);

		if (!mephisto) {
			throw new Error("Mephisto not found.");
		}

		delay(350);
		Pather.moveTo(17575, 8086);
		delay(350);
		Pather.moveTo(17584, 8091);
		delay(1200);
		Pather.moveTo(17600, 8095);
		delay(550);
		Pather.moveTo(17610, 8094);
		delay(2500);
		Attack.clear(10);
		Pather.moveTo(17610, 8094);

		distance = getDistance(me, mephisto);

		while (distance > 27) {
			count += 1;

			Pather.moveTo(17600, 8095);
			delay(150);
			Pather.moveTo(17584, 8091);
			delay(150);
			Pather.moveTo(17575, 8086);
			delay(150);
			Pather.moveTo(17563, 8072);
			delay(350);
			Pather.moveTo(17575, 8086);
			delay(350);
			Pather.moveTo(17584, 8091);
			delay(1200);
			Pather.moveTo(17600, 8095);
			delay(550);
			Pather.moveTo(17610, 8094);
			delay(2500);
			Attack.clear(10);
			Pather.moveTo(17610, 8094);

			distance = getDistance(me, mephisto);

			if (count >= 5) {
				throw new Error("Failed to lure Mephisto.");
			}
		}

		return true;
	};

	this.killCouncil = function () {
		var i,
			coords = [17600, 8125, 17600, 8015, 17643, 8068];

		for (i = 0; i < coords.length; i += 2) {
			Pather.moveTo(coords[i], coords[i + 1]);

			if (Config.MFLeader) {
				Pather.makePortal();
				say("council " + i);
			}

			Attack.clearList(Attack.getMob([345, 346, 347], 0, 40));
		}

		return true;
	};

	Town.doChores();
	Pather.useWaypoint(101);
	Precast.doPrecast(true);

	// Light sorc: Lightning-only for approach + arrival clear + room sweep — restored
	// in the finally right before the dedicated Mephisto fight starts.
	var savedAtk = Attack.isLightSorc() ? Attack.preferLightningOnly("Meph") : null;

	try {
		// clearPath OFF — Attack.clear would pick Mephisto once we get near the throne.
		if (!Pather.moveToExit(102, true, false)) {
			throw new Error("Failed to move to Durance Level 3");
		}

		if (Config.Mephisto.KillCouncil) {
			this.killCouncil();
		}

		if (Attack.isLightSorc()) {
			var sweepSpots = [[17542, 8066], [17572, 8011], [17515, 8061], [17572, 8125], [17600, 8095]],
				spotI;

			// Phase 1: lateral room — real path node-by-node, Mephisto excluded
			print("ÿc2Mephistoÿc0 :: lateral room — travelClearing (exclude Mephisto)");
			Attack.travelClearing(17542, 8066, 242);

			// Phase 2: mop up anything adjacent on throne-room arrival
			print("ÿc2Mephistoÿc0 :: arrival clear (near trash only)");
			Attack.clearList(this.buildList.bind(this), null, 20);

			// Phase 3: ranged sweep of landmark spots — still exclude Mephisto
			for (spotI = 0; spotI < sweepSpots.length; spotI += 1) {
				print("ÿc2Mephistoÿc0 :: sweeping room " + (spotI + 1) + "/" + sweepSpots.length);

				if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
					if (!Pather.forceTeleportTo(sweepSpots[spotI][0], sweepSpots[spotI][1], 5)) {
						Pather.moveTo(sweepSpots[spotI][0], sweepSpots[spotI][1], 5, false);
					}
				} else {
					Pather.moveTo(sweepSpots[spotI][0], sweepSpots[spotI][1], 5, false);
				}

				delay(200 + me.ping);
				Attack.clearList(this.buildList.bind(this), null, 20);
			}

			Attack.clearList(this.buildList.bind(this), null, 20);
		}
	} finally {
		Attack.restoreAttackSkill(savedAtk);
	}

	// Phase 4: telestomp Mephisto with Charged Bolt (Lightning was for clear-only)
	Pather.moveTo(17566, 8069, 3, false);

	savedAtk = Attack.isLightSorc() ? Attack.preferChargedBolt("Meph") : null;

	try {
		if (me.classid === 1) {
			if (Config.Mephisto.MoatTrick) {
				this.moat();

				Skill.usePvpRange = true;

				Attack.kill(242); // Mephisto

				Skill.usePvpRange = false;
			} else {
				//this.killMephisto();
				Attack.kill(242); // Mephisto
			}
		} else {
			Attack.kill(242); // Mephisto
		}
	} finally {
		Attack.restoreAttackSkill(savedAtk);
	}

	Pickit.pickItems();

	if (Config.OpenChests) {
		Pather.moveTo(17572, 8011);
		Attack.openChests(5);
		Pather.moveTo(17572, 8125);
		Attack.openChests(5);
		Pather.moveTo(17515, 8061);
		Attack.openChests(5);
	}

	if (Config.Mephisto.TakeRedPortal) {
		var i, redPortal;

		// Never getPresetUnit(102) unless we're in Durance 3 — native crash if level unloaded
		if (me.area !== 102) {
			print("ÿc1Mephistoÿc0 :: not in Durance 3 for red portal (area=" + me.area + ")");
			return true;
		}

		try {
			Pather.moveTo(17590, 8068);
			delay(500);
			Pather.moveTo(17601, 8070);
		} catch (eMephCoord) {}

		for (i = 0; i < 20 && me.area === 102; i += 1) {
			redPortal = getUnit(2, 342);

			if (!redPortal) {
				try {
					redPortal = getPresetUnit(me.area, 2, 342);
				} catch (eMephPreset) {
					redPortal = null;
				}
			}

			if (redPortal) {
				break;
			}

			delay(me.ping * 2 + 250);
		}

		try {
			if (me.area === 102) {
				Pather.moveToPreset(me.area, 2, 342, 0, 0, false, false);
			}
		} catch (eMephPortal) {
			Pather.moveTo(17590, 8068);
			delay(500);
			Pather.moveTo(17601, 8070);
		}

		for (i = 0; i < 12 && me.area === 102; i += 1) {
			redPortal = getUnit(2, 342);

			if (redPortal) {
				Pather.usePortal(null, null, redPortal);
			} else {
				Pather.usePortal(103);
			}

			delay(me.ping * 2 + 400);
		}
	}

	return true;
}
