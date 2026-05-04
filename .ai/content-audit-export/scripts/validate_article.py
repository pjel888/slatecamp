#!/usr/bin/env python3
"""
Wiki Article UI Upgrade — Validation Script
Enforces:
1. Placeholder preservation ([SLATECAMP_UI_BLOCK:...])
2. Component whitelist compliance
3. ui-blocks.json ↔ normalized.md consistency
4. No hallucinated components

Usage:
    python validate_article.py <article_dir>
    python validate_article.py --all
"""

import json
import re
import sys
import os
from pathlib import Path
from typing import List, Dict, Tuple, Optional

# Load whitelist
SCRIPT_DIR = Path(__file__).parent
WHITELIST_PATH = SCRIPT_DIR.parent / "wiki-component-whitelist.json"
EXPORT_DIR = SCRIPT_DIR.parent / "articles"

with open(WHITELIST_PATH) as f:
    WHITELIST = json.load(f)["components"]

VALID_COMPONENTS = set(WHITELIST.keys())
HALLUCINATED = set(WHITELIST.get("hallucinated_components_detected", []))

# Regex patterns
# Placeholder format: [SLATECAMP_UI_BLOCK:ui_0001 component="Tip" status="preserved"]
# We only want the block ID (ui_0001), not the attributes
PLACEHOLDER_PATTERN = re.compile(r'\[SLATECAMP_UI_BLOCK:([a-zA-Z0-9_]+)')
COMPONENT_TAG_PATTERN = re.compile(r'<([A-Z][a-zA-Z0-9]*)\b')


def load_article(article_dir: Path) -> Tuple[str, dict, dict]:
    """Load normalized.md, ui-blocks.json, and metadata.json"""
    normalized_path = article_dir / "normalized.md"
    ui_blocks_path = article_dir / "ui-blocks.json"
    metadata_path = article_dir / "metadata.json"

    normalized = normalized_path.read_text() if normalized_path.exists() else ""
    ui_blocks = json.load(open(ui_blocks_path)) if ui_blocks_path.exists() else {}
    metadata = json.load(open(metadata_path)) if metadata_path.exists() else {}

    return normalized, ui_blocks, metadata


def extract_block_ids(ui_blocks: dict) -> set:
    """Extract actual UI block IDs from ui-blocks.json structure.
    The file has metadata at root and a 'blocks' array with 'block_id' fields.
    Block IDs follow pattern ui_#### (e.g., ui_0001). Metadata fields like
    ui_block_count and ui_blocks_hash are NOT block IDs."""
    block_ids = set()
    # Handle new format: blocks array
    if "blocks" in ui_blocks and isinstance(ui_blocks["blocks"], list):
        for block in ui_blocks["blocks"]:
            if isinstance(block, dict) and "block_id" in block:
                block_ids.add(block["block_id"])
    # Handle old format: direct keys that match ui_#### pattern (NOT ui_block_count etc)
    for key in ui_blocks.keys():
        if re.match(r'^ui_\d{4,}$', key):
            block_ids.add(key)
    return block_ids


def validate_placeholders(normalized: str, ui_blocks: dict) -> List[Dict]:
    """Check that all placeholders in normalized.md have matching ui-blocks.json entries"""
    errors = []
    placeholders = PLACEHOLDER_PATTERN.findall(normalized)
    block_ids = extract_block_ids(ui_blocks)

    for ph in placeholders:
        if ph not in block_ids:
            errors.append({
                "type": "orphan_placeholder",
                "placeholder": ph,
                "message": f"Placeholder [SLATECAMP_UI_BLOCK:{ph}] not found in ui-blocks.json"
            })

    for bid in block_ids:
        if bid not in placeholders:
            errors.append({
                "type": "orphan_ui_block",
                "block_id": bid,
                "message": f"ui-blocks.json entry '{bid}' not referenced in normalized.md"
            })

    # Check for broken syntax
    broken = re.findall(r'\[SLATECAMP_UI_BLOCK([^\]]*?)\]', normalized)
    for b in broken:
        if not re.match(r':[a-zA-Z0-9_-]+', b):
            errors.append({
                "type": "broken_placeholder",
                "raw": f"[SLATECAMP_UI_BLOCK{b}]",
                "message": "Malformed placeholder syntax"
            })

    return errors


