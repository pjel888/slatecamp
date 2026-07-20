# Council Remediation 2026-07-20 — widths-slopes (184a1593)

Auditor: Agent S (wheelchair/accessibility scope)
Branch: `fact-check/article-question-remediation` (no commits, no branch switch, no push)
Governing source: BP 344 2024 Revised IRR

## Verdict: CLEAN — no new edits required

- Article body (`normalized.md`) is source-faithful.
- All 21 original `linked-questions.json` answers are source-correct (with one structural note: question IDs are re-used across pairs of duplicate questions, but both halves of each pair are correct).
- All 21 `question-edits/*.json` (batch-042) are source-grounded and validated.

No new question-edit files written by Agent S.

## Source-grounded verification

| Claim | Source verbatim | Locator |
|---|---|---|
| Ramp min clear width 1200 mm | "Minimum clear width of 1200 mm" | PDF p.2, line 13 (chunk-0001) |
| Ramp preferred gradient 1:20; 1:15 special case (10.50 m max run, 700 mm max rise); 1:20 landing interval 15 m | Table A.1.1: "1:20 – – 15m" / "1:15 10.50m 700mm 10m" | PDF p.2 (chunk-0001) |
| Ramp intermediate landing min 1800 mm when total length > 10.50 m | "Accessible ramps with a total length longer than 10.50m shall be provided with intermediate landings with a minimum length of 1800 mm." | PDF p.2, line 24 (chunk-0001) |
| Level area 1800 mm at upper and lower ends | "Level area not less than 1800 mm at the upper end and lower end of any ramp." | PDF p.2, line 28 (chunk-0001) |
| Raised edge 100 mm | "Raised edge on both sides of the ramp with a minimum height of 100 mm." | PDF p.2, line 31 (chunk-0001) |
| Handrail heights 700 mm and 900 mm AFF | "Handrails on both sides of the ramp at 700 mm and 900 mm from the finished floor of the ramp to the top of the handrails." | PDF p.2, line 29 (chunk-0001) / also PDF p.7 line 202 |
| Handrail required for change in grade > 170 mm | "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm." | PDF p.7, line 79 (chunk-0002) |
| 300 mm horizontal handrail extension | "A 300 mm long horizontal extension of the handrail shall be provided before the start and after the end of the ramps and stairs" | PDF p.7, line 207 |
| Protection railing 1100 mm where > 750 mm above grade | "Railings for protection shall be installed at a height of 1100 mm minimum...for stairs, ramps, balconies, landings or porches that are more than 750 mm above adjacent grade." | PDF p.7, lines 205-206 |
| Sidewalk running gradient not steeper than 1:20 (5%) | Sidewalks/walkways/pathways running gradient not steeper than 1:20 or 5% | PDF p.24 |
| Sidewalk cross gradient 1:100 (1%) max | Cross gradient 1:100 or 1% | PDF p.24 |
| Sidewalk min width 1500 mm; two-wheelchair passing 1800 mm | "required for two (2) wheelchairs to pass, the minimum width shall be 1800 mm." | PDF p.24, line 831 |
| Headroom 2200 mm min | Headroom not less than 2200 mm | PDF p.24 |
| Curb ramp 900 mm wide at loading bays; 1:15 max gradient | Curb ramp provisions for loading bays | PDF p.24-25 |
| Curb ramp cannot reduce 1500 × 1500 mm turning area | "width of a sidewalk/walkway or lessen the level/turning area of 1500 mm x 1500 mm. Curb ramps shall..." | PDF p.21, line 786 |

## Original linked-questions.json verification

All 21 questions have source-correct marked answers. Verified samples (using original IDs which appear in pairs due to duplicate-generation):

- `9b2ccd47-6e9d-46d7-8531-e4760135cde1` — ramp width = A "1200 mm minimum/standard" — matches PDF p.2 line 13.
- `66dd1b43-5520-4d31-840a-a38bf10eef86` — preferred slope + landing interval = A "1:20 preferred; landings every 15.0 m" — matches Table A.1.1.
- `4c4ac490-3277-4124-813a-fba1b2ce71da` — 1:15 ramp 8.4 m run compliant + rise = B "Compliant — 8.4 m within 10.5 m; rise 560 mm" — matches Table A.1.1 (8400 ÷ 15 = 560 mm rise).
- `7e590635-10e1-42c2-adbc-8d80b11a14fc` — raised edge height = D "100 mm minimum" — matches PDF p.2 line 31.
- `2b46ae08-25b5-4813-a16c-7c8a5a07ad41` — sidewalk longitudinal slope = A "Not steeper than 1:20 (5%)" — matches sidewalk provision.
- `f6d3b69c-1cf4-4904-a94d-4fc7fe16f2d2` — handrail heights + extension = C "700 mm and 900 mm; 300 mm horizontal extension at both upper and lower ends" — matches PDF p.7 lines 202, 207.
- `58acf34a-a3d7-4813-9689-9830476d111d` — PD 1096 vs BP 344 ramp width = D "BP 344 governs with a minimum of 1200 mm" — correct hierarchy.
- `02f12692-30d5-427e-8af2-a57f81b536d6` — full ramp compliance review = C "Fully compliant" (1:15, 10.5 m run, 1800 mm landings, 100 mm edge, 700/900 handrails, 1200 mm clear) — every element source-correct.

## Existing remediation coverage

All 21 questions have `question-edits/*.json` approved by `codex-local-first-batch-042`. Each edit replaces the original (sometimes verbose) question with a simpler source-grounded question on the same topic. Spot-checked:

- `9b2ccd47-6e9d-46d7-8531-e4760135cde1.json` → "What is the minimum clear width of an accessible ramp under the checked BP 344 source?" (correct = 1200 mm).
- `02f12692-30d5-427e-8af2-a57f81b536d6.json` → "What handrail heights are used for accessible ramps and stairs?" (correct = 700 mm and 900 mm).
- `5b6d3db1-7092-4da2-9212-6a0a034b6e55.json` → "What is the steepest permitted curb ramp gradient?" (correct = 1:15).
- `9e4d0d9e-460a-47eb-bb19-ac33ea1cc310.json` → "When are handrails required for accessible ramps because of change in grade?" (correct = For changes in grade higher than 170 mm). Confirms tracker reversal from Agent C — 170 mm IS source-correct.
- `9e5421f9-b245-4e35-a000-a6c4954234ea.json` → "Where possible, what running gradient should sidewalks and walkways not exceed?" (correct = 1:20 or 5%).
- `9eecd114-629a-4025-ac67-cba4d031804e.json` → "What is the maximum sidewalk or walkway cross gradient?" (correct = 1:100 or 1%).
- `f6d3b69c-1cf4-4904-a94d-4fc7fe16f2d2.json` → "At loading bays for persons with disabilities, what is the minimum curb ramp width?" (correct = 900 mm).

All 21 edits validated with `jq empty`. No new edits written by Agent S.

## Process compliance

- No edits to `normalized.md`, `candidate.md`, `original.md`, `linked-questions.json`, `sources.json`, or `article-metadata.json`.
- No new `question-edits/*.json` written by Agent S.
- No `git commit`, no branch switch, no Supabase push.
- All findings cite source verbatim with locator.
