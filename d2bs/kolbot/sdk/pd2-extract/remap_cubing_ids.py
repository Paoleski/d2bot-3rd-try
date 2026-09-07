"""Remap Cubing.js hardcoded gem/rune/cube classids to PD2 MPQ ids."""
from pathlib import Path
import re

CUBING = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs\common\Cubing.js")

# Vanilla LoD classid -> PD2 (from pd2data.mpq Misc.txt)
VANILLA_TO_PD2 = {
	# cube
	549: 566,
	# perfect gems (gemList)
	561: 578,  # gpv
	566: 583,  # gpy — NOTE: vanilla 566 was perfect topaz; PD2 566 is cube!
	571: 588,  # gpb
	576: 593,  # gpg
	581: 598,  # gpr
	586: 603,  # gpw
	601: 618,  # skz
	# full gem ladders amethyst->diamond + skulls (chipped..perfect)
	557: 574, 558: 575, 559: 576, 560: 577,  # amethyst (560->577 flawless)
	562: 579, 563: 580, 564: 581, 565: 582,  # topaz (chipped..flawless); perfect was 566->583 above
	567: 584, 568: 585, 569: 586, 570: 587,  # sapphire
	572: 589, 573: 590, 574: 591, 575: 592,  # emerald
	577: 594, 578: 595, 579: 596, 580: 597,  # ruby
	582: 599, 583: 600, 584: 601, 585: 602,  # diamond
	597: 614, 598: 615, 599: 616, 600: 617,  # skulls (perfect 601->618)
	# runes r01-r33: vanilla 610-642 -> PD2 628-660
}

for i in range(33):
	VANILLA_TO_PD2[610 + i] = 628 + i

# Apply carefully: replace numeric literals that are known ingredient/cube ids.
# Avoid replacing unrelated numbers by only touching contexts in Cubing.

text = CUBING.read_text(encoding="utf-8", errors="replace")

# Ensure QuestItems include for cube lookups we may switch to QuestItems.cube
if 'QuestItems' not in text[:800]:
	idx = text.find("var Cubing")
	text = (
		text[:idx]
		+ 'if (typeof QuestItems === "undefined") {\n'
		+ '\tif (!isIncluded("common/QuestItems.js")) {\n'
		+ '\t\tinclude("common/QuestItems.js");\n'
		+ '\t}\n'
		+ '}\n\n'
		+ text[idx:]
	)

# Replace gemList array explicitly first
text = text.replace(
	"gemList = [561, 566, 571, 576, 581, 586, 601];",
	"gemList = [578, 583, 588, 593, 598, 603, 618]; // PD2 perfect gems",
)

# Replace getUnit/getItem cube 549
text = re.sub(r"getUnit\(4,\s*549\)", "getUnit(4, QuestItems.cube)", text)
text = re.sub(r"me\.getItem\(549\)", "me.getItem(QuestItems.cube)", text)

# Replace remaining vanilla ids as whole-number tokens in ingredient arrays / comparisons
# Sort keys descending so 566 isn't partially confused — map values don't overlap wrongly if we
# replace from highest vanilla id first among those that map to different targets.
# CRITICAL: vanilla 566 (topaz) must become 583 BEFORE any leftover 549->566 cube work.
# Cube already handled. Replace all VANILLA_TO_PD2 keys as standalone numbers in Cubing.

# Only replace in contexts that look like classids: after [ , ( === !==
def repl_num(match):
	n = int(match.group(1))
	if n in VANILLA_TO_PD2:
		return match.group(0).replace(str(n), str(VANILLA_TO_PD2[n]), 1)
	return match.group(0)

# Match numbers used as classids
pattern = re.compile(r"(?<![A-Za-z_.])(\d{3})(?![A-Za-z0-9_])")

def smart_replace(t):
	out = []
	i = 0
	for m in pattern.finditer(t):
		n = int(m.group(1))
		out.append(t[i:m.start()])
		if n in VANILLA_TO_PD2:
			# skip if already QuestItems
			prev = t[max(0, m.start() - 20):m.start()]
			if "QuestItems" in prev:
				out.append(m.group(1))
			else:
				out.append(str(VANILLA_TO_PD2[n]))
		else:
			out.append(m.group(1))
		i = m.end()
	out.append(t[i:])
	return "".join(out)

# Apply map but EXCLUDE cube target collision: after cube->QuestItems, don't map 566 as topaz in getItem(QuestItems)
# For remaining bare 566 that mean topaz in recipes - those are ingredient numbers still vanilla 566
new_text = smart_replace(text)

CUBING.write_text(new_text, encoding="utf-8")
print("Cubing.js remapped")
# sanity
for s in ["gemList", "QuestItems.cube", "578", "628"]:
	print(s, new_text.count(s))
