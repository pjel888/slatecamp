'use client'

// SceneToolbar — floating scene control toolbar, ALWAYS visible in every 3D module
// Position: top-left of viewport. Glass morphism. 6 buttons.

import { useCallback } from 'react'
import { Grid3x3, Ruler, Eye, Layers, Camera, Maximize2 } from 'lucide-react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { showViewportToast } from './ViewportToast'

interface ToolbarButton {
  id: string
  icon: typeof Grid3x3
  label: string
  shortcut: string
  type: 'toggle' | 'action'
  storeKey?: 'gridVisible' | 'dimensionsVisible' | 'xrayMode' | 'layersPanelOpen'
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  { id: 'grid', icon: Grid3x3, label: 'Grid', shortcut: 'G', type: 'toggle', storeKey: 'gridVisible' },
  { id: 'dimensions', icon: Ruler, label: 'Dimensions', shortcut: 'D', type: 'toggle', storeKey: 'dimensionsVisible' },
  { id: 'xray', icon: Eye, label: 'X-ray', shortcut: 'X', type: 'toggle', storeKey: 'xrayMode' },
  { id: 'layers', icon: Layers, label: 'Layers', shortcut: 'L', type: 'toggle', storeKey: 'layersPanelOpen' },
  // Divider handled by index check
  { id: 'screenshot', icon: Camera, label: 'Screenshot', shortcut: 'P', type: 'action' },
  { id: 'fullscreen', icon: Maximize2, label: 'Fullscreen', shortcut: 'F', type: 'action' },
]

export const SceneToolbar = () => {
  const gridVisible = useViewportShellStore((s) => s.gridVisible)
  const dimensionsVisible = useViewportShellStore((s) => s.dimensionsVisible)
  const xrayMode = useViewportShellStore((s) => s.xrayMode)
  const layersPanelOpen = useViewportShellStore((s) => s.layersPanelOpen)
  const toggleGrid = useViewportShellStore((s) => s.toggleGrid)
  const toggleDimensions = useViewportShellStore((s) => s.toggleDimensions)
  const toggleXray = useViewportShellStore((s) => s.toggleXray)
  const toggleLayersPanel = useViewportShellStore((s) => s.toggleLayersPanel)

  const storeValues: Record<string, boolean> = {
    gridVisible,
    dimensionsVisible,
    xrayMode,
    layersPanelOpen,
  }

  const toggleActions: Record<string, () => void> = {
    gridVisible: toggleGrid,
    dimensionsVisible: toggleDimensions,
    xrayMode: toggleXray,
    layersPanelOpen: toggleLayersPanel,
  }

  const handleScreenshot = useCallback(() => {
    showViewportToast(
      'Screenshot is unavailable in the shared 3D viewport.',
      'info',
    )
  }, [])

  const handleFullscreen = useCallback(() => {
    const viewport = document.querySelector('[data-viewport-shell]')
    if (!viewport) return
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        viewport.requestFullscreen()
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Fullscreen failed — may be blocked by iframe policy')
      }
    }
  }, [])

  const handleClick = useCallback((btn: ToolbarButton) => {
    if (btn.type === 'toggle' && btn.storeKey) {
      toggleActions[btn.storeKey]?.()
    } else if (btn.id === 'screenshot') {
      handleScreenshot()
    } else if (btn.id === 'fullscreen') {
      handleFullscreen()
    }
  }, [toggleActions, handleScreenshot, handleFullscreen])

  return (
    <div
      className="absolute top-4 left-4 z-20 flex items-center gap-0.5 rounded-lg p-1 pointer-events-auto cursor-default"
      style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
    >
      {TOOLBAR_BUTTONS.map((btn, i) => {
        const isActive = btn.type === 'toggle' && btn.storeKey ? storeValues[btn.storeKey] : false
        const Icon = btn.icon

        return (
          <span key={btn.id} className="contents">
            {/* Divider before action buttons */}
            {i === 4 && (
              <div className="mx-0.5 h-5 w-px" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
            )}
            <button
              type="button"
              onClick={() => handleClick(btn)}
              aria-label={`${btn.label} (${btn.shortcut})`}
              title={`${btn.label} (${btn.shortcut})`}
              className={`
                flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 ease-out
                ${isActive
                  ? 'text-white'
                  : 'hover:text-white'
                }
              `}
              style={{
                backgroundColor: isActive ? 'var(--viewport-overlay-active)' : 'transparent',
                color: isActive ? 'white' : 'var(--viewport-overlay-text)',
              }}
            >
              <Icon className="h-4 w-4" />
            </button>
          </span>
        )
      })}
    </div>
  )
}
