# SlateCamp Quiz Engine — Document 7: Accessibility & Testing Spec

> **Purpose:** Defines the complete accessibility contract (ARIA patterns, keyboard navigation, screen reader behavior, color contrast), plus the testing matrix for every flow. An AI reads this to implement accessibility correctly the first time, not as an afterthought.
>
> **Standard:** WCAG 2.1 Level AA (minimum). Level AAA for critical quiz interactions.
>
> **Companion docs:** Doc 1 (UX/UI Spec — visual specs), Doc 6 (Components — where to apply these patterns)

---

## 1. Semantic HTML Structure

### 1.1 Question Screen

```html
<!-- The quiz shell wraps the entire quiz experience -->
<main role="main" aria-label="Quiz session: Camp Mode, Question 8 of 20">

  <!-- Top bar -->
  <header role="banner">
    <button aria-label="Exit quiz session">✕ Exit</button>
    <div role="progressbar"
         aria-valuenow="8"
         aria-valuemin="1"
         aria-valuemax="20"
         aria-label="Progress: question 8 of 20">
      <!-- Visual progress bar -->
    </div>
    <span aria-hidden="true">8 / 20</span>  <!-- Redundant with progressbar -->

    <!-- Timer (exam modes only) -->
    <div role="timer" aria-live="off" aria-label="Time remaining: 3 hours 42 minutes">
      <span>3:42:15</span>
    </div>

    <button aria-label="Bookmark this question" aria-pressed="false">⚑</button>
    <button aria-label="Open question palette" aria-expanded="false">▦</button>
  </header>

  <!-- Two-column body -->
  <div class="quiz-body">

    <!-- LEFT COLUMN: Question -->
    <section aria-label="Question">
      <p class="breadcrumb" aria-label="Topic: Structural Design, Foundations">
        Structural Design › Foundations
      </p>

      <!-- Question heading — screen reader navigation landmark -->
      <h2 id="question-heading" tabindex="-1">
        Question 8
      </h2>

      <div id="question-stem" aria-describedby="question-heading">
        <p>According to the National Building Code of the Philippines (PD 1096),
           what is the minimum clear ceiling height for habitable rooms in
           residential buildings?</p>
      </div>

      <!-- Image (conditional) -->
      <figure>
        <img src="/diagram.png"
             alt="Cross-section diagram showing ceiling height measurement
                  from finished floor to lowest point of ceiling"
             role="img">
        <figcaption>Figure: Ceiling height measurement reference</figcaption>
      </figure>

      <!-- Confidence rating (conditional) -->
      <fieldset aria-label="Rate your confidence">
        <legend class="sr-only">How confident are you in your answer?</legend>
        <div role="radiogroup" aria-label="Confidence level">
          <label><input type="radio" name="confidence" value="1"> Guessing</label>
          <label><input type="radio" name="confidence" value="2"> Somewhat sure</label>
          <label><input type="radio" name="confidence" value="3"> Very sure</label>
        </div>
      </fieldset>
    </section>

    <!-- RIGHT COLUMN: Options -->
    <section aria-label="Answer options">
      <fieldset>
        <legend class="sr-only">
          Select your answer for Question 8: minimum ceiling height for habitable rooms
        </legend>

        <div role="radiogroup" aria-labelledby="question-heading">
          <!-- Each option is a radio button within the group -->
          <label class="option-row" for="opt-a">
            <input type="radio" id="opt-a" name="answer" value="opt-a-uuid"
                   aria-describedby="opt-a-text">
            <span class="letter" aria-hidden="true">A</span>
            <span id="opt-a-text">2.10 meters</span>
          </label>

          <label class="option-row" for="opt-b">
            <input type="radio" id="opt-b" name="answer" value="opt-b-uuid"
                   aria-describedby="opt-b-text">
            <span class="letter" aria-hidden="true">B</span>
            <span id="opt-b-text">2.40 meters</span>
          </label>

          <label class="option-row" for="opt-c">
            <input type="radio" id="opt-c" name="answer" value="opt-c-uuid"
                   aria-describedby="opt-c-text">
            <span class="letter" aria-hidden="true">C</span>
            <span id="opt-c-text">2.70 meters</span>
          </label>

          <label class="option-row" for="opt-d">
            <input type="radio" id="opt-d" name="answer" value="opt-d-uuid"
                   aria-describedby="opt-d-text">
            <span class="letter" aria-hidden="true">D</span>
            <span id="opt-d-text">3.00 meters</span>
          </label>
        </div>
      </fieldset>

      <button id="submit-btn"
              disabled
              aria-disabled="true"
              aria-label="Submit answer">
        Submit Answer
      </button>
    </section>

  </div>

  <!-- Feedback panel (injected after submission) -->
  <section aria-live="polite"
           aria-label="Answer feedback"
           role="status"
           id="feedback-panel">
    <!-- Content injected dynamically after submit -->
  </section>

</main>
```

