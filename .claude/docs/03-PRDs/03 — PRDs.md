# 03 — PRDs

Product Requirement Documents for SlateCamp's core features — the "Big Six."

---

## Feature Index

Each feature PRD covers: objective, UX/UI specs, educational design, software architecture, and data schemas.

| **#** | **Feature** | **Codename** | **Priority** |
| --- | --- | --- | --- |
| 1 | SlateCamp Wiki | Taxonomy-Mapped CMS | P0 — Foundation |
| 2 | Adaptive Testing & Quizzing Engine | The Diagnostic Core | P0 — Foundation |
| 3 | Personal Notes & Workspace | The Synthesis Ledger | P1 — Core |
| 4 | Interactive Media & 3D Lab | The Spatial Engine | P1 — Core (Marketing Spear) |
| 5 | AI Contextual Tutor | Bulletproof RAG Engine | P2 — Premium |
| 6 | Analytics Dashboard | The Performance Heatmap | P0 — Foundation |

---

## PRD 1: The SlateCamp Wiki

**Objective:** A universally adaptable, Markdown-based knowledge repository — the centralized source of truth for all licensure exam content.

### UX/UI Specs

- **Typographic Ergonomics:** Line lengths capped at 65–75 characters; clean sans-serif for UI (Inter), high-readability serif/sans for body
- **The Slate Visual System:** Dark mode native with deep slate grays (`#1E293B` to `#0F172A`); soft off-white light mode
- **Zen Mode:** Single toggle collapses nav and side elements, centering the text column
- **Sticky Wayfinding:** Dynamic breadcrumbs (top) + sticky ToC highlighting active section (right)

### Core Functionality

- **Highlight-to-Action Toolkit:** Floating popover on text selection → *Capture*, *Ask AI*, *Quiz Me*
- **Peek-View References:** Hover = tooltip summary; Click = slide-out drawer (zero context-switching)
- **Omnibar Search (Cmd+K):** Global typo-tolerant search via `cmdk` — results categorized by Wiki, Images, Notes

### Data Rules

- Every article maps to `topic_id` in the Master Syllabus Taxonomy
- No orphan pages — CMS prevents publishing without taxonomy assignment
- Schema: `article_id`, `topic_id` (FK → taxonomy), `title`, `content` (Markdown), `last_updated`, `author_id` (FK → SME)

---

## PRD 2: Adaptive Testing & Quizzing Engine

**Objective:** Systematically transition users from passive reading to active recall by measuring competence against the master syllabus.

### UX/UI Specs

- **Syllabus Selector:** Subject-based cascading checkbox tree (Level 1: Subject → Level 2: Module → Level 3: Topic) with live item counter
- **Camp Mode:** Instant green/red feedback, expanded rationale blocks, no timer
- **Storm Mode:** Strict countdown, no feedback until submit, tab-switching doesn't pause
- **Arsenal:** Strike-through tool, Flag for Review pins, question grid navigator

### Educational Design

- **Algorithmic Remediation:** SME-written rationales for every option + "Teleport Link" to exact Wiki paragraph
- **Spaced Repetition:** Topics scored <50% silently flagged; future quizzes over-index weak nodes
- **Cognitive Stratification:** Level 1 (Recall) → Level 2 (Application)

### Architecture

- Full quiz payload delivered as single JSON array upfront (offline-capable)
- State auto-saves every 10 seconds (timer, answers, flags)
- Schema: `question_id`, `subject_id`, `topic_id`, `question_text` (Markdown), `options` (JSON), `rationale` (Markdown), `difficulty_level`

---

## PRD 2.1: Testing & Quizzing — Complete Feature Specification

**Codename:** The Diagnostic Core — Full Spec

**Status:** Canonical reference for Feature 2 implementation. Expands the PRD 2 summary above into every state, algorithm touchpoint, and educational psychology decision.

---

### Section 0 — Foundational Design Principles

Before any step-by-step, these four principles govern every decision in the testing experience.

**1. The Learning Moment is the Mistake.** Every error is a teaching opportunity, not a failure state. The UX must treat wrong answers with more care and more screen real estate than correct ones. The rationale block after a wrong answer is the most important piece of educational UI in the entire product.

**2. Feedback Timing is Pedagogy.** When a student gets feedback is not a UX preference — it is an educational choice with real cognitive consequences. Camp Mode (immediate) and Storm Mode (delayed) are not just cosmetically different; they train different cognitive skills. This distinction must be airtight in implementation.

> **Campfire Rebrand Note:** The following IP names have different student-facing labels in the UI:
> - Blindspot Protocol™ → "Focus Review" in student UI
> - Endurance Cycle™ → "Extended Practice" in student UI
> - Proof Simulation™ → "Full Exam Simulation" in student UI
> - "drill" → "practice" / "session" in student UI
> Internal docs retain the IP/trademark names for legal purposes.

