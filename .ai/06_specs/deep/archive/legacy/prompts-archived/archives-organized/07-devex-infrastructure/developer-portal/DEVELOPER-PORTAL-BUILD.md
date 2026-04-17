# SlateCamp Developer Portal — Complete Implementation Plan

> Give this file to Claude Code at the project root. It contains everything needed to build the `/developer` portal from start to finish.
>
> Also reference these files if available in the project:
> - `CODEBASE-AUDIT-2026-03-24.md` — Full codebase audit
> - `ADMIN-AUDIT-REPORT.md` — Admin route audit
> - `COMPONENT-LIBRARY-SPEC.md` — Component specifications
> - `SLATECAMP-COMPONENT-LIBRARY.html` — Visual component reference
>
> Read the codebase audit before writing any code. It contains the ground truth of every route, table, API endpoint, and component.

---

## Context

SlateCamp currently has 6 developer tool pages nested under `/dashboard/developer/`:
- `/dashboard/developer/console` — Feature flags, impersonation, system info
- `/dashboard/developer/db` — Database browser (table info via RPC)
- `/dashboard/developer/logs` — Audit log viewer (last 50 entries)
- `/dashboard/developer/design-system` — Component gallery
- `/dashboard/developer/docs` — Architecture docs (feature flags, impersonation, multi-tenant, tiers)
- `/dashboard/developer/test-data` — Test data generator

These are buried inside the dashboard and use an inconsistent auth guard (hardcoded emails + domain check + NODE_ENV). We are promoting this into a proper standalone `/developer` portal — a dedicated internal documentation and tooling hub that any SlateCamp engineer or admin can use to understand the system, browse APIs, inspect the schema, and use dev tools.

---

## Tech Stack (non-negotiable)

- **Framework:** Next.js 16 App Router (Server Components default)
- **React:** 19.2.4
- **Styling:** Tailwind CSS v4 (CSS-first config via globals.css)
- **UI:** shadcn/ui with @base-ui/react primitives (components in `src/components/ui/`)
- **Fonts:** Inter (body), Syne (headings), DM Mono (code/data/labels)
- **Auth:** Supabase Auth via `@supabase/ssr`, roles via `user_roles` table
- **Package manager:** Bun
- **Build check:** `bun run build` after every phase

---

## Design Language

The developer portal has a distinct personality from the student-facing app. It should feel like reading LemonSqueezy's API docs or GitHub's developer documentation — technical, precise, high-density, confident.

### Visual Rules
- **Layout:** Wide content area (`max-w-6xl`), persistent left sidebar, sticky right-side TOC on long pages
- **Background:** Slightly cooler than the main app — use `bg-background` (which is `#F8F7F5`) for the overall page, `bg-card` for content panels
- **Code blocks:** Dark background (`bg-[#1A1A2E]` or `bg-zinc-950`), monospace, with copy-to-clipboard button
- **Typography:** Tighter line-height for technical content. Body at 13px Inter. Code at 13px DM Mono. Headings at Syne 700/800.
- **Information density:** More compact spacing than the student app. Cards use `p-3` not `p-4`. Tables are tight.
- **Color coding:** HTTP methods get color badges — GET (green), POST (blue), PUT (amber), DELETE (red), PATCH (purple)
- **No marketing fluff.** Every word earns its place. Write like a senior engineer documenting for other senior engineers.

### Navigation Sidebar
```
Developer Portal
├── Overview                  /developer
├── Design System             /developer/design-system
│   ├── Colors
│   ├── Typography
│   ├── Components
│   └── Tokens
├── API Reference             /developer/api-reference
│   ├── Route Handlers
│   ├── Server Actions
│   └── Webhooks
├── Architecture              /developer/architecture
│   ├── Tech Stack
│   ├── Database Schema
│   ├── Auth & Roles
│   ├── Data Flow
│   └── Deployment
├── Dev Tools                 /developer/tools
│   ├── Console               /developer/tools/console
│   ├── Database Browser      /developer/tools/db
│   ├── Logs                  /developer/tools/logs
│   └── Test Data Generator   /developer/tools/test-data
└── Component Library         /developer/components
    ├── All Components
    └── MDX Components
```

---

## Execution Plan

Execute phases in exact order. Run `bun run build` after each phase. Do not proceed if the build fails.

---

### PHASE 1: Route Migration & New Layout

#### 1.1 Create the `/developer` route group

Create `src/app/developer/layout.tsx` — the shell for the entire developer portal.

