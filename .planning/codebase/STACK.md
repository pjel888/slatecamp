# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase (React components, API routes, server actions, utilities)
- JSX/TSX - React component markup

**Secondary:**
- SQL - Database migrations and schema definitions (`DATABASE_SCHEMA.sql`, `supabase/migrations/`)
- CSS - Tailwind utility classes (Tailwind CSS 4.2.1)

## Runtime

**Environment:**
- Node.js (via Next.js App Router)
- Next.js 16.1.6 (React 19.2.4, React DOM 19.2.4)

**Package Manager:**
- Bun (development and build tool)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
  - Uses `/app` directory structure for pages and API routes
  - Server Components and Server Actions as default
  - `next dev` or `next dev --turbopack` for development
  - `next build` and `next start` for production

**UI & Styling:**
- React 19.2.4 - Component library
- Tailwind CSS 4.2.1 - Utility-first CSS framework with PostCSS integration
- shadcn/ui 0.9.5 - High-quality React component collection (based on @base-ui/react)
- @base-ui/react 1.2.0 - Headless UI primitives
- Tailwind Typography plugin 0.5.19 - Rich text styling for prose content
- Class Variance Authority 0.7.1 - CSS-in-JS variant composition
- TailwindCSS PostCSS 4.2.1 - CSS processing

**3D & Spatial:**
- Three.js 0.183.2 - 3D graphics library
- React Three Fiber 9.5.0 (R3F) - React renderer for Three.js
- @react-three/drei 10.7.7 - Helpers and abstractions for R3F
- three-stdlib 2.36.1 - Standard library extensions for Three.js
- Camera Controls 3.1.2 - Advanced camera manipulation for 3D scenes
- @shadergradient/react 2.4.20 - Shader-based gradient backgrounds

**Rich Text & Content:**
- TipTap 3.20.1 - Headless rich text editor
  - Extensions: bubble-menu, highlight, horizontal-rule, image, placeholder, task-item/list, text-style, typography, underline
  - Markdown and ProseMirror integration
- Next MDX Remote 6.0.0 - MDX rendering for server-side markdown
- React Markdown 10.1.0 - Markdown to JSX converter
- Marked 17.0.4 - Markdown parser
- Turndown 7.2.2 - HTML to Markdown converter
- Remark plugins: gfm (GitHub Flavored Markdown), math support
- Rehype plugins: KaTeX rendering
- KaTeX 0.16.37 - Mathematical typesetting

**Form & UI Components:**
- cmdk 1.1.1 - Command/search component
- react-day-picker 9.14.0 - Calendar picker
- react-resizable-panels 4.7.3 - Resizable panel layouts
- Rough Notation 0.5.1 - SVG annotation/highlighting library
- Recharts 3.8.0 - React charting library
- Framer Motion 12.35.2 - Animation library (but transitions capped at 300ms per style guide)
- nextjs-toploader 3.9.17 - Top navigation progress indicator

**Testing:**
- No test framework detected in dependencies (no Jest, Vitest, etc.)

**Build/Dev:**
- Turbopack support (via `--turbopack` flag) - Fast JavaScript bundler
- ESLint 9.39.4 with Next.js config - Code linting
  - eslint-config-next 16.1.6 - Next.js-specific ESLint rules
- TypeScript 5.9.3 - Type checking (`tsc --noEmit`)

## Key Dependencies

**Critical (Business Logic):**
- @anthropic-ai/sdk 0.78.0 - Claude AI tutor integration for pedagogical explanations
- stripe 20.4.1 - Stripe payment processing API client
- @stripe/stripe-js 8.9.0 - Client-side Stripe integration
- payrex-node 1.7.3 - PayRex payment gateway for PHP-denominated transactions (alternative to Stripe)

**Infrastructure:**
- @supabase/supabase-js 2.98.0 - PostgreSQL database client (core backend)
- @supabase/ssr 0.9.0 - Server-side rendering helpers for Supabase auth
- supabase 2.78.1 - Supabase CLI and management tools
- zod 4.3.6 - Schema validation and type inference
- zustand 5.0.12 - Lightweight state management

**Content & Utilities:**
- date-fns 4.1.0 - Date manipulation utilities
- lucide-react 0.577.0 - Icon library
- @phosphor-icons/react 2.1.10 - Alternative icon set (phosphor icons)
- clsx 2.1.1 - Conditional className composition
- tailwind-merge 3.5.0 - Merge Tailwind classes intelligently
- isomorphic-dompurify 3.1.0 - HTML sanitization (works in browser and server)
- dompurify 3.2.0 - Safe HTML parsing
- html2canvas 1.4.1 - Screenshot/canvas rendering
- papaparse 5.5.3 - CSV/TSV parser
- pdf-parse 2.4.5 - PDF text extraction

**Development Utilities:**
- next-devtools-mcp 0.3.10 - Development tools via Model Context Protocol
- next-themes 0.4.6 - Dark mode and theme management
- Geist 1.7.0 - Font and design system (Vercel's design system)

## Configuration

**Environment:**
- Environment variables required:
  - **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - **Anthropic:** `ANTHROPIC_API_KEY`
  - **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CAMP_PRICE_ID`, `STRIPE_INSURANCE_PRICE_ID`, `STRIPE_INSTITUTIONAL_PRICE_ID`
  - **PayRex:** `PAYREX_SECRET_KEY`, `PAYREX_WEBHOOK_SECRET`
  - **Cron Jobs:** `CRON_SECRET`
  - **Demo Mode:** `NEXT_PUBLIC_DEMO_MODE` (feature flag)
  - **AI Provider:** `AI_PROVIDER` (defaults to "openai", can be set to "anthropic")

**Build:**
- `next.config.ts` - Next.js configuration
  - Remote image domains: `*.supabase.co`, `lh3.googleusercontent.com`
  - Server actions body size limit: 50MB
  - Turbopack experimental support
- `tsconfig.json` - TypeScript compiler options
  - Path alias: `@/*` → `./src/*`
  - Strict mode disabled (ES2017 target, loose null/any checks)
- `tailwind.config.ts` - Tailwind CSS configuration with content globs
- `postcss.config.mjs` - PostCSS plugins (Tailwind CSS PostCSS)
- `eslint.config.mjs` - ESLint configuration (Next.js core web vitals + TypeScript)
- `components.json` - shadcn/ui CLI configuration
- `.env.local` - Local environment variables (not committed)
- `vercel.json` - Vercel-specific deployment configuration and cron job schedules

## Platform Requirements

**Development:**
- Node.js (LTS recommended)
- Bun package manager
- TypeScript 5.9.3+ for type checking
- Git for version control
- Vercel CLI (optional, for deployment preview)

**Production:**
- Deployment target: Vercel (Next.js optimized)
  - Runs on Node.js runtime
  - Supports Serverless Functions (API routes)
  - Serverless cron jobs for scheduled tasks
- Supabase PostgreSQL instance (external database)
- Stripe API access (payment processing)
- PayRex API access (alternative payment gateway)
- Anthropic Claude API access (AI tutor)

**Browser Requirements:**
- Modern browsers supporting ES2017+ JavaScript
- WebGL for 3D Lab visualization (Three.js)
- Web Workers for compute-heavy tasks

---

*Stack analysis: 2026-03-19*
