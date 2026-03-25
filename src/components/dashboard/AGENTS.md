<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# dashboard

## Purpose

Core dashboard component library for the SlateCamp learning engine. Renders the user's personalized study hub with progression visualizations (Readiness Score, Taxonomy Heatmap, Pacing Gauge), session discovery and builders, mode cards, activity feeds, quiz renderer, and result summaries. The dashboard is the primary entry point after user onboarding.

## Key Files

| File | Description |
|------|-------------|
| `TaxonomyHeatmap.tsx` | Master syllabus visualization by subject and topic. Displays node states (mastered/familiar/danger/unexplored/thin_coverage) as colored progress bars. Optional delta view toggle (Pro feature). `'use client'` |
| `HeatmapSection.tsx` | Dashboard widget: embeds TaxonomyHeatmap with optional detail sheet for node selection. `'use client'` |
| `CustomSessionBuilder.tsx` | Dialog for building custom quiz sessions. Subject multi-select, question count, instant feedback toggle. `'use client'` |
| `QuizRenderer.tsx` | Main quiz interface orchestrator. Composes header, question stem, options, footer nav, and overlays. `'use client'` |
| `QuizRenderer.test.tsx` | Test file for QuizRenderer. |
| `QuizOptions.tsx` | Quiz session customization panel. `'use client'` |
| `QuizActionButtons.tsx` | Utility button group for quiz actions (Flag, AI Tutor, Rationale, Exit). `'use client'` |
| `QuizDrawers.tsx` | Container for all quiz overlay drawers. `'use client'` |
| `QuizFooterNav.tsx` | Footer navigation container for quiz. `'use client'` |
| `ModeCard.tsx` | Visual card for a test mode (Camp/Storm/Chill/etc.) with rules and CTA. `'use client'` |
| `ModeIntroScreen.tsx` | Intro modal for new session mode explaining rules. `'use client'` |
| `TestingHub.tsx` | Landing page for quiz subsystem. Session discovery, recent activity, mode selector. `'use client'` |
| `SubjectDrillSelector.tsx` | Drill-down UI: discipline to subject to topic to question count + mode. `'use client'` |
| `SubjectMasteryCard.tsx` | Per-subject readiness score in card form. `'use client'` |
| `SubjectRadarChart.tsx` | Radar chart of mastery across dimensions. `'use client'` |
| `SubjectFloorAlert.tsx` | Alert banner if user falls below minimum mastery. `'use client'` |
| `ActivityHeatmap.tsx` | Calendar view of study activity (GitHub-style grid). `'use client'` |
| `ImprovedActivityFeed.tsx` | Optimized activity feed view. `'use client'` |
| `HeroCommandBar.tsx` | Hero section command bar for dashboard. `'use client'` |
| `FeatureDiscoveryRow.tsx` | Promotional row for new features. Dismissible. `'use client'` |
| `SrsReviewWidget.tsx` | Spaced repetition review widget. `'use client'` |
| `StreakRibbon.tsx` | Visual ribbon for consecutive study days (only shown if streak > 0). `'use client'` |
| `OnboardingStateCard.tsx` | Conditional card during onboarding. `'use client'` |
| `LockedScoreWidget.tsx` | Readiness Score in locked/trial state for free users. `'use client'` |
| `GradientImage.tsx` | Utility component for readiness gradient background. `'use client'` |
| `RichInfoPopover.tsx` | Info tooltip with rich text and learn-more link. `'use client'` |
| `ResultsSummary.tsx` | Post-session results page. `'use client'` |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|------------|
| `heatmap/` | Heatmap sub-components (grid, header, legend) | 3 files |
| `results/` | Post-session result display components | 5 files |

### heatmap/

| File | Description |
|------|-------------|
| `HeatmapGrid.tsx` | Grid layout for heatmap cells. `'use client'` |
| `HeatmapHeader.tsx` | Header bar for heatmap section. |
| `HeatmapLegend.tsx` | Legend showing mastery level color mapping. |

### results/

| File | Description |
|------|-------------|
| `ScoreHero.tsx` | Large score display for results page. `'use client'` |
| `StatCards.tsx` | Row of stat cards for results summary. `'use client'` |
| `QuestionReviewList.tsx` | List of questions with correct/incorrect indicators for review. `'use client'` |
| `TopicBreakdown.tsx` | Mastery breakdown by topic for results. `'use client'` |
| `ResultsActions.tsx` | Action buttons on results page (Review Mistakes, New Session, Return). `'use client'` |

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
7. **Delta views:** Heatmap supports optional delta (Pro feature) -- calculate delta as current state minus prior state (session/week/month).

## Dependencies

### Internal

- `@/components/ui/*` -- shadcn/ui primitives (Card, Dialog, Button, Switch, RadioGroup, Label, Tooltip, Sheet)
- `@/components/graphics/icons/Icon` -- Custom icon wrapper (SCIcon) for Phosphor icons
- `@/components/shared/*` -- RichInfoPopover, SectionHeader, StatCard
- `@/lib/utils` -- cn() utility, formatting helpers
- `@/types/app` -- TypeScript type definitions (TestMode, UserTier, TaxonomyNode, Choice, Question, HeatmapNode, etc.)
- `@/lib/hooks/useQuiz` -- Quiz session state
- `@/lib/hooks/useReadiness` -- Readiness Score data
- `@/lib/hooks/useMastery` -- Heatmap data fetching
- `@/lib/hooks/useSession` -- Session builder state and navigation

### External

- `react` (19.x) -- Hooks, context, suspense
- `recharts` -- Area charts, radar charts
- `framer-motion` -- Animation/transitions for drawers, sheets, modals
- `@phosphor-icons/react` -- Icon set
- `next/link`, `next/image` -- Next.js primitives
- `next/navigation` -- useRouter, usePathname for quiz flow

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
