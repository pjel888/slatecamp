# Audit: State Management

**Audit Date:** 2026-04-07  
**Auditor:** Project Panopticon V5  
**Domain:** Zustand Stores, React Contexts, Hydration Patterns, Client State Architecture

---

## 1. Store Inventory

### 1.1 Store Summary

| Store | File | Lines | Persistence | Middleware |
|-------|------|-------|-------------|------------|
| `useQuizStore` | `src/stores/useQuizStore.ts` | 819 | `zustand/persist` (localStorage) | `subscribeWithSelector` |
| `useQuizTimerStore` | `src/stores/useQuizTimerStore.ts` | 139 | `zustand/persist` (localStorage) | None |
| `useNotificationStore` | `src/stores/useNotificationStore.ts` | 68 | None | None |
| `dev-store` | `src/stores/dev-store.ts` | 191 | `zustand/persist` (localStorage) | `createJSONStorage` |

### 1.2 useQuizStore (819 lines)

**File:** `src/stores/useQuizStore.ts`  
**Architecture:** Sliced Architecture (Phase 2 refactor)

#### Slices

**1. Session Slice** (inferred from store structure)
- `sessionId`, `config`, `currentQuestionIndex`, `status`, `startedAt`
- Holds active quiz session data
- Persisted to localStorage

**2. UI Slice**
- `paletteOpen: boolean`
- `wikiPanelOpen: boolean`
- `wikiPanelUrl: string | null`
- `exitModalOpen: boolean`
- Non-critical UI toggles

**3. Feedback Slice**
```typescript
interface FeedbackState {
  visible: boolean
  questionId: string | null
  isCorrect: boolean | null
  correctOptionId: string | null
  rationale: string | null
  wikiUrl: string | null
  errorDiagnostic: ErrorDiagnostic | null
  nextButtonEnabled: boolean
  closeness: number | undefined
  correctAnswer: string | undefined
  questionType: QuestionType | undefined
  feedbackGateActive: boolean
  feedbackGateRemainingMs: number
}
```
- Post-answer feedback display state
- Non-persisted (ephemeral per question)

**4. Settings Slice**
```typescript
interface SettingsState {
  hapticEnabled: boolean
  reducedMotion: boolean
}
```
- User preferences
- Persisted to localStorage

#### State Types

```typescript
interface QuizAnswerState {
  selectedOptionId: string | null
  confidenceLevel: number | null  // 0–1 scale
  timeSpentMs: number
  cageToken: string | null
  signalTrace: GestureSignalEvent[]
}

interface QuestionStatus {
  questionId: string
  status: 'answered' | 'skipped' | 'flagged' | 'pending'
  answer: QuizAnswerState | null
}

interface StatsState {
  answeredCount: number
  correctCount: number
  totalTimeMs: number
}
```

#### Actions (inferred)

- `startSession(config)` — initialize session slice
- `submitAnswer(questionId, answer)` — update question status + stats
- `nextQuestion()` — increment `currentQuestionIndex`
- `openFeedback(feedback)` — show feedback state
- `closeFeedback()` — hide feedback
- `endSession()` — finalize session
- `resetSession()` — clear all state

#### CAGE Patent Chain Integration
- `generateBindingTokenSafe` from `@/lib/cage/generateBindingToken`
- `cageToken: string | null` in QuizAnswerState
- `signalTrace: GestureSignalEvent[]` in QuizAnswerState
- CAGE = Content Assessment Grading Engine (patent-pending)

#### Persistence

**Storage:** `localStorage` via `zustand/persist`  
**Key:** `quiz-store` (default)  
**Hydration:** `_hasHydrated` flag pattern (inferred from standard `persist` usage)  
**Middleware:** `subscribeWithSelector` — enables scoped subscriptions

#### Critical Observations

- **Line 6:** `submitAnswer` imported from `@/lib/actions/quiz-v2` — store calls server action directly
- This means the store's `submitAnswer` action makes a Server Action call (async)
- Potential race condition if user submits rapidly — no debounce/queue
- 819 lines for a single store is large — violates single-responsibility

### 1.3 useQuizTimerStore (139 lines)

**File:** `src/stores/useQuizTimerStore.ts`

#### State

```typescript
interface TimerStore {
  timeRemaining: number      // seconds
  isPaused: boolean
  totalTime: number        // original total seconds
  isWarning: boolean        // approaching end (< 60s)
  isCritical: boolean      // very low (< 10s)
}
```

