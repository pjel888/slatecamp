<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# hooks

Shared React hooks for client components. Used across multiple features.

## Purpose

Custom hooks that encapsulate repeated logic: toast notifications, draggable floating elements, feature flags, and user role resolution. Separate from feature-specific hooks in `src/hooks/`.

## Key Files

| File | Description |
|------|-------------|
| `use-toast.ts` | Toast state machine (ADD, UPDATE, DISMISS, REMOVE actions). Single toast at a time. Returns `{ toasts, toast(), dismiss() }`. |
| `useDraggableFloatingPosition.ts` | Draggable dev pill with localStorage persistence. Supports centered positioning. Returns `{ style, onPointerDown, didDragRef, resetPosition }`. |
| `useFeatureFlag.ts` | 3-layer resolution: dev override > DB value > config default. Returns `{ enabled, source }`. Also `useAllFeatureFlags()` for flag board UI. |
| `useUserRole.ts` | Returns effective user role accounting for dev impersonation. In production, always returns real role. In dev, returns impersonated role if active. |

## For AI Agents

### Working In This Directory

- All hooks use `'use client'` at the top.
- Hooks must follow React hooks rules (dependency arrays, call order).
- Return types should be minimal and specific.
- Use Zustand stores when accessing global dev state.

### Adding a New Hook

1. Create file `use{HookName}.ts` with `'use client'` at top.
2. Use React hooks (useState, useCallback, useEffect, useContext).
3. Export single named function `export function use{HookName}() { ... }`.
4. Return minimal object/value needed by consumers.

### Common Patterns

- **Feature flag resolution**: 3-layer (override > DB > config), return source for UI feedback.
- **localStorage**: Persist UI state (position, preferences); wrap in try/catch.
- **Zustand integration**: Access dev store for impersonation, feature overrides.
- **Event listeners**: Cleanup in useEffect return; use useRef for refs like `didDragRef`.

## Dependencies

### Internal

- `@/stores/dev-store` — Feature flag overrides, impersonation state.
- `@/config/feature-flags` — Feature flag config defaults.
- `@/components/ui/toast` — Toast type definitions.
- `@/lib/supabase/server` — For server-side role checks.

### External

- React 19 (hooks).

<!-- MANUAL: -->
