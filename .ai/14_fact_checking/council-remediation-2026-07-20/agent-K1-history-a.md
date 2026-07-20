# Agent K1 — History of Architecture Stream A — Council Remediation 2026-07-20

**Agent:** K1 (History of Architecture stream A)
**Date:** 2026-07-20
**Scope:** 28 History of Architecture bundles in `/Users/philiplewis/slatecamp/.ai/content-audit-export/articles/`
**Branch:** `fact-check/article-question-remediation` (no branch / commit / push actions taken)

## Summary

- **Bundles audited:** 28
- **Questions checked:** 311
- **Confirmed errors:** 1 (in 1 bundle)
- **Clean bundles:** 27
- **Question-edit JSON files written / overwritten:** 1
- **Per-bundle `council-remediation-2026-07-20.md` files written:** 1 (only for the bundle with a confirmed error)

## Methodology

For each bundle:
1. Read `normalized.md` (article body) and `linked-questions.json` (questions with marked-correct option, distractors, rationale).
2. For each question: verified (a) the marked-correct answer is consistent with the article body (BUNDLE-INTERNAL consistency — primary focus per efficiency mandate), and (b) the marked-correct answer is externally true.
3. WebSearched 3–5 highest-verifiability claims per bundle (architect names, building dates, movement definitions, attribution, year of formulation).
4. For every CONFIRMED_ERROR (marked-correct option that is either internally inconsistent with the article body or externally false), wrote a question-edit JSON at `<bundle>/question-edits/<question_uuid>.json` with a `proposed` block (corrected text / options / `correct_option_id` / rationale with source citation) matching the existing schema, and validated with `jq empty`.
5. Did NOT edit `normalized.md`, `candidate.md`, `linked-questions.json`, or `original.md`.

## Per-bundle audit

| # | Bundle | Topic | Qs | Verdict |
|---|--------|-------|----|---------|
| 1 | lea-hist-001-01-core-concept--28f9907c | Megalithic / prehistoric | 10 | CLEAN |
| 2 | lea-hist-001-02-core-concept--e72bf24e | Mesopotamia | 10 | CLEAN |
| 3 | lea-hist-001-03-core-concept--6ac76cc0 | Egyptian | 12 | CLEAN |
| 4 | lea-hist-001-04-core-concept--3e966435 | Greek | 12 | CLEAN |
| 5 | lea-hist-001-05-core-concept--757e71dc | Roman / Romanesque | 12 | CLEAN |
| 6 | lea-hist-001-06-core-concept--a73a7409 | Gothic | 12 | CLEAN |
| 7 | lea-hist-001-08-core-concept--d74be6f2 | Renaissance / Baroque / Rococo | 10 | CLEAN |
| 8 | lea-hist-002-01-core-concept--7edaba22 | Neoclassical | 11 | CLEAN |
| 9 | lea-hist-002-02-core-concept--48580f1e | Islamic traditions | 12 | CLEAN |
| 10 | lea-hist-002-03-core-concept--630d0fd8 | Indian architecture | 12 | CLEAN |
| 11 | lea-hist-002-04-core-concept--52d78a3d | Chinese architecture | 10 | CLEAN |
| 12 | lea-hist-002-05-core-concept--9bcf8ae9 | Japanese architecture | 11 | CLEAN |
| 13 | lea-hist-002-06-core-concept--c93bfab9 | SE Asian (Khmer/Thai/etc.) | 11 | CLEAN |
| 14 | lea-hist-004-01-core-concept--157a66ee | (Hist-004 cluster) | 10 | CLEAN |
| 15 | lea-hist-004-02-core-concept--c0a5189b | (Hist-004 cluster) | 11 | CLEAN |
| 16 | lea-hist-004-05-core-concept--ea2f4f6d | (Hist-004 cluster) | 12 | CLEAN |
| 17 | lea-hist-004-06-core-concept--4ed9c46d | (Hist-004 cluster) | 11 | CLEAN |
| 18 | lea-hist-004-07-core-concept--39f480ed | (Hist-004 cluster) | 12 | CLEAN |
| 19 | lea-hist-004-08-core-concept--369fd847 | **Islamic architecture in the Philippines** | 11 | **1_ERROR** |
| 20 | lea-hist-007-01-core-concept--cde95089 | Asian architecture cluster | 10 | CLEAN |
| 21 | lea-hist-007-02-core-concept--aa6c280e | Asian architecture cluster | 11 | CLEAN |
| 22 | lea-hist-007-03-core-concept--0f0bee66 | Asian architecture cluster | 12 | CLEAN |
| 23 | lea-hist-007-04-core-concept--10be87c4 | Asian architecture cluster | 10 | CLEAN |
| 24 | lea-hist-007-05-core-concept--7095ced9 | Korean architecture | 11 | CLEAN |
| 25 | lea-hist-007-06-core-concept--1254cb0d | Pacific architecture (incl. Sydney Opera House) | 12 | CLEAN |
| 26 | lea-hist-008-01-core-concept--1f411bc4 | 19th century / Industrial Revolution | 10 | CLEAN |
| 27 | lea-hist-008-02-core-concept--160660ca | Art Nouveau / Art Deco | 11 | CLEAN |
| 28 | lea-hist-008-03a-core-concept--c0e15f56 | Le Corbusier | 12 | CLEAN |

