# CLAUDE.md — Project Cerebro

## What is this project?
Cerebro is an AI-adaptive board exam prep platform. Architecture students first, multi-profession by design. Think "second brain for board exam takers." Three learning modes: Review (doomscroll), Sessions (tracked quizzes), and 3D Library (visual learning).

## Build & Run
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript strict check
npx supabase gen types typescript --project-id $PROJECT_ID > types/supabase.ts  # Regen DB types
```

## Tech Stack
- Next.js 15 (App Router), TypeScript strict, Supabase, Tailwind CSS 4, shadcn/ui
- React Three Fiber for 3D, Stripe for payments, PostHog for analytics
- Auth: `@supabase/ssr` with cookie-based sessions. NEVER localStorage.

## Key Architecture Decisions
- Server Components by default. `'use client'` only when required.
- Server Actions for ALL mutations. No client-side Supabase writes.
- RLS enabled on every table. Check policies before shipping.
- Everything scoped by `exam_profile_id` (user's active board exam context).
- Three modes: Review Mode (no user-facing analytics), Sessions Mode (full tracking), 3D Library.
- Questions have rich content: explanation, references[], fun_facts[], mnemonics, image_urls.

## Database
- Schema: `DATABASE_SCHEMA.sql` at project root. This is the source of truth.
- Never add columns or tables not defined there.
- Materialized view `question_user_performance` tracks per-question lifetime stats.

## Design
- "Rams Standard" — Braun/Dieter Rams inspired. Achromatic + functional accents.
- Primary CTA: `#ED8008` (amber). Correct: `#4A7C59`. Incorrect: `#BF1B1B`.
- No gradients, no heavy shadows, no bouncy animations. 150ms transitions.
- Quiz UI is THE most important screen. 720px max-width, immersive, mobile-first.

## File Structure
```
src/app/(auth)/          # Login, register, onboarding
src/app/(dashboard)/     # Protected routes (dashboard, quiz, analytics, 3d-lab, settings)
src/components/ui/       # shadcn primitives
src/components/{feature}/ # quiz, analytics, 3d, dashboard, shared
src/lib/supabase/        # client.ts, server.ts, admin.ts, middleware.ts
src/lib/ai/              # provider.ts, embeddings.ts, rag.ts, prompts.ts
src/lib/srs/             # sm2.ts, irt.ts
src/lib/stripe/          # config.ts, webhooks.ts
```

## Testing
```bash
npm run test             # Jest unit tests
npm run test:e2e         # Playwright E2E
```

## Common Mistakes to Avoid
- Don't use `useEffect` for data fetching — use RSC async
- Don't hardcode colors — use CSS variables from globals.css
- Don't show analytics in Review Mode — it's intentionally stress-free
- Don't create DB columns not in DATABASE_SCHEMA.sql
- Don't use `any` — fix the type properly
