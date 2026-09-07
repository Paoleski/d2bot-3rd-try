"""Build levels.json + lvlwarp.json from MPQ-extracted excel, then verify bot tables."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot")
EXCEL = ROOT / "sdk" / "pd2-extract" / "data" / "global" / "excel"
OUT = ROOT / "sdk" / "pd2-extract"
PATHER = ROOT / "libs" / "common" / "Pather.js"


def parse_tsv(path: Path):
	text = path.read_text(encoding="latin1", errors="replace")
	lines = [ln for ln in text.splitlines() if ln.strip()]
	hdr = lines[0].split("\t")
	rows = []
	for ln in lines[1:]:
		parts = ln.split("\t")
		# pad
		if len(parts) < len(hdr):
			parts += [""] * (len(hdr) - len(parts))
		row = {hdr[i]: parts[i] for i in range(len(hdr))}
		rows.append(row)
	return hdr, rows


def norm_name(s: str) -> str:
	s = s.lower()
	s = s.replace("act 1 - ", "").replace("act 2 - ", "").replace("act 3 - ", "")
	s = s.replace("act 4 - ", "").replace("act 5 - ", "")
	s = re.sub(r"[^a-z0-9]+", " ", s).strip()
	# common aliases
	repl = {
		"courtyard 1": "outer cloister",
		"courtyard 2": "inner cloister",
		"jail 1": "jail level 1",
		"jail 2": "jail level 2",
		"jail 3": "jail level 3",
		"catacombs 1": "catacombs level 1",
		"catacombs 2": "catacombs level 2",
		"catacombs 3": "catacombs level 3",
		"catacombs 4": "catacombs level 4",
		"cave 1": "cave level 1",
		"cave 2": "cave level 2",
		"hole 1": "hole level 1",
		"hole 2": "hole level 2",
		"pit 1": "pit level 1",
		"pit 2": "pit level 2",
		"crypt 1 a": "crypt",
		"crypt 1 b": "mausoleum",
		"tower 1": "forgotten tower",
		"tower 2": "tower cellar level 1",
		"tower cellars 2": "tower cellar level 2",
		"tower cellars 3": "tower cellar level 3",
		"tower cellars 4": "tower cellar level 4",
		"tower cellars 5": "tower cellar level 5",
		"tristram": "tristram",
		"cow level": "moo moo farm",
		"monastery": "monastery gate",
		"den of evil": "den of evil",
		"underground passage 1": "underground passage level 1",
		"underground passage 2": "underground passage level 2",
		"sewer 1": "sewers level 1",
		"sewer 2": "sewers level 2",
		"sewer 3": "sewers level 3",
		"harem 1": "harem level 1",
		"harem 2": "harem level 2",
		"basement 1": "palace cellar level 1",
		"basement 2": "palace cellar level 2",
		"basement 3": "palace cellar level 3",
		"tomb 1": "stony tomb level 1",
		"tomb 2": "halls of the dead level 1",
		"tomb 3": "halls of the dead level 2",
		"tomb 4": "claw viper temple level 1",
		"tomb 5": "stony tomb level 2",
		"tomb 6": "halls of the dead level 3",
		"tomb 7": "claw viper temple level 2",
		"lair 1": "maggot lair level 1",
		"lair 2": "maggot lair level 2",
		"lair 3": "maggot lair level 3",
		"duriel s lair": "duriels lair",
		"tal rasha 1": "tal rashas tomb 1",
		"tal rasha 2": "tal rashas tomb 2",
		"tal rasha 3": "tal rashas tomb 3",
		"tal rasha 4": "tal rashas tomb 4",
		"tal rasha 5": "tal rashas tomb 5",
		"tal rasha 6": "tal rashas tomb 6",
		"tal rasha 7": "tal rashas tomb 7",
		"spider cave": "spider cave",
		"spider cavern": "spider cavern",
		"durance of hate 1": "durance of hate level 1",
		"durance of hate 2": "durance of hate level 2",
		"durance of hate 3": "durance of hate level 3",
		"pandemonium fortress": "the pandemonium fortress",
		"chaos sanctuary": "chaos sanctuary",
		"worldstone keep 1": "worldstone keep level 1",
		"worldstone keep 2": "worldstone keep level 2",
		"worldstone keep 3": "worldstone keep level 3",
		"throne of destruction": "throne of destruction",
		"worldstone chamber": "the worldstone chamber",
		"matron s den": "matron s den",
		"forgotten sands": "fogotten sands",  # bot typo
		"furnace of pain": "furnace of pain",
		"uber tristram": "tristram",
	}
	return repl.get(s, s)


def load_pather_area_names() -> list[str]:
	text = PATHER.read_text(encoding="utf-8", errors="replace")
	m = re.search(r"getAreaName:\s*function\s*\(area\)\s*\{[\s\S]*?var areas = \[([\s\S]*?)\];", text)
	if not m:
		raise SystemExit("getAreaName array not found")
	names = re.findall(r'"([^"]*)"', m.group(1))
	return names


def load_wp_areas() -> list[int]:
	text = PATHER.read_text(encoding="utf-8", errors="replace")
	m = re.search(r"wpAreas:\s*\[([^\]]+)\]", text)
	if not m:
		raise SystemExit("wpAreas not found")
	return [int(x.strip()) for x in m.group(1).split(",") if x.strip()]


def main():
	hdr, rows = parse_tsv(EXCEL / "Levels.txt")
	levels = []
	by_id = {}
	for row in rows:
		try:
			lid = int(row.get("Id") or "")
		except ValueError:
			continue
		vis = []
		for i in range(8):
			k = f"Vis{i}"
			v = (row.get(k) or "").strip()
			if v and v not in ("", "-1"):
				try:
					vis.append(int(v))
				except ValueError:
					pass
		wp_raw = (row.get("Waypoint") or "").strip()
		try:
			wp = int(wp_raw) if wp_raw not in ("", "255") else None
		except ValueError:
			wp = None
		entry = {
			"id": lid,
			"name": row.get("Name") or "",
			"levelName": row.get("LevelName") or row.get("LevelWarp") or "",
			"levelWarp": row.get("LevelWarp") or "",
			"waypoint": wp,
			"vis": vis,
			"act": int(row["Act"]) if (row.get("Act") or "").isdigit() else None,
		}
		levels.append(entry)
		by_id[lid] = entry

	# LvlWarp
	_, warps_rows = parse_tsv(EXCEL / "LvlWarp.txt")
	warps = []
	for row in warps_rows:
		name = row.get("Name") or ""
		if not name or name.strip() == "Expansion":
			continue
		try:
			wid = int(row.get("Id") or "")
		except ValueError:
			continue
		warps.append({"id": wid, "name": name})

	payload = {
		"source": "pd2data.mpq data/global/excel/Levels.txt",
		"count": len(levels),
		"levels": levels,
	}
	warp_payload = {
		"source": "pd2data.mpq data/global/excel/LvlWarp.txt",
		"count": len(warps),
		"warps": warps,
	}

	(OUT / "levels.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
	(OUT / "lvlwarp.json").write_text(json.dumps(warp_payload, indent=2), encoding="utf-8")
	print(f"wrote {OUT / 'levels.json'} ({len(levels)} levels)")
	print(f"wrote {OUT / 'lvlwarp.json'} ({len(warps)} warps)")

	# Verify getAreaName
	bot_names = load_pather_area_names()
	mismatches = []
	missing_in_mpq = []
	for i, bot in enumerate(bot_names):
		if i == 0:
			continue
		mpq = by_id.get(i)
		if not mpq:
			missing_in_mpq.append(i)
			continue
		bn = re.sub(r"[^a-z0-9]+", " ", bot.lower()).strip()
		# LevelName is the display string used in-game
		ln = re.sub(r"[^a-z0-9]+", " ", (mpq.get("levelName") or "").lower()).strip()
		nn = norm_name(mpq["name"])
		# accept if bot name matches LevelName or normalized Name or known alias
		ok = bn == ln or bn == nn or bn in ln or ln in bn
		# special cases
		if not ok:
			# Tal Rasha tombs: bot uses #N
			bn2 = bn.replace("tal rashas tomb ", "tal rashas tomb ")
			ln2 = ln.replace("tal rasha s tomb ", "tal rashas tomb ").replace("tal rashas tomb ", "tal rashas tomb ")
			ok = bn.replace("#", "") == ln.replace("#", "") or bn.replace(" #", " ") == ln
		if not ok and bn.replace("fogotten", "forgotten") == ln:
			ok = True
		if not ok:
			mismatches.append({
				"id": i,
				"bot": bot,
				"mpqName": mpq["name"],
				"mpqLevelName": mpq.get("levelName"),
			})

	# Verify wpAreas vs Levels.Waypoint
	wp_areas = load_wp_areas()
	wp_from_mpq = {}
	for e in levels:
		if e["waypoint"] is not None:
			wp_from_mpq[e["waypoint"]] = e["id"]

	wp_issues = []
	for idx, area in enumerate(wp_areas):
		expect = wp_from_mpq.get(idx)
		# MPQ Waypoint column is the WP *slot index* matching getWaypoint(i)
		if expect is None:
			# some slots may be unused / town - town WPs exist
			pass
		if expect is not None and expect != area:
			wp_issues.append({"wpIndex": idx, "botArea": area, "mpqArea": expect, "mpqName": by_id[expect]["name"]})

	# Also invert: for each level with waypoint N, bot wpAreas[N] should equal id
	for e in levels:
		if e["waypoint"] is None:
			continue
		idx = e["waypoint"]
		if idx < 0 or idx >= len(wp_areas):
			wp_issues.append({"wpIndex": idx, "botArea": None, "mpqArea": e["id"], "mpqName": e["name"], "err": "index OOB"})
			continue
		if wp_areas[idx] != e["id"]:
			wp_issues.append({
				"wpIndex": idx,
				"botArea": wp_areas[idx],
				"mpqArea": e["id"],
				"mpqName": e["name"],
			})

	report = {
		"botAreaNameCount": len(bot_names),
		"mpqLevelCount": len(levels),
		"maxBotId": len(bot_names) - 1,
		"maxMpqId": max(by_id) if by_id else 0,
		"nameMismatches": mismatches,
		"missingInMpq": missing_in_mpq,
		"wpIssues": wp_issues,
		"wpAreas": wp_areas,
		"mpqWaypointMap": {str(k): v for k, v in sorted(wp_from_mpq.items())},
	}
	(OUT / "levels_verify_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

	print(f"name mismatches: {len(mismatches)}")
	for mrow in mismatches[:40]:
		print("  ", mrow)
	if len(mismatches) > 40:
		print(f"  ... +{len(mismatches)-40} more")
	print(f"missing in mpq: {missing_in_mpq}")
	print(f"wp issues: {len(wp_issues)}")
	for w in wp_issues:
		print("  ", w)


if __name__ == "__main__":
	main()
