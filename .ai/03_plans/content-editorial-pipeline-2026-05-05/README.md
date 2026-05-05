# SlateCamp Content Editorial Pipeline Plan Pack

**Status:** Active planning pack  
**Created:** 2026-05-05  
**Scope:** Source-grounded AI-assisted article and question editing pipeline for the SlateCamp LEA corpus.  
**Supersedes active plan folders:**
- `.ai/03_plans/preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/content-audit-editor-protocol/`
- `.ai/03_plans/preserved/2026-05-05-superseded-content-editorial-pipeline-inputs/slatecamp-ai-audit-admin-ui-docs/`

## Goal

Build a source-grounded, roundtrip-safe editorial pipeline where AI proposes improvements, deterministic code validates structure, primary source packs validate facts, humans review high-risk changes, and Supabase receives only composed, dry-run-verified candidates.

## Non-goals

- No direct AI publishing.
- No direct edits to `original.md`.
- No edits to `linked-questions.json`; question changes use `question-edits/`.
- No model API call from the admin browser UI.
- No unsupported factual additions.
- No invented UI components.

## Plan documents

1. `00-existing-plan-disposition.md` — what happened to the two prior plan folders and why.
2. `01-implementation-roadmap.md` — phased implementation sequence, now split into Phase 1A read-only reconciliation and Phase 1B non-mutating prototype.
3. `02-audit-and-readiness-plan.md` — current-state audit before building.
4. `readiness-report.md` — formal Phase 0 GO / CONDITIONAL GO / NO-GO gate.
5. `current-script-map.md` — Phase 1A evidence map of content-audit scripts and command safety.
6. `current-artifact-map.md` — Phase 1A evidence map of generated/local artifacts and trust classifications.
7. `admin-ai-audit-current-state.md` — Phase 1A evidence map of the current admin audit surface.
8. `state-doc-contradictions.md` — Phase 1A contradiction register and gate mapping.
9. `pilot-candidate-shortlist.md` — Phase 1A candidate pool for later smoke/benchmark pilot selection.
10. `ui-block-count-reconciliation.md` — Phase 1A reconciliation of stale summary UI counts vs per-article UI-block artifacts.
11. `question-bank-failure-mode-map.md` — Phase 1A question-bank risk/failure taxonomy and question-edits coverage evidence.
12. `export-freshness-strategy.md` — Phase 1A export freshness criteria and live count anchors.
13. `live-db-schema-delta.md` — Phase 1A comparison of repo schema assumptions vs live Supabase evidence.
14. `03-pilot-study-and-benchmark-plan.md` — minimum 20-article smoke pilot plus recommended 30–35 article benchmark pilot, metrics, benchmarks.
15. `04-data-artifact-schema-plan.md` — proposed local artifacts and schemas.
16. `05-ai-prompt-and-model-roles-plan.md` — AI roles, structured outputs, prompt boundaries.
17. `06-script-and-validator-implementation-plan.md` — scripts and deterministic validators.
18. `07-admin-ai-audit-integration-plan.md` — `/admin/ai-audit` integration path.
19. `08-safety-review-and-release-plan.md` — review, PR, push, rollback, release gates.
20. `09-acceptance-criteria.md` — definition of done for each milestone.
21. `10-source-pack-and-grounding-plan.md` — source-pack/versioning/claim-grounding design.
22. `11-question-bank-specific-plan.md` — first-class plan for 7,000+ questions.
23. `12-cost-budget-and-throughput-plan.md` — cost, latency, and scale controls.
24. `13-failure-and-recovery-plan.md` — retries, quarantine, idempotency, stale failures.
25. `14-prompt-eval-and-iteration-plan.md` — prompt versioning and eval loop.
26. `15-observability-and-replay-plan.md` — run manifests, logs, replayability.
27. `16-roundtrip-concurrency-plan.md` — lock/merge/re-export collision rules.
28. `17-admin-ai-audit-schema-migration-plan.md` — artifact-to-admin schema mapping.
29. `18-reviewer-ops-and-sla-plan.md` — human reviewer roles and queue operations.
30. `19-rollback-drill-plan.md` — pre-apply rollback rehearsal plan.
31. `20-data-governance-and-provider-boundary.md` — provider/data-retention boundaries.
32. `prompts/` — initial AI prompt templates for diagnosis, claim extraction, rewrite proposal, fact check, and pedagogy check.
33. `review-notes/` — OpenCode and Claude Code Phase 0 planning-review memos used as evidence inputs.

## Current architecture anchors

- Local corpus: `.ai/content-audit-export/articles/`
- Roundtrip scripts: `scripts/content-audit/`
- Package commands: `content-audit:*`
- Durable protocol: `.ai/06_specs/deep/05-reference/content-audit-editor-protocol/`
- Admin route: `src/app/admin/ai-audit/`
- Admin sync bridge: `scripts/content-audit/sync-run-log-to-admin-audit.ts`

## Core doctrine

1. AI proposes. Code validates. Sources decide. Humans approve high-risk changes.
2. Every factual change must be explainable through the original article or approved source pack.
3. Every component insertion must use the actual SlateCamp component registry.
4. Every article edit must pass compose, diff, validation, and dry-run before apply.
5. High-risk and critical content creates review packets or PRs, not automatic publishes.
