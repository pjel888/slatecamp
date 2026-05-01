# Article Audit Table Specification

## Route

```text
/admin/ai-audit/articles
```

Also usable as a tab inside `/admin/ai-audit`.

## Purpose

Show all wiki articles with their current audit workflow status.

## Required columns

| Column | Description |
|---|---|
| Article | Title, slug, or first useful identifier. |
| Topic/Taxonomy | Use existing taxonomy relation if available. |
| Sources | Count of `wiki_article_sources` rows. |
| Questions | Linked question count if available. |
| Phase | Current audit phase. |
| Status | Current status badge. |
| Findings | Open/total findings count. |
| Highest Severity | low/medium/high/critical. |
| Last Checked | Last audit timestamp. |
| Next Action | Suggested admin action. |

## Phase chip row

Display compact chips:

```text
T0 Static  T1 Flag  T2 Source  T3 Correct  T4 Validate  Review
```

Each chip can show:

- check mark = complete/passed,
- warning = flagged/needs review,
- dash = not started,
- spinner/clock = queued/running,
- x = failed.

## Filters

- Search title/content/slug.
- Status.
- Phase.
- Severity.
- Has sources / Missing sources.
- Needs human review.
- Has open findings.
- Last checked.
- Topic/discipline if available.

## Row actions

- View details.
- Create manual finding.
- Mark as reviewed.
- Set status.
- View sources.
- View linked questions.

Do not include "Run AI" yet unless it is disabled and clearly marked future.

## Next action logic

Suggested mapping:

| Condition | Next Action |
|---|---|
| No status row | `Start review` |
| Missing sources | `Check sources` |
| Open high/critical finding | `Review finding` |
| Confirmed issue | `Prepare correction` |
| Correction proposed | `Review proposal` |
| No open findings and manually reviewed | `Approve` |
| Approved | `No action` |

## Data loading note

Do not require every article to have an audit row. Treat missing status cache as `not_checked`.
