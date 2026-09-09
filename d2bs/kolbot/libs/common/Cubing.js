/**
*	@filename	Cubing.js
*	@author		kolton
*	@desc		transmute Horadric Cube recipes
*/

var Roll = {
	All: 0,
	Eth: 1,
	NonEth: 2
};

var Recipe = {
	Gem: 0,
	HitPower: {
		Helm: 1,
		Boots: 2,
		Gloves: 3,
		Belt: 4,
		Shield: 5,
		Body: 6,
		Amulet: 7,
		Ring: 8,
		Weapon: 9
	},
	Blood: {
		Helm: 10,
		Boots: 11,
		Gloves: 12,
		Belt: 13,
		Shield: 14,
		Body: 15,
		Amulet: 16,
		Ring: 17,
		Weapon: 18
	},
	Caster: {
		Helm: 19,
		Boots: 20,
		Gloves: 21,
		Belt: 22,
		Shield: 23,
		Body: 24,
		Amulet: 25,
		Ring: 26,
		Weapon: 27
	},
	Safety: {
		Helm: 28,
		Boots: 29,
		Gloves: 30,
		Belt: 31,
		Shield: 32,
		Body: 33,
		Amulet: 34,
		Ring: 35,
		Weapon: 36
	},
	Unique: {
		Weapon: {
			ToExceptional: 37,
			ToElite: 38
		},
		Armor: {
			ToExceptional: 39,
			ToElite: 40
		}
	},
	Rare: {
		Weapon: {
			ToExceptional: 41,
			ToElite: 42
		},
		Armor: {
			ToExceptional: 43,
			ToElite: 44
		}
	},
	Socket: {
		Shield: 45,
		Weapon: 46,
		Armor: 47,
		Helm: 48
	},
	Reroll: {
		Magic: 49,
		Rare: 50,
		HighRare: 51
	},
	Rune: 52,
	Token: 53,
	LowToNorm: {
		Armor: 54,
		Weapon: 55
	}
};

if (typeof QuestItems === "undefined") {
	if (!isIncluded("common/QuestItems.js")) {
		include("common/QuestItems.js");
	}
}

