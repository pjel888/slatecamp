# 06 — Development

The comprehensive engineering handbook for **SlateCamp** (`slate-camp v0.1.0`). Covers environment setup, package management, coding standards, Git workflow, CI/CD, and industry best practices.

<aside>
🏕️

**Primary Package Manager: Bun** — We use **Bun** as our default runtime and package manager for its speed and native TypeScript support. **pnpm** is the secondary option. **npm** is acceptable but not preferred. All commands in this guide default to Bun.

</aside>

---

## 🚀 Environment Setup

### Prerequisites

| **Tool**          | **Version**           | **Install**                                                  |
| ----------------- | --------------------- | ------------------------------------------------------------ | ----- |
| **Bun** (primary) | ≥ 1.x (latest stable) | `curl -fsSL https://bun.sh/install                           | bash` |
| pnpm (secondary)  | ≥ 9.x                 | `corepack enable && corepack prepare pnpm@latest --activate` |
| Node.js           | ≥ 20 LTS              | Required by Next.js runtime even when using Bun              |
| Git               | ≥ 2.40                | Version control                                              |
| VS Code           | Latest                | Recommended IDE with extensions listed below                 |

### Recommended VS Code Extensions

- **ESLint** — `dbaeumer.vscode-eslint`
- **Tailwind CSS IntelliSense** — `bradlc.vscode-tailwindcss`
- **Prettier** — `esbenp.prettier-vscode`
- **Error Lens** — `usernamehw.errorlens` (inline error display)
- **GitLens** — `eamodio.gitlens`
- **Thunder Client** — `rangav.vscode-thunder-client` (API testing)
- **Auto Rename Tag** — `formulahendry.auto-rename-tag`

### First-Time Setup

```bash
# 1. Clone the repository
git clone git@github.com:pjel888/slate-camp.git
cd slate-camp

# 2. Install dependencies with Bun (preferred)
bun install

# Alternative: pnpm
pnpm install

# Alternative: npm (last resort)
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Fill in your local env vars (Supabase, Stripe, etc.)
# See the Environment Variables section below

# 5. Start the dev server
bun dev
```

---

## 📦 Package Management

### Why Bun First

| **Metric**    | **Bun**                               | **pnpm**                         | **npm**                     |
| ------------- | ------------------------------------- | -------------------------------- | --------------------------- |
| Install speed | ⚡ Fastest (native, no Node overhead) | Fast (content-addressable store) | Slowest                     |
| Lockfile      | `bun.lock` (text format, fast parse) | `pnpm-lock.yaml`                 | `package-lock.json`         |
| Disk usage    | Low                                   | Lowest (symlinked store)         | Highest (flat node_modules) |
| Native TS     | Yes — runs `.ts` files directly       | No                               | No                          |
| Test runner   | Built-in (`bun test`)                 | Needs external                   | Needs external              |

### Command Cheat Sheet

| **Action**       | **Bun (primary)**  | **pnpm**            | **npm**                |
| ---------------- | ------------------ | ------------------- | ---------------------- |
| Install all deps | `bun install`      | `pnpm install`      | `npm install`          |
| Add a dependency | `bun add <pkg>`    | `pnpm add <pkg>`    | `npm install <pkg>`    |
| Add a dev dep    | `bun add -d <pkg>` | `pnpm add -D <pkg>` | `npm install -D <pkg>` |
| Remove a dep     | `bun remove <pkg>` | `pnpm remove <pkg>` | `npm uninstall <pkg>`  |
| Run a script     | `bun run <script>` | `pnpm <script>`     | `npm run <script>`     |
| Run a TS file    | `bun run file.ts`  | `npx tsx file.ts`   | `npx tsx file.ts`      |
| Update deps      | `bun update`       | `pnpm update`       | `npm update`           |

### Rules

- **Always commit the lockfile** (`bun.lock`) — this ensures reproducible builds across the team
- **Never mix package managers** — if using Bun, do not run `npm install` or `pnpm install` in the same project; it creates conflicting lockfiles
- **Pin critical dependencies** — use exact versions for `next`, `react`, `supabase`, and `stripe` to avoid surprise breaking changes
- **Audit regularly** — run `bun pm audit` or `pnpm audit` before each release

---

## 🏃 Scripts & Dev Server

