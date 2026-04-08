'use client'

import { Card } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { useChartColors } from '@/hooks/useChartColors'
import { cn } from '@/lib/utils'
import type { ReadingDepthRow } from '@/lib/actions/analytics/get-reading-depth-data'

interface Props {
  data: ReadingDepthRow[]
}

// ── Intensity helpers ─────────────────────────────────────────────────────────

const toIntensity = (value: number, max: number): number => {
  if (max <= 0 || value <= 0) return 0
  return Math.min(1, value / max)
}

const intensityToBg = (intensity: number, baseHex: string): string => {
  // Opacity steps: 0→10%, 0.25→30%, 0.5→55%, 0.75→75%, 1→95%
  const opacity = Math.round((0.1 + intensity * 0.85) * 100)
  return `${baseHex}${opacity < 10 ? `0${opacity}` : opacity}`
}

const COLS: { key: keyof ReadingDepthRow; label: string; unit: string }[] = [
  { key: 'articlesRead', label: 'Articles Read', unit: '' },
  { key: 'avgScrollDepth', label: 'Avg Scroll Depth', unit: '%' },
  { key: 'avgReadDuration', label: 'Avg Read Time', unit: 'min' },
]

export const ReadingDepthHeatmap = ({ data }: Props) => {
  const colors = useChartColors()

  if (data.length === 0) {
    return (
      <ChartEmptyState
        title="No reading depth data yet"
        description="Reading depth analysis appears after reading multiple wiki articles."
        height="h-[320px]"
      />
    )
  }

  // Compute per-column max for relative intensity
  const maxArticles = Math.max(...data.map((r) => r.articlesRead), 1)
  const maxScroll = Math.max(...data.map((r) => r.avgScrollDepth), 1)
  const maxDuration = Math.max(...data.map((r) => r.avgReadDuration), 1)

  const colMaxes: Record<keyof ReadingDepthRow, number> = {
    topic: 1,
    articlesRead: maxArticles,
    avgScrollDepth: maxScroll,
    avgReadDuration: maxDuration,
  }

  const colColors = [colors.primary, colors.success, colors.warning]

  return (
    <Card className="border-border bg-card p-3 relative">
      <RichInfoPopover
        title="Reading Depth Heatmap"
        description="Each row is a topic. Columns show articles read, average scroll depth, and average read time. Darker = higher engagement."
      />

      <div className="mb-3">
        <h3 className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Reading Depth by Topic
        </h3>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Engagement depth across wiki articles
        </p>
      </div>

      {/* Column headers */}
      <div
        className="grid gap-1 mb-1"
        style={{ gridTemplateColumns: '1fr repeat(3, 80px)' }}
      >
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Topic
        </div>
        {COLS.map((col) => (
          <div
            key={col.key}
            className="text-[10px] text-muted-foreground uppercase tracking-wide text-center"
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Heatmap rows */}
      <div
        role="table"
        aria-label="Reading depth heatmap by topic"
        className="flex flex-col gap-[3px]"
      >
        {data.map((row) => (
          <div
            key={row.topic}
            role="row"
            className="grid gap-1 items-center"
            style={{ gridTemplateColumns: '1fr repeat(3, 80px)' }}
          >
            <span
              className="text-xs text-foreground font-medium truncate pr-2"
              title={row.topic}
            >
              {row.topic}
            </span>
            {COLS.map((col, ci) => {
              const value = row[col.key] as number
              const intensity = toIntensity(value, colMaxes[col.key])
              const baseColor = colColors[ci] ?? colors.primary
              // Use opacity class approach via inline style for SVG-safe rendering
              const bgOpacity = Math.round(0.1 + intensity * 0.85)

              return (
                <div
                  key={col.key}
                  role="cell"
                  className={cn(
                    'rounded-sm h-7 flex items-center justify-center transition-opacity duration-150',
                  )}
                  style={{
                    backgroundColor: baseColor,
                    opacity: 0.15 + intensity * 0.8,
                  }}
                  title={`${row.topic}: ${value}${col.unit}`}
                >
                  <span
                    className="text-[11px] font-medium tabular-nums select-none"
                    style={{ color: intensity > 0.5 ? '#ffffff' : '#1A2332' }}
                  >
                    {col.key === 'avgReadDuration'
                      ? `${value}m`
                      : col.key === 'avgScrollDepth'
                        ? `${value}%`
                        : value}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-3">
        {COLS.map((col, ci) => (
          <div key={col.key} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-[2px]"
              style={{ backgroundColor: colColors[ci] ?? colors.primary }}
            />
            <span className="text-[10px] text-muted-foreground">{col.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
