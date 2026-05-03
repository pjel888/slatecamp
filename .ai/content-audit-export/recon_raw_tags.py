#!/usr/bin/env python3
"""Full reconnaissance of articles with raw MDX component tags."""
import json, os, re, sys

ARTICLES_DIR = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# All article directories
all_dirs = [d for d in os.listdir(ARTICLES_DIR) 
            if os.path.isdir(os.path.join(ARTICLES_DIR, d)) and '--' in d]

# Patterns for raw component tags
TAG_PATTERNS = [
    (r'<Warn>', 'Warn'),
    (r'<Tip>', 'Tip'),
    (r'<ExamTip>', 'ExamTip'),
    (r'<WarningTag>', 'WarningTag'),
    (r'<InfoCallout>', 'InfoCallout'),
    (r'<LawCallout>', 'LawCallout'),
    (r'<WikiMistakeList>', 'WikiMistakeList'),
    (r'<MCQ>', 'MCQ'),
]

def extract_tag_details(content, tag_name):
    """Extract detailed info about tag occurrences."""
    # Pattern to match raw tags (not inside placeholders)
    # Look for <TagName ...> or <TagName> with content
    pattern = re.compile(rf'<{tag_name}[^>]*>.*?</{tag_name}>', re.DOTALL)
    matches = pattern.findall(content)
    
    results = []
    for m in matches:
        # Check if it's simple (single line, no attributes) or complex
        is_simple = True
        has_attrs = bool(re.search(rf'<{tag_name}\s+\w+', m))
        has_nested = bool(re.search(r'<[A-Z]', m[m.index('>')+1:]))
        is_multiline = '\n' in m
        
        if has_attrs or has_nested or is_multiline:
            is_simple = False
        
        # Check if part of larger MDX structure
        part_of_larger = has_nested
        
        # Check for code= attribute specifically
        has_code_attr = 'code=' in m or 'code =' in m
        
        results.append({
            'full_match': m[:200],  # Truncate for summary
            'simple': is_simple,
            'has_attributes': has_attrs,
            'has_nested_content': has_nested,
            'has_code_attr': has_code_attr,
            'multiline': is_multiline,
        })
    
    return results

results = []

for d in sorted(all_dirs):
    article_path = os.path.join(ARTICLES_DIR, d)
    nmd = os.path.join(article_path, 'normalized.md')
    uib = os.path.join(article_path, 'ui-blocks.json')
    meta = os.path.join(article_path, 'article-metadata.json')
    qed = os.path.join(article_path, 'question-edits')
    
    if not os.path.exists(nmd):
        continue
    
    with open(nmd, 'r') as f:
        content = f.read()
    
    # Check for all tag types
    tags_found = {}
    total_matches = 0
    for pat, tag_name in TAG_PATTERNS:
        details = extract_tag_details(content, tag_name)
        if details:
            tags_found[tag_name] = details
            total_matches += len(details)
    
    # Check for any other component tag pattern (catch-all)
    other_tags = re.findall(r'<([A-Z][a-zA-Z]+)[>\s]', content)
    other_tags = [t for t in other_tags if t not in ('Warn','Tip','ExamTip','WarningTag','InfoCallout','LawCallout','WikiMistakeList','MCQ')]
    # Filter out HTML tags
    other_tags = [t for t in other_tags if t not in ('div','span','p','br','hr','img','a','ul','ol','li','table','tr','td','th','h1','h2','h3','h4','h5','h6','strong','em','b','i','u','s','code','pre','blockquote','input','button','form','label','select','option','textarea','nav','header','footer','main','section','article','aside','figure','figcaption','details','summary','mark','time','video','audio','source','picture','iframe','canvas','svg','path','g','rect','circle','line','text','tspan','defs','use','clipPath','mask','linearGradient','radialGradient','stop','style','script','link','meta','title','head','body','html','DD','DL','DT','sup','sub')]
    other_tags = list(set(other_tags))
    
    if not tags_found and not other_tags:
        continue
    
    # Read metadata
    category = "unknown"
    if os.path.exists(meta):
        with open(meta, 'r') as f:
            try:
                md = json.load(f)
                category = md.get('category', md.get('subject', md.get('section', 'unknown')))
            except:
                category = "unknown"
    
    # Check ui-blocks.json
    has_uib = os.path.exists(uib)
    uib_size = 0
    uib_blocks = 0
    if has_uib:
        uib_size = os.path.getsize(uib)
        with open(uib, 'r') as f:
            try:
                uib_data = json.load(f)
                if isinstance(uib_data, dict):
                    uib_blocks = len(uib_data)
                elif isinstance(uib_data, list):
                    uib_blocks = len(uib_data)
            except:
                uib_blocks = -1
    
    # Check question-edits
    has_qed = os.path.exists(qed) and os.path.isdir(qed)
    qed_files = []
    if has_qed:
        qed_files = os.listdir(qed)
    
    entry = {
        'dir': d,
        'path': os.path.relpath(article_path, ARTICLES_DIR),
        'normalized_path': os.path.relpath(nmd, ARTICLES_DIR),
        'category': category,
        'tags': tags_found,
        'total_tag_instances': total_matches,
        'other_tags': other_tags,
        'has_ui_blocks': has_uib,
        'ui_blocks_file_size': uib_size,
        'ui_blocks_count': uib_blocks,
        'has_question_edits': has_qed,
        'question_edit_files': len(qed_files),
    }
    results.append(entry)

