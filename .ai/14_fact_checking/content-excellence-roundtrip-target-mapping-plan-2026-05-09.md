# Content Excellence Roundtrip Target-Mapping Plan — 2026-05-09

Generated: 2026-05-09T13:29:42Z
Dry-run root: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09`
Readiness report: `.ai/14_fact_checking/content-excellence-roundtrip-dry-run-report-2026-05-09.md`
Release-readiness audit: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/roundtrip-release-readiness-audit-2026-05-09.json`
Depth-gate supersession: `.ai/14_fact_checking/content-excellence-depth-gate-audit-2026-05-09.md`

## Gate lock update

**Locked next step: controlled no-apply target mapping and Supabase dry-run checks only.**

This document is not approval for live Supabase apply, live question apply, public publication, or silent insertion of new article/question rows. The only authorized continuation is to refresh or verify the mirror, map exact targets, produce mapped local edit artifacts, recompose/diff/validate, and run dry-run push checks. Any `content-audit:push:apply` or `content-audit:push-question:apply` command remains blocked until Philip approves the exact target list after rendered browser QA.

## Current gate status

Target mapping may start because the local release-readiness blockers are closed:

- `content-audit:validate`: valid, 0 blockers, 0 warnings.
- Learner-visible governance/source-control text in `normalized.md`/`candidate.md`: 0 hits.
- Learner-visible `stem/stems` terminology in candidate/question content: 0 hits.
- Question integrity audit: 27 linked MCQs checked, 0 issues.
- Depth gate: all 9 candidate articles are above 900 words by both counters; minimum is 904 words by shell `wc -w` and 912 words by the regex audit counter.
- PD 1096 Q3 guardrail fixed: correct option `C` is not in distractors; distractor keys are `A`, `B`, `D`.
- NPCP provenance guardrail recorded in `linked-questions.json`.
- `manifest.json`, `export-summary.json`, `article-metadata.json`, and `linked-questions.json` linked-question hashes are synchronized.

This is still **not** approval to publish, apply, or treat the proposed target list as final. It is approval to run the next controlled no-apply mapping pass only.

## Controlled full-run boundary

For this gate, “full run” means:

1. Refresh or verify the Supabase mirror.
2. Map each dry-run bundle to an exact real article target or a reviewed new-article insertion ticket.
3. Map questions to exact `question-edits/<question_id>.json` files, approved insertion candidates, or discard decisions.
4. Recompose, diff, and validate the mapped local bundles.
5. Run Supabase article/question push dry-run checks only.

It does **not** mean live Supabase apply, live question apply, public publication, or approval of the proposed target list below.


## Non-negotiable mapping rules

1. Use a fresh Supabase mirror before live target work. The current dry-run IDs are synthetic `dryrun-*` IDs.
2. Map article content only by exact `article_id`, not by title similarity alone.
3. For existing articles, edit the fresh bundle’s `normalized.md`; do not paste directly into Supabase.
4. Preserve `ui-blocks.json` and placeholders through compose; never publish raw `[SLATECAMP_UI_BLOCK:...]` placeholders.
5. Existing question changes must be represented as `question-edits/<question_id>.json` with a baseline hash.
6. New exemplar questions are not valid `question-edits` unless they are mapped to existing `question_id` rows. Otherwise they must become reviewed insertion tickets in the target-mapping report, not `push-question` payloads.
7. Run `compose`, `diff`, `validate`, and push dry-run for every mapped article before any apply.
8. No `content-audit:push:apply` or `content-audit:push-question:apply` until Philip approves the exact target list.

## Fresh mirror commands

Use an isolated target-mapping root. Do **not** pull the next pass into the default `.ai/content-audit-export` root because that root already contains unrelated existing mirror changes.

Recommended no-apply target-mapping root:

```bash
TARGET_ROOT=.ai/content-audit-export/target-mapping-no-apply-2026-05-09
```

Recommended fresh mirror pattern:

