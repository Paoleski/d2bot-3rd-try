/**
*	@filename	Precast.js
*	@author		noah-, kolton
*	@desc		handle player prebuff sequence
*/

var Precast = new function () {
	this.haveCTA = -1;
	this.BODuration = 0;
	this.BOTick = 0;
	this.bestSlot = {};
	this.coldEnchantTick = 0; // PD2 Cold Enchant ~300s
	this.shiverArmorTick = 0; // PD2 Shiver Armor ~180s+ at low level
	// Golem anti-spam (PD2 multi-golem from hard levels; false "dead" reads cause stack spam)
	this.golemCastTick = 0;
	this.golemSeenTick = 0;
	this.golemAliveUntil = 0; // sticky: treat as alive until this tick
	this.golemMissStreak = 0;
	this.golemLastKnownCount = 0; // last positive count (sticky shortfall vs flap)
	this.GOLEM_CAST_COOLDOWN = 15000; // hard floor between casts
	this.GOLEM_TRUST_MS = 45000; // after see/cast, trust alive this long even if APIs flap to 0

	this.weaponSwitch = function (slot) {
		if (me.gametype === 0 || me.weaponswitch === slot) {
			return true;
		}

		var i, tick;

		if (slot === undefined) {
			slot = me.weaponswitch ^ 1;
		}

		delay(500);

		for (i = 0; i < 5; i += 1) {
			weaponSwitch();

			tick = getTickCount();

			while (getTickCount() - tick < 2000 + me.ping) {
				if (me.weaponswitch === slot) {
					//delay(me.ping + 1);

					return true;
				}

				delay(10);
			}
		}

		return false;
	};

	this.precastCTA = function (force) {
		if (!force && me.getState(32)) {
			return true;
		}

		if (me.gametype === 0 || me.classid === 4 || me.inTown) {
			return false;
		}

		if (this.checkCTA()) {
			var slot = me.weaponswitch;

			this.weaponSwitch(this.haveCTA);
			Skill.cast(155, 0); // Battle Command
			Skill.cast(149, 0); // Battle Orders

			this.BODuration = (20 + me.getSkill(149, 1) * 10 + (me.getSkill(138, 0) + me.getSkill(155, 0)) * 5) * 1000;
			this.BOTick = getTickCount();

			this.weaponSwitch(slot);

			return true;
		}

		return false;
	};

	this.getBetterSlot = function (skillId) {
		if (this.bestSlot[skillId] !== undefined) {
			return this.bestSlot[skillId];
		}

		var item, classid, skillTab,
			sumCurr = 0,
			sumSwap = 0;

		switch (skillId) {
		case 40: // Cold Enchant (PD2 — was Frozen Armor)
		case 50: // Shiver Armor
		case 60: // Chilling Armor
			classid = 1;
			skillTab = 10;

			break;
		case 52: // Enchant
			classid = 1;
			skillTab = 8;

			break;
		case 57: // Thunder Storm
		case 58: // Energy Shield
			classid = 1;
			skillTab = 9;

			break;
		case 68: // Bone Armor
			classid = 2;
			skillTab = 17;

			break;
		case 117: // Holy Shield
			classid = 3;
			skillTab = 24;

			break;
		case 138: // Shout
		case 149: // Battle Orders
		case 155: // Battle Command
			classid = 4;
			skillTab = 34;

			break;
		case 235: // Cyclone Armor
			classid = 5;
			skillTab = 42;

			break;
		case 258: // Burst of Speed
		case 267: // Fade
			classid = 6;
			skillTab = 49;

			break;
		case 277: // Blade Shield
			classid = 6;
			skillTab = 48;

			break;
		default:
			return me.weaponswitch;
		}

		item = me.getItem();

		if (item) {
			do {
				if (item.bodylocation === 4 || item.bodylocation === 5) {
					sumCurr += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
				}

				if (item.bodylocation === 11 || item.bodylocation === 12) {
					sumSwap += (item.getStat(127) + item.getStat(83, classid) + item.getStat(188, skillTab) + item.getStat(107, skillId) + item.getStat(97, skillId));
				}
			} while (item.getNext());
		}

		this.bestSlot[skillId] = (sumSwap > sumCurr) ? me.weaponswitch ^ 1 : me.weaponswitch;
		return this.bestSlot[skillId];
	};

	this.precastSkill = function (skillId) {
		var swap = me.weaponswitch;

		this.weaponSwitch(this.getBetterSlot(skillId));
		Skill.cast(skillId, 0);
		this.weaponSwitch(swap);

		return true;
	};

	this.doPrecast = function (force) {
		var buffSummons = false;

		// Force BO 15 seconds before it expires
		this.precastCTA(!me.getState(32) || force || (getTickCount() - this.BOTick >= this.BODuration - 15000));

		switch (me.classid) {
		case 0: // Amazon
			if (Config.SummonValkyrie) {
				this.summon(32); // Valkyrie
			}

			break;
		case 1: // Sorceress
			if (me.getSkill(57, 0) && (!me.getState(38) || force)) {
				this.precastSkill(57); // Thunder Storm
			}

			if (me.getSkill(58, 0) && (!me.getState(30) || force)) {
				this.precastSkill(58); // Energy Shield
			}

			// Shiver / Chilling Armor — long duration. AutoSmurf calls doPrecast(true)
			// constantly; never force-refresh while buff/timer still valid.
			if (me.getSkill(50, 0)) {
				this.ensureShiverArmor();
			} else if (me.getSkill(60, 0)) {
				if (!me.getState(20)) {
					this.precastSkill(60); // Chilling Armor
				}
			}

			// PD2 Cold Enchant (skill 40): AoE party weapon buff, 300s
			if (me.getSkill(40, 0)) {
				this.coldEnchant();
			}

			// Enchant (skill 52) — respect active state (ignore force spam)
			if (me.getSkill(52, 0) && !me.getState(16)) {
				this.enchant();
			}

			break;
		case 2: // Necromancer
			// Bone Armor: missing or ≤1/3 absorb left (ClassAttack.ensureBoneArmor also mid-run)
			if (me.getSkill(68, 1)) {
				var baCur = me.getStat(132) || 0,
					baMax = me.getStat(133) || 0,
					baNeed = !me.getState(14) || (baMax > 0 && baCur * 3 <= baMax);

				if (baNeed) {
					this.precastSkill(68);
				}
			}

			switch (Config.Golem) {
			case 0:
			case "None":
				break;
			case 1:
			case "Clay":
				this.ensureNecroGolem(75);
				break;
			case 2:
			case "Blood":
				// Prefer Blood; Clay until 85 is learned
				this.ensureNecroGolem(85, 75);
				break;
			case 3:
			case "Fire":
				this.ensureNecroGolem(94, 85, 75);
				break;
			}

			break;
		case 3: // Paladin
			if (me.getSkill(117, 0) && (!me.getState(101) || force)) {
				this.precastSkill(117); // Holy Shield
			}

			break;
		case 4: // Barbarian - TODO: BO duration
			if (!me.getState(32) || !me.getState(51) || !me.getState(26) || force) {
				var swap = me.weaponswitch;

				this.weaponSwitch(this.getBetterSlot(149));

				if (!me.getState(51) || force) {
					Skill.cast(155, 0); // Battle Command
				}

				if (!me.getState(32) || force) {
					Skill.cast(149, 0); // Battle Orders
				}

				if (!me.getState(26) || force) {
					Skill.cast(138, 0); // Shout
				}

				this.weaponSwitch(swap);
			}

			break;
		case 5: // Druid
			if (me.getSkill(235, 0) && (!me.getState(151) || force)) {
				this.precastSkill(235); // Cyclone Armor
			}

			if (Config.SummonRaven) {
				this.summon(221); // Raven
			}

			switch (Config.SummonAnimal) {
			case 1:
			case "Spirit Wolf":
				buffSummons = this.summon(227) || buffSummons; // Summon Spirit Wolf

				break;
			case 2:
			case "Dire Wolf":
				buffSummons = this.summon(237) || buffSummons; // Summon Dire Wolf

				break;
			case 3:
			case "Grizzly":
				buffSummons = this.summon(247) || buffSummons; // Summon Grizzly

				break;
			}

			switch (Config.SummonVine) {
			case 1:
			case "Poison Creeper":
				buffSummons = this.summon(222) || buffSummons; // Poison Creeper

				break;
			case 2:
			case "Carrion Vine":
				buffSummons = this.summon(231) || buffSummons; // Carrion Vine

				break;
			case 3:
			case "Solar Creeper":
				buffSummons = this.summon(241) || buffSummons; // Solar Creeper

				break;
			}

			switch (Config.SummonSpirit) {
			case 1:
			case "Oak Sage":
				buffSummons = this.summon(226) || buffSummons; // Oak Sage

				break;
			case 2:
			case "Heart of Wolverine":
				buffSummons = this.summon(236) || buffSummons; // Heart of Wolverine

				break;
			case 3:
			case "Spirit of Barbs":
				buffSummons = this.summon(246) || buffSummons; // Spirit of Barbs

				break;
			}

			if (me.getSkill(250, 0) && (!me.getState(144) || force)) {
				Skill.cast(250, 0); // Hurricane
			}

			if (Config.SummonSpirit === 1 && me.getSkill(226, 1) && (!me.getState(149) || force)) {
				Skill.cast(226, 0); // Oak Sage
			}

			if (Config.SummonSpirit === 2 && me.getSkill(236, 1) && (!me.getState(148) || force)) {
				Skill.cast(236, 0); // Heart of Wolverine
			}

			if (Config.SummonSpirit === 3 && me.getSkill(246, 1) && (!me.getState(147) || force)) {
				Skill.cast(246, 0); // Spirit of Barbs
			}

			if (buffSummons) {
				this.precastCTA(force);
			}

			break;
		case 6: // Assassin
			if (me.getSkill(267, 0) && Config.UseFade && (!me.getState(159) || force)) {
				this.precastSkill(267); // Fade
			}

			if (me.getSkill(278, 0) && Config.UseVenom && (!me.getState(31) || force)) {
				Skill.cast(278, 0); // Venom
			}

			if (me.getSkill(277, 0) && (!me.getState(158) || force)) {
				this.precastSkill(277); // Blade Shield
			}

			if (me.getSkill(258, 0) && !Config.UseFade && Config.UseBoS && (!me.getState(157) || force)) {
				this.precastSkill(258); // Burst of Speed
			}

			switch (Config.SummonShadow) {
			case 1:
			case "Warrior":
				this.summon(268); // Shadow Warrior
				break;
			case 2:
			case "Master":
				this.summon(279); // Shadow Master
				break;
			}

			break;
		}
	};

	this.checkCTA = function () {
		var item;

		if (this.haveCTA > -1) {
			return true;
		}

		item = me.getItem(-1, 1);

		if (item) {
			do {
				if (item.getPrefix(20519)) { // Call to Arms
					switch (item.bodylocation) {
					case 4:
					case 5:
						this.haveCTA = me.weaponswitch;

						return true;
					case 11:
					case 12:
						this.haveCTA = me.weaponswitch ^ 1;

						return true;
					}
				}
			} while (item.getNext());
		}

		return false;
	};

	// Config.Golem → skill id (Clay 75 / Blood 85 / Fire 94)
	this.configuredGolemSkill = function () {
		if (typeof Config === "undefined" || !Config.Golem || Config.Golem === "None" || Config.Golem === 0) {
			return 0;
		}

		switch (Config.Golem) {
		case 3:
		case "Fire":
			return 94;
		case 2:
		case "Blood":
			return 85;
		case 1:
		case "Clay":
			return 75;
		default:
			return 0;
		}
	};

	// PD2: +1 golem per 5 hard points in Golem Mastery (79) — 5→2, 10→3, 15→4, 20→5.
	// Config.MaxGolems caps the auto count (set 1 to force single).
	this.desiredGolemCount = function () {
		var hard = me.getSkill(79, 0) || 0, n;

		n = 1 + Math.floor(hard / 5);

		if (typeof Config !== "undefined" && Config.MaxGolems > 0) {
			n = Math.min(n, Config.MaxGolems);
		}

		return Math.max(1, n);
	};

	// LoD/PD2 monstats: Clay=289 Blood=290 Iron=291 Fire=292 (NOT 290-293)
	this.golemClassIds = function () {
		return [289, 290, 291, 292];
	};

	this.isOwnMinion = function (unit) {
		var owner;

		if (!unit) {
			return false;
		}

		try {
			owner = unit.getParent();
		} catch (eOwn) {
			return false;
		}

		if (!owner) {
			return false;
		}

		if (owner.gid && owner.gid === me.gid) {
			return true;
		}

		if (owner.name && me.name && String(owner.name).toLowerCase() === String(me.name).toLowerCase()) {
			return true;
		}

		return false;
	};

	// Own golem units — correct classids + name fallback (getMinionCount flaps on PD2)
	this.findGolems = function () {
		var list = [], i, ids, unit, name;

		ids = this.golemClassIds();

		for (i = 0; i < ids.length; i += 1) {
			unit = getUnit(1, ids[i]);

			if (!unit) {
				continue;
			}

			do {
				try {
					if (typeof unit.x !== "number" || unit.mode === 0 || unit.mode === 12) {
						continue;
					}

					if (this.isOwnMinion(unit)) {
						list.push(copyUnit(unit));
					}
				} catch (eFind) {}
			} while (unit.getNext());
		}

		// Name fallback if classids shifted on this PD2 build
		if (list.length === 0) {
			try {
				unit = getUnit(1);

				if (unit) {
					do {
						try {
							if (typeof unit.x !== "number" || unit.mode === 0 || unit.mode === 12) {
								continue;
							}

							name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

							if (name.indexOf("golem") === -1) {
								continue;
							}

							if (this.isOwnMinion(unit)) {
								list.push(copyUnit(unit));
							}
						} catch (eName) {}
					} while (unit.getNext());
				}
			} catch (eScan) {}
		}

		return list;
	};

	this.minionGolemCount = function () {
		var n = 0, t, types = [3]; // classic golem minion type

		// Some builds expose golems under neighboring types — take the max, don't double-count
		for (t = 0; t < types.length; t += 1) {
			try {
				n = Math.max(n, me.getMinionCount(types[t]) || 0);
			} catch (eMin) {}
		}

		return n;
	};

	this.countGolems = function () {
		var n, found, now = getTickCount();

		n = this.minionGolemCount();
		found = this.findGolems().length;
		n = Math.max(n, found);

		if (n > 0) {
			this.golemSeenTick = now;
			this.golemAliveUntil = now + this.GOLEM_TRUST_MS;
			this.golemMissStreak = 0;
			this.golemLastKnownCount = n;

			return n;
		}

		return 0;
	};

	// True when we already have desired slots (or sticky/cooldown says don't cast yet).
	// PD2: Golem Mastery hard/5 sets quota — top up extras after cooldown.
	this.hasEnoughGolems = function () {
		var now = getTickCount(), count, desired, assumed;

		desired = this.desiredGolemCount();
		count = this.countGolems();

		if (count >= desired) {
			return true;
		}

		// Known shortfall with at least one living golem — need another cast after cooldown
		if (count > 0) {
			return false;
		}

		// Zero reads: trust sticky window using last known count (not full desired)
		if (this.golemAliveUntil && now < this.golemAliveUntil) {
			this.golemMissStreak += 1;
			assumed = this.golemLastKnownCount || 1;

			if (this.golemMissStreak >= 12 && this.golemCastTick &&
					(now - this.golemCastTick) > this.GOLEM_TRUST_MS) {
				this.golemAliveUntil = 0;
				this.golemMissStreak = 0;
				this.golemLastKnownCount = 0;

				return false;
			}

			// Sticky: enough only if last seen count already met the mastery quota
			if (assumed >= desired) {
				return true;
			}

			// Shortfall while APIs flap — wait for cast cooldown, then top up
			if (this.golemCastTick && (now - this.golemCastTick) < this.GOLEM_CAST_COOLDOWN) {
				return true;
			}

			return false;
		}

		if (this.golemCastTick && (now - this.golemCastTick) < this.GOLEM_CAST_COOLDOWN) {
			return true; // post-cast cooldown = treat as present
		}

		return false;
	};

	// Back-compat alias — "has golem(s) we need" (multi-aware)
	this.hasGolem = function () {
		return this.hasEnoughGolems();
	};

	// Summon until desired count (PD2 Golem Mastery slots); hard cooldown; one cast per call
	this.ensureNecroGolem = function () {
		var i, j, skillId, skills = [], now, before, desired;

		for (i = 0; i < arguments.length; i += 1) {
			skills.push(arguments[i]);
		}

		desired = this.desiredGolemCount();

		if (this.hasEnoughGolems()) {
			return true;
		}

		now = getTickCount();

		if (this.golemCastTick && (now - this.golemCastTick) < this.GOLEM_CAST_COOLDOWN) {
			return false;
		}

		for (i = 0; i < skills.length; i += 1) {
			skillId = skills[i];

			if (!me.getSkill(skillId, 1)) {
				continue;
			}

			before = this.countGolems();
			print("ÿc8Golemÿc0 :: summon skill " + skillId + " (" + before + "/" + desired + ")");
			Skill.cast(skillId, 0);
			this.golemCastTick = getTickCount();
			this.golemAliveUntil = this.golemCastTick + this.GOLEM_TRUST_MS;
			this.golemMissStreak = 0;
			this.golemLastKnownCount = Math.max(this.golemLastKnownCount, before + 1);
			delay(450 + me.ping);

			for (j = 0; j < 8; j += 1) {
				if (this.countGolems() > before) {
					return this.countGolems() >= desired;
				}

				delay(120);
			}

			// Sticky latch blocks immediate re-entry; next call tops up after cooldown if needed
			return this.hasEnoughGolems();
		}

		return false;
	};

	this.summon = function (skillId) {
		if (!me.getSkill(skillId, 1)) {
			return false;
		}

		var minion, rv, count = 1, attempts;

		switch (skillId) {
		case 32: // Valkyrie
			minion = 2;

			break;
		case 75: // Clay Golem
		case 85: // Blood Golem
		case 94: // Fire Golem
			// PD2: ensureNecroGolem tops up to Golem Mastery slots (cooldown between casts)
			return this.ensureNecroGolem(skillId);
		case 221: // Raven
			minion = 10;
			count = Math.min(me.getSkill(221, 1), 5);

			break;
		case 226: // Oak Sage
		case 236: // Heart of Wolverine
		case 246: // Spirit of Barbs
			minion = 13;

			break;
		case 222: // Poison Creeper
		case 231: // Carrion Vine
		case 241: // Solar Creeper
			minion = 14;

			break;
		case 227: // Spirit Wolf
			minion = 11;
			count = Math.min(me.getSkill(227, 1), 5);

			break;
		case 237: // Dire Wolf
			minion = 12;
			count = Math.min(me.getSkill(237, 1), 3);

			break;
		case 247: // Grizzly
			minion = 15;

			break;
		case 268: // Shadow Warrior
		case 279: // Shadow Master
			minion = 16;

			break;
		}

		// Cap attempts — if minion count never rises (PD2 flap), don't spin forever
		for (attempts = 0; attempts < 3 && me.getMinionCount(minion) < count; attempts += 1) {
			rv = true;

			Skill.cast(skillId, 0);
			delay(250 + me.ping);
		}

		return !!rv || me.getMinionCount(minion) >= count;
	};

	// PD2 Shiver Armor (~180s at lvl 1). Ignore doPrecast(force) spam from AutoSmurf.
	this.ensureShiverArmor = function () {
		var stillTimed;

		if (!me.getSkill(50, 1)) {
			return false;
		}

		// Soft lock: don't recast for ~2.5 min even if getState flaps
		stillTimed = this.shiverArmorTick && (getTickCount() - this.shiverArmorTick < 150000);

		if (me.getState(88) || stillTimed) {
			return true;
		}

		this.precastSkill(50);
		this.shiverArmorTick = getTickCount();
		delay(me.ping + 150);

		return true;
	};

	// PD2 Cold Enchant (40): AoE like BO — buffs self + party/merc weapons, 300s duration.
	// Timer-first: merc.getState(10) is unreliable on PD2 and doPrecast(true) used to force-spam.
	this.coldEnchant = function () {
		var merc, slot, stillTimed;

		if (!me.getSkill(40, 1)) {
			return false;
		}

		stillTimed = this.coldEnchantTick && (getTickCount() - this.coldEnchantTick < 270000);

		if (stillTimed) {
			return true;
		}

		// Optional: if state still visible on self/merc, extend timer without recast
		merc = me.getMerc();

		if (me.getState(10) || me.getState(16) || (merc && merc.mode !== 0 && merc.mode !== 12 && (merc.getState(10) || merc.getState(16)))) {
			this.coldEnchantTick = getTickCount();

			return true;
		}

		slot = me.weaponswitch;
		this.weaponSwitch(this.getBetterSlot(40));
		Skill.cast(40, 0, me);
		delay(me.ping * 2 + 200);
		this.coldEnchantTick = getTickCount();
		this.weaponSwitch(slot);

		return true;
	};

	this.enchant = function () {
		var unit, slot = me.weaponswitch, chanted = [];

		this.weaponSwitch(this.getBetterSlot(52));

		// Player
		unit = getUnit(0);

		if (unit) {
			do {
				if (!unit.dead && Misc.inMyParty(unit.name) && getDistance(me, unit) <= 40 && !unit.getState(16)) {
					Skill.cast(52, 0, unit);
					chanted.push(unit.name);
				}
			} while (unit.getNext());
		}

		// Minion / merc
		unit = getUnit(1);

		if (unit) {
			do {
				if (unit.getParent() && chanted.indexOf(unit.getParent().name) > -1 && getDistance(me, unit) <= 40 && !unit.getState(16)) {
					Skill.cast(52, 0, unit);
				}
			} while (unit.getNext());
		}

		// Always hit own merc if present (solo) and missing fire enchant
		unit = me.getMerc();

		if (unit && !unit.dead && getDistance(me, unit) <= 40 && !unit.getState(16)) {
			Skill.cast(52, 0, unit);
		}

		this.weaponSwitch(slot);

		return true;
	};
};