# Frontend Execution Model

**Last Updated:** 2026-04-17

## Current model

- Server Components and server actions remain the preferred default model.
- SlateCamp is not “mostly static plus a few client leaves”; it has a broad interactive surface with `677` client-marked files.
- Zustand remains the main long-lived client workflow state tool when route-local state is insufficient.

## Main client-heavy anchors

- `src/stores/useQuizStore.ts`
- `src/stores/useQuizTimerStore.ts`
- `src/stores/useNotificationStore.ts`
- `src/hooks/useQuizShellHandlers.ts`
- `src/hooks/useGuidedSequence.ts`
- `src/hooks/useLabTelemetry.ts`
- `src/components/admin/unified-editor/*`
- `src/features/3d-lab/*`

## What this means for future work

- Route files should stay thin even when the underlying feature is interactive.
- Admin and 3D changes should assume higher-than-average hydration and client-boundary risk.
- Documentation should describe why a client-heavy domain exists, not merely accept it as a default.

## Companion docs

- `client-server-boundary-rules.md`
- `performance-standards.md`
- `../10_state/frontend-state-summary.md`
