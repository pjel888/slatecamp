<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# hooks

## Purpose

Custom React hooks organized by feature domain. Provides reusable stateful logic for quiz sessions, note-taking, compliance checks, guided sequences, and 3D Lab telemetry.

## Key Files

| File | Description |
|------|-------------|
| `useComplianceCheck.ts` | Building code compliance validation -- evaluates parametric values against code thresholds using LabStore, returns ComplianceState |
| `useGuidedSequence.ts` | Step-by-step guided learning sequence controller -- manages hotspot sequencing during guided exploration mode in the 3D Lab |
| `useLabTelemetry.ts` | 3D Lab behavioral event tracking -- tracks disorientation, idle, linger, erratic rotation, and zoom cycle signals for adaptive scaffolding |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `notes/` | Note-taking hooks (3 hooks + barrel index) -- `useNoteEditor` (CRUD, autosave), `useNotesList` (stubs state, filter-driven refetching), `useNotesPanels` (panel collapse states, keyboard shortcuts, localStorage persistence) |
| `quiz/` | Quiz session hooks (4 hooks + barrel index) -- `useQuizState` (answer tracking, option states, navigation), `useQuizPersistence` (localStorage + Supabase autosave), `useQuizTimer` (strict/flexible timer with per-question and total modes), `useQuizTelemetry` (interaction logging, confidence tracking) |

## For AI Agents

### Working In This Directory

- Hooks must follow React rules (call order, dependency arrays)
- Use arrow function syntax for all hook definitions
- Prefix all hooks with `use`
- Keep hooks focused on a single concern -- split if a hook exceeds ~100 lines
- Additional shared hooks live in `src/lib/hooks/` -- check there before creating duplicates
- All hooks in `notes/` and `quiz/` are `'use client'` components

### Common Patterns

- Feature-specific hooks are grouped in subdirectories (`notes/`, `quiz/`)
- Barrel exports via `index.ts` in each subdirectory
- General-purpose hooks go in `src/lib/hooks/` instead
- Hooks that need Supabase access use Server Actions from `@/lib/actions/`
- 3D Lab hooks consume state from `@/stores/useLabStore`

## Dependencies

### Internal

- `src/lib/supabase/` -- Database access (via Server Actions)
- `src/lib/actions/` -- `notes-actions`, `quiz` Server Actions
- `src/types/` -- Shared type definitions (`app.ts`, `3d-lab.ts`)
- `src/stores/useLabStore` -- 3D Lab global state (used by useComplianceCheck, useGuidedSequence)
- `src/lib/lab-analytics` -- Event tracking (used by useLabTelemetry)

### External

- `react` -- useState, useEffect, useCallback, useMemo, useRef

<!-- MANUAL: -->
