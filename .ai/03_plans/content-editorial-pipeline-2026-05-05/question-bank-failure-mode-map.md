# Question-Bank Failure-Mode Map — Phase 1A Evidence

**Date:** 2026-05-05  
**Scope:** Map how the 7,159-question bank can fail, separately from article failure modes.  
**Status:** Read-only inventory; no question edits proposed.

---

## Live Count Anchors

| Table | Live Row Count (2026-05-05) |
|---|---|
| `questions` | 7,159 |
| `design_scenario_questions` | 249 |
| `design_questions` | 0 |
| Total quiz-grade questions | **7,408** |

---

## Question-Edits Directory Evidence

**Finding:** `question-edits/` directories **DO exist** in the export corpus, but coverage is **partial and irregular**.

- **Glob result:** 130 `question-edits/` directories found under `.ai/content-audit-export/articles/*/question-edits/`; 107 of those directories contain JSON files; 860 JSON files total.
- **Coverage:** Only a subset of articles have question-edits directories (e.g., `wheelchair-maneuvering-and-parking`, `fire-zones-and-existing-buildings`, `chimneys-and-fireplaces`, `commercial-clearances`, `inca-architecture-ashlar-masonry`, `hydrology-in-site-planning`).
- **Pattern:** Question-edits appear concentrated on articles that underwent prior QA passes or batch verification.
- **Absent:** No global `question-edits/` index or manifest. No per-question JSON outside article bundles.

**Sample content:** `fire-zones-and-existing-buildings/question-edits/review-notes.json`
- Contains `article_id`, `review_date`, `reviewer: "qa-pass-2-5"`, and per-question verification notes.
- Example claim: `"BATCH_VERIFIED"` for PD 1096 Rule V fire-zone classifications.
- **Provenance warning:** `BATCH_VERIFIED` and similar stamps are evidence of prior review activity, not current accepted QA. Their authority must be revalidated before Phase 1B, especially because AI fact-check/rewrite features are currently guarded by `ai-feature-guard.ts`.

---

## Article-Question Coupling Failures

These risks are neither pure article failures nor pure question failures. They arise when article content changes but linked questions, rationales, mastery analytics, or citations do not update in lockstep.

| Coupling Failure | Why Dangerous | Required Guard Before Phase 1B |
|---|---|---|
| Rationale-source drift | A rewritten article may explain a concept differently while existing rationales still cite the old explanation. | Article-change diff must trigger linked-question rationale review. |
| Citation-section drift | A legal/code article edit can change section framing while questions still cite the old section. | Code-citation validator across article + linked questions. |
| Distractor becomes correct after edit | Article rewrite may add an exception that makes a previous distractor defensible. | Option-level source and exception scan before approving article rewrite. |
| Mastery-data invalidation | Edited article/question relationship may alter which competency a question actually measures. | Topic/Bloom/difficulty revalidation for linked questions. |
| Answer-key confidence drift | Article changes can make the old answer key less obviously supported, even if technically still correct. | Human review required for high-risk code/legal linked questions. |

---

## Failure-Mode Taxonomy

### 1. Answer-Key Risks

| Failure Mode | Severity | Detection Method | Example |
|---|---|---|---|
| Incorrect correct option | `CRITICAL` | Cross-reference source text; expert review | Board-foot formula answer keyed to wrong unit |
| Answer key drift after article edit | `HIGH` | Diff `linked-questions.json` across export versions | Article revised; question not re-keyed |
| Multiple valid correct options | `HIGH` | Options analysis + source check | "Best" vs "correct" ambiguity in design scenarios |
| Missing correct option | `CRITICAL` | Schema validation | `correct_option_id` references non-existent option |
| Design-scenario answer index off-by-one | `CRITICAL` | Manual spot-check | `correct_answer_index` mismatches stem ordering |

### 2. Rationale Risks

| Failure Mode | Severity | Detection Method | Example |
|---|---|---|---|
| Rationale contradicts answer key | `CRITICAL` | Automated text matching | Rationale explains why B is correct, but key says C |
| Rationale cites wrong code section | `HIGH` | Source-pack verification | Claims PD 1096 Sec 502, but provision is in Sec 506 |
| Rationale is circular or vacuous | `MEDIUM` | NLP / human review | "Because it is the correct answer" |
| Rationale missing for hard question | `MEDIUM` | Null-check | Calculation question has no worked solution |

### 3. Distractor Risks

