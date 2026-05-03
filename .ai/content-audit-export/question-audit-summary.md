# Question Audit Summary — History, Theory, Design

## Scope
- **Total articles audited**: 160 (55 History + 61 Theory + 44 Design)
- **Total questions checked**: 1,767 (609 History + 718 Theory + 440 Design)
- **Total question-edits created**: 5

## Structural Audit Results
All 160 articles had properly structured linked-questions.json files with:
- Valid `correct_option_id` values matching existing option IDs
- Proper `question_id`, `article_id`, and `topic_id` fields
- Correct `content_hash` values

Issue types checked and found clean:
- ✅ Wrong answer keys (correct_option_id pointing to non-existent option): **0**
- ✅ Empty or extremely short question text: **0**
- ✅ Duplicate option texts: **0**

## Issues Found and Fixed (5 edit files)

### History (1 issue)
1. **lea-hist-001-05** (Greek Architecture): Question `bbdeac5c` had "All of the above" (option d) as the correct answer for a question about Greek column drum construction. Option a ("reducing total weight") was misleading — drums divide weight into manageable sections but don't reduce total structural weight. **Fix**: Replaced with specific correct answer (option a) identifying transport advantages and entasis benefits, with independently verifiable distractors.

### Theory (2 issues)
2. **lea-theo-009-03** (Space Standards): Question `cd54f247` had `rationale: null` and `model_id: null`. **Fix**: Proposed complete rationale explaining the code-minimum vs. standard-practice distinction, and assigned model_id `LEA-THEO-009-03-010`.

3. **lea-theo-009-03** (Space Standards): Question `a9c96a9e` had typo "WWhile" in the rationale — should be "While". **Fix**: Corrected the rationale text.

### Design (2 issues)
4. **lea-dsgn-003-04** (Low-Income Housing): Question `e0f2175f` had a **wrong answer key**. The correct option claimed "Economic = 22 sqm" for minimum floor area per BP 220. The article clearly states "minimum floor area **24 sqm** per unit" for economic housing per BP 220 Revised IRR Table 7. **Fix**: Corrected option a to "Socialized = 18 sqm; Economic = 24 sqm" and updated the rationale.

5. **lea-dsgn-003-04** (Low-Income Housing): Question `d69665e2` had a **math inconsistency** in density calculation. The question states "assuming 4.5 persons/unit" but the rationale uses 5 occupants/unit. Also, question mentions "average unit floor area of 28 sqm" (extraneous info) while calculation uses lot area (64 sqm). **Fix**: Proposed clarified question text and rationale with internally consistent numbers.

## Additional Observations
- **8 questions** use "All/none of the above" options — 1 in History (fixed), 6 in Theory 007-series (Common Mistakes articles — pedagogically sound design), 1 in Design (valid trade-off summary). These are noted but not changed where appropriate.
- **One typo** found across all 1,767 questions (`WWhile` → `While`), indicating generally high editorial quality.
- Questions consistently test **understanding** (Bloom's: apply, analyze) rather than pure recall.
- Rationales are informative, cite the article text, and explain why each distractor is wrong.
- No systematic issues with date accuracy, architect attribution, or concept alignment found in spot checks of ~50 articles.

## Files Created
All in `question-edits/` subdirectories within each article:
1. `lea-hist-001-05/.../bbdeac5c-...json` — Fix "all of the above" question
2. `lea-theo-009-03/.../cd54f247-...json` — Add missing rationale and model_id
3. `lea-theo-009-03/.../a9c96a9e-...json` — Fix typo in rationale
4. `lea-dsgn-003-04/.../e0f2175f-...json` — Fix wrong answer key (22→24 sqm)
5. `lea-dsgn-003-04/.../d69665e2-...json` — Fix math inconsistency in density question

## Conclusion
The question bank for History, Theory, and Design is well-constructed with high editorial quality. The 5 issues found represent a **0.28% error rate** (5 out of 1,767 questions). No edits were needed for the vast majority of articles. The most significant issues were the wrong answer key in dsgn-003-04 (economic floor area) and the missing rationale/model_id in theo-009-03.
