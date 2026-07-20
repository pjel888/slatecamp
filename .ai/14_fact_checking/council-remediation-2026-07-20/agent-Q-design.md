# Council Remediation — Agent Q — Architectural Design Stream

**Agent:** Q (Architectural Design — anthropometrics, ergonomics, space-planning, FLAR/AMBF, stair design, site grading, utilities routing)
**Date:** 2026-07-20
**Branch:** `fact-check/article-question-remediation` (no commits, no push, no branch switch)
**Scope:** 44 design bundles listed at `/tmp/council-4-lists/dsgn.txt` covering lea-dsgn-003-04 through lea-dsgn-012-05

---

## Headline Summary

| Metric | Count |
|---|---|
| Bundles in scope | 44 |
| Linked questions examined | ~440 (10 per bundle average) |
| Quantitative / dimension questions recomputed | ~85 |
| Initial confirmed-error candidates identified | 10 |
| Candidates already neutralized by prior batch edits | 8 (Batch-014 / Batch-066 / Batch-072 / Batch-073) |
| Candidates where the prior batch edit **introduced a new error** | **2** (Batch-071 in lea-dsgn-005-12) |
| **New / rewritten question-edit files produced this run** | 2 |
| Per-bundle `council-remediation-2026-07-20.md` files produced | 1 (lea-dsgn-005-12 only) |
| jq empty validation on all new edit files | PASS (2/2) |

---

## Verification methodology

For each bundle the agent read `normalized.md` (article body) and `linked-questions.json` (MCQs). For every quantitative or dimension-bearing question the agent:

1. Recomputed arithmetic (Python) for FLAR / AMBF / TGFA / floor counts / column counts / setback areas / slope percentages / riser counts.
2. Verified anthropometric and code dimensions against the governed source packs:
   - BP 344 2024 Revised IRR (`.ai/16_source_packs/packs/source-pack-bp-344-2024-revised-irr/chunks.generated.json` + `audit-evidence/bp344-accessible-washrooms/bp344-2024-revised-irr.txt`)
   - PD 1096 2004 IRR (development controls, exits, egress)
   - RA 9514 Fire Code (occupant load, exit width)
3. Cross-checked the article body against the question stem and rationale for internal contradictions.
4. For each confirmed error, verified whether a prior batch had already replaced the broken question with a source-safe alternative. If the prior replacement itself introduced an error, the agent overwrote the edit file.

---

## Initial confirmed-error candidates (10)

The 10 questions initially flagged as confirmed errors are listed below with their disposition. The 8 already-neutralized candidates are documented for traceability; only the 2 Batch-071 regressions required new edit files this run.

### Already neutralized by prior batch edits (8) — no new edit needed

| # | Bundle | Question | Original error | Prior batch fix |
|---|---|---|---|---|
| 1 | lea-dsgn-007-08 | `3e925f54-80b1-441e-9e41-92910e7677fa` | RCC column count for 50×60 m plate at 8 m spacing marked (c) 24, correct ≈ 47–48 by area division or 72 by column-line method | Batch-072 — full source-safe rewrite to a loadbearing-wall planning question |
| 2 | lea-dsgn-007-07 | `fee22955-47bf-4b8b-835f-0be2fb9b1437` | R-3 PSO stem value (65%) contradicted rationale (72%); arithmetic inconsistency | Batch-014 — full source-safe rewrite using problem-stated AMBF |
| 3 | lea-dsgn-007-07 | `5c4f9e3d-3f64-4f69-9501-9be7ef2d88fb` | C-2 PSO stem (80%) vs rationale (75%) inconsistency; marked 16 floors; correct at 80% = 15 floors | Batch-014 — full source-safe rewrite using problem-stated AMBF |
| 4 | lea-dsgn-007-10 | `e651348d-c56b-4c34-9bd5-1d494e299c4d` | Stair max riser 190 mm in stem vs 200 mm in rationale; marked 300 risers; correct at 190 mm = 316 risers | Batch-066 — full source-safe rewrite on BP 344 vertical-access framing |
| 5 | lea-dsgn-012-03 | `66066c3c-7165-44dc-9b06-d67266122893` | Contour slope 8 cm × 1:500 = 40 m; slope = 2 m ÷ 40 m = 5% (gentle 3–8%), not 12.5% moderate | Batch-073 — full source-safe rewrite on contour valley interpretation |
| 6 | lea-dsgn-012-02 | `866e2c38-43dd-4773-b0e1-a44100981cf0` | Setback area 46 × 32 = 1,472 sqm, not marked 1,364 sqm | Batch-073 — full source-safe rewrite on PD 1096 existing-structures documentation |
| 7 | lea-dsgn-012-05 | `c218c965-1d90-4292-837d-bd426f56b5e6` | Sump elevation 100.6 m > main 100 m = gravity drainage feasible; marked pump station required | Batch-073 — full source-safe rewrite on utility distribution space access |
| 8 | lea-dsgn-012-01 | `21750aff-9192-4866-8658-121af507bcf8` | 2% slope is in Flat (0–3%) category, not Gentle (3–8%) | Batch-073 — full source-safe rewrite on site-analysis definition |

### Net-new errors requiring this run's edits (2)

| # | Bundle | Question | Error | Source |
|---|---|---|---|---|
| 9 | lea-dsgn-005-12 | `0619bbcb-4794-477e-bf46-d88794649473` | Ramp max gradient marked 1:12 (both original and Batch-071 replacement) — BP 344 2024 IRR says 1:20 | BP 344 2024 IRR Appendix A.1.1 |
| 10 | lea-dsgn-005-12 | `1739337c-b67d-4e37-b92e-e97729ce3394` | Door clear width changed to 0.80 m by Batch-071 (regression) — BP 344 2024 IRR says 900 mm | BP 344 2024 IRR Appendix C.2 |

