# Content Excellence Depth Gate Audit — Superseded PASS Evidence

## Status

**SUPERSEDED: the earlier blocking finding is no longer current.**

The first version of this audit measured the initial proof-of-roundtrip candidates and correctly marked them as too thin for learner-facing release. After the depth expansion pass, the generated `candidate.md` files were recomposed and re-audited. The current evidence now shows **PASS for local roundtrip-conversion dry run** and **HOLD for live Supabase apply/publication**.

## Scope

Local dry-run root:

```text
.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/
```

Superseding evidence files:

- `.ai/14_fact_checking/content-excellence-roundtrip-dry-run-report-2026-05-09.md`
- `.ai/content-audit-export/roundtrip-dry-run-2026-05-09/roundtrip-release-readiness-audit-2026-05-09.json`
- `.ai/14_fact_checking/content-excellence-roundtrip-target-mapping-plan-2026-05-09.md`

## Current verdict

**PASS for depth gate at the local dry-run conversion stage. HOLD for live Supabase apply/publication.**

This audit no longer blocks the next controlled mapping pass. It still blocks live learner-facing publication because the dry-run bundles use synthetic `dryrun-*` IDs and have not yet been mapped to exact Supabase article/question targets or rendered in browser QA.

## Counting method

The binding depth counter for the release-readiness evidence is:

```bash
wc -w < generated candidate.md
```

This is intentionally strict because it counts the generated learner-facing article, not a source exemplar, sidecar, or hand-written draft. A Python regex counter is retained as a secondary compatibility counter only.

## Current quantitative findings

- Candidates checked: 9
- Depth floor used: 900 words for legal/code/professional-practice dry-run candidates
- Minimum generated candidate length: 904 words by shell `wc -w`
- Secondary regex minimum: 912 words
- Candidates below 900 words by `wc -w`: 0
- Candidates below 900 words by regex counter: 0
- Learner-visible governance/source-control text hits in normalized/candidate files: 0
- Raw `[SLATECAMP_UI_BLOCK:...]` hits in normalized/candidate files: 0
- Linked question shape/rationale/source-locator issues: 0
- Supabase mutation performed: 0

## Candidate measurements after depth expansion

- `dryrun-01-bp344-accessible-ramp-geometry`: 947 words by `wc -w`; 958 by regex counter
- `dryrun-02-ra9266-foreign-architect-temporary-permit`: 944 words by `wc -w`; 942 by regex counter
- `dryrun-03-ra9514-means-of-egress-width-and-count`: 904 words by `wc -w`; 944 by regex counter
- `dryrun-04-npcp-fixture-unit-and-venting`: 925 words by `wc -w`; 934 by regex counter
- `dryrun-05-vitruvius-principles-and-departments`: 920 words by `wc -w`; 912 by regex counter
- `dryrun-06-pd1096-tgfa-ambf-location-controls`: 926 words by `wc -w`; 965 by regex counter
- `dryrun-07-bp220-parks-playgrounds-road-pavement`: 940 words by `wc -w`; 955 by regex counter
- `dryrun-08-pd957-license-to-sell-registration-gate`: 929 words by `wc -w`; 921 by regex counter
- `dryrun-09-uap-spp201-pre-design-and-service-boundaries`: 942 words by `wc -w`; 949 by regex counter

## BP 220 reconciliation note

The prior BP 220 mismatch is resolved. The generated learner-facing file is:

```text
.ai/content-audit-export/roundtrip-dry-run-2026-05-09/articles/bp-220-parks-playgrounds-and-road-pavement--dryrun-07-bp220-parks-playgrounds-road-pavement/candidate.md
```

Current measurement:

- `wc -w`: 940 words
- Regex counter: 955 words
- Candidate SHA256: `sha256:9b4e286bee63efaf11ec68780cc2901f47c4a77ec793df78b2532d32d23199da`
- Raw placeholder hits: 0
- Learner-visible governance/workflow/source-control hits checked in the local audit: 0

The counting method is based on the generated `candidate.md`, not the source exemplar article or metadata word-count fields.

## Superseded finding retained for audit trail

The earlier blocking finding was accurate for the initial short proof-of-roundtrip candidates, which were below the current 900-word legal/code depth floor and still contained learner-visible internal signals. That state is no longer the current release evidence after the depth expansion, candidate recomposition, and validation pass.

## Current next gate

The next permitted step is a **controlled no-apply target-mapping/dry-run pass only**, using an isolated root such as `.ai/content-audit-export/target-mapping-no-apply-2026-05-09/` rather than the dirty default mirror root:

1. Refresh or verify the Supabase mirror into the isolated root with `content-audit:pull -- --output "$TARGET_ROOT"`.
2. Map each dry-run bundle to an exact real article target or a reviewed new-article insertion ticket.
3. Map questions to `question-edits/<question_id>.json`, reviewed insertion tickets, or discard decisions.
4. Recompose, diff, validate, and run Supabase push dry-run checks with `--input "$TARGET_ROOT"`.
5. Do not run article or question apply commands until Philip approves exact targets, dry-run evidence, and rendered browser QA.
