# Schema: sync-state.json

```json
{
  "generated_at": "string",
  "last_export_run_id": "string",
  "last_component_inventory_run_id": "string | null",
  "articles": {
    "article_id": {
      "folder": "string",
      "original_hash": "sha256:string",
      "candidate_hash": "sha256:string | null",
      "last_diff_at": "string | null",
      "last_push_dry_run_at": "string | null",
      "last_push_applied_at": "string | null",
      "sync_status": "exported | normalized | candidate_ready | dry_run_passed | pushed | conflict | error"
    }
  }
}
```
