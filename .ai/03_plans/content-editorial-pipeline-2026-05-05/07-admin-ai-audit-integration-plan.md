# Admin AI Audit Integration Plan

## Objective

Connect the local editorial pipeline to `/admin/ai-audit` as a visibility and review surface, not as a browser-based AI execution engine.

## Existing anchor

The admin route exists at:

`src/app/admin/ai-audit/`

The local content pipeline can already register run logs through:

`scripts/content-audit/sync-run-log-to-admin-audit.ts`

## Integration principles

1. Admin UI observes and reviews pipeline output.
2. Terminal scripts perform corpus pulls, AI analysis, validation, and local file writes.
3. Browser UI must not expose service-role keys or execute provider calls directly.
4. Admin actions may approve/reject findings or proposals, but must not silently publish content.

## Phase A — Run metadata visibility

Add or extend admin run detail page to show:
- command name
- export ID
- local output root
- manifest hash
- article count
- question count
- run status
- validation summary

## Phase B — Editorial status summary

Surface per-target status:
- not checked
- diagnosed
- claims extracted
- proposal generated
- validation failed
- needs source check
- needs human review
- approved for dry-run
- dry-run passed
- ready for apply
- applied

## Phase C — Findings mapping

Map pipeline outputs to admin findings:
- unsupported claim → finding
- citation gap → finding
- answer-key risk → finding
- invalid component → finding
- source-needed item → finding

## Phase D — Review queue

Add review views for:
- high-risk fact changes
- critical answer-key changes
- source-needed items
- rejected AI proposals
- ready-for-human-review packets

## Phase E — Local artifact links

For development/admin use, display local references such as:
- article folder path
- `review-packet.md` path
- `fact-ledger.json` path
- `diff-report.json` path

Do not expose paths to non-admin users.

## Phase F — Admin decisions

Admin decisions should record:
- reviewer ID
- decision: approve, reject, request_source, request_rewrite, defer
- notes
- timestamp
- target artifact hash

## Non-goals

- No model provider configuration UI in this phase.
- No browser button that runs bulk AI rewrites.
- No direct article/question mutation from admin UI.
- No automatic publish on approval.

## Acceptance gate

A completed pilot run should be visible in `/admin/ai-audit/runs`, with linked findings and review statuses for the 20 pilot articles.
