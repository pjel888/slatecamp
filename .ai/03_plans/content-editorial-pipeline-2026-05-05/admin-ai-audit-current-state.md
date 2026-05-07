# Admin AI Audit — Current State

**Generated:** 2026-05-05 | **Phase:** 1A Read-Only Evidence Pass
**Scope:** `src/app/admin/ai-audit/` subtree and associated actions, queries, components, types, and database migrations
**Method:** Read-only code inspection of all route files, query/action files, type files, component files, and migration SQL

---

## 1. Route Surface

### 1.1 Route Map

| Route | File | Purpose | Dynamic Params | Loading State |
|---|---|---|---|---|
| `/admin/ai-audit` | `page.tsx` | Dashboard / control center | No | Yes (`loading.tsx`) |
| `/admin/ai-audit/articles` | `articles/page.tsx` | Article audit listing (paginated, filterable) | No | Yes |
| `/admin/ai-audit/articles/[articleId]` | `articles/[articleId]/page.tsx` | Article detail view (content, sources, questions, findings, proposals, items, decisions) | Yes | Yes |
| `/admin/ai-audit/questions` | `questions/page.tsx` | Question audit listing (paginated, filterable) | No | Yes |
| `/admin/ai-audit/questions/[questionId]` | `questions/[questionId]/page.tsx` | Question detail view | Yes | Yes |
| `/admin/ai-audit/findings` | `findings/page.tsx` | Finding log listing (paginated, filterable) | No | Yes |
| `/admin/ai-audit/findings/[findingId]` | `findings/[findingId]/page.tsx` | Finding detail view (with linked target, proposals, decisions) | Yes | Yes |
| `/admin/ai-audit/runs` | `runs/page.tsx` | Audit run listing (paginated) | No | Yes |
| `/admin/ai-audit/runs/[runId]` | `runs/[runId]/page.tsx` | Run detail view (with items, findings, proposals, decisions) | Yes | Yes |
| `/admin/ai-audit/proposals` | `proposals/page.tsx` | Change proposal listing (paginated, filterable) | No | Yes |

**10 page routes** + **1 layout** + **11 loading states** across `/admin/ai-audit/`.

### 1.2 Layout and Access Control

- **Layout** (`layout.tsx`): Wraps all pages with `requirePermissionOrRedirect('admin.content.view')` and a shared `AiAuditPageHeader` component.
- **Permission gating**: Every query function calls `requireAiAuditRead()` which asserts `admin.content.view`. Every mutation action asserts `admin.content.view` or `admin.content.approve` (for proposal approval).
- **No RLS bypass detected**: All DB access goes through `createAdminClient()` (service-role Supabase client), with application-level permission checks.

---

## 2. Component Surface

### 2.1 Shared UI Components

All from `@/components/admin/ai-audit/AiAuditShared`:

| Component | Purpose |
|---|---|
| `AiAuditPageHeader` | Page header with breadcrumb navigation |
| `StatCard` | Metric card (label, value, description, tone) |
| `MetricDistribution` | Status/severity distribution bar chart |
| `AuditEmptyState` | Empty state when no audit data exists |
| `AuditSeverityBadge` | Colored severity badge (low/medium/high/critical) |
| `AuditStatusBadge` | Colored status badge |
| `LocalContentPipelineCard` | Card summarizing local pipeline context (compact mode used on dashboard) |

### 2.2 Utility Functions

From `@/lib/admin/ai-audit-utils`:

- `labelFromValue(value)` — converts enum constants to display labels
- `deriveAiAuditStatusPatch(...)` — computes status cache patch from findings/proposals state
- `pickHighestSeverity(severities)` — picks highest severity from array
- `AiAuditListParams` — unified filter/pagination params interface

---

## 3. Data Access Layer

### 3.1 Queries (`src/lib/queries/admin-ai-audit.ts`)

All queries use `createAdminClient()` (service-role). All require `admin.content.view`.