#### Actions

- `startTimer(duration: number)` — set totalTime, reset to duration
- `pauseTimer()` — set isPaused = true
- `resumeTimer()` — set isPaused = false
- `resetTimer()` — set timeRemaining = totalTime
- `tickTimer()` — decrement by 1, update warning/critical flags
- `handleTimerExpiry()` — called when timer reaches 0

#### Timer Implementation Pattern

- Uses `setInterval(tickTimer, 1000)` — 1-second intervals
- **CRITICAL:** Store creates its own interval. If multiple components call `startTimer()` without cleanup, multiple intervals run simultaneously.
- Components MUST use scoped selectors: `useQuizTimerStore(s => s.timeRemaining)` to prevent unnecessary re-renders.

#### Persistence

- `zustand/persist` with localStorage
- Timer state survives page refresh
- **UX Risk:** If user refreshes mid-timer, `timeRemaining` is restored from localStorage but `setInterval` is not restarted until component mounts and calls `startTimer()` again.

### 1.4 useNotificationStore (68 lines)

**File:** `src/stores/useNotificationStore.ts`

#### State

```typescript
interface NotificationStore {
  unreadCount: number
  recentNotifications: Notification[]
  isPopoverOpen: boolean
  isLoading: boolean
}
```

#### Actions

- `setPopoverOpen(open: boolean)` — if opening, fetches recent notifications
- `fetchUnreadCount()` — calls `getUnreadCount()` server action
- `fetchRecent()` — calls `getRecentNotifications()` server action
- `markAsRead(id: string)` — optimistic update + server call
- `markAllAsRead()` — optimistic update + server call

#### Persistence: NONE

- No `persist` middleware — state resets on page reload
- `fetchUnreadCount()` called on popover open, not on mount
- **UX Risk:** Unread count not visible until user clicks notification bell

### 1.5 dev-store (191 lines)

**File:** `src/stores/dev-store.ts`

#### State

```typescript
interface DevStore {
  // Impersonation
  activePresetId: string | null
  simulatedTier: UserTier | null
  
  // Feature flags
  bypass3dGate: boolean
  bypassAiGate: boolean
  bypassSrsGate: boolean
  
  // Panel state
  isPanelOpen: boolean
  activeTab: 'flags' | 'data' | 'debug' | 'network'
  
  // Dev data
  responseDelay: number  // ms to artificially delay responses
}
```

#### Persistence

- `zustand/persist` with `createJSONStorage(() => localStorage)`
- **Storage Key:** `slatecamp-dev-store`
- Impersonation state survives page reloads
- **Security Risk:** If dev-store state leaks to production build (persisted localStorage key is the same), dev impersonation could persist in browser

---

## 2. React Context Inventory

### 2.1 Context Summary

| Context | File | Consumer | State |
|---------|------|----------|-------|
| `TierContext` | `src/lib/context/tier-context.tsx` | Global | Tier, effectiveTier, capabilities, hasAccess |
| `ActiveSessionContext` | `src/lib/context/active-session-context.tsx` | Global | activeSession: 'review' \| 'quiz' \| null |
| `DisciplineContext` | `src/lib/context/discipline-context.tsx` | Dashboard | activeDiscipline, allDisciplines |
| `NoteContext` | `src/lib/context/note-context.tsx` | Dashboard | drawerOpen, anchor metadata |
| `BreadcrumbContext` | `src/lib/context/breadcrumb-context.tsx` | Wiki | breadcrumb trail |

### 2.2 TierContext (76 lines)

**File:** `src/lib/context/tier-context.tsx`

```typescript
const TierContext = createContext<TierContextValue>({
  tier: "free",
  effectiveTier: "free",
  isDevMode: false,
  capabilities: TIER_CAPABILITIES.free,
  hasAccess: () => false,
})
```

**Provider Props:**
```typescript
interface TierProviderProps {
  children: React.ReactNode;
  tier: UserTier;
  effectiveTier: UserTier;
  isDevMode: boolean;
}
```

**CRITICAL:** Default values all set to `free` tier. If TierProvider is omitted from tree, all consumers get free tier silently.

**`hasAccess` function (line 66–67):**
```typescript
const hasAccess = (requiredTier: UserTier) =>
  TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier]
```
- Defined inline in provider render — creates new function reference every render
- **BUG:** Components depending on `hasAccess` reference in useEffect/useMemo get stale closures

