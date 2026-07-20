# Agent C - BP 344 / Accessibility Council Audit (Consolidated Report)

Audit date: 2026-07-20
Auditor: Agent C (BP 344 / accessibility scope)
Status: COMPLETE — no commits, no branch switch, no Supabase writes; only proposal files written

## Scope

9 BP 344 / accessibility article bundles located at:
`/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/`

GOVERNING SOURCE (authoritative ground truth):
- Source pack: `/Users/philiplewis/slatecamp/.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json`
- Supplementary verbatim text: `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Summary table

| Bundle | Questions | CONFIRMED_ERROR | SECTION_MISMATCH | UNSOURCED | Status |
|---|---|---|---|---|---|
| bp-344-accessible-washrooms (6d5e0e55) | 11 | 0 numeric (3 conceptual) | 1 (decimal secs) | 3 (lav depth, mirror tilt, 900/600 grab bars) | Article body clean; questions need grab-bar/lavatory/mirror/strobe cleanup |
| bp-344-elevator-dimensions (5f620c42) | 11 | 0 on core dimensions | 1 (decimal secs 8.7.c etc.) | 1 ("updated from 1100 mm") | Core dims CONFIRMED; cite cleanup needed |
| bp-344-ramp-slope-tiers (5a8ca807) | 10 | 0 (170 mm trigger CONFIRMED) | 1 (decimal secs) | 0 | CLEAN — prior tracker's "170 mm not in source" flag is itself an ERROR |
| bp-344-tactile-and-visual-alarms (5aeda107) | 11 | 0 numeric | 1 (granular subsecs) | 0 | CLEAN — values verified |
| bp-344-vs-pd-1096-conflicts (ee1f8beb) | n/a | 0 | 0 | 0 | Framework article; clean |
| accessible-seating-in-assembly-areas (571e1d4f) | 11 | 0 on numbers (3% / 900x1200 / 750 mm) | 1 (Appendix D should be Appendix E) | 2 (old IRR tiered table; 5% priority seat 18.2.b.iii) | Cite Appendix E not D; verify 5% rule |
| translating-pwd-rights (a7cb156f) | 21 | 3 (WC 1800x2250 wrong; WC seat 460 mm wrong; parking aisle 1800 mm wrong) | 1 (bare "Sec. N" needs Appendix letter) | 3 (1200 mm front walkway; 2250 mm; 460 mm) | Most errors of the 9 bundles |
| pedestrian-protection-during-construction (e6c2a686) | 32 | 0 (out of BP 344 scope — PD 1096 Rule XI) | 0 | 0 | Reassign to PD 1096 scope owner |
| transport-nodes-escalators-walkways (f6fe1a69) | 21 | 0 on escalator values | 0 | 3 (1500 mm transport elevator; 900 mm platform doors; respite areas) | Escalator values CONFIRMED; transport-elevator specifics need verification |

Total: 3 numeric CONFIRMED_ERROR (all in translating-pwd-rights), 6 SECTION_MISMATCH findings (mostly invented decimal citations), 12 UNSOURCED claims across the 9 bundles.

## Cross-cutting findings

### 1. Tracker reversal: 170 mm handrail trigger is CORRECT

The prior audit tracker flagged the "170 mm change in grade triggers handrail" claim in `bp-344-ramp-slope-tiers` as "not in source". That flag is itself an ERROR. The source verbatim states:

> "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm"

Source locator: chunks.generated.json chunk-0002 (PDF p.7); supplementary text around line 191. Q3 of that bundle should be marked CONFIRMED_CORRECT.

### 2. Systemic: invented decimal section citations

Every BP 344 bundle exhibits the same pattern: questions cite decimal subsection numbers (6.3.b, 8.7.c, A.7.11.viii, Sec. 4.2, Sec. 18.2.b.iii, Sec. 3.3.a) that do NOT exist in the source. The 2024 Revised IRR uses Appendix lettering (A, B, C, D, E) with simple numbered items (1, 2, 3, ...). The orchestrator should normalize all such citations to "Appendix X, Section Y, item N (topic)" form.

### 3. Systemic: wrong Appendix letter for assembly seating

`accessible-seating-in-assembly-areas` cites "Appendix D" throughout. The source places assembly seating under **Appendix E** (Auditoriums, Arenas, Theaters, and Other Assembly Areas — PDF p.64-65). This is a uniform Appendix-letter error across all 11 questions in that bundle.

### 4. WC cubicle dimension error (translating-pwd-rights)

The translating-pwd-rights bundle claims the accessible WC cubicle is "1800 x 2250 mm" with an outward-swinging door. The source verbatim states "A minimum area of 1800 mm x 1800 mm" (PDF p.36, line 1143). The 2250 mm depth is NOT in the source. The out-swinging door requirement IS supported (PDF p.37). Replace 2250 mm with 1800 mm.

### 5. WC seat height error (translating-pwd-rights)

The translating-pwd-rights bundle uses "WC seat height 460 mm" in grab-bar arithmetic. Source verbatim: "The height of toilet seat shall be 450 mm." (PDF p.37, line 1199). Replace 460 mm with 450 mm; the resulting grab bar AFF height becomes 750 mm, not 760 mm.

### 6. Accessible parking aisle dimension error (translating-pwd-rights + article body)

The article body claims "1200 mm clear walkway between the front ends of parked cars". The questions claim "1800 mm access aisle". Neither matches the source. Source verbatim (PDF p.7, lines 283-285): "A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width, in comparison to the average parking slot, is intended to ensure that the adjacent pathway adequately..." The 1500 mm additional width IS the access aisle.

### 7. Strobe flash rate — context matters

The source distinguishes:
- **Toilet compartment strobe**: "not more than 2 flashes per second" (PDF p.38, line 1260).
- **Hotel room visual warning system**: "no more than 3 flashes per second" + "not less than 2 candelas" + "clear or white translucent lens" (PDF p.52, lines 1671-1674).

Questions must use the correct flash rate for the correct context. The translating-pwd-rights strobe question uses the hotel-room figure (3 flashes/sec) which is correct IF the context is the hotel-room visual warning system.

### 8. Ramp slope 1:12 is UNSOURCED for accessible ramps

Confirmed across all ramp-related bundles: 1:12 slope appears ONLY for swimming pool transfer space approach (PDF p.61, line 1957). The accessible ramp standard is 1:20, with 1:15 as a special case (10.50 m max length, 700 mm max rise). Articles correctly reject 1:12 for accessible ramps.

### 9. Out-of-scope bundle

`pedestrian-protection-during-construction` is sourced from PD 1096 Rule XI, not BP 344. The article correctly self-identifies as PD 1096. Verifying its dimensions (1.20 m walkway, 1.00 m railing, 2.40 m fence, 2.40 m canopy clear height, 300 mm toe board, 650 kg/m2 live load) is the PD 1096 scope owner's responsibility, not Agent C's.

Additionally, that bundle contains off-topic questions (DT-CAR-SI Rule XV mnemonic, PH vs IBC construction type numbering, Rule IX storm-water prohibition) that may belong to other articles.

## Verbatim source quotes used as ground truth

All locator references are to the supplementary text file unless noted:
- `chunks.generated.json` chunk-0001 / chunk-0002: ramp and handrail rules (PDF p.2 and p.7).
- PDF p.7, line 202: "Handrails shall be installed at 900 mm and 700 mm above ramps and stairs."
- PDF p.7, lines 283-285: parking slot "4000 mm width, 5000 mm length, additional 1500 mm width".
- PDF p.14, line 338: signage "minimum luminance contrast of 30%".
- PDF p.14, line 433: tactile floor "minimum luminance contrast of 50%".
- PDF p.15, line 447: "Block Size 300mm x 300mm" for all tactile types.
- PDF p.18, line 493: stairs warning blocks "depth of 600 mm...300mm from the start and end".
- PDF p.36, line 1143: "A minimum area of 1800 mm x 1800 mm" (WC cubicle).
- PDF p.36, lines 1145-1154: L-type grab bar geometry + flip-up bar.
- PDF p.37, line 1199: "The height of toilet seat shall be 450 mm."
- PDF p.38, lines 1207-1209: lavatory "800 mm from the finished floor with a vertical clear leg room space not lower than 650 mm"; separate children's lavatory "550 mm...450 mm depth".
- PDF p.38, line 1252: emergency call button "400 mm to 600 mm from the finished floor".
- PDF p.38, line 1260: toilet strobe "not more than 2 flashes per second".
- PDF p.41-43 (lines 1340-1410): elevator car "1400 mm in depth and 1200 mm in width...clear door opening of not less than 900 mm".
- PDF p.45, lines 1421-1454: escalator specs (S800/804 mm tread, 30° inclination, 3 horizontal steps, 30 m/min, 30% luminance).
- PDF p.49, lines 1543-1550: two-level service counter "750 mm" lower level + "700 mm minimum vertical legroom" + "counter depth of 480 mm".
- PDF p.52, lines 1671-1674: visual warning system "not less than 2 candelas and...no more than 3 flashes per second".
- PDF p.61, lines 1957-1959: pool transfer space "1500 mm x 1500 mm minimum with a slope not steeper than 1:12".
- PDF p.64-65, lines 2062-2079: assembly seating "Three percent (3%)...900 mm x 1200 mm...Accessible routes shall not overlap wheelchair seating".
- PDF p.65: "Accessible seating shall be provided with handrails 750 mm high at the front and sides."

## Per-bundle remediation file locations

All remediation files written to `<bundle>/council-remediation-2026-07-20.md`:

1. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/bp-344-accessible-washrooms--6d5e0e55-215a-4806-a679-dac7aea5a99b/council-remediation-2026-07-20.md`
2. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/bp-344-elevator-dimensions--5f620c42-ef55-4c0e-824b-49f0ff9d47e6/council-remediation-2026-07-20.md`
3. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de/council-remediation-2026-07-20.md`
4. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/bp-344-tactile-and-visual-alarms--5aeda107-bc0d-4d0d-ab40-44e13fd95478/council-remediation-2026-07-20.md`
5. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/bp-344-vs-pd-1096-conflicts--ee1f8beb-e236-4831-a0a8-1ddce447a3b8/council-remediation-2026-07-20.md`
6. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/accessible-seating-in-assembly-areas--571e1d4f-999b-4cf9-a4de-3d35157314d2/council-remediation-2026-07-20.md`
7. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/council-remediation-2026-07-20.md`
8. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/pedestrian-protection-during-construction--e6c2a686-5b8c-477d-b5e4-d02bef987743/council-remediation-2026-07-20.md`
9. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/transport-nodes-escalators-walkways--f6fe1a69-b3c0-4c94-8341-9291c71c5006/council-remediation-2026-07-20.md`

