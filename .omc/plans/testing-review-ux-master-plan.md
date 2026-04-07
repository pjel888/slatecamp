# Testing & Review UX — Master Implementation Plan

## Cross-Document Synthesis

Analysis of three source documents (product spec, HTML prototype, implementation plan) plus full codebase inventory reveals a well-researched system with strong pedagogical foundations but significant gaps that must be resolved before implementation.

---

## PART 1: CRITICAL CONFLICTS BETWEEN DOCUMENTS

### 1.1 Color Token Conflicts

| Token | CLAUDE.md Spec | Prototype HTML | Resolution |
|-------|---------------|----------------|------------|
| Green/Success | `#2D9F6F` (Emerald) | `#1B7A3C` | Use Emerald `#2D9F6F` — already in globals.css |
| Red/Error | `#D64545` (Warm Red) | `#E63329` (Signal Red) | Use Warm Red `#D64545` — per Campfire spec |
| Border | `#D4DAE3` (Border Default) | `#E8E4DC` (warm) | Use `#D4DAE3` — matches existing globals.css |
| Ink Secondary | `#4A5568` | `#4A4A4A` | Use `#4A5568` — per Campfire spec |
| Ink Tertiary/Muted | `#8896A7` | `#8A8780` | Use `#8896A7` — per Campfire spec |

**Action**: All implementation MUST use Slatecamp tokens from `globals.css`. Prototype colors are reference only.

### 1.2 Typography Conflicts

| Element | CLAUDE.md | Prototype | Implementation Plan | Resolution |
|---------|-----------|-----------|-------------------|------------|
| Display font | Inter only | Syne | DM Mono for eyebrows | **Inter only** during quiz sessions (Plan Rule 1 agrees). Syne is used elsewhere in SlateCamp (ScoreReveal uses it) but NOT during active testing |
| Monospace | Only on code/data/scores | DM Mono on eyebrows, labels, stats, node IDs | DM Mono for eyebrows | Monospace ONLY on: code citations, node IDs (ALE-DSGN-003-02), score numbers, time values. Eyebrow labels use Inter uppercase tracking |
| Minimum size | 11px | 9px on some labels | Not specified | **11px minimum enforced everywhere**. Prototype's 9px labels must be scaled up |

### 1.3 Mode Name Conflicts

| Spec Name | Prototype Name | Voice Guide Name | Resolution |
|-----------|---------------|-----------------|------------|
| Blindspot Protocol | Focus Review | Focus Review | Use **"Focus Review"** (Voice Guide says never use "Blindspot Protocol" externally) |
| Endurance Cycle | Extended Practice | Extended Practice | Use **"Extended Practice"** |
| Proof Simulation | Proof Simulation | Full Exam Simulation | Use **"Full Exam Simulation"** (Voice Guide says never use "Proof Simulation" externally) |

### 1.4 Test Mode Enum Mismatch

The database `test_mode` enum is `'camp' | 'timed' | 'practice'` but the app needs 8 distinct modes. The spec resolves this via `config.source`:

| UI Mode | DB test_mode | config.source |
|---------|-------------|---------------|
| Camp Mode | `camp` | `camp_mode` |
| Chill Mode | `practice` | `chill_mode` |
| Subject Mode | `camp` | `subject_mode` |
| Focus Review | `camp` | `focus_review` |
| Custom Session | `camp` or `timed` | `custom_session` |
| Storm Mode | `timed` | `storm_mode` |
| Full Exam Simulation | `timed` | `proof_simulation` |
| Extended Practice | `camp` | `extended_practice` |

---

## PART 2: EVERY SCREEN — COMPLETE TEXT & UX AUDIT

### Screen 1: Review Hub (`/dashboard/testing`)

**Header**
- Eyebrow: `"Review & Testing"` (Inter, uppercase, tracking-wide, 12px, ink-tertiary)
- Title: `"Build Mastery. Earn your Score."` (Inter 600, 28px, ink-primary)
- Description: `"Choose a session mode that fits your goal today. Every answer feeds your Readiness Score."` (Inter 400, 15px, ink-secondary)

**Smart Suggestion Card** (conditional, max 1 visible, priority: blindspot > exam countdown > weak subject > return > hidden)

Variant: Blindspot Alert
- Icon: Warning triangle
- Eyebrow: `"Focus Review"` (NOT "Blindspot Protocol")
- Title: `"3 Building Laws nodes need attention"` (avoid "Red for X weeks" — too clinical for first-time users)
- Description: `"BP 344 Corridors, PD 1096 Room Heights, and RA 9514 Travel Distances haven't improved recently. A focused session on these has the highest impact."` (Inter 400, 14px)
- CTA: `"Start Focus Review"` (button, cobalt)

