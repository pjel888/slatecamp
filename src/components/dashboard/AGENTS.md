<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-24 -->

# dashboard

## Purpose

Core dashboard component library for the SlateCamp learning engine. Renders the user's personalized study hub with progression visualizations (Readiness Score, Taxonomy Heatmap, Pacing Gauge), session discovery and builders, and action queues. The dashboard is the primary entry point after user onboarding and provides data-driven navigation to the Quiz, Wiki, and Review subsystems.

## Key Files

| File | Description |
|------|-------------|
| `ReadinessScore.tsx` | Primary metric display: EMA + IRT-calibrated readiness percentage with trend direction (Improving/Softening/Stable) and growth-framed label. Uses Campfire color thresholds (red <40, amber <70, green >=70). |
| `TaxonomyHeatmap.tsx` | Master syllabus visualization by subject and topic. Displays node states (mastered/familiar/danger/unexplored/thin_coverage) as colored progress bars. Optional delta view toggle (Pro feature) shows improvement/decline over session/week/month windows. |
| `PacingEnduranceGauge.tsx` | Time-per-item trend chart (area plot) with endurance window. Shows current pace vs. target, with narrative feedback (improving/declining/steady). Uses recharts for 5-week mock data. |
| `CustomSessionBuilder.tsx` | Dialog for building custom quiz sessions. Subject multi-select, question count (5/10/20/50), instant feedback toggle. Returns session config object. |
| `QuizRenderer.tsx` | Main quiz interface orchestrator. Composes header, question stem, options, footer nav, and overlay components (drawers, sheets, modals). State management via quiz store hooks. |
| `QuizHeader.tsx` | Quiz session header with mode badge (Camp/Chill/Storm/Proof Sim/Blindspot/Custom/Endurance), question counter, flag toggle, AI tutor trigger, exit button, and save status. |
| `TimerBar.tsx` | Timed session countdown with visual depletion bar. Color changes from primary (blue) to amber when <=20% time remaining. Clickable to minimize. |
| `OptionButton.tsx` | Answer choice button component. Shows option text, feedback styling (correct/incorrect/flagged), and selection state. Maps to choice type (single/multi). |
| `FooterNavigator.tsx` | Navigation footer: Previous/Next buttons, question map toggle, confidence check (if enabled), submit/finish CTA. Manages quiz flow and state transitions. |
| `RationaleDrawer.tsx` | Side drawer showing post-answer feedback: explanation, misconception/principle breakdown, optional wiki reference link. Triggered after question submission. |
| `AITutorDrawer.tsx` | AI-powered tutoring drawer triggered by user request. Parses tutor response into misconception/principle/wiki reference. Temperature 0.0, mandatory citation badges. |
| `ConfirmSubmitSheet.tsx` | Confirmation modal for quiz session exit or submission. Prevents accidental navigation loss. |
| `QuestionMap.tsx` | Visual map of all questions in the session. Shows completion state, flags, and optional difficulty indicators. Allows jump-to-question navigation. |
| `ConfidenceToggle.tsx` | Per-question confidence rating (1-5 scale). Influences IRT theta estimation. Optional, toggleable per session config. |
| `ErrorTypePrompt.tsx` | Post-incorrect-answer prompt: "Why did you miss this?" (careless/conceptual/guessed). Data fed to blindspot detection and IRT calibration. |
| `SaveIndicator.tsx` | Visual feedback for quiz state persistence. Idle/saving/saved/error/offline states. Auto-saves every 10 seconds. |
| `RestudyLoop.tsx` | Post-session UI for selecting incorrect answers to review inline. Links to Wiki for deeper study. |
| `ModeIntroScreen.tsx` | Intro modal for new session mode explaining rules (Camp instant feedback, Storm no feedback, Chill untimed, Blindspot focused review, etc.). |
| `TestingHub.tsx` | Landing page for quiz subsystem. Session discovery, recent activity, mode selector, continue/resume options. |
| `ActionQueues.tsx` | Queue-based recommendation system. Surfaced via cards: Continue Session, Blindspot Queue, SRS Review, Predictive Remediation. |
| `NextBestActionCardNew.tsx` | Intelligent "do this next" recommendation: targeted drill, review topic, practice weak area. Data-driven from heatmap and mastery scores. |
| `ContinueSessionCardNew.tsx` | Resume in-progress session. Shows mode, progress, and last activity timestamp. |
| `BlindspotQueueCardNew.tsx` | Flagged weak areas for focused review. Sourced from error type trends and IRT difficulty mismatch. |
| `DashboardHero.tsx` | Welcome section with time-aware greeting, user name, next milestone callout. |
| `WelcomeHeaderNew.tsx` | Top banner with profile quick-access, settings cog, and notifications. |
| `HeatmapSection.tsx` | Dashboard widget: embeds TaxonomyHeatmap with optional detail sheet for node selection. |
| `NodeDetailSheet.tsx` | Detailed view of a single heatmap node: mastery breakdown, recent attempts, recommended topics. |
| `QuickStatsRowNew.tsx` | Compact row of metrics: total questions answered, current streak (if earned), completion %. Uses growth-framed language. |
| `TrendMetrics.tsx` | Weekly trend sparklines for readiness, pace, endurance. Mini area charts inline. |
| `ActivityHeatmap.tsx` | Calendar view of study activity (sessions per day, color-coded by intensity). GitHub-style grid. |
| `RecentActivityFeedNew.tsx` | Chronological list of recent quiz sessions with scores, duration, mode, and mastery delta. |
| `RecentActivityCard.tsx` | Card wrapper for individual activity entry. |
| `ImprovedActivityFeed.tsx` | Alternative activity view (optimized for retention/UX). |
| `SubjectMasteryCard.tsx` | Per-subject readiness score in card form. Mini heatmap or bar chart. |
| `SubjectMasteryBars.tsx` | Horizontal bar chart of mastery by subject. Color-coded by proficiency level. |
| `SubjectRadarChart.tsx` | Radar chart (radar/spider) of mastery across dimensions (depth, breadth, speed, confidence). |
| `CompetenceSignalCard.tsx` | Composite signal: readiness + pacing + endurance + mastery + confidence. Holistic readiness indicator. |
| `DailyCatalystCard.tsx` | "What to study today" recommendation. Personalized based on weakest topics, spaced repetition, and exam pacing. |
| `SessionDiscovery.tsx` | Guided session builder with smart defaults based on current mastery and pacing gap. |
| `SubjectDrillSelector.tsx` | Drill-down UI: discipline → subject → topic → question count + mode. |
| `FocusAreasCard.tsx` | Highlighted topics that need work (danger state or high error rate). Actionable drill CTA. |
| `TrailCard.tsx` | CampTrail discovery: themed learning path (e.g., "High-Risk Topics," "Speed Builder"). |
| `NextMissionCard.tsx` | Next learning milestone in the user's roadmap. Completion ETA and progress bar. |
| `FeatureDiscoveryRow.tsx` | Promotional row for new features (e.g., AI tutor, Blindspot mode). Dismissible. |
| `PersonalWorkspaceLink.tsx` | Link to user workspace for stored notes, bookmarks, highlights. |
| `PredictiveRemediationCTA.tsx` | Proactive suggestion: "Based on your error patterns, review X." High-confidence intervention. |
| `StreakRibbon.tsx` | Visual ribbon/badge for consecutive study days. Only shown if streak > 0 (no empty streaks). |
| `OnboardingStateCard.tsx` | Conditional card shown during onboarding: setup checklist, curriculum selection, goal setting. |
| `LockedScoreWidget.tsx` | Readiness Score in locked/trial state for free users. Upsell to paid. |
| `LockedHeatmapOverlay.tsx` | Heatmap with "unlock to see" overlay for premium features (delta view, node details). |
| `ResumeBannerNew.tsx` | Sticky banner: "You have an in-progress session from X hours ago. [Resume]" |
| `SubjectFloorAlert.tsx` | Alert banner if user falls below minimum mastery in any subject. Suggests remediation. |
| `ResultsSummary.tsx` | Post-session results page: score, mastery delta, time spent, error breakdown, next steps. |
| `StudyHeatmap.tsx` | Alternative name for ActivityHeatmap or embedded study calendar. |
| `HeatmapDelta.tsx` | Shows change indicators (↑/↓) on heatmap nodes when delta view enabled. |
| `GradientImage.tsx` | Utility component for rendering readiness gradient background (radial gradients by score range). |
| `RichInfoPopover.tsx` | Info tooltip with rich text and learn-more link. Used for help text throughout dashboard. |
| `QuizStart.tsx` | Pre-quiz confirmation screen: mode rules, question count, topic, estimated time. Final "Start Quiz" CTA. |
| `ModeCard.tsx` | Visual card for a test mode (Camp/Storm/Chill/etc.). Shows rules and CTA to start. |
| `QuizOptions.tsx` | Quiz session customization panel: feedback style, question order, difficulty, subject filter. |
| `QuizActionButtons.tsx` | Utility button group for quiz actions (Flag, AI Tutor, Rationale, Exit). |
| `QuizDrawers.tsx` | Container for all quiz overlay drawers (AI tutor, rationale, restudy). Manages drawer state. |
| `QuizFooterNav.tsx` | Footer navigation container. Composed of FooterNavigator and SaveIndicator. |
| `DashboardRightColumn.tsx` | Right-side widget container (activity feed, trends, next best action, etc.). Responsive layout. |
| `RightColumnComponents.tsx` | Sub-components for right column. May export smaller dashboard elements. |
| `ActivityLog.tsx` | Chronological log of all user actions (login, session start/end, quiz complete). Rarely shown to users; used for analytics. |

