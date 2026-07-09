#!/usr/bin/env python3
import shutil
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "assets/js/app.js"
backup = target.with_suffix(".js.bak")

if not target.exists():
    print("File missing. Exiting.")
    exit(1)

shutil.copy2(target, backup)
print(f"Backup saved to {backup}")

with open(target, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 87-97 (1-indexed) contain the scroll fire drill.
# Replace lines 87-97 with a clean version.
replacement = [
    "      restoreListeningToggleScroll();\n",
    "      requestAnimationFrame(() => {\n",
    "        if (typeof enhanceSongListeningExperience === 'function') enhanceSongListeningExperience();\n",
    "        if (typeof hydrateAlbumDiveAmbient === 'function') hydrateAlbumDiveAmbient();\n",
    "        restoreListeningToggleScroll();\n",
    "      });\n",
]

# Lines 86-96 in 0-indexed
new_lines = lines[:86] + replacement + lines[97:]

with open(target, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done. Scroll restoration simplified successfully.")
