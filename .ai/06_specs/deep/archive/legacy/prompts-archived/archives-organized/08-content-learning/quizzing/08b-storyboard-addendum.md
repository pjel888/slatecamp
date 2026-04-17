# SlateCamp Quiz Engine — Document 08b: Storyboard Addendum

## Three Product Decisions That Change the Frame Sequence

> **This addendum modifies Document 08 (Frame-by-Frame Storyboard).** Read Doc 08 first, then apply these changes on top. These are not optional — they override the original storyboard wherever there's a conflict.

---

# DECISION 1: Swipe-to-Submit (Default for ALL Users)

## The Innovation

SlateCamp does NOT use a traditional "Submit Answer" button as the primary submit mechanism. Instead, **after selecting an answer option, the user swipes the selected option card to the right to submit.** This is the default. This is the brand. No other exam prep app does this.

A "Check Answer" button still exists as a secondary/fallback — but the swipe is the primary, taught, and celebrated interaction.

## Why Swipe Wins

1. **Intentionality:** A swipe requires directional commitment + distance traveled. Accidental submissions are nearly impossible. A button tap has zero directionality — it's a binary point event that can happen by accident.
2. **Physicality:** Swiping creates a tactile "I'm choosing this" sensation. The card moves with the user's finger. There's momentum, resistance, and a satisfying snap. This makes every answer feel like a deliberate act, not a form submission.
3. **Speed for experienced users:** After 10 questions, swipe becomes muscle memory. Select + swipe is faster than select + move thumb to button + tap. Power users will love this.
4. **Mobile-native:** 75% of SlateCamp sessions are on mobile. Swipe is the most natural mobile gesture. It uses the same muscle pattern as dismissing a notification or archiving an email.
5. **Brand differentiator:** When students talk about SlateCamp, they'll say "you swipe to answer." It's memorable. It's ownable.

## The Swipe Interaction — Exact Specification

### Step-by-Step Behavior

```
STATE 1: User sees question (F-010). No option selected.
  → All 4 options in idle state (white bg, grey border)
  → No submit mechanism visible (no button, no swipe affordance)

STATE 2: User taps an option (e.g., Option C).
  → Option C highlights: Cobalt Light bg, Cobalt border
  → Other options dim slightly (opacity 0.85)
  → SWIPE AFFORDANCE APPEARS on Option C:
    - A subtle right-arrow chevron (›) fades in at the right edge of the selected card
    - The card gains a very slight "lifted" shadow (shadow-md)
    - On first-ever session: a one-time tooltip appears: "Swipe right to submit →"
  → FALLBACK BUTTON: "Check Answer" text button appears below options (ghost style, 12px, muted)
    - This is the accessibility fallback and desktop keyboard alternative
    - It is NOT the primary action — it's deliberately understated

STATE 3: User swipes the selected option card to the right.
  → SWIPE MECHANICS:
    - Threshold: 40% of card width (approximately 120px on mobile)
    - Below threshold: card snaps back with spring animation (200ms)
    - Above threshold: card continues sliding right, accelerating
    - As card moves right, a colored confirmation strip is revealed underneath:
      · If correct (immediate feedback modes): Cobalt lemonsqueezy with ✓ icon
      · If incorrect: Amber lemonsqueezy with → icon
      · In deferred modes: neutral grey lemonsqueezy with ✓
    - The card fully exits to the right (300ms ease-out)
    - Haptic feedback fires at the threshold crossing (if device supports it)
    
STATE 4: Answer submitted.
  → Server call fires (same as current submitAnswer action)
  → Transition to F-011 (feedback) or F-012 (deferred toast)
  → The swiped card animates back into position but now shows its annotated state
```

### The Swipe Card Visual Anatomy

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  ┌────────────────────────────────────────────┐ ──►  │  ← Swipe affordance chevron
│  │  ●  C   2.70 meters                       │      │
│  └────────────────────────────────────────────┘      │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░      │  ← Confirmation strip (hidden under card)
│                                                      │
│                   Check Answer (ghost link)           │  ← Fallback button
│                                                      │
└─────────────────────────────────────────────────────┘
```

During swipe (card displaced 60% right):
```
│                         ┌──────────────────────┐     │
│  ▓▓▓▓▓▓▓▓▓▓▓ ✓ ▓▓▓▓▓▓ │  ●  C   2.70 meters  │    │
│  (confirmation strip)   └──────────────────────┘     │
```

### Swipe Specification Table

| Property | Value |
|---|---|
| Direction | Right only (left swipe does nothing) |
| Trigger | Only on the SELECTED option card (unselected cards don't swipe) |
| Threshold | 40% of card width |
| Below threshold | Spring-back animation (200ms, ease-out) |
| Above threshold | Card exits right (300ms, ease-out with momentum) |
| Confirmation strip | Cobalt (correct), Amber (wrong), Grey (deferred) — 100% width, 48px height, revealed as card moves |
| Confirmation strip content | Icon (✓ or →) + brief text ("Correct" or "Checking...") |
| Haptic feedback | Medium impact at threshold crossing (iOS: UIImpactFeedbackGenerator.medium, Android: HapticFeedbackConstants.CONFIRM) |
| Sound | None (exam context — silence is respectful) |
| Desktop behavior | Swipe via click-drag on the card. Also: keyboard Enter submits (same as "Check Answer" button). |
| Accessibility | "Check Answer" button is the keyboard/screen-reader alternative. aria-label on selected card: "Swipe right or press Enter to submit answer C, 2.70 meters" |

### First-Time User Onboarding (One-Time Tooltip)

On the user's very first quiz question ever (tracked via `user_preferences.has_seen_swipe_tutorial: boolean`):

```
┌─────────────────────────────────────────────┐
│  ●  C   2.70 meters                    ──►  │
└─────────────────────────────────────────────┘
         ↑
    ┌────────────────────────────────┐
    │  Swipe right to submit  →      │
    │  or tap "Check Answer" below   │
    └────────────────────────────────┘
    (tooltip, Cobalt bg, white text, 
     auto-dismisses after 5 seconds
     or on first successful swipe)