```bash
# Full isolated mirror, if we need to search all articles/questions for exact targets
bun run content-audit:pull -- --output "$TARGET_ROOT" --all --include-questions true --include-sources true --include-taxonomy true --overwrite true

# Targeted isolated mirror, once exact target article IDs are selected
bun run content-audit:pull -- --output "$TARGET_ROOT" --article-id <real_article_id> --include-questions true --include-sources true --include-taxonomy true --overwrite true
```

Then for each approved target article, always point every local command at the isolated root:

```bash
bun run content-audit:normalize -- --input "$TARGET_ROOT" --article-id <real_article_id> --overwrite true
# edit "$TARGET_ROOT"/articles/<target-folder>/normalized.md
# create "$TARGET_ROOT"/articles/<target-folder>/question-edits/*.json only for existing mapped questions
bun run content-audit:compose -- --input "$TARGET_ROOT" --article-id <real_article_id> --overwrite true
bun run content-audit:diff -- --input "$TARGET_ROOT" --article-id <real_article_id>
bun run content-audit:validate -- --input "$TARGET_ROOT" --article-id <real_article_id> --json
bun run content-audit:push:dry-run -- --input "$TARGET_ROOT" --article-id <real_article_id>
```

For existing mapped questions only:

```bash
bun run content-audit:push-question:dry-run -- --input "$TARGET_ROOT" --question-id <real_question_id>
```

`push-question:dry-run` requires an exported real question in `linked-questions.json` plus a matching `question-edits/<question_id>.json`; it is not a new-question insertion path.

## Proposed article target map

### 01 — BP 344 Accessible Ramp Geometry

- Dry-run ID: `dryrun-01-bp344-accessible-ramp-geometry`
- Proposed action: **map to existing article if the intent is to upgrade the ramp topic**.
- Best current candidate target:
  - Article ID: `5a8ca807-31d5-4a32-933a-c6b83517c6de`
  - Slug: `bp-344-ramp-slope-tiers`
  - Title: `BP 344 Ramp Slope Tiers`
  - Current linked questions: 10
  - Current source count: 0
- Secondary related articles:
  - `6d5e0e55-215a-4806-a679-dac7aea5a99b` — `bp-344-accessible-washrooms`
  - `ee1f8beb-e236-4831-a0a8-1ddce447a3b8` — `bp-344-vs-pd-1096-conflicts`
- Mapping note: do not overwrite washroom/conflict articles; ramp geometry belongs most cleanly in the ramp slope article.
- Question strategy: either map dry-run questions to existing BP 344 ramp questions one by one, or insert as a new three-question supplement after approval.

### 02 — RA 9266 Foreign Architect and Temporary Permit Gate

- Dry-run ID: `dryrun-02-ra9266-foreign-architect-temporary-permit`
- Proposed action: **map to existing article**.
- Best current candidate target:
  - Article ID: `ae4bdc43-1451-4aa5-8c12-65283f4bbdfd`
  - Slug: `lea-prac-frm-005-foreign-architects-in-the-philippines`
  - Title: `Foreign Architects in the Philippines`
  - Current linked questions: 10
  - Current source count: 0
- Secondary related articles:
  - `02a5ba32-0443-4162-837d-326783ed77a2` — `lea-prac-law-001-ra-9266-overview-history-legislative-intent-and-key-definitions`
  - `a13cdc9c-f057-481e-a661-eedb6548f6d8` — `lea-prac-frm-006-asean-mutual-recognition-arrangement-for-architectural-services`
- Mapping note: this is a focused foreign-practice/temporary-permit topic; it should not be merged into the broad RA 9266 overview unless Philip wants fewer narrow articles.

### 03 — RA 9514 Means of Egress Width, Count, and Illumination

- Dry-run ID: `dryrun-03-ra9514-means-of-egress-width-and-count`
- Proposed action: **likely create a new article**, unless Philip wants to merge Fire Code egress into an existing PD 1096 egress article.
- Closest existing candidates:
  - `93009368-9041-46e0-b93b-8786100311be` — `pd-1096-rule-xii-egress-and-corridors` — strong egress overlap, but different governing source.
  - `1d37a355-c8bf-4d5e-a41b-07a9817a4427` — `lea-util-004-04-when-fire-alarm-systems-are-mandatory-ra-9514-irr` — RA 9514 overlap, but fire alarm topic, not egress geometry/count.
