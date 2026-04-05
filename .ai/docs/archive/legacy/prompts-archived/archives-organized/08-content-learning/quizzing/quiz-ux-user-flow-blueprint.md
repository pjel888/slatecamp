# Interactive Quiz UX/UI & Learning Methodology Blueprint
### A Developer-Ready, Step-by-Step User Path Documentation

---

## Research Methodology Summary

This document synthesizes evidence from cognitive science, instructional design, and applied UX research to produce a complete, engineer-ready blueprint for interactive quiz applications. The core methodologies grounding every design decision are:

- **The Testing Effect / Retrieval Practice** — Active recall via quizzes produces stronger long-term memory encoding than passive re-reading.
- **Spaced Repetition** — Distributing quiz attempts over time increases retention by forcing the brain to retrieve fading memories.
- **Immediate Feedback Loops** — Correcting misconceptions at the moment of error prevents false knowledge from solidifying.
- **Progressive Disclosure** — Revealing complexity gradually (setup → active quiz → review) reduces cognitive overload and keeps learners in a state of flow.
- **Gamification & Motivation Architecture** — Points, streaks, badges, and progress bars provide both intrinsic and extrinsic motivation, sustaining engagement across sessions.
- **Cognitive Load Management (CLT)** — Three load types are managed through UI: Intrinsic (task difficulty), Extraneous (interface noise), and Germane (schema formation). Good quiz UX minimizes extraneous load so mental energy goes to learning.
- **Flow State Design** — Challenge must match skill level. Too easy = boredom. Too hard = anxiety. Adaptive difficulty and optional timer pressure are tools to maintain flow.

---

## Macro-Level User Flow Overview

```
PHASE 1: DISCOVERY & SETUP
└── Entry Point → Subject/Topic Selection → Quiz Mode Selection → Configuration → Pre-Quiz Briefing

PHASE 2: ACTIVE QUIZZING
└── Loading → Question Display → User Answer Interaction → Per-Question Feedback → Progression

PHASE 3: REVIEW & RESULTS
└── End-of-Quiz Animation → Score Summary → Per-Answer Breakdown → Insights → Post-Quiz Actions

PHASE 4: POST-SESSION (META)
└── Streak/Badge Notification → Spaced Repetition Scheduling → Return Prompt
```

---

---

# PHASE 1: DISCOVERY & SETUP

## 1.1 — Entry Point / Home Screen

**Step 1**
- **User Action:** User opens the application (web or mobile).
- **System Response:** App loads home dashboard. A loading splash screen appears for 800ms–1.2s maximum displaying the app logo with a subtle fade-in animation. Skeleton loaders appear for any dynamic content cards (e.g., "Continue where you left off," "Today's recommended quiz"). No blank white screens at any point.

**Step 2**
- **User Action:** User lands on the Home/Dashboard screen.
- **System Response:** The screen renders with the following elements visible simultaneously:
  - Top navigation bar (Profile avatar, Streak counter with flame icon, XP/Points total)
  - A "Continue Quiz" card (if a prior session was incomplete) — highlighted with a pulsing border micro-animation
  - A "Start New Quiz" primary CTA button (prominent, center or bottom-anchored on mobile)
  - Subject/Topic category cards in a scrollable grid or horizontal scroll carousel
  - A "Daily Challenge" module (optional gamification hook)
  - Bottom navigation tabs: Home | Library | Progress | Profile (mobile)

**Step 3**
- **User Action:** User taps/clicks **"Start New Quiz"** or selects a Subject/Topic card.
- **System Response:**
  - If "Start New Quiz" was clicked: A modal tray or new screen slides up/in (300ms ease-out) presenting subject category selection.
  - If a specific Subject card was clicked: The app navigates directly to Quiz Mode Selection for that subject (Step 1.3), skipping general subject selection.
  - Haptic feedback fires on mobile (light tap vibration) confirming the tap registered.

---

## 1.2 — Subject & Topic Selection Screen

