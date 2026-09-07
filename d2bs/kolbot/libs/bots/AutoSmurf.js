/**
*	@filename	AutoSmurf.js
*	@author		JeanMax/SiC-666/Dark-f
*	@desc		Questing, Leveling & Smurfing
*	@version	25.11.2030
*/
/*
	Special thanks to : Alogwe, Imba, Kolton, Larryw, Noah, QQValpen, Sam, YGM
	For a specific thank, search for your <3
	Let me know if I forgot some!
*/

function AutoSmurf() {
	if (!isIncluded("common/QuestItems.js")) {
		include("common/QuestItems.js");
	}
 // USER SETTINGS
 // -------- Normal Difficulty -------------
	var stonyLvl = 7, // farm Stony Field until this level, then Cain
		bloodLvl = 12, // Blood Raven after lvl 12
		tristLvl = 15,
		andyLvl = 17, // Normal Andy once party hits this (Teleport still unlocks at 18)
		tombsLvl = 22, // stop tomb clears / start Duriel at this level
		mephLvl = 28,
		baalLvl = 48,
 // -------- Nightmare Difficulty ----------
		mephLvlnm = 48,
		baalLvlnm = 79, //77,
// ---------- Hell Difficulty --------------
		mephLvlhell = 78,
		baalLvlhell = 86,
// Config.AutoSmurf.AllTeamProfiles;

//---------------------------------------be-sure-of-what-you-edit-under-this-line--------------------------------------------//
		placeToBe, teamBrain, nickTP,
		nonSorcChar = false, // SiC-666 TODO: Change this to follower.
		teleportingSorc = false, // SiC-666 TODO: Change this to Leader (should be able to teleport).
		boBarb = false, // SiC-666 TODO: Change this name?
		readyCount = 0,
		iAmReady,
		teamIsReady,
		teamWaypoints = [], // Needs to be a global variable.
		myWaypoints = [], // Needs to be a global variable.
		waypointsToShare = {}, // Needs to be a global variable.
		waypointsToReceive = [], // Needs to be a global variable.
		waypointAreas = [0x03,0x04,0x05,0x06,0x1b,0x1d,0x20,0x23,0x30,0x2a,0x39,0x2b,0x2c,0x34,0x4a,0x2e,0x4c,0x4d,0x4e,0x4f,0x50,0x51,0x53,0x65,0x6a,0x6b,0x6f,0x70,0x71,0x73,0x7b,0x75,0x76,0x81], // Needs to be a global variable.
		whereIwas,
		toldBarb = false,
		boed = 0,
		atWPCount = 0,
		readyToDrink = 0,
		getCube = false,
		cube = false,
		staff = false,
		amulet = false,
		summoner = false,
		tombs = false,
		radament = false,
		killRadament = false,
		LamEssen = false,
		clearOrifice = false,
		duriel = false,
		travincal = false,
		teamFigurine = false,
		figurine = false,
		mephisto = false,
		redPortal = false,
		readyToKillDiablo = 0,
		potion = me.getItem(QuestItems.lifePotion),
		coolStuff = me.getItem(QuestItems.bookSkill) ? me.getItem(QuestItems.bookSkill) : me.getItem(QuestItems.scrollResist), // Book of Skill from Radament or Scroll of Resistance from Malah.
		teamScroll = 0,
		teamFlail = 0,
		teamStaff = 0,
		teamStaff2 = 0,
		boing = 0,
		goBo = 0,
		pick = 0,
		give = 0,
		wait = 0,
		ok = 1,
		mercid = [];
	Messaging.sendToList = function(list, message, mode=55) {
	    return list.forEach((profileName) => {
	        if (profileName.toLowerCase() != me.profile.toLowerCase()) {
	            sendCopyData(null, profileName, mode, JSON.stringify({ nick: me.profile, msg: message }));
	        }
	    });
	};


	// Console + overhead so you can see what the bot is doing.
	// Also broadcast for F11 objective key in ToolsThread.
	this.status = function (msg) {
		print("ÿc2AutoSmurfÿc0 :: ÿc8" + msg + "ÿc0");
		try {
			D2Bot.printToConsole("AutoSmurf: " + msg, 0);
		} catch (e) {}
		try {
			me.overhead(msg);
		} catch (e2) {}
		try {
			scriptBroadcast(JSON.stringify({
				currScript: "AutoSmurf",
				lastAction: msg
			}));
		} catch (e3) {}
		try {
			Messaging.sendToScript("tools/toolsthread.js", JSON.stringify({
				currScript: "AutoSmurf",
				lastAction: msg
			}));
		} catch (e4) {}
	};

//TEAMS
	this.checkRole = function () { // Checks Config settings to determine role.
		if (Config.AutoSmurf.TeleportingSorc === me.name) {
			teleportingSorc = true;
			this.status("I am the Leader");			
		} else if (Config.AutoSmurf.BoBarb === me.name) {
			boBarb = true;
			this.status("I am the BOer");
		} else {
			for (var i = 0 ; i < Config.AutoSmurf.NonSorcChar.length ; i += 1) {
				if (Config.AutoSmurf.NonSorcChar[i] === me.name) {
					nonSorcChar = true;
					this.status("I am a Follower");					
					break;
				}
			}
			if (!nonSorcChar) {
				this.status("I am not assigned a role in my Config file. Please rectify this omission and restart.");
				while(true) {
					delay(1000);
				}
			}
		}
	};

	this.start = function () {
		var i, tpTome, item,
			questStuff = QuestItems.allIds(); // PD2 classids from QuestItems.js
		this.status("starting — town chores");
		if (!me.inTown) {
			Town.goToTown();
		}
		// Heal first if HP/MP low (doChores includes heal; don't buy pots before it)
		if (Town.needHealing()) {
			this.status("Low HP/MP — visiting healer");
		}
		Town.doChores();
		// Check and use quest items that might be left over from the previous game
		if (coolStuff) {
			if (!Town.openStash()) {
				Town.move("stash");
				Town.openStash();
			}
			clickItem(1, coolStuff);
			delay(me.ping);
			me.cancel();
		}
		for (var i = 0 ; i < questStuff.length ; i += 1) {
			item = me.getItem(questStuff[i]);
			if (item && item.location !==7 && item.location !== 6 && Storage.Stash.CanFit(item)) { // Have the item and it's not in Stash or Cube and it can fit in Stash.
				Storage.Stash.MoveTo(i);
				delay(me.ping * 2 + 500);
			}
		}
		// Prefer Act2 when Andy is done / Act2 accessible — don't sit in Act1 for Radament
		if (me.act < 2 && (this.isAndyKilled() || Pather.accessToAct(2) || this.isAct1Done())) {
			this.status("start — moving to Act2 (Radament / Act2 quests)");
			if (!Town.goToTown(2) && me.act < 2) {
				this.changeAct(2);
			}
		}
		//moving to last act before party check
		if (!me.getQuest(7, 0) && (me.getQuest(6, 0) || me.getQuest(6, 1))) {
			Pickit.pickItems();
			this.changeAct(2);
		}
		if (!this.isAct2Done() && this.isAct1Done()) {
			Town.goToTown(2);
		}
		if (!this.isAct2Done() && this.isDurielKilled()) {
			Pickit.pickItems();
			this.changeAct(3);	//getQuest, (14, 0) = completed (talked to meshif), (14, 3) = talked to tyrael, (14, 4) = talked to jerhyn (<3 Imba)
		}
		// Duriel / Act2 done → Act3 town (quest 15 flaky on PD2 — trust isAct2Done)
		if (!me.getQuest(23, 0) && this.isAct2Done() && (me.act >= 3 || Pather.accessToAct(3))) {
			Town.goToTown(3);
		}
		if (!me.getQuest(28, 0) && me.getQuest(23, 0) && (me.act >= 4 || Pather.accessToAct(4))) { // if meph done, but not diablo
			Town.goToTown(4);
		}
		if (!me.getQuest(28, 0) && (me.getQuest(26, 0) || me.getQuest(26, 1))) {
			Pickit.pickItems();
			this.changeAct(5);
		}
		if (me.getQuest(28, 0) ){ // if diablo done
			Town.goToTown(5);
		}
		Pather.useWaypoint(null); // Will walk to and interact with waypoint.
		Pather.moveTo(me.x + rand(-3, 3), me.y + rand(-3, 3)); // Move off of waypoint so others can reach it.
		whereIwas = me.area;
		this.removeUnwearableItems();
		iAmReady = true; // Prevents premature teamIsReady announcment.
		this.status("I am ready");
		Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "ready");		
// Here is modified by Dark-f 2018-2-21
		if ( iAmReady && Config.AutoSmurf.TeamSize === 1 ) {
			teamIsReady = true;
			this.status("Team is ready! Telling others :)");
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "team is ready");
		}
// 2018-2-21
		while (!teamIsReady) {
			delay(500);
		}
		//misc : starting & teams
		if (me.findItem(546) || me.findItem(547) || potion || me.getQuest(20, 1)) { // Have A Jade Figurine, The Golden Bird or the Potion of Life or need to Return to Alkor for Reward. Tell the Teleporting Sorc so she gets us to process it.
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "team figurine");
			teamFigurine = true;
		}
		if(boBarb && me.charlvl >= 24){ //announce bo
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "bo");
		}
		if (me.gold < Config.LowGold) { //teamGold - ask
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "GimmeGold");
		}
		if(me.getItem(QuestItems.inifuss) || me.getItem(QuestItems.cairnKey)){	 //teamscroll
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "GotScroll");
		}
		if (this.hasStaffKings()) { //teamStaff
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "GotStaff");
		}
		if(me.getItem(QuestItems.horadricStaff) || me.getItem("hst")){	 //teamStaff2
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "GotThePower");
		}
		if((me.getItem(QuestItems.khalimEye) && me.getItem(QuestItems.khalimHeart) && me.getItem(QuestItems.khalimBrain)) || me.getItem(174)  ){	 //teamflail
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "ReadyForTravincal");
		}
		if (me.getItem(QuestItems.khalimBrain)){	 //teambrain
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "GotBrain");
		}
		if (!teleportingSorc) { // I'm a follower.
			if (!this.hasCube() && me.area === 40) { // Don't have cube, am in Act 2.
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "need cube");
			}
		}

		// Waypoint share/receive is multiplayer only (TeamSize > 1)
		if (Config.AutoSmurf.TeamSize > 1) {
		var lowestAct, // Doesn't need to be a global variable, but must be declared when all players are in their highest Act.
			startSharing = this.partyLevel(6); // Doesn't need to be a global variable.
		while (!lowestAct) { // Wait for everyone to get back to their Town, then record the lowest Town.
			lowestAct = this.partyAct();
			delay(250);
		}
		this.status("startSharing: " + startSharing + " lowestAct: " + lowestAct);
//---------------------Assembling myWaypoints & Saying In Game---------------------
		var myWaypointsString = "Have: "; // Does not need to be a global variable.
		for (var i = 1 ; i < (me.gametype ? 39 : 30) ; i += 1) { // In Expansion, there are 39 waypoints in total (34 that need to be acquired). In Classic, there are 30 waypoints in total (26 that need to be acquired).
			myWaypoints.push(getWaypoint(i) ? 1 : 0);
			if (i === 8 || i === 17 || i === 26 || i === 29) { // Skip Town Waypoints (0,9,18,27,30).
				i += 1;
			}
		}
//		print("myWaypoints length: " + myWaypoints.length); // Should be 34 in Expansion and 26 in Classic.
		for (var i = 0 ; i < myWaypoints.length ; i += 1) {
			myWaypointsString += myWaypoints[i];
		}
		Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, myWaypointsString); // Announce my Waypoint possession values.
//---------------------End Announcing myWaypoints---------------------
		var j = 0;
		while (teamWaypoints.length !== Config.AutoSmurf.TeamSize - 1) { // Wait for everyone's Waypoint data to be shared and recorded (excluding my own). This will ensure all verbal communications have been processed before proceeding.
			delay(250);
			if (j % 20 == 0) { // Check for Team Members every 5 seconds.
				this.teamInGame();
			}
			j += 1;
		}
		if (pick ===1) { //teamGold - pick
			this.receiveGold();
		}
		if (give ===1) { //teamGold - give
			this.giveGold();
		}
		Town.doChores();

//---------------------Assembling waypointsToReceive & waypointsToShare---------------------
		for (var i = 0 ; i < myWaypoints.length ; i += 1) { 		// Loop thru the myWaypoints list.
			if (startSharing &&										// Team Members need to be at least Level 8, otherwise they might not have a Town Portal Tome.
					i < 8 || 										// Cold Plains thru Catacombs Level 2 have no additional requirements.
					(i >= 8 && i <= 15 && lowestAct > 1) ||			// Sewers Level 2 thru Canyon Of The Magi requires at least Act 2.
					(i >= 16 && i <= 23 && lowestAct > 2) ||		// Spider Forest thru Durance Of Hate Level 2 requires at least Act 3.
					((i === 24 || i === 25) && lowestAct > 3) ||	// City Of The Damned and River Of Flame require at least Act 4.
					(i >= 26 && i <= 33 && lowestAct > 4)) {		// Frigid Highlands thru Worldstone Keep Level 2 requires Act 5.
				if (myWaypoints[i]) { // I have the waypoint.
					for (var j = 0 ; j < teamWaypoints.length ; j += 1) { 	// Loop thru the list of Team Members.
						if (!Number(teamWaypoints[j][i + 1])) { 			// This Team Member is missing the Waypoint (skip Team Member's name by using i + 1).
							if (!waypointsToShare.hasOwnProperty(i)) { 		// The waypointAreas index value isn't an element in the share list object yet.
																			// Example waypointsToShare = {"15" : ["Player1", "Player2", "Player3"]}; Canyon Of The Magi needs to be shared with three players.
								waypointsToShare[i] = []; 					// Add the waypointAreas index value to the share list as an element that contains an array.
							}
							waypointsToShare[i].push(teamWaypoints[j][0]); // Add the Team Member's name to the array to record how many others need to get it from me.
						}
					}
				} else { 	// I don't have the waypoint. Add it to a list of waypoints to receive.
					for (var j = 0 ; j < teamWaypoints.length ; j += 1) { 	// Loop thru the list of Team Members.
						if (Number(teamWaypoints[j][i + 1])) { 				// This Team Member has the Waypoint (skip Team Member's name by using i + 1).
							waypointsToReceive.push(i); 					// Add the waypointAreas index value to the receive list.
							break; // Only need to add to the receive list once.
						}
					}
				}
			}
		}
//---------------------Process Give/Receive Lists---------------------
		this.status("Start sharing Waypoints.");
		for (i in waypointsToShare) {
			this.status("Current waypointsToShare element: " + i);
			while (waypointsToReceive.length) {
				this.status("waypointsToReceive: " + waypointsToReceive[0]);
				if (Number(i) < waypointsToReceive[0]) { // Convert waypointsToShare element to a number (it is a string at this point) and compare it to the number in waypointsToReceive[0].
					break; // Exit while loop because we need to share a Waypoint before receiving this one (waypointsToShare element is a lower waypointAreas index than the lowest waypointAreas index in the waypointsToReceive array).
				}
				this.receiveWaypoint(waypointsToReceive.shift()); // Cut the lowest waypointAreas index from the waypointsToReceive array.
			}
			if (!me.findItem("tbk")) { // No Tome of Town Portal.
				if (me.area !== 1) {
					Pather.useWaypoint(1);
				}
				Town.move("akara");
				var akara = getUnit(1, "akara");
				if (akara) {
					akara.startTrade();
					var scroll = akara.getItem("tsc");
					if (scroll) {
						scroll.buy(); // Buy Scroll of Town Portal from Akara.
					}
					me.cancel();
				}
			}
			Pather.useWaypoint(waypointAreas[i]); // Go to the Waypoint that needs to be given to other players.
			var portal = getUnit(2, 59); // A Town Portal at this stage means someone else is already sharing the Waypoint.
			if (!portal) { // Don't share this Waypoint if someone else is already.
				var player,
					playerList = waypointsToShare[i],
					finishedPlayerCount = Config.AutoSmurf.TeamSize - playerList.length;
				this.status("Sharing a Waypoint in area: " + waypointAreas[i]);
				this.status("playerList.length: " + playerList.length + " finishedPlayerCount: " + finishedPlayerCount);
				if (me.findItem("tbk")) {
					Pather.makePortal();
					Pather.useWaypoint(1);
				} else {
					scroll = me.findItem("tsc");
					if (scroll) {
						scroll.interact(); // Use a Scroll of Town Portal.
					}
					Pather.useWaypoint(1);
				}
				for (var j = 0 ; j <100 ; j += 1 ) { //Here is some wrong, it is too long time to wait. Dark-f < 720 ; j += 1) { // Wait up to 3 minutes Team Members to grab the Waypoint.
					if (playerList.length === 0){ //Dark-f: && Misc.getNearbyPlayerCount() <= finishedPlayerCount) {
						break;
					}
					delay(250);
					if (j % 20 == 0) { // Check for Team Members every 5 seconds.
						this.teamInGame();
					}
					player = getUnit(0); // Get nearby player unit.
					do {
						if (player.name !== me.name) {
							//print("player name is" + player.name);
							if (playerList.indexOf(player.name) > -1) { // Player's name is on the list of players needing this Waypoint.
								playerList.splice(playerList.indexOf(player.name), 1); // Remove player's name from the list.
							}
						}
					} while (player.getNext()); // Loop thru all nearby player units.
				}
			}
		}
		this.status("Done sharing Waypoints. Start receiving Waypoints.");
		this.status("waypointsToReceive.length: " + waypointsToReceive.length);
		while (waypointsToReceive.length) { // Receive any remaining Waypoints.
			this.status("waypointsToReceive: " + waypointsToReceive[0]);
			this.receiveWaypoint(waypointsToReceive.shift()); // Cut the lowest waypointAreas index from the waypointsToReceive array.
		}
		if (me.area !== whereIwas) { // Did share/receive something.
			Pather.useWaypoint(whereIwas); // All done sharing/receiving! Return to original town.
			delay(5000); // Allow the Waypointer Giver a moment to come back to Town.
		}
		this.status("Done receiving Waypoints.");