```bash
# ─── DEVELOPMENT ────────────────────────────────────────
bun dev              # Start dev server (Turbopack — fastest)
bun dev:turbo        # Alias: explicit Turbopack
bun dev:webpack      # Fallback: Webpack bundler

# ─── PRODUCTION ─────────────────────────────────────────
bun run build        # Production build
bun start            # Start production server

# ─── QUALITY ────────────────────────────────────────────
bun run lint         # ESLint check
bun run lint:fix     # ESLint auto-fix
bun run type-check   # TypeScript strict check (tsc --noEmit)
bun test             # Run test suite (Bun native test runner)

# ─── UTILITIES ──────────────────────────────────────────
bun run db:generate  # Generate Supabase types
bun run db:migrate   # Run database migrations
bun run db:seed      # Seed development data
```

<aside>
⚡

**Turbopack** is the default dev bundler for Next.js in our setup. It provides near-instant hot module replacement (HMR). Only fall back to Webpack if you encounter Turbopack-specific compatibility issues with a third-party package.

</aside>

---

## 🌍 Environment Variables

```bash
# .env.local (never committed — gitignored)

# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Stripe ──
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── PayRex (Philippine Local Payments) ──
PAYREX_SECRET_KEY=your-payrex-key

# ── App ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Rules

- **Never commit secrets** — `.env.local` is gitignored; `.env.example` contains only placeholder keys
- **Validate at startup** — use Zod to parse and validate all env vars at application boot (fail fast)
- **Prefix client-side vars** with `NEXT_PUBLIC_` — anything without this prefix is server-only and cannot be accessed in the browser
- **Use separate keys** for development, staging, and production environments

---

## 📦 Full Dependency Map

- **Core Framework**
  | **Package** | **Version** | **Role** |
  | --------------------- | ----------- | ------------------------------------------------- |
  | `next` | 16.1.6 | App Router, SSG/ISR, Server Components, Turbopack |
  | `react` / `react-dom` | ^19.2.4 | UI runtime (React 19 with concurrent features) |
  | `typescript` | ^5.9.3 | Type safety across entire codebase |
- **Backend & Auth**
  | **Package** | **Version** | **Role** |
  | ----------------------- | ----------- | ----------------------------------------------------------- |
  | `@supabase/supabase-js` | ^2.98.0 | Database, auth, storage, realtime, pgvector |
  | `@supabase/ssr` | ^0.9.0 | Server-side auth for Next.js middleware + Server Components |
  | `zod` | ^4.3.6 | Runtime schema validation for API inputs, forms, env vars |
- **Payments**
  | **Package** | **Version** | **Role** |
  | ------------------- | ----------- | ------------------------------------------------------- |
  | `stripe` | ^20.4.1 | Server-side Stripe SDK (subscriptions, webhooks) |
  | `@stripe/stripe-js` | ^8.9.0 | Client-side Stripe Elements (checkout UI) |
  | `payrex-node` | ^1.7.3 | Philippine local payments (GCash, Maya, bank transfers) |
- **Rich Text Editor (TipTap)**
  | **Package** | **Version** | **Role** |
  | --------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
  | `@tiptap/react` | ^3.20.1 | React bindings for TipTap editor |
  | `@tiptap/starter-kit` | ^3.20.1 | Core editor functionality (bold, italic, lists, code, etc.) |
  | `@tiptap/pm` | ^3.20.1 | ProseMirror core dependency |
  | `@tiptap/suggestion` | ^3.20.1 | Slash commands and mention suggestions |
  | `@tiptap/extension-*` | ^3.20.1 | Bubble menu, highlight, horizontal rule, image, placeholder, task items/lists, text style, underline |
- **3D Engine**
  | **Package** | **Version** | **Role** |
  | ----------------------- | ----------- | ---------------------------------------------- |
  | `three` | ^0.183.2 | Core 3D rendering engine |
  | `@react-three/fiber` | ^9.5.0 | React reconciler for Three.js |
  | `@react-three/drei` | ^10.7.7 | Helper components (controls, loaders, effects) |
  | `three-stdlib` | ^2.36.1 | Standard Three.js utilities |
  | `camera-controls` | ^3.1.2 | Smooth, constrained camera orbit/pan/zoom |
  | `@shadergradient/react` | ^2.4.20 | Animated shader gradient backgrounds |
- **UI & Styling**
  | **Package** | **Version** | **Role** |
  | -------------------------- | ----------- | ---------------------------------------------------------- |
  | `tailwindcss` | ^4.2.1 | Utility-first CSS framework (v4) |
  | `shadcn` | ^4.0.0 | Copy-paste component library built on Radix + Tailwind |
  | `@base-ui/react` | ^1.2.0 | Unstyled, accessible base components |
  | `class-variance-authority` | ^0.7.1 | Component variant management (CVA) |
  | `clsx` | ^2.1.1 | Conditional className composition |
  | `tailwind-merge` | ^3.5.0 | Intelligent Tailwind class merging (deduplication) |
  | `lucide-react` | ^0.577.0 | Icon system |
  | `framer-motion` | ^12.35.2 | Animation library (page transitions, feedback, onboarding) |
  | `tw-animate-css` | ^1.4.0 | Tailwind animation CSS utilities |
  | `next-themes` | ^0.4.6 | Dark/light mode with system preference detection |
  | `nextjs-toploader` | ^3.9.17 | Route change progress bar |
  | `rough-notation` | ^0.5.1 | Hand-drawn-style annotation highlights |
- **Content & Markdown**
  | **Package** | **Version** | **Role** |
  | ---------------------- | ----------- | ------------------------------------------------------ |
  | `react-markdown` | ^10.1.0 | Markdown → React rendering for Wiki articles |
  | `marked` | ^17.0.4 | Markdown parsing (server-side) |
  | `remark-gfm` | ^4.0.1 | GitHub Flavored Markdown (tables, strikethrough, etc.) |
  | `remark-math` | ^6.0.0 | Math notation in Markdown |
  | `rehype-katex` | ^7.0.1 | KaTeX rendering for math equations |
  | `katex` | ^0.16.37 | Math typesetting engine |
  | `turndown` | ^7.2.2 | HTML → Markdown conversion |
  | `isomorphic-dompurify` | ^3.1.0 | HTML sanitization (XSS prevention) |
  | `pdf-parse` | ^2.4.5 | PDF text extraction (content ingestion) |
- **Data & Utilities**
  | **Package** | **Version** | **Role** |
  | ------------------ | ----------- | ----------------------------------------------- |
  | `recharts` | ^3.8.0 | Analytics dashboard charts (heatmap, line, bar) |
  | `cmdk` | ^1.1.1 | Command palette (Cmd+K Omnibar search) |
  | `date-fns` | ^4.1.0 | Date formatting and manipulation |
  | `html2canvas` | ^1.4.1 | Screenshot capture (3D Lab snapshots to Notes) |
  | `react-day-picker` | ^9.14.0 | Calendar / date picker UI |
- **Dev Tooling**
  | **Tool** | **Version** | **Purpose** |
  | ------------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
  | `eslint` • `eslint-config-next` | ^9.39.4 / 16.1.6 | Linting with Next.js-specific rules |
  | `typescript` | ^5.9.3 | Strict type checking (`tsc --noEmit`) |
  | `@tailwindcss/postcss` | ^4.2.1 | Tailwind CSS PostCSS plugin |
  | Type definitions | various | `@types/node`, `@types/react`, `@types/react-dom`, `@types/three`, `@types/dompurify` |

---

## 🌿 Git Workflow

### Branching Strategy (GitHub Flow)

We use a simplified **GitHub Flow** model — lightweight, fast, and suited for a small team shipping frequently.

```
main (protected — always deployable)
 ├── feat/quiz-engine-timer
 ├── feat/3d-lab-cutaway
 ├── fix/readiness-score-ema
 ├── chore/upgrade-next-17
 └── docs/update-wiki-schema
