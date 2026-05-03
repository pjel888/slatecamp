#!/usr/bin/env python3
"""Register all 5 blocks from normalized.md for article 010."""
import json, hashlib, os, re

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-law-010-civil-code-article-1723-the-15-year-liability-framework--6dc813a9-913d-47b5-9203-f59e8e909869"
norm_path = os.path.join(BASE, "normalized.md")
ui_path = os.path.join(BASE, "ui-blocks.json")

with open(norm_path, 'r') as f:
    norm = f.read()

new_hash = hashlib.sha256(norm.encode('utf-8')).hexdigest()

with open(ui_path, 'r') as f:
    ui = json.load(f)

# Extract all block markers and content
pattern = r'\[SLATECAMP_UI_BLOCK:(ui_\d+) component="([^"]+)" status="preserved"\](.*?)\[/SLATECAMP_UI_BLOCK\]'
blocks = []
for m in re.finditer(pattern, norm, re.DOTALL):
    block_id = m.group(1)
    comp_name = m.group(2)
    placeholder = m.group(0)
    
    # Extract props and text
    summary = m.group(3)
    props_match = re.search(r'- Props: (.+)', summary)
    text_match = re.search(r'- Text: (.+)', summary)
    props_text = props_match.group(1) if props_match else "(none)"
    children_text = text_match.group(1) if text_match else None
    
    # Parse props
    props_dict = {}
    if props_text and props_text != "(none)":
        for prop_pair in props_text.split(','):
            prop_pair = prop_pair.strip()
            if '=' in prop_pair:
                key, val = prop_pair.split('=', 1)
                key = key.strip().strip('"')
                val = val.strip().strip('"').strip("'")
                props_dict[key] = val
    
    block = {
        "block_id": block_id,
        "block_type": "mdx_component",
        "component_name": comp_name,
        "raw": f"<{comp_name} />",
        "raw_hash": f"sha256:{hashlib.sha256(f'<{comp_name} />'.encode()).hexdigest()}",
        "placeholder": placeholder,
        "placeholder_hash": f"sha256:{hashlib.sha256(placeholder.encode()).hexdigest()}",
        "props": props_dict,
        "props_json": props_dict,
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
    blocks.append(block)

# Sort by block_id
blocks.sort(key=lambda b: int(b["block_id"].split("_")[1]))

ui["blocks"] = blocks
ui["ui_block_count"] = len(blocks)
ui["total_blocks"] = len(blocks)
ui["normalized_content_hash"] = f"sha256:{new_hash}"

blocks_json = json.dumps(blocks, sort_keys=True)
ui["ui_blocks_hash"] = f"sha256:{hashlib.sha256(blocks_json.encode()).hexdigest()}"

with open(ui_path, 'w') as f:
    json.dump(ui, f, indent=2)
    f.write("\n")

print(f"Updated ui-blocks.json with {len(blocks)} blocks")
for b in blocks:
    print(f"  {b['block_id']}: {b['component_name']}")
print(f"Hash: {new_hash[:16]}...")
