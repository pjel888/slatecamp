# Audit Standards

**Last Updated:** 2026-04-17

## Required evidence classes

Every material audit claim should be grounded in at least one of:
- live code paths
- package scripts or executable tooling
- database schema and migrations
- scoped `AGENTS.md` files
- active governance or state docs
- runtime or workflow-state artifacts when the task is explicitly about OMX/runtime behavior

If a claim uses volatile counts, cite the live measurement and refresh method from `repo-metrics-method.md`.

## Minimum audit domains for repo-wide passes

1. Routes and portal surfaces
2. Shared UI and feature modules
3. Actions, queries, services, and privileged edges
4. Data/schema/migrations and Supabase helpers
5. Auth, entitlements, and payment boundaries
6. Build, lint, typecheck, and workflow tooling
7. Validation surface and test reality
8. Documentation topology and source-of-truth rules
9. `.ai` operational layer
10. `AGENTS.md` hierarchy and Codex skill surface

## Classification language

Prefer explicit labels:
- accurate
- partially stale
- materially outdated
- misleading
- duplicated
- ambiguous ownership
- missing
- historical but useful
- preserved lineage, not current authority

## Anti-loop rules

- Freeze baseline scope before creating new audit artifacts.
- Treat new docs created during the run as deliverables, not new audit scope.
- Do not reopen a completed area unless live repo evidence proves the earlier conclusion wrong.

## Anti-slop rules

- Do not infer behavior from directory names alone.
- Do not call a document current unless it was checked against live code, scripts, or schema.
- Separate observed facts from inferred conclusions.
- In documentation-only runs, prefer truth repair and authority cleanup over speculative implementation guidance.
