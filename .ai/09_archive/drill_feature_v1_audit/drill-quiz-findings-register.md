# Drill / Quiz Findings Register

**Date:** 2026-04-18
**Status:** In-Progress Audit

## 1. Findings

| ID | Area | Title | Severity | Priority | Confidence | Problem |
|----|------|-------|----------|----------|------------|---------|
| Q-001 | Network | Loose CAGE Schema | Medium | P1 | Confirmed | `signalTrace` and `cageToken` are `z.unknown()` in Zod schema. |
| Q-002 | Route | Mode Key Inconsistency | Low | P2 | Confirmed | UI uses hyphens (`focus-review`), backend uses underscores/different terms (`focused`). |
| Q-003 | UX | Missing Invalid Session State | Medium | P1 | Inferred | Unclear how the app handles a session ID that doesn't exist in DB. |
