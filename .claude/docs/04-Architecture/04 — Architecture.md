# 04 — Architecture

System architecture, database design, and infrastructure for **SlateCamp** (`slatecamp v0.1.0`).

---

## 🧠 System Overview

```mermaid
graph TB
    A["Next.js 16 App Router"] --> B["Supabase Backend"]
    A --> C["React Three Fiber"]
    A --> D["TipTap Editor"]
    A --> E["Recharts Dashboard"]
    B --> F["PostgreSQL + pgvector"]
    B --> G["Auth + Row-Level Security"]
    B --> H["Realtime Subscriptions"]
    A --> I["Stripe + PayRex"]
    A --> J["AI RAG Pipeline"]
    J --> F
```

---

## 🗄️ Backend — Supabase

SlateCamp uses **Supabase** as the unified backend:

- **Auth:** `@supabase/ssr ^0.9.0` for server-side auth + `@supabase/supabase-js ^2.98.0` for client
- **Database:** PostgreSQL with Row-Level Security (RLS) for multi-tenant data isolation
- **Vector Store:** pgvector extension for AI tutor's closed-loop semantic search
- **Realtime:** Supabase Realtime for live quiz state sync and collaborative features
- **Storage:** Supabase Storage for 3D assets (.GLB), images, and user uploads

### Core Database Tables

| **Table**           | **Purpose**               | **Key Columns**                                                                                                         |
| ------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `taxonomy_tree`     | Master Syllabus hierarchy | `node_id`, `parent_id`, `level` (1-3), `name`, `subject_area`                                                           |
| `wiki_articles`     | SME-authored content      | `article_id`, `topic_id` (FK), `title`, `content` (MD), `author_id`, `last_updated`                                     |
| `questions`         | Quiz question bank        | `question_id`, `topic_id` (FK), `subject_id` (FK), `text` (MD), `options` (JSON), `rationale` (MD), `difficulty`        |
| `user_interactions` | Atomic telemetry log      | `interaction_id`, `user_id`, `session_id`, `question_id`, `selected_option`, `is_correct`, `time_spent_ms`, `test_mode` |
| `user_node_mastery` | Aggregated mastery scores | `user_id`, `topic_id`, `total_attempts`, `total_correct`, `mastery_weight` (EMA), `avg_time_ms`                         |
| `user_notes`        | Personal workspace blocks | `note_id`, `user_id`, `title`, `content_blocks` (JSON), `associated_topics` (FK array)                                  |
| `wiki_embeddings`   | Vector store for AI tutor | `embedding_id`, `article_id` (FK), `chunk_text`, `embedding` (vector), `topic_id`                                       |

---

## 🖥️ Frontend — Next.js 16

### Rendering Strategy

- **Wiki pages:** Static Site Generation (SSG) / Incremental Static Regeneration (ISR) — pre-rendered at build, served via CDN for sub-100ms loads
- **Quiz Engine:** Client-side with server-fetched payload — full quiz delivered as single JSON array upfront
- **Dashboard:** Server Components for initial data fetch + client-side Recharts for interactive visualizations
- **3D Lab:** Lazy-loaded via React Suspense — only loads when user navigates to Lab

### Full Project Directory

```jsx
slatecamp/
├── src/                    # Claude Code AI agent config
│   ├── agents/                 # Custom AI agent definitions
│   ├── docs/                   # Agent reference docs
│   ├── skills/                 # Reusable AI skills
│   │   ├── componentize-ui/
│   │   ├── enforce-server-components/
│   │   ├── extract-magic-strings/
│   │   └── worktrees/
│   ├── launch.json
│   └── settings.local.json
├── .cursor/                    # Cursor IDE config
├── .next/                      # Next.js build output
├── .planning/                  # Project planning docs
├── .worktrees/                 # Git worktree configs
├── docs/                       # Project documentation
├── node_modules/
├── public/                     # Static assets (fonts, images, 3D models)
├── scripts/                    # Build & dev scripts (custom dev.js)
├── src/                        # ══════ SOURCE ROOT ══════
│   ├── app/                    # ── Next.js App Router ──
│   │   ├── (auth)/             # Route group: login, signup, onboarding
│   │   ├── about/              # Marketing: About page
│   │   ├── api/                # API routes (Stripe webhooks, Edge Functions)
│   │   ├── auth/               # Auth callbacks (Supabase OAuth, magic links)
│   │   ├── contact/            # Marketing: Contact page
│   │   ├── dashboard/          # ── Authenticated App Shell ──
│   │   │   ├── 3d-lab/         #   Feature 4: Interactive 3D Lab
│   │   │   ├── analytics/      #   Feature 6: Heatmap & Readiness Score
│   │   │   ├── notes/          #   Feature 3: Personal Notes & Workspace
│   │   │   ├── settings/       #   User settings & account management
│   │   │   ├── testing/        #   Feature 2: Quizzing Engine (Camp + Storm)
│   │   │   ├── wiki/           #   Feature 1: Taxonomy-Mapped Wiki
│   │   │   ├── layout.tsx      #   Dashboard layout (sidebar, nav, auth gate)
│   │   │   ├── loading.tsx     #   Dashboard loading skeleton
│   │   │   └── page.tsx        #   Dashboard home (overview / Readiness Score)
│   │   ├── pricing/            # Marketing: Pricing tiers page
│   │   ├── favicon.ico
│   │   ├── globals.css         # Tailwind v4 global styles
│   │   ├── layout.tsx          # Root layout (providers, theme, fonts)
│   │   └── page.tsx            # Landing page / hero
│   ├── components/             # ── Component Library ──
│   │   ├── 3d/                 # 3D Lab: R3F canvas, parametric sandbox, models
│   │   ├── auth/               # Auth UI: login forms, signup flows
│   │   ├── dashboard/          # Dashboard: heatmap, charts, node inspector
│   │   ├── dev/                # Dev tools: debug panels, test utilities
│   │   ├── layouts/            # Layout shells: sidebar, header, footer
│   │   ├── marketing/          # Marketing pages: hero, features, CTA sections
│   │   ├── notes/              # Notes workspace: editor, capture, cheat sheets
│   │   ├── shared/             # Shared: modals, tooltips, loaders, error states
│   │   ├── ui/                 # shadcn/ui primitives: button, input, dialog, etc.
│   │   └── wiki/               # Wiki: article viewer, ToC, breadcrumbs, Zen Mode
│   └── lib/                    # Utilities, helpers, constants, hooks, types, Supabase client
├── .cursorrules                # Cursor IDE AI rules
├── .env.local                  # Environment variables (Supabase, Stripe, PayRex keys)
├── .gitattributes
├── .gitignore
├── bun.lock                    # Bun package manager lockfile
├── CLAUDE.md                   # Claude Code project context doc
├── components.json             # shadcn/ui component registry config
├── DATABASE_SCHEMA.sql         # Supabase PostgreSQL schema definition
├── eslint.config.mjs           # ESLint flat config (Next.js rules)
├── FEATURE_TREE.md             # Feature hierarchy / roadmap doc
└── install.cmd                 # Windows install script
```

