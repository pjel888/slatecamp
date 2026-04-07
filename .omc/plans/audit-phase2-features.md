# SlateCamp Phase 2 Audit: Feature Roster & Route Map

**Generated:** 2026-03-25
**Source of truth:** Codebase at commit `3f95202`

---

## 1. Complete Route Map

### 1.1 All page.tsx Files (97 total)

#### Auth Portal (4 pages)
| # | Route | Path |
|---|-------|------|
| 1 | `/login` | `src/app/(auth)/login/page.tsx` |
| 2 | `/register` | `src/app/(auth)/register/page.tsx` |
| 3 | `/onboarding` | `src/app/(auth)/onboarding/page.tsx` |
| 4 | `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` |

#### Marketing / Public Pages (8 pages)
| # | Route | Path |
|---|-------|------|
| 5 | `/` | `src/app/page.tsx` |
| 6 | `/pricing` | `src/app/pricing/page.tsx` |
| 7 | `/about` | `src/app/about/page.tsx` |
| 8 | `/contact` | `src/app/contact/page.tsx` |
| 9 | `/try` | `src/app/try/page.tsx` |
| 10 | `/tools` | `src/app/tools/page.tsx` |
| 11 | `/tools/floor-tiles-calculator` | `src/app/tools/floor-tiles-calculator/page.tsx` |
| 12 | `/tools/wall-paint-calculator` | `src/app/tools/wall-paint-calculator/page.tsx` |
| 13 | `/tools/lot-plotter` | `src/app/tools/lot-plotter/page.tsx` |

#### Dashboard Portal (33 pages)
| # | Route | Path |
|---|-------|------|
| 14 | `/dashboard` | `src/app/dashboard/page.tsx` |
| 15 | `/dashboard/wiki` | `src/app/dashboard/wiki/page.tsx` |
| 16 | `/dashboard/wiki/[slug]` | `src/app/dashboard/wiki/[slug]/page.tsx` |
| 17 | `/dashboard/testing` | `src/app/dashboard/testing/page.tsx` |
| 18 | `/dashboard/testing/camp/setup` | `src/app/dashboard/testing/camp/setup/page.tsx` |
| 19 | `/dashboard/testing/storm/setup` | `src/app/dashboard/testing/storm/setup/page.tsx` |
| 20 | `/dashboard/testing/chill/setup` | `src/app/dashboard/testing/chill/setup/page.tsx` |
| 21 | `/dashboard/testing/focus-review/setup` | `src/app/dashboard/testing/focus-review/setup/page.tsx` |
| 22 | `/dashboard/testing/endurance/setup` | `src/app/dashboard/testing/endurance/setup/page.tsx` |
| 23 | `/dashboard/testing/subject/setup` | `src/app/dashboard/testing/subject/setup/page.tsx` |
| 24 | `/dashboard/testing/custom/setup` | `src/app/dashboard/testing/custom/setup/page.tsx` |
| 25 | `/dashboard/testing/simulation/briefing` | `src/app/dashboard/testing/simulation/briefing/page.tsx` |
| 26 | `/dashboard/testing/simulation/[sessionId]/results` | `src/app/dashboard/testing/simulation/[sessionId]/results/page.tsx` |
| 27 | `/dashboard/testing/session/[sessionId]` | `src/app/dashboard/testing/session/[sessionId]/page.tsx` |
| 28 | `/dashboard/testing/session/[sessionId]/debrief` | `src/app/dashboard/testing/session/[sessionId]/debrief/page.tsx` |
| 29 | `/dashboard/notes` | `src/app/dashboard/notes/page.tsx` |
| 30 | `/dashboard/analytics` | `src/app/dashboard/analytics/page.tsx` |
| 31 | `/dashboard/3d-lab` | `src/app/dashboard/3d-lab/page.tsx` |
| 32 | `/dashboard/assessment` | `src/app/dashboard/assessment/page.tsx` |
| 33 | `/dashboard/score-reveal` | `src/app/dashboard/score-reveal/page.tsx` |
| 34 | `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` |
| 35 | `/dashboard/camptrails` | `src/app/dashboard/camptrails/page.tsx` |
| 36 | `/dashboard/camptrails/[slug]` | `src/app/dashboard/camptrails/[slug]/page.tsx` |
| 37 | `/dashboard/camptrails/[slug]/today` | `src/app/dashboard/camptrails/[slug]/today/page.tsx` |
| 38 | `/dashboard/camptrails/[slug]/day/[dayNumber]/complete` | `src/app/dashboard/camptrails/[slug]/day/[dayNumber]/complete/page.tsx` |
| 39 | `/dashboard/trails` | `src/app/dashboard/trails/page.tsx` (redirect to camptrails) |
| 40 | `/dashboard/trails/[slug]` | `src/app/dashboard/trails/[slug]/page.tsx` |
| 41 | `/dashboard/trails/[slug]/today` | `src/app/dashboard/trails/[slug]/today/page.tsx` |
| 42 | `/dashboard/trails/[slug]/day/[dayNumber]` | `src/app/dashboard/trails/[slug]/day/[dayNumber]/page.tsx` |
| 43 | `/dashboard/trails/[slug]/day/[dayNumber]/complete` | `src/app/dashboard/trails/[slug]/day/[dayNumber]/complete/page.tsx` |
| 44 | `/dashboard/upgrade` | `src/app/dashboard/upgrade/page.tsx` |
| 45 | `/dashboard/welcome-pro` | `src/app/dashboard/welcome-pro/page.tsx` |
| 46 | `/dashboard/exam-outcome` | `src/app/dashboard/exam-outcome/page.tsx` |
| 47 | `/dashboard/developer` | `src/app/dashboard/developer/page.tsx` |
| 48 | `/dashboard/developer/design-system` | `src/app/dashboard/developer/design-system/page.tsx` |
| 49 | `/dashboard/developer/console` | `src/app/dashboard/developer/console/page.tsx` |
| 50 | `/dashboard/developer/db` | `src/app/dashboard/developer/db/page.tsx` |
| 51 | `/dashboard/developer/docs` | `src/app/dashboard/developer/docs/page.tsx` |
| 52 | `/dashboard/developer/logs` | `src/app/dashboard/developer/logs/page.tsx` |
| 53 | `/dashboard/developer/test-data` | `src/app/dashboard/developer/test-data/page.tsx` |

