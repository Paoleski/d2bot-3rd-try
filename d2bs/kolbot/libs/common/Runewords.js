/**
*	@filename	Runewords.js
*	@author		kolton
*	@desc		make and reroll runewords
*/

// TODO: Config.Runewords[i][0] can be false, but array methods can be used on it

var Runeword = {
	// 1.09
	AncientsPledge: [617, 618, 616], // Ral + Ort + Tal
	Black: [619, 625, 613], // Thul + Io + Nef
	Fury: [640, 634, 614], // Jah + Gul + Eth
	HolyThunder: [614, 617, 618, 616], // Eth + Ral + Ort + Tal
	Honor: [620, 610, 615, 612, 621], // Amn + El + Ith + Tir + Sol
	KingsGrace: [620, 617, 619], // Amn + Ral + Thul
	Leaf: [630, 635], // Tir + Ral (PD2 classids)
	Lionheart: [624, 626, 628], // Hel + Lum + Fal
	Lore: [636, 639], // Ort + Sol (PD2 classids)
	Malice: [615, 610, 614], // Ith + El + Eth
	Melody: [622, 627, 613], // Shael + Ko + Nef
	Memory: [626, 625, 621, 614], // Lum + Io + Sol + Eth
	Nadir: [613, 612], // Nef + Tir
	Radiance: [613, 621, 615], // Nef + Sol + Ith
	Rhyme: [622, 614], // Shael + Eth
	Silence: [623, 611, 624, 633, 612, 635], // Dol + Eld + Hel + Ist + Tir + Vex
	Smoke: [613, 626], // Nef + Lum
	Stealth: [634, 632], // Tal + Eth (PD2 classids)
	Steel: [630, 628], // Tir + El (PD2 classids)
	Strength: [620, 612], // Amn + Tir
	Venom: [616, 623, 632], // Tal + Dol + Mal
	Wealth: [629, 627, 612], // Lem + Ko + Tir
	White: [623, 625], // Dol + Io
	Zephyr: [618, 614], // Ort + Eth

	// 1.10
	Beast: [639, 612, 631, 632, 626], // Ber + Tir + Um + Mal + Lum
	Bramble: [617, 636, 638, 614], // Ral + Ohm + Sur + Eth
	BreathoftheDying: [635, 624, 610, 611, 642, 614], // Vex + Hel + El + Eld + Zod + Eth
	CallToArms: [620, 617, 632, 633, 636], // Amn + Ral + Mal + Ist + Ohm
	ChainsofHonor: [623, 631, 639, 633], // Dol + Um + Ber + Ist
	Chaos: [628, 636, 631], // Fal + Ohm + Um
	CrescentMoon: [622, 631, 612], // Shael + Um + Tir
	Delirium: [629, 633, 625], // Lem + Ist + Io
	Doom: [624, 636, 631, 637, 641], // Hel + Ohm + Um + Lo + Cham
	Duress: [622, 631, 619], // Shael + Um + Thul
	Enigma: [640, 615, 639], // Jah + Ith + Ber
	Eternity: [620, 639, 633, 621, 638], // Amn + Ber + Ist + Sol + Sur
	Exile: [635, 636, 633, 623], // Vex + Ohm + Ist + Dol
	Famine: [628, 636, 618, 640], // Fal + Ohm + Ort + Jah
	Gloom: [628, 631, 630], // Fal + Um + Pul
	HandofJustice: [638, 641, 620, 637], // Sur + Cham + Amn + Lo
	HeartoftheOak: [627, 635, 630, 619], // Ko + Vex + Pul + Thul
	Kingslayer: [632, 631, 634, 628], // Mal + Um + Gul + Fal
	Passion: [623, 618, 611, 629], // Dol + Ort + Eld + Lem
	Prudence: [632, 612], // Mal + Tir
	Sanctuary: [627, 627, 632], // Ko + Ko + Mal
	Splendor: [614, 626], // Eth + Lum
	Stone: [622, 631, 630, 626], // Shael + Um + Pul + Lum
	Wind: [638, 610], // Sur + El

	// Don't use ladder-only on NL
	Brand: me.ladder ? [640, 637, 632, 634] : false, // Jah + Lo + Mal + Gul
	Death: me.ladder ? [624, 610, 635, 618, 634] : false, // Hel + El + Vex + Ort + Gul
	Destruction: me.ladder ? [635, 637, 639, 640, 627] : false, // Vex + Lo + Ber + Jah + Ko
	Dragon: me.ladder ? [638, 637, 621] : false, // Sur + Lo + Sol
	Dream: me.ladder ? [625, 640, 630] : false, // Io + Jah + Pul
	Edge: me.ladder ? [612, 616, 620] : false, // Tir + Tal + Amn
	Faith: me.ladder ? [636, 640, 629, 611] : false, // Ohm + Jah + Lem + Eld
	Fortitude: me.ladder ? [610, 621, 623, 637] : false, // El + Sol + Dol + Lo
	Grief: me.ladder ? [614, 612, 637, 632, 617] : false, // Eth + Tir + Lo + Mal + Ral
	Harmony: me.ladder ? [612, 615, 621, 627] : false, // Tir + Ith + Sol + Ko
	Ice: me.ladder ? [620, 622, 640, 637] : false, // Amn + Shael + Jah + Lo
	"Infinity": me.ladder ? [639, 632, 639, 633] : false, // Ber + Mal + Ber + Ist
	Insight: me.ladder ? [617, 612, 616, 621] : false, // Ral + Tir + Tal + Sol
	LastWish: me.ladder ? [640, 632, 640, 638, 640, 639] : false, // Jah + Mal + Jah + Sur + Jah + Ber
	Lawbringer: me.ladder ? [620, 629, 627] : false, // Amn + Lem + Ko
	Oath: me.ladder ? [622, 630, 632, 626] : false, // Shael + Pul + Mal + Lum
	Obedience: me.ladder ? [624, 627, 619, 614, 628] : false, // Hel + Ko + Thul + Eth + Fal
	Phoenix: me.ladder ? [635, 635, 637, 640] : false, // Vex + Vex + Lo + Jah
	Pride: me.ladder ? [641, 638, 625, 637] : false, // Cham + Sur + Io + Lo
	Rift: me.ladder ? [624, 627, 629, 634] : false, // Hel + Ko + Lem + Gul
	Spirit: me.ladder ? [616, 619, 618, 620] : false, // Tal + Thul + Ort + Amn
	VoiceofReason: me.ladder ? [629, 627, 610, 611] : false, // Lem + Ko + El + Eld
	Wrath: me.ladder ? [630, 626, 639, 632] : false, // Pul + Lum + Ber + Mal

	// 1.11
	Bone: [621, 631, 631], // Sol + Um + Um
	Enlightenment: [630, 617, 621], // Pul + Ral + Sol
	Myth: [624, 620, 613], // Hel + Amn + Nef
	Peace: [622, 619, 620], // Shael + Thul + Amn
	Principle: [617, 634, 611], // Ral + Gul + Eld
	Rain: [618, 632, 615], // Ort + Mal + Ith
	Treachery: [622, 619, 629], // Shael + Thul + Lem

	Test: [624, 624, 624]
};

