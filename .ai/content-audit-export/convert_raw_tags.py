#!/usr/bin/env python3
"""
Convert all raw MDX component tags in normalized.md to roundtrip-safe format.
Each raw tag gets:
1. A new block entry in ui-blocks.json
2. A placeholder replacement in normalized.md
3. Updated hashes

Usage: python3 convert_raw_tags.py
"""

import json
import hashlib
import os
import re
import sys

ARTICLES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "articles")


def get_article_dirs():
    """Read the batch list CSV to get all article directories."""
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw_tags_batch_list.csv")
    dirs = []
    if os.path.exists(csv_path):
        with open(csv_path, 'r') as f:
            lines = f.readlines()
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            # Simple CSV: split on comma and take first field (directory name)
            dir_name = line.split(',')[0].strip('"')
            if dir_name:
                dirs.append(dir_name)
    else:
        # Fallback: scan articles directory
        print(f"CSV not found at {csv_path}, scanning articles dir")
        for d in os.listdir(ARTICLES_DIR):
            full_path = os.path.join(ARTICLES_DIR, d)
            if os.path.isdir(full_path) and os.path.exists(os.path.join(full_path, 'normalized.md')):
                dirs.append(d)
    
    # Deduplicate while preserving order
    seen = set()
    unique_dirs = []
    for d in dirs:
        if d not in seen:
            seen.add(d)
            unique_dirs.append(d)
    return unique_dirs


def sha256hex(content):
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def compute_ui_blocks_hash(blocks_json):
    """Compute ui_blocks_hash from the blocks array content."""
    blocks = blocks_json.get("blocks", [])
    if not blocks:
        return "sha256:" + sha256hex("")
    serialized = json.dumps(blocks, sort_keys=True, ensure_ascii=False)
    return "sha256:" + sha256hex(serialized)


def extract_raw_tags(normalized_content):
    """Find all raw component tags in normalized.md content.
    Returns list of tuples sorted by position (ascending).
    """
    tags = []
    
    # Pattern 1: Self-closing tags like <KeyValues ... />, <WikiExamTable ... />, <WikiMistakeList ... />
    # These can span multiple lines. Use [\\s\\S] to match across newlines.
    self_closing_pattern = re.compile(
        r'<(KeyValues|WikiExamTable|WikiMistakeList)\b([\s\S]*?)/\s*>',
        re.DOTALL
    )
    
    for m in self_closing_pattern.finditer(normalized_content):
        tag_name = m.group(1)
        attr_text = m.group(2).strip()
        full_match = m.group(0)
        start = m.start()
        end = m.end()
        
        # Skip if this is already inside a SLATECAMP_UI_BLOCK placeholder
        preceding_text = normalized_content[max(0, start-80):start]
        if '[SLATECAMP_UI_BLOCK:' in preceding_text:
            # Check if between [SLATECAMP and [/SLATECAMP]
            open_pos = preceding_text.rfind('[SLATECAMP_UI_BLOCK:')
            if open_pos >= 0:
                # Check there's no [/SLATECAMP_UI_BLOCK] between open and here
                between = preceding_text[open_pos:]
                if '[/SLATECAMP_UI_BLOCK]' not in between:
                    continue
        
        attrs = parse_attributes(attr_text)
        tags.append((full_match, tag_name, attrs, None, True, start, end))
    
    # Pattern 2: Opening/closing tags like <Warn>...</Warn>, <Tip>...</Tip>, etc.
    opening_closing_pattern = re.compile(
        r'<(Warn|Tip|ExamTip|LawCallout|LeartBox)\b([^>]*)>([\s\S]*?)</\1\s*>',
        re.DOTALL
    )
    
    for m in opening_closing_pattern.finditer(normalized_content):
        tag_name = m.group(1)
        attr_text = m.group(2).strip()
        children = m.group(3)
        full_match = m.group(0)
        start = m.start()
        end = m.end()
        
        # Skip if this is already inside a SLATECAMP_UI_BLOCK placeholder
        preceding_text = normalized_content[max(0, start-80):start]
        if '[SLATECAMP_UI_BLOCK:' in preceding_text:
            open_pos = preceding_text.rfind('[SLATECAMP_UI_BLOCK:')
            if open_pos >= 0:
                between = preceding_text[open_pos:]
                if '[/SLATECAMP_UI_BLOCK]' not in between:
                    continue
        
        attrs = parse_attributes(attr_text)
        tags.append((full_match, tag_name, attrs, children, False, start, end))
    
    # Sort by position (ascending)
    tags.sort(key=lambda x: x[5])
    
    return tags


