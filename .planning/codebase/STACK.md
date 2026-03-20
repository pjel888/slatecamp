# Technology Stack

## Language & Runtime

- **Language:** TypeScript (strict: false, noImplicitAny: false)
- **Runtime:** Node.js (via Next.js server)
- **Package Manager:** Bun (used for scripts, seeding; npm/bun for deps)
- **Target:** ES2017

## Framework

- **Next.js 16.1.6** — App Router, React 19.2.4
- **Turbopack** — Default bundler (`next dev --turbopack`), Webpack fallback available
- **React 19** — Server Components default, Client Components via `'use client'`
- **Server Actions** — 47 files with `'use server'` directive

## Styling

- **Tailwind CSS 4.2.1** — PostCSS pipeline (`@tailwindcss/postcss`)
- **tailwind-merge + clsx** — `cn()` utility in `src/lib/utils.ts`
- **tw-animate-css** — Animation utilities
- **class-variance-authority** — Variant-based component styling
- **Framer Motion 12.35** — Structural animations

## UI Components

- **shadcn/ui** — 30+ components in `src/components/ui/`
- **Radix UI** — Toast, VisuallyHidden primitives
- **@base-ui/react** — Additional UI primitives
- **cmdk** — Command palette
- **react-resizable-panels** — Panel layouts
- **react-day-picker** — Calendar/date picker
- **Phosphor Icons** — Primary icon library
- **Lucide React** — Secondary icon library

## Data & Backend

- **Supabase** — PostgreSQL database, Auth, Storage
  - `@supabase/ssr` — Server/client cookie-based auth
  - `@supabase/supabase-js` — Admin client (service role)
- **Zod 4.3** — Schema validation

## AI & ML

- **@anthropic-ai/sdk 0.78** — Claude API (direct SDK, not AI SDK)
- **OpenAI** — GPT-4o completions, text-embedding-3-small (raw fetch, no SDK)
- **Custom AI Provider abstraction** — `src/lib/ai/provider.ts`

## Payments

- **Stripe** — `stripe` + `@stripe/stripe-js` for international payments
- **PayRex** — `payrex-node` for Philippines-specific payments

## Content & Rich Text

- **TipTap** — Rich text editor (12 extensions: highlight, image, task lists, typography, etc.)
- **Markdown:** `marked`, `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`
- **next-mdx-remote** — MDX content rendering
- **DOMPurify** — HTML sanitization
- **Turndown** — HTML to Markdown conversion
- **KaTeX** — Math rendering

## 3D & Visualization

- **Three.js 0.183** — 3D rendering
- **React Three Fiber 9.5** — React Three.js bindings
- **@react-three/drei** — Three.js helpers
- **@shadergradient/react** — Shader gradient effects
- **camera-controls** — 3D camera manipulation
- **Recharts 3.8** — Data visualization charts
- **rough-notation** — Annotation effects

## Fonts

- **Inter** — Primary UI font (via next/font/google)
- **Syne** — Display/heading font
- **DM Mono** — Monospace font
- **Geist Sans** — Imported but Inter is primary

## Dev Tools

- **ESLint 9** + eslint-config-next
- **TypeScript 5.9**
- **next-devtools-mcp** — Next.js DevTools MCP integration
- **Bun test runner** — Unit tests via `bun:test`

## Configuration Files

- `next.config.ts` — Image remotes (Supabase, Google), 50MB server action body limit, Turbopack root
- `tsconfig.json` — Path alias `@/*` → `./src/*`, bundler resolution
- `tailwind.config.ts` — Tailwind customization
- `postcss.config.mjs` — PostCSS with Tailwind plugin
