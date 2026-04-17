<!-- Parent: ../../../AGENTS.md -->
<!-- Generated: 2026-04-16 | Reality Refresh: 2026-04-16 -->

# .ai/docs/portal

## Scope
This file governs `.ai/docs/portal/` and its portal-reference subtrees.

## Current subtree reality
This subtree currently documents live portal surfaces with:
- root portal overview files (`000-portal-guide.md`, `001-dashboard.md`, `002-admin.md`, `003-ceo.md`, `004-developer.md`)
- nested portal directories for `admin/`, `architecture/`, `ceo/`, `dashboard/`, `developer/`, `observations/`, and `wiki-articles/`

## What agents must inspect before editing
- the actual routes in `src/app/`
- the supporting components and actions for the portal being documented
- the current README and `.ai` state/roadmap docs when portal ownership or scope is being described

## Documentation rules
- Document current portal reality, not hypothetical future plans.
- If content is historical, transitional, or observational, label it clearly.
- Keep portal docs aligned with current route and feature boundaries.

## Validation expectations
- verify every referenced route/path/file exists
- keep `.ai` updates additive/non-destructive
- re-scan this subtree after edits to ensure indexes and references still make sense

## Anti-laziness rule
Do not write portal docs from memory or from old plans. Trace the current route tree and supporting implementation first.
