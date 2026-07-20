# Council Remediation — 2026-07-20

Bundle: `lea-prac-cmp-007-mdpe-multipliers-overhead-profit-non-technical-factors-and-philippine-practice-rang--946e44ee-e4d7-452d-a00a-066bae0f273c`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source finding remediated

- **ERROR F1** (from Agent F, SPP / Professional Practice): six linked questions contradicted the article body, which correctly anchors MDPE to **SPP 202 Sec 5.2** (multiplier range **1.5-2.5 only**) and explicitly warns "Do not treat 2.8, 3.0, or 3.5 as source-backed MDPE multipliers." The six questions asserted values the article calls exam traps.

## Verification against article body and source

- Article body line 15: "SPP Document 202, Section 5.2 states that the MDPE multiplier ranges from 1.5 to 2.5."
- Article body line 18: "Do not treat 2.8, 3.0, or 3.5 as source-backed MDPE multipliers for this article."
- Source: PRBoA SPP 202 Sec 5.2 (https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.4-2010-SPP-for-PH-Architects.pdf).

## Question-edit files written (status APPLIED)

| Question UUID | Error | Correction |
| --- | --- | --- |
| `c345f793-1b09-4d19-9f2d-e045303bff54` | F1 / Q2 | marked-correct changed from "2.7-3.2" to "1.5-2.5 per SPP 202 Sec 5.2". |
| `e8d5bd9e-79ea-460b-9487-c2e0050fdd80` | F1 / Q4 | scenario multiplier changed from 2.8 to 2.0 (within 1.5-2.5); fee recomputed PHP 3,000,000 x 2.0 = PHP 6,000,000. |
| `e5b1465f-86fe-4e33-a1a6-bbe6c557d297` | F1 / Q5 | removed invented "1.4-1.7 overhead component" decomposition; SPP 202 gives only the total 1.5-2.5 range. |
| `5cf56df2-5967-4f67-98ab-d325ee7011c0` | F1 / Q6 | removed invented "+0.1-0.3 innovation adjustment"; SPP 202 lists qualitative factors only. |
| `1b739814-7580-462e-83d4-7f4aca631188` | F1 / Q7 | removed "1.55+0.30+0.15 decomposition"; multiplier selected within 1.5-2.5, fee = DPE x M. |
| `04d1074d-a52a-4812-8150-5fa13dee221b` | F1 / Q10 | removed invented "three-component framework"; SPP 202 defines M as overhead-and-reasonable-profit multiplier, range 1.5-2.5. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
