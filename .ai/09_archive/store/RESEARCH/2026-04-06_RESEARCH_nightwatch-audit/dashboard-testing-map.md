# Route Blueprint: `/dashboard/testing`

## Route Entry: `/dashboard/testing`

### Layout/Data Fetching Strategy

**File:** `src/app/dashboard/testing/layout.tsx`
- **Type:** Server Component (simple wrapper)
- **Metadata:** `{ title: 'Review & Testing | SlateCamp', description: 'Build mastery through guided study, timed practice, and exam simulations.' }`
- **Data Fetching:** None (passthrough layout)
- **State:** None

**File:** `src/app/dashboard/testing/page.tsx`
- **Type:** Server Component with async data fetching
- **Auth Check:** `getUser()` → redirect to `/login` if no session
- **Data Fetched (via `Promise.all`):**
  1. `user_subscriptions` → `tier`
  2. `quiz_sessions` → `session_id, test_mode, config, status, question_ids, started_at, completed_at, current_question_index, updated_at` (limit 200)
  3. `user_global_stats` → `global_readiness_score, last_study_date`
  4. `blindspot_queues` → `queue_id, node_ids, question_count, status, pre_queue_mastery` (pending only)
  5. `profiles` → `target_exam_date`
  6. `user_node_mastery` → `topic_id, current_mastery_weight, taxonomy_tree(name, subject_area)` (weight < 0.4, limit 5)
  7. `getActiveSRCycles()` → SR active cycles
  8. `getDueSRCycles()` → SR due cycles
  9. `getUserSRProgress()` → `{ active, spacing, durable, reset, total }`

**Suspense Boundary:**
- Wraps `<TestingContent />` with `<Suspense fallback={<Skeleton className="h-screen w-full" />} />`

### Server/Client Boundary

- **Server Side:** `page.tsx` (data fetching, auth)
- **Client Side:** `ReviewHub` and all child components (`'use client'`)

---

## UI Component Tree

### Level 1: Page Entry

```
src/app/dashboard/testing/page.tsx
├── <Suspense> (Server Component)
│   └── <TestingContent /> (Async Server Component)
│       └── <ReviewHub /> (Client Component - 'use client')
```

### Level 2: ReviewHub (`src/components/testing/hub/ReviewHub.tsx`)

**Props Expected:**
```typescript
{
  userTier: string,                              // 'free' | 'pro'
  readinessScore: number,                        // 0-100
  lastStudyDate: string | null,
  completedSessions: RawSession[],
  inProgressSession: RawSession | null,
  allSessions: RawSession[],
  blindspotQueues: RawBlindspotQueue[],
  targetExamDate: string | null,
  weakNodes: RawWeakNode[],
  srActiveCycles: SRActiveCycle[],
  srDueCycles: SRDueCycle[],
  srProgress: SRProgressSummary
}
```

**State Hooks Used:**
- `useMemo()` → `modeStats`, `simulationGateStatus`, `readinessZone`, `daysUntilExam`, `resumeHref`, `weakTopicsPreview`, `hubSignals`

**Visual States:**
- **Loading:** Skeleton from `<Suspense>` fallback
- **With In-Progress Session:** Shows resume card with question progress
- **Without In-Progress Session:** Shows "Configure Session" button
- **Simulation Locked:** Shows locked state with readiness requirement

**Components Rendered:**

