# Camp Trail — UX Research & Implementation Plan

> **Feature:** The daily study prescription engine at the core of SlateCamp retention
> **Document type:** UX Research + UI Implementation Specification
> **Version:** 1.0 · March 2026
> **Scope:** All Camp Trail screens, new custom components, visualization innovations

---

## Part 1 — The Research Foundation

### What We're Actually Designing

Camp Trail is not a feature. It is the answer to the most dangerous question in any educational product: *"What do I do right now?"*

Every day a student opens SlateCamp without a clear prescribed action is a day the platform fails. Every day Camp Trail gives them a specific, sequenced, personally-calibrated answer to that question is a day the product earns its ₱6,999. The entire UX exists to make the answer to "what do I do today" feel inevitable, specific, and achievable — not overwhelming, not generic, not gamified.

The governing constraint, derived from the product intent document and our gamification research: **the only valid reward signal in this entire feature is the Readiness Score changing.** Not a badge. Not a streak. Not a checkmark. The score. Everything in the UI must funnel the student's emotional attention toward that number moving.

---

### Cross-Disciplinary Research: What Other Fields Know About Structured Progress

We are not the first system to solve "how do you get a human to follow a prescribed sequence of actions over 56 days." Three other fields have cracked versions of this problem, and their solutions have direct UX implications.

---

#### 1. Marathon Training Plans (Hal Higdon, Galloway Method)

**The problem they solved:** Getting a sedentary person to run 26 miles via 18 weeks of incremental, boring work.

**What works in marathon training UX:**
- **The plan is visible in its entirety from Day 1.** You can see Week 12 before you run Week 1. This is psychologically powerful — it converts an overwhelming goal into a sequence of small, dated, specific activities.
- **Rest days are programmed, not earned.** The plan tells you when to rest. You don't decide. This removes the guilt of "not studying today" by reframing rest as prescribed.
- **Long run days are visually distinct from short run days.** Not just bigger numbers — different visual treatment. The student knows before they start that Day 14 is different from Day 13.

**Application to Camp Trail:**
- The trail calendar view must show all 56 days simultaneously. The student should be able to scroll forward and see Day 45 before they've started Day 1. This reduces the "I can't see the end" anxiety that kills adherence.
- Computation-heavy days (`is_computation_heavy = true`) need a visually distinct treatment in the calendar — not a red warning, but a "heavy day" indicator that reframes difficulty as expected and planned.
- The trail must have programmed lighter days. When the sequencer places review steps (lighter cognitive load than new content), those days should look lighter visually.

---

#### 2. Military Training Pipeline (SERE, BUD/S, PFT cycles)

**The problem they solved:** Getting a motivated person to endure months of difficult, unglamorous work with zero external validation until the very end.

**What works:**
- **Phase demarcation with clear transitions.** Military training is divided into phases. Completing a phase is a distinct milestone — not a badge, but a structural shift in what comes next. Phase 1 ends and Phase 2 is fundamentally different, not just more of the same.
- **"Hell week" is placed at the right moment, not the hardest week.** Week 4 is the most brutal week of BUD/S, not Week 8. The research is that motivation is highest early and the organism needs a crucible before the plateau of sustained effort. The hardest week is placed when motivation is still sufficient to survive it.
- **The metric is observable performance, not feelings.** "You're performing at a 72% passing rate. The threshold is 75%. You need 3% more." The army doesn't tell you that you're "almost there" emotionally. It tells you the number.

**Application to Camp Trail:**
- The 8-Week Standard Trail must have visible phase transitions: Foundations (Weeks 1–2) → Gap Targeting (Weeks 3–5) → Application (Weeks 6–7) → Integration (Week 8). The UI must show these phases in the trail calendar. Phase completion is the legitimate milestone.
- The hardest subject block (usually ALE-STRC for most students) should be front-loaded in Weeks 2–3 when motivation is still fresh — not saved for Week 6 when fatigue is real. The sequencer already does this; the UI must communicate it.
- The Readiness Score is the only number. Not "great progress!" Not "keep it up!" The number. And the direction it's moving.

---

#### 3. Clinical Trial Adherence Protocols (FDA-regulated studies)

**The problem they solved:** Getting patients to take medication on schedule for 52 weeks, with the life-or-death stakes making non-adherence catastrophic.

**What works (from Conn et al., 2015 meta-analysis of 182 adherence studies):**
- **Simplification reduces dropout, not motivation.** The single most effective adherence intervention is not reminders, not rewards — it's reducing the number of decisions required per dose. One pill vs. three pills. One daily action vs. a menu.
- **Context-cued habits (d=0.58 vs. d=0.22 for reminder-based systems).** "Take with breakfast" outperforms a 9am push notification because the cue is environmental, not manufactured. The behavior is attached to an existing anchor in the patient's day.
- **Regret avoidance outperforms reward anticipation.** "You've taken this for 47 consecutive days" is more motivating than "5 more days until your reward." Loss aversion is stronger than gain anticipation.

**Application to Camp Trail:**
- The daily trail step must be singular. One "what to do today" action is the CTA — not three simultaneous options. The student navigates to the day and sees one primary action, with secondary steps accessible but not competing.
- The "days on trail" counter on every day view is not gamification — it is regret avoidance psychology. "Day 23 of 56" says "you've invested 23 days in this." The cost of abandonment is psychologically real.
- Enrollment should anchor to an existing habit cue, not a platform-generated time. "When do you usually study? Morning / Evening / Both" is collected in onboarding. Push notifications are sent at that window, not at a default 7pm.

---

#### 4. Geological Survey Progress Mapping (USGS Long-Term Monitoring Programs)

