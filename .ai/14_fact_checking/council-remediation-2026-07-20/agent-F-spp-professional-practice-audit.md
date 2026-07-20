# Agent F - SPP Professional Practice Audit

**Date:** 2026-07-20
**Auditor:** Agent F
**Scope:** Article-level fact-checking of the UAP Standards of Professional Practice (SPP) stream — professional-practice-comparison, contractor obligations, MDPE multipliers, professional-context bundles. Cross-check every fee, multiplier, acronym, and code citation against SPP Document 202, SPP Document 208, UAP Doc 301, and Civil Code Article 1723.

---

## Headline Findings

- **Bundles audited:** 6
- **CONFIRMED_ERROR questions found:** 9 (across three error clusters F1, F2, F3)
- **Article body errors:** 0
- **SECTION_MISMATCH / UNSOURCED:** 0

---

## CONFIRMED_ERROR Questions - Full List

### F1. lea-prac-cmp-007 - MDPE Multipliers: 6 errors

The MDPE (Multiple of Direct Professional Expense) multiplier questions invent decompositions, innovation premiums, and tier structures that SPP Document 202 Section 5.2 does not authorize. SPP Document 202 Sec. 5.2 fixes the MDPE multiplier range at **1.5 to 2.5** (with 2.0 as the typical mid-range value on a 6,000,000 PHP reference direct fee). The questions had propagated values outside this range and layered fabricated sub-components.

| Q | Question ID | Error | Correction |
|---|---|---|---|
| Q3 | `c345f793-1b09-4d19-9f2d-e045303bff54` | MDPE range stated as 2.7-3.2 | Correct range **1.5-2.5** per SPP Doc 202 Sec. 5.2 |
| Q5 | `e8d5bd9e-79ea-460b-9487-c2e0050fdd80` | MDPE multiplier stated as 2.8 on a 3,000,000 PHP direct fee | Correct: **2.0** on a 6,000,000 PHP direct fee |
| Q7 | `e5b1465f-86fe-4e33-a1a6-bbe6c557d297` | Invented 1.4-1.7 "decomposition" sub-range | Removed; not in SPP Doc 202 |
| Q9 | `5cf56df2-5967-4f67-98ab-d325ee7011c0` | Invented +0.1 to +0.3 "innovation premium" add-on | Removed; not in SPP Doc 202 |
| Q11 | `1b739814-7580-462e-83d4-7f4aca631188` | Invented three-component add-on 1.55 + 0.30 + 0.15 | Removed; not in SPP Doc 202 |
| Q13 | `04d1074d-a52a-4812-8150-5fa13dee221b` | Invented "three-component framework" for MDPE | Removed; not in SPP Doc 202 |

### F2. lea-prac-ctr-006 - Contractor Obligations code_citation: 1 error

**Q `378e89e5`**: `code_citation` read "UAP Doc 301" for the 15-year structural-liability guarantee period.

- **Error:** The 15-year structural-collapse liability (and 10-year filing window) comes from **Civil Code Article 1723**, not UAP Doc 301. UAP Doc 301 supplies the contractual "guarantee period" framing only; the liability period is statutory.
- **Article body status:** Article body cites Civil Code Art. 1723 — VERIFIED_CORRECT.
- **Proposed fix:** Change `code_citation` to "Civil Code Art 1723; UAP Doc 301 guarantee period." Answer (15 years) retained.

### F3. uap-spp-doc - SPPCC Backronym Flip: 1 error

**Q (Q6 in array order) `6959881a`**: marked-correct option claimed SPPCC = "Standards of Professional Practice Coordinating Committee."

- **Error:** In the PRBoA SPP document series, **SPPCC = "Statement of Probable Project Construction Cost"** (the cost document that architects file). "Standards of Professional Practice Coordinating Committee" is a fabricated backronym; PRBoA's coordinating committee is not abbreviated "SPPCC" in any of the SPP documents.
- **Note on Q numbering:** The council brief labelled this Q5, but the SPPCC question is at array index 6 (`6959881a`). Q5 in this bundle concerns SPP Doc 208 and is unrelated. The question was located by stem "What does the acronym SPPCC stand for".
- **Proposed fix:** Flip marked-correct from "Standards of Professional Practice Coordinating Committee" to "Statement of Probable Project Construction Cost."

---

## APPLIED (Agent J - question-edit remediation, 2026-07-20)

