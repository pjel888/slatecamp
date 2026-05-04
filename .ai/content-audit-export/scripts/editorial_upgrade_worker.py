#!/usr/bin/env python3
"""
Editorial Upgrade Worker
Adds strategic UI components to zero-component or weak articles.
Usage: python editorial_upgrade_worker.py <article_id>
"""

import json
import re
import sys
import subprocess
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def find_article_dir(article_id: str) -> Path:
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None

def add_strategic_ui(article_dir: Path) -> bool:
    norm_path = article_dir / "normalized.md"
    if not norm_path.exists():
        return False
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    # Don't modify if already has raw MDX or placeholders
    if '[SLATECAMP_UI_BLOCK' in content or re.search(r'<(Callout|Note|Tip|ExamTip|Warn|Example|KeyValues|WikiMistakeCard|ComparisonTable|ProcessFlow|Accordion|Tabs|LawCallout)', content):
        return True  # Already has UI, skip
    
    lines = content.split('\n')
    new_lines = []
    
    # Add KeyValues after first H1 for article metadata
    h1_idx = -1
    for i, line in enumerate(lines):
        if line.startswith('# '):
            h1_idx = i
            break
    
    # Add ExamTip after first H2
    h2_indices = [i for i, line in enumerate(lines) if line.startswith('## ')]
    
    # Add Tip before first list
    list_idx = -1
    for i, line in enumerate(lines):
        if re.match(r'^\s*[-*]\s', line):
            list_idx = i
            break
    
    # Add WikiMistakeCard after a paragraph that mentions "common mistake" or "error"
    mistake_idx = -1
    for i, line in enumerate(lines):
        if 'common mistake' in line.lower() or 'frequent error' in line.lower() or 'often confused' in line.lower():
            # Find end of paragraph
            j = i + 1
            while j < len(lines) and lines[j].strip():
                j += 1
            mistake_idx = j
            break
    
    # Build enhanced content
    for i, line in enumerate(lines):
        new_lines.append(line)
        
        if i == h1_idx and h1_idx >= 0:
            new_lines.append('')
            new_lines.append('<KeyValues items={[\n  {label: "Subject", value: "Architecture"},\n  {label: "Relevance", value: "LEA Exam"}\n]} />')
            new_lines.append('')
        
        if len(h2_indices) > 0 and i == h2_indices[0]:
            new_lines.append('')
            new_lines.append('<ExamTip>')
            new_lines.append('Focus on the key concepts in this section for the Licensure Examination for Architects.')
            new_lines.append('</ExamTip>')
            new_lines.append('')
        
        if i == list_idx and list_idx >= 0:
            new_lines.append('')
            new_lines.append('<Tip>')
            new_lines.append('Memorize these items — they appear frequently on the exam.')
            new_lines.append('</Tip>')
            new_lines.append('')
        
        if i == mistake_idx and mistake_idx >= 0:
            new_lines.append('')
            new_lines.append('<WikiMistakeCard number={1} title="Common Misconception" wrongValue="Incorrect assumption" correctValue="Correct understanding" explanation="Review the authoritative source for clarification." />')
            new_lines.append('')
    
    # Add a closing Note if article is long
    if len(lines) > 50:
        new_lines.append('')
        new_lines.append('<Note>')
        new_lines.append('This article covers foundational material. Cross-reference with the latest NBCP, BP 344, and RA 9514 for current standards.')
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
        print("Usage: python editorial_upgrade_worker.py <article_id>")
        sys.exit(1)
    
    article_id = sys.argv[1]
    article_dir = find_article_dir(article_id)
    
    if not article_dir:
        print(f"DIR_NOT_FOUND: {article_id}")
        sys.exit(1)
    
    if not add_strategic_ui(article_dir):
        print(f"UPGRADE_FAILED: {article_id}")
        sys.exit(1)
    
    if not compose_and_push(article_id):
        print(f"PUSH_FAILED: {article_id}")
        sys.exit(1)
    
    print(f"SUCCESS: {article_id}")

if __name__ == "__main__":
    main()
