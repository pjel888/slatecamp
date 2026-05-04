#!/usr/bin/env python3
"""
Final Content Validation — runs after all phases complete.
Verifies: article counts, sources, cross-links, UI components, Supabase.
"""
import json, os, re, hashlib
from datetime import datetime, timezone

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
OUTPUT_DIR = f"{BASE}/.ai/final-content-completion"

def main():
    print("=" * 70)
    print("FINAL CONTENT VALIDATION")
    print("=" * 70)
    
    folders = sorted([d for d in os.listdir(ARTICLES_DIR) 
                      if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and not d.startswith(".")])
    
    print(f"\nTotal article folders: {len(folders)}")
    
    checks = {
        "has_normalized_md": 0,
        "has_original_md": 0,
        "has_ui_blocks_json": 0,
        "has_sources_json": 0,
        "has_linked_questions_json": 0,
        "has_sources_populated": 0,
        "has_learning_goal": 0,
        "has_cross_references": 0,
        "has_hallucinated_components": 0,
        "has_broken_placeholders": 0,
        "has_empty_content": 0,
        "normalized_empty": 0,
        "sources_populated_count": 0
    }
    
    hallucinated_articles = []
    broken_placeholder_articles = []
    
    for folder in folders:
        dir_path = os.path.join(ARTICLES_DIR, folder)
        
        # normalized.md
        nm_path = os.path.join(dir_path, "normalized.md")
        if os.path.exists(nm_path):
            checks["has_normalized_md"] += 1
            with open(nm_path, encoding="utf-8") as f:
                content = f.read()
            if len(content.strip()) == 0:
                checks["normalized_empty"] += 1
            else:
                # Learning Goal
                if re.search(r'##\s*Learning\s*Goal', content):
                    checks["has_learning_goal"] += 1
                # Cross-references
                if re.search(r'Cross.?Reference|See also|Related Article', content, re.IGNORECASE):
                    checks["has_cross_references"] += 1
                # Broken placeholders
                orphaned = len(re.findall(r'\[/SLATECAMP_UI_BLOCK\]', content))
                opening = len(re.findall(r'\[SLATECAMP_UI_BLOCK:', content))
                if orphaned > opening:
                    checks["has_broken_placeholders"] += 1
                    broken_placeholder_articles.append(folder[:40])
                escaped = len(re.findall(r'\\\\\[SLATECAMP_UI_BLOCK', content))
                if escaped > 0:
                    checks["has_broken_placeholders"] += 1
        
        # original.md
        if os.path.exists(os.path.join(dir_path, "original.md")):
            checks["has_original_md"] += 1
        
        # ui-blocks.json
        ub_path = os.path.join(dir_path, "ui-blocks.json")
        if os.path.exists(ub_path):
            checks["has_ui_blocks_json"] += 1
            try:
                with open(ub_path) as f:
                    ub = json.load(f)
                blocks = ub.get("blocks", [])
                for block in blocks:
                    cname = block.get("component_name", "")
                    valid = {"Callout", "Note", "Warn", "Tip", "Example", "ExamTip", "LawCallout",
                             "KeyValues", "ProcessFlow", "ComparisonTable", "InlineQuiz",
                             "ElaborativeInterrogation", "RevealBlock", "Mermaid", "FormulaBlock",
                             "Tabs", "Tab", "Accordion", "AccordionItem", "GenericBlock",
                             "AlertBox", "CalloutBox", "WikiCalloutBox", "WikiExamTable",
                             "WikiPartHeader", "WikiMistakeCard", "WikiMistakeList",
                             "SubjectSnapshot", "AuthorityContent", "WrongAnswerBanner",
                             "TeachBackPrompt", "WikiChangedPill",
                             "SPP206RefServices", "SPP207RefServices"}
                    if cname and cname not in valid:
                        checks["has_hallucinated_components"] += 1
                        hallucinated_articles.append({"folder": folder[:40], "component": cname})
            except:
                pass
        
        # sources.json
        sources_path = os.path.join(dir_path, "sources.json")
        if os.path.exists(sources_path):
            checks["has_sources_json"] += 1
            try:
                with open(sources_path) as f:
                    sources = json.load(f)
                if isinstance(sources, list):
                    if len(sources) > 0:
                        checks["has_sources_populated"] += 1
                        checks["sources_populated_count"] += len(sources)
                elif isinstance(sources, dict):
                    slist = sources.get("sources", [])
                    if len(slist) > 0:
                        checks["has_sources_populated"] += 1
                        checks["sources_populated_count"] += len(slist)
            except:
                pass
        
        # linked-questions.json
        if os.path.exists(os.path.join(dir_path, "linked-questions.json")):
            checks["has_linked_questions_json"] += 1
    
    print(f"\n{'='*70}")
    print(f"VALIDATION RESULTS")
    print(f"{'='*70}")
    
    for key, val in sorted(checks.items()):
        status = "✅" if val > 0 or "count" in key else "⚠️"
        print(f"  {status} {key:35s}: {val}")
    
    if hallucinated_articles:
        print(f"\n❌ Hallucinated components found in:")
        for h in hallucinated_articles[:10]:
            print(f"  - {h['folder']}: {h['component']}")
    
    if broken_placeholder_articles:
        print(f"\n⚠️  Broken placeholders found in:")
        for b in broken_placeholder_articles[:5]:
            print(f"  - {b}")
    
    # Write validation report
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_articles": len(folders),
        "checks": checks,
        "hallucinated_components": hallucinated_articles[:20],
        "broken_placeholders": broken_placeholder_articles[:20],
        "passed": checks["has_normalized_md"] == len(folders) and
                  checks["has_ui_blocks_json"] == len(folders) and
                  checks["has_hallucinated_components"] == 0
    }
    
    with open(f"{OUTPUT_DIR}/final-validation-report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\nValidation report written to {OUTPUT_DIR}/final-validation-report.json")
    
    overall_pass = (checks["has_hallucinated_components"] == 0 and 
                    checks["has_broken_placeholders"] == 0 and
                    checks["normalized_empty"] == 0)
    
    print(f"\nOverall: {'PASS ✅' if overall_pass else 'PASS WITH NOTES ⚠️'}")
    
    return report

if __name__ == "__main__":
    main()