**3. No Question Exists in Isolation.** Every question answered feeds the Readiness Score™, the Taxonomy Heatmap™, the Lucky Guess Detector™, and the Blindspot Protocol™. The quiz is never just a quiz — it is the data collection engine for the entire platform's intelligence. Every `question_id`, `time_spent_ms`, and `is_correct` field is a signal.

**4. The Student's Confidence Must Be Calibrated, Not Just Built.** Overconfidence is as dangerous as under-preparation. The Lucky Guess Detector™ exists precisely because feeling ready is not the same as being ready. Every feature decision must serve accurate self-assessment, not just feel-good metrics.

---

### Section 1 — Testing Hub (Mode Selection)

**URL:** `/testing`

**Purpose:** Entry point for all quiz and exam activity. Not just navigation — this screen should orient the student toward the *right mode for their current state.*

**What the screen renders:**

The current interface shows four options. The spec adds a fifth visible card and a persistent "Today's Recommendation" banner.

**Recommended addition — "Today's Recommendation" banner** (above the mode cards): A system-generated, data-driven suggestion based on the student's Taxonomy Heatmap™ and last session timestamp. Example: *"Your last session was 3 days ago. Your Structural Design node dropped to 48%. We recommend a Camp Mode session targeting that topic today."* This banner links directly to a pre-configured session — one tap to start.

**Mode cards:**

| **Card** | **Tagline** | **When to Use** | **Visual Signal** |
| --- | --- | --- | --- |
| Camp Mode | "Learn as you go" | First pass on new topics, building foundations | Teal, brain icon |
| Chill Mode | "Browse and absorb" | Passive review, pre-sleep review, low-energy days | Blue, calm icon |
| Storm Mode | "Test yourself for real" | 2–4 weeks before exam, simulating exam day | Coral/red, lightning icon |
| Custom Session | "Your rules" | Targeted topic drilling, any time | Purple, sliders icon |
| Blindspot Mode *(proposed)* | "Attack your weak spots" | When the system has detected avoided topics | Amber, crosshair icon |

---

### Section 2 — Session Configuration (Shared Pre-Session Flow)

This is the configuration screen that appears after selecting any mode (Camp, Storm, or Custom). Chill Mode skips most of this and goes directly into an infinite feed.

**Step 1: Syllabus Selector**

- Renders a cascading checkbox tree: **Subject → Module → Topic**
- Example: `Architecture Profession (Subject) → Professional Practice (Module) → RA 9266 (Topic)`
- Each leaf node shows: question count available, current mastery % (color-coded), and a small lock icon if gated behind a paid tier
- "Select All" toggle at the top
- Live counter: *"312 questions available from your selection"*
- UX behavior: selecting a parent auto-selects all children; unselecting a parent deselects all children; partially selected parents show an indeterminate state

**Step 2: Question Count Picker**

- Quick selects: 5 / 10 / 20 / 50
- Custom input field: type any number
- Smart warning if selected count exceeds available questions: *"Only 34 questions available for this topic selection. Adjust or enable repetition?"*
- For Storm Mode only: hidden and replaced with the full ALE exam format (100 questions across 10 subjects, proportional distribution)

**Step 3: Difficulty Filter (optional, expanded by default)**

- Toggle: Mix (recommended) / Recall Only / Application Only
- Maps to `difficulty_level` in the `questions` schema
- Default: Mix — the system algorithmically distributes via IRT

**Step 4: Confirmation Screen**

- Summary card: "15 questions · Mixed difficulty · Structural Design + Professional Practice"
- Estimated time: dynamically calculated based on mode (Camp: ~2 min/question, Storm: per-exam timing rules)
- One large CTA: "Start Session"

**Step 5: Loading State**

- Full quiz payload fetched as a single JSON array (offline-capable per PRD architecture)
- Loading is animated, brief (< 2 seconds on any reasonable connection)
- State auto-save initialized — every 10 seconds during the session

---

### Section 3 — Camp Mode — Complete Step-by-Step

**Educational psychology rationale:** Camp Mode is built on the *testing effect* — the well-documented finding that attempting to retrieve information from memory produces stronger learning than re-reading. Immediate feedback is critical here because the student's mind is still "active" on the question — the rationale lands while attention is fully engaged. This mode builds *conceptual understanding*, not just exam stamina.

#### Pre-Question State

**Step 1: First question renders.**

- Full screen focus. No distractions.
- Top bar: Question counter (`Question 1 of 15`), subject tag (`Structural Design`), topic tag (`Steel Connections — Bolted`)
- No timer displayed
- Progress bar at top: fills as questions are completed (not just answered — completed with rationale reviewed)

**Step 2: Question text renders.**

- Markdown-rendered question with any embedded diagrams or images if applicable
- 4 options labeled A, B, C, D in clean selectable cards
- Each option card: full text, hover state, accessible keyboard navigation

**Step 3: Toolbar renders below options.**

- Strike-through tool: Click/tap option → option text appears with strikethrough styling, option grayed out (still selectable to undo). Pedagogical purpose: teaches elimination strategy — a real exam skill.
- Flag for Review: bookmark icon — marks this question for return after session; appears in post-session review
- Question Navigator: Small grid icon showing all question numbers; flagged = orange dot, answered = filled dot, current = highlighted