def parse_attributes(attr_text):
    """Parse HTML-like attributes from tag text into a dict."""
    attrs = {}
    if not attr_text:
        return attrs
    
    # Match key="value" or key={value} patterns
    pattern = re.compile(r'(\w+)\s*=\s*(?:"([^"]*)"|\{([^}]*)\})')
    for m in pattern.finditer(attr_text):
        key = m.group(1)
        value = m.group(2) if m.group(2) is not None else '{' + m.group(3) + '}'
        attrs[key] = value
    
    return attrs


def format_placeholder(block_id, component_name, attrs, children_raw, children_text, is_self_closing):
    """Create the placeholder text for a block."""
    props_parts = []
    for k, v in attrs.items():
        props_parts.append(f"{k}={v}")
    
    props_str = ", ".join(props_parts) if props_parts else "(none)"
    
    if is_self_closing:
        text_str = "(none detected)"
    else:
        text_str = children_text[:200] + "..." if len(children_text) > 200 else children_text
    
    placeholder = (
        f"[SLATECAMP_UI_BLOCK:{block_id} component=\"{component_name}\" status=\"preserved\"]\n"
        f"Extracted summary:\n"
        f"- Props: {props_str}\n"
        f"- Text: {text_str}\n"
        f"[/SLATECAMP_UI_BLOCK]"
    )
    
    return placeholder


def get_next_block_id(blocks):
    """Get the next sequential block_id based on existing blocks."""
    max_num = 0
    for block in blocks:
        bid = block.get("block_id", "ui_0000")
        try:
            num = int(bid.split("_")[1])
            if num > max_num:
                max_num = num
        except (IndexError, ValueError):
            pass
    return f"ui_{max_num + 1:04d}"


