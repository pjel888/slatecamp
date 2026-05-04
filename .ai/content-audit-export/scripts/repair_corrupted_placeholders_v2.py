#!/usr/bin/env python3
"""
Repair corrupted placeholders using ui-blocks.json placeholder field.

For each block in ui-blocks.json, find its placeholder in normalized.md
and ensure it's properly formatted. If the placeholder is corrupted,
replace it with the correct version from ui-blocks.json.
"""

import json
import os
import re
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def repair_article(article_dir: Path) -> dict:
    result = {"dir": article_dir.name, "repairs": 0, "errors": []}
    
    norm_path = article_dir / "normalized.md"
    ui_path = article_dir / "ui-blocks.json"
    
    if not norm_path.exists():
        result["errors"].append("no normalized.md")
        return result
    if not ui_path.exists():
        result["errors"].append("no ui-blocks.json")
        return result
    
    with open(norm_path, 'r') as f:
        normalized = f.read()
    
    with open(ui_path, 'r') as f:
        ui = json.load(f)
    
    blocks = ui.get("blocks", [])
    if not isinstance(blocks, list):
        result["errors"].append("invalid blocks")
        return result
    
    repairs = 0
    for block in blocks:
        block_id = block.get("block_id")
        placeholder = block.get("placeholder", "")
        
        if not placeholder or not block_id:
            continue
        
        # Check if the exact placeholder exists in normalized.md
        if placeholder in normalized:
            continue  # Already correct
        
        # Try to find a corrupted version of this placeholder
        # Extract the "Extracted summary" part as a fingerprint
        fingerprint = None
        lines = placeholder.split('\n')
        for line in lines:
            if line.startswith('- Text:') and len(line) > 10:
                fingerprint = line[7:].strip()[:80]
                break
            if line.startswith('- Props:') and len(line) > 10:
                fingerprint = line[8:].strip()[:80]
                break
        
        if not fingerprint:
            continue
        
        # Search for the fingerprint in normalized.md
        if fingerprint in normalized:
            # Find the surrounding corrupted placeholder
            pos = normalized.find(fingerprint)
            # Expand to find the start and end of the corrupted block
            start = normalized.rfind('\n', 0, pos)
            if start == -1:
                start = 0
            else:
                start += 1
            
            # Look for the end marker [/SLATECAMP_UI_BLOCK] or escaped version
            end_markers = ['[/SLATECAMP_UI_BLOCK]', '\\[/SLATECAMP_UI_BLOCK\\]']
            end = -1
            for marker in end_markers:
                candidate = normalized.find(marker, pos)
                if candidate != -1:
                    end = candidate + len(marker)
                    break
            
            if end != -1:
                old_block = normalized[start:end]
                # Replace with correct placeholder
                normalized = normalized[:start] + placeholder + normalized[end:]
                repairs += 1
                result["repairs"] = repairs
    
    # Also fix any remaining escaped closing tags globally
    normalized = normalized.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
    
    with open(norm_path, 'w') as f:
        f.write(normalized)
    
    result["changed"] = True
    return result

def main():
    # Load audit report
    audit_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/comprehensive-audit-report.json")
    with open(audit_path) as f:
        audit = json.load(f)
    
    render_risk = [r for r in audit['all_results'] if 'corrupted_placeholders' in r['issues']]
    
    print(f"Repairing {len(render_risk)} articles with corrupted placeholders")
    
    results = []
    for r in render_risk:
        article_id = r['article_id']
        dirs = list(EXPORT_DIR.glob(f"*{article_id}*"))
        if not dirs:
            results.append({"article_id": article_id, "error": "dir not found"})
            continue
        
        result = repair_article(dirs[0])
        result["article_id"] = article_id
        results.append(result)
        print(f"  {article_id}: repairs={result['repairs']}, errors={result['errors']}")
    
    report_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/placeholder-repair-report-v2.json")
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    
    changed = [r for r in results if r.get('repairs', 0) > 0]
    print(f"\nTotal: {len(results)}, Repaired: {len(changed)}")
    print(f"Report: {report_path}")

if __name__ == "__main__":
    main()
