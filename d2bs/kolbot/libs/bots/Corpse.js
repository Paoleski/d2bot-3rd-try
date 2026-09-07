/**
*	@filename	Corpsefire.js
*	@author		kolton
*	@desc		kill Corpsefire and optionally clear Den of Evil
*/

function Corpse() {
	Town.doChores();
	Pather.useWaypoint(3);
	Precast.doPrecast(true);

	if (!Pather.moveToExit(2, true)) {
		throw new Error("Failed to move to Corpsefire");
	}

	Attack.clearLevel();
	return true;
}