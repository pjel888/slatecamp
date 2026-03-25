'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type NodeState = 'mastered' | 'familiar' | 'danger' | 'unexplored' | 'thin_coverage'

export interface HeatmapNode {
  id: string
  label: string
  state: NodeState
  progress: number
  /** Delta: change indicator (positive = improved, negative = declined, null = no change) */
  delta?: number | null
}

export interface HeatmapCluster {
  id: string
  title: string
  nodes: HeatmapNode[]
}

type DeltaPeriod = 'off' | 'session' | 'week' | 'month'

interface TaxonomyHeatmapProps {
  clusters: HeatmapCluster[]
  onNodeSelect?: (node: HeatmapNode) => void
  /** Enable delta view toggle (Pro feature) */
  showDeltaToggle?: boolean
}

const stateClassMap: Record<NodeState, string> = {
  mastered: 'bg-emerald',
  familiar: 'bg-camp-orange',
  danger: 'bg-warning animate-pulse',  // Amber — needs work; red is reserved for functional errors
  unexplored: 'bg-border',
  thin_coverage: 'bg-border ring-1 ring-inset ring-text-tertiary/40',
}

const stateA11yLabel: Record<NodeState, string> = {
  mastered: 'Strong',
  familiar: 'Developing',
  danger: 'Needs work',
  unexplored: 'Not yet explored',
  thin_coverage: 'Limited data — fewer than 5 questions answered',
}

const DELTA_LABELS: Record<DeltaPeriod, string> = {
  off: 'Current',
  session: 'Last session',
  week: 'Last week',
  month: 'Last month',
}

export const TaxonomyHeatmap = ({
  clusters,
  onNodeSelect,
  showDeltaToggle = false,
}: TaxonomyHeatmapProps) => {
  const [deltaPeriod, setDeltaPeriod] = useState<DeltaPeriod>('off')
  const showDelta = deltaPeriod !== 'off'

  return (
    <Card className='border-0 bg-white shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between gap-4 pb-2'>
        <div>
          <CardTitle className='text-sm font-medium tracking-tight text-text-secondary'>
            Global Taxonomy Heatmap
          </CardTitle>
          <p className='mt-1 text-xs text-text-tertiary'>
            Master syllabus coverage, by subject and topic.
          </p>
        </div>

        {/* Delta View Toggle — UX Strategy Section 8, Step 4 (Pro feature) */}
        {showDeltaToggle && (
          <div className="flex items-center gap-1">
            {(['off', 'session', 'week', 'month'] as DeltaPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setDeltaPeriod(period)}
                className={cn(
                  'px-2 py-1 rounded-sm text-[11px] font-medium transition-colors duration-150',
                  deltaPeriod === period
                    ? 'bg-camp-cobalt text-white'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-muted',
                )}
              >
                {DELTA_LABELS[period]}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className='space-y-4 pt-1'>
        {clusters.map((cluster) => (
          <div key={cluster.id} className='space-y-2 rounded-md bg-muted p-3'>
            <div className='flex items-baseline justify-between gap-2'>
              <p className='text-xs font-medium tracking-tight text-text-primary'>
                {cluster.title}
              </p>
            </div>

            <div className='flex flex-col gap-1.5'>
              {cluster.nodes.map((node) => (
                <button
                  key={node.id}
                  type='button'
                  onClick={onNodeSelect ? () => onNodeSelect(node) : undefined}
                  aria-label={`${node.label} — ${stateA11yLabel[node.state]} — ${Math.round(node.progress)}%`}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-xs',
                    'outline-none ring-0 transition-colors',
                    'hover:bg-primary-50 focus-visible:bg-primary-50',
                    node.state === 'unexplored' && 'border border-dashed border-border',
                  )}
                >
                  <span className='truncate text-text-primary'>{node.label}</span>
                  <span className='flex min-w-[96px] items-center gap-2'>
                    <span className='relative block h-1.5 w-full overflow-hidden rounded-full bg-primary-50'>
                      <span
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full transition-all',
                          stateClassMap[node.state],
                        )}
                        style={{
                          width: `${Math.max(4, Math.min(100, node.progress))}%`,
                        }}
                      />
                    </span>
                    <span className='w-[34px] text-right text-[11px] text-text-tertiary'>
                      {Math.round(node.progress)}%
                    </span>
                    {/* Delta indicator */}
                    {showDelta && node.delta != null && node.delta !== 0 && (
                      <span
                        className="text-[11px] font-medium shrink-0"
                        style={{ color: node.delta > 0 ? '#2D9F6F' : '#D64545' }}
                      >
                        {node.delta > 0 ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className='mt-1 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-[11px] text-text-tertiary'>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-emerald' />
            <span>Strong</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-camp-orange' />
            <span>Developing</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-warning' />
            <span>Needs work</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2 w-2 rounded-full bg-border' />
            <span>Not yet explored</span>
          </div>
          {showDelta && (
            <>
              <span className="text-border">|</span>
              <div className='flex items-center gap-1.5'>
                <span className="text-emerald">↑</span>
                <span>Improved</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className="text-destructive">↓</span>
                <span>Declined</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
