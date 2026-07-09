#!/usr/bin/env python3
import re
import shutil
from pathlib import Path

repo = Path("/Users/sam/Code/dailygenre")
target = repo / "assets/js/visuals.js"
backup = target.with_suffix(".js.bak")

if not target.exists():
    print("File missing. Restoring backup...")
    if backup.exists():
        shutil.move(backup, target)
    else:
        print("Both file and backup missing!")
        exit(1)

# 1. Create a fresh backup before touching anything
shutil.copy2(target, backup)
print(f"Backup saved to {backup}")

# 2. Read the file
with open(target, 'r', encoding='utf-8') as f:
    content = f.read()

# 3. Find and remove duplicate function definitions
targets = ['statsPolishApply', 'renderVisualDrilldown']

for func_name in targets:
    # Look for function declarations or assignments
    pattern = re.compile(rf'(\/\*.*?\*\/\s*function\s+{func_name}\s*\([^)]*\)\s*\{{|function\s+{func_name}\s*\([^)]*\)\s*\{{|{func_name}\s*=\s*function\s+{func_name}\s*\([^)]*\)\s*\{{)', re.DOTALL)
    matches = list(pattern.finditer(content))
    
    if len(matches) > 1:
        print(f"Found {len(matches)} definitions for {func_name}. Keeping the latest version.")
        # Process backwards so earlier deletions don't mess up line numbers
        for match in reversed(matches[:-1]):
            start = match.start()
            depth = 0
            end_idx = -1
            # Find the matching closing brace
            for i, char in enumerate(content[start:]):
                if char == '{': depth += 1
                elif char == '}': 
                    depth -= 1
                    if depth == 0:
                        end_idx = start + i + 1
                        break
            if end_idx != -1:
                content = content[:start] + content[end_idx:]
            else:
                print(f"Warning: Could not find end of {func_name} block.")
    else:
        print(f"{func_name} is already unique.")

# 4. Write the cleaned file back
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. File deduplicated successfully.")
