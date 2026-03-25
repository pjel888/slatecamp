<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# context

React Context providers for global app state. Client-side only.

## Purpose

Provides isolated Context + Provider pairs for global state that multiple features need. Each context handles a single concern: session state, UI breadcrumbs, discipline selection, note anchoring, and subscription tier gating.

## Key Files

| File | Description |
|------|-------------|
| `active-session-context.tsx` | Tracks if user is in "review" or "quiz" mode (or null). Used to prevent nav escapes mid-session. |
| `breadcrumb-context.tsx` | Stores breadcrumb trail `{ href, label }[]` for wiki/article navigation. Null = no breadcrumbs. |
| `discipline-context.tsx` | Current active discipline, all available disciplines, switch/refresh handlers. Queries `user_global_stats` on discipline change. |
| `note-context.tsx` | Note drawer state + anchor metadata (topic/question/article). Supports opening drawer with pre-filled context. |
| `tier-context.tsx` | User's DB tier, effective tier (after dev overrides), dev mode flag, capabilities, hasAccess() method. |

## For AI Agents

### Working In This Directory

- All files are client components (`'use client'`).
- Each context exports: a hook (`useContextName()`) + a provider component (`ContextNameProvider`).
- Providers must wrap relevant components in `layout.tsx` or `page.tsx`.
- Use TypeScript generics (`<T>`) sparingly; most contexts have fixed shapes.

### Adding a New Context

1. Create file `new-context.tsx` with `'use client'` at top.
2. Define interface `NewContextValue { ... }`.
3. Create context with `createContext<NewContextValue>({...})`.
4. Export hook `export function useNewContext() { return useContext(...) }`.
5. Export provider `export function NewContextProvider({ children, ...props })`.
6. Provider wraps with `<Context.Provider value={{ ... }}>`.

### Common Patterns

- **useCallback**: Used in providers for stable dispatch functions (`switchDiscipline`, `setAnchor`).
- **useState**: Minimal local state, usually derived from props on mount.
- **useRouter** + **createClient**: In discipline context for Supabase interaction.

## Dependencies

### Internal

- `@/types/app` — `Discipline`, `UserTier`, `NoteAnchor`.
- `@/lib/supabase/client` — Create Supabase client (used in discipline context).
- `@/lib/dev/dev-mode` — `TIER_CAPABILITIES` for tier context.

### External

- React 19 (Context API, hooks).

<!-- MANUAL: -->
