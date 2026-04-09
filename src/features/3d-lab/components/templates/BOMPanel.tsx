'use client'

// src/features/3d-lab/components/templates/BOMPanel.tsx
// Bill of Materials panel — collapsible, grouped by construction stage
// Lives in RIGHT PANEL — NOT in 3D viewport

import { useState } from 'react'
import type { BOMEntry } from '@/features/3d-lab/config/modules/10-materials/wall-types'
import { PRICE_DISCLAIMER } from '@/features/3d-lab/config/modules/10-materials/wall-constants-performance'

interface BOMPanelProps {
  entries: BOMEntry[]
  totalCost: number
}

const GROUP_LABELS: Record<string, string> = {
  core: 'Core Materials',
  structural: 'Structural',
  finish: 'Finish Layers',
  labor: 'Labor',
  waste: 'Waste Allowance',
}

const GROUP_ORDER = ['core', 'structural', 'finish', 'labor', 'waste'] as const

export const BOMPanel = ({ entries, totalCost }: BOMPanelProps) => {
  const [expanded, setExpanded] = useState(false)

  // Group entries by construction stage
  const grouped = GROUP_ORDER.reduce<Record<string, BOMEntry[]>>((acc, group) => {
    const items = entries.filter((e) => e.group === group)
    if (items.length > 0) acc[group] = items
    return acc
  }, {})

  return (
    <div className="space-y-2">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-sm border border-border bg-card p-3 text-left transition-colors duration-150 ease-out hover:bg-muted/50"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Bill of Materials
        </span>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-foreground">
            ₱{totalCost.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-3 rounded-sm border border-border bg-card p-3">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {GROUP_LABELS[group] ?? group}
              </h4>
              <div className="space-y-0.5">
                {items.map((item, i) => (
                  <div key={`${group}-${i}`} className="flex items-baseline justify-between text-xs">
                    <div className="flex-1">
                      <span className="text-foreground">{item.material}</span>
                      <span className="ml-1 text-muted-foreground">
                        {item.quantity.toFixed(item.unit === 'pcs' ? 0 : 2)} {item.unit}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-foreground">
                      ₱{item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-baseline justify-between border-t border-border pt-2">
            <span className="text-xs font-semibold text-foreground">Total</span>
            <span className="font-display text-sm font-semibold text-foreground">
              ₱{totalCost.toLocaleString()}
            </span>
          </div>

          {/* Disclaimer */}
          <p className="text-[8px] leading-tight text-muted-foreground">
            {PRICE_DISCLAIMER}
          </p>
        </div>
      )}
    </div>
  )
}