//---------------------End Waypoint Sharing---------------------
		} // TeamSize > 1 only

		if(boing ===1 && !boBarb){ //being bo
			this.beBo();
		}
		if(boBarb && me.charlvl >= 24){ //giving bo
			this.giveBo();
		}
		return true;
	};

	this.receiveWaypoint = function (index) {
		var townArea;
		this.status("Receiving Waypoint in area: " + waypointAreas[index]);
		if (!me.inTown) {
			Pather.usePortal(null, null); // Attempt taking an existing Town Portal back before using the Waypoint (saves walking to the portal spot).
		}
		if (index < 8) { // Go to the correct Town as determined by the waypointAreas index value.
			townArea = 1;
		} else if (index < 16) {
			townArea = 40;
		} else if (index < 24) {
			townArea = 75;
		} else if (index < 26) {
			townArea = 103;
		} else {
			townArea = 109;
		}
		if (me.area !== townArea) { // Either the attempt to take a Portal back to Town was unsuccessful or the next Waypoint is in a different Act.
			Pather.useWaypoint(townArea);
		}
		if ((index === 13 || index === 14) && !me.getQuest(11 , 0)) { // Palace Cellar Level 1 & Arcane Sanctuary both require completion of The Tainted Sun.
			var drognan;
			while (!drognan || !drognan.openMenu()) { // Try more than once to interact with Drognan.
				Packet.flash(me.gid);
				Town.move("drognan");
				drognan = getUnit(1, "drognan");
				delay(1000);
			}
		}
		if (index === 15 && !me.getQuest(13, 0)) { // Canyon Of The Magi requires completion of The Summoner.
			var cain;
			while (!cain || !cain.openMenu()) { // Try more than once to interact with Deckard Cain.
				Packet.flash(me.gid);
				Town.move("cain");
				cain = getUnit(1, "deckard cain");
				delay(1000);
			}
		}
		if (index === 23 && !me.getQuest(21, 0)) { // Durance Of Hate Level 2 requires completion of The Blackened Temple.
			var cain;
			while (!cain || !cain.openMenu()) { // Try more than once to interact with Deckard Cain.
				Packet.flash(me.gid);
				Town.move("cain");
				cain = getUnit(1, "deckard cain");
				delay(1000);
			}
		}
		Town.move("portalspot");
		for (var j = 0 ; j < 720 ; j += 1) { // Wait up to 3 minutes for a Town Portal to the Waypoint.
			if (Pather.usePortal(waypointAreas[index], null)) {
				break;
			}
			delay(250);
			if (j % 20 == 0) { // Check for Team Members every 5 seconds.
				this.teamInGame();
			}
		}
		this.clickWP();
	};

	this.giveTP = function (nick) {
		this.status("giving TP");
		//(<3 kolton)
		if (!this.nickList) {
			this.nickList = {};
		}
		if (!this.nickList[nick]) {
			this.nickList[nick] = {
				timer: 0
			};
		}
		if (getTickCount() - this.nickList[nick].timer < 60000) {
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "I can only make one Tp per minute ):");
			return false;
		}
		Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "Here you go :)");
		if(me.area !==120){
			if (!Pather.makePortal()) {
				throw new Error("giveTP: Failed to make TP");
			}
			this.nickList[nick].timer = getTickCount();
		}
		return true;
	};

	function chatEvent(nick, msg) {
		if (nick !== me.name)  {
			switch (msg) {
			case "ready":
				readyCount += 1;
				this.status("readyCount = " + readyCount);
				if (iAmReady && readyCount === Config.AutoSmurf.TeamSize - 1) { // Doesn't count my ready because my messages are ignored. Subtract one from TeamSize to account for this.
					if (!teamIsReady) { // Only need to change teamIsReady to true once.
						teamIsReady = true;
						this.status("Team is ready! Telling others :)");
						Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "team is ready");
					}
				}
				break;
			case "team is ready":
				if (!teamIsReady) { // Only need to change teamIsReady to true once.
					teamIsReady = true;
					this.status("Received team is ready!");
				}
				break;
			case "at waypoint":
				atWPCount += 1;
				this.status("atWPCount = " + atWPCount);
				break;
			case "ready to drink":
				readyToDrink += 1;
				this.status("readyToDrink = " + readyToDrink);
				break;
			case "cube":
				cube = true;
				break;
			case "need cube":
				getCube = true;
				break;
			case "staff":
				staff = true;
				break;
			case "amulet":
				amulet = true;
				break;
			case "summoner":
				summoner = true;
				break;
			case "tombs":
				tombs = true;
				break;
			case "radament":
				radament = true;
				break;
			case "kill radament":
				killRadament = true;
				break;
			case "clear orifice":
				clearOrifice = true;
				break;
			case "duriel":
				duriel = true;
				break;
			case "travincal":
				travincal = true;
				break;
			case "team figurine":
				teamFigurine = true;
				break;
			case "figurine":
				figurine = true;
				break;
			case "Lam Essen":
				LamEssen = true;
				break;
			case "mephisto":
				mephisto = true;
				break;
			case "red portal":
				redPortal = true;
				break;
			case "ready to kill diablo":
				readyToKillDiablo += 1;
				this.status("readyToKillDiablo = " + readyToKillDiablo);
				break;
			case "master":
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, nick + " is my master.");
				break;
			case "smurf":
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "Smurf!");
				break;
			case "WaitMe":
				wait = 1;
				break;
			case "hi":
			case "yo!":
			case "hello":
			case "hey":
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "yo");
				break;
			case "I'm here!":
				ok += 1;
				break;
			case "bo":
				boing = 1;
				break;
			case "I'm bored -.-":
				goBo = 1;
				break;
			case "I'm Boed!":
				boed +=  1;
				break;
			case "Ok Bitch":
				if (me.gold < Config.LowGold) {
					pick = 1;
				}
				break;
			case "GimmeGold":
				if (me.gold > Config.LowGold * 2 + 100) {
					Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "Ok Bitch");
					give = 1;
				}
				break;
			case "TP":
			case "Tp":
			case "tp":
			case "portal":
			case "tp plz":
				nickTP = nick;
				this.giveTP(nickTP);
				nickTP = false;
				break;
			case "ReadyForTravincal":
				teamFlail = 1;
				break;
			case "GotScroll":
				teamScroll = 1;
				break;
			case "GotStaff":
				teamStaff = 1;
				break;
			case "GotThePower":
				teamStaff2 = 1;
				break;
			case "GotBrain":
				teamBrain = 1;
				break;
			case (msg.match("Have: ") ? msg : null): // We're comparing if that case's value is equal to our switch term. Thus, if the msg contains "Have: " compare msg to msg (do case), otherwise compare msg to null (don't do case).
				msg = msg.split("Have: ")[1].split(""); // Change msg from a string to an array of 0's and 1's representing waypoint possession.
				msg.unshift(nick); // Add the waypoint owner's name to the front of the array.
				teamWaypoints.push(msg); // Record the Team Member's list of Waypoint possession values. SiC-666 TODO: Should we check to make sure this character's waypoints hasn't been previously recorded?
				break;
			}
		}
	};

	this.playerIn = function (area) {
		if (!area) {
			area = me.area;
		}
		var count = 1,
			party = getParty(); //this is actually counting in game players(you included), not in party
		if (party) {
			do {
				if ( party.area === area ) { //counting players rdy
					count += 1;
				}
			} while (party.getNext());
		}
		if (count < Config.AutoSmurf.TeamSize) {
			return false;
		}
		return true;
	};

	this.needToKeepWaiting = function (area) { // Wait for party members to be in specified area.
		var myPartyId,
			result = false,
			player = getParty(),
			others = 0;

		if (Config.AutoSmurf.TeamSize <= 1) {
			return false;
		}

		if (arguments.length < 1) {
			throw new Error("AutoSmurf.needToKeepWaiting: No area argument supplied.");
		}

		if (!player) {
			// getParty() can fail briefly — don't treat as "keep waiting" forever
			return false;
		}

		myPartyId = player.partyid;

		// Skip self (first entry); only care about other partied chars
		while (player.getNext()) {
			if (player.partyid === myPartyId) {
				others += 1;

				if (player.area !== area) {
					result = true;
				}
			}
		}

		// Nobody else in party → nothing to wait for (solo / unpartied)
		if (others === 0) {
			return false;
		}

		return result;
	};

	this.waitForPartyMembers = function (area) {
		var tick = getTickCount(),
			orgx = me.x,
			orgy = me.y;

		if (Config.AutoSmurf.TeamSize <= 1) {
			return;
		}

		this.status("Waiting for Party Members.");

		if (arguments.length < 1) {
			area = me.area;
		}

		while (this.needToKeepWaiting(area)) {
			if (!me.inTown) {
				Attack.clear(15);
				Pather.moveTo(orgx, orgy);
			}

			delay(1000);

			if (getTickCount() - tick > 10 * 60 * 1000) { // Quit after 10 minutes of waiting.
				quit();
			}
		}
	};

	this.waitForPartyMembersByWaypoint = function () {
		var tick = getTickCount(),
			orgx = me.x,
			orgy = me.y;

		if (Config.AutoSmurf.TeamSize <= 1) {
			return;
		}

		this.status("Waiting for Party Members by Waypoint.");

		while (atWPCount !== Config.AutoSmurf.TeamSize - 1) {
			Attack.clear(15);
			Pather.moveTo(orgx, orgy);
			delay(1000);

			if (getTickCount() - tick > 10 * 60 * 1000) { // Quit after 10 minutes of waiting.
				quit();
			}
		}
	};

	this.getLeaderUnit = function (name) {
		var player = getUnit(0, name);
		if (player) {
			do {
				if (!player.dead) {
					return player;
				}
			} while (player.getNext());
		}
		return false;
	};

	this.closeLeader = function () {
		var leader = this.getLeaderUnit(Config.AutoSmurf.TeleportingSorc);
		if(leader) {
			if(boBarb){
				if (me.area != leader.area)
					return false;
				var count = 0;
				while( getDistance(me, leader) > 3 ) {
					if(!Pather.moveTo(leader.x + 1, leader.y, 5))
						Pather.moveTo(leader.x, leader.y + 1, 5);
					count += 1;
					if(count > 5)
						break;
				}
			}
			return true;
		}
		return false;
	};
	
	this.teamInGame = function (stayInGame) { // Counts all the players in game. If the number of players is below TeamSize either return false or quit game depending on input.
		var i, player,
			count = 0;
		if (stayInGame === undefined) {
			stayInGame = false;
		}
		for (i = 0 ; i < 30 ; i += 1) { // Try 30 times because getParty(); can fail once in a while.
			player = getParty();
			if (player) {
				do {
					count += 1;
				} while (player.getNext());
				break;
			}
			delay(250);
		}
		if (count < Config.AutoSmurf.TeamSize) {
			return stayInGame ? false : quit(); // Return false if stayInGame is true, otherwise leave game.
		}
		return true;
	};

	// Tools of the Trade: Malus turned in / imbue ready = done for progression
	this.isSmithQuestDone = function () {
		return !!(me.getQuest(3, 0) || me.getQuest(3, 1) || me.getQuest(3, 12));
	};

	// Sisters to the Slaughter: Andy dead (0 = fully done, 1 = killed / ready for Warriv)
	this.isAndyKilled = function () {
		return !!(me.getQuest(6, 0) || me.getQuest(6, 1));
	};

	// Act 1 → Act 2 transition complete (quest 7 flaky on PD2 — trust act / Andy+access)
	this.isAct1Done = function () {
		return !!(me.getQuest(7, 0) || me.getQuest(7, 1) || me.act >= 2 ||
			(this.isAndyKilled() && Pather.accessToAct(2)));
	};

	// Seven Tombs / Duriel killed (quest 14 bits — PD2 can leave 15 unset)
	this.isDurielKilled = function () {
		return !!(me.getQuest(14, 0) || me.getQuest(14, 1) || me.getQuest(14, 3) || me.getQuest(14, 4));
	};

	// Act 2 → Act 3 complete (quest 15 flaky on PD2 — trust act / Duriel+access)
	this.isAct2Done = function () {
		return !!(me.getQuest(15, 0) || me.getQuest(15, 1) || me.act >= 3 ||
			(this.isDurielKilled() && Pather.accessToAct(3)));
	};

	// Next Act 3 campaign step (status / F11)
	this.nextAct3Objective = function () {
		if (me.getQuest(23, 0) || me.getQuest(23, 1) || me.act >= 4 || Pather.accessToAct(4)) {
			return "Act 3 done → Act 4";
		}

		if (!me.getQuest(17, 0)) {
			return "Act 3 — Lam Esen's Tome";
		}

		if (!QuestItems.has(QuestItems.khalimEye, "qey") && !QuestItems.has(QuestItems.khalimWill, "qf2") && !me.getQuest(18, 0)) {
			return "Act 3 — Khalim's Eye (Spider Cavern)";
		}

		if (!QuestItems.has(QuestItems.khalimHeart, "qhr") && !QuestItems.has(QuestItems.khalimWill, "qf2") && !me.getQuest(18, 0)) {
			return "Act 3 — Khalim's Heart (Sewers)";
		}

		if (!QuestItems.has(QuestItems.khalimBrain, "qbr") && !QuestItems.has(QuestItems.khalimWill, "qf2") && !me.getQuest(18, 0)) {
			return "Act 3 — Khalim's Brain (Flayer Dungeon)";
		}

		if (!me.getQuest(18, 0) || !me.getQuest(21, 0)) {
			return "Act 3 — Travincal / Khalim's Will";
		}

		if (!me.getQuest(20, 0) && (me.findItem("j34") || me.findItem("g34") || me.findItem("xyz") || me.getQuest(20, 1))) {
			return "Act 3 — Golden Bird / Figurine";
		}

		if (!me.getQuest(20, 0)) {
			return "Act 3 — Golden Bird (when figurine drops) / Mephisto";
		}

		return "Act 3 — Mephisto → Act 4";
	};

	// Radament's Lair (quest 9): 0 = turned in, 1 = killed / book used / ready for Atma
	this.isRadamentDone = function () {
		return !!(me.getQuest(9, 0) || me.getQuest(9, 1));
	};

	// Horadric Cube — classid alone false-misses on PD2; match code "box"
	this.hasCube = function () {
		return QuestItems.has(QuestItems.cube, "box");
	};

	this.hasViper = function () {
		return QuestItems.has(QuestItems.viper, "vip");
	};

	this.hasStaffKings = function () {
		return QuestItems.has(QuestItems.staffKings, "msf");
	};

	this.hasHoradricStaff = function () {
		return QuestItems.has(QuestItems.horadricStaff, "hst");
	};

	// Staff already placed / Horadric Staff quest done
	this.isStaffQuestDone = function () {
		return !!(me.getQuest(10, 0) || me.getQuest(10, 1) || this.hasHoradricStaff());
	};

	// If no hst: fetch missing msf / vip / cube, then cube. Returns true when hst exists.
	this.ensureHoradricStaff = function () {
		var needMsf, needVip, needCube;

		if (me.getQuest(10, 0) || me.getQuest(10, 1)) {
			this.status("ensureStaff — quest 10 already done");
			return true;
		}

		if (this.hasHoradricStaff()) {
			return true;
		}

		needMsf = !this.hasStaffKings();
		needVip = !this.hasViper();
		needCube = !this.hasCube();

		this.status("ensureStaff — missing" +
			(needMsf ? " msf" : "") +
			(needVip ? " vip" : "") +
			(needCube ? " cube" : "") +
			((!needMsf && !needVip && !needCube) ? " (have pieces — cube now)" : ""));

		if (needCube) {
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "cube");
			this.cube();
		}

		if (needMsf && !this.hasHoradricStaff()) {
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "staff");
			this.staff();
		}

		if (needVip && !this.hasHoradricStaff()) {
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "amulet");
			this.amulet();
		}

		if (this.hasHoradricStaff()) {
			return true;
		}

		if (this.hasStaffKings() && this.hasViper() && this.hasCube()) {
			return this.cubeStaff();
		}

		this.status("ensureStaff failed — msf=" + this.hasStaffKings() +
			" vip=" + this.hasViper() + " cube=" + this.hasCube());

		return false;
	};

	this.partyLevel = function (level) {
		if (!level) {
			level = me.charlvl;
		}

		// Solo: don't depend on getParty() (can fail and block Andy forever)
		if (!Config.AutoSmurf || Config.AutoSmurf.TeamSize <= 1) {
			return me.charlvl >= level;
		}

		var i, player;

		for (i = 0; i < 30; i += 1) { // Try 30 times because getParty(); can fail once in a while.
			player = getParty();

			if (player) {
				do {
					if (player.level < level) { // Player is not ready.
						return false;
					}
				} while (player.getNext());

				return true;
			}

			delay(250);
		}

		// getParty failed — fall back to self so we don't soft-lock
		return me.charlvl >= level;
	};

	this.partyAct = function () { // Cycles thru getParty() and returns the lowest Act (i.e., 1-5) the partied characters are in. Quits if noone is partied. Returns false is someone isn't in a Town.
		var i, player, myPartyID, area,
			lowestAct = 5;			
		// Dark-f 2018-2-21
		if(Config.AutoSmurf.TeamSize === 1) {
			lowestAct = [-1, 1, 40, 75, 103, 109].indexOf(me.area);
			return lowestAct;
		}
		// Dark-f 2018-2-21

		for (i = 0 ; i < 30 ; i += 1) { // Try 30 times because getParty(); can fail once in a while.
			player = getParty();
			if (player) {
				myPartyID = player.partyid;
				if (myPartyID === 65535) { // Noone in my Party. Probably a good idea to quit. . .
					throw new Error("AutoSmurf.partyAct: Noone in my Party.");
				}
				while (player.getNext()) {
					if (player.partyid === myPartyID) { // Only check characters in a Party with me.
						area = [-1, 1, 40, 75, 103, 109].indexOf(player.area);
						if (area === -1) { // Player isn't in a Town.
							return false;
						}
						if (area < lowestAct) {
							lowestAct = area;
						}
					}
				}
				break;
			}
			delay(250);
		}
		return lowestAct;
	};

	this.receiveGold = function () {
		var i, goldPile;
		Town.move("stash");
		if (me.getStat(14)) {
			Town.openStash();
			gold(me.getStat(14), 3); // Stash my Gold to make sure I have room to pick more up.
			delay(me.ping * 2 + 500);
			me.cancel();
		}
		for (i = 0; i < 20; i += 1) { // Wait up to 20 seconds for someone to drop Gold for me to pick up.
			goldPile = getUnit(4, 523, 3);
			delay(1000);
			if (goldPile) {
				Pickit.pickItem(goldPile);
			}
			if (me.getStat(14)) {
				Town.openStash();
				gold(me.getStat(14), 3); // Stash my Gold.
				delay(me.ping * 2 + 500);
				me.cancel();
			}
		}
	};

	this.giveGold = function () {
		var i, goldPile,
			dropAmmount = (me.gold - (Config.LowGold * 2)) / 2, // Keep some Gold for myself.
			maxDropAmmount = me.charlvl * 1e4; // The maximum ammount of Gold that can be dropped at once.
		Town.move("stash");
		Town.openStash();
		gold(me.getStat(14), 3); // Stash my Gold.
		delay(me.ping * 2 + 500);
		dropAmmount = dropAmmount > maxDropAmmount ? maxDropAmmount : dropAmmount; // If dropAmmount is greater than maxDropAmmount override it.
		dropAmmount = dropAmmount + me.getStat(14) > maxDropAmmount ? maxDropAmmount - me.getStat(14) : dropAmmount; // Handle residual Gold in Inventory screen (shouldn't ever be an issue, but let's be cautious).
		this.status("Dropping " + Math.round(dropAmmount) + " Gold.");
		gold(Math.round(dropAmmount), 4); // Remove Gold from Stash (must be a round number).
		delay(me.ping * 2 + 500);
		while (me.getStat(14)) {
			gold(me.getStat(14)); // Drop Gold
			delay(me.ping * 2 + 500);
		}
		me.cancel();
		for (i = 0 ; i < 20 ; i += 1) { // Wait 20 seconds for someone to pick up the Gold I've dropped.
			delay(1000);
			goldPile = getUnit(4, 523, 3);
			if (!goldPile) {
				break;
			}
			if (i === 19 && goldPile) {
				Pickit.pickItem(goldPile);
			}
		}
	};

	this.giveBo = function () {
		var orgX, orgY;
		this.status("giving bo");
		var i;
		if (!Pather.accessToAct(2)) {
			Town.goToTown(1);
			while (me.area === 1) { // Be sure to enter Blood Moor.
				Pather.moveToExit(2, true, false);
				delay(me.ping * 2 + 250);
				Packet.flash(me.gid);
				delay(me.ping * 2 + 250);
			}
		} else {
			if (me.getQuest(25, 0) && !getWaypoint(29)) { // Have completed The Fallen Angel and don't have River Of Flame Waypoint.
				Town.goToTown(4);
				me.overhead("Smurfing the waypoint");
				Town.move("portalspot");
				while (!Pather.usePortal(107, null)) {
					Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "tp");
					delay(10000);
				}
				Config.ClearType = false;
				this.clickWP();
			} else if (!me.getQuest(25, 0) && !getWaypoint(8)) { // Haven't completed The Fallen Angel and don't have Catacombs Level 2.
				Town.goToTown(1);
				me.overhead("Smurfing the waypoint");
				Town.move("portalspot");
				while (!Pather.usePortal(35, null)) {
					Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "tp");
					delay(10000);
				}
				Config.ClearType = false;
				this.clickWP();
			} else {
				me.getQuest(26, 0) ? Pather.useWaypoint(107) : Pather.useWaypoint(35);
			}
			var waypoint;
			while (!waypoint) {
				waypoint = getUnit(2, "waypoint");
				delay(250);
			}
			while (getDistance(me, waypoint) < 5) { // Be sure to move off the waypoint.
				Pather.walkTo(me.x + rand(5, 15), me.y);
				delay(me.ping * 2 + 500);
				Packet.flash(me.gid);
				delay(me.ping * 2 + 500);
			}
		}
		this.waitForPartyMembers();
		for (i=0 ; i<2 ; i+=1 ) {
			if (boed === (Config.AutoSmurf.TeamSize - 1)) {
				break;
			}
			this.closeLeader();
			Precast.doPrecast(true);
			this.Bo();
			delay(500);
		}
		Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "I'm bored -.-");
		if(!Pather.accessToAct(2)){
			if(!Pather.moveToExit(1, true)){
				Town.goToTown();
			}
			Town.move("waypoint");
		}else{
			Pather.useWaypoint(whereIwas);
		}
		return true;
	};

	this.beBo = function () {
		var orgX, orgY;
		this.status("being bo");
		if (!Pather.accessToAct(2)) {
			Town.goToTown(1);
			while (me.area === 1) { // Be sure to enter Blood Moor.
				Pather.moveToExit(2, true, false);
				delay(me.ping * 2 + 250);
				Packet.flash(me.gid);
				delay(me.ping * 2 + 250);
			}
		} else {
			if (me.getQuest(25, 0) && !getWaypoint(29)) { // Have completed The Fallen Angel and don't have River Of Flame Waypoint.
				Town.goToTown(4);
				me.overhead("Smurfing the waypoint");
				Town.move("portalspot");
				while (!Pather.usePortal(107, null)) {
					Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "tp");
					delay(10000);
				}
				Config.ClearType = false;
				this.clickWP();
			} else if (!me.getQuest(25, 0) && !getWaypoint(8)) { // Haven't completed The Fallen Angel and don't have Catacombs Level 2.
				Town.goToTown(1);
				me.overhead("Smurfing the waypoint");
				Town.move("portalspot");
				while (!Pather.usePortal(35, null)) {
					Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "tp");
					delay(10000);
				}
				Config.ClearType = false;
				this.clickWP();
			} else {
				me.getQuest(26, 0) ? Pather.useWaypoint(107) : Pather.useWaypoint(35);
			}
			var waypoint;
			while (!waypoint) {
				waypoint = getUnit(2, "waypoint");
				delay(250);
			}
			while (getDistance(me, waypoint) < 5) { // Be sure to move off the waypoint.
				Pather.walkTo(me.x + rand(5, 15), me.y);
				delay(me.ping * 2 + 500);
				Packet.flash(me.gid);
				delay(me.ping * 2 + 500);
			}
		}
		if(teleportingSorc && me.area === 107){ //dark-f: preventing sor not getting bo
			Pather.moveTo(7810, 5918);
		}
		if(me.classid == 3 && me.area === 107)
			Pather.moveTo(7810 + rand(2, 4), 5918+ rand(1, 2));
		this.waitForPartyMembers();
		var j = 0;
		while (goBo !== 1) {
			delay(250);
			if (!toldBarb && me.getState(32) && me.getState(26)) {
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "I'm Boed!");
				toldBarb = true;
			}
			if (j % 20 == 0) { // Check for Team Members every 5 seconds.
				this.teamInGame();
			}
			j += 1;
		}
		if (!Pather.accessToAct(2)) {
			if (!Pather.moveToExit(1, true)) {
				Town.goToTown();
			}
			Town.move("waypoint");
		} else {
			Pather.useWaypoint(whereIwas);
		}
		return true;
	};

	this.Bo = function () { //Dark-f adding
		this.closeLeader();
		if(boBarb) {
			if(me.getSkill(138))
				Skill.Cast(138, 0);
			if(me.getSkill(146))
				Skill.Cast(146, 0);
			if(me.getSkill(155))
				Skill.Cast(155, 0);
			if(me.getSkill(149))
				Skill.Cast(149, 0);
		} else
			delay(2000);
		return true;
	};

//PATHING

	// Own Teleport (or oskill) → leave Pather.teleport on; TeleDelay walks/fights between casts
	this.enableTeleport = function () {
		Pather.teleport = !!(me.getSkill(54, 1) || me.getStat(97, 54));

		return Pather.teleport;
	};

	this.travel = function (goal) { // 0->9, a custom waypoint getter function
		var i, homeTown, nextAreaIndex, oldClearType, target, destination, unit,
			wpAreas = [],
			areaIDs = [];
		oldClearType = Config.ClearType;
		this.enableTeleport();
		if (Pather.teleport) {
			this.status("travel(" + goal + ") — Teleport on (TeleDelay)");
		} else {
			this.status("travel(" + goal + ") — walking (no Teleport skill yet)");
		}
		switch (goal) {
		case 0:
			destination = 5; // Dark Wood
			wpAreas = [1, 3, 4, 5];
			areaIDs = [2, 3, 4, 10, 5];
			homeTown = 1;
			break;
		case 1:
			destination = 35; // Catacombs Level 2
			wpAreas = [1, 3, 4, 5, 6, 27, 29, 32, 35];
			areaIDs = [2, 3, 4, 10, 5, 6, 7, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
			homeTown = 1;
			break;
		case 2:
			destination = 57; // Halls Of The Dead Level 2
			wpAreas = [42, 57]; // Dry Hills, Halls Of The Dead Level 2
			areaIDs = [41, 42, 56, 57]; // Rocky Waste, Dry Hills, Halls Of The Dead Level 1, Halls Of The Dead Level 2
			homeTown = 40;
			break;
		case 3:
			destination = 44; // Lost City
			wpAreas = [42, 43, 44]; // Dry Hills, Far Oasis, Lost City
			areaIDs = [42, 43, 44]; // Dry Hills, Far Oasis, Lost City
			homeTown = 40;
			break;
		case 4:
			destination = 74; // Arcane Sanctuary
			wpAreas = [52, 74];
			areaIDs = [50, 51, 52, 53, 54, 74];
			homeTown = 40;
			break;
		case 5: // Canyon Of The Magi
			destination = 46;
			wpAreas = [52, 74, 46];
			areaIDs = [50, 51, 52, 53, 54, 74, 46];
			homeTown = 40;
			break;
		case 6:
			destination = 83; // Travincal
			wpAreas = [75, 76, 77, 78, 79, 80, 81, 83];
			areaIDs = [76, 77, 78, 79, 80, 81, 82, 83];
			homeTown = 75;
			break;
		case 7:
			destination = 101; // Durance Of Hate Level 2
			wpAreas = [75, 76, 77, 78, 79, 80, 81, 83, 101];
			areaIDs = [76, 77, 78, 79, 80, 81, 82, 83, 100, 101];
			homeTown = 75;
			break;
		case 8:
			destination = 107; // River Of Flame
			wpAreas = [103, 106, 107];
			areaIDs = [104, 105, 106, 107];
			homeTown = 103;
			break;
		case 9:
			destination = 118; // Ancient's Way
			wpAreas = [109, 111, 112, 113, 115, 117, 118];
			areaIDs = [110, 111, 112, 113, 115, 117, 118];
			homeTown = 109;
			break;
		case 10:
			destination = 129; // The Worldstone Keep Level 2
			wpAreas = [109, 111, 112, 113, 115, 117, 118, 129];
			areaIDs = [110, 111, 112, 113, 115, 117, 118, 120, 128, 129];
			homeTown = 109;
			break;
		}
		Town.goToTown();
		Town.move("waypoint");
		target = Pather.plotCourse(destination, me.area); // Pather.plotCourse(destination area id, starting area id);
		nextAreaIndex = areaIDs.indexOf(target.course[0])+1; // Index of next area
		this.status("Travel course = " + target.course);
		if (nextAreaIndex < areaIDs.length) { // If next area index is invalid, return true.
			if (me.inTown && wpAreas.indexOf(target.course[0]) > -1 && // Use waypoint to first area if possible
					getWaypoint(wpAreas.indexOf(target.course[0]))
				) {
				Pather.useWaypoint(target.course[0]); // , !Pather.plotCourse_openedWpMenu); function useWaypoint(targetArea, check) check - force the waypoint menu
			}
			for (nextAreaIndex ; nextAreaIndex < areaIDs.length; nextAreaIndex += 1) {
				this.status("nextAreaIndex = " + nextAreaIndex);
				if (Pather.teleport === true && me.charlvl >= 18) { // If allowed to teleport (determined by the switch above), skip killing monsters.
					Config.ClearType = false;
				}
				switch (areaIDs[nextAreaIndex]) { // Special actions for traveling to some areas
				case 100: // Durance of Hate Level 1
				case 101: // Durance of Hate Level 2
					try{
						Pather.moveToExit(areaIDs[nextAreaIndex], true, false);
					} catch(e) {
						print(e);
						Town.goToTown();
						this.mephisto();
						return true;
					}
					break;
				case 115: // Glacial Trail
				case 117: // Frozen Tundra
				case 118: // Ancient's Way
				case 120: // Arreat Summit
				case 128: // The Worldstone Keep Level 1
				case 129: // The Worldstone Keep Level 2
					try{
						Pather.moveToExit(areaIDs[nextAreaIndex], true, false);
					} catch(e) {
						print(e);
						Town.goToTown();
						Town.move("portalspot");
						delay(10000);
						this.status("Attempting to use any portal");
						while (!Pather.usePortal(129, null)) {
							delay(5000);
						}
						this.clickWP();
						Pather.moveToExit([128, 120, 118], true, false);
						this.clickWP();
						Pather.moveToExit(117, true, false);
						this.clickWP();
						Pather.moveToExit(115, true, false);
						this.clickWP();
						return true;
					}
					break;
				case 50: // Harem Level 1
					if (!Pather.moveToExit(50, true, false)) { // Only try up to three times to enter the Palace. Guard might be blocking the entrance.
						throw new Error("AutoSmurf.travel: Failed to enter the Palace in Act 2.");
					}
					break;
				case 53: // Palace Cellar Level 2
					if (me.diff === 0) {
						if (!Pather.useWaypoint(40)) {
							Town.goToTown(2);
						}
						Town.doChores();
						Pather.useWaypoint(52);
					}
					Pather.moveToExit(53, true, false);
					break;
				case 74: // Arcane Sanctuary
					while (getDistance(me.x, me.y, 10073, 8670) > 10) {
						try {
							Pather.moveTo(10073, 8670, 3, false, false);
						} catch (e) {
							this.status("Caught Error.");
							print(e);
						}
					}
					Pather.usePortal(null);
					break;
				case 46: // Canyon Of The Magi
					try {
						this.summoner();
					} catch(e) {
						print(e);
						Town.goToTown();
						Town.move("portalspot");
						delay(10000);
						while (!Pather.usePortal(areaIDs[nextAreaIndex], null)) {
							delay(10000);
							Pather.usePortal(areaIDs[nextAreaIndex]-1, null);
							delay(10000);
						}
						if(me.area === areaIDs[nextAreaIndex]-1 ){
							Pather.moveToExit(areaIDs[nextAreaIndex], true, Config.ClearType);
						}
						delay(me.ping);
					} finally {
						if (me.area !== areaIDs[nextAreaIndex]) {
							Town.goToTown();
							Town.move("portalspot");
							delay(10000);
							Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "tp");
							while (!Pather.usePortal(areaIDs[nextAreaIndex], null)) {
								delay(1000);
							}
						}
					}
					break;
				case 78: // Flayer Jungle
					try {
						Pather.getWP(78, false); // moveToExit Great Marsh→Flayer often fails
					} catch (eFj) {
						this.status("Flayer Jungle WP: " + eFj);
					}
					break;
				case 110: // Harrogath -> Bloody Foothills
					Pather.moveTo(5026, 5095);
					unit = getUnit(2, 449); // Gate
					if (unit) {
						for (i = 0; i < 10; i += 1) {
							if (unit.mode === 0) {
								sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
							}
							if (unit.mode === 2) {
								break;
							}
							delay(500);
						}
					}
					Pather.moveToExit(areaIDs[nextAreaIndex], true, false);
					break;
				default:
					if (goal <= 1 && me.diff === 0) { // If traveling in a group (all other goals are tele only).
						if (!me.inTown) {
							this.waitForPartyMembers();
						}
					}

					if (!Pather.moveToExit(areaIDs[nextAreaIndex], true, Config.ClearType)) {
						this.status("travel exit failed → " + areaIDs[nextAreaIndex] + " (still area " + me.area + ")");

						if (!me.inTown) {
							Town.goToTown(homeTown === 40 ? 2 : (homeTown === 1 ? 1 : undefined));
						}

						Town.move("waypoint");

						// Resume from nearest owned WP on course if possible
						if (getWaypoint(wpAreas.indexOf(areaIDs[nextAreaIndex])) &&
								wpAreas.indexOf(areaIDs[nextAreaIndex]) > -1) {
							try {
								Pather.useWaypoint(areaIDs[nextAreaIndex]);
							} catch (eWpResume) {
								this.status("travel WP resume failed: " + eWpResume);

								return false;
							}
						} else {
							return false;
						}
					}

					break;
				}

				// Only grab/use WP if we actually arrived in that area (Barracks 28 has no WP!)
				if (me.area === areaIDs[nextAreaIndex] && wpAreas.indexOf(areaIDs[nextAreaIndex]) > -1) {
					this.clickWP();

					if (me.diff === 0 && (goal === 0 || goal === 1) && areaIDs[nextAreaIndex] != destination) {
						this.status("start this.travel() waypoint wait");
						Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "at waypoint");
						this.waitForPartyMembersByWaypoint();
						atWPCount = 0;

						try {
							Pather.useWaypoint(homeTown);
						} catch (eHome) {
							this.status("travel home WP failed — towning");
							Town.goToTown(homeTown === 40 ? 2 : 1);
						}

						this.waitForPartyMembers();
						Town.doChores();
						Town.move("waypoint");

						try {
							Pather.useWaypoint(areaIDs[nextAreaIndex]);
						} catch (eBack) {
							this.status("travel return WP failed: " + eBack);

							return false;
						}

						this.waitForPartyMembers();
						this.status("end this.travel() waypoint wait");
					}
				} else if (wpAreas.indexOf(areaIDs[nextAreaIndex]) > -1 && me.area !== areaIDs[nextAreaIndex]) {
					this.status("skip WP — wanted area " + areaIDs[nextAreaIndex] + " but in " + me.area);
				}
			}
			try {
				if (!Pather.useWaypoint(homeTown)) {
					Town.goToTown(homeTown === 40 ? 2 : (homeTown === 75 ? 3 : (homeTown === 103 ? 4 : (homeTown === 109 ? 5 : 1))));
				}
			} catch (eFinish) {
				Town.goToTown();
			}

			Config.ClearType = oldClearType;
		}
		return true;
	};
	
	this.changeAct = function (act) {
		this.status("change Act " + act);
		var npc, time, tpTome,
			preArea = me.area;
		if (me.act === act) {
			return true;
		}
		try {
			switch (act) {
			case 2:
				if (me.act >= 2) {
					break;
				}
				Town.move("warriv");
				npc = getUnit(1, "warriv");
				if (!npc || !npc.openMenu()) {
					return false;
				}
				Misc.useMenu(0x0D36);
				break;
			case 3:
				if (me.act >= 3) {
					break;
				}
				Town.move("palace");
				npc = getUnit(1, "jerhyn");
				if (!npc || !npc.openMenu()) {
					Pather.moveTo(5166, 5206);
					return false;
				}
				me.cancel();
				tpTome = me.findItem("tbk", 0, 3);
				if (tpTome && tpTome.getStat(70) > 0 ) {
					try{
						Pather.moveToExit(50, true);
						if(!Pather.usePortal(40, null)){
							if(!me.inTown){
								Town.goToTown();
							}
						}
					}catch(e){
						print(e);
					}finally{
						if(!me.inTown){
							Town.goToTown();
						}
					}
				}
				Town.move("meshif");
				npc = getUnit(1, "meshif");
				if (!npc || !npc.openMenu()) {
					return false;
				}
				Misc.useMenu(0x0D38);
				break;
			case 4:
				if (me.act >= 4) {
					break;
				}
				this.mephisto();
				break;
			case 5:
				if (me.act >= 5) {
					break;
				}
				Town.move("tyrael");
				npc = getUnit(1, "tyrael");				
				if (!npc || !npc.openMenu()) {
					return false;
				}
				delay(me.ping + 1);
				if (getUnit(2, 566)) {
					me.cancel();
					Pather.useUnit(2, 566, 109);
				} else {
					Misc.useMenu(0x58D2);
				}
				break;
			}
			delay(1000 + me.ping * 2);
			while (!me.area) {
				delay(500);
			}
			if (me.area === preArea) {
				me.cancel();
				Town.move("portalspot");
				this.status("Act change failed.");
				return false;
			}
		} catch (e) {
			return false;
		}
		for(time=0; time<100 ; time += 1){
			if(this.playerIn()) {
				break;
			}
			if(time>30){
				quit();
			}
		delay(1000);
		}
		return true;
	}; // Dark-f
	
	this.clickWP = function () { // Move to nearest wp and click it.
		var i, j, wp, presetUnit, wpIDs,
			// Always clear mobs on the way to a field WP (Config.ClearType is often false during travel/tele).
			clearToWp = 0,
			clickNear = function () {
				wp = getUnit(2, "waypoint");

				if (!wp) {
					return false;
				}

				for (j = 0; j < 10; j += 1) {
					if (getDistance(me, wp) > 5) {
						Pather.moveToUnit(wp, 0, 0, clearToWp, false);
					}

					sendPacket(1, 0x13, 4, wp.type, 4, wp.gid);
					delay(me.ping * 2 + 500);

					if (getUIFlag(0x14)) {
						delay(me.ping);
						me.cancel();

						return true;
					}

					Packet.flash(me.gid);
					delay(me.ping * 2 + 250);
				}

				return !!getUIFlag(0x14);
			};

		// Town: use known WP coords — never scan field preset ids (323 = Dry Hills, etc.)
		if (me.inTown) {
			this.status("going to town WP");
			Town.move("waypoint");

			if (clickNear()) {
				return true;
			}

			this.status("town WP click failed");

			return false;
		}

		// Already next to a WP unit
		wp = getUnit(2, "waypoint");

		if (wp && getDistance(me, wp) < 50) {
			this.status("going to nearest WP");
			Pather.moveToUnit(wp, 0, 0, clearToWp, false);

			return clickNear();
		}

		// Areas without a field WP — don't poke presets (Jail L2/L3, Barracks, etc.)
		if ([28, 30, 31, 33, 34, 36].indexOf(me.area) > -1) {
			this.status("no WP in area " + me.area + " — skip preset scan");

			return false;
		}

		wpIDs = [119, 145, 156, 157, 237, 238, 288, 323, 324, 398, 402, 429, 494, 496, 511, 539];

		for (i = 0; i < wpIDs.length; i += 1) {
			try {
				presetUnit = getPresetUnit(me.area, 2, wpIDs[i]);
			} catch (ePreset) {
				this.status("getPresetUnit failed area=" + me.area + " — abort WP scan");

				return false;
			}

			if (!presetUnit) {
				continue;
			}

			this.status("going to nearest WP (id " + wpIDs[i] + ")");

			try {
				Pather.moveToPreset(me.area, 2, wpIDs[i], 0, 0, clearToWp, false);
			} catch (e) {
				this.status("Caught Error.");
				print(e);
				continue; // try next preset id — don't stick on a bad one
			}

			if (clickNear()) {
				return true;
			}
		}

		this.status("no WP found in area " + me.area);

		return false;
	};

