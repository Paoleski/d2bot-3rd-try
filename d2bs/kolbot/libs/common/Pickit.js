/**
*	@filename	Pickit.js
*	@author		kolton
*	@desc		handle item pickup
*/

var Pickit = {
	gidList: [],
	beltSize: 1,
	ignoreLog: [4, 5, 6, 22, 41, 76, 77, 78, 79, 80, 81], // Ignored item types for item logging

	init: function (notify) {
		var i, filename;

		if (typeof QuestItems === "undefined") {
			if (!isIncluded("common/QuestItems.js")) {
				include("common/QuestItems.js");
			}
		}

		for (i = 0; i < Config.PickitFiles.length; i += 1) {
			filename = "pickit/" + Config.PickitFiles[i];

			NTIP.OpenFile(filename, notify);
		}

		this.beltSize = Storage.BeltSize();
	},

	// PD2 gold piles often report classid 538 (same as vip) — identify by code/type, never classid alone.
	isGoldPile: function (unit) {
		var code;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "gld") {
			return true;
		}

		if (unit.itemType === 4) {
			return true;
		}

		// LoD / alias fallbacks when code missing
		if (!code && (unit.classid === 523 || unit.classid === 540)) {
			return true;
		}

		return false;
	},

	goldPileAmount: function (unit) {
		if (!unit) {
			return 0;
		}

		if (typeof unit.getStat === "function") {
			return unit.getStat(14) || 0;
		}

		return unit.gold || 0;
	},

	// Skip tiny piles as you level (TK was vacuuming filter-hidden gold after every kill).
	// lvl <10: any; 10→50, 20→200, 30→450, 40→800, cap 2000. Config.MinGoldPile >=0 overrides.
	minGoldPile: function () {
		var lvl, cfg;

		cfg = (typeof Config !== "undefined") ? Config.MinGoldPile : undefined;

		if (cfg !== undefined && cfg !== null && cfg >= 0) {
			return cfg;
		}

		lvl = me.charlvl || 1;

		if (lvl < 10) {
			return 1;
		}

		return Math.min(2000, Math.floor(lvl * lvl / 2));
	},

	// PD2: prefer code/classid. Never trust itemType 75 alone — that's also LoD circlets (ci0–ci3).
	isRuneItem: function (unit) {
		var code, cid;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		// Circlet family shares type 75 with some PD2 rune layouts — never treat as runes
		if (/^ci[0-3]$/i.test(code)) {
			return false;
		}

		if (/^r\d{2}s?$/i.test(code) || /^r\d{2}g$/i.test(code)) {
			return true;
		}

		cid = unit.classid;

		// Classic LoD rune classid range
		if (cid >= 610 && cid <= 642) {
			return true;
		}

		// PD2 singles 628–660, stacks 702–734
		if ((cid >= 628 && cid <= 660) || (cid >= 702 && cid <= 734)) {
			return true;
		}

		// Type fallbacks: LoD runes=74; PD2 stacks/generics. NOT 75 (circlets).
		if ([74, 137, 138, 149].indexOf(unit.itemType) > -1 ||
				(unit.itemType >= 164 && unit.itemType <= 196)) {
			return true;
		}

		return false;
	},

	// PD2-only currency / socket tools — always keep (nip classid aliases often miss)
	isPd2Currency: function (unit) {
		var code, cid, name;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		// Prefer item code (stable across PD2 seasons; classids shift)
		if (code === "lbox" || code === "lpb" || code === "lpp" || code === "lmal" ||
				code === "wss" || code === "cwss" || code === "jewf" ||
				code === "toa" || code === "tes" || code === "ceh" ||
				code === "bet" || code === "fed" || code === "imrn" ||
				code === "lsvl" || code === "llmr") {
			return true;
		}

		// NTItemAlias types: puzzlebox=127, puzzlepiece=206, malus=210 (not classid 127 / dacian falx)
		if (unit.itemType === 127 || unit.itemType === 206 || unit.itemType === 210) {
			return true;
		}

		cid = unit.classid;

		// Current MPQ: lbox=687, lpp=781, lmal=785, wss=677; older labs used lbox=684
		if (cid === 687 || cid === 684 || cid === 781 || cid === 785 || cid === 677) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (name.indexOf("puzzlebox") > -1 || name.indexOf("puzzlepiece") > -1 ||
				name.indexOf("puzzle piece") > -1 ||
				(name.indexOf("larzuk") > -1 && name.indexOf("malus") > -1)) {
			return true;
		}

		return false;
	},

	// Returns:
	// -1 - Needs iding
	// 0 - Unwanted
	// 1 - NTIP wants
	// 2 - Cubing wants
	// 3 - Runeword wants
	// 4 - Pickup to sell (triggered when low on gold)
	checkItem: function (unit) {
		var rval, code, n, scroll;

		// Gold BEFORE nip — PD2 piles often share classid 538 with vip (Quest.nip false-hit)
		if (this.isGoldPile(unit)) {
			if (this.goldPileAmount(unit) < this.minGoldPile()) {
				return {
					result: 0,
					line: null
				};
			}

			return {
				result: 1,
				line: "gold"
			};
		}

		rval = NTIP.CheckItem(unit, false, true);

		// Identify scrolls: Normal only, and only pre-Cain (quest 4 resets each difficulty).
		// NM/Hell: buy ID scrolls if needed — never clutter inv from the ground.
		code = unit && unit.code ? String(unit.code).toLowerCase() : "";

		// Cain lore scroll (tr1) — useless clutter; NOT Lam Esen (bbb)
		if (typeof QuestItems !== "undefined" && typeof QuestItems.isHoradricScroll === "function" &&
				QuestItems.isHoradricScroll(unit)) {
			return {
				result: 0,
				line: null
			};
		}

		if (code === "tr1") {
			return {
				result: 0,
				line: null
			};
		}

		// NM/Hell: never field-pick ID or TP scrolls (tomes filled in town)
		if (me.diff > 0 && (code === "isc" || code === "tsc")) {
			return {
				result: 0,
				line: null
			};
		}

		if (code === "isc") {
			if (me.getQuest(4, 0) || me.getQuest(4, 1)) {
				return {
					result: 0,
					line: null
				};
			}

			n = 0;
			scroll = me.getItem("isc");

			if (!scroll && typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.isc) {
				scroll = me.getItem(NTIPAliasClassID.isc);
			}

			if (scroll) {
				do {
					if (scroll.location === 3) {
						n += 1;
					}
				} while (scroll.getNext());
			}

			if (n >= 2) {
				return {
					result: 0,
					line: null
				};
			}

			return {
				result: 1,
				line: "early-isc"
			};
		}

		// Arrows/bolts BEFORE quest — never mis-tag ammo as quest via classid collision.
		// PD2 rares are real gear; still only keep if merc/player actually needs that ammo type.
		if (unit.itemType === 5 || unit.itemType === 6) {
			if (typeof Item !== "undefined" && typeof Item.wantsAmmo === "function" && Item.wantsAmmo(unit)) {
				return {
					result: 1,
					line: Item.mercNeedsAmmo(unit) ? "merc" : "ammo"
				};
			}

			return {
				result: 0,
				line: null
			};
		}

		// Quest items always keep (nip optional — PD2 classids shift vs LoD)
		if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit)) {
			return {
				result: 1,
				line: "quest"
			};
		}

		// All runes (El–Zod + PD2 stacks) — always keep/stash, ignore nip gaps
		if (this.isRuneItem(unit)) {
			return {
				result: 1,
				line: "rune"
			};
		}

		// PD2 currency: Larzuk Puzzlebox/piece/malus, WSS, essences, etc.
		if (this.isPd2Currency(unit)) {
			return {
				result: 1,
				line: "pd2"
			};
		}

		if ((unit.classid === 617 || unit.classid === 618) && Town.repairIngredientCheck(unit)) {
			return {
				result: 6,
				line: null
			};
		}

		if (CraftingSystem.checkItem(unit)) {
			return {
				result: 5,
				line: null
			};
		}

		if (Cubing.checkItem(unit)) {
			return {
				result: 2,
				line: null
			};
		}

		if (Runewords.checkItem(unit)) {
			return {
				result: 3,
				line: null
			};
		}

		// Fire Leaf bases: ignore nip keep once a better skill orb exists
		if (rval.result === 1 && typeof Runewords !== "undefined" &&
				Runewords.hasBetterThanLeafOrb && Runewords.hasBetterThanLeafOrb() &&
				Runewords.isConfiguredLeafBase && Runewords.isConfiguredLeafBase(unit)) {
			rval = {
				result: 0,
				line: null
			};
		}

		// Stealth bases: ignore nip keep once one Stealth is finished
		if (rval.result === 1 && typeof Runewords !== "undefined" &&
				Runewords.hasCompletedArmorRuneword && Runewords.hasCompletedArmorRuneword() &&
				Runewords.isStealthRecipe && unit.quality <= 3 && !unit.getItem() &&
				(unit.getStat(194) || 0) === 2 && (unit.classid === 334 || unit.classid === 341)) {
			rval = {
				result: 0,
				line: null
			};
		}

		// Insight poles: ignore nip keep if we already have Insight, or base is worse than banked
		if (rval.result === 1 && typeof Runewords !== "undefined" &&
				Runewords.isConfiguredInsightBase && Runewords.isConfiguredInsightBase(unit)) {
			if ((Runewords.hasCompletedInsight && Runewords.hasCompletedInsight()) ||
					(Runewords.wantInsightBase && !Runewords.wantInsightBase(unit) &&
						Runewords.getBestEmptyInsightBase && Runewords.getBestEmptyInsightBase())) {
				rval = {
					result: 0,
					line: null
				};
			}
		}

		// Lore helms: ignore nip keep if Lore done, or base is lower def than banked
		if (rval.result === 1 && typeof Runewords !== "undefined" &&
				Runewords.isConfiguredLoreBase && Runewords.isConfiguredLoreBase(unit)) {
			if ((Runewords.hasCompletedLoreHelm && Runewords.hasCompletedLoreHelm()) ||
					(Runewords.wantLoreBase && !Runewords.wantLoreBase(unit) &&
						Runewords.getBestEmptyLoreBase && Runewords.getBestEmptyLoreBase())) {
				rval = {
					result: 0,
					line: null
				};
			}
		}

		// Potions: let canPick decide belt/buffer — don't rely on nip classids alone (PD2 shifts)
		if (rval.result === 0 && this.isPotion(unit)) {
			return {
				result: 1,
				line: "potion"
			};
		}

		// Jewels: always keep (strict nip left most identified jewels; sell vacuum skips cheap 1x1)
		if ((rval.result === 0 || rval.result === -1) && this.isJewel(unit)) {
			return {
				result: 1,
				line: "jewel"
			};
		}

		// Rare/set/unique jewelry: set/unique/crafted always; rares need nip floors
		if ((rval.result === 0 || rval.result === -1) && this.isKeepJewelry(unit)) {
			return {
				result: 1,
				line: "jewelry"
			};
		}

		// Leveling gems: chipped→normal only while leveling; flawless+ always
		if ((rval.result === 0 || rval.result === -1) && this.isWantedGem(unit)) {
			return {
				result: 1,
				line: "gem"
			};
		}

		// Nip matched a low gem we no longer want — drop the keep
		if (rval.result === 1 && this.isLevelingGem(unit) && !this.isWantedGem(unit)) {
			rval = {
				result: 0,
				line: null
			};
		}

		// Merc upgrade first — only if better than equipped (never pick as sell bait)
		if (rval.result === 0 && typeof Item !== "undefined" && typeof Item.autoEquipMercCheck === "function"
				&& Item.autoEquipMercCheck(unit)) {
			return {
				result: 1,
				line: "merc"
			};
		}

		// Valuable vendor bait only (rare/set/unique/crafted with real gold) — never blue trash
		if (rval.result === 0 && this.isSellCandidate(unit)) {
			return {
				result: 4,
				line: "sell"
			};
		}

		// Gold piles — size gated in checkItem / canPick (not LowGold white/blue vacuum)
		if (rval.result === 0 && this.isGoldPile(unit)) {
			if (this.goldPileAmount(unit) < this.minGoldPile()) {
				return {
					result: 0,
					line: null
				};
			}

			return {
				result: 1,
				line: "gold"
			};
		}

		return rval;
	},

		// Vendor bait — valuables always; white/blue only when low gold AND high vendor value
	isSellCandidate: function (unit) {
		var cost, size, minPerSq, minTotal, junkMin, q, lowGold;

		if (!unit || Town.ignoredItemTypes.indexOf(unit.itemType) > -1) {
			return false;
		}

		// Never vacuum caster axes / barb helms / javelins as gold bait
		if (typeof Item !== "undefined") {
			if (typeof Item.isCasterJunkAxe === "function" && Item.isCasterJunkAxe(unit)) {
				return false;
			}

			if (typeof Item.isBarbHelm === "function" && Item.isBarbHelm(unit)) {
				return false;
			}
		}

		if (unit.itemType === 44 || unit.itemType === 88) {
			return false;
		}

		// Wrong-act merc weapons — never sell-bait (need the right merc or leave on ground)
		if ([27, 33, 34, 35, 85, 86].indexOf(unit.itemType) > -1) {
			if (!(typeof Item !== "undefined" && typeof Item.autoEquipMercCheck === "function" &&
					Item.autoEquipMercCheck(unit))) {
				return false;
			}
		}

		if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit)) {
			return false;
		}

		q = unit.quality || 0;

		// quality: 1=low, 2=normal, 3=superior, 4=magic, 5=set, 6=rare, 7=unique, 8=crafted
		if (q < 1 || q > 8) {
			return false;
		}

		if (this.isPotion(unit) || unit.itemType === 4 || unit.itemType === 22 || unit.itemType === 41 ||
				this.isRuneItem(unit) || this.isPd2Currency(unit)) {
			return false;
		}

		// Charms: nip keep / town sell after ID — don't vacuum as generic sell
		if (unit.itemType === 82 || unit.itemType === 83 || unit.itemType === 84 || unit.itemType === 85 ||
				(unit.code && /^cm[123]$/i.test(unit.code))) {
			return false;
		}

		if (unit.code && /^r\d{2}s?$/i.test(unit.code)) {
			return false;
		}

		try {
			size = Math.max(1, (unit.sizex || 1) * (unit.sizey || 1));
			cost = unit.getItemCost(1) || 0;
		} catch (eCost) {
			// Unid set/unique/rare — pick to ID; never unid white/blue as sell bait
			return q >= 5 && q <= 8;
		}

		lowGold = (Config.LowGold || 0) > 0 && me.gold < Config.LowGold;

		// White / superior / blue: only while low on gold, and only big vendor value
		if (q >= 1 && q <= 4) {
			if (!lowGold) {
				return false;
			}

			junkMin = (me.diff === 0)
				? (Config.SellJunkMinGoldNormal || 5000)
				: (Config.SellJunkMinGoldHard || 25000);

			return cost >= junkMin;
		}

		// Set / rare / unique / crafted — always if valuable enough
		minPerSq = Config.SellMinGoldPerSquare || 2500;
		minTotal = Config.SellMinGoldTotal || 8000;

		if (q === 6) { // rares need a bit more
			minPerSq = Math.max(minPerSq, 3000);
			minTotal = Math.max(minTotal, 12000);
		}

		return cost >= minTotal && (cost / size) >= minPerSq;
	},

	// Keep / sell / potion — AutoEquip must not block sell picks or quest/rune keeps
	wantToPick: function (unit, status) {
		var code;

		// Never field-pick antidote / thawing (Andy/Duriel shop prep only)
		if (unit) {
			code = unit.code ? String(unit.code).toLowerCase() : "";

			if (code === "yps" || code === "wms" || unit.itemType === 80 || unit.itemType === 81 ||
					(typeof Town !== "undefined" && Town.potionKind &&
						(Town.potionKind(unit) === "yps" || Town.potionKind(unit) === "wms"))) {
				return false;
			}

			// Javelins/glaives — never (before gem code check: "glv" falsely matched as gem)
			if (unit.itemType === 44 || unit.itemType === 88 || code === "glv" || code === "glvs") {
				return false;
			}
		}

		// Potions / axes: reject caster junk axes BEFORE potion force-keep
		// (Military Pick code "mpi" used to match mana via mp* prefix)
		if (typeof Item !== "undefined" && typeof Item.isCasterJunkAxe === "function" && Item.isCasterJunkAxe(unit)) {
			return false;
		}

		// Potions always — even if nip/check returned 0 (PD2 classid shifts break nip / old isc-id collision)
		if (this.isPotion(unit) || this.isRejuv(unit)) {
			return true;
		}

		// Jewels always — stash/cube/sell in town
		if (this.isJewel(unit)) {
			return true;
		}

		// Rare/set/unique/crafted jewelry always
		if (this.isKeepJewelry(unit)) {
			return true;
		}

		// Gems: flawless+ always; chipped/flawed/normal only while charlvl <= 18
		if (this.isLevelingGem(unit)) {
			return this.isWantedGem(unit);
		}

		// Barb helms — only Act5 barb merc (or barb player); never sorc sell-bait
		if (typeof Item !== "undefined" && typeof Item.isBarbHelm === "function" && Item.isBarbHelm(unit)) {
			if (me.classid === 4 && Config.AutoEquip && Item.autoEquipCheck(unit)) {
				return true;
			}

			if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(unit)) {
				return true;
			}

			return false;
		}

		// Javelins/glaives already rejected above (type 44/88 / code glv)

		if (!status || status.result === 0 || status.result === false || status.result === null || status.result === undefined) {
			return false;
		}

		// Identify scrolls: allow when checkItem marked early-isc (pre-Cain)
		code = unit && unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "isc") {
			return !!(status && status.line === "early-isc");
		}

		// Merc-only weapons BEFORE generic result-4 sell — never vacuum xbow/spear/bow without the right merc
		// Bows/xbows → Act1 Rogue. Spears/polearms → Act2 Desert.
		if ([27, 33, 34, 35, 85, 86].indexOf(unit.itemType) > -1) {
			if (Config.AutoEquip && Item.autoEquipCheck(unit)) {
				return true;
			}

			if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(unit)) {
				return true;
			}

			return false;
		}

		if (status.result === 4) {
			return true;
		}

		// Unid: only rare/set/unique/crafted that matched a nip type line — never every blue
		if (status.result === -1) {
			return unit.quality >= 5 && unit.quality <= 8;
		}

		// Quest / cubing / runewords / crafting / repair / forced keeps — never gate on AutoEquip
		if (status.result === 2 || status.result === 3 || status.result === 5 || status.result === 6 ||
				status.line === "quest" || status.line === "rune" || status.line === "pd2" ||
				this.isRuneItem(unit) || this.isPd2Currency(unit) ||
				(typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit))) {
			return true;
		}

		// Wrong / unneeded ammo — never pick (incl. PD2 rare/unique quivers)
		if (unit.itemType === 5 || unit.itemType === 6) {
			if (!(typeof Item !== "undefined" && typeof Item.wantsAmmo === "function" && Item.wantsAmmo(unit))) {
				return false;
			}
		}

		// Merc-slot armor (body/helm/boots/etc.): only pick if better for player OR merc.
		// leveling_merc.nip has no #tier — without this we hoard worse armor forever.
		if (typeof Item !== "undefined" && typeof Item.getMercBodyLoc === "function" && Item.getMercBodyLoc(unit)) {
			if (Config.AutoEquip && Item.autoEquipCheck(unit)) {
				return true;
			}

			// Player upgrade we can't wear yet (str/lvl) — keep, don't demote to vendor bait
			if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(unit)) {
				return true;
			}

			if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(unit)) {
				return true;
			}

			// Empty Stealth/Lore RW bases (white/grey) — keep even when not an equip upgrade
			if (Item.isProtectedRWBase && Item.isProtectedRWBase(unit)) {
				return true;
			}

			if (typeof Runewords !== "undefined" &&
					((Runewords.wantLoreShopBase && Runewords.wantLoreShopBase(unit)) ||
						(Runewords.wantStealthShopBase && Runewords.wantStealthShopBase(unit)) ||
						(Runewords.wantSpiritShopBase && Runewords.wantSpiritShopBase(unit)) ||
						(Runewords.wantBaseForRunes && Runewords.wantBaseForRunes(unit)))) {
				return true;
			}

			// Magic+ still OK as vendor bait — never as a "keep"
			if (status.result === 4 || this.isSellCandidate(unit)) {
				status.result = 4;
				status.line = "sell";
				return true;
			}

			return false;
		}

		if (status.line === "merc" || (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(unit))) {
			return true;
		}

		if (Item.autoEquipCheck(unit)) {
			return true;
		}

		if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(unit)) {
			return true;
		}

		// Sorc on 2H staff — pick best orb (type/tier floors otherwise leave them on the ground)
		if (typeof Item.isPendingOrb === "function" && Item.isPendingOrb(unit)) {
			if (Item.isBestPendingOrb(unit)) {
				return true;
			}

			if (this.isSellCandidate(unit) &&
					!(typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit))) {
				status.result = 4;
				status.line = "sell";
				return true;
			}

			return false;
		}

		// Tiered shield while on 2H staff — pick best for stash until we find an orb/1H
		if (typeof Item.isPendingShield === "function" && Item.isPendingShield(unit)) {
			if (Item.isBestPendingShield(unit)) {
				Item.rememberPendingShield(unit);
				return true;
			}

			if (this.isSellCandidate(unit) &&
					!(typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit))) {
				status.result = 4;
				status.line = "sell";
				return true;
			}

			return false;
		}

		// Circlets: keep player/merc upgrades, empty Lore RW bases; else sell junk (not merc MaxQuantity hoard)
		if (unit.itemType === 75) {
			if (Config.AutoEquip && Item.autoEquipCheck(unit)) {
				return true;
			}

			if (typeof Item.isPendingPlayerUpgrade === "function" && Item.isPendingPlayerUpgrade(unit)) {
				return true;
			}

			if (typeof Item.autoEquipMercCheck === "function" && Item.autoEquipMercCheck(unit)) {
				return true;
			}

			if (typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(unit)) {
				return true;
			}

			if (typeof Runewords !== "undefined" &&
					((Runewords.wantLoreShopBase && Runewords.wantLoreShopBase(unit)) ||
						(Runewords.wantSpiritShopBase && Runewords.wantSpiritShopBase(unit)) ||
						(Runewords.wantBaseForRunes && Runewords.wantBaseForRunes(unit)) ||
						(Runewords.keepItem && Runewords.keepItem(unit)))) {
				return true;
			}

			if (this.isSellCandidate(unit) &&
					!(typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit))) {
				status.result = 4;
				status.line = "sell";
				return true;
			}

			return false;
		}

		// Nip keep with no AutoEquip tier (charms, quest.nip leftovers, etc.)
		if (status.result === 1 && (!Config.AutoEquip || !Item.hasTier(unit))) {
			return true;
		}

		// Nip matched (tiered) but not an upgrade — still sell if magic+ (never quest items)
		if (status.result === 1 && this.isSellCandidate(unit) &&
				!(typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit))) {
			status.result = 4;
			status.line = "sell";
			return true;
		}

		return false;
	},

	// Lab PD2 live: rvs=530, rvl often 531. Also keep 532/533 for other MPQ builds.
	rejuvClassids: [530, 531, 532, 533],

	// Jewel — code jew; LoD type 58 / NTIP 59; classid may shift on PD2
	isJewel: function (unit) {
		var code;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "jew") {
			return true;
		}

		// Jewel Fragments (jewf) are not socketable jewels
		if (code === "jewf") {
			return false;
		}

		if (unit.itemType === 58 || unit.itemType === 59) {
			return true;
		}

		if (typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.jewel !== undefined &&
				unit.classid === NTIPAliasClassID.jewel) {
			return true;
		}

		return unit.classid === 661;
	},

	// Keep: unique/set/crafted, or magic/rare matching a pickit line that has stats.
	// Ignores leveling vacuum lines like "[type] == jewel && [quality] == magic" (no # stats).
	isWantedJewel: function (unit) {
		var i, list, item;

		if (!unit || !this.isJewel(unit)) {
			return false;
		}

		// Set / unique / crafted — never fragment (facets etc.)
		if (unit.quality === 5 || unit.quality === 7 || unit.quality === 8) {
			return true;
		}

		if (typeof NTIP_CheckList === "undefined") {
			return typeof NTIP !== "undefined" && NTIP.CheckItem(unit) === 1;
		}

		// NTIP eval strings reference `item`
		item = unit;
		list = NTIP_CheckList;

		for (i = 0; i < list.length; i += 1) {
			try {
				if (!list[i] || !list[i][0] || !list[i][0].length) {
					continue;
				}

				if (!eval(list[i][0])) {
					continue;
				}

				// Vacuum pickup (no property section) — not a keep
				if (!list[i][1] || !list[i][1].length) {
					continue;
				}

				if (eval(list[i][1])) {
					return true;
				}
			} catch (e) {
				// bad nip line — skip
			}
		}

		return false;
	},

	// Identified magic/rare junk → cube with key → Jewel Fragments (PD2)
	isJunkJewel: function (unit) {
		if (!unit || !this.isJewel(unit)) {
			return false;
		}

		// Need ID before judging mods
		if (!unit.getFlag(0x10)) {
			return false;
		}

		// Magic / rare only
		if (unit.quality !== 4 && unit.quality !== 6) {
			return false;
		}

		// Locked inv / reserved for cubing or crafting
		if (unit.location === 3 && typeof Storage !== "undefined" && Storage.Inventory &&
				Storage.Inventory.IsLocked(unit, Config.Inventory)) {
			return false;
		}

		if (typeof Cubing !== "undefined" && typeof Cubing.keepItem === "function" && Cubing.keepItem(unit)) {
			return false;
		}

		if (typeof CraftingSystem !== "undefined" && CraftingSystem.validGids &&
				CraftingSystem.validGids.indexOf(unit.gid) > -1) {
			return false;
		}

		return !this.isWantedJewel(unit);
	},

	// Ring (10) / amulet (12) — set/unique/crafted always; rares need nip/AutoEquip floors
	isKeepJewelry: function (unit) {
		return !!(unit && (unit.itemType === 10 || unit.itemType === 12) &&
			(unit.quality === 5 || unit.quality === 7 || unit.quality === 8));
	},

	// Gems for leveling cube recipes — match by code (stable); include PD2 stacks (*s)
	isLevelingGem: function (unit) {
		var code, t;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		// Glaive weapon is "glv" — must NOT match gem regex (flawless amethyst is "gzv")
		if (code === "glv" || code === "glvs") {
			return false;
		}

		// Javelins / amazon javelins are never gems
		t = unit.itemType;

		if (t === 44 || t === 88) {
			return false;
		}

		// chipped / flawed / normal / flawless / perfect + stacks
		// codes: gc*/gf*/gs*/gl*/gp* + gzv (flawless amethyst) + sk*
		if (/^g[cflpsz][vybgrw]s?$/.test(code) || /^sk[cfulz]s?$/.test(code)) {
			return true;
		}

		// NTIP types: gem0–gem4 = 93–97; PD2 stackgem/flawless/perfect = 128–130
		if (t >= 93 && t <= 97) {
			return true;
		}

		if (t >= 128 && t <= 130) {
			return true;
		}

		return false;
	},

	// Chipped / flawed / normal (cube ladder) — stop field-picking after lvl 18
	isLowTierGem: function (unit) {
		var code, t, name;

		if (!unit || !this.isLevelingGem(unit)) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		// Flawless / perfect codes — not low
		if (/^g[lpz][vybgrw]s?$/.test(code) || code === "gzv" || code === "gzvs" ||
				code === "skl" || code === "skls" || code === "skz" || code === "skzs") {
			return false;
		}

		// Chipped / flawed / normal codes
		if (/^g[cfs][vybgrw]s?$/.test(code) || code === "skc" || code === "skcs" ||
				code === "skf" || code === "skfs" || code === "sku" || code === "skus") {
			return true;
		}

		t = unit.itemType;

		// gem0–2 = chipped/flawed/standard; stackgem (128) treated as low
		if (t === 93 || t === 94 || t === 95 || t === 128) {
			return true;
		}

		// flawlessgem / perfectgem / stackflawless / stackperfect
		if (t === 96 || t === 97 || t === 129 || t === 130) {
			return false;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (/flawless|perfect/.test(name)) {
			return false;
		}

		if (/chipped|flawed/.test(name) || (/\bgem\b/.test(name) && !/flawless|perfect/.test(name))) {
			return true;
		}

		return false;
	},

	// Flawless+ always; low gems only while charlvl <= 18
	isWantedGem: function (unit) {
		if (!this.isLevelingGem(unit)) {
			return false;
		}

		if (me.charlvl > 18 && this.isLowTierGem(unit)) {
			return false;
		}

		return true;
	},

	isPotion: function (unit) {
		var code, name, kind;

		if (!unit) {
			return false;
		}

		// Only hp/mp/rv/stamina — never antidote (yps) / thawing (wms) as field picks
		if (typeof Town !== "undefined" && typeof Town.isPickablePotion === "function") {
			return Town.isPickablePotion(unit);
		}

		if (typeof Town !== "undefined" && typeof Town.potionKind === "function") {
			kind = Town.potionKind(unit);

			return kind === "hp" || kind === "mp" || kind === "rv" || kind === "vps";
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "yps" || code === "wms") {
			return false;
		}

		// Exact potion codes — never prefix (Military Pick "mpi" ≠ mana)
		if (/^hp[1-5]$/.test(code) || /^mp[1-5]$/.test(code) || code === "rvs" || code === "rvl" ||
				code === "vps") {
			return true;
		}

		if (this.isRejuv(unit)) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (name.indexOf("antidote") > -1 || name.indexOf("thawing") > -1) {
			return false;
		}

		return name.indexOf("healing") > -1 || name.indexOf("mana") > -1 || name.indexOf("stamina") > -1 ||
			name.indexOf("rejuv") > -1;
	},

	// Prefer code/classid/name — do not treat every itemType 78 as rejuv if code is clearly hp/mp/etc.
	isRejuv: function (unit) {
		var code, name;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code.indexOf("rv") === 0) {
			return true;
		}

		// Explicit non-rejuv potion codes (lab: 530/531 are vps/yps)
		if (/^hp[1-5]$/.test(code) || /^mp[1-5]$/.test(code) || code === "vps" || code === "yps" || code === "wms") {
			return false;
		}

		if (this.rejuvClassids.indexOf(unit.classid) > -1) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (name.indexOf("rejuvenation") > -1 || (name.indexOf("rejuv") > -1 && name.indexOf("potion") > -1)) {
			return true;
		}

		// PD2 rejuv itemType is 78 (rpot); 79 is stamina
		return unit.itemType === 78;
	},

	countRejuvsInInv: function () {
		var n = 0,
			potion = me.getItem(-1, 0);

		if (potion) {
			do {
				if (potion.mode === 0 && potion.location === 3 && this.isRejuv(potion)) {
					n += 1;
				}
			} while (potion.getNext());
		}

		return n;
	},

	pickItems: function () {
		var status, item, canFit,
			needMule = false,
			pickList = [];

		Town.clearBelt();

		if (me.dead) {
			return false;
		}

		while (!me.idle) {
			delay(40);
		}

		item = getUnit(4);

		if (item) {
			do {
				if ((item.mode === 3 || item.mode === 5) && getDistance(me, item) <= Config.PickRange) {
					pickList.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		while (pickList.length > 0) {
			if (me.dead) {
				return false;
			}

			pickList.sort(this.sortItems);

			// Check if the item unit is still valid and if it's on ground or being dropped
			if (copyUnit(pickList[0]).x !== undefined && (pickList[0].mode === 3 || pickList[0].mode === 5) &&
					(Pather.useTeleport || me.inTown || !checkCollision(me, pickList[0], 0x1))) { // Don't pick items behind walls/obstacles when walking
				// Check if the item should be picked
				status = this.checkItem(pickList[0]);

				// Potions / sell junk skip autoEquipCheck (tiered nip otherwise leaves blues/yellows on ground)
				// Potions: allow when canPick+want even if nip/check result was 0 (PD2 id shifts)
				if ((status.result || this.isPotion(pickList[0]) || this.isRejuv(pickList[0]) ||
						this.isJewel(pickList[0]) || this.isKeepJewelry(pickList[0]) || this.isWantedGem(pickList[0])) &&
					this.canPick(pickList[0]) && this.wantToPick(pickList[0], status)) {
					// Override canFit for scrolls, potions and gold
					canFit = Storage.Inventory.CanFit(pickList[0]) || [4, 22, 76, 77, 78].indexOf(pickList[0].itemType) > -1 || this.isPotion(pickList[0]);

					// Try to make room with FieldID
					if (!canFit && Config.FieldID && Town.fieldID()) {
						canFit = Storage.Inventory.CanFit(pickList[0]) || [4, 22, 76, 77, 78].indexOf(pickList[0].itemType) > -1 || this.isPotion(pickList[0]);
					}

					// Try to make room by selling items in town
					if (!canFit) {
						// Never TP for inventory while LifeChicken should quit
						if (Pather.atLifeChicken && Pather.atLifeChicken()) {
							return false;
						}

						// Check if any of the current inventory items can be stashed or need to be identified and eventually sold to make room
						if (this.canMakeRoom()) {
							print("ÿc7Trying to make room for " + this.itemColor(pickList[0]) +
								(pickList[0].name || ((pickList[0].code || "?") + "#" + pickList[0].classid)));

							// Go to town and do town chores
							if (Town.visitTown()) {
								// Recursive check after going to town. We need to remake item list because gids can change.
								// Called only if room can be made so it shouldn't error out or block anything.

								return this.pickItems();
							}

							// Town visit failed - abort
							print("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

							return false;
						}

						// Can't make room - trigger automule
						Misc.itemLogger("No room for", pickList[0]);
						print("ÿc7Not enough room for " + this.itemColor(pickList[0]) + pickList[0].name);

						needMule = true;
					}

					// Item can fit - pick it up
					if (canFit) {
						this.pickItem(pickList[0], status.result, status.line);
					}
				}
			}

			pickList.shift();
		}

		// Quit current game and transfer the items to mule
		if (needMule && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo") && AutoMule.getMuleItems().length > 0) {
			scriptBroadcast("mule");
			scriptBroadcast("quit");
		}

		return true;
	},

	// Check if we can even free up the inventory
	canMakeRoom: function () {
		if (!Config.MakeRoom) {
			return false;
		}

		var i,
			items = Storage.Inventory.Compare(Config.Inventory);

		if (items) {
			for (i = 0; i < items.length; i += 1) {
				switch (this.checkItem(items[i]).result) {
				case -1: // Item needs to be identified
					// For low level chars that can't actually get id scrolls -> prevent an infinite loop
					if (me.getStat(14) + me.getStat(15) < 100) {
						return false;
					}

					return true;
				case 0:
					break;
				default: // Check if a kept item can be stashed
					if (Town.canStash(items[i])) {
						return true;
					}

					break;
				}
			}
		}

		return false;
	},

	// PD2 Telekinesis pickup ONLY: gold, scrolls, keys, potions (not arrows/bolts; not near packs)
	// Gate: lvl 14+ (early game — walk-pick only; Duriel orifice TK is separate)
	canTelekinesisPick: function (unit) {
		var t, code, dist, mon;

		if (!unit || !Config.UseTelekinesis || me.classid !== 1 || me.charlvl < 14) {
			return false;
		}

		if (!(me.getSkill(43, 1) || me.getSkill(43, 0) || me.getStat(97, 43))) {
			return false;
		}

		t = unit.itemType;
		code = unit.code ? String(unit.code).toLowerCase() : "";

		// PD2: TK no longer picks arrows/bolts
		if (t === 5 || t === 6) {
			return false;
		}

		// NM/Hell: no TK on ID/TP scrolls
		if (me.diff > 0 && (code === "isc" || code === "tsc" || t === 22)) {
			return false;
		}

		// Gold (4 / gld), scroll (22), key (41), hp/mp/rv/stamina only — not antidote/thawing
		if (!(t === 4 || t === 22 || t === 41 || (t >= 76 && t <= 79) ||
				code === "gld" || code === "key" || code === "tsc" || code === "isc" ||
				/^hp[1-5]$/.test(code) || /^mp[1-5]$/.test(code) || code === "rvs" || code === "rvl" ||
				code === "vps" ||
				unit.classid === 523 || unit.classid === 540)) {
			return false;
		}

		// Tiny gold piles — don't TK (often filter-hidden; looks like casting at nothing)
		if (this.isGoldPile(unit) && this.goldPileAmount(unit) < this.minGoldPile()) {
			return false;
		}

		dist = getDistance(me, unit);

		// Close enough to walk-click — skip TK; too far / blocked — skip
		if (dist <= 3 || dist >= 25 || checkCollision(me, unit, 0x4)) {
			return false;
		}

		// PD2 TK deals lightning + knockback — don't cast near monsters (looks like attacking)
		mon = getUnit(1);

		if (mon) {
			do {
				if (Attack.checkMonster(mon) && getDistance(mon, unit) < 10) {
					return false;
				}
			} while (mon.getNext());
		}

		return true;
	},

	pickItem: function (unit, status, keptLine) {
		if (!unit) {
			return false;
		}

		function ItemStats(unit) {
			var rawName = unit.name ? String(unit.name) : "";

			this.ilvl = unit.ilvl;
			this.type = unit.itemType;
			this.classid = unit.classid;
			this.code = unit.code ? String(unit.code).toLowerCase() : "";
			// Strip color codes; quest items on PD2 often have empty name until UI refresh
			this.name = rawName.replace(/ÿc[0-9a-z]/gi, "").replace(/^\s+|\s+$/g, "");
			this.color = Pickit.itemColor(unit);
			this.gold = unit.getStat(14);
			this.useTk = Pickit.canTelekinesisPick(unit);
			this.picked = false;
		}

		function pickLabel(stats) {
			if (stats.name) {
				return stats.name;
			}

			if (stats.code) {
				return stats.code + "#" + (stats.classid !== undefined && stats.classid !== null ? stats.classid : "?");
			}

			return "?" + "#" + (stats.classid !== undefined && stats.classid !== null ? stats.classid : "?");
		}

		var i, item, tick, gid, stats, code,
			itemCount = me.itemcount;

		if (unit.gid) {
			gid = unit.gid;
			item = getUnit(4, -1, -1, gid);
		}

		if (!item) {
			return false;
		}

		stats = new ItemStats(item);

MainLoop:
		for (i = 0; i < 3; i += 1) {
			if (!getUnit(4, -1, -1, gid)) {
				break MainLoop;
			}

			if (me.dead) {
				return false;
			}

			while (!me.idle) {
				delay(40);
			}

			if (item.mode !== 3 && item.mode !== 5) {
				break MainLoop;
			}

			if (stats.useTk) {
				if (typeof Skill.castTelekinesis === "function") {
					Skill.castTelekinesis(item);
				} else {
					Skill.cast(43, 0, item);
				}
			} else {
				if (getDistance(me, item) > (Config.FastPick === 2 && i < 1 ? 6 : 4) || checkCollision(me, item, 0x1)) {
					if (Pather.useTeleport) {
						Pather.moveToUnit(item);
					} else if (!Pather.moveTo(item.x, item.y, 0)) {
						continue MainLoop;
					}
				}

				if (Config.FastPick < 2) {
					Misc.click(0, 0, item);
				} else {
					sendPacket(1, 0x16, 4, 0x4, 4, item.gid, 4, 0);
				}
			}

			tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				item = copyUnit(item);

				if (stats.classid === 523 || stats.classid === 540 || stats.code === "gld" || stats.type === 4) {
					if (!item.getStat(14) || item.getStat(14) < stats.gold) {
						print("ÿc7Picked up " + stats.color + (item.getStat(14) ? (item.getStat(14) - stats.gold) : stats.gold) + " Gold");

						return true;
					}
				}

				if (item.mode !== 3 && item.mode !== 5) {
					code = item.code ? String(item.code).toLowerCase() : "";

					// Keys by code only — PD2 classid 543 is aqv (arrows), not keys (560)
					if (code === "key") {
						print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" + Town.checkKeys() + "/12)");

						return true;
					}

					if (code === "tsc" || code === "isc") {
						print("ÿc7Picked up " + stats.color + stats.name + " ÿc7(" +
							Town.scrollFillCount(code) + "/20)");

						return true;
					}

					break MainLoop;
				}

				delay(20);
			}

			// TK failed, disable it
			stats.useTk = false;

			//print("pick retry");
		}

		stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

		// Gold leaves no inventory item — detect by gid gone
		if (!stats.picked && (stats.code === "gld" || stats.type === 4) && !getUnit(4, -1, -1, gid)) {
			print("ÿc7Picked up " + stats.color + (stats.gold || "?") + " Gold");

			return true;
		}

		if (stats.picked) {
			DataFile.updateStats("lastArea");

			switch (status) {
			case 1:
				print("ÿc7Picked up " + stats.color + pickLabel(stats) +
					" ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

				// Merc upgrades stay in inventory until Town.doChores (openStash → goToTown)

				if (this.ignoreLog.indexOf(stats.type) === -1) {
					Misc.itemLogger("Kept", item);

					if (["pk1", "pk2", "pk3"].indexOf(item.code) > -1 && !TorchSystem.LogKeys) {
						break;
					}

					if (["dhn", "bey", "mbr"].indexOf(item.code) > -1 && !TorchSystem.LogOrgans) {
						break;
					}

					if (["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "r10", "r11", "r12", "r13", "r14"].indexOf(item.code) > -1 && !Config.ShowLowRunes) {
						break;
					}

					if (["r15", "r16", "r17", "r18", "r19", "r20", "r21", "r22", "r23"].indexOf(item.code) > -1 && !Config.ShowMiddleRunes) {
						break;
					}

					if (["r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32", "r33"].indexOf(item.code) > -1 && !Config.ShowHighRunes) {
						break;
					}

					if (["gcv", "gcy", "gcb", "gcg", "gcr", "gcw", "skc", "gfv", "gfy", "gfb", "gfg", "gfr", "gfw", "skf", "gsv", "gsy", "gsb", "gsg", "gsr", "gsw", "sku"].indexOf(item.code) > -1 && !Config.ShowLowGems) {
						break;
					}

					if (["gzv", "gly", "glb", "glg", "glr", "glw", "skl", "gpv", "gpy", "gpb", "gpg", "gpr", "gpw", "skz"].indexOf(item.code) > -1 && !Config.ShowHighGems) {
						break;
					}

					Misc.logItem("Kept", item, keptLine);
				}

				break;
			case 2:
				print("ÿc7Picked up " + stats.color + pickLabel(stats) + " ÿc0(ilvl " + stats.ilvl + ")" + " (Cubing)");
				Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
				Cubing.update();

				break;
			case 3:
				print("ÿc7Picked up " + stats.color + pickLabel(stats) + " ÿc0(ilvl " + stats.ilvl + ")" + " (Runewords)");
				Misc.itemLogger("Kept", item, "Runewords");
				Runewords.update(stats.classid, gid);

				break;
			case 5: // Crafting System
				print("ÿc7Picked up " + stats.color + pickLabel(stats) + " ÿc0(ilvl " + stats.ilvl + ")" + " (Crafting System)");
				CraftingSystem.update(item);

				break;
			default:
				print("ÿc7Picked up " + stats.color + pickLabel(stats) + " ÿc0(ilvl " + stats.ilvl + (keptLine ? ") (" + keptLine + ")" : ")"));

				break;
			}
		}

		return true;
	},

	itemQualityToName: function (quality) {
		var qualNames = ["", "lowquality", "normal", "superior", "magic", "set", "rare", "unique", "crafted"];

		return qualNames[quality];
	},

	itemColor: function (unit, type) {
		if (type === undefined) {
			type = true;
		}

		if (type) {
			switch (unit.itemType) {
			case 4: // gold
				return "ÿc4";
			case 74: // LoD runes
			case 138: // PD2 rune stacks
				return "ÿc8";
			case 75: // PD2 sometimes uses 75 for runes — but LoD circlets are also 75
				if (this.isRuneItem(unit)) {
					return "ÿc8";
				}

				break;
			case 76: // PD2 healing
				return "ÿc1";
			case 77: // PD2 mana
				return "ÿc3";
			case 78: // PD2 rejuv
				return "ÿc;";
			}
		}

		switch (unit.quality) {
		case 4: // magic
			return "ÿc3";
		case 5: // set
			return "ÿc2";
		case 6: // rare
			return "ÿc9";
		case 7: // unique
			return "ÿc4";
		case 8: // crafted
			return "ÿc8";
		}

		return "ÿc0";
	},

	canPick: function (unit) {
		var tome, charm, i, potion, needPots, buffers, pottype, myKey, key, code, potKind;

		// Cain lore Horadric Scroll (tr1) — never pick (not Lam Esen bbb)
		if (typeof QuestItems !== "undefined" && typeof QuestItems.isHoradricScroll === "function" &&
				QuestItems.isHoradricScroll(unit)) {
			return false;
		}

		code = unit && unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "tr1") {
			return false;
		}

		// Quest: skip only if we already hold the same code (classid alone false-hits on PD2)
		if (typeof QuestItems !== "undefined" && QuestItems.isQuestItem(unit)) {
			if (unit.code && me.getItem(unit.code)) {
				return false;
			}

			if (!unit.code && unit.classid !== undefined && me.getItem(unit.classid)) {
				return false;
			}

			return true;
		}

		// Antidote / thawing — never field pick (even if itemType shifted)
		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "yps" || code === "wms" || unit.itemType === 80 || unit.itemType === 81 ||
				(typeof Town !== "undefined" && Town.potionKind &&
					(Town.potionKind(unit) === "yps" || Town.potionKind(unit) === "wms"))) {
			return false;
		}

		// Gold piles (PD2: code gld, may not always be itemType 4)
		if (this.isGoldPile(unit)) {
			if (me.getStat(14) === me.getStat(12) * 10000) {
				return false;
			}

			return this.goldPileAmount(unit) >= this.minGoldPile();
		}

		switch (unit.classid) {
		case 92: // Staff of Kings
		case 173: // Khalim's Flail
		case 521: // Viper Amulet (LoD)
		case 546: // Jade Figurine (LoD)
		case 549: // Cube (LoD)
		case 551: // Mephisto's Soulstone (LoD)
		case 552: // Book of Skill (LoD)
		case 553: // Khalim's Eye (LoD)
		case 554: // Khalim's Heart (LoD)
		case 555: // Khalim's Brain (LoD)
			if (me.getItem(unit.classid)) {
				return false;
			}

			break;
		}

		// Rejuvs — fill "rv" belt columns first, else keep up to Config.RejuvBuffer in inventory
		if (this.isRejuv(unit)) {
			needPots = 0;

			for (i = 0; i < 4; i += 1) {
				if (Config.BeltColumn[i] === "rv") {
					needPots += this.beltSize;
				}
			}

			potion = me.getItem(-1, 2);

			if (potion) {
				do {
					if (potion.mode === 2 && this.isRejuv(potion)) {
						needPots -= 1;
					}
				} while (potion.getNext());
			}

			// Belt has room for rejuvs
			if (needPots >= 1) {
				return true;
			}

			// No rv column / belt full: inventory buffer (default max 8 on PD2 sorc configs)
			if (Config.RejuvBuffer > 0) {
				i = this.countRejuvsInInv();

				return i < Config.RejuvBuffer;
			}

			return false;
		}

		switch (unit.itemType) {
		case 4: // Gold
			if (me.getStat(14) === me.getStat(12) * 10000) { // Check current gold vs max capacity (cLvl*10000)
				return false; // Skip gold if full
			}

			if (this.goldPileAmount(unit) < this.minGoldPile()) {
				return false;
			}

			break;
		case 22: // Scroll
			code = unit.code ? String(unit.code).toLowerCase() : "";

			// NM/Hell: vendor fills tomes — ignore ground ID/TP scrolls
			if (me.diff > 0 && (code === "isc" || code === "tsc" || unit.classid === 546 || unit.classid === 547)) {
				return false;
			}

			// ID scrolls: only Normal pre-Cain (checkItem early-isc), max 2 already gated there
			if (code === "isc") {
				if (me.getQuest(4, 0) || me.getQuest(4, 1)) {
					return false;
				}

				break; // inventory room check below
			}

			// TP scrolls only (tsc) — Normal: fill tome if room
			if (code === "tsc" || unit.classid === 546) {
				tome = me.getItem("tbk", 0) || me.getItem(535, 0);
			} else {
				return false; // unknown scroll type
			}

			if (tome) {
				do {
					if (tome.location === 3 && tome.getStat(70) === 20) {
						return false; // Skip a scroll if its tome is full
					}
				} while (tome.getNext());
			} else {
				return false; // Don't pick scrolls if there's no matching tome
			}

			break;
		case 41: // Key (new 26.1.2013)
			if (me.classid === 6) { // Assassins don't ever need keys
				return false;
			}

			myKey = me.getItem("key") || me.getItem(560, 0);
			key = getUnit(4, -1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

			if (myKey && key) {
				do {
					if (myKey.location === 3 && myKey.getStat(70) + key.getStat(70) > 12) {
						return false;
					}
				} while (myKey.getNext());
			}

			break;
		case 82: // Small Charm (cm1)
		case 83: // Large Charm (cm2)
		case 84: // Grand Charm (cm3)
		case 85: // legacy / shifted grand — keep handling
			if (unit.quality === 7) { // Unique
				charm = me.getItem(unit.classid, 0);

				if (charm) {
					do {
						if (charm.quality === 7) {
							return false; // Skip Gheed's Fortune, Hellfire Torch or Annihilus if we already have one
						}
					} while (charm.getNext());
				}
			}

			break;
		case 76: // PD2 Healing (hpot)
		case 77: // PD2 Mana (mpot)
			needPots = 0;
			code = unit.code ? String(unit.code).toLowerCase() : "";
			potKind = (typeof Town !== "undefined" && typeof Town.potionKind === "function") ?
				Town.potionKind(unit) :
				(/^hp[1-5]$/.test(code) ? "hp" : (/^mp[1-5]$/.test(code) ? "mp" : false));

			if (potKind !== "hp" && potKind !== "mp") {
				return false;
			}

			for (i = 0; i < 4; i += 1) {
				if (Config.BeltColumn[i] === potKind) {
					needPots += this.beltSize;
				}
			}

			potion = me.getItem(-1, -1);

			if (potion) {
				do {
					if ((potion.mode === 2 || potion.location === 2) &&
							typeof Town !== "undefined" && Town.potionKind(potion) === potKind) {
						needPots -= 1;
					}
				} while (potion.getNext());
			}

			if (needPots < 1 && this.checkBelt()) {
				buffers = ["HPBuffer", "MPBuffer"];

				for (i = 0; i < buffers.length; i += 1) {
					if (Config[buffers[i]] && ((buffers[i] === "HPBuffer" && potKind === "hp") ||
							(buffers[i] === "MPBuffer" && potKind === "mp"))) {
						if (!Storage.Inventory.CanFit(unit)) {
							return false;
						}

						needPots = Config[buffers[i]];
						potion = me.getItem(-1, -1);

						if (potion) {
							do {
								if (potion.location === 3 && potion.mode !== 2 &&
										typeof Town !== "undefined" && Town.potionKind(potion) === potKind) {
									needPots -= 1;
								}
							} while (potion.getNext());
						}
					}
				}
			}

			if (needPots < 1) {
				potion = me.getItem(-1, -1);

				if (potion) {
					do {
						if (((potion.mode === 0 && potion.location === 3) || potion.mode === 2 || potion.location === 2) &&
								typeof Town !== "undefined" && Town.potionKind(potion) === potKind) {
							// Prefer drinking lower-tier by code digit when classid is unreliable
							if ((potion.code && unit.code && String(potion.code) < String(unit.code)) ||
									potion.classid < unit.classid) {
								potion.interact();
								needPots += 1;

								break;
							}
						}
					} while (potion.getNext());
				}
			}

			if (needPots < 1) {
				return false;
			}

			break;
		case 78: // PD2 Rejuv (rpot) — handled by isRejuv above; never treat as stamina
			if (this.isRejuv(unit)) {
				break;
			}

			return false;
		case 79: // PD2 Stamina (spot)
			if (this.isRejuv(unit)) {
				break;
			}

			// Stamina — inventory buffer only (no belt column)
			if (!Config.StaminaBuffer || !Config.StaminaUntilLevel || me.charlvl >= Config.StaminaUntilLevel) {
				return false;
			}

			if (!Storage.Inventory.CanFit(unit)) {
				return false;
			}

			needPots = Config.StaminaBuffer;
			potion = me.getItem(-1, 0);

			if (potion) {
				do {
					if (potion.location === 3 && (String(potion.code || "").toLowerCase() === "vps" || potion.itemType === 79)) {
						needPots -= 1;
					}
				} while (potion.getNext());
			}

			if (needPots < 1) {
				return false;
			}

			break;
		case 80: // Antidote — Andy shop prep only, never field pick
		case 81: // Thawing — Duriel shop prep only, never field pick
			return false;
		case undefined: // Yes, it does happen
			print("undefined item (!?)");

			return false;
		}

		return true;
	},

	checkBelt: function () {
		var check = 0,
			item = me.getItem(-1, 2);

		if (item) {
			do {
				if (item.x < 4) {
					check += 1;
				}
			} while (item.getNext());
		}

		return check === 4;
	},

	// Just sort by distance for general item pickup
	sortItems: function (unitA, unitB) {
		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	// Prioritize runes and unique items for fast pick
	sortFastPickItems: function (unitA, unitB) {
		if (this.isRuneItem(unitA) || unitA.quality === 7) {
			return -1;
		}

		if (this.isRuneItem(unitB) || unitB.quality === 7) {
			return 1;
		}

		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	fastPick: function () {
		var item, gid, status, ignored,
			itemList = [];

		while (this.gidList.length > 0) {
			gid = this.gidList.shift();
			item = getUnit(4, -1, -1, gid);

			if (!item || (item.mode !== 3 && item.mode !== 5) || getDistance(me, item) > Config.PickRange) {
				continue;
			}

			// ignoredItemTypes = "don't stash" — NOT "don't pick". Always allow potions.
			ignored = Town.ignoredItemTypes.indexOf(item.itemType) > -1 && !this.isPotion(item) && !this.isRejuv(item);

			if (ignored) {
				continue;
			}

			itemList.push(copyUnit(item));
		}

		while (itemList.length > 0) {
			itemList.sort(this.sortFastPickItems);

			item = copyUnit(itemList.shift());

			// Check if the item unit is still valid
			if (item.x !== undefined) {
				status = this.checkItem(item);

				if ((status.result || this.isPotion(item) || this.isRejuv(item) ||
						this.isJewel(item) || this.isKeepJewelry(item) || this.isWantedGem(item)) &&
					this.canPick(item) && this.wantToPick(item, status) &&
						(Storage.Inventory.CanFit(item) || [4, 22, 76, 77, 78].indexOf(item.itemType) > -1 || this.isPotion(item))) {
					this.pickItem(item, status.result, status.line);
				}
			}
		}

		return true;
	}
};