**Agent:** J (question-edit remediation writer for the LLM fact-checking council)
**Date:** 2026-07-20
**Scope:** Write question-edit files for verified errors F1 (6 files), F2 (1 file), F3 (1 file). Cite SPP Doc 202 / Civil Code Art 1723 / PRBoA SPP series in every rationale. Do NOT edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`. Do NOT switch branches / commit / push.

### Files written

| Error | Bundle | Question ID | File | Action |
|---|---|---|---|---|
| F1 | lea-prac-cmp-007 | `c345f793-1b09-4d19-9f2d-e045303bff54` | `.../lea-prac-cmp-007-.../question-edits/c345f793-1b09-4d19-9f2d-e045303bff54.json` | WRITTEN. MDPE range 2.7-3.2 → **1.5-2.5** (SPP Doc 202 Sec. 5.2). |
| F1 | lea-prac-cmp-007 | `e8d5bd9e-79ea-460b-9487-c2e0050fdd80` | `.../lea-prac-cmp-007-.../question-edits/e8d5bd9e-79ea-460b-9487-c2e0050fdd80.json` | WRITTEN. MDPE 2.8 on 3M → **2.0 on 6,000,000 PHP** direct fee. |
| F1 | lea-prac-cmp-007 | `e5b1465f-86fe-4e33-a1a6-bbe6c557d297` | `.../lea-prac-cmp-007-.../question-edits/e5b1465f-86fe-4e33-a1a6-bbe6c557d297.json` | WRITTEN. Removed invented 1.4-1.7 decomposition. |
| F1 | lea-prac-cmp-007 | `5cf56df2-5967-4f67-98ab-d325ee7011c0` | `.../lea-prac-cmp-007-.../question-edits/5cf56df2-5967-4f67-98ab-d325ee7011c0.json` | WRITTEN. Removed invented +0.1-0.3 innovation premium. |
| F1 | lea-prac-cmp-007 | `1b739814-7580-462e-83d4-7f4aca631188` | `.../lea-prac-cmp-007-.../question-edits/1b739814-7580-462e-83d4-7f4aca631188.json` | WRITTEN. Removed invented 1.55+0.30+0.15 three-component add-on. |
| F1 | lea-prac-cmp-007 | `04d1074d-a52a-4812-8150-5fa13dee221b` | `.../lea-prac-cmp-007-.../question-edits/04d1074d-a52a-4812-8150-5fa13dee221b.json` | WRITTEN. Removed invented three-component MDPE framework. |
| F2 | lea-prac-ctr-006 | `378e89e5-9c56-4d6e-9d8d-cbc86f97af8e` | `.../lea-prac-ctr-006-.../question-edits/378e89e5-9c56-4d6e-9d8d-cbc86f97af8e.json` | WRITTEN. `code_citation` "UAP Doc 301" → "Civil Code Art 1723; UAP Doc 301 guarantee period". Answer (15 years) retained. |
| F3 | uap-spp-doc | `6959881a-e9a0-44a3-b7c5-35a1aec20712` | `.../uap-spp-doc-.../question-edits/6959881a-e9a0-44a3-b7c5-35a1aec20712.json` | WRITTEN. Marked-correct flipped from "Standards of Professional Practice Coordinating Committee" to "Statement of Probable Project Construction Cost" (`correct_option_id = "a"`). |

### Q-numbering discrepancy note (F3)

The council brief labelled the SPPCC error "Q5". In `linked-questions.json` array order, the SPPCC question is at index 6 (`6959881a`). Q5 in this bundle concerns SPP Doc 208 and is unrelated. The question was correctly located by its stem ("What does the acronym SPPCC stand for") and the remediation applied to the right UUID.

### Source citations used in rationales

- SPP Document 202, Section 5.2 (MDPE multiplier range 1.5-2.5; 2.0 typical; 6,000,000 PHP reference direct fee)
- Civil Code Article 1723 (15-year structural-collapse liability; 10-year action period)
- UAP Document 301 (guarantee-period contractual framing)
- PRBoA SPP document series (SPPCC = Statement of Probable Project Construction Cost)

### JSON validation

All 8 written JSON files pass `jq empty`.

### Per-bundle council-remediation files

- `.../lea-prac-cmp-007-.../council-remediation-2026-07-20.md` — created with status APPLIED (F1).
- `.../lea-prac-ctr-006-.../council-remediation-2026-07-20.md` — created with status APPLIED (F2).
- `.../uap-spp-doc-.../council-remediation-2026-07-20.md` — created with status APPLIED (F3).

**Errors F1, F2, F3 are now APPLIED.** Total question-edits written for Agent F scope: 8.
