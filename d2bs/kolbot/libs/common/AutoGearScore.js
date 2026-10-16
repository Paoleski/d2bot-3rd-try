// AutoGearScore — Phase 3 dynamic tierscore (sorc-only v1).
// NTIP lines: # [tier] == AutoGearScore.forItem(item)
// Scores upgrades in context of currently worn gear (FCR breakpoints, resist fill, life/mana, skills).
// Identity keepers (Spirit/Lore/Stealth/Lidless/…) stay as flat high #tier in nips — scorer caps < 90.

var AutoGearScore = {
	// Normal cast table (Lightning / most skills)
	FCR_BPS: [0, 9, 20, 37, 63, 105, 200],

	// Soft FCR goals by stage
	fcrTarget: function () {
		if (me.diff === 0 && me.charlvl < 18) {
			return 20;
		}

		if (me.diff === 0 || (me.diff === 1 && me.charlvl < 50)) {
			return 63;
		}

		return 105;
	},

	// Per-element resist soft floor (F/C/L). Poison scored lightly elsewhere.
	// Never 0 — resist-only gloves/boots must still beat whites in early Normal.
	resistTarget: function () {
		if (me.diff === 0) {
			return me.charlvl < 18 ? 20 : 30;
		}

		if (me.diff === 1) {
			return me.charlvl < 45 ? 50 : 75;
		}

		return 75;
	},

	build: function () {
		var b = (Config && Config.AutoGearBuild) ? String(Config.AutoGearBuild).toLowerCase() : "";

		if (b === "fire" || b === "cold" || b === "light") {
			return b;
		}

		return "light";
	},

	debug: function () {
		return !!(Config && Config.AutoGear && Config.AutoGear.DebugScore);
	},

	stat: function (item, id, sub) {
		var v;

		if (!item) {
			return 0;
		}

		if (sub !== undefined && sub !== null) {
			v = item.getStat(id, sub);

			return v || 0;
		}

		if (typeof Item !== "undefined" && typeof Item.itemStat === "function") {
			return Item.itemStat(item, id);
		}

		v = item.getStat(id) || 0;

		if (typeof item.getStatEx === "function") {
			v = Math.max(v, item.getStatEx(id) || 0);
		}

		return v || 0;
	},

	itemStats: function (item) {
		return {
			fcr: this.stat(item, 105),
			fr: this.stat(item, 39),
			lr: this.stat(item, 41),
			cr: this.stat(item, 43),
			pr: this.stat(item, 45),
			hp: this.stat(item, 7),
			mana: this.stat(item, 9),
			fhr: this.stat(item, 99),
			frw: this.stat(item, 96),
			energy: this.stat(item, 1),
			allskills: this.stat(item, 127),
			sorc: this.stat(item, 83, 1),
			firetab: this.stat(item, 188, 8),
			lighttab: this.stat(item, 188, 9),
			coldtab: this.stat(item, 188, 10),
			// light skills
			chargedbolt: this.stat(item, 107, 38),
			lightning: this.stat(item, 107, 49),
			chainlightning: this.stat(item, 107, 53),
			nova: this.stat(item, 107, 48),
			// fire
			firebolt: this.stat(item, 107, 36),
			fireball: this.stat(item, 107, 47),
			meteor: this.stat(item, 107, 56),
			// cold
			icebolt: this.stat(item, 107, 39),
			frostnova: this.stat(item, 107, 44),
			frozenorb: this.stat(item, 107, 64),
			blizzard: this.stat(item, 107, 59),
			ed: this.stat(item, 16)
		};
	},

	isBoots: function (item) {
		return !!(item && item.itemType === 15);
	},

	isGloves: function (item) {
		return !!(item && item.itemType === 16);
	},

	bodyLocs: function (item) {
		var loc;

		if (!item || typeof Item === "undefined" || !Item.getBodyLoc) {
			return [];
		}

		loc = Item.getBodyLoc(item);

		if (loc === undefined || loc === null) {
			return [];
		}

		if (Object.prototype.toString.call(loc) === "[object Array]") {
			return loc;
		}

		return [loc];
	},

	// Equipped unit on a body location (no NTIP — avoid recursion)
	equippedUnit: function (bodyLoc) {
		if (typeof Item !== "undefined" && Item.getEquippedItemUnit) {
			return Item.getEquippedItemUnit(bodyLoc);
		}

		return null;
	},

	// Sum stats from all worn gear, optionally excluding one bodyloc (or a list)
	equippedExcluding: function (excludeLocs) {
		var out = {fcr: 0, fr: 0, lr: 0, cr: 0, pr: 0, hp: 0, mana: 0},
			ex = {},
			i, loc, unit, s, item;

		if (excludeLocs) {
			if (Object.prototype.toString.call(excludeLocs) !== "[object Array]") {
				excludeLocs = [excludeLocs];
			}

			for (i = 0; i < excludeLocs.length; i += 1) {
				ex[excludeLocs[i]] = true;
			}
		}

		item = me.getItem();

		if (!item) {
			return out;
		}

		do {
			if (item.mode !== 1) {
				continue;
			}

			loc = item.bodylocation;

			if (!loc || ex[loc]) {
				continue;
			}

			s = this.itemStats(item);
			out.fcr += s.fcr;
			out.fr += s.fr;
			out.lr += s.lr;
			out.cr += s.cr;
			out.pr += s.pr;
			out.hp += s.hp;
			out.mana += s.mana;
		} while (item.getNext());

		return out;
	},

	// Which ring slot a candidate would replace (weaker contribution)
	pickRingSlot: function (preferLoc) {
		var a = this.equippedUnit(6),
			b = this.equippedUnit(7),
			sa, sb;

		if (preferLoc === 6 || preferLoc === 7) {
			return preferLoc;
		}

		if (!a) {
			return 6;
		}

		if (!b) {
			return 7;
		}

		sa = this.itemStats(a);
		sb = this.itemStats(b);

		// Replace the weaker ring (less FCR, then less life+mana+res)
		if (sa.fcr !== sb.fcr) {
			return sa.fcr <= sb.fcr ? 6 : 7;
		}

		if ((sa.hp + sa.mana + sa.fr + sa.lr + sa.cr) <= (sb.hp + sb.mana + sb.fr + sb.lr + sb.cr)) {
			return 6;
		}

		return 7;
	},

	excludeLocFor: function (item, preferLoc) {
		var locs = this.bodyLocs(item);

		if (!locs.length) {
			return preferLoc ? [preferLoc] : [];
		}

		if (locs.length === 1) {
			return [locs[0]];
		}

		// rings
		return [this.pickRingSlot(preferLoc)];
	},

	nextBp: function (fcr) {
		var i, bps = this.FCR_BPS;

		for (i = 0; i < bps.length; i += 1) {
			if (fcr < bps[i]) {
				return bps[i];
			}
		}

		return bps[bps.length - 1];
	},

	bpAtOrBelow: function (fcr) {
		var i, best = 0, bps = this.FCR_BPS;

		for (i = 0; i < bps.length; i += 1) {
			if (bps[i] <= fcr) {
				best = bps[i];
			}
		}

		return best;
	},

	scoreFcr: function (before, itemFcr, target) {
		var after = before + itemFcr,
			bpBefore = this.bpAtOrBelow(before),
			bpAfter = this.bpAtOrBelow(after),
			next = this.nextBp(before),
			score = 0;

		if (itemFcr <= 0) {
			return {score: 0, detail: "fcr0"};
		}

		// Crossing a breakpoint toward / at stage target is the big win
		if (bpAfter > bpBefore) {
			if (bpAfter <= target || before < target) {
				score += 42 + (bpAfter - bpBefore) * 0.2;
			} else {
				// past stage target — still meaningful (FCR rare on gloves)
				score += 12;
			}
		} else if (before < target && after < next) {
			// progress toward next BP — stronger than old 0.35 (beats fat resist rolls)
			score += itemFcr * 1.8;
		} else if (before >= target) {
			score += itemFcr * 0.45;
		} else {
			score += itemFcr * 1.0;
		}

		return {score: score, detail: "fcr+" + itemFcr + " " + before + "→" + after + " bp" + bpBefore + "→" + bpAfter};
	},

	scoreRes: function (before, itemS, target) {
		var score = 0,
			fill, over,
			w = 0.55, // per point of useful fill
			soft = 0.08; // past target

		function one(have, add) {
			if (add <= 0) {
				return 0;
			}

			fill = Math.max(0, target - have);
			over = Math.max(0, add - fill);

			return Math.min(fill, add) * w + over * soft;
		}

		score += one(before.fr, itemS.fr);
		score += one(before.lr, itemS.lr);
		score += one(before.cr, itemS.cr);
		score += Math.min(itemS.pr, 20) * 0.12; // poison light

		return {score: score, detail: "res t" + target};
	},

	scoreLifeMana: function (itemS) {
		var build = this.build(),
			wHp = 0.22,
			wMana = (build === "light" || build === "cold") ? 0.28 : 0.2,
			score;

		// Prefer life when chicken floor is tight
		if (Config && Config.LifeChicken > 0 && me.hpmax > 0 && (me.hp * 100 / me.hpmax) < (Config.LifeChicken + 25)) {
			wHp = 0.35;
		}

		score = itemS.hp * wHp + itemS.mana * wMana + itemS.energy * 0.05 + itemS.fhr * 0.08;

		return {score: score, detail: "vit"};
	},

	// Enhanced defense — small but enough that 18% ED + 5/5 res beats heal-stamina junk.
	scoreEd: function (item, ed) {
		if (ed <= 0) {
			return {score: 0, detail: "ed0"};
		}

		if (this.isBoots(item) || this.isGloves(item) || (item && item.itemType === 3)) {
			return {score: Math.min(ed, 80) * 0.12, detail: "ed+" + ed};
		}

		return {score: Math.min(ed, 80) * 0.06, detail: "ed+" + ed};
	},

	// FRW is a primary boots mod for every build (tele or walk) — weight high on boots only.
	scoreFrw: function (item, frw) {
		var score;

		if (frw <= 0) {
			return {score: 0, detail: "frw0"};
		}

		if (this.isBoots(item)) {
			// ~1.6/pt → 10/20/30 FRW ≈ 16/32/48 (beats mediocre res-only boots)
			score = frw * 1.6;
			return {score: score, detail: "frw+" + frw + " boots"};
		}

		// Circlets/etc.: light filler only
		score = frw * 0.12;
		return {score: score, detail: "frw+" + frw};
	},

	scoreSkills: function (itemS) {
		var build = this.build(),
			score = 0,
			tab = 0,
			named = 0;

		score += itemS.allskills * 14;
		score += itemS.sorc * 12;

		if (build === "light") {
			tab = itemS.lighttab;
			named = itemS.chargedbolt * 6 + itemS.lightning * 8 + itemS.chainlightning * 5 + itemS.nova * 4;
			// don't reward cold/fire tabs on light
			score += tab * 10 + named;
			score += itemS.firetab * 0.5 + itemS.coldtab * 0.5;
		} else if (build === "fire") {
			tab = itemS.firetab;
			named = itemS.firebolt * 5 + itemS.fireball * 8 + itemS.meteor * 6;
			score += tab * 10 + named;
			score += itemS.lighttab * 0.5 + itemS.coldtab * 0.5;
		} else {
			tab = itemS.coldtab;
			named = itemS.icebolt * 4 + itemS.frostnova * 5 + itemS.frozenorb * 8;
			score += tab * 10 + named;
			score += itemS.firetab * 0.5 + itemS.lighttab * 0.5;
		}

		return {score: score, detail: "sk"};
	},

	// Soft quality / slot floors so white < blue < rare when mods are equal
	qualityBump: function (item) {
		if (!item) {
			return 0;
		}

		if (item.quality === 7) { // unique — identity lines usually win; tiny bump if scored
			return 1.5;
		}

		if (item.quality === 5) { // set
			return 0.4;
		}

		if (item.quality === 6) { // rare
			return 1.0;
		}

		if (item.quality === 4) { // magic
			return 0.5;
		}

		return 0.1; // white/superior
	},

	// Main entry — used from NTIP tier formulas and autoEquipCheck
	forItem: function (item, preferLoc) {
		var locs, exclude, before, itemS, fcrP, resP, vitP, skP, frwP, edP, total, parts, wornJ, wornFcr;

		if (!item || me.classid !== 1) {
			return 0;
		}

		// Unid magic+ — allow bank/ID; small positive so Pickit keeps candidates
		if (!item.getFlag(0x10) && item.quality > 2) {
			return 3 + this.qualityBump(item);
		}

		locs = this.bodyLocs(item);

		if (!locs.length) {
			return 0;
		}

		exclude = this.excludeLocFor(item, preferLoc);
		before = this.equippedExcluding(exclude);
		itemS = this.itemStats(item);

		fcrP = this.scoreFcr(before.fcr, itemS.fcr, this.fcrTarget());
		resP = this.scoreRes(before, itemS, this.resistTarget());
		vitP = this.scoreLifeMana(itemS);
		skP = this.scoreSkills(itemS);
		frwP = this.scoreFrw(item, itemS.frw);
		edP = this.scoreEd(item, itemS.ed);

		total = fcrP.score + resP.score + vitP.score + skP.score + frwP.score + edP.score + this.qualityBump(item);

		// Any F/C/L on boots beats stamina/heal junk (qualityBump 0.5) even if fill is small
		if (this.isBoots(item) && (itemS.fr + itemS.lr + itemS.cr) >= 5) {
			total += 4;
		}

		// Gloves: FCR is scarce (Apprentice +10 / Magefist) — dominate any resist-only blue
		if (this.isGloves(item) && itemS.fcr >= 10) {
			total += 35;
			fcrP.detail = fcrP.detail + "+gloveFcr";
		}

		// First FCR ring/amulet vs a 0-FCR slot — never lose to resist/life jewelry
		if ((item.itemType === 10 || item.itemType === 12) && itemS.fcr >= 10) {
			wornJ = exclude && exclude.length ? this.equippedUnit(exclude[0]) : null;
			wornFcr = wornJ ? this.itemStats(wornJ).fcr : 0;

			if (wornFcr < 10) {
				total += 40;
				fcrP.detail = fcrP.detail + "+firstFcrJewelry";
			}
		}

		// CBF only if we don't already have it on another piece (NTIP.GetTier uses same rule)
		if (typeof Item !== "undefined" && typeof Item.cbfTierBonus === "function" && Item.cbfTierBonus(item) > 0) {
			total += 25;
		}

		// Bare whites/superior: tiny AC band below magic qualityBump (0.5).
		// Old floor of 1 made white Greaves "beat" magic Sharkskin (0.5) → kept forever
		// while GetTier 1 never swapped over nip magic tier 2.
		if (total < 1.2 && item.quality <= 3) {
			total = 0.1 + ((item.getStat(31) || 0) / 1000);
		}

		// Cap below identity RW/unique band (Lore 80 / Stealth 85 / Spirit 100)
		if (total > 89) {
			total = 89;
		}

		// Round to 2 decimals for stable compares
		total = Math.round(total * 100) / 100;

		if (this.debug() && total >= 2) {
			parts = [fcrP.detail, resP.detail, "hp" + itemS.hp + "/mp" + itemS.mana, skP.detail, frwP.detail, edP.detail];
			print("ÿc2AutoGearScoreÿc0 :: " + (item.name || item.classid) + " = " + total +
				" (" + parts.join(", ") + ") excl=" + exclude.join("/"));
		}

		return total;
	},

	// Compare candidate vs equipped unit on a specific bodyloc (sorc autoEquipCheck)
	beatsEquipped: function (cand, bodyLoc) {
		var worn, candScore, wornScore;

		if (!cand || me.classid !== 1) {
			return false;
		}

		worn = this.equippedUnit(bodyLoc);

		if (!worn) {
			return this.forItem(cand, bodyLoc) > 0;
		}

		candScore = this.forItem(cand, bodyLoc);
		wornScore = this.forItem(worn, bodyLoc);

		return candScore > wornScore;
	}
};
