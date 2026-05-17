'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartCoachingAnnotation } from './ChartCoachingAnnotation'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import type { StaminaHeatmapData } from '@/lib/actions/analytics/chart-data'

interface Props {
  data: StaminaHeatmapData
  variant?: 'default' | 'compact'
}

const CELL_SIZE = 12
const CELL_GAP = 1

const CELL_COLORS = {
  correct: '#2D9F6F',
  incorrect: '#D64545',
  skipped: '#E5E7EB',
} as const

const buildCoaching = (data: StaminaHeatmapData): { text: string; variant: 'warning' | 'success' } | null => {
  if (!data.fatiguePoint) {
    if (data.rows.length >= 5) {
      return {
        text: 'Strong endurance — no consistent accuracy drop detected across sessions.',
        variant: 'success',
      }
    }
    return null
  }
  return {
    text: `Accuracy tends to drop after question ${data.fatiguePoint}. Consider shorter sessions or a break at that point.`,
    variant: 'warning',
  }
}

export const StaminaHeatmap = ({ data, variant = 'default' }: Props) => {
  const isCompact = variant === 'compact'
  const coaching = buildCoaching(data)
  const gridWidth = data.maxQuestions * (CELL_SIZE + CELL_GAP)

  return (
    <Card className="border-border bg-card p-2 relative h-full overflow-hidden">
      <RichInfoPopover
        title="Session Stamina Heatmap"
        description="Each row is a session (most recent on top). Green = correct, red = incorrect, gray = skipped. Patterns reveal fatigue points."
      />
      <CardHeader className={isCompact ? 'p-1.5 pt-1' : 'p-2 pt-1'}>
        <CardTitle className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          Session Stamina Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className={isCompact ? 'p-1.5 pt-0 min-h-0' : 'p-2 pt-0'}>
        {data.rows.length === 0 ? (
          <ChartEmptyState
            title="No session data"
            description="Complete a few drill sessions to see your stamina heatmap."
            height={isCompact ? 'h-full' : 'h-[340px]'}
          />
        ) : (
          <>
            <div className={isCompact ? 'max-h-[210px] overflow-auto' : 'overflow-x-auto'}>
              {/* Column headers */}
              <div className="flex items-end mb-1 ml-[72px]">
                {data.maxQuestions > 0 && Array.from({ length: Math.ceil(data.maxQuestions / 5) }, (_, i) => {
                  const qNum = (i + 1) * 5
                  return (
                    <span
                      key={i}
                      className="text-[9px] text-muted-foreground"
                      style={{
                        position: 'relative',
                        left: `${(qNum - 1) * (CELL_SIZE + CELL_GAP) - i * 20}px`,
                        width: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {qNum}
                    </span>
                  )
                })}
              </div>

              <svg
                width={gridWidth + 80}
                height={data.rows.length * (CELL_SIZE + CELL_GAP + 2) + 4}
                className="block"
              >
                {data.rows.map((row, rowIdx) => (
                  <g key={row.sessionId} transform={`translate(0, ${rowIdx * (CELL_SIZE + CELL_GAP + 2)})`}>
                    {/* Row label */}
                    <text
                      x={0}
                      y={CELL_SIZE - 2}
                      fill="#8896A7"
                      fontSize={9}
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {row.date}
                    </text>
                    {/* Cells */}
                    {row.cells.map((cell, colIdx) => {
                      const cellX = 72 + colIdx * (CELL_SIZE + CELL_GAP)
                      const symbol = cell.result === 'correct' ? '✓' : cell.result === 'incorrect' ? '✗' : '–'
                      const symbolColor = cell.result === 'skipped' ? '#6B7280' : '#FFFFFF'
                      return (
                        <g key={colIdx}>
                          <title>{`Q${colIdx + 1}: ${cell.result}`}</title>
                          <rect
                            x={cellX}
                            y={0}
                            width={CELL_SIZE}
                            height={CELL_SIZE}
                            rx={2}
                            fill={CELL_COLORS[cell.result]}
                            opacity={cell.result === 'skipped' ? 0.5 : 0.85}
                          />
                          <text
                            x={cellX + CELL_SIZE / 2}
                            y={CELL_SIZE / 2 + 3}
                            textAnchor="middle"
                            fontSize={8}
                            fill={symbolColor}
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                          >
                            {symbol}
                          </text>
                        </g>
                      )
                    })}
                    {/* Fatigue line */}
                    {data.fatiguePoint && (
                      <line
                        x1={72 + (data.fatiguePoint - 1) * (CELL_SIZE + CELL_GAP) - 1}
                        y1={-1}
                        x2={72 + (data.fatiguePoint - 1) * (CELL_SIZE + CELL_GAP) - 1}
                        y2={CELL_SIZE + 1}
                        stroke="#D4951A"
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className={isCompact ? 'flex flex-wrap gap-2 px-1 mt-1' : 'flex gap-3 px-1 mt-2'}>
              {(['correct', 'incorrect', 'skipped'] as const).map(result => (
                <div key={result} className="flex items-center gap-1">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: CELL_COLORS[result], opacity: result === 'skipped' ? 0.5 : 0.85 }}
                  />
                  <span className="text-[11px] capitalize" style={{ color: '#4A5568' }}>
                    {result}
                  </span>
                </div>
              ))}
              {data.fatiguePoint && (
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-0.5 rounded-full" style={{ backgroundColor: '#D4951A' }} />
                  <span className="text-[11px]" style={{ color: '#D4951A' }}>
                    Fatigue point
                  </span>
                </div>
              )}
            </div>
          </>
        )}
        {coaching && <ChartCoachingAnnotation text={coaching.text} variant={coaching.variant} />}
      </CardContent>
    </Card>
  )
}
