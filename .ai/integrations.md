# Integrations

**Last Updated:** 2026-04-27

This document catalogs external services and libraries that materially affect SlateCamp's behavior.

## Data & Auth

### Supabase
- **Package:** `@supabase/supabase-js`, `@supabase/ssr`
- **Usage:** Primary database, auth, storage, and realtime
- **Config:** `src/lib/supabase/server.ts`, `client.ts`, `admin.ts`, `middleware.ts`
- **Env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Notes:** RLS extensively used. SSR package manages cookie-based sessions in Next.js App Router.

## Payments

### PayRex
- **Package:** `payrex-node` (externalized in `next.config.ts`)
- **Usage:** Primary Philippines payment gateway (GCash, Maya, card, QR Ph)
- **Config:** `src/lib/payrex/config.ts`
- **Routes:** `api/payments/checkout`, `api/webhooks/payrex`
- **Env:** `PAYREX_SECRET_KEY`, `PAYREX_WEBHOOK_SECRET`
- **Status:** Implemented and functional

### LemonSqueezy
- **Package:** `@lemonsqueezy/lemonsqueezy.js` (in `package.json` but **SDK stubbed**)
- **Usage:** Alternative payment gateway
- **Config:** `src/lib/lemonsqueezy/config.ts` — returns `null` with console warning
- **Routes:** `api/webhooks/lemonsqueezy`
- **Env:** `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `LEMONSQUEEZY_*_VARIANT_ID`
- **Status:** Webhook handler exists but checkout SDK path is stubbed

### Stripe
- **Package:** None installed
- **Usage:** Referenced in `.env.local` only
- **Env:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_MAX_PRICE_ID`
- **Status:** **Unimplemented** — no code usage found

## AI

### OpenAI
- **Package:** `openai` (in `package.json`)
- **Usage:** GPT-4o completions, `text-embedding-3-small` embeddings
- **Config:** `src/lib/ai/provider.ts`
- **Routes:** `api/ai/*`, content scripts
- **Env:** `OPENAI_API_KEY`
- **Status:** Implemented (direct fetch, no SDK wrapper for completions)

### Anthropic
- **Package:** `@anthropic-ai/sdk` (in `package.json`)
- **Usage:** Claude Sonnet completions, teach-back evaluation
- **Config:** `src/lib/ai/provider.ts`, `src/lib/actions/teach-back.ts`
- **Env:** `ANTHROPIC_API_KEY`
- **Status:** Implemented (direct fetch for teach-back; SDK present but may not be primary path)

## Analytics

### Internal Analytics
- **Usage:** Structured event logging to `analytics_events` table
- **Config:** `src/lib/logging/server.ts`, `edge.ts`
- **Status:** Implemented

### PostHog
- **Package:** None installed
- **Usage:** Referenced in `.env.local` only
- **Env:** `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- **Status:** **Unimplemented** — no code usage found

## Email

### Resend
- **Package:** None installed
- **Usage:** Referenced in `.env.local` only
- **Env:** `RESEND_API_KEY`
- **Status:** **Unimplemented** — no code usage found

## Google Cloud
- **Usage:** Referenced in `.env.local` only
- **Env:** `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`
- **Status:** **Unimplemented** — no code usage found

## UI & Visualization

### React Three Fiber / Three.js
- **Packages:** `@react-three/fiber`, `@react-three/drei`, `three`
- **Usage:** 3D Lab interactive visualization
- **Config:** `src/features/3d-lab/`, `src/components/r3f/`
- **Status:** Implemented (flagship feature)

### Framer Motion
- **Package:** `framer-motion`
- **Usage:** Animations across the app
- **Status:** Implemented

### Recharts
- **Package:** `recharts`
- **Usage:** Analytics dashboards and data visualization
- **Status:** Implemented

### TipTap
- **Packages:** `@tiptap/*` (starter-kit, extensions)
- **Usage:** Rich text editing (notes, admin content editor)
- **Status:** Implemented

### Mermaid
- **Package:** `mermaid`
- **Usage:** Diagram rendering (likely in wiki or developer docs)
- **Status:** Implemented

### CodeMirror
- **Packages:** `@uiw/react-codemirror`, `@codemirror/*`
- **Usage:** Code/markdown editing surfaces
- **Status:** Implemented

## Build & Dev Tooling

### Storybook
- **Package:** `storybook` (v8.6.17, Vite-based)
- **Usage:** Component documentation and visual testing
- **Config:** `.storybook/main.ts`, `.storybook/preview.ts`
- **Status:** Implemented with governance check (`check:storybook`)

### ESLint
- **Package:** `eslint`, `eslint-config-next`
- **Config:** `eslint.config.mjs`
- **Status:** Implemented (React Hooks rules mostly disabled)

### TypeScript
- **Package:** `typescript`
- **Config:** `tsconfig.json`
- **Status:** Implemented (`strict: false`)

### Bun
- **Usage:** Package manager, script runner, test runner
- **Status:** Primary runtime contract

## Deployment

### Vercel
- **Usage:** Hosting platform (inferred from `vercel.json`, cron config)
- **Status:** Inferred deployment target

## Evidence

- `package.json` dependencies and devDependencies
- `src/lib/payments/provider.ts`
- `src/lib/payrex/config.ts`
- `src/lib/lemonsqueezy/config.ts`
- `src/lib/ai/provider.ts`
- `src/app/api/webhooks/*/route.ts`
- `src/app/api/payments/checkout/route.ts`
- `next.config.ts`
- `.env.local`