**Auth guard:** Use `getUserRole()` from `src/lib/admin/roles.ts`. Allow access if:
- `NODE_ENV === 'development'` (local dev always has access)
- User has any role in `user_roles` table (`super_admin`, `content_admin`, `sme_reviewer`)

Do NOT use hardcoded emails or domain checks. If unauthorized, redirect to `/dashboard`.

**Layout structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar: "SlateCamp" logo · "Developer Portal" label · Back to │
│  Dashboard link · User avatar                                    │
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                       │
│ Sidebar  │  Main Content Area                                    │
│ (220px)  │  (max-w-6xl, scrollable)                             │
│          │                                                       │
│ Nav tree │                                                       │
│ from     │                                                       │
│ above    │                                                       │
│          │                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

- Top bar: Dark navy background (`#0F1F5C`), white text. "SlateCamp" in Syne 800. "Developer Portal" as a DM Mono badge next to it. "← Back to Dashboard" link on the right.
- Sidebar: White/card background. Collapsible on mobile. Active route highlighted with left border + primary text. Grouped with DM Mono uppercase section labels.
- Main content: `bg-background` with padding. Scrollable. Each page manages its own content width.

#### 1.2 Move existing developer pages

Move the 6 existing pages from `/dashboard/developer/` to `/developer/tools/`:

| Old Path | New Path |
|----------|----------|
| `src/app/dashboard/developer/console/page.tsx` | `src/app/developer/tools/console/page.tsx` |
| `src/app/dashboard/developer/db/page.tsx` | `src/app/developer/tools/db/page.tsx` |
| `src/app/dashboard/developer/logs/page.tsx` | `src/app/developer/tools/logs/page.tsx` |
| `src/app/dashboard/developer/design-system/page.tsx` | `src/app/developer/design-system/page.tsx` |
| `src/app/dashboard/developer/docs/page.tsx` | `src/app/developer/architecture/page.tsx` |
| `src/app/dashboard/developer/test-data/page.tsx` | `src/app/developer/tools/test-data/page.tsx` |

Also move any components that are only used by these pages (check `src/components/dev/` directory).

#### 1.3 Update all references

Search the entire codebase for every reference to `/dashboard/developer` and update to the new paths:
- Links in navigation components (`AdminNav`, `DashboardHeader`, sidebar links)
- Redirects in auth callbacks or middleware
- `revalidatePath()` calls
- Any hardcoded strings in layout files

#### 1.4 Add redirect for old routes

In `src/app/dashboard/developer/layout.tsx`, add a redirect to `/developer` so bookmarks don't break. Or create a simple redirect page. Either way, old URLs must not 404.

#### 1.5 Remove old developer layout auth guard

The old `src/app/dashboard/developer/layout.tsx` has hardcoded emails. Since we're moving everything to `/developer` with a clean auth guard, the old layout can be replaced with just a redirect.

**Run `bun run build`. Fix all broken imports. Confirm zero errors.**

---

### PHASE 2: Developer Portal Overview Page

Create `src/app/developer/page.tsx` — the landing page.

**Content:**

**Hero section:**
- Syne 800 heading: "SlateCamp Developer Portal"
- Subtitle (Inter 13px, muted): "Internal documentation, API reference, architecture guides, and dev tools for the SlateCamp engineering team."

**Quick Links grid (2×3 cards):**

| Card | Icon | Description | Link |
|------|------|-------------|------|
| Design System | Palette icon | Colors, typography, components, tokens | /developer/design-system |
| API Reference | Terminal icon | Route handlers, server actions, webhooks | /developer/api-reference |
| Architecture | Layers icon | Schema, auth, data flow, deployment | /developer/architecture |
| Component Library | Grid icon | All UI + MDX components with props | /developer/components |
| Dev Tools | Wrench icon | Console, DB browser, logs, test data | /developer/tools |
| Codebase Stats | BarChart icon | Live metrics from the codebase | (section below) |

Use interactive cards (hover → border-primary/30 + shadow-sm).

**System Stats section (live data):**

Fetch from Supabase and display in stat cards:
- Total tables: query `information_schema.tables` count or hardcode 50
- Total API routes: hardcode 11
- Total server actions: hardcode 50+
- Total components: hardcode 247
- Total lines of code: hardcode ~26K
- RLS policies: hardcode 89

Display as a grid of `StatCard` components (DM Mono numbers with eyebrow labels).

