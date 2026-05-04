#!/usr/bin/env python3
"""
Wiki Article UI Upgrade — Batch Automation System
Orchestrates the full pipeline: validate → edit → compose → diff → push → verify

Usage:
    python batch_upgrade.py --phase zero-components --batch-size 5
    python batch_upgrade.py --phase existing-ui --batch-size 3
    python batch_upgrade.py --resume
"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Paths
SCRIPT_DIR = Path(__file__).parent
EXPORT_DIR = SCRIPT_DIR.parent / "articles"
LOG_DIR = SCRIPT_DIR.parent
STATE_FILE = LOG_DIR / "AUTONOMOUS_UI_UPGRADE_STATE.json"
RUN_LOG_JSON = LOG_DIR / "ui-upgrade-run-log.json"
RUN_LOG_MD = LOG_DIR / "ui-upgrade-run-log.md"
FINAL_SUMMARY = LOG_DIR / "ui-upgrade-final-summary.md"
VALIDATOR = SCRIPT_DIR / "validate_article.py"

# Load component whitelist
WHITELIST_PATH = SCRIPT_DIR.parent / "wiki-component-whitelist.json"
with open(WHITELIST_PATH) as f:
    WHITELIST_DATA = json.load(f)
VALID_COMPONENTS = set(WHITELIST_DATA["components"].keys())


def load_state() -> Dict:
    """Load or initialize resume state"""
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        "phase": "zero-components",
        "current_batch": 0,
        "completed": [],
        "failed": [],
        "skipped": [],
        "pending": [],
        "last_successful_push": None,
        "last_backup_path": None,
        "last_validation_status": None,
        "next_article": None,
        "started_at": datetime.utcnow().isoformat() + "Z"
    }


def save_state(state: Dict):
    """Persist resume state atomically"""
    tmp = STATE_FILE.with_suffix(".tmp")
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2)
    tmp.rename(STATE_FILE)


def load_manifest() -> List[Dict]:
    """Load article manifest from export directory"""
    manifest_path = EXPORT_DIR.parent / "manifest.json"
    with open(manifest_path) as f:
        return json.load(f)


def get_article_dir(article_id: str) -> Path:
    """Find article directory by ID"""
    for d in EXPORT_DIR.iterdir():
        if d.is_dir() and d.name == article_id:
            return d
    # Try finding by metadata
    for d in EXPORT_DIR.iterdir():
        if d.is_dir():
            meta = d / "metadata.json"
            if meta.exists():
                with open(meta) as f:
                    data = json.load(f)
                    if data.get("id") == article_id:
                        return d
    return None


def count_components_in_article(article_dir: Path) -> Tuple[int, List[str]]:
    """Count UI components in an article"""
    normalized_path = article_dir / "normalized.md"
    ui_blocks_path = article_dir / "ui-blocks.json"

    count = 0
    components = []

    if normalized_path.exists():
        text = normalized_path.read_text()
        # Count placeholders
        placeholders = re.findall(r'\[SLATECAMP_UI_BLOCK:([^\]]+)\]', text)
        count += len(placeholders)

        # Count raw MDX components
        tags = re.findall(r'<([A-Z][a-zA-Z0-9]*)\b', text)
        for tag in tags:
            if tag in VALID_COMPONENTS and tag not in components:
                components.append(tag)

    # Count raw MDX components
    tags = re.findall(r'<([A-Z][a-zA-Z0-9]*)\b', text)
    for tag in tags:
        if tag in VALID_COMPONENTS and tag not in components:
            components.append(tag)

    # Count placeholders
    placeholders = re.findall(r'\[SLATECAMP_UI_BLOCK:([^\]]+)\]', text)
    count += len(placeholders)

    if ui_blocks_path.exists():
        with open(ui_blocks_path) as f:
            ui_blocks = json.load(f)
            # New format: blocks array
            blocks = ui_blocks.get("blocks", [])
            if isinstance(blocks, list):
                count += len(blocks)
                for block in blocks:
                    if isinstance(block, dict):
                        comp = block.get("component_name", block.get("component", block.get("type", "")))
                        if comp and comp not in components:
                            components.append(comp)
            else:
                # Old format
                for bid, block in ui_blocks.items():
                    if isinstance(block, dict) and not bid.startswith(("article_id", "slug", "parser", "original", "normalized", "ui_block_count", "total_blocks", "ui_blocks_hash", "unknown_blocks")):
                        comp = block.get("component", block.get("type", ""))
                        if comp and comp not in components:
                            components.append(comp)

    return count, components


def build_queue(state: Dict, phase: str) -> List[str]:
    """Build article queue for current phase"""
    manifest = load_manifest()
    completed = set(state["completed"])
    failed = set(state["failed"])
    skipped = set(state["skipped"])

    queue = []
    for article in manifest:
        aid = article.get("id", article.get("article_id", ""))
        if aid in completed or aid in failed or aid in skipped:
            continue

        article_dir = get_article_dir(aid)
        if not article_dir:
            continue

        comp_count, _ = count_components_in_article(article_dir)

        if phase == "zero-components" and comp_count == 0:
            queue.append(aid)
        elif phase == "existing-ui" and comp_count > 0:
            queue.append(aid)

    return queue


def validate_article(article_dir: Path) -> Dict:
    """Run validation script on article"""
    result = subprocess.run(
        [sys.executable, str(VALIDATOR), str(article_dir)],
        capture_output=True,
        text=True
    )
    try:
        return json.loads(result.stdout)
    except:
        return {
            "valid": False,
            "errors": [{"type": "validator_crash", "message": result.stderr or result.stdout}]
        }


def run_compose(article_id: str) -> Tuple[bool, str]:
    """Run compose candidate for article"""
    result = subprocess.run(
        ["bun", "run", "content-audit:compose", "--", "--article-id", article_id, "--overwrite"],
        capture_output=True,
        text=True,
        cwd=EXPORT_DIR.parent.parent  # repo root
    )
    success = result.returncode == 0
    return success, result.stdout + result.stderr


def run_push(article_id: str, dry_run: bool = True) -> Tuple[bool, str]:
    """Run push to Supabase"""
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
    success = result.returncode == 0
    return success, result.stdout + result.stderr


def backup_supabase_row(article_id: str) -> Optional[str]:
    """Backup current Supabase content before push"""
    backup_dir = LOG_DIR / "backups" / datetime.utcnow().strftime("%Y%m%d")
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_path = backup_dir / f"{article_id}.json"

    # Use a simple query to get current content
    # This would need Supabase client; for now, we rely on original.md in export
    article_dir = get_article_dir(article_id)
    if article_dir:
        original = article_dir / "original.md"
        if original.exists():
            backup_path.write_text(original.read_text())
            return str(backup_path)
    return None


def process_article(article_id: str, state: Dict) -> Dict:
    """Process a single article through the full pipeline"""
    article_dir = get_article_dir(article_id)
    if not article_dir:
        return {"status": "failed", "reason": "article_dir_not_found"}

    # Load metadata
    meta_path = article_dir / "metadata.json"
    metadata = json.load(open(meta_path)) if meta_path.exists() else {}

    # Count before
    prev_count, prev_components = count_components_in_article(article_dir)

    # Step 1: Validate before edit
    validation = validate_article(article_dir)
    if not validation["valid"]:
        return {
            "status": "failed-needs-review",
            "reason": "pre_edit_validation_failed",
            "errors": validation["errors"]
        }

    # Step 2: Backup
    backup_path = backup_supabase_row(article_id)

    # Step 3: Edit (this is where AI judgment happens)
    # For now, we mark as needing manual edit
    # The actual edit will be done by the main process or subagent

    # Step 4: Validate after edit
    validation = validate_article(article_dir)
    if not validation["valid"]:
        return {
            "status": "failed-needs-review",
            "reason": "post_edit_validation_failed",
            "errors": validation["errors"]
        }

    # Step 5: Compose
    compose_ok, compose_out = run_compose(article_id)
    if not compose_ok:
        return {
            "status": "failed-needs-review",
            "reason": "compose_failed",
            "output": compose_out
        }

    # Step 6: Push (dry run first)
    dry_ok, dry_out = run_push(article_id, dry_run=True)
    if not dry_ok:
        return {
            "status": "failed-needs-review",
            "reason": "dry_run_failed",
            "output": dry_out
        }

    # Step 7: Push (apply)
    push_ok, push_out = run_push(article_id, dry_run=False)
    if not push_ok:
        return {
            "status": "failed-needs-review",
            "reason": "push_failed",
            "output": push_out
        }

    # Step 8: Count after
    new_count, new_components = count_components_in_article(article_dir)

    return {
        "status": "upgraded",
        "article_id": article_id,
        "slug": metadata.get("slug", ""),
        "title": metadata.get("title", ""),
        "prev_component_count": prev_count,
        "new_component_count": new_count,
        "prev_components": prev_components,
        "new_components": new_components,
        "backup_path": backup_path,
        "validation": validation
    }


def log_article_result(result: Dict):
    """Append result to JSON log"""
    log = json.load(open(RUN_LOG_JSON)) if RUN_LOG_JSON.exists() else {"articles": []}
    log["articles"].append(result)
    with open(RUN_LOG_JSON, "w") as f:
        json.dump(log, f, indent=2)


def run_batch(phase: str, batch_size: int, state: Dict) -> Dict:
    """Run a batch of articles"""
    queue = build_queue(state, phase)

    if not queue:
        return {"status": "phase_complete", "phase": phase}

    batch = queue[:batch_size]
    results = []

    for article_id in batch:
        result = process_article(article_id, state)
        results.append(result)

        if result["status"] == "upgraded":
            state["completed"].append(article_id)
            state["last_successful_push"] = article_id
        elif result["status"] == "failed-needs-review":
            state["failed"].append(article_id)
        else:
            state["skipped"].append(article_id)

        log_article_result(result)
        save_state(state)

    return {
        "status": "batch_complete",
        "phase": phase,
        "batch_size": len(batch),
        "results": results
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Wiki UI Upgrade Batch System")
    parser.add_argument("--phase", choices=["zero-components", "existing-ui"], default="zero-components")
    parser.add_argument("--batch-size", type=int, default=5)
    parser.add_argument("--resume", action="store_true", help="Resume from state file")
    args = parser.parse_args()

    state = load_state()

    if args.resume:
        args.phase = state.get("phase", "zero-components")

    # Build queue if empty
    if not state["pending"]:
        state["pending"] = build_queue(state, args.phase)
        save_state(state)

    print(f"Phase: {args.phase}")
    print(f"Queue size: {len(state['pending'])}")
    print(f"Completed: {len(state['completed'])}")
    print(f"Failed: {len(state['failed'])}")

    # Run batch
    result = run_batch(args.phase, args.batch_size, state)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
