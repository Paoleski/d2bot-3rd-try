"""Add classic kolbot pickit name aliases onto current PD2 ClassIDs (by item code)."""
from pathlib import Path
import re

ALIAS = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs\NTItemAlias.dbl")

# Classic NIP names -> item code (PD2/vanilla codes). IDs resolved from current NTIPAliasClassID[code].
CLASSIC = {
	# weapons / armor bases
	"chaingloves": "mgl",
	"boots": "lbt",  # classic kolton uses "boots" for leather boots (lbt)
	"kris": "kri",
	"shillelagh": "9wd",
	"espandon": "9s9",
	"hierophanttrophy": "ne9",
	"conquerorcrown": "bae",
	"bloodspirit": "drb",
	"gildedshield": "pa9",
	"ornateplate": "xul",
	"hunter'sguise": "xh9",
	# potions
	"supermanapotion": "mp5",
	"superhealingpotion": "hp5",
	"rejuvenationpotion": "rvs",
	"fullrejuvenationpotion": "rvl",
	# gems (MPQ spells sapphire as saphire)
	"perfectsapphire": "gpb",
	# uber keys / organs
	"keyofterror": "pk1",
	"keyofhate": "pk2",
	"keyofdestruction": "pk3",
	"diablo'shorn": "dhn",
	"mephisto'sbrain": "mbr",
	"baal'seye": "bey",
	# charms
	"smallcharm": "cm1",
	"largecharm": "cm2",
	"grandcharm": "cm3",
}


def main():
	text = ALIAS.read_text(encoding="utf-8")

	# code -> id from existing aliases
	code_ids = {}
	for m in re.finditer(r'NTIPAliasClassID\["([^"]+)"\] = (\d+);', text):
		code_ids[m.group(1)] = int(m.group(2))

	missing = []
	lines = []
	for name, code in CLASSIC.items():
		if name in code_ids:
			# already present
			continue
		if code not in code_ids:
			missing.append((name, code))
			continue
		cid = code_ids[code]
		# also skip if somehow same
		lines.append('NTIPAliasClassID["%s"] = %d; // classic nip alias -> %s' % (name, cid, code))

	if missing:
		print("MISSING CODES:")
		for n, c in missing:
			print(" ", n, c)
		# still add what we can

	if not lines:
		print("nothing to add")
		return

	block = "\n// Classic kolbot pickit name aliases (PD2 ClassIDs)\n" + "\n".join(lines) + "\n"

	# Insert just before var NTIPAliasClass =
	marker = "var NTIPAliasClass = {};"
	if marker not in text:
		raise SystemExit("marker not found")
	text = text.replace(marker, block + "\n" + marker, 1)
	ALIAS.write_text(text, encoding="utf-8")
	print("added", len(lines), "aliases")
	for l in lines:
		print(l)


if __name__ == "__main__":
	main()
