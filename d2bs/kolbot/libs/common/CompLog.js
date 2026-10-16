/**
*	@filename	CompLog.js
*	@desc		Lightweight competition stats — event append only (no per-tick I/O).
*	            Summary: data/comp.<profile>.json
*	            Events:  logs/comp.<profile>.jsonl
*
*	Tracks: quests completed, first-time WPs, chicken/death (+ killer),
*	        total wall time, total time in game, equip-on-wear, junk jewels→jewf.
*/

var CompLog = {
	_ready: false,
	_seeded: false,
	_lastPoll: 0,
	_gameStartTick: 0,
	_sessionWallStart: 0,
	_lastThreat: "",
	_lastThreatTick: 0,
	_knownQuests: null, // { "diff:qid": true }
	_knownWps: null, // { "diff:area": true }
	_summary: null,
	_bytesEvents: 0,
	_gameEnded: false,

	SLOT_NAMES: {
		1: "helm",
		2: "amulet",
		3: "armor",
		4: "weapon",
		5: "offhand",
		6: "ringR",
		7: "ringL",
		8: "belt",
		9: "boots",
		10: "gloves",
		11: "weapon2",
		12: "offhand2"
	},

	QUALITY_NAMES: {
		1: "low",
		2: "normal",
		3: "superior",
		4: "magic",
		5: "set",
		6: "rare",
		7: "unique",
		8: "crafted",
		9: "tempered"
	},

	QUEST_NAMES: {
		1: "Den of Evil",
		2: "Sisters Burial Grounds",
		3: "Tools of the Trade",
		4: "The Search for Cain",
		5: "The Forgotten Tower",
		6: "Sisters to the Slaughter",
		7: "The Horadric Staff",
		8: "Tainted Sun",
		9: "Arcane Sanctuary",
		10: "The Summoner",
		11: "The Seven Tombs",
		12: "The Golden Bird",
		13: "Blade of the Old Religion",
		14: "Khalim's Will",
		15: "Lam Esen's Tome",
		16: "The Blackened Temple",
		17: "The Guardian",
		18: "The Fallen Angel",
		19: "Hell's Forge",
		20: "Terror's End",
		21: "Siege on Harrogath",
		22: "Rescue on Mount Arreat",
		23: "Prison of Ice",
		24: "Betrayal of Harrogath",
		25: "Rite of Passage",
		26: "Eve of Destruction"
	},

	enabled: function () {
		return !(typeof Config !== "undefined" && Config.CompLog && Config.CompLog.Enabled === false);
	},

	profileName: function () {
		try {
			if (typeof me !== "undefined" && me.profile) {
				return String(me.profile);
			}
		} catch (e0) {}

		return "unknown";
	},

	safeName: function () {
		return this.profileName().replace(/[^\w.\-]+/g, "_");
	},

	summaryPath: function () {
		return "data/comp." + this.safeName() + ".json";
	},

	eventsPath: function () {
		return "logs/comp." + this.safeName() + ".jsonl";
	},

	humanPath: function () {
		return "logs/comp." + this.safeName() + ".txt";
	},

	pollMs: function () {
		var ms = (typeof Config !== "undefined" && Config.CompLog && Config.CompLog.PollMs) || 60000;

		return Math.max(30000, ms); // floor 30s — WPs still logged instantly via getWP/clickWP
	},

	emptySummary: function () {
		return {
			profile: this.profileName(),
			char: "",
			classid: -1,
			diff: 0,
			sessionStarted: 0,
			gameCount: 0,
			chickens: 0,
			deaths: 0,
			questsDone: 0,
			waypointsNew: 0,
			totalWallMs: 0,
			totalIngameMs: 0,
			lastGameIngameMs: 0,
			lastEvent: null,
			quests: {},
			waypoints: {},
			equipped: null,
			equipChanges: 0,
			jewelsJunked: 0
		};
	},

	loadSummary: function () {
		var path, raw, obj;

		path = this.summaryPath();

		if (typeof FileTools !== "undefined" && FileTools.exists(path)) {
			try {
				raw = FileTools.readText(path);
				obj = JSON.parse(raw);

				if (obj && typeof obj === "object") {
					this._summary = obj;

					return this._summary;
				}
			} catch (e1) {}
		}

		this._summary = this.emptySummary();

		return this._summary;
	},

	saveSummary: function () {
		var s;

		if (!this._summary || typeof FileTools === "undefined") {
			return;
		}

		try {
			s = JSON.stringify(this._summary);
			Misc.fileAction(this.summaryPath(), 1, s);
		} catch (e2) {
			try {
				FileTools.writeText(this.summaryPath(), JSON.stringify(this._summary));
			} catch (e3) {}
		}
	},

	appendLine: function (path, line) {
		try {
			if (typeof FileTools.appendText === "function") {
				FileTools.appendText(path, line);
			} else {
				FileTools.writeText(path, (FileTools.exists(path) ? FileTools.readText(path) : "") + line);
			}
		} catch (eAppend) {}
	},

	appendEvent: function (evt) {
		var line, path, banner, human;

		if (!evt || typeof FileTools === "undefined") {
			return;
		}

		path = this.eventsPath();
		line = JSON.stringify(evt) + "\n";

		try {
			if (this._bytesEvents === 0 && FileTools.exists(path)) {
				this._bytesEvents = (FileTools.readText(path) || "").length;
			}

			// Rotate if huge (keep last race readable)
			if (this._bytesEvents > 2 * 1024 * 1024) {
				banner = "# rotated " + new Date().toISOString() + "\n";
				FileTools.writeText(path, banner + line);
				this._bytesEvents = banner.length + line.length;
			} else {
				this.appendLine(path, line);
				this._bytesEvents += line.length;
			}

			human = this.formatHuman(evt);

			if (human) {
				this.appendLine(this.humanPath(), human + "\n");
			}
		} catch (e4) {}
	},

	formatHuman: function (evt) {
		var d, when, bit;

		if (!evt || !evt.type) {
			return "";
		}

		d = new Date(evt.t || Date.now());
		when = d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
		bit = when + " [" + (evt.diff === 2 ? "H" : evt.diff === 1 ? "NM" : "N") + "] L" + (evt.lvl || "?") + " ";

		switch (evt.type) {
		case "quest":
			return bit + "QUEST " + (evt.name || evt.questId);
		case "waypoint":
			return bit + "WP " + (evt.name || evt.wpArea);
		case "chicken":
			return bit + "CHICKEN " + (evt.kind || "life") + (evt.killer ? " to " + evt.killer : "") +
				(evt.areaName ? " @ " + evt.areaName : "");
		case "death":
			return bit + "DEATH" + (evt.killer ? " to " + evt.killer : "") +
				(evt.deferred ? " (prev game)" : "") + (evt.areaName ? " @ " + evt.areaName : "");
		case "gameStart":
			return bit + "GAME START";
		case "gameEnd":
			return bit + "GAME END ingame=" + (evt.ingameSec || 0) + "s totalIngame=" +
				(evt.totalIngameSec || 0) + "s totalWall=" + (evt.totalWallSec || 0) + "s";
		case "equip":
			return bit + "EQUIP " + (evt.slot || "?") + "=" + (evt.name || "?") +
				(evt.qualityName ? " (" + evt.qualityName + ")" : "") +
				(evt.eth ? " eth" : "") +
				(evt.sockets ? " " + evt.sockets + "s" : "") +
				(evt.reason ? " — " + evt.reason : "");
		case "junkJewel":
			return bit + "JUNK JEWEL " + (evt.desc || evt.name || "?");
		default:
			return bit + evt.type;
		}
	},

	cleanItemName: function (item) {
		var n;

		if (!item) {
			return "";
		}

		try {
			n = item.fname || item.name || "";
			n = String(n).split("\n").reverse().join(" ");
			n = n.replace(/ÿc[0-9a-z!"+<;.*]/gi, "").replace(/^\s+|\s+$/g, "");
		} catch (eName) {
			n = item.name || ("classid " + item.classid);
		}

		return n;
	},

	describeItem: function (item, bodyLoc) {
		var sockets = 0, eth = false, q, loc;

		if (!item) {
			return null;
		}

		loc = bodyLoc || item.bodylocation || 0;

		try {
			eth = !!item.getFlag(0x400000);
		} catch (eEth) {}

		try {
			sockets = item.getStat(194) || 0;

			if (!sockets && typeof item.getStatEx === "function") {
				sockets = item.getStatEx(194) || 0;
			}
		} catch (eSock) {}

		q = item.quality || 0;

		return {
			bodyLoc: loc,
			slot: this.SLOT_NAMES[loc] || ("slot" + loc),
			name: this.cleanItemName(item),
			quality: q,
			qualityName: this.QUALITY_NAMES[q] || String(q),
			classid: item.classid,
			gid: item.gid,
			code: item.code || "",
			itemType: item.itemType || 0,
			ilvl: item.ilvl || 0,
			eth: eth,
			sockets: sockets
		};
	},

	// Called from Pd2Stack.cubeJunkJewelsAtStash after a successful jewf transmute
	// details: array of { desc, quality, qualityName, ilvl, classid, gid, code }
	onJunkJewels: function (details, meta) {
		var i, s, d, detail;

		if (!details || !details.length || !this.enabled()) {
			return;
		}

		if (!this.ensureReady()) {
			return;
		}

		s = this._summary || this.loadSummary();
		s.jewelsJunked = (s.jewelsJunked || 0) + details.length;
		this._summary = s;
		meta = meta || {};

		for (i = 0; i < details.length; i += 1) {
			d = details[i] || {};
			detail = {
				name: d.desc || d.name || "Jewel",
				desc: d.desc || d.name || "Jewel",
				quality: d.quality || 0,
				qualityName: d.qualityName || (this.QUALITY_NAMES[d.quality] || ""),
				ilvl: d.ilvl || 0,
				classid: d.classid,
				gid: d.gid,
				code: d.code || "",
				jewfBefore: meta.jewfBefore,
				jewfAfter: meta.jewfAfter
			};

			this.emit("junkJewel", detail);
		}
	},

	// Called from Item.equip after a successful wear — one item, one write
	// meta: { why, reason, tier, replacedTier, replacedName }
	onEquip: function (item, bodyLoc, meta) {
		var desc, s, slots, gearParts, k, detail;

		if (!item || !this.enabled()) {
			return;
		}

		if (!this.ensureReady()) {
			return;
		}

		desc = this.describeItem(item, bodyLoc);

		if (!desc) {
			return;
		}

		meta = meta || {};
		s = this._summary || this.loadSummary();

		if (!s.equipped || typeof s.equipped !== "object") {
			s.equipped = { slots: {} };
		}

		if (!s.equipped.slots) {
			s.equipped.slots = {};
		}

		s.equipped.slots[desc.slot] = desc;
		s.equipped.at = Date.now();
		s.equipped.lvl = me.charlvl;
		s.equipped.diff = me.diff;
		s.lastEquipped = desc;
		s.equipChanges = (s.equipChanges || 0) + 1;

		slots = s.equipped.slots;
		gearParts = [];

		for (k in this.SLOT_NAMES) {
			if (this.SLOT_NAMES.hasOwnProperty(k) && slots[this.SLOT_NAMES[k]]) {
				gearParts.push(this.SLOT_NAMES[k] + "=" + slots[this.SLOT_NAMES[k]].name);
			}
		}

		s.equipped.gear = gearParts.join(" | ");
		this._summary = s;

		detail = {
			slot: desc.slot,
			name: desc.name,
			quality: desc.quality,
			qualityName: desc.qualityName,
			classid: desc.classid,
			gid: desc.gid,
			eth: desc.eth,
			sockets: desc.sockets,
			ilvl: desc.ilvl,
			code: desc.code,
			item: desc,
			why: meta.why || "",
			reason: meta.reason || meta.why || "",
			tier: meta.tier,
			replacedTier: meta.replacedTier,
			replacedName: meta.replacedName || ""
		};

		this.emit("equip", detail);
	},

	emit: function (type, detail) {
		var evt, s, k;

		if (!this.enabled()) {
			return;
		}

		if (!this.ensureReady() && type !== "death") {
			return;
		}

		s = this._summary || this.loadSummary();
		detail = detail || {};
		evt = {
			t: Date.now(),
			tick: getTickCount(),
			type: type,
			profile: this.profileName(),
			char: me.name || s.char,
			lvl: me.charlvl || 0,
			diff: me.diff,
			area: me.area,
			areaName: (typeof Pather !== "undefined" && Pather.getAreaName) ? Pather.getAreaName(me.area) : String(me.area)
		};

		for (k in detail) {
			if (detail.hasOwnProperty(k)) {
				evt[k] = detail[k];
			}
		}

		this.appendEvent(evt);
		s.lastEvent = { type: type, t: evt.t, name: detail.name || detail.killer || "" };
		this.saveSummary();

		if (typeof Config !== "undefined" && Config.CompLog && Config.CompLog.Verbose) {
			print("ÿc4CompLogÿc0 :: " + type + (detail.name ? " " + detail.name : "") +
				(detail.killer ? " killer=" + detail.killer : ""));
		}
	},

	// Snapshot: prior summary + current quests/WPs = already-known (no flood)
	seedKnown: function () {
		var i, q, area, key, wpAreas, s;

		this._knownQuests = {};
		this._knownWps = {};
		s = this._summary || this.loadSummary();

		for (key in s.quests) {
			if (s.quests.hasOwnProperty(key)) {
				this._knownQuests[key] = true;
			}
		}

		for (key in s.waypoints) {
			if (s.waypoints.hasOwnProperty(key)) {
				this._knownWps[key] = true;
			}
		}

		if (typeof me === "undefined" || !me.gameReady) {
			return;
		}

		for (q = 1; q <= 40; q += 1) {
			if (me.getQuest(q, 0)) {
				key = me.diff + ":" + q;
				this._knownQuests[key] = true;
			}
		}

		wpAreas = (typeof Pather !== "undefined" && Pather.wpAreas) ? Pather.wpAreas : [];

		for (i = 0; i < wpAreas.length; i += 1) {
			if (getWaypoint(i)) {
				area = wpAreas[i];
				key = me.diff + ":" + area;
				this._knownWps[key] = true;
			}
		}
	},

	// Safe for default.dbj (Pather) and ToolsThread — no gameCount bump
	ensureReady: function () {
		if (!this.enabled()) {
			return false;
		}

		try {
			if (typeof me === "undefined" || !me.gameReady) {
				return false;
			}
		} catch (eReady) {
			return false;
		}

		if (!this._summary) {
			this.loadSummary();
		}

		if (!this._seeded) {
			this.seedKnown();
			this._seeded = true;
		}

		this._ready = true;

		return true;
	},

	// Call once from ToolsThread only (avoids double-count across threads)
	gameStart: function () {
		var s;

		if (!this.enabled()) {
			return;
		}

		if (!this.ensureReady()) {
			return;
		}

		// Same game already started in this thread
		if (this._gameStartTick && me.gamestarttime && this._gameStartTick === me.gamestarttime && !this._gameEnded) {
			return;
		}

		s = this._summary;
		s.char = me.name || s.char;
		s.classid = me.classid;
		s.diff = me.diff;

		if (!this._sessionWallStart) {
			this._sessionWallStart = getTickCount();
			s.sessionStarted = Date.now();
		}

		this._gameStartTick = me.gamestarttime || getTickCount();
		this._gameEnded = false;
		this._lastPoll = getTickCount();
		s.gameCount = (s.gameCount || 0) + 1;
		this._summary = s;
		this.saveSummary();
		this.emit("gameStart", {});
	},

	gameEnd: function () {
		var s, ingameMs;

		if (!this.enabled() || this._gameEnded) {
			return;
		}

		if (!this._gameStartTick && !this.ensureReady()) {
			return;
		}

		this._gameEnded = true;
		s = this._summary || this.loadSummary();
		ingameMs = Math.max(0, getTickCount() - (this._gameStartTick || me.gamestarttime || getTickCount()));

		s.lastGameIngameMs = ingameMs;
		s.totalIngameMs = (s.totalIngameMs || 0) + ingameMs;
		s.totalWallMs = (s.totalWallMs || 0) + ingameMs;
		this._summary = s;
		this.emit("gameEnd", {
			ingameMs: ingameMs,
			totalIngameMs: s.totalIngameMs,
			totalWallMs: s.totalWallMs,
			ingameSec: Math.round(ingameMs / 1000),
			totalIngameSec: Math.round(s.totalIngameMs / 1000),
			totalWallSec: Math.round(s.totalWallMs / 1000)
		});
	},

	noteQuest: function (qid) {
		var s, key, name;

		if (!qid || !this.ensureReady()) {
			return;
		}

		key = me.diff + ":" + qid;

		if (this._knownQuests && this._knownQuests[key]) {
			return;
		}

		if (!this._knownQuests) {
			this._knownQuests = {};
		}

		this._knownQuests[key] = true;
		s = this._summary || this.loadSummary();
		name = this.QUEST_NAMES[qid] || ("Quest " + qid);
		s.quests[key] = { id: qid, name: name, diff: me.diff, at: Date.now(), lvl: me.charlvl };
		s.questsDone = (s.questsDone || 0) + 1;
		this._summary = s;
		this.emit("quest", { questId: qid, name: name });
	},

	noteWaypoint: function (area) {
		var s, key, name, idx;

		if (!this.ensureReady()) {
			return;
		}

		if (area === undefined || area === null) {
			area = me.area;
		}

		key = me.diff + ":" + area;

		if (this._knownWps && this._knownWps[key]) {
			return;
		}

		// Confirm we actually have it (skip confirm if UI just opened — flag may lag one frame)
		if (typeof Pather !== "undefined" && Pather.wpAreas) {
			idx = Pather.wpAreas.indexOf(area);

			if (idx >= 0 && !getWaypoint(idx)) {
				// Still allow: clicking WP grants it; getWaypoint can lag
			}
		}

		if (!this._knownWps) {
			this._knownWps = {};
		}

		this._knownWps[key] = true;
		s = this._summary || this.loadSummary();
		name = (typeof Pather !== "undefined" && Pather.getAreaName) ? Pather.getAreaName(area) : String(area);
		s.waypoints[key] = { area: area, name: name, diff: me.diff, at: Date.now(), lvl: me.charlvl };
		s.waypointsNew = (s.waypointsNew || 0) + 1;
		this._summary = s;
		this.emit("waypoint", { wpArea: area, name: name });
	},

	// Call from Pather.getWP / clickWP after UI opens
	onWaypoint: function (area) {
		this.noteWaypoint(area);
	},

	chicken: function (kind, killer) {
		var s;

		if (!this.ensureReady()) {
			return;
		}

		s = this._summary || this.loadSummary();
		s.chickens = (s.chickens || 0) + 1;
		this._summary = s;
		this.emit("chicken", {
			kind: kind || "life",
			killer: killer || this._lastThreat || ""
		});
	},

	death: function (killer) {
		var s, wasReady;

		if (!this.enabled()) {
			return;
		}

		// May run at next-game join before ToolsThread gameStart — still count
		s = this.loadSummary();
		s.deaths = (s.deaths || 0) + 1;
		this._summary = s;
		wasReady = this._ready;
		this._ready = true;
		this.emit("death", {
			killer: killer || this._lastThreat || s.lastThreat || "",
			deferred: !wasReady,
			prevArea: s.lastThreatArea || 0
		});
		this._ready = wasReady;
	},

	// Cheap threat cache for chicken/death "to whom"
	updateThreat: function (name) {
		if (!name) {
			return;
		}

		this._lastThreat = String(name).replace(/ÿc[0-9a-z]/gi, "").replace(/^\s*to\s+/i, "").replace(/^\s+|\s+$/g, "");
		this._lastThreatTick = getTickCount();
	},

	poll: function () {
		var now, q, i, area, key, wpAreas;

		if (!this.ensureReady()) {
			return;
		}

		now = getTickCount();

		if (now - this._lastPoll < this.pollMs()) {
			return;
		}

		this._lastPoll = now;

		for (q = 1; q <= 40; q += 1) {
			if (me.getQuest(q, 0)) {
				key = me.diff + ":" + q;

				if (!this._knownQuests || !this._knownQuests[key]) {
					this.noteQuest(q);
				}
			}
		}

		wpAreas = (typeof Pather !== "undefined" && Pather.wpAreas) ? Pather.wpAreas : [];

		for (i = 0; i < wpAreas.length; i += 1) {
			if (getWaypoint(i)) {
				area = wpAreas[i];
				key = me.diff + ":" + area;

				if (!this._knownWps || !this._knownWps[key]) {
					this.noteWaypoint(area);
				}
			}
		}

		// Persist last threat ~every poll so next-game death can name the killer
		if (this._lastThreat && this._summary) {
			this._summary.lastThreat = this._lastThreat;
			this._summary.lastThreatArea = me.area;
			this.saveSummary();
		}
	}
};
