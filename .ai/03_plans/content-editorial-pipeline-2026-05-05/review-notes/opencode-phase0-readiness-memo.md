I detect **investigation** intent — a Phase 0 readiness review of the content editorial pipeline across 7+ directory subtrees. My approach: parallel explore agents + direct reads to gather evidence, then synthesize into a readiness memo. No implementation.

Let me fire parallel exploration across all target directories simultaneously.
Explore agents failed (model unavailable). Switching to direct file system reads. Let me gather all evidence in parallel.
Good, directory structures are clear. Now let me read the actual route pages, lib files, and plan pack details in parallel.
Now let me read the plan pack overview and a few critical plan files, plus remaining utility files.
Let me grab a few final pieces of evidence in parallel.
I now have comprehensive evidence across all 12 categories. Here is the readiness memo.

---

# Phase 0 Readiness Memo: SlateCamp Content Editorial Pipeline

**Date:** 2026-05-05  
**Status:** Readiness assessment — no implementation performed  
**Authority:** Live repo state, not plan documents

---

## 1. Existing Article/Content Audit Capabilities

| Finding | Evidence |
|---|---|
| **Status** | **READY** |

- **`scripts/content-audit/`** — 30 files covering export, normalize, compose, diff, validate, push (library at `lib.ts`)
- **19 `package.json` commands**: `content-audit:pull`, `content-audit:export`, `content-audit:normalize`, `content-audit:inventory`, `content-audit:compose`, `content-audit:diff`, `content-audit:validate`, `content-audit:push:dry-run`, `content-audit:push:apply`, `content-audit:roundtrip`, `content-audit:push-question:*`, `content-audit:admin-log`, `content-audit:component-suggestions`, `content-audit:ui-block-edits`, `content-audit:fact-check` (guard), `content-audit:rewrite` (guard)
- **Export corpus**: `.ai/content-audit-export/articles/` with bundle structure, `runs/` with run logs, `component-inventory/` with 7 output files
- **Roundtrip safety**: compose → diff → validate → dry-run → push pattern implemented in existing scripts
- **Sync bridge**: `sync-run-log-to-admin-audit.ts` writes run records to `ai_audit_runs` table

**Risk: LOW** — Core roundtrip infrastructure exists and is operational. The 30-script toolchain covers the "code validates" layer of the plan's core doctrine.

**Recommended action**: Verify all 19 commands run cleanly on the current export corpus before Phase 2. Audit `tmp-*` files (6 of them) — these suggest active debugging that should be resolved or cleaned.

---

## 2. Existing Fact-Checking Capabilities

| Finding | Evidence |
|---|---|
| **Status** | **PARTIAL** |

- **`.ai/14_fact_checking/`** — 17 files, mostly tracking scripts (`gen_tracker_rows.sh`, `fix_tracker.py`, `process_50.sh`) and reports (`article-flagging-pass-tracker.md`, `question-flagging-report.md`)
- **`flags/`** and **`question-flags/`** directories exist with output from prior passes
- **`scripts/content-audit/ai-feature-guard.ts`** — exposes `content-audit:fact-check` and `content-audit:rewrite` commands, but appears to be a **guard/feature gate**, not a working pipeline worker
- **No evidence of**: AI-driven fact extraction, source-backing validation, structured fact ledgers, claim extraction from AI

**Risk: HIGH** — The plan envisions AI-driven claim extraction, fact ledgers, and source-backed verification (Phases 3-6). Nothing in the repo implements these. The existing `.ai/14_fact_checking/` tools are manual tracking aids, not automated pipeline stages.

**Recommended action**: Do not assume Phase 3 can start from `.ai/14_fact_checking/`. The fact-checking pipeline is entirely greenfield beyond the guard file.

---

## 3. Existing Content Optimization Capabilities

| Finding | Evidence |
|---|---|
| **Status** | **PARTIAL** |

- **`.ai/15_content_optimization/`** — 19 files, primarily **reports and readiness documents** (`go-no-go-report.md`, `final-audit-report.md`, `live-push-execution-report.md`, `release-readiness-report.md`, `final-production-closure-report.md`)
- Contains operational artifacts (`need-components.txt`, `need-learning-goals.txt`, `source-backlog-102.md`) from past content pushes
- **No evidence of**: automated optimization pipeline, pedagogy assessment, automated rewrite proposal, component recommendation engine

