# CLAUDE.md

Code and executable config are the source of truth in this repository. If `docs/`, `.sisyphus/`, README, or AGENTS files disagree with the live code, follow the code.

This file reflects the repository state validated on 2026-04-05.

## Build & Development Commands

```bash
bun install
```

- Installs dependencies from `package.json` and `bun.lock`.

```bash
bun run dev
```

- Runs `scripts/dev.js`.
- On Windows, `scripts/dev.js` starts Next.js with `--webpack`.
- On non-Windows platforms, it starts Next.js with `--turbopack`.
- Validation on 2026-04-05 was blocked by an existing Next dev lock in `.next/dev/lock`, so a second dev server could not fully acquire the workspace lock.

```bash
bun run build
```

- Runs `next build`.
- Validation on 2026-04-05 currently fails after compile and type-check steps with `ENOENT: no such file or directory, open '.next/required-server-files.json'`.

## Test & Lint Instructions

```bash
bun run lint
```

- Runs `eslint .`.
- Verified on 2026-04-05: completes successfully with warnings only.
- The live ESLint config extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- The current ruleset warns on unused vars and hardcoded hex colors inside Tailwind utility strings.

```bash
bun run type-check
```

- Runs `tsc --noEmit`.
- Verified on 2026-04-05: passes.

```bash
bun test
```

- Bun is the active test runner. There is no top-level `test` script in `package.json`.
- Verified on 2026-04-05: the suite runs, but it is not fully green.
- Current failing test: `src/lib/quiz/mode-presets.test.ts`.
- Current failure detail: `MODE_PRESETS.camp.navigation.backAllowed` expected `false`, received `true`.

## Project Architecture/Patterns

- Framework stack: Next.js 16.1.6 App Router, React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4, Supabase SSR, Storybook 8 with Vite.
- App routes live under `src/app`.
- Public and product routes include `/`, `/about`, `/contact`, `/pricing`, `/try`, `/tools`, `/calculators`, and `/test-3d`.
- Dashboard routes live under `src/app/dashboard`.
- Admin routes live under `src/app/admin`.
- Developer routes live under `src/app/developer`.
- CEO routes live under `src/app/(protected)/ceo` and resolve to `/ceo`.
- API routes live under `src/app/api`.

- Shared UI lives under `src/components`.
- Business logic, actions, Supabase helpers, queries, scoring, and utilities live under `src/lib`.
- Client state stores live under `src/stores`.
- Shared hooks live under `src/hooks` and `src/lib/hooks`.
- Feature-sliced modules live under `src/features`.
- Database migrations and SQL assets live under `supabase/`.
- Local tooling and ingestion scripts live under `scripts/`.

- Read-oriented async modules live in `src/lib/queries`.
- Mutations live in `src/lib/actions`.
- Server actions use `'use server'` and frequently pair mutations with `revalidatePath()` or cache-tag invalidation.
- Query modules are plain async functions intended for direct use from server components.

- Supabase server access is centralized in `src/lib/supabase/server.ts`.
- Real clients in active use include `createClient()`, `createServiceClient()`, and `createStaticClient()`.
- Demo mode and `DEV_FORCE_USER_ID` bypass are real code paths and should not be documented as hypothetical.

- State management is mixed and pragmatic: local component state for leaf UI, React context in `src/lib/context`, and Zustand in `src/stores` for shared client state.
- Current root stores are `src/stores/useLabStore.ts`, `src/stores/useQuizStore.ts`, `src/stores/useQuizTimerStore.ts`, `src/stores/useNotificationStore.ts`, and `src/stores/dev-store.ts`.

- Styling is driven from `src/app/globals.css`.
- Tailwind is configured in CSS-first mode, with semantic tokens exposed as CSS variables.
- Prefer semantic classes and shared primitives from `src/components/ui/*`.
- The repo still contains legacy hardcoded hex classes; ESLint warns on them but they have not been eliminated.
- Theme switching is handled by `next-themes` through `src/components/shared/ThemeProvider.tsx`.

- Typography in the live app is not "Inter only."
- `font-sans` is mapped in `src/app/globals.css` to Atkinson Hyperlegible.
- Additional loaded font variables include Syne, Sora, DM Mono, and an Inter-backed variable in `src/app/layout.tsx`.

- TypeScript is not strict in the current repo.
- `tsconfig.json` currently sets `"strict": false`, `"noImplicitAny": false`, and `"strictNullChecks": false`.
- Do not document or assume strict-mode rules unless the codebase is changed first.

- The repo does not consistently follow an arrow-functions-only style.
- Both arrow functions and `function` declarations are used across `src/` and `scripts/`.

- Route and navigation constants currently exist in both `src/lib/routes.ts` and `src/lib/constants/routes.ts`.
- Reuse the source already established in the area you are editing instead of creating a third route map.

- Important domain modules include `src/lib/readiness-score.ts`, `src/lib/srs/*`, `src/lib/quiz/*`, `src/features/3d-lab/*`, `src/app/dashboard/3d-lab/*`, and `src/app/calculators/_lib/*`.
- Storybook is installed and configured via `.storybook/main.ts`.
- Story files exist in `src/components`, `src/app`, and `src/features`.

## Component/File Naming Conventions

- App Router reserved filenames follow Next.js conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.
- React component filenames are primarily PascalCase `.tsx`. Examples: `PortalLayout.tsx`, `ThemeProvider.tsx`, `StatusBanner.tsx`.
- Hooks use `use...` filenames. Examples: `useComplianceCheck.ts`, `useLabTelemetry.ts`, `useQuizFocusManager.ts`.
- Zustand stores use either `use...Store.ts` or `*-store.ts`. Examples: `useLabStore.ts`, `useQuizStore.ts`, `dev-store.ts`.
- Action, query, utility, and config modules are usually lowercase or kebab-case `.ts`. Examples: `readiness-score.ts`, `daily-mission.ts`, `readiness-score-update.ts`, `adaptive-quiz.ts`.
- Tests use `.test.ts`.
- Stories use `.stories.tsx`.
- Route-private implementation folders commonly use underscore prefixes such as `_components`, `_lib`, `_config`, `_constants`, and `_utils`.
- The ESLint config restricts cross-app imports from route-private folders such as `@/app/*/_components/*`, `@/app/*/_types/*`, and `@/app/*/_config/*`.
- Shared code should live in `@/components`, `@/features`, `@/lib`, or `@/types` instead of being imported out of a route-private folder.
- The `@/*` path alias maps to `src/*`.
