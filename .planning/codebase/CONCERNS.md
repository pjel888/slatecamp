# Codebase Concerns

**Analysis Date:** 2026-03-19

## Tech Debt

### Silent Error Suppression in Critical Paths

**Issue:** Multiple server actions use silent error handling that swallows critical failures. This hides bugs during development and masks runtime issues in production.

**Files:**
- `src/lib/srs/update.ts` (lines 67-69): Empty catch block in `updateSrsSchedule` silently fails SRS updates
- `src/lib/actions/quiz.ts` (lines 94-105): Fallback retry logic for `completed_at` column (pre-migration handling)
- `src/lib/actions/analytics.ts` (multiple functions): Returns empty arrays/null on any error

**Impact:**
- SRS schedule updates silently fail, breaking spaced repetition for users
- Users see blank charts and heatmaps when analytics queries fail
- Debugging becomes harder without error logging or monitoring

**Fix approach:**
- Add structured error logging (Sentry, Vercel monitoring) instead of silent catches
- Distinguish between "data not found" (OK) and "database error" (alert)
- For SRS: Either fail the entire quiz or log error + retry with exponential backoff
- Add error boundary components in UI to show users when data fails to load

### Inconsistent Error Handling Strategy

**Issue:** Different patterns for similar failures across the codebase—some throw, some return null, some return empty arrays.

**Files:**
- `src/lib/actions/quiz.ts`: Uses `throw new Error()` for auth failures (lines 23, 57, 80, 466, 572)
- `src/lib/actions/wiki.ts`: Uses `return []` or `return null` for all errors (lines 21, 37, 54, 72)
- `src/lib/actions/analytics.ts`: Uses `return []` or `return null` mixed throughout
- `src/lib/blindspot/generate-queue.ts`: Uses `return null` (line 26, 61)

**Impact:**
- Client code must handle multiple error patterns
- Risk of forgetting to check null/empty when code was written expecting throws
- Makes refactoring harder and increases maintenance burden

**Fix approach:**
- Establish single pattern: Server actions should return `{ ok: false, error: message }` or throw
- Quiz/critical paths: throw errors that trigger UI error boundaries
- Analytics/non-critical paths: return null/empty with optional error field for logging
- Document in `CONVENTIONS.md` which pattern applies when

### Pre-Migration Compatibility Code

**Issue:** Codebase still handles pre-migration state (e.g., `completed_at` column may not exist).

**Files:**
- `src/lib/actions/quiz.ts` (lines 95-105): Fallback retry if `completed_at` update fails

**Impact:**
- Dead code path that's hard to test
- Increased complexity in critical quiz completion flow
- Migration status unclear—is this still needed?

**Fix approach:**
- Confirm all migrations are applied to production
- Remove fallback logic if migrations are guaranteed
- If keeping for compatibility, add explicit version checks and deprecation timeline

## Known Bugs

### Three Untracked Analytics Events in 3D Lab

**Issue:** Three analytics event tracking lines are commented with TODO markers. These events are never sent.

**Files:**
- `src/app/dashboard/3d-lab/_scenes/ClassicalOrders/ClassicalOrders.tsx` (lines 88, 91, 97)

**Trigger:** User interacts with Classical Orders module and answers questions, but no analytics are recorded.

**Workaround:** None—these events are simply not collected.

**Impact:** Missing data on 3D Lab usage patterns, unable to measure feature effectiveness or identify usability issues.

**Fix approach:**
- Uncomment and implement the three TODOs:
  - Line 88: `trackServerEvent('3d_quiz_answer', { scene: 'classical-orders', part: partId, correct: true })`
  - Line 91: `trackServerEvent('3d_quiz_answer', { scene: 'classical-orders', part: partId, correct: false })`
  - Line 97: `trackServerEvent('3d_part_select', { scene: 'classical-orders', part: partId })`
- Test that events reach analytics backend

## Security Considerations

### DOMPurify Usage for User Content

**Issue:** HTML sanitization via `isomorphic-dompurify` is used but scope of user-controlled content is unclear.

**Files:**
- `src/components/wiki/WikiArticle.tsx`: Likely renders wiki content
- `src/components/quiz/RationaleDrawer.tsx`: Likely renders question rationales
- Package used: `isomorphic-dompurify@^3.1.0`

**Current mitigation:** DOMPurify is dependency (installed), but verify it's actually used on all HTML rendering.

**Recommendations:**
- Audit all `dangerouslySetInnerHTML` or markdown rendering in wiki/content areas
- Ensure DOMPurify is applied before rendering user/admin-provided HTML
- Check that admin content (questions, wiki articles) is sanitized at input time, not output time

### API Route Authorization

