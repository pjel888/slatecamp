# Question Audit Table Specification

## Route

```text
/admin/ai-audit/questions
```

## Purpose

Show all question rows with audit workflow status and risk flags.

## Targets

Support at least:

```text
questions
design_scenario_questions
```

Use `target_type` to distinguish:

```text
question
design_scenario_question
```

## Required columns

| Column | Description |
|---|---|
| Question | Stem snippet. |
| Type | normal / design scenario. |
| Linked Article | Parent/related article if available. |
| Answer Key | Existing key if available. |
| Status | Current audit status. |
| Risk Type | answer key mismatch, no valid answer, etc. |
| Findings | Open/total findings. |
| Highest Severity | low/medium/high/critical. |
| Last Checked | Last audit timestamp. |
| Next Action | Suggested action. |

## Question risk types

Use these risk type strings:

```text
answer_key_mismatch
multiple_correct_answers
no_valid_answer
stem_inaccurate
option_inaccurate
rationale_inaccurate
article_question_conflict
unsupported_question
outdated_requirement
missing_answer_key
missing_options
missing_rationale
needs_human_review
other
```

## Filters

- Search stem.
- Target type.
- Status.
- Severity.
- Risk type.
- Has answer key / missing answer key.
- Open findings.
- Needs human review.

## Row actions

- View detail.
- Create manual finding.
- Mark reviewed.
- Set status.
- View linked article if available.

## Important MVP behavior

The dashboard should not attempt to determine whether an answer key is correct yet. It can only show existing static/manual statuses until future AI/static checks are implemented.