#### The Answer Moment

**Step 4: Student taps/clicks an option.**

- Selected option highlights in a neutral blue immediately (selection confirmed)
- A **0.4-second deliberate pause** before the confirm button appears — prevents "panic clicking" from accidentally triggering the answer reveal and forces a micro-moment of reflection
- The confirm button appears: "Submit Answer" — the student must commit

**Why two steps?** Accidental taps on mobile are real. More importantly, the act of confirming the answer increases commitment and makes the subsequent feedback more cognitively impactful. The brain's response to feedback is stronger when there was genuine investment in the prediction.

**Step 5: Student taps "Submit Answer."**

#### The Feedback Moment (the most important UX in the product)

**Step 6: Feedback renders — Correct Answer.**

- Correct option card turns solid green, gains a checkmark
- A brief success micro-animation (subtle, not distracting)
- Rationale block expands below:
    - Heading: *"Why this is correct"*
    - Full SME-written rationale — 2–4 sentences explaining the concept, not just confirming the answer
    - Section: *"The principle behind this"* — connects to the broader topic (e.g., references the specific clause of NSCP or RA 9266)
    - Teleport Link: `[Go to: Structural Design > Steel > Bolted Connections in Wiki →]`
    - Note: for correct answers answered very quickly, the Lucky Guess Detector™ may silently flag for re-testing (see Section 8) — no visual indicator to the student

**Step 7: Feedback renders — Wrong Answer (this is the core).**

- Student's chosen option turns solid red, gains an × mark
- Correct option turns solid green, gains a checkmark — revealed clearly
- The other two wrong options: subtle gray strikethrough styling
- Rationale block expands below — longer and more detailed than correct-answer rationale:
    - Heading: *"Here's what happened"*
    - **Section A — Why you might have chosen [their answer]:** Addresses the common misconception that leads to that specific wrong choice. This is the highest-value educational content in the product and must be SME-authored per wrong option.
    - **Section B — Why the correct answer is [X]:** Full explanation
    - **Section C — The rule / code / principle:** Exact legal citation or formula (e.g., *"Per NSCP Section 502.1.3, bolt spacing must not exceed..."*)
    - Teleport Link: `[Go to: exact Wiki paragraph →]`
    - Flashcard CTA: *"+ Add to my Cheat Sheet"* (saves question + correct answer + rationale to Notes as a cloze block)
    - Ask AI CTA: *"I still don't understand this → Ask the SlateCamp Reference Assistant"*

**Educational psychology note:** The "Why you might have chosen X" section is called *elaborative interrogation* — explicitly addressing the wrong mental model, not just revealing the right answer. Research shows this dramatically reduces the chance of making the same mistake again compared to simply showing the correct answer.

**Step 8: Student reviews rationale.**

- Minimum display time before "Next" button activates: **3 seconds** for correct, **5 seconds** for incorrect
- This is intentional friction. It prevents students from speed-clicking through rationales without reading them.
- The "Next Question" button appears after the minimum time with a subtle fade-in

**Step 9: Student taps "Next Question."**

- Question counter increments
- Smooth transition to next question
- Auto-save fires: `user_interactions` record written to DB with `question_id`, `topic_id`, `selected_option_id`, `is_correct`, `time_spent_ms`, `timestamp`

#### Mid-Session States

**Flagged question behavior:** Flags are visually tracked in the question navigator. At the end of the session, the system shows: *"You flagged 3 questions. Review them now?"* — the student can re-attempt flagged questions before seeing final results.

**Abandoning mid-session:** State is preserved automatically. On next login: *"You have an unfinished Camp session (8/15 questions). Resume?"*

#### End of Session

**Step 10: Final question submitted.**

- Transition screen: *"Session complete. Reviewing your performance..."* — 1.5-second animation
- If flagged questions exist: *"Before you see your results, you flagged 3 questions. Review them?"* — last chance for active recall on those items

**Step 11: Results screen renders.**

- Score card: `11/15 · 73%` — large, clear
- Breakdown by subject: mini bar charts per subject showing accuracy
- Stars earned (gamification layer — optional): based on accuracy bands
- Question review list: all 15 questions listed, expandable, color-coded correct/incorrect

**Step 12: Readiness Score™ update animation.**

- The student's current Readiness Score animates from old → new value
- EMA recalculation happens here (recent session weighted heavier than historical)
- IRT adjustment: if the student correctly answered 3 difficulty-level-3 questions, the boost is proportionally larger than 3 difficulty-level-1 questions

**Step 13: Post-session CTAs (in priority order).**

- *"Fix your weakest topic"* → launches a new targeted Camp session on lowest-scoring topic
- *"Go to Wiki"* → opens the Teleport Link for the most-failed topic
- *"Save session notes"* → exports this session's flagged questions to Notes

---

### Section 4 — Chill Mode — Complete Step-by-Step

