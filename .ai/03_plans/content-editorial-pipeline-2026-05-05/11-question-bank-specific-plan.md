# Question Bank Specific Plan

## Objective

Treat 7,000+ questions as a first-class pipeline, not as an article appendix.

## Question risk areas

- Wrong answer key.
- Empty or invalid `correct_option_id`.
- Multiple correct options.
- Question contradicts linked article.
- Explanation contradicts source.
- Longest/shortest answer giveaway.
- Implausible distractors.
- Duplicate questions.
- Stale taxonomy/model IDs.
- Calculation or formula error.

## Allowed mutation model

- Do not edit `linked-questions.json`.
- Proposed changes go to `question-edits/<question_id>.json`.
- Deletion, duplicate marking, split, merge, and retirement need explicit schema support before use.

## Required question artifacts

Per article:

```text
editorial/question-validation.json
editorial/question-proposals.json
question-edits/<question_id>.json
```

Corpus-level:

```text
.ai/15_content_optimization/question-bank-risk-register.md
.ai/15_content_optimization/question-duplicate-ledger.json
```

## Question audit phases

1. Structural validation: missing options, duplicate options, empty answer key.
2. Pattern validation: answer length, repeated correct position, all/none-of-the-above.
3. Article alignment: question claim appears in article or source pack.
4. Source validation: answer key and rationale source-backed.
5. Pedagogy validation: tests understanding, not trivial recall unless intended.
6. Duplicate strategy: keep, merge, retire, or rewrite.

## Review levels

- Low: wording only, no answer-key change.
- Medium: distractor rewrite, same answer key.
- High: rationale/source correction.
- Critical: answer-key change, calculation correction, duplicate retirement.

## Acceptance gate

No question edit can be pushed unless:

- edit file validates against schema,
- baseline hash matches export,
- answer key is source-backed for high/critical items,
- article alignment check passes or a reviewer explicitly accepts the exception.
