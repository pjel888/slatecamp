# SlateCamp — Product Architecture & IP Implementation Prompt (Improved)

## Changelog vs. Original

> **Why this version is better:** The original prompt was a generic EdTech IRT/SRS prompt with no knowledge of SlateCamp's actual codebase, schema, naming conventions, stack decisions, or business model. It invented architecture from scratch instead of building on what exists. This version is grounded in reality — it references the actual `user_interactions` → `user_node_mastery` → Readiness Score loop, the actual Supabase schema, and SlateCamp's actual competitive moats. It also eliminates several dangerous assumptions the original made.

### What was wrong with the original:

1. **It ignored the existing mastery engine.** SlateCamp already has `user_interactions` → `user_node_mastery` (EMA-weighted) → Readiness Score → Blindspot targeting. The original prompt would produce a second, conflicting mastery system.
2. **It suggested Edge Functions for IRT computation.** Edge Functions have a 150ms cold start and 50MB memory limit. IRT item selection for a single user requires sub-10ms latency mid-quiz. PostgreSQL RPCs are the correct path — the original hedged ("pg_vector or Edge Functions?") instead of deciding.
3. **It treated IRT as a greenfield build.** SlateCamp's `questions` table already has `topic_id` taxonomy mapping. The schema needs IRT parameter columns *added*, not a new schema designed from scratch.
4. **It conflated SRS with IRT.** These are separate systems serving different user actions (SRS = review scheduling for known material; IRT = adaptive difficulty selection during active quiz sessions). The original prompt merged their design phases.
5. **"SYSTEM OVERRIDE & ELITE ROLE ASSIGNMENT" is prompt theater.** It wastes tokens on flattery that doesn't change model behavior. Replaced with concrete constraints.
6. **No reference to actual file paths, table names, or conventions.** A prompt that says "scan the codebase" without specifying SlateCamp's `src/lib/queries/`, `src/lib/actions/`, or `src/stores/` patterns produces generic output.
7. **Missing business constraints.** No mention of Philip as solo founder, bootstrap economics, or the commercialization priority ladder (B2C first → white-label → API licensing). Architecture decisions must respect these constraints.

---

## The Improved Prompt

Paste everything below the line into your AI assistant. Attach any existing codebase context, the domain model, and the mastery engine documentation.

---

**ROLE & CONSTRAINTS**

You are acting as SlateCamp's Staff-Level Product Architect. You have deep expertise in:
- Next.js 14+ App Router, React Server Components, Zustand for client state
- Supabase PostgreSQL (PostgREST API, RPC functions, triggers, RLS)
- Item Response Theory (IRT): Rasch, 2PL, 3PL models for adaptive testing
- Spaced Repetition algorithms: FSRS, SM-2, and EMA-based scheduling
- Educational psychology: adaptive difficulty UX, mastery visualization, learner motivation

**Hard constraints you must respect:**
- All DB writes go through Server Actions — never client-side Supabase writes
- RLS enabled on every public table. `(select auth.uid())` wrapped in subselect on high-traffic tables
- No `SELECT *` — explicit column lists everywhere
- Queries live in `src/lib/queries/[feature].ts`, mutations in `src/lib/actions/[feature].ts`
- Client state via Zustand only for quiz sessions and multi-component UI state
- IRT/SRS computation happens in PostgreSQL RPCs (not Edge Functions, not client-side)
- The platform is bootstrapped by a solo founder — architect for incremental deployment, not a 10-engineer sprint

**PROJECT OBJECTIVE**

Design the technical architecture to add two proprietary engines to SlateCamp's existing mastery loop:

1. **IRT Adaptive Testing Engine** — Replaces the current random/sequential question selection in quiz sessions with statistically optimal item selection based on student ability (theta) and item parameters (difficulty, discrimination, guessing).

2. **SRS Review Scheduling Engine** — Adds a spaced repetition layer on top of the existing `user_node_mastery` data so students get optimally-timed review sessions for taxonomy nodes they've previously studied.

Both engines must integrate with — not replace — the existing mastery loop:
```
user_interactions (immutable event log)
  → user_node_mastery (EMA-weighted per-topic mastery)
  → Readiness Score + Taxonomy Heatmap
  → Progression mechanics (Blindspot, Endurance, Proof, Camp Trail)
```

