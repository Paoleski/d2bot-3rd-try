# AutoSmurf
Here a script which try to level and rush your characters, starting from nothing.
It should works with any class, assuming you've got at least one sorc in the team to teleport (teleportsorc) and one barb to bo (boer).
It's made to be use *with* AutoBuild

1. Copy and rename the Dark-A, Dark-B, Dark-C and Dark-D into your char names in /config/ directory.
 e.g. if your bot char is a sor and char name is ABC, you must copy /config/Sorceress.Dark-A.js into Sorceress.ABC.js, 
 and other chars are same as the sor char. If your bot team includes more than one sor, except from renaming the file name 
 you must set Config.PublicMode = 2.
 
2. You must build your bot according to your building-template.
e.g. if your bot char is a blizzard sor, you can set Config.AutoBuild.Template = "Blizzard", at the end in char-config file, 
because the Blizzard sor building file is in the config/builds directory.
And Other building files are prepeared which are Meteror-sor, ChainLightening-sor, BlessHammer-pal and Bo-barbarian.
Of course, if you don't like the building-file you can make building-file yourself.

3. The pickit file may be not suitable for you so that you can change it according to your mind. 
But I hope you keep the sell.nip and white1.nip which can help your bot to earn more money and build some runewords

4. When your bot team completed Rite of Passage in Nightmare and Hell, the AutoSmurf was transfered into MF mode. But killing baal
was restricted by charLvls which  are baalLvlnm and mfLvlHell.
From line 4984 to line 4999, they are as following:
		this.mephisto();
		//this.ruinedTemple();
		//this.travincal();
		//this.summoner();
		//this.duriel();
		this.andy();
		//this.pit();
		this.countess();
		//this.trist();
		this.eldritch();
		this.pindleskin(false); //true, killing Nihlathak. false or empty, not killing.
		//this.rescueBarbs();
		this.shenk();
		//this.threshSocket();
		this.baal();
		this.diablo(false); // true: start at Entrance. if empty or false: start at Star.
		//this.worldstone();
when you see above lines, I make sure you understand their means and know how to choose them for your team MF.

Happy Smurfing!*