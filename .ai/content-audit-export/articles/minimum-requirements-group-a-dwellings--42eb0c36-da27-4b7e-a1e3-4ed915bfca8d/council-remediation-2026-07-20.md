# Council Remediation 2026-07-20 — Per-Bundle Report

**Bundle:** minimum-requirements-group-a-dwellings
**Bundle id:** `42eb0c36-da27-4b7e-a1e3-4ed915bfca8d`
**Agent:** R (code-standalone)
**Date:** 2026-07-20
**Branch:** `fact-check/article-question-remediation` (no commits, no push)

## Article Stated Scope

PD 1096 Rule VII Sec. 708 (Group A dwellings — lot occupancy, setback, sanitation, foundation, stairs) and Rule VIII Sec. 805 through 811 (ceiling heights, room sizes, air space, window openings, vent shafts).

## Finding

Of 36 linked questions, 36 already had `question-edits/<uuid>.json` files from the prior `codex-local-source-audit-batch-010` run. 12 of those edits were metadata-only (refreshed citation/explanation but left `proposed.text` empty) for questions whose original text cited code sections **outside Sec. 708 / Sec. 805-811**. The pipeline would have applied the citation refresh while leaving the off-scope question text in place.

## Remediation (12 replacement edits)

All 12 files overwritten with full `proposed.text` blocks (action: replace). Each replacement targets a Sec. 708 or Sec. 805-811 sub-rule directly supported by the article.

| Question UUID | Original (off-scope) | Replacement (on-scope) |
| --- | --- | --- |
| 00023dd0-c56b-4979-b54d-4eaf49d9671a | Rule XII Sec. 1213.7 stage exits | Sec. 708 lot occupancy (90 % corner / 80 % inside) |
| 05a03094-bfc1-4a01-af40-ed2d38c56ef2 | Rule XIII Sec. 1302 boiler rooms | Sec. 805 ceiling height (2.70 m naturally ventilated / 2.40 m otherwise) |
| 82b49a21-bb6f-4f62-8895-3651c4854c24 | Sec. 1804 glass edges | Sec. 807 habitable-room size (6.00 sq.m / 2.00 m least dim) |
| 8d8d21b1-8b5b-4760-8b98-7c3a7b446ed9 | Rule XII Sec. 1211 chimney corbeling | Sec. 808 window area (10 % floor area, 1.00 sq.m min) |
| 663ffde0-a298-476c-9449-0fd20ef1fbce | Rule V Sec. 507(b) fire-resistivity types | Sec. 807 kitchen 3.00 sq.m / 1.50 m; bath 1.20 sq.m / 0.90 m |
| 66b2e342-bc30-497a-a124-62fe020df3b3 | Rule XII Sec. 1202.2.n trench exits | Sec. 708 setback (2.00 m from every line) |
| 98e59a2d-897a-42d9-b1ad-20e2aeec1e76 | Rule XI fence height | Sec. 708 foundation (250 mm thick, 600 mm below ground) |
| 22e9cc59-a3fa-4dc8-8d95-62cd6daa5f96 | Sec. 702 D→A-2 nightclub conversion | Sec. 708 stairs (750 mm width, 200 mm rise, 200 mm run) |
| 3fbc7504-56f0-47c9-8b3c-e5a24f9e65fc | Hospital Group D institutional classification | Sec. 807 air space (14 cu.m per person) |
| 7395181d-4df6-4392-bdf4-1c6662e074a5 | "PASTED" Rule I mnemonic | Sec. 708 wooden-post foundation (0.025 sq.m cross section) |
| a70cbae0-1017-40d1-ba7e-8c6c53e0f61f | Group A vs Group B 10-person threshold (Rule III) | Sec. 806 why area AND least-dimension both mandatory |
| e85fe73e-2c43-4e3b-9a73-fb550140f30e | "standardized lot types / TOSL" (Sec. 703 area table) | Sec. 808 window-opening destination (court/yard/public space/air shaft) |

## Validation

All 12 files pass `jq empty <file>`. Each contains `action: "replace"`, a `proposed.text`, `proposed.options` (4 options), `proposed.correct_option_id`, `proposed.rationale`, `proposed.explanation`, and `proposed.code_citation` pointing to PD 1096 Rule VII Sec. 708 or Rule VIII Sec. 805-811.

## Remaining 24 edits

Metadata-only edits for on-scope Sec. 708 / Sec. 805 / Sec. 806 / Sec. 807 / Sec. 808 / Sec. 809 / Sec. 811 questions (lot coverage percentages, ceiling-height descending scale, kitchen and bath/toilet dimensions, vent-shaft formula 0.10 sq.m per metre, air-space per occupant, sanitation trio). Spot-check confirms all 24 are correctly scoped and answer keys are internally consistent with the article body. Left in place; no further action required.
