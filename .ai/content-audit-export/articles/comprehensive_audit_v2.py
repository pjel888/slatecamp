#!/usr/bin/env python3
"""
Comprehensive audit of all Other Named articles.
Uses correct linked-questions.json schema.
"""

import os, json, sys, re
from collections import Counter, defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
ARTICLES_FILE = '/tmp/other_named.txt'

with open(ARTICLES_FILE) as f:
    articles = [line.strip() for line in f if line.strip()]

total_issues = 0
total_fixes = 0
all_issues = []
articles_with_issues = set()

def get_article_dir_name(dirname):
    """Extract name part from dirname like 'building-permit-process--uuid'"""
    return dirname.split('--')[0]

def extract_keywords(text):
    """Extract meaningful keywords from text."""
    if not text:
        return set()
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    return set(words)

def ensure_edits_dir(art_dir):
    edits_dir = os.path.join(BASE, art_dir, 'question-edits')
    os.makedirs(edits_dir, exist_ok=True)
    return edits_dir

def create_fix(art_dir, qid, fix_data):
    """Create or merge a question-edits file."""
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
    """Audit a single article's linked questions."""
    global total_issues
    art_name = get_article_dir_name(art_dir)
    local_fixes = 0
    
    lq_path = os.path.join(BASE, art_dir, 'linked-questions.json')
    norm_path = os.path.join(BASE, art_dir, 'normalized.md')
    
    # Read article content
    article_text = ""
    if os.path.exists(norm_path) and os.path.getsize(norm_path) > 0:
        with open(norm_path) as f:
            article_text = f.read().lower()
    
    # Read questions
    with open(lq_path) as f:
        data = json.load(f)
    
    questions = data.get('questions', [])
    if not questions:
        return
    
    print(f"\n{'='*60}")
    print(f"ARTICLE: {art_name}")
    print(f"{'='*60}")
    
    for q in questions:
        qid = q.get('question_id', 'unknown')
        text = q.get('text', '')
        options = q.get('options', [])
        correct_id = q.get('correct_option_id', None)
        correct_value = q.get('correct_value', None)
        rationale = q.get('rationale', '')
        explanation = q.get('explanation', '')
        qtype = q.get('question_type', 'unknown')
        accepted = q.get('accepted_answers', None)
        
        q_issues = []
        fix_data = {}
        
        # === CHECK 1: Missing or empty text ===
        if not text or len(text.strip()) < 5:
            q_issues.append("MISSING_TEXT: Question text is missing or too short")
        
        # === CHECK 2: Missing or empty options for multiple_choice ===
        if qtype == 'multiple_choice':
            if not options or len(options) == 0:
                q_issues.append("MISSING_OPTIONS: Multiple choice question has no options")
            elif len(options) < 2:
                q_issues.append(f"TOO_FEW_OPTIONS: Only {len(options)} option(s)")
            
            # Check for options with empty text
            for opt in options:
                opt_text = opt.get('text', '')
                if not opt_text or len(opt_text.strip()) < 1:
                    q_issues.append(f"EMPTY_OPTION_TEXT: Option {opt.get('id', '?')} has empty text")
            
            # === CHECK 3: Correct option ID doesn't match any option ===
            if correct_id and options:
                opt_ids = [opt.get('id', '') for opt in options]
                if correct_id not in opt_ids:
                    q_issues.append(f"WRONG_CORRECT_ID: '{correct_id}' not in option ids {opt_ids}")
        
        # === CHECK 4: Missing both correct_option_id and correct_value ===
        if correct_id is None and correct_value is None and accepted is None:
            q_issues.append("MISSING_ANSWER: No correct_option_id, correct_value, or accepted_answers")
        
        # === CHECK 5: Check missing or too-short rationale ===
        has_rationale = rationale and len(rationale.strip()) > 10
        has_explanation = explanation and len(explanation.strip()) > 10
        
        if not has_rationale and not has_explanation:
            q_issues.append("MISSING_EXPLANATION: No rationale or explanation found (or too short)")
        
        # === CHECK 6: Check for empty/malformed correct_value ===
        if correct_value is not None:
            if isinstance(correct_value, str) and len(correct_value.strip()) == 0:
                q_issues.append("EMPTY_VALUE: correct_value is empty string")
        
        # === CHECK 7: Check question text for weird formatting ===
        if text:
            # Check for cut-off text
            if text.endswith('\\n') or text.endswith('\\n\\n'):
                q_issues.append("TRAILING_NEWLINE: Question text has trailing newline escape codes")
            if text.count('"') % 2 != 0:
                q_issues.append("UNBALANCED_QUOTES: Question text has unbalanced quotes")
        
        # === CHECK 8: Check explanation quality ===
        if explanation and len(explanation.strip()) > 10:
            if explanation.strip().lower() == rationale.strip().lower():
                if len(explanation) > 10:
                    q_issues.append("DUPLICATE_EXPLANATION: rationale and explanation are identical")
        
        # === CHECK 9: Check for potentially wrong answers via article content ===
        if correct_id and options and article_text:
            correct_opt = None
            for opt in options:
                if opt.get('id') == correct_id:
                    correct_opt = opt.get('text', '')
                    break
            if correct_opt:
                # Check correct answer keywords are supported by article
                pass  # This is complex - skip for bulk scan
        
        # === CHECK 10: Verify correct_option_id case sensitivity ===
        if correct_id and options:
            opt_ids = [opt.get('id', '') for opt in options]
            # Check case-insensitive match
            match_found = any(opt_id.lower() == correct_id.lower() for opt_id in opt_ids)
            if match_found and correct_id not in opt_ids:
                # Find the correct case
                for opt in options:
                    if opt.get('id', '').lower() == correct_id.lower():
                        fix_data['correct_option_id'] = opt.get('id')
                        q_issues.append(f"CASE_MISMATCH: correct_option_id '{correct_id}' should be '{opt.get('id')}'")
                        break
            
            # Check for trailing whitespace/hidden chars in option IDs
            if correct_id and correct_id != correct_id.strip():
                fix_data['correct_option_id'] = correct_id.strip()
                q_issues.append(f"WHITESPACE_ID: correct_option_id '{repr(correct_id)}' has whitespace")
        
        if q_issues:
            total_issues += len(q_issues)
            articles_with_issues.add(art_name)
            fix_data['audit_notes'] = q_issues
            path = create_fix(art_dir, qid, fix_data)
            print(f"  [{qid[:8]}...] {'; '.join(q_issues[:3])}")
            if len(q_issues) > 3:
                print(f"    + {len(q_issues)-3} more issues")
            for issue in q_issues:
                all_issues.append({
                    'article': art_name,
                    'qid': qid,
                    'issue': issue,
                    'text_preview': text[:60] if text else '(empty)'
                })

# Run audit
for art in articles:
    audit_article(art)

# Summary
print(f"\n\n{'='*60}")
print(f"AUDIT SUMMARY")
print(f"{'='*60}")
print(f"Articles scanned: {len(articles)}")
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
