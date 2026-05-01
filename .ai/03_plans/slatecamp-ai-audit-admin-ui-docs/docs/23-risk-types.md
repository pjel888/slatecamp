# Risk Types

Use consistent `risk_type` values so tables are filterable.

## General content risks

```text
unsupported_claim
contradicted_claim
outdated_requirement
source_conflict
missing_sources
weak_sources
ambiguous_statement
incorrect_definition
incorrect_date
incorrect_person_or_attribution
incorrect_code_requirement
incorrect_legal_requirement
incorrect_history
unclear_wording
other
```

## Question-specific risks

```text
answer_key_mismatch
multiple_correct_answers
no_valid_answer
stem_inaccurate
option_inaccurate
rationale_inaccurate
article_question_conflict
unsupported_question
missing_answer_key
missing_options
missing_rationale
```

## Workflow risks

```text
needs_source_check
needs_human_review
needs_correction
blocked_by_missing_context
```

## Severity guidance

| Risk | Suggested severity |
|---|---|
| missing_sources | medium |
| weak_sources | low/medium |
| unsupported_claim | medium/high |
| contradicted_claim | high/critical |
| outdated_requirement | high/critical |
| answer_key_mismatch | critical |
| multiple_correct_answers | critical |
| no_valid_answer | critical |
| unclear_wording | low/medium |
