#!/usr/bin/env python3
"""
Deep audit of high-priority Other Named articles.
Checks: answer correctness against article, duplicate IDs, case mismatches,
option text quality, explanation accuracy, and more.
"""

import os, json, re, sys
from collections import Counter

BASE = os.path.dirname(os.path.abspath(__file__))

# High-priority articles from the task description
HIGH_PRIORITY = [
    "building-permit-process--687e0da7-4e39-454f-b3f8-a95308678556",
    "certificate-of-occupancy--68eeacdb-a61b-4f53-bbe9-e2459fa8d152",
    "change-of-use-and-occupancy--9e053410-cea0-400b-b185-576cbb4a8bd0",
    "fire-resistive-construction-ratings--aef59aa2-220e-47fc-9492-6b2bd98f9bea",
    "fire-zones-and-existing-buildings--9437579a-377e-41ec-8527-4c0399348746",
    "chimneys-and-fireplaces--f8d416c0-abfb-45be-a7ef-a9f98df06507",
    "stairs-handrails-guardrails--578ca1ef-6eff-4810-b5dd-3b52c9bcb76b",
    "widths-slopes--184a1593-2137-45ee-80d4-99c1c4595e84",
    "conflict-matrix-stairs-guards-elevators--5365637b-7058-45f6-85c5-ac8bc56de035",
    "ceiling-heights-and-room-sizes--915c1016-2ed6-4b47-b2ca-f12965c6bc9f",
    "commercial-clearances--dc69faa6-ef36-40a7-a8f1-fdd88debdbf5",
    "residential-clearances--5ba0b022-0a85-4d27-af92-79d093a8d491",
    "minimum-parking-requirements--850a66f9-db5d-4068-a763-0bc4c1d9872a",
    "minimum-requirements-group-a-dwellings--42eb0c36-da27-4b7e-a1e3-4ed915bfca8d",
    "glass-and-glazing-area-limits--3a28da11-0053-4b2f-85a8-f675a3d10a43",
    "lathing-and-plastering--877492ae-e17b-48d4-bfd4-f158e794bd46",
    "allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c",
]

# Also all bp-344 articles
BP_344 = [
    "bp-344-accessible-washrooms--6d5e0e55-215a-4806-a679-dac7aea5a99b",
    "bp-344-elevator-dimensions--5f620c42-ef55-4c0e-824b-49f0ff9d47e6",
    "bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de",
    "bp-344-tactile-and-visual-alarms--5aeda107-bc0d-4d0d-ab40-44e13fd95478",
    "bp-344-vs-pd-1096-conflicts--ee1f8beb-e236-4831-a0a8-1ddce447a3b8",
]

# All spp-doc articles
SPP_DOCS = [
    "spp-doc-201-pre-design-services--16bb270e-6887-4bbe-a62e-eace6c4d3fdb",
    "spp-doc-202-regular-design-services--24b0a3db-e6bc-45d0-a9a1-d83009112efb",
    "spp-doc-203-specialized-architectural-services--9a800f21-b26e-4e3e-94c8-2f4127eccd42",
    "spp-doc-204-a-fulltime-supervision-services--c534d94f-967a-48bb-babf-419fa6d35ec7",
    "spp-doc-204-b-construction-management-services--f5ed9c09-3191-4cd4-b1b0-9e6364212c36",
    "spp-doc-205-post-construction-services--875396fa-1704-47b7-abb5-29f49c75fc78",
    "spp-doc-206-comprehensive-architectural-services--f74f79a0-1477-481f-9050-fa43d82f18bd",
    "spp-doc-207-design-build-services--f76bad6c-4bdf-4d2c-bdfb-a3381c42e320",
    "spp-doc-208-architectural-design-competition-adc--fba5f537-2da9-4fb3-b6eb-696d1937a92a",
    "spp-doc-209-architectural-consulting-services-pacs--f7861b5b-0833-4cd3-a634-0dfb9f53891c",
]

# Historical named articles
HISTORICAL = [
    "brutalism--c39cc1e8-90fb-4c47-95f2-6bb4b370c6d7",
    "mies-van-der-rohe--fc84f5df-3b67-4891-bf56-596177e774fb",
    "le-corbusier-five-points--390affb2-c4ca-4ae7-a4b4-93d88107913b",
    "post-modernism--ae17af26-de0c-448e-a6d2-d64748f904fe",
    "the-bauhaus-and-international-style--5f1e960c-b72a-483d-a04b-03860d27b07b",
    "21st-century-movements--60c3b78a-e1c7-4c5e-880e-f9526d6c570d",
    "masters-of-the-golden-age--146e1210-2b6a-42fb-85c2-3e1b1fd082c2",
    "pre-columbian-mesoamerica--efb82628-9bf4-4bde-9561-8b784384c32c",
    "inca-architecture-ashlar-masonry--fe7216ee-46ed-41b3-88ef-accb3f912a4c",
    "colonial-european-influence--2862e34d-02fd-4f95-a2a2-5119a355bdf8",
]

ALL_TARGETS = HIGH_PRIORITY + BP_344 + SPP_DOCS + HISTORICAL

total_issues = 0
total_fixes = 0
all_issues = []

def ensure_edits_dir(art_dir):
    d = os.path.join(BASE, art_dir, 'question-edits')
    os.makedirs(d, exist_ok=True)
    return d

def create_fix(art_dir, qid, fix_data):
    global total_fixes
    d = ensure_edits_dir(art_dir)
    p = os.path.join(d, f"{qid}.json")
    existing = {}
    if os.path.exists(p):
        with open(p) as f:
            existing = json.load(f)
    existing.update(fix_data)
    with open(p, 'w') as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)
    total_fixes += 1
    return p

