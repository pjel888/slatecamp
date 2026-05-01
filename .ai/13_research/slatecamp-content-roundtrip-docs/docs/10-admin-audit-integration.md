# Admin Audit Integration

The content round-trip system should eventually connect to `/admin/ai-audit`, but this milestone can work independently.

## Optional integration points

When the AI Audit admin tables exist, the export/push scripts may log:

```text
export run created
article normalized
ui blocks extracted
component inventory generated
candidate diff created
push dry-run completed
push applied
conflict detected
```

## Do not block implementation

If the admin audit tables are not ready yet, write local run logs instead:

```text
.ai/content-audit-export/runs/<run_id>/run-log.json
```

## Suggested local-to-admin mapping

```text
export run -> ai_audit_runs
article normalized -> ai_audit_items
component/parse warning -> ai_audit_findings
candidate change -> ai_change_proposals
push applied -> ai_review_decisions or audit log
```

This is optional for the first implementation.

## Implemented optional importer

```bash
bun run content-audit:admin-log -- --run-id latest
bun run content-audit:admin-log -- --run-id latest --apply
```

The importer is dry-run by default. With `--apply`, it inserts one best-effort `ai_audit_runs` row using existing AI Audit tables. Missing-table or permission errors are reported as warnings so local content-audit workflows remain independent.