# Print summary
print(f"=== RAW COMPONENT TAG RECONNAISSANCE ===")
print(f"Total articles with raw tags: {len(results)}")
print()

# Count by tag type
warn_articles = [r for r in results if 'Warn' in r['tags']]
tip_articles = [r for r in results if 'Tip' in r['tags']]
examtip_articles = [r for r in results if 'ExamTip' in r['tags']]
other_articles = [r for r in results if r['other_tags']]

print(f"Articles with <Warn>: {len(warn_articles)}")
print(f"Articles with <Tip>: {len(tip_articles)}")
print(f"Articles with <ExamTip>: {len(examtip_articles)}")
print(f"Articles with other component tags: {len(other_articles)}")
print()

# Overlaps
print("=== OVERLAP ANALYSIS ===")
warn_only = [r for r in results if r['tags'].keys() == {'Warn'}]
tip_only = [r for r in results if r['tags'].keys() == {'Tip'}]
examtip_only = [r for r in results if r['tags'].keys() == {'ExamTip'}]
warn_and_tip = [r for r in results if 'Warn' in r['tags'] and 'Tip' in r['tags']]
warn_and_examtip = [r for r in results if 'Warn' in r['tags'] and 'ExamTip' in r['tags']]
tip_and_examtip = [r for r in results if 'Tip' in r['tags'] and 'ExamTip' in r['tags']]
print(f"Warn only: {len(warn_only)}")
print(f"Tip only: {len(tip_only)}")
print(f"ExamTip only: {len(examtip_only)}")
print(f"Warn + Tip: {len(warn_and_tip)}")
print(f"Warn + ExamTip: {len(warn_and_examtip)}")
print(f"Tip + ExamTip: {len(tip_and_examtip)}")
print()

# ui-blocks.json status
with_uib = [r for r in results if r['has_ui_blocks']]
without_uib = [r for r in results if not r['has_ui_blocks']]
print(f"=== UI-BLOCKS STATUS ===")
print(f"Has ui-blocks.json: {len(with_uib)}")
print(f"No ui-blocks.json: {len(without_uib)}")
print()

# question-edits status
with_qed = [r for r in results if r['has_question_edits']]
without_qed = [r for r in results if not r['has_question_edits']]
print(f"=== QUESTION-EDITS STATUS ===")
print(f"Has question-edits: {len(with_qed)}")
print(f"No question-edits: {len(without_qed)}")
print()

# Category breakdown
print("=== CATEGORY BREAKDOWN ===")
cats = {}
for r in results:
    c = r['category']
    if c not in cats:
        cats[c] = []
    cats[c].append(r['dir'])
for c in sorted(cats.keys()):
    print(f"  {c}: {len(cats[c])} articles")
print()

# Detailed classification
print("=== TAG STRUCTURE CLASSIFICATION ===")
simple_warn = 0
complex_warn = 0
simple_tip = 0
complex_tip = 0
simple_examtip = 0
complex_examtip = 0
for r in results:
    for tag, details in r['tags'].items():
        for d in details:
            if tag == 'Warn':
                if d['simple']:
                    simple_warn += 1
                else:
                    complex_warn += 1
            elif tag == 'Tip':
                if d['simple']:
                    simple_tip += 1
                else:
                    complex_tip += 1
            elif tag == 'ExamTip':
                if d['simple']:
                    simple_examtip += 1
                else:
                    complex_examtip += 1

print(f"  <Warn>: Simple: {simple_warn}, Complex: {complex_warn}")
print(f"  <Tip>: Simple: {simple_tip}, Complex: {complex_tip}")
print(f"  <ExamTip>: Simple: {simple_examtip}, Complex: {complex_examtip}")
print()

# ===== DETAILED PER-ARTICLE REPORT =====
print("=" * 120)
print("FULL ARTICLE DETAIL REPORT")
print("=" * 120)

