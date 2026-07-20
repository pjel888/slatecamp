# Council Remediation - change-of-use-and-occupancy (PD 1096) - 2026-07-20

**Bundle:** change-of-use-and-occupancy--9e053410-cea0-400b-b185-576cbb4a8bd0
**Date:** 2026-07-20
**Agent:** I (question-edit remediation)
**Source authority:** PD 1096 2004 Revised IRR Rule III Sec. 308, 309, 309(c) (IRR 309.9); Rule VII Sec. 701-702

## Background

The article body was corrected in a prior session. Eleven linked questions in this bundle's baseline still reference "Certificate of Use" somewhere in their text/options/rationale. Of those, the baseline of all eleven treats "Certificate of Use" as either the correct concept or a fabricated distractor.

## Bundle-wide scan results

Agent I scanned all 39 linked questions and all 39 existing question-edit files for the "Certificate of Use" fabrication. Result:

- **39 of 39 existing question-edit files** already have `proposed.correct_option_id` pointing to an option whose text avoids endorsing "Certificate of Use." Zero files still propagate it as a correct concept.
- Eleven baseline questions mention "Certificate of Use" somewhere (the three Agent-A-flagged ones plus eight others: bf891ad7, 58d057b3, 680174d1, c7878ba7, 470ba6ed, afdb8cb6, 962cce8a, b945c913, 6a3632dc, 991995f4, c4221a89). Every one of these eleven already has an existing question-edit that removes or debunks the fabrication.

## Remediation action: NONE REQUIRED

| Question IDs | Status |
|---|---|
| bf891ad7, 58d057b3, 680174d1 (Agent-A edits) | APPLIED - verified consistent with PD 1096 Sec. 309 (Certificate of Occupancy, not Certificate of Use). Left as-is. |
| c7878ba7, 470ba6ed, afdb8cb6, 962cce8a, b945c913, 6a3632dc, 991995f4, c4221a89 (eight additional) | APPLIED - existing Batch-048 edits already rewrite each question so that no proposed correct option endorses "Certificate of Use." Left as-is. |

## Out-of-scope note (not remediated here)

The existing Batch-048 edits for this bundle contain malformed distractor placeholders (single letters such as "T", "h", "e", "N", "o", ".") and cross-topic rationale citations (e.g., fire-extinguisher sales). These are data-quality / Agent-B scope issues, NOT "Certificate of Use" errors. They are out of scope for this PD 1096 Sec. 309 remediation and were not modified.

**Status: APPLIED** (2026-07-20) - all eleven "Certificate of Use" baseline references are covered by existing question-edits that are consistent with PD 1096 Sec. 309.