**EXECUTION PROTOCOL**

Execute in strict sequential phases. Stop after each phase and wait for approval. Do not write implementation code until Phase 5.

---

### Phase 1: Existing System Audit

**Action:** Map the current state of all systems that IRT and SRS will touch.

**Specific outputs required:**

| What to audit | Where to look | What to document |
|---|---|---|
| Question selection logic | Quiz session creation in `src/lib/actions/` and `src/stores/` | How are questions currently selected? Random? By topic? What's the entry point? |
| Question metadata | `questions` table schema | Which columns exist? What's missing for IRT (difficulty, discrimination, guessing params)? |
| User ability tracking | `user_node_mastery` table + EMA trigger | How is current mastery calculated? Can theta be derived from existing EMA scores or does it need a separate column? |
| Session flow | `quiz_sessions` table + Zustand store | How does a session start, progress, and end? Where does the "next question" decision happen? |
| Mastery loop integrity | `user_interactions` → trigger → `user_node_mastery` | Will adding IRT parameters to interactions break the existing trigger? |
| Blindspot targeting | `blindspot_queues` table | How does Blindspot Protocol currently select weak nodes? Will SRS conflict or complement? |
| Camp Trail integration | `camp_trails` → `trail_days` → `trail_steps` | Do trail steps prescribe specific questions, or just topics? Where does adaptive selection fit? |

**Deliverable:** A matrix with three columns: `Component | Current State | IRT/SRS Integration Impact`

**Blockers to flag:** Any architectural conflict where IRT or SRS would break an existing feature.

*Stop and wait for approval.*

---

### Phase 2: IRT Engine — Backend Architecture

**Action:** Design the IRT adaptive testing engine as PostgreSQL infrastructure.

**Specific outputs required:**

**2A. Schema additions (not replacements):**
- New columns on `questions`: `irt_difficulty FLOAT`, `irt_discrimination FLOAT`, `irt_guessing FLOAT`, `irt_calibrated_at TIMESTAMPTZ`
- New table or column for student ability: `user_theta` (per-discipline or global?) — justify the granularity decision
- Migration SQL — must follow SlateCamp naming conventions (`idx_` prefix for indexes, `tr_` prefix for triggers, `YYYYMMDD_description.sql` naming)

**2B. Item selection RPC:**
- PostgreSQL function `select_next_item(p_user_id UUID, p_session_id UUID, p_discipline_id UUID)` that:
  1. Reads the student's current theta
  2. Reads available items (not yet answered in this session) with IRT parameters
  3. Computes maximum information criterion (or specify alternative)
  4. Returns the optimal next question_id
- Must execute in < 20ms for a pool of 500 candidate questions
- Include the 2PL probability formula: `P(correct) = 1 / (1 + exp(-a * (theta - b)))` where a = discrimination, b = difficulty

**2C. Theta update logic:**
- After each answer, how does theta update? EAP (Expected A Posteriori) or simpler MLE?
- Should this be a trigger on `user_interactions` INSERT, or a separate RPC called by the Server Action?
- How does the IRT theta relate to the existing EMA mastery score? Are they separate signals feeding the Readiness Score, or does theta replace EMA?

**2D. Cold-start strategy:**
- New questions with no IRT parameters: default values + calibration plan
- New students with no theta: initial theta estimate + how many items before theta stabilizes
- How do we bootstrap IRT parameters from existing `user_interactions` historical data?

**Deliverable:** Complete SQL (migration-ready), RPC function signatures with pseudocode, and a decision log explaining each architectural choice.

*Stop and wait for approval.*

---

### Phase 3: SRS Engine — Backend Architecture

**Action:** Design the spaced repetition scheduling engine.

**Specific outputs required:**

**3A. What gets scheduled:**
- SRS operates on taxonomy nodes (not individual questions). A node is "due for review" when the scheduling algorithm says it's time.
- When a node is due, the quiz engine selects questions from that node (using IRT if available, random if not yet calibrated).

**3B. Schema:**
- New table: `user_srs_cards` — one row per user × taxonomy node
  - Columns: `user_id`, `node_id`, `ease_factor`, `interval_days`, `repetitions`, `next_review_at`, `last_reviewed_at`, `created_at`, `updated_at`
  - Index on `(user_id, next_review_at)` for the daily review deck query
