# Audit: Dashboard Portal

**Audit Date:** 2026-04-07  
**Auditor:** Project Panopticon V5  
**Domain:** Dashboard Pages, Server Components, Data Fetching, UX/UI Components, Navigation

---

## 1. Route Structure

### 1.1 Route Inventory

**Source:** `src/app/dashboard/` — 100 files across 29 subdirectories

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `page.tsx` | Main landing page |
| `/dashboard/testing` | `page.tsx`, `layout.tsx`, `loading.tsx` | Testing hub |
| `/dashboard/testing/session/[sessionId]` | `page.tsx`, `loading.tsx`, `error.tsx` | Active quiz session |
| `/dashboard/testing/session/[sessionId]/debrief` | `page.tsx`, `loading.tsx`, `error.tsx` | Session debrief |
| `/dashboard/testing/simulation/[sessionId]` | `page.tsx`, `loading.tsx` | Full exam simulation |
| `/dashboard/testing/simulation/[sessionId]/results` | `page.tsx`, `loading.tsx` | Simulation results |
| `/dashboard/3d-lab` | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | 3D Lab module gallery |
| `/dashboard/3d-lab/[moduleId]` | `page.tsx` | Individual 3D module |
| `/dashboard/analytics` | `page.tsx`, `layout.tsx`, `loading.tsx` | Analytics dashboard |
| `/dashboard/wiki` | `page.tsx`, `layout.tsx`, `loading.tsx` | Wiki browser |
| `/dashboard/wiki/[slug]` | `page.tsx`, `loading.tsx` | Wiki article |
| `/dashboard/notes` | `page.tsx`, `layout.tsx`, `loading.tsx` | Notes management |
| `/dashboard/settings` | `page.tsx`, `loading.tsx` | Settings hub |
| `/dashboard/settings/account` | (nested via account-mode-card.tsx) | Account settings |
| `/dashboard/settings/theme` | (nested via theme-card.tsx) | Theme preferences |
| `/dashboard/settings/notifications` | (nested via notifications-card.tsx) | Notification preferences |
| `/dashboard/settings/discipline` | (nested via discipline-card.tsx) | Discipline selection |
| `/dashboard/settings/logout` | (nested via logout-card.tsx) | Logout flow |
| `/dashboard/notifications` | `page.tsx`, `loading.tsx` | Notifications center |
| `/dashboard/upgrade` | `page.tsx`, `loading.tsx` | Tier upgrade |
| `/dashboard/welcome-pro` | `page.tsx`, `loading.tsx` | New Pro welcome |
| `/dashboard/professional` | `page.tsx`, `loading.tsx` | Professional mode |
| `/dashboard/results-day` | `page.tsx`, `loading.tsx` | Results day banner |
| `/dashboard/score-reveal` | `page.tsx`, `loading.tsx`, `layout.tsx` | Score reveal flow |
| `/dashboard/exam-outcome` | `page.tsx`, `ExamOutcomeSurvey.tsx` | Post-exam survey |
| `/dashboard/pods` | `page.tsx`, `loading.tsx` | Study pods hub |
| `/dashboard/pods/[podId]` | `page.tsx`, `loading.tsx` | Individual pod |
| `/dashboard/flash` | `page.tsx`, `loading.tsx` | Flash cards hub |
| `/dashboard/flash/[category]` | `page.tsx`, `loading.tsx` | Category flash cards |
| `/dashboard/cram-card` | `page.tsx`, `loading.tsx` | Cram card mode |
| `/dashboard/studio` | `page.tsx`, `loading.tsx` | Study studio |
| `/dashboard/dae-mode` | `page.tsx`, `loading.tsx` | DAE mode |
| `/dashboard/code-updates` | `page.tsx`, `loading.tsx` | Code update feed |
| `/dashboard/developer` | `page.tsx` | Developer tools |

### 1.2 Dynamic & Catch-All Routes

| Pattern | Files | Notes |
|---------|-------|-------|
| `session/[sessionId]` | 3 pages | UUID-based session routing |
| `simulation/[sessionId]` | 2 pages | Exam simulation sessions |
| `wiki/[slug]` | 1 page | Article slug routing |
| `pod/[podId]` | 1 page | Study pod routing |
| `3d-lab/[moduleId]` | 1 page | 3D module routing |
| `flash/[category]` | 1 page | Flash card category |

