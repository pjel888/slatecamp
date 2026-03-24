<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# assessment

## Purpose

Assessment/pre-assessment components for the diagnostic quiz that generates the initial Readiness Score. Guides users through questions without feedback, calculates score, and transitions to score reveal screen with a ceremonial "calculating" pause.

## Key Files

| File | Description |
|------|-------------|
| `AssessmentQuiz.tsx` | Main assessment quiz component with question navigation, option selection, answer tracking, completion flow |
| `AnimatedScore.tsx` | Animated number counter for Readiness Score display |
| `PreAssessmentTeaser.tsx` | Teaser/preview shown before starting assessment |
| `ScoreReveal.tsx` | Full-page score reveal with breakdown by topic and mastery indicators |

## For AI Agents

### Working In This Directory

- **Session Management**: Creates quiz session on mount; tracks sessionId throughout flow
- **Answer Tracking**: Uses Map<questionId, optionId> to store answers; enables prev/next navigation
- **Time Tracking**: Records per-question time via `Date.now()` at question start
- **IRT Integration**: Calls `completeAssessment()` server action which runs IRT 2-parameter model
- **Ceremonial UX**: 2.5-second "Calculating your Readiness Score..." pause intentionally adds weight
- **Progress**: Visual progress bar showing (currentIndex + 1) / totalQuestions
- **Navigation**: Previous/Next buttons; Previous disabled on first question, Next disabled until option selected
- **Loading States**: Shows spinner on init; error state with retry CTA; calculating state on completion
- **Accessibility**: `role="radiogroup"`, individual `role="radio"` on options, `aria-checked`

### Dependencies
### Internal

- `@/lib/actions/quiz` - Server actions: `getSessionQuestions()`, `createQuizSession()`, `saveInteraction()`, `updateQuizSession()`
- `@/lib/actions/assessment` - `completeAssessment()` (runs IRT scoring)
- `@/lib/utils/question` - `getCorrectOptionId()` helper
- `@/types/app` - Types: `Question`, `Choice`, `QuizSession`
- `@/lib/utils` - `cn()` utility
- Next.js (`next/navigation`) - Router for post-completion redirect
- React hooks - `useState`, `useEffect`, `useCallback`, `useTransition`, `useRef`

<!-- MANUAL: Verify IRT calculation accuracy with sample data before launch. Test the 2.5s pause timing for ceremonial weight — adjust if UX research suggests different value. Ensure all answers persist if user navigates away mid-assessment. -->
