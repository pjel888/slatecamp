# IMPLEMENTATION BLUEPRINT: STATE MANAGEMENT
**Generated:** Nightwatch Loop

## 1. Target File Matrix

### Zustand Store Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/stores/useQuizTimerStore.ts` | REWRITE | Replace elapsed with timestamp-based endedAt |
| `src/stores/useQuizStore.ts` | EXPAND | Add isSubmitting flag + heartbeat sync |
| `src/stores/dev-store.ts` | MODIFY | Add production guard for persistence |

### Context Files (Modify)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/context/tier-context.tsx` | REWRITE | Add useCallback for hasAccess |
| `src/lib/context/active-session-context.tsx` | REWRITE | Add useCallback for setters |

### New Files (Create)
| File Path | Action | Notes |
|-----------|--------|-------|
| `src/lib/context/dashboard-provider-shell.tsx` | CREATE | Atomic context wrapper |
| `src/lib/stores/heartbeat-sync.ts` | CREATE | Server sync utility |

---

## 2. Dependency Prerequisites

1. **No database migrations required** - client-side changes only
2. **No external NPM packages required** - use existing Zustand middleware

---

## 3. The Execution Steps (Micro-Granular)

### Step 1: Replace Timer with Timestamp-Based Calculation
- **File:** `src/stores/useQuizTimerStore.ts`
- **Action:** REWRITE timer logic
- **Logic Required:**
  ```typescript
  // BEFORE: Store elapsedMs, compute remaining
  // AFTER: Store endedAt (absolute timestamp), compute remaining
  
  interface QuizTimerState {
    sessionId: string | null
    startedAt: number | null      // Timestamp when timer started
    endedAt: number | null        // Timestamp when timer should end
    pausedAt: number | null        // If paused, timestamp of pause
    isRunning: boolean
    // ...
  }
  
  // startTimer now sets endedAt, not just limitMs
  startTimer: ({ limitMs, sessionId }) => {
    const now = Date.now()
    set({
      sessionId: sessionId ?? get().sessionId,
      startedAt: now,
      endedAt: limitMs ? now + limitMs : null,
      pausedAt: null,
      isRunning: true,
    })
  }
  
  // tickTimer now computes remaining from endedAt
  tickTimer: () => {
    const { isRunning, endedAt } = get()
    if (!isRunning || !endedAt) return
    
    const remaining = Math.max(0, endedAt - Date.now())
    if (remaining <= 0) {
      // Timer expired
    }
  }
  
  // On hydration, compute remaining from endedAt
  // This prevents "extra time" on refresh
  ```

### Step 2: Add Submit Locking to Quiz Store
- **File:** `src/stores/useQuizStore.ts`
- **Action:** ADD isSubmitting flag
- **Logic Required:**
  ```typescript
  // Add to state interface:
  interface QuizStoreState {
    // ... existing fields
    isSubmitting: boolean
    lastHeartbeatAt: number | null
  }
  
  // Add to actions:
  submitAnswer: async (questionId, answer) => {
    const { isSubmitting } = get()
    if (isSubmitting) return // Prevent double-submit
    
    set({ isSubmitting: true })
    try {
      const result = await submitAnswerAction(...)
      // Process result
    } finally {
      set({ isSubmitting: false })
    }
  }
  
  // In UI components, disable inputs when isSubmitting is true
  ```

### Step 3: Add Heartbeat Sync Every 5 Questions
- **File:** `src/lib/stores/heartbeat-sync.ts`
- **Action:** CREATE new utility
- **Logic Required:**
  ```typescript
  // src/lib/stores/heartbeat-sync.ts
  import { createClient } from "@/lib/supabase/server"
  
  export async function heartbeatSync(sessionId: string, currentIndex: number) {
    const supabase = await createClient()
    
    // Verify session is still active on server
    const { data: session } = await supabase
      .from('quiz_sessions')
      .select('status, current_question_index')
      .eq('session_id', sessionId)
      .single()
    
    if (!session || session.status === 'completed') {
      // Server says session is done - update local state
      return { synced: false, reason: 'session_completed' }
    }
    
    if (Math.abs(session.current_question_index - currentIndex) > 2) {
      // Server and client diverged significantly
      return { synced: false, reason: 'index_mismatch', serverIndex: session.current_question_index }
    }
    
    return { synced: true, serverIndex: session.current_question_index }
  }
  
  // Call this in useQuizStore every 5 questions:
  if (currentIndex % 5 === 0) {
    heartbeatSync(sessionId, currentIndex).then(result => {
      if (!result.synced) handleDesync(result.reason)
    })
  }
  ```

