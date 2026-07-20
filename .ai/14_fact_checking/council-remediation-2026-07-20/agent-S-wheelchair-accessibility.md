# Agent S - Wheelchair/Accessibility Council Audit (Consolidated Report)

Audit date: 2026-07-20
Auditor: Agent S (wheelchair/accessibility scope — Council Group B Access subset)
Status: COMPLETE — no commits, no branch switch, no Supabase writes; only remediation-record files written
Branch: `fact-check/article-question-remediation` (unchanged)

## Scope

4 wheelchair/accessibility article bundles in `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/`:

1. `wheelchair-maneuvering-and-parking--3e488a13-943c-4dee-8e38-95b711bef107`
2. `wheelchair-maneuvering-and-parking-slots--1a02a1a5-27e5-4a26-85d2-fceac4433edc`
3. `widths-slopes--184a1593-2137-45ee-80d4-99c1c4595e84`
4. `public-service-counters-and-atms--3c69e570-a75c-4168-ad09-914e2c1062f9`

GOVERNING SOURCE (authoritative ground truth):
- Source pack chunks: `/Users/philiplewis/slatecamp/.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json` (chunk-0001 PDF p.2 ramps; chunk-0002 PDF p.7 handrails/parking)
- Supplementary verbatim text: `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Summary table

| Bundle | Questions | Question-edits on disk | New CONFIRMED_ERROR (this audit) | Article body | Status |
|---|---|---|---|---|---|
| wheelchair-maneuvering-and-parking (3e488a13) | 21 | 21 (batch-033) | 0 new — 3 prior error classes already remediated | CLEAN | CLEAN — no new edits |
| wheelchair-maneuvering-and-parking-slots (1a02a1a5) | 21 | 21 (batch-042) | 0 | CLEAN | CLEAN — no new edits |
| widths-slopes (184a1593) | 21 | 21 (batch-042) | 0 | CLEAN | CLEAN — no new edits |
| public-service-counters-and-atms (3c69e570) | 19 | 19 (batch-042) | 0 | CLEAN | CLEAN — no new edits |
| **TOTAL** | **82** | **82 (100% coverage)** | **0 new** | **All CLEAN** | **No new edits written** |

## Overall verdict

All 4 bundles are CLEAN at the article-body level and have 100% question-edit coverage from prior batch-033 / batch-042 runs. **No new question-edit files were required from Agent S** — overwriting the existing source-grounded, validated edits would risk regression for no gain.

The previously-confirmed errors identified in bundle 1 (`wheelchair-maneuvering-and-parking--3e488a13`) by inspection of the untouched `linked-questions.json` are fully resolved by the existing batch-033 question-edits (topic-swap pattern: each broken question is replaced by a different source-grounded question on a related topic).

## Verification approach

1. Read both governing source files (chunks.generated.json + supplementary text). Confirmed verbatim every dimension listed in the assignment brief:
   - Wheelchair turning space: 1800 × 1800 mm (PDF p.35 line 1124; PDF p.36 line 1143 WC cubicle; PDF p.37 line 1171 outside WC cubicle).
   - Wheelchair parking slot: 4000 mm × 5000 mm; the 1500 mm additional width forms the access aisle (PDF p.10 lines 283-285).
   - Ramp gradient: 1:20 standard (Table A.1.1, PDF p.2); 1:15 special case (max 10.50 m run, 700 mm rise).
   - Ramp width: 1200 mm minimum clear (PDF p.2 line 13).
   - Handrail heights: 700 mm and 900 mm AFF (PDF p.2 line 29; PDF p.7 line 202).
   - Service counter lower level 750 mm, higher level 950-1100 mm; 700 mm legroom; 480 mm depth; 1500 × 1500 mm approach; 900 mm min counter width (PDF p.48-49, lines 1543-1560).
   - ATM clear space 1800 × 1800 mm; ATM counter 750 mm; ATM controls 900-1200 mm AFF (PDF p.46-47).
2. Read all 4 `normalized.md` files and confirmed each article body is source-faithful (no fabricated numbers in any body).
3. Read all 4 `linked-questions.json` files and traced the marked-correct answer for every question.
4. Read all 82 existing `question-edits/*.json` files to confirm source-grounded replacements.
5. Validated all 82 JSON files with `jq empty` — 0 invalid.

## Findings — bundle 1 CONFIRMED_ERROR classes (already remediated, recorded for traceability)

The `linked-questions.json` of bundle 1 (still untouched per council rules) carries three error classes that were propagated across duplicate question pairs. All are resolved by the existing batch-033 edits.

### 1. "1800 mm access aisle" (UNSOURCED — fabricated)

- Source verbatim (PDF p.10 lines 283-285): "A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width, in comparison to the average parking slot, is intended to ensure that the adjacent pathway adequately accommodates wheelchair passage."
- The source treats the 4000 mm slot width as already including the 1500 mm additional width. A separate 1200 mm clear walkway is required between the front ends of parked cars (PDF p.10 line 290). The "1800 mm access aisle" as a standalone dimension beside the slot does not exist in BP 344.
- Original questions affected: `c6b1ec05` and `b7d5e742` (duplicate pair). Original correct = D "1800 mm wide".
- Remediation already applied: `c6b1ec05` → "Where must accessible parking slots never be located? (Ramped or sloping areas)"; `b7d5e742` → "Where should accessible parking slots be located? (Nearest to accessible main entrances)".

### 2. "2300 mm vertical clearance for raised-roof vans" (UNSOURCED — fabricated)

- The 2300 mm figure appears nowhere in the BP 344 2024 Revised IRR source pack. The article body in `normalized.md` also does not contain this claim. (The 2200 mm clear height IS source-correct — but only for pole-mounted signage height, PDF p.10 line 310 — not for vehicle clearance.)
- Original questions affected: `cc3f0f11` and `89b86fef` (duplicate pair). Original correct = B "2300 mm minimum vertical clearance".
- Remediation already applied: `cc3f0f11` → "How many accessible parking slots are required for 26 to 50 total parking slots? (2)"; `89b86fef` → "How many accessible parking slots are required for 1 to 25 total parking slots? (1)".

### 3. "9800 mm = 4.0 + 1.8 + 4.0 arithmetic" (DERIVED FROM WRONG AISLE)

- This arithmetic depends on the fabricated 1800 mm aisle. Source does not direct two 4000 mm slots plus a separate 1800 mm aisle to sum to 9800 mm.
- Original questions affected: `403be275` and `beb5fa2e` (duplicate pair). Original correct = A "9800 mm total".
- Remediation already applied: `403be275` → "What size is the pole-mounted accessible parking sign? (600 mm x 600 mm)"; `beb5fa2e` → "What surface is required for accessible parking slots? (Firm, level surface without aeration slabs)".

### 4. "Mnemonic stack 4-1.8-2.3-1.5-1.8-1.2" (PARTIALLY UNSOURCED composite)

- Questions `4be787cf` and `75816d26` teach a six-number mnemonic that includes the unsourced 1.8 m aisle and 2.3 m clearance. The 1.5 m corridor, 1.8 m turnabout, and 1.2 m ramp width ARE source-correct.
- Remediation already applied: `4be787cf` → "What must accessible parking slots allow a person to do? (Transfer from a vehicle to a wheelchair)"; `75816d26` → "What rule applies for 501 to 1000 total parking spaces? (2% of total parking spaces)".

## Findings — bundles 2, 3, 4

All original `linked-questions.json` answers verified source-correct. No new errors found.

Notable source-grounded confirmations:

- **Bundle 2** (wheelchair-maneuvering-and-parking-slots): parking slot 4000 × 5000 mm; corridor 1500 mm; turnabout 1800 × 1800 mm @ 12000 mm; dead-end corridor turnabout within 3500 mm; two-wheelchair passing 1800 mm; curb ramp 900 mm wide / 1:15 max at loading bays; cross-gradient 1:100; handrail 700/900 mm + 300 mm extension.
- **Bundle 3** (widths-slopes): ramp width 1200 mm; ramp slope Table A.1.1 (1:20 preferred, 1:15 special case 10.50 m / 700 mm rise); landing 1800 mm at top/bottom/intermediate; raised edge 100 mm; handrail 700/900 mm + 300 mm extension; handrail required when change in grade > 170 mm (CONFIRMED — consistent with Agent C's tracker reversal); protection railing 1100 mm at > 750 mm above grade; sidewalk 1:20 longitudinal / 1:100 cross; curb ramp 900 mm / 1:15 at loading bays.
- **Bundle 4** (public-service-counters-and-atms): ATM clear 1800 × 1800 mm; ATM counter 750 mm; ATM controls 900-1200 mm AFF; ATM under-counter depth ~480 mm; ATM signage ≤ 2.4 m; service counter two-level universal design, lower 750 mm / higher 950-1100 mm; 700 mm legroom; 480 mm depth; 1500 × 1500 mm approach; 900 mm min counter width; hearing enhancement at counters; interphone/call button at kiosks.

## Cross-cutting observations

### 1. Source dimension alignment with assignment brief — 100% confirmed

Every dimension flagged in the assignment brief is verbatim in the BP 344 2024 Revised IRR source pack or supplementary text. No contradictions found.

### 2. Topic-swap edit pattern is acceptable for accessibility-code content

Bundles 1, 2, 3, 4 use the topic-swap pattern (replace broken question with a different source-grounded question on a related topic) rather than the in-place numeric-fix pattern used by Agent H in `translating-pwd-rights`. Both patterns are valid. For bundle 1, topic-swap was the right choice because the original questions were built around fabricated composite concepts (1800 mm aisle, 2300 mm clearance, 9800 mm arithmetic) — there was no source-grounded number to swap in without dismantling the question.

### 3. Duplicate question pairs are systemic

Each bundle's `linked-questions.json` contains pairs of near-identical questions generated from the same template. Both halves of each pair must be remediated together. All 4 bundles have full duplicate-pair coverage in their `question-edits/` directories.

### 4. Article bodies in all 4 bundles are CLEAN

Unlike the `translating-pwd-rights` bundle (where the article body had to be edited), all 4 article bodies in this scope were already source-faithful. No `normalized.md` or `candidate.md` edits were needed.

## Files created by Agent S

5 new files, all remediation-record markdown (no JSON, no primary content):

1. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/wheelchair-maneuvering-and-parking--3e488a13-943c-4dee-8e38-95b711bef107/council-remediation-2026-07-20.md`
2. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/wheelchair-maneuvering-and-parking-slots--1a02a1a5-27e5-4a26-85d2-fceac4433edc/council-remediation-2026-07-20.md`
3. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/widths-slopes--184a1593-2137-45ee-80d4-99c1c4595e84/council-remediation-2026-07-20.md`
4. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/public-service-counters-and-atms--3c69e570-a75c-4168-ad09-914e2c1062f9/council-remediation-2026-07-20.md`
5. `/Users/philiplewis/slatecamp/.ai/14_fact_checking/council-remediation-2026-07-20/agent-S-wheelchair-accessibility.md` (this file)

No question-edit JSON files written. No primary content (`normalized.md`, `candidate.md`, `original.md`, `linked-questions.json`, `sources.json`, `article-metadata.json`) modified in any bundle.

## Process compliance

- No `git commit`, no branch switch, no Supabase push.
- All findings cite source verbatim with PDF page and line locator.
- No invented citations.
- Did not touch Agent A's scope (question-level error-propagation flags outside these 4 bundles).
- Did not touch Agent C's 9-bundle scope or Agent H's applied remediation in `translating-pwd-rights`.
- All 82 existing question-edit JSON files in scope re-validated with `jq empty` — 0 invalid.

## Verbatim source quotes used as ground truth

All locator references are to the supplementary text file unless noted:

- PDF p.2 line 13 (chunk-0001): "Minimum clear width of 1200 mm" (ramp).
- PDF p.2 line 24 (chunk-0001): "Accessible ramps with a total length longer than 10.50m shall be provided with intermediate landings with a minimum length of 1800 mm."
- PDF p.2 line 28 (chunk-0001): "Level area not less than 1800 mm at the upper end and lower end of any ramp."
- PDF p.2 line 29 (chunk-0001): "Handrails on both sides of the ramp at 700 mm and 900 mm from the finished floor of the ramp to the top of the handrails."
- PDF p.2 line 31 (chunk-0001): "Raised edge on both sides of the ramp with a minimum height of 100 mm."
- PDF p.2 Table A.1.1 (chunk-0001): "1:20 – – 15m / 1:15 10.50m 700mm 10m".
- PDF p.7 line 79 (chunk-0002): "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm."
- PDF p.7 line 202: "Handrails shall be installed at 900 mm and 700 mm above ramps and stairs."
- PDF p.7 lines 205-206: "Railings for protection shall be installed at a height of 1100 mm minimum...more than 750 mm above adjacent grade."
- PDF p.7 line 207: "A 300 mm long horizontal extension of the handrail shall be provided before the start and after the end of the ramps and stairs".
- PDF p.10 lines 283-285: "A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width, in comparison to the average parking slot, is intended to ensure that the adjacent pathway adequately accommodates wheelchair passage."
- PDF p.10 line 290: "A walkway with a minimum clear width of 1200 mm provided between the front ends of parked cars."
- PDF p.10 line 296: "Have a firm, level surface without aeration slabs."
- PDF p.10 line 298: "Parking slots for persons with disabilities shall never be located in ramped or sloping areas."
- PDF p.10 lines 300-302: Multi-story parking next to accessible elevators.
- PDF p.10 lines 309-310: "Pole mounted parking signage, 600 mm x 600 mm in size and mounted at a minimum clear height of 2200 mm from the parking floor."
- PDF p.11 line 316: "a square with dimensions of at least 1000 mm but not more than 1500 mm."
- PDF p.21 line 786: "lessen the level/turning area of 1500 mm x 1500 mm. Curb ramps shall...".
- PDF p.24 line 831: "required for two (2) wheelchairs to pass, the minimum width shall be 1800 mm."
- PDF p.25 lines 847-848: "clear dimension of 1800 mm and shall be spaced at a maximum distance of 12000 mm between rest".
- PDF p.35 lines 1122-1124: "Corridors shall have minimum clear width of 1500 mm to allow a wheelchair user and a person without disabilities to pass."
- PDF p.35 lines 1124-1126: "Turnabout spaces shall be provided for wheelchairs to turn around; these spaces shall have a minimum dimension of 1800 mm x 1800 mm and shall be spaced at a maximum of 12000 mm."
- PDF p.35 line 1127: "Turnabout spaces shall also be provided at or within 3500 mm of every dead-end corridor."
- PDF p.36 line 1143: "A minimum area of 1800 mm x 1800 mm" (WC cubicle).
- PDF p.46 lines 1494-1497: ATM/kiosk Braille/tactile/audio accessibility.
- PDF p.46 lines 1499-1500: "The height of controls, buttons, bill dispensers, card slots shall be from 900 to 1200 mm."
- PDF p.46 line 1477: "Provide a minimum clear unobstructed space of 1800 mm x 1800 mm in front of ATMs."
- PDF p.47 line 1502: "operable without requiring tight grasping, pinching, or twisting of the wrist".
- PDF p.47 lines 1505-1507: "Counters shall be provided in the kiosks, ATMs, and ticket machines at a height of 750 mm...the space under the counter shall have a minimum depth of about 480 mm."
- PDF p.47 lines 1512-1513: ATM audio + visual instructions.
- PDF p.47 lines 1515-1516: "An interphone or call button for contacting station staff at times of emergency, breakdown, or inquiry shall be provided."
- PDF p.47 line 1521: "signage shall be easily visible and located at a height of no more than 2.4m above the floor."
- PDF p.48 lines 1543-1545: "All counters shall apply universal design. Two-level counters shall be provided in all customer service and ticketing offices, and information desks."
- PDF p.48 lines 1547-1549: "The lower level of the two-level counters shall have a height of 750 mm, and the higher level shall have a height of around 950 mm – 1100 mm."
- PDF p.48 line 1550: "Counters shall have a 700 mm minimum vertical legroom space and shall have a counter depth of 480 mm."
- PDF p.48 line 1553: "The clear floor area for a forward approach to a counter or table or a side approach is 1500 x 1500 mm."
- PDF p.49 lines 1559-1560: "Each counter shall be at least 900 mm wide to provide ample space for people using wheelchairs or mobility aids."
- PDF p.49 line 1565: "Hearing Enhancement Systems shall be provided at all customer service and ticket counters".

## Recommended orchestrator follow-up

1. None required for content correctness — all 4 bundles are source-faithful and have full question-edit coverage.
2. Optional: when applying the question-edits downstream, ensure both halves of each duplicate pair in `linked-questions.json` are updated together to avoid drift.
3. Optional: deprecate the "mnemonic stack" teaching device for parking (it embeds unsourced values); bundle 1's edits already route around this by swapping to source-grounded questions, but the original mnemonic should not be reintroduced in any future regeneration.
