# Stack Implementation Rules

**Source:** `CLAUDE.md`, `AGENTS.md`, `package.json`  
**Last Verified:** 2026-04-06  
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