### Step 4: Add Production Guard to Dev Store
- **File:** `src/stores/dev-store.ts`
- **Action:** MODIFY persistence config
- **Logic Required:**
  ```typescript
  // At the persist config (line 176-189):
  {
    name: process.env.NODE_ENV === 'production' 
      ? 'slatecamp-prod-dev-store'  // Different key in production
      : 'cerebro-dev-store',
    storage: createJSONStorage(() => sessionStorage),
    // ... rest of config
    
    // Add skip in production
    skipHydration: process.env.NODE_ENV === 'production'
  }
  
  // ALSO: In the store initialization, check environment:
  // At start of store creator:
  if (process.env.NODE_ENV === 'production') {
    // Return store without persistence, or with limited state
    return create<DevState>()((set) => ({
      // ... minimal state
      isOverlayOpen: false,
      showDevBadges: false,
    }))
  }
  ```

### Step 5: Stabilize Tier Context with useCallback
- **File:** `src/lib/context/tier-context.tsx`
- **Action:** REWRITE with useCallback
- **Logic Required:**
  ```typescript
  import { useCallback, useMemo } from 'react'
  
  export function TierProvider({ children, tier, effectiveTier, isDevMode }: TierProviderProps) {
    // Memoize capabilities to prevent unnecessary re-computation
    const capabilities = useMemo(() => 
      TIER_CAPABILITIES[effectiveTier], 
      [effectiveTier]
    )
    
    // Stabilize hasAccess with useCallback
    const hasAccess = useCallback((requiredTier: UserTier): boolean => {
      return TIER_RANK[effectiveTier] >= TIER_RANK[requiredTier]
    }, [effectiveTier])
    
    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
      tier,
      effectiveTier,
      isDevMode,
      capabilities,
      hasAccess
    }), [tier, effectiveTier, isDevMode, capabilities, hasAccess])
    
    return (
      <TierContext.Provider value={value}>
        {children}
      </TierContext.Provider>
    )
  }
  ```

### Step 6: Stabilize Active Session Context
- **File:** `src/lib/context/active-session-context.tsx`
- **Action:** REWRITE with useCallback
- **Logic Required:**
  ```typescript
  import { useCallback, useMemo } from 'react'
  
  export function ActiveSessionProvider({ children, initialMode }: Props) {
    const [activeMode, setActiveMode] = useState<SessionMode | null>(initialMode ?? null)
    
    // Stabilize setter
    const setActiveSession = useCallback((mode: SessionMode | null) => {
      setActiveMode(mode)
    }, [])
    
    const clearActiveSession = useCallback(() => {
      setActiveMode(null)
    }, [])
    
    // Memoize value
    const value = useMemo(() => ({
      activeMode,
      setActiveSession,
      clearActiveSession,
      isActive: activeMode !== null
    }), [activeMode, setActiveSession, clearActiveSession])
    
    return (
      <ActiveSessionContext.Provider value={value}>
        {children}
      </ActiveSessionContext.Provider>
    )
  }
  ```