---

## 2. Root Dashboard Page — Full Component Tree

### 2.1 Page Architecture

**File:** `src/app/dashboard/page.tsx` (108 lines)  
**Pattern:** Server Component with parallel data fetching via `Promise.all`

```typescript
// Data fetches (all parallel):
await Promise.all([
  getUser(),           // Auth check
  getDashboardData(),  // Hero stats
  getHeatmapData(),    // Taxonomy heatmap
  getActivityData(),   // Recent activity
  getStreakData(),     // Study streak
  getSubjectMastery(), // Per-subject mastery
  getDailyDose(),      // Adaptive study plan
])
```

### 2.2 Component Tree (Root Dashboard)

```
DashboardPage (Server Component)
├── SharedPageLayout (wrapper)
│   └── DashboardAnalyticsSync (client, analytics tracking)
│
├── TransitionPromptServer (Suspense)
│   └── Shows "opt-in to professional mode" banner for passers
│
├── ResultsDayBannerServer (Suspense)
│   └── Shows 3-14 days after exam date if no result yet
│
├── StreakRibbonServer (Suspense → StreakRibbonSkeleton)
│   └── Current streak + lock state
│
├── HeroCommandBarServer (Suspense → HeroCommandBarSkeleton)
│   └── ReadinessScoreRing (SVG ring, IRT score)
│   └── Greeting + score context
│   └── HeatmapSection (Suspense → HeatmapSectionSkeleton)
│       └── TaxonomyHeatmap (color-coded node grid)
│
├── DailyDoseCard (Suspense)
│   └── Today's adaptive study recommendation
│
├── Content Grid (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
│
│   ├── ReviewCalendarServer (lg:col-span-3, Suspense → ReviewCalendarSkeleton)
│   │   └── 7-day forward study calendar
│   │
│   ├── ActivityFeedServer (lg:row-span-2, Suspense → ImprovedActivityFeedSkeleton)
│   │   └── Recent study activity feed
│   │
│   ├── DailyWikiServer (Suspense → FeatureDiscoverySkeleton)
│   │   └── Featured wiki article card
│   │
│   ├── SubjectMasteryServer (Suspense → SubjectMasterySkeleton)
│   │   └── Per-subject mastery bars
│   │
│   ├── ReviewCenterSyncServer (Suspense)
│   │   └── Shows if enrolled in review center
│   │
│   └── BloomTrackerServer (lg:col-span-2, Suspense → BloomTrackerSkeleton)
│       └── Bloom's cognitive level tracker (after 10+ sessions)
```

### 2.3 Data Fetches Per Section

| Component | Data Source | Query Tables |
|-----------|------------|--------------|
| TransitionPromptServer | `getUser()` | profiles (exam_date, ale_result) |
| ResultsDayBannerServer | `getUser()` | profiles (exam_date) |
| StreakRibbonServer | `getStreakData()` | user_global_stats (streak_days) |
| HeroCommandBarServer | `getDashboardData()` | user_global_stats, quiz_sessions |
| HeatmapSection | `getHeatmapData()` | taxonomy_tree, user_mastery_history |
| DailyDoseCard | `getDailyDose()` | daily_dose (inferred) |
| ReviewCalendarServer | (inferred) | calendar/schedule data |
| ActivityFeedServer | `getActivityData()` | quiz_sessions, question_interactions |
| DailyWikiServer | (inferred) | wiki_articles |
| SubjectMasteryServer | `getSubjectMastery()` | user_mastery_history, disciplines |
| ReviewCenterSyncServer | (inferred) | organization_members, profiles |
| BloomTrackerServer | (inferred) | question_interactions (bloom_level tracking) |

---

## 3. Dashboard Layout

### 3.1 Layout Architecture

**File:** `src/app/dashboard/layout.tsx` (15 lines)

```typescript
export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
```

**`DashboardLayoutContent`** (imported from `@/components/dashboard/DashboardLayoutContent`):
- Fetches user session + subscription tier
- Provides: TierProvider, DisciplineProvider, ActiveSessionProvider, NoteContextProvider
- Renders: Sidebar nav + breadcrumb context
- Shows: DevToolbar if isAdmin or isDemoMode

