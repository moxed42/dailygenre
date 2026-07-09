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
    content = f.read()

# 1. Fix setListeningFocusMode scroll restoration
old_scroll_1 = """        restoreListeningToggleScroll();
        requestAnimationFrame(() => {
          restoreListeningToggleScroll();
          requestAnimationFrame(restoreListeningToggleScroll());
        });
        setTimeout(() => {
          if (typeof enhanceSongListeningExperience === 'function') enhanceSongListeningExperience();
          if (typeof hydrateAlbumDiveAmbient === 'function') hydrateAlbumDiveAmbient();
          restoreListeningToggleScroll();
        }, 0);
        [40, 120, 260, 520, 900].forEach(delay => setTimeout(restoreListeningToggleScroll, delay));
        setTimeout(() => { document.documentElement.style.scrollBehavior = previousBehavior; }, 940);"""

new_scroll_1 = """        restoreListeningToggleScroll();
        requestAnimationFrame(() => {
          if (typeof enhanceSongListeningExperience === 'function') enhanceSongListeningExperience();
          if (typeof hydrateAlbumDiveAmbient === 'function') hydrateAlbumDiveAmbient();
          restoreListeningToggleScroll();
        });"""

content = content.replace(old_scroll_1, new_scroll_1)

# 2. Fix albumDivePreserveViewport scroll restoration
old_scroll_2 = """    setTimeout(restore, 0);
    setTimeout(restore, 40);
    setTimeout(restore, 120);
    setTimeout(restore, 260);
    setTimeout(() => { restore(); release(); }, 520);"""

new_scroll_2 = """    restore();
    requestAnimationFrame(restore);
    release();"""

content = content.replace(old_scroll_2, new_scroll_2)

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. Scroll restoration simplified successfully.")