```

### Branch Naming Convention

| **Prefix** | **Use When**                          | **Example**                        |
| ---------- | ------------------------------------- | ---------------------------------- |
| `feat/`    | New feature or enhancement            | `feat/blindspot-protocol-queue`    |
| `fix/`     | Bug fix                               | `fix/quiz-autosave-race-condition` |
| `chore/`   | Maintenance, refactoring, dep updates | `chore/upgrade-supabase-sdk`       |
| `docs/`    | Documentation only                    | `docs/api-route-readme`            |
| `hotfix/`  | Critical production fix               | `hotfix/stripe-webhook-crash`      |
| `test/`    | Adding or updating tests              | `test/readiness-score-unit`        |

### Commit Message Convention (Conventional Commits)

Every commit message follows the **Conventional Commits** specification:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:**

| **Type**   | **When**                                                     |     |
| ---------- | ------------------------------------------------------------ | --- |
| `feat`     | A new feature (triggers minor version bump)                  |     |
| `fix`      | A bug fix (triggers patch version bump)                      |     |
| `refactor` | Code change that neither fixes a bug nor adds a feature      |     |
| `style`    | Formatting, missing semicolons, whitespace (no logic change) |     |
| `docs`     | Documentation only changes                                   |     |
| `test`     | Adding or correcting tests                                   |     |
| `chore`    | Build process, dependency updates, configs                   |     |
| `perf`     | A code change that improves performance                      |     |
| `ci`       | CI/CD configuration changes                                  |     |

**Examples:**

```
feat(quiz): add Storm Mode countdown timer
fix(auth): resolve Supabase session refresh on SSR
refactor(components): extract HeatmapNode into shared component
perf(3d-lab): lazy-load Three.js canvas with React Suspense
chore(deps): bump next from 16.1.5 to 16.1.6
```

### Daily Git Commands

```bash
# ─── START NEW WORK ─────────────────────────────────────
git checkout main
git pull origin main
git checkout -b feat/your-feature-name

