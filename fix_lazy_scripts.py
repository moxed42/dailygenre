#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "index.html"

if not target.exists():
    print("index.html missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Defer heavy add-on scripts so they don't block initial render
content = content.replace('<script src="assets/js/album-dive.js">', '<script src="assets/js/album-dive.js" defer>')
content = content.replace('<script src="assets/js/visuals.js">', '<script src="assets/js/visuals.js" defer>')
content = content.replace('<script src="assets/js/studio-polish.js">', '<script src="assets/js/studio-polish.js" defer>')
content = content.replace('<script src="assets/js/ranks-polish.js">', '<script src="assets/js/ranks-polish.js" defer>')
content = content.replace('<script src="assets/js/library-polish.js">', '<script src="assets/js/library-polish.js" defer>')
content = content.replace('<script src="assets/js/listening-room.js">', '<script src="assets/js/listening-room.js" defer>')

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done. Added defer to heavy JS scripts.")