**Step 4**
- **User Action:** User views the Subject Selection screen.
- **System Response:** Screen displays:
  - A searchable list/grid of subject categories (e.g., Mathematics, Science, History)
  - Each subject card shows: Subject icon/thumbnail, Subject name, Number of available quizzes, User's mastery percentage (progress ring)
  - A search/filter bar at the top with a blinking text cursor to invite interaction

**Step 5**
- **User Action:** User taps/clicks on a **Subject** (e.g., "Science").
- **System Response:**
  - The subject card scales up slightly (1.0 → 1.03, 150ms) and then navigates forward.
  - A sub-topic list/accordion expands or a new screen slides in showing topics within "Science" (e.g., Biology, Chemistry, Physics).
  - Each sub-topic card shows: Topic name, Number of questions available, Last quiz score (if previously attempted), Difficulty indicator (colored dots or labels: Easy / Medium / Hard)

**Step 6**
- **User Action:** User taps/clicks on a **Topic** (e.g., "Cell Biology").
- **System Response:**
  - Topic card is highlighted with an active state (border color change + subtle background tint).
  - App transitions (slide-in animation, 250ms) to the **Quiz Mode Selection** screen.

---

## 1.3 — Quiz Mode Selection Screen

**Step 7**
- **User Action:** User views the Quiz Mode Selection screen.
- **System Response:** Screen renders with the following mode cards, each with an icon, title, and short description:
  - **Practice Mode** — "No pressure. Learn at your own pace. See explanations after each answer."
  - **Test Mode** — "Simulate a real exam. No hints, feedback shown only at the end."
  - **Timed Challenge** — "Race against the clock. Answer fast for bonus points."
  - **Adaptive Mode** — "Questions adapt to your skill level in real time."
  - **Flashcard Mode** — "Flip through questions as cards. Great for memorization."
  - **Versus / Multiplayer** (if applicable) — "Challenge a friend or random opponent."

**Step 8**
- **User Action:** User hovers over (desktop) or long-presses (mobile) a mode card.
- **System Response:**
  - A tooltip or expanded description appears explaining the mode's mechanics in 1–2 sentences.
  - On mobile: haptic feedback + a slightly expanded card state.

**Step 9**
- **User Action:** User selects a **Quiz Mode** (e.g., "Practice Mode").
- **System Response:**
  - The selected mode card receives a filled/active visual state (checkmark icon appears, border becomes accent color).
  - A "Next: Configure Quiz →" button at the bottom of the screen becomes enabled (transitions from disabled/gray to active/colored state, 200ms).

---

## 1.4 — Quiz Configuration / Setup Screen

**Step 10**
- **User Action:** User taps/clicks **"Next: Configure Quiz"**.
- **System Response:** Screen transitions (slide-in, 300ms ease) to the Configuration screen. Settings displayed:

  **Section A — Question Count**
  - A segmented control or slider: 5 / 10 / 15 / 20 / Custom
  - Default is pre-selected (e.g., 10)
  - Live counter updates below: "Estimated time: ~5 minutes" (updates dynamically as count changes)

  **Section B — Difficulty**
  - Toggle buttons: Easy / Medium / Hard / Mixed
  - If "Mixed" selected: a sub-option appears via progressive disclosure — "Weight toward: [Easier] ←—→ [Harder]" slider

  **Section C — Timer Settings** (visible only if mode supports it)
  - Toggle: "Enable Timer" (on/off switch)
  - If toggled ON: a numeric stepper or slider appears — "Seconds per question: [30]"
  - A visual preview of the timer bar style appears (horizontal countdown bar or circular arc)

  **Section D — Question Types** (optional advanced settings, collapsed by default)
  - An "Advanced Options ▼" expandable accordion
  - When expanded, reveals: Multiple Choice / True or False / Fill-in-the-Blank / Short Answer checkboxes
  - Default: all checked

  **Section E — Shuffle Options** (inside advanced accordion)
  - "Shuffle question order" toggle (default: ON)
  - "Shuffle answer choices" toggle (default: ON)

