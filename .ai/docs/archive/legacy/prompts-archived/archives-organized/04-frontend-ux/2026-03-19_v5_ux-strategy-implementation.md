# SlateCamp — UX Strategy Implementation Plan
## Every Screen, Flow, and Component from the UX Strategy Document

---

## SOURCE & CONTEXT

This prompt implements the **UX Research & Strategic Implementation Plan** (v1.0, March 2026). That document defines every screen, every flow, every copy string, and every user path in the entire product — grounded in Duolingo benchmarks, learning science research, and the DB Audit v3 findings.

**Prerequisite prompts (must run before this one):**
1. `slatecamp-audit-v3-implementation.md` — schema changes (feature_flags population, endurance columns, SRS columns, etc.)
2. `slatecamp-application-layer-implementation.md` — Server Actions (checkFeatureAccess, checkDailyCap, updateSrsSchedule, recommendTrail, etc.)

**This prompt assumes ALL schema and Server Action work is complete.** It builds the FRONTEND — pages, components, and wiring.

**Feed this prompt + `slatecamp-ux-strategy.html` + `slatecamp-product-architecture-v2_1.md` + `DATABASE_SCHEMA.sql` to Claude Code.**

---

## ROLE

You are a Senior Frontend Engineer and UX Designer implementing screens from a detailed specification. You build Next.js App Router pages and React Server Components. You follow SlateCamp's design system (Cobalt Blue `#1B3FC4`, Syne 800 headings, Inter body, DM Mono labels, `#F2F0EB` cream background, `#F8F7F5` card surface). You follow Rams Standard constraints: functional color only, max 150ms transitions, no confetti/badges/emoji in system copy. Every piece of copy uses "confident companion" voice — 65% warm, 35% authoritative.

---

## SPRINT STRUCTURE

The UX Strategy defines 3 sprints. This prompt covers **Sprint 1** fully (it blocks ALL revenue and retention) and provides specs for Sprints 2-3.

```
SPRINT 1 — UNBLOCK MONETIZATION & CORE LOOP
├── 1. Score Reveal Screen (HIGHEST PRIORITY — single most important screen)
├── 2. Onboarding Flow (landing → assessment → reveal → trail rec → Day 1)
├── 3. Camp Trail UI (library → enrollment → daily view → step completion)
├── 4. Dashboard Restructure (Daily Launchpad)
├── 5. Paywall Screen (Free → Pro conversion)
└── 6. Wire 5 Funnel Events into actual UI components

SPRINT 2 — ENGAGEMENT & RETENTION (spec only)
├── 7. Study Streak (Trail Streak with Grace Days)
├── 8. Metacognitive Calibration (pre-session + post-session)
├── 9. Error Taxonomy (post-wrong-answer prompt)
├── 10. Session Discovery (post-session insight)
├── 11. Heatmap Delta View
└── 12. SRS Dashboard Widget

SPRINT 3 — ADVANCED MASTERY (spec only)
├── 13. Blindspot Protocol UI
├── 14. Endurance Cycle UI
├── 15. Proof Simulation UI
└── 16. Elaborative Interrogation in Wiki
```

---

## TOOLS

- **File System** — Read every existing page and component before building new ones or modifying existing ones.
- **grep** — Find existing components, pages, layouts, and shared utilities.
- **Supabase MCP** — Verify data availability for any component that reads from the database.

---

## PHASE 1: Codebase Map (Read-Only)

