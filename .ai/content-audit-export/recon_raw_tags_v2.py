#!/usr/bin/env python3
"""Full reconnaissance - refined version with proper metadata extraction."""
import json, os, re, sys

ARTICLES_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
REPORT_DIR = os.path.dirname(ARTICLES_DIR)

def get_category(meta_path):
    """Extract subject_label from article-metadata.json."""
    if not os.path.exists(meta_path):
        return "unknown"
    try:
        with open(meta_path, 'r') as f:
            md = json.load(f)
        # Try various field names
        for key in ['subject_label', 'category', 'subject', 'section', 'topic']:
            if key in md:
                return md[key]
        return "unknown"
    except:
        return "unknown"

def get_subject_prefix(dirname):
    """Extract subject prefix from directory name."""
    prefixes = {
        'lea-strc': 'Structures',
        'lea-theo': 'Theory',
        'lea-hist': 'History',
        'lea-dsgn': 'Design',
        'lea-plan': 'Planning/Urban',
        'lea-matl': 'Materials',
        'lea-util': 'Utilities',
        'lea-prac-law': 'Practice-Law',
        'lea-prac-frm': 'Practice-Framework',
        'lea-prac-eth': 'Practice-Ethics',
        'lea-prac-ctr': 'Practice-Contracts',
        'lea-prac-cmp': 'Practice-Compensation',
        'lea-prac-svc': 'Practice-Services',
    }
    for prefix, label in prefixes.items():
        if dirname.startswith(prefix):
            return label
    return 'Misc'

TAG_PATTERNS = [
    (r'<Warn>', 'Warn'),
    (r'<Tip>', 'Tip'),
    (r'<ExamTip>', 'ExamTip'),
    (r'<LawCallout>', 'LawCallout'),
]

def extract_tag_details(content, tag_name):
    """Extract detailed info about tag occurrences."""
    pattern = re.compile(rf'<{tag_name}[^>]*>.*?</{tag_name}>', re.DOTALL)
    matches = pattern.findall(content)
    
    results = []
    for m in matches:
        has_attrs = bool(re.search(rf'<{tag_name}\s+\w+', m))
        has_nested = bool(re.search(r'<[A-Z]', m[m.index('>')+1:]))
        is_multiline = '\n' in m
        has_code_attr = 'code=' in m or 'code =' in m
        
        is_simple = not (has_attrs or has_nested or is_multiline)
        
        results.append({
            'full_match': m[:200],
            'simple': is_simple,
            'has_attributes': has_attrs,
            'has_nested_content': has_nested,
            'has_code_attr': has_code_attr,
            'multiline': is_multiline,
            'length': len(m),
        })
    return results

def check_other_tags(content):
    """Find any other component tags not in the main list."""
    known = {'Warn','Tip','ExamTip','LawCallout','WarningTag','InfoCallout','WikiMistakeList','MCQ'}
    # HTML tags to exclude
    html_tags = {'div','span','p','br','hr','img','a','ul','ol','li','table','tr','td','th',
                 'h1','h2','h3','h4','h5','h6','strong','em','b','i','u','s','code','pre',
                 'blockquote','input','button','form','label','select','option','textarea',
                 'nav','header','footer','main','section','article','aside','figure','figcaption',
                 'details','summary','mark','time','video','audio','source','picture','iframe',
                 'canvas','svg','path','g','rect','circle','line','text','tspan','defs','use',
                 'clipPath','mask','linearGradient','radialGradient','stop','style','script',
                 'link','meta','title','head','body','html','DD','DL','DT','sup','sub','dd','dl','dt'}
    
    tags = re.findall(r'<([A-Z][a-zA-Z]+)[>\s]', content)
    tags = [t for t in tags if t not in known and t not in html_tags]
    return sorted(set(tags))

results = []