```
<ReviewHub>
├── <header>
│   └── <SectionHeader /> (eyebrow: "Review & Testing")
│
├── <section> (Readiness Dashboard - 2-column grid)
│   ├── <div> (Readiness Card)
│   │   ├── <SectionHeader /> (eyebrow: "Readiness")
│   │   ├── <ReadinessScoreRing /> (score, zone, size="sm")
│   │   └── <div> (Stats Grid - 2x2)
│   │       ├── Completed Sessions count
│   │       ├── Due SR Cycles count
│   │       ├── Active SR Cycles count
│   │       └── SR Coverage count
│   │
│   └── <div> (Next Best Move Card)
│       ├── <SectionHeader /> (eyebrow: "Next Best Move")
│       └── Conditional:
│           ├── If inProgressSession → Resume card + Resume Link
│           └── If no session → Configure Session Link
│
├── <section> (Hero Configurator - id="hero-configurator")
│   ├── <SectionHeader /> (eyebrow: "Dynamic Engine")
│   └── <HeroConfigurator />
│
├── <section> (Suggested Next - conditional on hubSignals.length > 0)
│   ├── <SectionHeader /> (eyebrow: "Suggested Next")
│   └── <div> (3-column grid of HubSignal cards)
│       └── <a> per signal (href, title, description, ctaLabel)
│
├── <section> (Specialized Simulations)
│   ├── <SectionHeader /> (eyebrow: "Exam Readiness")
│   └── <div> (2-column grid)
│       ├── Full Exam Simulation card
│       │   └── Conditional: Locked or Link to /quiz/fullexam/setup
│       └── Design Endurance card
│           └── Link to /quiz/extended/setup
│
├── <div> (Focus Review Queue info bar - bg-primary-50)
│
└── <div> (Session History)
    ├── <SectionHeader /> (eyebrow: "Session History")
    └── <SessionsTable />
```

### Level 3: HeroConfigurator (`src/components/testing/hub/HeroConfigurator.tsx`)

**Props:** `{ initialSubjects?: Subject[] }` (optional)

**State Hooks:**
- `useState<Subject[]>(initialSubjects ?? [])` → `availableSubjects`
- `useState<Set<string>>(new Set())` → `selectedSubjectIds`
- `useState<number>(50)` → `questionCount`
- `useState<number>(0)` → `timerMinutes`
- `useState<boolean>(false)` → `isLoading`
- `useState<boolean>(false)` → `showTooltip`
- `useEffect` → Fetches subjects if no initialSubjects
- `useMemo` → `selectedSubjects`

**Visual States:**
- **Loading:** Animated skeleton pulses in subject drop zone
- **No subjects selected:** Shows "Select subjects from your discipline to begin" message
- **Subjects selected:** Pills with Trash icons, dynamic status label
- **Submitting:** Full-page overlay with spinner

**Components Rendered:**
```
<HeroConfigurator>
├── <TooltipProvider>
│   └── <div> (relative, rounded-xl, shadow-sm)
│       ├── <div> (Background Pattern - MagicWand icon, opacity-0.03)
│       │
│       ├── <div> (Left Column - Subject Selection)
│       │   ├── <div> (Header - Layout icon + "Canvas")
│       │   │   └── <Button> (Add All) + <Button> (Clear)
│       │   │
│       │   ├── <div> (Subject Drop Zone - dashed border)
│       │   │   └── <motion.button> per subject (toggleable pills)
│       │   │       └── Plus/Trash icon + subject name
│       │   │
│       │   └── <div> (Status label - Info icon + dynamic text)
│       │
│       ├── <div> (Right Column - Config Sliders)
│       │   ├── <UnifiedSlider> (Questions: 10-100, step 5)
│       │   ├── <UnifiedSlider> (Timer: 0-120 min, step 15)
│       │   │
│       │   └── <Tooltip>
│       │       └── <SlideToSubmit /> (slide to start)
│       │
│       └── <AnimatePresence> (Loading Overlay - conditional)
│           └── <motion.div> (spinner + "Initializing Intelligent Queue...")
```

### Level 4: SessionsTable (`src/components/testing/hub/SessionsTable.tsx`)

**Props:** `{ sessions: SessionRecord[] }`

**State Hooks:**
- `useState<number>(20)` → `mobileVisibleCount`
- `useState<SessionRecord[]>(sessions)` → `localSessions`
- `useState<string | null>(null)` → `abandoningId`
- `useEffect` → Syncs localSessions with sessions prop
- `useMemo` → `rows`, `mobileRows`

