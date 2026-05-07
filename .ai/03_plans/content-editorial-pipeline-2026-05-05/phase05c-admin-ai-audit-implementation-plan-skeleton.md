# Phase 0.5C Admin AI Audit Source Verification Implementation Plan Skeleton

**Generated:** 2026-05-05T15:28:29Z
**Scope:** Convert the admin-audit bridge concept into an implementation-ready plan after source verification evidence exists.
**Status:** Planning skeleton only. No code changes, database changes, or Supabase mutation are authorized by this file.

---

## 1. Purpose

The existing `/admin/ai-audit` surface can become the human review/governance surface for source verification. This skeleton defines the future implementation plan shape without starting implementation.

---

## 2. Preconditions Before Implementation

| Precondition | Required evidence |
|---|---|
| Live DB schema verified | read-only query confirms actual `ai_audit_*` tables/columns |
| Source verification evidence generated | Phase 0.5B evidence CSV/JSON exists |
| Packet schema accepted | `source-verification-packet-schema.md` accepted |
| Human decision workflow accepted | review roles/decision states defined |
| Service-role boundary accepted | terminal-only sync or approved server job runner |
| No production mutation surprise | dry-run/apply split documented |

---

## 3. Future Implementation Tasks

| Task | Purpose | Files likely affected | Validation |
|---|---|---|---|
| Schema probe script | Read-only verify `ai_audit_*` live columns | script under `scripts/content-audit/` | SQL output saved to plan folder |
| Source evidence run-log adapter | Convert official verification evidence into audit run payload | new script or extend sync script | dry-run JSON output |
| Audit item mapping | Map bundle/source IDs to `ai_audit_items` | script only first | item count matches evidence rows |
| Findings mapping | Convert conflicts/missing evidence into findings | script only first | finding counts by severity |
| Proposal mapping | Create non-mutating proposal drafts for allowed-use decisions | script only first | no source status promotion without decision |
| Admin UI read path | Display source verification runs/items when DB supports it | `src/app/admin/ai-audit/*`, components | typecheck + local route smoke |
| Decision capture | Record human review decisions | DB/API/admin UI only after approval | dry-run then apply |

---

## 4. Dry-Run / Apply Split

1. `dry-run` must emit JSON/Markdown artifacts only.
2. `apply` must be unavailable until Philip explicitly approves implementation and target DB.
3. Any live DB write must require service-role environment and be terminal-initiated unless a job runner is separately approved.
4. Browser UI must not trigger provider/model calls or local file scanning directly.

---

## 5. Acceptance Criteria for Future Implementation Plan

A full implementation plan is ready only when it includes:

1. Exact files to change.
2. DB schema evidence.
3. Dry-run command.
4. Apply command with safety confirmation.
5. Validation commands.
6. Rollback/no-op behavior.
7. Test plan.
8. Admin manual review path.

---

## 6. Current Verdict

```txt
PHASE_0_5C_IMPLEMENTATION_PLAN_SKELETON = CREATED
IMPLEMENTATION = NOT_STARTED
LIVE_ADMIN_INTEGRATION = NOT_CLAIMED
SUPABASE_MUTATION = BLOCKED
```
