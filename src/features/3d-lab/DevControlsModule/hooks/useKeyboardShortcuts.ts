'use client'

import { useEffect, useCallback } from 'react'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import type { CameraPreset } from '@/lib/pd1096/types'

const ISO_CYCLE: CameraPreset[] = ['iso-ne', 'iso-nw', 'iso-se', 'iso-sw']

// ─── Keyboard Shortcuts Hook ───────────────────────────────────────────────
// Registers all 3D Lab keyboard shortcuts.
// Only active when no text input/textarea is focused.

interface KeyboardShortcutActions {
  toggleLeft: () => void
  toggleRight: () => void
  toggleBoth: () => void
  toggleLayers: () => void
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions) {
  const cameraPreset = useDevControlsStore((s) => s.cameraPreset)
  const setCameraPreset = useDevControlsStore((s) => s.setCameraPreset)
  const toggleLayer = useDevControlsStore((s) => s.toggleLayer)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)
  const toggleXray = useViewportShellStore((s) => s.toggleXray)

  const cycleIso = useCallback(() => {
    const idx = ISO_CYCLE.indexOf(cameraPreset)
    const next = idx >= 0 ? ISO_CYCLE[(idx + 1) % ISO_CYCLE.length] : ISO_CYCLE[0]
    setCameraPreset(next)
  }, [cameraPreset, setCameraPreset])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Ctrl+M → Toggle all panels (Minimize UI)
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault()
        actions.toggleBoth()
        return
      }

      // Skip modified keys for single-character shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return

      switch (e.key) {
        case '[':
          e.preventDefault()
          actions.toggleLeft()
          break
        case ']':
          e.preventDefault()
          actions.toggleRight()
          break
        case '1':
          e.preventDefault()
          setCameraPreset('perspective')
          break
        case '2':
          e.preventDefault()
          setCameraPreset('top')
          break
        case '3':
          e.preventDefault()
          setCameraPreset('front')
          break
        case '4':
          e.preventDefault()
          cycleIso()
          break
        case 'd':
        case 'D':
          e.preventDefault()
          setShowDimensions(!showDimensions)
          break
        case 'g':
        case 'G':
          e.preventDefault()
          toggleLayer('rrow')
          break
        case 'x':
        case 'X':
          e.preventDefault()
          toggleXray()
          break
        case 'l':
        case 'L':
          e.preventDefault()
          actions.toggleLayers()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          handleFullscreen()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          handleScreenshot()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [actions, setCameraPreset, toggleLayer, showDimensions, setShowDimensions, toggleXray])
}

function handleFullscreen() {
  const el = document.querySelector('[data-viewport-wrapper]')
  if (!el) return
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    el.requestFullscreen()
  }
}

function handleScreenshot() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return
  const link = document.createElement('a')
  link.download = 'slatecamp-3dlab-screenshot.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
