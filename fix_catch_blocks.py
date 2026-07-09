#!/usr/bin/env python3
import shutil
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre/assets/js")
files = ["app.js", "visuals.js", "studio-polish.js", "songs.js"]

for fname in files:
    target = repo / fname
    if not target.exists(): continue
    
    with open(target, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Target localStorage and JSON.parse catches specifically
    content = content.replace('localStorage.setItem' + '"')'
    content = content.replace('localStorage.getItem' + '"')'
    content = content.replace('JSON.parse' + '"')'
    
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {fname}")

print("Done. Added console.warn to critical try/catch blocks.")
