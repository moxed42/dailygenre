#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "index.html"

if not target.exists():
    print("index.html missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Add defer to heavy add-on scripts
content = content.replace('src="./assets/js/album-dive.js" ', 'src="./assets/js/album-dive.js" defer ')
content = content.replace('src="./assets/js/visuals.js" ', 'src="./assets/js/visuals.js" defer ')
content = content.replace('src="./assets/js/studio-polish.js" ', 'src="./assets/js/studio-polish.js" defer ')
content = content.replace('src="./assets/js/library-polish.js" ', 'src="./assets/js/library-polish.js" defer ')
content = content.replace('src="./assets/js/listening-room.js" ', 'src="./assets/js/listening-room.js" defer ')
content = content.replace('src="./assets/js/ranks-polish.js" ', 'src="./assets/js/ranks-polish.js" defer ')
content = content.replace('src="./assets/js/songs.js" ', 'src="./assets/js/songs.js" defer ')
content = content.replace('src="./assets/js/genre-identity.js" ', 'src="./assets/js/genre-identity.js" defer ')

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done. Added defer to heavy JS scripts.")
