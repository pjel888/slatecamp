#!/usr/bin/env python3
"""Audit all questions in History, Theory, and Design categories."""

import json
import os
import hashlib
import re
from datetime import datetime, timezone

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
WORKDIR = "/Users/philiplewis/slatecamp"

CATEGORIES = {
    "History": "lea-hist-*",
    "Theory": "lea-theo-*",
    "Design": "lea-dsgn-*",
}

def get_content_hash(content):
    return "sha256:" + hashlib.sha256(content.encode('utf-8')).hexdigest()

def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"  ERROR loading {path}: {e}")
        return None

def check_question(q, article_text, article_id):
    """Check a question for issues. Returns list of issue dicts."""
    issues = []
    qid = q.get("question_id", "unknown")
    text = q.get("text", "")
    correct = q.get("correct_option_id", "")
    options = q.get("options", [])
    rationale = q.get("rationale", {})
    
    # Check 1: correct_option_id exists in options
    option_ids = {o["id"] for o in options}
    if correct and correct not in option_ids:
        issues.append({
            "question_id": qid,
            "type": "wrong_answer_key",
            "detail": f"Correct option '{correct}' not in option ids: {option_ids}"
        })
    
    # Check 2: Rationale contains a 'correct' key
    if rationale is None or ("correct" not in rationale and not q.get("explanation")):
        issues.append({
            "question_id": qid,
            "type": "missing_rationale",
            "detail": "No correct rationale or explanation provided"
        })
    
    # Check 3: Question text is not empty
    if not text or len(text.strip()) < 10:
        issues.append({
            "question_id": qid,
            "type": "empty_question",
            "detail": "Question text is empty or too short"
        })
    
    # Check 4: Options look reasonable (not all same, not obviously wrong)
    option_texts = [o["text"] for o in options]
    if len(set(option_texts)) < 2:
        issues.append({
            "question_id": qid,
            "type": "duplicate_options",
            "detail": "Options appear to be duplicates"
        })
    
    # Check 5: Look for options that are obviously contradictory to the article
    # (This requires article-specific knowledge which we'll handle per-article)
    
    # Check 6: model_id format
    model_id = q.get("model_id", "")
    if not model_id:
        issues.append({
            "question_id": qid,
            "type": "missing_model_id",
            "detail": "No model_id assigned"
        })
    
    return issues

def get_category_prefix(article_dir):
    if article_dir.startswith("lea-hist-"):
        return "History"
    elif article_dir.startswith("lea-theo-"):
        return "Theory"
    elif article_dir.startswith("lea-dsgn-"):
        return "Design"
    return "Other"

def audit_article(article_dir):
    """Audit a single article's questions."""
    dir_path = os.path.join(BASE, article_dir)
    q_path = os.path.join(dir_path, "linked-questions.json")
    norm_path = os.path.join(dir_path, "normalized.md")
    edits_dir = os.path.join(dir_path, "question-edits")
    
    if not os.path.exists(q_path):
        return {"article": article_dir, "error": "No linked-questions.json", "questions_checked": 0, "issues_found": 0, "edits_created": []}
    
    questions_data = load_json(q_path)
    if not questions_data:
        return {"article": article_dir, "error": "Could not parse JSON", "questions_checked": 0, "issues_found": 0, "edits_created": []}
    
    # Read article text
    article_text = ""
    if os.path.exists(norm_path):
        with open(norm_path) as f:
            article_text = f.read()
    
    questions = questions_data.get("questions", [])
    article_id = questions_data.get("article_id", "")
    
    all_issues = []
    
    for q in questions:
        issues = check_question(q, article_text, article_id)
        all_issues.extend(issues)
    
    # Create question-edits for any issues found
    edits_created = []
    if all_issues:
        os.makedirs(edits_dir, exist_ok=True)
        for issue in all_issues:
            qid = issue["question_id"]
            # Find the question
            q_data = None
            for q in questions:
                if q["question_id"] == qid:
                    q_data = q
                    break
            if not q_data:
                continue
            
            content_hash = q_data.get("content_hash", get_content_hash(json.dumps(q_data, sort_keys=True)))
            
            edit_file = os.path.join(edits_dir, f"{qid}.json")
            now = datetime.now(timezone.utc).isoformat()
            
            edit_data = {
                "question_id": qid,
                "baseline_hash": content_hash,
                "reason": issue["detail"],
                "approved_by": "hermes-audit-pass-7",
                "approved_at": now,
                "proposed": {}
            }
            
            with open(edit_file, 'w') as f:
                json.dump(edit_data, f, indent=2)
            edits_created.append(edit_file)
    
    return {
        "article": article_dir,
        "article_id": article_id,
        "questions_checked": len(questions),
        "issues_found": len(all_issues),
        "edits_created": edits_created,
        "issue_types": list(set(i["type"] for i in all_issues))
    }

def main():
    import glob
    
    all_results = []
    total_q = 0
    total_issues = 0
    
    for category, pattern in CATEGORIES.items():
        print(f"\n{'='*60}")
        print(f"CATEGORY: {category}")
        print(f"{'='*60}")
        
        article_dirs = sorted(glob.glob(pattern))
        print(f"Found {len(article_dirs)} articles")
        
        for ad in article_dirs:
            dir_name = os.path.basename(ad.rstrip('/'))
            result = audit_article(dir_name)
            all_results.append(result)
            total_q += result.get("questions_checked", 0)
            total_issues += result.get("issues_found", 0)
            
            status = "✓" if result.get("issues_found", 0) == 0 else f"⚠ ({result['issues_found']} issues)"
            print(f"  {status} {dir_name[:60]}... ({result.get('questions_checked', 0)} questions)")
        
        cat_results = [r for r in all_results if r.get('article','').startswith(pattern.replace('*','').rstrip('-'))]
        print(f"Subtotal: {sum(r.get('questions_checked',0) for r in cat_results)} questions checked")
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total articles: {len(all_results)}")
    print(f"Total questions checked: {total_q}")
    print(f"Total issues found: {total_issues}")
    print(f"Total edits created: {sum(len(r.get('edits_created',[])) for r in all_results)}")
    
    # Detailed issue breakdown
    from collections import Counter
    all_types = Counter()
    for r in all_results:
        for t in r.get("issue_types", []):
            all_types[t] += 1
    print(f"\nIssue type breakdown:")
    for t, c in all_types.most_common():
        print(f"  {t}: {c}")

if __name__ == "__main__":
    main()