### Routing Architecture

The app uses a **two-zone pattern:** public marketing routes at the top level, and all authenticated product features nested under `/dashboard/`.

| **Route**              | **Zone**   | **Maps to Feature**                                |
| ---------------------- | ---------- | -------------------------------------------------- |
| `/`                    | Public     | Landing page / hero ("Know you'll win")            |
| `/about`               | Public     | Marketing: About SlateCamp                         |
| `/contact`             | Public     | Marketing: Contact / support                       |
| `/pricing`             | Public     | Marketing: Pricing tiers (Free → Camp → Insurance) |
| `(auth)/`              | Public     | Login, signup, onboarding flow                     |
| `/auth`                | Public     | Supabase auth callbacks (OAuth, magic links)       |
| `/api`                 | Server     | Stripe/PayRex webhooks, Edge Functions             |
| **`/dashboard`**       | **Auth'd** | **Dashboard home — overview & Readiness Score**    |
| `/dashboard/wiki`      | Auth'd     | Feature 1: Taxonomy-Mapped Wiki                    |
| `/dashboard/testing`   | Auth'd     | Feature 2: Quizzing Engine (Camp + Storm Mode)     |
| `/dashboard/notes`     | Auth'd     | Feature 3: Personal Notes & Workspace              |
| `/dashboard/3d-lab`    | Auth'd     | Feature 4: Interactive 3D Lab                      |
| `/dashboard/analytics` | Auth'd     | Feature 6: Heatmap & Performance Analytics         |
| `/dashboard/settings`  | Auth'd     | User settings & account management                 |

The `dashboard/layout.tsx` acts as the **authenticated app shell** — it wraps all product features with the sidebar navigation, auth gate, and shared loading state (`loading.tsx`).

### Component Architecture

Components are organized by **feature domain**, not by type. Each folder is self-contained:

| **Directory**           | **Feature**                 | **Key Components**                                               |
| ----------------------- | --------------------------- | ---------------------------------------------------------------- |
| `components/3d/`        | 3D Lab (Feature 4)          | R3F canvas, parametric sandbox, camera controls, model viewers   |
| `components/auth/`      | Authentication              | Login forms, signup flows, onboarding quiz                       |
| `components/dashboard/` | Analytics (Feature 6)       | Taxonomy heatmap, Recharts graphs, node inspector, pacing gauge  |
| `components/dev/`       | Developer Tools             | Debug panels, test utilities, dev-only UI                        |
| `components/layouts/`   | App Shell                   | Sidebar nav, header, footer, responsive wrappers                 |
| `components/marketing/` | Marketing Pages             | Hero section, feature grids, CTA blocks, testimonials            |
| `components/notes/`     | Notes Workspace (Feature 3) | TipTap editor, capture blocks, cheat sheet builder               |
| `components/shared/`    | Shared Utilities            | Modals, tooltips, loaders, error boundaries, toast notifications |
| `components/ui/`        | Design System               | shadcn/ui primitives (Button, Input, Dialog, Card, etc.)         |
| `components/wiki/`      | Wiki (Feature 1)            | Article renderer, sticky ToC, breadcrumbs, Zen Mode, Omnibar     |

### State Management

- **Server state:** Supabase client with React Server Components
- **Client UI state:** React Context (dark mode, zen mode, active ToC highlight)
- **Quiz state:** Local state with 10-second auto-save to Supabase (zero-data-loss guarantee)
- **Theme:** `next-themes ^0.4.6` for dark/light mode switching

### Dev Tooling & AI Assistance

- **Claude Code** (`.claude/`) — AI agents with custom skills for componentizing UI, enforcing Server Components, and extracting magic strings
- **Cursor IDE** (`.cursor/`, `.cursorrules`) — AI-assisted coding with project-specific rules
- **Package Manager:** Bun (`bun.lock`) for fast installs and script execution
- **Schema Source of Truth:** `DATABASE_SCHEMA.sql` at project root — all Supabase table definitions
- **Feature Roadmap:** `FEATURE_TREE.md` at project root — feature hierarchy and status

---

## 📝 Coding Standards & Conventions

### Component Format

All React components **must** use arrow function syntax with default exports. This is the canonical format for every component in the codebase:

```tsx
import React from 'react'

const Card = () => {
  return <div>Card</div>
}

export default Card
```

**Rules:**

- ✅ **Arrow functions only** — no `function` declarations for components
- ✅ **Default export** at the bottom of the file — not inline
- ✅ **PascalCase** for component names (`QuizCard`, `WikiArticle`, not `quizCard`)
- ✅ **One component per file** — file name matches component name
- ❌ **No named exports** for page-level or feature-level components (use default)
- ❌ **No `React.FC` type annotation** — use explicit prop types instead:

```tsx
import React from 'react'

interface QuizCardProps {
  question: string
  options: string[]
  onSelect: (index: number) => void
}

const QuizCard = ({ question, options, onSelect }: QuizCardProps) => {
  return (
    <div className={cn('rounded-sm border p-6', 'bg-slate-900')}>
      <h3>{question}</h3>
      {options.map((opt, i) => (
        <button key={i} onClick={() => onSelect(i)}>
          {opt}
        </button>
      ))}
    </div>
  )
}

export default QuizCard
```

### Styling — Tailwind First

**Tailwind CSS is the only styling method.** No CSS modules, no styled-components, no inline `style` objects.

- ✅ Use **Tailwind utility classes** for all styling
- ✅ Use the **`cn()` utility** (from `lib/utils.ts`) for conditional and merged classes:

```tsx
import { cn } from '@/lib/utils'

const Button = ({ variant, className }: ButtonProps) => {
  return (
    <button
      className={cn(
        'rounded-sm px-4 py-2 font-medium transition-colors',
        variant === 'primary' &&
          'bg-emerald-500 text-white hover:bg-emerald-600',
        variant === 'ghost' && 'bg-transparent text-slate-400 hover:text-white',
        className,
      )}
    />
  )
}
```

- ✅ `cn()` wraps `clsx` + `tailwind-merge` — handles conditional classes and deduplicates conflicting Tailwind utilities
- ✅ Always pass `className` as an optional prop so consumers can extend styles
- ❌ **No raw CSS files** except `globals.css` for Tailwind directives and CSS custom properties
- ❌ **No `style={{}}` inline objects** — if dynamic values are needed, use CSS variables via Tailwind

---

## ⚙️ Engineering Principles

### DRY — Don't Repeat Yourself (But Don't Over-Abstract)

<aside>
⚠️

