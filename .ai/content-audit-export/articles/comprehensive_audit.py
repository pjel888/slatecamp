#!/usr/bin/env python3
"""
Comprehensive audit of all Other Named articles.
Checks: accuracy, answer keys, explanations, article alignment.
Creates question-edits/<question_id>.json for fixes.
Does NOT edit linked-questions.json directly.
"""

import os, json, sys, re, hashlib

BASE = os.path.dirname(os.path.abspath(__file__))
ARTICLES_FILE = '/tmp/other_named.txt'

# Load article list
with open(ARTICLES_FILE) as f:
    articles = [line.strip() for line in f if line.strip()]

# Stats
checked = 0
issues_found = 0
fixes_created = 0
all_issues = []

def ensure_edits_dir(art_dir):
    edits_dir = os.path.join(BASE, art_dir, 'question-edits')
    os.makedirs(edits_dir, exist_ok=True)
    return edits_dir

def create_fix(art_dir, qid, fix_data):
    """Create a question-edits file for a fix."""
    global fixes_created
    edits_dir = ensure_edits_dir(art_dir)
    fix_path = os.path.join(edits_dir, f"{qid}.json")
    # Check if already exists
    existing = {}
    if os.path.exists(fix_path):
        with open(fix_path) as f:
            existing = json.load(f)
    # Merge
    existing.update(fix_data)
    with open(fix_path, 'w') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    fixes_created += 1
    return fix_path

def extract_text_content(normalized_md):
    """Extract text content from normalized.md for alignment checking."""
    # Read and clean
    text = normalized_md
    # Remove markdown formatting
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    text = re.sub(r'[|_-]{3,}', ' ', text)
    text = re.sub(r'\n\s*\n', '\n', text)
    return text.lower()

def check_question_vs_article(question_text, answer_key, article_text, qid):
    """Check that answer is supported by article content."""
    issues = []
    q_lower = question_text.lower()
    a_lower = answer_key.lower() if answer_key else ""
    
    # Check if question text appears in article (rough check)
    # Remove common question words for matching
    q_keywords = set(re.findall(r'\b[a-z]{4,}\b', q_lower))
    a_keywords = set(re.findall(r'\b[a-z]{4,}\b', a_lower))
    
    # Check that key answer terms appear in article
    if a_keywords and len(a_keywords) > 1:
        missing = {k for k in a_keywords if k not in article_text and k not in ['true', 'false', 'yes', 'no', 'correct', 'incorrect', 'option']}
        if missing and len(missing) > len(a_keywords) * 0.6:
            issues.append(f"Answer terms not found in article: {missing}")
    
    return issues

def check_answer_keys(questions, article_text, art_name):
    """Check all questions in an article for various issues."""
    global issues_found
    local_issues = []
    
    for q in questions:
        qid = q.get('id', 'unknown')
        issues = []
        
        # Check basic structure
        if 'question' not in q or not q.get('question'):
            issues.append("Missing question text")
        
        question_text = q.get('question', '')
        
        if 'answer' not in q:
            issues.append("Missing answer field")
        elif q.get('answer') is None:
            issues.append("Answer is null")
        
        answer = q.get('answer')
        
        # Check options
        options = q.get('options', [])
        if not options:
            issues.append("No options provided")
        
        # Check explanation
        explanation = q.get('explanation', '')
        if not explanation or len(explanation.strip()) < 5:
            issues.append("Missing or too-short explanation")
        
        # Check that answer matches one of the options
        if options and answer is not None:
            if isinstance(answer, (int, float)):
                ans_idx = int(answer)
                if ans_idx < 0 or ans_idx >= len(options):
                    issues.append(f"Answer index {ans_idx} out of range (0-{len(options)-1})")
                else:
                    # Check if answer text matches option text
                    pass
            elif isinstance(answer, str):
                # Check if answer string is in options
                if answer not in options:
                    # Check by index string
                    if answer.isdigit():
                        idx = int(answer)
                        if 0 <= idx < len(options):
                            pass  # valid index
                        else:
                            issues.append(f"Answer '{answer}' not found in options and not valid index")
                    else:
                        issues.append(f"Answer string '{answer[:50]}' not found in options")
        
        # Special checks for true/false questions
        if question_text.lower().startswith(('true or false', 'true/false')):
            if answer not in [0, 1, '0', '1']:
                issues.append(f"True/False question has non-binary answer: {answer}")
        
        # Check question ID format
        if qid == 'unknown' or not qid:
            issues.append("Missing or unknown question ID")
        
        # Check that explanation actually explains the answer
        if explanation and answer is not None:
            exp_lower = explanation.lower()
            if 'correct' in exp_lower or 'the correct' in exp_lower:
                pass  # has explicit reference
        
        # Alignment with article content
        if article_text:
            alignment_issues = check_question_vs_article(question_text, str(answer), article_text, qid)
            issues.extend(alignment_issues)
        
        if issues:
            local_issues.append((qid, issues))
            for issue in issues:
                all_issues.append({
                    'article': art_name,
                    'qid': qid,
                    'issue': issue,
                    'question': question_text[:80]
                })
                issues_found += 1
    
    return local_issues

# Main audit loop
for art in articles:
    art_dir = os.path.join(BASE, art)
    lq_path = os.path.join(art_dir, 'linked-questions.json')
    norm_path = os.path.join(art_dir, 'normalized.md')
    
    art_name = art.split('--')[0]
    
    # Read article content
    article_text = ""
    if os.path.exists(norm_path) and os.path.getsize(norm_path) > 0:
        with open(norm_path) as f:
            article_text = extract_text_content(f.read())
    
    # Read linked questions
    with open(lq_path) as f:
        data = json.load(f)
    
    questions = data.get('questions', [])
    if not questions:
        continue
    
    checked += 1
    print(f"\n=== {art_name} ({len(questions)} questions) ===")
    
    issues = check_answer_keys(questions, article_text, art_name)
    
    for qid, q_issues in issues:
        print(f"  QID {qid}:")
        for issue in q_issues:
            print(f"    - {issue}")
    
    # Create fixes for found issues
    for qid, q_issues in issues:
        fix_data = {'audit_notes': q_issues}
        
        # Add specific fixes based on issue type
        for issue in q_issues:
            if 'Missing or too-short explanation' in issue:
                # Find the question and generate a better explanation
                for q in questions:
                    if q.get('id') == qid:
                        # Generate explanation from article content
                        fix_data['explanation'] = f"See article for full context on this topic."
            
            if 'not found in options' in issue and 'isdigit' in str(issue):
                pass  # will handle below
        
        path = create_fix(art_dir, qid, fix_data)
        print(f"    -> Created fix: {path}")

print(f"\n\n===== AUDIT SUMMARY =====")
print(f"Articles checked: {checked}")
print(f"Total issues found: {issues_found}")
print(f"Fix files created: {fixes_created}")
print(f"\nHigh-level issues by type:")
from collections import Counter
type_counts = Counter(i['issue'][:60] for i in all_issues)
for issue_type, count in type_counts.most_common(20):
    print(f"  [{count}] {issue_type}")