| Function | Returns | Source Tables/Views | Filters Supported |
|---|---|---|---|
| `getAiAuditDashboardData()` | Summary + recent findings/runs/proposals/high-priority findings | `ai_audit_dashboard_summary` (view), `ai_audit_finding_overview` (view), `ai_audit_runs`, `ai_change_proposals` | None (aggregate) |
| `getAiAuditArticleRows(params)` | Paginated `AiAuditArticleOverview[]` | `ai_audit_article_overview` (view) | status, phase, severity, subject, needsHumanReview, needsSourceCheck, needsCorrection, neverAudited, lastAuditedSince, missingSources, hasOpenFindings, q (text search on title/slug/content_preview) |
| `getAiAuditQuestionRows(params)` | Paginated `AiAuditQuestionOverview[]` | `ai_audit_all_question_overview` (view) | status, phase, severity, riskType, targetType, articleId, needsHumanReview, needsSourceCheck, needsCorrection, neverAudited, lastAuditedSince, hasOpenFindings, missingArticle, missingAnswerKey, q |
| `getAiAuditFindingRows(params)` | Paginated `AiAuditFindingRow[]` | `ai_audit_finding_overview` (view) | status, severity, riskType, targetType, q |
| `getAiAuditRunRows(params)` | Paginated `AiAuditRunRow[]` | `ai_audit_runs` | status, phase, q |
| `getAiAuditProposalRows(params)` | Paginated `AiChangeProposalRow[]` | `ai_change_proposals` | status, targetType, q |
| `getAiAuditArticleDetail(articleId)` | Article + sources + questions + status cache + findings + proposals + items + decisions | `wiki_articles`, `wiki_article_sources`, `questions`, `ai_audit_status_cache`, `ai_audit_finding_overview`, `ai_change_proposals`, `ai_audit_items`, `ai_review_decisions` | None (detail) |
| `getAiAuditQuestionDetail(questionId)` | Question + article + status + findings + proposals + items + decisions | `questions`, `design_scenario_questions`, `wiki_articles`, `ai_audit_status_cache`, `ai_audit_finding_overview`, `ai_change_proposals`, `ai_audit_items`, `ai_review_decisions` | None (detail) |
| `getAiAuditFindingDetail(findingId)` | Finding + status + target + run + item + proposals + decisions | `ai_audit_finding_overview`, `ai_audit_status_cache`, `wiki_articles`, `questions`, `design_scenario_questions`, `ai_audit_runs`, `ai_audit_items`, `ai_change_proposals`, `ai_review_decisions` | None (detail) |
| `getAiAuditRunDetail(runId)` | Run + items + findings + proposals + decisions | `ai_audit_runs`, `ai_audit_items`, `ai_audit_finding_overview`, `ai_change_proposals`, `ai_review_decisions` | None (detail) |

### 3.2 Mutating Actions (`src/lib/actions/admin/ai-audit.ts`)

All actions are Server Actions (`"use server"`). All assert permissions, create audit trail via `ai_review_decisions`, refresh status cache, and revalidate paths.

| Action | Permission Required | Mutates Tables | Effect |
|---|---|---|---|
| `createManualFinding(formData)` | `admin.content.view` | `ai_audit_findings` (INSERT), `ai_review_decisions` (INSERT), `ai_audit_status_cache` (UPSERT) | Creates a manual finding with provider='manual', linked review decision, refreshes target status cache |
| `updateFindingStatus(formData)` | `admin.content.view` | `ai_audit_findings` (UPDATE status + resolved_at), `ai_review_decisions` (INSERT), `ai_audit_status_cache` (UPSERT) | Transitions finding status (open→confirmed/rejected/resolved/reopened), refreshes status cache |
| `createChangeProposal(formData)` | `admin.content.view` | `ai_change_proposals` (INSERT), `ai_review_decisions` (INSERT), `ai_audit_status_cache` (UPSERT) | Stages a proposal (article_edit, question_edit, answer_key_change, source_update, retire_question, status_only, other). Does NOT apply to live content. |
| `updateProposalStatus(formData)` | `admin.content.approve` for approved; `admin.content.view` for others | `ai_change_proposals` (UPDATE status + reviewed_by + reviewed_at), `ai_review_decisions` (INSERT), `ai_audit_status_cache` (UPSERT) | Approves/rejects/needs_edit a staged proposal. Sets `staged_only: true` — does NOT apply to live content. |
| `updateAuditTargetStatus(formData)` | `admin.content.view` | `ai_audit_status_cache` (UPSERT), `ai_review_decisions` (INSERT) | Overrides phase/status on a target. Has `overrideOpenFindings` gate — if open findings exist and override not authorized, forces `needs_human_review`. |
| `addReviewDecisionNote(formData)` | `admin.content.view` | `ai_review_decisions` (INSERT) | Adds a note-only review decision for any target type. |
| `createManualAuditRun(formData)` | `admin.content.view` | `ai_audit_runs` (INSERT), `ai_review_decisions` (INSERT) | Creates a manual run record with `no_ai_job_started: true` in metadata. |
| `updateAuditRunStatus(formData)` | `admin.content.view` | `ai_audit_runs` (UPDATE), `ai_review_decisions` (INSERT) | Updates run status (queued/running/completed/failed/cancelled). |
| `createManualAuditRunItem(formData)` | `admin.content.view` | `ai_audit_items` (INSERT), `ai_audit_status_cache` (UPSERT), `ai_review_decisions` (INSERT) | Creates a run item + refreshes status cache with `no_ai_job_started: true`. |