**Educational psychology rationale:** Chill Mode is built on *passive exposure* and *incidental learning*. Not every study session can be high-intensity. Research on cognitive load shows that forced high-stakes assessment when a student is fatigued backfires — it creates negative associations with the material. Chill Mode gives the student "contact hours" with the syllabus in a psychologically safe way. No score means no threat response. The student can explore freely.

**Step 1: Student selects "Enter Chill."**

- No configuration screen. Goes directly to the infinite feed.
- Optionally: a small topic picker appears as a collapsible panel (collapsed by default) — student can optionally pin to a specific subject

**Step 2: The feed renders.**

- Layout: Single-column infinite scroll — feels more like a feed than a test
- Each "card" in the feed is one question, rendered without any exam framing
- No question counter, no timer, no score
- Cards feel conversational, not clinical

**Step 3: Question card structure in Chill Mode.**

- Question text
- 4 options styled softer, more like choice buttons than exam options
- Answer is revealed on tap — no "Submit" button. One tap to answer, instant reveal.
- This is the key UX difference: **Chill Mode reveals on first tap, no confirmation step.**

**Step 4: Answer revealed.**

- Correct answer always shown (green), student's answer shown (green if correct, red if wrong)
- Rationale text appears — shorter than Camp Mode, 1–2 sentences only
- Tone is conversational: *"That's right — the fire exit clearance is 1.2m because..."* or *"Not quite — this one trips people up. The key thing to remember is..."*
- No score tracking displayed to the student
- Internally: `user_interactions` is still recorded — this data feeds the heatmap and Lucky Guess Detector silently

**Step 5: Student scrolls to next card.**

- Infinite scroll — next question card is pre-loaded below
- Mix of question types: some cards are pure questions, others are **Wiki Snippet Cards** — a short piece of content from the Wiki (a formula, a diagram, a code reference) that appears between questions as passive reading material
- This Wiki Snippet interleaving is the Chill Mode innovation: it trains the student on reference material without the cognitive load of being tested

**Step 6: Session end in Chill Mode.**

- There is no formal session end. The student exits when they choose.
- On exit: no score shown. Just: *"Nice session. You reviewed 23 items."*
- Optional CTA: *"Want to test yourself on what you just covered? Start a Camp session with the same topics?"*

---

### Section 5 — Storm Mode — Complete Step-by-Step

**Educational psychology rationale:** Storm Mode is *stress inoculation training* — deliberately exposing the student to exam-day conditions so those conditions feel familiar, not threatening, on actual exam day. The research basis is from sports psychology and military training: controlled exposure to stressors reduces performance anxiety and builds automaticity. Delayed feedback (end-of-test only) mirrors the actual exam experience and trains the student to move forward after uncertainty rather than getting stuck.

**Critical design principle:** Storm Mode is not just a timed Camp Mode. It is a fundamentally different psychological experience, and the UX must reflect that.

#### Pre-Storm Setup

**Step 1: Student selects "Begin Storm."**

- Config screen appears — but abbreviated:
    - Subject selector (same as Camp Mode)
    - Format selector: *"Mini Storm"* (20Q, ~30 min) / *"Full Storm"* (100Q, ~4 hrs — mirrors full ALE format)
    - Warning card: *"Storm Mode is strict. No rationales during the session. Tab-switching doesn't pause. Treat this like the real exam."*
    - Mental framing prompt: *"Before you start: take a breath. Your goal is not a perfect score. Your goal is to simulate exam conditions and generate data."*

**Step 2: Student confirms. Final warning modal.**

- *"You are about to enter Storm Mode. No rationales will be shown during the session. Your Readiness Score™ will update based on this performance. Ready?"*
- Two buttons: "Let's Go" / "Not yet, go back"

#### In-Session Storm Experience

**Step 3: Storm session interface.**

- The visual design shifts noticeably — darker background tint, more clinical typography
- Persistent countdown timer at the top (large, always visible) — counts down from total exam time
- Question counter: `Q 14 / 100`
- Per-question pacing indicator: small gauge showing if the student is ahead/behind board exam pace
- The Arsenal (toolbar):
    - Strike-through tool (same as Camp)
    - Flag for Review (same as Camp)
    - Question Navigator (critical in Storm Mode for time management)
    - **Pacing Alert** — if the student spends > 2× the average recommended time per question, a subtle nudge appears: *"Consider moving on and returning."*

**Step 4: Student answers.**

- Single tap selects an option — no confirmation dialog, just selection highlight
- Student can change their answer anytime before submitting the full session
- No immediate feedback — selected option just shows as highlighted

**Step 5: Tab-switching behavior.**

- If student switches tabs or minimizes browser: timer continues. No pause. A subtle alert on return: *"The clock didn't stop. (X) seconds passed."*
- This is intentional. Board exams don't pause.

**Step 6: Student navigates between questions.**

- Navigator grid shows: answered (filled), flagged (orange dot), skipped (empty)
- Student can jump to any question at any time

**Step 7: Time warning states.**

