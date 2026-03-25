<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 -->

# testing

## Purpose

Full testing engine for SlateCamp, organized into four lifecycle phases: setup (session configuration), session (live quiz interaction), debrief (post-session results), and hub (session discovery and mode selection). Supports all test modes (Camp, Storm, Chill, Proof Simulation, Focus Review, Custom, Endurance) with mode-specific behaviors, IRT-based scoring, and auto-save every 10 seconds.

## Key Files

| File | Description |
|------|-------------|
| `debrief/DebriefLayout.tsx` | Master debrief orchestrator. Composes ScoreHero, ReadinessDelta, NodeMasteryStrip, QuestionReviewStrip, CalibrationReveal, BlockAccuracyChart, DebriefActions. Transforms raw DB shapes into typed props. `'use client'` |
| `debrief/ScoreHero.tsx` | Large score display (correct/total) with score band coloring and percentage badge. Uses `SCORE_BAND_THRESHOLDS` from `@/types/testing`. `'use client'` |
| `debrief/ReadinessDelta.tsx` | Before/after readiness score comparison with delta arrow. `'use client'` |
| `debrief/NodeMasteryStrip.tsx` | Horizontal strip of taxonomy nodes showing mastery delta per node. `'use client'` |
| `debrief/QuestionReviewStrip.tsx` | Scrollable list of answered questions with correct/incorrect/flagged indicators. `'use client'` |
| `debrief/CalibrationReveal.tsx` | Confidence calibration visualization: how well user's confidence matched actual performance. `'use client'` |
| `debrief/BlockAccuracyChart.tsx` | Recharts bar chart showing accuracy by question block (e.g., first 10, second 10). `'use client'` |
| `debrief/PressureGapCard.tsx` | Card showing gap between timed and untimed performance. `'use client'` |
| `debrief/SimulationResults.tsx` | Extended debrief for Proof Simulation mode with pass/fail threshold and section breakdowns. `'use client'` |
| `debrief/DebriefActions.tsx` | Action buttons: Review Mistakes, Start New Session, Return to Hub. `'use client'` |
| `hub/ReviewHub.tsx` | Main testing hub page. Composes WelcomeCard, SmartSuggestionCard, InProgressBanner, ZoneSection. Fetches mode stats and smart suggestions from props. `'use client'` |
| `hub/WelcomeCard.tsx` | Greeting card with time-aware message and quick-start CTA. `'use client'` |
| `hub/SmartSuggestionCard.tsx` | AI-driven session recommendation based on mastery gaps and pacing. `'use client'` |
| `hub/ModeCard.tsx` | Individual test mode card with description, rules summary, and Start CTA. `'use client'` |
| `hub/ZoneSection.tsx` | Groups mode cards into zones (Practice, Exam Prep, Review). `'use client'` |
| `hub/InProgressBanner.tsx` | Sticky banner for resuming an in-progress session. Shows mode, progress, last activity. `'use client'` |
| `session/SessionShell.tsx` | Live quiz session shell. Manages question navigation, answer submission, flagging, timer, save state. Delegates to mode-specific behavior components. `'use client'` |
| `session/CampSessionBehavior.tsx` | Camp mode behavior: instant feedback after each answer, rationale drawer. `'use client'` |
| `session/StormSessionBehavior.tsx` | Storm mode behavior: no feedback until session end, timed. `'use client'` |
| `session/ChillSessionBehavior.tsx` | Chill mode behavior: untimed, instant feedback, relaxed pacing. `'use client'` |
| `session/StormTimerBar.tsx` | Countdown timer bar for timed modes. Blue to amber at 20%, red at 10%. `'use client'` |
| `session/NavigatorOverlay.tsx` | Question map overlay for jumping between questions. `'use client'` |
| `session/ConfidenceTag.tsx` | Per-question confidence rating tag (confident/unsure). `'use client'` |
| `session/ErrorTaxonomyPrompt.tsx` | Post-incorrect prompt: careless/conceptual/guessed classification. `'use client'` |
| `session/FirstTimeTooltip.tsx` | Onboarding tooltip shown on first session for UI guidance. `'use client'` |
| `setup/CampSetup.tsx` | Camp mode configuration: question count, focus selector, confidence check. `'use client'` |
| `setup/StormSetup.tsx` | Storm mode configuration: timed settings, question count. `'use client'` |
| `setup/ChillSetup.tsx` | Chill mode configuration: untimed, relaxed settings. `'use client'` |
| `setup/CustomSetup.tsx` | Custom session builder: full control over subjects, count, feedback, timing. `'use client'` |
| `setup/EnduranceSetup.tsx` | Endurance mode: extended 50+ question sessions. `'use client'` |
| `setup/FocusReviewSetup.tsx` | Focus Review (Blindspot) mode: targets weak areas from error patterns. `'use client'` |
| `setup/SimulationBriefing.tsx` | Proof Simulation briefing: exam rules, timing, pass threshold. `'use client'` |
| `setup/SubjectSetup.tsx` | Subject-focused setup: single subject drill-down. `'use client'` |
| `setup/SetupSkeleton.tsx` | Loading skeleton for setup pages. |
| `setup/shared/QuestionCountPills.tsx` | Pill selector for question count (5/10/20/50). `'use client'` |
| `setup/shared/ConfidenceCheck.tsx` | Pre-session confidence rating per subject. `'use client'` |
| `setup/shared/FocusSelector.tsx` | Focus option selector (weakest/balanced/single-subject). `'use client'` |
| `setup/shared/SubjectGrid.tsx` | Grid of subject cards with mastery indicators for selection. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `debrief/` | Post-session results and review UI | 11 files |
| `hub/` | Session discovery, mode selection, resume banners | 7 files |
| `session/` | Live quiz session shell and mode-specific behaviors | 10 files |
| `setup/` | Pre-session configuration screens per mode | 10 files + `shared/` |
| `setup/shared/` | Reusable setup sub-components (pills, grids, selectors) | 4 files |

