# MVP Scope

## Build now

The MVP should include:

1. New audit tracking tables.
2. `/admin/ai-audit` route shell.
3. Dashboard summary cards.
4. Article workflow table.
5. Question workflow table.
6. Findings log.
7. Runs log.
8. Manual finding creation.
9. Manual status/review updates.
10. Detail drawer or detail page for a target item.
11. Filters, search, pagination, and status chips.

## Defer

Do not implement yet:

- AI API integrations.
- Provider settings pages.
- Token/cost accounting automation.
- Automated source retrieval.
- AI-generated corrections.
- Content publishing workflow.
- Bulk AI job queue.
- Email/notification workflows.

## MVP workflow

```text
Admin opens /admin/ai-audit
  ↓
Sees dashboard summary
  ↓
Filters to not_checked / flagged / needs_review
  ↓
Opens article/question row
  ↓
Creates manual finding or updates status
  ↓
System logs action in audit tables
  ↓
Status cache updates
  ↓
Dashboard reflects current workflow state
```

## Design target

The page should feel like a content QA command center:

- high signal,
- scannable,
- fast to filter,
- no visual clutter,
- clear next actions.
