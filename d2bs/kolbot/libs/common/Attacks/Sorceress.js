/**
*	@filename	Sorceress.js
*	@author		kolton
*	@desc		Sorceress attack sequence
*/

var ClassAttack = {
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

		var index, staticRange, checkSkill,
			timedSkill = -1,
			untimedSkill = -1;

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

		// Static
		if (Config.CastStatic < 100 && me.getSkill(42, 1) && Attack.checkResist(unit, "lightning") && Config.StaticList.some(
				function (id) {
					if (unit) {
						switch (typeof id) {
						case "number":
							if (unit.classid && unit.classid === id) {
								return true;
							}

							break;
						case "string":
							if (unit.name && unit.name.toLowerCase() === id.toLowerCase()) {
								return true;
							}

							break;
						default:
							throw new Error("Bad Config.StaticList settings.");
						}
					}

					return false;
				}
			) && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic) {
			staticRange = Math.floor((me.getSkill(42, 1) + 4) * 2 / 3);

			while (!me.dead && Math.round(unit.hp * 100 / unit.hpmax) > Config.CastStatic && Attack.checkMonster(unit)) {
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

		index = ((unit.spectype & 0x7) || unit.type === 0) ? 1 : 3;

		// Timed / primary
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[0];
		} else {
			checkSkill = Config.AttackSkill[index];
		}

		if (Attack.canUseSkill(checkSkill) && Attack.checkResist(unit, checkSkill) && ([56, 59, 64].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = checkSkill;
		} else if (Config.AttackSkill[5] > 0 && Attack.canUseSkill(Config.AttackSkill[5]) && Attack.checkResist(unit, Config.AttackSkill[5]) && ([56, 59, 64].indexOf(Config.AttackSkill[5]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			timedSkill = Config.AttackSkill[5];
		}

		// Untimed / alternate
		if (Attack.getCustomAttack(unit)) {
			checkSkill = Attack.getCustomAttack(unit)[1];
		} else {
			checkSkill = Config.AttackSkill[index + 1];
		}

		if (Attack.canUseSkill(checkSkill) && Attack.checkResist(unit, checkSkill) && ([56, 59, 64].indexOf(checkSkill) === -1 || Attack.validSpot(unit.x, unit.y))) {
			untimedSkill = checkSkill;
		} else if (Config.AttackSkill[6] > 0 && Attack.canUseSkill(Config.AttackSkill[6]) && Attack.checkResist(unit, Config.AttackSkill[6]) && ([56, 59, 64].indexOf(Config.AttackSkill[6]) === -1 || Attack.validSpot(unit.x, unit.y))) {
			untimedSkill = Config.AttackSkill[6];
		}

		// Out of mana → normal attack on RMB (always through lvl 12; also via LowManaSkill config)
		if (timedSkill > 0 && Skill.getManaCost(timedSkill) > me.mp) {
			if (me.charlvl <= 12 || Config.LowManaSkill[0] === 0) {
				timedSkill = 0;
				untimedSkill = -1;
			} else if (Config.LowManaSkill[0] > 0 && Attack.canUseSkill(Config.LowManaSkill[0]) && Attack.checkResist(unit, Config.LowManaSkill[0])) {
				timedSkill = Config.LowManaSkill[0];
				untimedSkill = -1;
			}
		}

		if (untimedSkill > 0 && Skill.getManaCost(untimedSkill) > me.mp && (timedSkill <= 0 || Skill.getManaCost(timedSkill) > me.mp)) {
			if (me.charlvl <= 12 || Config.LowManaSkill[0] === 0 || Config.LowManaSkill[1] === 0) {
				timedSkill = 0;
				untimedSkill = -1;
			} else if (Config.LowManaSkill[1] > 0 && Attack.canUseSkill(Config.LowManaSkill[1]) && Attack.checkResist(unit, Config.LowManaSkill[1])) {
				untimedSkill = Config.LowManaSkill[1];
			}
		}

		// No usable configured spell → soft/staff Fire Bolt, else normal attack on RMB
		if (timedSkill < 0 && untimedSkill < 0) {
			if (Attack.canUseSkill(36) && Attack.checkResist(unit, 36)) {
				timedSkill = 36;
				untimedSkill = -1;
			} else {
				timedSkill = 0;
				untimedSkill = -1;
			}
		} else if (timedSkill < 0 && untimedSkill === 0) {
			timedSkill = 0;
			untimedSkill = -1;
		} else if (timedSkill === 0) {
			untimedSkill = -1;
		}

		switch (this.doCast(unit, timedSkill, untimedSkill)) {
		case 0: // Fail
			break;
		case 1: // Success
			return true;
		case 2: // Try to telestomp
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
		var i, walk, hand;

		// No valid skills can be found
		if (timedSkill < 0 && untimedSkill < 0) {
			return 2;
		}

		if (timedSkill > -1 && (!me.getState(121) || !Skill.isTimed(timedSkill))) {
			if (Skill.getRange(timedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(timedSkill) || checkCollision(me, unit, 0x4)) {
				walk = Skill.getRange(timedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(timedSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				hand = this.castHand(timedSkill);

				// Spells: skip if still line-blocked. Melee / normal attack: always swing after move.
				if (timedSkill === 0 || !checkCollision(me, unit, 0x4)) {
					if (!Skill.cast(timedSkill, hand, unit)) {
						return 0;
					}
				} else {
					return 0;
				}
			}

			return 1;
		}

		if (untimedSkill > -1) {
			if (Skill.getRange(untimedSkill) < 4 && !Attack.validSpot(unit.x, unit.y)) {
				return 0;
			}

			if (Math.round(getDistance(me, unit)) > Skill.getRange(untimedSkill) || checkCollision(me, unit, 0x4)) {
				walk = Skill.getRange(untimedSkill) < 4 && getDistance(me, unit) < 10 && !checkCollision(me, unit, 0x1);

				if (!Attack.getIntoPosition(unit, Skill.getRange(untimedSkill), 0x4, walk)) {
					return 0;
				}
			}

			if (!unit.dead) {
				hand = this.castHand(untimedSkill);

				if (!Skill.cast(untimedSkill, hand, unit)) {
					return 0;
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
