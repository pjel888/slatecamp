# Optional Audit Logging

If `/admin/ai-audit` tables exist, scripts may log local actions there.

## Events to log

```text
content_export_started
content_export_completed
article_normalized
ui_blocks_extracted
component_inventory_generated
candidate_composed
diff_generated
push_dry_run_completed
push_applied
push_conflict_detected
```

## Keep optional

The export system must work even if audit tables are not yet migrated.

Local logs are enough for MVP.
