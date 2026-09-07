from pathlib import Path

path = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs\config\Sorceress.teststutter.js")
text = path.read_text(encoding="utf-8")

marker = "\t/* AutoSkill builds character based on array defined by the user"
idx = text.find(marker)
if idx < 0:
	raise SystemExit("AutoSkill marker not found")

# Drop from AutoSkill comment through end of LoadConfig, keep trailing nothing
new_tail = r'''	/* ========================================================================
	 * PD2 Sorc builds — skill/stat only (switch with SORC_BUILD).
	 *   "fire"  = Hydra (Odealo S13) + early Fire Bolt/Ball leveling
	 *   "light" = Charged Bolt (your screenshot)
	 *   "cold"  = Blizzard leveling (placeholder until you pick a cold guide)
	 * Active char: teststutter. Change SORC_BUILD then reload.
	 * ======================================================================== */
	var SORC_BUILD = "fire"; // "fire" | "light" | "cold"

	Config.AutoSkill.Enabled = true;
	Config.AutoSkill.Save = 0;
	Config.AutoStat.Enabled = true;
	Config.AutoStat.Save = 0;
	Config.AutoStat.BlockChance = 0;
	Config.AutoStat.UseBulk = true;

	if (SORC_BUILD === "fire") {
		/* Fire / Hydra (Odealo PD2 Hydra Sorc)
		 * Early: Fire Bolt → Fire Ball. At 12+: Lesser Hydra prereq → Hydra.
		 * Max Hydra + Fire Ball + Fire Bolt + Fire Mastery. Blaze/TP/Shiver at 1.
		 * ES skipped for campaign (Odealo: not useful early). Vit dump while leveling.
		 * IDs: FB 36, Warmth 37, FireBall 47, Blaze 46, Hydra 62, FM 61, LH 383,
		 *      TK 43, TP 54, Static 42, Shiver 50, Cold Enchant 40
		 */
		Config.AttackSkill[0] = -1;
		Config.AttackSkill[1] = 36;
		Config.AttackSkill[2] = -1;
		Config.AttackSkill[3] = 36;
		Config.AttackSkill[4] = -1;
		Config.AttackSkill[5] = 0;
		Config.AttackSkill[6] = -1;

		Config.AutoSkill.Build = [
			[40, 1, false],    // Cold Enchant — merc buff
			[36, 1, true],     // Fire Bolt
			[37, 1, true],     // Warmth
			[43, 1, true],     // Telekinesis
			[54, 1, true],     // Teleport (18)
			[42, 1, false],    // Static Field
			[47, 1, true],     // Fire Ball
			[46, 1, false],    // Blaze
			[50, 1, false],    // Shiver Armor
			[383, 1, true],    // 1 Lesser Hydra (Hydra prereq)
			[62, 1, true],     // unlock Hydra
			[62, 20, false],   // max Hydra
			[47, 20, false],   // max Fire Ball
			[36, 20, false],   // max Fire Bolt
			[61, 20, false],   // max Fire Mastery
			[383, 20, false]   // leftover → Lesser Hydra
		];

		Config.AutoStat.Build = [
			["strength", 15], ["vitality", 15],
			["strength", 20], ["vitality", 20],
			["strength", 25], ["vitality", 25],
			["strength", 30], ["vitality", 30],
			["strength", 35], ["vitality", 35],
			["strength", 40], ["vitality", 40],
			["strength", 45], ["vitality", 45],
			["vitality", "all"]
		];

	} else if (SORC_BUILD === "light") {
		/* Lightning / Charged Bolt (screenshot)
		 * 20 CB, 20 Lightning, 20 TK, 20 LM, 1+ TP, 1 Shiver, 1+ Warmth.
		 * Static added for bosses. Vit rest, energy 0.
		 * IDs: CB 38, Lightning 49, TK 43, LM 63, TP 54, Warmth 37, Shiver 50, Static 42
		 */
		Config.AttackSkill[0] = -1;
		Config.AttackSkill[1] = 38;
		Config.AttackSkill[2] = -1;
		Config.AttackSkill[3] = 38;
		Config.AttackSkill[4] = -1;
		Config.AttackSkill[5] = 49;
		Config.AttackSkill[6] = -1;

		Config.AutoSkill.Build = [
			[37, 1, true],     // Warmth
			[38, 1, true],     // Charged Bolt
			[42, 1, true],     // Static Field
			[43, 1, true],     // Telekinesis
			[54, 1, true],     // Teleport
			[50, 1, false],    // Shiver Armor
			[38, 20, false],   // max Charged Bolt
			[49, 20, false],   // max Lightning
			[43, 20, false],   // max Telekinesis
			[63, 20, false]    // max Lightning Mastery
		];

		Config.AutoStat.Build = [
			["strength", 20], ["dexterity", 20],
			["strength", 30], ["dexterity", 25],
			["strength", 40], ["dexterity", 30],
			["strength", 45],
			["vitality", "all"]
		];

	} else {
		/* Cold / Blizzard placeholder (classic Blizz path)
		 * IDs: IceBolt 39, IceBlast 45, FrostNova 44, GS 55, Blizz 59, CM 65
		 */
		Config.AttackSkill[0] = -1;
		Config.AttackSkill[1] = 59;
		Config.AttackSkill[2] = 45;
		Config.AttackSkill[3] = 59;
		Config.AttackSkill[4] = 45;
		Config.AttackSkill[5] = 55;
		Config.AttackSkill[6] = -1;

		Config.AutoSkill.Build = [
			[37, 1, true],     // Warmth
			[39, 1, true],     // Ice Bolt
			[43, 1, true],     // Telekinesis
			[54, 1, true],     // Teleport
			[42, 1, false],    // Static
			[44, 1, false],    // Frost Nova
			[45, 1, true],     // Ice Blast
			[55, 1, true],     // Glacial Spike
			[59, 1, true],     // Blizzard
			[50, 1, false],    // Shiver Armor
			[59, 20, false],   // max Blizzard
			[65, 20, false],   // max Cold Mastery
			[55, 20, false],   // max Glacial Spike
			[45, 20, false]    // max Ice Blast
		];

		Config.AutoStat.Build = [
			["strength", 15], ["vitality", 15],
			["strength", 25], ["vitality", 25],
			["strength", 35], ["vitality", 35],
			["strength", 45], ["vitality", 45],
			["vitality", "all"]
		];
	}

	print("teststutter :: SORC_BUILD=" + SORC_BUILD + " (AutoSkill and AutoStat on)");

	// AutoBuild System ( See /d2bs/kolbot/libs/config/Builds/README.txt for instructions )
	Config.AutoBuild.Enabled = false;
	Config.AutoBuild.Template = "BuildName";
	Config.AutoBuild.Verbose = true;
	Config.AutoBuild.DebugMode = true;
}
'''

path.write_text(text[:idx] + new_tail, encoding="utf-8")
print("updated", path)
print("SORC_BUILD fire/light/cold blocks written")