**The Rule of Three:** Don't abstract until you've written the same pattern **three times.** Premature abstraction is worse than duplication. When you do abstract, keep it simple and obvious.

</aside>

- **Extract shared UI** into `components/shared/` or `components/ui/` only after the third occurrence
- **Extract shared logic** into custom hooks in `lib/` only when two or more components share the same state/effect pattern
- **Extract shared types** into `types/` when used across 2+ feature domains
- **Never** create a `utils/helpers/misc.ts` junk drawer — keep utilities named and focused

### Keep It Simple

- **No over-engineering** — solve the current problem, not hypothetical future ones
- **No premature optimization** — measure first with React DevTools / Lighthouse, then optimize
- **No wrapper hell** — if a component wraps another component that wraps another, flatten it
- **Favor readability over cleverness** — explicit code that a new developer can understand in 30 seconds

### Best Practices

- **Destructure props** in the function signature, not inside the body
- **Co-locate** related files — a component's types, hooks, and tests live next to it
- **Avoid prop drilling** beyond 2 levels — use React Context or composition instead
- **Avoid `any`** — use proper TypeScript types. If truly unknown, use `unknown` and narrow
- **Name booleans** with `is`, `has`, `should` prefixes (`isLoading`, `hasError`, `shouldAutoSave`)
- **Name handlers** with `on` or `handle` prefixes (`onClick`, `handleSubmit`)
- **Use barrel exports (`index.ts`)** sparingly — only for `components/ui/` to simplify shadcn imports

---

## ⚡ Next.js & React Server Components

### Server Components First

Next.js 16 App Router defaults to **Server Components.** Respect this boundary:

- ✅ **Server Components (default)** — pages, layouts, data-fetching wrappers, static content
- ✅ **Client Components (`'use client'`)** — only when you need: interactivity (onClick, onChange), browser APIs (localStorage, window), hooks (useState, useEffect), or third-party client libraries (TipTap, R3F, Recharts, Framer Motion)
- ❌ **Never add `'use client'` to a page.tsx or layout.tsx** unless absolutely required — keep the boundary as low as possible in the component tree

### The Client Boundary Rule

Push `'use client'` **down** to the smallest interactive leaf component:

```tsx
// ❌ BAD — entire page is a client component
'use client'
const WikiPage = () => {
  /* ... */
}

// ✅ GOOD — page is a Server Component, only the interactive parts are client
// app/dashboard/wiki/page.tsx (Server Component)
import WikiArticle from '@/components/wiki/wiki-article' // Server
import WikiHighlightToolbar from '@/components/wiki/highlight-toolbar' // Client

const WikiPage = async () => {
  const article = await getArticle() // Server-side data fetch
  return (
    <>
      <WikiArticle content={article} />
      <WikiHighlightToolbar /> {/* 'use client' inside */}
    </>
  )
}
```

### Data Fetching Rules

- **Fetch data in Server Components** — direct Supabase queries, no `useEffect` for initial data
- **Use `async/await`** in Server Components — no `useQuery` or `useSWR` for server-fetched data
- **Pass data down as props** from Server Components to Client Components
- **Use Server Actions** for mutations (form submissions, quiz state updates)
- **Client-side fetching** only for: real-time updates (Supabase Realtime), user-triggered actions, and polling

---

## 🏁 Frontend Performance

<aside>
💨

**Performance is not optional.** Filipino students access SlateCamp on budget Android phones over 3G/4G. Every millisecond counts. Every kilobyte counts.

</aside>

### Core Web Vitals Targets

| **Metric**                         | **Target** | **How**                                                       |
| ---------------------------------- | ---------- | ------------------------------------------------------------- |
| **LCP** (Largest Contentful Paint) | <1.5s      | Server Components, SSG/ISR for Wiki, minimal client JS        |
| **FID** (First Input Delay)        | <50ms      | Small client bundles, code splitting, no main-thread blocking |
| **CLS** (Cumulative Layout Shift)  | <0.05      | Explicit dimensions on images/3D canvas, font `display: swap` |
| **TTI** (Time to Interactive)      | <2s        | Minimal client-side hydration, progressive enhancement        |

### Performance Rules

**Bundle Size:**

- ✅ **Dynamic imports** (`next/dynamic`) for all heavy client components (TipTap, R3F, Recharts, KaTeX)
- ✅ **Tree-shake aggressively** — import specific functions, never entire libraries (`import { format } from 'date-fns'`, not `import * as dateFns`)
- ✅ **Analyze bundles** regularly with `@next/bundle-analyzer`
- ❌ **Never import Three.js or R3F outside of `/dashboard/3d-lab`** — lazy load via React Suspense

**Rendering:**

- ✅ **Server Components for all static content** — zero JS shipped for Wiki articles, layouts, static pages
- ✅ **Streaming with Suspense** — show loading skeletons instantly while data streams in
- ✅ **`loading.tsx`** in every route segment for instant visual feedback
- ✅ **ISR for Wiki pages** — pre-rendered at build, revalidated on-demand when SMEs update content

**Images & Assets:**

- ✅ **`next/image`** for all images — automatic optimization, lazy loading, responsive sizing
- ✅ **Draco-compressed `.GLB`** for all 3D models — smallest possible file size
- ✅ **Font subsetting** — only load the character ranges actually used

**Data:**

- ✅ **Quiz payload pre-fetched as single JSON** — no waterfall requests during exam
- ✅ **Optimistic UI** for all write operations — show success immediately, sync in background
- ✅ **Debounce** auto-save and search inputs (10s for quiz state, 300ms for Omnibar)
- ✅ **`React.memo`** only when profiling proves re-render cost — not as a default pattern

**What NOT to do:**

- ❌ **No global state libraries** (Redux, Zustand) unless profiling proves Context is a bottleneck
- ❌ **No `useEffect` for data fetching** in components that could be Server Components
- ❌ **No layout thrashing** — batch DOM reads/writes, use `transform` over `top/left` for animations
- ❌ **No unoptimized re-renders** — if a component re-renders on every keystroke, fix it

---

## 💳 Payment Architecture

Dual payment processing for international + Philippine local coverage:

| **Provider** | **Package**                                   | **Use Case**                                                     |
| ------------ | --------------------------------------------- | ---------------------------------------------------------------- |
| Stripe       | `stripe ^20.4.1` • `@stripe/stripe-js ^8.9.0` | International cards, subscription management, webhook processing |
| PayRex       | `payrex-node ^1.7.3`                          | GCash, Maya, Philippine bank transfers, local payment methods    |

---

## 🤖 AI Pipeline Architecture

```mermaid
graph LR
    A["User Question"] --> B["Semantic Search<br>pgvector"]
    B --> C["Top-K Wiki Chunks"]
    C --> D["Primary LLM<br>temp=0.0"]
    D --> E["Auditor LLM<br>Hallucination Check"]
    E -->|Pass| F["Response + Citation Badge"]
    E -->|Fail| D
```

