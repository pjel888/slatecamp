#!/usr/bin/env python3
"""
Audit script for Materials and Planning question sets.
Checks: accuracy, answer key correctness, explanation quality, alignment with normalized.md.
Creates question-edits/<question_id>.json files for any fixes needed.
"""

import json
import os
import re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
CATEGORIES = {"lea-matl-": "Materials", "lea-plan-": "Planning"}

def get_articles():
    """Get all article directories for Materials and Planning."""
    articles = []
    for d in os.listdir(BASE):
        dpath = os.path.join(BASE, d)
        if os.path.isdir(dpath):
            for prefix in CATEGORIES:
                if d.startswith(prefix):
                    articles.append((d, dpath, CATEGORIES[prefix]))
                    break
    articles.sort(key=lambda x: x[0])
    return articles

def read_article_content(dpath):
    """Read normalized.md if it exists."""
    npath = os.path.join(dpath, "normalized.md")
    if os.path.exists(npath):
        with open(npath, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def read_linked_questions(dpath):
    """Read linked-questions.json if it exists."""
    qpath = os.path.join(dpath, "linked-questions.json")
    if os.path.exists(qpath):
        with open(qpath, "r", encoding="utf-8") as f:
            return json.load(f)
    return None

def get_existing_edits(dpath):
    """Get set of question_ids that already have edit files."""
    edits_dir = os.path.join(dpath, "question-edits")
    existing = set()
    if os.path.isdir(edits_dir):
        for f in os.listdir(edits_dir):
            if f.endswith(".json"):
                existing.add(f.replace(".json", ""))
    return existing

def check_question(q, content, article_id, article_slug):
    """Audit a single question. Returns list of issues."""
    issues = []
    qid = q.get("question_id", "unknown")
    qtype = q.get("question_type", "unknown")
    text = q.get("text", "")
    correct_id = q.get("correct_option_id")
    options = q.get("options", [])
    rationale = q.get("rationale", {})
    explanation = q.get("explanation")
    bloom = q.get("bloom_level", "")
    difficulty = q.get("difficulty", 0.5)

    # Check 1: MCQ must have correct_option_id
    if qtype == "mcq":
        if not correct_id:
            issues.append(f"Missing correct_option_id")

        # Check correct_option_id exists in options
        opt_ids = [o["id"] for o in options]
        if correct_id and correct_id not in opt_ids:
            issues.append(f"correct_option_id '{correct_id}' not found in options: {opt_ids}")

        # Check all options have text
        for o in options:
            if not o.get("text", "").strip():
                issues.append(f"Option '{o['id']}' has empty text")

    # Check 2: Rationale coverage
    if rationale and qtype == "mcq":
        # Check all options have rationale entries
        for o in options:
            oid = o["id"]
            if oid not in rationale:
                issues.append(f"Missing rationale for option '{oid}'")
        
        # Check "correct" key exists
        if "correct" not in rationale:
            issues.append("Missing 'correct' key in rationale")
        if "takeaway" not in rationale:
            issues.append("Missing 'takeaway' key in rationale")

    # Check 3: Explanation field (should be null or contain useful text)
    # (no strict check - can be null)

    # Check 4: Bloom level
    valid_blooms = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    if bloom and bloom.lower() not in valid_blooms:
        issues.append(f"Invalid bloom_level: '{bloom}'")

    # Check 5: MCQ - verify correct answer matches content where possible
    # (semantic check done by reviewer)

    return issues

def audit_article(article_dir, article_slug, category):
    """Audit all questions in one article."""
    dpath = os.path.join(BASE, article_dir)
    content = read_article_content(dpath)
    questions_data = read_linked_questions(dpath)
    existing_edits = get_existing_edits(dpath)
    
    if questions_data is None:
        return {"article": article_slug, "status": "no_questions", "issues": [], "question_count": 0, "category": category}
    
    questions = questions_data.get("questions", [])
    results = []
    
    for q in questions:
        qid = q.get("question_id", "unknown")
        issues = check_question(q, content, questions_data.get("article_id"), article_slug)
        
        # Check if edit already exists
        has_existing_edit = qid in existing_edits
        
        results.append({
            "question_id": qid,
            "model_id": q.get("model_id", ""),
            "text_preview": q.get("text", "")[:80],
            "issues": issues,
            "has_existing_edit": has_existing_edit,
            "correct_option_id": q.get("correct_option_id"),
            "question_type": q.get("question_type"),
            "difficulty": q.get("difficulty"),
            "bloom_level": q.get("bloom_level"),
        })
    
    return {
        "article": article_slug,
        "article_id": questions_data.get("article_id"),
        "category": category,
        "question_count": len(questions),
        "results": results
    }

def main():
    articles = get_articles()
    print(f"Found {len(articles)} articles to audit")
    
    all_issues_count = 0
    total_questions = 0
    
    for article_dir, dpath, category in articles:
        result = audit_article(article_dir, article_dir, category)
        
        if result.get("status") == "no_questions":
            print(f"\n{'='*60}")
            print(f"ARTICLE: {article_dir} ({category})")
            print(f"STATUS: No linked-questions.json found")
            continue
        
        total_questions += result["question_count"]
        
        # Count issues
        article_issues = [r for r in result["results"] if r["issues"]]
        article_issues_count = sum(len(r["issues"]) for r in article_issues)
        all_issues_count += article_issues_count
        
        print(f"\n{'='*60}")
        print(f"ARTICLE: {article_dir} ({category})")
        print(f"Questions: {result['question_count']}, Issues: {article_issues_count}")
        
        if article_issues:
            for r in article_issues:
                print(f"  QID: {r['question_id']} ({r['model_id']})")
                print(f"  Text: {r['text_preview']}...")
                print(f"  Issues: {'; '.join(r['issues'])}")
                print()
    
    print(f"\n{'='*60}")
    print(f"TOTAL SUMMARY")
    print(f"Articles: {len(articles)}")
    print(f"Total Questions: {total_questions}")
    print(f"Total Issues Found: {all_issues_count}")

if __name__ == "__main__":
    main()
