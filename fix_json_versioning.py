#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "index.html"

if not target.exists():
    print("index.html missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Add versioning to genres_data.json
content = content.replace(
    'src="./genres_data.json">',
    'src="./genres_data.json?v=2026.07.08">',
)
print("Done. Added versioning to genres_data.json in index.html.")
