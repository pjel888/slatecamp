#!/usr/bin/env python3
"""
Comprehensive Article Audit Script
Scans all articles for:
1. Corrupted placeholders (render risk)
2. Stale baselines (push blocker)
3. Weak/generic UI placement
4. Missing high-value components
5. Hallucinated components

Outputs: audit-report.json with per-article findings and priorities.
"""

import json
import os
import re
import glob
from pathlib import Path
from collections import Counter

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def audit_article(article_dir: Path) -> dict:
    result = {
        "dir": article_dir.name,
        "article_id": None,
        "issues": [],
        "priority": "low",
        "ui_blocks": 0,
        "components": {},
        "has_corrupted_placeholders": False,
        "has_stale_baseline": False,
        "has_no_op": False,
        "has_hallucinated": False,
        "has_raw_mdx": False,
        "assessment": "unknown",
    }
    
    # Read metadata
    meta_path = article_dir / "article-metadata.json"
    if meta_path.exists():
        with open(meta_path) as f:
            meta = json.load(f)
        result["article_id"] = meta.get("article_id")
        result["slug"] = meta.get("slug")
    
    # Read normalized.md
    norm_path = article_dir / "normalized.md"
    normalized = ""
    if norm_path.exists():
        with open(norm_path) as f:
            normalized = f.read()
    
    # Check for corrupted placeholders
    # Valid: [SLATECAMP_UI_BLOCK:ui_XXXX ...]...[ /SLATECAMP_UI_BLOCK]
    # Corrupted: \ component=, \[/SLATECAMP_UI_BLOCK\], missing opening bracket, etc.
    corrupted_patterns = [
        r'\\\s*component=',           # backslash before component
        r'\\\[/SLATECAMP_UI_BLOCK\\\]',  # escaped closing tag
        r'\[/SLATECAMP_UI_BLOCK\]\s*\[/SLATECAMP_UI_BLOCK\]',  # double close
        r'\[SLATECAMP_UI_BLOCK:[^\]]*\n[^\]]*\[/SLATECAMP_UI_BLOCK\]',  # newline in placeholder
    ]
    for pattern in corrupted_patterns:
        if re.search(pattern, normalized):
            result["has_corrupted_placeholders"] = True
            result["issues"].append("corrupted_placeholders")
            break
    
    # Check for raw MDX (non-placeholder components)
    raw_mdx_pattern = re.compile(r'<(Tip|Callout|Note|Warn|ExamTip|Example|KeyValues|WikiMistakeCard|WikiMistakeList|LawCallout|ComparisonTable|ProcessFlow|SubjectSnapshot|WikiExamTable|Tabs|Tab|Accordion|AccordionItem|FormulaBlock|InlineQuiz|ElaborativeInterrogation|WikiPartHeader)[^>]*>')
    raw_tags = raw_mdx_pattern.findall(normalized)
    # Exclude tags that are inside valid placeholders
    placeholder_regions = [(m.start(), m.end()) for m in re.finditer(r'\[SLATECAMP_UI_BLOCK:[^\]]+\].*?\[/SLATECAMP_UI_BLOCK\]', normalized, re.DOTALL)]
    raw_outside = []
    for tag in raw_tags:
        # Find position of this tag
        for m in re.finditer(rf'<{tag}[^>]*>', normalized):
            pos = m.start()
            inside_placeholder = any(start <= pos <= end for start, end in placeholder_regions)
            if not inside_placeholder:
                raw_outside.append(tag)
    if raw_outside:
        result["has_raw_mdx"] = True
        result["issues"].append("raw_mdx_outside_placeholders")
    
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
                # Check for hallucinated components
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
                result["issues"].append("no_op")
    
    # Priority assignment
    if result["has_hallucinated"]:
        result["priority"] = "critical"
        result["assessment"] = "failed-needs-review"
    elif result["has_corrupted_placeholders"]:
        result["priority"] = "critical"
        result["assessment"] = "render-risk"
    elif result["has_stale_baseline"] and not result["has_no_op"]:
        result["priority"] = "high"
        result["assessment"] = "stale-baseline-needs-reexport"
    elif result["ui_blocks"] == 0:
        result["priority"] = "high"
        result["assessment"] = "zero-components"
    elif result["ui_blocks"] <= 2:
        result["priority"] = "medium"
        result["assessment"] = "sparse-ui-may-need-improvement"
    else:
        result["priority"] = "low"
        result["assessment"] = "existing-ui-adequate"
    
    return result

# Valid components from whitelist
VALID_COMPONENTS = {
    "Callout", "Note", "Warn", "Tip", "Example", "ExamTip",
    "LawCallout", "WikiExamTable", "WikiMistakeCard", "WikiMistakeList",
    "KeyValues", "SubjectSnapshot", "Tabs", "Tab", "Accordion", "AccordionItem",
    "FormulaBlock", "InlineQuiz", "ProcessFlow", "ComparisonTable",
    "ElaborativeInterrogation", "WikiPartHeader"
}

def main():
    article_dirs = [d for d in EXPORT_DIR.iterdir() if d.is_dir()]
    
    # Exclude test articles
    article_dirs = [d for d in article_dirs if "owner-smoke" not in d.name and "playwright-seeded-quiz" not in d.name]
    
    results = []
    for d in article_dirs:
        try:
            result = audit_article(d)
            results.append(result)
        except Exception as e:
            results.append({"dir": d.name, "error": str(e), "priority": "critical"})
    
    # Summaries
    priority_counts = Counter(r["priority"] for r in results)
    assessment_counts = Counter(r["assessment"] for r in results)
    
    report = {
        "total_articles": len(results),
        "priority_counts": dict(priority_counts),
        "assessment_counts": dict(assessment_counts),
        "critical_articles": [r for r in results if r["priority"] == "critical"],
        "high_articles": [r for r in results if r["priority"] == "high"],
        "all_results": results,
    }
    
    output_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/comprehensive-audit-report.json")
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"Audited {len(results)} articles")
    print(f"Priority breakdown:")
    for p, c in sorted(priority_counts.items(), key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(x[0], 4)):
        print(f"  {p}: {c}")
    print(f"Assessment breakdown:")
    for a, c in assessment_counts.items():
        print(f"  {a}: {c}")
    print(f"Report: {output_path}")

if __name__ == "__main__":
    main()