| Failure Mode | Severity | Detection Method | Example |
|---|---|---|---|
| Distractor is obviously wrong | `LOW` | Pedagogy review | Distractor uses impossible unit (e.g., 500 MPa concrete) |
| Distractor is accidentally correct | `CRITICAL` | Source verification | Distractor matches real-world exception not in article |
| Distractor stereotypes mislead | `MEDIUM` | Bias review | All female names attached to distractors |
| Too few distractors | `MEDIUM` | Schema validation | `< 4 options` for standard multiple-choice |

### 4. Citation / Source Risks

| Failure Mode | Severity | Detection Method | Example |
|---|---|---|---|
| `code_citation` missing for law question | `HIGH` | Rule-based flag | RA 9266 question has no section citation |
| Citation points to repealed provision | `HIGH` | Source-pack recency check | Cites old NBCP instead of PD 1096 |
| Citation format inconsistent | `LOW` | Regex lint | "Sec 502" vs "Section 502" vs "§502" |

### 5. Taxonomy / Bloom / Difficulty Risks

| Failure Mode | Severity | Detection Method | Example |
|---|---|---|---|
| `topic_id` mismatches article taxonomy | `HIGH` | Join validation | Question tagged to `lea-matl` but article is `lea-prac` |
| Bloom level misclassified | `MEDIUM` | Rubric review | Memorization question labeled "synthesis" |
| `difficulty` label contradicts performance data | `MEDIUM` | IRT / empirical check | Labelled "easy" but 80% of learners get it wrong |
| Missing `topic_id` (orphan question) | `HIGH` | Null foreign-key check | Question not linked to any taxonomy node |

### 6. Calculation / Numerical Risks

| Failure Mode | Severity | Detection Method | Example |
|---|---|---|---|
| Numeric answer wrong by unit conversion | `CRITICAL` | Calculator re-run | Board feet calculated using inches vs feet |
| Formula constants outdated | `HIGH` | Source-pack version check | Uses old NSCP load factor |
| Significant-figure inconsistency | `LOW` | Format lint | Answer given to 5 sig figs, options to 2 |
| Calculation question lacks necessary data | `HIGH` | Completeness check | "Calculate beam depth" but span not provided |

---

## Question-Bank vs Article Failure-Mode Separation

| Dimension | Article Failure Modes | Question Failure Modes |
|---|---|---|
| **Primary risk** | Factual inaccuracy, sourcelessness, component invalidity | Answer-key correctness, distractor quality, rationale soundness |
| **Automation potential** | Medium (fact-check requires source packs) | High (answer-key cross-check, schema validation, option analysis) |
| **Human review priority** | High-risk legal/code clusters | Calculation questions, design scenarios, recently edited articles |
| **Rollback cost** | High (affects all linked questions, taxonomy, student mastery) | Very high (affects quiz sessions, user responses, readiness scores) |
| **Detectability before push** | Diff + validator + source pack | Schema validator + answer-key linter + rationale-contradiction detector |

---

## Question-Edits Convention Gaps

1. **No global question manifest.** Unlike articles, there is no `export-summary.json` equivalent for questions.
2. **No standardized question-edit schema.** `question-edits/*.json` files vary in shape (some are edit proposals, some are review notes, some are push reports).
3. **No question-specific roundtrip.** The pipeline normalizes articles; questions are exported as `linked-questions.json` bundles but not individually normalized/composed/diffed.
4. **No question-level source packs.** Source packs are article-scoped; a question that tests a granular code subsection may lack direct source grounding.

---

## What Remains Safe for Phase 1A

- Counting and mapping question-edits coverage.
- Cataloguing failure modes by severity and detectability.
- Reviewing existing `review-notes.json` files as risk evidence.
- Running read-only schema validation against `linked-questions.json`.

## What Blocks Phase 1B

- **No proven question-level roundtrip safety.** Any automated question edit risks breaking answer keys, rationales, or distractor validity without a compose-diff-validate pipeline.
- **No question-specific source-pack grounding.** A question edit that changes a code citation cannot be validated without per-question source excerpts.
- **No centralized question-edit manifest.** Phase 1B cannot safely batch-apply question edits without tracking which questions have been edited, reviewed, and validated.

## What Claude Should Review Next

1. Whether the editorial pipeline plan (`11-question-bank-specific-plan.md`) adequately addresses the missing question-level roundtrip.
2. Whether `linked-questions.json` should be individually normalized/diffed like articles, or whether a separate question-pipeline is needed.
3. Whether the existing `question-edits/` JSON files should be consolidated into a single schema before Phase 1B.
4. Whether answer-key linting and rationale-contradiction detection should be built as deterministic validators before any AI question-editing is attempted.
