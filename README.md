# Project Cerebro

**The second brain for board exam takers.** A cognitive-first test prep platform that adapts to you: active recall, spaced repetition, and AI-powered study tools for board exam success.

Built for board exam takers across professions (architecture first, then medicine, law, engineering), starting with the Philippine Architecture Licensure Exam (ALE).

---

## What Cerebro Does

- **Review Mode** — Casual “doomscroll” study: one question per screen, infinite scroll, rich explanations and references after each answer. No scores or timers; lightweight tracking only.
- **Sessions Mode** — Tracked, analytics-driven quizzes: subject quick-start, custom session builder (subjects + counts + difficulty/timer), and session types (SRS Review, retake, topic drill, 3D quiz, weak areas). Full quiz engine with progress, optional timer, and session summary.
- **3D Library** — Visual learning with interactive models and callouts linked to quizzes (schema and routes in place; React Three Fiber integration planned).
- **Analytics** — Subject mastery (e.g. radar chart), study time, streaks, daily stats, and per-session breakdowns.
- **Tiers** — Free, Pro, and Max with feature gating (SRS, 3D, AI tutor, PDF ingestion). Payments via Stripe and Payrex (Philippines).

Everything is scoped by **Exam Profile**: a user can have multiple exams (e.g. ALE, another board); the active profile drives dashboard, quiz, review, and analytics.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript (strict mode, no `any`) |
| Database | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, Edge Functions) |
| Auth | Supabase Auth via `@supabase/ssr` (cookie-based; never localStorage) |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com) (Base UI primitives) |
| Icons | [Lucide React](https://lucide-react.dev) (1.5px stroke, 20px default) |
| Charts | [Recharts](https://recharts.org) |
| Content | react-markdown, remark-gfm, remark-math, rehype-katex, KaTeX |
| Payments | [Stripe](https://stripe.com) + [Payrex](https://payrex.com) (Philippines: GCash, Maya, Card, QR Ph) |
| AI | OpenAI / Anthropic (configurable); embeddings for RAG |
| SRS | SM-2 + Item Response Theory (IRT) in `src/lib/srs/` |
| PDF | pdf-parse |
| Email / Analytics | Resend, PostHog (planned) |
| 3D | React Three Fiber + @react-three/drei (planned; schema and routes exist) |

---

## Architecture

### Principles

- **Server Components by default** — Use `'use client'` only for interactivity: `useState`, `useEffect`, event handlers, or browser APIs.
- **Server Actions for all mutations** — Every database write goes through a Server Action (`'use server'`). No direct client-side Supabase writes.
- **No `useEffect` for data fetching** — Data is loaded in RSC async functions or via the `use()` hook.
- **RLS on every table** — Row Level Security is enabled on all Supabase tables. See `DATABASE_SCHEMA.sql` before adding features.
- **Single source of truth for the database** — `DATABASE_SCHEMA.sql` at the project root defines the full schema. Do not add columns or tables that are not defined there.
- **Type safety** — Supabase-generated types in `types/supabase.ts`; app types in `types/app.ts`. No `any`.
- **Mobile-first** — Touch targets at least 44px; bottom nav on mobile; quiz/review UIs full-width on small screens.

### State Management

Cerebro does **not** use a global state library (no Redux, Zustand, etc.). State is handled as follows:

1. **Server state**  
   Data is fetched in Server Components or Server Actions and passed as props. The dashboard layout loads the current user, profile, exam profiles, subjects, and feature flags on the server and passes them into providers or children.

2. **Exam profile context** (`src/lib/context/exam-profile-context.tsx`)  
   - **Purpose:** Holds the active exam profile, list of all profiles, and subjects for the active exam.  
   - **Provided by:** Dashboard layout (wraps all dashboard content).  
   - **Values:** `activeProfile`, `profiles`, `subjects`, `switchProfile(profileId)`, `refreshProfiles()`.  
   - **Usage:** Sidebar exam switcher, dashboard stats, quiz/review subject lists, and any feature that needs “current exam” or “subjects for this exam.”  
   - **Persistence:** Switching profile updates `exam_profiles.is_active` in Supabase and then refreshes server data; the context is rehydrated from layout props after navigation.

3. **Breadcrumb context** (`src/lib/context/breadcrumb-context.tsx`)  
   - **Purpose:** Lets individual pages set custom breadcrumb items for the dashboard header.  
   - **Values:** `breadcrumbs`, `setBreadcrumbs(items)`.  
   - **Usage:** Pages like Library, Library bank/subject, and Session Builder call `SetBreadcrumbs` with an array of `{ href, label }`. When in Quiz or Review “mode,” the header shows “Quiz mode” / “Review mode” and ignores custom breadcrumbs.

4. **Theme**  
   Handled by `next-themes` in `ThemeProvider` (light / dark / system). No app-specific theme state beyond that.

5. **Feature flags (admin / demo)**  
   Stored in a **cookie** (`cerebro_dev_flags`). Read in the dashboard layout via `getFeatureFlags()` and used with `getEffectiveTier()` and `hasTierAccess()`. Used for tier spoofing and bypassing 3D/AI/SRS gates; never written to the database.

6. **Local UI state**  
   Quiz engine, review feed, session builder, modals, and forms use React `useState` / `useReducer` / `useCallback` / `useMemo` in their own components. Optimistic updates for quiz answers are done with `useOptimistic` where applicable for sub-100ms perceived latency.

There is no shared client-side cache layer (e.g. React Query); refetches are triggered by `router.refresh()` or by calling context methods like `refreshProfiles()` after mutations.

---

## Design System — “Rams Standard”

Braun/Dieter Rams–inspired minimal UI: “Less, but better.”

- **Colors:** Achromatic base (warm whites, greys, charcoal) with functional accents: amber (CTAs, progress), green (correct/success), red (errors), blue (info), gold (achievements). All via CSS variables in `src/app/globals.css`; no hardcoded hex in components.
- **No gradients or heavy shadows** (max shadow: `0 1px 3px rgba(26,26,26,0.06)`).
- **Transitions:** 150ms ease on interactive elements.
- **Buttons:** Solid primary; ghost/outline secondary.
- **Cards:** White background, 1px border, 8px radius.
- **Loading:** Skeleton screens only; no spinners.
- **Empty states:** One line of muted text plus a CTA; no illustration-heavy empty states.

---

## Project Structure

```
project-cerebro/
├── DATABASE_SCHEMA.sql          # Single source of truth for DB schema (do not add columns elsewhere)
├── .cursorrules                 # AI coding assistant rules
├── middleware.ts                # Supabase session refresh (auth)
├── next.config.ts               # Next.js config (images, serverExternalPackages, turbopack)
├── scripts/
│   └── dev.js                   # Dev launcher: Turbopack on non-Windows, Webpack on Windows (avoids Turbopack CSS bug)
│
├── supabase/
│   └── migrations/              # SQL migrations (apply in order 001 → 012)
│
└── src/
    ├── app/
    │   ├── layout.tsx           # Root: fonts, ThemeProvider, TooltipProvider, DemoShell (if demo)
    │   ├── page.tsx             # Landing
    │   ├── globals.css          # Tailwind + Rams Standard CSS variables
    │   │
    │   ├── (auth)/              # Auth route group
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── forgot-password/
    │   │   └── onboarding/      # Exam selection → target date → study hours → plan
    │   │
    │   ├── auth/callback/       # Supabase OAuth callback
    │   │
    │   ├── dashboard/
    │   │   ├── layout.tsx       # Shell: Sidebar, Navbar, DashboardHeader, BreadcrumbProvider, ExamProfileProvider, BottomNav, DevToolbar
    │   │   ├── page.tsx         # Dashboard home (subject cards, stats, recent sessions, quick actions)
    │   │   ├── quiz/
    │   │   │   ├── page.tsx     # Quiz landing (mode cards, quick start, subject grid)
    │   │   │   ├── quick-start-form.tsx
    │   │   │   └── [sessionId]/
    │   │   │       ├── page.tsx       # Quiz engine
    │   │   │       └── summary/page.tsx
    │   │   ├── review/
    │   │   │   ├── page.tsx     # Review (doomscroll) — loads ReviewFeed
    │   │   │   └── review-feed.tsx
    │   │   ├── sessions/
    │   │   │   ├── page.tsx     # Sessions list
    │   │   │   └── new/        # Session builder + templates
    │   │   ├── analytics/page.tsx
    │   │   ├── library/
    │   │   │   ├── page.tsx
    │   │   │   ├── bank/[bankId]/
    │   │   │   ├── subject/[subjectId]/
    │   │   │   └── marketplace/
    │   │   ├── 3d-lab/page.tsx
    │   │   ├── tutor/page.tsx
    │   │   ├── settings/
    │   │   │   ├── page.tsx
    │   │   │   ├── billing/
    │   │   │   └── developer/   # Admin feature-flag panel
    │   │   └── admin/page.tsx   # Admin dashboard
    │   │
    │   └── api/
    │       ├── ai/              # tutor, embed, generate-questions
    │       ├── payments/checkout/
    │       ├── webhooks/        # stripe, payrex
    │       └── admin/flags/
    │
    ├── components/
    │   ├── ui/                  # shadcn primitives (button, card, dialog, sheet, input, etc.)
    │   ├── quiz/                # AnswerResultStrip, ChoiceButton, QuizProgress, SessionSummary, FeedbackPanel, QuizTimer, etc.
    │   ├── analytics/           # DomainRadar, StreakCalendar, PerformanceChart
    │   ├── shared/              # Sidebar, Navbar, DashboardHeader, BottomNav, ExamProfileSwitcher, SetBreadcrumbs, ThemeToggle
    │   └── dev/                 # DemoShell, DevToolbar
    │
    ├── lib/
    │   ├── supabase/            # server, client, middleware, admin
    │   ├── context/             # breadcrumb-context, exam-profile-context
    │   ├── admin/               # feature-flags, get-admin-profile (getEffectiveTier, hasTierAccess)
    │   ├── ai/                  # prompts, provider
    │   ├── srs/                 # sm2, irt
    │   ├── payments/            # provider abstraction (Payrex/Stripe)
    │   ├── payrex/               # Payrex config
    │   ├── stripe/              # Stripe config
    │   ├── tracking/            # study-time
    │   ├── demo/                # Demo mode: config, mock data, mock Supabase client
    │   └── utils/
    │
    └── types/
        ├── app.ts               # Profile, ExamProfile, Subject, Question, Session, etc.
        └── supabase.ts          # Generated from Supabase (when used)
```

**Import paths:** `@/components/ui/`, `@/components/{feature}/`, `@/components/shared/`, `@/lib/`, `@/hooks/`, `@/types/`.

---

## Database

The **single source of truth** is `DATABASE_SCHEMA.sql` at the project root. It describes the full schema (extensions, enums, tables, RLS, materialized views, functions). Do not create tables or columns that are not defined there.

**Migrations** in `supabase/migrations/` are applied in order (001 through 012). They align with the canonical schema; when in doubt, refer to `DATABASE_SCHEMA.sql`.

**Main areas:**

- **User & auth:** `profiles` (extends Supabase auth), `board_exams`, `exam_profiles`, `subjects`, `topics`
- **Content:** `question_banks`, `questions` (rich: choices JSONB, explanation, references, fun_facts, mnemonics, 3D refs)
- **Review mode:** `review_mode_interactions`
- **Sessions:** `session_templates`, `review_sessions`, `session_questions`
- **SRS:** `srs_queue`
- **3D:** `three_d_models`, `model_callouts`
- **AI / docs:** `documents`, `document_chunks` (vector), `ai_conversations`
- **Commerce:** `marketplace_purchases`, `bank_ratings`
- **Analytics:** `study_time_logs`, `daily_user_stats`, `subject_mastery`, materialized view `question_user_performance`

**RLS:** Every table has Row Level Security. All tier and access checks in the app assume RLS is in place.

---

## Prerequisites

- **Node.js** ≥ 18.17 (LTS recommended)
- **npm** or **bun** (package manager)
- **(Optional)** Supabase project and API keys — the app can run in **Demo Mode** without them

---

## Environment Variables

Create `.env.local` (or copy from `.env.local.example` if present). Example:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...     # optional
AI_PROVIDER=openai               # openai | anthropic

# Payments
PAYMENT_PROVIDER=payrex          # payrex | stripe
PAYREX_SECRET_KEY=
PAYREX_WEBHOOK_SECRET=
NEXT_PUBLIC_PAYREX_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
STRIPE_MAX_PRICE_ID=

# Email / Analytics (optional)
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If `NEXT_PUBLIC_SUPABASE_URL` is unset, the app runs in **Demo Mode** (see below).

---

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Run in Demo Mode (no backend required)

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000). With no Supabase URL set, the app runs in **Demo Mode**:

- Auth is bypassed; you are treated as an admin user (e.g. Max tier).
- Data comes from mock Supabase in `src/lib/demo/`.
- Feature gates (3D, AI, SRS) are effectively unlocked.
- Dev Toolbar is available for tier and flag overrides.

Go to `/dashboard` to use the app.

### 3. Connect real services

- Set Supabase (and optionally AI, payments) env vars in `.env.local`.
- Apply migrations (e.g. run `DATABASE_SCHEMA.sql` or push `supabase/migrations/` with Supabase CLI).
- Ensure extensions: `uuid-ossp`, `vector`.
- Make yourself admin: `UPDATE profiles SET is_admin = TRUE WHERE email = 'your@email.com';`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (uses `scripts/dev.js`: Webpack on Windows, Turbopack elsewhere) |
| `npm run dev:turbo` | Force Turbopack |
| `npm run dev:webpack` | Force Webpack |
| `npm run build` | Production build |
| `npm run start` | Production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run type-check` | `tsc --noEmit` |

---

## Admin & Feature Flags

Users with `profiles.is_admin = TRUE` can use:

- **Developer Settings** at `/dashboard/settings/developer` — tier spoofing (Free/Pro/Max) and toggles for 3D, AI, and SRS gates.
- **Dev Toolbar** (bottom-right on dashboard) — same overrides in a compact panel.

Flags are stored in a **cookie** (`cerebro_dev_flags`). They are read in the dashboard layout by `getFeatureFlags()` and combined with `getEffectiveTier(actualTier, isAdmin, flags)` and `hasTierAccess()`. Admins without a spoofed tier get Max access by default. No flags are written to the database.

---

## Quiz & Review UX

- **Quiz:** Single column, max-width 720px; full-width choice cards (min 48px height, 12px gap). After answering: explanation, references, fun facts, related topics, 3D link. Keyboard: 1–4 for options, Enter for next, Esc to exit. Header shows “Quiz mode” and an exit (X) button with confirmation; exit redirects to dashboard.
- **Review:** One question per screen, infinite scroll; subject filter; Check Answer + Next Question (both visible; enabled/disabled by state). Header shows “Review mode” and the same exit (X) with confirmation.
- **Breadcrumbs:** On quiz/review landing pages the header shows the page name (“Quiz”, “Review”). When inside a quiz session or on the review feed it shows “Quiz mode” / “Review mode” instead of path-based breadcrumbs.

---

## Deploying (e.g. Vercel)

- Set all required env vars in the host (including `NEXT_PUBLIC_APP_URL` for production).
- Configure webhooks: Stripe `.../api/webhooks/stripe`, Payrex `.../api/webhooks/payrex`.

---

## Troubleshooting

- **`payrex-node` or `pdf-parse` not found** — They are in `serverExternalPackages` in `next.config.ts`. Ensure they are installed (`npm install`).
- **Supabase errors** — Verify `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env.local`. Service role key must stay server-side only.
- **TypeScript / build errors** — Run `npm run type-check`. After dependency updates, try `rm -rf node_modules .next && npm install && npm run build`.

---

## Key Conventions (from .cursorrules)

- No `localStorage` for auth.
- No `useEffect` for data fetching.
- No hardcoded hex colors; use CSS variables.
- No tables/columns outside `DATABASE_SCHEMA.sql`.
- No analytics shown in Review Mode.
- No spinner loading; use skeletons.
- No bouncy/spring animations; 150ms ease only.
- No `console.log` in production code; use proper error handling.
