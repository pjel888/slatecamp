#!/usr/bin/env python3
"""Sync content hashes from ui-blocks.json into article-metadata.json for all matl/util articles."""
import hashlib
import json
import os

BASE = "/Users/philiplewis/slatecamp/.ai/content-audit-export/articles"

def sha256(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

all_dirs = sorted(os.listdir(BASE))
target_dirs = [d for d in all_dirs if (d.startswith("lea-matl-") or d.startswith("lea-util-")) and os.path.isdir(os.path.join(BASE, d))]

print(f"Syncing hashes for {len(target_dirs)} articles...")

updated_count = 0
for dirname in target_dirs:
    article_dir = os.path.join(BASE, dirname)
    norm_path = os.path.join(article_dir, "normalized.md")
    meta_path = os.path.join(article_dir, "article-metadata.json")
    ui_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path) or not os.path.exists(meta_path) or not os.path.exists(ui_path):
        print(f"  SKIP {dirname}: missing files")
        continue
    
    # Calculate hash from normalized.md
    content = read(norm_path)
    actual_hash = sha256(content)
    
    # Read current metadata
    with open(meta_path) as f:
        meta = json.load(f)
    
    meta_hash = meta.get("content_hash", "").replace("sha256:", "")
    
    if meta_hash != actual_hash:
        meta["content_hash"] = f"sha256:{actual_hash}"
        meta["original_content_hash"] = f"sha256:{actual_hash}"
        with open(meta_path, 'w') as f:
            json.dump(meta, f, indent=2)
            f.write("\n")
        print(f"  UPDATED: {dirname}: {meta_hash[:12]}... -> {actual_hash[:12]}...")
        updated_count += 1
    
    # Also read ui-blocks.json to verify consistency
    with open(ui_path) as f:
        ui = json.load(f)
    
    ui_hash = ui.get("normalized_content_hash", "")
    if ui_hash != actual_hash:
        ui["normalized_content_hash"] = actual_hash
        with open(ui_path, 'w') as f:
            json.dump(ui, f, indent=2)
            f.write("\n")
        print(f"  FIXED UI HASH: {dirname}: {ui_hash[:16]}... -> {actual_hash[:16]}...")

print(f"\nDone! Updated {updated_count} metadata files.")
