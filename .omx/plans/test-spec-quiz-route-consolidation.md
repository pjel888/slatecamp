# Test Spec: Quiz Route Consolidation

## Required tests

1. Unit/integration
- Existing quiz-v2 start-session tests pass.
- Existing submit-answer tests pass.
- Existing mode preset tests pass or are updated to canonical naming without breaking compatibility.

2. Route behavior
- `/quiz` renders the configurator.
- `/dashboard/drills` redirects to `/quiz`.
- Any old drills session/history route redirects safely.

3. Real-user E2E
- Seed deterministic questions.
- Open `/quiz` through browser UI.
- Select valid topic configuration.
- Perform real slide/swipe start.
- Assert real question appears.
- Select real answer.
- Perform real submit interaction.
- Continue to results through final transition.
- Negative path still shows “No questions found…” and recovers by changing filters.

4. Accessibility
- Start slider keeps keyboard fallback.
- Submit slider keeps accessible role/label/test selector.

## Verification commands
- `bun test src/lib/actions/quiz-v2/start-session.test.ts src/lib/actions/quiz-v2/submit-answer.test.ts src/lib/quiz/mode-presets.test.ts src/lib/routes.test.ts`
- `bun run test`
- `bun run type-check`
- `bun run lint`
- `bun run test:e2e`
- `bun --env-file=.env.local run test:e2e:drills-real`
- `git diff --check`
