#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre/assets/js")
files = ["app.js", "visuals.js", "studio-polish.js", "songs.js"]

for fname in files:
    target = repo / fname
    if not target.exists(): continue
    
    with open(target, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add console.warn to bare catches
    content = content.replace('catch {}', 'catch(e){console.warn("DG silent catch", e)}')
    content = content.replace('catch(_) {}', 'catch(_){console.warn("DG silent catch", _)}')
    content = content.replace('catch(err) {}', 'catch(err){console.warn("DG silent catch", err)}')
    
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {fname}")

print("Done.")
