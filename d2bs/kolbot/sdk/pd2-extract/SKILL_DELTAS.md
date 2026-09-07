# PD2 skill deltas (from pd2data.mpq Skills.txt)

Source MPQ: `C:\Games\Diablo II\ProjectD2-Realm\pd2data.mpq`
Extract: `sdk/pd2-extract/data/global/excel/Skills.txt`
Human list: `sdk/skills.txt`

Verified against live MPQ (not Borega alone). Borega mismatches noted below.

## Renames (same id, different name vs classic LoD)

- 17: Slow Missiles -> **Slow Movement**
- 19: Impale -> **Javelin and Spear Mastery**
- 28: Decoy -> **Dopplezon**
- 40: Frozen Armor -> **Cold Enchant**
- 83: Poison Explosion -> **Desecrate**
- 89: Summon Resist -> **Raise Skeleton Archer** (MPQ; Borega still listed Summon Resist)
- 128: Axe Mastery -> **General Mastery**
- 134: Polearm Mastery -> **Pole Arm and Spear Mastery**
- 141: Increased Stamina -> **Combat Reflexes**

Unchanged names worth noting: Enchant = 52, Claw Mastery = 252, Raise Skeleton = 70.

## Player-relevant new skills (id >= 350, castable)

- 357: Blink
- 364: Holy Nova
- 365: Shattering Arrow
- 366: Lightning Sentry
- 367: Blood Warp
- 368: Deep Wounds
- 369: Ice Barrage
- 370: Gust
- 371: Holy Light
- 374: CurMas (Curse Mastery)
- 376: Combustion
- 378: Joust
- 380: Blade Dance
- 381: Dark Pact
- 383: Lesser Hydra
- 391: Lesser Fade

Many other 350+ rows are monster/uber/proc skills — see `sdk/skills.txt`.

## ID conflict note

Classic kolbot used skill id **500** as a fake "Summoner" attack element in `Attack.js` / `Misc.getRange`. In this PD2 MPQ, id 500 is **Frost Nova Horror Boss**. Do not cast 500 as a player skill; leave Attack.js case 500 alone until Summoner scripts are revisited.
