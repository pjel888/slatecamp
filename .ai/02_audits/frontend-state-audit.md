# Frontend State Audit

**Last Updated:** 2026-04-16

## Findings
- Global client state is relatively concentrated: quiz stores, notification store, dev store, and feature-specific stores in feature modules.
- `useQuizStore.ts` and `useQuizTimerStore.ts` carry substantial workflow logic, persistence, and async side effects.
- `src/hooks/` contains interaction-heavy hooks for quiz shells, 3D telemetry, device sensors, gestures, and guided sequences.
- The measured client-component ratio (51.7%) confirms the repo is more client-heavy than the stated goal.

## Risks
1. Quiz/session logic is powerful but hard to simplify without disciplined boundaries.
2. 3D hooks combine telemetry, onboarding, and interaction state on the client.
3. Some stores call server actions directly, which is pragmatic but couples client state to mutation pathways.