- **Embedding pipeline:** Wiki articles chunked → embedded → stored in Supabase pgvector
- **Retrieval:** Semantic search finds top-K relevant chunks for user query
- **Generation:** Primary LLM synthesizes answer from ONLY retrieved chunks (temperature 0.0)
- **Verification:** Auditor LLM validates no numbers/dates/codes were hallucinated
- **Fallback:** "I cannot find a definitive answer" → redirect to subject node

---

## 🔐 Security & Auth

- **Supabase Auth** with SSR integration (`@supabase/ssr`)
- **Row-Level Security (RLS)** on all user-specific tables
- **Content Sanitization:** `isomorphic-dompurify ^3.1.0` for all user-generated content
- **Input Validation:** `zod ^4.3.6` for all API inputs and form data
- **Subscription Gating:** Middleware checks tier access before serving premium routes

---

## 📦 Key Infrastructure Decisions

1. **Supabase over custom backend** — Integrated auth, DB, realtime, storage, and pgvector in one service. Reduces ops overhead for a small team.
2. **TipTap over Slate.js** — Production-ready, extensible, excellent React integration. Already supports all required block types.
3. **Dual payments (Stripe + PayRex)** — Stripe for international; PayRex for Philippine-specific methods (GCash, Maya) which are critical for the Filipino student market.
4. **pgvector over Pinecone** — Keeps vector store co-located with relational data in Supabase. Simpler architecture, fewer services to manage.
5. **Next.js 16 with Turbopack** — Fastest dev iteration; SSG/ISR for Wiki performance; Server Components for dashboard.

---

Unified Educational OS — PostgreSQL Schema v1.0 MASTER (Supabase)

**Status:** v1.0 MASTER · **Engine:** PostgreSQL 15+ (Supabase) · **Requires:** `pgvector` extension

> The complete, production-ready schema for SlateCamp. Core Engine (Disciplines → Taxonomy → Content → Quizzing → Analytics) plus Extensions (Subscriptions, Notes Workspace, Feedback & SME Pipeline). Integrates horizontal scaling, EMA scoring, IRT weighting, Zero-Data-Loss persistence, and pgvector RAG.

---

## 🗣️ The Schema in Plain English

<aside>
💡

Think of this schema as a massive, highly secure digital university. We just added the master blueprint that allows you to expand the campus infinitely — plus the business office, the student notebook, and the quality control department.

</aside>

### 1. The Cashier's Office (`user_subscriptions`) — _New in v1.0_

Before a student walks into any building, they pass through the cashier. This table knows whether they're on the Free tier (limited access), the Camp monthly plan, the Insurance 6-month bundle, or an Institutional license. It connects to Stripe and PayRex so payments are handled by webhooks — the app never touches credit card data directly.

### 2. The Campus Directory (`disciplines`)

The front doors to different buildings on a university campus. Architecture, Law, Nursing — each discipline is a completely isolated vertical. This single table is what allows your startup to scale to 50 different professions without ever having to write a new app or build a new database.

### 3. The Filing Cabinets (`taxonomy_tree`)

Inside your specific building, there is a massive set of filing cabinets. Before we store a single question, we build the folders. Everything is strictly filed up to 6 levels deep (to handle complex professions like Law and Medicine). The `is_leaf` flag tells the UI exactly where the content lives.

### 4. The Library & The AI Brain (`questions`, `wiki_articles`, `wiki_embeddings`)

- **Questions:** This is where we store the test items. We don't just store the question and the answer; we store a "difficulty rating" so the system knows if a student answered a genuinely hard question or just an easy one.
- **Wiki & Embeddings:** We store the textbook articles here. But we also chop those articles into mathematical pieces (embeddings). When a student asks the AI a question, it only searches these exact mathematical pieces. This is how we guarantee the AI won't hallucinate or lie.

### 5. The Student Notebook (`user_notes`) — _New in v1.0_

Students can capture notes from anywhere in the app — Wiki, Quiz, or 3D Lab — without leaving their screen. Each note is a block-based document (TipTap JSON) linked back to the taxonomy topics it came from. The system even tracks whether a student _revisits_ their notes, so it can nudge them if they're capturing but never reviewing.

### 6. The Magical Desk (`quiz_sessions`)

When a student starts a mock exam, the system assigns them a "Session." Think of this as a magical desk. It remembers exactly which 200 questions were handed to the student. If the student's laptop dies or their Wi-Fi drops, the desk holds their exact place so they never lose their data.

### 7. The Security Camera (`user_interactions`)

Most quiz apps only remember the final score. This table is a security camera that records _every single click_. It logs what option they chose, whether they flagged it for review, and exactly how many milliseconds they spent looking at it. If a student answers a highly complex math question correctly in 2 seconds, this table flags it as a **"Lucky Guess"** so they don't get fake credit.

### 8. The Report Card (`user_node_mastery` & `user_global_stats`)

If the app had to review the "Security Camera" (millions of clicks) every time a student opened their dashboard, the app would crash. Instead, we have a pre-calculated Report Card that updates quietly in the background.

- **Recency Bias:** If a student bombed a topic in January but aced it in March, the system weighs the March score heavier.
- **The Pressure Gap:** It keeps a separate score for how the student performs in casual practice versus how they perform under a strict, timed exam.
- **The Dashboard Hero:** It tracks which building they are in (e.g., Architecture) and instantly loads their overall readiness score and study streaks so the app feels lightning-fast.

### 9. The Quality Control Department (`feedback_submissions`, `feedback_votes`, `sme_review_queue`) — _New in v1.0_

This is the platform's immune system. When a student spots a wrong answer, flags an AI hallucination, or reports a bug, it enters a structured feedback pipeline. Other students can upvote the report. Critical issues (hallucinations, content errors) are automatically routed to a dedicated **SME Review Queue** where Subject Matter Experts can verify, approve, or reject the fix. This closes the loop between user feedback and content quality.

### 10. The Bouncers (Row-Level Security — RLS)

This is strict database security. It guarantees that Student A can never, under any circumstances, see Student B's test scores or personal data. Even if a hacker tried to trick the app, the database itself acts as a bouncer and rejects the request. Subscription data is read-only for users (only webhooks can write). The SME queue is locked down to admin/SME roles by default.

---

## 🏗️ Schema Overview

