#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "index.html"

if not target.exists():
    print("index.html missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Add rel="noopener" to all target="_blank" links
content = content.replace('target="_blank">', 'target="_blank" rel="noopener">')

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done. Added rel=\"noopener\" to all target=\"_blank\" links.")
