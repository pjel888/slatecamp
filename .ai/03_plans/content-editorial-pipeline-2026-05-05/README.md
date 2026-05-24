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
34. `source-canonicality-decision.md` — Phase 0.5 classification of every potential source structure as canonical candidate, supporting context, authoring brief, derived artifact, not a source, or unknown.
35. `source-provenance-map.md` — Phase 0.5 mapping of available source records, their provenance evidence, and claim-addressability.
36. `source-coverage-gap-map.md` — Phase 0.5 coverage gap mapping by article cluster, question-bank cluster, and taxonomy cluster.
37. `source-pack-schema-readiness.md` — Phase 0.5 definition of the required future source-pack schema, maturity levels, and acceptance rule.
38. `source-pack-readiness-report.md` — Phase 0.5 gate verdict: NO-GO for source-grounded prototype; CONDITIONAL GO for planning and coverage mapping only.
39. `local-source-file-inventory.md` — Phase 0.5A inventory template and current evidence for local source/PDF-derived files, including pending `vitruvius-connection/`.
40. `local-pdf-extraction-provenance.md` — Phase 0.5A extraction-provenance requirements for PDF-derived Markdown/text.
41. `source-authority-hierarchy.md` — Phase 0.5A authority ranking for official sources, local PDFs, extracted text, DB citation rows, and article/question content.
42. `official-web-verification-policy.md` — Phase 0.5B policy for using official web sources to verify local files and source currency.
43. `source-conflict-resolution-policy.md` — Phase 0.5 conflict rules for local/official/article/question/source-version disagreements.
44. `source-drop-intake-protocol.md` — Phase 0.5A.1 pre-file source-drop state machine, quarantine rules, and future intake folder protocol.
45. `source-file-manifest-schema.md` — Phase 0.5A.1 future `source-manifest.csv` schema, validation rules, and grounding gates.
46. `source-id-naming-convention.md` — Phase 0.5A.1 stable source ID and chunk ID conventions for source files and later packs.
47. `live-readonly-source-admin-checks.md` — Phase 0.5 live read-only Supabase checks for `wiki_article_sources`, `taxonomy_sources`, `ai_audit_*`, and migration boundary.
48. `current-task-handoff.md` — Continuation note for future sessions/computers: current gate state, folder location, blocked/unblocked actions, and resume prompt.
49. `local-source-file-inventory.generated.md` — Phase 0.5A.2 generated intake inventory; current run found 2,551 visible files in `vitruvius-connection/`.
50. `local-source-file-manifest.generated.csv` — Phase 0.5A.2 generated manifest with one row per visible file.
51. `local-source-file-hashes.json` — Phase 0.5A.2 generated SHA-256 hash report for all visible files.
52. `local-source-file-classification.md` — Phase 0.5A.2 generated classification summary; files visible but no verified source candidates.
53. `local-source-file-gaps.md` — Phase 0.5A.2 generated gap report for source-level reconciliation and verification packets.
54. `source-bundle-reconciliation-plan.md` — Phase 0.5A.3 plan for grouping 2,551 physical files into source-level document bundles.
55. `source-verification-packet-schema.md` — Phase 0.5B.1 packet schema for human/SME source approval before `VERIFIED_SOURCE_CANDIDATE`.
56. `vitruvius-source-truth-orchestration.md` — Phase 0.5C architecture for Vitruvius, official web verification, source packs, terminal scripts, and `/admin/ai-audit`.
57. `official-source-search-playbook.md` — Phase 0.5B.2 official-web search anchors and match-status rules by source family.
58. `admin-ai-audit-source-verification-bridge.md` — Phase 0.5C.1 mapping from source verification outputs into `/admin/ai-audit` runs/items/findings/proposals.

## Current architecture anchors

- Active task plan folder: `.ai/03_plans/content-editorial-pipeline-2026-05-05/`
- Continuation handoff: `.ai/03_plans/content-editorial-pipeline-2026-05-05/current-task-handoff.md`
- Local source intake folder: `vitruvius-connection/`
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
6. Article-embedded 3D visuals must follow `.ai/03_plans/2026-05-21--article-3d-generation-toolchain/README.md`: `text-to-cad` for source-backed geometry; AI 3D tools only for provenance-gated illustrations.

## Phase 0.5A.3 / 0.5B Generated Reconciliation Artifacts

