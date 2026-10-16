// Simple Auto Gear — enable AutoEquip + shop buy + class/PD2/charm pickit.
// Include from a class LoadConfig after setting Config.AutoGearBuild (optional).
// Does NOT load the heavy Autoitems.js MF suite.
//
// SoloPlay ideas → PD2 transforms: sdk/pd2-extract/AUTOGEAR_PD2_NOTES.md
// Phase 0 knobs: Config.AutoGear (ProtectRWBases, CharmCaps, EnableMidRW, …)
// Phase 1: empty RW-base protect (Misc), charm qty caps (Town), build jewelry overlays
// Phase 2: gated Spirit/Insight (PD2 rune ids) via pushMidRunewords
//
// Pickit stack (order matters for NTIP max-tier):
//   1. Char config (usually kolton.nip)
//   2. auto/autoequip_<class>.nip          — player #tier gear (one per class)
//   3. pd2Misc + all_runes + Quest
//   4. auto/leveling.nip                   — shared jewelry/jewels/gems
//   5. auto/leveling_charms.nip            — charm pick + town sell keep list
//   6. auto/leveling_merc.nip              — merc scavenger (NO player #tier)
//   7. auto/autoequip_<class>_<build>.nip  — optional build overlay (sor/nec)
//   8. RW bases: caster Stealth+Lore (+ Leaf if fire); melee Steel
//
// Player vs merc: player wins if #tier + autoEquipCheck; else mercScore on shared picks.
// Sorc never gets Steel sword/axe bases. Spirit sword is caster RW only.