#### Admin Portal (27 pages)
| # | Route | Path |
|---|-------|------|
| 54 | `/admin` | `src/app/admin/page.tsx` |
| 55 | `/admin/login` | `src/app/admin/login/page.tsx` |
| 56 | `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` (redirect to /admin) |
| 57 | `/admin/articles` | `src/app/admin/articles/page.tsx` |
| 58 | `/admin/articles/new` | `src/app/admin/articles/new/page.tsx` |
| 59 | `/admin/articles/[id]` | `src/app/admin/articles/[id]/page.tsx` |
| 60 | `/admin/questions` | `src/app/admin/questions/page.tsx` |
| 61 | `/admin/questions/new` | `src/app/admin/questions/new/page.tsx` |
| 62 | `/admin/questions/[id]` | `src/app/admin/questions/[id]/page.tsx` |
| 63 | `/admin/questions/import` | `src/app/admin/questions/import/page.tsx` |
| 64 | `/admin/questions/analytics` | `src/app/admin/questions/analytics/page.tsx` |
| 65 | `/admin/taxonomy` | `src/app/admin/taxonomy/page.tsx` |
| 66 | `/admin/taxonomy/coverage` | `src/app/admin/taxonomy/coverage/page.tsx` |
| 67 | `/admin/content` | `src/app/admin/content/page.tsx` |
| 68 | `/admin/content/new` | `src/app/admin/content/new/page.tsx` |
| 69 | `/admin/content/[id]` | `src/app/admin/content/[id]/page.tsx` |
| 70 | `/admin/wiki` | `src/app/admin/wiki/page.tsx` |
| 71 | `/admin/wiki/new` | `src/app/admin/wiki/new/page.tsx` |
| 72 | `/admin/wiki/[id]` | `src/app/admin/wiki/[id]/page.tsx` |
| 73 | `/admin/pipeline` | `src/app/admin/pipeline/page.tsx` |
| 74 | `/admin/reviews` | `src/app/admin/reviews/page.tsx` |
| 75 | `/admin/assets` | `src/app/admin/assets/page.tsx` |
| 76 | `/admin/assets/[id]` | `src/app/admin/assets/[id]/page.tsx` |
| 77 | `/admin/search` | `src/app/admin/search/page.tsx` |
| 78 | `/admin/settings` | `src/app/admin/settings/page.tsx` |
| 79 | `/admin/activity` | `src/app/admin/activity/page.tsx` |
| 80 | `/admin/audit` | `src/app/admin/audit/page.tsx` |

#### CEO Portal (4 pages)
| # | Route | Path |
|---|-------|------|
| 81 | `/ceo` | `src/app/(protected)/ceo/page.tsx` |
| 82 | `/ceo/financials` | `src/app/(protected)/ceo/financials/page.tsx` |
| 83 | `/ceo/insights` | `src/app/(protected)/ceo/insights/page.tsx` |
| 84 | `/ceo/team` | `src/app/(protected)/ceo/team/page.tsx` |

#### Developer Portal (21 pages)
| # | Route | Path |
|---|-------|------|
| 85 | `/developer` | `src/app/developer/page.tsx` |
| 86 | `/developer/design-system` | `src/app/developer/design-system/page.tsx` |
| 87 | `/developer/design-system/wiki/[component]` | `src/app/developer/design-system/wiki/[component]/page.tsx` |
| 88 | `/developer/design-system/questions/[component]` | `src/app/developer/design-system/questions/[component]/page.tsx` |
| 89 | `/developer/design-system/testing-path/[component]` | `src/app/developer/design-system/testing-path/[component]/page.tsx` |
| 90 | `/developer/design-system/shared/[component]` | `src/app/developer/design-system/shared/[component]/page.tsx` |
| 91 | `/developer/design-system/content-blocks` | `src/app/developer/design-system/content-blocks/page.tsx` |
| 92 | `/developer/design-system/content-blocks/[component]` | `src/app/developer/design-system/content-blocks/[component]/page.tsx` |
| 93 | `/developer/design-system/widgets` | `src/app/developer/design-system/widgets/page.tsx` |
| 94 | `/developer/design-system/widgets/[component]` | `src/app/developer/design-system/widgets/[component]/page.tsx` |
| 95 | `/developer/api-reference` | `src/app/developer/api-reference/page.tsx` |
| 96 | `/developer/architecture` | `src/app/developer/architecture/page.tsx` |
| 97 | `/developer/components` | `src/app/developer/components/page.tsx` |
| 98 | `/developer/status` | `src/app/developer/status/page.tsx` |
| 99 | `/developer/status/database` | `src/app/developer/status/database/page.tsx` |
| 100 | `/developer/status/infrastructure` | `src/app/developer/status/infrastructure/page.tsx` |
| 101 | `/developer/tools` | `src/app/developer/tools/page.tsx` |
| 102 | `/developer/tools/console` | `src/app/developer/tools/console/page.tsx` |
| 103 | `/developer/tools/db` | `src/app/developer/tools/db/page.tsx` |
| 104 | `/developer/tools/logs` | `src/app/developer/tools/logs/page.tsx` |
| 105 | `/developer/tools/test-data` | `src/app/developer/tools/test-data/page.tsx` |

**NOTE:** `/dashboard/developer/*` routes duplicate `/developer/*` routes. Both exist in the codebase. The canonical location is `/developer/*` based on middleware and ROUTES constant.

### 1.2 Layout Files (13 total)

| Path | Scope |
|------|-------|
| `src/app/layout.tsx` | Root (fonts, providers) |
| `src/app/admin/layout.tsx` | Admin shell (sidebar) |
| `src/app/admin/search/layout.tsx` | Admin search |
| `src/app/dashboard/layout.tsx` | Dashboard shell (sidebar) |
| `src/app/dashboard/3d-lab/layout.tsx` | 3D Lab (full-screen) |
| `src/app/dashboard/analytics/layout.tsx` | Analytics |
| `src/app/dashboard/developer/layout.tsx` | Legacy developer |
| `src/app/dashboard/notes/layout.tsx` | Notes |
| `src/app/dashboard/score-reveal/layout.tsx` | Score Reveal |
| `src/app/dashboard/testing/layout.tsx` | Testing hub |
| `src/app/dashboard/wiki/layout.tsx` | Wiki (sidebar tree) |
| `src/app/(protected)/ceo/layout.tsx` | CEO portal shell |
| `src/app/developer/layout.tsx` | Developer portal shell |

