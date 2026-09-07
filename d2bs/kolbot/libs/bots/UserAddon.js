/**
*	@filename	UserAddon.js
*	@author		kolton
*	@desc		Allows you to see more information about items, NPCs and players by placing the cursor over them.
*				Shows item level, items in sockets, classid, code and magic item prefix/suffix numbers.
*				Shows monster's classid, HP percent and resistances.
*				Shows other players' gear.
*/

function UserAddon() {
	var i, unit, title, dummy, self,
		info = new UnitInfo(),
		classes = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"],
		flags = [0x1, 0x2, 0x3, 0x4, 0x5, 0xf, 0x18, 0x19, 0xc, 0x9],
		configPath = "libs/config/" + classes[me.classid] + "." + me.name + ".js",
		pickerDone = false;

	self = this;

	// Stub — stock UserAddon registered itemaction with undefined this.itemEvent (crash risk).
	this.itemEvent = function () {};

	this.patchCharName = function (path) {
		var text;

		if (!isIncluded("common/Misc.js")) {
			include("common/Misc.js");
		}

		text = Misc.fileAction(path, 0);

		if (!text) {
			print("ÿc1UserAddonÿc0: Failed to read " + path + " for name patch");
			return false;
		}

		if (text.indexOf("__CHAR_NAME__") === -1) {
			return true; // nothing to patch
		}

		text = text.split("__CHAR_NAME__").join(me.name);
		Misc.fileAction(path, 1, text);
		return true;
	};

	this.createBuildConfig = function (build) {
		var className = classes[me.classid],
			templatePath = "libs/config/Templates/PD2." + className + "." + build + ".js";

		if (!FileTools.exists(templatePath)) {
			print("ÿc1UserAddonÿc0: Missing template " + templatePath);
			D2Bot.printToConsole("Missing template: " + templatePath);
			return false;
		}

		FileTools.copy(templatePath, configPath);

		if (!FileTools.exists(configPath)) {
			print("ÿc1UserAddonÿc0: Copy failed → " + configPath);
			return false;
		}

		if (!self.patchCharName(configPath)) {
			return false;
		}

		print("ÿc2UserAddonÿc0: Created " + configPath + " (build=" + build + ")");
		D2Bot.printToConsole(configPath + " created with build=" + build + ". Restart the profile.");
		return true;
	};

	// Kept name for any external callers; same as createBuildConfig
	this.createSorcConfig = function (build) {
		return self.createBuildConfig(build);
	};

	this.createDefaultConfig = function () {
		var src = "libs/config/" + classes[me.classid] + ".js";

		if (!FileTools.exists(src)) {
			print("ÿc1UserAddonÿc0: Missing default " + src);
			return false;
		}

		FileTools.copy(src, configPath);
		print("ÿc2UserAddonÿc0: Created " + configPath + " from default");
		D2Bot.printToConsole(configPath + " has been created. Configure and restart.");
		return true;
	};

	// Class → build picker (extend keys as new Templates/PD2.Class.build.js land)
	this.buildPickers = {
		1: { // Sorceress
			prompt: "ÿc4UserAddonÿc0: Which build?  ÿc21ÿc0=Fire  ÿc92ÿc0=Light  ÿc33ÿc0=Cold  ÿc1ESCÿc0=cancel",
			builds: {
				49: "fire", 97: "fire",
				50: "light", 98: "light",
				51: "cold", 99: "cold"
			}
		},
		2: { // Necromancer — add bone/summon/etc. when templates exist
			prompt: "ÿc4UserAddonÿc0: Which build?  ÿc21ÿc0=Poison Strike  ÿc1ESCÿc0=cancel",
			builds: {
				49: "poisonstrike", 97: "poisonstrike"
			}
		}
	};

	this.keyEvent = function (key) {
		var picker, build;

		if (pickerDone) {
			return;
		}

		// ESC — cancel
		if (key === 27) {
			pickerDone = true;
			removeEventListener("keyup", self.keyEvent);
			print("ÿc4UserAddonÿc0: Config create cancelled.");
			return;
		}

		picker = self.buildPickers[me.classid];

		if (picker) {
			build = picker.builds[key];

			if (!build) {
				return;
			}

			pickerDone = true;
			removeEventListener("keyup", self.keyEvent);

			if (self.createBuildConfig(build)) {
				D2Bot.stop();
			}

			return;
		}

		// Other classes: SPACE copies default Class.js
		if (key === 32) {
			pickerDone = true;
			removeEventListener("keyup", self.keyEvent);

			if (self.createDefaultConfig()) {
				D2Bot.stop();
			}
		}
	};

	// Do not register undefined itemaction handlers
	if (!Config.FastPick) {
		addEventListener("itemaction", this.itemEvent);
	}

	if (!FileTools.exists(configPath)) {
		// Console print only — no Text/Box overlay, no showConsole (steals key focus)
		print("ÿc4UserAddonÿc0: No char config for " + me.name);
		if (self.buildPickers[me.classid]) {
			print(self.buildPickers[me.classid].prompt);
		} else {
			print("ÿc4UserAddonÿc0: Press ÿc2SPACEÿc0 to copy default " + classes[me.classid] + ".js  (ESC=cancel)");
		}
		addEventListener("keyup", this.keyEvent);
	}

	while (true) {
		for (i = 0; i < flags.length; i += 1) {
			if (getUIFlag(flags[i])) {
				if (title) {
					title.remove();
					dummy.remove();

					title = false;
					dummy = false;
				}

				break;
			}
		}

		if (i === flags.length && !title) {
			title = new Text(":: kolbot user addon ::", 400, 525, 4, 0, 2);
			dummy = new Text("`", 1, 1); // Prevents crash
		}

		Pickit.fastPick();

		unit = getUnit(101);

		info.createInfo(unit);
		delay(20);
	}
}

