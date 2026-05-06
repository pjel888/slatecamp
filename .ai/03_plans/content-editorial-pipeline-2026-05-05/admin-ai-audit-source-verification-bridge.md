# Admin AI Audit Source Verification Bridge — Phase 0.5C.1

**Created:** 2026-05-05T14:59:10Z  
**Scope:** Define how source verification outputs should appear in `/admin/ai-audit`.  
**Status:** Planning document only. Current implementation is run-level only; per-source sync is future work.

---

## 1. Purpose

`/admin/ai-audit` should become the review surface for source verification, article audit findings, question risks, and staged proposals.

It should not become the execution engine for model calls or direct publishing.

---

## 2. Current Implementation Anchor

Live repo files inspected:

| File | Current Role |
|---|---|
| `src/app/admin/ai-audit/page.tsx` | Dashboard/control center |
| `src/app/admin/ai-audit/layout.tsx` | Permission-gated layout using `admin.content.view` |
| `src/components/admin/ai-audit/AiAuditShared.tsx` | Shared UI, including `LocalContentPipelineCard` |
| `src/lib/queries/admin-ai-audit.ts` | Reads AI audit tables/views with service-role admin client |
| `scripts/content-audit/sync-run-log-to-admin-audit.ts` | Syncs local run log into `ai_audit_runs` |

Current limitation:

```txt
Existing bridge = run-level metadata only
Needed bridge = run + items + findings + proposals + decisions + evidence metadata
```

---

## 3. Safety Boundary

| Action | Browser Admin UI | Terminal Pipeline |
|---|---:|---:|
| View audit runs | Yes | N/A |
| View source verification findings | Yes | Writes/imports findings |
| Approve/reject findings | Yes | N/A |
| Create review decisions | Yes | Optional import |
| Run provider/model calls | No | Yes, when approved |
| Reconcile local files | No | Yes |
| Mutate article/question content | No | Yes, only after dry-run/apply gate |
| Apply Supabase content push | No | Yes, explicit command only |

---

## 4. Source Verification Mapping

### 4.1 Run record

`ai_audit_runs` should represent each source verification pipeline pass.

```yaml
run_type: source_verification
scope_type: vitruvius_connection
phase: tier2_source_verification
provider: manual | script | model_provider
model: null_or_model_name
status: queued | running | completed | failed | cancelled
total_items: number_of_source_bundles
completed_items: number_completed
flagged_items: number_with_findings
metadata:
  local_output_root: .ai/03_plans/content-editorial-pipeline-2026-05-05/
  manifest_hash: <hash>
  bundle_map_path: source-bundle-map.generated.csv
  no_browser_execution: true
```

### 4.2 Run items

`ai_audit_items` should represent one reviewed target.

For source bundle verification:

```yaml
target_type: source
target_id: ra9514-rirr-bfp-2019
phase: tier2_source_verification
status: needs_source_check | needs_human_review | passed | failed
source_hash: <bundle_or_primary_file_hash>
metadata:
  bundle_id: bundle-000001
  packet_id: svp-ra9514-rirr-bfp-2019-001
  local_packet_path: .ai/.../source-verification-packets/pending/...
  official_match_status: unverified
  allowed_use: DISCOVERY_ONLY
```

### 4.3 Findings

`ai_audit_findings` should record concrete source problems.

| Finding | Severity | Risk Type |
|---|---|---|
| Missing official URL | medium/high | `missing_sources` or `needs_source_check` |
| Local file differs from official source | high/critical | `source_conflict` |
| PDF absent for derived legal text | high | `weak_sources` |
| Extraction quality poor | high | `needs_source_check` |
| Locator support missing | medium/high | `unsupported_claim` or `needs_source_check` |
| Conflicting official versions | critical | `source_conflict` |
| Current-label source ID lacks evidence | high | `needs_source_check` |

### 4.4 Change proposals

`ai_change_proposals` should stage source metadata changes, not publish content.

```yaml
proposal_type: source_update
target_type: source
target_id: ra9514-rirr-bfp-2019
old_content:
  allowed_use: DISCOVERY_ONLY
proposed_content:
  allowed_use: GROUNDING_CANDIDATE
source_evidence:
  packet_id: svp-ra9514-rirr-bfp-2019-001
  official_url: https://...
  verification_status: spot_checked
metadata:
  staged_only: true
  requires_human_approval: true
```

### 4.5 Review decisions

`ai_review_decisions` should record reviewer decisions.

Recommended source-specific decisions using existing decision values:

| Source Decision | Existing Decision Value |
|---|---|
| Approve source packet | `approve` |
| Reject source packet | `reject` |
| Request more source evidence | `needs_edit` |
| Mark source reviewed, no promotion | `mark_reviewed` |
| Add note | `note` |

---

## 5. Metadata Contract

Every admin-synced source item/finding/proposal should carry enough metadata to trace back to local evidence without exposing non-admin users to local paths.

Required metadata keys:

```yaml
pipeline: content_editorial_source_verification
source_intake_root: vitruvius-connection
plan_folder: .ai/03_plans/content-editorial-pipeline-2026-05-05
bundle_id: bundle-000001
packet_id: svp-...
local_artifact_paths:
  bundle_report: source-bundle-reconciliation-report.md
  packet: source-verification-packets/pending/...
hashes:
  manifest_hash: <hash>
  primary_file_sha256: <hash>
status:
  allowed_use: DISCOVERY_ONLY
  verification_status: unverified
  official_web_match_status: unverified
safety:
  staged_only: true
  no_browser_execution: true
  no_content_mutation: true
```

---

## 6. Live Schema Warning

Planning docs currently record that live public `ai_audit_*` tables were not visible in the read-only check and that the restrictive access migration was local-only.

Therefore:

```txt
Repo code for /admin/ai-audit exists.
Live admin-audit DB readiness is not proven.
Do not claim live source-verification sync is operational until schema verification passes.
```

---

## 7. Future Implementation Tasks

When implementation is approved, the bridge should be built in this order:

1. Extend local source verification output schema.
2. Add dry-run import validator for run/items/findings/proposals JSON.
3. Add `content-audit:admin-source-log -- --dry-run`.
4. Add `content-audit:admin-source-log -- --apply` after dry-run proof.
5. Render source-target rows in `/admin/ai-audit/runs/[runId]`.
6. Add source filters to findings/proposals if needed.
7. Verify permission gates and service-role-only access.
8. Run `bun run type-check`, `bun run lint`, and `git diff --check`.

---

## 8. Gate Verdict

```txt
ADMIN_AI_AUDIT_SOURCE_BRIDGE_PLAN = READY
PER_SOURCE_ADMIN_SYNC_IMPLEMENTATION = NOT BUILT
LIVE_DB_READINESS = BLOCKED UNTIL SCHEMA VERIFIED
BROWSER_EXECUTION = NO-GO
DIRECT_CONTENT_PUBLISH_FROM_ADMIN = NO-GO
```

---

*End of Admin AI Audit Source Verification Bridge Plan.*
