#!/usr/bin/env python3
"""
Wiki Article UI Upgrade — Hallucinated Component Repair Script
Repairs broken/hallucinated components in ui-blocks.json and normalized.md

Usage:
    python repair_hallucinated.py --dry-run    # Show what would be fixed
    python repair_hallucinated.py --apply      # Actually fix
"""

import json
import re
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Tuple

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

# Mapping of hallucinated components to valid replacements
REPLACEMENTS = {
    # JSX blocks → remove (they're empty/broken)
    "JSX": None,
    
    # HTML details → convert to Accordion/AccordionItem or remove
    "details": "Accordion",
    
    # LeartBox/Leart → Callout or Note
    "LeartBox": "Callout",
    "Leart": "Note",
    
    # InfoBox → Callout
    "InfoBox": "Callout",
    
    # TechnicalBox → Callout
    "TechnicalBox": "Callout",
    
    # DataTable → WikiExamTable (if it has data) or remove
    "DataTable": "WikiExamTable",
    
    # JSXCode → remove (code blocks don't need components)
    "JSXCode": None,
    
    # ComparisonChart → ComparisonTable
    "ComparisonChart": "ComparisonTable",
    
    # PriceBreakdown → KeyValues
    "PriceBreakdown": "KeyValues",
    
    # SensorTable → WikiExamTable
    "SensorTable": "WikiExamTable",
    
    # ComplianceChecklist → ProcessFlow
    "ComplianceChecklist": "ProcessFlow",
    
    # DataQualitySpec → Note
    "DataQualitySpec": "Note",
    
    # RevealBlock → Accordion
    "RevealBlock": "Accordion",
    
    # QuestionBank → remove (requires backend)
    "QuestionBank": None,
    
    # ConflictMatrix → ComparisonTable
    "ConflictMatrix": "ComparisonTable",
    
    # EthicalFramework → ProcessFlow
    "EthicalFramework": "ProcessFlow",
    
    # RegulationFramework → ProcessFlow
    "RegulationFramework": "ProcessFlow",
    
    # MDXComponent → Callout
    "MDXComponent": "Callout",
}

HALLUCINATED = set(REPLACEMENTS.keys())

def find_bad_articles() -> List[Dict]:
    """Find all articles with hallucinated components"""
    bad = []
    for d in EXPORT_DIR.iterdir():
        if not d.is_dir() or d.name == "__pycache__":
            continue
        
        ui = d / "ui-blocks.json"
        if not ui.exists():
            continue
        
        with open(ui) as f:
            data = json.load(f)
        
        blocks = data.get("blocks", [])
        if not isinstance(blocks, list):
            continue
        
        bad_blocks = []
        for b in blocks:
            comp = b.get("component_name", "")
            if comp in HALLUCINATED:
                bad_blocks.append(b)
        
        if bad_blocks:
            meta = d / "metadata.json"
            aid = d.name
            slug = ""
            if meta.exists():
                with open(meta) as f:
                    m = json.load(f)
                    aid = m.get("id", d.name)
                    slug = m.get("slug", "")
            
            bad.append({
                "id": aid,
                "dir": d,
                "slug": slug,
                "bad_blocks": bad_blocks,
                "ui_blocks": data
            })
    
    return bad


def repair_article(article: Dict, dry_run: bool = True) -> List[str]:
    """Repair hallucinated components in an article"""
    changes = []
    d = article["dir"]
    ui = d / "ui-blocks.json"
    norm = d / "normalized.md"
    
    data = article["ui_blocks"]
    blocks = data.get("blocks", [])
    
    new_blocks = []
    removed_placeholders = []
    
    for b in blocks:
        comp = b.get("component_name", "")
        block_id = b.get("block_id", "")
        
        if comp not in HALLUCINATED:
            new_blocks.append(b)
            continue
        
        replacement = REPLACEMENTS[comp]
        
        if replacement is None:
            # Remove this block entirely
            changes.append(f"REMOVE {block_id}: {comp} → (removed)")
            removed_placeholders.append(block_id)
        else:
            # Replace component name
            changes.append(f"REPLACE {block_id}: {comp} → {replacement}")
            b["component_name"] = replacement
            # Update raw to use new component name
            raw = b.get("raw", "")
            if raw:
                # Replace opening tag
                raw = re.sub(rf'<{comp}\b', f'<{replacement}', raw)
                # Replace closing tag
                raw = re.sub(rf'</{comp}>', f'</{replacement}>', raw)
                b["raw"] = raw
            new_blocks.append(b)
    
    data["blocks"] = new_blocks
    data["ui_block_count"] = len(new_blocks)
    data["total_blocks"] = len(new_blocks)
    
    if not dry_run:
        # Write updated ui-blocks.json
        with open(ui, "w") as f:
            json.dump(data, f, indent=2)
        
        # Update normalized.md — remove placeholders for removed blocks
        if norm.exists() and removed_placeholders:
            text = norm.read_text()
            for ph in removed_placeholders:
                # Remove the entire placeholder block
                pattern = rf'\[SLATECAMP_UI_BLOCK:{ph}[^\]]*\][^\[]*\[/SLATECAMP_UI_BLOCK\]\n?'
                text = re.sub(pattern, '', text)
            norm.write_text(text)
    
    return changes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    
    dry_run = not args.apply
    
    bad_articles = find_bad_articles()
    print(f"Found {len(bad_articles)} articles with hallucinated components\n")
    
    total_changes = 0
    for article in bad_articles:
        changes = repair_article(article, dry_run=dry_run)
        total_changes += len(changes)
        print(f"\n{article['id']} | {article['slug']}")
        for c in changes:
            print(f"  {c}")
    
    print(f"\n{'='*50}")
    print(f"Total articles: {len(bad_articles)}")
    print(f"Total changes: {total_changes}")
    if dry_run:
        print(f"\nDRY RUN — no changes made. Use --apply to fix.")
    else:
        print(f"\nAPPLIED — all changes written.")


if __name__ == "__main__":
    main()