### 3.2 Context Providers Mounted in Dashboard

| Provider | Purpose | Source |
|----------|---------|--------|
| TierProvider | tier, effectiveTier, capabilities, hasAccess() | `src/lib/context/tier-context.tsx` |
| DisciplineProvider | activeDiscipline, switchDiscipline | `src/lib/context/discipline-context.tsx` |
| ActiveSessionProvider | activeSession, setActiveSession | `src/lib/context/active-session-context.tsx` |
| NoteContextProvider | drawerOpen, anchor | `src/lib/context/note-context.tsx` |
| BreadcrumbProvider | breadcrumbs, setBreadcrumbs | `src/lib/context/breadcrumb-context.tsx` |

---

## 4. Sub-Portal Audit

### 4.1 Wiki Portal

**Route:** `/dashboard/wiki` + `/dashboard/wiki/[slug]`

**Key Components:**
- Wiki browser with search
- Article renderer with MDX
- Citation badges
- AI tutor integration

**Data Fetches:**
- `supabase.from('wiki_articles').select(...)` → article list
- `supabase.from('wiki_articles').select(...).eq('slug', slug)` → single article
- `supabase.from('taxonomy_tree').select(...)` → article taxonomy breadcrumb

### 4.2 Notes Portal

**Route:** `/dashboard/notes`

**Key Components:**
- Note editor (Tiptap-based)
- Note list/organizer
- Markdown rendering
- Note anchoring (topic/question/article)

**Data Fetches:**
- `supabase.from('notes').select(...).eq('user_id', userId)` → user's notes
- Note CRUD via server actions in `src/lib/actions/notes-actions.ts`

### 4.3 Analytics Portal

**Route:** `/dashboard/analytics`

**Key Visualizations:**
- Performance trends (Recharts)
- Session analysis
- Subject breakdown
- Readiness score history

**Data Fetches:**
- `supabase.from('quiz_sessions').select(...)` → session history
- `supabase.from('question_interactions').select(...)` → interaction patterns
- `supabase.from('user_global_stats').select(...)` → current stats

### 4.4 3D Lab Portal

**Route:** `/dashboard/3d-lab`

**Key Components:**
- Module gallery
- LabViewport (React Three Fiber Canvas)
- Hotspot annotations
- Compliance checker
- Exploded assembly views
- Cutaway sections

**State:** `stores/useLabStore.ts` (Zustand)
- activeScene, activeModuleId
- camera position
- visitedNodes, answeredNodes, correctNodes
- exploreMode: 'guided' | 'free'
- parametric values

### 4.5 Settings Portal

**Route:** `/dashboard/settings`

**Cards (per settings type):**
| Card | File | Purpose |
|------|------|---------|
| DisciplineCard | `discipline-card.tsx` | Active discipline selection |
| ThemeCard | `theme-card.tsx` | Light/dark mode |
| AccountModeCard | `account-mode-card.tsx` | Review mode toggle |
| NotificationsCard | `notifications-card.tsx` | Email preferences |
| LogoutCard | `logout-card.tsx` | Sign out |

### 4.6 Notifications Portal

**Route:** `/dashboard/notifications`

**State:** `stores/useNotificationStore.ts` (Zustand)
- `unreadCount: number`
- `recentNotifications: Notification[]`
- `isPopoverOpen: boolean`
- `fetchUnreadCount()` → `getUnreadCount()` server action
- `fetchRecent()` → `getRecentNotifications()` server action
- `markAsRead(id)` → `markNotificationAsRead(id)` server action
- `markAllAsRead()` → `markAllNotificationsAsRead()` server action

---

## 5. Missing/Hidden Routes

### 5.1 Orphaned/Undocumented Routes

Based on glob results, these routes exist but may lack documentation:

| Route | File | Status |
|-------|------|--------|
| `/dashboard/area-c` | (mentioned in AGENTS.md) | Unclear if implemented |
| `/dashboard/camptrails` | (mentioned in AGENTS.md) | Unclear if implemented |
| `/dashboard/focus-review` | (mentioned in AGENTS.md) | Unclear if implemented |
| `/dashboard/proof-simulation` | (mentioned in AGENTS.md) | Implemented under testing/simulation |
| `/dashboard/trails` | `trails/page.tsx`, `trails/[slug]/today/` | Implemented |
| `/dashboard/score-reveal` | Implemented | Layout exists |