- RLS: Users can only read/write their own cards

**3C. Scheduling RPC:**
- `get_review_deck(p_user_id UUID, p_limit INT DEFAULT 20)` — returns taxonomy nodes due for review today, ordered by overdue priority
- `update_srs_card(p_user_id UUID, p_node_id UUID, p_quality INT)` — updates scheduling parameters after a review session
  - Quality rating: 0–5 (SM-2 style) or pass/fail (FSRS style) — justify the choice
  - Include the interval calculation formula explicitly

**3D. Integration with existing mastery loop:**
- When a user completes a review session, `user_interactions` are logged as normal
- The EMA trigger fires as normal, updating `user_node_mastery`
- The SRS engine updates its own `user_srs_cards` scheduling data
- These are parallel writes, not competing systems

**3E. Relationship to Blindspot Protocol:**
- Blindspot targets nodes with LOW mastery (the student is weak)
- SRS targets nodes with DECAYING mastery (the student knew it but is forgetting)
- Document explicitly how these two systems complement each other and don't produce conflicting recommendations

**Deliverable:** Complete SQL, RPC signatures, and a clear diagram of data flow showing how SRS, IRT, EMA mastery, and Blindspot coexist.

*Stop and wait for approval.*

---

### Phase 4: Next.js Integration Layer

**Action:** Design the Server Actions and data fetching that connect the backend engines to the frontend.

**Specific outputs required:**

**4A. Adaptive quiz session flow:**
```
User clicks "Start Session" (mode: camp | storm | blindspot | proof)
  → Server Action: createAdaptiveSession(userId, mode, disciplineId)
    → If mode needs IRT: call select_next_item RPC for first question
    → If mode is blindspot: use blindspot_queues, then IRT within that node
    → Return: session_id + first question

User answers question
  → Server Action: submitAnswer(sessionId, questionId, answerId, responseTimeMs)
    → INSERT into user_interactions (triggers EMA update)
    → If IRT active: call theta update + select_next_item for next question
    → Return: correctness feedback + next question (or session complete)
```

**4B. SRS review deck:**
```
User opens Review tab
  → Server Component: fetch get_review_deck RPC
  → Display: "You have N nodes to review today"

User starts review session
  → Same adaptive quiz flow, but question pool is scoped to due SRS nodes
  → On session complete: call update_srs_card for each reviewed node
```

**4C. Caching strategy:**
- Quiz sessions are NOT cacheable (next question depends on previous answer)
- Review deck count CAN be cached with short TTL (revalidate on session complete)
- Readiness Score can be cached per-user with revalidation on `user_node_mastery` update
- Specify which Server Actions call `revalidatePath()` and which call `revalidateTag()`

**4D. Query function locations:**
- `src/lib/queries/adaptive-quiz.ts` — read functions for IRT item selection
- `src/lib/queries/srs.ts` — read functions for review deck
- `src/lib/actions/quiz-session.ts` — mutations for session lifecycle
- `src/lib/actions/srs.ts` — mutations for SRS card updates

**Deliverable:** Server Action signatures with TypeScript types, query function signatures, and caching strategy table.

*Stop and wait for approval.*

---

### Phase 5: UX & Component Architecture

**Action:** Design the frontend components that surface adaptive testing and spaced repetition to students.

**Specific outputs required:**