```

After the user's first successful swipe: tooltip never appears again. `has_seen_swipe_tutorial = true`.

### Changing User's Mind (Before Swipe)

- User selects Option C → swipe affordance appears on C
- User taps Option B instead → C deselects, B selects, swipe affordance moves to B
- User can change selection unlimited times before swiping
- Only the swipe (or "Check Answer" tap) commits the answer

### Desktop Keyboard Flow

Since swipe is a touch gesture, desktop keyboard users need an equivalent:

1. User presses `1`/`2`/`3`/`4` or arrow keys to select option
2. User presses `Enter` or `Space` to submit (equivalent of swipe)
3. Or user clicks "Check Answer" text link

The "Check Answer" link on desktop can be slightly more prominent (14px instead of 12px) since desktop users may not realize they can press Enter.

---

## Frames Modified by Decision 1

### F-003 (Intro Slide 1) — REMOVE element #14 (preference toggle)

There is no preference toggle. Swipe is the default for everyone. Remove any mention of "choose your submit method." The intro slide does NOT mention the swipe — the user discovers it naturally on the first question via the one-time tooltip.

### F-010 (Active Quiz: Unanswered) — MODIFY right column

**Before selection:**
- 4 option cards in idle state
- NO submit button visible (nothing to submit yet)
- NO swipe affordance (nothing selected yet)

**After selection:**
- Selected option: Cobalt Light bg, Cobalt border, slight shadow-md lift, right-arrow chevron (›) at right edge
- Other options: slightly dimmed (opacity 0.85)
- "Check Answer" ghost link appears below options (12px, muted, centered)
- On first-ever question: one-time tooltip appears above selected card

**Replace the old "Submit Answer" button spec:**

| Old Element | New Element |
|---|---|
| "Submit Answer" primary button (Cobalt, full-width, 48px) | **REMOVED** as primary. Replaced by swipe gesture on selected card. |
| N/A | "Check Answer" ghost text link (12px, muted, centered below options). Fallback only. |
| N/A | Swipe affordance: ›  chevron on selected card's right edge. Subtle pulse animation (opacity 0.5 → 1.0, 2s loop) on first appearance only. |

### F-010 Bottom Bar — MODIFY

| Old | New |
|---|---|
| `[← Previous]  Q 1 of 20  [Submit Answer]` | `[← Previous]  Q 1 of 20  [Check Answer]` (ghost style, not primary) |

On mobile, the bottom bar's right button becomes "Check Answer" in ghost style. The swipe on the card above is the primary action. This is important: the bottom bar button is the fallback, not the hero.

### F-011 (Feedback) — ADD swipe-back animation

After the swipe submits and the server responds:
- The swiped card animates back from the right edge to its original position (300ms spring)
- But now it shows its annotated state (Cobalt for correct, Amber for wrong)
- The confirmation strip underneath fades away
- The feedback rationale panel slides in below (same as before)

### F-012 (Deferred Toast) — ADD swipe behavior

In deferred feedback modes (Storm, Full Exam):
- User swipes → card exits right → grey confirmation strip shows "✓ Recorded"
- Card snaps back to position (unannotated — no correct/wrong shown)
- Toast appears: "Answer recorded ✓" (same as before)
- Auto-advances to next question

---

# DECISION 2: Auto-Submit on Completion (No Opt-Out)

## The Rule

**When a user answers the last question in a session, the session is AUTOMATICALLY submitted. There is no "are you sure?" confirmation modal. There is no option to discard results. The answers are final and WILL affect the Readiness Score.**

This applies to ALL 8 modes. No exceptions.

## Why This Is Right

1. **Data integrity:** If a student answered 20 questions, those answers happened. Allowing them to "not submit" creates an incentive to abandon bad sessions, which corrupts the mastery data. The Readiness Score must reflect reality.
2. **Simplifies the flow:** Removing the confirmation modal eliminates one entire frame (the old F-018C) and its decision branch. The flow goes: last answer → processing buffer → results. Clean.
3. **Matches the real ALE:** On the actual Architecture Licensure Exam, when you submit your answer sheet, it's final. There is no "undo." SlateCamp should mirror this reality.
4. **Reduces anxiety about the decision itself:** The old flow asked "Submit your exam?" which creates a meta-anxiety: "Should I submit? Maybe I should go back and change answers..." Auto-submit removes this decision paralysis.

## What About Mid-Session Exit?

Users CAN still exit mid-session (via the ✕ button → F-017 confirmation modal). But even mid-session exits auto-submit the answered portion:

- **Learning modes (Camp, Chill, Subject, Focused, Extended):** User taps ✕ → modal: "End this session? Your 12 answered questions will be submitted and your Readiness Score will update." → "End Session" / "Keep Going"
- **Exam modes (Storm, Full Exam):** User taps ✕ → modal: "Leave this exam? Your answered questions will be submitted. Timer pauses for 30 minutes." → "Continue Exam" (primary) / "Submit & Leave" (secondary)

**Key change:** The exit modal no longer says "Your progress is saved." It says "Your answers will be submitted." Because they will be. Always.

## Frames Modified by Decision 2

### F-017 (Exit Confirmation Modal) — MODIFY text

**Learning Modes (new):**
```
┌──────────────────────────────┐
│                              │
│   End this session?          │
│                              │
│   Your 12 answered questions │
│   will be submitted. Your    │
│   Readiness Score will       │
│   update based on these      │
│   answers.                   │
│                              │
│   [End & Submit]             │  ← Primary (Cobalt)
│   [Keep Going]               │  ← Ghost
│                              │
└──────────────────────────────┘
```

**Exam Modes (new):**
```
┌──────────────────────────────┐
│                              │
│   Leave this exam?           │
│                              │
│   Your 32 answered questions │
│   will be submitted now.     │
│   Unanswered questions will  │
│   not count against you.     │
│                              │
│   [Continue Exam]            │  ← Primary (Cobalt)
│   [Submit & Leave]           │  ← Secondary
│                              │
└──────────────────────────────┘
```

### F-018 (Last Question Signal) — SIMPLIFY

**Old behavior:** Last question shows "Finish Session →" (learning) or "Review & Submit →" (exam), leading to confirmation modals.

**New behavior:**

For ALL modes with immediate feedback:
1. User swipes to submit the last answer
2. Feedback panel appears (same as F-011)
3. The "Next Question →" button text changes to **"See Your Results →"**
4. User taps "See Your Results →"
5. → F-009B (processing buffer) → F-019 (results)
6. **No confirmation modal.** Session is already submitted the moment the last answer's swipe completes.

For exam modes with deferred feedback:
1. User swipes to submit the last answer
2. Toast: "Answer recorded ✓ — Last question!"
3. → F-018B (Pre-Submission Review grid) — user can review their grid of answered/unanswered/flagged
4. Grid shows "All questions answered ✓" or "2 unanswered, 3 flagged"
5. **"Finalize Exam →"** button (NOT "Submit" — the answers are already recorded, this just triggers the processing)
6. → F-009B → F-019 (results) or F-019B (Full Exam 24hr delay)
7. **No "are you sure?" modal.** The pre-submission review IS the review. If they want to change answers, they tap a grid cell and go back. The "Finalize" button is the last step.

### F-018B (Pre-Submission Review) — MODIFY CTA text

| Old | New |
|---|---|
| "Submit Exam" button | **"Finalize Exam →"** button |
| "Keep Reviewing" button | **"Review Flagged (3)"** button (more specific) |
| Warning: "Once submitted, results in 24 hours" | "Your answers are recorded. Tap Finalize to see your results." |

### F-018C (Submit Confirmation Modal) — DELETED

This frame no longer exists. The "are you sure you want to submit?" modal is removed entirely. The pre-submission review grid (F-018B) serves as the review checkpoint. After that, "Finalize Exam →" goes straight to processing.

### F-002 (Resume Banner) — MODIFY "Discard" behavior

| Old | New |
|---|---|
| "Discard" button with "Discard this session?" confirmation | **REMOVED.** No discard option. Banner shows only "Resume" and "Submit Now" (submits answered questions immediately). |

**New F-002 banner:**
```
┌─────────────────────────────────────────────────────┐
│ ⚡ Unfinished session                                │
│ Storm Mode · Structural Design · 32/50 answered      │
│ Started 2 hours ago                                  │
│ [Resume]  [Submit 32 Answers Now]                    │
└─────────────────────────────────────────────────────┘
```

---

# DECISION 3: Question History Stats (Pro Feature, Review Mode Only)

## The Feature

For Pro users, during Review Mode (F-020), each question shows a small data chip: **"You've seen this question 6 times: ✓4 ✗2"** — their personal history with that specific question.

This is NOT shown during active quizzing (F-010/F-011) — it would be distracting and could bias the student's confidence.

## Why Review Mode Only

- **During active quiz:** Seeing "you've gotten this wrong 3 times" before answering creates anxiety and confirmation bias. The student should approach each question fresh.
- **During review:** Seeing "you've gotten this wrong 3 times" AFTER answering provides metacognitive insight: "I keep making this mistake. Why?" This is where the learning happens.
- **Pro feature gate:** This data requires historical query across all past sessions. It's a premium insight that justifies the Pro subscription.

## Data Source

```sql
-- Query: Get user's history with a specific question
SELECT
  COUNT(*) as times_seen,
  COUNT(*) FILTER (WHERE is_correct = true) as times_correct,
  COUNT(*) FILTER (WHERE is_correct = false) as times_wrong,
  MAX(created_at) as last_seen_at
