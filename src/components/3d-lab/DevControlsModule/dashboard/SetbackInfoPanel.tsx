'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { CollapsibleSection } from './CollapsibleSection'

// ─── Setback Info Panel ────────────────────────────────────────────────────
// Shows effective setback distances (F/R/L/R) and the resulting buildable
// envelope dimensions. Displayed in the Building tab to give students
// visibility into what constrains their buildable area.

const SIDES: { key: 'front' | 'rear' | 'left' | 'right'; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'rear', label: 'Rear' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

export function SetbackInfoPanel() {
  const setbacks = useDevControlsStore((s) => s.result.setbacks)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)

  const buildableW = lotW - setbacks.effective.left - setbacks.effective.right
  const buildableD = lotD - setbacks.effective.front - setbacks.effective.rear

  return (
    <CollapsibleSection title="Setbacks" defaultOpen persistKey="setback-info">
      {/* Setback distances grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {SIDES.map((s) => (
          <div key={s.key} className="flex items-baseline justify-between">
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
            <span className="font-mono text-xs font-medium tabular-nums text-foreground">
              {setbacks.effective[s.key].toFixed(1)}
              <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">m</span>
            </span>
          </div>
        ))}
      </div>

      {/* Incremental note */}
      {setbacks.incremental > 0 && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Includes +{setbacks.incremental.toFixed(1)}m incremental (§804.6)
        </p>
      )}

      {/* Buildable envelope */}
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <p className="mb-1 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Buildable Envelope
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-muted-foreground">Width</span>
            <span className="font-mono text-xs font-medium tabular-nums text-foreground">
              {buildableW.toFixed(1)}
              <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">m</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-muted-foreground">Depth</span>
            <span className="font-mono text-xs font-medium tabular-nums text-foreground">
              {buildableD.toFixed(1)}
              <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">m</span>
            </span>
          </div>
        </div>
      </div>

      {/* Code note */}
      {setbacks.note && (
        <p className="mt-1.5 font-mono text-[8px] text-muted-foreground">{setbacks.note}</p>
      )}
    </CollapsibleSection>
  )
}
