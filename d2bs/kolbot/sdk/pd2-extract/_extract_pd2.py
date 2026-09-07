"""One-shot: extract PD2 excel txt from pd2data.mpq and build sdk/skills.txt."""
import mpyq
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # .../kolbot/sdk
KOLBOT = ROOT.parent  # .../kolbot
MPQ = Path(r"C:\Games\Diablo II\ProjectD2-Realm\pd2data.mpq")
OUT_DIR = Path(__file__).resolve().parent / "data" / "global" / "excel"
SKILLS_OUT = ROOT / "skills.txt"
DELTA_OUT = Path(__file__).resolve().parent / "SKILL_DELTAS.md"

TARGETS = [
	"Skills.txt",
	"Skilldesc.txt",
	"Weapons.txt",
	"Armor.txt",
	"Misc.txt",
	"ItemTypes.txt",
	"MonStats.txt",
	"States.txt",
]

# Classic LoD display names for IDs that PD2 renamed (same numeric id).
VANILLA_NAMES = {
	17: "Slow Missiles",
	19: "Impale",
	40: "Frozen Armor",
	52: "Enchant",
	70: "Raise Skeleton",
	80: "Raise Skeletal Mage",
	83: "Poison Explosion",
	89: "Summon Resist",  # PD2 may differ — verify from file
	128: "Axe Mastery",
	134: "Polearm Mastery",
	135: "Throwing Mastery",
	136: "Spear Mastery",
	141: "Increased Stamina",
	252: "Claw Mastery",
}


def extract():
	OUT_DIR.mkdir(parents=True, exist_ok=True)
	archive = mpyq.MPQArchive(str(MPQ))
	by_name = {}
	for entry in archive.files:
		name = entry.decode("latin1").split("\\")[-1]
		by_name[name.lower()] = entry

	for canon in TARGETS:
		key = canon.lower()
		if key not in by_name:
			raise SystemExit("Missing in MPQ: %s" % canon)
		data = archive.read_file(by_name[key])
		if isinstance(data, tuple):
			data = data[0]
		(OUT_DIR / canon).write_bytes(data)
		print("extracted", canon, len(data))


def skill_display_name(skill_id, skill_code, skilldesc_map):
	"""Prefer skilldesc str name; fall back to skill code."""
	desc = skilldesc_map.get(skill_code)
	if desc:
		return desc
	if skill_code and skill_code not in ("", "None"):
		return skill_code
	return "Unknown"


def load_skilldesc_names(path):
	"""Map skilldesc id -> first string column that looks like a name."""
	text = path.read_text(encoding="latin1", errors="replace")
	lines = text.splitlines()
	if not lines:
		return {}
	header = lines[0].split("\t")
	# skilldesc column 0 is usually skilldesc id; str name often in 'str name' / 'SkillPage' area
	idx_id = 0
	name_idx = None
	for i, col in enumerate(header):
		cl = col.strip().lower()
		if cl in ("str name", "strname", "name"):
			name_idx = i
			break
	if name_idx is None:
		# PD2 Skilldesc often has skilldesc then SkillPage...; str name later
		for i, col in enumerate(header):
			if "name" in col.strip().lower() and "str" in col.strip().lower():
				name_idx = i
				break
	mapping = {}
	for line in lines[1:]:
		if not line.strip():
			continue
		parts = line.split("\t")
		if len(parts) <= idx_id:
			continue
		sid = parts[idx_id].strip()
		if not sid or sid.startswith("Expansion"):
			continue
		label = parts[name_idx].strip() if name_idx is not None and name_idx < len(parts) else ""
		mapping[sid] = label
	return mapping, header