```bash
# 1. App Router page structure
find src/app -name "page.tsx" -o -name "layout.tsx" | sort

# 2. Existing dashboard page
find src/app -path "*dashboard*" -name "page.tsx" | head -5
cat src/app/dashboard/page.tsx  # or wherever the dashboard lives

# 3. Existing quiz/testing pages
find src/app -path "*quiz*" -o -path "*testing*" -o -path "*session*" | sort

# 4. Existing assessment/onboarding pages
find src/app -path "*assessment*" -o -path "*onboarding*" -o -path "*score*reveal*" | sort

# 5. Existing trail pages
find src/app -path "*trail*" -o -path "*camp*trail*" | sort

# 6. Existing pricing/upgrade/paywall pages
find src/app -path "*pricing*" -o -path "*upgrade*" -o -path "*paywall*" | sort

# 7. Shared UI components
find src/components -name "*.tsx" | sort | head -30

# 8. Layout / navigation structure
find src/app -name "layout.tsx" | sort

# 9. Design system tokens / tailwind config
sed -n "1,120p" src/app/globals.css
find src/ -name "globals.css" -o -name "design-tokens*" | head -3

# 10. Auth middleware / route protection
find src/ -name "middleware.ts" -o -name "middleware.tsx" | head -3
grep -rn "redirect\|auth\|protect\|session" src/middleware* --include="*.ts" 2>/dev/null | head -10

# 11. Existing Supabase data fetching patterns in RSC
grep -rn "createClient\|supabase\|from(" src/app/ --include="*.tsx" | head -15

# 12. Server Action imports pattern
grep -rn "import.*actions\|use server" src/app/ --include="*.tsx" | head -10

# 13. Existing paywall/gating in components
grep -rn "checkFeatureAccess\|canAccess\|feature_flags\|isProUser\|paywall" src/ --include="*.tsx" | head -10

# 14. Check if trackEvent is wired anywhere
grep -rn "trackEvent\|trackServerEvent" src/app/ --include="*.tsx" | head -10
```

**Output:** Complete map of existing pages, components, routing, and data patterns. Determines what exists vs what needs to be built from scratch.

**STOP.** "Phase 1 Complete. Here's the existing page/component map. Reply 'Proceed.'"

---

## PHASE 2: Score Reveal Screen (Sprint 1 Item #1)

**From the UX Strategy, Section 4 — "THE MOST IMPORTANT SCREEN":**

> "This is the emotional peak of the entire free user journey. The screen must do three things: (1) Show the score honestly, (2) Validate that this is real and meaningful, (3) Immediately show the path forward."

### Page: `/app/dashboard/score-reveal/page.tsx` (or adapt to existing route structure)

This is a **full-screen takeover** — no navigation bars, no sidebar, no distractions. It renders ONCE for free users (enforced by `score_reveal_shown_at`).

**Data requirements (Server Component):**
```typescript
// Read from Supabase in the RSC:
// 1. user_global_stats.assessment_score — the number to show
// 2. user_global_stats.assessment_completed_at — must be set (assessment done)
// 3. user_global_stats.score_reveal_shown_at — must be NULL (not yet shown)
// 4. user_subscriptions.tier — if Pro, always show; if Free, shown-once logic
// 5. user_node_mastery grouped by subject_area — for the blurred heatmap shape
```

**Gating logic (before render):**
```typescript
import { checkScoreRevealAccess, markScoreRevealed } from '@/lib/paywall/score-reveal'

const { canView, shownAt } = await checkScoreRevealAccess(userId)

// If assessment not completed, redirect to assessment
if (!assessmentCompletedAt) redirect('/dashboard/assessment')

// If free user already saw it, redirect to dashboard with locked widget
if (!canView) redirect('/dashboard')

// Mark as shown (one-time)
if (userTier === 'free') await markScoreRevealed(userId)

// Fire analytics event
await trackServerEvent(userId, 'score_reveal_viewed', { score: assessmentScore })
```

**Layout — strict spec from UX Strategy:**

