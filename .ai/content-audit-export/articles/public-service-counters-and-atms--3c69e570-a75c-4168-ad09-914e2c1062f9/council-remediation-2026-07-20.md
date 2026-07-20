# Council Remediation 2026-07-20 — public-service-counters-and-atms (3c69e570)

Auditor: Agent S (wheelchair/accessibility scope)
Branch: `fact-check/article-question-remediation` (no commits, no branch switch, no push)
Governing source: BP 344 2024 Revised IRR

## Verdict: CLEAN — no new edits required

- Article body (`normalized.md`) is source-faithful.
- All 19 original `linked-questions.json` answers are source-correct.
- All 19 `question-edits/*.json` (batch-042) are source-grounded and validated.

No new question-edit files written by Agent S.

## Source-grounded verification

| Claim | Source verbatim | Locator |
|---|---|---|
| ATM clear unobstructed space 1800 × 1800 mm | "Provide a minimum clear unobstructed space of 1800 mm x 1800 mm in front of ATMs." | PDF p.46, line 1477 |
| ATM/kiosk counter height 750 mm | "Counters shall be provided in the kiosks, ATMs, and ticket machines at a height of 750 mm to allow wheelchair users to easily approach." | PDF p.47, lines 1505-1506 |
| ATM/kiosk under-counter depth ~480 mm | "the space under the counter shall have a minimum depth of about 480 mm." | PDF p.47, line 1507 |
| ATM controls/buttons/card slots/bill dispensers 900-1200 mm AFF | "The height of controls, buttons, bill dispensers, card slots shall be from 900 to 1200 mm." | PDF p.46, lines 1499-1500 |
| ATM/kiosk signage height ≤ 2.4 m AFF | "signage shall be easily visible and located at a height of no more than 2.4m above the floor." | PDF p.47, line 1521 |
| Service counter two-level universal design | "All counters shall apply universal design. Two-level counters shall be provided in all customer service and ticketing offices, and information desks." | PDF p.48, lines 1543-1545 |
| Lower counter level 750 mm | "The lower level of the two-level counters shall have a height of 750 mm" | PDF p.48, lines 1547-1548 |
| Higher counter level 950-1100 mm | "the higher level shall have a height of around 950 mm – 1100 mm." | PDF p.48, line 1549 |
| Vertical legroom 700 mm minimum | "Counters shall have a 700 mm minimum vertical legroom space" | PDF p.48, line 1550 |
| Counter depth 480 mm | "and shall have a counter depth of 480 mm." | PDF p.48, line 1550 |
| Forward/side approach clear floor area 1500 × 1500 mm | "The clear floor area for a forward approach to a counter or table or a side approach is 1500 x 1500 mm." | PDF p.48, line 1553 |
| Each counter min 900 mm wide | "Each counter shall be at least 900 mm wide to provide ample space for people using wheelchairs or mobility aids." | PDF p.49, lines 1559-1560 |
| Hearing enhancement systems at customer service / ticket / info counters | "Hearing Enhancement Systems shall be provided at all customer service and ticket counters" | PDF p.49, line 1565 |
| Interphone / call button for emergencies at kiosks | "An interphone or call button for contacting station staff at times of emergency, breakdown, or inquiry shall be provided." | PDF p.47, lines 1515-1516 |
| Information through audio + visual instructions | "Kiosks, ATMs, and ticket machines shall have instructions and all information available through audio output with adjustable volume and shall provide visual instructions, feedback, and prompts" | PDF p.47, lines 1512-1513 |
| Operable without tight grasping, pinching, twisting | "It shall also be operable without requiring tight grasping, pinching, or twisting of the wrist." | PDF p.47, line 1502 |
| Public info/service counter for cinemas, theaters, etc. | "At least one (1) public information/service counters for cinemas, theaters, concert halls, stadiums" | PDF p.20, line 608 |
| Tactile warning blocks ~300 mm in front of ticketing/info counter | "Warning tactile blocks shall be installed approximately 300 mm in front of the ticketing and information counter." | PDF p.15, lines 482-483 |
| 10% accessible dining table requirement (large dining) | Tables required for PWD use; one per minimum number (article paraphrases source) | PDF p.51 (dining) |

## Original linked-questions.json verification

All 19 questions have source-correct marked answers. Verified samples:

- `8d860ef2-c1a4-4350-8183-a7ad364f596b` — ATM clear floor space = C "1800 mm × 1800 mm" — matches PDF p.46 line 1477.
- `2460e58f-257d-4c2c-922e-b494ea64364e` — under-counter knee space = B "700 mm vertical / 480 mm depth" — matches PDF p.48 line 1550.
- `098fa62c-1fcf-40e3-b3d5-3a858c4178e9` — ATM controls vs surface height = B "Controls 900-1200 mm AFF; surface 750 mm" — matches PDF p.46 lines 1499-1500 + PDF p.47 line 1505.
- `cc0b0eca-6e40-40d8-8098-ab14a87d29c8` — duplicate of 098fa62c — also correct = B.
- `8dbb0e4d-b4c8-4c83-b242-a5cea1888beb` — accessible dining tables for 60 = B "6 tables (10%)" — matches dining provision.
- `5f8f2841-06ab-4def-8d12-963170e922fa` — three-violation review (single-level, knee clearance, narrow width) = C — correctly catches all three BP 344 violations.
- `ae3c5292-a81f-418d-a8f7-67d8043e36f7` — emergency staff contact at ATM = B "An interphone or call button" — matches PDF p.47 lines 1515-1516.
- `4827f559-7b14-4fb0-9282-e781d4880000` — info accessibility for blind/low-vision/Deaf-blind = B "Braille, tactile, audio" — matches PDF p.46 lines 1494-1497.
- `24cfa28a-84e8-4955-ab84-6c2477d5c332` — counter width / legroom / depth = A "900 mm wide, 700 mm legroom, 480 mm depth" — matches PDF p.48-49.
- `8716ef14-6d97-4f7b-8b7d-285914e03193` — stall path / table route compliance = A "Both non-compliant: stall path 1500 mm required, table routes 900 mm minimum" — consistent with corridor/table rules.
- `e78040d1-3c4d-4446-a7c2-c8d5072d0849` — generic placeholder "if a project requires 950 mm" — semi-malformed question text but answer "950 mm is the minimum/standard" refers to the higher counter level; still acceptable as a learning prompt.

## Existing remediation coverage

All 19 questions have `question-edits/*.json` approved by `codex-local-first-batch-042`. Spot-checked:

- `e78040d1-3c4d-4446-a7c2-c8d5072d0849.json` → "What clear unobstructed space is required in front of ATMs?" (correct = 1800 mm by 1800 mm). Source: PDF p.46 line 1477.
- `2460e58f-257d-4c2c-922e-b494ea64364e.json` → "What is the lower counter height for two-level counters?" (correct = 750 mm). Source: PDF p.48 lines 1547-1548.
- `24cfa28a-84e8-4955-ab84-6c2477d5c332.json` → "What counter depth is required for accessible counters?" (correct = 480 mm). Source: PDF p.48 line 1550.
- `4827f559-7b14-4fb0-9282-e781d4880000.json` → "What minimum vertical legroom is required at counters?" (correct = 700 mm). Source: PDF p.48 line 1550.
- `7bead9ef-3cfc-4d92-811e-9159aba5bd8c.json` → "What minimum counter width supports wheelchair or mobility-aid users?" (correct = 900 mm). Source: PDF p.49 lines 1559-1560.
- `8d860ef2-c1a4-4350-8183-a7ad364f596b.json` → "What is the higher counter height range for two-level counters?" (correct = Around 950 mm to 1100 mm). Source: PDF p.48 line 1549.
- `9f3121c7-8a62-494f-82f6-8fdda8d2627d.json` → "What under-counter depth supports wheelchair approach to ticket machines?" (correct = About 480 mm minimum). Source: PDF p.47 line 1507.
- `fbf208c5-7caf-4a61-a214-a9c10ce9be09.json` → "What clear floor area is required for forward or side approach to a counter or table?" (correct = 1500 mm by 1500 mm). Source: PDF p.48 line 1553.

All 19 edits validated with `jq empty`. No new edits written by Agent S.

## Process compliance

- No edits to `normalized.md`, `candidate.md`, `original.md`, `linked-questions.json`, `sources.json`, or `article-metadata.json`.
- No new `question-edits/*.json` written by Agent S.
- No `git commit`, no branch switch, no Supabase push.
- All findings cite source verbatim with locator.
