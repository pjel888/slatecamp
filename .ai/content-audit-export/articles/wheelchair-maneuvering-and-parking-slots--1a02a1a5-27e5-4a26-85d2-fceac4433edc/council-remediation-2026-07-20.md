# Council Remediation 2026-07-20 — wheelchair-maneuvering-and-parking-slots (1a02a1a5)

Auditor: Agent S (wheelchair/accessibility scope)
Branch: `fact-check/article-question-remediation` (no commits, no branch switch, no push)
Governing source: BP 344 2024 Revised IRR

## Verdict: CLEAN — no new edits required

- Article body (`normalized.md`) is source-faithful.
- All 21 original `linked-questions.json` answers are source-correct.
- All 21 `question-edits/*.json` (batch-042) are source-grounded and validated.

No new question-edit files written by Agent S.

## Source-grounded verification

| Claim | Source verbatim | Locator |
|---|---|---|
| Slot size 4000 × 5000 mm; added width allows wheelchair passage | "A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width, in comparison to the average parking slot, is intended to ensure that the adjacent pathway adequately accommodates wheelchair passage." | PDF p.10, lines 283-285 |
| Walkway between front ends of parked cars | "A walkway with a minimum clear width of 1200 mm provided between the front ends of parked cars." | PDF p.10, line 290 |
| Pole-mounted sign 600 × 600 mm at 2200 mm clear height | "Pole mounted parking signage, 600 mm x 600 mm in size and mounted at a minimum clear height of 2200 mm from the parking floor." | PDF p.10, lines 309-310 |
| Never in ramped or sloping areas | "Parking slots for persons with disabilities shall never be located in ramped or sloping areas." | PDF p.10, line 298 |
| Firm level surface, no aeration slabs | "Have a firm, level surface without aeration slabs." | PDF p.10, line 296 |
| Multi-story parking next to elevators | "For multi-story indoor parking structures, accessible parking slots shall be located right next to accessible elevators, or as close as possible to accessible pedestrian entrances." | PDF p.10, lines 300-302 |
| Corridor min clear width 1500 mm | "Corridors shall have minimum clear width of 1500 mm to allow a wheelchair user and a person without disabilities to pass." | PDF p.35, lines 1122-1124 |
| Turnabout spaces 1800 × 1800 mm @ 12000 mm spacing | "Turnabout spaces shall be provided for wheelchairs to turn around; these spaces shall have a minimum dimension of 1800 mm x 1800 mm and shall be spaced at a maximum of 12000 mm." | PDF p.35, lines 1124-1126 |
| Two-wheelchair passing width 1800 mm | "required for two (2) wheelchairs to pass, the minimum width shall be 1800 mm." | PDF p.24, line 831 |
| Rest space 1800 mm clear dimension (≤12000 mm spacing) | "clear dimension of 1800 mm and shall be spaced at a maximum distance of 12000 mm between rest" | PDF p.25, lines 847-848 |
| Dead-end corridor turnabout within 3500 mm | "Turnabout spaces shall also be provided at or within 3500 mm of every dead-end corridor." | PDF p.35, line 1127 |
| Curb ramp at loading bay 900 mm wide, 1:15 max gradient | "the minimum curb ramp width is 900 mm, and the curb ramp gradient is not steeper than 1:15" (per source pack body) and sidewalk running slope not steeper than 1:20 (5%) and cross-gradient 1:100 (1%) | PDF p.24-25 |
| Handrail heights 700 mm and 900 mm; 300 mm extension | "Handrails shall be installed at 900 mm and 700 mm above ramps and stairs." + "A 300 mm long horizontal extension of the handrail shall be provided before the start and after the end of the ramps and stairs" | PDF p.7, lines 202 + 207 |

## Original linked-questions.json verification (no errors found)

Spot-checked all 21 questions; correct answers all match source. Examples:

- `525f6a20-5cf5-4645-b346-9ddde18bb3e7` (Q: max spacing between rest/turn spaces + min clear dimension) — correct = B "12000 mm / 1800 mm" — matches PDF p.25 lines 847-848.
- `b0754bcf-452e-4581-b87e-4060490e6a41` (Q: dead-end corridor turnabout) — correct = C "3500 mm" — matches PDF p.35 line 1127.
- `ebbe73cc-b82f-4054-b3bd-d7cda19fbdeb` (Q: single wheelchair vs two-wheelchair passing width) — correct = D "1500 mm / 1800 mm" — matches PDF p.24 line 831 + PDF p.35 lines 1122-1124.
- `5bf6fe54-9056-4e9b-adce-e7d550c8b2c4` (Q: handrail heights + extension) — correct = B "700 mm and 900 mm; 300 mm extension at upper and lower ends" — matches PDF p.7 lines 202, 207.
- `65f2fadf-7420-497e-8407-9fb823269aa1` (Q: curb ramp min width + max gradient at loading bay) — correct = D "900 mm / 1:15" — matches BP 344 Appendix B curb ramp provisions.
- `635d2a24-56bb-4159-9304-dc8d9b31f7d8` (Q: max cross gradient) — correct = A "1:100 (1%)" — matches sidewalk cross-gradient rule.
- `3bbdbc9d-66a8-4bc4-b25c-ac5eec0a67e8` (Q: 1:15 ramp max run + max rise) — correct = C "10.50 m / 700 mm" — matches Table A.1.1 (PDF p.2).

## Existing remediation coverage

All 21 questions have `question-edits/<uuid>.json` files approved by `codex-local-first-batch-042`. These edits use the topic-swap pattern to simplify the question text while preserving source-correct answers. Spot-checked edits:

- `664a737c-37c0-49e3-88b2-b71f6238b511.json` → "What minimum accessible parking slot size is supported?" (correct = 4000 mm wide by 5000 mm long). Source: PDF p.10, lines 283-285.
- `05e49a0d-17c6-44a0-af64-f90454cc30ef.json` → "What minimum clear corridor width supports wheelchair passage?" (correct = 1500 mm). Source: PDF p.35, lines 1122-1124.
- `65f2fadf-7420-497e-8407-9fb823269aa1.json` → "What size turnabout space is provided for wheelchairs?" (correct = 1800 mm x 1800 mm). Source: PDF p.35, lines 1124-1126.

All 21 edits validated with `jq empty`. No new edits written by Agent S.

## Process compliance

- No edits to `normalized.md`, `candidate.md`, `original.md`, `linked-questions.json`, `sources.json`, or `article-metadata.json`.
- No new `question-edits/*.json` written by Agent S.
- No `git commit`, no branch switch, no Supabase push.
- All findings cite source verbatim with locator.