def process_article(article_dir):
    """Process a single article directory."""
    norm_path = os.path.join(article_dir, "normalized.md")
    blocks_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path):
        print(f"  SKIP: No normalized.md")
        return None
    if not os.path.exists(blocks_path):
        print(f"  SKIP: No ui-blocks.json")
        return None
    
    # Read normalized.md
    with open(norm_path, 'r', encoding='utf-8') as f:
        normalized_content = f.read()
    
    # Find raw tags
    raw_tags = extract_raw_tags(normalized_content)
    
    if not raw_tags:
        return []  # No raw tags found, already done
    
    # Read ui-blocks.json
    with open(blocks_path, 'r', encoding='utf-8') as f:
        blocks_data = json.load(f)
    
    blocks = blocks_data.get("blocks", [])
    
    # Process tags from END to START (to preserve positions during replacement)
    modifications_made = []
    
    for full_match, tag_name, attrs, children, is_self_closing, start_pos, end_pos in reversed(raw_tags):
        # Calculate block_id
        block_id = get_next_block_id(blocks)
        
        # Normalize raw content - preserve exactly
        raw_content = full_match
        
        # Children handling
        if children is not None:
            children_raw = children
            children_text = children.strip()
        else:
            children_raw = None
            children_text = None
        
        # Build props
        props = attrs.copy()
        props_json = dict(attrs) if attrs else {}
        if props:
            props_text_parts = []
            for k, v in props.items():
                props_text_parts.append(f"{k}={v}")
            props_text = ", ".join(props_text_parts)
        else:
            props_text = "(none)"
        
        # Create placeholder
        placeholder = format_placeholder(block_id, tag_name, attrs, children_raw, children_text, is_self_closing)
        placeholder_hash = "sha256:" + sha256hex(placeholder)
        raw_hash = "sha256:" + sha256hex(raw_content)
        
        # Build block entry matching existing format
        block_entry = {
            "block_id": block_id,
            "block_type": "mdx_component",
            "component_name": tag_name,
            "raw": raw_content,
            "raw_hash": raw_hash,
            "placeholder": placeholder,
            "placeholder_hash": placeholder_hash,
            "props": props,
            "props_json": props_json,
            "children_raw": children_raw,
            "children_text": children_text,
            "start_offset": None,
            "end_offset": None,
            "line_start": None,
            "line_end": None,
            "parser_confidence": "high",
            "parse_status": "parsed",
            "warnings": [],
            "status": "preserved"
        }
        
        # Only add props_text if there are actual props
        if props:
            block_entry["props_text"] = props_text
        else:
            block_entry["props_text"] = None
        
        blocks.append(block_entry)
        
        # Replace raw tag with placeholder in normalized content
        # Since we process in reverse order, positions remain valid
        normalized_content = normalized_content[:start_pos] + placeholder + normalized_content[end_pos:]
        
        modifications_made.append((tag_name, block_id, raw_content[:80]))
    
    # Update blocks in blocks_data
    blocks_data["blocks"] = blocks
    blocks_data["ui_block_count"] = len(blocks)
    blocks_data["total_blocks"] = len(blocks)
    
    # Compute normalized_content_hash from the FINAL content
    normalized_hash = sha256hex(normalized_content)
    blocks_data["normalized_content_hash"] = "sha256:" + normalized_hash
    
    # Compute ui_blocks_hash
    blocks_data["ui_blocks_hash"] = compute_ui_blocks_hash(blocks_data)
    
    # Write updated normalized.md
    with open(norm_path, 'w', encoding='utf-8') as f:
        f.write(normalized_content)
    
    # Write updated ui-blocks.json
    with open(blocks_path, 'w', encoding='utf-8') as f:
        json.dump(blocks_data, f, indent=2, ensure_ascii=False)
    
    return modifications_made


def main():
    article_dirs_list = get_article_dirs()
    print(f"Found {len(article_dirs_list)} articles from batch list")
    
    base_dir = ARTICLES_DIR
    
    total_processed = 0
    total_tags_converted = 0
    already_converted = 0
    skipped = []
    
    for dir_name in article_dirs_list:
        article_path = os.path.join(base_dir, dir_name)
        if not os.path.isdir(article_path):
            skipped.append(dir_name)
            continue
        
        norm_path = os.path.join(article_path, "normalized.md")
        if not os.path.exists(norm_path):
            skipped.append(dir_name)
            continue
        
        # Quick check for raw tags
        with open(norm_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        raw_tags = extract_raw_tags(content)
        if not raw_tags:
            already_converted += 1
            continue
        
        result = process_article(article_path)
        if result is None:
            skipped.append(dir_name)
        elif len(result) == 0:
            already_converted += 1
        else:
            total_processed += 1
            n_tags = len(result)
            total_tags_converted += n_tags
            tag_summary = "; ".join([f"{t[0]}:{t[1]}" for t in result])
            print(f"  {dir_name[:55]:55s} -> {n_tags} tag(s): {tag_summary}")
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Articles with raw tags converted: {total_processed}")
    print(f"Total raw tags converted: {total_tags_converted}")
    print(f"Already converted (no raw tags): {already_converted}")
    print(f"Skipped (no article dir): {len(skipped)}")
    
    if skipped:
        print(f"\nSkipped ({len(skipped)}):")
        for s in skipped:
            print(f"  - {s}")


if __name__ == "__main__":
    main()