for r in results:
    print(f"\n{'='*120}")
    print(f"DIR: {r['dir']}")
    print(f"CATEGORY: {r['category']}")
    print(f"UI-BLOCKS: {'YES (' + str(r['ui_blocks_count']) + ' blocks, ' + str(r['ui_blocks_file_size']) + ' bytes)' if r['has_ui_blocks'] else 'NO'}")
    print(f"QUESTION-EDITS: {'YES (' + str(r['question_edit_files']) + ' files)' if r['has_question_edits'] else 'NO'}")
    print(f"TOTAL TAG INSTANCES: {r['total_tag_instances']}")
    
    for tag, details in r['tags'].items():
        print(f"\n  --- <{tag}>: {len(details)} instance(s) ---")
        for i, d in enumerate(details):
            classification = "SIMPLE standalone" if d['simple'] else "COMPLEX"
            if d['has_nested_content']:
                classification += " (nested content)"
            if d['has_attributes']:
                classification += " (has attributes)"
            if d['has_code_attr']:
                classification += " [code=]"
            if d['multiline']:
                classification += " (multiline)"
            excerpt = d['full_match'][:100].replace('\n', '\\n')
            print(f"    [{i+1}] {classification}")
            print(f"        Excerpt: {excerpt}...")
    
    if r['other_tags']:
        print(f"\n  --- Other component tags: {r['other_tags']} ---")

# Save JSON report
report_path = os.path.join(os.path.dirname(ARTICLES_DIR), 'raw_tags_recon_report.json')
with open(report_path, 'w') as f:
    json.dump(results, f, indent=2, default=str)
print(f"\n\nFull JSON report saved to: {report_path}")

# Markdown summary
md_path = os.path.join(os.path.dirname(ARTICLES_DIR), 'raw_tags_recon_report.md')
with open(md_path, 'w') as f:
    f.write("# Raw Component Tags Reconnaissance Report\n\n")
    f.write(f"**Generated**: Automated scan\n\n")
    f.write(f"**Total articles with raw tags**: {len(results)}\n\n")
    
    f.write("## Summary Statistics\n\n")
    f.write(f"- `<Warn>`: {len(warn_articles)} articles, {simple_warn} simple + {complex_warn} complex = {simple_warn + complex_warn} total instances\n")
    f.write(f"- `<Tip>`: {len(tip_articles)} articles, {simple_tip} simple + {complex_tip} complex = {simple_tip + complex_tip} total instances\n")
    f.write(f"- `<ExamTip>`: {len(examtip_articles)} articles, {simple_examtip} simple + {complex_examtip} complex = {simple_examtip + complex_examtip} total instances\n\n")
    
    f.write(f"**Has ui-blocks.json**: {len(with_uib)} articles\n")
    f.write(f"**No ui-blocks.json**: {len(without_uib)} articles\n")
    f.write(f"**Has question-edits**: {len(with_qed)} articles\n\n")
    
    f.write("## Articles Without ui-blocks.json (Need New Blocks Created)\n\n")
    for r in sorted(without_uib, key=lambda x: x['dir']):
        f.write(f"- {r['dir']} ({r['category']})\n")
    
    f.write("\n## Articles With ui-blocks.json (Need Append)\n\n")
    for r in sorted(with_uib, key=lambda x: x['dir']):
        f.write(f"- {r['dir']} ({r['category']}) — {r['ui_blocks_count']} existing blocks\n")
    
    f.write("\n## Articles With Prior Optimization (question-edits exists)\n\n")
    for r in sorted(with_qed, key=lambda x: x['dir']):
        f.write(f"- {r['dir']} ({r['category']})\n")
    
    f.write("\n## Full Article Detail\n\n")
    for r in results:
        f.write(f"### {r['dir']}\n\n")
        f.write(f"- **Category**: {r['category']}\n")
        f.write(f"- **ui-blocks.json**: {'YES (' + str(r['ui_blocks_count']) + ' blocks, ' + str(r['ui_blocks_file_size']) + ' bytes)' if r['has_ui_blocks'] else 'NO'}\n")
        f.write(f"- **question-edits**: {'YES (' + str(r['question_edit_files']) + ' files)' if r['has_question_edits'] else 'NO'}\n")
        f.write(f"- **Total tag instances**: {r['total_tag_instances']}\n\n")
        
        for tag, details in r['tags'].items():
            f.write(f"**`<{tag}>`**: {len(details)} instance(s)\n\n")
            for i, d in enumerate(details):
                classification = "SIMPLE" if d['simple'] else "COMPLEX"
                if d['has_nested_content']:
                    classification += " (nested)"
                if d['has_attributes']:
                    classification += " (attrs)"
                if d['has_code_attr']:
                    classification += " [code=]"
                if d['multiline']:
                    classification += " (multiline)"
                excerpt = d['full_match'][:120].replace('\n', ' ')
                f.write(f"  {i+1}. {classification}: `{excerpt}`\n")
            f.write("\n")
        
        if r['other_tags']:
            f.write(f"**Other tags**: {', '.join(r['other_tags'])}\n\n")
        f.write("---\n\n")

print(f"Markdown report saved to: {md_path}")
