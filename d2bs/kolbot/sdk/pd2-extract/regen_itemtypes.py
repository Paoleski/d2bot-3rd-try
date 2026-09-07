"""Regenerate NTIPAliasType from PD2 ItemTypes.txt."""
from pathlib import Path
import re

EXCEL = Path(__file__).resolve().parent / "data" / "global" / "excel" / "ItemTypes.txt"
ALIAS = Path(__file__).resolve().parents[2] / "libs" / "NTItemAlias.dbl"

EXTRA = {
	"rune": ["runes"],
	"runs": ["stackrune", "runestack"],
	"rung": ["genericrune"],
	"hpot": ["healingpotion"],
	"mpot": ["manapotion"],
	"rpot": ["rejuvpotion", "rejuvenationpotion"],
	"spot": ["staminapotion"],
	"apot": ["antidotepotion"],
	"wpot": ["thawingpotion"],
	"scha": ["smallcharm"],
	"mcha": ["mediumcharm"],
	"lcha": ["largecharm"],
	"abow": ["amazonbow"],
	"aspe": ["amazonspear"],
	"ajav": ["amazonjavelin"],
	"h2h2": ["assassinclaw"],
	"circ": ["circlet"],
	"cloa": ["cloak"],
	"ashd": ["auricshields"],
	"phlm": ["primalhelm"],
	"head": ["voodooheads"],
	"h2h": ["handtohand"],
}


def sanitize(name):
	return re.sub(r"[^a-z0-9]+", "", name.lower())


def load_types():
	lines = EXCEL.read_text(encoding="latin1", errors="replace").splitlines()
	rows = []
	idx = -1
	for line in lines[1:]:
		parts = line.split("\t")
		name = parts[0].strip() if parts else ""
		if not name or name.lower() == "itemtype" or name.startswith("*"):
			continue
		idx += 1
		code = parts[1].strip().lower() if len(parts) > 1 else ""
		rows.append((idx, name, code))
	return rows


def main():
	rows = load_types()
	out = ["var NTIPAliasType = {};"]
	seen = set()

	def add(key, idx):
		if not key or key in seen:
			return
		seen.add(key)
		out.append('NTIPAliasType["%s"] = %d;' % (key, idx))

	for idx, name, code in rows:
		if code:
			add(code, idx)
			for extra in EXTRA.get(code, []):
				add(extra, idx)
		sn = sanitize(name)
		if sn:
			add(sn, idx)

	# Keep common LoD aliases that may not match PD2 names exactly
	legacy = {
		"bowquiver": "bowq",
		"crossbowquiver": "xboq",
		"playerbodypart": "play",
		"missilepotion": "tpot",
		"bodypart": "body",
		"blunt": "blun",
		"any": "any ",
	}
	# skip legacy if uncertain

	new_block = "\n".join(out) + "\n"
	text = ALIAS.read_text(encoding="utf-8", errors="replace")
	m = re.search(r"var NTIPAliasType = \{\};.*?(?=\nvar NTIPAliasClassID)", text, flags=re.S)
	if not m:
		raise SystemExit("NTIPAliasType block not found")
	ALIAS.write_text(text[: m.start()] + new_block + text[m.end() :], encoding="utf-8")
	print("wrote", len(rows), "types")
	for code in ["rune", "runs", "rung", "cloa", "circ", "hpot", "mpot", "rpot", "orb", "pelt"]:
		hit = next((r for r in rows if r[2] == code), None)
		print(code, hit[0] if hit else "MISSING")


if __name__ == "__main__":
	main()
