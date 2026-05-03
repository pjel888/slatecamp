# Question Flagging Report — Master Index

**Generated:** 2026-05-02
**Scope:** 7 error-propagating articles × linked questions + longest-option bias analysis
**Total Flags:** 12 (9 Dimension A + 3 Dimension B)

---

## Dimension A: Error Propagation Flags (9)

Questions that propagate confirmed factual errors from their parent articles into the question bank.

### CRITICAL Severity

| # | Flag ID | Article | Question | Model ID | Error |
|---|---------|---------|----------|----------|-------|
| 1 | 001 | BP 344 / Universal Design (9eb0b48e) | Q4 — b2951761 | ALE-PRAC-FRM-018-004 | Ramp slope: teaches 1:12 when 2024 Revised IRR says 1:20 |
| 2 | 003 | Prohibited Acts / Penalties (3d48211b) | Q4 — 032522de | ALE-PRAC-LAW-003-004 | Penalty range P5K-P100K vs actual P100K-P5M |

### HIGH Severity

| # | Flag ID | Article | Question | Model ID | Error |
|---|---------|---------|----------|----------|-------|
| 3 | 005 | Change of Use (9e053410) | Q4 — bf891ad7 | (bulk) | Wrong occupancy group labels + "Certificate of Use" as correct answer |
| 4 | 006 | Change of Use (9e053410) | Q18 — 58d057b3 | (bulk) | "Certificate of Use" taught as correct document; correct is "Certificate of Occupancy" |

### MEDIUM Severity

| # | Flag ID | Article | Question | Model ID | Error |
|---|---------|---------|----------|----------|-------|
| 5 | 002 | RA 9266 Overview (02a5ba32) | Q8 — 7e4e697d | ALE-PRAC-LAW-001-008 | Cite §41 for IAPOA nomination; correct is §4. Also has duplicate identical options. |
| 6 | 004 | PRBOA Powers (ab6d74a1) | Q1 — af782bb3 | ALE-PRAC-LAW-005-001 | Counts 13 powers when Section 7 enumerates 14 |
| 7 | 007 | Change of Use (9e053410) | Q2 — 680174d1 | (bulk) | Rationale says "Certificate of Use" even though correct answer says "Certificate of Occupancy" (contradiction in question) |

### Contradiction Flags (Question correct, article wrong)

| # | Flag ID | Article | Question | Model ID | Issue |
|---|---------|---------|----------|----------|-------|
| 8 | 008 | Reciprocity (e51e9a56) | Q2 — fffa260f | ALE-PRAC-FRM-007-002 | Q correctly says reciprocity only; article says "reciprocity OR substantial equivalence" |
| 9 | 009 | Reciprocity (e51e9a56) | Q8 — f1d8b55e | ALE-PRAC-FRM-007-008 | Q correctly separates permits from reciprocity; article conflates them |

### Not Flagged (No Error Propagation)

| Article | Reason |
|---------|--------|
| Fire Extinguishing Systems (f61a5716) | 41 questions checked; none test the dry standpipe area threshold error |

---

## Dimension B: Longest Option Bias Flags (3)

Questions where the correct answer is disproportionately long, suggesting "lazy design" rather than legitimate detail.

| # | Flag ID | Article | Question | Model ID | Length Ratio | Assessment |
|---|---------|---------|----------|----------|-------------|------------|
| 10 | 010 | Prohibited Acts (3d48211b) | Q3 — 5b1da138 | ALE-PRAC-LAW-003-009 | ~3:1 vs avg | Suspension vs revocation — binary distinction explained at 3x length |
| 11 | 011 | RA 9266 Overview (02a5ba32) | Q1 — 55e9adf2 | ALE-PRAC-LAW-001-007 | ~6:1 vs avg | AoR vs Consulting Architect — correct answer is a full tutorial, distractors are one-liners |
| 12 | 012 | PRBOA Powers (ab6d74a1) | Q10 — 926e3a06 | ALE-PRAC-LAW-005-010 | ~9:1 vs shortest | Public trustee vs guild — one distractor is a 35-char throwaway |

### Methodology

Flagged only questions where:
1. The correct answer is the longest option
2. The length disparity is >= 3x the average distractor length
3. The content does not warrant the disparity (i.e., the correct answer could be stated as concisely as the distractors)
4. Priority given to law/code questions over design/theory questions

### Note on Legitimate Long Correct Answers

Not all longest-option=correct questions were flagged as lazy design. Questions involving code citations, complex multi-factor scenarios, or "analyze" level reasoning with scenarios legitimately require longer correct answers. The three flagged above are clear cases where the length signals the answer rather than the content reasoning.

---

## File Listing

All flag reports are in `/Users/philiplewis/slatecamp/.ai/14_fact_checking/question-flags/`:

| File | Type |
|------|------|
| Flag-001-9eb0b48e-Q4-b2951761.md | Error Propagation — Ramp Slope |
| Flag-002-02a5ba32-Q8-7e4e697d.md | Error Propagation — Section Reference |
| Flag-003-3d48211b-Q4-032522de.md | Error Propagation — Penalty Range |
| Flag-004-ab6d74a1-Q1-af782bb3.md | Error Propagation — Power Count |
| Flag-005-9e053410-Q4-bf891ad7.md | Error Propagation — Occupancy + Certificate of Use |
| Flag-006-9e053410-Q18-58d057b3.md | Error Propagation — Certificate of Use as Correct Answer |
| Flag-007-9e053410-Q2-680174d1.md | Error Propagation — Certificate of Use in Rationale |
| Flag-008-e51e9a56-Q2-fffa260f.md | Contradiction — Q correct, article wrong |
| Flag-009-e51e9a56-Q8-f1d8b55e.md | Contradiction — Q correct, article wrong |
| Flag-010-3d48211b-Q3-5b1da138-longest-option-bias.md | Longest Option Bias |
| Flag-011-02a5ba32-Q1-55e9adf2-longest-option-bias.md | Longest Option Bias |
| Flag-012-ab6d74a1-Q10-926e3a06-longest-option-bias.md | Longest Option Bias |

---

## Summary Statistics

- **Articles checked for error propagation:** 7
- **Total linked questions examined:** 130
- **Questions propagating errors (Dimension A):** 7 (across 4 articles)
- **Article-question contradictions (Q correct, article wrong):** 2 (1 article)
- **Articles with zero propagation:** 2 (Fire Extinguishing, plus Reciprocity if counting contradictions separately)
- **Longest-option bias flags (Dimension B):** 3 (most egregious law/code examples)
- **Questions with longest=correct (overall dataset):** 31.8% (2,274 of 7,159)