# ─── DURING DEVELOPMENT ────────────────────────────────
git add .
git commit -m "feat(scope): description"

# ─── PUSH & CREATE PR ──────────────────────────────────
git push -u origin feat/your-feature-name
# Then open a Pull Request on GitHub

# ─── KEEP YOUR BRANCH UP TO DATE ───────────────────────
git checkout feat/your-feature-name
git pull origin main --rebase
# Resolve any conflicts, then:
git push --force-with-lease

# ─── AFTER PR IS MERGED ────────────────────────────────
git checkout main
git pull origin main
git branch -d feat/your-feature-name

# ─── UNDO LAST COMMIT (keep changes) ───────────────────
git reset --soft HEAD~1

# ─── STASH WORK IN PROGRESS ────────────────────────────
git stash
git stash pop

# ─── VIEW LOG (clean, one-line) ─────────────────────────
git log --oneline --graph --all
```

### Pull Request Rules

1. **Every change goes through a PR** — no direct pushes to `main`
2. **PR title follows Conventional Commits** — e.g., `feat(quiz): add Storm Mode timer`
3. **Keep PRs small and focused** — one feature or fix per PR (aim for < 400 lines changed)
4. **Describe what and why** — the PR description should explain the context, not just the code
5. **Self-review before requesting** — read your own diff before tagging a reviewer
6. **Squash merge to main** — keeps the main branch history clean and linear

### Protected Branch Rules (main)

- Require at least 1 approval before merge
- Require passing CI checks (lint, type-check, tests)
- Require branch to be up-to-date with `main` before merge
- No force pushes to `main`

---

## 📝 Coding Standards & Conventions

> These standards are enforced across the entire codebase. See [04 — Architecture](https://www.notion.so/04-Architecture-ebc6df169c364ee68f074cbe406858b5?pvs=21) for the full reference.

### Component Format (Arrow Functions)

All React components use **arrow function syntax** with **default exports**:

```tsx
import React from 'react'

interface CardProps {
  title: string
  description?: string
}

const Card = ({ title, description }: CardProps) => {
  return (
    <div className='rounded-sm border p-4'>
      <h3 className='text-lg font-bold'>{title}</h3>
      {description && <p className='text-sm text-muted'>{description}</p>}
    </div>
  )
}

export default Card
```

### Component Rules

- **Arrow functions only** — no `function` keyword for components
- **PascalCase** file and component names — `ReadinessScore.tsx`, `HeatmapNode.tsx`
- **One component per file** — the file name matches the component name
- **No `React.FC`** — use explicit prop interfaces instead (better type inference)
- **Explicit prop interfaces** — always define `interface ComponentNameProps` above the component
- **Default exports** for page-level and standalone components
- **Named exports** for utility components exported alongside others from a barrel file

### Styling Rules (Tailwind-First)

- **Tailwind CSS is the default** — use utility classes for all styling
- **Use the `cn()` utility** for conditional and merged classes:

```tsx
import { cn } from '@/lib/utils'