**5A. Adaptive difficulty — what the student sees (and doesn't see):**
- The student should NEVER see their raw theta score or know the system is adapting
- Instead: after a session, show "This session matched your current level" — normalize adaptive difficulty as a feature, not a judgment
- Progress visualization: the Taxonomy Heatmap already shows per-node mastery. No new visualization needed for IRT — it's invisible infrastructure
- If a student is struggling (theta dropping), the UI should NOT show discouraging metrics. Show effort-based signals: "You've answered 47 questions this week" rather than accuracy percentages during low-confidence periods

**5B. SRS review interface:**
- Dashboard widget: `<ReviewDueCount />` — shows "N nodes to review" with a CTA
- Review session uses the same `<QuizSession />` component but with `mode: 'review'`
- After review: show a "Review complete" summary with nodes reviewed and next review dates
- Notification nudge: "You have 5 nodes due for review" (push notification or dashboard banner — specify which)

**5C. Component API design:**
```typescript
// Existing component, modified to accept adaptive question source
<QuizSession
  sessionId={string}
  mode={'camp' | 'storm' | 'blindspot' | 'proof' | 'review'}
  getNextQuestion={() => Promise<Question>}  // injected strategy
  onComplete={(results) => void}
/>

// New dashboard widget
<ReviewDueCount userId={string} />

// Modified mastery heatmap (already exists — specify what changes)
<TaxonomyHeatmap
  data={MasteryNode[]}
  showSrsIndicators={boolean}  // overlay "due for review" badges on nodes
/>
```

**5D. What NOT to build:**
- No separate "adaptive quiz" UI — the existing quiz UI is the UI. IRT is a backend swap.
- No "SRS settings" page — the algorithm is not user-configurable. SlateCamp decides the optimal schedule.
- No theta/IRT parameter display — this is internal infrastructure, not a user feature.

**Deliverable:** Component modification specs (what changes in existing components), new component specs, and a UX decision log explaining what is shown vs. hidden from the student.

*Stop and wait for approval.*

---

### Phase 6: Implementation Roadmap

**Action:** Synthesize Phases 1–5 into a prioritized execution plan.

**Deliverable: `PRODUCT-ARCHITECTURE-IMPLEMENTATION-PLAN.md`**

Structure:
1. **Executive Summary** — What IRT and SRS do for SlateCamp's competitive moat and retention
2. **Architecture Decision Records** — Every major decision from Phases 2–5 with rationale
3. **Schema Migrations** — Ordered SQL files, migration-ready
4. **RPC Functions** — Complete PostgreSQL function code
5. **Server Actions & Queries** — TypeScript files to create/modify
6. **Component Changes** — What existing components change and what new components are needed
7. **Sprint Backlog** — Ordered by dependency:
   - Sprint 1: Schema migrations + IRT parameter columns + cold-start defaults
   - Sprint 2: `select_next_item` RPC + theta update logic + Server Action integration
   - Sprint 3: SRS schema + scheduling RPCs + review deck Server Action
   - Sprint 4: Frontend integration — modify QuizSession to use adaptive source, add ReviewDueCount widget
   - Sprint 5: Historical data calibration — bootstrap IRT parameters from existing user_interactions
   - Sprint 6: Monitoring + A/B test framework (adaptive vs. random selection, measure completion rates)
8. **Risk Register** — What can go wrong and the mitigation for each
9. **IP Protection Notes** — What to trademark, what to document as trade secrets, what to keep server-side only

---

## Notes for Philip

**Why 6 phases instead of 5:** The original combined UX and implementation into Phase 5. This version separates them because UX decisions (what NOT to show the student) are as architecturally important as backend decisions and deserve their own review gate.

**Why IRT computation must be PostgreSQL RPCs, not Edge Functions:**
- Edge Functions have 150ms+ cold starts — unacceptable mid-quiz
- Edge Functions have 50MB memory limits — IRT item selection with large question pools needs efficient in-memory computation
- PostgreSQL RPCs execute in < 5ms on Supabase's infrastructure with proper indexing
- RPCs keep the computation inside the database, next to the data — no serialization overhead

**Why SRS is on taxonomy nodes, not individual questions:**
- Students don't "review a question" — they review a concept (node)
- The question shown during review should be adaptive (via IRT) — so SRS schedules the node, IRT picks the question within that node
- This architecture makes the two engines complementary: SRS decides WHEN to review, IRT decides WHAT question to show

**What the original prompt would have produced if used as-is:**
- A generic IRT schema that conflicts with SlateCamp's existing `questions` and `user_node_mastery` tables
- Edge Function suggestions that would add 150ms+ latency to every question transition
- A "Feature Matrix" audit that reinvents the codebase map instead of reading the actual file structure
- UX components with exposed theta scores and IRT parameters that would confuse and discourage students
- No acknowledgment of the Blindspot Protocol, Camp Trail, or any existing progression mechanic

This improved prompt builds ON what exists. The original would have built OVER it.