```
┌─────────────────────────────────────────────┐
│                                             │
│              (no navigation)                │
│                                             │
│         YOUR READINESS SCORE                │  ← DM Mono eyebrow, 11px, uppercase
│                                             │
│              48%                            │  ← Syne 800, 80px, zone-colored
│                                             │  ← Counter animation: 0 → score over 700ms
│   "A lot of ground ahead — but this is      │  ← Inter 17px, #666, max-width 480px
│    exactly where the journey starts."        │  ← Copy from tone rules below
│                                             │
│   ┌─────────────────────────────────┐       │
│   │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │       │  ← Blurred heatmap (shape visible,
│   │  ░░░ Structural ░░░░░░░░░░░░░░ │       │     color not). Use CSS filter: blur(8px)
│   │  ░░░░░░░░░░░ Building ░░░░░░░░ │       │     on real heatmap data
│   │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │       │
│   └─────────────────────────────────┘       │
│                                             │
│      [ Start My Camp Trail ]                │  ← Primary CTA, Cobalt Blue, full-width
│                                             │
│      See Full Map → (Pro)                   │  ← Secondary, appears 3sec delayed, muted
│                                             │
└─────────────────────────────────────────────┘
```

**Zone colors for score number:**
- `< 40`: Signal Red `#E63329`
- `40–69`: Camp Orange `#E8853A`
- `70–84`: Signal Green `#1B7A3C`
- `≥ 85`: Cobalt Blue `#1B3FC4`

**Tone rules for score messages (exact copy from UX Strategy):**
```typescript
function getScoreMessage(score: number): string {
  if (score < 40) return `${score}%. The map shows where to start. Most people find this more motivating than discouraging once they see the trail.`
  if (score < 55) return `${score}%. Solid foundation, clear gaps. The Trail will focus on exactly what moves the needle.`
  if (score < 70) return `${score}%. More than halfway there. The gaps are specific — the Trail is targeted.`
  if (score < 85) return `${score}%. Strong foundation. Focused refinement and the Proof Run are the path from here.`
  return `${score}%. Strong — now we make sure it holds under exam conditions.`
}
```

**Retaker variant:** If `user_global_stats.exam_attempt_number > 1` or `previous_exam_result = 'failed'`, use retaker copy:
```typescript
function getRetakerMessage(score: number): string {
  return `${score}%. Your score tells us something specific about last time — the Trail is built around those specifics.`
}
```

**Animated counter component:**
```typescript
// Client component for the counter animation
'use client'
import { useEffect, useState } from 'react'

export function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    const duration = 700
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target])

  return (
    <span 
      className="font-[family-name:var(--font-syne)] font-extrabold text-[80px] leading-none tracking-tight"
      style={{ color }}
    >
      {display}%
    </span>
  )
}
```

**STOP.** "Score Reveal Screen implemented. Reply 'Proceed' for Onboarding Flow."

---

## PHASE 3: Onboarding Flow (Sprint 1 Item #2)

**From UX Strategy Section 4:** "Landing → Sign-up → Assessment → Score Reveal → Trail Recommendation → Day 1"

### 3a. Pre-Assessment Teaser (Optional — Duolingo-inspired delayed signup)

The UX Strategy recommends: let users answer 5-10 diagnostic questions BEFORE creating an account. The account gate becomes "save your results" not "sign up for a product."

**If this is too complex for Sprint 1:** Skip it. Go straight to sign-up → assessment. Add the pre-signup teaser in Sprint 2.

### 3b. Post-Signup Onboarding Context Screen

**Route:** `/app/onboarding/context/page.tsx`

After signup, before assessment. Collects ONLY two fields:
1. "When is your target exam date?" → Date picker → writes to `profiles.target_exam_date` AND `user_global_stats.target_exam_date`
2. "Have you taken the ALE before?" → Yes/No → writes to `user_global_stats.exam_attempt_number` (1 = first time, 2+ = retaker) and `previous_exam_result`

**Design:**
- Progress indicator: "Step 1 of 3 before your score is ready"
- Clean single-screen layout, max 2 form fields
- CTA: "Continue to Diagnostic →"
- Do NOT ask: school name, age, phone number, study time. Collect these later.

### 3c. Assessment Quiz (35 questions)

