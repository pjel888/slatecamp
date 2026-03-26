# SlateCamp — Current Architecture (March 2026)

Auto-generated snapshot of the live codebase. This is the source of truth for what's built.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router, React 19 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | Supabase (PostgreSQL 17, ap-northeast-1) |
| Auth | Supabase Auth (SSR) |
| State | Zustand (quiz, lab, notifications, dev) |
| 3D | React Three Fiber, Three.js, @react-three/drei |
| Editor | Tiptap (notes) |
| Charts | Recharts |
| Icons | Phosphor Icons (@phosphor-icons/react) |
| Payments | Stripe + PayRex |
| AI | Anthropic SDK (Claude) |
| Package Manager | Bun |
| Deployment | Vercel |
| Design System | Campfire |

---

## Project Structure

```
slate-camp/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth pages (login, register, onboarding)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── onboarding/
│   │   │       └── comp-exam/        # Comp exam bridge onboarding
│   │   ├── (protected)/
│   │   │   └── ceo/                  # CEO dashboard (financials, insights, team)
│   │   ├── about/
│   │   ├── contact/
│   │   ├── pricing/
│   │   ├── try/                      # Anonymous diagnostic quiz
│   │   ├── tools/                    # Public SEO tools
│   │   │   ├── floor-tiles-calculator/
│   │   │   ├── wall-paint-calculator/
│   │   │   └── lot-plotter/
│   │   ├── admin/                    # Content CMS
│   │   │   ├── articles/
│   │   │   ├── content/              # Unified editor
│   │   │   ├── questions/
│   │   │   ├── taxonomy/
│   │   │   ├── assets/               # 3D assets
│   │   │   ├── pipeline/
│   │   │   ├── reviews/
│   │   │   └── settings/
│   │   ├── developer/                # Dev hub
│   │   │   ├── design-system/
│   │   │   ├── console/
│   │   │   ├── db/
│   │   │   └── test-data/
│   │   ├── dashboard/                # Main authenticated app
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── wiki/[slug]/
│   │   │   ├── testing/              # Testing & Review hub
│   │   │   │   ├── camp/setup/
│   │   │   │   ├── chill/setup/
│   │   │   │   ├── storm/setup/
│   │   │   │   ├── subject/setup/
│   │   │   │   ├── focus-review/setup/
│   │   │   │   ├── custom/setup/
│   │   │   │   ├── endurance/setup/
│   │   │   │   ├── simulation/briefing/
│   │   │   │   └── session/[sessionId]/
│   │   │   ├── 3d-lab/
│   │   │   ├── analytics/
│   │   │   ├── camptrails/[slug]/
│   │   │   ├── flash/[category]/
│   │   │   ├── notes/
│   │   │   ├── notifications/
│   │   │   ├── cram-card/
│   │   │   ├── area-c/              # Design practice suite
│   │   │   │   ├── calculator/
│   │   │   │   ├── design-problems/[problemId]/
│   │   │   │   └── design-quiz/[scenarioId]/
│   │   │   ├── pods/[podId]/
│   │   │   ├── dae-mode/
│   │   │   ├── professional/
│   │   │   ├── studio/
│   │   │   ├── code-updates/
│   │   │   ├── results-day/
│   │   │   ├── exam-outcome/
│   │   │   ├── assessment/
│   │   │   ├── score-reveal/
│   │   │   ├── settings/
│   │   │   └── upgrade/
│   │   ├── quiz/                     # Quiz Engine v2 (top-level)
│   │   │   └── [mode]/
│   │   │       ├── setup/
│   │   │       └── session/[sessionId]/
│   │   │           ├── results/
│   │   │           └── review/
│   │   └── api/
│   │       ├── cron/                 # Blindspot scan, signal compute
│   │       ├── ai/                   # Tutor, embeddings, question gen
│   │       ├── payments/
│   │       └── webhooks/             # Stripe, PayRex
│   │
│   ├── components/
│   │   ├── quiz-v2/                  # v2 Quiz Engine
│   │   │   ├── QuizShell.tsx         # Main orchestrator (config-driven)
│   │   │   ├── OptionsColumn.tsx     # Answer choices
│   │   │   ├── FeedbackPanel.tsx     # Post-answer feedback
│   │   │   ├── QuizFooter.tsx        # Navigation controls
│   │   │   ├── SlideToSubmit.tsx     # Mobile swipe gesture
│   │   │   ├── SwipeableOption.tsx
│   │   │   ├── setup/               # SetupFlow, IntroSlide1-3
│   │   │   ├── results/             # ResultsDashboard, ReviewCard
│   │   │   └── review/              # ReviewMode, QuestionHistory
│   │   ├── dashboard/
│   │   │   ├── HeroCommandBar.tsx    # Score + greeting + heatmap
│   │   │   ├── TaxonomyHeatmap.tsx   # GitHub-style activity heatmap
│   │   │   ├── SubjectMasteryCard.tsx
│   │   │   ├── BloomCognitiveTracker.tsx
│   │   │   ├── ReviewCenterSyncCard.tsx
│   │   │   ├── StreakRibbon.tsx
│   │   │   ├── ImprovedActivityFeed.tsx
│   │   │   ├── SubjectFloorAlert.tsx
│   │   │   └── heatmap/
│   │   ├── wiki/
│   │   │   ├── WikiArticle.tsx       # MDX renderer
│   │   │   ├── WikiItemRenderer.tsx  # 9 typed wiki_items renderers
│   │   │   ├── WikiRightSidebar.tsx
│   │   │   ├── WikiQuizButton.tsx
│   │   │   ├── WikiQuizModal.tsx
│   │   │   └── widgets/             # Interactive (bp344/, dsgn013/)
│   │   ├── testing/
│   │   │   ├── hub/ReviewHub.tsx     # Mode cards, sessions, suggestions
│   │   │   ├── hub/SessionsTable.tsx
│   │   │   ├── setup/               # Mode-specific setup screens
│   │   │   ├── session/             # v1 session behaviors
│   │   │   └── debrief/
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx  # Header popover
│   │   │   ├── NotificationList.tsx  # Full page list
│   │   │   ├── NotificationItem.tsx
│   │   │   └── NotificationPreferences.tsx
│   │   ├── trails/
│   │   │   ├── TrailLibrary.tsx
│   │   │   ├── TrailStepCard.tsx
│   │   │   └── TrailDailyView.tsx
│   │   ├── 3d/ + 3d-lab/            # R3F canvas + lab panels
│   │   ├── analytics/               # Charts (Pacing, Readiness, Stamina)
│   │   ├── notes/                   # Tiptap editor shell
│   │   ├── admin/                   # CMS components
│   │   ├── ceo/                     # CEO dashboard charts
│   │   ├── sidebar/                 # Rail+overlay sidebar
│   │   ├── ui/                      # shadcn/ui primitives
│   │   └── shared/                  # DashboardHeader, CampfireLoader
│   │
│   ├── lib/
│   │   ├── readiness-score.ts       # Anti-inflation scoring (6 vectors)
│   │   ├── area-c-calculations.ts   # Dev controls calculator
│   │   ├── design-scenarios.ts      # Design quiz JSON loader
│   │   ├── flash-cards.ts           # Flash card types
│   │   ├── trail-sequencing.ts      # Bloom's level ordering
│   │   ├── routes.ts                # Dashboard route config
│   │   ├── analytics.ts             # Client analytics
│   │   ├── analytics-server.ts      # Server analytics
│   │   ├── wiki-markdown.ts         # MDX processing
│   │   ├── utils.ts                 # cn() utility
│   │   ├── srs/
│   │   │   ├── irt.ts               # IRT 2PL model
│   │   │   ├── sm2.ts              # SM-2 spaced repetition
│   │   │   └── retention.ts
│   │   ├── quiz/
│   │   │   ├── mode-presets.ts      # 9 mode configs
│   │   │   ├── question-selection.ts # Selection algorithm
│   │   │   ├── adaptive-difficulty.ts
│   │   │   ├── confidence-calibration.ts
│   │   │   ├── stamina-analysis.ts
│   │   │   └── offline/             # IndexedDB + sync
│   │   ├── constants/
│   │   │   ├── routes.ts            # ROUTES object
│   │   │   ├── testing-modes.ts     # MODE_DEFINITIONS
│   │   │   ├── readiness.ts
│   │   │   ├── mastery.ts
│   │   │   ├── pricing.ts
│   │   │   └── analytics.ts
│   │   ├── actions/                  # Server Actions ('use server')
│   │   │   ├── quiz-v2/             # start, submit, end, review
│   │   │   ├── dashboard-page.ts    # 16 parallel queries
│   │   │   ├── mastery-actions.ts   # EMA mastery updates
│   │   │   ├── readiness-score-update.ts
│   │   │   ├── trails.ts
│   │   │   ├── notifications.ts
│   │   │   ├── wiki.ts / wiki-actions.ts
│   │   │   ├── bloom-tracker.ts
│   │   │   ├── cram-card.ts
│   │   │   ├── flash-cards.ts
│   │   │   ├── design-problems.ts
│   │   │   ├── pods.ts
│   │   │   ├── results-day.ts
│   │   │   ├── professional-mode.ts
│   │   │   ├── dae-mode.ts
│   │   │   ├── studio-mode.ts
│   │   │   ├── code-updates.ts
│   │   │   ├── oath-taking.ts
│   │   │   ├── comp-exam-onboarding.ts
│   │   │   └── ... (60+ action files)
│   │   ├── supabase/
│   │   │   ├── server.ts            # createClient() + getUser()
│   │   │   ├── client.ts
│   │   │   ├── admin.ts
│   │   │   ├── middleware.ts
│   │   │   └── bootstrap.ts
│   │   ├── context/                 # React contexts
│   │   ├── hooks/                   # Custom hooks
│   │   ├── paywall/                 # Access control
│   │   ├── email-templates/
│   │   └── ai/                      # AI provider + prompts
│   │
│   ├── stores/
│   │   ├── useQuizStore.ts          # Quiz session state (Zustand, persisted)
│   │   ├── useLabStore.ts           # 3D Lab state
│   │   ├── useNotificationStore.ts  # Real-time notifications
│   │   └── dev-store.ts             # Developer impersonation
│   │
│   └── types/
│       ├── supabase.ts              # Auto-generated (3,812 lines)
│       ├── app.ts                   # Core domain types
│       ├── quiz-config.ts           # Quiz v2 types (9 modes)
│       ├── dashboard.ts             # Dashboard data contract
│       ├── testing.ts               # Testing hub types
│       ├── notifications.ts         # 12 notification types
│       ├── wiki.ts
│       ├── 3d-lab.ts
│       ├── ceo.ts
│       ├── developer.ts
│       └── tools.ts
│
├── supabase/
│   └── migrations/                  # 56 migration files
│
├── Design Questions/                # 12 design scenario JSONs
├── DATABASE_SCHEMA.sql              # 64 tables (auto-generated)
├── CLAUDE.md                        # Project instructions
└── .claude/
    ├── agents/                      # 17 agent definitions
    ├── docs/                        # 12 documentation files
    ├── skills/                      # 40 skills
    └── IP Execution Plan/
```