## Process compliance

- No edits to `normalized.md`, `candidate.md`, `linked-questions.json`, `sources.json`, or `article-metadata.json` in any bundle.
- No `git commit`, no branch switch, no Supabase push.
- All findings cite source verbatim with locator.
- No invented citations.
- Did not touch Agent A's scope (lea-prac-* question-level error-propagation flags).
- Did not touch Agent B's scope (corpus-wide systematic typo remediation).

## Recommended orchestrator pass order

1. Apply the 3 numeric CONFIRMED_ERROR fixes in `translating-pwd-rights` (WC 1800x1800 not 1800x2250; WC seat 450 not 460; parking 1500 mm additional width not 1800 mm aisle).
2. Normalize Appendix letters in `accessible-seating` (D -> E) and qualify bare section numbers in `translating-pwd-rights` with Appendix letters.
3. Strip invented decimal subsection citations across all bundles (6.3.b, 8.7.c, A.7.11.viii, 4.2, 18.2.b.iii, 3.3.a).
4. Remove the prior tracker's incorrect "170 mm not in source" flag on `bp-344-ramp-slope-tiers` Q3.
5. Verify or remove UNSOURCED transport-elevator specifics (1500 mm width, 900 mm platform doors, respite areas) in `transport-nodes-escalators-walkways`.
6. Reassign `pedestrian-protection-during-construction` PD 1096 Rule XI verification to the PD 1096 scope owner.
7. Verify or remove the "5% priority seat 18.2.b.iii" claim and the "old IRR tiered table" comparison in `accessible-seating`.