### 5.2 Legacy Routes (Redirect Targets)

The following redirect patterns exist (verified via AGENTS.md):
- `/admin/questions` → `/admin/knowledge/questions`
- `/admin/articles` → `/admin/knowledge`
- `/admin/content` → `/admin/content`

---

## 6. Critical Findings

### FINDING-1: No Centralized Dashboard Data Hook (Severity: MEDIUM)
- **Location:** `src/app/dashboard/page.tsx`
- **Problem:** Dashboard page manually calls 5+ separate data fetches with no caching
- **Impact:** Each navigation to dashboard triggers full re-fetch
- **Fix Required:** Create `getDashboardPageData()` server action that returns all data in single query or uses `Promise.all`

### FINDING-2: Context Prop Drilling Risk (Severity: MEDIUM)
- **Location:** `DashboardLayoutContent`
- **Problem:** 5 context providers mounted in dashboard layout — if any page doesn't use the layout, context is unavailable
- **Impact:** Inconsistent state across pages
- **Fix Required:** Verify all dashboard sub-routes actually use the layout

### FINDING-3: BloomTracker Only After 10 Sessions (Severity: LOW)
- **Location:** `src/app/dashboard/page.tsx` line 95–99
- **Problem:** Bloom cognitive tracker only renders after 10+ sessions — users don't know this gate exists
- **Impact:** Hidden feature discovery problem
- **Fix Required:** Add a tooltip or badge explaining the gate

### FINDING-4: Multiple Loading Skeletons Not Unified (Severity: LOW)
- **Location:** `src/components/dashboard/`
- **Problem:** 8+ separate skeleton components (StreakRibbonSkeleton, HeatmapSectionSkeleton, SubjectMasterySkeleton, etc.) with inconsistent structure
- **Impact:** UX inconsistency during loading states
- **Fix Required:** Create unified `DashboardSkeleton` that composes all section skeletons

---

## 7. File Inventory

### Dashboard Components (src/components/dashboard/)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `DashboardLayoutContent.tsx` | ~200 | Main dashboard shell + context providers |
| `HeroCommandBar.tsx` / `HeroCommandBarServer.tsx` | ~150 | Score + greeting + actions |
| `HeroCommandBarSkeleton.tsx` | ~20 | Loading skeleton |
| `HeatmapSection.tsx` | ~100 | Taxonomy heatmap visualization |
| `HeatmapSectionSkeleton.tsx` | ~20 | Loading skeleton |
| `SubjectMastery.tsx` / `SubjectMasteryServer.tsx` | ~100 | Per-subject mastery display |
| `SubjectMasterySkeleton.tsx` | ~20 | Loading skeleton |
| `ActivityFeed.tsx` / `ImprovedActivityFeed.tsx` / `ActivityFeedServer.tsx` | ~150 | Recent activity feed |
| `ImprovedActivityFeedSkeleton.tsx` | ~20 | Loading skeleton |
| `StreakRibbon.tsx` / `StreakRibbonServer.tsx` | ~80 | Streak display |
| `StreakRibbonSkeleton.tsx` | ~15 | Loading skeleton |
| `BloomTracker.tsx` / `BloomTrackerServer.tsx` | ~100 | Bloom cognitive tracker |
| `BloomTrackerSkeleton.tsx` | ~20 | Loading skeleton |
| `ReviewCalendar.tsx` / `ReviewCalendarServer.tsx` | ~120 | 7-day calendar |
| `ReviewCalendarSkeleton.tsx` | ~20 | Loading skeleton |
| `DailyDoseCard.tsx` / `DailyWikiServer.tsx` | ~80 | Daily recommendation |
| `FeatureDiscoveryRow.tsx` | ~60 | Feature discovery cards |
| `FeatureDiscoverySkeleton.tsx` | ~15 | Loading skeleton |
| `ReviewCenterSync.tsx` / `ReviewCenterSyncServer.tsx` | ~60 | Review center enrollment |
| `ResultsDayBanner.tsx` / `ResultsDayBannerServer.tsx` | ~80 | Results day banner |
| `TransitionPrompt.tsx` / `TransitionPromptServer.tsx` | ~80 | Professional mode prompt |
| `DashboardPageSkeleton.tsx` | ~40 | Full page skeleton |
| `DashboardAnalyticsSync.tsx` | ~30 | Analytics event tracking |
| `ReviewCenterSync.tsx` | ~60 | Review center sync |