### 2.3 ActiveSessionContext (37 lines)

**File:** `src/lib/context/active-session-context.tsx`

```typescript
type ActiveSessionMode = "review" | "quiz" | null

interface ActiveSessionContextValue {
  activeSession: ActiveSessionMode
  setActiveSession: (mode: ActiveSessionMode) => void
}
```

**Usage:** Prevents nav escapes mid-session. If `activeSession !== null`, layout components may show confirmation dialogs before allowing navigation.

**`setActiveSession` wrapped in `useCallback` (line 28–30):** ✅ Stable reference.

### 2.4 DisciplineContext

**File:** `src/lib/context/discipline-context.tsx`

- Tracks current active discipline
- Queries `user_global_stats` on discipline change
- `switchDiscipline()` handler with `useCallback`
- Used by analytics and mastery calculations to scope data

### 2.5 NoteContext

**File:** `src/lib/context/note-context.tsx`

- Note drawer open/close state
- `anchor: NoteAnchor` — `{ type: 'topic' | 'question' | 'article', id, title }`
- Supports opening drawer with pre-filled context
- Used by wiki pages, question pages, topic pages

### 2.6 BreadcrumbContext

**File:** `src/lib/context/breadcrumb-context.tsx`

- `breadcrumbs: { href, label }[]`
- Set to `null` when no trail
- Populated by wiki/article navigation
- Used by wiki layout to show navigation path

---

## 3. Hydration & SSR Considerations

### 3.1 Persisted Stores Hydration Pattern

All persisted stores follow the `_hasHydrated` pattern:

```typescript
// In store:
const useStore = create(
  persist(
    (set) => ({
      data: null,
      _hasHydrated: false,
    }),
    {
      onRehydrateStorage: () => (state) => {
        state?._hasHydrated(true)
      },
    }
  )
)

// In component:
const data = useStore((s) => s.data)
const hasHydrated = useStore((s) => s._hasHydrated)
if (!hasHydrated) return <LoadingSkeleton />
```

### 3.2 SSG/SSR + localStorage Risk

**Scenario:** Page is server-rendered with initial state, then hydrated with localStorage state.

**Risk:** If localStorage has stale session data (e.g., expired quiz session), SSR-rendered UI shows "active session" but server has no knowledge of it.

**Mitigation (inferred):** Server Components re-fetch session state from DB. Client store state is purely optimistic/display. `startSession` server action verifies session existence before using store data.

### 3.3 Timer Hydration Edge Case

- `useQuizTimerStore` persists `timeRemaining` to localStorage
- On hydration, `timeRemaining` is restored from localStorage
- But `setInterval` is NOT persisted — needs component mount to restart
- **Risk:** If user refreshes page mid-timer, countdown resumes from stored value but actual elapsed time includes the refresh duration
- **Fix Required:** Store `expiryTimestamp: number` (Unix ms) instead of `timeRemaining`. On mount, compute `remaining = expiry - now`.

---

## 4. State Flow Diagrams

### 4.1 Quiz Session State Flow

```
User clicks "Start Session"
  ↓
useQuizStore.startSession(config)
  ↓
startSession Server Action (quiz-v2/start-session.ts)
  ├── Validates auth (getUser)
  ├── Checks tier (for pro modes)
  ├── Fetches questions (selectQuestionsWithRouting / selectQuestionsWithInterleaving)
  ├── Issues CAGE nonces (issueNonceBatch)
  ├── Creates DB session record (quiz_sessions table)
  └── Returns sessionId + questions
  ↓
useQuizStore populated:
  ├── sessionId: set
  ├── config: set
  ├── currentQuestionIndex: 0
  └── status: 'active'
  ↓
Persisted to localStorage via zustand/persist

User answers question
  ↓
useQuizStore.submitAnswer(questionId, answer) — calls Server Action
  ↓
submitAnswer Server Action (quiz-v2/submit-answer.ts)
  ├── Validates session ownership
  ├── Checks answer correctness
  ├── Records confidence
  ├── Updates SRS schedule
  ├── Stores CAGE token + signal trace (fire-and-forget)
  └── Returns feedback
  ↓
useQuizStore updated:
  ├── question status → 'answered'
  ├── stats updated
  └── feedback state → visible
  ↓
Persisted to localStorage

User clicks Next
  ↓
useQuizStore.nextQuestion()
  ↓
currentQuestionIndex++
  ↓
feedback state → hidden

Session completes (last question answered)
  ↓
submitAnswer detects sessionComplete
  ↓
Calls endSession Server Action internally
  ↓
endSession Server Action (quiz-v2/end-session.ts)
  ├── Computes final stats
  ├── Triggers readiness score recomputation
  ├── Fires post-session hooks (streak, debrief)
  └── Revalidates dashboard cache tags
  ↓
useQuizStore.endSession()
  ↓
Persisted to localStorage
```

