# SlateCamp — Application Layer Implementation
## Every Feature the Audit Says Is "Schema Ready, App Code Missing." Build It All.

---

## THE GAP

DB Audit v3 found: the schema is far ahead of the application code. 12 features have complete database infrastructure but ZERO application logic. This prompt builds the Server Actions, helper utilities, gating functions, and Edge Functions that make the schema actually do something.

**This prompt is NOT a migration.** The previous prompt handles all schema changes. This prompt assumes the schema is current and builds the TypeScript layer on top.

**Feed this prompt + `DATABASE_SCHEMA.sql` + `slatecamp-product-architecture-v2_1.md` + `slatecamp-db-audit-v3.md` to Claude Code.**

---

## ROLE

You are a Senior Next.js Application Engineer building the business logic layer for an EdTech platform. You write Server Actions, typed utility functions, and Edge Functions. You follow SlateCamp's hard constraints: RSC for data fetching, Server Actions for writes, no `useEffect` for data, no `any` types, no client-side Supabase writes, all DB writes through Server Actions with RLS.

---

## PRIORITY MAP

```
TIER 1 — Blocks monetization (do first)
├── A. Paywall feature gating utility
├── B. Free tier daily question cap enforcement
├── C. Score reveal "shown once" enforcement
└── D. Analytics funnel events (5 critical events)

TIER 2 — Blocks progression mechanics
├── E. SRS algorithm (SM-2) on quiz answer
├── F. Blindspot Protocol nightly scan function
├── G. Endurance Cycle computation logic
├── H. Accuracy-by-block writer on session complete
└── I. Proof Simulation gating check

TIER 3 — Blocks onboarding flow
├── J. Trail recommendation engine
└── K. Computed signals refresh (updated for endurance)
```

---

## TOOLS

- **Supabase MCP** — Verify table/column existence before writing any code that references them.
- **File System** — Read existing code before adding. Never duplicate.
- **grep** — Find every injection point.

---

## PHASE 1: Codebase Audit (Read-Only)

```bash
# 1. Find Supabase client utilities
grep -rn "createClient\|createServerClient\|createBrowserClient\|createServiceRoleClient" src/lib/ --include="*.ts" | head -10

# 2. Find Server Actions directory pattern
find src/ -name "actions.ts" -o -name "actions.tsx" | sort

# 3. Find session completion handler (the critical injection point)
grep -rn "status.*completed\|completeSession\|submitQuiz\|finishSession\|markComplete" src/ --include="*.ts" --include="*.tsx" | head -15

# 4. Find where quiz sessions are created
grep -rn "quiz_sessions.*insert\|startSession\|createSession\|startQuiz" src/ --include="*.ts" --include="*.tsx" | head -15

# 5. Find where individual answers are submitted
grep -rn "user_interactions.*insert\|submitAnswer\|recordAnswer" src/ --include="*.ts" --include="*.tsx" | head -15

# 6. Find existing feature gating / paywall code
grep -rn "feature_flags\|checkFeature\|isProUser\|canAccess\|paywall\|subscription.*tier" src/ --include="*.ts" --include="*.tsx" | head -15

# 7. Find existing trackEvent utility
grep -rn "trackEvent\|trackServerEvent" src/ --include="*.ts" -l

# 8. Find existing computeUserSignals
grep -rn "computeUserSignals\|user_computed_signals" src/ --include="*.ts" -l

# 9. Find score reveal page/component
find src/ -path "*score*reveal*" -o -path "*assessment*result*" | head -5

# 10. Find trail recommendation / assessment result
grep -rn "recommendTrail\|trailRecommendation\|assessment.*score\|score_reveal" src/ --include="*.ts" --include="*.tsx" | head -10

# 11. Find auth callback / signup handler
grep -rn "signUp\|auth.*callback\|handleSignUp\|onAuthStateChange" src/ --include="*.ts" --include="*.tsx" | head -10

# 12. Find pricing/upgrade page
find src/ -path "*pricing*" -o -path "*upgrade*" -o -path "*paywall*" | head -5

# 13. Find analytics page
find src/ -path "*analytics*" -name "page.tsx" | head -5

# 14. Find Supabase types (for typed queries)
find src/ -name "database.types.ts" -o -name "supabase.ts" -path "*/types/*" | head -5
```