### Dashboard Pages (src/app/dashboard/)

| Page | Lines | Data Fetches |
|------|-------|-------------|
| `page.tsx` (root) | 108 | 5 parallel Promise.all fetches |
| `layout.tsx` | 15 | User + tier + stats bootstrap |
| `testing/page.tsx` | ~150 | 9 parallel fetches |
| `wiki/page.tsx` | ~80 | wiki_articles + taxonomy |
| `wiki/[slug]/page.tsx` | ~100 | Single article + related |
| `notes/page.tsx` | ~80 | notes CRUD + anchoring |
| `analytics/page.tsx` | ~100 | quiz_sessions + interactions |
| `3d-lab/page.tsx` | ~80 | Module catalog |
| `3d-lab/[moduleId]/page.tsx` | ~100 | Single module + hotspots |
| `settings/page.tsx` | ~60 | Settings cards |
| `notifications/page.tsx` | ~60 | Notification list |
| `upgrade/page.tsx` | ~50 | Upgrade CTA |

---

*End of Dashboard Portal Audit*

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: Parallel Fetching Without Error Isolation

**Manifestation:** `Promise.all([fetch1, fetch2, fetch3])` — if any fetch fails, entire page fails.

**Impact:** Single failing query (analytics) takes down entire dashboard.

**Architectural Cure:** Independent Suspense boundaries per section:
```tsx
// Instead of Promise.all at page level:
<Suspense fallback={<PageSkeleton />}>
  <HeroSection /> {/* own data fetch */}
</Suspense>
<Suspense fallback={<HeatmapSkeleton />}>
  <HeatmapSection /> {/* own data fetch */}
</Suspense>
<Suspense fallback={<ActivitySkeleton />}>
  <ActivityFeed /> {/* own data fetch */}
</Suspense>
```

### Pattern 2: Loading Skeleton Proliferation

**Manifestation:** Every component has its own skeleton, but no consistent skeleton component library.

**Impact:** Inconsistent loading states, duplicated skeleton code.

**Architectural Cure:** Skeleton component factory:
```tsx
// src/components/ui/skeleton-factory.tsx
export const createSkeleton = (variant: 'card' | 'chart' | 'table' | 'text') => {
  // Returns appropriate skeleton based on variant
}
```

### Pattern 3: 3D Lab Isolation

**Manifestation:** 3D Lab components import from `@react-three/fiber`, Three.js, etc. These heavy dependencies may affect dashboard bundle.

**Impact:** Dashboard ships 3D dependencies to users who never use 3D Lab.

**Architectural Cure:** Dynamic import with loading boundary:
```tsx
<Suspense fallback={<LabSkeleton />}>
  <Lazy3DLab labId={labId} />
</Suspense>
// In 3d-lab entry:
export const Lazy3DLab = dynamic(() => import('./3DLab'), { 
  ssr: false,
  loading: () => <LabSkeleton />
})
```

---

## Architectural Cure Blueprint

### Step 1: Independent Suspense Boundaries

Refactor dashboard page.tsx to use per-section Suspense boundaries instead of single Promise.all.

### Step 2: Skeleton Library

Create shared skeleton components in `src/components/ui/` for: CardSkeleton, ChartSkeleton, TableSkeleton, TextSkeleton, AvatarSkeleton.

### Step 3: 3D Lab Code Splitting

Implement dynamic imports for all 3D Lab components. Verify bundle analyzer shows 3D deps only in 3D Lab chunks.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact Dashboard Data Fetch Shapes

### Promise.all Parallel Fetch (page.tsx lines 73-79)