(function () {
	var classNips, nip, build, overlay, bases, i, ag, caps, midEnabled;

	// Phase 3 dynamic tierscore — must load before Pickit.init evaluates #tier formulas
	if (me.classid === 1 && !isIncluded("common/AutoGearScore.js")) {
		include("common/AutoGearScore.js");
	}

	function pushPickit(file) {
		if (Config.PickitFiles.indexOf(file) === -1) {
			Config.PickitFiles.push(file);
		}
	}

	function pushRW(recipe, base, ethereal) {
		Config.Runewords.push([recipe, base, ethereal !== undefined ? ethereal : Roll.NonEth]);
	}

	function isCasterBuild() {
		// Stealth + Lore — sorc and caster necro only (not poisonstrike / melee classes)
		if (me.classid === 1) {
			return true;
		}

		if (me.classid === 2 && build !== "poisonstrike") {
			return true;
		}

		return false;
	}

	function pushLevelingRunewords() {
		Config.MakeRunewords = true;

		if (isCasterBuild()) {
			pushPickit("auto/leveling_rw_caster.nip"); // Stealth
			pushPickit("auto/leveling_rw_lore.nip"); // Lore helms/circlets

			// Stealth — Breast Plate / Light Plate only (PD2: +20 FCR / +20 FHR)
			bases = ["Breast Plate", "Light Plate"];

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Stealth, bases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == armor # [fcr] == 20 && [fhr] == 20");

			bases = ["Cap", "Skull Cap", "Helm", "Full Helm", "Great Helm", "Crown", "Mask", "Bone Helm", "War Hat", "Sallet", "Casque", "Basinet",
				"Circlet", "Coronet", "Tiara", "Diadem"];

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Lore, bases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == helm || [type] == circlet # [lightresist] >= 25");

			// Fire: Leaf until a better orb (runtime gate in Runewords.js)
			if (me.classid === 1 && build === "fire") {
				pushPickit("auto/leveling_rw_leaf.nip");
				bases = ["Short Staff", "Long Staff", "Gnarled Staff", "Battle Staff", "War Staff", "Jo Staff", "Cedar Staff"];

				for (i = 0; i < bases.length; i += 1) {
					pushRW(Runeword.Leaf, bases[i], Roll.NonEth);
				}

				Config.KeepRunewords.push("[type] == staff # [fireskilltab] >= 3");
			}

			// Cold/light: bank Spirit sword bases early (recipes still mid @ 18)
			if (me.classid === 1 && (build === "cold" || build === "light")) {
				pushPickit("auto/leveling_rw_spirit.nip");
			}
		} else if (build === "poisonstrike") {
			// PS knives = shop/drop +PS/+IAS only — merc sticks: Purity (3os) > Strength (2os)
			// Lore helm mid (Ort+Sol) — same as casters; Stealth skipped (Treachery is mid armor)
			pushPickit("auto/leveling_rw_poisonstrike.nip");
			pushPickit("auto/leveling_rw_lore.nip");

			bases = ["Cap", "Skull Cap", "Helm", "Full Helm", "Great Helm", "Crown", "Mask", "Bone Helm", "War Hat", "Sallet", "Casque", "Basinet",
				"Circlet", "Coronet", "Tiara", "Diadem"];

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Lore, bases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == helm || [type] == circlet # [lightresist] >= 25");

			bases = [
				"Spear", "Trident", "Brandistock", "Spetum", "Pike",
				"War Spear", "Fuscina", "War Fork", "Yari", "Lance",
				"Bardiche", "Voulge", "Scythe", "Poleaxe", "Halberd", "War Scythe",
				"Lochaber Axe", "Bill", "Battle Scythe", "Partizan", "Bec de Corbin", "Grim Scythe"
			];

			// Purity first (Amn+Eth+Thul) — outranks Strength when 3os + runes are ready
			if (Runeword.Purity) {
				for (i = 0; i < bases.length; i += 1) {
					pushRW(Runeword.Purity, bases[i], Roll.NonEth);
				}

				Config.KeepRunewords.push("[type] == spear || [type] == polearm # [ias] >= 45"); // Purity
				Config.KeepRunewords.push("[type] == spear || [type] == polearm # [itemcrushingblow] >= 25"); // Strength
			}

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Strength, bases[i], Roll.NonEth);
			}

			if (!Runeword.Purity) {
				Config.KeepRunewords.push("[type] == spear || [type] == polearm # [itemcrushingblow] >= 25");
			}
		} else if (me.classid !== 2) {
			// Melee classes — Steel
			pushPickit("auto/leveling_rw_melee.nip");
			bases = ["Short Sword", "Scimitar", "Saber", "Falchion", "Crystal Sword", "Hand Axe", "Axe"];

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Steel, bases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == sword || [type] == axe # [ias] == 25");
		}
	}

	function itemHasMeditation(item) {
		if (!item) {
			return false;
		}

		// NTIPAliasStat meditationaura = [151, 120]
		return !!(item.getStat(151, 120) || (typeof item.getStatEx === "function" && item.getStatEx(151, 120)));
	}

	function findOwnedItem(pred) {
		var item = me.getItem(-1, -1);

		if (!item) {
			return null;
		}

		do {
			if (pred(item)) {
				return copyUnit(item);
			}
		} while (item.getNext());

		return null;
	}

	function hasSpiritSword() {
		return !!findOwnedItem(function (it) {
			return it.itemType === 30 && it.getFlag(0x4000000) &&
				(it.getStat(127) || 0) >= 2 && (it.getStat(105) || 0) >= 25;
		});
	}

	// PD2 mid shields: Splendor / Lidless / Moser's (not Spirit Monarch)
	function hasCasterMidShield() {
		return !!findOwnedItem(function (it) {
			var code;

			if (it.itemType !== 2 && it.itemType !== 70) {
				return false;
			}

			// Splendor: +1 skills + 10 FCR runeword
			if (it.getFlag(0x4000000) && (it.getStat(127) || 0) >= 1 && (it.getStat(105) || 0) >= 10) {
				return true;
			}

			// Lidless (grimshield unique) / Moser's (roundshield unique)
			if (it.quality === 7) {
				code = it.code ? String(it.code).toLowerCase() : "";

				if (it.classid === 410 || it.classid === 389 || code === "xsh" || code === "xml") {
					return true;
				}

				if (it.classid === 460 || code === "uml") { // Luna = Moser's exceptional base sometimes
					return true;
				}
			}

			return false;
		});
	}

	// Rhyme (Shael+Eth): CBF + resists — early 1H-offhand before Splendor/Lidless
	function hasRhymeShield() {
		return !!findOwnedItem(function (it) {
			if (it.itemType !== 2 && it.itemType !== 70) {
				return false;
			}

			return !!(it.getFlag(0x4000000) && (it.getStat(153) || 0) >= 1);
		});
	}

	function wantsOneHandShield() {
		// Only craft/keep shield RWs while a 1H is equipped (no 2H staff)
		if (typeof Item !== "undefined" && Item.wantsShieldSlot) {
			return !!Item.wantsShieldSlot();
		}

		return false;
	}

	function mercHasInsight() {
		var merc, item;

		if (typeof Item !== "undefined" && typeof Item.getMercItem === "function") {
			item = Item.getMercItem(4).item;

			if (item && itemHasMeditation(item)) {
				return true;
			}
		}

		merc = me.getMerc();

		if (merc) {
			item = merc.getItem(-1, 1);

			if (item) {
				do {
					if (item.bodylocation === 4 && itemHasMeditation(item)) {
						return true;
					}
				} while (item.getNext());
			}
		}

		return !!findOwnedItem(function (it) {
			return it.itemType === 34 && it.getFlag(0x4000000) && itemHasMeditation(it);
		});
	}

	// Treachery (Shael+Thul+Lem): 45 IAS + 30 cold res on body armor
	function hasTreacheryArmor() {
		if (typeof Runewords !== "undefined" && Runewords.hasCompletedTreacheryArmor) {
			return !!Runewords.hasCompletedTreacheryArmor();
		}

		return !!findOwnedItem(function (it) {
			var dmg;

			if (it.itemType !== 3 || !it.getFlag(0x4000000)) {
				return false;
			}

			// PD2 itemType can misreport a weapon as type 3 — cross-check base damage
			dmg = (getBaseStat("items", it.classid, "mindam") || 0) +
				(getBaseStat("items", it.classid, "maxdam") || 0) +
				(getBaseStat("items", it.classid, "2handmindam") || 0) +
				(getBaseStat("items", it.classid, "2handmaxdam") || 0);

			if (dmg > 0) {
				return false;
			}

			return (it.getStat(93) || 0) >= 45 && (it.getStat(43) || 0) >= 30;
		});
	}

	// SoloPlay idea: gate mid RWs by progression — PD2 Spirit sword / caster shields / Insight
	function pushMidRunewords() {
		var mid = [], swordBases, shieldBases, poleBases, armorBases, i;

		if (!ag.EnableMidRW) {
			return mid;
		}

		if (!Runeword.Spirit || !Runeword.Insight) {
			print("ÿc1AutoGearÿc0 :: MidRW skipped — Spirit/Insight recipe missing (check Runewords.js PD2 ids)");
			return mid;
		}

		// Spirit sword — sorc + caster necro only (poisonstrike = daggers forever)
		if ((me.classid === 1 || (me.classid === 2 && build !== "poisonstrike" && build !== "poison")) &&
				me.charlvl >= 18 && !hasSpiritSword()) {
			pushPickit("auto/leveling_rw_spirit.nip");
			swordBases = ["Crystal Sword", "Broad Sword", "Long Sword"];

			for (i = 0; i < swordBases.length; i += 1) {
				pushRW(Runeword.Spirit, swordBases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == sword # [itemallskills] == 2 && [fcr] >= 25");
			mid.push("Spirit-sword");
		}

		// Caster mid shields — Rhyme (early) / Splendor / Lidless / Moser's (NOT Spirit Monarch on PD2)
		// Recipes bank when a 1H is equipped or Spirit sword is owned; make still requires 1H (wantsShieldSlot)
		if ((me.classid === 1 || me.classid === 2) && me.charlvl >= 24 && !hasCasterMidShield() &&
				(wantsOneHandShield() || hasSpiritSword() || me.classid === 2)) {
			pushPickit("auto/leveling_rw_caster_shield.nip");
			shieldBases = [
				"Buckler", "Small Shield", "Kite Shield", "Spiked Shield", "Bone Shield",
				"Round Shield", "Grim Shield", "Luna", "Hyperion", "Troll Nest"
			];

			// Rhyme (Shael+Eth) first — cheap CBF shield; socket only while 1H (Runewords.wantsRhymeShieldSlot)
			if (Runeword.Rhyme && !hasRhymeShield()) {
				for (i = 0; i < shieldBases.length; i += 1) {
					pushRW(Runeword.Rhyme, shieldBases[i], Roll.NonEth);
				}

				Config.KeepRunewords.push("[type] == shield # [itemcannotbefrozen] == 1");
				mid.push("Rhyme");
			}

			if (Runeword.Splendor) {
				for (i = 0; i < shieldBases.length; i += 1) {
					pushRW(Runeword.Splendor, shieldBases[i], Roll.NonEth);
				}

				Config.KeepRunewords.push("[type] == shield # [itemallskills] == 1 && [fcr] == 10");
				mid.push("Splendor");
			}

			mid.push("Lidless/Mosers");
		}

		// Insight — Act2 merc progression (Sol ~27)
		if (Config.UseMerc !== false && me.charlvl >= 27 && !mercHasInsight()) {
			pushPickit("auto/leveling_rw_insight.nip");
			poleBases = [
				"Poleaxe", "Bill", "Partizan", "Bec de Corbin", "Battle Scythe",
				"Thresher", "Cryptic Axe", "Great Poleaxe", "Colossus Voulge", "Giant Thresher"
			];

			for (i = 0; i < poleBases.length; i += 1) {
				pushRW(Runeword.Insight, poleBases[i], Roll.All);
			}

			Config.KeepRunewords.push("[type] == polearm # [meditationaura] >= 12");
			mid.push("Insight");
		}

		// PS mid armor — Treachery (Shael+Thul+Lem) in 3os chest with solid defense
		if (build === "poisonstrike" && Runeword.Treachery && me.charlvl >= 35 &&
				!hasTreacheryArmor()) {
			pushPickit("auto/leveling_rw_treachery.nip");
			armorBases = [
				"Breast Plate", "Light Plate", "Field Plate", "Gothic Plate", "Full Plate Mail", "Ancient Armor",
				"Ghost Armor", "Serpentskin Armor", "Demonhide Armor", "Trellised Armor", "Linked Mail",
				"Tigulated Mail", "Cuirass", "Mesh Armor", "Mage Plate", "Sharktooth Armor", "Embossed Plate",
				"Chaos Armor", "Ornate Plate", "Wyrmhide", "Scarab Husk", "Wire Fleece", "Diamond Mail",
				"Loricated Mail", "Great Hauberk", "Boneweave", "Balrog Skin", "Hellforged Plate", "Kraken Shell"
			];

			for (i = 0; i < armorBases.length; i += 1) {
				pushRW(Runeword.Treachery, armorBases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == armor # [ias] >= 45 && [coldresist] >= 30");
			mid.push("Treachery");
		}

		return mid;
	}

	// Ensure Phase 0 defaults if an old Config.js somehow omitted AutoGear
	if (!Config.AutoGear || typeof Config.AutoGear !== "object") {
		Config.AutoGear = {};
	}

	ag = Config.AutoGear;

	if (ag.ProtectRWBases === undefined) {
		ag.ProtectRWBases = true;
	}

	if (ag.EnableMidRW === undefined) {
		ag.EnableMidRW = true;
	}

	if (ag.EnableSecondary === undefined) {
		ag.EnableSecondary = false;
	}

	if (ag.FinalGearBoost === undefined) {
		ag.FinalGearBoost = 100000;
	}

	if (ag.DebugScore === undefined) {
		ag.DebugScore = false;
	}

	if (ag.DebugMercEquip === undefined) {
		ag.DebugMercEquip = false;
	}

	if (!ag.CharmCaps || typeof ag.CharmCaps !== "object") {
		ag.CharmCaps = {
			Enabled: true,
			SmallLife: 6,
			SmallRes: 4,
			SmallMf: 2,
			SmallMisc: 2,
			LargeLife: 3,
			LargeRes: 2,
			LargeMisc: 1,
			GrandPreferredSkiller: 2,
			GrandOtherSkiller: 1,
			GrandLife: 2,
			GrandRes: 2,
			GrandMisc: 1
		};
	}

	if (ag.CharmCaps.Enabled === undefined) {
		ag.CharmCaps.Enabled = true;
	}

	Config.AutoEquip = true;
	Config.AutoEquipMerc = true;
	Config.MiniShopBot = true;

	// Sorc: TK only for pickable loot + Duriel orifice (never attack / chests)
	if (me.classid === 1) {
		Config.UseTelekinesis = true;
	}

	// Shared sell-pick (all AutoGear chars) — valuables always; junk only when low gold
	Config.LowGold = 50000;
	Config.SellMinGoldPerSquare = 2500;
	Config.SellMinGoldTotal = 8000;
	Config.SellJunkMinGoldNormal = 5000; // white/blue while gold < LowGold (Normal)
	Config.SellJunkMinGoldHard = 25000; // white/blue while gold < LowGold (NM/Hell)

	// Free IDs after Rescue Cain — Town.cainID uses Cain in Act2+ even if quest bit is flaky
	Config.CainID.Enable = true;
	Config.CainID.MinGold = 0;
	Config.CainID.MinUnids = 1;

	classNips = {
		0: "auto/autoequip_ama.nip", // Amazon
		1: "auto/autoequip_sor.nip", // Sorceress
		2: "auto/autoequip_nec.nip", // Necromancer
		3: "auto/autoequip_pal.nip", // Paladin
		4: "auto/autoequip_bar.nip", // Barbarian
		5: "auto/autoequip_dru.nip", // Druid
		6: "auto/autoequip_asn.nip"  // Assassin
	};

	nip = classNips[me.classid];

	if (nip) {
		pushPickit(nip);
	}

	// PD2 currency / essences / maps (runes moved to all_runes.nip)
	pushPickit("pd2Misc.nip");

	// All runes El–Zod + PD2 stacks — pick and stash
	pushPickit("auto/all_runes.nip");

	// Quest drops (Book of Skill, Cube, Inifuss, etc.) — codes, not LoD classids
	pushPickit("auto/Quest.nip");

	// Campaign leveling keep (jewelry / jewels / TP staves / gems) — replaces LLD.nip
	pushPickit("auto/leveling.nip");

	// Early leveling filler charms (+life/mana/res) — also Town sell keep list
	pushPickit("auto/leveling_charms.nip");

	// Merc scavenger (bows/spears/early armor) — separate from player #tier nips
	pushPickit("auto/leveling_merc.nip");

	// Optional build overlay (e.g. sorc "cold"|"fire"|"light", necro "poisonstrike")
	build = Config.AutoGearBuild;

	if (build && typeof build === "string") {
		build = build.toLowerCase();

		if (me.classid === 1) { // Sorceress
			overlay = "auto/autoequip_sor_" + build + ".nip";

			if (FileTools.exists("pickit/" + overlay)) {
				pushPickit(overlay);
			}

			// Fire: +Fire Bolt weapons only before lvl 12 (then fireball lines in fire overlay)
			if (build === "fire" && me.charlvl < 12) {
				pushPickit("auto/autoequip_sor_fire_early.nip");
			}
		} else if (me.classid === 2) { // Necromancer
			overlay = "auto/autoequip_nec_" + build + ".nip";

			if (FileTools.exists("pickit/" + overlay)) {
				pushPickit(overlay);
			}
		}
	}

	pushLevelingRunewords();
	midEnabled = pushMidRunewords();

	caps = ag.CharmCaps;
	print("ÿc2AutoGearÿc0 :: AutoEquip on — class nip + leveling + charms + merc + RW"
		+ (build ? " (build=" + build + (build === "fire" && me.charlvl < 12 ? "+earlyFB" : "") + ")" : "")
		+ (isCasterBuild()
			? (" [caster Stealth+Lore" + (build === "fire" ? "+Leaf" : (build === "cold" || build === "light" ? "+SpiritBases" : "")) + "]")
			: (build === "poisonstrike" ? " [PS Lore+Purity>Strength+Treachery]" : (me.classid === 2 ? " [necro]" : " [melee Steel]"))));
	print("ÿc2AutoGearÿc0 :: PD2 knobs — ProtectRWBases=" + !!ag.ProtectRWBases
		+ " CharmCaps=" + (caps && caps.Enabled ? "on" : "off")
		+ " MidRW=" + !!ag.EnableMidRW
		+ (midEnabled && midEnabled.length ? (" [" + midEnabled.join("+") + "]") : "")
		+ " Secondary=" + !!ag.EnableSecondary
		+ (me.classid === 1 ? (" Score=" + (typeof AutoGearScore !== "undefined" ? "on" : "off")
			+ (ag.DebugScore ? "+debug" : "")) : "")
		+ (ag.DebugMercEquip ? " MercEquip=debug" : ""));
})();
