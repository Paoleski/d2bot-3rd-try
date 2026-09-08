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

	// Inv (3) + stash (7) + cube (6).
	// openStashFirst=true walks to bank — only when caller needs stash pages visible.
	listStorageItems: function (openStashFirst) {
		var item, list = [];

		if (openStashFirst === true && typeof Town !== "undefined" && typeof Town.openStash === "function") {
			if (!getUIFlag(0x19)) {
				Town.openStash();
				delay(80 + me.ping);
			}
		}

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

		if (/^r\d{2}[sg]?$/i.test(code)) {
			return true;
		}

		t = item.itemType;

		return t === 137 || t === 138 || t === 149 ||
			(t >= 164 && t <= 197);
	},

	// El=1 … Zod=33 from code / stack / type — never invent numbers for jewels
	runeNumberFromItem: function (item) {
		var code, m, id;

		if (!item) {
			return -1;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
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
		if (item.itemType >= 164 && item.itemType <= 196) {
			return item.itemType - 163;
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
				} else if ((item.getStat(105) || 0) >= 20 && (item.getStat(99) || 0) >= 20) {
					// PD2 Stealth: +20 FCR / +20 FHR
					return true;
				}
			}
		} while (item.getNext());

		return false;
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
		var i, rw, baseId, key;

		if (!unit || !this.hasInsightRecipe()) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isInsightRecipe(rw[0])) {
				continue;
			}

			baseId = rw[1];

			if (typeof baseId === "string") {
				key = baseId.replace(/\s+/g, "").toLowerCase();

				if (typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.hasOwnProperty(key)) {
					baseId = NTIPAliasClassID[key];
				} else {
					continue;
				}
			}

			if (unit.classid === baseId) {
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
		var item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if ((item.classid === 334 || item.classid === 341) && item.quality <= 3 &&
					!item.getFlag(0x400000) && (item.getStat(194) || 0) === 2 && !item.getItem()) {
				return true;
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
			// Helm or circlet Lore
			if ((item.itemType === 37 || item.itemType === 75) && item.getFlag(0x4000000)) {
				if (this.pickitEntries.length && NTIP.CheckItem(item, this.pickitEntries)) {
					return true;
				}

				// Lore always grants +25 light res — works even when KeepRunewords/nip miss circlets
				if ((item.getStat(39) || 0) >= 25) {
					return true;
				}
			}
		} while (item.getNext());

		return false;
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

		if (!Item.canEquip(live)) {
			print("ÿc8RWÿc0 :: cannot equip yet " + (madeName || this.runeLogLabel(live)) +
				" (str/dex/lvl)");
			return false;
		}

		bodyLoc = Item.getBodyLoc(live);

		if (!bodyLoc || !bodyLoc.length) {
			return false;
		}

		tier = NTIP.GetTier(live) || 0;

		// Lore circlet/helm with no #tier line yet — still better than empty starter helms
		if (tier < 1 && (live.itemType === 37 || live.itemType === 75) &&
				live.getFlag(0x4000000) && (live.getStat(39) || 0) >= 25) {
			tier = 80;
		}

		if (tier < 1) {
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

				if (Item.equip(live, bodyLoc[j])) {
					Misc.logItem("Equipped", me.getItem(-1, -1, gid) || live);
					this.invalidateCache();
					return true;
				}
			}
		}

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
		var i, rw, baseId, key;

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

			baseId = rw[1];

			if (typeof baseId === "string") {
				key = baseId.replace(/\s+/g, "").toLowerCase();

				if (typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.hasOwnProperty(key)) {
					baseId = NTIPAliasClassID[key];
				} else {
					continue;
				}
			}

			if (unit.classid === baseId) {
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

		if (!this.hasStealthRecipe()) {
			return false;
		}

		if ((unit.classid !== 334 && unit.classid !== 341) || unit.quality > 3 || unit.getFlag(0x400000)) {
			return false;
		}

		if (unit.getItem()) {
			return false;
		}

		sockets = unit.getStat(194) || 0;

		if (sockets !== 2) {
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
			// Sword Spirit: +2 all skills + 25+ FCR
			if (item.itemType === 30 && item.getFlag(0x4000000)) {
				if (this.pickitEntries.length) {
					if (NTIP.CheckItem(item, this.pickitEntries)) {
						return true;
					}
				} else if ((item.getStat(127) || 0) >= 2 && (item.getStat(105) || 0) >= 25) {
					return true;
				}
			}
		} while (item.getNext());

		return false;
	},

	hasEmptySpiritBase: function () {
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

					if (rw && this.isSpiritRecipe(rw[0]) && item.classid === rw[1]) {
						return true;
					}
				}
			}
		} while (item.getNext());

		return false;
	},

	isConfiguredSpiritBase: function (unit) {
		var i, rw, baseId, key;

		if (!unit || !Runeword.Spirit || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !this.isSpiritRecipe(rw[0])) {
				continue;
			}

			baseId = rw[1];

			if (typeof baseId === "string") {
				key = baseId.replace(/\s+/g, "").toLowerCase();

				if (typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.hasOwnProperty(key)) {
					baseId = NTIPAliasClassID[key];
				} else {
					continue;
				}
			}

			if (unit.classid === baseId) {
				return true;
			}
		}

		return false;
	},

	// MiniShopBot: 4os Crystal/Broad/Long — same gate style as Stealth/Lore
	wantSpiritShopBase: function (unit) {
		var sockets;

		if (!Config.MakeRunewords || !unit || me.charlvl < 18) {
			return false;
		}

		if (!this.hasSpiritRecipe()) {
			return false;
		}

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
			// Lore/Insight: allow upgrades (higher def / better pole) even if a worse empty base exists
			if (this.getBase(rw[0], rw[1], ethFlag)) {
				if (!((this.isInsightRecipe(rw[0]) && this.wantInsightBase(unit)) ||
						(this.isLoreRecipe(rw[0]) && this.wantLoreBase(unit)))) {
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
		// Never walk to stash here — caller opens when needed; open UI already shows loc 7
		items = this.listStorageItems(false);

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
	},

	// returns an array of items that make a runeword if found, false if we don't have enough items for any
	checkRunewords: function () {
		var i, j, k, items, base, itemList, recipe, prefix, bestIns, bestLore, loreTried;

		items = this.listStorageItems(false);
		loreTried = false;

		for (i = 0; i < Config.Runewords.length; i += 1) {
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

			if (this.isInsightRecipe(Config.Runewords[i][0]) && this.hasCompletedInsight()) {
				continue;
			}

			itemList = []; // reset item list
			recipe = Config.Runewords[i][0];
			base = this.getBase(recipe, Config.Runewords[i][1], (Config.Runewords[i][2]||0)); // check base

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

		// Shop/field: Stealth @17+; Lore @20+; Spirit sword @18+
		if (this.wantStealthShopBase(unit) || this.wantLoreShopBase(unit) || this.wantSpiritShopBase(unit)) {
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

		// Still need this empty base for a recipe we have runes for
		if (this.wantBaseForRunes && this.wantBaseForRunes(unit)) {
			return true;
		}

		return false;
	},

	/* get the base item based on classid and runeword recipe
		optional reroll argument = gets a runeword that needs rerolling
		rigged to accept item or classid as 2nd arg
	*/
	getBase: function (runeword, base, ethFlag, reroll) {
		var item, socks, prefix, socketed, classid;

		if (typeof base === "object") {
			item = base;
		} else {
			classid = this.resolveBaseClassid(base);

			if (classid < 0 && typeof base === "number") {
				classid = base;
			}

			if (classid < 0) {
				return false;
			}

			// mode -1 covers inv + stash (mode 0 often misses stash)
			item = me.getItem(classid, -1);
		}

		if (item) {
			do {
				if (item.location !== 3 && item.location !== 7 && typeof base !== "object") {
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

		var i, items, stealthWanted, loreWanted, baseGid, rune, sockOk, base,
			baseName, runeLabel, madeName, prefix, asideN, made;

		// Storage may have changed since the last memo (pickups, stash moves) — start clean
		this.invalidateCache();

		// Nothing still wanted (e.g. Lore already on head) — don't walk to stash
		if (!this.hasWantedRecipe()) {
			return false;
		}

		stealthWanted = this.hasStealthRecipe() && !this.hasCompletedArmorRuneword();
		loreWanted = this.hasLoreRecipe() && !this.hasCompletedLoreHelm();
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
			baseName = (items[0].name || items[0].classid || "?").toString().replace(/ÿc[0-9a-z]/gi, "").split("\n")[0];
			prefix = 0;

			for (i = 0; i < Config.Runewords.length; i += 1) {
				if (Config.Runewords[i][0]) {
					prefix = Math.max(prefix, this.socketedRecipePrefix(items[0], Config.Runewords[i][0]));
				}
			}

			print("ÿc4RWÿc0 :: make " + baseName +
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