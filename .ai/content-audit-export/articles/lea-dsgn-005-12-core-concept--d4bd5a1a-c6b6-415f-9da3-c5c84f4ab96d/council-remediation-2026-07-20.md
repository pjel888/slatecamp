# Council Remediation — Agent Q (Design) — lea-dsgn-005-12

**Agent:** Q (Design stream — Architectural Design, anthropometrics, ergonomics, space-planning)
**Date:** 2026-07-20
**Bundle:** `lea-dsgn-005-12-core-concept--d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d` (Heritage / Accessibility — BP 344 ramp and door dimensions)
**Branch:** `fact-check/article-question-remediation`
**Scope boundaries respected:** no edits to `normalized.md` or other primary content. Only `question-edits/*.json`. No commit, no push, no branch switch.

---

## Headline Summary

| Metric | Count |
|---|---|
| Linked questions in bundle | 10 |
| Quantitative / dimension questions examined | 4 |
| CONFIRMED_ERROR requiring edit | 2 (both introduced by prior Batch-071 edit) |
| Pre-existing arithmetic errors found in original linked-questions.json | 0 of these 2 (Batch-071 introduced both) |
| **New / rewritten question-edit files produced this run** | 2 |

---

## What the BP 344 2024 Revised IRR source actually says

Source verified against two local artifacts:
- `.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json` (2 chunks, governed)
- `audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt` (full PDF text extraction)

### Ramp gradient (Appendix A.1.1 Accessible Ramps, PDF p.2 / chunk-0001)
> "Accessible ramps shall have the following facilities and features:
> 1. Minimum clear width of 1200 mm
> 2. **Gradient not steeper than 1:20.** Steeper gradients may be allowed in special cases depending on the length to be covered."
>
> Table A.1.1 Maximum Slope: **1:20** (standard, 15 m landing interval) / **1:15** (special cases, max length 10.50 m, max rise 700 mm, 10 m landing interval)

**Conclusion:** BP 344 2024 IRR maximum accessible ramp gradient = **1:20**, with 1:15 only in special cases. The older 1:12 standard is NOT the current maximum.

### Door clear width (Appendix C.2 Doors, PDF p.31)
> "**All doors shall have a minimum clear width of 900 mm.**"
> "For double-leaf doors, the minimum clear width shall be 1800 mm."

**Conclusion:** BP 344 2024 IRR minimum clear door width = **900 mm** (single-leaf), **1800 mm** (double-leaf). The Batch-071 edit's "0.80 m" value is NOT in the source.

---

## Remediation records (one per confirmed error)

### Q-006 — Ramp max gradient 1:12 vs 1:20 — CRITICAL — **NEW EDIT WRITTEN**

- **article_id:** `d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d`
- **question_id:** `0619bbcb-4794-477e-bf46-d88794649473`
- **Original (linked-questions.json):** Stem asks for max ramp slope per BP 344 2024 IRR; marked answer (c) "1:12 (BP 344 2024 Revised IRR Sec. 4.2.2)". The original rationale self-contradicts: it states "1:20 maximum is the current standard" but marks 1:12 as correct. None of the four options includes 1:20.
- **Batch-071 edit (`approved_by: codex-local-first-batch-071`):** Replaced with a similar question that **also marked 1:12 (option c) as correct**, citing "checked local accessibility text states that ramp maximum gradient is 1:12." This propagates the same error.
- **Source verbatim:** "Gradient not steeper than 1:20" (BP 344 2024 IRR Appendix A.1.1).
- **Action:** Overwrote `question-edits/0619bbcb-4794-477e-bf46-d88794649473.json` with a corrected `proposed` block. New stem retains the heritage-context teaching point, options are 1:8 / 1:12 (decoy) / 1:20 (correct) / 1:25, correct_option_id = c, rationale quotes the source verbatim and notes 1:15 only as the special-case allowance.
- **File:** `.ai/content-audit-export/articles/lea-dsgn-005-12-core-concept--d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d/question-edits/0619bbcb-4794-477e-bf46-d88794649473.json`
- **jq empty validation:** PASS

### Q-005 — Door clear width 900 mm vs 0.80 m — CRITICAL — **NEW EDIT WRITTEN**

- **article_id:** `d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d`
- **question_id:** `1739337c-b67d-4e37-b92e-e97729ce3394`
- **Original (linked-questions.json):** Stem cites "the required 900 mm accessible clear width per BP 344"; marked answer (c) variance + alternative accessible route. **Original was CORRECT** per BP 344 2024 IRR.
- **Batch-071 edit (`approved_by: codex-local-first-batch-071`):** Replaced with a question whose rationale states "checked accessibility text gives **0.80 m** minimum clear door width." This value does not appear in the source; the actual source rule is 900 mm. Batch-071 introduced a regression.
- **Source verbatim:** "All doors shall have a minimum clear width of 900 mm." (BP 344 2024 IRR Appendix C.2 Doors, PDF p.31).
- **Action:** Overwrote `question-edits/1739337c-b67d-4e37-b92e-e97729ce3394.json` with a corrected `proposed` block. New stem retains the heritage-conflict teaching point but uses the source-correct 900 mm dimension; correct_option_id = c (variance + alternative accessible route).
- **File:** `.ai/content-audit-export/articles/lea-dsgn-005-12-core-concept--d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d/question-edits/1739337c-b67d-4e37-b92e-e97729ce3394.json`
- **jq empty validation:** PASS

---

## Items reviewed but not remediated (no edit needed)

The remaining 8 questions in this bundle were reviewed; no further errors were found that required new edits beyond the 2 above. The 8 prior Batch-071 edits on this bundle's other questions are topically aligned and source-safe.

---

## Cross-reference notes

- **Agent C (BP 344 accessibility audit)** covered 9 BP-344-focused bundles but did NOT include lea-dsgn-005-12 in its scope. The 2 errors fixed here are net-new findings specific to the Design stream's heritage-accessibility scope.
- **Agent A Flag-001** established the precedent that BP 344 2024 IRR ramp slope = 1:20 (already applied to lea-prac-frm-018). This run extends the same correction to the heritage-context question in lea-dsgn-005-12.
- **No conflict with any other agent's remediation** — these 2 question-edits are the only changes in lea-dsgn-005-12 and do not overlap with Agent C, D, or H scopes.
