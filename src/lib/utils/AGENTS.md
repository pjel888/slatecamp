<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# utils

Stateless utility functions: formatting, date math, string manipulation, wiki navigation, and question helpers.

## Purpose

Reusable pure functions for common operations across the app. No side effects, no state, no dependencies on Context or stores. Safe to call from components, server actions, and middleware.

## Key Files

| File | Description |
|------|-------------|
| `constants.ts` | `PROFESSIONS` (discipline/exam list), `TIER_LIMITS` (questions/day, AI tokens, configs), `TIER_PRICES`. |
| `helpers.ts` | `formatDuration(ms)`, `formatPercentage(val)`, `daysUntil(date)`, `getGreeting()`, `pluralize(count, singular, plural?)`. |
| `wiki.ts` | `findAdjacentPages(pages, currentId)` — returns `{ prev, next }` for wiki navigation. Sorts by `order_index`. |
| `text.ts` | `snippet(content, maxLen=80)` — extracts plain text from TipTap/ProseMirror JSON; truncates to maxLen. |
| `question.ts` | `getCorrectOptionId(question)` — resolves `correct_option_id` with fallback to legacy `correct_answer` field. |

## For AI Agents

### Working In This Directory

- All functions are **pure** (no side effects, deterministic).
- Functions accept typed params, return typed values.
- No imports of Context, stores, or client-side hooks.
- Safe to use in server actions, middleware, and server components.

### Adding a New Utility

1. Create or update file based on category (formatting, date, string, etc.).
2. Write pure function with clear JSDoc if complex.
3. Export named function (no default exports).
4. Test edge cases (null, empty, boundary values).

### Naming Conventions

- **format***: Return formatted strings (`formatDuration`, `formatPercentage`).
- **compute***: Return computed values from calculations.
- **get***: Retrieve/derive values (`getGreeting`, `getCorrectOptionId`).
- **find***: Return search results (`findAdjacentPages`).

## Dependencies

### Internal

- `@/types/app` — `Profession`, `WikiPage`, `UserTier`.

### External

- None (no third-party libraries).

<!-- MANUAL: -->
