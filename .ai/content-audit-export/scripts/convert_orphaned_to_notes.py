#!/usr/bin/env python3
"""
Fix orphaned placeholder content by converting to raw <Note> components or plain text.

The orphaned content is just "Extracted summary" metadata from a previous parser.
We convert it to meaningful raw MDX <Note> components or remove it if it's redundant.
"""

import json
import re
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def fix_article(article_dir: Path) -> dict:
    result = {"dir": article_dir.name, "fixes": 0, "errors": []}
    
    norm_path = article_dir / "normalized.md"
    if not norm_path.exists():
        result["errors"].append("no normalized.md")
        return result
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    original = content
    
    # Find all orphaned placeholder blocks and convert them
    # Pattern: [SLATECAMP_UI_BLOCK:ui_repaired_XXX component="Note" status="preserved"]
    # Extracted summary:
    # - Props: ...
    # - Text: ACTUAL_CONTENT
    # [/SLATECAMP_UI_BLOCK]
    
    pattern = re.compile(
        r'\[SLATECAMP_UI_BLOCK:ui_repaired_\d+ component="Note" status="preserved"\]\n'
        r'Extracted summary:\n'
        r'- Props:.*?\n'
        r'- Text: (.*?)\n'
        r'\[/SLATECAMP_UI_BLOCK\]',
        re.DOTALL
    )
    
    def replacement(match):
        text = match.group(1).strip()
        if len(text) < 10:
            return ''  # Remove if too short
        # Convert to raw <Note> component
        return f'<Note>\n{text}\n</Note>'
    
    content = pattern.sub(replacement, content)
    
    # Also fix any remaining escaped closing tags
    content = content.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
    
    # Remove double blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(norm_path, 'w') as f:
            f.write(content)
        result["fixes"] = content.count('<Note>') - original.count('<Note>')
        result["changed"] = True
    else:
        result["changed"] = False
    
    return result

def main():
    audit_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/comprehensive-audit-report.json")
    with open(audit_path) as f:
        audit = json.load(f)
    
    render_risk = [r for r in audit['all_results'] if 'corrupted_placeholders' in r['issues']]
    
    print(f"Fixing {len(render_risk)} articles")
    
    results = []
    for r in render_risk:
        article_id = r['article_id']
        dirs = list(EXPORT_DIR.glob(f"*{article_id}*"))
        if not dirs:
            results.append({"article_id": article_id, "error": "dir not found"})
            continue
        
        result = fix_article(dirs[0])
        result["article_id"] = article_id
        results.append(result)
        print(f"  {article_id}: changed={result.get('changed', False)}")
    
    report_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/note-conversion-report.json")
    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)
    
    changed = [r for r in results if r.get('changed')]
    print(f"\nTotal: {len(results)}, Changed: {len(changed)}")

if __name__ == "__main__":
    main()
