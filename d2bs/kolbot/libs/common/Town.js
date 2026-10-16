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
	telekinesis: false, // legacy — TK is pickit + Duriel orifice only (never chests/town objects)
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
	_mercWeaponBoughtDiff: null, // [norm, nm, hell] — shop Act2 spear once per difficulty

	mercWeaponBoughtPath: function () {
		return "data/mercWeaponBought." + me.profile + ".json";
	},

	loadMercWeaponBought: function () {
		var raw, arr, i;

		if (this._mercWeaponBoughtDiff && this._mercWeaponBoughtDiff.length === 3) {
			return this._mercWeaponBoughtDiff;
		}

		arr = [false, false, false];

		try {
			if (FileTools.exists(this.mercWeaponBoughtPath())) {
				raw = JSON.parse(Misc.fileAction(this.mercWeaponBoughtPath(), 0) || "[]");

				if (raw && raw.length) {
					for (i = 0; i < 3; i += 1) {
						arr[i] = !!raw[i];
					}
				}
			}
		} catch (eLoad) {
			arr = [false, false, false];
		}

		this._mercWeaponBoughtDiff = arr;

		return arr;
	},

	hasBoughtMercWeaponThisDiff: function () {
		return !!this.loadMercWeaponBought()[me.diff];
	},

	markMercWeaponBought: function () {
		var arr = this.loadMercWeaponBought();

		if (arr[me.diff]) {
			return;
		}

		arr[me.diff] = true;
		this._mercWeaponBoughtDiff = arr;

		try {
			Misc.fileAction(this.mercWeaponBoughtPath(), 1, JSON.stringify(arr));
		} catch (eSave) {
			try {
				FileTools.writeText(this.mercWeaponBoughtPath(), JSON.stringify(arr));
			} catch (eWrite) {
				print("ÿc8Townÿc0 :: mercWeaponBought save failed: " + eWrite);
			}
		}

		print("ÿc2Townÿc0 :: Act2 merc weapon shop done for diff " + me.diff);
	},

	// Gold needed before a potion top-up is worth a vendor walk (buyPotions bails below this anyway)
	potionGoldMin: function () {
		return me.charlvl < 12 ? 50 : 500;
	},

	// True only when the single chores Shop trade has real work:
	// heal (Shop NPC also heals) / shop-ID or sell / pots we can afford / tome / keys / MiniShop.
	// Nothing here → doChores skips initNPC("Shop") and the bot heads straight to the objective.
	needShopPass: function (tasks) {
		var i, items;

		if (!tasks) {
			tasks = this.tasks[me.act - 1];
		}

		if (tasks && tasks.Heal === tasks.Shop && this.needHealing()) {
			return true;
		}

		if (this.identifyNeedsShop(!!this._choresUsedCain)) {
			return true;
		}

		items = Storage.Inventory.Compare(Config.Inventory);

		for (i = 0; !!items && i < items.length; i += 1) {
			if (this.isTownJunk(items[i])) {
				return true;
			}
		}

		if (me.gold >= this.potionGoldMin() &&
				(this.potionNeedCount("hp") > 0 || this.potionNeedCount("mp") > 0)) {
			return true;
		}

		if (me.gold >= 50 && (this.tomeNeedsFill("tbk") || (Config.FieldID && this.tomeNeedsFill("ibk")))) {
			return true;
		}

		if (tasks && tasks.Key === tasks.Shop && this.wantKeys()) {
			return true;
		}

		if (this.miniShopWanted()) {
			return true;
		}

		return false;
	},

	// Full vendor+stash pass only when something still needs doing.
	// No "first chores this game" / "older than N min" auto-yes: a fresh char with full HP,
	// empty inv and no gold goes straight to the objective.
	needFullChores: function (repair) {
		var age, unids, items, i, repairNeed;

		if (this.forceNextChores || repair) {
			return true;
		}

		age = this.lastFullChores ? (getTickCount() - this.lastFullChores) : Infinity;

		// Just finished chores (start → next objective) — do NOT re-vendor for buffer top-ups.
		// TownChicken sets forceNextChores when it TPs for a real pot need.
		if (age < 2 * 60 * 1000) {
			if (this.needHealing()) {
				return true;
			}

			// Completely out of hp/mp while low — not potionNeedCount (belt/buffer fill)
			if (typeof Misc !== "undefined" && typeof Misc.needPotionTown === "function" && Misc.needPotionTown()) {
				return true;
			}

			if (typeof this.needKeys === "function" && this.needKeys()) {
				return true;
			}

			if (typeof this.needRepair === "function") {
				repairNeed = this.needRepair();

				if (repairNeed && repairNeed.length > 0) {
					return true;
				}
			}

			if (typeof this.hasBrokenEtherealEquipped === "function" && this.hasBrokenEtherealEquipped()) {
				return true;
			}

			// Unid jewels still in stash — don't wait out the cooldown
			if (this.hasUnidJewelsInStash && this.hasUnidJewelsInStash()) {
				return true;
			}

			return false;
		}

		if (this.needHealing()) {
			return true;
		}

		// Belt/buffer top-up only counts when we can pay for it (buyPotions bails on low gold)
		if (me.gold >= this.potionGoldMin() &&
				(this.potionNeedCount("hp") > 0 || this.potionNeedCount("mp") > 0)) {
			return true;
		}

		if (typeof Misc !== "undefined" && typeof Misc.needPotionTown === "function" && Misc.needPotionTown()) {
			return true;
		}

		if (typeof this.needKeys === "function" && this.needKeys()) {
			return true;
		}

		// Broken / about-to-break gear (Config.RepairPercent) — not RW-base hunting
		if (typeof this.needRepair === "function") {
			repairNeed = this.needRepair();

			if (repairNeed && repairNeed.length > 0) {
				return true;
			}
		}

		// Ethereal broken gear is skipped by needRepair (NPC can't fix) — still force chores to unequip/replace
		if (typeof this.hasBrokenEtherealEquipped === "function" && this.hasBrokenEtherealEquipped()) {
			return true;
		}

		if (typeof this.needStash === "function" && this.needStash()) {
			return true;
		}

		// Stashed pots + belt/buffer gaps — pulling them costs no gold
		if (this.hasStashedPotions() &&
				(this.potionNeedCount("hp") > 0 || this.potionNeedCount("mp") > 0)) {
			return true;
		}

		// TP tome missing / low and we can pay for scrolls
		if (me.gold >= 50 && (this.tomeNeedsFill("tbk") || (Config.FieldID && this.tomeNeedsFill("ibk")))) {
			return true;
		}

		// Dead merc we can afford to revive
		if (typeof this.needMerc === "function" && this.needMerc()) {
			return true;
		}

		if (typeof this.needGamble === "function" && Config.GambleItems && Config.GambleItems.length &&
				this.needGamble()) {
			return true;
		}

		unids = this.getUnids();

		if (unids && unids.length > 0) {
			return true;
		}

		// Unid jewels parked in stash — pull → ID → keep or fragment
		if (this.hasUnidJewelsInStash && this.hasUnidJewelsInStash()) {
			return true;
		}

		items = Storage.Inventory.Compare(Config.Inventory);

		for (i = 0; !!items && i < items.length; i += 1) {
			if (typeof this.isTownJunk === "function" && this.isTownJunk(items[i])) {
				return true;
			}
		}

		if (this.miniShopWanted()) {
			return true;
		}

		// Nothing needs a vendor / stash — skip
		return false;
	},

	// Runes for Stealth/Lore/Spirit are banked but no empty base yet — shop scan is the way to get one
	rwBaseHuntActive: function () {
		if (typeof Runewords === "undefined" || typeof Runeword === "undefined" || !Config.MakeRunewords) {
			return false;
		}

		if (Runeword.Stealth && me.charlvl >= 17 && Runewords.hasStealthRecipe() &&
				!Runewords.hasCompletedArmorRuneword() && !Runewords.hasEmptyStealthBase() &&
				Runewords.haveRunes(Runeword.Stealth)) {
			return true;
		}

		if (Runeword.Lore && me.charlvl >= 20 && Runewords.hasLoreRecipe() &&
				!Runewords.hasCompletedLoreHelm() && !Runewords.hasEmptyLoreBase() &&
				Runewords.haveRunes(Runeword.Lore)) {
			return true;
		}

		// Spirit sword — never for Poison Strike (daggers only)
		if (!(typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) &&
				Runeword.Spirit && me.charlvl >= 18 && Runewords.hasSpiritRecipe() &&
				!Runewords.hasCompletedSpiritSword() && !Runewords.hasEmptySpiritBase() &&
				Runewords.haveRunes(Runeword.Spirit)) {
			return true;
		}

		// Treachery — PS mid armor (Shael+Thul+Lem + 3os def>120)
		if (Runeword.Treachery && me.charlvl >= 35 && Runewords.hasTreacheryRecipe &&
				Runewords.hasTreacheryRecipe() && !Runewords.hasCompletedTreacheryArmor() &&
				!Runewords.hasEmptyTreacheryBase() && Runewords.haveRunes(Runeword.Treachery)) {
			return true;
		}

		return false;
	},

	// MiniShop is a soft need: right away when a RW base hunt is active, otherwise only with
	// gold to spend (Config.MiniShopMinGold) and not more often than every 4 min.
	miniShopWanted: function () {
		var eq, eqTier;

		if (!Config.MiniShopBot) {
			return false;
		}

		if (this.rwBaseHuntActive()) {
			return true;
		}

		// 1H (orb/Spirit) with empty offhand and no banked shield — hunt now
		if (typeof Item !== "undefined" && Item.needsShieldShop && Item.needsShieldShop()) {
			return true;
		}

		if (me.gold < (Config.MiniShopMinGold || 2000)) {
			return false;
		}

		// Starter gloves (white/superior / junk floor) — hunt IAS (melee) or FCR/res (caster)
		if (typeof Item !== "undefined" && Item.getEquippedItem) {
			eq = Item.getEquippedItem(10);
			eqTier = (eq && eq.tier >= 0) ? eq.tier : 0;

			if (!eq || eq.classid === -1) {
				return true;
			}

			if (Item.isCasterGloveBuild && Item.isCasterGloveBuild()) {
				if (eqTier < 10) {
					return true;
				}
			} else if (eqTier < 50) {
				return true;
			}
		}

		return !this.lastFullChores || (getTickCount() - this.lastFullChores) >= 4 * 60 * 1000;
	},

	// Do town chores: ID → vendor (once) → stash (once if needed) → repair → done
	doChores: function (repair = false) {
		if (!me.inTown) {
			this.goToTown();
		}

		if (!this.needFullChores(repair)) {
			print("ÿc2Townÿc0 :: chores skip (already done / nothing needed)");
			this.forceNextChores = false;

			// No NPC / stash walk — but still do the local-only steps a full pass would
			this.spendSkillStatPoints();
			Item.autoEquip();
			me.cancel();

			// Skip vendor, but still park inv mana (picked pots / shop leftovers)
			if (this.needsManaOrganize()) {
				this.organizeManaIfNeeded();
			}

			return true;
		}

		this.forceNextChores = false;
		// Do NOT reset mana-org flags here — only park when needsManaOrganize() at end
		this._manaOrgRunning = false;

		var i, tasks, repairPreview,
			cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];

		Attack.weaponSwitch(Attack.getPrimarySlot());
		tasks = this.tasks[me.act - 1];

		// Snapshot before heal/repair clear needs — Fara merc shop only when Act2 chores already visit Fara
		repairPreview = this.needRepair();
		this._act2FaraMercShop = (me.act === 2) &&
			(this.needHealing() || (repairPreview && repairPreview.indexOf("repair") > -1));

		// --- Local only (no NPC / stash walk) ---
		this.spendSkillStatPoints();
		Item.autoEquip();
		me.cancel();
		delay(100 + me.ping);

		// --- 1) Cain ID + local charm/jewel ID (inv scrolls only — no vendor) ---
		print("ÿc2Townÿc0 :: chores step 1/4 — ID");

		// Pull unid jewels out of stash so Cain / scrolls can ID them (keep good, fragment junk)
		if (this.hasUnidJewelsInStash && this.hasUnidJewelsInStash()) {
			if (this.openStash()) {
				this.unstashUnidJewels();
				me.cancel();
				delay(100 + me.ping);
			}
		}

		this._choresUsedCain = this.cainID();
		this.identifyAllCharms(false); // false = do not open Shop to buy isc
		this.identifyAllJewels(false);
		me.cancel();
		delay(150 + me.ping);

		this.trimCharmInventory([]);
		this.applyCharmInventoryLock();
		this.organizeCharms(); // inv-only; never opens stash
		this.applyCharmInventoryLock();
		me.cancel();
		delay(100 + me.ping);

		// --- 2) ONE Shop trade: heal(same NPC) → ID/sell → sell junk → pots → TP → extras ---
		print("ÿc2Townÿc0 :: chores step 2/4 — vendor (single trade)");

		// Belt must be fixed while shop is closed (cursor moves)
		this.clearBeltStamina();
		this.refillBeltIfNeeded();

		// Heal at a different NPC first (e.g. Act2 Fara vs Drognan).
		// Act2: Fara is Heal+Repair — open trade while healing and run MiniShop (already walking there).
		if (tasks.Heal !== tasks.Shop && this.needHealing()) {
			if (Config.MiniShopBot && tasks.Heal === tasks.Repair) {
				// openMenu heals; Repair trade exposes Fara stock for MiniShop / RW bases
				if (this.initNPC("Repair", "healMiniShop")) {
					this.shopItems();
					me.cancel();
					delay(150 + me.ping);
				} else {
					this.heal();
					me.cancel();
					delay(150 + me.ping);
				}
			} else {
				this.heal();
				me.cancel();
				delay(150 + me.ping);
			}
		}

		// Same NPC as Shop (Akara/Jamella/Malah): ONE openMenu+trade heals — never init Heal then Shop.
		// Only walk there when the trade has real work (heal / ID / sell / pots / tome / keys / MiniShop).
		if (!this.needShopPass(tasks)) {
			print("ÿc2Townÿc0 :: chores vendor skip (nothing to heal / ID / sell / buy)");
		} else if (!this.initNPC("Shop", "choresVendor")) {
			print("ÿc8Townÿc0 :: chores vendor unavailable — skip shop pass");
		} else {
			// 1) Shop-ID if no Cain + sell ID junk
			this.identify(true); // true = shop already open; don't fillTome at end

			// 2) Sell remaining junk (keep trade open — never cancel/reopen)
			this.clearInventory(true);

			// 3) Buy pots (mana/hp) — belt already prepped; keep trade open
			this.buyPotions(true);

			// 4) TP (and FieldID tome) after pots — reuse open trade (no ensureShop reopen)
			this.fillTome("tbk", true);

			if (Config.FieldID) {
				this.fillTome("ibk", true);
			}

			// 5) Keys if this vendor sells them (Akara)
			if (tasks.Key === tasks.Shop) {
				this.buyKeys(true);
			}

			// 6) MiniShop / extras
			this.shopItems();
			this.clearScrolls();

			me.cancel(); // single close
			delay(150 + me.ping);
		}

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
		this.buyPoisonStrikeDagger();
		// Spirit / Stealth RW bases on Repair: scanned inside Town.repair() when durability
		// needs a visit, and on Act2 heal at Fara (Heal===Repair). Never open Repair just to hunt.
		Item.autoEquip(); // equip MiniShop / dagger buys

		// MiniShop runs AFTER clearInventory — replaced staff/armor sits in inv until we sell again.
		// Second Shop open is intentional (post-equip leftovers), not mid-vendor reopen.
		// Pull magic/rare 2os fake RW bases from stash first so this sell can dump them.
		if (this.hasFakeRwBasesInStash() && this.openStash()) {
			this.unstashFakeRwBases();
			me.cancel();
			delay(80 + me.ping);
		}

		this.clearInventory();
		me.cancel();
		delay(150 + me.ping);

		// --- 3) Stash ONCE: bank/promote → Cubing → junk jewels → stack → one cancel ---
		print("ÿc2Townÿc0 :: chores step 3/4 — stash");
		this.doStashVisit(true, true);

		Cubing.doCubing(true);

		// PD2: junk magic/rare jewels + key → Jewel Fragments (after crafts get first dibs)
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.cubeJunkJewelsAtStash === "function") {
			if (Pd2Stack.needsCubeJunkJewels && Pd2Stack.needsCubeJunkJewels()) {
				if (getUIFlag(0x19) || this.openStash()) {
					Pd2Stack.cubeJunkJewelsAtStash();
				}
			}
		}

		// PD2: merge leftover loose runes/gems AFTER make (never fold socketables mid-RW)
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.stackLooseAtStash === "function") {
			if (Pd2Stack.needsStacking && Pd2Stack.needsStacking()) {
				if (getUIFlag(0x19) || this.openStash()) {
					Pd2Stack.stackLooseAtStash();
				}
			}
		}

		if (getUIFlag(0x1a) || getUIFlag(0x19)) {
			me.cancel();
			delay(100 + me.ping);
		}

		Item.autoEquip();
		Item.autoEquipMerc(true);

		// --- 4) Repair if needed ---
		repairPreview = this.needRepair();

		if ((repairPreview && repairPreview.length) || repair) {
			print("ÿc2Townÿc0 :: chores step 4/4 — repair (" +
				((repairPreview && repairPreview.length) ? repairPreview.join("+") : "force") + ")");
			this.repair(repair);
			me.cancel();
			delay(100 + me.ping);
		} else {
			print("ÿc2Townÿc0 :: chores step 4/4 — repair skip");
		}

		// After NPC/cube repair: drop still-broken eth (CubeRepair path left them equipped) and swap
		Item.autoEquip();

		this.gamble();
		me.cancel();

		this.reviveMerc();
		Item.autoEquipMerc(true);
		// No second clearInventory / clearScrolls — vendor pass already sold
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

		// Only if inv mana sits outside top-right — silent no-op when already parked
		if (this.needsManaOrganize()) {
			print("ÿc2Townÿc0 :: mana organizer — park inv mana top-right");
			this.organizeManaIfNeeded();
		}

		this.lastFullChores = getTickCount();
		this._act2FaraMercShop = false;

		return true;
	},

	// Live PD2 charm itemTypes: 82 SC / 83 LC (cm2) / 84 GC (cm3). Prefer code cm1–cm3.
	charmKeepList: null,
	charmSellGids: null, // overflow after CharmCaps trim — not parked, sold

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

		return item.itemType >= 82 && item.itemType <= 85;
	},

	// Keep rules from leveling_charms.nip ONLY — ignore kolton charm lines (too loose for sell).
	// Only lines with "#" (identified keep rules). Unid pick lines are never keep criteria.
	loadCharmKeepList: function () {
		var i, nipfile, lines, line, info, filepath, raw;

		// Parse leveling_charms.nip once per game (it does not change mid-game)
		if (this.charmKeepList && this._charmKeepGame === me.gamestarttime) {
			return this.charmKeepList;
		}

		this._charmKeepGame = me.gamestarttime;
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
	// PD2: prefer item codes; classids from NTItemAlias (isc=547, ibk=536 after MPQ regen)
	findIdTome: function () {
		var tome, cid;

		tome = me.findItem("ibk", 0, 3);

		if (!tome && typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.ibk) {
			tome = me.findItem(NTIPAliasClassID.ibk, 0, 3);
		}

		if (!tome) {
			tome = me.findItem(536, 0, 3);
		}

		if (tome && tome.getStat(70) > 0) {
			return tome;
		}

		return false;
	},

	findIdScroll: function () {
		var scroll;

		scroll = me.findItem("isc", 0, 3);

		if (!scroll && typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.isc) {
			scroll = me.findItem(NTIPAliasClassID.isc, 0, 3);
		}

		if (!scroll) {
			scroll = me.findItem(547, 0, 3);
		}

		return scroll || false;
	},

	identifyAllCharms: function (allowShopBuy) {
		var item, tome, scroll, npc, gids = [], i, gid, unit, n = 0;

		if (allowShopBuy === undefined) {
			allowShopBuy = true;
		}

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

		// Cain already handled in doChores step 1 — calling again cancels any open shop

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			unit = me.getItem(-1, -1, gid);

			if (!unit || unit.location !== 3 || unit.getFlag(0x10)) {
				continue;
			}

			// 1) ID tome in inventory
			tome = this.findIdTome();

			if (tome) {
				this.identifyItem(unit, tome);
				n += 1;
				delay(me.ping + 50);
				continue;
			}

			// 2) Loose ID scroll already in bags (early game — before Cain / gold)
			scroll = this.findIdScroll();

			if (scroll) {
				this.identifyItem(unit, scroll);
				n += 1;
				delay(me.ping + 50);
				continue;
			}

			// 3) Buy scroll only when allowed (doChores vendor pass / standalone)
			if (!allowShopBuy) {
				continue;
			}

			if (!npc) {
				npc = this.initNPC("Shop", "idCharms");
			}

			if (!npc) {
				break;
			}

			scroll = this.getShopItem(npc, "isc",
				(typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.isc) ? [NTIPAliasClassID.isc] : [547]);

			if (scroll && me.getStat(14) + me.getStat(15) >= (scroll.getItemCost(0) || 100)) {
				try {
					scroll.buy();
				} catch (eBuy) {
					break;
				}

				scroll = this.findIdScroll();

				if (scroll) {
					this.identifyItem(unit, scroll);
					n += 1;
					delay(me.ping + 50);
				}
			} else {
				print("ÿc8Townÿc0 :: unid charm — no ID scroll/tome and can't buy yet");
				break;
			}
		}

		if (n) {
			print("ÿc2Townÿc0 :: identified " + n + " charm(s)");
		}

		return true;
	},

	// ID unid jewels in inventory (after unstashUnidJewels / Cain). Good → stash later; junk → jewf.
	identifyAllJewels: function (allowShopBuy) {
		var item, tome, scroll, npc, gids = [], i, gid, unit, n = 0;

		if (allowShopBuy === undefined) {
			allowShopBuy = true;
		}

		if (typeof Pickit === "undefined" || typeof Pickit.isJewel !== "function") {
			return true;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && Pickit.isJewel(item) && !item.getFlag(0x10)) {
					gids.push(item.gid);
				}
			} while (item.getNext());
		}

		if (!gids.length) {
			return true;
		}

		print("ÿc2Townÿc0 :: ID " + gids.length + " unid jewel(s) (keep good / fragment junk)");

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			unit = me.getItem(-1, -1, gid);

			if (!unit || unit.location !== 3 || unit.getFlag(0x10)) {
				continue;
			}

			tome = this.findIdTome();

			if (tome) {
				this.identifyItem(unit, tome);
				n += 1;
				delay(me.ping + 50);
				continue;
			}

			scroll = this.findIdScroll();

			if (scroll) {
				this.identifyItem(unit, scroll);
				n += 1;
				delay(me.ping + 50);
				continue;
			}

			if (!allowShopBuy) {
				continue;
			}

			if (!npc) {
				npc = this.initNPC("Shop", "idJewels");
			}

			if (!npc) {
				break;
			}

			scroll = this.getShopItem(npc, "isc",
				(typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.isc) ? [NTIPAliasClassID.isc] : [547]);

			if (scroll && me.getStat(14) + me.getStat(15) >= (scroll.getItemCost(0) || 100)) {
				try {
					scroll.buy();
				} catch (eBuy) {
					break;
				}

				scroll = this.findIdScroll();

				if (scroll) {
					this.identifyItem(unit, scroll);
					n += 1;
					delay(me.ping + 50);
				}
			} else {
				print("ÿc8Townÿc0 :: unid jewel — no ID scroll/tome and can't buy yet");
				break;
			}
		}

		if (n) {
			print("ÿc2Townÿc0 :: identified " + n + " jewel(s)");
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

		if (this.charmSellGids && this.charmSellGids[item.gid]) {
			return false;
		}

		return this.shouldParkCharm(item);
	},

	// Only move/lock into PD2 active rows if identified AND good enough for leveling
	shouldParkCharm: function (item) {
		if (!this.isCharmItem(item) || !item.getFlag(0x10)) {
			return false;
		}

		if (this.charmSellGids && this.charmSellGids[item.gid]) {
			return false;
		}

		return this.matchesLevelingCharmKeep(item);
	},

	// SoloPlay CharmEquip qty idea → PD2: cap buckets after leveling_charms.nip keep filter
	preferredCharmSkillTab: function () {
		var build = Config.AutoGearBuild;

		if (!build || typeof build !== "string") {
			return -1;
		}

		build = build.toLowerCase();

		// NTIPAliasStat skill tabs (stat 188)
		if (build === "fire") {
			return 8;
		}

		if (build === "light" || build === "lightning") {
			return 9;
		}

		if (build === "cold") {
			return 10;
		}

		if (build === "poisonstrike" || build === "poison") {
			return 17; // poisonandboneskilltab
		}

		return -1;
	},

	charmBucketScore: function (item) {
		var life, mana, res, mf, skills, i, tab, pref;

		if (!item) {
			return 0;
		}

		life = item.getStat(7) || 0;
		mana = item.getStat(9) || 0;
		res = (item.getStat(39) || 0) + (item.getStat(41) || 0) + (item.getStat(43) || 0) + (item.getStat(45) || 0);
		mf = item.getStat(80) || 0;
		skills = 0;
		pref = this.preferredCharmSkillTab();

		// Class skills + all skill tabs we care about
		skills += item.getStat(83, 1) || 0; // sorc
		skills += item.getStat(83, 2) || 0; // necro

		for (i = 0; i < 50; i += 1) {
			tab = item.getStat(188, i) || 0;

			if (tab > 0) {
				skills += tab * (i === pref ? 3 : 1);
			}
		}

		return life + mana + res * 2 + mf + skills * 100;
	},

	charmBucketKey: function (item) {
		var size, life, res, mf, pref, hasPref, hasOther, i, t;

		if (!item) {
			return "misc";
		}

		// Unique/set — never trim
		if (item.quality === 5 || item.quality === 7) {
			return "unique";
		}

		// Live PD2: 82 SC, 83 LC, 84 GC (also classid 621-623 / code cm1-3)
		if (item.itemType === 82 || item.classid === 621 || (item.code && String(item.code).toLowerCase() === "cm1")) {
			size = "S";
		} else if (item.itemType === 83 || item.classid === 622 || (item.code && String(item.code).toLowerCase() === "cm2")) {
			size = "L";
		} else {
			size = "G";
		}

		life = item.getStat(7) || 0;
		res = (item.getStat(39) || 0) + (item.getStat(41) || 0) + (item.getStat(43) || 0) + (item.getStat(45) || 0);
		mf = item.getStat(80) || 0;
		pref = this.preferredCharmSkillTab();
		hasPref = false;
		hasOther = false;

		if (size === "G") {
			for (i = 0; i < 50; i += 1) {
				t = item.getStat(188, i) || 0;

				if (t > 0) {
					if (pref >= 0 && i === pref) {
						hasPref = true;
					} else {
						hasOther = true;
					}
				}
			}

			if (hasPref) {
				return "G_pref";
			}

			if (hasOther) {
				return "G_other";
			}
		}

		if (life >= 10) {
			return size + "_life";
		}

		if (res >= 7) {
			return size + "_res";
		}

		if (size === "S" && mf >= 5) {
			return "S_mf";
		}

		return size + "_misc";
	},

	trimCharmInventory: function (junk) {
		var caps, item, buckets, key, list, limit, map, i, entry, overflow;

		this.charmSellGids = {};

		if (!Config.AutoGear || !Config.AutoGear.CharmCaps || !Config.AutoGear.CharmCaps.Enabled) {
			return 0;
		}

		caps = Config.AutoGear.CharmCaps;
		map = {
			S_life: caps.SmallLife,
			S_res: caps.SmallRes,
			S_mf: caps.SmallMf,
			S_misc: caps.SmallMisc,
			L_life: caps.LargeLife,
			L_res: caps.LargeRes,
			L_misc: caps.LargeMisc,
			G_pref: caps.GrandPreferredSkiller,
			G_other: caps.GrandOtherSkiller,
			G_life: caps.GrandLife,
			G_res: caps.GrandRes,
			G_misc: caps.GrandMisc
		};
		buckets = {};
		overflow = 0;

		if (!junk) {
			junk = [];
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location !== 3 || !this.isCharmItem(item) || !item.getFlag(0x10)) {
					continue;
				}

				if (!this.matchesLevelingCharmKeep(item)) {
					continue;
				}

				key = this.charmBucketKey(item);

				if (key === "unique") {
					continue;
				}

				if (!buckets[key]) {
					buckets[key] = [];
				}

				buckets[key].push({
					gid: item.gid,
					score: this.charmBucketScore(item)
				});
			} while (item.getNext());
		}

		for (key in buckets) {
			if (!buckets.hasOwnProperty(key)) {
				continue;
			}

			list = buckets[key];
			limit = map.hasOwnProperty(key) ? map[key] : 2;

			if (limit === undefined || limit === null) {
				limit = 2;
			}

			list.sort(function (a, b) {
				return b.score - a.score;
			});

			for (i = limit; i < list.length; i += 1) {
				entry = list[i];
				this.charmSellGids[entry.gid] = true;
				overflow += 1;
				item = me.getItem(-1, -1, entry.gid);

				if (item && item.location === 3) {
					junk.push(copyUnit(item));
				}
			}
		}

		if (overflow) {
			print("ÿc2Townÿc0 :: CharmCaps trimmed " + overflow + " overflow charm(s)");
		}

		return overflow;
	},

	// Lock only cells occupied by parked (good) charms. Junk/unid stay unlocked → sellable after ID.
	// Also lock parked mana buffer cells so Compare never treats them as sell candidates.
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
				if (item.location !== 3) {
					continue;
				}

				// Parked charms OR parked mana buffer pots
				if (!this.shouldParkCharm(item) && !this.isManaParked(item)) {
					continue;
				}

				for (h = 0; h < item.sizey; h += 1) {
					for (w = 0; w < item.sizex; w += 1) {
						y = item.y + h;
						x = item.x + w;

						if (y >= 0 && y < 8 && x >= 0 && x < 10) {
							Config.Inventory[y][x] = 0;
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

		// Exact codes only — never prefix-match (Military Pick "mpi" was drunk as mana)
		if (/^hp[1-5]$/.test(code)) {
			return "hp";
		}

		if (/^mp[1-5]$/.test(code)) {
			return "mp";
		}

		if (code === "rvs" || code === "rvl") {
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

		// 2) Name (when code missing / garbage) — skip weapon names
		if (code && (code === "mpi" || code === "9mp" || code === "7mp")) {
			return false;
		}

		if (name.indexOf("military pick") > -1 || name.indexOf("crowbill") > -1 ||
				name.indexOf("war spike") > -1) {
			return false;
		}

		if (name.indexOf("mana potion") > -1 || (name.indexOf("mana") > -1 && name.indexOf("potion") > -1)) {
			return "mp";
		}

		if (name.indexOf("healing potion") > -1 || name.indexOf("healing") > -1 || name.indexOf("health potion") > -1) {
			return "hp";
		}

		if (name.indexOf("rejuvenation") > -1 || (name.indexOf("rejuv") > -1 && name.indexOf("potion") > -1)) {
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

	// One walk: belt empty slots + inv pot counts (buyPotions / need checks)
	potionSnapshot: function () {
		var beltSize, col, inv = {hp: 0, mp: 0, rv: 0, vps: 0}, item, kind;

		beltSize = Storage.BeltSize();
		col = this.checkColumns(beltSize);
		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location !== 3) {
					continue;
				}

				kind = this.potionKind(item);

				if (kind && inv[kind] !== undefined) {
					inv[kind] += 1;
				}
			} while (item.getNext());
		}

		return {beltSize: beltSize, col: col, inv: inv};
	},

	// Empty belt slots configured for this pot type (hp/mp/rv)
	// Optional snap from potionSnapshot() avoids re-walking belt
	beltEmptyFor: function (type, snap) {
		var i, beltSize, col, need = 0;

		if (type !== "hp" && type !== "mp" && type !== "rv") {
			return 0;
		}

		if (snap) {
			beltSize = snap.beltSize;
			col = snap.col;
		} else {
			beltSize = Storage.BeltSize();
			col = this.checkColumns(beltSize);
		}

		for (i = 0; i < 4; i += 1) {
			if (Config.BeltColumn[i] === type && col[i] > 0) {
				need += col[i];
			}
		}

		return need;
	},

	// Keep inv ≤ buffer + empty belt slots of that type (shop buys often land in inv first).
	// HPBuffer=0 must NOT sell HP still needed to fill the belt.
	// Drink excess inv pots above buffer — never sell potions (frees space without a vendor).
	// Does not cancel/reopen shop (safe mid-chores vendor pass).
	cullExcessPotions: function () {
		var kind, kinds = ["hp", "mp", "rv", "vps"], list = {hp: [], mp: [], rv: [], vps: []},
			item, i, k, buf, keep, excess, drunk = 0, needCull = false;

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

		for (k = 0; k < kinds.length; k += 1) {
			kind = kinds[k];
			buf = kind === "hp" ? (Config.HPBuffer || 0) :
				kind === "mp" ? (Config.MPBuffer || 0) :
				kind === "rv" ? (Config.RejuvBuffer >= 0 ? Config.RejuvBuffer : 0) :
				((Config.StaminaUntilLevel && me.charlvl < Config.StaminaUntilLevel) ? (Config.StaminaBuffer || 0) : 0);
			keep = buf + ((kind === "hp" || kind === "mp" || kind === "rv") ? this.beltEmptyFor(kind) : 0);

			if (list[kind].length > keep) {
				needCull = true;
				break;
			}
		}

		if (!needCull) {
			return 0;
		}

		for (k = 0; k < kinds.length; k += 1) {
			kind = kinds[k];
			buf = kind === "hp" ? (Config.HPBuffer || 0) :
				kind === "mp" ? (Config.MPBuffer || 0) :
				kind === "rv" ? (Config.RejuvBuffer >= 0 ? Config.RejuvBuffer : 0) :
				((Config.StaminaUntilLevel && me.charlvl < Config.StaminaUntilLevel) ? (Config.StaminaBuffer || 0) : 0);
			keep = buf + ((kind === "hp" || kind === "mp" || kind === "rv") ? this.beltEmptyFor(kind) : 0);

			excess = list[kind].length - keep;

			if (excess <= 0) {
				continue;
			}

			for (i = 0; i < excess; i += 1) {
				item = me.getItem(-1, -1, list[kind][i].gid);

				if (!item || item.location !== 3) {
					continue;
				}

				try {
					item.interact();
					drunk += 1;
					delay(150 + me.ping);
				} catch (eDrink) {}
			}
		}

		if (drunk) {
			print("ÿc2Townÿc0 :: drank " + drunk + " excess potion(s)");
		}

		return drunk;
	},

	// Mana buffer: FIXED top-right 2×4 (cols 6–9, rows 0–1).
	// Never key-shift the zone (that parked mana mid/left). Key just occupies a cell.
	getInvKey: function () {
		// PD2: key=560. Never use 543 — that is aqv (arrows) on PD2.
		var item = me.getItem("key", 0) || me.getItem(560, 0);

		if (item && item.location === 3 && item.mode !== 2) {
			return item;
		}

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
		return {
			minCol: 6,
			maxCol: 9,
			minRow: 0,
			maxRow: 1,
			key: this.getInvKey() || false
		};
	},

	// True if (a,b) lies in the fixed mana park (cols 6–9, rows 0–1).
	// Accepts normal item.x=col/item.y=row OR swapped reads (avoids endless reshuffle).
	inManaParkCoords: function (a, b) {
		if (a >= 6 && a <= 9 && b >= 0 && b <= 1) {
			return true;
		}

		if (b >= 6 && b <= 9 && a >= 0 && a <= 1) {
			return true;
		}

		return false;
	},

	isManaParked: function (item) {
		if (!item || item.location !== 3 || item.mode === 2) {
			return false;
		}

		if (this.potionKind(item) !== "mp") {
			return false;
		}

		return this.inManaParkCoords(item.x, item.y);
	},

	// clickItem(btn, first, second, inv=3). Normal: first=col item.x, second=row item.y.
	clickManaParkCell: function (col, row) {
		if (this._manaCoordSwap) {
			clickItem(0, row, col, 3);
		} else {
			clickItem(0, col, row, 3);
		}
	},

	// After a park click, learn if this client reports x/y swapped vs click args.
	learnManaParkAxes: function (item, intendedCol, intendedRow) {
		if (!item || item.location !== 3) {
			return;
		}

		if (item.x === intendedCol && item.y === intendedRow) {
			this._manaCoordSwap = false;
			return;
		}

		if (item.x === intendedRow && item.y === intendedCol) {
			this._manaCoordSwap = true;
		}
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

		return item.y >= 0 && (item.y + (item.sizey || 1)) <= 4;
	},

	// Mana: right→left within fixed zone. Returns {col, row} (inventory axes).
	findManaSpot: function (item) {
		var row, col, r, c, ok, z, sx, sy,
			inv = Storage.Inventory;

		if (!item) {
			return false;
		}

		sx = item.sizex || 1;
		sy = item.sizey || 1;
		z = this.getManaParkZone();
		Storage.Reload();

		for (row = z.minRow; row <= z.maxRow - (sy - 1); row += 1) {
			for (col = z.maxCol - (sx - 1); col >= z.minCol; col -= 1) {
				ok = true;

				for (r = 0; r < sy && ok; r += 1) {
					for (c = 0; c < sx; c += 1) {
						if (!inv.buffer[row + r] || inv.buffer[row + r][col + c] > 0) {
							ok = false;
							break;
						}
					}
				}

				if (ok) {
					return {col: col, row: row};
				}
			}
		}

		return false;
	},

	// Click cursor into mana park. Never Storage.MoveTo (left dump).
	clickManaParkFromCursor: function () {
		var cursor, spot, after, gid;

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor || this.potionKind(cursor) !== "mp") {
			return false;
		}

		gid = cursor.gid;
		spot = this.findManaSpot(cursor);

		if (!spot) {
			return false;
		}

		this.clickManaParkCell(spot.col, spot.row);
		delay(me.ping + 150);

		if (me.itemoncursor) {
			return false;
		}

		after = me.getItem(-1, -1, gid);

		if (after) {
			this.learnManaParkAxes(after, spot.col, spot.row);
		}

		return !!(after && this.isManaParked(after));
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
			// Return {x:row,y:col} shape for any legacy caller; prefer findManaSpot+clickManaParkCell
			spot = this.findManaSpot(item);

			return spot ? {x: spot.row, y: spot.col, col: spot.col, row: spot.row} : false;
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

	// Clear blockers from a mana-park cell (never move mana pots or the key)
	clearManaParkCell: function (row, col) {
		var item, gid, spot, z, code, kind, origCol, origRow;

		z = this.getManaParkZone();
		item = me.getItem(-1, -1);

		if (!item) {
			return true;
		}

		do {
			if (item.location !== 3) {
				continue;
			}

			kind = this.potionKind(item);

			// Never shove mana (parked or not) or the key
			if (kind === "mp") {
				continue;
			}

			code = item.code ? String(item.code).toLowerCase() : "";

			if (code === "key") {
				continue;
			}

			if (item.y <= row && item.y + item.sizey > row &&
					item.x <= col && item.x + item.sizex > col) {
				gid = item.gid;
				origCol = item.x;
				origRow = item.y;
				// Blockers → left of park only (cols 0–5), not into charm rows if possible
				spot = this.findInvSpotInCols(item, 0, 3, 0, z.minCol - 1);

				if (!spot) {
					spot = this.findInvSpotInRows(item, 2, 3);
				}

				if (!spot) {
					return false;
				}

				if (!item.toCursor()) {
					return false;
				}

				clickItem(0, spot.y, spot.x, 3);
				delay(me.ping + 200);

				if (me.itemoncursor && getUnit(100) && getUnit(100).gid === gid) {
					// Put blocker back — never MoveTo / cancel-drop
					clickItem(0, origCol, origRow, 3);
					delay(me.ping + 150);
					return false;
				}

				return !me.itemoncursor || !getUnit(100) || getUnit(100).gid !== gid;
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
	// Mana: park zone or belt/drink ONLY — never Storage.MoveTo (left dump).
	returnCursorSafe: function () {
		var cursor, kind, i, col, beltSize, spot;

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor) {
			return !me.itemoncursor;
		}

		kind = this.potionKind(cursor);

		if (kind === "mp") {
			if (this.clickManaParkFromCursor()) {
				return true;
			}

			beltSize = Storage.BeltSize();
			col = this.checkColumns(beltSize);

			for (i = 0; i < 4; i += 1) {
				if (Config.BeltColumn[i] !== "mp" || col[i] <= 0) {
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

			cursor = getUnit(100);

			if (cursor && me.itemoncursor) {
				print("ÿc8Townÿc0 :: cursor mp — drink instead of left-dump/drop");

				try {
					cursor.interact();
				} catch (eDrinkMp) {}

				delay(120 + me.ping);
			}

			if (me.itemoncursor) {
				print("ÿc1Townÿc0 :: cursor mp stuck — will not MoveTo/drop");
			}

			return !me.itemoncursor;
		}

		if (kind) {
			spot = this.findPotionSpot(cursor);

			if (spot) {
				clickItem(0, spot.y, spot.x, 3);
				delay(me.ping + 150);

				if (!me.itemoncursor) {
					return true;
				}
			}

			if (kind === "hp" || kind === "rv") {
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

			cursor = getUnit(100);

			if (cursor && me.itemoncursor) {
				print("ÿc8Townÿc0 :: cursor " + kind + " — drink instead of drop");

				try {
					cursor.interact();
				} catch (eDrink) {}

				delay(120 + me.ping);
			}

			if (me.itemoncursor) {
				print("ÿc1Townÿc0 :: cursor " + kind + " stuck — will not drop");
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

			if (cursor && !this.potionKind(cursor)) {
				try {
					cursor.drop();
				} catch (eDrop) {}
			}
		}

		return !me.itemoncursor;
	},

	// Place a potion onto inventory without Storage.MoveTo (FindSpot = vertical left dump).
	// Mana: fixed top-right only. Inv mana left alone until organizeManaIfNeeded (once).
	placeInvPotion: function (item) {
		var kind, spot, gid, origCol, origRow;

		if (!item) {
			return false;
		}

		kind = this.potionKind(item);
		gid = item.gid;

		if (kind === "mp" && Config.ManaPark !== false) {
			// Already parked — do nothing
			if (item.location === 3 && !me.itemoncursor && this.isManaParked(item)) {
				return true;
			}

			// Still in inv (not on cursor) — defer to single organizeManaIfNeeded pass
			if (item.location === 3 && !me.itemoncursor) {
				return true;
			}

			// On cursor (belt/stash pull) — park zone only, no blocker thrash / MoveTo
			Storage.Reload();
			spot = this.findManaSpot(getUnit(100) || item);

			if (spot) {
				gid = (getUnit(100) && getUnit(100).gid) || gid;
				this.clickManaParkCell(spot.col, spot.row);
				delay(me.ping + 150);

				if (!me.itemoncursor) {
					item = me.getItem(-1, -1, gid);

					if (item) {
						this.learnManaParkAxes(item, spot.col, spot.row);
					}

					return !!(item && this.isManaParked(item));
				}
			}

			// Belt / drink — never left-dump
			return this.returnCursorSafe();
		}

		Storage.Reload();
		spot = this.findPotionSpot(item);

		if (!spot) {
			spot = this.findInvSpotInCols(item, 0, 3, 0, 9);
		}

		if (!spot) {
			print("ÿc8Townÿc0 :: placeInvPotion — no spot for " + kind);

			if (me.itemoncursor) {
				this.returnCursorSafe();
			}

			return false;
		}

		if (!me.itemoncursor) {
			item = me.getItem(-1, -1, gid);

			if (!item || item.location !== 3) {
				return false;
			}

			origCol = item.x;
			origRow = item.y;

			if (!item.toCursor()) {
				return false;
			}
		}

		clickItem(0, spot.y, spot.x, 3);
		delay(me.ping + 150);

		if (me.itemoncursor) {
			if (origCol !== undefined) {
				clickItem(0, origCol, origRow, 3);
				delay(me.ping + 150);
			}

			if (me.itemoncursor) {
				this.returnCursorSafe();
			}

			return !me.itemoncursor;
		}

		return true;
	},

	organizePotions: function () {
		return this.organizeManaIfNeeded();
	},

	needsManaOrganize: function () {
		var item = me.getItem(-1, -1);

		if (Config.ManaPark === false) {
			return false;
		}

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

	// Park inv mana in FIXED top-right 2×4. No-op unless ManaPark on + unparked mana exists.
	organizeManaIfNeeded: function () {
		var pots = [], item, i, spot, gid, tries, r, c, moved, z, origX, origY, after;

		if (Config.ManaPark === false) {
			return true;
		}

		if (this._manaOrgRunning) {
			return true;
		}

		if (!me.inTown || this.isShopOpen() || getUIFlag(0x1A) || getUIFlag(0x19)) {
			return false;
		}

		if (!this.needsManaOrganize()) {
			return true;
		}

		this._manaOrgRunning = true;
		z = this.getManaParkZone();

		me.cancel();
		delay(80 + me.ping);
		Storage.Reload();

		if (!this.needsManaOrganize()) {
			this._manaOrgRunning = false;

			return true;
		}

		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location === 3 && item.mode !== 2 &&
						this.potionKind(item) === "mp" && !this.isManaParked(item)) {
					pots.push({
						gid: item.gid,
						x: item.x,
						y: item.y
					});
				}
			} while (item.getNext());
		}

		if (!pots.length) {
			this._manaOrgRunning = false;

			return true;
		}

		for (i = 0; i < pots.length; i += 1) {
			item = me.getItem(-1, -1, pots[i].gid);

			if (!item || item.location !== 3 || this.isManaParked(item)) {
				continue;
			}

			gid = item.gid;
			origX = item.x;
			origY = item.y;
			spot = this.findManaSpot(item);

			for (tries = 0; !spot && tries < 2; tries += 1) {
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

			// Already in park under either axis — never pick up to "reshuffle"
			if (this.isManaParked(item)) {
				continue;
			}

			if (!item.toCursor()) {
				continue;
			}

			this.clickManaParkCell(spot.col, spot.row);
			delay(me.ping + 200);

			if (me.itemoncursor) {
				clickItem(0, origX, origY, 3);
				delay(me.ping + 150);

				if (me.itemoncursor) {
					this.returnCursorSafe();
				}
			} else {
				after = me.getItem(-1, -1, gid);

				if (after) {
					this.learnManaParkAxes(after, spot.col, spot.row);
				}
			}
		}

		if (me.itemoncursor) {
			this.returnCursorSafe();
		}

		me.cancel();
		Storage.Reload();
		this.applyCharmInventoryLock();
		this._manaOrgRunning = false;

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

			// Fragmented charm zone: shuffle parked charms within bottom 4 to free a contiguous spot
			if (item && !spot && Config.ReorganizeInventory !== false) {
				print("ÿc2Townÿc0 :: Reorganizing charm zone for " + (charms[i].name || "charm"));

				if (Storage.Inventory.MakeRoom(item, 8, {minRow: 4, maxRow: 7})) {
					spot = this.findCharmSpot(item);
				}

				item = me.getItem(-1, -1, gid);
			}

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
		var spent = false, lightBuild;

		try {
			// Act 3+ NM light sorc: never spend the pre-respec Charged Bolt Build
			// (chores often run before AutoSmurf.akaraLightningRespec)
			if (Config.AutoSkill && Config.AutoSkill.NmAct3LightningRespec && me.diff === 1 &&
					(me.act >= 3 || (Pather.accessToAct && Pather.accessToAct(3)))) {
				lightBuild = Config.AutoSkill.LightningFirstBuild;

				if (lightBuild && lightBuild.length) {
					Config.AutoSkill.Build = lightBuild;
					Config.AutoSkill.DumpSkill = 49;
				}

				if (Config.AutoStat && Config.AutoStat.LightningFirstBuild && Config.AutoStat.LightningFirstBuild.length) {
					Config.AutoStat.Build = Config.AutoStat.LightningFirstBuild;
				}
			}

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
				// Act5 Cain: seat differs LoD vs PD2 — path to the unit when we already see him
				if (npc && getDistance(me, npc) > 5 && typeof Pather !== "undefined" &&
						typeof Pather.moveToUnit === "function") {
					Pather.moveToUnit(npc);
				} else {
					this.move(this.tasks[me.act - 1][task]);
				}

				npc = getUnit(1, this.tasks[me.act - 1][task]);

				// Still far (wrong hardcoded seat) — walk to live unit
				if (npc && getDistance(me, npc) > 5 && typeof Pather !== "undefined" &&
						typeof Pather.moveToUnit === "function") {
					Pather.moveToUnit(npc);
					npc = getUnit(1, this.tasks[me.act - 1][task]);
				}
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
	// In town: NEVER pull mana out of the top-right park (that forced re-organize every chores).
	refillBeltFromInventory: function () {
		var i, items = [], item, beltSize, col, moved = 0, potType, gid, before, after,
			preserveManaPark = !!me.inTown && Config.ManaPark !== false;

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

			if (potType !== "hp" && potType !== "mp" && potType !== "rv") {
				continue;
			}

			// Keep parked mana buffer intact while shopping — vendor fills the belt
			if (preserveManaPark && potType === "mp" && this.isManaParked(item)) {
				continue;
			}

			items.push(copyUnit(item));
		} while (item.getNext());

		if (!items.length) {
			return false;
		}

		// HP first; among mana prefer unparked (already filtered in town)
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

			if (preserveManaPark && potType === "mp" && this.isManaParked(item)) {
				continue;
			}

			for (i = 0; i < 4; i += 1) {
				if (col[i] <= 0 || Config.BeltColumn[i] !== potType) {
					continue;
				}

				gid = item.gid;
				before = col[i];

				if (!item.toCursor()) {
					break;
				}

				clickItem(0, i, 0, 2);
				delay(me.ping + 150);

				if (me.itemoncursor) {
					if (typeof this.returnCursorSafe === "function") {
						this.returnCursorSafe();
					}

					delay(50 + me.ping);
					break;
				}

				after = this.checkColumns(beltSize);
				item = me.getItem(-1, -1, gid);

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

	buyPotions: function (shopAlreadyOpen) {
		// Inventory gold only — never pull from stash for pots
		if (me.gold < (me.charlvl < 12 ? 50 : 500)) {
			return false;
		}

		var i, j, npc, col, beltSize, pot, stamBuffer, snap,
			needPots = false,
			needBuffer = false,
			needStamina = false,
			buffer = {hp: 0, mp: 0, vps: 0},
			beforeEmpty, wantHp, wantMp, hpBuf, mpBuf;

		// Belt cursor moves need shop closed — doChores preps belt before opening trade
		if (!shopAlreadyOpen) {
			if (this.isShopOpen() || getUIFlag(0x08)) {
				me.cancel();
				delay(120 + me.ping);
			}

			this.clearBeltStamina();
			this.refillBeltIfNeeded();
		}

		stamBuffer = (Config.StaminaUntilLevel && me.charlvl < Config.StaminaUntilLevel) ? (Config.StaminaBuffer || 0) : 0;
		hpBuf = Config.HPBuffer || 0;
		mpBuf = Config.MPBuffer || 0;

		snap = this.potionSnapshot();
		beltSize = snap.beltSize;
		col = snap.col;
		buffer.hp = snap.inv.hp;
		buffer.mp = snap.inv.mp;
		buffer.vps = snap.inv.vps;

		wantHp = this.potionNeedCount("hp", snap);
		wantMp = this.potionNeedCount("mp", snap);

		if (wantHp <= 0 && wantMp <= 0 && buffer.vps >= stamBuffer) {
			this.cullExcessPotions();

			return true;
		}

		for (i = 0; i < 4; i += 1) {
			if (["hp", "mp"].indexOf(Config.BeltColumn[i]) > -1 && col[i] > 0) {
				needPots = true;
			}
		}

		needBuffer = (buffer.hp < hpBuf) || (buffer.mp < mpBuf);
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

		if (shopAlreadyOpen && this.isShopOpen()) {
			npc = getInteractedNPC();
		}

		if (!npc) {
			npc = this.initNPC("Shop", "buyPotions");
		}

		if (!npc) {
			return false;
		}

		// Belt fill — shift-buy only when every empty slot is for this type.
		// Full empty belt (hp+mp columns): shift HP would flood mana columns too.
		snap = this.potionSnapshot();
		beltSize = snap.beltSize;
		col = snap.col;
		buffer.hp = snap.inv.hp;
		buffer.mp = snap.inv.mp;

		for (i = 0; i < 2; i += 1) {
			wantHp = (i === 0) ? "hp" : "mp";
			beforeEmpty = this.beltEmptyFor(wantHp, snap);

			if (beforeEmpty <= 0) {
				continue;
			}

			// Skip partial top-up when inv buffer already covers drinking
			if (wantHp === "mp" && mpBuf > 0 && buffer.mp >= mpBuf) {
				needPots = false;

				for (j = 0; j < 4; j += 1) {
					if (Config.BeltColumn[j] === "mp" && col[j] >= beltSize) {
						needPots = true; // fully empty column — still buy
						break;
					}
				}

				if (!needPots) {
					continue;
				}
			}

			if (wantHp === "hp" && hpBuf > 0 && buffer.hp >= hpBuf) {
				needPots = false;

				for (j = 0; j < 4; j += 1) {
					if (Config.BeltColumn[j] === "hp" && col[j] >= beltSize) {
						needPots = true;
						break;
					}
				}

				if (!needPots) {
					continue;
				}
			}

			pot = this.getPotion(npc, wantHp);

			if (!pot) {
				continue;
			}

			if (this.canShiftBuyPots(wantHp, col, beltSize)) {
				try {
					// Shift fills every empty belt slot — safe only for a single pot type
					pot.buy(true);
				} catch (eBuy) {
					print("ÿc1Townÿc0 :: pot.buy(shift) failed: " + eBuy);

					try {
						pot.buy(false);
					} catch (eBuy2) {
						print("ÿc1Townÿc0 :: pot.buy failed: " + eBuy2);
						continue;
					}
				}

				delay(80 + me.ping);
			} else {
				// Mixed empty columns — buy singles into inv; refillBelt after shop closes
				print("ÿc2Townÿc0 :: pot buy " + wantHp + " x" + beforeEmpty + " (no shift — mixed empty belt)");

				for (j = 0; j < beforeEmpty; j += 1) {
					pot = this.getPotion(npc, wantHp);

					if (!pot || !Storage.Inventory.CanFit(pot)) {
						break;
					}

					try {
						pot.buy(false);
					} catch (eBuy3) {
						print("ÿc1Townÿc0 :: pot.buy failed: " + eBuy3);
						break;
					}

					delay(40 + me.ping);
				}
			}

			// Refresh once per type after buys (not after every single pot)
			snap = this.potionSnapshot();
			beltSize = snap.beltSize;
			col = snap.col;
			buffer.hp = snap.inv.hp;
			buffer.mp = snap.inv.mp;
		}

		// Inv buffer only — never more than Config.*Buffer
		snap = this.potionSnapshot();
		buffer.hp = snap.inv.hp;
		buffer.mp = snap.inv.mp;

		if (hpBuf > buffer.hp) {
			for (i = 0; i < hpBuf - buffer.hp; i += 1) {
				pot = this.getPotion(npc, "hp");

				if (!pot || !Storage.Inventory.CanFit(pot)) {
					break;
				}

				pot.buy(false);
				delay(30 + me.ping);
			}
		}

		snap = this.potionSnapshot();
		buffer.mp = snap.inv.mp;

		if (mpBuf > buffer.mp) {
			for (i = 0; i < mpBuf - buffer.mp; i += 1) {
				pot = this.getPotion(npc, "mp");

				if (!pot || !Storage.Inventory.CanFit(pot)) {
					break;
				}

				pot.buy(false);
				delay(30 + me.ping);
				buffer.mp = Misc.countPotions("mp", "inv");

				if (buffer.mp >= mpBuf) {
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

		this.cullExcessPotions();

		return true;
	},

	// True if every empty belt slot is configured for `type` (safe for pot.buy(true)).
	// Full empty hp+mp belt → false (shift would fill mana columns with healing pots).
	canShiftBuyPots: function (type, col, beltSize) {
		var i, empty = false;

		if (!type || !col || !beltSize) {
			return false;
		}

		for (i = 0; i < 4; i += 1) {
			if (col[i] <= 0) {
				continue;
			}

			empty = true;

			if (Config.BeltColumn[i] !== type) {
				return false;
			}
		}

		return empty;
	},

	// Check when to shift-buy potions (legacy — prefer canShiftBuyPots per type)
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
	// Optional snap from potionSnapshot()
	// With buffer 0: inv pots still count against belt capacity so we don't vacuum extras into inv
	// while the belt looks "empty" (picks land in inv before belt refill).
	potionNeedCount: function (type, snap) {
		var i, beltSize, col, need = 0, inv, buf, capacity = 0, beltEmpty = 0;

		if (type !== "hp" && type !== "mp") {
			return 0;
		}

		if (snap) {
			beltSize = snap.beltSize;
			col = snap.col;
			inv = snap.inv[type] || 0;
		} else {
			beltSize = Storage.BeltSize();
			col = this.checkColumns(beltSize);
			inv = (typeof Misc.countPotions === "function") ? Misc.countPotions(type, "inv") : 0;
		}

		for (i = 0; i < 4; i += 1) {
			if (Config.BeltColumn[i] === type) {
				capacity += beltSize;
				beltEmpty += col[i] > 0 ? col[i] : 0;
			}
		}

		buf = type === "hp" ? (Config.HPBuffer || 0) : (Config.MPBuffer || 0);

		// Target owned = belt capacity + inv buffer. Count belt + inv toward that.
		need = capacity + buf - (capacity - beltEmpty) - inv;

		if (need < 0) {
			need = 0;
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
					this.returnCursorSafe();
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
	// WARNING: cancels and reopens — NEVER call during doChores single vendor pass
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

	// PD2 findItem("tbk") can return a wrong unit — always verify .code (same as Pather.makePortal)
	findBook: function (tomeCode) {
		var tome, item, code, alts, i;

		code = String(tomeCode || "").toLowerCase();

		if (code !== "tbk" && code !== "ibk") {
			return false;
		}

		alts = code === "tbk" ? [535, 518] : [536, 519];
		tome = me.findItem(code, 0, 3);

		if (tome && String(tome.code || "").toLowerCase() !== code) {
			tome = false;
		}

		for (i = 0; !tome && i < alts.length; i += 1) {
			tome = me.findItem(alts[i], 0, 3);

			if (tome && String(tome.code || "").toLowerCase() !== code) {
				tome = false;
			}
		}

		if (tome) {
			return tome;
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				if (item.location === 3 && String(item.code || "").toLowerCase() === code) {
					return copyUnit(item);
				}
			} while (item.getNext());
		}

		return false;
	},

	countLooseScrolls: function (scrollCode) {
		var scroll, n = 0;

		scrollCode = scrollCode ? String(scrollCode).toLowerCase() : "";
		scroll = me.getItem(-1, 0);

		if (scroll) {
			do {
				if (scroll.location === 3 && String(scroll.code || "").toLowerCase() === scrollCode) {
					n += 1;
				}
			} while (scroll.getNext());
		}

		return n;
	},

	// Same thresholds fillTome() uses — true when the tome is missing or below its keep level
	tomeNeedsFill: function (tomeCode) {
		var keepMin, tome;

		if (tomeCode === "tbk") {
			keepMin = me.charlvl >= 30 ? 80 : 20;
		} else if (tomeCode === "ibk") {
			keepMin = 13;
		} else {
			return false;
		}

		tome = this.findBook(tomeCode);

		if (!tome) {
			return true;
		}

		return (tome.getStat(70) || 0) < keepMin;
	},

	fillTome: function (code, shopAlreadyOpen) {
		if (me.gold < 50) {
			return false;
		}

		// PD2 classids shifted — use item codes (tbk/ibk/tsc/isc); accept legacy LoD numeric ids too
		var scroll, tome, tomeCode, scrollCode, npc, cur, want, i, cost, before, looseBefore;

		if (code === 518 || code === 533 || code === "tbk") {
			tomeCode = "tbk";
			scrollCode = "tsc";
		} else if (code === 519 || code === 534 || code === "ibk") {
			tomeCode = "ibk";
			scrollCode = "isc";
		} else {
			return false;
		}

		// TP: early game 20 scrolls (save gold); lvl 30+ fill to PD2 tome cap 80
		// ID tome: always keep ~20
		if (tomeCode === "tbk") {
			want = me.charlvl >= 30 ? 80 : 20;
		} else {
			want = 20;
		}

		if (!this.tomeNeedsFill(tomeCode)) {
			return true;
		}

		// Reuse open chores trade — never cancel/reopen (ensureShop does that)
		if (shopAlreadyOpen && this.isShopOpen()) {
			npc = getInteractedNPC();
		}

		if (!npc) {
			npc = this.initNPC("Shop", "fillTome");
		}

		if (!npc) {
			return false;
		}

		delay(300);
		this.dismissShopError();

		if (shopAlreadyOpen) {
			if (!this.isShopOpen() && !npc.startTrade("Shop")) {
				print("ÿc1Townÿc0 :: shop not open for " + scrollCode + " (chores pass)");
				return false;
			}
		} else if (!this.ensureShop(npc)) {
			print("ÿc1Townÿc0 :: shop not open for " + scrollCode);
			return false;
		}

		tome = this.findBook(tomeCode);

		if (!tome) {
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

			tome = this.findBook(tomeCode);
		}

		// Never buy scrolls without a real tome — they dump into inventory as loose tsc/isc
		if (!tome) {
			print("ÿc8Townÿc0 :: no " + tomeCode + " in inventory — skip " + scrollCode + " buy");
			return false;
		}

		cur = tome.getStat(70) || 0;

		if (cur >= want) {
			return true;
		}

		scroll = this.getShopItem(npc, scrollCode, scrollCode === "tsc" ? [546, 529] : [547]);

		// Shop list sometimes empty — refresh. Chores pass: never ensureShop (cancel/reopen).
		if (!scroll) {
			if (shopAlreadyOpen) {
				if (!getUIFlag(0x0C)) {
					npc.startTrade("Shop");
				}
			} else if (!this.ensureShop(npc)) {
				scroll = null;
			}

			if (shopAlreadyOpen || this.isShopOpen()) {
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
				for (i = 0; i < 40; i += 1) {
					tome = this.findBook(tomeCode);
					cur = tome ? (tome.getStat(70) || 0) : 0;

					if (cur >= want) {
						break;
					}

					scroll = this.getShopItem(npc, scrollCode, [546, 529]);

					if (!scroll) {
						if (shopAlreadyOpen) {
							if (!getUIFlag(0x0C) && !npc.startTrade("Shop")) {
								break;
							}
						} else if (!this.ensureShop(npc)) {
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

					before = cur;
					looseBefore = this.countLooseScrolls(scrollCode);

					try {
						scroll.buy();
					} catch (eBuy) {
						print("ÿc8Townÿc0 :: scroll buy failed: " + eBuy);
						this.dismissShopError();
						break;
					}

					delay(Math.max(80, me.ping * 2));
					tome = this.findBook(tomeCode);
					cur = tome ? (tome.getStat(70) || 0) : 0;

					// Buy landed in inventory instead of tome — stop or we stack loose scrolls
					if (cur <= before) {
						if (this.countLooseScrolls(scrollCode) > looseBefore) {
							print("ÿc8Townÿc0 :: TP scroll went to inventory — stop buying");
						}

						break;
					}
				}

				tome = this.findBook(tomeCode);
				print("ÿc2Townÿc0 :: TP scrolls " + (tome ? (tome.getStat(70) || 0) : 0) + "/" + want + " (cap until lvl 30)");
			} else {
				if (me.gold < cost) {
					print("ÿc8Townÿc0 :: cannot afford " + scrollCode + " stack");
					this.dismissShopError();
					return false;
				}

				looseBefore = this.countLooseScrolls(scrollCode);
				before = cur;
				scroll.buy(true); // lvl 30+ (or ID tome): fill tome from vendor
				delay(me.ping * 2 + 150);
				this.dismissShopError();

				tome = this.findBook(tomeCode);
				cur = tome ? (tome.getStat(70) || 0) : 0;

				if (cur <= before && this.countLooseScrolls(scrollCode) > looseBefore) {
					print("ÿc8Townÿc0 :: " + scrollCode + " shift-buy spilled to inventory — not into tome");
				} else if (tomeCode === "tbk") {
					print("ÿc2Townÿc0 :: TP scrolls " + cur + "/" + want);
				}
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
		var tomeCode, tome;

		switch (id) {
		case 519:
		case 534:
		case "ibk":
			tomeCode = "ibk";
			break;
		case 518:
		case 533:
		case "tbk":
			tomeCode = "tbk";
			break;
		default:
			tomeCode = String(id || "").toLowerCase();
		}

		tome = this.findBook(tomeCode);

		if (!tome) {
			// Missing ID tome: pretend full so we don't shop-spam when FieldID is off
			if (tomeCode === "ibk") {
				return Config.FieldID ? 0 : 20;
			}

			return 0;
		}

		return tome.getStat(70) || 0;
	},

	// Real scroll count for logs — never the fake 20 from checkScrolls when no ID tome
	scrollFillCount: function (scrollCode) {
		var tomeCode, tome, n;

		scrollCode = scrollCode ? String(scrollCode).toLowerCase() : "";
		tomeCode = (scrollCode === "tsc") ? "tbk" : "ibk";
		tome = this.findBook(tomeCode);

		if (tome) {
			return tome.getStat(70) || 0;
		}

		n = this.countLooseScrolls(scrollCode);

		return n;
	},

	// True when identify() would need the vendor: unid items to shop-ID (no Cain) or IDed sellables.
	// Shared by identify() and needShopPass() so the chores Shop is only opened for real work.
	identifyNeedsShop: function (usedCain) {
		var i, list, result;

		list = Storage.Inventory.Compare(Config.Inventory);

		if (!list) {
			return false;
		}

		// Cain already IDed — shop only to sell junk (no Akara/Drognan tome/scroll ID)
		for (i = 0; i < list.length; i += 1) {
			if (list[i].location !== 3 || this.ignoredItemTypes.indexOf(list[i].itemType) > -1) {
				continue;
			}

			result = Pickit.checkItem(list[i]);

			if (!list[i].getFlag(0x10)) {
				// Charms must be IDed before stash/sell (early: use inv isc)
				if (this.isCharmItem(list[i])) {
					return true;
				}

				// Magic/rare rings & amulets — always ID (keep/sell/equip needs stats)
				if ((list[i].itemType === 10 || list[i].itemType === 12) &&
						(list[i].quality === 4 || list[i].quality === 6)) {
					return true;
				}

				// Jewels — always ID (wanted keep vs junk → fragments)
				if (typeof Pickit !== "undefined" && typeof Pickit.isJewel === "function" &&
						Pickit.isJewel(list[i])) {
					return true;
				}

				if (!usedCain && ([-1, 4].indexOf(result.result) > -1 || Item.hasTier(list[i]))) {
					return true;
				}

				continue;
			}

			// Identified sellables / trash left by cainID (incl. leftover merc candidates)
			if (result.result === 4 || result.result === 0 ||
					(this.isCharmItem(list[i]) && list[i].getFlag(0x10) && !this.shouldParkCharm(list[i])) ||
					(typeof Item.isMercInvLeftover === "function" && Item.isMercInvLeftover(list[i])) ||
					((list[i].itemType === 5 || list[i].itemType === 6) &&
						!(typeof Item !== "undefined" && typeof Item.wantsAmmo === "function" && Item.wantsAmmo(list[i]))) ||
					list[i].itemType === 80 || list[i].itemType === 81) {
				if (!Item.autoEquipCheck(list[i])) {
					return true;
				}
			}
		}

		return false;
	},

	identify: function (shopAlreadyOpen) {
		var i, item, tome, scroll, npc, list, timer, tpTome, result,
			tpTomePos = {},
			usedCain = false;

		// Never re-call cainID while shop is open — it cancels the trade
		if (shopAlreadyOpen) {
			usedCain = !!this._choresUsedCain;
		} else {
			usedCain = this.cainID();
		}

		if (!this.identifyNeedsShop(usedCain)) {
			return false;
		}

		list = Storage.Inventory.Compare(Config.Inventory);

		if (!list) {
			return false;
		}

		if (shopAlreadyOpen && this.isShopOpen()) {
			npc = getInteractedNPC();
		}

		if (!npc) {
			npc = this.initNPC("Shop", usedCain ? "sell" : "identify");
		}

		if (!npc) {
			return false;
		}

		tome = this.findIdTome() || me.findItem("ibk", 0, 3) || me.findItem(536, 0, 3);

		if (!usedCain && tome && tome.getStat(70) < list.length) {
			this.fillTome("ibk", !!shopAlreadyOpen);
		}

MainLoop:
		while (list.length > 0) {
			item = list.shift();

			if (item.location !== 3 || this.ignoredItemTypes.indexOf(item.itemType) > -1) {
				continue;
			}

			// After Cain: sell identified junk — but still shop-ID jewelry Cain missed
			if (usedCain && item.getFlag(0x10)) {
				result = Pickit.checkItem(item);

				// Player upgrade — keep
				if (Item.autoEquipCheck(item)) {
					continue;
				}

				// Better than equipped but can't wear yet — keep
				if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(item)) {
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

				if (typeof Pickit.isPd2Currency === "function" && Pickit.isPd2Currency(item)) {
					continue;
				}

				if (item.itemType === 74 || (item.code && /^r\d{2}$/i.test(item.code))) {
					continue;
				}

				// Arrows/bolts always sell if still in inv and nobody needs them (incl. PD2 rares)
				if ((item.itemType === 5 || item.itemType === 6) &&
						!(typeof Item !== "undefined" && typeof Item.wantsAmmo === "function" && Item.wantsAmmo(item))) {
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

				// Unid charms always ID (leveling keep nip needs stats)
				if (!item.getFlag(0x10) && this.isCharmItem(item)) {
					result.result = -1;
				}

				// Unid magic/rare rings & amulets — always ID (never keep/sell blind)
				if (!item.getFlag(0x10) && (item.itemType === 10 || item.itemType === 12) &&
						(item.quality === 4 || item.quality === 6)) {
					result.result = -1;
				}

				// Unid jewels — always ID (wanted keep vs junk → fragments)
				if (!item.getFlag(0x10) && typeof Pickit !== "undefined" && typeof Pickit.isJewel === "function" &&
						Pickit.isJewel(item)) {
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

					if (typeof Pickit.isPd2Currency === "function" && Pickit.isPd2Currency(item)) {
						break;
					}

					Misc.itemLogger("Sold", item);
					item.sell();

					break;
				case -1:
					tome = this.findIdTome() || tome;

					if (tome) {
						this.identifyItem(item, tome);
					} else {
						scroll = this.findIdScroll();

						if (!scroll) {
							scroll = this.getShopItem(npc, "isc",
								(typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.isc) ? [NTIPAliasClassID.isc] : [547]);

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

								if (Storage.Inventory.CanFit(scroll) &&
										me.getStat(14) + me.getStat(15) >= (scroll.getItemCost(0) || 100)) {
									scroll.buy();
								}
							}

							scroll = this.findIdScroll();
						}

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

		// TP top-up is doChores vendor order (after pots) — don't fill mid-identify when shopAlreadyOpen
		if (!shopAlreadyOpen) {
			this.fillTome("tbk");
		}

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

			// Better than equipped but can't wear yet — keep for next autoEquip
			if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(items[i])) {
				Misc.itemLogger("Kept", items[i]);
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

	// MiniShop: 4os Spirit swords only exist on Repair NPCs (Charsi/Fara/…).
	// Never open Repair just to hunt — only scan when trade is already open for real repair.
	needSpiritSwordShop: function () {
		if (!Config.MiniShopBot || !Config.MakeRunewords || me.charlvl < 18) {
			return false;
		}

		// Poison Strike = daggers only — never hunt Spirit swords
		if (typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) {
			return false;
		}

		if (typeof Runewords === "undefined" || typeof Runeword === "undefined" || !Runeword.Spirit) {
			return false;
		}

		if (typeof Runewords.hasSpiritRecipe !== "function" || !Runewords.hasSpiritRecipe()) {
			return false;
		}

		if (typeof Runewords.hasCompletedSpiritSword === "function" && Runewords.hasCompletedSpiritSword()) {
			return false;
		}

		if (typeof Runewords.hasEmptySpiritBase === "function" && Runewords.hasEmptySpiritBase()) {
			return false;
		}

		return true;
	},

	// Opportunistic only: Repair trade must already be open (from Town.repair). Never initNPC Repair here.
	buySpiritSwordBase: function () {
		var npc;

		if (!this.needSpiritSwordShop()) {
			return true;
		}

		npc = getInteractedNPC();

		if (!npc || !npc.itemcount) {
			return true;
		}

		print("ÿc4MiniShopBotÿc0: Repair already open — scanning for 4-socket Spirit sword");
		this.shopItems();

		return true;
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
			Item.equip(list[0], 4, {
				why: "poison strike dagger",
				reason: "need dagger equipped for Poison Strike",
				tier: NTIP.GetTier(list[0]) || 0
			});
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
					Item.equip(item, 4, {
						why: "poison strike dagger",
						reason: "need dagger equipped for Poison Strike"
					});

					return true;
				}
			} while (item.getNext());
		}

		return false;
	},

	// Act2 desert merc — Fara shop spear once per difficulty (flag in data/mercWeaponBought.<profile>.json)
	needMercWeapon: function () {
		if (!Config.UseMerc || !Config.AutoEquipMerc) {
			return false;
		}

		if (typeof Item === "undefined" || typeof Item.isDesertMerc !== "function" || !Item.isDesertMerc()) {
			return false;
		}

		return !this.hasBoughtMercWeaponThisDiff();
	},

	// Act2 desert merc spear from Fara. Inventory equip: any act (always).
	// Fara shop-scan: once per difficulty, ONLY while already in Act2 AND this chore pass
	// already needs heal or repair (Fara is Heal+Repair there). Never change acts for this.
	// force = Act2 hire path (already in Lut) — still only one shop mark per diff.
	buyMercWeapon: function (force) {
		var npc, item, cand, best, cost, gold, i, eq, list = [], invBest = null, reason;

		if (!Config.UseMerc || !Config.AutoEquipMerc) {
			return true;
		}

		if (typeof Item === "undefined" || typeof Item.isDesertMerc !== "function" || !Item.isDesertMerc()) {
			return true;
		}

		eq = Item.getMercItem(4);
		gold = me.getStat(14) + me.getStat(15);

		// Inventory first — equip upgrade without shopping / without leaving current act
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
					reason = Item.canMercEquipReason(item);

					if (reason && !Item._mercFailLogged[item.gid]) {
						Item._mercFailLogged[item.gid] = true;
						Item.mercEquipLog(item, 4, "SKIP", reason);
					}

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
			eq = Item.getMercItem(4);
		}

		// Shop at most once per difficulty
		if (this.hasBoughtMercWeaponThisDiff()) {
			return true;
		}

		// Never leave current act for Fara — shop only in Lut Gholein
		if (me.act !== 2) {
			return true;
		}

		// Chores: only piggyback when this pass already visits Fara for heal or repair
		// force: post-hire while already standing in Act2
		if (!force && !this._act2FaraMercShop) {
			return true;
		}

		if (gold < 50) {
			print("ÿc8Townÿc0 :: Need merc weapon but not enough gold");

			return false;
		}

		if (!me.inTown) {
			this.goToTown();
		}

		if (me.act !== 2) {
			return true;
		}

		me.cancel();
		delay(150 + me.ping);

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

			// Armed already and nothing better — count as the once-per-diff shop pass
			if (eq.item) {
				this.markMercWeaponBought();

				return true;
			}

			return false;
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
			this.markMercWeaponBought();

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

		var i, item, result, buy, stealthHunt, stealthFound, stealthBought, stealthBuy,
			loreHunt, loreFound, loreBought, loreBuy,
			spiritHunt, spiritFound, spiritBought, spiritBuy,
			treacheryHunt, treacheryFound, treacheryBought, treacheryBuy,
			shieldHunt, shieldFound, shieldBought, shieldBuy, shieldBest,
			items = [],
			equipBest = {}, // bodyLoc → {unit, tier, def, line}
			loc, locs, tier, def, key, entry, boughtName,
			npc = getInteractedNPC();

		if (!npc || !npc.itemcount) {
			return false;
		}

		item = npc.getItem();

		if (!item) {
			return false;
		}

		print("ÿc4MiniShopBotÿc0: Scanning " + npc.itemcount + " items.");

		stealthHunt = false;
		stealthFound = false;
		stealthBought = false;
		loreHunt = false;
		loreFound = false;
		loreBought = false;
		spiritHunt = false;
		spiritFound = false;
		spiritBought = false;
		treacheryHunt = false;
		treacheryFound = false;
		treacheryBought = false;
		shieldHunt = false;
		shieldFound = false;
		shieldBought = false;
		shieldBest = null;

		// Notify when Tal+Eth are ready and we still need a Stealth base
		if (typeof Runewords !== "undefined" && typeof Runeword !== "undefined" && Runeword.Stealth &&
				typeof Runewords.hasStealthRecipe === "function" && Runewords.hasStealthRecipe() &&
				typeof Runewords.haveRunes === "function" && Runewords.haveRunes(Runeword.Stealth) &&
				typeof Runewords.hasCompletedArmorRuneword === "function" && !Runewords.hasCompletedArmorRuneword() &&
				typeof Runewords.hasEmptyStealthBase === "function" && !Runewords.hasEmptyStealthBase() &&
				me.charlvl >= 17) {
			stealthHunt = true;
			print("ÿc4MiniShopBotÿc0: Searching for 2-socket armor for Stealth (Tal+Eth in inv/stash)");
		}

		// Same for Lore — Ort+Sol ready, need empty 2os helm (or higher-def upgrade)
		if (typeof Runewords !== "undefined" && typeof Runeword !== "undefined" && Runeword.Lore &&
				typeof Runewords.hasLoreRecipe === "function" && Runewords.hasLoreRecipe() &&
				typeof Runewords.haveRunes === "function" && Runewords.haveRunes(Runeword.Lore) &&
				typeof Runewords.hasCompletedLoreHelm === "function" && !Runewords.hasCompletedLoreHelm() &&
				me.charlvl >= 20) {
			loreHunt = true;
			print("ÿc4MiniShopBotÿc0: Searching for 2-socket helm for Lore (best def; Ort+Sol ready)");
		}

		// Spirit — Tal+Thul+Ort+Amn ready, need empty 4os Crystal/Broad/Long (not PS necro)
		if (!(typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) &&
				typeof Runewords !== "undefined" && typeof Runeword !== "undefined" && Runeword.Spirit &&
				typeof Runewords.hasSpiritRecipe === "function" && Runewords.hasSpiritRecipe() &&
				typeof Runewords.haveRunes === "function" && Runewords.haveRunes(Runeword.Spirit) &&
				typeof Runewords.hasCompletedSpiritSword === "function" && !Runewords.hasCompletedSpiritSword() &&
				typeof Runewords.hasEmptySpiritBase === "function" && !Runewords.hasEmptySpiritBase() &&
				me.charlvl >= 18) {
			spiritHunt = true;
			print("ÿc4MiniShopBotÿc0: Searching for 4-socket sword for Spirit (Tal+Thul+Ort+Amn in inv/stash)");
		}

		// Treachery — Shael+Thul+Lem ready, need 3os armor def>120 (PS mid)
		if (typeof Runewords !== "undefined" && typeof Runeword !== "undefined" && Runeword.Treachery &&
				typeof Runewords.hasTreacheryRecipe === "function" && Runewords.hasTreacheryRecipe() &&
				typeof Runewords.haveRunes === "function" && Runewords.haveRunes(Runeword.Treachery) &&
				typeof Runewords.hasCompletedTreacheryArmor === "function" && !Runewords.hasCompletedTreacheryArmor() &&
				me.charlvl >= 35) {
			treacheryHunt = true;
			print("ÿc4MiniShopBotÿc0: Searching for 3-socket armor def>120 for Treachery (Shael+Thul+Lem ready)");
		}

		// 1H equipped, empty offhand, no banked/memory shield — fill offhand from shop
		if (typeof Item !== "undefined" && Item.needsShieldShop && Item.needsShieldShop()) {
			shieldHunt = true;
			print("ÿc4MiniShopBotÿc0: Searching for shield (1H equipped, empty offhand)");
		}

		do {
			if (this.ignoredItemTypes.indexOf(item.itemType) === -1) {
				items.push(copyUnit(item));
			}
		} while (item.getNext());

		for (i = 0; i < items.length; i += 1) {
			result = Pickit.checkItem(items[i]);
			buy = false;
			stealthBuy = false;
			loreBuy = false;
			spiritBuy = false;
			treacheryBuy = false;
			shieldBuy = false;

			// Stealth / Lore / Spirit / Treachery RW bases — not gated on worthShopBuy/autoequip
			if (typeof Runewords !== "undefined") {
				if (typeof Runewords.wantStealthShopBase === "function" && Runewords.wantStealthShopBase(items[i])) {
					buy = true;
					stealthFound = true;
					stealthBuy = true;
				} else if (typeof Runewords.wantLoreShopBase === "function" && Runewords.wantLoreShopBase(items[i])) {
					buy = true;
					loreFound = true;
					loreBuy = true;
				} else if (typeof Runewords.wantSpiritShopBase === "function" && Runewords.wantSpiritShopBase(items[i])) {
					buy = true;
					spiritFound = true;
					spiritBuy = true;
				} else if (typeof Runewords.wantTreacheryShopBase === "function" && Runewords.wantTreacheryShopBase(items[i])) {
					buy = true;
					treacheryFound = true;
					treacheryBuy = true;
				}
			}

			// Offhand fill — track best canEquip shield even when nip tier is 0 (plain kite)
			if (!buy && shieldHunt && typeof Item.isShieldItem === "function" && Item.isShieldItem(items[i]) &&
					!(me.classid !== 3 && Item.isAuricShield && Item.isAuricShield(items[i])) &&
					Item.canEquip(items[i]) && !Item.isBroken(items[i])) {
				tier = NTIP.GetTier(items[i]) || 0;
				def = items[i].getStat(31) || 0;

				if (typeof items[i].getStatEx === "function") {
					def = Math.max(def, items[i].getStatEx(31) || 0);
				}

				shieldFound = true;

				if (!shieldBest || tier > shieldBest.tier ||
						(tier === shieldBest.tier && def > shieldBest.def)) {
					shieldBest = { unit: items[i], tier: tier, def: def };
				}
			}

			if (!buy && (result.result === 3 || result.result === 2 || result.result === 5)) {
				// RW base / cubing / crafting — MiniShopBot must buy these (result 1 path skips them)
				buy = true;
			} else if (!buy && result.result === 1 && Item.worthShopBuy(items[i])) {
				// AutoEquip: remember best candidate per body slot — buy once after scan
				// (was buying every Drognan shield that beat equipped, without re-equip mid-loop)
				locs = Item.getBodyLoc(items[i]);
				tier = NTIP.GetTier(items[i]);
				def = items[i].getStat(31) || 0;

				if (typeof items[i].getStatEx === "function") {
					def = Math.max(def, items[i].getStatEx(31) || 0);
				}

				if (locs && locs.length && tier > 0) {
					key = locs[0];
					entry = equipBest[key];

					if (!entry || tier > entry.tier || (tier === entry.tier && def > entry.def)) {
						equipBest[key] = {
							unit: items[i],
							tier: tier,
							def: def,
							line: result.line || "autoequip"
						};
					}
				}

				buy = false; // deferred
			}

			if (buy) {
				try {
					if (Storage.Inventory.CanFit(items[i]) && me.getStat(14) + me.getStat(15) >= items[i].getItemCost(0)) {
						Misc.itemLogger("Shopped", items[i]);
						Misc.logItem("Shopped", items[i], result.line || "rw-base");
						items[i].buy();

						if (stealthBuy) {
							stealthBought = true;
						}

						if (loreBuy) {
							loreBought = true;
						}

						if (spiritBuy) {
							spiritBought = true;
						}

						if (treacheryBuy) {
							treacheryBought = true;
						}
					}
				} catch (e) {
					print(e);
				}
			}

			delay(2);
		}

		// One autoequip upgrade per body slot (best tier, then defense)
		for (loc in equipBest) {
			if (!equipBest.hasOwnProperty(loc)) {
				continue;
			}

			entry = equipBest[loc];
			item = entry.unit;

			if (!item) {
				continue;
			}

			// Re-check vs equipped — another buy this visit shouldn't matter (one per slot)
			if (!Item.worthShopBuy(item)) {
				continue;
			}

			try {
				if (Storage.Inventory.CanFit(item) && me.getStat(14) + me.getStat(15) >= item.getItemCost(0)) {
					boughtName = (item.name || item.classid || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0];
					Misc.itemLogger("Shopped", item);
					Misc.logItem("Shopped", item, entry.line);
					item.buy();
					print("ÿc2MiniShopBotÿc0: Bought best slot " + loc + " — " + boughtName +
						" tier=" + entry.tier + " def=" + entry.def);
				}
			} catch (eBuy) {
				print(eBuy);
			}

			delay(2);
		}

		// Empty-offhand fill — buy best tracked shield when autoequip path skipped it (tier 0 kite)
		if (shieldHunt && shieldBest && shieldBest.unit && !(equipBest[5] || equipBest["5"])) {
			item = shieldBest.unit;

			try {
				if (Storage.Inventory.CanFit(item) && me.getStat(14) + me.getStat(15) >= item.getItemCost(0)) {
					boughtName = (item.name || item.classid || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0];
					Misc.itemLogger("Shopped", item);
					Misc.logItem("Shopped", item, "offhand-fill");
					item.buy();
					shieldBought = true;
					print("ÿc2MiniShopBotÿc0: Bought offhand fill — " + boughtName +
						" tier=" + shieldBest.tier + " def=" + shieldBest.def);
				}
			} catch (eSh) {
				print(eSh);
			}

			delay(2);
		} else if (shieldHunt && (equipBest[5] || equipBest["5"])) {
			shieldBought = true; // slot-5 autoequip buy already covers the hunt
		}

		if (stealthHunt) {
			if (stealthBought) {
				print("ÿc2MiniShopBotÿc0: Found 2-socket armor for Stealth — bought");
			} else if (stealthFound) {
				print("ÿc1MiniShopBotÿc0: Found 2-socket armor for Stealth — could not buy (gold/space)");
			} else {
				print("ÿc1MiniShopBotÿc0: No 2-socket Breast/Light Plate for Stealth in this shop");
			}
		}

		if (loreHunt) {
			if (loreBought) {
				print("ÿc2MiniShopBotÿc0: Found 2-socket helm for Lore — bought");
			} else if (loreFound) {
				print("ÿc1MiniShopBotÿc0: Found 2-socket helm for Lore — could not buy (gold/space)");
			} else {
				print("ÿc1MiniShopBotÿc0: No 2-socket Lore helm in this shop");
			}
		}

		if (spiritHunt) {
			if (spiritBought) {
				print("ÿc2MiniShopBotÿc0: Found 4-socket sword for Spirit — bought");
			} else if (spiritFound) {
				print("ÿc1MiniShopBotÿc0: Found 4-socket sword for Spirit — could not buy (gold/space)");
			} else {
				print("ÿc1MiniShopBotÿc0: No 4-socket Crystal/Broad/Long for Spirit in this shop");
			}
		}

		if (treacheryHunt) {
			if (treacheryBought) {
				print("ÿc2MiniShopBotÿc0: Found 3-socket armor for Treachery — bought");
			} else if (treacheryFound) {
				print("ÿc1MiniShopBotÿc0: Found 3-socket armor for Treachery — could not buy (gold/space)");
			} else {
				print("ÿc1MiniShopBotÿc0: No 3-socket armor def>120 for Treachery in this shop");
			}
		}

		if (shieldHunt) {
			if (shieldBought) {
				print("ÿc2MiniShopBotÿc0: Found shield for empty offhand — bought");
			} else if (shieldFound) {
				print("ÿc1MiniShopBotÿc0: Found shield for empty offhand — could not buy (gold/space)");
			} else {
				print("ÿc1MiniShopBotÿc0: No usable shield for empty offhand in this shop");
			}
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
			this._keysBrokeTick = getTickCount();

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
		gold = me.getStat(14) + me.getStat(15);

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

					if (me.getStat(14) + me.getStat(15) < cost) {
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

		// Early game: no key shopping / no TownCheck key loops
		if (me.charlvl <= 7) {
			return 12;
		}

		if (!me.getItem("key") && !Storage.Inventory.CanFit({sizex: 1, sizey: 1})) {
			return 12;
		}

		// Broke / recent failed buy — pretend full so townCheck stops
		if (this.keysUnbuyable()) {
			return 12;
		}

		return this.countKeys();
	},

	// Not worth a town trip for keys (lvl / gold / recent fail)
	keysUnbuyable: function () {
		var gold = me.getStat(14) + me.getStat(15);

		if (me.charlvl <= 7) {
			return true;
		}

		// Key stack / single still needs cash — 50 was too low vs walk spam
		if (gold < 100) {
			return true;
		}

		if (this._keysBrokeTick && getTickCount() - this._keysBrokeTick < 3 * 60 * 1000) {
			return true;
		}

		return false;
	},

	needKeys: function () {
		if (!Config.OpenChests || me.classid === 6) {
			return false;
		}

		if (this.keysUnbuyable()) {
			return false;
		}

		return this.countKeys() <= 0;
	},

	wantKeys: function () {
		if (!Config.OpenChests || me.classid === 6) {
			return false;
		}

		if (this.keysUnbuyable()) {
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
			items = this.getItemsForRepair(Config.RepairPercent, false, true);

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

		var items = this.getItemsForRepair(Config.RepairPercent, false, true);

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
			rune = me.getItem(635); // PD2 Ral (was LoD 617)

			break;
		default:
			rune = me.getItem(636); // PD2 Ort (was LoD 618)

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
		var i, quiver, myQuiver, npc, repairAction, bowCheck, before, after, tries;

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
				before = this.getItemsForRepair(Config.RepairPercent, true).length;
				npc = this.initNPC("Repair", "repair");

				if (!npc) {
					print("ÿc1Townÿc0 :: repair — NPC unavailable");
					return false;
				}

				// Ensure Trade/Repair shop is actually open (heal/talk leaves menu without shop)
				if (!getUIFlag(0x0C) || (npc.itemcount || 0) < 1) {
					if (!npc.startTrade("Repair")) {
						print("ÿc1Townÿc0 :: repair — startTrade(Repair) failed");
						return false;
					}
				}

				for (tries = 0; tries < 3; tries += 1) {
					me.repair();
					delay(400 + me.ping);
					after = this.getItemsForRepair(Config.RepairPercent, true).length;

					if (after < before || after === 0) {
						break;
					}
				}

				print("ÿc2Townÿc0 :: repaired at " + (npc.name || "NPC") +
					" (" + before + "→" + after + " item(s) needing repair)");

				// Already at Repair for durability — piggyback RW-base MiniShop (Spirit/Stealth/Lore)
				this.shopItems();

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

					// Quiver restock already opened Repair — scan RW bases while here
					this.shopItems();
				}

				break;
			}
		}

		return true;
	},

	needRepair: function () {
		var quiver, bowCheck, quantity, needItems, gold,
			repairAction = [];

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

		// Repair durability/quantity/charges — check need first, then gold
		needItems = this.getItemsForRepair(Config.RepairPercent, true);

		if (needItems.length > 0) {
			gold = me.gold;

			if (typeof me.getStat === "function") {
				gold = Math.max(gold, (me.getStat(14) || 0) + (me.getStat(15) || 0));
			}

			if (gold >= me.getRepairCost()) {
				repairAction.push("repair");
			} else {
				print("ÿc4Townÿc0 :: Can't afford repairs (need " + me.getRepairCost() +
					", have " + gold + ", " + needItems.length + " item(s))");
			}
		}

		return repairAction;
	},

	getItemsForRepair: function (repairPercent, chargedItems, includeEthereal) {
		var i, charge, quantity, durability, maxDur,
			itemList = [],
			item = me.getItem(-1, 1);

		if (item) {
			do {
				// Ethereal: NPC me.repair() cannot fix — skip unless CubeRepair Ort/Ral path
				if (item.getFlag(0x400000) && !includeEthereal) {
					continue;
				}

				if (!item.getStat(152)) { // Skip indestructible items
					switch (item.itemType) {
					// Quantity check
					case 42: // Throwing knives
					case 43: // Throwing axes
					case 44: // Javelins
					case 87: // Amazon javelins
						// getStat returns false at 0 — coerce
						quantity = (typeof Item !== "undefined" && Item.statOrZero) ? Item.statOrZero(item, 70) : item.getStat(70);

						if (quantity === false || quantity === undefined || quantity === null) {
							quantity = 0;
						}

						if (typeof quantity === "number" && quantity * 100 / (getBaseStat("items", item.classid, "maxstack") + (item.getStat(254) || 0)) <= repairPercent) {
							itemList.push(copyUnit(item));
						}

						break;
					// Durability check
					default:
						maxDur = item.getStat(73);

						// No durability (jewelry etc.) — getStat(73) is false
						if (maxDur === false || maxDur === undefined || maxDur === null || maxDur <= 0) {
							break;
						}

						// Current dur 0 → getStat(72) is false in D2BS
						durability = (typeof Item !== "undefined" && Item.statOrZero) ? Item.statOrZero(item, 72) : item.getStat(72);

						if (durability === false || durability === undefined || durability === null) {
							durability = 0;
						}

						if (typeof durability === "number" && durability * 100 / maxDur <= repairPercent) {
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
			} while (item.getNext());
		}

		return itemList;
	},

	// Equipped ethereal with 0 durability — needRepair ignores these (NPC can't repair)
	hasBrokenEtherealEquipped: function () {
		var item = me.getItem(-1, 1);

		if (!item) {
			return false;
		}

		do {
			if (item.getFlag(0x400000) && typeof Item !== "undefined" && Item.isBroken && Item.isBroken(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	reviveMerc: function () {
		if (!this.needMerc()) {
			return true;
		}

		// Fuck Aheara
		if (me.act === 3) {
			this.goToTown(2);
		}

		var i, tick, dialog, lines, text, clicked,
			preArea = me.area,
			npc = this.initNPC("Merc", "reviveMerc");

		if (!npc) {
			return false;
		}

MainLoop:
		for (i = 0; i < 3; i += 1) {
			try {
				dialog = getDialogLines();
			} catch (eDlg) {
				dialog = null;
			}

			clicked = false;

			if (dialog && dialog.length) {
				for (lines = 0; lines < dialog.length; lines += 1) {
					text = (dialog[lines].text || "").toString();

					// "You do not have enough gold for that."
					if (text.match(getLocaleString(3362), "gi") || text.match(/enough gold/i)) {
						me.cancel();
						print("ÿc8Townÿc0 :: reviveMerc — not enough gold");
						return false;
					}

					// ONLY Revive/Resurrect — never match bare ":" (Hire list entries all have colons → stutter)
					if (text.match(/revive|resurrect/i) ||
							text.match(getLocaleString(22695), "gi") ||
							text.match(getLocaleString(22696), "gi")) {
						dialog[lines].handler();
						clicked = true;
						delay(Math.max(750, me.ping * 2));
						break;
					}
				}
			}

			if (!clicked) {
				delay(300 + me.ping);
			}

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!!me.getMerc()) {
					delay(Math.max(500, me.ping * 2));
					break MainLoop;
				}

				delay(200);
			}
		}

		Attack.checkInfinity();

		// Always close Greiz dialog — open Hire UI stalls chores / equip
		me.cancel();
		delay(100 + me.ping);

		if (!!me.getMerc()) {
			if (Config.MercWatch) { // Cast BO on merc so he doesn't just die again
				print("MercWatch precast");
				Pather.useWaypoint("random");
				Precast.doPrecast(true);
				Pather.useWaypoint(preArea);
			}

			print("ÿc2Townÿc0 :: reviveMerc ok");
			return true;
		}

		print("ÿc8Townÿc0 :: reviveMerc failed — no merc");
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

		// Malah's Potion (ice), Scroll of Resistance, Book of Skill, Potion of Life — field/use from inv
		if (typeof QuestItems !== "undefined" && typeof QuestItems.mustKeepInInventory === "function" &&
				QuestItems.mustKeepInInventory(item)) {
			return false;
		}

		if (this.ignoredItemTypes.indexOf(item.itemType) > -1 || ignoredClassids.indexOf(item.classid) > -1 || !Storage.Stash.CanFit(item)) {
			return false;
		}

		return true;
	},

	// Magic/rare 2os helm/armor/circlet cannot be runewords — pull to inv for sell
	// Also bare white orbs kept as false "pending switch" junk
	isFakeRwBase: function (item) {
		var socks, tier;

		if (!item || item.getFlag(0x4000000)) {
			return false;
		}

		if (Item.hasTier(item) && Item.autoEquipCheck(item)) {
			return false;
		}

		if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(item)) {
			return false;
		}

		// Useless orb (no skill/FCR tier) — was banked while on staff
		if (typeof Item.isOrbItem === "function" && Item.isOrbItem(item)) {
			if (typeof Item.isPendingOrb === "function" && Item.isPendingOrb(item)) {
				return false;
			}

			tier = (typeof NTIP !== "undefined" && NTIP.GetTier) ? (NTIP.GetTier(item) || 0) : 0;

			if (tier < 12) {
				return true;
			}
		}

		if (item.quality < 4 || item.getItem()) {
			return false;
		}

		if (item.itemType !== 37 && item.itemType !== 75 && item.itemType !== 3) {
			return false;
		}

		socks = item.getStat(194) || 0;

		if (typeof item.getStatEx === "function") {
			socks = Math.max(socks, item.getStatEx(194) || 0);
		}

		return socks >= 2;
	},

	hasFakeRwBasesInStash: function () {
		var item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.location === 7 && this.isFakeRwBase(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Unidentified jewels parked in stash — need pull → Cain/scroll ID → keep or → jewf
	hasUnidJewelsInStash: function () {
		var item = me.getItem(-1, -1);

		if (!item || typeof Pickit === "undefined" || typeof Pickit.isJewel !== "function") {
			return false;
		}

		do {
			if (item.location === 7 && !item.getFlag(0x10) && Pickit.isJewel(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	unstashUnidJewels: function () {
		var item, i, gid, name, gids = [], moved = 0, batchCap = 15;

		if (typeof Pickit === "undefined" || typeof Pickit.isJewel !== "function") {
			return 0;
		}

		// Snapshot gids first — MoveTo invalidates the live getNext() cursor
		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location === 7 && !item.getFlag(0x10) && Pickit.isJewel(item)) {
					gids.push(item.gid);
				}
			} while (item.getNext());
		}

		if (!gids.length) {
			return 0;
		}

		for (i = 0; i < gids.length && moved < batchCap; i += 1) {
			gid = gids[i];
			item = me.getItem(-1, -1, gid);

			if (!item || item.location !== 7 || item.getFlag(0x10) || !Pickit.isJewel(item)) {
				continue;
			}

			if (!Storage.Inventory.CanFit(item)) {
				break;
			}

			if (Storage.Inventory.MoveTo(item)) {
				name = (item.name || "jewel").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0];
				print("ÿc8Townÿc0 :: unstash unid jewel (" + name + ")");
				moved += 1;
				delay(me.ping + 60);
			}
		}

		if (moved) {
			print("ÿc2Townÿc0 :: pulled " + moved + "/" + gids.length + " unid jewel(s) from stash for ID");
		}

		return moved;
	},

	unstashFakeRwBases: function () {
		var item, i, gid, gids = [], moved = 0;

		// Snapshot gids first — MoveTo invalidates the live getNext() cursor
		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (item.location === 7 && this.isFakeRwBase(item)) {
					gids.push(item.gid);
				}
			} while (item.getNext());
		}

		if (!gids.length) {
			return 0;
		}

		for (i = 0; i < gids.length; i += 1) {
			gid = gids[i];
			item = me.getItem(-1, -1, gid);

			if (!item || item.location !== 7 || !this.isFakeRwBase(item)) {
				continue;
			}

			if (!Storage.Inventory.CanFit(item)) {
				break;
			}

			if (Storage.Inventory.MoveTo(item)) {
				print("ÿc8Townÿc0 :: unstash junk (" + (item.name || item.classid) + ")");
				moved += 1;
				delay(me.ping + 60);
			}
		}

		return moved;
	},

	// Same keep rules as stash() — used by needStash so we don't walk for junk that won't bank
	shouldStashItem: function (item) {
		var result, tier, pickResult, protectedBase;

		if (!item || !this.canStash(item)) {
			return false;
		}

		// PD2 currency (WSS, Demonic Cube, Puzzlebox, …) — always bank, never leftover-sell
		if (typeof Pickit !== "undefined" && typeof Pickit.isPd2Currency === "function" &&
				Pickit.isPd2Currency(item)) {
			return true;
		}

		// Never bank magic/rare socketed "fake" RW bases (only white/grey are runewordable)
		if (this.isFakeRwBase(item)) {
			return false;
		}

		// Best tiered shield while still on 2H staff — bank for when we find an orb/1H
		if (typeof Item.isPendingShield === "function" && Item.isPendingShield(item) &&
				Item.isBestPendingShield(item)) {
			Item.rememberPendingShield(item);
			return true;
		}

		// One pickit + one protected-base evaluation per item (needStash calls this for every inv item)
		pickResult = Pickit.checkItem(item).result;
		protectedBase = !!(typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(item));

		result = (pickResult > 0 && pickResult < 4) ||
			Cubing.keepItem(item) || Runewords.keepItem(item) || CraftingSystem.keepItem(item);

		// Empty RW bases must bank even if nip miss / result 0
		if (!result && protectedBase) {
			result = true;
		}

		// 3os poles: poisonstrike nip keeps every Battle Scythe. After Purity exists
		// (stash/merc) or this isn't the best empty base, do not bank it again.
		if (typeof Runewords !== "undefined" && Runewords.isEmptyPurityBase &&
				Runewords.isEmptyPurityBase(item)) {
			if ((Runewords.purityBasesDone && Runewords.purityBasesDone()) ||
					(Runewords.wantPurityBase && !Runewords.wantPurityBase(item))) {
				result = false;
				protectedBase = false;
			}
		}

		// 2os poles: same nip — dump once Purity or Insight exists (Strength obsolete)
		if (typeof Runewords !== "undefined" && Runewords.isEmptyStrengthBase &&
				Runewords.isEmptyStrengthBase(item) &&
				((Runewords.purityBasesDone && Runewords.purityBasesDone()) ||
					(Runewords.purityOutranksStrength && Runewords.purityOutranksStrength()))) {
			result = false;
			protectedBase = false;
		}

		// Tiered autoequip leftovers stay in inv — BUT empty Stealth/Lore bases match armor
		// starter #tier == 1 and must still bank (ProtectRWBases blocks wear).
		if (Config.AutoEquip && pickResult === 1) {
			tier = NTIP.GetTier(item);

			if (tier > 0 && tier < 100 && !protectedBase) {
				result = false;
			}
		}

		if (this.isCharmItem(item)) {
			// Never bank unid charms — ID + sell/keep in town first
			if (!item.getFlag(0x10) || !this.isKeptCharm(item)) {
				return false;
			}
		}

		// Never bank unid magic/rare jewelry — ID first
		if (!item.getFlag(0x10) && (item.itemType === 10 || item.itemType === 12) &&
				(item.quality === 4 || item.quality === 6)) {
			return false;
		}

		// Never bank unid jewels — ID first, then keep good / fragment junk
		if (!item.getFlag(0x10) && typeof Pickit !== "undefined" && typeof Pickit.isJewel === "function" &&
				Pickit.isJewel(item)) {
			return false;
		}

		// PD2: leave junk jewels in inv for cubeJunkJewelsAtStash (→ jewf)
		// If no key, bank them so a 15-jewel batch can't clog inventory forever
		if (typeof Pickit !== "undefined" && typeof Pickit.isJunkJewel === "function" &&
				Pickit.isJunkJewel(item)) {
			if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.findPromoteKey === "function" &&
					Pd2Stack.findPromoteKey()) {
				return false;
			}

			return true; // no key — bank; listJunkJewels still finds loc=7 later
		}

		if (result || (typeof Pickit.isRuneItem === "function" && Pickit.isRuneItem(item))) {
			return true;
		}

		return false;
	},

	// One stash open: promote flawless→perfect → pull pots → bank → gold → close
	// keepOpen: leave stash/cube UI up for Cubing / junk jewels / stack in doChores
	// (rune/gem merge runs after Runewords.makeRunewords in doChores)
	doStashVisit: function (stashGold, keepOpen) {
		var needPots, needBank, needPromote, needCull, needStack, i, items;

		if (stashGold === undefined) {
			stashGold = true;
		}

		needPots = this.hasStashedPotions();
		needBank = this.needStash(stashGold);
		needPromote = (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.needsPromoteFlawless === "function" &&
			Pd2Stack.needsPromoteFlawless());
		needCull = this.hasFakeRwBasesInStash();
		needStack = (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.needsStacking === "function" &&
			Pd2Stack.needsStacking());

		if (!needPots && !needBank && !needPromote && !needCull && !needStack) {
			print("ÿc2Townÿc0 :: stash skip (nothing to bank / no stashed pots)");
			return true;
		}

		me.cancel();
		delay(50 + me.ping);

		if (!this.openStash()) {
			print("ÿc1Townÿc0 :: stash open failed");
			return false;
		}

		print("ÿc2Townÿc0 :: stash once (pots=" + needPots + " bank=" + needBank +
			" promote=" + needPromote + " cull=" + needCull + " stack=" + needStack + ")");

		// Pull magic/rare 2os "fake" RW bases out of stash so clearInventory can sell them
		this.unstashFakeRwBases();

		// PD2: flawless→perfect (stack + key) before banking
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.promoteFlawlessAtStash === "function") {
			Pd2Stack.promoteFlawlessAtStash();
		}

		// Rune/gem merge moved to after Runewords.makeRunewords() — avoid stacking
		// socketables that make just peeled, and skip unstack→merge→unstack churn.

		if (needPots) {
			this.retrieveStashedPotions(true);
		}

		items = Storage.Inventory.Compare(Config.Inventory);

		if (items) {
			for (i = 0; i < items.length; i += 1) {
				if (this.shouldStashItem(items[i])) {
					if (items[i].quality <= 3 && !items[i].getItem() &&
							((items[i].getStat(194) || 0) >= 2 ||
								(items[i].getStatEx && items[i].getStatEx(194) >= 2))) {
						print("ÿc2Townÿc0 :: stash empty " +
							(items[i].getStat(194) || (items[i].getStatEx && items[i].getStatEx(194)) || "?") +
							"os code=" + (items[i].code || "?") +
							" classid=" + items[i].classid +
							" type=" + items[i].itemType +
							" name=" + ((items[i].name || "").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0] || "(blank)"));
					}

					Misc.itemLogger("Stashed", items[i]);
					Storage.Stash.MoveTo(items[i]);
				}
			}
		}

		if (stashGold && Config.StashGold && me.getStat(14) >= Config.StashGold && me.getStat(15) < 25e5) {
			gold(me.getStat(14), 3);
			delay(500 + me.ping);
		}

		// RW check/make only when we already opened stash for a real need (bank/pots/…)
		if (typeof Runewords !== "undefined") {
			if (Runewords.cullWorseInsightBases) {
				Runewords.cullWorseInsightBases();
			}

			if (Runewords.cullWorseLoreBases) {
				Runewords.cullWorseLoreBases();
			}

			if (Runewords.cullWorseTreacheryBases) {
				Runewords.cullWorseTreacheryBases();
			}

			// Purity ready/worn — dump obsolete 2os Strength spears before make
			if (Runewords.cullObsoleteStrengthBases) {
				Runewords.cullObsoleteStrengthBases();
			}

			// Purity done or multiple empty 3os — keep at most one best base
			if (Runewords.cullWorsePurityBases) {
				Runewords.cullWorsePurityBases();
			}

			Runewords.makeRunewords();

			// Retry equip for any completed Stealth/Lore/Spirit that missed its one-shot
			// craft-time equip (stat lag, str/dex/lvl not met yet, or a code fix landed after
			// it was already made) — otherwise it stays stranded in the stash forever.
			if (Runewords.equipStrandedRunewords) {
				Runewords.equipStrandedRunewords();
			}
		}

		// Spirit/orb just worn — pull memory/banked shield while stash is still open
		if (typeof Item !== "undefined" && Item.equipBestOwnedShield) {
			Item.equipBestOwnedShield();
		}

		// Merge jewf/WSS/rune piles after bank + make (jewf singles→QTY, multi stash piles)
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.stackLooseAtStash === "function" &&
				Pd2Stack.needsStacking && Pd2Stack.needsStacking()) {
			Pd2Stack.stackLooseAtStash();
		}

		if (!keepOpen) {
			me.cancel();
			delay(100 + me.ping);
		}

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

		// Purity ready (Amn+Eth+Thul + empty 3os spear/polearm) — open stash to socket
		if (typeof Runewords !== "undefined" && Runewords.needsPurityMakeVisit &&
				Runewords.needsPurityMakeVisit()) {
			return true;
		}

		// Treachery ready (Shael+Thul+Lem + empty 3os armor def>120) — open stash to socket
		if (typeof Runewords !== "undefined" && Runewords.needsTreacheryMakeVisit &&
				Runewords.needsTreacheryMakeVisit()) {
			return true;
		}

		// Strength ready (Amn+Tir + empty 2os on merc/inv) — open stash to peel/socket
		if (typeof Runewords !== "undefined" && Runewords.needsStrengthMakeVisit &&
				Runewords.needsStrengthMakeVisit()) {
			return true;
		}

		// Spirit ready (Tal+Thul+Ort+Amn + empty 4os Crystal/Broad/Long) — open stash to socket
		if (typeof Runewords !== "undefined" && Runewords.needsSpiritMakeVisit &&
				Runewords.needsSpiritMakeVisit()) {
			return true;
		}

		// Rhyme ready (Shael+Eth + empty 2os shield) while 1H equipped — open stash to socket
		if (typeof Runewords !== "undefined" && Runewords.needsRhymeMakeVisit &&
				Runewords.needsRhymeMakeVisit()) {
			return true;
		}

		// Completed Stealth/Lore/Spirit stranded unequipped in stash (missed its one-shot
		// craft-time equip) — nothing else here asks for a visit once the recipe is "done".
		if (typeof Runewords !== "undefined" && Runewords.needsRunewordEquipVisit &&
				Runewords.needsRunewordEquipVisit()) {
			return true;
		}

		// Multiple jewf/WSS/rune piles that can still merge
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.needsStacking === "function" &&
				Pd2Stack.needsStacking()) {
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

		// Stash already open — never closeCube first (cancel drops stash on PD2 and forces reopen)
		if (getUIFlag(0x19)) {
			return true;
		}

		if (getUIFlag(0x1a) && !Cubing.closeCube()) {
			return false;
		}

		for (i = 0; i < 5; i += 1) {
			// me.cancel with item on cursor drops on PD2 — never cancel while holding
			if (!me.itemoncursor) {
				me.cancel();
			}

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
			shopped = false,
			code, hasCain, tpTome, tpQty;

		hasCain = !!(me.getQuest(4, 0) || me.getQuest(4, 1) || me.act >= 2);
		tpTome = this.findBook("tbk");
		tpQty = tpTome ? (tpTome.getStat(70) || 0) : 0;

		for (i = 0; !!items && i < items.length; i += 1) {
			if (items[i].location === 3 && items[i].mode === 0 && items[i].itemType === 22) {
				code = items[i].code ? String(items[i].code).toLowerCase() : "";

				// Loose TP scrolls: keep only as portal backup when tome is missing/empty.
				// With a stocked tome they just waste inv (fillTome buys into the book).
				if (code === "tsc") {
					if (tpQty < 1) {
						continue;
					}

					if (!shopped) {
						this.ensureShopOpen("clearScrolls");
						shopped = true;
					}

					try {
						print("ÿc2Townÿc0 :: sell loose TP scroll (tome has " + tpQty + ")");
						Misc.itemLogger("Sold", items[i]);
						items[i].sell();
						delay(Math.min(120, 40 + me.ping));
					} catch (eTsc) {
						print("ÿc8Townÿc0 :: sell loose tsc failed: " + eTsc);
					}

					continue;
				}

				// ID scrolls only pre-Cain.
				if (code === "isc" && !hasCain) {
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

	// Prefer sell. Never sell potions — drink leftovers (flushToxPots / cullExcessPotions).
	// Keep scrolls/tomes (except post-Cain isc).
	sellInventoryItem: function (item) {
		var cost, code, kind;

		if (!item || item.location !== 3) {
			return false;
		}

		if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(item)) {
			return false;
		}

		// Unsellable PD2 currency (Demonic Cube / WSS / Puzzlebox) — never sell or drop
		if (typeof Pickit !== "undefined" && typeof Pickit.isPd2Currency === "function" &&
				Pickit.isPd2Currency(item)) {
			return false;
		}

		// Never sell empty Stealth/Lore/Leaf bases we're still banking for RW
		if (typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(item)) {
			return false;
		}

		if (typeof Runewords !== "undefined" && Runewords.keepItem && Runewords.keepItem(item)) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		kind = (typeof this.potionKind === "function") ? this.potionKind(item) : false;

		// Cain lore Horadric Scroll (tr1) — can't keep; vendors often reject quest lore → drop
		if ((typeof QuestItems !== "undefined" && typeof QuestItems.isHoradricScroll === "function" &&
				QuestItems.isHoradricScroll(item)) || code === "tr1") {
			if (this.isShopOpen() || getUIFlag(0x08) || getUIFlag(0x0C)) {
				me.cancel();
				delay(80 + me.ping);
			}

			try {
				print("ÿc2Townÿc0 :: drop Horadric Scroll (lore junk, not Lam Esen)");
				Misc.itemLogger("Dropped", item);
				item.drop();
			} catch (eDropTr1) {}

			return true;
		}

		// Never sell any potion (hp/mp/rv/stamina/tox) — drink path owns them
		if (kind || item.itemType === 80 || item.itemType === 81 ||
				/^hp[1-5]$/.test(code) || /^mp[1-5]$/.test(code) ||
				code === "rvs" || code === "rvl" || code === "vps" || code === "yps" || code === "wms" ||
				[76, 77, 78, 79].indexOf(item.itemType) > -1) {
			return false;
		}

		// Never sell/drop scrolls / tomes (and leftover type checks)
		// Exception: ID scrolls after Cain — Cain IDs, no need to keep isc
		if (code === "isc" && (me.getQuest(4, 0) || me.getQuest(4, 1) || me.act >= 2)) {
			// fall through to sell below
		} else if (code === "tsc" || code === "isc" || code === "tbk" || code === "ibk" ||
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
		var result, kind, best, socks;

		if (!item || item.location !== 3) {
			return false;
		}

		// Never sell potions — cull/flush drinks excess (PD2 type/code can disagree)
		kind = this.potionKind(item);

		if (kind) {
			return false;
		}

		// Never sell jewels — wanted ones are kept (Pickit.checkItem "always keep"), junk ones
		// get cubed into Jewel Fragments (Pd2Stack.cubeJunkJewelsAtStash), never vendored.
		if (typeof Pickit !== "undefined" && typeof Pickit.isJewel === "function" && Pickit.isJewel(item)) {
			return false;
		}

		// Cain lore Horadric Scroll (tr1) — drop junk; NOT Lam Esen (bbb) / Inifuss (bks)
		if (typeof QuestItems !== "undefined" && typeof QuestItems.isHoradricScroll === "function" &&
				QuestItems.isHoradricScroll(item)) {
			return true;
		}

		if (item.code && String(item.code).toLowerCase() === "tr1") {
			return true;
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

		if (item.code && (/^hp[1-5]$/.test(String(item.code).toLowerCase()) ||
				/^mp[1-5]$/.test(String(item.code).toLowerCase()) ||
				item.code === "rvs" || item.code === "rvl" || item.code === "vps" ||
				item.code === "tsc" || item.code === "tbk" || item.code === "ibk")) {
			return false;
		}

		// ID scrolls: keep only before Cain; sell after (Cain IDs)
		if (item.code && String(item.code).toLowerCase() === "isc") {
			if (me.getQuest(4, 0) || me.getQuest(4, 1) || me.act >= 2) {
				return true;
			}

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

		// Empty Config.Runewords bases (Stealth Breast/Light Plate, Lore, Leaf, …) — never sell
		if (typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(item)) {
			return false;
		}

		// 0-dur / empty stack — never equip, always sell (CubeRepair only works while worn)
		if (typeof Item !== "undefined" && Item.isBroken && Item.isBroken(item)) {
			return true;
		}

		// Poison Strike necro: valued heads (+PS / 30-20 / Decrep) — NEVER sell
		if (typeof Item !== "undefined" && Item.isValuedPsNecroHead && Item.isValuedPsNecroHead(item)) {
			return false;
		}

		// Empty neck / ring — never sell wearable jewelry while that slot is bare
		if (typeof Item.fillsEmptyJewelrySlot === "function" && Item.fillsEmptyJewelrySlot(item) &&
				Item.isWearableJewelry(item)) {
			return false;
		}

		// Real player autoequip upgrade only
		if (Item.hasTier(item) && Item.autoEquipCheck(item)) {
			return false;
		}

		// Better than equipped but can't wear yet (str/lvl/dex) — keep, never sell
		if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(item)) {
			return false;
		}

		// Magic/rare socketed helm/armor/circlet — not RW-able; sell unless upgrade (above)
		// Bare white orbs (no skill/FCR) — same
		if (this.isFakeRwBase(item)) {
			return true;
		}

		// Best pending orb while on 2H staff — keep for switch
		if (typeof Item.isPendingOrb === "function" && Item.isPendingOrb(item)) {
			if (Item.isBestPendingOrb(item)) {
				return false;
			}

			return true; // inferior pending orbs — sell
		}

		// Best pending shield (2H staff era) — keep/stash, never sell
		if (typeof Item.isPendingShield === "function" && Item.isPendingShield(item)) {
			if (Item.isBestPendingShield(item)) {
				Item.rememberPendingShield(item);
				return false;
			}

			return true; // inferior pending shields — sell
		}

		// Merc upgrades FIRST — player #tier armor/helm/gloves and Act1 bows were sold
		// before this check (tiered-leftover + hard bow sell), so merc never got them.
		if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(item)) {
			return false;
		}

		// Broken ethereal: NPC can't repair. Keep for Ort/Ral if CubeRepair; else sell.
		if (item.getFlag(0x400000) && typeof Item.isBroken === "function" && Item.isBroken(item)) {
			return !Config.CubeRepair;
		}

		// Tiered leftovers (extra amulets/rings/etc. that aren't upgrades) — sell
		if (Config.AutoEquip && NTIP.GetTier(item) > 0 && !Item.autoEquipCheck(item)) {
			// Exception: valued PS heads stay in inv even if not beating current offhand yet
			if (typeof Item.isValuedPsNecroHead === "function" && Item.isValuedPsNecroHead(item)) {
				return false;
			}

			// Caster: never sell FCR jewelry while a ring/amulet slot still has 0 FCR
			if (typeof Item.isNeededCasterFcrJewelry === "function" && Item.isNeededCasterFcrJewelry(item)) {
				return false;
			}

			if (typeof Item.fillsEmptyJewelrySlot === "function" && Item.fillsEmptyJewelrySlot(item) &&
					Item.isWearableJewelry(item)) {
				return false;
			}

			return true;
		}

		// Sorc: bows/xbows — sell only when merc does not want them (check already above)
		if ([27, 35, 86].indexOf(item.itemType) > -1) {
			return true;
		}

		// Junk circlets — sell unless player upgrade / empty Lore base (already kept above)
		if (item.itemType === 75) {
			if (typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(item)) {
				return false;
			}

			return true;
		}

		// Paladin-only shields — sell on necro/sorc/etc.
		if (me.classid !== 3 && typeof Item.isAuricShield === "function" && Item.isAuricShield(item)) {
			return true;
		}

		// Melee poisonstrike: FCR-only rings/amulets — sell
		if (typeof Item.isMeleeJunkFcrJewelry === "function" && Item.isMeleeJunkFcrJewelry(item)) {
			return true;
		}

		// Past lvl 18: sell leftover chipped/flawed/normal gems
		if (me.charlvl > 18 && typeof Pickit !== "undefined" && Pickit.isLowTierGem && Pickit.isLowTierGem(item)) {
			return true;
		}

		// Caster: axes / barb helms / javelins that somehow landed in inv
		if (typeof Item !== "undefined") {
			if (typeof Item.isCasterJunkAxe === "function" && Item.isCasterJunkAxe(item)) {
				return true;
			}

			if (typeof Item.isBarbHelm === "function" && Item.isBarbHelm(item) && me.classid !== 4) {
				return true;
			}
		}

		if (item.itemType === 44 || item.itemType === 88) {
			return true;
		}

		// Wrong-act merc weapons in inv — sell (not keep for “maybe later”)
		if ([27, 33, 34, 35, 85, 86].indexOf(item.itemType) > -1) {
			if (!(typeof Item !== "undefined" && typeof Item.autoEquipMercCheck === "function" &&
					Item.autoEquipMercCheck(item))) {
				return true;
			}
		}

		// Leftover merc gear (not an upgrade) — sell
		if (typeof Item.isMercInvLeftover === "function" && Item.isMercInvLeftover(item)) {
			return true;
		}

		// Antidote / thawing leftovers — drink via flushToxPots, never sell
		if (!kind && (item.itemType === 80 || item.itemType === 81 ||
				(item.code && (String(item.code).toLowerCase() === "yps" || String(item.code).toLowerCase() === "wms")))) {
			return false;
		}

		// Bad charms (identified, not in leveling keep nip) — sell
		if (this.isCharmItem(item)) {
			return !this.isKeptCharm(item);
		}

		// Arrows/bolts: sell leftovers (incl. PD2 rare quivers) unless merc/player needs them
		if (item.itemType === 5 || item.itemType === 6) {
			if (item.location === 1) {
				return false; // equipped on player
			}

			if (typeof Item !== "undefined" && typeof Item.wantsAmmo === "function" && Item.wantsAmmo(item)) {
				return false;
			}

			return true;
		}

		result = Pickit.checkItem(item).result;

		// Nip "keep" that isn't autoequip upgrade / cubing / RW base → still sell if junk quality
		// (never quest — already returned above). Without this skip, 2os Stealth/Lore bases (no #tier)
		// were sold as soon as vendor value > 50.
		if (result === 1 && !Item.hasTier(item) && !Cubing.keepItem(item) && !Runewords.keepItem(item) &&
				!(typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(item)) &&
				!(typeof Runewords !== "undefined" && Runewords.wantBaseForRunes && Runewords.wantBaseForRunes(item))) {
			if (typeof Item !== "undefined" && Item.isValuedPsNecroHead && Item.isValuedPsNecroHead(item)) {
				return false;
			}

			if (typeof Item !== "undefined" && Item.isNecroHead && Item.isNecroHead(item) && me.classid === 2) {
				return false; // any necro head on PS char — ID/score first, never vendor-vacuum
			}

			if (item.quality >= 4 || item.getItemCost(1) > 50) {
				return true;
			}
		}

		// Worse empty Insight poles (we already bank a better one) — sell
		if (typeof Runewords !== "undefined" && Runewords.isConfiguredInsightBase &&
				Runewords.isConfiguredInsightBase(item) && Runewords.insightBaseScore(item) > 0) {
			best = Runewords.getBestEmptyInsightBase();

			if (best && best.gid !== item.gid && !(Runewords.wantInsightBase && Runewords.wantInsightBase(item))) {
				return true;
			}
		}

		// Obsolete 2os Strength bases once Purity/Insight exists (or Purity makeable) — sell
		if (typeof Runewords !== "undefined" && Runewords.isEmptyStrengthBase &&
				Runewords.isEmptyStrengthBase(item) &&
				((Runewords.purityBasesDone && Runewords.purityBasesDone()) ||
					(Runewords.purityOutranksStrength && Runewords.purityOutranksStrength()))) {
			return true;
		}

		// Empty 3os Purity bases once worn/Insight, or worse than best banked — sell
		if (typeof Runewords !== "undefined" && Runewords.isEmptyPurityBase &&
				Runewords.isEmptyPurityBase(item)) {
			if (Runewords.purityBasesDone && Runewords.purityBasesDone()) {
				return true;
			}

			best = Runewords.getBestEmptyPurityBase && Runewords.getBestEmptyPurityBase();

			if (best && best.gid !== item.gid &&
					!(Runewords.wantPurityBase && Runewords.wantPurityBase(item))) {
				return true;
			}
		}

		if (result === 1 || result === 2 || result === 3 || result === 5) {
			return false;
		}

		return result === 0 || result === 4 || result === -1;
	},

	// Drink antidote / thawing leftovers (never sell). Andy/Duriel buy fresh after chores.
	// Does not cancel shop — safe mid-chores; stubborn pots retry on next clearInventory.
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

				// Only real tox — never match by itemType alone (can false-hit mana/hp on PD2)
				if (kind === "yps" || kind === "wms" ||
						((code === "yps" || code === "wms") && kind !== "hp" && kind !== "mp" && kind !== "rv" && kind !== "vps")) {
					list.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		if (!list.length) {
			return 0;
		}

		print("ÿc2Townÿc0 :: drink " + list.length + " antidote/thawing leftover(s)");

		for (i = 0; i < list.length; i += 1) {
			pot = me.getItem(-1, -1, list[i].gid);

			if (!pot || (pot.location !== 2 && pot.location !== 3)) {
				continue;
			}

			try {
				pot.interact();
				n += 1;
				delay(150 + me.ping);
			} catch (eDrink) {}
		}

		return n;
	},

	clearInventory: function (keepShopOpen) {
		var i, item,
			items = [],
			junk = [];

		this.checkQuestItems(); // only golden bird quest for now

		// Belt moves need shop closed — skip when already inside chores vendor pass
		if (!keepShopOpen) {
			me.cancel();
			delay(50 + me.ping);
			this.refillBeltIfNeeded();
		}

		// Drink inv pots above buffer (never sell) — belt already filled
		this.cullExcessPotions();

		// Antidote / thawing — drink leftovers (shop prep buys fresh)
		this.flushToxPots();

		// Collect junk, then sell (reuse open shop when keepShopOpen)
		if (!keepShopOpen) {
			this.identifyAllCharms(true);
		}

		this.trimCharmInventory(junk);
		this.applyCharmInventoryLock();
		items = Storage.Inventory.Compare(Config.Inventory);

		for (i = 0; !!items && i < items.length; i += 1) {
			if (this.isTownJunk(items[i])) {
				junk.push(copyUnit(items[i]));
			}
		}

		// Charms locked earlier / sitting in zone — sell bad ones explicitly
		this.sellAllBadCharms(junk);

		// Ammo / merc bows / other junk can sit outside Compare (locked charm cells)
		this.sellAllInvAmmo(junk);
		this.sellAllInvMercWeapons(junk);
		this.sellAllInvTownJunk(junk);

		if (junk.length) {
			print("ÿc2Townÿc0 :: Selling " + junk.length + " junk item(s)");

			if (!keepShopOpen || !this.isShopOpen()) {
				this.ensureShopOpen("clearInventory");
			}

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
					if (Config.RunewordDebug) {
						print("ÿc2Townÿc0 :: keep charm " + code + " type=" + item.itemType + " @ " + item.x + "," + item.y);
					}

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

	// Full-inv isTownJunk scan — Compare skips locked charm/mana cells, so white
	// leftovers (Greaves, etc.) parked next to charms were never sold.
	sellAllInvTownJunk: function (junk) {
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
				if (item.location !== 3 || seen[item.gid]) {
					continue;
				}

				if (this.isTownJunk(item)) {
					gids.push(item.gid);
					seen[item.gid] = true;
				}
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
					if (typeof Item !== "undefined" && typeof Item.autoEquipMercCheck === "function" &&
							Item.autoEquipMercCheck(item)) {
						continue; // pending rogue weapon
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
					// PD2: rare/unique quivers are still ammo — flush unless wantsAmmo keeps them
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

			if (typeof Item.wantsAmmo === "function" && Item.wantsAmmo(item)) {
				if (typeof Item.mercNeedsAmmo === "function" && Item.mercNeedsAmmo(item)) {
					Item.equipMerc(item, 5);
					item = me.getItem(-1, -1, gid);

					if (!item || item.location !== 3) {
						continue; // equipped onto merc
					}

					// Still needed but equip failed this pass — keep for next autoEquipMerc
					if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(item)) {
						continue;
					}
				}

				// Player bow/xbow ammo — keep in inv (Town.needRepair restocks whites; rares OK while shooting)
				if (typeof Item.playerNeedsAmmo === "function" && Item.playerNeedsAmmo(item)) {
					continue;
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
			var cainA5 = getUnit(1, NPC.Cain);

			this.act[4].spot = {};
			this.act[4].spot.portalspot = [5098, 5019];
			this.act[4].spot.stash = [5129, 5061];
			this.act[4].spot[NPC.Larzuk] = [5141, 5045];
			this.act[4].spot[NPC.Malah] = [5078, 5029];
			// Act5 Cain seat differs: LoD Bnet near stash/WP; PD2/SP near Qual-Kehk.
			// Prefer live unit; else try Qual-side first (PD2), then stash-side (LoD).
			if (cainA5) {
				this.act[4].spot[NPC.Cain] = [cainA5.x, cainA5.y];
			} else {
				this.act[4].spot[NPC.Cain] = [5068, 5086, 5119, 5061];
			}
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
			this.doChores(repair);

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