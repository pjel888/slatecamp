#!/usr/bin/env python3
"""
Fix orphaned placeholder content in normalized.md.

Finds "Extracted summary:" lines that are NOT inside [SLATECAMP_UI_BLOCK:...]...
[/SLATECAMP_UI_BLOCK] and wraps them properly.
Also removes orphaned [/SLATECAMP_UI_BLOCK] tags without openings.
"""

import json
import re
import os
import glob
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def fix_orphaned_placeholders(article_dir: Path) -> dict:
    result = {"dir": article_dir.name, "fixes": 0, "errors": []}
    
    norm_path = article_dir / "normalized.md"
    ui_path = article_dir / "ui-blocks.json"
    
    if not norm_path.exists():
        result["errors"].append("no normalized.md")
        return result
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    original = content
    
    # Find all orphaned "Extracted summary:" blocks
    # These appear as:
    # Extracted summary:
    # - Props: ...
    # - Text: ...
    # [/SLATECAMP_UI_BLOCK]
    # 
    # But without a preceding [SLATECAMP_UI_BLOCK:ui_XXXX ...]
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    fixes = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if this is an orphaned "Extracted summary:"
        if line.strip() == 'Extracted summary:' and (i == 0 or '[SLATECAMP_UI_BLOCK' not in lines[i-1]):
            # This is orphaned. Collect the block content.
            block_lines = [line]
            j = i + 1
            while j < len(lines):
                next_line = lines[j]
                if next_line.strip() == '[/SLATECAMP_UI_BLOCK]' or next_line.strip() == '\\[/SLATECAMP_UI_BLOCK\\]':
                    block_lines.append('[/SLATECAMP_UI_BLOCK]')
                    j += 1
                    break
                elif next_line.startswith('## ') or next_line.startswith('# '):
                    # Reached next section without finding close
                    break
                else:
                    block_lines.append(next_line)
                    j += 1
            
            # Wrap with placeholder
            block_id = f"ui_repaired_{fixes:03d}"
            wrapped = [f'[SLATECAMP_UI_BLOCK:{block_id} component="Note" status="preserved"]'] + block_lines
            new_lines.extend(wrapped)
            i = j
            fixes += 1
        elif line.strip() == '[/SLATECAMP_UI_BLOCK]' and (i == 0 or '[SLATECAMP_UI_BLOCK' not in lines[i-1]):
            # Orphaned closing tag without opening - skip it
            i += 1
        else:
            new_lines.append(line)
            i += 1
    
    content = '\n'.join(new_lines)
    
    # Also fix escaped closing tags
    content = content.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
    
    # Remove double blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(norm_path, 'w') as f:
            f.write(content)
        result["fixes"] = fixes
        result["changed"] = True
    else:
        result["changed"] = False
    
    return result

def main():
    audit_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/comprehensive-audit-report.json")
    with open(audit_path) as f:
        audit = json.load(f)
    
    render_risk = [r for r in audit['all_results'] if 'corrupted_placeholders' in r['issues']]
    
    print(f"Fixing {len(render_risk)} articles with orphaned placeholders")
    
    results = []
    for r in render_risk:
        article_id = r['article_id']
        dirs = list(EXPORT_DIR.glob(f"*{article_id}*"))
        if not dirs:
            results.append({"article_id": article_id, "error": "dir not found"})
            continue
        
        result = fix_orphaned_placeholders(dirs[0])
        result["article_id"] = article_id
        results.append(result)
        print(f"  {article_id}: fixes={result['fixes']}, changed={result.get('changed', False)}")
    
    report_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/orphan-repair-report.json")
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    
    changed = [r for r in results if r.get('changed')]
    print(f"\nTotal: {len(results)}, Changed: {len(changed)}")
    print(f"Report: {report_path}")

if __name__ == "__main__":
    main()