var Runewords = {
	needList: [],
	pickitEntries: [],
	validGids: [],

	init: function () {
		if (!Config.MakeRunewords) {
			return;
		}

		var i, info, parsedLine;

		this.pickitEntries = [];

		// initiate pickit entries
		for (i = 0; i < Config.KeepRunewords.length; i += 1) {
			info = {
				file: "Character Config",
				line: Config.KeepRunewords[i]
			};

			parsedLine = NTIP.ParseLineInt(Config.KeepRunewords[i], info);

			if (parsedLine) {
				this.pickitEntries.push(NTIP.ParseLineInt(Config.KeepRunewords[i], info));
			}
		}

		// change text to classid
		for (i = 0; i < Config.Runewords.length; i += 1) {
			if (Config.Runewords[i][0] !== false) {
				if (isNaN(Config.Runewords[i][1])) {
					if (NTIPAliasClassID.hasOwnProperty(Config.Runewords[i][1].replace(/\s+/g, "").toLowerCase())) {
						Config.Runewords[i][1] = NTIPAliasClassID[Config.Runewords[i][1].replace(/\s+/g, "").toLowerCase()];
					} else {
						Misc.errorReport("ÿc1Invalid runewords entry:ÿc0 " + Config.Runewords[i][1]);
						Config.Runewords.splice(i, 1);

						i -= 1;
					}
				}
			}
		}

		this.buildLists();
	},

	validItem: function (item) {
		if (CraftingSystem.validGids.indexOf(item.gid) > -1) {
			return false;
		}

		return true;
	},

	// True if inv/stash holds every rune in the recipe (classids)
	haveRunes: function (runeIds) {
		var i, j, items, need;

		if (!runeIds || !runeIds.length) {
			return false;
		}

		items = me.findItems(-1, 0);
		need = runeIds.slice();

		if (!items) {
			return false;
		}

		for (i = 0; i < items.length; i += 1) {
			if (!this.validItem(items[i])) {
				continue;
			}

			for (j = 0; j < need.length; j += 1) {
				if (items[i].classid === need[j]) {
					need.splice(j, 1);
					break;
				}
			}

			if (!need.length) {
				return true;
			}
		}

		return false;
	},

	// Already wearing/stashing a finished Stealth (or other KeepRunewords armor match)
	hasCompletedArmorRuneword: function () {
		var item = me.getItem(-1),
			i;

		if (!item) {
			return false;
		}

		do {
			if (item.itemType === 3 && item.getFlag(0x4000000)) {
				if (this.pickitEntries.length) {
					if (NTIP.CheckItem(item, this.pickitEntries)) {
						return true;
					}
				} else if ((item.getStat(105) || 0) >= 10 && (item.getStat(99) || 0) >= 25) {
					// Stealth: +10 FCR / +25–30 FHR fallback if KeepRunewords not parsed yet
					return true;
				}
			}
		} while (item.getNext());

		return false;
	},

	// True if unit is an empty socket base we still need for a configured RW we have runes for
	wantBaseForRunes: function (unit) {
		var i, rw, sockets, ethFlag;

		if (!unit || unit.quality > 3 || unit.getItem()) {
			return false;
		}

		sockets = unit.getStat(194) || 0;

		if (sockets < 1) {
			return false;
		}

		// Don't hoard more Stealth bases once one is done
		if (unit.itemType === 3 && this.hasCompletedArmorRuneword()) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !rw[0] || rw[0] === false) {
				continue;
			}

			if (sockets !== rw[0].length) {
				continue;
			}

			if (unit.classid !== rw[1]) {
				continue;
			}

			ethFlag = rw[2] || 0;

			if (ethFlag === 1 && !unit.getFlag(0x400000)) {
				continue;
			}

			if (ethFlag === 2 && unit.getFlag(0x400000)) {
				continue;
			}

			// Already have an empty base for this recipe
			if (this.getBase(rw[0], rw[1], ethFlag)) {
				continue;
			}

			if (this.haveRunes(rw[0])) {
				return true;
			}
		}

		return false;
	},

	// build a list of needed runes. won't count runes until the base item is found for a given runeword
	buildLists: function () {
		var i, j, k, items, hel, baseCheck;

		this.validGids = [];
		this.needList = [];
		items = me.findItems(-1, 0);

		for (i = 0; i < Config.Runewords.length; i += 1) {
			if (!baseCheck) {
				baseCheck = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0)) || this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0), true);
			}

			if (this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0))) {
RuneLoop:
				for (j = 0; j < Config.Runewords[i][0].length; j += 1) {
					for (k = 0; k < items.length; k += 1) {
						if (items[k].classid === Config.Runewords[i][0][j] && this.validItem(items[k])) {
							this.validGids.push(items[k].gid);
							items.splice(k, 1);

							k -= 1;

							continue RuneLoop;
						}
					}

					this.needList.push(Config.Runewords[i][0][j]);
				}
			}
		}

		// hel rune for rerolling purposes (PD2 Hel = 642)
		if (baseCheck) {
			hel = me.getItem(642, 0);

			if (hel) {
				do {
					if (this.validGids.indexOf(hel.gid) === -1 && this.validItem(hel)) {
						this.validGids.push(hel.gid);

						return;
					}
				} while (hel.getNext());
			}

			this.needList.push(642);
		}
	},

	update: function (classid, gid) {
		var i;

		for (i = 0; i < this.needList.length; i += 1) {
			if (this.needList[i] === classid) {
				this.needList.splice(i, 1);

				i -= 1;

				break;
			}
		}

		this.validGids.push(gid);
	},

	// returns an array of items that make a runeword if found, false if we don't have enough items for any
	checkRunewords: function () {
		var i, j, k, items, base, itemList;

		items = me.findItems(-1, 0); // get items in inventory/stash

		for (i = 0; i < Config.Runewords.length; i += 1) {
			itemList = []; // reset item list
			base = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0)); // check base

			if (base) {
				itemList.push(base); // push the base

RuneLoop:
				for (j = 0; j < Config.Runewords[i][0].length; j += 1) {
					for (k = 0; k < items.length; k += 1) {
						if (items[k].classid === Config.Runewords[i][0][j]) { // rune matched
							itemList.push(items[k]); // push into the item list
							items.splice(k, 1); // remove from item list as to not count it twice

							k -= 1;

							break; // stop item cycle - we found the item
						}
					}

					if (itemList.length !== j + 2) { // can't complete runeword - go to next one
						break RuneLoop;
					}

					if (itemList.length === Config.Runewords[i][0].length + 1) { // runes + base
						return itemList; // these items are our runeword
					}
				}
			}
		}

		return false;
	},

	checkItem: function (unit) { // for pickit + MiniShopBot
		var runeType;

		if (!Config.MakeRunewords || !unit) {
			return false;
		}

		// Priority: empty RW base when we already have the runes (e.g. Tal+Eth → 2os armor for Stealth)
		if (this.wantBaseForRunes(unit)) {
			return true;
		}

		// Needed runes (PD2 singles=75, LoD=74, stacks=138)
		runeType = unit.itemType;

		if ((runeType === 74 || runeType === 75 || runeType === 138) && this.needList.indexOf(unit.classid) > -1) {
			return true;
		}

		return false;
	},

	keepItem: function (unit) { // for clearInventory - don't drop runes that are a part of runeword recipe
		return this.validGids.indexOf(unit.gid) > -1;
	},

	/* get the base item based on classid and runeword recipe
		optional reroll argument = gets a runeword that needs rerolling
		rigged to accept item or classid as 2nd arg
	*/
	getBase: function (runeword, base, ethFlag, reroll) {
		var item;

		if (typeof base === "object") {
			item = base;
		} else {
			item = me.getItem(base, 0);
		}

		if (item) {
			do {
				if (item && item.quality < 4 && item.getStat(194) === runeword.length) {
					/* check if item has items socketed in it
						better check than getFlag(0x4000000) because randomly socketed items return false for it
					*/

					if ((!reroll && !item.getItem()) || (reroll && item.getItem() && !NTIP.CheckItem(item, this.pickitEntries))) {
						if (!ethFlag || (ethFlag === 1 && item.getFlag(0x400000)) || (ethFlag === 2 && !item.getFlag(0x400000))) {
							return copyUnit(item);
						}
					}
				}
			} while (typeof base !== "object" && item.getNext());
		}

		return false;
	},

	socketItem: function (base, rune) { // args named this way to prevent confusion
		var i, tick;

		if (!rune.toCursor()) {
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			clickItem(0, base.x, base.y, base.location);

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!me.itemoncursor) {
					delay(300);

					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	getScroll: function () {
		var i, scroll, npc;

		scroll = me.getItem("tsc", 0) || me.getItem(546, 0); // PD2 tsc=546 (LoD was 529)

		if (scroll) {
			return scroll;
		}

		npc = Town.initNPC("Shop");

		if (!npc) {
			return false;
		}

		scroll = npc.getItem("tsc");

		if (scroll) {
			for (i = 0; i < 3; i += 1) {
				scroll.buy(true);

				if (me.getItem("tsc")) {
					break;
				}
			}
		}

		me.cancel();

		return me.getItem("tsc", 0) || me.getItem(546, 0);
	},

	makeRunewords: function () {
		if (!Config.MakeRunewords) {
			return false;
		}

		var i, items;

		while (true) {
			this.buildLists();

			items = this.checkRunewords(); // get a runeword. format = [base, runes...]

			if (!items) { // can't make runewords - exit loop
				break;
			}

			if (!Town.openStash()) {
				return false;
			}

			for (i = 1; i < items.length; i += 1) {
				this.socketItem(items[0], items[i]);
			}

			print("ÿc4Runewords: ÿc0Made runeword: " + items[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""));
			D2Bot.printToConsole("Made runeword: " + items[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""), 5);

			if (NTIP.CheckItem(items[0], this.pickitEntries)) {
				Misc.itemLogger("Runeword Kept", items[0]);
				Misc.logItem("Runeword Kept", items[0]);
			}
		}

		me.cancel();

		this.rerollRunewords();

		return true;
	},

	rerollRunewords: function () {
		var i, base, scroll, hel;

		for (i = 0; i < Config.Runewords.length; i += 1) {
			hel = me.getItem(624, 0);

			if (!hel) {
				return false;
			}

			base = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0), true); // get a bad runeword

			if (base) {
				scroll = this.getScroll();

				// failed to get scroll or open stash most likely means we're stuck somewhere in town, so it's better to return false
				if (!scroll || !Town.openStash() || !Cubing.emptyCube()) {
					return false;
				}

				// not a fatal error, if the cube can't be emptied, the func will return false on next cycle
				if (!Storage.Cube.MoveTo(base) || !Storage.Cube.MoveTo(hel) || !Storage.Cube.MoveTo(scroll)) {
					continue;
				}

				if (!Cubing.openCube()) { // probably only happens on server crash
					return false;
				}

				print("ÿc4Runewords: ÿc0Rerolling runeword: " + base.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""));
				D2Bot.printToConsole("Rerolling runeword: " + base.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, ""), 5);
				transmute();
				delay(500);

				if (!Cubing.emptyCube()) { // can't pull the item out = no space = fail
					return false;
				}
			}
		}

		this.buildLists();

		while (getUIFlag(0x1A) || getUIFlag(0x19)) {
			me.cancel();
			delay(300);
		}

		return true;
	}
};