**Step 11**
- **User Action:** User adjusts question count (e.g., moves slider to 15 questions).
- **System Response:**
  - Estimated time label updates in real time: "~7 minutes" with a smooth number morph animation.
  - The slider thumb snaps to preset values with subtle haptic feedback (mobile).

**Step 12**
- **User Action:** User adjusts difficulty to "Hard".
- **System Response:**
  - The "Hard" button activates with a color change (e.g., red/warning tone).
  - A subtle inline tooltip appears below: "Only 48 questions available at this difficulty."
  - If fewer questions are available than the selected count, the question count selector auto-adjusts and shows an inline warning: "Maximum 48 questions available for Hard difficulty. Count adjusted."

**Step 13**
- **User Action:** User toggles the Timer ON and sets 20 seconds per question.
- **System Response:**
  - The timer preview animates to show how the bar will look and drain.
  - A micro-copy warning appears: "⚡ Fast mode enabled. Questions auto-submit when time runs out."

**Step 14**
- **User Action:** User is satisfied with configuration. Taps/clicks **"Start Quiz"** button.
- **System Response:**
  - Button shows a brief press/active state (scale down 0.97, 100ms, then scale back).
  - The configuration is locked. App begins loading the quiz session.

---

## 1.5 — Pre-Quiz Briefing Screen (Optional but Recommended)

**Step 15**
- **User Action:** System triggers the Pre-Quiz Briefing screen automatically.
- **System Response:** A focused, distraction-free screen appears displaying:
  - Topic name and icon
  - Summary of selected settings: "15 questions · Hard · 20s timer · Practice Mode"
  - A brief motivational line: "You've got this. Focus up!"
  - A large, prominent **"Begin Quiz ▶"** button
  - A smaller "← Adjust Settings" back link (secondary action)
  - Optionally: a "Tips for this topic" expandable accordion for first-time quiz-takers on this topic

**Step 16**
- **User Action:** User reads briefing and taps/clicks **"Begin Quiz ▶"**.
- **System Response:**
  - Button triggers a satisfying press animation.
  - A full-screen loading/transition state begins.

---

---

# PHASE 2: ACTIVE QUIZZING

## 2.1 — Loading & Transition into Quiz

**Step 17**
- **User Action:** None (system-driven transition).
- **System Response — Loading Screen:**
  - A branded loading screen appears (NOT a blank white screen).
  - A progress indicator (spinner or pulsing dots) is visible.
  - A motivational micro-copy displays: "Loading your questions…" or a fun fact related to the topic.
  - Loading should complete in under 2 seconds. If it takes longer, show a determinate progress bar.
  - Once loaded: The loading screen transitions OUT with a smooth fade or wipe animation (300ms).

**Step 18**
- **User Action:** None (system-driven).
- **System Response — Quiz Entry Animation:**
  - A brief "3… 2… 1… Go!" countdown (optional, for Timed/Challenge modes only) appears center-screen with large animated numbers scaling in and out.
  - For Practice Mode: a gentle fade-in of the first question is used instead (no countdown pressure needed).

---

## 2.2 — Question Screen (Core Loop)

**Step 19**
- **User Action:** User sees the first question appear.
- **System Response — Question Screen Layout:**
  - **Header Zone:**
    - Progress bar (top of screen): fills proportionally (e.g., "Question 1/15" = ~7% filled). Smooth left-to-right fill animation (400ms ease-in-out) on each question advance.
    - Question counter label: "Q 1 of 15"
    - Timer (if enabled): countdown bar below the progress bar OR circular countdown arc in the top-right corner. Timer begins immediately upon question render.
    - Score/XP counter (top-right or top-left): current accumulated score.
    - "Pause" icon button (three horizontal lines or ‖ symbol) — accessible at all times.
  - **Question Body Zone (Center):**
    - Question number badge (e.g., "01")
    - Question text — large, readable font, maximum line length ~55–65 characters
    - If the question has an associated image/diagram: it renders above the question text, full card width, with lazy-loading handled before the question appears.
    - If a question has audio: a play button appears, auto-plays once by default.
  - **Answer Zone (Bottom Half):**
    - 4 answer options (standard MCQ) displayed as individual tappable cards, labeled A / B / C / D.
    - Cards are evenly spaced, minimum touch target 44×44px on mobile.
    - All answer cards begin in a neutral/default state.
  - **Question Difficulty Indicator** (optional, small badge): "Medium" or a dot indicator.

