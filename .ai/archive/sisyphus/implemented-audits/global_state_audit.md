# Global State & Memory Audit: 2026-04-04

## 📊 Executive Summary
The state architecture is currently dominated by **Monolithic Store Slabs** where high-frequency transient data (timers, gesture buffers) is co-located with stable session metadata. This topology triggers **recursive render waterfalls** across the UI and creates **unbounded memory retention** in long-running interactive sessions. The biggest threat is the **1Hz Global Invalidation Pulse** in `useQuizStore`, which forces reconciliation of the entire quiz shell and its non-memoized children every second.

## 🧠 State Slicing & Render Cascades
| Severity | Location (File/Line) | Mechanism of Render Failure | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `src/stores/useQuizStore.ts:160` | **High-Frequency Co-location**: UI state (modals), session data (questions), and the 1Hz timer are all in one store. Even with selectors, the constant mutation of the `timer` object every second creates high overhead in the Zustand subscriber tree. | **Store Slicing**: Decouple the `timer` and `ui` states into independent, atomic slices. Ensure the main `QuizShell` only subscribes to stable session metadata. |
| **HIGH** | `src/components/quiz-v2/QuizShell.tsx:55` | **Object-Level Subscription**: `QuizShell` subscribes to the entire `timerState` and `feedbackState` objects. Any change to a single sub-property (e.g., `elapsedMs`) triggers a re-render of the shell, even if other properties are unused. | **Granular Selection**: Components must select primitive values (e.g., `state => state.timer.isRunning`) rather than objects to prevent redundant renders from object reference changes. |
| **MED** | `src/stores/useLabStore.ts:100` | **Globalized View State**: Simple booleans like `labelsVisible` or `cameraIsOrbiting` are hoisted to a global store. This causes the entire 3D Lab UI to re-evaluate on every frame of camera movement. | **Localized UI State**: Move high-frequency view state (like `cameraIsOrbiting`) to component-local `useState` or a specialized `useFrame` hook to bypass the global React tree. |

## 🗑️ Memory Bloat & Transient State Leaks
| Severity | Location (File/Line) | Memory Leak / Bloat Flaw | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/stores/useQuizStore.ts:133` | **Transient Buffer Hoisting**: `pendingSignalBuffer` (gesture events) is stored globally. In high-latency sessions or with complex gestures, this array can grow to thousands of events before being cleared, bloating the heap unnecessarily. | **Buffer Localization**: Move raw gesture capture to a `useRef` or local state. Only push the final, processed signal to the global store during submission. |
| **HIGH** | `src/stores/useQuizStore.ts:470` | **Persistent Map Accumulation**: The `answers` Map and `eliminatedOptions` are persisted to `localStorage`. In multi-hour study sessions, these structures accumulate hundreds of entries that remain in memory long after a session is "finished." | **Garbage Collection Policy**: Implement an explicit `clearSessionData` method that purges these maps from memory and storage once a session transition to 'results' is confirmed. |
| **MED** | `src/stores/useNotificationStore.ts:25` | **Function-in-State Anti-pattern**: The `_cleanup` function is stored directly in the Zustand state. This prevents serializability and can lead to memory leaks if the cleanup reference is lost during a store update. | **Effect-Based Cleanup**: Move subscription lifecycle management to a dedicated `useEffect` hook within a `NotificationProvider` rather than storing functions in the state tree. |

## 🔄 Next.js Hydration & Boundary State
| Severity | Location (File/Line) | Sync Flaw | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/stores/useQuizStore.ts:173` | **Eager Browser Detection**: `defaultSettings` reads `window.matchMedia` immediately. This causes a deterministic hydration mismatch where the server renders `false` and the client renders `true` (if reduced motion is on), triggering a React error. | **Two-Pass Hydration**: Initialize settings with a safe default (e.g., `false`) and update them via a `useEffect` inside a dedicated settings provider to ensure a clean hydration handoff. |
| **MED** | `src/stores/useQuizStore.ts:466` | **Persistence Rehydration Race**: `JSONStorage` hydration happens asynchronously. If a component reads `status` before the store is hydrated from `localStorage`, the UI will flash 'idle' before snapping to 'active'. | **Hydration Gating**: Use the Zustand `persist.onRehydrateStorage` hook to maintain a `_hasHydrated` flag, and gate the render of sensitive UI shells until hydration is complete. |

## 🗺️ Strategic Implementation Roadmap
1. **Phase 1: Selector Optimization**
   - Refactor all `useQuizStore` calls in `QuizShell` and its children to use primitive-only selectors.
   - Extract the `Timer` subscription to a specialized leaf component to isolate its re-render pulse.

2. **Phase 2: Store Slicing & Domain Isolation**
   - Break `useQuizStore` into three slices: `SessionSlice` (stable), `UISlice` (transient), and `StatsSlice` (computed).
   - Move `pendingSignalBuffer` out of global state and into component-local refs.

3. **Phase 3: Memory Cleanup Protocol**
   - Implement explicit `reset()` calls for `useLabStore` and `useQuizStore` on component unmount or session end to flush large Sets and Maps.
   - Standardize on a "Hydration Safe" pattern for all browser-dependent state (reduced motion, haptics) using `useEffect` updates.
