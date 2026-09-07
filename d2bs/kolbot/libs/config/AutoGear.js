// Simple Auto Gear — enable AutoEquip + shop buy + class/PD2/charm pickit.
// Include from a class LoadConfig after setting Config.AutoGearBuild (optional).
// Does NOT load the heavy Autoitems.js MF suite.
//
// Pickit stack (order matters for NTIP max-tier):
//   1. Char config (usually kolton.nip)
//   2. auto/autoequip_<class>.nip          — player #tier gear (one per class)
//   3. pd2Misc + all_runes + Quest
//   4. auto/leveling.nip                   — shared jewelry/jewels/gems
//   5. auto/leveling_charms.nip            — charm pick + town sell keep list
//   6. auto/leveling_merc.nip              — merc scavenger (NO player #tier)
//   7. auto/autoequip_<class>_<build>.nip  — optional build overlay (sor/nec)
//   8. RW bases: leveling_rw (+ leaf OR steel by class)
//
// Player vs merc: player wins if #tier + autoEquipCheck; else mercScore on shared picks.
// Sorc never gets Steel sword/axe bases. Spirit sword is caster RW only.

(function () {
	var classNips, nip, build, overlay, bases, i;

	function pushPickit(file) {
		if (Config.PickitFiles.indexOf(file) === -1) {
			Config.PickitFiles.push(file);
		}
	}

	function pushRW(recipe, base, ethereal) {
		Config.Runewords.push([recipe, base, ethereal !== undefined ? ethereal : Roll.NonEth]);
	}

	function pushLevelingRunewords() {
		pushPickit("auto/leveling_rw.nip"); // Stealth + Lore bases (all classes)
		Config.MakeRunewords = true;

		// Shared: Stealth (Tal+Eth) — Ring Mail+ only (40+ def). Skip quilted/leather/studded.
		bases = [
			"Ring Mail", "Scale Mail", "Breast Plate", "Chain Mail", "Splint Mail",
			"Ghost Armor", "Serpentskin Armor", "Demonhide Armor", "Trellised Armor",
			"Linked Mail", "Tigulated Mail", "Cuirass"
		];

		for (i = 0; i < bases.length; i += 1) {
			pushRW(Runeword.Stealth, bases[i], Roll.NonEth);
		}

		Config.KeepRunewords.push("[type] == armor # [fcr] == 10 && [fhr] == 30");

		// Shared: Lore (Ort+Sol) — priority early helm
		bases = ["Cap", "Skull Cap", "Helm", "Full Helm", "Mask", "Bone Helm", "Sallet", "Casque", "Basinet"];

		for (i = 0; i < bases.length; i += 1) {
			pushRW(Runeword.Lore, bases[i], Roll.NonEth);
		}

		Config.KeepRunewords.push("[type] == helm # [lightresist] >= 25");

		// Casters (sorc / necro / elemental druids later): Leaf for sorc only.
		// Stealth is already shared above — never skip it for casters.
		if (me.classid === 1) { // Sorceress — Leaf only (never Steel melee bases)
			pushPickit("auto/leveling_rw_leaf.nip");
			bases = ["Short Staff", "Long Staff", "Gnarled Staff", "Battle Staff", "War Staff", "Jo Staff", "Cedar Staff"];

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Leaf, bases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == staff # [fireskilltab] >= 3");
		} else if (me.classid === 2) { // Necromancer — Stealth only (no Steel); caster
			// Stealth already pushed; no Steel
		} else { // Melee — Steel (Tir+El)
			pushPickit("auto/leveling_rw_steel.nip");
			bases = ["Short Sword", "Scimitar", "Saber", "Falchion", "Crystal Sword", "Hand Axe", "Axe"];

			for (i = 0; i < bases.length; i += 1) {
				pushRW(Runeword.Steel, bases[i], Roll.NonEth);
			}

			Config.KeepRunewords.push("[type] == sword || [type] == axe # [ias] == 25");
		}
	}

	Config.AutoEquip = true;
	Config.AutoEquipMerc = true;
	Config.MiniShopBot = true;

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

	print("ÿc2AutoGearÿc0 :: AutoEquip on — class nip + leveling + charms + merc + RW (Stealth first)"
		+ (build ? " (build=" + build + (build === "fire" && me.charlvl < 12 ? "+earlyFB" : "") + ")" : "")
		+ (me.classid === 1 ? " [sorc Leaf]" : (me.classid === 2 ? " [necro no Steel]" : " [Steel]")));
})();
