/**
*	@filename	Misc.js
*	@author		kolton
*	@desc		misc library containing Skill, Misc and Sort classes
*/

var Skill = {
	usePvpRange: false,

	getRange: function (skillId) {
		switch (skillId) {
		case 0: // Normal Attack
			return Attack.usingBow() ? 20 : 3;
		case 1: // Kick
		case 5: // Left Hand Swing
		case 10: // Jab
		case 14: // Power Strike
		case 19: // Javelin and Spear Mastery (PD2; was Impale)
		case 24: // Charged Strike
		case 30: // Fend
		case 34: // Lightning Strike
		case 46: // Blaze
		case 73: // Poison Dagger
		case 96: // Sacrifice
		case 97: // Smite
		case 106: // Zeal
		case 111: // Vengeance
		case 112: // Blessed Hammer
		case 116: // Conversion
		case 126: // Bash
		case 131: // Find Potion
		case 133: // Double Swing
		case 139: // Stun
		case 142: // Find Item
		case 144: // Concentrate
		case 147: // Frenzy
		case 150: // Grim Ward
		case 152: // Berserk
		case 232: // Feral Rage
		case 233: // Maul
		case 238: // Rabies
		case 239: // Fire Claws
		case 242: // Hunger
		case 248: // Fury
		case 255: // Dragon Talon
		case 260: // Dragon Claw
		case 270: // Dragon Tail
		case 368: // Deep Wounds (PD2)
		case 380: // Blade Dance (PD2)
			return 3;
		case 146: // Battle Cry
		case 154: // War Cry
		case 364: // Holy Nova (PD2)
			return 4;
		case 44: // Frost Nova
		case 240: // Twister
		case 245: // Tornado
		case 370: // Gust (PD2)
			return 5;
		case 38: // Charged Bolt — short bolts early; close in until 15
			return me.charlvl < 15 ? 3 : 6;
		case 48: // Nova
		case 151: // Whirlwind
			return 7;
		case 92: // Poison Nova
			return 8;
		case 249: // Armageddon
			return 9;
		case 15: // Poison Javelin
		case 25: // Plague Javelin
		case 101: // Holy Bolt
		case 107: // Charge
		case 130: // Howl
		case 225: // Firestorm
		case 229: // Molten Boulder
		case 243: // Shock Wave
			return 10;
		case 8: // Inner Sight
		case 17: // Slow Movement (PD2; was Slow Missiles)
			return 13;
		case 35: // Lightning Fury
		case 64: // Frozen Orb
		case 67: // Teeth
		case 234: // Fissure
		case 244: // Volcano
		case 251: // Fire Blast
		case 256: // Shock Web
		case 257: // Blade Sentinel
		case 266: // Blade Fury
			return 15;
		case 7: // Fire Arrow
		case 12: // Multiple Shot
		case 16: // Exploding Arrow
		case 22: // Guided Arrow
		case 27: // Immolation Arrow
		case 31: // Freezing Arrow
		case 95: // Revive
		case 121: // Fist of the Heavens
		case 140: // Double Throw
		case 253: // Psychic Hammer
		case 275: // Dragon Flight
			return 20;
		case 91: // Lower Resist
			return 50;
		// Variable range
		case 42: // Static Field
			return Math.floor((me.getSkill(42, 1) + 4) * 2 / 3);
		case 132: // Leap
			var leap = [4, 7, 8, 10, 11, 12, 12, 13, 14, 14, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17];

			return leap[Math.min(me.getSkill(132, 1) - 1, 24)];
		case 230: // Arctic Blast
			var arctic = [5, 6, 6, 6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 10, 10, 10, 10, 11, 11, 12];

			return arctic[Math.min(me.getSkill(230, 1) - 1, 19)];
		case 49: // Lightning
		case 84: // Bone Spear
		case 93: // Bone Spirit
			if (this.usePvpRange) {
				return 40;
			}

			return 15;
		case 47: // Fire Ball
		case 51: // Fire Wall
		case 53: // Chain Lightning
		case 56: // Meteor
		case 59: // Blizzard
		case 273: // Mind Blast
		case 369: // Ice Barrage (PD2)
		case 376: // Combustion (PD2)
			if (this.usePvpRange) {
				return 40;
			}

			return 20;
		case 357: // Blink (PD2)
		case 367: // Blood Warp (PD2)
			return 40;
		case 378: // Joust (PD2) — charge-like
			return 10;
		case 371: // Holy Light (PD2)
			return 15;
		case 365: // Shattering Arrow (PD2)
			return 20;
		case 383: // Lesser Hydra (PD2)
			return 20;
		}

		// Every other skill
		if (this.usePvpRange) {
			return 40;
		}

		return 20;
	},

	getHand: function (skillId) {
		switch (skillId) {
		case 6: // Magic Arrow
		case 7: // Fire Arrow
		case 9: // Critical Strike
		case 10: // Jab
		case 11: // Cold Arrow
		case 12: // Multiple Shot
		case 13: // Dodge
		case 14: // Power Strike
		case 15: // Poison Javelin
		case 16: // Exploding Arrow
		case 18: // Avoid
		case 19: // Javelin and Spear Mastery (PD2; was Impale)
		case 20: // Lightning Bolt
		case 21: // Ice Arrow
		case 22: // Guided Arrow
		case 23: // Penetrate
		case 24: // Charged Strike
		case 25: // Plague Javelin
		case 26: // Strafe
		case 27: // Immolation Arrow
		case 29: // Evade
		case 30: // Fend
		case 31: // Freezing Arrow
		case 33: // Pierce
		case 34: // Lightning Strike
		case 35: // Lightning Fury
		case 36: // Fire Bolt
		case 37: // Warmth
		case 38: // Charged Bolt
		case 39: // Ice Bolt
		case 41: // Inferno
		case 45: // Ice Blast
		case 47: // Fire Ball
		case 49: // Lightning
		case 53: // Chain Lightning
		case 55: // Glacial Spike
		case 61: // Fire Mastery
		case 63: // Lightning Mastery
		case 64: // Frozen Orb
		case 65: // Cold Mastery
		case 67: // Teeth
		case 73: // Poison Dagger
		case 79: // Golem Mastery
		case 84: // Bone Spear
		case 89: // Raise Skeleton Archer (PD2; was Summon Resist)
		case 93: // Bone Spirit
		case 101: // Holy Bolt
		case 107: // Charge
		case 111: // Vengeance
		case 112: // Blessed Hammer
		case 121: // Fist of the Heavens
		case 132: // Leap
		case 140: // Double Throw
		case 143: // Leap Attack
		case 151: // Whirlwind
		case 225: // Firestorm
		case 229: // Molten Boulder
		case 230: // Arctic Blast
		case 240: // Twister
		case 243: // Shock Wave
		case 245: // Tornado
		case 251: // Fire Trauma
		case 254: // Tiger Strike
		case 256: // Shock Field
		case 257: // Blade Sentinel
		case 259: // Fists of Fire
		case 263: // Weapon Block
		case 265: // Cobra Strike
		case 266: // Blade Fury
		case 269: // Claws of Thunder
		case 274: // Blades of Ice
		case 275: // Dragon Flight
		case 365: // Shattering Arrow (PD2)
		case 369: // Ice Barrage (PD2)
		case 376: // Combustion (PD2)
		case 378: // Joust (PD2)
		case 383: // Lesser Hydra (PD2)
			return 1;
		case 0: // Normal Attack — right-click (RMB), same slot casters use for spells
			return 0;
		case 96: // Sacrifice
		case 97: // Smite
		case 106: // Zeal
		case 116: // Conversion
		case 126: // Bash
		case 133: // Double Swing
		case 139: // Stun
		case 144: // Concentrate
		case 147: // Frenzy
		case 152: // Berserk
		case 232: // Feral Rage
		case 233: // Maul
		case 238: // Rabies
		case 239: // Fire Claws
		case 242: // Hunger
		case 248: // Fury
		case 255: // Dragon Talon
		case 260: // Dragon Claw
		case 270: // Dragon Tail
			return 2; // Left click / Shift bypass
		}

		// Every other skill
		return 0;
	},

	// TK only for: Pickit (gold/scrolls/keys/pots) and Duriel orifice (object 100).
	// Never monsters, chests, shrines, seals, etc. Restores RMB after cast.
	castTelekinesis: function (target) {
		var prevRmb, restore, ok;

		if (!target) {
			return false;
		}

		// Never TK monsters (PD2 lightning + knockback = fake attack)
		if (target.type === 1) {
			return false;
		}

		if (!(me.getSkill(43, 1) || me.getSkill(43, 0) || me.getStat(97, 43))) {
			return false;
		}

		prevRmb = me.getSkill(2);
		ok = this.cast(43, 0, target);

		if (prevRmb > 0 && prevRmb !== 43) {
			restore = prevRmb;
		} else if (Config.AttackSkill && Config.AttackSkill[1] > 0) {
			restore = Config.AttackSkill[1];
		} else if (Config.AttackSkill && Config.AttackSkill[3] > 0) {
			restore = Config.AttackSkill[3];
		} else {
			restore = 0;
		}

		if (restore !== 43) {
			this.setSkill(restore, 0);
		}

		return ok;
	},

	charges: [],

	// Cast a skill on self, Unit or coords
	cast: function (skillId, hand, x, y, item) {
		if (me.inTown && !this.townSkill(skillId)) {
			return false;
		}

		// Soft / item / oskill — staff +1 Fire Bolt must pass
		if (!item && skillId !== 0 && !me.getSkill(skillId, 1) && !me.getStat(97, skillId)) {
			return false;
		}

		if (!this.wereFormCheck(skillId)) {
			return false;
		}

		if (!item && skillId !== 0 && this.getManaCost(skillId) > me.mp) {
			// Maybe delay on ALL skills that we don't have enough mana for?
			if (Config.AttackSkill.concat([42, 54]).concat(Config.LowManaSkill).indexOf(skillId) > -1) {
				delay(300);
			}

			return false;
		}

		if (skillId === undefined) {
			throw new Error("Skill.cast: Must supply a skill ID");
		}

		var i, n, clickType, shift;

		if (hand === undefined) {
			hand = 0;
		}

		// Normal Attack: click the slot that already has Attack (necro LMB / caster RMB)
		if (skillId === 0 && !item) {
			if (me.getSkill(2) === 0) {
				hand = 0;
			} else if (me.getSkill(3) === 0) {
				hand = 2;
			}
		}

		if (x === undefined) {
			x = me.x;
		}

		if (y === undefined) {
			y = me.y;
		}

		if (!this.setSkill(skillId, hand, item)) {
			return false;
		}

		// Re-sync hand if setSkill put Attack on the other button
		if (skillId === 0 && !item) {
			if (me.getSkill(2) === 0) {
				hand = 0;
			} else if (me.getSkill(3) === 0) {
				hand = 2;
			}
		}

		if (Config.PacketCasting > 1) {
			switch (typeof x) {
			case "number":
				Packet.castSkill(hand, x, y);
				delay(250);

				break;
			case "object":
				Packet.unitCast(hand, x);
				delay(250);

				break;
			}
		} else {
			switch (hand) {
			case 0: // Right hand + No Shift
				clickType = 3;
				shift = 0;

				break;
			case 1: // Left hand + Shift
				clickType = 0;
				shift = 1;

				break;
			case 2: // Left hand + No Shift
				clickType = 0;
				shift = 0;

				break;
			case 3: // Right hand + Shift
				clickType = 3;
				shift = 1;

				break;
			}

MainLoop:
			for (n = 0; n < 3; n += 1) {
				if (typeof x === "object") {
					clickMap(clickType, shift, x);
				} else {
					clickMap(clickType, shift, x, y);
				}

				delay(20);

				if (typeof x === "object") {
					clickMap(clickType + 2, shift, x);
				} else {
					clickMap(clickType + 2, shift, x, y);
				}

				for (i = 0; i < 8; i += 1) {
					if (me.attacking) {
						break MainLoop;
					}

					delay(20);
				}
			}

			// Cap wait — me.attacking stuck true freezes both sorc and necro with no logs
			for (i = 0; i < 100 && me.attacking; i += 1) {
				delay(10);
			}
		}

		if (this.isTimed(skillId)) { // account for lag, state 121 doesn't kick in immediately
			for (i = 0; i < 10; i += 1) {
				if ([4, 9].indexOf(me.mode) > -1) {
					break;
				}

				if (me.getState(121)) {
					break;
				}

				delay(10);
			}
		}

		return true;
	},

	// Put a skill on desired slot
	setSkill: function (skillId, hand, item) {
		var slot;

		if (hand === undefined || hand === 3 || item) {
			item && hand !== 0 && print('[ÿc9Warningÿc0] charged skills must be cast from right hand');
			hand = 0;
		}

		// Normal Attack: use whichever mouse slot already has it (necro starts with Attack on LMB)
		if (skillId === 0 && !item) {
			if (me.getSkill(2) === 0) {
				hand = 0; // RMB
			} else if (me.getSkill(3) === 0) {
				hand = 2; // LMB
			}
		}

		// Right skill slot = 2 when hand 0 (RMB); left slot = 3 otherwise
		slot = (hand === 0) ? 2 : 3;

		// Already set on that slot
		if (me.getSkill(slot) === skillId) {
			return true;
		}

		// Skill 0 = normal attack — always available (not a tree skill)
		// Soft points + oskill (staff +1 / oskill Fire Bolt)
		if (!item && skillId !== 0 && !me.getSkill(skillId, 1) && !me.getStat(97, skillId)) {
			return false;
		}

		if (me.setSkill(skillId, hand, item)) {
			return true;
		}

		// Some cores want left slot as hand 1 instead of 2
		if (skillId === 0 && hand !== 0) {
			if (me.setSkill(0, 1, item)) {
				return true;
			}
		}

		// Normal attack: accept if either slot already shows Attack
		if (skillId === 0 && (me.getSkill(2) === 0 || me.getSkill(3) === 0)) {
			return true;
		}

		// Last try: put Attack on the other mouse button
		if (skillId === 0) {
			if (hand === 0 && me.setSkill(0, 2, item)) {
				return true;
			}

			if (hand !== 0 && me.setSkill(0, 0, item)) {
				return true;
			}
		}

		return false;
	},

	// Timed skills
	isTimed: function (skillId) {
		return [15, 25, 27, 51, 56, 59, 62, 64, 121, 225, 223, 228, 229, 234, 244, 247, 249, 250, 256, 268, 275, 277, 279, 369, 376, 383].indexOf(skillId) > -1;
	},

	// Wereform skill check
	wereFormCheck: function (skillId) {
		if (!me.getState(139) && !me.getState(140)) {
			return true;
		}

		// Can be cast by both
		if ([0, 1, 221, 222, 226, 227, 231, 236, 237, 239, 241, 242, 246, 247, 249].indexOf(skillId) > -1) {
			return true;
		}

		// Can be cast by werewolf only
		if (me.getState(139) && [223, 232, 238, 248].indexOf(skillId) > -1) {
			return true;
		}

		// Can be cast by werebear only
		if (me.getState(140) && [228, 233, 243].indexOf(skillId) > -1) {
			return true;
		}

		return false;
	},

	// Skills that cn be cast in town
	townSkill: function (skillId) {
		// 40 Cold Enchant, 391 Lesser Fade (PD2)
		return [32, 40, 43, 50, 52, 58, 60, 68, 75, 85, 94, 117, 221, 222, 226, 227, 235, 236, 237, 246, 247, 258, 267, 268, 277, 278, 279, 391].indexOf(skillId) > -1;
	},

	manaCostList: {},

	// Get mana cost of the skill (mBot)
	getManaCost: function (skillId) {
		if (skillId < 6) {
			return 0;
		}

		if (this.manaCostList.hasOwnProperty(skillId)) {
			return this.manaCostList[skillId];
		}

		var skillLvl = me.getSkill(skillId, 1),
			effectiveShift = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
			lvlmana = getBaseStat(3, skillId, "lvlmana") === 65535 ? -1 : getBaseStat(3, skillId, "lvlmana"), // Correction for skills that need less mana with levels (kolton)
			ret = Math.max((getBaseStat(3, skillId, "mana") + lvlmana * (skillLvl - 1)) * (effectiveShift[getBaseStat(3, skillId, "manashift")] / 256), getBaseStat(3, skillId, "minmana"));

		if (!this.manaCostList.hasOwnProperty(skillId)) {
			this.manaCostList[skillId] = ret;
		}

		return ret;
	}
};

