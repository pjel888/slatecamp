# SlateCamp — Testing & Review System: UX Research & Implementation Plan

> **Feature:** `/dashboard/testing` — The primary study interface across all quiz modes
> **Document type:** UX Research + UI Implementation Specification
> **Version:** 1.0 · March 2026
> **Scope:** All quiz modes, active session interface, post-session debrief, new visualization innovations

---

## Part 1 — The Research Foundation

### What This System Is Actually Doing

The Testing & Review system is not a quiz engine. It is a **mastery measurement instrument** that happens to feel like studying. Every interaction a student makes — every answer, every hesitation, every answer change, every second of rationale reading — is captured, weighted, and fed into the EMA that drives the Readiness Score and Heatmap. The UX exists to make this data collection feel like learning, not surveillance.

The governing constraint from our existing principles: every design decision is evaluated by one test — **"Does this make a student more likely to pass their Licensure Exam?"** Not "is this engaging." Not "is this delightful." Specifically: does this design choice increase pass probability? This test resolves almost every UX ambiguity in this document.

---

### Cross-Disciplinary Research: What Other Fields Know About Testing Under Pressure

Before designing a single screen, five other fields have already solved versions of the core problems in this system. Their solutions have direct UX consequences.

---

#### 1. Air Traffic Control Interface Design (FAA Human Factors Research)

**The problem they solved:** How do you give a human operator the maximum relevant information while minimizing cognitive interruption during high-stakes task execution?

**What ATC interface research established (Wickens et al., 2003):**
- **Attentional capture by irrelevant alerts reduces primary task performance by 15–40%.** Every piece of information on screen that is not directly needed for the current action competes for the same attentional resources as the task itself.
- **Spatial consistency matters more than design elegance.** Controls that are always in the same position become automatic. Controls that move between states require conscious attention to locate — and during high-load moments, that attention cost compounds.
- **Status signals must be ambient, not attentional.** A progress indicator that requires looking at to interpret is inferior to one that is peripherally readable without focused attention.

**Application to quiz interface:**
- During an active quiz session, the progress bar, question counter, and optional timer must be **peripherally readable** — positioned, sized, and colored so that the student can check them without moving attention from the question. These must never compete with the question text for visual dominance.
- All controls (Next, Previous, Flag, Submit) must be in **fixed, consistent positions** across every question — never repositioned based on content length or question type. The student's motor memory learns the interface and stops thinking about it.
- The Storm Mode timer is a "status signal" not an "alert signal." It must be readable at the periphery without demanding focused attention — a thin bar is correct; a countdown number is wrong.

---

#### 2. Medical Licensure Examination Interface Psychology (NBME USMLE UX Research)

**The problem they solved:** How do you design a high-stakes testing interface that does not introduce performance variance from the interface itself?

**Key findings (NBME 2019 interface design review):**
- **Answer selection mechanics affect accuracy.** Single-click selection without confirmation is faster but produces more mis-selections. Two-step confirmation (select + confirm) reduces accidental submissions but adds cognitive interruption. The NBME uses single-click during the session with an end-of-session review — not two-step confirmation per question.
- **Strike-through elimination is a measurable performance aid.** Students who use elimination strategies on difficult questions score 8% higher on those items than students who don't. The interface must afford elimination visually.
- **Review flags reduce anxiety without reducing performance.** The ability to flag a question and return to it later reduces "exit regret" — the anxiety of committing to an answer you're unsure about. This reduces the distraction of previous questions competing for cognitive resources on the current question.
- **Question count not percentage.** "Question 15 of 50" produces less pressure than "30% complete." The absolute count orients without imposing a pacing target.

**Application to quiz interface:**
- **Camp Mode (immediate feedback):** Single-click selection is correct. Show the correct/incorrect state immediately — do not require confirmation.
- **Storm Mode (deferred feedback):** Use a two-step flow: select → visual highlight → tap "Submit" to lock. This gives the student a moment to reconsider, which they cannot do in a real exam, but the friction reduces regret and subsequent distraction.
- **Elimination:** Option rows in all modes must support a tap-and-hold or swipe gesture to visually strike through an option without selecting it. This uses `options_eliminated` in `user_interactions`.
- **Flag function:** Always present, always "Review Later" — neutral label, never "I don't know" (shame-adjacent language).

---

#### 3. Cognitive Load Research in Medical Simulation Training (Ericsson's Deliberate Practice)

**The problem they solved:** How do you structure practice so that each session produces maximum skill improvement, not just activity completion?

**Deliberate practice requirements (Ericsson & Pool, 2016):**
- **Immediate specific feedback accelerates skill acquisition.** Not just "wrong" but "wrong because you confused this provision with this other provision." The specificity of feedback determines the quality of schema correction.
- **The practice must be at the edge of current ability.** Too easy → no learning. Too hard → anxiety → no learning. The zone of proximal development (Vygotsky, 1978) is the productive difficulty range.
- **Full attention, not multitasking.** Practice conducted while mentally divided is demonstrably less effective than focused practice. This is the research basis for the stripped UI in Storm Mode.

**Application to quiz modes:**
- Camp Mode's rationale system is a deliberate practice mechanism — not a passive explanation, but an active schema correction tool. The UX must make rationale reading feel worthwhile, not obligatory. Showing the rationale below the question (while the question and selected answer remain visible) allows the student to connect the explanation to their specific error — the most effective correction format.
- The difficulty selection in Custom Session directly maps to ZPD targeting. The UI must make it easy to set difficulty at the productive edge, with a visual indicator of where their current mastery sits relative to the difficulty bands.
- The Zone 03 modes (Storm Mode, Proof Simulation, Extended Practice) are designed to simulate conditions that exceed current ability. The UX must convey this framing explicitly — not as punishment, but as training.

---

#### 4. Sports Performance Analytics Interfaces (NFL Next Gen Stats, NBA Second Spectrum)

**What these systems solved:** Making granular, multi-dimensional performance data actionable for practitioners who do not have time to read tables.

**Key design principles from professional sports analytics:**
- **Single metric prominence.** The most important number gets the most visual weight. Every other number supports it. Never create visual parity between primary and secondary metrics.
- **Trend over absolute value.** A 72% accuracy is less meaningful than "72% and rising, from 58% six weeks ago." The direction is the story.
- **Spatial context for performance data.** The shot chart (where shots were taken on the court) is more actionable than a table of shooting percentages by zone because location and performance are presented simultaneously.
- **The debrief is where growth happens.** In sports, the video session after a game is where real skill development occurs — not during the game. The NBA spends more resources on post-game analysis than pre-game preparation. The SlateCamp post-session debrief is this video session.

