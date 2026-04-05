# Frontend Architecture Audit: 2026-04-04

## 📊 Executive Summary
The frontend architecture exhibits critical performance degradation due to a **monolithic state topology** and **recursive render waterfalls**. The primary threat is the **1Hz Main-Thread Pulse**—where the global `useQuizStore` timer tick forces a full re-render of the `QuizShell` and its non-memoized sub-tree (Header, Body, Footer) every second. This constant reconciliation prevents main-thread idle time, degrades INP (Interaction to Next Paint) during long sessions, and wastes mobile battery life through redundant DOM diffing.

## 🔍 Missing Context Dependencies
- `src/components/quiz-v2/QuestionColumn.tsx` (Referenced in QuizBody)
- `src/components/quiz-v2/OptionsColumn.tsx` (Referenced in QuizBody)
- `src/components/quiz-v2/GenerationInput.tsx` (Referenced in QuizBody)
- `src/hooks/useReducedMotion.ts` (Referenced in QuizShell)
- `src/lib/actions/quiz-v2.ts` (Server Actions used in QuizShell/Store)

## ⚛️ React Rendering & State Bottlenecks
| Severity | Location (File/Line) | Mechanism of Render Failure | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `src/components/quiz-v2/QuizShell.tsx:55` | **Timer-Induced Global Re-render**: `QuizShell` subscribes to the entire `timerState` object. Every 1000ms `tickTimer` call creates a new state object, forcing `QuizShell` to re-render. Since children are not memoized, the entire quiz UI re-renders every second regardless of user interaction. | **Timer Isolation**: Extract the timer subscription into a leaf-node `TimerDisplay` component. `QuizShell` must not subscribe to high-frequency state like `elapsedMs`. |
| **HIGH** | `src/stores/useQuizStore.ts:365` | **Massive Map Cloning**: `answers` is stored as a `Map`. Every `selectAnswer` or `toggleFlag` call clones the entire Map to trigger Zustand reactivity. In sessions with 100+ questions, this creates significant GC pressure and O(n) overhead for simple updates. | **Atomic State Normalization**: Transition from a single `answers` Map to normalized state or use a more performant immutable structure (e.g., Immer) if Map cloning is unavoidable. |
| **HIGH** | `src/components/quiz-v2/QuizShell.tsx:216` | **Sub-tree Cache Invalidation**: `QuizBody`, `QuizHeader`, and `QuizFooter` receive numerous props derived from the store but are not wrapped in `React.memo`. They re-render on every parent change, even if their specific props (like `question`) haven't changed. | **Strict Memoization**: Wrap all top-level `QuizShell` children in `React.memo` and ensure props are stable (primitive values or stable callbacks). |
| **MED** | `src/components/quiz-v2/QuizShell.tsx:143` | **Derived Data Recalculation**: `flaggedSet` is re-computed using `useMemo` on every `answers` Map change. While necessary, the frequency of `answers` updates makes this a recurring main-thread task. | **Selector-Level Computation**: Move derived state computation into Zustand selectors with stable output references to avoid component-level `useMemo` thrashing. |

## ⚙️ Next.js Boundaries & Hydration
| Severity | Location (File/Line) | Boundary Leak / Bloat | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/app/quiz/[mode]/session/[id]/page.tsx` (Inferred) | **Hydration Payload Bloat**: Passing the full `questions` array and `config` object directly to `QuizShell` (Client Component) serializes the entire session data into the HTML. For long exams, this significantly increases Time to Interactive (TTI). | **Streaming & Client-Side Fetch**: Fetch minimal session metadata on the server; stream or fetch the full question set on the client to keep the initial HTML payload lean. |
| **MED** | `src/components/quiz-v2/QuizShell.tsx:1` | **Client Boundary Over-reach**: `QuizShell` acts as a "God Component," handling navigation, state, timer, and UI overlays. This forces a large bundle size for the initial quiz load. | **Interactivity Decoupling**: Defer the loading of heavy UI overlays (Submit Modal, Wiki Panel) using dynamic imports (`next/dynamic`) until needed. |

## 🧠 Main Thread, Assets & 3D/Animation Performance
| Severity | Location (File/Line) | Blocking Issue / Layout Thrash | Remediation Strategy (Plain Text Only) |
| :--- | :--- | :--- | :--- |
| **HIGH** | `src/components/quiz-v2/QuizShell.tsx:325` | **Key-Based Unmount/Remount**: Using `key={currentQuestion.question_id}` on the outer `div` forces the entire `QuizBody` and its children (MCQ options, rich text) to unmount and remount on every question change. This is expensive and clears local component state. | **Transition-Only Animation**: Remove the `key` from the structural wrapper. Use Framer Motion's `AnimatePresence` or CSS transitions that target content changes without forcing sub-tree destruction. |
| **MED** | `src/components/r3f/SceneInvalidator.tsx` | **Invalidation Redundancy**: If `SceneInvalidator` watches a store that contains high-frequency state (like the 1Hz timer), the R3F canvas may be invalidated and re-rendered needlessly, even if no visual data changed. | **Granular Invalidation**: Ensure the `inputVersion` selector only triggers on actual model/geometry input changes, explicitly excluding timer or UI metadata. |

## 🗺️ Strategic Implementation Roadmap
1. **Phase 1: Critical Main-Thread Blockers**
   - Implement `React.memo` on `QuizHeader`, `QuizBody`, and `QuizFooter`.
   - Extract `Timer` subscription from `QuizShell` into a standalone `TimerDisplay` component to stop the 1Hz global re-render loop.
   - Decouple `QuizShell` from the `timer` slice of the store.

2. **Phase 2: React State Optimization**
   - Refactor `useQuizStore` to use granular selectors in `QuizShell`.
   - Optimize `answers` Map updates; consider moving to a record-based object or using Immer for surgical state updates.
   - Move `flaggedSet` and `answeredCount` calculations into Zustand `subscribe` listeners or dedicated selectors to avoid per-render computation.

3. **Phase 3: Next.js Boundary Realignment**
   - Use `next/dynamic` for heavy, non-initial components: `ExitConfirmModal`, `SubmitConfirmModal`, `WikiSidePanel`, and `QuestionPalette`.
   - Analyze and prune the hydration payload for the `questions` array; only send data required for the current/next few questions.
   - Refactor `QuizShell` to remove the `key`-based remounting strategy in favor of transition-aware content replacement.