//STUFF
	this.removeUnwearableItems = function () { // Remove items that can no longer be worn due to a change in Dexterity/Strength. Will try to place in Inventory to be checked against Pickit. Clearinventory sells to NPC if there is no Pickit match.
		var item = me.findItem(null, 1, 1); // Equipped item.
		if (item) {
			do {
				if (!Item.canEquip(item)) {
					this.status("Removing an item I can no longer wear: " + item.name + ".");
					if (Storage.Inventory.CanFit(item)) {
						while (!Storage.Inventory.MoveTo(item)) { // Try to move the item more than once.
							delay(me.ping * 2 + 100);
							Storage.Inventory.MoveTo(item);
							delay(1000);
							Storage.Stash.MoveTo(item);
							me.cancel(1);
							while(me.itemoncursor) {
								delay(1000);
								while(getUIFlag(0x19) || getUIFlag(0x01)) {
									delay(1000);
									me.cancel(1);
								}
								Packet.dropItem(item);  // Why not sell ? Where the Packet.dropItem ? Dark-f 
								item.drop(); //Dark-f: from cubing.js
								delay(me.ping * 2 + 100);
							}
						}
						Pickit.pickItems();
					} else {
						while(me.itemoncursor) {
							delay(1000);
							while(getUIFlag(0x19) || getUIFlag(0x01)) {
								delay(1000);
								me.cancel(1);
							}
							Packet.dropItem(item);  // Why not sell ? Where the Packet.dropItem ? Dark-f 
							item.drop(); //Dark-f: from cubing.js
							delay(me.ping * 2 + 100);
						}
						Pickit.pickItems();
					}
				}
			} while (item.getNext());
		}
	};

	this.getQuestItem = function (classid, chestid) { // Accepts classid only or a classid/chestid combination.
		var i, chest, item, code, tick, townTrips = 0;

		function haveItem() {
			if (code && (me.findItem(code) || me.getItem(code))) {
				return true;
			}

			if (typeof QuestItems !== "undefined" && typeof QuestItems.has === "function" && code) {
				if (QuestItems.has(classid, code)) {
					return true;
				}
			}

			return !!(me.findItem(classid) || me.getItem(classid));
		}

		function itemLabel(it) {
			var n, c;

			if (!it) {
				return code || ("#" + classid);
			}

			n = it.name ? String(it.name).replace(/ÿc[0-9a-z]/gi, "").replace(/^\s+|\s+$/g, "") : "";

			if (n) {
				return n;
			}

			c = it.code ? String(it.code).toLowerCase() : (code || "?");

			return c + "#" + (it.classid !== undefined && it.classid !== null ? it.classid : classid);
		}

		function findGround() {
			var it = getUnit(4, classid) || (code ? getUnit(4, code) : null),
				u;

			if (it) {
				return it;
			}

			if (!code && classid === undefined) {
				return null;
			}

			u = getUnit(4);

			if (!u) {
				return null;
			}

			do {
				if ((u.mode === 3 || u.mode === 5) &&
						((code && u.code && String(u.code).toLowerCase() === code) || u.classid === classid)) {
					return copyUnit(u);
				}
			} while (u.getNext());

			return null;
		}

		code = (typeof QuestItems !== "undefined" && QuestItems.codeForClassid) ? QuestItems.codeForClassid(classid) : null;

		if (classid === QuestItems.inifuss) {
			code = code || "bks";
		} else if (classid === QuestItems.cairnKey) {
			code = code || "bkd";
		} else if (classid === QuestItems.bookSkill) {
			code = code || "ass";
		} else if (classid === QuestItems.viper) {
			code = code || "vip";
		} else if (classid === QuestItems.staffKings) {
			code = code || "msf";
		} else if (classid === QuestItems.cube) {
			code = code || "box";
		} else if (classid === QuestItems.lamEsen) {
			code = code || "bbb";
		} else if (classid === QuestItems.khalimEye) {
			code = code || "qey";
		} else if (classid === QuestItems.khalimHeart) {
			code = code || "qhr";
		} else if (classid === QuestItems.khalimBrain) {
			code = code || "qbr";
		} else if (classid === QuestItems.khalimFlail) {
			code = code || "qf1";
		} else if (classid === QuestItems.khalimWill) {
			code = code || "qf2";
		}

		if (haveItem()) {
			return true;
		}

		if (me.inTown) {
			return false;
		}

		if (arguments.length > 1) {
			chest = getUnit(2, chestid);

			if (chest) {
				Misc.openChest(chest);
			}
		}

		for (i = 0; i < 75; i += 1) {
			item = findGround();

			if (item) {
				break;
			}

			delay(40);
		}

		tick = getTickCount();

		while (!haveItem()) {
			item = findGround();

			if (item) {
				if (getDistance(me, item) > 10) {
					Pather.moveToUnit(item);
				}

				if (Storage.Inventory.CanFit(item)) {
					Pickit.pickItem(item);
					delay(me.ping * 2 + 500);
					tick = getTickCount();
				} else if (townTrips < 2 && (Pickit.canMakeRoom() || Config.MakeRoom)) {
					this.status("ÿc7Trying to make room for " + Pickit.itemColor(item) + itemLabel(item));
					townTrips += 1;
					Town.visitTown(); // often >15s — never count town time toward the pick timeout
					tick = getTickCount();
				} else {
					this.status("ÿc7Not enough room for " + Pickit.itemColor(item) + itemLabel(item));
					return false;
				}
			} else if (getTickCount() - tick > 20000) {
				return haveItem();
			} else {
				delay(40);
			}

			if (getTickCount() - tick > 20000) {
				return haveItem();
			}
		}

		return true;
	};

	this.toInventory = function () {
		this.status("toInventory");
		var i, items = [], item, code, want;

		want = ["hst", "qf2", "qf1", "qey", "qhr", "qbr"];

		if (!Town.openStash()) {
			Town.openStash();
		}

		item = me.getItem(-1, 0);

		if (item) {
			do {
				code = item.code ? String(item.code).toLowerCase() : "";

				if (want.indexOf(code) > -1 ||
						item.classid === QuestItems.horadricStaff ||
						item.classid === QuestItems.khalimWill ||
						item.classid === QuestItems.khalimFlail ||
						item.classid === QuestItems.khalimEye ||
						item.classid === QuestItems.khalimHeart ||
						item.classid === QuestItems.khalimBrain) {
					items.push(copyUnit(item));
				}
			} while (item.getNext());
		}

		for (i = 0; i < items.length; i += 1) {
			if (items[i].location === 3) {
				continue; // already inventory
			}

			if (!Storage.Inventory.CanFit(items[i])) {
				Town.clearInventory(); // make room for quest staff
			}

			if (Storage.Inventory.CanFit(items[i])) {
				Storage.Inventory.MoveTo(items[i]);
			} else {
				this.status("toInventory: no room for " + (items[i].code || items[i].classid));
			}
		}

		delay(500 + me.ping);
		me.cancel();
		return true;
	};

	this.cubeStaff = function () {
		this.status("cubing staff");
		var amulet = QuestItems.find(QuestItems.viper, "vip") || me.getItem("vip"),
			staff = QuestItems.find(QuestItems.staffKings, "msf") || me.getItem("msf"),
			cube, cubeItems, hst, i;

		if (this.hasHoradricStaff()) {
			this.status("already have Horadric Staff");
			return true;
		}

		if (!staff || !amulet) {
			this.status("cubeStaff failed: missing msf=" + !!staff + " vip=" + !!amulet);
			return false;
		}

		cube = QuestItems.getCube();

		if (!cube) {
			this.status("cubeStaff failed: no cube (box/566)");
			return false;
		}

		Town.goToTown(2);
		Town.move("stash");

		// Clear sticky cursor from a prior failed MoveTo
		if (me.itemoncursor) {
			me.cancel();
			delay(200 + me.ping);
		}

		if (!Town.openStash()) {
			Town.openStash();
		}

		Storage.Reload();

		// Make room — dump anything already in the cube
		cubeItems = me.findItems(-1, -1, 6);

		if (cubeItems && cubeItems.length) {
			Cubing.openCube();
			Cubing.emptyCube();
			me.cancel();
			delay(200 + me.ping);

			if (!Town.openStash()) {
				Town.openStash();
			}

			Storage.Reload();
			amulet = QuestItems.find(QuestItems.viper, "vip") || me.getItem("vip");
			staff = QuestItems.find(QuestItems.staffKings, "msf") || me.getItem("msf");

			if (!staff || !amulet) {
				this.status("cubeStaff failed: lost msf/vip after emptyCube");
				return false;
			}
		}

		if (!Storage.Cube.MoveTo(amulet)) {
			this.status("cubeStaff failed: MoveTo cube (vip loc=" + amulet.location + ")");
			return false;
		}

		if (!Storage.Cube.MoveTo(staff)) {
			this.status("cubeStaff failed: MoveTo cube (msf loc=" + staff.location + ")");
			return false;
		}

		if (!Cubing.openCube()) {
			this.status("cubeStaff failed: openCube (check box/566)");
			return false;
		}

		transmute();
		delay(1000 + me.ping);

		if (!Cubing.emptyCube()) {
			this.status("cubeStaff: emptyCube failed — trying inventory pull");
		}

		me.cancel();
		delay(300 + me.ping);

		for (i = 0; i < 5; i += 1) {
			hst = QuestItems.find(QuestItems.horadricStaff, "hst") || me.getItem("hst");

			if (hst) {
				break;
			}

			delay(300);
		}

		if (!hst) {
			this.status("cubeStaff FAILED — no hst after transmute");
			return false;
		}

		// Keep in inventory for placeStaff
		if (hst.location !== 3) {
			Town.openStash();
			Storage.Inventory.MoveTo(hst);
			me.cancel();
		}

		this.status("cubed Horadric Staff ok");
		Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "GotThePower");
		return true;
	};

	this.placeStaff = function () {
		this.status("place staff");
		var staff, orifice, hole, i,
			tick = getTickCount(),
			preArea = me.area;

		if (me.getQuest(10, 0)) {
			this.status("staff already placed (quest 10 done)");
			return true;
		}

		Town.goToTown();
		Town.move("stash");
		this.toInventory();

		staff = QuestItems.find(QuestItems.horadricStaff, "hst") || me.getItem("hst");

		if (!staff) {
			// Missing hst — farm whatever piece is missing, then cube
			if (!this.ensureHoradricStaff()) {
				this.status("placeStaff: no Horadric Staff (hst) — missing pieces");
				return false;
			}

			this.toInventory();
			staff = QuestItems.find(QuestItems.horadricStaff, "hst") || me.getItem("hst");
		}

		if (!staff) {
			this.status("placeStaff: no Horadric Staff (hst) in stash/inv/cube");
			return false;
		}

		if (staff.location !== 3) {
			Town.openStash();

			if (!Storage.Inventory.CanFit(staff)) {
				Town.clearInventory();
			}

			if (!Storage.Inventory.MoveTo(staff)) {
				this.status("placeStaff: cannot move hst to inventory");
				me.cancel();
				return false;
			}

			me.cancel();
		}

		Town.move("portalspot");

		if (!Pather.usePortal(preArea, me.name)) {
			throw new Error("placeStaff: Failed to take TP");
		}

		delay(500 + me.ping);
		Pather.moveToPreset(me.area, 2, 152, 0, 0, false, false);
		delay(300 + me.ping);

		orifice = getUnit(2, 152);

		if (!orifice) {
			this.status("placeStaff: orifice 152 not found");
			return false;
		}

		// Orifice is not a chest — click/interact until insert UI, then submit
		for (i = 0; i < 5; i += 1) {
			Pather.moveToUnit(orifice, 0, 0);
			Misc.click(0, 0, orifice);

			try {
				if (typeof orifice.interact === "function") {
					orifice.interact();
				}
			} catch (eOr) {}

			sendPacket(1, 0x13, 4, orifice.type, 4, orifice.gid);
			delay(400 + me.ping);

			staff = QuestItems.find(QuestItems.horadricStaff, "hst") || me.getItem("hst");

			if (!staff) {
				break; // already consumed?
			}

			if (staff.location !== 3) {
				this.status("placeStaff: staff left inventory — abort");
				return false;
			}

			if (!staff.toCursor()) {
				delay(200);
				continue;
			}

			delay(200 + me.ping);
			submitItem();
			delay(750 + me.ping);

			// Staff consumed = success
			if (!me.getItem("hst") && !QuestItems.find(QuestItems.horadricStaff, "hst")) {
				this.status("staff submitted to orifice");
				break;
			}

			// Cursor stuck — put back
			staff = getUnit(100);

			if (staff) {
				Storage.Inventory.MoveTo(staff);
			}
		}

		// Wait briefly for Duriel portal hole
		for (i = 0; i < 20; i += 1) {
			hole = getUnit(2, 100);

			if (hole || me.getQuest(10, 0)) {
				this.status("orifice open / quest 10 ready");
				return true;
			}

			delay(500);
		}

		if (!me.getItem("hst") && !QuestItems.has(QuestItems.horadricStaff, "hst")) {
			// Staff gone — likely placed even if hole slow
			return true;
		}

		this.status("placeStaff: staff still present, hole not seen (elapsed " + (getTickCount() - tick) + "ms)");
		return false;
	};

	this.cubeFlail = function () {
		var eye, heart, brain, flail, i, cube;

		this.status("cubing flail");

		if (QuestItems.has(QuestItems.khalimWill, "qf2") || me.getItem("qf2")) {
			this.status("already have Khalim's Will (qf2)");

			return true;
		}

		this.toInventory(); // pull qey/qhr/qbr/qf1 from stash

		eye = QuestItems.find(QuestItems.khalimEye, "qey") || me.getItem("qey");
		heart = QuestItems.find(QuestItems.khalimHeart, "qhr") || me.getItem("qhr");
		brain = QuestItems.find(QuestItems.khalimBrain, "qbr") || me.getItem("qbr");
		flail = QuestItems.find(QuestItems.khalimFlail, "qf1") || me.getItem("qf1");

		if (!eye || !heart || !brain || !flail) {
			this.status("cubeFlail failed: missing eye=" + !!eye + " heart=" + !!heart +
				" brain=" + !!brain + " flail=" + !!flail);

			return false;
		}

		cube = QuestItems.getCube ? QuestItems.getCube() : (me.getItem("box") || me.getItem(QuestItems.cube));

		if (!cube) {
			this.status("cubeFlail failed: no cube (box)");

			return false;
		}

		Town.move("stash");

		if (!Town.openStash()) {
			Town.openStash();
		}

		// Prefer inventory for Cube.MoveTo
		[eye, heart, brain, flail].forEach(function (it) {
			if (it && it.location !== 3 && it.location !== 6) {
				Storage.Inventory.MoveTo(it);
			}
		});

		eye = QuestItems.find(QuestItems.khalimEye, "qey") || me.getItem("qey");
		heart = QuestItems.find(QuestItems.khalimHeart, "qhr") || me.getItem("qhr");
		brain = QuestItems.find(QuestItems.khalimBrain, "qbr") || me.getItem("qbr");
		flail = QuestItems.find(QuestItems.khalimFlail, "qf1") || me.getItem("qf1");

		if (!eye || !heart || !brain || !flail) {
			this.status("cubeFlail failed: lost ingredient after MoveTo inv");

			return false;
		}

		Storage.Cube.MoveTo(eye);
		Storage.Cube.MoveTo(heart);
		Storage.Cube.MoveTo(brain);
		Storage.Cube.MoveTo(flail);

		if (!Cubing.openCube()) {
			this.status("cubeFlail failed: openCube");

			return false;
		}

		transmute();
		delay(750 + me.ping);
		Cubing.emptyCube();
		me.cancel();
		delay(300 + me.ping);

		for (i = 0; i < 12; i += 1) {
			if (QuestItems.has(QuestItems.khalimWill, "qf2") || me.getItem("qf2")) {
				this.status("cubed Khalim's Will ok");

				return true;
			}

			delay(200);
		}

		this.status("cubeFlail FAILED — no qf2 after transmute");

		return false;
	};

	this.equipFlail = function () {
		var finishedFlail, i, cursorItem;

		this.toInventory();

		for (i = 0; i < 8; i += 1) {
			finishedFlail = QuestItems.find(QuestItems.khalimWill, "qf2") || me.getItem("qf2") ||
				me.getItem(QuestItems.khalimWill);

			if (finishedFlail) {
				break;
			}

			delay(200);
		}

		if (!finishedFlail) {
			this.status("equipFlail: no Khalim's Will (qf2) — skip smash this pass");

			return false;
		}

		if (finishedFlail.location === 7) {
			if (!Town.openStash()) {
				Town.openStash();
			}

			if (!Storage.Inventory.MoveTo(finishedFlail)) {
				this.status("equipFlail: cannot move qf2 to inventory");

				return false;
			}

			finishedFlail = QuestItems.find(QuestItems.khalimWill, "qf2") || me.getItem("qf2");
		}

		if (!finishedFlail) {
			this.status("equipFlail: lost qf2 after stash pull");

			return false;
		}

		if (!Item.equip(finishedFlail, 4)) {
			Pickit.pickItems();
			this.status("equipFlail: Failed to equip Khalim's Will");

			return false;
		}

		if (me.itemoncursor) { // Keep previous weapon in inventory
			cursorItem = getUnit(100);

			if (cursorItem) {
				if (Storage.Inventory.CanFit(cursorItem)) {
					print("ÿc2AutoSmurfÿc0 :: Keeping weapon by force.");
					Storage.Inventory.MoveTo(cursorItem);
				} else {
					me.cancel();
					this.status("No room to keep weapon by force.");
					cursorItem.drop();
				}
			}
		}

		delay(me.ping * 2 + 100);
		Pickit.pickItems();

		return true;
	};

	this.placeFlail = function () { // SiC-666 TODO: Rename this function to smashOrb, check orb.mode in the loop and stop when it has been smashed.
		var i,
			orb = getUnit(2, 404);
		this.status("Smashing the Compelling Orb.");
		if (!orb) {
			throw new Error("AutoSmurf.placeFlail: Couldn't find Compelling Orb.")
		}
		Pather.moveToUnit(orb, 0, 0, Config.ClearType, false);
		for (i = 0; i < 5; i += 1) {
			if (orb) {
				Skill.cast(0, 0, orb);
				delay(500);
			}
		}
		return true;
	};

	// Unequip merc gear into inventory before firing / swapping
	this.stripMercGear = function () {
		var slots = [4, 5, 3, 1, 10, 9, 8], // wep, quiver, armor, helm, gloves, boots, belt
			i, cursorItem;

		me.cancel();

		for (i = 0; i < slots.length; i += 1) {
			clickItem(4, slots[i]);
			delay(me.ping + 400);

			if (me.itemoncursor) {
				cursorItem = getUnit(100);

				if (cursorItem) {
					if (!Storage.Inventory.CanFit(cursorItem) || !Storage.Inventory.MoveTo(cursorItem)) {
						cursorItem.drop();
					}
				}

				if (me.itemoncursor) {
					Misc.click(0, 0, me);
					delay(me.ping + 200);
				}
			}
		}
	};

	this.gamePacket = function (bytes) {
		var id;

		// 0x4e = hire offer: WORD nameId (hire id) + DWORD seed — we only need the hire id
		if (bytes[0] === 0x4e) {
			id = (bytes[2] << 8) + bytes[1];

			if (mercid.indexOf(id) !== -1) {
				mercid.length = 0;
			}

			mercid.push(id);
		}
	};

	// Hire Act1 rogue (Kashya) after Blood Raven, or Act2 Defiance (Greiz) when forceAct2 / in Lut Gholein.
	// another === 1 → force Act2 Defiance swap (strip + rehire until skill 104).
	this.hireMerc = function (another) {
		var merc, kashya, greiz, k, attempt, gpHandler, self, hireId, aura, idsTried;

		if (another === undefined) {
			another = 0;
		}

		if (!Config.UseMerc) {
			return true;
		}

		self = this;
		merc = me.getMerc();

		// Already have Defiance and not forcing — done
		if (another !== 1 && Item.hasDefianceMerc()) {
			return true;
		}

		// Have any merc and not forcing Act2 swap — keep Act1 until Lut Gholein
		if (merc && another !== 1) {
			return true;
		}

		gpHandler = function (bytes) {
			self.gamePacket(bytes);
		};

		// --- Act1: first hire from Kashya (Blood Raven must be done) ---
		if (!merc && another !== 1) {
			if (!me.getQuest(2, 0) && !me.getQuest(2, 1)) {
				this.status("Merc hire locked — defeat Blood Raven first");

				return false;
			}

			this.status("Hiring Act1 rogue merc");
			Town.goToTown(1);

			if (me.gold < 50) {
				this.status("Not enough gold to hire merc");

				return false;
			}

			mercid = [];
			addEventListener("gamepacket", gpHandler);
			Town.move(NPC.Kashya);
			kashya = getUnit(1, NPC.Kashya);

			if (!kashya || !kashya.openMenu()) {
				removeEventListener("gamepacket", gpHandler);
				this.status("Failed to open Kashya for merc hire");

				return false;
			}

			delay(500 + me.ping);

			if (mercid.length) {
				Misc.useMenu(0x0D45);
				delay(200 + me.ping);
				sendPacket(1, 0x36, 4, kashya.gid, 4, mercid[Math.floor(Math.random() * mercid.length)]);
				delay(1000 + me.ping * 2);
			} else {
				Misc.useMenu(0x0D45);
				delay(500 + me.ping);
				this.status("Kashya hire menu open but no merc ids yet");
			}

			me.cancel();
			removeEventListener("gamepacket", gpHandler);

			for (k = 0; k < 12; k += 1) {
				if (me.getMerc()) {
					this.status("Act1 rogue merc hired");
					Town.doChores();

					return true;
				}

				delay(250);
			}

			this.status("Act1 merc hire failed — will retry later");

			return false;
		}

		// --- Act2: Defiance (skill 104) via Greiz — try each offered hire id (not random) ---
		this.status("Hiring Act2 Defiance merc");
		if (!Town.goToTown(2) && me.act !== 2) {
			this.status("Act2 WP failed for Greiz — abort merc hire");

			return false;
		}

		if (me.getMerc()) {
			this.stripMercGear();
		}

		idsTried = [];

		for (attempt = 0; attempt < 12; attempt += 1) {
			if (Item.hasDefianceMerc()) {
				this.status("Act2 Defiance merc ready");
				Town.buyMercWeapon(true);
				Town.doChores();

				return true;
			}

			mercid = [];
			addEventListener("gamepacket", gpHandler);
			Town.move("greiz");
			greiz = getUnit(1, "greiz");

			if (!greiz || !greiz.openMenu()) {
				removeEventListener("gamepacket", gpHandler);
				this.status("Failed to open Greiz");

				return false;
			}

			delay(500 + me.ping);

			if (!mercid.length) {
				this.status("No Greiz mercs available");
				me.cancel();
				removeEventListener("gamepacket", gpHandler);

				return false;
			}

			// Pick first hire id we have not tried yet (deterministic — not random)
			hireId = -1;

			for (k = 0; k < mercid.length; k += 1) {
				if (idsTried.indexOf(mercid[k]) === -1) {
					hireId = mercid[k];
					break;
				}
			}

			// Exhausted this menu list — clear tried set and take first again (list may reshuffle)
			if (hireId < 0) {
				idsTried = [];
				hireId = mercid[0];
			}

			idsTried.push(hireId);
			this.status("Hiring Greiz merc id " + hireId + " (" + (attempt + 1) + "/12, pool " + mercid.length + ")");

			Misc.useMenu(0x0D45);
			delay(200 + me.ping);
			sendPacket(1, 0x36, 4, greiz.gid, 4, hireId);
			delay(1000 + me.ping * 2);

			me.cancel();
			removeEventListener("gamepacket", gpHandler);
			delay(400);

			merc = me.getMerc();
			aura = Item.mercAuraName(merc);

			if (Item.hasDefianceMerc()) {
				this.status("Act2 Defiance merc hired");
				Town.buyMercWeapon(true);
				Town.doChores();

				return true;
			}

			this.status("Not Defiance (classid=" + (merc ? merc.classid : "?") +
				" aura=" + aura + ") — next hire (" + (attempt + 1) + "/12)");

			if (me.getMerc()) {
				this.stripMercGear();
			}
		}

		this.status("Could not hire Defiance merc after trying Greiz pool");

		return Item.hasDefianceMerc();
	};

