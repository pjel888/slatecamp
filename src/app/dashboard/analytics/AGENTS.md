<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-25 | Updated: 2026-03-25 -->

# analytics

## Purpose

Analytics dashboard for SlateCamp students. Displays learning progress through 8 visualization sections: summary metrics bar, study timeline heatmap, readiness trajectory chart, pacing quadrant, stamina curve, subject radar, memory health, and pacing insights. All charts are Server Components wrapped in individual Suspense boundaries with skeleton fallbacks for progressive loading. Uses `SharedPageLayout` via its layout wrapper.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Wraps children in `SharedPageLayout` from `@/components/layouts/SharedPageLayout` |
| `loading.tsx` | Full skeleton loading state with chart placeholder shapes |
| `page.tsx` | Server Component that composes 8 analytics sections, each in its own `<Suspense>` boundary with `<ChartSkeleton>` fallbacks |

## Subdirectories

None -- all analytics visualization logic lives in `@/components/analytics/`.

## For AI Agents

### Working In This Directory

- **Server Components throughout:** The page itself and all section components (`SummarySection`, `ReadinessSection`, etc.) are async Server Components that fetch data independently.
- **Independent Suspense boundaries:** Each of the 8 sections has its own `<Suspense>` boundary, so they load progressively and independently. Never wrap multiple sections in a single Suspense boundary.
- **Chart skeletons:** Use `<ChartSkeleton height="h-[Npx]" />` from `@/components/analytics/ChartSkeleton` for consistent loading states. Match the height to the expected rendered height of each section.
- **Layout grid:** The page uses a responsive grid layout:
  - Summary metrics: full width, 64px height
  - Timeline heatmap: full width, 140px height
  - Readiness trajectory: full width, 220px height
  - Pacing quadrant (7/12 cols) + Stamina (5/12 cols) at xl breakpoint, 360px height
  - Radar + Memory + Pacing Insights: 3-column grid at md breakpoint, 320px height each
- **No data fetching in this directory:** All data fetching happens inside the section components in `@/components/analytics/`. The page file only composes them.
- **IRT-based metrics:** All readiness and mastery values use IRT 2-parameter logistic model calculations -- never raw percentage scores.

### Testing Requirements

- Verify all 8 sections render independently (one failing should not break others)
- Confirm Suspense fallbacks show proper skeleton shapes
- Test responsive layout at mobile, tablet, and desktop breakpoints
- Verify charts handle empty data states gracefully (new user with no sessions)

### Common Patterns

- **Section component pattern:** Each section (e.g., `ReadinessSection`) is an async Server Component in `@/components/analytics/` that fetches its own data from Supabase and renders a chart
- **Chart library:** Uses `recharts` for all chart rendering
- **Skeleton pattern:** `ChartSkeleton` accepts a `height` prop as a Tailwind class string

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/components/layouts/SharedPageLayout` | Standard page wrapper with padding and min-height |
| `@/components/analytics/ChartSkeleton` | Skeleton loading component for chart sections |
| `@/components/analytics/SummarySection` | Summary metrics bar (total questions, accuracy, study time) |
| `@/components/analytics/ReadinessSection` | Readiness trajectory line chart over time |
| `@/components/analytics/PacingQuadrantSection` | Pacing quadrant scatter plot (signature visualization) |
| `@/components/analytics/StaminaSection` | Stamina curve showing performance over session duration |
| `@/components/analytics/RadarSection` | Subject radar chart for multi-subject comparison |
| `@/components/analytics/MemorySection` | Memory health visualization (retention decay) |
| `@/components/analytics/PacingInsightsSection` | Pacing insights and recommendations |
| `@/components/analytics/TimelineHeatmapSection` | Study activity heatmap (calendar-style) |

### External

| Package | Purpose |
|---------|---------|
| `recharts` | Chart rendering for all analytics visualizations |

<!-- MANUAL: -->
