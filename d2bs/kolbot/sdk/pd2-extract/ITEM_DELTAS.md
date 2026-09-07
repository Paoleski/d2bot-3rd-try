# PD2 item ClassID deltas (from pd2data.mpq)

Source: `sdk/pd2-extract/data/global/excel/{Weapons,Armor,Misc}.txt`
`NTItemAlias.dbl` ClassIDs regenerated from MPQ (830 entries).

## Critical quest remaps (vanilla -> PD2)

| Item | Vanilla | PD2 | Code |
|------|---------|-----|------|
| Viper amulet | 521 | 538 | vip |
| Scroll of Inifuss | 524 | 541 | bks |
| Cairn key | 525 | 542 | bkd |
| Potion of Life | 545 | 562 | xyz |
| Jade figurine | 546 | 563 | j34 |
| Golden Bird | 547 | 564 | g34 |
| Horadric Cube | 549 | 566 | box |
| Book of Skill | 552 | 569 | ass |
| Khalim Eye/Heart/Brain | 553-555 | 570-572 | qey/qhr/qbr |
| Malah potion | 644 | 662 | ice |
| Scroll of Resistance | 646 | 664 | tr2 |
| Jewel | 643 | 661 | jew |
| Amulet / Ring | 520 / 522 | 537 / 539 | amu / rin |
| Perfect Emerald | 566 | 593 | gpg |
| El Rune | 610 | 628 | r01 |
| Worldstone Shard | — | 677 | wss |

Use `libs/common/QuestItems.js` for quest lookups — do not hardcode vanilla ids.
