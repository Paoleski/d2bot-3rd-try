/**
*	@filename	Tristram.js
*	@author		kolton, cuss
*	@desc		clear Tristram
*/

function Tristram() {
	if (!isIncluded("common/QuestItems.js")) {
		include("common/QuestItems.js");
	}

	var tree, scroll, akara, stones, gibbet, tick;

	if (!me.getQuest(4, 4) && !me.getItem(QuestItems.cairnKey)) {
		if (!me.getItem(QuestItems.inifuss)) {
			// print("We need Scroll of Inifuss");
			Town.doChores();
			Pather.useWaypoint(5);
			Precast.doPrecast(true);

			if (!Pather.moveToPreset(me.area, 2, 30, 5, 5)) {
				throw new Error("Failed to move to Tree of Inifuss");
			}

			tree = getUnit(2, 30);

			Misc.openChest(tree);
			delay(300);

			scroll = getUnit(4, QuestItems.inifuss);

			Pickit.pickItem(scroll);
			Town.goToTown();
		}

		// print("We need Key to the Cairn Stones");
		Town.move(NPC.Akara);

		akara = getUnit(1, NPC.Akara);

		akara.openMenu();
		me.cancel();
	}

	Pather._teleport = Pather.teleport;

	Town.doChores();
	Pather.useWaypoint(4);
	Precast.doPrecast(true);

	if (!Pather.moveToRakanishu(false, true)) {
		throw new Error("Failed to move to Rakanishu / Cairn Stones");
	}

	if (!me.getQuest(4, 4)) {
		stones = [17, 18, 19, 20, 21];
	}

	Attack.clear(15, 0, getLocaleString(2872)); // Rakanishu

	tick = getTickCount();

	while (!me.getQuest(4, 4) && getTickCount() - tick < 45000) {
		stones.forEach(function (id) {
			var stone = getUnit(2, id);

			if (stone) {
				Attack.securePosition(stone.x, stone.y, 10, me.ping * 2);
				sendPacket(1, 0x13, 4, stone.type, 4, stone.gid);
				Misc.click(0, 0, stone);
			}
		});

		delay(200 + me.ping);
	}

	while (!Pather.usePortal(38)) {
		Attack.securePosition(me.x, me.y, 10, 1000);
	}

	Pather.moveTo(me.x, me.y + 6);

	if (Config.Tristram.PortalLeech) {
		Pather.makePortal();
		delay(1000);
		Pather.teleport = !Config.Tristram.WalkClear && Pather._teleport;
	}

	gibbet = getUnit(2, 26);

	if (!gibbet.mode) {
		if (!Pather.moveToPreset(me.area, 2, 26, 0, 0, true, true)) {
			throw new Error("Failed to move to Cain's Gibbet");
		}

		Misc.openChest(gibbet);
	}

	if (Config.Tristram.PortalLeech) {
		Attack.clearLevel(0);
	} else {
		Attack.clearLevel(Config.ClearType);
	}

	Pather.teleport = Pather._teleport;

	return true;
}