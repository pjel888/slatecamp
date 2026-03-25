<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# trails

## Purpose

Camp Trails -- guided learning paths through taxonomy topics with daily assignments, progress tracking, phase maps, and recommendations. Provides structure for multi-day study plans with intensity levels (intensive, accelerated, standard, comprehensive, undergraduate). Includes trail library, daily views, catch-up mechanics, and dashboard integration cards.

## Key Files

| File | Description |
|------|-------------|
| `TrailDetail.tsx` | Trail overview with stats (duration, intensity, step count), enrollment CTA, week-by-week breakdown. `'use client'` |
| `TrailDetailEnroll.tsx` | Enrollment form/CTA for a specific trail. `'use client'` |
| `TrailDailyView.tsx` | Daily view showing current day's steps and progress. `'use client'` |
| `TrailDayView.tsx` | Individual day view within a trail. `'use client'` |
| `TrailLibrary.tsx` | Browsable library of all available trails with filtering. `'use client'` |
| `TrailFilterRow.tsx` | Filter controls for trail library (intensity, duration, subject). `'use client'` |
| `TrailCard.tsx` | Summary card for a trail in list/grid views. `'use client'` |
| `DashboardTrailCard.tsx` | Compact trail card for dashboard integration. `'use client'` |
| `RecommendedTrailCard.tsx` | AI-recommended trail card with rationale. `'use client'` |
| `TrailPhaseMap.tsx` | Visual phase map showing trail structure and progress. `'use client'` |
| `PhaseTransitionCard.tsx` | Card shown at phase boundaries within a trail. `'use client'` |
| `TrailStepCard.tsx` | Individual step within a trail day. `'use client'` |
| `TrailRibbon.tsx` | Visual ribbon showing trail progress/completion. `'use client'` |
| `ActiveTrailBanner.tsx` | Banner for currently active trail with progress and continue CTA. `'use client'` |
| `DayCompletionMoment.tsx` | Celebration/completion screen when user finishes a day. `'use client'` |
| `CatchUpView.tsx` | Catch-up interface for missed trail days. `'use client'` |
| `MissedDayCard.tsx` | Card for a missed day with catch-up options. `'use client'` |
| `ScoreTrajectoryChart.tsx` | Recharts line chart showing score trajectory through trail. `'use client'` |
| `MiniHeatmapPreview.tsx` | Compact heatmap preview for trail topic coverage. `'use client'` |
| `BlindspotPriorityFlag.tsx` | Flag indicating blindspot topics within trail. `'use client'` |
| `SleepAwareLabel.tsx` | Label that adjusts messaging based on time of day. `'use client'` |
| `index.ts` | Barrel exports for trails components. |

## Subdirectories

None. All trails components are flat in `src/components/trails/`.

## For AI Agents

### Working In This Directory

- **Intensity Colors**: Red (intensive), Amber (accelerated), Cobalt (standard), Emerald (comprehensive/undergraduate)
- **Duration**: Measured in days; weeks calculated as `Math.ceil(dayNumber / 7)`
- **Steps**: Trail days contain step arrays; total steps rolled up from all days
- **Enrollment**: Server action `enrollInTrail()` creates enrollment record and routes to `/dashboard/trails/{slug}/today`
- **Progress**: Tracked via `TrailEnrollment` with `current_day` and `days_completed` fields
- **State Management**: Uses `useTransition()` for async enrollment operations
- **Navigation**: Uses Next.js `useRouter()` for programmatic routing post-enrollment
- **Catch-up**: MissedDayCard and CatchUpView handle days the user skipped, offering condensed review
- **Score trajectory**: ScoreTrajectoryChart uses Recharts to plot mastery score changes throughout the trail
- **Dashboard integration**: DashboardTrailCard and ActiveTrailBanner are designed for embedding in the main dashboard

### Dependencies
### Internal

- `@/lib/actions/trails` - Server actions: `enrollInTrail()`
- `@/types/app` - Types: `CampTrail`, `TrailDay`, `TrailEnrollment`
- `@phosphor-icons/react` - Icons (CaretDown, CaretRight, Clock, Fire, ListChecks)
- `@/components/ui/*` - Card, Button, Badge
- `@/lib/utils` - cn() utility
- Next.js (`next/navigation`) - Router for client-side navigation
- React hooks - `useState`, `useTransition`
- `recharts` - ScoreTrajectoryChart

<!-- MANUAL: Ensure trail durations align with learning science research on spaced repetition intervals. Test enrollment flow end-to-end. Verify intensity color mappings match Campfire palette. -->