Variant: Return (48h+ absent)
- Icon: Waving hand
- Eyebrow: `"Welcome back"`
- Title: `"Pick up where you left off"`
- Description: `"Your last session was [X days] ago. A quick Camp Mode session is the best way to get back in rhythm."` (growth-framed, warm)
- CTA: `"Start Camp Mode"` (button, cobalt)

Variant: Exam Countdown
- Icon: Calendar
- Eyebrow: `"Exam Countdown"`
- Title: `"[X] days until your exam"`
- Description: dynamic based on days remaining and readiness level
- CTA: context-dependent

Variant: Weak Subject
- Icon: Target
- Eyebrow: `"Suggested Focus"`
- Title: `"[Subject Name] could use attention"`
- Description: `"Your accuracy in [Subject] is [X]% — below your average. A Subject Mode session here would strengthen your weakest area."`
- CTA: `"Practice [Subject]"` (button, cobalt)

**FIRST-TIME USER STATE** (0 completed sessions, assessment just done):
- Smart Suggestion Card: HIDDEN (no data to suggest from)
- Instead show a **Welcome Card**:
  - Title: `"Welcome to your study sessions"`
  - Description: `"Camp Mode is the best place to start — you'll get instant feedback and explanations on every question. No timer, no pressure."`
  - CTA: `"Start your first session"` (cobalt, prominent)
- Zone 01 visually prominent (full opacity, larger cards)
- Zone 02 accessible but visually secondary (slightly muted)
- Zone 03 present but clearly "later" (muted, smaller)

**Zone Headers**
- Format: `"Zone 01 · Foundations"` / `"Zone 02 · Deliberate Practice"` / `"Zone 03 · Exam Readiness"` (Inter 500, uppercase, 11px tracking-widest, ink-tertiary, with extending line)

**Mode Cards — Zone 01 (Foundations)**

Camp Mode:
- Icon: Book (16px)
- Label: `"Camp Mode"` (Inter 500, 13px, ink-secondary)
- Character: `"Guided Study"` (Inter 600, 17px, ink-primary)
- Description: `"Instant feedback after each answer. Full explanations on every question. No timer, no pressure."` (Inter 400, 14px, ink-secondary)
- Stats (5+ sessions): `"22 sessions · Last: 74% · 18 avg"` (Inter 400, 12px, ink-tertiary)
- Stats (1-4 sessions): `"2 sessions completed"` (no accuracy shown yet — too little data)
- Stats (0 sessions): `"Start your first session"` (Inter 400, 12px, cobalt)
- CTA: `"Start Camp Mode"` (text button, cobalt)
- Left border: 3px cobalt

Chill Mode:
- Icon: Leaf (16px)
- Label: `"Chill Mode"` (Inter 500, 13px)
- Character: `"Relaxed"` (Inter 600, 17px)
- Description: `"Browse questions casually. Skip any you want. Low stakes, real learning."` (Inter 400, 14px)
- Stats pattern: same as Camp Mode
- CTA: `"Start Chill Mode"`
- Left border: 3px cobalt

**Mode Cards — Zone 02 (Deliberate Practice)**

Subject Mode:
- Icon: Target
- Label: `"Subject Mode"`
- Character: `"Focused"`
- Description: `"Deep-dive into one ALE subject. Questions matched to your current level."`
- CTA: `"Start Subject Mode"`
- Left border: 3px cobalt
- Badge: `"Pro"` (if applicable)

Focus Review:
- Icon: Magnifying glass
- Label: `"Focus Review"`
- Character: `"Targeted"`
- Description: `"Targets your weakest areas with the highest-impact questions. Driven by your mastery data."`
- CTA: `"Start Focus Review"`

Custom Session:
- Icon: Gear
- Label: `"Custom Session"`
- Character: `"Flexible"`
- Description: `"Full control. Pick topics, difficulty, question count, and feedback style."`
- CTA: `"Build Custom Session"`
- Badge: `"Pro"`

**Mode Cards — Zone 03 (Exam Readiness)**

Storm Mode:
- Icon: Lightning bolt
- Label: `"Storm Mode"`
- Character: `"Timed"`
- Description: `"Exam conditions. No feedback until you're done. Timer runs as a bar, not a countdown."`
- CTA: `"Start Storm Mode"` (orange background button)
- Left border: 3px camp-orange
- Badge: `"Pro"`

