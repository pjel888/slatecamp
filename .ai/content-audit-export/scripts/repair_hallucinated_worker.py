#!/usr/bin/env python3
"""
Hallucinated Component Repair Worker
Detects unsupported components and replaces with valid equivalents.
Usage: python repair_hallucinated_worker.py <article_id>
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

REPLACEMENT_MAP = {
    "DefinitionList": "KeyValues",
    "FormulaCard": "Note",
    "Formula": "Note",
    "Variables": "Note",
    "KeyTakeaway": "Tip",
    "Checklist": "Note",
    "InfoBox": "Callout",
    "TechnicalBox": "Callout",
    "DataTable": "ComparisonTable",
    "LeartBox": "Callout",
    "Leart": "Callout",
    "JSX": "Note",
    "details": "Accordion",
    "summary": "AccordionItem",
}

def find_article_dir(article_id: str) -> Path:
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None

def repair_hallucinated(article_dir: Path) -> bool:
    norm_path = article_dir / "normalized.md"
    ui_path = article_dir / "ui-blocks.json"
    
    if not norm_path.exists():
        return False
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    original = content
    
    # Find all component tags in normalized.md
    pattern = re.compile(r'<([A-Z][a-zA-Z0-9]*)[^/>]*>')
    found_tags = set(pattern.findall(content))
    
    hallucinated = found_tags - VALID_COMPONENTS
    
    for bad in hallucinated:
        replacement = REPLACEMENT_MAP.get(bad, "Note")
        # Replace opening tags
        content = re.sub(rf'<{bad}\b[^/>]*>', f'<{replacement}>', content)
        # Replace closing tags
        content = re.sub(rf'</{bad}>', f'</{replacement}>', content)
    
    if content != original:
        with open(norm_path, 'w') as f:
            f.write(content)
    
    # Also fix ui-blocks.json
    if ui_path.exists():
        with open(ui_path, 'r') as f:
            ui = json.load(f)
        
        blocks = ui.get("blocks", [])
        if isinstance(blocks, list):
            for b in blocks:
                comp = b.get("component_name", "")
                if comp in REPLACEMENT_MAP:
                    b["component_name"] = REPLACEMENT_MAP[comp]
            
            with open(ui_path, 'w') as f:
                json.dump(ui, f, indent=2)
    
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
        print("Usage: python repair_hallucinated_worker.py <article_id>")
        sys.exit(1)
    
    article_id = sys.argv[1]
    article_dir = find_article_dir(article_id)
    
    if not article_dir:
        print(f"DIR_NOT_FOUND: {article_id}")
        sys.exit(1)
    
    if not repair_hallucinated(article_dir):
        print(f"REPAIR_FAILED: {article_id}")
        sys.exit(1)
    
    if not compose_and_push(article_id):
        print(f"PUSH_FAILED: {article_id}")
        sys.exit(1)
    
    print(f"SUCCESS: {article_id}")

if __name__ == "__main__":
    main()
