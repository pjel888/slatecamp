# Findings Log Specification

## Route

```text
/admin/ai-audit/findings
```

## Purpose

The findings log is the canonical list of issues found by manual review, static checks, or future AI workers.

## Required columns

| Column | Description |
|---|---|
| Target | Article/question/design question. |
| Severity | low/medium/high/critical. |
| Status | open/confirmed/rejected/resolved. |
| Risk Type | e.g. unsupported claim, answer key mismatch. |
| Finding | Summary of the issue. |
| Suspect Text | Exact text being questioned. |
| Recommended Step | What should happen next. |
| Provider | manual/static/future AI provider. |
| Created | Timestamp. |
| Actions | View, confirm, reject, resolve. |

## Finding statuses

```text
open
confirmed
rejected
resolved
superseded
```

## Finding severity

```text
low
medium
high
critical
```

## Manual finding form

Fields:

- Target type.
- Target id or selected article/question.
- Severity.
- Risk type.
- Finding summary.
- Suspect text.
- Rationale summary.
- Recommended next step.
- Optional notes.

For manual findings:

```text
provider = manual
model = null
prompt_version = null
```

## Actions

- Confirm finding.
- Reject finding.
- Resolve finding.
- Reopen finding.
- Add review decision note.

Every action should create a row in `ai_review_decisions`.

## UX note

The findings log should be filterable and operational. Admins should be able to quickly filter to:

```text
critical open findings
answer key risks
needs source check
article-question conflicts
manual findings
future AI findings
```