- At 25% time remaining: amber pulsing timer
- At 10% time remaining: red timer, soft vibration (mobile)
- At 2 minutes remaining: alert banner: *"2 minutes left. Ensure all questions are answered."*

**Step 8: Student submits the full session.**

- Manual submit: *"Submit Storm Session"* button — requires confirmation: *"Submit all 100 answers? You cannot change them after this."*
- Auto-submit: if timer reaches zero, session submits automatically with whatever is answered

#### Storm Post-Session — The Cold Score Delivery

**Step 9: Score screen — Proof Simulation™ style delivery.**

- 2-second pause before score appears — intentional psychological tension that mirrors exam day
- Score renders: `Score: 68/100 · 68%`
- No immediate rationale. The score stands alone first, giving the student a moment to feel it.
- Then: subject breakdown table
- Readiness Score™ animation updates

**Step 10: 24-Hour Review Lock (Proof Simulation™ protocol — for Full Storm only).**

- For Full Storm sessions, the detailed rationale review is locked for 24 hours. Student sees: *"Your full diagnostic review unlocks in 24 hours. This mirrors how professional performance debriefs work — distance from the test produces more honest reflection."*
- The educational rationale: students who review immediately after a high-stress test often rationalize their wrong answers. 24-hour distance reduces ego-protection bias and produces more accurate self-assessment.
- The student receives a push notification when the review unlocks.

**Step 11: The Storm Diagnostic (after 24 hours or immediately for Mini Storm).**

- Full question-by-question review with expanded rationales
- **Storm-specific addition:** For each wrong answer, the system shows: *"You spent [X seconds] on this. The average time for this question type is [Y seconds]. What does that tell you?"* — metacognitive prompt
- Time-on-question analysis: highlights questions where very fast answers were wrong (possible guesses) and very slow answers were wrong (possible conceptual gaps)

---

### Section 6 — Custom Session — Complete Step-by-Step

**Purpose:** Maximum flexibility for students who know what they need. Targets a specific, advanced user behavior — the student who has already done several Camp sessions, understands their heatmap, and wants to build a bespoke drill.

**Step 1:** Student selects "Custom Session."

**Step 2: Full configuration screen.**

- Subject selector (same cascading tree)
- Question count picker (any number, no preset)
- Mode elements (mix and match):
    - Timer: On / Off (with timer duration picker if On)
    - Feedback: Immediate / End of Session / None (Chill style)
    - Difficulty: Recall only / Application only / Mixed / Custom (set % split)
- Topic Focus: option to drill into a single leaf-level `topic_id` exclusively

**Step 3:** Session runs according to configured rules — the system applies the correct feedback behavior based on the student's settings.

**Step 4: Results.**

- If feedback was set to Immediate: Camp-style results
- If feedback was set to End of Session: Storm-style cold delivery
- If feedback was None: Chill-style exit (no score, just review count)

---

### Section 7 — Proposed New Modes

#### 7A — Blindspot Mode™ (Blindspot Protocol™)

**The IP:** The Blindspot Protocol™ is an existing IP asset — the nightly automated scan that identifies avoided and underperforming nodes. Blindspot Mode gives this a student-facing UI.

**Step 1:** Student sees a notification/banner: *"Your Blindspot Protocol™ has identified 4 critical weak nodes. Want to target them now?"*

**Step 2:** One tap launches a pre-configured Camp session using exactly those 4 topic nodes, weighted toward their `topic_id` entries. The student sees: *"This session targets: Firewall Separation · Zoning Easements · Steel Bolted Connections · NSCP Section 7. These are the topics the system flagged as your highest-risk areas."*

**Step 3:** Session runs as Camp Mode, but with a clear sense of purpose — the student knows these are their real weaknesses, not random questions.

**Step 4:** After the session: *"You improved 14% on Firewall Separation. Still struggling with NSCP Section 7 — this node has been re-flagged. We'll return to it in 48 hours."* — spaced repetition interval set automatically.

#### 7B — Proof Simulation™ (Full IP Implementation)

This is the highest-stakes mode and should be gated behind proof of readiness.

**Gate condition:** Student's Readiness Score™ must be ≥ 65% before Proof Simulation™ unlocks. If below 65%, the button is grayed out with: *"Unlock Proof Simulation™ when your Readiness Score reaches 65%. Currently: 51%."*

**Step 1:** Student accesses Proof Simulation™ from a special persistent CTA in the Analytics Dashboard.

**Step 2:** Full exam format — 100 questions, timed, full ALE structure.

**Step 3:** Cold score delivery. Complete score + subject breakdown, nothing else.

**Step 4:** 24-hour review lock.

**Step 5:** On unlock — full diagnostic with Readiness Score™ recalibration. Score impact is weighted 3× heavier than a standard Storm session in the EMA calculation, because this was a full-fidelity simulation.

**Step 6:** Student receives a written assessment: *"Based on your Proof Simulation™ performance, your projected pass probability is 74%. Your highest-risk subjects remain: [list]. Your Readiness Score™ is now [X]. [# days] until the exam at your current trajectory."*