**Visual States:**
- **Empty:** "No sessions yet. Start your first quiz above." (centered, muted)
- **Desktop:** DataTable with columns (Mode, Questions, Score, Status, Date, Actions)
- **Mobile:** MobileCard list with pagination

**Components Rendered:**
```
<SessionsTable>
├── <div> (Desktop - hidden md:block)
│   └── <DataTable />
│       ├── Columns: Mode, Questions, Score, Status, Date, Actions
│       ├── Searchable: true
│       └── Row click → router.push(sessionUrl)
│
├── <div> (Mobile - md:hidden)
│   └── <MobileCard> per session
│       └── StatusDot, badge, relative time, ActionLink
│
└── <button> (Show more - conditional on hasMoreMobileRows)
```

### Level 5: ReadinessScoreRing (`src/components/score/ReadinessScoreRing.tsx`)

**Props:**
```typescript
{
  score: number,
  previousScore?: number,
  zone: 'strong' | 'green' | 'amber' | 'needs-review',
  size?: 'sm' | 'md' | 'lg',
  showDelta?: boolean,
  animate?: boolean
}
```

**State:** None (pure presentational)

**Visual States:**
- **Animating:** SVG circle fills from 0 to score percentage (700ms ease-out cubic)
- **Static:** Shows final score value immediately

### Level 6: SectionHeader (`src/components/shared/section-header.tsx`)

**Props:**
```typescript
{
  eyebrow?: string,
  title: string,
  subtitle?: string,
  action?: React.ReactNode,
  level?: 'page' | 'section' | 'card',
  className?: string
}
```

### Level 7: SlideToSubmit (`src/components/quiz-v2/SlideToSubmit.tsx`)

**Props:**
```typescript
{
  onSubmit: () => void,
  disabled?: boolean,
  label?: string,
  checked?: boolean
}
```

**State Hooks:**
- `useRef<HTMLDivElement>()` → `trackRef`
- `useState<number>(0)` → `offset`
- `useState<boolean>(false)` → `isDragging`
- `useState<boolean>(false)` → `completed`
- `useState<number>(0)` → `trackWidth`
- `useRef` → `prevCheckedRef`, `prevDisabledRef`
- `useDrag` (from @use-gesture/react) → drag gesture binding

**Visual States:**
- **Idle:** White track with gray handle
- **Dragging:** Handle follows pointer, track fills with primary/10
- **Threshold reached:** Handle turns primary, chevrons appear
- **Completed:** Full primary background, "Checking your answer..." spinner
- **Disabled:** Opacity 0.4, pointer-events-none

### Level 8: UnifiedSlider (`src/components/ui/unified-slider.tsx`)

**Props:**
```typescript
{
  label: string,
  value: number,
  onChange: (value: number) => void,
  min: number,
  max: number,
  step: number,
  unit: string,
  isViolating?: boolean,
  contextLine?: string,
  contextLineType?: 'info' | 'warning' | 'error',
  formatValue?: (v: number) => string
}
```

### Level 9: DataTable (`src/components/shared/data-table.tsx`)

**Props:**
```typescript
{
  columns: Column<T>[],
  data: T[],
  keyField: string,
  searchable?: boolean,
  searchPlaceholder?: string,
  searchFields?: string[],
  selectable?: boolean,
  selectedKeys?: Set<string>,
  onSelectionChange?: (keys: Set<string>) => void,
  bulkActions?: React.ReactNode,
  defaultSort?: { key: string; direction: 'asc' | 'desc' },
  pageSize?: number,
  onRowClick?: (row: T) => void,
  loading?: boolean,
  emptyMessage?: string,
  emptyAction?: { label: string; onClick: () => void },
  className?: string
}
```

