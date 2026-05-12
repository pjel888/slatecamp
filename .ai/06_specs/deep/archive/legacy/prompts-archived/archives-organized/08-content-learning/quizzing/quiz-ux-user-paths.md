# Interactive Quiz UX/UI: Complete User Paths & Learning Methodology Blueprint

> **Document Type:** Frontend Engineering & UX Design Blueprint
> **Domain:** Interactive E-Learning / Gamified Quiz Application
> **Standard:** Web & Mobile (Responsive)
> **Author-Ready:** Yes — structured for direct implementation by UI designers and frontend engineers

---

## Table of Contents

1. [Research Methodology Summary](#1-research-methodology-summary)
2. [Core Learning Principles & UX Frameworks](#2-core-learning-principles--ux-frameworks)
3. [Macro-Level User Flow Architecture](#3-macro-level-user-flow-architecture)
4. [Phase 1: Setup Phase — Detailed User Path](#4-phase-1-setup-phase--detailed-user-path)
5. [Phase 2: Active Quizzing Phase — Detailed User Path](#5-phase-2-active-quizzing-phase--detailed-user-path)
6. [Phase 3: Review & Results Phase — Detailed User Path](#6-phase-3-review--results-phase--detailed-user-path)
7. [Auxiliary Flows](#7-auxiliary-flows)
   - [7A. Exit / Pause Flow](#7a-exit--pause-flow)
   - [7B. Save & Resume Flow](#7b-save--resume-flow)
   - [7C. Timer Warning & Expiry Flow](#7c-timer-warning--expiry-flow)
   - [7D. Adaptive Difficulty Flow](#7d-adaptive-difficulty-flow)
8. [Micro-Interaction & Animation Specification](#8-micro-interaction--animation-specification)
9. [UI Component State Matrix](#9-ui-component-state-matrix)
10. [Accessibility & Cognitive Load Checklist](#10-accessibility--cognitive-load-checklist)

---

## 1. Research Methodology Summary

This blueprint synthesizes findings across four validated instructional design and UX research frameworks:

- **Cognitive Load Theory (CLT):** Working memory can only hold 5–9 chunks of information at once. Every screen must minimize extraneous load (unnecessary complexity) and maximize germane load (meaningful learning connections). Single-question-per-screen layouts, clean typography, and distraction-free question containers directly apply CLT to quiz UI.
- **Retrieval Practice / Testing Effect:** Students who engage in regular active recall quizzing retain up to 50% more information over time compared to passive review. The quiz UI must be built to encourage recalling from memory — not just recognition — through timed questions and deliberate answer submission flows.
- **Spaced Repetition & Forgetting Curve:** Ebbinghaus's forgetting curve shows that reviewing material at planned, increasing intervals dramatically reduces memory decay. The quiz UI should track which items were answered incorrectly and surface them again in future sessions.
- **Immediate Feedback Loops:** Immediate feedback (shown instantly after answer submission) is proven more effective than delayed feedback for knowledge acquisition. The UI must show correct/incorrect status, explanations, and the right answer within the same screen interaction — not after the quiz ends.
- **Progressive Disclosure:** Rather than overwhelming users with all options upfront, information is revealed layer by layer. Quiz setup screens use this by starting with mode selection before exposing configuration options. One question at a time enforces progressive disclosure during active quizzing.
- **Gamification Mechanics:** Streaks, XP points, badges, progress bars, leaderboards, and celebratory animations (confetti, character reactions) create intrinsic motivation loops. Research shows these design tools build emotional commitment and return behavior.
- **Adaptive Difficulty (Zone of Proximal Development):** The ideal challenge zone is 65–75% difficulty. Too easy produces boredom; too hard produces frustration. An adaptive algorithm tracks accuracy per topic, response time, and forgetting curves, then adjusts question difficulty in real time.

---

## 2. Core Learning Principles & UX Frameworks

### 2.1 Micro-Interaction Timing Standards

| Interaction Type | Duration | Example Use |
|---|---|---|
| Button press / instant feedback | 150–250ms | Tap on answer option, register selection |
| Screen transitions | 300–600ms | Moving from question to feedback screen |
| Progress bar fill animation | 300–500ms | Updating progress bar after each answer |
| Modal / overlay appearance | 200–350ms | Pause modal, exit confirmation |
| Loading / skeleton screens | 500–1000ms | Pre-quiz load, results calculation |
| Celebratory animations | 600–1200ms | Confetti on perfect score, streak badge |
| Error shake animation | 400ms | Wrong answer selected |
| Correct pulse/glow | 500ms | Correct answer highlight |

### 2.2 Answer Option Component States

Every answer option button must support these distinct visual states:

| State | Visual Treatment |
|---|---|
| Default | Neutral fill, dark border, readable label |
| Hover / Focus | Slight elevation, border color change (brand color), cursor pointer |
| Selected (Pending) | Brand color fill, white label, checkmark placeholder visible |
| Submitted: Correct | Green fill (#22C55E or similar), white checkmark icon, scale-up pulse 1.0→1.03 |
| Submitted: Incorrect (user's pick) | Red fill (#EF4444 or similar), X icon, horizontal shake animation |
| Submitted: Revealed Correct (other option) | Green outline only, correct icon, labeled "Correct Answer" |
| Disabled (after submission) | Greyed out, pointer-events: none for all non-relevant options |

### 2.3 Screen Hierarchy Rules (Cognitive Load)

1. **One primary action per screen** — never ask two questions at once
2. **Question text is always largest typographic element** on the question screen
3. **Timer is always visible** but never distracting (top-right position, small but readable)
4. **Progress indicator is always present** (top progress bar or "Question X of Y")
5. **Answer options never exceed 4 choices** for multiple-choice to prevent choice overload
6. **Feedback explanations are collapsed by default** and expanded on tap ("Learn More")

---

## 3. Macro-Level User Flow Architecture

```
[APP LAUNCH]
     │
     ▼
[SPLASH SCREEN / AUTH CHECK]
     │
     ├─── Not Logged In ──→ [LOGIN / REGISTRATION FLOW]
     │                               │
     └─── Logged In ──────────────────┘
                                     │
                                     ▼
                             [HOME DASHBOARD]
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │   PHASE 1: SETUP    │
                         │  Quiz Mode Select   │
                         │  Category Select    │
                         │  Configuration      │
                         │  Pre-Quiz Briefing  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ PHASE 2: QUIZZING   │
                         │  Loading Screen     │
                         │  Q1 → Q2 → Q[N]    │
                         │  Per-Q Feedback     │
                         │  Progress Updates   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  PHASE 3: RESULTS   │
                         │  Score Summary      │
                         │  Performance Data   │
                         │  Review Answers     │
                         │  Next Actions       │
                         └─────────────────────┘
```

**Auxiliary Flows (can interrupt Phase 2 at any question):**
- Exit / Pause Flow
- Save & Resume Flow
- Timer Expiry Flow
- Adaptive Difficulty Adjustment (silent/background)

---

## 4. Phase 1: Setup Phase — Detailed User Path

### Screen 1.0 — App Launch & Splash Screen

**Step 1.1 — User opens the app**
- **System Response:** Splash screen renders immediately
  - Full-screen branded background with app logo centered
  - Logo entrance animation: fade-in + scale 0.8 → 1.0, duration 400ms
  - Tagline appears below logo with stagger delay of 200ms
  - Background: brand gradient or illustration

**Step 1.2 — Auth check runs silently in background (500–1000ms)**
- **System Response:** Skeleton loader or subtle progress animation at bottom of screen (do NOT show a percentage — use an indeterminate loader)
  - Pulse animation on logo while waiting

**Step 1.3a — Auth check returns: User IS logged in**
- **System Response:** Transition to Home Dashboard
  - Screen slides upward out of view / fade-out, 300ms

**Step 1.3b — Auth check returns: User is NOT logged in**
- **System Response:** Transition to Login/Registration screen
  - Screen fades to Login screen, 300ms

---

### Screen 1.1 — Home Dashboard

**Step 1.4 — Home Dashboard renders**
- **System Response:** Dashboard loads with:
  - Welcome header: "Hello, [First Name]! 👋"
  - Daily streak counter widget (top right or banner) — e.g., "🔥 7-Day Streak!"
  - Prominent **"Start Quiz"** CTA button (primary, brand color, large tap target minimum 48x48dp)
  - Recent Activity / Last Quiz Summary card (if returning user)
  - Quick Stats row: Total Quizzes Taken / Accuracy % / Best Streak
  - Navigation bar at bottom: Home | Explore | Leaderboard | Profile
  - Micro-animation: Cards stagger-fade in from bottom, 50ms delay between each card

**Step 1.5 — User taps "Start Quiz" button**
- **User Action:** Tap on "Start Quiz" CTA
- **System Response:**
  - Button scales down slightly (0.97) on press for 150ms — tactile press feedback
  - Button scales back to 1.0 on release
  - Screen transitions to Quiz Mode Selection screen
  - Transition: slide-in from right, 300ms ease-out

---

### Screen 1.2 — Quiz Mode Selection

**Step 1.6 — Quiz Mode screen renders**
- **System Response:** Screen displays available quiz modes as selectable cards or large tappable tiles
  - Page header: "Choose Your Mode"
  - Back arrow (top-left) to return to Dashboard
  - Mode cards (examples):
    - 🎯 **Practice Mode** — "Learn at your own pace. No timer. Immediate feedback."
    - ⚡ **Timed Mode** — "Race against the clock. Answer fast!"
    - 📚 **Study Mode** — "Flashcard-style with spaced repetition."
    - 🏆 **Challenge Mode** — "Compete on the leaderboard."
    - 🔁 **Review Mode** — "Retry questions you got wrong."
  - Each card shows: icon, title, short description, difficulty indicator (dots or stars)
  - All cards visible without scrolling on typical mobile screen (max 4–5 modes)

**Step 1.7 — User taps a quiz mode card (e.g., "Practice Mode")**
- **User Action:** Tap on desired mode card
- **System Response:**
  - Selected card animates: border highlights in brand color, background tints, scale 1.0 → 1.02 → 1.0, duration 200ms
  - Unselected cards dim slightly (opacity 0.7) to reinforce focus on selection
  - A confirmation "checkmark" icon appears on the selected card corner (200ms fade-in)
  - After 300ms hold or on a "Continue" button tap: transition to Category Selection

**Step 1.8 — User taps "Continue" / "Next" button**
- **User Action:** Tap "Continue" (or interaction auto-advances after card selection)
- **System Response:**
  - Button activates (previously grayed-out if no mode selected)
  - Transition to Category Selection screen, slide from right, 300ms

---

### Screen 1.3 — Category / Subject Selection

**Step 1.9 — Category Selection screen renders**
- **System Response:**
  - Header: "What do you want to study?"
  - Back arrow (returns to Mode Selection)
  - Category grid (2-column or 3-column grid of cards) or scrollable list
  - Each category card shows: emoji icon, subject name, number of available questions, user's mastery percentage (if returning user)
  - "All Categories" or "Mixed" option is first card (highlighted/featured)
  - Categories sorted by: user's recent activity first, then alphabetical
  - Search bar at top to filter categories (for platforms with many subjects)
  - Lazy loading: skeleton placeholder cards while categories load

**Step 1.10 — User taps to select one or multiple categories**
- **User Action:** Tap on category card(s)
- **System Response (Single-select mode):**
  - Card border changes to brand color, card fills lightly, checkmark appears (150ms)
  - No other categories can be selected; previous selection deselects with reverse animation
- **System Response (Multi-select mode):**
  - Each tapped card gets a checkmark badge on its corner
  - A bottom banner fades up showing: "3 Categories Selected — Continue →"
  - Banner CTA button is disabled until at least 1 category is selected

**Step 1.11 — User taps "Continue" button**
- **User Action:** Tap "Continue" on bottom banner or navigation
- **System Response:** Transition to Quiz Configuration screen, slide from right, 300ms

---

### Screen 1.4 — Quiz Configuration

**Step 1.12 — Configuration screen renders**
- **System Response:**
  - Header: "Customize Your Quiz"
  - Back arrow (returns to Category Selection)
  - Configuration options presented as a vertical list of setting rows:

    **Row A — Number of Questions:**
    - Label: "How many questions?"
    - Segmented control or stepper: [5] [10] [15] [20] [Custom]
    - Default pre-selected: 10
    - If "Custom" is selected: a number input field slides open below (progressive disclosure, 250ms expand animation), min 1 / max 50

    **Row B — Difficulty Level:**
    - Label: "Difficulty"
    - Toggle chips / pills: [Easy] [Medium] [Hard] [Adaptive 🤖]
    - Default: Adaptive (recommended tag shown)
    - Each chip tappable; selected chip fills with brand color

    **Row C — Timer Per Question:**
    - Label: "Timer"
    - Toggle: ON / OFF switch
    - If ON → Sub-row expands (300ms) showing slider: 10s — 30s — 60s — 90s
    - Default: 30 seconds
    - Live preview label updates: "You'll have **30 seconds** per question"

    **Row D — Show Feedback After Each Answer:**
    - Label: "Show Feedback"
    - Toggle: ON / OFF
    - Default: ON
    - Helper text: "See if you're right immediately after each answer"

    **Row E — Shuffle Questions:**
    - Label: "Shuffle Questions"
    - Toggle: ON / OFF
    - Default: ON

**Step 1.13 — User adjusts settings**
- **User Action:** Taps/toggles any setting
- **System Response:**
  - Each interaction triggers immediate visual update (toggle flips, chip fills, slider moves)
  - No "save" required — state is live
  - A summary preview card at the bottom of screen updates in real time:
    - "📝 10 questions · ⏱️ 30s each · 🎯 Adaptive · 🔀 Shuffled"

**Step 1.14 — User taps "Start Quiz" button**
- **User Action:** Tap large primary CTA "Start Quiz" at bottom
- **System Response:**
  - Button press animation: scale down 0.97, 150ms, release back to 1.0
  - Screen transitions to Pre-Quiz Briefing screen (slide from right, 300ms)
  - Quiz configuration is saved to session state

---

### Screen 1.5 — Pre-Quiz Briefing Screen

**Step 1.15 — Briefing screen renders**
- **System Response:**
  - Header: "Ready to Begin?"
  - Summary card showing confirmed quiz parameters:
    - Category name(s) + icon
    - Number of questions
    - Timer per question (or "No Timer")
    - Mode (Practice / Timed / etc.)
    - Difficulty level
  - Motivational subtitle: "You got this! Let's go 🚀"
  - Two buttons:
    - **"Start Quiz"** (Primary, large, brand color)
    - **"Edit Settings"** (Secondary, text button, goes back to Configuration)

**Step 1.16 — User taps "Start Quiz"**
- **User Action:** Final confirmation tap to begin
- **System Response:**
  - Button scales down 0.97 on press, returns on release
  - Transition to Loading / Question Preparation screen
  - Navigation bar hides (quiz is immersive, no bottom nav during active quiz)
  - Status bar retained or hidden depending on platform convention

---

### Screen 1.6 — Quiz Loading Screen

**Step 1.17 — Loading screen renders**
- **System Response:**
  - Full-screen centered layout
  - Animated loader (branded, not generic spinner — e.g., a pencil drawing a line, a brain pulsing, or a custom progress ring)
  - Text below loader: "Loading your questions…"
  - Background: soft brand color or illustrated pattern
  - System silently performs:
    - Fetches question set from database/API based on config
    - If Adaptive mode: fetches user's performance history to select starting difficulty
    - Shuffles questions if enabled
    - Pre-caches all question assets (images, audio if any)
  - Loading completes in < 2 seconds (target); if exceeds 3 seconds → show "Almost ready…" text swap

**Step 1.18 — Loading completes**
- **System Response:**
  - Loader fades out (200ms)
  - First question screen slides/fades in (300ms)
  - Quiz session officially begins; timer starts if enabled

---

## 5. Phase 2: Active Quizzing Phase — Detailed User Path

> This phase loops from Step 2.1 through Step 2.20 for every question (Q1 → Q[N]).

---

### Screen 2.1 — Question Screen (First Appearance)

**Step 2.1 — Question screen renders for Question 1**
- **System Response:**
  - Top area (persistent throughout quiz):
    - **Progress Bar:** Thin horizontal bar below status bar. Starts empty, fills proportionally. Label: "Question 1 of 10". Color: brand color fill on gray track.
    - **Timer (if enabled):** Circular countdown or linear bar, top-right. Starts at configured time (e.g., 30s). Counts down in real time. Color: green (>50% time left) → yellow (25–50%) → red (<25%).
    - **Pause / Exit icon:** Three-dot menu or "X" icon, top-left or top-right (away from timer).
    - **XP / Score counter** (optional, gamification): running total top-right.
  - Question Container (center, large):
    - **Question number badge:** "Q1" in small pill/chip
    - **Question text:** Largest text element on screen. 18–24px (mobile), 22–28px (desktop). Left-aligned or centered.
    - **Question media (if applicable):** Image, audio player, or diagram rendered below question text. Lazy-loaded.
  - Answer Options Area (lower section):
    - 4 answer option buttons (A, B, C, D) stacked vertically
    - Each button: full-width, generous padding (min 48dp height), option letter badge on left, option text on right
    - All in **Default State** (neutral, no selection indicated)
  - **No "Submit" button visible yet** — submission is triggered by answer selection (or separate submit button in exam-mode variants)
  - Entrance animation: question card slides in from right / fades in, stagger delay for answer options (50ms between each), total entrance ≤ 400ms

**Step 2.2 — Timer begins counting down (if timer enabled)**
- **System Response:**
  - Countdown begins immediately as question renders
  - Timer ring/bar depletes smoothly (CSS/native animation, not jumpy steps)
  - Timer numerical display updates every 1 second (integer, no decimals)

---

### Screen 2.2 — User Interacts with an Answer Option

**Step 2.3 — User hovers over an answer option (web only)**
- **User Action:** Mouse pointer moves over an answer button
- **System Response:**
  - Option transitions to **Hover State**: border lightens to brand color, background tints slightly
  - Cursor changes to pointer
  - Duration of hover state animation: 150ms ease-in

**Step 2.4 — User taps / clicks an answer option**
- **User Action:** Tap or click on a specific answer option (e.g., "Option B")
- **System Response:**
  - **Immediate (0–50ms):** Option transitions to **Selected (Pending) State**:
    - Background fills with brand/primary color
    - Text turns white
    - Option letter badge fills inversely (white bg, brand text)
    - Scale animation: 1.0 → 1.02 → 1.0 over 200ms (tactile feel)
  - **All other options dim** (opacity 0.6) to visually isolate the selection
  - **Timer pauses** (if enabled) — gives user 1–2s to confirm before auto-submitting, OR:
  - **If auto-submit mode:** system auto-submits immediately (Step 2.5 begins)
  - **If manual submit mode:** a "Submit Answer" button fades in at the bottom (200ms) — user must confirm explicitly

**Step 2.5 — Answer is submitted (auto or manual)**
- **User Action:** Answer submission triggered (auto-submit OR user taps "Submit Answer")
- **System Response (immediate, 0–100ms):**
  - All answer options lock (pointer-events: none; disabled state for non-selected options)
  - Timer freezes and hides (if enabled) OR shows "Time Up!" label
  - Loading micro-indicator on selected option (tiny spinner or pulse) for 200–400ms while system evaluates

---

### Screen 2.3 — Feedback State: Correct Answer

**Step 2.6a — System evaluates: User's answer is CORRECT**
- **System Response (within 400ms of submission):**

  **Answer Option Visual Update:**
  - Selected option transitions to **Correct State**:
    - Background: success green (#22C55E or similar)
    - Animated checkmark icon appears inside or next to option label (SVG draw animation, 300ms)
    - Option does a subtle scale-up pulse: 1.0 → 1.04 → 1.0 over 500ms
    - Green glow/shadow radiates from option: 0 → 8px blur over 300ms

  **Feedback Banner / Card (appears below answer options, slides up 300ms):**
  - Green header band: "✅ Correct!"
  - Explanation text: "Great job! [Brief explanation of why the answer is correct, 1–3 sentences max]"
  - "Learn More" expandable section (collapsed by default — progressive disclosure):
    - Tap to expand: reveals deeper explanation, related concept, or reference link (expand animation 300ms)
  - XP earned indicator: "+10 XP" (or configured value) animates in with upward float and fade: 0% opacity → 100% over 400ms, Y-position -20px upward float

  **Global State Updates:**
  - Progress bar increments by 1 step (fill animation, 300ms)
  - Score counter increments (number flip animation or roll-up, 300ms)
  - Streak indicator increments (if consecutive correct answers tracked)

  **Haptic Feedback (mobile):**
  - Light success haptic pulse (single light tap pattern)

  **Sound (if enabled):**
  - Short pleasant success chime (< 500ms audio clip)

  **Auto-advance timer begins:** System shows "Next question in [3]… [2]… [1]…" countdown OR a "Next →" button appears

---

### Screen 2.4 — Feedback State: Wrong Answer

**Step 2.6b — System evaluates: User's answer is INCORRECT**
- **System Response (within 400ms of submission):**

  **Answer Option Visual Update:**
  - User's selected option transitions to **Incorrect State**:
    - Background: error red (#EF4444 or similar)
    - Animated X icon appears (300ms SVG draw or crossfade)
    - Horizontal shake animation: option moves ±6px left-right, 3 cycles over 400ms
    - Red glow radiates briefly: 300ms
  - The **correct answer option** simultaneously reveals **Correct Revealed State**:
    - Background: success green, outlined
    - Checkmark icon appears
    - Label: "✓ Correct Answer" badge/chip above option
    - Smooth transition: 300ms fade-in to green state

  **Feedback Banner / Card (slides up 300ms):**
  - Red/amber header band: "❌ Not Quite!"
  - Shows user's answer: "You answered: [User's Option]"
  - Shows correct answer: "The correct answer is: [Correct Option]"
  - Explanation text: "[Why this is the correct answer, 1–3 sentences]"
  - "Learn More" expandable section (collapsed by default)
  - Encouragement line: "Keep going! You're learning." (positive framing)

  **Global State Updates:**
  - Progress bar increments by 1 step (still progresses — completion, not score)
  - Score counter does NOT increment (or decrements in penalty mode if configured)
  - Wrong answer is flagged internally for Spaced Repetition scheduling and Review Mode

  **Haptic Feedback (mobile):**
  - Error haptic: double-tap pattern (slightly heavier than correct)

  **Sound (if enabled):**
  - Short neutral "miss" sound (not harsh or discouraging)

  **Auto-advance timer begins:** "Next question in 3… 2… 1…" OR "Next →" button appears

---

### Screen 2.5 — Transition to Next Question

**Step 2.7 — Auto-advance countdown completes OR user taps "Next →"**
- **User Action:** Either waits for auto-advance (3s default) or taps "Next" manually
- **System Response:**
  - "Next" button press: scale down 0.97 on tap, release back
  - Feedback card slides down out of view (300ms)
  - Current question card slides out to the left (300ms)
  - New question card slides in from the right (300ms)
  - Both animations play simultaneously for a clean "page-flip" feel
  - Progress bar has already updated; animation complete before new question shows
  - If adaptive mode: system silently re-evaluates difficulty tier for next question based on current performance

**Step 2.8 — Question 2 renders (repeat of Steps 2.1–2.7)**
- All steps from 2.1 through 2.7 repeat for each question
- Question number label updates: "Q2", "Q3", etc.
- Progress bar fills one more step with each question
- Timer resets to configured duration for each new question

---

### Screen 2.6 — Mid-Quiz Special States

#### Halfway Milestone

**Step 2.9 — User completes 50% of questions (e.g., Q5 of 10)**
- **System Response:** Brief milestone moment shown before or after feedback of the midpoint question:
  - Overlay or inline banner: "Halfway there! 🎉 5 questions down, 5 to go!"
  - Mini-animation: progress bar pulses or glows briefly (500ms)
  - Current score preview: "You're at [X] correct so far!"
  - Auto-dismisses after 2 seconds or on tap
  - Transitions normally to next question

#### Streak Achievement

**Step 2.10 — User answers 3 or more consecutive questions correctly ("Streak")**
- **System Response (shown after the 3rd consecutive correct):**
  - Streak badge slides in from top or overlays corner: "🔥 3-Streak!"
  - Animation: badge bounces in (scale 0 → 1.1 → 1.0 over 400ms)
  - Streak indicator in top bar increments with flame icon
  - Sound (if enabled): brief ascending chime
  - Auto-dismisses after 1.5 seconds

#### Streak Break

**Step 2.11 — User answers wrong after a streak**
- **System Response:**
  - Streak badge quietly fades out (200ms, no dramatic animation — avoid discouragement)
  - Streak counter resets to 0
  - No negative sound or punishment animation

---

### Screen 2.7 — Last Question of the Quiz

**Step 2.12 — User reaches the final question (Q[N])**
- **System Response:**
  - Progress bar shows 9/10 filled (one step remaining)
  - Question number badge: "Last Question! 🏁" or "Q10" with a subtle finish flag icon
  - Quiz flow identical to all prior questions
  - After answer submission and feedback display: auto-advance text changes to "See Your Results →" instead of "Next →"

**Step 2.13 — User taps "See Your Results"**
- **User Action:** Taps the final CTA
- **System Response:**
  - Navigation transitions to Results Loading screen
  - Progress bar fills completely (100%) with an animated fill sweep (300ms)
  - Confetti or celebration animation briefly fires if score was high (> 80%): 800ms burst

---

### Screen 2.8 — Results Calculation Loading Screen

**Step 2.14 — Results loading screen renders**
- **System Response:**
  - Full-screen celebration or neutral loading state
  - Animated icon: trophy spinning, stars bursting, or quiz paper being stamped
  - Text: "Calculating your results…" → "Almost done!" (text swaps after 1.5s)
  - Background: brand gradient or celebratory illustration
  - System performs:
    - Tallies score, accuracy percentage, time spent
    - Categorizes answers (correct / incorrect / skipped)
    - Generates topic-level performance breakdown
    - Updates user's stats in database
    - Schedules spaced repetition items (incorrect answers added to future review queue)
    - Updates leaderboard if applicable
  - Target: < 1.5 seconds. If exceeds 2 seconds → show progress animation with % fill.

---

## 6. Phase 3: Review & Results Phase — Detailed User Path

### Screen 3.1 — Score Summary Screen

**Step 3.1 — Score Summary screen renders**
- **System Response:**
  - Grand entrance animation: score card drops in from above OR scales from 0.8 → 1.0, 500ms ease-out
  - Screen layout (top to bottom):

    **1. Score Display (Hero Section):**
    - Large circular score ring / gauge: fills from 0% to final score % (animated fill, 800ms, easing ease-out)
    - Numerical score inside ring: number counts up from 0 to final score (e.g., "0%… 50%… 78%"), 800ms total
    - Result label below ring:
      - 90–100%: "🏆 Perfect Score!" (gold color)
      - 75–89%: "⭐ Great Job!" (brand color)
      - 50–74%: "👍 Good Effort!" (neutral positive)
      - < 50%: "💡 Keep Practicing!" (encouraging, no negative framing)
    - Confetti animation fires for scores ≥ 90% (particle burst, 1200ms, does not interfere with text readability)

    **2. Quick Stats Row:**
    - 3 stat tiles in a horizontal row:
      - ✅ Correct: [X] / [N]
      - ❌ Wrong: [Y] / [N]
      - ⏱️ Avg. Time: [Z]s per question
    - Each tile fades in with stagger (100ms delay between tiles)

    **3. XP Earned / Streak Update Banner:**
    - "+[X] XP Earned" with an upward float animation
    - If streak milestone reached: badge shown ("🔥 New 5-Day Streak!")
    - Streak maintained / broken status shown

    **4. Action Buttons (bottom section):**
    - **"Review Answers" (Primary CTA):** Review all questions with correct/wrong breakdown
    - **"Try Again" (Secondary):** Restart same quiz with same config
    - **"New Quiz" (Secondary):** Return to Mode/Category selection
    - **"Share Score" (Tertiary / Ghost):** Share result image to social / friends
    - **"View Leaderboard" (Tertiary):** If in Challenge Mode

---

### Screen 3.2 — Performance Breakdown Screen

**Step 3.2 — User taps "Review Answers"**
- **User Action:** Tap "Review Answers" button
- **System Response:** Transition to Performance Breakdown screen (slide from right, 300ms)

**Step 3.3 — Performance Breakdown screen renders**
- **System Response:**
  - Header: "Your Results"
  - **Tab bar:** [All] [Correct ✅] [Wrong ❌] [Skipped ⏭️]
    - Default active tab: "All"
    - Tab underline indicator slides between tabs on tap (200ms)
  - **Topic/Category Performance Cards** (if multi-category quiz):
    - One card per category/topic
    - Shows: category name, score for that topic (e.g., "Math: 4/5"), mini progress bar
    - Mastery level badge (if applicable): Beginner / Intermediate / Advanced
  - **Questions List (scrollable):**
    - Each question rendered as a collapsed card
    - Default collapsed state shows:
      - Q number + truncated question text
      - Result icon: ✅ or ❌ or ⏭️
      - Time taken: "Answered in 12s"
    - Tap to expand card (accordion, 300ms expand animation):
      - Full question text
      - User's answer (highlighted: green if correct, red if wrong)
      - Correct answer (highlighted green)
      - Explanation paragraph
      - "Save as Flashcard" button (bookmarks for later study)
      - "Report Issue" text link (for content errors)

**Step 3.4 — User taps a question card to expand**
- **User Action:** Tap on a collapsed question card
- **System Response:**
  - Card expands smoothly (accordion animation, 300ms ease-out)
  - Other cards remain in their current state
  - Expanded card shows full detail (see above)
  - Scroll position adjusts to keep expanded card visible if needed

**Step 3.5 — User taps on a tab to filter**
- **User Action:** Taps [Correct], [Wrong], or [Skipped] tab
- **System Response:**
  - Tab indicator slides to new position (200ms)
  - List filters with a subtle fade-out / fade-in of list items (150ms)
  - Empty state message if no items in filtered category:
    - e.g., "No skipped questions!" with a relevant illustration

**Step 3.6 — User taps "Save as Flashcard" within an expanded card**
- **User Action:** Taps bookmark/flashcard save button
- **System Response:**
  - Icon animates: outline → filled, with a brief scale pulse (1.0 → 1.2 → 1.0, 300ms)
  - Inline toast notification slides in from bottom: "Saved to Flashcards!" (auto-dismisses 2.5s)
  - Toast has an "Undo" action button on right side (remains for 2.5s)

---

### Screen 3.3 — Recommendations & Next Steps Screen

**Step 3.7 — After reviewing answers, user scrolls past the question list OR taps a "What's Next?" section**
- **System Response:** "What's Next?" section appears at bottom of breakdown screen OR as a separate card:
  - **Weak Areas Identified:** "You struggled with: [Topic A], [Topic B]"
    - "Practice These Now →" button (deep-links into targeted quiz for weak topics)
  - **Spaced Repetition Queue Notice:** "📅 5 questions have been scheduled for review in 3 days"
    - "Set Reminder" toggle or button
  - **Suggested Next Quiz card:**
    - Recommended based on performance: if high score → harder version; if low score → same level
    - Shows: category, estimated time, difficulty badge
    - "Start Recommended Quiz" CTA button
  - **Streak / Daily Goal Progress:**
    - Daily goal widget: "Daily Goal: 2/3 quizzes completed. 1 more to go! 🎯"

---

## 7. Auxiliary Flows

### 7A. Exit / Pause Flow

> Triggered any time during Phase 2 (Active Quizzing) when the user taps the Exit/Menu icon.

**Step A.1 — User taps the exit/pause icon (top corner)**
- **User Action:** Tap "X", "⏸", or "⋮" icon during active quiz
- **System Response:**
  - Quiz timer **immediately pauses** (if enabled)
  - All answer option interactions **lock** (prevent accidental input)
  - Confirmation Modal slides up from bottom (or fades in as overlay):
    - Overlay backdrop: semi-transparent dark background, 200ms fade-in
    - Modal card slides in from bottom (300ms ease-out):
      - **Title:** "Pause / Exit Quiz"
      - **Body text:** "Your progress will be lost if you exit now. Would you like to save and resume later?"
      - **Three options:**
        1. **"Resume Quiz"** (Primary) — dismiss modal, resume timer, unlock answers
        2. **"Save & Exit"** (Secondary) — save progress, exit to dashboard (if Save & Resume feature enabled)
        3. **"Exit Without Saving"** (Destructive, red text) — confirm exit, lose progress

**Step A.2a — User taps "Resume Quiz"**
- **User Action:** Tap "Resume Quiz"
- **System Response:**
  - Modal slides back down (300ms)
  - Overlay fades out (200ms)
  - Timer resumes countdown from where it paused
  - Answer options unlock (pointer-events restored)
  - No state change; quiz continues seamlessly

**Step A.2b — User taps "Exit Without Saving"**
- **User Action:** Tap "Exit Without Saving"
- **System Response:**
  - Modal closes (300ms)
  - Brief secondary confirm (inline, not another modal): "Are you sure? This quiz will not be counted." — [Yes, Exit] [Cancel]
  - On confirmation: screen transitions to Home Dashboard (fade out/in, 400ms)
  - Current quiz session data is discarded
  - No XP, no score update, no stats recording
  - Optional toast on Dashboard: "Quiz exited. No progress was saved."

**Step A.2c — User taps "Save & Exit"**
- **User Action:** Tap "Save & Exit"
- **System Response:**
  - Modal closes
  - System saves current question index, selected answers so far, elapsed time to user's session storage / backend
  - Loading indicator (brief, 500ms) while saving
  - Success toast: "Progress saved! Resume anytime."
  - Transition to Home Dashboard
  - Dashboard shows a "Resume Quiz" banner card at top: "You have an unfinished quiz — [Category]. Resume →"

---

### 7B. Save & Resume Flow

**Step B.1 — User returns to app after saving mid-quiz**
- **User Action:** User opens app again after saving
- **System Response:**
  - After auth check, Home Dashboard loads
  - **Persistent banner at top** (or modal prompt): "📖 Continue where you left off? [Category] · Q[N] of [Total]"
  - Two buttons: **"Resume Quiz"** (primary) | **"Dismiss"** (secondary)

**Step B.2 — User taps "Resume Quiz"**
- **User Action:** Tap "Resume Quiz"
- **System Response:**
  - Short loading state (500ms) while session is restored from storage
  - Quiz Loading Screen appears briefly (standard loading animation)
  - Question screen renders at the exact question where user left off
  - Progress bar reflects completed questions
  - Timer (if applicable) resets to full time for this question (does not resume mid-countdown from before)
  - A brief overlay message: "Welcome back! Continuing from Q[N]." — auto-dismisses 2s

---

### 7C. Timer Warning & Expiry Flow

**Step C.1 — Timer reaches 25% remaining**
- **System Response:**
  - Timer color changes from green/neutral to **yellow/amber** (200ms color transition)
  - If ring timer: ring pulses once with scale 1.0 → 1.05 → 1.0 (300ms)
  - Haptic (mobile): single light warning tap

**Step C.2 — Timer reaches 10% remaining (e.g., 3 seconds of 30s)**
- **System Response:**
  - Timer color changes to **red** (200ms)
  - Timer begins subtle pulse animation: scale 1.0 → 1.1 → 1.0 every 1 second
  - Sound (if enabled): soft ticking sound starts

**Step C.3 — Timer reaches 0**
- **System Response:**
  - Timer animation freezes on "0"
  - Timer displays: "⏰ Time's Up!"
  - Answer options lock immediately
  - If no answer was selected: question is marked as **"Skipped"**
  - If an answer was pre-selected (highlighted) but not submitted: behavior depends on config:
    - **Auto-submit on expire:** pre-selected answer is submitted and evaluated (proceeds to Step 2.6a or 2.6b)
    - **Skip on expire:** no answer counted, skip to feedback showing correct answer only
  - Feedback banner shows:
    - If skipped: "⏰ Time's Up! The correct answer was [Option]."
    - If auto-submitted: normal correct/incorrect feedback
  - Auto-advance after 2.5 seconds (shorter than normal, time already consumed)

---

### 7D. Adaptive Difficulty Adjustment Flow

> This flow is **silent and invisible to the user** — it runs in the background of the quizzing phase.

**Step D.1 — After each answer submission:**
- **System Action (background):**
  - Logs: question ID, user's answer, correctness, time taken, difficulty tag
  - Updates running performance metrics:
    - Topic accuracy (rolling %)
    - Response time (rolling average)
    - Consecutive correct/incorrect count

**Step D.2 — System evaluates next question difficulty:**
- **Algorithm Logic:**
  - If last 2 answers correct → increase difficulty by 1 tier for next question
  - If last 2 answers wrong → decrease difficulty by 1 tier for next question
  - Target: keep user in 65–75% success rate zone (Zone of Proximal Development)
  - If no harder questions available in bank → maintain current difficulty
  - If no easier questions available → maintain current difficulty

**Step D.3 — Next question is fetched and served:**
- **System Action:** Pulls next question from bank matching new difficulty tier
- **User sees:** Next question loads normally — no indication of difficulty tier change (avoids anxiety)
- **Optional visible affordance:** Small difficulty indicator badge on question (e.g., "🔥 Hard" or "⭐ Medium") — this is a UX decision; can be shown or hidden based on product direction

---

## 8. Micro-Interaction & Animation Specification

### 8.1 Button Interactions

| State | Visual | Timing |
|---|---|---|
| Default | Flat, brand color background, white text | — |
| Hover (web) | Slight lightening +10% brightness, cursor: pointer | 150ms ease |
| Active / Pressed | Scale 0.97, slight shadow reduction | 150ms ease |
| Released | Scale returns 1.0 | 150ms ease |
| Disabled | 40% opacity, cursor: not-allowed | Instant |
| Loading | Spinner replaces label text, button width locked | Continuous |
| Success | Brief green tint, checkmark icon | 300ms fade |

### 8.2 Answer Option Animations

| Trigger | Animation | Duration |
|---|---|---|
| Hover (web) | Border brand color, bg tint #F0F4FF | 150ms ease |
| Tap / Click | Scale 1.02, bg brand color, text white | 200ms |
| Correct reveal | Scale 1.04 pulse, green bg, checkmark SVG draw | 500ms |
| Wrong reveal | Shake ±6px × 3 cycles, red bg, X icon | 400ms |
| Other options dim | Opacity 1.0 → 0.5 | 200ms |
| Disabled state | Opacity 0.4, pointer-events: none | 200ms |

### 8.3 Screen Transitions

| Transition | Type | Duration |
|---|---|---|
| Onward navigation (next screen) | Slide from right | 300ms ease-out |
| Back navigation | Slide to right | 250ms ease-in |
| Modals / Bottom sheets | Slide up from bottom | 300ms ease-out |
| Modal dismiss | Slide down | 250ms ease-in |
| Overlay backdrop in | Fade opacity 0→0.5 | 200ms |
| Overlay backdrop out | Fade opacity 0.5→0 | 200ms |
| Toast notifications | Slide in from bottom, auto-dismiss | In: 250ms / Out: 200ms |
| Loading to content | Fade in | 300ms |

### 8.4 Progress Bar

| Trigger | Animation |
|---|---|
| Quiz starts | Bar at 0%, color: brand |
| Each question answered | Fill one increment (300ms ease-out fill sweep) |
| Halfway milestone | Bar pulses/glows briefly (500ms) |
| Quiz complete | Fill to 100% with fast sweep (300ms), color to gold |

### 8.5 Celebratory / Reward Animations

| Trigger | Animation | Duration |
|---|---|---|
| Score ≥ 90% | Confetti particle burst from top | 1200ms |
| New streak badge | Badge bounces in: scale 0→1.1→1.0 | 400ms |
| XP earned | Number floats up and fades: Y -20px, opacity 0→1→0 | 600ms |
| Score ring fill | Arc fill from 0→final %, ease-out | 800ms |
| Achievement unlocked | Badge slides in from right, shimmers | 500ms |

---

## 9. UI Component State Matrix

### Answer Option Button

```
[Default]          →  [Hover]          →  [Selected/Pending]
     │                                           │
     │                                    User submits answer
     │                                           │
     ├── [Correct]    Background: #22C55E, Checkmark icon, Scale pulse
     │
     └── [Incorrect]  Background: #EF4444, X icon, Shake animation
                           +
                      [Correct Revealed]  Other option → #22C55E, green outline
```

### Progress Bar Component

```
States: [Empty] → [Partial Fill] → [Halfway Glow] → [Full — Celebration]
Aria: aria-valuenow="[current]" aria-valuemax="[total]" role="progressbar"
```

### Timer Component (Circular Ring)

```
States: [Full / Green] → [~50% / Neutral] → [25% / Yellow Warning] → [10% / Red Pulsing] → [0 / Frozen "Time's Up"]
```

### Modal / Bottom Sheet

```
States: [Hidden] → [Backdrop Fade In] → [Sheet Slides Up] → [Active] → [Sheet Slides Down + Backdrop Fade Out]
```

---

## 10. Accessibility & Cognitive Load Checklist

### Accessibility (WCAG 2.1 AA)

- [ ] All text meets 4.5:1 contrast ratio minimum (answer options, question text, labels)
- [ ] Correct/wrong states do NOT rely on color alone — always include icon (checkmark/X) AND text label
- [ ] All interactive elements have minimum 48×48dp tap target size
- [ ] Timer has both visual and text representation ("30s" label alongside the ring)
- [ ] Screen reader labels on all interactive elements (aria-label, role, aria-checked for toggles)
- [ ] Progress bar has aria-valuenow and aria-valuemax attributes
- [ ] Animations respect `prefers-reduced-motion` media query — all animations become instant transitions if enabled
- [ ] Keyboard navigation supported: Tab key moves between answer options, Enter/Space selects
- [ ] Focus indicator visible (outline or ring) on all focusable elements

### Cognitive Load Reduction

- [ ] Maximum 4 answer choices per question (no more than 6 in extreme cases)
- [ ] Question text never exceeds 2–3 lines on mobile without scrolling
- [ ] Only ONE primary action is available at any given moment during quizzing
- [ ] Feedback explanations are collapsed by default (tap to expand — progressive disclosure)
- [ ] No navigation bar shown during active quiz (reduces distraction)
- [ ] Background of question screen is clean (no competing images/patterns behind text)
- [ ] Font size minimum 16px for body text, 20px+ for question text
- [ ] Single-question-per-screen layout (never show multiple questions simultaneously)
- [ ] Loading states are always communicated (never blank screens)
- [ ] Auto-advance delay of minimum 2–3 seconds after feedback (user needs time to process)

### Learning Effectiveness Checklist

- [ ] Immediate feedback is shown after every single answer (within 400ms of submission)
- [ ] Both correct AND incorrect answers are explained in feedback (not just "wrong")
- [ ] Incorrect answers are saved and scheduled for future spaced repetition review
- [ ] Progress bar provides continuous sense of progress (motivation to complete)
- [ ] Streak/XP gamification provides micro-reward on each correct answer
- [ ] Review Mode allows users to retry only their incorrect answers
- [ ] Weak area identification shown on results screen with actionable next steps
- [ ] Mastery progression is visible (user can see improvement over time)
- [ ] Low-stakes framing used throughout (encouraging language, no punishment mechanics)

---

*End of Blueprint — Version 1.0*
*Generated for: Slatecamp Interactive Quiz Platform*
*Domain: UX/UI Design + Instructional Design | Interactive E-Learning*