const Button = ({ variant, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'rounded-sm px-4 py-2 font-medium transition-colors',
        variant === 'primary' && 'bg-primary text-white hover:brightness-90',
        variant === 'ghost' && 'bg-transparent hover:bg-zinc-100',
        className,
      )}
      {...props}
    />
  )
}
```

- **Never use inline `style` props** unless dynamically computed (e.g., Three.js canvas dimensions)
- **Never write raw CSS files** for component styling — Tailwind only
- **CVA for variant management** — use `class-variance-authority` when a component has 3+ visual variants
- **Global CSS is only for:** CSS custom properties (design tokens), font imports, reset/normalize, third-party library overrides

### TypeScript Rules

- **Strict mode enabled** — `"strict": true` in `tsconfig.json`
- **No `any`** — use `unknown` and narrow with type guards instead
- **No `as` type assertions** unless absolutely necessary (and add a comment explaining why)
- **Prefer `interface` over `type`** for object shapes (better error messages, extensibility)
- **Zod for runtime validation** — never trust external data; validate API inputs, form data, and env vars with Zod schemas

---

## ⚙️ Engineering Principles

### DRY — But Don't Over-Abstract

- Follow the **Rule of Three** — only extract a shared abstraction after the third instance of duplication
- **Premature abstraction is worse than duplication.** If two pieces of code look similar but serve different purposes, let them live separately
- **Abstraction must simplify the reader's mental model**, not just reduce line count
- When extracting, the shared logic should be a clear, named concept (e.g., `useQuizTimer`, `formatReadinessScore`)

### KISS — Keep It Simple

- **No over-engineering.** If a simple `useState` solves the problem, do not introduce Zustand, Redux, or a custom hook
- **No wrapper hell.** Avoid creating wrapper components just to pass a single prop or apply a single class
- **No premature optimization.** Write it clean first. Profile it. Optimize only what the profiler tells you to
- **Readability over cleverness.** If a ternary is hard to read, use an `if` statement. If a one-liner is confusing, break it into multiple lines

### SOLID Principles (Adapted for React)

- **Single Responsibility** — each component does one thing. A `QuizCard` renders a quiz card. It does not fetch data, manage timers, or handle navigation
- **Open/Closed** — components accept props and slots (children) for extension, rather than being modified internally for each use case
- **Interface Segregation** — prop interfaces should be focused. Don't pass an entire `User` object if you only need `userName`
- **Dependency Inversion** — components depend on abstractions (hooks, context) not concrete implementations (direct Supabase calls in JSX)

### Naming Conventions

| **Entity**       | **Convention**              | **Example**                       |
| ---------------- | --------------------------- | --------------------------------- |
| Components       | PascalCase                  | `HeatmapNode.tsx`                 |
| Hooks            | camelCase with `use` prefix | `useReadinessScore.ts`            |
| Utilities        | camelCase                   | `formatDate.ts`                   |
| Constants        | SCREAMING_SNAKE_CASE        | `MAX_QUIZ_ITEMS`                  |
| Types/Interfaces | PascalCase                  | `QuizSession`, `HeatmapNodeProps` |
| API routes       | kebab-case                  | `/api/quiz-sessions`              |
| CSS tokens       | kebab-case with `--` prefix | `--surface-primary`               |
| Env vars         | SCREAMING_SNAKE_CASE        | `NEXT_PUBLIC_SUPABASE_URL`        |

### Barrel Exports

- **Use `index.ts` barrel files** for directories that export multiple related items (e.g., `components/ui/index.ts`)
- **Never create circular barrels** — if module A imports from barrel B, barrel B must not import from module A
- **Avoid deep re-exports** — barrel files should only export from their immediate children, not from deeply nested paths

---

## ⚡ Next.js & React Best Practices

### Server Components First

- **Default to Server Components** — every component is a Server Component unless it needs interactivity
- **Push `'use client'` down to the leaf** — wrap only the smallest interactive piece in a Client Component. The parent should remain a Server Component
- **Never put `'use client'` at the layout level** — this converts the entire subtree to client rendering

### Data Fetching

- **Fetch data in Server Components** using `async/await` — no `useEffect` for initial data loads
- **Use Server Actions** for mutations (form submissions, database writes) — they are type-safe and avoid API route boilerplate
- **Validate all inputs** with Zod before processing in Server Actions
- **Cache aggressively** — use Next.js `fetch` caching, `unstable_cache`, and ISR for content that doesn't change per-user

### Client Component Rules

- **Minimize client-side state** — prefer URL search params (`useSearchParams`) for filter/sort state so it's shareable and bookmarkable
- **Use `React.lazy` and `Suspense`** for heavy client components (3D Lab, Recharts) — never block the initial page load
- **No `useEffect` for data fetching** — use Server Components or SWR/React Query if client-side fetching is truly needed
- **Debounce expensive operations** — search inputs, resize handlers, scroll listeners
- **Clean up subscriptions** — always return cleanup functions from `useEffect`

### Route Organization

- **Group by feature, not by type** — `(auth)/`, `dashboard/`, `pricing/` keep related routes together
- **Use Route Groups `()`** for layouts that apply to a subset of pages without affecting the URL
- **Use `loading.tsx`** for every route segment that fetches data — prevents layout shift
- **Use `error.tsx`** for graceful error boundaries at route boundaries

---

## 🏁 Frontend Performance

### Targets

| **Metric**                     | **Target** | **Why**                                |
| ------------------------------ | ---------- | -------------------------------------- |
| Largest Contentful Paint (LCP) | < 1.5s     | Users perceive the page as "fast"      |
| First Input Delay (FID)        | < 50ms     | Interactions feel instant              |
| Cumulative Layout Shift (CLS)  | < 0.05     | Nothing jumps around on load           |
| Time to Interactive (TTI)      | < 2s       | Quiz engine must be usable immediately |

### Performance Checklist

- [ ] **Dynamic imports** — `next/dynamic` for heavy components (3D Lab, Recharts, TipTap editor)
- [ ] **Tree-shaking** — import only what you need: `import { format } from 'date-fns'` not `import * as dateFns`
- [ ] **Image optimization** — always use `next/image` with `width`, `height`, and `priority` for above-the-fold images
- [ ] **Font optimization** — use `next/font` for self-hosted Inter and JetBrains Mono (no layout shift)
- [ ] **Optimistic UI** — "Save to Notes" reacts instantly; DB writes happen async in background
- [ ] **Debounce inputs** — search (300ms), resize (150ms), scroll handlers (100ms)
- [ ] **No unnecessary state libraries** — `useState` and `useContext` cover 90% of cases. Only reach for Zustand if you have genuinely complex cross-component state
- [ ] **Bundle analysis** — run `ANALYZE=true bun run build` periodically to check for bloat
- [ ] **Avoid layout thrashing** — batch DOM reads before writes; prefer CSS transforms over position changes
- [ ] **Prefetch critical routes** — use `<Link prefetch>` for dashboard and quiz routes

---

## 🧪 Testing Strategy

### Test Pyramid

| **Layer**   | **Tool**                  | **What to Test**                                          | **Coverage Target** |
| ----------- | ------------------------- | --------------------------------------------------------- | ------------------- |
| Unit        | Bun test runner           | Utility functions, hooks, Zod schemas, score calculations | High (80%+)         |
| Component   | React Testing Library     | UI components render correctly, props work, accessibility | Medium              |
| Integration | Bun test + Supabase local | API routes, Server Actions, database queries              | Medium              |
| E2E         | Playwright                | Critical user flows (signup → quiz → score → notes)       | Key paths only      |

### What to Test (and What Not To)

- **Always test:** Business logic (Readiness Score calculation, EMA weighting, quiz scoring), Zod schemas, utility functions, authentication flows
- **Test selectively:** Component rendering, form validation UX, responsive layout
- **Never test:** Third-party library internals, CSS styling details, simple pass-through components

### Running Tests

```bash
# Unit & integration tests
bun test

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# E2E tests (requires dev server running)
bunx playwright test
```

---

## 🚢 CI/CD Pipeline

### GitHub Actions Workflow

Every push and PR triggers the following pipeline:

```
┌─────────┐    ┌───────────┐    ┌─────────────┐    ┌──────────┐
│  Lint    │───▶│ Type Check│───▶│  Unit Tests │───▶│  Build   │
│ (ESLint) │    │ (tsc)     │    │ (bun test)  │    │ (next)   │
└─────────┘    └───────────┘    └─────────────┘    └──────────┘
                                                         │
                                                    ┌────▼─────┐
                                                    │  Deploy  │
                                                    │ (Vercel) │
                                                    └──────────┘
