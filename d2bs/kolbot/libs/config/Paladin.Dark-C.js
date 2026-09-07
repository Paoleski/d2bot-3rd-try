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
	 * You can modify the following AutoSmurf setting for your AutoSmurf-team
	 */

	Scripts.AutoSmurf = true;
		Config.AutoSmurf.TeamSize = 4;
		Config.AutoSmurf.TeleportingSorc = "Dark-A";  //your leader sor charname.
		Config.AutoSmurf.NonSorcChar = ["Dark-C","Dark-D"]; //all team charname except from leader and boBar
		Config.AutoSmurf.BoBarb = "Dark-B";	//boBar charname
		Config.AutoSmurf.AllTeamProfiles = ["A1","A2","A3","A4"];  //  all team PROFILE Names
		
	/* ### leeching section ###
	* Unless stated otherwise, leader's character name isn't needed on order to run.
	* Don't use more scripts of the same type! (Run AutoBaal OR BaalHelper, not both)
	*/
	Config.Leader = ""; // Leader's ingame character name. Leave blank to try auto-detection (works in AutoBaal, Wakka, MFHelper)
	Config.QuitList = ["Dark-A"]; // team char name except from leader
	Config.QuitListMode = 0; // 0 = use character names; 1 = use profile names (all profiles must run on the same computer).
	//Scripts.FastDiablo = true;
	
	// Pickit config. Default folder is kolbot/pickit.
	//--Pickit for AutoSmurf or for MF only choose one! ---
	//--for AutoSmurf (if playing AutoSmurf, you must uncomment next two lines --
	Config.PickitFiles.push("auto/autoequip_pal.nip");
	include("config/Autoitems.js");	
	//-----for MF (if playing AutoSmurf, you must uncomment next line --
	//include("config/MFitems.js");	

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

	Config.StashGold = 100000; // Minimum amount of gold to stash.

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

	// Public game options
	// If Config.Leader is set, the bot will only accept invites from leader. If Config.PublicMode is not 0, Baal and Diablo script will open Town Portals.
	Config.PublicMode = 2; // 1 = invite and accept, 2 = accept only, 3 = invite only, 0 = disable

	// General config
	Config.LogExperience = false; // Print experience statistics in the manager.

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

	/* Advanced Attack config. Allows custom skills to be used on custom monsters.
	 *	Format: "Monster Name": [attack skill id]
	 *	Multiple entries are separated by commas
	 */
	Config.CustomAttack = {
		//"Monster Name": [-1]
	};

	Config.OpenChests = true; // Open chests. Controls key buying.

	Config.AutoBuild.Template = "BHammer";	//	The name of the build associated with an existing
												//	template filename located in libs/config/Builds/

	Config.AutoBuild.Verbose = true;			//	Allows script to print messages in console
	Config.AutoBuild.DebugMode = false;			//	Debug mode prints a little more information to console and
												//	logs activity to /logs/AutoBuild.CharacterName._MM_DD_YYYY.log
												//	It automatically enables Config.AutoBuild.Verbose
}