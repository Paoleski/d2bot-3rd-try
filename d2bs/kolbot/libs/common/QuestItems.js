/**
*	@filename	QuestItems.js
*	@desc		PD2 quest item classids (from pd2data.mpq Weapons/Armor/Misc.txt).
*				Vanilla LoD ids are WRONG here — e.g. 521 is not Viper, 549 is not Cube.
*/

var QuestItems = {
	// Act 1
	malus: 89,		// hdm Horadric Malus
	hellforge: 90,	// hfh (Act 4/5) — verify if present
	wirtLeg: 88,	// leg
	inifuss: 541,	// bks Bark Scroll (Scroll of Inifuss)
	cairnKey: 542,	// bkd deciphered Bark Scroll

	// Act 2
	staffKings: 92,	// msf
	horadricStaff: 91, // hst
	viper: 538,		// vip
	cube: 566,		// box
	bookSkill: 569,	// ass Book of Skill
	gidbinn: 87,	// g33

	// Act 3
	jade: 563,		// j34
	goldenBird: 564, // g34
	lifePotion: 562, // xyz (Potion of Life / scroll of self resurrect)
	lamEsen: 565,	// bbb — WARNING: this classid collides with the Horadric Cube in PD2.
					// NEVER match this item by classid alone (e.g. me.getItem(QuestItems.lamEsen))
					// since the cube is basically always in inventory — always require code === "bbb" too.
	soulstone: 568,	// mss
	khalimEye: 570,	// qey
	khalimHeart: 571, // qhr
	khalimBrain: 572, // qbr
	khalimFlail: 173, // qf1
	khalimWill: 174, // qf2

	// Act 5
	malahPotion: 662,	// ice Maguffin
	scrollResist: 664,	// tr2 Scroll of Resistance

	// PD2 economy
	wss: 677, // Worldstone Shard

	// Prefer code — PD2 classids shift; classid alone false-misses
	getCube: function () {
		return this.findByCode("box") || me.getItem("box") || me.getItem(this.cube) || false;
	},

	has: function (classid, code) {
		var it, c, want;

		want = code ? String(code).toLowerCase() : null;

		// Prefer exact code scan — me.getItem("bbb") is NTIPAlias→classid and hits the cube on PD2
		if (want) {
			return this.hasCode(want);
		}

		it = me.getItem();

		if (it) {
			do {
				// Inv / equip / cube / stash (amulet is often stashed after chores)
				if ([1, 3, 6, 7].indexOf(it.location) < 0) {
					continue;
				}

				if (classid !== undefined && classid !== null && it.classid === classid) {
					return true;
				}
			} while (it.getNext());
		}

		if (classid !== undefined && classid !== null) {
			return !!me.getItem(classid);
		}

		return false;
	},

	find: function (classid, code) {
		var it, c, want, best = null;

		want = code ? String(code).toLowerCase() : null;
		it = me.getItem();

		if (it) {
			do {
				if ([1, 3, 6, 7].indexOf(it.location) < 0) {
					continue;
				}

				c = it.code ? String(it.code).toLowerCase() : "";

				if (want && c === want) {
					// Prefer inventory over stash for immediate use
					if (it.location === 3) {
						return it;
					}

					if (!best) {
						best = copyUnit(it);
					}
				} else if (!want && classid !== undefined && classid !== null && it.classid === classid) {
					if (it.location === 3) {
						return it;
					}

					if (!best) {
						best = copyUnit(it);
					}
				}
			} while (it.getNext());
		}

		if (best) {
			return best;
		}

		// NEVER me.getItem("bbb") / me.getItem(code) — D2BS resolves via NTIPAliasClassID
		// (bbb→565) which on PD2 is the Horadric Cube (same classid). Scan by .code only.
		if (want) {
			return this.findByCode(want);
		}

		if (classid !== undefined && classid !== null && !want) {
			return me.getItem(classid) || false;
		}

		return false;
	},

	// Exact 3-letter code match only (never classid / NTIPAlias getItem(string))
	findByCode: function (code) {
		var want, it, best = null, c;

		if (!code) {
			return false;
		}

		want = String(code).toLowerCase();
		it = me.getItem();

		if (!it) {
			return false;
		}

		do {
			if ([1, 3, 6, 7].indexOf(it.location) < 0) {
				continue;
			}

			c = it.code ? String(it.code).toLowerCase() : "";

			if (c === want) {
				if (it.location === 3) {
					return copyUnit(it);
				}

				if (!best) {
					best = copyUnit(it);
				}
			}
		} while (it.getNext());

		return best || false;
	},

	hasCode: function (code) {
		return !!this.findByCode(code);
	},

	allIds: function () {
		// Never include lamEsen (565) — on PD2 that classid IS the Horadric Cube.
		// Lam Esen's Tome is code "bbb" only (see findByCode / mustKeepInInventory).
		return [
			this.malus, this.hellforge, this.wirtLeg, this.inifuss, this.cairnKey,
			this.staffKings, this.horadricStaff, this.viper, this.cube, this.bookSkill, this.gidbinn,
			this.jade, this.goldenBird, this.lifePotion, this.soulstone,
			this.khalimEye, this.khalimHeart, this.khalimBrain, this.khalimFlail, this.khalimWill,
			this.malahPotion, this.scrollResist
		];
	},

	// 3-letter codes (PD2 Misc.txt) — prefer these when classid lookups miss
	codes: {
		malus: "hdm",
		hellforge: "hfh",
		wirtLeg: "leg",
		inifuss: "bks",
		cairnKey: "bkd",
		staffKings: "msf",
		horadricStaff: "hst",
		viper: "vip",
		cube: "box",
		bookSkill: "ass",
		gidbinn: "g33",
		jade: "j34",
		goldenBird: "g34",
		lifePotion: "xyz",
		lamEsen: "bbb",
		soulstone: "mss",
		khalimEye: "qey",
		khalimHeart: "qhr",
		khalimBrain: "qbr",
		khalimFlail: "qf1",
		khalimWill: "qf2",
		malahPotion: "ice",
		scrollResist: "tr2"
	},

	codeForClassid: function (classid) {
		var key;

		for (key in this) {
			if (this.hasOwnProperty(key) && typeof this[key] === "number" && this[key] === classid && this.codes[key]) {
				return this.codes[key];
			}
		}

		return null;
	},

	// Maguffins that must stay in inventory until used (never bank)
	mustKeepInInventory: function (unit) {
		var code;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		// Prefer code — PD2 classids shift
		if (code === "ice" || code === "tr2" || code === "xyz" || code === "ass" ||
				code === "j34" || code === "g34" || code === "bbb") {
			return true;
		}

		if (code) {
			return false; // known non-keep code
		}

		// Code missing — classid fallback
		return unit.classid === this.malahPotion || unit.classid === this.scrollResist ||
			unit.classid === this.lifePotion || unit.classid === this.bookSkill ||
			unit.classid === this.jade || unit.classid === this.goldenBird ||
			unit.classid === this.lamEsen;
	},

	// Cain's lore "Horadric Scroll" (tr1/567) — NOT Lam Esen (bbb), NOT Inifuss (bks). Drop junk.
	isHoradricScroll: function (unit) {
		var code, name;

		if (!unit) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		if (code === "tr1") {
			return true;
		}

		if (code === "bbb" || code === "bks" || code === "bkd" || code === "tr2") {
			return false;
		}

		if (unit.classid === 567 || (typeof NTIPAliasClassID !== "undefined" &&
				NTIPAliasClassID.tr1 !== undefined && unit.classid === NTIPAliasClassID.tr1)) {
			return true;
		}

		name = unit.name ? String(unit.name).toLowerCase().replace(/ÿc[0-9a-z]/gi, "") : "";

		// "Horadric Scroll" / "Scroll of Horadric Quest Info" — not Lam Esen's Tome
		if (name.indexOf("horadric") > -1 && name.indexOf("scroll") > -1) {
			return true;
		}

		return false;
	},

	isQuestItem: function (unit) {
		var code, expected;

		if (!unit) {
			return false;
		}

		// Lore scroll from Cain — never treat as keep/pick quest item
		if (this.isHoradricScroll(unit)) {
			return false;
		}

		// Never treat ammo / gold / scrolls / pots as quest (PD2 classid collisions)
		if ([4, 5, 6, 22, 76, 77, 78, 79, 80, 81].indexOf(unit.itemType) > -1) {
			return false;
		}

		code = unit.code ? String(unit.code).toLowerCase() : "";

		// Prefer 3-letter code — authoritative on PD2
		if (code && [
			"hdm", "hfh", "leg", "bks", "bkd", "msf", "hst", "vip", "box", "ass", "g33",
			"j34", "g34", "xyz", "bbb", "mss", "qey", "qhr", "qbr", "qf1", "qf2", "ice", "tr2"
		].indexOf(code) > -1) {
			return true;
		}

		// Known non-quest codes that share/near quest classid ranges — never classid-match these
		if (code && (code === "aqv" || code === "cqv" || code === "aqv2" || code === "cqv2" ||
				code === "aqv3" || code === "cqv3" || code === "key" || code === "tsc" || code === "isc" ||
				code === "tbk" || code === "ibk" || code === "gld" || code === "tr1" ||
				/^hp[1-5]$/.test(code) ||
				/^mp[1-5]$/.test(code) || code === "rvs" || code === "rvl" || code === "mpi")) {
			return false;
		}

		// Classid fallback only when code missing, or code matches the expected quest code
		if (this.allIds().indexOf(unit.classid) > -1) {
			expected = this.codeForClassid(unit.classid);

			if (!code) {
				return true;
			}

			return !!(expected && code === expected);
		}

		return false;
	}
};
