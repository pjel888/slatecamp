# Security and Audit Trail

## Security goals

- Admin-only access.
- No service-role key in client code.
- RLS enabled on all new public tables.
- Every manual decision logged.
- No silent content mutation.

## Audit trail requirements

When an admin changes a finding or target status, store:

- actor/reviewer id,
- target type,
- target id,
- decision,
- previous status,
- new status,
- notes,
- timestamp.

Use `ai_review_decisions` for this.

## Raw output policy

`raw_output` exists for future AI payloads. For MVP manual findings, it can remain `{}`.

Do not display huge raw JSON in table rows. If needed, show in a collapsible debug area on a detail page.

## Content mutation policy

The MVP must not update `wiki_articles`, `questions`, or `design_scenario_questions` content.

Future correction proposals should be stored in `ai_change_proposals` first and reviewed before applying.

## Admin roles

Use existing SlateCamp role checks. If unsure, keep routes server-protected and do not rely on client-side hiding only.