---

## Database (64 tables)

### Core
| Table | Purpose |
|---|---|
| `profiles` | User profiles (PK: `id` → auth.users) |
| `disciplines` | Board exam types (Architecture/ALE) |
| `taxonomy_tree` | Hierarchical subject taxonomy |

### Quiz Engine
| Table | Purpose |
|---|---|
| `questions` | Question bank (IRT difficulty/discrimination) |
| `quiz_sessions` | Session records (config JSONB, question_ids) |
| `user_interactions` | Per-answer telemetry |

### Mastery & Scoring
| Table | Purpose |
|---|---|
| `user_node_mastery` | Per-node EMA mastery (PK: user_id + topic_id) |
| `user_global_stats` | Readiness score, streak, exam date |
| `readiness_score_snapshots` | Score history with sub_scores |
| `blindspot_queues` | Auto-generated weak area queues |
| `user_srs_cards` | Spaced repetition cards |
| `user_theta` | IRT theta estimates |

### Content
| Table | Purpose |
|---|---|
| `wiki_articles` | Wiki content (MDX) |
| `wiki_article_taxonomy` | Article-to-taxonomy mapping |
| `wiki_ei_prompts` | Elaborative interrogation prompts |
| `models_3d` | 3D model assets |
| `spatial_hotspots` | 3D hotspot annotations |

