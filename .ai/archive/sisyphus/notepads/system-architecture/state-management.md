# State Management Patterns

**Date:** 2026-04-05

SlateCamp uses a server-first data model with client state reserved for interactive UI that cannot be expressed cleanly with React Server Components alone.

## Server-First Data Fetching

- Most data loading happens in App Router pages, layouts, and server-side helpers.
- Mutations are handled through server actions in [`src/lib/actions/`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/actions).
- Client-side Supabase access exists, but the architecture favors server-side access for authenticated and impersonated flows.

## Current Zustand Stores

1. [`useQuizStore.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/stores/useQuizStore.ts): primary quiz session state and answer/debrief client state
2. [`useQuizTimerStore.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/stores/useQuizTimerStore.ts): persisted quiz timer, expiry handling, and timer color state
3. [`useLabStore.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/stores/useLabStore.ts): 3D lab viewport and spatial interaction state
4. [`useNotificationStore.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/stores/useNotificationStore.ts): unread counts, popover state, optimistic notification updates
5. [`dev-store.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/stores/dev-store.ts): impersonation presets, dev feature overrides, and local dev UI state

## Current React Contexts

`src/lib/context/` currently contains 5 context modules:

- `active-session-context.tsx`
- `breadcrumb-context.tsx`
- `discipline-context.tsx`
- `note-context.tsx`
- `tier-context.tsx`

## Feature Flags and Dev Overrides

- Feature-flag evaluation lives in [`src/lib/admin/feature-flags.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/admin/feature-flags.ts) with action helpers in [`src/lib/actions/feature-flags.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/actions/feature-flags.ts).
- Dev impersonation and override state are persisted in [`dev-store.ts`](C:/Users/Philip Lewis/Desktop/slatecamp/src/stores/dev-store.ts) via Zustand persistence middleware.