## Subdirectories (if any)

None. All components are flat in `src/components/dashboard/`.

## For AI Agents

### Working In This Directory

The dashboard is the **hub** of SlateCamp. It must never compromise on state persistence (auto-save every 10 seconds), growth-framed language, and accurate data binding to the Readiness Score, Taxonomy Heatmap, and Pacing Gauge.

**Critical constraint:** Zero generic gamification (no confetti, badges, virtual currency, empty streaks). Progression is mapped **only** to:
1. Readiness Score (IRT 2-parameter logistic model with EMA weighting)
2. Taxonomy Heatmap (node states derived from mastery thresholds)
3. Pacing Gauge (seconds per item + endurance window)

**Test modes** supported: `camp`, `chill`, `storm`, `proof_sim`, `blindspot`, `endurance`, `custom`.
- Each mode has distinct styling (`MODE_STYLES` map in QuizHeader).
- Each mode enforces pedagogical rules (instant vs. delayed feedback, timed vs. untimed, etc.).

**Language:** Growth-framed ("42 topics covered" not "58 remaining"). Avoid "weakness," "gap," "behind," "grind," "dominate." Use "developing skill," "area to revisit," "master," "practice session."

**Campfire colors:**
- Readiness thresholds: red (#D64545) <40%, amber (#E8853A) <70%, green (#2D9F6F) >=70%
- Heatmap nodes: mastered (green), familiar (amber), danger (red with pulse), unexplored (gray), thin_coverage (gray + ring)
- Timer: primary (blue) normally, amber when <=20% remaining

### Common Patterns

1. **Card-based UI:** Most dashboard widgets use `<Card>` wrapper with `CardHeader` + `CardContent`. Shadow = none at rest, sm on hover.
2. **Props-driven rendering:** Components accept data (scores, clusters, nodes) and optional callbacks (onNodeSelect, onStart). Minimal internal state unless interactive.
3. **Color-coded feedback:** Use color to communicate state (ready/develop/danger). Always pair color with text or icon for a11y.
4. **Trend indication:** Small badges or arrows show direction (improving/softening/stable). Recent data weighted more heavily.
5. **Modal & sheet patterns:** Drawers via Framer Motion + AnimatePresence. Modals via Dialog component. No inline collapsible sections in quiz context.
6. **IRT integration:** Readiness Score uses theta (IRT latent ability), discrimination, difficulty, and lucky-guess correction. Do not hardcode thresholds; derive from IRT model output.
7. **Delta views:** Heatmap supports optional delta (Pro feature) — calculate delta as current state minus prior state (session/week/month).

## Dependencies

### Internal

- `@/components/ui/*` — shadcn/ui primitives (Card, Dialog, Button, Switch, RadioGroup, Label, Tooltip, Sheet)
- `@/components/graphics/icons/Icon` — Custom icon wrapper (SCIcon) for Phosphor icons
- `@/lib/utils` — cn() utility, formatting helpers
- `@/types/app` — TypeScript type definitions (TestMode, UserTier, TaxonomyNode, Choice, Question, HeatmapNode, etc.)
- `@/lib/hooks/useQuiz` — Quiz session state (current question, selected option, flags, submission status)
- `@/lib/hooks/useReadiness` — Readiness Score data (score, previousScore, trend)
- `@/lib/hooks/useMastery` — Heatmap data fetching (clusters, nodes, delta)
- `@/lib/hooks/useSession` — Session builder state and navigation

### External

- `react` (19.x) — Hooks, context, suspense
- `recharts` — Area charts (PacingEnduranceGauge)
- `framer-motion` — Animation/transitions for drawers, sheets, modals
- `@phosphor-icons/react` — Icon set
- `next/link`, `next/image` — Next.js primitives
- `next/navigation` — useRouter, usePathname for quiz flow
- `next-mdx-remote` — Markdown rendering in rationale/AI responses (optional)

## Campfire Design System

### Colors & Styling

- **Text:** text-[#1A2332] (primary), text-[#4A5568] (secondary), text-[#8896A7] (tertiary/muted)
- **Borders:** border-border (#D4DAE3)
- **Backgrounds:** bg-white (cards), bg-[#F8F7F5] (page), bg-[#F5F7FA] (focused testing area), bg-[#EEF2FC] (hover/active tints)
- **Shadows:** shadow-none (at rest), shadow-sm (card hover), shadow-md (dropdown), shadow-lg (modal)
- **Radii:** rounded-sm (6px buttons/inputs), rounded-md (8px cards), rounded-lg (12px modals)
- **Transitions:** max 300ms, duration-150 ease-out default

### Typography

- Minimum text: 11px (text-[11px]). NEVER use 8px/9px/10px.
- Monospace ONLY on code, Readiness Score number, data values. NOT on labels.
- Use Inter via next/font/google.

<!-- MANUAL: -->