### 1.2 Focus Management Rules

| Event | Focus Moves To | Method |
|---|---|---|
| New question loads | Question heading (`<h2>`) | `questionHeading.focus()` via `tabindex="-1"` |
| Answer submitted (immediate mode) | Feedback panel heading | `feedbackHeading.focus()` |
| Answer submitted (deferred mode) | Next question heading (auto-advance) | Same as new question |
| Next button clicked | New question heading | Same as new question |
| Palette opens | First cell in palette | `firstCell.focus()` |
| Palette closes | Return to previous focus (before palette opened) | Stored reference |
| Modal opens | First focusable element in modal | Focus trap |
| Modal closes | Return to trigger button | Stored reference |
| Wiki panel opens | Panel heading | `panelHeading.focus()` |
| Wiki panel closes | Wiki link that triggered it | Stored reference |

---

## 2. Keyboard Navigation Map

### 2.1 Global Shortcuts (Active During Quiz)

| Key | Action | Scope |
|---|---|---|
| `1`, `2`, `3`, `4` | Select option A, B, C, D | Answer selection |
| `Enter` or `Space` | Submit answer (if option selected) / Next question (if feedback visible) | Primary action |
| `Tab` | Move to next focusable element (standard) | Navigation |
| `Shift+Tab` | Move to previous focusable element | Navigation |
| `Escape` | Close palette / Close modal / Show exit confirmation | Dismiss |
| `F` | Toggle bookmark/flag on current question | Flagging (exam modes) |
| `P` | Toggle question palette | Palette (exam modes) |
| `T` | Announce time remaining (screen reader) | Timer (exam modes) |
| `←` | Previous question (if back allowed) | Navigation |
| `→` | Next question (if answered or skip allowed) | Navigation |
| `S` | Skip question (if skip enabled) | Navigation |

### 2.2 Within Answer Options (Radio Group)

| Key | Action |
|---|---|
| `↑` / `↓` | Move between options (within radiogroup) |
| `Space` | Select the focused option |
| `Tab` | Leave the radiogroup to the next focusable element |

### 2.3 Within Question Palette (Grid)

| Key | Action |
|---|---|
| `←` / `→` | Move between cells horizontally |
| `↑` / `↓` | Move between rows vertically |
| `Enter` | Jump to the selected question |
| `Escape` | Close palette |
| `Home` | Jump to first cell |
| `End` | Jump to last cell |

---

## 3. ARIA Live Regions

### 3.1 Feedback Announcement

```html
<!-- Container for feedback — always present, populated dynamically -->
<div id="feedback-announcer" aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- After correct answer: -->
  "Correct. The minimum ceiling height is 2.70 meters per PD 1096 Section 805."

  <!-- After wrong answer: -->
  "Not correct. You chose 2.40 meters. The correct answer is C, 2.70 meters.
   2.40 meters is the minimum for non-habitable rooms."

  <!-- After answer recorded (deferred mode): -->
  "Answer recorded. Moving to question 9."
</div>
```

### 3.2 Timer Warnings

```html
<!-- Timer announcement — assertive only for critical warnings -->
<div id="timer-announcer" aria-live="off" role="status">
  <!-- Routine updates: aria-live="off" — user checks manually with T key -->
</div>

<!-- Critical warnings: temporarily switch to assertive -->
<!-- At 5 minutes remaining: -->
<div role="alert" aria-live="assertive">
  "Warning: 5 minutes remaining."
</div>

<!-- At 1 minute remaining: -->
<div role="alert" aria-live="assertive">
  "Warning: 1 minute remaining."
</div>
```

### 3.3 Progress Updates

```html
<!-- Updated after each question advance -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  "Question 9 of 20. Topic: Structural Design, Foundations."
</div>
```

---

## 4. Color Contrast Compliance

