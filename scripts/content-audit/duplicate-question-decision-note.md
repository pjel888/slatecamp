# Duplicate Question Handling — Decision Note

## Original Behavior

When a question edit file has `"status": "duplicate"`, the push script (`push-question-to-supabase.ts`) would:
- Add a blocker to the push report: `"Question is flagged as duplicate; edit will not be pushed to Supabase."`
- Write the push report to disk
- Log the report as JSON
- Call `process.exit(1)` — terminating the script with a failure exit code

This meant that any pipeline running `push-question-to-supabase.ts` for multiple questions would halt on the first duplicate-flagged question, even though skipping the push was the correct behavior.

## Problem

The `process.exit(1)` on a duplicate-flagged question made duplicates into **fatal errors** when they should have been **informational skips**. This broke batch-processing pipelines and caused unnecessary false negatives in CI/automation runs.

## Current Behavior (after hard-fix)

When a question edit file has `"status": "duplicate"`:

- A **warning** (not a blocker) is added to the push report: `"Question is flagged as duplicate; skipping push to Supabase."`
- The push report is written to disk (with `pushed: false`).
- The report is logged as JSON.
- The `main()` function returns early via `return` — no `process.exit()` is called.
- **No Supabase UPDATE query runs** for the duplicate question.
- The script **continues** (in a batch context) or **exits cleanly** with exit code 0.
- The `report.blockers` array remains empty for this case, so the final check at line 149 (`if ((report.blockers as string[]).length > 0) process.exit(1)`) does not fire.

### Key differences from original

| Aspect | Original | Current |
|--------|----------|---------|
| Report entry type | `report.blockers` | `report.warnings` |
| Exit code | `1` (failure) | `0` (success, via `return`) |
| Supabase push | Skipped | Skipped (same) |
| Pipeline impact | Halts processing | Continues processing |
| Log message | "edit will not be pushed" | "skipping push to Supabase" |

### Rationale

- Duplicate questions are a normal, expected condition — not an error.
- The edit file signals intent ("this question is a duplicate, do not push it"), which should be respected silently.
- Blockers and exit code 1 are reserved for genuine errors (missing files, stale baselines, network failures, etc.).
