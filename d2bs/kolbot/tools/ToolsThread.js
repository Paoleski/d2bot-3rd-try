/**
*	@filename	ToolsThread.js
*	@author		kolton
*	@desc		several tools to help the player - potion use, chicken, Diablo clone stop, map reveal, quit with player
*/

js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("AutoMule.js");
include("Gambling.js");
include("CraftingSystem.js");
include("TorchSystem.js");
include("MuleLogger.js");
include("common/Attack.js");
include("common/Cubing.js");
include("common/CollMap.js");
include("common/Config.js");
include("common/Loader.js");
include("common/Misc.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/Pd2Stack.js");
include("common/ConsoleLog.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");

function main() {
	var i, mercHP, ironGolem, tick, merc,
		debugInfo = {area: 0, currScript: "no entry"},
		pingTimer = [],
		quitFlag = false,
		cloneWalked = false,
		canQuit = true,
		timerLastDrink = [],
		rejuvMisses = 0,
		rejuvGaveUp = false,
		rejuvGaveUpAt = 0, // tick when we gave up — ignore retries until town/HP recover
		mercPktSniff = false,
		mercPktHandler = null;

	if (typeof ConsoleLog !== "undefined") {
		ConsoleLog.install();
	}

	print("ÿc3Start ToolsThread script");
	D2Bot.init();
	Config.init(false);
	Pickit.init(false);
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	for (i = 0; i < 6; i += 1) {
		timerLastDrink[i] = 0;
	}

	// Reset core chicken
	me.chickenhp = -1;
	me.chickenmp = -1;

	// General functions
	this.checkPing = function (print) {
		// Quit after at least 5 seconds in game
		if (getTickCount() - me.gamestarttime < 5000) {
			return false;
		}

		var i;

		for (i = 0; i < Config.PingQuit.length; i += 1) {
			if (Config.PingQuit[i].Ping > 0) {
				if (me.ping >= Config.PingQuit[i].Ping) {
					me.overhead("High Ping");

					if (pingTimer[i] === undefined || pingTimer[i] === 0) {
						pingTimer[i] = getTickCount();
					}

					if (getTickCount() - pingTimer[i] >= Config.PingQuit[i].Duration * 1000) {
						if (print) {
							D2Bot.printToConsole("High ping (" + me.ping + "/" + Config.PingQuit[i].Ping + ") - leaving game.", 9);
						}

						scriptBroadcast("pingquit");

						return true;
					}
				} else {
					pingTimer[i] = 0;
				}
			}
		}

		return false;
	};

	this.initQuitList = function () {
		var i, string, obj,
			temp = [];

		for (i = 0; i < Config.QuitList.length; i += 1) {
			if (FileTools.exists("data/" + Config.QuitList[i] + ".json")) {
				string = Misc.fileAction("data/" + Config.QuitList[i] + ".json", 0);

				if (string) {
					obj = JSON.parse(string);

					if (obj && obj.hasOwnProperty("name")) {
						temp.push(obj.name);
					}
				}
			}
		}

		Config.QuitList = temp.slice(0);
	};

	this.getPotion = function (pottype, type) {
		var i, beltPot, invPot,
			items = me.getItems();

		function isScrollOrTome(item) {
			var code = item.code ? String(item.code).toLowerCase() : "";

			// Codes only — PD2 classids 529/530 are fullmana/stamina, not scrolls
			return code === "tsc" || code === "isc" || code === "tbk" || code === "ibk" ||
				[535, 536, 546, 547].indexOf(item.classid) > -1;
		}

		// Charms/jewels must never be "drunk" — potionKind name match can hit "of Mana" charms
		function isCharmOrJewel(item) {
			var code = item.code ? String(item.code).toLowerCase() : "";

			if (code === "cm1" || code === "cm2" || code === "cm3" || code === "jew") {
				return true;
			}

			// PD2: 83 small / 84 large / 85 grand (LoD was 82–84)
			return [82, 83, 84, 85].indexOf(item.itemType) > -1;
		}

		function matchesPot(item) {
			var code, name, kind;

			if (!item || isScrollOrTome(item) || isCharmOrJewel(item)) {
				return false;
			}

			code = item.code ? String(item.code).toLowerCase() : "";

			// Prefer Town.potionKind (code-first) when town libs are loaded
			if (typeof Town !== "undefined" && typeof Town.potionKind === "function") {
				kind = Town.potionKind(item);

				if (pottype === 76) {
					return kind === "hp";
				}

				if (pottype === 77) {
					return kind === "mp";
				}

				if (pottype === 78) {
					return kind === "rv";
				}

				if (pottype === 80) {
					return kind === "vps";
				}

				return false;
			}

			// Fallback: code first — never let classid override mp*/hp* (PD2: mp1 can report id=607)
			if (pottype === 76) {
				if (code.indexOf("mp") === 0 || code.indexOf("rv") === 0) {
					return false;
				}

				if (code.indexOf("hp") === 0) {
					return true;
				}

				return !code && [604, 605, 606, 607, 608].indexOf(item.classid) > -1;
			}

			if (pottype === 77) {
				if (code.indexOf("hp") === 0 || code.indexOf("rv") === 0) {
					return false;
				}

				if (code.indexOf("mp") === 0) {
					return true;
				}

				return !code && [609, 610, 611, 612, 613].indexOf(item.classid) > -1;
			}

			if (pottype === 80) {
				if (code === "vps") {
					return true;
				}

				if (code.indexOf("hp") === 0 || code.indexOf("mp") === 0 || code.indexOf("rv") === 0) {
					return false;
				}

				return item.classid === 530 || item.itemType === 80;
			}

			if (pottype === 78) {
				if (code.indexOf("hp") === 0 || code.indexOf("mp") === 0 || code === "vps" || code === "yps" || code === "wms") {
					return false;
				}

				if (code === "rvs" || code === "rvl" || code.indexOf("rv") === 0) {
					return true;
				}

				if (item.classid === 532 || item.classid === 533) {
					return true;
				}

				name = item.name ? String(item.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

				if (name.indexOf("rejuvenation") > -1 || (name.indexOf("rejuv") > -1 && name.indexOf("potion") > -1)) {
					return true;
				}

				return item.itemType === 79 && (!code || code.indexOf("rv") === 0);
			}

			return false;
		}

		if (!items || items.length === 0) {
			return false;
		}

		// Highest potion first
		items.sort(function (a, b) {
			return b.classid - a.classid;
		});

		beltPot = null;
		invPot = null;

		for (i = 0; i < items.length; i += 1) {
			if (!matchesPot(items[i])) {
				continue;
			}

			if (items[i].mode === 2 || items[i].location === 2) {
				if (!beltPot) {
					beltPot = copyUnit(items[i]);
				}
			} else if ((type < 3 || type === 5) && items[i].mode === 0 && items[i].location === 3) {
				if (!invPot) {
					invPot = copyUnit(items[i]);
				}
			}
		}

		// Rejuv: inventory first (no belt rv column while leveling)
		if (pottype === 78) {
			if (invPot) {
				return invPot;
			}

			return beltPot || false;
		}

		// HP/MP/stamina: belt first (hotkey-fast). Inv buffer only if belt empty.
		if (beltPot) {
			return beltPot;
		}

		if (invPot) {
			if (pottype !== 77) {
				print("ÿc2Drinking potion from inventory.");
			}

			return invPot;
		}

		return false;
	};

	this.userPaused = false; // Pause/Break — distinct from TownChicken holding default.dbj

	this.togglePause = function () {
		var i, script,
			scripts = ["default.dbj", "tools/townchicken.js", "tools/antihostile.js", "tools/party.js", "tools/rushthread.js"];

		// Flip USER pause intent — never infer from script.running (TownChicken also pauses default.dbj)
		this.userPaused = !this.userPaused;

		if (this.userPaused) {
			print("ÿc1Pausing.");
			scriptBroadcast("userPause");

			for (i = 0; i < scripts.length; i += 1) {
				script = getScript(scripts[i]);

				// don't pause townchicken during clone walk
				if (script && script.running && (scripts[i] !== "tools/townchicken.js" || !cloneWalked)) {
					script.pause();
				}
			}
		} else {
			print("ÿc2Resuming.");
			scriptBroadcast("userResume");

			for (i = 0; i < scripts.length; i += 1) {
				script = getScript(scripts[i]);

				if (script && !script.running) {
					script.resume();
				}
			}
		}

		return true;
	};

	this.stopDefault = function () {
		var script = getScript("default.dbj");

		if (script && script.running) {
			script.stop();
		}

		return true;
	};

	// TownChicken is a separate thread — must stop it too or it keeps makePortal during LifeChicken quit
	this.stopTownChicken = function () {
		var script = getScript("tools/townchicken.js");

		if (script && script.running) {
			script.stop();
		}

		return true;
	};

	this.exit = function () {
		this.stopDefault(); // halt scripts mid-makePortal / goToTown
		this.stopTownChicken();
		quit();
	};

	this.drinkPotion = function (type) {
		var pottype, potion, code, where, pct, coolMs, gid, mpBefore,
			tNow = getTickCount();

		// Per-type cooldown (ms). HP/MP need real gaps or the belt dumps in one fight.
		switch (type) {
		case 0: // HP
		case 3: // merc HP
			coolMs = 2500;
			break;
		case 1: // MP
			coolMs = 2500;
			break;
		case 2: // rejuv
			coolMs = 300; // 0.3s
			break;
		case 4: // merc rejuv
			coolMs = 2000;
			break;
		case 5: // stamina
			coolMs = 2500;
			break;
		default:
			coolMs = 3000;
			break;
		}

		// Use || 0 so timerLastDrink[type] === 0 still applies cooldown logic after init
		if (tNow - (timerLastDrink[type] || 0) < coolMs) {
			return false;
		}

		// Potion effect states (skip while already under heal/mana pot effect)
		if ((type === 0 || type === 1) && me.getState(type === 0 ? 100 : 106)) {
			return false;
		}

		if (type === 2) {
			// No rejuvs — stay silent. Only resume after HP recovers ABOVE UseRejuvHP, or town.
			if (rejuvGaveUp) {
				if (me.inTown) {
					rejuvGaveUp = false;
					rejuvMisses = 0;
				} else if (Config.UseRejuvHP > 0 &&
						me.hp > Math.floor(me.hpmax * Config.UseRejuvHP / 100)) {
					// Strictly above threshold so we don't bounce at the edge
					rejuvGaveUp = false;
					rejuvMisses = 0;
				} else {
					return false;
				}
			}
			// No per-trigger spam print — only log drink success / first give-up
		}

		if (me.mode === 0 || me.mode === 17 || me.mode === 18) { // mode 18 - can't drink while leaping/whirling etc.
			return false;
		}

		switch (type) {
		case 0:
		case 3:
			pottype = 76;

			break;
		case 1:
			pottype = 77;

			break;
		case 5:
			pottype = 80; // PD2 stamina (79 = rejuv)

			break;
		default:
			pottype = 78;

			break;
		}

		potion = this.getPotion(pottype, type);

		if (potion) {
			if (me.mode === 0 || me.mode === 17) {
				return false;
			}

			// Hard refuse scrolls/tomes even if matcher slipped
			if (potion.code && ["tsc", "isc", "tbk", "ibk"].indexOf(String(potion.code).toLowerCase()) > -1) {
				return false;
			}

			// Re-resolve by gid — copyUnit can go stale mid-fight
			if (potion.gid) {
				potion = me.getItem(-1, -1, potion.gid) || potion;
			}

			code = potion.code ? String(potion.code).toLowerCase() : "?";
			where = (potion.mode === 2 || potion.location === 2) ? "belt" : "inv";
			gid = potion.gid;
			mpBefore = me.mp;

			// Stamp cooldown BEFORE interact so a failed/spammy interact can't double-fire next tick
			timerLastDrink[type] = getTickCount();

			// 0/1/2 = player pots, 5 = stamina — interact. 3/4 = merc.
			if (type < 3 || type === 5) {
				if (type === 2) {
					pct = me.hpmax > 0 ? Math.floor(me.hp * 100 / me.hpmax) : 0;
					print("ÿc2Rejuvÿc0 :: drink " + code + " from " + where + " @ HP " + me.hp + "/" + me.hpmax + " (" + pct + "%)");
				}

				potion.interact();
			} else {
				try {
					clickItem(2, potion);
				} catch (e) {
					print("Couldn't give the potion to merc.");
				}
			}

			delay(80 + Math.min(me.ping, 150));

			// Confirm inv mana actually consumed (not charm false-positive / failed interact)
			if (type === 1 && where === "inv") {
				if (me.getState(106) || me.mp > mpBefore || (gid && !me.getItem(-1, -1, gid))) {
					print("ÿc2Drank mana from inventory (" + code + ").");
				}
			}

			if (type === 2) {
				rejuvMisses = 0;
				rejuvGaveUp = false;
			}

			return true;
		}

		if (type === 2) {
			// Stamp cooldown even on miss so the main loop can't hammer every tick
			timerLastDrink[type] = getTickCount();
			rejuvMisses += 1;

			if (rejuvMisses >= 2) {
				if (!rejuvGaveUp) {
					pct = me.hpmax > 0 ? Math.floor(me.hp * 100 / me.hpmax) : 0;
					print("ÿc1Rejuvÿc0 :: no rvs/rvl — stop until HP recovers or town (was " +
						me.hp + "/" + me.hpmax + " " + pct + "%)");
				}

				rejuvGaveUp = true;
				rejuvGaveUpAt = getTickCount();
			}

			return false;
		}

		return false;
	};

	this.getNearestMonster = function () {
		var gid, distance,
			monster = getUnit(1),
			range = 30;

		if (monster) {
			do {
				if (monster.hp > 0 && Attack.checkMonster(monster) && !monster.getParent()) {
					distance = getDistance(me, monster);

					if (distance < range) {
						range = distance;
						gid = monster.gid;
					}
				}
			} while (monster.getNext());
		}

		if (gid) {
			monster = getUnit(1, -1, -1, gid);
		} else {
			monster = false;
		}

		if (monster) {
			return " to " + monster.name;
		}

		return "";
	};

	this.checkVipers = function () {
		var owner,
			monster = getUnit(1, 597);

		if (monster) {
			do {
				if (monster.getState(96)) {
					owner = monster.getParent();

					if (owner && owner.name !== me.name) {
						return true;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.getIronGolem = function () {
		var owner,
			golem = getUnit(1, 291);

		if (golem) {
			do {
				owner = golem.getParent();

				if (owner && owner.name === me.name) {
					return copyUnit(golem);
				}
			} while (golem.getNext());
		}

		return false;
	};

	this.getNearestPreset = function () {
		var i, unit, dist, id;

		unit = getPresetUnits(me.area);
		dist = 99;

		for (i = 0; i < unit.length; i += 1) {
			if (getDistance(me, unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y) < dist) {
				dist = getDistance(me, unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y);
				id = unit[i].type + " " + unit[i].id;
			}
		}

		return id || "";
	};

	// Fallback when AutoSmurf hasn't broadcast lastAction yet
	this.guessObjective = function () {
		var actDone1, actDone2, durielDone;

		actDone1 = !!(me.getQuest(7, 0) || me.getQuest(7, 1) || me.act >= 2 ||
			((me.getQuest(6, 0) || me.getQuest(6, 1)) && Pather.accessToAct(2)));
		durielDone = !!(me.getQuest(14, 0) || me.getQuest(14, 1) || me.getQuest(14, 3) || me.getQuest(14, 4));
		actDone2 = !!(me.getQuest(15, 0) || me.getQuest(15, 1) || me.act >= 3 ||
			(durielDone && Pather.accessToAct(3)));

		// Prefer current act / access — never guess Act1 Countess while in Act3
		if (me.act >= 4 || Pather.accessToAct(4) || me.getQuest(23, 0) || me.getQuest(23, 1)) {
			if (!me.getQuest(28, 0)) {
				return "Act 4 — Izual / Diablo";
			}

			if (!me.getQuest(40, 0)) {
				return "Act 5 — Baal";
			}

			return "Campaign quests done / farming";
		}

		if (me.act >= 3 || actDone2) {
			if (!me.getQuest(17, 0)) {
				return "Act 3 — Lam Esen's Tome";
			}

			if (!me.getItem("qey") && !me.getItem("qf2") && !me.getQuest(18, 0)) {
				return "Act 3 — Khalim's Eye (Spider Cavern)";
			}

			if (!me.getItem("qhr") && !me.getItem("qf2") && !me.getQuest(18, 0)) {
				return "Act 3 — Khalim's Heart (Sewers)";
			}

			if (!me.getItem("qbr") && !me.getItem("qf2") && !me.getQuest(18, 0)) {
				return "Act 3 — Khalim's Brain (Flayer Dungeon)";
			}

			if (!me.getQuest(18, 0) || !me.getQuest(21, 0)) {
				return "Act 3 — Travincal / Khalim's Will";
			}

			if (!me.getQuest(20, 0)) {
				return "Act 3 — Golden Bird / Mephisto";
			}

			return "Act 3 — Mephisto → Act 4";
		}

		if (me.act >= 2 || actDone1) {
			if (!me.getQuest(9, 0) && !me.getQuest(9, 1)) {
				return "Act 2 — Radament";
			}

			if (!durielDone && !actDone2) {
				return "Act 2 — Duriel not done yet";
			}

			return "Act 2 — finish Duriel → Act 3";
		}

		if (!me.getQuest(1, 0)) {
			return "Den of Evil";
		}
		if (me.diff === 0 && !me.getQuest(2, 0) && me.charlvl < 7) {
			if (!getWaypoint(1)) {
				return "Cold Plains (WP + clear)";
			}

			return "Cold Plains → Stony Field";
		}
		if (me.diff === 0 && !me.getQuest(2, 0) && me.charlvl < 12) {
			return "Stony Field / Cain path (before Blood Raven)";
		}
		if (!me.getQuest(2, 0) && me.charlvl >= 12) {
			return "Blood Raven (ready)";
		}
		if (!me.getQuest(2, 0)) {
			return "Blood Raven after lvl 12 (now " + me.charlvl + ")";
		}
		if (!me.getQuest(4, 0)) {
			return "Rescue Cain";
		}
		// Countess / Smith only while still in Act 1 progression
		if (!actDone1 && (!getWaypoint(4) || !(me.getQuest(3, 0) || me.getQuest(3, 1) || me.getQuest(3, 12)))) {
			if (!getWaypoint(4)) {
				return "Black Marsh WP → Countess";
			}

			return "Countess → Smith (Malus)";
		}
		if (!me.getQuest(6, 0) && !me.getQuest(6, 1) && me.charlvl < 17) {
			return "Leveling for Andy (need lvl 17, now " + me.charlvl + ")";
		}
		if (!me.getQuest(6, 0) && !me.getQuest(6, 1)) {
			return "Andariel (gate lvl 17)";
		}

		return "Act 1 → Act 2 transition";
	};

	this.showObjective = function () {
		var msg, line2;

		msg = debugInfo.lastAction || this.guessObjective();
		line2 = "lvl " + me.charlvl + " | " + Pather.getAreaName(me.area);

		if (debugInfo.currScript) {
			line2 += " | " + debugInfo.currScript;
		}

		if (!debugInfo.lastAction) {
			line2 += " | guess";
		}

		print("ÿc2Objectiveÿc0 :: ÿc8" + msg + "ÿc0");
		print("ÿc8" + line2 + "ÿc0");
		me.overhead(msg);

		try {
			D2Bot.printToConsole("Objective: " + msg + " (" + line2 + ")", 0);
		} catch (eObj) {}
	};

	// Hex dump helper for packet sniff
	this.bytesToHex = function (bytes) {
		var n, h = [];

		for (n = 0; n < bytes.length; n += 1) {
			h.push(("0" + (bytes[n] & 0xFF).toString(16)).slice(-2));
		}

		return h.join(" ");
	};

	// Dump merc items + bodylocation after a manual equip
	this.dumpMercBodyLocs = function () {
		var m = me.getMerc(), item, lines = [], n;

		if (!m) {
			print("ÿc1MercPktÿc0 :: no merc");
			return;
		}

		item = m.getItem();

		if (!item) {
			print("ÿc1MercPktÿc0 :: merc has no items");
			return;
		}

		do {
			lines.push("gid=" + item.gid + " type=" + item.itemType +
				" bodyloc=" + item.bodylocation + " mode=" + item.mode +
				" loc=" + item.location + " " + (item.name || "?"));
		} while (item.getNext());

		print("ÿc2MercPkt DUMPÿc0 :: " + lines.length + " item(s)");

		for (n = 0; n < lines.length; n += 1) {
			print("ÿc2MercPktÿc0 :: " + lines[n]);
		}
	};

	this.toggleMercPktSniff = function () {
		if (mercPktSniff) {
			if (mercPktHandler) {
				removeEventListener("gamepacketsent", mercPktHandler);
				mercPktHandler = null;
			}

			mercPktSniff = false;
			print("ÿc1MercPkt sniff OFFÿc0 — dumping merc bodylocs:");
			me.overhead("MercPkt OFF");
			this.dumpMercBodyLocs();
			return;
		}

		// Interesting C->S item / merc opcodes only (return false = never block)
		var self = this;

		mercPktHandler = function (bytes) {
			var op, names, hex;

			if (!bytes || !bytes.length) {
				return false;
			}

			op = bytes[0] & 0xFF;
			names = {
				0x16: "PickupItem",
				0x17: "DropItem",
				0x18: "ItemToBuffer",
				0x19: "PickupBufferItem",
				0x1A: "ItemToBody",
				0x1B: "Swap2H",
				0x1C: "PickupBodyItem",
				0x1D: "SwitchBodyItem",
				0x1F: "SwitchInvItem",
				0x20: "UseItem",
				0x23: "ItemToBelt",
				0x61: "MercItem/Potion"
			};

			if (!names[op]) {
				return false;
			}

			hex = self.bytesToHex(bytes);
			print("ÿc2MercPkt SENTÿc0 :: 0x" + ("0" + op.toString(16)).slice(-2) +
				" " + names[op] + " [" + bytes.length + "] " + hex);
			me.overhead("pkt 0x" + ("0" + op.toString(16)).slice(-2));

			return false; // MUST false — true blocks the packet
		};

		addEventListener("gamepacketsent", mercPktHandler);
		mercPktSniff = true;
		print("ÿc2MercPkt sniff ONÿc0 :: pause bot → open inv → equip merc glove/boot/belt by hand");
		print("ÿc2MercPktÿc0 :: watch console for ItemToBody / MercItem packets, then F8 again to dump bodylocs");
		me.overhead("MercPkt ON");
	};

	// Event functions
	this.keyEvent = function (key) {
		switch (key) {
		case 19: // Pause/Break
		case 35: // End
			this.togglePause();

			break;
		case 119: // F8 — toggle merc equip packet sniff (+ dump bodylocs on OFF)
			this.toggleMercPktSniff();

			break;
		case 120: // F9 — ALWAYS print screen mouse coords (AutoSkill UI calibrate)
			// DO NOT gate on Config.AutoSkill.UICalibrate — that flag was repeatedly left false
			// and broke calibrate. ToolsThread stays alive while default.dbj is paused.
			// NEVER move this handler to default.dbj / AutoSkill.init (those pause with the bot).
			// Empty-inv cell for Pd2Stack is F10 (case 121) — do NOT write last_mouse here.
			try {
				var mc = getMouseCoords(0),
					treeOpen = false;

				try {
					treeOpen = !!getUIFlag(0x04);
				} catch (eFlag) {}

				print("ÿc2AutoSkill CALIBRATEÿc0 :: [" + mc[0] + "," + mc[1] + "]" +
					(treeOpen ? " (skill tree OPEN)" : " (skill tree closed — press T or click New Skill)"));
				me.overhead("calib " + mc[0] + "," + mc[1]);
			} catch (eCal) {
				print("ÿc1AutoSkill CALIBRATE error: " + eCal);
			}

			break;
		case 121: // F10 — Pd2Stack CLIENT coords (MUST match bot: stash OPEN)
			// Pause → open stash (bank) → hover the inv slot where runes land → F10
			// Inv panel moves when stash is closed — don't calibrate with only I open.
			try {
				var emc = getMouseCoords(0),
					stashOpen = false;

				try {
					stashOpen = !!getUIFlag(0x19);
				} catch (eSt) {}

				if (!stashOpen) {
					print("ÿc1Pd2Stack F10ÿc0 :: open STASH first (coords differ without it), then hover inv slot + F10");
					me.overhead("open stash!");
					break;
				}

				try {
					FileTools.writeText("data/pd2_last_mouse.txt", emc[0] + " " + emc[1]);
				} catch (eWrite) {
					print("ÿc1Pd2Stackÿc0 :: failed to write data/pd2_last_mouse.txt: " + eWrite);
					break;
				}

				print("ÿc2Pd2Stack F10ÿc0 :: client " + emc[0] + "," + emc[1] +
					" (stash OPEN) — EMPTY first inv slot: separate drops here, then Ctrl+Shift clear+");
				me.overhead("F10 " + emc[0] + "," + emc[1]);
			} catch (eEmpty) {
				print("ÿc1Pd2Stack F10 error: " + eEmpty);
			}

			break;
		case 122: // F11 — show current AutoSmurf objective
			this.showObjective();

			break;
		case 123: // F12 key
			me.overhead("Revealing " + Pather.getAreaName(me.area));
			revealLevel(true);

			break;
		case 107: // Numpad +
			showConsole();

			// me.getStat(105) will return real FCR from gear + Config.FCR from char cfg
			var realFCR = me.getStat(105) - Config.FCR;
			var realIAS = me.getStat(93) - Config.IAS;
			var realFBR = me.getStat(102) - Config.FBR;
			var realFHR = me.getStat(99) - Config.FHR;

			print("ÿc4MF: ÿc0" + me.getStat(80) + " ÿc4GF: ÿc0" + me.getStat(79) + " ÿc1FR: ÿc0" + me.getStat(39) +
				" ÿc3CR: ÿc0" + me.getStat(43) + " ÿc9LR: ÿc0" + me.getStat(41) + " ÿc2PR: ÿc0" + me.getStat(45) +
				"\n" +
				"FCR: " + realFCR + " IAS: " + realIAS + " FBR: " + realFBR +
				" FHR: " + realFHR + " FRW: " + me.getStat(96) +
				"\n" +
				"CB: " + me.getStat(136) + " DS: " + me.getStat(141) + " OW: " + me.getStat(135) +
				" ÿc1LL: ÿc0" + me.getStat(60) + " ÿc3ML: ÿc0" + me.getStat(62) +
				" DR: " + me.getStat(36) + "% + " + me.getStat(34) + " MDR: " + me.getStat(37) + "% + " + me.getStat(35) +
				"\n" +
				(me.getStat(153) > 0 ? "ÿc3Cannot be Frozenÿc1" : "" ));

			break;
		case 101: // numpad 5
			if (AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo")) {
				if (AutoMule.getMuleItems().length > 0) {
					print("ÿc2Mule triggered");
					scriptBroadcast("mule");
					this.exit();
				} else {
					me.overhead("No items to mule.");
				}
			} else {
				me.overhead("Profile not enabled for muling.");
			}

			break;
		case 102: // Numpad 6
			MuleLogger.logChar();
			me.overhead("Logged char: " + me.name);

			break;
		case 109: // Numpad -
			Misc.spy(me.name);

			break;
		case 110: // decimal point
			say("/fps");

			break;
		case 105: // numpad 9 - get nearest preset unit id
			print(this.getNearestPreset());

			break;
		case 106: // numpad * - precast
			Precast.doPrecast(true);

			break;
		}
	};

	this.gameEvent = function (mode, param1, param2, name1, name2) {
		switch (mode) {
		case 0x00: // "%Name1(%Name2) dropped due to time out."
		case 0x01: // "%Name1(%Name2) dropped due to errors."
		case 0x03: // "%Name1(%Name2) left our world. Diablo's minions weaken."
			if ((typeof Config.QuitList === "string" && Config.QuitList.toLowerCase() === "any") ||
					(Config.QuitList instanceof Array && Config.QuitList.indexOf(name1) > -1)) {
				print(name1 + (mode === 0 ? " timed out" : " left"));

				quitFlag = true;
			}

			if (Config.AntiHostile) {
				scriptBroadcast("remove " + name1);
			}

			break;
		case 0x06: // "%Name1 was Slain by %Name2"
			if (Config.AntiHostile && param2 === 0x00 && name2 === me.name) {
				scriptBroadcast("mugshot " + name1);
			}

			break;
		case 0x07:
			if (Config.AntiHostile && param2 === 0x03) { // "%Player has declared hostility towards you."
				scriptBroadcast("findHostiles");
			}

			break;
		case 0x11: // "%Param1 Stones of Jordan Sold to Merchants"
			if (Config.DCloneQuit === 2) {
				D2Bot.printToConsole("SoJ sold in game. Leaving.");

				quitFlag = true;

				break;
			}

			if (Config.SoJWaitTime && me.gametype === 1) { // only do this in expansion
				D2Bot.printToConsole(param1 + " Stones of Jordan Sold to Merchants on IP " + me.gameserverip.split(".")[3], 7);
				Messaging.sendToScript("default.dbj", "soj");
			}

			break;
		case 0x12: // "Diablo Walks the Earth"
			if (Config.DCloneQuit > 0) {
				D2Bot.printToConsole("Diablo walked in game. Leaving.");

				quitFlag = true;

				break;
			}

			if (Config.StopOnDClone && me.gametype === 1) { // only do this in expansion
				D2Bot.printToConsole("Diablo Walks the Earth", 7);

				cloneWalked = true;

				this.togglePause();
				Town.goToTown();
				showConsole();
				print("ÿc4Diablo Walks the Earth");

				me.maxgametime = 0;

				if (Config.KillDclone) {
					load("tools/clonekilla.js");
				}
			}

			break;
		}
	};

	this.scriptEvent = function (msg) {
		var obj;

		switch (msg) {
		case "toggleQuitlist":
			canQuit = !canQuit;

			break;
		case "quit":
			quitFlag = true;

			break;
		default:
			try {
				obj = JSON.parse(msg);
			} catch (e) {
				return;
			}

			if (obj) {
				// PD2 stack toggle: main bot asks us to ctrl+shift+click
				if (obj.event === "pd2Stack" && obj.op === "modClick") {
					(function () {
						var reply, res;

						try {
							if (typeof Pd2Stack === "undefined" || typeof Pd2Stack.executeModClick !== "function") {
								res = {ok: false, err: "no_pd2stack"};
							} else {
								res = Pd2Stack.executeModClick(obj);
							}
						} catch (eClick) {
							res = {ok: false, err: "exception"};
						}

						reply = {
							event: "pd2Stack",
							op: "modClickResult",
							token: obj.token,
							ok: !!(res && res.ok),
							err: (res && res.err) || (res && res.ok ? "" : "fail")
						};

						if (typeof Pd2Stack !== "undefined" && typeof Pd2Stack.log === "function") {
							Pd2Stack.log("ÿc4Pd2Stackÿc0 :: ToolsThread modClick " +
								(reply.ok ? "ok" : ("fail " + reply.err)) +
								(obj.gid ? (" gid=" + obj.gid) : ""));
						} else {
							print("ÿc4Pd2Stackÿc0 :: ToolsThread modClick " +
								(reply.ok ? "ok" : ("fail " + reply.err)) +
								(obj.gid ? (" gid=" + obj.gid) : ""));
						}

						scriptBroadcast(JSON.stringify(reply));
					})();

					return;
				}

				if (obj.hasOwnProperty("currScript")) {
					debugInfo.currScript = obj.currScript;
				}

				if (obj.hasOwnProperty("lastAction")) {
					debugInfo.lastAction = obj.lastAction;
				}

				//D2Bot.store(JSON.stringify(debugInfo));
				DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
			}

			break;
		}
	};

	// Cache variables to prevent a bug where d2bs loses the reference to Config object
	Config = Misc.copy(Config);
	tick = getTickCount();

	addEventListener("keyup", this.keyEvent);
	addEventListener("gameevent", this.gameEvent);
	addEventListener("scriptmsg", this.scriptEvent);
	//addEventListener("gamepacket", Events.gamePacket);

	// Load Fastmod
	Packet.changeStat(105, Config.FCR);
	Packet.changeStat(99, Config.FHR);
	Packet.changeStat(102, Config.FBR);
	Packet.changeStat(93, Config.IAS);

	if (Config.QuitListMode > 0) {
		this.initQuitList();
	}

	// Start
	while (true) {
		try {
			// Restock path — allow rejuv attempts again after town
			if (me.gameReady && me.inTown && rejuvGaveUp) {
				rejuvGaveUp = false;
				rejuvMisses = 0;
			}

			if (me.gameReady && !me.inTown) {
				// User pause: ToolsThread stays alive for chicken, but do NOT keep
				// dumping belt/inv pots (esp. parked mana) while inspecting.
				if (!this.userPaused) {
					if (Config.UseHP > 0 && me.hp < Math.floor(me.hpmax * Config.UseHP / 100)) {
						this.drinkPotion(0);
					}

					if (Config.UseRejuvHP > 0 && !rejuvGaveUp &&
							me.hp < Math.floor(me.hpmax * Config.UseRejuvHP / 100)) {
						this.drinkPotion(2);
					}
				}

				// Give rejuv a tick to land before LifeChicken on the same low-HP frame
				if (Config.LifeChicken > 0 && me.hp <= Math.floor(me.hpmax * Config.LifeChicken / 100)) {
					if (Config.UseRejuvHP > 0 && !rejuvGaveUp) {
						this.drinkPotion(2);
						delay(80 + Math.min(me.ping, 200));
					}

					if (me.hp <= Math.floor(me.hpmax * Config.LifeChicken / 100)) {
						// Stop bot + TownChicken immediately so neither can keep casting TPs during quit
						this.stopDefault();
						this.stopTownChicken();
						D2Bot.printToConsole("Life Chicken (" + me.hp + "/" + me.hpmax + ")" + this.getNearestMonster() + " in " + Pather.getAreaName(me.area) + ". Ping: " + me.ping, 9);
						D2Bot.updateChickens();
						this.exit();

						break;
					}
				}

				if (!this.userPaused) {
					if (Config.UseMP > 0 && me.mp < Math.floor(me.mpmax * Config.UseMP / 100)) {
						this.drinkPotion(1);
					}

					if (Config.UseStaminaPotion > 0 && me.staminamax > 0 &&
							(!Config.StaminaUntilLevel || me.charlvl < Config.StaminaUntilLevel) &&
							me.stamina < Math.floor(me.staminamax * Config.UseStaminaPotion / 100)) {
						this.drinkPotion(5);
					}

					if (Config.UseRejuvMP > 0 && !rejuvGaveUp &&
							me.mp < Math.floor(me.mpmax * Config.UseRejuvMP / 100)) {
						this.drinkPotion(2);
					}
				}

				if (Config.ManaChicken > 0 && me.mp <= Math.floor(me.mpmax * Config.ManaChicken / 100)) {
					D2Bot.printToConsole("Mana Chicken: (" + me.mp + "/" + me.mpmax + ") in " + Pather.getAreaName(me.area), 9);
					D2Bot.updateChickens();
					this.exit();

					break;
				}

				if (Config.IronGolemChicken > 0 && me.classid === 2) {
					if (!ironGolem || copyUnit(ironGolem).x === undefined) {
						ironGolem = this.getIronGolem();
					}

					if (ironGolem) {
						if (ironGolem.hp <= Math.floor(128 * Config.IronGolemChicken / 100)) { // ironGolem.hpmax is bugged with BO
							D2Bot.printToConsole("Irom Golem Chicken in " + Pather.getAreaName(me.area), 9);
							D2Bot.updateChickens();
							this.exit();

							break;
						}
					}
				}

				if (Config.UseMerc) {
					mercHP = getMercHP();
					merc = me.getMerc();

					if (mercHP > 0 && merc && merc.mode !== 12) {
						if (mercHP < Config.MercChicken) {
							D2Bot.printToConsole("Merc Chicken in " + Pather.getAreaName(me.area), 9);
							D2Bot.updateChickens();
							this.exit();

							break;
						}

						if (mercHP < Config.UseMercHP) {
							this.drinkPotion(3);
						}

						if (mercHP < Config.UseMercRejuv) {
							this.drinkPotion(4);
						}
					}
				}

				if (Config.ViperCheck && getTickCount() - tick >= 250) {
					if (this.checkVipers()) {
						D2Bot.printToConsole("Revived Tomb Vipers found. Leaving game.", 9);

						quitFlag = true;
					}

					tick = getTickCount();
				}

				if (this.checkPing(true)) {
					quitFlag = true;
				}
			}
		} catch (e) {
			Misc.errorReport(e, "ToolsThread");

			quitFlag = true;
		}

		if (quitFlag && canQuit) {
			print("ÿc8Run duration ÿc2" + ((getTickCount() - me.gamestarttime) / 1000));

			if (Config.LogExperience) {
				Experience.log();
			}

			this.checkPing(false); // In case of quitlist triggering first
			this.exit();

			break;
		}

		if (debugInfo.area !== Pather.getAreaName(me.area)) {
			debugInfo.area = Pather.getAreaName(me.area);

			//D2Bot.store(JSON.stringify(debugInfo));
			DataFile.updateStats("debugInfo", JSON.stringify(debugInfo));
		}

		// One-shot Tal/Eth unstack test (data/pd2_force_unstack.txt) — every ~2s
		if (me.gameReady && me.inTown && typeof Pd2Stack !== "undefined" &&
				typeof Pd2Stack.runForceUnstackTest === "function") {
			if (!this._pd2UnstackTick || getTickCount() - this._pd2UnstackTick > 5000) {
				this._pd2UnstackTick = getTickCount();

				try {
					if (FileTools.exists("data/pd2_force_unstack.txt")) {
						Pd2Stack.runForceUnstackTest();
					}
				} catch (eForceUnstack) {}
			}
		}

		delay(20);
	}

	return true;
}