- Mapping note: do not silently merge RA 9514 means-of-egress rules into PD 1096 Rule XII. If merged, the article title and source split must make the two regimes explicit.

### 04 — National Plumbing Code Fixture Units and Venting

- Dry-run ID: `dryrun-04-npcp-fixture-unit-and-venting`
- Proposed action: **likely create a dedicated article**, or map to the plumbing regulatory overview only if Philip wants a broader utilities article.
- Closest existing candidates:
  - `8ba7dce8-b30a-497e-af30-7cf6b3637216` — `lea-util-001-08-what-you-need-to-know-for-the-lea` — plumbing framework, current linked questions: 15.
  - `be3f2bf1-8d85-4c03-a047-ae1c2503d4cb` — `lea-util-001-07-system-components-and-functions` — drainage/system-components overlap.
  - `183eb4f6-8e99-4c13-85f2-f5b01e1a082a` — `mastery-building-utilities-mepf` — mastery overview, not an exact topic target.
- Mapping note: because this dry-run has precise NPCP Section 207.8 / Section 311.4 / Loop or Circuit Vent provenance, a dedicated article is cleaner than burying it in a broad utilities overview.

### 05 — Vitruvius Principles versus Departments of Architecture

- Dry-run ID: `dryrun-05-vitruvius-principles-and-departments`
- Proposed action: **map to existing article**.
- Best current candidate target:
  - Article ID: `25607252-c20a-4013-99f5-af11e829fd18`
  - Slug: `lea-theo-001-09-core-concept`
  - Title: `Vitruvius and Classical Architectural Theory`
  - Current linked questions: 13
  - Current source count: 2
- Secondary related articles:
  - `128400dd-8642-4275-a64f-c411f6836d6d` — `lea-theo-005-01-core-concept`
  - `976957b7-c288-4a63-8e76-9e26dcf6f199` — `lea-theo-005-04-core-concept`
- Mapping note: the dry-run topic is specifically about not confusing principles with departments; this fits the existing Vitruvius/classical theory article best.

### 06 — PD 1096 Rule VII TGFA, AMBF, and Location Controls

- Dry-run ID: `dryrun-06-pd1096-tgfa-ambf-location-controls`
- Proposed action: **map to existing PD 1096 Rule VII area article**, with possible cross-links to height/occupancy articles.
- Best current candidate target:
  - Article ID: `85bcd328-436d-49ba-9d37-7b202d0d38d4`
  - Slug: `pd-1096-rule-vii-area-metrics`
  - Title: `PD 1096 Rule VII Area Metrics`
  - Current linked questions: 50
  - Current source count: 0
- Secondary related articles:
  - `a865c6b2-8c25-404e-bb0c-08d374d374a5` — `pd-1096-rule-vii-height-limits`
  - `9085e0d8-3498-4d3b-b991-46e54d94bde0` — `pd-1096-rule-vii-occupancy`
  - `859b1a7f-8aba-473d-8c28-f9aaa39af11d` — `pd-1096-rule-viii-setbacks-and-easements`
- Mapping note: Section 704.1(a)/(c) location controls and Section 705 TGFA/AMBF controls must stay distinguishable. Do not collapse AMBF into TGFA.
- Question strategy: because the current target has 50 linked questions, do a question-level alignment pass before replacing or adding anything.

### 07 — BP 220 Parks, Playgrounds, and Road Pavement

- Dry-run ID: `dryrun-07-bp220-parks-playgrounds-road-pavement`
- Proposed action: **likely create a new article**, unless a BP 220-specific article exists outside the current local search results.
- Weak related candidates:
  - `d2246ae0-2def-4144-b42d-f56172b13f67` — `lea-plan-004-03-what-you-need-to-know-for-the-lea`
  - `f5374d6a-fc70-475e-83ce-7feb64056655` — `lea-plan-005-01-what-you-need-to-know-for-the-lea`
