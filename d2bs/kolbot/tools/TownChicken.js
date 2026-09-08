/**
*	@filename	TownChicken.js
*	@author		kolton
*	@desc		handle town chicken
*/

js_strict(true);

include("json2.js");
include("NTItemParser.dbl");
include("OOG.js");
include("Gambling.js");
include("CraftingSystem.js");
include("common/Attack.js");
include("common/Cubing.js");
include("common/Config.js");
include("common/CollMap.js");
include("common/Loader.js");
include("common/Misc.js");
include("common/Pickit.js");
include("common/Pather.js");
include("common/Precast.js");
include("common/Prototypes.js");
include("common/ConsoleLog.js");
include("common/Runewords.js");
include("common/Storage.js");
include("common/Town.js");

function main() {
	var townCheck = false,
		holdingMain = false, // we paused default.dbj for a town trip
		userPaused = false; // Pause/Break from ToolsThread — never auto-resume over it

	if (typeof ConsoleLog !== "undefined") {
		ConsoleLog.install();
	}

	// Hold main bot for town trip (idempotent)
	this.holdMain = function () {
		var script = getScript("default.dbj"),
			i, anti,
			extras = ["tools/antihostile.js", "tools/rushthread.js", "tools/CloneKilla.js"];

		if (script && script.running) {
			print("ÿc1TownChickenÿc0 :: holding script (town trip)");
			script.pause();
			holdingMain = true;
		} else if (script && !script.running) {
			// Already paused (user pause or prior hold) — remember we still owe a release check
			holdingMain = true;
		}

		for (i = 0; i < extras.length; i += 1) {
			anti = getScript(extras[i]);

			if (anti && anti.running) {
				anti.pause();
			}
		}

		return true;
	};

	// Release after town trip — never resume if user Pause/Break is active
	this.releaseMain = function () {
		var script = getScript("default.dbj"),
			i, anti,
			extras = ["tools/antihostile.js", "tools/rushthread.js", "tools/CloneKilla.js"];

		if (!holdingMain) {
			return true;
		}

		holdingMain = false;

		if (userPaused) {
			print("ÿc8TownChickenÿc0 :: trip done — leaving paused (user pause)");

			return true;
		}

		if (script && !script.running && !getScript("tools/clonekilla.js")) {
			print("ÿc2TownChickenÿc0 :: resume script");
			script.resume();
		}

		for (i = 0; i < extras.length; i += 1) {
			anti = getScript(extras[i]);

			if (anti && !anti.running) {
				anti.resume();
			}
		}

		return true;
	};

	addEventListener("scriptmsg",
		function (msg) {
			if (msg === "townCheck") {
				if (me.area === 136) {
					print("Can't tp from uber trist.");
				} else if (!userPaused) {
					townCheck = true;
				}
			} else if (msg === "userPause") {
				userPaused = true;
				townCheck = false;
			} else if (msg === "userResume") {
				userPaused = false;
			}
		});

	// Init config and attacks
	D2Bot.init();
	Config.init();
	Pickit.init();
	Attack.init();
	Storage.Init();
	CraftingSystem.buildLists();
	Runewords.init();
	Cubing.init();

	while (true) {
		if (userPaused) {
			townCheck = false;
			delay(50);
			continue;
		}

		if (!me.inTown && (townCheck ||
			(Config.TownHP > 0 && me.hp < Math.floor(me.hpmax * Config.TownHP / 100)) ||
			(Config.TownMP > 0 && me.mp < Math.floor(me.mpmax * Config.TownMP / 100)))) {
			// About to LifeChicken — do not open TPs; ToolsThread will quit
			if (Config.LifeChicken > 0 && me.hpmax > 0 &&
					me.hp <= Math.floor(me.hpmax * Config.LifeChicken / 100)) {
				townCheck = false;
				delay(50);
				continue;
			}

			// Too close to chicken — stay and drink; TP mid-fight wastes scrolls and pauses the bot
			if (Config.LifeChicken > 0 && me.hpmax > 0 &&
					me.hp <= Math.floor(me.hpmax * Math.min(100, Config.LifeChicken + 15) / 100)) {
				townCheck = false;
				delay(50);
				continue;
			}

			this.holdMain();

			while (!me.gameReady) {
				delay(100);
			}

			try {
				// Re-check after pause — damage can drop us into LifeChicken while paused
				if (Config.LifeChicken > 0 && me.hpmax > 0 &&
						me.hp <= Math.floor(me.hpmax * Config.LifeChicken / 100)) {
					townCheck = false;
				} else if (userPaused) {
					townCheck = false;
				} else {
					me.overhead("Going to town");
					// Always run full chores — we interrupted the bot for a reason (pots/heal)
					Town.forceNextChores = true;
					Town.visitTown();
				}
			} catch (e) {
				Misc.errorReport(e, "TownChicken.js");
				scriptBroadcast("quit");

				return;
			} finally {
				this.releaseMain();

				townCheck = false;
			}
		}

		delay(50);
	}
}
