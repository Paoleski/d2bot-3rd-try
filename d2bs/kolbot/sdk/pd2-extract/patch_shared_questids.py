"""Replace vanilla quest classids in shared libs + bots with QuestItems or PD2 ids."""
from pathlib import Path
import re

ROOT = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs")

# Map vanilla numeric id -> QuestItems property
MAP = {
	521: "QuestItems.viper",
	524: "QuestItems.inifuss",
	525: "QuestItems.cairnKey",
	545: "QuestItems.lifePotion",
	546: "QuestItems.jade",
	547: "QuestItems.goldenBird",
	549: "QuestItems.cube",
	552: "QuestItems.bookSkill",
	553: "QuestItems.khalimEye",
	554: "QuestItems.khalimHeart",
	555: "QuestItems.khalimBrain",
	646: "QuestItems.scrollResist",
}

FILES = [
	ROOT / "common" / "Town.js",
	ROOT / "common" / "Storage.js",
	ROOT / "common" / "Cubing.js",
	ROOT / "bots" / "Questing.js",
	ROOT / "bots" / "Rushee.js",
	ROOT / "bots" / "Tristram.js",
]

INCLUDE = """\tif (!isIncluded("common/QuestItems.js")) {\n\t\tinclude("common/QuestItems.js");\n\t}\n"""


def ensure_include(text, path):
	if 'include("common/QuestItems.js")' in text:
		return text
	# insert after function Foo() { for bots, or after first { for Cubing/Town/Storage objects
	if path.name in ("Cubing.js", "Storage.js"):
		# var Cubing = { or similar — add at top after header
		m = re.search(r"(var \w+ = \{)", text)
		if m:
			# Can't put include inside object. Prepend after comments.
			idx = text.find("var ")
			return text[:idx] + (
				'if (typeof QuestItems === "undefined") {\n'
				'\tif (!isIncluded("common/QuestItems.js")) {\n'
				'\t\tinclude("common/QuestItems.js");\n'
				'\t}\n'
				'}\n\n'
			) + text[idx:]
	if path.name == "Town.js":
		idx = text.find("var Town")
		if idx < 0:
			idx = text.find("var ")
		return text[:idx] + (
			'if (typeof QuestItems === "undefined") {\n'
			'\tif (!isIncluded("common/QuestItems.js")) {\n'
			'\t\tinclude("common/QuestItems.js");\n'
			'\t}\n'
			'}\n\n'
		) + text[idx:]
	# bots: after function Name() {
	m = re.search(r"function \w+\(\) \{", text)
	if m:
		pos = m.end()
		return text[:pos] + "\n" + INCLUDE + text[pos:]
	return text


def replace_ids(text):
	# getUnit(4, 524) style
	for vid, repl in MAP.items():
		text = re.sub(r"\bgetUnit\(4,\s*%d\)" % vid, "getUnit(4, %s)" % repl, text)
		text = re.sub(r"\bme\.getItem\(%d\)" % vid, "me.getItem(%s)" % repl, text)
		text = re.sub(r"\bme\.findItem\(%d\)" % vid, "me.findItem(%s)" % repl, text)
		text = re.sub(r"\bthis\.getQuestItem\(%d\b" % vid, "this.getQuestItem(%s" % repl, text)
		text = re.sub(r"\bitem\.classid === %d\b" % vid, "item.classid === %s" % repl, text)
		# bare getItem(549) without me. — Storage uses me.getItem already
	return text


for path in FILES:
	text = path.read_text(encoding="utf-8", errors="replace")
	text = ensure_include(text, path)
	before = text
	text = replace_ids(text)
	path.write_text(text, encoding="utf-8")
	print(path.name, "changed" if text != before else "include-only/no-id-match")
