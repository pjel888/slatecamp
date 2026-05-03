# Linked Questions Audit: Propagation of Article Errors

**Generated:** 2026-05-02
**Scope:** 7 articles with confirmed factual errors → checking their linked questions for error propagation
**Audit Method:** Compare each question's correct answer/key and rationale against verified legal sources (PDFs in 001_Raw-Source-Layer/)

---

## Summary of Findings

| Article | UUID | Linked Qs | Questions with Error Propagation | Questions OK | Impact |
|---------|------|-----------|--------------------------------|-------------|--------|
| Universal Design / BP 344 | 9eb0b48e | 10 | 1 (Q4) | 9 | CRITICAL |
| RA 9266 Overview | 02a5ba32 | 10 | 1 (Q8) | 9 | MEDIUM |
| Prohibited Acts / Penalties | 3d48211b | 10 | 1 (Q4) | 9 | CRITICAL |
| PRBOA Powers | ab6d74a1 | 10 | 1 (Q1) | 9 | MEDIUM |
| Change of Use | 9e053410 | 39 | 2+ (Q4, Q21+) | 37 | HIGH |
| Fire Extinguishing Systems | f61a5716 | 41 | 0 | 41 | LOW (error not tested) |
| Reciprocity | e51e9a56 | 10 | 2 (Q2, Q8) | 8 | HIGH |
| **TOTAL** | | **130** | **~8+** | **~122** | |

---

## Article 1: Universal Design / BP 344 (9eb0b48e)
**Article Error:** Ramp slope standard — claims 1:12 max when 2024 Revised IRR states 1:20
**Flag Report Ref:** Flag 1 — CRITICAL

### Question Q4 (b2951761) — PROPAGATES ERROR
- **Model ID:** LEA-PRAC-FRM-018-004
- **Question:** "What is the recommended ramp slope ratio according to BP 344?"
- **Correct Answer (b):** "1:12 preferred, steeper allowed temporarily with conditions"
- **Rationale:** Explicitly states "BP 344 specifies maximum ramp slope of 1:12 (1V:12H) for permanent ramps; maximum 1:20 allowed temporarily" and calls 1:20 "too shallow" and "generally not recommended"
- **Verified Correct:** 2024 Revised IRR states "Gradient not steeper than 1:20" as the general standard. 1:12 appears only for swimming pool transfer walls.
- **Verdict:** PROPAGATES ERROR — The question's correct answer and rationale both teach the outdated 1:12 standard. The question even disparages 1:20 as "too shallow." Both the article and this question must be corrected to reflect the 2024 Revised IRR's 1:20 standard.

### Other 9 questions — NO ERROR PROPAGATION
Questions Q1, Q2, Q3, Q5, Q6, Q7, Q8, Q9, Q10 test general accessibility principles, liability, vision accessibility features, etc. — none tied to the ramp slope error.

---

## Article 2: RA 9266 Overview (02a5ba32)
**Article Error:** Section 41 attributed as IAPOA nomination source (actually Section 4)
**Flag Report Ref:** Flag 2 — CONFIRMED INCORRECT

### Question Q8 (7e4e697d) — PROPAGATES ERROR
- **Model ID:** LEA-PRAC-LAW-001-008
- **Question:** "Which organization does Section 41 designate as the source from which PRBoA nominees must be drawn?"
- **Correct Answer (a):** "IAPOA (Integrated and Accredited Professional Organization of Architects, now UAP)"
- **Rationale:** "Section 41 of RA 9266 designates the IAPOA...as the exclusive source from which PRBoA nominees are submitted to the Commission."
- **Verified Correct:** Section 4 designates IAPOA as the nomination source. Section 41 is about IRR/Code adoption and mentions IAPOA only as a coordinating body.
- **Verdict:** PROPAGATES ERROR — Both the question and article cite Section 41 as the IAPOA designation section. The correct reference is Section 4.

### Other 9 questions — NO ERROR PROPAGATION
Q1 (liability distinction), Q2 (repealed law), Q3 (board composition), Q4 (appointment experience), Q5 (staggered terms), Q6 (structural conceptualization), Q7 (Vitruvian principles), Q9 (reappointment), Q10 (enactment date) — all substantively correct or test general principles not tied to the section attribution error.

---

## Article 3: Prohibited Acts / Penalties (3d48211b)
**Article Errors:**
- Flag 1: Wrong section refs for prohibited acts (claims 27-30 instead of 29-30)
- Flag 2: Wrong section refs for penalties (claims 35-39 instead of 29)
- Flag 5: Linked question Q4 has wrong penalty range

