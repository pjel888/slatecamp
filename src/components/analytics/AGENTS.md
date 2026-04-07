<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-24 | Updated: 2026-03-25 -->

# analytics

## Purpose

Analytics dashboard visualizations powered by Recharts. Displays mastery trajectories, memory health, pacing insights, study stamina curves, taxonomy coverage (heatmaps), and readiness scoring. All components are data-driven; parent pages fetch server-side and pass props.

## Key Files

| File | Description |
|------|-------------|
| `ReadinessSection.tsx` | Server component: fetches readiness trajectory + score, renders ReadinessTrajectory chart. |
| `ReadinessTrajectory.tsx` | Recharts ComposedChart: area (passing threshold) + line (user trajectory). Shows current %ile, delta, trend icon. `'use client'` |
| `SummarySection.tsx` | Cards: total practice time, questions answered, topics covered, current readiness %. |
| `AnalyticsSummaryBar.tsx` | Horizontal summary bar: stats widgets with icons and values. Compact version of SummarySection. |
| `RadarSection.tsx` | Recharts Radar chart: discipline-level mastery on 6-point scale (0-100). `'use client'` |
| `TimelineHeatmap.tsx` | Calendar-grid heatmap: day to activity intensity (color gradient). Shows 12-month window. `'use client'` |
| `TimelineHeatmapSection.tsx` | Container for TimelineHeatmap with title, legend, metadata. |
| `StaminaCurve.tsx` | Line chart: study session duration over time. Shows fatigue patterns. `'use client'` |
| `StaminaSection.tsx` | Container: StaminaCurve + text interpretation. |
| `MemoryHealthMap.tsx` | Grid of topic cards: status badge (strong, review, fading, critical) with color-coded backgrounds. `'use client'` |
| `MemorySection.tsx` | Container for MemoryHealthMap + description. |
| `PacingQuadrant.tsx` | 2x2 quadrant: speed (x-axis) vs. accuracy (y-axis). Topics plotted as dots. `'use client'` |
| `PacingQuadrantSection.tsx` | Container: PacingQuadrant + legend explaining zones. |
| `PacingInsights.tsx` | Text analysis: "You are rushing" or "You are overthinking" based on quadrant placement. |
| `PacingInsightsSection.tsx` | Container: PacingInsights text + optional recommendations. |
| `ChartSkeleton.tsx` | Loading skeleton for chart placeholders. |
| `ChartCoachingAnnotation.tsx` | Overlay label on charts: contextual coaching messages based on data. |

## Subdirectories

None. All analytics components are flat in `src/components/analytics/`.

## For AI Agents

### Working In This Directory

1. **Server vs. Client split.** `*Section.tsx` files are server components (fetch + compose). `*Trajectory.tsx`, `*Heatmap.tsx`, `*Curve.tsx`, `*Quadrant.tsx` are client components (`'use client'`) that render charts and handle interactions.

2. **Recharts integration.**
   - Use `ResponsiveContainer` to make charts responsive (width: 100%).
   - Keep chart config (colors, margins, etc.) in a const near the component.
   - Tooltip and ReferenceLine are optional but useful for context.
   - X/YAxis: hide labels if space-constrained; use gridStroke color from Slatecamp palette.

3. **Data types.** Check `@/lib/actions/analytics` for the exact shape of `ReadinessTrajectoryPoint`, `MemoryHealthItem`, etc. Type components accordingly.

4. **Color consistency.** All status colors (strong, review, fading, critical) use Slatecamp tokens:
   - strong: Emerald (#2D9F6F) + Emerald 50 (#EDFAF4)
   - review / fading: Amber (#D4951A) + Amber 50 (#FEF8ED)
   - critical: Warm Red (#D64545) + Warm Red 50 (#FDF0F0)

5. **No hardcoded numbers.** All thresholds (e.g., readiness < 40 = red) should match business logic in `@/lib/actions/analytics`.

### Common Patterns

**Server-side fetch + render:**
```tsx
export async function ReadinessSection() {
  const [trajectory, readiness] = await Promise.all([
    getReadinessTrajectory(),
    getReadinessScore(),
  ])
  return <ReadinessTrajectory data={trajectory} currentScore={readiness.score} ... />
}
```

**Recharts chart with responsive container:**
```tsx
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis } from 'recharts'

export const MyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#D4DAE3" />
      <XAxis dataKey="date" stroke="#8896A7" />
      <YAxis stroke="#8896A7" />
      <Area type="monotone" dataKey="value" fill="#EDFAF4" stroke="#2D9F6F" />
    </ComposedChart>
  </ResponsiveContainer>
)
```

**Status color mapping:**
```tsx
const STATUS_STYLES: Record<MemoryHealthItem['status'], string> = {
  strong: 'bg-[#EDFAF4] text-[#2D9F6F] border-[#2D9F6F]/20',
  review: 'bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20',
  fading: 'bg-[#FEF8ED] text-[#D4951A] border-[#D4951A]/20',
  critical: 'bg-[#FDF0F0] text-[#D64545] border-[#D64545]/20',
}
```

## Dependencies

### Internal

| Module | Purpose |
|--------|---------|
| `@/lib/actions/analytics` | Server functions: getReadinessTrajectory(), getMemoryHealth(), getPacingData(), etc. |
| `@/components/ui/card` | Card, CardHeader, CardTitle, CardContent |
| `@/components/dashboard/RichInfoPopover` | Info icon + popover for chart explanations |
| `@/lib/utils` | cn() for conditional styling |

### External

| Package | Usage | Version |
|---------|-------|---------|
| **recharts** | Charts: ComposedChart, LineChart, RadarChart, etc. | ^3.8.0 |
| **react** | Hooks: useMemo, useCallback | ^19.2.4 |

<!-- MANUAL: -->