### Trails
| Table | Purpose |
|---|---|
| `camp_trails` | Guided study plan definitions |
| `trail_days` / `trail_steps` | Day and step structure |
| `user_trail_enrollments` | User enrollment + progress |

### Features
| Table | Purpose |
|---|---|
| `notifications` / `notification_preferences` | Notification system |
| `notes` / `note_folders` | Rich notes |
| `design_problems` / `design_problem_sessions` | Design practice |
| `study_pods` / `pod_members` | Study groups |
| `code_updates` | Building code changelog |
| `oath_taking_schedules` | Oath ceremony dates |
| `user_subscriptions` | Tier + payment tracking |
| `analytics_events` | Event tracking |

---

## Quiz Engine — 9 Modes

| Mode | Questions | Timer | Feedback |
|---|---|---|---|
| Camp | 20 | Hidden | Immediate |
| Chill | 10 | Hidden | Immediate, skip-friendly |
| Subject | 15 | Hidden | Immediate, adaptive |
| Focused | 15 | Hidden | Immediate (weakest areas) |
| Custom | User picks | Optional | User picks |
| Storm | 50 | 60min countdown | Deferred |
| Full Exam | 200 | 4hr countdown | 24hr delayed |
| Extended | 100 | Count-up | Immediate |
| Article Review | 5 | Hidden | Immediate (wiki-integrated) |

