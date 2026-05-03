#!/usr/bin/env python3
"""
Comprehensive audit of all Other Named articles.
Uses correct linked-questions.json schema.
Handles both string and dict rationales.
"""

import os, json, sys, re
from collections import Counter

BASE = os.path.dirname(os.path.abspath(__file__))
ARTICLES_FILE = '/tmp/other_named.txt'

with open(ARTICLES_FILE) as f:
    articles = [line.strip() for line in f if line.strip()]

total_issues = 0
total_fixes = 0
all_issues = []
articles_scanned = 0
articles_with_issues = set()
total_questions_scanned = 0

def get_article_name(dirname):
    return dirname.split('--')[0]

def rationale_length(rationale):
    """Get length of rationale regardless of type."""
    if rationale is None:
        return 0
    if isinstance(rationale, str):
        return len(rationale.strip())
    if isinstance(rationale, dict):
        # Sum up all text fields
        total = 0
        for k, v in rationale.items():
            if isinstance(v, str):
                total += len(v.strip())
        return total
    return 0

def explanation_length(explanation):
    if explanation is None:
        return 0
    if isinstance(explanation, str):
        return len(explanation.strip())
    if isinstance(explanation, dict):
        total = 0
        for k, v in explanation.items():
            if isinstance(v, str):
                total += len(v.strip())
        return total
    return 0

def ensure_edits_dir(art_dir):
    edits_dir = os.path.join(BASE, art_dir, 'question-edits')
    os.makedirs(edits_dir, exist_ok=True)
    return edits_dir

def create_fix(art_dir, qid, fix_data):
    global total_fixes
    edits_dir = ensure_edits_dir(art_dir)
    fix_path = os.path.join(edits_dir, f"{qid}.json")
    existing = {}
    if os.path.exists(fix_path):
        with open(fix_path) as f:
            existing = json.load(f)
    existing.update(fix_data)
    with open(fix_path, 'w') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    total_fixes += 1
    return fix_path