def build_skills_list():
	skills_path = OUT_DIR / "Skills.txt"
	desc_path = OUT_DIR / "Skilldesc.txt"
	text = skills_path.read_text(encoding="latin1", errors="replace")
	lines = text.splitlines()
	header = lines[0].split("\t")
	# skill column
	try:
		skill_idx = header.index("skill")
	except ValueError:
		skill_idx = 0
	try:
		desc_idx = header.index("skilldesc")
	except ValueError:
		desc_idx = None

	desc_map, desc_header = load_skilldesc_names(desc_path)
	print("Skilldesc header sample:", desc_header[:15])

	# Locale-style names: Borega / human list uses English names.
	# Prefer skilldesc str name if present; else title-case the skill code.
	entries = []  # (id, name, code)
	skill_id = -1
	for line in lines[1:]:
		if not line.strip():
			continue
		parts = line.split("\t")
		code = parts[skill_idx].strip() if skill_idx < len(parts) else ""
		if not code:
			continue
		# Skip header repeats / expansion markers that aren't real rows
		if code.lower() == "skill" or code.startswith("*"):
			continue
		skill_id += 1
		desc_key = ""
		if desc_idx is not None and desc_idx < len(parts):
			desc_key = parts[desc_idx].strip()
		raw_name = desc_map.get(desc_key) or desc_map.get(code) or ""
		# skilldesc str name is often a string key like "SkillNameblizzard" — keep skill code prettier
		if raw_name.lower().startswith("skillname") or raw_name.lower().startswith("skilldesc"):
			raw_name = ""
		if raw_name:
			name = raw_name
		elif code.lower() in ("attack", "unsummon", "throw", "kick"):
			name = code.title().replace("_", " ")
		elif code:
			# convert CamelCase / mixed codes to spaced name when possible
			name = pretty_skill_code(code)
		else:
			name = "Unknown"
		entries.append((skill_id, name, code, desc_key))

	# Write Borega-style list
	out_lines = ["%s = %d" % (name, sid) for sid, name, code, _ in entries]
	SKILLS_OUT.write_text("\n".join(out_lines) + "\n", encoding="utf-8")
	print("wrote", SKILLS_OUT, "count", len(entries))

	# Delta note vs vanilla renames + new high IDs
	renames = []
	new_skills = []
	for sid, name, code, _ in entries:
		if sid in VANILLA_NAMES and VANILLA_NAMES[sid].lower() != name.lower():
			# also treat code-based pretty names
			van = VANILLA_NAMES[sid]
			if van.lower() not in name.lower() and name.lower() not in van.lower():
				renames.append((sid, van, name, code))
		if sid >= 350 and name.lower() != "unknown" and code.lower() not in ("", "none"):
			new_skills.append((sid, name, code))

	# Extra: compare pretty code to known vanilla for common remaps by code
	code_renames = {
		"cold enchant": (40, "Frozen Armor"),
		"enchant fire": (52, "Enchant"),
		"desecrate": (83, "Poison Explosion"),
		"slow movement": (17, "Slow Missiles"),
		"javelin and spear mastery": (19, "Impale"),
		"general mastery": (128, "Axe Mastery"),
		"polearm and spear mastery": (134, "Polearm Mastery"),
		"combat reflexes": (141, "Increased Stamina"),
		"claw and dagger mastery": (252, "Claw Mastery"),
		"raise skeleton warrior": (70, "Raise Skeleton"),
	}
	rename_lines = []
	seen = set()
	for sid, name, code, _ in entries:
		key = name.lower()
		if key in code_renames:
			exp_id, van = code_renames[key]
			if sid == exp_id and sid not in seen:
				rename_lines.append("- %d: %s → **%s** (code `%s`)" % (sid, van, name, code))
				seen.add(sid)
		elif sid in VANILLA_NAMES and pretty_skill_code(code).lower() != VANILLA_NAMES[sid].lower():
			pn = pretty_skill_code(code)
			if pn.lower() != VANILLA_NAMES[sid].lower() and sid not in seen:
				rename_lines.append("- %d: %s → **%s** (code `%s`)" % (sid, VANILLA_NAMES[sid], pn, code))
				seen.add(sid)

	new_lines = []
	for sid, name, code in new_skills:
		if name.lower() == "unknown" or code.lower().startswith("attack"):
			continue
		new_lines.append("- %d: **%s** (`%s`)" % (sid, name, code))

	delta = []
	delta.append("# PD2 skill deltas (from pd2data.mpq Skills.txt)")
	delta.append("")
	delta.append("Source: `%s`" % MPQ)
	delta.append("Extract: `%s`" % OUT_DIR)
	delta.append("Human list: `%s`" % SKILLS_OUT)
	delta.append("")
	delta.append("## Renames (same id, different name)")
	delta.append("")
	delta.extend(rename_lines or ["- (see skills.txt vs vanilla; codes used when str name missing)"])
	delta.append("")
	delta.append("## New / high-id castables (id >= 350, named)")
	delta.append("")
	delta.extend(new_lines[:80] or ["- none detected"])
	delta.append("")
	DELTA_OUT.write_text("\n".join(delta) + "\n", encoding="utf-8")
	print("wrote", DELTA_OUT)
	return entries


def pretty_skill_code(code):
	"""Turn skill row codes into readable names."""
	# Already spaced?
	if " " in code:
		return code
	# Insert spaces before capitals: ColdEnchant -> Cold Enchant
	out = []
	for i, ch in enumerate(code):
		if ch.isupper() and i > 0 and (code[i - 1].islower() or (i + 1 < len(code) and code[i + 1].islower())):
			out.append(" ")
		out.append(ch)
	s = "".join(out).replace("_", " ").strip()
	# Fix common all-lowercase codes
	if s.islower():
		s = s.title()
	return s


if __name__ == "__main__":
	extract()
	entries = build_skills_list()
	# print sample around known remaps
	for sid, name, code, desc in entries:
		if sid in (40, 52, 54, 59, 83, 112, 149, 357, 364, 367, 369, 376, 378, 383):
			print("ID", sid, "=", name, "| code", code, "| desc", desc)
