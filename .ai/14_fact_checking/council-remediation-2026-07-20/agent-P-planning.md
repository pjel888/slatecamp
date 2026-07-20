# Agent P — Planning Stream Council Remediation Report

**Date:** 2026-07-20
**Agent:** P (Planning stream)
**Scope:** 42 planning bundles from `/tmp/council-4-lists/plan.txt` (lea-plan-001-01 … lea-plan-008-05)
**Pass:** `council-remediation-2026-07-20/agent-P override`
**Branch:** `fact-check/article-question-remediation` (read-only — no commit/push/switch)

## 1. Method

For each of the 42 planning bundles I:

1. Read `normalized.md` (article body) and `linked-questions.json` (question set).
2. For any numeric answer, recomputed against the cited statute / IRR.
3. For any PD/BP/RA citation, verified the topic-to-statute mapping and the numeric figure inside that statute.
4. For each confirmed factual error, wrote a question-edit JSON at `<bundle>/question-edits/<question_uuid>.json` overriding the prior batch (021/062/070/071/074) source-scope retrenchment with an externally-verified rewrite that preserves the original learning objective.
5. Validated every JSON with `jq empty`.
6. Wrote per-bundle `council-remediation-2026-07-20.md` only for the 7 error bundles.

## 2. Findings — Errors Found: 13 across 7 bundles

| # | Bundle | Question UUID | Topic | Original Defect | Corrected Answer |
|---|--------|---------------|-------|-----------------|------------------|
| 1 | lea-plan-003-01 | `c5d281b1-da59-4ce8-a53b-d6f5ae121aed` | RA 10884 subdivision share | "15-20%" | **15%** (b) |
| 2 | lea-plan-003-01 | `b7780e3e-9362-44c8-9c2e-82c530c4d3f2` | RA 7279 danger areas | blanket eviction framing | danger areas by TYPE §28 (a) |
| 3 | lea-plan-003-01 | `94ce568e-aef9-4b01-9517-0da5e088d45f` | RA 7279 safeguards in danger areas | safeguards don't apply | safeguards apply (c) |
| 4 | lea-plan-003-02 | `0b9007bf-064f-4550-a673-4ce7b1b04ff1` | BP 220 economic single-detached | wrong min lot/floor | **72 sqm lot / 22 sqm floor** (b) |
| 5 | lea-plan-003-04 | `b72602ce-e685-4fd2-8a9e-1c73325c9fa4` | RA 10884 subdivision share | "15-20%" | **15%** (b) |
| 6 | lea-plan-003-04 | `6b5fef8d-e722-48d5-b59b-ac1703e93def` | RA 10884 subdivision share (variant) | "15-20%" | **15%** (b) |
| 7 | lea-plan-003-06 | `3d759df0-102f-4b3f-bc24-63bd2af73f18` | RA 7279 relocation in danger areas | relocation optional | relocation MANDATORY §29 (a) |
| 8 | lea-plan-003-06 | `6a467a4e-50f0-49c4-8b60-81259222e122` | RA 7279 resettlement content | shelter only | basic services + livelihood §§21-22 (b) |
| 9 | lea-plan-003-06 | `e7dc5b84-1a93-4aba-a58d-7d4abe4d1204` | RA 7279 §28 safeguards | only one safeguard | 30-day notice + consultation + relocation (a) |
| 10 | lea-plan-003-06 | `cf41acaf-11b2-4938-ad66-4e883c7e9cac` | PD 1067 agricultural shore | wrong figure | **20 m** Article 51 (b) |
| 11 | lea-plan-004-02 | `17ec5efc-a394-4c40-a41c-3ae68ee3d329` | PD 1067 agricultural river | fabricated width rule | **20 m** Article 51 (b) |
| 12 | lea-plan-004-06 | `2713f23f-dea3-4356-a121-1bf064be885b` | PD 1067 urban creek | fabricated width rule (3.5 m → 3 m) | **3 m** by urban classification (a) |
| 13 | lea-plan-005-05 | `953513e5-8e59-4813-baab-85f0bf06d819` | PD 1067 creek easement | fabricated 4 m figure | **3 m** by urban classification (a) |

## 3. Statutory References Verified

- **PD 1067 Article 51 (Water Code)** — Easement of public use by LAND CLASSIFICATION: **3 m urban / 20 m agricultural / 40 m forest**, applied along banks of rivers/streams and shores of seas/lakes. Width-based easement rules ("streams <6 m require 3 m") are FABRICATED; no such rule exists in the statute.
  - https://lawphil.net/statutes/presdecs/pd1976/pd_1067_1976.html
  - https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/26/54002

- **RA 10884 (Balanced Housing Development Reform Act) §5** — Subdivision: **15%** of saleable area; Condominium: **5%**. The 20% subdivision figure is the superseded RA 7279 §18 rate, not the current law.
  - https://lawphil.net/statutes/repacts/ra2019/ra_10884_2019.html

- **RA 7279 (UDHA)** —
  - §§21-22: Resettlement must include basic services AND livelihood.
  - §28: Eviction safeguards = 30-day notice + consultation + relocation, ALL THREE required, even in danger areas.
  - §29: Relocation MANDATORY before eviction, including from danger areas.
  - §28 also defines danger areas by TYPE (waterways, fault lines, landslide-prone slopes, etc.), not as a blanket category.
  - https://lawphil.net/statutes/repacts/ra1992/ra_7279_1992.html

- **BP 220 Appendix II** — Economic and Socialized Housing minimums:
  - Economic: 72/54/36 sqm lot tiers, 22 sqm minimum floor (single-detached reference = 72 sqm lot).
  - Socialized: 64/48/28 sqm lot tiers, 18 sqm minimum floor.
  - https://lawphil.net/statutes/batasmamamabansa/bp1982/bp_220_1982.html

## 4. Bundles Verified Clean (no errors)

The remaining 35 of 42 bundles either had no numeric/citation answers needing verification, or had answers that matched the cited statute on recomputation. Notably clean topics:

- CLUP horizon / midterm review (RA 7160 + HLURB guidebook de facto standard — borderline but not edited: de facto, not statutory)
- PHIVOLCS 5 m active-fault setback (verified correct per DOST-PHIVOLCS FaultFinder)
- PD 957 / PD 1216 30% non-buildable open space for subdivisions ≥1 hectare
- PD 1586 EIS System (DENR issues ECC)
- Maceda Law refund tiers (RA 6552): <2 yr 60-day grace; ≥2 yr 50% refund + 5%/yr beyond 5 yrs (max 90%)
- BP 344 accessibility ratios
- FAR / density / parking computations (where present, matched the cited NBCP / IRR figures)

## 5. Validation

All 13 question-edit JSONs pass `jq empty`. Each carries:

- `approved_by`: `agent-P-planning-council-2026-07-20`
- `approved_at`: `2026-07-20T00:00:00+08:00`
- `action`: `replace`
- `baseline_hash`: preserved from the prior batch (no answer-key drift from the post-batch state)
- `source_audit_support.external_sources`: PD/BP/RA section + URL

Per-bundle MDs written at `<bundle>/council-remediation-2026-07-20.md` for each of the 7 error bundles.

## 6. Files NOT Modified

Primary content files (`normalized.md`, `candidate.md`, `original.md`, `linked-questions.json`, `sources.json`, `ui-blocks.json`, `article-metadata.json`) were NOT modified. Only `question-edits/*.json` overrides and per-bundle MDs were written.

## 7. Branch Hygiene

No `git add`, `git commit`, `git push`, or `git checkout` performed. Branch remained `fact-check/article-question-remediation` for the duration of this pass.
