#!/usr/bin/env python3
"""
Comprehensive Corpus Audit
Scans all 567 articles and classifies them into processing queues.
Outputs: queue files in .ai/content-audit-export/queues/
"""

import json
import os
import re
import glob
from pathlib import Path
from collections import Counter

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
QUEUES_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/queues")
LOCKS_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/locks")

VALID_COMPONENTS = {
    "Callout", "Note", "Warn", "Tip", "Example", "ExamTip",
    "LawCallout", "WikiExamTable", "WikiMistakeCard", "WikiMistakeList",
    "KeyValues", "SubjectSnapshot", "Tabs", "Tab", "Accordion", "AccordionItem",
    "FormulaBlock", "InlineQuiz", "ProcessFlow", "ComparisonTable",
    "ElaborativeInterrogation", "WikiPartHeader"
}

def sha256(content: str) -> str:
    import hashlib
    return f"sha256:{hashlib.sha256(content.encode('utf-8')).hexdigest()}"

def audit_article(article_dir: Path) -> dict:
    result = {
        "article_id": None,
        "slug": None,
        "dir": article_dir.name,
        "issues": [],
        "priority": "low",
        "ui_blocks": 0,
        "components": {},
        "has_corrupted_placeholders": False,
        "has_stale_baseline": False,
        "has_no_op": False,
        "has_hallucinated": False,
        "has_raw_mdx": False,
        "has_orphaned_placeholders": False,
        "assessment": "unknown",
    }
    
    meta_path = article_dir / "article-metadata.json"
    if meta_path.exists():
        with open(meta_path) as f:
            meta = json.load(f)
        result["article_id"] = meta.get("article_id")
        result["slug"] = meta.get("slug")
    
    norm_path = article_dir / "normalized.md"
    normalized = ""
    if norm_path.exists():
        with open(norm_path) as f:
            normalized = f.read()
    
    # Check for corrupted placeholders
    corrupted_patterns = [
        r'\\\s*component=',
        r'\\\[/SLATECAMP_UI_BLOCK\\\]',
        r'\[/SLATECAMP_UI_BLOCK\]\s*\[/SLATECAMP_UI_BLOCK\]',
    ]
    for pattern in corrupted_patterns:
        if re.search(pattern, normalized):
            result["has_corrupted_placeholders"] = True
            result["issues"].append("corrupted_placeholders")
            break
    
    # Check for orphaned Extracted summary without opening bracket
    lines = normalized.split('\n')
    for i, line in enumerate(lines):
        if line.strip() == 'Extracted summary:' and (i == 0 or '[SLATECAMP_UI_BLOCK' not in lines[i-1]):
            result["has_orphaned_placeholders"] = True
            result["issues"].append("orphaned_placeholders")
            break
    
    # Check for raw MDX outside placeholders
    raw_mdx_pattern = re.compile(r'<(Tip|Callout|Note|Warn|ExamTip|Example|KeyValues|WikiMistakeCard|WikiMistakeList|LawCallout|ComparisonTable|ProcessFlow|SubjectSnapshot|WikiExamTable|Tabs|Tab|Accordion|AccordionItem|FormulaBlock|InlineQuiz|ElaborativeInterrogation|WikiPartHeader)[^>]*>')
    raw_tags = raw_mdx_pattern.findall(normalized)
    placeholder_regions = [(m.start(), m.end()) for m in re.finditer(r'\[SLATECAMP_UI_BLOCK:[^\]]+\].*?\[/SLATECAMP_UI_BLOCK\]', normalized, re.DOTALL)]
    raw_outside = []
    for tag in set(raw_tags):
        for m in re.finditer(rf'<{tag}[^>]*>', normalized):
            pos = m.start()
            inside = any(start <= pos <= end for start, end in placeholder_regions)
            if not inside:
                raw_outside.append(tag)
    if raw_outside:
        result["has_raw_mdx"] = True
        result["issues"].append("raw_mdx")
    
    # Read ui-blocks.json
    ui_path = article_dir / "ui-blocks.json"
    if ui_path.exists():
        with open(ui_path) as f:
            ui = json.load(f)
        blocks = ui.get("blocks", [])
        if isinstance(blocks, list):
            result["ui_blocks"] = len(blocks)
            for b in blocks:
                comp = b.get("component_name", "unknown")
                result["components"][comp] = result["components"].get(comp, 0) + 1
                if comp not in VALID_COMPONENTS:
                    result["has_hallucinated"] = True
                    result["issues"].append(f"hallucinated:{comp}")
    
    # Check push-result for stale/no-op
    push_path = article_dir / "push-result.json"
    if push_path.exists():
        with open(push_path) as f:
            push = json.load(f)
        blockers = push.get("blockers", [])
        for b in blockers:
            if "stale" in str(b).lower() or "differs from export baseline" in str(b):
                result["has_stale_baseline"] = True
                result["issues"].append("stale_baseline")
            if "no-op" in str(b).lower() or "candidate.md matches original.md" in str(b):
                result["has_no_op"] = True
    
    # Priority assignment
    if result["has_hallucinated"]:
        result["priority"] = "critical"
        result["assessment"] = "hallucinated_components"
    elif result["has_corrupted_placeholders"] or result["has_orphaned_placeholders"]:
        result["priority"] = "critical"
        result["assessment"] = "corrupted_placeholders"
    elif result["has_stale_baseline"] and not result["has_no_op"]:
        result["priority"] = "high"
        result["assessment"] = "stale_baseline"
    elif result["ui_blocks"] == 0 and not result["has_raw_mdx"]:
        result["priority"] = "high"
        result["assessment"] = "zero_components"
    elif result["ui_blocks"] <= 2:
        result["priority"] = "medium"
        result["assessment"] = "sparse_ui"
    elif result["has_raw_mdx"] and result["ui_blocks"] > 0:
        result["priority"] = "medium"
        result["assessment"] = "mixed_raw_and_placeholders"
    else:
        result["priority"] = "low"
        result["assessment"] = "existing_ui_adequate"
    
    return result