Full Exam Simulation (when LOCKED):
- Icon: Shield
- Label: `"Full Exam Simulation"`
- Character: `"Exam Day"`
- Description: `"200 questions. Real exam conditions. Your score is delivered 24 hours later."`
- Lock display: Progress bar with `"Readiness Score: 62% / 65% needed"` and `"3 more points to unlock"`
- Card opacity: 0.65
- No CTA button
- Left border: 3px camp-orange
- Badge: `"Pro"`

Full Exam Simulation (when UNLOCKED):
- Same card but full opacity
- CTA: `"Begin Simulation"` (orange button)

Extended Practice:
- Icon: Dumbbell/weight
- Label: `"Extended Practice"`
- Character: `"Endurance"`
- Description: `"100+ question sessions. Build the cognitive stamina needed for the full-length exam."`
- Stats (has data): `"2 sessions · Reliable window: ~35 items"`
- CTA: `"Start Extended Practice"` (orange button)
- Badge: `"Pro"`

**In-Progress Session Banner** (when `quiz_sessions.status = 'in_progress'` exists):
- Position: Fixed top of hub, below page header
- Background: cobalt-50
- Text: `"You have a session in progress — [Mode Name], [X/Y] questions answered"`
- CTA: `"Resume"` (cobalt button)
- Dismiss: `"Abandon"` (ghost button, triggers confirmation dialog)

---

### Screen 2: Mode Setup (per-mode, e.g. `/dashboard/testing/camp/setup`)

**Camp Mode Setup**
- Back link: `"← Back to Review"` (Inter 400, 14px, ink-secondary, hover: cobalt)
- Eyebrow: `"Camp Mode"` (Inter 500, uppercase, 12px, ink-tertiary, tracking-wide)
- Title: `"Guided Study"` (Inter 600, 24px, ink-primary)
- Description: `"Instant feedback after each answer. Full explanations on every question. No timer, no pressure."` (Inter 400, 15px, ink-secondary)

Section: "How many questions?"
- Pill selector: `10` / `20` (default selected) / `30` / `50`
- Selected state: cobalt background, white text

Section: "Confidence check" (collapsible, open by default)
- Description: `"Rate your confidence in these areas before you start. We'll show you how accurate your predictions were afterward."` (CRITICAL for first-time users — explain WHY)
- Subject rows with 3-dot rating (1 = Not confident, 2 = Somewhat, 3 = Confident)
- Dot labels on first row only: `"1"` `"2"` `"3"` (visually, not as text labels — the dots themselves show the scale)
- Tooltip on "?" icon: `"This helps you develop self-awareness about what you know. It doesn't affect your score."`

Section: "Focus" (optional)
- Radio options:
  - `"Prioritize weakest areas"` + helper: `"(recommended)"` — default selected
  - `"Focus on one subject"` — when selected, reveals subject dropdown
  - `"Mix all subjects equally"`

CTA: `"Start 20-question session"` (cobalt button, dynamically updates count from pill selector)

**FIRST-TIME USER ADDITIONS:**
- Small info callout above confidence section: `"New to SlateCamp? The defaults are already set for you. Just hit Start."` (cobalt-50 background, subtle)

**Storm Mode Setup**
- Same structure but:
- Title: `"Timed"`
- Description: `"Exam conditions. No feedback during the session. Timer runs as a progress bar."`
- Question pills: `25` / `50` (default) / `100`
- Time display: `"50 minutes"` (auto-calculated at 1 min/question, updates with pill)
- NO confidence check (no pre-session metacognition in exam mode)
- NO focus section (Storm always draws from full pool)
- Pre-session briefing text: `"Once you start, the timer runs continuously. You'll see your results and all explanations when you finish. Take a breath — you've got this."`
- CTA: `"Start 50-question timed session"` (orange button)

**Chill Mode Setup**
- Title: `"Relaxed"`
- Description: `"Browse questions at your own pace. Skip any you want. End whenever you're ready."`
- NO question count selector (open-ended)
- NO timer
- Optional subject filter: `"Want to focus on a subject?"` with dropdown (default: "All subjects")
- CTA: `"Start browsing"` (cobalt button)
- Note: `"You can end this session anytime — no penalty."`

**Subject Mode Setup**
- Title: `"Focused"`
- Description: `"Deep-dive into one subject. Questions matched to your current mastery level."`
- Subject selector (required): Grid of 8 subject cards (ALE-HIST through ALE-DSGN), each showing subject name and current mastery percentage
- Question count pills: `10` / `20` (default) / `30`
- CTA: `"Start [Subject Name] session"` (cobalt button)

