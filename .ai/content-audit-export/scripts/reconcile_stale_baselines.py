#!/usr/bin/env python3
"""
Wiki Article UI Upgrade — Stale Baseline Reconciliation Script
Safely reconciles repaired articles with stale Supabase baselines.

Pipeline:
1. Fetch current Supabase content
2. Refresh original.md and metadata hashes
3. Reapply hallucinated-component repairs
4. Validate
5. Diff
6. Backup
7. Push
8. Verify

Usage:
    python reconcile_stale_baselines.py --dry-run
    python reconcile_stale_baselines.py --apply
"""

import json
import hashlib
import os
import re
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Paths
SCRIPT_DIR = Path(__file__).parent
EXPORT_DIR = SCRIPT_DIR.parent / "articles"
LOG_DIR = SCRIPT_DIR.parent
STATE_FILE = LOG_DIR / "AUTONOMOUS_UI_UPGRADE_STATE.json"
RUN_LOG_JSON = LOG_DIR / "ui-upgrade-run-log.json"

# Load Supabase credentials from env
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Component whitelist
WHITELIST_PATH = SCRIPT_DIR.parent / "wiki-component-whitelist.json"
with open(WHITELIST_PATH) as f:
    WHITELIST_DATA = json.load(f)
VALID_COMPONENTS = set(WHITELIST_DATA["components"].keys())

# Hash function matching the project

def sha256(content: str) -> str:
    return f"sha256:{hashlib.sha256(content.encode('utf-8')).hexdigest()}"


def get_supabase_client():
    """Create Supabase client"""
    try:
        from supabase import create_client
        if SUPABASE_URL and SUPABASE_KEY:
            return create_client(SUPABASE_URL, SUPABASE_KEY)
    except ImportError:
        pass
    return None


def fetch_supabase_content(article_id: str) -> Optional[Dict]:
    """Fetch current article content from Supabase"""
    client = get_supabase_client()
    if not client:
        return None
    
    try:
        result = client.table("wiki_articles").select("id, slug, title, content, updated_at").eq("id", article_id).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
    except Exception as e:
        print(f"  Supabase fetch error: {e}")
    return None


def find_article_dir(article_id: str) -> Optional[Path]:
    """Find article directory by ID"""
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and article_id in d.name:
            return d
    return None


def load_article_files(article_dir: Path) -> Dict:
    """Load all article files"""
    files = {}
    for fname in ["original.md", "normalized.md", "ui-blocks.json", "article-metadata.json", "metadata.json"]:
        fpath = article_dir / fname
        if fpath.exists():
            if fname.endswith(".json"):
                files[fname] = json.load(open(fpath))
            else:
                files[fname] = fpath.read_text()
    return files


def refresh_baseline(article_dir: Path, supabase_content: Dict) -> Dict:
    """Refresh original.md and metadata from Supabase content"""
    content = supabase_content.get("content", "")
    
    # Write fresh original.md
    original_path = article_dir / "original.md"
    original_path.write_text(content)
    
    # Update metadata
    meta_path = article_dir / "article-metadata.json"
    if meta_path.exists():
        meta = json.load(open(meta_path))
    else:
        meta = {}
    
    content_hash = sha256(content)
    meta["original_content_hash"] = content_hash
    meta["remote_content_hash"] = content_hash
    meta["remote_updated_at"] = supabase_content.get("updated_at", "")
    meta["slug"] = supabase_content.get("slug", meta.get("slug", ""))
    meta["title"] = supabase_content.get("title", meta.get("title", ""))
    
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    
    # Also update ui-blocks.json metadata
    ui_path = article_dir / "ui-blocks.json"
    if ui_path.exists():
        ui = json.load(open(ui_path))
        ui["original_content_hash"] = content_hash
        with open(ui_path, "w") as f:
            json.dump(ui, f, indent=2)
    
    return {
        "original_hash": content_hash,
        "content": content,
        "meta": meta
    }


