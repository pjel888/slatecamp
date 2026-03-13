# SlateCamp — Project Structure

This document maps the physical file structure of the SlateCamp repository to its functional domains and features.

## ══════ SOURCE ROOT: `src/` ══════

### 1. `app/` — Next.js App Router (Routing & Layouts)
The `app` directory follows a two-zone pattern: public marketing/auth and the authenticated `/dashboard`.

*   `layout.tsx`: Root layout (providers, theme, fonts).
*   `page.tsx`: Marketing landing page.
*   `(auth)/`: Route group for `login`, `signup`, and `onboarding`.
*   `about/`, `contact/`, `pricing/`: Static marketing pages.
*   `api/`: Edge functions, Stripe/PayRex webhooks, and AI endpoints.
*   `auth/`: Supabase OAuth and magic link callbacks.
*   **`dashboard/`**: The core authenticated application shell.
    *   `layout.tsx`: Sidebar navigation and auth-gate.
    *   `page.tsx`: Overview, Readiness Score, and Daily Missions.
    *   `3d-lab/`: Feature 4 — Interactive 3D Lab.
    *   `analytics/`: Feature 6 — Performance Heatmap & Node Inspector.
    *   `notes/`: Feature 3 — Personal Notes Workspace.
    *   `testing/`: Feature 2 — Quizzing Engine (Camp & Storm modes).
    *   `wiki/`: Feature 1 — Taxonomy-Mapped Knowledge Base.

### 2. `components/` — Feature-Domain Component Library
Components are organized by feature domain rather than generic type.

*   `ui/`: shadcn/ui primitives (Button, Input, Dialog, Card).
*   `shared/`: Cross-feature utilities (Modals, Tooltips, Loaders).
*   `layouts/`: App shell components (Sidebar, Header, Nav).
*   `marketing/`: Landing page sections (Hero, Features, Pricing).
*   `auth/`: Login forms, Signup flows, Onboarding wizard.
*   `wiki/`: Article renderer, ToC, Breadcrumbs, Zen Mode.
*   `quiz/`: Question cards, Option selectors, Timer, Rationale blocks.
*   `notes/`: TipTap editor instance, Capture blocks, Cheat sheet builder.
*   `3d/`: R3F Canvas, Parametric sliders, Camera controls, Model viewers.
*   `dashboard/`: Heatmap visualization, Recharts graphs, Node inspector.
*   `dev/`: Developer tools and debug panels.

### 3. `lib/` — Shared Logic & Utilities
*   `supabase/`: Client/Server Supabase configurations.
*   `actions/`: Next.js Server Actions for mutations (quiz submission, note save).
*   `ai/`: RAG pipeline, Embedding generation, Provider abstractions.
*   `srs/`: Spaced Repetition (SM2) algorithms and scheduling.
*   `utils/`: `cn()` utility, date formatting, math helpers.
*   `hooks/`: Custom React hooks (useQuiz, use3DControls).
*   `validations/`: Zod schemas for forms and API payloads.
*   `constants/`: App-wide constants (routes, pricing tiers, enums).

### 4. `types/` — TypeScript Definitions
*   `app.ts`: Global application types.
*   `database.ts`: Auto-generated Supabase types.
*   `payrex-node.d.ts`: Type definitions for local payment processor.

---

## ══════ CONFIGURATION & TOOLING ══════

*   `CLAUDE.md`: Core system prompt, identity, and routing protocol.
*   `DATABASE_SCHEMA.sql`: Single source of truth for the Supabase/Postgres schema.
*   `bun.lock`: Bun lockfile (Primary package manager).
*   `tailwind.config.ts`: Tailwind v4 configuration.
*   `tsconfig.json`: Strict TypeScript configuration.
*   `components.json`: shadcn/ui registry config.
*   `scripts/dev.js`: Custom dev server launcher (handles Windows/Webpack vs. Turbo).

## ══════ ASSETS: `public/` ══════
*   `models/`: Draco-compressed `.glb` files for the 3D Lab.
*   `fonts/`: Self-hosted Inter and JetBrains Mono.
*   `images/`: Static marketing assets and UI icons.

## ══════ PLANNING & DOCS: `.claude/` ══════
*   `agents/`: Persona definitions (Respected Mentor, DB Architect).
*   `docs/`: PRDs, Architectural Blueprints, and GTM strategy.
*   `skills/`: Custom AI skills for codebase manipulation.