## For AI Agents

### Working In This Directory

The testing system follows a strict lifecycle: **Setup -> Session -> Debrief**. The Hub is the entry point.

**Critical constraints:**

1. **Mode-specific behavior.** Each test mode has its own setup screen and session behavior component. Do NOT mix mode logic into a single component. SessionShell delegates to CampSessionBehavior, StormSessionBehavior, or ChillSessionBehavior based on the mode.

2. **Types from `@/types/testing`.** All testing types (ModeSource, ScoreBand, ConfidenceTag, ErrorTag, SessionConfig, SmartSuggestion, etc.) are defined in `@/types/testing`. Do NOT duplicate type definitions.

3. **Server actions from `@/lib/actions/testing`.** Session creation (`createTestingSession`), answer saving (`saveTestingInteraction`), session completion (`completeTestingSession`), progress updates (`updateSessionProgress`), and abandonment (`abandonTestingSession`) are all server actions.

4. **Auto-save every 10 seconds.** SessionShell must persist answer state on a 10-second interval. Show SaveIndicator status.

5. **Score bands.** Use `getScoreBand()` and `SCORE_BAND_THRESHOLDS` from `@/types/testing` for color-coding results. Do NOT hardcode score thresholds.

6. **Shared setup components.** The `setup/shared/` directory contains reusable sub-components (QuestionCountPills, ConfidenceCheck, FocusSelector, SubjectGrid) used across multiple setup screens. Import from there.

7. **Barrel exports.** Each subdirectory has an `index.ts` barrel file. Import from the barrel, not individual files, when consuming from outside the testing directory.

8. **Mode constants.** Mode definitions and zone groupings come from `@/lib/constants/testing-modes` (MODE_DEFINITIONS, MODES_BY_ZONE, QUESTION_COUNT_OPTIONS). Do NOT hardcode mode metadata.

### Common Patterns

**Mode-specific setup screen:**
```tsx
const CampSetup = ({ userId, completedSessionCount }: CampSetupProps) => {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState(20)
  // ... configuration state

  const handleStart = async () => {
    const config: SessionConfig = { source: 'camp_mode', questionCount, ... }
    const result = await createTestingSession(userId, config)
    router.push(`${ROUTES.TESTING_SESSION}/${result.sessionId}`)
  }
}
```

**Session behavior delegation:**
```tsx
// SessionShell renders the appropriate behavior component:
{modeSource === 'camp_mode' && <CampSessionBehavior ... />}
{modeSource === 'storm_mode' && <StormSessionBehavior ... />}
{modeSource === 'chill_mode' && <ChillSessionBehavior ... />}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/types/testing` | All testing types: ModeSource, ScoreBand, SessionConfig, SmartSuggestion, etc. |
| `@/lib/actions/testing` | Server actions: createTestingSession, saveTestingInteraction, completeTestingSession |
| `@/lib/constants/testing-modes` | MODE_DEFINITIONS, MODES_BY_ZONE, QUESTION_COUNT_OPTIONS |
| `@/lib/constants/routes` | ROUTES for navigation |
| `@/components/ui/*` | Button, Eyebrow, Badge |
| `@/components/shared/section-header` | SectionHeader for hub sections |
| `@/components/quiz/*` | QuizOverlay, SaveIndicator, ConfirmSubmitSheet (shared quiz primitives) |
| `@/components/graphics/icons/Icon` | SCIcon wrapper for Phosphor icons |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **react** | Hooks: useState, useMemo, useCallback, useRef, useEffect | ^19.2.4 |
| **next/navigation** | useRouter, usePathname | 16.1.6 |
| **@phosphor-icons/react** | Icons: Flag, MapTrifold, X, etc. | ^1.4.14 |
| **recharts** | BlockAccuracyChart bar chart | ^3.8.0 |

<!-- MANUAL: -->