The quiz engine is **Built** per the audit. The assessment is a specialized session:
- `test_mode: 'camp'` but with NO immediate feedback (feedback comes in Score Reveal)
- `is_assessment: true` questions drawn from high-discrimination pool
- Progress bar framed as "Your score is building" — not "Question X of 35"
- No timer
- Can be paused and resumed

**Route:** `/app/dashboard/assessment/page.tsx`

**After question 35:** Loading screen with "Calculating your Readiness Score..." — a 2-3 second intentional pause (even if computation is instant) to create ceremonial weight. Then redirect to Score Reveal.

**On completion, Server Action writes:**
```typescript
// 1. Compute initial readiness score from assessment answers
// 2. Write to user_global_stats.assessment_completed_at
// 3. Write to user_global_stats.assessment_score  
// 4. Write to user_global_stats.global_readiness_score
// 5. Fire: trackServerEvent(userId, 'assessment_completed', { score })
// 6. Redirect to /dashboard/score-reveal
```

### 3d. Trail Recommendation Screen

**Route:** `/app/dashboard/trail-recommendation/page.tsx`

After Score Reveal, user arrives here (from "Start My Camp Trail" CTA).

**Data:** Call `recommendTrail(supabase, userId)` — returns `{ trailId, trailName, reason, durationDays }`.

**Layout:**
```
┌──────────────────────────────────────────┐
│  YOUR RECOMMENDED TRAIL                  │  ← DM Mono eyebrow
│                                          │
│  8-Week Standard Trail                   │  ← Syne 700, 28px
│                                          │
│  "Based on your score of 48% and 84      │  ← Inter 15px, generated by recommendTrail
│   days until your exam, the 8-Week        │
│   Standard Trail is the right fit."       │
│                                          │
│  Week 1 Preview:                         │
│  ├── Day 1: Building Laws Foundations    │  ← First 3 days shown
│  ├── Day 2: Structural Design Basics    │
│  └── Day 3: Building Utilities Intro    │
│                                          │
│  [ Enroll in This Trail ]               │  ← Primary CTA
│  Browse Trail Library →                  │  ← Secondary link
│                                          │
└──────────────────────────────────────────┘
```

**On enrollment, fire:** `trackServerEvent(userId, 'trail_enrolled', { trailId, trailName })`

### 3e. Dropout Recovery Paths

The UX Strategy defines 4 dropout recovery scenarios. For Sprint 1, implement the dashboard-level recovery:

| State | Dashboard Behavior |
|---|---|
| `assessment_completed_at = null` | Primary CTA: "Your score is X% complete. Pick up where you left off." Above all other content. |
| `assessment_completed_at` set, `score_reveal_shown_at = null` | Primary CTA: "Your Readiness Score is ready. See where you stand." |
| `score_reveal_shown_at` set, no trail enrollment | Primary CTA: "Your trail is ready. Day 1 focuses on [top gap subject]." |
| Trail enrolled, Day 1 done, Day 2 not started | "Day 2 is ready. [Topic] · X minutes." |

These are **conditional dashboard cards** that read from `user_global_stats` and `user_trail_enrollments`.

**STOP.** "Onboarding Flow implemented. Reply 'Proceed' for Camp Trail UI."

---

## PHASE 4: Camp Trail UI (Sprint 1 Item #3)

**From UX Strategy Section 7 — "The Retention Engine"**

### 4a. Trail Library Page

**Route:** `/app/dashboard/trails/page.tsx`

Shows all published trails. Free users see 1 basic trail. Pro users see full library.

```typescript
const access = await checkFeatureAccess('camp_trails_full_library')

const { data: trails } = await supabase
  .from('camp_trails')
  .select('*')
  .eq('is_published', true)
  .order('is_featured', { ascending: false })

// Free users: filter to only show the ALE Starter trail
// Pro users: show all
```

### 4b. Trail Detail Page

**Route:** `/app/dashboard/trails/[slug]/page.tsx`

