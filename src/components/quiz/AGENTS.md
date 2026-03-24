<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# quiz

## Purpose

Quiz and testing interface components for SlateCamp. Renders individual question items, answer input, session UI (header, timer, progress tracking), drawers (rationale feedback, AI tutor, restudy options), and navigation. Supports 7 test modes with distinct pedagogical rules and IRT 2-parameter logistic model mastery scoring. Auto-saves every 10 seconds with visual save status indicator.

## Key Files

| File | Description |
|------|-------------|
| `QuizHeader.tsx` | Session header with mode badge (Camp/Chill/Storm/Proof Sim/Blindspot/Custom/Endurance), question counter (e.g., "12/50"), flag toggle, AI tutor trigger, exit button, save status. Mode-specific styling via MODE_STYLES map. |
| `QuestionStem.tsx` | Main question text renderer. Supports Markdown, LaTeX formulas, images. Wraps stem content in semantic HTML (article/h2 pattern). |
| `OptionButton.tsx` | Answer choice button. Shows option text, selection state, feedback styling (correct/incorrect/flagged). Handles single/multi-select logic. Disabled post-submit until feedback consumed. |
| `TimerBar.tsx` | Timed session countdown. Blue → amber at <=20%, critical at <=10%. Shows MM:SS. Clickable to minimize. Aria labels for screen readers. |
| `QuestionMap.tsx` | Visual map of all questions in session. Shows completion state (unanswered/answered/flagged/correct/incorrect). Allows jump-to-question navigation. |
| `ConfidenceToggle.tsx` | Per-question confidence rating (1–5 scale or just two-level "confident/unsure"). Influences IRT theta estimation. Optional per session config. |
| `ConfidenceCheckScreen.tsx` | Pre-submission screen asking "How confident are you?" Forces confidence rating before finalizing answer. Modal overlay. |
| `ErrorTypePrompt.tsx` | Post-incorrect-answer modal: "Why did you miss this?" (careless mistake / conceptual misunderstanding / guessed). Data fed to blindspot detection and IRT calibration. |
| `RationaleDrawer.tsx` | Side drawer showing post-answer feedback: explanation text, misconception/principle breakdown, optional wiki reference link. Slides from right. Can be dismissed or pinned. |
| `AITutorDrawer.tsx` | AI-powered tutoring drawer. User taps "AI Tutor" → generates response at Temperature 0.0 with structured format (Misconception / Principle / Wiki Reference). Mandatory citation badges. Loading state with spinner. |
| `SaveIndicator.tsx` | Small status indicator (idle/saving/saved/error/offline) in header or corner. Shows auto-save progress every 10 seconds. Green checkmark when saved. |
| `ConfirmSubmitSheet.tsx` | Confirmation modal for quiz exit or final submission. Lists unsaved changes or flagged questions. "Are you sure?" CTA to prevent accidental loss. |
| `FooterNavigator.tsx` | Quiz footer navigation: Previous/Next buttons, Question Map toggle, Confidence Check (if enabled), Submit/Finish CTA. Manages forward/backward flow and state validation. |
| `QuizOverlay.tsx` | Container for all overlay components (drawers, sheets, modals). Manages z-index and animation state. |
| `RestudyLoop.tsx` | Post-session UI for selecting incorrect answers to inline review (without re-answering full question). Links to Wiki for deeper study. Modal with checkboxes. |

## Subdirectories (if any)

None. All quiz components are flat in `src/components/quiz/`.

## For AI Agents

### Working In This Directory

Quiz components are the **testing engine** for SlateCamp. They enforce strict pedagogical rules and IRT-based mastery calculation. All quiz state must persist with auto-save every 10 seconds.

