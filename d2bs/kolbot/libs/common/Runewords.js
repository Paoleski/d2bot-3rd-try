/**
*	@filename	Runewords.js
*	@author		kolton
*	@desc		make and reroll runewords
*/

// TODO: Config.Runewords[i][0] can be false, but array methods can be used on it

var Runeword = {
	// PD2: all recipes use Misc.txt rune classids (El=628 … Zod=660).
	// Vanilla LoD was 610–642 (+18). Do not mix eras in one recipe.

	// 1.09
	AncientsPledge: [635, 636, 634], // Ral + Ort + Tal
	Black: [637, 643, 631], // Thul + Io + Nef
	Fury: [658, 652, 632], // Jah + Gul + Eth
	HolyThunder: [632, 635, 636, 634], // Eth + Ral + Ort + Tal
	Honor: [638, 628, 633, 630, 639], // Amn + El + Ith + Tir + Sol
	KingsGrace: [638, 635, 637], // Amn + Ral + Thul
	Leaf: [630, 635], // Tir + Ral
	Lionheart: [642, 644, 646], // Hel + Lum + Fal
	Lore: [636, 639], // Ort + Sol
	Malice: [633, 628, 632], // Ith + El + Eth
	Melody: [640, 645, 631], // Shael + Ko + Nef
	Memory: [644, 643, 639, 632], // Lum + Io + Sol + Eth
	Nadir: [631, 630], // Nef + Tir
	Radiance: [631, 639, 633], // Nef + Sol + Ith
	Rhyme: [640, 632], // Shael + Eth
	Silence: [641, 629, 642, 651, 630, 653], // Dol + Eld + Hel + Ist + Tir + Vex
	Smoke: [631, 644], // Nef + Lum
	Stealth: [634, 632], // Tal + Eth
	Steel: [630, 628], // Tir + El
	Strength: [638, 630], // Amn + Tir
	Purity: [638, 632, 637], // Amn + Eth + Thul (PD2 — 3os spear/polearm merc stick)
	Venom: [634, 641, 650], // Tal + Dol + Mal
	Wealth: [647, 645, 630], // Lem + Ko + Tir
	White: [641, 643], // Dol + Io
	Zephyr: [636, 632], // Ort + Eth

	// 1.10
	Beast: [657, 630, 649, 650, 644], // Ber + Tir + Um + Mal + Lum
	Bramble: [635, 654, 656, 632], // Ral + Ohm + Sur + Eth
	BreathoftheDying: [653, 642, 628, 629, 660, 632], // Vex + Hel + El + Eld + Zod + Eth
	CallToArms: [638, 635, 650, 651, 654], // Amn + Ral + Mal + Ist + Ohm
	ChainsofHonor: [641, 649, 657, 651], // Dol + Um + Ber + Ist
	Chaos: [646, 654, 649], // Fal + Ohm + Um
	CrescentMoon: [640, 649, 630], // Shael + Um + Tir
	Delirium: [647, 651, 643], // Lem + Ist + Io
	Doom: [642, 654, 649, 655, 659], // Hel + Ohm + Um + Lo + Cham
	Duress: [640, 649, 637], // Shael + Um + Thul
	Enigma: [658, 633, 657], // Jah + Ith + Ber
	Eternity: [638, 657, 651, 639, 656], // Amn + Ber + Ist + Sol + Sur
	Exile: [653, 654, 651, 641], // Vex + Ohm + Ist + Dol
	Famine: [646, 654, 636, 658], // Fal + Ohm + Ort + Jah
	Gloom: [646, 649, 648], // Fal + Um + Pul
	HandofJustice: [656, 659, 638, 655], // Sur + Cham + Amn + Lo
	HeartoftheOak: [645, 653, 648, 637], // Ko + Vex + Pul + Thul
	Kingslayer: [650, 649, 652, 646], // Mal + Um + Gul + Fal
	Passion: [641, 636, 629, 647], // Dol + Ort + Eld + Lem
	Prudence: [650, 630], // Mal + Tir
	Sanctuary: [645, 645, 650], // Ko + Ko + Mal
	Splendor: [632, 644], // Eth + Lum
	Stone: [640, 649, 648, 644], // Shael + Um + Pul + Lum
	Wind: [656, 628], // Sur + El

	// Ladder / late — always available on PD2 (realm is ladder-like)
	Brand: [658, 655, 650, 652], // Jah + Lo + Mal + Gul
	Death: [642, 628, 653, 636, 652], // Hel + El + Vex + Ort + Gul
	Destruction: [653, 655, 657, 658, 645], // Vex + Lo + Ber + Jah + Ko
	Dragon: [656, 655, 639], // Sur + Lo + Sol
	Dream: [643, 658, 648], // Io + Jah + Pul
	Edge: [630, 634, 638], // Tir + Tal + Amn
	Faith: [654, 658, 647, 629], // Ohm + Jah + Lem + Eld
	Fortitude: [628, 639, 641, 655], // El + Sol + Dol + Lo
	Grief: [632, 630, 655, 650, 635], // Eth + Tir + Lo + Mal + Ral
	Harmony: [630, 633, 639, 645], // Tir + Ith + Sol + Ko
	Ice: [638, 640, 658, 655], // Amn + Shael + Jah + Lo
	"Infinity": [657, 650, 657, 651], // Ber + Mal + Ber + Ist
	Insight: [635, 630, 634, 639], // Ral + Tir + Tal + Sol
	LastWish: [658, 650, 658, 656, 658, 657], // Jah + Mal + Jah + Sur + Jah + Ber
	Lawbringer: [638, 647, 645], // Amn + Lem + Ko
	Oath: [640, 648, 650, 644], // Shael + Pul + Mal + Lum
	Obedience: [642, 645, 637, 632, 646], // Hel + Ko + Thul + Eth + Fal
	Phoenix: [653, 653, 655, 658], // Vex + Vex + Lo + Jah
	Pride: [659, 656, 643, 655], // Cham + Sur + Io + Lo
	Rift: [642, 645, 647, 652], // Hel + Ko + Lem + Gul
	Spirit: [634, 637, 636, 638], // Tal + Thul + Ort + Amn
	VoiceofReason: [647, 645, 628, 629], // Lem + Ko + El + Eld
	Wrath: [648, 644, 657, 650], // Pul + Lum + Ber + Mal

	// 1.11
	Bone: [639, 649, 649], // Sol + Um + Um
	Enlightenment: [648, 635, 639], // Pul + Ral + Sol
	Myth: [642, 638, 631], // Hel + Amn + Nef
	Peace: [640, 637, 638], // Shael + Thul + Amn
	Principle: [635, 652, 629], // Ral + Gul + Eld
	Rain: [636, 650, 633], // Ort + Mal + Ith
	Treachery: [640, 637, 647], // Shael + Thul + Lem

	Test: [642, 642, 642] // Hel + Hel + Hel (placeholder)
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
		if (typeof CraftingSystem !== "undefined" && CraftingSystem.validGids &&
				CraftingSystem.validGids.indexOf(item.gid) > -1) {
			return false;
		}

		return true;
	},

	// Config.Runewords bases are often "Bone Helm" strings — resolve to classid
	// WARNING: LoD NTIPAliasClassID numbers can collide with PD2 live classids
	// (e.g. spikedshield=365 LoD vs PD2 scythe at 365). Prefer baseMatchesConfig / configBaseCode.
	resolveBaseClassid: function (base) {
		var key;

		if (typeof base === "number") {
			return base;
		}

		if (typeof base !== "string") {
			return -1;
		}

		key = base.replace(/\s+/g, "").toLowerCase();

		if (typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.hasOwnProperty(key)) {
			return NTIPAliasClassID[key];
		}

		return -1;
	},

	// LoD NTIP 3-letter item code for a Config.Runewords base name/number ("Spiked Shield" → "spk").
	// Never use the numeric LoD classid against unit.classid on PD2.
	configBaseCode: function (configBase) {
		var key, lodId, k, code = "";

		if (configBase === undefined || configBase === null) {
			return "";
		}

		if (typeof configBase === "number") {
			lodId = configBase;
		} else if (typeof configBase === "string") {
			key = configBase.replace(/\s+/g, "").toLowerCase();

			if (typeof NTIPAliasClassID === "undefined") {
				return "";
			}

			// Already a short code (spk, 9s8, kit, …)
			if (/^[a-z0-9]{3}$/i.test(key) && NTIPAliasClassID.hasOwnProperty(key)) {
				return key.toLowerCase();
			}

			if (!NTIPAliasClassID.hasOwnProperty(key)) {
				return "";
			}

			lodId = NTIPAliasClassID[key];
		} else {
			return "";
		}

		if (typeof NTIPAliasClassID === "undefined") {
			return "";
		}

		for (k in NTIPAliasClassID) {
			if (!NTIPAliasClassID.hasOwnProperty(k)) {
				continue;
			}

			if (NTIPAliasClassID[k] === lodId && /^[a-z0-9]{3}$/i.test(k)) {
				code = k.toLowerCase();
				break;
			}
		}

		return code;
	},

	// True if live unit is the configured base — match item.code, never LoD classid.
	// Fail closed when unit.code is empty (PD2 blank names / unid) so we don't grab a scythe as "spk".
	baseMatchesConfig: function (unit, configBase) {
		var want, have;

		if (!unit) {
			return false;
		}

		want = this.configBaseCode(configBase);

		if (!want) {
			return false;
		}

		have = unit.code ? String(unit.code).toLowerCase().replace(/\s+/g, "") : "";

		if (!have) {
			return false;
		}

		return have === want;
	},

	// Pretty name for a recipe array (Runeword.Rhyme → "Rhyme")
	recipeName: function (recipe) {
		var k, i, rw;

		if (!recipe || !recipe.length) {
			return "?";
		}

		for (k in Runeword) {
			if (!Runeword.hasOwnProperty(k)) {
				continue;
			}

			rw = Runeword[k];

			if (rw === recipe) {
				return k;
			}

			if (!rw || rw.length !== recipe.length) {
				continue;
			}

			for (i = 0; i < recipe.length; i += 1) {
				if (rw[i] !== recipe[i]) {
					break;
				}
			}

			if (i === recipe.length) {
				return k;
			}
		}

		return "RW";
	},

	// Inv (3) + stash (7) + cube (6).
	// openStashFirst=true walks to bank — only when caller needs stash pages visible.
	listStorageItems: function (openStashFirst) {
		if (openStashFirst === true && typeof Town !== "undefined" && typeof Town.openStash === "function") {
			if (!getUIFlag(0x19)) {
				Town.openStash();
				delay(80 + me.ping);
			}
		}

		return this.memo("storageList", this._listStorageItemsRaw);
	},

	_listStorageItemsRaw: function () {
		var item, list = [];

		item = me.getItem(-1, -1);

		if (!item) {
			return list;
		}

		do {
			if (item.location === 3 || item.location === 7 || item.location === 6) {
				list.push(copyUnit(item));
			}
		} while (item.getNext());

		return list;
	},

	// Short-lived memo for whole-storage scans (hasCompleted*, best empty bases, haveRunes).
	// Pickit.checkItem / Town.shouldStashItem / Item.isProtectedRWBase call these once per item,
	// so without this every item evaluation re-walked the whole inventory + stash (O(n²)).
	_memo: {},
	MEMO_TTL: 1500,

	memo: function (key, fn) {
		var now = getTickCount(), e, v;

		key += getUIFlag(0x19) ? ":s" : ":n";
		e = this._memo[key];

		if (e && now - e.t < this.MEMO_TTL) {
			return e.v;
		}

		v = fn.call(this);
		this._memo[key] = {t: now, v: v};

		return v;
	},

	// Call after anything that changes storage in a way the memo must see now (make, equip, cull, peel)
	invalidateCache: function () {
		this._memo = {};
	},

	// Diagnostic spam (Lore/Stealth diagnose, cull notes, helper status) — off unless Config.RunewordDebug
	dbg: function (line) {
		if (Config.RunewordDebug) {
			this.rwLog(line);
		}
	},

	// print once + pd2stack.log — do NOT print then Pd2Stack.log (that double-prints)
	rwLog: function (line) {
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.log === "function") {
			try {
				Pd2Stack.log(line);
				return;
			} catch (e) {}
		}

		print(line);
	},

	// Lab watch pause between RW steps (Config.RunewordWatchDelay) — only when RunewordDebug
	watchPause: function (tag) {
		var ms = Config.RunewordDebug ? (Config.RunewordWatchDelay || 0) : 0;

		if (!ms || ms < 1) {
			return;
		}

		if (tag) {
			this.rwLog("ÿc8RWÿc0 :: watch " + tag + " (" + ms + "ms)");
		}

		delay(ms);
	},

	// PD2: singles El–Zod ≈ 628–660. Stack classids DRIFT by season — do NOT use single+74
	// for matching (Ort single 636+74=710 collides with Sol stack 710 on this build).
	runeStackClassid: function (singleId) {
		if (singleId >= 628 && singleId <= 660) {
			return singleId + 74; // legacy hint only — runeMatchesClassid ignores collisions
		}

		return -1;
	},

	// True if unit looks like a rune (not jewels that sit in 628–660 classid holes)
	looksLikeRune: function (item) {
		var code, t;

		if (!item) {
			return false;
		}

		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.isRuneItem === "function") {
			return Pd2Stack.isRuneItem(item);
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		t = item.itemType;

		if (code === "jew" || t === 58 || t === 75) {
			return false;
		}

		if (/^r\d{2}[sg]?$/i.test(code)) {
			return true;
		}

		return t === 74 || t === 137 || t === 138 || t === 149 ||
			(t >= 164 && t <= 197);
	},

	// El=1 … Zod=33 from code / stack / type — never invent numbers for jewels
	runeNumberFromItem: function (item) {
		var code, m, id, t;

		if (!item) {
			return -1;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		t = item.itemType;

		// Jewels (code jew / type 58) sit on Jah's classid 658 — never a rune number
		if (code === "jew" || t === 58) {
			return -1;
		}

		m = code.match(/^r(\d{2})[sg]?$/i);

		if (m) {
			return parseInt(m[1], 10);
		}

		if (!this.looksLikeRune(item)) {
			return -1;
		}

		id = item.classid;

		// This PD2 season: stacks ≈ 698+n (El=699 … Sol=710 …) — verify via code when present
		if (id >= 699 && id <= 731) {
			return id - 698;
		}

		if (id >= 628 && id <= 660) {
			return id - 627;
		}

		// talrunegeneric=170 … elrunegeneric=164
		if (t >= 164 && t <= 196) {
			return t - 163;
		}

		return -1;
	},

	runeNumberFromSingleClassid: function (singleId) {
		if (singleId >= 628 && singleId <= 660) {
			return singleId - 627;
		}

		return -1;
	},

	runeSingleClassidFromNumber: function (num) {
		if (num >= 1 && num <= 33) {
			return 627 + num;
		}

		return -1;
	},

	runeMatchesClassid: function (item, recipeClassid) {
		var needNum, haveNum, code, pad, name, names;

		if (!item || recipeClassid === undefined || recipeClassid === null) {
			return false;
		}

		needNum = this.runeNumberFromSingleClassid(recipeClassid);

		if (needNum < 1) {
			return false;
		}

		// Exact single classid — only if it is actually a rune
		if (item.classid === recipeClassid && this.looksLikeRune(item)) {
			return true;
		}

		// Primary: rXX code / looksLikeRune number (avoids Ort+74 === Sol stack classid)
		haveNum = this.runeNumberFromItem(item);

		if (haveNum === needNum) {
			return true;
		}

		pad = (needNum < 10 ? "0" : "") + needNum;
		code = item.code ? String(item.code).toLowerCase() : "";

		if (code === ("r" + pad) || code === ("r" + pad + "s") || code === ("r" + pad + "g")) {
			return true;
		}

		// Last resort: spaced rune name (stash piles sometimes lack code briefly)
		if (!this.looksLikeRune(item) && item.itemType !== 137 && item.itemType !== 138) {
			return false;
		}

		names = ["el", "eld", "tir", "nef", "eth", "ith", "tal", "ral", "ort", "thul",
			"amn", "sol", "shael", "dol", "hel", "io", "lum", "ko", "fal", "lem",
			"pul", "um", "mal", "ist", "gul", "vex", "ohm", "lo", "sur", "ber", "jah", "cham", "zod"];
		name = (" " + ((item.name || "") + " " + (item.fname || "")).toLowerCase()
			.replace(/ÿc[0-9a-z]/gi, "").replace(/[^a-z0-9]+/g, " ") + " ");

		if (name.indexOf(" " + names[needNum - 1] + " ") === -1) {
			return false;
		}

		// Must look like a rune (avoid random gear with "sol"/"ort" substrings already spaced)
		return name.indexOf(" rune ") !== -1 ||
			item.itemType === 137 || item.itemType === 138 || item.itemType === 149 ||
			(item.itemType >= 164 && item.itemType <= 197) ||
			/^r\d{2}/.test(code);
	},

	// Items currently in the base's sockets (order = socket fill order)
	getSocketedItems: function (base) {
		var list = [], item;

		if (!base) {
			return list;
		}

		item = base.getItem();

		if (!item) {
			return list;
		}

		do {
			list.push(copyUnit(item));
		} while (item.getNext());

		return list;
	},

	// How many leading recipe runes are already socketed (Tal in, Eth next → 1).
	// Returns 0 if empty OR if socketed junk doesn't match the recipe prefix.
	socketedRecipePrefix: function (base, recipe) {
		var socks, i;

		if (!base || !recipe || !recipe.length) {
			return 0;
		}

		socks = this.getSocketedItems(base);

		if (!socks.length) {
			return 0;
		}

		if (socks.length > recipe.length) {
			return 0;
		}

		for (i = 0; i < socks.length; i += 1) {
			if (!this.runeMatchesClassid(socks[i], recipe[i])) {
				return 0;
			}
		}

		return socks.length;
	},

	// PD2 quantity — prefer shared helper
	runeQty: function (item) {
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.qty === "function") {
			return Pd2Stack.qty(item);
		}

		var q, name, m;

		if (!item) {
			return 0;
		}

		q = item.getStat(70) || 0;

		if (q > 0) {
			return q;
		}

		name = (item.name || "") + "\n" + (item.fname || "");
		m = String(name).match(/QTY\s*(\d+)/i);

		return m ? parseInt(m[1], 10) : 0;
	},

	// PD2: stacked/generic forms cannot go into sockets
	isPd2RuneStack: function (item) {
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.isStacked === "function") {
			return !!(item && Pd2Stack.isRuneItem(item) && Pd2Stack.isStacked(item));
		}

		var code, num, qty;

		if (!item) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		qty = this.runeQty(item);
		num = this.runeNumberFromItem(item);

		if (/^r\d{2}[sg]$/i.test(code)) {
			return true;
		}

		if ((item.itemType >= 164 && item.itemType <= 197) || item.itemType === 149) {
			return true;
		}

		if (qty > 1 && num > 0) {
			return true;
		}

		if (num > 0 && (item.itemType === 137 || item.itemType === 138 ||
				(item.classid >= 702 && item.classid <= 734))) {
			return true;
		}

		return false;
	},

	canSocketRune: function (item) {
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.canSocket === "function") {
			return Pd2Stack.canSocket(item);
		}

		var code, qty;

		if (!item || this.runeNumberFromItem(item) < 1) {
			return false;
		}

		if (this.isPd2RuneStack(item)) {
			return false;
		}

		qty = this.runeQty(item);

		if (qty > 1) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		if (!/^r\d{2}$/i.test(code)) {
			return false;
		}

		if ((item.itemType >= 164 && item.itemType <= 197) ||
				item.itemType === 137 || item.itemType === 138 || item.itemType === 149) {
			return false;
		}

		if (item.classid >= 702 && item.classid <= 734) {
			return false;
		}

		return true;
	},

	parkCursorItem: function () {
		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.parkCursor === "function") {
			return Pd2Stack.parkCursor();
		}

		var cursor;

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor) {
			return true;
		}

		if (Storage.Inventory.CanFit(cursor) && Storage.Inventory.MoveTo(cursor)) {
			return true;
		}

		if (Storage.Stash.CanFit(cursor) && Storage.Stash.MoveTo(cursor)) {
			return true;
		}

		me.cancel();
		delay(100 + me.ping);

		return !me.itemoncursor;
	},

	runeLogLabel: function (unit) {
		if (!unit) {
			return "?";
		}

		if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.itemLabel === "function") {
			return Pd2Stack.itemLabel(unit);
		}

		return String(unit.code || unit.classid || "?");
	},

	// Unstack via Pd2Stack — cube recipes are obsolete
	unstackOneRune: function (stack) {
		var item;

		if (!stack) {
			return false;
		}

		if (typeof Pd2Stack === "undefined" || typeof Pd2Stack.unstackOne !== "function") {
			print("ÿc1peel failÿc0 :: Pd2Stack missing");
			return false;
		}

		if (this.canSocketRune(stack)) {
			return copyUnit(stack);
		}

		item = Pd2Stack.unstackOne(stack);

		if (item && this.canSocketRune(item)) {
			return item;
		}

		print("ÿc1peel failÿc0 :: " + this.runeLogLabel(stack) +
			(item ? (" still not socketable") : " aborted"));
		return false;
	},

	// Pick recipe rune: prefer unstacked single, else PD2 stack/generic (unstack before socket)
	findRecipeRune: function (items, recipeClassid) {
		var k;

		for (k = 0; k < items.length; k += 1) {
			if (this.runeMatchesClassid(items[k], recipeClassid) && this.canSocketRune(items[k])) {
				return k;
			}
		}

		for (k = 0; k < items.length; k += 1) {
			if (this.runeMatchesClassid(items[k], recipeClassid)) {
				return k;
			}
		}

		return -1;
	},

	// True if inv/stash/cube holds every rune in the recipe (singles or PD2 stacks)
	haveRunes: function (runeIds, openStashFirst) {
		if (!runeIds || !runeIds.length) {
			return false;
		}

		if (openStashFirst === true) {
			return this._haveRunesRaw(runeIds, true);
		}

		return this.memo("haveRunes:" + runeIds.join(","), function () {
			return this._haveRunesRaw(runeIds, false);
		});
	},

	_haveRunesRaw: function (runeIds, openStashFirst) {
		var i, j, items, need;

		// Never walk — if stash UI is already open, loc 7 enumerates; else inv/cube only
		items = this.listStorageItems(openStashFirst === true);
		need = runeIds.slice();

		if (!items.length) {
			return false;
		}

		for (i = 0; i < items.length; i += 1) {
			if (!this.validItem(items[i])) {
				continue;
			}

			for (j = 0; j < need.length; j += 1) {
				if (this.runeMatchesClassid(items[i], need[j])) {
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

	// Debug: every Ort/Sol-like pile and why Lore recipe matching fails
	diagnoseLoreRunes: function () {
		var items, i, it, code, need, missing = [], label, locs = {3: 0, 6: 0, 7: 0},
			runeN = 0, num;

		items = this.listStorageItems(false);
		need = Runeword.Lore ? Runeword.Lore.slice() : [636, 639];

		this.rwLog("ÿc4RWÿc0 :: Lore runes — storageItems=" + items.length +
			" stashOpen=" + !!getUIFlag(0x19) +
			" need Ort(636)+Sol(639) haveRunes=" + this.haveRunes(need, false));

		for (i = 0; i < items.length; i += 1) {
			it = items[i];

			if (it.location === 3 || it.location === 6 || it.location === 7) {
				locs[it.location] += 1;
			}

			num = this.runeNumberFromItem(it);

			if (num < 1 && !this.runeMatchesClassid(it, 636) && !this.runeMatchesClassid(it, 639)) {
				continue;
			}

			runeN += 1;
			code = it.code ? String(it.code).toLowerCase() : "?";
			label = this.runeLogLabel(it);

			this.rwLog("ÿc4RWÿc0 :: Lore rune cand #" + runeN + " " + label +
				" id=" + it.classid + " code=" + code +
				" type=" + it.itemType + " qty=" + this.runeQty(it) +
				" stack=" + this.isPd2RuneStack(it) +
				" sock=" + this.canSocketRune(it) +
				" loc=" + it.location + " @" + it.x + "," + it.y +
				" valid=" + this.validItem(it) +
				" matchOrt=" + this.runeMatchesClassid(it, 636) +
				" matchSol=" + this.runeMatchesClassid(it, 639) +
				" runeNum=" + num);
		}

		this.rwLog("ÿc4RWÿc0 :: Lore runes — loc counts inv=" + locs[3] +
			" cube=" + locs[6] + " stash=" + locs[7] + " runeCands=" + runeN);

		for (i = 0; i < need.length; i += 1) {
			if (!this.haveRunes([need[i]], true)) {
				missing.push(need[i] === 636 ? "Ort" : (need[i] === 639 ? "Sol" : String(need[i])));
			}
		}

		if (missing.length) {
			this.rwLog("ÿc1RWÿc0 :: Lore runes — MISSING " + missing.join("+") +
				" (not found as single/stack in inv/stash/cube)");
		} else {
			this.rwLog("ÿc2RWÿc0 :: Lore runes — Ort+Sol both found");
		}
	},

	// Already wearing/stashing a finished Stealth (or other KeepRunewords armor match)
	hasCompletedArmorRuneword: function () {
		return this.memo("doneArmor", this._hasCompletedArmorRunewordRaw);
	},

	_hasCompletedArmorRunewordRaw: function () {
		var item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			if (this.itemLooksLikeStealthArmor(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Stealth armor: +20 FCR / +20 FHR runeword body armor (PD2). Name match by stats since the
	// nip #tier line can lag right after socketing (same class of bug as Spirit — see below).
	itemLooksLikeStealthArmor: function (item) {
		if (!item || item.itemType !== 3 || !item.getFlag(0x4000000)) {
			return false;
		}

		if (this.pickitEntries.length && NTIP.CheckItem(item, this.pickitEntries)) {
			return true;
		}

		return (item.getStat(105) || 0) >= 20 && (item.getStat(99) || 0) >= 20;
	},

	hasStealthRecipe: function () {
		var i, rw;

		if (!Runeword.Stealth || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && this.isStealthRecipe(rw[0])) {
				return true;
			}
		}

		return false;
	},

	isStealthRecipe: function (recipe) {
		return !!(recipe && recipe.length === 2 && Runeword.Stealth &&
			recipe[0] === Runeword.Stealth[0] && recipe[1] === Runeword.Stealth[1]);
	},

	isInsightRecipe: function (recipe) {
		return !!(recipe && recipe.length === 4 && Runeword.Insight &&
			recipe[0] === Runeword.Insight[0] && recipe[1] === Runeword.Insight[1] &&
			recipe[2] === Runeword.Insight[2] && recipe[3] === Runeword.Insight[3]);
	},

	isStrengthRecipe: function (recipe) {
		return !!(recipe && recipe.length === 2 && Runeword.Strength &&
			recipe[0] === Runeword.Strength[0] && recipe[1] === Runeword.Strength[1]);
	},

	hasStrengthRecipe: function () {
		var i, rw;

		if (!Runeword.Strength || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && this.isStrengthRecipe(rw[0])) {
				return true;
			}
		}

		return false;
	},

	// Strength = Amn+Tir → 25% CB (+ ED / LL). Knife for PS necro or spear/polearm for Act2 merc.
	itemLooksLikeStrength: function (item) {
		if (!item || !item.getFlag(0x4000000)) {
			return false;
		}

		// Crushing Blow 25 is Strength's signature (Steel is IAS, Insight is Meditation)
		return (item.getStat(136) || 0) >= 25;
	},

	mercHasStrength: function () {
		var item;

		if (typeof Item !== "undefined" && Item.getMercItem) {
			item = Item.getMercItem(4).item;

			if (item && this.itemLooksLikeStrength(item)) {
				return true;
			}
		}

		return false;
	},

	// Pull merc's empty 2os spear/polearm into inventory so getBase / socket can use it
	peelMercForStrength: function () {
		var eq, item, socks;

		if (!this.hasStrengthRecipe() || !this.haveRunes(Runeword.Strength, false)) {
			return false;
		}

		if (this.mercHasStrength()) {
			return false;
		}

		// Don't peel if merc already has Insight (4os) — that outranks Strength
		if (this.hasCompletedInsight && this.hasCompletedInsight()) {
			return false;
		}

		if (typeof Item === "undefined" || !Item.getMercItem || !Item.unequipMercSlot) {
			return false;
		}

		eq = Item.getMercItem(4);

		if (!eq || !eq.item) {
			return false;
		}

		item = eq.item;

		// Spear (33) or polearm (34) only — not javelin
		if (item.itemType !== 33 && item.itemType !== 34) {
			return false;
		}

		if (item.getFlag(0x4000000) || item.getFlag(0x400000)) {
			return false; // already RW or eth (we use NonEth Strength)
		}

		if (typeof Item.isRwBaseQuality === "function" && !Item.isRwBaseQuality(item)) {
			return false;
		}

		if (item.getItem()) {
			return false; // something already socketed
		}

		socks = item.getStat(194) || 0;

		if (typeof item.getStatEx === "function") {
			socks = Math.max(socks, item.getStatEx(194) || 0);
		}

		if (socks !== 2) {
			return false;
		}

		print("ÿc4RWÿc0 :: peeling merc 2os spear/polearm for Strength (Amn+Tir)");
		Item.unequipMercSlot(4, false);
		this.invalidateCache();
		delay(150 + me.ping);

		return true;
	},

	// True if merc weapon is empty 2os spear/polearm we can peel for Strength (no unequip yet)
	mercHasPeelableStrengthBase: function () {
		var eq, item, socks;

		if (this.mercHasStrength() || (this.hasCompletedInsight && this.hasCompletedInsight())) {
			return false;
		}

		if (typeof Item === "undefined" || !Item.getMercItem) {
			return false;
		}

		eq = Item.getMercItem(4);

		if (!eq || !eq.item) {
			return false;
		}

		item = eq.item;

		if (item.itemType !== 33 && item.itemType !== 34) {
			return false;
		}

		if (item.getFlag(0x4000000) || item.getFlag(0x400000) || item.getItem()) {
			return false;
		}

		if (typeof Item.isRwBaseQuality === "function" && !Item.isRwBaseQuality(item)) {
			return false;
		}

		socks = item.getStat(194) || 0;

		if (typeof item.getStatEx === "function") {
			socks = Math.max(socks, item.getStatEx(194) || 0);
		}

		return socks === 2;
	},

	// Chores should open stash to make Strength when Amn+Tir + empty 2os base (incl. on merc)
	needsStrengthMakeVisit: function () {
		var have, peel, base, ready;

		if (!Config.MakeRunewords || !this.hasStrengthRecipe()) {
			return false;
		}

		if (this.mercHasStrength() || (this.hasCompletedInsight && this.hasCompletedInsight()) ||
				(this.purityOutranksStrength && this.purityOutranksStrength())) {
			return false;
		}

		have = this.haveRunes(Runeword.Strength, false);
		peel = this.mercHasPeelableStrengthBase();
		base = this.getBestEmptyStrengthBaseNoPeel && this.getBestEmptyStrengthBaseNoPeel();
		ready = !!(have && (peel || base));

		// Once per game: if we have a spear banked but still not visiting, dump why
		if (!ready && !this._strengthVisitDiagnosed && !this._strengthDiagnosed) {
			this._strengthVisitDiagnosed = true;
			this._strengthDiagnosed = true;
			print("ÿc1RWÿc0 :: Strength needsVisit=false — haveAmnTir=" + have +
				" peelMerc=" + peel + " emptyBase=" + !!base +
				" (stash will not open for Strength alone)");
			this.diagnoseStrengthRunes();
			this.diagnoseStrengthBases();
		}

		return ready;
	},

	// Empty white/grey NonEth 2os spear/polearm — Strength base (or Config name if PD2 type lies)
	isEmptyStrengthBase: function (unit) {
		var socks, i, rw, typed;

		if (!unit) {
			return false;
		}

		typed = (unit.itemType === 33 || unit.itemType === 34);

		if (!typed) {
			if (!Config.Runewords || !this.hasStrengthRecipe || !this.hasStrengthRecipe()) {
				return false;
			}

			for (i = 0; i < Config.Runewords.length; i += 1) {
				rw = Config.Runewords[i];

				if (rw && rw[0] && this.isStrengthRecipe(rw[0]) && this.baseMatchesConfig(unit, rw[1])) {
					typed = true;
					break;
				}
			}

			if (!typed) {
				return false;
			}
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		}

		if (unit.getFlag(0x4000000) || unit.getFlag(0x400000) || unit.getItem()) {
			return false;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		return socks === 2;
	},

	// Empty 2os Strength base + Amn/Tir ready — don't put bare spear on merc first
	// (knives never — Strength is merc-only for PS)
	shouldHoldForStrengthMake: function (unit) {
		if (!unit || !Config.MakeRunewords || !this.hasStrengthRecipe()) {
			return false;
		}

		if (!this.haveRunes(Runeword.Strength, false)) {
			return false;
		}

		if ((this.purityBasesDone && this.purityBasesDone()) ||
				(this.purityOutranksStrength && this.purityOutranksStrength())) {
			return false;
		}

		return this.isEmptyStrengthBase(unit);
	},

	getBestEmptyStrengthBaseNoPeel: function () {
		var item, score, best = null, bestScore = -1;

		item = me.getItem(-1, -1);

		if (!item) {
			return null;
		}

		do {
			try {
				if (item.location !== 3 && item.location !== 7) {
					continue;
				}

				if (!this.isEmptyStrengthBase(item)) {
					continue;
				}

				score = 50000 + (item.getStat(31) || 0);

				if (score > bestScore) {
					bestScore = score;
					best = copyUnit(item);
				}
			} catch (eStr2) {}
		} while (item.getNext());

		return best;
	},

	// Best empty 2os Strength base in inv/stash (knife / spear / polearm). Peels merc first.
	getBestEmptyStrengthBase: function () {
		this.peelMercForStrength();

		return this.getBestEmptyStrengthBaseNoPeel();
	},

	// --- Purity (Amn+Eth+Thul, 3os) — PD2 merc stick that outranks Strength ---

	isPurityRecipe: function (recipe) {
		return !!(recipe && recipe.length === 3 && Runeword.Purity &&
			recipe[0] === Runeword.Purity[0] && recipe[1] === Runeword.Purity[1] &&
			recipe[2] === Runeword.Purity[2]);
	},

	hasPurityRecipe: function () {
		var i, rw;

		if (!Runeword.Purity || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && this.isPurityRecipe(rw[0])) {
				return true;
			}
		}

		return false;
	},

	// Purity: Prayer aura when equipped (skill 99) — or RW spear/polearm with 45 IAS
	itemLooksLikePurity: function (item) {
		var name;

		if (!item || !item.getFlag(0x4000000)) {
			return false;
		}

		name = ((item.fname || "") + " " + (item.name || "")).toLowerCase().replace(/ÿc[0-9a-z]/gi, "");

		// PD2 itemType can shift — name "Purity" on a completed RW is enough
		if (name.indexOf("purity") !== -1) {
			return true;
		}

		if (item.itemType !== 33 && item.itemType !== 34) {
			return false;
		}

		if ((item.getStat(151, 99) || 0) > 0) {
			return true;
		}

		return (item.getStat(93) || 0) >= 45; // IAS
	},

	mercHasPurity: function () {
		var item;

		if (typeof Item !== "undefined" && Item.getMercItem) {
			item = Item.getMercItem(4).item;

			if (item && this.itemLooksLikePurity(item)) {
				return true;
			}
		}

		return false;
	},

	// Owned Purity anywhere (merc / inv / stash) — not just the merc slot.
	// Otherwise every chores banks another 3os Battle Scythe after the first stick is made.
	hasCompletedPurity: function () {
		return this.memo("donePurity", this._hasCompletedPurityRaw);
	},

	_hasCompletedPurityRaw: function () {
		var item;

		if (this.mercHasPurity()) {
			return true;
		}

		item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (this.itemLooksLikePurity(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Done collecting/making empty 3os Purity bases
	purityBasesDone: function () {
		return !!(this.hasCompletedPurity() ||
			(this.hasCompletedInsight && this.hasCompletedInsight()));
	},

	// True when Purity is worn OR makeable — Strength 2os bases should not be kept/made
	purityOutranksStrength: function () {
		// Worn Purity / Insight always obsolete Strength — even if recipe list drifted
		if (this.hasCompletedPurity && this.hasCompletedPurity()) {
			return true;
		}

		if (this.hasCompletedInsight && this.hasCompletedInsight()) {
			return true;
		}

		if (!this.hasPurityRecipe || !this.hasPurityRecipe()) {
			return false;
		}

		if (me.charlvl < 25) {
			return false;
		}

		return !!(this.haveRunes(Runeword.Purity, false) && this.getBestEmptyPurityBaseNoPeel());
	},

	// Empty white/grey NonEth 3os spear/polearm — Purity base candidate
	isEmptyPurityBase: function (unit) {
		var socks, i, rw, typed;

		if (!unit) {
			return false;
		}

		typed = (unit.itemType === 33 || unit.itemType === 34);

		// PD2 itemType can lie — still a Purity candidate if Config names this code (e.g. 9s8 Battle Scythe)
		if (!typed) {
			if (!Config.Runewords || !this.hasPurityRecipe || !this.hasPurityRecipe()) {
				return false;
			}

			for (i = 0; i < Config.Runewords.length; i += 1) {
				rw = Config.Runewords[i];

				if (rw && rw[0] && this.isPurityRecipe(rw[0]) && this.baseMatchesConfig(unit, rw[1])) {
					typed = true;
					break;
				}
			}

			if (!typed) {
				return false;
			}
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		}

		if (unit.getFlag(0x4000000) || unit.getFlag(0x400000) || unit.getItem()) {
			return false;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		return socks === 3;
	},

	purityBaseScore: function (unit) {
		if (!this.isEmptyPurityBase(unit)) {
			return -1;
		}

		// Prefer higher max dmg; polearm slightly over spear for merc swing
		return 60000 + (unit.getStat(31) || 0) + (unit.itemType === 34 ? 500 : 0);
	},

	getBestEmptyPurityBaseNoPeel: function (excludeGid) {
		var item, score, best = null, bestScore = -1;

		item = me.getItem(-1, -1);

		if (!item) {
			return null;
		}

		do {
			try {
				if (item.location !== 3 && item.location !== 7) {
					continue;
				}

				if (excludeGid && item.gid === excludeGid) {
					continue;
				}

				score = this.purityBaseScore(item);

				if (score > bestScore) {
					bestScore = score;
					best = copyUnit(item);
				}
			} catch (ePur) {}
		} while (item.getNext());

		return best;
	},

	getBestEmptyPurityBase: function (excludeGid) {
		return this.getBestEmptyPurityBaseNoPeel(excludeGid);
	},

	listEmptyPurityBases: function () {
		var item, score, list = [];

		item = me.getItem(-1, -1);

		if (!item) {
			return list;
		}

		do {
			try {
				if (item.location !== 3 && item.location !== 7) {
					continue;
				}

				score = this.purityBaseScore(item);

				if (score < 0) {
					continue;
				}

				list.push({item: copyUnit(item), gid: item.gid, score: score});
			} catch (eList) {}
		} while (item.getNext());

		list.sort(function (a, b) {
			return b.score - a.score;
		});

		return list;
	},

	// Keep / pick only if first empty 3os OR strictly better than banked — never after Purity/Insight
	wantPurityBase: function (unit) {
		var best, score;

		if (!unit || !this.isEmptyPurityBase(unit)) {
			return false;
		}

		if (this.purityBasesDone && this.purityBasesDone()) {
			return false;
		}

		if (this.hasPurityRecipe && !this.hasPurityRecipe()) {
			return false;
		}

		score = this.purityBaseScore(unit);

		if (score < 0) {
			return false;
		}

		best = this.getBestEmptyPurityBase(unit.gid);

		if (!best) {
			return true;
		}

		return score > this.purityBaseScore(best);
	},

	// Drop/sell extra empty 3os — keep at most one (best). If Purity/Insight done, dump all.
	cullWorsePurityBases: function () {
		var list, i, item, n = 0, start = 1, done;

		done = !!(this.purityBasesDone && this.purityBasesDone());
		list = this.listEmptyPurityBases();

		if (!list.length || (!done && list.length <= 1)) {
			return 0;
		}

		if (done) {
			start = 0;
			print("ÿc8RWÿc0 :: culling " + list.length + " empty 3os Purity base(s) (Purity/Insight done)");
		} else {
			this.dbg("ÿc2Runewordsÿc0 :: Purity — keeping best base score=" + list[0].score +
				" (" + (list[0].item.name || list[0].item.classid) + "), culling " + (list.length - 1));
		}

		for (i = start; i < list.length; i += 1) {
			item = me.getItem(-1, -1, list[i].gid);

			if (!item) {
				continue;
			}

			print("ÿc8RWÿc0 :: culling 3os Purity base " +
				((item.name || item.classid || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0]));

			if (item.location === 3 && typeof Town !== "undefined" && Town.sellInventoryItem &&
					Town.isShopOpen && Town.isShopOpen()) {
				if (Town.sellInventoryItem(item)) {
					n += 1;
					continue;
				}
			}

			if (me.inTown) {
				try {
					item.drop();
					n += 1;
				} catch (eDropPur) {}
			}
		}

		if (n > 0) {
			this.invalidateCache();
		}

		return n;
	},

	needsPurityMakeVisit: function () {
		if (!Config.MakeRunewords || !this.hasPurityRecipe() || me.charlvl < 25) {
			return false;
		}

		if (this.purityBasesDone()) {
			return false;
		}

		if (!this.haveRunes(Runeword.Purity, false)) {
			return false;
		}

		return !!this.getBestEmptyPurityBaseNoPeel();
	},

	shouldHoldForPurityMake: function (unit) {
		if (!unit || !Config.MakeRunewords || !this.hasPurityRecipe() || me.charlvl < 25) {
			return false;
		}

		if (!this.haveRunes(Runeword.Purity, false)) {
			return false;
		}

		return !!(this.wantPurityBase && this.wantPurityBase(unit));
	},

	// --- Treachery (Shael+Thul+Lem, 3os) — PS mid armor, defense > 120 ---

	isTreacheryRecipe: function (recipe) {
		return !!(recipe && recipe.length === 3 && Runeword.Treachery &&
			recipe[0] === Runeword.Treachery[0] && recipe[1] === Runeword.Treachery[1] &&
			recipe[2] === Runeword.Treachery[2]);
	},

	hasTreacheryRecipe: function () {
		var i, rw;

		if (!Runeword.Treachery || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && this.isTreacheryRecipe(rw[0])) {
				return true;
			}
		}

		return false;
	},

	// Treachery: 45 IAS + 30 cold resist on body armor (RW flag)
	itemLooksLikeTreachery: function (item) {
		var dmg;

		if (!item || item.itemType !== 3 || !item.getFlag(0x4000000)) {
			return false;
		}

		// Same PD2 itemType-collision guard as isConfiguredTreacheryBase — never
		// count a scythe/polearm that slipped through as a completed Treachery armor.
		dmg = (getBaseStat("items", item.classid, "mindam") || 0) +
			(getBaseStat("items", item.classid, "maxdam") || 0) +
			(getBaseStat("items", item.classid, "2handmindam") || 0) +
			(getBaseStat("items", item.classid, "2handmaxdam") || 0);

		if (dmg > 0) {
			return false;
		}

		if (this.pickitEntries.length && NTIP.CheckItem(item, this.pickitEntries)) {
			return true;
		}

		return (item.getStat(93) || 0) >= 45 && (item.getStat(43) || 0) >= 30;
	},

	hasCompletedTreacheryArmor: function () {
		return this.memo("doneTreachery", this._hasCompletedTreacheryArmorRaw);
	},

	_hasCompletedTreacheryArmorRaw: function () {
		var item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			if (this.itemLooksLikeTreachery(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	treacheryBaseDef: function (unit) {
		var def;

		if (!unit) {
			return 0;
		}

		def = unit.getStat(31) || 0;

		if (typeof unit.getStatEx === "function") {
			def = Math.max(def, unit.getStatEx(31) || 0);
		}

		return def;
	},

	// Empty 3os NonEth body armor with defense > 120
	isConfiguredTreacheryBase: function (unit) {
		var socks, dmg;

		if (!unit || !this.hasTreacheryRecipe()) {
			return false;
		}

		if (unit.itemType !== 3) {
			return false;
		}

		// PD2 itemType can misreport/collide (documented elsewhere: orb=69, head=70/71).
		// Never trust itemType alone for "this is armor" — a scythe/polearm base has
		// real weapon damage in the item table even if .itemType lies and says 3 (torso).
		dmg = (getBaseStat("items", unit.classid, "mindam") || 0) +
			(getBaseStat("items", unit.classid, "maxdam") || 0) +
			(getBaseStat("items", unit.classid, "2handmindam") || 0) +
			(getBaseStat("items", unit.classid, "2handmaxdam") || 0);

		if (dmg > 0) {
			print("ÿc1RWÿc0 :: Treachery — rejected classid=" + unit.classid +
				" itemType=3 but has weapon damage (" + dmg + ") — PD2 itemType collision, not armor");
			return false;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		}

		if (unit.getFlag(0x4000000) || unit.getFlag(0x400000) || unit.getItem()) {
			return false;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		if (socks !== 3) {
			return false;
		}

		return this.treacheryBaseDef(unit) > 120;
	},

	getBestEmptyTreacheryBase: function (excludeGid) {
		var item, def, best = null, bestDef = -1;

		item = me.getItem(-1, -1);

		if (!item) {
			return null;
		}

		do {
			try {
				if (item.location !== 3 && item.location !== 7) {
					continue;
				}

				if (excludeGid && item.gid === excludeGid) {
					continue;
				}

				if (!this.isConfiguredTreacheryBase(item)) {
					continue;
				}

				def = this.treacheryBaseDef(item);

				if (def > bestDef) {
					bestDef = def;
					best = copyUnit(item);
				}
			} catch (eTr) {}
		} while (item.getNext());

		return best;
	},

	hasEmptyTreacheryBase: function () {
		return !!this.getBestEmptyTreacheryBase();
	},

	// First empty base, or strictly higher defense than banked
	wantTreacheryBase: function (unit) {
		var best, def;

		if (!unit || !Config.MakeRunewords || !this.isConfiguredTreacheryBase(unit)) {
			return false;
		}

		if (this.hasCompletedTreacheryArmor()) {
			return false;
		}

		def = this.treacheryBaseDef(unit);
		best = this.getBestEmptyTreacheryBase(unit.gid);

		if (!best) {
			return true;
		}

		return def > this.treacheryBaseDef(best);
	},

	// MiniShop: Shael+Thul+Lem ready, need 3os armor def>120 (or upgrade)
	wantTreacheryShopBase: function (unit) {
		if (!Config.MakeRunewords || !unit || me.charlvl < 35) {
			return false;
		}

		if (!this.hasTreacheryRecipe() || this.hasCompletedTreacheryArmor()) {
			return false;
		}

		if (!this.haveRunes(Runeword.Treachery, false)) {
			return false;
		}

		return this.wantTreacheryBase(unit);
	},

	needsTreacheryMakeVisit: function () {
		if (!Config.MakeRunewords || !this.hasTreacheryRecipe() || me.charlvl < 43) {
			return false;
		}

		if (this.hasCompletedTreacheryArmor()) {
			return false;
		}

		if (!this.haveRunes(Runeword.Treachery, false)) {
			return false;
		}

		return !!this.getBestEmptyTreacheryBase();
	},

	shouldHoldForTreacheryMake: function (unit) {
		if (!unit || !Config.MakeRunewords || !this.hasTreacheryRecipe() || me.charlvl < 35) {
			return false;
		}

		if (this.hasCompletedTreacheryArmor()) {
			return false;
		}

		if (!this.isConfiguredTreacheryBase(unit)) {
			return false;
		}

		// Keep best empty base even before Lem (bank early); require runes only for shop hunt
		return this.wantTreacheryBase(unit) ||
			(this.getBestEmptyTreacheryBase() && this.getBestEmptyTreacheryBase().gid === unit.gid);
	},

	cullWorseTreacheryBases: function () {
		var item, best, n = 0, gids = [], i, cur;

		if (!this.hasTreacheryRecipe() || this.hasCompletedTreacheryArmor()) {
			return 0;
		}

		best = this.getBestEmptyTreacheryBase();

		if (!best) {
			return 0;
		}

		item = me.getItem(-1, -1);

		if (!item) {
			return 0;
		}

		do {
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			if (item.gid === best.gid) {
				continue;
			}

			if (this.isConfiguredTreacheryBase(item)) {
				gids.push(item.gid);
			}
		} while (item.getNext());

		for (i = 0; i < gids.length; i += 1) {
			cur = me.getItem(-1, -1, gids[i]);

			if (!cur) {
				continue;
			}

			print("ÿc8RWÿc0 :: culling worse Treachery base def=" + this.treacheryBaseDef(cur) +
				" (keeping " + this.treacheryBaseDef(best) + ")");

			if (cur.location === 3 && typeof Town !== "undefined" && Town.sellInventoryItem &&
					Town.isShopOpen && Town.isShopOpen()) {
				if (Town.sellInventoryItem(cur)) {
					n += 1;
					continue;
				}
			}

			if (me.inTown) {
				try {
					cur.drop();
					n += 1;
				} catch (eDrop) {}
			}
		}

		if (n) {
			this.invalidateCache();
		}

		return n;
	},

	// Drop/sell empty 2os Strength bases once Purity is makeable or worn
	cullObsoleteStrengthBases: function () {
		var item, n = 0, gids = [], i, cur;

		if (!(this.purityBasesDone() || this.purityOutranksStrength())) {
			return 0;
		}

		item = me.getItem(-1, -1);

		if (!item) {
			return 0;
		}

		do {
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			if (this.isEmptyStrengthBase(item)) {
				gids.push(item.gid);
			}
		} while (item.getNext());

		for (i = 0; i < gids.length; i += 1) {
			cur = me.getItem(-1, -1, gids[i]);

			if (!cur) {
				continue;
			}

			print("ÿc8RWÿc0 :: culling 2os Strength base (Purity preferred) " +
				((cur.name || cur.classid || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0]));

			if (cur.location === 3 && typeof Town !== "undefined" && Town.sellInventoryItem &&
					Town.isShopOpen && Town.isShopOpen()) {
				if (Town.sellInventoryItem(cur)) {
					n += 1;
					continue;
				}
			}

			if (me.inTown) {
				try {
					cur.drop();
					n += 1;
				} catch (eDrop2) {}
			}
		}

		if (n > 0) {
			this.invalidateCache();
		}

		return n;
	},

	// Debug: Amn+Tir piles and why Strength matching fails
	diagnoseStrengthRunes: function () {
		var items, i, it, code, need, missing = [], label, locs = {3: 0, 6: 0, 7: 0},
			runeN = 0, num, owned = [], item, ghost, name;

		items = this.listStorageItems(false);
		need = Runeword.Strength ? Runeword.Strength.slice() : [638, 630];

		print("ÿc4RWÿc0 :: Strength runes — storageItems=" + items.length +
			" stashOpen=" + !!getUIFlag(0x19) +
			" need Amn(638)+Tir(630) haveRunes=" + this.haveRunes(need, false));

		for (i = 0; i < items.length; i += 1) {
			it = items[i];

			if (it.location === 3 || it.location === 6 || it.location === 7) {
				locs[it.location] += 1;
			}

			num = this.runeNumberFromItem(it);

			if (num < 1 && !this.runeMatchesClassid(it, 638) && !this.runeMatchesClassid(it, 630)) {
				continue;
			}

			runeN += 1;
			code = it.code ? String(it.code).toLowerCase() : "?";
			label = this.runeLogLabel(it);

			if (owned.indexOf(label.split("+")[0].toLowerCase()) === -1) {
				owned.push(label.split("+")[0].toLowerCase());
			}

			print("ÿc4RWÿc0 :: Strength rune cand #" + runeN + " " + label +
				" id=" + it.classid + " code=" + code +
				" type=" + it.itemType + " qty=" + this.runeQty(it) +
				" stack=" + this.isPd2RuneStack(it) +
				" sock=" + this.canSocketRune(it) +
				" loc=" + it.location + " @" + it.x + "," + it.y +
				" valid=" + this.validItem(it) +
				" matchAmn=" + this.runeMatchesClassid(it, 638) +
				" matchTir=" + this.runeMatchesClassid(it, 630) +
				" runeNum=" + num);
		}

		print("ÿc4RWÿc0 :: Strength runes — owned=[" + owned.join(",") +
			"] loc counts inv=" + locs[3] + " cube=" + locs[6] +
			" stash=" + locs[7] + " runeCands=" + runeN);

		for (i = 0; i < need.length; i += 1) {
			if (!this.haveRunes([need[i]], false)) {
				missing.push(need[i] === 638 ? "Amn" : (need[i] === 630 ? "Tir" : String(need[i])));
			}
		}

		if (missing.length) {
			print("ÿc1RWÿc0 :: Strength runes — MISSING " + missing.join("+") +
				" (not found as single/stack in inv/stash/cube)");
		} else {
			print("ÿc2RWÿc0 :: Strength runes — Amn+Tir both found");
		}

		// Ghost hunt: Tir sometimes mis-typed — dump ANY id 630/701 or name/code hint
		item = me.getItem(-1, -1);
		ghost = 0;

		if (item) {
			do {
				code = item.code ? String(item.code).toLowerCase() : "";
				name = ((item.name || "") + " " + (item.fname || "")).toLowerCase().replace(/ÿc[0-9a-z]/gi, "");

				if (item.classid === 630 || item.classid === 701 || code === "r03" || code === "r03s" ||
						name.indexOf("tir") !== -1) {
					ghost += 1;
					print("ÿc8RWÿc0 :: Strength Tir-ghost #" + ghost +
						" id=" + item.classid + " code=" + code + " type=" + item.itemType +
						" loc=" + item.location + " mode=" + item.mode +
						" @" + item.x + "," + item.y +
						" looksRune=" + this.looksLikeRune(item) +
						" runeNum=" + this.runeNumberFromItem(item) +
						" matchTir=" + this.runeMatchesClassid(item, 630) +
						" name=" + name.replace(/\s+/g, " ").substring(0, 40));
				}
			} while (item.getNext());
		}

		if (!ghost) {
			print("ÿc1RWÿc0 :: Strength Tir-ghost — none (no id 630/701, code r03, or name tir anywhere)");
		}
	},

	// Debug: every spear/polearm in inv/stash/merc and why Strength base scan rejects it
	diagnoseStrengthBases: function () {
		var item, n = 0, name, socks, best, mercEq, mercItem, why, have, peel,
			recipe = this.hasStrengthRecipe(),
			done = this.mercHasStrength(),
			insight = !!(this.hasCompletedInsight && this.hasCompletedInsight());

		have = this.haveRunes(Runeword.Strength, false);
		peel = this.mercHasPeelableStrengthBase();
		best = this.getBestEmptyStrengthBaseNoPeel();

		print("ÿc4RWÿc0 :: Strength diagnose — recipe=" + recipe +
			" mercStr=" + done + " insightDone=" + insight +
			" haveAmnTir=" + have + " peelMerc=" + peel +
			" emptyBase=" + !!best +
			" charlvl=" + me.charlvl +
			(best ? (" best=" + (best.name || best.classid) + " gid=" + best.gid +
				" type=" + best.itemType + " id=" + best.classid) : ""));

		if (typeof Item !== "undefined" && Item.getMercItem) {
			mercEq = Item.getMercItem(4);
			mercItem = mercEq && mercEq.item;

			if (mercItem) {
				socks = mercItem.getStat(194) || 0;

				if (typeof mercItem.getStatEx === "function") {
					socks = Math.max(socks, mercItem.getStatEx(194) || 0);
				}

				print("ÿc4RWÿc0 :: Strength merc weapon " +
					((mercItem.name || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0]) +
					" id=" + mercItem.classid + " type=" + mercItem.itemType +
					" q=" + mercItem.quality + " sock=" + socks +
					(mercItem.getItem() ? " SOCKED" : " empty") +
					(mercItem.getFlag(0x400000) ? " eth" : "") +
					(mercItem.getFlag(0x4000000) ? " RW" : "") +
					" looksStr=" + this.itemLooksLikeStrength(mercItem));
			} else {
				print("ÿc4RWÿc0 :: Strength merc weapon — none");
			}
		}

		item = me.getItem(-1, -1);

		if (!item) {
			print("ÿc1RWÿc0 :: Strength diagnose — no items on character");
			return;
		}

		do {
			// Spears (33) / polearms (34) in inv/stash — also log other weapon types that look like spears by name
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			name = ((item.name || "") + " " + (item.fname || "")).toLowerCase().replace(/ÿc[0-9a-z]/gi, "");

			if (item.itemType !== 33 && item.itemType !== 34 &&
					name.indexOf("spear") === -1 && name.indexOf("pike") === -1 &&
					name.indexOf("trident") === -1 && name.indexOf("scythe") === -1 &&
					name.indexOf("pole") === -1 && name.indexOf("voulge") === -1 &&
					name.indexOf("halberd") === -1 && name.indexOf("bardiche") === -1) {
				continue;
			}

			n += 1;
			socks = item.getStat(194) || 0;

			if (typeof item.getStatEx === "function") {
				socks = Math.max(socks, item.getStatEx(194) || 0);
			}

			why = [];

			if (item.itemType !== 33 && item.itemType !== 34) {
				why.push("badType");
			}

			if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(item)) {
				why.push("badQuality");
			}

			if (item.getFlag(0x4000000)) {
				why.push("alreadyRW");
			}

			if (item.getFlag(0x400000)) {
				why.push("eth(NonEth)");
			}

			if (item.getItem()) {
				why.push("socketed");
			}

			if (socks !== 2) {
				why.push("sock=" + socks + "(need2)");
			}

			print("ÿc4RWÿc0 :: Strength cand #" + n + " " +
				((item.name || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0]) +
				" id=" + item.classid + " type=" + item.itemType +
				" q=" + item.quality + " sock=" + socks +
				" loc=" + item.location +
				(item.getItem() ? " SOCKED" : " empty") +
				(item.getFlag(0x400000) ? " eth" : "") +
				(item.getFlag(0x4000000) ? " RW" : "") +
				(why.length ? (" REJECT:" + why.join(",")) : " OK"));
		} while (item.getNext());

		if (n === 0) {
			print("ÿc1RWÿc0 :: Strength diagnose — no spear/polearm in inv/stash at all");
		}
	},

	hasInsightRecipe: function () {
		var i, rw;

		if (!Runeword.Insight || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && this.isInsightRecipe(rw[0])) {
				return true;
			}
		}

		return false;
	},

	hasCompletedInsight: function () {
		return this.memo("doneInsight", this._hasCompletedInsightRaw);
	},

	_hasCompletedInsightRaw: function () {
		var item = me.getItem(-1), merc;

		if (item) {
			do {
				if (item.itemType === 34 && item.getFlag(0x4000000) &&
						(item.getStat(151, 120) || 0) > 0) {
					return true;
				}
			} while (item.getNext());
		}

		if (typeof Item !== "undefined" && Item.getMercItem) {
			item = Item.getMercItem(4).item;

			if (item && item.getFlag(0x4000000) && (item.getStat(151, 120) || 0) > 0) {
				return true;
			}
		}

		merc = me.getMerc();

		if (merc) {
			item = merc.getItem(-1, 1);

			if (item) {
				do {
					if (item.bodylocation === 4 && item.getFlag(0x4000000) &&
							(item.getStat(151, 120) || 0) > 0) {
						return true;
					}
				} while (item.getNext());
			}
		}

		return false;
	},

	// Rank empty 4os Insight poles — eth elite Thresher/GT best; CV lower (str); Bill best exceptional
	insightBaseScore: function (unit) {
		var rank, socks, eth, score, strReq;

		if (!unit || unit.itemType !== 34 || unit.quality > 3) {
			return -1;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		if (socks !== 4 || unit.getItem()) {
			return -1;
		}

		// classid → base rank (higher = better Insight merc base)
		switch (unit.classid) {
		case 256: // Thresher
			rank = 100;
			break;
		case 259: // Giant Thresher
			rank = 96;
			break;
		case 257: // Cryptic Axe
			rank = 92;
			break;
		case 258: // Great Poleaxe
			rank = 82;
			break;
		case 255: // Colossus Voulge — high str, keep but deprioritize
			rank = 55;
			break;
		case 151: // Bill — best exceptional (4os / str)
			rank = 48;
			break;
		case 153: // Partizan
			rank = 44;
			break;
		case 60: // Poleaxe
			rank = 40;
			break;
		case 154: // Bec-de-Corbin
			rank = 36;
			break;
		case 152: // Battle Scythe
			rank = 34;
			break;
		default:
			rank = 10; // other configured poles
			break;
		}

		eth = !!unit.getFlag(0x400000);
		score = rank * 100 + (eth ? 2500 : 0) + (unit.quality === 3 ? 40 : 0);
		strReq = unit.getStat(91) || unit.strreq || 0;

		// Soft penalty for high str (CV eth still wins on eth bonus)
		if (strReq > 120) {
			score -= (strReq - 120) * 8;
		}

		return score;
	},

	isConfiguredInsightBase: function (unit) {
		var i, rw;

		if (!unit || !this.hasInsightRecipe()) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isInsightRecipe(rw[0])) {
				continue;
			}

			if (this.baseMatchesConfig(unit, rw[1])) {
				return true;
			}
		}

		return false;
	},

	listEmptyInsightBases: function () {
		return this.memo("emptyInsight", this._listEmptyInsightBasesRaw);
	},

	_listEmptyInsightBasesRaw: function () {
		var item = me.getItem(-1, -1), list = [], score;

		if (!item) {
			return list;
		}

		do {
			if (this.isConfiguredInsightBase(item)) {
				score = this.insightBaseScore(item);

				if (score > 0) {
					list.push({item: copyUnit(item), score: score, gid: item.gid});
				}
			}
		} while (item.getNext());

		list.sort(function (a, b) {
			return b.score - a.score;
		});

		return list;
	},

	getBestEmptyInsightBase: function (excludeGid) {
		var list = this.listEmptyInsightBases(), i;

		for (i = 0; i < list.length; i += 1) {
			if (excludeGid && list[i].gid === excludeGid) {
				continue;
			}

			return list[i];
		}

		return null;
	},

	// Keep / pick only if this is our first empty Insight base OR strictly better than banked
	wantInsightBase: function (unit) {
		var best, score;

		// Cheap rejects first (type/config) — hasCompletedInsight walks all items
		if (!unit || unit.itemType !== 34 || !this.hasInsightRecipe() || !this.isConfiguredInsightBase(unit)) {
			return false;
		}

		if (this.hasCompletedInsight()) {
			return false;
		}

		score = this.insightBaseScore(unit);

		if (score < 0) {
			return false;
		}

		best = this.getBestEmptyInsightBase(unit.gid);

		if (!best) {
			return true;
		}

		return score > best.score;
	},

	// Sell/drop worse empty Insight poles so we never bank more than one
	cullWorseInsightBases: function () {
		var list = this.listEmptyInsightBases(), i, item, n = 0;

		if (list.length <= 1) {
			return 0;
		}

		this.dbg("ÿc2Runewordsÿc0 :: Insight — keeping best base score=" + list[0].score +
			" (" + (list[0].item.name || list[0].item.classid) + "), culling " + (list.length - 1));

		for (i = 1; i < list.length; i += 1) {
			item = me.getItem(-1, -1, list[i].gid);

			if (!item) {
				continue;
			}

			// Prefer sell only if shop already open (never reopen mid-chores / post-stash)
			if (item.location === 3 && typeof Town !== "undefined" && Town.sellInventoryItem &&
					Town.isShopOpen && Town.isShopOpen()) {
				if (Town.sellInventoryItem(item)) {
					n += 1;
					continue;
				}
			}

			// Otherwise drop in town before we socket the best base
			if (me.inTown) {
				try {
					item.drop();
					n += 1;
				} catch (eDrop) {}
			}
		}

		if (n > 0) {
			this.invalidateCache();
		}

		return n;
	},

	hasLoreRecipe: function () {
		var i, rw;

		if (!Runeword.Lore || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && rw[0].length === 2 &&
					rw[0][0] === Runeword.Lore[0] && rw[0][1] === Runeword.Lore[1]) {
				return true;
			}
		}

		return false;
	},

	// True if any Config.Runewords recipe is still unfinished (no stash open needed)
	hasWantedRecipe: function () {
		var i, rw;

		if (!Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !rw[0]) {
				continue;
			}

			if (this.isLeafRecipe(rw[0]) && this.hasBetterThanLeafOrb()) {
				continue;
			}

			if (this.isStealthRecipe(rw[0]) && this.hasCompletedArmorRuneword()) {
				continue;
			}

			if (this.isLoreRecipe(rw[0]) && this.hasCompletedLoreHelm()) {
				continue;
			}

			if (this.isInsightRecipe(rw[0]) && this.hasCompletedInsight()) {
				continue;
			}

			if (this.isSpiritRecipe(rw[0]) && this.hasCompletedSpiritSword()) {
				continue;
			}

			// Strength already on merc, Insight done, or Purity preferred/ready
			if (this.isStrengthRecipe(rw[0])) {
				if (this.mercHasStrength() || (this.hasCompletedInsight && this.hasCompletedInsight()) ||
						(this.purityOutranksStrength && this.purityOutranksStrength())) {
					continue;
				}
			}

			// Purity already owned (or Insight outranks it)
			if (this.isPurityRecipe(rw[0])) {
				if (this.purityBasesDone()) {
					continue;
				}
			}

			if (this.isTreacheryRecipe(rw[0]) && this.hasCompletedTreacheryArmor()) {
				continue;
			}

			if (this.isRhymeRecipe(rw[0])) {
				if (this.hasCompletedRhymeShield() || !this.wantsRhymeShieldSlot()) {
					continue;
				}
			}

			return true;
		}

		return false;
	},

	isLoreRecipe: function (recipe) {
		return !!(recipe && recipe.length === 2 && Runeword.Lore &&
			recipe[0] === Runeword.Lore[0] && recipe[1] === Runeword.Lore[1]);
	},

	// Rank empty 2os Lore helms/circlets — def-based; circlets get a caster bias over heavy helms
	loreBaseScore: function (unit) {
		var socks, def, score;

		if (!unit || (unit.itemType !== 37 && unit.itemType !== 75)) {
			return -1;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return -1;
		} else if (typeof Item === "undefined" && (!(unit.quality >= 1 && unit.quality <= 3))) {
			return -1;
		}

		if (unit.getFlag(0x400000) || unit.getItem()) {
			return -1;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		if (socks !== 2) {
			return -1;
		}

		def = unit.getStat(31) || 0;

		if (typeof unit.getStatEx === "function") {
			def = Math.max(def, unit.getStatEx(31) || 0);
		}

		score = def * 10 + (unit.quality === 3 ? 1 : 0);

		// Circlet family already rolls solid AC (~30+); bias so casters keep them over a higher-AC Bone Helm
		if (unit.itemType === 75) {
			score += 500;
		}

		return score;
	},

	// Empty 2os Lore helms/circlets. Never auto-walk — pass true only when stash already needed.
	listEmptyLoreBases: function (openStashFirst) {
		if (openStashFirst === true && typeof Town !== "undefined" &&
				typeof Town.openStash === "function" && !getUIFlag(0x19)) {
			Town.openStash();
			delay(80 + me.ping);
			this.invalidateCache();
		}

		return this.memo("emptyLore", this._listEmptyLoreBasesRaw);
	},

	_listEmptyLoreBasesRaw: function () {
		var item, list = [], score, def;

		item = me.getItem(-1, -1);
		list = [];

		if (!item) {
			return list;
		}

		do {
			if (this.isConfiguredLoreBase(item)) {
				score = this.loreBaseScore(item);

				if (score >= 0) {
					def = item.getStat(31) || 0;

					if (typeof item.getStatEx === "function") {
						def = Math.max(def, item.getStatEx(31) || 0);
					}

					list.push({item: copyUnit(item), score: score, gid: item.gid, def: def});
				}
			}
		} while (item.getNext());

		list.sort(function (a, b) {
			return b.score - a.score;
		});

		return list;
	},

	// Debug: every helm/circlet in storage and why it is/isn't a Lore base
	diagnoseLoreBases: function () {
		var item = me.getItem(-1, -1), n = 0, name, socks, conf, score;

		print("ÿc4RWÿc0 :: Lore diagnose — recipe=" + this.hasLoreRecipe() +
			" done=" + this.hasCompletedLoreHelm() +
			" haveOrtSol=" + this.haveRunes(Runeword.Lore));

		if (!item) {
			print("ÿc1RWÿc0 :: Lore diagnose — no items on character");
			return;
		}

		do {
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			if (item.itemType !== 37 && item.itemType !== 75) {
				continue;
			}

			n += 1;
			name = (item.name || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0];
			socks = item.getStat(194) || 0;

			if (typeof item.getStatEx === "function") {
				socks = Math.max(socks, item.getStatEx(194) || 0);
			}

			conf = this.isConfiguredLoreBase(item);
			score = this.loreBaseScore(item);

			print("ÿc4RWÿc0 :: Lore cand #" + n + " " + name +
				" id=" + item.classid + " type=" + item.itemType +
				" q=" + item.quality + " sock=" + socks +
				" loc=" + item.location + " conf=" + conf +
				" score=" + score +
				(item.getItem() ? " SOCKED" : " empty") +
				(item.getFlag(0x400000) ? " eth" : "") +
				(item.getFlag(0x4000000) ? " RW" : ""));
		} while (item.getNext());

		if (!n) {
			print("ÿc1RWÿc0 :: Lore diagnose — no helm/circlet in inv/stash at all");
		} else {
			print("ÿc4RWÿc0 :: Lore diagnose — best=" +
				(this.getBestEmptyLoreBase() ?
					("gid=" + this.getBestEmptyLoreBase().gid + " score=" + this.getBestEmptyLoreBase().score) :
					"NONE"));
		}
	},

	getBestEmptyLoreBase: function (excludeGid) {
		var list = this.listEmptyLoreBases(), i;

		for (i = 0; i < list.length; i += 1) {
			if (excludeGid && list[i].gid === excludeGid) {
				continue;
			}

			return list[i];
		}

		return null;
	},

	// Keep / pick only if first empty Lore base OR strictly higher defense than banked
	wantLoreBase: function (unit) {
		var best, score;

		// Cheap rejects first (type/config) — hasCompletedLoreHelm walks all items
		if (!unit || (unit.itemType !== 37 && unit.itemType !== 75) || !this.hasLoreRecipe() ||
				!this.isConfiguredLoreBase(unit)) {
			return false;
		}

		if (this.hasCompletedLoreHelm()) {
			return false;
		}

		score = this.loreBaseScore(unit);

		if (score < 0) {
			return false;
		}

		best = this.getBestEmptyLoreBase(unit.gid);

		if (!best) {
			return true;
		}

		return score > best.score;
	},

	// Sell/drop worse empty Lore helms — max one base (highest def)
	cullWorseLoreBases: function () {
		// No stash walk — only cull duplicates already visible (inv/open stash)
		var list = this.listEmptyLoreBases(false), i, item, n = 0;

		if (list.length <= 1) {
			return 0;
		}

		this.dbg("ÿc2Runewordsÿc0 :: Lore — keeping best def=" + list[0].def +
			" (" + (list[0].item.name || list[0].item.classid) + "), culling " + (list.length - 1));

		for (i = 1; i < list.length; i += 1) {
			item = me.getItem(-1, -1, list[i].gid);

			if (!item) {
				continue;
			}

			if (item.location === 3 && typeof Town !== "undefined" && Town.sellInventoryItem &&
					Town.isShopOpen && Town.isShopOpen()) {
				if (Town.sellInventoryItem(item)) {
					n += 1;
					continue;
				}
			}

			if (me.inTown) {
				try {
					item.drop();
					n += 1;
				} catch (eDrop) {}
			}
		}

		if (n > 0) {
			this.invalidateCache();
		}

		return n;
	},

	// Empty 2os Breast/Light Plate already banked for Stealth
	hasEmptyStealthBase: function () {
		return this.memo("emptyStealth", this._hasEmptyStealthBaseRaw);
	},

	_hasEmptyStealthBaseRaw: function () {
		var item = me.getItem(-1, -1), socks;

		if (!item) {
			return false;
		}

		do {
			if ((item.classid === 334 || item.classid === 341) && item.quality <= 3 &&
					!item.getFlag(0x400000) && !item.getItem()) {
				socks = item.getStat(194) || 0;

				if (typeof item.getStatEx === "function") {
					socks = Math.max(socks, item.getStatEx(194) || 0);
				}

				if (socks === 2) {
					return true;
				}
			}
		} while (item.getNext());

		return false;
	},

	hasCompletedLoreHelm: function () {
		return this.memo("doneLore", this._hasCompletedLoreHelmRaw);
	},

	_hasCompletedLoreHelmRaw: function () {
		var item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			if (this.itemLooksLikeLoreHelm(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Lore helm/circlet: always grants +25 light resist — works even when KeepRunewords/nip miss circlets.
	itemLooksLikeLoreHelm: function (item) {
		if (!item || (item.itemType !== 37 && item.itemType !== 75) || !item.getFlag(0x4000000)) {
			return false;
		}

		if (this.pickitEntries.length && NTIP.CheckItem(item, this.pickitEntries)) {
			return true;
		}

		return (item.getStat(39) || 0) >= 25;
	},

	// After make: wear finished Lore (or any tiered RW) from stash/inv before chores continues
	equipMadeItem: function (unit, madeName) {
		var bodyLoc, j, tier, eqTier, gid, live;

		if (!Config.AutoEquip || typeof Item === "undefined" || !unit) {
			return false;
		}

		gid = unit.gid;
		live = me.getItem(-1, -1, gid) || unit;

		if (!live || live.mode === 1) {
			return false;
		}

		// Purity / Strength / Insight spears & polearms are Act2 merc sticks — never player equip
		if (this.isMercOnlyWeapon(live)) {
			print("ÿc4RWÿc0 :: merc-only " + (madeName || this.runeLogLabel(live)) +
				" — skipping player equip");

			if (typeof Item.autoEquipMerc === "function") {
				Item.autoEquipMerc(true);
				this.invalidateCache();
				return true;
			}

			return false;
		}

		if (!Item.canEquip(live)) {
			print("ÿc8RWÿc0 :: cannot equip yet " + (madeName || this.runeLogLabel(live)) +
				" (str/dex/lvl)");
			return false;
		}

		bodyLoc = Item.getBodyLoc(live);

		if (!bodyLoc || !bodyLoc.length) {
			print("ÿc8RWÿc0 :: skip equip " + (madeName || this.runeLogLabel(live)) +
				" (no bodyLoc)");
			return false;
		}

		tier = NTIP.GetTier(live) || 0;

		// Lore — beat FHR/life/res junk (≤118); lose to IAS rares (125+) / Wormskull
		if (this.itemLooksLikeLoreHelm(live)) {
			tier = Math.max(tier, 120);
		}

		// Stealth armor with no #tier line yet (same nip-miss risk right after socket)
		if (tier < 1 && this.itemLooksLikeStealthArmor(live)) {
			tier = 85;
		}

		// Treachery — mid PS armor (IAS/coldres identity if nip misses)
		if (this.itemLooksLikeTreachery && this.itemLooksLikeTreachery(live)) {
			tier = Math.max(tier, 150);
		}

		// Spirit sword — identity mid weapon (nip can miss FHR/stat lag right after socket)
		if (this.itemLooksLikeSpiritSword(live)) {
			tier = Math.max(tier, 100);
		}

		if (tier < 1) {
			print("ÿc8RWÿc0 :: skip equip " + (madeName || this.runeLogLabel(live)) +
				" (tier 0 / no nip)");
			return false;
		}

		for (j = 0; j < bodyLoc.length; j += 1) {
			eqTier = Item.getEquippedItem(bodyLoc[j]).tier;

			if (eqTier < 0) {
				eqTier = 0;
			}

			if (tier > eqTier) {
				print("ÿc2RWÿc0 :: equipping " + (madeName || live.name || "?") +
					" (tier " + tier + " > " + eqTier + ")");

				if (Item.equip(live, bodyLoc[j], {
						why: "runeword higher tier",
						reason: "runeword higher tier on tierlist (" + tier + " > " + eqTier + ")",
						tier: tier,
						replacedTier: eqTier,
						replacedName: (Item.getEquippedItemUnit(bodyLoc[j]) ?
							String(Item.getEquippedItemUnit(bodyLoc[j]).name || "").replace(/ÿc[0-9a-z]/gi, "") : "")
					})) {
					Misc.logItem("Equipped", me.getItem(-1, -1, gid) || live);
					this.invalidateCache();
					return true;
				}

				print("ÿc8RWÿc0 :: equip failed " + (madeName || live.name || "?") +
					" bodyLoc=" + bodyLoc[j]);
			} else {
				print("ÿc8RWÿc0 :: skip equip " + (madeName || live.name || "?") +
					" (tier " + tier + " <= worn " + eqTier + ")");
			}
		}

		return false;
	},

	// Finished merc sticks — never try to put these on the necro/sorc body
	isMercOnlyWeapon: function (item) {
		if (!item || !item.getFlag(0x4000000)) {
			return false;
		}

		// Spears / polearms: Purity, Strength, Insight (PS merc progression)
		if (item.itemType === 33 || item.itemType === 34) {
			if (this.itemLooksLikePurity && this.itemLooksLikePurity(item)) {
				return true;
			}

			if (this.itemLooksLikeStrength && this.itemLooksLikeStrength(item)) {
				return true;
			}

			// Insight Meditation aura
			if ((item.getStat(151, 120) || 0) > 0) {
				return true;
			}

			// Any completed spear/polearm RW on a PS build is merc bait
			if (typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) {
				return true;
			}
		}

		return false;
	},

	// Retry equip for any completed Stealth/Lore/Spirit sitting unequipped in inv/stash.
	// equipMadeItem() above is a single best-effort attempt right at craft time — once the recipe
	// reads "done" (hasCompletedSpiritSword/hasCompletedLoreHelm/hasCompletedArmorRuneword),
	// makeRunewords() never looks at that item again. If the one-shot attempt missed (str/dex/lvl
	// not met yet, stat lag right after socket, or the equip logic itself just got fixed after the
	// item was already made) it would be stranded in the stash forever without this retry.
	equipStrandedRunewords: function () {
		if (!Config.AutoEquip || typeof Item === "undefined") {
			return false;
		}

		var item, candidates = [], i, equippedAny = false;

		item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			if (item.mode !== 1) {
				if (this.itemLooksLikeSpiritSword(item)) {
					candidates.push({ gid: item.gid, label: "Spirit" });
				} else if (this.itemLooksLikeTreachery && this.itemLooksLikeTreachery(item)) {
					candidates.push({ gid: item.gid, label: "Treachery" });
				} else if (this.itemLooksLikeStealthArmor(item)) {
					candidates.push({ gid: item.gid, label: "Stealth" });
				} else if (this.itemLooksLikeLoreHelm(item)) {
					candidates.push({ gid: item.gid, label: "Lore" });
				}
			}
		} while (item.getNext());

		// Equip attempts move/replace gear — collect gids first, then re-fetch live refs to act on.
		for (i = 0; i < candidates.length; i += 1) {
			item = me.getItem(-1, -1, candidates[i].gid);

			if (item && item.mode !== 1 && this.equipMadeItem(item, candidates[i].label)) {
				equippedAny = true;
			}
		}

		return equippedAny;
	},

	// True when a completed Stealth/Lore/Spirit is sitting unequipped in the stash — nothing else
	// asks for a stash visit once the recipe shows "done", so this stray would never get worn.
	needsRunewordEquipVisit: function () {
		if (!Config.AutoEquip || typeof Item === "undefined") {
			return false;
		}

		var item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			if (item.mode !== 1 && item.location === 7 &&
					(this.itemLooksLikeSpiritSword(item) ||
						(this.itemLooksLikeTreachery && this.itemLooksLikeTreachery(item)) ||
						this.itemLooksLikeStealthArmor(item) ||
						this.itemLooksLikeLoreHelm(item))) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Empty 2os Lore helm/circlet already banked (any configured Lore base)
	hasEmptyLoreBase: function () {
		return !!(this.getBestEmptyLoreBase && this.getBestEmptyLoreBase());
	},

	// Fire Leaf: stop hunting once a real skill orb exists (tier >= 50)
	hasBetterThanLeafOrb: function () {
		if (typeof Item === "undefined" || typeof Item.isOrbItem !== "function") {
			return false;
		}

		return this.memo("betterLeafOrb", this._hasBetterThanLeafOrbRaw);
	},

	_hasBetterThanLeafOrbRaw: function () {
		var item, tier;

		item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (Item.isOrbItem(item)) {
				tier = (typeof NTIP !== "undefined" && NTIP.GetTier) ? (NTIP.GetTier(item) || 0) : 0;

				if (tier >= 50) {
					return true;
				}
			}
		} while (item.getNext());

		return false;
	},

	isLeafRecipe: function (recipe) {
		return !!(recipe && recipe.length === 2 && Runeword.Leaf &&
			recipe[0] === Runeword.Leaf[0] && recipe[1] === Runeword.Leaf[1]);
	},

	// Empty 2os staff that matches a configured Leaf recipe base
	isConfiguredLeafBase: function (unit) {
		var i, rw;

		if (!unit || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		if (unit.quality > 3 || unit.getItem() || (unit.getStat(194) || 0) !== 2) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isLeafRecipe(rw[0])) {
				continue;
			}

			if (this.baseMatchesConfig(unit, rw[1])) {
				return true;
			}
		}

		return false;
	},

	// MiniShopBot: Breast Plate / Light Plate 2os after lvl 17 — requires Stealth recipe
	wantStealthShopBase: function (unit) {
		var sockets;

		if (!Config.MakeRunewords || !unit || me.charlvl < 17) {
			return false;
		}

		// Cheap rejects before recipe / storage scans
		if ((unit.classid !== 334 && unit.classid !== 341) || unit.quality > 3 || unit.getFlag(0x400000)) {
			return false;
		}

		if (unit.getItem()) {
			return false;
		}

		sockets = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			sockets = Math.max(sockets, unit.getStatEx(194) || 0);
		}

		if (sockets !== 2) {
			return false;
		}

		if (!this.hasStealthRecipe()) {
			return false;
		}

		if (this.hasCompletedArmorRuneword() || this.hasEmptyStealthBase()) {
			return false;
		}

		return true;
	},

	// True if unit can hold Lore — any empty 2os white/grey helm/circlet (PD2 classid drift OK)
	isConfiguredLoreBase: function (unit) {
		var socks;

		if (!unit || !this.hasLoreRecipe()) {
			return false;
		}

		if (unit.itemType !== 37 && unit.itemType !== 75) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		}

		if (unit.getFlag(0x400000) || unit.getItem()) {
			return false;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		return socks === 2;
	},

	// MiniShopBot / field: first 2os Lore helm, or strictly higher defense than banked
	wantLoreShopBase: function (unit) {
		if (!Config.MakeRunewords || !unit || me.charlvl < 20) {
			return false;
		}

		return this.wantLoreBase(unit);
	},

	hasSpiritRecipe: function () {
		var i, rw;

		if (!Runeword.Spirit || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && rw[0] && rw[0].length === 4 &&
					rw[0][0] === Runeword.Spirit[0] && rw[0][1] === Runeword.Spirit[1] &&
					rw[0][2] === Runeword.Spirit[2] && rw[0][3] === Runeword.Spirit[3]) {
				return true;
			}
		}

		return false;
	},

	isSpiritRecipe: function (recipe) {
		return !!(recipe && Runeword.Spirit && recipe.length === 4 &&
			recipe[0] === Runeword.Spirit[0] && recipe[1] === Runeword.Spirit[1] &&
			recipe[2] === Runeword.Spirit[2] && recipe[3] === Runeword.Spirit[3]);
	},

	hasCompletedSpiritSword: function () {
		return this.memo("doneSpirit", this._hasCompletedSpiritSwordRaw);
	},

	_hasCompletedSpiritSwordRaw: function () {
		var item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			if (this.itemLooksLikeSpiritSword(item)) {
				return true;
			}
		} while (item.getNext());

		return false;
	},

	// Spirit sword: +2 all skills + 25+ FCR, or fname still says Spirit (stats can lag right after make)
	itemLooksLikeSpiritSword: function (item) {
		var skills, fcr, name;

		if (!item || item.itemType !== 30 || !item.getFlag(0x4000000)) {
			return false;
		}

		if (this.pickitEntries.length && NTIP.CheckItem(item, this.pickitEntries)) {
			return true;
		}

		skills = item.getStat(127) || 0;
		fcr = item.getStat(105) || 0;

		if (typeof item.getStatEx === "function") {
			skills = Math.max(skills, item.getStatEx(127) || 0);
			fcr = Math.max(fcr, item.getStatEx(105) || 0);
		}

		if (skills >= 2 && fcr >= 25) {
			return true;
		}

		name = ((item.fname || "") + " " + (item.name || "")).toLowerCase().replace(/ÿc[0-9a-z]/gi, "");

		return name.indexOf("spirit") !== -1;
	},

	hasEmptySpiritBase: function () {
		return this.memo("emptySpirit", this._hasEmptySpiritBaseRaw);
	},

	_hasEmptySpiritBaseRaw: function () {
		var item = me.getItem(-1, -1), i, rw, socks;

		if (!item) {
			return false;
		}

		do {
			if (item.itemType === 30 && (typeof Item === "undefined" || Item.isRwBaseQuality(item)) &&
					!item.getFlag(0x400000) && !item.getItem()) {
				socks = item.getStat(194) || 0;

				if (typeof item.getStatEx === "function") {
					socks = Math.max(socks, item.getStatEx(194) || 0);
				}

				if (socks !== 4) {
					continue;
				}

				if (!Config.Runewords || !Config.Runewords.length) {
					return true;
				}

				for (i = 0; i < Config.Runewords.length; i += 1) {
					rw = Config.Runewords[i];

					if (!rw || !this.isSpiritRecipe(rw[0])) {
						continue;
					}

					if (this.baseMatchesConfig(item, rw[1])) {
						return true;
					}
				}
			}
		} while (item.getNext());

		return false;
	},

	isConfiguredSpiritBase: function (unit) {
		var i, rw;

		if (!unit || !Runeword.Spirit || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isSpiritRecipe(rw[0])) {
				continue;
			}

			if (this.baseMatchesConfig(unit, rw[1])) {
				return true;
			}
		}

		return false;
	},

	// Chores should open stash to make Spirit when Tal+Thul+Ort+Amn + empty 4os sword ready
	needsSpiritMakeVisit: function () {
		if (!Config.MakeRunewords || !this.hasSpiritRecipe || !this.hasSpiritRecipe()) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) {
			return false;
		}

		if (me.charlvl < 18) {
			return false;
		}

		if (this.hasCompletedSpiritSword && this.hasCompletedSpiritSword()) {
			return false;
		}

		if (!this.haveRunes(Runeword.Spirit, false)) {
			return false;
		}

		return !!(this.hasEmptySpiritBase && this.hasEmptySpiritBase());
	},

	// Empty 4os Spirit sword + runes ready — town next so we socket before selling/idling
	shouldHoldForSpiritMake: function (unit) {
		var socks;

		if (!unit || !Config.MakeRunewords || !this.hasSpiritRecipe || !this.hasSpiritRecipe()) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) {
			return false;
		}

		if (me.charlvl < 18 || unit.itemType !== 30) {
			return false;
		}

		if (unit.getFlag(0x4000000) || unit.getFlag(0x400000) || unit.getItem()) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		if (socks !== 4) {
			return false;
		}

		if (!this.isConfiguredSpiritBase(unit)) {
			return false;
		}

		return this.haveRunes(Runeword.Spirit, false);
	},

	hasRhymeRecipe: function () {
		var i, rw;

		if (!Runeword.Rhyme || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (rw && this.isRhymeRecipe(rw[0])) {
				return true;
			}
		}

		return false;
	},

	isRhymeRecipe: function (recipe) {
		return !!(recipe && Runeword.Rhyme && recipe.length === 2 &&
			recipe[0] === Runeword.Rhyme[0] && recipe[1] === Runeword.Rhyme[1]);
	},

	// 1H only — never make Rhyme while on a 2H staff
	wantsRhymeShieldSlot: function () {
		if (typeof Item !== "undefined" && Item.wantsShieldSlot) {
			return !!Item.wantsShieldSlot();
		}

		return false;
	},

	hasCompletedRhymeShield: function () {
		return this.memo("doneRhyme", this._hasCompletedRhymeShieldRaw);
	},

	_hasCompletedRhymeShieldRaw: function () {
		var item = me.getItem(-1);

		if (!item) {
			return false;
		}

		do {
			// Rhyme: shield RW with Cannot Be Frozen
			if ((item.itemType === 2 || item.itemType === 70) && item.getFlag(0x4000000)) {
				if (this.pickitEntries.length) {
					if (NTIP.CheckItem(item, this.pickitEntries) && (item.getStat(153) || 0) >= 1) {
						return true;
					}
				} else if ((item.getStat(153) || 0) >= 1) {
					return true;
				}
			}
		} while (item.getNext());

		return false;
	},

	hasEmptyRhymeBase: function () {
		return this.memo("emptyRhyme", this._hasEmptyRhymeBaseRaw);
	},

	_hasEmptyRhymeBaseRaw: function () {
		var item = me.getItem(-1, -1), i, rw, socks;

		if (!item) {
			return false;
		}

		do {
			if ((item.itemType === 2 || item.itemType === 70) &&
					(typeof Item === "undefined" || Item.isRwBaseQuality(item)) &&
					!item.getFlag(0x400000) && !item.getItem()) {
				socks = item.getStat(194) || 0;

				if (typeof item.getStatEx === "function") {
					socks = Math.max(socks, item.getStatEx(194) || 0);
				}

				if (socks !== 2) {
					continue;
				}

				if (!Config.Runewords || !Config.Runewords.length) {
					return true;
				}

				for (i = 0; i < Config.Runewords.length; i += 1) {
					rw = Config.Runewords[i];

					if (!rw || !this.isRhymeRecipe(rw[0])) {
						continue;
					}

					if (this.baseMatchesConfig(item, rw[1])) {
						return true;
					}
				}
			}
		} while (item.getNext());

		return false;
	},

	isConfiguredRhymeBase: function (unit) {
		var i, rw;

		if (!unit || !Runeword.Rhyme || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		// Rhyme only ever targets real shields (itemType 2/70). Classid-only matching can
		// collide with an unrelated base on PD2's remapped item table (seen: a Scythe sharing
		// a classid with a configured "shield" name) — never trust classid alone.
		if (unit.itemType !== 2 && unit.itemType !== 70) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isRhymeRecipe(rw[0])) {
				continue;
			}

			if (this.baseMatchesConfig(unit, rw[1])) {
				return true;
			}
		}

		return false;
	},

	needsRhymeMakeVisit: function () {
		if (!Config.MakeRunewords || !this.hasRhymeRecipe()) {
			return false;
		}

		if (!this.wantsRhymeShieldSlot()) {
			return false;
		}

		if (this.hasCompletedRhymeShield()) {
			return false;
		}

		if (!this.haveRunes(Runeword.Rhyme, false)) {
			return false;
		}

		return !!this.hasEmptyRhymeBase();
	},

	shouldHoldForRhymeMake: function (unit) {
		var socks;

		if (!unit || !Config.MakeRunewords || !this.hasRhymeRecipe()) {
			return false;
		}

		if (!this.wantsRhymeShieldSlot()) {
			return false;
		}

		if (unit.itemType !== 2 && unit.itemType !== 70) {
			return false;
		}

		if (unit.getFlag(0x4000000) || unit.getFlag(0x400000) || unit.getItem()) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		}

		socks = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			socks = Math.max(socks, unit.getStatEx(194) || 0);
		}

		if (socks !== 2) {
			return false;
		}

		if (!this.isConfiguredRhymeBase(unit)) {
			return false;
		}

		return this.haveRunes(Runeword.Rhyme, false);
	},

	// MiniShopBot: 4os Crystal/Broad/Long — same gate style as Stealth/Lore
	wantSpiritShopBase: function (unit) {
		var sockets;

		if (!Config.MakeRunewords || !unit || me.charlvl < 18) {
			return false;
		}

		// Poison Strike necro never wants Spirit sword (dagger forever)
		if (typeof Item !== "undefined" && Item.isPoisonStrikeBuild && Item.isPoisonStrikeBuild()) {
			return false;
		}

		// Cheap rejects before recipe / storage scans
		if (unit.itemType !== 30 || unit.getFlag(0x400000)) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		} else if (typeof Item === "undefined" && (!(unit.quality >= 1 && unit.quality <= 3))) {
			return false;
		}

		if (unit.getItem()) {
			return false;
		}

		sockets = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			sockets = Math.max(sockets, unit.getStatEx(194) || 0);
		}

		if (sockets !== 4) {
			return false;
		}

		if (!this.hasSpiritRecipe()) {
			return false;
		}

		if (!this.isConfiguredSpiritBase(unit)) {
			return false;
		}

		if (this.hasCompletedSpiritSword() || this.hasEmptySpiritBase()) {
			return false;
		}

		return true;
	},

	// True if unit is an empty socket base we still need for a configured RW we have runes for
	wantBaseForRunes: function (unit) {
		var i, rw, sockets, ethFlag;

		if (!unit || unit.getItem()) {
			return false;
		}

		if (typeof Item !== "undefined" && Item.isRwBaseQuality && !Item.isRwBaseQuality(unit)) {
			return false;
		} else if (typeof Item === "undefined" && (!(unit.quality >= 1 && unit.quality <= 3))) {
			return false;
		}

		sockets = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			sockets = Math.max(sockets, unit.getStatEx(194) || 0);
		}

		if (sockets < 1) {
			return false;
		}

		// Don't hoard more Stealth bases once one is done
		if (unit.itemType === 3 && this.hasCompletedArmorRuneword()) {
			return false;
		}

		// Don't hoard more Treachery bases once one is done
		if (unit.itemType === 3 && this.hasCompletedTreacheryArmor && this.hasCompletedTreacheryArmor()) {
			return false;
		}

		if ((unit.itemType === 37 || unit.itemType === 75) && this.hasCompletedLoreHelm()) {
			return false;
		}

		if (unit.itemType === 30 && this.hasCompletedSpiritSword && this.hasCompletedSpiritSword()) {
			return false;
		}

		if (unit.itemType === 34 && this.hasCompletedInsight && this.hasCompletedInsight()) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !rw[0] || rw[0] === false) {
				continue;
			}

			// Leaf only until a better fire orb exists
			if (this.isLeafRecipe(rw[0]) && this.hasBetterThanLeafOrb()) {
				continue;
			}

			// One finished Stealth — never need another empty Breast/Light Plate
			if (this.isStealthRecipe(rw[0]) && this.hasCompletedArmorRuneword()) {
				continue;
			}

			// Lore: at most one empty helm — only want higher defense upgrades
			if (this.isLoreRecipe(rw[0])) {
				if (this.hasCompletedLoreHelm() || !this.wantLoreBase(unit)) {
					continue;
				}

				// Bases are string names in Config — don't require classid === rw[1]
				if (this.haveRunes(rw[0])) {
					return true;
				}

				continue;
			}

	// Strength (Amn+Tir): spear / polearm only (merc) — never knives; skip if Purity preferred
			if (this.isStrengthRecipe(rw[0])) {
				if ((this.purityBasesDone && this.purityBasesDone()) ||
						(this.purityOutranksStrength && this.purityOutranksStrength())) {
					continue;
				}

				if (sockets !== 2) {
					continue;
				}

				if (unit.itemType !== 33 && unit.itemType !== 34) {
					continue;
				}

				if (unit.getFlag(0x400000)) {
					continue; // NonEth recipes
				}

				if (this.mercHasStrength()) {
					continue;
				}

				if (this.haveRunes(rw[0])) {
					return true;
				}

				continue;
			}

			// Purity (Amn+Eth+Thul): 3os spear/polearm — outranks Strength
			if (this.isPurityRecipe(rw[0])) {
				if (this.purityBasesDone()) {
					continue;
				}

				if (me.charlvl < 25) {
					continue;
				}

				if (!this.wantPurityBase(unit)) {
					continue;
				}

				if (this.haveRunes(rw[0])) {
					return true;
				}

				continue;
			}

			// Treachery (Shael+Thul+Lem): 3os armor def>120 — best base / upgrade
			if (this.isTreacheryRecipe(rw[0])) {
				if (this.hasCompletedTreacheryArmor() || !this.wantTreacheryBase(unit)) {
					continue;
				}

				if (this.haveRunes(rw[0])) {
					return true;
				}

				continue;
			}

			// Insight — at most one empty base; only want upgrades
			if (this.isInsightRecipe(rw[0])) {
				if (this.hasCompletedInsight()) {
					continue;
				}

				if (!this.wantInsightBase(unit)) {
					continue;
				}
			}

			if (sockets !== rw[0].length) {
				continue;
			}

			if (!this.baseMatchesConfig(unit, rw[1])) {
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
			// Lore/Insight/Treachery: allow upgrades (higher def / better pole) even if a worse empty base exists
			if (this.getBase(rw[0], rw[1], ethFlag)) {
				if (!((this.isInsightRecipe(rw[0]) && this.wantInsightBase(unit)) ||
						(this.isLoreRecipe(rw[0]) && this.wantLoreBase(unit)) ||
						(this.isTreacheryRecipe(rw[0]) && this.wantTreacheryBase(unit)))) {
					continue;
				}
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
		// Never walk to stash here — caller opens when needed; open UI already shows loc 7.
		// MUST slice — splicing the memoized listStorageItems array starves checkRunewords
		// of the same runes (Spirit: base+Tal/Thul/Ort/Amn all present, make still dry-passes).
		items = this.listStorageItems(false).slice();

		for (i = 0; i < Config.Runewords.length; i += 1) {
			if (this.isLeafRecipe(Config.Runewords[i][0]) && this.hasBetterThanLeafOrb()) {
				continue;
			}

			// One Stealth is enough — skip Breast Plate / Light Plate recipes after we have it
			if (this.isStealthRecipe(Config.Runewords[i][0]) && this.hasCompletedArmorRuneword()) {
				continue;
			}

			if (Config.Runewords[i][0] && Runeword.Lore &&
					Config.Runewords[i][0][0] === Runeword.Lore[0] &&
					Config.Runewords[i][0][1] === Runeword.Lore[1] &&
					this.hasCompletedLoreHelm()) {
				continue;
			}

			if (this.isInsightRecipe(Config.Runewords[i][0]) && this.hasCompletedInsight()) {
				continue;
			}

			if (this.isSpiritRecipe(Config.Runewords[i][0]) && this.hasCompletedSpiritSword()) {
				continue;
			}

			if (this.isPurityRecipe(Config.Runewords[i][0]) && this.purityBasesDone()) {
				continue;
			}

			if (this.isTreacheryRecipe(Config.Runewords[i][0]) && this.hasCompletedTreacheryArmor()) {
				continue;
			}

			if (this.isStrengthRecipe(Config.Runewords[i][0]) &&
					(this.mercHasStrength() || (this.hasCompletedInsight && this.hasCompletedInsight()) ||
						(this.purityOutranksStrength && this.purityOutranksStrength()))) {
				continue;
			}

			if (this.isRhymeRecipe(Config.Runewords[i][0]) &&
					(this.hasCompletedRhymeShield() || !this.wantsRhymeShieldSlot())) {
				continue;
			}

			if (!baseCheck) {
				baseCheck = this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0)) || this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0), true);
			}

			if (this.getBase(Config.Runewords[i][0], Config.Runewords[i][1], (Config.Runewords[i][2]||0))) {
RuneLoop:
				for (j = 0; j < Config.Runewords[i][0].length; j += 1) {
					for (k = 0; k < items.length; k += 1) {
						// PD2: match singles or stacks (Tal 634 / Tal stack 708)
						if (this.runeMatchesClassid(items[k], Config.Runewords[i][0][j]) && this.validItem(items[k])) {
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
		var i, needId, picked;

		// PD2 stack classid → recipe single (708 Tal stack → 634)
		if (classid >= 702 && classid <= 734) {
			classid = classid - 74;
		}

		picked = {classid: classid, code: "", itemType: 0};

		for (i = 0; i < this.needList.length; i += 1) {
			needId = this.needList[i];

			if (needId === classid || this.runeMatchesClassid(picked, needId)) {
				this.needList.splice(i, 1);
				break;
			}
		}

		this.validGids.push(gid);
		// Base/rune just entered storage — clear emptySpirit / haveRunes memos
		this.invalidateCache();
	},

	// returns an array of items that make a runeword if found, false if we don't have enough items for any
	checkRunewords: function () {
		var i, j, k, items, base, itemList, recipe, prefix, bestIns, bestLore, loreTried, strengthTried, purityTried, treacheryTried, bestStr, bestPur, bestTr;

		loreTried = false;
		strengthTried = false;
		purityTried = false;
		treacheryTried = false;

		for (i = 0; i < Config.Runewords.length; i += 1) {
			// Fresh copy each recipe — splice on a failed Lore/Insight attempt must not
			// steal Tal/Ort/Amn from Spirit (listStorageItems memo returns the same array).
			items = this.listStorageItems(false).slice();

			if (this.isLeafRecipe(Config.Runewords[i][0]) && this.hasBetterThanLeafOrb()) {
				continue;
			}

			// One Stealth is enough — don't socket a second Breast/Light Plate
			if (this.isStealthRecipe(Config.Runewords[i][0]) && this.hasCompletedArmorRuneword()) {
				continue;
			}

			// Lore: one attempt using the highest-def empty helm (skip Cap/Helm/… name spam)
			if (this.isLoreRecipe(Config.Runewords[i][0])) {
				if (loreTried || this.hasCompletedLoreHelm()) {
					continue;
				}

				loreTried = true;
				bestLore = this.getBestEmptyLoreBase();

				if (!bestLore) {
					continue;
				}

				base = me.getItem(-1, -1, bestLore.gid);

				if (!base) {
					base = bestLore.item;
				}

				recipe = Config.Runewords[i][0];
				itemList = [base];
				prefix = this.socketedRecipePrefix(base, recipe);

				if (prefix > 0) {
					print("ÿc4RWÿc0 :: Lore base has " + prefix + "/" + recipe.length + " already — continue");
				}

RuneLore:
				for (j = prefix; j < recipe.length; j += 1) {
					k = this.findRecipeRune(items, recipe[j]);

					if (k < 0) {
						this.dbg("ÿc1RWÿc0 :: Lore — have base but missing rune classid=" + recipe[j] +
							" (Ort=636 Sol=639); stash runes scanned=" + items.length);
						break RuneLore;
					}

					itemList.push(items[k]);
					items.splice(k, 1);

					if (itemList.length === recipe.length - prefix + 1) {
						return itemList;
					}
				}

				continue;
			}

			// Treachery (Shael+Thul+Lem): best 3os armor def>120
			if (this.isTreacheryRecipe(Config.Runewords[i][0])) {
				if (treacheryTried) {
					continue;
				}

				treacheryTried = true;

				if (me.charlvl < 43 || this.hasCompletedTreacheryArmor()) {
					continue;
				}

				bestTr = this.getBestEmptyTreacheryBase();

				if (!bestTr) {
					continue;
				}

				base = me.getItem(-1, -1, bestTr.gid) || bestTr;
				recipe = Config.Runewords[i][0];
				itemList = [base];
				prefix = this.socketedRecipePrefix(base, recipe);
				items = this.listStorageItems(false).slice();

				if (prefix > 0) {
					print("ÿc4RWÿc0 :: Treachery base has " + prefix + "/" + recipe.length + " already — continue");
				}

RuneTr:
				for (j = prefix; j < recipe.length; j += 1) {
					k = this.findRecipeRune(items, recipe[j]);

					if (k < 0) {
						print("ÿc1RWÿc0 :: Treachery — have base but missing rune classid=" + recipe[j] +
							" (Shael=640 Thul=637 Lem=647); stash runes scanned=" + items.length);
						break RuneTr;
					}

					itemList.push(items[k]);
					items.splice(k, 1);

					if (itemList.length === recipe.length - prefix + 1) {
						return itemList;
					}
				}

				continue;
			}

			// Purity (Amn+Eth+Thul): 3os spear/polearm — try before Strength
			if (this.isPurityRecipe(Config.Runewords[i][0])) {
				if (purityTried) {
					continue;
				}

				purityTried = true;

				if (me.charlvl < 25 || this.purityBasesDone()) {
					continue;
				}

				bestPur = this.getBestEmptyPurityBase();

				if (!bestPur) {
					continue;
				}

				base = me.getItem(-1, -1, bestPur.gid) || bestPur;
				recipe = Config.Runewords[i][0];
				itemList = [base];
				prefix = this.socketedRecipePrefix(base, recipe);
				items = this.listStorageItems(false).slice();

				if (prefix > 0) {
					print("ÿc4RWÿc0 :: Purity base has " + prefix + "/" + recipe.length + " already — continue");
				}

RunePur:
				for (j = prefix; j < recipe.length; j += 1) {
					k = this.findRecipeRune(items, recipe[j]);

					if (k < 0) {
						print("ÿc1RWÿc0 :: Purity — have base but missing rune classid=" + recipe[j] +
							" (Amn=638 Eth=632 Thul=637); stash runes scanned=" + items.length);
						break RunePur;
					}

					itemList.push(items[k]);
					items.splice(k, 1);

					if (itemList.length === recipe.length - prefix + 1) {
						return itemList;
					}
				}

				continue;
			}

			// Strength (Amn+Tir): peel merc 2os spear/polearm — skipped when Purity preferred
			if (this.isStrengthRecipe(Config.Runewords[i][0])) {
				if (strengthTried) {
					continue;
				}

				strengthTried = true;

				if ((this.purityBasesDone && this.purityBasesDone()) ||
						(this.purityOutranksStrength && this.purityOutranksStrength())) {
					continue;
				}

				bestStr = this.getBestEmptyStrengthBase();

				if (!bestStr) {
					continue;
				}

				base = me.getItem(-1, -1, bestStr.gid);

				if (!base) {
					base = bestStr;
				}

				recipe = Config.Runewords[i][0];
				itemList = [base];
				prefix = this.socketedRecipePrefix(base, recipe);
				items = this.listStorageItems(false).slice(); // refresh after peel

				if (prefix > 0) {
					print("ÿc4RWÿc0 :: Strength base has " + prefix + "/" + recipe.length + " already — continue");
				}

RuneStr:
				for (j = prefix; j < recipe.length; j += 1) {
					k = this.findRecipeRune(items, recipe[j]);

					if (k < 0) {
						print("ÿc1RWÿc0 :: Strength — have base but missing rune classid=" + recipe[j] +
							" (Amn=638 Tir=630); found so far=" + (itemList.length - 1) +
							"/" + recipe.length + " stash runes scanned=" + items.length +
							(recipe[j] === 630 ? " ← Tir not in storage scan" :
								(recipe[j] === 638 ? " ← Amn not in storage scan" : "")));
						// Re-allow full diagnose next visit (ghost Tir hunt)
						this._strengthDiagnosed = false;
						this._strengthVisitDiagnosed = false;
						break RuneStr;
					}

					itemList.push(items[k]);
					items.splice(k, 1);

					if (itemList.length === recipe.length - prefix + 1) {
						return itemList;
					}
				}

				continue;
			}

			if (this.isInsightRecipe(Config.Runewords[i][0]) && this.hasCompletedInsight()) {
				continue;
			}

			// Rhyme: only while 1H equipped; skip once we already have one
			if (this.isRhymeRecipe(Config.Runewords[i][0])) {
				if (this.hasCompletedRhymeShield() || !this.wantsRhymeShieldSlot()) {
					continue;
				}
			}

			itemList = []; // reset item list
			recipe = Config.Runewords[i][0];
			base = this.getBase(recipe, Config.Runewords[i][1], (Config.Runewords[i][2]||0)); // check base

			// Rhyme base must actually be a shield (itemType 2/70) — getBase() only matches by
			// classid resolved from the configured name (e.g. "Kite Shield"). If PD2's classid
			// table has that name colliding with some other base (seen: an exceptional Scythe),
			// getBase() would happily hand back a weapon here. Never trust classid alone.
			if (base && this.isRhymeRecipe(recipe) && base.itemType !== 2 && base.itemType !== 70) {
				print("ÿc1RWÿc0 :: Rhyme — rejected classid=" + base.classid + " itemType=" + base.itemType +
					" (not a shield) — classid/name resolution mismatch, skipping");
				base = false;
			}

			// Insight: only socket the best empty pole we own
			if (base && this.isInsightRecipe(recipe)) {
				bestIns = this.getBestEmptyInsightBase();

				if (bestIns && bestIns.gid !== base.gid) {
					continue;
				}
			}

			if (base) {
				itemList.push(base); // push the base
				prefix = this.socketedRecipePrefix(base, recipe);

				if (prefix > 0) {
					print("ÿc4RWÿc0 :: base has " + prefix + "/" + recipe.length + " already — continue");
				}

RuneLoop:
				for (j = prefix; j < recipe.length; j += 1) {
					k = this.findRecipeRune(items, recipe[j]);

					if (k < 0) {
						break RuneLoop;
					}

					itemList.push(items[k]);
					items.splice(k, 1);

					if (itemList.length === recipe.length - prefix + 1) { // remaining runes + base
						return itemList;
					}
				}
			}
		}

		return false;
	},

	checkItem: function (unit) { // for pickit + MiniShopBot
		var i, sockets;

		if (!Config.MakeRunewords || !unit) {
			return false;
		}

		// Needed runes — match any PD2 form (single / stack / rXXg) against needList singles
		if (typeof Pickit !== "undefined" && Pickit.isRuneItem(unit)) {
			for (i = 0; i < this.needList.length; i += 1) {
				if (this.runeMatchesClassid(unit, this.needList[i])) {
					return true;
				}
			}

			return false;
		}

		// Cheap reject: a RW base must be an empty socketed white/grey item.
		// Potions/junk/magic gear never reach the whole-storage scans below.
		if (unit.getItem() || unit.quality > 3) {
			return false;
		}

		sockets = unit.getStat(194) || 0;

		if (typeof unit.getStatEx === "function") {
			sockets = Math.max(sockets, unit.getStatEx(194) || 0);
		}

		if (sockets < 1) {
			return false;
		}

		// Shop/field: Stealth @17+; Lore @20+; Spirit sword @18+; Treachery @35+
		if (this.wantStealthShopBase(unit) || this.wantLoreShopBase(unit) || this.wantSpiritShopBase(unit) ||
				(this.wantTreacheryShopBase && this.wantTreacheryShopBase(unit))) {
			return true;
		}

		// Insight 4os pole — only if first base or strictly better than banked
		if (this.wantInsightBase(unit)) {
			return true;
		}

		// Priority: empty RW base when we already have the runes (e.g. Tal+Eth → Stealth base)
		if (this.wantBaseForRunes(unit)) {
			return true;
		}

		return false;
	},

	keepItem: function (unit) { // clearInventory: needed runes + empty RW bases we still want
		var best;

		if (!unit) {
			return false;
		}

		if (this.validGids.indexOf(unit.gid) > -1) {
			return true;
		}

		// Nip keeps Stealth/Lore/Leaf bases as result 1 with no #tier — Town was selling those as junk
		if (typeof Item !== "undefined" && Item.isProtectedRWBase && Item.isProtectedRWBase(unit)) {
			return true;
		}

		// Best (or only) empty Lore helm — keep; worse ones get culled/sold
		if (this.isConfiguredLoreBase(unit) && this.loreBaseScore(unit) >= 0) {
			best = this.getBestEmptyLoreBase();

			if ((best && best.gid === unit.gid) || this.wantLoreBase(unit)) {
				return true;
			}
		}

		// Best (or only) empty Insight base — keep; worse ones get culled/sold
		if (this.isConfiguredInsightBase(unit) && this.insightBaseScore(unit) > 0) {
			best = this.getBestEmptyInsightBase();

			if ((best && best.gid === unit.gid) || this.wantInsightBase(unit)) {
				return true;
			}
		}

		// Empty 3os Purity spear/polearm — at most one (best), never after Purity/Insight
		if (this.isEmptyPurityBase && this.isEmptyPurityBase(unit) && this.purityBaseScore(unit) > 0 &&
				!(this.purityBasesDone && this.purityBasesDone())) {
			best = this.getBestEmptyPurityBase();

			if ((best && best.gid === unit.gid) || (this.wantPurityBase && this.wantPurityBase(unit))) {
				return true;
			}
		}

		// Empty 3os Purity spear/polearm while Amn+Eth+Thul ready
		if (this.shouldHoldForPurityMake(unit)) {
			return true;
		}

		// Empty 3os Treachery armor (def>120) — best base only
		if (this.shouldHoldForTreacheryMake && this.shouldHoldForTreacheryMake(unit)) {
			return true;
		}

		// Empty 2os Strength spear/polearm (merc) while Amn+Tir ready — not when Purity/Insight exists
		if (!((this.purityBasesDone && this.purityBasesDone()) ||
				(this.purityOutranksStrength && this.purityOutranksStrength())) &&
				this.isEmptyStrengthBase(unit) &&
				(this.shouldHoldForStrengthMake(unit) || this.wantBaseForRunes(unit))) {
			return true;
		}

		// Still need this empty base for a recipe we have runes for
		if (this.wantBaseForRunes && this.wantBaseForRunes(unit)) {
			return true;
		}

		return false;
	},

	/* get the base item based on Config base name/code and runeword recipe
		optional reroll argument = gets a runeword that needs rerolling
		rigged to accept item or name/classid as 2nd arg
		PD2: never me.getItem(LoDClassid) — classids collide (spk/365 = scythe on PD2).
		Match via baseMatchesConfig (item.code vs NTIP 3-letter code).
	*/
	getBase: function (runeword, base, ethFlag, reroll) {
		var item, socks, prefix, socketed, matchName;

		if (typeof base === "object") {
			item = base;
			matchName = false;
		} else {
			if (!this.configBaseCode(base)) {
				return false;
			}

			matchName = base;
			// Scan all storage items — never me.getItem(lodClassid)
			item = me.getItem(-1, -1);
		}

		if (item) {
			do {
				if (item.location !== 3 && item.location !== 7 && typeof base !== "object") {
					continue;
				}

				if (matchName !== false && !this.baseMatchesConfig(item, matchName)) {
					continue;
				}

				socks = item.getStat(194) || 0;

				if (typeof item.getStatEx === "function") {
					socks = Math.max(socks, item.getStatEx(194) || 0);
				}

				if (item && item.quality < 4 && socks === runeword.length) {
					socketed = item.getItem();

					if (reroll) {
						if (socketed && !NTIP.CheckItem(item, this.pickitEntries)) {
							if (!ethFlag || (ethFlag === 1 && item.getFlag(0x400000)) || (ethFlag === 2 && !item.getFlag(0x400000))) {
								return copyUnit(item);
							}
						}
					} else if (item.getFlag(0x4000000)) {
						// already a completed runeword
					} else if (!socketed) {
						// empty sockets
						if (!ethFlag || (ethFlag === 1 && item.getFlag(0x400000)) || (ethFlag === 2 && !item.getFlag(0x400000))) {
							return copyUnit(item);
						}
					} else {
						// In-progress: Tal already in, still need Eth, etc.
						prefix = this.socketedRecipePrefix(item, runeword);

						if (prefix >= 1 && prefix < runeword.length) {
							if (!ethFlag || (ethFlag === 1 && item.getFlag(0x400000)) || (ethFlag === 2 && !item.getFlag(0x400000))) {
								return copyUnit(item);
							}
						}
					}
				}
			} while (typeof base !== "object" && item.getNext());
		}

		return false;
	},

	socketItem: function (base, rune) { // args named this way to prevent confusion
		var i, tick, baseGid, runeGid, cursor, ok;

		if (!base || !rune) {
			return false;
		}

		baseGid = base.gid;
		runeGid = rune.gid;

		this.parkCursorItem();

		base = me.getItem(-1, -1, baseGid);
		rune = me.getItem(-1, -1, runeGid);

		if (!base || !rune) {
			return false;
		}

		if (!this.canSocketRune(rune)) {
			print("ÿc1Runewordsÿc0 :: refuse socket — rune still stacked classid=" + rune.classid +
				" code=" + (rune.code || "?") + " qty=" + this.runeQty(rune));
			return false;
		}

		if (base.location === 7 && !Town.openStash()) {
			return false;
		}

		if (!rune.toCursor()) {
			return false;
		}

		cursor = getUnit(100);

		// Must be holding the rune — never click base with wrong/empty cursor (picks up armor)
		if (!cursor || cursor.gid !== runeGid) {
			print("ÿc1Runewordsÿc0 :: socket abort — cursor is not the rune");
			this.parkCursorItem();
			return false;
		}

		ok = false;

		for (i = 0; i < 3; i += 1) {
			base = me.getItem(-1, -1, baseGid);

			if (!base) {
				break;
			}

			clickItem(0, base.x, base.y, base.location);

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (!me.itemoncursor) {
					delay(300);
					ok = true;
					break;
				}

				delay(10);
			}

			if (ok) {
				return true;
			}
		}

		// Failed: put whatever is on cursor back (often the armor after a bad click)
		if (me.itemoncursor) {
			cursor = getUnit(100);

			if (cursor) {
				print("ÿc1Runewordsÿc0 :: socket fail cleanup — parking cursor classid=" +
					cursor.classid + " loc was " + (base ? base.location : "?"));
			}

			this.parkCursorItem();
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

	// Debug: why Stealth isn't being made (Tal+Eth + Breast/Light Plate)
	diagnoseStealth: function () {
		var i, item, socks, loc, name, code, talS, ethS, talStack, ethStack, baseOk, reasons, rw, baseId, ethFlag, got, rwReady;

		if (!this.hasStealthRecipe()) {
			print("ÿc4Runewordsÿc0 :: Stealth diagnose — no Stealth recipe loaded (not a caster?)");
			return;
		}

		if (this.hasCompletedArmorRuneword()) {
			print("ÿc4Runewordsÿc0 :: Stealth diagnose — already have finished Stealth/armor RW (skip make)");
			return;
		}

		talS = 0;
		ethS = 0;
		talStack = 0;
		ethStack = 0;
		baseOk = 0;
		reasons = [];

		item = me.getItem(-1, -1);

		if (item) {
			do {
				if (this.runeMatchesClassid(item, 634)) { // Tal
					if (this.isPd2RuneStack(item)) {
						talStack += 1;
					} else {
						talS += 1;
					}

					print("ÿc4Runewordsÿc0 :: Tal found classid=" + item.classid +
						" code=" + (item.code || "?") + " type=" + item.itemType +
						" qty=" + (item.getStat(70) || 1) + " loc=" + item.location +
						" stackForm=" + this.isPd2RuneStack(item));
				} else if (this.runeMatchesClassid(item, 632)) { // Eth
					if (this.isPd2RuneStack(item)) {
						ethStack += 1;
					} else {
						ethS += 1;
					}
				}

				if ((item.classid === 334 || item.classid === 341) && item.quality <= 3) {
					socks = item.getStat(194) || 0;

					if (typeof item.getStatEx === "function") {
						socks = Math.max(socks, item.getStatEx(194) || 0);
					}

					loc = item.location;
					name = (item.name || "?").replace(/ÿc[0-9a-z]/gi, "");

					if (socks !== 2) {
						reasons.push(name + " loc=" + loc + " sockets=" + socks + " (need 2)");
					} else if (item.getItem()) {
						reasons.push(name + " loc=" + loc + " already socketed");
					} else if (item.getFlag(0x400000)) {
						reasons.push(name + " loc=" + loc + " ethereal (NonEth only)");
					} else {
						baseOk += 1;
						print("ÿc4Runewordsÿc0 :: Stealth base OK — " + name + " classid=" + item.classid +
							" q=" + item.quality + " loc=" + loc + " (3=inv 7=stash)");
					}
				}
			} while (item.getNext());
		}

		print("ÿc4Runewordsÿc0 :: Stealth runes — Tal single=" + talS + " stack/generic=" + talStack +
			" | Eth single=" + ethS + " stack/generic=" + ethStack +
			" | haveRunes=" + this.haveRunes(Runeword.Stealth));

		if (talS + talStack === 0) {
			// Dump rune-like stash items so we can see live classid/code if match still fails
			item = me.getItem(-1, -1);

			if (item) {
				do {
					code = item.code ? String(item.code).toLowerCase() : "";
					name = item.name ? String(item.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

					if (Pickit.isRuneItem(item) || name.indexOf("tal") > -1 || /^r0/i.test(code)) {
						print("ÿc8Runewordsÿc0 :: rune scan classid=" + item.classid +
							" code=" + (item.code || "?") + " type=" + item.itemType +
							" qty=" + (item.getStat(70) || 1) + " loc=" + item.location +
							" name=" + (item.name || "?").replace(/ÿc[0-9a-z]/gi, ""));
					}
				} while (item.getNext());
			}
		}
		if ((talS + talStack) > 0 && (ethS + ethStack) > 0 && (talS === 0 || ethS === 0)) {
			print("ÿc4Runewordsÿc0 :: Stealth note — PD2 stacks can't socket; make will cube-unstack first");
		}

		rwReady = this.checkRunewords();
		print("ÿc4Runewordsÿc0 :: Stealth checkRunewords=" + (rwReady ? ("yes base=" + rwReady[0].classid + " runes=" + (rwReady.length - 1)) : "NO"));

		if (!baseOk) {
			print("ÿc1Runewordsÿc0 :: Stealth diagnose — no usable empty 2os Breast/Light Plate");

			for (i = 0; i < reasons.length && i < 5; i += 1) {
				print("ÿc1Runewordsÿc0 ::   " + reasons[i]);
			}
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isStealthRecipe(rw[0])) {
				continue;
			}

			baseId = rw[1];
			ethFlag = rw[2] || 0;
			got = this.getBase(rw[0], baseId, ethFlag);

			print("ÿc4Runewordsÿc0 :: Stealth recipe baseId=" + baseId + " ethFlag=" + ethFlag +
				" getBase=" + (got ? "yes" : "NO"));
		}
	},

	makeRunewords: function () {
		if (!Config.MakeRunewords) {
			return false;
		}

		var i, items, stealthWanted, loreWanted, strengthWanted, baseGid, rune, sockOk, base,
			baseName, runeLabel, madeName, prefix, asideN, made, baseCode, baseSocks, recipeLabel, p;

		// Storage may have changed since the last memo (pickups, stash moves) — start clean
		this.invalidateCache();

		// Nothing still wanted (e.g. Lore already on head) — don't walk to stash
		if (!this.hasWantedRecipe()) {
			return false;
		}

		// Merc wearing empty 2os spear — pull it off so Strength (Amn+Tir) can socket
		if (this.hasStrengthRecipe && this.hasStrengthRecipe() &&
				!(this.purityOutranksStrength && this.purityOutranksStrength())) {
			this.peelMercForStrength();
		}

		stealthWanted = this.hasStealthRecipe() && !this.hasCompletedArmorRuneword();
		loreWanted = this.hasLoreRecipe() && !this.hasCompletedLoreHelm();
		strengthWanted = this.hasStrengthRecipe() && !this.mercHasStrength() &&
			!(this.hasCompletedInsight && this.hasCompletedInsight()) &&
			!(this.purityOutranksStrength && this.purityOutranksStrength());
		made = false;

		// Only clear cube UI if it's open — do NOT walk to stash yet
		if (getUIFlag(0x1a)) {
			me.cancel();
			delay(100 + me.ping);
		}

		while (true) {
			// Scan inv + stash contents (getItem sees stash without UI). Never walk to stash just to check.
			this.buildLists();
			items = this.checkRunewords();

			if (!items) { // can't make runewords - exit loop
				// Strength: always dump once per game (PS merc path) — Amn/Tir/base misses are silent otherwise
				if (strengthWanted && !this._strengthDiagnosed) {
					this._strengthDiagnosed = true;
					this._strengthVisitDiagnosed = true;
					print("ÿc1RWÿc0 :: Strength not ready — emptyBase=" +
						!!this.getBestEmptyStrengthBaseNoPeel() +
						" haveAmnTir=" + this.haveRunes(Runeword.Strength, false) +
						" peelMerc=" + this.mercHasPeelableStrengthBase() +
						" storageItems=" + this.listStorageItems(false).length +
						" stashOpen=" + !!getUIFlag(0x19) +
						" needsVisit=" + this.needsStrengthMakeVisit());
					this.diagnoseStrengthRunes();
					this.diagnoseStrengthBases();
				}

				// Diagnose dumps are debug-only and once per game (Config.RunewordDebug)
				if (Config.RunewordDebug) {
					if (stealthWanted && !this._stealthDiagnosed) {
						this._stealthDiagnosed = true;
						this.diagnoseStealth();
					}

					if (loreWanted && !this._loreDiagnosed) {
						this._loreDiagnosed = true;
						this.rwLog("ÿc1RWÿc0 :: Lore not ready — emptyBase=" + !!this.getBestEmptyLoreBase() +
							" haveOrtSol=" + this.haveRunes(Runeword.Lore, false) +
							" storageItems=" + this.listStorageItems(false).length +
							" stashOpen=" + !!getUIFlag(0x19));
						this.diagnoseLoreRunes();
						this.diagnoseLoreBases();
					}
				}

				break;
			}

			// About to peel/socket — now the ForceKeys helper matters (probe can cost ~2s, so only here)
			if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.reportHelperStatus === "function") {
				Pd2Stack.reportHelperStatus(false);
			}

			// Have a recipe — open stash only to prepare/socket (not for a dry check)
			if (!getUIFlag(0x19)) {
				if (!Town.openStash()) {
					print("ÿc1RWÿc0 :: make fail — stash for prepare");
					return false;
				}

				delay(80 + me.ping);
			}

			baseGid = items[0].gid;
			baseName = (items[0].name || "").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0];
			baseCode = items[0].code ? String(items[0].code).toLowerCase() : "?";
			baseSocks = items[0].getStat(194) || 0;

			if (typeof items[0].getStatEx === "function") {
				baseSocks = Math.max(baseSocks, items[0].getStatEx(194) || 0);
			}

			prefix = 0;
			recipeLabel = "?";

			for (i = 0; i < Config.Runewords.length; i += 1) {
				if (!Config.Runewords[i][0]) {
					continue;
				}

				p = this.socketedRecipePrefix(items[0], Config.Runewords[i][0]);
				prefix = Math.max(prefix, p);

				if (this.baseMatchesConfig(items[0], Config.Runewords[i][1]) &&
						items.length - 1 === Config.Runewords[i][0].length - p) {
					recipeLabel = this.recipeName(Config.Runewords[i][0]);
				}
			}

			print("ÿc4RWÿc0 :: make " + recipeLabel +
				" base=" + (baseName || baseCode) +
				" code=" + baseCode +
				" classid=" + items[0].classid +
				" type=" + items[0].itemType +
				" sock=" + baseSocks +
				(prefix > 0 ? (" (" + prefix + " already in)") : "") +
				" — need " + (items.length - 1) + " rune(s) in RECIPE order");

			this.watchPause("make start");

			// Only stashAside when inv actually has helm/circlet/gear under F10
			if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.stashAsideInvGear === "function") {
				asideN = Pd2Stack.stashAsideInvGear([]);

				if (asideN > 0) {
					items[0] = me.getItem(-1, -1, baseGid) || items[0];
					this.watchPause("after stashAside base");
				}
			}

			// Prepare in recipe order (Ort before Sol). Same peel for every rune:
			// qty>1: pickup → Ctrl@F10 → stash pile → Ctrl+Shift@F10 → stash single
			// qty1+: pickup → place@F10 → Ctrl+Shift@F10 → stash single
			for (i = 1; i < items.length; i += 1) {
				rune = items[i];

				if (!rune) {
					print("ÿc1RWÿc0 :: make abort — missing rune slot " + i);
					me.cancel();
					return false;
				}

				runeLabel = this.runeLogLabel(rune);

				if (!this.isPd2RuneStack(rune) && this.canSocketRune(rune)) {
					if (i < items.length - 1) {
						print("Moving to next rune");
					}
					continue;
				}

				this.watchPause("before unstack slot " + i);
				rune = this.unstackOneRune(rune);

				if (!rune || !this.canSocketRune(rune)) {
					print("ÿc1RWÿc0 :: make abort — unstack failed slot " + i + " " + runeLabel);
					me.cancel();
					return false;
				}

				items[i] = rune;

				if (i < items.length - 1) {
					print("Moving to next rune");
				}

				this.watchPause("after unstack slot " + i);
			}

			// Stash stays open for the whole prepare + socket pass — never me.cancel() mid-make
			if (!getUIFlag(0x19)) {
				print("ÿc8RWÿc0 :: stash closed mid-make — reopening (should stay open)");
				this.watchPause("ensure stash open");

				if (!Town.openStash()) {
					print("ÿc1RWÿc0 :: make abort — stash for socket");
					return false;
				}
			}

			base = me.getItem(-1, -1, baseGid);

			if (!base) {
				print("ÿc1RWÿc0 :: make abort — lost base");
				me.cancel();
				return false;
			}

			// Socket while base stays in stash (loc 7). If somehow in inv, park it first.
			if (base.location === 3 && typeof Pd2Stack !== "undefined" &&
					typeof Pd2Stack.stashAsideInvGear === "function") {
				print("ÿc8RWÿc0 :: base was in inv — stashAside before socket");
				Pd2Stack.stashAsideInvGear([]);
				base = me.getItem(-1, -1, baseGid) || base;
			}

			print("ÿc4RWÿc0 :: socket into base loc=" + base.location +
				(base.location === 7 ? " (stash — good)" : " (expected stash)"));

			items[0] = base;

			// Preflight: every recipe rune must be socketable before inserting any
			for (i = 1; i < items.length; i += 1) {
				rune = me.getItem(-1, -1, items[i].gid) || items[i];
				items[i] = rune;

				if (!rune || !this.canSocketRune(rune)) {
					print("ÿc1RWÿc0 :: socket preflight fail — slot " + i + " " +
						this.runeLogLabel(rune) + " still stacked (no sockets written)");
					me.cancel();
					return false;
				}
			}

			sockOk = true;

			for (i = 1; i < items.length; i += 1) {
				rune = me.getItem(-1, -1, items[i].gid) || items[i];
				runeLabel = this.runeLogLabel(rune);

				print("ÿc4RWÿc0 :: socket slot " + i + "/" + (items.length - 1) + " " + runeLabel +
					" (recipe order)");

				this.watchPause("before socket slot " + i);

				if (!this.socketItem(items[0], rune)) {
					print("ÿc1RWÿc0 :: socket fail slot " + i + " " + runeLabel);
					sockOk = false;
					break;
				}

				items[0] = me.getItem(-1, -1, baseGid) || items[0];
				this.watchPause("after socket slot " + i);
			}

			if (!sockOk || !items[0].getFlag(0x4000000)) {
				print("ÿc1RWÿc0 :: make incomplete — stop");
				me.cancel();
				return false;
			}

			madeName = items[0].fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<;.*]/, "");
			print("ÿc2RWÿc0 :: made " + madeName);
			D2Bot.printToConsole("Made runeword: " + madeName, 5);

			if (NTIP.CheckItem(items[0], this.pickitEntries)) {
				Misc.itemLogger("Runeword Kept", items[0]);
				Misc.logItem("Runeword Kept", items[0]);
			}

			made = true;
			this.invalidateCache();

			// Wear Lore/Stealth/etc immediately — chores autoEquip can miss circlets with no #tier
			this.equipMadeItem(me.getItem(-1, -1, baseGid) || items[0], madeName);
		}

		if (!made) {
			// Dry pass: nothing socketed, nothing to reroll, no lists to rebuild
			return false;
		}

		me.cancel();

		this.rerollRunewords();

		return true;
	},

	rerollRunewords: function () {
		var i, base, scroll, hel;

		for (i = 0; i < Config.Runewords.length; i += 1) {
			hel = me.getItem(642, 0); // Hel rune (PD2)


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