**Application to post-session debrief:**
- The Readiness Score delta is the primary metric. "Before: 62% → After: 65% (+3)" dominates the debrief header. Everything else is context.
- The accuracy-by-block chart for Extended Practice / Endurance sessions (analogous to a shot chart) shows where in the session performance degraded — spatial context for the fatigue inflection point.
- Per-question data (time, changes, correctness) should be presented in a temporal strip, not a table — mirroring sports play-by-play replay. The student relives the session sequentially, not as a static summary.

---

#### 5. Adaptive Testing in Clinical Psychology (MMPI, DSM Assessment Design)

**The problem they solved:** How do you design a testing instrument that maintains the validity and reliability of its measurements despite student strategy and fatigue?

**Key insights:**
- **Question ordering affects response patterns.** Questions placed late in a session are answered faster and with lower accuracy — not because the student knows less, but because of fatigue and response sets. The ALE is random in its item distribution; SlateCamp sessions should mirror this in Storm Mode.
- **Meta-awareness of being tested changes behavior.** When students know a question is "high stakes" (e.g., it contributes to their Readiness Score), they change their answer strategies — spending more time on it, second-guessing more. This is the "evaluation anxiety effect." The interface must not signal which questions are higher-weight in the mastery calculation.
- **The confidence-accuracy calibration gap is itself diagnostic.** Clinical psychology has known since the 1970s that what you think you know and what you actually know are systematically different, and the gap is measurable and correctable. This is the research basis for the pre-session metacognitive confidence rating — one of SlateCamp's most evidence-grounded features.

**Application to metacognitive calibration:**
- Pre-session confidence ratings must feel lightweight — 3 taps maximum. The `pre_session_confidence_ratings` JSONB is populated per-subject. The UI: three horizontal sliders labeled by subject (1 = not confident → 3 = confident). Displayed once before the session starts, never referred to during the session.
- Post-session calibration reveal: show the gap between prediction and actual in a clear visual comparison. Not as failure — as information. "You predicted: Confident (3/3). You scored: 41%. The gap is 59 points." This is the most powerful metacognitive feedback in the product.

---

### The ALE Candidate Context — Testing System Specific

From our ALE candidate research, four specific patterns govern how this interface must be designed:

**Pattern 1 — The calculation time trap.**
Building Laws (BP 344 development controls) and Structural Design questions involving computation take 2–4× longer than recall questions. Students who don't budget for this run out of time on Day 2. The `is_computation_heavy` taxonomy flag must influence how Extended Practice sessions behave — these sessions should include a higher proportion of computation questions to build time budget awareness.

**Pattern 2 — The 2024 IRR version trap.**
The most common error type in Building Laws is `code_version` — students memorized values from pre-2024 materials. The Error Taxonomy captures this explicitly. When a student tags `code_version` 3+ times on the same subject, the platform should surface a targeted comparison table between old and new values. This is actionable intelligence that the error taxonomy makes possible.

**Pattern 3 — Filipino test-taking culture: elimination over selection.**
From our research, Filipino engineering and architecture students have a documented tendency to use process of elimination rather than direct answer selection — a technique explicitly taught in review centers. The option elimination UI (strike-through) is not a nice-to-have; it is culturally expected and affects session validity data. Students who can't eliminate options will guess instead, producing noisier `user_interactions` data.

**Pattern 4 — Proof Simulation anxiety peaks.**
The 24-hour cold delivery for Proof Simulation is one of the most important features in the system — and the most anxiety-inducing to students who don't understand why they can't see their score immediately. The briefing screen before Proof Simulation must explain the rationale in plain language. "Your score is ready, but research shows you'll use it better after a night's sleep. We'll send it to you tomorrow." Not a rule — a reason.

---

## Part 2 — Screen Architecture: The Review Page

### The Three-Zone Structure

The Review page (`/dashboard/testing`) organizes all modes into three zones of increasing cognitive demand. This structure is the primary navigation decision — every mode sits in exactly one zone.

```
/dashboard/testing
├── Zone 01: Foundations
│   ├── Camp Mode        — Guided, immediate feedback
│   └── Chill Mode       — Relaxed, optional answering
│
├── Zone 02: Deliberate Practice
│   ├── Subject Mode     — Focused on one subject
│   ├── Focus Review     — Blindspot Protocol (targeted)
│   └── Custom Session   — Full student control
│
└── Zone 03: Exam Readiness
    ├── Storm Mode       — Timed, deferred feedback
    ├── Proof Simulation — Full exam conditions + 24hr cold delivery
    └── Extended Practice — Area C endurance training
```

**The progressive disclosure principle:**
New users (< 5 sessions completed) see Zone 01 modes prominently, Zone 02 accessible, Zone 03 subtly present but not emphasized. Experienced users (≥ 5 sessions, Readiness Score > 50%) see all zones equally weighted. This is not a hard gate — it's a visual hierarchy that changes.

---

## Part 3 — Screen-by-Screen UX Specification

### Screen 1: Review Hub (`/dashboard/testing`)

**Purpose:** Route the student to the right mode for their current state and goal.

#### Full Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  REVIEW & TESTING              DM Mono 11px uppercase cobalt    │
│  Build Mastery. Earn your Score.  Inter 13px muted              │
│                                                                 │
│  SUGGESTED FOR TODAY        DM Mono eyebrow                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BlindspotAlert or SmartSuggestionCard (conditional)       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ── ZONE 01: FOUNDATIONS ──────────────────────────────────── ─│
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │  [ModeCard: Camp]      │  │  [ModeCard: Chill]     │        │
│  └────────────────────────┘  └────────────────────────┘        │
│                                                                 │
│  ── ZONE 02: DELIBERATE PRACTICE ───────────────────────────── │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Subject    │  │ Focus      │  │ Custom     │               │
│  │ Mode       │  │ Review     │  │ Session    │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                                                                 │
│  ── ZONE 03: EXAM READINESS ─────────────────────────────────  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Storm      │  │ Proof      │  │ Extended   │               │
│  │ Mode       │  │ Simulation │  │ Practice   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### Component: ModeCard (reuses `Card` + new content spec)