```

### Pipeline Stages

| **Stage**         | **Command**                          | **Blocks Deploy?** |
| ----------------- | ------------------------------------ | ------------------ |
| Lint              | `bun run lint`                       | Yes                |
| Type Check        | `bun run type-check`                 | Yes                |
| Unit Tests        | `bun test`                           | Yes                |
| Build             | `bun run build`                      | Yes                |
| Preview Deploy    | Vercel preview (per PR)              | No (informational) |
| Production Deploy | Vercel production (on merge to main) | —                  |

### Deployment

- **Platform:** Vercel (optimized for Next.js)
- **Preview deploys** on every PR — share the preview URL for visual review
- **Production deploys** automatically on merge to `main`
- **Environment variables** managed in Vercel dashboard (never in code)
- **Rollback** — Vercel supports instant rollback to any previous deployment

---

## 🔒 Security Best Practices

- **Sanitize all user input** — use `isomorphic-dompurify` for any HTML content, Zod for structured data
- **No secrets in client bundles** — only `NEXT_PUBLIC_*` vars are accessible client-side
- **CORS and CSP headers** — configure in `next.config.js` for production
- **Rate limiting** — implement on API routes (especially auth, quiz submission, AI tutor)
- **SQL injection prevention** — always use parameterized queries via Supabase client (never string concatenation)
- **XSS prevention** — sanitize rendered markdown/HTML; use React's built-in escaping for JSX
- **Dependency audits** — run `bun pm audit` monthly; automate with Dependabot or Renovate
- **Auth guard middleware** — protect all `/dashboard/*` routes with Supabase auth middleware

---

## 📁 Project Structure Reference

```
slate-camp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, signup, reset)
│   │   ├── about/
│   │   ├── api/                # API routes
│   │   ├── auth/               # Auth callbacks
│   │   ├── contact/
│   │   ├── dashboard/          # Main app (protected)
│   │   │   ├── 3d-lab/
│   │   │   ├── analytics/
│   │   │   ├── notes/
│   │   │   ├── settings/
│   │   │   ├── testing/
│   │   │   ├── wiki/
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── 3d/                 # Three.js / R3F components
│   │   ├── auth/               # Auth forms, guards
│   │   ├── dashboard/          # Dashboard-specific UI
│   │   ├── dev/                # Dev-only tools (debug panels)
│   │   ├── layouts/            # Shared layout components
│   │   ├── marketing/          # Landing page sections
│   │   ├── notes/              # Notes editor components
│   │   ├── shared/             # Cross-feature shared components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── wiki/               # Wiki reader components
│   └── lib/                    # Utilities, helpers, configs
│       ├── utils.ts            # cn() and general utilities
│       ├── supabase/           # Supabase client configs
│       ├── stripe/             # Stripe helpers
│       └── validations/        # Zod schemas
├── public/                     # Static assets
├── .env.example                # Template env vars
├── .env.local                  # Local secrets (gitignored)
├── .eslintrc.json
├── .gitignore
├── bun.lock                   # Bun lockfile (committed)
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✅ Development Checklist

Before every PR, confirm:

- [ ] `bun run lint` passes with zero warnings
- [ ] `bun run type-check` passes with zero errors
- [ ] `bun test` passes all tests
- [ ] `bun run build` completes successfully
- [ ] No `console.log` left in committed code (use a linter rule)
- [ ] No `any` types introduced
- [ ] No hardcoded secrets or API keys
- [ ] New components follow arrow function format with explicit prop interfaces
- [ ] Tailwind used for all styling (no inline styles, no CSS modules)
- [ ] `cn()` used for conditional classes
- [ ] Server Components by default; `'use client'` only at the leaf
- [ ] Heavy imports are dynamically loaded (`next/dynamic` or `React.lazy`)
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains _what_ and _why_