---

## APPLIED section (Agent H remediation, 2026-07-20)

Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation` (no commits, no branch switch, no Supabase writes)
Governing sources used: `chunks.generated.json` (chunk-0001/0002) and `audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`. Every fix below quotes source verbatim with locator.

### Summary of changes

**7 `council-remediation-2026-07-20.md` files created** (one per in-scope bundle) recording APPLIED vs PROPOSAL status.

**7 content files modified** (6 question-edits + 1 linked-questions.json). No `original.md`, `normalized.md`, or `candidate.md` was edited (bundle 1's body was already correct; the other bundles' bodies had no Appendix-D citations).

### BUNDLE 1 — translating-pwd-rights (a7cb156f) — 3 CONFIRMED_ERROR fixes APPLIED

Discovery: `normalized.md`/`candidate.md` were ALREADY correct (no body edit needed). The wrong values lived in `linked-questions.json`. The pre-existing question-edit files (`codex-local-first-batch-040`) were topic-swap placeholders (each replaced the question with an unrelated question). Agent H overwrote them with proper fixes that preserve each question's topic and correct the numbers. All 6 affected questions are duplicate pairs in `linked-questions.json`.

Question-edit files OVERWRITTEN (corrected `proposed` content, `approved_by: agent-h-council-remediation-2026-07-20`):
1. `question-edits/48bf5609-ed86-4af4-8175-a7fffc7bf979.json` — WC cubicle 1800 x 2250 -> **1800 x 1800 mm**. Source: PDF p.36 line 1143 "A minimum area of 1800 mm x 1800 mm".
2. `question-edits/01c916d5-b8fe-43ce-8914-4e657d64288b.json` — same WC cubicle fix (duplicate pair).
3. `question-edits/d82b90b0-a1a7-45fc-b310-876900ca8c23.json` — WC seat 460 -> **450 mm**; grab bar 760 -> **750 mm**. Source: PDF p.37 line 1199 "The height of toilet seat shall be 450 mm." + PDF p.36 lines 1153-1154 "Both grab bars shall be installed 300 mm high from the top of the toilet seat".
4. `question-edits/64b033b2-4e43-42bc-80eb-23fef853fa2c.json` — same seat/grab-bar fix (duplicate pair).
5. `question-edits/c248fce5-53d2-4c78-ace5-d26bc40ae6e6.json` — parking access aisle 1800 mm -> **1500 mm additional width forms the aisle within the 4000 x 5000 mm slot**. Source: PDF p.7 lines 283-285.
6. `question-edits/59b07866-4510-4d33-b396-6aa60e484c77.json` — same parking-aisle fix (duplicate pair).

Section-cite cleanup also folded into these edits: bare "BP 344 Sec. 6" -> "BP 344 2024 Revised IRR, Appendix A/C (topic), item N (PDF p.X line Y)".

### BUNDLE 2 — accessible-seating-in-assembly-areas (571e1d4f) — Appendix D -> E APPLIED

Mechanical global replace on `linked-questions.json`: **24 occurrences** of "Appendix D" -> "Appendix E" (single `replace_all` Edit). Source: PDF p.64 line 2062 "Auditoriums, Arenas, Theaters, and Other Assembly Areas" (Appendix E). `normalized.md`/`candidate.md` had no Appendix D; `question-edits/` had none; `original.md` left untouched (4 Appendix D refs remain there as the export snapshot).

File modified: `accessible-seating-in-assembly-areas--571e1d4f-999b-4cf9-a4de-3d35157314d2/linked-questions.json`.

### BUNDLE 3 — bp-344-ramp-slope-tiers (5a8ca807) — NO FIX NEEDED, tracker reversal recorded

Verified CORRECT against BOTH authoritative sources: chunks.generated.json chunk-0002 (PDF p.7) and supplementary text line 196 both state verbatim "Handrails shall be required for accessible ramps for changes in grade higher than 170 mm." The prior tracker's "170 mm not in source" flag is itself an ERROR and is reversed. Question `0a31a28e` is correct. No file content modified; verification recorded in the bundle's council-remediation file.

### BUNDLES 4-7 — bp-344-accessible-washrooms / elevator-dimensions / tactile-and-visual-alarms / vs-pd-1096-conflicts — section-cite cleanup ALREADY APPLIED by prior batch-032

For all four bundles, Agent H found that the existing 11 question-edit files per bundle (`approved_by: codex-local-source-audit-batch-032`) had ALREADY removed the invented decimal subsection citations (6.3.b, 8.7.c, 8.9, 6.12, 1.2.a, etc.) and replaced them with source-grounded line-locator citations. Agent H verified `grep "Sec [0-9]\." question-edits/*.json` returns 0 matches in each bundle, and confirmed all numeric values are source-correct (elevator 1400x1200/900 door PDF p.41 lines 1339-1340; signage 30% line 338; tactile 50% line 433; block 300x300 line 447; WC 1800x1800 line 1143; seat 450 line 1199; lavatory 800 line 1208; call button 400-600 line 1252). No further edit applied — overwriting working, topically-aligned, numerically-correct edits would risk errors for no gain. Status recorded in each bundle's council-remediation file.

### Complete list of files modified/created by Agent H

Modified (7):
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/question-edits/48bf5609-ed86-4af4-8175-a7fffc7bf979.json`
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/question-edits/01c916d5-b8fe-43ce-8914-4e657d64288b.json`
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/question-edits/d82b90b0-a1a7-45fc-b310-876900ca8c23.json`
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/question-edits/64b033b2-4e43-42bc-80eb-23fef853fa2c.json`
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/question-edits/c248fce5-53d2-4c78-ace5-d26bc40ae6e6.json`
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/question-edits/59b07866-4510-4d33-b396-6aa60e484c77.json`
- `articles/accessible-seating-in-assembly-areas--571e1d4f-999b-4cf9-a4de-3d35157314d2/linked-questions.json`

Created (8):
- `articles/translating-pwd-rights--a7cb156f-be70-4ff4-9d9c-95a92a8052d3/council-remediation-2026-07-20.md`
- `articles/accessible-seating-in-assembly-areas--571e1d4f-999b-4cf9-a4de-3d35157314d2/council-remediation-2026-07-20.md`
- `articles/bp-344-ramp-slope-tiers--5a8ca807-31d5-4a32-933a-c6b83517c6de/council-remediation-2026-07-20.md`
- `articles/bp-344-accessible-washrooms--6d5e0e55-215a-4806-a679-dac7aea5a99b/council-remediation-2026-07-20.md`
- `articles/bp-344-elevator-dimensions--5f620c42-ef55-4c0e-824b-49f0ff9d47e6/council-remediation-2026-07-20.md`
- `articles/bp-344-tactile-and-visual-alarms--5aeda107-bc0d-4d0d-ab40-44e13fd95478/council-remediation-2026-07-20.md`
- `articles/bp-344-vs-pd-1096-conflicts--ee1f8beb-e236-4831-a0a8-1ddce447a3b8/council-remediation-2026-07-20.md`
- (this APPLIED section appended to `agent-C-bp344-accessibility-audit.md`)

### Validation

All 7 modified/created JSON artifacts pass `jq empty`. `grep "Sec [0-9]\." question-edits/*.json` returns 0 across bundles 4-7 (citations already clean). Bundle 2 `linked-questions.json` has 0 remaining "Appendix D" and 24 "Appendix E". No `original.md` touched in any bundle.

### Remains PROPOSAL (orchestrator follow-up, not applied by Agent H)

- Systemic decimal-subsection normalization (e.g., "Sec 4.2", "Sec 18.2.b.iii") in the `linked-questions.json` of bundles 2, 4, 5, 6, 7 — the proposed question-edits in bundles 4-7 already solve this for the proposed content, but the original `linked-questions.json` records still carry the invented decimals until the orchestrator applies the edits downstream.
- Agent C's UNSOURCED conceptual items (old-IRR tiered-table comparison; "5% priority seat 18.2.b.iii"; transport-elevator specifics in the out-of-scope transport bundle).
- Reassign `pedestrian-protection-during-construction` (PD 1096 Rule XI) to the PD 1096 scope owner.
