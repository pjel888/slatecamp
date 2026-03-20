# Directory Structure

## Top Level

```
slate-camp/
├── .claude/               # Claude Code agents, docs, skills
│   ├── agents/            # Agent personas (db-architect, quiz-engineer, etc.)
│   ├── docs/              # PRDs and blueprints
│   └── skills/            # Coding constraints and patterns
├── .planning/             # GSD planning artifacts
│   ├── codebase/          # This directory — codebase analysis
│   ├── phases/            # Phase plans (phase-1 through phase-4)
│   ├── PROJECT.md         # Project definition
│   ├── REQUIREMENTS.md    # Requirements
│   ├── ROADMAP.md         # Phase roadmap
│   └── STATE.md           # Current state
├── public/                # Static assets
├── scripts/               # Dev scripts (dev.js, seed.ts)
├── src/                   # Application source
├── DATABASE_SCHEMA.sql    # Full database schema reference
├── CLAUDE.md              # Claude Code system prompt
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies (project-cerebro)
```

## Source Tree (`src/`)

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth route group
│   │   ├── login/              # Login page + form
│   │   ├── register/           # Registration page + form
│   │   ├── forgot-password/    # Password reset
│   │   └── onboarding/         # New user onboarding
│   ├── about/                  # Public about page
│   ├── admin/                  # Admin portal (role-gated)
│   │   ├── assets/             # Asset management
│   │   ├── audit/              # Audit log
│   │   ├── dashboard/          # Admin dashboard
│   │   ├── questions/          # Question CRUD + import
│   │   ├── reviews/            # Content reviews
│   │   ├── taxonomy/           # Taxonomy management
│   │   └── wiki/               # Wiki admin
│   ├── api/                    # API route handlers
│   │   ├── ai/                 # AI endpoints (tutor, study-agent, generate, embed)
│   │   ├── cron/               # Cron jobs (blindspot-scan, compute-signals)
│   │   ├── payments/           # Checkout
│   │   ├── pdf/                # PDF processing
│   │   └── webhooks/           # Stripe, PayRex webhooks
│   ├── auth/                   # Auth callback
│   ├── contact/                # Contact page
│   ├── dashboard/              # Main user dashboard
│   │   ├── 3d-lab/             # 3D Lab workspace
│   │   ├── analytics/          # User analytics
│   │   ├── developer/          # Dev tools (feature-gated)
│   │   ├── exam-outcome/       # Exam outcome survey
│   │   ├── focus-review/       # Focus review (blindspot)
│   │   ├── notes/              # Note-taking
│   │   ├── proof-simulation/   # Full exam simulation
│   │   ├── score-reveal/       # Readiness score reveal
│   │   ├── settings/           # Account settings
│   │   ├── testing/            # Quiz/testing interface
│   │   ├── trails/             # Study trails
│   │   ├── upgrade/            # Upgrade to Pro
│   │   ├── welcome-pro/        # Pro welcome
│   │   └── wiki/               # Knowledge wiki
│   ├── pricing/                # Pricing page
│   ├── try/                    # Demo/try page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
│
├── components/                 # React components
│   ├── 3d/                     # Three.js/R3F components
│   ├── admin/                  # Admin UI components
│   ├── analytics/              # Analytics display components
│   ├── assessment/             # Assessment UI
│   ├── auth/                   # Auth form components
│   ├── dashboard/              # Dashboard widgets, cards, quiz renderer
│   ├── dev/                    # Dev tools (demo shell, badges)
│   ├── developer/              # Developer console components
│   ├── graphics/               # Visual effects (noise, gradients)
│   ├── interactive-illustrations/ # Learning illustrations
│   ├── landing/                # Landing page sections
│   ├── layouts/                # Layout components (sidebar, nav)
│   ├── marketing/              # Marketing components
│   ├── motion/                 # Animation components
│   ├── notes/                  # Note editor components
│   ├── quiz/                   # Quiz interface components
│   ├── settings/               # Settings components
│   ├── shared/                 # Shared utilities (ThemeProvider, etc.)
│   ├── trails/                 # Study trail components
│   ├── ui/                     # shadcn/ui primitives (30+ components)
│   └── wiki/                   # Wiki reader/editor components
│
├── config/                     # App configuration
│   └── feature-flags.ts        # Feature flag definitions
│
├── data/                       # Static data
│   ├── mock-questions.json     # Test data
│   └── seed/                   # Database seed data
│
├── hooks/                      # Custom React hooks
│   └── quiz/                   # Quiz-specific hooks (state, timer, telemetry, persistence)
│
├── lib/                        # Server/shared libraries
│   ├── actions/                # Server Actions (46+ files, 7K LOC)
│   │   ├── admin/              # Admin actions (questions, wiki)
│   │   └── dev/                # Dev actions (test-data, db-viewer)
│   ├── admin/                  # Admin utilities (roles)
│   ├── ai/                     # AI provider abstraction
│   ├── analytics-server.ts     # Server analytics
│   ├── analytics.ts            # Client analytics
│   ├── audio/                  # Sound feedback
│   ├── audit/                  # Audit logging
│   ├── blindspot/              # Blindspot detection
│   ├── constants/              # App constants (routes, site, pricing, etc.)
│   ├── context/                # React contexts
│   ├── demo/                   # Demo mode (mock client, config)
│   ├── dev/                    # Dev utilities
│   ├── endurance/              # Endurance session logic
│   ├── hooks/                  # Shared hooks (feature flags, roles)
│   ├── import/                 # Question import
│   ├── notes/                  # Note utilities
│   ├── outcomes/               # Exam outcome logic
│   ├── payments/               # Payment utilities
│   ├── payrex/                 # PayRex integration
│   ├── paywall/                # Paywall checks (daily cap, score reveal)
│   ├── proof-simulation/       # Proof simulation gate
│   ├── rate-limit.ts           # In-memory rate limiter
│   ├── readiness/              # Readiness score computation
│   ├── readiness-score.ts      # Readiness score utilities
│   ├── routes.ts               # Route definitions + sidebar nav
│   ├── signals/                # Learning signal computation
│   ├── srs/                    # Spaced repetition (IRT, SM-2)
│   ├── stripe/                 # Stripe integration
│   ├── supabase/               # Supabase client factories
│   ├── utils.ts                # cn() utility
│   ├── validations/            # Input validation schemas
│   ├── wiki/                   # Wiki server utilities
│   ├── wiki-markdown.ts        # Markdown processing
│   └── workflow/               # Content workflow
│
├── stores/                     # Zustand stores
│   └── dev-store.ts            # Dev impersonation store
│
└── types/                      # TypeScript types
    ├── app.ts                  # Main app types
    ├── dashboard.ts            # Dashboard types
    ├── supabase.ts             # Supabase generated types
    ├── bun-test.d.ts           # Bun test type defs
    └── payrex-node.d.ts        # PayRex type defs
```

## Naming Conventions

- **Pages:** `page.tsx` (Next.js convention)
- **Components:** PascalCase files (`QuizRenderer.tsx`, `WikiSidebar.tsx`)
- **Server Actions:** kebab-case (`wiki-actions.ts`, `dashboard-page.ts`)
- **Utilities:** kebab-case (`rate-limit.ts`, `readiness-score.ts`)
- **Route groups:** Parenthesized (`(auth)`)
- **Private dirs:** Underscore prefix (`_components`, `_constants`, `_utils`)
- **Tests:** Co-located with source (`.test.ts` suffix)

## Key File Sizes (Largest Server Actions)

- `src/lib/actions/dashboard-page.ts` — 837 lines
- `src/lib/actions/quiz.ts` — 809 lines
- `src/lib/actions/analytics.ts` — 627 lines
- `src/lib/actions/trails.ts` — 366 lines
- `src/lib/actions/dashboard.ts` — 337 lines
- `src/lib/actions/wiki-actions.ts` — 330 lines

## Codebase Size

- **685 TypeScript/TSX files** total
- **47 server action files** (`'use server'`)
- **~30 client components** (`'use client'`)
- **30+ shadcn/ui components** in `src/components/ui/`
- **11 test files** (co-located)