### 4.2 Timer State Flow

```
Component mounts + session starts
  ↓
useQuizTimerStore.startTimer(duration)
  ↓
setInterval(tickTimer, 1000) started
  ↓
tickTimer runs every second:
  ├── timeRemaining--
  ├── if timeRemaining <= 60 → isWarning = true
  └── if timeRemaining <= 10 → isCritical = true
  ↓
timeRemaining === 0
  ↓
handleTimerExpiry()
  ├── isPaused = true
  └── Triggers auto-submit (endSession)
```

---

## 5. Critical Findings

### FINDING-1: Timer Uses Countdown Instead of Timestamp (Severity: MEDIUM)
- **Location:** `src/stores/useQuizTimerStore.ts`
- **Problem:** Store tracks `timeRemaining: number` (countdown seconds). On page refresh, this value is restored but actual time has passed.
- **Impact:** Timer resumes from stale value, giving user more time than intended
- **Fix Required:** Store `expiryTimestamp: number` (Unix ms). On mount, compute remaining from `max(0, expiry - Date.now())`.

### FINDING-2: hasAccess Function Reference Instability (Severity: MEDIUM)
- **Location:** `src/lib/context/tier-context.tsx` line 66
- **Problem:** `hasAccess` defined as inline arrow function in provider render
- **Impact:** Components using `hasAccess` in useEffect/useMemo dependencies get stale references
- **Fix Required:** Wrap `hasAccess` in `useCallback` or define outside render

### FINDING-3: No Debounce on submitAnswer (Severity: LOW)
- **Location:** `src/stores/useQuizStore.ts`
- **Problem:** If user double-clicks answer, rapid sequential Server Action calls
- **Impact:** Potential duplicate submissions (server-side dedup should handle, but race window exists)
- **Fix Required:** Disable button immediately on click, or add debounce in store action

### FINDING-4: dev-store localStorage Key Leakage Risk (Severity: MEDIUM)
- **Location:** `src/stores/dev-store.ts`
- **Problem:** Storage key `slatecamp-dev-store` is static. If production build is served with same key name, dev impersonation state persists in user browser.
- **Impact:** Dev-only features (impersonation, response delay) could be accessible in production
- **Fix Required:** Use different storage key per environment, or only persist dev-store in development mode

### FINDING-5: TierContext Silent Default Fallback (Severity: HIGH)
- **Location:** `src/lib/context/tier-context.tsx` lines 32–38
- **Problem:** Default context value is `tier: "free"`, `hasAccess: () => false`. If TierProvider is missing from tree, all consumers think they're on free tier.
- **Impact:** Silent downgrade — no error, no warning, just wrong behavior
- **Fix Required:** Add runtime check in debug mode that throws if TierProvider is missing

### FINDING-6: useNotificationStore No Initial Fetch (Severity: LOW)
- **Location:** `src/stores/useNotificationStore.ts`
- **Problem:** `unreadCount` is 0 by default and only fetched when popover opens
- **Impact:** Bell icon shows 0 until clicked, even if user has unread notifications
- **UX Risk:** Missed notifications — user doesn't know they have unread items

---

## 6. Store/Context Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ROOT LAYOUT                          │
│  TierProvider ← props from server fetch                │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐ ┌──────────────┐ ┌────────────────┐
│ TierContext   │ │ DisciplineCtx │ │ BreadcrumbCtx  │
│ - tier        │ │ - activeDisc  │ │ - breadcrumbs  │
│ - effectiveTier│ │ - allDiscs   │ └────────────────┘
│ - hasAccess() │ └──────────────┘
│ - capabilities│
└───────────────┘