**Step 20**
- **User Action:** User reads the question and thinks.
- **System Response — Timer Behavior (if enabled):**
  - The countdown bar visually drains from full to empty.
  - At 50% time remaining: no change (user not yet warned).
  - At 25% time remaining: the timer bar changes color from primary/green → amber/yellow (smooth color transition, 300ms).
  - At 10% time remaining: the timer bar changes to red AND a subtle pulsing animation begins on the bar.
  - At 0% time remaining: the question auto-submits as unanswered (treated as incorrect). The bar briefly flashes red, a soft "time's up" sound plays (if sound enabled), and the feedback state is triggered.

**Step 21**
- **User Action:** User hovers over an answer option (desktop).
- **System Response:**
  - The hovered answer card shows a subtle background color shift (surface color lifts one level) and a soft border appears.
  - No answer is committed yet. This is a pure hover/preview state.

**Step 22**
- **User Action:** User taps/clicks an **Answer Card** (e.g., selects "B").
- **System Response — Answer Selection State:**
  - The selected card immediately transitions to a "Selected" visual state:
    - Border becomes accent color (e.g., blue or primary color)
    - Background tints to a light version of accent color
    - A filled circle/radio indicator appears next to the answer label
    - Subtle scale animation: card scales from 1.0 → 1.02 → 1.0 (100ms each direction)
    - Light haptic feedback (mobile)
  - All other answer cards dim slightly (opacity ~0.7) to reduce visual noise.
  - A **"Submit Answer"** button (if explicit submission is required) becomes active/enabled, transitioning from gray to colored.
  - If the mode uses **tap-to-submit** (no explicit button): the answer is immediately locked and feedback is triggered upon tap. Skip to Step 24.

**Step 23** *(Only if explicit "Submit Answer" button exists)*
- **User Action:** User reviews selection and taps/clicks **"Submit Answer"**.
- **System Response:**
  - Submit button shows press animation (brief scale reduction).
  - The selected answer card is locked — all cards become non-interactive.
  - A micro-delay of 200–400ms before feedback renders (gives the brain a moment to process what it chose).

---

## 2.3 — Per-Question Feedback State

**Step 24**
- **User Action:** None (system-driven feedback).
- **System Response — Correct Answer:**
  - The selected answer card transitions to a **Correct State**:
    - Background fills with green (success color).
    - A checkmark (✓) icon animates in (scale from 0 → 1.2 → 1.0, 300ms).
    - Text on card becomes white/inverse.
    - A brief green ripple/glow effect emanates from the card.
  - A success micro-animation plays (optional): confetti particles, a star burst, or a "+10 XP" floating text that rises and fades out.
  - A success sound plays (soft chime, if sound enabled).
  - The XP/Score counter at the top increments with a number-count animation (e.g., 90 → 100 counts up quickly).
  - **Streak counter** (if applicable) increments: the streak number briefly scales up then returns to normal size.

- **System Response — Incorrect Answer:**
  - The selected answer card transitions to an **Incorrect State**:
    - Background fills with red/error color.
    - An X icon animates in.
    - Text becomes white/inverse.
    - A brief red shake animation plays on the card (3 oscillations left-right, 400ms total).
  - The **correct answer card** simultaneously transitions to a highlighted state:
    - Border becomes green, background tints green.
    - A "✓ Correct Answer" label appears below or overlaid on the card.
    - This happens within 200ms of the incorrect answer feedback rendering.
  - A soft error sound plays (low "buzz" or "ding", if sound enabled).
  - Score does not increment.

- **System Response — Time Expired (Unanswered):**
  - All answer cards dim.
  - The correct answer card highlights (same green highlight as incorrect answer response).
  - A "⏱ Time's Up!" label appears center-screen briefly (fades in and out, 1.5s).
  - No XP awarded.

