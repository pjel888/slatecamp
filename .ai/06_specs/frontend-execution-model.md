# Frontend Execution Model

**Last Updated:** 2026-04-16

## Model
- Server Components and server actions remain the preferred default model.
- Client execution is concentrated in quiz shells, notifications, device/gesture hooks, and 3D Lab interactions.
- Zustand is used for long-lived client workflow state where local component state would be insufficient.

## Important client anchors
- `src/stores/useQuizStore.ts`
- `src/stores/useQuizTimerStore.ts`
- `src/stores/useNotificationStore.ts`
- `src/hooks/useQuizShellHandlers.ts`
- `src/hooks/useGuidedSequence.ts`
- `src/hooks/useLabTelemetry.ts`
