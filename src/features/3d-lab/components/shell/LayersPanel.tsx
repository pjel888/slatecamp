'use client'

// LayersPanel — floating layer toggle overlay for the shared SceneToolbar
// Opens when Layers (L) button is clicked. Closes on L again or click-away.
//
// ARCHITECTURE: Generic layers (Grid/Dims/X-ray) are ALWAYS shown.
// Module-specific layers are injected via the `children` prop.
// Each module provides its own layer toggles as children — this keeps the
// LayersPanel in a CONSISTENT position while content differs per module.

import { useEffect, useRef, type ReactNode } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

// Generic layer options — shown in ALL modules
const GENERIC_LAYERS = [
  { id: 'grid', label: 'Ground Grid', color: '#94a3b8', storeKey: 'gridVisible' as const },
  { id: 'dimensions', label: 'Dimensions', color: '#3b82f6', storeKey: 'dimensionsVisible' as const },
  { id: 'xray', label: 'X-ray Mode', color: '#8b5cf6', storeKey: 'xrayMode' as const },
]

interface LayersPanelProps {
  /** Module-specific layer toggles — rendered BELOW generic layers */
  children?: ReactNode
}

export const LayersPanel = ({ children }: LayersPanelProps) => {
  const isOpen = useViewportShellStore((s) => s.layersPanelOpen)
  const toggleLayersPanel = useViewportShellStore((s) => s.toggleLayersPanel)
  const gridVisible = useViewportShellStore((s) => s.gridVisible)
  const dimensionsVisible = useViewportShellStore((s) => s.dimensionsVisible)
  const xrayMode = useViewportShellStore((s) => s.xrayMode)
  const toggleGrid = useViewportShellStore((s) => s.toggleGrid)
  const toggleDimensions = useViewportShellStore((s) => s.toggleDimensions)
  const toggleXray = useViewportShellStore((s) => s.toggleXray)
  const ref = useRef<HTMLDivElement>(null)

  const storeValues: Record<string, boolean> = { gridVisible, dimensionsVisible, xrayMode }
  const toggleActions: Record<string, () => void> = {
    gridVisible: toggleGrid,
    dimensionsVisible: toggleDimensions,
    xrayMode: toggleXray,
  }

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (target.closest('[aria-label*="Layers"]')) return
        toggleLayersPanel()
      }
    }
    const timer = setTimeout(() => document.addEventListener('click', handler), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handler)
    }
  }, [isOpen, toggleLayersPanel])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className="absolute top-16 left-4 z-30 w-60 rounded-md border border-border bg-card p-3 shadow-lg pointer-events-auto"
    >
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
        Layers
      </h3>

      {/* ── Generic layers — always present in every module ── */}
      <div className="mb-1 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
        Viewport
      </div>
      <div className="space-y-0.5">
        {GENERIC_LAYERS.map((layer) => {
          const isOn = storeValues[layer.storeKey]
          return (
            <label
              key={layer.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1 text-xs transition-colors duration-150 hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={isOn}
                onChange={() => toggleActions[layer.storeKey]()}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-[1px]"
                style={{ backgroundColor: layer.color, opacity: isOn ? 0.8 : 0.2 }}
              />
              <span className={isOn ? 'text-foreground' : 'text-muted-foreground'}>
                {layer.label}
              </span>
            </label>
          )
        })}
      </div>

      {/* ── Module-specific layers — injected by each module ── */}
      {children && (
        <>
          <hr className="my-2 border-border" />
          {children}
        </>
      )}
    </div>
  )
}
