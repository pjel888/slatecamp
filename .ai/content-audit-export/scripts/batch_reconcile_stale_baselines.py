#!/usr/bin/env python3
"""
Batch Stale Baseline Reconciler
Fetches all Supabase content in one query, rebuilds baselines for all stale articles.
Usage: python batch_reconcile_stale_baselines.py
"""

import json
import os
import subprocess
from pathlib import Path
from datetime import datetime, timezone

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
QUEUES_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/queues")

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def sha256(content: str) -> str:
    import hashlib
    return f"sha256:{hashlib.sha256(content.encode('utf-8')).hexdigest()}"

def fetch_all_supabase_content():
    """Fetch all wiki_articles content from Supabase."""
    script = """
import { createContentAuditSupabaseClient } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
const supabase = createContentAuditSupabaseClient()
const { data, error } = await supabase.from('wiki_articles').select('article_id, content').limit(600)
if (error) throw error
console.log(JSON.stringify({count: data.length, articles: data}))
"""
    with open('/tmp/fetch_all.ts', 'w') as f:
        f.write(script)
    
    result = subprocess.run(
        ["bun", "run", "/tmp/fetch_all.ts"],
        capture_output=True,
        text=True,
        timeout=120
    )
    
    try:
        # Parse last non-empty line
        lines = [l for l in result.stdout.strip().split('\n') if l.strip()]
        data = json.loads(lines[-1])
        return data
    except Exception as e:
        print(f"Fetch failed: {e}")
        print(f"stdout: {result.stdout[:500]}")
        print(f"stderr: {result.stderr[:500]}")
        return None

def find_article_dir(article_id: str) -> Path:
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None

def reconcile_article(article_id: str, remote_content: str) -> bool:
    article_dir = find_article_dir(article_id)
    if not article_dir:
        return False
    
    # Write original.md from remote content
    original_path = article_dir / "original.md"
    with open(original_path, 'w') as f:
        f.write(remote_content)
    
    # Update metadata with computed hash
    meta_path = article_dir / "article-metadata.json"
    if meta_path.exists():
        with open(meta_path, 'r') as f:
            meta = json.load(f)
        meta["content_hash"] = sha256(remote_content)
        meta["updated_at"] = now_iso()
        with open(meta_path, 'w') as f:
            json.dump(meta, f, indent=2)
    
    # Remove push-result.json to clear stale flags
    push_path = article_dir / "push-result.json"
    if push_path.exists():
        push_path.unlink()
    
    return True

def main():
    print(f"[{now_iso()}] Fetching all Supabase content...")
    data = fetch_all_supabase_content()
    if not data:
        print("Failed to fetch Supabase content")
        return 1
    
    articles = data.get("articles", [])
    print(f"Fetched {len(articles)} articles from Supabase")
    
    # Build lookup
    supabase_lookup = {a["article_id"]: a for a in articles}
    
    # Load stale baseline queue
    stale_path = QUEUES_DIR / "queue-stale_baselines.json"
    with open(stale_path) as f:
        stale_queue = json.load(f)
    
    stale_items = stale_queue.get("items", [])
    print(f"Processing {len(stale_items)} stale baseline articles...")
    
    reconciled = 0
    failed = 0
    
    for item in stale_items:
        article_id = item.get("article_id")
        if not article_id:
            continue
        
        supabase_data = supabase_lookup.get(article_id)
        if not supabase_data:
            print(f"  {article_id}: NOT_FOUND in Supabase")
            failed += 1
            continue
        
        remote_content = supabase_data.get("content", "")
        
        if reconcile_article(article_id, remote_content):
            reconciled += 1
        else:
            failed += 1
            print(f"  {article_id}: RECONCILE_FAILED")
    
    print(f"\nReconciled: {reconciled}, Failed: {failed}")
    
    # Clear stale baseline queue
    stale_queue["items"] = []
    stale_queue["count"] = 0
    with open(stale_path, 'w') as f:
        json.dump(stale_queue, f, indent=2)
    
    print(f"Stale baseline queue cleared")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
