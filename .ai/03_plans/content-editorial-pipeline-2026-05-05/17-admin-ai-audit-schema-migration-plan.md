# Admin AI Audit Schema Migration Plan

## Objective

Map editorial pipeline artifacts into the existing `/admin/ai-audit` schema and identify required database/UI deltas before implementation.

## Existing admin concepts

- `ai_audit_runs`
- `ai_audit_items`
- `ai_audit_findings`
- `ai_change_proposals`
- `ai_review_decisions`
- `ai_audit_status_cache`

## Pipeline artifact mapping

| Pipeline artifact | Admin target |
|---|---|
| run manifest | `ai_audit_runs` |
| article diagnosis | `ai_audit_items` + status cache |
| unsupported claim | `ai_audit_findings` |
| citation gap | `ai_audit_findings` |
| source-needed item | `ai_audit_findings` |
| proposed edit | `ai_change_proposals` |
| human review decision | `ai_review_decisions` |
| validation summary | run/item metadata |

## Likely schema gaps to analyze

- prompt version fields
- source pack version/hash fields
- local artifact path fields
- input hash fields
- run manifest JSON field
- cost/runtime fields by phase
- review level field
- pipeline phase statuses beyond current MVP
- provenance of fact ledger claim IDs

## Migration planning tasks

1. Read current migration and generated types.
2. Map each artifact field to existing columns.
3. Mark field as existing, metadata JSON, or new column required.
4. Decide which data belongs in database vs local artifact only.
5. Plan RLS/permission changes for reviewer vs publisher roles.
6. Write a migration specification only after mapping is complete.

## Non-goals

- No schema changes in this planning phase.
- No browser-triggered AI execution.
- No direct content mutation from admin UI.