| **#** | **Table**              | **Role**                                                                             | **Scale Profile**                               |
| ----- | ---------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 1     | `user_subscriptions`   | **NEW** — Paywall & Business Engine (Stripe/PayRex webhooks, tier gating)            | One row per user                                |
| 2     | `disciplines`          | Horizontal Scaling Layer: one row per licensure exam vertical                        | Tens of rows (one per exam type)                |
| 3     | `taxonomy_tree`        | Master Syllabus — up to 6 levels, scoped per discipline, `is_leaf` terminal nodes    | Hundreds of rows per discipline                 |
| 4A    | `questions`            | SME-Authored Question Bank with IRT difficulty parameters                            | Thousands (grows with content)                  |
| 4B    | `wiki_articles`        | Authoritative knowledge base articles feeding the UI and the AI Tutor                | Thousands (grows with content)                  |
| 4C    | `wiki_embeddings`      | pgvector chunks for the Zero-Hallucination RAG pipeline                              | Tens of thousands (multiple chunks per article) |
| 5     | `user_notes`           | **NEW** — Personal Workspace (TipTap JSON blocks, taxonomy-linked, revisit tracking) | Tens of thousands (grows with users)            |
| 6     | `user_global_stats`    | O(1) cache for Dashboard hero metrics with `current_discipline_id`                   | One row per user                                |
| 7     | `quiz_sessions`        | State Manager with `question_ids[]` and `current_question_index` for crash recovery  | Tens of thousands (grows with users)            |
| 8     | `user_interactions`    | Atomic Telemetry Log with `is_flagged` and `is_lucky_guess` columns                  | **Millions of rows** (hot path, write-heavy)    |
| 9     | `user_node_mastery`    | Aggregation Layer with `pressure_mastery_weight` for the Storm Mode Pressure Gap     | Tens of thousands (one row per user×topic)      |
| 10A   | `feedback_submissions` | **NEW** — User feedback pipeline (bugs, hallucination flags, feature requests)       | Thousands (grows with engagement)               |
| 10B   | `feedback_votes`       | **NEW** — Upvoting system for feedback prioritization                                | Tens of thousands                               |
| 10C   | `sme_review_queue`     | **NEW** — Dedicated SME review queue for content accuracy issues                     | Hundreds (triaged from feedback)                |

---

## 📄 Complete SQL Script