**Focus Review Setup**
- Title: `"Targeted"`
- Description: `"This session targets [X] topics that need the most work. 12 carefully selected questions."`
- Shows targeted nodes: list of 3-5 node names with current mastery dots
- No configuration needed — system selects everything
- CTA: `"Start Focus Review"` (cobalt button)
- If no weak nodes: `"Great news — you don't have any stuck areas right now. Try Camp Mode to keep progressing."`

**Custom Session Setup**
- Title: `"Flexible"`
- Full configuration:
  - Topic tree multi-select (taxonomy browser)
  - Question count slider: 5-100, default 20
  - Difficulty bands: Foundational / Intermediate / Advanced / Expert (multi-select)
  - Feedback style toggle: `"Immediate"` (default) / `"After session"`
  - Timer toggle: Off (default) / On → duration input
- Live counter: `"X questions available with these settings"` (updates in real-time)
- CTA: `"Start custom session"` (cobalt button)

---

### Screen 3: Active Session (shared layout, mode-specific behavior)

**Universal Elements (all modes)**
- Progress bar: 4px full-width at top, cobalt fill, smooth width transition (400ms ease)
- Question counter: `"1 / 20"` (Inter 500, 14px, monospace digits, ink-secondary) — top left
- Flag button: `"Review later"` / `"Flagged"` toggle — top right
- Navigator grid button: Grid icon — top right, next to flag

**Camp Mode Session**
- Subject label: `"BUILDING LAWS"` (Inter 500, uppercase, 11px, tracking-widest, ink-tertiary) — NOT monospace
- Question stem: (Inter 400, 16px, line-height 1.65, ink-primary)
- Image support: If `prompt_image_url` exists, show image above question stem
- Options: 4 rows (A/B/C/D letter circle + text), 56px min-height, full-width
  - Default: white bg, border-default border
  - Hover: surface-light bg
  - Selected: cobalt-50 bg, cobalt border
  - Eliminated: opacity-50, line-through text, strikethrough
  - After submit — Correct: emerald-50 bg, emerald border, checkmark icon
  - After submit — Wrong: warm-red-50 bg, warm-red border, X icon
  - After submit — Reveal correct: emerald-50 bg (if user chose wrong, correct answer also highlights)
- Elimination: Small X button appears on hover for non-selected/non-eliminated options. Click to strike through. Click again to un-strike.
- Confidence tag: `"How sure are you?"` label, `"Sure"` / `"Unsure"` pill buttons (optional, below options, before submit)
- Submit button: `"Submit Answer"` (cobalt) — disabled until option selected
- After submit:
  - Options lock (no further clicks)
  - Correct/incorrect visuals appear
  - Rationale panel slides in below options:
    - Eyebrow: `"Why [letter] is correct"` (Inter 500, 12px, emerald)
    - Explanation text (Inter 400, 14px, ink-primary)
    - Citation badge: `"BP 344, 2024 IRR, Section C.5"` (monospace, 12px, cobalt-50 bg, cobalt text, rounded)
    - Links: `"Read full article →"` (cobalt) + `"See this in 3D →"` (if model_id exists)
  - If wrong answer → Error taxonomy appears:
    - Label: `"What happened?"` (Inter 500, 13px, ink-secondary)
    - 5 toggleable pills: `"Knowledge gap"` / `"Misread"` / `"Two similar options"` / `"Wrong code version"` / `"Needed more time"`
    - (multi-select, optional, not blocking)
  - Button changes: `"Next Question →"` or `"Finish Session"` (on last question)
- Previous button: `"← Previous"` (ghost button, hidden on question 1)
- Footer: Fixed position, consistent across questions

