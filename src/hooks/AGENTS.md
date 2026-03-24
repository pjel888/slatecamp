<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# hooks

## Purpose

Custom React hooks organized by feature domain. Provides reusable stateful logic for quiz sessions, note-taking, compliance checks, guided sequences, and 3D Lab telemetry.

## Key Files

| File | Description |
|------|-------------|
| `useComplianceCheck.ts` | Building code compliance validation hook |
| `useGuidedSequence.ts` | Step-by-step guided learning sequence controller |
| `useLabTelemetry.ts` | 3D Lab interaction telemetry and analytics |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `notes/` | Note-taking hooks (4 files) — CRUD, search, organization |
| `quiz/` | Quiz session hooks (5 files) — session state, answer tracking, timer |

## For AI Agents

### Working In This Directory

- Hooks must follow React rules (call order, dependency arrays)
- Use arrow function syntax for all hook definitions
- Prefix all hooks with `use`
- Keep hooks focused on a single concern — split if a hook exceeds ~100 lines
- Additional shared hooks live in `src/lib/hooks/` — check there before creating duplicates

### Common Patterns

- Feature-specific hooks are grouped in subdirectories (`notes/`, `quiz/`)
- General-purpose hooks go in `src/lib/hooks/` instead
- Hooks that need Supabase access should use `createClient()` from `@/lib/supabase/client`

## Dependencies

### Internal

- `src/lib/supabase/` — Database access
- `src/types/` — Shared type definitions
- `src/stores/` — Zustand stores (when hooks need global state)

### External

- `react` — useState, useEffect, useCallback, useMemo
- `@supabase/supabase-js` — Database queries

<!-- MANUAL: -->
