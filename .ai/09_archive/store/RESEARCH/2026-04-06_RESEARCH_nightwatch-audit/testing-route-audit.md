# Master Audit Plan: Full-Stack Testing Route Forensics

**Current Status:** Full-Stack ILXP Route Audit Complete (2026-04-07)
**Critical Findings:**
- **Hostile Tier-Gating:** Raw `Error` throws in Server Actions hard-crash the client router.
- **Database Scalability:** `intelligent-routing.ts` fetches and joins massive `interactedIds` arrays, risking query length failures.
- **UX Vulnerability:** No navigation guards in Quiz Shells; accidental back-button hits risk session inconsistency.

**Immediate Next Steps:**
1. **Centralize Auth/Tier Context:** Create `src/providers/SubscriptionProvider.tsx` to fetch and provide the user's tier globally at the root layout.
2. **Graceful Action Rejections:** Refactor `start-session.ts` to return typed `ActionResponse` objects instead of throwing raw errors.
3. **Database-Side RPC:** Create a PostgreSQL function for question selection/exclusion to eliminate massive array transfers in `intelligent-routing.ts`.

**Date:** 2026-04-07
**Scope:** Exhaustive Database, UX, Architecture, Tier-Gating, and State Analysis

## Section 1: Database & Query Autopsy
A microscopic analysis of the data layer reveals severe inefficiencies, N+1 querying loops, and concerning security bypasses.

**1. Query Inefficiencies & N+1 Loops:**
In `src/lib/actions/quiz-v2/end-session.ts`, the `buildSubjectBreakdown` function dynamically builds taxonomy metrics by extracting `topic_ids` from interactions. However, it implements a manual chunking loop:
```typescript
for (let index = 0; index < topicIds.length; index += 80) {
  const batch = topicIds.slice(index, index + 80)
  const { data } = await supabase
    .from('taxonomy_tree')
    .select('node_id, subject_area, discipline_id')
    .in('node_id', batch)
  // ...
}
```
*Autopsy:* This is a textbook N+1 (or N/80) query loop executed in a server action. Instead of executing a single SQL join or using a unified `.in()` array (Supabase PostgREST handles massive `IN` clauses seamlessly), it blocks the Node thread awaiting sequential database round-trips.

**2. Payload Bloat & Memory Leaks:**
In `src/lib/actions/quiz-v2/submit-answer.ts`, the validation query executes:
```typescript
const { data: question } = await supabase
  .from('questions')
  .select('question_id, topic_id, correct_option_id, rationale, difficulty, options, question_type, correct_value, value_tolerance, accepted_answers')
  .eq('question_id', parsedInput.questionId)
  .single()
```
*Autopsy:* Pulling `rationale` (which can contain massive JSON blobs, markdown, and embedded image URLs) and full `options` arrays during *every single answer submission* just to verify a UUID string (`correct_option_id`) causes massive network payload bloat. The `rationale` is only needed if `feedbackTiming === 'immediate'`, yet it is fetched unconditionally.

**3. Security & RLS Bypasses:**
`submit-answer.ts` leverages `createServiceClient()` at the top level, and later lazily imports `@/lib/supabase/admin` to write to `interaction_signal_traces` and `session_behavioral_summaries`.
*Autopsy:* Using the service role (admin) bypasses Row Level Security (RLS). While necessary for sensitive patent-logging, the scattershot usage of admin clients throughout standard quizzing logic masks potential authorization vulnerabilities.

## Section 2: UX Paths & UI Components
The user journey through the quizzing engine exposes critical blind spots in the Next.js App Router implementation.

**1. The Golden Path (Start Quiz):**
When a user clicks "Slide to start session" in `HeroConfigurator`, `setIsLoading(true)` fires. The `startSession` action is awaited, and if successful, `router.push('/quiz/custom/session/[id]')` is invoked.
*Autopsy:* Because `[sessionId]/page.tsx` is a Server Component that awaits `fetchQuestionsForClient` and `supabase.from('user_interactions')` before returning JSX, the UI will freeze on the dashboard (with the local `isLoading` spinner) for the duration of the server fetch. If the network drops, the router push silently fails with no Toast notification.

