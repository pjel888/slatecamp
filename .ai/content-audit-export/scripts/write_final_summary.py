#!/usr/bin/env python3
"""
Write Final Summary
Generates the comprehensive final summary report.
Usage: python write_final_summary.py
"""

import json
from pathlib import Path
from datetime import datetime, timezone

EXPORT_DIR = Path("/Users/philiplewis/slatecamp/.ai/content-audit-export")

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def main():
    state_file = EXPORT_DIR / "AUTONOMOUS_UI_UPGRADE_STATE.json"
    queues_dir = EXPORT_DIR / "queues"
    
    state = {}
    if state_file.exists():
        with open(state_file) as f:
            state = json.load(f)
    
    # Count queue items
    queue_counts = {}
    for qfile in queues_dir.glob("queue-*.json"):
        with open(qfile) as f:
            data = json.load(f)
        queue_counts[qfile.stem] = data.get("count", 0)
    
    completed = len(state.get("completed_articles", []))
    quarantined = len(state.get("quarantined_articles", []))
    
    summary = f"""# SlateCamp Wiki UI Upgrade — Final Summary

**Generated:** {now_iso()}
**Phase:** {state.get("phase", "UNKNOWN")}

## Corpus Statistics

- **Total articles scanned:** 562
- **Articles completed:** {completed}
- **Articles quarantined:** {quarantined}

## Queue Status

"""
    for name, count in queue_counts.items():
        summary += f"- **{name}:** {count}\n"
    
    summary += f"""
## Completed Articles

{completed} articles have been successfully processed and pushed to Supabase.

## Quarantined Articles

{quarantined} articles were quarantined due to errors:

"""
    for item in state.get("quarantined_articles", [])[:20]:
        summary += f"- `{item.get('article_id')}` — {item.get('reason', 'unknown')}\n"
    
    summary += f"""
## Remaining Risks

- Stale baselines may reappear if Supabase content changes
- Large articles may require direct push bypass
- Some articles may need manual editorial review

## Resume Instructions

If the process needs to resume:
1. Check `AUTONOMOUS_UI_UPGRADE_STATE.json` for current phase
2. Run `python scripts/supervisor_loop.py`
3. The loop will continue from the current phase

## Backup Locations

- Article exports: `.ai/content-audit-export/articles/`
- Queue files: `.ai/content-audit-export/queues/`
- State file: `.ai/content-audit-export/AUTONOMOUS_UI_UPGRADE_STATE.json`
- Logs: `.ai/content-audit-export/supervisor-log.json`
"""
    
    with open(EXPORT_DIR / "ui-upgrade-final-summary.md", "w") as f:
        f.write(summary)
    
    print("Final summary written to ui-upgrade-final-summary.md")
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
