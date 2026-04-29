'use client'

import { useState, useEffect, useRef } from 'react'
import { Pin, PinOff } from 'lucide-react'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import type { LayerKey } from '@/lib/pd1096/types'

// ─── Layers Overlay ────────────────────────────────────────────────────────
// Floating panel below the viewport toolbar with layer toggle checkboxes.
// Pin icon keeps the panel open (disables click-outside close).

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

interface LayersOverlayProps {
  onClose: () => void
}

export function LayersOverlay({ onClose }: LayersOverlayProps) {
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)
  const ref = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)

  // Close on click outside — only when not pinned
  useEffect(() => {
    if (pinned) return

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose, pinned])

  const handleShowAll = () => {
    LAYER_OPTIONS.forEach((opt) => {
      if (!visibleLayers.has(opt.key)) toggleLayer(opt.key)
    })
  }
  const handleHideAll = () => {
    LAYER_OPTIONS.forEach((opt) => {
      if (visibleLayers.has(opt.key)) toggleLayer(opt.key)
    })
  }

  return (
    <div
      ref={ref}
      className="mt-2 w-[220px] animate-in fade-in zoom-in-95 rounded-lg border border-border bg-popover p-3 shadow-lg"
    >
      {/* Header with pin toggle */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Layers
        </span>
        <button
          onClick={() => setPinned(!pinned)}
          aria-label={pinned ? 'Unpin layers panel' : 'Pin layers panel'}
          title={pinned ? 'Unpin (click outside to close)' : 'Pin open'}
          className={`flex size-6 items-center justify-center rounded-sm transition-colors duration-150 ${
            pinned
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {pinned ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      </div>

      <div className="space-y-1">
        {LAYER_OPTIONS.map((opt) => {
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
                className="size-3.5 rounded border-border accent-primary"
              />
              <span
                className="size-2.5 shrink-0 rounded-[1px]"
                style={{ backgroundColor: opt.color, opacity: active ? 0.8 : 0.2 }}
              />
              <span className={active ? 'text-foreground' : 'text-muted-foreground line-through'}>
                {opt.label}
              </span>
            </label>
          )
        })}
      </div>

      <hr className="my-2 border-border" />

      <div className="flex gap-2">
        <button
          onClick={handleShowAll}
          className="flex-1 rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          Show All
        </button>
        <button
          onClick={handleHideAll}
          className="flex-1 rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          Hide All
        </button>
      </div>
    </div>
  )
}