**Critical safety observation:** All `createChangeProposal` and `updateProposalStatus` actions set `staged_only: true` in review decision metadata. The admin UI does NOT apply proposals to live `wiki_articles.content` or `questions` tables. Content mutation is explicitly gated behind the `content-audit:push:apply` terminal command (push-candidates-to-supabase.ts), NOT browser actions.

---

## 4. Database Tables

### 4.1 Core AI Audit Tables

Created by migration `20260501085339_create_ai_audit_admin_tables.sql`:

| Table | Purpose | Key Fields |
|---|---|---|
| `ai_audit_runs` | Execution run records | id, run_type, scope_type, phase, provider, model, prompt_version, status (queued/running/completed/failed/cancelled), total_items, completed_items, flagged_items, cost_estimate_usd, started_by, started_at, completed_at, notes, metadata (JSONB) |
| `ai_audit_items` | Per-target items within a run | id, run_id, target_type (wiki_article/question/design_scenario_question/source/other), target_id, article_id, question_id, phase, status, content_hash, source_hash, question_hash, started_at, completed_at, error_message, metadata (JSONB) |
| `ai_audit_findings` | Audit findings on targets | id, run_id, audit_item_id, target_type, target_id, article_id, question_id, severity (low/medium/high/critical), status (open/confirmed/rejected/resolved/superseded/reopened), risk_type (30 types defined), finding_summary, suspect_text, ai_rationale_summary, recommended_next_step, confidence, provider, model, prompt_version, raw_output (JSONB), created_by, created_at, resolved_at, metadata (JSONB) |
| `ai_change_proposals` | Staged content change proposals | id, finding_id, run_id, target_type, target_id, article_id, question_id, proposal_type (article_edit/question_edit/answer_key_change/source_update/retire_question/status_only/other), old_content (JSONB), proposed_content (JSONB), diff_summary, why_changed, source_evidence (JSONB), status (pending/approved/rejected/needs_edit/applied/superseded), provider, model, prompt_version, created_by, reviewed_by, created_at, reviewed_at, applied_at, metadata (JSONB) |
| `ai_review_decisions` | Immutable review decision audit trail | id, reviewer_id, target_type, target_id, decision (12 types: approve/reject/confirm/resolve/reopen/mark_reviewed/mark_needs_review/edit/retire/note/status_update/needs_edit), decision_notes, previous_status, new_status, created_at, metadata (JSONB) |
| `ai_audit_status_cache` | Materialized per-target status summary | id, target_type, target_id, article_id, question_id, latest_run_id, latest_phase, latest_status, highest_severity, findings_count, open_findings_count, needs_source_check, needs_correction, needs_human_review, last_audited_at, content_hash, updated_at, metadata (JSONB). Unique constraint on (target_type, target_id). |

### 4.2 Views (Database Views)

Referenced in queries but implementation is in migration SQL (lines 300+ of migration file):

| View | Purpose | Used By |
|---|---|---|
| `ai_audit_dashboard_summary` | Aggregated dashboard metrics | `getAiAuditDashboardData()` |
| `ai_audit_article_overview` | Joined article + status cache view | `getAiAuditArticleRows()` |
| `ai_audit_finding_overview` | Finding view with joined target labels/snippets | `getAiAuditFindingRows()`, dashboard, detail pages |
| `ai_audit_all_question_overview` | Joined question + status cache view | `getAiAuditQuestionRows()` |

### 4.3 Upstream Tables Referenced

These are READ from (never written by ai-audit actions):

| Table | How Read | Purpose |
|---|---|---|
| `wiki_articles` | Article detail queries | Article content, title, slug, status for audit context |
| `wiki_article_sources` | Article detail query | Source metadata display in audit UI |
| `questions` | Article/question detail queries | Question text, options, correct answer for audit context |
| `design_scenario_questions` | Question detail query (fallback) | Design scenario question data |
| `auth.users` | Foreign key references | `started_by`, `created_by`, `reviewer_id` foreign keys |