### 1.3 Loading Files: 88 total
### 1.4 Error Files: 8 total

| Path | Scope |
|------|-------|
| `src/app/error.tsx` | Root |
| `src/app/admin/error.tsx` | Admin |
| `src/app/(auth)/error.tsx` | Auth |
| `src/app/dashboard/error.tsx` | Dashboard |
| `src/app/dashboard/3d-lab/error.tsx` | 3D Lab |
| `src/app/dashboard/testing/session/[sessionId]/error.tsx` | Session |
| `src/app/dashboard/testing/session/[sessionId]/debrief/error.tsx` | Debrief |
| `src/app/developer/error.tsx` | Developer |

### 1.5 Not-Found Files: 4 total

| Path | Scope |
|------|-------|
| `src/app/not-found.tsx` | Root |
| `src/app/dashboard/not-found.tsx` | Dashboard |
| `src/app/developer/not-found.tsx` | Developer |
| `src/app/developer/design-system/not-found.tsx` | Design System |

### 1.6 API Route Handlers (12 total)

| Method | Path | Purpose |
|--------|------|---------|
| * | `/api/admin/flags` | Feature flag management |
| * | `/api/ai/embed` | AI text embedding |
| * | `/api/ai/generate-questions` | AI question generation |
| * | `/api/ai/study-agent` | AI study agent |
| * | `/api/ai/tutor` | AI contextual tutor |
| * | `/api/cron/blindspot-scan` | Cron: blindspot scan |
| * | `/api/cron/compute-signals` | Cron: compute engagement signals |
| * | `/api/debug-taxonomy` | Debug: taxonomy viewer |
| * | `/api/payments/checkout` | LemonSqueezy/PayRex checkout |
| * | `/api/webhooks/payrex` | PayRex webhook |
| * | `/api/webhooks/lemonsqueezy` | LemonSqueezy webhook |
| * | `/auth/callback` | Supabase OAuth callback |

### 1.7 Summary Counts

| Type | Count |
|------|-------|
| page.tsx | ~105 (incl. duplicated developer routes) |
| layout.tsx | 13 |
| loading.tsx | 88 |
| error.tsx | 8 |
| not-found.tsx | 4 |
| route.ts (API) | 12 |

---

## 2. Middleware Analysis

**File:** `middleware.ts` + `src/lib/supabase/middleware.ts`

### Auth Pattern
- Supabase cookie-based SSR auth (`@supabase/ssr`)
- `getUser()` called on every non-static, non-API request
- Demo mode bypass: if `isDemoMode()`, redirects login/register to dashboard

### Route Protection Matrix

| Route Pattern | Protection | Role Required |
|---------------|-----------|---------------|
| `/`, `/pricing`, `/about`, `/contact`, `/try`, `/tools/*` | Public | None |
| `/login`, `/register`, `/forgot-password` | Public (redirects to dashboard if logged in) | None |
| `/admin/login` | Public (redirects to admin if admin, dashboard otherwise) | None |
| `/dashboard/*` | Authenticated | Any logged-in user |
| `/admin/*` | Authenticated + Role | `canReviewContent()` (content_admin, sme_reviewer, super_admin) |
| `/ceo/*` | Authenticated + Role | `ceo` or `super_admin` (from profiles.role) |
| `/developer/*` | Authenticated + Role | Any role in `user_roles` table |
| `/api/*` | Bypassed by middleware | Handled per-route |

### Role-Based Routing
- **Admin:** `user_roles` table with `canReviewContent()` check
- **CEO:** `profiles.role` field, requires `ceo` or `super_admin`
- **Developer:** Requires at least one entry in `user_roles`
- **Dashboard:** Any authenticated user

---

## 3. Server Actions Inventory

**Total exported functions across action files:** ~212 across 57 files

### By Domain

| Domain | Files | Key Functions |
|--------|-------|---------------|
| **Quiz/Testing** | `quiz.ts`, `testing.ts`, `sessions.ts`, `session-actions.ts`, `session-discovery.ts`, `session-insights.ts` | 33 exports — session creation, answer submission, mode routing |
| **Trails** | `trails.ts` | 17 exports — enrollment, day completion, progress tracking |
| **Wiki** | `wiki.ts`, `wiki-actions.ts`, `wiki-reads.ts`, `wiki-bookmarks.ts` | 18 exports — article fetching, read tracking, bookmarks |
| **Admin Content** | `admin/content.ts`, `admin/wiki.ts`, `admin/wiki-queries.ts`, `admin/questions.ts`, `admin/question-queries.ts` | 26 exports — CRUD for articles/questions |
| **Admin Operations** | `admin/taxonomy.ts`, `admin/pipeline.ts`, `admin/assets.ts`, `admin/bulk.ts`, `admin/coverage.ts`, `admin/dashboard.ts`, `admin/roles.ts` | 22 exports — taxonomy, pipeline, assets, roles, coverage |
| **Analytics/Stats** | `analytics.ts`, `stats-actions.ts`, `user-stats.ts`, `readiness.ts`, `readiness-score-update.ts`, `heatmap.ts` | 17 exports — readiness scoring, heatmaps, analytics data |
| **Mastery/SRS** | `mastery.ts`, `mastery-actions.ts`, `srs-review.ts`, `srs-dashboard.ts` | 7 exports — IRT mastery, spaced repetition |
| **Dashboard** | `dashboard.ts`, `dashboard-page.ts`, `dashboard-helpers.ts` | 9 exports — dashboard data aggregation |
| **CEO** | `ceo/financial-actions.ts`, `ceo/team-actions.ts`, `ceo/export-actions.ts` | 9 exports — financials, team, CSV export |
| **Assessment** | `assessment.ts` | 4 exports — diagnostic quiz, results |
| **Notes** | `notes-actions.ts` | 7 exports — CRUD for notes |
| **AI/Pedagogy** | `ei-prompts.ts`, `teach-back.ts` | 6 exports — elaborative interrogation, teach-back |
| **Profile/Auth** | `profile.ts`, `onboarding.ts`, `email-preferences.ts` | 7 exports |
| **Engagement** | `streak.ts`, `social-proof.ts`, `daily-mission.ts` | 8 exports |
| **Dev Tools** | `dev/test-data.ts`, `dev/db-viewer.ts`, `feature-flags.ts` | 5 exports |
| **Other** | `debrief.ts`, `lab.ts`, `taxonomy.ts`, `final-stretch.ts` | 5 exports |

