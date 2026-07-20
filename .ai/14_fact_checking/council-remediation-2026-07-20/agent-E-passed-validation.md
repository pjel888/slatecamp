# Agent E - Passed-Validation Spot Audit (Materials Stream)

**Date:** 2026-07-20
**Auditor:** Agent E
**Scope:** Article-level spot-check of "passed-validation" bundles in the materials, mechanical-properties, and product-data streams. Confirms that bundles that previously cleared automated validation still hold against primary sources on a manual re-check.

---

## Headline Findings

- **Bundles spot-checked:** 8
- **CONFIRMED_ERROR questions found:** 1 (E1, in `lea-matl-003-04-core-concept`)
- **Article body errors:** 0
- **SECTION_MISMATCH / UNSOURCED:** 0

---

## CONFIRMED_ERROR Questions - Full List

### E1. lea-matl-003-04 - 6063-T6 Aluminum UTS: 1 error

**Q `917c22c8`**: marked-correct option asserted that 6063-T6 aluminum extrusion has an ultimate tensile strength of **186 MPa**.

- **Error:** Per ASTM B221 / Aluminum Association typical property data, 6063-T6 extrusion UTS is at least **190 MPa** (typical range 190-240 MPa; the design minimum used in architectural specification contexts is 190 MPa). The 186 MPa figure is not sourced to a primary standard.
- **Article body status:** Article body uses "190 MPa (minimum)" — VERIFIED_CORRECT.
- **Proposed fix:** Update the marked-correct option and rationale to read "190 MPa (minimum, per ASTM B221 / Aluminum Association typical data for 6063-T6 extrusion)." Cite ASTM B221 in the `code_citation`.

---

## APPLIED (Agent J - question-edit remediation, 2026-07-20)

**Agent:** J (question-edit remediation writer for the LLM fact-checking council)
**Date:** 2026-07-20
**Scope:** Write the question-edit file for verified error E1 from this Agent E report. Recompute/verify the technical value, cite source in every rationale, do NOT edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`. Do NOT switch branches / commit / push.

### File written

| Error | Bundle | Question ID | File | Action |
|---|---|---|---|---|
| E1 | lea-matl-003-04 | `917c22c8-eabb-4572-a8ef-ec303f48d390` | `.../lea-matl-003-04-core-concept--7dccfed0-8f85-47ad-b72b-8e5940d8276a/question-edits/917c22c8-eabb-4572-a8ef-ec303f48d390.json` | WRITTEN. Restored the full original arithmetic-style question with marked-correct value changed from "186 MPa" to "190 MPa (minimum, per ASTM B221)" and `correct_option_id = "d"`. `code_citation` set to "ASTM B221 6063-T6 extruded aluminum minimum ultimate tensile strength = 190 MPa (Aluminum Association typical data)." `approved_by = "council-agent-J-question-remediation"`. |

### Verification of the corrected value

- Source: ASTM B221 (Standard Specification for Aluminum and Aluminum-Alloy Extruded Bars, Rods, Wire, Profiles, and Tubes).
- Aluminum Association typical mechanical-property data for 6063-T6 extrusion: ultimate tensile strength 190 MPa minimum (typical 215 MPa), yield 160 MPa, elongation 8%.
- 186 MPa is below the Aluminum Association published minimum and is not traceable to any standard; the article body itself uses 190 MPa.
- The correction brings the question into alignment with both ASTM B221 and the article body.

### JSON validation

`917c22c8-eabb-4572-a8ef-ec303f48d390.json` passes `jq empty`.

### Per-bundle council-remediation file

`.../lea-matl-003-04-core-concept--7dccfed0-8f85-47ad-b72b-8e5940d8276a/council-remediation-2026-07-20.md` — created with status APPLIED.

**Error E1 is now APPLIED.** Total question-edits written for Agent E scope: 1.