#### 7C — Endurance Cycle™ (IP Implementation)

**Purpose:** Progressive cognitive stamina training. Builds the student's ability to sustain focus for 4+ hour exams.

**Mechanic:** Each week, the Endurance Cycle™ extends session length by 10–15% based on the student's baseline performance. It tracks accuracy decay curves — how much does the student's accuracy drop in the last 20% of a session vs. the first 20%?

**Step 1:** System detects that a student's accuracy drops significantly in the final third of long sessions. Alert: *"Your accuracy drops from 78% to 51% in the final 30 minutes. This suggests cognitive fatigue. Endurance Cycle™ training can fix this."*

**Step 2:** Student enrolls in an Endurance Cycle™ — a 4-week progressive training plan with auto-generated sessions of increasing length.

**Step 3:** Weekly check-in: *"Week 2 complete. Your late-session accuracy improved from 51% to 61%. You're building stamina."*

---

### Section 8 — Mistake Handling by Mode (The Educational Psychology Core)

This is the most important section in the entire spec. The response to a student's mistake must be mode-aware, because mistakes serve different pedagogical functions depending on context.

#### Scenario A: Wrong answer in Camp Mode

This is the *optimal teaching moment.* The student is engaged, the question is fresh in their mind, the cognitive load is at its peak. This is when learning is most possible.

The correct UX response is **Structured Misconception Confrontation:**

1. Show them they were wrong — clearly, not harshly. The color red is enough. No "Incorrect!" text needed.
2. Show them the right answer immediately.
3. **Explain why their answer was wrong** — not just what the right answer is. The rationale must address the specific wrong option they chose, not just explain the correct one.
4. Connect it to a framework or rule — anchor the correct answer to a principle, not just a fact.
5. Provide an escape route — Teleport Link to Wiki, option to save to Notes, option to ask the AI.
6. Give them the Cloze flashcard option — actively convert this mistake into a future study tool in one tap.

**What NOT to do:**

- Don't minimize the mistake ("Don't worry, this is a tricky one!")
- Don't overwhelm with text — rationale should be scannable, max 5 sentences
- Don't immediately advance — enforce the minimum 5-second dwell time

#### Scenario B: Wrong answer in Chill Mode

This is a *low-stakes exposure moment.* The student is not in performance mode. The mistake should be treated as a learning observation, not a correction.

The correct UX response is **Gentle Reorientation:**

1. Show the correct answer — softly.
2. One-sentence rationale only — conversational tone.
3. No "you were wrong" visual language. The green correct answer speaks for itself.
4. Move on — the feed continues scrolling.
5. Internally: the mistake is recorded. The topic is flagged for future Camp Mode targeting. The student sees none of this.

**What NOT to do:**

- Don't show a score or running tally — this defeats the psychological safety of Chill Mode
- Don't show the expanded rationale block — it breaks the feed rhythm
- Don't show the "Add to Cheat Sheet" CTA here — too much friction for Chill Mode context

#### Scenario C: Wrong answer in Storm Mode

This is a *contained experience* — the mistake cannot be processed during the session. The student must move forward. This is intentional.

The correct UX response is **Acknowledged and Filed:**

1. During the session: only visual acknowledgment that the answer was recorded. No correctness signal.
2. A flag option is available — student can mark this for focused review later.
3. After session, in the diagnostic: the mistake gets full Camp-Mode-style treatment, including the *"Why you might have chosen X"* rationale.
4. **Temporal anchoring addition:** Show the student *when* they answered this question (e.g., "You answered this at Q67, 2h 14m into the session") — this metacognitive data helps them understand if fatigue was a factor.

**What NOT to do:**

- Do not give any correctness signal during the session — this fundamentally breaks Storm Mode's pedagogical contract
- Do not allow rationale review mid-session even if the student tries to navigate back

#### The Lucky Guess Detector™ — Special Mistake Scenario

A student answers a high-difficulty question correctly, very quickly. Conventionally this would register as a correct answer and boost their score. The Lucky Guess Detector™ intervenes silently:

1. `time_spent_ms` is below the threshold for the `difficulty_level` of the question.
2. The system does **not** award full mastery credit.
3. The topic is flagged for silent re-test in a future session.
4. The student is **not** told this is happening — to prevent gaming the system.
5. In a future session (≥ 48 hours later), the same or equivalent question reappears.
6. If they answer correctly again at normal pace: full mastery credit awarded.
7. If they answer incorrectly: the first answer is retroactively reclassified as a lucky guess; the topic's `current_mastery_weight` in `user_node_mastery` is downgraded.

**The educational truth this serves:** Students who "pass" questions they don't actually understand are the most dangerous — they stop studying the topic. The Lucky Guess Detector™ is an insurance mechanism against false mastery.

---

### Section 9 — Algorithm Integration at Every Step

**Where each algorithm fires and what it does to the UX:**

**Exponential Moving Average (EMA) — fires post-session**

