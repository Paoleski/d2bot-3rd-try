"""Regenerate NTIPAliasClassID block from pd2-extract Weapons/Armor/Misc.txt."""
from pathlib import Path
import re

EXCEL = Path(__file__).resolve().parent / "data" / "global" / "excel"
ALIAS = Path(__file__).resolve().parents[2] / "libs" / "NTItemAlias.dbl"

EXTRAS = {
	"box": ["horadriccube"],
	"vip": ["topofthehoradricstaff", "viperamulet"],
	"bks": ["scrollofinifuss", "barkscroll"],
	"bkd": ["keytothecairnstones", "decipheredbarkscroll"],
	"xyz": ["potionoflife", "scrollofselfresurrect"],
	"ass": ["bookofskill"],
	"qey": ["khalim'seye", "khalimeye"],
	"qhr": ["khalim'sheart", "khalimheart"],
	"qbr": ["khalim'sbrain", "khalimbrain"],
	"wss": ["worldstoneshard"],
	"ice": ["malah'spotion", "maguffin"],
	"bbb": ["lamesenstome"],
	"j34": ["jadefigurine", "ajadefigurine"],
	"g34": ["thegoldenbird", "goldbird"],
	"mss": ["mephistossoulstone"],
	"leg": ["wirt'sleg", "wirtsleg"],
	"hdm": ["horadricmalus"],
	"hst": ["horadricstaff"],
	"msf": ["staffofthekings"],
	"g33": ["gidbinn"],
	"qf1": ["khalimflail"],
	"qf2": ["superkhalimflail", "khalimswill"],
}


def sanitize(name):
	return re.sub(r"[^a-z0-9]+", "", name.lower())


def load_items():
	items = []
	cid = 0
	for fname in ["Weapons.txt", "Armor.txt", "Misc.txt"]:
		lines = (EXCEL / fname).read_text(encoding="latin1", errors="replace").splitlines()
		header = lines[0].split("\t")
		code_i = header.index("code")
		name_i = header.index("name")
		for line in lines[1:]:
			if not line.strip():
				continue
			parts = line.split("\t")
			name = parts[name_i].strip()
			code = parts[code_i].strip()
			if not name or name.startswith("*") or name.lower() == "name":
				continue
			items.append((cid, code, name))
			cid += 1
	return items


def main():
	items = load_items()
	out = ["var NTIPAliasClassID = {};"]
	for cid, code, name in items:
		if not code:
			continue
		aliases = [code.lower()]
		sn = sanitize(name)
		if sn and sn != code.lower():
			aliases.append(sn)
		for extra in EXTRAS.get(code.lower(), []):
			aliases.append(extra)
		seen = set()
		uniq = []
		for a in aliases:
			if a and a not in seen:
				seen.add(a)
				uniq.append(a)
		parts = ['NTIPAliasClassID["%s"] = %d;' % (a, cid) for a in uniq]
		out.append("  ".join(parts))

	new_block = "\n".join(out) + "\n"
	text = ALIAS.read_text(encoding="utf-8", errors="replace")
	m = re.search(r"var NTIPAliasClassID = \{\};.*?(?=\nvar NTIPAlias)", text, flags=re.S)
	if not m:
		raise SystemExit("NTIPAliasClassID block not found")
	ALIAS.write_text(text[: m.start()] + new_block + text[m.end() :], encoding="utf-8")
	print("wrote", len(items), "classids to", ALIAS)
	for code in ["box", "vip", "wss", "xyz", "ass", "qey", "gsy", "bks", "ice", "tr2"]:
		mm = re.search(r'NTIPAliasClassID\["%s"\] = (\d+);' % code, new_block)
		print(code, mm.group(1) if mm else "MISSING")


if __name__ == "__main__":
	main()
