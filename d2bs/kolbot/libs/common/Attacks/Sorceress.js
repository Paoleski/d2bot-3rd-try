/**
*	@filename	Sorceress.js
*	@author		kolton
*	@desc		Sorceress attack sequence
*/

var ClassAttack = {
	// Fallen / fetish shamans — CB bolts often miss at stand-off
	shamanIds: [58, 59, 60, 61, 62, 278, 279, 280, 281, 282, 645, 646, 647, 662, 663, 664],

	isShaman: function (unit) {
		return !!(unit && this.shamanIds.indexOf(unit.classid) > -1);
	},

	// Cheap: only special-cases CB vs shaman under 18
	castRangeFor: function (skillId, unit) {
		if (skillId === 38 && me.charlvl < 18 && this.isShaman(unit)) {
			return 2; // melee hug — bolts connect
		}

		return Skill.getRange(skillId);
	},

	// PD2 Static Field: 25% of current life (lightning), only while HP above 55/70/85 (N/NM/H)
	getStaticFloor: function () {
		if (me.diff === 0) {
			return 55;
		}

		if (me.diff === 1) {
			return 70;
		}

		return 85; // Hell
	},

	// Stop casting Static at max(Config.CastStatic, PD2 floor) — never below the difficulty cap
	getStaticThreshold: function () {
		var floor, cfg;

		if (Config.CastStatic === false || Config.CastStatic >= 100) {
			return 100; // disabled
		}

		floor = this.getStaticFloor();
		cfg = Config.CastStatic;

		if (cfg === true || cfg === 0 || cfg === undefined || cfg === null) {
			return floor;
		}

		return Math.max(cfg, floor);
	},

	// Only Static act bosses + Izual (not Blood Raven / Smith / random uniques)
	staticBossIds: [156, 211, 242, 243, 544, 256], // Andy, Duriel, Meph, Diablo, Baal, Izual

	wantStaticTarget: function (unit) {
		var i, id, name;

		if (!unit) {
			return false;
		}

		if (this.staticBossIds.indexOf(unit.classid) > -1) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		if (name.indexOf("andariel") > -1 || name.indexOf("duriel") > -1 ||
				name.indexOf("mephisto") > -1 || name.indexOf("diablo") > -1 ||
				name.indexOf("baal") > -1 || name.indexOf("izual") > -1) {
			return true;
		}

		// Optional Config.StaticList still honored for extra names/ids (never spectype spam)
		if (!Config.StaticList || !Config.StaticList.length) {
			return false;
		}

		for (i = 0; i < Config.StaticList.length; i += 1) {
			id = Config.StaticList[i];

			switch (typeof id) {
			case "number":
				if (unit.classid === id) {
					return true;
				}

				break;
			case "string":
				if (name && name === id.toLowerCase()) {
					return true;
				}

				break;
			default:
				throw new Error("Bad Config.StaticList settings.");
			}
		}

		return false;
	},

	// Infector of Souls (Chaos seal / pit lords) — never walk onto him
	isInfector: function (unit) {
		var name;

		if (!unit) {
			return false;
		}

		if (unit.classid === 704) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		return name.indexOf("infector") > -1;
	},

	// Lord De Seis — same pull fight as Infector
	isSeis: function (unit) {
		var name;

		if (!unit) {
			return false;
		}

		if (unit.classid === 705) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		return name.indexOf("seis") > -1;
	},

	isSealPullBoss: function (unit) {
		return this.isInfector(unit) || this.isSeis(unit);
	},

	/*
		Infector / De Seis pull: HOLD the node — never walk closer.
		If ClassAttack._sealHoldX/Y set, force-TP back there (no walk).
	*/
	sealPullStandOff: function (unit) {
		var d;

		if (!unit || !Attack.checkMonster(unit)) {
			return false;
		}

		if (this._sealHoldX !== undefined && this._sealHoldY !== undefined) {
			if (getDistance(me, this._sealHoldX, this._sealHoldY) > 5) {
				if (typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
					Pather.forceTeleportTo(this._sealHoldX, this._sealHoldY, 4);
				}
			}

			return true;
		}

		d = getDistance(me, unit);

		// No hold coords — stay put; never walk toward him
		if (d < 8 && this.isSeis(unit) && typeof Pather.forceTeleportTo === "function" && Pather.canTeleport()) {
			Pather.forceTeleportTo(me.x, me.y + 12, 4);
		}

		return true;
	},

	// Back-compat alias
	infectorStandOff: function (unit) {
		return this.sealPullStandOff(unit);
	},

	infectorDance: function (unit) {
		if (!this.isSealPullBoss(unit) || !Attack.checkMonster(unit)) {
			return false;
		}

		this.sealPullStandOff(unit);

		// Own untimed skill only (doAttack already tried the timed one) — no hardcoded FN
		if (Config.AttackSkill[2] > 0 && Attack.canUseSkill(Config.AttackSkill[2]) &&
				Attack.checkMonster(unit) && getDistance(me, unit) <= this.castRangeFor(Config.AttackSkill[2], unit)) {
			Skill.cast(Config.AttackSkill[2], Skill.getHand(Config.AttackSkill[2]), unit);
		}

		if (getDistance(me, unit) < 7) {
			this.sealPullStandOff(unit);
		}

		return true;
	},

	// Diablo fight state — melee Static burst once, then AttackSkill from mid-range (merc tanks)
	_diabloBurstGid: 0,

	/*
		Normal: stand-off after Static (mid-range AttackSkill).
		NM/Hell: stay at 0 range on Diablo — his lightning hose misses when you hug him.
		1) Close into melee and Static ×4 (must stay inside Static radius each cast)
		2) Normal: walk back off his face (NEVER teleport — merc must keep aggro/tank)
		   NM/Hell: stay on his feet and cast from 0 range
		3) Spam this char's AttackSkill
	*/
	diabloStandOff: function (unit, minD, maxD) {
		var i, offsets, ox, oy, tx, ty, d, best, bestD, savedTele, aim;

		if (!unit || !Attack.checkMonster(unit)) {
			return false;
		}

		// NM/Hell: hug Diablo (lightning dodge) — ignore stand-off band
		if (me.diff > 0 && unit.classid === 243) {
			if (getDistance(me, unit) > 2 || checkCollision(me, unit, 0x4)) {
				savedTele = Pather.teleport;
				Pather.teleport = false;
				Pather.moveTo(unit.x, unit.y, 0);
				Pather.teleport = savedTele;
			}

			return true;
		}

		minD = (minD === undefined) ? 4 : minD;
		maxD = (maxD === undefined) ? 6 : maxD;
		aim = Math.round((minD + maxD) / 2);
		d = getDistance(me, unit);

		if (d >= minD && d <= maxD && !checkCollision(me, unit, 0x4)) {
			return true;
		}

		offsets = [
			[aim, 0], [-aim, 0], [0, aim], [0, -aim],
			[aim, aim], [aim, -aim], [-aim, aim], [-aim, -aim],
			[aim + 2, 1], [-(aim + 2), 1], [1, aim + 2], [1, -(aim + 2)]
		];
		best = null;
		bestD = 999;

		for (i = 0; i < offsets.length; i += 1) {
			tx = Math.round(unit.x + offsets[i][0]);
			ty = Math.round(unit.y + offsets[i][1]);

			if (!Attack.validSpot(tx, ty)) {
				continue;
			}

			d = getDistance(unit.x, unit.y, tx, ty);

			if (d < minD - 1 || d > maxD + 1) {
				continue;
			}

			ox = getDistance(me.x, me.y, tx, ty);

			if (ox < bestD) {
				bestD = ox;
				best = [tx, ty];
			}
		}

		if (!best) {
			ox = me.x - unit.x;
			oy = me.y - unit.y;
			d = Math.sqrt(ox * ox + oy * oy) || 1;
			best = [Math.round(unit.x + (ox / d) * aim), Math.round(unit.y + (oy / d) * aim)];
		}

		// Walk only — teleporting away resets merc tank / Diablo target
		savedTele = Pather.teleport;
		Pather.teleport = false;
		Pather.moveTo(best[0], best[1], 2);
		Pather.teleport = savedTele;

		return true;
	},

	// Keep old name for any callers; mid-range stand-off (FN band, not far star kite)
	diabloKiteAway: function (unit) {
		return this.diabloStandOff(unit, 4, 6);
	},

	diabloMeleeStatic: function (unit, casts) {
		var i, staticRange, savedTele, closeRange;

		if (!unit || !me.getSkill(42, 1) || !Attack.checkResist(unit, "lightning")) {
			return false;
		}

		casts = casts || 4;
		staticRange = Math.max(2, Math.floor((me.getSkill(42, 1) + 4) * 2 / 3));
		closeRange = Math.min(staticRange, 3);
		savedTele = Pather.teleport;
		// Closing onto Diablo for Static may tele; standing off never does
		Pather.teleport = !!(me.getSkill(54, 1) || me.getStat(97, 54));

		for (i = 0; i < casts; i += 1) {
			if (!Attack.checkMonster(unit) || me.dead) {
				break;
			}

			// Static only hits inside its radius — stay in melee each cast
			if (getDistance(me, unit) > closeRange || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, closeRange, 0x4)) {
					Pather.moveToUnit(unit);
				}
			}

			if (getDistance(me, unit) > staticRange) {
				Pather.moveToUnit(unit);
			}

			delay(100 + me.ping);
			Skill.cast(42, 0);
			delay(280 + me.ping);
		}

		Pather.teleport = savedTele;

		return true;
	},

	// Boss skill for Diablo stand-off: use this char's AttackSkill (FN only until FO/etc. upgrades it)
	diabloPickSkill: function (unit) {
		var timed = Config.AttackSkill[1],
			untimed = Config.AttackSkill[2];

		if (timed > 0 && Attack.canUseSkill(timed) && Attack.checkResist(unit, timed) &&
				(!me.getState(121) || !Skill.isTimed(timed))) {
			return timed;
		}

		if (untimed > 0 && Attack.canUseSkill(untimed) && Attack.checkResist(unit, untimed)) {
			return untimed;
		}

		// No hardcoded fallback skill — only this build's configured AttackSkills
		if (timed > 0 && Attack.canUseSkill(timed) && Attack.checkResist(unit, timed)) {
			return timed;
		}

		return -1;
	},

	// Stand-off band for skill: FN close (4–6); longer skills ~6–12 off lightning face
	// NM/Hell: hug Diablo (0 range) — lightning hose dodge
	diabloSkillBand: function (skillId) {
		var range, minD, maxD;

		if (me.diff > 0) {
			return {min: 0, max: 2};
		}

		range = this.castRangeFor(skillId) || Skill.getRange(skillId) || 10;

		if (skillId === 44 || skillId === 48) {
			return {min: 4, max: Math.min(6, Math.max(4, range))};
		}

		minD = 6;
		maxD = Math.min(Math.max(range, 8), 14);

		if (maxD <= minD) {
			maxD = minD + 2;
		}

		return {min: minD, max: maxD};
	},

	diabloCastAtStandOff: function (unit, skillId) {
		var band, d, hand;

		if (!unit || skillId < 0 || !Attack.checkMonster(unit)) {
			return false;
		}

		band = this.diabloSkillBand(skillId);
		d = getDistance(me, unit);

		if (d < band.min || d > band.max || checkCollision(me, unit, 0x4)) {
			this.diabloStandOff(unit, band.min, band.max);
		}

		d = getDistance(me, unit);

		// Too far for short skills (FN) — nudge in; never hug (<3) on Normal only
		if (d > band.max + 1) {
			this.diabloStandOff(unit, band.min, band.max);
		}

		if (me.diff === 0 && d < 3) {
			this.diabloStandOff(unit, band.min, band.max);
		}

		if (!Attack.checkMonster(unit)) {
			return false;
		}

		hand = this.castHand(skillId);

		if (skillId === 44 || skillId === 48 || skillId === 42) {
			return Skill.cast(skillId, hand);
		}

		return Skill.cast(skillId, hand, unit);
	},

	diabloDance: function (unit) {
		var skillId, band;

		if (!unit || unit.classid !== 243 || !Attack.checkMonster(unit)) {
			return false;
		}

		// Opener once per Diablo gid: melee Static ×4 → then AttackSkill
		if (this._diabloBurstGid !== unit.gid) {
			this._diabloBurstGid = unit.gid;

			if (me.diff > 0) {
				print("ÿc2ClassAttackÿc0 :: Diablo — melee hug (lightning dodge) + Static×4 → AttackSkill");
			} else {
				print("ÿc2ClassAttackÿc0 :: Diablo — melee Static×4 → walk stand off → AttackSkill");
			}

			this.diabloMeleeStatic(unit, 4);

			skillId = this.diabloPickSkill(unit);

			if (skillId > 0) {
				band = this.diabloSkillBand(skillId);
				this.diabloStandOff(unit, band.min, band.max);
				this.diabloCastAtStandOff(unit, skillId);
			} else if (me.diff > 0) {
				this.diabloStandOff(unit, 0, 2);
			} else {
				this.diabloStandOff(unit, 6, 10);
			}

			return true;
		}

		// After opener: keep position, spam this build's boss skill
		skillId = this.diabloPickSkill(unit);

		if (skillId > 0) {
			this.diabloCastAtStandOff(unit, skillId);
		} else if (me.diff > 0) {
			this.diabloStandOff(unit, 0, 2);
		} else {
			band = {min: 6, max: 10};
			this.diabloStandOff(unit, band.min, band.max);
		}

		return true;
	},

	doAttack: function (unit, preattack) {
		if (Config.MercWatch && Town.needMerc()) {
			print("mercwatch");
			Town.visitTown();
		}

		if (!me.getState(30) && me.getSkill(58, 1)) {
			Skill.cast(58, 0);
		}

		if (preattack && Config.AttackSkill[0] > 0 && Attack.canUseSkill(Config.AttackSkill[0]) && Attack.checkResist(unit, Config.AttackSkill[0]) && (!me.getState(121) || !Skill.isTimed(Config.AttackSkill[0]))) {
			if (Math.round(getDistance(me, unit)) > Skill.getRange(Config.AttackSkill[0]) || checkCollision(me, unit, 0x4)) {
				if (!Attack.getIntoPosition(unit, Skill.getRange(Config.AttackSkill[0]), 0x4)) {
					return false;
				}
			}

			Skill.cast(Config.AttackSkill[0], Skill.getHand(Config.AttackSkill[0]), unit);

			return true;
		}

		var index, staticRange, staticThresh, checkSkill,
			timedSkill = -1,
			untimedSkill = -1,
			timedImmune = false,
			untimedImmune = false;

		// Once Fire Ball is learned, prefer it over Fire Bolt
		if (me.getSkill(47, 1)) {
			if (Config.AttackSkill[1] === 36) {
				Config.AttackSkill[1] = 47;
			}

			if (Config.AttackSkill[3] === 36) {
				Config.AttackSkill[3] = 47;
			}
		}

		// Light leveling: staff/soft Fire Bolt until hard Charged Bolt is spent
		if (me.getSkill(38, 0) > 0) {
			if (Config.AttackSkill[1] === 36) {
				Config.AttackSkill[1] = 38;
			}

			if (Config.AttackSkill[3] === 36) {
				Config.AttackSkill[3] = 38;
			}
		}

		// After Act 3 NM Akara respec: Lightning invested over Charged Bolt → use Lightning
		if ((me.getSkill(49, 0) || 0) > (me.getSkill(38, 0) || 0)) {
			if ([36, 38].indexOf(Config.AttackSkill[1]) > -1) {
				Config.AttackSkill[1] = 49;
			}

			if ([36, 38].indexOf(Config.AttackSkill[3]) > -1) {
				Config.AttackSkill[3] = 49;
			}
		}

		// Cold leveling: Ice Bolt → Frost Nova → Frozen Orb
		if (me.getSkill(44, 0) > 0) {
			if ([36, 39].indexOf(Config.AttackSkill[1]) > -1) {
				Config.AttackSkill[1] = 44;
			}

			if ([36, 39].indexOf(Config.AttackSkill[3]) > -1) {
				Config.AttackSkill[3] = 44;
			}
		}

		if (me.getSkill(64, 0) > 0) {
			if ([36, 39, 44].indexOf(Config.AttackSkill[1]) > -1) {
				Config.AttackSkill[1] = 64;

				if (Config.AttackSkill[2] < 0) {
					Config.AttackSkill[2] = 44; // Frost Nova while FO on cooldown
				}
			}

			if ([36, 39, 44].indexOf(Config.AttackSkill[3]) > -1) {
				Config.AttackSkill[3] = 64;

				if (Config.AttackSkill[4] < 0) {
					Config.AttackSkill[4] = 44;
				}
			}
		}

		// Diablo: melee Static×4 → walk stand-off → this build's AttackSkill (owns fight)
		if (unit && unit.classid === 243) {
			this.diabloDance(unit);

			return true;
		}

		if (unit && this.isSealPullBoss(unit)) {
			// Infector / De Seis: hold pull, merc tanks — never move onto them
			this.infectorDance(unit);
		} else {
			// Static Field — PD2: 25% current life while above 55/70/85% (N/NM/H); bosses by default
			staticThresh = this.getStaticThreshold();

			if (staticThresh < 100 && me.getSkill(42, 1) && Attack.checkResist(unit, "lightning") &&
					this.wantStaticTarget(unit) && Math.round(unit.hp * 100 / unit.hpmax) > staticThresh) {
				staticRange = Math.floor((me.getSkill(42, 1) + 4) * 2 / 3);

				while (!me.dead && Math.round(unit.hp * 100 / unit.hpmax) > staticThresh && Attack.checkMonster(unit)) {
					if (getDistance(me, unit) > staticRange || checkCollision(me, unit, 0x4)) {
						if (!Attack.getIntoPosition(unit, staticRange, 0x4)) {
							return false;
						}
					}

					if (!Skill.cast(42, 0)) {
						break;
					}
				}
			}
		}

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		// Timed / primary
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.canUseSkill(checkSkill) && ([56, 59, 64].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			if (Attack.checkResist(unit, checkSkill)) {
				timedSkill = checkSkill;
			} else {
				timedImmune = true; // owned skill exists but monster is immune to it
			}
		}

		if (timedSkill < 0 && Config.AttackSkill[5] > 0 && Attack.canUseSkill(Config.AttackSkill[5]) && ([56, 59, 64].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			if (Attack.checkResist(unit, Config.AttackSkill[5])) {
				timedSkill = Config.AttackSkill[5];
			} else {
				timedImmune = true;
			}
		}

		// Untimed / alternate
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[1];
		} else {
			checkSkill = Config.AttackSkill[index + 1];
		}

		if (Attack.canUseSkill(checkSkill) && ([56, 59, 64].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			if (Attack.checkResist(unit, checkSkill)) {
				untimedSkill = checkSkill;
			} else {
				untimedImmune = true;
			}
		}

		if (untimedSkill < 0 && Config.AttackSkill[6] > 0 && Attack.canUseSkill(Config.AttackSkill[6]) && ([56, 59, 64].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			if (Attack.checkResist(unit, Config.AttackSkill[6])) {
				untimedSkill = Config.AttackSkill[6];
			} else {
				untimedImmune = true;
			}
		}

		// Out of mana → normal attack on RMB (always through lvl 12 / LowManaSkill[0]===0).
		// me.mp === 0 also counts at <=7: getManaCost can under-report staff soft skills.
		if (timedSkill > 0 && (Skill.getManaCost(timedSkill) > me.mp || (me.charlvl <= 7 && me.mp === 0))) {
			if (me.charlvl <= 12 || Config.LowManaSkill[0] === 0) {
				timedSkill = 0;
				untimedSkill = -1;
			} else if (Config.LowManaSkill[0] > 0 && Attack.canUseSkill(Config.LowManaSkill[0]) && Attack.checkResist(unit, Config.LowManaSkill[0])) {
				timedSkill = Config.LowManaSkill[0];
				untimedSkill = -1;
			}
		}

		if (untimedSkill > 0 && (Skill.getManaCost(untimedSkill) > me.mp || (me.charlvl <= 7 && me.mp === 0)) &&
				(timedSkill <= 0 || Skill.getManaCost(timedSkill) > me.mp)) {
			if (me.charlvl <= 12 || Config.LowManaSkill[0] === 0 || Config.LowManaSkill[1] === 0) {
				timedSkill = 0;
				untimedSkill = -1;
			} else if (Config.LowManaSkill[1] > 0 && Attack.canUseSkill(Config.LowManaSkill[1]) && Attack.checkResist(unit, Config.LowManaSkill[1])) {
				untimedSkill = Config.LowManaSkill[1];
			}
		}

		// No usable configured spell → soft/staff Fire Bolt, else normal attack on RMB.
		// Never normal-attack (RMB) a target that's simply immune to our owned
		// skills — leave both slots unset (doCast → 2 / TeleStomp gate) so the
		// merc handles it instead.
		// Exception: no merc yet (early leveling, pre-hire ~clvl 12) — nobody else
		// can pick up the slack, so normal attack is still better than nothing.
		if (timedSkill < 0 && untimedSkill < 0) {
			if (Attack.canUseSkill(36) && Attack.checkResist(unit, 36)) {
				timedSkill = 36;
				untimedSkill = -1;
			} else if ((!timedImmune && !untimedImmune) || !me.getMerc()) {
				timedSkill = 0;
				untimedSkill = -1;
			}
		} else if (timedSkill < 0 && untimedSkill === 0) {
			timedSkill = 0;
			untimedSkill = -1;
		} else if (timedSkill === 0) {
			untimedSkill = -1;
		}

		// Diablo / Infector / De Seis: use this build's configured skills only — no hardcoded FN override

		switch (this.doCast(unit, timedSkill, untimedSkill)) {
		case 0: // Fail
			break;
		case 1: // Success
			return true;
		case 2: // Try to telestomp
			// Diablo / Infector — never sit on them via TeleStomp
			if (unit && unit.classid === 243) {
				this.diabloDance(unit);

				return true;
			}

			if (unit && this.isSealPullBoss(unit)) {
				this.infectorDance(unit);

				return true;
			}

			if (Config.TeleStomp && Attack.checkResist(unit, "physical") && !!me.getMerc() && Attack.validSpot(unit.x, unit.y)) {
				while (Attack.checkMonster(unit)) {
					if (getDistance(me, unit) > 3) {
						Pather.moveToUnit(unit);
					}

					this.doCast(unit, Config.AttackSkill[1], Config.AttackSkill[2]);
				}

				return true;
			}

			break;
		}

		// Couldn't attack
		return false;
	},

	afterAttack: function () {
		Precast.doPrecast(false);
	},

	/** Hand for casting: skill 0 = right-click (0); others use Skill.getHand. */
	castHand: function (skillId) {
		if (skillId === 0) {
			return 0; // RMB — Normal Attack on right skill slot
		}

		return Skill.getHand(skillId);
	},

	// Returns: 0 - fail, 1 - success, 2 - no valid attack skills
	doCast: function (unit, timedSkill, untimedSkill) {
		var i, walk, hand, range, needRange;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
			range = this.castRangeFor(timedSkill, unit);

			// Diablo NM/Hell: hug at 0 range (lightning dodge) — do not kite away
			if (unit && unit.classid === 243 && me.diff > 0) {
				if (getDistance(me, unit) > 2 || checkCollision(me, unit, 0x4)) {
					walk = true;

					if (!Attack.getIntoPosition(unit, 0, 0x4, walk)) {
						return 0;
					}
				}
			// Diablo Normal: keep breath distance except FN (cast then kite) / Static opener
			} else if (unit && unit.classid === 243 && timedSkill !== 44 && timedSkill !== 42) {
				// Short skills (CB etc.) stand ~8; longer skills keep ~12
				needRange = Math.max(range, range <= 7 ? 8 : 12);

				if (getDistance(me, unit) < 8) {
					this.diabloKiteAway(unit);
				}

				if (getDistance(me, unit) > needRange || checkCollision(me, unit, 0x4)) {
					// Walk only — tele onto/away from Diablo drops merc tank
					walk = true;

					if (!Attack.getIntoPosition(unit, needRange, 0x4, walk)) {
						return 0;
					}
				}

				if (getDistance(me, unit) < 8) {
					this.diabloKiteAway(unit);
				}
			} else if (unit && this.isSealPullBoss(unit)) {
				// Hold pull node — never getIntoPosition toward seal bosses.
				// Out of range / no LOS → 0 (real fail) so getBoss can approachBoss(); was a fake 1 that never cast.
				this.sealPullStandOff(unit);

				if (getDistance(me, unit) > range || checkCollision(me, unit, 0x4)) {
					delay(100);
					return 0;
				}
			} else if (timedSkill !== 0 && range < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			} else if (Math.round(getDistance(me, unit)) > range || checkCollision(me, unit, 0x4)) {
				// Skill 0 (OOM RMB): always walk in from bolt range — dist<12 gate never fired
				// while casting FB at 15–20, so getIntoPosition failed and never Skill.cast(0).
				walk = timedSkill === 0 || (range < 4 && getDistance(me, unit) < 20 && !checkCollision(me, unit, 0x1));

				if (!Attack.getIntoPosition(unit, range, 0x4, walk)) {
					if (timedSkill === 0) {
						Pather.walkTo(unit.x, unit.y, 3);
					} else {
						return 0;
					}
				}
			}

			if (!unit.dead) {
				hand = this.castHand(timedSkill);

				// Spells: skip if still line-blocked. Melee / normal attack: always swing after move.
				if (timedSkill === 0 || !checkCollision(me, unit, 0x4)) {
					if (!Skill.cast(timedSkill, hand, unit)) {
						// Spell cast failed OOM mid-swing — fall back to RMB Attack early
						if (timedSkill > 0 && me.charlvl <= 12 && Skill.getManaCost(timedSkill) > me.mp) {
							if (getDistance(me, unit) > 3) {
								Pather.walkTo(unit.x, unit.y, 3);
							}

							if (!Skill.cast(0, this.castHand(0), unit)) {
								return 0;
							}
						} else {
							return 0;
						}
					}

					// Frost Nova on Diablo — back out immediately after (Normal only; NM/Hell hugs)
					if (unit.classid === 243 && timedSkill === 44 && me.diff === 0) {
						this.diabloKiteAway(unit);
					}

					if (this.isSealPullBoss(unit) && timedSkill === 44 && getDistance(me, unit) < 7) {
						this.sealPullStandOff(unit);
					}
				} else {
					return 0;
				}
			}

			return 1;
		}

		if (untimedSkill > -1) {
			range = this.castRangeFor(untimedSkill, unit);

			if (unit && unit.classid === 243 && me.diff > 0) {
				if (getDistance(me, unit) > 2 || checkCollision(me, unit, 0x4)) {
					walk = true;

					if (!Attack.getIntoPosition(unit, 0, 0x4, walk)) {
						return 0;
					}
				}
			} else if (unit && unit.classid === 243 && untimedSkill !== 44 && untimedSkill !== 42) {
				needRange = Math.max(range, range <= 7 ? 8 : 12);

				if (getDistance(me, unit) < 8) {
					this.diabloKiteAway(unit);
				}

				if (getDistance(me, unit) > needRange || checkCollision(me, unit, 0x4)) {
					walk = true;

					if (!Attack.getIntoPosition(unit, needRange, 0x4, walk)) {
						return 0;
					}
				}

				if (getDistance(me, unit) < 8) {
					this.diabloKiteAway(unit);
				}
			} else if (unit && this.isSealPullBoss(unit)) {
				this.sealPullStandOff(unit);

				if (getDistance(me, unit) > range || checkCollision(me, unit, 0x4)) {
					delay(100);
					return 0;
				}
			} else if (untimedSkill !== 0 && range < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			} else if (Math.round(getDistance(me, unit)) > range || checkCollision(me, unit, 0x4)) {
				walk = untimedSkill === 0 || (range < 4 && getDistance(me, unit) < 20 && !checkCollision(me, unit, 0x1));

				if (!Attack.getIntoPosition(unit, range, 0x4, walk)) {
					if (untimedSkill === 0) {
						Pather.walkTo(unit.x, unit.y, 3);
					} else {
						return 0;
					}
				}
			}

			if (!unit.dead) {
				hand = this.castHand(untimedSkill);

				if (!Skill.cast(untimedSkill, hand, unit)) {
					if (untimedSkill > 0 && me.charlvl <= 12 && Skill.getManaCost(untimedSkill) > me.mp) {
						if (getDistance(me, unit) > 3) {
							Pather.walkTo(unit.x, unit.y, 3);
						}

						if (!Skill.cast(0, this.castHand(0), unit)) {
							return 0;
						}
					} else {
						return 0;
					}
				}

				if (unit.classid === 243 && untimedSkill === 44 && me.diff === 0) {
					this.diabloKiteAway(unit);
				}

				if (this.isSealPullBoss(unit) && untimedSkill === 44 && getDistance(me, unit) < 7) {
					this.sealPullStandOff(unit);
				}
			}

			return 1;
		}

		for (i = 0; i < 25; i += 1) {
			if (!me.getState(121)) {
				break;
			}

			delay(40);
		}

		return 1;
	}
};