- Mapping note: search found only weak landscape/planning overlaps, not a clean BP 220 parks/playgrounds/road-pavement target. Prefer new article unless a fresh mirror reveals a better exact target.

### 08 — PD 957 License to Sell Registration Gate

- Dry-run ID: `dryrun-08-pd957-license-to-sell-registration-gate`
- Proposed action: **likely create a new article**, or map to a Philippine housing law framework article if that article is intentionally broad.
- Closest existing candidates:
  - `0d2e80df-4f76-484e-9b1f-5502da9e35be` — `lea-plan-003-01-what-you-need-to-know-for-the-lea` — Philippine housing law framework.
  - `9098a3d8-b4d7-42f4-ac2b-0df1509c2507` — `lea-plan-007-02-core-concept` — DHSUD/license-to-sell overlap.
- Mapping note: do not map to RA 9266 certificate-of-registration articles; those are professional licensure topics, not PD 957 project-registration/license-to-sell controls.

### 09 — UAP SPP 201 Pre-Design and Service Boundaries

- Dry-run ID: `dryrun-09-uap-spp201-pre-design-and-service-boundaries`
- Proposed action: **map to existing SPP 201 article**.
- Best current candidate target:
  - Article ID: `16bb270e-6887-4bbe-a62e-eace6c4d3fdb`
  - Slug: `spp-doc-201-pre-design-services`
  - Title: `SPP Doc 201: Pre-Design Services`
  - Current linked questions: 10
  - Current source count: 0
- Secondary related articles:
  - `db248a33-44f2-411c-a069-9685200a588c` — `lea-prac-svc-001-pre-design-services-scope-deliverables-and-compensation-method`
  - `f2c105fd-51fc-4b48-b53a-77242dbb91b0` — `uap-spp-doc-standards-of-professional-practice-for-philippine-architects`
- Mapping note: keep the 85/10/5 fee wording narrowly tied to the suspended/abandoned-work context where it belongs; do not teach it as a universal UAP fee rule.

## Question mapping plan

For each approved article target:

1. Export fresh target bundle with linked questions.
2. Compare the dry-run 3-question set to existing linked questions.
3. Classify each dry-run question:
   - `REPLACE_EXISTING`: same concept and same assessment intent; create `question-edits/<real_question_id>.json` in the isolated target root and run `push-question:dry-run --input "$TARGET_ROOT"`.
   - `ADD_NEW`: useful new retrieval item with no exact existing row; write an insertion ticket in the target-mapping report or a dedicated local ticket file. Do not run `push-question:dry-run` because the current push script requires an exported real question and matching edit file.
   - `DO_NOT_USE`: duplicate, too narrow, or lower quality than existing item.
4. For answer-key changes, require explicit reviewer metadata and source locator in the edit file.
5. Dry-run every existing question edit with `content-audit:push-question:dry-run -- --input "$TARGET_ROOT" --question-id <real_question_id>` before any apply.
6. Hold every `ADD_NEW` ticket for a separate reviewed insertion workflow; it is outside the current edit-only push path.

## Acceptance criteria for a publishable target batch

A batch is ready for Philip’s final approval only when:

- Every dry-run pack has an approved real target: existing article ID or new-article insertion ticket.
- Every article update is recomposed from the target bundle’s `normalized.md` and validates with 0 blockers.
- Every source-sensitive claim has a source locator from the approved source pack/raw source layer.
- Every existing question update has a `question-edits/<question_id>.json` file with baseline hash and allowed fields only.
- Every new question has an approved insertion method; it is not smuggled into an edit-only flow.
- Push dry-run passes stale checks against Supabase; no apply command is run.
- Rendered page QA confirms no raw placeholders, broken MDX, or learner-visible workflow text.
- Philip explicitly approves the final apply list after rendered browser QA.
