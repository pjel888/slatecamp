# Data Layer and Caching Audit

> Status: Implemented
> Opened: 2026-04-04
> Updated: 2026-04-05
> Verification: `bun run type-check` passed on 2026-04-05. Repo-wide `bun run lint` still has unrelated baseline failures outside this change set.

## Executive Summary

The findings in this audit have been implemented in the codebase.

The final two open issues from the audit were closed on 2026-04-05:

- The quiz background hydration path now authenticates correctly and can fetch batched questions after initial render.
- The dashboard no longer waits for the entire first query batch to settle before starting dependent follow-up reads.

## Completion Matrix

### Network Waterfalls and Query Inefficiencies

| Status | Original Severity | Location | Original Finding | Completion Note |
| :--- | :--- | :--- | :--- | :--- |
| COMPLETE | CRITICAL | `src/app/quiz/[mode]/session/[sessionId]/page.tsx` | Triple-nested waterfall in session load path. | Auth and session fetch now start in parallel. The page hydrates only the initial question batch, and the rest of the question set is fetched incrementally in the background via `QuizShell` and `getSessionQuestions`. |
| COMPLETE | HIGH | `src/lib/actions/quiz-v2/submit-answer.ts` | Sequential validation, write, and count queries blocked answer submission. | Session and question lookups run in parallel. Session counters now come from the single RPC `get_quiz_session_interaction_stats` instead of separate sequential count queries. |
| COMPLETE | HIGH | `src/lib/actions/dashboard-page.ts` | Secondary dashboard waterfall after the initial `Promise.all`. | Base dashboard reads are now shared promises, and the follow-up reads (`subjectAreas`, `scoreUpdates`, `trailDay`, `recentSessions`) begin off those promises instead of waiting for a full first-batch barrier. |

### Hydration Bloat and Boundary Leaks

| Status | Original Severity | Location | Original Finding | Completion Note |
| :--- | :--- | :--- | :--- | :--- |
| COMPLETE | HIGH | `src/app/quiz/[mode]/session/[sessionId]/page.tsx` | Full question array was sent to the client shell. | The page now sends only the first 10 questions to the client. Remaining questions are background-hydrated in batches through `src/lib/actions/quiz-v2/get-session-questions.ts`. |
| COMPLETE | HIGH | `src/lib/actions/dashboard-page.ts` | Dashboard payload leaked overly broad model shapes. | The dashboard action returns a UI-shaped `DashboardPageData` DTO rather than passing through raw nested query payloads. Cached wiki data is reduced to `article_id`, `title`, `slug`, and `excerpt`, and discipline taxonomy reads are scoped to fields used by the UI. |

### Caching and Mutation Architecture

| Status | Original Severity | Location | Original Finding | Completion Note |
| :--- | :--- | :--- | :--- | :--- |
| COMPLETE | CRITICAL | `src/lib/actions/quiz-v2/submit-answer.ts` | Missing invalidation after quiz mutations left the dashboard stale. | Quiz mutations now call `revalidateDashboardCacheTags(user.id)` and `revalidatePath('/dashboard')`. Dashboard reads are wrapped with semantic tags from `src/lib/actions/cache-tags.ts`. |
| COMPLETE | HIGH | `src/lib/actions/quiz-v2/submit-answer.ts` | Vital post-interaction hooks were fired without await. | SRS scheduling and post-interaction mastery hooks now run under a shared awaited `postInteractionPromise`, so they complete before the action returns. |
| COMPLETE | MED | `src/lib/actions/cached-queries.ts` | Cache lifetime and invalidation were too coarse. | Global wiki and taxonomy caches now use long-lived tagged caches (`revalidate: false`) with on-demand `revalidateTag(...)` from admin wiki and taxonomy mutations. |

## Additional Fix Applied During Closure

| Status | Location | Note |
| :--- | :--- | :--- |
| COMPLETE | `src/lib/actions/quiz-v2/get-session-questions.ts` | Fixed incorrect `getUser()` destructuring that would have broken the background hydration path even after the payload-pruning work was in place. |
| COMPLETE | `src/lib/actions/session-actions.ts` | Parallelized recent-session subject lookup and interaction score lookup to avoid preserving a smaller internal waterfall inside dashboard enrichment. |

## Implementation Roadmap Status

1. Phase 1: Waterfall Elimination
   - COMPLETE: `QuizSessionPage` session boot path parallelized.
   - COMPLETE: `submitAnswer` validation path parallelized.
   - COMPLETE: Session counters consolidated behind a single RPC read.

2. Phase 2: Payload Pruning
   - COMPLETE: Quiz session hydration reduced to an initial lookahead batch plus background fetches.
   - COMPLETE: Dashboard response stays in a UI-facing DTO shape instead of forwarding large raw payloads.

3. Phase 3: Cache Invalidation Strategy
   - COMPLETE: Dashboard reads now use semantic cache tags.
   - COMPLETE: Quiz mutations revalidate dashboard tags and path.
   - COMPLETE: Wiki and taxonomy caches use long-lived tagged caches with admin-driven invalidation.

## Closure Notes

- This audit is closed.
- The code changes that closed the last two items were verified on 2026-04-05.
- Remaining repo-wide lint failures are pre-existing and not specific to this audit.
