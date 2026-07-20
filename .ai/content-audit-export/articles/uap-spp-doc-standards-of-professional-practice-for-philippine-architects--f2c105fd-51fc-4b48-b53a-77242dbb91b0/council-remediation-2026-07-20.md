# Council Remediation — 2026-07-20

Bundle: `uap-spp-doc-standards-of-professional-practice-for-philippine-architects--f2c105fd-51fc-4b48-b53a-77242dbb91b0`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source finding remediated

- **ERROR F3** (from Agent F, SPP / Professional Practice): a question asserts a fabricated backronym for SPPCC. Verified: SPPCC = "Statement of Probable Project Construction Cost" per SPP 202. The marked-correct answer was the backronym "Standards of Professional Practice Coordinating Committee."

## Note on question numbering

- The council brief labelled this "Q5", but in array order the SPPCC question is **Q6** (`6959881a`). Q5 (`ef5a28ce`) is about SPP Doc 208 / Architectural Design Competition replacement and was not in scope. Identified the SPPCC question by the stem "What does the acronym SPPCC stand for".

## Verification against article body and source

- Article body line 24: "SPPCC means Statement of Probable Project Construction Cost."
- Article body line 42: "SPP Document 202 uses SPPCC for the Statement of Probable Project Construction Cost."
- Source: PRBoA SPP 202 (https://www.architectureboard.com.ph/wp-content/uploads/2019/09/1.4-2010-SPP-for-PH-Architects.pdf).

## Question-edit files written (status APPLIED)

| Question UUID | Error | Correction |
| --- | --- | --- |
| `6959881a-e9a0-44a3-b7c5-35a1aec20712` | F3 / Q6 | marked-correct flipped from fabricated backronym "Standards of Professional Practice Coordinating Committee" to the SPP 202 definition "Statement of Probable Project Construction Cost". |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
