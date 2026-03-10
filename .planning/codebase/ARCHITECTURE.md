# Project Cerebro — Architecture

## App Structure (Next.js 16 App Router)

```
src/app/
├── (auth)/                 # Unauthenticated routes
│   ├── login/
│   ├── register/
│   └── onboarding/         # Wizard flow
├── (dashboard)/            # Protected dashboard routes
│   ├── layout.tsx          # Dashboard shell layout
│   ├── wiki/               # Wiki explorer
│   ├── testing/            # Quiz interface
│   ├── 3d-lab/             # 3D model viewer
│   ├── notes/              # Tiptap note editor
│   ├── analytics/          # Performance dashboards
│   └── settings/           # User settings
├── about/
├── contact/
├── pricing/
└── page.tsx                # Landing page (marketing)
```

## Layout Strategy

### Root Layout (`src/app/layout.tsx`)
- Theme provider (light/dark/system)
- Tooltip provider (cmdk context)
- Demo shell for dev testing
- Geist font variables

### Dashboard Layout (`src/app/(dashboard)/layout.tsx`)
- Persistent navigation sidebar
- Header with user controls
- Protected route wrapper
- Responsive grid layout

## Feature Component Organization

```
src/components/
├── ui/                      # shadcn primitives (button, card, etc.)
├── shared/                 # Reusable across features
│   ├── ThemeProvider.tsx
│   └── TooltipProvider.tsx
├── wiki/                   # Wiki-specific components
│   ├── WikiDevPanel.tsx
│   └── ...
├── quiz/                   # Testing/quiz components
├── analytics/              # Dashboard chart components
├── 3d/                     # Viewer, controls, models
├── notes/                  # Tiptap editor wrappers
└── dashboard/              # Widget components (DailyMission, etc.)
```

## Data Fetching Patterns

### Server Components (Default)
- All `src/app/*` pages are server-rendered by default
- Direct Supabase queries in async functions
- No `'use client'` unless interactivity required

### Client Components (`'use client'`)
- Interactive quiz UI (answer selection, timer)
- Tiptap editor instance
- 3D viewer controls
- Real-time session tracking
- Form submissions with optimistic updates

## Authentication Boundaries

```
┌─────────────────────────────────────────────────────┐
│                    Root Layout                        │
│  ┌────────────────────────────────────────────────┐  │
│  │            ThemeProvider / TooltipProvider      │  │
│  └────────────────────────────────────────────────┘  │
│         ├─ (auth) routes          ├─ (dashboard)────┤
│         │   (public, auth-bound)  │   (protected)   │
│         └─────────────────────────┴─────────────────┘
└─────────────────────────────────────────────────────┘
```

- **`src/app/*`** → Public or requires session cookie
- **`src/app/(dashboard)/...`** → Protected by middleware auth check
- `exam_profile_id` scopes all data queries (user's active exam context)

## Route Protection

```typescript
// src/middleware.ts (or similar)
if (!session) {
  return NextResponse.redirect('/login')
}

// All writes go through Server Actions
// No client-side mutations via Supabase
```

## State Management

### Session Context
- Supabase session in cookies (read from headers on server)
- Passed as props to client components
- `exam_profile_id` from active board exam profile

### Quiz State
- Per-session state in component context
- `session_questions` table for persistence
- Server Actions commit answers to DB

## File Naming Conventions

```typescript
// Files use PascalCase for directories, kebab-case for route segments
// Components: PascalCase
// API routes: camelCase with .ts extension

// Example paths:
src/app/(auth)/onboarding/onboarding-wizard.tsx
src/components/ui/button.tsx
src/lib/srs/sm2.ts
```

## Routing Strategy

- **Dynamic routes** — Not heavily used (board_exams, subjects loaded via data)
- **Static segments** — onboarding wizard uses parentheses group `(auth)`
- **Marketing pages** — about, contact, pricing in root app dir
- **404 handling** — Default Next.js not-found

---

## Key Architectural Decisions

1. **Server Components first** — Minimal client JS footprint, better SEO
2. **Exam-profile scoping** — All data queries filtered by active exam context
3. **No serverless functions** — Direct Supabase queries from edges
4. **Materialized views** — `question_user_performance` for fast analytics
5. **Flat notes store** — JSONB content, no nested folders (simpler UX)
