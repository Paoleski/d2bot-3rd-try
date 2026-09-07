/**
*	@filename	Town.js
*	@author		kolton
*	@desc		do town chores like buying, selling and gambling
*/

var NPC = {
	Akara: getLocaleString(2892).toLowerCase(),
	Gheed: getLocaleString(2891).toLowerCase(),
	Charsi: getLocaleString(2894).toLowerCase(),
	Kashya: getLocaleString(2893).toLowerCase(),
	Warriv: getLocaleString(2895).toLowerCase(),

	Fara: getLocaleString(3025).toLowerCase(),
	Drognan: getLocaleString(3023).toLowerCase(),
	Elzix: getLocaleString(3030).toLowerCase(),
	Greiz: getLocaleString(3031).toLowerCase(),
	Lysander: getLocaleString(3026).toLowerCase(),
	Jerhyn: getLocaleString(3027).toLowerCase(),
	Meshif: getLocaleString(3032).toLowerCase(),
	Atma: getLocaleString(3024).toLowerCase(),

	Ormus: getLocaleString(1011).toLowerCase(),
	Alkor: getLocaleString(1010).toLowerCase(),
	Hratli: getLocaleString(1009).toLowerCase(),
	Asheara: getLocaleString(1008).toLowerCase(),

	Jamella: getLocaleString(1016).toLowerCase(),
	Halbu: getLocaleString(1017).toLowerCase(),
	Tyrael: getLocaleString(1013).toLowerCase(),

	Malah: getLocaleString(22478).toLowerCase(),
	Anya: getLocaleString(22477).toLowerCase(),
	Larzuk: getLocaleString(22476).toLowerCase(),
	Qual_Kehk: getLocaleString(22480).toLowerCase(),
	Nihlathak: getLocaleString(22483).toLowerCase(),

	Cain: getLocaleString(2890).toLowerCase()
};

if (typeof QuestItems === "undefined") {
	if (!isIncluded("common/QuestItems.js")) {
		include("common/QuestItems.js");
	}
}

