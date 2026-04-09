'use client'

// DevControlsCombinedLayers — BOTH generic layers (Grid/Dims/X-ray) AND
// DevControls-specific layers (AMBF, BHL, FLAR, Setbacks, etc.) in ONE panel.

import { useState, useEffect, useRef } from 'react'
import { Pin, PinOff } from 'lucide-react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import type { LayerKey } from '@/lib/pd1096/types'

// ─── Generic layers (available in ALL modules) ──────────────────────────────

interface GenericLayer {
  id: string
  label: string
  color: string
  storeKey: 'gridVisible' | 'dimensionsVisible' | 'xrayMode'
}

const GENERIC_LAYERS: GenericLayer[] = [
  { id: 'grid', label: 'Ground Grid', color: '#94a3b8', storeKey: 'gridVisible' },
  { id: 'dimensions', label: 'Dimensions', color: '#3b82f6', storeKey: 'dimensionsVisible' },
  { id: 'xray', label: 'X-ray Mode', color: '#8b5cf6', storeKey: 'xrayMode' },
]

// ─── DevControls-specific layers ────────────────────────────────────────────

const DEVCONTROLS_LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'setbacks', label: 'Setback Zones', color: '#E74C3C' },
  { key: 'ambf', label: 'AMBF Envelope', color: '#1B3FC4' },
  { key: 'tosl', label: 'TOSL Overlay', color: '#88A898' },
  { key: 'floors', label: 'Floor Slabs', color: '#B8B4A8' },
  { key: 'bhl', label: 'BHL Ceiling', color: '#E8853A' },
  { key: 'flar', label: 'FLAR Ceiling', color: '#2D9F6F' },
  { key: 'rrow', label: 'Road & Grid', color: '#6B7280' },
  { key: 'firewall', label: 'Firewall Markers', color: '#FF6B35' },
]

interface DevControlsCombinedLayersProps {
  onClose: () => void
}

export const DevControlsCombinedLayers = ({ onClose }: DevControlsCombinedLayersProps) => {
  // Generic layer state
  const gridVisible = useViewportShellStore((s) => s.gridVisible)
  const dimensionsVisible = useViewportShellStore((s) => s.dimensionsVisible)
  const xrayMode = useViewportShellStore((s) => s.xrayMode)
  const toggleGrid = useViewportShellStore((s) => s.toggleGrid)
  const toggleDimensions = useViewportShellStore((s) => s.toggleDimensions)
  const toggleXray = useViewportShellStore((s) => s.toggleXray)

  const genericValues: Record<string, boolean> = { gridVisible, dimensionsVisible, xrayMode }
  const genericToggles: Record<string, () => void> = {
    gridVisible: toggleGrid,
    dimensionsVisible: toggleDimensions,
    xrayMode: toggleXray,
  }

  // DevControls-specific layer state
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)

  const ref = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState(false)

  // Close on click outside (unless pinned)
  useEffect(() => {
    if (pinned) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (target.closest('[aria-label*="Layers"]')) return
        onClose()
      }
    }
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose, pinned])

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
    <div
      ref={ref}
      className="w-[240px] rounded-md border border-border bg-card p-3 shadow-lg"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Layers
        </span>
        <button
          type="button"
          onClick={() => setPinned(!pinned)}
          aria-label={pinned ? 'Unpin layers panel' : 'Pin layers panel'}
          className={`flex h-6 w-6 items-center justify-center rounded-sm transition-colors duration-150 ${
            pinned ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {pinned ? <Pin size={12} /> : <PinOff size={12} />}
        </button>
      </div>

      {/* ── Generic Layers ── */}
      <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
        Viewport
      </div>
      <div className="space-y-0.5 mb-3">
        {GENERIC_LAYERS.map((layer) => {
          const active = genericValues[layer.storeKey]
          return (
            <label
              key={layer.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-xs transition-colors duration-150 hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => genericToggles[layer.storeKey]()}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[1px]"
                style={{ backgroundColor: layer.color, opacity: active ? 0.8 : 0.2 }}
              />
              <span className={active ? 'text-foreground' : 'text-muted-foreground'}>
                {layer.label}
              </span>
            </label>
          )
        })}
      </div>

      {/* ── DevControls-Specific Layers ── */}
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

      <hr className="my-2 border-border" />

      <div className="flex gap-2">
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
    </div>
  )
}