Each mode has its own card. The card carries: a one-word subtitle (the mode's character), a one-sentence description, micro-stats from past usage, and a CTA.

**ModeCard anatomy:**
```
┌────────────────────────────────────────────────────────┐
│  ⚡ STORM MODE     DM Mono 9px uppercase, colored label │
│  Timed             Syne 700, 18px — the mode character  │
│                                                         │
│  Exam conditions. No feedback until done.  Inter 13px  │
│                                                         │
│  14 sessions  ·  Last: 72%  ·  47 items/session avg    │
│  ← micro-stats from quiz_sessions history              │
│                                                         │
│  [Start Storm Mode →]   ← primary CTA, cobalt button  │
│                         + Pro badge if locked          │
└────────────────────────────────────────────────────────┘
```

**Left-border color by zone:**
- Zone 01 — No left border accent (neutral/friendly)
- Zone 02 — `border-l-4 border-[#1B3FC4]` (cobalt — deliberate, focused)
- Zone 03 — `border-l-4 border-[#E8853A]` (camp orange — intensity)

**Proof Simulation locked state:**
When the gate conditions are not yet met (Readiness < 65% or endurance not calibrated), the card shows:
```
PROOF SIMULATION  ·  EXAM DAY
Locked
─────────────────────────────────────
Unlock when: Readiness Score ≥ 65%
You're at: 58%  [▓▓▓▓▓▓▓░░░]  Need 7 more points

[What is Proof Simulation?]  ← expandable tooltip
```
The lock is not punitive — it's presented as a milestone to reach. The progress bar shows exactly how far they are.

**Micro-stats behavior:**
- New user (0 sessions): "Start your first session" — no stats shown, no pressure
- 1–4 sessions: "X sessions" only — not enough data for averages
- 5+ sessions: full stats (sessions, last score, avg items)

---

#### Component: SmartSuggestionCard (new custom component)

Appears at the top of the Review Hub when the system has a specific recommendation based on the student's current state.

**Decision logic (priority order):**
1. If a `blindspot_queues` row with `status = 'pending'` exists → show BlindspotAlert variant
2. If `target_exam_date` is within 14 days → show ExamCountdownVariant
3. If any subject has `current_mastery_weight < 0.4` across 5+ nodes → show WeakSubjectVariant
4. If 48+ hours since last session → show ReturnVariant
5. If none of the above → hide the component entirely (no generic filler suggestion)

**BlindspotAlert variant:**
```
┌────────────────────────────────────────────────────────────┐
│  BLINDSPOT PROTOCOL ACTIVE        DM Mono, Signal Red      │
│                                                            │
│  3 Building Laws nodes have been Red for 3 weeks.         │
│  A targeted 12-question session is ready.                  │
│                                                            │
│  BP 344 §C.5 Corridors · PD 1096 §401 · RA 9514 §6       │
│                                                            │
│  [Start Focus Review →]         [Defer to tomorrow]       │
└────────────────────────────────────────────────────────────┘
```
Background `#FFF0EF`, border `#E63329`. Nodes listed are real — pulled from `blindspot_queues.node_ids`.

**ReturnVariant (hiya-safe):**
```
┌────────────────────────────────────────────────────────────┐
│  CONTINUING FROM 3 DAYS AGO                                │
│                                                            │
│  Your last session: Camp Mode · 68% · Structural Design   │
│                                                            │
│  Ready when you are. Camp Mode picks up                    │
│  from your weakest current nodes.                          │
│                                                            │
│  [Start Camp Mode →]                                       │
└────────────────────────────────────────────────────────────┘
```
Neutral background. No "you haven't studied in 3 days" framing. Just: "here's where you left off."

---

### Screen 2: Session Setup (Mode-Specific Pre-Session Screens)

Before every session, a mode-specific setup screen collects configuration and sets expectation. This is not a modal — it is a full screen.

#### Camp Mode Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Review                                               │
│                                                                 │
│  CAMP MODE                DM Mono 11px                         │
│  Guided Study             Syne 700, 24px                       │
│                                                                 │
│  Immediate feedback after each answer.                         │
│  Rationale on every question.                                   │
│  No timer. No pressure.                                        │
│                                                                 │
│  ─── HOW MANY QUESTIONS? ──────────────────────────────────── │
│  [10]  [20]  [30]  [50]  [Custom]                              │
│  ↑ pill selectors, 20 is pre-selected                          │
│                                                                 │
│  ─── CONFIDENCE CHECK ─────────────────────────────────────── │
│  How confident are you in these subjects right now?            │
│                                                                 │
│  Building Laws  [1] ──●────────── [3]                         │
│  Structural     [1] ───────●───── [3]                         │
│  (only subjects targeted by this session's question pool)      │
│                                                                 │
│  ─── FOCUS (optional) ─────────────────────────────────────── │
│  Prioritize weakest nodes (recommended)           ● selected   │
│  Focus on one subject  [▾ Pick subject]                        │
│  Mix all subjects equally                                      │
│                                                                 │
│                          [Start 20-question session →]         │
└─────────────────────────────────────────────────────────────────┘
```

**Design decisions:**
- Question count: pill selectors, not a number input. Defaults to 20 (the research-optimal balance between retrieval practice benefit and session completion rate).
- Confidence check: present only for subjects the question selection algorithm will pull from. Never show all 8 subjects — only the 2–3 relevant ones. Uses a 3-point slider (1–3) because the `pre_session_confidence_ratings` schema stores 1–3 values.
- Focus: three radio options. "Weakest nodes first" is the default and recommended. The system knows where the gaps are — students usually should let it decide.
- The Confidence Check is optional but pre-filled to the center value (2) so skipping it doesn't disrupt the session start flow.

#### Storm Mode Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Review                                               │
│                                                                 │
│  STORM MODE               DM Mono 11px                         │
│  Timed                    Syne 700, 24px                       │
│                                                                 │
│  ─── WHAT STORM MODE IS ───────────────────────────────────── │
│                                                                 │
│  No feedback until you finish. The timer runs as               │
│  a progress bar — not a countdown. You cannot see              │
│  your answers after submitting each one.                       │
│                                                                 │
│  This is how the real ALE works.                               │
│                                                                 │
│  ─── SESSION SETUP ────────────────────────────────────────── │
│  Questions: [25]  [50]  [100]                                  │
│  Time: Set by question count (2 min/question)                  │
│  Selected: 50 questions → 100 minutes                          │
│                                                                 │
│  ─── SUBJECTS ─────────────────────────────────────────────── │
│  ● All subjects (recommended — mirrors real ALE distribution)  │
│  ○ Pick subjects manually                                      │
│                                                                 │
│  ─── WHEN YOU'RE READY ────────────────────────────────────── │
│  Once started, the timer begins. There's no pause.             │
│  You can flag questions to review at the end.                  │
│                                                                 │
│                          [Begin Storm Mode →]                  │
└─────────────────────────────────────────────────────────────────┘
```

**What this screen does psychologically:**
- States the rules plainly before the session begins. No surprises mid-session → less anxiety during.
- "This is how the real ALE works" — frames Storm Mode as preparation, not punishment.
- The time calculation is shown explicitly: "50 questions → 100 minutes." This helps students time-budget before committing.

#### Custom Session Setup (The Most Complex)

```
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOM SESSION           DM Mono 11px                         │
│  Flexible                 Syne 700, 24px                       │
│                                                                 │
│  ─── TOPICS ────────────────────────────────────────────────── │
│  [TaxonomySelector — expandable tree]                          │
│  Architecture: ▾                                               │
│    Building Laws: ▾                                            │
│      □ PD 1096 — National Building Code                       │
│      ☑ RA 9514 — Fire Code [12 questions available]          │
│      ☑ BP 344 — Accessibility Law [8 questions available]    │
│    Structural Design: ▸                                        │
│    ... (expand/collapse)                                       │
│  [Select All]  [Clear]  [My Weakest Nodes ←shortcut]          │
│                                                                 │
│  ─── QUESTION COUNT ───────────────────────────────────────── │
│  ← 5 ─────────────●────────────────────────── 100 →          │
│  30 questions selected  ·  ~45 min estimated                   │
│                                                                 │
│  ─── DIFFICULTY ────────────────────────────────────────────── │
│  ← Foundational ──────────●────────── Expert →               │
│  [Foundational] [Intermediate] [Advanced] [Expert]             │
│  Mixed — all difficulties  ← default                           │
│                                                                 │
│  ─── FEEDBACK STYLE ────────────────────────────────────────── │
│  ● Immediate (Camp Mode feedback — see each answer)            │
│  ○ Deferred (Storm Mode — see everything at the end)           │
│                                                                 │
│  ─── TIMER ─────────────────────────────────────────────────── │
│  ○ No timer                  ← default                         │
│  ● Set timer  [────────  90 min ────────]                      │
│                                                                 │
│                 Questions available: 34 of ~185 total          │
│                          [Start Session →]                     │
└─────────────────────────────────────────────────────────────────┘
```

**Design decisions:**
- "My Weakest Nodes" shortcut auto-populates the topic selector with the student's current Red nodes — the most useful starting point for most custom sessions.
- "Questions available: 34" shows in real-time how many questions match the current configuration. If the combination produces < 10 questions, the Start button is disabled with: "Not enough questions for this combination. Try expanding your topic selection."
- The difficulty slider maps visually to research-backed bands: Foundational (0.0–0.25), Intermediate (0.25–0.5), Advanced (0.5–0.75), Expert (0.75–1.0).

---

### Screen 3: The Active Quiz Session

This screen must disappear. The interface must become invisible so the student's full cognitive resources are on the question. This is the research basis for the stripped UI in Storm Mode — but even Camp Mode should feel calm and focused, not chatty.

#### Active Session Layout (All Modes Base)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ████████░░░░░░░░░░░░  14 / 20]  [⚑ Review later]  │
│  ← 4px thin bar, Cobalt fill, fraction label, right-aligned flag│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  STRUCTURAL DESIGN                     DM Mono 9px, muted      │
│  (subject label — never shown in Storm Mode)                   │
│                                                                 │
│  What is the minimum clear floor-to-ceiling height required    │
│  for habitable rooms under PD 1096?                            │
│                                                                 │
│  ┌─ Option A ─────────────────────────────────────────────────┐ │
│  │  2.00 meters                                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌─ Option B ─────────────────────────────────────────────────┐ │
│  │  2.10 meters                               ← selected      │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌─ Option C ─────────────────────────────────────────────────┐ │
│  │  2.40 meters                       ← crossed out/eliminated │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ┌─ Option D ─────────────────────────────────────────────────┐ │
│  │  2.70 meters                                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [←  Previous]                           [Submit Answer →]    │
└─────────────────────────────────────────────────────────────────┘
```

#### Option States and Interactions

**Default state:** White background, `border-[#E8E4DC]`, `rounded-lg`, min-height 56px (48px touch target + 8px padding top/bottom).

**Hover:** `bg-[#F8F7F5]` — subtle warmth. No border change. Never cobalt on hover — that's selection.

**Selected (not yet submitted):** `bg-[#EEF2FC] border-[#1B3FC4]` — cobalt light background, cobalt border. A radio dot appears to the left.

**Eliminated (strikethrough):** `opacity-60`, text has `line-through` CSS. A ~~strikethrough~~ visual. No color change. Tap-and-hold gesture or a "×" affordance on the right side of the option row.

**After submission — correct:** `bg-[#EAF5EE] border-[#1B7A3C]` — green. Checkmark icon left of the option text.

**After submission — incorrect:** `bg-[#FFF0EF] border-[#E63329]` — red. ✗ icon. The correct answer simultaneously turns green.

**After submission — unchosen correct:** `bg-[#EAF5EE] border-[#1B7A3C]` — shows which was right even if not chosen.

#### Component: ConfidenceTag (new custom component)

**A micro-innovation from clinical psychology research.**

Before the student taps Submit, a small "Sure / Unsure" confidence tag appears in the bottom-left of the option list. This is a single tap — it takes under a second — and it populates `user_interactions.confidence`.

```
┌────────────────────────────────────────┐
│  How sure are you?   [Sure] [Unsure]   │
│  (tap optional — disappears on submit) │
└────────────────────────────────────────┘
```

**Why this is an innovation, not friction:**
- The field already exists in the schema (`confidence TEXT CHECK (confidence IN ('sure', 'unsure'))`)
- It takes one tap, not a rating scale
- It disappears automatically when Submit is tapped without selection
- The data it produces drives the calibration chart in the debrief — which is one of the most insightful features in the product
- Research basis: self-reported confidence before answering is a stronger calibration signal than confidence after (hindsight bias inflates post-answer confidence)

This must feel like a quick check-in, not a second question. Keep it small (Inter 12px), keep it optional (never blocks Submit), keep it visually subordinate to the options above it.

#### Component: QuestionNavigatorGrid (new custom component)

Accessible via a small grid icon in the top-right corner (next to the flag button). Opens a bottom sheet on mobile, a side drawer on desktop.

```
SESSION NAVIGATOR
────────────────────────────────
 1  2  3  4  5  6  7  8  9  10
11 12 13 14 15 16 17 18 19  20

Legend:
■ Answered   □ Not yet   ⚑ Flagged

[Close]
```

Each cell is a tappable button that jumps to that question number. Color coding:
- `bg-[#1B7A3C]` — answered correctly (Camp Mode only — never in Storm Mode)
- `bg-[#E8E4DC]` — answered but not yet revealed (Storm Mode state)
- `bg-white border border-[#E8E4DC]` — not yet answered
- `bg-[#F5A623]` — flagged for review

**Storm Mode restriction:** In Storm Mode, the navigator shows only answered/unanswered/flagged — never correct/incorrect. Knowing you're getting items right mid-session affects pacing behavior.

#### Storm Mode Timer Specification

The timer is a thin progress bar at the very top of the screen, above all content. It is NOT a countdown number.

```
[████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░]
← 4px, full-width bar. No numbers. No labels during session.
```

**Color transitions:**
- > 20% remaining: `bg-[#1B3FC4]` (cobalt — normal)
- 10–20% remaining: `bg-[#E8853A]` (camp orange — attention without panic)
- **NEVER RED.** Signal Red (`#E63329`) triggers a physiological stress response. This is a non-negotiable constraint from the product intent documentation, backed by the Jamieson et al. (2010) arousal reattribution research.

---

### Screen 4: Post-Answer Rationale Panel (Camp Mode Only)

When a student submits an answer in Camp Mode, the rationale appears below the question. The question and all options remain visible — the rationale does not replace them. This is the split-screen moment where the correction happens.

```
┌─────────────────────────────────────────────────────────────────┐
│  [Question text — unchanged]                                    │
│                                                                 │
│  [Option A]  [Option B ← wrong, selected]                       │
│  [Option C ← correct, highlighted green]  [Option D]           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  WHY C IS CORRECT              DM Mono 9px, cobalt             │
│                                                                 │
│  Under PD 1096 Section 808, the minimum clear ceiling          │
│  height for habitable rooms is 2.10 meters (2.40 meters        │
│  for residential ground floor). Option B is 2.00 meters —     │
│  this is the standard for storage rooms, not habitable         │
│  spaces.                                                        │
│                                                                 │
│  📖 PD 1096, Rule VII, Section 808              ← code_citation │
│                                                                 │
│  [Read full article →]    ← wiki_article link if model_id set  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  What happened there?          ← error taxonomy prompt         │
│  [Knowledge gap] [Misread] [Similar options] [Old code] [Time]  │
│                                                                 │
│                                          [Next Question →]     │
└─────────────────────────────────────────────────────────────────┘
```

#### Component: ErrorTaxonomyPrompt (new custom component)

Appears **only after wrong answers** in Camp Mode. Five tap targets. One tap — no confirmation needed. The taxonomy tag is written to `user_interactions.error_type`.

```
WHAT HAPPENED?      DM Mono 9px, muted

[Knowledge gap]  [Misread]  [Two options looked similar]
[Wrong code version]  [Would've got it with more time]
```

**Design rules:**
- All five options visible at once — no dropdown, no scroll
- Neutral pill buttons — no color coding that suggests one answer is "better" than another
- The prompt disappears automatically when "Next Question →" is tapped without selection
- Never shown for correct answers — only wrong answers

**The value of this single interaction:**
This one 1-second tap produces data that drives the entire intervention system. When `distractor` dominates a student's error pattern → comparison table intervention is recommended. When `code_version` dominates → version clarification article is linked. The entire error taxonomy feature hangs on whether this UX makes tagging feel effortless — which it does if the options are always visible and never interruptive.

#### 3D Lab Link (Contextual)

When a wrong answer involves a topic where `questions.model_id` is populated (a 3D Lab model exists for this topic), a second CTA appears alongside "Read full article →":

```
🏛️ See this in 3D   ← links to the specific 3D Lab module
```

This is the most powerful intervention in the platform: a student who fails a spatial code question (corridor clearances, cubicle dimensions, door approach space) and immediately goes to the 3D Lab to see why they were wrong encodes the correction in both verbal and spatial memory. This is the dual-coding benefit we documented in the 3D Visual Learning research.

---

### Screen 5: Session Debrief

The post-session debrief is where the most learning happens. This is the "video session" — the moment the student analyzes their performance with full information.

#### Primary Debrief Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SESSION COMPLETE             DM Mono 11px, muted              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │           17 / 20               Syne 700, 48px           │  │
│  │           correct               Inter 14px, muted        │  │
│  │                                                          │  │
│  │           85%                   Syne 700, 32px, green    │  │
│  │                                                          │  │
│  │  "Strong session. You're locking this in."               │  │
│  │  ← Confidence companion copy — see copy table below      │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  READINESS SCORE UPDATE        DM Mono eyebrow                 │
│  62% → 65%  (+3)               Inter 600, 18px, cobalt delta   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  NODE MASTERY UPDATES          DM Mono eyebrow                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BP 344 §C.5 Corridors     ◌ → ●  Red → Amber  (+0.18)   │ │
│  │  PD 1096 §808 Room Heights ●● ●●  Amber → Green (+0.22)   │ │
│  │  RA 9514 Travel Distance   ◌ ◌    Still Red   (+0.06)     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  QUESTION REVIEW               DM Mono eyebrow                 │
│  [QuestionReviewStrip — custom component]                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [Retry wrong answers (3) →]   [Start new session →]          │
└─────────────────────────────────────────────────────────────────┘
```

**Score copy table (Camp Voice — no toxic positivity, no catastrophizing):**

| Score | Copy |
|---|---|
| ≥ 80% | "Strong session. You're locking this in." |
| 60–79% | "Solid ground. A few gaps to close — check the breakdown below." |
| 40–59% | "You found the edges of your knowledge. That's exactly the point." |
| < 40% | "Tough round. The explanations below are where the real learning happens." |

These are exact strings. Never deviate. Never add exclamation marks. Never add "don't worry."

---

#### Component: NodeMasteryUpdateStrip (new custom component)

Shows every taxonomy node touched in this session, with their before/after mastery state transition. This is one of the most important components in the debrief — it makes the abstract Readiness Score change feel concrete.

```
NODE MASTERY UPDATES    DM Mono 9px

ALE-DSGN-003-02  BP 344 Corridors
  ◌ → ●   Red → Amber    +18 pts

ALE-STRC-001-05  Structural Steel Connections
  ●●●● → ●●●●●   Green (+8 pts)  ← already mastered, consolidated

ALE-DSGN-002-01  PD 1096 Room Heights
  ◌ → ◌   Still Red     +3 pts   ← limited change
```

**Visual encoding:**
- Node state dots: ◌ (grey/unexplored), ● (red), ●● (amber), ●●● (green) — a dot-count system that is colorblind-friendly
- Transition shown as `→` with before and after states
- Mastery delta shown as `+N pts` in small DM Mono

**What not to show:** Nodes where the student's answers were flagged as `is_suspected_lucky_guess` and the mastery contribution was therefore reduced to 0.3× — do not surface this distinction in the UI. The mastery update will appear smaller than expected for those nodes; no explanation needed. Showing the lucky guess flag creates anxiety and teaches gaming behavior.

---

#### Component: QuestionReviewStrip (new custom component)

**Inspired by sports analytics "play-by-play replay" and medical simulation post-debrief.**

The session is replayed as a horizontal strip of question tiles. The student scrolls through them in order — it is temporal, not alphabetical or by topic. This sequencing has a psychological reason: the student relives the session in context, connecting the momentum of the session to their performance.

```
Q1  Q2  Q3  Q4  Q5  Q6  Q7  Q8  Q9  Q10 ...
✓   ✓   ✗   ✓   ✓   ✗   ⚑  ✓   ✓   ✗
```

Each tile is a small 40×40px square. Color:
- `#EAF5EE` (light green): correct
- `#FFF0EF` (light red): wrong
- `#FFF8E6` (light gold): flagged
- `#E8E4DC` (neutral): correct + flagged

Tap a tile → expands a detail panel below the strip showing:
- Question text (full)
- The student's answer and the correct answer
- Rationale (full SME text)
- `code_citation` as a styled reference: `PD 1096 § 808`
- `time_spent_ms` converted to readable form: "Took 28 seconds"
- `answer_changes`: "Changed answer 1 time" (if > 0)
- Error type tag if selected: "Tagged: Two options looked similar"
- "See in 3D Lab →" if `model_id` is populated

**The "Retry Wrong Answers" button:**
Creates a new Camp Mode session targeting only the question IDs where `is_correct = false` in this session. This is the highest-leverage action in the entire debrief — the Testing Effect is strongest when retrieval practice follows immediately after a missed question.

---

#### Component: CalibrationReveal (new custom component — debrief innovation)

**Appears only when pre-session confidence ratings were set.** This is the metacognitive calibration feature — one of the most research-grounded innovations in the platform.

```
YOUR CALIBRATION                DM Mono eyebrow

  Building Laws
  You predicted: ■■■ (Confident)
  You scored:    47%
  Gap:           You were overconfident by 2 levels

  Structural Design
  You predicted: ■□□ (Not confident)
  You scored:    82%
  Gap:           You were underconfident — you know this better than you think

─────────────────────────────────────────────────────
Your calibration score: 58/100
(Higher is better — it means you know what you know)
```

**Visual design:**
- Confidence prediction shown as filled ■ blocks (1, 2, or 3 blocks)
- Actual score shown as a percentage
- Gap described in plain language — always neutral, never shaming
- Calibration score is a computed value: 100 - (sum of |predicted_level - actual_accuracy_level| across subjects)

**The over/underconfident framing:**
Both errors are presented neutrally. "Overconfident" is not worse than "underconfident" — both are gaps in self-knowledge. Over time, improving calibration is a separate axis of growth from raw accuracy improvement. A student whose calibration score improves from 40 to 75 over 8 weeks has made a cognitive growth that raw Readiness Score doesn't capture.

---

#### Extended Practice Debrief Addition: BlockAccuracyChart (new custom component)

Only shown for Extended Practice / endurance sessions. This is the sports analytics "fatigue map" for cognitive performance.

```
ACCURACY BY BLOCK               DM Mono eyebrow

Items 1–10    ████████████████ 90%  ← block 1
Items 11–20   ██████████████░░ 75%  ← block 2
Items 21–30   ████████████░░░░ 67%  ← block 3
Items 31–40   ██████████░░░░░░ 52%  ← block 4
Items 41–50   ████████░░░░░░░░ 42%  ← FATIGUE THRESHOLD

───────────────────────────────────────────────
Your reliable performance window: ~35 questions
(Accuracy stays above 70% through Item 35)

The ALE Day 2 requires sustained performance for 100+ items.
Target: extend this window by 10% each week.
Next session target: ~39 questions above 70%.
```

**The fatigue threshold annotation:**
The point where accuracy first drops below 70% is annotated with a vertical reference line. No shame attached. The copy: "Your reliable performance window: X questions" — presents the measurement neutrally and the next target positively.

**Recharts implementation:**
```tsx
<BarChart data={accuracyByBlock}>
  <Bar dataKey="accuracy" fill="#1B3FC4" radius={[4, 4, 0, 0]}>
    {/* Color bars below threshold differently */}
    <Cell fill={block.accuracy >= 0.70 ? '#1B3FC4' : '#E8853A'} />
  </Bar>
  <ReferenceLine y={0.70} stroke="#E63329" strokeDasharray="4 4"
    label={{ value: "70% threshold", position: "insideTopLeft",
             fontSize: 10, fontFamily: "DM Mono" }} />
</BarChart>
```

---

### Screen 6: Proof Simulation Flow

The Proof Simulation is the highest-stakes interaction in the entire platform. Its UX has three distinct phases: pre-simulation briefing, the simulation itself, and the 24-hour cold delivery.

#### Pre-Simulation Briefing

```
┌─────────────────────────────────────────────────────────────────┐
│  PROOF SIMULATION              DM Mono 11px, cobalt            │
│  Exam Day                      Syne 700, 28px                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  What this is:                                                  │
│                                                                 │
│  200 questions. Real exam conditions. A timer.                  │
│  No feedback during. No turning back.                           │
│                                                                 │
│  When you finish:                                               │
│                                                                 │
│  Your score will be ready tomorrow.                            │
│  Research shows scores are more useful after a night's sleep — │
│  you'll read the results clearly, not defensively.             │
│                                                                 │
│  This is not a punishment — it's how the real ALE works.       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  YOUR READINESS GATE: ✓                                         │
│  Readiness Score: 69% (minimum: 65%) ✓                         │
│  Endurance calibration: Pending  ← shows if missing            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  This session will take approximately 5–6 hours.               │
│  It can be paused — your progress is saved every 10 questions.  │
│                                                                 │
│                   [I'm ready. Begin Simulation →]              │
│                   [Come back when I'm more prepared]           │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- The 24-hour cold delivery is explained with the rationale — not as a rule but as a reason. "You'll read the results clearly, not defensively." This is the honest, respectful framing.
- The pausing mechanic is disclosed upfront. Students shouldn't discover partway through that they can pause — they need to plan their session accordingly.
- "I'm ready" phrasing for the CTA, not "Start." Implies commitment.
- The gate status is shown transparently. If endurance is pending: "Endurance calibration: Pending. Your simulation will still run — the pressure gap analysis requires this to be accurate." Not a hard block — an honest limitation.

#### Cold Delivery Screen (24 hours later)

```
┌─────────────────────────────────────────────────────────────────┐
│  PROOF SIMULATION RESULTS      DM Mono 11px, cobalt            │
│  Completed: [date/time]                                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│           74%                 Syne 800, 72px, colored          │
│           overall             Inter 14px, muted                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  YOUR PRESSURE GAP                                              │
│                                                                 │
│  Regular Readiness Score:    72%                                │
│  Proof Simulation Score:     61%                                │
│  Pressure Gap:               -11 points                         │
│                                                                 │
│  "Your preparation is solid. Under exam conditions,             │
│  you scored 11 points lower than your regular sessions.        │
│  The Extended Practice Endurance sessions are specifically      │
│  designed to close this gap."                                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  BY SUBJECT                   (per-subject breakdown)          │
│  [SubjectBreakdownBars — existing + enhanced]                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  WHAT'S NEXT                                                    │
│  [SmartNextAction — recommended based on simulation results]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**The Pressure Gap component:**
This is a signature feature — not present in any competitor product. The gap between a student's preparation score and their exam-condition score is one of the most actionable diagnostics SlateCamp can produce. The copy is always specific: cite the exact gap number and the specific intervention that addresses it.

---

## Part 4 — New Visualization Innovations

### Innovation 1: PacingQuadrant

**The most novel visualization in the testing system.** Borrowed from sports analytics (NBA efficiency charts, NFL NextGenStats positioning).

**What it answers:** "Am I rushing on topics I'm weak on? Am I overthinking topics I know well?"

A scatterplot where every topic the student has answered questions on becomes a dot. X-axis: average time per question (ms). Y-axis: accuracy percentage. The two axes create four behavioral quadrants:

```
100% │                    │
     │   CAREFUL          │   MASTERED
     │   (slow + correct) │   (fast + correct)
     │                    │
 70% │ ── ── ── ── ── ── PASSING THRESHOLD ── ── ── ──
     │                    │
     │   STRUGGLING       │   RUSHING
     │   (slow + wrong)   │   (fast + wrong)
  0% │                    │
     └────────────────────────────────────────────────
     Fast                Avg                      Slow
```

**Visual encoding:**
- Each dot is a taxonomy node (or subject-level grouping). Dot size = number of attempts.
- Color = subject (consistent color coding across all visualizations in the platform).
- Quadrant backgrounds: soft, non-intrusive fills. Mastered quadrant: very light green tint. Rushing quadrant: very light amber. Struggling: very light red. Careful: very light cobalt.

**The insight this produces:**
A student whose "Building Laws" cluster sits in the Rushing quadrant is answering quickly AND getting them wrong — they're not thinking carefully about these questions. A student in the Careful quadrant on Structural Design is taking their time AND getting them right — their approach is working. The quadrant tells them which behavior to change.

**Where it surfaces:** Post-session debrief (summary view) + Analytics Dashboard (detailed view with subject filtering).

---

### Innovation 2: TemporalAccuracyHeatmap

**Borrowed from health science: circadian rhythm monitoring and shift-work performance research.**

**What it answers:** "When in the day and when in a session does my performance peak and drop?"

A two-axis heatmap where:
- X-axis = question position in session (1–5, 6–10, 11–15... buckets)
- Y-axis = time of day the session started (morning 6–12 / afternoon 12–18 / evening 18–24)
- Cell color = accuracy in that time-slot × position combination

```
            Q1-5  Q6-10  Q11-15  Q16-20  Q21-25
Morning     92%   88%    85%     81%     79%
Afternoon   78%   74%    68%     64%     60%   ← drops off fast
Evening     85%   82%    80%     77%     75%
```

**What this tells the student:** "Morning sessions have the best start-to-finish consistency. Your afternoon sessions show a 32% accuracy drop after question 10 — this is when fatigue compounds with afternoon cognitive dip." This is actionable scheduling intelligence.

**Implementation note:** Requires `started_at` timestamp from `quiz_sessions` + `question_order` + `is_correct` from `user_interactions`. Both are already in the schema. The computation is a GROUP BY query over session start time bucket × question position bucket.

---

### Innovation 3: ErrorAnatomyRadar

**Borrowed from medical education: diagnostic reasoning pattern analysis.**

**What it answers:** "What type of error is holding me back?"

A radar/spider chart where the 5 error taxonomy types are the axes, and the student's error frequency in each category (as a percentage of total wrong answers) determines the radius.

```
        Knowledge Gap
             │
  Code       │        Misread
  Version ───┼─────────────
             │
   Time ─────┼──── Similar Options
  Pressure   │
```

**What makes this innovative:** Most students assume their primary error is "knowledge gap" — they think they don't know enough. The Error Anatomy Radar often reveals something different: many students primarily fail due to `distractor` (two options looked similar) or `misread` (reading the question incorrectly) — both of which are strategy problems, not content problems. This realization changes how a student approaches their studying.

**Where it surfaces:** Analytics Dashboard, and as a mini-version in the session debrief for sessions with 5+ wrong answers.

---

## Part 5 — Existing Components to Reuse

| Component | Use |
|---|---|
| `Button` | All CTAs throughout. Default (cobalt), outline (second action), ghost (tertiary) |
| `Badge` | Mode labels (CAMP MODE), zone labels, Pro gate badges |
| `Card` | ModeCard base wrapper |
| `Progress` | Session progress bar base (with custom styling) |
| `Tabs` | Zone tabs on the Review Hub if switching to tab-based navigation |
| `Skeleton` | Loading states for ModeCards, debrief components |
| `Dialog` / `Drawer` | QuestionNavigatorGrid (bottom sheet on mobile) |
| `Tooltip` | Mode descriptions on hover, code citation explanations |
| `ScrollArea` | QuestionReviewStrip horizontal scroll |
| `Separator` | Between sections in debrief |

---

## Part 6 — New Custom Components to Build

| Component | File | Purpose |
|---|---|---|
| `SmartSuggestionCard` | `components/testing/SmartSuggestionCard.tsx` | Context-aware top recommendation (Blindspot, exam countdown, return) |
| `ModeCard` | `components/testing/ModeCard.tsx` | Mode selector card with micro-stats and progressive disclosure |
| `ConfidenceTag` | `components/testing/ConfidenceTag.tsx` | Sure/Unsure pre-submit confidence micro-prompt |
| `QuestionNavigatorGrid` | `components/testing/QuestionNavigatorGrid.tsx` | Session overview grid (bottom sheet) |
| `ErrorTaxonomyPrompt` | `components/testing/ErrorTaxonomyPrompt.tsx` | Post-wrong-answer 5-option tag strip |
| `NodeMasteryUpdateStrip` | `components/testing/NodeMasteryUpdateStrip.tsx` | Per-node before/after mastery transition display |
| `QuestionReviewStrip` | `components/testing/QuestionReviewStrip.tsx` | Horizontal temporal question replay with detail expansion |
| `CalibrationReveal` | `components/testing/CalibrationReveal.tsx` | Pre-session confidence vs. actual accuracy comparison |
| `BlockAccuracyChart` | `components/testing/BlockAccuracyChart.tsx` | Recharts bar chart for Extended Practice fatigue analysis |
| `PacingQuadrant` | `components/testing/PacingQuadrant.tsx` | Speed vs. accuracy scatterplot by topic |
| `TemporalAccuracyHeatmap` | `components/testing/TemporalAccuracyHeatmap.tsx` | Time-of-day × question position accuracy grid |
| `ErrorAnatomyRadar` | `components/testing/ErrorAnatomyRadar.tsx` | Recharts RadarChart for error taxonomy breakdown |
| `PressureGapDisplay` | `components/testing/PressureGapDisplay.tsx` | Proof Simulation regular vs. exam-condition score delta |
| `ProofSimBriefing` | `components/testing/ProofSimBriefing.tsx` | Pre-simulation full briefing screen |
| `StormModeTimer` | `components/testing/StormModeTimer.tsx` | 4px progress bar, cobalt → orange, never red |

---

## Part 7 — Active Session UI Rules (Non-Negotiable)

These rules must never be broken. Each one is grounded in research or explicit product decisions.

**1. No Syne typeface during quiz sessions.** The quiz interface uses Inter exclusively. Syne is for landmarks — marketing, headings, page titles. During a quiz, the interface must be invisible. Editorial typography is the opposite of invisible.

**2. Timer NEVER goes red.** `#E8853A` (Camp Orange) at the 10% remaining threshold. This is a hard constraint from Jamieson et al. (2010) — red triggers physiological stress and degrades performance.

**3. No time-per-question display during sessions.** `time_spent_ms` is captured silently. Showing it live creates monitoring anxiety (Carver & Scheier, 1981). It appears only in the post-session debrief.

**4. No "X questions wrong" running score during Storm Mode.** Students in Storm Mode may not see their running score until the session completes. The QuestionNavigatorGrid shows only answered/unanswered/flagged — never correct/incorrect.

**5. Progress bar uses fraction, never percentage.** "14 / 20" not "70%." The absolute count is orienting; the percentage is pressure.

**6. Rationale appears below the question in Camp Mode, never replacing it.** The student must be able to see their wrong answer alongside the correct answer simultaneously. The correction must connect to the error.

**7. All option rows: min-height 56px on mobile.** 48px minimum touch target + 8px padding. This is not negotiable on a Filipino mid-range Android at 390px width.

**8. Subject labels never shown in Storm Mode or Proof Simulation.** Subject labels influence pacing behavior — students slow down on perceived "hard subjects." Removing the label equalizes the psychological weight of each question.

---

## Part 8 — Edge Cases and States

### Free User Experience

Free users see the Review Hub but can only access Camp Mode (easy questions, 20/day cap) and Chill Mode. All Zone 02 and Zone 03 mode cards show a Pro badge. The CTA changes from "Start [Mode]" to "Upgrade to Access."

**The free session cap UX:** When a free user has used 20 questions for the day, the next question submission shows: "You've used your 20 daily questions. Reset tomorrow at midnight — or upgrade to Pro for unlimited sessions." Not a hard block mid-question (that would be a terrible experience) — the counter is visible on the mode selector screen and a soft warning appears at question 18–19.

### Resume Mid-Session

If a student closes the app mid-session, `quiz_sessions.status` remains `in_progress`. On next visit to `/dashboard/testing`, show a persistent resume banner:

```
SESSION IN PROGRESS             DM Mono label, cobalt
Camp Mode · Question 8 of 20 · ~12 min remaining

[Resume →]          [Abandon session]
```

Abandoning sets `status = 'abandoned'`. The interactions already logged are preserved and count toward mastery.

### Assessment Quiz First-Time State

The 35-item Assessment Quiz is not a mode on the Review Hub — it is surfaced only once during onboarding. If a returning user whose `assessment_completed_at` is null somehow lands on the Review Hub, they are redirected to the assessment flow with: "Complete your diagnostic first to unlock personalized sessions."

### Error States

| Error | Treatment |
|---|---|
| Question fails to load | "Couldn't load this question. Tap to retry." — shows a placeholder card with a retry button. Does not advance the session automatically. |
| Session save fails | The session continues client-side. On session complete, retry the save. Show: "Saving your session... (if this takes too long, your answers are stored locally)." |
| Proof Simulation score not available after 24hr | "Your Proof Simulation results will be available soon. We'll notify you when they're ready." — with a timestamp of when the session completed. |

---

## Part 9 — Implementation Phases

### Phase 1 — Review Hub Restructuring (Week 1)
- Restructure `/dashboard/testing` into three named zones
- Build `ModeCard` with progressive disclosure (new/experienced user states)
- Build `SmartSuggestionCard` (BlindspotAlert, ReturnVariant, WeakSubjectVariant)
- Implement micro-stats from `quiz_sessions` history per mode

### Phase 2 — Active Session Interface (Week 2)
- `ConfidenceTag` component for pre-submit confidence capture
- `QuestionNavigatorGrid` (bottom sheet)
- `ErrorTaxonomyPrompt` for post-wrong-answer tagging
- `StormModeTimer` with Camp Orange threshold
- 3D Lab link from Camp Mode rationale panel

### Phase 3 — Session Debrief (Week 3)
- `QuestionReviewStrip` horizontal temporal replay
- `NodeMasteryUpdateStrip` before/after transitions
- `CalibrationReveal` for pre-session confidence gap
- `BlockAccuracyChart` for Extended Practice
- "Retry wrong answers" new session creation

### Phase 4 — Visualization Innovations (Week 4)
- `PacingQuadrant` scatterplot (post-debrief + analytics page)
- `ErrorAnatomyRadar` radar chart
- `TemporalAccuracyHeatmap` (analytics page)
- `PressureGapDisplay` for Proof Simulation results

### Phase 5 — Proof Simulation Full Flow (Week 5)
- `ProofSimBriefing` full screen
- Cold delivery notification + results screen
- Session pause/resume mechanic
- Gate display with Readiness Score progress

---

*SlateCamp — Testing & Review System UX Research & Implementation Plan*
*Version 1.0 · March 2026*
*Source references: Review & Testing System Product Document v1.0, Design System (Cobalt #1B3FC4), UX Research Deep-Dive, 3D Visual Learning Research, DB Schema Reference, Camp Trail UX Plan, Gamification Research*