---

## 4. Portal-by-Portal Feature Audit

### 4.1 Dashboard Portal (Student-Facing)

#### Wiki
| Capability | Status | Notes |
|-----------|--------|-------|
| Browse by taxonomy tree | **Implemented** | WikiSidebar with taxonomy hierarchy |
| Read articles | **Implemented** | `/dashboard/wiki/[slug]` renders full articles |
| Search articles | **Partial** | Sidebar-based, no dedicated search page in dashboard |
| Bookmarks | **Implemented** | `wiki-bookmarks.ts` actions exist |
| Read tracking | **Implemented** | `wiki-reads.ts` tracks article views |
| Elaborative interrogation | **Implemented** | `ElaborativeInterrogation.tsx` component |
| Teach-back prompts | **Implemented** | `TeachBackPrompt.tsx` component |
| Interactive widgets (3D) | **Implemented** | 10+ widgets in `widgets/dsgn013/` |
| Empty state | **Implemented** | WikiPage shows feature grid when no article selected |

#### Testing Modes
| Mode | Route | Status | Notes |
|------|-------|--------|-------|
| Camp (balanced practice) | `/testing/camp/setup` | **Implemented** | Setup + session + debrief |
| Storm (timed pressure) | `/testing/storm/setup` | **Implemented** | Setup + session + debrief |
| Chill (relaxed review) | `/testing/chill/setup` | **Implemented** | Setup + session + debrief |
| Focus Review (blindspot) | `/testing/focus-review/setup` | **Implemented** | Fetches weak nodes, targets gaps |
| Extended Practice (endurance) | `/testing/endurance/setup` | **Implemented** | Fatigue threshold tracking |
| Subject Drill | `/testing/subject/setup` | **Implemented** | Per-subject mastery drill |
| Custom | `/testing/custom/setup` | **Implemented** | Fully configurable |
| Full Exam Simulation | `/testing/simulation/briefing` | **Implemented** | Gated at 65% readiness, 24h cold delivery |
| Session Shell | `/testing/session/[id]` | **Implemented** | Resume support, answer saving |
| Debrief | `/testing/session/[id]/debrief` | **Implemented** | Score delta, mastery changes, question review |
| Review Hub | `/testing` | **Implemented** | Mode cards, in-progress resume, suggestions |

**Testing: 7 modes implemented (exceeds original 4-mode spec with 3 bonus modes).**

#### Notes
| Capability | Status | Notes |
|-----------|--------|-------|
| Create notes | **Implemented** | 7 exported actions in `notes-actions.ts` |
| Edit notes | **Implemented** | Rich editor via `NotesEditor.tsx` |
| Pin notes | **Implemented** | `is_pinned` field supported |
| Folders | **Implemented** | `note_folders` table queried |
| Link to articles/questions | **Implemented** | `article_id`, `question_id`, `topic_id` fields |
| Tags | **Implemented** | `tags` array field |

#### Analytics
| Metric | Status | Notes |
|--------|--------|-------|
| Summary metrics | **Implemented** | `SummarySection` |
| Readiness trajectory | **Implemented** | `ReadinessSection` (line chart over time) |
| Pacing quadrant | **Implemented** | `PacingQuadrantSection` (signature feature) |
| Stamina curve | **Implemented** | `StaminaSection` |
| Subject radar | **Implemented** | `RadarSection` |
| Memory health | **Implemented** | `MemorySection` (SRS decay) |
| Pacing insights | **Implemented** | `PacingInsightsSection` |
| Timeline heatmap | **Implemented** | `TimelineHeatmapSection` (GitHub-style) |

**Analytics: 8 distinct visualization sections. Very comprehensive.**

#### 3D Lab
| Capability | Status | Notes |
|-----------|--------|-------|
| Module gallery | **Implemented** | `ModuleGallery` component |
| 3D model viewer | **Implemented** | `ModuleViewer` with R3F |
| Tier gating | **Implemented** | Camp/Insurance/Institutional only |
| Paywall fallback | **Implemented** | Shows upgrade CTA for free users |

#### Assessment (Diagnostic Quiz)
| Capability | Status | Notes |
|-----------|--------|-------|
| Initial diagnostic | **Implemented** | 20-question calibration quiz |
| Score reveal | **Implemented** | Animated score + subject breakdown |
| One-time gate (free) | **Implemented** | `checkScoreRevealAccess()` |
| Trail recommendation | **Implemented** | `recommendTrail()` after assessment |

#### Camp Trails (Structured Study)
| Capability | Status | Notes |
|-----------|--------|-------|
| Trail library | **Implemented** | Browse published trails |
| Enrollment | **Implemented** | Active enrollment banner |
| Daily study | **Implemented** | `/camptrails/[slug]/today` |
| Day completion | **Implemented** | `/camptrails/[slug]/day/[dayNumber]/complete` |
| Recommendations | **Implemented** | AI-powered trail recommendation |
| Dashboard integration | **Implemented** | `DashboardTrailCard` + `DashboardTrailPrompt` |

#### Settings
| Capability | Status | Notes |
|-----------|--------|-------|
| Discipline selection | **Implemented** | `DisciplineCard` |
| Theme toggle | **Implemented** | `ThemeCard` |
| Logout | **Implemented** | `LogoutCard` |
| Billing/subscription | **Missing** | Route defined (`SETTINGS_BILLING`) but no page.tsx |
| Profile editing | **Missing** | No name/email/avatar editing |
| Notification preferences | **Missing** | `email-preferences.ts` actions exist but no UI |

