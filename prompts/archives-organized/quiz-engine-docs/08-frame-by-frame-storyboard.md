# SlateCamp Quiz Engine — Frame-by-Frame Storyboard

> **What this document is:** A shot-by-shot screenplay of the quiz engine. Every screen ("frame"), every button, every state transition, numbered sequentially. An AI reads this and knows exactly what to render at every moment.
>
> **How to read it:** Each frame is a screen the user sees. Frames are numbered `F-001`, `F-002`, etc. Within each frame, every UI element is listed. After each frame, the transitions to possible next frames are specified.
>
> **Rule:** All 8 modes share the SAME frame sequence. Differences are noted as conditional flags, not separate flows.

---

## TABLE OF CONTENTS

- **Part A:** Universal Frame Sequence (F-001 → F-025) — the shared spine all modes use
- **Part B:** Mode Configuration Table — what each mode turns on/off within the universal frames
- **Part C:** Per-Mode Entry Variations — specific tweaks to the intro for each mode
- **Part D:** Edge Case Frames — error states, offline, resume, abandon

---

# PART A: UNIVERSAL FRAME SEQUENCE

---

## F-001 · MODE SELECTOR

**When shown:** User navigates to `/quiz` or taps the ➕ FAB button or "Start a Quiz Session" from dashboard.
**Not shown when:** User enters via Camp Trail "Start Day X" (skips to F-003), Heatmap node tap (skips to F-003 with topic pre-filled), or "Practice Missed Questions" CTA (skips to F-003 with questions pre-loaded).