### 4.4 Access Control Migration

`20260505145349_restrict_ai_audit_admin_access.sql` — reviewed 2026-05-05. It revokes direct `authenticated` access to staff-only AI audit overview views and to `seed_ai_audit_status_cache()`, then grants those view/function privileges to `service_role` only. The comments explicitly state that ordinary learner PostgREST/RPC access should fail closed and that admin pages should use service-role access after application-level admin permission checks.

Affected views/functions:

- `ai_audit_article_overview`
- `ai_audit_question_overview`
- `ai_audit_design_scenario_question_overview`
- `ai_audit_all_question_overview`
- `ai_audit_dashboard_summary`
- `ai_audit_finding_overview`
- `seed_ai_audit_status_cache()`

This supports the current safety posture: server-side admin surfaces can read staff-only audit data; ordinary authenticated learners should not be able to select those views directly.

---

## 5. Workflow States

### 5.1 Target Statuses (per ai_audit_status_cache / ai_audit_items)

```
not_checked → queued → running → passed | flagged → needs_source_check → likely_wrong → confirmed_wrong → correction_proposed → validated → needs_human_review → approved → published | rejected | skipped | failed
```

### 5.2 Audit Phases

```
not_started → tier0_static_check → tier1_ai_flag_scan → tier2_source_verification → tier3_correction_proposal → tier4_validation → human_review → approved → published
```

### 5.3 Finding Statuses

```
open → confirmed | rejected | resolved | superseded | reopened
```

### 5.4 Change Proposal Statuses

```
pending → approved | rejected | needs_edit | applied | superseded
```

### 5.5 Review Decisions (12 types)

`approve`, `reject`, `confirm`, `resolve`, `reopen`, `mark_reviewed`, `mark_needs_review`, `edit`, `retire`, `note`, `status_update`, `needs_edit`

---

## 6. Risk Types (30 Defined)

| Category | Risk Types |
|---|---|
| Source/grounding | `unsupported_claim`, `contradicted_claim`, `outdated_requirement`, `source_conflict`, `missing_sources`, `weak_sources`, `needs_source_check` |
| Accuracy | `incorrect_definition`, `incorrect_date`, `incorrect_person_or_attribution`, `incorrect_code_requirement`, `incorrect_legal_requirement`, `incorrect_history`, `ambiguous_statement`, `unclear_wording` |
| Question-specific | `answer_key_mismatch`, `multiple_correct_answers`, `no_valid_answer`, `stem_inaccurate`, `option_inaccurate`, `rationale_inaccurate`, `article_question_conflict`, `unsupported_question`, `missing_answer_key`, `missing_options`, `missing_rationale` |
| Workflow | `needs_human_review`, `needs_correction`, `blocked_by_missing_context`, `other` |

---

## 7. Filters and Search

### 7.1 Article Filters (dashboard listing)

- **Status**: latest_status (eq)
- **Phase**: latest_phase (eq)
- **Severity**: highest_severity (eq)
- **Subject**: subject_label (eq)
- **Boolean flags**: needsHumanReview, needsSourceCheck, needsCorrection
- **Audit timing**: neverAudited (is null last_audited_at), lastAuditedSince (gte)
- **Source coverage**: missingSources (source_count = 0)
- **Open findings**: hasOpenFindings (open_findings_count > 0)
- **Text search**: q (ILIKE on title, slug, content_preview)

### 7.2 Question Filters

- Status, Phase, Severity, RiskType, TargetType, ArticleId
- Boolean flags: needsHumanReview, needsSourceCheck, needsCorrection
- Audit timing: neverAudited, lastAuditedSince
- Open findings: hasOpenFindings
- Missing article: missingArticle (article_id IS NULL)
- Missing answer key: missingAnswerKey (correct_option_id IS NULL OR empty)
- Text search: q (ILIKE on text, article_title, topic_name)

### 7.3 Finding Filters

- Status, Severity, RiskType, TargetType
- Text search: q (ILIKE on finding_summary, suspect_text, recommended_next_step)

### 7.4 Run Filters

- Status, Phase
- Text search: q (ILIKE on run_type, scope_type, provider, notes)

### 7.5 Proposal Filters

- Status, TargetType
- Text search: q (ILIKE on diff_summary, why_changed)

---

## 8. Preview Behavior