#### Other Dashboard Features
| Feature | Status | Notes |
|---------|--------|-------|
| Onboarding state card | **Implemented** | Shows next step for new users |
| Streak ribbon | **Implemented** | Current streak + status |
| SRS review widget | **Implemented** | Items due for review |
| Subject floor alert | **Implemented** | Warns when subjects fall below threshold |
| Locked score widget | **Implemented** | Paywall nudge for score updates |
| Welcome Pro | **Implemented** | Pro confirmation with unblurred heatmap |
| Upgrade page | **Implemented** | Feature comparison, GCash-first pricing |
| Exam outcome survey | **Implemented** | Post-exam data collection |

### 4.2 Admin Portal

| Feature | Route(s) | Status | Notes |
|---------|----------|--------|-------|
| Dashboard overview | `/admin` | **Implemented** | Stat cards, coverage alerts, quick actions, activity feed |
| Article list | `/admin/articles` | **Implemented** | Table with coverage data |
| Article create | `/admin/articles/new` | **Implemented** | MDX editor |
| Article edit | `/admin/articles/[id]` | **Implemented** | Full editor with properties panel |
| Question list | `/admin/questions` | **Implemented** | Filterable table |
| Question create | `/admin/questions/new` | **Implemented** | Form with taxonomy picker |
| Question edit | `/admin/questions/[id]` | **Implemented** | Full editor |
| Question import | `/admin/questions/import` | **Implemented** | Bulk spreadsheet import |
| Question analytics | `/admin/questions/analytics` | **Implemented** | Difficulty distribution, quality metrics |
| Taxonomy editor | `/admin/taxonomy` | **Implemented** | Tree editor for discipline > subject > topic |
| Coverage map | `/admin/taxonomy/coverage` | **Implemented** | Visual coverage heatmap |
| Content editor (unified) | `/admin/content`, `/admin/content/new`, `/admin/content/[id]` | **Implemented** | Unified editor with outline, article, and questions panels |
| Wiki editor (legacy) | `/admin/wiki`, `/admin/wiki/new`, `/admin/wiki/[id]` | **Implemented** | Older wiki-specific editor |
| Publishing pipeline | `/admin/pipeline` | **Implemented** | Kanban-style draft > review > published |
| SME review queue | `/admin/reviews` | **Implemented** | Content approval workflow |
| 3D asset manager | `/admin/assets`, `/admin/assets/[id]` | **Implemented** | Upload + manage 3D models |
| Global search | `/admin/search` | **Implemented** | Cross-content search |
| Settings (roles) | `/admin/settings` | **Implemented** | User role management (super_admin only) |
| Activity feed | `/admin/activity` | **Implemented** | Full audit log timeline |
| Audit log | `/admin/audit` | **Implemented** | Super admin audit viewer |
| Bulk actions | N/A (component) | **Implemented** | `BulkActionBar.tsx` + `bulk.ts` actions |
| Needs attention card | N/A (component) | **Implemented** | `NeedsAttentionCard.tsx` on dashboard |

**Admin: 14 distinct feature areas. Content pipeline is comprehensive.**

### 4.3 CEO Portal

| Feature | Route | Status | Notes |
|---------|-------|--------|-------|
| Command center | `/ceo` | **Implemented** | MRR, ARR, runway, paying users, conversion, engagement, unit economics |
| Financials | `/ceo/financials` | **Implemented** | Revenue/expense charts, P&L, expense breakdown, ledger, runway projection |
| Behavioral insights | `/ceo/insights` | **Implemented** | DAU/WAU/MAU, cohort retention, churn risk, time-to-value funnel, churn signals |
| Team management | `/ceo/team` | **Implemented** | Roster, department cost allocation, add member (button only, no form) |
| Export | N/A (component) | **Implemented** | `ExportButton` + `export-actions.ts` |

**CEO: All 4 pages fully built with real data queries.**

### 4.4 Developer Portal

| Feature | Route | Status | Notes |
|---------|-------|--------|-------|
| Portal home | `/developer` | **Implemented** | Section cards, system health, quick actions, metrics, tech stack, changelog |
| Design system | `/developer/design-system` | **Implemented** | Domain-organized component catalog |
| Component pages | `/developer/design-system/[domain]/[component]` | **Implemented** | Live preview + props table (6 domains) |
| API reference | `/developer/api-reference` | **Implemented** | Route handlers, server actions, webhooks |
| Architecture docs | `/developer/architecture` | **Implemented** | Tech stack, schema, auth flow, data patterns |
| Components index | `/developer/components` | **Implemented** | Component listing |
| System status | `/developer/status` | **Implemented** | Service status, uptime bars |
| DB status | `/developer/status/database` | **Implemented** | Database health |
| Infrastructure | `/developer/status/infrastructure` | **Implemented** | Infrastructure metrics |
| Dev tools home | `/developer/tools` | **Implemented** | Feature flags, impersonation, test data |
| Console | `/developer/tools/console` | **Implemented** | Dev console |
| DB viewer | `/developer/tools/db` | **Implemented** | Database browser |
| Logs | `/developer/tools/logs` | **Implemented** | Application logs |
| Test data gen | `/developer/tools/test-data` | **Implemented** | Generate test data |

**Developer: Full-featured internal portal with 14 distinct sections.**

---

## 5. Marketing Pages

| Page | Status | Notes |
|------|--------|-------|
| Landing `/` | **Implemented** | Full content with SEO metadata, Suspense boundary, ALE-specific copy |
| Pricing `/pricing` | **Implemented** | `PricingContent` component, MarketingNav + MarketingFooter |
| About `/about` | **Stub** | "Coming Soon" placeholder only |
| Contact `/contact` | **Stub** | "Coming Soon" placeholder only |
| Try `/try` | **Implemented** | Pre-assessment teaser: 5 sample questions, no auth required |
| Tools `/tools` | **Implemented** | Free architecture tools hub (SEO play) |
| Floor Tiles Calculator | **Implemented** | Full calculator tool |
| Wall Paint Calculator | **Implemented** | Full calculator tool |
| Lot Plotter | **Implemented** | Full planning tool |

---

## 6. Onboarding Flow Analysis

### Registration-to-First-Quiz Path

```
/try (5 free questions, no auth)
  -> "Create account to see your score"
    -> /register (Google OAuth or email)
      -> /onboarding (discipline, reviewer type, exam date, study window)
        -> /dashboard (OnboardingStateCard: "needs_assessment")
          -> /dashboard/assessment (20-question diagnostic)
            -> /dashboard/score-reveal (animated readiness score)
              -> /dashboard (OnboardingStateCard: "ready")
```

