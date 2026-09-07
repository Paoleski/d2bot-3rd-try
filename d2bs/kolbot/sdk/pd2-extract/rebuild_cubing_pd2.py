"""Rebuild Cubing.js from abroad vanilla + one-pass PD2 classid remap (tokenized)."""
from pathlib import Path
import re

SRC = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_113c_abroad\d2bs\kolbot\libs\common\Cubing.js")
DST = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs\common\Cubing.js")

VANILLA_TO_PD2 = {
	549: 566,  # cube
	520: 537,  # amulet
	522: 539,  # ring
	643: 661,  # jewel
	561: 578,
	566: 583,
	571: 588,
	576: 593,
	581: 598,
	586: 603,
	601: 618,
	557: 574,
	558: 575,
	559: 576,
	560: 577,
	562: 579,
	563: 580,
	564: 581,
	565: 582,
	567: 584,
	568: 585,
	569: 586,
	570: 587,
	572: 589,
	573: 590,
	574: 591,
	575: 592,
	577: 594,
	578: 595,
	579: 596,
	580: 597,
	582: 599,
	583: 600,
	584: 601,
	585: 602,
	597: 614,
	598: 615,
	599: 616,
	600: 617,
}
for i in range(33):
	VANILLA_TO_PD2[610 + i] = 628 + i

# Prefer sibling d2bot vanilla Cubing if present
CANDIDATES = [
	Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot\d2bs\kolbot\libs\common\Cubing.js"),
	Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_113c_abroad\d2bs\kolbot\libs\common\Cubing.js"),
]
SRC = next(p for p in CANDIDATES if p.exists())
print("source", SRC)
text = SRC.read_text(encoding="utf-8", errors="replace")

tokens = {}
rev = {}
for i, (v, p) in enumerate(VANILLA_TO_PD2.items()):
	tok = "__PD2ID_%d__" % i
	tokens[v] = tok
	rev[tok] = str(p)


def tokenize(t):
	def repl(m):
		n = int(m.group(1))
		return tokens[n] if n in tokens else m.group(1)

	return re.sub(r"(?<![A-Za-z_.])(\d{3})(?![A-Za-z0-9_])", repl, t)


text2 = tokenize(text)
for tok, p in rev.items():
	text2 = text2.replace(tok, p)

idx = text2.find("var Cubing")
header = (
	'if (typeof QuestItems === "undefined") {\n'
	'\tif (!isIncluded("common/QuestItems.js")) {\n'
	'\t\tinclude("common/QuestItems.js");\n'
	'\t}\n'
	"}\n\n"
)
text2 = text2[:idx] + header + text2[idx:]

# cube id is now 566 after remap — switch lookups to QuestItems.cube
text2 = text2.replace("getUnit(4, 566)", "getUnit(4, QuestItems.cube)")
text2 = text2.replace("me.getItem(566)", "me.getItem(QuestItems.cube)")

text2 = text2.replace(
	"gemList = [578, 583, 588, 593, 598, 603, 618];",
	"gemList = [578, 583, 588, 593, 598, 603, 618]; // PD2 perfect gems",
)
text2 = text2.replace(
	"gemList = [561, 566, 571, 576, 581, 586, 601];",
	"gemList = [578, 583, 588, 593, 598, 603, 618]; // PD2 perfect gems",
)

DST.write_text(text2, encoding="utf-8")

for line in text2.splitlines():
	if "gemList =" in line and "[" in line:
		print(line.strip())
	if "HitPower.Helm" in line:
		print(line.strip())
	if "QuestItems.cube" in line:
		print(line.strip())
