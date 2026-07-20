# Council Remediation — 2026-07-20

Bundle: `lea-prac-ctr-006-the-contractor-s-obligations-scope-compliance-standards-and-the-guarantee-period--367ef654-f42a-4eed-861d-b00648f5dba4`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source finding remediated

- **ERROR F2** (from Agent F, SPP / Professional Practice): question `378e89e5` (Q5) had `code_citation` = "UAP Doc 301" but the question tests Civil Code Article 1723 (15-year structural liability).

## Verification

- Civil Code Article 1723: engineers/architects/contractors are solidarily liable for 15 years for structural defects.
- UAP Doc 301 guarantee period: one-year Contractor's Guarantee (separate from the Article 1723 statutory liability).
- The answer (15 years) is correct and is retained; only the `code_citation` was wrong.

## Question-edit files written (status APPLIED)

| Question UUID | Error | Correction |
| --- | --- | --- |
| `378e89e5-9c56-4d6e-9d8d-cbc86f97af8e` | F2 / Q5 | `code_citation` changed from "UAP Doc 301" to "Civil Code Art 1723; UAP Doc 301 guarantee period." Answer (15 years) retained; original Article 1723 question restored (an earlier batch-108 edit had swapped it out). |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