**The problem they solved:** Visualizing incremental data collection across a multi-year field program where individual data points are meaningless but cumulative coverage is everything.

**This is the most useful cross-domain insight for Trail visualization.** The USGS's solution: the coverage map. A geographic region with zones colored by data density. Not a progress bar. Not a percentage. A spatial representation of "what has been covered and what hasn't."

The SlateCamp Taxonomy Heatmap is already this. But the Camp Trail needs to connect the trail's daily activity to the heatmap's coverage change — showing the student which zones of their knowledge map are being systematically filled in by the trail.

**Application to Camp Trail:**
- The trail day view should show a mini-heatmap preview — not the full 172-node heatmap, but a filtered view showing only the nodes targeted by today's steps. "Today you're covering 4 nodes in Structural Systems. Here's where they sit on your map."
- After day completion, the mini-heatmap updates in real-time, showing which nodes moved from grey to red or red to amber. The coverage growth is the visual reward.

---

#### 5. Video Game Level Design (Nintendo's Difficulty Curve Research)

**What works (Miyamoto, Valve's level design playbooks):**
- **Alternate hard and easy levels intentionally.** After a difficult level, place an easier one. This isn't pandering — it's restoration. Cognitively difficult material requires processing time. Easier material following hard material produces a "recovery + consolidation" effect that mirrors sleep-based learning consolidation.
- **The tutorial is the first level, not the first screen.** Nintendo's insight: the best tutorial is a playable level that teaches the mechanics by having you use them, not by explaining them. You learn by doing, not by reading instructions.
- **Save points reduce anxiety without reducing difficulty.** The knowledge that progress is saved makes the student more willing to attempt harder levels. Explicitly showing that the trail can be paused and resumed "exactly where you left off" reduces the perceived commitment cost.

**Application to Camp Trail:**
- The weekly rhythm of the 8-Week Standard Trail must alternate heavy and lighter days consciously. The sequencer should not cluster all wiki reads on Monday and all quizzes on Friday — it should interleave.
- The first day of any trail should be achievable in under 30 minutes and should contain all step types — one wiki, one short quiz, optionally one 3D Lab step. Day 1 is the tutorial level. It teaches the format by doing it.
- The "Pick up where you left off" mechanic — both on the daily view and in re-engagement emails — uses save-point psychology. "Day 23 is waiting. The map remembered where you stopped."

---

### The Filipino Architecture Reviewer — Critical Context

From our ALE candidate research, five behavioral patterns govern how this interface must work:

**Pattern 1 — Hiya culture prevents public failure acknowledgment.**
The "days completed / days total" metric must never appear in a shared or social context. It is private. "Day 14 of 56" is motivating when only the student can see it; it is potentially humiliating if a batchmate on Day 30 can see it too.

**Pattern 2 — Working professional time scarcity.**
The median user is a working DAE architect with 30–45 minutes per day. The time estimate on the day card is the most important single field in the UI. If that estimate is wrong — if it says 45 minutes and takes 90 — trust evaporates. Time estimates must be calibrated against actual session data, not assumptions.

**Pattern 3 — Mobile-first on mid-range Android.**
All progress visualizations must render at 390px width. No horizontal scroll on the main trail flow. SVG-based trail ribbon components must use `viewBox` scaling, not pixel-fixed dimensions. Minimum tap targets 44×44px throughout.

**Pattern 4 — The comprehensive exam is the natural momentum moment.**
5th-year students who just received their comp exam results are the highest-motivation enrollment moment. The trail recommendation copy must acknowledge this: "Your school's comp exam showed gaps in Structural Systems. Week 1 of this trail targets exactly that." This is not personalization for its own sake — it is the system speaking to the student's actual emotional state.

**Pattern 5 — Retakers need dignity, not sympathy.**
The word "failure" and "retry" never appear in any trail copy. Retakers are "returning candidates" with "previous cycle data." Their trail recommendation copy references their prior heatmap as an asset: "Your mastery data is still here. You don't start over." The UI for retakers is identical to the UI for first-time users — the difference is only in the copy and the sequencing logic.

---

## Part 2 — Screen-by-Screen UX Specification

### Screen 1: Trail Library (`/dashboard/trails`)

**Purpose:** Discovery and selection of the right trail. This is not a product catalog. It is a recommendation surface.

**The primary rule:** Show the recommendation first. Always. The library exists to serve the recommendation, not the other way around.

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  RECOMMENDED FOR YOU                   DM Mono, 11px, uppercase │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ★ 8-Week Standard Trail                                  │  │
│  │                                                           │  │
│  │  "Based on your 54% score and 71 days to your exam,      │  │
│  │  the 8-Week Standard Trail is the right fit.              │  │
│  │  Week 1 focuses on Building Laws — your biggest gap."    │  │
│  │                                                           │  │
│  │  56 days · ~1.5 hrs/day · Starts with Building Laws      │  │
│  │                                                           │  │
│  │                              [Start This Trail →]        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  OTHER TRAILS                          DM Mono, 11px, muted    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  TIME-GATED PROGRAMS                                           │
│  [TrailCard] 2-Week Intensive    [TrailCard] 4-Week Accelerated │
│  [TrailCard] 12-Week Comprehensive                             │
│                                                                 │
│  SUBJECT MASTERY PATHS                                         │
│  [TrailCard] Structural Design   [TrailCard] Building Laws     │
│  [TrailCard] Professional Practice ... (8 total)              │
│                                                                 │
│  CODE DEEP-DIVES                                               │
│  [TrailCard] PD 1096             [TrailCard] RA 9514           │
│  ... (8 total)                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Component: RecommendedTrailCard (new custom component)

This is the most important component on this screen. It carries the recommendation and its rationale.

**Visual spec:**
- `bg-[#1B3FC4]` (Cobalt Blue fill) — the only cobalt-filled card in the platform. This signals "recommended" without requiring a label.
- White text throughout
- ★ icon (Syne Bold, 18px) — the only star in the entire product. Used once, here, for the primary recommendation.
- The rationale copy is italic Inter 14px, slightly muted white (`rgba(255,255,255,0.85)`). It is not a headline — it is a spoken explanation.
- Trail stats row: `DM Mono 11px uppercase` — "56 DAYS · ~1.5 HRS/DAY"
- CTA: `bg-white text-[#1B3FC4]` button — the inverse color scheme on a cobalt background

**Data requirements:**
- Recommendation logic: `readiness_score` + `days_to_exam` → trail_id from recommendation matrix
- Week 1 focus: the student's weakest subject by mastery weight → copy substitution
- For retakers: prior heatmap data → "Your mastery data is still here" copy variant

---

#### Component: TrailCard (existing Card + new content)

Standard TrailCard for the library grid. Uses the existing `Card` component with custom inner content.

```
┌─────────────────────────────┐
│  CODE DEEP-DIVE              │  ← DM Mono badge, Badge component
│                              │
│  PD 1096 — National          │
│  Building Code               │  ← Syne 700, 16px
│                              │
│  14 days · ~1 hr/day         │  ← Inter 13px, ink-muted
│                              │
│  ████████░░  Pro             │  ← mini progress bar if enrolled
│                              │  ← Badge "Pro" if locked for free user
│  [View Trail]                │
└─────────────────────────────┘
```

**State variants:**
- **Not started:** Default card, no progress fill
- **Enrolled / in progress:** Shows `trail_day_completions` progress — a thin progress bar at the bottom of the card with the percentage filled
- **Completed:** Green check overlay, `bg-[#EAF5EE]` tinted background
- **Locked (free user):** Pro badge in top-right, CTA changes to "Upgrade to Access"

---

### Screen 2: Trail Detail / Enrollment (`/dashboard/trails/[slug]`)

**Purpose:** Give the student enough information to commit. Not a marketing page — an honest preview.

#### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Trails                                               │
│                                                                 │
│  8-WEEK STANDARD TRAIL                  DM Mono eyebrow        │
│  The Foundation-to-Mastery Path        Syne 800, 28px           │
│                                                                 │
│  56 days · ~1.5 hrs/day · 8 subjects covered                   │
│  [Start This Trail →]                    (sticky on scroll)    │
│                                                                 │
│  "Week 1 focuses on Building Laws — your biggest gap."         │
│  This is why this trail was recommended for you.               │
│                                                                 │
│  ─── TRAIL OVERVIEW ─────────────────────────────────────────  │
│                                                                 │
│  [TrailPhaseMap — custom component, shows all 8 weeks]         │
│                                                                 │
│  ─── WEEK-BY-WEEK PREVIEW ───────────────────────────────────  │
│                                                                 │
│  ▾ Week 1: Building Laws & Accessibility (14 sessions)         │
│    Day 1 · BP 344 Overview · 3 activities · ~35 min            │
│    Day 2 · PD 1096 Rule 7 · 3 activities · ~40 min             │
│    ...                                                          │
│                                                                 │
│  ▾ Week 2: Fire Code & Life Safety (14 sessions)               │
│  ▸ Week 3: Structural Fundamentals                              │
│  ▸ Week 4: Materials & Construction                             │
│  ...                                                            │
│                                                                 │
│  [Start This Trail →]                                           │
└─────────────────────────────────────────────────────────────────┘
```

#### Component: TrailPhaseMap (new custom component — major innovation)

**This is one of the two major new visualization innovations in Camp Trail.**

Inspired by marathon training plan calendars and geological survey maps. Shows all 56 days as a grid, with color encoding by subject and intensity.

```
WEEKS 1–8 OVERVIEW                     DM Mono label

Wk  Mon  Tue  Wed  Thu  Fri  Sat  Sun
1   ████ ████ ████ ████ ████ ████ ○
    BL   BL   BL   BL   BL   BL   (rest)

2   ████ ████ ████ ████ ████ ████ ○
    BL   FS   FS   FS   FS   FS   (rest)

3   ████ ████ ████ ████ ████ ████ ○
    ST   ST   ST   ST   ST   ST   (rest)
...
```

**Color encoding (subject by subject):**
- Building Laws (BP 344, PD 1096): `#1B3FC4` (Cobalt Blue)
- Fire & Life Safety (RA 9514): `#E63329` (Signal Red)
- Structural Design (ALE-STRC): `#E8853A` (Camp Orange)
- Materials & Methods (ALE-MATL): `#1B7A3C` (Signal Green)
- MEPF Utilities (ALE-UTIL): `#534AB7` (Purple)
- History & Theory (ALE-HIST, ALE-THEO): `#F5A623` (Signal Gold)
- Planning (ALE-PLAN): `#6B9B37` (Moss)
- Professional Practice (ALE-PRAC): `#4A7B9D` (Steel Blue)

**Day dot states:**
- `○` empty circle: rest day or no study prescribed
- `●` filled: prescribed study day
- `◑` half-filled: light/review day
- `★` star: phase transition day (Week 1→2, etc.)

**Interaction:** Tap any day → shows a tooltip with that day's step titles and estimated time. On mobile this is a bottom sheet.

**Implementation:**
```tsx
// TrailPhaseMap renders a 7×N grid using CSS Grid
// Each cell is a 28×28px div with rounded corners
// Color from the subject_focus field of trail_days
// Phase boundaries shown as subtle row separators

const DAY_SIZE = 28 // px, scales down on mobile to 22px
const GRID = `grid-cols-7 gap-[3px]`
```

---

### Screen 3: The Day View — Core of the Daily Loop

**Route:** `/dashboard/trails/[slug]/day/[dayNumber]`

This is the screen the student sees every day. It is the most visited screen in the entire product after enrollment. Its job is singular: **make the student start the first step**.

#### Layout (full specification)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Trail Overview                                               │
│                                                                 │
│  DAY 14 OF 56                           DM Mono, 11px, cobalt  │
│  Structural Systems                     Syne 700, 24px          │
│  Building Technology — Week 3 of 8      Inter 13px, muted      │
│                                                                 │
│  ~45 min total · 3 activities                                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [TrailStepCard — Wiki — pending]                              │
│  [TrailStepCard — Quiz — pending]                              │
│  [TrailStepCard — 3D Lab — optional, pending]                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  TODAY'S COVERAGE MAP                   DM Mono label          │
│  [MiniHeatmapPreview — custom component]                       │
│  4 nodes targeted today in Structural Systems                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  TRAIL PROGRESS                         DM Mono label          │
│  [TrailRibbon — custom component]                              │
│  Day 14 of 56 · 14 days completed                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Component: TrailStepCard (new custom component)

The TrailStepCard is the atomic unit of the day view. There will be 2–4 per day. It must communicate all relevant information in a single glance.

```
┌─────────────────────────────────────────────────────────────────┐
│  📖  WIKI READ                          DM Mono 9px, step type │
│                                                                 │
│  RA 9514 Fire Code:                     Inter 600, 15px        │
│  Travel Distances                                               │
│                                                                 │
│  ~15 min   ·   Best studied in the evening  ←sleep-aware label │
│                                                                 │
│  ┌─ Covers ─────────────────────────────────────────────┐      │
│  │  ALE-DSGN-003-02 · ALE-DSGN-003-03                  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│                              [Start Reading →]  ← primary CTA  │
└─────────────────────────────────────────────────────────────────┘
```

**Step type variants:**

| Step Type | Icon | Color accent | CTA text |
|---|---|---|---|
| `wiki` | 📖 | None (neutral) | "Start Reading →" |
| `quiz` | ⚡ | `bg-[#EEF2FC]` (cobalt light) | "Start Quiz →" |
| `lab` | 🏛️ | `bg-[#EEEDFE]` (purple light) | "Open 3D Lab →" |
| `review` | 🔄 | `bg-[#FFF8E6]` (gold light) | "Start Review →" |

**State variants:**
- **Pending:** Default. Border `border-[#E8E4DC]`, white background
- **In progress:** Border `border-[#1B3FC4]`, subtle cobalt background tint `bg-[#F7F9FF]`
- **Complete:** Border `border-[#1B7A3C]`, background `bg-[#EAF5EE]`, checkmark replaces CTA
- **Optional + pending:** Dashed border `border-dashed border-[#E8E4DC]`, `opacity-75`

**Sleep-aware label:**
Shows only when `step.preferred_time` conflicts with `profiles.preferred_study_window`:
- "Best studied in the morning" — shows when step is `morning` but student is `evening`
- "Best studied in the evening" — shows when step is `evening` but student is `morning`
- Never a block. Always a nudge. Inter 12px italic, ink-muted color.

**Computation-heavy indicator:**
When `is_computation_heavy = true` on any targeted node, show:
`⏱ Note: This session involves calculation — budget extra time.`
Inter 12px, Camp Orange `#E8853A`. Positioned directly under the time estimate.

**Blindspot Protocol priority flag:**
When the Blindspot Protocol has flagged any node in this step's `target_node_ids`:
```
┌────────────────────────────────────────────────┐
│  ⚠️  PRIORITY FLAG                              │
│  The Blindspot Protocol identified this topic  │
│  as a critical gap. This step matters more     │
│  than usual today.                             │
└────────────────────────────────────────────────┘
```
Background `#FFF0EF`, border `#E63329`. Appears between the step title and the CTA.

---

#### Component: MiniHeatmapPreview (new custom component)

**Inspired by the geological survey coverage map insight.**

Shows a focused, filtered slice of the full taxonomy heatmap — only the nodes targeted by today's steps. This connects the daily activity to the student's map without overwhelming them with all 172 nodes.

```
TODAY'S COVERAGE MAP                    DM Mono label

  [●●●●●●●●●]  Structural Systems (8 nodes)
  Currently:   ◌ ◌ ● ◌ ◌ ◌ ● ◌
  After today: ◌ ● ● ● ◌ ◌ ● ◌  ← projected amber

  4 nodes targeted · 2 already covered · 2 new today
```

**Design:**
- Two rows per subject group: "Currently" (real mastery state from heatmap) and "After today" (projected — shown as slightly lighter/translucent, with a note "projected if completed")
- Each node is a small colored circle: grey (unexplored), red (critical), amber (developing), green (mastered)
- "After today" row uses the same colors but 60% opacity to signal projection vs. reality
- Maximum 8 nodes displayed. If more nodes are targeted, show "and 4 more" count.
- Tap/click → navigates to the full heatmap with those nodes highlighted

**When to skip:** If all targeted nodes are already Green (mastered), replace with:
`"You've already mastered these topics. Today is consolidation — your score is protecting these gains."`

---

#### Component: TrailRibbon (new custom component — major innovation)

**This is the second major visualization innovation. Inspired by marathon tracking apps (Strava, Garmin Connect) and cardiac rehabilitation progress charts.**

The TrailRibbon is a horizontal timeline visualization of the student's entire trail, showing completed days, the current day, and upcoming days as a scrollable strip.

```
TRAIL PROGRESS: DAY 14 OF 56            DM Mono label

  ← [Days 1-13: completed]  [Day 14: today]  [Days 15-28: upcoming] →

  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ↑ start                    ↑ today                        end ↑

  Week 1   Week 2   Week 3   Week 4   Week 5   Week 6   Week 7  Wk8
```

**Detailed spec:**

The ribbon is a scrollable horizontal strip, `height: 64px` on mobile, `height: 80px` on desktop.

Each day in the ribbon is a small segment:
- **Completed day:** Filled solid with the subject color for that day. On hover/tap: shows day number, subject name, and Readiness Score change recorded at completion.
- **Current day (today):** Slightly taller than completed days. `bg-[#1B3FC4]` (cobalt). Pulsing animation — but subtle (opacity 0.8→1.0, 2-second period, CSS animation only). Label: "TODAY" in DM Mono 9px above it.
- **Upcoming day:** Filled `bg-[#E8E4DC]` (border color, neutral). Shows subject color at 30% opacity so the student can see the color pattern of what's coming.
- **Rest day:** Small gap/break in the ribbon.
- **Phase transition:** A slightly taller vertical divider between weeks, with the week number label.

**The score trajectory line:**
Overlaid on the ribbon is a thin line connecting the `readiness_score_at_completion` values from `trail_day_completions`. This makes the ribbon a hybrid: part progress tracker, part score chart.

```
Score
100% │
 80% │                              ·····
 60% │           ·····················
 40% │·············
 20% │
  0% └────────────────────────────────────────
      Day 1                              Day 56
```

The score line rises across the filled (completed) portion and stops at today. The unfilled portion shows no line (no projection). The y-axis is implied — the line just rises and falls within the ribbon's height. A "You are here" label marks today's score.

**The passing threshold line:**
A horizontal reference line at the 70% position on the score overlay. Labeled "Passing threshold" in DM Mono 9px, `#E63329`. When the score line crosses this threshold, the line color changes from `#E8853A` (below) to `#1B7A3C` (above). This is the most important visual moment in the entire trail: the day the student's trajectory crosses the passing threshold.

**Implementation notes:**
```tsx
// TrailRibbon uses a horizontal scrollable div
// CSS: overflow-x: auto; scroll-snap-type: x mandatory;
// Each day segment: scroll-snap-align: start;
// The SVG score line is absolutely positioned over the ribbon
// On load, scroll to center the "today" segment
// The score line uses Recharts LineChart with custom rendering
// or a raw SVG path for performance on low-end Android

// Segment width: 14px on mobile, 20px on desktop
// Full 56-day trail: 56 × 14px = 784px (scrollable on 390px screen)
```

**Empty state (Day 1, no completions yet):**
Ribbon shows all days unfilled. Score line doesn't exist yet. A single message: *"Your trail starts here. Complete Day 1 to see your trajectory begin."*

---

### Screen 4: Day Completion — The Most Important Moment

When the student completes all required steps for a day, the Day Completion screen fires. This is not a celebration screen. It is a factual, competency-confirming moment.

The spec from the product intent document is clear: no confetti, no badge. The only reward is genuine data.

#### Day Completion Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│  Day 14 complete.                        Syne 700, 28px        │
│  Structural Systems — covered.           Syne 400, 22px        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  YOUR MASTERY TODAY                      DM Mono label         │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                        │    │
│  │  Structural Design                                     │    │
│  │                                                        │    │
│  │  Before:  ████████░░░░░░░░░░  48%                     │    │
│  │  After:   ██████████████░░░░  61%                     │    │
│  │                                                        │    │
│  │  ▲ +13 points                                         │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  NODES UPDATED                           DM Mono label         │
│  ┌──┐┌──┐┌──┐┌──┐   4 nodes moved       colored dots          │
│  │  ││  ││  ││  │   from grey to amber                         │
│  └──┘└──┘└──┘└──┘                                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  TOMORROW                                DM Mono label         │
│  Day 15 · Seismic Design Fundamentals                          │
│  3 activities · ~40 min                                        │
│                                                                 │
│                              [Start Day 15 →]                  │
│                              [Back to Dashboard]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Component: DayCompletionMoment (new custom component)

This component renders differently based on what actually happened:

**Scenario A — Score improved:** Show the before/after bar with the delta. Text: "Your [subject] mastery moved from X% to Y% today." This is the most satisfying scenario — play it straight.

**Scenario B — Score unchanged:** Don't hide this. Text: "Today's content is in progress. The heatmap updates after you review this again in a few days." Reference spaced repetition science without jargon. Honesty builds trust.

**Scenario C — Score dipped:** This happens. Sometimes adding new hard content temporarily depresses scores before they recover. Text: "You covered new material today. Scores often dip before they rise when you're learning something genuinely hard. The data will catch up." This framing is from the product intent document's anti-inflation mechanics.

**The before/after mastery bar:**
```tsx
// Two Progress components (existing component from the codebase)
// Animated: "After" bar fills from the "Before" position over 600ms
// Shows the actual delta value (+13) in Syne 700, cobalt color
// No color change on the progress bar — just a number
```

**Node dots:**
Mini colored dots (12×12px) representing each node that changed state. Grey dot → amber dot transition is animated: a 400ms color transition from `#E8E4DC` to `#E8853A`. This is the only animation in the completion screen — and it is subtle, not celebratory.

**The "Tomorrow" preview:**
Factual. No motivational copy. Day number, subject name, activity count, time estimate. The CTA "Start Day 15 →" is available but doesn't compete for attention. The student should be able to see what tomorrow holds and feel prepared, not pressured.

---

### Screen 5: Missed Day Handling — The Hiya-Safe Return

A student who hasn't opened the trail in 3+ days returns to this state. This is the highest-churn moment. The interface must welcome them back without shaming them.

#### The Missed Day Card (on Dashboard and Day View)

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR CAMP TRAIL                        DM Mono label          │
│                                                                 │
│  You left off at Day 14.               Syne 600, 18px          │
│  8 days ago.                            Inter 14px, muted      │
│                                                                 │
│  Day 14 is ready when you are.                                  │
│                                                                 │
│  [Continue Day 14 →]        [View what I missed]               │
└─────────────────────────────────────────────────────────────────┘
```

**What this copy does:**
- "You left off at Day 14" — states fact, not failure
- "8 days ago" — honest, not accusatory
- "Day 14 is ready when you are" — the trail waited, not the student
- Two CTAs: primary continues the trail at exactly where they stopped. Secondary shows days 8–13 as a brief summary (not a shame wall — a factual catch-up view).

**No "you broke your streak" language. Ever.**

**"View what I missed" → Catch-Up View:**
A lightweight modal or page showing the missed days as a scrollable list. Each missed day shows its title and nodes. No missed-day penalty. No red warning. Just: "Here's what was covered while you were away. These nodes are still in your quiz rotation."

Option offered: "Catch up on missed days" (shows the actual content) vs. "Pick up where I left off" (resumes at Day 14, treats missed days as skipped). The student chooses. No judgment.

---

### Screen 6: Trail Completion

When a student completes all required days of a trail, this screen fires. It is the most significant moment in the entire feature — the culmination of 8 weeks of structured work.

**The product intent document is explicit: no trophy, no confetti.** The reward is real data.

#### Trail Completion Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  8-Week Standard Trail complete.                                │
│                                                                 │
│  Started: February 3, 2026                                     │
│  Completed: March 24, 2026                                     │
│  56 days                                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  YOUR SCORE OVER 56 DAYS               DM Mono label          │
│  [ScoreTrajectoryChart — full version]                         │
│                                                                 │
│  Day 1: 38%  ──────────────────────────→  Day 56: 74%         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  MASTERY ACHIEVED                       DM Mono label         │
│                                                                 │
│  172 of 172 nodes touched                                      │
│  148 nodes at Amber or Green                                   │
│  24 nodes still Red (targeted for next phase)                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  WHAT'S NEXT                                                   │
│                                                                 │
│  24 Red nodes remain. The Blindspot Protocol has               │
│  generated a 5-day Targeted Remediation trail                  │
│  for your specific gaps.                                       │
│                                                                 │
│  [Start Targeted Remediation]                                  │
│                                                                 │
│  or                                                            │
│                                                                 │
│  [Begin Proof Simulation]  (exam is in 14 days)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Component: ScoreTrajectoryChart (new custom component — the most important visualization in the product)

The ScoreTrajectoryChart is the definitive proof that Camp Trail works. It must be the most carefully designed component in the feature.

**Data source:** `trail_day_completions.readiness_score_at_completion` joined to `day_number`.

**Chart type:** Area chart (Recharts `AreaChart`). Not a line chart — an area chart. The filled area below the line gives the rising score a sense of weight, of mass, of accumulation. A rising line feels like progress. A rising filled area feels like growth.

**Visual spec:**
```tsx
<AreaChart
  data={scoreData}          // { day: number, score: number }[]
  width="100%"
  height={200}
>
  <defs>
    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#1B3FC4" stopOpacity={0.2} />
      <stop offset="95%" stopColor="#1B3FC4" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area
    type="monotone"
    dataKey="score"
    stroke="#1B3FC4"
    strokeWidth={2}
    fill="url(#scoreGradient)"
  />
  {/* Passing threshold reference line */}
  <ReferenceLine
    y={70}
    stroke="#E63329"
    strokeDasharray="4 4"
    label={{ value: "Passing threshold", position: "insideTopLeft",
             fontSize: 10, fontFamily: "DM Mono" }}
  />
  {/* Score on crossing threshold — special dot */}
  <ReferenceDot
    x={thresholdCrossingDay}
    y={70}
    r={6}
    fill="#1B7A3C"
    stroke="white"
    strokeWidth={2}
  />
</AreaChart>
```

**Key moments annotated:**
- Phase transitions (Week 2→3 etc.): vertical dashed reference lines, labeled with the new phase name
- The day the score first crosses the passing threshold: a green dot + label "Passed threshold on Day [N]"
- Notable dips (if score fell on a day): no annotation — just show the data honestly
- Start and end points: labeled with the actual score values

**Responsive behavior:**
- Mobile (390px): 200px tall, simplified — no x-axis labels (clutters), only the start/end scores labeled
- Desktop (1440px): 300px tall, full annotation

**The one-sentence summary above the chart:**
`"Your Readiness Score rose from 38% to 74% — a 36-point gain over 56 days."`
Syne 700, 20px. This is the headline. The chart is the evidence.

---

## Part 3 — Existing Components to Reuse

The following existing components must be used directly (no rebuilding):

| Existing Component | Use in Camp Trail |
|---|---|
| `Button` (`/components/ui/button`) | All CTAs throughout. Variants: default (cobalt), outline, ghost |
| `Badge` (`/components/ui/badge`) | Trail type labels (CODE DEEP-DIVE), step type labels, Pro gate badge |
| `Card` (`/components/ui/card`) | TrailCard base, section containers on trail detail page |
| `Progress` (`/components/ui/progress`) | Day step completion bar, before/after mastery bars in DayCompletionMoment |
| `Skeleton` (`/components/ui/skeleton`) | Loading states for trail library, step cards, and score chart |
| `Tabs` (`/components/ui/tabs`) | Trail library page tabs: Recommended / Time-Gated / Subject Paths / Code Deep-Dives |
| `Dialog` | Catch-up view modal for missed days, day tooltip on TrailRibbon |
| `Tooltip` | Node identifiers on MiniHeatmapPreview |
| `ScrollArea` | Horizontal scroll for TrailRibbon on mobile |
| `TaxonomyPicker` (shared admin component) | Not directly — but the heatmap mini-preview reuses its node state color system |

---

## Part 4 — New Custom Components to Build

### Complete List

| Component | File path | Purpose |
|---|---|---|
| `RecommendedTrailCard` | `components/trails/RecommendedTrailCard.tsx` | The cobalt-filled primary recommendation card |
| `TrailCard` | `components/trails/TrailCard.tsx` | Standard grid card for trail library |
| `TrailPhaseMap` | `components/trails/TrailPhaseMap.tsx` | 7-column weekly grid showing all trail days colored by subject |
| `TrailStepCard` | `components/trails/TrailStepCard.tsx` | Individual step within a day — all states (pending, active, complete, optional) |
| `TrailRibbon` | `components/trails/TrailRibbon.tsx` | Horizontal scrollable timeline with score trajectory overlay |
| `MiniHeatmapPreview` | `components/trails/MiniHeatmapPreview.tsx` | Filtered heatmap showing only today's targeted nodes |
| `DayCompletionMoment` | `components/trails/DayCompletionMoment.tsx` | Before/after mastery display, node state changes |
| `ScoreTrajectoryChart` | `components/trails/ScoreTrajectoryChart.tsx` | Full area chart from trail completion + inline version for day view |
| `BlindspotPriorityFlag` | `components/trails/BlindspotPriorityFlag.tsx` | The "Blindspot Protocol flagged this" callout for step cards |
| `SleepAwareLabel` | `components/trails/SleepAwareLabel.tsx` | Small "best studied in the evening" label for step cards |
| `MissedDayCard` | `components/trails/MissedDayCard.tsx` | The return-from-absence card on dashboard |
| `CatchUpView` | `components/trails/CatchUpView.tsx` | Modal/sheet showing missed days without shame |
| `PhaseTransitionCard` | `components/trails/PhaseTransitionCard.tsx` | The "you've entered Phase 2" moment between weeks |

---

## Part 5 — Data Flows and Server Actions

### Queries Needed

```typescript
// 1. Get all published trails with enrollment status for current user
async function getTrailsWithEnrollment(userId: string): Promise<TrailWithEnrollment[]>
// SELECT camp_trails.*, user_trail_enrollments.*
// FROM camp_trails
// LEFT JOIN user_trail_enrollments ON trail_id = camp_trails.trail_id AND user_id = $userId
// WHERE is_published = true
// ORDER BY is_featured DESC, created_at

// 2. Get trail recommendation
async function getTrailRecommendation(userId: string): Promise<TrailRecommendation>
// Reads: user_global_stats.readiness_score + profiles.target_exam_date
// Runs: recommendation matrix logic
// Returns: trail_id + rationale copy + week_1_focus_subject

// 3. Get all days + steps for a trail (for TrailPhaseMap)
async function getTrailStructure(trailId: string): Promise<TrailStructure>
// SELECT trail_days.*, trail_steps.*
// FROM trail_days JOIN trail_steps ON day_id

// 4. Get today's day + steps + completion status
async function getTodayTrailDay(enrollmentId: string): Promise<TodayData>
// Reads: user_trail_enrollments.current_day_number
// Joins: trail_days, trail_steps, user_trail_progress

// 5. Get score trajectory for an enrollment
async function getScoreTrajectory(enrollmentId: string): Promise<ScorePoint[]>
// SELECT day_number, readiness_score_at_completion
// FROM trail_day_completions WHERE enrollment_id = $enrollmentId
// ORDER BY day_number

// 6. Get mini heatmap nodes for today's steps
async function getTodayNodeStates(userId: string, nodeIds: string[]): Promise<NodeState[]>
// SELECT node_id, mastery_level, last_interaction_at
// FROM user_node_mastery
// WHERE user_id = $userId AND node_id = ANY($nodeIds)
```

### Server Actions

```typescript
// 1. Enroll in a trail
async function enrollInTrail(trailId: string): Promise<EnrollmentResult>
// INSERT INTO user_trail_enrollments

// 2. Mark a step complete
async function markStepComplete(stepId: string, enrollmentId: string): Promise<StepResult>
// INSERT INTO user_trail_progress
// Check if all steps for the day are now complete
// If yes → trigger day completion

// 3. Complete a day (triggered by markStepComplete when last step is done)
async function completeTrailDay(enrollmentId: string, dayNumber: number): Promise<DayResult>
// INSERT INTO trail_day_completions with current readiness_score
// UPDATE user_trail_enrollments SET current_day_number, days_completed

// 4. Pause / abandon trail
async function pauseTrail(enrollmentId: string): Promise<void>
async function abandonTrail(enrollmentId: string): Promise<void>
// UPDATE user_trail_enrollments SET status, days_completed_at_abandon
```

---

## Part 6 — Edge Cases and States

### The Free User Experience

Free users see the full trail library but can only enroll in the ALE Starter (4-week, high-frequency nodes only). All other trail cards show a Pro badge. The CTA changes from "View Trail" to "Upgrade to Access."

The free trail must feel complete, not neutered. It is a real 28-day structured program. The Pro gate is on the library breadth, not the concept.

### Simultaneous Enrollment (Pro/Annual users)

When a student is enrolled in 2 trails simultaneously, the dashboard shows both trail cards stacked. Each has its own "Today's Day" section. The step cards in each day view are linked to the same quiz engine — completing a quiz session credits both trails if the session covers overlapping node targets via `session_trail_credits`.

The soft cap warning: "You have 2 active trails. Most students find more than 2 difficult to balance — but if your schedule supports it, it's possible." This appears as an informational banner, not a blocking dialog. No hard gate.

### The Retaker Experience (Special Copy + Sequencing)

The only UI difference for retakers is copy. The layout, components, and data flow are identical. The difference:

- Recommendation copy references prior cycle data explicitly
- "Your mastery data is still here" appears on enrollment confirmation
- Proof Simulation unlock is immediate (no competency gate)
- Phase 1 of the trail front-loads their specific weak subjects from the prior cycle

### Trail Abandoned Mid-Way

When a student abandons a trail, the trail card in the library shows "Abandoned on Day 23." Not a red error — just a neutral state. The option to re-enroll is immediately available. Re-enrollment starts from Day 1 — the system does not resume from the abandonment point (psychological fresh start effect).

Exception: If re-enrollment happens within 7 days of abandonment, offer: "Resume from Day 23?" This is the single exception to the fresh-start default.

---

## Part 7 — Mobile Interaction Patterns

All Camp Trail screens are designed mobile-first. The TrailRibbon and TrailPhaseMap are the two components with the most complex mobile behavior.

### TrailRibbon on Mobile

- Initial scroll position: centered on "today"
- Smooth momentum scrolling: `scroll-behavior: smooth`
- Each day segment: `scroll-snap-align: start` with `scroll-snap-type: x mandatory`
- Score trajectory SVG line: absolutely positioned, `pointer-events: none`, scales with the scroll container
- Tap a day segment → opens a bottom sheet (`Drawer` from Vaul or a custom bottom sheet) showing that day's title, subject, estimated time, and completion status

### TrailPhaseMap on Mobile

- Full grid scrolls vertically (not horizontally)
- Tap a day cell → opens the same bottom sheet as TrailRibbon
- Week dividers are sticky as the user scrolls: "Week 3 of 8" stays visible as they scroll through Week 3's days
- Maximum 7 columns always: the grid never reflows to fewer columns on mobile. If 7 × 22px = 154px wide and that's too narrow, the grid column gets minimum `width: 22px` and the container scrolls horizontally within the card

### Step Card CTAs on Mobile

All CTA buttons in TrailStepCard: `min-height: 44px`, `width: 100%` on mobile. The secondary detail area (node IDs, sleep-aware label) collapses into a single "Details" row that expands on tap — preventing information overload on small screens.

---

## Part 8 — Loading States and Error Handling

### Loading Skeletons

| Screen | Skeleton elements |
|---|---|
| Trail Library | 3 skeleton TrailCards per section, Skeleton for RecommendedTrailCard (full-width) |
| Trail Detail | Skeleton for TrailPhaseMap (grid of grey dots), skeleton rows for week-by-week preview |
| Day View | 3 skeleton TrailStepCards, skeleton MiniHeatmapPreview |
| Trail Completion | Skeleton for ScoreTrajectoryChart (flat grey bar) |

All skeletons use the existing `Skeleton` component.

### Error States

| Error | Treatment |
|---|---|
| Trail data fails to load | "We couldn't load your trail. Try refreshing." + Retry button. Not a full error page — inline within the section. |
| Step completion fails to save | Optimistic UI updates immediately; if the server action fails, revert and show: "Couldn't save your progress. Tap again to retry." — the step returns to its pre-completion state. |
| Score trajectory unavailable | Replace chart with: "Your score history will appear after you complete a few more days." |
| MiniHeatmapPreview nodes unavailable | Replace with: "Today's targeted topics: [list of node names as text]" |

---

## Part 9 — Implementation Phasing

### Phase 1 — Trail Library + Enrollment (Week 1)
- `/dashboard/trails` page with `getTrailsWithEnrollment`
- `RecommendedTrailCard` and `TrailCard` components
- Trail recommendation logic (reads `readiness_score` + `target_exam_date`)
- Enrollment server action
- Trail detail page with week-by-week collapsible preview
- `TrailPhaseMap` (read-only, no interaction in phase 1)

### Phase 2 — Day View Core Loop (Week 2)
- `/dashboard/trails/[slug]/day/[dayNumber]` page
- `TrailStepCard` all states
- `SleepAwareLabel` and `BlindspotPriorityFlag`
- Step completion server actions (wiki, quiz, lab, review routing)
- Day completion trigger logic
- `MissedDayCard` on dashboard

### Phase 3 — Day Completion + Progress Visualization (Week 3)
- `DayCompletionMoment` component
- `MiniHeatmapPreview` component
- `TrailRibbon` — progress strip with score overlay
- `ScoreTrajectoryChart` inline version for day view
- Phase transition card between weeks

### Phase 4 — Trail Completion + Advanced Features (Week 4)
- Trail completion screen
- `ScoreTrajectoryChart` full version for completion screen
- Catch-up view for missed days
- Simultaneous enrollment UI
- Retaker copy variants
- Free user paywall states on trail library

---

*Camp Trail UX Implementation Plan · v1.0 · March 2026*
*SlateCamp Internal · UX Research + Product Design*
*Source references: Camp Trail Product Intent v1.0, UX Research Deep-Dive, 3D Visual Learning Research, Design System (Cobalt Blue #1B3FC4), DB Schema Reference, Cross-session UX Research Conversations*