**Issue:** Cron jobs verify `CRON_SECRET` header, but pattern may not be consistent across all internal API routes.

**Files:**
- `src/app/api/cron/blindspot-scan/route.ts` (lines 18-24): Properly checks bearer token
- `src/app/api/cron/compute-signals/route.ts`: Assume similar pattern

**Current mitigation:** Vercel cron jobs only accept `CRON_SECRET` environment variable; jobs can't be triggered externally.

**Recommendations:**
- Audit all `/api/*` routes for auth checks
- Ensure webhook endpoints (Stripe, Payrex) verify signatures, not just headers
- Document which routes require which auth method

## Performance Bottlenecks

### Large Module Registry in Memory

**Issue:** `moduleRegistry.ts` contains 1,741 lines of metadata for 40+ 3D Lab modules, loaded at runtime.

**Files:**
- `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` (1,741 lines)

**Cause:** All module configurations (descriptions, scenarios, ALE question counts, phases) bundled together.

**Impact:**
- Increases initial bundle size
- Parsing/searching through 40+ modules at runtime when only 1-2 are viewed
- Inefficient for large-scale expansion (if more modules are added)

**Improvement path:**
- Extract module registry to separate JSON config file or database
- Lazy-load module data when needed
- Create index/manifest that loads first, then fetch individual module config on demand
- Example: `GET /api/3d-lab/modules` → manifest, then `GET /api/3d-lab/modules/{id}` → full config

### Promise.allSettled Without Error Aggregation

**Issue:** Multiple uses of `Promise.allSettled` don't aggregate or report which promises failed.

**Files:**
- `src/lib/actions/dashboard.ts`: Uses `Promise.allSettled` but may silently accept partial failures
- `src/lib/actions/heatmap.ts`: Same pattern

**Cause:** Code checks individual result statuses but doesn't provide user feedback when some data loads.

**Impact:**
- Dashboard displays partial data without indicating missing sections
- Users unaware that some analytics are stale or missing
- Support tickets when dashboard "looks wrong"

**Improvement path:**
- Return metadata with aggregated status: `{ ok: true, partial: true, failed: ['heatmap', 'signals'] }`
- Show toast/banner when dashboard has missing data
- Log failures separately for monitoring

### Multiple Sequential Database Queries in Blindspot Cron

**Issue:** Blindspot scan job makes 2-3 queries per user in a loop without batching.

**Files:**
- `src/app/api/cron/blindspot-scan/route.ts` (lines 47-136)

**Current pattern:**
```
for (const userId of userIds) {  // ~50–500 users
  1. Check existing queue
  2. Check subscription tier
  3. Fetch weak nodes
  4. Fetch all leaf nodes
  5. Fetch touched nodes
  6. Insert queue
  7. Expire stale queues (global, once)
}
```

**Cause:** Query-per-user approach was simple to implement but scales poorly.

**Impact:**
- At 1000 active users: ~6000 database queries in one cron run
- If cron runs every 30 min during high-traffic, cumulative load increases
- Potential timeout or RLS policy bottlenecks on large Supabase projects

**Improvement path:**
- Batch queries: Fetch all user IDs with active subscriptions in single query
- Pre-compute weak nodes for all users in one window function
- Use `UNION ALL` to get existing queues for all users at once
- Consolidate subscription check into initial query
- Target: Reduce from ~6 queries/user to ~2 global queries + 1 batch insert

## Fragile Areas

### Quiz Session Completion Logic

**Files:**
- `src/lib/actions/quiz.ts` (lines 69-140, `updateQuizSession`)
- `src/components/dashboard/QuizRenderer.tsx` (complex state management)

**Why fragile:**
- `completed_at` column may not exist (pre-migration), triggering fallback logic
- Multiple state updates required: session status, interactions saved, SRS scheduled, signals computed
- If any update fails, quiz marked complete but downstream computations may not run
- No transaction support across these separate inserts/updates

**Safe modification:**
- Wrap all session completion steps in a database transaction or batch operation
- Add comprehensive error logging to diagnose which step fails
- Test pre/post migration scenarios explicitly
- Document expected order of updates and what to do if one fails

**Test coverage gaps:**
- Missing: Quiz completion with SRS update failures
- Missing: Partial session completion (e.g., session marked complete but interactions not saved)
- Missing: Concurrent quiz completions (two requests for same session)

### IRT Theta Updates with Missing Question Metadata

**Issue:** IRT theta calculations depend on `difficulty_rating` and `discrimination_rating`, both with defaults.

**Files:**
- `src/lib/srs/irt.ts` (lines 47-48): Defaults to 0.5 and 1.0 if missing
- `src/lib/actions/quiz.ts` (line 480): Uses `difficulty` column as fallback