- Runs on every completed session
- Recent sessions are weighted more heavily than old ones
- Effect on UX: a bad session today can drop your Readiness Score™ significantly. This is intentional — it prevents students from coasting on a good week from a month ago.
- Student-facing message: *"Your Readiness Score dropped from 71 to 67. Last week's scores are now weighted less than today's."*

**Item Response Theory (IRT) — fires on every question**

- Difficulty weighting: answering a difficulty-3 question correctly contributes more to mastery than a difficulty-1 question
- Wrong answer on a difficulty-1 question penalizes more severely than wrong on difficulty-3
- The system must communicate this to the student: *"This was a hard question (difficulty 3). Answering it correctly boosted your Structural Design node significantly."*
- Data field: `difficulty_level` on every `question_id`

**Spaced Repetition — fires nightly**

- Topics answered below 50% accuracy are flagged in `user_node_mastery` and resurface in future sessions
- Interval increases each time the student successfully answers correctly: 1 day → 3 days → 7 days → 14 days → 30 days
- Student-facing: invisible, but manifests as the system re-including topics they haven't seen in a while — feels smart, not repetitive

**Blindspot Protocol™ — fires nightly**

- Scans the Taxonomy Heatmap™ for nodes with `current_mastery_weight` below threshold AND low recent attempt frequency
- These are nodes the student is actively avoiding (low frequency), not just struggling with (low accuracy)
- Generates the Blindspot Mode session queue for tomorrow

**Cognitive Stratification — fires during session config**

- Level 1 (Recall): questions testing memory of facts, definitions, code citations
- Level 2 (Application): questions requiring the student to apply a principle to a scenario
- The system ensures every session has a healthy mix by default and can be manually adjusted in Custom Session

---

### Section 10 — Post-Session Flow (Full Detail)

This is the same regardless of mode — the session feeds into the same analytics engine.

**Step 1:** All `user_interactions` records written to DB.

Fields: `interaction_id`, `user_id`, `session_id`, `question_id`, `topic_id`, `selected_option_id`, `is_correct`, `time_spent_ms`, `timestamp`, `test_mode`

**Step 2:** `user_node_mastery` table updates.

EMA recalculation per `topic_id`. `current_mastery_weight` updated. `avg_time_ms` updated.

**Step 3:** Lucky Guess Detector™ scan runs.

Flags suspicious `interaction_id` entries for re-test scheduling.

**Step 4:** Blindspot Protocol™ scan runs.

Updates tomorrow's recommended session queue.

**Step 5:** Readiness Score™ recalculated.

EMA + IRT output combined into the composite score. Animated on the results screen.

**Step 6:** Taxonomy Heatmap™ updates.

Colors on the heatmap shift: green nodes become greener if accuracy improved, red nodes become redder if accuracy worsened, gray nodes become any color once attempted.

**Step 7:** "Fix It" CTA generated.

The auto-generated targeted quiz from red nodes appears as the primary post-session action: *"Your weakest node from this session: Fire Exit Clearances (43%). Fix it now →"*

**Step 8:** Pacing Metric updates.

Average time per item is updated and compared to the board exam pace standard: *"Your average pace: 2.4 min/question. Target: 2.0 min/question. You have 47 days to close this gap."*

---

### Section 11 — Summary: Mode × Feature Matrix

| **Feature** | **Camp** | **Chill** | **Storm** | **Custom** | **Blindspot™** | **Proof Sim™** |
| --- | --- | --- | --- | --- | --- | --- |
| Timer | None | None | Full exam timer | Optional | None | Full exam timer |
| Immediate feedback | ✅ Full rationale | ✅ 1-sentence | ❌ | Configured | ✅ Full rationale | ❌ |
| Score shown live | ✅ Running | ❌ | ❌ | Configured | ✅ Running | ❌ |
| Full diagnostic | After session | None | After 24h | Configured | After session | After 24h |
| Lucky Guess Detector | ✅ Silent | ✅ Silent | ✅ Silent | ✅ Silent | ✅ Silent | ✅ Silent |
| Readiness Score impact | 1× | 0.5× | 2× | 1× | 1.5× | 3× |
| Spaced rep scheduling | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Session save/resume | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gating requirement | None | None | None | None | Blindspot active | RS ≥ 65% |
| Tone | Pedagogical | Conversational | Clinical | Configured | Urgent | Formal |

---

> **Camp Mode teaches. Chill Mode exposes. Storm Mode tests. Proof Simulation™ certifies. And the Lucky Guess Detector™ makes sure none of them let the student lie to themselves.**
> 

---

## PRD 3: Personal Notes & Workspace

**Objective:** Replace fragmented note-taking with a centralized, dynamic workspace for instant capture and cross-subject synthesis.

### UX/UI Specs

- **1-Click Capture:** From Wiki ("Send to Camp"), Quiz (bookmark icon saves Q + answer + rationale), 3D Lab (snapshot button)
- **Block-Based Editor:** Built on **TipTap** (`@tiptap/react ^3.20.1`) with extensions for highlights, tasks, images, horizontal rules
- **Split-Pane Review:** Notes in right drawer alongside Wiki or Quiz
- **Custom Cheat Sheets:** Drag blocks across subjects

