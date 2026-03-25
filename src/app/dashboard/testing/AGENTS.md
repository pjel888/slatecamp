<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# testing

## Purpose

Testing and review hub for SlateCamp's quiz engine. Provides 8 testing modes (Camp, Storm, Chill, Custom, Focus Review, Endurance, Subject, and Simulation), each with a setup flow, active session interface, and post-session debrief. The hub page (`ReviewHub`) presents mode cards, in-progress session resume, readiness score, and weak-area suggestions. All sessions are backed by Supabase `quiz_sessions` and `user_interactions` tables with IRT-based mastery tracking.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Passthrough layout with metadata: "Review & Testing \| SlateCamp" |
| `loading.tsx` | Skeleton loading state for the testing hub |
| `page.tsx` | Hub page -- Server Component that fetches user tier, session history, readiness score, blindspot queues, exam date, and weak nodes, then renders `ReviewHub` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `camp/setup/` | Camp mode setup -- adaptive practice with personalized question selection |
| `storm/setup/` | Storm mode setup -- rapid-fire timed practice |
| `chill/setup/` | Chill mode setup -- untimed, relaxed review |
| `custom/setup/` | Custom mode setup -- user-defined session parameters |
| `focus-review/setup/` | Focus Review setup -- targets weak taxonomy areas (formerly "Blindspot") |
| `endurance/setup/` | Endurance setup -- Extended Practice with longer sessions |
| `subject/setup/` | Subject mode setup -- subject-focused practice |
| `simulation/` | Full Exam Simulation -- briefing page, active session, cold-delivery results |
| `simulation/briefing/` | Pre-simulation briefing page |
| `simulation/[sessionId]/results/` | Post-simulation results (available after 24-hour cold delivery period) |
| `session/[sessionId]/` | Active quiz session -- renders `SessionShell` with questions, timer, navigation |
| `session/[sessionId]/debrief/` | Post-session debrief -- score reveal, question review, mastery changes, readiness delta |

## For AI Agents

### Working In This Directory

- **8 testing modes** with strict pedagogical rules defined in CLAUDE.md. Each mode has a `/setup` page that configures and creates a `quiz_session` in Supabase.
- **Session lifecycle:** Setup -> Active Session (`/session/[sessionId]`) -> Debrief (`/session/[sessionId]/debrief`). Completed sessions auto-redirect from session page to debrief.
- **Simulation cold delivery:** Proof Simulation results are withheld for 24 hours after completion. The debrief page checks `hoursSinceCompletion` and redirects to the simulation results page if under 24 hours.
- **Voice rules:** Never use "blindspot" (use "Focus Review"), "endurance cycle" (use "Extended Practice"), "proof simulation" (use "Full Exam Simulation"), "drill"/"grind" (use "practice"/"review").
- **IRT mastery:** All score calculations use the 2-parameter logistic model. The debrief shows readiness score delta (`readinessBefore` vs `readinessAfter`) from `readiness_score_snapshots`.
- **State persistence:** Sessions auto-save every 10 seconds. The `SessionShell` component handles resume from `existingInteractions`.
- **Data fetching pattern:** Setup pages and the hub page are Server Components that query Supabase directly. Active session and debrief pages fetch session data server-side and pass to client shell components.
- **Route constants:** Use `ROUTES.TESTING_DEBRIEF(sessionId)`, `ROUTES.LOGIN`, etc. from `@/lib/constants/routes`.

### Testing Requirements

- Verify each mode setup page creates a valid `quiz_session` with correct `test_mode` value
- Confirm session resume works when navigating back to an in-progress session
- Test debrief page with completed sessions -- verify score delta, question review, mastery data
- Test simulation cold delivery: results page should show waiting state within 24 hours
- Verify the hub page handles empty state (no sessions, no weak nodes) gracefully
- Ensure blindspot/Focus Review queue integration works with `blindspot_queues` table

### Common Patterns

- **Server Component data fetching** with `createClient()` and `getUser()` from `@/lib/supabase/server`
- **Auth redirect:** `if (!user) redirect(ROUTES.LOGIN)` at the top of every page
- **Suspense boundaries** around data-dependent content with skeleton fallbacks
- **Mode-specific components** in `@/components/testing/` (session behaviors, debrief views, hub)
- **Dynamic route params:** `params: Promise<{ sessionId: string }>` (Next.js 15+ async params)

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/supabase/server` | `createClient`, `getUser` for server-side auth and data |
| `@/lib/constants/routes` | `ROUTES` -- route constants including `TESTING_DEBRIEF()` |
| `@/components/testing/hub/ReviewHub` | Main hub component with mode cards, session history, readiness display |
| `@/components/testing/session/SessionShell` | Active quiz session shell -- question rendering, navigation, timer, auto-save |
| `@/components/testing/debrief/DebriefLayout` | Post-session debrief -- score hero, question review strip, mastery changes |
| `@/components/testing/session/CampSessionBehavior` | Camp-mode specific session logic |
| `@/components/testing/session/ChillSessionBehavior` | Chill-mode specific session logic |
| `@/components/testing/session/StormTimerBar` | Storm mode timer bar component |
| `@/components/testing/debrief/ScoreHero` | Readiness score reveal animation |
| `@/components/testing/debrief/BlockAccuracyChart` | Block accuracy visualization |
| `@/components/testing/debrief/QuestionReviewStrip` | Per-question review in debrief |
| `@/components/testing/debrief/NodeMasteryStrip` | Topic mastery changes visualization |
| `@/types/testing` | Testing-related TypeScript types |

### External

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Database queries for sessions, interactions, mastery |
| `framer-motion` | Session transition animations |

<!-- MANUAL: -->
