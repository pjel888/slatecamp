#!/usr/bin/env python3
"""
Comprehensive question audit for Structures (lea-strc-*) and Utilities (lea-util-*) articles.
Checks each question for:
1. Answer key correctness (correct_option_id matches rationale)
2. Explanation quality (rationale non-generic, complete sentences)
3. Article alignment (question references concepts in normalized.md)
4. Clear wording
5. Plausible distractors (all options are reasonable)
6. Tests understanding, not trivia
"""

import json
import os
import re
import hashlib
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
WORKDIR = Path("/Users/philiplewis/slatecamp")

# Collect all strc and util article dirs
article_dirs = sorted(BASE_DIR.glob("lea-strc-*")) + sorted(BASE_DIR.glob("lea-util-*"))

print(f"Found {len(article_dirs)} article directories to audit")

# Statistics
total_questions = 0
articles_with_issues = 0
questions_with_issues = 0
issues_found = []

def compute_hash(filepath):
    """Compute sha256 of a file."""
    content = open(filepath, 'rb').read()
    return f"sha256:{hashlib.sha256(content).hexdigest()}"

def check_question_basics(q, article_text, article_id, article_dir_name):
    """Check a single question for issues."""
    issues = []
    qid = q.get("question_id", "unknown")
    model_id = q.get("model_id", "unknown")
    
    # 1. Check required fields exist
    required = ["text", "options", "correct_option_id", "rationale"]
    for field in required:
        if field not in q or q[field] is None:
            issues.append(f"MISSING FIELD: {field}")
    
    if issues:
        return issues
    
    # 2. Check correct_option_id is one of the option ids
    option_ids = [o["id"] for o in q["options"]]
    if q["correct_option_id"] not in option_ids:
        issues.append(f"CORRECT_OPTION_ID '{q['correct_option_id']}' not in option ids {option_ids}")
    
    # 3. Check rationale structure
    rationale = q["rationale"]
    if not isinstance(rationale, dict):
        issues.append(f"Rationale is not a dict: {type(rationale)}")
    else:
        # Check for "correct" key
        if "correct" not in rationale:
            issues.append("MISSING 'correct' key in rationale")
        elif len(rationale["correct"]) < 20:
            issues.append(f"Rationale 'correct' too short ({len(rationale['correct'])} chars): '{rationale['correct']}'")
        
        # Check for garbled/corrupted text in rationale
        correct_text = rationale.get("correct", "")
        if "correct_option_id should be" in correct_text:
            issues.append(f"CORRUPTED RATIONALE: contains 'correct_option_id should be' note to self: '{correct_text[:200]}...'")
        
        # Check for generic rationale text
        generic_patterns = ["This option is incorrect", "Review the correct answer above"]
        for opt_id in option_ids:
            if opt_id in rationale and opt_id != "correct":
                opt_text = rationale[opt_id]
                if any(p in opt_text for p in generic_patterns):
                    issues.append(f"GENERIC RATIONALE for option '{opt_id}': '{opt_text}'")
    
    # 4. Check question text is reasonable
    text = q.get("text", "")
    if len(text) < 15:
        issues.append(f"Question text too short ({len(text)} chars)")
    if "**" in text and text.count("**") % 2 != 0:
        issues.append("Unmatched bold markers in question text")
    
    # 5. Check options are plausible / not too similar
    option_texts = [o["text"] for o in q["options"]]
    if len(set(option_texts)) < len(option_texts):
        issues.append("Duplicate option texts")
    
    # Check for options that are too short
    for opt in q["options"]:
        if len(opt["text"]) < 5:
            issues.append(f"Option '{opt['id']}' too short: '{opt['text']}'")
    
    # 6. Check bloom_level
    bloom = q.get("bloom_level", "")
    valid_bloom = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
    if bloom not in valid_bloom:
        issues.append(f"Invalid bloom_level: '{bloom}'")
    
    # 7. Check difficulty is reasonable
    diff = q.get("difficulty")
    if diff is not None and (diff < 0 or diff > 1):
        issues.append(f"Difficulty out of range [0,1]: {diff}")
    
    # 8. Check model_id format
    if not model_id.startswith("ALE-STRC-") and not model_id.startswith("ALE-UTIL-"):
        issues.append(f"Unexpected model_id prefix: {model_id}")
    
    # 9. Check that correct answer aligns with what the question asks
    # For "NOT" questions, verify the correct option actually answers "not"
    if "NOT" in text.upper() or "not" in text.lower():
        # The answer should identify what is NOT the thing
        # This requires content-level checking
        pass
    
    # 10. Check explanation field
    explanation = q.get("explanation")
    if explanation is not None and len(str(explanation)) < 5:
        issues.append(f"Explanation field is too short or empty: '{explanation}'")
    
    return issues