**Step 25**
- **User Action:** None (system-driven or user-triggered).
- **System Response — Explanation Panel (Practice Mode ONLY):**
  - Below the answer cards, an explanation panel slides up or fades in (300ms):
    - "Why this is correct:" header
    - 2–4 sentences of explanatory text
    - Optional: a "Learn More" link that opens a contextual modal with deeper content
    - Optional: source reference or related topic tag
  - The panel must appear WITHOUT requiring user action (automatic in Practice Mode).
  - In **Test Mode**: NO explanation is shown. The next question proceeds immediately or after a brief pause.

**Step 26**
- **User Action:** User reads the feedback/explanation.
- **System Response:**
  - A **"Next Question →"** button appears below the explanation panel (or below the answer cards in Test Mode).
  - The button fades in (not instant — 200ms fade) so the user has a moment to absorb feedback before being prompted to move on.
  - On mobile: the "Next Question" button may auto-appear as a sticky bottom bar.

**Step 27**
- **User Action:** User taps/clicks **"Next Question →"**.
- **System Response:**
  - Current question screen transitions out (slide left, 250ms ease-in).
  - Next question screen transitions in (slide in from right, 250ms ease-out).
  - Question counter increments: "Q 2 of 15"
  - Progress bar updates smoothly (400ms fill animation).
  - Timer (if enabled) resets to full and immediately begins counting down.
  - All answer cards reset to neutral default state.
  - Loop returns to Step 19.

---

## 2.4 — Mid-Quiz Interruptions & Edge Cases

### 2.4.1 — Pause Flow

**Step 28**
- **User Action:** User taps the **Pause icon** (‖).
- **System Response:**
  - Timer immediately stops.
  - A semi-transparent overlay (backdrop-filter: blur) covers the question content (obscuring the question text to prevent cheating).
  - A centered pause modal appears with:
    - "Quiz Paused" title
    - Current progress displayed: "8 of 15 questions answered"
    - **"Resume Quiz ▶"** primary button
    - **"Restart Quiz"** secondary button (with a confirmation dialog before executing)
    - **"Exit Quiz"** tertiary/destructive button (with a confirmation dialog: "Are you sure? Progress will be lost.")

**Step 29**
- **User Action:** User taps **"Resume Quiz ▶"**.
- **System Response:**
  - Modal closes with fade-out (200ms).
  - Blur overlay dissolves.
  - If timer was active: a 3-second countdown ("Resuming in 3… 2… 1…") appears before the timer restarts.
  - Timer resumes from where it paused.

### 2.4.2 — Exit Confirmation Flow

**Step 30**
- **User Action:** User taps "Exit Quiz" inside the pause modal (or presses back button on mobile/browser).
- **System Response:**
  - A confirmation dialog appears: "Exit quiz? Your progress for this session will not be saved."
  - Two buttons: **"Cancel"** (keep going) | **"Exit"** (confirm and leave)

**Step 31**
- **User Action:** User confirms exit by tapping **"Exit"**.
- **System Response:**
  - Session data is NOT saved (unless the app supports mid-session save).
  - App navigates back to the Home/Dashboard screen.
  - A toast notification appears at the bottom: "Quiz exited. Start again anytime." (auto-dismisses after 3 seconds).

### 2.4.3 — Network / Error State

**Step 32**
- **User Action:** None (system detects network failure mid-quiz).
- **System Response:**
  - Timer pauses automatically.
  - An inline banner appears at the top of the screen (non-blocking): "⚠ Connection lost. Trying to reconnect…" with a loading spinner.
  - If reconnected: banner changes to "✓ Back online!" (green, auto-dismisses in 2 seconds), timer resumes.
  - If not reconnected after 10 seconds: a modal appears: "Unable to reconnect. Your progress is saved locally. You can continue offline or exit."
  - All answered questions up to this point are stored in local/session state to prevent data loss.

---

## 2.5 — Final Question Submission

