'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import type { LayerKey } from '@/lib/pd1096/types'

const LAYER_OPTIONS: { key: LayerKey; label: string; color: string }[] = [
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

export function LayerToggles() {
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Layer Visibility
      </label>
      <div className="grid grid-cols-2 gap-1">
        {LAYER_OPTIONS.map((opt) => {
          const active = visibleLayers.has(opt.key)
          return (
            <button
              key={opt.key}
              onClick={() => toggleLayer(opt.key)}
              className={`flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[9px] font-medium transition-colors duration-150 ${
                active
                  ? 'border-border bg-white text-foreground'
                  : 'border-border bg-surface-light text-muted-foreground line-through'
              }`}
            >
              <div
                className="h-2 w-3 rounded-[1px] shrink-0"
                style={{
                  backgroundColor: opt.color,
                  opacity: active ? 0.8 : 0.2,
                }}
              />
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
