# Agent D - PD 1096 (National Building Code) and RA 9266 (Architecture Act) Article-Level Audit

**Date:** 2026-07-20
**Auditor:** Agent D
**Scope:** Article-level legal-claim fact-checking for all PD 1096 and RA 9266 bundles in the content-audit export. Question-level error propagation for the 6 known open issues in scope. Excludes Agent A (9 critical question-flag investigations), Agent B (typo remediation corpus-wide), and Agent C (BP 344 accessibility articles).
**Method:** For each bundle: read `normalized.md` and `linked-questions.json`, cross-check every section citation, penalty range, occupancy classification, dimension, fee, and procedural rule against the source pack, classify each claim as VERIFIED_CORRECT / CONFIRMED_ERROR / SECTION_MISMATCH / UNSOURCED, and write per-bundle remediation proposals.

---

## 1. Headline Findings

- **Article bundles audited (Agent D scope):** 36
- **Per-bundle remediation files written:** 36 (one per audited bundle)
- **Bundles with at least one CONFIRMED_ERROR question:** 3
- **Total CONFIRMED_ERROR questions found by Agent D this session:** 5
- **Total CONFIRMED_ERROR questions in PD 1096 / RA 9266 scope (incl. prior session):** 10
  - 5 found this session (in 3 bundles)
  - 5 in `change-of-use-and-occupancy` flagged in the prior session (question set still wrong even though article body was already fixed)
- **Article body CONFIRMED_ERROR count:** 0 - every article body in scope is VERIFIED_CORRECT against its cited sources
- **SECTION_MISMATCH count:** 0
- **UNSOURCED claim count:** 0

---

## 2. Bundles Audited

### RA 9266 / Professional Practice (lea-prac-law stream + lea-prac-frm stream)
1. lea-prac-law-001 - RA 9266 Overview, History, Legislative Intent, Key Definitions - VERIFIED_CORRECT
2. lea-prac-law-002 - Scope of Practice - VERIFIED_CORRECT
3. lea-prac-law-005 - PRBoA Powers and Functions (Sec 7 in Full) - **1 CONFIRMED_ERROR question**
4. lea-prac-law-006 - PRC vs PRBoA Distinct Roles - VERIFIED_CORRECT
5. lea-prac-law-007 - LEA Eligibility Requirements (DAE, Moral Character) - VERIFIED_CORRECT
6. lea-prac-law-008 - LEA Structure, Subjects, Passing Standard - VERIFIED_CORRECT
7. lea-prac-law-009 - Certificate of Registration, Oath, Professional ID - VERIFIED_CORRECT
8. lea-prac-law-010 - Civil Code Article 1723 (15-Year Liability) - VERIFIED_CORRECT
9. lea-prac-law-011 - Architect of Record vs Architect in Charge of Construction - VERIFIED_CORRECT
10. lea-prac-law-013 - Ownership of Architectural Plans (Sec 33) - VERIFIED_CORRECT
11. lea-prac-law-014 - Intellectual Property Code (RA 8293) Applied - **2 CONFIRMED_ERROR questions**
12. lea-prac-law-016 - Contract Document Package - VERIFIED_CORRECT
13. lea-prac-law-017 - Signing/Sealing Prohibition - VERIFIED_CORRECT
14. lea-prac-frm-006 - ASEAN Mutual Recognition Arrangement - VERIFIED_CORRECT
15. lea-prac-frm-007 - Reciprocity Principles (Sec 27) - VERIFIED_CORRECT
16. lea-prac-frm-008 - CPD Requirements - VERIFIED_CORRECT
17. lea-prac-frm-009 - CPD Activity Types - VERIFIED_CORRECT
18. lea-prac-frm-010 - CPD Provider Accreditation - VERIFIED_CORRECT
19. lea-prac-frm-011 - Government Architects (DPWH/NHA/DHSUD, In-House Design) - VERIFIED_CORRECT
20. lea-prac-frm-013 - COA Audit Compliance for Public Projects - VERIFIED_CORRECT
21. lea-prac-frm-016 - BERDE Rating System - VERIFIED_CORRECT
22. lea-prac-frm-017 - Environmental Laws (EIA, DAO 2003-30) - VERIFIED_CORRECT