FROM user_interactions
WHERE user_id = $userId
  AND question_id = $questionId;
```

This query runs for all questions in the session when the user enters Review Mode (F-020). It's batched in the `getReviewData` Server Action — not queried per-question.

## Where It Appears in F-020 (Review Mode)

### Left Column — Below Question Stem

```
│                               │
│  Question 8                   │
│                               │
│  According to the National    │
│  Building Code...             │
│                               │
│  ── Your history (Pro) ────── │
│  Seen 6 times: ✓4  ✗2        │
│  Last seen: 3 days ago        │
│  ─────────────────────────── │
│                               │
│  Confidence: Somewhat sure    │
│                               │
```

### Element Specification

| # | Element | Spec | Conditional |
|---|---|---|---|
| 1 | History section divider | Thin line + "YOUR HISTORY" eyebrow (DM Mono 9px, muted) | Pro users only. Free users see nothing (not a teaser/paywall — just absent). |
| 2 | Stats line | "Seen [N] times: ✓[correct] ✗[wrong]" · DM Mono 12px. ✓ in Cobalt, ✗ in Amber (not red). | Pro users only |
| 3 | Last seen | "Last seen: [relative time]" · 11px, muted | Pro users only |
| 4 | Trend indicator (future enhancement) | If accuracy is improving: "↑ Getting better" in green. If declining: "→ Still tricky" in neutral. | Pro users only, v1.1 |

### Specific Insights Based on History

| Pattern | What user sees | Why |
|---|---|---|
| Seen 1 time, correct | "First time — and you got it ✓" | Positive reinforcement |
| Seen 3+ times, all correct | "Consistent ✓ — this one's solid" | Confirms mastery |
| Seen 3+ times, mostly wrong | "Seen 5 times: ✓1 ✗4 — this is a blindspot" | Flags for focused review |
| Seen 3+ times, improving | "✗✗✗✓✓ — you're getting the hang of this" | Growth signal |
| Never seen before | "First encounter" | Sets expectation |

### What Free Users See

Nothing. The history section simply doesn't render. There's no "Upgrade to see your history" teaser in the review screen — that would break flow. The Pro upsell happens elsewhere (dashboard, paywall screen).

---

# UPDATED MODE CONFIGURATION TABLE

The following rows in Part B of Doc 08 need updating:

| Config Flag | Camp | Chill | Subject | Focused | Custom | Storm | Full Exam | Extended |
|---|---|---|---|---|---|---|---|---|
| **Primary submit** | Swipe | Swipe | Swipe | Swipe | Swipe | Swipe | Swipe | Swipe |
| **Fallback submit** | Check Answer (ghost) | Check Answer (ghost) | Check Answer (ghost) | Check Answer (ghost) | Check Answer (ghost) | Check Answer (ghost) | Check Answer (ghost) | Check Answer (ghost) |
| **Auto-submit on complete** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Confirmation modal on complete** | No | No | No | No | No | No | No | No |
| **Pre-submit review grid** | No | No | No | No | User | Yes | Yes | No |
| **Question history in review** | Pro only | No (no review) | Pro only | Pro only | Pro only | Pro only | Pro only | Pro only |
| **Mid-exit behavior** | Submit answered | Submit answered | Submit answered | Submit answered | Submit answered | Submit answered | Submit answered | Submit answered |

---

# UPDATED UNIVERSAL FLOW SUMMARY

With all three decisions applied, the complete happy path is now:

```
F-001  Mode Selector (or skip via Camp Trail / Heatmap / deep link)
  ↓