### Question Q4 (032522de) — PROPAGATES ERROR (QUESTION ITSELF WRONG)
- **Model ID:** LEA-PRAC-LAW-003-004
- **Question:** "What penalties does RA 9266 impose for violation of its prohibitions?"
- **Correct Answer (b):** "A fine of not less than P5,000 nor more than P100,000, or imprisonment of not less than 6 months nor more than 6 years, or both."
- **Rationale:** "Sections 29-30 specify criminal penalties" (this section ref is actually correct for the question itself)
- **Verified Correct (Section 29 of IRR):** "fine of not less than One hundred thousand pesos (P100,000.00) but not more than Five million pesos (P5,000,000.00)"
- **Verdict:** PROPAGATES ERROR — The question's correct answer specifies fines of P5,000-P100,000, which is off by orders of magnitude from the actual P100,000-P5,000,000 range. Note: The article body actually states the correct penalty range (P100K-P5M), but the linked question contradicts both the article and the law. This is a data corruption error in the question bank independent of the article's section reference errors.

### Other 9 questions — NO ERROR PROPAGATION
Q1 (foundational prohibition), Q2 (fraudulent licensure), Q3 (suspension vs revocation), Q5 (due process under 7h), Q6 (relationship between criminal/disciplinary/civil), Q7 (ethical code violations), Q8 (group A dwellings), Q9 (disciplinary authority), Q10 (Civil Code Art 1723 relationship) — these test general principles and are not affected by the article's section reference errors.

---

## Article 4: PRBOA Powers (ab6d74a1)
**Article Error:** Claims 13 powers from (a) through (n); actual count is 14
**Flag Report Ref:** Flag 1 — LIKELY_INCORRECT

### Question Q1 (af782bb3) — PROPAGATES ERROR
- **Model ID:** LEA-PRAC-LAW-005-001
- **Question:** "How many specific powers and functions are enumerated in Section 7 of RA 9266?"
- **Correct Answer (c):** "13 powers (from (a) through (n))"
- **Rationale:** "Section 7 lists powers (a) through (n), creating a 13-part enumeration"
- **Verified Correct:** Section 7 enumerates (a) through (n) = 14 distinct powers.
- **Verdict:** PROPAGATES ERROR — Both the article and question claim 13 powers when the correct count is 14. Both must be updated.

### Other 9 questions — NO ERROR PROPAGATION
Q2 (Section 7(b) core power), Q3 (Section 7(a) rulemaking), Q4 (Section 7(h) disciplinary tools), Q5 (Section 7(i) CPD), Q6 (Section 7(d) credential authority), Q7 (Board/Commission relationship), Q8 (adaptive power 7f), Q9 (7j/7l education alignment), Q10 (public trustee vs guild) — these test individual power descriptions which are substantively correct.

---

## Article 5: Change of Use (9e053410)
**Article Errors:**
- Flag 1: Wrong occupancy group labels (Group H = "high-hazard", Group G = "mercantile", Group A = "low-cost residential")
- Flag 2: "Certificate of Use" vs "Certificate of Occupancy" — IRR says Certificate of Occupancy for changes in use
- Flag 3: Section 709 cited for CO (correct is Section 309)

### Question Q4 (bf891ad7) — PROPAGATES ERROR (OCCUPANCY LABELS + CERTIFICATE OF USE)
- **Model ID:** (null — appears to be bulk-generated)
- **Question:** "A former warehouse (Group E-2) is being converted to a grocery store (Group G, mercantile)..."
- **Correct Answer (b):** "The change may be approved as less hazardous with a Certificate of Use"
- **Rationale uses wrong hazard hierarchy:** "High-hazard (H) > Industrial/Storage (F/E) > Educational/Institutional/Residential (C/D/B) > Low-cost Residential (A) > Mercantile (G) > Miscellaneous (J)"
- **Verified Correct:** Group E = Business and Mercantile, Group G = Storage and Hazardous, Group H = Assembly Other Than Group I. The IRR labels and hierarchy are fundamentally different from what the question teaches.
- **Verdict:** PROPAGATES ERROR — The question propagates all three occupancy group errors (Group G as "mercantile", Group H as "high-hazard", Group A as "low-cost residential") AND the "Certificate of Use" error.

### Question Q21+ — Multiple questions propagate "Certificate of Use" ERROR
At least 6 questions refer to "Certificate of Use" as the document issued for change of occupancy:
- Q2 (680174d1) — Rationale mentions "Certificate of Use for existing buildings"
- Q4 (bf891ad7) — Correct answer says "Certificate of Use"
- Q6 (c7878ba7) — Rationale uses "Certificate of Use" in mnemonic
- Q10 (470ba6ed) — Process sequence uses "Certificate of Use"
- Q18 (1167) — "What document does the Building Official issue?" — Answer: "A Certificate of Use"
- Q24 (1339-1356) — "Certificate of Use" appears in multiple rationales

