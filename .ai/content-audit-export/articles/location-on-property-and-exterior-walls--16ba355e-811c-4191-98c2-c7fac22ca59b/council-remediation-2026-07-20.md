# Council Remediation 2026-07-20 — Per-Bundle Report

**Bundle:** location-on-property-and-exterior-walls
**Bundle id:** `16ba355e-811c-4191-98c2-c7fac22ca59b`
**Agent:** R (code-standalone)
**Date:** 2026-07-20
**Branch:** `fact-check/article-question-remediation` (no commits, no push)

## Article Stated Scope

PD 1096 Rule VII Sec. 704 — building location, property-line measurement, eaves, exterior wall openings, projections, multiple buildings on one property. Rule VI Sec. 601-604 used only for fire-resistance vocabulary.

## Finding

Of 40 linked questions, 40 already had `question-edits/<uuid>.json` files from the prior `codex-local-source-audit-batch-008` run. 8 of those edits were metadata-only (refreshed citation/explanation but left `proposed.text` empty) for questions whose original text cited code sections **outside Sec. 704**. The pipeline would have applied the citation refresh while leaving the off-scope question text in place.

## Remediation (8 replacement edits)

All 8 files overwritten with full `proposed.text` blocks (action: replace). Each replacement targets a Sec. 704 sub-rule directly supported by the article.

| Question UUID | Original (off-scope) | Replacement (on-scope) |
| --- | --- | --- |
| 0e318c9c-3ef2-42fb-84c7-271cfbe75f8e | Rule XII Sec. 1211 metal hood | Sec. 704(1)(c) 750 mm eaves rule |
| 477e44ee-af37-4bd2-8477-c3fc8223f552 | Rule II Sec. 215 plumb-line rule | Sec. 704(1)(a) one-side public-space access rule |
| a7870827-248f-4086-9b36-b0031ca7a13d | Sec. 1607 skylight rule | Sec. 704 50 % protected openings per storey |
| b29f491f-da4c-480e-8cbb-4926b6c485fe | Sec. 1604 plastic-glazed travel distance | Sec. 704(1)(b) centerline convention |
| 4d9b4473-df46-4c60-9b1f-8066c00c04cd | Sec. 1604 plastic-glazed openings | Sec. 704 multiple-buildings-on-property rule |
| 4db48437-52d6-4194-9cd8-5f5a43832bee | Rule XVII Sec. 1704 exhaust duct | Sec. 704 one-third projection rule |
| f83a8c1d-c537-47c0-88ef-d90c6ac6cf66 | Rule VIII Sec. 808 (wrong section, 750 mm answer correct) | Citation-only fix to Sec. 704(1)(c); answer preserved |
| 0aa679c6-8f46-4ece-bad7-3f36d5a4a27f | "R-1 to R-5 lot abutment rules" (US zoning terminology that does not exist in PD 1096) | Sec. 704.4 zero-setback firewall rule |

## Validation

All 8 files pass `jq empty <file>`. Each contains `action: "replace"`, a `proposed.text`, `proposed.options` (4 options), `proposed.correct_option_id`, `proposed.rationale`, `proposed.explanation`, and `proposed.code_citation` pointing to PD 1096 Rule VII Sec. 704.

## Remaining 32 edits

Metadata-only edits for on-scope Sec. 704 questions (eaves distance, projection fraction, multiple buildings, centerline convention, opening percentages, imaginary property line). Spot-check confirms the cited sections match article scope and answer keys are internally consistent with the article body. Left in place; no further action required.