- `source-bundle-map.generated.csv` — one row per conservative source bundle.
- `source-bundle-map.generated.json` — machine-readable bundle graph with physical file membership.
- `source-bundle-reconciliation-report.md` — summary, counts, blocker register, and gate verdict.
- `source-bundle-high-risk-queue.md` — High/Critical legal-code-policy queue for official verification.
- `source-bundle-unpaired-files.md` — representative Markdown sample of derived-only, low-confidence, and unresolved identity triage; CSV/JSON are exhaustive.
- `source-official-url-candidates.generated.csv` — candidate official-source search seeds.
- `source-official-url-candidates-report.md` — search anchor summary and status warning.
- `source-verification-packet-draft-queue.md` — draft packet queue for priority source bundles.
- `pre-implementation-autopilot-roadmap.md` — remaining planning/evidence gates before implementation.

### Phase 0.5A.3 Review Corrections

- `identity_match_confidence` is heuristic filename/path/source_id grouping confidence, not source-verification confidence.
- `source-bundle-unpaired-files.md` is a representative Markdown sample when the triage set is large; use generated CSV/JSON for exhaustive rows.
- `source-official-url-candidates.generated.csv` carries `base_bundle_risk_tier` so official URL search rows do not silently downgrade source-bundle risk.

## Phase 0.5B / 0.5C Pre-Implementation Planning Additions

- `phase05b-live-verification-execution-plan.md` — future live official-source verification run design; no live verification executed.
- `official-source-verification-evidence-schema.md` — CSV/JSON evidence schema for official-source verification runs.
- `phase05c-admin-ai-audit-implementation-plan-skeleton.md` — planning-only skeleton for future admin audit source-verification integration.
- `source-pack-governance-decision-register.md` — unresolved governance decisions before source-pack build planning.


## Phase 0.5B Live Verification Evidence Outputs

Generated after browser/terminal evidence collection, still evidence-only:

- `phase05b-live-verification-results.generated.csv` — 85 evidence rows for prioritized bundles.
- `phase05b-live-verification-results.generated.json` — machine-readable evidence rows plus search log.
- `official-source-verification-evidence.generated.jsonl` — one JSON evidence record per row.
- `phase05b-live-verification-report.md` — Phase 0.5B summary and interpretation limits.
- `high-risk-official-verification-results.md` — high-risk row summary; no source approval.
- `source-conflict-register.generated.md` — generated conflict register; no conflicts classified by this pass.
- `source-verification-next-action-queue.md` — next-action grouping for unresolved and packet-draft candidates.

Phase 0.5B.1 / 0.5B.2 outputs:

- `phase05b1-evidence-review-report.md` — evidence review queue summary.
- `source-verification-packet-draft-queue.updated.md` — updated packet draft queue after live evidence.
- `source-verification-human-review-queue.md` — all 85 processed rows require human review.
- `source-verification-sme-review-queue.md` — 45 HIGH rows are conservatively routed to SME/admin review.
- `source-verification-conflict-review-queue.md` — no conflict rows classified by this pass.
- `source-verification-packets-draft/` — 3 packet drafts for Lawphil Rank 5 statute-archive matches only; approval remains blocked.

Phase 0.5B result: 85 prioritized bundles processed; 3 Rank 5 statute-archive matches found (`PD 1216`, `RA 11201`, `RA 11285` via Lawphil), classified as `NEEDS_HUMAN_VERIFICATION`; 82 rows remain `OFFICIAL_SOURCE_NOT_FOUND` in this runtime. Official Gazette was Cloudflare-blocked and not counted as positive evidence. All source approval, source-pack creation, embeddings, article rewriting, question editing, Supabase mutation, and live admin integration remain blocked.


## Phase 0.5C / 0.5D Planning Outputs

- `phase05c-admin-ai-audit-source-verification-implementation-plan.md` — implementation-ready plan for future admin source-verification sync; no code/DB changes authorized.
- `admin-ai-audit-source-verification-payload-schema.md` — dry-run payload schema draft for future source verification import into admin audit tables.
- `phase05d-source-pack-build-plan.md` — source-pack build plan only; source-pack implementation, chunks, embeddings, and Phase 1B remain blocked.

Phase 0.5C result: local schema supports source-target audit modeling, but live Supabase public `ai_audit_*` tables were absent in captured read-only checks; admin source sync remains blocked.
Phase 0.5D result: source-pack build plan is ready as a plan, but no source pack can be built until verification packet approval and governance decisions are resolved.

- `phase05b3-human-sme-review-decision-prep.md` — non-approval review-prep recommendations for the three Lawphil Rank 5 draft packets; all recommend `needs_more_evidence`.