**Output:** Complete map of injection points, existing utilities, and Supabase client patterns.

**STOP.** "Phase 1 Complete. Reply 'Proceed.'"

---

## PHASE 2: Tier 1 — Monetization Infrastructure

### A. Paywall Feature Gating Utility

This is the most important utility in the entire application. Every feature gate reads from this.

Create: `src/lib/paywall/check-access.ts`

```typescript
import { createClient } from '@/lib/supabase/server' // ADAPT path

export type FeatureKey =
  | 'readiness_score_live'
  | 'taxonomy_heatmap_full'
  | 'questions_all_difficulty'
  | 'questions_unlimited'
  | 'camp_trails_full_library'
  | 'blindspot_protocol'
  | 'endurance_cycle'
  | 'proof_simulation'
  | '3d_lab_full'
  | 'analytics_dashboard_full'
  | 'ai_assistant_unlimited'

interface AccessResult {
  allowed: boolean
  reason?: string       // Human-readable reason for paywall UI
  userTier: string
  requiredTier: string[]
}

/**
 * Check if the current user has access to a feature.
 * Reads feature_flags + user_subscriptions.
 * Returns { allowed, reason, userTier, requiredTier }.
 *
 * Usage in Server Components:
 *   const access = await checkFeatureAccess('blindspot_protocol')
 *   if (!access.allowed) return <PaywallBlock reason={access.reason} />
 *
 * Usage in Server Actions:
 *   const access = await checkFeatureAccess('questions_unlimited')
 *   if (!access.allowed) throw new Error('Pro required')
 */
export async function checkFeatureAccess(featureKey: FeatureKey): Promise<AccessResult> {
  const supabase = await createClient() // ADAPT: may not be async
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { allowed: false, reason: 'Not authenticated', userTier: 'anon', requiredTier: [] }

  // Get user's subscription tier
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .single()

  const userTier = (sub?.status === 'active' || sub?.status === 'trialing')
    ? (sub?.tier ?? 'free')
    : 'free'

  // Get the feature flag
  const { data: flag } = await supabase
    .from('feature_flags')
    .select('enabled, target_tier')
    .eq('key', featureKey)
    .single()

  // If flag doesn't exist or is disabled, feature is open to all
  if (!flag || !flag.enabled) return { allowed: true, userTier, requiredTier: [] }

  // Check if user's tier is in the target_tier array
  const requiredTier = (flag.target_tier as string[]) || []
  const allowed = requiredTier.includes(userTier)

  return {
    allowed,
    reason: allowed ? undefined : `Upgrade to Pro to unlock this feature`,
    userTier,
    requiredTier,
  }
}

/**
 * Quick boolean check for use in conditions.
 */
export async function canAccess(featureKey: FeatureKey): Promise<boolean> {
  const result = await checkFeatureAccess(featureKey)
  return result.allowed
}
```

### B. Free Tier Daily Question Cap

Create: `src/lib/paywall/daily-cap.ts`

