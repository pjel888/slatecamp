# `.ai` Operational Intelligence Workspace

This `.ai` directory is SlateCamp's operational intelligence layer. Root-level files below are current-state docs refreshed from the live codebase on 2026-04-29. Numbered folders preserve operational logs, plans, audits, specs, performance work, and historical context.

## Current root docs

| Document | Purpose |
| --- | --- |
| project-overview.md | Current app overview and audited counts. |
| app-audit.md | Executive audit summary and risk snapshot. |
| features.md | Implemented/partial/experimental feature inventory. |
| routes.md | Complete App Router page/support-file route map. |
| architecture.md | Architecture, request flow, boundaries, and patterns. |
| api-and-server.md | API route handlers and server action/query inventory. |
| data-models.md | Schema table/entity inventory from DATABASE_SCHEMA.sql. |
| ip-inventory.md | IP-relevant implementation inventory without legal conclusions. |
| testing.md | Testing stack, commands, and test file inventory. |
| environment.md | Environment variable inventory without secret values. |
| integrations.md | External service/library integration inventory. |
| ui-design-system.md | Design-system and UI architecture notes. |
| security.md | Auth, access control, privacy, and security notes. |
| known-issues.md | Current gaps, risks, and follow-ups. |
| codebase-map.md | Folder/file map for future agents. |
| audit-log.md | Audit date, commands, counts, uncertainties, and follow-ups. |
| db-cleanup-deferred.md | Non-destructive record of deferred LemonSqueezy schema/type cleanup. |
| deferred-integrations.md | PayRex, LemonSqueezy, and AI provider launch/deferred status. |
| final-launch-readiness.md | Final post-cleanup launch snapshot for the payment-free/live-AI-free scope. |


## Compatibility docs

`api-surface.md`, `data-model.md`, `testing-and-quality.md`, and `known-gaps.md` are retained as compatibility mirrors that point to the refreshed canonical files above.

## Numbered taxonomy

Use `.ai/00_system/ai-folder-canonical-map.md` for historical routing. Treat `.ai/06_specs/deep/` as deep reference/history unless a claim has been re-verified against current code.

## Rules

- Codebase is source of truth.
- Do not copy secrets into docs.
- Date time-sensitive counts and validation claims.
- Update root README and relevant `.ai` docs together when product/architecture/routes change.


## Plan B cleanup note

As of 2026-04-29, canonical current docs are `README.md`, `.ai/routes.md`, `.ai/api-and-server.md`, `.ai/environment.md`, `.ai/integrations.md`, `.ai/testing.md`, `.ai/known-issues.md`, `.ai/risk-register.md`, and `.ai/cleanup-execution-log.md`. Compatibility docs such as `.ai/api-surface.md`, `.ai/data-model.md`, `.ai/testing-and-quality.md`, and `.ai/known-gaps.md` intentionally point to canonical files to avoid stale duplicated guidance.


## Final launch hardening note

As of 2026-04-29, the current launch stance is payment-free and live-AI-provider-free. Use `.ai/final-launch-readiness.md`, `.ai/deferred-integrations.md`, and `.ai/db-cleanup-deferred.md` with README for the current handoff.
