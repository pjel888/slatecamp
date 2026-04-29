'use client'

import { useState, useCallback, useRef, type ChangeEvent } from 'react'
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

const GROUPS = ['navigation', 'views', 'projection', 'zoom', 'standalone'] as const

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
  const zoomByDelta = useViewportShellStore((s) => s.zoomByDelta)
  const navMode = useViewportShellStore((s) => s.navMode)
  const activeInteraction = useViewportShellStore((s) => s.activeInteraction)
  const setNavMode = useViewportShellStore((s) => s.setNavMode)
  const selectedCameraPreset = useViewportShellStore((s) => s.selectedCameraPreset)
  const projectionMode = useViewportShellStore((s) => s.projectionMode)
  const manualOrbit = useViewportShellStore((s) => s.manualOrbit)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [zoomSlider, setZoomSlider] = useState(0)
  const zoomSliderRef = useRef(0)

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

  const handleZoomSliderChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    const delta = nextValue - zoomSliderRef.current
    zoomSliderRef.current = nextValue
    setZoomSlider(nextValue)
    zoomByDelta(delta)
  }, [zoomByDelta])

  const resetZoomSlider = useCallback(() => {
    zoomSliderRef.current = 0
    setZoomSlider(0)
  }, [])

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
        className="flex flex-col items-center justify-center gap-0.5 rounded-md px-1.5 py-1 min-w-[36px] transition-colors duration-150 ease-out"
        style={{
          backgroundColor: active ? 'var(--viewport-overlay-active)' : 'transparent',
          color: active ? 'white' : 'var(--viewport-overlay-text)',
        }}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[8px] font-mono leading-none">{btn.label}</span>
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
        <label className="flex h-9 w-24 items-center px-1" title="Drag right to zoom in, left to zoom out">
          <span className="sr-only">Camera zoom slider</span>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={zoomSlider}
            onChange={handleZoomSliderChange}
            onPointerUp={resetZoomSlider}
            onKeyUp={resetZoomSlider}
            onBlur={resetZoomSlider}
            aria-label="Camera zoom slider"
            data-testid="3dlab-control-zoom-slider"
            className="h-2 w-full cursor-ew-resize rounded-full"
            style={{ accentColor: 'var(--viewport-overlay-active)' }}
          />
        </label>
        {zoomIn && renderButton(zoomIn)}
        {zoomFit && renderButton(zoomFit)}
      </>
    )
  }

  return (
    <div
      className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 flex items-center gap-0.5 rounded-lg px-1 py-1 pointer-events-auto cursor-default"
      style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
    >
      {GROUPS.map((group, gi) => {
        const groupButtons = BUTTONS.filter((b) => b.group === group)
        if (groupButtons.length === 0) return null

        return (
          <span key={group} className="contents">
            {gi > 0 && (
              <div className="mx-1 h-8 w-px self-center" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
            )}
            {group === 'zoom' ? renderZoomGroup(groupButtons) : groupButtons.map(renderButton)}
          </span>
        )
      })}
    </div>
  )
}