Shows trail overview, day list, enrollment CTA.

### 4c. Trail Daily View (THE most important retention screen)

**Route:** `/app/dashboard/trails/[slug]/day/[dayNumber]/page.tsx`

This is the screen users see EVERY DAY. It must be flawless.

**Layout from UX Strategy:**
```
┌──────────────────────────────────────────┐
│  DAY 14 · BUILDING TECHNOLOGY            │  ← DM Mono eyebrow
│                                          │
│  Structural Systems                      │  ← Syne 700
│  3 activities · ~45 min                  │  ← Inter 14px, muted
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 📖 Wiki: Reinforced Concrete       │  │  ← Step card
│  │    Fundamentals · ~15 min          │  │     Grey = pending
│  │    [Start Reading →]               │  │     Green check = complete
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ⚡ Quiz: 15 items targeting         │  │
│  │    TECH-002 nodes · ~20 min        │  │
│  │    [Start Quiz →]                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🏛️ 3D Lab: Structural Bay          │  │  ← Optional step
│  │    Framing · ~10 min (optional)    │  │
│  │    [Explore →]                     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Day Progress: ██░░░░░░ 1/3 complete    │
│                                          │
└──────────────────────────────────────────┘
```

**Sleep-aware labels:** If `profiles.preferred_study_window = 'morning'` and a step has `preferred_time = 'evening'`, show "Best in the evening" label. Vice versa for morning.

**Step completion flow:**
1. User taps a step → navigates to the appropriate content (Wiki article, quiz session, 3D Lab module)
2. On completion, Server Action writes to `user_trail_progress`
3. The `trg_progress_update_enrollment` trigger auto-updates `last_activity_at`
4. If all steps for the day are complete, Server Action writes to `trail_day_completions`
5. The `trg_day_completion_update_enrollment` trigger auto-increments `days_completed`
6. User returns to the day view and sees all steps checked green

### 4d. Day Completion Screen

When all steps are done for the day:
```
Day 14 Complete.

Building Technology · 15 questions · 12 correct (80%)
2 nodes moved amber → green.
Your Readiness Score: 52% → 54% (+2)

[ Continue to Day 15 ]
```

No confetti. No celebration for routine sessions. Just factual progress. The heatmap delta ("2 nodes moved amber → green") IS the emotional payoff.

**STOP.** "Camp Trail UI implemented. Reply 'Proceed' for Dashboard and Paywall."

---

## PHASE 5: Dashboard Restructure + Paywall (Sprint 1 Items #4 + #5)

### 5a. Dashboard as Daily Launchpad

**From UX Strategy Section 7:** "The dashboard is a Daily Launchpad, not an analytics surface. Its one job: show today's Camp Trail day with a single primary action."

**Layout rules (strict, from UX Strategy):**
- Readiness Score: above the fold, always. Never scrolled away.
- Today's Trail Day Card: 80% of visual weight. Dominant element.
- Max 3 elements above the fold.
- The score and trail day must be visible without scrolling on every device.

**Conditional rendering based on user state:**

```typescript
// Determine dashboard state
const dashboardState = 
  !assessmentCompletedAt ? 'needs_assessment' :
  !scoreRevealShownAt && tier === 'free' ? 'needs_score_reveal' :
  !trailEnrollment ? 'needs_trail' :
  'active_trail'
```

Each state renders a different primary card:
- `needs_assessment`: "Start your diagnostic — 35 questions, ~20 min"
- `needs_score_reveal`: "Your Readiness Score is ready. See it now."
- `needs_trail`: Trail recommendation card with enrollment CTA
- `active_trail`: Today's trail day card (the main state)

### 5b. Locked Score Widget (Free Users, Post-Reveal)

After the free user has seen the score once, the dashboard shows a locked widget:
```
┌──────────────────────────────┐
│  🔒 Readiness Score          │
│  Updated [N] times since     │
│  your diagnostic.            │
│                              │
│  [ Upgrade to See Live → ]   │
└──────────────────────────────┘
```