//QUESTS
	this.den = function () {
		var i, akara, moorTick;
		this.status("Quest: Den of Evil");
		this.status("Going to town — chores");
		Town.doChores();
		this.teamInGame();
		if (!me.getQuest(1, 1)) { // Haven't cleared the Den yet.
			if (me.diff === 0) {
				// Normal: Blood Moor until lvl 2 → optional Cold Plains WP → Den (no town trip)
				if (me.inTown) {
					this.status("Leaving town → Blood Moor");
					Pather.moveToExit(2, true, true);
				}
				this.teamInGame();
				this.waitForPartyMembers();

				if (me.charlvl < 2 && me.area === 2) {
					var mon, walk, moorMsg, sk;
					moorTick = getTickCount();

					if (me.classid === 2) {
						sk = (typeof ClassAttack !== "undefined" && ClassAttack.bestAttackSkill)
							? ClassAttack.bestAttackSkill()
							: 0;
						moorMsg = sk === 73
							? "Blood Moor until lvl 2 (Poison Strike)"
							: (sk === 67
								? "Blood Moor until lvl 2 (Teeth + Raise Skeleton)"
								: "Blood Moor until lvl 2 (wand + Raise Skeleton until Teeth)");
					} else if (me.classid === 1) {
						moorMsg = Attack.canUseSkill(36)
							? "Blood Moor until lvl 2 (staff/soft Fire Bolt)"
							: "Blood Moor until lvl 2 (seek packs; normal attack until Fire Bolt)";
					} else {
						moorMsg = "Blood Moor until lvl 2 (seek packs)";
					}

					this.status(moorMsg);
					while (me.charlvl < 2 && me.area === 2 && getTickCount() - moorTick < 180000) {
						mon = Attack.findNearestMonster(60);

						if (mon) {
							if (getDistance(me, mon) > 20) {
								Pather.moveToUnit(mon);
							}

							Attack.clear(35);
						} else {
							// No pack in range — walk deeper into Blood Moor
							walk = Pather.getNearestWalkable(me.x + rand(-40, 40), me.y + rand(-40, 40), 5, 2);

							if (walk) {
								Pather.moveTo(walk[0], walk[1]);
							} else {
								Pather.moveTo(me.x + rand(-20, 20), me.y + rand(-20, 20));
							}
						}

						delay(200);
					}
				}

				// Cold Plains waypoint if missing (then back to Blood Moor for Den)
				if (!getWaypoint(1) && me.charlvl >= 2) {
					this.status("Lvl " + me.charlvl + " — Cold Plains for waypoint");
					if (me.area === 1) {
						Pather.moveToExit(2, true, true);
					}
					if (me.area === 2) {
						Pather.moveToExit(3, true, true);
					}
					if (me.area === 3) {
						this.teamInGame();
						this.waitForPartyMembers();
						this.status("Grabbing Cold Plains waypoint");
						Pather.getWP(3, true);
					}
				}

				// lvl >= 2 and Den not done → go Den from field (no TP / no town)
				if (me.charlvl >= 2 && !me.getQuest(1, 1)) {
					this.status("Lvl " + me.charlvl + " — heading to Den of Evil");
					if (me.area === 3) {
						Pather.moveToExit(2, true, true); // Cold Plains → Blood Moor
					}
					if (me.area === 1) {
						Pather.moveToExit(2, true, true);
					}
					if (me.area !== 8) {
						Pather.moveToExit(8, true, true); // Blood Moor → Den
					}
					this.waitForPartyMembers();
					this.Bo();

					for (i = 0; i < 3; i += 1) {
						this.status("Clearing Den of Evil (try " + (i + 1) + "/3)");
						this.teamInGame();
						Attack.clearLevel();
						sendPacket(1, 0x40);
						delay(me.ping * 2 + 250);
						if (me.getQuest(1, 1)) {
							this.status("Den cleared — returning to town");
							break;
						}
					}
				}

				// Prefer TP if we have a scroll/tome; walk Blood Moor only as fallback
				if (!me.inTown) {
					var tpTome = me.findItem("tbk", 0, 3),
						tpOk = (tpTome && tpTome.getStat(70) > 0) || !!me.findItem("tsc", 0, 3);

					if (tpOk) {
						try {
							this.status("Den cleared — using TP to town");
							Town.goToTown();
						} catch (eTp) {
							print("ÿc8AutoSmurfÿc0 :: Den TP failed (" + eTp + ") — walking to town");
						}
					}
				}

				while (!me.inTown) {
					switch (me.area) {
					case 8:
						Pather.moveToExit(2, true, true);
						break;
					case 2:
						Pather.moveToExit(1, true, true);
						break;
					case 3:
						Pather.moveToExit(2, true, true);
						break;
					}
					Packet.flash(me.gid);
					delay(me.ping * 2 + 250);
				}
			} else { // diff > 0
				if(teleportingSorc) {
					if(!getWaypoint(1)) {
						this.status("Grabbing Cold Plains waypoint");
						Pather.moveToExit(2, true, false); // Move from Rogue Encampment to Blood Moor
						Pather.moveToExit(3, true, false); // Move from Blood Moor to Cold Plains
						this.clickWP();
						Pather.useWaypoint(1);
					}
					this.status("Going to Den of Evil (portal)");
					Pather.moveToExit(2, true, false); // Move from Rogue Encampment to Blood Moor
					Pather.moveToExit(8, true, false);
					Pather.makePortal();
					Pather.teleport = false; // not teleporting in Den
					delay(3000);
				} else {
					this.status("Going to town — waiting for Den portal");
					Town.goToTown();
					Town.move("portalspot");
					while (!Pather.usePortal(8, null)) {
						delay(250);
					}
					this.Bo();
				}
				for (i = 0; i < 3; i += 1) {
					this.status("Clearing Den of Evil (try " + (i + 1) + "/3)");
					this.teamInGame();
					Attack.clearLevel();
					sendPacket(1, 0x40); // Refresh quest status
					delay(me.ping * 2 + 250);
					if (me.getQuest(1, 1)) { // Den is cleared. Return to Akara for a Reward.
						break;
					}
				}
				if(teleportingSorc)
					Pather.teleport = true;
				this.status("Going to town");
				Town.goToTown();
			}
		}

		if (me.inTown) {
			if (!me.getQuest(1, 1)) {
				var j = 0;
				this.status("Waiting for Den clear (quest flag)");
				while (!me.getQuest(1, 1) && !me.getQuest(1, 0)) { // Meant to make sorc wait for all the immune monsters to be killed before talking to Akara in hell difficulty.
					delay(250);
					if (j % 20 == 0) { // Check for Team Members every 5 seconds.
						this.teamInGame();
					}
					j += 1;
				}
			}
			this.status("Talking to Akara (Den reward)");
			Town.move("akara");
			akara = getUnit(1, "akara");
			akara.openMenu();
			me.cancel();
			delay(me.ping * 2 + 250);
		}

		// Normal: Cold Plains WP already grabbed before Den — only fallback if missing
		if (me.diff === 0 && (me.getQuest(1, 0) || me.getQuest(1, 1)) && !getWaypoint(1)) {
			this.status("Cold Plains WP missing — grabbing now");
			Town.doChores();
			if (!me.inTown) {
				Town.goToTown();
			}
			Pather.moveToExit(2, true, true);
			Pather.moveToExit(3, true, true);
			Pather.getWP(3, true);
			Town.goToTown();
		}
		this.status("Den of Evil done");
		return true;
	};

	// Leveling farm: Stony Field (no Cave)
	this.stonyField = function () {
		this.status("Clearing Stony Field");
		Town.doChores();
		this.teamInGame();

		if (!me.inTown) {
			Town.goToTown(1);
		}

		if (!getWaypoint(2)) { // Stony Field WP
			this.status("Stony Field WP missing — pathing from Cold Plains");

			if (!getWaypoint(1)) {
				Pather.moveToExit(2, true, true);
				Pather.moveToExit(3, true, true);
				this.waitForPartyMembers();
				Pather.getWP(3, true);
			}

			Pather.useWaypoint(3);
			this.waitForPartyMembers();
			Pather.moveToExit(4, true, true);
			this.waitForPartyMembers();
			Pather.getWP(4, true);
		} else {
			Pather.useWaypoint(4);
			this.waitForPartyMembers();
		}

		Precast.doPrecast(true);
		Attack.clearLevel(0); // all monsters for early leveling XP
		this.status("Stony Field clear done");
		return true; // may end in Stony (quit/rejoin for more XP until stonyLvl)
	};

	// After Den: clear Cold Plains before Stony Field
	this.coldPlains = function () {
		this.status("Clearing Cold Plains (before Stony Field)");
		Town.doChores();
		this.teamInGame();

		if (!me.inTown) {
			Town.goToTown(1);
		}

		if (!getWaypoint(1)) {
			this.status("Cold Plains WP missing — grabbing now");
			Pather.moveToExit(2, true, true);
			Pather.moveToExit(3, true, true);
			this.waitForPartyMembers();
			Pather.getWP(3, true);
			Town.goToTown();
		}

		Pather.useWaypoint(3);
		this.waitForPartyMembers();
		Precast.doPrecast(true);
		Attack.clearLevel(0); // all monsters (Config.ClearType 0xF skips normals)
		Town.goToTown();
		this.status("Cold Plains clear done");
		return true;
	};

	this.blood = function () {
		var kashya, tries, presetOk;

		if (me.getQuest(2, 0)) {
			this.status("Blood Raven already done — skipping");

			return true;
		}

		if (me.charlvl < bloodLvl) {
			this.status("Blood Raven skipped until lvl " + bloodLvl + " (now " + me.charlvl + ")");

			return true;
		}

		this.status("Quest: Blood Raven");
		Town.doChores();
		Town.buyPotions();
		this.teamInGame();

		if (!me.inTown) {
			Town.goToTown();
		}

		tries = 0;

		// Stay until BR is dead (quest bit 1) — never Kashya-turn-in early
		while (!me.getQuest(2, 1) && !me.getQuest(2, 0) && tries < 6) {
			tries += 1;
			this.status("Burial Grounds — kill Blood Raven (try " + tries + "/6)");

			if (me.inTown || (me.area !== 3 && me.area !== 17)) {
				if (!me.inTown) {
					Town.goToTown();
				}

				Pather.useWaypoint(3);
			}

			this.waitForPartyMembers();
			Precast.doPrecast(true);

			if (me.area !== 17) {
				// Cold Plains → Burial: champs/minions/supers only
				this.status("Cold Plains → Burial Grounds (champs/supers only)");
				Pather.moveToExit(17, true, 0xF);
			}

			this.waitForPartyMembers();
			this.teamInGame();

			presetOk = false;

			try {
				// Path to camp without clearing into her face
				presetOk = Pather.moveToBloodRaven(false, true);
			} catch (ePreset) {
				print("Blood Raven preset: " + ePreset);
			}

			if (!presetOk && !this.findBloodRaven()) {
				this.status("Blood Raven not found — scanning Burial Grounds");
				Attack.clear(35, 0xF, false, this.sortBloodRavenThreat);
			}

			this.status("Killing Blood Raven (ranged / pack priority)");
			this.killBloodRavenCareful();

			Pickit.pickItems();
			sendPacket(1, 0x40);
			delay(500 + me.ping);

			if (!me.getQuest(2, 1) && !me.getQuest(2, 0)) {
				this.status("Blood Raven still alive — will retry");
				delay(500);
			}
		}

		if (!me.getQuest(2, 1) && !me.getQuest(2, 0)) {
			this.status("Blood Raven failed after retries — town and continue later");
			Town.goToTown();

			return false;
		}

		if (!me.inTown) {
			this.status("Going to town — Kashya");
			Town.goToTown();
		}

		while (!kashya || !kashya.openMenu()) {
			Packet.flash(me.gid);
			Town.move("kashya");
			kashya = getUnit(1, "kashya");
			delay(1000);
		}

		me.cancel();
		sendPacket(1, 0x40);

		return true;
	};

	// Blood Raven + pack: BR → unique/super → champ → minions (like Treehead, but hold range)
	this.sortBloodRavenThreat = function (unitA, unitB) {
		function threat(u) {
			var s = 0, name;

			if (!u) {
				return 0;
			}

			name = (u.name || "").toLowerCase();

			if (name.indexOf("blood raven") > -1 || name.indexOf("bloodraven") > -1) {
				s += 100;
			}

			if (u.spectype & 0x04) { // unique / boss
				s += 50;
			}

			if (u.spectype & 0x01) { // superunique bit
				s += 45;
			}

			if (u.spectype & 0x02) { // champion
				s += 35;
			}

			if (u.spectype & 0x08) { // pack minion
				s += 15;
			}

			return s;
		}

		var diff = threat(unitB) - threat(unitA);

		if (diff) {
			return diff;
		}

		return getDistance(me, unitA) - getDistance(me, unitB);
	};

	this.findBloodRaven = function () {
		return getUnit(1, getLocaleString(3111)) || getUnit(1, 267) || getUnit(1, 775) || getUnit(1, 805);
	};

	// Stay at cast range — she's an archer; never walk onto her
	this.keepBloodRavenRange = function (raven) {
		var dist, want, angle, skillRange, skill;

		if (!raven || !copyUnit(raven).x) {
			return;
		}

		skill = Config.AttackSkill[1];
		skillRange = (skill > 0) ? Skill.getRange(skill) : 18;

		if (!skillRange || skillRange < 10) {
			skillRange = 18;
		}

		want = Math.min(18, Math.max(12, skillRange - 4));
		dist = getDistance(me, raven);

		if (dist < want - 1) {
			angle = Math.atan2(me.y - raven.y, me.x - raven.x);
			Pather.moveTo(
				Math.round(raven.x + Math.cos(angle) * want),
				Math.round(raven.y + Math.sin(angle) * want),
				3,
				false
			);
		} else if (dist > skillRange || checkCollision(me, raven, 0x4)) {
			Attack.getIntoPosition(raven, Math.min(skillRange, 20), 0x4);
		}
	};

	this.killBloodRavenCareful = function () {
		var prevSort, raven, gid, attackCount = 0, retry = 0;

		prevSort = Attack.sortMonsters;
		Attack.sortMonsters = this.sortBloodRavenThreat;

		try {
			raven = this.findBloodRaven();

			if (!raven) {
				Attack.clear(40, 0xF, false, this.sortBloodRavenThreat);
				raven = this.findBloodRaven();
			}

			if (!raven) {
				this.status("Blood Raven still missing — clear by name");
				Attack.clear(40, 0, getLocaleString(3111), this.sortBloodRavenThreat);
				return !this.findBloodRaven();
			}

			gid = raven.gid;
			this.keepBloodRavenRange(raven);

			// Pack first (champs/supers/minions), BR highest priority via sort
			try {
				Attack.clear(35, 0xF, getLocaleString(3111), this.sortBloodRavenThreat);
			} catch (eClear) {
				print("Blood Raven pack clear: " + eClear);
			}

			raven = getUnit(1, -1, -1, gid) || this.findBloodRaven();

			while (attackCount < 300 && raven && Attack.checkMonster(raven)) {
				Misc.townCheck();

				if (!copyUnit(raven).x) {
					raven = getUnit(1, -1, -1, gid) || this.findBloodRaven();

					if (!raven) {
						break;
					}
				}

				this.keepBloodRavenRange(raven);

				if (!ClassAttack.doAttack(raven, attackCount % 15 === 0)) {
					retry += 1;

					if (retry > 4) {
						Packet.flash(me.gid);
						retry = 0;
					}
				} else {
					retry = 0;
				}

				attackCount += 1;
				raven = getUnit(1, -1, -1, gid) || this.findBloodRaven();
			}

			// Leftover specials only — don't mop every skeleton
			if (!this.findBloodRaven()) {
				Attack.clear(20, 0xF, false, this.sortBloodRavenThreat);
			}
		} finally {
			Attack.sortMonsters = prevSort;
		}

		return !this.findBloodRaven() || !!me.getQuest(2, 1) || !!me.getQuest(2, 0);
	};

	// Click all five Cairn Stones until red portal / quest flag (PD2-safe)
	this.hasInifussScroll = function () {
		return !!(me.getItem(QuestItems.inifuss) || me.getItem("bks"));
	};

	this.hasCairnKey = function () {
		return !!(me.getItem(QuestItems.cairnKey) || me.getItem("bkd"));
	};

	// Dark Wood / Tree of Inifuss: Treehead → uniques → champions → brutes → trash
	this.sortInifussThreat = function (unitA, unitB) {
		function threat(u) {
			var s = 0, name;

			if (!u) {
				return 0;
			}

			name = (u.name || "").toLowerCase();

			if (name.indexOf("treehead") > -1 || name.indexOf("woodfist") > -1) {
				s += 100;
			}

			if (u.spectype & 0x04) { // unique / boss
				s += 50;
			}

			if (u.spectype & 0x01) { // superunique bit
				s += 45;
			}

			if (u.spectype & 0x02) { // champion
				s += 35;
			}

			if (name.indexOf("brute") > -1) {
				s += 25;
			}

			if (u.spectype & 0x08) { // unique minion — above normals
				s += 10;
			}

			return s;
		}

		var diff = threat(unitB) - threat(unitA);

		if (diff) {
			return diff;
		}

		return getDistance(me, unitA) - getDistance(me, unitB);
	};

	this.turnInInifuss = function () {
		var i, akara;

		if (this.hasCairnKey() || me.getQuest(4, 4)) {
			return true;
		}

		if (!this.hasInifussScroll()) {
			this.status("No Scroll of Inifuss to turn in");
			return false;
		}

		if (!me.inTown) {
			Town.goToTown(1);
		}

		for (i = 0; i < 5; i += 1) {
			Town.move("akara");
			akara = getUnit(1, "akara") || getUnit(1, NPC.Akara);

			if (akara && akara.openMenu()) {
				me.cancel();
				delay(500 + me.ping);
			}

			if (this.hasCairnKey()) {
				this.status("Got Key to the Cairn Stones");
				return true;
			}

			delay(300 + me.ping);
		}

		this.status("Akara did not give Cairn Key — still have scroll?");
		return this.hasCairnKey();
	};

	this.getInifussScroll = function () {
		var scroll1, scroll2, tries, prevSort;

		if (this.hasInifussScroll() || this.hasCairnKey() || me.getQuest(4, 4)) {
			return true;
		}

		this.status("Quest: Scroll of Inifuss (Dark Wood)");

		if (!me.inTown) {
			Town.goToTown();
		}

		Pather.useWaypoint(5); // Dark Wood
		this.waitForPartyMembers();
		Precast.doPrecast(true);
		this.Bo();
		Pather.teleport = false;

		if (me.area !== 5) {
			throw new Error("Cain: expected Dark Wood, got area " + me.area);
		}

		// Path + clear: prioritize Treehead / champs / brutes until that pack is dead
		prevSort = Attack.sortMonsters;
		Attack.sortMonsters = this.sortInifussThreat;

		try {
			try {
				Pather.moveToPreset(me.area, 2, 30, 5, 5, true, true);
			} catch (eTree) {
				this.status("Tree of Inifuss path failed: " + eTree);
				throw eTree;
			}

			try {
				Attack.clear(40, 0, getLocaleString(2873), this.sortInifussThreat); // Treehead + pack
			} catch (eTh) {
				// Treehead already dead — only clear leftover champs/uniques nearby
				Attack.clear(25, 0x7, false, this.sortInifussThreat);
			}
		} finally {
			// Back to normal priority — just grab the scroll
			Attack.sortMonsters = prevSort;
		}

		for (tries = 0; tries < 4 && !this.hasInifussScroll(); tries += 1) {
			scroll1 = getUnit(2, 30);

			if (scroll1) {
				Misc.openChest(scroll1);
				delay(400 + me.ping);
			}

			if (!this.getQuestItem(QuestItems.inifuss, 30)) {
				scroll2 = getUnit(4, "bks") || getUnit(4, QuestItems.inifuss);

				if (scroll2) {
					Pickit.pickItem(scroll2);
					delay(400 + me.ping);
				}
			}

			delay(300 + me.ping);
		}

		if (!this.hasInifussScroll()) {
			this.status("Failed to pick Scroll of Inifuss");
			return false;
		}

		this.status("Got Scroll of Inifuss");

		if (!Pather.usePortal(null, null)) {
			Town.goToTown(1);
		}

		if (!me.inTown) {
			Town.goToTown(1);
		}

		Pather.teleport = !!(me.getSkill(54, 1) || me.getStat(97, 54));

		return true;
	};

	this.activateCairnStones = function () {
		var i, j, ids, stone, tick;

		if (!this.hasCairnKey() && !me.getQuest(4, 4)) {
			this.status("No Key to the Cairn Stones — finishing Inifuss first");

			if (!this.getInifussScroll() || !this.turnInInifuss()) {
				return false;
			}
		}

		ids = [17, 18, 19, 20, 21];
		tick = getTickCount();

		this.status("Activating Cairn Stones");

		while (!me.getQuest(4, 4) && !Pather.getPortal(38) && getTickCount() - tick < 45000) {
			Attack.clear(12);

			for (i = 0; i < ids.length; i += 1) {
				stone = getUnit(2, ids[i]);

				if (!stone) {
					continue;
				}

				if (getDistance(me, stone) > 5) {
					Pather.moveToUnit(stone);
				}

				Attack.securePosition(stone.x, stone.y, 8, me.ping * 2);

				for (j = 0; j < 3; j += 1) {
					stone = getUnit(2, ids[i]);

					if (!stone) {
						break;
					}

					sendPacket(1, 0x13, 4, stone.type, 4, stone.gid);
					Misc.click(0, 0, stone);

					try {
						if (typeof stone.interact === "function") {
							stone.interact();
						}
					} catch (eStone) {}

					delay(150 + me.ping);

					if (me.getQuest(4, 4) || Pather.getPortal(38)) {
						this.status("Cairn portal open");
						return true;
					}
				}
			}

			delay(300 + me.ping);
		}

		if (me.getQuest(4, 4) || Pather.getPortal(38)) {
			this.status("Cairn portal open");
			return true;
		}

		this.status("Cairn Stones failed to open portal");
		return false;
	};
		
	this.cain = function () { // Dark-f: rewrite rescue cain
		var i, akara, cain, slave;
		this.status("Quest: Rescue Cain");
		Town.doChores();
		this.teamInGame();
		if (!me.getQuest(4, 1) ) { // not rescues Cain
			if(me.diff === 0) {
				this.travel(0);
			} else {
				if (teleportingSorc )
					this.travel(0);
			}

			// Must finish Scroll of Inifuss → Akara → Cairn Key before stones
			if (!me.getQuest(4, 4) && !this.hasCairnKey()) {
				if (!this.getInifussScroll()) {
					this.status("Cain aborted — no Scroll of Inifuss");
					return false;
				}

				if (!this.turnInInifuss()) {
					this.status("Cain aborted — no Key to the Cairn Stones");
					return false;
				}
			}

			this.teamInGame();
			if(teleportingSorc) {
				Pather.useWaypoint(4); //stoney field
				Pather.makePortal();
				if(me.diff > 0)
					Pather.teleport = false;
			} else {
				Town.move("portalspot");
				while (!Pather.usePortal(4, null)) {
					delay(250);
				}
			}
			this.waitForPartyMembers();
			Precast.doPrecast(true);			
			this.Bo();
			Pather.moveToRakanishu(true, true);
			try{
				Attack.clear(15, 0, getLocaleString(2872));// Rakanishu
			} catch (e) {
				Attack.clear(20);
			}
			Attack.clear(20);
			if (!me.getQuest(4, 4) ) {		 //redportal already open
				if (!this.activateCairnStones()) {
					this.status("Cain aborted — Cairn Stones failed");
					return false;
				}
			}
			if ( me.diff > 0 ) { 
				// Dark-f: now only leader finish the next job when Nightmare & Hell
				if (teleportingSorc) { 
					Pather.teleport = true;
					for (i = 0; i < 5; i += 1) {
						if (Pather.usePortal(38)) {
							break;
						}
						delay(1000);
					}
					Pather.moveTo(25175, 5160, 3, false); //Dark-f: close the slave.
					slave = getUnit(2, 26);
					if (!slave) {
						return false;
					}
					for (i = 0; i < 5; i += 1) {
						if (getDistance(me, slave) > 3) {
							Pather.moveToUnit(slave);
						}
					}
					Misc.openChest(slave);
					this.clearTristram();
					if(!Pather.usePortal(null, null)){
						Town.goToTown();
					}
					delay(3000);
				} else { // Dark-f: other teams goto town.
					Town.goToTown();
				}
			} else {
				// all team
				for (i = 0; i < 5; i += 1) {
					if (Pather.usePortal(38)) {
						break;
					}
				delay(1000);
				}
				Pather.moveTo(25175, 5160, 3, false); //Dark-f: close the slave.
				slave = getUnit(2, 26);
				if (!slave) {
					return false;
				}
				for (i = 0; i < 10; i += 1) {
					if (getDistance(me, slave) > 3) {
						Pather.moveToUnit(slave);
					}
				}
				Misc.openChest(slave);
				this.clearTristram();
				if(!Pather.usePortal(null, null)){
					Town.goToTown();
				}
				delay(3000);
			}
		}
		Town.move("akara");
		akara = getUnit(1, "akara");
		if (akara && akara.openMenu()) {
			me.cancel();
		}
		Town.move("cain");
		cain = getUnit(1, NPC.Cain);
		if (cain && cain.openMenu()) {
			me.cancel();
		}
		return true;
	};

	// Full Tristram clear (Cain rescue + leveling)
	this.clearTristram = function () {
		var coord,
			xx = [25175, 25147, 25149, 25127, 25128, 25150, 25081, 25122],
			yy = [5187, 5201, 5172, 5188, 5144, 5123, 5137, 5100];

		if (me.area !== 38) {
			return false;
		}

		this.status("Clearing Tristram (full)");
		Precast.doPrecast(true);
		this.Bo();

		for (coord = 0; coord < xx.length; coord += 1) {
			Pather.moveTo(xx[coord], yy[coord], 3, true);
			Attack.clear(25);
		}

		Attack.clearLevel(0);
		Pickit.pickItems();
		this.status("Tristram clear done");

		return true;
	};

	this.trist = function () {
		var i;
		this.status("Leveling: Tristram");
		Town.doChores();
		Pather.useWaypoint(4);
		Pather.teleport = false;
		Precast.doPrecast(true);
		this.Bo();
		Pather.moveToRakanishu(true, true);
		try {
			Attack.clear(20, 0, getLocaleString(2872)); // Rakanishu
		} catch (e) {
			Attack.clear(25);
		}
		Pather.moveToRakanishu(false, false);
		for (i = 0; i < 5; i += 1) {
			if (Pather.usePortal(38)) {
				break;
			}
			delay(1000);
		}
		if (me.area === 38) {
			this.clearTristram();
		}
		this.status("Tristram done — town");
		if (!Pather.usePortal(null, null)) {
			Town.goToTown();
		}
		Pather.teleport = true;
		return true;
	};
	
	// Catacombs XP while under andyLvl (do NOT call this once ready to kill Andy)
	this.normalPreAndy = function () {
		var path, idx, i;

		this.status("Catacombs XP for Andy — need lvl " + andyLvl + " (now " + me.charlvl + ")");

		// Already on Barracks→Catacombs path (e.g. after Smith TP return) — don't reset via town WP
		if (!me.inTown && me.area >= 28 && me.area <= 36) {
			this.status("Continuing from area " + me.area + " toward Catacombs");
			this.teamInGame();
			Pather.teleport = !!(me.getSkill(54, 1) && me.charlvl >= 18);
			path = [28, 29, 30, 31, 32, 33, 34, 35];
			idx = path.indexOf(me.area);

			if (idx < 0) {
				idx = 0;
			}

			for (i = idx + 1; i < path.length; i += 1) {
				if (!Pather.moveToExit(path[i], true, true)) {
					this.status("Exit failed " + me.area + " → " + path[i] + " — abort catacombs XP");

					return false;
				}

				this.waitForPartyMembers();
				Precast.doPrecast(true);
				this.Bo();

				if ([29, 32, 35].indexOf(path[i]) > -1) {
					this.clickWP();
				}
			}

			Attack.clearLevel();
			Pather.moveToExit(36, true, true);
			Precast.doPrecast(true);
			this.Bo();
			Attack.clearLevel();
			Pather.teleport = true;

			return true;
		}

		if (!me.inTown) {
			Town.goToTown();
		}

		Town.doChores();
		this.teamInGame();
		Pather.useWaypoint(35);
		Pather.teleport = false;
		this.waitForPartyMembers();
		this.Bo();
		Attack.clearLevel();
		Pather.moveToExit(36, true, true);
		Precast.doPrecast(true);
		this.Bo();
		Attack.clearLevel();
		Pather.teleport = true;
		return true;
	};

	this.andy = function () {		
		this.buyPoisonResistance = function () {
			var i, akara, pot, bought, have, need, mercAlive;

			function countAntidotes() {
				var n = 0, it = me.getItem();

				if (!it) {
					return 0;
				}

				do {
					// 2 = belt, 3 = inventory
					if ([2, 3].indexOf(it.location) === -1) {
						continue;
					}

					if ((it.code && String(it.code).toLowerCase() === "yps") || it.classid === 531 || it.itemType === 80) {
						n += 1;
					}
				} while (it.getNext());

				return n;
			}

			mercAlive = !!(Config.UseMerc && me.getMerc() && me.getMerc().mode !== 0 && me.getMerc().mode !== 12);
			need = mercAlive ? 6 : 3; // 3 self + 3 merc

			this.status("Buying Antidote Potions" + (mercAlive ? " (self+merc)" : ""));
			Town.goToTown();
			Town.forceNextChores = true; // boss prep — don't skip vendor pass
			Town.doChores();

			// Merc may have been revived during chores
			mercAlive = !!(Config.UseMerc && me.getMerc() && me.getMerc().mode !== 0 && me.getMerc().mode !== 12);
			need = mercAlive ? 6 : 3;
			have = countAntidotes();

			if (have >= need) {
				this.status("Already have " + have + " antidote(s) — skip buy");

				return true;
			}

			Town.move("akara");
			akara = getUnit(1, "akara");

			if (!akara) {
				this.status("Akara not found — skip antidotes");

				return false;
			}

			akara.startTrade();
			bought = 0;

			for (i = 0; i < need - have; i += 1) {
				// PD2: yps=531 / itemType 80. Never use LoD 514 (Sacred Rondache here).
				pot = Town.getShopItem(akara, "yps", [531]) ||
					akara.getItem("yps") ||
					akara.getItem(531);

				if (!pot) {
					this.status("No antidote potions in shop (bought " + bought + ")");

					break;
				}

				try {
					pot.buy();
					bought += 1;
					delay(200 + me.ping);
				} catch (eBuy) {
					this.status("Antidote buy failed: " + eBuy);

					break;
				}
			}

			me.cancel();
			have = countAntidotes();
			this.status("Antidotes ready: " + have + " (bought " + bought + ", need " + need + ")");

			return have > 0;
		};
		this.drinkPoisonResistance = function () {
			var i, pot, list = [], drunk = 0, fed = 0, code, merc, selfMax = 3, mercMax = 3;

			function collectAntidotes() {
				var out = [], it = me.getItem(), c;

				if (!it) {
					return out;
				}

				do {
					if ([2, 3].indexOf(it.location) === -1) {
						continue;
					}

					c = it.code ? String(it.code).toLowerCase() : "";

					if (c === "yps" || it.classid === 531 || it.itemType === 80) {
						out.push(copyUnit(it));
					}
				} while (it.getNext());

				return out;
			}

			list = collectAntidotes();

			if (!list.length) {
				this.status("No antidotes to drink (inv/belt empty)");

				return false;
			}

			merc = (Config.UseMerc && me.getMerc()) ? me.getMerc() : null;

			// Feed merc first (clickItem 2 = shift-give pot) — same path as ToolsThread merc HP
			if (merc && merc.mode !== 0 && merc.mode !== 12) {
				for (i = 0; i < list.length && fed < mercMax; i += 1) {
					pot = me.getItem(-1, -1, list[i].gid);

					if (!pot) {
						continue;
					}

					try {
						clickItem(2, pot);
						fed += 1;
						delay(me.ping * 2 + 400);
					} catch (eMerc) {
						this.status("Merc antidote give failed: " + eMerc);
						break;
					}
				}

				list = collectAntidotes(); // refresh after gives
			}

			for (i = 0; i < list.length && drunk < selfMax; i += 1) {
				pot = me.getItem(-1, -1, list[i].gid);

				if (pot) {
					pot.interact();
					drunk += 1;
					delay(me.ping * 2 + 500);
				}
			}

			this.status("Antidotes — self drank " + drunk + (fed ? (", merc fed " + fed) : ""));

			return drunk > 0 || fed > 0;
		};
		// andy start. (kill path = original AutoSmurf: 22550,9548 + Attack.kill)
		var questTry, quest = true;

		for (questTry = 0; questTry < 10; questTry += 1) {
			if (this.isAct1Done()) {
				quest = false;
				break;
			}

			delay(100);
		}

		this.status("killing andy");
		Town.goToTown(1);
		Town.forceNextChores = true; // Andy prep
		Town.doChores();
		this.teamInGame();

		// Already in Act 2
		if (this.isAct1Done()) {
			this.status("Act 1 already done — skip Andy");

			return true;
		}

		// Andy already dead — only need Warriv → Act 2 (don't re-run Catacombs)
		if (this.isAndyKilled()) {
			this.status("Andy already killed (q6) — change Act 2");
			sendPacket(1, 0x40);
			delay(me.ping * 2 + 500);

			if (!this.changeAct(2)) {
				this.status("Act 2 change failed — retry next game");

				return false;
			}

			return true;
		}

		if (quest) {
			this.buyPoisonResistance();
		}
		if (teleportingSorc) {
			Pather.useWaypoint(35);

			if (me.diff === 0) {
				Pather.teleport = false;
				Pather.moveToExit(36, true, true);
				Pather.moveToExit(37, true, true);
				Pather.teleport = true;
			} else {
				Pather.teleport = true;
				Pather.moveToExit(36, true, false);
				Pather.moveToExit(37, true, false);
			}

			if (quest) {
				this.drinkPoisonResistance();
			}

			// Original AutoSmurf approach (not the broken "safe ledge" ranged script)
			Pather.moveTo(22550, 9548, 3, false);
			Pather.makePortal();

			if (me.diff === 0) {
				Pather.teleport = false;
			}
		} else {
			Town.move("portalspot");
			if (quest) {
				this.drinkPoisonResistance();
			}
			var j = 0;
			while (!Pather.usePortal(37, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;

				if (j > 120) {
					this.status("Andariel portal wait timeout");

					return false;
				}
			}
		}

		try {
			Attack.kill(156); // Andariel
		} catch (e) {
			print(e);
			Attack.clear(15);
		}

		delay(2000); // Wait for minions to die.
		Pickit.pickItems();
		sendPacket(1, 0x40); // refresh quest flags after kill
		delay(me.ping * 2 + 500);

		if (this.isAct1Done()) {
			this.status("Act 1 done after Andy");

			return true;
		}

		if (!this.isAndyKilled()) {
			var stillAlive = getUnit(1, 156);

			if (stillAlive && !stillAlive.dead) {
				this.status("Andy not done — stay Act 1");
				Town.goToTown(1);

				return false;
			}

			// Unit gone but quest bit slow — still try Warriv
			this.status("Andy unit gone — attempting Act 2");
		}

		if (!Pather.usePortal(null, null)) {
			if (teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if (!Pather.usePortal(null, null)) {
					Town.goToTown();
				}
			}
		}

		Pather.teleport = true;
		delay(1000);
		this.status("Andy done — change Act 2");

		if (!this.changeAct(2)) {
			this.status("Act 2 change failed — retry next game");

			return false;
		}

		return true;
	};

	// Grab field WP in current/target area — retry + clickWP fallback (getWP alone can silently fail)
	this.grabFieldWP = function (area, label) {
		var i, idx;

		idx = (typeof Pather !== "undefined" && Pather.wpAreas) ? Pather.wpAreas.indexOf(area) : -1;

		if (idx > -1 && getWaypoint(idx)) {
			this.status(label + " WP already owned");

			return true;
		}

		for (i = 0; i < 3; i += 1) {
			if (me.area !== area) {
				this.status(label + " WP — going to area " + area);

				if (!Pather.journeyTo(area) || me.area !== area) {
					Pather.moveToExit(area, true, true);
				}
			}

			if (me.area !== area) {
				this.status(label + " WP — still not in " + area + " (in " + me.area + ")");
				delay(400);

				continue;
			}

			this.status(label + " — taking WP" + (i ? (" (retry " + i + ")") : ""));

			if (Pather.getWP(area, true)) {
				if (idx < 0 || getWaypoint(idx)) {
					this.status(label + " WP OK");

					return true;
				}
			}

			// Nearest WP unit (same as clickWP) if preset scan missed
			if (this.clickWP()) {
				if (idx < 0 || getWaypoint(idx)) {
					this.status(label + " WP OK (clickWP)");

					return true;
				}
			}

			delay(500 + me.ping);
		}

		this.status(label + " WP FAILED — check preset / path");

		return false;
	};

	this.toLostCity = function () {	//Dark-f: reducing team members waiting	
		var clearWalk;

		this.status("To Lost City");
		if (!me.inTown) {
			Town.goToTown();
		}
		Town.doChores();
		this.teamInGame();
		// Teleport whenever owned — Pather TeleDelay walks/fights between casts (Normal included)
		this.enableTeleport();
		clearWalk = !Pather.teleport;

		if (Pather.teleport) {
			this.status("To Lost City — Teleport on (TeleDelay)");
		} else {
			this.status("To Lost City — walking (no Teleport skill yet)");
		}

		// Dry Hills (wp index 11) — hop WP if owned, else Rocky Waste → Dry Hills
		if (getWaypoint(11)) {
			this.status("Dry Hills WP owned — warping");
			Pather.useWaypoint(42);
		} else {
			Pather.moveToExit(41, true, clearWalk); // Rocky Waste
			this.Bo();
			Pather.moveToExit(42, true, clearWalk); // Dry Hills
			this.Bo();
			this.grabFieldWP(42, "Dry Hills");
		}

		// Far Oasis (wp index 13) — must grab before Lost City
		if (getWaypoint(13)) {
			this.status("Far Oasis WP owned — warping");
			Pather.useWaypoint(43);
		} else {
			Pather.moveToExit(43, true, clearWalk);
			this.Bo();
			this.grabFieldWP(43, "Far Oasis");
		}

		// Lost City (wp index 14)
		if (!getWaypoint(14)) {
			if (me.area !== 43 && getWaypoint(13)) {
				Pather.useWaypoint(43);
			}

			Pather.moveToExit(44, true, clearWalk);
			this.Bo();
			this.grabFieldWP(44, "Lost City");
		} else {
			this.status("Lost City WP already owned");
		}

		this.enableTeleport();
		return true;
	};
	
	this.cube = function () { // Only called in Normal Difficulty.
		var i, chest, cube;

		if (this.hasCube()) {
			this.status("cube already owned — skip");
			getCube = false;

			return true;
		}

		this.status("getting cube");
		Town.goToTown(2);
		Town.doChores();
		this.teamInGame();
		Pather.teleport = true;
		if(teleportingSorc) {
			this.travel(2); // Halls Of The Dead Level 2
			this.travel(3); // Lost City			
			Pather.useWaypoint(57); // Halls Of The Dead Level 2
			Pather.moveToExit(60, true, false);
			for (i = 0 ; i < 5 ; i += 1) {
				chest = getPresetUnit(60, 2, 354);
				if (chest) {
					break;
				}
				delay(me.ping * 2 + 250);
			}
			while (getDistance(me.x, me.y, chest.roomx * 5 + chest.x, chest.roomy * 5 + chest.y) > 10) {
				try {
					Pather.moveToPreset(60, 2, 354, 0, 0, false, false);
				} catch (e) {
					this.status("Caught Error.");
					print(e);
				}
			}
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(60, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}			
		Attack.clear(20);
		this.getQuestItem(QuestItems.cube, 354);
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}	
		return true;
	};

		this.amulet = function () {
		var i, drognan, vip, clearTemple, canTP, savedTeleport, taintedDone;

		taintedDone = !!(me.getQuest(11, 0) || me.getQuest(11, 1));

		if (this.hasHoradricStaff() || me.getQuest(10, 0)) {
			this.status("amulet — staff quest done — skip");

			return true;
		}

		// Still need vip for cubing even if Tainted Sun was already turned in
		if (taintedDone && this.hasViper()) {
			this.status("amulet — Tainted Sun done + have viper — skip temple");

			return true;
		}

		if (this.hasViper()) {
			this.status("amulet — have viper (inv/stash), finish Drognan only");
		} else {
			this.status("getting amulet" + (taintedDone ? " (vip missing — re-run temple)" : ""));
		}

		Town.goToTown(2);
		Town.doChores();
		this.teamInGame();

		// Teleport whenever owned — TeleDelay walks/fights between casts (Normal included).
		// Temple L2 still clears packs while pathing.
		canTP = this.enableTeleport();
		clearTemple = !canTP;
		savedTeleport = Pather.teleport;
		Pather.teleport = canTP;

		// Only run Claw Viper Temple if we still need the amulet (checks stash too)
		if (!this.hasViper()) {
			if (teleportingSorc) {
				this.travel(2); // Halls Of The Dead Level 2
				this.travel(3); // Lost City
			}
			if (teleportingSorc) {
				Pather.useWaypoint(44, true);
				this.enableTeleport();

				if (clearTemple) {
					this.status("Claw Viper Temple — walk/clear");
				} else {
					this.status("Claw Viper Temple — Teleport (TeleDelay)");
				}

				Pather.moveToExit(45, true, clearTemple); // Valley Of Snakes
				Pather.moveToExit(58, true, clearTemple); // Claw Viper Temple Level 1
				// Level 2 altar — keep TP on if owned; clearPath true for fang packs
				this.enableTeleport();
				this.status(canTP ? "Claw Viper Temple 2 — Teleport + clear" : "Claw Viper Temple 2 — walk/clear");
				Pather.moveToExit(61, true, true);
				Attack.clear(30);
				Pather.moveTo(15044, 14045, 3, true);
				Attack.clear(25);
				Pather.makePortal();
			} else {
				Town.move("portalspot");
				var j = 0;
				while (!Pather.usePortal(61, null)) {
					delay(250);
					if (j % 20 == 0) {
						this.teamInGame();
					}
					j += 1;
				}
			}
			this.teamInGame();
			Attack.clear(20);
			if (teleportingSorc) {
				// Chest 149 = Tainted Sun Altar
				if (!this.getQuestItem(QuestItems.viper, 149)) {
					this.status("amulet — vip pick failed, retry once");
					this.getQuestItem(QuestItems.viper, 149);
				}

				if (!this.hasViper()) {
					this.status("amulet — still no vip after altar (will retry next pass)");
				}
			}
			delay(500);
			if (!Pather.usePortal(null, null)) {
				Town.goToTown();
			}
		}

		Pather.teleport = savedTeleport !== undefined ? savedTeleport : true;

		vip = QuestItems.find(QuestItems.viper, "vip");

		if (vip && vip.location === 3) {
			Town.move("stash");
			delay(me.ping);
			Town.openStash();
			Storage.Stash.MoveTo(vip);
		}
		Town.move("drognan");
		for (i = 0 ; i < 200 ; i += 1) {
			if (i > 60){
				quit();
			}
			if (this.playerIn(40)) {
				break;
			}
			delay(1000);
		}
		while (!drognan || !drognan.openMenu()) { // Try more than once to interact with Drognan.
			Packet.flash(me.gid);
			Town.move("drognan");
			drognan = getUnit(1, "drognan");
			delay(1000);
		}
		me.cancel();
		return true;
	};

	this.staff = function () { // Only the Teleporting Sorc does this. She will be at least level 18 as required by MAIN to reach this stage.
		var presetUnit, msf;

		if (this.hasStaffKings() || this.hasHoradricStaff() || this.isStaffQuestDone()) {
			this.status("staff of kings already owned — skip");

			return true;
		}

		this.status("getting staff");
		Town.goToTown(2);
		Town.doChores();
		this.teamInGame();
		Pather.teleport = true;
		Pather.useWaypoint(43, true);
		Precast.doPrecast(true);
		if(teleportingSorc) {
			Pather.moveToExit(62, true, false);
			Pather.moveToExit(63, true, false);
			Pather.moveToExit(64, true, false);
			presetUnit = getPresetUnit(64, 2, 356);
			if (!presetUnit) {
				return false;
			}
			Pather.moveTo(presetUnit.roomx * 5 + presetUnit.x, presetUnit.roomy * 5 + presetUnit.y, 15, false);
			Pather.makePortal();
		} else {			
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(64, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
			this.getQuestItem(QuestItems.staffKings, 356);
		if(!Pather.usePortal(null, null)){
			Town.goToTown();
		}
		msf = QuestItems.find(QuestItems.staffKings, "msf");
		if (msf) {
			Town.move("stash");
			delay(me.ping);
			Town.openStash();
			Storage.Stash.MoveTo(msf);
		}
		return true;
	};

	this.summoner = function () {
		var i, journal, boss, tick, canTP, attackCount;
		var questTry, quest = true;

		for (questTry = 0; questTry < 10; questTry += 1) {
			if (me.getQuest(14, 0)) {
				quest = false;
				break;
			}

			delay(100);
		}

		this.status("killing Summoner");
		Town.goToTown(2);
		this.teamInGame();
		Town.doChores();
		canTP = !!(me.getSkill(54, 1) || me.getStat(97, 54));
		Pather.teleport = canTP;

		if (teleportingSorc) {
			Pather.useWaypoint(74);
			Precast.doPrecast(true);
			Pather.moveToPreset(me.area, 2, 357, -3, -3);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			var j = 0;

			while (!Pather.usePortal(74, null)) {
				delay(250);

				if (j % 20 === 0) {
					this.teamInGame();
				}

				j += 1;
			}
		}

		// Telestomp: teleport onto Summoner and fight on top of him (merc + point-blank spells)
		try {
			for (i = 0; !boss && i < 8; i += 1) {
				boss = getUnit(1, 250); // The Summoner (PD2 classid still 250)
				delay(200);
			}

			if (!boss) {
				this.status("Summoner not found — clearing journal room");
				Attack.clear(20);
			} else {
				this.status(canTP ? "Summoner — telestomp" : "Summoner — walk-stomp (no TP)");
				Pather.teleport = canTP;
				tick = getTickCount();
				attackCount = 0;

				while (Attack.checkMonster(boss) && attackCount < 300 && getTickCount() - tick < 180000) {
					if (!boss || !copyUnit(boss).x) {
						boss = getUnit(1, 250);

						if (!boss) {
							break;
						}
					}

					if (getDistance(me, boss) > 3) {
						Pather.moveToUnit(boss);
					}

					ClassAttack.doAttack(boss, attackCount % 15 === 0);
					attackCount += 1;
					delay(40 + Math.min(me.ping, 150));
				}

				if (boss && Attack.checkMonster(boss)) {
					Attack.kill(250);
				}
			}
		} catch (e) {
			print(e);
			Attack.clear(20);
		}

		Pather.teleport = canTP;
		Pickit.pickItems();

		if (!quest) {
			if (!Pather.usePortal(null, null)) {
				if (teleportingSorc) {
					Town.goToTown();
				} else {
					delay(1000);

					if (!Pather.usePortal(null, null)) {
						Town.goToTown();
					}
				}
			}

			return true;
		}

		Pather.moveToPreset(74, 2, 357, -3, -3, false);
		journal = getUnit(2, 357);

		for (i = 0; i < 5; i += 1) {
			if (journal) {
				clickMap(0, 0, journal);
				delay(1000);
				me.cancel();
			}

			if (Pather.getPortal(46)) {
				break;
			}
		}

		if (i === 5) {
			throw new Error("summoner failed");
		}

		Pather.usePortal(46);
		this.clickWP();

		return true;
	};
	
	this.tombs = function() { // Teleporting Sorc shares Canyon of The Magi waypoint with the others and they each clear to the chest in all of the tombs.
		var i, j, chest;

		if (me.charlvl >= tombsLvl || this.partyLevel(tombsLvl)) {
			this.status("lvl " + me.charlvl + " >= " + tombsLvl + " — skip tombs, go Duriel");

			return true;
		}

		this.status("cleaning tombs");
		Town.goToTown(2);
		this.teamInGame();
		Town.doChores();
		this.enableTeleport();
		if (teleportingSorc) {
			if (me.area !== 46) {
				Pather.useWaypoint(46);
			}
			// Party only — solo doesn't need TPs for followers
			if (Config.AutoSmurf.TeamSize > 1) {
				Pather.makePortal();
			}
		} else {
			if (!getWaypoint(17)) { // Canyon Of The Magi
				var cain;
				Town.goToTown(2);
				while (!cain || !cain.openMenu()) { // Try more than once to interact with Deckard Cain.
					Packet.flash(me.gid);
					Town.move("cain");
					cain = getUnit(1, "deckard cain");
					delay(1000);
				}
				me.cancel();
				Town.move("portalspot");
				this.status("Waiting for Canyon Of The Magi TP.");
				j = 0;
				while (!Pather.usePortal(46, null)) { // Canyon Of The Magi
					delay(250);
					if (j % 20 == 0) { // Check for Team Members every 5 seconds.
						this.teamInGame();
					}
					j += 1;
				}
				this.clickWP();
			} else {
				Pather.useWaypoint(46);
			}
		}
		this.waitForPartyMembers();
		this.Bo();
		Precast.doPrecast(true);
		for (i = 66; i <= 72; i += 1) {
			if (i !== getRoom().correcttomb) {
				this.teamInGame();
				while (me.area === 46) {
					Pather.moveToExit(i, false, Config.ClearType); // Move to tomb, don't go in.
					if (Config.AutoSmurf.TeamSize > 1) {
						Pather.makePortal(); // Portal outside tomb for party
					}
					Pather.moveToExit(i, true, Config.ClearType); // Go in the tomb.
				}
				this.waitForPartyMembers();
				this.Bo();
				Attack.clearLevel(0);				
				chest = getPresetUnit(me.area, 2, 397);
				for (j = 0 ; j < 5 ; j += 1) {
					chest = getPresetUnit(me.area, 2, 397);
					if (chest) {
						break;
					}
					delay(me.ping * 2 + 250);
				}
				if (chest) {
					while (getDistance(me.x, me.y, chest.roomx * 5 + chest.x, chest.roomy * 5 + chest.y) > 10) {
						try {
							Pather.moveToPreset(me.area, 2, 397, 0, 0, Config.ClearType, false);
						} catch (e) {
							this.status("Caught Error.");
							print(e);
						}
						delay(me.ping * 2 + 250);
						Packet.flash(me.gid);
					}
					chest = getUnit(2, "chest");
					Misc.openChest(chest);
					Pickit.pickItems();
				}
				if (Config.AutoSmurf.TeamSize > 1 && Misc.getNearbyPlayerCount() > 1) {
					delay(rand(2,10) * 500); // Delay so party can share portals
				}

				// Solo: exit tomb → Canyon (no TP). Party: portal/town then WP back.
				if (Config.AutoSmurf.TeamSize <= 1) {
					if (me.area !== 46) {
						Pather.moveToExit(46, true, Config.ClearType);
					}
					if (me.area !== 46) {
						Town.goToTown();
						Town.move("waypoint");
						Pather.useWaypoint(46);
					}
				} else {
					if (!Pather.usePortal(null, null)) {
						Town.goToTown();
					}
					delay(me.ping * 2 + 250);
					if (!Pather.usePortal(46, null)) {
						Town.move("waypoint");
						Pather.useWaypoint(46);
					}
				}

				// After each tomb: stop farming and go Duriel once threshold hit
				if (me.charlvl >= tombsLvl || this.partyLevel(tombsLvl)) {
					this.status("tomb done — lvl " + me.charlvl + " >= " + tombsLvl + ", go Duriel");
					break;
				}
			}
		}
		if (Config.AutoSmurf.TeamSize > 1 && Pather.usePortal(null, null)) {
			// party portal home
		} else if (!me.inTown) {
			Town.goToTown();
		}	
		if (me.charlvl < tombsLvl && !this.partyLevel(tombsLvl)) {
			this.status("Not ready to start Duriel.");
			delay(1000);
			quit();
		}
		return true;
	};

	// Cast at boss from afar; stay inside skill range (FN/CB need close range — don't kite out)
	this.killBossRanged = function (classId, kiteDist) {
		var i, target, skill, untimed, hand, castHand, angle, tx, ty, dist, castRange, fightDist,
			name = classId === 156 ? "Andariel" : (classId === 229 ? "Radament" : ("id " + classId));

		this.status(name + " — ranged (skill-range)");

		castHand = function (id) {
			if (typeof ClassAttack !== "undefined" && ClassAttack.castHand) {
				return ClassAttack.castHand(id);
			}

			return id === 0 ? 0 : Skill.getHand(id);
		};

		// Same AttackSkill upgrades as ClassAttack (staff FB → CB / FN / FO)
		if (me.classid === 1) {
			if (me.getSkill(47, 1)) {
				if (Config.AttackSkill[1] === 36) {
					Config.AttackSkill[1] = 47;
				}

				if (Config.AttackSkill[3] === 36) {
					Config.AttackSkill[3] = 47;
				}
			}

			if (me.getSkill(38, 0) > 0) {
				if (Config.AttackSkill[1] === 36) {
					Config.AttackSkill[1] = 38;
				}

				if (Config.AttackSkill[3] === 36) {
					Config.AttackSkill[3] = 38;
				}
			}

			if (me.getSkill(44, 0) > 0) {
				if ([36, 39].indexOf(Config.AttackSkill[1]) > -1) {
					Config.AttackSkill[1] = 44;
				}

				if ([36, 39].indexOf(Config.AttackSkill[3]) > -1) {
					Config.AttackSkill[3] = 44;
				}
			}

			if (me.getSkill(64, 0) > 0) {
				if ([36, 39, 44].indexOf(Config.AttackSkill[1]) > -1) {
					Config.AttackSkill[1] = 64;

					if (Config.AttackSkill[2] < 0) {
						Config.AttackSkill[2] = 44;
					}
				}

				if ([36, 39, 44].indexOf(Config.AttackSkill[3]) > -1) {
					Config.AttackSkill[3] = 64;

					if (Config.AttackSkill[4] < 0) {
						Config.AttackSkill[4] = 44;
					}
				}
			}
		}

		for (i = 0; i < 400; i += 1) {
			target = getUnit(1, classId);

			if (!target) {
				delay(200);

				if (i > 20 && !getUnit(1, classId)) {
					return true;
				}

				continue;
			}

			if (target.dead) {
				return true;
			}

			skill = Config.AttackSkill[1];

			if (skill < 0 || !Attack.canUseSkill(skill)) {
				skill = (Config.AttackSkill[3] > 0 && Attack.canUseSkill(Config.AttackSkill[3])) ? Config.AttackSkill[3] : -1;
			}

			if (skill < 0 || !Attack.canUseSkill(skill)) {
				skill = Attack.canUseSkill(44) ? 44 : (Attack.canUseSkill(38) ? 38 : (Attack.canUseSkill(36) ? 36 : 0));
			}

			castRange = Skill.getRange(skill) || 10;

			// Prefer requested kite, but never outside cast range (FN=5, CB=6)
			if (kiteDist === undefined || kiteDist === null) {
				fightDist = Math.max(3, Math.min(castRange - 1, 12));
			} else {
				fightDist = Math.min(kiteDist, Math.max(3, castRange - 1));
			}

			dist = getDistance(me, target);

			// Too far to hit — step in (Attack.getIntoPosition when available)
			if (dist > castRange || dist > fightDist + 2) {
				if (typeof Attack.getIntoPosition === "function") {
					Attack.getIntoPosition(target, Math.min(castRange, fightDist + 1), 0x4);
				} else {
					angle = Math.atan2(target.y - me.y, target.x - me.x);
					tx = Math.round(me.x + Math.cos(angle) * Math.min(8, dist - fightDist));
					ty = Math.round(me.y + Math.sin(angle) * Math.min(8, dist - fightDist));
					Pather.moveTo(tx, ty);
				}
			} else if (castRange >= 8 && dist < Math.max(3, fightDist - 2)) {
				// Only kite for longer-range skills (FB/FO/Andy ledge) — FN/CB stay glued
				angle = Math.atan2(me.y - target.y, me.x - target.x);
				tx = Math.round(me.x + Math.cos(angle) * 3);
				ty = Math.round(me.y + Math.sin(angle) * 3);
				Pather.moveTo(tx, ty);
			}

			hand = castHand(skill);
			Skill.cast(skill, hand, target);

			untimed = Config.AttackSkill[2];

			if (untimed > 0 && Attack.canUseSkill(untimed) && !Skill.isTimed(untimed)) {
				Skill.cast(untimed, castHand(untimed), target);
			}

			delay(40 + me.ping);
		}

		target = getUnit(1, classId);

		return !target || target.dead;
	};

	this.radament = function () {
		var i, radament, book, atma,
			pathX = [5106, 5205, 5205, 5214, 5222],
            pathY = [5125, 5125, 5152, 5153, 5181];

		if (this.isRadamentDone()) {
			this.status("radament already done — skip");

			return true;
		}

		this.status("radament");
		Town.goToTown(2);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;					
		if (teleportingSorc) {
			if (getWaypoint(10)) {
				Pather.useWaypoint(48, true);
			} else {
				Town.goToTown(2);
				while (me.area !== 48) {
					if (me.area === 47) {
						try {
							Pather.moveToExit(48, true, false);
						} catch (e2) {
							print(e2);
							Town.goToTown(2);
						}
					} else if (me.area === 40) {
						for (i = 0; i < pathX.length; i += 1) {
							Pather.moveTo(pathX[i], pathY[i], 10, false, false);
							Packet.flash(me.gid);
							delay(me.ping * 2 + 100);
						}
						try {
							Pather.moveToExit(47, true, false);
						} catch (e3) {
							print(e3);
							Town.goToTown(2);
						}
					}
					Packet.flash(me.gid);
					delay(me.ping * 2 + 100);
				}
				this.clickWP();
			}		
			Pather.moveToExit(49, true, false);
			for (i = 0 ; i < 5 ; i += 1) {
				radament = getPresetUnit(49, 2, 355); // Chest by Radament.
				if (radament) {
					break;
				}
				delay(me.ping * 2 + 250);
			}
			// Stay near chest but not on top of Radament
			while (radament && getDistance(me.x, me.y, radament.roomx * 5 + radament.x, radament.roomy * 5 + radament.y) > 12) {
				try {
					Pather.moveToPreset(49, 2, 355, 5, 0, false, false);
				} catch (e) {
					this.status("Caught Error.");
					print(e);
					break;
				}
			}
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(49, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
		try {
			if (me.classid === 1) {
				// No fixed kite — FN/CB need ~4–5 yards; fire bolt can sit a bit farther
				this.killBossRanged(229);
			} else {
				Attack.kill(229); // Radament
			}
		} catch (e) {
			this.status("Caught Error.");
			print(e);
			Attack.clear(30);
		}

		// Ranged kite can leave the book far — walk chest/corpse then pick by classid or code "ass"
		try {
			Pather.moveToPreset(49, 2, 355, 0, 0, false, false);
		} catch (eMove) {}

		delay(400 + me.ping);
		this.getQuestItem(QuestItems.bookSkill);

		if (!me.getItem(QuestItems.bookSkill) && !me.getItem("ass")) {
			Pickit.pickItems();
		}

		book = me.findItem(QuestItems.bookSkill) || me.findItem("ass") || me.getItem(QuestItems.bookSkill) || me.getItem("ass");

		if (book) {
			clickItem(1, book);
		} else {
			this.status("ÿc1Radament book missing (ass/" + QuestItems.bookSkill + ")");
		}
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}	
		Town.move("atma");
		atma = getUnit(1, "atma");
		atma.openMenu();
		me.cancel();
		return true;
	};

	this.duriel = function () {
		this.status("killing Duriel");
		this.killDuriel = function () {
			var i, target;
			for (i = 0; i < 3; i += 1) {
				target = getUnit(1, 211);
				if (target) 
					break;
				delay(500);
			}
			if (!target) {
				throw new Error("Duriel not found.");
			}
			for (i = 0; i < 300; i += 1) {
				ClassAttack.doCast(target, Config.AttackSkill[1], Config.AttackSkill[2]);
				if (target.dead) {
					return true;
				}
				if (getDistance(me, target) <= 10) {
					Pather.moveTo(22638, me.y < target.y ? 15722 : 15693);
				}
			}
			return target.dead;
		};
		var i, unit, savedTeleStomp;
		Town.goToTown(2);
		this.teamInGame();
		Town.forceNextChores = true; // Duriel prep (thawing / full restock)
		Town.doChores();
		this.buyColdResistance();
		Pather.teleport = true;
		if (teleportingSorc) {
			Pather.useWaypoint(46);
			Pather.moveToExit(getRoom().correcttomb, true);
			Pather.moveToPreset(me.area, 2, 152, -11, 3);
			this.drinkColdResistance();
			for (i = 0; i < 10; i += 1) {
				if (getUnit(2, 100))
					break;
				delay(500);
			}
			unit = getUnit(2, 100);
			if (unit) {
				for (i = 0; i < 3; i += 1) {
					if (me.area === unit.area) {
						Skill.cast(43, 0, unit);
					}
					if (me.area === 73) {
						break;
					}
				}
			}
			if (me.area !== 73 && !Pather.useUnit(2, 100, 73)) {
				Attack.clear(10);
				Pather.useUnit(2, 100, 73);
			}
			if (me.area !== 73) {
				throw new Error("Failed to move to Duriel");
			}
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			this.drinkColdResistance();
			while (!Pather.usePortal(73, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
		savedTeleStomp = Config.TeleStomp;
		Config.TeleStomp = true; // merc tanks — telestomp onto Duriel
		this.waitMercForFight(8000);
		try {
			if (me.classid === 1 && me.gametype === 0) {
				this.killDuriel();
			} else {
				Attack.kill(211); // Duriel
			}
		} finally {
			Config.TeleStomp = savedTeleStomp;
		}
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}			
		return true;
	};

	// Thawing pots for Duriel (PD2 wms=534 / itemType 81) — mirror Andy antidotes
	this.buyColdResistance = function () {
		var i, npc, pot, bought, have, need, mercAlive;

		function countThawing() {
			var n = 0, it = me.getItem();

			if (!it) {
				return 0;
			}

			do {
				if ([2, 3].indexOf(it.location) === -1) {
					continue;
				}

				if ((it.code && String(it.code).toLowerCase() === "wms") || it.classid === 534 || it.itemType === 81) {
					n += 1;
				}
			} while (it.getNext());

			return n;
		}

		mercAlive = !!(Config.UseMerc && me.getMerc() && me.getMerc().mode !== 0 && me.getMerc().mode !== 12);
		need = mercAlive ? 6 : 3;

		this.status("Buying Thawing Potions" + (mercAlive ? " (self+merc)" : ""));

		if (!me.inTown) {
			Town.goToTown(2);
		}

		Town.forceNextChores = true;
		Town.doChores();

		mercAlive = !!(Config.UseMerc && me.getMerc() && me.getMerc().mode !== 0 && me.getMerc().mode !== 12);
		need = mercAlive ? 6 : 3;
		have = countThawing();

		if (have >= need) {
			this.status("Already have " + have + " thawing — skip buy");

			return true;
		}

		// Act2: Lysander sells thawing; fallback Drognan shop
		Town.move(NPC.Lysander);
		npc = getUnit(1, NPC.Lysander) || getUnit(1, "lysander");

		if (!npc) {
			Town.move(NPC.Drognan);
			npc = getUnit(1, NPC.Drognan) || getUnit(1, "drognan");
		}

		if (!npc) {
			this.status("No vendor for thawing potions");

			return false;
		}

		npc.startTrade();
		bought = 0;

		for (i = 0; i < need - have; i += 1) {
			pot = Town.getShopItem(npc, "wms", [534]) ||
				npc.getItem("wms") ||
				npc.getItem(534);

			if (!pot) {
				this.status("No thawing potions in shop (bought " + bought + ")");

				break;
			}

			try {
				pot.buy();
				bought += 1;
				delay(200 + me.ping);
			} catch (eBuy) {
				this.status("Thawing buy failed: " + eBuy);

				break;
			}
		}

		me.cancel();
		have = countThawing();
		this.status("Thawing ready: " + have + " (bought " + bought + ", need " + need + ")");

		return have > 0;
	};

	this.drinkColdResistance = function () {
		var i, pot, list = [], drunk = 0, fed = 0, merc, selfMax = 3, mercMax = 3;

		function collectThawing() {
			var out = [], it = me.getItem(), c;

			if (!it) {
				return out;
			}

			do {
				if ([2, 3].indexOf(it.location) === -1) {
					continue;
				}

				c = it.code ? String(it.code).toLowerCase() : "";

				if (c === "wms" || it.classid === 534 || it.itemType === 81) {
					out.push(copyUnit(it));
				}
			} while (it.getNext());

			return out;
		}

		list = collectThawing();

		if (!list.length) {
			this.status("No thawing to drink (inv/belt empty)");

			return false;
		}

		merc = (Config.UseMerc && me.getMerc()) ? me.getMerc() : null;

		if (merc && merc.mode !== 0 && merc.mode !== 12) {
			for (i = 0; i < list.length && fed < mercMax; i += 1) {
				pot = me.getItem(-1, -1, list[i].gid);

				if (!pot) {
					continue;
				}

				try {
					clickItem(2, pot);
					fed += 1;
					delay(me.ping * 2 + 400);
				} catch (eMerc) {
					this.status("Merc thawing give failed: " + eMerc);
					break;
				}
			}

			list = collectThawing();
		}

		for (i = 0; i < list.length && drunk < selfMax; i += 1) {
			pot = me.getItem(-1, -1, list[i].gid);

			if (pot) {
				pot.interact();
				drunk += 1;
				delay(me.ping * 2 + 500);
			}
		}

		this.status("Thawing — self drank " + drunk + (fed ? (", merc fed " + fed) : ""));

		return drunk > 0 || fed > 0;
	};

	// Wait until merc is alive and near us (so TeleStomp / tank works)
	this.waitMercForFight = function (timeout) {
		var tick, merc;

		if (!Config.UseMerc) {
			return false;
		}

		tick = getTickCount();
		timeout = timeout || 8000;

		while (getTickCount() - tick < timeout) {
			merc = me.getMerc();

			if (merc && merc.mode !== 0 && merc.mode !== 12) {
				if (!merc.area || merc.area === me.area) {
					this.status("Merc ready to tank");

					return true;
				}
			}

			delay(200);
		}

		this.status("Merc not ready — fighting anyway");

		return !!(me.getMerc() && me.getMerc().mode !== 12);
	};

	this.A_duriel = function () {
		this.status("killing duriel");
		var i, cain, orifice, hole, npc, savedTeleStomp;
		Town.goToTown(2);
		Town.forceNextChores = true;
		Town.doChores();
		this.buyColdResistance();
		this.teamInGame();
		Pather.teleport = true;
		if (!me.getQuest(14, 1) && !me.getQuest(14, 3) && !me.getQuest(14, 4)) {
			if(!me.inTown){
				Town.goToTown();
			}
			if (teleportingSorc) {
				this.travel(5); // Travel to all waypoints up to and including Canyon Of The Magi if I don't have them.
				Pather.useWaypoint(46, true);
				Precast.doPrecast(true);
				Pather.moveToExit(getRoom().correcttomb, true, false);
				for (i = 0 ; i < 5 ; i += 1) {
					orifice = getPresetUnit(getRoom().correcttomb, 2, 152);
					if (orifice) {
						break;
					}
					delay(me.ping * 2 + 250);
				}
				while (getDistance(me.x, me.y, orifice.roomx * 5 + orifice.x, orifice.roomy * 5 + orifice.y) > 10) {
					try {
						Pather.moveToPreset(getRoom().correcttomb, 2, 152, 0, 0, false, false);
					} catch (e) {
						this.status("Caught Error.");
						print(e);
					}
				}
				if (me.diff === 0) {
					Pather.teleport = false;
				}
				Pather.makePortal();
				delay(me.ping * 2 + 250);
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "clear orifice");
				Attack.clear(30);
				Pather.moveToPreset(me.area, 2, 152, 0, 0, false, false);
				Attack.clear(30);
				Pather.moveToPreset(me.area, 2, 152, 0, 0, false, false);
				Attack.clear(30);

				// Cube if needed, then place — verify hole before fighting Duriel
				if (!me.getQuest(10, 0)) {
					if (!this.hasHoradricStaff()) {
						this.ensureHoradricStaff();
					}

					for (i = 0; i < 3; i += 1) {
						if (this.placeStaff()) {
							break;
						}

						this.status("placeStaff retry " + (i + 1));
						delay(1000);
					}
				}

				delay(2000);

				this.drinkColdResistance(); // buff before entering lair

				for (i = 0; i < 40; i += 1) {
					hole = getUnit(2, 100);

					if (hole) {
						Precast.doPrecast(true);

						if (Pather.useUnit(2, 100, 73) || me.area === 73) {
							break;
						}
					}

					delay(500);
					Attack.clear(15);
				}

				if (me.area !== 73) {
					this.status("Duriel hole never opened — abort kill (staff/orifice failed)");
					Pather.makePortal();
					Town.goToTown(2);
					return false;
				}

				Pather.makePortal();
			} else {
				Town.goToTown(2);
				while (!cain || !cain.openMenu()) { // Try more than once to interact with Deckard Cain.
					Packet.flash(me.gid);
					Town.move("cain");
					cain = getUnit(1, "deckard cain");
					delay(1000);
				}
				me.cancel();
				Town.move("portalspot");
				this.status("Waiting for Orifice TP.");
				var j = 0;
				while (me.area === 40) {
					delay(250);
					if (j % 20 == 0) { // Check for Team Members every 5 seconds.
						this.teamInGame();
					}
					j += 1;
					if (clearOrifice) {
						Pather.usePortal(getRoom().correcttomb, null)
					}
				}
				Attack.clear(40);
				Pather.moveToPreset(me.area, 2, 152, 0, 0, false, true);
				Attack.clear(40);
				Town.goToTown(2);
				this.drinkColdResistance();
				this.status("Waiting for Duriel TP.");
				while (!Pather.usePortal(73, null)) {
					delay(250);
					if (j % 20 == 0) { // Check for Team Members every 5 seconds.
						this.teamInGame();
					}
					j += 1;
				}
			}
			this.teamInGame();

			if (me.area !== 73) {
				this.status("not in Duriel's Lair (area " + me.area + ") — skip Attack.kill");
				return false;
			}

			savedTeleStomp = Config.TeleStomp;
			Config.TeleStomp = true; // let merc tank Duriel
			this.waitMercForFight(8000);
			Attack.clear(20);

			try {
				Attack.kill(211);
			} catch (e) {
				print(e);
				Attack.clearLevel();
			} finally {
				Config.TeleStomp = savedTeleStomp;
			}

			Pickit.pickItems();
			Pather.teleport = false;
			Pather.moveTo(22579, 15706);
			Pather.moveTo(22577, 15649, 10);
			Pather.moveTo(22577, 15609, 10);
			npc = getUnit(1, "tyrael");
			if (!npc) {
				return false;
			}
			for (i = 0; i < 3; i += 1) {
				if (getDistance(me, npc) > 3) {
					Pather.moveToUnit(npc);
				}
				npc.interact();
				delay(1000 + me.ping);
				me.cancel();
				if (Pather.getPortal(null)) {
					me.cancel();
					break;
				}
			}
			Town.goToTown();
		}
		this.changeAct(3);
		return true;
	};
	
	this.figurine = function () { // Perform the Golden Bird quest or wait for another character to do so, then drink the potion.
		var cain, alkor, meshif;

//	------- SiC-666 NOTES ------
//		me.getQuest(20, 6) = ask cain about the jade figurine (persists after talking to cain)
//		me.getQuest(20, 2) = Show Meshif the figurine (persists after talking to Meshif)
//		me.getQuest(20, 16/19) = Ask cain about golden bird? need to check to see when these turn on. All i know is they are off before finding the figurine.
//		me.getQuest(20, 4) = Give golden bird to Alkor
//		me.getQuest(20, 1/28) = Return to Alkor for reward. 28 turns on once quest log is opened after reaching this stage.
//		me.getQuest(20, 0) = Quest complete.
//		me.getQuest(20, 5/12/13) = Quest complete/have potion? (16/19 persist at this stage, but 6/2/4/1 are off)
//		me.getQuest(20, 5/12/13/16/19) = persists after drinking potion
//	----------------------------

		this.status("Processing the Figurine");
		Town.goToTown(3);
		if (me.getItem(QuestItems.jade)) { // Have A Jade Figurine.
			if (!me.getQuest(20, 2)) { // Not at the "Show Meshif the Figurine" stage yet. Need to talk to Cain.
				Town.move("cain");
				cain = getUnit(1, "deckard cain");
				cain.openMenu();
				me.cancel();
			}
			Town.move("meshif");
			meshif = getUnit(1, "meshif");
			meshif.openMenu();
		}
		if (me.getItem(QuestItems.goldenBird)) { // Have The Golden Bird.
			if (!me.getQuest(20, 4)) { // Not at the "Give Golden Bird to Alkor" stage yet. Need to talk to Cain.
				Town.move("cain");
				cain = getUnit(1, "deckard cain");
				cain.openMenu();
				me.cancel();
			}
			Town.move("alkor");
			alkor = getUnit(1, "alkor");
			alkor.openMenu();
			me.cancel();
		}

		if (!me.getQuest(20, 1) && !me.getQuest(20, 0)) {
			var j = 0 ;
			while (!me.getQuest(20, 1) && !me.getQuest(20, 0)) { // Haven't done the Jade Figurine quest yet. It's possible another character has the Jade Figurine. After checking myself for it and processing if it had it, I should wait here until the "Return to Alkor for reward" stage.
				sendPacket(1, 0x40); // This is likely required to refresh the status of me.getQuest(20, 1) as has been tested with me.getQuest(18, 0) in this.travincal()
				delay(1000);
				if (j % 5 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
		if (!me.getQuest(20, 0)) {
			Town.move("alkor");
			alkor = getUnit(1, "alkor");
			alkor.openMenu();
			me.cancel();
		}
		delay(500);
		potion = me.getItem(QuestItems.lifePotion); // Already declared var and checked once in this.start(). Now that Golden Bird is complete, check for the unit again.
		if (potion) {
			this.status("Drinking the Figurine potion!");
			if (potion.location > 3) {
				this.openStash();
			}
			clickItem(1, potion);
		}
		Town.move("cain");
		teamFigurine = false;
		this.status("Seriously, the 'Potion of Life'?? Tastes more like 'Potion of Piss'!!!");
		return true;
	};
	
	this.lamEsen = function () { // Teleporting Sorc walks over to Alkor and completes the quest for everyone via exploit.
		var i, alkor, target;
		this.status("Lam Essen's Tome");
		Town.goToTown(3);
		this.teamInGame();
		if (!me.inTown) {
			Town.goToTown();
		}
		if(teleportingSorc){
			if(me.charlvl >=18 && me.classid ===1 ) {
				Pather.teleport = true;
			} else {
				Pather.teleport = false;
			}
			if (!Town.goToTown() || !Pather.useWaypoint(80, true)) {
				throw new Error("Lam Essen quest failed");
			}
			Precast.doPrecast(false);
			if (!Pather.moveToExit(94, true) || !Pather.moveToPreset(me.area, 2, 193)) {
				throw new Error("Lam Essen quest failed");
			}		
			if (Pather.teleport === true) {
				Pather.moveToExit(94, true, false);
				if(!Pather.moveToPreset(me.area, 2, 193, 0, 0, 0)){
					Pather.moveToPreset(me.area, 2, 193);
				}				
			} else {
				Pather.moveToExit(94, true, 0);
				if(!Pather.moveToPreset(me.area, 2, 193, 0, 0, 0)){
					Pather.moveToPreset(me.area, 2, 193);
				}
			}
			// PD2: Lam Esen's Tome is bbb/565 — LoD 548 is wrong and left pickItem(undefined)
			if (!this.getQuestItem(QuestItems.lamEsen, 193)) {
				this.status("lamEsen: failed to pick bbb/" + QuestItems.lamEsen);
				return false;
			}
			Town.goToTown();
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "Lam Essen");
		}
		Town.move("alkor");
		target = getUnit(1, "alkor");
		while(target && target.openMenu()) {
			me.cancel();
			sendPacket(1, 0x40); //to refresh the status of me.getQuest(17, 0).
			if (me.getQuest(17, 0)) { // Have completed Lam Esen's Tome.
				break;
			}
		}
		return true;
	};

	// Wait for level data after WP / exit (avoids native getArea/getPresetUnits crash)
	this.waitLevelReady = function (timeout) {
		var tick;

		if (timeout === undefined) {
			timeout = 5000;
		}

		tick = getTickCount();

		while (getTickCount() - tick < timeout) {
			try {
				if (getRoom() && getArea()) {
					return true;
				}
			} catch (eWait) {}

			delay(100);
		}

		return false;
	};

	// Wait for level data, then moveToPreset (never call getPresetUnit on an unloaded area)
	this.safeMoveToPreset = function (area, type, id, clearPath) {
		var i;

		if (me.area !== area) {
			this.status("safeMoveToPreset: want area " + area + " but in " + me.area);
			return false;
		}

		if (clearPath === undefined) {
			clearPath = !Pather.teleport;
		}

		if (!this.waitLevelReady()) {
			this.status("safeMoveToPreset: level not ready area=" + me.area);
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			try {
				if (Pather.moveToPreset(me.area, type, id, 0, 0, clearPath)) {
					return true;
				}
			} catch (ePreset) {
				this.status("safeMoveToPreset: " + ePreset);
			}

			delay(400 + me.ping);
		}

		return false;
	};

	this.safeMoveToExit = function (targetArea, clearPath) {
		var i;

		if (!this.waitLevelReady()) {
			this.status("safeMoveToExit: level not ready (area=" + me.area + ")");
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			try {
				if (Pather.moveToExit(targetArea, true, clearPath) && me.area === targetArea) {
					this.waitLevelReady(3000);
					return true;
				}
			} catch (eExit) {
				this.status("safeMoveToExit(" + targetArea + "): " + eExit);
			}

			delay(500 + me.ping);
		}

		return me.area === targetArea;
	};

	this.eye = function () {
		var clearPath, item;
		this.status("getting eye");
		this.teamInGame();
		if (!me.inTown) {
			Town.goToTown();
		}
		this.enableTeleport();
		clearPath = !Pather.teleport;

		try {
			if (!Pather.useWaypoint(76, true) || me.area !== 76) {
				this.status("eye: Spider Forest WP failed (area=" + me.area + ")");
				return false;
			}
			this.waitLevelReady();
			Precast.doPrecast(true);

			if (!this.safeMoveToExit(85, clearPath)) {
				this.status("eye: failed Spider Cavern (area=" + me.area + ")");
				return false;
			}

			if (clearPath) {
				Attack.clear(20);
			}

			if (!this.safeMoveToPreset(85, 2, 407, clearPath)) {
				this.status("eye: chest 407 not found");
				return false;
			}

			if (!this.getQuestItem(QuestItems.khalimEye, 407)) {
				this.status("eye: failed to pick qey/" + QuestItems.khalimEye);
				return false;
			}
		} catch (eEye) {
			this.status("eye: " + eEye);
			return false;
		}

		Town.goToTown();
		item = QuestItems.find(QuestItems.khalimEye, "qey") || me.getItem(QuestItems.khalimEye) || me.getItem("qey");
		if (item) {
			Town.move("stash");
			delay(me.ping);
			Town.openStash();
			Storage.Stash.MoveTo(item);
		}
		return true;
	};

	this.heart = function () {
		var clearPath, item;
		this.status("getting heart");
		this.teamInGame();
		if (!me.inTown) {
			Town.goToTown();
		}
		this.enableTeleport();
		clearPath = !Pather.teleport;

		try {
			if (!Pather.useWaypoint(80, true) || me.area !== 80) {
				this.status("heart: Kurast Bazaar WP failed (area=" + me.area + ")");
				return false;
			}
			this.waitLevelReady();
			Precast.doPrecast(true);

			if (!this.safeMoveToExit(92, clearPath)) {
				this.status("heart: failed Sewers 1 (area=" + me.area + ")");
				return false;
			}
			if (!this.safeMoveToExit(93, clearPath)) {
				this.status("heart: failed Sewers 2 (area=" + me.area + ")");
				return false;
			}

			if (!this.safeMoveToPreset(93, 2, 405, clearPath)) {
				this.status("heart: chest 405 not found");
				return false;
			}

			if (!this.getQuestItem(QuestItems.khalimHeart, 405)) {
				this.status("heart: failed to pick qhr/" + QuestItems.khalimHeart);
				return false;
			}
		} catch (eHeart) {
			this.status("heart: " + eHeart);
			return false;
		}

		Town.goToTown();
		item = QuestItems.find(QuestItems.khalimHeart, "qhr") || me.getItem(QuestItems.khalimHeart) || me.getItem("qhr");
		if (item) {
			Town.move("stash");
			delay(me.ping);
			Town.openStash();
			Storage.Stash.MoveTo(item);
		}
		return true;
	};

	this.brain = function () {
		var clearPath, item;
		this.status("getting brain");
		this.teamInGame();
		if (!me.inTown) {
			Town.goToTown();
		}
		this.enableTeleport();
		clearPath = !Pather.teleport;

		try {
			// Flayer Jungle WP — wait for level before any getArea/exit work
			if (!Pather.useWaypoint(78, true) || me.area !== 78) {
				this.status("brain: Flayer Jungle WP failed (area=" + me.area + ")");
				return false;
			}
			if (!this.waitLevelReady()) {
				this.status("brain: Flayer Jungle level not ready");
				return false;
			}
			Precast.doPrecast(true);

			if (!this.safeMoveToExit(88, clearPath)) {
				this.status("brain: failed Flayer Dungeon 1 (area=" + me.area + ")");
				return false;
			}
			if (!this.safeMoveToExit(89, clearPath)) {
				this.status("brain: failed Flayer Dungeon 2 (area=" + me.area + ")");
				return false;
			}
			if (!this.safeMoveToExit(91, clearPath)) {
				this.status("brain: failed Flayer Dungeon 3 (area=" + me.area + ")");
				return false;
			}

			if (!this.safeMoveToPreset(91, 2, 406, clearPath)) {
				this.status("brain: chest 406 not found (area=" + me.area + ")");
				return false;
			}

			if (!this.getQuestItem(QuestItems.khalimBrain, 406)) {
				this.status("brain: failed to pick qbr/" + QuestItems.khalimBrain);
				return false;
			}
		} catch (eBrain) {
			this.status("brain: " + eBrain);
			if (!me.inTown) {
				Town.goToTown();
			}
			return false;
		}

		Town.goToTown();
		item = QuestItems.find(QuestItems.khalimBrain, "qbr") || me.getItem(QuestItems.khalimBrain) || me.getItem("qbr");
		if (item) {
			Town.move("stash");
			delay(me.ping);
			Town.openStash();
			Storage.Stash.MoveTo(item);
		}
		return true;
	};

	this.travincal = function () {
		var cain, orgX, orgY, preArea;
		this.buildList = function (checkColl) {
			var monsterList = [],
				monster = getUnit(1);
			if (monster) {
				do {
					if ([345, 346, 347].indexOf(monster.classid) > -1 && Attack.checkMonster(monster) && (!checkColl || !checkCollision(me, monster, 0x1))) {
						monsterList.push(copyUnit(monster));
					}
				} while (monster.getNext());
			}
			return monsterList;
		};
		var questTry, quest = true;
		for(questTry = 0 ; questTry < 10 ; questTry +=1 ){
			if(me.getQuest(23,0)){
				quest = false;
				break;
			}
			delay(100);
		}
		this.status("travincal");
		Town.goToTown(3);
		Town.doChores();
		this.teamInGame();
		Pather.teleport = true; // Turn teleport on for all characters. Will turn off right before fighting if it is normal difficulty.
		if(quest){
			while (!cain || !cain.openMenu()) { // Try more than once to interact with Deckard Cain.
				Packet.flash(me.gid);
				Town.move("cain");
				cain = getUnit(1, "deckard cain");
				delay(1000);
			}
			me.cancel();
		}
		if (teleportingSorc) { // I am the Teleporting Sorc, open a portal to Travincal next to the High Council.
			Pather.useWaypoint(83);
			Precast.doPrecast(true);
			orgX = me.x;
			orgY = me.y;
			this.teamInGame();
			Pather.moveTo(orgX + 101, orgY - 92, 5, false);	// (<3 kolton)
			Pather.makePortal();
		} else { // I am not a Sorc, enter the Sorc's Travincal portal.
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(83, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
		Attack.clearList(this.buildList(0)); // Kill the High Council
		Pickit.pickItems();
		if(!quest) {
			if(!Pather.usePortal(null, null)){
				Town.goToTown();
			}
			return true;
		}
		if (teleportingSorc && !me.getQuest(18, 0)) { // I am the Teleporting Sorc and I have not completed Khalim's Will yet. Will smash the orb while the others keep the area clear.
			this.getQuestItem(QuestItems.khalimFlail); // Pick up Khalim's Flail (qf1).
			preArea = me.area;
			if(!me.inTown){
				Town.goToTown();
			}
			if (!this.cubeFlail() || !this.equipFlail()) {
				this.status("travincal: cube/equip Khalim's Will failed — retry next game");
				Item.autoEquip();

				return false;
			}
			Town.move("portalspot");
			if (!Pather.usePortal(preArea, me.name)) {
				throw new Error("AutoSmurf.travincal: Failed to go back from town");
			}
			Config.PacketCasting = 1;
			this.teamInGame();
			this.placeFlail();
		} else { // I am not the Teleporting Sorc or Khalim's Will has been completed. If it the latter is true the while loop on the next line will be skipped.
			while (!me.getQuest(18, 0)) { // I am not the Teleporting Sorc and have not completed Khalim's Will yet.
				sendPacket(1, 0x40); // This is required to refresh the status of me.getQuest(18, 0). Without it, me.getQuest(18, 0) will not == 1 until the Quest Tab is opened on the character.
				Pather.moveToExit(100, false); // Stairs to Durance of Hate Level 1.
				Attack.clear(15);
				delay(1000);
			}
		}
		var unit = getUnit(4, 546);
		if(unit && teleportingSorc)
			this.getQuestItem(QuestItems.jade);
		if (me.findItem(546) || me.findItem(547) || me.getQuest(20, 1)) { // Have A Jade Figurine or The Golden Bird or need to Return to Alkor for Reward (possible if someone's Pickit then Town processes the Quest). Tell the Teleporting Sorc so she gets us to process it.
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "team figurine");			
			teamFigurine = true;
		}
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}			
		if(teleportingSorc)
			Pickit.pickItems();
		Item.autoEquip(); // For teleportingSorc to re-equip her weapon.
		this.waitForPartyMembers(); // Wait for everyone to finish Travincal and come to town so I don't miss someone announcing team figurine.
		this.status("done travincal.");
		return true;
	};
	
	this.mephisto = function () {
		var cain;
		var questTry, quest = true;
		for(questTry = 0 ; questTry < 10 ; questTry +=1 ){
			if(me.getQuest(23,0)){
				quest = false;
				break;
			}
			delay(100);
		}
		this.status("mephisto");
		Town.goToTown(3);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if(quest){
			while (!cain || !cain.openMenu()) { // Try more than once to interact with Deckard Cain.
				Packet.flash(me.gid);
				Town.move("cain");
				cain = getUnit(1, "deckard cain");
				delay(1000);
			}
			me.cancel();
		}
		if (teleportingSorc) { // I am the Teleporting Sorc.
			Pather.useWaypoint(101);
			Precast.doPrecast(true);
			Pather.moveToExit(102, true, false);
			//Pather.moveTo(17566, 8069); //Dark-f
			Pather.moveTo(17542, 8066);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(102, null)) {
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
		this.teamInGame();
		try{
			Attack.kill(242);
		}catch(e){
			print(e);
			Attack.clear(20);
		}	
		Pickit.pickItems();
		if(!quest) {
			if (teleportingSorc) {
				Pather.moveTo(17572, 8011);
				Attack.openChests(5);
				Pather.moveTo(17572, 8125);
				Attack.openChests(5);
				Pather.moveTo(17515, 8061);
				Attack.openChests(5);
			}
			if(!Pather.usePortal(null, null)){
				if(teleportingSorc) {
					Town.goToTown();
				} else {
					delay(1000);
					if(!Pather.usePortal(null, null))
						Town.goToTown();
				}
			}			
			return true;
		}
		if ((me.getQuest(22, 0) || me.getQuest(22, 12)) && ((me.diff === 0 && this.partyLevel(mephLvl)) || (me.diff === 1 && this.partyLevel(mephLvlnm)) || (me.diff === 2 && this.partyLevel(mephLvlhell)))) { // Completed Meph Quest and the party has reached the difficulty specific mephLvl requirement.
			var i, redPortal;
			for (i = 0 ; i < 5 ; i += 1) {
				redPortal = getPresetUnit(102, 2, 342);
				if (redPortal) {
					break;
				}
				delay(me.ping * 2 + 250);
			}
			while (getDistance(me.x, me.y, redPortal.roomx * 5 + redPortal.x, redPortal.roomy * 5 + redPortal.y) > 10) {
				try {
					Pather.moveToPreset(102, 2, 342, 0, 0, false, false);
				} catch (e) {
					this.status("Caught Error.");
					print(e);
				}
			}
			while (me.area === 102) {
				redPortal = getUnit(2, 342);
				Pather.usePortal(null, null, redPortal); // Go to Act 4.
			}
		} else {
			Town.goToTown();
			Town.doChores();
		}
		this.waitForPartyMembers();
		return true;
	};

	this.izual = function () {
		var tyrael;
		this.status("izual");
		Town.doChores(); // Need max amount of potions otherwise might prematurely TP in Plains Of Despair.
		this.teamInGame();
		if (!me.getQuest(25, 1)) {
			if (teleportingSorc) {
				Pather.teleport = true;
				Town.goToTown();
				Precast.doPrecast(true);
				Pather.useWaypoint(106);
				Pather.moveToExit(105, true, false); // Plains Of Despair
				var presetUnit = getPresetUnit(105, 1, 256);
				if (!presetUnit) {
					return false;
				}
				Pather.moveTo(presetUnit.roomx * 5 + presetUnit.x, presetUnit.roomy * 5 + presetUnit.y, 15, false);
				Pather.makePortal();
			} else {
				Town.goToTown(4);
				Town.move("portalspot");
				var j = 0;
				while (!Pather.usePortal(105, null)) {
					delay(250);
					if (j % 20 == 0) { // Check for Team Members every 5 seconds.
						this.teamInGame();
					}
					j += 1;
				}
			}
			this.teamInGame();
			try {
				Attack.clear(15, 0, 256); // Izual
			} catch (e) {
				print(e);
				Attack.clear(20);
			}
			if(!Pather.usePortal(null, null)){
				if(teleportingSorc) {
					Town.goToTown();
				} else {
					delay(1000);
					if(!Pather.usePortal(null, null))
						Town.goToTown();
				}
			}	
		}
		Town.move("tyrael");
		tyrael = getUnit(1, "tyrael");
		tyrael.openMenu();
		me.cancel();
		return true;
	};
	
	this.diablo = function (entry) {
		if (entry === undefined) {
			entry = false;
		}
		// Sort function
		this.sort = function (a, b) {
			if (Config.BossPriority) {
				if ((a.spectype & 0x5) && (b.spectype & 0x5)) {
					return getDistance(me, a) - getDistance(me, b);
				}
				if (a.spectype & 0x5) {
					return -1;
				}
				if (b.spectype & 0x5) {
					return 1;
				}
			}
			// Entrance to Star / De Seis
			if (me.y > 5325 || me.y < 5260) {
				if (a.y > b.y) {
					return -1;
				}
				return 1;
			}
			// Vizier
			if (me.x < 7765) {
				if (a.x > b.x) {
					return -1;
				}
				return 1;
			}
			// Infector
			if (me.x > 7825) {
				if (!checkCollision(me, a, 0x1) && a.x < b.x) {
					return -1;
				}
				return 1;
			}
			return getDistance(me, a) - getDistance(me, b);
		};
		// general functions
		this.getLayout = function (seal, value) {
			var sealPreset = getPresetUnit(108, 2, seal);
			if (!seal) {
				throw new Error("Seal preset not found. Can't continue.");
			}
			if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value) {
				return 1;
			}
			return 2;
		};
		this.initLayout = function () {
			this.vizLayout = this.getLayout(396, 5275);
			this.seisLayout = this.getLayout(394, 7773);
			this.infLayout = this.getLayout(392, 7893);
		};
		this.openSeal = function (classid) {
			var i, seal, warn;
			switch (classid) {
			case 396:
			case 394:
			case 392:
				warn = true;
				break;
			default:
				warn = false;
				break;
			}
			for (i = 0; i < 5; i += 1) {
				Pather.moveToPreset(108, 2, classid, classid === 394 ? 5 : 2, classid === 394 ? 5 : 0);
				seal = getUnit(2, classid);
				if (!seal) {
					return false;
				}
				if (seal.mode) { // Other player opened Seal already.
					if (warn) {
						//say(Config.Diablo.SealWarning);
					}
					return true;
				}
				warn = false;				
				if (classid === 394) {
					Misc.click(0, 0, seal);
				} else {
					seal.interact();
				}
				delay(classid === 394 ? 1000 : 500); 
				if (!seal.mode) {
					if (classid === 394 && Attack.validSpot(seal.x + 15, seal.y)) { // De Seis optimization
						Pather.moveTo(seal.x + 15, seal.y);
					} else {
						Pather.moveTo(seal.x - 5, seal.y - 5);
					}
					delay(500);
				} else {
					return true;
				}
			}
			return false;
		};
		this.chaosPreattack = function (name, amount) {
			var i, n, target, positions;
			switch (me.classid) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				target = getUnit(1, name);
				if (!target) {
					return;
				}
				positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];
				for (i = 0; i < positions.length; i += 1) {
					if (Attack.validSpot(target.x + positions[i][0], target.y + positions[i][1])) { // check if we can move there
						Pather.moveTo(target.x + positions[i][0], target.y + positions[i][1]);
						Skill.setSkill(Config.AttackSkill[2], 0);
						for (n = 0; n < amount; n += 1) {
							Skill.cast(Config.AttackSkill[1], 1);
						}
						break;
					}
				}
				break;
			case 4:
				break;
			case 5:
				break;
			case 6:
				break;
			}
		};
		this.getBoss = function (name) {
			var i, boss,
				glow = getUnit(2, 131);
			for (i = 0; i < 16; i += 1) {
				boss = getUnit(1, name);
				if (boss) {
					this.chaosPreattack(name, 8);
					return Attack.clear(40, 0, name, this.sort);
				}
				delay(250);
			}
			return !!glow;
		};
		this.vizierSeal = function () {
			this.status("Viz layout " + this.vizLayout);
			this.followPath(this.vizLayout === 1 ? this.starToVizA : this.starToVizB);
			if (!this.openSeal(395) || !this.openSeal(396)) {
				throw new Error("Failed to open Vizier seals.");
			}
			if (this.vizLayout === 1) {
				Pather.moveTo(7691, 5292, 3, true, true);
			} else {
				Pather.moveTo(7695, 5316, 3, true, true);
			}
			if (!this.getBoss(getLocaleString(2851))) {
				Attack.clear(30);
				//throw new Error("Failed to kill Vizier");
			}
			return true;
		};
		this.seisSeal = function () {
			this.status("Seis layout " + this.seisLayout);
			this.followPath(this.seisLayout === 1 ? this.starToSeisA : this.starToSeisB);
			if (!this.openSeal(394)) {
				throw new Error("Failed to open de Seis seal.");
			}
			if (this.seisLayout === 1) {
				if(me.classid === 1) {
					delay(3000);
					Pather.moveTo(7771, 5196); //(7771, 5196);
				} else {
					Pather.moveTo(7771, 5196, 3, true, true); //(7771, 5196, 3, true, true);
				}
			} else {
				if(me.classid === 1) {
					delay(3000);
					Pather.moveTo(7807, 5186); //(7798, 5186);
				} else {
					Pather.moveTo(7792, 5150, 3, true, true); //(7798, 5186, 3, true, true); 
				}
			}
			if (!this.getBoss(getLocaleString(2852))) {
				Attack.clear(30);
				//throw new Error("Failed to kill de Seis");
			}
			return true;
		};
		this.infectorSeal = function () {
			this.status("Inf layout " + this.infLayout);
			this.followPath(this.infLayout === 1 ? this.starToInfA : this.starToInfB);
			if (!this.openSeal(392)) {
				//throw new Error("Failed to open Infector seals.");
			}
			if (this.infLayout === 1) {
				delay(1);
			} else {
				if(me.classid === 1) { // Dark-f
					Pather.moveTo(7921, 5280); // (7928, 5295);
				} else {
					Pather.moveTo(7921, 5280, 3, true); // (7928, 5295, 3, true);
				}
			}
			if (!this.getBoss(getLocaleString(2853))) {
				Attack.clear(30);
				//throw new Error("Failed to kill Infector");
			}
			if (!this.openSeal(393)) {
				Attack.clear(30);
				//throw new Error("Failed to open Infector seals.");
			}
			return true;
		};
		this.diabloPrep = function () {
			var trapCheck,
				tick = getTickCount();
			while (getTickCount() - tick < 30000) {
				if (getTickCount() - tick >= 8000) {
					if (getUnit(1, 243)) {
						return true;
					}
					switch (me.classid) {
					case 1: // Sorceress
						if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
							if (me.getState(121)) {
								delay(500);
							} else {
								Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);
							}
							break;
						}
						delay(500);
						break;
					case 3: // Paladin
						Skill.setSkill(Config.AttackSkill[2]);
						Skill.cast(Config.AttackSkill[1], 1);
						break;
					case 5: // Druid
						if (Config.AttackSkill[1] === 245) {
							Skill.cast(Config.AttackSkill[1], 0, 7793, 5293);
							break;
						}
						delay(500);
						break;
					case 6: // Assassin
						if (Config.UseTraps) {
							trapCheck = ClassAttack.checkTraps({x: 7793, y: 5293});
							if (trapCheck) {
								ClassAttack.placeTraps({x: 7793, y: 5293, classid: 243}, trapCheck);
								break;
							}
						}
						delay(500);
						break;
					default:
						delay(500);
						break;
					}
				} else {
					delay(500);
				}
				if (getUnit(1, 243)) {
					return true;
				}
			}
			return true; //throw new Error("Diablo not found"); //Dark-f comments this line
		};
		this.followPath = function (path) {
			var i;
			for (i = 0; i < path.length; i += 2) {
				if (this.cleared.length) {
					this.clearStrays();
				}
				Pather.moveTo(path[i], path[i + 1], 3, getDistance(me, path[i], path[i + 1]) > 50);
				Attack.clear(30, 0, false, this.sort);
				// Push cleared positions so they can be checked for strays
				this.cleared.push([path[i], path[i + 1]]);
				// After 5 nodes go back 2 nodes to check for monsters
				if (i === 10 && path.length > 16) {
					path = path.slice(6);
					i = 0;
				}
			}
		};
		this.clearStrays = function () {
			var i,
				oldPos = {x: me.x, y: me.y},
				monster = getUnit(1);
			if (monster) {
				do {
					if (Attack.checkMonster(monster)) {
						for (i = 0; i < this.cleared.length; i += 1) {
							if (getDistance(monster, this.cleared[i][0], this.cleared[i][1]) < 30 && Attack.validSpot(monster.x, monster.y)) {
								Pather.moveToUnit(monster);
								Attack.clear(15, 0, false, this.sort);
								break;
							}
						}
					}
				} while (monster.getNext());
			}
			if (getDistance(me, oldPos.x, oldPos.y) > 5) {
				Pather.moveTo(oldPos.x, oldPos.y);
			}
			return true;
		};
		this.cleared = [];
		// (following is copied from MF diablo)
		this.entranceToStar = [7794, 5517, 7791, 5491, 7768, 5459, 7775, 5424, 7817, 5458, 7777, 5408, 7769, 5379, 7777, 5357, 7809, 5359, 7805, 5330, 7780, 5317, 7791, 5293];
		this.starToVizA = [7759, 5295, 7734, 5295, 7716, 5295, 7718, 5276, 7697, 5292, 7678, 5293, 7665, 5276, 7662, 5314];
		this.starToVizB = [7759, 5295, 7734, 5295, 7716, 5295, 7701, 5315, 7666, 5313, 7653, 5284];
		this.starToSeisA = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7775, 5205, 7804, 5193, 7814, 5169, 7788, 5153];
		this.starToSeisB = [7781, 5259, 7805, 5258, 7802, 5237, 7776, 5228, 7811, 5218, 7807, 5194, 7779, 5193, 7774, 5160, 7803, 5154];
		this.starToInfA = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5295, 7919, 5290];
		this.starToInfB = [7809, 5268, 7834, 5306, 7852, 5280, 7852, 5310, 7869, 5294, 7895, 5274, 7927, 5275, 7932, 5297, 7923, 5313];
		
		// start
		this.status("diablo");
		Town.doChores();
		this.teamInGame();
		//if( teleportingSorc && me.classid === 1) {
		//if(me.classid === 1) {
			Pather.teleport = true;
		//} else {
		//	Pather.teleport = false;
		//}
		var clearType;		
		if (teleportingSorc) {
			Pather.useWaypoint(107);
			Precast.doPrecast(true);
			//if( me.classid === 1){
				clearType = false;
			//} else {
			//	clearType = true;
			//}
			if(entry){
				Pather.moveTo(7790, 5544, 10, clearType, clearType); // Start at Entrance.
			} else {
				Pather.moveTo(7791, 5293, 10, clearType, clearType); // Start at Star.
			}
			Pather.makePortal();
			if(me.classid === 1)
				Town.goToTown();
		} else {
			Town.goToTown(4);
			Town.move("portalspot");
			Precast.doPrecast(true);
			while (!Pather.usePortal(108, null)) {
				delay(100);
			}
		}
		//this.Bo();
		Attack.clear(10);
		if(teleportingSorc && me.classid ===1) {
			delay(2000);
			Pather.usePortal(108, null);
			Pather.makePortal();
		}
		if(entry){
			Pather.moveTo(7790, 5544, 10, true, true);
			Attack.clear(30, 0, false, this.sort);
			this.followPath(this.entranceToStar);
		}
		Config.ClearType = 0;
		this.initLayout();
		Attack.clear(30, 0, false, this.sort);
		Precast.doPrecast(true);
		if (me.y > 5400) {
			this.status("Started at Entrance.");
			this.followPath(this.entranceToStar);
			Attack.clear(30, 0, false, this.sort);
		} else {
			this.status("Started at Star.");
		}
		this.vizierSeal();
		Pather.teleport = false;
		Pather.moveTo(7770, 5285);
		Pather.teleport = true;
		this.seisSeal();
		this.infectorSeal();
		Precast.doPrecast(true);
		if(me.classid === 1)
			delay(1000);
		this.teamInGame();
		switch (me.classid) {
		case 1:
			Pather.moveTo(7772, 5274); //7792,5294
			break;
		default:
			Pather.moveTo(7788, 5292);
			break;
		}
		this.diabloPrep();
		if (me.gametype === 0) {
			try {
				Attack.hurt(243, 30);
			} catch(e) {
				print(e);
			}
			Town.goToTown();
			Town.doChores();
			Town.move("portalspot");
			getScript("tools/ToolsThread.js").pause(); // Pausing ToolsThread.js will effectively turn off chicken and leaving when other characters exit.
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "ready to kill diablo");
			while (readyToKillDiablo !== Config.AutoSmurf.TeamSize - 1) {
				delay(250);
			}
			this.teamInGame();
			Pather.usePortal(108, null);
		}
		try {
			Attack.kill(243); // Diablo
		} catch(e) {
			print(e);
			var diablo = getUnit(1, 243);
			if (diablo) {
				while (Attack.checkMonster(diablo)) {
					delay(250);
				}
			}
		}
		if (me.dead) { // It is possible to die after ToolsThread.js is paused (no potions and no chicken).
			var diablo = getUnit(1, 243);
			while (Attack.checkMonster(diablo)) {
				delay(250);
			}
		}
		delay(2000); // Seems necessary to delay after Diablo dies for experience and quest to be gained.
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}		
		return true; // Continue to Act 5 in expansion.
	};

	this.shenk = function () { // SiC-666 TODO: Rewrite this.
		this.status("shenk");
		Town.goToTown(5);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			if (!Pather.useWaypoint(111, false)) {
				throw new Error();
			}
			Pather.moveTo(3890, 5114, 5, false);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(110, null)){
				delay(1000);
			}
		}
		try{
			Attack.kill(getLocaleString(22435)); // Shenk the Overseer
		}catch(e){
			print(e);
			Attack.clear(20);
		}	
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}		
		return true;
	};

	this.rescueBarbs = function() {
		this.status("coming barbies");
		var i, k, qual, door, skill,
			coords =[],
			barbSpots = [];
		this.teamInGame();
		if(!me.getQuest(36,1) && teleportingSorc){
			Pather.teleport = true;
			Pather.useWaypoint(111, false);
			Precast.doPrecast(true);
			barbSpots = getPresetUnits (me.area, 2, 473);
			if (!barbSpots) {
				return false;
			}
			for ( i = 0  ; i < barbSpots.length ; i += 1) {
				coords.push({
					x: barbSpots[i].roomx * 5 + barbSpots[i].x - 3, //Dark-f: x-3
					y: barbSpots[i].roomy * 5 + barbSpots[i].y
				});
			}
            Config.PacketCasting = 1;
			for ( k = 0  ; k < coords.length ; k += 1) {
				this.status("going to barbspot "+(k+1)+"/"+barbSpots.length);
				Pather.moveToUnit(coords[k], 2, 0);
				door = getUnit(1, 434); 
				if (door) {
					Pather.moveToUnit(door, 1, 0);
					for (i = 0; i < 20 && door.hp; i += 1) {
						if(me.getSkill(45, 1))
							Skill.cast(45, 0, door.x, door.y);
						delay(50);
						if(me.getSkill(55, 1))
							Skill.cast(55, 0, door.x, door.y);
						delay(50);
						if(me.getSkill(47, 1))
							Skill.cast(47, 0, door.x, door.y);
                        delay(50);
						if(me.getSkill(49, 1))
							Skill.cast(40, 0, door.x, door.y);
                        delay(50);
                    }
				}
				delay(1500 + 2 * me.ping); //barb going to town...
			}
			delay(1000);
			Town.goToTown();
		}
		Town.move("qual-kehk");
		delay(1000+me.ping);
		qual = getUnit(1, "qual-kehk");
		while(!me.getQuest(36,0)){
			qual.openMenu();
			me.cancel();
			delay(500);
			sendPacket(1, 0x40); //fresh Quest state.
			if(me.getQuest(36,0))
				break;
		}
		return true;
	};

	this.anya = function () { // Dark-f: Rewrite this.
		this.status("anya");
		var i, anya, malah, scroll, unit, waitAnya;
		Town.doChores();
		this.teamInGame();
		if (!me.getQuest(37, 1)) {
			if (teleportingSorc) {				
				Precast.doPrecast(true);				
				Pather.useWaypoint(113, false); 				
				var clearType;				
				if(me.classid === 1) {	//Dark-f: mind already changed, this is not correct now
					Pather.teleport = true;
					clearType = false;
				} else {
					Pather.teleport = false;
					clearType = true;
				}
				try{
					Pather.moveToExit(114, true, clearType);
				}catch(e){
					print(e);
				}
				if(me.area!==114){
					try{
						Pather.moveToExit(114, true, clearType);
					}catch(e){
						print(e);
					}
				}
				Pather.moveToPreset(me.area, 2, 460, -5, -5);
				Pather.makePortal();
					
			} else {
				Town.goToTown(5);
				Town.move("portalspot");
				while(!Pather.usePortal(114, null)){
					delay(1000);
				}
			}
			Attack.clear(50); 
			delay(me.ping+850);
			anya = getUnit(2, 558);
			if (anya) {
				if (teleportingSorc) {
					Pather.moveToUnit(anya);
					for (i = 0; i < 3; i += 1) {
						if (getDistance(me, anya) > 3) {
							Pather.moveToUnit(anya);
						}
						anya.interact();
						delay(300 + me.ping);
						me.cancel();
					}					
					Town.goToTown(5);
					Town.move("malah");
					malah = getUnit(1, "malah");
					while(true) {
						malah.interact();
						if (malah && malah.openMenu()) {
							me.cancel();
						}						
						if ( me.getItem(644))
							break;
						delay(500);
					}
					if ( me.getItem(644)) {
						Town.move("portalspot");
						while(!Pather.usePortal(114, null)){
							delay(500);
						}					
						for (i = 0; i < 3; i += 1) {
							if (getDistance(me, anya) > 3) {
								Pather.moveToUnit(anya);
							}
							anya.interact();
							delay(300 + me.ping);
							me.cancel();
						}
					}
				} else {
					for (i = 0; i < 3; i += 1) {
						delay(3000);
						Attack.clear(30); 
					}
					while(!Pather.usePortal(null, null)){ // Wait for TeleportingSorc making portal
						delay(1000);
					}
				}
			}
			Town.goToTown(5);
			Town.move("malah");
			malah = getUnit(1, "malah");
			while(true) {
				malah.interact();
				malah.openMenu();
				me.cancel(1);
				if(me.getItem(QuestItems.scrollResist))
					break;
				delay(1000);
			}
		}
		Town.goToTown(5);
		scroll = me.getItem(QuestItems.scrollResist);
		if (scroll) {
			clickItem(1, scroll);
		}
		anya = getUnit(1, "anya");
		Town.move("anya");
		if(!anya){
			for (waitAnya=0 ; waitAnya<30 ; waitAnya+=1){
				delay(1000);
				anya = getUnit(1, "anya");
				if(anya){
					break;
				}
			}
		}
		if(anya){
			Town.move("anya");
			anya.openMenu();
			me.cancel();
		}
		return true;
	};

	this.ancients = function () { // Dark-f Rewrite
		this.status("ancients");
		var i, j, altar, time;
		Town.doChores();
		this.teamInGame();
		Pather.teleport = true;
		if(teleportingSorc){
			Pather.useWaypoint(118, true);
			Pather.moveToExit(120, false);
			Pather.makePortal();
		}else{
			Town.goToTown(5);
			Town.move("portalspot");
			while(!Pather.usePortal(118, null)){
				delay(10000);
			}
		}
		Precast.doPrecast(true);
		Pather.teleport = true;

		try{
			Pather.moveToExit(120, true);
		}catch(e){
			print(e);
		}

		if(me.area !==120){
			if(!me.inTown){
				Town.goToTown();
			}
			Town.move("portalspot");
			delay(10000);
			while(!Pather.usePortal(118, null)){ //(118, !me.name) ??
				delay(1000);
			}
			try{
				Pather.moveToExit(120, true);
			}catch(e){
				print(e);
			}
		}
		Pather.moveTo(10048, 12634, 5, Config.ClearType);
		this.teamInGame();
		this.Bo();
		Config.LifeChicken = 0; // Exit game if life is less or equal to designated percent.
		Config.TownHP = 0; // Go to town if life is under designated percent.
		Config.ManaChicken = 0; // Exit game if mana is less or equal to designated percent.
		Config.MercChicken = 0; // Exit game if merc's life is less or equal to designated percent.
		Config.TownMP = 0; // Go to town if mana is under designated percent.
		Config.TownCheck = false; // Go to town if out of potions
		Config.MercWatch = false; // Don't revive merc during battle.
		Pather.teleport = true;
		altar = getUnit(2, 546);
		for(time=0; time<80 ; time+=1){
			if(this.playerIn() || wait === 1) {
				break;
			}
			delay(1000);
		}
		if (altar && teleportingSorc) {
			Pather.moveToUnit(altar);
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "WaitMe");
			delay(500 + me.ping * 3);
			for (i=0; i<3; i+=1) {
				clickMap(0, 0, altar);
				delay(100 + me.ping * 2);
				me.cancel();
				while (!getUnit(1, 542)) {
					delay(250);
					me.cancel();
					break;
				}
			}
		}
		while(true){
			Attack.clear(60);
			delay(3000);
			me.cancel();			
			sendPacket(1, 0x40); //fresh Quest state.
			if(me.getQuest(39,0))
				break;
		}
		Pather.moveToExit(128, true, true);
		if(teleportingSorc){
			Pather.moveToExit(129, true, false);
			this.clickWP();
		}
		Town.goToTown();
		return true;
	};
	
	this.baal = function () {
		this.status("Baal");
		var portal, tick, questTry, quest = true;
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
			var monster = getUnit(1, "hydra");
			if (monster) {
				do {
					if (monster.mode !== 12 && monster.getStat(172) !== 2) {
						if (me.classid === 1) { // I'm a sorceress, dodge Hydras if
							Pather.moveTo(15072, 5002);
						} else {
							Pather.moveTo(15118, 5002);
						}
						while (monster.mode !== 12) {
							delay(500);
							if (!copyUnit(monster).x) {
								break;
							}
						}
						break;
					}
				} while (monster.getNext());
			}
			return true;
		};
		// baal start.
		Town.goToTown(5);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		for(questTry = 0 ; questTry < 10 ; questTry +=1 ){
			if(me.getQuest(40,0)){
				quest = false;
				break;
			}
			delay(100);
		}
		if (teleportingSorc) {		
			Pather.useWaypoint(Config.RandomPrecast ? "random" : 129);
			Precast.doPrecast(true);
			if (me.area !== 129) {
				Pather.useWaypoint(129);
			}
			if (!Pather.moveToExit([130, 131], true)) {
				throw new Error("Failed to move to Throne of Destruction.");
			}
			Pather.moveTo(15118, 5002);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(131, null)){
				delay(1000);
			}
		}
		this.clearThrone();
		tick = getTickCount();
		Pather.moveTo(15094, me.classid === 3 ? 5029 : 5038);

	MainLoop:
		while (true) {
			if (me.classid === 3 || me.classid === 4) {
				Pather.moveTo(15094, 5029);
			} else if (me.classid === 1){
				Pather.moveTo(15094, 5038);
			}
			if (!getUnit(1, 543)) {
				break MainLoop;
			}
			switch (this.checkThrone()) {
			case 1:
				Attack.clear(40);
				tick = getTickCount();
				Precast.doPrecast(true);
				break;
			case 2:
				Attack.clear(40);
				tick = getTickCount();
				break;
			case 4:
				Attack.clear(40);
				tick = getTickCount();
				break;
			case 3:
				Attack.clear(40);
				this.checkHydra();
				tick = getTickCount();
				break;
			case 5:
				Attack.clear(40);
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
		if (!this.partyLevel(baalLvl) || (me.diff === 1 && !this.partyLevel(baalLvlnm)) || (me.diff === 2 && !this.partyLevel(baalLvlhell))) { // If the team hasn't met the level requirement in Normal or Nightmare, don't kill baal.
			return true;
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
			this.status("Couldn't find portal.");
		}
		Pather.moveTo(15134, 5923);
		try{
			Attack.kill(544); // Baal
		}catch(e){
			print(e);
			Attack.clear(20);
		}	
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			if(teleportingSorc) {
				Town.goToTown();
			} else {
				delay(1000);
				if(!Pather.usePortal(null, null))
					Town.goToTown();
			}
		}	
		if(quest){
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "avoiding congrats screen");
			delay(20 * me.ping); // Wait 2-4 seconds for others to pause ToolsThread.js before leaving.
			D2Bot.restart(); // Avoid congrats screen.
		}
		return true;
	};
	