### Step 7: Create Atomic Context Shell
- **File:** `src/lib/context/dashboard-provider-shell.tsx`
- **Action:** CREATE new file
- **Logic Required:**
  ```typescript
  // src/lib/context/dashboard-provider-shell.tsx
  'use client'
  
  import { ReactNode } from 'react'
  import { TierProvider } from './tier-context'
  import { DisciplineProvider } from './discipline-context'
  import { ActiveSessionProvider } from './active-session-context'
  import { NoteProvider } from './note-context'
  import { BreadcrumbProvider } from './breadcrumb-context'
  
  interface DashboardProviderShellProps {
    children: ReactNode
    tier: UserTier
    effectiveTier: UserTier
    isDevMode: boolean
  }
  
  // STRICT INITIALIZATION ORDER: Tier → Discipline → ActiveSession
  // This ensures dependencies are resolved before consumers need them
  export function DashboardProviderShell({ 
    children, 
    tier, 
    effectiveTier, 
    isDevMode 
  }: DashboardProviderShellProps) {
    return (
      <TierProvider tier={tier} effectiveTier={effectiveTier} isDevMode={isDevMode}>
        <DisciplineProvider>
          <ActiveSessionProvider>
            <NoteProvider>
              <BreadcrumbProvider>
                {children}
              </BreadcrumbProvider>
            </NoteProvider>
          </ActiveSessionProvider>
        </DisciplineProvider>
      </TierProvider>
    )
  }
  ```

### Step 8: Add Storage Event Listener for Cross-Tab Sync
- **File:** `src/stores/useQuizStore.ts`
- **Action:** ADD cross-tab sync
- **Logic Required:**
  ```typescript
  // Add in store creator:
  subscribeWithSelector((set, get) => ({
    // ... existing state and actions
    
    // Cross-tab sync listener
    _initStorageListener: () => {
      if (typeof window === 'undefined') return
      
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'slatecamp-quiz-store' && e.newValue) {
          try {
            const newState = JSON.parse(e.newValue)
            // If server marked session as completed in another tab, sync:
            if (newState.state?.status === 'completed') {
              set({ status: 'completed' })
            }
          } catch {}
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }))
  
  // Call _initStorageListener() in a useEffect in the component that uses the store
  ```

### Step 9: Fix Timer Interval Collision
- **File:** `src/stores/useQuizTimerStore.ts`
- **Action:** ADD interval cleanup check
- **Logic Required:**
  ```typescript
  // In tickTimer, add guard:
  tickTimer: () => {
    const state = get()
    // Guard against multiple intervals
    if (!state.isRunning || state.sessionId === null) return
    
    // Double-check we shouldn't have already stopped
    if (state.endedAt && Date.now() >= state.endedAt) {
      set({ isRunning: false, colorState: 'critical' })
      handleTimerExpiry(state.sessionId)
      return
    }
    
    // ... rest of tick logic
  }
  ```

---

## 4. Testing & Validation Protocol

### Manual Verification
1. **Timer Hydration Test:** Start quiz with 60s timer, refresh page, verify timer resumes from correct position (not adding extra time)
2. **Submit Race Test:** Click answer twice rapidly - second click should be ignored
3. **Cross-Tab Test:** Complete quiz in Tab A, check Tab B's state updates
4. **Dev Store Test:** Open dev tools in production - verify no impersonation options appear

### Automated Checks
```bash
# Run existing tests
bun test

# Run lint
bun run lint

# Run type-check
bun run type-check
```

---

## 5. Rollback Strategy

### If Timer Breaks
- **Revert timer changes:** `git checkout HEAD~1 -- src/stores/useQuizTimerStore.ts`
- **Test:** Verify timer still works with old implementation

### If Context Breaks
- **Check initialization order:** Verify TierProvider wraps all other providers
- **Debug:** Add console.log in each provider to trace hydration order

### If Dev Store Breaks Production
- **Quick fix:** Add environment check at runtime to disable store entirely in production

---

## 6. Implementation Notes

### Key Files Referenced
- `src/stores/useQuizTimerStore.ts` - hydration bug at lines 104-121
- `src/stores/dev-store.ts` - persistence at line 177
- `src/lib/context/tier-context.tsx` - hasAccess inline at line 66
- `src/lib/context/active-session-context.tsx` - needs useCallback

### Success Criteria
1. Timer resumes from correct position on page refresh (no extra time gained)
2. Rapid double-clicks don't create duplicate submissions
3. Context functions have stable references across re-renders
4. Dev store doesn't persist in production
5. Cross-tab state stays synchronized