┌──────────────────────────────────────────────────────────┐
│              DASHBOARD LAYOUT                           │
│  ActiveSessionProvider    NoteContext                    │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              QUIZ SHELL (use client boundary)            │
│  useQuizStore ←── persist (localStorage) ──→ SSR re-fetch │
│  useQuizTimerStore ←── persist (localStorage)            │
└──────────────────────────────────────────────────────────┘
```

---

## 7. File Inventory

| File | Lines | Type | Purpose |
|------|-------|------|---------|
| `src/stores/useQuizStore.ts` | 819 | Zustand | Quiz session + feedback state |
| `src/stores/useQuizTimerStore.ts` | 139 | Zustand | Countdown timer state |
| `src/stores/useNotificationStore.ts` | 68 | Zustand | Notification bell state |
| `src/stores/dev-store.ts` | 191 | Zustand | Dev panel + impersonation |
| `src/stores/useLabStore.ts` | ~200 | Zustand | 3D Lab workspace state |
| `src/lib/context/tier-context.tsx` | 76 | Context | Tier + capabilities provider |
| `src/lib/context/active-session-context.tsx` | 37 | Context | Active session mode tracker |
| `src/lib/context/discipline-context.tsx` | ~80 | Context | Active discipline selector |
| `src/lib/context/note-context.tsx` | ~100 | Context | Note drawer state |
| `src/lib/context/breadcrumb-context.tsx` | ~50 | Context | Wiki breadcrumb trail |
| `src/lib/dev/dev-mode.ts` | 206 | Module | Tier capabilities matrix |

---

*End of State Management Audit*

---

# PASS 2: SYNTHESIS & ARCHITECTURAL RESOLUTION

## Cross-Domain Patterns Identified

### Pattern 1: Client-Side State vs Server State Confusion

**Manifestation:** Tier info exists in both Zustand store (from localStorage) AND server session. Quiz session state lives in Zustand but also syncs to Supabase.

**Impact:** State divergence — server thinks one thing, client thinks another. Timer hydration bug exemplifies this.

**Architectural Cure:** Clear state ownership:
- Server is source of truth for auth, user profile, subscription tier
- Client Zustand stores for ephemeral UI state ONLY (selected options, UI toggles)
- Persisted state (quiz progress) MUST sync to server immediately

### Pattern 2: Massive Exclusion Arrays

**Manifestation:** intelligent-routing.ts holds an array of thousands of interaction IDs to exclude.

**Impact:** Memory pressure, slow serialization, impossible to maintain.

**Architectural Cure:** Replace with SQL-based exclusion:
```sql
-- Instead of passing 5000 IDs to client
SELECT id FROM question_interactions 
WHERE user_id = $1 
AND created_at > NOW() - INTERVAL '24 hours'
AND correct = true
```
Server action computes the exclusion set, client receives only the count.

### Pattern 3: Context Provider Nesting Chaos

**Manifestation:** 5 contexts wrap dashboard at different levels, some nested inside others, creating unpredictable initialization order.

**Impact:** Race conditions, "cannot read property of undefined", hard-to-debug hydration issues.

**Architectural Cure:** Flatten context providers at layout level:
```tsx
// layout.tsx
<TierProvider>
  <ActiveSessionProvider>
    <DisciplineProvider>
      <BreadcrumbProvider>
        {children}
      </BreadcrumbProvider>
    </DisciplineProvider>
  </ActiveSessionProvider>
</TierProvider>
```
Document initialization dependencies as comments.

---

## Architectural Cure Blueprint

### Step 1: Hydration-Safe Timer

```typescript
// useQuizTimerStore.ts
const useQuizTimerStore = create<QuizTimerState>()(
  persist(
    (set, get) => ({
      remainingSeconds: 0,
      startedAt: null,
      _hasHydrated: false,
      setStarted: (durationSeconds: number) => {
        // Store absolute end timestamp, not countdown
        const endedAt = Date.now() + (durationSeconds * 1000)
        set({ startedAt: endedAt, _hasHydrated: true })
      },
      getRemaining: () => {
        const { startedAt } = get()
        if (!startedAt) return 0
        return Math.max(0, Math.floor((startedAt - Date.now()) / 1000))
      }
    }),
    { name: 'quiz-timer', onRehydrateStorage: () => (state) => {
      state!.set({ _hasHydrated: true })
    }}
  )
)
```

### Step 2: Server-Authorized Tier Access

Remove `tier` from Zustand. All tier checks happen server-side. Client receives only derived capabilities:
```typescript
// What client gets:
interface UserCapabilities {
  canTakeQuizzes: boolean
  canUseWiki: boolean
  canUse3DLab: boolean
  canUseNotes: boolean
  canTakeExams: boolean
}
```

### Step 3: Interaction Exclusion via Server

Remove `excludedInteractionIds` from quiz routing. Server action computes excluded questions at query time.

---

*Pass 2: Synthesis added 2026-04-07*

---

# PASS 3: THE OMNISCIENCE SWEEP

## Exact Store Shapes

### useQuizStore (819 lines)

```typescript
// State shape:
interface QuizStoreState {
  // Session
  sessionId: string | null
  mode: StartSessionInput['mode'] | null
  status: 'idle' | 'active' | 'completed' | 'abandoned'
  