//Adding on 16-7-2018 by Dark-f for NH_MF (Nightmare & Hell difficulty)	
	this.countess = function () {
		var poi;

		if (me.getQuest(5, 0)) {
			this.status("Countess already done — skipping");
			return true;
		}

		this.status("Forgotten Tower — Countess");
		Town.goToTown(1);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = !!(me.getSkill(54, 1));

		if (teleportingSorc || Config.AutoSmurf.TeamSize === 1) {
			if (!Pather.useWaypoint(6, true)) {
				// No Black Marsh WP yet — walk from Dark Wood / Outer Cloister path
				Pather.useWaypoint(5);
				Pather.moveToExit(6, true, true);
				Pather.getWP(6, true);
			}

			Precast.doPrecast(true);
			this.Bo();
			Pather.moveToExit([20, 21, 22, 23, 24, 25], true, !Pather.teleport);
			poi = getPresetUnit(me.area, 2, 580);

			if (!poi) {
				this.status("Countess chest preset missing — clearing tower");
				Attack.clearLevel(0);
			} else {
				switch (poi.roomx * 5 + poi.x) {
				case 12565:
					Pather.moveTo(12578, 11043);
					break;
				case 12526:
					Pather.moveTo(12548, 11083);
					break;
				default:
					Pather.moveTo(poi.roomx * 5 + poi.x, poi.roomy * 5 + poi.y, 3, true);
					break;
				}
			}

			if (Config.AutoSmurf.TeamSize > 1) {
				Pather.makePortal();
			}
		} else {
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(25, null)) {
				delay(250);
				if (j % 20 == 0) {
					this.teamInGame();
				}
				j += 1;
			}
		}

		try {
			Attack.clear(20, 0, getLocaleString(2875)); // The Countess
		} catch (e) {
			print(e);
			Attack.clear(20);
		}

		Pickit.pickItems();

		if (!Pather.usePortal(null, null)) {
			Town.goToTown();
		}

		sendPacket(1, 0x40);
		this.status("Countess done");
		return true;
	};	
	

	// Normal: grab Black Marsh WP from Dark Wood
	this.ensureBlackMarshWP = function () {
		if (getWaypoint(4)) { // wpAreas index 4 = Black Marsh (area 6)
			return true;
		}

		this.status("Getting Black Marsh waypoint");
		Town.doChores();

		if (!me.inTown) {
			Town.goToTown(1);
		}

		Pather.teleport = !!(me.getSkill(54, 1));
		Pather.useWaypoint(5); // Dark Wood
		this.waitForPartyMembers();
		Precast.doPrecast(true);
		Pather.moveToExit(6, true, true); // Black Marsh
		this.clickWP();
		Pather.getWP(6, true);
		Town.goToTown();

		return getWaypoint(4);
	};

	// Force-open Barracks forge (obj 108) and pick Horadric Malus (hdm/89).
	// Needs char level >= 8 or the stand will not drop the hammer.
	this.pickMalusFromForge = function () {
		var i, forge, ground, tick, preset, fx, fy;

		if (QuestItems.has(QuestItems.malus, "hdm")) {
			return true;
		}

		if (me.charlvl < 8) {
			this.status("Malus needs char lvl >= 8 (now " + me.charlvl + ")");

			return false;
		}

		forge = getUnit(2, 108);

		if (!forge) {
			preset = getPresetUnit(28, 2, 108);

			if (preset) {
				fx = preset.roomx * 5 + preset.x;
				fy = preset.roomy * 5 + preset.y;
				Pather.moveTo(fx, fy, 3, true);
				forge = getUnit(2, 108);
			}
		}

		if (!forge) {
			this.status("Forge object 108 not found in Barracks");

			return false;
		}

		if (getDistance(me, forge) > 5) {
			Pather.moveToUnit(forge);
		}

		Attack.clear(12);

		for (i = 0; i < 6; i += 1) {
			if (QuestItems.has(QuestItems.malus, "hdm")) {
				return true;
			}

			forge = getUnit(2, 108);

			if (!forge) {
				break;
			}

			Pather.moveTo(forge.x + 1, forge.y + 2, 3);
			sendPacket(1, 0x13, 4, forge.type, 4, forge.gid);
			delay(me.ping * 2 + 150);
			Misc.click(0, 0, forge);
			delay(me.ping * 2 + 150);

			try {
				if (typeof forge.interact === "function") {
					forge.interact();
				}
			} catch (eInteract) {}

			tick = getTickCount();

			while (getTickCount() - tick < 2000) {
				ground = getUnit(4, "hdm") || getUnit(4, QuestItems.malus);

				if (!ground) {
					ground = getUnit(4);

					if (ground) {
						do {
							if (ground.code === "hdm" || ground.classid === QuestItems.malus) {
								break;
							}
						} while (ground.getNext());

						if (!ground || (ground.code !== "hdm" && ground.classid !== QuestItems.malus)) {
							ground = false;
						}
					}
				}

				if (ground) {
					if (!Storage.Inventory.CanFit(ground)) {
						this.status("No inv room for Malus (1x2) — town chores");
						Town.visitTown();

						if (me.area !== 28) {
							Pather.useWaypoint(27);
							Pather.moveToExit(28, true, true);
							Pather.moveToPreset(28, 2, 108, 0, 0, true);
						}

						ground = getUnit(4, "hdm") || getUnit(4, QuestItems.malus);
					}

					if (ground) {
						Pickit.pickItem(ground);
						delay(me.ping * 2 + 400);
					}

					if (QuestItems.has(QuestItems.malus, "hdm")) {
						return true;
					}
				}

				delay(40);
			}
		}

		return QuestItems.has(QuestItems.malus, "hdm");
	};

	// Tools of the Trade — Outer Cloister → Barracks → Smith → Charsi
	this.smith = function () {
		var charsi, malus, forge;

		sendPacket(1, 0x40);
		delay(300);

		if (this.isSmithQuestDone()) {
			this.status("Smith / Malus done (imbue ready or complete) — skipping");

			return true;
		}

		if (me.charlvl < 8) {
			this.status("Smith deferred until lvl 8 (now " + me.charlvl + ")");

			return true;
		}

		this.status("Quest: Tools of the Trade (Smith)");
		Town.goToTown(1);
		this.teamInGame();
		Town.doChores();
		Town.buyPotions();

		if (!QuestItems.has(QuestItems.malus, "hdm")) {
			Town.move("charsi");
			charsi = getUnit(1, "charsi");

			if (charsi && charsi.openMenu()) {
				me.cancel();
			}

			delay(500);
			sendPacket(1, 0x40);
			delay(300);

			if (this.isSmithQuestDone()) {
				this.status("Smith done — Charsi imbue ready, skipping Barracks");

				return true;
			}
		}

		Pather.teleport = !!(me.getSkill(54, 1));

		if (!getWaypoint(5)) {
			this.status("Pathing to Outer Cloister WP");
			this.ensureBlackMarshWP();
			Pather.useWaypoint(6);
			this.waitForPartyMembers();
			Precast.doPrecast(true);
			this.Bo();
			Pather.moveToExit([7, 26, 27], true, true);
			this.clickWP();
			Pather.getWP(27, true);
		} else {
			Pather.useWaypoint(27);
			this.waitForPartyMembers();
			Precast.doPrecast(true);
			this.Bo();
		}

		this.status("Barracks — kill Smith, take Malus");
		Pather.moveToExit(28, true, true);

		try {
			Pather.moveToPreset(28, 2, 108, 0, 0, true);
		} catch (eForge) {
			this.status("Smith forge preset missing — clearing Barracks");
			Attack.clearLevel(0);
		}

		try {
			Attack.kill(getLocaleString(2889)); // The Smith
		} catch (eSmith) {
			Attack.clear(25);
		}

		Pickit.pickItems();

		forge = getUnit(2, 108);

		if (forge && getDistance(me, forge) > 5) {
			Pather.moveToUnit(forge);
		} else {
			try {
				Pather.moveToPreset(28, 2, 108, 0, 0, false);
			} catch (eBack) {}
		}

		malus = QuestItems.find(QuestItems.malus, "hdm");

		if (!malus) {
			this.pickMalusFromForge();
			malus = QuestItems.find(QuestItems.malus, "hdm");
		}

		if (!malus) {
			this.getQuestItem(QuestItems.malus, 108);
			malus = QuestItems.find(QuestItems.malus, "hdm");
		}

		if (!malus) {
			forge = getUnit(2, 108);
			this.status("Malus not picked — forge=" + (forge ? ("mode=" + forge.mode) : "missing") + " lvl=" + me.charlvl);
		} else {
			this.status("Got Horadric Malus (hdm)");
		}

		// Portal to town for Charsi, then take the same TP back and continue
		var smithArea = me.area;

		if (!me.inTown) {
			if (!Pather.makePortal()) {
				this.status("No TP for Smith turn-in — walking/towning");
			}
		}

		Town.goToTown(1);
		Town.move("charsi");
		charsi = getUnit(1, "charsi");

		if (charsi && charsi.openMenu()) {
			me.cancel();
		}

		delay(500);
		sendPacket(1, 0x40);

		if (me.getQuest(3, 0) || me.getQuest(3, 1) || this.isSmithQuestDone()) {
			this.status("Smith / Malus quest turned in (imbue ready OK)");
		} else if (!malus) {
			this.status("Smith incomplete — need Malus in bag then Charsi");
		} else {
			this.status("Smith done — talk to Charsi if quest still open");
		}

		// Same TP back to Barracks — next objective continues from here
		Town.move("portalspot");

		if (!Pather.usePortal(smithArea, me.name) && !Pather.usePortal(28, me.name) && !Pather.usePortal(null, me.name)) {
			this.status("Could not return via Smith TP — staying in town");

			return true;
		}

		this.status("Back in Barracks via TP — continuing toward Jail / Catacombs");
		Pather.teleport = !!(me.getSkill(54, 1));

		if (Pather.moveToExit(29, true, true) && me.area === 29) {
			this.clickWP();
		} else {
			this.status("Jail exit after Smith failed (area " + me.area + ") — town, next run uses Outer Cloister WP");
			Town.goToTown(1);
		}

		return true;
	};

	this.treehead = function () {
		this.status("Treehead");
		Town.goToTown(1);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			Pather.useWaypoint(5);
			Pather.moveToPreset(me.area, 2, 30, 5, 5);
			if(me.classid === 1 && me.diff === 2) {
				Town.goToTown();
				delay(5000);
				Pather.usePortal(5, null);
			}
			Pather.makePortal();			
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(5, null)){
				delay(1000);
			}
		}
		try{
			Attack.clear(20, 0, getLocaleString(2873)); // Treehead Woodfist
		}catch(e){
			print(e);
			Attack.clear(20);
		}
		Pickit.pickItems();
		if(teleportingSorc) {
			Town.goToTown();
		} else {
			delay(500);
			if(!Pather.usePortal(null, null)){
				Town.goToTown();
			}
		}
		return true;
	};
	
	this.pit = function () {
		this.status("killing Pit");
		Town.goToTown(1);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;					
		if (teleportingSorc) {								
			Pather.useWaypoint(6);
			Precast.doPrecast(true);
			Pather.moveToExit([7, 12], true, false);
			//Pather.teleport = false;	
			Pather.moveToExit(16, true, false);
			Pather.moveTo(7565, 14460, 10, false, false);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(16, null)) { //12-1,16-2
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
		//Attack.clearLevel();
		//pit level 2
		//Pather.moveToExit(16, true, false);
		//Pather.teleport = true;	
		Attack.clearLevel();
		Pickit.pickItems();
		Misc.openChestsInArea();
		if(!Pather.usePortal(null, null)){
			Town.goToTown();
		}		
		return true;
	};

	this.ruinedTemple = function () {
		this.status("ruinedTemple");
		Town.goToTown(3);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if(teleportingSorc){
			if (!Pather.useWaypoint(80, true)) {
				return false;
			}
			Precast.doPrecast(false);
			Pather.moveToExit(94, true);
			Pather.moveToPreset(me.area, 2, 193);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			var j = 0;
			while (!Pather.usePortal(94, null)) {
				delay(250);
				if (j % 20 == 0) {
					this.teamInGame();
				}
				j += 1;
			}
		}
		Attack.clear(30);
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			Town.goToTown();	
		}		
		return true;
	};

	this.hephasto = function () {
		this.status("Hephasto");
		Town.goToTown(4);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			Pather.useWaypoint(107);
			if (!Pather.moveToPreset(me.area, 2, 376)) {
				delay(500);
				Pather.moveToPreset(me.area, 2, 376);
			}
			var x = me.x, y = me.y;
			Pather.moveTo(x + 8, y + 8);
			if(me.classid === 1 && me.diff === 2) {
				Town.goToTown();
				delay(5000);
				Pather.usePortal(107, null);
			}
			Pather.makePortal();			
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(107, null)){
				delay(1000);
			}
		}
		try{
			Attack.clear(20, 0, getLocaleString(1067)); // Hephasto The Armorer
		}catch(e){
			print(e);
			Attack.clear(20);
		}			
		Pickit.pickItems();
		if(teleportingSorc) {
			Town.goToTown();
		} else {
			delay(500);
			if(!Pather.usePortal(null, null)){
				Town.goToTown();
			}
		}
		return true;
	};
	
	
	this.eldritch = function () {
		this.status("Eldritch");
		Town.goToTown(5);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			Pather.useWaypoint(111);
			Pather.moveTo(3740, 5078);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(111, null)){
				delay(1000);
			}
		}
		try {
			Attack.clear(15, 0, getLocaleString(22500)); // Eldritch the Rectifier
		}catch(e){
			print(e);
			Attack.clear(20);
		}	
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			Town.goToTown();	
		}		
		return true;
	};

	this.threshSocket = function () {
		this.status("ThreshSocket");
		Town.goToTown(5);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			Pather.useWaypoint(112);
			Pather.moveToExit(113, false)
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(112, null)){
				delay(1000);
			}
		}
		try{
			Attack.kill(getLocaleString(22498)); // Thresh Socket
		} catch(e) {
			print(e);
			Attack.clear(20);
		}
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			Town.goToTown();
		}
		return true;
	};
	
	this.pindleskin = function (nih) { 
		if (nih === undefined) {
			nih = false;
		}
		this.status("Pindleskin");
		var anya;
		Town.goToTown(5);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			Town.move("anya");
			if (!Pather.getPortal(121) && me.getQuest(37, 1)) {
				anya = getUnit(1, NPC.Anya);
				if (anya) {
					anya.openMenu();
					me.cancel();
				}
			}
			Pather.usePortal(121);
			Precast.doPrecast(true);
			Pather.moveTo(10058, 13234);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(121, null)){
				delay(1000);
			}
		}
		try{
			Attack.clear(15, 0, getLocaleString(22497)); // Pindleskin
		}catch(e){
			print(e);
			Attack.clear(20);
		}	
		Pickit.pickItems();
		if(!nih) {
			if(!Pather.usePortal(null, null)){
				Town.goToTown();
			}		
			return true;
		}
		this.status("Nihlathak");
		if(teleportingSorc) {
			Pather.moveToExit([122, 123, 124], true);
			Pather.moveToPreset(me.area, 2, 462, 10, 10);
			Pather.makePortal();
		} else {
			if(!Pather.usePortal(null, null)){
				Town.goToTown();
			}
			Town.move("portalspot");
			while(!Pather.usePortal(124, null)){
				delay(500);
			}
		}
		try{
			Attack.kill(526); // Nihlathak
		}catch(e){
			print(e);
			Attack.clear(20);
		}	
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			Town.goToTown();	
		}		
		return true;			
	};

	this.worldstone = function () {
		this.status("Worldstone");
		Town.goToTown(5);
		this.teamInGame();
		Town.doChores();
		Pather.teleport = true;
		if (teleportingSorc) {
			Pather.useWaypoint(129);
			Pather.makePortal();
		} else {
			Town.move("portalspot");
			while(!Pather.usePortal(129, null)){
				delay(1000);
			}
		}
		Attack.clearLevel(0);
		Pickit.pickItems();
		if (Pather.moveToExit(130, true)) {
			Attack.clearLevel(0);
		}
		Pickit.pickItems();
		if(!Pather.usePortal(null, null)){
			Town.goToTown();
		}
		return true;
	};
		