### Onboarding States (from code)
1. `needs_assessment` — Has not taken diagnostic
2. `needs_score_reveal` — Assessment done, needs to see score
3. `ready` — Fully onboarded

### Reviewer Types Supported
- `first_taker` — Exam date + study window
- `returning_reviewer` — Struggled subjects + exam date + study window
- `undergrad` — School/institution + study window
- `dae` — Study window only

### Empty States
- **Dashboard:** `OnboardingStateCard` guides user to next step
- **Wiki:** Feature grid with instructions to use sidebar
- **Trails:** "Trails are being prepared" with suggestion to use Camp Mode
- **Testing:** `ReviewHub` shows mode cards even with no history
- **Analytics:** Charts show empty/zero states gracefully (Suspense skeletons)

### Assessment
- **Verdict:** The try -> register -> onboard -> assess -> score reveal funnel is fully implemented. The "aha moment" (seeing your Readiness Score) can be reached within 30 minutes.

---

## 7. Route Coverage Gaps

### Pages WITHOUT loading.tsx

| Page | Missing loading.tsx |
|------|-------------------|
| `/dashboard/trails/[slug]/day/[dayNumber]` | Yes |
| `/dashboard/camptrails/[slug]/day/[dayNumber]/complete` | Yes (but `/trails/` version has one) |
| Several `/developer/design-system/content-blocks/` and `/developer/design-system/widgets/` pages | Yes (index pages only) |
| `/about` | Yes |
| `/contact` | Yes |
| `/pricing` | Yes |
| `/try` | Yes |

**Total pages with loading.tsx: 88 / ~105 = 84% coverage**

### Pages WITHOUT error.tsx

Most pages rely on parent error boundaries. Only 8 explicit error.tsx files exist for ~105 pages.

**Coverage by portal:**
- Root: 1 (catches everything)
- Dashboard: 1 (catches all dashboard) + 2 (session, debrief)
- Admin: 1 (catches all admin)
- Auth: 1 (catches all auth)
- Developer: 1 (catches all developer)
- CEO: 0 (falls through to root)
- Marketing: 0 (falls through to root)

**CEO portal has no error boundary.** Falls through to root, which may show an unexpected error page.

### Pages WITHOUT not-found.tsx

Only 4 not-found files exist:
- Root, Dashboard, Developer, Developer Design System

**Missing not-found.tsx:**
- Admin (dynamic routes `/admin/articles/[id]`, `/admin/questions/[id]`, etc.)
- CEO
- All marketing pages

### Route Groups Without layout.tsx
- `(auth)` group has no layout.tsx (each page is standalone)
- `(protected)` group has no layout.tsx (CEO layout is at `/ceo/layout.tsx`)

---

## 8. Feature Gap Analysis: Exam Prep Market

### Feature Gap Matrix

| Feature | Market Expectation | SlateCamp Status | Score | Notes |
|---------|-------------------|-----------------|-------|-------|
| **Question Bank** | Large, categorized, searchable | **Strong** | 90% | Full CRUD, taxonomy-mapped, import tool, quality analytics |
| **Adaptive Learning** | AI-powered difficulty adjustment | **Strong** | 85% | IRT 2PL model, blindspot scan, focus review mode |
| **Progress Analytics** | Detailed dashboard | **Excellent** | 95% | 8 visualization types, readiness trajectory, pacing quadrant |
| **Study Scheduling / Pacing** | Study plan + pacing | **Strong** | 80% | Camp Trails with daily prescriptions, pacing insights |
| **Mobile Experience** | Responsive or PWA | **Partial** | 60% | Responsive Tailwind, mobile drawer sidebar, no PWA/offline |
| **Collaborative Features** | Study groups, forums | **Absent** | 0% | No social features whatsoever |
| **Content Library** | Comprehensive reference | **Excellent** | 95% | Wiki with taxonomy, interactive widgets, 3D models, citations |
| **Practice Exams** | Realistic simulations | **Strong** | 85% | Full exam simulation with 65% readiness gate + 24h cold delivery |
| **AI Tutor** | Contextual explanations | **Implemented** | 75% | `/api/ai/tutor`, `AITutorDrawer.tsx`, temp=0 with citations |
| **Offline Mode** | Study without internet | **Absent** | 0% | No service worker, no PWA manifest |
| **Spaced Repetition** | SRS scheduling | **Implemented** | 70% | `srs-review.ts`, `SrsReviewWidget`, dashboard integration |
| **Performance Tracking** | Historical performance | **Excellent** | 90% | Readiness score, streak, mastery weights, session history |
| **Personalized Recommendations** | Smart suggestions | **Strong** | 80% | Trail recommendations, weak node targeting, subject suggestions |
| **Payment/Subscription** | Seamless billing | **Partial** | 55% | LemonSqueezy + PayRex routes exist, upgrade page built, but GCash/Card buttons are non-functional (no onClick handlers) |
| **Onboarding** | Smooth first experience | **Strong** | 85% | 4-step funnel with try-before-signup, reviewer type detection |

### Competitive Score Summary

| Category | Score |
|----------|-------|
| Core Learning Experience | 88% |
| Content Quality Tools (Admin) | 92% |
| Business Intelligence (CEO) | 85% |
| Marketing/Acquisition | 55% |
| Monetization | 45% |
| Social/Collaborative | 0% |
| **Weighted Average** | **72%** |

---

## 9. Feature Roster Table

