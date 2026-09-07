"""Build sdk/skills.txt + SKILL_DELTAS.md from extracted PD2 Skills.txt."""
from pathlib import Path

EXCEL = Path(__file__).resolve().parent / "data" / "global" / "excel"
SKILLS_SRC = EXCEL / "Skills.txt"
SKILLS_OUT = Path(__file__).resolve().parents[1] / "skills.txt"
DELTA_OUT = Path(__file__).resolve().parent / "SKILL_DELTAS.md"

VANILLA = {
	17: "Slow Missiles",
	19: "Impale",
	28: "Decoy",
	40: "Frozen Armor",
	52: "Enchant",
	70: "Raise Skeleton",
	80: "Raise Skeletal Mage",
	83: "Poison Explosion",
	128: "Axe Mastery",
	134: "Polearm Mastery",
	141: "Increased Stamina",
	252: "Claw Mastery",
}


def main():
	text = SKILLS_SRC.read_text(encoding="latin1", errors="replace")
	lines = text.splitlines()
	header = lines[0].split("\t")
	skill_i = header.index("skill")
	id_i = header.index("Id")

	entries = []
	for line in lines[1:]:
		if not line.strip():
			continue
		parts = line.split("\t")
		if len(parts) <= max(skill_i, id_i):
			continue
		name = parts[skill_i].strip()
		sid_raw = parts[id_i].strip()
		if not name or not sid_raw or name.lower() == "skill":
			continue
		try:
			sid = int(sid_raw)
		except ValueError:
			continue
		entries.append((sid, name))

	# Dedup by id (keep first)
	seen = {}
	for sid, name in entries:
		if sid not in seen:
			seen[sid] = name
	ordered = sorted(seen.items(), key=lambda x: x[0])

	SKILLS_OUT.write_text(
		"\n".join("%s = %d" % (name, sid) for sid, name in ordered) + "\n",
		encoding="utf-8",
	)
	print("wrote", SKILLS_OUT, "count", len(ordered), "max_id", ordered[-1][0] if ordered else None)

	renames = []
	for sid, van in VANILLA.items():
		pd2 = seen.get(sid)
		if pd2 and pd2.lower() != van.lower():
			renames.append((sid, van, pd2))

	new_named = [
		(sid, name)
		for sid, name in ordered
		if sid >= 350 and name.lower() not in ("unknown", "attack", "") and not name.lower().startswith("unused")
	]

	delta = [
		"# PD2 skill deltas (from pd2data.mpq Skills.txt)",
		"",
		"Source MPQ: `C:\\Games\\Diablo II\\ProjectD2-Realm\\pd2data.mpq`",
		"Extract: `sdk/pd2-extract/data/global/excel/Skills.txt`",
		"Human list: `sdk/skills.txt`",
		"",
		"## Renames (same id, different name vs classic LoD)",
		"",
	]
	for sid, van, pd2 in renames:
		delta.append("- %d: %s → **%s**" % (sid, van, pd2))
	delta.append("")
	delta.append("## New / high-id named skills (id >= 350)")
	delta.append("")
	for sid, name in new_named:
		delta.append("- %d: **%s**" % (sid, name))
	delta.append("")
	DELTA_OUT.write_text("\n".join(delta) + "\n", encoding="utf-8")
	print("wrote", DELTA_OUT)
	print("renames:", renames)
	print("new sample:", new_named[:25])


if __name__ == "__main__":
	main()