F-003  Intro Slide 1: Session Briefing
       (mode icon, topic, count stepper, time estimate, CTA)
       NO submit-method preference — swipe is default for everyone
  ↓
F-004  Intro Slide 2: Topic Picker (Subject/Focused/Custom only)
  ↓
F-005  Intro Slide 3: Advanced Config (Custom only)
  ↓
F-009  Loading Transition (500ms)
  ↓
F-010  Question Screen (two-column: question LEFT, options RIGHT)
       User reads question → taps option → SWIPES selected card right to submit
       First-time: tooltip "Swipe right to submit →"
       Fallback: "Check Answer" ghost link below options
  ↓
F-011  Feedback (immediate modes): right column shows annotated options + rationale
       Gated "Next →" button (or "See Your Results →" on last question)
  OR
F-012  Deferred toast (exam modes): "Answer recorded ✓" → auto-advance
  ↓
       [REPEAT F-010 → F-011/F-012 for each question]
  ↓
       [MICRO-BREAK at configured intervals: F-013]
  ↓
F-018  Last Question:
       Learning: swipe last answer → feedback → "See Your Results →" → no modal
       Exam: swipe last answer → toast → F-018B pre-submit review → "Finalize Exam →"
       ALL: session auto-submitted. No opt-out. Answers are final.
  ↓
