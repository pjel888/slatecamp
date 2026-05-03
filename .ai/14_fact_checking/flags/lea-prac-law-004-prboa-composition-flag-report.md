# Flag Report: `lea-prac-law-004-prboa-composition-qualifications-and-terms-of-office`

**Article ID:** `1532843e-c068-4666-8c85-2e44982075c1`
**Article Slug:** `lea-prac-law-004-prboa-composition-qualifications-and-terms-of-office`
**Subject:** Professional Practice & Jurisprudence
**Linked Questions:** 10
**Sources:** sources.json = EMPTY (source_count: 0)
**Primary Source Verified Against:** RA 9266 IRR (24-page PDF)

---

## FLAG 1 — CRITICAL — Wrong Reappointment Term Length (Maximum Tenure Calculations Incorrect)

**Claim in Article (lines 49-53):**
> "Section 6 further states that 'Each member of the Board may be reappointed for one full additional term only.' This language is critical: it permits reappointment but limits it to a single additional term. Thus, the maximum tenure is:
> - Chairman: 3 years (initial) + 3 years (one additional term) = 6 years maximum
> - Member (2-year term): 2 years (initial) + 2 years (one additional term) = 4 years maximum
> - Member (1-year term): 1 year (initial) + 1 year (one additional term) = 2 years maximum"

**Verdict:** `LIKELY_INCORRECT`

**Evidence:** The RA 9266 IRR, Section 6 explicitly states:
> "Each member of the Board may be reappointed for **one full term of three (3) years**."

The IRR specifies the reappointment term is a uniform **three (3) years** for ALL members, regardless of their initial term length. The article incorrectly assumes the reappointment term equals the initial term length (1, 2, or 3 years).

The correct maximum tenure calculations are:
- Chairman: 3 years (initial) + 3 years (reappointment) = **6 years maximum** (matches article)
- Member (2-year initial term): 2 years + 3 years = **5 years maximum** (article says 4)
- Member (1-year initial term): 1 year + 3 years = **4 years maximum** (article says 2)

The article's numbers for the Members are wrong because it assumes the reappointment term is the same length as the initial term, but the IRR says the reappointment is always 3 years.

**Impact:** `HIGH` — Students memorizing wrong maximum tenures (4 and 2 years instead of 5 and 4 years) will answer exam questions incorrectly.

**Linked Questions Affected:** Q4 (LEA-PRAC-LAW-004-005, reappointment count), Q5 (LEA-PRAC-LAW-004-008, maximum tenure)

---

## FLAG 2 — HIGH — Sources.json Empty (No Citations Provided)

**Claim in Article:** Multiple specific claims about Section 4, 5, 6, 8, and 10 of RA 9266.

**Verdict:** `MISSING_CITATION`

**Evidence:** sources.json has `source_count: 0` and `sources: []`. The article provides zero source citations for 13+ separate factual claims about the PRBoA composition, qualifications, terms, appointment process, compensation, and organizational deadlines.

**Impact:** `HIGH` — Without citations, students cannot independently verify the regulatory framework being taught. This article is entirely uncited despite containing very specific section references.

**Linked Questions Affected:** All 10 linked questions.

---

## FLAG 3 — LOW — Article Claims "Sections 4-6" Cover Faculty Conflict of Interest Requirement

**Claim in Article (line 31):**
> "the member cannot have pecuniary interest in such institutions. No faculty member can become a Board member unless they have officially resigned and completely stopped teaching, advising, or reviewing activities at least five (5) years before nomination."

**Verdict:** `LIKELY_CORRECT` (Verified)

The IRR Section 5(d) confirms: "No former member of the faculty of any school, institute, university or review center where architecture is taught can become a member of the Board unless he/she had officially resigned from such an institution and has completely stopped teaching, advising or reviewing activities for at least five (5) years prior to the nomination."

Confirmed accurate. No flag.

---

## Summary

| # | Flag | Verdict | Impact |
|---|------|---------|--------|
| 1 | Wrong reappointment term/maximum tenure calculations | LIKELY_INCORRECT | HIGH |
| 2 | No source citations (sources.json empty) | MISSING_CITATION | HIGH |
| 3 | Faculty/prohibition description | LIKELY_CORRECT | — (no flag) |

**Total: 2 issues (1 HIGH factual error, 1 HIGH missing citation) affecting at least 2 linked questions.**

**Note:** All other claims about PRBoA composition (3 members, appointment process, 6 qualifications, staggered terms, administrative supervision, compensation, oath, transitional provisions, and organizational deadline) were verified as CORRECT against the RA 9266 IRR.
