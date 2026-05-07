# Phase 0.5C Admin AI Audit Source Verification Implementation Plan

**Generated:** 2026-05-05T15:48:50Z
**Status:** Implementation-ready plan only. No code changes, database changes, migrations, or Supabase mutation authorized.
**Primary gate:** Live `ai_audit_*` tables are absent/unconfirmed in Supabase; admin source-verification sync remains blocked until schema/migration readiness is approved.

## 1. Evidence anchors inspected

| Evidence | Finding | Gate impact |
| --- | --- | --- |
| `live-readonly-source-admin-checks.md` | `information_schema.tables` query returned `[]` for public `ai_audit_*` | Live admin sync blocked |
| `live-db-schema-delta.md` | Local audit schema exists; live existence was uncertain/blocked | Must verify before apply |
| `supabase/migrations/20260501085339_create_ai_audit_admin_tables.sql` | Defines `ai_audit_runs`, `ai_audit_items`, `ai_audit_findings`, `ai_change_proposals`, `ai_review_decisions`, `ai_audit_status_cache`; includes `target_type = source` support | Local schema can model source verification |
| `supabase/migrations/20260505145349_restrict_ai_audit_admin_access.sql` | Restricts audit views/function to service role; not remote-applied per live checks | Security blocker if audit tables are later created |
| `scripts/content-audit/sync-run-log-to-admin-audit.ts` | Existing script inserts run-level `ai_audit_runs` only; defaults to dry-run unless `--apply` | New source sync should follow dry-run/apply pattern |
| `package.json` | Existing command `content-audit:admin-log` maps to run-level sync | Future source command should be explicit, separate, and dry-run-first |
| Phase 0.5B outputs | 85 evidence rows; 3 Lawphil Rank 5 statute-archive rows; 82 unresolved; all human review; all HIGH SME review | Source audit item/finding/proposal payload can be drafted locally only |

## 2. Current verdict

```txt
ADMIN_AI_AUDIT_SOURCE_SYNC_PLAN = READY_AS_PLAN
LIVE_ADMIN_AI_AUDIT_TABLES = NOT_AVAILABLE_IN_PUBLIC_SCHEMA_AS_OF_CAPTURED_CHECK
IMPLEMENTATION = BLOCKED
SUPABASE_MUTATION = BLOCKED
SOURCE_APPROVAL = BLOCKED
SOURCE_PACK_CREATION = BLOCKED
```

## 3. Implementation preconditions

Before any implementation branch or code change:

1. Confirm target environment: local-only, preview, or production Supabase.
2. Run read-only schema probe:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'ai_audit_runs',
    'ai_audit_items',
    'ai_audit_findings',
    'ai_change_proposals',
    'ai_review_decisions',
    'ai_audit_status_cache'
  )
order by table_name;
```

3. If zero rows: do not build apply-mode sync against live; decide whether to apply/create audit schema first.
4. If rows exist: verify constraints, columns, RLS, grants, and whether `20260505145349_restrict_ai_audit_admin_access.sql` or equivalent has been applied.
5. Confirm source-verification evidence schema accepted.
6. Confirm source decision workflow values: `approve`, `reject`, `needs_edit`, `mark_reviewed`, `note`.
7. Confirm browser admin UI is review-only; all ingestion/import remains terminal-only.

## 4. Proposed future file changes

No files are changed by this plan. If approved later, implement in this order:

| Step | Proposed file | Purpose | Safety |
| --- | --- | --- | --- |
| 1 | `scripts/content-audit/validate-admin-ai-audit-schema.ts` | Read-only schema/grant/RLS probe for `ai_audit_*` tables | No writes |
| 2 | `scripts/content-audit/build-source-verification-admin-payload.ts` | Convert Phase 0.5B CSV/JSONL into dry-run payload JSON only | No DB access |
| 3 | `scripts/content-audit/sync-source-verification-to-admin-audit.ts` | Terminal-only dry-run/apply import to `ai_audit_runs/items/findings/proposals` | Defaults dry-run; apply explicit |
| 4 | `package.json` | Add `content-audit:admin-source-log` command | Command is explicit and dry-run-first by default |
| 5 | `src/lib/queries/admin-ai-audit.ts` | Only if live schema exists: support source target filters/details | Read path only first |
| 6 | `src/app/admin/ai-audit/runs/[runId]/page.tsx` | Only if needed: display source-specific metadata in existing run detail page | Display-only |
| 7 | Tests/docs | Add schema/payload validators and docs | No mutation |

## 5. Source verification to admin audit mapping

### 5.1 Run payload

```json
{
  "run_type": "source_verification",
  "scope_type": "vitruvius_connection",
  "phase": "tier2_source_verification",
  "provider": "manual_script",
  "model": null,
  "status": "completed",
  "total_items": 85,
  "completed_items": 85,
  "flagged_items": 85,
  "notes": "Phase 0.5B evidence-only source verification import. No source approval.",
  "metadata": {
    "created_from": "content_editorial_phase05b",
    "plan_folder": ".ai/03_plans/content-editorial-pipeline-2026-05-05",
    "no_ai_job_started": true,
    "no_content_mutation": true,
    "no_source_approval": true,
    "official_issuing_body_positive_rows": 0,
    "rank5_statute_archive_rows": 3,
    "official_source_not_found_rows": 82,
    "human_review_rows": 85,
    "sme_review_rows": 45
  }
}
```

### 5.2 Item payload rules

One `ai_audit_items` row per Phase 0.5B evidence row.

| Evidence row state | `ai_audit_items.status` | Rationale |
| --- | --- | --- |
| `OFFICIAL_SOURCE_NOT_FOUND` | `needs_source_check` | External official source not located in runtime |
| `NEEDS_HUMAN_VERIFICATION` + `statute_archive_rank5` | `needs_human_review` | Lawphil Rank 5 archive evidence requires human/SME review |
| `CONFLICT_FOUND` | `flagged` or `needs_human_review` | Conflict requires reviewer decision |

Required item metadata:

```json
{
  "bundle_id": "bundle-000017",
  "source_file_ids": [123, 124],
  "allowed_use": "DISCOVERY_ONLY",
  "verification_status": "unverified",
  "evidence_status": "NEEDS_HUMAN_VERIFICATION",
  "candidate_source_type": "statute_archive_rank5",
  "authority_rank": 5,
  "candidate_url": "https://lawphil.net/...",
  "source_pack_creation_blocked": true,
  "article_rewrite_blocked": true,
  "question_edit_blocked": true
}
```

### 5.3 Finding payload rules

| Phase 0.5B status | Finding severity | `risk_type` | Finding summary |
| --- | --- | --- | --- |
| `OFFICIAL_SOURCE_NOT_FOUND` on HIGH row | `high` | `needs_source_check` | Official source not found for high-risk source bundle in runtime |
| `OFFICIAL_SOURCE_NOT_FOUND` on MEDIUM/LOW row | `medium` | `needs_source_check` | Official source not found in runtime |
| `NEEDS_HUMAN_VERIFICATION` + Rank 5 Lawphil | `high` | `weak_sources` | Only Rank 5 statute-archive evidence found; preferred official confirmation unresolved |
| `CONFLICT_FOUND` | `critical` | `source_conflict` | Conflicting source evidence requires SME review |

All findings remain `status = open` unless imported as a human decision record later.

### 5.4 Proposal payload rules

Do not create promotion proposals automatically for Phase 0.5B.

Allowed proposal types in a future dry-run payload:

| Proposal | Allowed? | Reason |
| --- | --- | --- |
| `source_update` from `DISCOVERY_ONLY` to `GROUNDING_CANDIDATE` | No, unless a packet is approved | Would imply source promotion |
| `status_only` to mark `needs_human_review` | Yes, dry-run only | Review routing only |
| `other` / note-only packet reference | Yes, dry-run only | Traceability only |

## 6. Dry-run contract

Future command shape:

```bash
bun scripts/content-audit/build-source-verification-admin-payload.ts \
  --input .ai/03_plans/content-editorial-pipeline-2026-05-05/phase05b-live-verification-results.generated.csv \
  --output .ai/03_plans/content-editorial-pipeline-2026-05-05/admin-ai-audit-source-payload.dry-run.json
