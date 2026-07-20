# Council Remediation — 2026-07-20

Bundle: `lea-matl-003-04-core-concept--7dccfed0-8f85-47ad-b72b-8e5940d8276a`
Agent: Agent J (question-edit remediation writer)
Status: **APPLIED**

## Source findings remediated

- **ERROR E1** (from Agent E, passed spot-check): linked question "What is the minimum ultimate tensile strength of 6063-T6 aluminum alloy?" had marked-correct answer **186 MPa** — wrong. 186 MPa is the 6063-T5 value. Per ASTM B221 / Aluminum Association, 6063-T6 minimum UTS is **190 MPa** (typical ~241 MPa).

## Recomputation / verification

- 6063-T6 minimum UTS = 190 MPa per ASTM B221 mechanical-property table for extrusions.
- 6063-T5 minimum UTS = 186 MPa (the value mis-assigned to T6 by the original question).
- Source: ASTM B221 (https://www.astm.org/b0221-02.html); Aluminum Association material specs.

## Question-edit files written (status APPLIED)

| Question UUID | Error | Correction |
| --- | --- | --- |
| `917c22c8-eabb-4572-a8ef-ec303f48d390` | E1 | marked-correct changed from "186 MPa" to "190 MPa (minimum, per ASTM B221)"; rationale cites ASTM B221 / Aluminum Association; original question restored (an earlier batch-083 edit had swapped it out). |

All JSON validated with `jq empty`. No edits were made to `normalized.md`, `candidate.md`, `original.md`, or `linked-questions.json`.
