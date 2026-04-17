> Legacy rule document
> Preserved from the old `.ai/rules/` entrypoint.
> Active governance docs now live in `../`.

# Stack Implementation Rules

**Source:** `CLAUDE.md`, `AGENTS.md`, `package.json`, `.ai/state/memory.md`, `.ai/docs/01-product/`  
**Last Verified:** 2026-04-10  
**Applies To:** All agents building or modifying SlateCamp code

---

## Absolute Constraints (Never Violate)

### Code Style

- **Arrow functions only** — never use `function` declarations
  ```typescript
  // ✅ CORRECT
  const handleClick = () => { /* ... */ }
  
  // ❌ WRONG
  function handleClick() { /* ... */ }
  ```

- **Server Components by default** — add `'use client'` only when interactivity is needed
  - Target: <40% client component ratio across the codebase
  - Prefer server data fetching over `useEffect` + client fetch

### Technology Choices

- **Package manager: Bun only** — never npm, yarn, or pnpm
  ```bash
  bun install
  bun run dev
  bun run build
  ```

- **No `select('*')` in Supabase queries** — always use explicit column selects
  ```typescript
  // ✅ CORRECT
  supabase.from('users').select('id, email, full_name')
  
  // ❌ WRONG
  supabase.from('users').select('*')
  ```

- **All server action files must include `"use server"`** directive at the top

- **Wrap server actions in try/catch** — never let raw Supabase errors propagate to client

### Design System

- **Use design tokens from `globals.css`** — never hardcode hex colors
  ```tsx
  // ✅ CORRECT
  <div className="bg-primary text-foreground" />
  
  // ❌ WRONG
  <div style={{ backgroundColor: '#1B3FC4' }} />
  ```

- **No generic gamification** — no confetti, badges, virtual currency, empty streaks

- **Minimum text size:** 8px

- **Transitions:** max 300ms, `duration-150 ease-out` default — never `bounce`/`spring` easing

- **Border radius:** `rounded-sm` (buttons/inputs), `rounded-md` (cards), `rounded-lg` (modals) — never `rounded-xl`+

### Data Fetching

- **Use `Promise.all()` for independent queries** — never sequential `await` chains in page.tsx files

- **Use Suspense boundaries** for independent data sections

- **Loading skeletons** via `loading.tsx` — 87/105 pages have loading states

### TypeScript

- **Strict mode:** TypeScript 5.9.3, strict mode enabled in tsconfig

- **No `any` types** — use `unknown` with type narrowing instead

---

## Allowed Patterns

### Portal Architecture (4 Portals)

| Portal | Route | Pages | Purpose |
|--------|-------|-------|---------|
| **Dashboard** | `/dashboard` | 33 | Student-facing: wiki, drills, notes, 3D lab, analytics, trails |
| **Admin** | `/admin` | 27 | Content management: articles, questions, taxonomy, reviews |
| **CEO** | `/ceo` (via `(protected)/ceo`) | 4 | Business intelligence: MRR/ARR, financials, team |
| **Developer** | `/developer` | 21 | Internal docs, API reference, design system, dev tools |

**Source:** `.ai/state/memory.md` (verified 2026-04-09)

### Drills/Quiz Modes (9 Modes, 3 Zones)

| Zone | Modes | Character |
|------|-------|-----------|
| **01 Foundations** | camp, chill, article-review | Low-stakes learning |
| **02 Deliberate Practice** | subject, focus-review, custom | Targeted mastery |
| **03 Exam Readiness** | storm, simulation, endurance | Pressure + stamina |

**Source:** `.ai/docs/01-product/002-drill-feature-specification.md`

### Client State
- Zustand stores: `src/stores/{name}.ts`
- React Context: only for truly global state (auth, theme)

### Server Actions
- Location: `src/lib/actions/`
- Pattern: named exports, async functions, try/catch wrapped
- Always include `"use server"` directive

### Query Modules
- Location: `src/lib/queries/`
- Pattern: async functions returning typed data
- Prefer query modules over inline Supabase calls in pages

---

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Server Components | `page.tsx`, `layout.tsx` | `src/app/dashboard/page.tsx` |
| Client Components | `*.client.tsx` suffix optional but common | `src/components/quiz/Answer.client.tsx` |
| Server Actions | `*.ts` (not .tsx) | `src/lib/actions/quiz.ts` |
| Query Modules | `*.ts` | `src/lib/queries/users.ts` |
| Zustand Stores | `*.ts` | `src/stores/quiz-session.ts` |
| Utilities | `*.ts` | `src/lib/utils/format.ts` |
| Types | `*.ts` | `src/types/app.ts` |

---

## Import Order

1. React / Next.js built-ins
2. Third-party libraries
3. `@/` path alias imports (project code)
4. Relative imports
5. Type imports (`import type { ... }`)

---

## Performance Rules

- **3D scenes:** Use `frameloop="demand"` and `dpr={[1,1.5]}` for 60 FPS target
- **Bundle size:** Monitor with `bun run build` — avoid importing large libs in client components
- **Image optimization:** Use `next/image` for all images
- **Font loading:** Use `next/font/google` only (Inter, Syne, DM Mono)

---

## Prohibited

- ❌ `function` declarations
- ❌ `select('*')` in Supabase
- ❌ Hardcoded hex colors (use design tokens)
- ❌ Unwrapped server actions (no try/catch)
- ❌ Sequential awaits in page.tsx files
- ❌ `npm`/`yarn`/`pnpm` commands
- ❌ Confetti or gamification elements
- ❌ Direct Supabase errors propagating to client
- ❌ Loading data in client components with useEffect (use server components instead)

---

*Every rule here is backed by `CLAUDE.md`. Update this file when CLAUDE.md changes.*
