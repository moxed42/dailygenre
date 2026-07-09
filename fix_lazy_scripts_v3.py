#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "index.html"

if not target.exists():
    print("index.html missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Add defer to heavy add-on scripts (matches the full query string)
content = content.replace(
    'src="./assets/js/album-dive.js?v=mobile-genre-stability-v220">',
    'src="./assets/js/album-dive.js?v=mobile-genre-stability-v220" defer>'
)
content = content.replace(
    'src="./assets/js/visuals.js?v=spin-today-mobile-v183">',
    'src="./assets/js/visuals.js?v=spin-today-mobile-v183" defer>'
)
content = content.replace(
    'src="./assets/js/studio-polish.js?v=mobile-genre-stability-v220">',
    'src="./assets/js/studio-polish.js?v=mobile-genre-stability-v220" defer>'
)
content = content.replace(
    'src="./assets/js/library-polish.js?v=spin-today-mobile-v183">',
    'src="./assets/js/library-polish.js?v=spin-today-mobile-v183" defer>'
)
content = content.replace(
    'src="./assets/js/listening-room.js?v=spin-today-mobile-v183">',
    'src="./assets/js/listening-room.js?v=spin-today-mobile-v183" defer>'
)
content = content.replace(
    'src="./assets/js/ranks-polish.js?v=spin-today-mobile-v183">',
    'src="./assets/js/ranks-polish.js?v=spin-today-mobile-v183" defer>'
)
content = content.replace(
    'src="./assets/js/songs.js?v=mobile-genre-stability-v220">',
    'src="./assets/js/songs.js?v=mobile-genre-stability-v220" defer>'
)
content = content.replace(
    'src="./assets/js/genre-identity.js?v=genre-dna-description-v195">',
    'src="./assets/js/genre-identity.js?v=genre-dna-description-v195" defer>'
)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done. Added defer to heavy JS scripts.")