**State Hooks:**
- `useState<string>('')` → `searchQuery`
- `useState<{key: string, direction: 'asc' | 'desc'} | null>(null)` → `sortState`
- `useState<number>(1)` → `currentPage`
- `useState<number>(pageSize)` → `internalPageSize`

### Leaf Components (UI Primitives)

| Component | File | Used In |
|-----------|------|---------|
| `<Skeleton>` | `src/components/ui/skeleton.tsx` | loading.tsx |
| `<Tooltip>` / `<TooltipTrigger>` / `<TooltipContent>` | `src/components/ui/tooltip.tsx` | HeroConfigurator |
| `<Button>` | `src/components/ui/button.tsx` | HeroConfigurator, SessionsTable |
| `<AlertDialog>` / `<AlertDialogTrigger>` / `<AlertDialogContent>` / `<AlertDialogAction>` / `<AlertDialogCancel>` | `src/components/ui/alert-dialog.tsx` | SessionsTable (ActionLink) |
| `<Link>` | `next/link` | ReviewHub, SessionsTable |
| `<DataTable>` internal: `<SearchInput>` | `src/components/ui/input.tsx` | DataTable |
| `<SliderPrimitive>` | `@base-ui/react/slider` | UnifiedSlider |

---

## UX State Machine

### Loading State
- **Trigger:** Initial page load, awaiting Supabase data
- **Visual:** `<Skeleton className="h-screen w-full" />`
- **Layout:** Matches loading.tsx structure (header, cards, grids)

### Empty State (Sessions)
- **Trigger:** `allSessions.length === 0`
- **Visual:** "No sessions yet. Start your first quiz above."
- **Location:** SessionsTable renders empty div with border and muted text

### In-Progress Session State
- **Trigger:** `inProgressSession !== null`
- **Visual:** Resume card replaces "Configure Session" button
- **CTA:** `<Link href={resumeHref}>Resume session</Link>`
- **Session Info:** Shows "Session · question X of Y"

### Simulation Locked State
- **Trigger:** `readinessScore < 65`
- **Visual:** Gray disabled button with "Locked (Requires 65 Readiness)"
- **Unlock Action:** None visible (locked until readiness >= 65)

### Hero Configurator States
| State | Trigger | Visual |
|-------|---------|--------|
| Subjects loading | `availableSubjects.length === 0` | Animated skeleton in drop zone |
| No selection | `selectedSubjectIds.size === 0` | Italic placeholder text + disabled SlideToSubmit |
| Selected | Subjects clicked | Pills with Trash icons, dynamic status text |
| Submitting | `isLoading === true` | Full overlay with spinner + "Initializing..." |
| Validation error | Click with no selection | Tooltip appears: "Please select at least one subject" |

### SlideToSubmit States
| State | Trigger | Visual |
|-------|---------|--------|
| Idle | Initial render | White track, gray handle, arrow icon |
| Dragging | Mouse/touch drag | Handle follows, track fills |
| Threshold | 80% drag reached | Haptic feedback, chevrons visible |
| Released (threshold) | Mouse up at >= 80% | Handle stays, "Checking your answer..." |
| Completed | `completed === true` | Full primary background |
| Disabled | `disabled === true` | Opacity 0.4, no interaction |

### Sessions Table States
| State | Trigger | Visual |
|-------|---------|--------|
| Empty | `rows.length === 0` | Empty state message |
| Loading | `loading === true` | TableRowSkeleton per row |
| Data | `rows.length > 0` | Full DataTable with pagination |
| Mobile | viewport < md | MobileCard list |
| Abandoning | `abandoningId === session.session_id` | "Abandoning..." text |

---

## Exact Interaction Map

### ReviewHub Interactions

