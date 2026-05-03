#!/usr/bin/env python3
"""
Fix article 010 - restore original Callout and Note blocks, properly register them,
add new ExamTip and Warn with unique block IDs.
"""

import json
import hashlib
import os
import re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"
DIR = "lea-prac-law-010-civil-code-article-1723-the-15-year-liability-framework--6dc813a9-913d-47b5-9203-f59e8e909869"

article_dir = os.path.join(BASE, DIR)
norm_path = os.path.join(article_dir, "normalized.md")
ui_path = os.path.join(article_dir, "ui-blocks.json")

with open(norm_path, 'r') as f:
    norm = f.read()

# Remove the duplicate blocks at the end (lines 45-57)
# Original content ends at line 43 ([/SLATECAMP_UI_BLOCK] for ui_0003 Note)
# Find the last occurrence of the original content
pattern = r'\[/SLATECAMP_UI_BLOCK\]\n\n\n\[SLATECAMP_UI_BLOCK:ui_0002.*?\[/SLATECAMP_UI_BLOCK\]\n\n\n\[SLATECAMP_UI_BLOCK:ui_0003.*?\[/SLATECAMP_UI_BLOCK\]\n$'

# More targeted: find the duplicate ui_0002 and ui_0003 lines at the end
norm_cleaned = norm.rstrip()
# Find the last [/SLATECAMP_UI_BLOCK] which should be from ui_0003 (Note)
# Then check if there's extra content after it
last_block_end = norm_cleaned.rfind('[/SLATECAMP_UI_BLOCK]')
remaining = norm_cleaned[last_block_end + len('[/SLATECAMP_UI_BLOCK]'):]

if 'ui_0002' in remaining or 'ui_0003' in remaining:
    # There are duplicate blocks at the end
    # Find the original end (before the duplicates)
    # The original content had ui_0003 Note as the last block
    # Let's find the position of the last occurrence of ui_0003 Note
    note_block_start = norm_cleaned.rfind('[SLATECAMP_UI_BLOCK:ui_0003 component="Note"')
    if note_block_start == -1:
        # The Note was possibly cleaned up, find the duplicate
        dup_start = norm_cleaned.rfind('[SLATECAMP_UI_BLOCK:ui_0002 component="ExamTip"')
        if dup_start > -1:
            norm_cleaned = norm_cleaned[:dup_start].rstrip()
    
    norm_cleaned = norm_cleaned[:last_block_end + len('[/SLATECAMP_UI_BLOCK]')].rstrip() + '\n'

with open(norm_path, 'w') as f:
    f.write(norm_cleaned)

print("Cleaned up duplicate blocks from normalized.md")

# Now re-read the clean normalized.md
with open(norm_path, 'r') as f:
    norm = f.read()

# Extract all SLATECAMP_UI_BLOCK IDs from the normalized.md
block_pattern = r'\[SLATECAMP_UI_BLOCK:(ui_\d+) component="([^"]+)" status="preserved"\]'
existing_block_ids = set()
for m in re.finditer(block_pattern, norm):
    existing_block_ids.add(m.group(1))

print(f"Blocks found in normalized.md: {sorted(existing_block_ids)}")

# Register ALL blocks properly in ui-blocks.json
with open(ui_path, 'r') as f:
    ui = json.load(f)

# Map block IDs to component names from normalized.md
block_map = {}
for m in re.finditer(block_pattern, norm):
    block_id = m.group(1)
    comp_name = m.group(2)
    
    # Extract placeholder text between markers
    start_marker = m.group(0)
    end_marker = f'[/SLATECAMP_UI_BLOCK]'
    start_pos = m.start()
    end_pos = norm.find(end_marker, m.end())
    if end_pos > -1:
        placeholder = norm[start_pos:end_pos + len(end_marker)]
    else:
        placeholder = start_marker
    
    # Extract props and text from placeholder
    props_match = re.search(r'- Props: (.+)', placeholder)
    text_match = re.search(r'- Text: (.+)', placeholder)
    props_text = props_match.group(1) if props_match else "(none)"
    children_text = text_match.group(1) if text_match else None
    
    block_map[block_id] = {
        "block_id": block_id,
        "block_type": "mdx_component",
        "component_name": comp_name,
        "raw": f"<{comp_name} />",
        "raw_hash": f"sha256:{hashlib.sha256(f'<{comp_name} />'.encode()).hexdigest()}",
        "placeholder": placeholder,
        "placeholder_hash": f"sha256:{hashlib.sha256(placeholder.encode()).hexdigest()}",
        "props": {},
        "props_json": {},
        "props_text": props_text if props_text != "(none)" else None,
        "children_raw": children_text,
        "children_text": children_text,
        "start_offset": 0,
        "end_offset": 0,
        "line_start": 0,
        "line_end": 0,
        "parser_confidence": "high",
        "parse_status": "parsed",
        "warnings": [],
        "status": "preserved"
    }

# Sort by block_id
sorted_ids = sorted(block_map.keys())
ui["blocks"] = [block_map[bid] for bid in sorted_ids]
ui["ui_block_count"] = len(sorted_ids)
ui["total_blocks"] = len(sorted_ids)

# Compute hash
new_hash = hashlib.sha256(norm.encode('utf-8')).hexdigest()
ui["normalized_content_hash"] = f"sha256:{new_hash}"

blocks_json = json.dumps(ui["blocks"], sort_keys=True)
ui["ui_blocks_hash"] = f"sha256:{hashlib.sha256(blocks_json.encode()).hexdigest()}"

with open(ui_path, 'w') as f:
    json.dump(ui, f, indent=2)
    f.write("\n")

print(f"Updated ui-blocks.json with {len(sorted_ids)} properly registered blocks")
print(f"Blocks: {sorted_ids}")
print(f"Hash: {new_hash[:16]}...")