//MAIN
	addEventListener("copydata", (id, data) => {
		let { msg, nick } = JSON.parse(data);
// Here is modified by Dark-f 2018-2-21
		if ( iAmReady && Config.AutoSmurf.TeamSize === 1 ) {
			teamIsReady = true;
			this.status("Team is ready! Telling others :)");
			Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "team is ready");
		}
// 2018-2-21
		if (id == 55) {
			switch (msg) {
			case "ready":
				readyCount += 1;
				this.status("readyCount = " + readyCount);				
				if (iAmReady && readyCount === Config.AutoSmurf.TeamSize - 1) {  // Doesn't count my ready because my messages are ignored. Subtract one from TeamSize to account for this.
					if (!teamIsReady) { // Only need to change teamIsReady to true once.
						teamIsReady = true;
						this.status("Team is ready! Telling others :)");
						Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "team is ready");
					}
				}
				break;
			case "team is ready":
				if (!teamIsReady) { // Only need to change teamIsReady to true once.
					teamIsReady = true;
					this.status("Received team is ready!");
				}
				break;
			case "at waypoint":
				atWPCount += 1;
				this.status("atWPCount = " + atWPCount);
				break;
			case "ready to drink":
				readyToDrink += 1;
				this.status("readyToDrink = " + readyToDrink);
				break;
			case "cube":
				cube = true;
				break;
			case "need cube":
				getCube = true;
				break;
			case "staff":
				staff = true;
				break;
			case "amulet":
				amulet = true;
				break;
			case "summoner":
				summoner = true;
				break;
			case "tombs":
				tombs = true;
				break;
			case "radament":
				radament = true;
				break;
			case "kill radament":
				killRadament = true;
				break;
			case "clear orifice":
				clearOrifice = true;
				break;
			case "duriel":
				duriel = true;
				break;
			case "travincal":
				travincal = true;
				break;
			case "team figurine":
				teamFigurine = true;
				break;
			case "figurine":
				figurine = true;
				break;
			case "Lam Essen":
				LamEssen = true;
				break;
			case "mephisto":
				mephisto = true;
				break;
			case "red portal":
				redPortal = true;
				break;
			case "ready to kill diablo":
				readyToKillDiablo += 1;
				this.status("readyToKillDiablo = " + readyToKillDiablo);
				break;
			case "master":
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, nick + " is my master.");
				break;
			case "smurf":
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "Smurf!");
				break;
			case "WaitMe":
				wait = 1;
				break;
			case "hi":
			case "yo!":
			case "hello":
			case "hey":
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "yo");
				break;
			case "I'm here!":
				ok += 1;
				break;
			case "bo":
				boing =1;
				break;
			case "I'm bored -.-":
				goBo =1;
				break;
			case "I'm Boed!":
				boed += 1;
				break;
			case "Ok Bitch":
				if (me.gold < Config.LowGold) {
					pick = 1;
				}
				break;
			case "GimmeGold":
				if (me.gold > Config.LowGold * 2 + 100) {
					Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "Ok Bitch");
					give = 1;
				}
				break;
			case "TP":
			case "Tp":
			case "tp":
			case "portal":
			case "tp plz":
				nickTP = nick;
				this.giveTP(nickTP);
				nickTP = false;
				break;
			case "ReadyForTravincal":
				teamFlail = 1;
				break;
			case "GotScroll":
				teamScroll = 1;
				break;
			case "GotStaff":
				teamStaff = 1;
				break;
			case "GotThePower":
				teamStaff2 = 1;
				break;
			case "GotBrain":
				teamBrain = 1;
				break;
			case (msg.match("Have: ") ? msg : null): // We're comparing if that case's value is equal to our switch term. Thus, if the msg contains "Have: " compare msg to msg (do case), otherwise compare msg to null (don't do case).
				msg = msg.split("Have: ")[1].split(""); // Change msg from a string to an array of 0's and 1's representing waypoint possession.
				msg.unshift(nick); // Add the waypoint owner's name to the front of the array.
				teamWaypoints.push(msg); // Record the Team Member's list of Waypoint possession values. SiC-666 TODO: Should we check to make sure this character's waypoints hasn't been previously recorded?
				break;
			}			
		}
	});
	this.checkRole();
	var tick = getTickCount();
	while (!this.teamInGame(true)) { // Wait for the AutoSmurf Team to join.
		delay(1000);
		if (getTickCount() - tick > 5 * 60 * 1000) { // Leave the game after 5 minutes of waiting.
			this.status("Team wasn't in game within 5 minutes.");
			D2Bot.printToConsole("AutoSmurf: Team didn't join the game within 5 minutes.", 9);
			quit();
		}
	}
	this.start();
	
    //act1
    if (!this.isAct1Done()) { // Andariel / Act1 not finished
		// Only park in Act1 if Andy is still alive — otherwise Warriv → Act2
		if (!this.isAndyKilled()) {
			Town.goToTown(1);
		}

		// Rogue unlocks after Blood Raven
		if (Config.UseMerc && !me.getMerc() && (me.getQuest(2, 0) || me.getQuest(2, 1))) {
			this.hireMerc();
		}

        //den
        if (!me.getQuest(1, 0)) {
            this.den();
        } 
        if (me.diff === 0) { // Normal difficulty.
            // After Den: Cold Plains clear (only if under lvl 6) → Stony Field until stonyLvl (no Cave)
            if (!me.getQuest(2, 0) && me.getQuest(1, 0) && !this.partyLevel(stonyLvl)) {
				if (me.charlvl < 6) {
					this.coldPlains();
				} else {
					this.status("Lvl " + me.charlvl + " >= 6 — skip Cold Plains, straight to Stony Field");
				}
				this.stonyField();
            }
            //cain (before Blood Raven while under bloodLvl)
            if (!me.getQuest(4, 0) && this.partyLevel(stonyLvl) &&
					(!this.partyLevel(bloodLvl) || me.getQuest(2, 0))) {
				this.cain();
            }
            //blood raven — only at bloodLvl+
            if (!me.getQuest(2, 0) && me.getQuest(1, 0) && this.partyLevel(bloodLvl)) {
				this.blood();

				if (Config.UseMerc && !me.getMerc()) {
					this.hireMerc();
				}
            }
            //cain leftover if Blood Raven ran first in a later game
            if (!me.getQuest(4, 0) && this.partyLevel(stonyLvl)) {
				this.cain();
            }
            // After Cain: Countess → Smith → (level) → Andy (no Tristram leveling farm)
            if (me.getQuest(4, 0)) {
				if (!me.getQuest(5, 0)) {
					this.status("Post-Cain: Countess");
					this.countess();
				}

				if (!this.isSmithQuestDone()) {
					this.smith();
				}
			}
        }		
		if (me.diff > 0) { // Nightmare & Hell difficulty.
			if (!me.getQuest(4, 0)) {
				this.cain(); 
            }
		}
		//andy — if already killed, just Warriv → Act 2; else kill when leveled
		if (!this.isAct1Done()) {
			if (this.isAndyKilled()) {
				this.status("Andy already killed — change Act 2");
				Town.goToTown(1);

				if (!this.changeAct(2)) {
					this.status("Act 2 change failed — will retry");
				}
			} else if ((me.diff === 0 && this.isSmithQuestDone() && this.partyLevel(andyLvl)) || (me.diff !== 0)) {
				if (me.diff > 0 && teleportingSorc) {
					this.travel(1);
				}

				this.status("Andariel — ready (lvl " + me.charlvl + ", gate " + andyLvl + ")");
				this.andy();
			} else if (me.diff === 0 && this.isSmithQuestDone() && !this.partyLevel(andyLvl)) {
				this.status("Smith done — leveling for Andy (need lvl " + andyLvl + ", now " + me.charlvl + ")");

				// After Smith TP return we're already in Jail path — don't town→travel reset
				if (me.inTown || me.area < 28 || me.area > 36) {
					this.travel(1);
				}

				this.normalPreAndy();
			}
		}
	}

	//act2
	if (!this.isAct2Done() && this.isAct1Done()) { // Act3 not open yet and Act1 is done.
		if (!Town.goToTown(2) && me.act !== 2) {
			this.status("Act2 WP failed — trying Warriv / changeAct");
			this.changeAct(2);
			Town.goToTown(2);
		}

		// Swap to Defiance before sewers (first Act2 objective)
		if (Config.UseMerc && !Item.hasDefianceMerc()) {
			this.hireMerc(1);
		}

		if (teleportingSorc) { // I am the leader.
			// Sewers / Radament first
			if (!this.isRadamentDone()) {
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "radament");
				this.radament();
			}

			if (me.diff === 0 && !getWaypoint(14)) {
				this.toLostCity();
			}

			if (!this.hasCube()) {
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "cube");
				this.cube();
			} else {
				getCube = false;
			}

			// Order: Radament → cube → Staff of Kings → Viper amulet → then Arcane/Summoner
			if (!this.hasStaffKings() && !this.hasHoradricStaff() && !this.isStaffQuestDone()) {
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "staff");
				this.staff();
			}

			// Tainted Sun / amulet: skip if done. hasViper checks stash (vip is stashed after pick).
			if (!this.hasHoradricStaff() && !me.getQuest(10, 0) &&
					!(me.getQuest(11, 0) || me.getQuest(11, 1))) {
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "amulet");
				this.amulet();
			}

			if (this.hasStaffKings() && this.hasViper() && this.hasCube() && !this.hasHoradricStaff()) {
				if (!this.cubeStaff()) {
					this.status("cubeStaff failed — will retry before Duriel");
				}
			} else if (!this.hasHoradricStaff() && !this.isStaffQuestDone()) {
				// Still missing a piece after staff/amulet passes — force fetch
				this.ensureHoradricStaff();
			}

			// Arcane / Summoner only after Tainted Sun (quest 11) — do not WP-fail into Arcane early
			if (!me.getQuest(13, 0) && (me.getQuest(11, 0) || me.getQuest(11, 1))) {
				this.travel(4);
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "summoner");
				this.summoner();
			}

			if (!this.partyLevel(tombsLvl) && me.diff === 0 && me.charlvl < tombsLvl) {
				this.travel(5); // Travel to all waypoints up to and including Canyon Of The Magi if I don't have them.				
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "tombs");
				this.tombs(); // Clears tombs until tombsLvl (22), then Duriel
			}

			if (!me.getQuest(14, 0) && (me.charlvl >= tombsLvl || this.partyLevel(tombsLvl) || me.diff !== 0)) {
				this.travel(5);
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "duriel");				
				this.A_duriel();
			}
		} else { // Not the leader.
			var j = 0;
			while (!me.getQuest(14, 0)) { // Haven't completed Duriel.
				if (radament) {
					if (!this.isRadamentDone()) {
						this.radament();
					}
					radament = false;
				}
				if (cube) {
					if (!this.hasCube()) {
						this.cube();
					}
					cube = false;
					getCube = false;
				}
				if (staff) {
					if (!this.hasStaffKings() && !this.hasHoradricStaff() && !this.isStaffQuestDone()) {
						this.staff();
					}
					staff = false;
				}
				if (amulet) {
					this.amulet();
					amulet = false;
				}
				if (summoner) {
					this.summoner();
					summoner = false;
				}
				if (tombs) {
					this.tombs();
					tombs = false;
				}
				if (duriel) {
					this.A_duriel();
					duriel = false;
				}
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
	}

	//act3
	if (!me.getQuest(23, 0) && this.isAct2Done()) { // Act4 not open yet; Act2/Duriel done (quest 15 flaky on PD2)
		Town.goToTown(3);
		this.status(this.nextAct3Objective());
		if (teleportingSorc ) { // I am the Teleporting Sorc
			this.travel(6); // Travel to all waypoints up to and including Travincal if I don't have them.
			if (teamFigurine) { // Someone has the Jade Figurine!
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "figurine");				
				this.figurine();
			}
			if (!me.getQuest(17, 0)) { // Haven't completed Lam Esen's Tome.
				this.status("Act 3 — Lam Esen's Tome");
				this.lamEsen();
			}
			if (!QuestItems.has(QuestItems.khalimEye, "qey") && !QuestItems.has(QuestItems.khalimWill, "qf2") && !me.getQuest(18, 0)) {
				this.status("Act 3 — Khalim's Eye");
				this.eye();
			}
			if (!QuestItems.has(QuestItems.khalimHeart, "qhr") && !QuestItems.has(QuestItems.khalimWill, "qf2") && !me.getQuest(18, 0)) {
				this.status("Act 3 — Khalim's Heart");
				this.heart();
			}
			if (!QuestItems.has(QuestItems.khalimBrain, "qbr") && !QuestItems.has(QuestItems.khalimWill, "qf2") && !me.getQuest(18, 0)) {
				this.status("Act 3 — Khalim's Brain");
				this.brain();
			}
			if (QuestItems.has(QuestItems.khalimWill, "qf2") ||
					(QuestItems.has(QuestItems.khalimEye, "qey") && QuestItems.has(QuestItems.khalimHeart, "qhr") && QuestItems.has(QuestItems.khalimBrain, "qbr")) ||
					!me.getQuest(20, 0) || !me.getQuest(21, 0)) {
				this.status("Act 3 — Travincal / Blackened Temple");
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "travincal");
				this.travincal();
			}
			if (teamFigurine) { // Someone has the Jade Figurine!
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "figurine");
				this.figurine();
			}
			if (!me.getQuest(23, 0) && me.getQuest(18, 0) && me.getQuest(21, 0) && me.getQuest(20, 0) ) { //no matter Golden bird ) { // Haven't been "Able to go to Act IV" yet and have completed Khalim's Will (AKA the stairs to Durance of Hate Level 1 are open), The Blackened Temple (AKA everyone can enter a Durance Of Hate Level 3 Town Portal), and Golden Bird.
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "mephisto");				
				this.travel(7); // Travel to Durance Of Hate Level 2 Waypoint if I don't have it.				
				this.mephisto(); // Won't take the portal to Act 4 until the team has met the mephLvl requirement.
			}
		} else {
			var j = 0;			
			while (!me.getQuest(23, 0)) { // Haven't completed "Able to go to Act IV" (AKA haven't gone thru red portal to Act 4)
				if (LamEssen){
					this.lamEsen();
					LamEssen = false;
				}
				if (travincal) {
					this.travincal();
					travincal = false;
				}
				if (figurine) {
					this.figurine();
					figurine = false;
				}
				if (mephisto) {
					this.mephisto();
					mephisto = false;
				}
				delay(250);
				if (j % 20 == 0) { // Check for Team Members every 5 seconds.
					this.teamInGame();
				}
				j += 1;
			}
		}
	}

	//act4
	var runDiablo = 0; // Dark-f: for running baal
	if (me.getQuest(23, 0) && !me.getQuest(28, 0)) { // Have been to Act 4 and Diablo is not done or haven't reached the difficulty specific level requirement.
		Town.goToTown(4);
		if (teleportingSorc) { // I am the Teleporting Sorc
			var checkPartyAct;			
			while (!checkPartyAct) { // Wait for everyone to get back to their Town, then record the lowest Town.
				checkPartyAct = this.partyAct();
				delay(250);
			}
			if (checkPartyAct === 3) { // If the lowest Town is Act 3.
				Messaging.sendToList(Config.AutoSmurf.AllTeamProfiles, "red portal");
				D2Bot.printToConsole("AutoSmurf: Helping straggler complete Act 3.", 5);
				this.mephisto(true);
			}
			this.travel(8);	// Travel to all waypoints up to and including River of Flame if I don't have them.
		}
		if (!me.getQuest(25, 0) || me.getQuest(25, 1)) { // The Fallen Angel is not done or it has been started.
			this.izual();
		}		
		runDiablo = 1; // Dark-f: kill diablo first.		
		this.diablo();
	}

	//act5
	if(me.gametype === 1 && teleportingSorc && me.getQuest(39, 0) && !getWaypoint(38) )
		Pather.getWP(129, false);
	if (me.gametype === 1 && me.getQuest(39, 0) && (me.diff == 1 || me.diff == 2)) { //Dark-f
		//this.travincal();
		//this.mephisto();
		//this.ruinedTemple();
		//this.summoner();
		//this.duriel();
		//this.andy();
		//this.pit();
		//this.countess();
		//this.treehead();
		//this.trist();
		//this.hephasto();
		//this.eldritch();
		//this.pindleskin(false); //true, killing Nihlathak. false or empty, not killing.
		//this.rescueBarbs();
		//this.shenk();
		//this.threshSocket();
		this.baal();
		this.diablo(false); // true: start at Entrance. if empty or false: start at Star.
		//this.worldstone();
	} else if (me.gametype === 1 && me.getQuest(28, 0)){ //Dark-f
		Town.goToTown(5);
		if(!me.getQuest(37,1) && teleportingSorc){
			this.travel(9);
		}		
		if (!me.getQuest(35, 1) && !me.getQuest(35, 0)) {
			this.shenk();
		}
		if ((!me.getQuest(36,0) || me.getQuest(36,1)) && me.diff < 2) {
			this.rescueBarbs();
		}
		if ( !me.getQuest(37, 0) ) { //Dark-f			
			this.anya();
		}		
		if (!me.getQuest(39, 0)) // Rite of Passage is not complete.
			this.ancients();
		if (teleportingSorc && !getWaypoint(38))
			Pather.getWP(129, false);			
		if(runDiablo === 0 && me.diff === 0) { // running diablo
			this.eldritch();
			this.shenk();
			this.pindleskin(false);
			Town.goToTown(4);
			this.diablo(); 
			Town.goToTown(4);
			Town.doChores();
			Town.goToTown(3);
			this.mephisto();
			Town.goToTown(5);
			Town.doChores();
		}
		this.baal(); // Won't kill Baal until the team has met the baalLvl requirement.			
	}
	return true;
}