for d in sorted(os.listdir(ARTICLES_DIR)):
    article_path = os.path.join(ARTICLES_DIR, d)
    if not os.path.isdir(article_path) or '--' not in d:
        continue
    
    nmd = os.path.join(article_path, 'normalized.md')
    uib = os.path.join(article_path, 'ui-blocks.json')
    meta = os.path.join(article_path, 'article-metadata.json')
    qed = os.path.join(article_path, 'question-edits')
    
    if not os.path.exists(nmd):
        continue
    
    with open(nmd, 'r') as f:
        content = f.read()
    
    # Extract category
    category = get_category(meta)
    if category == "unknown":
        category = get_subject_prefix(d)
    
    # Check for each tag type
    tags_found = {}
    total_matches = 0
    for pat, tag_name in TAG_PATTERNS:
        details = extract_tag_details(content, tag_name)
        if details:
            tags_found[tag_name] = details
            total_matches += len(details)
    
    # Check for other component tags
    other_tags = check_other_tags(content)
    
    # Skip articles with NO raw component tags (only HTML or nothing)
    if not tags_found and not other_tags:
        continue
    
    # ui-blocks.json info
    has_uib = os.path.exists(uib)
    uib_blocks = 0
    if has_uib:
        with open(uib, 'r') as f:
            try:
                uib_data = json.load(f)
                uib_blocks = len(uib_data) if isinstance(uib_data, (dict, list)) else 0
            except:
                uib_blocks = -1
    
    # question-edits info
    has_qed = os.path.exists(qed) and os.path.isdir(qed)
    
    entry = {
        'dir': d,
        'category': category,
        'tags': tags_found,
        'total_tag_instances': total_matches,
        'other_tags': other_tags,
        'has_ui_blocks': has_uib,
        'ui_blocks_count': uib_blocks,
        'has_question_edits': has_qed,
    }
    results.append(entry)

# ===== SUMMARY =====
warn_articles = [r for r in results if 'Warn' in r['tags']]
tip_articles = [r for r in results if 'Tip' in r['tags']]
examtip_articles = [r for r in results if 'ExamTip' in r['tags']]
lawcallout_articles = [r for r in results if 'LawCallout' in r['tags']]
other_only = [r for r in results if not r['tags'] and r['other_tags']]

primary_articles = [r for r in results if r['tags']]  # Has Warn, Tip, ExamTip, or LawCallout

print("=" * 80)
print("RAW COMPONENT TAG RECONNAISSANCE REPORT")
print("=" * 80)

print(f"\nTotal articles affected: {len(results)}")
print(f"  Primary tags (Warn/Tip/ExamTip/LawCallout): {len(primary_articles)}")
print(f"  Other component tags only: {len(other_only)}")

print(f"\n--- Tag Counts ---")
print(f"  <Warn>: {len(warn_articles)} articles")
print(f"  <Tip>: {len(tip_articles)} articles")
print(f"  <ExamTip>: {len(examtip_articles)} articles")
print(f"  <LawCallout>: {len(lawcallout_articles)} articles")

# Overlap
print(f"\n--- Overlaps ---")
warn_only = [r for r in results if r['tags'].keys() == {'Warn'}]
tip_only = [r for r in results if r['tags'].keys() == {'Tip'}]
examtip_only = [r for r in results if r['tags'].keys() == {'ExamTip'}]
lawcallout_only = [r for r in results if r['tags'].keys() == {'LawCallout'}]
warn_tip = [r for r in results if 'Warn' in r['tags'] and 'Tip' in r['tags']]
warn_examtip = [r for r in results if 'Warn' in r['tags'] and 'ExamTip' in r['tags']]
tip_examtip = [r for r in results if 'Tip' in r['tags'] and 'ExamTip' in r['tags']]
print(f"  Warn only: {len(warn_only)}")
print(f"  Tip only: {len(tip_only)}")
print(f"  ExamTip only: {len(examtip_only)}")
print(f"  LawCallout only: {len(lawcallout_only)}")
print(f"  Tip + ExamTip: {len(tip_examtip)}")

# Total with Warn/Tip/ExamTip (the original 60)
warni_tip_examtip = [r for r in results if any(t in r['tags'] for t in ['Warn','Tip','ExamTip'])]
print(f"\n  Total with Warn/Tip/ExamTip (original 60): {len(warni_tip_examtip)}")

print(f"\n--- UI-Blocks.json ---")
with_uib = [r for r in primary_articles if r['has_ui_blocks']]
without_uib = [r for r in primary_articles if not r['has_ui_blocks']]
print(f"  Has ui-blocks.json: {len(with_uib)}")
print(f"  No ui-blocks.json: {len(without_uib)}")