### Screen Layout
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Dashboard               CHOOSE YOUR MODE  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  LEARNING MODES                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │ 🏕 Camp  │ │ 😌 Chill │ │ 📚 Subj  │ │ 🎯 Focus││
│  │ Learn &  │ │ Browse   │ │ Deep     │ │ Target  ││
│  │ grow     │ │ freely   │ │ dive     │ │ weak    ││
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘│
│                                                      │
│  EXAM SIMULATION                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ ⚡ Storm │ │ 📝 Full  │ │ 🏋 Extend│            │
│  │ Timed    │ │ 200 Qs   │ │ Stamina  │            │
│  │ exam     │ │ real ALE │ │ training │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
│  YOUR WAY                                            │
│  ┌──────────┐                                       │
│  │ ⚙ Custom│                                       │
│  │ You      │                                       │
│  │ choose   │                                       │
│  └──────────┘                                       │
└─────────────────────────────────────────────────────┘
```

### Elements
| Element | Spec | Behavior |
|---|---|---|
| Back button (top-left) | "← Back to Dashboard" text link | Returns to dashboard |
| Page title (top-right) | "CHOOSE YOUR MODE" · DM Mono 9px uppercase | Static label |
| Section headers | "LEARNING MODES" / "EXAM SIMULATION" / "YOUR WAY" · DM Mono 9px uppercase, muted | Static labels |
| Mode cards (8 total) | 2×4 grid (desktop), 2×2 stacked (mobile). Each card: icon (24px emoji) + mode name (14px 500wt) + 1-line description (12px muted) | Tap → F-003 with mode pre-selected |
| Card hover state | Border: var(--border) → var(--cobalt). Shadow: sm → md | Visual feedback only |

### User Behavior
- **Anxious First-Taker:** Won't see this screen (enters via Camp Trail → F-003)
- **Retaker:** Scans quickly, taps Storm or Focused Review
- **Undergrad:** Browses, taps Chill Mode
- **Professional:** Won't see this (enters via Camp Trail → F-003)

### Transitions
| User Action | Next Frame |
|---|---|
| Taps any mode card | → **F-003** (Intro Slide 1) with `mode` param set |
| Taps "← Back" | → Dashboard (exit quiz flow) |

---

## F-002 · (RESERVED — Session Resume Banner)

**When shown:** User has an incomplete session. This is NOT a full frame — it's a banner on the Dashboard.

### Banner Content
```
┌─────────────────────────────────────────────────────┐
│ ⚡ You have an unfinished session                    │
│ Storm Mode · Structural Design · 32/50 answered      │
│ Started 2 hours ago                                  │
│ [Resume]  [Discard]                                  │
└─────────────────────────────────────────────────────┘
```

### Elements
| Element | Spec | Behavior |
|---|---|---|
| Banner | Card with amber left-border. Top of dashboard, above Readiness Score. | Persistent until resolved |
| Mode badge + topic + progress | DM Mono badges + Inter text | Info only |
| "Resume" button | Primary (Cobalt) | → **F-010** (Active Quiz) at last unanswered question |
| "Discard" button | Ghost (text only) | Confirmation modal: "Discard this session? Answered questions will still count." → If confirmed: end session with current answers, show F-019 Results |

---

## F-003 · INTRO SLIDE 1: SESSION BRIEFING

**When shown:** After mode selection (F-001) or direct entry (Camp Trail, Heatmap, deep link). This is the first frame every user sees before the quiz starts. **ALL 8 MODES show this frame.**

### Screen Layout
```
┌─────────────────────────────────────────────────────┐
│ ← Back                              CAMP MODE [badge]│
├─────────────────────────────────────────────────────┤
│                                                      │
│                    🏕                                │
│            (mode icon, 48×48)                        │
│                                                      │
│          SESSION BRIEFING (eyebrow)                  │
│                                                      │
│        Day 14 — Structural Systems                   │
│           (title, H3, Syne 700)                      │
│                                                      │
│     20 questions · Adaptive · Instant feedback        │
│         (summary line, 13px, muted)                  │
│                                                      │
│              ┌─────────────┐                         │
│              │  [ − ] 20 [ + ]  │                    │
│              └─────────────┘                         │
│              (question count stepper)                │
│                                                      │
│             Estimated: ~15 min                       │
│           (time estimate, 12px, muted)               │
│                                                      │
│   ┌───────────────────────────────────────┐         │
│   │         Begin Session →               │         │
│   └───────────────────────────────────────┘         │
│              (primary CTA, full-width)               │
│                                                      │
│             Change mode (ghost link)                 │
│                                                      │
│  ⓘ Submitting results will update your               │
│    Readiness Score                                   │
│         (info note, 11px, muted)                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Elements (Complete Inventory)
| # | Element | Spec | Behavior | Conditional |
|---|---|---|---|---|
| 1 | Back button (top-left) | "← Back" text link, 13px | Returns to F-001 (Mode Selector) or Dashboard | Always |
| 2 | Mode badge (top-right) | DM Mono 9px uppercase. "CAMP MODE" / "STORM MODE" etc. Badge color per mode. | Static label | Always |
| 3 | Mode icon | 48×48px, rounded-xl bg. Emoji: 🏕 Camp, 😌 Chill, 📚 Subject, 🎯 Focused, ⚙ Custom, ⚡ Storm, 📝 Full Exam, 🏋 Extended | Static | Always |
| 4 | Eyebrow label | "SESSION BRIEFING" (most modes) or "TODAY'S SESSION" (Camp) or "PROOF SIMULATION" (Full Exam) | DM Mono 9px uppercase, muted | Varies by mode |
| 5 | Session title | Camp: "Day 14 — Structural Systems". Subject: "[Subject Name]". Storm: "Storm Mode". Full Exam: "Full ALE Simulation". Others: "[Mode Name]" | H3, Syne 700, 20px | Always |
| 6 | Summary line | "[count] questions · [difficulty] · [feedback type]" | 13px Inter, muted. Dynamically computed from config. | Always |
| 7 | Question count stepper | ± buttons (40×40px circles, secondary style) + count display (DM Mono 28px, center) | Tap ±: increment/decrement. Step size per mode (see Part B). Min/max per mode. | Hidden if count is locked (Full Exam = always 200) |
| 8 | Time estimate | "Estimated: ~[X] min" | Computed: count × 45s (learning) or count × 72s (exam). Updates when count changes. 12px, muted. | Always |
| 9 | "Begin Session →" CTA | Full-width, 48px height, Cobalt bg, white text, 500 weight | Tap → F-004 (if Slide 2 needed) or F-009 (loading) → F-010 (quiz). 200ms delay before enabled after page load. | Always |
| 10 | "Change mode" link | Ghost text link, 12px, centered below CTA | Tap → F-001 (Mode Selector) | Hidden if entered via Camp Trail (mode is non-negotiable) |
| 11 | Readiness Score reminder | "ⓘ Submitting results will update your Readiness Score" | 11px, muted, info icon prefix. Bottom of screen. | Hidden in Chill Mode (Chill doesn't affect Readiness Score) |
| 12 | Environmental checklist (Full Exam only) | "Make sure you have: ☐ Quiet space ☐ 4–5 hours ☐ Charged device ☐ Water" | Checklist items, 12px. Visual only (not interactive checkboxes). | Full Exam Sim only |
| 13 | "No feedback during exam" warning (Storm, Full Exam) | Amber bg card: "You won't see feedback until the exam is over." | 12px, amber-text color | Storm + Full Exam only |

### User Behavior by Persona
| Persona | Time on screen | What they do |
|---|---|---|
| Anxious First-Taker | 5–8 sec | Reads everything. Checks time estimate. Feels reassured by "~15 min". Taps Begin. |
| Retaker | 3–5 sec | Glances at topic. Adjusts count ±5 if desired. Taps Begin quickly. |
| Undergrad | 2–3 sec | Barely reads. Taps Begin or "Let's Go" immediately. |
| Professional | 5–10 sec | Reads time estimate carefully. If >30 min and they don't have time → exits. If fits → taps Begin. |

### Transitions
| User Action | Next Frame |
|---|---|
| Taps "Begin Session →" | → **F-004** if mode needs topic picker (Subject, Focused, Custom) |
| Taps "Begin Session →" | → **F-009** loading → **F-010** active quiz (if mode skips topic picker: Camp, Chill, Storm, Full Exam, Extended) |
| Taps "← Back" | → **F-001** or Dashboard |
| Taps "Change mode" | → **F-001** |

---

## F-004 · INTRO SLIDE 2: TOPIC PICKER

**When shown:** Subject Mode, Focused Review, Custom Session ONLY. Other modes skip this frame.

### Screen Layout
```
┌─────────────────────────────────────────────────────┐
│ ← Back                             STEP 2 OF 2      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  CHOOSE YOUR FOCUS (eyebrow)                         │
│  Which subjects? (H4)                                │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ● Structural Design            48%      ▾  │    │  ← Selected, expanded
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │   │Found. ✓  │ │Beam Des. │ │Columns ✓ │  │    │  ← Topic chips
│  │   └──────────┘ └──────────┘ └──────────┘  │    │
│  │   ┌──────────┐                             │    │
│  │   │Slabs     │                             │    │
│  │   └──────────┘                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ● Building Laws                72%      ▸  │    │  ← Not expanded
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ○ Utilities                    31%      ▸  │    │  ← Not selected
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ○ History of Architecture       —       ▸  │    │  ← Unexplored (grey dot)
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌───────────────────────────────────────┐          │
│  │   Continue with 2 subjects →          │          │
│  └───────────────────────────────────────┘          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Elements
| # | Element | Spec | Behavior | Conditional |
|---|---|---|---|---|
| 1 | Back button | "← Back" | Returns to F-003 | Always |
| 2 | Step indicator | "STEP 2 OF 2" (Subject/Focused) or "STEP 2 OF 3" (Custom) | DM Mono 10px, muted | Always |
| 3 | Eyebrow + title | "CHOOSE YOUR FOCUS" + "Which subjects?" | DM Mono 9px + H4 Inter 600 | Always |
| 4 | Subject rows (6 max) | Each: mastery dot (8px, color-coded) + subject name (14px 500wt) + mastery % (DM Mono 12px muted) + expand chevron (▸/▾) | Tap row → expand to show topic chips. Tap again → collapse. | Always |
| 5 | Mastery dots | 8px circle. Unexplored: grey #9CA3AF. <40%: (neutral indicator). 40-69%: amber #F5A623. ≥70%: green #1B7A3C | Color + text (% visible) | Always |
| 6 | Topic chips (inside expanded subject) | Pill shape. Selected: Cobalt Light bg + Cobalt text + "✓". Unselected: Cream bg + secondary text. | Tap → toggle selection. | Visible when subject row is expanded |
| 7 | Selection behavior | Subject Mode: SINGLE select (one subject only, tapping another deselects first). Custom: MULTI select. Focused Review: weakest topics PRE-SELECTED by Blindspot Protocol. | Subject vs Custom behavior | Varies by mode |
| 8 | CTA button | "Continue with [N] subjects →" or "Continue with [Topic Name] →" | Dynamic text. Full-width, Cobalt, 48px. Disabled if nothing selected. | Always |

### Pre-Selection Rules (Focused Review)
- Blindspot Protocol queries `blindspot_queues` for user's top 5 weakest topics
- Those topics are PRE-SELECTED (chips show ✓) when screen loads
- User CAN deselect them and select different ones
- CTA shows pre-selected count: "Continue with 5 focus topics →"

### Transitions
| User Action | Next Frame |
|---|---|
| Taps "Continue →" (Subject/Focused) | → **F-009** loading → **F-010** active quiz |
| Taps "Continue →" (Custom) | → **F-005** (Advanced Config, Slide 3) |
| Taps "← Back" | → **F-003** |

---

## F-005 · INTRO SLIDE 3: ADVANCED CONFIGURATION

**When shown:** Custom Session ONLY. All other modes skip.

### Screen Layout
```
┌─────────────────────────────────────────────────────┐
│ ← Back                             STEP 3 OF 3      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  CONFIGURE SESSION (eyebrow)                         │
│  Your settings (H4)                                  │
│                                                      │
│  Instant feedback               ┌──●─┐  ON          │
│  See explanations after each    └────┘               │
│                                                      │
│  Timer                          ┌─●──┐  OFF         │
│  Show countdown timer           └────┘               │
│                                                      │
│  Free navigation                ┌─●──┐  OFF         │
│  Go back to previous questions  └────┘               │
│                                                      │
│  Question palette               ┌─●──┐  OFF         │
│  Jump to any question           └────┘               │
│                                                      │
│  Difficulty                                          │
│  ┌──────┐ ┌────┐ ┌──────┐ ┌────┐                   │
│  │Mixed●│ │Easy│ │Medium│ │Hard│                     │
│  └──────┘ └────┘ └──────┘ └────┘                    │
│                                                      │
│  ── Quick presets ──                                 │
│  [Use Camp settings] [Use Storm settings]            │
│                                                      │
│  ┌───────────────────────────────────────┐          │
│  │     Begin Custom Session →            │          │
│  └───────────────────────────────────────┘          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Elements
| # | Element | Spec | Behavior |
|---|---|---|---|
| 1 | Toggle switches (×4) | 44×24px. ON: Cobalt fill, knob right. OFF: grey fill, knob left. | Tap → toggle. Both label and switch are tap targets. |
| 2 | Toggle labels | Primary: 13px 500wt. Description: 12px muted. | Static text |
| 3 | Difficulty pills | Horizontal group. Selected: Cobalt Light bg + Cobalt text. Unselected: Cream bg. | Single-select. "Mixed" is default. |
| 4 | Preset shortcuts | "Use Camp settings" / "Use Storm settings" · Ghost buttons | Tap → auto-fills all toggles to match that mode's defaults. Instant, no confirmation. |
| 5 | "Begin Custom Session →" | Full-width, Cobalt, 48px | → F-009 loading → F-010 active quiz |

### Transitions
| User Action | Next Frame |
|---|---|
| Taps "Begin Custom Session →" | → **F-009** → **F-010** |
| Taps "← Back" | → **F-004** |

---

## F-009 · LOADING TRANSITION

**When shown:** After tapping "Begin Session" (from F-003, F-004, or F-005). Always shown. Duration: 500–1000ms.

### Screen Content
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│               ┌──────────────┐                       │
│               │  SlateCamp   │                       │
│               │  logo mark   │                       │
│               └──────────────┘                       │
│                                                      │
│            Loading your session...                    │
│              (14px, muted, Inter)                     │
│                                                      │
│           ━━━━━━━━━━░░░░░░░░░░                      │
│           (thin progress bar, indeterminate)          │
│                                                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### What happens during this frame
1. Client calls `startSession` Server Action
2. Server merges config, selects questions, creates DB rows
3. Server returns session data
4. Client initializes Zustand store
5. Skeleton of two-column layout fades in
6. First question content appears via 300ms opacity transition

### Transitions
| Event | Next Frame |
|---|---|
| Session data loaded successfully | → **F-010** (first question) |
| Server error | → **F-E01** (error state: "Couldn't start session. Try again.") |
| Network timeout (>5s) | → **F-E02** (offline state: "Check your connection.") |

---

## F-010 · ACTIVE QUIZ: QUESTION (UNANSWERED STATE)

**This is the core frame. Every question starts here.** The layout is the immutable two-column (desktop) or stacked (mobile) layout.

### Screen Layout (Desktop Two-Column)
```
┌─────────────────────────────────────────────────────────────────┐
│ ✕ Exit │ ━━━━━░░░░ │ 1/20 │ [CAMP MODE] │ [14:32] │ ⚑ │ ▦   │  ← Header
├───────────────────────────────┬─────────────────────────────────┤
│                               │                                 │
│  STRUCTURAL DESIGN > FOUND.   │  SELECT YOUR ANSWER (eyebrow)  │
│  (topic breadcrumb)           │                                 │
│                               │  ┌─────────────────────────┐   │
│  Question 1  (DM Mono, cobalt)│  │ ○  A  2.10 meters       │   │
│                               │  └─────────────────────────┘   │
│  According to the National    │  ┌─────────────────────────┐   │
│  Building Code of the         │  │ ○  B  2.40 meters       │   │
│  Philippines (PD 1096),       │  └─────────────────────────┘   │
│  what is the minimum clear    │  ┌─────────────────────────┐   │
│  ceiling height for habitable │  │ ○  C  2.70 meters       │   │
│  rooms in residential         │  └─────────────────────────┘   │
│  buildings?                   │  ┌─────────────────────────┐   │
│                               │  │ ○  D  3.00 meters       │   │
│  ┌───────────────────────┐   │  └─────────────────────────┘   │
│  │ [Image/diagram area]  │   │                                 │
│  │ (if applicable)       │   │  ─────────────────────────────  │
│  └───────────────────────┘   │  [← Previous]    [Submit Answer]│
│                               │  (ghost)         (DISABLED/grey)│
│  ── How confident are you? ── │                                 │
│  [Guessing] [Somewhat] [Sure] │                                 │
│                               │                                 │
├───────────────────────────────┴─────────────────────────────────┤
│ [← Previous]              Q 1 of 20              [Submit Answer]│  ← Footer
└─────────────────────────────────────────────────────────────────┘
```

### Header Elements
| # | Element | Spec | Conditional |
|---|---|---|---|
| 1 | Exit button (✕) | "✕ Exit" text, 13px, muted. 44×44px tap target. | Always |
| 2 | Progress bar | 4px height, Cobalt fill on grey track. Width = currentIndex/totalQuestions. | Always |
| 3 | Fraction | "1/20" · DM Mono 11px muted | Always |
| 4 | Mode badge | "CAMP MODE" · DM Mono 8px uppercase, badge-blue | Always |
| 5 | Timer | "14:32" · DM Mono 11px. Hidden/Bar/Countdown/Countup per config. | Per config.timer.visible |
| 6 | Bookmark (⚑) | 44×44px. Unpressed: muted. Pressed: orange fill. | Per config.navigation.bookmarkEnabled |
| 7 | Palette (▦) | 44×44px. Muted. | Per config.navigation.questionPalette |

### Left Column Elements
| # | Element | Spec | Conditional |
|---|---|---|---|
| 8 | Topic breadcrumb | "STRUCTURAL DESIGN > FOUNDATIONS" · DM Mono 9px uppercase muted | Always |
| 9 | Question number | "Question 1" · DM Mono 11px, Cobalt, 500wt | Always |
| 10 | Question stem | The question text · Inter 15px, 400wt, line-height 1.8 | Always |
| 11 | Image/diagram | Below stem. Max-height 280px. Rounded corners. Tap-to-zoom. | Only if question has image |
| 12 | Confidence rating | "How confident are you?" eyebrow + [Guessing] [Somewhat sure] [Very sure] pills | Per config.feedback.showConfidenceRating |

### Right Column Elements
| # | Element | Spec | Conditional |
|---|---|---|---|
| 13 | Options header | "SELECT YOUR ANSWER" · DM Mono 9px uppercase muted | Always |
| 14 | Option A row | Full-width, 48px min-height. Radio (18px circle) + letter (DM Mono 11px) + text (Inter 13px) | Always |
| 15 | Option B row | Same | Always |
| 16 | Option C row | Same | Always |
| 17 | Option D row | Same | Always |
| 18 | Submit button | "Submit Answer" · Cobalt bg, white text. **DISABLED (grey) until an option is selected.** | Always |
| 19 | Previous button | "← Previous" · Ghost style. | Per config.navigation.backAllowed AND currentIndex > 0 |
| 20 | Skip button | "Skip →" · Ghost style. Appears INSTEAD of Submit when no option selected and skip is enabled. | Per config.navigation.skipEnabled |

### Footer (Mobile Persistent)
| # | Element | Spec |
|---|---|---|
| 21 | Previous button | Same as #19 |
| 22 | Fraction center | "Q 1 of 20" · DM Mono 11px muted. On palette-enabled modes: tappable → opens F-015 palette. |
| 23 | Submit/Next button | Same as #18 |

### State: Option Selected (Pre-Submit)
When user taps an option:
- Selected option: border → Cobalt, bg → Cobalt Light, radio fills with Cobalt dot
- Other options: unchanged (still tappable — user can change their mind)
- Submit button: ENABLED (grey → Cobalt)
- Skip button: hidden (replaced by Submit)

### Transitions from F-010
| User Action | Next Frame |
|---|---|
| Taps option (A/B/C/D) | Stay on F-010 with selection state updated |
| Taps "Submit Answer" | → **F-011** (immediate feedback) or **F-012** (deferred toast) based on config.feedback.timing |
| Taps "Skip →" | → **F-010** for next question (current marked as skipped) |
| Taps "← Previous" | → **F-010** for previous question (previous answer preserved) |
| Taps ⚑ bookmark | Toggle flag state (visual only, no frame change) |
| Taps ▦ palette | → **F-015** (palette overlay) |
| Taps ✕ exit | → **F-017** (exit confirmation modal) |
| Taps image | → **F-016** (image zoom overlay) |

---

## F-011 · ACTIVE QUIZ: FEEDBACK (IMMEDIATE MODE)

**When shown:** After submission in modes with `config.feedback.timing === 'immediate'` (Camp, Chill, Subject, Focused, Extended, Custom-if-configured).

**Layout change:** LEFT column stays EXACTLY the same (question still visible). RIGHT column transitions: options become annotated + feedback panel slides in below.

### Right Column After Submission (Correct Answer)
```
│  YOUR ANSWER (eyebrow changes)                       │
│                                                      │
│  ┌─────────────────────────────────────┐ dimmed     │
│  │ ○  A  2.10 meters                  │             │
│  └─────────────────────────────────────┘             │
│  ┌─────────────────────────────────────┐ dimmed     │
│  │ ○  B  2.40 meters                  │             │
│  └─────────────────────────────────────┘             │
│  ┌─────────────────────────────────────┐ COBALT ✓   │
│  │ ●  C  2.70 meters     ✓ Correct    │             │
│  └─────────────────────────────────────┘             │
│  ┌─────────────────────────────────────┐ dimmed     │
│  │ ○  D  3.00 meters                  │             │
│  └─────────────────────────────────────┘             │
│                                                      │
│  ┌─ FEEDBACK ──────────────────────────┐             │
│  │ ✓ Correct — nice work               │            │
│  │                                      │            │
│  │ The minimum ceiling height for       │            │
│  │ habitable rooms is 2.70m per         │            │
│  │ PD 1096, Rule VII, Section 805.      │            │
│  │                                      │            │
│  │ 📖 Read more in Wiki →              │            │
│  └──────────────────────────────────────┘            │
│                                                      │
│  ─────────────────────────────────────────           │
│                           [Next Question →]          │
│                      (appears after gated delay)     │
```

### Right Column After Submission (Wrong Answer)
```
│  YOUR ANSWER (eyebrow)                               │
│                                                      │
│  ┌─────────────────────────────────────┐ dimmed     │
│  │ ○  A  2.10 meters                  │             │
│  └─────────────────────────────────────┘             │
│  ┌─────────────────────────────────────┐ AMBER ←    │
│  │ ○  B  2.40 meters    ← You chose   │             │
│  └─────────────────────────────────────┘             │
│  ┌─────────────────────────────────────┐ COBALT ✓   │
│  │ ●  C  2.70 meters     ✓ Correct    │             │
│  └─────────────────────────────────────┘             │
│  ┌─────────────────────────────────────┐ dimmed     │
│  │ ○  D  3.00 meters                  │             │
│  └─────────────────────────────────────┘             │
│                                                      │
│  ┌─ FEEDBACK (amber bg) ──────────────┐             │
│  │ → Not quite — let's look at this    │            │
│  │                                      │            │
│  │ You chose 2.40m — this is the       │            │
│  │ minimum for non-habitable rooms.     │            │
│  │ Habitable rooms require 2.70m per    │            │
│  │ PD 1096 Section 805.                 │            │
│  │                                      │            │
│  │ 📖 PD 1096 Rule VII in Wiki →       │            │
│  └──────────────────────────────────────┘            │
│                                                      │
│                           [Next Question →]          │
```

### Option Annotation Rules
| State | Border | Background | Label | Opacity |
|---|---|---|---|---|
| Correct answer (user chose it) | Cobalt | Cobalt Light | "✓ Correct" | 100% |
| Correct answer (user didn't choose it) | Cobalt | Cobalt Light | "✓ Correct" | 100% |
| User's wrong choice | Amber (#F5A623) | Amber bg (#FEF9E7) | "← You chose" | 100% |
| Other wrong options | Default border | Default bg | None | 50% opacity |

### Feedback Panel Variants
| Outcome | Background | Icon | Heading |
|---|---|---|---|
| Correct | Cobalt Light (#E8EDFA) | ✓ | "Correct — nice work" |
| Wrong | Amber (#FEF9E7) | → | "Not quite — let's look at this" |

### Gated "Next" Button
| Mode | Delay before "Next Question →" appears |
|---|---|
| Camp Mode | 3000ms |
| Chill Mode | 0ms (immediate) |
| Subject Mode | 3000ms |
| Focused Review | 4000ms (longer — deeper reading needed) |
| Extended Practice | 2000ms (shorter — momentum priority) |
| Custom | config.feedback.gatedProgressionDelayMs |

The button fades in via 200ms opacity transition. No visible countdown — it simply materializes.

### Transitions from F-011
| User Action | Next Frame |
|---|---|
| Taps "Next Question →" | → **F-010** for next question (or **F-018** if last question) |
| Taps "📖 Wiki →" link | → **F-016B** (Wiki slide-over panel, quiz preserved underneath) |

---

## F-012 · ACTIVE QUIZ: DEFERRED TOAST

**When shown:** After submission in modes with `config.feedback.timing === 'deferred'` (Storm, Full Exam, Custom-if-configured).

### Behavior
- A toast appears centered in the right column: "✓ Answer recorded" (Cream bg pill, 13px)
- Toast auto-dismisses after 1500ms
- Auto-advances to next question (F-010) after toast dismisses
- OR user navigates freely (Storm/Full Exam have free navigation)

### Transitions from F-012
| Event | Next Frame |
|---|---|
| Toast auto-dismisses (1.5s) | → **F-010** for next question |
| User taps elsewhere / navigates | → **F-010** for that question |

---

## F-013 · MICRO-BREAK OVERLAY

**When shown:** At configurable question intervals (Storm: Q25, Extended: Q30, Full Exam: Q50).

### Screen Content
```
┌─────────────────────────────────────────────────────┐
│            (quiz shell visible underneath,            │
│             dimmed at 30% opacity)                    │
│                                                      │
│       ┌────────────────────────────────┐            │
│       │                                │            │
│       │    🏔                          │            │
│       │                                │            │
│       │    Halfway there.              │            │
│       │    25 of 50 questions done.    │            │
│       │                                │            │
│       │    Take a breath.              │            │
│       │    Stand and stretch.          │            │
│       │                                │            │
│       │        ◯ 0:28                  │            │
│       │     (rest countdown)           │            │
│       │                                │            │
│       │    [Continue →]                │            │
│       │                                │            │
│       └────────────────────────────────┘            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Elements
| # | Element | Spec | Behavior |
|---|---|---|---|
| 1 | Backdrop | Quiz shell at 30% opacity. Dark overlay. | Shows quiz is paused, not lost. |
| 2 | Break card | Centered, 400px max-width, white bg, rounded-xl, shadow-lg | Focus trap inside card |
| 3 | Icon | Small illustration or emoji. Contextual: 🏔 halfway, 🌊 quarter, 💪 three-quarter | Static |
| 4 | Message | "[X] of [Y] questions done. Take a breath." · 14px Inter | Dynamic based on progress |
| 5 | Rest countdown | 30-second countdown in circle. DM Mono 16px. | Counts down from 30 to 0. Auto-continues when reaches 0. |
| 6 | "Continue →" | Primary button. Available immediately (user doesn't have to wait). | → F-010 next question |

### Transitions
| User Action | Next Frame |
|---|---|
| Taps "Continue →" | → **F-010** next question |
| Rest timer reaches 0 | → **F-010** next question (auto) |
| Taps backdrop | → **F-010** next question (dismiss) |

---

## F-015 · QUESTION PALETTE

**When shown:** User taps ▦ palette trigger. Available in Storm, Full Exam, Extended, Custom-if-configured.

**Desktop:** Right sidebar slides in (260px width, pushes content). **Mobile:** Bottom sheet slides up (half-height, swipe for full).

### Layout
```
┌──────────────────────────┐
│ Questions        32/50   │
├──────────────────────────┤
│ [All] [Unanswered] [⚑]  │
├──────────────────────────┤
│ ■ ■ ■ ■ ■ ◆ ■ ☐ ☐ ☐   │  Row 1 (Q1-Q10)
│ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐   │  Row 2 (Q11-Q20)
│ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐   │  Row 3 (Q21-Q30)
│ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐   │  Row 4 (Q31-Q40)
│ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐   │  Row 5 (Q41-Q50)
├──────────────────────────┤
│ ■ Answered  ☐ Open       │
│ ◆ Flagged   ◻ Current    │
└──────────────────────────┘
```

### Cell States
| State | Visual | Tap Action |
|---|---|---|
| Answered | Cobalt fill, white number | Jump to that question (F-010) |
| Unanswered | Grey border, grey number | Jump to that question (F-010) |
| Current | Bold Cobalt border, no fill | Already on this question |
| Flagged | Orange fill, white number, flag icon | Jump to that question (F-010) |
| Skipped | Dashed grey border | Jump to that question (F-010) |

---

## F-017 · EXIT CONFIRMATION MODAL

**When shown:** User taps ✕ exit during active quiz.

### Learning Modes
```
┌──────────────────────────────┐
│                              │
│   End this session?          │
│                              │
│   You've answered 12 of 20   │
│   questions. Your progress   │
│   is saved.                  │
│                              │
│   [End & See Results]        │  ← Primary (Cobalt)
│   [Keep Going]               │  ← Ghost
│                              │
└──────────────────────────────┘
```

### Exam Modes
```
┌──────────────────────────────┐
│                              │
│   Leave this exam?           │
│                              │
│   Your timer will pause for  │
│   30 minutes. After that,    │
│   the exam auto-submits.     │
│                              │
│   [Continue Exam]            │  ← Primary (Cobalt) — nudge to stay
│   [Pause & Leave]            │  ← Secondary (outlined)
│                              │
└──────────────────────────────┘
```

### Transitions
| User Action | Next Frame |
|---|---|
| Taps "End & See Results" | → **F-019** (Results, with only answered questions scored) |
| Taps "Keep Going" / "Continue Exam" | → **F-010** (resume at current question) |
| Taps "Pause & Leave" | → Dashboard (session paused, F-002 banner appears on next visit) |

---

## F-018 · LAST QUESTION SIGNAL

**Not a separate frame** — it's a state change on F-010/F-011 for the final question.

### Changes on Last Question
| Element | Normal State | Last Question State |
|---|---|---|
| Submit button text | "Submit Answer" | "Submit Answer" (unchanged) |
| After submission: Next button (learning) | "Next Question →" | **"Finish Session →"** (Camp Orange accent) |
| After submission: Next button (exam) | Auto-advance | "Review & Submit →" → **F-018B** Pre-Submit Review |

---

## F-018B · PRE-SUBMISSION REVIEW (EXAM MODES ONLY)

**When shown:** User taps "Review & Submit →" after the last question in Storm, Full Exam, Extended.

### Layout
Same as F-015 palette but full-screen with summary stats and submit actions.

```
┌─────────────────────────────────────────────────────┐
│                Review Your Answers                   │
│            48 answered · 2 unanswered · 3 flagged    │
├─────────────────────────────────────────────────────┤
│  [All] [Unanswered (2)] [Flagged (3)]               │
│                                                      │
│  ■ ■ ■ ■ ■ ◆ ■ ■ ■ ■  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│  ■ ■ ■ ◆ ■ ■ ■ ■ ■ ■  ■ ■ ■ ■ ■ ■ ■ ■ ☐ ☐      │
│  ■ ■ ◆ ■ ■ ■ ■ ■ ■ ■  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■      │
│                                                      │
│  ⚠ Full Exam: "Once submitted, results in 24 hours" │
│                                                      │
│  [Submit Exam]                  [Keep Reviewing]     │
└─────────────────────────────────────────────────────┘
```

### Transitions
| User Action | Next Frame |
|---|---|
| Taps any grid cell | → **F-010** at that question (can change answer, then return here) |
| Taps "Submit Exam" | → **F-018C** Submit Confirmation → **F-009B** Processing → **F-019** Results |
| Taps "Keep Reviewing" | → **F-010** at first unanswered or flagged question |

---

## F-019 · RESULTS SUMMARY

**When shown:** After session completion (learning modes) or after submission (exam modes, except Full Exam which shows F-019B).

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Session Complete                               ✕    │
├─────────────────────────────────────────────────────┤
│                                                      │
│            YOUR SCORE (eyebrow)                      │
│                                                      │
│               17/20                                  │
│           (DM Mono 56px, Cobalt, count-up)           │
│                                                      │
│           85% — Passing                              │
│           ▲ +8% from last time                       │
│                                                      │
│  ┌─ PERFORMANCE BREAKDOWN ────────────────┐         │
│  │ Structural Systems        8/10  ━━━━━░ │         │
│  │ Building Laws             5/6   ━━━━━░ │         │
│  │ Utilities                 4/4   ━━━━━━ │         │
│  └────────────────────────────────────────┘         │
│                                                      │
│  ┌─ READINESS SCORE ─────────────────────┐          │
│  │     72  ▲ +2 from this session        │          │
│  └───────────────────────────────────────┘          │
│                                                      │
│  ┌───────────────────────────────────────┐          │
│  │       Review Your Answers             │ PRIMARY  │
│  └───────────────────────────────────────┘          │
│  ┌───────────────────────────────────────┐          │
│  │    Practice Missed Questions (3)      │ SECOND.  │
│  └───────────────────────────────────────┘          │
│           Back to Dashboard (ghost)                  │
│                                                      │
│  Camp Mode only:                                     │
│  ┌─ DAY 15 UNLOCKED ────────────────────┐          │
│  │ Building Laws — Accessibility (BP 344)│          │
│  │ [Start Day 15 →]                      │          │
│  └───────────────────────────────────────┘          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Elements (Complete)
| # | Element | Spec | Conditional |
|---|---|---|---|
| 1 | Score number | DM Mono 56px, Cobalt. Count-up animation 0→17 over 1.5s. "/20" at 28px muted. | Always |
| 2 | Pass/fail label | ≥70%: "Passing" Signal Green text. 50-69%: "Building" neutral. <50%: "Needs review" neutral. | Always |
| 3 | Growth delta | "▲ +8% from last time" — green arrow for up, neutral for flat, "−3% — let's focus here" for down. | Only if historical data exists for same topics |
| 4 | Subject breakdown | Cream card. Each subject: name + fraction + Cobalt progress bar. Sorted weakest-first. | Always (except Chill shows minimal version) |
| 5 | Readiness Score card | Cobalt Light card. Score (DM Mono 28px) + delta. | All modes except Chill |
| 6 | Stamina chart | Accuracy over time (25-Q blocks). Line chart. | Only if session ≥50 questions |
| 7 | "Review Your Answers" | Primary CTA, full-width, Cobalt, 48px | Always |
| 8 | "Practice Missed (N)" | Secondary CTA, outlined. Shows missed count. Hidden if 0 missed. | If missed > 0 |
| 9 | "Back to Dashboard" | Ghost link | Always |
| 10 | Trail Day Unlocked card | Shows next day topic + "Start Day X+1 →" CTA | Camp Mode only |

### Transitions from F-019
| User Action | Next Frame |
|---|---|
| Taps "Review Your Answers" | → **F-020** (Review Mode) |
| Taps "Practice Missed Questions (3)" | → **F-003** (Intro Slide 1 for Focused Review, pre-loaded with missed Qs) |
| Taps "Start Day 15 →" | → **F-003** (Intro Slide 1 for Camp Mode, Day 15) |
| Taps "Back to Dashboard" | → Dashboard |
| Taps ✕ | → Dashboard |

---

## F-019B · FULL EXAM SUBMISSION CONFIRMATION

**When shown:** Full Exam Sim only, instead of F-019 (results delayed 24 hours).

### Layout
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                    ✓                                 │
│                                                      │
│     Your Proof Simulation has been submitted.        │
│                                                      │
│     Results will be available in 24 hours.           │
│     We'll send a notification.                       │
│                                                      │
│     Take a breath. You just sat through              │
│     200 questions. That takes real endurance.         │
│                                                      │
│     [Back to Dashboard]                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## F-020 · REVIEW MODE

**When shown:** User taps "Review Your Answers" from F-019.

Uses the SAME two-column layout as F-010, but in read-only mode with all feedback visible.

### Differences from F-010
| Element | Active Quiz (F-010) | Review Mode (F-020) |
|---|---|---|
| Header badge | Mode badge (e.g., "CAMP MODE") | **"REVIEW"** badge (amber bg) |
| Timer | Visible per config | **Hidden** |
| Submit button | "Submit Answer" / "Next →" | **No submit.** Only "← Previous" and "Next →" for navigation. |
| Left column | Question stem + confidence rating | Question stem + **locked confidence** ("Your confidence: Somewhat sure") |
| Right column options | Selectable, unannotated | **Annotated:** correct = Cobalt, user's wrong = Amber, others dimmed 50% |
| Feedback panel | Appears after submit | **Always visible** (expanded, not collapsible) |
| Palette | Per config | **Always visible** with correct/incorrect/skipped colors + filter pills |
| Navigation | Per config (linear/free) | **Always free** (back + forward + palette jump) |
| Progress indicator | "Q 8 of 20" | "Reviewing 8 of 20" + "5 of 20 reviewed" counter |

### Palette Filters in Review
- **All** (default)
- **Incorrect only** (amber cells — what most users want first)
- **Flagged** (orange cells)
- **Low confidence** (questions where user rated "Guessing")

### Transitions from F-020
| User Action | Next Frame |
|---|---|
| Navigates through all questions | Stay on F-020 (next/prev/palette) |
| Taps ✕ exit | → **F-019** (Results Dashboard) |
| Finishes last question | → **F-019** with "You've reviewed all questions ✓" confirmation |

---

# PART B: MODE CONFIGURATION TABLE

Every flag that differs between modes. F-010 reads this config to render the correct UI.

| Config Flag | Camp | Chill | Subject | Focused | Custom | Storm | Full Exam | Extended |
|---|---|---|---|---|---|---|---|---|
| **Intro slides** | F-003 only | F-003 only | F-003 + F-004 | F-003 + F-004 | F-003 + F-004 + F-005 | F-003 only | F-003 only | F-003 only |
| **Q count default** | 20 | 10 | 25 | 15 | User-set | 50 | 200 (locked) | 100 |
| **Q count step** | ±5 | ±5 | ±5 | ±5 | ±5 | ±25 | N/A | ±25 |
| **Q count range** | 10–30 | 5–50 | 10–50 | 5–25 | 5–200 | 25–100 | 200 | 50–200 |
| **Timer visible** | No | No | No | No | User | Bar | Countdown | Countup |
| **Feedback timing** | Immediate | Immediate | Immediate | Immediate | User | Deferred | Deferred | Immediate |
| **Gated next (ms)** | 3000 | 0 | 3000 | 4000 | User | N/A | N/A | 2000 |
| **Explanation depth** | Full + Wiki | Brief | Full + Wiki | Full + Wiki + "why tricky" | User | None until end | None until end | Brief |
| **Navigation** | Linear | Free | Linear | Linear | User | Free | Free | Linear+Skip |
| **Back allowed** | No | Yes | No | No | User | Yes | Yes | No |
| **Skip enabled** | No | Yes | No | No | User | Yes | Yes | Yes |
| **Palette visible** | No | No | No | No | User | Yes | Yes | Yes |
| **Bookmark/flag** | No | No | No | No | User | Yes | Yes | Yes |
| **Confidence** | Yes | No | Yes | Yes | User | No | No | No |
| **Micro-break at** | Never | Never | Never | Never | Never | Q25 | Q50 | Q30 |
| **Pre-submit review** | No | No | No | No | User | Yes | Yes | No |
| **Results timing** | Instant | Instant | Instant | Instant | Instant | Instant | 24hr delay | Instant |
| **Readiness impact** | Yes | **No** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Difficulty** | Adaptive | Mixed | Adaptive | Adaptive (start low) | User | Exam-weighted | Exam-weighted | Mixed |

---

# PART C: PER-MODE ENTRY VARIATIONS

How each mode tweaks the intro frame (F-003).

### Camp Mode (F-003)
- Eyebrow: "TODAY'S SESSION" (not "SESSION BRIEFING")
- Title: "Day 14 — Structural Systems" (trail day + topic)
- "Change mode" link: **HIDDEN** (trail controls the mode)
- Topic pre-filled by trail algorithm — not user-selectable
- CTA: "Begin Session →"

### Chill Mode (F-003)
- Eyebrow: "SESSION BRIEFING"
- Title: "Chill Mode"
- Summary: "10 questions · Mixed topics · Instant feedback"
- Readiness Score reminder: **HIDDEN** ("Chill doesn't affect your Readiness Score" note instead)
- CTA: "Let's Go →"

### Subject Mode (F-003 → F-004)
- If entered from Heatmap: topic pre-selected, goes to F-003 with topic shown
- If entered from Mode Selector: F-003 shows generic "Subject Mode" → F-004 for topic selection

### Focused Review (F-003 → F-004)
- Eyebrow: "BLINDSPOT PROTOCOL"
- Title: "Target Your Weak Spots"
- F-004: topics PRE-SELECTED by Blindspot Protocol algorithm
- Summary includes: "Questions from your weakest areas"

### Storm Mode (F-003)
- Warning card visible: "⚠ No feedback during the exam. Timer runs as a progress bar."
- CTA: "Start Storm →"

### Full Exam Simulation (F-003)
- Eyebrow: "PROOF SIMULATION"
- Title: "Full ALE Simulation"
- Count: LOCKED at 200 (stepper hidden)
- Environmental checklist visible
- Warning: "Once submitted, results in 24 hours"
- CTA: "I'm Ready. Begin Exam." (Camp Orange accent)

### Extended Practice (F-003)
- Title: "Extended Practice"
- Summary emphasizes time: "100 questions · ~90 min · Build stamina"
- CTA: "Begin Practice →"

### Custom Session (F-003 → F-004 → F-005)
- Title: "Custom Session"
- Summary: "Configure everything your way"
- CTA: "Customize →" (goes to F-004, then F-005)

---

# PART D: EDGE CASE FRAMES

## F-E01 · SESSION START ERROR
```
"Couldn't start your session. This might be a connection issue."
[Try Again] [Back to Dashboard]
```

## F-E02 · OFFLINE DURING QUIZ
Amber banner at top of quiz shell: "You're offline. Answers saved locally."
Quiz continues normally. Banner dismissed on reconnection: "Back online. Syncing..."

## F-E03 · QUESTION LOAD ERROR
```
"This question couldn't load."
[Skip to Next] [Try Again]
```
Question counted as unanswered, not penalized.

## F-E04 · TIMER EXPIRED
Full-screen: "Time's up! Your exam has been submitted with [X] of [Y] questions answered."
→ F-019 Results (or F-019B for Full Exam)

## F-E05 · AUTO-SUBMITTED (ABANDONED EXAM)
Push notification: "Your exam was auto-submitted."
On next app open: results available at F-019.