### 4.1 Text Contrast (WCAG 2.1 SC 1.4.3)

| Element | Foreground | Background | Ratio | Passes |
|---|---|---|---|---|
| Question stem | #1A1A2E (charcoal) | #FFFFFF | 15.4:1 | ✓ AAA |
| Option text | #1A1A2E | #FFFFFF | 15.4:1 | ✓ AAA |
| Selected option text | #1B3FC4 (cobalt) | #E8EDFA (cobalt-light) | 4.8:1 | ✓ AA |
| Feedback correct | #1B3FC4 | #E8EDFA | 4.8:1 | ✓ AA |
| Feedback wrong heading | #92400E (amber-text) | #FEF9E7 (amber-bg) | 5.2:1 | ✓ AA |
| Feedback wrong body | #6B7280 (secondary) | #FEF9E7 | 4.6:1 | ✓ AA |
| Muted text (breadcrumb) | #9CA3AF (muted) | #FFFFFF | 3.0:1 | ✓ AA (large text only) |
| Timer text | #1B3FC4 | #FFFFFF | 7.2:1 | ✓ AAA |
| DM Mono labels (9px) | #9CA3AF | #FFFFFF | 3.0:1 | ⚠ Must be ≥ 14px bold for AA. At 9px, this is decorative — pair with accessible alternatives. |

### 4.2 Non-Text Contrast (WCAG 2.1 SC 1.4.11)

| Element | Colors | Ratio | Passes |
|---|---|---|---|
| Radio button border | #E5E7EB on #FFFFFF | 1.5:1 | ⚠ Needs darker border. Use #9CA3AF (3.0:1) |
| Selected radio fill | #1B3FC4 on #E8EDFA | 4.8:1 | ✓ |
| Progress bar fill | #1B3FC4 on #F3F4F6 | 6.5:1 | ✓ |
| Focus indicator | 2px solid #1B3FC4 on #FFFFFF | 7.2:1 | ✓ |
| Submit button | white text on #1B3FC4 | 7.2:1 | ✓ |
| Disabled button | #9CA3AF text on #F3F4F6 | 2.8:1 | ✓ (disabled state exempt from SC 1.4.11) |

### 4.3 Color Independence (WCAG 2.1 SC 1.4.1)

Color must NEVER be the sole indicator of meaning. Every color signal must be paired:

| Signal | Color | Required Pair |
|---|---|---|
| Correct answer | Cobalt Light bg | ✓ icon + "Correct" text label |
| Wrong answer | Amber bg | → icon + "Not quite" text + "← You chose" label |
| Flagged question (palette) | Orange fill | Flag icon overlay on cell |
| Answered question (palette) | Cobalt fill | Filled circle (vs hollow for unanswered) |
| Current question (palette) | Bold border | Bold ring + different border width |
| Skipped question (palette) | Dashed border | Dashed border pattern (not just color) |
| Timer warning | Amber text | "⚠" icon prefix + aria-live announcement |
| Mastery heatmap node | Red/Amber/Green/Grey | Text label always shown: "Needs review" / "Building" / "Mastered" / "Unexplored" |

---

## 5. Touch Target Compliance

### 5.1 Minimum Sizes (WCAG 2.5.8 / Apple HIG / Material Design)

| Element | Minimum Size | Actual Size | Passes |
|---|---|---|---|
| Answer option row | 44×44px | Full-width × 48px (desktop), 52px (mobile) | ✓ |
| Radio button (visual) | 44×44px | 18px visual, but entire row (full-width × 48px) is the tap target | ✓ |
| Submit/Next button | 44×44px | Full-width × 48px (desktop), 48px (mobile) | ✓ |
| Previous button | 44×44px | 90px × 44px | ✓ |
| Bookmark (⚑) | 44×44px | 44×44px | ✓ |
| Palette trigger (▦) | 44×44px | 44×44px | ✓ |
| Palette cell | 44×44px mobile | 36px desktop, 44px mobile | ✓ |
| Exit button (✕) | 44×44px | 44×44px | ✓ |
| Confidence pills | 44px height | 36px height — ⚠ INCREASE TO 44px on mobile | Fix required |
| Timer (tap to check) | 44×44px | 60px × 24px — ⚠ height below minimum | Wrap in 44px tap area |

### 5.2 Spacing Between Targets (WCAG 2.5.8)

