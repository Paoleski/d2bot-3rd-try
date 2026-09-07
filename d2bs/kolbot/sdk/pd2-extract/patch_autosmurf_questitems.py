"""Patch AutoSmurf.js to use QuestItems.* for PD2 classids."""
from pathlib import Path
import re

path = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs\bots\AutoSmurf.js")
text = path.read_text(encoding="utf-8", errors="replace")

include = """function AutoSmurf() {
	if (!isIncluded("common/QuestItems.js")) {
		include("common/QuestItems.js");
	}
"""

if 'include("common/QuestItems.js")' not in text:
	text = text.replace("function AutoSmurf() {", include.rstrip("\n"), 1)

# Numeric getItem / findItem / getQuestItem / classid comparisons — only exact known quest ids
replacements = [
	(r"me\.getItem\(545\)", "me.getItem(QuestItems.lifePotion)"),
	(r"me\.getItem\(546\)", "me.getItem(QuestItems.jade)"),
	(r"me\.getItem\(547\)", "me.getItem(QuestItems.goldenBird)"),
	(r"me\.getItem\(549\)", "me.getItem(QuestItems.cube)"),
	(r"me\.getItem\(521\)", "me.getItem(QuestItems.viper)"),
	(r"me\.getItem\(524\)", "me.getItem(QuestItems.inifuss)"),
	(r"me\.getItem\(525\)", "me.getItem(QuestItems.cairnKey)"),
	(r"me\.getItem\(552\)", "me.getItem(QuestItems.bookSkill)"),
	(r"me\.getItem\(553\)", "me.getItem(QuestItems.khalimEye)"),
	(r"me\.getItem\(554\)", "me.getItem(QuestItems.khalimHeart)"),
	(r"me\.getItem\(555\)", "me.getItem(QuestItems.khalimBrain)"),
	(r"me\.getItem\(646\)", "me.getItem(QuestItems.scrollResist)"),
	(r"me\.findItem\(552\)", "me.findItem(QuestItems.bookSkill)"),
	(r"this\.getQuestItem\(524,\s*30\)", "this.getQuestItem(QuestItems.inifuss, 30)"),
	(r"this\.getQuestItem\(549,\s*354\)", "this.getQuestItem(QuestItems.cube, 354)"),
	(r"this\.getQuestItem\(521,\s*149\)", "this.getQuestItem(QuestItems.viper, 149)"),
	(r"this\.getQuestItem\(552\)", "this.getQuestItem(QuestItems.bookSkill)"),
	(r"this\.getQuestItem\(546\)", "this.getQuestItem(QuestItems.jade)"),
	(r"item\.classid === 553", "item.classid === QuestItems.khalimEye"),
	(r"item\.classid === 554", "item.classid === QuestItems.khalimHeart"),
	(r"item\.classid === 555", "item.classid === QuestItems.khalimBrain"),
]

for pat, repl in replacements:
	text, n = re.subn(pat, repl, text)
	print(pat, "->", n)

# questStuff list
text2, n = re.subn(
	r"questStuff\s*=\s*\[[^\]]+\];",
	"questStuff = QuestItems.allIds(); // PD2 classids from QuestItems.js",
	text,
	count=1,
)
print("questStuff", n)
text = text2

path.write_text(text, encoding="utf-8")
print("done", path)
