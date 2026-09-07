	// AutoBuild System ( See /d2bs/kolbot/libs/config/Builds/README.txt for instructions )
	Config.AutoEquip = true;
	Config.AutoBuild.Enabled = true;	//	This will enable or disable the AutoBuild system

	Config.LowGold = 100000;	
	Config.StashGold = 1000; // Minimum amount of gold to stash.

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

	// Manager Item Log Screen
	Config.LogKeys = false; // Log keys on item viewer
	Config.LogOrgans = true; // Log organs on item viewer
	Config.LogLowRunes = false; // Log low runes (El - Dol) on item viewer
	Config.LogMiddleRunes = true; // Log middle runes (Hel - Mal) on item viewer
	Config.LogHighRunes = true; // Log high runes (Ist - Zod) on item viewer
	Config.LogLowGems = false; // Log low gems (chipped, flawed, normal) on item viewer
	Config.LogHighGems = false; // Log high gems (flawless, perfect) on item viewer
	Config.SkipLogging = []; // Custom log skip list. Set as three digit item code or classid. Example: ["tes", "ceh", 656, 657] will ignore logging of essences.
	Config.ShowCubingInfo = true; // Show cubing messages on console

	// Repair settings
	Config.CubeRepair = false; // Repair weapons with Ort and armor with Ral rune. Don't use it if you don't understand the risk of losing items.
	Config.RepairPercent = 50; // Durability percent of any equipped item that will trigger repairs.

	// Pickit config. Default folder is kolbot/pickit.
	//-----usual-------- 
	Config.PickitFiles.push("auto/White.nip");
	Config.PickitFiles.push("auto/Magic.nip");
	Config.PickitFiles.push("auto/Rare.nip");
	Config.PickitFiles.push("auto/Charms.nip");
	Config.PickitFiles.push("auto/Runes.nip");
	Config.PickitFiles.push("auto/Runeword.nip");
	Config.PickitFiles.push("auto/Set.nip");
	Config.PickitFiles.push("auto/Unique.nip");	
	Config.PickitFiles.push("auto/sell.nip");
	Config.PickitFiles.push("pd2Misc.nip"); // PD2 WSS / maps / stacks

	Config.PickRange = 40; // Pick radius
	Config.FastPick = false; // Check and pick items between attacks
	
	// Town settings
	Config.HealHP = 50; // Go to a healer if under designated percent of life.
	Config.HealMP = 50; // Go to a healer if under designated percent of mana.
	Config.HealStatus = true; // Go to a healer if poisoned or cursed
	Config.UseMerc = true; // Use merc. This is ignored and always false in d2classic.
	Config.MercWatch = true; // Instant merc revive during battle.

	// Potion settings
	Config.UseHP = 80; // Drink a healing potion if life is under designated percent.
	Config.UseRejuvHP = 55;  // Drink a rejuvenation potion if life is under designated percent.
	Config.UseMP = 60; // Drink a mana potion if mana is under designated percent.
	Config.UseRejuvMP = 1; // Drink a rejuvenation potion if mana is under designated percent.
	Config.UseMercHP = 50; // Give a healing potion to your merc if his/her life is under designated percent.
	Config.UseMercRejuv = 20; // Give a rejuvenation potion to your merc if his/her life is under designated percent.
	Config.HPBuffer = 0; // Number of healing potions to keep in inventory.
	Config.MPBuffer = 0; // Number of mana potions to keep in inventory.
	Config.RejuvBuffer = 8; // Number of rejuvenation potions to keep in inventory.

	// Chicken settings
	Config.LifeChicken = 30;//40; // Exit game if life is less or equal to designated percent.
	Config.ManaChicken = 0; // Exit game if mana is less or equal to designated percent.
	Config.MercChicken = 0; // Exit game if merc's life is less or equal to designated percent.
	Config.TownHP = 35;//50; // Go to town if life is under designated percent.
	Config.TownMP = 0; // Go to town if mana is under designated percent.

	// Item identification settings
	Config.CainID.Enable = false; // Identify items at Cain
	Config.CainID.MinGold = 2500000; // Minimum gold (stash + character) to have in order to use Cain.
	Config.CainID.MinUnids = 3; // Minimum number of unid items in order to use Cain.
	Config.FieldID = false; // Identify items in the field instead of going to town.
	Config.DroppedItemsAnnounce.Enable = false;	// Announce Dropped Items to in-game newbs
	Config.DroppedItemsAnnounce.Quality = []; // Quality of item to announce. See NTItemAlias.dbl for values. Example: Config.DroppedItemsAnnounce.Quality = [6, 7, 8];

	// General config
	Config.AutoMap = true; // Set to true to open automap at the beginning of the game.
	Config.LastMessage = ""; // Message or array of messages to say at the end of the run. Use $nextgame to say next game - "Next game: $nextgame" (works with lead entry point)
	Config.MinGameTime = 120; // Min game time in seconds. Bot will TP to town and stay in game if the run is completed before.
	Config.MaxGameTime = 2400; // Maximum game time in seconds. Quit game when limit is reached.
	Config.TeleSwitch = false; // Switch to slot II when teleporting more than 1 node.
	Config.MiniShopBot = false; // Scan items in NPC shops.
	Config.PacketShopping = true; // Use packets to shop. Imporves shopping speed.
	Config.TownCheck = true; // Go to town if out of potions
	//Config.LogExperience = true; // Print experience statistics in the manager.
	Config.PingQuit = [{Ping: 0, Duration: 0}]; // Quit if ping is over the given value for over the given time period in seconds.

	// Shrine Scanner - scan for shrines while moving.
	// Put the shrine types in order of priority (from highest to lowest). For a list of types, see sdk/shrines.txt
	//-----------------------------------------------------------------------------------------------
	// 1 refilling,2 health ,3 mana,6 armor,7 combat,8 resist fire,9 resist cold,10 resist lightning
	// 11 resist poison,12 skill ,13 mana recharge,14 stamina ,15 experience,16 enirhs,17 portal,
	// 18 gem,19 fire,20 monster,21 exploding,22 poison
	//-----------------------------------------------------------------------------------------------
	Config.ScanShrines = [15, 12, 6, 8, 10];
	
	// MF Switch
	Config.MFSwitchPercent = 0; // Boss life % to switch weapons at. Set to 0 to disable.
	Config.MFSwitch = 0; // MF weapon slot: 0 = slot I, 1 = slot II

	// Speedup config. Full packet casting is not recommended for melee skills.
	Config.FCR = 255; // 0 - disable, 1 to 255 - set value of Faster Cast Rate.
	Config.FHR = 255; // 0 - disable, 1 to 255 - set value of Faster Hit Recovery.
	Config.FBR = 255; // 0 - disable, 1 to 255 - set value of Faster Block Recovery.
	Config.IAS = 255; // 0 - disable, 1 to 255 - set value of Increased Attack Speed.
	Config.PacketCasting = 2; // 0 = disable, 1 = packet teleport, 2 = full packet casting.
	Config.WaypointMenu = true; // Set to true for Single and private realms

	// Anti-hostile config
	Config.AntiHostile = false; // Enable anti-hostile.
	Config.HostileAction = 0; // 0 - quit immediately, 1 - quit when hostile player is sighted, 2 - attack hostile.
	Config.TownOnHostile = false; // Go to town instead of quitting when HostileAction is 0 or 1.
	Config.RandomPrecast = false; // Anti-PK measure, only supported in Baal and BaalHelper and BaalAssisstant at the moment.
	Config.ViperCheck = false; // Quit if revived Tomb Vipers are sighted.

	// DClone config
	Config.StopOnDClone = false; // Go to town and idle as soon as Diablo walks the Earth
	Config.SoJWaitTime = 2; // Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
	Config.KillDclone = true; // Go to Palace Cellar 3 and try to kill Diablo Clone. Pointless if you already have Annihilus.
	Config.DCloneQuit = false; // 1 = quit when Diablo walks, 2 = quit on soj sales, 0 = disabled

	// Party message settings. Each setting represents an array of messages that will be randomly chosen.
	// $name, $level, $class and $killer are replaced by the player's name, level, class and killer
	Config.Greetings = []; // Example: ["Hello, $name (level $level $class)"]
	Config.DeathMessages = []; // Example: ["Watch out for that $killer, $name!"]
	Config.Congratulations = []; // Example: ["Congrats on level $level, $name!"]
	Config.ShitList = false; // Blacklist hostile players so they don't get invited to party.
	Config.UnpartyShitlisted = false; // Leave party if someone invited a blacklisted player.

	// Monster skip config
	// Skip immune monsters. Possible options: "fire", "cold", "lightning", "poison", "physical", "magic".
	// You can combine multiple resists with "and", for example - "fire and cold", "physical and cold and poison"
	Config.SkipImmune = [];
	// Skip enchanted monsters. Possible options: "extra strong", "extra fast", "cursed", "magic resistant", "fire enchanted", "lightning enchanted", "cold enchanted", "mana burn", "teleportation", "spectral hit", "stone skin", "multiple shots".
	// You can combine multiple enchantments with "and", for example - "cursed and extra fast", "mana burn and extra strong and lightning enchanted"
	Config.SkipEnchant = [];
	// Skip monsters with auras. Possible options: "fanaticism", "might", "holy fire", "blessed aim", "holy freeze", "holy shock". Conviction is bugged, don't use it.
	Config.SkipAura = [];

	Config.BossPriority = true; // Set to true to attack Unique/SuperUnique monsters first when clearing
	Config.ClearType = 0; // Monster spectype to kill in level clear scripts (ie. Mausoleum). 0xF = skip normal, 0x7 = champions/bosses, 0 = all

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
 
	/*Config.Recipes.push([Recipe.Gem, 560]); // perfect amethyst
	Config.Recipes.push([Recipe.Gem, 565]); // perfect topaz
	Config.Recipes.push([Recipe.Gem, 570]); // perfect sapphire
	Config.Recipes.push([Recipe.Gem, 575]); // perfect emerald
	Config.Recipes.push([Recipe.Gem, 578]); // ruby
	Config.Recipes.push([Recipe.Gem, 579]); // flawless ruby
	Config.Recipes.push([Recipe.Gem, 580]); // perfect ruby
	Config.Recipes.push([Recipe.Gem, 583]); // diamond
	Config.Recipes.push([Recipe.Gem, 584]); // flawless diamond
	Config.Recipes.push([Recipe.Gem, 585]); // perfect diamond
	Config.Recipes.push([Recipe.Gem, 600]); // perfect skull*/

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
	Config.Recipes.push([Recipe.Socket.Armor, "wyrmhide", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "scarabHusk", Roll.Eth]);
	Config.Recipes.push([Recipe.Socket.Armor, "wireFleece", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "boneweave", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "greathauberk", Roll.Eth]); 
	Config.Recipes.push([Recipe.Socket.Armor, "archonPlate", Roll.Eth]); 

	//Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, 335, Roll.NonEth]); // Upgrade Bloodfist to Exceptional
	//Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, 337, Roll.NonEth]); // Upgrade Magefist to Exceptional
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, 381, Roll.NonEth]); // Upgrade Bloodfist or Grave Palm to Elite
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, 383, Roll.NonEth]); // Upgrade Magefist or Lavagout to Elite
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, 389, Roll.NonEth]); // Upgrade Gore Rider to Elite
	Config.Recipes.push([Recipe.Unique.Armor.ToElite, 481, Roll.NonEth]); // Upgrade gildedshield to Elite
	/* Runeword config. All recipes are available in Templates/Runewords.txt
	 * Keep lines follow pickit format and any given runeword is tested vs ALL lines so you don't need to repeat them
	 */
	Config.MakeRunewords = true; // Set to true to enable runeword making/rerolling

	//insight
	Config.Runewords.push([Runeword.Insight, "poleaxe"]);
	Config.Runewords.push([Runeword.Insight, "halberd"]);
	Config.Runewords.push([Runeword.Insight, "bill"]);
	Config.Runewords.push([Runeword.Insight, "battlescythe"]);
	Config.Runewords.push([Runeword.Insight, "partizan"]);
	Config.Runewords.push([Runeword.Insight, "becdecorbin"]);
	Config.Runewords.push([Runeword.Insight, "thresher"]); 
	Config.Runewords.push([Runeword.Insight, "crypticaxe"]); 
	Config.Runewords.push([Runeword.Insight, "greatpoleaxe"]); 
	Config.Runewords.push([Runeword.Insight, "colossusvoulge"]); 
    Config.KeepRunewords.push("[type] == polearm # [meditationaura] <= 17");
	
	//AncientsPledge
	Config.Runewords.push([Runeword.AncientsPledge, "largeshield"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "targe"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "rondache"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "heraldicshield"]);
	Config.Runewords.push([Runeword.AncientsPledge, "aerinshield"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "crownshield"]);
	Config.Runewords.push([Runeword.AncientsPledge, "royalshield"]);
	Config.Runewords.push([Runeword.AncientsPledge, "SacredTarge"]);  
	Config.Runewords.push([Runeword.AncientsPledge, "sacredrondache"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "kurastshield"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "zakarumshield"]); 
	Config.Runewords.push([Runeword.AncientsPledge, "vortexshield"]); 
	Config.KeepRunewords.push("[type] == shield # [FireResist] >= 40 && [LightResist] >= 40 ");
	
    //Lore
	Config.Runewords.push([Runeword.Lore, "cap"]); 
	Config.Runewords.push([Runeword.Lore, "skullcap"]); 
	Config.Runewords.push([Runeword.Lore, "crown"]); 
	Config.Runewords.push([Runeword.Lore, "mask"]); 
	Config.Runewords.push([Runeword.Lore, "bonehelm"]); 
	Config.Runewords.push([Runeword.Lore, "warhat"]); 
	Config.Runewords.push([Runeword.Lore, "grimhelm"]); 
	Config.Runewords.push([Runeword.Lore, "GrandCrown"]);
	Config.Runewords.push([Runeword.Lore, "Demonhead"]);
	Config.Runewords.push([Runeword.Lore, "BoneVisage"]);	
	Config.KeepRunewords.push("[type] == helm # [LightResist] >= 25");
	
	//smoke
	Config.Runewords.push([Runeword.Smoke, "lightplate"]); 
	Config.Runewords.push([Runeword.Smoke, "mageplate"]); 
	Config.Runewords.push([Runeword.Smoke, "quiltedarmor"]); 
	Config.Runewords.push([Runeword.Smoke, "ghostarmor"]); 
	Config.Runewords.push([Runeword.Smoke, "leatherarmor"]); 
	Config.Runewords.push([Runeword.Smoke, "serpentskinarmor"]); 
	Config.Runewords.push([Runeword.Smoke, "hardleatherarmor"]); 
	Config.Runewords.push([Runeword.Smoke, "demonhidearmor"]); 
	Config.Runewords.push([Runeword.Smoke, "studdedleather"]); 
	Config.Runewords.push([Runeword.Smoke, "trellisedarmor"]); 
	Config.Runewords.push([Runeword.Smoke, "ringmail"]); 
	Config.Runewords.push([Runeword.Smoke, "breastplate"]); 
	Config.Runewords.push([Runeword.Smoke, "cuirass"]);
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
	Config.Runewords.push([Runeword.Duress, "duskShroud"]); 
	Config.Runewords.push([Runeword.Duress, "wyrmhide"]); 
	Config.Runewords.push([Runeword.Duress, "scarabHusk"]);
	Config.Runewords.push([Runeword.Duress, "wireFleece"]);
	Config.Runewords.push([Runeword.Duress, "greatHauberk"]); 
	Config.Runewords.push([Runeword.Duress, "boneweave"]);
	Config.Runewords.push([Runeword.Duress, "balrogSkin"]); 
	Config.Runewords.push([Runeword.Duress, "archonPlate"]); 
	Config.KeepRunewords.push("[type] == armor # [ColdResist] == 45 && [LightResist] == 15 "); 
		
	//Enigma
	Config.Runewords.push([Runeword.Enigma, "mageplate"]); 
	Config.KeepRunewords.push("[type] == armor # [itemallskills] == 2"); 
	
	//LastWish
	//Config.Runewords.push([Runeword.LastWish, "phaseblade"]); 
	Config.KeepRunewords.push("[type] == sword # [mightaura] == 17"); 
	
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
	Config.Runewords.push([Runeword.Spirit, "targe"]); 
	Config.Runewords.push([Runeword.Spirit, "rondache"]); 
	Config.Runewords.push([Runeword.Spirit, "heraldicshield"]); 
	Config.Runewords.push([Runeword.Spirit, "aerinshield"]); 
	Config.Runewords.push([Runeword.Spirit, "crownshield"]); 
	Config.Runewords.push([Runeword.Spirit, "akarantarge"]); 
	Config.Runewords.push([Runeword.Spirit, "akaranrondache"]); 
	Config.Runewords.push([Runeword.Spirit, "protectorshield"]); 
	Config.Runewords.push([Runeword.Spirit, "gildedshield"]); 
	Config.Runewords.push([Runeword.Spirit, "royalshield"]); 
	Config.Runewords.push([Runeword.Spirit, "SacredTarge"]);  
	Config.Runewords.push([Runeword.Spirit, "sacredrondache"]); 
	Config.Runewords.push([Runeword.Spirit, "kurastshield"]); 
	Config.Runewords.push([Runeword.Spirit, "zakarumshield"]); 
	Config.Runewords.push([Runeword.Spirit, "vortexshield"]); 
    Config.KeepRunewords.push("[type] == shield || [type] == auricshields # [fcr] <= 35");