var Town = {
	telekinesis: true,
	sellTimer: getTickCount(), // shop speedup test
	_walkStuckCount: 0, // consecutive walkToTown "stuck in area" — quit at 3

	tasks: [
		{Heal: NPC.Akara, Shop: NPC.Akara, Gamble: NPC.Gheed, Repair: NPC.Charsi, Merc: NPC.Kashya, Key: NPC.Akara, CainID: NPC.Cain},
		{Heal: NPC.Fara, Shop: NPC.Drognan, Gamble: NPC.Elzix, Repair: NPC.Fara, Merc: NPC.Greiz, Key: NPC.Lysander, CainID: NPC.Cain},
		{Heal: NPC.Ormus, Shop: NPC.Ormus, Gamble: NPC.Alkor, Repair: NPC.Hratli, Merc: NPC.Asheara, Key: NPC.Hratli, CainID: NPC.Cain},
		{Heal: NPC.Jamella, Shop: NPC.Jamella, Gamble: NPC.Jamella, Repair: NPC.Halbu, Merc: NPC.Tyrael, Key: NPC.Jamella, CainID: NPC.Cain},
		{Heal: NPC.Malah, Shop: NPC.Malah, Gamble: NPC.Anya, Repair: NPC.Larzuk, Merc: NPC.Qual_Kehk, Key: NPC.Malah, CainID: NPC.Cain}
	],

	ignoredItemTypes: [ // Items that won't be stashed
		5, // Arrows
		6, // Bolts
		18, // Book (Tome)
		22, // Scroll
		38, // Missile Potion
		41, // Key
		// PD2 ItemTypes from pd2data.mpq ItemTypes.txt
		76, // Healing Potion (hpot)
		77, // Mana Potion (mpot)
		78, // Rejuvenation Potion (rpot)
		79, // Stamina Potion
		80, // Antidote Potion
		81 // Thawing Potion
	],

	lastFullChores: 0,
	forceNextChores: false, // set true for boss prep (Andy antidotes / Duriel thawing, etc.)

	// Full vendor+stash pass only when something still needs doing
	needFullChores: function (repair) {
		var age, unids, items, i;

		if (this.forceNextChores || repair) {
			return true;
		}

		if (!this.lastFullChores) {
			return true; // first chores this game
		}

		age = getTickCount() - this.lastFullChores;

		// Just finished chores (WP → next objective) — only interrupt for heal
		if (age < 2 * 60 * 1000) {
			return this.needHealing();
		}

		// Field time — refresh even if checks look fine
		if (age > 4 * 60 * 1000) {
			return true;
		}

		if (this.needHealing()) {
			return true;
		}

		if (this.potionNeedCount("hp") > 0 || this.potionNeedCount("mp") > 0) {
			return true;
		}

		if (typeof Misc !== "undefined" && typeof Misc.needPotionTown === "function" && Misc.needPotionTown()) {
			return true;
		}

		if (typeof this.needKeys === "function" && this.needKeys()) {
			return true;
		}

		if (typeof this.needStash === "function" && this.needStash()) {
			return true;
		}

		unids = this.getUnids();

		if (unids && unids.length > 0) {
			return true;
		}

		items = Storage.Inventory.Compare(Config.Inventory);

		for (i = 0; !!items && i < items.length; i += 1) {
			if (typeof this.isTownJunk === "function" && this.isTownJunk(items[i])) {
				return true;
			}
		}

		// Within 4 min and nothing urgent — skip
		return false;
	},

	// Do town chores: ID → vendor (once) → stash (once if needed) → repair → done
	doChores: function (repair = false) {
		if (!me.inTown) {
			this.goToTown();
		}

		if (!this.needFullChores(repair)) {
			print("ÿc2Townÿc0 :: chores skip (already done / nothing needed)");
			this.forceNextChores = false;

			return true;
		}

		this.forceNextChores = false;
		this._manaOrgDone = false;

		var i, tasks,
			cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];

		Attack.weaponSwitch(Attack.getPrimarySlot());
		tasks = this.tasks[me.act - 1];

		// --- Local only (no NPC / stash walk) ---
		this.spendSkillStatPoints();
		Item.autoEquip();
		me.cancel();
		delay(100 + me.ping);

		// --- 1) ID only (Cain + charms) — no vendor / stash ---
		print("ÿc2Townÿc0 :: chores step 1/4 — ID");
		this.cainID();
		this.identifyAllCharms();
		me.cancel();
		delay(150 + me.ping);

		this.charmKeepList = null;
		this.applyCharmInventoryLock();
		this.organizeCharms(); // inv-only; never opens stash
		this.applyCharmInventoryLock();
		me.cancel();
		delay(100 + me.ping);

		// --- 2) ONE Shop trade ---
		print("ÿc2Townÿc0 :: chores step 2/4 — vendor (single trade)");

		// Belt refill only when empty slots exist (or wrong-column pots after config change)
		this.clearBeltStamina();
		this.refillBeltIfNeeded();

		if (tasks.Heal !== tasks.Shop && this.needHealing()) {
			this.heal();
			me.cancel();
			delay(150 + me.ping);
		}

		if (tasks.Heal === tasks.Shop && this.needHealing()) {
			this.heal();
		}

		this.fillTome("tbk");

		if (Config.FieldID) {
			this.fillTome("ibk");
		}

		this.identify();
		this.shopItems();
		this.buyPotions();

		if (tasks.Key === tasks.Shop) {
			this.buyKeys(true);
		}

		this.fillTome("tbk");
		me.cancel(); // close Shop once
		delay(150 + me.ping);

		this.refillBeltIfNeeded();

		if (tasks.Key !== tasks.Shop) {
			this.buyKeys();
			me.cancel();
			delay(100 + me.ping);
		}

		Item.autoEquip();
		Item.autoEquipMerc(true);
		this.buyMercWeapon();
		this.applyCharmInventoryLock();
		this.clearInventory(); // leftover sell only
		this.buyPoisonStrikeDagger();
		me.cancel();
		delay(150 + me.ping);

		// --- 3) Stash ONCE if needed (pots out + bank + gold in one open) ---
		print("ÿc2Townÿc0 :: chores step 3/4 — stash");
		this.doStashVisit(true);

		Cubing.doCubing();
		Runewords.makeRunewords();
		Item.autoEquip();
		Item.autoEquipMerc(true);

		// --- 4) Repair if needed ---
		print("ÿc2Townÿc0 :: chores step 4/4 — repair");
		this.repair(repair);
		me.cancel();
		delay(100 + me.ping);

		this.gamble();
		me.cancel();

		this.reviveMerc();
		Item.autoEquipMerc(true);
		// No second clearInventory — that was reopening the vendor after stash
		this.clearScrolls();
		this.dismissShopError();

		for (i = 0; i < cancelFlags.length; i += 1) {
			if (getUIFlag(cancelFlags[i])) {
				delay(500);
				me.cancel();

				break;
			}
		}

		me.cancel();
		this.dismissShopError();

		// Mana park once after buys/stash — not every mid-chore step
		this.organizeManaIfNeeded();

		this.lastFullChores = getTickCount();

		return true;
	},

	// PD2 charm itemTypes: 83 small / 84 large (cm2) / 85 grand (cm3). LoD was 82–84.
	// Never use type 82 — that is thawing potion on PD2.
	charmKeepList: null,

	isCharmItem: function (item) {
		var code;

		if (!item) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		if (code === "cm1" || code === "cm2" || code === "cm3") {
			return true;
		}

		// PD2 classids for SC/LC/GC
		if (item.classid === 621 || item.classid === 622 || item.classid === 623) {
			return true;
		}

		return item.itemType >= 83 && item.itemType <= 85;
	},

	// Keep rules from leveling_charms.nip ONLY — ignore kolton charm lines (too loose for sell).
	// Only lines with "#" (identified keep rules). Unid pick lines are never keep criteria.
	loadCharmKeepList: function () {
		var i, nipfile, lines, line, info, filepath, raw;

		if (this.charmKeepList) {
			return this.charmKeepList;
		}

		this.charmKeepList = [];
		filepath = "pickit/auto/leveling_charms.nip";

		if (!FileTools.exists(filepath) || typeof NTIP === "undefined" || typeof NTIP.ParseLineInt !== "function") {
			print("ÿc1Townÿc0 :: leveling_charms.nip missing — junk charms may not sell correctly");

			return this.charmKeepList;
		}

		try {
			nipfile = File.open(filepath, 0);
		} catch (eOpen) {
			nipfile = null;
		}

		if (!nipfile) {
			return this.charmKeepList;
		}

		lines = nipfile.readAllLines();
		nipfile.close();

		for (i = 0; i < lines.length; i += 1) {
			raw = lines[i];

			// Skip comments / blank / unid-only pick lines (no stat section)
			if (!raw || raw.replace(/\s+/g, "").indexOf("//") === 0) {
				continue;
			}

			if (raw.indexOf("#") === -1) {
				continue;
			}

			info = {
				line: i + 1,
				file: "leveling_charms.nip",
				string: raw
			};
			line = NTIP.ParseLineInt(raw, info);

			if (line) {
				this.charmKeepList.push(line);
			}
		}

		print("ÿc2Townÿc0 :: charm keep list " + this.charmKeepList.length + " identified-keep lines");

		return this.charmKeepList;
	},

	// Shop/Cain ID every inventory charm so sell can decide
	identifyAllCharms: function () {
		var item, tome, scroll, npc, gids = [], i, gid, unit, n = 0;

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && this.isCharmItem(item) && !item.getFlag(0x10)) {
					gids.push(item.gid);
				}
			} while (item.getNext());
		}

		if (!gids.length) {
			return true;
		}

		print("ÿc2Townÿc0 :: ID " + gids.length + " unid charm(s) before sell");

		if (Config.CainID && Config.CainID.Enable && this.cainID) {
			try {
				this.cainID();
			} catch (eCain) {}
		}

		tome = me.findItem("ibk", 0, 3) || me.findItem(536, 0, 3);

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			unit = me.getItem(-1, -1, gid);

			if (!unit || unit.location !== 3 || unit.getFlag(0x10)) {
				continue;
			}

			if (tome && tome.getStat(70) > 0) {
				this.identifyItem(unit, tome);
				n += 1;
				delay(me.ping + 50);
				continue;
			}

			if (!npc) {
				npc = this.initNPC("Shop", "idCharms");
			}

			if (!npc) {
				break;
			}

			scroll = this.getShopItem(npc, "isc", [547]);

			if (scroll && me.gold >= (scroll.getItemCost(0) || 100)) {
				try {
					scroll.buy();
				} catch (eBuy) {
					break;
				}

				scroll = me.findItem("isc", 0, 3);

				if (scroll) {
					this.identifyItem(unit, scroll);
					n += 1;
					delay(me.ping + 50);
				}
			}
		}

		if (n) {
			print("ÿc2Townÿc0 :: identified " + n + " charm(s)");
		}

		return true;
	},

	// Identified charm good enough to park/keep (not kolton)
	matchesLevelingCharmKeep: function (item) {
		var list, result;

		if (!item || !item.getFlag(0x10)) {
			return false;
		}

		// Unique/set charms (Anni, Torch, Gheed's, etc.)
		if (item.quality === 5 || item.quality === 7) {
			return true;
		}

		list = this.loadCharmKeepList();

		if (!list.length) {
			return false;
		}

		// verbose=false → CheckItem returns a number
		result = NTIP.CheckItem(item, list, false);

		return result === 1;
	},

	// Don't sell: unid (need ID) or identified charms that pass leveling keep nip
	isKeptCharm: function (item) {
		if (!this.isCharmItem(item)) {
			return false;
		}

		if (!item.getFlag(0x10)) {
			return true; // unidentified — ID first, then decide
		}

		return this.shouldParkCharm(item);
	},

	// Only move/lock into PD2 active rows if identified AND good enough for leveling
	shouldParkCharm: function (item) {
		if (!this.isCharmItem(item) || !item.getFlag(0x10)) {
			return false;
		}

		return this.matchesLevelingCharmKeep(item);
	},

	// Lock only cells occupied by parked (good) charms. Junk/unid stay unlocked → sellable after ID.
	applyCharmInventoryLock: function () {
		var item, r, c, y, x, h, w;

		for (r = 0; r < 8; r += 1) {
			if (!Config.Inventory[r] || Config.Inventory[r].length !== 10) {
				Config.Inventory[r] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
			} else {
				// Start fully unlocked each chores pass
				for (c = 0; c < 10; c += 1) {
					Config.Inventory[r][c] = 1;
				}
			}
		}

		item = me.getItem();

		if (item) {
			do {
				if (item.location === 3 && this.shouldParkCharm(item)) {
					for (h = 0; h < item.sizey; h += 1) {
						for (w = 0; w < item.sizex; w += 1) {
							y = item.y + h;
							x = item.x + w;

							if (y >= 0 && y < 8 && x >= 0 && x < 10) {
								Config.Inventory[y][x] = 0;
							}
						}
					}
				}
			} while (item.getNext());
		}

		return true;
	},

	// PD2: only bottom 4 inventory rows (y = 4..7) activate charms
	isCharmActiveRow: function (item) {
		return !!(item && item.location === 3 && item.y >= 4 && (item.y + item.sizey) <= 8);
	},

	findCharmSpot: function (item) {
		var row, col, r, c, ok,
			inv = Storage.Inventory;

		if (!item) {
			return false;
		}

		Storage.Reload();

		// Prefer bottom rows first (active zone). inv.buffer[row][col]
		for (row = 4; row <= 8 - item.sizey; row += 1) {
			for (col = 0; col <= 10 - item.sizex; col += 1) {
				ok = true;

				for (r = 0; r < item.sizey && ok; r += 1) {
					for (c = 0; c < item.sizex; c += 1) {
						if (inv.buffer[row + r][col + c] > 0) {
							ok = false;
							break;
						}
					}
				}

				if (ok) {
					// Storage.MoveTo uses {x: row, y: col}
					return {x: row, y: col};
				}
			}
		}

		return false;
	},

	// Move non-charms out of the active charm zone into top rows / stash
	clearCharmZoneCell: function (row, col) {
		var item, gid, spot;

		item = me.getItem(-1, 0);

		if (!item) {
			return true;
		}

		do {
			if (item.location !== 3 || this.isCharmItem(item) || this.isPotionItem(item)) {
				continue; // never stash/move pots via charm-zone cleanup
			}

			if (item.y <= row && item.y + item.sizey > row &&
					item.x <= col && item.x + item.sizex > col) {
				gid = item.gid;

				// Prefer parking junk in top 4 rows (inactive for charms)
				spot = this.findInvSpotInRows(item, 0, 3);

				if (spot) {
					if (!item.toCursor()) {
						return false;
					}

					clickItem(0, spot.y, spot.x, 3);
					delay(me.ping + 200);

					return !me.itemoncursor || !getUnit(100) || getUnit(100).gid !== gid;
				}

				// Prefer top rows only — never walk to stash mid-organize (stash is one chore step)
				return false;
			}
		} while (item.getNext());

		return true;
	},

	findInvSpotInRows: function (item, minRow, maxRow) {
		var row, col, r, c, ok,
			inv = Storage.Inventory;

		Storage.Reload();

		for (row = minRow; row <= maxRow - (item.sizey - 1); row += 1) {
			for (col = 0; col <= 10 - item.sizex; col += 1) {
				ok = true;

				for (r = 0; r < item.sizey && ok; r += 1) {
					for (c = 0; c < item.sizex; c += 1) {
						if (inv.buffer[row + r][col + c] > 0) {
							ok = false;
							break;
						}
					}
				}

				if (ok) {
					return {x: row, y: col};
				}
			}
		}

		return false;
	},

	// Classify potion: "hp"|"mp"|"rv"|"vps"|"yps"|"wms"|false
	// PD2: item.code is authoritative. classid/itemType can disagree (seen: mp1 + id=607 + type=77).
	potionKind: function (item) {
		var code, name;

		if (!item) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		name = item.name ? String(item.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		// 1) Code first — never let classid override mp*/hp*/rv*
		if (code.indexOf("hp") === 0) {
			return "hp";
		}

		if (code.indexOf("mp") === 0) {
			return "mp";
		}

		if (code.indexOf("rv") === 0) {
			return "rv";
		}

		if (code === "vps") {
			return "vps";
		}

		if (code === "yps") {
			return "yps"; // antidote — not stamina
		}

		if (code === "wms") {
			return "wms"; // thawing — not stamina
		}

		// 2) Name (when code missing / garbage)
		if (name.indexOf("mana") > -1) {
			return "mp";
		}

		if (name.indexOf("healing") > -1 || name.indexOf("health") > -1) {
			return "hp";
		}

		if (name.indexOf("rejuvenation") > -1 || name.indexOf("rejuv") > -1) {
			return "rv";
		}

		if (name.indexOf("antidote") > -1) {
			return "yps";
		}

		if (name.indexOf("thawing") > -1) {
			return "wms";
		}

		if (name.indexOf("stamina") > -1) {
			return "vps";
		}

		// 3) Classid / itemType only when code empty (alias tables disagree with live PD2 for pots)
		if (!code) {
			if ([604, 605, 606, 607, 608, 526, 528].indexOf(item.classid) > -1 || item.itemType === 76) {
				return "hp";
			}

			if ([609, 610, 611, 612, 613, 527, 529].indexOf(item.classid) > -1 || item.itemType === 77) {
				return "mp";
			}

			// Live lab: rvs=530; keep 532/533 for other builds. Never map 531 as rv (often yps).
			if (item.classid === 530 || item.classid === 532 || item.classid === 533 || item.itemType === 78) {
				return "rv";
			}

			if (item.itemType === 79) {
				return "vps";
			}

			if (item.itemType === 80 || item.classid === 531) {
				return "yps";
			}

			if (item.itemType === 81) {
				return "wms";
			}
		}

		return false;
	},

	// Field/belt pickable pots only (not antidote/thawing — those are Andy/Duriel shop prep)
	isPickablePotion: function (item) {
		var kind = this.potionKind(item);

		return kind === "hp" || kind === "mp" || kind === "rv" || kind === "vps";
	},

	// Inventory / belt potions — code + PD2 classids (itemType alone is unreliable)
	isInvPotion: function (item) {
		return !!(item && item.location === 3 && this.potionKind(item));
	},

	// Never stash consumable pots (belt/inv only)
	isPotionItem: function (item) {
		return !!this.potionKind(item);
	},

	// Belt capacity for a column type (e.g. mp with 3 columns × 3 rows = 9)
	beltCapacityFor: function (type) {
		var i, n = 0,
			beltSize = Storage.BeltSize();

		for (i = 0; i < 4; i += 1) {
			if (Config.BeltColumn[i] === type) {
				n += beltSize;
			}
		}

		return n;
	},

	// Dump every pot-like unit so we can see what the client reports
	logPotionState: function (tag) {
		var item, code, name, kind, where, n = 0, mpInv = 0, mpBelt = 0, hpInv = 0, hpBelt = 0,
			beltSize = Storage.BeltSize(),
			col = this.checkColumns(beltSize),
			samples = [], suspects = [], invDump = 0;

		print("ÿc2PotDbgÿc0 :: --- " + (tag || "state") + " --- beltSize=" + beltSize +
			" cols=[" + Config.BeltColumn.join(",") + "] emptySlots=[" + col.join(",") + "]" +
			" MPBuffer=" + (Config.MPBuffer || 0) + " HPBuffer=" + (Config.HPBuffer || 0) +
			" wantMp=" + this.potionNeedCount("mp") + " wantHp=" + this.potionNeedCount("hp"));

		item = me.getItem(-1, -1);

		if (!item) {
			print("ÿc1PotDbgÿc0 :: me.getItem empty");
			return;
		}

		do {
			code = item.code ? String(item.code) : "";
			name = item.name ? String(item.name).replace(/ÿc[0-9a-z]/gi, "") : "?";
			kind = this.potionKind(item);
			where = (item.mode === 2 || item.location === 2) ? "belt" : (item.location === 3 ? "inv" : ("loc" + item.location));

			// Always dump first ~20 inventory units (raw) so we can spot silent mismatches
			if (item.location === 3 && invDump < 20) {
				print("ÿc2PotDbgÿc0 :: inv#" + invDump + " kind=" + (kind || "NONE") +
					" code=" + code + " id=" + item.classid + " type=" + item.itemType +
					" mode=" + item.mode + " xy=" + item.x + "," + item.y + " name=" + name);
				invDump += 1;
			}

			if (!kind) {
				if ((item.location === 3 || item.mode === 2 || item.location === 2) &&
						((item.itemType >= 76 && item.itemType <= 82) ||
						name.toLowerCase().indexOf("mana") > -1 ||
						name.toLowerCase().indexOf("heal") > -1 ||
						name.toLowerCase().indexOf("potion") > -1 ||
						name.toLowerCase().indexOf("rejuv") > -1)) {
					if (suspects.length < 8) {
						suspects.push("UNK@" + where + " code=" + code + " id=" + item.classid +
							" type=" + item.itemType + " mode=" + item.mode + " name=" + name);
					}
				}

				continue;
			}

			n += 1;

			if (kind === "mp" && where === "inv") {
				mpInv += 1;
			}

			if (kind === "mp" && where === "belt") {
				mpBelt += 1;
			}

			if (kind === "hp" && where === "inv") {
				hpInv += 1;
			}

			if (kind === "hp" && where === "belt") {
				hpBelt += 1;
			}

			if (samples.length < 12) {
				samples.push(kind + "@" + where + " code=" + code + " id=" + item.classid +
					" type=" + item.itemType + " mode=" + item.mode + " loc=" + item.location + " name=" + name);
			}
		} while (item.getNext());

		print("ÿc2PotDbgÿc0 :: totals pots=" + n + " mp belt/inv=" + mpBelt + "/" + mpInv +
			" hp belt/inv=" + hpBelt + "/" + hpInv +
			" maxMp=" + this.beltCapacityFor("mp") + "+" + (Config.MPBuffer || 0));

		for (n = 0; n < samples.length; n += 1) {
			print("ÿc2PotDbgÿc0 ::  " + samples[n]);
		}

		for (n = 0; n < suspects.length; n += 1) {
			print("ÿc1PotDbgÿc0 :: suspect " + suspects[n]);
		}

		print("ÿc2PotDbgÿc0 :: countPotions mp inv/belt/all=" +
			Misc.countPotions("mp", "inv") + "/" + Misc.countPotions("mp", "belt") + "/" + Misc.countPotions("mp", "all"));
	},

	// Keep inv ≤ buffer; sell excess at shop (drink only if shop unavailable)
	cullExcessPotions: function () {
		var kind, kinds = ["hp", "mp", "rv", "vps"], list = {hp: [], mp: [], rv: [], vps: []},
			item, i, k, buf, excess, sold = 0, drunk = 0, shopOk;

		this.logPotionState("before cull");

		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location !== 3 || item.mode === 2) {
					continue;
				}

				kind = this.potionKind(item);

				if (kind && list[kind]) {
					list[kind].push(copyUnit(item));
				}
			} while (item.getNext());
		}

		shopOk = this.isShopOpen() || this.ensureShopOpen("cullPots");

		for (k = 0; k < kinds.length; k += 1) {
			kind = kinds[k];
			buf = kind === "hp" ? (Config.HPBuffer || 0) :
				kind === "mp" ? (Config.MPBuffer || 0) :
				kind === "rv" ? (Config.RejuvBuffer >= 0 ? Config.RejuvBuffer : 0) :
				((Config.StaminaUntilLevel && me.charlvl < Config.StaminaUntilLevel) ? (Config.StaminaBuffer || 0) : 0);

			excess = list[kind].length - buf;

			if (excess <= 0) {
				continue;
			}

			print("ÿc8PotDbgÿc0 :: cull " + kind + " inv=" + list[kind].length + " keep=" + buf + " excess=" + excess);

			for (i = 0; i < excess; i += 1) {
				item = me.getItem(-1, -1, list[kind][i].gid);

				if (!item || item.location !== 3) {
					continue;
				}

				if (shopOk) {
					try {
						item.sell();
						sold += 1;
						delay(40 + me.ping);
						continue;
					} catch (eSell) {}
				}

				try {
					item.interact();
					drunk += 1;
					delay(150 + me.ping);
				} catch (eDrink) {}
			}
		}

		print("ÿc2PotDbgÿc0 :: cull done sold=" + sold + " drunk=" + drunk);
		this.logPotionState("after cull");

		return sold + drunk;
	},

	// Mana buffer: always top-right 2×4 (cols 6–9, rows 0–1).
	// Only nudge left of key when the key itself is already on the right edge.
	// Never follow a left/mid key — that parked mana vertically on the left (light sorc bug).
	getInvKey: function () {
		// PD2: key=560. Never use 543 — that is aqv (arrows) on PD2.
		var item = me.getItem("key", 0) || me.getItem(560, 0);

		if (item && item.location === 3 && item.mode !== 2) {
			return item;
		}

		// Any inv key stack by code
		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location === 3 && item.mode !== 2 &&
						item.code && String(item.code).toLowerCase() === "key") {
					return copyUnit(item);
				}
			} while (item.getNext());
		}

		return false;
	},

	getManaParkZone: function () {
		var key = this.getInvKey(),
			minCol = 6,
			maxCol = 9,
			minRow = 0,
			maxRow = 1,
			parkWidth = 4;

		// Key must be in the park rows AND on the right half (col >= 6)
		if (key && key.y <= maxRow && key.x >= 6) {
			maxCol = key.x - 1;
			minCol = maxCol - (parkWidth - 1);

			// Stay on the right — never spill into cols 0–5
			if (minCol < 5) {
				minCol = 5;
			}

			if (maxCol < minCol || maxCol < 5) {
				minCol = 6;
				maxCol = 9;
			}
		}

		return {minCol: minCol, maxCol: maxCol, minRow: minRow, maxRow: maxRow, key: key || false};
	},

	isManaParked: function (item) {
		var kind, z;

		if (!item || item.location !== 3) {
			return false;
		}

		kind = this.potionKind(item);

		if (kind !== "mp") {
			return false;
		}

		z = this.getManaParkZone();

		return item.y >= z.minRow && (item.y + item.sizey - 1) <= z.maxRow &&
			item.x >= z.minCol && (item.x + item.sizex - 1) <= z.maxCol;
	},

	// Top 4 rows — generic (hp/rv); mana uses isManaParked
	isPotionParked: function (item) {
		var kind;

		if (!item || !this.isInvPotion(item)) {
			return false;
		}

		kind = this.potionKind(item);

		if (kind === "mp") {
			return this.isManaParked(item);
		}

		return item.y >= 0 && (item.y + item.sizey) <= 4;
	},

	// Mana: 4 cols × 2 rows, right→left within zone. Returns {x:row, y:col} for clickItem.
	findManaSpot: function (item) {
		var row, col, r, c, ok, z,
			inv = Storage.Inventory;

		if (!item) {
			return false;
		}

		z = this.getManaParkZone();
		Storage.Reload();

		for (row = z.minRow; row <= z.maxRow - (item.sizey - 1); row += 1) {
			for (col = z.maxCol - (item.sizex - 1); col >= z.minCol; col -= 1) {
				ok = true;

				for (r = 0; r < item.sizey && ok; r += 1) {
					for (c = 0; c < item.sizex; c += 1) {
						if (!inv.buffer[row + r] || inv.buffer[row + r][col + c] > 0) {
							ok = false;
							break;
						}
					}
				}

				if (ok) {
					return {x: row, y: col};
				}
			}
		}

		return false;
	},

	// Prefer top-right for non-mana pots (legacy)
	findPotionSpot: function (item) {
		var kind, row, col, r, c, ok,
			inv = Storage.Inventory;

		if (!item) {
			return false;
		}

		kind = this.potionKind(item);

		if (kind === "mp") {
			return this.findManaSpot(item);
		}

		Storage.Reload();

		for (row = 0; row <= 4 - item.sizey; row += 1) {
			for (col = 10 - item.sizex; col >= 0; col -= 1) {
				ok = true;

				for (r = 0; r < item.sizey && ok; r += 1) {
					for (c = 0; c < item.sizex; c += 1) {
						if (inv.buffer[row + r][col + c] > 0) {
							ok = false;
							break;
						}
					}
				}

				if (ok) {
					return {x: row, y: col};
				}
			}
		}

		return false;
	},

	// Clear blockers from a mana-park cell (never move parked mana or the key)
	clearManaParkCell: function (row, col) {
		var item, gid, spot, z, code;

		z = this.getManaParkZone();
		item = me.getItem(-1, -1);

		if (!item) {
			return true;
		}

		do {
			if (item.location !== 3) {
				continue;
			}

			if (this.isManaParked(item)) {
				continue;
			}

			code = item.code ? String(item.code).toLowerCase() : "";

			if (code === "key") {
				continue; // never shove the key
			}

			if (item.y <= row && item.y + item.sizey > row &&
					item.x <= col && item.x + item.sizex > col) {
				gid = item.gid;
				spot = this.findInvSpotInCols(item, 0, 3, 0, z.minCol - 1);

				if (!spot) {
					spot = this.findInvSpotInRows(item, 2, 7);
				}

				if (spot) {
					if (!item.toCursor()) {
						return false;
					}

					clickItem(0, spot.y, spot.x, 3);
					delay(me.ping + 200);

					return !me.itemoncursor || !getUnit(100) || getUnit(100).gid !== gid;
				}

				return false;
			}
		} while (item.getNext());

		return true;
	},

	findInvSpotInCols: function (item, minRow, maxRow, minCol, maxCol) {
		var row, col, r, c, ok,
			inv = Storage.Inventory;

		Storage.Reload();

		for (row = minRow; row <= maxRow - (item.sizey - 1); row += 1) {
			for (col = minCol; col <= maxCol - (item.sizex - 1); col += 1) {
				ok = true;

				for (r = 0; r < item.sizey && ok; r += 1) {
					for (c = 0; c < item.sizex; c += 1) {
						if (inv.buffer[row + r][col + c] > 0) {
							ok = false;
							break;
						}
					}
				}

				if (ok) {
					return {x: row, y: col};
				}
			}
		}

		return false;
	},

	// Put cursor item away without dropping potions (hp/mp/rv/stamina/tox).
	returnCursorSafe: function () {
		var cursor, kind, i, col, beltSize;

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor) {
			me.cancel();
			delay(50 + me.ping);

			return !me.itemoncursor;
		}

		kind = this.potionKind(cursor);

		me.cancel();
		delay(80 + me.ping);

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor) {
			return true;
		}

		if (kind) {
			// Any inventory cell — better than ground
			if (Storage.Inventory.CanFit(cursor) && Storage.Inventory.MoveTo(cursor)) {
				return true;
			}

			// Belt slot for hp/mp/rv
			if (kind === "hp" || kind === "mp" || kind === "rv") {
				beltSize = Storage.BeltSize();
				col = this.checkColumns(beltSize);

				for (i = 0; i < 4; i += 1) {
					if (Config.BeltColumn[i] !== kind || col[i] <= 0) {
						continue;
					}

					cursor = getUnit(100);

					if (!cursor || !me.itemoncursor) {
						return true;
					}

					clickItem(0, i, 0, 2);
					delay(me.ping + 120);

					if (!me.itemoncursor) {
						return true;
					}
				}
			}

			// Drink rather than drop
			cursor = getUnit(100);

			if (cursor && me.itemoncursor) {
				print("ÿc8Townÿc0 :: cursor " + kind + " — drink instead of drop");

				try {
					cursor.interact();
				} catch (eDrink) {}

				delay(120 + me.ping);
			}

			if (me.itemoncursor) {
				me.cancel();
				delay(50 + me.ping);
			}

			return !me.itemoncursor;
		}

		if (Storage.Inventory.CanFit(cursor) && Storage.Inventory.MoveTo(cursor)) {
			return true;
		}

		Misc.click(0, 0, me);
		delay(me.ping + 150);

		if (me.itemoncursor) {
			cursor = getUnit(100);

			// Still no — only drop non-potions
			if (cursor && !this.potionKind(cursor)) {
				try {
					cursor.drop();
				} catch (eDrop) {}
			} else {
				me.cancel();
			}
		}

		return !me.itemoncursor;
	},

	// Place a potion onto inventory without Storage.MoveTo (FindSpot = vertical left dump).
	// Mana → key-anchored park; other pots → top-right; returns false if no spot.
	placeInvPotion: function (item) {
		var kind, spot, gid, cursor, tries, r, c, z, moved;

		if (!item) {
			return false;
		}

		kind = this.potionKind(item);
		gid = item.gid;

		// Already parked mana — don't shuffle/reprint
		if (kind === "mp" && item.location === 3 && !me.itemoncursor && this.isManaParked(item)) {
			return true;
		}

		Storage.Reload();

		if (kind === "mp") {
			spot = this.findManaSpot(item);
			z = this.getManaParkZone();

			for (tries = 0; !spot && tries < 8; tries += 1) {
				moved = false;

				for (r = z.minRow; r <= z.maxRow && !moved; r += 1) {
					for (c = z.maxCol; c >= z.minCol; c -= 1) {
						if (Storage.Inventory.buffer[r] && Storage.Inventory.buffer[r][c] > 0) {
							if (this.clearManaParkCell(r, c)) {
								moved = true;
								Storage.Reload();
								item = me.getItem(-1, -1, gid) || getUnit(100);
								spot = item ? this.findManaSpot(item) : false;
								break;
							}
						}
					}
				}

				if (!moved) {
					break;
				}
			}
		} else {
			spot = this.findPotionSpot(item);

			if (!spot) {
				spot = this.findInvSpotInCols(item, 0, 3, 0, 9);
			}
		}

		if (!spot) {
			print("ÿc8Townÿc0 :: placeInvPotion — no spot for " + kind);
			return false;
		}

		if (!me.itemoncursor) {
			item = me.getItem(-1, -1, gid);

			if (!item || !item.toCursor()) {
				return false;
			}
		}

		clickItem(0, spot.y, spot.x, 3);
		delay(me.ping + 150);

		if (me.itemoncursor) {
			// Never drop pots via click-on-char — restore safely
			this.returnCursorSafe();

			return !me.itemoncursor;
		}

		if (kind === "mp") {
			print("ÿc2Townÿc0 :: mana placed col=" + spot.y + " row=" + spot.x);
		}

		return true;
	},

	organizePotions: function () {
		return this.organizeManaIfNeeded();
	},

	needsManaOrganize: function () {
		var item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.location === 3 && item.mode !== 2 &&
					this.potionKind(item) === "mp" && !this.isManaParked(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Park inv mana in key-anchored 2×4. Only when unparked mana exists.
	// Never Storage.MoveTo — that dumps left (FindSpot scans from col 0).
	// Once per chores pass (flag cleared at doChores start).
	organizeManaIfNeeded: function () {
		var pots = [], item, i, spot, gid, tries, r, c, moved, z;

		if (this._manaOrgDone) {
			return true;
		}

		if (!me.inTown || this.isShopOpen() || getUIFlag(0x1A) || getUIFlag(0x19)) {
			return false;
		}

		if (!this.needsManaOrganize()) {
			this._manaOrgDone = true;

			return true;
		}

		this._manaOrgDone = true;
		z = this.getManaParkZone();

		me.cancel();
		delay(80 + me.ping);
		Storage.Reload();

		if (z.key && z.key.y <= z.maxRow && z.key.x >= 6) {
			print("ÿc2Townÿc0 :: key @ col=" + z.key.x + " row=" + z.key.y +
				" → mana cols " + z.minCol + "-" + z.maxCol + " rows " + z.minRow + "-" + z.maxRow);
		} else if (z.key) {
			print("ÿc2Townÿc0 :: key @ col=" + z.key.x + " row=" + z.key.y +
				" ignored (not right-edge) — mana cols " + z.minCol + "-" + z.maxCol);
		} else {
			print("ÿc2Townÿc0 :: no top-right key — mana default cols " + z.minCol + "-" + z.maxCol);
		}

		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location === 3 && item.mode !== 2 &&
						this.potionKind(item) === "mp" && !this.isManaParked(item)) {
					pots.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		if (!pots.length) {
			return true;
		}

		print("ÿc2Townÿc0 :: parking " + pots.length + " mana → cols " +
			z.minCol + "-" + z.maxCol + " rows " + z.minRow + "-" + z.maxRow);

		for (i = 0; i < pots.length; i += 1) {
			item = me.getItem(-1, -1, pots[i].gid);

			if (!item || item.location !== 3 || this.isManaParked(item)) {
				continue;
			}

			gid = item.gid;
			spot = this.findManaSpot(item);

			for (tries = 0; !spot && tries < 10; tries += 1) {
				moved = false;

				for (r = z.minRow; r <= z.maxRow && !moved; r += 1) {
					for (c = z.maxCol; c >= z.minCol; c -= 1) {
						if (Storage.Inventory.buffer[r] && Storage.Inventory.buffer[r][c] > 0) {
							item = me.getItem(-1, -1, gid);

							if (!item) {
								break;
							}

							if (this.clearManaParkCell(r, c)) {
								moved = true;
								Storage.Reload();
								spot = this.findManaSpot(item);
								break;
							}
						}
					}
				}

				if (!moved) {
					break;
				}
			}

			item = me.getItem(-1, -1, gid);

			if (!item || !spot) {
				continue;
			}

			if (!item.toCursor()) {
				continue;
			}

			// clickItem(btn, col, row, inv) — spot.y=col, spot.x=row
			clickItem(0, spot.y, spot.x, 3);
			delay(me.ping + 200);

			if (me.itemoncursor) {
				// Never drop mana — cancel / MoveTo / belt / drink
				if (typeof Town !== "undefined" && typeof Town.returnCursorSafe === "function") {
					Town.returnCursorSafe();
				} else {
					me.cancel();
					delay(80 + me.ping);
				}
			} else {
				print("ÿc2Townÿc0 :: mana parked col=" + spot.y + " row=" + spot.x);
			}
		}

		me.cancel();
		Storage.Reload();

		return true;
	},

	// True if any belt column for hp/mp/rv has empty slots AND we have that type in inventory
	beltNeedsRefill: function () {
		var i, beltSize, col, kind;

		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);

		for (i = 0; i < 4; i += 1) {
			kind = Config.BeltColumn[i];

			if (col[i] > 0 && (kind === "hp" || kind === "mp" || kind === "rv") &&
					Misc.countPotions(kind, "inv") > 0) {
				return true;
			}
		}

		return false;
	},

	// True if a belt pot sits in a column configured for a different type
	beltHasWrongPots: function () {
		var item, kind, want;

		item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.mode !== 2 && item.location !== 2) {
				continue;
			}

			kind = this.potionKind(item);

			if (!kind || kind === "vps") {
				continue;
			}

			want = Config.BeltColumn[item.x % 4];

			if (want && want !== kind) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Fill empty matching belt slots from inventory — only when needed
	refillBeltIfNeeded: function () {
		var i, n = 0;

		if (this.beltHasWrongPots()) {
			this.clearBelt();
		}

		if (!this.beltNeedsRefill()) {
			return false;
		}

		for (i = 0; i < 12 && this.refillBeltFromInventory(); i += 1) {
			n += 1;
		}

		return n > 0;
	},

	organizeCharms: function () {
		var charms = [], item, i, spot, gid, tries, r, c, moved, cursor;

		if (!me.inTown) {
			return false;
		}

		me.cancel();
		delay(100 + me.ping);
		Storage.Reload();

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && this.shouldParkCharm(item) && !this.isCharmActiveRow(item)) {
					charms.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		if (!charms.length) {
			return true;
		}

		// Largest first (grand → large → small)
		charms.sort(function (a, b) {
			return (b.sizex * b.sizey) - (a.sizex * a.sizey);
		});

		print("ÿc2Townÿc0 :: Moving " + charms.length + " charm(s) to PD2 active rows (bottom 4)");

		for (i = 0; i < charms.length; i += 1) {
			item = me.getItem(-1, -1, charms[i].gid);

			if (!item || item.location !== 3 || this.isCharmActiveRow(item)) {
				continue;
			}

			gid = item.gid;
			spot = this.findCharmSpot(item);

			// Make room: clear blockers in charm zone
			for (tries = 0; !spot && tries < 12; tries += 1) {
				moved = false;

				for (r = 4; r < 8 && !moved; r += 1) {
					for (c = 0; c < 10; c += 1) {
						if (Storage.Inventory.buffer[r][c] > 0) {
							item = me.getItem(-1, -1, gid);

							if (!item) {
								break;
							}

							if (this.clearCharmZoneCell(r, c)) {
								moved = true;
								Storage.Reload();
								spot = this.findCharmSpot(item);
								break;
							}
						}
					}
				}

				if (!moved) {
					break;
				}
			}

			item = me.getItem(-1, -1, gid);

			if (!item || !spot) {
				print("ÿc8Townÿc0 :: No room in charm zone for " + (charms[i].name || "charm"));
				continue;
			}

			if (!item.toCursor()) {
				continue;
			}

			clickItem(0, spot.y, spot.x, 3);
			delay(me.ping + 250);

			if (me.itemoncursor) {
				cursor = getUnit(100);

				if (cursor) {
					Storage.Inventory.MoveTo(cursor);
				}
			} else {
				print("ÿc2Townÿc0 :: Charm parked at row " + spot.x + " col " + spot.y);
			}
		}

		me.cancel();
		Storage.Reload();

		return true;
	},

	// Spend banked skill/stat points while in town (AutoSkill UI-click + AutoStat)
	spendSkillStatPoints: function () {
		var spent = false;

		try {
			if (Config.AutoSkill && Config.AutoSkill.Enabled && me.getStat(5) > (Config.AutoSkill.Save || 0)) {
				if (!isIncluded("common/AutoSkill.js")) {
					include("common/AutoSkill.js");
				}

				print("ÿc2Townÿc0 :: Spending " + me.getStat(5) + " skill point(s)");
				me.cancel();
				delay(250 + me.ping);
				AutoSkill.init(Config.AutoSkill.Build, Config.AutoSkill.Save);
				spent = true;
			}

			if (Config.AutoStat && Config.AutoStat.Enabled && me.getStat(4) > (Config.AutoStat.Save || 0)) {
				if (!isIncluded("common/AutoStat.js")) {
					include("common/AutoStat.js");
				}

				print("ÿc2Townÿc0 :: Spending " + me.getStat(4) + " stat point(s)");
				AutoStat.init(Config.AutoStat.Build, Config.AutoStat.Save, Config.AutoStat.BlockChance, Config.AutoStat.UseBulk);
				spent = true;
			}
		} catch (e) {
			print("ÿc1Town.spendSkillStatPoints: " + e);
		}

		if (spent) {
			me.cancel();
			delay(300 + me.ping);
		}

		return true;
	},

	checkQuestItems: function () {
		var i, npc, item,
			canAct3 = me.act >= 3 || Pather.accessToAct(3) || me.getQuest(15, 0) || me.getQuest(15, 1);

		// Golden bird / jade — match by code (classid alone false-hits cube on PD2)
		if (QuestItems.has(QuestItems.jade, "j34")) {
			if (!canAct3) {
				print("ÿc8Townÿc0 :: jade figurine held but Act3 not open — skip Meshif until Duriel done");
			} else {
				this.goToTown(3);
				this.move(NPC.Meshif);

				npc = getUnit(1, NPC.Meshif);

				if (npc) {
					npc.openMenu();
					me.cancel();
				}
			}
		}

		if (QuestItems.has(QuestItems.goldenBird, "g34")) {
			if (!canAct3) {
				print("ÿc8Townÿc0 :: golden bird held but Act3 not open — skip Alkor until Duriel done");
			} else {
				this.goToTown(3);
				this.move(NPC.Alkor);

				npc = getUnit(1, NPC.Alkor);

				if (npc) {
					for (i = 0; i < 2; i += 1) {
						npc.openMenu();
						me.cancel();
					}
				}
			}
		}

		item = QuestItems.find(QuestItems.lifePotion, "xyz");

		if (item) {
			if (item.location > 3) {
				this.openStash();
			}

			item.interact();
		}
	},

	// Start a task and return the NPC Unit
	initNPC: function (task, reason) {
		var npc = getInteractedNPC();

		if (npc && npc.name.toLowerCase() !== this.tasks[me.act - 1][task]) {
			me.cancel();

			npc = null;
		}

		// Jamella gamble fix
		if (task === "Gamble" && npc && npc.name.toLowerCase() === NPC.Jamella) {
			me.cancel();

			npc = null;
		}

		// Already in trade with the right NPC — keep the same window
		if (npc && (task === "Shop" || task === "Repair" || task === "Gamble" || task === "Key") && getUIFlag(0x0C)) {
			return npc;
		}

		if (!npc) {
			print("ÿc2Townÿc0 :: " + reason + " → " + this.tasks[me.act - 1][task]);
			npc = getUnit(1, this.tasks[me.act - 1][task]);

			// Always walk up if missing or too far — getUnit can see NPCs across town
			if (!npc || getDistance(me, npc) > 5) {
				this.move(this.tasks[me.act - 1][task]);
				npc = getUnit(1, this.tasks[me.act - 1][task]);
			}
		}

		if (!npc || npc.area !== me.area || (!getUIFlag(0x08) && !npc.openMenu())) {
			return false;
		}

		switch (task) {
		case "Shop":
		case "Repair":
		case "Gamble":
			if (!getUIFlag(0x0C) && !npc.startTrade(task)) {
				return false;
			}

			break;
		case "Key":
			if (!getUIFlag(0x0C) && !npc.startTrade(me.act === 3 ? "Repair" : "Shop")) {
				me.cancel();

				return false;
			}

			break;
		case "CainID":
			Misc.useMenu(0x0FB4);
			me.cancel();

			break;
		}

		return npc;
	},

	// Go to a town healer
	heal: function () {
		if (!this.needHealing()) {
			return true;
		}

		if (!this.initNPC("Heal", "heal")) {
			return false;
		}

		return true;
	},

	// Check if healing is needed, based on character config
	needHealing: function () {
		var hpPct = me.hpmax > 0 ? (me.hp * 100 / me.hpmax) : 100,
			mpPct = me.mpmax > 0 ? (me.mp * 100 / me.mpmax) : 100;

		if (hpPct <= Config.HealHP || mpPct <= Config.HealMP) {
			return true;
		}

		// Not full and thresholds allow "any missing" when set to 100
		if (Config.HealHP >= 100 && me.hp < me.hpmax) {
			return true;
		}

		if (Config.HealMP >= 100 && me.mp < me.mpmax) {
			return true;
		}

		// Status effects
		if (Config.HealStatus && (me.getState(2) || me.getState(9) || me.getState(61))) {
			return true;
		}

		return false;
	},

	// Move inventory hp/mp/rv onto matching empty belt columns.
	// Must NOT run with shop/stash open — clicks fail and used to false-loop.
	// Returns true only if at least one pot actually landed on the belt.
	refillBeltFromInventory: function () {
		var i, items = [], item, beltSize, col, moved = 0, potType, gid, before, after, cursor;

		if (this.isShopOpen() || getUIFlag(0x1A) || getUIFlag(0x19)) {
			return false;
		}

		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);
		item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.location !== 3 || item.mode === 2) {
				continue;
			}

			potType = this.potionKind(item);

			if (potType === "hp" || potType === "mp" || potType === "rv") {
				items.push(copyUnit(item));
			}
		} while (item.getNext());

		if (!items.length) {
			return false;
		}

		// HP first when hp columns need fill
		items.sort(function (a, b) {
			var ra = Town.potionKind(a) === "hp" ? 0 : 1,
				rb = Town.potionKind(b) === "hp" ? 0 : 1;

			if (ra !== rb) {
				return ra - rb;
			}

			return b.classid - a.classid;
		});

		while (items.length) {
			item = me.getItem(-1, -1, items.shift().gid);

			if (!item || item.location !== 3) {
				continue;
			}

			potType = this.potionKind(item);

			if (potType !== "hp" && potType !== "mp" && potType !== "rv") {
				continue;
			}

			for (i = 0; i < 4; i += 1) {
				if (col[i] <= 0 || Config.BeltColumn[i] !== potType) {
					continue;
				}

				gid = item.gid;
				before = col[i];

				// Always cursor → belt (clickItem(2,...) can drink on some builds)
				if (!item.toCursor()) {
					break;
				}

				clickItem(0, i, 0, 2);
				delay(me.ping + 150);

				if (me.itemoncursor) {
					// Put back — never drop pots
					if (typeof this.returnCursorSafe === "function") {
						this.returnCursorSafe();
					} else {
						me.cancel();
						delay(80 + me.ping);
					}

					delay(50 + me.ping);
					break;
				}

				after = this.checkColumns(beltSize);
				item = me.getItem(-1, -1, gid);

				// Success = column filled or pot now on belt
				if (after[i] < before || (item && item.mode === 2)) {
					col = after;
					moved += 1;
				} else {
					col = after;
				}

				break;
			}
		}

		if (moved) {
			print("ÿc2Townÿc0 :: refilled belt from inventory (" + moved + ")");
		}

		return moved > 0;
	},

	buyPotions: function () {
		// Inventory gold only — never pull from stash for pots
		if (me.gold < (me.charlvl < 12 ? 50 : 500)) {
			return false;
		}

		this.clearBeltStamina();

		var i, j, npc, col, beltSize, pot, stamBuffer,
			needPots = false,
			needBuffer = false,
			needStamina = false,
			buffer = {hp: 0, mp: 0, vps: 0},
			shopWasOpen = this.isShopOpen(),
			refillTries, beforeEmpty, afterEmpty, bought, wantHp, wantMp;

		this.logPotionState("buyPotions start");

		// Refill belt from inv only when slots empty / wrong column (not every town)
		if (!shopWasOpen) {
			this.refillBeltIfNeeded();
		}

		stamBuffer = (Config.StaminaUntilLevel && me.charlvl < Config.StaminaUntilLevel) ? (Config.StaminaBuffer || 0) : 0;
		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);

		// Always count inv pots (code/classid) — this is what stops "buy forever"
		buffer.hp = (typeof Misc.countPotions === "function") ? Misc.countPotions("hp", "inv") : 0;
		buffer.mp = (typeof Misc.countPotions === "function") ? Misc.countPotions("mp", "inv") : 0;
		buffer.vps = 0;

		if (stamBuffer > 0) {
			pot = me.getItem(-1, 0);

			if (pot) {
				do {
					if (pot.location === 3 && (String(pot.code || "").toLowerCase() === "vps" || pot.itemType === 79)) {
						buffer.vps += 1;
					}
				} while (pot.getNext());
			}
		}

		wantHp = this.potionNeedCount("hp");
		wantMp = this.potionNeedCount("mp");

		if (wantHp <= 0 && wantMp <= 0 && buffer.vps >= stamBuffer) {
			print("ÿc2Townÿc0 :: pots OK (inv mp=" + buffer.mp + " hp=" + buffer.hp + ") — skip buy");
			this.cullExcessPotions();

			return true;
		}

		for (i = 0; i < 4; i += 1) {
			if (["hp", "mp"].indexOf(Config.BeltColumn[i]) > -1 && col[i] > 0) {
				// Only buy for belt if that type still needs slots AND inv isn't already overflowing buffer
				if (Config.BeltColumn[i] === "mp" && buffer.mp > (Config.MPBuffer || 0) && col[i] === 0) {
					continue;
				}

				needPots = true;
			}
		}

		needBuffer = (buffer.hp < (Config.HPBuffer || 0)) || (buffer.mp < (Config.MPBuffer || 0));
		needStamina = buffer.vps < stamBuffer;

		if (needStamina) {
			for (i = 0; i < 4; i += 1) {
				if (col[i] > 0) {
					needStamina = false;
					break;
				}
			}
		}

		if (!needPots && !needBuffer && !needStamina) {
			this.cullExcessPotions();

			return true;
		}

		npc = this.initNPC("Shop", "buyPotions");

		if (!npc) {
			return false;
		}

		// Belt fill — stop a column if buys spill into inventory (empty count doesn't drop)
		for (i = 0; i < 4; i += 1) {
			if (col[i] <= 0 || ["hp", "mp"].indexOf(Config.BeltColumn[i]) === -1) {
				continue;
			}

			// Already have inv buffer+ — only top up fully empty belt columns
			if (Config.BeltColumn[i] === "mp" && buffer.mp >= (Config.MPBuffer || 0) && col[i] < beltSize) {
				continue;
			}

			if (Config.BeltColumn[i] === "hp" && buffer.hp >= (Config.HPBuffer || 0) && col[i] < beltSize) {
				continue;
			}

			for (j = 0; j < col[i]; j += 1) {
				pot = this.getPotion(npc, Config.BeltColumn[i]);

				if (!pot) {
					break;
				}

				beforeEmpty = this.checkColumns(beltSize)[i];

				try {
					pot.buy(false);
				} catch (eBuy) {
					print("ÿc1Townÿc0 :: pot.buy failed: " + eBuy);
					break;
				}

				delay(50 + me.ping);
				afterEmpty = this.checkColumns(beltSize)[i];

				// Buy didn't land on belt → went to inv; stop flooding
				if (afterEmpty >= beforeEmpty) {
					print("ÿc8Townÿc0 :: " + Config.BeltColumn[i] + " buy spilled to inv — stop column " + i);
					break;
				}
			}

			col = this.checkColumns(beltSize);
			buffer.mp = Misc.countPotions("mp", "inv");
			buffer.hp = Misc.countPotions("hp", "inv");
		}

		// Inv buffer only — never more than Config.*Buffer
		buffer.hp = Misc.countPotions("hp", "inv");
		buffer.mp = Misc.countPotions("mp", "inv");

		if ((Config.HPBuffer || 0) > buffer.hp) {
			for (i = 0; i < (Config.HPBuffer || 0) - buffer.hp; i += 1) {
				pot = this.getPotion(npc, "hp");

				if (!pot || !Storage.Inventory.CanFit(pot)) {
					break;
				}

				pot.buy(false);
				delay(30 + me.ping);
			}
		}

		buffer.mp = Misc.countPotions("mp", "inv");

		if ((Config.MPBuffer || 0) > buffer.mp) {
			for (i = 0; i < (Config.MPBuffer || 0) - buffer.mp; i += 1) {
				pot = this.getPotion(npc, "mp");

				if (!pot || !Storage.Inventory.CanFit(pot)) {
					break;
				}

				pot.buy(false);
				delay(30 + me.ping);
				buffer.mp = Misc.countPotions("mp", "inv");

				if (buffer.mp >= (Config.MPBuffer || 0)) {
					break;
				}
			}
		}

		if (stamBuffer > buffer.vps) {
			col = this.checkColumns(beltSize);
			needStamina = true;

			for (i = 0; i < 4; i += 1) {
				if (col[i] > 0) {
					needStamina = false;
					break;
				}
			}

			if (needStamina) {
				for (i = 0; i < stamBuffer - buffer.vps; i += 1) {
					pot = this.getPotion(npc, "vps");

					if (!pot || !Storage.Inventory.CanFit(pot)) {
						break;
					}

					try {
						pot.buy(false);
						delay(50 + me.ping);
					} catch (eStam) {
						break;
					}
				}
			}
		}

		// Sell inv above MPBuffer/HPBuffer while vendor is still open
		this.cullExcessPotions();
		this.logPotionState("buyPotions end");

		return true;
	},

	// Check when to shift-buy potions
	shiftCheck: function (col, beltSize) {
		var i, fillType;

		for (i = 0; i < col.length; i += 1) {
			// Set type based on non-empty column
			if (!fillType && col[i] > 0 && col[i] < beltSize) {
				fillType = Config.BeltColumn[i];
			}

			if (col[i] >= beltSize) {
				switch (Config.BeltColumn[i]) {
				case "hp":
					// Set type based on empty column
					if (!fillType) {
						fillType = "hp";
					}

					// Can't shift+buy if we need to get differnt potion types
					if (fillType !== "hp") {
						return false;
					}

					break;
				case "mp":
					if (!fillType) {
						fillType = "mp";
					}

					if (fillType !== "mp") {
						return false;
					}

					break;
				case "rv": // Empty rejuv column = can't shift-buy
					return false;
				}
			}
		}

		return true;
	},

	// Return empty slots needed per belt column (0 = full)
	checkColumns: function (beltSize) {
		var col = [beltSize, beltSize, beltSize, beltSize],
			pot = me.getItem(-1, -1),
			slot;

		if (!beltSize) {
			beltSize = 1;
			col = [1, 1, 1, 1];
		}

		if (!pot) {
			return col;
		}

		do {
			// PD2: belt pots may be mode 2 and/or location 2 (Storage.Belt)
			if (pot.mode === 2 || pot.location === 2) {
				slot = pot.x % 4;

				if (slot >= 0 && slot < 4 && col[slot] > 0) {
					col[slot] -= 1;
				}
			}
		} while (pot.getNext());

		return col;
	},

	// How many pots of type we still want (belt columns + inv buffer). Stash does not count.
	potionNeedCount: function (type) {
		var i, beltSize, col, need = 0, inv, buf;

		if (type !== "hp" && type !== "mp") {
			return 0;
		}

		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);

		for (i = 0; i < 4; i += 1) {
			if (Config.BeltColumn[i] === type && col[i] > 0) {
				need += col[i];
			}
		}

		inv = (typeof Misc.countPotions === "function") ? Misc.countPotions(type, "inv") : 0;
		buf = type === "hp" ? (Config.HPBuffer || 0) : (Config.MPBuffer || 0);

		if (inv < buf) {
			need += (buf - inv);
		}

		return need;
	},

	// True if any potion sits in stash (no UI needed — location 7 is readable)
	hasStashedPotions: function () {
		var item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.location === 7 && this.isPotionItem(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Pull pots out of stash into inventory (never leave consumables banked)
	// keepOpen: leave stash UI open for doStashVisit
	retrieveStashedPotions: function (keepOpen) {
		var item, list = [], i, moved = 0, wasOpen;

		if (!this.hasStashedPotions()) {
			return false;
		}

		wasOpen = !!getUIFlag(0x19);

		if (!wasOpen && !this.openStash()) {
			return false;
		}

		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location === 7 && this.isPotionItem(item)) {
					list.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		for (i = 0; i < list.length; i += 1) {
			item = me.getItem(-1, -1, list[i].gid);

			if (!item || item.location !== 7) {
				continue;
			}

			// Never Storage.MoveTo for pots — dumps vertical left (FindSpot col 0)
			if (this.potionKind(item) === "mp" || this.potionKind(item) === "hp" || this.potionKind(item) === "rv") {
				if (!item.toCursor()) {
					continue;
				}

				if (this.placeInvPotion(item)) {
					moved += 1;
					delay(me.ping + 100);
				} else if (me.itemoncursor) {
					me.cancel();
				}
			} else if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) {
				moved += 1;
				delay(me.ping + 100);
			}
		}

		if (moved) {
			print("ÿc2Townÿc0 :: retrieved " + moved + " potion(s) from stash");
		}

		if (!keepOpen && !wasOpen) {
			me.cancel();
			delay(100 + me.ping);
		}

		return moved > 0;
	},

	// Get a potion from current npc — cap tier while leveling; try code, classid, then shop scan
	getPotion: function (npc, type) {
		var i, result, maxTier, item, best, bestTier, code, tier,
			classIds = {
				hp: [604, 605, 606, 607, 608], // hp1–hp5 (PD2)
				mp: [609, 610, 611, 612, 613]  // mp1–mp5 (PD2)
			};

		if (!type || !npc) {
			return false;
		}

		if (me.charlvl < 6) {
			maxTier = 1;
		} else if (me.charlvl < 12) {
			maxTier = 2;
		} else if (me.charlvl < 18) {
			maxTier = 3;
		} else if (me.charlvl < 24) {
			maxTier = 4;
		} else {
			maxTier = 5;
		}

		if (type === "vps") { // Stamina potion — code/type only (classid 530 is rvs on this PD2)
			return npc.getItem("vps") || false;
		}

		if (type !== "hp" && type !== "mp") {
			return false;
		}

		// 1) by code string (hp1 …)
		for (i = maxTier; i > 0; i -= 1) {
			result = npc.getItem(type + i);

			if (result) {
				return result;
			}
		}

		// 2) by PD2 classid
		for (i = maxTier; i > 0; i -= 1) {
			result = npc.getItem(classIds[type][i - 1]);

			if (result) {
				return result;
			}
		}

		// 3) scan shop units (handles odd shop states after MiniShopBot)
		best = false;
		bestTier = 0;
		item = npc.getItem();

		if (item) {
			do {
				code = item.code ? String(item.code).toLowerCase() : "";

				if (code.indexOf(type) === 0 && code.length >= 3) {
					tier = parseInt(code.charAt(2), 10);

					if (tier >= 1 && tier <= maxTier && tier >= bestTier) {
						bestTier = tier;
						best = copyUnit(item);
					}
				}
			} while (item.getNext());
		}

		if (!best) {
			print("ÿc1Townÿc0 :: buyPotions — no " + type + "1-" + maxTier + " in shop (lvl " + me.charlvl + ")");
		}

		return best;
	},

	// Shop lookup by code/classid/scan — PD2 getItem("tsc") often misses while classid works
	getShopItem: function (npc, codes, classIds) {
		var i, item, code, cid, want,
			codeList = [],
			idList = [];

		if (!npc) {
			return false;
		}

		if (typeof codes === "string" || typeof codes === "number") {
			codes = [codes];
		}

		if (typeof classIds === "number") {
			classIds = [classIds];
		}

		for (i = 0; codes && i < codes.length; i += 1) {
			if (codes[i] !== undefined && codes[i] !== null && codes[i] !== "") {
				codeList.push(codes[i]);
			}
		}

		for (i = 0; classIds && i < classIds.length; i += 1) {
			if (classIds[i] !== undefined && classIds[i] !== null) {
				idList.push(classIds[i]);
			}
		}

		for (i = 0; i < codeList.length; i += 1) {
			item = npc.getItem(codeList[i]);

			if (item) {
				return item;
			}
		}

		for (i = 0; i < idList.length; i += 1) {
			item = npc.getItem(idList[i]);

			if (item) {
				return item;
			}
		}

		item = npc.getItem();

		if (item) {
			do {
				code = item.code ? String(item.code).toLowerCase() : "";
				cid = item.classid;

				for (i = 0; i < codeList.length; i += 1) {
					want = String(codeList[i]).toLowerCase();

					if (code === want) {
						return copyUnit(item);
					}
				}

				for (i = 0; i < idList.length; i += 1) {
					if (cid === idList[i]) {
						return copyUnit(item);
					}
				}
			} while (item.getNext());
		}

		return false;
	},

	// Ensure trade UI is open and shop list loaded (heal leaves TALK menu open)
	ensureShop: function (npc) {
		var tick, tries, lines, i, text;

		if (!npc) {
			return false;
		}

		if (getUIFlag(0x0C) && npc.itemcount > 0) {
			return true;
		}

		// Flag set but empty list / stuck on TALK — cancel and reopen
		for (tries = 0; tries < 3; tries += 1) {
			if (getUIFlag(0x08) || getUIFlag(0x0C) || getInteractedNPC()) {
				me.cancel();
				delay(200 + me.ping);
			}

			if (!npc.openMenu()) {
				delay(150 + me.ping);
				continue;
			}

			// Prefer menu id, then click TRADE by dialog text (PD2-safe)
			if (!Misc.useMenu(0x0D44)) {
				try {
					lines = getDialogLines();
				} catch (e) {
					lines = null;
				}

				if (lines) {
					for (i = 0; i < lines.length; i += 1) {
						text = (lines[i].text || "").toString().toLowerCase();

						if (lines[i].selectable && (text.indexOf("trade") > -1 || text.indexOf(getLocaleString(0x0D44).toLowerCase()) > -1)) {
							try {
								lines[i].handler();
							} catch (e2) {}

							break;
						}
					}
				}
			}

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (getUIFlag(0x0C) && npc.itemcount > 0) {
					return true;
				}

				delay(50);
			}

			// Last resort: packet trade open
			try {
				sendPacket(1, 0x38, 4, 1, 4, npc.gid, 4, 0);
			} catch (e3) {}

			tick = getTickCount();

			while (getTickCount() - tick < 1500) {
				if (npc.itemcount > 0) {
					return true;
				}

				delay(50);
			}
		}

		return !!(getUIFlag(0x0C) && npc.itemcount > 0);
	},

	// Close "You do not have enough gold for that." / CONTINUE message box
	dismissShopError: function () {
		var dialog, i, text, hit = false;

		try {
			dialog = getDialogLines();
		} catch (e) {
			dialog = null;
		}

		if (dialog && dialog.length) {
			for (i = 0; i < dialog.length; i += 1) {
				text = (dialog[i].text || "").toString();

				if (text.match(getLocaleString(3362), "gi") || // not enough gold
						text.match(/enough gold/i) ||
						text.match(getLocaleString(3403), "gi") || // Continue
						text.match(/^continue$/i)) {
					try {
						dialog[i].handler();
						hit = true;
					} catch (e2) {}

					delay(200 + me.ping);
				}
			}
		}

		// Only cancel when we actually hit an error box — bare cancel closes the shop mid-buy
		if (hit) {
			me.cancel();
			delay(100 + me.ping);
		}

		return hit;
	},

	fillTome: function (code) {
		if (me.gold < 50) {
			return false;
		}

		// PD2 classids shifted — use item codes (tbk/ibk/tsc/isc); accept legacy LoD numeric ids too
		var scroll, tome, tomeCode, scrollCode, npc, cur, want, keepMin, i, cost;

		if (code === 518 || code === 533 || code === "tbk") {
			tomeCode = "tbk";
			scrollCode = "tsc";
		} else if (code === 519 || code === 534 || code === "ibk") {
			tomeCode = "ibk";
			scrollCode = "isc";
		} else {
			return false;
		}

		// TP: early game 20 scrolls (save gold); lvl 30+ fill/buy stack to 80
		// ID tome: always keep ~20
		if (tomeCode === "tbk") {
			want = me.charlvl >= 30 ? 80 : 20;
			keepMin = want; // top up whenever below target
		} else {
			want = 20;
			keepMin = 13;
		}

		cur = this.checkScrolls(tomeCode);

		if (me.findItem(tomeCode, 0, 3) && cur >= keepMin) {
			return true;
		}

		npc = this.initNPC("Shop", "fillTome");

		if (!npc) {
			return false;
		}

		delay(300);
		this.dismissShopError();

		if (!this.ensureShop(npc)) {
			print("ÿc1Townÿc0 :: shop not open for " + scrollCode);
			return false;
		}

		if (!me.findItem(tomeCode, 0, 3)) {
			tome = this.getShopItem(npc, tomeCode, tomeCode === "tbk" ? [535, 518] : [536, 519]);

			if (!tome) {
				print("ÿc1Townÿc0 :: " + tomeCode + " not in shop (PD2 codes)");
				return false;
			}

			cost = tome.getItemCost(0) || 250;

			if (me.gold < cost) {
				print("ÿc8Townÿc0 :: cannot afford " + tomeCode + " (" + me.gold + "/" + cost + "g)");
				this.dismissShopError();
				return false;
			}

			if (Storage.Inventory.CanFit(tome)) {
				try {
					tome.buy();
					delay(me.ping * 2 + 200);
					this.dismissShopError();
				} catch (e1) {
					print(e1);
					this.dismissShopError();
					return false;
				}
			} else {
				print("ÿc1Townÿc0 :: Cannot buy " + tomeCode + " (no inventory space)");
				return false;
			}
		}

		cur = this.checkScrolls(tomeCode);

		if (cur >= want) {
			return true;
		}

		scroll = this.getShopItem(npc, scrollCode, scrollCode === "tsc" ? [546, 529] : [547]);

		// Shop list sometimes empty right after heal/TALK — refresh without walking away
		if (!scroll) {
			if (this.ensureShop(npc)) {
				scroll = this.getShopItem(npc, scrollCode, scrollCode === "tsc" ? [546, 529] : [547]);
			}
		}

		if (!scroll) {
			print("ÿc1Townÿc0 :: " + scrollCode + " not in shop");
			return false;
		}

		try {
			cost = scroll.getItemCost(0) || 100;

			// Shift-buy fills the tome from the vendor in one action (shop mode 6).
			// Under 30 we only want `want` scrolls — buy that many clicks without closing shop.
			if (tomeCode === "tbk" && me.charlvl < 30) {
				for (i = 0; i < 40 && this.checkScrolls(tomeCode) < want; i += 1) {
					scroll = this.getShopItem(npc, scrollCode, [546, 529]);

					if (!scroll) {
						if (!this.ensureShop(npc)) {
							break;
						}

						scroll = this.getShopItem(npc, scrollCode, [546, 529]);

						if (!scroll) {
							break;
						}
					}

					cost = scroll.getItemCost(0) || 100;

					if (me.gold < cost) {
						print("ÿc8Townÿc0 :: stop TP scrolls — need " + cost + "g have " + me.gold);
						this.dismissShopError();
						break;
					}

					try {
						scroll.buy();
					} catch (eBuy) {
						print("ÿc8Townÿc0 :: scroll buy failed: " + eBuy);
						this.dismissShopError();
						break;
					}

					delay(Math.max(30, me.ping));
				}

				print("ÿc2Townÿc0 :: TP scrolls " + this.checkScrolls(tomeCode) + "/" + want + " (cap until lvl 30)");
			} else {
				if (me.gold < cost) {
					print("ÿc8Townÿc0 :: cannot afford " + scrollCode + " stack");
					this.dismissShopError();
					return false;
				}

				scroll.buy(true); // lvl 30+ (or ID tome): fill / buy full stack
				delay(me.ping + 100);
				this.dismissShopError();
			}
		} catch (e2) {
			print(e2.message);
			this.dismissShopError();
			return false;
		}

		this.dismissShopError();

		return true;
	},

	checkScrolls: function (id) {
		var tome = me.findItem(id, 0, 3);

		if (!tome) {
			switch (id) {
			case 519:
			case 534:
			case "ibk":
				return Config.FieldID ? 0 : 20;
			case 518:
			case 533:
			case "tbk":
				return 0; // Force TP tome check
			}
		}

		return tome.getStat(70);
	},

	identify: function () {
		var i, item, tome, scroll, npc, list, timer, tpTome, result,
			tpTomePos = {},
			usedCain = false,
			needShop = false;

		usedCain = this.cainID();

		list = Storage.Inventory.Compare(Config.Inventory);

		if (!list) {
			return false;
		}

		// Cain already IDed — shop only to sell junk (no Akara/Drognan tome/scroll ID)
		for (i = 0; i < list.length; i += 1) {
			result = Pickit.checkItem(list[i]);

			if (list[i].location !== 3 || this.ignoredItemTypes.indexOf(list[i].itemType) > -1) {
				continue;
			}

			if (!list[i].getFlag(0x10)) {
				if (!usedCain && ([-1, 4].indexOf(result.result) > -1 || Item.hasTier(list[i]))) {
					needShop = true;
					break;
				}

				continue;
			}

			// Identified sellables / trash left by cainID (incl. leftover merc candidates)
			if (result.result === 4 || result.result === 0 ||
					(this.isCharmItem(list[i]) && list[i].getFlag(0x10) && !this.shouldParkCharm(list[i])) ||
					(typeof Item.isMercInvLeftover === "function" && Item.isMercInvLeftover(list[i])) ||
					((list[i].itemType === 5 || list[i].itemType === 6) && list[i].quality !== 6 && list[i].quality !== 7) ||
					list[i].itemType === 80 || list[i].itemType === 81) {
				if (!Item.autoEquipCheck(list[i])) {
					needShop = true;
					break;
				}
			}
		}

		if (!needShop) {
			return false;
		}

		npc = this.initNPC("Shop", usedCain ? "sell" : "identify");

		if (!npc) {
			return false;
		}

		tome = me.findItem("ibk", 0, 3) || me.findItem(536, 0, 3);

		if (!usedCain && tome && tome.getStat(70) < list.length) {
			this.fillTome("ibk");
		}

MainLoop:
		while (list.length > 0) {
			item = list.shift();

			if (item.location !== 3 || this.ignoredItemTypes.indexOf(item.itemType) > -1) {
				continue;
			}

			// After Cain: never shop-ID — only sell identified crap
			if (usedCain) {
				if (!item.getFlag(0x10)) {
					continue;
				}

				result = Pickit.checkItem(item);

				// Player upgrade — keep
				if (Item.autoEquipCheck(item)) {
					continue;
				}

				// Charms: kolton/LLD keep lines are too loose — sell unless leveling_charms says keep
				if (this.isCharmItem(item) && !this.shouldParkCharm(item)) {
					result.result = 0;
				}

				// Merc leftover after autoEquipMerc — sell junk only (never sell pending upgrades)
				if (typeof Item.isMercInvLeftover === "function" && Item.isMercInvLeftover(item)) {
					result.result = 0;
				} else if (result.result !== 1 && result.result !== 2 && result.result !== 3 && result.result !== 5) {
					result.result = 0;
				}

				if (result.result === 1 || result.result === 2 || result.result === 3 || result.result === 5) {
					continue;
				}

				if (typeof Pickit.isRuneItem === "function" && Pickit.isRuneItem(item)) {
					continue;
				}

				if (item.itemType === 74 || (item.code && /^r\d{2}$/i.test(item.code))) {
					continue;
				}

				// Arrows/bolts always sell if still in inv (except rare/unique)
				if ((item.itemType === 5 || item.itemType === 6) && item.quality !== 6 && item.quality !== 7) {
					result.result = 0;
				}

				if (result.result === 0 || result.result === 4) {
					this.sellInventoryItem(item);

					timer = getTickCount() - this.sellTimer;

					if (timer > 0 && timer < 500) {
						delay(timer);
					}
				}

				continue;
			}

			if (!item.getFlag(0x10)) {
				result = Pickit.checkItem(item);

				// Force ID for unid items matching autoEquip criteria
				if (result.result === 1 && !item.getFlag(0x10) && Item.hasTier(item)) {
					result.result = -1;
				}

				switch (result.result) {
				// Items for gold, will sell magics, etc. w/o id, but at low levels
				// magics are often not worth iding.
				case 4:
					if ((typeof Pickit.isRuneItem === "function" && Pickit.isRuneItem(item)) ||
							item.itemType === 74 || (item.code && /^r\d{2}s?$/i.test(item.code))) {
						break; // never sell runes or PD2 rune stacks
					}

					if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item)) {
						break;
					}

					Misc.itemLogger("Sold", item);
					item.sell();

					break;
				case -1:
					if (tome) {
						this.identifyItem(item, tome);
					} else {
						scroll = this.getShopItem(npc, "isc", [547]);

						if (scroll) {
							if (!Storage.Inventory.CanFit(scroll)) {
								tpTome = me.findItem("tbk", 0, 3);

								if (tpTome) {
									tpTomePos = {x: tpTome.x, y: tpTome.y};

									tpTome.sell();
									delay(500);
								}
							}

							delay(500);

							if (Storage.Inventory.CanFit(scroll)) {
								scroll.buy();
							}
						}

						scroll = me.findItem("isc", 0, 3);

						if (!scroll) {
							break MainLoop;
						}

						this.identifyItem(item, scroll);
					}

					result = Pickit.checkItem(item);

					// Don't force-sell quest / rune / cubing keeps just because AutoEquip rejects them
					if (!Item.autoEquipCheck(item) &&
							result.result !== 1 && result.result !== 2 && result.result !== 3 && result.result !== 5 &&
							!(typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item))) {
						result.result = 0;
					}

					if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item)) {
						result.result = 1;
					}

					switch (result.result) {
					case 1:
						// Couldn't id autoEquip item. Don't log it.
						if (result.result === 1 && Config.AutoEquip && !item.getFlag(0x10) && Item.autoEquipCheck(item)) {
							break;
						}

						Misc.itemLogger("Kept", item);
						Misc.logItem("Kept", item, result.line);

						break;
					case -1: // unidentified
						break;
					case 2: // cubing
						Misc.itemLogger("Kept", item, "Cubing-Town");
						Cubing.update();

						break;
					case 3: // runeword (doesn't trigger normally)
						break;
					case 5: // Crafting System
						Misc.itemLogger("Kept", item, "CraftSys-Town");
						CraftingSystem.update(item);

						break;
					default:
						if ((typeof Pickit.isRuneItem === "function" && Pickit.isRuneItem(item)) ||
								item.itemType === 74 || (item.code && /^r\d{2}s?$/i.test(item.code))) {
							break;
						}

						if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item)) {
							break;
						}

						Misc.itemLogger("Sold", item);
						item.sell();

						timer = getTickCount() - this.sellTimer; // shop speedup test

						if (timer > 0 && timer < 500) {
							delay(timer);
						}

						break;
					}

					break;
				}
			}
		}

		this.fillTome("tbk"); // Check for TP tome in case it got sold for ID scrolls

		return true;
	},

	cainID: function () {
		if (!Config.CainID.Enable) {
			return false;
		}

		// Cain stands in every town after Rescue Cain. Act2+ he is always present even if
		// quest bit 4,0 is flaky on PD2 — don't fall back to Drognan/Akara shop ID.
		if (!me.getQuest(4, 0) && me.act < 2 && !getUnit(1, NPC.Cain)) {
			return false;
		}

		var i, cain, unids, result, items;

		if (me.gold < Config.CainID.MinGold) {
			return false;
		}

		// Check unids BEFORE canceling any open shop (vendor session must stay open)
		unids = this.getUnids();

		if (!unids || unids.length < Config.CainID.MinUnids) {
			return false;
		}

		// Need Cain — leave shop if open
		if (getInteractedNPC()) {
			me.cancel();
			delay(100 + me.ping);
		}

		me.cancel();
		// Do not stash before Cain — doChores order is ID → vendor → stash

		print("ÿc2Townÿc0 :: Cain ID (" + unids.length + " unid)");
		cain = this.initNPC("CainID", "cainID");

		if (!cain) {
			print("ÿc8Townÿc0 :: Cain unavailable — will shop-ID");

			return false;
		}

		// Cain identify-all already ran in initNPC — evaluate kept / junk
		items = Storage.Inventory.Compare(Config.Inventory);

		if (!items) {
			return true;
		}

		for (i = 0; i < items.length; i += 1) {
			if (!items[i].getFlag(0x10) || this.ignoredItemTypes.indexOf(items[i].itemType) > -1) {
				continue;
			}

			result = Pickit.checkItem(items[i]);

			if (Item.autoEquipCheck(items[i])) {
				Misc.itemLogger("Kept", items[i]);
				Misc.logItem("Kept", items[i], result.line);
				continue;
			}

			// Merc leftovers sell; pending merc upgrades stay for autoEquipMerc
			if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(items[i])) {
				continue;
			}

			if (typeof Item.isMercInvLeftover === "function" && Item.isMercInvLeftover(items[i])) {
				result.result = 0;
			} else if (!Item.autoEquipCheck(items[i])) {
				if (result.result === 1 && (!result.line || result.line === "merc")) {
					result.result = 0;
				}
			}

			switch (result.result) {
			case 0:
				// Leave for shop sell in identify() — don't drop while Cain menu is open
				break;
			case 1:
				Misc.itemLogger("Kept", items[i]);
				Misc.logItem("Kept", items[i], result.line);

				break;
			case 4:
				// Leave for shop sell in identify() / clearInventory
				break;
			default:
				break;
			}
		}

		Item.autoEquip();
		// Merc equip deferred to doChores (single pass) — avoids repeat MercEquip spam

		me.cancel();

		return true;
	},

	fieldID: function () { // not exactly a town function but whateva
		var list, tome, item, result;

		list = this.getUnids();

		if (!list) {
			return false;
		}

		tome = me.findItem("ibk", 0, 3) || me.findItem(536, 0, 3);

		if (!tome || tome.getStat(70) < list.length) {
			return false;
		}

		while (list.length > 0) {
			item = list.shift();
			result = Pickit.checkItem(item);

			// Force ID for unid items matching autoEquip criteria
			if (result.result === 1 && !item.getFlag(0x10) && Item.hasTier(item)) {
				result.result = -1;
			}

			if (result.result === -1) { // unid item that should be identified
				this.identifyItem(item, tome);
				delay(me.ping + 1);

				result = Pickit.checkItem(item);

				if (!Item.autoEquipCheck(item)) {
					result.result = 0;
				}

				switch (result.result) {
				case 0:
					Misc.itemLogger("Dropped", item, "fieldID");

					if (Config.DroppedItemsAnnounce.Enable && Config.DroppedItemsAnnounce.Quality.indexOf(item.quality) > -1) {
						say("Dropped: [" + Pickit.itemQualityToName(item.quality).charAt(0).toUpperCase() + Pickit.itemQualityToName(item.quality).slice(1) + "] " + item.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim());

						if (Config.DroppedItemsAnnounce.LogToOOG && Config.DroppedItemsAnnounce.OOGQuality.indexOf(item.quality) > -1) {
							Misc.logItem("Field Dropped", item, result.line);
						}
					}

					item.drop();

					break;
				case 1:
					Misc.itemLogger("Field Kept", item);
					Misc.logItem("Field Kept", item, result.line);

					break;
				default:
					break;
				}
			}
		}

		delay(200);
		me.cancel();

		return true;
	},

	getUnids: function () {
		var list = [],
			item = me.getItem(-1, 0);

		if (!item) {
			return false;
		}

		do {
			if (item.location === 3 && !item.getFlag(0x10)) {
				list.push(copyUnit(item));
			}
		} while (item.getNext());

		if (!list.length) {
			return false;
		}

		return list;
	},

	// Equipped knife/dagger (itemType 32) — Poison Strike needs this (any bodyloc on PD2)
	hasEquippedDagger: function () {
		var item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.itemType === 32) {
					return true;
				}
			} while (item.getNext());
		}

		return false;
	},

	// Once Poison Strike is known, always keep a dagger equipped (no level cap)
	needPoisonStrikeDagger: function () {
		if (me.classid !== 2) {
			return false;
		}

		if (!me.getSkill(73, 0) && !me.getSkill(73, 1) && !me.getStat(97, 73)) {
			return false;
		}

		return !this.hasEquippedDagger();
	},

	buyPoisonStrikeDagger: function () {
		var npc, item, cand, best, cost, gold, i,
			list = [];

		if (!this.needPoisonStrikeDagger()) {
			return true;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && item.itemType === 32 && Item.canEquip(item)) {
					list.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		if (list.length) {
			list.sort(function (a, b) {
				return (NTIP.GetTier(b) || 0) - (NTIP.GetTier(a) || 0);
			});

			print("ÿc2Townÿc0 :: Equipping inventory dagger for Poison Strike");
			Item.equip(list[0], 4);
			Item.autoEquip();

			return this.hasEquippedDagger();
		}

		gold = me.getStat(14) + me.getStat(15);

		if (gold < 50) {
			print("ÿc8Townÿc0 :: Need dagger for Poison Strike but not enough gold");

			return false;
		}

		if (me.act === 3) {
			this.goToTown(Pather.accessToAct(4) ? 4 : 2);
		}

		npc = this.initNPC("Repair", "buyPoisonStrikeDagger");

		if (!npc) {
			return false;
		}

		item = npc.getItem();
		list = [];

		if (!item) {
			me.cancel();

			return false;
		}

		do {
			if (item.itemType === 32) {
				list.push(copyUnit(item));
			}
		} while (item.getNext());

		if (!list.length) {
			print("ÿc8Townÿc0 :: No dagger in shop for Poison Strike");
			me.cancel();

			return false;
		}

		best = null;

		for (i = 0; i < list.length; i += 1) {
			cand = list[i];
			cost = cand.getItemCost(0);

			if (cost > gold) {
				continue;
			}

			if (cand.quality > 2 && !cand.getFlag(0x10)) {
				continue;
			}

			if (cand.getStat(92) > me.charlvl) {
				continue;
			}

			if (cand.strreq > me.getStat(0) || cand.dexreq > me.getStat(2)) {
				continue;
			}

			if (!best || cost < best.getItemCost(0) ||
					(cost === best.getItemCost(0) && (NTIP.GetTier(cand) || 0) > (NTIP.GetTier(best) || 0))) {
				best = cand;
			}
		}

		if (!best) {
			print("ÿc8Townÿc0 :: No affordable/equippable dagger in shop");
			me.cancel();

			return false;
		}

		try {
			print("ÿc2Townÿc0 :: Buying dagger for Poison Strike: " + best.name);
			Misc.itemLogger("Shopped", best);
			best.buy();
			delay(me.ping * 2 + 300);
		} catch (eBuy) {
			print("ÿc1Townÿc0 :: dagger buy failed: " + eBuy);
		}

		me.cancel();
		delay(200 + me.ping);
		Item.autoEquip();

		if (this.hasEquippedDagger()) {
			print("ÿc2Townÿc0 :: Poison Strike dagger equipped");

			return true;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && item.itemType === 32 && Item.canEquip(item)) {
					Item.equip(item, 4);

					return true;
				}
			} while (item.getNext());
		}

		return false;
	},

	// Act2 desert merc needs spear/polearm/javelin — empty or white starter
	needMercWeapon: function () {
		var eq;

		if (!Config.UseMerc || !Config.AutoEquipMerc) {
			return false;
		}

		if (typeof Item === "undefined" || typeof Item.isDesertMerc !== "function" || !Item.isDesertMerc()) {
			return false;
		}

		eq = Item.getMercItem(4);

		if (!eq.item) {
			return true;
		}

		// White / inferior starter — shop usually has magic+
		return (eq.item.quality || 0) <= 2;
	},

	// Buy spear/polearm/javelin for Act2 merc from Fara (or Repair NPC). force = shop-scan even if armed.
	buyMercWeapon: function (force) {
		var npc, item, cand, best, cost, gold, i, eq, list = [], invBest = null;

		if (!Config.UseMerc || !Config.AutoEquipMerc) {
			return true;
		}

		if (typeof Item === "undefined" || typeof Item.isDesertMerc !== "function" || !Item.isDesertMerc()) {
			return true;
		}

		if (!force && !this.needMercWeapon()) {
			return true;
		}

		eq = Item.getMercItem(4);
		gold = me.getStat(14) + me.getStat(15);

		// Inventory first — equip upgrade without shopping
		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location !== 3 || item.mode !== 0) {
					continue;
				}

				if ([33, 34, 44].indexOf(item.itemType) === -1) {
					continue;
				}

				if (!Item.canMercEquip(item)) {
					continue;
				}

				if (!Item.mercIsUpgrade(item, eq, 4)) {
					continue;
				}

				if (!invBest || Item.mercScore(item) > Item.mercScore(invBest)) {
					invBest = copyUnit(item);
				}
			} while (item.getNext());
		}

		if (invBest) {
			print("ÿc2Townÿc0 :: Equipping inv merc weapon: " + (invBest.name || "?"));
			Item.equipMerc(invBest, 4);
			Item.autoEquipMerc(true);

			if (!force && !this.needMercWeapon()) {
				return true;
			}

			eq = Item.getMercItem(4);
		}

		if (!force && !this.needMercWeapon()) {
			return true;
		}

		if (gold < 50) {
			print("ÿc8Townÿc0 :: Need merc weapon but not enough gold");

			return false;
		}

		if (!me.inTown) {
			this.goToTown();
		}

		me.cancel();
		delay(150 + me.ping);

		// Act2 Fara (Repair) sells spears/polearms — soft-fail WP so chores never hard-throw
		if (me.act !== 2 && Pather.accessToAct(2)) {
			try {
				this.goToTown(2);
			} catch (eWp) {
				print("ÿc8Townÿc0 :: buyMercWeapon — Act2 WP failed, skip (" + eWp + ")");

				return false;
			}

			if (me.act !== 2) {
				print("ÿc8Townÿc0 :: buyMercWeapon — still not Act2, skip");

				return false;
			}
		}

		npc = this.initNPC("Repair", "buyMercWeapon");

		if (!npc) {
			print("ÿc8Townÿc0 :: No vendor for merc weapon");

			return false;
		}

		item = npc.getItem();

		if (!item) {
			me.cancel();

			return false;
		}

		do {
			if ([33, 34, 44].indexOf(item.itemType) > -1) {
				list.push(copyUnit(item));
			}
		} while (item.getNext());

		if (!list.length) {
			print("ÿc8Townÿc0 :: No spear/polearm in shop for Act2 merc");
			me.cancel();

			return false;
		}

		best = null;

		for (i = 0; i < list.length; i += 1) {
			cand = list[i];
			cost = cand.getItemCost(0);

			if (cost > gold) {
				continue;
			}

			if (cand.quality > 2 && !cand.getFlag(0x10)) {
				continue; // unid magic+
			}

			if (!Item.canMercEquip(cand)) {
				continue;
			}

			// Must beat current merc wep (or fill empty)
			if (eq.item && !Item.mercIsUpgrade(cand, eq, 4)) {
				continue;
			}

			if (!best || Item.mercScore(cand) > Item.mercScore(best) ||
					(Item.mercScore(cand) === Item.mercScore(best) && cost < best.getItemCost(0))) {
				best = cand;
			}
		}

		if (!best) {
			print("ÿc8Townÿc0 :: No better affordable merc weapon in shop");
			me.cancel();

			return !this.needMercWeapon();
		}

		try {
			print("ÿc2Townÿc0 :: Buying merc weapon: " + (best.name || "?") + " (score " + Item.mercScore(best) + ")");
			Misc.itemLogger("Shopped", best);
			best.buy();
			delay(me.ping * 2 + 300);
		} catch (eBuy) {
			print("ÿc1Townÿc0 :: merc weapon buy failed: " + eBuy);
		}

		me.cancel();
		delay(200 + me.ping);
		Item.autoEquipMerc(true);

		eq = Item.getMercItem(4);

		if (eq.item) {
			print("ÿc2Townÿc0 :: Act2 merc armed: " + (eq.item.name || "?"));

			return true;
		}

		return false;
	},

	identifyItem: function (unit, tome) {
		if (Config.PacketShopping) {
			return Packet.identifyItem(unit, tome);
		}

		var i, tick;

		if (!unit || unit.getFlag(0x10)) {
			return false;
		}

		this.sellTimer = getTickCount(); // shop speedup test

CursorLoop:
		for (i = 0; i < 3; i += 1) {
			clickItem(1, tome);

			tick = getTickCount();

			while (getTickCount() - tick < 500) {
				if (getCursorType() === 6) {
					break CursorLoop;
				}

				delay(10);
			}
		}

		if (getCursorType() !== 6) {
			return false;
		}

		delay(270);

		for (i = 0; i < 3; i += 1) {
			if (getCursorType() === 6) {
				clickItem(0, unit);
			}

			tick = getTickCount();

			while (getTickCount() - tick < 500) {
				if (unit.getFlag(0x10)) {
					delay(50);

					return true;
				}

				delay(10);
			}

			delay(300);
		}

		return false;
	},

	shopItems: function () {
		if (!Config.MiniShopBot) {
			return true;
		}

		var i, item, result,
			items = [],
			npc = getInteractedNPC();

		if (!npc || !npc.itemcount) {
			return false;
		}

		item = npc.getItem();

		if (!item) {
			return false;
		}

		print("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

		do {
			if (this.ignoredItemTypes.indexOf(item.itemType) === -1) {
				items.push(copyUnit(item));
			}
		} while (item.getNext());

		for (i = 0; i < items.length; i += 1) {
			result = Pickit.checkItem(items[i]);

			if (result.result === 1 && Item.autoEquipCheck(items[i])) {
				try {
					if (Storage.Inventory.CanFit(items[i]) && me.getStat(14) + me.getStat(15) >= items[i].getItemCost(0)) {
						Misc.itemLogger("Shopped", items[i]);
						Misc.logItem("Shopped", items[i], result.line);
						items[i].buy();
					}
				} catch (e) {
					print(e);
				}
			}

			delay(2);
		}

		return true;
	},

	gambleIds: [],

	gamble: function () {
		if (!this.needGamble() || Config.GambleItems.length === 0) {
			return true;
		}

		var i, item, items, npc, newItem, result,
			list = [];

		if (this.gambleIds.length === 0) {
			// change text to classid
			for (i = 0; i < Config.GambleItems.length; i += 1) {
				if (isNaN(Config.GambleItems[i])) {
					if (NTIPAliasClassID.hasOwnProperty(Config.GambleItems[i].replace(/\s+/g, "").toLowerCase())) {
						this.gambleIds.push(NTIPAliasClassID[Config.GambleItems[i].replace(/\s+/g, "").toLowerCase()]);
					} else {
						Misc.errorReport("ÿc1Invalid gamble entry:ÿc0 " + Config.GambleItems[i]);
					}
				} else {
					this.gambleIds.push(Config.GambleItems[i]);
				}
			}
		}

		if (this.gambleIds.length === 0) {
			return true;
		}

		// Fuck Alkor
		if (me.act === 3) {
			this.goToTown(2);
		}

		npc = this.initNPC("Gamble", "gamble");

		if (!npc) {
			return false;
		}

		items = me.findItems(-1, 0, 3);

		while (items && items.length > 0) {
			list.push(items.shift().gid);
		}

		while (me.gold >= Config.GambleGoldStop) {
			if (!getInteractedNPC()) {
				npc.startTrade("Gamble");
			}

			item = npc.getItem();
			items = [];

			if (item) {
				do {
					if (this.gambleIds.indexOf(item.classid) > -1) {
						items.push(copyUnit(item));
					}
				} while (item.getNext());

				for (i = 0; i < items.length; i += 1) {
					if (!Storage.Inventory.CanFit(items[i])) {
						return false;
					}

					me.overhead("Buy: " + items[i].name);
					items[i].buy(false, true);

					newItem = this.getGambledItem(list);

					if (newItem) {
						result = Pickit.checkItem(newItem);

						if (!Item.autoEquipCheck(newItem)) {
							result = 0;
						}

						switch (result.result) {
						case 1:
							Misc.itemLogger("Gambled", newItem);
							Misc.logItem("Gambled", newItem, result.line);
							list.push(newItem.gid);

							break;
						case 2:
							list.push(newItem.gid);
							Cubing.update();

							break;
						case 5: // Crafting System
							CraftingSystem.update(newItem);

							break;
						default:
							Misc.itemLogger("Sold", newItem, "Gambling");
							me.overhead("Sell: " + newItem.name);
							newItem.sell();

							if (!Config.PacketShopping) {
								delay(500);
							}

							break;
						}
					}
				}
			}

			me.cancel();
		}

		return true;
	},

	needGamble: function () {
		return Config.Gamble && me.gold >= Config.GambleGoldStart;
	},

	getGambledItem: function (list) {
		var i, j,
			items = me.findItems(-1, 0, 3);

		for (i = 0; i < items.length; i += 1) {
			if (list.indexOf(items[i].gid) === -1) {
				for (j = 0; j < 3; j += 1) {
					if (items[i].getFlag(0x10)) {
						break;
					}

					delay(100);
				}

				return items[i];
			}
		}

		return false;
	},

	_keysBrokeTick: 0,

	buyKeys: function (keepOpen) {
		var key, cost, gold, i, bought, npc;

		if (!this.wantKeys()) {
			return true;
		}

		// Fuck Hratli
		if (me.act === 3) {
			this.goToTown(Pather.accessToAct(4) ? 4 : 2);
		}

		npc = this.initNPC("Key", "buyKeys");

		if (!npc) {
			if (!keepOpen) {
				me.cancel();
			}

			return false;
		}

		key = npc.getItem("key");

		if (!key) {
			print("ÿc8Townÿc0 :: no keys in shop");

			if (!keepOpen) {
				me.cancel();
			}

			return false;
		}

		cost = key.getItemCost(0) || 50;
		gold = me.gold;

		if (gold < cost) {
			print("ÿc8Townÿc0 :: can't afford keys (gold " + gold + " < " + cost + ")");
			this._keysBrokeTick = getTickCount();

			if (!keepOpen) {
				me.cancel();
			}

			return true; // stop townCheck loop — skip until richer
		}

		try {
			if (gold >= cost * 12) {
				// One shift-buy = one stack (~12)
				if (!key.buy(true)) {
					print("ÿc8Townÿc0 :: key stack buy failed");
				}
			} else {
				// Not enough for a full stack — buy singles while we can
				bought = 0;

				for (i = 0; i < 12 && this.countKeys() <= 0; i += 1) {
					key = npc.getItem("key");

					if (!key) {
						break;
					}

					cost = key.getItemCost(0) || cost;

					if (me.gold < cost) {
						break;
					}

					if (!key.buy(false)) {
						break;
					}

					bought += 1;
					delay(me.ping + 150);
				}

				if (!bought) {
					print("ÿc8Townÿc0 :: key buy failed (gold " + me.gold + ")");
				} else {
					print("ÿc2Townÿc0 :: bought " + bought + " key(s)");
				}
			}
		} catch (e) {
			print("ÿc8Townÿc0 :: buyKeys: " + e.message);
		}

		// keepOpen: leave trade for doChores single shop session
		if (!keepOpen) {
			me.cancel();
			delay(100 + me.ping);
		}

		// Still empty → don't town-loop for keys for 2 minutes
		if (this.countKeys() <= 0) {
			this._keysBrokeTick = getTickCount();
		} else {
			this._keysBrokeTick = 0;
		}

		return true;
	},

	// Raw key count (no gold/open-chest gates)
	countKeys: function () {
		var i, j,
			count = 0,
			ids = [560],
			key;

		for (j = 0; j < ids.length; j += 1) {
			key = me.findItems(ids[j], 0, 3);

			if (key) {
				for (i = 0; i < key.length; i += 1) {
					if (key[i].itemType === 41 || (key[i].code && String(key[i].code).toLowerCase() === "key")) {
						count += key[i].getStat(70) || 1;
					}
				}
			}
		}

		if (!count) {
			key = me.getItem("key");

			if (key) {
				do {
					if (key.location === 3 && key.mode === 0) {
						count += key.getStat(70) || 1;
					}
				} while (key.getNext());
			}
		}

		return count;
	},

	checkKeys: function () {
		if (!Config.OpenChests || me.classid === 6) {
			return 12;
		}

		if (!me.getItem("key") && !Storage.Inventory.CanFit({sizex: 1, sizey: 1})) {
			return 12;
		}

		// Broke / recent failed buy — pretend full so townCheck stops
		if (me.gold < 50 || (this._keysBrokeTick && getTickCount() - this._keysBrokeTick < 120000)) {
			return 12;
		}

		return this.countKeys();
	},

	needKeys: function () {
		if (me.gold < 50 || (this._keysBrokeTick && getTickCount() - this._keysBrokeTick < 120000)) {
			return false;
		}

		return this.countKeys() <= 0;
	},

	wantKeys: function () {
		if (me.gold < 50 || (this._keysBrokeTick && getTickCount() - this._keysBrokeTick < 120000)) {
			return false;
		}

		return this.countKeys() <= 0;
	},

	repairIngredientCheck: function (item) {
		if (!Config.CubeRepair) {
			return false;
		}

		var needRal = 0,
			needOrt = 0,
			items = this.getItemsForRepair(Config.RepairPercent, false);

		if (items && items.length) {
			while (items.length > 0) {
				switch (items.shift().itemType) {
				case 2:
				case 3:
				case 15:
				case 16:
				case 19:
				case 69:
				case 70:
				case 71:
				case 72:
				case 75:
					needRal += 1;

					break;
				default:
					needOrt += 1;

					break;
				}
			}
		}

		switch (item.classid) {
		case 617:
			if (needRal && (!me.findItems(617) || me.findItems(617) < needRal)) {
				return true;
			}

			break;
		case 618:
			if (needOrt && (!me.findItems(618) || me.findItems(618) < needOrt)) {
				return true;
			}

			break;
		}

		return false;
	},

	cubeRepair: function () {
		if (!Config.CubeRepair) {
			return false;
		}

		if (!(typeof QuestItems !== "undefined" && typeof QuestItems.getCube === "function" && QuestItems.getCube()) &&
				!me.getItem("box") && !me.getItem(566)) {
			return false;
		}

		var items = this.getItemsForRepair(Config.RepairPercent, false);

		items.sort(function (a, b) {
			return a.getStat(72) * 100 / a.getStat(73) - b.getStat(72) * 100 / b.getStat(73);
		});

		while (items.length > 0) {
			this.cubeRepairItem(items.shift());
		}

		return true;
	},

	cubeRepairItem: function (item) {
		var i, rune, cubeItems,
			bodyLoc = item.bodylocation;

		if (item.mode !== 1) {
			return false;
		}

		switch (item.itemType) {
		case 2:
		case 3:
		case 15:
		case 16:
		case 19:
		case 69:
		case 70:
		case 71:
		case 72:
		case 75:
			rune = me.getItem(617); // Ral rune

			break;
		default:
			rune = me.getItem(618); // Ort rune

			break;
		}

		if (rune && Town.openStash() && Cubing.openCube() && Cubing.emptyCube()) {
			for (i = 0; i < 100; i += 1) {
				if (!me.itemoncursor) {
					if (Storage.Cube.MoveTo(item) && Storage.Cube.MoveTo(rune)) {
						transmute();
						delay(1000 + me.ping);
					}

					cubeItems = me.findItems(-1, -1, 6); // Get cube contents

					if (cubeItems.length === 1) { // We expect only one item in cube
						cubeItems[0].toCursor();
					}
				}

				if (me.itemoncursor) {
					for (i = 0; i < 3; i += 1) {
						clickItem(0, bodyLoc);
						delay(me.ping * 2 + 500);

						if (cubeItems[0].bodylocation === bodyLoc) {
							print(cubeItems[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim() + " successfully repaired and equipped.");
							D2Bot.printToConsole(cubeItems[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "").trim() + " successfully repaired and equipped.", 5);

							return true;
						}
					}
				}

				delay(200);
			}

			Misc.errorReport("Failed to put repaired item back on.");
			D2Bot.stop();
		}

		return false;
	},

	repair: function (force = false) {
		var i, quiver, myQuiver, npc, repairAction, bowCheck;

		this.cubeRepair();

		repairAction = this.needRepair();

		if (force && repairAction.indexOf("repair") === -1) {
			repairAction.push("repair");
		}

		if (!repairAction || !repairAction.length) {
			return true;
		}

		for (i = 0; i < repairAction.length; i += 1) {
			switch (repairAction[i]) {
			case "repair":
				npc = this.initNPC("Repair", "repair");

				if (!npc) {
					return false;
				}

				me.repair();

				break;
			case "buyQuiver":
				bowCheck = Attack.usingBow();

				if (bowCheck) {
					if (bowCheck === "bow") {
						quiver = "aqv"; // Arrows
					} else {
						quiver = "cqv"; // Bolts
					}

					myQuiver = me.getItem(quiver, 1);

					if (myQuiver) {
						myQuiver.drop();
					}

					npc = this.initNPC("Repair", "repair");

					if (!npc) {
						return false;
					}

					quiver = npc.getItem(quiver);

					if (quiver) {
						quiver.buy();
					}
				}

				break;
			}
		}

		//this.shopItems();

		return true;
	},

	needRepair: function () {
		var quiver, bowCheck, quantity,
			repairAction = [],
			canAfford = me.gold >= me.getRepairCost();

		// Arrow/Bolt check
		bowCheck = Attack.usingBow();

		if (bowCheck) {
			switch (bowCheck) {
			case "bow":
				quiver = me.getItem("aqv", 1); // Equipped arrow quiver

				break;
			case "crossbow":
				quiver = me.getItem("cqv", 1); // Equipped bolt quiver

				break;
			}

			if (!quiver) { // Out of arrows/bolts
				repairAction.push("buyQuiver");
			} else {
				quantity = quiver.getStat(70);

				if (typeof quantity === "number" && quantity * 100 / getBaseStat("items", quiver.classid, "maxstack") <= Config.RepairPercent) {
					repairAction.push("buyQuiver");
				}
			}
		}

		// Repair durability/quantity/charges
		if (canAfford) {
			if (this.getItemsForRepair(Config.RepairPercent, true).length > 0) {
				repairAction.push("repair");
			}
		} else {
			print("ÿc4Town: ÿc1Can't afford repairs.");
		}

		return repairAction;
	},

	getItemsForRepair: function (repairPercent, chargedItems) {
		var i, charge, quantity, durability,
			itemList = [],
			item = me.getItem(-1, 1);

		if (item) {
			do {
				if (!item.getFlag(0x400000)) { // Skip ethereal items
					if (!item.getStat(152)) { // Skip indestructible items
						switch (item.itemType) {
						// Quantity check
						case 42: // Throwing knives
						case 43: // Throwing axes
						case 44: // Javelins
						case 87: // Amazon javelins
							quantity = item.getStat(70);

							if (typeof quantity === "number" && quantity * 100 / (getBaseStat("items", item.classid, "maxstack") + item.getStat(254)) <= repairPercent) { // Stat 254 = increased stack size
								itemList.push(copyUnit(item));
							}

							break;
						// Durability check
						default:
							durability = item.getStat(72);

							if (typeof durability === "number" && durability * 100 / item.getStat(73) <= repairPercent) {
								itemList.push(copyUnit(item));
							}

							break;
						}
					}

					if (chargedItems) {
						// Charged item check
						charge = item.getStat(-2)[204];

						if (typeof (charge) === "object") {
							if (charge instanceof Array) {
								for (i = 0; i < charge.length; i += 1) {
									if (charge[i] !== undefined && charge[i].hasOwnProperty("charges") && charge[i].charges * 100 / charge[i].maxcharges <= repairPercent) {
										itemList.push(copyUnit(item));
									}
								}
							} else if (charge.charges * 100 / charge.maxcharges <= repairPercent) {
								itemList.push(copyUnit(item));
							}
						}
					}
				}
			} while (item.getNext());
		}

		return itemList;
	},

	reviveMerc: function () {
		if (!this.needMerc()) {
			return true;
		}

		// Fuck Aheara
		if (me.act === 3) {
			this.goToTown(2);
		}

		var i, tick, dialog, lines,
			preArea = me.area,
			npc = this.initNPC("Merc", "reviveMerc");

		if (!npc) {
			return false;
		}

MainLoop:
		for (i = 0; i < 3; i += 1) {
			dialog = getDialogLines();

			for (lines = 0; lines < dialog.length; lines += 1) {
				if (dialog[lines].text.match(":", "gi")) {
					dialog[lines].handler();
					delay(Math.max(750, me.ping * 2));
				}

				// "You do not have enough gold for that."
				if (dialog[lines].text.match(getLocaleString(3362), "gi")) {
					return false;
				}
			}

			while (getTickCount() - tick < 2000) {
				if (!!me.getMerc()) {
					delay(Math.max(750, me.ping * 2));

					break MainLoop;
				}

				delay(200);
			}
		}

		Attack.checkInfinity();

		if (!!me.getMerc()) {
			if (Config.MercWatch) { // Cast BO on merc so he doesn't just die again
				print("MercWatch precast");
				Pather.useWaypoint("random");
				Precast.doPrecast(true);
				Pather.useWaypoint(preArea);
			}

			return true;
		}

		return false;
	},

	needMerc: function () {
		var i, merc;

		if (me.gametype === 0 || !Config.UseMerc || me.gold < me.mercrevivecost) { // gametype 0 = classic
			return false;
		}

		// me.getMerc() might return null if called right after taking a portal, that's why there's retry attempts
		for (i = 0; i < 3; i += 1) {
			merc = me.getMerc();

			if (merc && merc.mode !== 0 && merc.mode !== 12) {
				return false;
			}

			delay(100);
		}

		if (!me.mercrevivecost) { // In case we never had a merc and Config.UseMerc is still set to true for some odd reason
			return false;
		}

		return true;
	},

	canStash: function (item) {
		var ignoredClassids = [91, 174]; // Some quest items that have to be in inventory or equipped

		if (!item) {
			return false;
		}

		// Never stash potions — belt/inv buffers only (itemType can miss PD2 pots)
		if (this.isPotionItem(item)) {
			return false;
		}

		if (this.ignoredItemTypes.indexOf(item.itemType) > -1 || ignoredClassids.indexOf(item.classid) > -1 || !Storage.Stash.CanFit(item)) {
			return false;
		}

		return true;
	},

	// Same keep rules as stash() — used by needStash so we don't walk for junk that won't bank
	shouldStashItem: function (item) {
		var result, tier;

		if (!item || !this.canStash(item)) {
			return false;
		}

		// Best tiered shield while still on 2H staff — bank for when we find an orb/1H
		if (typeof Item.isPendingShield === "function" && Item.isPendingShield(item) &&
				Item.isBestPendingShield(item)) {
			Item.rememberPendingShield(item);
			return true;
		}

		result = (Pickit.checkItem(item).result > 0 && Pickit.checkItem(item).result < 4) ||
			Cubing.keepItem(item) || Runewords.keepItem(item) || CraftingSystem.keepItem(item);

		if (Config.AutoEquip && Pickit.checkItem(item).result === 1) {
			tier = NTIP.GetTier(item);

			if (tier > 0 && tier < 100) {
				result = false;
			}
		}

		if (this.isCharmItem(item) && !this.isKeptCharm(item)) {
			result = false;
		}

		if (result || (typeof Pickit.isRuneItem === "function" && Pickit.isRuneItem(item))) {
			return true;
		}

		return false;
	},

	// One stash open: pull pots → bank keeps → gold → close
	doStashVisit: function (stashGold) {
		var needPots, needBank, i, items;

		if (stashGold === undefined) {
			stashGold = true;
		}

		needPots = this.hasStashedPotions();
		needBank = this.needStash(stashGold);

		if (!needPots && !needBank) {
			print("ÿc2Townÿc0 :: stash skip (nothing to bank / no stashed pots)");
			return true;
		}

		me.cancel();
		delay(50 + me.ping);

		if (!this.openStash()) {
			print("ÿc1Townÿc0 :: stash open failed");
			return false;
		}

		print("ÿc2Townÿc0 :: stash once (pots=" + needPots + " bank=" + needBank + ")");

		if (needPots) {
			this.retrieveStashedPotions(true);
		}

		items = Storage.Inventory.Compare(Config.Inventory);

		if (items) {
			for (i = 0; i < items.length; i += 1) {
				if (this.shouldStashItem(items[i])) {
					Misc.itemLogger("Stashed", items[i]);
					Storage.Stash.MoveTo(items[i]);
				}
			}
		}

		if (stashGold && Config.StashGold && me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5) {
			gold(me.getStat(14), 3);
			delay(500 + me.ping);
		}

		me.cancel();
		delay(100 + me.ping);

		return true;
	},

	stash: function (stashGold) {
		// Prefer single visit helper (keeps old callers working)
		return this.doStashVisit(stashGold);
	},

	needStash: function (checkGold) {
		var i, items;

		if (checkGold === undefined) {
			checkGold = true;
		}

		if (checkGold && Config.StashGold && me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5) {
			return true;
		}

		items = Storage.Inventory.Compare(Config.Inventory);

		if (!items) {
			return false;
		}

		for (i = 0; i < items.length; i += 1) {
			if (this.shouldStashItem(items[i])) {
				return true;
			}
		}

		return false;
	},

	openStash: function () {
		var i, tick, stash;

		if (getUIFlag(0x1a) && !Cubing.closeCube()) {
			return false;
		}

		if (getUIFlag(0x19)) {
			return true;
		}

		for (i = 0; i < 5; i += 1) {
			me.cancel();

			if (this.move("stash")) {
				stash = getUnit(2, 267);

				if (stash) {
					Misc.click(0, 0, stash);
					//stash.interact();

					tick = getTickCount();

					while (getTickCount() - tick < 5000) {
						if (getUIFlag(0x19)) {
							delay(100 + me.ping * 2); // allow UI to initialize

							return true;
						}

						delay(100);
					}
				}
			}

			Packet.flash(me.gid);
		}

		return false;
	},

	getCorpse: function () {
		var i, corpse, gid, coord,
			corpseList = [],
			timer = getTickCount();

		// No equipped items - high chance of dying in last game, force retries
		if (!me.getItem(-1, 1)) {
			for (i = 0; i < 5; i += 1) {
				corpse = getUnit(0, me.name, 17);

				if (corpse) {
					break;
				}

				delay(500);
			}
		} else {
			corpse = getUnit(0, me.name, 17);
		}

		if (!corpse) {
			return true;
		}

		do {
			if (corpse.dead && corpse.name === me.name && (getDistance(me.x, me.y, corpse.x, corpse.y) <= 20 || me.inTown)) {
				corpseList.push(copyUnit(corpse));
			}
		} while (corpse.getNext());

		while (corpseList.length > 0) {
			if (me.dead) {
				return false;
			}

			gid = corpseList[0].gid;

			Pather.moveToUnit(corpseList[0]);
			Misc.click(0, 0, corpseList[0]);
			delay(500);

			if (getTickCount() - timer > 3000) {
				coord = CollMap.getRandCoordinate(me.x, -1, 1, me.y, -1, 1, 4);
				Pather.moveTo(coord.x, coord.y);
			}

			if (getTickCount() - timer > 30000) {
				D2Bot.printToConsole("Failed to get corpse, stopping.", 9);
				D2Bot.stop();
			}

			if (!getUnit(0, -1, -1, gid)) {
				corpseList.shift();
			}
		}

		if (me.gametype === 0) {
			this.checkShard();
		}

		return true;
	},

	checkShard: function () {
		var shard,
			check = {left: false, right: false},
			item = me.getItem("bld", 0);

		if (item) {
			do {
				if (item.location === 3 && item.quality === 7) {
					shard = copyUnit(item);

					break;
				}
			} while (item.getNext());
		}

		if (!shard) {
			return true;
		}

		item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.bodylocation === 4) {
					check.right = true;
				}

				if (item.bodylocation === 5) {
					check.left = true;
				}
			} while (item.getNext());
		}

		if (!check.right) {
			shard.toCursor();

			while (me.itemoncursor) {
				clickItem(0, 4);
				delay(500);
			}
		} else if (!check.left) {
			shard.toCursor();

			while (me.itemoncursor) {
				clickItem(0, 5);
				delay(500);
			}
		}

		return true;
	},

	clearBelt: function () {
		while (!me.gameReady) {
			delay(100);
		}

		var item = me.getItem(-1, -1),
			clearList = [],
			colType, potType;

		if (item) {
			do {
				// Belt pots: mode 2 and/or location 2
				if (item.mode !== 2 && item.location !== 2) {
					continue;
				}

				colType = Config.BeltColumn[item.x % 4];
				potType = this.potionKind(item);

				if (!potType || potType === "vps") {
					continue; // stamina cleared in town; unknown left alone
				}

				if (colType !== potType) {
					clearList.push(copyUnit(item));
				}
			} while (item.getNext());

			while (clearList.length > 0) {
				clearList.shift().interact();
				delay(200);
			}
		}

		return true;
	},

	// Move stamina pots off the belt into inventory (town only — called from buyPotions).
	// Never keep a vps belt column; ground picks may land on empty belt slots until then.
	clearBeltStamina: function () {
		var item, pot, list = [];

		while (!me.gameReady) {
			delay(100);
		}

		item = me.getItem(-1, 2);

		if (item) {
			do {
				if (item.mode === 2 && (String(item.code || "").toLowerCase() === "vps" ||
						item.itemType === 79 ||
						(item.name && String(item.name).toLowerCase().indexOf("stamina") > -1))) {
					list.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		while (list.length > 0) {
			pot = list.shift();

			try {
				if (pot.toCursor() && this.placeInvPotion(pot)) {
					delay(100 + me.ping);
					continue;
				}
			} catch (eMove) {}

			// Inventory full — drink so the slot can take hp/mp
			try {
				pot.interact();
			} catch (eDrink) {}

			delay(100 + me.ping);
		}

		return true;
	},

	clearScrolls: function () {
		var i, items = me.getItems(),
			shopped = false;

		for (i = 0; !!items && i < items.length; i += 1) {
			if (items[i].location === 3 && items[i].mode === 0 && items[i].itemType === 22) {
				// Keep TP/ID scrolls until we have tomes (and always useful early)
				if (items[i].code === "tsc" || items[i].code === "isc") {
					continue;
				}

				if (!shopped) {
					this.ensureShopOpen("clearScrolls");
					shopped = true;
				}

				this.sellInventoryItem(items[i]);
			}
		}

		return true;
	},

	// Shop UI open? (trade flag or packet shop NPC)
	isShopOpen: function () {
		return !!(getUIFlag(0xC) || (Config.PacketShopping && getInteractedNPC() && getInteractedNPC().itemcount > 0));
	},

	ensureShopOpen: function (reason) {
		if (this.isShopOpen()) {
			return true;
		}

		return !!this.initNPC("Shop", reason || "sellJunk");
	},

	// Prefer sell. Keep consumable hp/mp/rv/stamina/scrolls/tomes.
	// Antidote (yps) / thawing (wms) ARE sold — field leftovers only; Andy/Duriel buy fresh after chores.
	sellInventoryItem: function (item) {
		var cost, code, kind;

		if (!item || item.location !== 3) {
			return false;
		}

		if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item)) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		kind = (typeof this.potionKind === "function") ? this.potionKind(item) : false;

		// Sell antidote / thawing leftovers (never keep after field pick / old buys)
		if (kind === "yps" || kind === "wms" || item.itemType === 80 || item.itemType === 81 ||
				code === "yps" || code === "wms") {
			if (!this.ensureShopOpen("sellToxPot")) {
				// Shop fail — drop so they don't clog inv
				try {
					if (this.isShopOpen() || getUIFlag(0x08)) {
						me.cancel();
						delay(100 + me.ping);
					}

					Misc.itemLogger("Dropped", item, "toxPot");
					item.drop();
				} catch (eDropTox) {}

				return true;
			}

			try {
				print("ÿc2Townÿc0 :: sell " + (kind || code || "tox pot"));
				Misc.itemLogger("Sold", item);
				item.sell();
				delay(Math.min(120, 40 + me.ping));
				return true;
			} catch (eSellTox) {
				try {
					me.cancel();
					delay(100 + me.ping);
					item.drop();
				} catch (eDrop2) {}

				return true;
			}
		}

		// Never sell/drop hp/mp/rv/stamina / scrolls / tomes
		if ([76, 77, 78, 79].indexOf(item.itemType) > -1 ||
				code.indexOf("hp") === 0 || code.indexOf("mp") === 0 || code.indexOf("rv") === 0 ||
				code === "vps" ||
				code === "tsc" || code === "isc" || code === "tbk" || code === "ibk" ||
				item.itemType === 18 || item.itemType === 22) {
			return false;
		}

		try {
			cost = item.getItemCost(1) || 0;
		} catch (eCost) {
			cost = 0;
		}

		// Truly unsellable (quest / no value) — only then drop (non-potion)
		if (cost <= 1 || item.itemType === 39) {
			if (this.isShopOpen() || getUIFlag(0x08)) {
				me.cancel();
				delay(150 + me.ping);
			}

			try {
				Misc.itemLogger("Dropped", item, "unsellable");
				item.drop();
			} catch (eDrop) {}

			return true;
		}

		if (!this.ensureShopOpen("sellJunk")) {
			print("ÿc8Townÿc0 :: shop unavailable — keeping " + (item.name || "?") + " to sell next visit");
			return false;
		}

		try {
			print("ÿc2Townÿc0 :: sell " + (item.name || "?"));
			Misc.itemLogger("Sold", item);
			item.sell();
			delay(Math.min(120, 40 + me.ping));
			return true;
		} catch (eSell) {
			print("ÿc1Townÿc0 :: sell failed " + (item.name || "?") + " :: " + eSell);
			return false;
		}
	},

	// True if this inv item should be sold this chores pass
	isTownJunk: function (item) {
		var result;

		if (!item || item.location !== 3) {
			return false;
		}

		if ([18, 41, 76, 77, 78, 79].indexOf(item.itemType) > -1) {
			return false;
		}

		if ((typeof Pickit.isRuneItem === "function" && Pickit.isRuneItem(item)) ||
				item.itemType === 74 || (item.code && /^r\d{2}s?$/i.test(item.code))) {
			return false;
		}

		// Kept charms stay; junk charms sold below
		if (this.isKeptCharm(item)) {
			return false;
		}

		if (item.code && (item.code.indexOf("hp") === 0 || item.code.indexOf("mp") === 0 ||
				item.code.indexOf("rv") === 0 || item.code === "vps" ||
				item.code === "tsc" || item.code === "isc" || item.code === "tbk" || item.code === "ibk")) {
			return false;
		}

		if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item)) {
			return false;
		}

		if (typeof Pickit !== "undefined" && typeof Pickit.isPd2Currency === "function" && Pickit.isPd2Currency(item)) {
			return false;
		}

		if (Cubing.keepItem(item) || Runewords.keepItem(item) || CraftingSystem.keepItem(item)) {
			return false;
		}

		// Real player autoequip upgrade only
		if (Item.hasTier(item) && Item.autoEquipCheck(item)) {
			return false;
		}

		// Best pending shield (2H staff era) — keep/stash, never sell
		if (typeof Item.isPendingShield === "function" && Item.isPendingShield(item)) {
			if (Item.isBestPendingShield(item)) {
				Item.rememberPendingShield(item);
				return false;
			}

			return true; // inferior pending shields — sell
		}

		// Tiered leftovers (extra amulets/rings/etc. that aren't upgrades) — sell
		if (Config.AutoEquip && NTIP.GetTier(item) > 0 && !Item.autoEquipCheck(item)) {
			return true;
		}

		// Sorc: bows/xbows are never kept in inv (PD2 amazon bow = 86, not 85 grand charm)
		if ([27, 35, 86].indexOf(item.itemType) > -1) {
			return true;
		}

		// Leftover merc gear (not an upgrade) — sell. Pending merc upgrades stay.
		if (typeof Item.isMercInvLeftover === "function" && Item.isMercInvLeftover(item)) {
			return true;
		}

		if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(item)) {
			return false;
		}

		// Antidote (80) / thawing (81) — sell leftovers (Andy/Duriel buy fresh when needed)
		if (item.itemType === 80 || item.itemType === 81 ||
				(item.code && (String(item.code).toLowerCase() === "yps" || String(item.code).toLowerCase() === "wms"))) {
			return true;
		}

		// Bad charms (identified, not in leveling keep nip) — sell
		if (this.isCharmItem(item)) {
			return !this.isKeptCharm(item);
		}

		// Arrows/bolts: sell whites/magic leftovers; keep rare/unique
		if (item.itemType === 5 || item.itemType === 6) {
			return item.quality !== 6 && item.quality !== 7;
		}

		result = Pickit.checkItem(item).result;

		// Nip "keep" that isn't autoequip upgrade / cubing → still sell if junk quality
		// (never quest — already returned above)
		if (result === 1 && !Item.hasTier(item) && !Cubing.keepItem(item) && !Runewords.keepItem(item)) {
			if (item.quality >= 4 || item.getItemCost(1) > 50) {
				return true;
			}
		}

		if (result === 1 || result === 2 || result === 3 || result === 5) {
			return false;
		}

		return result === 0 || result === 4 || result === -1;
	},

	// Flush antidote / thawing from inv + belt (field leftovers). Andy/Duriel buy after chores.
	flushToxPots: function () {
		var item, list = [], i, pot, code, kind, n = 0;

		item = me.getItem(-1, -1);

		if (item) {
			do {
				// 2 = belt, 3 = inventory
				if (item.location !== 2 && item.location !== 3) {
					continue;
				}

				code = item.code ? String(item.code).toLowerCase() : "";
				kind = this.potionKind(item);

				if (kind === "yps" || kind === "wms" || item.itemType === 80 || item.itemType === 81 ||
						code === "yps" || code === "wms") {
					list.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		if (!list.length) {
			return 0;
		}

		print("ÿc2Townÿc0 :: flush " + list.length + " antidote/thawing leftover(s)");

		for (i = 0; i < list.length; i += 1) {
			pot = me.getItem(-1, -1, list[i].gid);

			if (!pot || (pot.location !== 2 && pot.location !== 3)) {
				continue;
			}

			// Belt → sell needs shop; inv sellInventoryItem handles inv
			if (pot.location === 3) {
				if (this.sellInventoryItem(pot)) {
					n += 1;
				}

				continue;
			}

			// Belt pot
			if (!this.ensureShopOpen("flushToxBelt")) {
				try {
					me.cancel();
					delay(80 + me.ping);
					pot.interact(); // drink rather than clog belt
					n += 1;
				} catch (eDrink) {}

				continue;
			}

			try {
				pot.sell();
				n += 1;
				delay(40 + me.ping);
			} catch (eSell) {
				try {
					me.cancel();
					delay(80 + me.ping);
					pot.interact();
					n += 1;
				} catch (eDrink2) {}
			}
		}

		return n;
	},

	clearInventory: function () {
		var i, item,
			items = [],
			junk = [];

		this.checkQuestItems(); // only golden bird quest for now

		// Return potions to belt (shop/stash must be closed)
		me.cancel();
		delay(50 + me.ping);

		this.logPotionState("clearInventory start");

		this.refillBeltIfNeeded();

		// Sell (prefer) / drink inv pots above buffer (belt already filled)
		this.cullExcessPotions();

		// Antidote / thawing — never keep as field loot (shop prep buys fresh)
		this.flushToxPots();

		// Collect junk, then one shop visit — sell everything worth gold
		this.charmKeepList = null;
		this.identifyAllCharms();
		this.applyCharmInventoryLock();
		items = Storage.Inventory.Compare(Config.Inventory);

		for (i = 0; !!items && i < items.length; i += 1) {
			if (this.isTownJunk(items[i])) {
				junk.push(copyUnit(items[i]));
			}
		}

		// Charms locked earlier / sitting in zone — sell bad ones explicitly
		this.sellAllBadCharms(junk);

		// Ammo can sit outside Compare (locked charm cells) — always flush leftovers
		this.sellAllInvAmmo(junk);
		this.sellAllInvMercWeapons(junk);

		if (junk.length) {
			print("ÿc2Townÿc0 :: Selling " + junk.length + " junk item(s)");
			this.ensureShopOpen("clearInventory");

			for (i = 0; i < junk.length; i += 1) {
				item = me.getItem(-1, -1, junk[i].gid);

				if (item && item.location === 3) {
					this.sellInventoryItem(item);
				}
			}
		}

		// Second pass — Compare can miss pots in locked cells
		this.flushToxPots();

		return true;
	},

	// Sell identified charms that fail leveling_charms.nip keep rules
	sellAllBadCharms: function (junk) {
		var item, seen = {}, i, gids = [], gid, code, keep, ided;

		if (!junk) {
			junk = [];
		}

		for (i = 0; i < junk.length; i += 1) {
			seen[junk[i].gid] = true;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location !== 3 || !this.isCharmItem(item) || seen[item.gid]) {
					continue;
				}

				ided = !!item.getFlag(0x10);
				keep = this.isKeptCharm(item);
				code = item.code ? String(item.code) : "?";

				if (!ided) {
					print("ÿc8Townÿc0 :: charm still unid " + code + " @ " + item.x + "," + item.y + " — skip sell");
					continue;
				}

				if (keep) {
					print("ÿc2Townÿc0 :: keep charm " + code + " type=" + item.itemType + " @ " + item.x + "," + item.y);
					continue;
				}

				print("ÿc2Townÿc0 :: sell junk charm " + code + " type=" + item.itemType + " @ " + item.x + "," + item.y);
				gids.push(item.gid);
				seen[item.gid] = true;
			} while (item.getNext());
		}

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			item = me.getItem(-1, -1, gid);

			if (item && item.location === 3) {
				junk.push(copyUnit(item));
			}
		}
	},

	// Flush bows/xbows left after merc equip (sorc never keeps them)
	sellAllInvMercWeapons: function (junk) {
		var item, seen = {}, i, gids = [], gid;

		if (!junk) {
			junk = [];
		}

		for (i = 0; i < junk.length; i += 1) {
			seen[junk[i].gid] = true;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				// PD2: 27 bow, 35 xbow, 86 amazon bow — NOT 85 (grand charm)
				if (item.location === 3 && [27, 35, 86].indexOf(item.itemType) > -1 && !seen[item.gid]) {
					gids.push(item.gid);
					seen[item.gid] = true;
				}
			} while (item.getNext());
		}

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			item = me.getItem(-1, -1, gid);

			if (!item || item.location !== 3) {
				continue;
			}

			junk.push(copyUnit(item));
		}
	},

	// Sell every quiver still in inventory after merc equip attempt
	sellAllInvAmmo: function (junk) {
		var item, seen = {}, i, gids = [], gid;

		if (!junk) {
			junk = [];
		}

		for (i = 0; i < junk.length; i += 1) {
			seen[junk[i].gid] = true;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && (item.itemType === 5 || item.itemType === 6) && !seen[item.gid]) {
					// Keep rare/unique quivers
					if (item.quality === 6 || item.quality === 7) {
						continue;
					}

					gids.push(item.gid);
					seen[item.gid] = true;
				}
			} while (item.getNext());
		}

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			item = me.getItem(-1, -1, gid);

			if (!item || item.location !== 3) {
				continue;
			}

			if (typeof Item.mercNeedsAmmo === "function" && Item.mercNeedsAmmo(item)) {
				Item.equipMerc(item, 5);
				item = me.getItem(-1, -1, gid);

				if (!item || item.location !== 3) {
					continue; // equipped onto merc
				}
			}

			junk.push(copyUnit(item));
		}

		return junk;
	},

	act : [{}, {}, {}, {}, {}],

	initialize: function () {
		//print("Initialize town " + me.act);

		switch (me.act) {
		case 1:
			var fire,
				wp = getPresetUnit(1, 2, 119),
				fireUnit = getPresetUnit(1, 2, 39);

			if (!fireUnit) {
				return false;
			}

			fire = [fireUnit.roomx * 5 + fireUnit.x, fireUnit.roomy * 5 + fireUnit.y];

			this.act[0].spot = {};
			this.act[0].spot.stash = [fire[0] - 7, fire[1] - 12];
			this.act[0].spot[NPC.Warriv] = [fire[0] - 5, fire[1] - 2];
			this.act[0].spot[NPC.Cain] = [fire[0] + 6, fire[1] - 5];
			this.act[0].spot[NPC.Kashya] = [fire[0] + 14, fire[1] - 4];
			this.act[0].spot[NPC.Akara] = [fire[0] + 56, fire[1] - 30];
			this.act[0].spot[NPC.Charsi] = [fire[0] - 39, fire[1] - 25];
			this.act[0].spot[NPC.Gheed] = [fire[0] - 34, fire[1] + 36];
			this.act[0].spot.portalspot = [fire[0] + 10, fire[1] + 18];
			this.act[0].spot.waypoint = [wp.roomx * 5 + wp.x, wp.roomy * 5 + wp.y];
			this.act[0].initialized = true;

			break;
		case 2:
			this.act[1].spot = {};
			this.act[1].spot[NPC.Fara] = [5124, 5082];
			this.act[1].spot[NPC.Cain] = [5125, 5070]; // near stash/Atma — not Fara's door
			this.act[1].spot[NPC.Lysander] = [5118, 5104];
			this.act[1].spot[NPC.Greiz] = [5033, 5053];
			this.act[1].spot[NPC.Elzix] = [5032, 5102];
			this.act[1].spot.palace = [5088, 5153];
			this.act[1].spot.sewers = [5221, 5181];
			this.act[1].spot[NPC.Meshif] = [5205, 5058];
			this.act[1].spot[NPC.Drognan] = [5097, 5035];
			this.act[1].spot[NPC.Atma] = [5137, 5060];
			this.act[1].spot[NPC.Warriv] = [5152, 5201];
			this.act[1].spot.portalspot = [5168, 5060];
			this.act[1].spot.stash = [5124, 5076];
			this.act[1].spot.waypoint = [5070, 5083];
			this.act[1].initialized = true;

			break;
		case 3:
			this.act[2].spot = {};
			this.act[2].spot[NPC.Meshif] = [5118, 5168];
			this.act[2].spot[NPC.Hratli] = [5223, 5048, 5127, 5172];
			this.act[2].spot[NPC.Ormus] = [5129, 5093];
			this.act[2].spot[NPC.Asheara] = [5043, 5093];
			this.act[2].spot[NPC.Alkor] = [5083, 5016];
			this.act[2].spot[NPC.Cain] = [5148, 5066];
			this.act[2].spot.stash = [5144, 5059];
			this.act[2].spot.portalspot = [5150, 5063];
			this.act[2].spot.waypoint = [5158, 5050];
			this.act[2].initialized = true;

			break;
		case 4:
			this.act[3].spot = {};
			this.act[3].spot[NPC.Cain] = [5027, 5027];
			this.act[3].spot[NPC.Halbu] = [5089, 5031];
			this.act[3].spot[NPC.Tyrael] = [5027, 5027];
			this.act[3].spot[NPC.Jamella] = [5088, 5054];
			this.act[3].spot.stash = [5022, 5040];
			this.act[3].spot.portalspot = [5045, 5042];
			this.act[3].spot.waypoint = [5043, 5018];
			this.act[3].initialized = true;

			break;
		case 5:
			this.act[4].spot = {};
			this.act[4].spot.portalspot = [5098, 5019];
			this.act[4].spot.stash = [5129, 5061];
			this.act[4].spot[NPC.Larzuk] = [5141, 5045];
			this.act[4].spot[NPC.Malah] = [5078, 5029];
			this.act[4].spot[NPC.Cain] = [5119, 5061];
			this.act[4].spot[NPC.Qual_Kehk] = [5066, 5083];
			this.act[4].spot[NPC.Anya] = [5112, 5120];
			this.act[4].spot.portal = [5118, 5120];
			this.act[4].spot.waypoint = [5113, 5068];
			this.act[4].spot[NPC.Nihlathak] = [5071, 5111];
			this.act[4].initialized = true;

			break;
		}

		return true;
	},

	move: function (spot) {
		if (!me.inTown) {
			this.goToTown();
		}

		var i, path;

		if (!this.act[me.act - 1].initialized) {
			this.initialize();
		}

		// Act 5 wp->portalspot override - ActMap.cpp crash
		if (me.act === 5 && spot === "portalspot" && getDistance(me.x, me.y, 5113, 5068) <= 8) {
			path = [5113, 5068, 5108, 5051, 5106, 5046, 5104, 5041, 5102, 5027, 5098, 5018];

			for (i = 0; i < path.length; i += 2) {
				Pather.walkTo(path[i], path[i + 1]);
			}

			return true;
		}

		for (i = 0; i < 3; i += 1) {
			if (this.moveToSpot(spot)) {
				return true;
			}

			Packet.flash(me.gid);
		}

		return false;
	},

	moveToSpot: function (spot) {
		var i, path, townSpot,
			longRange = (spot === "waypoint");

		if (!this.act[me.act - 1].hasOwnProperty("spot") || !this.act[me.act - 1].spot.hasOwnProperty(spot)) {
			return false;
		}

		if (typeof (this.act[me.act - 1].spot[spot]) === "object") {
			townSpot = this.act[me.act - 1].spot[spot];
		} else {
			return false;
		}

		if (longRange) {
			path = getPath(me.area, townSpot[0], townSpot[1], me.x, me.y, 1, 8);

			if (path && path[1]) {
				townSpot = [path[1].x, path[1].y];
			}
		}

		for (i = 0; i < townSpot.length; i += 2) {
			//print("moveToSpot: " + spot + " from " + me.x + ", " + me.y);

			if (getDistance(me, townSpot[i], townSpot[i + 1]) > 2) {
				Pather.moveTo(townSpot[i], townSpot[i + 1], 3, false, true);
			}

			switch (spot) {
			case "stash":
				if (!!getUnit(2, 267)) {
					return true;
				}

				break;
			case "palace":
				if (!!getUnit(1, NPC.Jerhyn)) {
					return true;
				}

				break;
			case "portalspot":
			case "sewers":
				if (getDistance(me, townSpot[i], townSpot[i + 1]) < 10) {
					return true;
				}

				break;
			case "waypoint":
				if (!!getUnit(2, "waypoint")) {
					return true;
				}

				break;
			default:
				if (!!getUnit(1, spot)) {
					return true;
				}

				break;
			}
		}

		return false;
	},

	goToTown: function (act, wpmenu) {
		var towns = [1, 40, 75, 103, 109],
			portalOk = false,
			made, existing, npc;

		if (!me.inTown) {
			// LifeChicken will quit — don't open TPs on the way out
			if (Pather.atLifeChicken && Pather.atLifeChicken()) {
				return false;
			}

			try {
				// Prefer an already-open portal (stops spam when getParent is blank on PD2)
				existing = Pather.findOwnPortal ? Pather.findOwnPortal(40) : null;

				if (existing) {
					portalOk = Pather.usePortal(null, null, existing);
				}

				if (!portalOk && !me.inTown) {
					made = Pather.makePortal();

					// makePortal returns the portal unit — use it directly
					if (made && typeof made === "object") {
						portalOk = Pather.usePortal(null, null, made);
					} else if (made) {
						portalOk = Pather.usePortal(null, me.name);
					}
				}
			} catch (ePortal) {
				print("ÿc8Town.goToTownÿc0 :: portal failed (" + ePortal + ")");
				portalOk = false;
			}

			if (!portalOk && !me.inTown) {
				print("ÿc8Town.goToTownÿc0 :: No usable TP — walking to town");
				if (!this.walkToTown()) {
					if (this._walkStuckCount >= 3) {
						print("ÿc1Town.goToTownÿc0 :: stuck 3x — reloading game");
						delay(500);
						quit();
					}

					throw new Error("Town.goToTown: Failed to portal or walk to town");
				}
			}
		}

		if (me.inTown) {
			this._walkStuckCount = 0;
		}

		if (act === undefined) {
			return true;
		}

		if (act < 1 || act > 5) {
			throw new Error("Town.goToTown: Invalid act");
		}

		if (act !== me.act) {
			me.cancel();
			delay(150 + me.ping);

			try {
				Pather.useWaypoint(towns[act - 1], wpmenu);
			} catch (WPError) {
				print("ÿc8Town.goToTownÿc0 :: Failed use WP to act " + act + " (" + WPError + ")");
			}

			// WP missing / menu fail — Act1→Act2 via Warriv (common after Andy before Lut WP)
			if (me.act !== act && act === 2 && me.act === 1) {
				try {
					this.move("warriv");
					npc = getUnit(1, "warriv");

					if (npc && npc.openMenu()) {
						Misc.useMenu(0x0D36);
						delay(1000 + me.ping * 2);
					}
				} catch (eWar) {
					print("ÿc8Town.goToTownÿc0 :: Warriv Act2 failed (" + eWar + ")");
				}
			}

			if (me.act !== act) {
				print("ÿc8Town.goToTownÿc0 :: still act " + me.act + ", wanted " + act + " — soft fail");

				return false;
			}
		}

		return true;
	},

	/**
	 * Walk back to the current act's town when no TP is available (early Blood Moor etc.).
	 */
	walkToTown: function () {
		var i, townArea,
			towns = [1, 40, 75, 103, 109];

		townArea = towns[me.act - 1];

		// Prefer waypoint to town if we already have one
		if (me.act === 1 && getWaypoint(0)) {
			try {
				Pather.useWaypoint(1);
			} catch (eWp0) {}
		} else if (me.act === 1 && getWaypoint(1)) {
			try {
				Pather.useWaypoint(3);
				Pather.moveToExit(2, true);
				Pather.moveToExit(1, true);
			} catch (eWp1) {}
		}

		for (i = 0; i < 40 && !me.inTown; i += 1) {
			if (me.area === townArea) {
				return true;
			}

			switch (me.area) {
			// Act 1 → Rogue Encampment
			case 8: // Den of Evil → Blood Moor
				Pather.moveToExit(2, true);
				break;
			case 9: // Cave Level 1 → Cold Plains
				Pather.moveToExit(3, true);
				break;
			case 13: // Cave Level 2 → Cave 1
				Pather.moveToExit(9, true);
				break;
			case 17: // Burial Grounds → Cold Plains
				Pather.moveToExit(3, true);
				break;
			case 3: // Cold Plains → Blood Moor
				Pather.moveToExit(2, true);
				break;
			case 4: // Stony Field → Cold Plains
				Pather.moveToExit(3, true);
				break;
			case 10: // Underground Passage → Stony Field
				Pather.moveToExit(4, true);
				break;
			case 5: // Dark Wood → Stony Field
				Pather.moveToExit(4, true);
				break;
			case 6: // Black Marsh → Dark Wood
				Pather.moveToExit(5, true);
				break;
			case 2: // Blood Moor → Rogue Encampment
				Pather.moveToExit(1, true);
				break;
			case 38: // Tristram → Stony Field (red portal)
				if (!Pather.usePortal(4, null)) {
					this._walkStuckCount = (this._walkStuckCount || 0) + 1;
					print("ÿc8Town.walkToTownÿc0 :: stuck in area " + me.area + " (" + this._walkStuckCount + "/3)");

					if (this._walkStuckCount >= 3) {
						print("ÿc1Town.walkToTownÿc0 :: stuck 3x — reloading game");
						delay(500);
						quit();
					}

					return false;
				}

				break;
			case 1:
				this._walkStuckCount = 0;
				return true;
			default:
				// Last resort: WP to act town if any WP exists
				try {
					Pather.useWaypoint(townArea);
				} catch (eWp) {
					this._walkStuckCount = (this._walkStuckCount || 0) + 1;
					print("ÿc8Town.walkToTownÿc0 :: stuck in area " + me.area + " (" + this._walkStuckCount + "/3)");

					if (this._walkStuckCount >= 3) {
						print("ÿc1Town.walkToTownÿc0 :: stuck 3x — reloading game");
						delay(500);
						quit();
					}

					return false;
				}
				break;
			}

			delay(200 + me.ping);
		}

		if (me.inTown) {
			this._walkStuckCount = 0;
		}

		return me.inTown;
	},

	visitTown: function (repair = false) {
		if (me.inTown) {
			this.doChores();
			this.move("stash");

			return true;
		}

		// LifeChicken owns the exit — do not open a TP
		if (Pather.atLifeChicken && Pather.atLifeChicken()) {
			return false;
		}

		var preArea = me.area,
			preAct = me.act;

		try { // not an essential function -> handle thrown errors
			this.goToTown();
		} catch (e) {
			return false;
		}

		this.doChores(repair);

		if (me.act !== preAct) {
			this.goToTown(preAct);
		}

		this.move("portalspot");

		// PD2: getParent often blank — try owner, then any blue portal to preArea
		if (!Pather.usePortal(preArea, me.name) && !Pather.usePortal(preArea, null)) {
			throw new Error("Town.visitTown: Failed to go back from town");
		}

		if (Config.PublicMode) {
			Pather.makePortal();
		}

		return true;
	}
};