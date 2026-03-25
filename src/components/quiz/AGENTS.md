<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# quiz

## Purpose

Quiz and testing interface primitive components for SlateCamp. Renders individual question items, answer input, session UI (header, timer, progress tracking), drawers (rationale feedback, AI tutor, restudy options), and navigation. These are the low-level building blocks consumed by both `dashboard/QuizRenderer` and `testing/session/SessionShell`. Supports 7 test modes with distinct pedagogical rules and IRT 2-parameter logistic model mastery scoring. Auto-saves every 10 seconds with visual save status indicator.

## Key Files

| File | Description |
|------|-------------|
| `QuizHeader.tsx` | Session header with mode badge (Camp/Chill/Storm/Proof Sim/Blindspot/Custom/Endurance), question counter, flag toggle, AI tutor trigger, exit button, save status. Mode-specific styling via MODE_STYLES map. `'use client'` |
| `QuestionStem.tsx` | Main question text renderer. Supports Markdown, LaTeX formulas, images. Semantic HTML (article/h2 pattern). `'use client'` |
| `OptionButton.tsx` | Answer choice button. Shows option text, selection state, feedback styling (correct/incorrect/flagged). Handles single/multi-select. `'use client'` |
| `TimerBar.tsx` | Timed session countdown. Blue to amber at <=20%, critical at <=10%. Shows MM:SS. Clickable to minimize. `'use client'` |
| `QuestionMap.tsx` | Visual map of all questions in session. Shows completion state. Allows jump-to-question navigation. `'use client'` |
| `ConfidenceToggle.tsx` | Per-question confidence rating (1-5 scale or two-level). Influences IRT theta estimation. `'use client'` |
| `ConfidenceCheckScreen.tsx` | Pre-submission screen asking "How confident are you?" Forces confidence rating. `'use client'` |
| `ErrorTypePrompt.tsx` | Post-incorrect-answer modal: "Why did you miss this?" (careless/conceptual/guessed). `'use client'` |
| `RationaleDrawer.tsx` | Side drawer: post-answer feedback with explanation, misconception/principle breakdown, wiki reference link. `'use client'` |
| `AITutorDrawer.tsx` | AI-powered tutoring drawer. Temperature 0.0 with structured format and mandatory citation badges. `'use client'` |
| `SaveIndicator.tsx` | Status indicator (idle/saving/saved/error/offline). Auto-save progress every 10 seconds. `'use client'` |
| `ConfirmSubmitSheet.tsx` | Confirmation modal for quiz exit or final submission. Lists unsaved changes or flagged questions. `'use client'` |
| `FooterNavigator.tsx` | Quiz footer: Previous/Next buttons, Question Map toggle, Confidence Check, Submit/Finish CTA. `'use client'` |
| `QuizOverlay.tsx` | Container for all overlay components (drawers, sheets, modals). Manages z-index and animation state. `'use client'` |
| `RestudyLoop.tsx` | Post-session UI for selecting incorrect answers to inline review. Links to Wiki. `'use client'` |
| `index.ts` | Barrel exports for quiz components. |

## Subdirectories

None. All quiz components are flat in `src/components/quiz/`.

## For AI Agents

### Working In This Directory

Quiz components are **primitive building blocks** for the testing engine. They are consumed by both `dashboard/QuizRenderer` (legacy) and `testing/session/SessionShell` (v2). They enforce strict pedagogical rules and IRT-based mastery calculation. All quiz state must persist with auto-save every 10 seconds.

**Test modes (7 types):**
1. **Camp** -- Instant feedback after each answer. Learning-focused. Mode badge: `bg-[#EEF2FC] text-[#1535A8]`
2. **Chill** -- Untimed, instant feedback. Low-stress practice. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`
3. **Storm** -- Timed, no feedback until end-of-session. Exam-like. Mode badge: `bg-[#1A2332] text-white`
4. **Proof Sim** -- Full exam simulation (timed, no feedback, full session). Mode badge: `bg-[#1A2332] text-white`
5. **Blindspot** -- Focused review of flagged/error topics. Instant feedback. Mode badge: `bg-[#FEF8ED] text-[#D4951A]`
6. **Custom** -- User-defined: subject mix, count, feedback style. Mode badge: `bg-[#F5F5F5] text-[#4A5568]`
7. **Endurance** -- Extended session (50+ questions, timed). Mode badge: `bg-[#F5F5F5] text-[#4A5568]`

**State constraints:**
- Auto-save every 10 seconds to Supabase. Show visual indicator (SaveIndicator).
- Preserve session state in browser (zustand store) for instant UX.
- On session exit, confirm with modal (ConfirmSubmitSheet) to prevent data loss.
- Flagged questions are always visible in question map.

**Mastery scoring (IRT 2-parameter logistic):**
- Theta (ability estimate) updated per question based on response and question difficulty.
- Discrimination (a) and difficulty (b) parameters from question metadata.
- Lucky-guess correction applied.
- EMA (exponential moving average) weights recent sessions more heavily.

**AI Tutor rules:**
- Temperature = 0.0 (deterministic).
- ALWAYS include citation badges linking to exact Wiki paragraph IDs.
- Parse response into Misconception / Principle / Wiki Reference.

### Common Patterns

1. **Mode-specific styling:** Each TestMode maps to a unique color scheme in `MODE_STYLES`.
2. **Post-submit disabled state:** After answer submission, option buttons are disabled until rationale is reviewed.
3. **Drawer composition:** RationaleDrawer and AITutorDrawer both use Framer Motion + AnimatePresence. Slide from right.
4. **Timer color shift:** TimerBar uses primary (blue #1B3FC4) normally, amber (#D4951A) when <=20%, critical red when <=10%.
5. **Question map jump:** Clicking a question in QuestionMap updates active question index and scrolls stem into view.
6. **Save status loop:** Component hooks into quiz store, detects changes, auto-saves on 10s interval, updates SaveIndicator.

## Dependencies

### Internal

- `@/types/app` -- TestMode, Question, Choice, IRT metadata, UserResponse
- `@/types/testing` -- ModeSource, ConfidenceTag, ErrorTag, AnswerState
- `@/lib/hooks/useQuiz` -- Quiz session state
- `@/lib/hooks/useIRT` -- IRT scoring function
- `@/lib/hooks/useSave` -- Auto-save hook (10s interval)
- `@/lib/actions/quiz-actions` -- submitAnswer, flagQuestion, exitSession
- `@/lib/actions/ai-tutor` -- AI tutor generation (Temperature 0.0)
- `@/lib/utils` -- cn(), time formatting
- `@/components/ui/*` -- shadcn/ui (Dialog, Sheet, Button, etc.)
- `@/components/graphics/icons/Icon` -- SCIcon wrapper

### External

- `react` (19.x) -- Hooks, context, Suspense
- `framer-motion` -- Drawer/sheet animations, AnimatePresence
- `@phosphor-icons/react` -- Icons (Flag, Brain, CircleNotch, X, etc.)
- `next/navigation` -- useRouter for quiz flow control

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
- **Transitions:** max 300ms, duration-150 ease-out

### Typography

- Minimum text: 11px (text-[11px]). NEVER 8/9/10px.
- Monospace ONLY on code, numbers (timer, question count). NOT on labels.
- Inter via next/font/google.

<!-- MANUAL: -->
