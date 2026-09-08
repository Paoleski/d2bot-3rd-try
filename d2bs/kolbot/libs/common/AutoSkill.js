/**
*	@filename	AutoSkill.js
*	@author		Original work by Nad42, edited by IMBA + PD2 UI click path
*	@desc		Allocate skill points via UI clicks only (sendClick).
*				useSkillPoint / packet 0x3B are broken on PD2 — never used.
*
*				Calibrate coords: pause bot → open skill tree → hover → F9
*				(F9 lives in tools/ToolsThread.js case 120 — NOT here).
*/

var AutoSkill = new function () {
	this.skillBuildOrder = [];
	this.save = 0;
	this.uiClick = null; // { openButton, tabs, skills }
	this._lastTab = null;

	this.status = function (msg) {
		print("ÿc2AutoSkillÿc0 :: ÿc8" + msg + "ÿc0");
		try {
			me.overhead(msg);
		} catch (e) {}
	};

	this.hasSendClick = function () {
		return typeof sendClick === "function";
	};

	this.hasSkillCoords = function (skillId) {
		var entry = this.uiClick && this.uiClick.skills && this.uiClick.skills[skillId];
		return !!(entry && entry.x !== undefined && entry.y !== undefined);
	};

	/** Close inventory / char / NPC / leftover panels so clicks hit the skill UI */
	this.clearBlockingUI = function () {
		var i, flags = [0x01, 0x02, 0x08, 0x0c, 0x0f, 0x14, 0x16, 0x17, 0x19, 0x1a];

		for (i = 0; i < 8; i += 1) {
			try {
				me.cancel();
			} catch (e) {}

			delay(120 + me.ping);
		}

		for (i = 0; i < flags.length; i += 1) {
			if (getUIFlag(flags[i])) {
				this.status("UI flag 0x" + flags[i].toString(16) + " still open — cancel");
				try {
					me.cancel();
				} catch (e2) {}
				delay(200 + me.ping);
			}
		}
	};

	this.skillCheck = function (skillid, count) {
		var hard = me.getSkill(skillid, 0) || 0,
			reqLvl = getBaseStat("skills", skillid, 176);

		// PD2 custom / relocated skills: bin reqlevel (col 176) is often wrong
		switch (skillid) {
		case 50: // Shiver Armor
			reqLvl = 12;
			break;
		case 60: // Chilling Armor
			reqLvl = 24;
			break;
		case 383: // Lesser Hydra
			reqLvl = 12;
			break;
		case 46: // Blaze (PD2: lvl 6, needs Inferno — keep off Hydra build)
			reqLvl = 6;
			break;
		case 376: // Combustion
			reqLvl = 24;
			break;
		case 369: // Ice Barrage
			reqLvl = 30;
			break;
		case 367: // Blood Warp (PD2 custom — bin reqlevel often wrong)
			reqLvl = 18;
			break;
		case 73: // Poison Strike (PD2; was Poison Dagger)
			reqLvl = 6;
			break;
		case 83: // Desecrate (PD2; was Poison Explosion)
			reqLvl = 18;
			break;
		default:
			break;
		}

		if (reqLvl === undefined || reqLvl === null || isNaN(reqLvl) || reqLvl < 0 || reqLvl > 99) {
			reqLvl = 1;
		}

		reqLvl = Math.floor(Number(reqLvl));

		if (hard >= count) {
			return false;
		}

		// Next hard point needs charlvl >= reqLvl + hard (explicit gate — no off-by-string bugs)
		if (me.charlvl < reqLvl + hard) {
			return false;
		}

		return true;
	};

	/**
	 * UI-click only: pick next skill from Build that still needs points and has calibrated coords.
	 * Does NOT auto-spend random prereqs — put prereqs in Config.AutoSkill.Build yourself.
	 */
	this.skillToAdd = function (inputArray) {
		var i, id, count, hard, minLvl, prevMin,
			dumpId = Config.AutoSkill && Config.AutoSkill.DumpSkill;

		for (i = 0; i < inputArray.length; i += 1) {
			if (inputArray[i][1] > 20) {
				print("AutoSkill: Skill build index " + i + " capped to 20 (was " + inputArray[i][1] + ")");
				inputArray[i][1] = 20;
			}

			if (inputArray[i][2] === undefined) {
				inputArray[i][2] = true;
			}

			// Honor satisfy — but skip level-gated previous so DumpSkill / later entries keep spending
			if (i > 0 && inputArray[i - 1][2]) {
				hard = me.getSkill(inputArray[i - 1][0], 0) || 0;
				prevMin = inputArray[i - 1][3];

				if (hard < inputArray[i - 1][1]) {
					if (prevMin && me.charlvl < prevMin) {
						this.status("Skill " + inputArray[i - 1][0] + " delayed until lvl " + prevMin + " — trying next");
					} else if (this.skillCheck(inputArray[i - 1][0], inputArray[i - 1][1])) {
						if (!this.hasSkillCoords(inputArray[i - 1][0])) {
							this.status("Need coords for skill " + inputArray[i - 1][0] + " (previous satisfy) — F9 calibrate");
							return false;
						}

						return inputArray[i - 1][0];
					} else {
						this.status("Skill " + inputArray[i - 1][0] + " not available yet (hard=" + hard + " charlvl=" + me.charlvl + ") — trying next");
					}
				}
			}

			id = inputArray[i][0];
			count = inputArray[i][1];
			minLvl = inputArray[i][3];

			// Optional Build[i][3] = min character level (delay Static/TK etc.)
			if (minLvl && me.charlvl < minLvl) {
				continue;
			}

			if (!this.skillCheck(id, count)) {
				continue;
			}

			if (!this.hasSkillCoords(id)) {
				this.status("Build wants skill " + id + " but no UIClick.skills[" + id + "] — skipping");
				continue;
			}

			return id;
		}

		if (dumpId && this.skillCheck(dumpId, 20) && this.hasSkillCoords(dumpId)) {
			this.status("Dump → skill " + dumpId + " (until next Build skill unlocks)");
			return dumpId;
		}

		this.status("No skill in Build needs a point right now (or all missing coords)");
		return false;
	};

	this.screenClick = function (x, y, afterMs) {
		var before, after;

		if (!this.hasSendClick()) {
			this.status("sendClick missing in this D2BS — cannot UI-click");
			return false;
		}

		if (afterMs === undefined) {
			afterMs = 400; // default delay between clicks
		}

		x = Math.round(x);
		y = Math.round(y);

		me.blockMouse = true;
		delay(50);

		try {
			before = getMouseCoords(0);
		} catch (e0) {
			before = [-1, -1];
		}

		this.status("sendClick(" + x + "," + y + ")  cursor was " + before[0] + "," + before[1]);
		sendClick(x, y);
		delay(afterMs + me.ping);

		try {
			after = getMouseCoords(0);
		} catch (e1) {
			after = [-1, -1];
		}

		this.status("cursor now " + after[0] + "," + after[1]);
		me.blockMouse = false;
		return true;
	};

	this.openSkillTree = function () {
		var i, btn, candidates,
			configured = (this.uiClick && this.uiClick.openButton) ? [this.uiClick.openButton] : [];

		if (getUIFlag(0x04)) {
			this.status("Skill tree already open");
			return true;
		}

		if (!this.hasSendClick()) {
			this.status("No sendClick — press T manually to open skill tree");
			return false;
		}

		candidates = configured.length ? configured : [
			[711, 578],
			[720, 565],
			[700, 565]
		];

		for (i = 0; i < candidates.length; i += 1) {
			btn = candidates[i];
			this.status("Click New Skill (open tree) @ " + btn[0] + "," + btn[1]);
			this.screenClick(btn[0], btn[1], 400); // available-skill button → 400ms

			if (getUIFlag(0x04)) {
				this.status("Skill tree open");
				this._lastTab = null;
				return true;
			}
		}

		this.status("Skill tree still closed — hover NEW SKILL button, F9 → openButton");
		return false;
	};

	this.closeSkillTree = function () {
		var i;

		for (i = 0; i < 5; i += 1) {
			if (!getUIFlag(0x04)) {
				this._lastTab = null;
				return true;
			}

			try {
				me.cancel();
			} catch (e) {}

			delay(300 + me.ping);
		}

		this._lastTab = null;
		return !getUIFlag(0x04);
	};

	this.clickTab = function (tabName) {
		var tabs = this.uiClick && this.uiClick.tabs,
			pt;

		if (!tabName) {
			return true;
		}

		if (!tabs || !tabs[tabName]) {
			this.status("Missing UIClick.tabs." + tabName + " — calibrate");
			return false;
		}

		pt = [tabs[tabName][0], tabs[tabName][1]];

		this.status("Click spell tab: " + tabName + " @ " + pt[0] + "," + pt[1]);
		this.screenClick(pt[0], pt[1], 400); // tab → 400ms
		this._lastTab = tabName;
		return true;
	};

	this.spendViaUIClick = function (skillId) {
		var entry = this.uiClick && this.uiClick.skills && this.uiClick.skills[skillId],
			beforePts = me.getStat(5),
			beforeHard = me.getSkill(skillId, 0) || 0,
			wait;

		if (!entry || entry.x === undefined || entry.y === undefined) {
			this.status("No UIClick.skills[" + skillId + "] — calibrate that icon");
			return false;
		}

		this.status("PLAN → spend 1 pt on skill " + skillId +
			" | tab=" + entry.tab +
			" | icon=[" + entry.x + "," + entry.y + "]" +
			" | pts=" + beforePts + " hard=" + beforeHard);
		this.status("Steps: 1) New Skill (400ms) → 2) tab " + entry.tab + " (400ms) → 3) skill icon (400ms)");

		if (!this.openSkillTree()) {
			this.status("Could not open skill tree");
			return false;
		}

		if (!entry.tab) {
			this.status("UIClick.skills[" + skillId + "] missing tab — set tab name matching UIClick.tabs");
			return false;
		}

		if (!this.clickTab(entry.tab)) {
			this.closeSkillTree();
			return false;
		}

		if (!getUIFlag(0x04)) {
			this.status("Tree closed before skill click — check tab/open coords");
			return false;
		}

		this.status("Click skill icon " + skillId + " @ " + entry.x + "," + entry.y);
		this.screenClick(entry.x, entry.y, 400); // skill → 400ms

		for (wait = 0; wait < 20; wait += 1) {
			if (me.getStat(5) < beforePts || (me.getSkill(skillId, 0) || 0) > beforeHard) {
				this.status("Spent OK → skill " + skillId + " hard=" + (me.getSkill(skillId, 0) || 0));
				delay(100);
				if (me.getStat(5) <= this.save) {
					this.closeSkillTree();
				}
				return true;
			}
			delay(100);
		}

		this.status("UI click did not spend (skill " + skillId + ") — F9 recalibrate icon");
		this.closeSkillTree();
		delay(100);
		return false;
	};

	this.allocate = function () {
		var tick = getTickCount(),
			addTo,
			ok;

		this.remaining = me.getStat(5);

		this.clearBlockingUI();

		if (getUIFlag(0x17) || getUIFlag(0x01) || getUIFlag(0x19)) {
			this.status("Blocked by open UI (trade/inv/other) — cannot spend yet");
			return false;
		}

		addTo = this.skillToAdd(this.skillBuildOrder);

		if (!addTo) {
			return false;
		}

		// Hard stop: never click a skill the character cannot learn yet
		if (!this.skillCheck(addTo, (me.getSkill(addTo, 0) || 0) + 1)) {
			this.status("Refuse skill " + addTo + " — charlvl " + me.charlvl + " too low (skillCheck)");
			return false;
		}

		this.status("Chosen skill to allocate: " + addTo + " (remaining pts=" + this.remaining + ")");
		delay(100);

		ok = this.spendViaUIClick(addTo);

		while (getTickCount() - tick < 2500 + 2 * me.ping) {
			if (this.remaining > me.getStat(5)) {
				return true;
			}

			delay(100);
		}

		return ok && this.remaining > me.getStat(5);
	};

	this.remaining = 0;
	this.count = 0;

	this.init = function (skillBuildOrder, save) {
		if (save === undefined) {
			save = 0;
		}

		this.skillBuildOrder = skillBuildOrder;
		this.save = save;
		this.count = 0;
		this._lastTab = null;

		if (Config.AutoSkill) {
			this.uiClick = Config.AutoSkill.UIClick || null;
			if (Config.AutoSkill.UseUIClick === false) {
				print("ÿc1AutoSkillÿc0 :: UseUIClick=false ignored on PD2 — UI click only");
			}
		}

		if (!this.uiClick || !this.uiClick.skills) {
			print("ÿc1AutoSkillÿc0 :: Config.AutoSkill.UIClick missing — cannot spend");
			return false;
		}

		if (!this.hasSendClick()) {
			print("ÿc1AutoSkillÿc0 :: sendClick unavailable — cannot spend");
			return false;
		}

		if (!this.skillBuildOrder || !this.skillBuildOrder.length) {
			print("AutoSkill: No build array specified");
			return false;
		}

		print("ÿc2AutoSkillÿc0 :: UI-click spend only | points=" + me.getStat(5) + " save=" + this.save);

		if (me.getStat(5) <= this.save) {
			print("ÿc2AutoSkillÿc0 :: nothing to spend");
			return true;
		}

		this.clearBlockingUI();

		while (me.getStat(5) > this.save) {
			if (!this.allocate()) {
				this.count += 1;
			} else if (me.getStat(5) < this.remaining) {
				this.count = 0;
			} else {
				this.count += 1;
			}

			delay(800 + me.ping);

			if (this.count > 3) {
				print("ÿc1AutoSkillÿc0 :: stopped after failed UI spends (remaining=" + me.getStat(5) + ")");
				this.closeSkillTree();
				break;
			}
		}

		this.closeSkillTree();
		print("AutoSkill: Finished allocating skill points");
		return true;
	};
};

};
};