**Environment badge:**
Show current environment (development/staging/production) based on `NODE_ENV` and `NEXT_PUBLIC_APP_URL`. Use a colored badge: green for dev, amber for staging, red for production.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 3: Design System Page (Upgraded)

Replace or significantly upgrade `src/app/developer/design-system/page.tsx`.

This page becomes the living Storybook for SlateCamp. If the component library refactor has been completed (from `COMPONENT-LIBRARY-BUILD.md`), showcase every canonical component. If not, document the existing components.

**Page structure with sticky right-side TOC:**

#### 3.1 Colors
- Show the full Slatecamp palette from `globals.css` CSS variables
- For each color: swatch, hex value, CSS variable name, Tailwind class, usage description
- Group: Brand & Signal, Neutrals & Surfaces, Semantic (quiz states, chart colors)

#### 3.2 Typography
- Live specimens for every font × weight × size combination actually used
- Table mapping: use case → font → weight → size → Tailwind class
- Syne: page headings (800, 17px), section headings (700, 14px)
- DM Mono: eyebrows (500, 9px), code/data (400, 13px), stat numbers (500, 24px)
- Inter: body (400, 13px), card titles (500, 13px), labels (500, 11px), muted (400, 11px)

#### 3.3 Spacing & Grid
- Show the 4px grid system: 4, 8, 12, 16, 20, 24, 32, 40px
- Show border radii: sm (4px), md (6px), lg (8px), full (9999px)
- Show shadow scale: none, sm, md, lg

#### 3.4 Components
For EACH component (Button, Badge, CloseButton, Card, SectionHeader, ScoreDisplay, FormInput, Tabs, Toggle, Checkbox/Radio, Toast, EmptyState, Skeleton, DataTable, Tooltip, Dialog, Breadcrumb, SearchInput, TaxonomyPicker, QuestionCard, StatCard, LegalCitationBadge):

- Render every variant side by side
- Render every size
- Show all interactive states (hover the buttons, see the transitions)
- Show the props interface in a code block
- Show a usage example in a code block with copy button

Use a tabbed interface per component: "Preview" | "Props" | "Usage"

#### 3.5 Design Tokens
- Dump all CSS custom properties from `globals.css` in a searchable table
- Columns: Token name, Light value, Dark value, Usage

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 4: API Reference Page

Create `src/app/developer/api-reference/page.tsx`.

This is the most content-heavy page. Document every API endpoint and server action in the system.

**Page structure:**
- Left column (sidebar): list of all endpoints, grouped by domain, with method badges
- Main content: endpoint details
- Sticky TOC on right

#### 4.1 Route Handlers

For each of the 11 route handlers (from the codebase audit), document:

**Header:** Method badge (colored) + path + one-line description
**Auth:** What authentication is required (User session, Webhook signature, CRON_SECRET, Admin role, Rate limited)
**Request:** Parameters, body schema (show Zod schema if it exists), headers
**Response:** Success response shape, error response shape
**Example:** Dark code block with a curl or fetch example + expected response JSON

