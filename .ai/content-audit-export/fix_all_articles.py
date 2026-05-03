#!/usr/bin/env python3
"""
Fix all articles: resolve duplicate block IDs, re-register all blocks, 
fix JSX.Frontless, and sync hashes.
"""
import json, hashlib, os, re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

# All articles that need fixing (those my script processed)
articles_to_fix = [
    ("lea-prac-law-008-lea-structure-subjects-areas-passing-standard-and-retaking--63ba5964-80fc-472c-bc26-7d64f1507bed", "LEA-PRAC-LAW-008"),
    ("lea-prac-law-009-certificate-of-registration-oath-taking-and-the-professional-id-card--9ce707aa-5e91-4f79-a5a6-8bcdf582fa57", "LEA-PRAC-LAW-009"),
    ("lea-prac-law-011-architect-of-record-vs-architect-in-charge-of-construction-liability-and-accountabi--17b95df0-6bea-43c6-ab03-2b82a358caa6", "LEA-PRAC-LAW-011"),
    ("lea-prac-law-012-quasi-delict-and-tort-in-architectural-practice-civil-code-articles-2176-2194--82862aca-27a6-4121-ba3f-6d53160d2e3c", "LEA-PRAC-LAW-012"),
    ("lea-prac-law-016-the-contract-document-package-who-draws-and-who-signs-each-component--f7691e1a-81f3-4a93-aef2-6ae6426100a2", "LEA-PRAC-LAW-016"),
    ("lea-prac-law-017-the-signing-sealing-prohibition-direct-supervision-delegation-and-disciplinary-expo--16e972e5-378d-426c-9269-d716204c52de", "LEA-PRAC-LAW-017"),
    ("lea-prac-frm-013-coa-audit-compliance-for-publicly-funded-architectural-projects--9c859ffb-8b3a-4feb-b484-6700d3867e5c", "LEA-PRAC-FRM-013"),
    ("lea-prac-frm-015-data-privacy-act-ra-10173-the-architect-s-obligations-when-handling-client-informat--bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4", "LEA-PRAC-FRM-015"),
    ("lea-prac-frm-016-berde-rating-system-philippine-green-building-standard-and-the-architect-s-role--9261cc17-24c1-49d2-a45a-158032f6fcd3", "LEA-PRAC-FRM-016"),
    ("lea-prac-frm-017-environmental-laws-affecting-architectural-practice-eia-denr-regulations-and-dao-20--e61e81a9-c0e3-4e60-ab5e-6b3fe3026004", "LEA-PRAC-FRM-017"),
]