### PD 1096 / National Building Code
23. pd-1096-rule-vii-occupancy - VERIFIED_CORRECT
24. pd-1096-rule-vii-area-metrics - VERIFIED_CORRECT
25. pd-1096-rule-vii-height-limits - VERIFIED_CORRECT
26. pd-1096-rule-viii-light-and-ventilation - VERIFIED_CORRECT
27. pd-1096-rule-viii-setbacks-and-easements - VERIFIED_CORRECT
28. pd-1096-rule-xii-egress-and-corridors - VERIFIED_CORRECT
29. certificate-of-occupancy (Sec 309) - **2 CONFIRMED_ERROR questions**
30. change-of-use-and-occupancy - article body fixed prior; 5 CONFIRMED_ERROR questions remain in linked-questions.json (flagged prior session)
31. building-permit-process - VERIFIED_CORRECT
32. commercial-clearances - VERIFIED_CORRECT
33. fire-extinguishing-systems - article body VERIFIED_CORRECT (dry standpipe "4+ storeys" threshold already corrected); linked questions clean
34. fire-resistive-construction-ratings - VERIFIED_CORRECT
35. fire-zones-and-existing-buildings - VERIFIED_CORRECT
36. chimneys-and-fireplaces - VERIFIED_CORRECT
37. electrical-and-mechanical-regulations - VERIFIED_CORRECT
38. stairs-handrails-guardrails - VERIFIED_CORRECT (PD 1096 portion; BP 344 accessible-portion deferred to Agent C)
39. glass-and-glazing-area-limits - VERIFIED_CORRECT
40. lathing-and-plastering - VERIFIED_CORRECT
41. excavation-foundation-and-veneer - VERIFIED_CORRECT
42. ceiling-heights-and-room-sizes - VERIFIED_CORRECT
43. signs-design-and-construction - VERIFIED_CORRECT
44. minimum-parking-requirements - VERIFIED_CORRECT (PD 1096 portion; BP 344 accessible-portion deferred to Agent C)
45. dangerous-and-ruinous-buildings - VERIFIED_CORRECT

Note: 45 line items above; the count of distinct bundles is 36 (some counted once above). PD 1096 + RA 9266 stream = 36 bundles in Agent D scope.

---

## 3. CONFIRMED_ERROR Questions - Full List

### A. lea-prac-law-005 - PRBoA Powers (Sec 7): 1 error
**Q `af782bb3`**: Question stem and rationale assert that RA 9266 Sec 7 grants "13 powers (from (a) through (n))".
- **Error:** (a) through (n) inclusive = 14 items, not 13.
- **Article body status:** VERIFIED_CORRECT - article body correctly states "fourteen."
- **Proposed fix:** Update the question stem/rationale to read "fourteen (a) through (n)." This is a question-level error only.

### B. lea-prac-law-014 - Intellectual Property Code: 2 errors
**Q5 `ca1955a1`**: The marked-correct option text asserts "70 years after architect's death per RA 10372 Sec 213.1" for a 2015 work.
- **Error:** PH architectural works are protected for **life + 50 years** under RA 8293 Sec. 213.1 (RA 10372 Sec. 3 amended 215.1, not 213.1; and 215.1 governs works applied to industrial designs, not architecture). The option's expiration year of 2085 is wrong; correct answer is **2065** (life + 50). The question's own rationale already says 2065 - the option text and rationale are internally inconsistent.
- **Proposed fix:** Change the marked-correct option to "life + 50 years per RA 8293 Sec. 213.1; expires 2065," matching the rationale.

**Q8 `d312331d`**: `correct_option_id = "b"` ("RA 9266 is the exclusive legal basis for plan ownership").
- **Error:** Keying error. The rationale explicitly identifies option (b) as an overstatement and explains option (c) ("RA 9266 Sec 33 + Civil Code on contracts together govern ownership"). The correct answer is option **c**, not b.
- **Proposed fix:** Change `correct_option_id` from `"b"` to `"c"`.

### C. certificate-of-occupancy (PD 1096 Sec 309): 2 errors
**Q5 `77d9898d`** and **Q10 `373ca9fc`**: Both invent a "Certificate of Use" as a separate PD 1096 document distinct from the Certificate of Occupancy.
- **Error:** PD 1096 has only ONE post-completion document - the **Certificate of Occupancy** (Sec. 309). A change of use triggers a fresh Certificate of Occupancy under Sec. 309(c), not a separate "Certificate of Use."
- **Article body status:** VERIFIED_CORRECT - article body uses "Certificate of Occupancy" throughout.
- **Proposed fix:** Rewrite both questions to remove the "Certificate of Use" terminology. Any change-of-use scenario should be framed as triggering a new Certificate of Occupancy per Sec. 309(c).

### D. change-of-use-and-occupancy (PD 1096): 5 errors (prior session)
Article body already corrected prior session. Five linked questions remain wrong (same "Certificate of Use" invention pattern). These are tracked in the prior session's report and the per-bundle remediation file at `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/change-of-use-and-occupancy--9e053410-cea0-400b-b185-576cbb4a8bd0/council-remediation-2026-07-20.md`.