| Element | Action | Target | Behavior |
|---------|--------|--------|----------|
| Resume Link | Click | `/quiz/{mode}/session/{sessionId}` | Navigate to active session |
| Configure Session Link | Click | `#hero-configurator` | Scroll to configurator |
| Full Exam Simulation Link | Click | `/quiz/fullexam/setup` | Navigate to simulation setup |
| Design Endurance Link | Click | `/quiz/extended/setup` | Navigate to endurance setup |
| HubSignal CTA | Click | `#hero-configurator` | Scroll to configurator |

### HeroConfigurator Interactions

| Element | Action | Behavior |
|---------|--------|----------|
| Subject Pill | Click | Toggle subject in `selectedSubjectIds` Set |
| Add All Button | Click | Select all subjects |
| Clear Button | Click | Deselect all subjects |
| Questions Slider | Slide | Update `questionCount` state |
| Timer Slider | Slide | Update `timerMinutes` state |
| SlideToSubmit | Slide + Release | Call `handleStart()` |
| SlideToSubmit | Click (no selection) | Show tooltip validation |

### HeroConfigurator → handleStart()

```typescript
async function handleStart() {
  1. Validate: if (selectedSubjectIds.size === 0) → showTooltip, return
  2. Set isLoading = true
  3. Call startSession({
       mode: 'custom',
       config: {
         setup: {
           questionCount,
           topics: Array.from(selectedSubjectIds),
           disciplines: [],
           difficultyMode: 'adaptive',
           initialDifficulty: 'medium',
           isTrailSession: false,
           trailDayId: '',
         },
         timer: {
           enabled: timerMinutes > 0,
           visible: timerMinutes > 0,
           mode: 'countdown',
           totalSeconds: timerMinutes * 60,
           perQuestion: false,
           pausable: true,
           warningThresholds: [],
         },
         results: { ... }
       }
     })
  4. On success: router.push(`/quiz/custom/session/${result.sessionId}`)
  5. On error: console.error, set isLoading = false
}
```

### SessionsTable Interactions

| Element | Action | Behavior |
|---------|--------|----------|
| Row (desktop) | Click | `router.push(session.sessionUrl)` |
| Resume Link | Click | Navigate to in-progress session |
| Abandon Button | Click | Open AlertDialog |
| Confirm Abandon | Click | Call `abandonSessionAction()`, update local state |
| Cancel Abandon | Click | Close AlertDialog |
| Review Link | Click | Navigate to session results |
| Show More | Click | Increment `mobileVisibleCount` by PAGE_SIZE |
| DataTable Search | Type | Filter rows by searchFields |
| DataTable Sort | Click header | Toggle sort direction |
| DataTable Pagination | Click page | Update `currentPage` |

### Abandon Session Flow

```typescript
async function handleAbandon(sessionId: string) {
  1. Set abandoningId = sessionId
  2. Call abandonSessionAction(sessionId)
  3. Update localSessions: status → 'abandoned'
  4. Set abandoningId = null
}
```