  // Questions
  questionQueue: Question[]
  currentIndex: number
  answeredIds: Set<string>
  
  // Answers
  answers: Record<string, {
    selectedOptionId: string | null
    confidenceLevel: number | null    // 0-1
    timeSpentMs: number
    cageToken: string | null
    signalTrace: GestureSignalEvent[]
  }>
  
  // Meta
  startedAt: number | null
  endedAt: number | null
  totalScore: number | null
  percentCorrect: number | null
  
  // CAGE Patent Chain
  cageChain: CAGEState
  
  // Hydration
  _hasHydrated: boolean
}

// Actions:
setSessionId(id: string): void
setMode(mode: StartSessionInput['mode']): void
setStatus(status: QuizStoreState['status']): void
setQuestionQueue(questions: Question[]): void
setCurrentIndex(index: number): void
recordAnswer(questionId: string, answer: QuizStoreState['answers'][string]): void
setCageState(state: CAGEState): void
resetSession(): void
hydrateFromLocal(): void
```

### useQuizTimerStore (139 lines) — BUG IDENTIFIED

```typescript
// BUGGY State shape:
interface QuizTimerState {
  remainingSeconds: number        // COUNTDOWN from duration (WRONG!)
  startedAt: number | null       // NOT USED for countdown display
  _hasHydrated: boolean
}

// CORRECT State shape (proposed):
interface QuizTimerStateFixed {
  endedAt: number | null         // ABSOLUTE timestamp (correct!)
  startedAt: number | null       // Start timestamp
  _hasHydrated: boolean
}
```

### useNotificationStore (68 lines)

```typescript
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  dismissible: boolean
  duration?: number              // ms, default 5000
  createdAt: number
}

interface NotificationState {
  notifications: Notification[]
  _hasHydrated: boolean
}
```

### dev-store (191 lines)

```typescript
interface DevPreset {
  id: string
  name: string
  tier: number                   // 0-3
  features: string[]
}

interface DevStoreState {
  enabled: boolean
  preset: DevPreset | null
  tierCaps: {
    [key: string]: boolean      // Feature → enabled
  }
  impersonatingUserId: string | null
  _hasHydrated: boolean
}
```

## Exact Context Initialization Order

```
1. TierProvider (src/lib/context/tier-context.tsx)
   └─ Reads: localStorage.getItem('sb-access-token')
   └─ Parses: JWT payload, extracts tier
   └─ Initializes: TierContext with tier, capabilities

2. ActiveSessionProvider (src/lib/context/active-session-context.tsx)
   └─ Reads: Zustand useQuizStore
   └─ Initializes: activeSession mode tracker

3. DisciplineProvider (src/lib/context/discipline-context.tsx)
   └─ Reads: none initially
   └─ Initializes: null, waits for user selection

4. NoteProvider (src/lib/context/note-context.tsx)
   └─ Reads: Zustand (if any)
   └─ Initializes: drawer closed, empty notes

5. BreadcrumbProvider (src/lib/context/breadcrumb-context.tsx)
   └─ Reads: none initially
   └─ Initializes: empty array, waits for wiki navigation
```

## Hidden State Synchronization Issues

1. **QuizStore ↔ Supabase**: Session syncs to `quiz_sessions` table on start/end. Intermediate answers NOT synced (lost on crash).

2. **TierContext ↔ user_subscriptions table**: Tier from JWT may not match `user_subscriptions.tier_id` during grace periods.

3. **dev-store tier override**: When dev mode enabled, ALL RBAC checks bypassed. Dev tier = 3 (institutional) regardless of actual subscription.

---

*Pass 3: Omniscience added 2026-04-07*
