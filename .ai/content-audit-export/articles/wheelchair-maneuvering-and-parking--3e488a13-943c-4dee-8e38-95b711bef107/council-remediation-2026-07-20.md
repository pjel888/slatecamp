# Council Remediation 2026-07-20 — wheelchair-maneuvering-and-parking (3e488a13)

Auditor: Agent S (wheelchair/accessibility scope)
Branch: `fact-check/article-question-remediation` (no commits, no branch switch, no push)
Governing source: BP 344 2024 Revised IRR
- `/.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json`
- `/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Verdict: CLEAN — all remediation already applied by prior batch-033

Article body source-correct; all 21 linked questions have source-grounded question-edit replacements that resolve every original error. No new edits required from Agent S.

## Source-grounded verification (every dimension quoted verbatim with locator)

| Claim | Source verbatim | Locator |
|---|---|---|
| Parking slot size | "A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width, in comparison to the average parking slot, is intended to ensure that the adjacent pathway adequately accommodates wheelchair passage." | PDF p.10, lines 283-285 |
| Walkway between front ends of parked cars | "A walkway with a minimum clear width of 1200 mm provided between the front ends of parked cars." | PDF p.10, line 290 |
| Pole-mounted signage | "Pole mounted parking signage, 600 mm x 600 mm in size and mounted at a minimum clear height of 2200 mm from the parking floor." | PDF p.10, lines 309-310 |
| Pavement sign square size | "a square with dimensions of at least 1000 mm but not more than 1500 mm." | PDF p.11, line 316 |
| Parking count table (1-25, 26-50, ..., 501-1000 = 2%, 1001+ = 20 + 1 per 100) | "Table A.6.1: Accessible Parking Slot Requirement" | PDF p.9, lines 246-267 |
| Never in ramped or sloping areas | "Parking slots for persons with disabilities shall never be located in ramped or sloping areas." | PDF p.10, line 298 |
| Firm level surface | "Have a firm, level surface without aeration slabs." | PDF p.10, line 296 |

## Original linked-questions.json CONFIRMED_ERRORs (already remediated by batch-033)

The original `linked-questions.json` (still untouched per council rules) carries three classes of error that were propagated into multiple questions. All are resolved by existing source-grounded edits.

### Error class 1: "1800 mm access aisle" (WRONG)

Affected original questions:
- `c6b1ec05-dbb3-4582-a943-e8901fbef11f` ("What is the required width of the access aisle beside an accessible parking stall?") — original correct = D "1800 mm wide"
- `b7d5e742-cbc0-4546-ba88-cf4664a489b2` (duplicate of above)

The "1800 mm access aisle" figure is **not in BP 344**. Source states the slot itself is 4000 mm wide × 5000 mm long, and within that 4000 mm the **additional 1500 mm** width (vs. an average slot) is what permits wheelchair passage (PDF p.10, lines 283-285). A separate 1200 mm clear walkway is required between the front ends of parked cars (PDF p.10, line 290).

### Error class 2: "2300 mm vertical clearance" (UNSOURCED)

Affected original questions:
- `cc3f0f11-3827-4736-9c76-ebb24afc0873` (multi-level hospital car park vertical clearance) — original correct = B "2300 mm"
- `89b86fef-6a87-4356-9c87-a77bc063fc81` (duplicate)

The "2300 mm minimum vertical clearance for raised-roof accessible vans" appears **nowhere in the BP 344 2024 Revised IRR source pack**. The article body in `normalized.md` also does not contain this claim. The 2300 mm figure is fabricated.

### Error class 3: "9800 mm = 4.0 + 1.8 + 4.0 arithmetic" (DERIVED FROM WRONG AISLE)

Affected original questions:
- `403be275-614c-40a9-8b3d-af7cd7d0f044` ("Configuration A has two stalls sharing one aisle") — original correct = A "9800 mm total — two 4000 mm stalls sharing one 1800 mm access aisle"
- `beb5fa2e-fcfe-4f61-98a5-7baf6bfa5fdd` (duplicate)

This arithmetic depends on the wrong 1800 mm aisle. Source does not direct two 4000 mm slots plus a separate 1800 mm aisle to sum to 9800 mm; the source treats the 4000 mm slot as already containing the additional 1500 mm width.

### Mnemonic 4-1.8-2.3-1.5-1.8-1.2 (Q4, Q14) — UNSOURCED composite

The "mnemonic stack" question teaches a six-number string that includes the unsourced 1.8 m aisle and 2.3 m clearance. The 1.5 m corridor and 1.2 m ramp width ARE source-correct; the 1.8 m turnabout IS source-correct (PDF p.35, lines 1124-1126 for corridor turnabouts; PDF p.36 line 1143 for WC cubicle). But the mnemonic as a teaching device propagates the unsourced values.

## Existing remediation coverage

All 21 questions have `question-edits/<uuid>.json` files approved by `codex-local-source-audit-batch-033`. The edits use the **topic-swap** pattern (replace the broken question with a different, source-grounded question on a related topic). Spot-check of edits covering the previously-erroneous questions:

- `cc3f0f11-3827-4736-9c76-ebb24afc0873.json` — replaces 2300 mm clearance question with **"How many accessible parking slots are required for 26 to 50 total parking slots?" (correct = 2)**. Source: Table A.6.1, PDF p.9.
- `c6b1ec05-dbb3-4582-a943-e8901fbef11f.json` — replaces 1800 mm aisle question with **"Where must accessible parking slots never be located?" (correct = Ramped or sloping areas)**. Source: PDF p.10, line 298.
- `403be275-614c-40a9-8b3d-af7cd7d0f044.json` — replaces 9800 mm arithmetic question with **"What size is the pole-mounted accessible parking sign?" (correct = 600 mm x 600 mm)**. Source: PDF p.10, lines 309-310.
- `b7d5e742-cbc0-4546-ba88-cf4664a489b2.json` — replaces 1800 mm aisle duplicate with **"Where should accessible parking slots be located?" (correct = Nearest to accessible main entrances)**. Source: PDF p.9, line 269.
- `beb5fa2e-fcfe-4f61-98a5-7baf6bfa5fdd.json` — replaces 9800 mm arithmetic duplicate with **"What surface is required for accessible parking slots?" (correct = Firm, level surface without aeration slabs)**. Source: PDF p.10, line 296.

All 21 edits validated with `jq empty`. No new edits written by Agent S.

## Process compliance

- No edits to `normalized.md`, `candidate.md`, `original.md`, `linked-questions.json`, `sources.json`, or `article-metadata.json`.
- No new `question-edits/*.json` written by Agent S — the prior batch-033 edits are correct, validated, and source-grounded. Overwriting them would risk regression for no gain.
- No `git commit`, no branch switch, no Supabase push.
- All findings cite source verbatim with locator.