**Verified Correct:** The IRR states "no change in the existing use or occupancy classification... shall be made until the Building Official has issued a Certificate of Occupancy therefor." (PD 1096 original text, page 364). Section 309.9 also states "other Certificates of Occupancy due to changes in use."

### Questions about occupancy types:
- Q18 (line 715): "Group A Div. 1 includes which of the following uses under Sec. 701?" — Rationale says "Group A includes more than just houses... Business/mercantile → Group E" — This is actually CORRECT in classifying mercantile as Group E, contradicting the article's Group G label. Partial inconsistency within the question bank.

### Other questions — MIXED
39 questions total. Many test general change-of-use principles (hazard assessment, Building Official authority, B-12 form, process sequence) that are substantively correct. The main propagation is through "Certificate of Use" terminology and the wrong hazard hierarchy.

---

## Article 6: Fire Extinguishing Systems (f61a5716)
**Article Error:** "≤ 950 m from the ground" instead of "≤ 950 sq.m floor area"
**Flag Report Ref:** Flag 1 — HIGH

### All 41 questions — NO ERROR PROPAGATION
Despite thorough checking, none of the 41 linked questions test the dry standpipe area threshold directly. Questions test:
- Fire-extinguishing system triggers (area/occupant load thresholds) — correct
- Dry standpipe test pressure (20 kg/sq.cm) — correct
- Outlet diameters (dry 63mm, wet 38mm) — correct
- Siamese sizing (100-2, 125-3, 150-4) — correct
- Flow rates (dry 900 L/min, wet 190 L/min) — correct
- Fire pump specs (1,000 L/min, 2 kg/sq.cm) — correct
- Outlet heights (max 1.20m) — correct

The article's error ("950 m from the ground" instead of "950 sq.m floor area") is not tested by any linked question. The practical impact is therefore LOW for the question bank, though the article itself needs correction.

---

## Article 7: Reciprocity (e51e9a56)
**Article Errors:**
- Flag 2: Claims "reciprocity OR substantial equivalence" — Section 27 requires reciprocity only
- Flag 4: Claims Section 38 temporary permits required for ALL foreign architects (incorrect — only for those without Philippine licensure)

### Question Q2 (fffa260f) — CONTRADICTS ARTICLE (QUESTION IS CORRECT, ARTICLE IS WRONG)
- **Model ID:** LEA-PRAC-FRM-007-002
- **Question:** "What is required before a foreign national is permitted to take the Philippine licensure examination?"
- **Correct Answer (b):** "Proof that reciprocity exists between countries"
- **Rationale:** "RA 9266 Section 27 requires proof that reciprocity exists"
- **Verified Correct:** Section 27 requires reciprocity proof only — no "substantial equivalence" alternative.
- **Verdict:** QUESTION IS CORRECT; ARTICLE IS WRONG. The question's correct answer contradicts the article's erroneous claim about "substantial equivalence." This creates a user-facing contradiction — students using both resources get mixed signals.

### Question Q8 (f1d8b55e) — QUESTION CORRECTLY DISTINGUISHES RECIPROCITY FROM PERMITS
- **Model ID:** LEA-PRAC-FRM-007-008
- **Question:** "Do temporary or special permits for foreign architects require reciprocity status?"
- **Correct Answer (b):** "No, temporary and special permits remain discretionary Board decisions"
- **Rationale:** "Reciprocity establishes licensure examination eligibility; temporary and special permits remain discretionary Board decisions independent of reciprocity status."
- **Verified Correct:** Section 38 applies independently of reciprocity. A foreign architect from a non-reciprocal country can still get a Section 38 permit.
- **Verdict:** QUESTION IS CORRECT; ARTICLE IS WRONG. The article claims "all foreign architects, including those from reciprocal countries, must secure a temporary/special permit" — the question correctly recognizes these as independent pathways.

### Other 8 questions — OK
Q1 (basic principle), Q3 (unconditional recognition), Q4 (strict and absolute equality), Q5 (Board assessment method), Q6 (reciprocity use for planning), Q7 (automatic practice), Q9 (double fees), Q10 (country reciprocity changes) — all substantively correct and consistent with Section 27.

---

## Detailed Flagged Questions Table

