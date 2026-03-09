---
name: extract-magic-strings
description: Extracts magic strings, hardcoded routes, status enums, and config into centralized constants. Use when refactoring for DRY, adding new routes, or consolidating string/enum usage in Cerebro.
---

# Extract Magic Strings

## When to Use

- Refactoring for DRY
- Adding or changing routes
- Consolidating status enums or config values
- Before introducing a new string literal that may be reused

## Instructions

### 1. Routes

- Use or create `src/lib/constants/routes.ts`.
- Define: `PUBLIC_PATHS`, `LOGIN_PATH`, `DASHBOARD_PATH`, `SETTINGS_PATH`, `QUIZ_PATH`, `QUIZ_SESSION_PATH(id)`, `SESSIONS_PATH`, `REVIEW_PATH`, `LIBRARY_PATH`, and other app routes.
- Replace: `redirect("/login")`, `redirect("/dashboard")`, `href="/dashboard/..."`, `pathname === "/..."`, `router.push(...)` with constants (e.g. `ROUTES.LOGIN`, `ROUTES.DASHBOARD`).
- Middleware, layout, pages, and server actions must all use the same route constants for auth redirects.

### 2. Status and enums

- Use types from `src/types/app.ts` (e.g. `SessionStatus`, `OnboardingStep`).
- Optionally add const arrays (e.g. `SESSION_STATUSES`) in `src/lib/constants/status.ts` or next to types for iteration/validation.
- Do not use ad-hoc string literals like `"in_progress"` or `"completed"` in multiple places; reference the type or constant.

### 3. Config

- Extend `src/lib/utils/constants.ts` or add `src/lib/constants/config.ts` for feature flags, limits, and app-wide config.
- Keep one canonical definition per value.

### 4. Finding candidates

Grep patterns:

- `redirect\(['\"]/`
- `href=['\"]/`
- `pathname === ['\"]/`
- `['\"]in_progress['\"]`, `['\"]completed['\"]`

Replace usages; keep one canonical definition per value.
