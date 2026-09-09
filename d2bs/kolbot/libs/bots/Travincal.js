/**
*	@filename	Travincal.js
*	@author		kolton
*	@desc		kill Counncil members in Travincal
*/

function Travincal() {
	var i, orgX, orgY, coords, savedTeleDelay, savedAtk;

	this.buildList = function (checkColl) {
		var monsterList = [],
			monster = getUnit(1);

		if (monster) {
			do {
				if ([345, 346, 347].indexOf(monster.classid) > -1 && Attack.checkMonster(monster) && (!checkColl || !checkCollision(me, monster, 0x1))) {
					monsterList.push(copyUnit(monster));
				}
			} while (monster.getNext());
		}

		return monsterList;
	};

	// Light sorc only: no bot TeleDelay for entire Travincal run
	if (Attack.isLightSorc()) {
		savedTeleDelay = Config.TeleDelay;
		Config.TeleDelay = 0;
		Pather._lastTeleTick = 0;
	}

	try {
		Town.doChores();
		Pather.useWaypoint(83);
		Precast.doPrecast(true);

		orgX = me.x;
		orgY = me.y;

		if (Config.Travincal.PortalLeech) {
			Pather.moveTo(orgX + 85, orgY - 139);
			Attack.securePosition(orgX + 70, orgY - 139, 25, 2000);
			Attack.securePosition(orgX + 100, orgY - 139, 25, 2000);
			Attack.securePosition(orgX + 85, orgY - 139, 25, 5000);
			Pather.moveTo(orgX + 85, orgY - 139);
			Pather.makePortal();
			delay(1000);
			Precast.doPrecast(true);
		}

		if (me.getSkill(143, 0) && !me.getSkill(54, 0) && !me.getStat(97, 54)) {
			coords = [60, -53, 64, -72, 78, -72, 74, -88];

			for (i = 0; i < coords.length; i += 2) {
				if (i % 4 === 0) {
					Pather.moveTo(orgX + coords[i], orgY + coords[i + 1]);
				} else {
					Skill.cast(143, 0, orgX + coords[i], orgY + coords[i + 1]);
					Attack.clearList(this.buildList(1));
				}
			}

			Attack.clearList(this.buildList(0));
		} else {
			Pather.moveTo(orgX + 101, orgY - 56);

			// Stack Merc
			if (me.classid === 4 && !me.getSkill(54, 1) && me.gametype === 1) {
				// WAR - moveToExit needs to be fixed
				Pather.moveToExit(100, true);
				delay(me.ping*2 + 100);
				Pather.moveToExit(83, true);
			}

			if (Config.MFLeader) {
				Pather.makePortal();
				say("council " + me.area);
			}

			// NM/Hell light sorc only: timed hit-and-run + Lightning. Everyone else clearList.
			if (me.diff >= 1 && Attack.isLightSorc() && Pather.teleSkill() > 0 && Config.Travincal.HitAndRun !== false) {
				savedAtk = Attack.preferTravLightning();

				print("ÿc2Travincalÿc0 :: light hit-and-run " + (Config.Travincal.HitAndRunMs || 3000) + "ms");

				try {
					Attack.hitAndRunClear(this.buildList.bind(this, 0), {
						engageMs: Config.Travincal.HitAndRunMs || 3000,
						minRetreat: Config.Travincal.HitAndRunMinRetreat || 15,
						maxRetreat: Config.Travincal.HitAndRunMaxRetreat || 22
					});
				} finally {
					Attack.restoreAttackSkill(savedAtk);
				}
			} else {
				print("ÿc2Travincalÿc0 :: tank clearList (light=" + Attack.isLightSorc() + " diff=" + me.diff + ")");
				Attack.clearList(this.buildList(0));
			}
		}
	} finally {
		if (Attack.isLightSorc() && savedTeleDelay !== undefined) {
			Config.TeleDelay = savedTeleDelay;
		}
	}

	return true;
}