| # | Article | Q ID | Model ID | Issue | Error Type | Severity |
|---|---------|------|----------|-------|------------|----------|
| 1 | 9eb0b48e | b2951761 | LEA-PRAC-FRM-018-004 | Ramp slope 1:12 vs 1:20 | Wrong factual claim in answer | CRITICAL |
| 2 | 02a5ba32 | 7e4e697d | LEA-PRAC-LAW-001-008 | §41 vs §4 for IAPOA nomination | Wrong section reference | MEDIUM |
| 3 | 3d48211b | 032522de | LEA-PRAC-LAW-003-004 | Penalty range P5K-P100K vs P100K-P5M | Wrong factual values in answer | CRITICAL |
| 4 | ab6d74a1 | af782bb3 | LEA-PRAC-LAW-005-001 | 13 vs 14 powers count | Wrong count in answer | MEDIUM |
| 5 | 9e053410 | bf891ad7 | (bulk) | Group G/H/A labels + Cert of Use | Wrong occupancy groups + wrong document type | HIGH |
| 6 | 9e053410 | 680174d1 | (bulk) | Cert of Use mentioned in rationale | Wrong document type in rationale | MEDIUM |
| 7 | 9e053410 | c7878ba7 | (bulk) | Cert of Use in mnemonic/rationale | Wrong document type in rationale | MEDIUM |
| 8 | 9e053410 | 470ba6ed | (bulk) | "Certificate of Use" as correct term in options | Wrong document type in question options | MEDIUM |
| 9 | 9e053410 | (Q18) | (bulk) | Certificate of Use as correct answer | Wrong document type as correct answer | MEDIUM |
| 10 | 9e053410 | (Q24) | (bulk) | Certificate of Use in rationale | Wrong document type in rationale | MEDIUM |
| 11 | e51e9a56 | fffa260f | LEA-PRAC-FRM-007-002 | Question contradicts article (Q correct, article wrong) | Article-question contradiction | MEDIUM |
| 12 | e51e9a56 | f1d8b55e | LEA-PRAC-FRM-007-008 | Question contradicts article (Q correct, article wrong) | Article-question contradiction | MEDIUM |

---

## Recommendations by Priority

### Immediate Correction (CRITICAL)
1. **9eb0b48e Q4 (b2951761):** Change correct answer to 1:20 as the general maximum per 2024 Revised IRR. Update rationale to cite the updated standard.
2. **3d48211b Q4 (032522de):** Change penalty values to "not less than P100,000 nor more than P5,000,000" per Section 29 of IRR.

### High Priority Correction
3. **9e053410 Q4 (bf891ad7):** Rewrite question to use correct occupancy groups (E = Business and Mercantile, G = Storage and Hazardous, H = Assembly). Replace "Certificate of Use" with "Certificate of Occupancy."
4. **9e053410:** All questions using "Certificate of Use" terminology need review — the correct document is "Certificate of Occupancy" per Section 309.9 and PD 1096 original text.
5. **e51e9a56 article:** The article itself needs correction for "substantial equivalence" claim (Flag 2) and Section 27 vs 38 confusion (Flag 4). The questions are actually correct and contradict the article.

### Medium Priority Correction
6. **02a5ba32 Q8 (7e4e697d):** Change section reference from "Section 41" to "Section 4" in both question text and rationale.
7. **ab6d74a1 Q1 (af782bb3):** Change correct answer from "13 powers" to "14 powers" and update rationale.

### Low Priority / Monitor
8. **f61a5716:** No questions propagate the "950 m from ground" error. Article-only correction needed.
9. **e51e9a56:** The two flagged questions (fffa260f, f1d8b55e) are correct and contradict the article. Consider adding cross-references when the article is corrected.

---

## Files Examined

1. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-frm-018-universal-design-in-practice-bp-344-ra-7277-and-the-architect-s-affirmative-duty--9eb0b48e-110e-4c75-8a0c-4f83063001cf/linked-questions.json`
2. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-law-001-ra-9266-overview-history-legislative-intent-and-key-definitions--02a5ba32-0443-4162-837d-326783ed77a2/linked-questions.json`
3. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-law-003-prohibited-acts-criminal-penalties-and-enforcement--3d48211b-8add-4934-8dab-ae8bdae74035/linked-questions.json`
4. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-law-005-prboa-powers-and-functions-section-7-in-full--ab6d74a1-744c-4961-816a-b088bb707848/linked-questions.json`
5. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/change-of-use-and-occupancy--9e053410-cea0-400b-b185-576cbb4a8bd0/linked-questions.json`
6. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/fire-extinguishing-systems--f61a5716-97a1-41d5-8863-a2fc5fd4115f/linked-questions.json`
7. `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/lea-prac-frm-007-reciprocity-principles-in-architectural-practice--e51e9a56-7251-460e-8d00-5feaa3884f0a/linked-questions.json`

## Source Documents Used for Verification

- 2024 Revised IRR of BP 344 (NCDA)
- RA 9266 IRR (24-page PDF)
- PD 1096 2004 Revised IRR (432-page PDF)
- RA 9266 text retrieved from lawphil.net (Section 27 and 38)
- Flag reports in `/Users/philiplewis/slatecamp/.ai/14_fact_checking/flags/`