Document these endpoints:

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/payments/checkout` | POST | User session |
| `/api/webhooks/lemonsqueezy` | POST | LemonSqueezy signature |
| `/api/webhooks/payrex` | POST | PayRex signature |
| `/api/cron/blindspot-scan` | GET | CRON_SECRET header |
| `/api/cron/compute-signals` | GET | CRON_SECRET header |
| `/api/ai/tutor` | POST | User + rate limit |
| `/api/ai/embed` | POST | User + rate limit |
| `/api/ai/generate-questions` | POST | User + rate limit |
| `/api/ai/study-agent` | POST | User + rate limit |
| `/api/admin/flags` | POST/DELETE | Admin role |
| `/api/debug-taxonomy` | GET | Content manager |

**To build each endpoint's documentation:**
1. Read the actual route handler file
2. Extract the Zod schema (if any) for request validation
3. Extract the response shape from the return statements
4. Document the auth check pattern used
5. Write a realistic example

#### 4.2 Server Actions

Group by domain and document each:

**Quiz Engine:**
- `createQuizSession(params)` — Creates session with paywall cap check
- `saveInteraction(interaction)` — Core interaction with mastery/SRS/lucky-guess
- `updateQuizSession(sessionId, updates)` — On completion: recomputes readiness
- `deleteQuizSession(sessionId)` — Soft delete (sets abandoned)
- `getSessionQuestions(questionIds)` — Bulk fetch, maintains order
- `getQuestionsByTopic(nodeId, limit)` — Recursive leaf-node fetch
- `selectContextualVariationQuestions(nodeIds, count)` — One per context per node
- `checkAndGetRelearningQuestions(...)` — SRS-driven restudy

**Admin Content:**
- `createQuestion(data)` — Zod validated, canManageContent()
- `updateQuestion(id, data)` — Zod validated, canManageContent()
- `deleteQuestion(id)` — canManageContent()
- `createWikiArticle(data)` — Zod validated, canManageContent()
- `updateWikiArticle(id, data)` — Zod validated, canManageContent()
- `getQuestions()` / `getQuestion(id)` — Read operations
- `getArticles()` / `getArticle(id)` — Read operations
- `getTaxonomyNodes()` — Full tree for admin

**Wiki:**
- `getWikiTaxonomyTree(disciplineId)` — Full taxonomy, excludes deprecated/cross-ref
- `getWikiArticlesByNode(nodeId)` — Articles via junction table
- `getWikiArticleBySlug(slug)` — Single article with taxonomy mappings
- `searchWiki(term, limit)` / `searchWikiPaginated(term, page, perPage)`
- `getArticleSources(articleId)` — Sources by sort_order
- `getTaxonomyTree(disciplineId)` — Comprehensive tree with chunked article batching
- `resolveArticleAndNode(slug)` — Resolves both article and node

**Wiki Engagement:**
- `recordArticleRead({articleId, trailStepId?})` — Records open, returns read_id
- `updateReadProgress({readId, readPct, timeSpentMs})` — Scroll depth + time
- `getWikiBookmarks()` / `addWikiBookmark(id)` / `removeWikiBookmark(id)`
- `getEIPromptsForArticle(articleId)` — Published active prompts
- `getUserEIResponsesForArticle(articleId)` — User's responses as Map
- `submitEIResponse({promptId, responseText?, selectedOptionIndex?})`

**Mastery & Analytics:**
- `getSubjectMasteryData(userId)` — Per-subject mastery breakdown
- `recomputeAndSaveReadinessScore(userId)` — Full readiness recalculation
- `getDashboardPageData(userId)` — Aggregated dashboard data

**Trails:**
- Trail enrollment, progress tracking, day completions, step credits

**Notes:**
- CRUD with folder management, source tracking

For each server action, document:
- Function signature with types
- Which tables it reads/writes
- Auth requirement (user session, admin role, none)
- Input validation (Zod schema if present)
- Return type

Use collapsible sections (`<Accordion>` or `<details>`) so the page isn't overwhelming.

#### 4.3 Webhooks

Document the LemonSqueezy and PayRex webhook flows:
- What events are handled
- What database mutations each event triggers
- How signature verification works
- Retry behavior

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 5: Architecture Page

Create `src/app/developer/architecture/page.tsx`.

Merge content from the existing `/dashboard/developer/docs/page.tsx` and expand it significantly using the codebase audit as source material.

#### 5.1 Tech Stack

Show the exact versions table from the codebase audit (framework, runtime, styling, database, 3D, animation, state, charts, AI, payments, validation, content, editor). Add a brief description of why each choice was made.

#### 5.2 Database Schema

**Entity Relationship Overview:**
Describe the 5 domain clusters:
1. **Taxonomy & Content:** disciplines → taxonomy_tree → questions, wiki_articles, models_3d
2. **User Identity & Billing:** auth.users → profiles → subscriptions → organizations
3. **Quiz Engine:** quiz_sessions → user_interactions (immutable log)
4. **Mastery & Analytics:** user_interactions → user_node_mastery → readiness scores
5. **Progression:** camp_trails → trail_days → trail_steps → user enrollments

**For each domain cluster, show:**
- Table names with key columns
- Foreign key relationships
- Indexes
- RLS policy summary (who can read/write)

Pull all of this from the codebase audit Section 4.

**Database Functions:**
Document all 5+ PL/pgSQL functions with their purpose and trigger bindings.

**Enums:**
List all 13 custom enums with their values.

#### 5.3 Authentication & Authorization

Document:
- Auth provider (Supabase Auth, Google OAuth)
- Session management (cookie-based via @supabase/ssr)
- Role system: 3 roles, their permissions, the `user_roles` table
- Auth guard functions: `isAdmin()`, `isSuperAdmin()`, `canManageContent()`, `canReviewContent()`, `canManageUsers()`
- PL/pgSQL role functions: `has_admin_role()`, `is_super_admin()`, `can_review_content()`
- Route protection flow: middleware → layout → page-level guards
- Service role usage and where it's allowed

#### 5.4 Data Flow

Document the core mastery loop:
```
Student interaction (quiz answer, wiki read, 3D Lab)
  → user_interactions (immutable event log)
  → user_node_mastery (EMA weight, updated via trigger)
  → Readiness Score + Taxonomy Heatmap
  → Progression mechanics (Blindspot, Endurance, Proof, Camp Trail)
  → Student returns tomorrow
