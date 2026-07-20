# Council Remediation — 2026-07-20

Bundle: `lea-util-002-07-escalators-specifications-and-design-parameters--a81f97c7-292d-4d1d-b047-f6987ec2d3ec`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source finding remediated

- **ERROR G3 (LOW)** (from Agent G, residual streams): the article body uses **38 m/min** (Salvan); the quiz used **0.5 m/s** and **0.65 m/s** inconsistently. Selected ONE consistent speed basis and aligned the questions to the article body.

## Speed-basis decision

- Article body line 19: "Its rated speed, measured along the incline, must not be more than 38 m per minute" (Salvan regulatory extract).
- Chosen single speed basis: **38 m/min** (the article body value, ~= 0.63 m/s).
- The council brief offered "0.5 m/s (30 m/min) per Salvan" as an alternative, but the article body itself uses 38 m/min. Per the instruction to "align the questions to the article body", 38 m/min was chosen as the single basis.

## Question-edit files written (status APPLIED)

| Question UUID | Council Q# | Error | Correction |
| --- | --- | --- | --- |
| `9e245b4c-642a-4c53-ae0e-5da0c725bbcc` | Q3 | G3 | scenario speed changed from 0.5 m/s to **38 m/min** (article body basis); 11,000 persons/hour theoretical max retained. |
| `c4812c99-1489-410e-9115-c72127ed9448` | Q5 | G3 | "standard operating speed" marked-correct changed from 0.5 m/s to **38 m/min (~0.63 m/s)**. |
| `bee7cf46-7744-4c1e-996b-8127526de640` | Q8 | G3 | "maximum speed" reframed from 0.65 m/s to **38 m/min (~0.63 m/s)** rated-speed limit. |
| `28c18317-7373-497a-a4cd-ed0bcd826d94` | Q11 | G3 | option-comparison speeds changed from 0.5 m/s / 0.65 m/s to **30 m/min / 38 m/min** basis. |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
