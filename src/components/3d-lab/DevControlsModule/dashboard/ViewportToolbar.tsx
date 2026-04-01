'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { Grid3x3, Ruler, Eye, Layers, Camera, Maximize2 } from 'lucide-react'
import { LayersOverlay } from './LayersOverlay'

// ─── Viewport Toolbar ──────────────────────────────────────────────────────
// Floating toolbar positioned top-left of the 3D viewport.
// Glass-morphism background, icon-only buttons with tooltips.

export function ViewportToolbar() {
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)
  const visibleLayers = useDevControlsStore((s) => s.visibleLayers)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)

  const [layersOpen, setLayersOpen] = useState(false)
  const [xrayActive, setXrayActive] = useState(false)

  // Listen for keyboard shortcut event from useKeyboardShortcuts
  const handleToggleLayers = useCallback(() => setLayersOpen((v) => !v), [])
  useEffect(() => {
    window.addEventListener('slatecamp:toggle-layers', handleToggleLayers)
    return () => window.removeEventListener('slatecamp:toggle-layers', handleToggleLayers)
  }, [handleToggleLayers])

  const gridActive = visibleLayers.has('rrow')

  const handleGridToggle = () => toggleLayer('rrow')
  const handleDimsToggle = () => setShowDimensions(!showDimensions)
  const handleXrayToggle = () => {
    // X-ray mode: toggle opacity of building layers for see-through
    setXrayActive(!xrayActive)
    // This toggles the 'ambf' layer as a proxy for x-ray mode
    // Future: implement actual material opacity in canvas
  }
  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'slatecamp-3dlab-screenshot.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  const handleFullscreen = () => {
    const el = document.querySelector('[data-viewport-wrapper]')
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  return (
    <div className="absolute left-4 top-4 z-10">
      {/* Toolbar buttons */}
      <div className="flex items-center gap-0.5 rounded-lg bg-black/60 p-1 backdrop-blur-sm">
        <ToolbarButton
          icon={<Grid3x3 size={14} />}
          label="Grid"
          shortcut="G"
          active={gridActive}
          onClick={handleGridToggle}
        />
        <ToolbarButton
          icon={<Ruler size={14} />}
          label="Dimensions"
          shortcut="D"
          active={showDimensions}
          onClick={handleDimsToggle}
        />
        <ToolbarButton
          icon={<Eye size={14} />}
          label="X-ray"
          shortcut="X"
          active={xrayActive}
          onClick={handleXrayToggle}
        />
        <ToolbarButton
          icon={<Layers size={14} />}
          label="Layers"
          shortcut="L"
          active={layersOpen}
          onClick={() => setLayersOpen(!layersOpen)}
        />

        <div className="mx-0.5 h-5 w-px bg-white/15" />

        <ToolbarButton
          icon={<Camera size={14} />}
          label="Screenshot"
          shortcut="P"
          active={false}
          onClick={handleScreenshot}
        />
        <ToolbarButton
          icon={<Maximize2 size={14} />}
          label="Fullscreen"
          shortcut="F"
          active={!!document.fullscreenElement}
          onClick={handleFullscreen}
        />
      </div>

      {/* Layers overlay — positioned below toolbar */}
      {layersOpen && <LayersOverlay onClose={() => setLayersOpen(false)} />}
    </div>
  )
}

// ─── Toolbar Button ────────────────────────────────────────────────────────

function ToolbarButton({
  icon,
  label,
  shortcut,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  shortcut: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${label} (${shortcut})`}
      title={`${label} (${shortcut})`}
      className={`flex size-8 items-center justify-center rounded-md transition-colors duration-150 ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
    </button>
  )
}
