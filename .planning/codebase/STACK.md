# Project Cerebro — Technology Stack

## Core Framework
- **Next.js 16** (App Router) — Turbopack-enabled dev, webpack alternative available
- **React 19** — Latest features with strict mode
- **TypeScript 5.9** — Strict mode enforced (`strict: true`)

## Styling
- **Tailwind CSS 4** — PostCSS v4 plugin, utility-first approach
- **shadcn/ui 4.x** — Base UI primitives (@base-ui/react)
- **Lucide React** — Icon library
- **Geist/Geist Mono** — Google Fonts (Next.js default)

## Database & ORM
- **Supabase** (PostgreSQL) — Primary backend with RLS enabled
- **pgvector** — Vector embeddings for RAG (1536-dim cosine similarity)
- Direct SQL queries via `@supabase/supabase-js`

## State Management
- **Cookie-based Supabase sessions** (`@supabase/ssr`)
- **No Redux/Zustand** — Leveraging React Server Components + props drilling where needed
- **JSONB** for Tiptap notes content (rich text)

## Build & Tooling
- **Jest/Vitest** — Unit tests
- **Playwright** — E2E testing (`npm run test:e2e`)
- **ESLint 9.x** — Next.js config, TypeScript strict
- **Prettier** — Implicit via ESLint

---

## Third-Party Integrations

### Payments
- **Stripe v20.4** — Subscription management, one-off purchases
- **Payrex-Node** — (Additional payment processor?)
- **@stripe/stripe-js** — Client-side Stripe elements

### Analytics
- **PostHog** — Product analytics (opt-in, Review Mode excluded)
- Tracking scopes: Sessions mode only (not Review Mode)

### AI/ML
- **OpenAI-compatible API** — Provider abstraction (`src/lib/ai/provider.ts`)
- **Embeddings** — pgvector for semantic search
- **RAG system** — Document chunking + vector similarity

### Content & Editing
- **Tiptap v3.20** — Rich text editor (bubble menus, extensions)
- **Marked v17** — MD to HTML
- **Recharts v3.8** — Analytics charts
- **@react-three/fiber 9.x** — React 3D renderer
- **@react-three/drei** — 3D primitives, helpers

### Utilities
- **date-fns 4.1** — Date formatting
- **clsx 2.1** — Conditional class building
- **cmdk 1.1** — Command palette (Command+K)
- **tw-animate-css 1.4** — Tailwind animation utilities

---

## Dev Dependencies Summary
```json
{
  "eslint": "^9.39.4",
  "tailwindcss": "^4.2.1",
  "@types/node": "^25.3.5",
  "typescript": "^5.9.3",
  "@tailwindcss/postcss": "^4.2.1"
}
```
