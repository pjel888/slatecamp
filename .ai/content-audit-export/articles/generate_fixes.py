#!/usr/bin/env python3
"""
Generate question-edits files for all issues found in Other Named articles.
Creates fix files for:
1. Duplicate questions (same text, same options, same answer - different QID)
2. Cross-article duplicates (questions shared between articles)
3. Any other structural issues found

Does NOT edit linked-questions.json directly.
"""

import os, json
from collections import defaultdict

BASE = os.path.dirname(os.path.abspath(__file__))
ARTICLES_FILE = '/tmp/other_named.txt'

with open(ARTICLES_FILE) as f:
    articles = [line.strip() for line in f if line.strip()]

fixes_created = 0
duplicate_pairs = 0
triplicate_groups = 0

def read_questions(art_dir):
    path = os.path.join(BASE, art_dir, 'linked-questions.json')
    with open(path) as f:
        data = json.load(f)
    return data.get('questions', [])

def ensure_edits_dir(art_dir):
    d = os.path.join(BASE, art_dir, 'question-edits')
    os.makedirs(d, exist_ok=True)
    return d

def create_fix(art_dir, qid, fix_data, merge=True):
    global fixes_created
    d = ensure_edits_dir(art_dir)
    p = os.path.join(d, f"{qid}.json")
    existing = {}
    if os.path.exists(p) and merge:
        with open(p) as f:
            existing = json.load(f)
    existing.update(fix_data)
    with open(p, 'w') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    fixes_created += 1

def q_signature(q):
    """Create a signature for duplicate detection."""
    text = q.get('text', '')
    correct_id = q.get('correct_option_id', '')
    opt_texts = [o.get('text', '') for o in q.get('options', [])]
    opt_ids = [o.get('id', '') for o in q.get('options', [])]
    return json.dumps({
        'text': text,
        'correct_option_id': correct_id,
        'option_texts': opt_texts,
        'option_ids': opt_ids,
        'correct_value': q.get('correct_value'),
        'accepted_answers': q.get('accepted_answers'),
    }, sort_keys=True)

print("=" * 60)
print("GENERATING QUESTION-EDITS FIX FILES")
print("=" * 60)

# Step 1: Find within-article duplicates
for art in articles:
    questions = read_questions(art)
    art_name = art.split('--')[0]
    
    by_sig = defaultdict(list)
    for q in questions:
        sig = q_signature(q)
        by_sig[sig].append(q)
    
    for sig, qs in by_sig.items():
        if len(qs) > 1:
            # Mark all but the first as duplicates
            qids = [q.get('question_id', 'unknown') for q in qs]
            
            # The first one is the canonical/keep copy
            keep_qid = qs[0].get('question_id', 'unknown')
            
            for i, q in enumerate(qs):
                qid = q.get('question_id', 'unknown')
                if i == 0:
                    continue  # Skip the first (keep this one)
                
                duplicate_of = qs[0].get('question_id', 'unknown')
                
                fix_data = {
                    'status': 'duplicate',
                    'duplicate_of': duplicate_of,
                    'audit_note': f"Exact duplicate of question {duplicate_of} in same article. Same text, options, and correct answer.",
                    'action': 'remove'
                }
                create_fix(art, qid, fix_data)
                duplicate_pairs += 1
            
            if len(qs) > 2:
                triplicate_groups += 1
                print(f"  TRIPLICATE: {art_name} - {len(qs)} copies of QID starting {qids[0][:8]}")

# Step 2: Find cross-article duplicates
print("\nCross-article duplicates:")
all_questions = []
for art in articles:
    questions = read_questions(art)
    for q in questions:
        all_questions.append({
            'art_dir': art,
            'art_name': art.split('--')[0],
            'q': q,
            'sig': q_signature(q)
        })

cross_dup_count = 0
by_sig_all = defaultdict(list)
for aq in all_questions:
    by_sig_all[aq['sig']].append(aq)

for sig, aqs in by_sig_all.items():
    unique_articles = set(aq['art_name'] for aq in aqs)
    if len(unique_articles) > 1:
        # Cross-article duplicate
        for aq in aqs:
            # Get all other articles where this question appears
            other_articles = [x['art_name'] for x in aqs if x['art_name'] != aq['art_name']]
            other_articles = list(set(other_articles))
            if other_articles:
                qid = aq['q'].get('question_id', 'unknown')
                fix_data = {
                    'audit_note': f"Question also appears in article(s): {', '.join(other_articles)}. Verify which article content supports this question.",
                    'cross_article_with': other_articles
                }
                create_fix(aq['art_dir'], qid, fix_data)
                cross_dup_count += 1
        
        print(f"  Cross-article: \"{aqs[0]['q'].get('text','')[:60]}...\"")
        articles_list = [(aq['art_name'], aq['q'].get('question_id','')[:8]) for aq in aqs]
        print(f"    In: {articles_list}")

# Summary
print(f"\n{'='*60}")
print(f"FIX FILE GENERATION SUMMARY")
print(f"{'='*60}")
print(f"Within-article duplicate pairs flagged: {duplicate_pairs}")
print(f"Triplicate groups found: {triplicate_groups}")
print(f"Cross-article duplicate fix files: {cross_dup_count}")
print(f"Total fix files created: {fixes_created}")
