'use client'

import { useState, useCallback } from 'react'
import {
  Rotate3d, Hand,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Undo2,
  Box, Video, Grid3x3,
  ZoomIn, ZoomOut, Focus,
  RotateCcw,
} from 'lucide-react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import {
  type CameraCommandPreset,
  type CameraSelectionPreset,
} from '@/features/3d-lab/utils/camera-presets'

type NavMode = 'orbit' | 'pan' | 'look'

interface NavButtonDef {
  id: string
  icon: typeof Rotate3d
  label: string
  group: 'navigation' | 'views' | 'projection' | 'zoom' | 'standalone'
  type: 'mode' | 'snap' | 'action'
  preset?: CameraCommandPreset
  mode?: NavMode
}

const BUTTONS: NavButtonDef[] = [
  { id: 'orbit', icon: Rotate3d, label: 'Orbit', group: 'navigation', type: 'mode', mode: 'orbit' },
  { id: 'pan', icon: Hand, label: 'Pan', group: 'navigation', type: 'mode', mode: 'pan' },
  { id: 'top', icon: ArrowUp, label: 'Top', group: 'views', type: 'snap', preset: 'top' },
  { id: 'front', icon: ArrowDown, label: 'Front', group: 'views', type: 'snap', preset: 'front' },
  { id: 'left', icon: ArrowLeft, label: 'Left', group: 'views', type: 'snap', preset: 'left' },
  { id: 'right', icon: ArrowRight, label: 'Right', group: 'views', type: 'snap', preset: 'right' },
  { id: 'rear', icon: Undo2, label: 'Rear', group: 'views', type: 'snap', preset: 'rear' },
  { id: 'iso-ne', icon: Box, label: 'NE', group: 'projection', type: 'snap', preset: 'iso-ne' },
  { id: 'iso-nw', icon: Box, label: 'NW', group: 'projection', type: 'snap', preset: 'iso-nw' },
  { id: 'iso-se', icon: Box, label: 'SE', group: 'projection', type: 'snap', preset: 'iso-se' },
  { id: 'iso-sw', icon: Box, label: 'SW', group: 'projection', type: 'snap', preset: 'iso-sw' },
  { id: 'persp', icon: Video, label: 'Persp', group: 'projection', type: 'snap', preset: 'perspective' },
  { id: 'iso', icon: Grid3x3, label: 'Iso', group: 'projection', type: 'snap', preset: 'iso' },
  { id: 'zoom-in', icon: ZoomIn, label: 'In', group: 'zoom', type: 'action', preset: 'zoom-in' },
  { id: 'zoom-out', icon: ZoomOut, label: 'Out', group: 'zoom', type: 'action', preset: 'zoom-out' },
  { id: 'zoom-fit', icon: Focus, label: 'Fit', group: 'zoom', type: 'action', preset: 'zoom-to-fit' },
  { id: 'reset', icon: RotateCcw, label: 'Reset', group: 'standalone', type: 'action', preset: 'reset' },
]

const BOTTOM_BAR_GROUPS = ['navigation', 'views', 'projection', 'standalone'] as const

const PRESET_TO_BUTTON: Partial<Record<CameraSelectionPreset, string>> = {
  perspective: 'persp',
  orbit: 'persp',
  top: 'top',
  front: 'front',
  left: 'left',
  right: 'right',
  rear: 'rear',
  'iso-ne': 'iso-ne',
  'iso-nw': 'iso-nw',
  'iso-se': 'iso-se',
  'iso-sw': 'iso-sw',
}

export const CameraNavigationBar = () => {
  const snapToPreset = useViewportShellStore((s) => s.snapToPreset)
  const navMode = useViewportShellStore((s) => s.navMode)
  const activeInteraction = useViewportShellStore((s) => s.activeInteraction)
  const setNavMode = useViewportShellStore((s) => s.setNavMode)
  const selectedCameraPreset = useViewportShellStore((s) => s.selectedCameraPreset)
  const projectionMode = useViewportShellStore((s) => s.projectionMode)
  const manualOrbit = useViewportShellStore((s) => s.manualOrbit)
  const [flashId, setFlashId] = useState<string | null>(null)

  const handleClick = useCallback((btn: NavButtonDef) => {
    if (btn.type === 'mode' && btn.mode) {
      setNavMode(btn.mode)
      return
    }

    if (btn.preset) {
      snapToPreset(btn.preset as Parameters<typeof snapToPreset>[0], 'toolbar')
      setFlashId(btn.id)
      setTimeout(() => setFlashId(null), 200)
    }
  }, [snapToPreset, setNavMode])

  const isActive = (btn: NavButtonDef): boolean => {
    if (btn.type === 'mode') {
      if (activeInteraction === 'orbiting' && btn.mode === 'orbit') return true
      if (activeInteraction === 'panning' && btn.mode === 'pan') return true
      if (activeInteraction === 'idle') return navMode === btn.mode
      return false
    }

    if (btn.type === 'snap' && btn.preset) {
      if (btn.id === 'persp') return projectionMode === 'perspective'
      if (btn.id === 'iso') return projectionMode === 'orthographic'
      if (manualOrbit) return false
      return PRESET_TO_BUTTON[selectedCameraPreset ?? 'perspective'] === btn.id
    }

    return flashId === btn.id
  }

  const renderButton = (btn: NavButtonDef) => {
    const active = isActive(btn)
    const Icon = btn.icon

    return (
      <button
        key={btn.id}
        type="button"
        onClick={() => handleClick(btn)}
        aria-label={btn.label}
        aria-pressed={active}
        data-testid={`3dlab-control-${btn.id}`}
        title={btn.label}
        className="flex h-7 min-w-7 flex-col items-center justify-center gap-0 rounded-md px-1 transition-colors duration-150 ease-out"
        style={{
          backgroundColor: active ? 'var(--viewport-overlay-active)' : 'transparent',
          color: active ? 'white' : 'var(--viewport-overlay-text)',
        }}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-7 truncate text-center font-medium uppercase leading-none" style={{ fontSize: 5 }}>
          {btn.label}
        </span>
      </button>
    )
  }

  const renderZoomGroup = (groupButtons: NavButtonDef[]) => {
    const zoomOut = groupButtons.find((btn) => btn.id === 'zoom-out')
    const zoomIn = groupButtons.find((btn) => btn.id === 'zoom-in')
    const zoomFit = groupButtons.find((btn) => btn.id === 'zoom-fit')

    return (
      <>
        {zoomOut && renderButton(zoomOut)}
        {zoomIn && renderButton(zoomIn)}
        {zoomFit && renderButton(zoomFit)}
      </>
    )
  }

  return (
    <>
      <div
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex items-center gap-0.5 rounded-lg px-1 py-0.5 pointer-events-auto cursor-default"
        style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
      >
        {BOTTOM_BAR_GROUPS.map((group, gi) => {
          const groupButtons = BUTTONS.filter((b) => b.group === group)
          if (groupButtons.length === 0) return null

          return (
            <span key={group} className="contents">
              {gi > 0 && (
                <div className="mx-0.5 h-7 w-px self-center" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
              )}
              {groupButtons.map(renderButton)}
            </span>
          )
        })}
      </div>
      <div
        className="absolute right-3 top-3 z-20 flex items-center gap-0.5 rounded-lg px-1 py-0.5 pointer-events-auto cursor-default"
        style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
        aria-label="Viewport zoom controls"
      >
        {renderZoomGroup(BUTTONS.filter((b) => b.group === 'zoom'))}
      </div>
    </>
  )
}