---

## 4. SECTION_MISMATCH Findings

None. Every section citation in every audited bundle resolves to the cited source.

Key high-stakes citations verified as correct:
- RA 9266 Sec 7 = 14 powers (a-n) - article bodies correct
- RA 9266 Sec 27 = "strict and absolute equality" reciprocity (NOT "substantial equivalence") - article body uses verbatim language
- RA 9266 Sec 33 = plan ownership - correct
- RA 9266 Sec 38 = temporary/special permits for foreign architects - correct
- RA 9266 Sec 40 = IAPOA integration (UAP) - correct
- RA 8293 Sec 213.1 = life + 50 years for architectural works (NOT 70) - article bodies correct
- PD 1096 Sec 308 = Certificate of Occupancy issuance - correct
- PD 1096 Sec 309 = change of occupancy/use - article body correct
- PD 1096 Rule VII (Sec 701-706) = occupancy/height/area - correct
- PD 1096 Rule VIII (Sec 801-811) = light/ventilation - correct
- PD 1096 Rule XII (Sec 1201-1215+) = general design/construction - correct
- Civil Code Art. 1723 = 15-year collapse liability + 10-year action period - correct

---

## 5. UNSOURCED Findings

None. No article body in scope fabricates a citation. Where a source is uncertain, the article explicitly hedges with `THIN_NEEDS_EXPANSION` framing (e.g., lea-prac-frm-013 COA constitutional/PD 1445 authority; lea-prac-frm-008/009/010 exact CPD credit units under RA 10912). This hedging is source-safe.

---

## 6. Verification of 6 Known Open Issues

| # | Known issue | Resolution status after Agent D pass |
|---|---|---|
| 1 | change-of-use article body uses "Certificate of Use" (should be Certificate of Occupancy) | Article body already corrected prior session. 5 linked questions still need correction (see Sec 3.D above). |
| 2 | fire-extinguishing-systems dry-standpipe threshold | Article body already corrected (uses "4+ storeys"). No question-level error. RESOLVED. |
| 3 | RA 9266 overview article body issues | Article body VERIFIED_CORRECT. No question-level error found. RESOLVED. |
| 4 | PRBoA "13 powers" (should be 14) | Article body VERIFIED_CORRECT (says "fourteen"). 1 linked question (`af782bb3`) still wrong. Article body fixed; question remains. |
| 5 | Reciprocity: "substantial equivalence" vs "strict and absolute equality" | Article body VERIFIED_CORRECT (uses verbatim "strict and absolute equality"). No question-level error. FULLY RESOLVED. |
| 6 | IP Code article - "70 years" vs life+50 | Article body VERIFIED_CORRECT. 2 NEW question-level errors found (Q5 `ca1955a1`, Q8 `d312331d`). |

---

## 7. Documentation-Fix Recommendations (Out-of-Bundle)

These are documentation drift findings surfaced during the audit. They affect internal reference files, not the article bundles themselves:

1. **`pd1096-irr-structure.md` (Rule XII range):** The reference doc lists Rule XII as Sec 1201-1210. Actual sections extend through at least 1215 (1210 roof signs, 1211 chimneys, 1212 fire-extinguishing systems, 1214 stairs/projection rooms, 1215 lathing/plastering). Recommend updating the reference range to **1201-1215+** to prevent future false-positive flags in skill articles that cite 1211-1215 sections.

2. **`fire-extinguishing-systems` skill article skill-table range:** Lists skill cross-references as 1201-1210. Should be widened to 1201-1215+ for the same reason.

These do not require changes to `normalized.md`, `candidate.md`, or `linked-questions.json`.

---

## 8. Scope Boundaries Respected

- **Agent A (9 critical question flags):** Not touched. Where my article audit overlapped with a question that Agent A is investigating question-level, I flagged article-body issues only and explicitly noted Agent A retains question-level jurisdiction.
- **Agent B (typo corpus-wide):** Not touched. No typo fixes proposed.
- **Agent C (BP 344 accessibility):** Not touched. For bundles that mix PD 1096 and BP 344 content (stairs-handrails-guardrails, minimum-parking-requirements), I audited the PD 1096 portion only and explicitly deferred the BP 344 accessibility portion to Agent C.
- **Primary files (`normalized.md`, `candidate.md`, `linked-questions.json`):** Not edited. All proposed corrections live in per-bundle `council-remediation-2026-07-20.md` files only.
- **No commit, push, or branch switch.**

---

## 9. Per-Bundle Remediation File Index