### Educational Design

- **Context Preservation:** Every block auto-generates a Source Badge (e.g., `From: Structural Design > Steel > Bolted Connections`)
- **Auto-Tagging:** Captured notes inherit `subject_id` and `topic_id` from source
- **Smart Resurfacing:** Engine flags saved notes when user struggles on related quiz topics
- **Cloze Deletion:** Highlight word → "Hide" → flashcard blank

### Architecture

- TipTap block-based JSON schema (not plain HTML)
- Schema: `note_page_id`, `user_id`, `title`, `content_blocks` (JSON array), `associated_topics` (FK array → taxonomy)
- Optimistic UI on capture; async DB write via Supabase

---

## PRD 4: Interactive Media & 3D Lab

**Objective:** Translate abstract building codes into interactive spatial realities. Also the primary marketing weapon.

### UX/UI Specs

- **Parametric Sandbox:** Slider-driven control panel (lot width, depth, zoning). Real-time mesh feedback via React Three Fiber
- **Cinematic Camera:** Orbit/pan/zoom with physical constraints (never "break" the model). Uses `camera-controls ^3.1.2`
- **X-Ray & Cutaway:** Progressive layer stripping via slider
- **Guided Tours:** Camera flies along building systems with narrative cards

### Educational Design

- **Learning by Breaking:** Let students exceed code limits safely — red geometry + violation citation
- **Contextual Hotspots:** Click glowing elements → Rich Tooltip with exact building code from Wiki
- **In-Canvas Spatial Quizzing:** "Adjust setbacks to comply with R-1 zoning" — graded by physical adjustment

### Architecture

- **Engine:** React Three Fiber (`@react-three/fiber ^9.5.0`) + Three.js (`three ^0.183.2`) + Drei (`@react-three/drei ^10.7.7`)
- **Procedural Geometry:** `BoxGeometry` / `ExtrudeGeometry` for parametric models (no static files)
- **Static Assets:** Draco-compressed `.GLB` for fixed elements
- **Lazy Loading:** React Suspense — 3D engine only loads on navigation to Lab
- **Visual Effects:** Shader gradients via `@shadergradient/react ^2.4.20`

---

## PRD 5: AI Contextual Tutor

**Objective:** Hyper-localized, 24/7 Socratic guidance under a strict Zero-Hallucination Mandate.

### Architecture — Anti-Hallucination Pipeline

- **Closed-Loop Vector DB:** All Wiki content → vector embeddings (Supabase pgvector or dedicated vector store). No internet access.
- **Temperature = 0.0:** Maximum literalness
- **Double-Pass Verification:** Secondary Auditor LLM checks for hallucinated numbers/dates/codes
- **"I Don't Know" Protocol:** Hard constraint in system prompt — redirect to subject node if answer not found

### UX/UI Specs

- **Mandatory Citation Badges:** Every response ends with clickable `[Source: PD 1096 - Rule 7, Sec 704]`
- **Context-Aware Prompts:** Pre-filled based on location (e.g., after failing quiz: "Explain the flaw in my logic")
- **"Report Hallucination" Flag:** Freezes interaction, sends to SME queue

### Educational Design

- **Socratic Scaffolding:** During active tests, guides with questions instead of direct answers
- **Analogy Generation:** Translates technical jargon into physical real-world analogies

### Branding

- Named **"SlateCamp Reference Assistant"** — not "AI Oracle" or "Smart Bot"
- Onboarding modal: *"This AI only searches the SlateCamp database. Always verify with Source Badges."*

---

## PRD 6: Analytics Dashboard

**Objective:** Translate raw interactions into a visual, predictive Readiness Score.

### UX/UI Specs

- **Macro View — Taxonomy Heatmap:** Parent subjects as large blocks, child topics nested. Color: 🟢 >85%, 🟡 60–84%, 🔴 <59%, ⬜ Unexplored
- **Micro View — Node Inspector:** Click any node → historical accuracy, time-series graph, attempt count
- **Pacing Metric:** Average time per item gauge with board exam pace comparison
- **"Fix It" CTA:** Auto-generates targeted quiz from red nodes
- **Charts:** Built with **Recharts** (`recharts ^3.8.0`)

### Data Science

- **Exponential Moving Average (EMA):** Recent performance weighted heavier than historical
- **Item Response Theory (IRT):** Hard questions boost score more than easy ones
- **Lucky Guess Detector:** Flags fast correct answers on complex questions

### Database Schema

- `user_interactions`: `interaction_id`, `user_id`, `session_id`, `question_id`, `topic_id`, `selected_option_id`, `is_correct`, `time_spent_ms`, `timestamp`, `test_mode`
- `user_node_mastery`: `user_id`, `topic_id`, `total_attempts`, `total_correct`, `current_mastery_weight` (EMA float), `avg_time_ms`, `last_encountered`