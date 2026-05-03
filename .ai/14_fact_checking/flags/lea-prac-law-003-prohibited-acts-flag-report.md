# Flag Report: `lea-prac-law-003-prohibited-acts-criminal-penalties-and-enforcement`

**Article ID:** `3d48211b-8add-4934-8dab-ae8bdae74035`
**Article Slug:** `lea-prac-law-003-prohibited-acts-criminal-penalties-and-enforcement`
**Subject:** Professional Practice & Jurisprudence
**Linked Questions:** 10
**Sources:** sources.json = EMPTY (source_count: 0)
**Primary Source Verified Against:** RA 9266 IRR (24-page PDF)

---

## FLAG 1 — CRITICAL — Wrong Section References for Prohibited Acts

**Claim in Article (line 5):**
> "Sections 27 through 30, establish prohibited acts and corresponding penalties."

**Verdict:** `LIKELY_INCORRECT`

**Evidence:** In the RA 9266 IRR:
- Section 27 = Reciprocity Requirements (not about prohibited acts)
- Section 28 = Continuing Professional Development (not about prohibited acts)
- Section 29 = Prohibition in the Practice of Architecture and Penal Clause (contains actual prohibited acts + penalties)
- Section 30 = Prohibition in the Practice of Architecture (forcing architects to work without written contract)

Sections 27 and 28 do **not** establish prohibited acts or penalties. Only Sections 29-30 (IRR) are prohibitory. The article incorrectly lumps 27-28 together with the penal provisions.

**Impact:** `HIGH` — Students studying the wrong sections will misidentify which parts of RA 9266 contain prohibited acts.

**Linked Questions Affected:** Q1 (LEA-PRAC-LAW-003-001) references "RA 9266" generally; Q4 references "Sections 29-30" for penalties (correct), but the article body contradicts this specific reference.

---

## FLAG 2 — CRITICAL — Wrong Section References for Criminal Penalties

**Claim in Article (line 45):**
> "Sections 35-39 specify that violations of these prohibitions result in criminal penalties."

**Verdict:** `LIKELY_INCORRECT`

**Evidence:** In the RA 9266 IRR:
- Section 35 = Positions in Government Requiring Registered Architects
- Section 36 = Collection of Professional Fees
- Section 37 = Limitation to Registration of Firms
- Section 38 = Coverage of Temporary/Special Permits
- Section 39 = Liability Insurance

None of Sections 35-39 specify criminal penalties. The sole penal clause is **Section 29** of the IRR ("Prohibition in the Practice of Architecture and Penal Clause"), which establishes the fine (P100,000-P5,000,000) and imprisonment (6 months-6 years).

**Impact:** `CRITICAL` — Students directed to Sections 35-39 will find nothing about criminal penalties, creating confusion about where the actual penalty provisions are located.

**Linked Questions Affected:** Q4 (LEA-PRAC-LAW-003-004, model "LEA-PRAC-LAW-003-004")

---

## FLAG 3 — CRITICAL — Wrong Section Reference for Board's Quasi-Judicial Power

**Claim in Article (line 57):**
> "Section 7(i) authorizes the Board to 'hear and decide administrative cases involving violations of R.A. No. 9266, the IRR of the Architecture Act of 2004, the Code of Ethical Conduct and Standards of Professional Practice.'"

**Verdict:** `LIKELY_INCORRECT`

**Evidence:** In the RA 9266 IRR, Section 7 enumerates powers from (a) through (n):
- **Section 7(h):** "Hear and decide administrative cases involving violations of R.A. No. 9266, the 'IRR of the Architecture Act of 2004', the Code of Ethical Conduct and Standards of Professional Practice and for this purpose, to issue subpoena ad testificandum and subpoena duces tecum..."
- **Section 7(i):** "Prescribe guidelines for the Continuing Professional Development (CPD) program..."

The article cites **7(i)** but the correct subsection is **7(h)**. Section 7(i) is about CPD, not administrative hearings.

**Impact:** `HIGH` — Students will cite the wrong subsection number when referencing the Board's quasi-judicial power.

**Linked Questions Affected:** Q5 (LEA-PRAC-LAW-003-007) asks about due process under "Section 7(h)" which is correct — but the article body contradicts this by citing 7(i).

---

## FLAG 4 — MEDIUM — Overstated/Unverifiable Penalty Tiering Claims

**Claim in Article (line 45-46):**
> "Unauthorized practice without registration carries the minimum penalty; falsification of documents or continued practice after license suspension carries maximum penalties."

**Verdict:** `NEEDS_VERIFICATION`

**Evidence:** Section 29 of the IRR prescribes a single penalty range (P100,000-P5,000,000 fine, 6 months-6 years imprisonment) without explicitly tiering by violation type. The article's claim that certain violations "carry maximum penalties" while others "carry minimum penalties" is interpretive and not directly supported by the text of Section 29.

**Impact:** `LOW` — May be a reasonable interpretation but not explicitly stated in the source.

**Linked Questions Affected:** None directly.

---

## FLAG 5 — HIGH — Wrong Penalty Range in Linked Question Q4 (Article-Question Contradiction)

**Claim in Linked Question (LEA-PRAC-LAW-003-004, Q4):**
> Correct answer states fine is "not less than P5,000 nor more than P100,000"

**Verdict:** `CONTRADICTS_QUESTION` — The article text correctly states "not less than One hundred thousand pesos (P100,000.00) but not more than Five million pesos (P5,000,000.00)" — but the linked question's correct answer specifies a completely different range (P5,000-P100,000).

**Evidence:** Section 29 of the IRR: "fine of not less than One hundred thousand pesos (P100,000.00) but not more than Five million pesos (P5,000,000.00)." The question's penalty range is off by orders of magnitude (P100K vs P5K floor; P5M vs P100K ceiling). The **question is wrong** even though the article is correct on this point.

**Impact:** `CRITICAL` — Question Q4 has the wrong penalty range in its correct answer, contradicting both the article body and the actual law.

---

## Summary

| # | Flag | Verdict | Impact |
|---|------|---------|--------|
| 1 | Wrong section ref for prohibited acts (27-30 instead of 29-30) | LIKELY_INCORRECT | HIGH |
| 2 | Wrong section ref for penalties (35-39 instead of 29) | LIKELY_INCORRECT | CRITICAL |
| 3 | Wrong subsection (7(i) instead of 7(h)) | LIKELY_INCORRECT | HIGH |
| 4 | Unverifiable penalty tiering claim | NEEDS_VERIFICATION | LOW |
| 5 | Linked question Q4 has wrong penalty range | CONTRADICTS_QUESTION | CRITICAL |

**Total: 5 issues (2 CRITICAL, 2 HIGH, 1 LOW) affecting at least 2 linked questions.**