**Step 33**
- **User Action:** User answers the **final question** (e.g., Question 15 of 15).
- **System Response:**
  - Feedback renders as normal (correct/incorrect state, explanation if Practice Mode).
  - The "Next Question →" button is REPLACED by a **"See Results 🎉"** button (or "Finish Quiz").
  - The button label and icon are distinct to signal the end of the active quiz phase.
  - On hover/focus: a subtle glow or shimmer effect on the button.

**Step 34**
- **User Action:** User taps/clicks **"See Results 🎉"**.
- **System Response:**
  - Button press animation fires.
  - A full-screen **celebration transition** plays (varies by score):
    - Score ≥ 80%: Confetti burst animation + success fanfare sound (0.8s).
    - Score 50–79%: Positive-neutral animation (stars, gentle pulse) + neutral complete sound.
    - Score < 50%: Subdued but encouraging animation (no confetti) + soft completion sound.
  - Transition animation plays for 1.2–2 seconds before the Results screen renders.

---

---

# PHASE 3: REVIEW & RESULTS

## 3.1 — Score Summary Screen

**Step 35**
- **User Action:** None (system-driven render).
- **System Response — Results Hero Card:**
  - Top section: Large animated score percentage: "73%" — the number counts up from 0 to 73 over 1.5 seconds (easing out). This animation is deeply satisfying and leverages the principle of "earned reveal."
  - Below the percentage: "11 out of 15 Correct" in smaller text.
  - A circular progress ring (SVG arc) around the score animates from empty to the score percentage simultaneously.
  - Color of ring matches performance: green (≥80%), amber (50–79%), red (<50%).
  - Performance label below ring: "Great Job! 🌟" / "Good Effort!" / "Keep Practicing!"
  - XP earned this session: "+110 XP" displayed with a star icon, animates in after score reveal (0.3s delay).

**Step 36**
- **User Action:** User views summary stats.
- **System Response — Stat Strip:**
  - A horizontal (desktop) or vertical (mobile) stat strip appears below the hero card, showing animated counters for:
    - ✅ Correct: 11 (counts up)
    - ❌ Incorrect: 4 (counts up)
    - ⏱ Avg. Response Time: 14.2s (if timer was enabled)
    - 🔥 Streak: 5 (if applicable)
    - ⚡ Fastest Answer: 4.1s
  - Each stat appears with a staggered fade-in (100ms delay between each).

---

## 3.2 — Gamification Reward Presentation

**Step 37**
- **User Action:** None (system-driven, immediately after results render).
- **System Response — Achievement/Badge Check:**
  - If a new badge/achievement was unlocked: a badge reveal animation fires:
    - A modal overlay appears (or a slide-up card).
    - Badge icon scales in from 0 → 1.1 → 1.0 with a glow effect.
    - "🏅 New Badge Unlocked!" header.
    - Badge name and description displayed.
    - A **"Claim!"** or **"Awesome!"** CTA button closes the modal.
  - If a level-up occurred: a level-up screen appears BEFORE the badge modal.
    - "Level Up! You are now Level 8" with a large, animated level number.
    - A progress bar fills to max then "upgrades" to a new level bar.
  - If a streak milestone was hit (e.g., 7-day streak): a dedicated streak celebration card renders within the results screen.

**Step 38**
- **User Action:** User taps **"Awesome!"** to dismiss the achievement modal.
- **System Response:**
  - Modal closes (fade + scale down, 200ms).
  - Returns to full Results screen view.

---

## 3.3 — Per-Answer Review / Breakdown Screen

**Step 39**
- **User Action:** User scrolls down the Results screen OR taps a **"Review Answers"** button/tab.
- **System Response:**
  - A per-question answer review list renders below (or on a new tab).
  - Each question is shown as a compact review card with:
    - Question number + question text (truncated, expandable)
    - User's answer (displayed in red if wrong, green if correct)
    - Correct answer (always shown in green)
    - A "▼ See Explanation" expandable accordion (expands to show the explanation text inline)
  - Wrong answers are visually more prominent (red border or red left-side indicator).
  - Cards stagger-animate in (each card fades in with a 50ms delay after the previous one).

