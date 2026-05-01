# PRD — Codebase Documentation Audit

## Objective
Bring README.md and .ai documentation into sync with the current SlateCamp implementation.

## User stories
- As a new developer, I can read README.md and understand the app, routes, setup, tests, architecture, and known gaps.
- As a future AI agent, I can read .ai docs and find detailed current-state maps with file-path evidence.
- As a founder or technical reviewer, I can see implemented product features, integrations, IP-relevant implementation candidates, and limitations without reverse-engineering the repo.

## Acceptance criteria
- README.md includes all required sections and a complete route/feature inventory.
- .ai docs include project overview, routes, features, architecture, API/server, data models, IP inventory, testing, env, integrations, UI/design, security, known issues, codebase map, audit log.
- Every discovered app route and API route is documented.
- Environment variables referenced in code are documented without secret values.
- Tests/scripts and verification results are documented.
- A second pass compares generated docs against code inventories before final response.
