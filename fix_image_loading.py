#!/usr/bin/env python3
import re
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "index.html"

if not target.exists():
    print("index.html missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

def optimize_img(match):
    tag = match.group(0)
    # Skip tags that already have loading="lazy" or are hero/artwork images
    if 'loading="lazy"' in tag or 'class="hero"' in tag or 'class="artwork"' in tag or 'class="bg"' in tag:
        return tag
    # Add loading="lazy"
    tag = tag.replace('<img', '<img loading="lazy"')
    # Add crossorigin="anonymous" to Spotify album art
    if 'i.scdn.co/image/' in tag:
        tag = tag.replace('src="https://i.scdn.co/image/', 'crossorigin="anonymous" src="https://i.scdn.co/image/')
    return tag

content = re.sub(r'<img(?:[^>]+)>', optimize_img, content)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done. Optimized image loading in index.html.")