**Step 40**
- **User Action:** User taps on a **wrong answer card** to expand it.
- **System Response:**
  - The accordion expands smoothly (max-height animation, 300ms ease).
  - Explanation text appears inside.
  - A "📚 Study This Topic" link appears at the bottom of the expanded card.
  - If the user taps "📚 Study This Topic": a topic deep-dive modal or page opens.

---

## 3.4 — Insights & Analytics Panel

**Step 41**
- **User Action:** User scrolls further or taps an **"Insights"** tab.
- **System Response:**
  - An insights panel renders showing:
    - **Performance by Topic:** Mini bar chart or segmented ring showing breakdown (e.g., "Cell Structure: 100%, Mitosis: 50%, DNA Replication: 60%")
    - **Compared to Last Attempt:** "+15% improvement" with an upward arrow indicator.
    - **Compared to Peers:** "You scored higher than 68% of users who took this quiz." (if social data is available)
    - **Weak Areas Identified:** A clearly labeled section: "Focus on: Mitosis, Osmosis" with a "Practice These Now →" CTA button.
    - **Mastery Meter:** A topic-specific progress bar showing overall mastery of the subject increasing.

---

## 3.5 — Post-Quiz Action Screen / Next Steps

**Step 42**
- **User Action:** User finishes reviewing results.
- **System Response:** A **"What's Next?"** section renders at the bottom of the results screen (or as a sticky bottom action bar on mobile) with clearly differentiated action buttons:

  - **"Retry This Quiz 🔄"** — Same topic, new question order (default: shuffled)
  - **"Practice Weak Areas 🎯"** — Launches a focused quiz targeting only the incorrectly answered concepts (adaptive mode)
  - **"Next Topic →"** — Advances to the next sequential topic in a course/module
  - **"Share Score"** — Opens share sheet (social media / copy link) showing a stylized score card image
  - **"Return Home 🏠"** — Back to dashboard

**Step 43**
- **User Action:** User selects any of the above actions.
- **System Response:**
  - Selected action triggers its respective flow:
    - Retry → Returns to Step 1.4 (Configuration, pre-populated with same settings)
    - Practice Weak Areas → Jumps directly to Step 17 (loading screen) with a pre-configured adaptive quiz
    - Next Topic → Navigates to Step 1.2 with next topic pre-selected
    - Share Score → Opens native share modal
    - Return Home → Navigates to Dashboard (Step 2)

---

---

# PHASE 4: POST-SESSION & META LOOP

## 4.1 — Spaced Repetition Scheduling (Background, Silent)

**Step 44**
- **User Action:** None (system-driven, invisible to user).
- **System Response:**
  - The app calculates which questions were answered incorrectly or with low confidence.
  - These questions are flagged in the user's learning profile.
  - A spaced repetition algorithm (e.g., SM-2 variant) schedules these questions to reappear in future quiz sessions at optimal intervals (1 day, 3 days, 7 days, etc.).

## 4.2 — Return Prompt / Streak Maintenance

**Step 45**
- **User Action:** User exits the app or closes the browser tab.
- **System Response:**
  - A push notification (mobile) or browser notification (web, if permission granted) is scheduled for the next day.
  - Notification copy example: "🔥 Your 5-day streak is at risk! Take a quick quiz to keep it alive."
  - Notification fires at the user's historically active time of day (if enough data exists) or at a default time.

**Step 46**
- **User Action:** User returns to the app the next day via notification.
- **System Response:**
  - App opens directly to a pre-configured "Daily Quick Quiz" (5 questions, mixed review of recently flagged weak areas + new material).
  - Streak counter on the dashboard is highlighted with a pulsing animation to reinforce the reward.
  - If streak was maintained: a brief streak continuation animation fires (flame grows, "+1" badge).
  - If streak was broken: a sympathetic message appears: "Streak reset. Start a new one today! 💪"

---

---

# Appendix A: Micro-Interaction Reference Table