Minimum 8px spacing between adjacent interactive elements. Critical areas:
- Between answer option rows: 10px gap (passes)
- Between Previous and Next buttons: 16px gap minimum (passes)
- Between palette cells: 4px gap (acceptable — cells are self-contained targets)

---

## 6. Screen Reader Testing Scripts

### 6.1 VoiceOver (iOS) Test Script

```
Test: Complete a 5-question Camp Mode session using VoiceOver only

Steps:
1. Navigate to Mode Selector
   Expected: "Quiz modes. Camp Mode button. Instant feedback, full explanations..."

2. Activate Camp Mode
   Expected: "Session setup. Today's session. Structural Systems. 20 questions.
              Approximately 15 minutes. Begin Session button."

3. Activate "Begin Session"
   Expected: Focus moves to first question heading.
              "Question 1. Topic: Structural Design, Foundations.
               [Full question stem read aloud]"

4. Navigate to answer options
   Expected: "Select your answer for Question 1. Radio group, 4 items.
              A, 2.10 meters, radio button, 1 of 4."

5. Select option C using down arrow + space
   Expected: "C, 2.70 meters, selected."

6. Navigate to and activate Submit
   Expected: "Submit answer, button."
   After activation: Focus moves to feedback.
   "Answer feedback. Correct. [Rationale text]"

7. Wait for Next button, activate
   Expected: "Next Question, button."
   After activation: "Question 2. Topic: [new topic]. [New question stem]"

8. Repeat through Q5, then activate "Finish Session"
   Expected: "Session complete. Your score. 4 out of 5. 80 percent. Passing.
              Review Your Answers button. Practice Missed Questions 1 button.
              Back to Dashboard link."
```

### 6.2 TalkBack (Android) Test Script

Same flow as VoiceOver but verify:
- Explore by touch works on answer option rows (entire row is the target)
- Double-tap selects options and activates buttons
- Swipe left/right navigates between elements in expected order
- Feedback panel announcement is heard after submission

### 6.3 Keyboard-Only Test Script

```
Test: Complete a Storm Mode session using keyboard only

Steps:
1. Tab to Storm Mode card, Enter to select
2. Tab through intro screen to "Start Storm", Enter
3. On question screen:
   - Tab reaches question heading (auto-focused)
   - Tab reaches radio group (options)
   - Arrow keys navigate between A/B/C/D
   - Space selects an option
   - Tab to Submit button
   - Enter submits
   - Tab reaches "Answer recorded" toast (auto-dismiss)
   - Focus returns to next question heading
4. Press F to flag a question (verify aria-pressed toggles)
5. Press P to open palette
   - Arrow keys navigate grid cells
   - Enter jumps to question
   - Escape closes palette
6. At final question: Tab to "Review & Submit"
7. On pre-submission review: Tab through grid, verify status announcements
8. Tab to "Submit Exam", Enter
9. Verify results page is reachable and all elements are keyboard-navigable
```

---

## 7. Testing Matrix

### 7.1 Functional Tests (Per Mode)

| Test Case | Camp | Chill | Subject | Focused | Custom | Storm | FullExam | Extended |
|---|---|---|---|---|---|---|---|---|
| Intro slide count correct | 1 | 1 | 2 | 2 | 3 | 1 | 1 | 1 |
| Question count adjustable | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (200) | ✓ |
| Timer hidden / visible | Hidden | Hidden | Hidden | Hidden | Config | Bar | Countdown | Countup |
| Immediate feedback shows | ✓ | ✓ | ✓ | ✓ | Config | ✗ | ✗ | ✓ |
| Deferred toast shows | ✗ | ✗ | ✗ | ✗ | Config | ✓ | ✓ | ✗ |
| Back navigation works | ✗ | ✓ | ✗ | ✗ | Config | ✓ | ✓ | ✗ |
| Skip button visible | ✗ | ✓ | ✗ | ✗ | Config | ✓ | ✓ | ✓ |
| Palette visible | ✗ | ✗ | ✗ | ✗ | Config | ✓ | ✓ | ✓ |
| Bookmark/flag works | ✗ | ✗ | ✗ | ✗ | Config | ✓ | ✓ | ✓ |
| Confidence rating visible | ✓ | ✗ | ✓ | ✓ | Config | ✗ | ✗ | ✗ |
| Gated Next button | 3s | 0s | 3s | 4s | Config | N/A | N/A | 2s |
| Micro-break prompt | ✗ | ✗ | ✗ | ✗ | ✗ | Q25 | Q50 | Q30 |
| Pre-submit review grid | ✗ | ✗ | ✗ | ✗ | Config | ✓ | ✓ | ✗ |
| Results immediate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (24h) | ✓ |
| Readiness Score updated | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Trail day completed | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 7.2 Edge Case Tests (All Modes)

