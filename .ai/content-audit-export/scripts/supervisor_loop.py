#!/usr/bin/env python3
"""
Supervisor Loop for SlateCamp Wiki UI Upgrade
Continuously processes queues until all articles have final status.
"""

import json
import os
import sys
import time
import subprocess
import glob
from pathlib import Path
from datetime import datetime, timezone

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/articles")
QUEUES_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/queues")
LOCKS_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/locks")
STATE_FILE = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/AUTONOMOUS_UI_UPGRADE_STATE.json")
LOG_FILE = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/supervisor-log.json")

PHASES = [
    "INIT",
    "VERIFY_COMPLETED_WORK",
    "BUILD_COMPONENT_WHITELIST",
    "FULL_CORPUS_SCAN",
    "REPAIR_CORRUPTED_PLACEHOLDERS",
    "RECONCILE_STALE_BASELINES",
    "REPAIR_HALLUCINATED_COMPONENTS",
    "PROCESS_ZERO_COMPONENT_ARTICLES",
    "AUDIT_PLACEHOLDER_ONLY_ARTICLES",
    "AUDIT_EXISTING_UI_ARTICLES",
    "FINAL_CORPUS_VALIDATION",
    "FINAL_SUPABASE_VERIFICATION",
    "FINAL_SUMMARY",
    "COMPLETE"
]

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"phase": "INIT", "last_updated": now_iso(), "completed_articles": [], "quarantined_articles": []}

def save_state(state):
    state["last_updated"] = now_iso()
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def log_event(event):
    entry = {"timestamp": now_iso(), **event}
    logs = []
    if LOG_FILE.exists():
        with open(LOG_FILE) as f:
            logs = json.load(f)
    logs.append(entry)
    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=2)

def load_queue(name):
    path = QUEUES_DIR / f"queue-{name}.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {"count": 0, "items": []}

def save_queue(name, data):
    path = QUEUES_DIR / f"queue-{name}.json"
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def claim_article(article_id, worker_name, phase):
    lock_path = LOCKS_DIR / f"{article_id}.lock"
    if lock_path.exists():
        return False
    with open(lock_path, "w") as f:
        json.dump({"article_id": article_id, "worker": worker_name, "phase": phase, "started_at": now_iso()}, f)
    return True

def release_article(article_id):
    lock_path = LOCKS_DIR / f"{article_id}.lock"
    if lock_path.exists():
        lock_path.unlink()

def run_worker_script(script_name, article_id):
    script_path = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/scripts") / script_name
    result = subprocess.run(
        [sys.executable, str(script_path), article_id],
        capture_output=True,
        text=True,
        timeout=120
    )
    return result.returncode == 0, result.stdout, result.stderr

def process_queue_items(queue_name, worker_script, max_batch=5):
    queue = load_queue(queue_name)
    items = queue.get("items", [])
    
    if not items:
        return 0
    
    processed = 0
    for item in items[:max_batch]:
        article_id = item.get("article_id")
        if not article_id:
            continue
        
        if claim_article(article_id, worker_script, queue_name):
            try:
                ok, stdout, stderr = run_worker_script(worker_script, article_id)
                if ok:
                    # Move to completed
                    state = load_state()
                    state["completed_articles"].append({
                        "article_id": article_id,
                        "slug": item.get("slug"),
                        "phase": queue_name,
                        "completed_at": now_iso()
                    })
                    save_state(state)
                    processed += 1
                else:
                    # Quarantine
                    state = load_state()
                    state["quarantined_articles"].append({
                        "article_id": article_id,
                        "slug": item.get("slug"),
                        "phase": queue_name,
                        "reason": stderr[:200],
                        "quarantined_at": now_iso()
                    })
                    save_state(state)
                    
                    quarantine = load_queue("quarantined")
                    quarantine["items"].append(item)
                    quarantine["count"] = len(quarantine["items"])
                    save_queue("quarantined", quarantine)
            finally:
                release_article(article_id)
    
    # Remove processed items from queue
    remaining = items[max_batch:]
    queue["items"] = remaining
    queue["count"] = len(remaining)
    save_queue(queue_name, queue)
    
    return processed

