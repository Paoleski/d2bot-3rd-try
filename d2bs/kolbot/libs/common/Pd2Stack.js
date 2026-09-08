/**
*	@filename	Pd2Stack.js
*	@desc		PD2 rune/perfect-gem/WSS stack + flawless→perfect (3 singles + key cube)
*/

var Pd2Stack = {
	_tokenSeq: 0,
	LOG_FILE: "logs/pd2stack.log",
	_verbose: false, // true = click/key spam to console+file

	// Lab watch pause (Config.RunewordWatchDelay) so you can see separate/clear+/socket
	watchPause: function (tag) {
		var ms = 500;

		try {
			if (typeof Config !== "undefined" && Config.RunewordWatchDelay !== undefined) {
				ms = Config.RunewordWatchDelay;
			}
		} catch (e0) {}

		if (!ms || ms < 1) {
			return;
		}

		if (tag) {
			this.log("ÿc8Pd2Stackÿc0 :: watch " + tag + " (" + ms + "ms)");
		}

		delay(ms);
	},

	// Console + file (plain text, no color codes) — open logs/pd2stack.log in an editor
	log: function (msg) {
		var clean, line;
		print(msg);

		try {
			clean = String(msg).replace(/ÿc[0-9a-z]/gi, "");
			line = "[" + getTickCount() + "] " + clean + "\n";

			if (typeof FileTools !== "undefined") {
				if (typeof FileTools.appendText === "function") {
					FileTools.appendText(this.LOG_FILE, line);
				} else {
					FileTools.writeText(this.LOG_FILE,
						(FileTools.exists(this.LOG_FILE) ? FileTools.readText(this.LOG_FILE) : "") + line);
				}
			}
		} catch (e) {
			// ignore file errors
		}
	},

	vlog: function (msg) {
		if (this._verbose) {
			this.log(msg);
		}
	},

	// Short label for logs: Tal, Eth, r07, gzvs, …
	itemLabel: function (unit) {
		var code, name, num, pad;

		if (!unit) {
			return "?";
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (/^r\d{2}/i.test(code)) {
			num = this.runeNumber(unit);

			if (num >= 1 && num <= 33) {
				pad = ["El", "Eld", "Tir", "Nef", "Eth", "Ith", "Tal", "Ral", "Ort", "Thul",
					"Amn", "Sol", "Shael", "Dol", "Hel", "Io", "Lum", "Ko", "Fal", "Lem",
					"Pul", "Um", "Mal", "Ist", "Gul", "Vex", "Ohm", "Lo", "Sur", "Ber",
					"Jah", "Cham", "Zod"][num - 1];
				return pad + (this.nameShowsPlus(unit) || this.isStacked(unit) ? "+" : "") +
					(this.qty(unit) > 1 ? ("x" + this.qty(unit)) : "");
			}

			return code;
		}

		name = (unit.name || "").replace(/ÿc[0-9a-z]/gi, "").split("\n")[0].replace(/^\s+|\s+$/g, "");

		return name || code || String(unit.classid);
	},

	// --- detection ---

	qty: function (unit) {
		var q, name, m;

		if (!unit) {
			return 0;
		}

		q = unit.getStat(70) || unit.getStat(70, 0) || 0;

		if (q > 0) {
			return q;
		}

		name = (unit.name || "") + "\n" + (unit.fname || "");
		m = String(name).match(/QTY\s*(\d+)/i);

		if (m) {
			return parseInt(m[1], 10);
		}

		// Runes: never guess from a bare digit (Ort/r09 etc. caused false qty>1 → bogus separate).
		// Unknown qty → 0; callers treat that as a single +form (clear+ only).
		if (this.isRuneItem(unit)) {
			return 0;
		}

		// Gems: PD2 sometimes only shows a bare count in the name line
		m = String(name).match(/(?:^|\s)(\d{1,3})(?:\s|$)/);

		return m ? parseInt(m[1], 10) : 0;
	},

	// Flawless stack-form / qty pile (independent of isStackableItem — flawless are not stash-stacked)
	isFlawlessPile: function (unit) {
		var i, code, id;

		if (!this.isFlawlessGem(unit)) {
			return false;
		}

		id = unit.classid;

		for (i = 0; i < this.FLAWLESS.length; i += 1) {
			if (id === this.FLAWLESS[i].stack) {
				return true;
			}
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (/^(g[zl][vygbrlw]|skl)s$/i.test(code)) {
			return true;
		}

		return this.qty(unit) > 1;
	},

	isRuneItem: function (unit) {
		if (typeof Pickit !== "undefined" && typeof Pickit.isRuneItem === "function") {
			return Pickit.isRuneItem(unit);
		}

		return !!(unit && (
			(unit.classid >= 628 && unit.classid <= 660) ||
			(unit.classid >= 702 && unit.classid <= 734) ||
			[74, 75, 137, 138, 149].indexOf(unit.itemType) > -1 ||
			(unit.itemType >= 164 && unit.itemType <= 196)
		));
	},

	// PD2: only flawless + perfect gems stack (not chipped/flawed/normal)
	FLAWLESS: [
		{single: 577, stack: 688, code: "gzv"}, // amethyst
		{single: 582, stack: 690, code: "gly"}, // topaz
		{single: 587, stack: 692, code: "glb"}, // sapphire
		{single: 592, stack: 694, code: "glg"}, // emerald
		{single: 597, stack: 696, code: "glr"}, // ruby
		{single: 602, stack: 698, code: "glw"}, // diamond
		{single: 617, stack: 700, code: "skl"}  // skull
	],

	PERFECT: [
		{single: 578, stack: 689, code: "gpv"}, // amethyst
		{single: 583, stack: 691, code: "gpy"}, // topaz
		{single: 588, stack: 693, code: "gpb"}, // sapphire
		{single: 593, stack: 695, code: "gpg"}, // emerald
		{single: 598, stack: 697, code: "gpr"}, // ruby
		{single: 603, stack: 699, code: "gpw"}, // diamond
		{single: 618, stack: 701, code: "sku"}  // skull
	],

	// Stackable gems = perfect only (flawless are cubed → perfect first, never stacked)
	isGemItem: function (unit) {
		return this.isPerfectGem(unit);
	},

	// Strip PD2 stack suffix so gzv / gzvs share a merge key
	normalizeGemCode: function (code) {
		code = code ? String(code).toLowerCase() : "";

		if (/^(g[a-z]{2}|sk[a-z])s$/i.test(code)) {
			return code.slice(0, -1);
		}

		return code;
	},

	effectiveQty: function (unit) {
		var q = this.qty(unit);

		return q > 0 ? q : 1;
	},

	isFlawlessGem: function (unit) {
		var i, code, id, name, t;

		if (!unit) {
			return false;
		}

		// Never treat perfects as flawless (stops promote loop on finished piles)
		if (this.isPerfectGem(unit)) {
			return false;
		}

		t = unit.itemType;

		if ([58, 59, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86].indexOf(t) > -1) {
			return false;
		}

		id = unit.classid;

		for (i = 0; i < this.FLAWLESS.length; i += 1) {
			if (id === this.FLAWLESS[i].single || id === this.FLAWLESS[i].stack) {
				return true;
			}
		}

		code = this.normalizeGemCode(unit.code);

		// Flawless codes only (gzv/gly/…/skl) — not gcv/gfv/… chipped/flawed
		for (i = 0; i < this.FLAWLESS.length; i += 1) {
			if (code === this.FLAWLESS[i].code) {
				return true;
			}
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (/jewel|potion|charm|\bchipped\b|\bflawed\b|\bperfect\b/.test(name)) {
			return false;
		}

		if (/\bf\.\s*(amethyst|topaz|sapphire|saphire|emerald|ruby|diamond|skull)/i.test(name) ||
				(/flawless/.test(name) && /amethyst|topaz|sapphire|saphire|emerald|ruby|diamond|skull/.test(name))) {
			return true;
		}

		return false;
	},

	isPerfectGem: function (unit) {
		var i, code, id, name, t;

		if (!unit) {
			return false;
		}

		t = unit.itemType;

		if ([58, 59, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86].indexOf(t) > -1) {
			return false;
		}

		id = unit.classid;

		for (i = 0; i < this.PERFECT.length; i += 1) {
			if (id === this.PERFECT[i].single || id === this.PERFECT[i].stack) {
				return true;
			}
		}

		code = this.normalizeGemCode(unit.code);

		for (i = 0; i < this.PERFECT.length; i += 1) {
			if (code === this.PERFECT[i].code) {
				return true;
			}
		}

		// Stack-form perfect codes (gpvs, gpgs, …)
		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (/^(gp[vybgrw]|sku)s$/i.test(code)) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (/jewel|potion|charm|\bchipped\b|\bflawed\b|\bflawless\b/.test(name)) {
			return false;
		}

		if (/\bp\.\s*(amethyst|topaz|sapphire|saphire|emerald|ruby|diamond|skull)/i.test(name) ||
				(/perfect/.test(name) && /amethyst|topaz|sapphire|saphire|emerald|ruby|diamond|skull/.test(name))) {
			return true;
		}

		return false;
	},

	flawlessKey: function (unit) {
		var i, code, id, name, m;

		if (!this.isFlawlessGem(unit)) {
			return "";
		}

		id = unit.classid;

		for (i = 0; i < this.FLAWLESS.length; i += 1) {
			if (id === this.FLAWLESS[i].single || id === this.FLAWLESS[i].stack) {
				return "flawless:" + this.FLAWLESS[i].code;
			}
		}

		code = this.normalizeGemCode(unit.code);

		if (code) {
			for (i = 0; i < this.FLAWLESS.length; i += 1) {
				if (code === this.FLAWLESS[i].code) {
					return "flawless:" + code;
				}
			}
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";
		m = name.match(/\b(?:f\.|flawless)\s*(amethyst|topaz|sapphire|saphire|emerald|ruby|diamond|skull)/i);

		if (m) {
			switch (m[1].toLowerCase()) {
			case "amethyst":
				return "flawless:gzv";
			case "topaz":
				return "flawless:gly";
			case "sapphire":
			case "saphire":
				return "flawless:glb";
			case "emerald":
				return "flawless:glg";
			case "ruby":
				return "flawless:glr";
			case "diamond":
				return "flawless:glw";
			case "skull":
				return "flawless:skl";
			}
		}

		return code ? ("flawless:" + code) : "";
	},

	// Worldstone Shard (PD2) — QTY-stackable misc; not corrupted WSS
	WSS_MAX_STACK: 50,

	isWssItem: function (unit) {
		var code, name, cid;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "wss") {
			return true;
		}

		// Corrupted / event shards are different items
		if (code === "cwss" || code === "iwss") {
			return false;
		}

		cid = unit.classid;

		if (cid === 677 || (typeof NTIPAliasClassID !== "undefined" && NTIPAliasClassID.wss && cid === NTIPAliasClassID.wss)) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (name.indexOf("worldstone") > -1 && name.indexOf("shard") > -1 &&
				name.indexOf("corrupt") < 0 && name.indexOf("tainted") < 0) {
			return true;
		}

		return false;
	},

	// 0 = no known cap (runes/gems). WSS fills to WSS_MAX_STACK then a new pile.
	maxStackQty: function (unit) {
		if (this.isWssItem(unit)) {
			return this.WSS_MAX_STACK;
		}

		return 0;
	},

	stackHasRoom: function (unit) {
		var max, q;

		if (!unit) {
			return false;
		}

		max = this.maxStackQty(unit);

		if (!max) {
			return true;
		}

		q = this.effectiveQty(unit);

		return q < max;
	},

	// Best open pile for this key (highest qty still under max); null if all full
	pickStackTarget: function (group, excludeGid) {
		var i, best, bestQty, q, item, live;

		best = null;
		bestQty = -1;

		for (i = 0; i < group.length; i += 1) {
			item = group[i];

			if (!item || (excludeGid && item.gid === excludeGid)) {
				continue;
			}

			live = me.getItem(-1, -1, item.gid) || item;

			if (!this.stackHasRoom(live)) {
				continue;
			}

			q = this.effectiveQty(live);

			if (q > bestQty) {
				bestQty = q;
				best = live;
			}
		}

		return best;
	},

	// Runes + perfect gems + WSS (flawless go through promoteFlawless, not stash merge)
	isStackableItem: function (unit) {
		var t, code;

		if (!unit) {
			return false;
		}

		t = unit.itemType;
		code = unit.code ? String(unit.code).toLowerCase() : "";

		if ([58, 59, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86].indexOf(t) > -1) {
			return false;
		}

		if (/^(hp|mp|r[pv]|key|isc|tsc|jewl|jwl)/i.test(code)) {
			return false;
		}

		return this.isRuneItem(unit) || this.isPerfectGem(unit) || this.isWssItem(unit);
	},

	// PD2 "plus" / stack-form marker in the item name (after Ctrl+Shift peel the + goes away)
	nameShowsPlus: function (unit) {
		var n;

		if (!unit) {
			return false;
		}

		n = String((unit.name || "") + "\n" + (unit.fname || "")).replace(/ÿc[0-9a-z]/gi, "");

		// Trailing + on a line, or explicit stack wording — not random + in color codes (stripped)
		if (/\+\s*(\n|$)/.test(n)) {
			return true;
		}

		if (/\bstack(ed|able)?\b/i.test(n)) {
			return true;
		}

		return false;
	},

	isStacked: function (unit) {
		var code, qty, id, t;

		if (!unit || !this.isStackableItem(unit)) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";
		qty = this.qty(unit);
		id = unit.classid;
		t = unit.itemType;

		// Explicit stack/generic codes always stacked
		if (/^r\d{2}[sg]$/i.test(code)) {
			return true;
		}

		if (this.isGemItem(unit) && /^(g[a-z]{2}|sk[a-z])s$/i.test(code)) {
			return true;
		}

		if (id >= 688 && id <= 701) {
			return true;
		}

		if (qty > 1) {
			return true;
		}

		// Gems stack type
		if (this.isGemItem(unit) && t === 129) {
			return true;
		}

		if (!this.isRuneItem(unit)) {
			return false;
		}

		// Per-rune generics / rung
		if ((t >= 164 && t <= 197) || t === 149) {
			return true;
		}

		// qty1 plain rXX: trust the name. After Ctrl+Shift peel the "+" drops even if
		// classid/type still look like a stack container for a tick (or permanently on PD2).
		if (/^r\d{2}$/i.test(code)) {
			return this.nameShowsPlus(unit);
		}

		// Fallback: stack containers without plain code
		if (t === 137 || t === 138 || (id >= 702 && id <= 734)) {
			return true;
		}

		return false;
	},

	// Rune only — unstacked single suitable for sockets
	canSocket: function (unit) {
		var code;

		if (!unit || !this.isRuneItem(unit)) {
			return false;
		}

		if (this.qty(unit) > 1) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (!/^r\d{2}$/i.test(code)) {
			return false;
		}

		// After peel, isStacked is name-based — do not hard-reject type 137 / classid 710
		if (this.isStacked(unit)) {
			return false;
		}

		return true;
	},

	_noKeyDownLogged: false,
	_modBlocked: false, // sticky after hard fail — stop spam
	_forceKeysProbed: false,
	_forceKeysOk: false,

	FORCE_FLAG: "data/pd2_forcekeys.flag",
	FORCE_HELPER: "data/pd2_forcekeys.helper",
	FORCE_DEBUG: "data/pd2_forcekeys.debug",
	FORCE_INGAME: "data/pd2_forcekeys.ingame",
	FORCE_INJECT: "data/pd2_forcekeys.inject",
	FORCE_CLICK: "data/pd2_forcekeys.click",
	FORCE_CLICK_DONE: "data/pd2_forcekeys.click.done",
	LAST_MOUSE: "data/pd2_last_mouse.txt",

	readLastMouse: function () {
		var raw, parts, x, y;

		try {
			if (!FileTools.exists(this.LAST_MOUSE)) {
				return null;
			}

			raw = String(FileTools.readText(this.LAST_MOUSE)).replace(/^\s+|\s+$/g, "");
			parts = raw.split(/\s+/);

			if (parts.length < 2) {
				return null;
			}

			x = parseInt(parts[0], 10);
			y = parseInt(parts[1], 10);

			if (isNaN(x) || isNaN(y)) {
				return null;
			}

			return {x: x, y: y};
		} catch (e) {
			return null;
		}
	},

	// Classic 800x600 inventory grid (stash open).
	// Override via data/pd2_inv_layout.txt: "left top cell" (e.g. "404 311 29")
	invCellClient: function (loc, col, row) {
		var left = 404, top = 311, cell = 29, raw, parts;

		try {
			if (FileTools.exists("data/pd2_inv_layout.txt")) {
				raw = String(FileTools.readText("data/pd2_inv_layout.txt")).replace(/^\s+|\s+$/g, "");
				parts = raw.split(/\s+/);

				if (parts.length >= 3) {
					left = parseInt(parts[0], 10);
					top = parseInt(parts[1], 10);
					cell = parseInt(parts[2], 10);
				}
			}
		} catch (e) {}

		if (loc === 7) {
			left = 15;
			top = 143;
		} else if (loc === 6) {
			left = 200;
			top = 200;
		}

		return {
			x: left + col * cell + Math.floor(cell / 2),
			y: top + row * cell + Math.floor(cell / 2)
		};
	},

	// Empty inv → screen clicks. Prefer last_mouse (Tal path), then unlocked spots.
	// item.x = col, item.y = row. FindSpot returns {x:row, y:col}.
	listEmptyInvClickTargets: function () {
		var targets = [], mouse, inv, row, col, locked, pt, maxRow;

		mouse = this.readLastMouse();

		if (mouse) {
			targets.push({x: mouse.x, y: mouse.y, tag: "last_mouse"});
		}

		Storage.Reload();
		inv = Storage.Inventory;
		maxRow = Math.min(7, (inv.height || 8) - 1);

		for (row = 0; row <= maxRow; row += 1) {
			for (col = 0; col <= 9; col += 1) {
				if (inv.buffer[row][col] > 0) {
					continue;
				}

				locked = false;

				try {
					if (Config.Inventory && Config.Inventory[row] && Config.Inventory[row][col] === 0) {
						locked = true;
					}
				} catch (eLock) {}

				if (locked) {
					continue;
				}

				pt = this.invCellClient(3, col, row);
				targets.push({x: pt.x, y: pt.y, col: col, row: row, tag: "cell"});
			}
		}

		return targets;
	},

	saveLastMouse: function (x, y) {
		try {
			FileTools.writeText(this.LAST_MOUSE, x + " " + y);
		} catch (e) {}
	},

	_waitClickDone: function (startTick) {
		var tick, done, parsedTick;

		tick = getTickCount();

		while (getTickCount() - tick < 5000) {
			delay(40);

			try {
				if (!FileTools.exists(this.FORCE_CLICK_DONE)) {
					continue;
				}

				done = String(FileTools.readText(this.FORCE_CLICK_DONE)).replace(/\r?\n/g, " ");

				if (!done || done.indexOf("pending") === 0 || done.length < 4) {
					continue;
				}

				parsedTick = done.match(/tick=(\d+)/);

				if (parsedTick && parseInt(parsedTick[1], 10) < startTick - 5000) {
					continue;
				}

				this.vlog("ÿc4Pd2Stackÿc0 :: click " + done.substr(0, 80));

				return {ok: done.indexOf("OK") === 0, err: done};
			} catch (e2) {}
		}

		this.log("ÿc1Pd2Stackÿc0 :: click timeout");
		return {ok: false, err: "click_timeout"};
	},

	requestScreenClick: function (x, y, mask) {
		var startTick;

		if (!this.hasForceKeysProxy()) {
			return {ok: false, err: "no_helper"};
		}

		startTick = getTickCount();

		try {
			FileTools.writeText(this.FORCE_CLICK_DONE, "pending");
		} catch (e0) {}

		try {
			// MUST be "client" — getMouseCoords / invCellClient are D2 client pixels.
			// "screen" makes the helper ScreenToClient() again → click shifts by window
			// origin and often lands OUTSIDE Game.exe (title bar / desktop).
			FileTools.writeText(this.FORCE_CLICK,
				"client " + x + " " + y + " " + (mask & 3));
		} catch (e1) {
			this.log("ÿc1Pd2Stackÿc0 :: client click write FAIL");
			return {ok: false, err: "click_write"};
		}

		this.log("ÿc4Pd2Stackÿc0 :: client click " + x + "," + y + " mask=" + (mask & 3));

		return this._waitClickDone(startTick);
	},

	// Real UI click on inventory/stash/cube grid cell.
	// Always use calibrated classic screen coords — PD2 RPM layout Left is wrong (~431 vs 404)
	// and misses the empty cell (Eth separate failed at px=445 while Tal worked at ~679).
	requestGridClick: function (loc, col, row, mask) {
		var pt;

		if (!this.hasForceKeysProxy()) {
			return {ok: false, err: "no_helper"};
		}

		pt = this.invCellClient(loc, col, row);
		this.log("ÿc4Pd2Stackÿc0 :: grid→screen loc=" + loc + " cell=" + col + "," + row +
			" → " + pt.x + "," + pt.y + " mask=" + (mask & 3));

		return this.requestScreenClick(pt.x, pt.y, mask);
	},

	// Real UI click via helper — uses data/pd2_last_mouse.txt (working Tal path).
	requestUiClick: function (mask) {
		var mouse;

		mouse = this.readLastMouse();

		if (!mouse) {
			this.log("ÿc1Pd2Stackÿc0 :: UI click — no data/pd2_last_mouse.txt");
			this.log("ÿc8Pd2Stackÿc0 :: pause bot, open stash, hover EMPTY inv cell, F10, unpause");
			return {ok: false, err: "no_mouse_target"};
		}

		this.vlog("ÿc4Pd2Stackÿc0 :: UI click " + mouse.x + "," + mouse.y + " mask=" + (mask & 3));

		return this.requestScreenClick(mouse.x, mouse.y, mask);
	},

	// First free inv cell {col, row} for clickItem(0, col, row, 3). Prefer not keepGid's cell.
	findEmptyInvCell: function (avoidCol, avoidRow) {
		var inv, row, col, locked, maxRow, maxCol;

		Storage.Reload();
		inv = Storage.Inventory;
		maxRow = (inv.height || 8) - 1;
		maxCol = (inv.width || 10) - 1;

		for (row = 0; row <= maxRow; row += 1) {
			for (col = 0; col <= maxCol; col += 1) {
				if (avoidCol !== undefined && avoidRow !== undefined &&
						col === avoidCol && row === avoidRow) {
					continue;
				}

				if (!inv.buffer[row] || inv.buffer[row][col] > 0) {
					continue;
				}

				locked = false;

				try {
					if (Config.Inventory && Config.Inventory[row] && Config.Inventory[row][col] === 0) {
						locked = true;
					}
				} catch (eLock) {}

				if (locked) {
					continue;
				}

				return {col: col, row: row};
			}
		}

		return null;
	},

	// Ctrl-separate ONE from cursor pile onto empty inv under F10.
	// clickItem never sees ForceKeys Ctrl — whole pile dumps. Same as clear+: helper screen click only.
	// Retries on f10_dumped_all (Ctrl flaky even when GASK shows held).
	clickEmptyInvSeparate: function (keepGid) {
		var mouse, reply, attempt, maxAttempts = 3;

		if (!getUIFlag(0x19) && typeof Town !== "undefined" && !Town.openStash()) {
			return {ok: false, err: "stash"};
		}

		if (!me.itemoncursor) {
			this.stashAsideInvGear(keepGid ? [keepGid] : null);
		}

		mouse = this.readLastMouse();

		if (!mouse) {
			this.log("ÿc1Pd2Stackÿc0 :: separate needs F10 — stash open, hover EMPTY first inv slot, F10");
			return {ok: false, err: "no_f10"};
		}

		if (!this.hasForceKeysProxy()) {
			this.log("ÿc1Pd2Stackÿc0 :: separate needs ForceKeys helper (StartForceKeys.bat)");
			return {ok: false, err: "no_helper"};
		}

		for (attempt = 1; attempt <= maxAttempts; attempt += 1) {
			if (!me.itemoncursor) {
				return {ok: false, err: "no_cursor"};
			}

			this.log("ÿc4Pd2Stackÿc0 :: separate Ctrl @ F10 client " + mouse.x + "," + mouse.y +
				" stashOpen=" + !!getUIFlag(0x19) +
				" try=" + attempt + "/" + maxAttempts + " (no clickItem)");
			this.watchPause("separate Ctrl F10 click");

			me.blockMouse = false;
			me.blockKeys = false;
			this.setForceKeys(true, false);
			delay(120 + me.ping); // longer hold — short 60ms was flaky vs dump-all
			this.logForceKeys("pre-separate-f10");
			reply = this.requestScreenClick(mouse.x, mouse.y, 1);
			delay(250 + me.ping);

			if (this.cursorIsGearMistake()) {
				this.clearForceKeys();
				return {ok: false, err: "f10_hit_gear"};
			}

			if (!reply || !reply.ok) {
				this.clearForceKeys();
				return reply || {ok: false, err: "separate_click"};
			}

			// Leftover pile on cursor = Ctrl separate worked
			if (me.itemoncursor) {
				this.clearForceKeys();
				return {ok: true, via: "f10", attempt: attempt};
			}

			this.log("ÿc1Pd2Stackÿc0 :: separate F10 left cursor empty (Ctrl not applied / wrong cell?) try=" +
				attempt);
			this.clearForceKeys();

			// Recover dumped pile from inv and retry
			if (attempt < maxAttempts) {
				if (!this._recoverDumpedStackToCursor(keepGid)) {
					this.log("ÿc1Pd2Stackÿc0 :: separate dump — could not re-pickup pile");
					return {ok: false, err: "f10_dumped_all"};
				}

				this.log("ÿc8Pd2Stackÿc0 :: separate dump — re-picked pile, retrying Ctrl @ F10");
				delay(100 + me.ping);
			}
		}

		return {ok: false, err: "f10_dumped_all"};
	},

	// After whole-stack dump under F10: find that pile in inv and pick it back up
	_recoverDumpedStackToCursor: function (preferGid) {
		var item, best, code, q;

		if (me.itemoncursor) {
			return true;
		}

		if (preferGid) {
			item = me.getItem(-1, -1, preferGid);

			if (item && item.location === 3 && this.isRuneItem(item)) {
				return this.pickupUnit(item);
			}
		}

		best = null;
		item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.location !== 3 || !this.isRuneItem(item)) {
				continue;
			}

			q = this.qty(item);

			// Prefer qty>1 stack that just landed; else qty1 +form
			if (q > 1 || this.isStacked(item)) {
				if (!best || q > this.qty(best)) {
					best = copyUnit(item);
				}
			}
		} while (item.getNext());

		if (!best) {
			return false;
		}

		code = best.code || "?";
		this.log("ÿc4Pd2Stackÿc0 :: recover dump " + this.itemLabel(best) +
			" @" + best.x + "," + best.y + " code=" + code);

		return this.pickupUnit(best);
	},

	// Pick unit onto cursor (stash/inv/cube — stash UI must be open for stash items)
	pickupUnit: function (unit) {
		if (!unit) {
			return false;
		}

		if (me.itemoncursor) {
			this.parkCursor();
		}

		if (unit.location === 7 && typeof Town !== "undefined" && !getUIFlag(0x19) && !Town.openStash()) {
			this.log("ÿc1Pd2Stackÿc0 :: pickup fail — stash closed");
			return false;
		}

		if (typeof Packet !== "undefined" && typeof Packet.itemToCursor === "function") {
			if (!Packet.itemToCursor(unit)) {
				this.log("ÿc1Pd2Stackÿc0 :: pickup fail — Packet " + this.itemLabel(unit));
				return false;
			}
		} else if (!unit.toCursor()) {
			this.log("ÿc1Pd2Stackÿc0 :: pickup fail — toCursor " + this.itemLabel(unit));
			return false;
		}

		delay(80 + me.ping);

		if (!me.itemoncursor) {
			this.log("ÿc1Pd2Stackÿc0 :: pickup fail — not on cursor " + this.itemLabel(unit));
			return false;
		}

		return true;
	},

	// Drop cursor item onto empty F10 cell (no Ctrl/Shift) — used for qty1 +form before clear+
	placeCursorAtF10: function () {
		var mouse, reply;

		mouse = this.readLastMouse();

		if (!mouse) {
			this.log("ÿc1Pd2Stackÿc0 :: placeAtF10 needs F10 coords");
			return {ok: false, err: "no_f10"};
		}

		if (!me.itemoncursor) {
			return {ok: false, err: "no_cursor"};
		}

		if (!getUIFlag(0x19) && typeof Town !== "undefined" && !Town.openStash()) {
			return {ok: false, err: "stash"};
		}

		if (!this.hasForceKeysProxy()) {
			return {ok: false, err: "no_helper"};
		}

		this.log("ÿc4Pd2Stackÿc0 :: placeAtF10 plain click " + mouse.x + "," + mouse.y);
		this.watchPause("placeAtF10");

		me.blockMouse = false;
		me.blockKeys = false;
		this.clearForceKeys();
		delay(40);
		reply = this.requestScreenClick(mouse.x, mouse.y, 0);
		delay(200 + me.ping);

		if (this.cursorIsGearMistake()) {
			return {ok: false, err: "f10_hit_gear"};
		}

		if (!reply || !reply.ok) {
			return reply || {ok: false, err: "place_click"};
		}

		if (me.itemoncursor) {
			this.log("ÿc1Pd2Stackÿc0 :: placeAtF10 — still on cursor (cell occupied / wrong F10?)");
			return {ok: false, err: "still_on_cursor"};
		}

		return {ok: true, via: "f10"};
	},

	// One-shot test: write "r07" (or r08) to data/pd2_force_unstack.txt — ToolsThread runs it in town
	FORCE_UNSTACK: "data/pd2_force_unstack.txt",

	runForceUnstackTest: function () {
		var raw, code, item, result, base;

		try {
			if (!FileTools.exists(this.FORCE_UNSTACK)) {
				return false;
			}

			raw = String(FileTools.readText(this.FORCE_UNSTACK)).replace(/^\s+|\s+$/g, "").toLowerCase();
		} catch (e0) {
			return false;
		}

		if (!raw || raw === "done" || raw === "running" || raw.indexOf("fail") === 0 || raw.indexOf("ok") === 0) {
			return false;
		}

		code = raw.split(/\s+/)[0];

		if (code === "tal") {
			code = "r07";
		}

		if (code === "eth") {
			code = "r08";
		}

		try {
			FileTools.writeText(this.FORCE_UNSTACK, "running");
		} catch (e1) {}

		this.log("ÿc4Pd2Stackÿc0 :: FORCE unstack test for " + code);

		if (!me.inTown) {
			this.log("ÿc1Pd2Stackÿc0 :: force unstack — need town");
			try {
				FileTools.writeText(this.FORCE_UNSTACK, code);
			} catch (e2) {}
			return false;
		}

		if (!this.hasForceKeysProxy()) {
			this.log("ÿc1Pd2Stackÿc0 :: force unstack — helper missing");
			try {
				FileTools.writeText(this.FORCE_UNSTACK, "fail no_helper");
			} catch (e3) {}
			return false;
		}

		item = null;
		base = code.replace(/[sg]$/, "");

		{
			var it = me.getItem(-1, -1), singles = null, stacks = null;

			if (it) {
				do {
					if (!this.isRuneItem(it) || !this.isStacked(it)) {
						continue;
					}

					if (String(it.code || "").toLowerCase().indexOf(base) !== 0) {
						continue;
					}

					if (this.qty(it) <= 1 && !singles) {
						singles = copyUnit(it);
					} else if (this.qty(it) > 1 && !stacks) {
						stacks = copyUnit(it);
					}
				} while (it.getNext());
			}

			// Prefer already-separated + single (tests ctrl+shift clear); else full stack
			item = singles || stacks;
		}

		if (!item) {
			this.log("ÿc1Pd2Stackÿc0 :: force unstack — no stacked " + code + " found");
			try {
				FileTools.writeText(this.FORCE_UNSTACK, "fail no_stack");
			} catch (e4) {}
			return false;
		}

		this.log("ÿc4Pd2Stackÿc0 :: force unstack gid=" + item.gid + " code=" + (item.code || "?") +
			" qty=" + this.qty(item) + " loc=" + item.location);

		result = this.unstackOne(item);

		if (result && this.canSocket(result)) {
			this.log("ÿc2Pd2Stackÿc0 :: FORCE unstack OK code=" + (result.code || "?") +
				" gid=" + result.gid);
			try {
				FileTools.writeText(this.FORCE_UNSTACK, "ok " + (result.code || code));
			} catch (e5) {}
			return true;
		}

		this.log("ÿc1Pd2Stackÿc0 :: FORCE unstack FAILED");
		try {
			FileTools.writeText(this.FORCE_UNSTACK, "fail");
		} catch (e6) {}
		return false;
	},

	// qty1 +form rune/gem in inv or stash (after Ctrl-separate from a pile)
	_findStackedSingleInInv: function (wantRune, codeHint) {
		var item, code, base;

		base = codeHint ? String(codeHint).replace(/[sg]$/i, "").toLowerCase() : "";
		item = me.getItem(-1, -1);

		if (!item) {
			return null;
		}

		do {
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			if (!this.isStacked(item) || this.qty(item) > 1) {
				continue;
			}

			code = item.code ? String(item.code).toLowerCase() : "";

			if (wantRune) {
				if (!this.isRuneItem(item)) {
					continue;
				}

				if (base && code.replace(/[sg]$/, "") !== base && code.indexOf(base) !== 0) {
					continue;
				}

				return copyUnit(item);
			}

			if (this.isGemItem(item)) {
				return copyUnit(item);
			}
		} while (item.getNext());

		return null;
	},

	// After Ctrl-peel: qty1 in INV matching rune (stacked OR plain — may still need mode flip)
	_findPeeledQty1InInv: function (wantRune, codeHint) {
		var item, code, base, wantNum, itemNum, m, best = null;

		base = codeHint ? String(codeHint).replace(/[sg]$/i, "").toLowerCase() : "";
		wantNum = -1;
		m = base.match(/^r(\d{2})$/i);

		if (m) {
			wantNum = parseInt(m[1], 10);
		}

		item = me.getItem(-1, -1);

		if (!item) {
			return null;
		}

		do {
			if (item.location !== 3) {
				continue;
			}

			if (!wantRune || !this.isRuneItem(item)) {
				continue;
			}

			if (this.qty(item) > 1) {
				continue;
			}

			itemNum = this.runeNumber(item);

			if (wantNum > 0 && itemNum !== wantNum) {
				continue;
			}

			if (wantNum < 1 && base) {
				code = item.code ? String(item.code).toLowerCase() : "";

				if (code.replace(/[sg]$/, "") !== base && code.indexOf(base) !== 0) {
					continue;
				}
			}

			if (this.isStacked(item) || this.nameShowsPlus(item)) {
				return copyUnit(item);
			}

			if (!best) {
				best = copyUnit(item);
			}
		} while (item.getNext());

		return best;
	},

	// Always-on diagnose for unstack failures (Ort pile still +, etc.)
	_logRuneFamily: function (tag, codeHint) {
		var item, code, base, n = 0, line;

		base = codeHint ? String(codeHint).replace(/[sg]$/i, "").toLowerCase() : "";
		item = me.getItem(-1, -1);

		if (!item) {
			this.log("ÿc8Pd2Stackÿc0 :: " + tag + " — no items");
			return;
		}

		do {
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			if (!this.isRuneItem(item)) {
				continue;
			}

			code = item.code ? String(item.code).toLowerCase() : "";

			if (base && code.replace(/[sg]$/, "") !== base && code.indexOf(base) !== 0) {
				continue;
			}

			n += 1;
			line = tag + " #" + n + " " + this.itemLabel(item) +
				" gid=" + item.gid + " code=" + code +
				" qty=" + this.qty(item) + " stacked=" + this.isStacked(item) +
				" sock=" + this.canSocket(item) +
				" loc=" + item.location + " @" + item.x + "," + item.y;
			this.log("ÿc8Pd2Stackÿc0 :: " + line);
		} while (item.getNext());

		if (!n) {
			this.log("ÿc8Pd2Stackÿc0 :: " + tag + " — no " + (base || "rune") + " in inv/stash");
		}
	},

	// Move stash/cube rune into inventory so pickup + Ctrl/Ctrl+Shift clicks hit it
	pullToInventory: function (unit) {
		var gid, again, code, base, it;

		if (!unit) {
			return null;
		}

		gid = unit.gid;
		code = unit.code ? String(unit.code).toLowerCase() : "";
		base = code.replace(/[sg]$/, "");

		if (unit.location === 3) {
			return copyUnit(unit);
		}

		if (typeof Town !== "undefined") {
			Town.openStash();
		}

		unit = me.getItem(-1, -1, gid);

		if (!unit) {
			return null;
		}

		if (unit.location === 3) {
			return copyUnit(unit);
		}

		if (!Storage.Inventory.CanFit(unit)) {
			this.log("ÿc1Pd2Stackÿc0 :: pullToInv fail — no room for " + this.itemLabel(unit));
			return null;
		}

		this.log("ÿc4Pd2Stackÿc0 :: pullToInv " + this.itemLabel(unit) + " loc=" + unit.location);

		if (!Storage.Inventory.MoveTo(unit)) {
			this.log("ÿc1Pd2Stackÿc0 :: pullToInv MoveTo failed");
			return null;
		}

		delay(120 + me.ping);
		again = me.getItem(-1, -1, gid);

		if (again && again.location === 3) {
			return copyUnit(again);
		}

		it = me.getItem(-1, -1);

		if (it) {
			do {
				if (it.location !== 3 || !this.isRuneItem(it)) {
					continue;
				}

				code = it.code ? String(it.code).toLowerCase() : "";

				if (base && code.replace(/[sg]$/, "") === base) {
					return copyUnit(it);
				}
			} while (it.getNext());
		}

		return null;
	},

	// Clear PD2 +form — stash UI open:
	// inPlace=true: rune already under F10 (after separate) — Ctrl+Shift only
	// else: pickup → plain place @ F10 → Ctrl+Shift @ F10 (same coords as separate)
	// forceClick=true: always Ctrl+Shift even if canSocket looks true (post-peel mode flip)
	_clearPlusOnUnit: function (unit, inPlace, forceClick) {
		var gid, mouse, reply, after, code, base, wantRune, place;

		if (!unit) {
			return false;
		}

		gid = unit.gid;
		code = unit.code ? String(unit.code).toLowerCase() : "";
		base = code.replace(/[sg]$/, "");
		wantRune = this.isRuneItem(unit);
		mouse = this.readLastMouse();
		inPlace = !!inPlace;
		forceClick = !!forceClick;

		this.log("ÿc4Pd2Stackÿc0 :: clear+ " + this.itemLabel(unit) +
			" gid=" + gid + " loc=" + unit.location +
			(inPlace ? " inPlace" : " place@F10 then click") +
			(forceClick ? " force" : "") +
			(mouse ? (" → F10 client " + mouse.x + "," + mouse.y) : " ÿc1no F10"));

		this.watchPause("clear+ start");

		if (!mouse) {
			this.log("ÿc1Pd2Stackÿc0 :: clear+ needs F10 — pause, OPEN STASH, hover first inv slot, F10");
			return false;
		}

		if (me.itemoncursor && !this.stashFromCursor()) {
			this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — cursor busy");
			return false;
		}

		if (typeof Town === "undefined" || !Town.openStash()) {
			this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — stash");
			return false;
		}

		// Lore circlet under F10 → Ctrl+Shift picks up the base instead of peeling the rune
		this.stashAsideInvGear([gid]);

		if (inPlace) {
			unit = me.getItem(-1, -1, gid) || unit;

			if (!unit || unit.location !== 3) {
				this.log("ÿc8Pd2Stackÿc0 :: clear+ inPlace miss — will place @ F10");
				inPlace = false;
			}
		}

		if (!inPlace) {
			unit = me.getItem(-1, -1, gid) || unit;

			if (!unit) {
				this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — lost unit");
				return false;
			}

			// Already socketable — never Ctrl+Shift again (re-stacks) unless force
			if (!forceClick && wantRune && this.canSocket(unit)) {
				this.log("ÿc2Pd2Stackÿc0 :: clear+ skip — already socketable");
				return copyUnit(unit);
			}

			this.log("ÿc4Pd2Stackÿc0 :: clear+ place qty1 under F10");
			this.watchPause("before placeAtF10 for clear+");

			if (!this.pickupUnit(unit)) {
				this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — pickup");
				return false;
			}

			place = this.placeCursorAtF10();

			if (!place || !place.ok) {
				this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — placeAtF10 " +
					((place && place.err) || "fail"));
				this.parkCursor();
				return false;
			}

			unit = this._findStackedSingleInInv(wantRune, base) ||
				this._findPeeledQty1InInv(wantRune, base) ||
				me.getItem(-1, -1, gid);

			if (!unit || unit.location !== 3) {
				after = this._findUnstackedMatch(wantRune, base, 0);

				if (!forceClick && after && (!wantRune || this.canSocket(after))) {
					this.log("ÿc2Pd2Stackÿc0 :: clear+ ok after place (already socketable)");
					return after;
				}

				this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — no qty1 under F10 after place");
				return false;
			}

			gid = unit.gid;
			this.watchPause("clear+ placed under F10");
		} else {
			this.watchPause("clear+ inPlace under F10");
		}

		if (!getUIFlag(0x19)) {
			if (!Town.openStash()) {
				this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — stash closed");
				return false;
			}
		}

		this.log("ÿc4Pd2Stackÿc0 :: clear+ " + this.itemLabel(unit) +
			" inv @" + unit.x + "," + unit.y +
			" classid=" + unit.classid + " type=" + unit.itemType +
			" plusName=" + this.nameShowsPlus(unit) +
			" stacked=" + this.isStacked(unit) +
			" sock=" + this.canSocket(unit) +
			" stashOpen=" + !!getUIFlag(0x19));

		// Skip only when not forced — post-peel always Ctrl+Shift
		if (!forceClick && this.canSocket(unit)) {
			this.log("ÿc2Pd2Stackÿc0 :: clear+ skip — already socketable");
			return copyUnit(unit);
		}

		this.log("ÿc4Pd2Stackÿc0 :: clear+ Ctrl+Shift @ F10");
		this.watchPause("before clear+ Ctrl+Shift");

		delay(100);

		if (!getUIFlag(0x19) && !Town.openStash()) {
			this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — stash not open for F10 click");
			return false;
		}

		me.blockMouse = false;
		me.blockKeys = false;
		this.setForceKeys(true, true);
		delay(120 + me.ping);
		reply = this.requestScreenClick(mouse.x, mouse.y, 3);
		delay(250 + me.ping);
		this.clearForceKeys();
		this.watchPause("after clear+ click");

		if (this.cursorIsGearMistake()) {
			this.log("ÿc1Pd2Stackÿc0 :: clear+ fail — F10 hit gear not rune");
			return false;
		}

		if (!reply || !reply.ok) {
			this.log("ÿc1Pd2Stackÿc0 :: clear+ F10 click " + ((reply && reply.err) || "fail"));
			return false;
		}

		after = me.getItem(-1, -1, gid);

		if (after && this.canSocket(after)) {
			this.log("ÿc2Pd2Stackÿc0 :: clear+ ok (same gid)");
			return after;
		}

		if (after && !this.isStacked(after) && this.qty(after) <= 1) {
			return after;
		}

		after = this._findUnstackedMatch(wantRune, base, 0);

		if (after && (!wantRune || this.canSocket(after))) {
			this.log("ÿc2Pd2Stackÿc0 :: clear+ ok (new gid=" + after.gid + ")");
			return after;
		}

		this.log("ÿc1Pd2Stackÿc0 :: clear+ still + after F10 Ctrl+Shift @" +
			mouse.x + "," + mouse.y + " (re-F10 with STASH OPEN on the slot the rune sits in)");
		return false;
	},

	// Ctrl/Ctrl+Shift on inv item: MoveTo + F10 click, stash open both times
	modClickItemGrid: function (unit, ctrl, shift) {
		var gid, mouse, reply, mask;

		if (!unit) {
			return {ok: false, err: "no_item"};
		}

		gid = unit.gid;
		mouse = this.readLastMouse();
		mask = (ctrl ? 1 : 0) | (shift ? 2 : 0);

		if (!mouse) {
			this.log("ÿc1Pd2Stackÿc0 :: modClick needs F10 (stash open, first inv slot)");
			return {ok: false, err: "no_f10"};
		}

		this.parkCursor();

		if (typeof Town === "undefined" || !Town.openStash()) {
			return {ok: false, err: "stash"};
		}

		unit = this.pullToInventory(me.getItem(-1, -1, gid) || unit) || me.getItem(-1, -1, gid);

		if (!unit || unit.location !== 3) {
			return {ok: false, err: "not_in_inv"};
		}

		gid = unit.gid;

		if (!getUIFlag(0x19) && !Town.openStash()) {
			return {ok: false, err: "stash"};
		}

		this.log("ÿc4Pd2Stackÿc0 :: modClick placed @" + unit.x + "," + unit.y +
			" stashOpen=" + !!getUIFlag(0x19) +
			" → F10 client " + mouse.x + "," + mouse.y + " mask=" + mask);

		delay(100);

		if (!getUIFlag(0x19) && !Town.openStash()) {
			return {ok: false, err: "stash"};
		}

		me.blockMouse = false;
		me.blockKeys = false;
		this.setForceKeys(!!ctrl, !!shift);
		delay(60);
		reply = this.requestScreenClick(mouse.x, mouse.y, mask);
		delay(250 + me.ping);
		this.clearForceKeys();

		if (!reply || !reply.ok) {
			return {ok: false, err: (reply && reply.err) || "f10_click"};
		}

		return {ok: true, gid: gid};
	},

	logForceKeys: function (tag) {
		var flag = "?", helper = "?", debug = "?", ingame = "?", inject = "?";

		try {
			if (FileTools.exists(this.FORCE_FLAG)) {
				flag = String(FileTools.readText(this.FORCE_FLAG)).replace(/\r?\n/g, " ").substr(0, 40);
			}
		} catch (e0) {
			flag = "err";
		}

		try {
			if (FileTools.exists(this.FORCE_HELPER)) {
				helper = String(FileTools.readText(this.FORCE_HELPER)).replace(/\r?\n/g, " ").substr(0, 40);
			}
		} catch (e1) {
			helper = "err";
		}

		try {
			if (FileTools.exists(this.FORCE_DEBUG)) {
				debug = String(FileTools.readText(this.FORCE_DEBUG)).replace(/\r?\n/g, " ").substr(0, 100);
			} else {
				debug = "missing";
			}
		} catch (e2) {
			debug = "err";
		}

		try {
			if (FileTools.exists(this.FORCE_INGAME)) {
				ingame = String(FileTools.readText(this.FORCE_INGAME)).replace(/\r?\n/g, " ").substr(0, 100);
			} else {
				ingame = "missing (hook not in Game.exe)";
			}
		} catch (e3) {
			ingame = "err";
		}

		try {
			if (FileTools.exists(this.FORCE_INJECT)) {
				inject = String(FileTools.readText(this.FORCE_INJECT)).replace(/\r?\n/g, " ").substr(0, 160);
			} else {
				inject = "missing";
			}
		} catch (e4) {
			inject = "err";
		}

		this.log("ÿc4Pd2Stackÿc0 :: keys[" + tag + "] flag=" + flag +
			" helper=" + helper + " debug=" + debug);
		this.log("ÿc4Pd2Stackÿc0 :: keys[" + tag + "] ingame=" + ingame);
		this.log("ÿc4Pd2Stackÿc0 :: keys[" + tag + "] inject=" + inject);
	},

	setForceKeys: function (ctrl, shift) {
		var mask = 0;

		if (ctrl) {
			mask |= 1;
		}

		if (shift) {
			mask |= 2;
		}

		try {
			FileTools.writeText(this.FORCE_FLAG, String(mask));
		} catch (e) {
			return false;
		}

		delay(40);
		return true;
	},

	clearForceKeys: function () {
		try {
			FileTools.writeText(this.FORCE_FLAG, "0");
		} catch (e1) {}
	},

	// Hold mods + last_mouse UI click (helper also ApplyMask from click line)
	uiModClick: function (ctrl, shift) {
		var reply, mask = (ctrl ? 1 : 0) | (shift ? 2 : 0);

		this.setForceKeys(!!ctrl, !!shift);
		delay(60);
		reply = this.requestUiClick(mask);
		delay(220 + me.ping);
		this.clearForceKeys();

		return reply;
	},

	hasKeyHold: function () {
		return (typeof keyDown === "function" || typeof KeyDown === "function") &&
			(typeof keyUp === "function" || typeof KeyUp === "function");
	},

	hasForceKeysProxy: function () {
		var a, b, now, i, dbgA, dbgB;

		now = getTickCount();

		// Re-check heartbeat every 30s in case helper died
		if (this._forceKeysOk && (now - (this._forceKeysOkAt || 0)) < 30000) {
			return true;
		}

		if (typeof FileTools === "undefined" || !FileTools.exists(this.FORCE_HELPER)) {
			this._forceKeysOk = false;
			this._forceKeysFailReason = "no_helper_file";
			return false;
		}

		// Short anti-spam only (was 2s — hid a live helper after one bad probe)
		if (this._forceKeysProbed && !this._forceKeysOk && (now - (this._forceKeysProbeAt || 0)) < 400) {
			return false;
		}

		this._forceKeysProbed = true;
		this._forceKeysProbeAt = now;

		try {
			// Helper writes heartbeat every ~500ms; old 300ms wait often saw a===b → false DOWN
			a = String(FileTools.readText(this.FORCE_HELPER) || "");

			for (i = 0; i < 8; i += 1) {
				delay(200);
				b = String(FileTools.readText(this.FORCE_HELPER) || "");

				if (a && b && a !== b) {
					this._forceKeysOk = true;
					this._forceKeysOkAt = getTickCount();
					this._modBlocked = false;
					this._forceKeysFailReason = "";
					return true;
				}
			}

			// Fallback: debug file also updates while helper runs ApplyMask
			if (FileTools.exists(this.FORCE_DEBUG)) {
				dbgA = String(FileTools.readText(this.FORCE_DEBUG) || "");
				delay(600);
				dbgB = String(FileTools.readText(this.FORCE_DEBUG) || "");

				if (dbgA && dbgB && dbgA !== dbgB) {
					this._forceKeysOk = true;
					this._forceKeysOkAt = getTickCount();
					this._modBlocked = false;
					this._forceKeysFailReason = "";
					return true;
				}
			}
		} catch (e) {
			this._forceKeysOk = false;
			this._forceKeysFailReason = "read_err";
			return false;
		}

		this._forceKeysOk = false;
		this._forceKeysFailReason = "stale_heartbeat";
		return false;
	},

	// One clear line: helper OK / DOWN (+ empty-cell calibrate hint)
	reportHelperStatus: function (force) {
		var ok, mouse, now, line, ttl;

		ok = this.hasForceKeysProxy();
		now = getTickCount();
		// Cache OK longer; re-check DOWN sooner so a fixed helper is noticed
		ttl = ok ? 60000 : 8000;

		if (!force && this._helperStatusAt && (now - this._helperStatusAt) < ttl &&
				this._helperLastOk === ok) {
			return ok;
		}

		mouse = this.readLastMouse();
		this._helperStatusAt = now;
		this._helperLastOk = ok;

		if (ok) {
			line = "ÿc2Pd2Stackÿc0 :: helper OK";

			if (mouse) {
				line += " | F10 client " + mouse.x + "," + mouse.y;
			} else {
				line += " | ÿc1no F10 (pause → stash → hover rune slot → F10)";
			}

			this.log(line);
		} else {
			this.log("ÿc1Pd2Stackÿc0 :: helper DOWN (" + (this._forceKeysFailReason || "?") +
				") - run StartForceKeys.bat");
		}

		return ok;
	},

	canModClick: function () {
		// Always re-check helper (may start after first no_keydown)
		if (this.hasForceKeysProxy() || this.hasKeyHold()) {
			this._modBlocked = false;
			return true;
		}

		return false;
	},

	noteModFail: function (err) {
		if (err !== "no_keydown" && err !== "no_modclick") {
			return;
		}

		// Don't sticky-block forever — helper may appear next chores pass
		if (!this._noKeyDownLogged) {
			this._noKeyDownLogged = true;
			this.log("ÿc1Pd2Stackÿc0 :: no ctrl/shift — run StartForceKeys.bat (live folder), then reload");
			this.log("ÿc8Pd2Stackÿc0 :: helper must write data/pd2_forcekeys.helper next to this bot");
		}
	},

	_downFn: function () {
		if (typeof keyDown === "function") {
			return keyDown;
		}

		if (typeof KeyDown === "function") {
			return KeyDown;
		}

		return null;
	},

	_upFn: function () {
		if (typeof keyUp === "function") {
			return keyUp;
		}

		if (typeof KeyUp === "function") {
			return KeyUp;
		}

		return null;
	},

	parkCursor: function () {
		var cursor;

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor) {
			return true;
		}

		// Prefer stash for gear (helm/circlet) so we don't drop the Lore base back under F10
		if (this.isInvGearBlocker(cursor)) {
			if (typeof Town !== "undefined") {
				Town.openStash();
			}

			if (Storage.Stash.CanFit(cursor) && Storage.Stash.MoveTo(cursor)) {
				return true;
			}
		}

		if (Storage.Inventory.CanFit(cursor) && Storage.Inventory.MoveTo(cursor)) {
			return true;
		}

		if (Storage.Stash.CanFit(cursor) && Storage.Stash.MoveTo(cursor)) {
			return true;
		}

		// Never me.cancel() while stash is open — closes UI mid runeword / shifts F10
		if (getUIFlag(0x19)) {
			this.log("ÿc1Pd2Stackÿc0 :: parkCursor fail — stash open, cannot cancel");
			return false;
		}

		me.cancel();
		delay(100 + me.ping);

		return !me.itemoncursor;
	},

	// Leftover stack after Ctrl-separate — always stash (not inv under F10)
	stashFromCursor: function () {
		var cursor;

		if (!me.itemoncursor) {
			return true;
		}

		cursor = getUnit(100);

		if (!cursor) {
			return true;
		}

		if (typeof Town !== "undefined") {
			Town.openStash();
		}

		this.log("ÿc4Pd2Stackÿc0 :: stashFromCursor " + this.itemLabel(cursor) +
			" qty=" + this.qty(cursor));

		if (Storage.Stash.CanFit(cursor) && Storage.Stash.MoveTo(cursor)) {
			delay(80 + me.ping);
			return !me.itemoncursor;
		}

		this.log("ÿc8Pd2Stackÿc0 :: stashFromCursor — stash full, parkCursor fallback");
		return this.parkCursor();
	},

	// Move peeled/socketable rune into stash (make pulls it later)
	moveToStash: function (unit) {
		var gid, again;

		if (!unit) {
			return null;
		}

		gid = unit.gid;

		if (unit.location === 7) {
			return copyUnit(unit);
		}

		if (typeof Town !== "undefined" && !getUIFlag(0x19) && !Town.openStash()) {
			return copyUnit(unit);
		}

		this.log("ÿc4Pd2Stackÿc0 :: moveToStash " + this.itemLabel(unit));

		if (Storage.Stash.CanFit(unit) && Storage.Stash.MoveTo(unit)) {
			delay(80 + me.ping);
			again = me.getItem(-1, -1, gid);
			return again ? copyUnit(again) : copyUnit(unit);
		}

		this.log("ÿc8Pd2Stackÿc0 :: moveToStash — no room, leave in inv");
		return copyUnit(unit);
	},

	// Helm / circlet / 2x2+ gear in inv — F10 Ctrl clicks pick these up instead of separating runes
	isInvGearBlocker: function (unit) {
		var t, sx, sy;

		if (!unit) {
			return false;
		}

		if (this.isRuneItem(unit) || this.isGemItem(unit)) {
			return false;
		}

		t = unit.itemType;
		sx = unit.sizex || 1;
		sy = unit.sizey || 1;

		// 37=helm, 75=circlet, 3=armor; also any 2x2+ non-rune (shields, etc.)
		if (t === 37 || t === 75 || t === 3) {
			return true;
		}

		return (sx >= 2 && sy >= 2);
	},

	// Stash Lore base / other gear out of inv so F10 separate/clear+ cannot pick them up
	stashAsideInvGear: function (keepGids) {
		var item, list = [], i, keep = {}, n = 0;

		if (keepGids) {
			if (typeof keepGids === "number") {
				keep[keepGids] = true;
			} else {
				for (i = 0; i < keepGids.length; i += 1) {
					keep[keepGids[i]] = true;
				}
			}
		}

		item = me.getItem(-1, -1);

		if (!item) {
			return 0;
		}

		do {
			if (item.location !== 3 || keep[item.gid] || !this.isInvGearBlocker(item)) {
				continue;
			}

			list.push(copyUnit(item));
		} while (item.getNext());

		if (!list.length) {
			return 0;
		}

		if (typeof Town !== "undefined" && !Town.openStash()) {
			this.log("ÿc1Pd2Stackÿc0 :: stashAside — stash open failed");
			return 0;
		}

		for (i = 0; i < list.length; i += 1) {
			item = me.getItem(-1, -1, list[i].gid);

			if (!item || item.location !== 3) {
				continue;
			}

			if (!Storage.Stash.CanFit(item)) {
				this.log("ÿc8Pd2Stackÿc0 :: stashAside skip (no room) " + this.itemLabel(item));
				continue;
			}

			this.log("ÿc4Pd2Stackÿc0 :: stashAside " + this.itemLabel(item) +
				" (keep F10 clear for unstack)");

			if (Storage.Stash.MoveTo(item)) {
				n += 1;
				delay(80 + me.ping);
			}
		}

		return n;
	},

	// After F10 click: if cursor holds helm/circlet/gear, we clicked the Lore base — abort
	cursorIsGearMistake: function () {
		var cursor;

		if (!me.itemoncursor) {
			return false;
		}

		cursor = getUnit(100);

		if (!cursor || !this.isInvGearBlocker(cursor)) {
			return false;
		}

		this.log("ÿc1Pd2Stackÿc0 :: F10 picked up " + this.itemLabel(cursor) +
			" (gear was under click) — parking to stash");
		this.parkCursor();
		return true;
	},

	// Hold modifiers via helper SendInput or keyDown, then click item / cell
	executeModClick: function (req) {
		var item, downFn, upFn, VK_CONTROL = 0x11, VK_SHIFT = 0x10, ctrl, shift, usedForce, reply;

		if (!req) {
			return {ok: false, err: "bad_req"};
		}

		ctrl = !!req.ctrl;
		shift = !!req.shift;
		usedForce = false;

		if (!this.canModClick()) {
			this.noteModFail("no_modclick");
			return {ok: false, err: "no_modclick"};
		}

		me.blockMouse = true;
		// Do not blockKeys while forcing mods — may interfere with GetAsyncKeyState path
		me.blockKeys = !this.hasForceKeysProxy();

		this.log("ÿc4Pd2Stackÿc0 :: executeModClick ctrl=" + ctrl + " shift=" + shift +
			" gid=" + (req.gid || "-") + " force=" + this.hasForceKeysProxy() +
			" blockKeys=" + me.blockKeys);

		try {
			if (req.gid) {
				item = me.getItem(-1, -1, req.gid);

				if (!item) {
					return {ok: false, err: "no_item"};
				}

				if (item.location === 7) {
					if (typeof Town === "undefined" || !Town.openStash()) {
						return {ok: false, err: "stash"};
					}
				} else if (item.location === 3 || item.location === 0) {
					if (typeof Town !== "undefined") {
						Town.openStash();
					}
				}

				item = me.getItem(-1, -1, req.gid);

				if (!item) {
					return {ok: false, err: "no_item"};
				}

				if (this.hasForceKeysProxy()) {
					// All runes/gems: PathB grid UI click only — clickItem never clears PD2 +form
					usedForce = true;
					me.blockMouse = false;
					reply = this.modClickItemGrid(item, ctrl, shift);
					me.blockMouse = true;

					if (!reply || !reply.ok) {
						return {ok: false, err: (reply && reply.err) || "grid_click"};
					}
				} else {
					downFn = this._downFn();
					upFn = this._upFn();

					if (!downFn || !upFn) {
						return {ok: false, err: "no_keydown"};
					}

					if (ctrl) {
						downFn(VK_CONTROL);
					}

					if (shift) {
						downFn(VK_SHIFT);
					}

					delay(30);

					// No helper: still try grid via keyDown if we can screen-click; else clickItem last resort
					try {
						clickItem(0, item.x, item.y, item.location);
					} catch (e1) {
						clickItem(0, item);
					}

					delay(120 + me.ping);

					if (shift) {
						upFn(VK_SHIFT);
					}

					if (ctrl) {
						upFn(VK_CONTROL);
					}
				}
			} else if (req.x !== undefined && req.y !== undefined && req.loc !== undefined) {
				if (req.loc === 7 && typeof Town !== "undefined" && !Town.openStash()) {
					return {ok: false, err: "stash"};
				}

				if (req.loc === 3 && typeof Town !== "undefined") {
					Town.openStash();
				}

				if (this.hasForceKeysProxy()) {
					// req.x=col, req.y=row — PathB grid UI (not clickItem)
					usedForce = true;
					me.blockMouse = false;

					if (!this.setForceKeys(!!ctrl, !!shift)) {
						return {ok: false, err: "force_flag"};
					}

					delay(80);
					reply = this.requestGridClick(req.loc, req.x, req.y, (ctrl ? 1 : 0) | (shift ? 2 : 0));
					delay(280 + me.ping);
					this.clearForceKeys();
					me.blockMouse = true;

					if (!reply || !reply.ok) {
						return {ok: false, err: (reply && reply.err) || "grid_click"};
					}
				} else {
					downFn = this._downFn();
					upFn = this._upFn();

					if (!downFn || !upFn) {
						return {ok: false, err: "no_keydown"};
					}

					if (ctrl) {
						downFn(VK_CONTROL);
					}

					if (shift) {
						downFn(VK_SHIFT);
					}

					delay(30);
					clickItem(0, req.x, req.y, req.loc);
					delay(120 + me.ping);

					if (shift) {
						upFn(VK_SHIFT);
					}

					if (ctrl) {
						upFn(VK_CONTROL);
					}
				}
			} else {
				return {ok: false, err: "no_target"};
			}

			delay(80 + me.ping);
		} finally {
			if (usedForce) {
				delay(50);
				this.clearForceKeys();
			}

			me.blockMouse = false;
			me.blockKeys = false;
		}

		return {ok: true};
	},

	// Main bot → ToolsThread request / wait for result
	requestModClick: function (opts) {
		var token, result, handler, tick, payload, local;

		opts = opts || {};

		// Don't spam ToolsThread when this d2bs can't hold modifiers
		if (!this.canModClick()) {
			this.noteModFail("no_keydown");
			return {ok: false, err: "no_keydown", event: "pd2Stack", op: "modClickResult"};
		}

		this._tokenSeq += 1;
		token = String(getTickCount()) + "_" + this._tokenSeq;
		result = null;

		handler = function (msg) {
			var obj;

			try {
				obj = (typeof msg === "string") ? JSON.parse(msg) : msg;
			} catch (e) {
				return;
			}

			if (obj && obj.event === "pd2Stack" && obj.op === "modClickResult" &&
					String(obj.token) === token) {
				result = obj;
			}
		};

		addEventListener("scriptmsg", handler);

		payload = {
			event: "pd2Stack",
			op: "modClick",
			token: token,
			ctrl: !!opts.ctrl,
			shift: !!opts.shift
		};

		if (opts.gid) {
			payload.gid = opts.gid;
		}

		if (opts.x !== undefined) {
			payload.x = opts.x;
			payload.y = opts.y;
			payload.loc = opts.loc;
		}

		scriptBroadcast(JSON.stringify(payload));

		tick = getTickCount();

		while (!result && getTickCount() - tick < 2500) {
			delay(40 + Math.floor(me.ping / 4));
		}

		removeEventListener("scriptmsg", handler);

		if (result) {
			if (!result.ok) {
				this.noteModFail(result.err);
			}

			return result;
		}

		// ToolsThread silent / not running — try same-thread execute (still needs keyDown)
		this.log("ÿc8Pd2Stackÿc0 :: ToolsThread no reply — local modClick fallback");
		local = this.executeModClick(payload);
		local.token = token;
		local.op = "modClickResult";
		local.event = "pd2Stack";

		if (!local.ok) {
			this.noteModFail(local.err);
		}

		return local;
	},

	toggle: function (unit) {
		var gid, beforeStacked, after, reply;

		if (!unit || !this.isStackableItem(unit)) {
			return false;
		}

		gid = unit.gid;
		beforeStacked = this.isStacked(unit);

		this.log("ÿc4Pd2Stackÿc0 :: toggle gid=" + gid + " stacked=" + beforeStacked +
			" classid=" + unit.classid + " code=" + (unit.code || "?") +
			" type=" + unit.itemType + " qty=" + this.qty(unit));

		this.parkCursor();

		if (typeof Town !== "undefined") {
			Town.openStash();
		}

		unit = me.getItem(-1, -1, gid);

		if (!unit) {
			this.log("ÿc1Pd2Stackÿc0 :: toggle fail — lost gid");
			return false;
		}

		reply = this.requestModClick({gid: gid, ctrl: true, shift: true});

		if (!reply || !reply.ok) {
			this.log("ÿc1Pd2Stackÿc0 :: toggle fail — " + ((reply && reply.err) || "timeout"));
			return false;
		}

		delay(250 + me.ping);
		after = me.getItem(-1, -1, gid);

		// gid may change on form flip — search by code/type near same location
		if (!after) {
			this.log("ÿc4Pd2Stackÿc0 :: toggle ok (gid changed — form flipped)");
			return true;
		}

		this.log("ÿc4Pd2Stackÿc0 :: toggle ok gid=" + gid + " stackedNow=" + this.isStacked(after));
		return true;
	},

	// Prefer socketable rune after unstack; gems just need !isStacked.
	// codeHint REQUIRED for runes — never return a different rune (Ort≠Sol).
	_findUnstackedMatch: function (wantRune, codeHint, classidHint) {
		var items, i, item, code, hintBase, itemBase, wantNum, itemNum, m;

		hintBase = codeHint ? String(codeHint).replace(/[sg]$/i, "").toLowerCase() : "";
		wantNum = -1;
		m = hintBase.match(/^r(\d{2})$/i);

		if (m) {
			wantNum = parseInt(m[1], 10);
		}

		items = me.findItems(-1, -1);

		if (!items) {
			return false;
		}

		for (i = 0; i < items.length; i += 1) {
			item = items[i];

			if (wantRune) {
				if (!this.canSocket(item)) {
					continue;
				}

				// With a recipe hint, ONLY accept that rune # / code
				if (hintBase) {
					itemNum = this.runeNumber(item);

					if (wantNum > 0) {
						if (itemNum !== wantNum) {
							continue;
						}
					} else {
						code = item.code ? String(item.code).toLowerCase() : "";
						itemBase = code.replace(/[sg]$/, "");

						if (itemBase !== hintBase && code.indexOf(hintBase) !== 0) {
							continue;
						}
					}
				}

				return copyUnit(item);
			}

			if (!this.isGemItem(item) || this.isStacked(item)) {
				continue;
			}

			if (classidHint && item.classid !== classidHint &&
					!(item.classid >= 574 && item.classid <= 618)) {
				// loose match OK for gems after toggle
			}

			return copyUnit(item);
		}

		// Broader "any socketable" ONLY when no rune hint (avoid Ort stealing Sol slot)
		if (!hintBase) {
			for (i = 0; i < items.length; i += 1) {
				item = items[i];

				if (wantRune && this.canSocket(item)) {
					return copyUnit(item);
				}

				if (!wantRune && this.isGemItem(item) && !this.isStacked(item)) {
					return copyUnit(item);
				}
			}
		}

		return false;
	},

	// PD2 unstack — same recipe for every rune (Lore Ort then Sol, etc.):
	//   qty > 1: pickup → Ctrl @ F10 (peel ONE) → stash leftover pile →
	//            Ctrl+Shift @ F10 (clear +) → stash socketable rune
	//   qty == 1 +form: pickup → plain place @ F10 → Ctrl+Shift @ F10 → stash
	// Stash stays open; base stays in stash (caller stashAsides gear first).
	// (clickItem never applies Ctrl/Shift for PD2 stack ops)
	unstackOne: function (unit) {
		var gid, code, wantRune, reply, found, q, base, needSeparate, mouse, didSeparate;

		if (!unit) {
			return false;
		}

		if (!this.isStackableItem(unit) && !this.isFlawlessPile(unit)) {
			return false;
		}

		wantRune = this.isRuneItem(unit);

		if (!this.isStacked(unit) && !this.isFlawlessPile(unit)) {
			if (wantRune && this.canSocket(unit)) {
				return copyUnit(unit);
			}

			if (!wantRune) {
				return copyUnit(unit);
			}

			return false;
		}

		if (!this.canModClick()) {
			this.noteModFail("no_keydown");
			this.reportHelperStatus(true);
			this.log("ÿc1Pd2Stackÿc0 :: unstack — helper needed (StartForceKeys.bat)");
			return false;
		}

		mouse = this.readLastMouse();

		if (!mouse) {
			this.log("ÿc1Pd2Stackÿc0 :: unstack needs F10 — stash open, hover first inv slot, F10");
			this.reportHelperStatus(true);
			return false;
		}

		gid = unit.gid;
		code = unit.code ? String(unit.code).toLowerCase() : "";
		base = code.replace(/[sg]$/, "");
		q = this.qty(unit);
		needSeparate = (q > 1);
		didSeparate = false;

		this.log("ÿc4Pd2Stackÿc0 :: unstack " + this.itemLabel(unit) +
			" qty=" + (q > 0 ? q : 1) +
			(needSeparate ? " (pickup→Ctrl F10→stash pile→Ctrl+Shift F10→stash)" :
				" (pickup→place F10→Ctrl+Shift F10→stash)") +
			" F10=" + mouse.x + "," + mouse.y);

		this.watchPause("unstack start");
		this.parkCursor();

		if (typeof Town === "undefined" || !Town.openStash()) {
			this.log("ÿc1Pd2Stackÿc0 :: unstack fail — stash");
			return false;
		}

		// Keep F10 clear of circlet/helm (Lore base must stay in stash)
		this.stashAsideInvGear([gid]);
		this.watchPause("after stashAside");

		unit = me.getItem(-1, -1, gid);

		if (!unit) {
			this.log("ÿc1Pd2Stackÿc0 :: unstack fail — lost item");
			return false;
		}

		gid = unit.gid;
		q = this.qty(unit);
		needSeparate = (q > 1);
		me.blockMouse = false;
		me.blockKeys = false;

		// Already socketable — stop before separate/clear+
		if (wantRune && this.canSocket(unit)) {
			this.log("ÿc2Pd2Stackÿc0 :: unstack skip — already socketable " + this.itemLabel(unit) +
				" classid=" + unit.classid + " type=" + unit.itemType);
			return this.moveToStash(unit) || copyUnit(unit);
		}

		found = this._findUnstackedMatch(wantRune, base, 0);

		if (found && (!wantRune || this.canSocket(found))) {
			this.log("ÿc2Pd2Stackÿc0 :: unstack skip — found socketable " + this.itemLabel(found));
			return this.moveToStash(found) || found;
		}

		// --- qty > 1: pickup → Ctrl @ F10 → stash leftover ---
		if (needSeparate) {
			if (!getUIFlag(0x19) && !Town.openStash()) {
				this.log("ÿc1Pd2Stackÿc0 :: unstack fail — stash for separate");
				return false;
			}

			this.log("ÿc4Pd2Stackÿc0 :: step1 pickup stack " + this.itemLabel(unit) + " qty=" + q);
			this.watchPause("before pickup for separate");

			if (!this.pickupUnit(unit)) {
				return false;
			}

			{
				var cur = getUnit(100);

				if (cur && this.isInvGearBlocker(cur)) {
					this.log("ÿc1Pd2Stackÿc0 :: unstack fail — picked gear not rune (" +
						this.itemLabel(cur) + ")");
					this.parkCursor();
					return false;
				}
			}

			this.log("ÿc4Pd2Stackÿc0 :: step1b Ctrl @ F10 separate");
			this.watchPause("pile on cursor — about to Ctrl-separate");
			reply = this.clickEmptyInvSeparate(gid);
			this.watchPause("after separate click");

			{
				var curAfter = getUnit(100), qCur = 0;

				if (curAfter && this.isRuneItem(curAfter)) {
					qCur = this.qty(curAfter);
					this.log("ÿc4Pd2Stackÿc0 :: after separate cursor=" +
						this.itemLabel(curAfter) + " qty=" + qCur);
				} else if (me.itemoncursor) {
					this.log("ÿc8Pd2Stackÿc0 :: after separate cursor non-rune gid=" +
						(curAfter ? curAfter.gid : "?"));
				} else {
					this.log("ÿc4Pd2Stackÿc0 :: after separate cursor empty");
				}
			}

			if (this.cursorIsGearMistake()) {
				this.log("ÿc1Pd2Stackÿc0 :: unstack fail — separate hit circlet/helm under F10");
				return false;
			}

			if (!reply || !reply.ok) {
				this.log("ÿc1Pd2Stackÿc0 :: unstack fail — separate " +
					((reply && reply.err) || "no_reply"));
				this.parkCursor();
				return false;
			}

			// Leftover pile → stash (qty1 stays under F10 for clear+)
			if (me.itemoncursor) {
				this.log("ÿc4Pd2Stackÿc0 :: step2 stash leftover pile");
				this.watchPause("stash leftover pile");

				if (!this.stashFromCursor()) {
					this.log("ÿc1Pd2Stackÿc0 :: unstack fail — could not stash leftover pile");
					return false;
				}

				this.watchPause("after stash leftover");
			}

			delay(100);

			// qty1 that just landed under F10 (inv). Prefer +form; also accept plain qty1
			// that still needs Ctrl+Shift mode flip (PD2 often hides the "+" after peel).
			unit = null;
			{
				var invOne = this._findStackedSingleInInv(wantRune, base);

				if (invOne && invOne.location === 3) {
					unit = invOne;
				}
			}

			if (!unit) {
				unit = this._findPeeledQty1InInv(wantRune, base);
			}

			if (!unit) {
				unit = me.getItem(-1, -1, gid);

				if (unit && this.qty(unit) > 1) {
					this.log("ÿc1Pd2Stackÿc0 :: unstack fail — separate no-op (pile still qty=" +
						this.qty(unit) + ")");
					this._logRuneFamily("separate-noop", base);
					return false;
				}

				if (unit && unit.location !== 3) {
					unit = null;
				}
			}

			if (!unit) {
				// Do NOT accept canSocket here — that skipped Ctrl+Shift and left +form runes
				this.log("ÿc1Pd2Stackÿc0 :: unstack fail — no qty1 in inv after separate (need clear+)");
				this._logRuneFamily("after-separate", base);
				return false;
			}

			gid = unit.gid;
			didSeparate = true;
			this.log("ÿc4Pd2Stackÿc0 :: separated → " + this.itemLabel(unit) +
				" @" + unit.x + "," + unit.y +
				" stacked=" + this.isStacked(unit) + " sock=" + this.canSocket(unit) +
				" — MUST Ctrl+Shift @ F10 (mode flip)");
			this.watchPause("separated — about to clear+");
		} else {
			// qty == 1: skip Ctrl peel — put straight on F10, then Ctrl+Shift to unstackable
			this.log("ÿc4Pd2Stackÿc0 :: qty1 — skip peel, place @ F10 then Ctrl+Shift");
			this.watchPause("qty1 place@F10");

			if (wantRune && this.canSocket(unit)) {
				return this.moveToStash(unit) || copyUnit(unit);
			}

			if (!this.isStacked(unit) && wantRune && !this.canSocket(unit)) {
				// qty1 but wrong form — still need clear+
				this.log("ÿc8Pd2Stackÿc0 :: qty1 not stacked flag but not socketable — clear+ anyway");
			} else if (!this.isStacked(unit)) {
				if (!wantRune) {
					return this.moveToStash(unit) || copyUnit(unit);
				}

				this.log("ÿc1Pd2Stackÿc0 :: unstack fail — not stacked but not socketable (" + code + ")");
				return false;
			}

			// pickup → plain click F10 → Ctrl+Shift F10 (same coords as peel)
			found = this._clearPlusOnUnit(unit, false);

			if (found && (!wantRune || this.canSocket(found))) {
				this.log("ÿc4Pd2Stackÿc0 :: qty1 stash socketable rune");
				found = this.moveToStash(found) || found;
				this.log("ÿc2Pd2Stackÿc0 :: unstack ok " + this.itemLabel(found) + " (qty1 clear+)");
				return found;
			}

			found = this._findUnstackedMatch(wantRune, base, 0);

			if (found && (!wantRune || this.canSocket(found))) {
				return this.moveToStash(found) || found;
			}

			this.log("ÿc1Pd2Stackÿc0 :: unstack fail — qty1 still + (" + (code || base) + ")");
			this._logRuneFamily("qty1-still-plus", base);
			return false;
		}

		// --- after separate: ALWAYS Ctrl+Shift @ F10 (never skip — peel leaves +/stack mode) ---
		this.log("ÿc4Pd2Stackÿc0 :: step3 clear+ Ctrl+Shift @ F10 (in place after peel)");
		this.watchPause("before clear+");

		// Even if canSocket looks true, still Ctrl+Shift — peel then mode flip
		found = this._clearPlusOnUnit(unit, true, true);

		if (found && (!wantRune || this.canSocket(found))) {
			this.log("ÿc4Pd2Stackÿc0 :: step4 stash peeled rune");
			this.watchPause("stash peeled rune");
			found = this.moveToStash(found) || found;
			this.log("ÿc2Pd2Stackÿc0 :: unstack ok " + this.itemLabel(found) + " (after clear+)");
			this.watchPause("after stash peeled");
			return found;
		}

		// clear+ may have flipped form/gid — search again
		found = this._findUnstackedMatch(wantRune, base, 0);

		if (found && (!wantRune || this.canSocket(found))) {
			found = this.moveToStash(found) || found;
			this.log("ÿc2Pd2Stackÿc0 :: unstack ok " + this.itemLabel(found) + " (clear+ new gid)");
			return found;
		}

		this.log("ÿc1Pd2Stackÿc0 :: unstack fail — still + after Ctrl+Shift (" + (code || base) + ")");
		this._logRuneFamily("still-plus", base);
		return false;
	},

	stackOne: function (unit) {
		if (!unit || !this.isStackableItem(unit)) {
			return false;
		}

		if (this.isStacked(unit)) {
			return copyUnit(unit);
		}

		if (!this.canModClick()) {
			this.noteModFail("no_keydown");
			return false;
		}

		this.log("ÿc4Pd2Stackÿc0 :: stackOne gid=" + unit.gid);

		if (!this.toggle(unit)) {
			return false;
		}

		unit = me.getItem(-1, -1, unit.gid);

		return unit ? copyUnit(unit) : true;
	},

	// Identity for grouping merge candidates (same rune # / same gem code)
	runeNumber: function (item) {
		var code, m;

		if (!item) {
			return -1;
		}

		code = item.code ? String(item.code).toLowerCase() : "";
		m = code.match(/^r(\d{2})[sg]?$/i);

		if (m) {
			return parseInt(m[1], 10);
		}

		if (item.classid >= 628 && item.classid <= 660) {
			return item.classid - 627;
		}

		if (item.classid >= 702 && item.classid <= 734) {
			return item.classid - 701;
		}

		if (item.itemType >= 164 && item.itemType <= 196) {
			return item.itemType - 163;
		}

		return -1;
	},

	stackKey: function (item) {
		var num, code;

		if (!item || !this.isStackableItem(item)) {
			return "";
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		// Gems first — some PD2 gem stack types overlap rune type ids
		if (this.isGemItem(item) && !/^r\d{2}/i.test(code)) {
			code = this.normalizeGemCode(code);

			if (code) {
				return "gem:" + code;
			}

			for (num = 0; num < this.FLAWLESS.length; num += 1) {
				if (item.classid === this.FLAWLESS[num].single || item.classid === this.FLAWLESS[num].stack) {
					return "gem:" + this.FLAWLESS[num].code;
				}
			}

			for (num = 0; num < this.PERFECT.length; num += 1) {
				if (item.classid === this.PERFECT[num].single || item.classid === this.PERFECT[num].stack) {
					return "gem:" + this.PERFECT[num].code;
				}
			}

			return "";
		}

		if (this.isRuneItem(item)) {
			num = this.runeNumber(item);

			return num > 0 ? ("rune:" + num) : "";
		}

		if (this.isWssItem(item)) {
			return "wss";
		}

		return "";
	},

	// Inv + stash stackables
	listStackables: function () {
		var items, i, out = [];

		items = me.findItems(-1, -1);

		if (!items) {
			return out;
		}

		for (i = 0; i < items.length; i += 1) {
			if ((items[i].location === 3 || items[i].location === 7) &&
					this.isStackableItem(items[i]) && this.stackKey(items[i])) {
				out.push(copyUnit(items[i]));
			}
		}

		return out;
	},

	// True if 2+ of same key can still merge (respects max stack — full piles ignored)
	needsStacking: function () {
		var list, groups, i, key, g, open, j;

		list = this.listStackables();
		groups = {};

		for (i = 0; i < list.length; i += 1) {
			key = this.stackKey(list[i]);

			if (!key) {
				continue;
			}

			if (!groups[key]) {
				groups[key] = [];
			}

			groups[key].push(list[i]);
		}

		for (key in groups) {
			if (!groups.hasOwnProperty(key)) {
				continue;
			}

			g = groups[key];
			open = [];

			for (j = 0; j < g.length; j += 1) {
				if (this.stackHasRoom(g[j])) {
					open.push(g[j]);
				}
			}

			// Need 2+ piles that still have room (full stacks stay put)
			if (open.length >= 2) {
				return true;
			}
		}

		return false;
	},

	// PD2: place one stackable onto another of the SAME form (+ on +, or single on single).
	// Cross-form (loose onto +) does not merge — game leaves src in place.
	// WSS: QTY piles; fill to WSS_MAX_STACK then leave remainder as a new stack.
	mergeIntoStack: function (sourceGid, targetGid) {
		var src, tgt, beforeQty, afterQty;

		if (!sourceGid || !targetGid || sourceGid === targetGid) {
			return false;
		}

		src = me.getItem(-1, -1, sourceGid);
		tgt = me.getItem(-1, -1, targetGid);

		if (!src || !tgt) {
			return false;
		}

		// Keep socketable runes unstacked for Runewords.make — never fold them back into +
		if (this.isRuneItem(src) && this.canSocket(src)) {
			return false;
		}

		if (this.isRuneItem(tgt) && this.canSocket(tgt)) {
			return false;
		}

		this.parkCursor();

		if (typeof Town !== "undefined" && !Town.openStash()) {
			return false;
		}

		src = me.getItem(-1, -1, sourceGid);
		tgt = me.getItem(-1, -1, targetGid);

		if (!src || !tgt) {
			return false;
		}

		// Same inventory/stash container only
		if (src.location !== tgt.location) {
			return false;
		}

		beforeQty = this.effectiveQty(tgt);

		// Cap: don't try to dump onto a full WSS pile — leave/start another stack
		if (!this.stackHasRoom(tgt)) {
			return false;
		}

		// Runes/gems: same +/- form only. WSS is QTY-only — singles merge onto piles.
		if (!(this.isWssItem(src) && this.isWssItem(tgt)) &&
				this.isStacked(src) !== this.isStacked(tgt)) {
			return false;
		}

		if (typeof Packet !== "undefined" && typeof Packet.itemToCursor === "function") {
			if (!Packet.itemToCursor(src)) {
				return false;
			}
		} else if (!src.toCursor()) {
			return false;
		}

		delay(80 + me.ping);

		if (!me.itemoncursor) {
			return false;
		}

		tgt = me.getItem(-1, -1, targetGid);

		if (!tgt) {
			this.parkCursor();
			return false;
		}

		// Prefer unit click (hits the item), then grid click like Storage.MoveTo
		try {
			clickItem(0, tgt);
		} catch (eUnit) {
			try {
				clickItem(0, tgt.y, tgt.x, tgt.location);
			} catch (eGrid) {
				this.parkCursor();
				return false;
			}
		}

		delay(250 + me.ping);

		if (me.itemoncursor) {
			this.parkCursor();
		}

		src = me.getItem(-1, -1, sourceGid);
		tgt = me.getItem(-1, -1, targetGid);
		afterQty = tgt ? this.effectiveQty(tgt) : beforeQty;

		if (!src || afterQty > beforeQty) {
			this.vlog("ÿc4Pd2Stackÿc0 :: merge ok qty " + beforeQty + "→" + afterQty);
			return true;
		}

		return false;
	},

	/**
	 * At open stash: merge duplicate loose runes/gems/WSS.
	 * WSS fills each pile to WSS_MAX_STACK, then starts another stack.
	 */
	stackLooseAtStash: function () {
		var list, groups, key, g, i, target, targetGid, srcGid, made, pass, changed;

		if (typeof Town !== "undefined" && !getUIFlag(0x19)) {
			if (!Town.openStash()) {
				this.log("ÿc1Pd2Stackÿc0 :: stack fail — stash closed");
				return false;
			}
		}

		made = 0;

		for (pass = 0; pass < 8; pass += 1) {
			if (!this.needsStacking()) {
				break;
			}

			changed = false;
			list = this.listStackables();
			groups = {};

			for (i = 0; i < list.length; i += 1) {
				key = this.stackKey(list[i]);

				if (!key) {
					continue;
				}

				if (!groups[key]) {
					groups[key] = [];
				}

				groups[key].push(list[i]);
			}

			for (key in groups) {
				if (!groups.hasOwnProperty(key)) {
					continue;
				}

				g = groups[key];

				if (g.length < 2) {
					continue;
				}

				// Prefer fullest non-full pile (fill to cap, then leftover becomes new stack)
				target = this.pickStackTarget(g, null);

				if (!target) {
					continue;
				}

				targetGid = target.gid;

				for (i = 0; i < g.length; i += 1) {
					srcGid = g[i].gid;

					if (srcGid === targetGid || !me.getItem(-1, -1, srcGid)) {
						continue;
					}

					target = me.getItem(-1, -1, targetGid);

					if (!target || !this.stackHasRoom(target)) {
						target = this.pickStackTarget(g, srcGid);

						if (!target) {
							// All other piles full — this src stays as (seed of) a new stack
							continue;
						}

						targetGid = target.gid;
					}

					if (this.mergeIntoStack(srcGid, targetGid)) {
						made += 1;
						changed = true;
						target = me.getItem(-1, -1, targetGid);

						if (target && this.stackHasRoom(target)) {
							targetGid = target.gid;
						} else {
							target = this.pickStackTarget(g, null);
							targetGid = target ? target.gid : 0;
						}

						delay(80 + me.ping);
					}
				}
			}

			if (!changed) {
				break;
			}
		}

		if (made > 0) {
			this.log("ÿc2Pd2Stackÿc0 :: stacked " + made + " merge(s)");
		}

		return made > 0;
	},

	_findStackedByKey: function (wantKey) {
		var list, i, best, bestQty, q;

		list = this.listStackables();
		best = null;
		bestQty = -1;

		// Prefer non-full pile with highest qty
		for (i = 0; i < list.length; i += 1) {
			if (this.stackKey(list[i]) !== wantKey) {
				continue;
			}

			if (!this.stackHasRoom(list[i])) {
				continue;
			}

			q = this.effectiveQty(list[i]);

			if (q > bestQty) {
				bestQty = q;
				best = list[i];
			}
		}

		if (best) {
			return best;
		}

		for (i = 0; i < list.length; i += 1) {
			if (this.stackKey(list[i]) === wantKey && this.isStacked(list[i])) {
				return list[i];
			}
		}

		for (i = 0; i < list.length; i += 1) {
			if (this.stackKey(list[i]) === wantKey) {
				return list[i];
			}
		}

		return false;
	},

	// --- PD2 flawless → perfect (3+ stacked flawless + key) ---

	listFlawless: function () {
		var items, i, out = [];

		items = me.findItems(-1, -1);

		if (!items) {
			return out;
		}

		for (i = 0; i < items.length; i += 1) {
			if ((items[i].location === 3 || items[i].location === 7) &&
					this.isFlawlessGem(items[i]) && this.flawlessKey(items[i])) {
				out.push(copyUnit(items[i]));
			}
		}

		return out;
	},

	flawlessTotalQty: function (familyKey) {
		var list, i, total = 0;

		list = this.listFlawless();

		for (i = 0; i < list.length; i += 1) {
			if (this.flawlessKey(list[i]) === familyKey) {
				total += this.effectiveQty(list[i]);
			}
		}

		return total;
	},

	// Prefer stash key so inv door-key stays put when possible
	findPromoteKey: function () {
		var item, stashKey = null, invKey = null, code;

		item = me.getItem(-1, -1);

		if (!item) {
			return false;
		}

		do {
			if (item.location !== 3 && item.location !== 7) {
				continue;
			}

			code = item.code ? String(item.code).toLowerCase() : "";

			if (item.classid === 560 || code === "key") {
				if (item.location === 7) {
					stashKey = copyUnit(item);
				} else if (!invKey) {
					invKey = copyUnit(item);
				}
			}
		} while (item.getNext());

		return stashKey || invKey || false;
	},

	needsPromoteFlawless: function () {
		var list, seen, i, key;

		if (typeof Config !== "undefined" && Config.Pd2PromoteFlawless === false) {
			return false;
		}

		if (!this.findPromoteKey()) {
			return false;
		}

		list = this.listFlawless();
		seen = {};

		for (i = 0; i < list.length; i += 1) {
			key = this.flawlessKey(list[i]);

			if (!key || seen[key]) {
				continue;
			}

			seen[key] = true;

			// Merge via place-on-top; promote when family totals ≥3
			if (this.flawlessTotalQty(key) >= 3) {
				return true;
			}
		}

		return false;
	},

	// Merge all of one stackKey by placing one on another (stash open)
	stackLooseForKey: function (wantKey) {
		var list, g, i, target, targetGid, srcGid, made, pass, changed;

		if (!wantKey) {
			return false;
		}

		made = 0;

		for (pass = 0; pass < 5; pass += 1) {
			changed = false;
			list = this.listStackables();
			g = [];

			for (i = 0; i < list.length; i += 1) {
				if (this.stackKey(list[i]) === wantKey) {
					g.push(list[i]);
				}
			}

			if (g.length < 2) {
				break;
			}

			target = null;

			for (i = 0; i < g.length; i += 1) {
				if (this.isStacked(g[i]) || this.qty(g[i]) > 1) {
					target = g[i];
					break;
				}
			}

			if (!target) {
				target = g[0];
			}

			targetGid = target.gid;

			for (i = 0; i < g.length; i += 1) {
				srcGid = g[i].gid;

				if (srcGid === targetGid || !me.getItem(-1, -1, srcGid)) {
					continue;
				}

				if (this.mergeIntoStack(srcGid, targetGid)) {
					made += 1;
					changed = true;
					target = me.getItem(-1, -1, targetGid) || this._findStackedByKey(wantKey);

					if (target) {
						targetGid = target.gid;
					}

					delay(80 + me.ping);
				}
			}

			if (!changed) {
				break;
			}
		}

		return made > 0;
	},

	/**
	 * Cube flawless → perfect. Prefer existing stack pile + key (PD2 recipe).
	 * Else 3 loose singles + key. Never stash-merge flawless.
	 */
	promoteFlawlessAtStash: function () {
		var list, seen, families, i, j, key, keyItem, cube, made, qty, gems, gem, pile, moved, usedPile,
			qtyBefore, qtyAfter, passes;

		if (typeof Config !== "undefined" && Config.Pd2PromoteFlawless === false) {
			return false;
		}

		if (typeof Cubing === "undefined" || typeof Storage === "undefined") {
			this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — Cubing/Storage missing");
			return false;
		}

		cube = (typeof QuestItems !== "undefined" && QuestItems.getCube) ?
			QuestItems.getCube() : (me.getItem("box") || me.getItem(566));

		if (!cube) {
			this.log("ÿc8Pd2Stackÿc0 :: promoteFlawless — no cube");
			return false;
		}

		if (typeof Town !== "undefined" && !getUIFlag(0x19) && !Town.openStash()) {
			this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — stash closed");
			return false;
		}

		list = this.listFlawless();
		seen = {};
		families = [];

		for (i = 0; i < list.length; i += 1) {
			key = this.flawlessKey(list[i]);

			if (!key || seen[key]) {
				continue;
			}

			seen[key] = true;

			if (this.flawlessTotalQty(key) >= 3) {
				families.push(key);
			}
		}

		if (!families.length) {
			return false;
		}

		made = 0;

		for (i = 0; i < families.length; i += 1) {
			key = families[i];
			passes = 0;

			while (this.flawlessTotalQty(key) >= 3 && passes < 8) {
				passes += 1;
				qtyBefore = this.flawlessTotalQty(key);
				keyItem = this.findPromoteKey();

				if (!keyItem) {
					this.log("ÿc8Pd2Stackÿc0 :: promoteFlawless — out of keys");
					return made > 0;
				}

				qty = qtyBefore;
				gems = this.listFlawlessOfKey(key);
				pile = null;
				usedPile = false;

				// 1) Existing stack pile (qty≥3 or stack-form classid) + key
				for (j = 0; j < gems.length; j += 1) {
					gem = me.getItem(-1, -1, gems[j].gid);

					if (!gem) {
						continue;
					}

					if (this.isPerfectGem(gem)) {
						continue;
					}

					if (this.isFlawlessPile(gem) && this.effectiveQty(gem) >= 3) {
						pile = gem;
						break;
					}

					// Stack-form even if qty stat misreads — trust family total when only one pile
					if (this.isFlawlessPile(gem) && gems.length === 1 && qty >= 3) {
						pile = gem;
						break;
					}
				}

				if (!Cubing.emptyCube()) {
					this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — emptyCube failed");
					return made > 0;
				}

				Cubing.cursorCheck();

				if (pile) {
					this.log("ÿc4Pd2Stackÿc0 :: promoteFlawless " + key + " pile+key (qty≈" +
						this.effectiveQty(pile) + " family=" + qty + ")");

					if (!Storage.Cube.MoveTo(pile)) {
						this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — move pile failed gid=" + pile.gid);
						break;
					}

					usedPile = true;
				} else {
					this.log("ÿc4Pd2Stackÿc0 :: promoteFlawless " + key + " 3 singles + key (family=" + qty + ")");
					moved = 0;

					for (j = 0; j < gems.length && moved < 3; j += 1) {
						gem = me.getItem(-1, -1, gems[j].gid);

						if (!gem || this.isFlawlessPile(gem) || this.isPerfectGem(gem)) {
							continue;
						}

						if (!Storage.Cube.MoveTo(gem)) {
							this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — move gem failed");
							break;
						}

						moved += 1;
						delay(50 + me.ping);
					}

					if (moved < 3) {
						this.vlog("ÿc8Pd2Stackÿc0 :: promote skip " + key + " (need 3)");
						Cubing.emptyCube();
						break;
					}
				}

				keyItem = this.findPromoteKey();

				if (!keyItem || !Storage.Cube.MoveTo(keyItem)) {
					this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — move key failed");
					Cubing.emptyCube();
					break;
				}

				if (!Cubing.openCube()) {
					this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless — openCube failed");
					Cubing.emptyCube();
					return made > 0;
				}

				transmute();
				delay(700 + me.ping);
				Cubing.emptyCube();
				Cubing.closeCube();

				if (typeof Town !== "undefined") {
					Town.openStash();
				}

				delay(150 + me.ping);

				qtyAfter = this.flawlessTotalQty(key);

				if (qtyAfter >= qtyBefore) {
					// Recipe did nothing (often already-perfect / wrong pile) — abort this family
					this.log("ÿc1Pd2Stackÿc0 :: promoteFlawless abort " + key +
						" — no progress (still " + qtyAfter + ", was " + qtyBefore + ")");
					break;
				}

				this.log("ÿc2Pd2Stackÿc0 :: promoted " + key + " → perfect(s)" +
					(usedPile ? " via pile" : " via singles") +
					" (" + qtyBefore + "→" + qtyAfter + ")");
				made += 1;
			}
		}

		if (made > 0) {
			this.log("ÿc2Pd2Stackÿc0 :: promoteFlawless done (" + made + " recipe(s))");
		}

		return made > 0;
	},

	listFlawlessOfKey: function (wantKey) {
		var list, i, out = [];

		list = this.listFlawless();

		for (i = 0; i < list.length; i += 1) {
			if (this.flawlessKey(list[i]) === wantKey) {
				out.push(list[i]);
			}
		}

		return out;
	}
};
