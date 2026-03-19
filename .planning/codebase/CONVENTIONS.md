# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `WikiArticle.tsx`, `QuizRenderer.tsx`, `HeroCommandBar.tsx`)
- Functions/utilities: camelCase (e.g., `getPacingQuadrantData.ts`, `updateTheta.ts`)
- Server actions: camelCase (e.g., `quiz.ts`, `analytics.ts`, `assessment.ts`)
- Types: `types/app.ts`, `types/supabase.ts` — all type definitions in dedicated files
- Tests: match source file with `.test.ts` suffix (e.g., `irt.test.ts`, `nbcpCalculator.test.ts`)

**Functions:**
- camelCase: `getQuizSession`, `getSessionQuestions`, `updateQuizSession`, `probabilityCorrect`, `fetchTaxonomyNodeMap`
- Server actions (exported from `'use server'` files): camelCase async functions (e.g., `getSrsReviewData`, `hasCompletedAssessment`)
- Private helpers: camelCase with `_` prefix or nested scope (e.g., `buildLevel1Resolver`, `getMasteryState`)

**Variables:**
- Constants: UPPER_SNAKE_CASE when module-level (e.g., `PACING_TARGET_MS`, `PASSING_ACCURACY`, `LS_KEY`)
- Local variables: camelCase (e.g., `selectedYear`, `containerW`, `dueItems`, `subjectSet`)
- React state: camelCase for both state and setter (e.g., `const [selectedYear, setSelectedYear] = useState()`)

**Types:**
- Interfaces: PascalCase (e.g., `WikiArticle`, `QuizSession`, `Question`, `ReadinessTrajectoryPoint`, `PacingQuadrantPoint`)
- Type aliases (unions/primitives): PascalCase (e.g., `UserTier`, `TestMode`, `SessionStatus`)
- Generic types in interfaces: PascalCase (e.g., `Choice`, `TaxonomyNode`)

## Code Style

**Formatting:**
- No `.prettierrc` or `.editorconfig` in repo root
- Enforced by Next.js ESLint config defaults
- Line length: no enforced max (common: 80-100 characters in practice)

**Linting:**
- Tool: ESLint 9.39.4 with `eslint-config-next`
- Config: `eslint.config.mjs` (flat config format)
- Key rules:
  - Allow `setState` in effects for valid patterns (`react-hooks/set-state-in-effect: off`)
  - Allow unused args/vars prefixed with `_` (`@typescript-eslint/no-unused-vars: warn` with `argsIgnorePattern: "^_"`)
  - Allow `<img>` tag (not enforcing `next/image` universally)
- Linting command: `npm run lint` / `npm run lint:fix`

**TypeScript:**
- Compiler: TypeScript 5.9.3
- Config: `tsconfig.json` with `strict: false` and `noImplicitAny: false`
- Path alias: `@/*` maps to `./src/*`
- All imports use absolute paths with `@/` prefix
- Generic `any` type permitted (loose checking by design)

## Import Organization

**Order:**
1. React/external framework imports (`import React`, `import { useState }`)
2. Next.js imports (`import { revalidatePath }`, `import { MDXRemote }`)
3. External libraries (`import { createClient }`, `import type { ... }`)
4. Internal absolute imports (`import { ... } from '@/lib/...'`, `import type { ... } from '@/types/...'`)
5. Local relative imports (rare, only for same-directory co-location)

**Path Aliases:**
- `@/lib/` — shared utilities, server actions, helpers
- `@/types/` — TypeScript interfaces and types
- `@/components/` — React components
- `@/app/` — Next.js App Router pages and layouts

**Type Imports:**
- Always use `import type` for type-only imports to reduce bundle size
- Example: `import type { Question, TestMode } from '@/types/app'`

## Error Handling

**Patterns:**
- Supabase errors: Destructure `{ data, error }` from responses; throw errors explicitly:
  ```typescript
  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('session_id', sessionId)

  if (error) throw error
  ```
- Guard clauses for auth: Check `user` upfront, throw `Unauthorized`:
  ```typescript
  if (!user) throw new Error('Unauthorized')
  ```
- Graceful fallbacks: When column may not exist yet (pre-migration), try fallback query:
  ```typescript
  if (error) {
    const { error: fallbackError } = await supabase.from(...) // retry without problematic column
    if (fallbackError) throw fallbackError
  }
  ```
- Optional coalescing: Default values for missing IRT fields:
  ```typescript
  const b = question.difficulty_rating || 0.5
  const a = question.discrimination_rating || 1
  ```

## Logging

**Framework:** `console` object directly (no logging library)

**Patterns:**
- Analytics events: Use `trackServerEvent()` for server-side actions (see `src/lib/analytics-server.ts`)
- Client-side tracking: `trackEvent()` imported from analytics module
- No structured logging; events tracked via dedicated analytics functions

## Comments

**When to Comment:**
- **Math-heavy logic:** Always document formulas and parameters (e.g., IRT 2-parameter model formula)
- **Non-obvious decisions:** Explain the "why" when logic isn't self-evident
- **Accessibility/Layout:** Use dashes for section dividers in complex components

**JSDoc/TSDoc:**
- Used sparingly
- Blocks above exported functions in server action files (e.g., `src/lib/actions/assessment.ts`)
- Standard format:
  ```typescript
  /**
   * Brief description of what this function does.
   * Optional additional context about edge cases or assumptions.
   */
  export async function functionName() { ... }
  ```
- No parameter-level `@param` tags; rely on type annotations for clarity

**Inline Comments:**
- Single-line `//` for clarifications within functions
- Sectioning with ASCII dashes: `// ── Analytics data interfaces ────────────────────────`
- Explain non-obvious behavior: `// Sort questions to match the order in questionIds`

## Function Design

**Size:** No enforced max lines; median 20-50 lines for utility functions

**Parameters:**
- Typed parameters with explicit types (no implicit `any`)
- Objects for >3 parameters (e.g., `NBCPInputs` interface for calculator)
- Async functions consistently use `await` for dependent calls

**Return Values:**
- Explicit return types in all exported functions
- Async functions return `Promise<T>`
- Type guards and null checks before returning:
  ```typescript
  if (!user) return false
  if (!data?.assessment_completed_at) return null
  ```

## Module Design

**Exports:**
- Named exports for functions and constants
- Single `export default` for React components (e.g., `export default DashboardPage`)
- All types exported as named exports from `src/types/`

**Barrel Files:**
- Not observed in codebase; each module imports from specific files
- Example: Import from `@/lib/actions/quiz` not from generic `@/lib/actions`

**Server Components:**
- Files with `'use server'` directive at top (e.g., `quiz.ts`, `assessment.ts`, `srs-review.ts`)
- Direct database queries within these files
- Async functions that must be awaited on client

## Structural Patterns

**Next.js App Router:**
- Pages in `src/app/` with `page.tsx`
- Layouts: `layout.tsx` at directory level (e.g., `src/app/(auth)/layout.tsx`)
- Dynamic routes: `[slug]/page.tsx` syntax
- API routes: `src/app/api/` directory

**Component Co-location:**
- Small components live in `_components/` subdirectory within route
- Example: `src/app/(auth)/onboarding/_components/OnboardingForm.tsx`
- Larger utilities in `src/lib/` or `src/components/`

**Zustand/State Management:**
- No global state store observed; primarily React Context + useState
- Server actions for persistence (Supabase writes)

---

*Convention analysis: 2026-03-19*