**Test modes (7 types):**
1. **Camp** — Instant feedback after each answer. Learning-focused. Mode badge: `bg-[#EEF2FC] text-[#1535A8]`
2. **Chill** — Untimed, instant feedback. Low-stress practice. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`
3. **Storm** — Timed, no feedback until end-of-session. Exam-like. Mode badge: `bg-[#1A2332] text-white`
4. **Proof Sim** — Full exam simulation (timed, no feedback, full session). Mode badge: `bg-[#1A2332] text-white`
5. **Blindspot** — Focused review of flagged/error topics. Instant feedback. Mode badge: `bg-[#FEF8ED] text-[#D4951A]`
6. **Custom** — User-defined: subject mix, count, feedback style. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`
7. **Endurance** — Extended session (50+ questions, timed). Tests stamina and pace. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`

**State constraints:**
- Auto-save every 10 seconds to Supabase. Show visual indicator (SaveIndicator).
- Preserve session state in browser (zustand store) for instant UX.
- On session exit, confirm with modal (ConfirmSubmitSheet) to prevent data loss.
- Flagged questions are always visible in question map.

**Mastery scoring (IRT 2-parameter logistic):**
- Theta (ability estimate) updated per question based on response and question difficulty.
- Discrimination (a) and difficulty (b) parameters from question metadata.
- Lucky-guess correction applied (subtract probability of random selection).
- EMA (exponential moving average) weights recent sessions more heavily.
- Readiness Score = IRT-derived theta (0–100% scale).

**Language:**
- Post-answer feedback uses "Misconception / Principle" structure from question rationale.
- Error type categorization: careless / conceptual / guessed (feeds blindspot detection).
- Avoid "weakness," "gap," "behind." Use "area to revisit," "developing skill," "strengthen."
- No empty streaks; no confetti or badges.

**AI Tutor rules:**
- Temperature = 0.0 (deterministic).
- ALWAYS include citation badges linking to exact Wiki paragraph IDs.
- Parse response into Misconception / Principle / Wiki Reference (optional).
- Show loading state; handle errors gracefully.

### Common Patterns

1. **Mode-specific styling:** Each TestMode maps to a unique color scheme in `MODE_STYLES`. Header, buttons, feedback all reflect mode.
2. **Post-submit disabled state:** After answer submission, option buttons are disabled until rationale is reviewed (Dismiss or read fully).
3. **Drawer composition:** RationaleDrawer and AITutorDrawer both use Framer Motion + AnimatePresence. Slide from right, can be pinned or dismissed.
4. **Timer color shift:** TimerBar uses primary (blue #1B3FC4) normally, amber (#D4951A) when <=20%, critical red when <=10%.
5. **Question map jump:** Clicking a question in QuestionMap updates active question index and scrolls stem into view.
6. **Confidence toggle placement:** Appears pre-submission if enabled, or as pre-submit screen (ConfidenceCheckScreen). Influences IRT calculation.
7. **Save status loop:** Component hooks into quiz store → detects changes → auto-saves on 10s interval → SaveIndicator updates to "saved" state.

## Dependencies

### Internal

- `@/types/app` — TestMode, Question, Choice, IRT metadata, UserResponse
- `@/lib/hooks/useQuiz` — Quiz session state (currentQuestion, selectedOptionId, flags, sessionId, etc.)
- `@/lib/hooks/useIRT` — IRT scoring function (theta calculation, lucky-guess correction)
- `@/lib/hooks/useSave` — Auto-save hook (10s interval, Supabase mutation)
- `@/lib/actions/quiz-actions` — submitAnswer, flagQuestion, exitSession server actions
- `@/lib/actions/ai-tutor` — AI tutor generation (Temperature 0.0)
- `@/lib/utils` — cn(), time formatting, question utilities (getCorrectOptionId)
- `@/components/ui/*` — shadcn/ui (Dialog, Sheet, Button, etc.)
- `@/components/graphics/icons/Icon` — SCIcon wrapper

### External

- `react` (19.x) — Hooks, context, Suspense
- `framer-motion` — Drawer/sheet animations, transitions, AnimatePresence
- `@phosphor-icons/react` — Icons (Flag, Brain, CircleNotch, X, etc.)
- `next/navigation` — useRouter for quiz flow control

## Campfire Design System

### Colors & Styling

- **Primary (Camp mode):** bg-[#EEF2FC] text-[#1535A8] border-[#1535A8]/20
- **Secondary (Chill/Custom/Endurance):** bg-[#F5F5F5] text-[#4A5568] border-[#D4DAE3]
- **Dark (Storm/Proof Sim):** bg-[#1A2332] text-white border-[#1A2332]
- **Warning (Blindspot):** bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20
- **Feedback colors:**
  - Correct: Emerald (#2D9F6F) + bg-[#EDFAF4]
  - Incorrect: Warm Red (#D64545) + bg-[#FDF0F0]
  - Flagged: Amber (#D4951A)
  - Unanswered: gray (#D4DAE3)
- **Text:** text-[#1A2332] (primary), text-[#4A5568] (secondary), text-[#8896A7] (tertiary)
- **Borders:** border-[#D4DAE3]
- **Backgrounds:** bg-white (content), bg-[#F5F7FA] (focused testing area)
- **Shadows:** shadow-none (at rest), shadow-md (modals), shadow-lg (full-screen drawers)
- **Radii:** rounded-sm (6px buttons), rounded-md (8px cards), rounded-lg (12px modals)
- **Transitions:** max 300ms, duration-150 ease-out

### Typography

- Minimum text: 11px (text-[11px]). NEVER 8/9/10px.
- Monospace ONLY on code, numbers (timer, question count). NOT on labels.
- Inter via next/font/google.
- Mode labels: font-medium, text-[11px] or text-sm depending on context.

<!-- MANUAL: -->

