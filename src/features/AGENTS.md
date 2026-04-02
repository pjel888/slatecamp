<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-02 | Updated: 2026-04-02 -->

# features

## Purpose

Feature-scoped modules organized by domain. Each feature is self-contained with its own components, engine logic, hooks, store, types, and tests. This directory follows a vertical slice architecture — everything related to a feature lives together.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `wall-configurator/` | 3D wall construction configurator with CHB, drywall, plaster, paint, and tile calculation engines (see `wall-configurator/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Each feature is a self-contained module — keep all related code within its directory
- Follow the vertical slice pattern: components/, engine/, hooks/, store/, types/, __tests__/
- Import from the feature's own subdirectories first; use `@/` imports only for shared utilities
- New features should follow the same directory structure as `wall-configurator/`

<!-- MANUAL: -->
