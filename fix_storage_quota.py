#!/usr/bin/env python3
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre/assets/js")

target = repo / "app.js"
if not target.exists():
    print("app.js missing. Exiting.")
    exit(1)

with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# Inject safe localStorage wrapper near the top of app.js
injection = """
/* v222: Safe localStorage wrapper to prevent silent QuotaExceededError on mobile Safari */
const _DG_ORIG_LS_SETITEM = localStorage.setItem;
const _DG_ORIG_LS_GETITEM = localStorage.getItem;
const _DG_ORIG_LS_REMOVEITEM = localStorage.removeItem;
localStorage.setItem = function(key, value) {
  try { _DG_ORIG_LS_SETITEM.apply(this, arguments); }
  catch(e) { console.warn("[DG] localStorage quota full:", key, e.message || e); }
}
localStorage.getItem = function(key) {
  try { return _DG_ORIG_LS_GETITEM.apply(this, arguments); }
  catch(e) { console.warn("[DG] localStorage read error:", key, e.message || e); return null; }
}
localStorage.removeItem = function(key) {
  try { _DG_ORIG_LS_REMOVEITEM.apply(this, arguments); }
  catch(e) { console.warn("[DG] localStorage remove error:", key, e.message || e); }
}
"""

if "/* v222: Safe localStorage wrapper" in content:
    print("localStorage wrapper already applied.")
else:
    content = injection + content
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done. localStorage quota guard added to app.js.")