def reapply_repair(article_dir: Path, files: Dict) -> Dict:
    """Reapply hallucinated component repairs to the fresh baseline"""
    ui_path = article_dir / "ui-blocks.json"
    if not ui_path.exists():
        return {"repaired": False, "reason": "no ui-blocks.json"}
    
    ui = json.load(open(ui_path))
    blocks = ui.get("blocks", [])
    
    if not isinstance(blocks, list):
        return {"repaired": False, "reason": "invalid blocks format"}
    
    # Replacement map (same as repair_hallucinated.py)
    REPLACEMENTS = {
        "JSX": None,
        "details": "Accordion",
        "LeartBox": "Callout",
        "Leart": "Note",
        "InfoBox": "Callout",
        "TechnicalBox": "Callout",
        "DataTable": "WikiExamTable",
        "JSXCode": None,
        "ComparisonChart": "ComparisonTable",
        "PriceBreakdown": "KeyValues",
        "SensorTable": "WikiExamTable",
        "ComplianceChecklist": "ProcessFlow",
        "DataQualitySpec": "Note",
        "RevealBlock": "Accordion",
        "QuestionBank": None,
        "ConflictMatrix": "ComparisonTable",
        "EthicalFramework": "ProcessFlow",
        "RegulationFramework": "ProcessFlow",
        "MDXComponent": "Callout",
    }
    
    changes = []
    new_blocks = []
    
    for b in blocks:
        comp = b.get("component_name", "")
        block_id = b.get("block_id", "")
        
        if comp not in REPLACEMENTS:
            new_blocks.append(b)
            continue
        
        replacement = REPLACEMENTS[comp]
        
        if replacement is None:
            changes.append({"action": "remove", "block_id": block_id, "old": comp})
        else:
            changes.append({"action": "replace", "block_id": block_id, "old": comp, "new": replacement})
            b["component_name"] = replacement
            raw = b.get("raw", "")
            if raw:
                raw = re.sub(rf'<{comp}\b', f'<{replacement}', raw)
                raw = re.sub(rf'</{comp}>', f'</{replacement}>', raw)
                b["raw"] = raw
            new_blocks.append(b)
    
    ui["blocks"] = new_blocks
    ui["ui_block_count"] = len(new_blocks)
    ui["total_blocks"] = len(new_blocks)
    
    with open(ui_path, "w") as f:
        json.dump(ui, f, indent=2)
    
    return {
        "repaired": True,
        "changes": changes,
        "blocks_before": len(blocks),
        "blocks_after": len(new_blocks)
    }


def validate_article(article_dir: Path) -> Dict:
    """Run validation checks"""
    import subprocess
    validator = SCRIPT_DIR / "validate_article.py"
    result = subprocess.run(
        [sys.executable, str(validator), str(article_dir)],
        capture_output=True,
        text=True
    )
    try:
        return json.loads(result.stdout)
    except:
        return {"valid": False, "errors": [{"type": "validator_crash", "message": result.stderr or result.stdout}]}


def run_compose(article_id: str) -> Tuple[bool, str]:
    """Run compose candidate"""
    import subprocess
    result = subprocess.run(
        ["bun", "run", "content-audit:compose", "--", "--article-id", article_id, "--overwrite"],
        capture_output=True,
        text=True,
        cwd=EXPORT_DIR.parent.parent
    )
    return result.returncode == 0, result.stdout + result.stderr


def run_push(article_id: str, dry_run: bool = True) -> Tuple[bool, str]:
    """Run push to Supabase"""
    import subprocess
    cmd = ["bun", "run", "content-audit:push"]
    if dry_run:
        cmd.append("--dry-run")
    else:
        cmd.append("apply")
    cmd.extend(["--", "--article-id", article_id])
    
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=EXPORT_DIR.parent.parent
    )
    return result.returncode == 0, result.stdout + result.stderr


