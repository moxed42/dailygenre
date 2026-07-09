#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre/assets/css")
target = repo / "styles.css"
if not target.exists():
    print("styles.css missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Add content-visibility to .screen and .list-item
# .screen is huge, .list-item is often repeated.

if ".screen.active { display:block; }" in content:
    content = content.replace(
        ".screen.active { display:block; }",
        ".screen.active { display:block; }\n\n/* v223: Performance: content-visibility to lazy-render heavy screens */\n.screen { content-visibility: auto; contain-intrinsic-size: auto 60vh; }\n.list-item { content-visibility: auto; contain-intrinsic-size: auto 60px; }"
    )
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done. Content-visibility added to styles.css.")
else:
    print("Could not find anchor in styles.css.")
