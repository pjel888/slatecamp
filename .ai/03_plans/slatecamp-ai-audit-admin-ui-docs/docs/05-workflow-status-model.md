# Workflow Status Model

The dashboard should model audit work as phases and statuses.

## Phases

Use these phase values:

```text
not_started
tier0_static_check
tier1_ai_flag_scan
tier2_source_verification
tier3_correction_proposal
tier4_validation
human_review
approved
published
```

For the first implementation, only these are active:

```text
not_started
tier0_static_check
human_review
approved
```

The AI-related phases are displayed as future-ready statuses but should not run AI yet.

## Status values

```text
not_checked
passed
flagged
needs_source_check
likely_wrong
confirmed_wrong
correction_proposed
validated
needs_human_review
approved
published
rejected
skipped
failed
```

## Color mapping

| Status family | Color | Meaning |
|---|---|---|
| Not checked / skipped / insufficient context | Gray | No meaningful audit result yet. |
| Passed / validated / approved / published | Green | No open issue or accepted as ready. |
| Needs source check / needs review | Yellow | Needs attention but not confirmed wrong. |
| Likely wrong / correction proposed | Orange | Probably needs correction/review. |
| Confirmed wrong / failed / critical issue | Red | High-priority problem. |
| In progress / queued | Blue | Work is underway or awaiting run. |

## Severity values

```text
low
medium
high
critical
```

Suggested meaning:

- `low`: cosmetic or source formatting issue.
- `medium`: possible unsupported claim or weak citation.
- `high`: likely factual error, answer key risk, or outdated requirement.
- `critical`: confirmed wrong answer, legal/code contradiction, or exam-dangerous misinformation.

## Phase checkmarks

Each row in article/question tables should show compact phase chips:

```text
T0 Static | T1 Flag | T2 Source | T3 Correct | T4 Validate | Review
```

For MVP:

- `T0 Static` can be manual or placeholder.
- `T1` through `T4` should be disabled/future until AI integration.
- `Review` should support manual review decisions.

## Important semantics

A green Tier 1 later will mean "no obvious issue found," not "100% verified." The UI should distinguish between:

```text
No issue found
Source verified
Human approved
Published
```

Do not collapse these into one green check.