- **No live preview rendering**: The article detail page reads `wiki_articles.content` for display but does not render it through the wiki rendering pipeline.
- **Change proposals contain old_content / proposed_content as JSONB**: These are stored as structured diffs but NOT rendered as previews. They are displayed as JSON text or diff summaries.
- **No side-by-side preview**: No visual "before/after" rendering exists in the admin UI.

---

## 9. Reviewer Actions

All reviewer actions are logged to `ai_review_decisions` as immutable audit trail entries:

| Action | Decision Recorded | Permission |
|---|---|---|
| Create manual finding | `note` | `admin.content.view` |
| Update finding status | `confirm` / `reject` / `resolve` / `reopen` / `status_update` | `admin.content.view` |
| Create change proposal | `note` (staged_only) | `admin.content.view` |
| Approve/reject proposal | `approve` / `reject` / `needs_edit` | `admin.content.approve` for approve; `admin.content.view` for others |
| Override target status | `approve` / `mark_needs_review` / `mark_reviewed` / `status_update` | `admin.content.view` |
| Add note | `note` | `admin.content.view` |

**Status cache refresh**: Every mutation triggers `refreshTargetStatusCache()` which recomputes `ai_audit_status_cache` from current findings + proposals state. The cache gate prevents approving targets with unresolved open findings unless explicitly overridden.

---

## 10. Replay / Audit Traceability

### 10.1 What is Traceable

- **Every finding** records: provider, model, prompt_version, created_by, created_at, resolved_at
- **Every proposal** records: provider, model, prompt_version, created_by, reviewed_by, created_at, reviewed_at, applied_at
- **Every run** records: provider, model, prompt_version, started_by, started_at, completed_at
- **Every review decision** is immutable with: reviewer_id, decision, previous_status, new_status, created_at
- **Status cache** tracks: latest_phase, latest_status, last_audited_at, content_hash

### 10.2 What is NOT Traceable (Gaps)

- **No prompt version registry**: `prompt_version` is a free-text field. No enforced semver or registry.
- **No source pack version**: Source pack identity (version, hash) is not recorded on findings or proposals.
- **No model role config hash**: No field captures which AI role configuration was used.
- **No raw model output hash**: `raw_output` exists as JSONB on findings but is not hash-verified.
- **No local artifact path**: No field links findings/proposals to local `editorial-diagnosis.json` or `fact-ledger.json` paths.
- **No input hashes**: `ai_audit_items` has `content_hash`, `source_hash`, `question_hash` but findings lack input provenance hashes.
- **Run metadata is free-form JSONB**: No enforced schema for run-level provenance fields.

### 10.3 Replay Assessment

**Partial.** The audit trail records who did what when, but cannot reconstruct the exact AI pipeline state that produced a finding. For replay-grade traceability, prompt version, source pack version, model role config hash, and input hashes must be mandatory on every AI-generated finding.

---

## 11. AI-Related Code Paths

### 11.1 Current State

- **No AI provider calls from admin UI detected in action code**: Admin actions create manual records with `provider: 'manual'`, `model: null`, and `prompt_version: null`.
- **No browser-triggered AI execution detected**: Actions are CRUD against audit tables only.
- **Run records created by current manual code path flag**: `no_ai_job_started: true` in metadata.
- **AI fields exist but are human-populated in the inspected action paths**: `ai_rationale_summary`, `recommended_next_step`, `confidence` on findings are entered by humans via the admin UI.
- **Unverified DB-row caveat**: This inventory did not query live `ai_audit_*` row contents. Therefore it cannot prove that all existing rows in the database are manual or that tables are empty/clean; it only documents the current application code paths.

### 11.2 Disabled Pipeline Commands

- `content-audit:fact-check` → `scripts/content-audit/ai-feature-guard.ts` (exits with code 2, prints intentional disable message)
- `content-audit:rewrite` → `scripts/content-audit/ai-feature-guard.ts` (same)
- All AI provider calls are gated behind `NEXT_PUBLIC_PAYMENTS_ENABLED=false` and the live-AI-free launch stance.

---

## 12. Adjacency Assessment

### 12.1 What the Current Admin Surface Provides

The `/admin/ai-audit` surface is an **MVP admin foundation** that provides:

- ✅ **Dashboard visibility**: Summary metrics for article/question audit state
- ✅ **Target listing and filtering**: Articles, questions with status/severity/phase filters
- ✅ **Finding management**: Create, update status, link to targets
- ✅ **Change proposal staging**: Create, approve/reject staged proposals
- ✅ **Review decision audit trail**: Immutable per-decision records
- ✅ **Run tracking**: Manual run records with item tracking
- ✅ **Status cache**: Auto-refreshing per-target audit state
- ✅ **Detail views**: Deep-linked findings, proposals, items, decisions per target
- ✅ **RLS + application-level permissions**: `admin.content.view` and `admin.content.approve`
- ✅ **Pagination + search + boolean filters**: Functional admin listing UX

