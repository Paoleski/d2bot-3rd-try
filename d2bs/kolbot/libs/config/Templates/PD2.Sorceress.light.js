// PD2 Sorceress config TEMPLATE — copied by UserAddon build picker.
// Placeholder: __CHAR_NAME__ (replaced with me.name on create).
// Do not LoadConfig this file directly.
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

	// User addon script. Read the description in libs/bots/UserAddon.js
	Scripts.UserAddon = false; // MUST be false for AutoSmurf / area scripts

	// Solo AutoSmurf — TeamSize 1. TeleportingSorc = this char name (leader role).
	Scripts.AutoSmurf = true;
		Config.AutoSmurf.TeamSize = 1;
		Config.AutoSmurf.TeleportingSorc = "__CHAR_NAME__"; // must match character name exactly
		Config.AutoSmurf.BoBarb = ""; // unused in solo
		Config.AutoSmurf.NonSorcChar = []; // unused in solo
		Config.AutoSmurf.AllTeamProfiles = ["__CHAR_NAME__"]; // D2Bot profile name (d2bs.ini section)

	// Battle orders script - Use this for 2+ characters (for example BO barb + sorc)
	Scripts.BattleOrders = false;
		Config.BattleOrders.Mode = 0; // 0 = give BO, 1 = get BO
		Config.BattleOrders.Wait = false; // Idle until the player that received BO leaves.
		Config.BattleOrders.Getters = []; // List of players to wait for before casting Battle Orders (mode 0). All players must be in the same area as the BOer.

	// Team MF system
	Config.MFLeader = false; // Set to true if you have one or more MFHelpers. Opens TP and gives commands when doing normal MF runs.

	// Boss/area scripts

	// *** act 1 ***
	Scripts.Corpsefire = false;
		Config.Corpsefire.ClearDen = false;
	Scripts.Mausoleum = false;
		Config.Mausoleum.KillBloodRaven = false;
		Config.Mausoleum.ClearCrypt = false;
	Scripts.Rakanishu = false;
		Config.Rakanishu.KillGriswold = true;
	Scripts.UndergroundPassage = false;
	Scripts.Coldcrow = false;
	Scripts.Tristram = false;
		Config.Tristram.WalkClear = false; // Disable teleport while clearing to protect leechers
		Config.Tristram.PortalLeech = false; // Set to true to open a portal for leechers.
	Scripts.Pit = false;
		Config.Pit.ClearPit1 = true;
	Scripts.Treehead = false;
	Scripts.Smith = false;
	Scripts.BoneAsh = false;
	Scripts.Countess = false;
		Config.Countess.KillGhosts = false;
	Scripts.Andariel = false;
	Scripts.Cows = false;

	// *** act 2 ***
	Scripts.Radament = false;
	Scripts.Coldworm = false;
		Config.Coldworm.KillBeetleburst = false;
		Config.Coldworm.ClearMaggotLair = false; // Clear all 3 levels
	Scripts.AncientTunnels = false;
		Config.AncientTunnels.OpenChest = false; // Open special chest in Lost City
		Config.AncientTunnels.KillDarkElder = false;
	Scripts.Summoner = false;
		Config.Summoner.FireEye = false;
	Scripts.Tombs = false;
	Scripts.Duriel = false;

	// *** act 3 ***
	Scripts.Stormtree = false;
	Scripts.KurastTemples = false;
	Scripts.Icehawk = false;
	Scripts.Endugu = false;
	Scripts.Travincal = false;
		Config.Travincal.PortalLeech = false; // Set to true to open a portal for leechers.
	Scripts.Mephisto = false; // AutoSmurf only — enabled boss scripts run after AutoSmurf
		Config.Mephisto.MoatTrick = false;
		Config.Mephisto.KillCouncil = false;
		Config.Mephisto.TakeRedPortal = true;

	// *** act 4 ***
	Scripts.OuterSteppes = false;
	Scripts.Izual = false;
	Scripts.Hephasto = false;
	Scripts.Vizier = false; // Intended for classic sorc, kills Vizier only.
	Scripts.FastDiablo = false;
	Scripts.Diablo = false;
		Config.Diablo.WalkClear = false; // Disable teleport while clearing to protect leechers
		Config.Diablo.Entrance = true; // Start from entrance
		Config.Diablo.SealWarning = "Leave the seals alone!";
		Config.Diablo.EntranceTP = "Entrance TP up";
		Config.Diablo.StarTP = "Star TP up";
		Config.Diablo.DiabloMsg = "Diablo";
	Scripts.SealLeader = false; // Clear a safe spot around seals and invite leechers in. Leechers should run SealLeecher script. Don't run with Diablo or FastDiablo.

	// *** act 5 ***
	Scripts.Pindleskin = false;
		Config.Pindleskin.UseWaypoint = false;
		Config.Pindleskin.KillNihlathak = true;
		Config.Pindleskin.ViperQuit = false; // End script if Tomb Vipers are found.
	Scripts.Nihlathak = false;
		Config.Nihlathak.ViperQuit = false; // End script if Tomb Vipers are found.
	Scripts.Eldritch = false;
		Config.Eldritch.OpenChest = true;
		Config.Eldritch.KillShenk = true;
		Config.Eldritch.KillDacFarren = true;
	Scripts.Eyeback = false;
	Scripts.SharpTooth = false;
	Scripts.ThreshSocket = false;
	Scripts.Abaddon = false;
	Scripts.Frozenstein = false;
		Config.Frozenstein.ClearFrozenRiver = true;
	Scripts.Bonesaw = false;
		Config.Bonesaw.ClearDrifterCavern = false;
	Scripts.Snapchip = false;
		Config.Snapchip.ClearIcyCellar = true;
	Scripts.Worldstone = false;
	Scripts.Baal = false;
		Config.Baal.HotTPMessage = "Hot TP!";
		Config.Baal.SafeTPMessage = "Safe TP!";
		Config.Baal.BaalMessage = "Baal!";
		Config.Baal.SoulQuit = false; // End script if Souls (Undead Soul Killers) are found.
		Config.Baal.DollQuit = false; // End script if Dolls (Undead Stigyan Dolls) are found.
		Config.Baal.KillBaal = true; // Kill Baal. Leaves game after wave 5 if false.

	/* ### leeching section ###
	* Unless stated otherwise, leader's character name isn't needed on order to run.
	* Don't use more scripts of the same type! (Run AutoBaal OR BaalHelper, not both)
	*/

	Config.Leader = ""; // Leader's ingame character name. Leave blank to try auto-detection (works in AutoBaal, Wakka, MFHelper)
	Config.QuitList = [""]; // List of character names to quit with. Example: Config.QuitList = ["MySorc", "MyDin"];
	Config.QuitListMode = 0; // 0 = use character names; 1 = use profile names (all profiles must run on the same computer).

	Scripts.TristramLeech = false; // Enters Tristram, attempts to stay close to the leader and will try and help kill.
	Scripts.TravincalLeech = false; // Enters portal at back of Travincal.
		Config.TravincalLeech.Helper = true; // If set to true the character will teleport to the stairs and help attack.
	Scripts.MFHelper = false; // Run the same MF run as the MFLeader. Leader must have Config.MFLeader = true
	Scripts.Wakka = false; // Walking chaos leecher with auto leader assignment, stays at safe distance from the leader
	Scripts.SealLeecher = false; // Enter safe portals to Chaos. Leader should run SealLeader.
	Scripts.DiabloHelper = false; // Chaos helper, kills monsters and doesn't open seals on its own.
		Config.DiabloHelper.Wait = 120; // Seconds to wait for a runner to be in Chaos. If Config.Leader is set, it will wait only for the leader.
		Config.DiabloHelper.Entrance = true; // Start from entrance. Set to false to start from star.
		Config.DiabloHelper.SkipTP = false; // Don't wait for town portal and directly head to chaos. It will clear monsters around chaos entrance and wait for the runner.
		Config.DiabloHelper.SkipIfBaal = false; // End script if there are party members in a Baal run.
	Scripts.AutoBaal = false; // Baal leecher with auto leader assignment
		Config.AutoBaal.FindShrine = false; // false = disabled, 1 = search after hot tp message, 2 = search as soon as leader is found
		Config.AutoBaal.LeechSpot = [15115, 5050]; // X, Y coords of Throne Room leech spot
		Config.AutoBaal.LongRangeSupport = false; // Cast long distance skills from a safe spot
	Scripts.BaalHelper = false;
		Config.BaalHelper.Wait = 120; // Seconds to wait for a runner to be in Throne
		Config.BaalHelper.KillNihlathak = false; // Kill Nihlathak before going to Throne
		Config.BaalHelper.FastChaos = false; // Kill Diablo before going to Throne
		Config.BaalHelper.DollQuit = false;  // End script if Dolls (Undead Soul Killers) are found.
		Config.BaalHelper.KillBaal = true; // Kill Baal. If set to false, you must configure Config.QuitList or the bot will wait indefinitely.
		Config.BaalHelper.SkipTP = false; // Don't wait for a TP, go to WSK3 and wait for someone to go to throne. Anti PK measure.
	Scripts.Follower = false; // Script that follows a manually played leader around like a merc. For a list of commands, see Follower.js

	// *** special scripts ***
	Scripts.WPGetter = false; // Get missing waypoints
	Scripts.GetKeys = false;  // Hunt for T/H/D keys
	Scripts.OrgTorch = false;
		Config.OrgTorch.MakeTorch = true; // Convert organ sets to torches
		Config.OrgTorch.WaitForKeys = true; // Enable Torch System to get keys from other profiles. See libs/TorchSystem.js for more info
		Config.OrgTorch.WaitTimeout = 15; // Time in minutes to wait for keys before moving on
		Config.OrgTorch.UseSalvation = true; // Use Salvation aura on Mephisto (if possible)
		Config.OrgTorch.GetFade = false; // Get fade by standing in a fire. You MUST have Last Wish or Treachery on your character being worn.
	Scripts.Rusher = false; // Rush bot. For a list of commands, see Rusher.js
		Config.Rusher.WaitPlayerCount = 0; // Wait until game has a certain number of players (0 - don't wait, 8 - wait for full game).
		Config.Rusher.Radament = false; // Do Radament quest.
		Config.Rusher.LamEsen = false; // Do Lam Esen quest.
		Config.Rusher.Izual = false; // Do Izual quest.
		Config.Rusher.Shenk = false; // Do Shenk quest.
		Config.Rusher.Anya = false; // Do Anya quest.
		Config.Rusher.LastRun = ""; // End rush after this run. List of runs: http://pastebin.com/Uez3nZ6g
	Scripts.Rushee = false; // Automatic rushee, works with Rusher. Set Rusher's character name as Config.Leader
		Config.Rushee.Quester = false; // Enter portals and get quest items.
		Config.Rushee.Bumper = false; // Do Ancients and Baal. Minimum levels: 20 - norm, 40 - nightmare
	Scripts.CrushTele = false; // classic rush teleporter. go to area of interest and press "-" numpad key
	Scripts.Questing = false; // solves missing quests (skill/stat+shenk)
	Scripts.Gamble = false; // Gambling system, other characters will mule gold into your game so you can gamble infinitely. See Gambling.js
	Scripts.Crafting = false; // Crafting system, other characters will mule crafting ingredients. See CraftingSystem.js
	Scripts.GhostBusters = false; // Kill ghosts in most areas that contain them
	Scripts.Enchant = false;
		Config.Enchant.Triggers = ["chant", "cows", "wps"]; // Chat commands for enchant, cow level and waypoint giving
		Config.Enchant.GetLeg = false; // Get Wirt's Leg from Tristram. If set to false, it will check for the leg in town.
		Config.Enchant.AutoChant = false; // Automatically enchant nearby players and their minions
		Config.Enchant.GameLength = 20; // Game length in minutes
	Scripts.IPHunter = false;
		Config.IPHunter.IPList = []; // List of IPs to look for. example: [165, 201, 64]
		Config.IPHunter.GameLength = 3; // Number of minutes to stay in game if ip wasn't found
	Scripts.KillDclone = false; // Kill Diablo Clone by using Arcane Sanctuary waypoint. Diablo needs to walk the Earth in the game.
	Scripts.ShopBot = false; // Shopbot script. Automatically uses shopbot.nip and ignores other pickits.
		// Supported NPCs: Akara, Charsi, Gheed, Elzix, Fara, Drognan, Ormus, Asheara, Hratli, Jamella, Halbu, Anya. Multiple NPCs are also supported, example: [NPC.Elzix, NPC.Fara]
		// Use common sense when combining NPCs. Shopping in different acts will probably lead to bugs.
		Config.ShopBot.ShopNPC = NPC.Anya;
		// Put item classid numbers or names to scan (remember to put quotes around names). Leave blank to scan ALL items. See libs/config/templates/ShopBot.txt
		Config.ShopBot.ScanIDs = [];
		Config.ShopBot.CycleDelay = 0; // Delay between shopping cycles in milliseconds, might help with crashes.
		Config.ShopBot.QuitOnMatch = false; // Leave game as soon as an item is shopped.
	Scripts.ChestMania = false; // Open chests in configured areas. See sdk/areas.txt
		Config.ChestMania.Act1 = [13, 14, 15, 16, 18, 19]; // List of act 1 areas to open chests in
		Config.ChestMania.Act2 = [55, 59, 65, 66, 67, 68, 69, 70, 71, 72]; // List of act 2 areas to open chests in
		Config.ChestMania.Act3 = [79, 80, 81, 92, 93, 84, 85, 90]; // List of act 3 areas to open chests in
		Config.ChestMania.Act4 = []; // List of act 4 areas to open chests in
		Config.ChestMania.Act5 = [115, 116, 119, 125, 126, 127]; // List of act 5 areas to open chests in
	Scripts.ClearAnyArea = false; // Clear any area. Uses Config.ClearType to determine which type of monsters to kill.
		Config.ClearAnyArea.AreaList = []; // List of area ids to clear. See sdk/areas.txt

	// *** Guest scripts ***

	// Baal Assistant by YourGreatestMember
	Scripts.BaalAssistant = false; // Used to leech or help in baal runs.
		Config.BaalAssistant.Wait = 120; // Seconds to wait for a runner to be in the throne / portal wait / safe TP wait / hot TP wait...
		Config.BaalAssistant.KillNihlathak = false; // Kill Nihlathak before going to Throne
		Config.BaalAssistant.FastChaos = false; // Kill Diablo before going to Throne
		Config.BaalAssistant.Helper = true; // Set to true to help attack, set false to to leech.
		Config.BaalAssistant.GetShrine = false; // Set to true to get a experience shrine at the start of the run.
		Config.BaalAssistant.GetShrineWaitForHotTP = false; // Set to true to get a experience shrine after leader shouts the hot tp message as defined in Config.BaalAssistant.HotTPMessage
		Config.BaalAssistant.SkipTP = false; // Set to true to enable the helper to skip the TP and teleport down to the throne room.
		Config.BaalAssistant.WaitForSafeTP = false; // Set to true to wait for a safe TP message (defined in SafeTPMessage)
		Config.BaalAssistant.DollQuit = false; // Quit on dolls. (Hardcore players?)
		Config.BaalAssistant.SoulQuit = false; // Quit on Souls. (Hardcore players?)
		Config.BaalAssistant.KillBaal = true; // Set to true to kill baal, if you set to false you MUST configure Config.QuitList or Config.BaalAssistant.NextGameMessage or the bot will wait indefinitely.
		Config.BaalAssistant.HotTPMessage = ["Hot"]; // Configure safe TP messages.
		Config.BaalAssistant.SafeTPMessage = ["Safe", "Clear"]; // Configure safe TP messages.
		Config.BaalAssistant.BaalMessage = ["Baal"]; // Configure baal messages, this is a precautionary measure.
		Config.BaalAssistant.NextGameMessage = ["Next Game", "Next", "New Game"];	// Next Game message, this is a precautionary quit command, Reccomended setting up: Config.QuitList

	// Town settings
	Config.HealHP = 50; // Go to a healer if under designated percent of life.
	Config.HealMP = 20; // Mana — only when truly low (90 was town-spam / false "stuck")
	Config.HealStatus = true; // Go to a healer if poisoned or cursed
	Config.UseMerc = true; // Use merc. This is ignored and always false in d2classic.
	Config.MercWatch = false; // Instant merc revive during battle.

	// Potion settings
	Config.UseHP = 75; // Drink a healing potion if life is under designated percent.
	Config.UseRejuvHP = 40;  // Drink a rejuvenation potion if life is under designated percent.
	Config.UseMP = 30; // Drink a mana potion if mana is under designated percent.
	Config.UseRejuvMP = 0; // Drink a rejuvenation potion if mana is under designated percent.
	Config.UseMercHP = 75; // Give a healing potion to your merc if his/her life is under designated percent.
	Config.UseMercRejuv = 0; // Give a rejuvenation potion to your merc if his/her life is under designated percent.
	Config.HPBuffer = 0; // Number of healing potions to keep in inventory.
	Config.MPBuffer = 8; // Mana pots to keep in inventory (backup; belt first)
	Config.RejuvBuffer = 8; // Keep up to 8 rejuvs in inventory (belt is hp/mp only)

	Config.StaminaBuffer = 2; // Keep up to 2 stamina pots in inventory while leveling.
	Config.StaminaUntilLevel = 20; // Buy/pick/drink stamina only while below this level.
	Config.UseStaminaPotion = 35; // Drink a stamina pot when stamina is under this %.

	// Chicken settings
	Config.LifeChicken = 30; // Exit game if life is less or equal to designated percent.
	Config.ManaChicken = 0; // Exit game if mana is less or equal to designated percent.
	Config.MercChicken = 0; // Exit game if merc's life is less or equal to designated percent.
	Config.TownHP = 0; // Go to town if life is under designated percent.
	Config.TownMP = 0; // Go to town if mana is under designated percent.

	/* Inventory lock configuration (PD2 10x8). !!!READ CAREFULLY!!!
	 * 0 = locked — won't be moved/sold/stashed.
	 * 1 = unlocked — bot may drop, stash, sell, or fill with loot/pots.
	 * Town.applyCharmInventoryLock() locks only cells occupied by charms (any row);
	 * junk next to charms stays unlocked and can be sold.
	 */
	Config.Inventory[0] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[1] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[2] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[3] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[4] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[5] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[6] = [1,1,1,1,1,1,1,1,1,1];
	Config.Inventory[7] = [1,1,1,1,1,1,1,1,1,1];

	Config.StashGold = 100000; // Minimum amount of gold to stash.
	// Sell-pick: valuables always; white/blue only if gold < LowGold and vendor >= junk min
	Config.LowGold = 50000;
	Config.SellMinGoldPerSquare = 2500;
	Config.SellMinGoldTotal = 8000;
	Config.SellJunkMinGoldNormal = 5000;
	Config.SellJunkMinGoldHard = 25000;

	/* Potion types for belt columns from left to right.
	 * Rejuvenation potions must always be rightmost.
	 * Supported potions - Healing ("hp"), Mana ("mp") and Rejuvenation ("rv")
	 */
	Config.BeltColumn[0] = "hp";
	Config.BeltColumn[1] = "hp";
	Config.BeltColumn[2] = "mp";
	Config.BeltColumn[3] = "mp";

	/* Minimum amount of potions. If we have less, go to vendor to purchase more.
	 * Set rejuvenation columns to 0, because they can't be bought.
	 */
	Config.MinColumn[0] = 3;
	Config.MinColumn[1] = 3;
	Config.MinColumn[2] = 3;
	Config.MinColumn[3] = 3;

	// Pickit config. Default folder is kolbot/pickit.
	Config.PickitFiles.push("kolton.nip");
	Config.AutoGearBuild = "light";
	include("config/AutoGear.js");
	Config.PickRange = 40; // Pick radius
	Config.FastPick = false; // Check and pick items between attacks

	/* Advanced automule settings
	 * Trigger - Having an item that is on the list will initiate muling. Useful if you want to mule something immediately upon finding.
	 * Force - Items listed here will be muled even if they are ingredients for cubing.
	 * Exclude - Items listed here will be ignored and will not be muled. Items on Trigger or Force lists are prioritized over this list.
	 *
	 * List can either be set as string in pickit format and/or as number referring to item classids. Each entries are separated by commas.
	 * Example :
	 *  Config.AutoMule.Trigger = [639, 640, "[type] == ring && [quality] == unique # [maxmana] == 20"];
	 *  	This will initiate muling when your character finds Ber, Jah, or SOJ.
	 *  Config.AutoMule.Force = [561, 566, 571, 576, 581, 586, 601];
	 *  	This will mule perfect gems/skull during muling.
	 *  Config.AutoMule.Exclude = ["[name] >= talrune && [name] <= solrune", "[name] >= 654 && [name] <= 657"];
	 *  	This will exclude muling of runes from tal through sol, and any essences.
	 */
	Config.AutoMule.Trigger = [];
	Config.AutoMule.Force = [];
	Config.AutoMule.Exclude = [];

	// Additional item info log settings. All info goes to \logs\ItemLog.txt
	Config.ItemInfo = false; // Log stashed, skipped (due to no space) or sold items.
	Config.ItemInfoQuality = []; // The quality of sold items to log. See NTItemAlias.dbl for values. Example: Config.ItemInfoQuality = [6, 7, 8];

	// Item identification settings
	Config.CainID.Enable = true; // Identify at Cain after Rescue Cain (quest 4)
	Config.CainID.MinGold = 0; // No gold gate while leveling
	Config.CainID.MinUnids = 1; // Visit Cain with any unid
	Config.FieldID = false; // Identify items in the field instead of going to town.
	Config.DroppedItemsAnnounce.Enable = false;	// Announce Dropped Items to in-game newbs
	Config.DroppedItemsAnnounce.Quality = []; // Quality of item to announce. See NTItemAlias.dbl for values. Example: Config.DroppedItemsAnnounce.Quality = [6, 7, 8];

	// Manager Item Log Screen
	Config.ShowLowRunes = false; // show/hide low runes (El - Dol) on the item log screen
	Config.ShowMiddleRunes = false; // show/hide middle runes (Hel - Mal) on the item log screen
	Config.ShowHighRunes = true; // show/hide high runes (Ist - Zod) on the item log screen
	Config.ShowLowGems = false; // show/hide low gems (chipped, flawed, normal) on the item log screen
	Config.ShowHighGems = false; // show/hide high gems (flawless, perfect) on the item log screen
	Config.ShowCubingInfo = true; // show/hide the cubing messages on console and item log screen
	Config.SkipLogging = []; // classids/codes to never item-log. Example: ["tes", 656]

	// Repair settings
	Config.CubeRepair = false; // Repair weapons with Ort and armor with Ral rune. Don't use it if you don't understand the risk of losing items.
	Config.RepairPercent = 0; // Only repair when an item is broken (0 durability).

	// Gambling config
	Config.Gamble = false;
	Config.GambleGoldStart = 1000000;
	Config.GambleGoldStop = 500000;

	// List of item names or classids for gambling. Check libs/NTItemAlias.dbl file for other item classids.
	Config.GambleItems.push("Amulet");
	Config.GambleItems.push("Ring");
	Config.GambleItems.push("Circlet");
	Config.GambleItems.push("Coronet");

	/* Cubing config. All recipe names are available in Templates/Cubing.txt. For item names/classids check NTItemAlias.dbl
	 * The format is Config.Recipes.push([recipe_name, item_name_or_classid, etherealness]). Etherealness is optional and only applies to some recipes.
	 */
	Config.Cubing = false; // Set to true to enable cubing.

	// Ingredients for the following recipes will be auto-picked, for classids check libs/NTItemAlias.dbl

	//Config.Recipes.push([Recipe.Gem, "Flawless Amethyst"]); // Make Perfect Amethyst
	//Config.Recipes.push([Recipe.Gem, "Flawless Topaz"]); // Make Perfect Topaz
	//Config.Recipes.push([Recipe.Gem, "Flawless Sapphire"]); // Make Perfect Sapphire
	//Config.Recipes.push([Recipe.Gem, "Flawless Emerald"]); // Make Perfect Emerald
	//Config.Recipes.push([Recipe.Gem, "Flawless Ruby"]); // Make Perfect Ruby
	//Config.Recipes.push([Recipe.Gem, "Flawless Diamond"]); // Make Perfect Diamond
	//Config.Recipes.push([Recipe.Gem, "Flawless Skull"]); // Make Perfect Skull

	//Config.Recipes.push([Recipe.Token]); // Make Token of Absolution

	//Config.Recipes.push([Recipe.Rune, "Pul Rune"]); // Upgrade Pul to Um
	//Config.Recipes.push([Recipe.Rune, "Um Rune"]); // Upgrade Um to Mal
	//Config.Recipes.push([Recipe.Rune, "Mal Rune"]); // Upgrade Mal to Ist
	//Config.Recipes.push([Recipe.Rune, "Ist Rune"]); // Upgrade Ist to Gul
	//Config.Recipes.push([Recipe.Rune, "Gul Rune"]); // Upgrade Gul to Vex

	//Config.Recipes.push([Recipe.Caster.Amulet]); // Craft Caster Amulet
	//Config.Recipes.push([Recipe.Blood.Ring]); // Craft Blood Ring
	//Config.Recipes.push([Recipe.Blood.Helm, "Armet"]); // Craft Blood Armet
	//Config.Recipes.push([Recipe.HitPower.Gloves, "Vambraces"]); // Craft Hit Power Vambraces

	// The gems not used by other recipes will be used for magic item rerolling.

	//Config.Recipes.push([Recipe.Reroll.Magic, "Diadem"]); // Reroll magic Diadem
	//Config.Recipes.push([Recipe.Reroll.Magic, "Grand Charm"]); // Reroll magic Grand Charm (ilvl 91+)

	//Config.Recipes.push([Recipe.Reroll.Rare, "Diadem"]); // Reroll rare Diadem

	/* Base item for the following recipes must be in pickit. The rest of the ingredients will be auto-picked.
	 * Use Roll.Eth, Roll.NonEth or Roll.All to determine what kind of base item to roll - ethereal, non-ethereal or all.
	 */
	//Config.Recipes.push([Recipe.Socket.Weapon, "Thresher", Roll.Eth]); // Socket ethereal Thresher
	//Config.Recipes.push([Recipe.Socket.Weapon, "Cryptic Axe", Roll.Eth]); // Socket ethereal Cryptic Axe
	//Config.Recipes.push([Recipe.Socket.Armor, "Sacred Armor", Roll.Eth]); // Socket ethereal Sacred Armor
	//Config.Recipes.push([Recipe.Socket.Armor, "Archon Plate", Roll.Eth]); // Socket ethereal Archon Plate

	//Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Heavy Gloves", Roll.NonEth]); // Upgrade Bloodfist to Exceptional
	//Config.Recipes.push([Recipe.Unique.Armor.ToExceptional, "Light Gauntlets", Roll.NonEth]); // Upgrade Magefist to Exceptional
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Sharkskin Gloves", Roll.NonEth]); // Upgrade Bloodfist or Grave Palm to Elite
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, "Battle Gauntlets", Roll.NonEth]); // Upgrade Magefist or Lavagout to Elite
	//Config.Recipes.push([Recipe.Unique.Armor.ToElite, "War Boots", Roll.NonEth]); // Upgrade Gore Rider to Elite

	/* Runeword config. All recipes are available in Templates/Runewords.txt
	 * Keep lines follow pickit format and any given runeword is tested vs ALL lines so you don't need to repeat them
	 */
	Config.MakeRunewords = true; // leveling RW via AutoGear (Insight/Spirit stay commented)

	//Config.Runewords.push([Runeword.Insight, "Thresher", Roll.Eth]); // Make Insight Thresher
	//Config.Runewords.push([Runeword.Insight, "Cryptic Axe", Roll.Eth]); // Make Insight Cryptic Axe

	//Config.KeepRunewords.push("[type] == polearm # [meditationaura] == 17");

	//Config.Runewords.push([Runeword.Spirit, "Monarch", Roll.NonEth]); // Make Spirit Monarch
	//Config.Runewords.push([Runeword.Spirit, "Sacred Targe", Roll.NonEth]); // Make Spirit Sacred Targe

	//Config.KeepRunewords.push("[type] == shield || [type] == auricshields # [fcr] == 35");

	// Public game options

	// If LocalChat is enabled, chat can be sent via 'sendCopyData' instead of BNET
	// To allow 'say' to use BNET, use 'say("msg", true)', the 2nd parameter will force BNET
	// LocalChat messages will only be visible on clients running on the same PC
	Config.LocalChat.Enabled = false; // enable the LocalChat system
	Config.LocalChat.Toggle = false; // optional, set to KEY value to toggle through modes 0, 1, 2
	Config.LocalChat.Mode = 0; // 0 = disabled, 1 = chat from 'say' (recommended), 2 = all chat (for manual play)
	// If Config.Leader is set, the bot will only accept invites from leader. If Config.PublicMode is not 0, Baal and Diablo script will open Town Portals.
	Config.PublicMode = 0; // 1 = invite and accept, 2 = accept only, 3 = invite only, 0 = disable
	// Party message settings. Each setting represents an array of messages that will be randomly chosen.
	// $name, $level, $class and $killer are replaced by the player's name, level, class and killer
	Config.Greetings = []; // Example: ["Hello, $name (level $level $class)"]
	Config.DeathMessages = []; // Example: ["Watch out for that $killer, $name!"]
	Config.Congratulations = []; // Example: ["Congrats on level $level, $name!"]
	Config.ShitList = false; // Blacklist hostile players so they don't get invited to party.
	Config.UnpartyShitlisted = false; // Leave party if someone invited a blacklisted player.

	// General config
	Config.AutoMap = false; // Set to true to open automap at the beginning of the game.
	Config.LastMessage = ""; // Message or array of messages to say at the end of the run. Use $nextgame to say next game - "Next game: $nextgame" (works with lead entry point)
	Config.MinGameTime = 60; // Min game time in seconds. Bot will TP to town and stay in game if the run is completed before.
	Config.MaxGameTime = 0; // Maximum game time in seconds. Quit game when limit is reached.
	Config.TeleSwitch = false; // Switch to slot II when teleporting more than 1 node.
	Config.TeleDelay = -1; // -1 = progressive extra delay (Pather.getTeleDelay); >=0 = fixed ms override
	// Progressive EXTRA wait (walk between): Norm A1–2=10s … Hell=0 (game FCR only, no bot delay)
	Config.OpenChests = true; // Open chests while pathing / clearing (range ~20). Controls key buying.
	Config.MiniShopBot = true; // Scan items in NPC shops.
	Config.PacketShopping = false; // Use packets to shop. Improves shopping speed.
	Config.TownCheck = true; // TP to town when out of hp/mp potions
	Config.LogExperience = false; // Print experience statistics in the manager.
	Config.PingQuit = [{Ping: 0, Duration: 0}]; // Quit if ping is over the given value for over the given time period in seconds.

	// Shrines while pathing (priority high→low). 1=Refill/replenish, 2=Health, 3=Mana, 15=Exp, 12=Skill, 13=Mana recharge, 14=Stamina, 7=Combat, 6=Armor
	Config.ScanShrines = [1, 2, 3, 15, 12, 13, 14, 7, 6];
	Config.UseWells = true;
	Config.UseWellHP = 65;
	Config.UseWellMP = 40;

	// MF Switch
	Config.MFSwitchPercent = 0; // Boss life % to switch weapons at. Set to 0 to disable.
	Config.MFSwitch = 0; // MF weapon slot: 0 = slot I, 1 = slot II

	// Speedup config. Full packet casting is not recommended for melee skills.
	Config.FCR = 0; // 0 - disable, 1 to 255 - set value of Faster Cast Rate.
	Config.FHR = 0; // 0 - disable, 1 to 255 - set value of Faster Hit Recovery.
	Config.FBR = 0; // 0 - disable, 1 to 255 - set value of Faster Block Recovery.
	Config.IAS = 0; // 0 - disable, 1 to 255 - set value of Increased Attack Speed.
	Config.PacketCasting = 0; // 0 = disable, 1 = packet teleport, 2 = full packet casting.
	Config.WaypointMenu = true;

	// Anti-hostile config
	Config.AntiHostile = false; // Enable anti-hostile.
	Config.HostileAction = 0; // 0 - quit immediately, 1 - quit when hostile player is sighted, 2 - attack hostile.
	Config.TownOnHostile = false; // Go to town instead of quitting when HostileAction is 0 or 1.
	Config.RandomPrecast = false; // Anti-PK measure, only supported in Baal and BaalHelper and BaalAssisstant at the moment.
	Config.ViperCheck = false; // Quit if revived Tomb Vipers are sighted.

	// DClone config
	Config.StopOnDClone = true; // Go to town and idle as soon as Diablo walks the Earth
	Config.SoJWaitTime = 5; // Time in minutes to wait for another SoJ sale before leaving game. 0 = disabled
	Config.KillDclone = false; // Go to Palace Cellar 3 and try to kill Diablo Clone. Pointless if you already have Annihilus.
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
	// Uncomment the following line to always attempt to kill these bosses despite immunities and mods
	//Config.SkipException = [getLocaleString(2851), getLocaleString(2852), getLocaleString(2853)]; // vizier, de seis, infector

	/* Attack config
	 * To disable an attack, set it to -1
	 * Skills MUST be POSITIVE numbers. For reference see http://pastebin.com/baShRwWM
	 */
	/* Attack skills — set below with SORC_BUILD (fire / light / cold). */
	Config.AttackSkill[0] = -1; // Preattack skill.
	Config.AttackSkill[1] = -1; // Primary skill to bosses.
	Config.AttackSkill[2] = -1; // Primary untimed skill to bosses. Keep at -1 if Config.AttackSkill[1] is untimed skill.
	Config.AttackSkill[3] = -1; // Primary skill to others.
	Config.AttackSkill[4] = -1; // Primary untimed skill to others. Keep at -1 if Config.AttackSkill[3] is untimed skill.
	Config.AttackSkill[5] = -1; // Secondary skill if monster is immune to primary.
	Config.AttackSkill[6] = -1; // Secondary untimed skill if monster is immune to primary untimed.

	// Low mana skills - these will be used if main skills can't be cast.
	Config.LowManaSkill[0] = -1; // Timed low mana skill.
	Config.LowManaSkill[1] = -1; // Untimed low mana skill.

	/* Advanced Attack config. Allows custom skills to be used on custom monsters.
	 *	Format: "Monster Name": [timed skill id, untimed skill id]
	 *	Example: "Baal": [38, -1] to use charged bolt on Baal
	 *	Multiple entries are separated by commas
	 */
	Config.CustomAttack = {
		//"Monster Name": [-1, -1]
	};

	Config.Dodge = false; // Move away from monsters that get too close. Don't use with short-ranged attacks like Poison Dagger.
	Config.DodgeRange = 15; // Distance to keep from monsters.
	Config.DodgeHP = 100; // Dodge only if HP percent is less than or equal to Config.DodgeHP. 100 = always dodge.
	Config.BossPriority = false; // Set to true to attack Unique/SuperUnique monsters first when clearing
	Config.ClearType = 0; // 0 = all monsters (0xF skips normals — bad for leveling clears)
	Config.TeleStomp = false; // Use merc to attack bosses if they're immune to attacks, but not to physical damage

	// Wereform setup. Make sure you read Templates/Attacks.txt for attack skill format.
	Config.Wereform = false; // 0 / false - don't shapeshift, 1 / "Werewolf" - change to werewolf, 2 / "Werebear" - change to werebear

	// Class specific config
	// PD2 Static: 25% current HP (lightning) while above 55/70/85 (N/NM/H). Empty list = unique/bosses.
	Config.CastStatic = 55; // stop-%; clamped up to PD2 floor. 100 = disabled.
	Config.StaticList = []; // empty = Andy/Duriel/Meph/Diablo/Baal/Izual only

	/* ========================================================================
	 * PD2 Sorc builds — skill/stat only (switch with SORC_BUILD).
	 *   "fire"  = Hydra (Odealo S13) + early Fire Bolt/Ball leveling
	 *   "light" = Charged Bolt (your screenshot)
	 *   "cold"  = Frost Nova leveling ? Frozen Orb @30
	 * Template char: __CHAR_NAME__. SORC_BUILD fixed per template file.
	 * ======================================================================== */
	var SORC_BUILD = "light"; // fixed by template (light)

	Config.AutoSkill.Enabled = true;
	Config.AutoSkill.Save = 0;
	Config.AutoSkill.UseUIClick = true; // PD2 — packets broken; UI click only
	// F9 ALWAYS prints cursor coords from ToolsThread (pause bot → open tree → hover → F9).
	// Paste into UIClick below. Do not gate F9 on UICalibrate.
	Config.AutoSkill.UIClick = {
		openButton: [711, 578], // New Skill button — F9 to recalibrate
		tabs: {
			fire: [804, 441],
			lightning: [806, 322],
			cold: [810, 216]
		},
		skills: {
			// Fire tab
			36: { tab: "fire", x: 642, y: 94 },   // Fire Bolt
			37: { tab: "fire", x: 710, y: 98 },   // Warmth
			46: { tab: "fire", x: 574, y: 170 },  // Blaze — not in Hydra build; kept for reference
			47: { tab: "fire", x: 638, y: 232 },  // Fire Ball
			61: { tab: "fire", x: 646, y: 441 },  // Fire Mastery
			62: { tab: "fire", x: 712, y: 441 },  // Hydra
			383: { tab: "fire", x: 714, y: 238 }, // Lesser Hydra (@12)
			// Lightning tab
			38: { tab: "lightning", x: 641, y: 100 }, // Charged Bolt
			42: { tab: "lightning", x: 573, y: 97 },  // Static Field
			43: { tab: "lightning", x: 710, y: 95 },  // Telekinesis
			48: { tab: "lightning", x: 574, y: 235 }, // Nova
			49: { tab: "lightning", x: 641, y: 234 }, // Lightning
			53: { tab: "lightning", x: 641, y: 369 }, // Chain Lightning
			54: { tab: "lightning", x: 710, y: 300 }, // Teleport
			57: { tab: "lightning", x: 574, y: 375 }, // Thunder Storm
			63: { tab: "lightning", x: 641, y: 439 }, // Lightning Mastery
			// Cold tab (F9 calibrated)
			39: { tab: "cold", x: 641, y: 101 },  // Ice Bolt
			40: { tab: "cold", x: 713, y: 99 },   // Cold Enchant — not recalibrated
			44: { tab: "cold", x: 571, y: 166 },  // Frost Nova
			45: { tab: "cold", x: 641, y: 166 },  // Ice Blast
			50: { tab: "cold", x: 713, y: 236 },  // Shiver Armor @12 (NOT Chilling — abroad/F9 calibrated)
			55: { tab: "cold", x: 641, y: 303 },  // Glacial Spike
			59: { tab: "cold", x: 571, y: 376 },  // Blizzard
			60: { tab: "cold", x: 707, y: 370 },  // Chilling Armor @24
			64: { tab: "cold", x: 571, y: 438 },  // Frozen Orb
			65: { tab: "cold", x: 641, y: 438 },  // Cold Mastery
			369: { tab: "cold", x: 641, y: 376 }  // Ice Barrage (PD2)
		}
	};

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
		Config.LowManaSkill[0] = 0; // OOM → normal attack (RMB); ClassAttack also forces this through lvl 12
		Config.LowManaSkill[1] = -1;

		// DumpSkill keeps spending before Teleport @18; Build still prefers TP once available
		Config.AutoSkill.DumpSkill = 36; // Fire Bolt while waiting on level gates
		Config.AutoSkill.Build = [
			[40, 1, false],    // Cold Enchant — merc buff (don't block)
			[36, 1, true],     // Fire Bolt
			[37, 1, true],     // Warmth
			[43, 1, true],     // Telekinesis (Teleport prereq) — take ASAP (lvl 6)
			[54, 1, true],     // Teleport — MAX priority at 18 only (skip until then)
			[42, 1, false],    // Static Field
			[47, 1, true],     // Fire Ball @12
			[50, 1, false],    // Shiver Armor
			[383, 1, true],    // 1 Lesser Hydra @12 (Hydra prereq) — NOT Blaze (coords were LH)
			[62, 1, true],     // unlock Hydra @30
			[62, 20, false],   // max Hydra
			[47, 20, false],   // max Fire Ball
			[36, 20, false],   // max Fire Bolt
			[61, 20, false],   // max Fire Mastery
			[383, 20, false]   // leftover → Lesser Hydra
		];

		// Shared leveling stats: 55 str ~lvl 25, 80 str ~lvl 50; energy bumps early
		Config.AutoStat.Build = [
			["strength", 20], ["vitality", 20],
			["strength", 30], ["vitality", 30],
			["energy", 45], // ~lvl 10-11
			["strength", 45], ["vitality", 40],
			["strength", 55], ["vitality", 50], // ~lvl 25 — gear str
			["energy", 55], // ~lvl 18-25
			["strength", 65], ["vitality", 70],
			["strength", 80], ["vitality", 90], // ~lvl 50
			["vitality", "all"]
		];

	} else if (SORC_BUILD === "light") {
		/* Lightning / Charged Bolt
		 * Early: Warmth → CB dump (skip Static/TK) → Static@12 → TK@13 → CB dump → Teleport@18.
		 * Then Shiver path, max CB / Lightning / TK / LM.
		 * IDs: CB 38, Lightning 49, TK 43, LM 63, TP 54, Warmth 37, Shiver 50, Static 42
		 * Build[i][3] = min charlvl (optional). DumpSkill fills CB between gates.
		 */
		Config.AttackSkill[0] = -1;
		Config.AttackSkill[1] = 36; // Fire Bolt until Charged Bolt is learned
		Config.AttackSkill[2] = -1;
		Config.AttackSkill[3] = 36;
		Config.AttackSkill[4] = -1;
		Config.AttackSkill[5] = 49;
		Config.AttackSkill[6] = -1;
		Config.LowManaSkill[0] = 0; // OOM → normal attack through early levels
		Config.LowManaSkill[1] = -1;

		Config.AutoSkill.DumpSkill = 38; // Charged Bolt while waiting on level gates
		Config.AutoSkill.Build = [
			[37, 1, true],         // Warmth
			[38, 1, true],         // Charged Bolt — then dump CB via DumpSkill
			[42, 1, false, 12],    // Static Field @12
			[43, 1, true, 13],     // Telekinesis @13 (Teleport prereq)
			[54, 1, true],         // Teleport @18 (natural req)
			[40, 1, false, 18],    // Cold Enchant — after Teleport
			[50, 1, false, 18],    // Shiver Armor
			[38, 20, false],       // max Charged Bolt
			[49, 20, false],       // max Lightning
			[43, 20, false],       // max Telekinesis
			[63, 20, false]        // max Lightning Mastery
		];

		// Shared leveling stats: 55 str ~lvl 25, 80 str ~lvl 50; energy bumps early
		Config.AutoStat.Build = [
			["strength", 20], ["vitality", 20],
			["strength", 30], ["vitality", 30],
			["energy", 45], // ~lvl 10-11
			["strength", 45], ["vitality", 40],
			["strength", 55], ["vitality", 50], // ~lvl 25 — gear str
			["energy", 55], // ~lvl 18-25
			["strength", 65], ["vitality", 70],
			["strength", 80], ["vitality", 90], // ~lvl 50
			["vitality", "all"]
		];

	} else {
		/* Cold / Frozen Orb
		 * Leveling: Frost Nova. At 30+: Frozen Orb (FN as untimed while FO timed).
		 * Same util path as fire/light: TK → Teleport@18, Static, Shiver.
		 * FO prereqs in Build: Ice Bolt → Ice Blast → GS → Blizzard → FO.
		 * IDs: IceBolt 39, FrostNova 44, IceBlast 45, GS 55, Blizz 59, FO 64, CM 65
		 *      TK 43, TP 54, Static 42, Shiver 50, Cold Enchant 40, Warmth 37
		 */
		Config.AttackSkill[0] = -1;
		Config.AttackSkill[1] = 39; // Ice Bolt until Frost Nova hard point
		Config.AttackSkill[2] = -1;
		Config.AttackSkill[3] = 39;
		Config.AttackSkill[4] = -1;
		Config.AttackSkill[5] = 0;
		Config.AttackSkill[6] = -1;
		Config.LowManaSkill[0] = 0; // OOM → normal attack through early levels
		Config.LowManaSkill[1] = -1;

		// DumpSkill keeps spending before Teleport @18; ClassAttack switches FN→FO
		Config.AutoSkill.DumpSkill = 44; // Frost Nova while waiting on level gates
		Config.AutoSkill.Build = [
			[37, 1, true],     // Warmth
			[39, 1, true],     // Ice Bolt (early + FO/GS chain)
			[44, 1, true],     // Frost Nova @6 — main leveling attack
			[43, 1, true],     // Telekinesis (Teleport prereq) — take ASAP (lvl 6)
			[54, 1, true],     // Teleport — MAX priority at 18 only (skip until then)
			[42, 1, false],    // Static Field
			[40, 1, false],    // Cold Enchant — Shiver Armor prereq (PD2)
			[50, 1, false],    // Shiver Armor
			[45, 1, true],     // Ice Blast (Glacial Spike prereq)
			[55, 1, true],     // Glacial Spike @18 (Blizzard prereq)
			[59, 1, true],     // Blizzard @24 (Frozen Orb prereq)
			[64, 1, true],     // Frozen Orb @30 — switch to main attack
			[64, 20, false],   // max Frozen Orb
			[65, 20, false],   // max Cold Mastery
			[44, 20, false],   // leftover → Frost Nova
			[39, 20, false]    // leftover → Ice Bolt (FO synergy)
		];

		// Shared leveling stats: 55 str ~lvl 25, 80 str ~lvl 50; energy bumps early
		Config.AutoStat.Build = [
			["strength", 20], ["vitality", 20],
			["strength", 30], ["vitality", 30],
			["energy", 45], // ~lvl 10-11
			["strength", 45], ["vitality", 40],
			["strength", 55], ["vitality", 50], // ~lvl 25 — gear str
			["energy", 55], // ~lvl 18-25
			["strength", 65], ["vitality", 70],
			["strength", 80], ["vitality", 90], // ~lvl 50
			["vitality", "all"]
		];
	}

	print("__CHAR_NAME__ :: SORC_BUILD=" + SORC_BUILD + " (AutoSkill and AutoStat on)");

	// AutoBuild System ( See /d2bs/kolbot/libs/config/Builds/README.txt for instructions )
	Config.AutoBuild.Enabled = false;
	Config.AutoBuild.Template = "BuildName";
	Config.AutoBuild.Verbose = true;
	Config.AutoBuild.DebugMode = true;
}
