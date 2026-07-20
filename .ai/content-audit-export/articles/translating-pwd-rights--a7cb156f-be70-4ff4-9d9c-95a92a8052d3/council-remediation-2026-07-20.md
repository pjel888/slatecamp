# Council Remediation — translating-pwd-rights (a7cb156f)

Remediation date: 2026-07-20
Applied by: Agent H (council-remediation-2026-07-20)
Branch: `fact-check/article-question-remediation`
Status: APPLIED (no commits, no branch switch, no Supabase writes)

## Governing source

- `/Users/philiplewis/slatecamp/.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json`
- `/Users/philiplewis/slatecamp/audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`

## Findings applied (status: APPLIED)

### Article body (`normalized.md` / `candidate.md`) — NO EDITS NEEDED
The article body is already correct. It states "1800 mm by 1800 mm" door maneuvering space and "4000 mm by 5000 mm" parking slot. The wrong values (1800 x 2250, 460 mm seat, 760 mm grab bar, 1800 mm access aisle) exist ONLY in `linked-questions.json` and `original.md`. `original.md` is the export snapshot and must not be touched. The wrong values were corrected via question-edit files.

### Question-edit files OVERWRITTEN (superseded batch-040 topic-swap placeholders)

The pre-existing question-edit files (approved_by `codex-local-first-batch-040`) were topic-swap placeholders that replaced each question with an UNRELATED question (e.g., the WC-cubicle question was replaced with a handrail-extension question; the parking question with a stairs question). Agent H overwrote them with proper fixes that preserve each question's topic and correct the numeric errors.

1. **WC cubicle 1800 x 2250 → 1800 x 1800** — APPLIED
   - Files: `question-edits/48bf5609-ed86-4af4-8175-a7fffc7bf979.json`, `question-edits/01c916d5-b8fe-43ce-8914-4e657d64288b.json`
   - Source verbatim (PDF p.36 line 1143): "A minimum area of 1800 mm x 1800 mm"
   - The 2250 mm depth is NOT in the source.

2. **WC seat 460 mm → 450 mm; grab bar 760 mm → 750 mm** — APPLIED
   - Files: `question-edits/d82b90b0-a1a7-45fc-b310-876900ca8c23.json`, `question-edits/64b033b2-4e43-42bc-80eb-23fef853fa2c.json`
   - Source verbatim (PDF p.37 line 1199): "The height of toilet seat shall be 450 mm."
   - Source verbatim (PDF p.36 lines 1153-1154): "Both grab bars shall be installed 300 mm high from the top of the toilet seat to the top of the grab bars."
   - Grab bar AFF = 450 + 300 = 750 mm.

3. **Parking access aisle 1800 mm → 1500 mm additional width** — APPLIED
   - Files: `question-edits/c248fce5-53d2-4c78-ace5-d26bc40ae6e6.json`, `question-edits/59b07866-4510-4d33-b396-6aa60e484c77.json`
   - Source verbatim (PDF p.7 lines 283-285): "A minimum width of 4000 mm and a length of 5000 mm. The additional 1500 mm width, in comparison to the average parking slot, is intended to ensure that the adjacent pathway adequately accommodates wheelchair passage."
   - Source verbatim (PDF p.7 line 286): "A walkway with a minimum clear width of 1200 mm provided between the front ends of parked cars."
   - The 1500 mm additional width IS the access aisle; a separate 1800 mm aisle is not in the source.

### Section-citation normalization — APPLIED (within the above edits)
Bare "BP 344 Sec. 6" citations in the corrected questions were normalized to "BP 344 2024 Revised IRR, Appendix A/C (topic), item N (PDF p.X line Y)" form.

## What remains a PROPOSAL (not applied by Agent H)

- The 3 numeric fixes above are fully applied as question-edit files. No further action required from Agent H.
- Downstream application (writing the corrected `proposed` content back into `linked-questions.json` / Supabase) is the orchestrator's responsibility, not Agent H's.
- Other UNSOURCED claims flagged by Agent C (1200 mm front walkway is actually source-supported per line 286; the strobe flash-rate question uses the hotel-room 3 flashes/sec figure which is correct for that context) require no change.

## Files modified by Agent H

- `question-edits/48bf5609-ed86-4af4-8175-a7fffc7bf979.json` (overwritten)
- `question-edits/01c916d5-b8fe-43ce-8914-4e657d64288b.json` (overwritten)
- `question-edits/d82b90b0-a1a7-45fc-b310-876900ca8c23.json` (overwritten)
- `question-edits/64b033b2-4e43-42bc-80eb-23fef853fa2c.json` (overwritten)
- `question-edits/c248fce5-53d2-4c78-ace5-d26bc40ae6e6.json` (overwritten)
- `question-edits/59b07866-4510-4d33-b396-6aa60e484c77.json` (overwritten)
- `council-remediation-2026-07-20.md` (this file, created)

`normalized.md`, `candidate.md`, `original.md`, and `linked-questions.json` were NOT edited by Agent H.