**Current defaults:** `difficulty_rating || 0.5`, `discrimination_rating || 1.0`

**Impact:**
- Questions without explicit ratings all treated as "medium difficulty, average discrimination"
- Adaptive selection becomes less effective for questions missing calibration data
- No warning if question metadata is incomplete

**Improvement path:**
- Audit questions table: which percentage have `difficulty_rating` and `discrimination_rating` populated?
- Add NOT NULL constraints post-migration if safe
- Flag questions with missing ratings in admin dashboard
- Consider auto-calibrating from historical data (p-value, discrimination from CTT)
- Add test case: verify theta updates correctly when question has null ratings

### 3D Lab Module Viewer Dependency Chain

**Files:**
- `src/app/dashboard/3d-lab/_components/ModuleViewer.tsx` (400+ lines)
- `src/app/dashboard/3d-lab/_config/moduleRegistry.ts` (1,741 lines)
- Multiple template files: `ParametricScene.tsx`, `ParametricSceneRenderer.tsx` (600+ lines combined)
- Imported modules: Each module file (457–600 lines) imports from three-stdlib, drei, etc.

**Why fragile:**
- Large bundles with R3F/Three.js dependencies (~500KB)
- If any module config is malformed, entire lab fails to render
- TypeScript types for templates spread across `_types/templates.ts`
- No isolation—error in one module affects lab viewport

**Safe modification:**
- Each module should have its own error boundary
- Lazy-load module implementations (only load scene code when user selects module)
- Pre-validate module registry at build time
- Add fallback UI if scene fails to load

## Scaling Limits

### Cron Job N+1 Query Problem

**Current capacity:** Blindspot cron designed for ~500 active users per run.

**Limit:** At ~2000 active users (2–3x growth), queries per run: ~12,000. Vercel function timeout is 10 minutes; typical Supabase query is 50–100ms → ~10–20 min total. Would exceed timeout.

**Scaling path:**
- Implement batched query approach (as noted above)
- Consider pub/sub or event-based triggers instead of polling cron
- If users grow beyond 5,000 active/month, migrate to dedicated compute (e.g., Supabase functions, AWS Lambda)

### Dashboard Parallel Requests

**Current:** Dashboard loads 6–8 analytics queries in parallel via `Promise.all`/`Promise.allSettled`.

**Limit:** At ~1,000 concurrent dashboard visitors, Supabase RLS policies and connection pooling may bottleneck. Premium Supabase may be required.

