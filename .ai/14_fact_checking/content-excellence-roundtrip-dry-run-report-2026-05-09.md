# Content Excellence Roundtrip Dry-Run Report — 2026-05-09

Generated: 2026-05-09T13:29:42Z
Branch: `3dlab-gray-viewport-bg`
Dry-run root: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09`
SME approval source: `.ai/14_fact_checking/content-excellence-exemplar-sme-release-approval-2026-05-09.md`
Release-readiness audit: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/roundtrip-release-readiness-audit-2026-05-09.json`
Depth-gate supersession: `.ai/14_fact_checking/content-excellence-depth-gate-audit-2026-05-09.md`

## Verdict

**PASS for local roundtrip-conversion dry run after reviewer-request fixes. HOLD for direct learner-facing publication.**

No Supabase mutation was performed. The dry-run produced local content-audit bundles only, using synthetic `dryrun-*` article IDs. The release-readiness blockers found in the reviewer pass are now closed locally.

## Scope processed

- Article bundles: 9
- Linked MCQs converted: 27
- Source sidecars: 9
- Taxonomy sidecars: 9
- Candidates with proposed conversion-time diffs: 9
- Candidates unchanged from original dry-run article text: 0

## Commands rerun after fixes

```bash
bun run content-audit:compose -- --input .ai/content-audit-export/roundtrip-dry-run-2026-05-09 --overwrite true
bun run content-audit:diff -- --input .ai/content-audit-export/roundtrip-dry-run-2026-05-09
bun run content-audit:validate -- --input .ai/content-audit-export/roundtrip-dry-run-2026-05-09 --json
```

## Validation results

- `content-audit:validate`: **valid: true**
- Blockers: **0**
- Warnings: **0**
- Learner-visible governance/source-control text hits in normalized/candidate: **0**
- Raw `[SLATECAMP_UI_BLOCK:...]` hits in normalized/candidate: **0**
- Hash mismatches across manifest/export-summary/metadata/linked questions: **0**
- Question shape/rationale/source-locator errors: **0**
- Supabase push/apply artifacts present: **0**
- Minimum candidate depth: **904 words by shell `wc -w`; 912 words by the regex audit counter**
- Candidates below 900-word depth-risk floor: **0 by both counters**

## Reviewer-request fixes applied locally

- Stripped learner-visible governance/source-control/release-status wording from normalized.md/candidate.md layers; release boundary remains only in review reports.
- Cleaned learner-facing question jargon: no visible "stem/stems" term remains in candidate content or linked question text/rationales.
- Corrected PD 1096 Q3 rationale guardrail: correct option C is no longer listed as a distractor; distractor keys are A/B/D only.
- Tightened PD 1096 locators to Rule VII Section 704.1(a), 704.1(c), and Section 705.1-705.2 where relevant.
- Added NPCP source-provenance metadata anchoring the bundle to the Revised National Plumbing Code of the Philippines, PRC Board Resolution No. 04-99.
- Synchronized export-summary linked-question hashes to the actual linked-questions.json hashes for all 9 bundles.
- Resolved BP 220 word-count mismatch: `candidate.md` now measures 940 words by shell `wc -w` and 955 by the regex audit counter; dry-run normalized/candidate and the source exemplar article are aligned.
- Superseded the earlier depth-gate blocking audit with current PASS evidence, using generated `candidate.md` word counts as the binding measurement.
- Locked the next step as controlled no-apply target mapping and Supabase dry-run checks only; no live apply/publication is authorized by this report.

## SME guardrail checks

- `04_npcp`: PASS
  - Revised NPCP provenance is labeled as adopted under PRC Board Resolution No. 04-99.
  - Locator scope records Section 207.8, Section 311.4, and Loop or Circuit Vent definition coverage.
- `06_pd1096`: PASS
  - Article candidate cites Rule VII Section 704.1(a) and 704.1(c) where practical.
  - Q3 correct option remains `C` / 750 mm.
  - Q3 distractor keys are `A`, `B`, and `D`; correct option `C` is not listed as a distractor.
- `learner_visible_cleanliness`: PASS
  - No candidate/normalized release-status, local workflow, raw placeholder, or learner-visible `stem/stems` hits remain.
- `summary_hash_sync`: PASS
  - `export-summary.json` linked-question hashes were synchronized to the actual bundle sidecars.

## Bundle index for review