| Trigger | Component | Animation | Duration | Purpose |
|---|---|---|---|---|
| Page/Screen entry | Any screen | Slide-in from right | 250–300ms ease-out | Spatial continuity |
| Page/Screen exit | Any screen | Slide-out to left | 250ms ease-in | Spatial continuity |
| Button tap | All buttons | Scale: 1.0 → 0.97 → 1.0 | 150ms | Confirm tap registered |
| Card selection | Answer card | Scale: 1.0 → 1.02, border highlight | 150ms | Confirm selection |
| Correct answer | Answer card | Green fill + checkmark scale in | 300ms | Positive reinforcement |
| Incorrect answer | Answer card | Red fill + shake (3× oscillate) | 400ms | Error feedback |
| Timer warning (25%) | Timer bar | Color: green → amber | 300ms smooth | Low urgency warning |
| Timer critical (10%) | Timer bar | Color: amber → red + pulse | Continuous | High urgency warning |
| Score reveal | Score number | Count-up 0→N, ease-out | 1500ms | Earned reveal delight |
| Progress bar advance | Progress bar | Width increase, ease | 400ms | Orientation/progress |
| XP increment | XP counter | Number count-up + float label | 600ms | Gamification reward |
| Badge unlock | Badge modal | Scale: 0 → 1.1 → 1.0 + glow | 500ms | Achievement celebration |
| Loading screen | Spinner/pulse | Continuous loop | Indefinite | System status |
| Modal open | Modal | Fade in + translate-Y: 20px → 0 | 300ms | Contextual overlay |
| Modal close | Modal | Fade out + scale: 1.0 → 0.95 | 200ms | Dismissal clarity |
| Accordion expand | Explanation | max-height: 0 → full, ease | 300ms | Progressive disclosure |
| Streak counter hit | Flame icon | Scale: 1.0 → 1.3 → 1.0 | 400ms | Emotional reinforcement |

---

# Appendix B: System States per Screen

Every screen in the quiz must design for ALL of the following states:

1. **Default/Idle** — standard resting state
2. **Hover** (desktop) — visual affordance of interactivity
3. **Focus** (keyboard/tab navigation) — visible focus ring (2px solid accent color)
4. **Active/Pressed** — visual confirmation of interaction
5. **Selected** — chosen state (answer selected, not yet submitted)
6. **Correct** — post-submission success state
7. **Incorrect** — post-submission error state
8. **Disabled** — non-interactive (e.g., "Submit" before selection is made)
9. **Loading** — skeleton or spinner while content loads
10. **Empty** — no data available (e.g., no quiz history)
11. **Error** — network failure, unexpected error
12. **Expired** — timer ran out on a question

---

# Appendix C: Accessibility Checklist for Quiz UX

- [ ] All interactive elements reachable via keyboard (Tab / Enter / Space / Arrow keys)
- [ ] Focus rings visible at all times on focused elements
- [ ] Color never the ONLY indicator of correct/incorrect state — always paired with icon (✓/✗) and text
- [ ] Timer visual always supplemented by an ARIA live region announcement ("10 seconds remaining")
- [ ] All images have meaningful alt text; decorative images use alt=""
- [ ] Answer cards have distinct aria-labels: "Answer A: Mitochondria. Currently selected."
- [ ] Score announcement on results screen via aria-live: "You scored 73 percent, 11 out of 15 correct."
- [ ] Minimum touch target 44×44px on all interactive elements
- [ ] Prefers-reduced-motion: all animations respect `@media (prefers-reduced-motion: reduce)` — animations reduce to instant state transitions
- [ ] Minimum text contrast 4.5:1 on all surfaces; 3:1 for large text (WCAG AA)
- [ ] Timer can be paused by keyboard shortcut (Spacebar or P key)
- [ ] Session can be saved and resumed for users who need breaks (accessibility accommodation)

---

*End of Document — Quiz UX/UI & Learning Methodology Blueprint v1.0*
*For use in: Frontend Engineering, UI Design, Instructional Design, Product Management*
