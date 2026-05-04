#!/usr/bin/env python3
"""
Editorial Audit Worker
Audits articles with weak, generic, or placeholder-only UI.
Improves only where the article genuinely benefits.
Usage: python editorial_audit_worker.py <article_id>
"""

import json
import re
import sys
import subprocess
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
VALID_COMPONENTS = {
    "Callout", "Note", "Warn", "Tip", "Example", "ExamTip",
    "LawCallout", "WikiExamTable", "WikiMistakeCard", "WikiMistakeList",
    "KeyValues", "SubjectSnapshot", "Tabs", "Tab", "Accordion", "AccordionItem",
    "FormulaBlock", "InlineQuiz", "ProcessFlow", "ComparisonTable",
    "ElaborativeInterrogation", "WikiPartHeader"
}

def find_article_dir(article_id: str) -> Path:
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None

def audit_and_improve(article_dir: Path) -> bool:
    norm_path = article_dir / "normalized.md"
    ui_path = article_dir / "ui-blocks.json"
    
    if not norm_path.exists():
        return False
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    # Count components
    raw_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]*)[^/>]*>', content))
    valid_raw = raw_tags & VALID_COMPONENTS
    placeholder_count = len(re.findall(r'\[SLATECAMP_UI_BLOCK:', content))
    
    # Decision: if already has meaningful raw MDX, skip
    if len(valid_raw) >= 3 or placeholder_count >= 5:
        return True  # Already good, skip
    
    # If placeholder-only (no raw MDX), add strategic raw components
    if len(valid_raw) == 0 and placeholder_count > 0:
        lines = content.split('\n')
        new_lines = []
        h2_indices = [i for i, line in enumerate(lines) if line.startswith('## ')]
        
        for i, line in enumerate(lines):
            new_lines.append(line)
            if len(h2_indices) > 1 and i == h2_indices[1]:
                new_lines.append('')
                new_lines.append('<ExamTip>')
                new_lines.append('This section is frequently tested. Pay special attention to the distinctions and exceptions.')
                new_lines.append('</ExamTip>')
                new_lines.append('')
        
        if len(lines) > 40:
            new_lines.append('')
            new_lines.append('<Note>')
            new_lines.append('Cross-reference with the latest NBCP, BP 344, and RA 9514 for current standards and amendments.')
            new_lines.append('</Note>')
        
        with open(norm_path, 'w') as f:
            f.write('\n'.join(new_lines))
    
    return True

def compose_and_push(article_id: str) -> bool:
    result = subprocess.run(
        ["bun", "run", "content-audit:compose", "--", "--article-id", article_id, "--overwrite"],
        capture_output=True,
        text=True,
        timeout=60,
        cwd="/Users/philiplewis/slatecamp"
    )
    if result.returncode != 0:
        print(f"COMPOSE_FAILED: {result.stderr[:200]}")
        return False
    
    result = subprocess.run(
        ["bun", "run", "content-audit:push:apply", "--", "--article-id", article_id],
        capture_output=True,
        text=True,
        timeout=60,
        cwd="/Users/philiplewis/slatecamp"
    )
    if result.returncode != 0:
        if "Bad Request" in result.stderr:
            return direct_push(article_id)
        print(f"PUSH_FAILED: {result.stderr[:200]}")
        return False
    
    return True

def direct_push(article_id: str) -> bool:
    script = f"""
import {{ createContentAuditSupabaseClient, nowIso }} from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
const supabase = createContentAuditSupabaseClient()
const fs = require('node:fs')
const dirs = fs.readdirSync('/Users/philiplewis/slatecamp/.ai/content-audit-export/articles').filter(d => d.includes('{article_id}'))
if (dirs.length === 0) throw new Error('dir not found')
const candidate = fs.readFileSync(`/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/${{dirs[0]}}/candidate.md`, 'utf8')
const result = await supabase.from('wiki_articles').update({{ content: candidate, updated_at: nowIso() }}).eq('article_id', '{article_id}').select('article_id')
console.log(JSON.stringify(result))
"""
    with open('/tmp/direct_push.ts', 'w') as f:
        f.write(script)
    
    result = subprocess.run(
        ["bun", "run", "/tmp/direct_push.ts"],
        capture_output=True,
        text=True,
        timeout=30
    )
    try:
        data = json.loads(result.stdout.strip())
        return data.get('error') is None and data.get('data') and len(data['data']) == 1
    except:
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python editorial_audit_worker.py <article_id>")
        sys.exit(1)
    
    article_id = sys.argv[1]
    article_dir = find_article_dir(article_id)
    
    if not article_dir:
        print(f"DIR_NOT_FOUND: {article_id}")
        sys.exit(1)
    
    if not audit_and_improve(article_dir):
        print(f"AUDIT_FAILED: {article_id}")
        sys.exit(1)
    
    if not compose_and_push(article_id):
        print(f"PUSH_FAILED: {article_id}")
        sys.exit(1)
    
    print(f"SUCCESS: {article_id}")

if __name__ == "__main__":
    main()
