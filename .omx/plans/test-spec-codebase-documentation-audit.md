# Test Spec — Codebase Documentation Audit

## Verification plan
- Generate route, API, env, test, script, and file inventories from current repository files.
- Update README.md and .ai docs using inventories as source material.
- Re-scan routes/API/env/tests and compare counts and representative paths against docs.
- Run `git diff --check` for documentation changes.
- Run feasible docs-safe verification commands from package.json; document failures as current-state gaps if caused by pre-existing code/environment issues.

## Completion checks
- README.md and .ai/audit-log.md exist and include Last Audit/audit summary.
- .ai/routes.md contains every route discovered under src/app.
- .ai/api-and-server.md contains every API route and major server action area.
- .ai/environment.md contains every process.env/NEXT_PUBLIC reference discovered.
- .ai/testing.md contains test inventory and command results.
- No real secret values are copied.
