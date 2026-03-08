# Cerebro — Product Requirements Document
## Version 1.0 | Board Exam Prep Platform Improvement Initiative

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & Strategic Context](#2-problem-statement--strategic-context)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [Feature Specifications](#5-feature-specifications)
   - [F-01: Readiness Score System](#f-01-readiness-score-system)
   - [F-02: Daily Mission Widget](#f-02-daily-mission-widget)
   - [F-03: Onboarding Overhaul](#f-03-onboarding-overhaul)
   - [F-04: Quiz Engine UX Improvements](#f-04-quiz-engine-ux-improvements)
   - [F-05: Session Summary Shareable Card](#f-05-session-summary-shareable-card)
   - [F-06: Review Mode Confidence Tap](#f-06-review-mode-confidence-tap)
   - [F-07: SRS Forgetting Curve Visualization](#f-07-srs-forgetting-curve-visualization)
   - [F-08: Social Proof Strings](#f-08-social-proof-strings)
   - [F-09: Final Stretch Mode](#f-09-final-stretch-mode)
   - [F-10: Dashboard Information Architecture Redesign](#f-10-dashboard-information-architecture-redesign)
6. [Design System Requirements](#6-design-system-requirements)
7. [Technical Constraints & Architecture Notes](#7-technical-constraints--architecture-notes)
8. [Database Schema Changes](#8-database-schema-changes)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Out of Scope](#10-out-of-scope)
11. [Open Questions](#11-open-questions)

---

## 1. Executive Summary

Cerebro is a board exam prep web app targeting architecture students in the Philippines (ALE). It has a strong technical foundation but suffers from:

- **Buried value:** Users don't feel progress quickly enough to stay
- **No emotional anchor:** The product mirrors exam anxiety rather than fighting it
- **Weak retention mechanics:** Streak + SRS are table stakes, not differentiation
- **Underutilized market context:** The ALE community is tight-knit and social; the app is isolated

This PRD defines 10 features to ship in a phased approach. The overarching goal is to make every session feel like *progress toward passing*, not just time spent answering questions.

**North Star Metric:** % of users who complete 3 sessions in their first 7 days (D7 Activation Rate).

---

## 2. Problem Statement & Strategic Context

### 2.1 Core Problem

Students who sign up for Cerebro do not feel the product "working" for them fast enough. The onboarding is too long, the first meaningful output (mastery data) requires too many sessions, and the dashboard presents too many competing actions without a clear primary directive.

### 2.2 Market Context

- ALE (Architect Licensure Examination) is a high-stakes, high-anxiety exam in the Philippines
- ALE takers study in groups, review centers, and large Facebook communities
- Peer comparison and social accountability are strong cultural behavioral drivers
- The exam date is fixed and known — anxiety spikes predictably at D-30, D-14, D-7, D-3

### 2.3 Current Funnel Breakdown

| Stage | Problem |
|---|---|
| Signup → First Session | Onboarding is 5+ steps with no immediate payoff |
| First Session → Return | No personalized insight to bring users back |
| Day 3 → Day 14 | No re-engagement hooks; streak alone insufficient |
| Free → Paid | Upsell moment is not tied to an emotional high or a clear pain point |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

| Goal | Metric | Target |
|---|---|---|
| Faster activation | Time to first completed session | < 4 minutes from signup |
| Higher D7 retention | % completing 3 sessions in 7 days | > 35% (up from baseline) |
| Higher D30 retention | % returning on Day 30 | > 20% |
| Increased sharing | Share events per 100 sessions | > 5 |
| Increased Pro conversion | Free → Pro conversion rate | > 8% at D14 |

### 3.2 Secondary Goals

- Reduce dashboard cognitive load (measured by session start rate from dashboard)
- Increase SRS engagement (% of due items reviewed per day)
- Increase Review Mode engagement (avg. time per session)

---

## 4. User Personas

### 4.1 Primary — "The Anxious Crammer" (Ana, 24)
- Scheduled ALE in 3 months
- Studies in bursts, not consistently
- Scared of failing; motivated by proof of progress
- Uses phone 80% of the time; studies late at night
- Shares results in ALE Facebook groups

### 4.2 Secondary — "The Systematic Preparer" (Marco, 26)
- Scheduled ALE in 8 months
- Disciplined but wants to optimize
- Wants to understand which subjects need the most work
- Uses desktop; compares performance vs. peers

### 4.3 Tertiary — "The Retaker" (Jess, 28)
- Failed ALE once; high motivation, high anxiety
- Knows the content but has test-taking weaknesses
- Wants to identify specific gaps quickly

---

## 5. Feature Specifications

---

### F-01: Readiness Score System

**Priority:** P0 — Must Ship (Week 1–2)

**Problem it solves:** Users have no single emotional anchor for their progress. "Mastery %" per subject is fragmented. There is no unified answer to "Am I ready?"

#### 5.1.1 Overview

Replace or supplement fragmented mastery percentages with a single **Readiness Score (0–100)** that serves as the product's heartbeat. This score should be visible on the dashboard, session summary, and user profile.

#### 5.1.2 Score Algorithm

The Readiness Score is a weighted composite of five sub-dimensions. Each dimension produces a sub-score from 0–100, and the final score is a weighted average.

```
ReadinessScore = (
  accuracy_score     * 0.30 +
  coverage_score     * 0.25 +
  srs_health_score   * 0.20 +
  recency_score      * 0.15 +
  weak_area_score    * 0.10
)
```

**Sub-score definitions:**

| Sub-score | Calculation |
|---|---|
| `accuracy_score` | Rolling 30-day accuracy across all sessions, normalized to 0–100 |
| `coverage_score` | (unique questions answered / total questions in exam profile) * 100 |
| `srs_health_score` | (SRS items not overdue / total SRS items due today + not overdue) * 100. If no SRS items exist yet, defaults to 50. |
| `recency_score` | Decays from 100 based on days since last session: 100 if today, 80 if yesterday, 60 if 3 days, 40 if 7 days, 0 if 14+ days |
| `weak_area_score` | 100 - (% of subjects where accuracy < 60%). Each weak subject reduces score proportionally. |

**Score thresholds:**
- 0–39: "Needs Work" (red)
- 40–59: "Building Momentum" (amber)
- 60–74: "Getting There" (amber-green)
- 75–89: "Strong" (green)
- 90–100: "Exam Ready" (deep green)

#### 5.1.3 UI Component: `<ReadinessGauge />`

**File:** `src/components/shared/ReadinessGauge.tsx`

**Visual Spec:**
- Circular arc gauge (270° arc, 45° gap at the bottom)
- Arc stroke: 12px, rounded linecap
- Color: interpolated from red (#EF4444) → amber (#F59E0B) → green (#22C55E) based on score
- Center: Large score number (tabular numeric, bold, 48px on desktop / 36px on mobile)
- Below score: Threshold label (e.g., "Getting There")
- Outer ring: Subtle glow effect matching arc color, opacity 0.3
- Animation: On mount, arc animates from 0 to final score over 1200ms with ease-out-cubic easing
- Size: 200px diameter on dashboard, 140px on session summary

**Props:**
```typescript
interface ReadinessGaugeProps {
  score: number;           // 0–100
  previousScore?: number;  // for delta display
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animateOnMount?: boolean;
}
```

**Delta display:** If `previousScore` is provided and differs by ≥ 1 point, show a small badge:
- Increase: "↑ +{delta}" in green
- Decrease: "↓ -{delta}" in red
- Position: top-right of gauge

#### 5.1.4 Data Fetching

**Server Action:** `src/lib/actions/readiness.ts`

```typescript
// Function signature
export async function getReadinessScore(
  examProfileId: string
): Promise<{
  score: number;
  previousScore: number | null;
  subScores: {
    accuracy: number;
    coverage: number;
    srsHealth: number;
    recency: number;
    weakArea: number;
  };
  label: string;
  color: string;
}>
```

- Query must use `exam_profile_id` scoping on all tables
- `previousScore`: score as of 24 hours ago (cached in `daily_user_stats` or computed from a snapshot)
- This action is called in the Dashboard RSC; result passed as prop to `<ReadinessGauge />`
- Cache with `revalidatePath('/dashboard')` after each completed session

#### 5.1.5 Placement

| Location | Size | Notes |
|---|---|---|
| Dashboard — top of page, above subject grid | `lg` | Primary display, most prominent element |
| Session Summary page | `md` | Shown as "Your updated readiness" |
| Settings / Profile page | `sm` | Contextual reference |

---

### F-02: Daily Mission Widget

**Priority:** P0 — Must Ship (Week 1–2)

**Problem it solves:** The dashboard presents too many competing actions. Users waste cognitive energy deciding what to do. The Daily Mission eliminates that decision.

#### 5.2.1 Overview

A single, prominent widget on the dashboard that tells the user exactly what to do today to most improve their Readiness Score. Tapping it launches directly into a pre-configured quiz session — zero friction.

#### 5.2.2 Mission Generation Algorithm

The mission is generated server-side using the following priority logic:

```
IF srs_items_due_count > 0 AND user_tier IN ('pro', 'max'):
  → Mission Type: SRS_REVIEW
  → Label: "Review {count} items before they fade"
  
ELSE IF there_is_a_subject_with_accuracy < 0.55 AND sessions_in_last_7_days > 2:
  → Mission Type: WEAK_AREA_DRILL
  → Label: "Strengthen {subject_name} — your weakest subject"
  → subject = lowest accuracy subject with > 10 questions answered
  
ELSE IF coverage_score < 0.40:
  → Mission Type: EXPLORATION
  → Label: "Discover {subject_name} — you haven't started here yet"
  → subject = subject with fewest questions answered

ELSE:
  → Mission Type: QUICK_SESSION
  → Label: "Answer 20 questions to maintain momentum"
  → subject = highest-volume subject OR most recent subject
```

**Session config auto-built from mission type:**

| Mission Type | Session Config |
|---|---|
| SRS_REVIEW | `type: srs_review`, count: all due items (max 30) |
| WEAK_AREA_DRILL | `type: topic_drill`, subject: weak subject, count: 20, difficulty: mixed |
| EXPLORATION | `type: subject_quick`, subject: unexplored, count: 15 |
| QUICK_SESSION | `type: subject_quick`, subject: determined above, count: 20 |

#### 5.2.3 UI Component: `<DailyMission />`

**File:** `src/components/dashboard/DailyMission.tsx`

**Visual Spec:**
- Full-width card, amber left border (4px), background: `bg-amber-50` (light) / `bg-amber-950/20` (dark)
- Top row: "Today's Mission" label (small caps, muted) + mission type badge
- Main content: 24px bold mission label text
- Sub-row: "{count} questions · ~{estimated_minutes} min" (muted, small)
- CTA button: Full-width amber primary button "Start Mission →"
- If mission completed today: Show completion state — green checkmark, "Mission complete! You answered {count} questions." with a secondary "Keep going →" button

**Props:**
```typescript
interface DailyMissionProps {
  mission: {
    type: 'srs_review' | 'weak_area_drill' | 'exploration' | 'quick_session';
    label: string;
    subjectName?: string;
    questionCount: number;
    estimatedMinutes: number;
    sessionConfig: SessionConfig;
    completedToday: boolean;
  };
}
```

**Behavior:**
- "Start Mission →" button calls a Server Action that creates a `review_session` record with the pre-built config, then redirects to `/dashboard/quiz/[newSessionId]`
- The session creation must be idempotent for the same exam profile + date (no duplicate sessions if button tapped twice)
- `completedToday` is `true` if a session of this mission type was completed (status: 'completed') on the current calendar day (PH timezone: UTC+8)

#### 5.2.4 Data Fetching

**Server Action:** `src/lib/actions/daily-mission.ts`

```typescript
export async function getDailyMission(
  examProfileId: string
): Promise<DailyMissionData>

export async function startDailyMission(
  examProfileId: string,
  sessionConfig: SessionConfig
): Promise<{ sessionId: string }>
```

---

### F-03: Onboarding Overhaul

**Priority:** P0 — Must Ship (Week 3–4)

**Problem it solves:** The current onboarding is 5+ steps with no immediate payoff. Users must complete all steps before seeing any personalized value. Target: first session completed within 4 minutes of signup.

#### 5.3.1 New Onboarding Flow (3 Steps + Immediate Session)

```
Step 1: Pick Your Exam (10 seconds)
  → Single screen, large tappable cards for each board exam
  → ALE is pre-selected/highlighted for PH users (detect from browser locale/timezone)
  → "Other" option opens a text field

Step 2: When is your exam? (15 seconds)  
  → Date picker defaulting to next ALE exam date (pre-populated from board_exams table)
  → "I don't know yet" option → sets exam_date to null, skips countdown features

Step 3: Quick Diagnostic — 10 questions (2–3 minutes)
  → Auto-selected representative questions (2 per top 5 subjects by question count)
  → Shown in a stripped-down quiz UI (no progress bar, no timer, no feedback)
  → Submit all at once at the end
  → "Skip diagnostic →" link visible but below the fold

→ IMMEDIATE RESULT SCREEN (instead of a loading spinner):
  → Large Readiness Score gauge animating up from 0 to their initial score
  → "Your Readiness Score: 42 — Building Momentum"
  → 2-3 sentence personalized insight: "You're strongest in [subject]. Focus on [weak subject] first."
  → Single CTA: "Start your first real session →" → pre-configured session for weakest subject
```

**What is removed from onboarding:**
- Study hours per day selection (moved to Settings, prompted at Day 3)
- Plan selection (moved to post-first-session upsell moment)
- Profile photo upload
- "Tell us about yourself" freeform fields

#### 5.3.2 Diagnostic Question Selection

**Server Action:** `src/lib/actions/onboarding.ts`

```typescript
export async function getDiagnosticQuestions(
  boardExamId: string,
  count: number = 10
): Promise<Question[]>
```

Selection logic:
- Fetch subjects for board exam, sorted by `question_count DESC`
- Take top 5 subjects
- From each, select 2 questions: 1 where `difficulty = 'medium'`, 1 where `difficulty = 'hard'`
- Shuffle the 10 questions before returning

#### 5.3.3 Initial Readiness Score Calculation

After diagnostic submission, compute a provisional Readiness Score using modified weights:

```
InitialReadinessScore = (
  diagnostic_accuracy * 0.60 +
  0.20 * 0.25 +    // coverage starts at 20% (diagnostic counted)
  50   * 0.20 +    // srs_health neutral at start
  100  * 0.15 +    // recency perfect (just now)
  weak_area * 0.10
)
```

Store this as the Day 0 baseline in `daily_user_stats` with `source: 'diagnostic'`.

#### 5.3.4 Onboarding State Machine

Persist onboarding progress in `exam_profiles.onboarding_step` (existing field or add it). Steps: `exam_selected` → `date_set` → `diagnostic_complete` → `onboarding_completed`.

If user drops off mid-onboarding and returns, resume from their last completed step.

---

### F-04: Quiz Engine UX Improvements

**Priority:** P0 — Must Ship (Week 3–4)

**Problem it solves:** The quiz engine is functional but the micro-interactions don't reinforce progress. The answer feedback is overwhelming. The next-question CTA requires hunting.

#### 5.4.1 Progress Bar Redesign

**Current:** "Question 12 of 40" text counter.

**New:**
- Thin (4px) progress bar at the very top of the viewport (full-width, edge-to-edge, above all chrome)
- Color: amber, transitioning to green as the bar fills
- On correct answer: bar advances + brief green pulse animation (150ms scale(1.02) on the fill)
- On wrong answer: bar advances normally (no red feedback on the bar itself)
- No question count numbers unless user taps the bar (reveals tooltip: "12 of 40")

**File:** `src/components/quiz/QuizProgress.tsx` — update existing component.

#### 5.4.2 Answer Feedback Redesign

**Current (assumed):** All feedback shown simultaneously — explanation, references, fun facts, mnemonics, related topics.

**New — progressive disclosure:**

**Phase 1 — Immediate (0ms after answer tap):**
- Chosen card: transforms to show correct/incorrect state
  - Correct: card background transitions to `bg-green-50`, left border becomes 4px green, checkmark icon appears in top-right
  - Wrong: card background dims to `bg-gray-50`, left border 4px red, X icon. Correct answer card simultaneously gets green treatment
- No text. No explanation. Just the card transformation.
- Duration: 300ms transition

**Phase 2 — Explanation (400ms delay, fade in):**
- Explanation text fades in below the answer cards
- Kept to 2–3 sentences max (if explanation is longer, truncate with "Read more")
- Font: 15px, line-height 1.6, muted foreground color

**Phase 3 — Rich Context (on demand):**
- Below explanation: Row of small chips — "References", "Fun fact", "Mnemonic", "Related topics"
- Tapping a chip expands that section inline
- Default: all chips collapsed

**"Next Question" button:**
- Only rendered after an answer is selected
- Position: fixed bottom bar (above bottom nav on mobile), full-width on mobile, centered 400px on desktop
- Style: amber primary, large (56px height), bold label "Next →"
- Keyboard: Enter key triggers this button
- This button must be the *only* prominent interactive element visible after answering

**File:** `src/components/quiz/AnswerResultStrip.tsx` — major refactor.

#### 5.4.3 Choice Button States

Choice buttons must have clear, distinct visual states:

| State | Visual |
|---|---|
| Default | White/surface bg, 1px border, full-width, min-height 56px |
| Hover | `bg-gray-50`, border darkens |
| Selected (before submit) | Amber border (2px), `bg-amber-50` |
| Correct (after submit) | Green border (2px), `bg-green-50`, check icon |
| Wrong (chosen, after submit) | Red border (2px), `bg-red-50`, X icon, opacity: 0.7 |
| Correct (not chosen, after submit) | Green border (2px), `bg-green-50` — to show what was right |
| Other (not chosen, after submit) | Muted, opacity: 0.5 |

**File:** `src/components/quiz/ChoiceButton.tsx` — update existing.

#### 5.4.4 Keyboard Navigation

Ensure the following keyboard shortcuts are implemented and functional:

| Key | Action |
|---|---|
| 1, 2, 3, 4 | Select answer option A, B, C, D |
| Enter | Confirm selection OR advance to next question |
| Space | Advance to next question (after answering) |
| B | Bookmark question |
| Esc | Pause session (show confirmation dialog) |

---

### F-05: Session Summary Shareable Card

**Priority:** P1 — Ship Week 5–6

**Problem it solves:** The session summary is a functional report. It is not shareable. ALE takers share results in Facebook groups — this is free acquisition that is currently uncaptured.

#### 5.5.1 Summary Page Additions

**File:** `src/app/dashboard/quiz/[sessionId]/summary/page.tsx` — add share functionality.

**New UI elements on summary page:**
1. Prominent score display: Score as a large centered number (e.g., "78%"), subtext "Your best this week: 81%"
2. Auto-generated insight string (see 5.5.3)
3. Subject breakdown: Horizontal bar chart per subject (accuracy %)
4. "Share your result" section with "Share as Image" button
5. Stats row: Questions answered, time taken, streak day

#### 5.5.2 Share Card Visual Spec

The share card is rendered on-canvas via `html2canvas` or similar, then offered as a PNG download.

**Card dimensions:** 1080 × 1080px (square, Instagram/FB-safe)

**Card layout (top to bottom):**
- Cerebro wordmark, top-left (small, 20px)
- Exam profile name, top-right (e.g., "ALE 2025", small, muted)
- Large score: centered, 120px bold — e.g., "78%"
- Session label: "Architecture Licensure Exam — Practice Session"
- Subject breakdown: 3–5 subject rows with accuracy bars
- Auto-generated insight (see below)
- Bottom bar: "cerebroapp.ph" (or your actual domain) + Readiness Score badge

**Color treatment:** Light background, amber accent, clean typography. Not dark mode (lighter cards perform better on social).

**File:** `src/components/quiz/ShareCard.tsx` (new component, rendered off-screen for canvas capture).

#### 5.5.3 Auto-Generated Insight String

Server-side, generate one of these insight strings based on session data:

```typescript
// Improvement
"You're {delta}% stronger in {subject} than last week."

// Top performance  
"Your accuracy in {subject} is in the top 25% of ALE reviewees."

// Streak
"Day {streak} streak — consistency is your superpower."

// Coverage milestone
"You've now answered {count} unique ALE questions. Keep going."

// First session
"Your first session sets the baseline. Every question from here makes you stronger."
```

**Server Action:** `src/lib/actions/session-insights.ts`

```typescript
export async function generateSessionInsight(
  sessionId: string,
  examProfileId: string
): Promise<string>
```

#### 5.5.4 Share Button Behavior

```typescript
// Client component behavior
const handleShare = async () => {
  // 1. Render ShareCard component into a hidden div
  // 2. Use html2canvas to capture as PNG blob
  // 3. If navigator.share is available (mobile): use Web Share API with file
  // 4. Else: trigger download of PNG file named "cerebro-result-{date}.png"
}
```

Dependencies to add: `html2canvas` (or `dom-to-image-more`)

---

### F-06: Review Mode Confidence Tap

**Priority:** P1 — Ship Week 11–12

**Problem it solves:** Review Mode ("doomscroll") is passive. Users aren't retaining as much because there's no active recall component. Adding a single decision before the answer turns passive reading into low-friction active recall.

#### 5.6.1 New Interaction Flow

**Before this change:**
1. User sees question
2. User taps "Check Answer"
3. Sees answer + explanation

**After this change:**
1. User sees question
2. Two large tappable zones appear at the bottom: `[ 🧠 I know this ]` and `[ 🤔 Not sure ]`
3. User taps one (this is the confidence tap — it is logged)
4. Answer + explanation revealed immediately (no second tap needed)
5. If they tapped "I know this" but the answer shown reveals they were wrong: gentle visual cue ("Tricky one!")

**No scoring, no right/wrong judgment on the confidence tap itself.** It is purely for self-assessment.

#### 5.6.2 Tracking

Log to `review_mode_interactions` with a new boolean column `self_assessed_known` (true = "I know this", false = "Not sure").

This data feeds future adaptive features without adding visible complexity now.

#### 5.6.3 UI Spec

**Confidence zone buttons:**
- Full-width, side-by-side (50/50 on mobile)
- Height: 64px, rounded-xl
- "I know this": subtle green tint background, brain emoji, bold label
- "Not sure": subtle amber tint background, question mark emoji, bold label
- Replace current "Check Answer" button entirely
- On tap: buttons animate down/fade out, answer section slides up from below

**File:** `src/app/dashboard/review/page.tsx` + `src/components/quiz/ConfidenceTap.tsx` (new)

---

### F-07: SRS Forgetting Curve Visualization

**Priority:** P1 — Ship Week 11–12

**Problem it solves:** Users skip SRS because it feels optional. Making the forgetting curve tangible creates urgency and scientific legitimacy for reviewing.

#### 5.7.1 Per-Item Forgetting Curve Display

On the SRS review queue (when the user sees the list of due items), add a micro-visualization per item:

**Per-item info:**
- Last reviewed: "{N} days ago"
- Retention estimate: "{X}% retention remaining" (computed from Ebbinghaus decay formula)
- Mini spark-line: Small curve showing retention declining from last review to now, with "now" marker

**Retention formula:**
```
R(t) = e^(-t / S)
```
Where `t` = days since last review, `S` = stability factor (from SM-2 interval). Display as percentage.

#### 5.7.2 SRS Dashboard Widget

On the main dashboard, the SRS due indicator changes from a plain badge count to:

**If SRS items are due:**
```
┌─────────────────────────────────────┐
│ ⚡ 8 items need review today         │
│ Avg. retention: 34% → dropping fast │
│ [Start SRS Review]                  │
└─────────────────────────────────────┘
```

**If no items due:**
```
┌─────────────────────────────────────┐
│ ✓ You're caught up on SRS           │  
│ Next review: in 4 hours (3 items)   │
└─────────────────────────────────────┘
```

**File:** `src/components/dashboard/SRSWidget.tsx` (new or refactor existing)

#### 5.7.3 Data Requirements

Add computed column or query to `srs_queue`:
```sql
-- Compute retention for each due item
SELECT 
  q.*,
  EXTRACT(EPOCH FROM (NOW() - q.last_reviewed_at)) / 86400 AS days_since_review,
  EXP(-1 * (EXTRACT(EPOCH FROM (NOW() - q.last_reviewed_at)) / 86400) / 
      NULLIF(q.interval_days, 0)) AS retention_estimate
FROM srs_queue q
WHERE q.exam_profile_id = $1
  AND q.next_review_at <= NOW();
```

---

### F-08: Social Proof Strings

**Priority:** P1 — Ship Week 5–6

**Problem it solves:** Studying alone feels isolating. Showing that others are engaging with the same content creates community without requiring social features.

#### 5.8.1 "Others are studying this" Strings

Display social proof on two surfaces:

**A. Within quiz sessions — below each question:**
- "{N} ALE reviewees answered this question this week. {X}% got it right."
- Only shown AFTER the user has answered (not before — prevents anchoring bias)
- Data: aggregate from `session_questions` joined by `question_id`, rolling 7-day window

**B. On subject cards (dashboard):**
- "{N} people studied {subject_name} today"
- Rolling 24-hour count of unique users with sessions touching that subject

#### 5.8.2 Data Requirements

**New server action:** `src/lib/actions/social-proof.ts`

```typescript
export async function getQuestionSocialProof(
  questionId: string
): Promise<{
  weeklyAttempts: number;
  weeklyAccuracy: number;  // 0–1
}>

export async function getSubjectDailyStudiers(
  subjectId: string
): Promise<number>
```

**Important:** These queries must NOT expose individual user data. Only aggregates. Min threshold: don't show if < 5 users (shows "Be one of the first to answer this").

#### 5.8.3 Privacy Note

Social proof uses only aggregate counts. No usernames, no profiles. The text "ALE reviewees" is intentionally vague — it refers to all Cerebro users studying for ALE, not a specific cohort.

---

### F-09: Final Stretch Mode

**Priority:** P1 — Ship Week 9–10

**Problem it solves:** Students are most motivated (and most willing to pay) in the final weeks before their exam. The app currently does nothing different during this period.

#### 5.9.1 Trigger Conditions

Final Stretch Mode activates automatically when:
```
exam_profiles.exam_date IS NOT NULL 
AND exam_profiles.exam_date - CURRENT_DATE BETWEEN 0 AND 30
```

It has four sub-phases:

| Days to Exam | Phase Name | Behavior Changes |
|---|---|---|
| 21–30 | "Final Approach" | Subtle UI changes, increased SRS frequency |
| 8–20 | "Countdown" | Dashboard transformed, daily email summaries |
| 4–7 | "Final Week" | Aggressive weak area surfacing, reduced new content |
| 0–3 | "Exam Eve" | Calm mode — only confidence-boosting review, no new hard content |

#### 5.9.2 Dashboard Transformation

When Final Stretch Mode is active, the dashboard layout changes:

**Header area:**
- Replace generic "Good morning" with "T-{N} days to your ALE"
- Large countdown display: days remaining as a prominent number
- Readiness Score becomes even more prominent

**Mission widget:**
- In "Final Week" phase: mission is always weak-area focused, cannot be overridden
- In "Exam Eve" phase: mission becomes "Quick confidence review — 10 easy questions you've mastered"

**New widget: "What to focus on"**
- Surfaces top 3 weak subjects with: subject name, accuracy %, suggested question count
- One-tap to drill each

**Subject cards:**
- Add urgency indicator: red dot on subjects where accuracy < 55%
- Green checkmark on subjects where accuracy > 75% (implicitly "covered")

#### 5.9.3 Daily Email Summary (Final Stretch)

When in "Countdown" phase or later, send a daily email (via Resend) with:
- Today's Readiness Score + delta from yesterday
- Suggested focus for today
- # of SRS items due
- Motivational message (rotated from a curated set of 14)

**Trigger:** Supabase Edge Function, cron job, daily at 7:00 AM PH time (UTC+8 = 23:00 UTC)

**Opt-out:** Always-present unsubscribe link. Store preference in `profiles.email_preferences JSONB`.

#### 5.9.4 Pro Upsell in Final Stretch

At the start of Final Stretch Mode, if user is on Free tier:
- Show a modal: "You're {N} days from your ALE. Upgrade to Pro to unlock SRS and full analytics — the tools you need most right now."
- This is the single highest-converting upsell moment. Show it once per exam profile.
- Store shown state in `exam_profiles.final_stretch_upsell_shown BOOLEAN`.

**File:** `src/components/dashboard/FinalStretchBanner.tsx` (new)
**File:** `src/components/modals/FinalStretchUpsellModal.tsx` (new)

---

### F-10: Dashboard Information Architecture Redesign

**Priority:** P0 — Must Ship (Week 1–2, in parallel with F-01 and F-02)

**Problem it solves:** The dashboard has too many competing CTAs and information sections fighting for attention. The primary action (start studying) is buried among stats, quick actions, and subject cards.

#### 5.10.1 New Dashboard Layout

The dashboard follows a strict visual hierarchy: one primary zone, one secondary zone, one tertiary zone.

**Primary Zone (top, full-width):**
```
[ Readiness Gauge (left, 200px) | Daily Mission (right, fills remaining) ]
```
These two components are the first thing a user sees. Everything below is secondary.

**Secondary Zone (middle):**
- Left column (2/3 width): Subject cards grid (compact, 2 columns on mobile, 3 on desktop)
- Right column (1/3 width, desktop only):
  - SRS Widget (if Pro/Max and items due)
  - Exam countdown (if exam date set)
  - Streak counter

**Tertiary Zone (bottom):**
- Recent sessions (last 3 only, collapsible)
- Quick actions row (New Session, Browse Library) — ghost/outline buttons, not primary

#### 5.10.2 Subject Cards Simplification

Current subject cards show too much. New compact cards:

**Default state:**
- Subject icon (24px) + Subject name
- Mastery % (Pro/Max) or question count (Free)
- Single CTA: "Quick Start" (amber, fills card bottom)

**On hover/tap (sheet/popover):**
- Full stats
- "Custom Session" option
- "Browse 3D" option (if applicable)

This removes the crowded card layout and gives each card one clear action.

#### 5.10.3 Empty State Redesign

All empty states must follow this template:
- Icon (24px, muted)
- One-line state description (what's empty and why)
- One CTA (what to do about it)

**Examples:**

| Empty State | Current | New |
|---|---|---|
| No SRS items due | "No items due" | "All caught up. Next review in 4 hours." |
| No sessions yet | "No sessions" | "Start your first session to unlock insights." |
| No streak | "Streak: 0" | "Answer questions today to start your streak." |
| Pro feature (Free user) | Lock icon | "{Feature} is available on Pro. Upgrade →" |

---

## 6. Design System Requirements

### 6.1 New Components to Create

| Component | Path | Description |
|---|---|---|
| `ReadinessGauge` | `src/components/shared/ReadinessGauge.tsx` | SVG arc gauge with animation |
| `DailyMission` | `src/components/dashboard/DailyMission.tsx` | Mission card with amber styling |
| `SRSWidget` | `src/components/dashboard/SRSWidget.tsx` | SRS due count + retention info |
| `ConfidenceTap` | `src/components/quiz/ConfidenceTap.tsx` | I know this / Not sure buttons |
| `ShareCard` | `src/components/quiz/ShareCard.tsx` | Off-screen canvas render for share image |
| `FinalStretchBanner` | `src/components/dashboard/FinalStretchBanner.tsx` | Countdown banner |
| `FinalStretchUpsellModal` | `src/components/modals/FinalStretchUpsellModal.tsx` | One-time upsell modal |
| `ForgettingCurveSparkline` | `src/components/srs/ForgettingCurveSparkline.tsx` | Mini SVG retention curve |

### 6.2 Existing Components to Modify

| Component | Change |
|---|---|
| `src/components/quiz/QuizProgress.tsx` | Full-width top bar instead of text counter |
| `src/components/quiz/ChoiceButton.tsx` | Add all new visual states |
| `src/components/quiz/AnswerResultStrip.tsx` | Progressive disclosure redesign |
| `src/app/dashboard/quiz/[sessionId]/summary/page.tsx` | Add share card + insight string |
| `src/app/dashboard/review/page.tsx` | Replace "Check Answer" with ConfidenceTap |
| `src/app/(auth)/onboarding/page.tsx` | Complete rewrite to 3-step flow |
| Dashboard layout / page | New 3-zone layout |

### 6.3 CSS / Token Requirements

Add the following CSS custom properties to your global stylesheet:

```css
/* Readiness Score colors */
--readiness-danger: #EF4444;
--readiness-warning: #F59E0B;
--readiness-good: #84CC16;
--readiness-strong: #22C55E;

/* Final Stretch mode */
--final-stretch-accent: #EF4444;
--final-stretch-bg: #FFF5F5;

/* Confidence tap */
--confidence-know: #F0FDF4;
--confidence-unsure: #FFFBEB;
```

### 6.4 Animation Standards

All new animations must adhere to:
- Duration: 150ms for micro-interactions, 300ms for state changes, 1000–1200ms for entrance animations (gauges)
- Easing: `ease-out` for entrances, `ease-in-out` for state changes
- No bouncing, no spring physics (per existing "Rams Standard" anti-patterns)
- Must respect `prefers-reduced-motion`: wrap all animations in a check

```css
@media (prefers-reduced-motion: reduce) {
  /* disable or simplify all animations */
}
```

---

## 7. Technical Constraints & Architecture Notes

### 7.1 Existing Constraints (Must Not Violate)

- No `localStorage` for auth or session state
- No `useEffect` for data fetching
- All DB writes via Server Actions (`'use server'`)
- TypeScript strict mode, no `any`
- No inline `console.log` in production code
- No spinners — use skeleton loaders only
- No database columns/tables not in `DATABASE_SCHEMA.sql`

### 7.2 Performance Requirements

- Readiness Score computation must complete in < 500ms. If computation is expensive, cache result in `daily_user_stats` and revalidate only on session completion.
- ShareCard canvas render must complete in < 2 seconds on mobile
- Daily Mission must be generated server-side and available as part of the dashboard RSC (no additional client-side fetch)

### 7.3 Mobile-First Requirements

- All touch targets ≥ 44px (existing requirement)
- ConfidenceTap buttons: minimum 64px height, full width
- ShareCard: must work on mobile Safari (test Web Share API fallback)
- FinalStretchBanner: readable at 375px viewport width

### 7.4 Tier Gating

| Feature | Free | Pro | Max |
|---|---|---|---|
| Readiness Score | ✅ (limited accuracy, no SRS sub-score) | ✅ Full | ✅ Full |
| Daily Mission | ✅ (exploration + quick session types only) | ✅ Full | ✅ Full |
| SRS Widget | ❌ (show with lock + upsell) | ✅ | ✅ |
| ShareCard | ✅ | ✅ | ✅ |
| Social Proof Strings | ✅ | ✅ | ✅ |
| Final Stretch Mode | ✅ (limited — no daily email) | ✅ | ✅ |
| Forgetting Curve Viz | ❌ | ✅ | ✅ |

---

## 8. Database Schema Changes

All changes must be added to `DATABASE_SCHEMA.sql`. No changes should be made to the database that are not reflected there.

### 8.1 New Columns

```sql
-- Add to exam_profiles
ALTER TABLE exam_profiles 
  ADD COLUMN IF NOT EXISTS onboarding_step TEXT 
    DEFAULT 'exam_selected' 
    CHECK (onboarding_step IN ('exam_selected', 'date_set', 'diagnostic_complete', 'onboarding_completed')),
  ADD COLUMN IF NOT EXISTS final_stretch_upsell_shown BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS initial_readiness_score INTEGER;

-- Add to review_mode_interactions
ALTER TABLE review_mode_interactions
  ADD COLUMN IF NOT EXISTS self_assessed_known BOOLEAN;

-- Add to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"final_stretch_daily": true}'::jsonb;
```

### 8.2 New Tables

```sql
-- Cache readiness score snapshots for delta computation and history
CREATE TABLE IF NOT EXISTS readiness_score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_profile_id UUID NOT NULL REFERENCES exam_profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  sub_scores JSONB NOT NULL, -- {accuracy, coverage, srs_health, recency, weak_area}
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'session_complete' 
    CHECK (source IN ('session_complete', 'diagnostic', 'daily_cron', 'manual'))
);

CREATE INDEX IF NOT EXISTS idx_readiness_snapshots_profile_time 
  ON readiness_score_snapshots(exam_profile_id, computed_at DESC);

-- RLS
ALTER TABLE readiness_score_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own readiness snapshots"
  ON readiness_score_snapshots FOR SELECT
  USING (
    exam_profile_id IN (
      SELECT id FROM exam_profiles WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own readiness snapshots"
  ON readiness_score_snapshots FOR INSERT
  WITH CHECK (
    exam_profile_id IN (
      SELECT id FROM exam_profiles WHERE user_id = auth.uid()
    )
  );
```

### 8.3 New Database Functions

```sql
-- Compute readiness score for an exam profile
CREATE OR REPLACE FUNCTION compute_readiness_score(p_exam_profile_id UUID)
RETURNS TABLE(
  score INTEGER,
  accuracy_score NUMERIC,
  coverage_score NUMERIC,
  srs_health_score NUMERIC,
  recency_score NUMERIC,
  weak_area_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation per F-01 algorithm
-- (to be implemented in migration)
$$;
```

---

## 9. Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–2)
**Goal:** Ship the core emotional anchor and primary action driver.

| Task | Component/File | Estimate |
|---|---|---|
| Readiness Score algorithm (server action) | `src/lib/actions/readiness.ts` | 1 day |
| `ReadinessGauge` SVG component | `src/components/shared/ReadinessGauge.tsx` | 1 day |
| DB migration (new tables + columns) | `DATABASE_SCHEMA.sql` + migration file | 0.5 day |
| Daily Mission algorithm (server action) | `src/lib/actions/daily-mission.ts` | 1 day |
| `DailyMission` widget component | `src/components/dashboard/DailyMission.tsx` | 1 day |
| Dashboard layout 3-zone redesign | Dashboard page + layout | 1.5 days |
| Subject card compact redesign | Subject card component | 1 day |
| Empty state copy updates | All empty states | 0.5 day |

**Phase 1 Exit Criteria:**
- ReadinessGauge renders with correct score on dashboard
- DailyMission widget shows and tapping it starts a session
- Dashboard has 3-zone layout with no competing primary CTAs

---

### Phase 2 — Session Quality (Weeks 3–4)
**Goal:** Make every session feel like progress.

| Task | Component/File | Estimate |
|---|---|---|
| Onboarding 3-step rewrite | `src/app/(auth)/onboarding/` | 2 days |
| Diagnostic question selection | `src/lib/actions/onboarding.ts` | 0.5 day |
| Initial Readiness Score display | Onboarding result screen | 1 day |
| Progress bar redesign | `QuizProgress.tsx` | 0.5 day |
| Choice button visual states | `ChoiceButton.tsx` | 0.5 day |
| Answer feedback progressive disclosure | `AnswerResultStrip.tsx` | 1.5 days |
| Fixed "Next →" bottom bar | Quiz layout | 0.5 day |
| Keyboard shortcuts audit + fix | Quiz engine | 0.5 day |

**Phase 2 Exit Criteria:**
- Onboarding completes to first session in < 4 minutes (manual test)
- Quiz answer feedback shows correct/wrong instantly, explanation on delay
- "Next →" button is always visible and prominent after answering

---

### Phase 3 — Sharing & Social (Weeks 5–6)
**Goal:** Generate word-of-mouth via shareable moments.

| Task | Component/File | Estimate |
|---|---|---|
| Session insight generator | `src/lib/actions/session-insights.ts` | 1 day |
| ShareCard component (off-screen render) | `src/components/quiz/ShareCard.tsx` | 1.5 days |
| html2canvas integration + PNG download | Summary page | 1 day |
| Web Share API integration (mobile) | Summary page | 0.5 day |
| Social proof data queries | `src/lib/actions/social-proof.ts` | 1 day |
| Social proof strings in quiz + subject cards | Quiz + dashboard | 1 day |

**Phase 3 Exit Criteria:**
- "Share as Image" button on session summary produces a clean 1080×1080 PNG
- Social proof strings appear after answering (not before)
- Social proof respects minimum threshold (no data shown for < 5 users)

---

### Phase 4 — Conversion & Monetization (Weeks 7–8)
**Goal:** Convert free users at the highest-intent moment.

| Task | Component/File | Estimate |
|---|---|---|
| Final Stretch mode trigger logic | Supabase function or RSC check | 0.5 day |
| Dashboard transformation for Final Stretch | Dashboard page | 1.5 days |
| `FinalStretchBanner` component | New component | 0.5 day |
| `FinalStretchUpsellModal` (one-time) | New component | 1 day |
| "What to focus on" widget (Final Stretch) | New component | 1 day |
| Daily email template (Resend) | Email template + Edge Function | 2 days |
| Email opt-out preference saving | Settings page | 0.5 day |

**Phase 4 Exit Criteria:**
- Final Stretch mode activates correctly when exam_date ≤ 30 days away
- Upsell modal shows once and never again after dismissal
- Daily email sends correctly to test account at scheduled time

---

### Phase 5 — Retention Depth (Weeks 9–12)
**Goal:** Increase long-term engagement with SRS and Review Mode.

| Task | Component/File | Estimate |
|---|---|---|
| SRS retention formula computation | `src/lib/srs/retention.ts` | 1 day |
| `SRSWidget` redesign with retention info | New/refactored component | 1 day |
| `ForgettingCurveSparkline` SVG | New component | 1 day |
| SRS due list with per-item retention % | SRS review page | 1 day |
| `ConfidenceTap` component | New component | 1 day |
| Review Mode integration with ConfidenceTap | Review page | 0.5 day |
| `self_assessed_known` column + logging | DB + tracking | 0.5 day |

**Phase 5 Exit Criteria:**
- SRS items show retention percentage
- Review Mode shows "I know this / Not sure" before revealing answer
- Confidence tap data is being logged to DB

---

## 10. Out of Scope

The following are explicitly out of scope for this PRD:

- React Three Fiber / 3D Lab integration (separate initiative)
- AI Tutor (Max tier) changes
- Admin panel changes
- Multiplayer or real-time study features
- Native mobile app
- Offline mode
- New question bank content
- Payment/billing flow changes (except Final Stretch upsell modal)
- Library/Marketplace redesign

---

## 11. Open Questions

| # | Question | Owner | Target Date |
|---|---|---|---|
| 1 | What is the actual domain / app URL for the ShareCard branding? | Product | Before Phase 3 |
| 2 | Does the Readiness Score need to be visible to non-logged-in users (marketing)? | Product | Before Phase 1 |
| 3 | Which Resend email template library to use? Does the team have a Resend account set up? | Engineering | Before Phase 4 |
| 4 | Is there an existing analytics pipeline where activation metrics can be tracked? (PostHog planned) | Engineering | Before Phase 1 |
| 5 | What is the target minimum number of ALE questions in the DB needed for social proof to be non-trivial? | Content | Before Phase 3 |
| 6 | Should the initial Readiness Score from the diagnostic persist as a historical data point even if very low? | Product | Before Phase 2 |
| 7 | For Final Stretch daily email: send at 7 AM PH time every day, or only on days the user hasn't studied? | Product | Before Phase 4 |

---

*Document version: 1.0*
*Last updated: 2026-03-08*
*Author: Product Team*
*For use with: Claude Code execution*