**Storm Mode Session** (stripped UI)
- NO subject label
- NO confidence tag
- NO rationale panel during session
- NO error taxonomy during session
- NO "Previous" button (sequential only in strictest interpretation — OR allow back-navigation but never show correctness)
- Options: Select + `"Confirm"` two-step flow (single tap selects, must click confirm to lock)
- Timer bar: 4px at very top (above progress bar), full width
  - > 20% remaining: cobalt
  - 10-20% remaining: camp-orange (#E8853A)
  - < 10% remaining: camp-orange (NEVER red)
- After confirm: Option just shows selected state (cobalt highlight), no correct/incorrect
- Auto-advance to next question after confirm
- Button: `"Confirm & Next"` (cobalt) / `"Confirm & Finish"` (on last question)
- Navigator grid: Shows answered (cobalt fill) / unanswered (empty) / flagged (gold) — NEVER shows correctness

**Chill Mode Session**
- Same as Camp Mode but:
- Skip button: `"Skip →"` (ghost button, always available)
- Soft feedback: Correct shows subtle emerald-50 bg (no border change, no checkmark icon — just gentle tint). Wrong shows subtle warm-red-50 bg (no border change, no X icon)
- Rationale always visible immediately (no submit-then-reveal — rationale appears alongside options)
- No error taxonomy
- End session: `"End Session"` button always visible in footer (ghost style)
- No question count in progress bar (open-ended, shows "12 answered" instead of "12 / 20")

**Navigator Overlay** (all modes)
- Trigger: Click grid icon in header
- Position: Fixed bottom panel, slides up, shadow-md upward
- Title: `"Session Navigator"` (Inter 500, 14px)
- Grid: 10 columns of numbered cells (40x40px, rounded-md)
  - Answered: cobalt fill, white number
  - Unanswered: white fill, border-default, ink-secondary number
  - Flagged: gold fill, white number
  - Current: thick cobalt border (2px)
- Legend: Three small indicators with labels: `"Answered"` / `"Unanswered"` / `"Flagged"`
- Click cell: Jump to that question, close navigator
- Close: Tap outside or close button

---

### Screen 4: Confirm Submit Sheet (end of session)

- Trigger: Click "Finish Session" on last question
- Type: Bottom sheet (mobile) / Dialog (desktop)
- Title: `"Ready to finish?"`
- Summary stats:
  - `"20 questions answered"`
  - `"2 flagged for review"` (if any)
  - `"0 skipped"` (if applicable)
- Camp Mode only: `"You'll see your results immediately."`
- Storm Mode only: `"You'll see all results and explanations now."`
- CTA: `"Finish Session"` (cobalt button)
- Cancel: `"Keep going"` (ghost button)

---

### Screen 5: Session Debrief (`/dashboard/testing/[mode]/debrief/[sessionId]`)

**Score Hero**
- Section label: `"Session Complete"` (Inter 500, uppercase, 11px, ink-tertiary)
- Score display: `"17 / 20"` (Inter 700, 48px, ink-primary — NOT monospace, NOT Syne)
- "correct" label: (Inter 400, 14px, ink-secondary)
- Percentage: `"85%"` (Inter 600, 20px, colored by band)
  - >= 85%: emerald
  - 70-84%: cobalt
  - 50-69%: amber
  - < 50%: warm-red

**Camp Voice Copy** (exact strings, no deviation):
- >= 90%: `"Outstanding. You're building real mastery here."`
- 80-89%: `"Strong session. You're locking this in."`
- 70-79%: `"Good work. The areas you missed are clear — that's progress."`
- 60-69%: `"Every question you got wrong just showed you what to study next."`
- 50-59%: `"Tough session. The good news: now you know exactly where to focus."`
- < 50%: `"This is where the learning happens. The topics you struggled with are now your roadmap."`

**Readiness Score Delta**
- Background: cobalt-50
- Label: `"Readiness Score"` (Inter 500, 12px, ink-secondary)
- Value: `"62% → 65%"` (Inter 600, 16px, ink-primary)
- Delta: `"(+3)"` (Inter 600, 14px, cobalt)
- If negative: `"(-2)"` (warm-red) with copy: `"Score adjustments are normal — they help keep your Readiness Score accurate."`

**Node Mastery Updates**
- Section label: `"Mastery Updates"` (Inter 500, uppercase, 11px, ink-tertiary)
- Per node row:
  - Node ID: `"ALE-DSGN-003-02"` (monospace, 11px, ink-tertiary) — monospace IS correct here (it's a data value)
  - Node name: `"BP 344 C.5 Corridors"` (Inter 500, 14px, ink-primary)
  - Transition: colored dots (red/amber/green) with arrow between before/after states
  - Delta text: `"Red → Amber +18 pts"` (Inter 400, 12px, colored by destination state)
  - Special: `"Still Red +6 pts"` — honest about slow progress, still shows positive delta

**Question Review Strip**
- Section label: `"Question Review"` (Inter 500, uppercase, 11px, ink-tertiary)
- Horizontal scrollable strip of tiles (40x40px, rounded-sm, gap 6px)
  - Correct: emerald bg, white checkmark
  - Incorrect: warm-red bg, white X
  - Flagged: gold border (in addition to correct/incorrect color)
- Default instruction text: `"Tap a question to review it"` (Inter 400, 13px, ink-tertiary)
- Selected tile: scale 1.1, thick border
- Detail panel (appears below on tile tap):
  - Question stem (truncated to 2 lines with "...")
  - Your answer: `"You chose: [B] [answer text]"` — green if correct, red if wrong
  - Correct answer (if wrong): `"Correct: [C] [answer text]"` — green
  - Time: `"Took 23s"` (monospace digits)
  - Flagged indicator if applicable
  - Error tag if applicable: `"Tagged: Knowledge gap"`

**Calibration Reveal** (only shown if confidence ratings were set pre-session)
- Section label: `"Your Calibration"` (Inter 500, uppercase, 11px, ink-tertiary)
- Per subject row:
  - Subject name (Inter 500, 14px)
  - Prediction: `"You predicted: Confident (3/3)"` with visual blocks
  - Actual: `"You scored: 47%"` (colored by accuracy band)
  - Gap text (growth-framed, never shaming):
    - Overconfident: `"You were overconfident here — that's useful to know."`
    - Underconfident: `"You knew this better than you thought — trust yourself."`
    - Calibrated: `"Well-calibrated — your prediction matched reality."`
- Overall: `"Calibration score: 58 / 100"` + `"Higher = better self-knowledge"` (Inter 400, 12px, ink-tertiary)

**Block Accuracy Chart** (Extended Practice ONLY)
- Recharts BarChart
- X-axis: Block numbers (1, 2, 3...)
- Y-axis: Accuracy %
- Bars colored by threshold: >= 70% emerald, < 70% warm-red
- Reference line at 70% (dashed, labeled `"Reliable threshold"`)
- Fatigue annotation: `"Accuracy dropped below 70% at block [X] (~[Y] questions)"` (Inter 400, 13px, ink-secondary)

**Debrief Actions**
- Primary: `"Retry wrong answers (3)"` (cobalt button) — number is dynamic count of wrong answers
- Secondary: `"Start new session"` (outline button)
- Tertiary: `"Back to Review"` (ghost button)
- If 100% correct: Primary becomes `"Start new session"`, no retry option

**STORM MODE DEBRIEF ADDITIONS:**
- Full item-by-item review with rationales (not shown during session)
- Error taxonomy available per question (post-hoc tagging)
- Time per question shown: `"Avg: 72s/question · ALE target: 96s"` (monospace digits)
- Pacing assessment: `"You're pacing well"` or `"You're averaging [X]s over the ALE target"`

---

### Screen 6: Full Exam Simulation Briefing

- Full-page layout, centered content (max-width 560px)
- Title: `"Full Exam Simulation"` (Inter 600, 28px)
- Subtitle: `"This is the closest experience to your real exam."` (Inter 400, 16px, ink-secondary)
- Rules card (surface-card, rounded-lg, padding 24px):
  - `"200 questions"`
  - `"Timed — matches the real exam duration"`
  - `"No feedback during the session"`
  - `"Your score will be available 24 hours after you finish"`
- Explanation: `"Why 24 hours? Research shows that seeing your score immediately can trigger unhelpful emotional reactions. A 24-hour buffer lets you process the experience before seeing results."` (Inter 400, 14px, ink-secondary)
- Calm encouragement: `"You've earned your way here. Trust your preparation."` (Inter 500, 15px, ink-primary)
- CTA: `"Begin Simulation"` (orange button, large)
- Back: `"← Not ready yet"` (ghost button)

---

### Screen 7: Full Exam Simulation Results (24h cold delivery)

- Title: `"Your Simulation Results"` (Inter 600, 28px)
- Score display: Same hero format as regular debrief
- **Pressure Gap card** (unique to simulation):
  - Label: `"Pressure Gap Analysis"`
  - Display: `"Readiness Score: 74% → Simulation: 61%"`
  - Gap: `"13-point pressure gap"` (Inter 600, warm-red if gap > 10, amber if 5-10, emerald if < 5)
  - Interpretation: `"Under exam conditions, your score dropped 13 points. This gap is the next thing to close — and Extended Practice + more Storm Mode sessions will help."`
- Per-subject breakdown
- Full question review
- Next recommended action

---

## PART 3: FIRST-TIME USER EXPERIENCE GAPS

### Current State: No onboarding guidance
The prototype and plan both assume users understand the zone system, mode differences, and features like elimination, flagging, and confidence tagging. A brand new user who just completed their Assessment Quiz has zero context.

### Required First-Time Additions

**3.1 Welcome Card on Review Hub** (0 completed sessions)
Replace Smart Suggestion with a Welcome Card:
- Title: `"Welcome to your study sessions"`
- Body: `"Camp Mode is the best place to start. You'll get instant feedback and explanations on every question — no timer, no pressure. Start with 10 questions to get comfortable."`
- CTA: `"Start your first session"` → routes to Camp Mode setup with 10 pre-selected

**3.2 Feature Discovery Tooltips** (first session only)
Non-blocking tooltip popovers that appear once:
1. On first question load: Tooltip on the eliminate button area: `"Tip: You can eliminate answer choices by hovering and clicking the X. This mimics real test-taking strategy."`
2. After first answer: Tooltip on the flag button: `"Tip: Flag questions you want to review later. They'll be highlighted in your session navigator."`
3. After first wrong answer: Brief note above error taxonomy: `"This helps us understand what happened — it's optional and won't affect your score."`
4. On debrief (first time): Brief intro above calibration: `"This compares what you predicted to what actually happened. Over time, this helps you develop better self-awareness."`

These tooltips should:
- Appear once per user (tracked via localStorage or user preferences)
- Be dismissible via click or "Got it" button
- Never block interaction
- Use cobalt-50 background with cobalt text

**3.3 Progressive Zone Disclosure**
- 0-4 sessions: Zone 01 full-size cards. Zone 02 cards at 85% scale, slightly muted. Zone 03 cards at 75% scale, more muted. All still clickable.
- 5-9 sessions: Zone 01 and Zone 02 at full size. Zone 03 slightly muted.
- 10+ sessions or Readiness > 50%: All zones equal prominence.

**3.4 Empty State for Stats**
- 0 sessions: `"Start your first session"` (cobalt text, no stats line)
- 1-4 sessions: `"[X] sessions completed"` (no accuracy — too little data to be meaningful)
- 5+ sessions: Full stats line: `"22 sessions · Last: 74% · 18 avg"`

---

## PART 4: ROUTE ARCHITECTURE

```
/dashboard/testing/                          → Review Hub (Screen 1)
/dashboard/testing/camp/setup                → Camp Mode setup
/dashboard/testing/chill/setup               → Chill Mode setup
/dashboard/testing/subject/setup             → Subject Mode setup
/dashboard/testing/focus-review/setup        → Focus Review setup
/dashboard/testing/custom/setup              → Custom Session setup
/dashboard/testing/storm/setup               → Storm Mode setup
/dashboard/testing/simulation/briefing       → Full Exam Simulation briefing
/dashboard/testing/endurance/setup           → Extended Practice setup

/dashboard/testing/session/[sessionId]       → Active Session (mode from session config)
/dashboard/testing/session/[sessionId]/debrief → Session Debrief
/dashboard/testing/simulation/[sessionId]/results → Simulation Results (cold delivery)
```

**Rationale**: Mode-specific setup routes but a SHARED session route. The session page reads `config.source` from the session record to determine mode-specific behavior. This avoids duplicating the quiz engine across 8 routes.

---

## PART 5: COMPONENT ARCHITECTURE

```
src/components/testing/
  hub/
    ReviewHub.tsx              — Main hub page layout
    WelcomeCard.tsx            — First-time user welcome
    SmartSuggestionCard.tsx    — Data-driven suggestion (4 variants)
    ModeCard.tsx               — Mode selector card with stats
    ZoneSection.tsx            — Zone header + card grid
    InProgressBanner.tsx       — Resume/abandon active session
  setup/
    CampSetup.tsx              — Camp Mode configuration
    StormSetup.tsx             — Storm Mode configuration
    ChillSetup.tsx             — Chill Mode configuration
    SubjectSetup.tsx           — Subject selector + configuration
    FocusReviewSetup.tsx       — Auto-configured focus session
    CustomSetup.tsx            — Full custom configuration
    SimulationBriefing.tsx     — Pre-simulation full page
    EnduranceSetup.tsx         — Extended practice configuration
    shared/
      QuestionCountPills.tsx   — Pill selector for question count
      ConfidenceCheck.tsx      — Pre-session confidence rating
      FocusSelector.tsx        — Focus radio group
      SubjectGrid.tsx          — Subject card grid selector
      TaxonomyBrowser.tsx      — Topic tree multi-select
      DifficultySlider.tsx     — Difficulty band selector
  session/
    SessionShell.tsx           — Shared session layout (progress bar, header, footer)
    CampSession.tsx            — Camp mode behavior (immediate feedback)
    StormSession.tsx           — Storm mode behavior (deferred, timer)
    ChillSession.tsx           — Chill mode behavior (soft feedback, skip)
    ConfidenceTag.tsx          — Sure/Unsure per-question
    ErrorTaxonomyPrompt.tsx    — Post-wrong "What happened?" pills
    NavigatorOverlay.tsx       — Bottom panel question grid
    StormTimerBar.tsx          — 4px timer with color thresholds
    ConfirmSubmitSheet.tsx     — End-of-session confirmation
    FirstTimeTooltip.tsx       — One-time feature discovery tooltip
  debrief/
    DebriefLayout.tsx          — Shared debrief page layout
    ScoreHero.tsx              — Large score display + Camp Voice copy
    ReadinessDelta.tsx         — Before/after readiness score
    NodeMasteryStrip.tsx       — Per-node mastery transitions
    QuestionReviewStrip.tsx    — Horizontal tile strip + detail panel
    CalibrationReveal.tsx      — Confidence vs. actual comparison
    BlockAccuracyChart.tsx     — Recharts bar chart (endurance only)
    PressureGapCard.tsx        — Simulation pressure gap analysis
    DebriefActions.tsx         — Retry/new/back action buttons
```

Reuse from existing:
- `src/components/quiz/QuizOverlay.tsx` → base for SessionShell
- `src/components/quiz/QuizHeader.tsx` → adapt for session header
- `src/components/quiz/OptionButton.tsx` → REUSE directly (already has 6 states)
- `src/components/quiz/FooterNavigator.tsx` → adapt for session footer
- `src/components/quiz/TimerBar.tsx` → adapt for StormTimerBar
- `src/components/quiz/RationaleDrawer.tsx` → adapt for inline rationale panel
- `src/components/quiz/ConfirmSubmitSheet.tsx` → REUSE
- `src/components/quiz/SaveIndicator.tsx` → REUSE
- `src/components/quiz/QuestionStem.tsx` → REUSE
- `src/components/quiz/ConfidenceToggle.tsx` → REUSE/adapt for ConfidenceTag
- `src/components/quiz/ErrorTypePrompt.tsx` → REUSE/adapt for ErrorTaxonomyPrompt
- All `src/components/ui/*` primitives (36 shadcn components available)

---

## PART 6: IDENTIFIED GAPS REQUIRING RESOLUTION

### Schema Gaps (MUST be migration'd before implementation)
1. `user_endurance_profiles` table — MISSING, blocks simulation gate
2. `quiz_sessions.is_endurance_session` boolean — MISSING
3. `quiz_sessions.accuracy_by_block` JSONB — MISSING
4. `user_interactions.source_type` enum — MISSING
5. `readiness_score_snapshots.sub_scores` — always `{}`, needs population
6. `feature_flags` seeding — 10 flags needed for paywall
7. `user_global_stats.free_questions_today` — MISSING for free tier cap

### Server Action Gaps
- No `getSessionHistory(userId, mode?)` for ModeCard stats
- No `getSmartSuggestion(userId)` for priority logic
- No `getSessionDebrief(sessionId)` for debrief data
- No `checkSimulationGate(userId)` for lock state
- No `getCalibrationData(sessionId)` for confidence vs actual
- No `getErrorTaxonomyAggregation(userId)` for error patterns

### UX Gaps
- No offline/poor-connectivity handling
- No session recovery on browser crash (beyond localStorage)
- No 24-hour notification infrastructure for cold delivery
- Phase 4 (PressureGapDisplay) depends on Phase 5 (Proof Simulation) data — reorder
- 40x40px review tiles below WCAG 44x44px touch target minimum — increase to 44x44px

### Accessibility Gaps
- Keyboard navigation for all interactive elements
- ARIA labels on option buttons, navigator cells, confidence dots
- Focus management on state transitions (setup → session → debrief)
- Screen reader text for visual-only indicators (colored dots, progress bars)
- `role="alert"` on correct/incorrect feedback for screen readers

---

## PART 7: RECOMMENDED PHASE ORDER

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|-------------|
| 0 | Schema migrations + server actions | 2-3 days | None |
| 1 | Review Hub + Mode Cards + Welcome Card | 1 week | Phase 0 |
| 2 | Setup screens (all 8 modes) | 1 week | Phase 1 |
| 3 | Active Session (Camp + Chill + Storm) | 1.5 weeks | Phase 2 |
| 4 | Session Debrief (all components) | 1 week | Phase 3 |
| 5 | Full Exam Simulation (briefing + cold delivery + results) | 1 week | Phase 4 |
| 6 | Extended Practice + analytics visualizations | 1 week | Phase 4 |

**Key change from original plan**: Phase 4 (visualizations) moved AFTER Phase 5 (now Phase 6) because PressureGapDisplay requires simulation data. Schema migrations extracted to Phase 0 to unblock everything.