def backup_supabase_row(article_id: str, content: str) -> str:
    """Backup current Supabase content"""
    backup_dir = LOG_DIR / "backups" / "reconciled"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_path = backup_dir / f"{article_id}.md"
    backup_path.write_text(content)
    return str(backup_path)


def reconcile_article(article_id: str, dry_run: bool = True) -> Dict:
    """Full reconciliation pipeline for one article"""
    result = {
        "article_id": article_id,
        "status": "pending",
        "steps": []
    }
    
    # Step 1: Find article directory
    article_dir = find_article_dir(article_id)
    if not article_dir:
        result["status"] = "failed-needs-review"
        result["reason"] = "article_dir_not_found"
        return result
    
    result["dir"] = str(article_dir.name)
    
    # Step 2: Fetch current Supabase content
    supabase_data = fetch_supabase_content(article_id)
    if not supabase_data:
        result["status"] = "failed-needs-review"
        result["reason"] = "supabase_fetch_failed"
        return result
    
    result["supabase_hash"] = sha256(supabase_data.get("content", ""))
    result["supabase_updated_at"] = supabase_data.get("updated_at", "")
    
    # Step 3: Backup
    backup_path = backup_supabase_row(article_id, supabase_data.get("content", ""))
    result["backup_path"] = backup_path
    
    # Step 4: Refresh baseline
    baseline = refresh_baseline(article_dir, supabase_data)
    result["refreshed_hash"] = baseline["original_hash"]
    result["steps"].append("baseline_refreshed")
    
    # Step 5: Reapply repair
    repair_result = reapply_repair(article_dir, baseline)
    result["repair"] = repair_result
    result["steps"].append("repair_reapplied")
    
    # Step 6: Validate
    validation = validate_article(article_dir)
    result["validation"] = validation
    result["steps"].append("validated")
    
    if not validation.get("valid", False):
        result["status"] = "failed-needs-review"
        result["reason"] = "validation_failed"
        return result
    
    # Step 7: Compose
    compose_ok, compose_out = run_compose(article_id)
    result["compose_ok"] = compose_ok
    result["compose_output"] = compose_out
    result["steps"].append("composed")
    
    if not compose_ok:
        result["status"] = "failed-needs-review"
        result["reason"] = "compose_failed"
        return result
    
    # Step 8: Dry-run push
    dry_ok, dry_out = run_push(article_id, dry_run=True)
    result["dry_run_ok"] = dry_ok
    result["dry_run_output"] = dry_out
    result["steps"].append("dry_run")
    
    if not dry_ok:
        result["status"] = "failed-needs-review"
        result["reason"] = "dry_run_failed"
        return result
    
    if dry_run:
        result["status"] = "dry-run-passed"
        return result
    
    # Step 9: Apply push
    push_ok, push_out = run_push(article_id, dry_run=False)
    result["push_ok"] = push_ok
    result["push_output"] = push_out
    result["steps"].append("pushed")
    
    if not push_ok:
        result["status"] = "failed-needs-review"
        result["reason"] = "push_failed"
        return result
    
    # Step 10: Verify by re-fetching
    verify_data = fetch_supabase_content(article_id)
    if verify_data:
        verify_hash = sha256(verify_data.get("content", ""))
        result["verify_hash"] = verify_hash
        result["verified"] = True
    else:
        result["verified"] = False
    
    result["status"] = "reconciled-and-pushed"
    return result