F-009B Processing Buffer (500ms emotional transition)
  ↓
F-019  Results Summary (score, breakdown, Readiness Score delta, CTAs)
  OR
F-019B Full Exam: "Submitted. Results in 24 hours."
  ↓
F-020  Review Mode (same two-column shell, read-only)
       Pro users see question history stats ("Seen 6 times: ✓4 ✗2")
       Free users: standard review without history
  ↓
       [Back to Dashboard / Practice Missed / Start Next Day]
```

---

# TECHNICAL IMPLEMENTATION NOTES

## Swipe Implementation

```typescript
// Use a gesture library: react-use-gesture (now @use-gesture/react)
// Or implement with native touch events for lighter bundle

interface SwipeConfig {
  threshold: number;        // 0.4 (40% of card width)
  velocityThreshold: number; // 0.3 (pixels/ms — fast swipe bypasses distance threshold)
  maxRotation: number;      // 3 (degrees — slight tilt during swipe for physicality)
  snapBackDuration: number;  // 200 (ms)
  exitDuration: number;      // 300 (ms)
  hapticOnThreshold: boolean; // true
}
```

```tsx
// Pseudocode for swipe handler on selected option card
const bind = useGesture({
  onDrag: ({ movement: [mx], velocity: [vx], direction: [dx], cancel }) => {
    // Only allow right swipe on the SELECTED option
    if (!isSelected) return;
    if (dx < 0) return; // Left swipe — ignore

    const progress = mx / cardWidth;

    if (progress > 0.4 || vx > 0.3) {
      // THRESHOLD CROSSED — submit
      triggerHaptic('medium');
      animateCardExit();
      submitAnswer();
    } else {
      // Below threshold — track finger position
      setCardOffset(mx);
      setConfirmStripOpacity(progress / 0.4); // Strip fades in proportionally
    }
  },
  onDragEnd: ({ movement: [mx] }) => {
    if (mx / cardWidth < 0.4) {
      // Didn't reach threshold — snap back
      animateSnapBack();
    }
  },
});
```

## Auto-Submit Implementation

```typescript
// In the submitCurrentAnswer action:
async submitCurrentAnswer() {
  const result = await submitAnswer(/* ... */);
  
  // Check if this was the last question
  const state = get();
  const isLastQuestion = state.currentIndex === state.totalQuestions - 1;
  
  if (isLastQuestion) {
    // Auto-end session — no confirmation needed
    // For immediate feedback modes: wait for user to tap "See Your Results"
    // For deferred modes: auto-trigger endSession after toast
    if (state.config.feedback.timing === 'deferred') {
      // Show toast, then after 1.5s:
      setTimeout(() => {
        if (state.config.navigation.questionPalette) {
          // Exam mode: show pre-submission review (F-018B)
          set({ status: 'pre-submit-review' });
        } else {
          // No palette mode: go straight to results
          get().endSession('completed');
        }
      }, 1500);
    }
    // Immediate feedback modes: user reads feedback, then taps "See Your Results →"
    // which calls endSession('completed')
  }
}
```

## Question History Query (Batched)

```typescript
// In getReviewData Server Action — add to the return payload:
// Only for Pro users (check subscription status server-side)