def audit_article(art_dir):
    global total_issues, articles_scanned, total_questions_scanned
    art_name = get_article_name(art_dir)
    
    lq_path = os.path.join(BASE, art_dir, 'linked-questions.json')
    norm_path = os.path.join(BASE, art_dir, 'normalized.md')
    
    article_text = ""
    if os.path.exists(norm_path) and os.path.getsize(norm_path) > 0:
        with open(norm_path) as f:
            article_text = f.read().lower()
    
    with open(lq_path) as f:
        data = json.load(f)
    
    questions = data.get('questions', [])
    if not questions:
        return
    
    articles_scanned += 1
    total_questions_scanned += len(questions)
    print(f"\n{'='*60}")
    print(f"ARTICLE: {art_name} ({len(questions)} questions)")
    print(f"{'='*60}")
    
    for q in questions:
        qid = q.get('question_id', 'unknown')
        text = q.get('text', '')
        options = q.get('options', [])
        correct_id = q.get('correct_option_id', None)
        correct_value = q.get('correct_value', None)
        rationale = q.get('rationale', None)
        explanation = q.get('explanation', None)
        qtype = q.get('question_type', 'unknown')
        accepted = q.get('accepted_answers', None)
        
        q_issues = []
        fix_data = {}
        
        # === CHECK 1: Missing or empty text ===
        if not text or len(text.strip()) < 5:
            q_issues.append("MISSING_TEXT: Question text is missing or too short")
        
        # === CHECK 2: Check options for multiple_choice/mcq ===
        if qtype in ('multiple_choice', 'mcq'):
            if not options or len(options) == 0:
                q_issues.append("MISSING_OPTIONS: MCQ has no options")
            elif len(options) < 2:
                q_issues.append(f"TOO_FEW_OPTIONS: Only {len(options)} option(s)")
            
            for opt in options:
                opt_text = opt.get('text', '')
                if not opt_text or len(opt_text.strip()) < 1:
                    q_issues.append(f"EMPTY_OPTION_TEXT: Option {opt.get('id', '?')} has empty text")
            
            # === CHECK 3: Correct option ID validation ===
            if correct_id and options:
                opt_ids = [opt.get('id', '') for opt in options]
                
                # Exact match
                if correct_id not in opt_ids:
                    # Case-insensitive match
                    match_found = False
                    for opt in options:
                        oid = opt.get('id', '')
                        if oid.lower() == correct_id.lower():
                            fix_data['correct_option_id'] = oid
                            q_issues.append(f"CASE_MISMATCH: correct_option_id '{correct_id}' should be '{oid}'")
                            match_found = True
                            break
                    
                    if not match_found:
                        # Trim whitespace match
                        for opt in options:
                            oid = opt.get('id', '').strip()
                            if oid == correct_id.strip():
                                fix_data['correct_option_id'] = oid
                                q_issues.append(f"WHITESPACE_ID: correct_option_id has whitespace issue")
                                match_found = True
                                break
                        
                        if not match_found:
                            q_issues.append(f"WRONG_CORRECT_ID: '{correct_id}' not found in option ids {opt_ids}")
        
        # === CHECK 4: Missing answer ===
        if correct_id is None and correct_value is None and accepted is None:
            q_issues.append("MISSING_ANSWER: No correct_option_id, correct_value, or accepted_answers")
        
        # === CHECK 5: Missing explanation/rationale ===
        r_len = rationale_length(rationale)
        e_len = explanation_length(explanation)
        
        if r_len < 10 and e_len < 10:
            q_issues.append(f"MISSING_EXPLANATION: rationale_len={r_len}, explanation_len={e_len}")
        
        # === CHECK 6: Empty correct_value ===
        if correct_value is not None:
            if isinstance(correct_value, str) and len(correct_value.strip()) == 0:
                q_issues.append("EMPTY_VALUE: correct_value is empty string")
        
        # === CHECK 7: Question text formatting issues ===
        if text:
            if '\\n' in text:
                q_issues.append("TRAILING_NEWLINE: Question text has literal '\n' escape chars")
        
        # === CHECK 8: Could not find answer keywords in article ===
        if correct_id and options and article_text:
            correct_opt_text = ""
            for opt in options:
                if opt.get('id') == correct_id:
                    correct_opt_text = opt.get('text', '')
                    break
            if correct_opt_text and len(correct_opt_text) > 10:
                # Extract key terms from correct answer
                key_terms = re.findall(r'\b[a-zA-Z]{5,}\b', correct_opt_text.lower())
                key_terms = [t for t in key_terms if t not in ('which', 'their', 'these', 'those', 'there', 'would', 'could', 'should')]
                if key_terms:
                    found_terms = [t for t in key_terms if t in article_text]
                    if len(found_terms) < len(key_terms) * 0.3:
                        # Only flag if very few terms found
                        if len(key_terms) >= 3 and len(found_terms) == 0:
                            q_issues.append(f"ALIGNMENT: Key answer terms not in article: {key_terms[:5]}")
        
        if q_issues:
            total_issues += len(q_issues)
            articles_with_issues.add(art_name)
            fix_data['audit_notes'] = q_issues
            path = create_fix(art_dir, qid, fix_data)
            print(f"  [{qid[:8]}...] {'; '.join(q_issues[:2])}")
            if len(q_issues) > 2:
                print(f"    + {len(q_issues)-2} more issues")
            for issue in q_issues:
                all_issues.append({
                    'article': art_name,
                    'qid': qid,
                    'issue': issue,
                    'text_preview': text[:60] if text else '(empty)'
                })

# Run
for art in articles:
    audit_article(art)

print(f"\n\n{'='*60}")
print(f"AUDIT SUMMARY")
print(f"{'='*60}")
print(f"Articles scanned: {articles_scanned}")
print(f"Total questions scanned: {total_questions_scanned}")
print(f"Articles with issues: {len(articles_with_issues)}")
print(f"Total issues found: {total_issues}")
print(f"Fix files created: {total_fixes}")

print(f"\nIssue type breakdown:")
issue_types = Counter(i['issue'].split(':')[0] for i in all_issues)
for itype, count in issue_types.most_common():
    print(f"  [{count}] {itype}")

print(f"\nArticles with most issues:")
art_counts = Counter(i['article'] for i in all_issues)
for art_name, count in art_counts.most_common(20):
    print(f"  [{count}] {art_name}")
