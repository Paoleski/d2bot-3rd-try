# PD2 monsters / areas / states — baseline only

Extracted for reference (no reactive ID remaps yet):

- `sdk/pd2-extract/data/global/excel/MonStats.txt`
- `sdk/pd2-extract/data/global/excel/States.txt`

## Policy (plan Step 4)

Do **not** bulk-rewrite monster/area IDs until an in-game failure shows a mismatch.

Known risk areas (from abroad notes / PD2):

- Cain / Inifuss stone presets can differ by seed (try both vanilla and +30 ids).
- PD2 maps are **items** (ClassIDs), not new town area IDs in `areas.txt`.
- Buff state checks for Cold Enchant may need tuning if Precast mis-detects (see Precast timers).

When a failure appears: log the unit/preset/area id from the bot, compare to MonStats extract, patch only that call site.
