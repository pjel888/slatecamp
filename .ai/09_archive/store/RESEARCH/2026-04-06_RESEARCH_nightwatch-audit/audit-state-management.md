# MASTER ARCHITECTURE BLUEPRINT: STATE MANAGEMENT
**Status:** UNIFIED (Panopticon V8)

## 1. Executive Vulnerability Summary
1. **CRITICAL: Timer Hydration Bug:** `useQuizTimerStore` persists `remainingSeconds` to `localStorage`. On page refresh, the countdown resumes from the stored value, giving the user "extra time" equal to the refresh duration (e.g., if refresh took 5s, the user gets +5s).
2. **HIGH: Context Initialization Chaos:** 5 separate contexts (`Tier`, `ActiveSession`, `Discipline`, `Note`, `Breadcrumb`) wrap the dashboard layout. Overlapping state dependencies between them cause unpredictable hydration orders and "cannot read property of undefined" errors in consumer components.
3. **MEDIUM: Stable Reference Defect:** `TierContext` and `ActiveSessionContext` define functions (`hasAccess`, `setActiveSession`) inline. This triggers continuous re-renders and stale closures in components using these as dependency-array items.

## 2. Exhaustive System Inventory

### 2.1 Zustand Store Registry
- **`useQuizStore` (819 lines):** Sliced architecture (Session, UI, Feedback, Settings). Persisted to `localStorage`. Integrates CAGE patent chain tokens.
- **`useQuizTimerStore` (139 lines):** Manages countdown logic with `setInterval`. Persisted (with known hydration bug).
- **`useNotificationStore` (68 lines):** Ephemeral state (not persisted). Unread count is ONLY fetched when popover opens (UX risk).
- **`dev-store` (191 lines):** Persisted state for impersonation presets, simulated tiers, and bypass flags.

### 2.2 React Context Inventory
- **Global:** `TierContext` (tier rank, capabilities), `ActiveSessionContext` (mode tracker).
- **Dashboard-Scoped:** `DisciplineContext` (subject selection), `NoteContext` (drawer state + anchor), `BreadcrumbContext` (wiki trail).

## 3. Data Flow & Exact Payloads

### 3.1 `useQuizStore` Slice Topology
```typescript
interface QuizStoreState {
  sessionId: string | null;
  status: 'idle' | 'active' | 'completed' | 'abandoned';
  currentIndex: number;
  questionQueue: Question[];
  answers: Record<string, {
    selectedOptionId: string | null;
    confidenceLevel: number | null;
    timeSpentMs: number;
    cageToken: string | null;
    signalTrace: GestureSignalEvent[];
  }>;
}
```

### 3.2 Tier Context Initialization
1. Reads `sb-access-token` from `localStorage`.
2. Decodes JWT payload to extract `user_metadata.tier`.
3. Maps tier index (0..3) to `TIER_CAPABILITIES` matrix.

## 4. Extreme Edge-Case & Concurrency Vulnerabilities
- **Concurrency: Timer Interval Collision:** `useQuizTimerStore` creates an interval on `startTimer`. If multiple components call `startTimer` without cleanup, multiple intervals run simultaneously, causing the clock to "tick faster" than real-time.
- **Idempotency: Submit-Answer Race:** `useQuizStore.submitAnswer` calls a server action directly. If a user clicks an answer choice twice in <300ms, the store fires two concurrent async calls. No debouncing or locking is implemented in the store action.
- **Hydration: Store-Server Desync:** If a user completes a quiz in Tab A, the server marks the session 'completed'. Tab B's persisted `useQuizStore` still thinks it's 'active'. Submitting an answer from Tab B will cause a server error, potentially crashing the client.
- **Security: dev-store Persistence:** `slatecamp-dev-store` persists in production. If a dev visits production, their local impersonation state can leak into the live app environment.

## 5. The Unified Resolution Blueprint

### 5.1 Hydration & Sync
1. **Timestamp-Based Timer:** Replace `remainingSeconds` with `endedAt` (absolute Unix ms). On hydration, compute `remaining = max(0, endedAt - Date.now())`.
2. **Atomic Context Shell:** Wrap all 5 context providers in a single `DashboardProviderShell` with a strict initialization sequence: `Tier` → `Discipline` → `ActiveSession`.
3. **Storage Events:** Implement `onRehydrateStorage` listeners to force-update state across tabs when `localStorage` changes (Zustand `subscribeWithSelector`).

### 5.2 Performance & Safety
1. **Stabilize Selectors:** Wrap `hasAccess` and other context functions in `useCallback`.
2. **Submit Locking:** Add `isSubmitting` flag to `useQuizStore` feedback slice. Disable all answer inputs while `isSubmitting === true`.
3. **Environment Guard:** Prefix the dev-store persistence key with `process.env.NODE_ENV` to isolate development impersonation from production usage.
4. **Optimistic Sync:** Perform a "heartbeat" sync between `useQuizStore` and the server every 5 questions to ensure persistence survives session-level crashes.
