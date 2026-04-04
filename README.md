# SlateCamp

A high-performance, discipline-agnostic study engine for professional licensure exams. SlateCamp delivers signal-rich practice, IRT-based adaptive mastery tracking, and a warm "Campfire" design system — no generic gamification, no badges, no confetti.

## Overview

SlateCamp is built around a **4-portal architecture**:

| Portal | Route | Purpose |
|--------|-------|---------|
| **Dashboard** | `/dashboard` | Student-facing learning experience — wiki, testing (7 modes), analytics, notes, 3D Lab, Camp Trails |
| **Admin** | `/admin` | Content management — articles, questions, taxonomy, publishing pipeline, SME review |
| **CEO** | `/ceo` | Business analytics — MRR/ARR, financials, behavioral insights, team management |
| **Developer** | `/developer` | Internal docs — design system catalog, API reference, architecture docs, dev tools |

### Core Principles

- **Pedagogy-first**: IRT 2-parameter logistic model for all mastery calculations, SM-2 spaced repetition, anti-inflation readiness scoring
- **No gamification**: Progression mapped to Readiness Score, Taxonomy Heatmap, and Pacing Gauge
- **Campfire aesthetic**: Warm, research-backed design system with Camp Cobalt, Camp Orange, Emerald, and Surface Light tokens
- **Reliability**: Persistent state with 10-second autosave, localStorage fallback, and offline reconnection queue

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React + React DOM | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS 4 (CSS-first) | 4.2.2 |
| UI Primitives | shadcn/ui + @base-ui/react | 4.1.0 / 0.9.5 |
| State | Zustand | 5.0.12 |
| Database | Supabase (PostgreSQL) | 2.100.0 |
| Auth | Supabase SSR | 0.9.0 |
| 3D/Spatial | React Three Fiber + Three.js | R3F 9.5.0 / Three 0.183.2 |
| Animation | Framer Motion | 12.38.0 |
| Rich Text | TipTap (13 extensions) | 3.20.4 |
| Charts | Recharts | 3.8.0 |
| AI Tutor | Anthropic SDK | 0.78.0 |
| Payments | Stripe + PayRex | 20.4.1 / 1.7.3 |
| Icons | Lucide + Phosphor | 0.577.0 / 2.1.10 |
| Package Manager | Bun | — |
| Deployment | Vercel | 2 cron jobs |

## Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in the 19 required env vars (6 `NEXT_PUBLIC_*`, 11 server-only secrets, 2 config flags). See `.env.example` for documentation.

3. **Run the development server**

   ```bash
   bun dev
   ```

4. Open `http://localhost:3000` in your browser.

## Project Structure

```
├── src/                    # All application source code
│   ├── app/                # Next.js App Router pages (105 pages across 4 portals)
│   ├── components/         # React components (~692 .tsx files)
│   ├── lib/                # Server actions (56 files), queries, utilities, SRS/IRT engine
│   ├── stores/             # Zustand stores (5 stores)
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── supabase/               # Database migrations (38) and seed SQL scripts
├── scripts/                # Dev tooling — custom dev server, DB inspection, seeding
├── public/                 # Static assets — icons, OG images, widget modules
├── prompts/                # Archived PRDs, specs, and implementation guides
└── docs/                   # Planning documents and specs
```

## Key Features

### Learning Engine
- **7 Testing Modes**: Camp (untimed, immediate feedback), Storm (timed, deferred), Chill (relaxed, skip-friendly), Focus Review (weakest nodes), Custom, Simulation (full exam), Endurance
- **IRT 2PL Adaptive Mastery**: `P(θ) = 1 / (1 + exp(-a * (θ - b)))` — Newton-Raphson theta updates
- **Anti-Inflation Readiness Score**: 6-vector system with streak diminishing returns, difficulty ceiling, grey penalty, Bloom ceiling, depth weight, recency decay
- **SM-2 Spaced Repetition**: Quality derivation from correctness, time, confidence, and lucky-guess signals
- **Blindspot Queue**: Targets 3 weakest nodes + unexplored grey nodes (28 unit tests)

### Content System
- **Wiki Browser**: Taxonomy-mapped articles with embedded interactive widgets, citations, and 3D models
- **3D Lab**: React Three Fiber spatial learning with `frameloop="demand"` zero-waste GPU rendering
- **Camp Trails**: Structured daily study prescriptions
- **AI Tutor**: Anthropic-powered contextual explanations (Temperature 0.0, citation-required)

### Admin & Analytics
- **Full CMS**: Article/question CRUD, taxonomy editor, coverage map, unified content editor, publishing pipeline
- **CEO Dashboard**: MRR/ARR tracking, P&L, runway, cohort analysis, churn prediction
- **Analytics**: 8 visualization types with exemplary Suspense architecture (8 independent boundaries)
- **SME Review Queue**: Subject matter expert content review workflow

## Database

- **51 tables** with Row Level Security (50/51 with RLS)
- **89+ RLS policies**
- **38 migrations**
- Authoritative schema documented in `DATABASE_SCHEMA.sql`

## Verification Commands

```bash
bun run lint          # ESLint checks
bun run type-check    # TypeScript strict mode
bun run build         # Full production build
```

## Project Guidance & Conventions

- **System prompt & design system**: See `CLAUDE.md` for the Campfire design system, voice guide, and absolute constraints
- **Architecture & Ecosystem Audit**: See `.sisyphus/notepads/system-architecture/` for the definitive breakdown of the 4-portal structure, state management, and data models.
- **Local Dev & Crawler Strategy**: See `docs/proposals/DEV-MODE-CRAWLER-AUTH-STRATEGY.md` for instructions on using `DEV_FORCE_USER_ID` to seamlessly authenticate solo founders and headless crawler agents locally.
- **Database schema**: See `DATABASE_SCHEMA.sql` before any DB work — never hallucinate tables or foreign keys
- **Agent configuration**: See `AGENTS.md` for AI agent working conventions

Anyone contributing to SlateCamp should read `CLAUDE.md` first to understand the intent behind the implementation details.