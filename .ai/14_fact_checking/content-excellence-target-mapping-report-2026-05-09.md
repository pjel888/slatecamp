# Content Excellence Target-Mapping Report — 2026-05-09

Generated: `2026-05-09T14:08:41.185713Z`

## Gate lock
No live Supabase apply, no live question apply, and no insert workflow was run. This is a no-apply local mapping/dry-run pass only.

## Existing article mappings prepared
- **BP 344 Accessible Ramp Geometry** → `5a8ca807-31d5-4a32-933a-c6b83517c6de` / `bp-344-ramp-slope-tiers`
  - Dry-run source: `dryrun-01-bp344-accessible-ramp-geometry` / `bp-344-accessible-ramp-geometry`
  - Target folder: `bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de`
  - Note: Exact ramp topic match; target slug is bp-344-ramp-slope-tiers.
- **RA 9266 Foreign Architect and Temporary Permit Gate** → `ae4bdc43-1451-4aa5-8c12-65283f4bbdfd` / `lea-prac-frm-005-foreign-architects-in-the-philippines`
  - Dry-run source: `dryrun-02-ra9266-foreign-architect-temporary-permit` / `ra-9266-foreign-architect-and-temporary-permit-gate`
  - Target folder: `lea-prac-frm-005-foreign-architects-in-the-philippines--ae4bdc43-1451-4aa5-8c12-65283f4bbdfd`
  - Note: Exact foreign-architect practice / temporary-special permit topic.
- **Vitruvius Principles versus Departments of Architecture** → `25607252-c20a-4013-99f5-af11e829fd18` / `lea-theo-001-09-core-concept`
  - Dry-run source: `dryrun-05-vitruvius-principles-and-departments` / `vitruvius-principles-versus-departments-of-architecture`
  - Target folder: `lea-theo-001-09-core-concept--25607252-c20a-4013-99f5-af11e829fd18`
  - Note: Existing Vitruvius/classical-theory article is the cleanest target.
- **PD 1096 Rule VII TGFA, AMBF, and Location Controls** → `85bcd328-436d-49ba-9d37-7b202d0d38d4` / `pd-1096-rule-vii-area-metrics`
  - Dry-run source: `dryrun-06-pd1096-tgfa-ambf-location-controls` / `pd-1096-rule-vii-tgfa-ambf-and-location-controls`
  - Target folder: `pd-1096-rule-vii-area-metrics--85bcd328-436d-49ba-9d37-7b202d0d38d4`
  - Note: Existing PD 1096 Rule VII area-metrics article covers the same code region.
- **UAP SPP 201 Pre-Design and Service Boundaries** → `16bb270e-6887-4bbe-a62e-eace6c4d3fdb` / `spp-doc-201-pre-design-services`
  - Dry-run source: `dryrun-09-uap-spp201-pre-design-and-service-boundaries` / `uap-spp-201-pre-design-and-service-boundaries`
  - Target folder: `spp-doc-201-pre-design-services--16bb270e-6887-4bbe-a62e-eace6c4d3fdb`
  - Note: Existing SPP Doc 201 pre-design article is exact service-family target.

## New article insertion tickets
- **RA 9514 Means of Egress Width, Count, and Illumination** → `new-article-ra9514-means-of-egress-width-count-illumination`
  - Candidate: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/ra-9514-means-of-egress-width-count-and-illumination--dryrun-03-ra9514-means-of-egress-width-and-count/candidate.md`
  - Word count: 890; linked questions: 3
  - Basis: Fresh mirror has related Fire egress and PD 1096 egress articles, but no exact RA 9514 article combining general egress width, egress count thresholds, and means-of-egress illumination. Treat as new unless Philip approves a deliberate merge into Fire egress.
- **National Plumbing Code Fixture Units and Venting** → `new-article-npcp-fixture-units-and-venting`
  - Candidate: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/national-plumbing-code-fixture-units-and-venting--dryrun-04-npcp-fixture-unit-and-venting/candidate.md`
  - Word count: 911; linked questions: 3
  - Basis: Existing plumbing articles are broad framework/system-component pages, not an exact Section 207.8 / Section 311.4 / loop-or-circuit vent focused target.
