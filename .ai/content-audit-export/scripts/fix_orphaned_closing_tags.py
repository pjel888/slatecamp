#!/usr/bin/env python3
"""
Fix Orphaned Closing Tags
Removes orphaned [/SLATECAMP_UI_BLOCK] lines that have no matching opening tag.
Also removes the preceding "Extracted summary:" block if it exists.
"""

import json
import re
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def fix_orphaned_tags(article_dir: Path) -> bool:
    norm_path = article_dir / "normalized.md"
    if not norm_path.exists():
        return False
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    original = content
    lines = content.split('\n')
    new_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if this line is an orphaned closing tag
        if line.strip() == '[/SLATECAMP_UI_BLOCK]':
            # Check if previous non-empty line has opening tag
            prev_non_empty = [l for l in new_lines if l.strip()]
            if prev_non_empty and '[SLATECAMP_UI_BLOCK:' not in prev_non_empty[-1]:
                # This is orphaned - skip it and also remove preceding Extracted summary block if present
                # Look back for Extracted summary block
                j = len(new_lines) - 1
                while j >= 0:
                    if new_lines[j].strip() == 'Extracted summary:':
                        # Remove from Extracted summary to end of this block
                        # Find where the block started
                        start_idx = j
                        # Remove everything from start_idx to end
                        new_lines = new_lines[:start_idx]
                        break
                    elif new_lines[j].strip().startswith('[SLATECAMP_UI_BLOCK:'):
                        # Found an opening tag, don't remove past here
                        break
                    j -= 1
                
                i += 1
                continue
        
        new_lines.append(line)
        i += 1
    
    content = '\n'.join(new_lines)
    
    # Also fix any remaining escaped closing tags
    content = content.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
    
    # Remove double blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(norm_path, 'w') as f:
            f.write(content)
        return True
    
    return False

def main():
    fixed = 0
    failed = 0
    
    for d in EXPORT_DIR.iterdir():
        if not d.is_dir():
            continue
        
        # Skip test articles
        if any(p in d.name for p in ["owner-smoke", "playwright-seeded-quiz", "test-article"]):
            continue
        
        try:
            if fix_orphaned_tags(d):
                fixed += 1
        except Exception as e:
            failed += 1
            print(f"  FAILED: {d.name} — {e}")
    
    print(f"\nFixed: {fixed}, Failed: {failed}")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