---

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Review & Testing                                              │
│  Build Mastery. Earn your Score.                               │
│  Configure a dynamic session that fits your goal today...      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │  Readiness                   │  │  Next Best Move          │  │
│  │  Today's testing posture     │  │  [Resume session] OR     │  │
│  │  Studied today              │  │  [Configure Session]     │  │
│  │                             │  │                          │  │
│  │  ┌─────┐  Completed: X     │  │                          │  │
│  │  │ 72  │  Due SR: Y       │  │                          │  │
│  │  │OnTrk│  Active: Z       │  │                          │  │
│  │  └─────┘  Coverage: W      │  │                          │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
│                                                                 │
│  ── Dynamic Engine ───────────────────────────────────────────  │
│  Intelligent Configurator                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Canvas                    [Add All] [Clear]            │    │
│  │ ┌─────────────────────────────────────────────────────┐ │    │
│  │ │  [History] [Theory] [Planning] [Practice] ...     │ │    │
│  │ └─────────────────────────────────────────────────────┘ │    │
│  │ Targeting 3 subjects with 60/30/10 logic.             │    │
│  │                                                         │    │
│  │  Questions        Timer                                 │    │
│  │  ━━━━━━━○━       ━○━━━━━━━━━  OFF                     │    │
│  │     50              0m                                  │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │          Slide to start session →               │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ── Suggested Next ───────────────────────────────────────────  │
│  High-impact ways to spend your next session                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ Focus Review    │ │ SR Due         │ │ Exam Countdown  │    │
│  │ is ready        │ │ 3 cycles need  │ │ 45 days until  │    │
│  │ [Target Areas]  │ │ reinforcement   │ │ your exam      │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│  ── Exam Readiness ───────────────────────────────────────────  │
│  Specialized Simulations                                        │
│  ┌───────────────────────────┐ ┌───────────────────────────┐    │
│  │ Full Exam Simulation      │ │ Design Endurance         │    │
│  │ Strict 4-hour countdown   │ │ Long-form extended      │    │
│  │ [Start Simulation] OR    │ │ practice                 │    │
│  │ [Locked (Requires 65)]    │ │ [Start Endurance]       │    │
│  └───────────────────────────┘ └───────────────────────────┘    │
│                                                                 │
│  Focus Review queue: 42 queued questions across 8 weak areas. │
│                                                                 │
│  ── Session History ───────────────────────────────────────────  │
│  Your Sessions                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Mode    │ Questions │ Score │ Status │ Date │ Actions │    │
│  │─────────│───────────│───────│────────│──────│─────────│    │
│  │ Camp    │ 10/10     │ 80%   │ ● Done │ 2d    │ Review →│    │
│  │ Storm   │ 5/20      │ —     │ ● Prog │ 1h    │ Resume  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Summary

| File Path | Type | Purpose |
|-----------|------|---------|
| `src/app/dashboard/testing/layout.tsx` | Server Component | Metadata, passthrough wrapper |
| `src/app/dashboard/testing/page.tsx` | Async Server Component | Data fetching, auth, Suspense |
| `src/app/dashboard/testing/loading.tsx` | Client Component | Skeleton loading state |
| `src/components/testing/hub/ReviewHub.tsx` | Client Component | Main hub with mode cards, stats, sessions |
| `src/components/testing/hub/HeroConfigurator.tsx` | Client Component | Subject selection + session config |
| `src/components/testing/hub/SessionsTable.tsx` | Client Component | Session history table with actions |
| `src/components/score/ReadinessScoreRing.tsx` | Client Component | Animated SVG score ring |
| `src/components/shared/section-header.tsx` | Server Component | Reusable header with eyebrow/title/subtitle |
| `src/components/quiz-v2/SlideToSubmit.tsx` | Client Component | Drag-to-submit gesture |
| `src/components/ui/unified-slider.tsx` | Client Component | Slider primitive |
| `src/components/shared/data-table.tsx` | Client Component | Sortable/filterable table |
| `src/components/ui/skeleton.tsx` | N/A | Skeleton variants |
| `src/components/ui/alert-dialog.tsx` | Client Component | Confirmation dialog |
| `src/components/ui/tooltip.tsx` | Client Component | Tooltip primitives |
| `src/components/ui/button.tsx` | Client Component | Button variants |

---

## Session Routes (Sub-routes of /dashboard/testing)

| Route | File | Purpose |
|-------|------|---------|
| `/dashboard/testing/session/[sessionId]` | `session/[sessionId]/page.tsx` | Active quiz session |
| `/dashboard/testing/session/[sessionId]/debrief` | `session/[sessionId]/debrief/page.tsx` | Post-session results |
| `/dashboard/testing/simulation/[sessionId]` | `simulation/[sessionId]/page.tsx` | Simulation active |
| `/dashboard/testing/simulation/[sessionId]/results` | `simulation/[sessionId]/results/page.tsx` | Simulation results (24h delay) |

---

*Generated: 2026-04-07*
*Last Updated: Upon any change to testing hub components*