var Item = {
	hasTier: function (item) {
		return Config.AutoEquip && NTIP.GetTier(item) > 0;
	},

	// Higher tier than equipped (any body slot) — keep even if canEquip fails (str/lvl/dex)
	isPendingPlayerUpgrade: function (item) {
		var i, tier, bodyLoc, eq, eqTier;

		if (!Config.AutoEquip || !item) {
			return false;
		}

		tier = NTIP.GetTier(item);

		if (tier <= 0) {
			return false;
		}

		bodyLoc = this.getBodyLoc(item);

		if (!bodyLoc) {
			return false;
		}

		for (i = 0; i < bodyLoc.length; i += 1) {
			eq = this.getEquippedItem(bodyLoc[i]);
			eqTier = eq.tier;

			if (eqTier < 0) {
				eqTier = 0;
			}

			if (eq.classid === -1 || tier > eqTier) {
				return true;
			}
		}

		return false;
	},

	// Sorc/necro never wear axes (Military Pick, Crowbill, …) — leave on ground
	isCasterJunkAxe: function (item) {
		var code, name;

		if (!item || (me.classid !== 1 && me.classid !== 2)) {
			return false;
		}

		if (typeof NTIPAliasType !== "undefined" && NTIPAliasType.axe !== undefined &&
				item.itemType === NTIPAliasType.axe) {
			return true;
		}

		if (item.itemType === 28) { // axe (LoD / most PD2)
			return true;
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		// Normal / excep / elite axe bases (incl. Military Pick → Crowbill → War Spike)
		if (code === "hax" || code === "axe" || code === "2ax" || code === "mpi" || code === "wax" ||
				code === "lax" || code === "bax" || code === "9ha" || code === "9ax" || code === "92a" ||
				code === "9mp" || code === "9wa" || code === "9la" || code === "9ba" ||
				code === "7ha" || code === "7ax" || code === "72a" || code === "7mp" ||
				code === "7wa" || code === "7la" || code === "7ba") {
			return true;
		}

		// classid range: normal axes 0–6, excep 93–99, elite 197–203 (LoD / NTIP aliases)
		if ((item.classid >= 0 && item.classid <= 6) ||
				(item.classid >= 93 && item.classid <= 99) ||
				(item.classid >= 197 && item.classid <= 203)) {
			return true;
		}

		name = item.name ? String(item.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (name.indexOf("military pick") > -1 || name.indexOf("crowbill") > -1 ||
				name.indexOf("war spike") > -1 || name.indexOf("hand axe") > -1 ||
				name.indexOf("double axe") > -1 || name.indexOf("large axe") > -1 ||
				name.indexOf("broad axe") > -1 || name.indexOf("battle axe") > -1 ||
				name.indexOf("great axe") > -1 || name.indexOf("giant axe") > -1 ||
				name.indexOf("hatchet") > -1 || name.indexOf("cleaver") > -1 ||
				name.indexOf("tomahawk") > -1 || name.indexOf("small axe") > -1) {
			return true;
		}

		return false;
	},

	// Barb-only helms (PD2 phlm = 72). Never for sorc/necro/merc unless Act5 barb.
	isBarbHelm: function (item) {
		var code;

		if (!item) {
			return false;
		}

		if (typeof NTIPAliasType !== "undefined" && NTIPAliasType.phlm !== undefined &&
				item.itemType === NTIPAliasType.phlm) {
			return true;
		}

		if (item.itemType === 72) {
			return true;
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		return /^ba[1-5a-e]$/i.test(code);
	},

	isShieldItem: function (item) {
		// PD2 ItemTypes: ashd may be 70 (LoD) or 71 (shifted); head/voodoo is often 70 on PD2
		return !!(item && (item.itemType === 2 || item.itemType === 70 || item.itemType === 71));
	},

	// Paladin-only shields (targe / sacred targe / …). Necro+sorc must never equip these.
	isAuricShield: function (item) {
		var t, code, alias;

		if (!item) {
			return false;
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		// Necro voodoo heads share offhand slot — never classify as auric
		if (/^ne[1-9a-f]$/i.test(code)) {
			return false;
		}

		if (typeof NTIPAliasType !== "undefined") {
			if (NTIPAliasType.head !== undefined && item.itemType === NTIPAliasType.head) {
				return false;
			}

			alias = NTIPAliasType.auricshields;

			if (alias !== undefined && item.itemType === alias) {
				return true;
			}
		}

		// Classic / excep / elite paladin shield codes
		if (/^pa[1-5a-e]$/i.test(code)) {
			return true;
		}

		t = item.itemType;

		// PD2 often shifts ashd to 71; LoD uses 70 for auric (heads are ne*)
		if (t === 71) {
			return true;
		}

		if (t === 70 && /^pa/i.test(code)) {
			return true;
		}

		return false;
	},

	// PD2: NTIPAliasType.orb = 69 (LoD was 68); norb/neworbs = 239 (PD2 exalted line)
	isOrbItem: function (item) {
		var t, alias, code;

		if (!item) {
			return false;
		}

		t = item.itemType;

		if (t === 68 || t === 69 || t === 239) {
			return true;
		}

		if (typeof NTIPAliasType !== "undefined") {
			alias = NTIPAliasType.orb;

			if (alias !== undefined && t === alias) {
				return true;
			}

			alias = NTIPAliasType.norb || NTIPAliasType.neworbs;

			if (alias !== undefined && t === alias) {
				return true;
			}
		}

		code = item.code ? String(item.code).toLowerCase() : "";

		// ob1–obf classic orbs; PD2 mythic/exalted/divine codes if present
		if (/^ob[1-9a-f]$/.test(code) || code === "mfo" || code === "exo" || code === "divo") {
			return true;
		}

		return false;
	},

	// Tiered shield kept for later while still on 2H staff (sorc staff→orb only)
	isPendingShield: function (item) {
		// Necro / melee use shields+heads with 1H immediately — never bank for "orb"
		if (me.classid !== 1) {
			return false;
		}

		if (!Config.AutoEquip || !this.isShieldItem(item)) {
			return false;
		}

		if (this.wantsShieldSlot()) {
			return false;
		}

		return NTIP.GetTier(item) > 0;
	},

	// Best pending shield by tier (inv + stash) — keep that one, sell worse
	isBestPendingShield: function (item) {
		var it, t, best = 0, bestGid = -1, mine, onChar;

		if (!this.isPendingShield(item)) {
			return false;
		}

		mine = NTIP.GetTier(item);
		onChar = (item.location === 3 || item.location === 7);
		it = me.getItem(-1, -1);

		if (it) {
			do {
				if ((it.location === 3 || it.location === 7) && this.isPendingShield(it)) {
					t = NTIP.GetTier(it);

					if (t > best || (t === best && it.gid > bestGid)) {
						best = t;
						bestGid = it.gid;
					}
				}
			} while (it.getNext());
		}

		// Ground / cursor: only keep if strictly better than what we already bank
		if (!onChar) {
			return mine > best || (best === 0 && mine > 0);
		}

		if (mine < best) {
			return false;
		}

		if (mine > best) {
			return true;
		}

		return item.gid === bestGid;
	},

	_pendingShield: null, // {classid, code, tier, quality}

	rememberPendingShield: function (item) {
		var tier;

		if (!this.isPendingShield(item)) {
			return false;
		}

		tier = NTIP.GetTier(item);

		if (!this._pendingShield || tier >= this._pendingShield.tier) {
			this._pendingShield = {
				classid: item.classid,
				code: item.code ? String(item.code) : "",
				tier: tier,
				quality: item.quality
			};
			print("ÿc2AutoEquipÿc0 :: remember shield tier " + tier +
				" (" + (item.name || this._pendingShield.code || "#") + ") — stash until orb/Spirit (sorc)");
		}

		return true;
	},

	// Sorc on 2H staff: keep best *useful* orb for switch (skills/FCR — not bare white)
	isPendingOrb: function (item) {
		var tier;

		if (me.classid !== 1 || !Config.AutoEquip || !this.isOrbItem(item)) {
			return false;
		}

		if (this.wantsShieldSlot()) {
			return false; // already on orb / Spirit
		}

		tier = NTIP.GetTier(item) || 0;

		// Tier 12+ = ColdSkillTab / skills / FCR lines — bare white was tier 6 junk
		return tier >= 12;
	},

	isBestPendingOrb: function (item) {
		var it, t, best = 0, bestGid = -1, mine;

		if (!this.isPendingOrb(item)) {
			return false;
		}

		mine = NTIP.GetTier(item);
		it = me.getItem(-1, -1);

		if (it) {
			do {
				if ((it.location === 3 || it.location === 7) && this.isPendingOrb(it)) {
					t = NTIP.GetTier(it);

					if (t > best || (t === best && it.gid > bestGid)) {
						best = t;
						bestGid = it.gid;
					}
				}
			} while (it.getNext());
		}

		if (mine < best) {
			return false;
		}

		if (mine > best) {
			return true;
		}

		return item.gid === bestGid || bestGid === -1;
	},

	// 0 durability / empty stack (not indestructible). Ethereal gear cannot be NPC-repaired.
	isBroken: function (item) {
		var durability, maxDur, quantity;

		if (!item || item.type !== 4) {
			return false;
		}

		if (item.getStat(152)) { // Indestructible
			return false;
		}

		switch (item.itemType) {
		case 42: // Throwing knives
		case 43: // Throwing axes
		case 44: // Javelins
		case 87: // Amazon javelins
			quantity = item.getStat(70);

			return typeof quantity === "number" && quantity <= 0;
		default:
			break;
		}

		maxDur = item.getStat(73);

		if (typeof maxDur !== "number" || maxDur <= 0) {
			return false;
		}

		durability = item.getStat(72);

		return typeof durability === "number" && durability <= 0;
	},

	canEquip: function (item) {
		if (item.type !== 4) { // Not an item
			return false;
		}

		if (!item.getFlag(0x10)) { // Unid item
			return false;
		}

		if (this.isBroken(item)) {
			return false;
		}

		if (item.getStat(92) > me.getStat(12) || item.dexreq > me.getStat(2) || item.strreq > me.getStat(0)) { // Higher requirements
			return false;
		}

		return true;
	},

	// Equips an item and throws away the old equipped item
	equip: function (item, bodyLoc) {
		if (!this.canEquip(item)) {
			return false;
		}

		// Already equipped in the right slot
		if (item.mode === 1 && item.bodylocation === bodyLoc) {
			return true;
		}

		var i, cursorItem;

		if (item.location === 7) {
			if (!Town.openStash()) {
				return false;
			}
		}

		for (i = 0; i < 3; i += 1) {
			if (item.toCursor()) {
				clickItem(0, bodyLoc);
				delay(me.ping * 2 + 500);

				if (item.bodylocation === bodyLoc) {
					if (getCursorType() === 3) {
						//Misc.click(0, 0, me);

						cursorItem = getUnit(100);

						if (cursorItem) {
							if (!Storage.Inventory.CanFit(cursorItem) || !Storage.Inventory.MoveTo(cursorItem)) {
								cursorItem.drop();
							}
						}
					}

					return true;
				}
			}
		}

		return false;
	},

	getEquippedItem: function (bodyLoc) {
		var item = me.getItem();

		if (item) {
			do {
				if (item.bodylocation === bodyLoc) {
					// Broken eth (and any 0-dur) must lose the slot — NTIP tier alone kept wearing dead shields
					return {
						classid: item.classid,
						tier: this.isBroken(item) ? -1 : NTIP.GetTier(item)
					};
				}
			} while (item.getNext());
		}

		return {
			classid: -1,
			tier: -1
		};
	},

	// Actual equipped unit for a body slot (or null)
	getEquippedItemUnit: function (bodyLoc) {
		var item = me.getItem();

		if (item) {
			do {
				if (item.bodylocation === bodyLoc) {
					return copyUnit(item);
				}
			} while (item.getNext());
		}

		return null;
	},

	// Staffs/bows/etc. occupy both hands — offhand looks "empty" to getEquippedItem(5)
	isTwoHanded: function (item) {
		var twoHand;

		if (!item || item.type !== 4) {
			return false;
		}

		twoHand = getBaseStat("items", item.classid, "2handed");

		if (twoHand === 1) {
			return true;
		}

		// Fallback: staff / bow / polearm / crossbow
		return [26, 27, 34, 35].indexOf(item.itemType) > -1;
	},

	hasTwoHandedEquipped: function () {
		var main = this.getEquippedItemUnit(4);

		return !!(main && this.isTwoHanded(main));
	},

	// Shields only after we switch to an orb (or Spirit sword). Staff = no shield pick/equip.
	wantsShieldSlot: function () {
		var main = this.getEquippedItemUnit(4),
			mainTier;

		if (!main || this.isTwoHanded(main)) {
			return false;
		}

		// Sorc: only equip shield once on orb or endgame Spirit (not while 2H staff)
		if (me.classid === 1) {
			if (this.isOrbItem(main)) {
				return true;
			}

			mainTier = NTIP.GetTier(main);

			return main.itemType === 30 && mainTier >= 100;
		}

		// Necro / others: any 1H weapon (dagger, wand, sword…) can use offhand
		return true;
	},

	// Poison Strike necro: mainhand must be a knife once PS is learned
	wantsPoisonStrikeDagger: function () {
		if (me.classid !== 2) {
			return false;
		}

		return !!(me.getSkill(73, 0) || me.getSkill(73, 1) || me.getStat(97, 73));
	},

	// Melee PS: FCR jewelry with no life/AR/res/skills/leech — never wear (base nec.nip still tiers FCR rings)
	isMeleeJunkFcrJewelry: function (item) {
		var fcr, hp, ar, str, dex, res, ll, necro, tab, pd;

		if (!item || !this.wantsPoisonStrikeDagger()) {
			return false;
		}

		// ring / amulet only
		if (item.itemType !== 10 && item.itemType !== 12) {
			return false;
		}

		fcr = item.getStat(105) || 0;

		if (typeof item.getStatEx === "function") {
			fcr = Math.max(fcr, item.getStatEx(105) || 0);
		}

		if (fcr < 10) {
			return false;
		}

		hp = item.getStat(7) || 0;
		ar = item.getStat(19) || 0;
		str = item.getStat(0) || 0;
		dex = item.getStat(2) || 0;
		res = (item.getStat(39) || 0) + (item.getStat(41) || 0) + (item.getStat(43) || 0) + (item.getStat(45) || 0);
		ll = item.getStat(60) || 0;
		necro = item.getStat(83, 2) || 0;
		tab = item.getStat(188, 17) || 0; // poisonandboneskilltab
		pd = (item.getStat(97, 73) || 0) + (item.getStat(107, 73) || 0);

		if (hp >= 15 || ar >= 40 || res >= 15 || (str + dex) >= 10 || ll >= 3) {
			return false;
		}

		if (necro >= 1 || tab >= 1 || pd >= 1 || (item.getStat(127) || 0) >= 1) {
			return false;
		}

		return true;
	},

	getBodyLoc: function (item) {
		var bodyLoc;

		switch (item.itemType) {
		case 2: // Shield
		case 70: // Auric Shields (LoD) OR voodoo heads (PD2 shifted) — both offhand
		case 71: // Auric Shields (PD2 shifted)
			bodyLoc = 5;

			break;
		case 3: // Armor
			bodyLoc = 3;

			break;
		case 5: // Arrows
		case 6: // Bolts
			bodyLoc = 5;

			break;
		case 10: // Ring
			bodyLoc = [6, 7];

			break;
		case 12: // Amulet
			bodyLoc = 2;

			break;
		case 15: // Boots
			bodyLoc = 9;

			break;
		case 16: // Gloves
			bodyLoc = 10;

			break;
		case 19: // Belt
			bodyLoc = 8;

			break;
		case 37: // Helm
		case 72: // Primal/barb helm (PD2 phlm); LoD used 71 for barb — PD2 71 is ashd (offhand above)
		case 73: // Pelt (PD2)
		case 75: // Circlet (alias may collide with rune — still try helm)
			bodyLoc = 1;

			break;
		case 24: //		case 25: //
		case 26: //
		case 27: //
		case 28: //
		case 29: //
		case 30: //
		case 31: //
		case 32: //
		case 33: //
		case 34: //
		case 35: //
		case 36: //
		case 42: //
		case 43: //
		case 44: //
		case 67: // Handtohand (Assassin Claw)
		case 68: // Orb (LoD) / h2h (PD2) — both weapons
		case 69: // Orb (PD2) / head (LoD)
		case 85: //
		case 86: //
		case 87: //
		case 88: //
		case 239: // PD2 neworbs
			bodyLoc = 4;

			break;
		default:
			// Classid orb fallback when itemType is exotic
			if (this.isOrbItem(item)) {
				bodyLoc = 4;
				break;
			}

			return false;
		}

		if (typeof bodyLoc === "number") {
			bodyLoc = [bodyLoc];
		}

		return bodyLoc;
	},

	// SoloPlay idea (empty base score -1) → PD2: never wear blanks reserved for Config.Runewords
	// White/grey only (q 1–3). Magic/rare/set/unique cannot be runewords.
	isRwBaseQuality: function (item) {
		var q;

		if (!item) {
			return false;
		}

		q = item.quality;

		return q === 1 || q === 2 || q === 3;
	},

	isProtectedRWBase: function (item) {
		var i, rw, sockets, ethFlag, baseId, recipeLen, key, socked, bestIns, bestLore;

		if (!Config.AutoGear || !Config.AutoGear.ProtectRWBases) {
			return false;
		}

		if (!item || !this.isRwBaseQuality(item) || !Config.Runewords || !Config.Runewords.length) {
			return false;
		}

		// Already socketed with runes/gems — not an empty RW base
		socked = item.getItem();

		if (socked) {
			return false;
		}

		sockets = item.getStat(194) || 0;

		// PD2: getStat(194) often 0 on field/shop bases — getStatEx sees real socket count
		if (typeof item.getStatEx === "function") {
			sockets = Math.max(sockets, item.getStatEx(194) || 0);
		}

		if (sockets < 1) {
			return false;
		}

		for (i = 0; i < Config.Runewords.length; i += 1) {
			rw = Config.Runewords[i];

			if (!rw || !rw[0] || rw[0] === false) {
				continue;
			}

			recipeLen = rw[0].length;

			if (!recipeLen || sockets !== recipeLen) {
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

			if (item.classid !== baseId) {
				// Lore: accept any white/grey helm or circlet (PD2 classid / alias miss)
				if (!(typeof Runewords !== "undefined" && Runewords.isLoreRecipe &&
						Runewords.isLoreRecipe(rw[0]) && Runewords.isConfiguredLoreBase &&
						Runewords.isConfiguredLoreBase(item))) {
					continue;
				}
			}

			ethFlag = rw[2] || 0;

			if (ethFlag === 1 && !item.getFlag(0x400000)) {
				continue;
			}

			if (ethFlag === 2 && item.getFlag(0x400000)) {
				continue;
			}

			// Leaf bases: don't protect once a better skill orb exists
			if (typeof Runewords !== "undefined" && Runewords.isLeafRecipe && Runewords.isLeafRecipe(rw[0]) &&
					Runewords.hasBetterThanLeafOrb && Runewords.hasBetterThanLeafOrb()) {
				continue;
			}

			// Stealth bases: don't protect extras once one Stealth is done
			if (typeof Runewords !== "undefined" && Runewords.isStealthRecipe && Runewords.isStealthRecipe(rw[0]) &&
					Runewords.hasCompletedArmorRuneword && Runewords.hasCompletedArmorRuneword()) {
				continue;
			}

			// Lore bases: only protect the highest-def empty helm (max one)
			if (typeof Runewords !== "undefined" && Runewords.isLoreRecipe &&
					Runewords.isLoreRecipe(rw[0])) {
				if (Runewords.hasCompletedLoreHelm && Runewords.hasCompletedLoreHelm()) {
					continue;
				}

				bestLore = Runewords.getBestEmptyLoreBase && Runewords.getBestEmptyLoreBase();

				if (bestLore && bestLore.gid !== item.gid &&
						!(Runewords.wantLoreBase && Runewords.wantLoreBase(item))) {
					continue;
				}
			}

			// Spirit sword bases: don't protect extras once Spirit is done
			if (typeof Runewords !== "undefined" && Runewords.isSpiritRecipe && Runewords.isSpiritRecipe(rw[0]) &&
					Runewords.hasCompletedSpiritSword && Runewords.hasCompletedSpiritSword()) {
				continue;
			}

			// Insight: only protect the best empty pole (max one base)
			if (typeof Runewords !== "undefined" && Runewords.isInsightRecipe &&
					Runewords.isInsightRecipe(rw[0])) {
				if (Runewords.hasCompletedInsight && Runewords.hasCompletedInsight()) {
					continue;
				}

				bestIns = Runewords.getBestEmptyInsightBase && Runewords.getBestEmptyInsightBase();

				// Protect this item only if it's the best banked base, or an upgrade we want
				if (bestIns && bestIns.gid !== item.gid &&
						!(Runewords.wantInsightBase && Runewords.wantInsightBase(item))) {
					continue;
				}
			}

			return true;
		}

		return false;
	},

	autoEquipCheck: function (item) {
		if (!Config.AutoEquip) {
			return true;
		}

		var i, eq, eqTier,
			tier = NTIP.GetTier(item),
			bodyLoc = this.getBodyLoc(item);

		// Broken / 0-dur — never keep for equip (esp. ethereal NPC can't repair)
		if (this.isBroken(item)) {
			return false;
		}

		// Empty Stealth/Lore/Leaf/Steel bases → stash for RW, never wear
		if (this.isProtectedRWBase(item)) {
			return false;
		}

		// Paladin shields (auric) — only paladin can wear
		if (me.classid !== 3 && this.isAuricShield(item)) {
			return false;
		}

		// Casters: never equip axes (Military Pick, War Axe, …)
		if (this.isCasterJunkAxe(item)) {
			return false;
		}

		// Barb helms — only barbarian wears these
		if (me.classid !== 4 && this.isBarbHelm(item)) {
			return false;
		}

		// Sorceress: never wand (staff/orb only) — blocks MiniShopBot Drognan wand buys
		if (me.classid === 1 && item.itemType === 25) {
			return false;
		}

		// Shields: only once we run an orb (or Spirit sword). Never with a 2H staff.
		if (tier > 0 && bodyLoc && this.isShieldItem(item)) {
			if (!this.wantsShieldSlot()) {
				return false;
			}
		}

		// Poison Strike necro: mainhand must stay a knife — reject wand/staff/orb/other weapons
		if (tier > 0 && this.wantsPoisonStrikeDagger() && bodyLoc && bodyLoc[0] === 4) {
			if (item.itemType !== 32) {
				return false;
			}
		}

		// Poison Strike melee: never equip FCR-only rings/amulets
		if (this.isMeleeJunkFcrJewelry(item)) {
			return false;
		}

		// Sorc: allow orb to replace 2H staff when orb has real mods (same-stat orb > staff in nips)
		if (tier > 0 && me.classid === 1 && this.isOrbItem(item) && this.hasTwoHandedEquipped()) {
			eq = this.getEquippedItem(4);
			eqTier = eq.tier < 0 ? 0 : eq.tier;

			// Force off white/early staff only; Leaf (90) and high skill staff use normal tier compare
			if (tier >= 10 && eqTier < 45 && (this.canEquip(item) || !item.getFlag(0x10))) {
				return true;
			}
		}

		if (tier > 0 && bodyLoc) {
			for (i = 0; i < bodyLoc.length; i += 1) {
				eq = this.getEquippedItem(bodyLoc[i]);
				eqTier = eq.tier;

				if (eq.classid === -1) {
					if (!item.getFlag(0x10) && item.quality > 2) {
						return true;
					}

					if (this.canEquip(item)) {
						return true;
					}

					continue;
				}

				if (eqTier < 0) {
					eqTier = 0;
				}

				if (tier > eqTier && (this.canEquip(item) || !item.getFlag(0x10))) {
					return true;
				}
			}
		}

		// Sell/ignore low tier leftovers; never "keep" non-upgrades by default
		if (tier > 0 && tier < 100) {
			return false;
		}

		return false;
	},

	// MiniShopBot: don't spend gold on defense-formula starters (1.xxx) that only beat equipped by +1 AC
	worthShopBuy: function (item) {
		var i, tier, bodyLoc, eq, eqTier;

		if (!Config.AutoEquip || !item) {
			return false;
		}

		if (!this.autoEquipCheck(item)) {
			return false;
		}

		tier = NTIP.GetTier(item);
		bodyLoc = this.getBodyLoc(item);

		if (!bodyLoc || tier <= 0) {
			return false;
		}

		for (i = 0; i < bodyLoc.length; i += 1) {
			eq = this.getEquippedItem(bodyLoc[i]);
			eqTier = eq.tier;

			if (eqTier < 0) {
				eqTier = 0;
			}

			// Empty slot — buy to fill
			if (eq.classid === -1) {
				return true;
			}

			if (tier <= eqTier) {
				continue;
			}

			// Both in starter band (1 + defense/1000) — skip marginal AC shop spam
			if (tier < 2 && eqTier < 2) {
				continue;
			}

			return true;
		}

		return false;
	},

	// returns true if the item should be kept+logged, false if not
	autoEquip: function () {
		if (!Config.AutoEquip) {
			return true;
		}

		var i, j, tier, bodyLoc, tome, gid, eqTier, orbSwitch, worn, locs,
			items;

		// Ethereal gear can't be NPC-repaired — pull broken eth off the body so we can replace it
		(function () {
			var ethBroken = [],
				u = me.getItem(-1, 1),
				k, cur;

			if (u) {
				do {
					if (u.getFlag(0x400000) && Item.isBroken(u)) {
						ethBroken.push(u.gid);
					}
				} while (u.getNext());
			}

			for (k = 0; k < ethBroken.length; k += 1) {
				cur = me.getItem(-1, -1, ethBroken[k]);

				if (!cur || cur.mode !== 1) {
					continue;
				}

				// Optional Ort/Ral while still equipped (cubeRepair only accepts mode 1)
				if (Config.CubeRepair && typeof Town !== "undefined" && typeof Town.cubeRepairItem === "function") {
					Town.cubeRepairItem(cur);
					cur = me.getItem(-1, -1, ethBroken[k]);

					if (cur && cur.mode === 1 && !Item.isBroken(cur)) {
						continue;
					}
				}

				if (!cur || cur.mode !== 1 || !Item.isBroken(cur)) {
					continue;
				}

				print("ÿc1AutoEquipÿc0 :: unequip broken ethereal " + (cur.name || cur.classid));

				if (cur.toCursor()) {
					delay(me.ping * 2 + 200);

					if (getCursorType() === 3) {
						cur = getUnit(100);

						if (cur && (!Storage.Inventory.CanFit(cur) || !Storage.Inventory.MoveTo(cur))) {
							cur.drop();
						}
					}
				}
			}
		}());

		items = me.findItems(-1, 0);

		if (!items) {
			return false;
		}

		// Melee PS: pull FCR-only jewelry off the body so town can sell it
		if (this.wantsPoisonStrikeDagger()) {
			locs = [2, 6, 7]; // amulet, ring1, ring2

			for (i = 0; i < locs.length; i += 1) {
				worn = this.getEquippedItemUnit(locs[i]);

				if (worn && this.isMeleeJunkFcrJewelry(worn)) {
					print("ÿc8AutoEquipÿc0 :: unequip FCR junk jewelry (melee PS)");

					if (worn.toCursor()) {
						delay(me.ping * 2 + 200);

						if (getCursorType() === 3) {
							worn = getUnit(100);

							if (worn && (!Storage.Inventory.CanFit(worn) || !Storage.Inventory.MoveTo(worn))) {
								worn.drop();
							}
						}
					}
				}
			}
		}

		function sortEq(a, b) {
			var aShield = Item.isShieldItem(a) ? 1 : 0,
				bShield = Item.isShieldItem(b) ? 1 : 0;

			// Weapons before shields so a 2H staff equips first
			if (aShield !== bShield) {
				return aShield - bShield;
			}

			if (Item.canEquip(a)) {
				return -1;
			}

			if (Item.canEquip(b)) {
				return 1;
			}

			return NTIP.GetTier(b) - NTIP.GetTier(a);
		}

		me.cancel();

		// Remove items without tier / broken (won't equip; avoid wasted tries)
		for (i = 0; i < items.length; i += 1) {
			if (NTIP.GetTier(items[i]) === 0 || this.isBroken(items[i])) {
				items.splice(i, 1);

				i -= 1;
			}
		}

		while (items.length > 0) {
			items.sort(sortEq);

			tier = NTIP.GetTier(items[0]);
			bodyLoc = this.getBodyLoc(items[0]);

			if (tier > 0 && bodyLoc) {
				for (j = 0; j < bodyLoc.length; j += 1) {
					if (this.isShieldItem(items[0]) && !this.wantsShieldSlot()) {
						if (me.classid === 1) {
							this.rememberPendingShield(items[0]);
							print("ÿc2AutoEquipÿc0 :: skip equip shield — stash until orb/Spirit (sorc)");
						}

						break;
					}

					if (me.classid !== 3 && this.isAuricShield(items[0])) {
						print("ÿc8AutoEquipÿc0 :: skip paladin shield (auric)");
						break;
					}

					eqTier = this.getEquippedItem(bodyLoc[j]).tier;

					if (eqTier < 0) {
						eqTier = 0;
					}

					// Orb replacing 2H staff: same gate as autoEquipCheck (tier≥10, staff < 45)
					orbSwitch = me.classid === 1 && this.isOrbItem(items[0]) && this.hasTwoHandedEquipped() &&
						tier >= 10 && eqTier < 45;

					if ([3, 7].indexOf(items[0].location) > -1 && (tier > eqTier || orbSwitch) && this.getEquippedItem(bodyLoc[j]).classid !== 174) {
						if (!items[0].getFlag(0x10)) { // unid
							tome = me.findItem("ibk", 0, 3) || me.findItem(536, 0, 3);

							if (tome && tome.getStat(70) > 0) {
								if (items[0].location === 7) {
									Town.openStash();
								}

								Town.identifyItem(items[0], tome);
							}
						}

						gid = items[0].gid;

						print(items[0].name);

						if (this.equip(items[0], bodyLoc[j])) {
							if (items[0].itemType === 2 || items[0].itemType === 70) {
								this._pendingShield = null;
							}

							Misc.logItem("Equipped", me.getItem(-1, -1, gid));
						}

						break;
					}
				}
			}

			items.shift();
		}

		return true;
	},

	// --- Mercenary auto-equip (mirrors player AutoEquip; score-based upgrades) ---

	getMercItem: function (bodyLoc) {
		var merc = me.getMerc(),
			item, types, t,
			fallback = null;

		if (!merc) {
			return { classid: -1, gid: -1, score: -1, item: null };
		}

		// PD2 bodyloc can disagree with classic — also match by item type
		switch (bodyLoc) {
		case 1:
			types = [37, 71, 72, 75]; // helm / LoD barb / PD2 phlm / circlet
			break;
		case 3:
			types = [3]; // armor
			break;
		case 4:
			// Rogue: bows/xbows | Desert: spear/polearm/javelin
			types = [27, 35, 85, 33, 34, 44];
			break;
		case 5:
			types = [5, 6]; // arrows / bolts
			break;
		case 8:
			types = [19]; // belt
			break;
		case 9:
			types = [15]; // boots
			break;
		case 10:
			types = [16]; // gloves
			break;
		default:
			types = null;
			break;
		}

		item = merc.getItem();

		if (item) {
			do {
				if (item.bodylocation === bodyLoc) {
					return {
						classid: item.classid,
						gid: item.gid,
						score: this.mercScore(item),
						item: copyUnit(item)
					};
				}

				// Any item on the merc unit matching slot types (PD2 bodyloc may differ)
				if (types) {
					for (t = 0; t < types.length; t += 1) {
						if (item.itemType === types[t]) {
							fallback = {
								classid: item.classid,
								gid: item.gid,
								score: this.mercScore(item),
								item: copyUnit(item)
							};
						}
					}
				}
			} while (item.getNext());
		}

		// Fallback: scan player item list for merc-owned equipped gear
		if (!fallback) {
			item = me.getItem();

			if (item) {
				do {
					if (item.mode !== 1) {
						continue;
					}

					if (!this.itemOwnedByMerc(item, merc)) {
						continue;
					}

					if (item.bodylocation === bodyLoc) {
						return {
							classid: item.classid,
							gid: item.gid,
							score: this.mercScore(item),
							item: copyUnit(item)
						};
					}

					if (types) {
						for (t = 0; t < types.length; t += 1) {
							if (item.itemType === types[t]) {
								fallback = {
									classid: item.classid,
									gid: item.gid,
									score: this.mercScore(item),
									item: copyUnit(item)
								};
							}
						}
					}
				} while (item.getNext());
			}
		}

		if (fallback) {
			return fallback;
		}

		return { classid: -1, gid: -1, score: -1, item: null };
	},

	itemOwnedByMerc: function (item, merc) {
		var parent;

		if (!item || !merc) {
			return false;
		}

		try {
			parent = item.getParent();
		} catch (e) {
			parent = null;
		}

		return !!(parent && parent.gid === merc.gid);
	},

	mercHasItemGid: function (gid) {
		var merc = me.getMerc(),
			item, i;

		if (!merc || !gid) {
			return false;
		}

		// Fresh merc unit — stale getMerc() misses just-equipped gear on PD2
		for (i = 0; i < 3; i += 1) {
			merc = me.getMerc();

			if (!merc) {
				return false;
			}

			item = merc.getItem(-1, -1, gid);

			if (item) {
				return true;
			}

			item = merc.getItem();

			if (item) {
				do {
					if (item.gid === gid) {
						return true;
					}
				} while (item.getNext());
			}

			item = me.getItem(-1, -1, gid);

			// Must be merc-owned and NOT sitting in our inv/stash/cube/belt
			if (item && this.itemOwnedByMerc(item, merc) && [3, 5, 6, 7].indexOf(item.location) === -1) {
				return true;
			}

			delay(30 + Math.floor(me.ping / 2));
		}

		return false;
	},

	// Still in player bags (inv / belt / cube / stash)
	itemInOurBags: function (gid) {
		var item = me.getItem(-1, -1, gid);

		return !!(item && [3, 5, 6, 7].indexOf(item.location) > -1);
	},

	// Post-equip truth — requires POSITIVE evidence on the merc (never "bags empty" alone).
	mercEquipSuccess: function (gid, bodyLoc, expectClassid, expectType) {
		var i, cursor, mine, eq, merc, item;

		if (!gid) {
			return false;
		}

		for (i = 0; i < 12; i += 1) {
			cursor = getUnit(100);

			if (cursor && cursor.gid === gid) {
				delay(40 + me.ping);
				continue;
			}

			if (this.mercHasItemGid(gid)) {
				return true;
			}

			mine = me.getItem(-1, -1, gid);

			if (mine && [3, 5, 6, 7].indexOf(mine.location) > -1) {
				return false;
			}

			if (mine && this.itemOwnedByMerc(mine, me.getMerc())) {
				return true;
			}

			eq = bodyLoc ? this.getMercItem(bodyLoc) : null;

			if (eq && eq.gid === gid) {
				return true;
			}

			// Same classid newly on weapon slot only if our gid left bags (upgrade path)
			if (eq && eq.item && eq.gid > 0 && expectClassid && eq.classid === expectClassid &&
					!mine && !this.itemInOurBags(gid) && bodyLoc === 4) {
				return true;
			}

			merc = me.getMerc();

			if (merc) {
				item = merc.getItem();

				if (item) {
					do {
						if (item.gid === gid) {
							return true;
						}
					} while (item.getNext());
				}
			}

			delay(50 + me.ping);
		}

		return this.mercHasItemGid(gid);
	},

	// Mid-equip / pre-check — never claim success just because the unit vanished.
	mercReallyEquipped: function (gid, bodyLoc) {
		var mine, cursor, merc;

		if (!gid) {
			return false;
		}

		cursor = getUnit(100);

		if (cursor && cursor.gid === gid) {
			return false;
		}

		if (this.mercHasItemGid(gid)) {
			return true;
		}

		mine = me.getItem(-1, -1, gid);
		merc = me.getMerc();

		if (mine && [3, 5, 6, 7].indexOf(mine.location) > -1) {
			return false;
		}

		if (mine && merc && this.itemOwnedByMerc(mine, merc)) {
			if (!bodyLoc || mine.bodylocation === bodyLoc || mine.bodylocation > 0) {
				return true;
			}
		}

		return false;
	},

	mercEquipWhere: function (gid) {
		var cursor, mine, merc, ground;

		cursor = getUnit(100);

		if (cursor && cursor.gid === gid) {
			return "cursor";
		}

		if (this.mercHasItemGid(gid)) {
			return "merc";
		}

		mine = me.getItem(-1, -1, gid);
		merc = me.getMerc();

		if (mine && merc && this.itemOwnedByMerc(mine, merc)) {
			return "merc-owned(loc=" + mine.location + "/bl=" + mine.bodylocation + ")";
		}

		if (mine) {
			return "loc=" + mine.location + " mode=" + mine.mode + " bl=" + mine.bodylocation;
		}

		ground = getUnit(4);

		if (ground) {
			do {
				if (ground.mode === 3 && ground.gid === gid) {
					return "ground";
				}
			} while (ground.getNext());
		}

		return "gone";
	},

	// Base+mod weapon damage (1H + 2H bases — spears/polearms use 2hand*)
	mercWeaponDmg: function (item) {
		var min, max, ed, bmin, bmax;

		if (!item) {
			return 0;
		}

		min = item.getStat(21) || 0;
		max = item.getStat(22) || 0;

		if (typeof item.getStatEx === "function") {
			min = Math.max(min, item.getStatEx(21) || 0);
			max = Math.max(max, item.getStatEx(22) || 0);
		}

		if (min + max <= 0) {
			bmin = getBaseStat("items", item.classid, "mindam") || 0;
			bmax = getBaseStat("items", item.classid, "maxdam") || 0;

			if (bmin + bmax <= 0) {
				bmin = getBaseStat("items", item.classid, "2handmindam") || 0;
				bmax = getBaseStat("items", item.classid, "2handmaxdam") || 0;
			}

			min = bmin;
			max = bmax;
		}

		// Enhanced damage % is stat 18 (not 23)
		ed = item.getStat(18) || 0;

		if (typeof item.getStatEx === "function") {
			ed = Math.max(ed, item.getStatEx(18) || 0);
		}

		if (ed > 0 && (min || max)) {
			min = Math.floor(min * (100 + ed) / 100);
			max = Math.floor(max * (100 + ed) / 100);
		}

		return min + max;
	},

	// ED% alone (for armor/gloves with +%dmg that don't have weapon bases)
	mercEdPct: function (item) {
		var ed;

		if (!item) {
			return 0;
		}

		ed = item.getStat(18) || 0;

		if (typeof item.getStatEx === "function") {
			ed = Math.max(ed, item.getStatEx(18) || 0);
		}

		return ed;
	},

	// Desert mercs under-report STR/DEX sometimes — floor by level so heavy armor can pass
	mercAttr: function (merc, which) {
		var raw, lvl, floor;

		if (!merc) {
			merc = me.getMerc();
		}

		if (!merc) {
			return 0;
		}

		raw = merc.getStat(which) || 0;
		lvl = merc.getStat(12) || me.charlvl || 1;

		if (!this.isDesertMerc(merc)) {
			return raw;
		}

		// Act2 desert: high STR growth; modest DEX for spears
		if (which === 0) {
			floor = 75 + Math.floor(lvl * 2.0);
		} else if (which === 2) {
			floor = 40 + Math.floor(lvl * 1.2);
		} else {
			return raw;
		}

		return Math.max(raw, floor);
	},

	// Higher = better. Act2 desert: IAS / ED / melee first. Rogue: bow dmg + IAS.
	mercScore: function (item) {
		var q, def, dmg, res, ias, ed, ar, str, life, cb, ds, ow, sock, qty, maxStack,
			desert, weapon, armorish, med;

		if (!item) {
			return -1;
		}

		// Ammo: any quiver beats empty; fuller stacks score higher
		if (item.itemType === 5 || item.itemType === 6) {
			qty = item.getStat(70) || 0;
			maxStack = getBaseStat("items", item.classid, "maxstack") || 250;

			return 500000 + Math.floor(qty * 1000 / maxStack);
		}

		q = item.quality || 0;
		def = item.getStat(31) || 0;

		if (!def && (item.itemType === 3 || item.itemType === 37 || item.itemType === 71 ||
				item.itemType === 72 || item.itemType === 75)) {
			def = getBaseStat("items", item.classid, "minac") || 0;
		}

		dmg = this.mercWeaponDmg(item);
		ed = this.mercEdPct(item);
		ias = item.getStat(93) || 0;
		ar = item.getStat(19) || 0;
		str = item.getStat(0) || 0;
		life = item.getStat(7) || 0;
		cb = item.getStat(136) || 0; // crushing blow
		ds = item.getStat(141) || 0; // deadly strike
		ow = item.getStat(135) || 0; // open wounds
		sock = item.getStat(194) || 0;
		res = (item.getStat(39) || 0) + (item.getStat(41) || 0) + (item.getStat(43) || 0) + (item.getStat(45) || 0);
		desert = this.isDesertMerc();
		weapon = [27, 33, 34, 35, 85].indexOf(item.itemType) > -1;
		armorish = [3, 37, 71, 75].indexOf(item.itemType) > -1;

		// Insight / Meditation aura — floor so merc always prefers it over random spears
		med = item.getStat(151, 120) || 0;

		if (med > 0 && weapon) {
			return 400000 + med * 2000 + dmg * 100 + ias * 50 + ed * 40;
		}

		if (desert) {
			// Melee merc: IAS + ED + raw dmg dominate; heavy armor AC next; resists secondary
			// Quality is a tie-break only — never let a blue with low AC beat high-def whites
			return (armorish ? def * 25 + ed * 80 : 0)
				+ (weapon ? dmg * 280 + ed * 450 + ias * 400 + ar * 3 + cb * 90 + ds * 90 + ow * 45 : 0)
				+ (!weapon && !armorish ? def * 6 + ias * 80 : 0)
				+ str * 60
				+ life * 8
				+ res * 35
				+ sock * 50
				+ q * 800;
		}

		// Rogue / other: bow dmg + IAS first; armor by defense — quality is minor
		if (weapon) {
			return dmg * 250 + ias * 80 + ar * 2 + ed * 60 + sock * 25 + q * 1500;
		}

		if (armorish) {
			return def * 30 + ed * 40 + res * 50 + life * 10 + sock * 25 + q * 800;
		}

		// boots / gloves / belt
		return res * 60 + ias * 40 + life * 15 + def * 5 + q * 500;
	},

	canMercEquip: function (item) {
		var merc = me.getMerc(),
			lvlReq, strReq, dexReq, baseLvl, baseStr, baseDex, mercStr, mercDex;

		if (!merc || !item || item.type !== 4) {
			return false;
		}

		if (!item.getFlag(0x10) && item.quality > 2) {
			return false;
		}

		// Level req: item.lvlreq / stat 92 / base item (whites often have getStat(92) === 0)
		baseLvl = getBaseStat("items", item.classid, "levelreq") || 0;
		lvlReq = Math.max(item.getStat(92) || 0, item.lvlreq || 0, baseLvl || 0);

		if (lvlReq > (merc.getStat(12) || 0)) {
			return false;
		}

		baseStr = getBaseStat("items", item.classid, "reqstr") || 0;
		baseDex = getBaseStat("items", item.classid, "reqdex") || 0;
		strReq = Math.max(item.strreq || 0, baseStr);
		dexReq = Math.max(item.dexreq || 0, baseDex);
		mercStr = this.mercAttr(merc, 0);
		mercDex = this.mercAttr(merc, 2);

		if (strReq > mercStr || dexReq > mercDex) {
			return false;
		}

		return true;
	},

	isRogueMerc: function (merc) {
		var wep, item;

		if (!merc) {
			merc = me.getMerc();
		}

		if (!merc) {
			return false;
		}

		// Classic Act1 rogue
		if (merc.classid === 271) {
			return true;
		}

		// Never treat Act2 desert as rogue (even with leftover bows)
		if (merc.classid === 338) {
			return false;
		}

		// Scan merc gear directly — never call getMercItem (that → mercScore → here = recursion)
		wep = null;
		item = merc.getItem();

		if (item) {
			do {
				if (item.bodylocation === 4 || [27, 35, 85].indexOf(item.itemType) > -1) {
					if (item.bodylocation === 4 || !wep) {
						wep = item;
					}

					if (item.bodylocation === 4) {
						break;
					}
				}
			} while (item.getNext());
		}

		if (wep && [27, 35, 85].indexOf(wep.itemType) > -1) {
			return true;
		}

		// Not Act2 desert / Act3 iron / Act5 barb → treat as rogue (PD2 classids vary)
		if ([338, 359, 561, 562, 563, 564, 565].indexOf(merc.classid) === -1 && me.act === 1) {
			return true;
		}

		return false;
	},

	// Act2 Desert Mercenary (Greiz) — spears / polearms / javelins only
	isDesertMerc: function (merc) {
		var wep, item;

		if (!merc) {
			merc = me.getMerc();
		}

		if (!merc) {
			return false;
		}

		if (merc.classid === 338) {
			return true;
		}

		// Scan merc gear directly — never call getMercItem (that → mercScore → here = recursion)
		wep = null;
		item = merc.getItem();

		if (item) {
			do {
				if (item.bodylocation === 4 || [33, 34, 44].indexOf(item.itemType) > -1) {
					if (item.bodylocation === 4 || !wep) {
						wep = item;
					}

					if (item.bodylocation === 4) {
						break;
					}
				}
			} while (item.getNext());
		}

		if (wep && [33, 34, 44].indexOf(wep.itemType) > -1 &&
				[271, 359, 561, 562, 563, 564, 565].indexOf(merc.classid) === -1) {
			return true;
		}

		return false;
	},

	// True only if cand is clearly better — stops bow↔bow / bow↔xbow flip-flop
	mercIsUpgrade: function (cand, eq, bodyLoc) {
		var cs, es, et, cdef, edef, cres, eres, cdmg, edmg, cias, eias;

		if (!cand || !this.canMercEquip(cand)) {
			return false;
		}

		cs = this.mercScore(cand);
		es = eq ? eq.score : -1;

		if (es < 0 || !eq || !eq.item) {
			return true; // empty slot
		}

		if (cs <= es) {
			return false;
		}

		// Armor / helm: never "upgrade" into lower defense just because magic quality scores higher
		if (bodyLoc === 1 || bodyLoc === 3) {
			cdef = cand.getStat(31) || 0;
			edef = eq.item.getStat(31) || 0;
			cres = (cand.getStat(39) || 0) + (cand.getStat(41) || 0) + (cand.getStat(43) || 0) + (cand.getStat(45) || 0);
			eres = (eq.item.getStat(39) || 0) + (eq.item.getStat(41) || 0) + (eq.item.getStat(43) || 0) + (eq.item.getStat(45) || 0);

			if (cdef < edef * 0.9 && cres < eres + 20 && (cand.getStat(7) || 0) <= (eq.item.getStat(7) || 0) + 15) {
				return false;
			}
		}

		// Weapon: raw dmg must not regress unless IAS/ED clearly win
		if (bodyLoc === 4) {
			cdmg = this.mercWeaponDmg(cand);
			edmg = this.mercWeaponDmg(eq.item);
			cias = cand.getStat(93) || 0;
			eias = eq.item.getStat(93) || 0;

			if (cdmg < edmg * 0.92 && cias <= eias + 5 && this.mercEdPct(cand) <= this.mercEdPct(eq.item) + 10) {
				return false;
			}
		}

		// Boots / gloves / belt: empty slot always OK; otherwise small score gap is enough
		if (bodyLoc === 8 || bodyLoc === 9 || bodyLoc === 10) {
			if ((cs - es) < 400) {
				return false;
			}

			return true;
		}

		// Need a real gap (quality jump or meaningful dmg), not noise
		if ((cs - es) < 800 && cs < es * 1.05) {
			return false;
		}

		// Switching bow ↔ crossbow needs a bigger win (ammo strip cost)
		if (bodyLoc === 4 && eq.item) {
			et = eq.item.itemType;

			if ([27, 35, 85].indexOf(et) > -1 && cand.itemType !== et &&
					!((et === 27 || et === 85) && (cand.itemType === 27 || cand.itemType === 85))) {
				if (cs < es * 1.25 && (cs - es) < 5000) {
					return false;
				}
			}
		}

		return true;
	},

	hasDefianceMerc: function () {
		return this.mercAuraId() === 104;
	},

	// Act2 aura skill id (104 Defiance, 99 Prayer, 108 Blessed Aim, 114 HF, 98 Might, 103 Thorns)
	mercAuraId: function (merc) {
		var aura, i,
			ids = [104, 99, 108, 114, 98, 103];

		if (!merc) {
			merc = me.getMerc();
		}

		if (!merc || merc.classid !== 338) {
			return 0;
		}

		// Preferred: ModifierListSkill (stat 96) — SoloPlay / modern d2bs
		try {
			aura = merc.getStat(96) || 0;

			if (ids.indexOf(aura) > -1) {
				return aura;
			}
		} catch (e96) {}

		for (i = 0; i < ids.length; i += 1) {
			if (merc.getSkill(ids[i], 1) || merc.getSkill(ids[i], 0)) {
				return ids[i];
			}
		}

		return 0;
	},

	mercAuraName: function (merc) {
		switch (this.mercAuraId(merc)) {
		case 104:
			return "Defiance";
		case 99:
			return "Prayer";
		case 108:
			return "Blessed Aim";
		case 114:
			return "Holy Freeze";
		case 98:
			return "Might";
		case 103:
			return "Thorns";
		default:
			return "none";
		}
	},

	// Bow → arrows (5); crossbow → bolts (6). Wrong ammo / no wep → false.
	mercAmmoMatchesWeapon: function (ammoType, merc) {
		var wep;

		if (!merc) {
			merc = me.getMerc();
		}

		if (!merc || !this.isRogueMerc(merc) || (ammoType !== 5 && ammoType !== 6)) {
			return false;
		}

		wep = this.getMercItem(4).item;

		if (!wep) {
			return false;
		}

		if (ammoType === 5) {
			return [27, 85].indexOf(wep.itemType) > -1; // arrows for bows only
		}

		return wep.itemType === 35; // bolts for crossbow only
	},

	// Pick ammo only when it matches merc weapon and beats equipped quiver
	mercNeedsAmmo: function (item) {
		var eq;

		if (!Config.UseMerc || !Config.AutoEquipMerc || !item) {
			return false;
		}

		if (item.itemType !== 5 && item.itemType !== 6) {
			return false;
		}

		if (this.mercFailSkip(item.gid)) {
			return false;
		}

		if (!this.mercAmmoMatchesWeapon(item.itemType)) {
			return false;
		}

		eq = this.getMercItem(5);

		return this.mercScore(item) > eq.score + 100; // tiny hysteresis for ammo stacks
	},

	// Returns bodylocation array for merc, or false if unusable.
	getMercBodyLoc: function (item) {
		var merc = me.getMerc(),
			rogue, barbMerc;

		if (!merc || !item) {
			return false;
		}

		rogue = this.isRogueMerc(merc);
		// Act 5 barb mercs — only they can wear barb helms (itemType 71)
		barbMerc = (merc.classid === 561 || merc.classid === 562 || merc.classid === 563
			|| merc.classid === 564 || merc.classid === 565 || merc.classid === 359);

		switch (item.itemType) {
		case 71: // LoD barb helm OR PD2 auric — only Act5 can use as helm; auric blocked elsewhere
			return barbMerc ? [1] : false;
		case 72: // PD2 primal/barb helm (phlm)
			return barbMerc ? [1] : false;
		case 37: // Helm
		case 75: // Circlet
			return [1];
		case 3: // Armor
			return [3];
		case 15: // Boots (PD2)
			return [9];
		case 16: // Gloves (PD2)
			return [10];
		case 19: // Belt (PD2)
			return [8];
		case 5: // Arrows
		case 6: // Bolts
			return this.mercAmmoMatchesWeapon(item.itemType, merc) ? [5] : false;
		case 27: // Bow
		case 35: // Crossbow
		case 85: // Amazon bow
			return rogue ? [4] : false;
		case 33: // Spear (incl. pikes)
		case 34: // Polearm
			// Act2 desert merc only — Insight / polearms (not javelins/glaives)
			return this.isDesertMerc(merc) ? [4] : false;
		case 44: // Javelin (Glaive etc.) — never for merc (junk vs spear/polearm)
		case 88: // Amazon javelin
			return false;
		default:
			return false;
		}
	},

	// Arrows block crossbow (and bolts block bow) — must strip before weapon swap
	mercAmmoConflictsWeapon: function (weaponType) {
		var ammo = this.getMercItem(5);

		if (!ammo.item) {
			return false;
		}

		if (weaponType === 35) {
			return ammo.item.itemType === 5; // crossbow vs arrows
		}

		if (weaponType === 27 || weaponType === 85) {
			return ammo.item.itemType === 6; // bow vs bolts
		}

		return false;
	},

	// After Act1→Act2 swap, bows/arrows must come off before spears / PD2 armor slots work
	stripWrongDesertWeapons: function () {
		var merc = me.getMerc(),
			item, gids = [], i;

		if (!merc || !this.isDesertMerc(merc)) {
			return;
		}

		item = merc.getItem();

		if (item) {
			do {
				if ([27, 35, 85, 5, 6].indexOf(item.itemType) > -1) {
					gids.push(item.gid);
				}
			} while (item.getNext());
		}

		for (i = 0; i < gids.length; i += 1) {
			item = merc.getItem(-1, -1, gids[i]) || me.getItem(-1, -1, gids[i]);

			if (!item) {
				continue;
			}

			print("ÿc8MercEquipÿc0 :: stripping rogue gear off desert merc: " + (item.name || item.classid));
			this.unequipMercSlot(item.bodylocation || 4, false);
		}
	},

	// Pull gear off merc bodyloc onto cursor, then park or drop
	unequipMercSlot: function (bodyLoc, discard) {
		var merc, eq, item, gid, i, cur, slots, s;

		eq = this.getMercItem(bodyLoc);

		if (!eq.item || eq.gid < 0) {
			return true;
		}

		gid = eq.gid;
		merc = me.getMerc();

		if (me.itemoncursor) {
			this.parkCursorItem();
		}

		this.closeMercEquipUI();
		this.openMercInventory();
		delay(150 + me.ping);

		item = null;

		if (merc) {
			item = merc.getItem(-1, -1, gid);
		}

		if (!item) {
			item = me.getItem(-1, -1, gid);
		}

		slots = [bodyLoc, this.mercPacketSlot(bodyLoc)];

		for (i = 0; i < 3 && !me.itemoncursor; i += 1) {
			// Empty cursor + merc action = take item off (LoD slots)
			if ([1, 3, 4, 5].indexOf(bodyLoc) > -1) {
				clickItem(4, bodyLoc);
				delay(me.ping + 300);
			}

			if (!me.itemoncursor) {
				for (s = 0; s < slots.length; s += 1) {
					if (slots[s] > 0) {
						sendPacket(1, 0x61, 2, slots[s]);
						delay(me.ping + 250);

						if (me.itemoncursor) {
							break;
						}
					}
				}
			}

			if (!me.itemoncursor && item) {
				try {
					clickItem(0, item);
				} catch (eClick) {}

				delay(me.ping + 250);
			}

			if (!me.itemoncursor && item) {
				Misc.click(0, 0, item);
				delay(me.ping + 250);
			}
		}

		if (me.itemoncursor) {
			cur = getUnit(100);

			if (discard && cur) {
				try {
					cur.drop();
				} catch (eDrop) {
					this.parkCursorItem();
				}
			} else {
				this.parkCursorItem();
			}
		}

		delay(100 + me.ping);

		return !this.mercHasItemGid(gid);
	},

	stripMercAmmoIfConflicts: function (weaponType) {
		if (!this.mercAmmoConflictsWeapon(weaponType)) {
			return true;
		}

		print("ÿc8MercEquipÿc0 :: stripping ammo before weapon swap");

		return this.unequipMercSlot(5, true);
	},

	// Inv leftovers for merc slots (ignore fail-cache — sell after failed equip)
	isMercInvLeftover: function (item) {
		if (!item || !Config.UseMerc || !Config.AutoEquipMerc) {
			return false;
		}

		if (Item.autoEquipCheck(item)) {
			return false; // player AutoEquip wants it
		}

		// Merc upgrade still needed — keep in inv for autoEquipMerc (never sell bait)
		if (typeof this.autoEquipMercCheck === "function" && this.autoEquipMercCheck(item)) {
			return false;
		}

		if (item.itemType === 5 || item.itemType === 6) {
			return item.quality !== 6 && item.quality !== 7;
		}

		// Sorc never wears bows/xbows — sell if merc doesn't need as upgrade
		if ([27, 35, 85].indexOf(item.itemType) > -1) {
			return true;
		}

		// Merc-slot type that is not an upgrade (worse than equipped / can't wear) → sell
		if (this.getMercBodyLoc(item)) {
			return true;
		}

		return false;
	},

	equipMerc: function (item, bodyLoc) {
		var merc, cursorItem, i, gid, onCursor, tick, wantType, name;

		merc = me.getMerc();

		if (!merc || !item || item.type !== 4) {
			return false;
		}

		if (item.itemType !== 5 && item.itemType !== 6 && !this.canMercEquip(item)) {
			return false;
		}

		gid = item.gid;
		wantType = item.itemType;
		name = item.name || ("#" + item.classid);

		if (this.mercReallyEquipped(gid, bodyLoc)) {
			return true;
		}

		// NPC talk/shop blocks merc paperdoll — cancel hard
		this.closeMercEquipUI();

		// Desert merc: never leave Act1 bows/quiver on when putting spear/armor/PD2 slots
		if (this.isDesertMerc(merc) && bodyLoc === 4 && [33, 34, 44].indexOf(wantType) > -1) {
			this.stripWrongDesertWeapons();
		}

		// Crossbow cannot go on while arrows are equipped (and bow vs bolts)
		if (bodyLoc === 4 && [27, 35, 85].indexOf(wantType) > -1) {
			this.stripMercAmmoIfConflicts(wantType);
		}

		// Always open inventory + click merc (no stash walk — equip at vendor)
		this.openMercInventory();
		delay(150 + me.ping);

		for (i = 0; i < 2; i += 1) {
			item = me.getItem(-1, -1, gid);

			if (!item) {
				cursorItem = getUnit(100);

				if (cursorItem && cursorItem.gid === gid) {
					item = cursorItem;
				} else if (this.mercReallyEquipped(gid, bodyLoc)) {
					this.closeMercEquipUI();
					return true;
				} else {
					this.closeMercEquipUI();
					return false;
				}
			}

			onCursor = false;

			if (typeof Packet !== "undefined" && typeof Packet.itemToCursor === "function") {
				onCursor = Packet.itemToCursor(item);
			}

			if (!onCursor) {
				onCursor = item.toCursor();
			}

			if (!onCursor) {
				delay(100);
				continue;
			}

			delay(me.ping + 150);

			// Classic LoD slots: clickItem(4) → MercItemAction. Weapon bodyLoc 4 is player-style;
			// merc RH packet index is 2 — try both so spears aren't stuck on a dead click.
			if (me.itemoncursor) {
				if ([1, 3, 4].indexOf(bodyLoc) > -1) {
					clickItem(4, bodyLoc);
					delay(me.ping + 400);

					if (this.mercEquipOk(gid, bodyLoc, wantType)) {
						if (this.finishMercEquip(gid, bodyLoc)) {
							this.closeMercEquipUI();
							return true;
						}
					}
				}

				// Desert/rogue weapon: also click merc RH (packet slot 2) if still on cursor
				if (bodyLoc === 4 && me.itemoncursor && getUnit(100) && getUnit(100).gid === gid) {
					clickItem(4, 2);
					delay(me.ping + 400);

					if (this.mercEquipOk(gid, bodyLoc, wantType)) {
						if (this.finishMercEquip(gid, bodyLoc)) {
							this.closeMercEquipUI();
							return true;
						}
					}
				}
			}

			// Packet MercItemAction (PD2 extras + classic fallback) — includes slot 2 for weapons
			if (me.itemoncursor) {
				this.tryMercItemAction(gid, bodyLoc, wantType);
			}

			if (this.mercEquipOk(gid, bodyLoc, wantType)) {
				if (this.finishMercEquip(gid, bodyLoc)) {
					this.closeMercEquipUI();
					return true;
				}
			}

			// ItemToBody fallback (BNETDocs merc encoding 0x61 | slot<<8)
			if (me.itemoncursor) {
				this.tryMercItemToBody(gid, bodyLoc);
			}

			tick = getTickCount();

			while (getTickCount() - tick < 1500) {
				if (this.mercEquipOk(gid, bodyLoc, wantType)) {
					if (this.finishMercEquip(gid, bodyLoc)) {
						this.closeMercEquipUI();
						return true;
					}

					break;
				}

				delay(50);
			}

			if (me.itemoncursor) {
				cursorItem = getUnit(100);

				// Don't pull the newly equipped piece back into inventory / don't cancel (PD2 drop)
				if (cursorItem && cursorItem.gid === gid && this.mercEquipSuccess(gid, bodyLoc)) {
					print("ÿc8MercEquipÿc0 :: post-equip stale cursor — park, no cancel");
					this.parkCursorItem();
				} else {
					this.parkCursorItem();
				}
			}

			break;
		}

		// Park any leftover cursor BEFORE closeUI (closeUI must not cancel with cursor)
		if (me.itemoncursor) {
			this.parkCursorItem();
		}

		this.closeMercEquipUI();

		if (this.mercEquipSuccess(gid, bodyLoc)) {
			return true;
		}

		// Failed equip often left the spear on the ground (parkCursorItem click-on-char)
		this.recoverMercItemFromGround(gid);

		return false;
	},

	mercEquipOk: function (gid, bodyLoc, wantType) {
		return this.mercEquipSuccess(gid, bodyLoc);
	},

	// Pick up a merc candidate that was dropped during a failed park/equip
	recoverMercItemFromGround: function (gid) {
		var item, found, tick;

		if (!gid || !me.inTown) {
			return false;
		}

		found = null;
		item = getUnit(4, -1, -1, gid);

		if (item && item.mode === 3 && item.gid === gid) {
			found = copyUnit(item);
		} else {
			item = getUnit(4);

			if (item) {
				do {
					if (item.mode === 3 && item.gid === gid) {
						found = copyUnit(item);
						break;
					}
				} while (item.getNext());
			}
		}

		if (!found) {
			return false;
		}

		item = found;
		print("ÿc8MercEquipÿc0 :: recovering dropped item gid=" + gid + " from ground");

		tick = getTickCount();

		while (getTickCount() - tick < 3000) {
			if (getDistance(me, item) > 4) {
				Pather.moveToUnit(item);
			}

			Misc.click(0, 0, item);
			delay(me.ping + 200);

			if (this.itemInOurBags(gid) || me.getItem(-1, -1, gid)) {
				return true;
			}

			if (me.itemoncursor) {
				this.parkCursorItem();

				if (this.itemInOurBags(gid)) {
					return true;
				}
			}

			item = getUnit(4, -1, -1, gid);

			if (!item || item.mode !== 3) {
				return this.itemInOurBags(gid);
			}

			delay(100);
		}

		return this.itemInOurBags(gid);
	},

	// On real success: park swapped-off gear only (different gid).
	// Never MoveTo the item we just put on the merc (stale cursor.gid === gid was unequipping it).
	finishMercEquip: function (gid, bodyLoc) {
		var cursor, tick;

		tick = getTickCount();

		while (getTickCount() - tick < 800) {
			if (this.mercEquipSuccess(gid, bodyLoc)) {
				break;
			}

			delay(40 + me.ping);
		}

		cursor = getUnit(100);

		if (cursor && cursor.gid === gid) {
			// Still holding the candidate — equip did not take
			if (this.itemInOurBags(gid) || !this.mercEquipSuccess(gid, bodyLoc)) {
				this.parkCursorItem();

				return false;
			}

			// Stale cursor after successful equip — do NOT cancel (drops on PD2)
			print("ÿc8MercEquipÿc0 :: stale cursor gid=equipped — park instead of cancel");
			this.parkCursorItem();
		}

		if (!this.mercEquipSuccess(gid, bodyLoc)) {
			return false;
		}

		if (me.itemoncursor) {
			cursor = getUnit(100);

			// Only park OLD gear (different gid) — never cancel
			if (cursor && cursor.gid !== gid) {
				this.parkCursorItem();
			} else if (cursor && cursor.gid === gid) {
				this.parkCursorItem();
			}
		}

		// Success = on merc; cursor park is best-effort (don't fail equip if inv full)
		return this.mercEquipSuccess(gid, bodyLoc);
	},

	// Park whatever ended up on cursor after a merc swap (old gear).
	// Item is ALREADY on cursor — never toCursor/MoveTo (5×1s hang) and never me.cancel (PD2 drops).
	parkCursorItem: function () {
		var cursorItem, kind, mercGear, spot, i, tick, placed;

		if (!me.itemoncursor) {
			return true;
		}

		cursorItem = getUnit(100);

		if (!cursorItem) {
			return !me.itemoncursor;
		}

		kind = (typeof Town !== "undefined" && Town.potionKind) ? Town.potionKind(cursorItem) : false;

		if (kind) {
			if (typeof Town !== "undefined" && typeof Town.returnCursorSafe === "function") {
				return Town.returnCursorSafe();
			}

			return !me.itemoncursor;
		}

		mercGear = [5, 6, 27, 35, 85, 33, 34, 44, 24, 25, 26, 30, 31, 32].indexOf(cursorItem.itemType) > -1;

		function tryPlace(container, loc) {
			var p, n, t;

			if (!container || typeof container.FindSpot !== "function") {
				return false;
			}

			if (typeof container.CanFit === "function" && !container.CanFit(cursorItem)) {
				return false;
			}

			p = container.FindSpot(cursorItem);

			if (!p) {
				return false;
			}

			for (n = 0; n < 3 && me.itemoncursor; n += 1) {
				clickItem(0, p.y, p.x, loc);
				t = getTickCount();

				while (me.itemoncursor && getTickCount() - t < 600) {
					delay(30 + me.ping);
				}

				if (!me.itemoncursor) {
					print("ÿc2MercEquipÿc0 :: parked swap @ " + (loc === 3 ? "inv" : "stash") +
						" " + (cursorItem.name || ("#" + cursorItem.classid)));

					return true;
				}
			}

			return false;
		}

		// Inv first — open inventory panel here if needed (no stash walk)
		if (!getUIFlag(0x01) && !getUIFlag(0x19)) {
			this.ensureInventoryPanel();
			delay(150 + me.ping);
		}

		placed = tryPlace(Storage.Inventory, 3);

		if (!placed && me.itemoncursor) {
			this.ensureInventoryPanel();
			delay(120 + me.ping);
			cursorItem = getUnit(100);

			if (cursorItem && me.itemoncursor) {
				placed = tryPlace(Storage.Inventory, 3);
			}
		}

		if (!placed && me.itemoncursor) {
			cursorItem = getUnit(100);

			// Stash only as last resort when inv cannot fit the swapped weapon
			if (cursorItem && typeof Town !== "undefined" && typeof Town.openStash === "function") {
				Town.openStash();
				delay(80 + me.ping);
				placed = tryPlace(Storage.Stash, 7);
			}
		}

		if (!me.itemoncursor) {
			return true;
		}

		// Last resort for merc weapons: NEVER cancel/drop — leave on cursor and report
		if (mercGear) {
			print("ÿc8MercEquipÿc0 :: parkCursor stuck with " +
				(cursorItem.name || ("#" + cursorItem.classid)) + " — not canceling (would drop)");

			return false;
		}

		print("ÿc8MercEquipÿc0 :: parkCursor stuck (non-merc) — not dropping");

		return false;
	},

	// Same path as D2CLIENT_MercItemAction(0x61, slot) — clickItem(4) only allows 1/3/4.
	tryMercItemAction: function (gid, bodyLoc, wantType) {
		var slots = [], seen = {}, i, s, pkt;

		function add(n) {
			if (n > 0 && !seen[n]) {
				seen[n] = true;
				slots.push(n);
			}
		}

		// Player-style bodylocs (what clickItem passes for helm/armor/wep)
		add(bodyLoc);
		// BNETDocs merc indices (1 helm, 2 RH, 3 armor, 4 LH) + PD2 extras as 5/6/7
		add(this.mercPacketSlot(bodyLoc));

		if ([5, 8, 9, 10].indexOf(bodyLoc) > -1) {
			add(5);
			add(6);
			add(7);
			add(8);
			add(9);
			add(10);
		}

		for (i = 0; i < slots.length; i += 1) {
			if (!me.itemoncursor || !getUnit(100) || getUnit(100).gid !== gid) {
				return this.mercEquipOk(gid, bodyLoc, wantType);
			}

			s = slots[i];

			// Potion-to-merc / merc-item uses WORD arg (blizzhackers: sendPacket(1, 0x61, 2, 0))
			for (pkt = 0; pkt < 2; pkt += 1) {
				if (!me.itemoncursor || getUnit(100).gid !== gid) {
					return this.mercEquipOk(gid, bodyLoc, wantType);
				}

				if (pkt === 0) {
					sendPacket(1, 0x61, 2, s);
				} else {
					sendPacket(1, 0x61, 1, s);
				}

				delay(me.ping + 250);

				if (this.mercEquipOk(gid, bodyLoc, wantType)) {
					return true;
				}
			}
		}

		return false;
	},

	// ItemToBody (0x1A) with merc-encoded body loc — backup when 0x61 action fails
	tryMercItemToBody: function (gid, bodyLoc) {
		var slots = [], seen = {}, i, s, encoded, variants, v;

		function add(n) {
			if (n > 0 && !seen[n]) {
				seen[n] = true;
				slots.push(n);
			}
		}

		add(this.mercPacketSlot(bodyLoc));
		add(bodyLoc);

		if ([5, 8, 9, 10].indexOf(bodyLoc) > -1) {
			add(5);
			add(6);
			add(7);
			add(8);
			add(9);
			add(10);
		}

		for (i = 0; i < slots.length; i += 1) {
			if (!me.itemoncursor || !getUnit(100) || getUnit(100).gid !== gid) {
				return this.mercReallyEquipped(gid, bodyLoc);
			}

			s = slots[i];
			variants = [
				0x61 | (s << 8),
				s
			];

			for (v = 0; v < variants.length; v += 1) {
				if (!me.itemoncursor || getUnit(100).gid !== gid) {
					return this.mercReallyEquipped(gid, bodyLoc);
				}

				encoded = variants[v];
				sendPacket(1, 0x1A, 4, gid, 4, encoded);
				delay(me.ping + 200);

				if (this.mercReallyEquipped(gid, bodyLoc)) {
					return true;
				}
			}
		}

		return false;
	},

	mercPacketSlot: function (bodyLoc) {
		switch (bodyLoc) {
		case 1:
			return 1;
		case 3:
			return 3;
		case 4:
			return 2;
		case 5:
			return 4;
		case 8:
			return 5;
		case 9:
			return 6;
		case 10:
			return 7;
		default:
			return 0;
		}
	},

	// This d2bs often has no sendKey — try native, then ForceKeys helper tap, never cancel-drop.
	tapKey: function (vk) {
		var donePath, tick, raw;

		if (typeof sendKey === "function") {
			sendKey(vk);
			return true;
		}

		if (typeof keyDown === "function" && typeof keyUp === "function") {
			keyDown(vk);
			delay(30);
			keyUp(vk);
			return true;
		}

		if (typeof KeyDown === "function" && typeof KeyUp === "function") {
			KeyDown(vk);
			delay(30);
			KeyUp(vk);
			return true;
		}

		// ForceKeys helper: write data/pd2_forcekeys.key → helper SendInput/PostMessage
		if (typeof FileTools === "undefined") {
			return false;
		}

		try {
			donePath = "data/pd2_forcekeys.key.done";

			if (FileTools.exists(donePath)) {
				FileTools.writeText(donePath, "");
			}

			FileTools.writeText("data/pd2_forcekeys.key", String(vk & 0xff));
		} catch (eWrite) {
			return false;
		}

		tick = getTickCount();

		while (getTickCount() - tick < 1500) {
			delay(40);

			try {
				if (FileTools.exists(donePath)) {
					raw = String(FileTools.readText(donePath) || "");

					if (raw.indexOf("OK") >= 0) {
						return true;
					}
				}
			} catch (eRead) {}
		}

		return false;
	},

	ensureInventoryPanel: function () {
		var tick;

		if (getUIFlag(0x01) || getUIFlag(0x19)) {
			return true;
		}

		if (this.tapKey(0x49)) { // I
			tick = getTickCount();

			while (getTickCount() - tick < 1500) {
				if (getUIFlag(0x01) || getUIFlag(0x19)) {
					return true;
				}

				delay(40);
			}

			this.tapKey(0x49);
			delay(200 + me.ping);

			if (getUIFlag(0x01) || getUIFlag(0x19)) {
				return true;
			}
		}

		// openStash() used to me.cancel() — drops cursor items on PD2.
		// Only walk to stash when hands are empty.
		if (me.itemoncursor) {
			print("ÿc8MercEquipÿc0 :: cannot open inv (no sendKey, item on cursor) — not opening stash");
			return false;
		}

		if (typeof Town !== "undefined" && typeof Town.openStash === "function") {
			return !!Town.openStash();
		}

		return !!(getUIFlag(0x01) || getUIFlag(0x19));
	},

	openMercInventory: function () {
		var merc = me.getMerc(), i;

		// Leave vendor/NPC only — never cancel while holding an item
		for (i = 0; i < 5; i += 1) {
			if (!(getUIFlag(0x08) || getUIFlag(0x0c) || getUIFlag(0x0f))) {
				break;
			}

			if (me.itemoncursor) {
				break;
			}

			me.cancel();
			delay(80 + me.ping);
		}

		this.ensureInventoryPanel();

		merc = me.getMerc();

		if (merc) {
			Misc.click(0, 0, merc);
			delay(250 + me.ping);
		}

		return !!(merc || getUIFlag(0x01) || getUIFlag(0x19));
	},

	closeMercEquipUI: function () {
		var i,
			flags = [0x01, 0x02, 0x04, 0x08, 0x0c, 0x0f, 0x14, 0x16, 0x19, 0x1a];

		// PD2: me.cancel() with item on cursor DROPS it (old bow after xbow swap)
		for (i = 0; i < 3 && me.itemoncursor; i += 1) {
			this.parkCursorItem();
			delay(50 + me.ping);
		}

		if (me.itemoncursor) {
			print("ÿc8MercEquipÿc0 :: closeUI aborted — cursor still held (skip cancel to avoid drop)");

			return false;
		}

		for (i = 0; i < flags.length; i += 1) {
			if (getUIFlag(flags[i])) {
				me.cancel();
				delay(150 + me.ping);

				if (me.itemoncursor) {
					this.parkCursorItem();

					if (me.itemoncursor) {
						print("ÿc8MercEquipÿc0 :: closeUI — cursor reappeared, stop canceling");

						return false;
					}
				}
			}
		}

		if (!me.itemoncursor) {
			me.cancel();
			delay(100 + me.ping);
		}

		return !me.itemoncursor;
	},

	_mercFailGids: {},
	_mercFailExpire: 3 * 60 * 1000, // don't spam-retry the same item for 3 min
	_mercFailLogged: {},
	_autoEquipMercLast: 0,
	_autoEquipMercCooldown: 4000,

	mercFailSkip: function (gid) {
		var t = this._mercFailGids[gid];

		if (!t) {
			return false;
		}

		if (getTickCount() - t > this._mercFailExpire) {
			delete this._mercFailGids[gid];
			delete this._mercFailLogged[gid];
			return false;
		}

		return true;
	},

	markMercFail: function (gid) {
		if (gid) {
			this._mercFailGids[gid] = getTickCount();
		}
	},

	clearMercFail: function (gid) {
		if (gid && this._mercFailGids[gid]) {
			delete this._mercFailGids[gid];
		}

		if (gid && this._mercFailLogged[gid]) {
			delete this._mercFailLogged[gid];
		}
	},

	autoEquipMercCheck: function (item) {
		var locs, i, eq;

		if (!Config.UseMerc || !Config.AutoEquipMerc || !me.getMerc() || !item) {
			return false;
		}

		if (this.mercFailSkip(item.gid)) {
			return false;
		}

		locs = this.getMercBodyLoc(item);

		if (!locs) {
			return false;
		}

		if (item.itemType !== 5 && item.itemType !== 6 && !this.canMercEquip(item)) {
			return false;
		}

		// Ammo: stricter match (bow↔arrows, xbow↔bolts) + upgrade only
		if (item.itemType === 5 || item.itemType === 6) {
			return this.mercNeedsAmmo(item);
		}

		if (NTIP.GetTier(item) > 0 && this.autoEquipCheck(item)) {
			return false;
		}

		for (i = 0; i < locs.length; i += 1) {
			eq = this.getMercItem(locs[i]);

			if (this.mercIsUpgrade(item, eq, locs[i])) {
				return true;
			}
		}

		return false;
	},

	autoEquipMerc: function (force) {
		if (!Config.UseMerc || !Config.AutoEquipMerc) {
			return true;
		}

		// equipMerc opens inventory at vendor (no stash walk); only during town chores
		if (!me.inTown) {
			return false;
		}

		// Debounce spam / re-open stash thrash
		if (!force && this._autoEquipMercLast && getTickCount() - this._autoEquipMercLast < this._autoEquipMercCooldown) {
			return true;
		}

		var merc = me.getMerc(),
			i, j, bodyLoc, eq, items, cand, gid, slot;

		if (!merc || merc.mode === 0 || merc.mode === 12) {
			return false;
		}

		items = me.findItems(-1, 0);

		if (!items) {
			return false;
		}

		this._autoEquipMercLast = getTickCount();
		me.cancel();

		// Act2 with leftover Act1 bows breaks spear equip + PD2 slots
		if (this.isDesertMerc(merc)) {
			this.stripWrongDesertWeapons();
		}

		for (i = 0; i < items.length; i += 1) {
			if ([3, 7].indexOf(items[i].location) === -1 || !this.getMercBodyLoc(items[i]) || this.mercFailSkip(items[i].gid)) {
				items.splice(i, 1);
				i -= 1;
				continue;
			}

			// Never try weapons/armor the merc can't wear (lvl/str/dex)
			if (items[i].itemType !== 5 && items[i].itemType !== 6 && !this.canMercEquip(items[i])) {
				this.markMercFail(items[i].gid);
				items.splice(i, 1);
				i -= 1;
			}
		}

		// Weapon → ammo → armor/helm → belt/boots/gloves
		items.sort(function (a, b) {
			function pri(it) {
				if ([27, 35, 85, 24, 25, 26, 30, 31, 32, 33, 34].indexOf(it.itemType) > -1) {
					return 0;
				}

				if ([5, 6].indexOf(it.itemType) > -1) {
					return 1;
				}

				if ([37, 71, 75, 3].indexOf(it.itemType) > -1) {
					return 2;
				}

				return 3;
			}

			var pa = pri(a),
				pb = pri(b);

			if (pa !== pb) {
				return pa - pb;
			}

			return Item.mercScore(b) - Item.mercScore(a);
		});

		while (items.length > 0) {
			cand = items[0];
			bodyLoc = this.getMercBodyLoc(cand);

			if (bodyLoc && ((cand.itemType === 5 || cand.itemType === 6) || this.canMercEquip(cand))) {
				for (j = 0; j < bodyLoc.length; j += 1) {
					eq = this.getMercItem(bodyLoc[j]);

					if (this.mercIsUpgrade(cand, eq, bodyLoc[j])) {
						if (NTIP.GetTier(cand) > 0 && this.autoEquipCheck(cand)) {
							break;
						}

						gid = cand.gid;
						slot = bodyLoc[j];

						if (this.equipMerc(cand, slot) || this.mercEquipSuccess(gid, slot)) {
							delay(80 + me.ping);

							if (this.mercEquipSuccess(gid, slot)) {
								this.clearMercFail(gid);
								print("ÿc2MercEquipÿc0 :: equipped " + (cand.name || "?") + " -> slot " + slot);

								try {
									Misc.logItem("Merc Equipped", this.getMercItem(slot).item || me.getItem(-1, -1, gid));
								} catch (eLog) {}
							} else if (this.itemInOurBags(gid)) {
								this.markMercFail(gid);

								if (!this._mercFailLogged[gid]) {
									this._mercFailLogged[gid] = true;
									print("ÿc1MercEquipÿc0 :: skip slot " + slot + " " + (cand.name || "?") + " (still in bags)");
								}
							} else {
								// Vanished without merc evidence — recover drop, do not claim success
								this.recoverMercItemFromGround(gid);
								this.markMercFail(gid);

								if (!this._mercFailLogged[gid]) {
									this._mercFailLogged[gid] = true;
									print("ÿc1MercEquipÿc0 :: equip failed slot " + slot + " " + (cand.name || ("#" + cand.classid)) +
										" classid=" + cand.classid + " type=" + cand.itemType +
										" where=" + this.mercEquipWhere(gid) +
										" desert=" + this.isDesertMerc() + " rogue=" + this.isRogueMerc() +
										" (no merc evidence)");
								}
							}
						} else if (this.itemInOurBags(gid)) {
							if (!this._mercFailLogged[gid]) {
								this._mercFailLogged[gid] = true;
								print("ÿc1MercEquipÿc0 :: equip failed slot " + slot + " " + (cand.name || ("#" + cand.classid)) +
									" classid=" + cand.classid + " type=" + cand.itemType +
									" where=" + this.mercEquipWhere(gid) +
									" desert=" + this.isDesertMerc() + " rogue=" + this.isRogueMerc() +
									" (retry later, not selling yet)");
							}
						} else {
							this.recoverMercItemFromGround(gid);
							this.markMercFail(gid);

							if (!this._mercFailLogged[gid]) {
								this._mercFailLogged[gid] = true;
								print("ÿc1MercEquipÿc0 :: equip failed slot " + slot + " " + (cand.name || ("#" + cand.classid)) +
									" classid=" + cand.classid + " type=" + cand.itemType +
									" where=" + this.mercEquipWhere(gid) +
									" desert=" + this.isDesertMerc() + " rogue=" + this.isRogueMerc() +
									" (gone — recovered if on ground)");
							}
						}

						break;
					}
				}
			}

			items.shift();
		}

		return true;
	}
};


var Misc = {
	// Click something
	click: function (button, shift, x, y) {
		if (arguments.length < 2) {
			throw new Error("Misc.click: Needs at least 2 arguments.");
		}

		while (!me.gameReady) {
			delay(100);
		}

		switch (arguments.length) {
		case 2:
			me.blockMouse = true;
			clickMap(button, shift, me.x, me.y);
			delay(20);
			clickMap(button + 2, shift, me.x, me.y);
			me.blockMouse = false;

			break;
		case 3:
			if (typeof (x) !== "object") {
				throw new Error("Misc.click: Third arg must be a Unit.");
			}

			me.blockMouse = true;
			clickMap(button, shift, x);
			delay(20);
			clickMap(button + 2, shift, x);
			me.blockMouse = false;

			break;
		case 4:
			me.blockMouse = true;
			clickMap(button, shift, x, y);
			delay(20);
			clickMap(button + 2, shift, x, y);
			me.blockMouse = false;

			break;
		}

		return true;
	},

	// Check if a player is in your party
	inMyParty: function (name) {
		if (me.name === name) {
			return true;
		}

		while (!me.gameReady) {
			delay(100);
		}

		var player, myPartyId;

		try {
			player = getParty();

			if (!player) {
				return false;
			}

			myPartyId = player.partyid;
			player = getParty(name); // May throw an error

			if (player && player.partyid !== 65535 && player.partyid === myPartyId) {
				return true;
			}
		} catch (e) {
			player = getParty();

			if (player) {
				myPartyId = player.partyid;

				while (player.getNext()) {
					if (player.partyid !== 65535 && player.partyid === myPartyId) {
						return true;
					}
				}
			}
		}

		return false;
	},

	// Get number of players within getUnit distance
	getNearbyPlayerCount: function () {
		var count = 0,
			player = getUnit(0);

		if (player) {
			do {
				if (!player.dead) {
					count += 1;
				}
			} while (player.getNext());
		}

		return count;
	},

	// Get total number of players in game
	getPlayerCount: function () {
		var count = 0,
			party = getParty();

		if (party) {
			do {
				count += 1;
			} while (party.getNext());
		}

		return count;
	},

	// Open a chest Unit
	// opts.noMove — only click if already in reach (pathing: never leave the route)
	openChest: function (unit, opts) {
		var i, tick, cairn, dist, noMove;

		opts = opts || {};
		noMove = !!opts.noMove;

		// Skip invalid and Countess chests
		if (!unit || unit.x === 12526 || unit.x === 12565) {
			return false;
		}

		cairn = [17, 18, 19, 20, 21].indexOf(unit.classid) > -1;

		// already open — cairn stones keep weird modes; never skip them on mode alone
		if (unit.mode && !cairn) {
			return true;
		}

		// locked chest, no keys — NOT cairn stones (those use the quest scroll key, not skeleton keys)
		if (!cairn && me.classid !== 6 && unit.islocked && !me.findItem(560, 0, 3) && !me.getItem("key")) {
			return false;
		}

		dist = getDistance(me, unit);

		// Pathing: only chests we are already walking past — no moveTo detours
		if (noMove) {
			if (dist > 5) {
				return false;
			}

			sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
			Misc.click(0, 0, unit);

			try {
				if (typeof unit.interact === "function") {
					unit.interact();
				}
			} catch (eNear) {}

			tick = getTickCount();

			while (getTickCount() - tick < 800) {
				if (unit.mode && !cairn) {
					return true;
				}

				if (cairn && (me.getQuest(4, 4) || Pather.getPortal(38))) {
					return true;
				}

				delay(10);
			}

			return !!cairn;
		}

		// Never TK chests — walk + click only (TK = pickit loot + Duriel orifice only)
		for (i = 0; i < 3; i += 1) {
			if (Pather.moveTo(unit.x + 1, unit.y + 2, 3) && getDistance(me, unit.x + 1, unit.y + 2) < 5) {
				sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
				Misc.click(0, 0, unit);

				try {
					if (typeof unit.interact === "function") {
						unit.interact();
					}
				} catch (eOpen) {}
			}

			tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				if (unit.mode && !cairn) {
					return true;
				}

				// Cairn: success is red portal / quest flag, not stone.mode
				if (cairn && (me.getQuest(4, 4) || Pather.getPortal(38))) {
					return true;
				}

				delay(10);
			}
		}

		if (!me.idle) {
			Misc.click(0, 0, me.x, me.y); // Click to stop walking in case we got stuck
		}

		return !!cairn; // stones may not flip mode — caller loops until quest/portal
	},

	// Open all chests that have preset units in an area
	openChestsInArea: function (area, chestIds) {
		var i, coords, presetUnits;

		if (!area) {
			area = me.area;
		}

		// testing
		if (area !== me.area) {
			Pather.journeyTo(area);
		}

		coords = [];

		try {
			presetUnits = getPresetUnits(area, 2);
		} catch (ePreset) {
			print("ÿc8Misc.openChestsInAreaÿc0 :: getPresetUnits failed area=" + area);

			return false;
		}

		if (!chestIds) {
			chestIds = [
				5, 6, 87, 104, 105, 106, 107, 143, 140, 141, 144, 146, 147, 148, 176, 177, 181, 183, 198, 240, 241,
				242, 243, 329, 330, 331, 332, 333, 334, 335, 336, 354, 355, 356, 371, 387, 389, 390, 391, 397, 405,
				406, 407, 413, 420, 424, 425, 430, 431, 432, 433, 454, 455, 501, 502, 504, 505, 580, 581
			];
		}

		if (!presetUnits) {
			return false;
		}

		while (presetUnits.length > 0) {
			if (chestIds.indexOf(presetUnits[0].id) > -1) {
				coords.push({
					x: presetUnits[0].roomx * 5 + presetUnits[0].x,
					y: presetUnits[0].roomy * 5 + presetUnits[0].y
				});
			}

			presetUnits.shift();
		}

		while (coords.length) {
			coords.sort(Sort.units);
			Pather.moveToUnit(coords[0], 1, 2);
			this.openChests(20);

			for (i = 0; i < coords.length; i += 1) {
				if (getDistance(coords[i].x, coords[i].y, coords[0].x, coords[0].y) < 20) {
					coords.shift();
				}
			}
		}

		return true;
	},

	openChests: function (range, opts) {
		var unit,
			unitList = [],
			containers = ["chest", "chest3", "armorstand", "weaponrack"];

		opts = opts || {};

		if (!range) {
			range = opts.noMove ? 5 : 15;
		}

		// Testing all container code
		if (Config.OpenChests === 2) {
			containers = [
				"chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2",
				"tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2",
				"cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl",
				"woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2",
				"icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
			];
		}

		unit = getUnit(2);

		if (unit) {
			do {
				if (unit.name && unit.mode === 0 && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.indexOf(unit.name.toLowerCase()) > -1) {
					unitList.push(copyUnit(unit));
				}
			} while (unit.getNext());
		}

		while (unitList.length > 0) {
			unitList.sort(Sort.units);

			unit = unitList.shift();

			if (unit && (opts.noMove || Pather.canTeleport() || !checkCollision(me, unit, 0x4)) &&
					this.openChest(unit, opts)) {
				Pickit.pickItems();
			}
		}

		return true;
	},

	shrineStates: false,

	// gid -> times used this game (cap so pathing doesn't spam the same well)
	_wellUseCount: {},

	// Click nearby wells when low on life/mana/stamina (wells are not shrines)
	scanWells: function (range) {
		if (Config.UseWells === false || me.inTown) {
			return false;
		}

		var hpPct = me.hpmax > 0 ? (me.hp * 100 / me.hpmax) : 100,
			mpPct = me.mpmax > 0 ? (me.mp * 100 / me.mpmax) : 100,
			stamPct = me.staminamax > 0 ? (me.stamina * 100 / me.staminamax) : 100,
			needHP = hpPct <= (Config.UseWellHP || 65),
			needMP = mpPct <= (Config.UseWellMP || 40),
			needStam = stamPct <= 35,
			unit, name, i, clicks, wellIds, used, maxClicks;

		if (!needHP && !needMP && !needStam) {
			return false;
		}

		if (!range) {
			range = Pather.canTeleport() ? 20 : 15;
		}

		// Common well / fountain object ids (vanilla + common act variants)
		wellIds = [84, 111, 113, 115, 118, 130, 132, 137, 138, 322, 426, 493];
		maxClicks = 2; // never more than twice per well

		unit = getUnit(2);

		if (!unit) {
			return false;
		}

		do {
			if (getDistance(me, unit) > range) {
				continue;
			}

			// Depleted wells usually have higher mode — skip empty
			if (unit.mode > 2) {
				continue;
			}

			name = (unit.name || "").toLowerCase();

			if (wellIds.indexOf(unit.classid) === -1 &&
					name.indexOf("well") === -1 &&
					name.indexOf("fountain") === -1) {
				continue;
			}

			used = this._wellUseCount[unit.gid] || 0;

			if (used >= maxClicks) {
				continue; // already drank this well twice
			}

			if (checkCollision(me, unit, 0x4) && !Pather.canTeleport()) {
				continue;
			}

			if (getDistance(me, unit) > 4 && !Pather.moveToUnit(unit, 2, 0)) {
				continue;
			}

			// One click this visit; second only if still under max and very low
			clicks = Math.min(maxClicks - used, ((needHP && hpPct <= 40) || (needMP && mpPct <= 25)) ? 2 : 1);

			for (i = 0; i < clicks; i += 1) {
				Misc.click(0, 0, unit);
				delay(me.ping + 200);
			}

			this._wellUseCount[unit.gid] = used + clicks;
			print("ÿc2Wellÿc0 :: used (hp " + Math.floor(hpPct) + "% / mp " + Math.floor(mpPct) + "%) [" + this._wellUseCount[unit.gid] + "/" + maxClicks + "]");

			return true;
		} while (unit.getNext());

		return false;
	},

	scanShrines: function (range) {
		if (!Config.ScanShrines.length) {
			return false;
		}

		if (!range) {
			range = Pather.canTeleport() ? 25 : 15;
		}

		var i, j, shrine,
			index = -1,
			shrineList = [];

		// Initiate shrine states
		if (!this.shrineStates) {
			this.shrineStates = [];

			for (i = 0; i < Config.ScanShrines.length; i += 1) {
				switch (Config.ScanShrines[i]) {
				case 0: // None
				case 1: // Refilling
				case 2: // Health
				case 3: // Mana
				case 4: // Health Exchange (doesn't exist)
				case 5: // Mana Exchange (doesn't exist)
				case 16: // Enirhs (doesn't exist)
				case 17: // Portal
				case 18: // Gem
				case 19: // Fire
				case 20: // Monster
				case 21: // Exploding
				case 22: // Poison
					this.shrineStates[i] = 0; // no state

					break;
				case 6: // Armor
				case 7: // Combat
				case 8: // Resist Fire
				case 9: // Resist Cold
				case 10: // Resist Lightning
				case 11: // Resist Poison
				case 12: // Skill
				case 13: // Mana recharge
				case 14: // Stamina
				case 15: // Experience
					// Both states and shrines are arranged in same order with armor shrine starting at 128
					this.shrineStates[i] = Config.ScanShrines[i] + 122;

					break;
				}
			}
		}

		shrine = getUnit(2, "shrine");

		if (shrine) {
			// Build a list of nearby shrines
			do {
				if (shrine.mode === 0 && getDistance(me.x, me.y, shrine.x, shrine.y) <= range) {
					shrineList.push(copyUnit(shrine));
				}
			} while (shrine.getNext());

			// Check if we have a shrine state, store its index if yes
			for (i = 0; i < this.shrineStates.length; i += 1) {
				if (me.getState(this.shrineStates[i])) {
					index = i;

					break;
				}
			}

			for (i = 0; i < Config.ScanShrines.length; i += 1) {
				for (j = 0; j < shrineList.length; j += 1) {
					// Get the shrine if we have no active state or to refresh current state or if the shrine has no state
					// Don't override shrine state with a lesser priority shrine
					if (index === -1 || i <= index || this.shrineStates[i] === 0) {
						if (shrineList[j].objtype === Config.ScanShrines[i] && (Pather.canTeleport() || !checkCollision(me, shrineList[j], 0x4))) {
							this.getShrine(shrineList[j]);

							// Gem shrine - pick gem
							if (Config.ScanShrines[i] === 18) {
								Pickit.pickItems();
							}
						}
					}
				}
			}
		}

		return true;
	},

	// Use a shrine Unit
	getShrine: function (unit) {
		if (unit.mode) {
			return false;
		}

		var i, tick;

		for (i = 0; i < 3; i += 1) {
			if (getDistance(me, unit) < 4 || Pather.moveToUnit(unit, 3, 0)) {
				Misc.click(0, 0, unit);
				//unit.interact();
			}

			tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				if (unit.mode) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	// Check all shrines in area and get the first one of specified type
	getShrinesInArea: function (area, type, use) {
		var i, coords, shrine,
			shrineLocs = [],
			shrineIds = [2, 81, 83],
			unit = null;

		try {
			unit = getPresetUnits(area);
		} catch (ePreset) {
			print("ÿc8Misc.getShrinesInAreaÿc0 :: getPresetUnits failed area=" + area);

			return false;
		}

		if (unit) {
			for (i = 0; i < unit.length; i += 1) {
				if (shrineIds.indexOf(unit[i].id) > -1) {
					shrineLocs.push([unit[i].roomx * 5 + unit[i].x, unit[i].roomy * 5 + unit[i].y]);
				}
			}
		}

		while (shrineLocs.length > 0) {
			shrineLocs.sort(Sort.points);

			coords = shrineLocs.shift();

			Pather.moveTo(coords[0], coords[1], 2);

			shrine = getUnit(2, "shrine");

			if (shrine) {
				do {
					if (shrine.objtype === type && shrine.mode === 0) {
						Pather.moveTo(shrine.x - 2, shrine.y - 2);

						if (!use || this.getShrine(shrine)) {
							return true;
						}
					}
				} while (shrine.getNext());
			}
		}

		return false;
	},

	getItemDesc: function (unit) {
		var i, desc, index,
			stringColor = "";

		desc = unit.description;

		if (!desc) {
			return "";
		}

		desc = desc.split("\n");

		// Lines are normally in reverse. Add color tags if needed and reverse order.
		for (i = 0; i < desc.length; i += 1) {
			if (desc[i].indexOf(getLocaleString(3331)) > -1) { // Remove sell value
				desc.splice(i, 1);

				i -= 1;
			} else {
				// Add color info
				if (!desc[i].match(/^(y|ÿ)c/)) {
					desc[i] = stringColor + desc[i];
				}

				// Find and store new color info
				index = desc[i].lastIndexOf("ÿc");

				if (index > -1) {
					stringColor = desc[i].substring(index, index + "ÿ".length + 2);
				}
			}

			desc[i] = desc[i].replace(/(y|ÿ)c([0-9!"+<:;.*])/g, "\\xffc$2");
		}

		if (desc[desc.length - 1]) {
			desc[desc.length - 1] = desc[desc.length - 1].trim() + " (" + unit.ilvl + ")";
		}

		desc = desc.reverse().join("\n");

		return desc;
	},

	getItemSockets: function (unit) {
		var i, code,
			sockets = unit.getStat(194),
			subItems = unit.getItems(),
			tempArray = [];

		if (subItems) {
			switch (unit.sizex) {
			case 2:
				switch (unit.sizey) {
				case 3: // 2 x 3
					switch (sockets) {
					case 4:
						tempArray = [subItems[0], subItems[3], subItems[2], subItems[1]];

						break;
					case 5:
						tempArray = [subItems[1], subItems[4], subItems[0], subItems[3], subItems[2]];

						break;
					case 6:
						tempArray = [subItems[0], subItems[3], subItems[1], subItems[4], subItems[2], subItems[5]];

						break;
					}

					break;
				case 4: // 2 x 4
					switch (sockets) {
					case 5:
						tempArray = [subItems[1], subItems[4], subItems[0], subItems[3], subItems[2]];

						break;
					case 6:
						tempArray = [subItems[0], subItems[3], subItems[1], subItems[4], subItems[2], subItems[5]];

						break;
					}

					break;
				}

				break;
			}

			if (tempArray.length === 0 && subItems.length > 0) {
				tempArray = subItems.slice(0);
			}
		}

		for (i = 0; i < sockets; i += 1) {
			if (tempArray[i]) {
				code = tempArray[i].code;

				if ([10, 12, 58, 82, 83, 84].indexOf(tempArray[i].itemType) > -1) {
					code += (tempArray[i].gfx + 1);
				}
			} else {
				code = "gemsocket";
			}

			tempArray[i] = code;
		}

		return tempArray;
	},

	useItemLog: true, // Might be a bit dirty

	itemLogger: function (action, unit, text) {
		if (!Config.ItemInfo || !this.useItemLog) {
			return false;
		}

		var desc,
			date = new Date(),
			dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0,-5).replace(/-/g, '/').replace('T', ' ') + "]";

		switch (action) {
		case "Sold":
			if (Config.ItemInfoQuality.indexOf(unit.quality) === -1) {
				return false;
			}

			desc = this.getItemDesc(unit).split("\n").join(" | ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]/gi, "").trim();

			break;
		case "Kept":
		case "Field Kept":
		case "Runeword Kept":
		case "Cubing Kept":
		case "Shopped":
		case "Gambled":
		case "Dropped":
			desc = this.getItemDesc(unit).split("\n").join(" | ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]|\/|\\/gi, "").trim();

			break;
		case "No room for":
			desc = unit.name;

			break;
		default:
			desc = (unit && unit.fname) ? unit.fname.split("\n").reverse().join(" ").replace(/(\\xff|ÿ)c[0-9!"+<:;.*]|\/|\\/gi, "").trim() : (unit && unit.name ? unit.name : "unknown");

			break;
		}

		return this.fileAction("logs/ItemLog.txt", 2, dateString + " <" + me.profile + "> <" + action + "> (" + Pickit.itemQualityToName(unit.quality) + ") " + desc + (text ? " {" + text + "}" : "") + "\n");
	},

	// Log kept item stats in the manager.
	logItem: function (action, unit, keptLine) {
		if (!this.useItemLog) {
			return false;
		}

		var i;

		if (!Config.LogKeys && ["pk1", "pk2", "pk3"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogOrgans && ["dhn", "bey", "mbr"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogLowRunes && ["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "r10", "r11", "r12", "r13", "r14"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogMiddleRunes && ["r15", "r16", "r17", "r18", "r19", "r20", "r21", "r22", "r23"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogHighRunes && ["r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32", "r33"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogLowGems && ["gcv", "gcy", "gcb", "gcg", "gcr", "gcw", "skc", "gfv", "gfy", "gfb", "gfg", "gfr", "gfw", "skf", "gsv", "gsy", "gsb", "gsg", "gsr", "gsw", "sku"].indexOf(unit.code) > -1) {
			return false;
		}

		if (!Config.LogHighGems && ["gzv", "gly", "glb", "glg", "glr", "glw", "skl", "gpv", "gpy", "gpb", "gpg", "gpr", "gpw", "skz"].indexOf(unit.code) > -1) {
			return false;
		}

		if (Config.SkipLogging && Config.SkipLogging.length) {
			for (i = 0; i < Config.SkipLogging.length; i++) {
				if (Config.SkipLogging[i] === unit.classid || Config.SkipLogging[i] === unit.code) {
					return false;
				}
			}
		}

		var lastArea, code, desc, sock, itemObj,
			color = -1,
			name = unit.fname.split("\n").reverse().join(" ").replace(/ÿc[0-9!"+<:;.*]|\/|\\/g, "").trim();

		desc = this.getItemDesc(unit);
		color = unit.getColor();

		if (action.match("kept", "i")) {
			lastArea = DataFile.getStats().lastArea;

			if (lastArea) {
				desc += ("\n\\xffc0Area: " + lastArea);
			}
		}

		if (unit.getFlag(0x10)) {
			switch (unit.quality) {
			case 5: // Set
				switch (unit.classid) {
				case 27: // Angelic sabre
					code = "inv9sbu";

					break;
				case 74: // Arctic short war bow
					code = "invswbu";

					break;
				case 308: // Berserker's helm
					code = "invhlmu";

					break;
				case 330: // Civerb's large shield
					code = "invlrgu";

					break;
				case 31: // Cleglaw's long sword
				case 227: // Szabi's cryptic sword
					code = "invlsdu";

					break;
				case 329: // Cleglaw's small shield
					code = "invsmlu";

					break;
				case 328: // Hsaru's buckler
					code = "invbucu";

					break;
				case 306: // Infernal cap / Sander's cap
					code = "invcapu";

					break;
				case 30: // Isenhart's broad sword
					code = "invbsdu";

					break;
				case 309: // Isenhart's full helm
					code = "invfhlu";

					break;
				case 333: // Isenhart's gothic shield
					code = "invgtsu";

					break;
				case 326: // Milabrega's ancient armor
				case 442: // Immortal King's sacred armor
					code = "invaaru";

					break;
				case 331: // Milabrega's kite shield
					code = "invkitu";

					break;
				case 332: // Sigon's tower shield
					code = "invtowu";

					break;
				case 325: // Tancred's full plate mail
					code = "invfulu";

					break;
				case 3: // Tancred's military pick
					code = "invmpiu";

					break;
				case 113: // Aldur's jagged star
					code = "invmstu";

					break;
				case 234: // Bul-Kathos' colossus blade
					code = "invgsdu";

					break;
				case 372: // Grizwold's ornate plate
					code = "invxaru";

					break;
				case 366: // Heaven's cuirass
				case 215: // Heaven's reinforced mace
				case 449: // Heaven's ward
				case 426: // Heaven's spired helm
					code = "inv" + unit.code + "s";

					break;
				case 357: // Hwanin's grand crown
					code = "invxrnu";

					break;
				case 195: // Nalya's scissors suwayyah
					code = "invskru";

					break;
				case 395: // Nalya's grim helm
				case 465: // Trang-Oul's bone visage
					code = "invbhmu";

					break;
				case 261: // Naj's elder staff
					code = "invcstu";

					break;
				case 375: // Orphan's round shield
					code = "invxmlu";

					break;
				case 12: // Sander's bone wand
					code = "invbwnu";

					break;
				}

				break;
			case 7: // Unique
				for (i = 0; i < 401; i += 1) {
					if (unit.code === getBaseStat(17, i, 4).trim() && unit.fname.split("\n").reverse()[0].indexOf(getLocaleString(getBaseStat(17, i, 2))) > -1) {
						code = getBaseStat(17, i, "invfile");

						break;
					}
				}

				break;
			}
		}

		if (!code) {
			if (["ci2", "ci3"].indexOf(unit.code) > -1) { // Tiara/Diadem
				code = unit.code;
			} else {
				code = getBaseStat(0, unit.classid, 'normcode') || unit.code;
			}

			code = code.replace(" ", "");

			if ([10, 12, 58, 82, 83, 84].indexOf(unit.itemType) > -1) {
				code += (unit.gfx + 1);
			}
		}

		sock = unit.getItem();

		if (sock) {
			do {
				if (sock.itemType === 58) {
					desc += "\n\n";
					desc += this.getItemDesc(sock);
				}
			} while (sock.getNext());
		}

		if (keptLine) {
			desc += ("\n\\xffc0Line: " + keptLine);
		}

		desc += "$" + (unit.getFlag(0x400000) ? ":eth" : "");

		itemObj = {
			title: action + " " + name,
			description: desc,
			image: code,
			textColor: unit.quality,
			itemColor: color,
			header: "",
			sockets: this.getItemSockets(unit)
		};

		D2Bot.printToItemLog(itemObj);

		return true;
	},

	// skip low items: MuleLogger
	skipItem: function (id) {
		switch (id) {
		//case 549: // horadric cube
		case   0: // hand axe
		case  10: // wand
		case  14: // club
		case  25: // shortsword
		case  47: // javelin
		case  63: // shortstaff
		case 175: // katar
		case 328: // buckler
		case 513: // stamina potion
		case 514: // antidote potion
		case 532: // rejuvenationpotion (PD2 rvs)
		case 533: // fullrejuvenationpotion (PD2 rvl)
		case 517: // thawing potion
		case 535: // tomeoftownportal (PD2 tbk)
		case 536: // tomeofidentify (PD2 ibk)
		case 546: // scrolloftownportal (PD2 tsc)
		case 547: // scrollofidentify (PD2 isc)
		case 560: // key (PD2; LoD used 543 which is aqv arrows here)
		case 604: // lesserhealingpotion hp1
		case 605: // lighthealingpotion hp2
		case 606: // healingpotion hp3
		case 607: // stronghealingpotion hp4
		case 608: // greaterhealingpotion hp5
		case 609: // lessermanapotion mp1
		case 610: // lightmanapotion mp2
		case 611: // manapotion mp3
		case 612: // strongmanapotion mp4
		case 613: // greatermanapotion mp5
		// legacy LoD ids (kept for classic)
		case 515: // rejuvenationpotion
		case 516: // fullrejuvenationpotion
		case 518: // tomeoftownportal
		case 519: // tomeofidentify
		case 529: // scrolloftownportal
		case 530: // scrollofidentify
		case 587: // minorhealingpotion
		case 588: // lighthealingpotion
		case 589: // healingpotion
		case 590: // greathealingpotion
		case 591: // superhealingpotion
		case 592: // minormanapotion
		case 593: // lightmanapotion
		case 594: // manapotion
		case 595: // greatermanapotion
		case 596: // supermanapotion
			return true;
		}

		return false;
	},

	// Change into werewolf or werebear
	shapeShift: function (mode) {
		var i, tick, skill, state;

		switch (mode.toString().toLowerCase()) {
		case "0":
			return false;
		case "1":
		case "werewolf":
			state = 139;
			skill = 223;

			break;
		case "2":
		case "werebear":
			state = 140;
			skill = 228;

			break;
		default:
			throw new Error("shapeShift: Invalid parameter");
		}

		if (me.getState(state)) {
			return true;
		}

		for (i = 0; i < 3; i += 1) {
			Skill.cast(skill, 0);

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (me.getState(state)) {
					delay(250);

					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	// Change back to human shape
	unShift: function () {
		var i, tick;

		if (me.getState(139) || me.getState(140)) {
			for (i = 0; i < 3; i += 1) {
				Skill.cast(me.getState(139) ? 223 : 228);

				tick = getTickCount();

				while (getTickCount() - tick < 2000) {
					if (!me.getState(139) && !me.getState(140)) {
						delay(250);

						return true;
					}

					delay(10);
				}
			}
		} else {
			return true;
		}

		return false;
	},

	// Count potions by type prefix "hp"|"mp"|"rv"|"vps". where: "belt" | "inv" | "all"
	countPotions: function (type, where) {
		var item, n = 0, code, name, kind,
			hpIds = [604, 605, 606, 607, 608, 526, 528],
			mpIds = [609, 610, 611, 612, 613, 527, 529],
			rvIds = [530, 531, 532, 533],
			onBelt, inInv, match;

		if (!type) {
			return 0;
		}

		if (where === undefined) {
			where = "all";
		}

		item = me.getItem(-1, -1);

		if (!item) {
			return 0;
		}

		do {
			onBelt = item.mode === 2 || item.location === 2;
			inInv = item.location === 3 && item.mode !== 2;

			if (where === "belt" && !onBelt) {
				continue;
			}

			if (where === "inv" && !inInv) {
				continue;
			}

			if (where === "all" && !onBelt && !inInv) {
				continue;
			}

			// Prefer Town.potionKind when available (code / classid / PD2 type / name)
			if (typeof Town !== "undefined" && typeof Town.potionKind === "function") {
				kind = Town.potionKind(item);

				if (kind === type) {
					n += 1;
				}

				continue;
			}

			code = item.code ? String(item.code).toLowerCase() : "";
			name = item.name ? String(item.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";
			match = false;

			// Code first (same rule as Town.potionKind)
			if (code.indexOf(type) === 0) {
				match = true;
			} else if (!code && type === "hp" && (hpIds.indexOf(item.classid) > -1 || item.itemType === 76)) {
				match = true;
			} else if (!code && type === "mp" && (mpIds.indexOf(item.classid) > -1 || item.itemType === 77)) {
				match = true;
			} else if (!code && type === "rv" && (rvIds.indexOf(item.classid) > -1 || item.itemType === 78)) {
				match = true;
			} else if (!code && type === "vps" && item.itemType === 79) {
				match = true;
			} else if (!code && type === "mp" && name.indexOf("mana") > -1) {
				match = true;
			} else if (!code && type === "hp" && (name.indexOf("healing") > -1 || name.indexOf("health") > -1)) {
				match = true;
			}

			if (match) {
				n += 1;
			}
		} while (item.getNext());

		return n;
	},

	// Returns "hp"/"mp" if we should TP to vendor, else false
	needPotionTown: function () {
		var i, type, belt, inv, seen = {},
			hpPct = me.hpmax > 0 ? (me.hp * 100 / me.hpmax) : 100,
			mpPct = me.mpmax > 0 ? (me.mp * 100 / me.mpmax) : 100,
			needTypes = [],
			hpTrig, mpTrig;

		// Only care when we're actually low — empty belt at full mana must NOT spam town
		hpTrig = Math.max(Config.UseHP || 0, 50);
		mpTrig = Math.max(Config.UseMP || 0, 40);

		for (i = 0; i < 4; i += 1) {
			type = Config.BeltColumn[i];

			if ((type === "hp" || type === "mp") && Config.MinColumn[i] > 0 && !seen[type]) {
				seen[type] = true;
				needTypes.push(type);
			}
		}

		for (i = 0; i < needTypes.length; i += 1) {
			type = needTypes[i];
			belt = this.countPotions(type, "belt");
			inv = this.countPotions(type, "inv");

			// Vendor only when belt AND inventory are empty for that type
			if (belt > 0 || inv > 0) {
				continue;
			}

			if (type === "hp" && hpPct <= hpTrig) {
				return type;
			}

			// Levels 1–7: sit on empty mana — no TP just to restock mp
			if (type === "mp" && mpPct <= mpTrig && me.charlvl > 7) {
				return type;
			}
		}

		return false;
	},

	// Go to town when out of potions (or keys)
	townCheck: function () {
		var check = false,
			need;

		if (me.area === 136 || me.dead) {
			return false;
		}

		if (Pather.atLifeChicken && Pather.atLifeChicken()) {
			return false;
		}

		if (Config.LifeChicken > 0 && me.hpmax > 0 &&
				me.hp <= Math.floor(me.hpmax * Math.min(100, Config.LifeChicken + 20) / 100)) {
			return false;
		}

		if (!Config.TownCheck || me.inTown) {
			return false;
		}

		try {
			need = this.needPotionTown();

			if (need) {
				print("ÿc8TownCheckÿc0 :: out of " + need + " — TP to vendor");
				check = true;
			}

			if (!check && Config.OpenChests && Town.needKeys()) {
				// Just left chores with no keys → cool down (skip/buy fail), don't walk-loop
				if (Town.lastFullChores && getTickCount() - Town.lastFullChores < 2 * 60 * 1000) {
					Town._keysBrokeTick = getTickCount();
				} else {
					print("ÿc8TownCheckÿc0 :: need keys");
					check = true;
				}
			}
		} catch (e) {
			check = false;
		}

		if (check) {
			scriptBroadcast("townCheck");
			delay(500);

			return true;
		}

		return false;
	},

	// Log someone's gear
	spy: function (name) {
		if (!isIncluded("oog.js")) {
			include("oog.js");
		}

		if (!isIncluded("common/prototypes.js")) {
			include("common/prototypes.js");
		}

		var item,
			unit = getUnit(-1, name);

		if (!unit) {
			print("player not found");

			return false;
		}

		item = unit.getItem();

		if (item) {
			do {
				this.logItem(unit.name, item);
			} while (item.getNext());
		}

		return true;
	},

	// hopefully multi-thread and multi-profile friendly txt func
	/*fileAction: function (path, mode, msg) {
		var i, file,
			contents = "";

MainLoop:
		for (i = 0; i < 30; i += 1) {
			try {
				file = File.open(path, mode);

				switch (mode) {
				case 0: // read
					contents = file.readLine();

					break MainLoop;
				case 1: // write
				case 2: // append
					file.write(msg);

					break MainLoop;
				}
			} catch (e) {

			} finally {
				if (file) {
					file.close();
				}
			}

			delay(100);
		}

		return mode === 0 ? contents : true;
	},*/

	fileAction: function (path, mode, msg) {
		var i,
			contents = "";

MainLoop:
		for (i = 0; i < 30; i += 1) {
			try {
				switch (mode) {
				case 0: // read
					contents = FileTools.readText(path);

					break MainLoop;
				case 1: // write
					FileTools.writeText(path, msg);

					break MainLoop;
				case 2: // append
					FileTools.appendText(path, msg);

					break MainLoop;
				}
			} catch (e) {

			}

			delay(100);
		}

		return mode === 0 ? contents : true;
	},

	errorConsolePrint: true,
	screenshotErrors: false,

	// Report script errors to logs/ScriptErrorLog.txt
	errorReport: function (error, script) {
		var i, date, dateString, msg, oogmsg, filemsg, source, stack,
			stackLog = "";

		date = new Date();
		dateString = "[" + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0,-5).replace(/-/g, '/').replace('T', ' ') + "]";

		if (typeof error === "string") {
			msg = error;
			oogmsg = error.replace(/ÿc[0-9!"+<:;.*]/gi, "");
			filemsg = dateString + " <" + me.profile + "> " + error.replace(/ÿc[0-9!"+<:;.*]/gi, "") + "\n";
		} else {
			source = error.fileName.substring(error.fileName.lastIndexOf("\\") + 1, error.fileName.length);
			msg = "ÿc1Error in ÿc0" + script + " ÿc1(" + source + " line ÿc1" + error.lineNumber + "): ÿc1" + error.message;
			oogmsg = " Error in " + script + " (" + source + " #" + error.lineNumber + ") " + error.message + " (Area: " + me.area + ", Ping:" + me.ping + ", Game: " + me.gamename + ")";
			filemsg = dateString + " <" + me.profile + "> " + msg.replace(/ÿc[0-9!"+<:;.*]/gi, "") + "\n";

			if (error.hasOwnProperty("stack")) {
				stack = error.stack;

				if (stack) {
					stack = stack.split("\n");

					if (stack && typeof stack === "object") {
						stack.reverse();
					}

					for (i = 0; i < stack.length; i += 1) {
						if (stack[i]) {
							stackLog += stack[i].substr(0, stack[i].indexOf("@") + 1) + stack[i].substr(stack[i].lastIndexOf("\\") + 1, stack[i].length - 1);

							if (i < stack.length - 1) {
								stackLog += ", ";
							}
						}
					}
				}
			}

			if (stackLog) {
				filemsg += "Stack: " + stackLog + "\n";
			}
		}

		if (this.errorConsolePrint) {
			D2Bot.printToConsole(oogmsg, 10);
		}

		showConsole();
		print(msg);
		this.fileAction("logs/ScriptErrorLog.txt", 2, filemsg);

		if (this.screenshotErrors) {
			takeScreenshot();
			delay(500);
		}
	},

	debugLog: function (msg) {
		if (!Config.Debug) {
			return;
		}

		debugLog(me.profile + ": " + msg);
	},

	// Use a NPC menu. Experimental function, subject to change
	// id = string number (with exception of Ressurect merc). http://www.blizzhackers.cc/viewtopic.php?f=209&t=378493
	useMenu: function (id) {
		//print("useMenu " + getLocaleString(id));

		var i, npc, lines;

		switch (id) {
		case 0x1507: // Resurrect (non-English dialog)
		case 0x0D44: // Trade (crash dialog)
			npc = getInteractedNPC();

			if (npc) {
				npc.useMenu(id);
				delay(750);

				return true;
			}

			break;
		}

		lines = getDialogLines();

		if (!lines) {
			return false;
		}

		for (i = 0; i < lines.length; i += 1) {
			if (lines[i].selectable && lines[i].text.indexOf(getLocaleString(id)) > -1) {
				getDialogLines()[i].handler();
				delay(750);

				return true;
			}
		}

		return false;
	},

	clone: function (obj) {
		var i, copy, attr;

		// Handle the 3 simple types, and null or undefined
		if (null === obj || "object" !== typeof obj) {
			return obj;
		}

		// Handle Date
		if (obj instanceof Date) {
			copy = new Date();

			copy.setTime(obj.getTime());

			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			copy = [];

			for (i = 0; i < obj.length; i += 1) {
				copy[i] = this.clone(obj[i]);
			}

			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			copy = {};

			for (attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = this.clone(obj[attr]);
				}
			}

			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	},

	copy: function (from) {
		var i,
			obj = {};

		for (i in from) {
			if (from.hasOwnProperty(i)) {
				obj[i] = this.clone(from[i]);
			}
		}

		return obj;
	},

	poll: function (check, timeout = 6000, sleep = 40) {
		let ret, start = getTickCount();

		while (getTickCount() - start <= timeout) {
			if ((ret = check()))
				return ret;

			delay(sleep);
		}

		return false;
	},

	getUIFlags: function (excluded = []) { // returns array of UI flags that are set, or null if none are set
		if (!me.gameReady) {
			return null;
		}

		const MAX_FLAG = 37;
		let flags = [];

		if (typeof excluded !== 'object' || excluded.length === undefined) {
			excluded = [excluded]; // not an array-like object, make it an array
		}

		for (let c = 1; c <= MAX_FLAG; c++) { // anything over 37 crashes
			if (c !== 0x23 && excluded.indexOf(c) === -1 && getUIFlag(c)) { // 0x23 is always set in-game
				flags.push(c);
			}
		}

		return flags.length ? flags : null;
	}
};

var Sort = {
	// Sort units by comparing distance between the player
	units: function (a, b) {
		return Math.round(getDistance(me.x, me.y, a.x, a.y)) - Math.round(getDistance(me.x, me.y, b.x, b.y));
	},

	// Sort preset units by comparing distance between the player (using preset x/y calculations)
	presetUnits: function (a, b) {
		return getDistance(me, a.roomx * 5 + a.x, a.roomy * 5 + a.y) - getDistance(me, b.roomx * 5 + b.x, b.roomy * 5 + b.y);
	},

	// Sort arrays of x,y coords by comparing distance between the player
	points: function (a, b) {
		return getDistance(me, a[0], a[1]) - getDistance(me, b[0], b[1]);
	},

	numbers: function (a, b) {
		return a - b;
	}
};

var Experience = {
	totalExp: [0, 0, 500, 1500, 3750, 7875, 14175, 22680, 32886, 44396, 57715, 72144, 90180, 112725, 140906, 176132, 220165, 275207, 344008, 430010, 537513, 671891, 839864, 1049830, 1312287, 1640359, 2050449, 2563061, 3203826, 3902260, 4663553, 5493363, 6397855, 7383752, 8458379, 9629723, 10906488, 12298162, 13815086, 15468534, 17270791, 19235252, 21376515, 23710491, 26254525, 29027522, 32050088, 35344686, 38935798, 42850109, 47116709, 51767302, 56836449, 62361819, 68384473, 74949165, 82104680, 89904191, 98405658, 107672256, 117772849, 128782495, 140783010, 153863570, 168121381, 183662396, 200602101, 219066380, 239192444, 261129853, 285041630, 311105466, 339515048, 370481492, 404234916, 441026148, 481128591, 524840254, 572485967, 624419793, 681027665, 742730244, 809986056, 883294891, 963201521, 1050299747, 1145236814, 1248718217, 1361512946, 1484459201, 1618470619, 1764543065, 1923762030, 2097310703, 2286478756, 2492671933, 2717422497, 2962400612, 3229426756, 3520485254, 0, 0],
	nextExp: [0, 500, 1000, 2250, 4125, 6300, 8505, 10206, 11510, 13319, 14429, 18036, 22545, 28181, 35226, 44033, 55042, 68801, 86002, 107503, 134378, 167973, 209966, 262457, 328072, 410090, 512612, 640765, 698434, 761293, 829810, 904492, 985897, 1074627, 1171344, 1276765, 1391674, 1516924, 1653448, 1802257, 1964461, 2141263, 2333976, 2544034, 2772997, 3022566, 3294598, 3591112, 3914311, 4266600, 4650593, 5069147, 5525370, 6022654, 6564692, 7155515, 7799511, 8501467, 9266598, 10100593, 11009646, 12000515, 13080560, 14257811, 15541015, 16939705, 18464279, 20126064, 21937409, 23911777, 26063836, 28409582, 30966444, 33753424, 36791232, 40102443, 43711663, 47645713, 51933826, 56607872, 61702579, 67255812, 73308835, 79906630, 87098226, 94937067, 103481403, 112794729, 122946255, 134011418, 146072446, 159218965, 173548673, 189168053, 206193177, 224750564, 244978115, 267026144, 291058498, 0, 0],
	expCurve: [13, 16, 110, 159, 207, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 225, 174, 92, 38, 5],
	expPenalty: [1024, 976, 928, 880, 832, 784, 736, 688, 640, 592, 544, 496, 448, 400, 352, 304, 256, 192, 144, 108, 81, 61, 46, 35, 26, 20, 15, 11, 8, 6, 5],
	monsterExp: [
		[1, 1, 1], [30, 78, 117], [40, 104, 156], [50, 131, 197], [60, 156, 234], [70, 182, 273], [80, 207, 311], [90, 234, 351], [100, 260, 390], [110, 285, 428], [120, 312, 468],
		[130, 338, 507], [140, 363, 545], [154, 401, 602], [169, 440, 660], [186, 482, 723], [205, 533, 800], [225, 584, 876], [248, 644, 966], [273, 708, 1062], [300, 779, 1169],
		[330, 857, 1286], [363, 942, 1413], [399, 1035, 1553], [439, 1139, 1709], [470, 1220, 1830], [503, 1305, 1958], [538, 1397, 2096], [576, 1494, 2241], [616, 1598, 2397],
		[659, 1709, 2564], [706, 1832, 2748], [755, 1958, 2937], [808, 2097, 3146], [864, 2241, 3362], [925, 2399, 3599], [990, 2568, 3852], [1059, 2745, 4118], [1133, 2939, 4409],
		[1212, 3144, 4716], [1297, 3365, 5048], [1388, 3600, 5400], [1485, 3852, 5778], [1589, 4121, 6182], [1693, 4409, 6614], [1797, 4718, 7077], [1901, 5051, 7577],
		[2005, 5402, 8103], [2109, 5783, 8675], [2213, 6186, 9279], [2317, 6618, 9927], [2421, 7080, 10620], [2525, 7506, 11259], [2629, 7956, 11934], [2733, 8435, 12653],
		[2837, 8942, 13413], [2941, 9477, 14216], [3045, 10044, 15066], [3149, 10647, 15971], [3253, 11286, 16929], [3357, 11964, 17946], [3461, 12680, 19020],
		[3565, 13442, 20163], [3669, 14249, 21374], [3773, 15104, 22656], [3877, 16010, 24015], [3981, 16916, 25374], [4085, 17822, 26733], [4189, 18728, 28092],
		[4293, 19634, 29451], [4397, 20540, 30810], [4501, 21446, 32169], [4605, 22352, 33528], [4709, 23258, 34887], [4813, 24164, 36246], [4917, 25070, 37605],
		[5021, 25976, 38964], [5125, 26882, 40323], [5229, 27788, 41682], [5333, 28694, 43041], [5437, 29600, 44400], [5541, 30506, 45759], [5645, 31412, 47118],
		[5749, 32318, 48477], [5853, 33224, 49836], [5957, 34130, 51195], [6061, 35036, 52554], [6165, 35942, 53913], [6269, 36848, 55272], [6373, 37754, 56631],
		[6477, 38660, 57990], [6581, 39566, 59349], [6685, 40472, 60708], [6789, 41378, 62067], [6893, 42284, 63426], [6997, 43190, 64785], [7101, 44096, 66144],
		[7205, 45002, 67503], [7309, 45908, 68862], [7413, 46814, 70221], [7517, 47720, 71580], [7621, 48626, 72939], [7725, 49532, 74298], [7829, 50438, 75657],
		[7933, 51344, 77016], [8037, 52250, 78375], [8141, 53156, 79734], [8245, 54062, 81093], [8349, 54968, 82452], [8453, 55874, 83811], [160000, 160000, 160000]
	],
	// Percent progress into the current level. Format: xx.xx%
	progress: function () {
		return me.getStat(12) === 99 ? 0 : (((me.getStat(13) - this.totalExp[me.getStat(12)]) / this.nextExp[me.getStat(12)]) * 100).toFixed(2);
	},

	// Total experience gained in current run
	gain: function () {
		return (me.getStat(13) - DataFile.getStats().experience);
	},

	// Percent experience gained in current run
	gainPercent: function () {
		return me.getStat(12) === 99 ? 0 : (this.gain() * 100 / this.nextExp[me.getStat(12)]).toFixed(6);
	},

	// Runs until next level
	runsToLevel: function () {
		return Math.round(((100 - this.progress()) / 100) * this.nextExp[me.getStat(12)] / this.gain());
	},

	// Total runs needed for next level (not counting current progress)
	totalRunsToLevel: function () {
		return Math.round(this.nextExp[me.getStat(12)] / this.gain());
	},

	// Total time till next level
	timeToLevel: function () {
		var tTLrawSeconds = (Math.floor((getTickCount() - me.gamestarttime) / 1000)).toString(),
			tTLrawtimeToLevel = this.runsToLevel() * tTLrawSeconds,
			tTLDays = Math.floor(tTLrawtimeToLevel / 86400),
			tTLHours = Math.floor((tTLrawtimeToLevel % 86400) / 3600),
			tTLMinutes = Math.floor(((tTLrawtimeToLevel % 86400) % 3600) / 60),
			tTLSeconds = ((tTLrawtimeToLevel % 86400) % 3600) % 60;

		//return tDays + "d " + tTLHours + "h " + tTLMinutes + "m " + tTLSeconds + "s";
		//return tTLDays + "d " + tTLHours + "h " + tTLMinutes + "m";
		return (tTLDays ? tTLDays + " d " : "") + (tTLHours ? tTLHours + " h " : "") + (tTLMinutes ? tTLMinutes + " m" : "");
	},

	// Get Game Time
	getGameTime: function () {
		var rawMinutes = Math.floor((getTickCount() - me.gamestarttime) / 60000).toString(),
			rawSeconds = (Math.floor((getTickCount() - me.gamestarttime) / 1000) % 60).toString();

		if (rawMinutes <= 9) {
			rawMinutes = "0" + rawMinutes;
		}

		if (rawSeconds <= 9) {
			rawSeconds = "0" + rawSeconds;
		}

		//return rawMinutes + "m " + rawSeconds + "s";
		return " (" + rawMinutes + ":" + rawSeconds + ")";
	},

	// Log to manager
	log: function () {
		var string,
			gain = this.gain(),
			progress = this.progress(),
			runsToLevel = this.runsToLevel(),
			totalRunsToLevel = this.totalRunsToLevel(),
			getGameTime = this.getGameTime(),
			timeToLevel = this.timeToLevel();

		//string = "[Game: " + me.gamename + (me.gamepassword ? "//" + me.gamepassword : "") + getGameTime + "] [Level: " + me.getStat(12) + " (" + progress + "%)] [XP: " + gain + "] [Games ETA: " + runsToLevel + "] [Time ETA: " + timeToLevel + "]";
		string = "[Game: " + me.gamename + (me.gamepassword ? "//" + me.gamepassword : "") + getGameTime + "] [Level: " + me.getStat(12) + " (" + progress + "%)] [XP: " + gain + "] [Games ETA: " + runsToLevel + "]";

		if (gain) {
			D2Bot.printToConsole(string, 4);

			if (me.getStat(12) > DataFile.getStats().level) {
				D2Bot.printToConsole("Congrats! You gained a level. Current level:" + me.getStat(12), 5);
			}
		}
	}
};

var Packet = {
	openMenu: function (unit) {
		if (unit.type !== 1) {
			throw new Error("openMenu: Must be used on NPCs.");
		}

		if (getUIFlag(0x08)) {
			return true;
		}

		var i, tick;

		for (i = 0; i < 5; i += 1) {
			if (getDistance(me, unit) > 4) {
				Pather.moveToUnit(unit);
			}

			sendPacket(1, 0x13, 4, 1, 4, unit.gid);
			tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUIFlag(0x08)) {
					delay(Math.max(500, me.ping * 2));

					return true;
				}

				if (getInteractedNPC() && getTickCount() - tick > 1000) {
					me.cancel();
				}

				delay(100);
			}

			sendPacket(1, 0x2f, 4, 1, 4, unit.gid);
			delay(me.ping * 2);
			sendPacket(1, 0x30, 4, 1, 4, unit.gid);
			delay(me.ping * 2);
			this.flash(me.gid);
		}

		return false;
	},

	startTrade: function (unit, mode) {
		if (unit.type !== 1) {
			throw new Error("Unit.startTrade: Must be used on NPCs.");
		}

		if (getUIFlag(0x0C)) {
			return true;
		}

		var i,
			gamble = mode === "Gamble";

		if (this.openMenu(unit)) {
			for (i = 0; i < 10; i += 1) {
				delay(200);

				if (i % 2 === 0) {
					sendPacket(1, 0x38, 4, gamble ? 2 : 1, 4, unit.gid, 4, 0);
				}

				if (unit.itemcount > 0) {
					delay(200);

					return true;
				}
			}
		}

		return false;
	},

	buyItem: function (unit, shiftBuy, gamble) {
		var i, tick,
			oldGold = me.getStat(14) + me.getStat(15),
			itemCount = me.itemcount,
			npc = getInteractedNPC();

		if (!npc) {
			throw new Error("buyItem: No NPC menu open.");
		}

		if (me.getStat(14) + me.getStat(15) < unit.getItemCost(0)) { // Can we afford the item?
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			sendPacket(1, 0x32, 4, npc.gid, 4, unit.gid, 4, shiftBuy ? 0x80000000 : gamble ? 0x2 : 0x0, 4, 0);

			tick = getTickCount();

			while (getTickCount() - tick < Math.max(2000, me.ping * 2 + 500)) {
				if (shiftBuy && me.getStat(14) + me.getStat(15) < oldGold) {
					return true;
				}

				if (itemCount !== me.itemcount) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	sellItem: function (unit) {
		if (unit.type !== 4) { // Check if it's an item we want to buy
			throw new Error("Unit.sell: Must be used on items.");
		}

		var i, tick, npc,
			itemCount = me.itemcount;

		npc = getInteractedNPC();

		if (!npc) {
			return false;
		}

		for (i = 0; i < 5; i += 1) {
			sendPacket(1, 0x33, 4, npc.gid, 4, unit.gid, 4, 0, 4, 0);

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (me.itemcount !== itemCount) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	identifyItem: function (unit, tome) {
		var i, tick;

		if (!unit || unit.getFlag(0x10)) {
			return false;
		}

CursorLoop:
		for (i = 0; i < 3; i += 1) {
			sendPacket(1, 0x27, 4, unit.gid, 4, tome.gid);

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (getCursorType() === 6) {
					break CursorLoop;
				}

				delay(10);
			}
		}

		if (getCursorType() !== 6) {
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			if (getCursorType() === 6) {
				sendPacket(1, 0x27, 4, unit.gid, 4, tome.gid);
			}

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				if (unit.getFlag(0x10)) {
					delay(50);

					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	itemToCursor: function (item) {
		var i, tick;

		if (me.itemoncursor) { // Something already on cursor
			if (getUnit(100).gid === item.gid) { // Return true if the item is already on cursor
				return true;
			}

			this.dropItem(getUnit(100)); // If another item is on cursor, drop it
		}

		for (i = 0; i < 15; i += 1) {
			if (item.mode === 1) { // equipped
				sendPacket(1, 0x1c, 2, item.bodylocation);
			} else {
				sendPacket(1, 0x19, 4, item.gid);
			}

			tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (me.itemoncursor) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	dropItem: function (item) {
		var i, tick;

		if (!this.itemToCursor(item)) {
			return false;
		}

		for (i = 0; i < 15; i += 1) {
			sendPacket(1, 0x17, 4, item.gid);

			tick = getTickCount();

			while (getTickCount() - tick < Math.max(500, me.ping * 2 + 200)) {
				if (!me.itemoncursor) {
					return true;
				}

				delay(10);
			}
		}

		return false;
	},

	castSkill: function (hand, wX, wY) {
		hand = (hand === 0) ? 0x0c : 0x05;
		sendPacket(1, hand, 2, wX, 2, wY);
	},

	unitCast: function (hand, who) {
		hand = (hand === 0) ? 0x11 : 0x0a;
		sendPacket(1, hand, 4, who.type, 4, who.gid);
	},

	moveNPC: function (npc, dwX, dwY) { // commented the patched packet
		//sendPacket(1, 0x59, 4, npc.type, 4, npc.gid, 4, dwX, 4, dwY);
	},

	teleWalk: function (x, y, maxDist) {
		var i;

		if (maxDist === undefined) {
			maxDist = 5;
		}

		if (!this.telewalkTick) {
			this.telewalkTick = 0;
		}

		if (getDistance(me, x, y) > 10 && getTickCount() - this.telewalkTick > 3000 && Attack.validSpot(x, y)) {
			for (i = 0; i < 5; i += 1) {
				sendPacket(1, 0x5f, 2, x + rand(-1, 1), 2, y + rand(-1, 1));
				delay(me.ping + 1);
				sendPacket(1, 0x4b, 4, me.type, 4, me.gid);
				delay(me.ping + 1);

				if (getDistance(me, x, y) < maxDist) {
					delay(200);

					return true;
				}
			}

			this.telewalkTick = getTickCount();
		}

		return false;
	},

	flash: function (gid, wait = 300 + 2 * me.ping) {
		sendPacket(1, 0x4b, 4, 0, 4, gid);

		if (wait > 0) {
			delay(wait);
		}
	},

	changeStat: function (stat, value) {
		if (value > 0) {
			getPacket(1, 0x1d, 1, stat, 1, value);
		}
	},

	addListener: function (packetType, callback) { // specialized wrapper for addEventListener
		if (typeof packetType === 'number')
			packetType = [packetType];

		if (typeof packetType === 'object' && packetType.length) {
			addEventListener('gamepacket', packet => (packetType.indexOf(packet[0]) > -1 ? callback(packet) : false));

			return callback;
		}

		return null;
	},

	removeListener: callback => removeEventListener('gamepacket', callback), // just a wrapper
};

/*

new PacketBuilder() - create new packet object

Example (Spoof 'reassign player' packet to client):
	new PacketBuilder().byte(0x15).byte(0).dword(me.gid).word(x).word(y).byte(1).get();

Example (Spoof 'player move' packet to server):
	new PacketBuilder().byte(0x3).word(x).word(y).send();
*/

function PacketBuilder () {
	/* globals DataView ArrayBuffer */
	if (this.__proto__.constructor !== PacketBuilder) {
		throw new Error("PacketBuilder must be called with 'new' operator!");
	}

	let queue = [], count = 0;

	let enqueue = (type, size) => (...args) => { // accepts any number of arguments
		args.forEach(arg => {
			if (type === 'String') {
				arg = stringToEUC(arg);
				size = arg.length + 1;
			}

			queue.push({type: type, size: size, data: arg});
			count += size;
		});

		return this;
	};

	this.float = enqueue("Float32", 4);
	this.dword = enqueue("Uint32", 4);
	this.word = enqueue("Uint16", 2);
	this.byte = enqueue("Uint8", 1);
	this.string = enqueue("String");

	this.buildDataView = () => {
		let dv = new DataView(new ArrayBuffer(count)), i = 0;
		queue.forEach(field => {
			if (field.type === "String") {
				for (let l = 0; l < field.data.length; l++) {
					dv.setUint8(i++, field.data.charCodeAt(l), true);
				}

				i += field.size - field.data.length; // fix index for field.size !== field.data.length
			} else {
				dv['set' + field.type](i, field.data, true);
				i += field.size;
			}
		});

		return dv;
	};

	this.send = () => (sendPacket(this.buildDataView().buffer), this);
	this.spoof = () => (getPacket(this.buildDataView().buffer), this);
	this.get = this.spoof; // same thing but spoof has clearer intent than get
};

var LocalChat = new function () {
	const LOCAL_CHAT_ID = 0xD2BAAAA;
	let toggle, proxy = say;

	let relay = (msg) => D2Bot.shoutGlobal(JSON.stringify({ msg: msg, realm: me.realm, charname: me.charname, gamename: me.gamename }), LOCAL_CHAT_ID);

	let onChatInput = (speaker, msg) => {
		relay(msg);
		return true;
	};

	let onChatRecv = (mode, msg) => {
		if (mode !== LOCAL_CHAT_ID) {
			return;
		}

		msg = JSON.parse(msg);

		if (me.gamename === msg.gamename && me.realm === msg.realm) {
			new PacketBuilder().byte(38).byte(1, me.locale).word(2, 0, 0).byte(90).string(msg.charname, msg.msg).get();
		}
	};

	let onKeyEvent = (key) => {
		if (toggle === key) {
			this.init(true);
		}
	};

	this.init = (cycle = false) => {
		if (!Config.LocalChat.Enabled) {
			return;
		}

		Config.LocalChat.Mode = (Config.LocalChat.Mode + cycle) % 3;
		print("ÿc2LocalChat enabled. Mode: " + Config.LocalChat.Mode);

		switch (Config.LocalChat.Mode) {
		case 2:
			removeEventListener("chatinputblocker", onChatInput);
			addEventListener("chatinputblocker", onChatInput);
		case 1:
			removeEventListener("copydata", onChatRecv);
			addEventListener("copydata", onChatRecv);
			say = (msg, force = false) => force ? proxy(msg) : relay(msg);
			break;
		case 0:
			removeEventListener("chatinputblocker", onChatInput);
			removeEventListener("copydata", onChatRecv);
			say = proxy;
			break;
		}

		if (Config.LocalChat.Toggle) {
			toggle = typeof Config.LocalChat.Toggle === 'string' ? Config.LocalChat.Toggle.charCodeAt(0) : Config.LocalChat.Toggle;
			Config.LocalChat.Toggle = false;
			addEventListener("keyup", onKeyEvent);
		}
	};
};

var Messaging = {
	sendToScript: function (name, msg) {
		var script = getScript(name);

		if (script && script.running) {
			script.send(msg);

			return true;
		}

		return false;
	},

	sendToProfile: function (profileName, mode, message, getResponse) {
		var response;

		function copyDataEvent(mode2, msg) {
			if (mode2 === mode) {
				var obj;

				try {
					obj = JSON.parse(msg);
				} catch (e) {
					return false;
				}

				if (obj.hasOwnProperty("sender") && obj.sender === profileName) {
					response = Misc.copy(obj);
				}

				return true;
			}

			return false;
		}

		if (getResponse) {
			addEventListener("copydata", copyDataEvent);
		}

		if (!sendCopyData(null, profileName, mode, JSON.stringify({message: message, sender: me.profile}))) {
			//print("sendToProfile: failed to get response from " + profileName);

			if (getResponse) {
				removeEventListener("copydata", copyDataEvent);
			}

			return false;
		}

		if (getResponse) {
			delay(200);
			removeEventListener("copydata", copyDataEvent);

			if (!!response) {
				return response;
			}

			return false;
		}

		return true;
	}
};

var Events = {
	// gamepacket
	gamePacket: function (bytes) {
		var temp;

		switch (bytes[0]) {
		// Block movement after using TP/WP/Exit
		case 0x0D: // Player Stop
			// This can mess up death screen so disable for characters that are allowed to die
			if (Config.LifeChicken > 0) {
				return true;
			}

			break;
		// Block poison skills that might crash the client
		case 0x4C: // Cast skill on target
		case 0x4D: // Cast skill on coords
			temp = Number("0x" + bytes[7].toString(16) + bytes[6].toString(16));

			// Match Poison Javelin, Plague Javelin or Poison Nova
			if (temp && [15, 25, 92].indexOf(temp) > -1) {
				return true;
			}

			break;
		}

		return false;
	}
};