`N` = count of `readiness_score_snapshots` rows for this user since `score_reveal_shown_at`. This number increments visibly — each quiz session adds to it.

### 5c. Paywall Full-Screen

**Route:** `/app/dashboard/upgrade/page.tsx` (or modal component)

**Triggered by:** Tapping locked heatmap, locked trail library, locked Blindspot, locked Proof Simulation, or the locked score widget.

**Layout from UX Strategy:**
```
┌──────────────────────────────────────────┐
│                                          │
│  Know you'll win.                        │  ← Syne 800, 36px
│                                          │
│  Pro students see their live score,      │  ← Inter 16px
│  full heatmap, and a Day-by-Day Trail    │
│  built around their gaps.                │
│                                          │
│  ┌─────────────┬─────────────┐          │
│  │    Free     │     Pro      │          │  ← Feature comparison table
│  ├─────────────┼─────────────┤          │
│  │ 20 Q/day   │ Unlimited    │          │
│  │ Easy only   │ All levels   │          │
│  │ 1 trail     │ Full library │          │
│  │ Score once  │ Live score   │          │
│  │ No heatmap  │ Full heatmap │          │
│  └─────────────┴─────────────┘          │
│                                          │
│  From the Campfire:                      │
│  "Started at 44%, passed June 2025."     │
│  — [Name], PUP Architecture              │
│                                          │
│  ₱6,999/cycle                            │  ← Prominent pricing
│  ₱9,999/year · Save 29%                 │
│                                          │
│  [ Pay with GCash ]                      │  ← PRIMARY — first payment option
│  [ Pay with Card ]                       │  ← Secondary
│                                          │
│  Not yet — continue free                 │  ← Always visible, never buried
│                                          │
│  Secure payment · Cancel anytime         │  ← Trust line
│                                          │
└──────────────────────────────────────────┘
```

**Critical rules:**
- GCash FIRST. It's the primary Philippine payment method.
- "Not yet — continue free" is ALWAYS visible. Brand integrity.
- No dark patterns. No countdown timers. No "limited offer."
- Fire: `trackEvent({ event_name: 'upgrade_page_viewed', event_properties: { source, current_score } })`

### 5d. Pro Confirmation Screen

After successful payment:
```
┌──────────────────────────────────────────┐
│                                          │
│  Welcome to Camp, [name].                │  ← Signal Green background
│                                          │
│  Your Readiness Score: 48%               │  ← Full size, unblurred, live
│                                          │
│  [Full Heatmap — now unblurred]          │  ← The reveal moment
│                                          │
│  [ Go to Dashboard ]                     │
│                                          │
└──────────────────────────────────────────┘
```

This IS the second score reveal moment. The exact things the student was deprived of — live score and full heatmap — are shown immediately.

**STOP.** "Dashboard + Paywall implemented. Reply 'Proceed' for verification."

---

## PHASE 6: Wire Funnel Events (Sprint 1 Item #6)

In each screen built above, verify these events fire:

| Event | Screen | When |
|---|---|---|
| `signup_completed` | Auth callback | After account created |
| `assessment_started` | Assessment page | On session creation |
| `assessment_completed` | Assessment page | On final question submit |
| `score_reveal_viewed` | Score Reveal page | On page render (Server Component) |
| `trail_enrolled` | Trail Recommendation / Library | On enrollment action |
| `upgrade_page_viewed` | Paywall screen | On page render |
| `pro_subscribed` | Payment success handler | On subscription created |

```bash
# Verify all events are wired
grep -rn "trackEvent\|trackServerEvent" src/app/ --include="*.tsx" --include="*.ts" | grep -E "signup_completed|assessment_started|assessment_completed|score_reveal_viewed|trail_enrolled|upgrade_page_viewed|pro_subscribed"
```

Every event should return at least 1 result.

**STOP.** "Sprint 1 Complete. All monetization and core loop screens built."