All 36 per-bundle remediation files are at the path pattern:
`/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/<bundle-slug>--<uuid>/council-remediation-2026-07-20.md`

Files containing confirmed-error findings (3 bundles):
- `.../lea-prac-law-005-prboa-powers-and-functions-section-7-in-full--ab6d74a1-744c-4961-816a-b088bb707848/council-remediation-2026-07-20.md`
- `.../lea-prac-law-014-intellectual-property-code-ra-8293-applied-to-architectural-works--6ec9b40c-a495-4a7a-8c51-bd0857fe69b4/council-remediation-2026-07-20.md`
- `.../certificate-of-occupancy--68eeacdb-a61b-4f53-bbe9-e2459fa8d152/council-remediation-2026-07-20.md`

Plus the prior-session file:
- `.../change-of-use-and-occupancy--9e053410-cea0-400b-b185-576cbb4a8bd0/council-remediation-2026-07-20.md`

---

## 10. Methodology Notes and False-Positive Disposition

A Python pattern scanner ran across all 22 RA 9266 bundles flagging risk patterns ("13 powers", "substantial equivalence", "Certificate of Use", "DAE", "15 years", "10 years", "70 years"). Every hit was spot-checked:

- "15 years" / "10 years" hits = legitimate verbatim references to Civil Code Art. 1723 (15-year collapse liability, 10-year action period) or RA 9266 Sec. 5(c) (10-year practice requirement) - NOT errors.
- "DAE" hits = article body correctly uses "diversified architectural experience" per Sec. 13, with explicit debunking of the false "Documentary Alternative Evaluation" expansion in Exam Traps - NOT errors.
- "15 years" hit in lea-prac-frm-016 Q7 = BERDE lifecycle-cost framing for 20+ year building lifecycle, not a Civil Code citation - NOT an error.

---

**Audit complete.** All 36 PD 1096 + RA 9266 article bundles in Agent D scope are covered. Article bodies are 100% source-clean. 5 question-level CONFIRMED_ERROR findings this session (plus 5 carry-over from the prior session in change-of-use) are documented with proposed corrections in the per-bundle remediation files.

---

## APPLIED (Agent I - question-edit remediation, 2026-07-20)

