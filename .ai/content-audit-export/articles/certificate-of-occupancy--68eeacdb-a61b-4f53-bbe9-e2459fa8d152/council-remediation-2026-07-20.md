# Council Remediation - certificate-of-occupancy (PD 1096 Sec 309) - 2026-07-20

**Bundle:** certificate-of-occupancy--68eeacdb-a61b-4f53-bbe9-e2459fa8d152
**Date:** 2026-07-20
**Agent:** I (question-edit remediation)
**Source authority:** PD 1096 2004 Revised IRR Rule III Sec. 308, 309, 309(c) (IRR 309.9)

## CONFIRMED_ERROR (2 questions)

| Question ID | Error | Status |
|---|---|---|
| `77d9898d-599e-45c0-9d7b-180d999b7075` | Invented a separate "Certificate of Use" document under PD 1096. PD 1096 has only one post-completion instrument - the Certificate of Occupancy (Sec. 309). Change-of-use triggers a fresh Certificate of Occupancy per Sec. 309(c). | APPLIED |
| `373ca9fc-4d31-47ac-a8bf-34310efdda68` | Same fabrication: invented "Certificate of Use" as a distinct PD 1096 instrument for changes of use. | APPLIED |

## Bundle-wide scan

A full scan of all 32 linked questions in this bundle confirmed that ONLY `77d9898d` and `373ca9fc` referenced "Certificate of Use" (in baseline text, options, or rationale). No other questions required remediation.

## Remediation

Both question-edit files were rewritten by Agent I (council-remediation-2026-07-20). The prior Batch 091 edits had refreshed only citation/explanation context and explicitly left the answer-key fields unchanged; the new edits supersede them by changing answer-key fields (text, options, correct_option_id, rationale).

**Question-edit files:**
- `question-edits/77d9898d-599e-45c0-9d7b-180d999b7075.json`
  - New question: "Under PD 1096, when an existing building undergoes a change of use ... what document does the Building Official issue to authorize the new use?"
  - `correct_option_id = "b"`: "A fresh Certificate of Occupancy is issued for the new use - PD 1096 recognizes only the Certificate of Occupancy, and Sec. 309(c) treats an approved change of use as triggering a new Certificate of Occupancy"
  - Rationale `correct` cites PD 1096 Sec. 309(c) / IRR 309.9.

- `question-edits/373ca9fc-4d31-47ac-a8bf-34310efdda68.json`
  - New question asks whether PD 1096 distinguishes a "Certificate of Occupancy" from a separate "Certificate of Use."
  - `correct_option_id = "b"`: "PD 1096 recognizes only the Certificate of Occupancy. Under Sec. 309(c) an approved change of use triggers issuance of a new Certificate of Occupancy; there is no separate 'Certificate of Use' instrument in the Code"
  - Rationale `correct` cites PD 1096 Sec. 309(c) / IRR 309.9.

JSON validation: both files pass `jq empty`.

**Status: APPLIED** (2026-07-20)