def fix_article(dirname, lea_id):
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    print(f"\n--- {lea_id} ---")
    
    with open(norm_path, 'r') as f:
        norm = f.read()
    
    # Fix JSX.Frontless -> AuthorityContent if present
    if 'JSX.Frontless' in norm:
        norm = norm.replace(
            '[SLATECAMP_UI_BLOCK:ui_0001 component="JSX.Frontless"',
            '[SLATECAMP_UI_BLOCK:ui_0001 component="AuthorityContent"'
        )
        print("  Fixed: JSX.Frontless -> AuthorityContent")
    
    # Find all existing block IDs in normalized.md
    block_pattern = r'\[SLATECAMP_UI_BLOCK:(ui_\d+) component="([^"]+)"'
    existing = {}
    for m in re.finditer(block_pattern, norm):
        bid = m.group(1)
        cname = m.group(2)
        if bid not in existing:
            existing[bid] = cname
        else:
            # Duplicate block ID! Renumber the second occurrence
            print(f"  DUPLICATE: {bid} ({cname}) conflicts with {existing[bid]}")
    
    # Re-register all blocks with unique IDs
    # Re-parse all blocks from normalized.md
    pattern = r'\[SLATECAMP_UI_BLOCK:(ui_\d+) component="([^"]+)" status="preserved"\](.*?)\[/SLATECAMP_UI_BLOCK\]'
    
    # First, find all block occurrences and renumber if needed
    all_matches = list(re.finditer(pattern, norm, re.DOTALL))
    
    # Identify which IDs are used
    id_counts = {}
    for m in all_matches:
        bid = m.group(1)
        id_counts[bid] = id_counts.get(bid, 0) + 1
    
    # Find max used ID
    max_id = 0
    for bid in id_counts:
        num = int(bid.split('_')[1])
        max_id = max(max_id, num)
    
    # Now reassign duplicate IDs
    seen_ids = set()
    replacements = {}
    next_new = max_id + 1
    
    for m in all_matches:
        bid = m.group(1)
        if bid in seen_ids:
            # Duplicate - assign new ID
            new_bid = f"ui_{next_new:04d}"
            next_new += 1
            replacements[bid] = new_bid
            print(f"  Renumbering: {bid} -> {new_bid}")
        else:
            seen_ids.add(bid)
    
    # Apply renumbering (reverse order to avoid interference)
    for old_bid, new_bid in sorted(replacements.items(), reverse=True):
        norm = norm.replace(
            f'[SLATECAMP_UI_BLOCK:{old_bid} component=',
            f'[SLATECAMP_UI_BLOCK:{new_bid} component='
        )
    
    # Save normalized.md
    with open(norm_path, 'w') as f:
        f.write(norm)
    
    new_hash = hashlib.sha256(norm.encode('utf-8')).hexdigest()
    
    # Re-parse all blocks and rebuild ui-blocks.json
    blocks = []
    for m in re.finditer(pattern, norm, re.DOTALL):
        block_id = m.group(1)
        comp_name = m.group(2)
        placeholder = m.group(0)
        
        summary = m.group(3)
        props_match = re.search(r'- Props: (.+)', summary)
        text_match = re.search(r'- Text: (.+)', summary)
        props_text = props_match.group(1) if props_match else '(none)'
        children_text = text_match.group(1) if text_match else None
        
        props_dict = {}
        if props_text and props_text != '(none)':
            for prop_pair in props_text.split(','):
                prop_pair = prop_pair.strip()
                if '=' in prop_pair:
                    key, val = prop_pair.split('=', 1)
                    key = key.strip().strip('"')
                    val = val.strip().strip('"').strip("'")
                    props_dict[key] = val
        
        block = {
            'block_id': block_id,
            'block_type': 'mdx_component',
            'component_name': comp_name,
            'raw': f'<{comp_name} />',
            'raw_hash': f'sha256:{hashlib.sha256(f"<{comp_name} />".encode()).hexdigest()}',
            'placeholder': placeholder,
            'placeholder_hash': f'sha256:{hashlib.sha256(placeholder.encode()).hexdigest()}',
            'props': props_dict,
            'props_json': props_dict,
            'props_text': props_text if props_text != '(none)' else None,
            'children_raw': children_text,
            'children_text': children_text,
            'start_offset': 0,
            'end_offset': 0,
            'line_start': 0,
            'line_end': 0,
            'parser_confidence': 'high',
            'parse_status': 'parsed',
            'warnings': [],
            'status': 'preserved'
        }
        blocks.append(block)
    
    blocks.sort(key=lambda b: int(b['block_id'].split('_')[1]))
    
    # Read current ui-blocks.json
    with open(ui_path, 'r') as f:
        ui = json.load(f)
    
    ui['blocks'] = blocks
    ui['ui_block_count'] = len(blocks)
    ui['total_blocks'] = len(blocks)
    ui['normalized_content_hash'] = f'sha256:{new_hash}'
    
    blocks_json = json.dumps(blocks, sort_keys=True)
    ui['ui_blocks_hash'] = f'sha256:{hashlib.sha256(blocks_json.encode()).hexdigest()}'
    
    with open(ui_path, 'w') as f:
        json.dump(ui, f, indent=2)
        f.write('\n')
    
    print(f"  Updated: {len(blocks)} blocks, hash: {new_hash[:16]}...")

for dirname, lea_id in articles_to_fix:
    fix_article(dirname, lea_id)

print("\nDone!")