```sql
-- ============================================================
-- SLATECAMP: UNIFIED EDUCATIONAL OS SCHEMA (v1.0 MASTER)
-- Production-Ready PostgreSQL Schema for Supabase
-- ============================================================
-- Core Engine: Disciplines → Taxonomy → Content → Quizzing → Analytics
-- Extensions:  Notes Workspace, Feedback System, Subscriptions
-- Integrates:  Horizontal Scaling, EMA scoring, IRT weighting,
--              Zero-Data-Loss persistence, and pgvector RAG.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. PREREQUISITES: EXTENSIONS, ENUMS & UTILITY FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- Enable pgvector for the AI Contextual Tutor (Zero-Hallucination RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- Quizzing Enums
CREATE TYPE test_mode AS ENUM ('camp', 'storm');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- Subscription Enums
CREATE TYPE subscription_tier AS ENUM ('free', 'camp', 'insurance', 'institutional');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

-- Feedback Enums
CREATE TYPE feedback_channel AS ENUM ('widget', 'post_quiz', 'hallucination_flag', 'wiki_flag', '3d_perf_report', 'nps', 'churn_exit', 'feature_pulse', 'discord', 'ambassador', 'partner', 'app_store');
CREATE TYPE feedback_feature_area AS ENUM ('wiki', 'quiz', 'notes', '3d_lab', 'ai_tutor', 'analytics', 'progression', 'auth', 'payments', 'onboarding', 'performance', 'content');
CREATE TYPE feedback_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
CREATE TYPE feedback_status AS ENUM ('new', 'triaged', 'in_progress', 'resolved', 'wont_fix', 'duplicate');

-- SME Review Enums
CREATE TYPE sme_review_type AS ENUM ('hallucination', 'content_error', 'outdated_code', 'taxonomy_gap', 'question_quality', 'scheduled_audit');
CREATE TYPE sme_review_status AS ENUM ('pending', 'assigned', 'in_review', 'approved', 'rejected');

-- Auto-update trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────
-- 1. SUBSCRIPTIONS (The Paywall & Business Engine)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_subscriptions (
    subscription_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier                   subscription_tier NOT NULL DEFAULT 'free',
    status                 subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id     TEXT,
    stripe_subscription_id TEXT,
    payrex_reference       TEXT,
    current_period_end     TIMESTAMPTZ,
    cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_subscription UNIQUE (user_id)
);

COMMENT ON TABLE user_subscriptions IS
    'Tracks user access tiers. Updated via Stripe/PayRex webhooks (Server Actions).';

CREATE INDEX idx_subs_user ON user_subscriptions(user_id);
CREATE INDEX idx_subs_stripe ON user_subscriptions(stripe_customer_id);

CREATE TRIGGER trg_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 2. DISCIPLINES (The Horizontal Scaling Layer)
-- ────────────────────────────────────────────────────────────
CREATE TABLE disciplines (
    discipline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL UNIQUE, -- e.g., 'Architecture Licensure Exam'
    acronym       TEXT NOT NULL,        -- e.g., 'ALE', 'PNLE', 'CPALE'
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE disciplines IS
    'Top-level vertical. Allows SlateCamp to host Law, Med, and Architecture on the exact same codebase.';

CREATE TRIGGER trg_disciplines_updated_at
    BEFORE UPDATE ON disciplines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 3. TAXONOMY_TREE (The Master Syllabus)
-- ────────────────────────────────────────────────────────────
CREATE TABLE taxonomy_tree (
    node_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discipline_id UUID NOT NULL REFERENCES disciplines(discipline_id) ON DELETE CASCADE,
    parent_id     UUID REFERENCES taxonomy_tree(node_id) ON DELETE SET NULL,
    level         SMALLINT NOT NULL CHECK (level >= 1 AND level <= 6),
    name          TEXT NOT NULL,
    subject_area  TEXT NOT NULL,
    is_leaf       BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE taxonomy_tree IS
    'Master syllabus taxonomy. Supports up to 6 levels. is_leaf defines terminal nodes.';

CREATE INDEX idx_taxonomy_discipline ON taxonomy_tree(discipline_id);
CREATE INDEX idx_taxonomy_parent ON taxonomy_tree(parent_id);
CREATE INDEX idx_taxonomy_subject ON taxonomy_tree(subject_area);

CREATE TRIGGER trg_taxonomy_tree_updated_at
    BEFORE UPDATE ON taxonomy_tree
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 4. CONTENT LAYER: QUESTIONS & WIKI
-- ────────────────────────────────────────────────────────────

-- 4A. QUESTIONS (SME-Authored Quizzing Bank)
CREATE TABLE questions (
    question_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id      UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    subject_id    UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    text          TEXT NOT NULL,
    options       JSONB NOT NULL DEFAULT '[]'::jsonb,
    rationale     TEXT,
    difficulty    NUMERIC(3,2) NOT NULL DEFAULT 0.50
                  CHECK (difficulty >= 0.0 AND difficulty <= 1.0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE questions IS
    'SME-authored question bank. difficulty = IRT b-parameter for weighted scoring.';

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

CREATE TRIGGER trg_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4B. WIKI_ARTICLES (SME-Authored Knowledge Base)
CREATE TABLE wiki_articles (
    article_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id      UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    title         TEXT NOT NULL,
    content       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE wiki_articles IS
    'The definitive source of truth. Authoritative content that feeds the UI and the AI.';

CREATE TRIGGER trg_wiki_articles_updated_at
    BEFORE UPDATE ON wiki_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4C. WIKI_EMBEDDINGS (AI Contextual Tutor RAG Store)
CREATE TABLE wiki_embeddings (
    embedding_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id    UUID NOT NULL REFERENCES wiki_articles(article_id) ON DELETE CASCADE,
    topic_id      UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    chunk_text    TEXT NOT NULL,
    embedding     vector(1536) NOT NULL
);

COMMENT ON TABLE wiki_embeddings IS
    'Vectorized chunks of Wiki articles for the Zero-Hallucination AI retrieval pipeline.';

CREATE INDEX idx_wiki_embeddings_vector
    ON wiki_embeddings USING ivfflat (embedding vector_cosine_ops);

-- ────────────────────────────────────────────────────────────
-- 5. NOTES & WORKSPACE (The Synthesis Ledger)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_notes (
    note_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title               TEXT,
    content_blocks      JSONB NOT NULL DEFAULT '[]'::jsonb,
    associated_topics   UUID[] NOT NULL DEFAULT '{}',
    viewed_at           TIMESTAMPTZ, -- For "capture but no revisit" metrics
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_notes IS
    'Personal workspace blocks. content_blocks stores TipTap JSON. associated_topics maps to taxonomy.';

CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_viewed ON user_notes(viewed_at);

CREATE TRIGGER trg_user_notes_updated_at
    BEFORE UPDATE ON user_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 6. USER_GLOBAL_STATS (Dashboard Hero Metrics)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_global_stats (
    user_id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_discipline_id   UUID REFERENCES disciplines(discipline_id) ON DELETE SET NULL,
    global_readiness_score  DOUBLE PRECISION NOT NULL DEFAULT 0.0
                            CHECK (global_readiness_score >= 0.0 AND global_readiness_score <= 100.0),
    current_streak_days     INTEGER NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
    longest_streak_days     INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
    last_study_date         DATE,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_global_stats IS
    'O(1) lookup table for the Dashboard hero numbers. Tracks which discipline the user is currently studying.';

CREATE TRIGGER trg_user_global_stats_updated_at
    BEFORE UPDATE ON user_global_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 7. QUIZ_SESSIONS (The State Manager & Zero-Data-Loss)
-- ────────────────────────────────────────────────────────────
CREATE TABLE quiz_sessions (
    session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    test_mode              test_mode NOT NULL DEFAULT 'camp',
    status                 session_status NOT NULL DEFAULT 'in_progress',
    question_ids           UUID[] NOT NULL DEFAULT '{}',
    current_question_index INTEGER NOT NULL DEFAULT 0,
    started_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at           TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quiz_sessions IS
    'Session state manager. question_ids and current_question_index guarantee exact resume state after crashes.';

CREATE INDEX idx_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_sessions_status ON quiz_sessions(status) WHERE status = 'in_progress';

CREATE TRIGGER trg_quiz_sessions_updated_at
    BEFORE UPDATE ON quiz_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 8. USER_INTERACTIONS (The Atomic Telemetry Log)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_interactions (
    interaction_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id           UUID NOT NULL REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
    question_id          UUID NOT NULL REFERENCES questions(question_id) ON DELETE RESTRICT,
    topic_id             UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    selected_option_id   TEXT,              -- NULL allowed for timeout/skipped items
    is_correct           BOOLEAN NOT NULL,
    is_flagged           BOOLEAN NOT NULL DEFAULT FALSE,
    is_lucky_guess       BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_ms        INTEGER NOT NULL CHECK (time_spent_ms >= 0),
    interaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_interactions IS
    'Atomic telemetry log. is_lucky_guess flags < P10 answer times. is_flagged saves UI state.';

CREATE INDEX idx_interactions_user_topic ON user_interactions(user_id, topic_id);
CREATE INDEX idx_interactions_user_session ON user_interactions(user_id, session_id);
CREATE INDEX idx_interactions_question ON user_interactions(question_id);
CREATE INDEX idx_interactions_timestamp ON user_interactions(interaction_timestamp DESC);

CREATE TRIGGER trg_user_interactions_updated_at
    BEFORE UPDATE ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 9. USER_NODE_MASTERY (The Aggregation Layer)
-- ────────────────────────────────────────────────────────────
CREATE TABLE user_node_mastery (
    mastery_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id                UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    total_attempts          INTEGER NOT NULL DEFAULT 0 CHECK (total_attempts >= 0),
    total_correct           INTEGER NOT NULL DEFAULT 0 CHECK (total_correct >= 0),
    current_mastery_weight  DOUBLE PRECISION NOT NULL DEFAULT 0.0
                            CHECK (current_mastery_weight >= 0.0 AND current_mastery_weight <= 1.0),
    pressure_mastery_weight DOUBLE PRECISION
                            CHECK (pressure_mastery_weight >= 0.0 AND pressure_mastery_weight <= 1.0),
    avg_time_ms             INTEGER NOT NULL DEFAULT 0 CHECK (avg_time_ms >= 0),
    last_encountered        TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_topic UNIQUE (user_id, topic_id)
);

COMMENT ON TABLE user_node_mastery IS
    'Pre-computed EMA scores. pressure_mastery_weight tracks Storm Mode delta (The Pressure Gap).';

CREATE INDEX idx_mastery_user ON user_node_mastery(user_id);
CREATE INDEX idx_mastery_user_topic ON user_node_mastery(user_id, topic_id);
CREATE INDEX idx_mastery_last_encountered
    ON user_node_mastery(user_id, last_encountered ASC NULLS FIRST);

CREATE TRIGGER trg_user_node_mastery_updated_at
    BEFORE UPDATE ON user_node_mastery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 10. FEEDBACK & IMMUNE SYSTEM (The SME Pipeline)
-- ────────────────────────────────────────────────────────────

-- 10A. FEEDBACK SUBMISSIONS
CREATE TABLE feedback_submissions (
    feedback_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel               feedback_channel NOT NULL,
    feature_area          feedback_feature_area NOT NULL,
    taxonomy_node_id      UUID REFERENCES taxonomy_tree(node_id) ON DELETE SET NULL,
    priority              feedback_priority,
    status                feedback_status NOT NULL DEFAULT 'new',
    mood_rating           SMALLINT CHECK (mood_rating BETWEEN 1 AND 3),
    body_text             TEXT NOT NULL,
    screenshot_url        TEXT,
    metadata              JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_interaction_id UUID REFERENCES user_interactions(interaction_id) ON DELETE SET NULL,
    source_article_id     UUID REFERENCES wiki_articles(article_id) ON DELETE SET NULL,
    resolved_at           TIMESTAMPTZ,
    resolved_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_note       TEXT,
    user_notified         BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE feedback_submissions IS
    'Captures all user feedback: bug reports, AI hallucinations, content flags.';

CREATE INDEX idx_feedback_status ON feedback_submissions(status);
CREATE INDEX idx_feedback_feature ON feedback_submissions(feature_area);

CREATE TRIGGER trg_feedback_submissions_updated_at
    BEFORE UPDATE ON feedback_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10B. FEEDBACK VOTES
CREATE TABLE feedback_votes (
    vote_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id           UUID NOT NULL REFERENCES feedback_submissions(feedback_id) ON DELETE CASCADE,
    user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_feedback_vote UNIQUE (feedback_id, user_id)
);

COMMENT ON TABLE feedback_votes IS
    'Upvoting system for feature requests and feedback.';

-- 10C. SME REVIEW QUEUE
CREATE TABLE sme_review_queue (
    review_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id           UUID REFERENCES feedback_submissions(feedback_id) ON DELETE SET NULL,
    type                  sme_review_type NOT NULL,
    article_id            UUID REFERENCES wiki_articles(article_id) ON DELETE SET NULL,
    question_id           UUID REFERENCES questions(question_id) ON DELETE SET NULL,
    topic_id              UUID NOT NULL REFERENCES taxonomy_tree(node_id) ON DELETE RESTRICT,
    priority              feedback_priority NOT NULL,
    status                sme_review_status NOT NULL DEFAULT 'pending',
    assigned_sme_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ai_interaction_log    JSONB,
    sme_verdict           TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at           TIMESTAMPTZ,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sme_review_queue IS
    'Dedicated queue for content accuracy issues that require Subject Matter Expert review.';

CREATE INDEX idx_sme_queue_status ON sme_review_queue(status);
CREATE INDEX idx_sme_queue_topic ON sme_review_queue(topic_id);

CREATE TRIGGER trg_sme_review_queue_updated_at
    BEFORE UPDATE ON sme_review_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────────────

-- Enable RLS everywhere
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxonomy_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_global_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_node_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_review_queue ENABLE ROW LEVEL SECURITY;

-- 11A. Content & Structs (Public Read, Admin Write via Dashboard)
CREATE POLICY "public_read_disciplines" ON disciplines FOR SELECT USING (true);
CREATE POLICY "public_read_taxonomy" ON taxonomy_tree FOR SELECT USING (true);
CREATE POLICY "public_read_questions" ON questions FOR SELECT USING (true);
CREATE POLICY "public_read_wiki" ON wiki_articles FOR SELECT USING (true);
CREATE POLICY "public_read_embeddings" ON wiki_embeddings FOR SELECT USING (true);

-- 11B. Subscriptions (Users Read, Service Role Writes via Webhook)
CREATE POLICY "subs_select_own" ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- 11C. Notes & Workspace (Strict Ownership)
CREATE POLICY "notes_select_own" ON user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert_own" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update_own" ON user_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_delete_own" ON user_notes FOR DELETE USING (auth.uid() = user_id);

-- 11D. Global Hero Stats (Own User Only)
CREATE POLICY "stats_select_own" ON user_global_stats FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "stats_insert_own" ON user_global_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stats_update_own" ON user_global_stats FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11E. Quiz Sessions (Strict Ownership)
CREATE POLICY "sessions_select_own" ON quiz_sessions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON quiz_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update_own" ON quiz_sessions FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11F. User Interactions (Immutable Log, Own User Only)
CREATE POLICY "interactions_select_own" ON user_interactions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "interactions_insert_own" ON user_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 11G. User Node Mastery (Strict Ownership)
CREATE POLICY "mastery_select_own" ON user_node_mastery FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "mastery_insert_own" ON user_node_mastery FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mastery_update_own" ON user_node_mastery FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11H. Feedback Pipeline (Users Read/Write Own, SMEs/Admins handle queue)
CREATE POLICY "feedback_select_own" ON feedback_submissions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "feedback_insert_own" ON feedback_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "votes_select_all" ON feedback_votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_own" ON feedback_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete_own" ON feedback_votes FOR DELETE
    USING (auth.uid() = user_id);

-- (sme_review_queue is typically protected for SME roles only;
--  omitting public policies ensures default deny for anons/standard users)

-- ============================================================
-- THE SLATECAMP MASTER SCHEMA IS COMPLETE.
-- ============================================================
```

