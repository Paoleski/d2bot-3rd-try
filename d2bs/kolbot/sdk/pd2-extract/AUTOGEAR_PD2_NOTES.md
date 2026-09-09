# AutoGear — SoloPlay ideas → PD2 transforms

We do **not** port SoloPlay modules. Each feature is: SoloPlay idea → re-implement on our AutoGear / NTIP / Town / Misc → validate against PD2 data first.

## Config knobs (`Config.AutoGear`)

| Knob | Default | Phase | Meaning |
|------|---------|-------|---------|
| `ProtectRWBases` | true | 1 | Reject equip of empty `Config.Runewords` bases |
| `CharmCaps` | see Config.js | 1 | Qty caps after `leveling_charms.nip` keep filter |
| `EnableMidRW` | true | 2 | Gate Spirit/Insight (validated) |
| `EnableSecondary` | false | 4 | Swap `#secondarytier` |
| `FinalGearBoost` | 100000 | 4 | Endgame identity boost inside tierscore |

`Config.AutoGearBuild` — existing string (`fire` / `cold` / `light` / `poisonstrike`).

## Preserve always (do not regress)

- [`Pickit.js`](../../libs/common/Pickit.js) hard-keeps: runes, PD2 currency (`wss`/`lbox`/…), quest, jewels; never pick `isc`
- Sorc `wantsShieldSlot` / Poison Strike dagger gate; caster axe block (Military Pick)
- PD2 inv 10×8 / stash widths in `Storage.js`
- Charm inventory lock + `leveling_charms.nip` sell keep list

## Phase 2+ validation checklist

| Check | Status |
|-------|--------|
| Spirit / Insight / Splendor / full Runeword table | done — all recipes PD2 628–660; ladder always on |
| `meditationaura` alias `[151,120]` | confirmed in NTItemAlias |
| Charm types 83/84/85 | Phase 1 |
| Treachery / CTA as AutoGear mid | optional later (recipes already remapped) |
| Resist caps / dynamic tiers | Phase 3 — `AutoGearScore.js` + slim `autoequip_sor.nip` |
| Sorc rare armor floor + FHR/ED (sold 24FHR studded) | fixed — `autoequip_sor.nip` + `isPendingPlayerUpgrade` |
| PD2 FCR on chest/shield/gloves/belt | scored — sorc + caster nec; gloves/belt 10% only, chest/shield 10/20 |
| PD2 global ED on chest/shield | PS necro overlay; sorc skips (mercScore already values for Act2) |
| MiniShopBot +1 AC helm spam | fixed — `worthShopBuy` + flat starter tier 1 (no defense/1000) |
| Sorc never picking orbs | fixed — PD2 type 69 vs code 68; staff floors beat orbs; pending-orb + switch |
| MiniShop Stealth 2os armor | caster — Breast/Light Plate only; `wantStealthShopBase` (lvl≥17) |
| MiniShop Lore 2os helm | caster — `wantLoreShopBase` (lvl≥20); Cap→Basinet list |
| Early Lore / Stealth vs Steel | casters `leveling_rw_caster.nip`; melee `leveling_rw_melee.nip`; PS Strength knives |
| Leaf vs orb | Leaf tier 50; stop hunt when orb tier≥50 (`hasBetterThanLeafOrb`) |
| Cold/light early weapon | Spirit 4os sword pickit early; recipes still mid @18 |
| PD2 Stealth keep | FCR 20 / FHR 20 (was LoD 10/30 mismatch) |

**Rune map:** vanilla LoD El=610…Zod=642 → PD2 El=628…Zod=660 (+18). Source: `NTItemAlias.dbl` / ITEM_DELTAS.

## Phase status

| Phase | Status |
|-------|--------|
| 0 Config + this doc | done |
| 1 Empty RW protect, charm caps, jewelry overlays | done |
| 2 Gated mid RWs (Spirit/Insight) | done — test in-game |
| 3 Dynamic tierscore | in progress — sorc hybrid (AutoGearScore + identity flats); fire/cold weights live, light overlay weapon skills kept |
| 4 Secondary / FinalGear / socketables | not started |

## Phase 3 — AutoGearScore (sorc)

- Module: [`libs/common/AutoGearScore.js`](../../libs/common/AutoGearScore.js)
- Included from `AutoGear.js` when `me.classid === 1`
- Nip: `[tier] == AutoGearScore.forItem(item)` on generics; Spirit/Lore/Stealth/Lidless/Magefist/… stay flat ≥80
- `Item.autoEquipCheck`: below tier 80 uses `beatsEquipped` (context FCR/res); ≥80 uses raw NTIP tier
- Knob: `Config.AutoGear.DebugScore` — print score breakdowns
- Soft goals: FCR 20 → 63 → 105; resist 0/20 → NM 50/75 → Hell 75
- Extended `isLowLvlSetJunk` (Isenhart/Sigon/Arctic/Angelic/…)

### Phase 3 in-game checklist

1. Boot light sorc: log shows `Score=on`
2. Below 63 FCR: ring that completes next BP beats high-life no-FCR ring
3. At 63+: life/res ring beats naked 10 FCR ring
4. Lore/Stealth/Spirit still equip over mid rares
5. NM: Isenhart/Sigon not picked; resist fill matters
6. MiniShop: no +1 AC white spam (`worthShopBuy` unchanged)

## Phase 2 mid shields (casters, PD2)

- **Spirit sword** — still gated mid weapon  
- **Shields:** Splendor (Eth+Lum PD2 632/644) + Lidless + Moser's — **not** Spirit Monarch  
- Pickit: `leveling_rw_caster_shield.nip`; tiers in `autoequip_sor.nip` / `autoequip_nec.nip`

## Phase 2 in-game test checklist

1. **Boot (caster lvl ≥18):** `MidRW=true [Spirit-sword]` (Insight ≥27; Splendor/Lidless/Mosers ≥24 when shield wanted)
2. **Spirit sword:** 4os Crystal Sword → Spirit → equip; no Monarch Spirit crafting
3. **Caster shield:** Lidless/Moser's pick + Splendor 2os bases; equip beats mid rares
4. **Insight:** unchanged
5. **Regression:** no Military Pick keep on sorc/necro
