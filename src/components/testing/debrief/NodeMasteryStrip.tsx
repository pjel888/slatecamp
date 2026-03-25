'use client'

import type { NodeMasteryDelta } from '@/types/testing'
import { Eyebrow } from '@/components/ui/eyebrow'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NodeMasteryStripProps {
  deltas: NodeMasteryDelta[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATE_COLORS: Record<NodeMasteryDelta['currentState'], string> = {
  grey: '#D1D5DB',   // zinc-300 equivalent
  red: 'var(--destructive)',
  amber: 'var(--warning)',
  green: 'var(--success)',
}

const STATE_TEXT_COLORS: Record<NodeMasteryDelta['currentState'], string> = {
  grey: 'var(--muted-foreground)',
  red: 'var(--destructive)',
  amber: 'var(--warning)',
  green: 'var(--success)',
}

const STATE_LABELS: Record<NodeMasteryDelta['currentState'], string> = {
  grey: 'Not started',
  red: 'Developing',
  amber: 'Building',
  green: 'Mastered',
}

// ─── Dot ──────────────────────────────────────────────────────────────────────

const StateDot = ({ state }: { state: NodeMasteryDelta['currentState'] }) => (
  <span
    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
    style={{ backgroundColor: STATE_COLORS[state] }}
    aria-label={STATE_LABELS[state]}
  />
)

// ─── Component ────────────────────────────────────────────────────────────────

export const NodeMasteryStrip = ({ deltas }: NodeMasteryStripProps) => {
  if (deltas.length === 0) return null

  return (
    <div>
      {/* Section label */}
      <Eyebrow className="mb-3 block">Mastery Updates</Eyebrow>

      <div className="bg-card rounded-lg border border-border">
        {deltas.map((delta, idx) => {
          const isLast = idx === deltas.length - 1
          const stateChanged = delta.previousState !== delta.currentState
          const deltaLabel = stateChanged
            ? `${STATE_LABELS[delta.previousState]} → ${STATE_LABELS[delta.currentState]} +${delta.pointDelta} pts`
            : `Still ${STATE_LABELS[delta.currentState]} +${delta.pointDelta} pts`

          return (
            <div
              key={delta.nodeId}
              className={`flex items-center gap-3 px-4 py-2.5${isLast ? '' : ' border-b border-border'}`}
            >
              {/* ALE ID — monospace, correct per spec */}
              <span
                className="font-mono text-[11px] flex-shrink-0 w-32"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {delta.aleId}
              </span>

              {/* Node name */}
              <span
                className="text-sm font-medium flex-1 min-w-0 truncate"
                style={{ color: 'var(--foreground)' }}
                title={delta.nodeName}
              >
                {delta.nodeName}
              </span>

              {/* State transition dots */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <StateDot state={delta.previousState} />
                <span
                  className="text-xs"
                  style={{ color: 'var(--muted-foreground)' }}
                  aria-hidden="true"
                >
                  →
                </span>
                <StateDot state={delta.currentState} />
              </div>

              {/* Delta text */}
              <span
                className="text-xs flex-shrink-0 hidden sm:block"
                style={{ color: STATE_TEXT_COLORS[delta.currentState] }}
              >
                {deltaLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