## Phase 0.5B.4 human research correction pass

Phase 0.5B.4 added Claude human-style review plus Hermes live research corrections. PD 1216 remains `needs_more_evidence`. RA 11201 and RA 11285 are now `ready_for_human_packet_review` based on stronger authority-adjacent / Official Gazette PDF leads, but no source is approved. Source approval, source-pack creation, embeddings, article rewriting, question editing, Supabase mutation, admin AI audit live sync, and Phase 1B remain blocked. See `phase05b4-human-research-source-corrections.md`, `phase05b4-three-packet-review-update.md`, and `phase05b4-researched-official-source-leads.generated.csv`.

## Phase 0.5B.5 follow-up update

CLAUDE_REVIEW_STATUS = CLAUDE_UNAVAILABLE_TOKEN_LIMIT
CLAUDE_REVIEW_PENDING = true

Phase 0.5B.5 added fallback-only official-source research. Key changes: Senate LRB PD 1216 and BFP RA 9514 candidates are SECURITY_GATED, DOE DC2019-11-0014 is an OFFICIAL_PAGE_FOUND lead with incomplete metadata/PDF capture, NCDA BP 344 2024 Revised IRR PDF was found and hashed, DPWH PD1096 PDF was reconfirmed, RA9266 remains unresolved beyond archive/security-gated candidates, and PRC exam schedule/program access remains blocked by PRC FortiADC. Gates remain blocked.

## Phase 0.5B.6 reconciliation note

Claude tokens were renewed and Claude human-style review completed after retry. Hermes reconciled Claude findings with newly added `vitruvius-connection/001_Raw-Source-Layer` PDFs. Key updates: RA 11201 001 raw PDF matches Official Gazette hash but older 002 OCR/conversion hash differs (`conflict_requires_sme`); RA 11285 001 raw PDF matches Official Gazette hash; DOE DC2019-11-0014 official legacy DOE PDF was captured and hashed; PRC 2026 schedule/program was captured as logistics-only evidence. All source approval/source-pack/embedding/article/question/Supabase gates remain blocked.


## Phase 0.7 Implementation Sprint 2 Generated Artifacts

Phase 0.7 implemented deterministic local-only locator extraction and human/SME packet-prep tooling. This remains source-verification preparation only; no source approval, source-pack creation, chunks, embeddings, article/question edits, Supabase mutation, or admin live sync occurred.

Scripts added/updated:

- `scripts/content-audit/extract-source-locators.ts`
- `scripts/content-audit/build-human-sme-packet-prep.ts`
- `scripts/content-audit/validate-locator-packet-readiness.ts`
- `scripts/content-audit/build-source-verification-admin-payload.ts`
- `scripts/content-audit/run-source-verification-smoke.ts`

Package scripts:

- `content-audit:source-locators`
- `content-audit:source-packet-prep`
- `content-audit:source-locator-readiness`
- `content-audit:source-verification-smoke`

Generated outputs:

- `source-locator-evidence.generated.csv`
- `source-locator-evidence.generated.json`
- `source-locator-extraction-report.md`
- `source-human-sme-packet-prep.generated.md`
- `source-human-sme-packet-prep.generated.json`
- `source-human-sme-review-queue.generated.md`
- `source-human-sme-conflict-queue.generated.md`
- `source-locator-packet-readiness-validation.md`
- `source-locator-packet-readiness-validation.json`
- `source-verification-smoke-test-report.md`
- `source-verification-smoke-test.generated.json`
- `phase07-implementation-sprint2-locator-packet-report.md`
- `phase07b-safe-followup-implementation-report.md`

Local CLI sequence:

```bash
bun scripts/content-audit/build-source-reconciliation-matrix.ts
bun scripts/content-audit/validate-source-packet-readiness.ts
bun scripts/content-audit/extract-source-locators.ts
bun scripts/content-audit/build-human-sme-packet-prep.ts
bun scripts/content-audit/validate-locator-packet-readiness.ts
bun scripts/content-audit/validate-admin-ai-audit-schema.ts
bun scripts/content-audit/build-source-verification-admin-payload.ts
bun scripts/content-audit/run-source-verification-smoke.ts
```

Current Phase 0.7 result: 9 locator rows, 9 packet-prep rows, 7 `conflict_requires_sme`, 2 `ready_for_human_packet_review`, 16/16 locator packet readiness checks passing, dry-run admin payload only.