if (userProfile.subscription_tier === 'pro') {
  const historyData = await supabase
    .from('user_interactions')
    .select('question_id, is_correct, created_at')
    .eq('user_id', userId)
    .in('question_id', sessionQuestionIds);
  
  // Aggregate per question
  const questionHistory: Record<string, QuestionHistory> = {};
  for (const interaction of historyData.data) {
    if (!questionHistory[interaction.question_id]) {
      questionHistory[interaction.question_id] = {
        timesSeen: 0, timesCorrect: 0, timesWrong: 0, lastSeenAt: null
      };
    }
    const h = questionHistory[interaction.question_id];
    h.timesSeen++;
    if (interaction.is_correct) h.timesCorrect++;
    else h.timesWrong++;
    if (!h.lastSeenAt || interaction.created_at > h.lastSeenAt) {
      h.lastSeenAt = interaction.created_at;
    }
  }
  
  return { ...reviewData, questionHistory };
}
```

---

# DECISION 4: Merged Results + Review Screen (No Separate Review Mode)

## The Rule

After the last question, the user lands on a **single, scrollable page** that combines the score summary AND the full question-by-question review. There is no separate "Review Mode" that requires an extra tap. The user sees their score, scrolls down, and immediately starts studying their answers.

**F-019 (Results Summary) and F-020 (Review Mode) are MERGED into one frame: F-019.**

The old F-020 (separate Review Mode with the two-column quiz shell in read-only mode) is **deleted**.

## Why This Is Better

1. **Zero friction to learning:** The most valuable part of the quiz is the review — where the student corrects their mental models. Adding a "Review Your Answers" button between the score and the actual review creates a friction point where ~40% of users drop off. They see their score and leave. Merging removes this exit ramp.
2. **The review IS the results:** A score number alone ("85%") teaches nothing. The score only becomes meaningful when the student can see WHICH questions they got wrong and WHY. These should be on the same page, not behind a tap.
3. **Scrolling is natural:** Users are trained to scroll. A long, well-structured page (score at top → breakdown → question cards) is more intuitive than navigating between two separate screens.
4. **Study mode on arrival:** The student finishes their last question, sees the processing buffer, and arrives at a page that says "here's your score AND here are all your questions — start studying." No decision needed.

## The New F-019: Combined Results + Review Page

### Layout (Single Scrollable Page)

```
┌─────────────────────────────────────────────────────────────────┐
│ Session Complete                                           ✕    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ══════════════ SECTION 1: SCORE HERO ══════════════            │
│                                                                  │
│              YOUR SCORE (eyebrow)                                │
│                 17/20                                            │
│             (DM Mono 56px, Cobalt, count-up)                    │
│              85% — Passing                                       │
│              ▲ +8% from last time                               │
│                                                                  │
│  ── READINESS SCORE ──────────────────────────────              │
│  │  72  ▲ +2 from this session                  │              │
│  ─────────────────────────────────────────────────              │
│                                                                  │
│  ══════════ SECTION 2: PERFORMANCE BREAKDOWN ══════════         │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Structural Systems        8/10  ━━━━━━━━░░      │           │
│  │ Building Laws             5/6   ━━━━━━━━░       │           │
│  │ Utilities                 4/4   ━━━━━━━━━━      │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                  │
│  ── FILTER QUESTIONS ──                                         │
│  [All 20] [Incorrect (3)] [Flagged (1)] [Low Confidence (2)]   │
│                                                                  │
│  ══════════ SECTION 3: QUESTION-BY-QUESTION REVIEW ════════    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Q1 · Structural Design > Foundations          ✓ Correct  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                         │                                │  │
│  │  Question 1             │  ● A  2.10 meters (dimmed)    │  │
│  │                         │  ● B  2.40 meters (dimmed)    │  │
│  │  According to the NBC   │  ● C  2.70 meters  ✓ Correct │  │
│  │  (PD 1096), what is the │  ● D  3.00 meters (dimmed)    │  │
│  │  minimum clear ceiling  │                                │  │
│  │  height for habitable   │  ── Rationale ──              │  │
│  │  rooms?                 │  The minimum is 2.70m per      │  │
│  │                         │  PD 1096 Section 805.          │  │
│  │  ── Your history (Pro)──│  📖 Wiki →                    │  │
│  │  Seen 4×: ✓3 ✗1        │                                │  │
│  │                         │                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Q2 · Building Laws > PD 1096              → Not quite    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                         │                                │  │
│  │  Question 2             │  ● A  ... (dimmed)            │  │
│  │                         │  ● B  ... ← You chose (amber) │  │
│  │  [question stem]        │  ● C  ... ✓ Correct (cobalt)  │  │
│  │                         │  ● D  ... (dimmed)            │  │
│  │                         │                                │  │
│  │                         │  ── Rationale ──              │  │
│  │                         │  You chose B — this is for     │  │
│  │                         │  non-habitable rooms...        │  │
│  │                         │  📖 Wiki →                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ... (Q3 through Q20, same card format) ...                     │
│                                                                  │
│  ══════════ SECTION 4: ACTIONS ════════════════════════         │
│                                                                  │
│  ┌───────────────────────────────────────────────┐             │
│  │       Practice Missed Questions (3)           │  PRIMARY    │
│  └───────────────────────────────────────────────┘             │
│  ┌───────────────────────────────────────────────┐             │
│  │       Start Day 15 →                          │  SECONDARY  │
│  └───────────────────────────────────────────────┘             │
│              Back to Dashboard (ghost)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Section-by-Section Breakdown

#### Section 1: Score Hero (Top of Page, Always Visible on Arrival)

