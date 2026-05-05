# Audit Runs Log Specification

## Route

```text
/admin/ai-audit/runs
```

## Purpose

A run records a batch of work or manual review session.

For MVP, runs may be manual/static placeholders. Later, AI jobs will write into this same table.

## Required columns

| Column | Description |
|---|---|
| Run | Short id/name. |
| Run Type | manual, tier0, tier1, source check, correction, validation. |
| Scope | all articles, article batch, questions, etc. |
| Provider | manual/static/local/kimi/qwen/deepseek/etc. |
| Status | queued/running/completed/failed/cancelled. |
| Items | completed / total. |
| Flagged | number flagged. |
| Started | timestamp. |
| Completed | timestamp. |
| Cost | optional, default null/0 for MVP. |

## MVP run types

```text
manual_review_session
tier0_static_check
status_import
finding_import
```

## Future run types

```text
tier1_ai_flag_scan
tier2_source_verification
tier3_correction_proposal
tier4_validation
```

## Run detail view

Should show:

- run metadata,
- item counts,
- list of `ai_audit_items`,
- findings created by run,
- errors if any.

## MVP actions

- Create manual run/session.
- Mark run completed.
- View run items.

Do not add provider API settings yet.
