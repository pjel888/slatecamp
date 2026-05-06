# Detail Pages and Drawers

The admin UI should provide a way to inspect one target in depth. This can be a page or a drawer depending on existing UI conventions.

## Article detail content

Show:

- Article title/identifier.
- Current status and phase.
- Existing article sources count/list.
- Linked questions count/list if available.
- Findings list.
- Change proposals list, if any.
- Review decisions timeline.
- Run history for this article.
- Manual action buttons.

## Question detail content

Show:

- Question stem.
- Options/answer key if available.
- Target type: `question` or `design_scenario_question`.
- Linked article/topic if available.
- Current audit status.
- Findings list.
- Review decisions timeline.
- Manual action buttons.

## Finding detail content

Show:

- Finding summary.
- Suspect text.
- Severity.
- Risk type.
- Rationale summary.
- Recommended next step.
- Source evidence placeholder/future area.
- Status history.
- Decisions.

## Audit timeline

Use a simple vertical timeline if existing components allow:

```text
Run created
Item scanned
Finding opened
Finding confirmed
Manual review added
Status updated
Finding resolved
```

## Manual actions

- Add finding.
- Add review note.
- Confirm/reject/resolve finding.
- Update latest status.
- Mark as reviewed.

No direct content mutation in MVP.
