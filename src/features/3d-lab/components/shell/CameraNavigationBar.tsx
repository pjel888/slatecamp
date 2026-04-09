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
import { useDevControlsStore } from '@/features/3d-lab/DevControlsModule/stores/useDevControlsStore'

type NavMode = 'orbit' | 'pan' | 'look'

interface NavButtonDef {
  id: string
  icon: typeof Rotate3d
  label: string
  group: 'navigation' | 'views' | 'projection' | 'zoom' | 'standalone'
  type: 'mode' | 'snap' | 'toggle' | 'action'
  preset?: string
  mode?: NavMode
}

const BUTTONS: NavButtonDef[] = [
  // Group 1: Navigation modes (one active at a time)
  { id: 'orbit', icon: Rotate3d, label: 'Orbit', group: 'navigation', type: 'mode', mode: 'orbit' },
  { id: 'pan', icon: Hand, label: 'Pan', group: 'navigation', type: 'mode', mode: 'pan' },
  // Group 2: Standard views (one-shot snaps)
  { id: 'top', icon: ArrowUp, label: 'Top', group: 'views', type: 'snap', preset: 'top' },
  { id: 'front', icon: ArrowDown, label: 'Front', group: 'views', type: 'snap', preset: 'front' },
  { id: 'left', icon: ArrowLeft, label: 'Left', group: 'views', type: 'snap', preset: 'left' },
  { id: 'right', icon: ArrowRight, label: 'Right', group: 'views', type: 'snap', preset: 'right' },
  { id: 'rear', icon: Undo2, label: 'Rear', group: 'views', type: 'snap', preset: 'rear' },
  // Group 3: Isometric views (4 corners)
  { id: 'iso-ne', icon: Box, label: 'NE', group: 'projection', type: 'snap', preset: 'iso-ne' },
  { id: 'iso-nw', icon: Box, label: 'NW', group: 'projection', type: 'snap', preset: 'iso-nw' },
  { id: 'iso-se', icon: Box, label: 'SE', group: 'projection', type: 'snap', preset: 'iso-se' },
  { id: 'iso-sw', icon: Box, label: 'SW', group: 'projection', type: 'snap', preset: 'iso-sw' },
  { id: 'persp', icon: Video, label: 'Persp', group: 'projection', type: 'toggle', preset: 'perspective' },
  { id: 'iso', icon: Grid3x3, label: 'Iso', group: 'projection', type: 'toggle' },
  // Group 4: Zoom
  { id: 'zoom-in', icon: ZoomIn, label: 'In', group: 'zoom', type: 'action', preset: 'zoom-in' },
  { id: 'zoom-out', icon: ZoomOut, label: 'Out', group: 'zoom', type: 'action', preset: 'zoom-out' },
  { id: 'zoom-fit', icon: Focus, label: 'Fit', group: 'zoom', type: 'snap', preset: 'zoom-to-fit' },
  // Standalone
  { id: 'reset', icon: RotateCcw, label: 'Reset', group: 'standalone', type: 'action', preset: 'reset' },
]

const GROUPS = ['navigation', 'views', 'projection', 'zoom', 'standalone'] as const

export const CameraNavigationBar = () => {
  const snapToPreset = useViewportShellStore((s) => s.snapToPreset)
  const navMode = useViewportShellStore((s) => s.navMode)
  const activeInteraction = useViewportShellStore((s) => s.activeInteraction)
  const setNavMode = useViewportShellStore((s) => s.setNavMode)
  const setViewMode = useViewportShellStore((s) => s.setViewMode)
  const activeCameraView = useDevControlsStore((s) => s.cameraPreset)
  const projectionMode = useViewportShellStore((s) => s.projectionMode)
  const setProjectionMode = useViewportShellStore((s) => s.setProjectionMode)
  const manualOrbit = useViewportShellStore((s) => s.manualOrbit)
  const [flashId, setFlashId] = useState<string | null>(null)

  const handleClick = useCallback((btn: NavButtonDef) => {
    // Navigation mode buttons
    if (btn.type === 'mode' && btn.mode) {
      setNavMode(btn.mode)
      return
    }

    // Projection toggle (Persp / Iso)
    if (btn.type === 'toggle') {
      if (btn.id === 'persp') {
        setProjectionMode('perspective')
        setViewMode('perspective')
      } else if (btn.id === 'iso') {
        setProjectionMode('orthographic')
      }
      return
    }

    // Projection / iso snaps
    if (btn.group === 'projection' && btn.preset) {
      snapToPreset(btn.preset as Parameters<typeof snapToPreset>[0])
      setFlashId(btn.id)
      setTimeout(() => setFlashId(null), 200)
      return
    }

    // Zoom actions
    if (btn.id === 'zoom-in') {
      snapToPreset('zoom-in')
      setFlashId(btn.id)
      setTimeout(() => setFlashId(null), 200)
      return
    }
    if (btn.id === 'zoom-out') {
      snapToPreset('zoom-out')
      setFlashId(btn.id)
      setTimeout(() => setFlashId(null), 200)
      return
    }

    // Camera snaps + reset
    if (btn.preset) {
      snapToPreset(btn.preset as Parameters<typeof snapToPreset>[0])
    }
    setFlashId(btn.id)
    setTimeout(() => setFlashId(null), 200)
  }, [snapToPreset, setNavMode, setViewMode, setProjectionMode])

  // Map DevControls cameraPreset to button IDs
  const PRESET_TO_BUTTON: Record<string, string> = {
    'perspective': 'persp', 'orbit': 'persp',
    'top': 'top', 'front': 'front',
    'iso-ne': 'iso-ne', 'iso-nw': 'iso-nw', 'iso-se': 'iso-se', 'iso-sw': 'iso-sw',
  }

  const isActive = (btn: NavButtonDef): boolean => {
    if (btn.type === 'mode') {
      if (activeInteraction === 'orbiting' && btn.mode === 'orbit') return true
      if (activeInteraction === 'panning' && btn.mode === 'pan') return true
      if (activeInteraction === 'idle') return navMode === btn.mode
      return false
    }
    // Projection toggles: active based on current projection mode
    if (btn.type === 'toggle') {
      if (btn.id === 'persp') return projectionMode === 'perspective'
      if (btn.id === 'iso') return projectionMode === 'orthographic'
    }
    // Snap buttons: active if they match the current view AND user hasn't orbited away
    if (btn.type === 'snap' && btn.preset) {
      if (manualOrbit) return false
      return PRESET_TO_BUTTON[activeCameraView] === btn.id
    }
    return flashId === btn.id
  }

  return (
    <div
      className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 flex items-center gap-0.5 rounded-lg px-1 py-1 pointer-events-auto cursor-default"
      style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
    >
      {GROUPS.map((group, gi) => {
        const groupButtons = BUTTONS.filter((b) => b.group === group)
        if (groupButtons.length === 0) return null

        return (
          <span key={group} className="contents">
            {/* Divider between groups (not before first) */}
            {gi > 0 && (
              <div className="mx-1 h-8 w-px self-center" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
            )}
            {groupButtons.map((btn) => {
              const active = isActive(btn)
              const Icon = btn.icon
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleClick(btn)}
                  aria-label={btn.label}
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
            })}
          </span>
        )
      })}
    </div>
  )
}