def validate_components(normalized: str, ui_blocks: dict) -> List[Dict]:
    """Check that all components used are in the whitelist"""
    errors = []

    # Check raw MDX in normalized.md
    tags = COMPONENT_TAG_PATTERN.findall(normalized)
    for tag in tags:
        if tag not in VALID_COMPONENTS:
            errors.append({
                "type": "invalid_component",
                "component": tag,
                "location": "normalized.md",
                "message": f"Component <{tag}> is not in the whitelist. Hallucinated?"
            })

    # Check ui-blocks.json component types
    blocks = ui_blocks.get("blocks", [])
    if isinstance(blocks, list):
        for block in blocks:
            if isinstance(block, dict):
                comp_type = block.get("component_name", block.get("component", block.get("type", "")))
                if comp_type and comp_type not in VALID_COMPONENTS:
                    errors.append({
                        "type": "invalid_component",
                        "component": comp_type,
                        "location": f"ui-blocks.json[{block.get('block_id', '?')}]",
                        "message": f"Component '{comp_type}' is not in the whitelist"
                    })
    else:
        # Old format
        for bid, block in ui_blocks.items():
            if isinstance(block, dict) and not bid.startswith(("article_id", "slug", "parser", "original", "normalized", "ui_block_count", "total_blocks", "ui_blocks_hash", "unknown_blocks")):
                comp_type = block.get("component", block.get("type", ""))
                if comp_type and comp_type not in VALID_COMPONENTS:
                    errors.append({
                        "type": "invalid_component",
                        "component": comp_type,
                        "location": f"ui-blocks.json[{bid}]",
                        "message": f"Component '{comp_type}' is not in the whitelist"
                    })

    return errors


def validate_article(article_dir: Path) -> Dict:
    """Run full validation on an article"""
    normalized, ui_blocks, metadata = load_article(article_dir)

    result = {
        "article_id": metadata.get("id", article_dir.name),
        "slug": metadata.get("slug", ""),
        "title": metadata.get("title", ""),
        "valid": True,
        "errors": [],
        "warnings": [],
        "stats": {
            "placeholder_count": len(PLACEHOLDER_PATTERN.findall(normalized)),
            "ui_block_count": len(ui_blocks),
            "raw_component_tags": len(COMPONENT_TAG_PATTERN.findall(normalized))
        }
    }

    # Run checks
    placeholder_errors = validate_placeholders(normalized, ui_blocks)
    component_errors = validate_components(normalized, ui_blocks)

    all_errors = placeholder_errors + component_errors

    if all_errors:
        result["valid"] = False
        result["errors"] = all_errors

    # Warnings for duplicate placeholders
    placeholders = PLACEHOLDER_PATTERN.findall(normalized)
    seen = set()
    for ph in placeholders:
        if ph in seen:
            result["warnings"].append({
                "type": "duplicate_placeholder",
                "placeholder": ph,
                "message": f"Duplicate placeholder [SLATECAMP_UI_BLOCK:{ph}]"
            })
        seen.add(ph)

    return result


def validate_all() -> List[Dict]:
    """Validate all articles in the export directory"""
    results = []
    for article_dir in sorted(EXPORT_DIR.iterdir()):
        if article_dir.is_dir():
            result = validate_article(article_dir)
            results.append(result)
    return results


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        results = validate_all()
        failed = [r for r in results if not r["valid"]]
        print(f"Validated {len(results)} articles")
        print(f"Failed: {len(failed)}")
        for r in failed:
            print(f"\n  {r['slug']} ({r['article_id']}):")
            for e in r["errors"]:
                print(f"    - {e['type']}: {e['message']}")
        sys.exit(0 if not failed else 1)
    elif len(sys.argv) > 1:
        article_dir = Path(sys.argv[1])
        result = validate_article(article_dir)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["valid"] else 1)
    else:
        print("Usage: python validate_article.py <article_dir> | --all")
        sys.exit(1)
