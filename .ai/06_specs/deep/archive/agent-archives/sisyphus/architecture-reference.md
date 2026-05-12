> OBSOLETE as of 2026-04-05. Superseded by `.sisyphus/notepads/system-architecture/` and `.sisyphus/plans/system-architecture-plan.md`.

# SlateCamp Master Architecture

> **Status:** Single Source of Truth
> **Updated:** 2026-04-04
> **Purpose:** Unified architecture documentation for all portals, tech stack, and system design

---

## 1. System Overview

SlateCamp is a high-performance, discipline-agnostic study engine for professional licensure exams. It avoids superficial gamification in favor of pedagogical rigor (IRT and Spaced Repetition) and a distinct "Campfire" aesthetic.

### Codebase Stats (2026-04-04 Audit)
| Metric | Value |
|--------|-------|
| Total .tsx files | **1063** |
| Pages (App Router) | 137 across 4 portals |
| Server action files | **117** |
| Zustand stores | 4 |
| React Contexts | 10 |
| Database tables | **72** |
| RLS policies | **~184+** |
| Database migrations | **62** |
| Production dependencies | 56 |

---

## 2. 4-Portal Architecture

SlateCamp leverages Next.js 16 App Router to strictly isolate contexts:

### 2.1 Dashboard Portal (`/dashboard`)
The primary B2C/B2B2C student experience.
- **Key Areas:** Wiki, Analytics, 3D Lab, Camp Trails, Testing Hub (7 modes: Camp, Storm, Chill, Custom, Focus Review, Simulation, Endurance)
- **Layout:** `src/app/dashboard/layout.tsx` — sidebar, navbar, breadcrumb, main content

### 2.2 Admin Portal (`/admin`)
The internal CMS for content generation.
- **Key Features:** Unified article/question editors, taxonomy manager, SME Review Queue, publishing pipeline
- **Route Structure:**
  ```
  /admin
  ├── knowledge/          # Content management hub
  │   ├── [id]/          # Unified Content Editor
  │   ├── questions/[id]/ # Question Editor
  │   ├── import/         # Bulk import
  │   └── analytics/      # Content analytics
  ├── taxonomy/           # Taxonomy tree management
  ├── reviews/            # SME Review Queue
  ├── audit/              # Audit logs
  ├── pipeline/           # Publishing pipeline
  ├── assets/             # 3D Asset management
  └── settings/           # Admin settings
  ```

### 2.3 CEO Portal (`/ceo`)
Business operations and observability.
- **Key Features:** Revenue tracking (LemonSqueezy/PayRex), cohort retention, churn risk tables, global sign-up velocity

### 2.4 Developer Portal (`/developer`)
Internal documentation and tooling reference.
- **Key Features:** API reference, design system token catalog (Campfire Theme), architecture specs

---

## 3. The Pedagogical Engine

Located in `src/lib/srs/` and `src/lib/actions/testing.ts`.

### 3.1 IRT (Item Response Theory) 2PL Model
Uses Newton-Raphson updates to adjust `theta` (student ability) against item difficulty and discrimination.

### 3.2 Anti-Inflation Readiness Score
A composite 6-vector score factoring in:
- Streak decay
- Gray-node penalties
- Bloom's taxonomy ceilings

### 3.3 Spaced Repetition (SM-2)
Adapts intervals based on:
- Correctness
- Time-to-answer
- User-reported confidence

### 3.4 Blindspot Queue
An algorithm that prioritizes the weakest taxonomy nodes and actively hunts for "gray" (untested) areas.

---

## 4. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.9.3 |
| Styling | Tailwind CSS | 4.2.2 |
| UI Primitives | shadcn/ui + @base-ui/react | 4.1.0 / 0.9.5 |
| State | Zustand | 5.0.12 |
| Database | Supabase (PostgreSQL) | 2.100.0 |
| Auth | Supabase SSR | 0.9.0 |
| 3D/Spatial | React Three Fiber + Three.js | R3F 9.5.0 / Three 0.183.2 |
| Animation | Framer Motion | 12.38.0 |
| AI Tutor | Anthropic SDK | 0.78.0 |

---

## 5. Dev Mode & Impersonation System

### 5.1 Current Implementation
The current `DEV_FORCE_USER_ID` implementation already uses **real Supabase data**:
- Fetches actual user via `admin.getUserById()`
- Uses SERVICE_ROLE_KEY for full DB access
- Returns REAL data from local Supabase instance

### 5.2 Environment Variables
| Variable | Purpose |
|----------|---------|
| `DEV_FORCE_USER_ID` | Hard-coded user ID for dev |
| `DEV_FORCE_TIER` | Hard-coded tier override (`free`, `camp`, `insurance`, `institutional`) |

### 5.3 Demo Mode
Demo mode (`lib/demo/`) is SEPARATE and only activates when:
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`
- OR missing Supabase credentials in production

---

## 6. State Management Patterns

### 6.1 Server-First Fetching (React Server Components)
- All data fetching occurs in **Server Components**
- Data is passed down to client islands as props
- Client-side `createBrowserClient()` fetching is discouraged (lacks service_role key)

### 6.2 Server Actions for Mutations
All form submissions, quiz initializations, and database updates flow through **Server Actions** in `src/lib/actions/`.

### 6.3 Client State via Zustand
| Store | Purpose |
|-------|---------|
| `useQuizStore.ts` | Active session timer, current question, feedback rendering, AI tutor context |
| `useLabStore.ts` | R3F canvas, camera position, spatial layers, parametric sliders |
| `dev-store.ts` | DEV_FORCE_USER_ID overrides, impersonateAs logic |
| `useNotificationStore.ts` | Real-time notification state |

---

## 7. Design System (Campfire)

### Color Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| Camp Cobalt | `#1B3FC4` | Primary actions, nav, links |
| Camp Orange | `#E8853A` | Progress celebration, warm CTAs |
| Emerald | `#2D9F6F` | Success, mastery, correct |
| Warm Red | `#D64545` | Error, critical |
| Amber | `#D4951A` | Warning, developing |
| Surface Light | `#F8F7F5` | Page background |
| Ink Primary | `#1A2332` | Main text |

### Constraints
- Border radius: `rounded-sm` (buttons), `rounded-md` (cards), `rounded-lg` (modals)
- Shadows: `shadow-sm` on hover, `shadow-lg` for modals only
- Transitions: max 300ms, default `duration-150 ease-out`
- Minimum text size: 11px

---

*This is the single source of truth for SlateCamp architecture. See MASTER-IMPLEMENTATION.md for implementation tasks.*