| Test Case | Expected Behavior |
|---|---|
| Submit without selecting answer | Button disabled. No action. |
| Double-tap submit button | 200ms debounce. Only one submission processed. |
| Network drops mid-quiz | Amber "Offline" banner. Answers cached in IndexedDB. Quiz continues. |
| Network restores | Banner: "Back online. Syncing..." Auto-sync pending answers. Banner dismisses. |
| App backgrounded (learning mode) | Session pauses indefinitely. Resume on return. |
| App backgrounded (exam mode) | Timer pauses for 30 min max. Push notification at 25 min. Auto-submit at 30 min. |
| Browser tab closed mid-quiz | Session state saved. "Resume" banner on next visit within 24h/30min. |
| Question image fails to load | Show alt text in bordered container. "Image failed to load. Tap to retry." |
| Very long question stem (>500 chars) | Left column scrolls independently. Right column (options) stays in view. |
| Very long option text (>200 chars) | Option row expands vertically. Min-height maintained. |
| Screen reader active during timed exam | Timer does NOT announce every second. T key available for manual check. Critical warnings only at 5min/1min. |
| User resizes browser during quiz | Two-column layout maintained (≥768px). Reflows to single column below 768px. No content loss. |
| User zooms to 200% | All elements remain usable. Touch targets still ≥44px at zoomed size. No horizontal scrolling on options. |

### 7.3 Performance Tests

| Metric | Target | Measurement |
|---|---|---|
| Time to first question render | < 1 second | From "Begin Session" tap to Q1 visible |
| Time to next question render | < 200ms | From "Next" tap to new question visible |
| Feedback panel appear | < 300ms | From submit response to feedback visible |
| Palette open time | < 200ms | From palette button tap to grid visible |
| Answer submission round-trip | < 500ms | From submit tap to server response |
| Offline answer queue size | Handles 200 answers | Full exam can be completed entirely offline |
| Memory usage during 200Q session | < 100MB | No memory leaks from question cycling |
| Bundle size (quiz shell) | < 50KB gzipped | Core quiz shell chunk |

### 7.4 Device Testing Matrix

| Device | OS | Browser | Priority | Test Focus |
|---|---|---|---|---|
| Samsung Galaxy A15 | Android 14 | Chrome | **P0** (primary user device) | Performance, touch targets, offline |
| Realme C55 | Android 13 | Chrome | **P0** | Same as above — budget device |
| iPhone 13 | iOS 17 | Safari | **P1** | VoiceOver, Safe Area insets |
| iPad Air | iPadOS 17 | Safari | **P1** | Two-column layout at 768px breakpoint |
| Desktop (1440px) | Windows/Mac | Chrome | **P1** | Full two-column, keyboard nav |
| Desktop (1280px) | Windows/Mac | Firefox | **P2** | Narrow desktop layout |

**P0 = Must pass before any release. P1 = Must pass before public launch. P2 = Fix in v1.1.**

---

## 8. Accessibility Checklist (Pre-Ship Gate)

Every quiz engine release must pass ALL of these before shipping:

- [ ] All interactive elements have visible focus indicators (2px solid, 3:1 contrast)
- [ ] Tab order follows visual layout (left column → right column → bottom bar)
- [ ] All images have descriptive alt text
- [ ] Color is never the sole indicator (always paired with icon/text/shape)
- [ ] Text contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text + UI components
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Screen reader can complete a full 5-question session without sighted assistance
- [ ] Keyboard user can complete a full session without mouse/touch
- [ ] Timer warnings are announced via aria-live (only at critical thresholds)
- [ ] Focus is managed on question transitions (moves to heading, not lost)
- [ ] Palette grid supports arrow key navigation
- [ ] Modals trap focus and restore on close
- [ ] No auto-advancing content faster than 3 seconds (unless user-initiated)
- [ ] Reduced motion preference respected: disable all animations except functional transitions
- [ ] Language attribute set (`lang="en"`) on root element