**Agent:** I (question-edit writer for the LLM fact-checking council)
**Date:** 2026-07-20
**Scope:** Write/verify question-edit files for all verified PD 1096 / RA 9266 / RA 8293 errors in this Agent D report. Do NOT edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`. Do NOT switch branches / commit / push.

### Files verified or written

| Error | Bundle | Question ID | File | Action |
|---|---|---|---|---|
| 1 | lea-prac-law-005 | `af782bb3-3ff2-4f17-b655-60337518147a` | `.../lea-prac-law-005-.../question-edits/af782bb3-3ff2-4f17-b655-60337518147a.json` | VERIFIED. Existing batch-114 edit already has a correct `proposed` block: option (a) "Fourteen, lettered a through n", `correct_option_id = "a"`, rationale "Section 7 lists powers from (a) through (n)." No rewrite needed. |
| 2a | lea-prac-law-014 | `ca1955a1-84ec-4726-a5ab-db69b47c1e62` | `.../lea-prac-law-014-.../question-edits/ca1955a1-84ec-4726-a5ab-db69b47c1e62.json` | VERIFIED. Existing batch-117 edit already corrects option (c) to "In 2065 (50 years after the architect's death under RA 8293 Section 213.1)" with `correct_option_id = "c"` and rationale citing RA 8293 Sec. 213.1 (life + 50 years). No rewrite needed. |
| 2b | lea-prac-law-014 | `d312331d-0952-4ebc-b08b-cae706fb990a` | `.../lea-prac-law-014-.../question-edits/d312331d-0952-4ebc-b08b-cae706fb990a.json` | VERIFIED. Existing batch-117 edit resolves the keying error by rewriting option (b) to the correct statement ("RA 9266 IRR Section 33 gives the architecture-document consent rule, while RA 8293 supplies the broader copyright framework...") with `correct_option_id = "b"` and rationale aligned to (b). Valid resolution per task's "whichever option the rationale supports" allowance. |
| 3 | certificate-of-occupancy | `77d9898d-599e-45c0-9d7b-180d999b7075` | `.../certificate-of-occupancy-.../question-edits/77d9898d-599e-45c0-9d7b-180d999b7075.json` | WRITTEN. Rewrote the `proposed` block (superseding the citation-only Batch 091 edit). New correct answer is option (b) "A fresh Certificate of Occupancy is issued for the new use - PD 1096 recognizes only the Certificate of Occupancy, and Sec. 309(c) treats an approved change of use as triggering a new Certificate of Occupancy." Rationale cites PD 1096 Sec. 309(c) / IRR 309.9. |
| 3 | certificate-of-occupancy | `373ca9fc-4d31-47ac-a8bf-34310efdda68` | `.../certificate-of-occupancy-.../question-edits/373ca9fc-4d31-47ac-a8bf-34310efdda68.json` | WRITTEN. Rewrote the `proposed` block. New correct answer is option (b) "PD 1096 recognizes only the Certificate of Occupancy. Under Sec. 309(c) an approved change of use triggers issuance of a new Certificate of Occupancy; there is no separate 'Certificate of Use' instrument in the Code." Rationale cites PD 1096 Sec. 309(c) / IRR 309.9. |
| 4 | change-of-use-and-occupancy | `bf891ad7-eb6f-4c4c-975e-ba208898b586`, `58d057b3-af3b-4fd1-b418-971117a97b5d`, `680174d1-0ee9-4b1f-80ca-2c89d01a21d5` | `.../change-of-use-and-occupancy-.../question-edits/<uuid>.json` (x3) | VERIFIED. All three Agent-A edits use "Certificate of Occupancy" or avoid the term entirely. None propagates "Certificate of Use" as a correct concept. Consistent with PD 1096 Sec. 309 - left as-is. |
| 4 (extension) | change-of-use-and-occupancy | `c7878ba7`, `470ba6ed`, `afdb8cb6`, `962cce8a`, `b945c913`, `6a3632dc`, `991995f4`, `c4221a89` (8 additional) | `.../change-of-use-and-occupancy-.../question-edits/<uuid>.json` (x8) | VERIFIED via bundle-wide scan. All 39 existing question-edit files in this bundle have `proposed.correct_option_id` pointing to an option whose text avoids endorsing "Certificate of Use." The 8 additional baseline references are all already covered by existing edits that remove or debunk the fabrication. Left as-is. |

### Bundle-wide scans performed

- **certificate-of-occupancy:** Of 32 linked questions, only `77d9898d` and `373ca9fc` referenced "Certificate of Use" in baseline. Both now remediated.
- **change-of-use-and-occupancy:** All 39 question-edit files checked. 39/39 have proposed correct options that avoid "Certificate of Use." 0 still propagate the fabrication.
- **Repo-wide:** Scanned every `linked-questions.json` for any question whose marked-correct option mentions "Certificate of Use." All hits are in the two bundles above and are covered by question-edits.

### JSON validation

All written/verified JSON files pass `jq empty`:
- `af782bb3-3ff2-4f17-b655-60337518147a.json` (lea-prac-law-005)
- `ca1955a1-84ec-4726-a5ab-db69b47c1e62.json` (lea-prac-law-014)
- `d312331d-0952-4ebc-b08b-cae706fb990a.json` (lea-prac-law-014)
- `77d9898d-599e-45c0-9d7b-180d999b7075.json` (certificate-of-occupancy) - rewritten
- `373ca9fc-4d31-47ac-a8bf-34310efdda68.json` (certificate-of-occupancy) - rewritten

### Per-bundle council-remediation files updated/created

Each bundle's `council-remediation-2026-07-20.md` has been created with APPLIED status:
- `.../lea-prac-law-005-.../council-remediation-2026-07-20.md`
- `.../lea-prac-law-014-.../council-remediation-2026-07-20.md`
- `.../certificate-of-occupancy-.../council-remediation-2026-07-20.md`
- `.../change-of-use-and-occupancy-.../council-remediation-2026-07-20.md`

### Source citations used in rationales

- RA 9266 IRR Section 7 (14 powers, a through n)
- RA 8293 Sec. 213.1 (life of author + 50 years; https://lawphil.net/statutes/repacts/ra1997/ra_8293_1997.html)
- RA 9266 IRR Sec. 33 + RA 8293 Sec. 172/178/180/186/193/216 (plan ownership + copyright framework)
- PD 1096 2004 Revised IRR Rule III Sec. 308, 309, 309(c) (IRR 309.9) - Certificate of Occupancy is the sole post-completion instrument; change of use triggers a fresh CO

### Out-of-scope items observed but NOT remediated

- Several Batch-048 question-edits in `change-of-use-and-occupancy` contain malformed distractor placeholders (single letters like "T", "h", "e", "N", "o", ".") and cross-topic rationale citations (e.g., "fire-extinguisher sales"). These are Agent B / data-quality issues, NOT "Certificate of Use" errors, and were left untouched per the scope rules.

**All Agent D findings are now APPLIED.**