def main():
    print(f"[{now_iso()}] Supervisor starting")
    log_event({"event": "supervisor_start", "pid": os.getpid()})
    
    iteration = 0
    while True:
        iteration += 1
        state = load_state()
        current_phase = state.get("phase", "INIT")
        
        print(f"[{now_iso()}] Iteration {iteration}, Phase: {current_phase}")
        
        if current_phase == "INIT":
            state["phase"] = "VERIFY_COMPLETED_WORK"
            save_state(state)
            continue
        
        elif current_phase == "VERIFY_COMPLETED_WORK":
            # Check what was already done
            state["phase"] = "FULL_CORPUS_SCAN"
            save_state(state)
            continue
        
        elif current_phase == "FULL_CORPUS_SCAN":
            # Run the audit
            audit_script = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/scripts/comprehensive_corpus_audit.py")
            result = subprocess.run([sys.executable, str(audit_script)], capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                state["phase"] = "REPAIR_CORRUPTED_PLACEHOLDERS"
                save_state(state)
            else:
                log_event({"event": "audit_failed", "stderr": result.stderr[:500]})
                time.sleep(10)
            continue
        
        elif current_phase == "REPAIR_CORRUPTED_PLACEHOLDERS":
            queue = load_queue("corrupted_placeholders")
            if queue["count"] == 0:
                state["phase"] = "RECONCILE_STALE_BASELINES"
                save_state(state)
                continue
            
            processed = process_queue_items("corrupted_placeholders", "repair_placeholder_worker.py", max_batch=3)
            log_event({"event": "processed_corrupted", "count": processed, "remaining": queue["count"] - processed})
            if processed == 0 and queue["count"] > 0:
                # All items locked or failed, wait
                time.sleep(5)
            continue
        
        elif current_phase == "RECONCILE_STALE_BASELINES":
            queue = load_queue("stale_baselines")
            if queue["count"] == 0:
                state["phase"] = "REPAIR_HALLUCINATED_COMPONENTS"
                save_state(state)
                continue
            
            processed = process_queue_items("stale_baselines", "reconcile_baseline_worker.py", max_batch=3)
            log_event({"event": "processed_stale", "count": processed, "remaining": queue["count"] - processed})
            if processed == 0 and queue["count"] > 0:
                time.sleep(5)
            continue
        
        elif current_phase == "REPAIR_HALLUCINATED_COMPONENTS":
            queue = load_queue("hallucinated_components")
            if queue["count"] == 0:
                state["phase"] = "PROCESS_ZERO_COMPONENT_ARTICLES"
                save_state(state)
                continue
            
            processed = process_queue_items("hallucinated_components", "repair_hallucinated_worker.py", max_batch=3)
            log_event({"event": "processed_hallucinated", "count": processed, "remaining": queue["count"] - processed})
            if processed == 0 and queue["count"] > 0:
                time.sleep(5)
            continue
        
        elif current_phase == "PROCESS_ZERO_COMPONENT_ARTICLES":
            queue = load_queue("zero_components")
            if queue["count"] == 0:
                state["phase"] = "AUDIT_PLACEHOLDER_ONLY_ARTICLES"
                save_state(state)
                continue
            
            processed = process_queue_items("zero_components", "editorial_upgrade_worker.py", max_batch=3)
            log_event({"event": "processed_zero", "count": processed, "remaining": queue["count"] - processed})
            if processed == 0 and queue["count"] > 0:
                time.sleep(5)
            continue
        
        elif current_phase == "AUDIT_PLACEHOLDER_ONLY_ARTICLES":
            # Process placeholder_only and weak_ui queues
            total_remaining = 0
            for qname in ["placeholder_only", "weak_ui", "existing_ui_audit"]:
                queue = load_queue(qname)
                if queue["count"] > 0:
                    processed = process_queue_items(qname, "editorial_audit_worker.py", max_batch=5)
                    total_remaining += queue["count"] - processed
            
            if total_remaining == 0:
                state["phase"] = "FINAL_CORPUS_VALIDATION"
                save_state(state)
            else:
                log_event({"event": "processed_audit", "remaining": total_remaining})
                time.sleep(5)
            continue
        
        elif current_phase == "FINAL_CORPUS_VALIDATION":
            validation_script = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/scripts/final_corpus_validation.py")
            result = subprocess.run([sys.executable, str(validation_script)], capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                state["phase"] = "FINAL_SUPABASE_VERIFICATION"
                save_state(state)
            else:
                log_event({"event": "validation_failed", "stderr": result.stderr[:500]})
                time.sleep(10)
            continue
        
        elif current_phase == "FINAL_SUPABASE_VERIFICATION":
            # Verify all pushed articles
            verify_script = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/scripts/verify_supabase.py")
            result = subprocess.run([sys.executable, str(verify_script)], capture_output=True, text=True, timeout=300)
            state["phase"] = "FINAL_SUMMARY"
            save_state(state)
            continue
        
        elif current_phase == "FINAL_SUMMARY":
            summary_script = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export/scripts/write_final_summary.py")
            result = subprocess.run([sys.executable, str(summary_script)], capture_output=True, text=True, timeout=300)
            state["phase"] = "COMPLETE"
            save_state(state)
            continue
        
        elif current_phase == "COMPLETE":
            print(f"[{now_iso()}] All queues processed. Corpus upgrade complete.")
            log_event({"event": "complete", "total_iterations": iteration})
            break
        
        else:
            log_event({"event": "unknown_phase", "phase": current_phase})
            state["phase"] = "INIT"
            save_state(state)
            time.sleep(5)
    
    print(f"[{now_iso()}] Supervisor exiting")

if __name__ == "__main__":
    main()
