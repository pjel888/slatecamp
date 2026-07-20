# Council Remediation — 2026-07-20

Bundle: `lea-strc-007-05-core-concept--f39f802d-ddcb-4fd5-b9cd-bb1c6e0e8ef3`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source finding remediated

- **ERROR G2 (HIGH)** (from Agent G, residual streams): all 10 questions cited fabricated code sections "NSCP 2015 § 6.3.x". NSCP 2015 Chapter 6 is **Wood Design** and contains no embedment rules. The real rules live in **NSCP 2015 § 420.7** (mirroring ACI 318-14 § 26.6.5). The questions also tested shortcuts (h/3, 4%, 3x diameter, w_rib/4) the article body forbids.

## Verification against article body and source

- Article body: "NSCP 2015 Section 420.7 treats embedments as structural-detailing risks."
- Article body "Common Mistakes": "Repeating conduit diameter, area, or spacing shortcuts that are not established by the checked embedment anchors."
- The checked NSCP rules (§ 420.7): embedments must not significantly impair strength/fire protection; 0.002 perpendicular reinforcement for pipe embedments; 40 mm cover (earth/weather) and 20 mm cover (not exposed); aluminum embedments coated/covered.
- Source: NSCP 2015 § 420.7 (OCR page 463); ACI 318-14 § 26.6.5 equivalence; § 426.8 coordination rule (OCR page 508).

## Pre-existing batch-164 alignment

A prior batch-164 question-alignment remediation had already rewritten all 10 questions to cite NSCP 2015 § 420.7 / § 426.8 and removed the h/3, 4%, 3x diameter, w_rib/4 shortcuts. Agent J re-verified each, re-stamped the `reason` with the council-remediation marker, added the **ACI 318-14 § 26.6.5** cross-reference to each `code_citation` and rationale, and recorded the fabricated-§ 6.3.x exclusion in each file's `excluded_claims`.

## Question-edit files written / re-stamped (status APPLIED)

| Question UUID | Council Q# | Test point (now § 420.7 / § 426.8 aligned) |
| --- | --- | --- |
| `0d8debcf-c39f-428d-a756-cde40a1b307a` | Q1 | Embedments must not significantly impair strength or reduce fire protection (§ 420.7.1). |
| `6c765e0f-401b-4fa7-a331-0d6952b16166` | Q2 | 0.002 perpendicular reinforcement for pipe embedments (§ 420.7.4). |
| `09117f07-7332-47ae-94e9-75f9effee9f2` | Q3 | 40 mm cover for pipe embedments exposed to earth/weather (§ 420.7.5). |
| `7f446ec1-b5d6-4c76-ad7e-7bb8a6cff5a7` | Q4 | 20 mm cover for pipe embedments not exposed to weather (§ 420.7.5). |
| `02cea262-5a75-4808-86e3-051379a503c3` | Q5 | Aluminum embedments must be coated/covered (§ 420.7.3). |
| `b38842a0-af75-4746-88ed-282a67f96db1` | Q6 | Unshown embedments must be submitted for review (§ 426.8). |
| `e080685f-fe5e-42bf-86e1-5cbaa5663de9` | Q7 | Only water <=32 C or 0.35 MPa before concrete reaches strength (§ 426.8). |
| `99438c76-e9fc-4436-8ecf-208de1f1d5e1` | Q8 | Piping in solid slabs placed between top and bottom reinforcement (§ 426.8). |
| `a7ddfea1-6c8b-4cba-967e-f0662ac042a9` | Q9 | Conduit/piping installed without cutting, bending, or displacing reinforcement (§ 426.8). |
| `0219dc35-4e33-4ce0-b077-c008de043af6` | Q10 | Construction documents must show type, size, details, location (§ 426.8). |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