**Risk: MEDIUM** — The optimization directory documents past manual optimization work but contains no pipeline code. The plan's Phase 4 (AI proposal passes) and Phase 5 (local bundle application) have no pre-existing automation to build on.

**Recommended action**: Treat `.ai/15_content_optimization/` as a historical operations log, not as pipeline infrastructure. The optimization pipeline is greenfield.

---

## 4. Existing Custom Component Handling

| Finding | Evidence |
|---|---|
| **Status** | **PARTIAL** |

- **`scripts/content-audit/scan-component-inventory.ts`** — scans codebase components, maps usage in articles
- **`.ai/content-audit-export/component-inventory/`** — 7 output files: `components.json`, `component-files.json`, `component-usage-in-articles.json`, `unknown-components.json`, `component-audit-report.json`, `component-fit-notes.md`, `component-suggestions.json`
- **`suggest-component-placements.ts`** — recommends component insertions
- **`validate-ui-block-edits.ts`** — validates UI block edits
- **`wiki-component-whitelist.json`** — exists in `.ai/content-audit-export/`

**Risk: LOW-MEDIUM** — Component inventory and validation exist. However, the plan's Phase 1.5 calls for "extracting real contracts validators will enforce" — `valid component names, props, and risk notes`. The current inventory may not include prop-level validation or risk classification.

**Recommended action**: Verify that `component-inventory/components.json` covers all component names, props, and risk surfaces the plan's validators need. If not, extend `scan-component-inventory.ts`.

---

## 5. Existing Admin AI Audit Data Model and Workflow

| Finding | Evidence |
|---|---|
| **Status** | **READY** |

**Database** (migration `20260501085339`):
- 6 tables: `ai_audit_runs`, `ai_audit_items`, `ai_audit_findings`, `ai_change_proposals`, `ai_review_decisions`, `ai_audit_status_cache`
- 6 views: `ai_audit_article_overview`, `ai_audit_question_overview`, `ai_audit_design_scenario_question_overview`, `ai_audit_all_question_overview`, `ai_audit_dashboard_summary`, `ai_audit_finding_overview`
- Full RLS policies, `seed_ai_audit_status_cache()` function, indexes on all major query patterns
- P0 security remediation (`20260505145349`) — revoked direct learner access, service_role-only for views

**Admin route** (`src/app/admin/ai-audit/`):
- 8 directories: `articles/[articleId]`, `findings/[findingId]`, `proposals/`, `questions/[questionId]`, `runs/[runId]`
- Dashboard page with stat cards, severity distribution, workflow status, high-priority queue
- Permission-gated layout (`admin.content.view`)

**Server layer**:
- `src/lib/queries/admin-ai-audit.ts` (800 lines) — all paginated list queries, detail queries for articles/questions/findings/runs, dashboard aggregation
- `src/lib/actions/admin/ai-audit.ts` (645 lines) — createManualFinding, updateFindingStatus, createChangeProposal, updateProposalStatus, updateAuditTargetStatus, addReviewDecisionNote, createManualAuditRun, updateAuditRunStatus, createManualAuditRunItem
- `src/lib/admin/ai-audit-utils.ts` (275 lines) — param parsing, badge variants, status derivation, pagination
- `src/types/ai-audit.ts` (328 lines) — all const arrays and types for phases, statuses, severities, risk types, finding statuses, proposal types
- `src/components/admin/ai-audit/AiAuditShared.tsx` (614 lines) — all shared UI: header, badges, phase chips, filter forms, finding forms, proposal forms, run forms, timeline, stat cards, metric distribution

**Risk: LOW** — The admin audit surface is complete for the current MVP scope. All CRUD operations use service_role/admin client with app-level permission checks. The plan's Phase 7 (Admin AI Audit integration) can build directly on this foundation.