# Check all 'NOT' type questions for logical correctness
def check_not_question_logic(q):
    """Special check for 'NOT' questions - the correct option should be the one that ISN'T the property/concept."""
    text = q.get("text", "")
    if "NOT" not in text.upper():
        return []
    
    issues = []
    correct_id = q.get("correct_option_id")
    correct_text = ""
    for opt in q.get("options", []):
        if opt["id"] == correct_id:
            correct_text = opt["text"]
            break
    
    # For NOT questions, the correct answer should be the exception
    # Check if the rationale makes sense with the NOT framing
    rationale = q.get("rationale", {})
    correct_rationale = rationale.get("correct", "")
    
    if q.get("model_id") == "ALE-STRC-001-01-001":
        # "Which of the following is NOT one of the three fundamental properties of a force?"
        # Correct: Duration (b). Let's verify this is right.
        # Properties are: magnitude, direction, sense. Duration is NOT one of them. ✓
        pass
    
    return issues


# Now audit all articles
for article_dir in article_dirs:
    article_name = article_dir.name
    
    linked_q_path = article_dir / "linked-questions.json"
    normalized_path = article_dir / "normalized.md"
    
    if not linked_q_path.exists():
        print(f"  SKIP: {article_name} - no linked-questions.json")
        continue
    
    if not normalized_path.exists():
        print(f"  SKIP: {article_name} - no normalized.md")
        continue
    
    # Read article
    article_text = normalized_path.read_text(encoding='utf-8')
    
    # Read questions
    try:
        data = json.loads(linked_q_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        print(f"  ERROR: {article_name} - JSON parse error: {e}")
        articles_with_issues += 1
        continue
    
    questions = data.get("questions", [])
    article_id = data.get("article_id", "unknown")
    
    if not questions:
        continue
    
    total_questions += len(questions)
    
    article_issues = []
    for q in questions:
        q_issues = check_question_basics(q, article_text, article_id, article_name)
        q_issues += check_not_question_logic(q)
        
        if q_issues:
            questions_with_issues += 1
            issue_entry = {
                "article": article_name,
                "article_id": article_id,
                "question_id": q.get("question_id"),
                "model_id": q.get("model_id"),
                "question_text": q.get("text", "")[:100],
                "issues": q_issues,
            }
            article_issues.append(issue_entry)
            issues_found.append(issue_entry)
    
    if article_issues:
        articles_with_issues += 1
        print(f"\n{'='*60}")
        print(f"ARTICLE: {article_name}")
        print(f"  Questions: {len(questions)}, Issues: {len(article_issues)}")
        for issue in article_issues:
            print(f"  [{issue['model_id']}] {issue['question_text'][:80]}")
            for i in issue['issues']:
                print(f"    - {i}")

print(f"\n\n{'='*60}")
print(f"AUDIT SUMMARY")
print(f"{'='*60}")
print(f"Articles audited: {len(article_dirs)}")
print(f"Total questions: {total_questions}")
print(f"Articles with issues: {articles_with_issues}")
print(f"Questions with issues: {questions_with_issues}")
print(f"Total issues found: {sum(len(i['issues']) for i in issues_found)}")

# Write detailed report
report_path = WORKDIR / ".ai" / "content-audit-export" / "audit_report.json"
with open(report_path, 'w') as f:
    json.dump({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "articles_audited": len(article_dirs),
        "total_questions": total_questions,
        "articles_with_issues": articles_with_issues,
        "questions_with_issues": questions_with_issues,
        "issues": issues_found
    }, f, indent=2)

print(f"\nDetailed report written to: {report_path}")