- **BP 220 Parks, Playgrounds, and Road Pavement** → `new-article-bp220-parks-playgrounds-road-pavement`
  - Candidate: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/bp-220-parks-playgrounds-and-road-pavement--dryrun-07-bp220-parks-playgrounds-road-pavement/candidate.md`
  - Word count: 925; linked questions: 3
  - Basis: Fresh mirror found BP 220 housing/density articles, but no exact parks/playgrounds allocation plus road pavement construction target.
- **PD 957 License to Sell Registration Gate** → `new-article-pd957-license-to-sell-registration-gate`
  - Candidate: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/pd-957-license-to-sell-registration-gate--dryrun-08-pd957-license-to-sell-registration-gate/candidate.md`
  - Word count: 914; linked questions: 3
  - Basis: Fresh mirror found broad housing-law and DHSUD-regulatory articles, but no exact PD 957 project-registration/license-to-sell gate article.

## Question classification
- REPLACE_EXISTING: 2
- ADD_NEW: 23
- DO_NOT_USE: 2

- `dryrun-01-bp344-accessible-ramp-geometry-q01` → **REPLACE_EXISTING** → `4c92b571-c5f6-45e7-accd-4567ebe47393`
  - Reason: Same minimum accessible-ramp clear-width concept; dry-run version has explicit 2024 IRR source locator.
- `dryrun-01-bp344-accessible-ramp-geometry-q02` → **DO_NOT_USE** → `5a8ca807-31d5-4a32-933a-c6b83517c6de`
  - Reason: Target article already has stronger slope-tier questions covering GOLD/MAX/RENO and 1:12 renovation trap; dry-run item is narrower.
- `dryrun-01-bp344-accessible-ramp-geometry-q03` → **DO_NOT_USE** → `5a8ca807-31d5-4a32-933a-c6b83517c6de`
  - Reason: Target article already has stronger landing/slope trap questions; dry-run item duplicates the 1,800 mm fact at lower complexity.
- `dryrun-02-ra9266-foreign-architect-temporary-permit-q01` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Definition of foreign architect is useful and not the same intent as existing permit/reciprocity items.
- `dryrun-02-ra9266-foreign-architect-temporary-permit-q02` → **REPLACE_EXISTING** → `c348de7a-021d-4ff6-9c91-c9673fb255f6`
  - Reason: Same authorization/permit concept; dry-run wording is source-specific to Section 38 and has explicit code citation.
- `dryrun-02-ra9266-foreign-architect-temporary-permit-q03` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Filipino counterpart definition is adjacent to but not the same as the existing fee-flow question.
- `dryrun-05-vitruvius-principles-and-departments-q01` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Book I Chapter II principle-list distinction is not directly covered by existing triad-focused questions.
- `dryrun-05-vitruvius-principles-and-departments-q02` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Book I Chapter III departments distinction is not directly covered by existing triad-focused questions.
- `dryrun-05-vitruvius-principles-and-departments-q03` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Economy interpretation from the cited passage is not directly covered by existing questions.
- `dryrun-06-pd1096-tgfa-ambf-location-controls-q01` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Section 704.1(a) site-access condition is not an exact existing target-question concept.
- `dryrun-06-pd1096-tgfa-ambf-location-controls-q02` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: AMTGFA/TGFA abbreviation-control item is useful and not the same as existing TGFA/GFA/AMBF calculation items.
- `dryrun-06-pd1096-tgfa-ambf-location-controls-q03` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Section 704.1(c) eaves-distance item is now taught by the mapped article, but needs duplicate review before insertion.
  - Duplicate watch: A similar existing question exists outside the mapped target: 2e393cbc-69e8-4130-b2ed-96f5f065d060.
