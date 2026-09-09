/**
 *	@filename	Baal.js
 *	@author		kolton, modified by YGM
 *	@desc		clear Throne of Destruction and kill Baal
 */

function Baal() {
	var portal, tick;

	this.preattack = function () {
		var check;

		switch (me.classid) {
		case 1: // Sorceress
			switch (Config.AttackSkill[3]) {
			case 49:
			case 53:
			case 56:
			case 59:
			case 64:
				if (me.getState(121)) {
					while (me.getState(121)) {
						delay(100);
					}
				} else {
					return Skill.cast(Config.AttackSkill[1], 0, 15094 + rand(-1, 1), 5028);
				}

				break;
			}

			break;
		case 3: // Paladin
			if (Config.AttackSkill[3] === 112) {
				if (Config.AttackSkill[4] > 0) {
					Skill.setSkill(Config.AttackSkill[4], 0);
				}

				return Skill.cast(Config.AttackSkill[3], 1);
			}

			break;
		case 5: // Druid
			if (Config.AttackSkill[3] === 245) {
				return Skill.cast(Config.AttackSkill[3], 0, 15094 + rand(-1, 1), 5028);
			}

			break;
		case 6: // Assassin
			if (Config.UseTraps) {
				check = ClassAttack.checkTraps({x: 15094, y: 5028});

				if (check) {
					return ClassAttack.placeTraps({x: 15094, y: 5028}, 5);
				}
			}

			if (Config.AttackSkill[3] === 256) { // shock-web
				return Skill.cast(Config.AttackSkill[3], 0, 15094, 5028);
			}

			break;
		}

		return false;
	};

	this.checkThrone = function () {
		var monster = getUnit(1);

		if (monster) {
			do {
				if (Attack.checkMonster(monster) && monster.y < 5080) {
					switch (monster.classid) {
					case 23:
					case 62:
						return 1;
					case 105:
					case 381:
						return 2;
					case 557:
						return 3;
					case 558:
						return 4;
					case 571:
						return 5;
					default:
						Attack.getIntoPosition(monster, 10, 0x4);
						Attack.clear(15);

						return false;
					}
				}
			} while (monster.getNext());
		}

		return false;
	};

	this.clearThrone = function () {
		var i, monster,
			monList = [],
			pos = [15094, 5022, 15094, 5041, 15094, 5060, 15094, 5041, 15094, 5022];

		if (Config.AvoidDolls) {
			monster = getUnit(1, 691);

			if (monster) {
				do {
					if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && Attack.checkMonster(monster) && Attack.skipCheck(monster)) {
						monList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}

			if (monList.length) {
				Attack.clearList(monList);
			}
		}

		for (i = 0; i < pos.length; i += 2) {
			Pather.moveTo(pos[i], pos[i + 1]);
			Attack.clear(25);
		}
	};

	this.checkHydra = function () {
		var hydra = getUnit(1, getLocaleString(3325));
		if (hydra) {
			do {
				if (hydra.mode !== 12 && hydra.getStat(172) !== 2) {
					Pather.moveTo(15072, 5002);
					while (hydra.mode !== 12) {
						delay(500);
						if (!copyUnit(hydra).x) {
							break;
						}
					}

					break;
				}
			} while (hydra.getNext());
		}

		return true;
	};

	this.announce = function () {
		var count, string, souls, dolls,
			monster = getUnit(1);

		if (monster) {
			count = 0;

			do {
				if (Attack.checkMonster(monster) && monster.y < 5094) {
					if (getDistance(me, monster) <= 40) {
						count += 1;
					}

					if (!souls && monster.classid === 641) {
						souls = true;
					}

					if (!dolls && monster.classid === 691) {
						dolls = true;
					}
				}
			} while (monster.getNext());
		}

		if (count > 30) {
			string = "DEADLY!!!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 20) {
			string = "Lethal!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 10) {
			string = "Dangerous!" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else if (count > 0) {
			string = "Warm" + " " + count + " monster" + (count > 1 ? "s " : " ") + "nearby.";
		} else {
			string = "Cool TP. No immediate monsters.";
		}

		if (souls) {
			string += " Souls ";

			if (dolls) {
				string += "and Dolls ";
			}

			string += "in area.";
		} else if (dolls) {
			string += " Dolls in area.";
		}

		say(string);
	};

	// Worldstone Chamber: ignore Festering Appendages (562-566) — teleport onto Baal and burn him only
	this.killBaal = function () {
		var baal, prevTele = Config.TeleStomp, attackCount = 0, retry = 0;

		Config.TeleStomp = true;

		try {
			while (attackCount < 300) {
				baal = getUnit(1, 544);

				if (!baal || !Attack.checkMonster(baal)) {
					return true;
				}

				if (getDistance(me, baal) > 3) {
					Pather.moveToUnit(baal);
				}

				if (!ClassAttack.doAttack(baal, attackCount % 15 === 0)) {
					if (retry++ > 3) {
						Pather.moveToUnit(baal);
						retry = 0;
					}
				} else {
					retry = 0;
				}

				attackCount += 1;
			}
		} finally {
			Config.TeleStomp = prevTele;
		}

		baal = getUnit(1, 544);

		return !baal || !Attack.checkMonster(baal);
	};

	Town.doChores();
	Pather.useWaypoint(Config.RandomPrecast ? "random" : 129);
	Precast.doPrecast(true);

	if (me.area !== 129) {
		Pather.useWaypoint(129);
	}

	if (!Pather.moveToExit([130, 131], true)) {
		throw new Error("Failed to move to Throne of Destruction.");
	}

	Pather.moveTo(15095, 5029);

	if (Config.Baal.DollQuit && getUnit(1, 691)) {
		say("Dolls found! NG.");

		return true;
	}

	if (Config.Baal.SoulQuit && getUnit(1, 641)) {
		say("Souls found! NG.");

		return true;
	}

	if (Config.PublicMode) {
		this.announce();
		Pather.moveTo(15118, 5002);
		Pather.makePortal();
		say(Config.Baal.HotTPMessage);
		Attack.clear(15);
	}

	this.clearThrone();

	if (Config.PublicMode) {
		Pather.moveTo(15118, 5045);
		Pather.makePortal();
		say(Config.Baal.SafeTPMessage);
		Precast.doPrecast(true);
	}

	tick = getTickCount();

	var closeX = 15094, closeY = me.classid === 3 ? 5029 : 5038,
		farX = 15094, farY = 5060, // reuse far sweep point from clearThrone(); keep final wave out of Baal curse range
		wavesSeen = {};

	Pather.moveTo(closeX, closeY);

MainLoop:
	while (true) {
		var finalWavePending = wavesSeen[1] && wavesSeen[2] && wavesSeen[3] && wavesSeen[4],
			waitX = finalWavePending ? farX : closeX,
			waitY = finalWavePending ? farY : closeY;

		if (getDistance(me, waitX, waitY) > 3) {
			Pather.moveTo(waitX, waitY);
		}

		if (!getUnit(1, 543)) {
			break MainLoop;
		}

		switch (this.checkThrone()) {
		case 1:
			Attack.clear(40);
			wavesSeen[1] = true;

			tick = getTickCount();

			Precast.doPrecast(true);

			break;
		case 2:
			Attack.clear(40);
			wavesSeen[2] = true;

			tick = getTickCount();

			break;
		case 4:
			Attack.clear(40);
			wavesSeen[4] = true;

			tick = getTickCount();

			break;
		case 3:
			Attack.clear(40);
			wavesSeen[3] = true;
			this.checkHydra();

			tick = getTickCount();

			break;
		case 5:
			Attack.clear(40); // anchored to far spot once waves 1-4 cleared

			break MainLoop;
		default:
			if (getTickCount() - tick < 7e3) {
				if (me.getState(2)) {
					Skill.setSkill(109, 0);
				}

				break;
			}

			if (!this.preattack()) {
				delay(100);
			}

			break;
		}

		delay(10);
	}

	if (Config.Baal.KillBaal) {
		if (Config.PublicMode) {
			say(Config.Baal.BaalMessage);
		}

		Pather.moveTo(15090, 5008);
		delay(5000);
		Precast.doPrecast(true);

		while (getUnit(1, 543)) {
			delay(500);
		}

		portal = getUnit(2, 563);

		if (portal) {
			Pather.usePortal(null, null, portal);
		} else {
			throw new Error("Couldn't find portal.");
		}

		Pather.moveTo(15134, 5923);
		this.killBaal();
		Pickit.pickItems();
	}

	return true;
}