### 12.2 What the Current Admin Surface Does NOT Provide

The surface is **adjacent infrastructure only** — it does NOT support a live editorial pipeline:

- ❌ **No AI execution**: No provider calls, no model integration, no prompt execution
- ❌ **No content mutation**: Proposals are staged only; no apply-to-live-content action
- ❌ **No source pack integration**: Source evidence is free-text, not linked to source packs
- ❌ **No local artifact linking**: No paths to local `editorial-diagnosis.json`, `fact-ledger.json`, `diff-report.json`
- ❌ **No replay-grade provenance**: Missing prompt version registry, source pack version, input hashes
- ❌ **No review queue**: No dedicated reviewer queue view, SLA tracking, or escalation
- ❌ **No batch operations**: All actions are single-target
- ❌ **No preview rendering**: No side-by-side before/after content preview
- ❌ **No question-bank-specific workflow**: Questions are treated same as articles
- ❌ **No rollback support**: No undo/rollback for applied changes

### 12.3 Verdict

**Audit-state workflow foundation in repo, conditional on live schema verification.** The current `/admin/ai-audit` surface can mutate rich audit/review tables (`ai_audit_findings`, `ai_change_proposals`, `ai_review_decisions`, `ai_audit_runs`, `ai_audit_items`, and `ai_audit_status_cache`) through server actions after admin permission checks. It does **not** mutate `wiki_articles.content` or `questions` and does not apply staged proposals to live content. However, live Supabase evidence from 2026-05-05 did not show obvious public `ai_audit_*` tables and did not show `20260505145349_restrict_ai_audit_admin_access.sql` as applied. Therefore this document maps repo-local/planned/admin code state; it is not proof that the live Supabase admin audit schema is ready. The editorial pipeline must still be built separately (terminal scripts, validators, AI workers, source pack system), and the admin surface will need integration work (local artifact links, source pack version fields, replay provenance, reviewer queue, preview rendering, rollback support) before it can serve as a complete editorial pipeline console.

### 12.4 Permission-Scope Nuances

- `updateProposalStatus(approved)` requires `admin.content.approve`.
- Several audit-state mutations require only `admin.content.view`, including manual findings, finding status updates, notes, and target-status overrides.
- This is not automatically unsafe because these actions do not apply article/question edits, but Phase 7 integration must not assume every audit-state mutation is gated by `admin.content.approve`.
- Browser/admin approval should remain distinct from terminal-side content push until a deliberate architecture decision says otherwise.

---

## 13. Integration Bridge

The existing sync bridge is `scripts/content-audit/sync-run-log-to-admin-audit.ts`:

- **Reads**: Local `run-log.json` from content-audit-export/runs/
- **Writes**: `ai_audit_runs` (INSERT only)
- **Risk**: MEDIUM (writes only to ai_audit_runs, errors are non-fatal)
- **What it syncs**: Run-level metadata (run type, scope, status, counts, notes)
- **What it does NOT sync**: Findings, proposals, status cache, items, review decisions

For a complete pipeline integration, the sync bridge would need to be extended to ingest findings, proposals, and status cache updates from local pipeline artifacts.

---

## 14. Summary for Phase 1A

| Question | Answer |
|---|---|
| Does the admin surface exist? | Yes, 10 routes + full CRUD for audit entities |
| Is it wired to AI? | No AI provider calls detected in current application actions; live DB rows were not queried. |
| Does it mutate content? | No `wiki_articles.content` or `questions` mutation from admin UI; yes, it mutates audit/review tables. |
| Does it have workflow states? | Yes — phases, statuses, severities, finding statuses, proposal statuses, review decisions |
| Does it support filters? | Yes — rich filter set on articles, questions, findings, runs, proposals |
| Does it support replay? | Partial — audit trail exists but lacks prompt/source/model provenance |
| Does it support the editorial pipeline? | **No — it is adjacent infrastructure.** Pipeline must be built separately and integrated. |
| What's the biggest gap? | Source pack integration, replay provenance, local artifact linking, reviewer queue, preview rendering |
| Is it safe for Phase 1A? | Yes — read-only. Safe to inspect and document. |