- `dryrun-09-uap-spp201-pre-design-and-service-boundaries-q01` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Basic pre-design service identification is useful and not exact duplicate of existing specific-service questions.
- `dryrun-09-uap-spp201-pre-design-and-service-boundaries-q02` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: Consultation-as-compensable-input concept is not directly covered by existing SPP 201 questions.
- `dryrun-09-uap-spp201-pre-design-and-service-boundaries-q03` → **ADD_NEW** → `existing-article-question-insertion`
  - Reason: UAP 401-402 exclusion boundary supports the rewritten article; insert only after scope review because it references a different UAP document.
- `dryrun-03-ra9514-means-of-egress-width-and-count-q01` → **ADD_NEW** → `new-article-ra9514-means-of-egress-width-count-illumination`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-03-ra9514-means-of-egress-width-and-count-q02` → **ADD_NEW** → `new-article-ra9514-means-of-egress-width-count-illumination`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-03-ra9514-means-of-egress-width-and-count-q03` → **ADD_NEW** → `new-article-ra9514-means-of-egress-width-count-illumination`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-04-npcp-fixture-unit-and-venting-q01` → **ADD_NEW** → `new-article-npcp-fixture-units-and-venting`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-04-npcp-fixture-unit-and-venting-q02` → **ADD_NEW** → `new-article-npcp-fixture-units-and-venting`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-04-npcp-fixture-unit-and-venting-q03` → **ADD_NEW** → `new-article-npcp-fixture-units-and-venting`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-07-bp220-parks-playgrounds-road-pavement-q01` → **ADD_NEW** → `new-article-bp220-parks-playgrounds-road-pavement`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-07-bp220-parks-playgrounds-road-pavement-q02` → **ADD_NEW** → `new-article-bp220-parks-playgrounds-road-pavement`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-07-bp220-parks-playgrounds-road-pavement-q03` → **ADD_NEW** → `new-article-bp220-parks-playgrounds-road-pavement`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-08-pd957-license-to-sell-registration-gate-q01` → **ADD_NEW** → `new-article-pd957-license-to-sell-registration-gate`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-08-pd957-license-to-sell-registration-gate-q02` → **ADD_NEW** → `new-article-pd957-license-to-sell-registration-gate`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.
- `dryrun-08-pd957-license-to-sell-registration-gate-q03` → **ADD_NEW** → `new-article-pd957-license-to-sell-registration-gate`
  - Reason: Question belongs to a proposed new article ticket; current push-question script cannot insert new rows.