def main():
    QUEUES_DIR.mkdir(parents=True, exist_ok=True)
    LOCKS_DIR.mkdir(parents=True, exist_ok=True)
    
    article_dirs = [d for d in EXPORT_DIR.iterdir() if d.is_dir()]
    article_dirs = [d for d in article_dirs if "owner-smoke" not in d.name and "playwright-seeded-quiz" not in d.name]
    
    queues = {
        "corrupted_placeholders": [],
        "stale_baselines": [],
        "hallucinated_components": [],
        "zero_components": [],
        "placeholder_only": [],
        "existing_ui_audit": [],
        "weak_ui": [],
        "good_no_action": [],
        "quarantined": [],
        "completed": [],
    }
    
    for d in article_dirs:
        try:
            result = audit_article(d)
            
            if result["assessment"] == "corrupted_placeholders":
                queues["corrupted_placeholders"].append(result)
            elif result["assessment"] == "hallucinated_components":
                queues["hallucinated_components"].append(result)
            elif result["assessment"] == "stale_baseline":
                queues["stale_baselines"].append(result)
            elif result["assessment"] == "zero_components":
                queues["zero_components"].append(result)
            elif result["assessment"] == "sparse_ui":
                queues["weak_ui"].append(result)
            elif result["assessment"] == "mixed_raw_and_placeholders":
                queues["placeholder_only"].append(result)
            elif result["assessment"] == "existing_ui_adequate":
                queues["good_no_action"].append(result)
            else:
                queues["existing_ui_audit"].append(result)
        except Exception as e:
            queues["quarantined"].append({
                "dir": d.name,
                "error": str(e),
                "assessment": "audit_crash"
            })
    
    # Write queue files
    for name, items in queues.items():
        path = QUEUES_DIR / f"queue-{name}.json"
        with open(path, "w") as f:
            json.dump({"count": len(items), "items": items}, f, indent=2)
    
    # Write summary
    summary = {
        "total_articles": len(article_dirs),
        "queue_counts": {k: len(v) for k, v in queues.items()},
        "timestamp": "2026-05-03T16:45:00Z"
    }
    
    with open(QUEUES_DIR / "audit-summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"Audited {len(article_dirs)} articles")
    for k, v in queues.items():
        print(f"  {k}: {len(v)}")

if __name__ == "__main__":
    main()
