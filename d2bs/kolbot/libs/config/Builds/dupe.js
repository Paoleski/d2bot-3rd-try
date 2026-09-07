function main() {

	print("Welcome to dupe.js");

	this.block = false;

	addEventListener("gamepacketsent", function(bytes) {

		if (bytes[0] == 0x30 && this.block == true) {
			return true;
		}

		return false;

	});

	addEventListener("keyup", function(key) {

		switch (key) {

			case 0x61:

				print("Talk to Nihlathak then press NUMPAD2");
				this.block = true;

				break;


			case 0x62:

				if(!me.itemoncursor) {
					print("Pick an item to cursor first, any item that you don't mind losing");
					return;
				}

				var gate = getUnit(2, 449);
				if (gate) {
					sendPacket(1, 0x44, 4, 2, 4, gate.gid, 4, getUnit(100).gid, 4, 0x03);
					print("Go into trade then press NUMPAD3");
				} else {
					print("go near the gate");
				}

				break;

			case 0x63:

				sendPacket(1, 0x31, 1, 0xFF, 1, 0xFF, 1, 0xFF, 1, 0xFF, 1, 0xA3, 1, 0x4E, 2, 0x00);
				getPacket(1, 0x77, 1, 0x0c);

				print("All done. Happy duping~");

				break;

		}

	});

	while (1)
		delay(1000);

}
