from pathlib import Path
import re

p = Path(r"C:\Games\Diablo II\ProjectD2-Realm\d2bot_3rd_try\d2bs\kolbot\libs\common\Cubing.js")
t = p.read_text(encoding="utf-8")

patterns = [
	(
		r'\(getUnit\(4,\s*\d+\)\s*\|\|\s*getUnit\(4,\s*QuestItems\.cube\)\s*\|\|\s*getUnit\(4,\s*"box"\)\)',
		"getUnit(4, QuestItems.cube)",
	),
	(
		r'\(me\.getItem\(\d+\)\s*\|\|\s*me\.getItem\(QuestItems\.cube\)\s*\|\|\s*me\.getItem\("box"\)\)',
		"me.getItem(QuestItems.cube)",
	),
	(
		r'!\(me\.getItem\(\d+\)\s*\|\|\s*me\.getItem\(QuestItems\.cube\)\s*\|\|\s*me\.getItem\("box"\)\)',
		"!me.getItem(QuestItems.cube)",
	),
]

for pat, repl in patterns:
	t, n = re.subn(pat, repl, t)
	print(pat[:40], n)

t = t.replace("getUnit(4, 581)", "getUnit(4, QuestItems.cube)")
t = t.replace("me.getItem(581)", "me.getItem(QuestItems.cube)")

p.write_text(t, encoding="utf-8")
print("QuestItems.cube count", t.count("QuestItems.cube"))
print("bad 581", "581" in t and ("getItem(581)" in t or "getUnit(4, 581)" in t))
for line in t.splitlines():
	if "Ingredients" in line and "HitPower.Helm" in line:
		print(line.strip())
	if "gemList =" in line and "[" in line:
		print(line.strip())