All driven by `QuizSessionConfig` JSONB in `quiz_sessions.config`.

---

## Sidebar Navigation

| Group | Items |
|---|---|
| (standalone) | Dashboard |
| Learn | Wiki, Notes |
| Explore | 3D Lab |
| Practice | Testing & Review, Camp Trail, Flash Cards |
| Data | Analytics |
| (bottom) | Settings |

---

## Scoring Algorithms

- **Readiness Score:** 6 anti-inflation vectors (streak diminishing returns, difficulty ceiling, grey node penalty, Bloom's ceiling, question bank depth, recency decay). PRC-weighted: 30/30/40.
- **IRT 2PL:** `P(correct) = 1 / (1 + exp(-a(theta - b)))`. Question selection at P=0.75.
- **SM-2:** Spaced repetition with quality-based interval scheduling.
- **Mastery EMA:** `S_t = 0.2 * x_t + 0.8 * S_{t-1}`

---

## Key Patterns

- **Server Components default** — `'use client'` at leaf only
- **Server Actions** for all mutations (`src/lib/actions/`)
- **Parallel data fetching** — `getDashboardPageData()` runs 16 concurrent queries
- **Config-driven quiz** — single `QuizShell`, behavior from JSONB config
- **Zustand** for client state (quiz, lab, notifications)
- **Supabase RLS** — every table has row-level security
- **Arrow functions only** — never `function` declarations
- **`profiles` PK is `id`** — NOT `user_id`
- **Campfire design system** — Camp Cobalt `#1B3FC4`, Inter font, `rounded-md` cards