print(f"\n--- Question-Edits ---")
with_qed = [r for r in primary_articles if r['has_question_edits']]
without_qed = [r for r in primary_articles if not r['has_question_edits']]
print(f"  Has question-edits: {len(with_qed)}")
print(f"  No question-edits: {len(without_qed)}")

print(f"\n--- Category Breakdown (Primary Articles) ---")
cats = {}
for r in primary_articles:
    c = r['category']
    if c not in cats:
        cats[c] = []
    cats[c].append(r['dir'])
for c in sorted(cats.keys()):
    print(f"  {c}: {len(cats[c])} articles")

print(f"\n--- Other Component Tags Found (not Warn/Tip/ExamTip/LawCallout) ---")
other_tag_types = {}
for r in results:
    for t in r['other_tags']:
        if t not in other_tag_types:
            other_tag_types[t] = []
        other_tag_types[t].append(r['dir'])
for t in sorted(other_tag_types.keys()):
    print(f"  <{t}>: {len(other_tag_types[t])} articles")

# Tag structure classification
print(f"\n--- Tag Structure Classification ---")
for tag_name in ['Warn', 'Tip', 'ExamTip', 'LawCallout']:
    simple = 0
    complex_ = 0
    with_code = 0
    for r in results:
        if tag_name in r['tags']:
            for d in r['tags'][tag_name]:
                if d['simple']:
                    simple += 1
                else:
                    complex_ += 1
                if d['has_code_attr']:
                    with_code += 1
    total = simple + complex_
    print(f"  <{tag_name}>: {total} total — {simple} simple, {complex_} complex ({with_code} with code=)")

# ===== DETAILED PER-ARTICLE =====
print(f"\n{'='*120}")
print("DETAILED PER-ARTICLE LIST")
print("=" * 120)

for r in primary_articles:
    ct = r['category']
    print(f"\n{r['dir']}")
    print(f"  Category: {ct}")
    print(f"  UI-Blocks: {'YES (' + str(r['ui_blocks_count']) + ' blocks)' if r['has_ui_blocks'] else 'NO'}")
    print(f"  Q-Edits: {'YES' if r['has_question_edits'] else 'NO'}")
    
    for tag, details in sorted(r['tags'].items()):
        labels = []
        for d in details:
            if d['simple']:
                labels.append('SIMPLE')
            else:
                parts = ['COMPLEX']
                if d['has_nested_content']: parts.append('NESTED')
                if d['has_attributes']: parts.append('ATTRS')
                if d['has_code_attr']: parts.append('code=')
                if d['multiline']: parts.append('MULTI')
                labels.append('+'.join(parts))
        print(f"  <{tag}>: {len(details)}x [{', '.join(labels)}]")

for r in other_only:
    print(f"\n{r['dir']}")
    print(f"  Category: {r['category']}")
    print(f"  UI-Blocks: {'YES (' + str(r['ui_blocks_count']) + ' blocks)' if r['has_ui_blocks'] else 'NO'}")
    print(f"  Other tags: {', '.join(f'<{t}>' for t in r['other_tags'])}")

# Save report files
json_path = os.path.join(REPORT_DIR, 'raw_tags_recon_detailed.json')
with open(json_path, 'w') as f:
    json.dump(results, f, indent=2, default=str)
print(f"\n\nDetailed JSON: {json_path}")

# Create batch-ready CSV
csv_path = os.path.join(REPORT_DIR, 'raw_tags_batch_list.csv')
with open(csv_path, 'w') as f:
    f.write("dir,category,tags,instances,has_ui_blocks,ui_blocks_count,has_question_edits,other_tags\n")
    for r in results:
        tags_str = '+'.join(r['tags'].keys()) if r['tags'] else '-'
        inst_str = str(r['total_tag_instances'])
        other_str = ' '.join(f'<{t}>' for t in r['other_tags'])
        f.write(f"{r['dir']},{r['category']},{tags_str},{inst_str},{r['has_ui_blocks']},{r['ui_blocks_count']},{r['has_question_edits']},{other_str}\n")
print(f"Batch CSV: {csv_path}")
