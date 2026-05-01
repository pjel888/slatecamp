# PRD: Quiz Route Consolidation

## Objective
Make `/quiz` the single canonical product and internal surface for the standard configurable quiz experience. Retire `/dashboard/drills` as a preferred route/name while preserving backward-compatible redirects.

## User stories

### US-001: Canonical quiz launch
As a learner, I can open `/quiz`, choose topics and question count, slide to start, and enter a real quiz session.

Acceptance criteria:
- `/quiz` renders the existing intelligent configurator experience with user-facing “Quiz” language.
- The standard flow starts real sessions via existing server actions.
- The real-user E2E opens `/quiz` directly.

### US-002: Compatibility redirects
As a returning user/bookmark, old drills URLs still land on the correct quiz surface.

Acceptance criteria:
- `/dashboard/drills` redirects to `/quiz`.
- `/dashboard/drills/sessions` redirects to an appropriate quiz/session history destination or `/quiz` if no canonical history route exists.
- Existing session/result URLs remain functional.

### US-003: One normal quiz mode
As a learner, I am not forced to choose between multiple confusing practice mode brands.

Acceptance criteria:
- Standard route/copy presents one configurable Quiz flow.
- Legacy internal mode compatibility remains for existing sessions/data where needed.
- Design and endurance remain explicit exceptions.

### US-004: Documentation and tests
As a developer/agent, repo docs and tests identify `/quiz` as canonical.

Acceptance criteria:
- `.ai` docs are updated to reflect route consolidation.
- E2E and unit tests guard the new canonical path and old-route redirect behavior.
- Verification passes: targeted tests, full unit tests, type-check, lint, E2E, diff check.

## Non-goals
- Rewriting quiz engine/session schema.
- Removing all legacy DB mode values in one pass.
- Deleting special design quiz/endurance experiences.
- Destructive DB migrations.

## Risks
- Route redirects can break protected/dashboard layout assumptions.
- E2E real seeded data must not be mocked.
- Navigation constants may contain stale route names.

## Validation
See `test-spec-quiz-route-consolidation.md`.
