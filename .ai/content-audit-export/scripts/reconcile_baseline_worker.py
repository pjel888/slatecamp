#!/usr/bin/env python3
"""
Stale Baseline Reconciler Worker
Fetches current Supabase content, rebuilds original.md, recomputes hash, reapplies safe edit.
Usage: python reconcile_baseline_worker.py <article_id>
"""

import json
import sys
import subprocess
from pathlib import Path

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")

def find_article_dir(article_id: str) -> Path:
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None

def reconcile_baseline(article_id: str) -> bool:
    # Use the TypeScript reconciliation script
    result = subprocess.run(
        ["bun", "run", "scripts/content-audit/reconcile-stale-baselines.ts", "--", "--dry-run", "--article-id", article_id],
        capture_output=True,
        text=True,
        timeout=60,
        cwd="/Users/philiplewis/slatecamp"
    )
    
    if result.returncode != 0:
        print(f"DRY_RUN_FAILED: {result.stderr[:200]}")
        return False
    
    # Apply
    result = subprocess.run(
        ["bun", "run", "scripts/content-audit/reconcile-stale-baselines.ts", "--", "--apply", "--article-id", article_id],
        capture_output=True,
        text=True,
        timeout=60,
        cwd="/Users/philiplewis/slatecamp"
    )
    
    if result.returncode != 0:
        print(f"APPLY_FAILED: {result.stderr[:200]}")
        return False
    
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python reconcile_baseline_worker.py <article_id>")
        sys.exit(1)
    
    article_id = sys.argv[1]
    
    if not reconcile_baseline(article_id):
        print(f"RECONCILE_FAILED: {article_id}")
        sys.exit(1)
    
    print(f"SUCCESS: {article_id}")

if __name__ == "__main__":
    main()