---

## Remediation records for the 2 net-new errors

### Q-006 — Ramp max gradient 1:12 vs 1:20 — CRITICAL — **NEW EDIT WRITTEN**

- **article_id:** `d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d` (lea-dsgn-005-12)
- **question_id:** `0619bbcb-4794-477e-bf46-d88794649473`
- **Source quotation (verbatim):** "2. Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases depending on the length to be covered." — BP 344 2024 Revised IRR, Appendix A.1.1 / Accessible Ramps, PDF p.2. Table A.1.1 confirms 1:20 (standard, 15 m landing interval) and 1:15 (special case, max 10.50 m length, 700 mm rise, 10 m landing interval).
- **Original (linked-questions.json):** Stem asks for max ramp slope per BP 344 2024 IRR; marked answer (c) "1:12". The original rationale self-contradicted by stating "1:20 maximum is the current standard." None of the four options included 1:20.
- **Prior batch edit disposition:** Batch-071 (`codex-local-first-batch-071`, 2026-05-12) replaced the question with a similar one that **also marked 1:12 as correct**, citing "checked local accessibility text states that ramp maximum gradient is 1:12." This propagated the same error against the source.
- **Action this run:** Overwrote `question-edits/0619bbcb-4794-477e-bf46-d88794649473.json` with a corrected `proposed` block. New options: 1:8 / 1:12 (decoy) / 1:20 (correct) / 1:25; correct_option_id = c; rationale quotes source verbatim.
- **File:** `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-dsgn-005-12-core-concept--d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d/question-edits/0619bbcb-4794-477e-bf46-d88794649473.json`
- **jq empty validation:** PASS

### Q-005 — Door clear width 900 mm vs 0.80 m — CRITICAL — **NEW EDIT WRITTEN**

- **article_id:** `d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d` (lea-dsgn-005-12)
- **question_id:** `1739337c-b67d-4e37-b92e-e97729ce3394`
- **Source quotation (verbatim):** "All doors shall have a minimum clear width of 900 mm." / "For double-leaf doors, the minimum clear width shall be 1800 mm." — BP 344 2024 Revised IRR, Appendix C.2 Doors, PDF p.31.
- **Original (linked-questions.json):** Stem cited "the required 900 mm accessible clear width per BP 344"; marked answer (c) variance + alternative accessible route. **The original was CORRECT per source.**
- **Prior batch edit disposition:** Batch-071 (`codex-local-first-batch-071`, 2026-05-12) replaced the question with one whose rationale states "checked accessibility text gives **0.80 m** minimum clear door width." This value is not in the source. Batch-071 introduced a regression.
- **Action this run:** Overwrote `question-edits/1739337c-b67d-4e37-b92e-e97729ce3394.json` with a corrected `proposed` block that restores the source-correct 900 mm dimension while retaining the heritage-conflict teaching point (RA 10066 variance procedure + alternative accessible route).
- **File:** `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-dsgn-005-12-core-concept--d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d/question-edits/1739337c-b67d-4e37-b92e-e97729ce3394.json`
- **jq empty validation:** PASS

---

## Per-bundle council-remediation files written this run

| Bundle | File |
|---|---|
| lea-dsgn-005-12-core-concept--d4bd5a1a-c6b6-415f-9da3-c5c84f4ab96d | `council-remediation-2026-07-20.md` (in bundle directory) |

No per-bundle remediation file was written for the other 43 bundles because no new edits were produced there. The 8 already-neutralized candidates are documented in the table above for traceability; their prior batch edits remain the canonical remediation and were not modified.

---

## What the governing source pack actually contains

| Source | Used for | Verbatim rule |
|---|---|---|
| BP 344 2024 Revised IRR — Appendix A.1.1 (PDF p.2) | Ramp gradient Q-006 | "Gradient not steeper than 1:20. Steeper gradients may be allowed in special cases..." |
| BP 344 2024 Revised IRR — Appendix C.2 (PDF p.31) | Door clear width Q-005 | "All doors shall have a minimum clear width of 900 mm." / "For double-leaf doors, 1800 mm." |
| PD 1096 2004 IRR — Rule VII/VIII | FLAR / AMBF / PSO workflow | Applied via Batch-014 edits in lea-dsgn-007-07 (no new edit this run) |
| RA 9514 Fire Code — Section 10.2.5.2 | Stair width / egress capacity factors (7.6 mm/person stairs, 5.0 mm/person level) | Reviewed; no errors found requiring new edit |
| RA 10066 Cultural Heritage Act | Variance procedure for heritage-code conflicts | Applied in Q-005 rationale |

---

## Cross-reference notes

- **Agent C** (BP 344 accessibility audit) covered 9 BP-344-focused bundles but did NOT include lea-dsgn-005-12. The 2 errors fixed here are net-new findings within the Design stream's heritage-accessibility scope and do not overlap with Agent C / Agent H work.
- **Agent A Flag-001** established the precedent that BP 344 2024 IRR ramp slope = 1:20 (already applied to lea-prac-frm-018). This run extends the same correction to the heritage-context question in lea-dsgn-005-12.
- **No conflicts with any other agent's remediation.** The 2 question-edits in lea-dsgn-005-12 are the only changes from Agent Q and do not touch any other agent's scope.

---

## Scope boundaries respected

- No edits to `normalized.md` or any other primary content file.
- No edits to `linked-questions.json` (the proposed blocks live in `question-edits/*.json` only).
- No commits, no push, no branch switch. Stayed on `fact-check/article-question-remediation` throughout.
- All citations traceable to a governed source pack or to the BP 344 2024 IRR raw PDF text in `audit-evidence/`.
- Every JSON file validated with `jq empty` (2/2 PASS).