```typescript
import { createClient } from '@/lib/supabase/server' // ADAPT

const FREE_DAILY_CAP = 20

interface DailyCapResult {
  allowed: boolean
  remaining: number
  cap: number
  resetsAt: string // ISO date string
}

/**
 * Check if a free user has questions remaining today.
 * Pro users always return allowed: true.
 * Call BEFORE creating a quiz session for free users.
 */
export async function checkDailyCap(userId: string): Promise<DailyCapResult> {
  const supabase = await createClient() // ADAPT

  // Check if user is Pro (Pro users have no cap)
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .single()

  const isPro = sub?.tier === 'pro' || sub?.tier === 'enterprise' || sub?.tier === 'student'
  if (isPro && (sub?.status === 'active' || sub?.status === 'trialing')) {
    return { allowed: true, remaining: Infinity, cap: Infinity, resetsAt: '' }
  }

  // Get current count from user_global_stats
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('free_questions_today, free_questions_reset_date')
    .eq('user_id', userId)
    .single()

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  let questionsToday = stats?.free_questions_today ?? 0
  const resetDate = stats?.free_questions_reset_date

  // Reset if it's a new day
  if (resetDate !== today) {
    questionsToday = 0
    await supabase
      .from('user_global_stats')
      .update({ free_questions_today: 0, free_questions_reset_date: today })
      .eq('user_id', userId)
  }

  const remaining = Math.max(0, FREE_DAILY_CAP - questionsToday)

  return {
    allowed: remaining > 0,
    remaining,
    cap: FREE_DAILY_CAP,
    resetsAt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Increment the daily question counter.
 * Call AFTER each question is answered (in the submit-answer Server Action).
 */
export async function incrementDailyCount(userId: string, count: number = 1): Promise<void> {
  try {
    const supabase = await createClient() // ADAPT
    const today = new Date().toISOString().split('T')[0]

    // Atomic increment using RPC or manual read-write
    const { data: stats } = await supabase
      .from('user_global_stats')
      .select('free_questions_today, free_questions_reset_date')
      .eq('user_id', userId)
      .single()

    const resetDate = stats?.free_questions_reset_date
    const currentCount = (resetDate === today) ? (stats?.free_questions_today ?? 0) : 0

    await supabase
      .from('user_global_stats')
      .update({
        free_questions_today: currentCount + count,
        free_questions_reset_date: today,
      })
      .eq('user_id', userId)
  } catch {
    // Silent — cap enforcement is important but must not break the quiz
  }
}
```

**Wire into quiz flow:**
1. In the "start session" Server Action: call `checkDailyCap()` BEFORE creating the session. If `!allowed`, return error with `remaining` and `resetsAt` for the UI.
2. In the "submit answer" Server Action: call `incrementDailyCount()` AFTER recording the answer. Free users only.

### C. Score Reveal "Shown Once" Enforcement

Create: `src/lib/paywall/score-reveal.ts`

```typescript
import { createClient } from '@/lib/supabase/server' // ADAPT

/**
 * Check if the free user has already seen the score reveal.
 * Returns: { canView: boolean, shownAt: Date | null }
 */
export async function checkScoreRevealAccess(userId: string): Promise<{
  canView: boolean
  shownAt: Date | null
}> {
  const supabase = await createClient() // ADAPT

  // Pro users can always view
  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .single()

  if (sub?.tier !== 'free') return { canView: true, shownAt: null }

  // Check if already shown
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('score_reveal_shown_at')
    .eq('user_id', userId)
    .single()

  if (stats?.score_reveal_shown_at) {
    return { canView: false, shownAt: new Date(stats.score_reveal_shown_at) }
  }

  return { canView: true, shownAt: null }
}

/**
 * Mark the score reveal as consumed.
 * Call ONCE when the score reveal screen renders for a free user.
 */
export async function markScoreRevealed(userId: string): Promise<void> {
  const supabase = await createClient() // ADAPT
  await supabase
    .from('user_global_stats')
    .update({ score_reveal_shown_at: new Date().toISOString() })
    .eq('user_id', userId)
}
```

### D. Analytics Funnel Events

