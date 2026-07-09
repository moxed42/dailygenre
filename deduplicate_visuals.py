#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def deduplicate_visuals(input_path: Path, output_path: Path) -> None:
    """
    Remove duplicate function definitions from visuals.js.
    Keeps the latest (last) version of each duplicate function.
    """
    content = input_path.read_text(encoding='utf-8')
    
    # Define functions to deduplicate
    target_functions = [
        'statsPolishApply',
        'renderVisualDrilldown',
    ]
    
    # Pattern to match function declarations (handles both regular and arrow functions)
    # This is a simplified approach — we look for the function keyword or arrow assignment
    for func_name in target_functions:
        # Find all occurrences of function declarations
        pattern = rf'(function\s+{func_name}\s*\([^)]*\)\s*{{|{func_name}\s*=\s*function\s*{func_name}\s*\([^)]*\)\s*{{)'
        matches = list(re.finditer(pattern, content))
        
        if len(matches) > 1:
            # Keep the last occurrence, remove the earlier ones
            # We'll remove the function body up to the next function declaration
            for match in reversed(matches[:-1]):
                start = match.start()
                # Find the closing brace of this function
                brace_count = 0
                in_string = False
                escape_next = False
                for i, char in enumerate(content[start:]):
                    if escape_next:
                        escape_next = False
                        continue
                    if char == '\\' and in_string:
                        escape_next = True
                        continue
                    if char in ('"', "'", '`') and not escape_next:
                        in_string = not in_string
                        continue
                    if not in_string:
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                # Found the end of the function
                                end = start + i + 1
                                # Remove this function definition
                                content = content[:start] + content[end:]
                                break
                else:
                    # If we didn't find the closing brace, try a simpler approach
                    # Look for the next function declaration
                    next_func = re.search(r'(function\s+\w+\s*\([^)]*\)\s*{|const\s+\w+\s*=\s*function)', content[start:])
                    if next_func:
                        end = start + next_func.start()
                        content = content[:start] + content[end:]
                    else:
                        # Fallback: remove up to a reasonable point
                        print(f"Warning: Could not find end of {func_name} function at position {start}")
                break  # Only remove the first (earliest) occurrence
    
    # Write the deduplicated content
    output_path.write_text(content, encoding='utf-8')
    print(f"Processed {input_path} -> {output_path}")
    print(f"Original size: {input_path.stat().st_size} bytes")
    print(f"Deduplicated size: {output_path.stat().st_size} bytes")

if __name__ == '__main__':
    repo_root = Path('/Users/sam/Code/dailygenre')
    js_dir = repo_root / 'assets' / 'js'
    input_file = js_dir / 'visuals.js'
    output_file = js_dir / 'visuals.js.deduplicated'
    
    if not input_file.exists():
        print(f"Input file not found: {input_file}")
        sys.exit(1)
    
    # Create backup
    backup_file = js_dir / 'visuals.js.bak'
    input_file.rename(backup_file)
    print(f"Backup created: {backup_file}")
    
    deduplicate_visuals(input_file, output_file)
    
    # Rename the deduplicated file to replace the original
    output_file.rename(input_file)
    print("Done! Deduplicated file is now in place.")
