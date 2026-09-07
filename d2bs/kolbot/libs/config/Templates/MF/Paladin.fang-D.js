// Paladin config file

/* Brief instructions:
 * Notepad++ is HIGHLY recommended to use for editing these files. Visit http://notepad-plus-plus.org/
 * To comment out something, put // in front of that line
 * !!!Never comment out something you're not sure about, set it to false or disable as noted in description if you don't want to use it.
 * true and false are case sensitive. Good: Config.SomeVar = true; Bad: Config.SomeVar = True;
 */

function LoadConfig() {
	/* Sequence config
	 * Set to true if you want to run it, set to false if not.
	 * If you want to change the order of the scripts, just change the order of their lines by using cut and paste.
	 */
	Scripts.AutoSmurf = true;
		Config.AutoSmurf.TeamSize = 5;
		Config.AutoSmurf.TeleportingSorc = "fang-E";  //your leader sor charname.
		Config.AutoSmurf.NonSorcChar = ["fang-C","fang-D","fang-A"]; //all team charname except from leader and boBar
		Config.AutoSmurf.BoBarb = "fang-B";	//boBar charname
		Config.AutoSmurf.AllTeamProfiles = ["A1","A2","A3","A4","A5"];  //  all team PROFILE Names
		
	/* ### leeching section ###
	* Unless stated otherwise, leader's character name isn't needed on order to run.
	* Don't use more scripts of the same type! (Run AutoBaal OR BaalHelper, not both)
	*/
	Config.Leader = "fang-E"; // Leader's ingame character name. Leave blank to try auto-detection (works in AutoBaal, Wakka, MFHelper)
	Config.QuitList = ["fang-E"]; // leader char name
	Config.QuitListMode = 0; // 0 = use character names; 1 = use profile names (all profiles must run on the same computer).

	// Pickit config. Default folder is kolbot/pickit.
	//-----usual-------- 
	Config.PickitFiles.push("master/Charms.nip");
	Config.PickitFiles.push("master/Magic.nip");
	Config.PickitFiles.push("master/Rare.nip");
	Config.PickitFiles.push("master/Runes.nip");
	Config.PickitFiles.push("master/Runeword.nip");
	Config.PickitFiles.push("master/Set.nip");
	Config.PickitFiles.push("master/Unique.nip");	
	Config.PickitFiles.push("master/white.nip");
	Config.PickRange = 40; // Pick radius
	Config.FastPick = false; // Check and pick items between attacks

	/* Inventory lock configuration. !!!READ CAREFULLY!!!
	 * 0 = item is locked and won't be moved. If item occupies more than one slot, ALL of those slots must be set to 0 to lock it in place.
	 * Put 0s where your torch, annihilus and everything else you want to KEEP is.
	 * 1 = item is unlocked and will be dropped, stashed or sold.
	 * If you don't change the default values, the bot won't stash items.
	 */
	Config.Inventory[0] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[1] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[2] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[3] = [1,1,1,1,1,1,1,1,1,1];

	Config.StashGold = 1000; // Minimum amount of gold to stash.

	/* Potion types for belt columns from left to right.
	 * Rejuvenation potions must always be rightmost.
	 * Supported potions - Healing ("hp"), Mana ("mp") and Rejuvenation ("rv")
	 */
	Config.BeltColumn[0] = "hp";
	Config.BeltColumn[1] = "mp";
	Config.BeltColumn[2] = "rv";
	Config.BeltColumn[3] = "rv";

	/* Minimum amount of potions. If we have less, go to vendor to purchase more.
	 * Set rejuvenation columns to 0, because they can't be bought.
	 */
	Config.MinColumn[0] = 3;
	Config.MinColumn[1] = 3;
	Config.MinColumn[2] = 3;
	Config.MinColumn[3] = 3;

	// Additional item info log settings. All info goes to \logs\ItemLog.txt
	Config.ItemInfo = true; // Log stashed, skipped (due to no space) or sold items.
	Config.ItemInfoQuality = []; // The quality of sold items to log. See NTItemAlias.dbl for values. Example: Config.ItemInfoQuality = [6, 7, 8];

	// Item identification settings
	Config.CainID.Enable = false; // Identify items at Cain
	Config.CainID.MinGold = 2500000; // Minimum gold (stash + character) to have in order to use Cain.
	Config.CainID.MinUnids = 3; // Minimum number of unid items in order to use Cain.
	Config.FieldID = false; // Identify items in the field instead of going to town.
	Config.DroppedItemsAnnounce.Enable = false;	// Announce Dropped Items to in-game newbs
	Config.DroppedItemsAnnounce.Quality = []; // Quality of item to announce. See NTItemAlias.dbl for values. Example: Config.DroppedItemsAnnounce.Quality = [6, 7, 8];

	// Repair settings
	Config.CubeRepair = false; // Repair weapons with Ort and armor with Ral rune. Don't use it if you don't understand the risk of losing items.
	Config.RepairPercent = 60; // Durability percent of any equipped item that will trigger repairs.

	// Gambling config
	Config.Gamble = true;
	Config.GambleGoldStart = 3000000;
	Config.GambleGoldStop = 500000;

	// Check libs/NTItemAlias.dbl file for other item classids
	Config.GambleItems.push(520); // Amulet
	//Config.GambleItems.push(522); // Ring
	//Config.GambleItems.push(418); // Circlet
	//Config.GambleItems.push(419); // Coronet

	/* Cubing config. All recipe names are available in Templates/Cubing.txt
	 * The format is Config.Recipes.push([recipe_name, item_id, etherealness]). Etherealness is optional and only applies to some recipes.
	 */
	Config.Cubing = true; // Set to true to enable cubing.

	// Ingredients for the following recipes will be auto-picked, for classids check libs/NTItemAlias.dbl
 
	//Config.Recipes.push([Recipe.Gem, 560]); // perfect amethyst
	//Config.Recipes.push([Recipe.Gem, 565]); // perfect topaz
	//Config.Recipes.push([Recipe.Gem, 570]); // perfect sapphire
	//Config.Recipes.push([Recipe.Gem, 575]); // perfect emerald
	//Config.Recipes.push([Recipe.Gem, 578]); // ruby
	//Config.Recipes.push([Recipe.Gem, 579]); // flawless ruby
	//Config.Recipes.push([Recipe.Gem, 580]); // perfect ruby
	//Config.Recipes.push([Recipe.Gem, 583]); // diamond
	//Config.Recipes.push([Recipe.Gem, 584]); // flawless diamond
	//Config.Recipes.push([Recipe.Gem, 585]); // perfect diamond
	//Config.Recipes.push([Recipe.Gem, 600]); // perfect skull

	//Config.Recipes.push([Recipe.Token]); // token of absolution
	//Config.Recipes.push([Recipe.Rune, "Pul Rune"]); //Pul to Um
	Config.Recipes.push([Recipe.Rune, 630]); // pul -> um
	Config.Recipes.push([Recipe.Rune, 631]); // um -> mal
	Config.Recipes.push([Recipe.Rune, 632]); // mal -> ist
	Config.Recipes.push([Recipe.Rune, 633]); // ist -> gul
	Config.Recipes.push([Recipe.Rune, 634]); // gul -> vex

	//Config.Recipes.push([Recipe.Caster.Amulet]); // Craft Caster Amulet
	//Config.Recipes.push([Recipe.Blood.Ring]); // Craft Blood Ring
	//Config.Recipes.push([Recipe.Blood.Helm, 424]); // Craft Blood Armet
	//Config.Recipes.push([Recipe.HitPower.Gloves, 452]); // Craft Hit Power Vambraces

	// The gems not used by other recipes will be used for magic item rerolling.

	//Config.Recipes.push([Recipe.Reroll.Magic, 421]); // Reroll magic Diadem
	//Config.Recipes.push([Recipe.Reroll.Magic, 605]); // Reroll magic Grand Charm (ilvl 91+)

	//Config.Recipes.push([Recipe.Reroll.Rare, 421]); // Reroll rare Diadem

	/* Base item for the following recipes must be in pickit. The rest of the ingredients will be auto-picked.
	 * Use Roll.Eth, Roll.NonEth or Roll.All to determine what kind of base item to roll - ethereal, non-ethereal or all.
	 */
	Config.Recipes.push([Recipe.Socket.Weapon, "thresher", Roll.Eth]); // Socket ethereal Thresher
	Config.Recipes.push([Recipe.Socket.Weapon, "crypticaxe", Roll.Eth]); // Socket ethereal Cryptic Axe
	Config.Recipes.push([Recipe.Socket.Weapon, "greatpoleaxe", Roll.Eth]); // Socket ethereal GP
	Config.Recipes.push([Recipe.Socket.Weapon, "giantthresher", Roll.Eth]); // Socket ethereal GT
	Config.Recipes.push([Recipe.Socket.Weapon, "colossusvoulge", Roll.Eth]); // Socket ethereal CS
	Config.Recipes.push([Recipe.Socket.Armor, "duskShroud", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "wireFleece", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "boneweave", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "greathauberk", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "archonPlate", Roll.Eth]); 

	//Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, 335, Roll.NonEth]); // Upgrade Bloodfist to Exceptional
	//Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, 337, Roll.NonEth]); // Upgrade Magefist to Exceptional
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, 381, Roll.NonEth]); // Upgrade Bloodfist or Grave Palm to Elite
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, 383, Roll.NonEth]); // Upgrade Magefist or Lavagout to Elite
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, 389, Roll.NonEth]); // Upgrade Gore Rider to Elite

	/* Runeword config. All recipes are available in Templates/Runewords.txt
	 * Keep lines follow pickit format and any given runeword is tested vs ALL lines so you don't need to repeat them
	 */
	Config.MakeRunewords = true; // Set to true to enable runeword making/rerolling

	//insight
	Config.Runewords.push([Runeword.Insight, "thresher"]); 
	Config.Runewords.push([Runeword.Insight, "crypticaxe"]); 
	Config.Runewords.push([Runeword.Insight, "greatpoleaxe"]); 
	Config.Runewords.push([Runeword.Insight, "colossusvoulge"]); 
    Config.KeepRunewords.push("[type] == polearm # [meditationaura] <= 17");
	
	//smoke
	Config.Runewords.push([Runeword.Smoke, "mageplate"]); 
	Config.Runewords.push([Runeword.Smoke, "duskShroud"]); 
	Config.Runewords.push([Runeword.Smoke, "wyrmhide"]); 
	Config.Runewords.push([Runeword.Smoke, "scarabHusk"]); 
	Config.Runewords.push([Runeword.Smoke, "wireFleece"]); 
	Config.Runewords.push([Runeword.Smoke, "greatHauberk"]); 
	Config.Runewords.push([Runeword.Smoke, "boneweave"]);
	Config.Runewords.push([Runeword.Smoke, "balrogSkin"]); 
	Config.Runewords.push([Runeword.Smoke, "archonPlate"]); 		
	Config.KeepRunewords.push("[type] == armor # [FireResist] == 50 && [LightResist] == 50 "); 
	
	//Stone
	Config.Runewords.push([Runeword.Stone, "duskShroud"]); 
	Config.Runewords.push([Runeword.Stone, "wyrmhide"]); 
	Config.Runewords.push([Runeword.Stone, "scarabHusk"]); 
	Config.Runewords.push([Runeword.Stone, "wireFleece"]); 
	Config.Runewords.push([Runeword.Stone, "greatHauberk"]); 
	Config.Runewords.push([Runeword.Stone, "boneweave"]);
	Config.Runewords.push([Runeword.Stone, "balrogSkin"]); 
	Config.Runewords.push([Runeword.Stone, "archonPlate"]); 	
	Config.KeepRunewords.push("[type] == armor # [FireResist] == 15 && [LightResist] == 15 "); 
	
	//Duress
	Config.Runewords.push([Runeword.Duress, "greatHauberk"]); 
	Config.Runewords.push([Runeword.Duress, "boneweave"]);
	Config.Runewords.push([Runeword.Duress, "balrogSkin"]); 
	Config.Runewords.push([Runeword.Duress, "archonPlate"]); 
	Config.KeepRunewords.push("[type] == armor # [ColdResist] == 45 && [LightResist] == 15 "); 
		
	//Enigma
	//Config.Runewords.push([Runeword.Enigma, "mageplate"]); 
	Config.KeepRunewords.push("[type] == armor # [itemallskills] == 2"); 
	
    //Spirit Sword
	Config.Runewords.push([Runeword.Spirit, "crystalSword"]);	
	Config.KeepRunewords.push("[type] == sword # [itemallskills] == 2");
	
	//CTA Sword
	//Config.Runewords.push([Runeword.CallToArms, "crystalSword"]);	
	Config.KeepRunewords.push("[type] == sword # [itemallskills] == 1 && [ItemMagicBonus] == 30");

	//HOTO flail
	Config.Runewords.push([Runeword.HeartoftheOak, "flail"]);	
	Config.KeepRunewords.push("[name] == flail # [itemallskills] == 3");
		
	//Spirit Shield
	//Config.Runewords.push([Runeword.Spirit, "Monarch"]);  
	Config.Runewords.push([Runeword.Spirit, "SacredTarge"]);  
	Config.Runewords.push([Runeword.Spirit, "sacredrondache"]); 
	Config.Runewords.push([Runeword.Spirit, "kurastshield"]); 
	Config.Runewords.push([Runeword.Spirit, "zakarumshield"]); 
	Config.Runewords.push([Runeword.Spirit, "vortexshield"]); 	
    Config.KeepRunewords.push("[type] == shield || [type] == auricshields # [fcr] <= 35");

	// Public game options

	// If Config.Leader is set, the bot will only accept invites from leader. If Config.PublicMode is not 0, Baal and Diablo script will open Town Portals.
	Config.PublicMode = 2; // 1 = invite and accept, 2 = accept only, 3 = invite only, 0 = disable
	// Party message settings. Each setting represents an array of messages that will be randomly chosen.
	// $name, $level, $class and $killer are replaced by the player's name, level, class and killer
	Config.Greetings = []; // Example: ["Hello, $name (level $level $class)"]
	Config.DeathMessages = []; // Example: ["Watch out for that $killer, $name!"]
	Config.Congratulations = []; // Example: ["Congrats on level $level, $name!"]
	Config.ShitList = false; // Blacklist hostile players so they don't get invited to party.
	Config.UnpartyShitlisted = false; // Leave party if someone invited a blacklisted player.

	// General config
	Config.AutoMap = true; // Set to true to open automap at the beginning of the game.
	Config.LastMessage = ""; // Message or array of messages to say at the end of the run. Use $nextgame to say next game - "Next game: $nextgame" (works with lead entry point)
	Config.MinGameTime = 180; // Min game time in seconds. Bot will TP to town and stay in game if the run is completed before.
	Config.MaxGameTime = 2400; // Maximum game time in seconds. Quit game when limit is reached.
	Config.TeleSwitch = false; // Switch to slot II when teleporting more than 1 node.
	Config.OpenChests = true; // Open chests. Controls key buying.
	Config.MiniShopBot = false; // Scan items in NPC shops.
	Config.PacketShopping = false; // Use packets to shop. Imporves shopping speed.
	Config.TownCheck = true; // Go to town if out of potions
	Config.LogExperience = false; // Print experience statistics in the manager.
	Config.PingQuit = [{Ping: 0, Duration: 0}]; // Quit if ping is over the given value for over the given time period in seconds.

	// Shrine Scanner - scan for shrines while moving.
	// Put the shrine types in order of priority (from highest to lowest). For a list of types, see sdk/shrines.txt
	//-----------------------------------------------------------------------------------------------
	// 1 refilling,2 health ,3 mana,6 armor,7 combat,8 resist fire,9 resist cold,10 resist lightning
	// 11 resist poison,12 skill ,13 mana recharge,14 stamina ,15 experience,16 enirhs,17 portal,
	// 18 gem,19 fire,20 monster,21 exploding,22 poison
	//-----------------------------------------------------------------------------------------------
	Config.ScanShrines = [15, 12, 6, 3, 2];

	// MF Switch
	Config.MFSwitchPercent = 0; // Boss life % to switch weapons at. Set to 0 to disable.
	Config.MFSwitch = 0; // MF weapon slot: 0 = slot I, 1 = slot II

	// Fastmod config
	Config.FCR = 255; // 0 - disable, 1 to 255 - set value of faster cast rate 
	Config.FHR = 255; // 0 - disable, 1 to 255 - set value of faster hit recovery 
	Config.FBR = 255; // 0 - disable, 1 to 255 - set value of faster block recovery 
	Config.IAS = 255; // 0 - disable, 1 to 255 - set value of increased attack speed 
	Config.PacketCasting = 0; // 0 = disable, 1 = packet teleport, 2 = full packet casting.
	Config.WaypointMenu = true; // Set to true for Single and private realms

	// Anti-hostile config
	Config.AntiHostile = false; // Enable anti-hostile
	Config.HostileAction = 0; // 0 - quit immediately, 1 - quit when hostile player is sighted, 2 - attack hostile
	Config.TownOnHostile = false; // Go to town instead of quitting when HostileAction is 0 or 1
	Config.RandomPrecast = false; // Anti-PK measure, only supported in Baal and BaalHelper and BaalAssisstant at the moment.
	Config.ViperCheck = false; // Quit if revived Tomb Vipers are sighted

	// DClone config
	Config.StopOnDClone = false; // Go to town and idle as soon as Diablo walks the Earth
	Config.SoJWaitTime = 1; // Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
	Config.KillDclone = true; // Go to Palace Cellar 3 and try to kill Diablo Clone. Pointless if you already have Annihilus.
	Config.DCloneQuit = false; // 1 = quit when Diablo walks, 2 = quit on soj sales, 0 = disabled

	// Monster skip config
	// Skip immune monsters. Possible options: "fire", "cold", "lightning", "poison", "physical", "magic".
	// You can combine multiple resists with "and", for example - "fire and cold", "physical and cold and poison"
	Config.SkipImmune = [];
	// Skip enchanted monsters. Possible options: "extra strong", "extra fast", "cursed", "magic resistant", "fire enchanted", "lightning enchanted", "cold enchanted", "mana burn", "teleportation", "spectral hit", "stone skin", "multiple shots".
	// You can combine multiple enchantments with "and", for example - "cursed and extra fast", "mana burn and extra strong and lightning enchanted"
	Config.SkipEnchant = [];
	// Skip monsters with auras. Possible options: "fanaticism", "might", "holy fire", "blessed aim", "holy freeze", "holy shock". Conviction is bugged, don't use it.
	Config.SkipAura = [];

	/* Attack config
	 * To disable an attack, set it to -1
	 * Skills MUST be POSITIVE numbers. For reference see http://pastebin.com/baShRwWM
	 */
	Config.AttackSkill[0] = -1; // Preattack skill.
	Config.AttackSkill[1] = 112; // Primary skill to bosses.
	Config.AttackSkill[2] = 113; // Primary aura to bosses
	Config.AttackSkill[3] = 112; // Primary skill to others.
	Config.AttackSkill[4] = 113; // Primary aura to others.
	Config.AttackSkill[5] = 97; // Secondary skill if monster is immune to primary.
	Config.AttackSkill[6] = 122; // Secondary aura.

	// Low mana skills - these will be used if main skills can't be cast.
	Config.LowManaSkill[0] = -1; // Low mana skill.
	Config.LowManaSkill[1] = -1; // Low mana aura.

	/* Advanced Attack config. Allows custom skills to be used on custom monsters.
	 *	Format: "Monster Name": [attack skill id, aura skill id]
	 *	Multiple entries are separated by commas
	 */
	Config.CustomAttack = {
		//"Monster Name": [-1, -1]
	};

	Config.BossPriority = true; // Set to true to attack Unique/SuperUnique monsters first when clearing
	Config.ClearType = 0; // Monster spectype to kill in level clear scripts (ie. Mausoleum). 0xF = skip normal, 0x7 = champions/bosses, 0 = all

	// Wereform setup. Make sure you read Templates/Attacks.txt for attack skill format.
	Config.Wereform = false; // 0 / false - don't shapeshift, 1 / "Werewolf" - change to werewolf, 2 / "Werebear" - change to werebear

	// Class specific config
	Config.AvoidDolls = false; // Try to attack Soul Killers from a greater distance with hammerdins.
	Config.Vigor = true; // Swith to Vigor when running
	Config.Charge = false; // Use Charge when running
	Config.Redemption = [75, 75]; // Switch to Redemption after clearing an area if under designated life or mana. Format: [lifepercent, manapercent]

	// Town settings
	Config.HealHP = 80; // Go to a healer if under designated percent of life.
	Config.HealMP = 70; // Go to a healer if under designated percent of mana.
	Config.HealStatus = true; // Go to a healer if poisoned or cursed
	Config.UseMerc = true; // Use merc. This is ignored and always false in d2classic.
	Config.MercWatch = true; // Instant merc revive during battle.

	// Potion settings
	Config.UseHP = 80; // Drink a healing potion if life is under designated percent.
	Config.UseRejuvHP = 65;  // Drink a rejuvenation potion if life is under designated percent.
	Config.UseMP = 20; // Drink a mana potion if mana is under designated percent.
	Config.UseRejuvMP = 1; // Drink a rejuvenation potion if mana is under designated percent.
	Config.UseMercHP = 50; // Give a healing potion to your merc if his/her life is under designated percent.
	Config.UseMercRejuv = 30; // Give a rejuvenation potion to your merc if his/her life is under designated percent.
	Config.HPBuffer = 0; // Number of healing potions to keep in inventory.
	Config.MPBuffer = 0; // Number of mana potions to keep in inventory.
	Config.RejuvBuffer = 4; // Number of rejuvenation potions to keep in inventory.

	// Chicken settings
	Config.LifeChicken = 30; // Exit game if life is less or equal to designated percent.
	Config.ManaChicken = 0; // Exit game if mana is less or equal to designated percent.
	Config.MercChicken = 0; // Exit game if merc's life is less or equal to designated percent.
	Config.TownHP = 35; // Go to town if life is under designated percent.
	Config.TownMP = 0; // Go to town if mana is under designated percent.
		
	// AutoBuild System ( See /d2bs/kolbot/libs/config/Builds/README.txt for instructions )
	Config.AutoEquip = false;
	Config.AutoBuild.Enabled = false;			//	This will enable or disable the AutoBuild system
	
	Config.AutoBuild.Template = "BHammer";	//	The name of the build associated with an existing 
												//	template filename located in libs/config/Builds/
	Config.AutoBuild.Verbose = false;			//	Allows script to print messages in console
	Config.AutoBuild.DebugMode = false;			//	Debug mode prints a little more information to console and 
												//	logs activity to /logs/AutoBuild.CharacterName._MM_DD_YYYY.log
												//	It automatically enables Config.AutoBuild.Verbose
}