| Feature | Route(s) | Portal | Category | Completeness | Missing States | Notes |
|---------|----------|--------|----------|-------------|----------------|-------|
| Landing Page | `/` | Marketing | Activation/Onboarding | 90% | None | Full SEO, Suspense, ALE-specific |
| Try (Pre-Assessment) | `/try` | Marketing | Activation/Onboarding | 85% | No persistence for anonymous answers | Duolingo-style delayed signup |
| Pricing | `/pricing` | Marketing | Monetization | 70% | No plan comparison details visible without reading code | Has content but stub-feeling |
| About | `/about` | Marketing | Supporting System | 5% | Everything | "Coming Soon" stub |
| Contact | `/contact` | Marketing | Supporting System | 5% | Everything | "Coming Soon" stub |
| Free Tools (3) | `/tools/*` | Marketing | Activation/Onboarding | 80% | No account linking | SEO acquisition play |
| Login | `/login` | Auth | Supporting System | 90% | No magic link, no remember me | Google OAuth + email |
| Register | `/register` | Auth | Activation/Onboarding | 90% | No email verification UI | Growth-framed copy |
| Forgot Password | `/forgot-password` | Auth | Supporting System | 75% | Unknown UI completeness | Route exists |
| Onboarding | `/onboarding` | Auth | Activation/Onboarding | 95% | Missing progress bar for steps 2-3 | 4 reviewer types, exam date, study window |
| Dashboard Home | `/dashboard` | Dashboard | Core Value Driver | 90% | 3 placeholder colored divs in content grid | Hero + heatmap + activity + trails + SRS |
| Wiki Browser | `/dashboard/wiki` | Dashboard | Core Value Driver | 90% | No full-text search page | Taxonomy sidebar, interactive widgets |
| Wiki Article | `/dashboard/wiki/[slug]` | Dashboard | Core Value Driver | 95% | None significant | Rich rendering, citations, widgets |
| Testing Hub | `/dashboard/testing` | Dashboard | Core Value Driver | 95% | None | 7 modes, resume, suggestions |
| Camp Mode | `/dashboard/testing/camp/setup` | Dashboard | Core Value Driver | 95% | None | Balanced practice |
| Storm Mode | `/dashboard/testing/storm/setup` | Dashboard | Core Value Driver | 95% | None | Timed pressure |
| Chill Mode | `/dashboard/testing/chill/setup` | Dashboard | Core Value Driver | 95% | None | Relaxed review |
| Focus Review | `/dashboard/testing/focus-review/setup` | Dashboard | Core Value Driver | 95% | None | Blindspot targeting |
| Endurance Mode | `/dashboard/testing/endurance/setup` | Dashboard | Core Value Driver | 90% | Fatigue detection TBD | Extended practice |
| Subject Drill | `/dashboard/testing/subject/setup` | Dashboard | Core Value Driver | 90% | None | Per-subject targeting |
| Custom Mode | `/dashboard/testing/custom/setup` | Dashboard | Core Value Driver | 85% | Configuration limits unknown | Fully configurable |
| Exam Simulation | `/dashboard/testing/simulation/briefing` | Dashboard | Core Value Driver | 90% | 24h wait for results | Gated at 65% readiness |
| Quiz Session | `/dashboard/testing/session/[id]` | Dashboard | Core Value Driver | 95% | None | Resume, auto-save, flagging |
| Debrief | `/dashboard/testing/session/[id]/debrief` | Dashboard | Core Value Driver | 95% | None | Score delta, mastery, question review |
| Notes | `/dashboard/notes` | Dashboard | Retention/Engagement | 85% | No rich formatting preview in list | CRUD, folders, pins, tags |
| Analytics | `/dashboard/analytics` | Dashboard | Core Value Driver | 95% | None | 8 chart sections, comprehensive |
| 3D Lab | `/dashboard/3d-lab` | Dashboard | Core Value Driver | 80% | Content dependent on uploaded models | Gallery + viewer, tier-gated |
| Assessment | `/dashboard/assessment` | Dashboard | Activation/Onboarding | 90% | No retry flow for reassessment | 20-question diagnostic |
| Score Reveal | `/dashboard/score-reveal` | Dashboard | Activation/Onboarding | 90% | None | Animated, trail recommendation |
| Camp Trails | `/dashboard/camptrails` | Dashboard | Core Value Driver | 85% | No progress visualization in library | Daily prescriptions, enrollment |
| Settings | `/dashboard/settings` | Dashboard | Supporting System | 50% | No billing, profile edit, notifications | Discipline + theme + logout only |
| Upgrade | `/dashboard/upgrade` | Dashboard | Monetization | 60% | Payment buttons non-functional | Feature comparison, pricing |
| Welcome Pro | `/dashboard/welcome-pro` | Dashboard | Monetization | 85% | None | Unblurred heatmap reveal |
| Exam Outcome | `/dashboard/exam-outcome` | Dashboard | Retention/Engagement | 80% | No follow-up after submission | Post-exam survey |
| Admin Dashboard | `/admin` | Admin | Supporting System | 95% | None | Stats, alerts, quick actions, activity |
| Articles CRUD | `/admin/articles/*` | Admin | Core Value Driver | 95% | None | Full CRUD with coverage data |
| Questions CRUD | `/admin/questions/*` | Admin | Core Value Driver | 95% | None | Full CRUD + import + analytics |
| Taxonomy Editor | `/admin/taxonomy` | Admin | Core Value Driver | 90% | No drag-and-drop reordering | Tree editor |
| Coverage Map | `/admin/taxonomy/coverage` | Admin | Core Value Driver | 90% | None | Visual heatmap |
| Content Editor | `/admin/content/*` | Admin | Core Value Driver | 90% | None | Unified article + questions editor |
| Pipeline | `/admin/pipeline` | Admin | Supporting System | 85% | No drag-and-drop between columns | Kanban-style workflow |
| Reviews | `/admin/reviews` | Admin | Supporting System | 85% | None | SME review queue |
| Assets | `/admin/assets` | Admin | Supporting System | 80% | No bulk upload | 3D asset management |
| Search | `/admin/search` | Admin | Supporting System | 80% | Unknown search quality | Global content search |
| Settings (Roles) | `/admin/settings` | Admin | Supporting System | 75% | No self-serve role request | Super admin role management |
| Activity Feed | `/admin/activity` | Admin | Supporting System | 85% | No filtering by action type | Full timeline |
| Audit Log | `/admin/audit` | Admin | Supporting System | 80% | No export | Super admin only |
| CEO Command Center | `/ceo` | CEO | Supporting System | 90% | None | MRR, ARR, conversion, engagement |
| CEO Financials | `/ceo/financials` | CEO | Supporting System | 90% | No data entry UI (read-only) | P&L, expenses, runway |
| CEO Insights | `/ceo/insights` | CEO | Supporting System | 90% | None | Cohort retention, churn, funnel |
| CEO Team | `/ceo/team` | CEO | Supporting System | 75% | Add member button has no form/action | Roster + cost allocation |
| Developer Home | `/developer` | Developer | Supporting System | 90% | Static health data | Portal overview |
| Design System | `/developer/design-system/*` | Developer | Supporting System | 90% | None | 6 domains, live previews |
| API Reference | `/developer/api-reference` | Developer | Supporting System | 85% | Some endpoints may be outdated | Route handlers documented |
| Architecture | `/developer/architecture` | Developer | Supporting System | 85% | May drift from reality | Tech stack, schema, patterns |
| Status Dashboard | `/developer/status/*` | Developer | Supporting System | 70% | Mock data, not real monitoring | Uptime bars, service status |
| Dev Tools | `/developer/tools/*` | Developer | Supporting System | 80% | None | Console, DB, logs, test data |