| # | Element | Spec |
|---|---|---|
| 1 | Score number | DM Mono 56px, Cobalt. Count-up 0→17 over 1.5s. "/20" at 28px muted. |
| 2 | Pass/fail label | ≥70%: "Passing" green text. 50-69%: "Building" neutral. <50%: "Needs review" neutral. |
| 3 | Growth delta | "▲ +8% from last time" if historical data exists. |
| 4 | Readiness Score card | Cobalt Light bg. Score (DM Mono 28px) + delta. Hidden in Chill Mode. |

This section is compact — no more than 200px tall on mobile. The score is visible immediately without scrolling.

#### Section 2: Performance Breakdown + Filters

| # | Element | Spec |
|---|---|---|
| 5 | Subject bars | Cream card. Each subject: name + fraction + Cobalt progress bar. Sorted weakest-first. |
| 6 | Stamina chart | Accuracy over time (25-Q blocks). Only if session ≥50 questions. |
| 7 | Filter pills | Horizontal scrollable row: "All 20" / "Incorrect (3)" / "Flagged (1)" / "Low Confidence (2)". Active = Cobalt Light bg. Tapping a filter scrolls to the first matching question card AND dims non-matching cards. |

The filter pills are **sticky** — they pin to the top of the viewport as the user scrolls into the question cards section. This way the user can always switch filters without scrolling back up.

#### Section 3: Question-by-Question Review Cards (The Heart of the Page)

Each question is a **self-contained review card** that uses the **same two-column layout** as the active quiz — question on the left, options + rationale on the right. This maintains the spatial contract from the quiz itself.