Verify `trackEvent` exists (from Phase 1 grep #7). If not, create `src/lib/analytics.ts` per the Data Infrastructure prompt.

Then wire 5 events — find each injection point with grep, add ONE LINE:

```typescript
// 1. After signup completes (auth callback):
await trackServerEvent(userId, 'signup_completed', { source: utmSource })

// 2. When assessment quiz session is created:
await trackServerEvent(userId, 'assessment_started')

// 3. When assessment quiz is submitted:
await trackServerEvent(userId, 'assessment_completed', { score: assessmentScore })

// 4. When score reveal page renders (Server Component):
await trackServerEvent(userId, 'score_reveal_viewed', { score: readinessScore })

// 5. When subscription is created/activated:
await trackServerEvent(userId, 'pro_subscribed', { plan: tier, billing_cycle: cycle })
```

**STOP.** "Tier 1 Complete. Paywall, daily cap, score reveal, and funnel events wired. Reply 'Proceed.'"

---

## PHASE 3: Tier 2 — Progression Mechanics

### E. SRS Algorithm (SM-2 Variant)

Create: `src/lib/srs/update.ts`

This runs after EACH answer in Camp Mode. It updates `user_node_mastery.srs_due_at`, `srs_interval_days`, and `srs_ease_factor`.

```typescript
/**
 * SM-2 algorithm adapted for SlateCamp.
 * Called after each quiz answer in Camp Mode.
 * Updates the SRS scheduling columns on user_node_mastery.
 */
export async function updateSrsSchedule(
  supabase: SupabaseClient, // ADAPT type
  userId: string,
  topicId: string,
  isCorrect: boolean,
  qualityRating: number // 0-5 scale derived from is_correct + time + confidence
): Promise<void> {
  try {
    const { data: mastery } = await supabase
      .from('user_node_mastery')
      .select('srs_interval_days, srs_ease_factor')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()

    let interval = mastery?.srs_interval_days ?? 1
    let easeFactor = mastery?.srs_ease_factor ?? 2.5

    if (qualityRating < 3) {
      // Failed review — reset interval, reduce ease
      interval = 1
      easeFactor = Math.max(1.3, easeFactor - 0.2)
    } else {
      // Successful review — extend interval
      if (interval === 1) {
        interval = 1
      } else if (interval === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      // Adjust ease factor
      easeFactor = easeFactor + (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02))
      easeFactor = Math.max(1.3, easeFactor)
    }

    const dueAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)

    await supabase
      .from('user_node_mastery')
      .update({
        srs_interval_days: interval,
        srs_ease_factor: Math.round(easeFactor * 100) / 100,
        srs_due_at: dueAt.toISOString(),
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
  } catch {
    // Silent — SRS is important but must not break the quiz
  }
}

/**
 * Derive SM-2 quality rating from SlateCamp interaction data.
 * 0 = complete failure, 5 = perfect with confidence
 */
export function deriveQualityRating(params: {
  isCorrect: boolean
  timeSpentMs: number
  avgTimeMs: number
  confidence: string | null
  isSuspectedLuckyGuess: boolean
}): number {
  if (!params.isCorrect) return 1 // Wrong answer = quality 1
  if (params.isSuspectedLuckyGuess) return 2 // Lucky guess = low quality even if correct

  const timeRatio = params.avgTimeMs > 0
    ? params.timeSpentMs / params.avgTimeMs
    : 1

  if (params.confidence === 'sure' && timeRatio < 1.5) return 5 // Confident + fast
  if (params.confidence === 'sure') return 4 // Confident but slow
  if (timeRatio < 1.2) return 4 // Fast but not sure
  return 3 // Correct but hesitant
}
```

**Wire into answer submission:** After recording the interaction AND updating mastery, call:
```typescript
const quality = deriveQualityRating({
  isCorrect, timeSpentMs, avgTimeMs: mastery.avg_time_ms,
  confidence, isSuspectedLuckyGuess
})
await updateSrsSchedule(supabase, userId, topicId, isCorrect, quality)
```

### F. Blindspot Protocol Queue Generator

Create: `src/lib/blindspot/generate-queue.ts`

This function runs nightly (via Edge Function or cron) OR on-demand from the dashboard.

```typescript
/**
 * Generate a Blindspot queue for a user.
 * Identifies the 3 weakest taxonomy nodes and creates a 12-item quiz queue.
 *
 * Architecture spec: Nightly scan → identify Red/Grey nodes → generate queue
 */
export async function generateBlindspotQueue(
  supabase: SupabaseClient, // ADAPT — use service role client for nightly job
  userId: string
): Promise<{ queueId: string; nodeIds: string[] } | null> {
  // Check for existing pending/in_progress queue
  const { data: existing } = await supabase
    .from('blindspot_queues')
    .select('queue_id')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress'])
    .limit(1)
    .single()

  if (existing) return null // Already has an active queue

  // Find the 3 weakest nodes (Red zone: mastery < 0.4)
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight')
    .eq('user_id', userId)
    .lt('current_mastery_weight', 0.4)
    .order('current_mastery_weight', { ascending: true })
    .limit(3)

  // Also find unexplored nodes (Grey: no mastery row at all)
  const { data: allNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
    .eq('is_leaf', true)

  const { data: touchedNodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id')
    .eq('user_id', userId)

  const touchedSet = new Set((touchedNodes || []).map(n => n.topic_id))
  const greyNodes = (allNodes || [])
    .filter(n => !touchedSet.has(n.node_id))
    .slice(0, 3 - (weakNodes?.length || 0))

  const targetNodeIds = [
    ...(weakNodes || []).map(n => n.topic_id),
    ...greyNodes.map(n => n.node_id),
  ].slice(0, 3)

  if (targetNodeIds.length === 0) return null // No weak nodes — student is doing great

  // Snapshot pre-queue mastery
  const preQueueMastery: Record<string, number> = {}
  for (const node of (weakNodes || [])) {
    preQueueMastery[node.topic_id] = node.current_mastery_weight
  }

  // Create the queue
  const { data: queue, error } = await supabase
    .from('blindspot_queues')
    .insert({
      user_id: userId,
      node_ids: targetNodeIds,
      question_count: 12,
      pre_queue_mastery: preQueueMastery,
      status: 'pending',
    })
    .select('queue_id')
    .single()

  if (error || !queue) return null

  return { queueId: queue.queue_id, nodeIds: targetNodeIds }
}
```

### G. Endurance Cycle Computation

Create: `src/lib/endurance/compute.ts`

```typescript
/**
 * Compute accuracy-by-block for a completed session.
 * Divides interactions into 10-item blocks and computes accuracy per block.
 * Written to quiz_sessions.accuracy_by_block JSONB.
 */
export function computeAccuracyByBlock(
  interactions: { question_order: number; is_correct: boolean }[]
): { block: number; correct: number; total: number; accuracy: number }[] {
  const sorted = [...interactions].sort((a, b) => a.question_order - b.question_order)
  const blocks: { block: number; correct: number; total: number; accuracy: number }[] = []
  const BLOCK_SIZE = 10

  for (let i = 0; i < sorted.length; i += BLOCK_SIZE) {
    const chunk = sorted.slice(i, i + BLOCK_SIZE)
    const correct = chunk.filter(x => x.is_correct).length
    blocks.push({
      block: Math.floor(i / BLOCK_SIZE) + 1,
      correct,
      total: chunk.length,
      accuracy: Math.round((correct / chunk.length) * 100) / 100,
    })
  }

  return blocks
}

/**
 * Determine the reliable performance window (items before accuracy drops below 70%).
 * This is the "endurance window" — the student's current stamina limit.
 */
export function computeEnduranceWindow(
  blocks: { block: number; accuracy: number; total: number }[]
): number {
  let windowItems = 0
  for (const block of blocks) {
    if (block.accuracy >= 0.70) {
      windowItems += block.total
    } else {
      break // First block below 70% = endurance limit
    }
  }
  return windowItems
}

/**
 * Update endurance signals on user_computed_signals.
 * Called after an endurance session completes.
 */
export async function updateEnduranceSignals(
  supabase: SupabaseClient, // ADAPT
  userId: string,
  sessionBlocks: { block: number; accuracy: number; total: number }[],
  isCalibrationWeek: boolean
): Promise<void> {
  const currentWindow = computeEnduranceWindow(sessionBlocks)

  const { data: signals } = await supabase
    .from('user_computed_signals')
    .select('endurance_baseline_items, endurance_window_items, endurance_target_items')
    .eq('user_id', userId)
    .single()

  const updates: Record<string, unknown> = {
    endurance_window_items: currentWindow,
    endurance_last_updated: new Date().toISOString(),
  }

  // First calibration week: set baseline
  if (isCalibrationWeek || !signals?.endurance_baseline_items) {
    updates.endurance_baseline_items = currentWindow
  }

  await supabase
    .from('user_computed_signals')
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
}
```

### H. Accuracy-by-Block Writer

In the session completion handler, AFTER all interactions are recorded:

```typescript
// Fetch all interactions for this session
const { data: interactions } = await supabase
  .from('user_interactions')
  .select('question_order, is_correct')
  .eq('session_id', sessionId)
  .order('question_order', { ascending: true })

if (interactions && interactions.length > 0) {
  const blocks = computeAccuracyByBlock(interactions)

  // Write to session
  await supabase
    .from('quiz_sessions')
    .update({ accuracy_by_block: blocks })
    .eq('session_id', sessionId)

  // If this is an endurance session, update endurance signals
  if (session.is_endurance_session) {
    const isCalibrationWeek = !signals?.endurance_baseline_items
    await updateEnduranceSignals(supabase, userId, blocks, isCalibrationWeek)
  }
}
```

### I. Proof Simulation Gating Check

Create: `src/lib/proof-simulation/gate.ts`

```typescript
/**
 * Check if a user meets the competence gate for Proof Simulation.
 * Architecture spec:
 *   - ≥70% of taxonomy nodes at Amber or above (mastery ≥ 0.4)
 *   - Endurance window ≥ 80% of exam duration
 */
export async function checkProofSimulationGate(
  supabase: SupabaseClient, // ADAPT
  userId: string
): Promise<{
  allowed: boolean
  nodesCovered: number
  nodesRequired: number
  enduranceWindow: number
  enduranceRequired: number
}> {
  // Count nodes at Amber or above
  const { count: amberPlus } = await supabase
    .from('user_node_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('current_mastery_weight', 0.4)

  // Count total leaf nodes
  const { count: totalNodes } = await supabase
    .from('taxonomy_tree')
    .select('*', { count: 'exact', head: true })
    .eq('is_leaf', true)

  const nodesRequired = Math.ceil((totalNodes ?? 0) * 0.7)
  const nodesMet = (amberPlus ?? 0) >= nodesRequired

  // Get endurance data
  const { data: signals } = await supabase
    .from('user_computed_signals')
    .select('endurance_window_items, endurance_target_items')
    .eq('user_id', userId)
    .single()

  const enduranceWindow = signals?.endurance_window_items ?? 0
  const enduranceTarget = signals?.endurance_target_items ?? 150
  const enduranceRequired = Math.ceil(enduranceTarget * 0.8)
  const enduranceMet = enduranceWindow >= enduranceRequired

  return {
    allowed: nodesMet && enduranceMet,
    nodesCovered: amberPlus ?? 0,
    nodesRequired,
    enduranceWindow,
    enduranceRequired,
  }
}
```

**STOP.** "Tier 2 Complete. SRS, Blindspot, Endurance, block accuracy, and Proof gating built. Reply 'Proceed.'"

---

## PHASE 4: Tier 3 — Onboarding Flow

### J. Trail Recommendation Engine

Create: `src/lib/trails/recommend.ts`

```typescript
/**
 * Recommend a Camp Trail based on assessment score and days to exam.
 * Architecture spec Section 7.3.
 */
export async function recommendTrail(
  supabase: SupabaseClient, // ADAPT
  userId: string
): Promise<{
  trailId: string
  trailName: string
  reason: string
  durationDays: number
} | null> {
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('assessment_score, target_exam_date')
    .eq('user_id', userId)
    .single()

  if (!stats?.assessment_score || !stats?.target_exam_date) return null

  const score = stats.assessment_score
  const daysToExam = Math.ceil(
    (new Date(stats.target_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  // Architecture spec logic
  let targetIntensity: string
  if (daysToExam <= 14) {
    targetIntensity = 'intensive'
  } else if (daysToExam <= 28) {
    targetIntensity = score >= 65 ? 'intensive' : 'accelerated'
  } else if (daysToExam <= 56) {
    targetIntensity = score >= 65 ? 'accelerated' : 'standard'
  } else if (daysToExam <= 84) {
    targetIntensity = score >= 50 ? 'standard' : 'comprehensive'
  } else if (daysToExam <= 180) {
    targetIntensity = 'comprehensive'
  } else {
    targetIntensity = 'undergraduate'
  }

  // Find matching trail
  const { data: trail } = await supabase
    .from('camp_trails')
    .select('trail_id, name, duration_days, intensity')
    .eq('trail_type', 'time_gated')
    .eq('intensity', targetIntensity)
    .eq('is_published', true)
    .limit(1)
    .single()

  if (!trail) return null

  // Generate voice-appropriate reason
  const scoreStr = Math.round(score)
  const reason = `Based on your score of ${scoreStr}% and ${daysToExam} days until your exam, the ${trail.name} is the right fit.`

  return {
    trailId: trail.trail_id,
    trailName: trail.name,
    reason,
    durationDays: trail.duration_days,
  }
}
```

### K. Updated computeUserSignals

If the function exists (Phase 1 grep #8), update it to include the new endurance columns. If it doesn't exist, create the full version:

Add to the existing `computeUserSignals`:
```typescript
// After velocity and churn computation, also compute calibration accuracy
// (if the user has sessions with confidence ratings)
const { data: ratedSessions } = await supabase
  .from('quiz_sessions')
  .select('session_id, pre_session_confidence_ratings')
  .eq('user_id', userId)
  .neq('pre_session_confidence_ratings', '{}')
  .order('started_at', { ascending: false })
  .limit(10)

if (ratedSessions && ratedSessions.length >= 3) {
  // Compute calibration: how often prediction matched outcome
  let totalPredictions = 0
  let correctPredictions = 0

  for (const session of ratedSessions) {
    const ratings = session.pre_session_confidence_ratings as Record<string, number>
    // For each rated subject, compare prediction to actual accuracy
    // (requires querying interactions for this session — may want to batch)
    // Simplified: count as "correct" if High→>70%, Medium→40-70%, Low→<40%
    totalPredictions++
    // ... (implement calibration logic)
  }

  if (totalPredictions > 0) {
    updates.calibration_accuracy = correctPredictions / totalPredictions
    updates.calibration_updated_at = now.toISOString()
  }
}
```

**STOP.** "Tier 3 Complete. Trail recommendation and signals updated. Reply 'Proceed' for verification."

---

## PHASE 5: Verification

```bash
# All new files exist
find src/lib -name "*.ts" -path "*paywall*" -o -path "*srs*" -o -path "*blindspot*" -o -path "*endurance*" -o -path "*proof*" -o -path "*trails/recommend*" | sort

# TypeScript compiles
npx tsc --noEmit

# Feature gating utility is importable
grep -rn "checkFeatureAccess\|canAccess" src/ --include="*.ts" --include="*.tsx" | head -5

# Daily cap is wired into session creation
grep -rn "checkDailyCap\|incrementDailyCount" src/ --include="*.ts" --include="*.tsx" | head -5

# SRS is wired into answer submission
grep -rn "updateSrsSchedule\|deriveQualityRating" src/ --include="*.ts" --include="*.tsx" | head -5

# Funnel events are instrumented
grep -rn "signup_completed\|assessment_started\|assessment_completed\|score_reveal_viewed\|pro_subscribed" src/ --include="*.ts" --include="*.tsx" | head -10
```

### App smoke test:
- [ ] Free user can start a quiz — daily cap check runs without error
- [ ] Free user hitting 20 questions gets blocked with remaining count
- [ ] Score reveal page checks shown-once state
- [ ] Feature gating returns `allowed: true` for Pro users
- [ ] Feature gating returns `allowed: false` for free users on Pro features
- [ ] Completing a Camp Mode quiz updates SRS columns on `user_node_mastery`
- [ ] Completing any quiz writes `accuracy_by_block` to `quiz_sessions`
- [ ] `analytics_events` has rows after testing the instrumented flows
- [ ] TypeScript compiles with zero errors
- [ ] No console errors on any page

**STOP.** "All application layer implementations complete."

---

## WHAT NOT TO DO

- **Don't run migrations in this prompt.** The previous prompt handles all schema changes. This prompt assumes columns exist.
- **Don't build UI components.** This is the logic layer. The UI reads from these functions.
- **Don't make feature gating synchronous/blocking on page load.** `checkFeatureAccess` should be called in the Server Component, not in middleware for every request.
- **Don't make daily cap enforcement throw.** Return the result. Let the UI handle the blocked state.
- **Don't make SRS updates blocking.** They run after the answer is recorded. If they fail, the quiz continues.
- **Don't deploy the Blindspot Edge Function in this prompt.** Build the `generateBlindspotQueue` function. The Edge Function/cron wrapper is a separate deployment task.
- **Don't hardcode the ALE exam item count (150).** Read `endurance_target_items` from `user_computed_signals`, which defaults to 150 but is configurable per discipline.

---

*Execute Phase 1 now. Map every injection point before writing code.*