---

## 10. Potentially Orphaned / Incomplete Features

### Duplicate Route Trees
- **`/dashboard/developer/*`** duplicates **`/developer/*`**. Both have pages, loading states. The canonical routes (per middleware and `ROUTES` constant) point to `/developer/*`. The `/dashboard/developer/*` tree appears to be a legacy holdover.

- **`/admin/wiki/*`** and **`/admin/content/*`** appear to overlap with **`/admin/articles/*`**. Three parallel content editing systems exist in admin.

- **`/dashboard/trails/*`** redirects to **`/dashboard/camptrails/*`**. Both full route trees exist with separate page files. The `/trails/` tree has an extra `day/[dayNumber]/page.tsx` that `camptrails` does not.

### Non-functional Elements
1. **Upgrade page payment buttons** (`/dashboard/upgrade`): "Pay with GCash" and "Pay with Card" buttons have no `onClick` handlers. They are static `<button>` elements.
2. **CEO Team "Add Team Member" button** (`/ceo/team`): Static button, no form or action attached.
3. **Settings billing route** (`/dashboard/settings/billing`): Defined in `ROUTES` constant but no `page.tsx` exists.

### Defined but Missing Routes (from ROUTES constant)
| Route Constant | Path | Page Exists? |
|---------------|------|-------------|
| `SETTINGS_BILLING` | `/dashboard/settings/billing` | No |
| `SETTINGS_DEVELOPER` | `/dashboard/settings/developer` | No |
| `QUIZ` | `/dashboard/quiz` | No (legacy) |
| `SESSIONS` | `/dashboard/sessions` | No (legacy) |
| `LIBRARY` | `/dashboard/library` | No |
| `LIBRARY_SUBJECT` | `/dashboard/library/subject/[id]` | No |
| `LIBRARY_BANK` | `/dashboard/library/bank/[id]` | No |
| `LIBRARY_MARKETPLACE` | `/dashboard/library/marketplace` | No |

---

## 11. Onboarding Funnel Assessment

### Funnel Steps & Conversion Risk

| Step | Route | Friction | Risk |
|------|-------|---------|------|
| 1. Try free questions | `/try` | LOW | Good: no signup required |
| 2. Create account | `/register` | LOW | Google OAuth reduces friction |
| 3. Onboarding form | `/onboarding` | MEDIUM | 4 form fields, but well-paced |
| 4. Diagnostic quiz | `/dashboard/assessment` | MEDIUM | 20 questions could feel long |
| 5. Score reveal | `/dashboard/score-reveal` | LOW | Payoff moment |
| 6. Dashboard | `/dashboard` | LOW | Guided by OnboardingStateCard |
| 7. First real session | `/dashboard/testing/camp/setup` | LOW | One-click to start |

**Verdict:** The funnel is well-designed. The try-before-signup pattern (Step 1) is strong. The main risk is Step 4 (20-question diagnostic may cause drop-off). Consider adding a progress indicator or allowing skip with default score.

### Time to "Aha Moment"
- **Without account:** ~3 min (try page, 5 questions)
- **With account:** ~20-30 min (register + onboard + 20-question assessment + score reveal)
- **To first real value:** ~35 min (above + first Camp session)

---

## 12. Summary Statistics

| Metric | Count |
|--------|-------|
| Total page.tsx files | ~105 |
| Total layout.tsx files | 13 |
| Total loading.tsx files | 88 (84% coverage) |
| Total error.tsx files | 8 |
| Total not-found.tsx files | 4 |
| Total API routes | 12 |
| Total server action files | 57 |
| Total exported server functions | ~212 |
| Dashboard features | 18+ |
| Admin features | 14 |
| CEO features | 4 |
| Developer features | 14 |
| Marketing pages | 9 (2 stubs) |
| Testing modes | 7 (exceeds 4-mode spec) |
| Analytics visualizations | 8 |
| Interactive 3D widgets | 10+ |
| Duplicate/legacy route trees | 3 |
| Non-functional UI elements | 3 |
| Missing defined routes | 8 |
| Orphaned route trees | 2 (`/dashboard/developer`, `/admin/wiki`) |

---

## 13. Priority Actions

### Critical (Monetization blockers)
1. **Wire up payment buttons** on `/dashboard/upgrade` — GCash and Card buttons do nothing
2. **Create `/dashboard/settings/billing` page** — route defined but no page exists
3. **Complete About and Contact pages** — "Coming Soon" stubs damage credibility

### High (User experience gaps)
4. **Remove duplicate route trees** — consolidate `/dashboard/developer` into `/developer`, `/admin/wiki` into `/admin/articles`
5. **Add error boundary to CEO portal** — no error.tsx exists
6. **Add not-found.tsx to Admin portal** — dynamic routes return raw 404
7. **Fill dashboard content grid placeholders** — 3 colored placeholder divs on main dashboard

### Medium (Feature completeness)
8. **Implement Settings billing page** — subscription management UI
9. **Add profile editing** to Settings — name, avatar, email
10. **Wire CEO team "Add Member" button** — currently non-functional
11. **Implement notification preferences UI** — backend actions exist (`email-preferences.ts`)
12. **Clean up orphaned ROUTES constants** — 8 routes defined with no pages

### Low (Polish)
13. Add loading.tsx to remaining 17 pages
14. Consider PWA manifest for mobile experience
15. Add full-text wiki search in dashboard