| # | Element | Spec |
|---|---|---|
| 8 | Card header | Full-width banner: "Q1 · Structural Design > Foundations" + correctness badge ("✓ Correct" cobalt or "→ Not quite" amber) |
| 9 | Left column (question) | Topic breadcrumb + question number + stem + image (if any) + question history (Pro only: "Seen 4×: ✓3 ✗1") |
| 10 | Right column (options + rationale) | All 4 options annotated (correct = Cobalt, user's wrong = Amber, others dimmed) + rationale panel always expanded + Wiki link |
| 11 | Card border | Correct cards: subtle Cobalt left-border (3px). Wrong cards: subtle Amber left-border (3px). |

**Card states:**
- **Correct answer:** Cobalt left-border. Options show ✓ on correct. Others dimmed. Short rationale ("Well done — here's why...").
- **Wrong answer:** Amber left-border. Options show user's choice (Amber "← You chose") + correct answer (Cobalt "✓ Correct"). Full rationale explaining why wrong AND why correct. Wiki link.
- **Skipped:** Grey left-border. "You skipped this one." Correct answer revealed + rationale.

**Collapsibility:** Correct-answer cards start **collapsed** (showing only the header bar with "✓ Correct"). Wrong-answer cards start **expanded** (showing full two-column review). This is intentional: the user's attention should go to their mistakes first. They can expand correct cards if they want to re-read the rationale.

```
CORRECT CARD (collapsed by default):
┌──────────────────────────────────────────────────────────┐
│ Q1 · Structural Design > Foundations     ✓ Correct    ▾  │
└──────────────────────────────────────────────────────────┘
  (tap ▾ to expand and see full question + rationale)

WRONG CARD (expanded by default):
┌──────────────────────────────────────────────────────────┐
│ Q2 · Building Laws > PD 1096            → Not quite   ▴  │
├──────────────────────────────────────────────────────────┤
│ [full two-column review content visible]                  │
└──────────────────────────────────────────────────────────┘
```

#### Section 4: Action CTAs (Bottom of Page)

| # | Element | Spec | Conditional |
|---|---|---|---|
| 12 | "Practice Missed Questions (3)" | **PRIMARY CTA** (Cobalt, full-width). Creates Focused Review with missed Qs. | If missed > 0 |
| 13 | "Start Day 15 →" | Secondary CTA (outlined). | Camp Mode only |
| 14 | "Back to Dashboard" | Ghost link. | Always |

**CTA priority changed:** "Practice Missed" is now PRIMARY (not "Review Your Answers" — because the review is already visible on the page). This nudges users toward the highest-value next action: re-practicing what they got wrong.

If zero questions were missed (perfect score), the primary CTA becomes:
- Camp Mode: "Start Day 15 →"
- Other modes: "Back to Dashboard" (promoted to primary)
- Plus a celebration line: "Perfect session. Every question correct. 🎯" (one-line, no confetti, no gamification — just honest acknowledgment)

### What This Replaces

| Old Frame | New Behavior |
|---|---|
| F-019 (Results Summary) | **Merged into** new F-019 Section 1 + Section 2 |
| F-020 (Separate Review Mode) | **Merged into** new F-019 Section 3 (inline question cards) |
| "Review Your Answers" CTA | **Deleted.** Review is already on the page. No tap needed. |

### Scroll Behavior

When the page loads:
1. Score hero (Section 1) is visible immediately
2. Count-up animation plays (1.5s)
3. After animation completes: page subtly auto-scrolls down 60px to show the top of Section 2 (breakdown + filters) — nudging the user to keep reading
4. User scrolls naturally through question cards
5. Sticky filter pills help navigate long sessions (50+ questions)
6. On mobile: cards are full-width, single-column (question stacks above options within each card)

### For Long Sessions (50+ Questions)

For Storm Mode (50Q), Extended (100Q), and Full Exam (200Q), loading all question cards at once would be slow. Use **virtualized rendering**:

- Render only the visible cards + 3 above/below buffer
- Use `react-window` or Intersection Observer for lazy loading
- Skeleton cards below the fold until scrolled into view
- Filter pills still work — they jump to the first matching card and trigger rendering

### Full Exam Simulation Exception (F-019B)

The Full Exam Sim (200Q, 24-hour delay) still shows F-019B first: "Your exam has been submitted. Results in 24 hours." When results become available 24 hours later, the notification deep-links to the **new F-019** with all 200 question cards ready for review.

---

## Updated Universal Flow Summary (Final)

With ALL four decisions applied:

```
F-001  Mode Selector (or skip via Camp Trail / Heatmap / deep link)
  ↓
F-003  Intro Slide 1: Session Briefing
  ↓
F-004  Intro Slide 2: Topic Picker (Subject/Focused/Custom only)
  ↓
F-005  Intro Slide 3: Advanced Config (Custom only)
  ↓
F-009  Loading Transition (500ms)
  ↓
F-010  Question Screen (two-column)
       User reads → taps option → SWIPES right to submit
  ↓
F-011  Feedback (immediate): annotated options + rationale in right column
       "Next →" (gated delay) — or "See Your Results →" on last question
  OR
F-012  Deferred toast (exam modes): "Answer recorded ✓" → auto-advance
  ↓
       [REPEAT for each question]
       [MICRO-BREAKS at intervals: F-013]
  ↓
F-018  Last Question: auto-submitted. No confirmation modal.
       Learning: last feedback → "See Your Results →"
       Exam: last toast → F-018B pre-submit review → "Finalize Exam →"
  ↓
F-009B Processing Buffer (500ms)
  ↓
F-019  ★ COMBINED RESULTS + REVIEW PAGE ★
       Section 1: Score hero (count-up, pass/fail, growth delta, Readiness Score)
       Section 2: Subject breakdown + filter pills (sticky)
       Section 3: Question-by-question review cards (two-column, inline)
                  — Wrong cards EXPANDED (study immediately)
                  — Correct cards COLLAPSED (expand if curious)
                  — Pro users see question history stats per card
       Section 4: "Practice Missed (N)" primary CTA + "Start Next Day" + "Dashboard"
  ↓
       [User studies their answers by scrolling]
       [User taps "Practice Missed" to re-do wrong questions]
       [User taps "Back to Dashboard" when done]
```

**Frames DELETED by this decision:**
- **F-020 (Separate Review Mode)** — merged into F-019
- **"Review Your Answers" CTA** — no longer needed

---

# COMPLETE SUMMARY OF ALL FRAME CHANGES (Decisions 1–4)

| Frame | Change | Description |
|---|---|---|
| F-002 | Modified | Remove "Discard" option. Add "Submit [N] Answers Now" instead. |
| F-003 | No change | Swipe is default — no preference toggle needed on intro screen. |
| F-010 | **Major** | Remove "Submit Answer" primary button. Add swipe gesture on selected option card. Add "Check Answer" ghost fallback. Add swipe affordance (chevron, shadow, confirmation strip). Add first-time tooltip. |
| F-010 bottom bar | Modified | Right button changes from "Submit Answer" (primary) to "Check Answer" (ghost). |
| F-011 | Modified | Card animates back from swipe exit, now showing annotated state. "Next Question →" on last question becomes "See Your Results →". |
| F-012 | Modified | Swipe triggers toast. On last question: toast says "Last question! ✓". |
| F-017 | Modified | Exit modal text: "Your [N] answered questions will be submitted" (not "saved"). No discard option. |
| F-018 | Simplified | No confirmation modal. Last answer → "See Your Results →" → processing → results. |
| F-018B | Modified | CTA: "Finalize Exam →" (not "Submit Exam"). No confirmation modal after. |
| F-018C | **Deleted** | Submit confirmation modal removed entirely. |
| F-019 | **Major rewrite** | Merged Results + Review into one scrollable page. Score hero at top → breakdown + sticky filters → inline two-column question review cards (wrong expanded, correct collapsed) → action CTAs at bottom. |
| F-020 | **Deleted** | Separate Review Mode no longer exists. Merged into F-019. |
| F-019 CTAs | **Modified** | Primary CTA is now "Practice Missed Questions (N)" (not "Review Your Answers" which no longer makes sense). |