---

## 🔬 Data Science Annotations

### Subscriptions & Tier Gating

The `user_subscriptions` table is the **business engine**. The `tier` enum maps directly to the pricing page: `free` → limited access (20 questions/day, 5 3D models), `camp` → full quizzing + analytics, `insurance` → everything including AI Tutor and Storm Mode, `institutional` → B2B university licenses. The frontend checks `tier` + `status` on every gated action. Stripe/PayRex webhooks update this table via `service_role` — users can only read their own row.

### Horizontal Scaling — The `disciplines` Table

The `disciplines` table is the **Phase 3 unlock**. It decouples the entire schema from any single exam type. Every taxonomy node, question, and wiki article traces back through `taxonomy_tree.discipline_id` to a specific discipline. Adding a new exam (Nursing, Law, CPA) is a **data-entry exercise**, not a code change.

### EMA (Exponential Moving Average) — Recency Bias

The `current_mastery_weight` in `user_node_mastery` is recalculated after every session:

$$EMA_{new} = alpha times score_{latest} + (1 - alpha) times EMA_{previous}$$

Where $\alpha$ (smoothing factor) is tunable. A higher $\alpha$ makes the score more reactive to recent sessions. This ensures the Readiness Score reflects **who the user is today**.

### The Pressure Gap — Storm vs. Camp Mastery

The `pressure_mastery_weight` column stores a **separate EMA calculated only from Storm Mode sessions**. The delta between `current_mastery_weight` (Camp) and `pressure_mastery_weight` (Storm) reveals the **Pressure Gap** — how much performance degrades under exam conditions.

### IRT (Item Response Theory) — Difficulty Weighting

The `difficulty` column on `questions` (0.0–1.0) is the IRT **b-parameter**. Harder questions contribute more to the Readiness Score. This prevents score inflation from grinding easy questions.

### Lucky Guess Detection — First-Class Column

`is_lucky_guess` on `user_interactions` is computed and persisted at write time. Correct answers submitted faster than the P10 historical threshold receive **partial mastery credit** (0.3× instead of 1.0×) in the EMA calculation.