**Recommended action**: None needed for the admin surface itself. Integration delta is in mapping pipeline outputs to these tables (see Gap #5 below).

---

## 6. Existing Source-Grounding Support

| Finding | Evidence |
|---|---|
| **Status** | **MISSING** |

- Plan 10 (`10-source-pack-and-grounding-plan.md`) explicitly states: **"Open planning decisions: Whether source packs live under `.ai/16_source_packs/` or inside `.ai/content-audit-export/source-packs/`. Whether source chunks are committed to git or generated from primary PDFs on demand. How to handle copyrighted/non-public references."**
- No `source-packs/` directory exists anywhere in the repo
- No PDF extraction pipeline or chunking infrastructure
- `wiki_article_sources` table exists in the database but stores metadata (URL, label, description), not structured claim-to-chunk grounding
- The plan says: "Before any rewrite proposal on high/critical articles: Approved source pack exists." — this gate **cannot be met** in current state.

**Risk: CRITICAL** — Source grounding is the plan's core doctrine point #2 ("Every factual change must be explainable through the original article or approved source pack"), but zero infrastructure exists for it. Phase 0.5 and Phase 3-4 are blocked until source packs are built.

**Recommended action**: Phase 0.5 (Source Pack Readiness) must be completed before ANY AI proposal work. This is the highest-priority gap in the entire plan.

---

## 7. Existing Question-Bank Support

| Finding | Evidence |
|---|---|
| **Status** | **PARTIAL** |

- **`push-question-to-supabase.ts`** exists — can push individual questions
- **`duplicate-question-decision-note.md`** exists in both `scripts/content-audit/` and `.ai/15_content_optimization/`
- Plan 11 requires per-article: `editorial/question-validation.json`, `editorial/question-proposals.json`, `question-edits/<question_id>.json` — **none of these exist**
- Plan 11 requires corpus-level: `question-bank-risk-register.md`, `question-duplicate-ledger.json` — **do not exist**
- No `question-edits/` directory pattern in the export corpus
- The `linked-questions.json` in article bundles is export-only (plan correctly prohibits editing it)

**Risk: HIGH** — The push infrastructure exists but the proposed edit artifact layer (question-edits/, question-validation.json, question-proposals.json) does not. 7,159 questions need first-class pipeline treatment but the artifact schemas are only specified in plans.

**Recommended action**: Build question artifact schemas and validation scripts before any question AI work. The existing `push-question-to-supabase.ts` can serve as the apply end but needs the propose→validate→review chain built.

---

## 8. Existing Observability/Replay Support

| Finding | Evidence |
|---|---|
| **Status** | **PARTIAL** |

- **Run logs**: `run-content-roundtrip.ts` produces `run-log.json` files in `.ai/content-audit-export/runs/<runId>/`
- **Sync bridge**: `sync-run-log-to-admin-audit.ts` reads run logs and inserts into `ai_audit_runs`
- **Dry-run support**: `--dry-run` flag on push-candidates, push-question, sync-run-log
- Plan 15 requires: JSONL event stream, raw model output storage, structured run manifest with input hashes/prompt versions/source pack versions, replayability — **none of this exists**
- Plan 15 states: "Only validated summaries should be synced to `/admin/ai-audit`; raw model outputs should remain local" — this boundary is not yet enforced

**Risk: MEDIUM** — Basic run tracking exists. The gap between current logging (flat JSON run log) and plan requirements (JSONL streams, raw model output storage, full replay) is substantial but can be built incrementally.

**Recommended action**: Extend `run-log.json` schema to include plan-mandated fields before Phase 3. Build JSONL streaming in Phase 3 alongside AI calls.

---

## 9. Existing Failure/Recovery Support

| Finding | Evidence |
|---|---|
| **Status** | **MISSING** |

- `ai_audit_runs.status` has a `failed` value — but no retry mechanism
- `ai_audit_items.error_message` field exists — but no quarantine logic
- `sync-state.json` in `.ai/content-audit-export/` — basic state tracking
- Plan 13 (`13-failure-and-recovery-plan.md`) describes retries, quarantine, idempotency, stale failure handling — **none implemented**
- No evidence of: malformed output handling, interrupted batch resume, stale corpus detection, retry with backoff

**Risk: HIGH** — When AI is introduced into the pipeline, failures will be frequent (malformed JSON, timeouts, rate limits). The plan specifically calls for "malformed output handling" and "interrupted batch resume from manifest" — these must exist before any batch scale-up.

**Recommended action**: Implement quarantine directory, retry logic with backoff, and manifest-based resume in Phase 2 alongside validators. Do not run AI at scale without these.

---

## 10. Existing Rollback/Concurrency Support

| Finding | Evidence |
|---|---|
| **Status** | **MISSING** |

- Plan 16 (`16-roundtrip-concurrency-plan.md`) defines lock/merge/re-export collision rules — **none implemented**
- No file-level locking in content-audit scripts
- No merge conflict detection for concurrent edits to the same article bundle
- Plan 19 (`19-rollback-drill-plan.md`) defines rollback rehearsal — **not yet performed**
- Dry-run pattern exists in push scripts but this is safety, not rollback

**Risk: MEDIUM** — For single-operator use, concurrency is not urgent. For any team workflow or batch operations, lock collisions become critical. The plan explicitly includes this in Phase 8.5.

**Recommended action**: Implement before Phase 9 (batch scale-up). Not blocking for Phases 0-5.

---

## 11. Gaps Between Actual Repo State and Plan Pack

| # | Gap | Plan Reference | Severity |
|---|---|---|---|
| 1 | **Source packs do not exist** — no PDFs extracted, no chunking, no claim-to-source mapping | Phase 0.5, Plans 10, 05 | **CRITICAL** |
| 2 | **AI fact-check/rewrite is a guard, not a worker** — `ai-feature-guard.ts` gates commands but no pipeline calls AI | Phase 3, 4, Plans 05, 06 | **CRITICAL** |
| 3 | **9 artifact JSON schemas specified but none built** — editorial-diagnosis.json, fact-ledger.json, rewrite-plan.json, proposed-edits.json, fact-check-report.json, pedagogy-report.json, component-validation.json, question-validation.json, review-packet.md | Phase 1, Plan 04 | **HIGH** |
| 4 | **AI prompts exist as templates only** — `prompts/` directory has template files, not integrated prompts with version tracking, structured output schemas, or model role config | Phase 3-4, Plan 05 | **HIGH** |
| 5 | **Admin sync is runs-only** — `sync-run-log-to-admin-audit.ts` syncs run records but NOT findings, status cache updates, or per-article pipeline state | Phase 7, Plan 07, 17 | **HIGH** |
| 6 | **Question edit artifact layer missing** — no `question-edits/`, `question-validation.json`, `question-proposals.json`, `question-duplicate-ledger.json` | Phase 1, Plan 11 | **HIGH** |
| 7 | **No per-article `editorial/` directories** — plan envisions per-article editorial artifacts but export corpus has no such structure | Phase 1, Plan 04 | **MEDIUM** |
| 8 | **No pilot benchmark data** — Plan 03 requires 20-article smoke pilot + 30-35 article benchmark; no pilot has been run | Phase 8, Plan 03 | **MEDIUM** |
| 9 | **Component registry extraction is partial** — inventory exists but plan requires "valid component names, props, and risk notes" as validator inputs | Phase 1.5, Plan 06 | **MEDIUM** |
| 10 | **Live AI is deferred per README** — `NEXT_PUBLIC_PAYMENTS_ENABLED=false`, "launch stance is payment-free and live-AI-provider-free". Pipeline plan contradicts current product launch stance | README, entire plan | **CRITICAL** |

---

## 12. Hidden Risks That Could Cause Implementation Failure

| # | Risk | Impact | Evidence |
|---|---|---|---|
| R1 | **Live-AI-free launch vs. AI-dependent pipeline** — The README and AGENTS.md explicitly state the current launch is "live-AI-provider-free". The entire editorial pipeline plan depends on AI (OpenAI/Anthropic) for fact-checking, diagnosis, pedagogy assessment, and rewrite proposals. These two stances directly conflict. | **CRITICAL** — Cannot build an AI pipeline in an AI-free launch | `README.md`: "launch stance is explicitly payment-free and live-AI-provider-free"; Plan calls for AI in Phases 3-7 |
| R2 | **`ai-feature-guard.ts` may not work** — The fact-check and rewrite commands are routed through a guard file. Without verification that they function, the entire Phase 3-4 entry point is speculative. | **HIGH** — False readiness signal | `scripts/content-audit/ai-feature-guard.ts` exists but content/behavior is unverified |
| R3 | **Scale mismatch** — 567 articles × 7,159 questions is a massive corpus. Plan envisions batch processing but no cost/budget model has been validated. Plan 12 (`12-cost-budget-and-throughput-plan.md`) exists but is untested. | **HIGH** — Could exceed budget or timeline | Corpus counts: 567 articles, 7,159 questions per README |
| R4 | **Source pack copyright/accessibility** — Plan 10 notes "How to handle copyrighted/non-public references" as an open decision. PD 1096, RA 9514, BP 344, NSCP, and SPP documents may have copyright restrictions on automated extraction. | **HIGH** — Could block source grounding entirely | Plan 10 §"Open planning decisions" |
| R5 | **`tmp-*` files indicate active instability** — 6 `tmp-*.ts` files in `scripts/content-audit/` (`tmp-direct-push.ts`, `tmp-fetch.ts`, `tmp-push-debug.ts` through `tmp-push-debug4.ts`) suggest the push pipeline is being actively debugged. | **MEDIUM** — Pipeline reliability risk | File listing of `scripts/content-audit/` |
| R6 | **No admin-ai-audit tests** — The 800-line query file, 645-line action file, and 614-line component file have no visible test coverage. | **MEDIUM** — Regression risk during integration | No `*.test.ts` files found for admin-ai-audit |
| R7 | **Plan supersedes but doesn't absorb prior work** — Plan 00 archived two prior plan folders (`content-audit-editor-protocol/`, `slatecamp-ai-audit-admin-ui-docs/`) as "historical inputs." If those folders contain working code or decisions not captured in the new plan, they could be lost. | **MEDIUM** — Knowledge loss | Plan 00 §Disposition |
| R8 | **Concurrent script execution unsafe** — No locking, no merge conflict detection. If two operators run `content-audit:pull` or `content-audit:push` simultaneously against the same corpus, data corruption is possible. | **MEDIUM** — Operational risk | Absence of locking in all content-audit scripts |
| R9 | **No migration for new artifact schemas** — Plan 17 (`17-admin-ai-audit-schema-migration-plan.md`) exists but if pipeline artifacts don't map cleanly to existing `ai_audit_*` tables, a new migration will be needed mid-implementation. | **MEDIUM** — Schema drift risk | Plan 17 title implies migration but no migration file exists yet |
| R10 | **Phase dependencies are serial** — Phase 0.5 (source packs) blocks Phase 3 (AI analysis) which blocks everything. If source packs take longer than expected (they likely will), the entire pipeline timeline slips. | **HIGH** — Schedule risk | Roadmap phases 0.5 → 3 → 4 → 5 → 6 → 7 are serial |

---

## Summary Readiness Matrix

| Capability | Status | Risk | Phase Dependency |
|---|---|---|---|
| 1. Article/content audit | **READY** | LOW | Foundation for all phases |
| 2. Fact-checking | **PARTIAL** | HIGH | Blocks Phase 3-4 |
| 3. Content optimization | **PARTIAL** | MEDIUM | Blocks Phase 4-5 |
| 4. Custom component handling | **PARTIAL** | LOW-MED | Blocks Phase 1.5, 2 |
| 5. Admin AI audit data model | **READY** | LOW | Foundation for Phase 7 |
| 6. Source grounding | **MISSING** | **CRITICAL** | Blocks Phase 0.5, 3-4, 6 |
| 7. Question-bank support | **PARTIAL** | HIGH | Blocks Phase 1, 4-5 |
| 8. Observability/replay | **PARTIAL** | MEDIUM | Needed before Phase 3 |
| 9. Failure/recovery | **MISSING** | HIGH | Needed before Phase 9 |
| 10. Rollback/concurrency | **MISSING** | MEDIUM | Needed before Phase 8.5 |

**Overall assessment**: The foundation (admin audit UI, roundtrip scripts, database schema) is strong. The middle layer (source packs, AI integration, artifact schemas) is largely missing. The plan is well-specified but the repo is **not ready** for Phase 3 implementation. Phases 0.5, 1, and 1.5 are prerequisites that have no existing implementation to build on.

**Single biggest risk**: The conflict between the product's "live-AI-provider-free" launch stance and the pipeline's dependency on AI providers. Resolution of this contradiction should precede any implementation work.