## Confirmed error

### lea-hist-004-08-core-concept--369fd847 — Question `83c41b35-8bd9-40d8-8341-f00dcd62f172`

- **Topic:** Arrival of Islam in the Philippine archipelago.
- **Defect:** Marked-correct option (b) carried the historically false claim "9th–14th centuries in Sulu Archipelago" (and "13th century in Mindanao"). Mainstream Philippine history (NCCA, NHCP, Saleeby 1905/1908, Sulu Online Library, Arab News) places the arrival of Islam in Sulu in the **late 14th century** (~1380 CE via Makhdum Karim, with the Sheikh Karimul Makhdum Mosque at Simunul, Tawi-Tawi as the documented entry point). The "9th century" date has no scholarly support.
- **Internal contradiction:** The question's own rationale disagreed with the marked-correct option, citing "14th–15th centuries" arrival — i.e. the audit pipeline already flagged the option text as wrong but the prior batch-121 edit only reworded the option and preserved the bad date.
- **Fix:** Overwrote `question-edits/83c41b35-8bd9-40d8-8341-f00dcd62f172.json` with a new `proposed` block:
  - Rewrites option (b) to "Late 14th century onward in Mindanao and the Sulu Archipelago, introduced via Arab and Malay traders (e.g. Makhdum Karim, c. 1380 CE, Simunul, Tawi-Tawi)".
  - Keeps `correct_option_id = "b"` (the option slot remains the correct answer; only the date text was wrong).
  - Provides a corrected rationale citing the external sources above.
  - `action: "replace"`, `approved_by: "agent-K1-history-a-council-2026-07-20"`, `support_status: "council_fact_correction"`.
- **Validation:** `jq empty` — VALID JSON.

External sources cited in the edit:
- Sulu Online Library — The Coming of Islam to Sulu: https://suluonlinelibrary.wordpress.com/history-2/the-coming-of-islam-to-sulu/
- Arab News — Oldest Philippine mosque stands witness to centuries of history: https://www.arabnews.com/node/2353616/
- Academia.edu — The Status of Islamic Heritage Preservation in the Philippines: The Sheikh Karimul Makhdum Mosque Case (cites Saleeby 1905/1908): https://www.academia.edu/112040697/

## Noted non-errors (no edit written)

These are quality / consistency issues that do NOT change the marked-correct answer. Documented for transparency; no JSON edit written because the marked-correct option remains both internally consistent and externally true.

- **Greek architecture (lea-hist-001-04):** Question `5ef0e30d` has a typo "femlea" — cosmetic typo, correct answer unaffected.
- **SE Asian architecture (lea-hist-002-06):** Question `17e8e430` has distractor "Japanese hanok" (should be "Korean hanok") — distractor error, correct answer unaffected.
- **Egyptian (lea-hist-001-03):** A couple of questions reference Jericho walls / Yazılıkaya that are arguably off-topic for the article, but the marked-correct answers are externally true.
- **Indus Valley (lea-hist-002-03):** Several rationales carry boilerplate "Cannot verify from provided search results" — audit-quality metadata issue, not a factual defect in the marked-correct answer.
- **Gothic (lea-hist-001-06):** Chartres windows question stem says "167" vs rationale "176" — both figures are cited externally; the marked-correct answer (Chartres) is correct.
- **Islamic traditions (lea-hist-002-02):** Selimiye Mosque option dates "1568–1574" vs rationale "1568–1575" — both defensible per Wikipedia; marked-correct answer unaffected. al-Walid I attribution for al-Aqsa Mosque is borderline but defensible (he also commissioned the Damascus Mosque).
- **Pacific (lea-hist-007-06):** A Pacific question stem still uses the residual "flea" spelling of "fale" — but batch-122 already addresses this in linked question edits, so no further action needed here.

## Files written / modified this run

- `…/articles/lea-hist-004-08-core-concept--369fd847-ad5b-4214-b86b-68cd7f62c534/question-edits/83c41b35-8bd9-40d8-8341-f00dcd62f172.json` (overwritten with substantive fact correction)
- `…/articles/lea-hist-004-08-core-concept--369fd847-ad5b-4214-b86b-68cd7f62c534/council-remediation-2026-07-20.md` (new — per-bundle remediation file for the only bundle with a confirmed error)
- `…/14_fact_checking/council-remediation-2026-07-20/agent-K1-history-a.md` (this consolidated report)

## Conclusion

Stream A (28 History of Architecture bundles, 311 questions) is substantially clean. One (1) confirmed factual error was found and remediated: the Islamic Philippines question with the spurious "9th century Sulu" arrival date. No other marked-correct answers were internally inconsistent with their article bodies or externally false after spot-check WebSearch verification of the highest-verifiability claims per bundle.
