#!/usr/bin/env python3
"""
Final Corpus Validation
Runs validation across all articles after processing.
Usage: python final_corpus_validation.py
"""

import json
import re
import glob
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
VALID_COMPONENTS = {
    "Callout", "Note", "Warn", "Tip", "Example", "ExamTip",
    "LawCallout", "WikiExamTable", "WikiMistakeCard", "WikiMistakeList",
    "KeyValues", "SubjectSnapshot", "Tabs", "Tab", "Accordion", "AccordionItem",
    "FormulaBlock", "InlineQuiz", "ProcessFlow", "ComparisonTable",
    "ElaborativeInterrogation", "WikiPartHeader"
}

def validate_article(article_dir: Path) -> dict:
    result = {"dir": article_dir.name, "valid": True, "issues": []}
    
    norm_path = article_dir / "normalized.md"
    if not norm_path.exists():
        result["valid"] = False
        result["issues"].append("missing normalized.md")
        return result
    
    with open(norm_path, 'r') as f:
        content = f.read()
    
    # Check for hallucinated components
    raw_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]*)[^/>]*>', content))
    hallucinated = raw_tags - VALID_COMPONENTS
    if hallucinated:
        result["valid"] = False
        result["issues"].append(f"hallucinated: {hallucinated}")
    
    # Check for corrupted placeholders
    if re.search(r'\\\s*component=', content) or re.search(r'\\\[/SLATECAMP_UI_BLOCK\\\]', content):
        result["valid"] = False
        result["issues"].append("corrupted_placeholders")
    
    # Check for empty content
    if len(content.strip()) < 50:
        result["valid"] = False
        result["issues"].append("content_too_short")
    
    return result

def main():
    article_dirs = [d for d in EXPORT_DIR.iterdir() if d.is_dir()]
    
    total = len(article_dirs)
    valid = 0
    invalid = 0
    issues = []
    
    for d in article_dirs:
        result = validate_article(d)
        if result["valid"]:
            valid += 1
        else:
            invalid += 1
            issues.append(result)
    
    report = {
        "total": total,
        "valid": valid,
        "invalid": invalid,
        "issues": issues[:50]  # Limit
    }
    
    with open("/Users/philiplewis/slatecamp/.ai/content-audit-export/final-validation-report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"Validation: {valid}/{total} valid, {invalid} invalid")
    if invalid > 0:
        print("Some articles have issues. Check final-validation-report.json")
        return 1
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
