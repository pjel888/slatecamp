#!/usr/bin/env python3
"""
Repair corrupted placeholders in normalized.md files.

Corruption patterns fixed:
1. Missing opening bracket: \\nExtracted summary: -> [SLATECAMP_UI_BLOCK:ui_XXXX ...]\nExtracted summary:
2. Escaped closing tag: \\[/SLATECAMP_UI_BLOCK\\] -> [/SLATECAMP_UI_BLOCK]
3. Double-escaped content inside props
"""

import json
import re
import os
import glob
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def repair_normalized_md(article_dir: Path) -> dict:
    result = {"dir": article_dir.name, "repairs": 0, "errors": []}
    
    norm_path = article_dir / "normalized.md"
    if not norm_path.exists():
        result["errors"].append("no normalized.md")
        return result
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    original = content
    repairs = 0
    
    # Pattern 1: Lines starting with backslash followed by "Extracted summary:" or "Props:"
    # This indicates a missing [SLATECAMP_UI_BLOCK:ui_XXXX opening
    # We need to find these and wrap them properly
    
    # Find all escaped closing tags
    escaped_closes = list(re.finditer(r'\\\[/SLATECAMP_UI_BLOCK\\\]', content))
    
    for match in escaped_closes:
        end_pos = match.end()
        # Look backwards to find the start of this block
        # The block should start with [SLATECAMP_UI_BLOCK:ui_XXXX
        # But it might be corrupted. Look for the nearest preceding \n\ or \nExtracted
        search_start = max(0, end_pos - 500)
        segment = content[search_start:end_pos]
        
        # Check if there's a proper opening bracket before this
        last_open = segment.rfind('[SLATECAMP_UI_BLOCK:')
        if last_open == -1 or (search_start + last_open) < search_start:
            # No proper opening found - this is a fully corrupted block
            # Find the start by looking for "Extracted summary:" or "Props:" or "Text:"
            start_patterns = ['\\n\\Extracted summary:', '\\nExtracted summary:', '\\n\\Props:', '\\n\\Text:']
            start_pos = -1
            for pat in start_patterns:
                pos = segment.find(pat)
                if pos != -1:
                    start_pos = search_start + pos
                    break
            
            if start_pos != -1:
                # We found the start. Now we need to figure out what block_id to use.
                # Check if there's a ui-blocks.json we can reference
                ui_path = article_dir / "ui-blocks.json"
                block_id = None
                if ui_path.exists():
                    with open(ui_path) as f:
                        ui = json.load(f)
                    blocks = ui.get("blocks", [])
                    # Find a block whose raw content matches this segment
                    for b in blocks:
                        raw = b.get("raw", "")
                        if raw and any(marker in segment for marker in [raw[:50], raw.split('\\n')[0] if raw else ""]):
                            block_id = b.get("block_id")
                            break
                
                if not block_id:
                    # Generate a fallback block_id
                    block_id = "ui_repaired"
                
                # Reconstruct the placeholder
                # The segment from start_pos to end_pos needs to be wrapped
                old_segment = content[start_pos:end_pos + len(match.group(0))]
                
                # Clean up the segment: remove leading backslashes, fix escaped closing
                cleaned = old_segment.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
                cleaned = re.sub(r'^\\\s*', '', cleaned)
                
                # Wrap with proper placeholder
                new_segment = f'[SLATECAMP_UI_BLOCK:{block_id} component="Note" status="preserved"]\n{cleaned}\n[/SLATECAMP_UI_BLOCK]'
                
                content = content[:start_pos] + new_segment + content[end_pos + len(match.group(0)):]
                repairs += 1
    
    # Pattern 2: Fix any remaining escaped closing tags
    content = content.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
    
    # Pattern 3: Fix double-escaped props content (\\" -> ")
    content = content.replace('\\\\"', '"')
    
    # Pattern 4: Fix lines that start with backslash before component content
    # e.g., "\ component=\"Note\"..." -> " component=\"Note\"..."
    content = re.sub(r'\n\\\s+(component=|Text:|Props:|Extracted summary:)', r'\n\1', content)
    
    if content != original:
        with open(norm_path, 'w') as f:
            f.write(content)
        result["repairs"] = repairs
        result["changed"] = True
    else:
        result["changed"] = False
    
    return result

def main():
    # Load audit report to find render-risk articles
    audit_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/comprehensive-audit-report.json")
    with open(audit_path) as f:
        audit = json.load(f)
    
    render_risk = [r for r in audit['all_results'] if 'corrupted_placeholders' in r['issues']]
    
    print(f"Repairing {len(render_risk)} articles with corrupted placeholders")
    
    results = []
    for r in render_risk:
        article_id = r['article_id']
        # Find directory
        dirs = list(EXPORT_DIR.glob(f"*{article_id}*"))
        if not dirs:
            results.append({"article_id": article_id, "error": "dir not found"})
            continue
        
        result = repair_normalized_md(dirs[0])
        result["article_id"] = article_id
        results.append(result)
        print(f"  {article_id}: repairs={result['repairs']}, changed={result.get('changed', False)}")
    
    # Save report
    report_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/placeholder-repair-report.json")
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    
    changed = [r for r in results if r.get('changed')]
    print(f"\nTotal: {len(results)}, Changed: {len(changed)}")
    print(f"Report: {report_path}")

if __name__ == "__main__":
    main()
