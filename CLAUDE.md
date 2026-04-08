# CLAUDE.md

Code and executable config are the source of truth in this repository. If docs, README, or AGENTS files disagree with the live code, follow the code.

This file reflects the repository state validated on 2026-04-07.

## Build & Development Commands

```bash
bun install
```
- Installs dependencies from `package.json` and `bun.lock`.

```bash
bun run dev
```
- Runs `scripts/dev.js`.
- Uses Turbopack on all platforms (default in Next.js 16).
- Pass `-- --webpack` to force Webpack if needed.

```bash
bun run build
```
- Runs `next build`.
- May fail with `ENOENT: no such file or directory, open '.next/required-server-files.json'` if previous build was interrupted.

```bash
bun run dev:turbo
```
- Runs `next dev --turbopack` directly.

```bash
bun run dev:webpack
```
- Runs `next dev --webpack` directly.

## Test & Lint Instructions

```bash
bun run lint
```
- Runs Storybook check first, then ESLint.
- ESLint extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Warns on unused vars and hardcoded hex colors inside Tailwind utility strings.
- Verified 2026-04-07: completes with warnings only.

```bash
bun run type-check
```
- Runs `tsc --noEmit`.
- Verified 2026-04-07: passes.

```bash
bun test
```
- Uses Bun as test runner.
- Verified 2026-04-07: suite runs but has failures.

## Project Architecture/Patterns

### Stack
- **Framework:** Next.js 16.1.6 App Router, React 19.2.4, TypeScript 5.9.3
- **Styling:** Tailwind CSS 4 (CSS-first config with semantic tokens)
- **Database:** Supabase SSR, PostgreSQL
- **Payments:** LemonSqueezy, PayRex
- **State:** Zustand for shared client state
- **Testing:** Bun test runner, Storybook 8 with Vite

### Route Structure
- App routes live under `src/app`.
- Public routes: `/`, `/about`, `/contact`, `/pricing`, `/try`, `/tools`, `/calculators`, `/test-3d`
- Dashboard routes: `src/app/dashboard`
- Admin routes: `src/app/admin`
- Developer routes: `src/app/developer`
- CEO routes: `src/app/(protected)/ceo` → resolves to `/ceo`
- API routes: `src/app/api`
- Webhooks: `/api/webhooks/lemonsqueezy`, `/api/webhooks/payrex`

### Code Organization
- **Components:** `src/components/` — shared UI, portal shells, stories
- **Features:** `src/features/` — larger vertical modules (3d-lab, wall-configurator)
- **Hooks:** `src/hooks/` and `src/lib/hooks/`
- **Actions/Queries:** `src/lib/actions/` (mutations), `src/lib/queries/` (reads)
- **Stores:** `src/stores/` — Zustand stores
- **Types:** `src/types/`
- **Database:** `supabase/` — migrations and SQL assets
- **Scripts:** `scripts/` — local tooling

### Styling & Typography
- Tailwind CSS-first config in `src/app/globals.css` with semantic tokens
- Prefer semantic classes and shared primitives from `src/components/ui/*`
- Fonts: Atkinson Hyperlegible (body/default), Plus Jakarta Sans (display headings), Syne (accent headings), Sora (logo), DM Mono (code/data)

### Path Alias
- `@/*` maps to `src/*`

## Important Context

### Design Tokens (Slatecamp System)
| Token | Hex | Tailwind Class |
|-------|-----|---------------|
| Slate Cobalt | `#1B3FC4` | `text-primary` / `bg-primary` |
| Slate Orange | `#E8853A` | Progress celebration |
| Emerald | `#2D9F6F` | `text-success` — mastery, correct |
| Warm Red | `#D64545` | `text-destructive` — errors |
| Amber | `#D4951A` | `text-warning` — warnings |
| Surface Light | `#F8F7F5` | `bg-background` |
| Ink Primary | `#1A2332` | `text-foreground` |

- Border radius: `rounded-sm` (buttons), `rounded-md` (cards), `rounded-lg` (modals)
- Shadows: `shadow-sm` (hover), `shadow-md` (dropdowns), `shadow-lg` (modals)
- Transitions: max 300ms, default `duration-150 ease-out`

### Pedagogical Engine
- IRT 2PL Model: `src/lib/srs/irt.ts`
- SM-2 SRS: `src/lib/srs/sm2.ts`
- Readiness Score: `src/lib/readiness-score.ts`

## Known Issues

### Type-Check Errors (2026-04-07)
- `src/app/api/webhooks/lemonsqueezy/route.ts`: Refactored from Stripe, requires SDK verification.
- `src/lib/actions/quiz-v2/submit-answer.test.ts`: Test-only type mismatch.