## Generated local artifacts
- Report JSON: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/target-mapping-report.json`
- Question edit files: 2
  - `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de/question-edits/4c92b571-c5f6-45e7-accd-4567ebe47393.json`
  - `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-prac-frm-005-foreign-architects-in-the-philippines--ae4bdc43-1451-4aa5-8c12-65283f4bbdfd/question-edits/c348de7a-021d-4ff6-9c91-c9673fb255f6.json`
- ADD_NEW question tickets: 23 under `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/insertion-tickets/add-new-questions`
- New article tickets: 4 under `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/insertion-tickets/new-articles`

## Verification commands run
Compose, diff, validate, and article push dry-runs were run for the five mapped existing article IDs. Question push dry-runs were run only for the generated REPLACE_EXISTING edit files.

## Verification results

- `bp-344-ramp-slope-tiers` (`5a8ca807-31d5-4a32-933a-c6b83517c6de`): compose blockers 0; diff safe `True`; validate blockers 0 / warnings 1; push dry-run blockers 0 / warnings 3; word count 934; candidate flags none.
- `lea-prac-frm-005-foreign-architects-in-the-philippines` (`ae4bdc43-1451-4aa5-8c12-65283f4bbdfd`): compose blockers 0; diff safe `True`; validate blockers 0 / warnings 1; push dry-run blockers 0 / warnings 3; word count 930; candidate flags none.
- `lea-theo-001-09-core-concept` (`25607252-c20a-4013-99f5-af11e829fd18`): compose blockers 0; diff safe `True`; validate blockers 0 / warnings 1; push dry-run blockers 0 / warnings 3; word count 905; candidate flags none.
- `pd-1096-rule-vii-area-metrics` (`85bcd328-436d-49ba-9d37-7b202d0d38d4`): compose blockers 0; diff safe `True`; validate blockers 0 / warnings 1; push dry-run blockers 0 / warnings 3; word count 912; candidate flags none.
- `spp-doc-201-pre-design-services` (`16bb270e-6887-4bbe-a62e-eace6c4d3fdb`): compose blockers 0; diff safe `True`; validate blockers 0 / warnings 1; push dry-run blockers 0 / warnings 3; word count 926; candidate flags none.

Question dry-runs:
- `4c92b571-c5f6-45e7-accd-4567ebe47393`: blockers 0; warnings 1; stale check `True`; report `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de/question-edits/4c92b571-c5f6-45e7-accd-4567ebe47393.push-report.json`.
- `c348de7a-021d-4ff6-9c91-c9673fb255f6`: blockers 0; warnings 1; stale check `True`; report `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/articles/lea-prac-frm-005-foreign-architects-in-the-philippines--ae4bdc43-1451-4aa5-8c12-65283f4bbdfd/question-edits/c348de7a-021d-4ff6-9c91-c9673fb255f6.push-report.json`.

Notes: article push dry-runs used `--repair-placeholders true` because the current Supabase/exported originals contain raw `SLATECAMP_UI_BLOCK` placeholders. No mutation was performed.

## Browser-rendered QA results
- Generated: `2026-05-09T14:39:23Z`
- Scope: only the 5 mapped existing article repairs; no new article tickets and no ADD_NEW question tickets.
- Render path: `candidate.md` → SlateCamp `compileWikiArticleWithRenderer()` → local static HTML → Chromium/Playwright.
- Viewports: desktop `1440x900`; mobile `390x844`.
- Overall status: **PASS** (`10` pass / `0` fail).
- Raw `SLATECAMP_UI_BLOCK` placeholder text rendered: **0**.
- Placeholder props summary lines rendered: **0**.
- Console errors / page errors: **0 / 0**.
- WikiArticle error state, broken image, empty heading, horizontal overflow checks: **0 failures**.
- Evidence: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/browser-qa/browser-qa-report.md` and `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/browser-qa/browser-results.json`.

Article pass list:
- `5a8ca807-31d5-4a32-933a-c6b83517c6de` / `bp-344-ramp-slope-tiers`: **PASS** in desktop and mobile; screenshots under `browser-qa/screenshots/`.
- `ae4bdc43-1451-4aa5-8c12-65283f4bbdfd` / `lea-prac-frm-005-foreign-architects-in-the-philippines`: **PASS** in desktop and mobile; screenshots under `browser-qa/screenshots/`.
- `25607252-c20a-4013-99f5-af11e829fd18` / `lea-theo-001-09-core-concept`: **PASS** in desktop and mobile; screenshots under `browser-qa/screenshots/`.
- `85bcd328-436d-49ba-9d37-7b202d0d38d4` / `pd-1096-rule-vii-area-metrics`: **PASS** in desktop and mobile; screenshots under `browser-qa/screenshots/`.
- `16bb270e-6887-4bbe-a62e-eace6c4d3fdb` / `spp-doc-201-pre-design-services`: **PASS** in desktop and mobile; screenshots under `browser-qa/screenshots/`.

## No-apply artifact audit
- Generated: `2026-05-09T14:40:51Z`
- Content-audit run logs inspected: `16`.
- Article push reports inspected: `5`; all `dry_run: true` and `apply: false`.
- Question push reports inspected: `2`; all `dry_run: true` and `apply: false`.
- `apply: true` artifacts found: `0`.
- `dry_run: false` push artifacts found: `0`.
- Evidence: `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/browser-qa/no-apply-artifact-audit.json`.
