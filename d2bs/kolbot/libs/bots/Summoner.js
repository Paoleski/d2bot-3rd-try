/**
*	@filename	Summoner.js
*	@author		kolton
*	@desc		kill the Summoner (telestomp onto him)
*/

function Summoner() {
	var boss, tick, canTP, attackCount;

	Town.doChores();
	Pather.useWaypoint(74);
	Precast.doPrecast(true);

	canTP = !!(me.getSkill(54, 1) || me.getStat(97, 54));
	Pather.teleport = canTP;

	if (Config.Summoner.FireEye) {
		if (!Pather.usePortal(null)) {
			throw new Error("Failed to move to Fire Eye");
		}

		Attack.clear(15, 0, getLocaleString(2885)); // Fire Eye

		if (!Pather.usePortal(null)) {
			throw new Error("Failed to move to Summoner");
		}
	}

	if (!Pather.moveToPreset(me.area, 2, 357, -3, -3)) {
		throw new Error("Failed to move to Summoner");
	}

	boss = getUnit(1, 250);

	if (!boss) {
		Attack.clear(15, 0, 250);

		return true;
	}

	print("ÿc2Summonerÿc0 :: " + (canTP ? "telestomp" : "walk-stomp (no TP)"));
	tick = getTickCount();
	attackCount = 0;

	while (Attack.checkMonster(boss) && attackCount < 300 && getTickCount() - tick < 180000) {
		if (!boss || !copyUnit(boss).x) {
			boss = getUnit(1, 250);

			if (!boss) {
				break;
			}
		}

		if (getDistance(me, boss) > 3) {
			Pather.moveToUnit(boss);
		}

		ClassAttack.doAttack(boss, attackCount % 15 === 0);
		attackCount += 1;
		delay(40 + Math.min(me.ping, 150));
	}

	if (boss && Attack.checkMonster(boss)) {
		Attack.kill(250);
	}

	return true;
}