```

Expected local output:

- `admin-ai-audit-source-payload.dry-run.json`
- `admin-ai-audit-source-payload-validation.md`

Dry-run validation must prove:

- Row count equals evidence row count.
- No item/proposal uses `approved`, `published`, or `applied` status.
- No proposal promotes `allowed_use` beyond `DISCOVERY_ONLY` unless an approved packet ID exists.
- All HIGH rows route to SME/admin review.
- Lawphil rows are `statute_archive_rank5`, not official confirmation.

## 7. Apply-mode contract

Future apply command shape, only after explicit approval:

```bash
bun scripts/content-audit/sync-source-verification-to-admin-audit.ts \
  --input .ai/03_plans/content-editorial-pipeline-2026-05-05/admin-ai-audit-source-payload.dry-run.json \
  --apply
```

Apply-mode blockers:

- Missing service-role environment variables.
- Missing live `ai_audit_*` tables.
- Missing/unsafe RLS or grants.
- Any proposal that changes article/question content.
- Any row that promotes a source without approved verification packet.
- Any official-source row whose evidence is only search snippet text.

## 8. Admin UI contract

The browser admin UI may:

- Display source verification runs.
- Display source audit items.
- Display findings and packet links/metadata.
- Record human decisions if DB/API is approved.

The browser admin UI must not:

- Scan `vitruvius-connection/`.
- Run model/provider calls.
- Fetch external official websites directly as part of source approval.
- Mutate articles/questions.
- Promote `allowed_use` without terminal-imported approved packet evidence.

## 9. Validation matrix for future implementation

| Layer | Validation |
| --- | --- |
| Schema probe | Read-only query shows required tables/columns/constraints/grants |
| Payload builder | Unit/fixture test with Phase 0.5B CSV |
| Sync dry-run | JSON output only, no DB client insert/update calls executed |
| Sync apply | Requires explicit `--apply` and service-role env; inserts only admin audit rows |
| Admin read path | `bun run type-check`; targeted route smoke if UI changed |
| Security | Confirm restrictive migration or equivalent grants/RLS applied |
| Gate language | Generated reports state no source approval and no source-pack creation |

## 10. Open decisions

| Decision | Owner | Required before |
| --- | --- | --- |
| Whether to create/apply `ai_audit_*` tables live | Philip / DB owner | Any admin source sync apply |
| Whether to apply audit restriction migration live | Philip / DB owner | Any live admin audit exposure |
| Whether source verification decisions belong in `ai_review_decisions` with `target_type = other` or require source-specific extension | Philip / architecture reviewer | Decision capture implementation |
| Whether Rank 5 Lawphil evidence should show in admin as “weak_sources” or “needs_source_check” | SME/admin reviewer | Finding mapping finalization |

## 11. Phase 0.5C gate verdict

```txt
PHASE_0_5C_IMPLEMENTATION_DETAIL_PLAN = COMPLETE_AS_PLAN
ADMIN_SOURCE_PAYLOAD_SCHEMA = READY_AS_DRAFT
ADMIN_SOURCE_SYNC_IMPLEMENTATION = NOT_STARTED
LIVE_SCHEMA_APPLY = BLOCKED
SUPABASE_MUTATION = BLOCKED
```