### Notes & Smart Resurfacing

The `user_notes` table stores TipTap JSON blocks with `associated_topics` linking back to taxonomy. The `viewed_at` timestamp powers **Smart Resurfacing** — the engine flags saved notes when a user struggles on related quiz topics. Notes with `viewed_at = NULL` (captured but never revisited) trigger nudge notifications.

### The Feedback Immune System

The feedback pipeline is a three-table system:

1. **`feedback_submissions`** — captures structured reports from 12 channels (in-app widget, post-quiz, hallucination flags, NPS surveys, Discord, etc.) with links to the exact interaction or article that triggered it
2. **`feedback_votes`** — community upvoting with a unique constraint per user per feedback item, enabling data-driven prioritization
3. **`sme_review_queue`** — critical content issues (hallucinations, outdated codes, question quality) are triaged here for SME review with a full audit trail (`ai_interaction_log`, `sme_verdict`, `assigned_sme_id`)

### Blindspot Protocol — Spaced Repetition

`last_encountered` on `user_node_mastery` drives the Spaced Repetition scheduler. Topics with `NULL` or `> 14 days stale` are over-indexed in quiz generation.

### Zero-Hallucination RAG — The Wiki + Embeddings Pipeline

The `wiki_articles` → `wiki_embeddings` pipeline powers the AI Contextual Tutor via a closed-loop vector corpus — no internet, no pre-training data. Every AI response carries a citation badge traceable through `embedding → article → topic`.

---

## 📐 Entity Relationship Diagram

```mermaid
erDiagram
    auth_users ||--o| user_subscriptions : "user_id"
    auth_users ||--o| user_global_stats : "user_id"
    auth_users ||--o{ user_notes : "user_id"
    auth_users ||--o{ quiz_sessions : "user_id"
    auth_users ||--o{ user_interactions : "user_id"
    auth_users ||--o{ user_node_mastery : "user_id"
    auth_users ||--o{ feedback_submissions : "user_id"
    auth_users ||--o{ feedback_votes : "user_id"

    disciplines ||--o{ taxonomy_tree : "discipline_id"
    disciplines ||--o{ user_global_stats : "current_discipline_id"

    taxonomy_tree ||--o{ taxonomy_tree : "parent_id (self-ref)"
    taxonomy_tree ||--o{ questions : "topic_id"
    taxonomy_tree ||--o{ questions : "subject_id"
    taxonomy_tree ||--o{ wiki_articles : "topic_id"
    taxonomy_tree ||--o{ wiki_embeddings : "topic_id"
    taxonomy_tree ||--o{ user_interactions : "topic_id"
    taxonomy_tree ||--o{ user_node_mastery : "topic_id"
    taxonomy_tree ||--o{ feedback_submissions : "taxonomy_node_id"
    taxonomy_tree ||--o{ sme_review_queue : "topic_id"

    wiki_articles ||--o{ wiki_embeddings : "article_id"
    wiki_articles ||--o{ feedback_submissions : "source_article_id"
    wiki_articles ||--o{ sme_review_queue : "article_id"

    quiz_sessions ||--o{ user_interactions : "session_id"
    questions ||--o{ user_interactions : "question_id"
    questions ||--o{ sme_review_queue : "question_id"

    user_interactions ||--o{ feedback_submissions : "source_interaction_id"

    feedback_submissions ||--o{ feedback_votes : "feedback_id"
    feedback_submissions ||--o{ sme_review_queue : "feedback_id"

    user_subscriptions {
        UUID subscription_id PK
        UUID user_id FK
        ENUM tier
        ENUM status
        TEXT stripe_customer_id
        TEXT stripe_subscription_id
        TEXT payrex_reference
        TIMESTAMPTZ current_period_end
        BOOLEAN cancel_at_period_end
    }

    disciplines {
        UUID discipline_id PK
        TEXT name
        TEXT acronym
    }

    taxonomy_tree {
        UUID node_id PK
        UUID discipline_id FK
        UUID parent_id FK
        SMALLINT level
        TEXT name
        TEXT subject_area
        BOOLEAN is_leaf
    }

    questions {
        UUID question_id PK
        UUID topic_id FK
        UUID subject_id FK
        TEXT text
        JSONB options
        TEXT rationale
        NUMERIC difficulty
    }

    wiki_articles {
        UUID article_id PK
        UUID topic_id FK
        TEXT title
        TEXT content
    }

    wiki_embeddings {
        UUID embedding_id PK
        UUID article_id FK
        UUID topic_id FK
        TEXT chunk_text
        vector embedding
    }

    user_notes {
        UUID note_id PK
        UUID user_id FK
        TEXT title
        JSONB content_blocks
        UUID_ARRAY associated_topics
        TIMESTAMPTZ viewed_at
    }

    user_global_stats {
        UUID user_id PK
        UUID current_discipline_id FK
        FLOAT global_readiness_score
        INT current_streak_days
        INT longest_streak_days
        DATE last_study_date
    }

    quiz_sessions {
        UUID session_id PK
        UUID user_id FK
        ENUM test_mode
        ENUM status
        UUID_ARRAY question_ids
        INT current_question_index
        TIMESTAMPTZ started_at
        TIMESTAMPTZ completed_at
    }

    user_interactions {
        UUID interaction_id PK
        UUID user_id FK
        UUID session_id FK
        UUID question_id FK
        UUID topic_id FK
        TEXT selected_option_id
        BOOLEAN is_correct
        BOOLEAN is_flagged
        BOOLEAN is_lucky_guess
        INTEGER time_spent_ms
        TIMESTAMPTZ interaction_timestamp
    }

    user_node_mastery {
        UUID mastery_id PK
        UUID user_id FK
        UUID topic_id FK
        INTEGER total_attempts
        INTEGER total_correct
        FLOAT current_mastery_weight
        FLOAT pressure_mastery_weight
        INTEGER avg_time_ms
        TIMESTAMPTZ last_encountered
    }

    feedback_submissions {
        UUID feedback_id PK
        UUID user_id FK
        ENUM channel
        ENUM feature_area
        UUID taxonomy_node_id FK
        ENUM priority
        ENUM status
        SMALLINT mood_rating
        TEXT body_text
        JSONB metadata
        UUID source_interaction_id FK
        UUID source_article_id FK
    }

    feedback_votes {
        UUID vote_id PK
        UUID feedback_id FK
        UUID user_id FK
    }

    sme_review_queue {
        UUID review_id PK
        UUID feedback_id FK
        ENUM type
        UUID article_id FK
        UUID question_id FK
        UUID topic_id FK
        ENUM priority
        ENUM status
        UUID assigned_sme_id FK
        JSONB ai_interaction_log
        TEXT sme_verdict
    }
```