var Cubing = {
	recipes: [],
	gemList: [],

	init: function () {
		if (!Config.Cubing) {
			return;
		}

		//print("We have " + Config.Recipes.length + " cubing recipe(s).");

		var i;

		for (i = 0; i < Config.Recipes.length; i += 1) {
			if (Config.Recipes[i].length > 1 && isNaN(Config.Recipes[i][1])) {
				if (NTIPAliasClassID.hasOwnProperty(Config.Recipes[i][1].replace(/\s+/g, "").toLowerCase())) {
					Config.Recipes[i][1] = NTIPAliasClassID[Config.Recipes[i][1].replace(/\s+/g, "").toLowerCase()];
				} else {
					Misc.errorReport("ÿc1Invalid cubing entry:ÿc0 " + Config.Recipes[i][1]);
					Config.Recipes.splice(i, 1);

					i -= 1;
				}
			}
		}

		this.buildRecipes();
		this.buildGemList();
		this.buildLists();
	},

	buildGemList: function () {
		var i, j,
			gemList = [578, 583, 588, 593, 598, 603, 618]; // PD2 perfect gems

		for (i = 0; i < this.recipes.length; i += 1) {
			if ([0, 49].indexOf(this.recipes[i].Index) === -1) { // Skip gems and other magic rerolling recipes
				for (j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
					if (gemList.indexOf(this.recipes[i].Ingredients[j]) > -1) {
						gemList.splice(gemList.indexOf(this.recipes[i].Ingredients[j]), 1);
					}
				}
			}
		}

		this.gemList = gemList.slice(0);

		return true;
	},

	getCube: function () {
		// Don't activate from townchicken
		if (getScript(true).name === "tools\\townchicken.js") {
			return false;
		}

		var i, cube, chest;

		Pather.useWaypoint(57, true);
		Precast.doPrecast(true);

		if (Pather.moveToExit(60, true) && Pather.moveToPreset(me.area, 2, 354)) {
			chest = getUnit(2, 354);

			if (chest) {
				Misc.openChest(chest);

				for (i = 0; i < 5; i += 1) {
					cube = getUnit(4, "box") || getUnit(4, QuestItems.cube);

					if (cube) {
						Pickit.pickItem(cube);

						break;
					}

					delay(200);
				}
			}
		}

		Town.goToTown();

		cube = (typeof QuestItems !== "undefined" && QuestItems.getCube) ? QuestItems.getCube() : (me.getItem("box") || me.getItem(QuestItems.cube));

		if (cube) {
			return Storage.Stash.MoveTo(cube);
		}

		return false;
	},

	buildRecipes: function () {
		var i;

		this.recipes = [];

		for (i = 0; i < Config.Recipes.length; i += 1) {
			if (typeof Config.Recipes[i] !== "object" || (Config.Recipes[i].length > 2 && typeof Config.Recipes[i][2] !== "number") || Config.Recipes[i].length < 1) {
				throw new Error("Cubing.buildRecipes: Invalid recipe format.");
			}

			switch (Config.Recipes[i][0]) {
			case Recipe.Gem:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Gem, AlwaysEnabled: true});

				break;
			case Recipe.HitPower.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 633, 661, 588], Level: 84, Index: Recipe.HitPower.Helm});

				break;
			case Recipe.HitPower.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 661, 588], Level: 71, Index: Recipe.HitPower.Boots});

				break;
			case Recipe.HitPower.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 636, 661, 588], Level: 79, Index: Recipe.HitPower.Gloves});

				break;
			case Recipe.HitPower.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 661, 588], Level: 71, Index: Recipe.HitPower.Belt});

				break;
			case Recipe.HitPower.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 632, 661, 588], Level: 82, Index: Recipe.HitPower.Shield});

				break;
			case Recipe.HitPower.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 631, 661, 588], Level: 85, Index: Recipe.HitPower.Body});

				break;
			case Recipe.HitPower.Amulet:
				this.recipes.push({Ingredients: [537, 637, 661, 588], Level: 90, Index: Recipe.HitPower.Amulet});

				break;
			case Recipe.HitPower.Ring:
				this.recipes.push({Ingredients: [539, 638, 661, 588], Level: 77, Index: Recipe.HitPower.Ring});

				break;
			case Recipe.HitPower.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 630, 661, 588], Level: 85, Index: Recipe.HitPower.Weapon});

				break;
			case Recipe.Blood.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 661, 598], Level: 84, Index: Recipe.Blood.Helm});

				break;
			case Recipe.Blood.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 632, 661, 598], Level: 71, Index: Recipe.Blood.Boots});

				break;
			case Recipe.Blood.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 631, 661, 598], Level: 79, Index: Recipe.Blood.Gloves});

				break;
			case Recipe.Blood.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 661, 598], Level: 71, Index: Recipe.Blood.Belt});

				break;
			case Recipe.Blood.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 633, 661, 598], Level: 82, Index: Recipe.Blood.Shield});

				break;
			case Recipe.Blood.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 637, 661, 598], Level: 85, Index: Recipe.Blood.Body});

				break;
			case Recipe.Blood.Amulet:
				this.recipes.push({Ingredients: [537, 638, 661, 598], Level: 90, Index: Recipe.Blood.Amulet});

				break;
			case Recipe.Blood.Ring:
				this.recipes.push({Ingredients: [539, 639, 661, 598], Level: 77, Index: Recipe.Blood.Ring});

				break;
			case Recipe.Blood.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 636, 661, 598], Level: 85, Index: Recipe.Blood.Weapon});

				break;
			case Recipe.Caster.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 631, 661, 578], Level: 84, Index: Recipe.Caster.Helm});

				break;
			case Recipe.Caster.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 637, 661, 578], Level: 71, Index: Recipe.Caster.Boots});

				break;
			case Recipe.Caster.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 636, 661, 578], Level: 79, Index: Recipe.Caster.Gloves});

				break;
			case Recipe.Caster.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 633, 661, 578], Level: 71, Index: Recipe.Caster.Belt});

				break;
			case Recipe.Caster.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 632, 661, 578], Level: 82, Index: Recipe.Caster.Shield});

				break;
			case Recipe.Caster.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 661, 578], Level: 85, Index: Recipe.Caster.Body});

				break;
			case Recipe.Caster.Amulet:
				this.recipes.push({Ingredients: [537, 635, 661, 578], Level: 90, Index: Recipe.Caster.Amulet});

				break;
			case Recipe.Caster.Ring:
				this.recipes.push({Ingredients: [539, 638, 661, 578], Level: 77, Index: Recipe.Caster.Ring});

				break;
			case Recipe.Caster.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 630, 661, 578], Level: 85, Index: Recipe.Caster.Weapon});

				break;
			case Recipe.Safety.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 633, 661, 593], Level: 84, Index: Recipe.Safety.Helm});

				break;
			case Recipe.Safety.Boots:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 636, 661, 593], Level: 71, Index: Recipe.Safety.Boots});

				break;
			case Recipe.Safety.Gloves:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 661, 593], Level: 79, Index: Recipe.Safety.Gloves});

				break;
			case Recipe.Safety.Belt:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 661, 593], Level: 71, Index: Recipe.Safety.Belt});

				break;
			case Recipe.Safety.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 631, 661, 593], Level: 82, Index: Recipe.Safety.Shield});

				break;
			case Recipe.Safety.Body:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 632, 661, 593], Level: 85, Index: Recipe.Safety.Body});

				break;
			case Recipe.Safety.Amulet:
				this.recipes.push({Ingredients: [537, 637, 661, 593], Level: 90, Index: Recipe.Safety.Amulet});

				break;
			case Recipe.Safety.Ring:
				this.recipes.push({Ingredients: [539, 638, 661, 593], Level: 77, Index: Recipe.Safety.Ring});

				break;
			case Recipe.Safety.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 639, 661, 593], Level: 85, Index: Recipe.Safety.Weapon});

				break;
			case Recipe.Unique.Weapon.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 639, 593], Index: Recipe.Unique.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Unique.Weapon.ToElite: // Ladder only
				if (me.ladder) {
					this.recipes.push({Ingredients: [Config.Recipes[i][1], 644, 648, 593], Index: Recipe.Unique.Weapon.ToElite, Ethereal: Config.Recipes[i][2]});
				}

				break;
			case Recipe.Unique.Armor.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 640, 603], Index: Recipe.Unique.Armor.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Unique.Armor.ToElite: // Ladder only
				if (me.ladder) {
					this.recipes.push({Ingredients: [Config.Recipes[i][1], 647, 645, 603], Index: Recipe.Unique.Armor.ToElite, Ethereal: Config.Recipes[i][2]});
				}

				break;
			case Recipe.Rare.Weapon.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 636, 638, 588], Index: Recipe.Rare.Weapon.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Rare.Weapon.ToElite:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 646, 649, 588], Index: Recipe.Rare.Weapon.ToElite, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Rare.Armor.ToExceptional:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 637, 578], Index: Recipe.Rare.Armor.ToExceptional, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Rare.Armor.ToElite:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 645, 648, 578], Index: Recipe.Rare.Armor.ToElite, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Shield:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 638, 598], Index: Recipe.Socket.Shield, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 638, 578], Index: Recipe.Socket.Weapon, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Armor:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 634, 637, 583], Index: Recipe.Socket.Armor, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Socket.Helm:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 635, 637, 588], Index: Recipe.Socket.Helm, Ethereal: Config.Recipes[i][2]});

				break;
			case Recipe.Reroll.Magic: // Hacky solution ftw
				this.recipes.push({Ingredients: [Config.Recipes[i][1], "pgem", "pgem", "pgem"], Level: 91, Index: Recipe.Reroll.Magic});

				break;
			case Recipe.Reroll.Rare:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 618, 618, 618, 618, 618], Index: Recipe.Reroll.Rare});

				break;
			case Recipe.Reroll.HighRare:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 618, 539], Index: Recipe.Reroll.HighRare, Enabled: false});

				break;
			case Recipe.LowToNorm.Weapon:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 629, "cgem"], Index: Recipe.LowToNorm.Weapon});

				break;
			case Recipe.LowToNorm.Armor:
				this.recipes.push({Ingredients: [Config.Recipes[i][1], 628, "cgem"], Index: Recipe.LowToNorm.Armor});

				break;
			case Recipe.Rune:
				switch (Config.Recipes[i][1]) {
				case 628: // el
				case 629: // eld
				case 630: // tir
				case 631: // nef
				case 632: // eth
				case 633: // ith
				case 634: // tal
				case 635: // ral
				case 636: // ort
					this.recipes.push({Ingredients: [Config.Recipes[i][1], Config.Recipes[i][1], Config.Recipes[i][1]], Index: Recipe.Rune, AlwaysEnabled: true});

					break;
				case 637: // thul->amn
					this.recipes.push({Ingredients: [637, 637, 637, 579], Index: Recipe.Rune});

					break;
				case 638: // amn->sol
					this.recipes.push({Ingredients: [638, 638, 638, 574], Index: Recipe.Rune});

					break;
				case 639: // sol->shael
					this.recipes.push({Ingredients: [639, 639, 639, 584], Index: Recipe.Rune});

					break;
				case 640: // shael->dol
					this.recipes.push({Ingredients: [640, 640, 640, 594], Index: Recipe.Rune});

					break;
				case 641: // dol->hel
					if (me.ladder) {
						this.recipes.push({Ingredients: [641, 641, 641, 589], Index: Recipe.Rune});
					}

					break;
				case 642: // hel->io
					if (me.ladder) {
						this.recipes.push({Ingredients: [642, 642, 642, 599], Index: Recipe.Rune});
					}

					break;
				case 643: // io->lum
					if (me.ladder) {
						this.recipes.push({Ingredients: [643, 643, 643, 580], Index: Recipe.Rune});
					}

					break;
				case 644: // lum->ko
					if (me.ladder) {
						this.recipes.push({Ingredients: [644, 644, 644, 575], Index: Recipe.Rune});
					}

					break;
				case 645: // ko->fal
					if (me.ladder) {
						this.recipes.push({Ingredients: [645, 645, 645, 585], Index: Recipe.Rune});
					}

					break;
				case 646: // fal->lem
					if (me.ladder) {
						this.recipes.push({Ingredients: [646, 646, 646, 595], Index: Recipe.Rune});
					}

					break;
				case 647: // lem->pul
					if (me.ladder) {
						this.recipes.push({Ingredients: [647, 647, 647, 590], Index: Recipe.Rune});
					}

					break;
				case 648: // pul->um
					if (me.ladder) {
						this.recipes.push({Ingredients: [648, 648, 600], Index: Recipe.Rune});
					}

					break;
				case 649: // um->mal
					if (me.ladder) {
						this.recipes.push({Ingredients: [649, 649, 581], Index: Recipe.Rune});
					}

					break;
				case 650: // mal->ist
					if (me.ladder) {
						this.recipes.push({Ingredients: [650, 650, 576], Index: Recipe.Rune});
					}

					break;
				case 651: // ist->gul
					if (me.ladder) {
						this.recipes.push({Ingredients: [651, 651, 586], Index: Recipe.Rune});
					}

					break;
				case 652: // gul->vex
					if (me.ladder) {
						this.recipes.push({Ingredients: [652, 652, 596], Index: Recipe.Rune});
					}

					break;
				case 653: // vex->ohm
					if (me.ladder) {
						this.recipes.push({Ingredients: [653, 653, 591], Index: Recipe.Rune});
					}

					break;
				case 654: // ohm->lo
					if (me.ladder) {
						this.recipes.push({Ingredients: [654, 654, 601], Index: Recipe.Rune});
					}

					break;
				case 655: // lo->sur
					if (me.ladder) {
						this.recipes.push({Ingredients: [655, 655, 582], Index: Recipe.Rune});
					}

					break;
				case 656: // sur->ber
					if (me.ladder) {
						this.recipes.push({Ingredients: [656, 656, 577], Index: Recipe.Rune});
					}

					break;
				case 657: // ber->jah
					if (me.ladder) {
						this.recipes.push({Ingredients: [657, 657, 587], Index: Recipe.Rune});
					}

					break;
				case 658: // jah->cham
					if (me.ladder) {
						this.recipes.push({Ingredients: [658, 658, 597], Index: Recipe.Rune});
					}

					break;
				case 659: // cham->zod
					if (me.ladder) {
						this.recipes.push({Ingredients: [659, 659, 592], Index: Recipe.Rune});
					}

					break;
				}

				break;
			case Recipe.Token:
				this.recipes.push({Ingredients: [654, 655, 656, 657], Index: Recipe.Token, AlwaysEnabled: true});

				break;
			}
		}
	},

	validIngredients: [], // What we have
	neededIngredients: [], // What we need
	subRecipes: [],

	buildLists: function () {
		var i, j, k, items;

		CraftingSystem.checkSubrecipes();

		this.validIngredients = [];
		this.neededIngredients = [];
		items = me.findItems(-1, 0);

		for (i = 0; i < this.recipes.length; i += 1) {
			// Set default Enabled property - true if recipe is always enabled, false otherwise
			this.recipes[i].Enabled = this.recipes[i].hasOwnProperty("AlwaysEnabled");

IngredientLoop:
			for (j = 0; j < this.recipes[i].Ingredients.length; j += 1) {
				for (k = 0; k < items.length; k += 1) {
					if (((this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(items[k].classid) > -1) ||
						(this.recipes[i].Ingredients[j] === "cgem" && [574, 579, 584, 589, 594, 599, 614].indexOf(items[k].classid) > -1) ||
						items[k].classid === this.recipes[i].Ingredients[j]) && this.validItem(items[k], this.recipes[i])) {

						// push the item's info into the valid ingredients array. this will be used to find items when checking recipes
						this.validIngredients.push({classid: items[k].classid, gid: items[k].gid});

						// Remove from item list to prevent counting the same item more than once
						items.splice(k, 1);

						k -= 1;

						// Enable recipes for gem/jewel pickup
						if (this.recipes[i].Index !== Recipe.Rune || (this.recipes[i].Index === Recipe.Rune && j >= 1)) { // Enable rune recipe after 2 bases are found
							this.recipes[i].Enabled = true;
						}

						continue IngredientLoop;
					}
				}

				// add the item to needed list - enable pickup
				this.neededIngredients.push({classid: this.recipes[i].Ingredients[j], recipe: this.recipes[i]});

				// skip flawless gems adding if we don't have the main item (Recipe.Gem and Recipe.Rune for el-ort are always enabled)
				if (!this.recipes[i].Enabled) {
					break;
				}

				// if the recipe is enabled (we have the main item), add flawless gem recipes (if needed)

				// Make perf amethyst
				if (this.subRecipes.indexOf(578) === -1 && (this.recipes[i].Ingredients[j] === 578 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(578) > -1))) {
					this.recipes.push({Ingredients: [577, 577, 577], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(578);
				}

				// Make perf topaz
				if (this.subRecipes.indexOf(583) === -1 && (this.recipes[i].Ingredients[j] === 583 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(583) > -1))) {
					this.recipes.push({Ingredients: [582, 582, 582], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(583);
				}

				// Make perf sapphire
				if (this.subRecipes.indexOf(588) === -1 && (this.recipes[i].Ingredients[j] === 588 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(588) > -1))) {
					this.recipes.push({Ingredients: [587, 587, 587], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(588);
				}

				// Make perf emerald
				if (this.subRecipes.indexOf(593) === -1 && (this.recipes[i].Ingredients[j] === 593 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(593) > -1))) {
					this.recipes.push({Ingredients: [592, 592, 592], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(593);
				}

				// Make perf ruby
				if (this.subRecipes.indexOf(598) === -1 && (this.recipes[i].Ingredients[j] === 598 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(598) > -1))) {
					this.recipes.push({Ingredients: [597, 597, 597], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(598);
				}

				// Make perf diamond
				if (this.subRecipes.indexOf(603) === -1 && (this.recipes[i].Ingredients[j] === 603 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(603) > -1))) {
					this.recipes.push({Ingredients: [602, 602, 602], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(603);
				}

				// Make perf skull
				if (this.subRecipes.indexOf(618) === -1 && (this.recipes[i].Ingredients[j] === 618 || (this.recipes[i].Ingredients[j] === "pgem" && this.gemList.indexOf(618) > -1))) {
					this.recipes.push({Ingredients: [617, 617, 617], Index: Recipe.Gem, AlwaysEnabled: true, MainRecipe: this.recipes[i].Index});
					this.subRecipes.push(618);
				}
			}
		}
	},

	// Remove unneeded flawless gem recipes
	clearSubRecipes: function () {
		var i;

		this.subRecipes = [];

		for (i = 0; i < this.recipes.length; i += 1) {
			if (this.recipes[i].hasOwnProperty("MainRecipe")) {
				this.recipes.splice(i, 1);

				i -= 1;
			}
		}
	},

	update: function () {
		this.clearSubRecipes();
		this.buildLists();
	},

	checkRecipe: function (recipe) {
		var i, j, item,
			usedGids = [],
			matchList = [];

		for (i = 0; i < recipe.Ingredients.length; i += 1) {
			for (j = 0; j < this.validIngredients.length; j += 1) {
				if (usedGids.indexOf(this.validIngredients[j].gid) === -1 && (
						this.validIngredients[j].classid === recipe.Ingredients[i] ||
						(recipe.Ingredients[i] === "pgem" && this.gemList.indexOf(this.validIngredients[j].classid) > -1) ||
						(recipe.Ingredients[i] === "cgem" && [574, 579, 584, 589, 594, 599, 614].indexOf(this.validIngredients[j].classid) > -1)
					)) {
					item = me.getItem(this.validIngredients[j].classid, -1, this.validIngredients[j].gid);

					if (item && this.validItem(item, recipe)) { // 26.11.2012. check if the item actually belongs to the given recipe
						// don't repeat the same item
						usedGids.push(this.validIngredients[j].gid);
						// push the item into the match list
						matchList.push(copyUnit(item));

						break;
					}
				}
			}

			// no new items in the match list = not enough ingredients
			if (matchList.length !== i + 1) {
				return false;
			}
		}

		// return the match list. these items go to cube
		return matchList;
	},

	// debug function - get what each recipe needs
	getRecipeNeeds: function (index) {
		var i,
			rval = " [";

		for (i = 0; i < this.neededIngredients.length; i += 1) {
			if (this.neededIngredients[i].recipe.Index === index) {
				rval += this.neededIngredients[i].classid + (i === this.neededIngredients.length - 1 ? "" : " ");
			}
		}

		rval += "]";

		return rval;
	},

	checkItem: function (unit) { // Check an item on ground for pickup
		if (!Config.Cubing) {
			return false;
		}

		if (this.keepItem(unit)) {
			return true;
		}

		var i;

		for (i = 0; i < this.neededIngredients.length; i += 1) {
			if (unit.classid === this.neededIngredients[i].classid && this.validItem(unit, this.neededIngredients[i].recipe)) {
				//debugLog("Cubing: " + unit.name + " " + this.neededIngredients[i].recipe.Index + " " + (this.neededIngredients[i].recipe.hasOwnProperty("MainRecipe") ? this.neededIngredients[i].recipe.MainRecipe : "") + this.getRecipeNeeds(this.neededIngredients[i].recipe.Index));

				return true;
			}
		}

		return false;
	},

	keepItem: function (unit) { // Don't drop an item from inventory if it's a part of cubing recipe
		if (!Config.Cubing) {
			return false;
		}

		var i;

		for (i = 0; i < this.validIngredients.length; i += 1) {
			if (unit.mode === 0 && unit.gid === this.validIngredients[i].gid) {
				return true;
			}
		}

		return false;
	},

	validItem: function (unit, recipe) {
		// Don't use items in locked inventory space
		if (unit.mode === 0 && unit.location === 3 && Storage.Inventory.IsLocked(unit, Config.Inventory)) {
			return false;
		}

		// Excluded items
		if (Runewords.validGids.indexOf(unit.gid) > -1 || CraftingSystem.validGids.indexOf(unit.gid) > -1) {
			return false;
		}

		// Gems and runes
		if ((unit.itemType >= 96 && unit.itemType <= 102) || unit.itemType === 74) {
			if (!recipe.Enabled && recipe.Ingredients[0] !== unit.classid && recipe.Ingredients[1] !== unit.classid) {
				return false;
			}

			return true;
		}

		if (recipe.Index >= Recipe.HitPower.Helm && recipe.Index <= Recipe.Safety.Weapon) {
			// Junk jewels (NOT matching a pickit entry) — LoD type 58, NTIP/PD2 often 59
			if (unit.itemType === 58 || unit.itemType === 59 || (unit.code && String(unit.code).toLowerCase() === "jew")) {
				if (recipe.Enabled && NTIP.CheckItem(unit) === 0) {
					return true;
				}
			// Main item, NOT matching a pickit entry
			} else if (unit.quality === 4 && Math.floor(me.charlvl / 2) + Math.floor(unit.ilvl / 2) >= recipe.Level && NTIP.CheckItem(unit) === 0) {
				return true;
			}

			return false;
		}

		if (recipe.Index >= Recipe.Unique.Weapon.ToExceptional && recipe.Index <= Recipe.Unique.Armor.ToElite) {
			// Unique item matching pickit entry
			if (unit.quality === 7 && NTIP.CheckItem(unit) === 1) {
				switch (recipe.Ethereal) {
				case 0:
				case undefined:
					return NTIP.CheckItem(unit) === 1;
				case 1:
					return unit.getFlag(0x400000) && NTIP.CheckItem(unit) === 1;
				case 2:
					return !unit.getFlag(0x400000) && NTIP.CheckItem(unit) === 1;
				}
			}

			return false;
		}

		if (recipe.Index >= Recipe.Rare.Weapon.ToExceptional && recipe.Index <= Recipe.Rare.Armor.ToElite) {
			// Rare item matching pickit entry
			if (unit.quality === 6 && NTIP.CheckItem(unit) === 1) {
				switch (recipe.Ethereal) {
				case 0:
				case undefined:
					return NTIP.CheckItem(unit) === 1;
				case 1:
					return unit.getFlag(0x400000) && NTIP.CheckItem(unit) === 1;
				case 2:
					return !unit.getFlag(0x400000) && NTIP.CheckItem(unit) === 1;
				}
			}

			return false;
		}

		if (recipe.Index >= Recipe.Socket.Shield && recipe.Index <= Recipe.Socket.Helm) {
			// Normal item matching pickit entry, no sorcets
			if (unit.quality === 2 && unit.getStat(194) === 0) {
				switch (recipe.Ethereal) {
				case 0:
				case undefined:
					return NTIP.CheckItem(unit) === 1;
				case 1:
					return unit.getFlag(0x400000) && NTIP.CheckItem(unit) === 1;
				case 2:
					return !unit.getFlag(0x400000) && NTIP.CheckItem(unit) === 1;
				}
			}

			return false;
		}

		if (recipe.Index === Recipe.Reroll.Magic) {
			if (unit.quality === 4 && unit.ilvl >= recipe.Level && NTIP.CheckItem(unit) === 0) {
				return true;
			}

			return false;
		}

		if (recipe.Index === Recipe.Reroll.Rare) {
			if (unit.quality === 6 && NTIP.CheckItem(unit) === 0) {
				return true;
			}

			return false;
		}

		if (recipe.Index === Recipe.Reroll.HighRare) {
			if (recipe.Ingredients[0] === unit.classid && unit.quality === 6 && NTIP.CheckItem(unit) === 0) {
				recipe.Enabled = true;

				return true;
			}

			if (recipe.Enabled && recipe.Ingredients[2] === unit.classid && unit.itemType === 10 && unit.getStat(77) && !Storage.Inventory.IsLocked(unit, Config.Inventory)) {
				return true;
			}

			return false;
		}

		if (recipe.Index === Recipe.LowToNorm.Armor || recipe.Index === Recipe.LowToNorm.Weapon) {
			if (unit.quality === 1 && NTIP.CheckItem(unit) === 0) {
				return true;
			}

			return false;
		}

		if (recipe.Index === Recipe.Token) {
			return true;
		}

		return false;
	},

	doCubing: function (keepOpen) {
		if (!Config.Cubing) {
			return false;
		}

		if (!(me.getItem("box") || me.getItem(QuestItems.cube)) && !this.getCube()) {
			return false;
		}

		var i, j, items, string, result, tempArray;

		this.update();
		// Randomize the recipe array to prevent recipe blocking (multiple caster items etc.)
		tempArray = this.recipes.slice().shuffle();

		for (i = 0; i < tempArray.length; i += 1) {
			string = "Transmuting: ";
			items = this.checkRecipe(tempArray[i]);

			if (items) {
				// If cube isn't open, attempt to open stash (the function returns true if stash is already open)
				if ((!getUIFlag(0x1a) && !Town.openStash()) || !this.emptyCube()) {
					return false;
				}

				this.cursorCheck();

				i = -1;

				while (items.length) {
					string += (items[0].name.trim() + (items.length > 1 ? " + " : ""));
					Storage.Cube.MoveTo(items[0]);
					items.shift();
				}

				if (!this.openCube()) {
					return false;
				}

				transmute();
				delay(700 + me.ping);
				print("ÿc4Cubing: " + string);
				if (Config.ShowCubingInfo) {
					D2Bot.printToConsole(string, 5);
				}

				this.update();

				items = me.findItems(-1, -1, 6);

				if (items) {
					for (j = 0; j < items.length; j += 1) {
						result = Pickit.checkItem(items[j]);

						switch (result.result) {
						case 0:
							Misc.itemLogger("Dropped", items[j], "doCubing");
							items[j].drop();

							break;
						case 1:
							Misc.itemLogger("Cubing Kept", items[j]);
							if (Config.ShowCubingInfo) {
								Misc.logItem("Cubing Kept", items[j], result.line);
							}

							break;
						case 5: // Crafting System
							CraftingSystem.update(items[j]);

							break;
						}
					}
				}

				if (!this.emptyCube()) {
					break;
				}
			}
		}

		// keepOpen: leave stash/cube for chores junk-jewels / stack pass
		if (!keepOpen && (getUIFlag(0x1A) || getUIFlag(0x19))) {
			delay(1000);

			while (getUIFlag(0x1A) || getUIFlag(0x19)) {
				me.cancel();
				delay(300);
			}
		}

		return true;
	},

	cursorCheck: function () {
		var item;

		if (me.itemoncursor) {
			item = getUnit(100);

			if (item) {
				if (Storage.Inventory.CanFit(item) && Storage.Inventory.MoveTo(item)) {
					return true;
				}

				if (Storage.Stash.CanFit(item) && Storage.Stash.MoveTo(item)) {
					return true;
				}

				Misc.itemLogger("Dropped", item, "cursorCheck");

				if (item.drop()) {
					return true;
				}
			}

			return false;
		}

		return true;
	},

	openCube: function () {
		var i, tick,
			cube = (typeof QuestItems !== "undefined" && QuestItems.getCube) ? QuestItems.getCube() : (me.getItem("box") || me.getItem(QuestItems.cube));

		if (!cube) {
			return false;
		}

		if (getUIFlag(0x1a)) {
			return true;
		}

		if (cube.location === 7 && !Town.openStash()) {
			return false;
		}

		for (i = 0; i < 3; i += 1) {
			cube.interact();
			tick = getTickCount();

			while (getTickCount() - tick < 5000) {
				if (getUIFlag(0x1a)) {
					delay(100 + me.ping * 2); // allow UI to initialize

					return true;
				}

				delay(100);
			}
		}

		return false;
	},

	closeCube: function () {
		var i, tick;

		if (!getUIFlag(0x1a)) {
			return true;
		}

		for (i = 0; i < 5; i++) {
			me.cancel();
			tick = getTickCount();

			while (getTickCount() - tick < 3000) {
				if (!getUIFlag(0x1a)) {
					delay(250 + me.ping * 2); // allow UI to initialize
					return true;
				}

				delay(100);
			}
		}

		return false;
	},

	emptyCube: function () {
		var cube = (typeof QuestItems !== "undefined" && QuestItems.getCube) ? QuestItems.getCube() : (me.getItem("box") || me.getItem(QuestItems.cube)),
			items, code, pass, name, left;

		if (!cube) {
			return false;
		}

		// PD2/D2BS: cube contents often invisible to findItems until the cube UI is open
		if (!getUIFlag(0x1a)) {
			if (!this.openCube()) {
				return false;
			}
		}

		for (pass = 0; pass < 8; pass += 1) {
			items = me.findItems(-1, -1, 6);

			if (!items || !items.length) {
				return true;
			}

			while (items.length) {
				code = items[0].code ? String(items[0].code).toLowerCase() : "";
				name = items[0].name ? String(items[0].name).replace(/ÿc[0-9a-z]/gi, "").toLowerCase() : "";

				// Quest cube results (hst / flail / etc.) → inventory first so placeStaff can cursor them
				if (code === "hst" || code === "qf2" || code === "qf1" ||
						items[0].classid === QuestItems.horadricStaff ||
						items[0].classid === QuestItems.khalimWill ||
						items[0].classid === QuestItems.khalimFlail) {
					if (!Storage.Inventory.MoveTo(items[0]) && !Storage.Stash.MoveTo(items[0])) {
						print("ÿc1Cubingÿc0 :: emptyCube can't move quest result " + (name || code || items[0].classid));
						return false;
					}
				} else if (!Storage.Stash.MoveTo(items[0]) && !Storage.Inventory.MoveTo(items[0])) {
					print("ÿc1Cubingÿc0 :: emptyCube can't move " + (name || code || items[0].classid) +
						" (stash/inv full?)");
					return false;
				}

				delay(30 + me.ping);
				items = me.findItems(-1, -1, 6);

				if (!items) {
					items = [];
				}
			}
		}

		left = me.findItems(-1, -1, 6);

		if (left && left.length) {
			print("ÿc1Cubingÿc0 :: emptyCube still has " + left.length + " item(s) — abort");
			return false;
		}

		return true;
	},

	// True when location 6 has no units (opens cube UI first so PD2 stacks are visible)
	isCubeEmpty: function () {
		var items;

		if (!getUIFlag(0x1a) && !this.openCube()) {
			return false;
		}

		items = me.findItems(-1, -1, 6);

		return !items || !items.length;
	},

	// Open + empty + verify. Returns false if anything (e.g. jewf) remains.
	ensureCubeEmpty: function () {
		if (!this.openCube()) {
			return false;
		}

		if (!this.emptyCube()) {
			return false;
		}

		return this.isCubeEmpty();
	}
};