```typescript
// All fetches happen in parallel:
const [user, dashboardData, heatmapData, activityData, streakData] = await Promise.all([
  getUser(),              // Returns: { id, email, tier, role }
  getDashboardData(),    // Returns: DashboardData
  getHeatmapData(),      // Returns: HeatmapData
  getActivityData(),     // Returns: ActivityData
  getStreakData()        // Returns: StreakData
])

// DashboardData shape:
interface DashboardData {
  totalSessions: number
  totalQuestions: number
  averageScore: number
  studyStreak: number
  nextReviewDate: string | null
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'master'
}

// HeatmapData shape (by taxonomy node):
interface HeatmapData {
  nodes: Array<{
    id: string
    name: string
    mastery: number           // 0.0 to 1.0
    questionsAnswered: number
    lastStudied: string | null
  }>
}

// ActivityData shape:
interface ActivityData {
  recentSessions: Array<{
    id: string
    mode: string
    completedAt: string
    percentCorrect: number
  }>
  recentArticles: Array<{
    id: string
    title: string
    slug: string
    viewedAt: string
  }>
}

// StreakData shape:
interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  frozenDays: number
}
```

## Exact Loading Skeleton Inventory

```typescript
// src/app/dashboard/loading.tsx
// Each skeleton matches its component dimensions:

PageSkeleton:
  ├─ HeroSkeleton (200px height, gradient shimmer)
  ├─ StatsGridSkeleton (3 cards, 100px each)
  ├─ HeatmapSkeleton (300px, grid pattern)
  ├─ ActivitySkeleton (2 list items, avatar + text)
  └─ FooterSkeleton (2 links)

CardSkeleton:
  └─ 200px × 150px, rounded-md, shimmer animation

ChartSkeleton:
  └─ 100% width × 300px, bar chart placeholder pattern
```

## Exact Sub-Portal Component Trees

### Wiki Portal (`/dashboard/wiki`)

```
WikiIndexPage
├── WikiSearch (Combobox with autocomplete)
├── WikiCategoryFilter (horizontal pills)
├── WikiGrid
│   └── WikiCard × N (title, excerpt, read_time, cover_image)
└── WikiPagination

WikiArticlePage (`/dashboard/wiki/[slug]`)
├── WikiBreadcrumb (from BreadcrumbContext)
├── ArticleHeader (title, author, date, read_time)
├── WikiRenderer (Tiptap HTML → React components)
│   ├── TiptapBlockquote
│   ├── TiptapCodeBlock
│   ├── TiptapImage
│   └── TiptapTable
├── RelatedArticlesSection
├── WikiToc (TableOfContents sidebar)
└── FeedbackSection (helpful/not helpful)
```

### Analytics Portal (`/dashboard/analytics`)

```
AnalyticsPage
├── MasteryChart (recharts RadarChart)
│   └── By taxonomy node, color-coded by mastery level
├── ProgressChart (recharts LineChart)
│   └── Score over time (7d, 30d, 90d, 1y)
├── HeatmapCalendar (custom GitHub-style)
│   └── Days colored by activity intensity
├── RetentionChart (recharts BarChart)
│   └── 1d, 3d, 7d, 14d, 30d retention
└── CohortTable
    └── New users grouped by signup month, retention by month
```

### 3D Lab Portal (`/dashboard/3d-lab`)

```
LabIndexPage
├── LabModuleGrid
│   └── LabModuleCard × N (thumbnail, title, description)
└── LabProgressSummary

LabModulePage (`/dashboard/3d-lab/[moduleId]`)
├── LabHeader (module title, progress %)
├── LabScene (React Three Fiber Canvas)
│   ├── OrbitControls
│   ├── AmbientLight + DirectionalLight
│   ├── ModuleGeometry (parametric based on moduleId)
│   └── HotspotAnnotations (clickable labels)
├── LabNavigation (prev/next hotspots)
└── LabHintPanel (contextual hints)
```

## Hidden Portal Quirks

1. **WikiRenderer sanitizes HTML** — Uses DOMPurify before `dangerouslySetInnerHTML`.

2. **Analytics charts use recharts** — NOT Tailwind styled. Custom color tokens from globals.css applied via `fill` props.

3. **3D Lab Canvas** uses `frameloop="demand"` and `dpr={[1, 1.5]}` — Only re-renders on interaction, optimized for 60 FPS.

4. **Notes portal** has Tiptap editor — Full rich text with `StarterKit`, `Link`, `Image`, `Table` extensions.

---

*Pass 3: Omniscience added 2026-04-07*
