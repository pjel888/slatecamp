'use client'

// DevControlsLayerToggles — module-specific layer toggles for Site Development Controls
// Designed to be injected as `children` into the shared LayersPanel component.
// Shows AMBF, BHL, FLAR, Setbacks, etc. — the DevControls-specific 3D layers.

import { useDevControlsStore } from '../stores/useDevControlsStore'
import type { LayerKey } from '@/lib/pd1096/types'

const DEVCONTROLS_LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'setbacks', label: 'Setback Zones', color: '#E74C3C' },
  { key: 'ambf', label: 'AMBF Envelope', color: '#1B3FC4' },
  { key: 'tosl', label: 'TOSL Overlay', color: '#88A898' },
  { key: 'floors', label: 'Floor Slabs', color: '#B8B4A8' },
  { key: 'bhl', label: 'BHL Ceiling', color: '#E8853A' },
  { key: 'flar', label: 'FLAR Ceiling', color: '#2D9F6F' },
  { key: 'rrow', label: 'Road & Grid', color: '#6B7280' },
  { key: 'building', label: 'Context Buildings', color: '#D4D0C8' },
  { key: 'firewall', label: 'Firewall Markers', color: '#FF6B35' },
]

export const DevControlsLayerToggles = () => {
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)

  const handleShowAll = () => {
    DEVCONTROLS_LAYERS.forEach((opt) => {
      if (!visibleLayers.has(opt.key)) toggleLayer(opt.key)
    })
  }

  const handleHideAll = () => {
    DEVCONTROLS_LAYERS.forEach((opt) => {
      if (visibleLayers.has(opt.key)) toggleLayer(opt.key)
    })
  }

  return (
    <>
      <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
        Development Controls
      </div>
      <div className="space-y-0.5">
        {DEVCONTROLS_LAYERS.map((opt) => {
          const active = visibleLayers.has(opt.key)
          return (
            <label
              key={opt.key}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-xs transition-colors duration-150 hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleLayer(opt.key)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[1px]"
                style={{ backgroundColor: opt.color, opacity: active ? 0.8 : 0.2 }}
              />
              <span className={active ? 'text-foreground' : 'text-muted-foreground'}>
                {opt.label}
              </span>
            </label>
          )
        })}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleShowAll}
          className="flex-1 rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          Show All
        </button>
        <button
          type="button"
          onClick={handleHideAll}
          className="flex-1 rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          Hide All
        </button>
      </div>
    </>
  )
}
