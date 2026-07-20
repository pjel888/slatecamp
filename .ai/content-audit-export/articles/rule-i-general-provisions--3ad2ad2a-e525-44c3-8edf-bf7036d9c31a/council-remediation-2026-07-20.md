# Council Remediation 2026-07-20 — Per-Bundle Report

**Bundle:** rule-i-general-provisions
**Bundle id:** `3ad2ad2a-e525-44c3-8edf-bf7036d9c31a`
**Agent:** R (code-standalone)
**Date:** 2026-07-20
**Branch:** `fact-check/article-question-remediation` (no commits, no push)

## Article Stated Scope

PD 1096 Rule I Sec. 101-106 — title (IRR of PD 1096), declaration of policy (minimum standards framework), scope and application (7 disciplines, BP 220 exception, legalization), general building requirements (continuing maintenance duty), site requirements (3 hazard categories), definitions (Addition, Alteration, Conversion, Renovation, Repair, Moving, Demolition, Building Official, OBO, Referral Codes).

## Finding

Of 30 linked questions, 30 already had `question-edits/<uuid>.json` files from the prior batch run. 3 of those edits were metadata-only (refreshed citation/explanation but left `proposed.text` empty) for questions whose original text cited code sections **outside Rule I**.

## Remediation (3 replacement edits)

All 3 files overwritten with full `proposed.text` blocks (action: replace).

| Question UUID | Original (off-scope) | Replacement (on-scope) |
| --- | --- | --- |
| bb02603a-d17b-43db-806f-51dd28233602 | Rule VIII Sec. 804 courts | Sec. 106 definition of Addition (enclosing terrace increases floor area → Addition, not Alteration) |
| c9874e0d-3fd2-41a5-b93a-6846af94904b | Rule VIII Sec. 808 window areas | Sec. 105 site safety three hazards (streams/water/air pollution, volcanic sites, fire/explosion-source buildings) |
| 09105dcb-65cc-4b6a-ac03-086f28052994 | Rule XV Sec. 1501 Safety Engineer | Sec. 102 minimum-standards framework (location, site, design, materials, construction, use, occupancy, maintenance) |

## Validation

All 3 files pass `jq empty <file>`. Each contains `action: "replace"`, a `proposed.text`, `proposed.options` (4 options), `proposed.correct_option_id`, `proposed.rationale`, `proposed.explanation`, and `proposed.code_citation` pointing to PD 1096 Rule I Sec. 102, 105, or 106.

## Remaining 27 edits

Metadata-only edits for on-scope Rule I questions (Sec. 103 legalization, Sec. 103 seven disciplines, Sec. 103 referral codes, Sec. 104 continuing maintenance, Sec. 105 site hazards, Sec. 106 Addition vs Alteration, Sec. 106 Conversion, Sec. 106 Renovation vs Repair, Sec. 106 OBO/Building Official, BP 220 exception). Spot-check confirms all 27 are correctly scoped and answer keys are internally consistent with the article body. Left in place; no further action required.