function UnitInfo() {
	this.x = 200;
	this.y = 250;
	this.hooks = [];
	this.cleared = true;

	this.createInfo = function (unit) {
		if (typeof unit === "undefined") {
			this.remove();

			return;
		}

		switch (unit.type) {
		case 0:
			this.playerInfo(unit);

			break;
		case 1:
			this.monsterInfo(unit);

			break;
		case 4:
			this.itemInfo(unit);

			break;
		}
	};

	this.playerInfo = function (unit) {
		var i, items, string,
			frameXsize = 0,
			frameYsize = 20,
			quality = ["ÿc0", "ÿc0", "ÿc0", "ÿc0", "ÿc3", "ÿc2", "ÿc9", "ÿc4", "ÿc8"];

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));

		items = unit.getItems();

		if (items) {
			this.hooks.push(new Text("Equipped items:", this.x, this.y + 15, 4, 13, 2));
			frameYsize += 15;

			for (i = 0; i < items.length; i += 1) {
				if (items[i].getFlag(0x4000000)) {
					string = items[i].fname.split("\n")[1] + "ÿc0 " + items[i].fname.split("\n")[0];
				} else {
					string = quality[items[i].quality] + (items[i].quality > 4 && items[i].getFlag(0x10) ? items[i].fname.split("\n").reverse()[0].replace("ÿc4", "") : items[i].name);
				}

				this.hooks.push(new Text(string, this.x, this.y + (i + 2) * 15, 0, 13, 2));

				if (string.length > frameXsize) {
					frameXsize = string.length;
				}

				frameYsize += 15;
			}
		}

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, Math.round(frameXsize * 7.5) - 4, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, Math.round(frameXsize * 7.5), frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.monsterInfo = function (unit) {
		var frameYsize = 125;

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("HP percent: ÿc0" + Math.round(unit.hp * 100 / 128), this.x, this.y + 15, 4, 13, 2));
		this.hooks.push(new Text("Fire resist: ÿc0" + unit.getStat(39), this.x, this.y + 30, 4, 13, 2));
		this.hooks.push(new Text("Cold resist: ÿc0" + unit.getStat(43), this.x, this.y + 45, 4, 13, 2));
		this.hooks.push(new Text("Lightning resist: ÿc0" + unit.getStat(41), this.x, this.y + 60, 4, 13, 2));
		this.hooks.push(new Text("Poison resist: ÿc0" + unit.getStat(45), this.x, this.y + 75, 4, 13, 2));
		this.hooks.push(new Text("Physical resist: ÿc0" + unit.getStat(36), this.x, this.y + 90, 4, 13, 2));
		this.hooks.push(new Text("Magic resist: ÿc0" + unit.getStat(37), this.x, this.y + 105, 4, 13, 2));

		this.cleared = false;

		this.hooks.push(new Box(this.x + 2, this.y - 15, 136, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 140, frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.itemInfo = function (unit) {
		var i = 0,
			frameYsize = 50;

		if (!this.currentGid) {
			this.currentGid = unit.gid;
		}

		if (this.currentGid === unit.gid && !this.cleared) {
			return;
		}

		if (this.currentGid !== unit.gid) {
			this.remove();
			this.currentGid = unit.gid;
		}

		this.hooks.push(new Text("Classid: ÿc0" + unit.classid, this.x, this.y, 4, 13, 2));
		this.hooks.push(new Text("Code: ÿc0" + unit.code, this.x, this.y + 15, 4, 13, 2));
		this.hooks.push(new Text("Item level: ÿc0" + unit.ilvl, this.x, this.y + 30, 4, 13, 2));

		this.cleared = false;
		this.socketedItems = unit.getItems();

		if (this.socketedItems) {
			this.hooks.push(new Text("Socketed with:", this.x, this.y + 45, 4, 13, 2));
			frameYsize += 15;

			for (i = 0; i < this.socketedItems.length; i += 1) {
				this.hooks.push(new Text(this.socketedItems[i].fname.split("\n").reverse().join(" "), this.x, this.y + (i + 4) * 15, 0, 13, 2));

				frameYsize += 15;
			}
		}

		if (unit.quality === 4 && unit.getFlag(0x10)) {
			this.hooks.push(new Text("Prefix: ÿc0" + unit.prefixnum, this.x, this.y + frameYsize - 5, 4, 13, 2));
			this.hooks.push(new Text("Suffix: ÿc0" + unit.suffixnum, this.x, this.y + frameYsize + 10, 4, 13, 2));

			frameYsize += 30;
		}

		this.hooks.push(new Box(this.x + 2, this.y - 15, 116, frameYsize, 0x0, 1, 2));
		this.hooks.push(new Frame(this.x, this.y - 15, 120, frameYsize, 2));

		this.hooks[this.hooks.length - 2].zorder = 0;
	};

	this.remove = function () {
		while (this.hooks.length > 0) {
			this.hooks.shift().remove();
		}

		this.cleared = true;
	};
}