**2. The Submission Path:**
When `submitCurrentAnswer` runs in the Zustand store, it toggles `status: 'submitting'`, hits the `submitAnswer` server action, and then evaluates `feedbackTiming === 'immediate'`.
*Autopsy:* The offline fallback (`queueOfflineSubmission`) is robust, but the race condition guard is weak. A user spam-clicking options before `status === 'submitting'` commits to the React render cycle can queue duplicate actions.

**3. Component Matrix:**
- `StandardQuizShell.tsx`: A bloated God Component. It manages the timer interval, background data fetching, and renders the entire quiz tree.
- `TimerTicker.tsx` / `TimerDisplay.tsx`: Because they hook into `useQuizTimerStore`, if they don't strictly use `useShallow`, they trigger re-renders up the tree.

## Section 3: DX & Tier-Gating Autopsy
The Tier-Gating infrastructure is fundamentally broken, actively causing runtime crashes rather than graceful paywalls.

**1. The Authorization Waterfall:**
The Edge (`src/lib/supabase/middleware.ts`) explicitly ignores tier validation, meaning it allows free users to access Pro routes. The burden of gating is entirely offloaded to individual Server Actions (`startSession`).

**2. Destructive DX Anti-Patterns:**
In `start-session.ts`, the validation block executes:
```typescript
if (!isPro && !isDevBypass) {
  throw new Error(`The ${modeDef.label} mode requires a Pro subscription.`)
}
```
*Autopsy:* Throwing a generic JavaScript `Error` inside a Server Action is a catastrophic DX anti-pattern in Next.js. It bypasses React error boundaries, hard-crashes the client-side router, and displays an unstyled console stack trace to the user.

**3. Prop-Drilling over Context:**
`ReviewHub.tsx` explicitly requires `userTier: string` as a prop. Every server page rendering the Hub must independently query the database for the user's tier and drill it down the component tree.
*The Blueprint:* The app desperately needs a `<SubscriptionProvider>` (React Context) populated at the root layout, alongside a `<ProGate>` component to effortlessly wrap and obscure premium UI elements.

## Section 4: State Vulnerabilities
The Interactive Learning Experience Platform (ILXP) engine's state management is fragile.

**1. Hydration Mismatch via Zustand Persist:**
`useQuizStore` utilizes `zustand/persist` wired to `localStorage`. Because Next.js SSRs `StandardQuizShell` to HTML using the default empty state, the moment the client loads, Zustand injects the persisted `localStorage` answers.
*Autopsy:* This forces a severe hydration mismatch, flashing the UI and risking React tree corruption. The shell MUST be gated behind an `if (!hasHydrated) return <Loader />` block.

**2. Re-Render Cascades:**
`useQuizTimerStore` ticks every 1000ms. Any component subscribing to this store without precise `useShallow` selectors will force a full React reconciliation cycle every single second, destroying performance on mobile devices.

## Section 5: The Execution Blueprint
To rectify these profound architectural flaws, the following strict execution plan must be implemented:

1. **Step 1: Centralize Auth/Tier Context:**
   - Create `src/providers/SubscriptionProvider.tsx` to fetch and provide the user's tier globally.
   - Build a `<ProGate>` wrapper component.
   - Strip `userTier` prop drilling from all `/dashboard/testing` server pages and the `ReviewHub`.

2. **Step 2: Graceful Action Rejections:**
   - Refactor `start-session.ts` and all quiz Server Actions to return structured `ActionResponse` objects (e.g., `{ success: false, error: "requires_pro_tier" }`).
   - Catch these responses in the UI and trigger a `<PaywallModal />` or Toast.

3. **Step 3: Fix Hydration Flaws & Render Cascades:**
   - Refactor `StandardQuizShell` to strictly gate rendering behind `useQuizStore((s) => s._hasHydrated)`.
   - Audit `TimerDisplay.tsx` and enforce `useShallow((s) => s.elapsedMs)` on all Zustand timer subscriptions.

4. **Step 4: Database Query Optimization:**
   - Rewrite the chunking loop in `end-session.ts`'s `buildSubjectBreakdown` into a single, unified `.in()` query.
   - Trim the `.select()` payload in `submit-answer.ts` to only fetch `rationale` if the session's feedback timing explicitly requires it.