---

## SPRINT 2 SPECS (For Follow-Up Session)

These are detailed enough to build directly. Execute after Sprint 1 is verified.

### 7. Study Streak

**From UX Strategy Section 9:** Streak = consecutive Camp Trail days completed. Show on dashboard. One Grace Day per week (free), additional grace days Pro.

**Schema needed:** `ALTER TABLE user_trail_enrollments ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS grace_days_used_this_week INTEGER DEFAULT 0;`

**Dashboard widget:** 3-day ribbon showing yesterday (✓ or missed), today (pending or ✓), tomorrow (locked). Not a raw number chase — "consistency building" framing.

### 8. Metacognitive Calibration

Pre-session: 3-point confidence rating per subject (uses existing `pre_session_confidence_ratings` JSONB).
Post-session: Calibration chart showing predicted vs actual. "You predicted High on Building Laws, scored 41%."

### 9. Error Taxonomy

Post-wrong-answer in Camp Mode: 5 horizontal pill buttons below rationale card. One tap writes to `error_type`. Debrief shows aggregated pattern if 3+ tagged.

### 10. Session Discovery

Post-session: One surprising data insight. "You answered fastest in Building Laws. Slowest in Utilities." Variable reward — genuine, data-based, non-manipulative.

### 11. Heatmap Delta View

After every session, prominently show which nodes changed. "2 nodes moved amber → green since yesterday." This is the Duolingo skill-tree equivalent — make it the emotional center.

### 12. SRS Dashboard Widget

Non-intrusive: "12 items due for review today · Building Laws, Utilities · ~15 min." Not an alert — factual status.

---

## SPRINT 3 SPECS (For Follow-Up Session)

### 13. Blindspot Protocol UI

**From UX Strategy Section 13:** Dashboard widget (persistent, non-alarming) → Detail screen (node cluster, mastery weights, opt-in CTA) → Completion screen (before/after node comparison).

Copy rule: Never "You're struggling with." Always: "Building Laws nodes have been Red for 3 weeks. A focused session is ready."

### 14. Endurance Cycle UI

Endurance Session card on dashboard (weekly). Post-session: accuracy-over-time line chart by block. "Accuracy held at 78% through item 42. Dropped to 61% in the final block."

### 15. Proof Simulation UI

Locked state: Two progress bars toward unlock (node coverage + endurance window). Unlocked: Briefing → 4-hour simulation (minimal UI) → Cold score → 24-hour diagnostic delay → Full analysis.

### 16. Elaborative Interrogation in Wiki

Parse `[EI_PROMPT]...[/EI_PROMPT]` tags in Wiki content. Render interactive "Think About It" block. Content hidden until student clicks "Reveal answer →".

---

## WHAT NOT TO DO

- **Don't build Sprints 2-3 in this session.** Sprint 1 alone is substantial.
- **Don't deviate from the copy in the UX Strategy.** Every score message, every CTA label, every tone rule is specified. Use the exact strings.
- **Don't add confetti, badges, emoji, or celebration for routine sessions.** Rams Standard. The heatmap delta is the emotional payoff.
- **Don't make the Score Reveal anything less than full-screen.** No navigation, no sidebar, no distractions. This is the most important screen.
- **Don't make GCash the second payment option.** GCash FIRST. Philippines context.
- **Don't hide "Not yet — continue free" on the paywall.** Brand integrity.
- **Don't show a timer countdown in Camp Mode.** Progress bar only.
- **Don't use "WARNING" or anxiety-inducing framing** for Storm Mode or Proof Simulation. State conditions factually.
- **Don't skip the 2-3 second intentional loading pause** after assessment question 35. "Calculating your Readiness Score..." creates ceremonial weight.
- **Don't approximate the counter animation timing.** 0 → score over 700ms, ease-out cubic. This is specified.

---

*Execute Phase 1 now. Map the existing page and component structure.*

