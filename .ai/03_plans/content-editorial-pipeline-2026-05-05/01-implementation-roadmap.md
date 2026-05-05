# Implementation Roadmap

## Goal

Implement a comprehensive, source-grounded editorial pipeline for 500+ SlateCamp articles and 7,000+ questions without bypassing the existing roundtrip safety model.

## Phase 0 — State audit and readiness

**Objective:** Determine what already exists, what is stale, and what needs to be built.

**Tasks:**
1. Inventory `scripts/content-audit/` commands and map them to pipeline phases.
2. Inventory `.ai/content-audit-export/articles/` artifact structure.
3. Check the current status of `.ai/14_fact_checking/` and `.ai/15_content_optimization/` state documents.
4. Reconcile contradictions using actual files, not reports alone.
5. Confirm `/admin/ai-audit` route and database tables are live.
6. Produce `readiness-report.md` inside this plan folder.

**Exit gate:** Written readiness report with build/no-build recommendations per subsystem.

## Phase 0.5 — Source pack readiness

**Objective:** Make source grounding real before AI rewriting is designed.

**Tasks:**
1. Inventory primary PDFs and structured source rows.
2. Define source pack schema and versioning.
3. Decide where generated source chunks live.
4. Identify high/critical articles blocked by missing source packs.
5. Define source excerpt limits for provider prompts.

**Exit gate:** Source-pack readiness report and source hierarchy accepted for the pilot.

## Phase 1A — Read-only inventory and reconciliation

**Objective:** Answer what exists before designing schemas or workers.

**Rules:**
- No production implementation.
- No content mutation.
- No Supabase mutation.
- No article rewriting.
- No answer-key changes.
- No admin schema migration.

**Planning outputs:**
- `current-script-map.md`
- `current-artifact-map.md`
- `admin-ai-audit-current-state.md`
- `state-doc-contradictions.md`
- `pilot-candidate-shortlist.md`
- component registry/prop-validation decision
- question-bank storage/workflow decision
- source-pack storage/schema decision

**Exit gate:** Phase 0 readiness blockers are converted into accepted decisions, explicit unresolved blockers, or Phase 1B constraints.

## Phase 1B — Non-mutating prototype pipeline

**Objective:** Prove one draft-only pipeline path without touching production content.

**Prototype artifacts:**
- `editorial-diagnosis.json`
- `fact-ledger.json`
- `rewrite-plan.json`
- `proposed-edits.json`
- `fact-check-report.json`
- `pedagogy-report.json`
- `component-validation.json`
- `question-validation.json`
- `review-packet.md`

**Rules:**
- Draft-only artifacts.
- No Supabase apply.
- No edits to `original.md`.
- No edits to `linked-questions.json`.
- No browser-triggered AI execution.

**Exit gate:** JSON schemas validate against fixture data from at least 3 articles and one non-mutating end-to-end prototype article.

## Phase 1.5 — Registry and schema contract extraction

**Objective:** Extract the real contracts validators will enforce.

**Tasks:**
1. Locate the canonical SlateCamp MDX/wiki component registry.
2. Export valid component names, props, and risk notes.
3. Define JSON schemas with explicit migration/version policy.
4. Define prompt versions and model role names.

**Exit gate:** Validators have stable registry/schema inputs.

## Phase 2 — Deterministic validators first

**Objective:** Build the guardrails before letting AI propose changes.

**Validators:**
1. Article bundle integrity validator.
2. UI component registry validator.
3. Placeholder preservation validator.
4. MDX compile validator.
5. Source citation completeness validator.
6. Fact-change diff validator.
7. Question edit schema validator.
8. Answer key sanity validator.

**Exit gate:** Validators run on the pilot set and produce machine-readable reports.

## Phase 3 — AI read-only analysis passes

**Objective:** Use AI only to analyze, not edit.

**Passes:**
1. Article diagnosis.
2. Claim extraction and risk tagging.
3. Pedagogy assessment.
4. Question alignment assessment.

**Exit gate:** AI outputs structured JSON that passes schema validation. No content files changed.

## Phase 4 — AI proposal passes

**Objective:** AI proposes edits as patch plans, not direct file rewrites.

**Passes:**
1. Rewrite proposal.
2. Component recommendation.
3. Question edit proposal.
4. Source-needed proposal.

**Exit gate:** Proposed edits are deterministic, reviewable, and can be rejected before mutation.

## Phase 4.5 — Rollback, failure, and admin-visibility rehearsal

**Objective:** Prove recovery and review visibility before any local apply step.

**Tasks:**
1. Rehearse malformed output handling.
2. Rehearse stale corpus detection.
3. Rehearse rollback using the approved rollback drill plan when authorized.
4. Rehearse interrupted batch resume from manifest.
5. Map run manifests and findings to existing admin audit tables.
6. Identify schema gaps without migrating yet.
7. Define review queue statuses and reviewer decision types.

**Exit gate:** Failure/recovery path, rollback drill plan, and admin integration delta are accepted before local apply.

## Phase 5 — Apply to local bundles only

**Objective:** Apply approved low-risk proposed edits to `normalized.md` and `question-edits/` using code.

**Rules:**
- Never edit `original.md`.
- Never edit `linked-questions.json` directly.
- Preserve existing UI placeholders.
- Generate `candidate.md` through compose only.
- No Supabase apply.

**Exit gate:** Compose and dry-run pass for all applied pilot edits.

## Phase 6 — Fact and pedagogy review loop

**Objective:** Use stricter checker passes after proposed edits are applied locally.

**Outputs:**
- unsupported claims
- changed facts
- citation gaps
- answer-key risks
- review level

**Exit gate:** Human review packet generated for each article with high or critical risk.

## Phase 7 — Admin AI Audit integration

**Objective:** Make pipeline status visible in `/admin/ai-audit`.

**Integrations:**
- Sync run logs to `ai_audit_runs`.
- Attach per-article status to `ai_audit_status_cache` or a compatible table/view.
- Surface unsupported claims and source-needed items as findings.
- Link local export IDs and manifests to runs.

**Exit gate:** Admin UI shows latest pilot run, risk status, findings, and review queue.

## Phase 8 — Pilot benchmark and scale decision

**Objective:** Run a 20-article pilot and decide whether to scale.

**Exit gate:** Pilot benchmark report meets acceptance criteria in `09-acceptance-criteria.md`.

## Phase 9 — Batch scale-up

**Objective:** Expand from 20 articles to the full corpus in controlled batches.

**Batch order:**
1. Read-only fact/source/consistency audit per target batch.
2. Mechanical typo/format fixes after fact-risk classification.
3. Low-risk pedagogy improvements.
4. Medium-risk article restructuring.
5. High-risk legal/code articles.
6. Critical question answer-key work.

**Exit gate:** No batch scales until the previous risk tier passes validation and review.