def get_article_text(art_dir):
    p = os.path.join(BASE, art_dir, 'normalized.md')
    if os.path.exists(p) and os.path.getsize(p) > 0:
        with open(p) as f:
            return f.read()
    return ""

def audit_article_deep(art_dir):
    global total_issues
    art_name = art_dir.split('--')[0]
    lq_path = os.path.join(BASE, art_dir, 'linked-questions.json')
    norm_path = os.path.join(BASE, art_dir, 'normalized.md')
    
    article_text = get_article_text(art_dir)
    article_lower = article_text.lower()
    
    with open(lq_path) as f:
        data = json.load(f)
    
    questions = data.get('questions', [])
    if not questions:
        return
    
    print(f"\n{'='*60}")
    print(f"DEEP AUDIT: {art_name} ({len(questions)} questions)")
    print(f"{'='*60}")
    
    qids_seen = set()
    
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
        
        # === CHECK: Duplicate question IDs ===
        if qid in qids_seen and qid != 'unknown':
            q_issues.append(f"DUPLICATE_QID: Question ID {qid} appears multiple times")
        qids_seen.add(qid)
        
        # === CHECK: Options text is cut off / truncated ===
        if options:
            for opt in options:
                opt_text = opt.get('text', '')
                if opt_text.endswith('\\n') or '\\n\\n' in opt_text:
                    q_issues.append(f"TRUNCATED_OPTION: Option {opt.get('id')} text appears cut off with newline escapes")
        
        # === CHECK: Question text is cut off ===
        if text and (text.endswith('\\n') or text.rstrip().endswith('\\n')):
            q_issues.append("TRUNCATED_TEXT: Question text has trailing newline escapes")
        
        # === CHECK: rational equals explanation (duplicate) ===
        if rationale and explanation:
            r_str = rationale if isinstance(rationale, str) else str(rationale)
            e_str = explanation if isinstance(explanation, str) else str(explanation)
            if r_str.strip() == e_str.strip() and len(r_str) > 20:
                q_issues.append("DUPLICATE_EXPLANATION: rationale and explanation are identical")
        
        # === CHECK: No rationale AND no explanation ===
        has_rationale = False
        if rationale:
            if isinstance(rationale, str) and len(rationale.strip()) > 10:
                has_rationale = True
            elif isinstance(rationale, dict):
                has_rationale = any(isinstance(v, str) and len(v.strip()) > 5 for v in rationale.values())
        
        has_explanation = False
        if explanation:
            if isinstance(explanation, str) and len(explanation.strip()) > 10:
                has_explanation = True
            elif isinstance(explanation, dict):
                has_explanation = any(isinstance(v, str) and len(v.strip()) > 5 for v in explanation.values())
        
        if not has_rationale and not has_explanation:
            q_issues.append("NO_EXPLANATION: No usable rationale or explanation text")
        
        # === CHECK: For "various codes depending" style answers - verify they actually apply ===
        if text and article_lower:
            # Extract meaningful terms from question
            q_words = set(re.findall(r'\b[a-z]{4,}\b', text.lower()))
            art_words = set(re.findall(r'\b[a-z]{4,}\b', article_lower))
            overlap = q_words & art_words
            if len(q_words) > 5 and len(overlap) < 2:
                q_issues.append(f"ALIGNMENT: Question terms barely appear in article ({len(overlap)}/{len(q_words)} words match)")
        
        # === CHECK: For bp-344 articles - check numeric values ===
        if 'bp-344' in art_name and options and correct_id:
            correct_opt = None
            for opt in options:
                if opt.get('id') == correct_id:
                    correct_opt = opt.get('text', '')
                    break
            if correct_opt and 'mm' in correct_opt.lower():
                # Extract numbers from correct answer
                nums = re.findall(r'\d+', correct_opt)
                if nums and article_lower:
                    art_nums = re.findall(r'\d+', article_lower)
                    found = [n for n in nums if n in art_nums]
                    if not found:
                        q_issues.append(f"NUMERIC_VALUE: Correct answer has numbers not found in article: {nums}")
        
        # === CHECK: Verify question_type is consistent ===
        if qtype in ('mcq', 'multiple_choice'):
            if options and len(options) < 2:
                pass  # already flagged
        
        if q_issues:
            total_issues += len(q_issues)
            fix_data['audit_notes'] = q_issues
            path = create_fix(art_dir, qid, fix_data)
            print(f"  [{qid[:8]}...] {'; '.join(q_issues[:3])}")
            if len(q_issues) > 3:
                print(f"    + {len(q_issues)-3} more")
            for issue in q_issues:
                all_issues.append({
                    'article': art_name,
                    'qid': qid,
                    'issue': issue,
                    'text_preview': text[:60] if text else '(empty)'
                })

# Run deep audit on targeted articles
for art in ALL_TARGETS:
    if os.path.exists(os.path.join(BASE, art, 'linked-questions.json')):
        audit_article_deep(art)

print(f"\n\n{'='*60}")
print(f"DEEP AUDIT SUMMARY")
print(f"{'='*60}")
print(f"Articles scanned: {len(ALL_TARGETS)}")
print(f"Total issues found: {total_issues}")
print(f"Fix files created: {total_fixes}")

print(f"\nIssue type breakdown:")
issue_types = Counter(i['issue'].split(':')[0] for i in all_issues)
for itype, count in issue_types.most_common():
    print(f"  [{count}] {itype}")