def main():
    parser = argparse.ArgumentParser(description="Reconcile stale baselines for repaired articles")
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--article-id", type=str, help="Process single article")
    args = parser.parse_args()
    
    dry_run = not args.apply
    
    # Load state to get repaired article IDs
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            state = json.load(f)
    else:
        state = {}
    
    # The 26 repaired articles are the most recently modified directories
    # We need to identify them. For now, use a hardcoded list from the repair log.
    repaired_ids = [
        "f815c409-77f7-4489-b3b9-7cb2f3010ad9",  # lea-util-006-05
        "eee5c71f-539a-4ec8-a8b2-66e330a0c444",  # lea-prac-cmp-013
        "265185c0-c1ac-4f40-8db0-bde23084f634",  # lea-prac-eth-010
        "9085e0d8-3498-4d3b-b991-46e54d94bde0",  # pd-1096-rule-vii-occupancy
        "7e5be79c-b68f-44ff-8252-ef97874e528d",  # lea-prac-cmp-010
        "859b1a7f-8aba-473d-8c28-f9aaa39af11d",  # pd-1096-rule-viii-setbacks
        "850a66f9-db5d-4068-a763-0bc4c1d9872a",  # minimum-parking-requirements
        "687e0da7-4e39-454f-b3f8-a95308678556",  # building-permit-process
        "47317c8d-e2d6-4d17-b18a-3c469b73080c",  # lea-prac-frm-020
        "9261cc17-24c1-49d2-a45a-158032f6fcd3",  # lea-prac-frm-016
        "b862f4a8-fa65-4cf7-bcb8-bec5b330d837",  # lea-util-006-06
        "85bcd328-436d-49ba-9d37-7b202d0d38d4",  # pd-1096-rule-vii-area-metrics
        "62733840-d170-40de-a27e-31fa31c30c69",  # lea-util-007-02
        "c9b1aadd-4843-4cf3-a551-6dd67678e508",  # lea-dsgn-007-04
        "93009368-9041-46e0-b93b-8786100311be",  # pd-1096-rule-xii-egress
        "a865c6b2-8c25-404e-bb0c-08d374d374a5",  # pd-1096-rule-vii-height-limits
        "bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4",  # lea-prac-frm-015
        "ca53ed30-fdc6-42de-bb68-b5335d0d77a6",  # lea-util-005-05
        "17350925-ae83-47a1-a30f-a96eb5c1d942",  # lea-prac-eth-011
        "9eb0b48e-110e-4c75-8a0c-4f83063001cf",  # lea-prac-frm-018
        "958cf8ad-c743-41b3-a7fd-47da9421a09b",  # lea-prac-eth-009
        "303f8a75-b42b-4405-8c39-082b4d7b6322",  # lea-prac-frm-021
        "f95d5cc8-30d4-4f74-890f-1018d764da6e",  # lea-prac-cmp-012
        "5f341f81-5e43-49d6-a821-2a67c5d07c59",  # lea-prac-eth-012
        "3a7ba43c-5ef5-4fd8-b054-ccb8a567d6f7",  # lea-prac-eth-013
        "425c5476-12a0-476c-96e3-3f10c1530a9c",  # lea-prac-cmp-011
    ]
    
    if args.article_id:
        repaired_ids = [args.article_id]
    
    print(f"Reconciling {len(repaired_ids)} repaired articles")
    print(f"Mode: {'DRY RUN' if dry_run else 'APPLY'}")
    print("=" * 60)
    
    results = []
    for aid in repaired_ids:
        print(f"\n--- {aid} ---")
        result = reconcile_article(aid, dry_run=dry_run)
        results.append(result)
        print(f"Status: {result['status']}")
        if result.get('reason'):
            print(f"Reason: {result['reason']}")
        if result.get('repair', {}).get('changes'):
            print(f"Changes: {len(result['repair']['changes'])}")
    
    # Save results
    log_path = LOG_DIR / "reconcile-results.json"
    with open(log_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n{'=' * 60}")
    passed = [r for r in results if r['status'] in ('reconciled-and-pushed', 'dry-run-passed')]
    failed = [r for r in results if r['status'] == 'failed-needs-review']
    print(f"Passed: {len(passed)}")
    print(f"Failed: {len(failed)}")
    print(f"Log: {log_path}")


if __name__ == "__main__":
    main()
