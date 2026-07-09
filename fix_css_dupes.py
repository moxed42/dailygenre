#!/usr/bin/env python3
import shutil
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "assets/css/styles.css"
backup = target.with_suffix(".css.bak")

if not target.exists():
    print("File missing. Exiting.")
    exit(1)

shutil.copy2(target, backup)
print(f"Backup saved to {backup}")

with open(target, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the first :root block and remove it
new_lines = []
in_first_root = False
first_root_ended = False

for line in lines:
    if not in_first_root and ":root{" in line and not first_root_ended:
        # Start of first :root block
        in_first_root = True
        continue
    elif in_first_root:
        if "}":
            in_first_root = False
            first_root_ended = True
        continue
    else:
        new_lines.append(line)

with open(target, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done. Duplicate :root block removed from styles.css.")