**Scaling path:**
- Implement response caching (Redis or Vercel's incremental static regeneration) for dashboard sections
- Pre-compute and cache readiness/heatmap daily
- Add pagination to large queries (e.g., activity feed)

### Array Operations on Large Datasets

**Issue:** Several functions use in-memory filtering/sorting on potentially large arrays.

**Files:**
- `src/lib/srs/irt.ts` (line 27–37): Sorts all candidates to find closest match
- `src/lib/blindspot/generate-queue.ts` (lines 51–54): Filters all leaf nodes in memory

**Current capacity:** Works fine for <5,000 leaf nodes. Scales linearly.

**Limit:** At 10,000+ nodes, sorting in memory becomes noticeable. With hundreds of concurrent users, cumulative CPU cost increases.

**Scaling path:**
- Move sorting to database (ORDER BY nearest difference)
- Use database indexes on mastery weight, deprecation status
- Precompute "weak nodes" view in database if recalculated frequently

## Dependencies at Risk

### Package Version Range: `@supabase/supabase-js@^2.98.0`

**Risk:** Minor/patch updates could introduce breaking changes to RLS policy behavior or connection handling.

**Impact:**
- Current codebase tightly coupled to Supabase client API (createClient, .from().select() syntax)
- Breaking change in Supabase SDK would require widespread code updates
- No automated tests for Supabase integration (only unit tests for pure functions)

**Mitigation:** Currently pinned to 2.98.0; monitored but no automated upgrade tests.

**Migration plan:**
- Add Supabase integration tests before upgrading major versions
- Test RLS policies with mock data
- Verify auth flow still works with new SDK

### React 19 Adoption Risk

**Issue:** Latest major React version (19.2.4) introduced compiler and hook changes.

**Files:** Entire `src/components` and `src/app` directories depend on React 19.

**Risk:** Breaking changes in React Hook behavior, Suspense integration, or server component semantics.

**Mitigation:** Project is already on 19.2.4. No risk of upgrade, but risk of new React features introducing incompatibilities (e.g., use() hook interaction with Suspense).

**Recommendation:** Keep React and Next.js versions in sync. Monitor release notes for hook API changes.

## Missing Critical Features

### Missing Rate Limiting on Public Endpoints

**Issue:** API endpoints like `/api/ai/tutor` and `/api/ai/generate-questions` don't appear to have rate limiting.

**Impact:**
- Malicious actor could spam AI endpoints, running up token costs
- No protection for Anthropic API quota

**Fix approach:**
- Add middleware rate limiting via Vercel (per-IP, per-user)
- Implement token bucket or sliding window counter in Redis/Vercel KV
- Set limits: e.g., 10 requests/min per user, 100 requests/min per IP
- Return 429 Too Many Requests with retry-after header

### Missing Webhook Signature Verification Validation

**Issue:** Stripe and Payrex webhook endpoints should verify request signatures to prevent replay attacks and spoofing.

**Files:**
- `src/app/api/webhooks/stripe/route.ts`: Assume Stripe integration
- `src/app/api/webhooks/payrex/route.ts`: Assume Payrex integration

**Fix approach:**
- Verify Stripe signatures using `stripe.webhooks.constructEvent()`
- Verify Payrex signatures using their signing key
- Log failed signature verification attempts
- Return 400 Bad Request on signature mismatch

### Missing Input Validation on Server Actions

**Issue:** Many server actions accept parameters but don't validate input (e.g., UUID format, string length, enum values).

**Files:**
- `src/lib/actions/quiz.ts`: `getQuizSession(sessionId)` doesn't validate sessionId is UUID
- `src/lib/actions/dashboard-page.ts`: Various functions accept data without validation

**Fix approach:**
- Use Zod schemas to validate all server action inputs
- Parse at function entry: `const validated = QuizSessionSchema.parse(input)`
- Throw `new Error('Invalid input')` if validation fails
- Example schema: `const QuizSessionIdSchema = z.string().uuid()`

## Test Coverage Gaps

### No Tests for SRS Update Failure Recovery

**What's not tested:** What happens when `updateSrsSchedule` silently fails (network error, RLS policy blocks user).

**Files:** `src/lib/srs/update.ts` (lines 35-70)

**Risk:** Users' SRS schedules never update, but they're unaware. Questions appear due for review but intervals don't progress.

**Priority:** High

**How to test:**
- Mock Supabase to throw error for SRS updates
- Verify quiz still completes (function silently fails, doesn't break quiz)
- Add observability: Log to Sentry when SRS update fails
- Monitor in production for patterns of SRS failures

### No Tests for Concurrent Quiz Submissions

**What's not tested:** Two rapid quiz submissions for same session. Could race on `updateQuizSession` and `saveUserInteraction`.

**Files:**
- `src/lib/actions/quiz.ts` (`updateQuizSession`, `saveUserInteraction`)
- `src/components/dashboard/QuizRenderer.tsx` (submission handling)

**Risk:** Interaction data could be corrupted or duplicated; session marked complete before all interactions saved.

**Priority:** High

**How to test:**
- Send two submitAnswer requests simultaneously for same session
- Verify both interactions are saved (or deduplicated)
- Verify session marked complete only after all interactions persisted

### No Tests for Analytics Query Timeouts

**What's not tested:** What happens if analytics queries time out (Supabase overloaded).

**Files:** `src/lib/actions/analytics.ts` (multiple functions)

**Risk:** Dashboard hangs or shows stale data. No error message to user.

**Priority:** Medium

**How to test:**
- Mock Supabase queries to timeout after 2 seconds
- Verify dashboard still renders (graceful degradation)
- Verify error is logged and user sees "data unavailable" message

### No Tests for Blindspot Queue Generation with No Weak Nodes

**What's not tested:** User with perfect mastery (all nodes > 0.4). Should queue still generate?

**Files:** `src/lib/blindspot/generate-queue.ts` (line 61)

**Risk:** Returns null, which dashboard must handle. If not handled, blank card appears.

**Priority:** Medium

**How to test:**
- Create mock user with all nodes at 0.5+ mastery
- Verify `generateBlindspotQueue` returns null
- Verify dashboard UI shows "You've mastered all topics" instead of error

### No Tests for 3D Lab Module Render Failures

**What's not tested:** What if a 3D module fails to instantiate (bad geometry, Three.js error).

**Files:**
- `src/app/dashboard/3d-lab/_components/ModuleViewer.tsx`
- `src/app/dashboard/3d-lab/_templates/ParametricScene.tsx`

**Risk:** Lab viewport goes blank. No error message. User thinks feature is broken.

**Priority:** Medium

**How to test:**
- Mock Three.js to throw error
- Verify ModuleViewer catches error and shows fallback UI
- Verify error is logged for debugging

---

*Concerns audit: 2026-03-19*