- `dryrun-01-bp344-accessible-ramp-geometry`
  - Title: BP 344 Accessible Ramp Geometry
  - Questions: 3
  - Candidate diff: changed
  - Word count: 947 (`wc -w`) / 958 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/bp-344-accessible-ramp-geometry--dryrun-01-bp344-accessible-ramp-geometry`
- `dryrun-02-ra9266-foreign-architect-temporary-permit`
  - Title: RA 9266 Foreign Architect and Temporary Permit Gate
  - Questions: 3
  - Candidate diff: changed
  - Word count: 944 (`wc -w`) / 942 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/ra-9266-foreign-architect-and-temporary-permit-gate--dryrun-02-ra9266-foreign-architect-temporary-permit`
- `dryrun-03-ra9514-means-of-egress-width-and-count`
  - Title: RA 9514 Means of Egress: Width, Count, and Illumination
  - Questions: 3
  - Candidate diff: changed
  - Word count: 904 (`wc -w`) / 944 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/ra-9514-means-of-egress-width-count-and-illumination--dryrun-03-ra9514-means-of-egress-width-and-count`
- `dryrun-04-npcp-fixture-unit-and-venting`
  - Title: National Plumbing Code Fixture Units and Venting
  - Questions: 3
  - Candidate diff: changed
  - Word count: 925 (`wc -w`) / 934 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/national-plumbing-code-fixture-units-and-venting--dryrun-04-npcp-fixture-unit-and-venting`
- `dryrun-05-vitruvius-principles-and-departments`
  - Title: Vitruvius: Principles versus Departments of Architecture
  - Questions: 3
  - Candidate diff: changed
  - Word count: 920 (`wc -w`) / 912 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/vitruvius-principles-versus-departments-of-architecture--dryrun-05-vitruvius-principles-and-departments`
- `dryrun-06-pd1096-tgfa-ambf-location-controls`
  - Title: PD 1096 Rule VII: TGFA, AMBF, and Location Controls
  - Questions: 3
  - Candidate diff: changed
  - Word count: 926 (`wc -w`) / 965 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/pd-1096-rule-vii-tgfa-ambf-and-location-controls--dryrun-06-pd1096-tgfa-ambf-location-controls`
- `dryrun-07-bp220-parks-playgrounds-road-pavement`
  - Title: BP 220 Parks, Playgrounds, and Road Pavement
  - Questions: 3
  - Candidate diff: changed
  - Word count: 940 (`wc -w`) / 955 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/bp-220-parks-playgrounds-and-road-pavement--dryrun-07-bp220-parks-playgrounds-road-pavement`
- `dryrun-08-pd957-license-to-sell-registration-gate`
  - Title: PD 957 License to Sell Registration Gate
  - Questions: 3
  - Candidate diff: changed
  - Word count: 929 (`wc -w`) / 921 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/pd-957-license-to-sell-registration-gate--dryrun-08-pd957-license-to-sell-registration-gate`
- `dryrun-09-uap-spp201-pre-design-and-service-boundaries`
  - Title: UAP SPP 201 Pre-Design and Service Boundaries
  - Questions: 3
  - Candidate diff: changed
  - Word count: 942 (`wc -w`) / 949 (regex audit)
  - Diff safe: true
  - Bundle: `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/uap-spp-201-pre-design-and-service-boundaries--dryrun-09-uap-spp201-pre-design-and-service-boundaries`

## Important boundary

This was not a live push and not a publication approval. Before any learner-facing Supabase apply, the dry-run bundles must be mapped to exact Supabase article/question targets or an approved article/question creation workflow, then rendered output must be reviewed by Philip as the final human release gate.

## Remaining risks / unresolved items

- The dry-run uses synthetic article IDs (`dryrun-*`), so no exact-ID live article update can be applied from these bundles as-is.
- The generated bundles prove roundtrip integrity and local content cleanliness, not browser-rendered page quality.
- Question rows are represented as linked-question sidecars for review; no `question-edits/` live-push files were created because these are new exemplar questions, not exact-ID edits to existing Supabase rows.
- Target mapping must decide, pack by pack, whether to update an existing article or create a new learner-facing article/question cluster.
- The target list in the mapping plan is proposed, not approved. It must be verified against a fresh Supabase mirror before any dry-run push check. The next mirror must be isolated under `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/`, not the already dirty default `.ai/content-audit-export` root.
- Rendered learner-facing browser QA has not happened, so live apply/publication remains blocked.

## Recommended next action

Use `.ai/14_fact_checking/content-excellence-roundtrip-target-mapping-plan-2026-05-09.md` as the next gate for a controlled no-apply mapping pass only. Do not run `content-audit:push:apply` or `content-audit:push-question:apply` until Philip approves exact article IDs, exact question handling, push dry-run results, and final rendered QA.
