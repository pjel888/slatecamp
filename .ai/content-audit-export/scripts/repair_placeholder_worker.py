#!/usr/bin/env python3
"""
Placeholder Repair Worker
Repairs corrupted [SLATECAMP_UI_BLOCK:...] placeholders in normalized.md.
Usage: python repair_placeholder_worker.py <article_id>
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

def repair_placeholders(article_dir: Path) -> bool:
    norm_path = article_dir / "normalized.md"
    ui_path = article_dir / "ui-blocks.json"
    
    if not norm_path.exists():
        return False
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    original = content
    
    # Fix 1: Remove orphaned Extracted summary blocks that aren't inside placeholders
    # Convert them to raw <Note> components
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip() == 'Extracted summary:' and (i == 0 or '[SLATECAMP_UI_BLOCK' not in lines[i-1]):
            block_lines = [line]
            j = i + 1
            while j < len(lines):
                next_line = lines[j]
                if next_line.strip() in ['[/SLATECAMP_UI_BLOCK]', '\\[/SLATECAMP_UI_BLOCK\\]']:
                    j += 1
                    break
                elif next_line.startswith('## ') or next_line.startswith('# '):
                    break
                else:
                    block_lines.append(next_line)
                    j += 1
            
            # Extract text content
            text_lines = []
            for bl in block_lines:
                if bl.startswith('- Text:'):
                    text_lines.append(bl[7:].strip())
                elif bl.startswith('- Props:') or bl.strip() == 'Extracted summary:':
                    continue
                else:
                    text_lines.append(bl)
            
            text = '\n'.join(text_lines).strip()
            if len(text) > 10:
                new_lines.append(f'<Note>')
                new_lines.append(text)
                new_lines.append(f'</Note>')
            i = j
        elif line.strip() in ['[/SLATECAMP_UI_BLOCK]', '\\[/SLATECAMP_UI_BLOCK\\]'] and (i == 0 or '[SLATECAMP_UI_BLOCK' not in lines[i-1]):
            i += 1  # Skip orphaned closing tags
        else:
            new_lines.append(line)
            i += 1
    
    content = '\n'.join(new_lines)
    
    # Fix 2: Remove escaped closing tags
    content = content.replace('\\[/SLATECAMP_UI_BLOCK\\]', '[/SLATECAMP_UI_BLOCK]')
    
    # Fix 3: Remove double blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(norm_path, 'w') as f:
            f.write(content)
    
    return True

def compose_and_push(article_id: str) -> bool:
    # Compose
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
    
    # Push
    result = subprocess.run(
        ["bun", "run", "content-audit:push:apply", "--", "--article-id", article_id],
        capture_output=True,
        text=True,
        timeout=60,
        cwd="/Users/philiplewis/slatecamp"
    )
    if result.returncode != 0:
        # Try direct push for large articles
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
        print("Usage: python repair_placeholder_worker.py <article_id>")
        sys.exit(1)
    
    article_id = sys.argv[1]
    article_dir = find_article_dir(article_id)
    
    if not article_dir:
        print(f"DIR_NOT_FOUND: {article_id}")
        sys.exit(1)
    
    if not repair_placeholders(article_dir):
        print(f"REPAIR_FAILED: {article_id}")
        sys.exit(1)
    
    if not compose_and_push(article_id):
        print(f"PUSH_FAILED: {article_id}")
        sys.exit(1)
    
    print(f"SUCCESS: {article_id}")

if __name__ == "__main__":
    main()