## Audit Run: 2026-04-07 03:08:17
- **Section 1: ILXP Testing Modes & Configurations:**
  The codebase defines modes in `src/lib/constants/testing-modes.ts` and `src/types/testing.ts`, with an evolving `v2` config in `src/types/quiz-config.ts`.
  | Key | Mode Source | Zone | Feedback | Timer | Pro? |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | `camp` | `camp_mode` | 1 | Immediate | No | No |
  | `chill` | `chill_mode` | 1 | Immediate | No | No |
  | `subject` | `subject_mode` | 2 | Immediate | No | Yes |
  | `focus-review` | `focus_review` | 2 | Immediate | No | Yes |
  | `custom` | `custom_session` | 2 | Immediate | No | Yes |
  | `storm` | `storm_mode` | 3 | Deferred | Yes | Yes |
  | `simulation` | `proof_simulation` | 3 | Deferred | Yes | Yes |
  | `endurance` | `extended_practice` | 3 | Immediate | No | Yes |
  | `article-review` | `article_review` | 1 | Immediate | No | No |

  *Configuration Variances:*
  - `dbTestMode`: maps to `camp`, `chill`, `storm`.
  - `v2 config`: uses nested JSONB (`setup`, `timer`, `feedback`, `navigation`, `results`, `breaks`).

  *Missing Implementations:*
  - `trail_quiz`, `assessment_quiz`, `blindspot_queue` are defined in `ModeSource` but lack entries in `MODE_DEFINITIONS` constant.
  - `fullexam` in `QuizMode` (v2) uses a different name than its `ModeSource` (`proof_simulation`).

- **Section 2: Event-Driven UX Paths:**
  1. **The Initialization Click ("Start Quiz"):**
     - `HeroConfigurator.tsx` uses `SlideToSubmit`.
     - `handleStart` sets `isLoading: true`.
     - `startSession` (Server Action) creates the session in DB.
     - `router.push("/quiz/custom/session/[sessionId]")` is called.
     - **Vulnerability:** Silent failure if `startSession` or the route's server-side data fetching fails.
  2. **The Submission Click:**
     - `QuizBody.tsx` (via `StandardQuizShell.tsx`) triggers `handleSubmit`.
     - `useQuizStore` -> `submitCurrentAnswer` is called.
     - `generateBindingTokenSafe` creates a CAGE token (Patent Claim 20).
     - `submitAnswer` (Server Action) is called.
     - UI updates optimistically with `status: 'submitting'`.
  3. **The Interruption Events:**
     - **Timer hits 0:00:** `useQuizTimerStore.ts` -> `tickTimer` calls `handleTimerExpiry(sessionId)` -> `endSession` (Server Action) with `endReason: 'timer_expired'`.
     - **Back Button:** NO navigation guard or `beforeunload` listener in the shells. `updateSessionProgress` (triggered by `currentIndex` changes) is the only persistent safeguard.

- **Section 3: Database & Query Autopsy:**
  - **N+1 Logic:** `start-session.ts` uses while loops (depth 3) to resolve taxonomy leaf nodes (1 query per level). `end-session.ts` manually chunks `taxonomy_tree` lookups in batches of 80.
  - **Payload Bloat:** `intelligent-routing.ts` fetches *every* interaction ID for a user to exclude them in a `NOT IN` query. If a user has 5,000 interactions, the query string explodes.
  - **Security Risk:** `submit-answer.ts` uses `createServiceClient()` (service role) to bypass RLS for patent logging, but this pattern is leaking into standard quiz logic.

- **Section 4: DX & Tier-Gating Autopsy:**
  - **Hostile Tier-Gating:** `start-session.ts` throws a raw `Error` on Pro-check failure. This breaks the Next.js router and displays a stack trace instead of a paywall.
  - **Fragmented Logic:** Every action/page (100+ grep matches) independently queries `user_subscriptions`.
  - **Missing Abstraction:** No `<SubscriptionProvider>` or `<ProGate>` component exists.

- **Section 5: The Execution Blueprint:**
  1. **Immediate:** Create `src/providers/SubscriptionProvider.tsx` and wrap the root layout.
  2. **Immediate:** Refactor `start-session.ts` to return `{ success: false, error: 'requires_pro_tier' }` and implement a `<PaywallModal />`.
  3. **High Priority:** Rewrite `intelligent-routing.ts` to use a database-side RPC for excluding answered questions (eliminating the massive `question_id` array transfer).
  4. **High Priority:** Refactor `StandardQuizShell.tsx` to include `beforeunload` and `popstate` listeners to prevent accidental session abandonment.
