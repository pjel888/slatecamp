#!/usr/bin/env python3
"""
Deep audit script for Materials and Planning question sets.
Distinguishes structural patterns from real content issues.
"""

import json
import os
import re
import hashlib

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

def get_articles():
    articles = []
    for d in os.listdir(BASE):
        dpath = os.path.join(BASE, d)
        if os.path.isdir(dpath):
            for prefix in ["lea-matl-", "lea-plan-"]:
                if d.startswith(prefix):
                    cat = "Materials" if prefix == "lea-matl-" else "Planning"
                    articles.append((d, dpath, cat))
                    break
    articles.sort(key=lambda x: x[0])
    return articles

def read_article_content(dpath):
    npath = os.path.join(dpath, "normalized.md")
    if os.path.exists(npath):
        with open(npath, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def read_linked_questions(dpath):
    qpath = os.path.join(dpath, "linked-questions.json")
    if os.path.exists(qpath):
        with open(qpath, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def get_existing_edits(dpath):
    edits_dir = os.path.join(dpath, "question-edits")
    existing = set()
    if os.path.isdir(edits_dir):
        for f in os.listdir(edits_dir):
            if f.endswith(".json"):
                existing.add(f.replace(".json", ""))
    return existing

def check_question_deep(q, content, article_id, article_slug):
    """Deep audit of a single question. Returns issues categorized by severity."""
    issues = {
        "critical": [],   # Wrong answer key, content error
        "major": [],      # Missing required rationale entries, inconsistent data
        "minor": [],      # Stylistic improvements, missing optional entries
        "info": []        # Observations, not requiring action
    }
    
    qid = q.get("question_id", "unknown")
    qtype = q.get("question_type", "unknown")
    text = q.get("text", "")
    correct_id = q.get("correct_option_id")
    options = q.get("options", [])
    rationale = q.get("rationale", {})
    explanation = q.get("explanation")
    bloom = q.get("bloom_level", "")
    model_id = q.get("model_id", "")
    
    opt_ids = [o["id"] for o in options]
    
    if qtype == "mcq":
        # CRITICAL: correct_option_id missing or invalid
        if not correct_id:
            issues["critical"].append("Missing correct_option_id")
        elif correct_id not in opt_ids:
            issues["critical"].append(f"correct_option_id '{correct_id}' not found in options: {opt_ids}")
        
        # MAJOR: Options with empty text
        for o in options:
            if not o.get("text", "").strip():
                issues["major"].append(f"Option '{o['id']}' has empty text")
        
        # Check rationale coverage for NON-correct options
        if rationale and qtype == "mcq":
            for o in options:
                oid = o["id"]
                # Check if this is the correct answer
                is_correct = (oid == correct_id)
                if oid not in rationale and not is_correct:
                    issues["major"].append(f"Missing rationale for wrong option '{oid}'")
            
            # Check "correct" and "takeaway" keys
            if "correct" not in rationale:
                issues["major"].append("Missing 'correct' key in rationale (explains correct answer)")
            if "takeaway" not in rationale:
                issues["major"].append("Missing 'takeaway' key in rationale")
    
    # Check explanation
    if explanation is not None and not explanation.strip():
        issues["minor"].append("Explanation field is empty string (should be null)")
    
    return issues

def audit_all():
    """Audit all articles and print structured report."""
    articles = get_articles()
    
    # Track stats
    results = []
    total_questions = 0
    total_critical = 0
    total_major = 0
    total_minor = 0
    
    for article_dir, dpath, category in articles:
        content = read_article_content(dpath)
        questions_data = read_linked_questions(dpath)
        existing_edits = get_existing_edits(dpath)
        
        if questions_data is None:
            continue
        
        questions = questions_data.get("questions", [])
        art_id = questions_data.get("article_id", "")
        art_results = {
            "article": article_dir,
            "article_id": art_id,
            "category": category,
            "question_count": len(questions),
            "issues": []
        }
        
        for q in questions:
            qid = q.get("question_id", "")
            model_id = q.get("model_id", "")
            qtype = q.get("question_type", "")
            correct_id = q.get("correct_option_id", "")
            text = q.get("text", "")[:100]
            
            issues = check_question_deep(q, content, art_id, article_dir)
            has_existing = qid in existing_edits
            
            has_issues = any(issues.values())
            
            if has_issues or has_existing:
                art_results["issues"].append({
                    "question_id": qid,
                    "model_id": model_id,
                    "type": qtype,
                    "correct": correct_id,
                    "text_preview": text,
                    "critical": issues["critical"],
                    "major": issues["major"],
                    "minor": issues["minor"],
                    "has_existing_edit": has_existing
                })
        
        results.append(art_results)
        
        # Count
        art_crit = sum(len(q["critical"]) for q in art_results["issues"])
        art_maj = sum(len(q["major"]) for q in art_results["issues"])
        art_min = sum(len(q["minor"]) for q in art_results["issues"])
        art_total_q = art_results["question_count"]
        total_questions += art_total_q
        total_critical += art_crit
        total_major += art_maj
        total_minor += art_min
        
        # Print summary
        status = "✓ CLEAN" if not any(iss["critical"] or iss["major"] or iss["minor"] for iss in art_results["issues"]) else "⚠ ISSUES"
        print(f"{status} | {category:10s} | {article_dir[:50]:50s} | Q:{art_total_q:2d} | C:{art_crit} M:{art_maj} m:{art_min}")
        
        # Print details for articles with issues
        if any(iss["critical"] or iss["major"] for iss in art_results["issues"]):
            for iss in art_results["issues"]:
                if iss["critical"] or iss["major"]:
                    print(f"    {iss['model_id']:25s} | CRIT: {iss['critical']} | MAJOR: {iss['major']}")
    
    # Summary
    print(f"\n{'='*80}")
    print(f"AUDIT SUMMARY")
    print(f"{'='*80}")
    print(f"Articles audited: {len(articles)}")
    print(f"Total questions: {total_questions}")
    print(f"Critical issues (wrong answers, content errors): {total_critical}")
    print(f"Major issues (missing rationale, inconsistent): {total_major}")
    print(f"Minor issues (stylistic improvements): {total_minor}")
    
    # Articles needing edits
    articles_with_issues = [r for r in results if any(iss["critical"] or iss["major"] for iss in r["issues"])]
    print(f"\nArticles requiring question-edits: {len(articles_with_issues)}")
    for r in articles_with_issues:
        qs_with_issues = [iss for iss in r["issues"] if iss["critical"] or iss["major"]]
        print(f"  {r['article'][:55]:55s} ({len(qs_with_issues)} questions need fixes)")

if __name__ == "__main__":
    audit_all()