```

Document the quiz session lifecycle:
```
createQuizSession → getSessionQuestions → [loop: render question → saveInteraction] → updateQuizSession (complete) → snapshot readiness score
```

#### 5.5 Deployment

Document:
- Platform: Vercel (serverless)
- Cron jobs: 2 daily (blindspot-scan at 16:00 UTC, compute-signals at 16:30 UTC)
- Environment variables: list all public + server-only (names only, not values)
- Middleware: session refresh + x-pathname header
- Build command: `next build` with Turbopack available

#### 5.6 Migration History

List all 37 migration files with one-line descriptions of what each one does. Pull from actual migration file names in `supabase/migrations/`.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 6: Component Library Reference Page

Create `src/app/developer/components/page.tsx`.

This is different from the Design System page — this documents individual components with their full prop interfaces and usage patterns.

#### 6.1 UI Primitives

For each component in `src/components/ui/` (there are ~30), show:
- Component name and file path
- Props interface (TypeScript)
- All variants and sizes
- Import statement (with copy button)
- Usage example (with copy button)

#### 6.2 MDX Components

For each MDX component registered in the WikiArticle renderer (reference the admin audit Section 5), show:
- MDX tag name
- Props with types and descriptions
- MDX usage example (how it looks in an article's .mdx source)
- Visual preview of the rendered output

Document ALL of these (from the audit):

**Callouts:** Note, Warn/Warning, Tip, Example, Callout
**Exam Components:** WikiCalloutBox, WikiExamTable, WikiArticleHero, WikiPartHeader, WikiChangedPill
**Mistake Tracking:** WikiMistakeCard, WikiMistakeList
**Interactive:** KeyValues, FormulaBlock, InlineQuiz, Tabs/Tab, Accordion/AccordionItem, ElaborativeInterrogation
**Legal:** LawCallout, ExamTip, AlertBox
**Tables:** ComparisonTable, ProcessFlow, AuthorityContent

For each, show the template snippet that the admin MDX editor toolbar would insert (from the admin console build).

#### 6.3 Widget Registry

Document the dynamic widget system (`src/components/wiki/widgets/registry.ts`):
- How `detectWidgets()` and `resolveWidgets()` work
- BP 344 widgets (6): ComparisonTable, DoorConfigurator, CorridorVisualizer, CubicleChecker, GrabBarExplainer, RecallDrill
- DSGN-013 widgets (10): BedroomPlanView, BedSizeComparator, WorkstationCalculator, etc.
- How to add a new widget to the registry

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 7: Dev Tools Hub

Create `src/app/developer/tools/page.tsx` — an index page for dev tools.

Show a grid of cards linking to the 4 tool pages:

| Tool | Description | Link |
|------|-------------|------|
| Developer Console | Feature flags, impersonation, system info | /developer/tools/console |
| Database Browser | Table explorer with row counts and RLS status | /developer/tools/db |
| Audit Logs | Recent CREATE/UPDATE/DELETE events with actor info | /developer/tools/logs |
| Test Data Generator | Generate mock sessions and organizations | /developer/tools/test-data |

The individual tool pages were already moved in Phase 1. They should work as-is inside the new layout. If their styling conflicts with the new developer layout, adjust them to match.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 8: Shared Components for the Developer Portal

Build these developer-portal-specific components:

#### 8.1 CodeBlock

A dark-themed code block with:
- Syntax highlighting (use DM Mono)
- Copy-to-clipboard button (top-right)
- Optional filename header
- Optional line numbers
- Language label badge (top-left)

**Appearance:** `bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800 p-4 text-[13px] font-mono leading-relaxed`

#### 8.2 EndpointCard

For the API reference page:
- Method badge (GET green, POST blue, PUT amber, DELETE red, PATCH purple)
- Path in monospace
- Description
- Expandable sections: Auth, Request, Response, Example

#### 8.3 PropTable

For the component library page:
- Columns: Prop name, Type, Default, Required, Description
- Type column in monospace
- Required column as a green dot or dash

#### 8.4 TableOfContents (Sticky)

- Reads heading IDs from the page
- Highlights the currently visible section
- Fixed on the right side (`sticky top-20 w-48`)

#### 8.5 CopyButton

- Small icon button that copies parent text to clipboard
- Shows "Copied!" tooltip briefly after click

#### 8.6 DevBadge

- For showing environment, version, status
- Variants: environment (green/amber/red), version (neutral), status (success/warning/error)

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 9: Navigation & Cross-Linking

#### 9.1 Developer Sidebar Component

Create `src/components/developer/DevSidebar.tsx`:
- Renders the full navigation tree from the Navigation Sidebar spec above
- Highlights active route using `usePathname()`
- Collapsible sections with expand/collapse state (persist in sessionStorage)
- Collapse entire sidebar on mobile (hamburger toggle)

#### 9.2 Developer Breadcrumb

Show the path: `Developer Portal / Architecture / Database Schema`
Use the shared Breadcrumb component.

#### 9.3 Update Main App Navigation

Add a link to the Developer Portal in:
- Admin dashboard sidebar (if user has admin role)
- Dashboard header (small "Dev" link visible only to admins/developers)
- Remove or redirect old `/dashboard/developer` links

#### 9.4 Search (placeholder)

Add a search input in the developer portal top bar. For now, it filters sidebar navigation items client-side (simple string match on page titles). Full-text search across docs content is a future enhancement.

**Run `bun run build`. Confirm zero errors.**

---

### PHASE 10: Final Polish

#### 10.1 Loading States

Create `loading.tsx` for every developer portal route:
- `/developer/loading.tsx` — Card grid skeleton
- `/developer/design-system/loading.tsx` — Component gallery skeleton
- `/developer/api-reference/loading.tsx` — Endpoint list skeleton
- `/developer/architecture/loading.tsx` — Prose skeleton
- `/developer/components/loading.tsx` — Component cards skeleton
- `/developer/tools/loading.tsx` — Tool cards skeleton
- `/developer/tools/console/loading.tsx` — Console skeleton
- `/developer/tools/db/loading.tsx` — Table list skeleton
- `/developer/tools/logs/loading.tsx` — Log list skeleton

#### 10.2 Error Boundaries

Create `error.tsx` for the developer layout level. Catches any error in any sub-page and shows a clean error message with retry button.

#### 10.3 Metadata

Add proper Next.js metadata to every page:
```typescript
export const metadata = {
  title: 'API Reference — SlateCamp Developer Portal',
  description: 'Complete API documentation for SlateCamp route handlers and server actions.',
}
```

#### 10.4 Dark Mode

Verify every developer portal page works in dark mode. The code blocks should always be dark regardless of theme. The rest of the UI should respect the theme toggle.

#### 10.5 Responsive

The developer portal is primarily desktop (1280px+). Ensure:
- Sidebar collapses to hamburger on < 1024px
- Content area is readable on tablet (768px+)
- Code blocks scroll horizontally on narrow screens
- Tables scroll horizontally on narrow screens

**Run `bun run build` one final time. Confirm zero errors, zero warnings.**

---

## Critical Rules

1. **Read actual source files before documenting them.** Do not hallucinate API signatures, Zod schemas, or database columns. Open the actual file, read the actual code, and document what's there.

2. **Do not break existing functionality.** The dev tools (console, db browser, logs, test data) must work identically after the move. If a tool depends on being inside the dashboard layout for context providers, either re-provide those contexts in the developer layout or keep the tool pages as thin wrappers that import the original components.

3. **Auth guard must use `user_roles` table only.** No hardcoded emails, no domain checks. The developer layout guard should call `getUserRole()` and allow any role. In production, only users with explicit roles can access. In development (`NODE_ENV === 'development'`), access is always granted.

4. **Every code block must have a copy button.** This is a developer tool — engineers copy code constantly.

5. **Keep the documentation accurate and up to date.** Where possible, generate documentation from the actual source (read route files, read Zod schemas, read type definitions) rather than hardcoding strings that will drift. For static content (architecture descriptions, flow diagrams), use markdown with clear section anchors.

6. **Use Server Components by default.** The overview, design system, API reference, architecture, and component library pages are all read-only content — they should be Server Components. Only the dev tools (console, test data) and interactive elements (sidebar toggle, copy buttons, search filter) need `'use client'`.

7. **Commit after each phase** with a clear message: `feat: developer portal phase N — [description]`.

8. **Run `bun run build` after every phase.** This is non-negotiable.

