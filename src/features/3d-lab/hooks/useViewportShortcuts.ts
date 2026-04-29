'use client'

// useViewportShortcuts — global keyboard shortcuts for 3D Lab viewport
// Mounted by ViewportShell. Active when viewport is focused or no input is focused.

import { useEffect } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { showViewportToast } from '@/features/3d-lab/components/shell/ViewportToast'

export const useViewportShortcuts = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture shortcuts when user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const store = useViewportShellStore.getState()

      switch (e.key.toLowerCase()) {
        // Scene toolbar shortcuts
        case 'g':
          e.preventDefault()
          store.toggleGrid()
          break
        case 'd':
          e.preventDefault()
          store.toggleDimensions()
          break
        case 'x':
          e.preventDefault()
          store.toggleXray()
          break
        case 'l':
          e.preventDefault()
          store.toggleLayersPanel()
          break
        case 'p':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            showViewportToast(
              'Screenshot is unavailable in the shared 3D viewport.',
              'info',
            )
          }
          break
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            const viewport = document.querySelector('[data-viewport-shell]')
            if (viewport) {
              try {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                } else {
                  viewport.requestFullscreen()
                }
              } catch { /* silent */ }
            }
          }
          break

        // Camera navigation shortcuts
        case 'o':
          e.preventDefault()
          store.setNavMode('orbit')
          break
        case 'h':
          e.preventDefault()
          store.setNavMode('pan')
          break
        case '1':
          e.preventDefault()
          store.snapToPreset('front', 'shortcut')
          break
        case '2':
          e.preventDefault()
          store.snapToPreset('top', 'shortcut')
          break
        case '3':
          e.preventDefault()
          store.snapToPreset('iso', 'shortcut')
          break
        case 'z':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            store.snapToPreset('zoom-to-fit', 'shortcut')
          }
          break
        case 'home':
          e.preventDefault()
          store.snapToPreset('zoom-to-fit', 'shortcut')
          break
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            store.snapToPreset('reset', 'shortcut')
          }
          break

        // Panel shortcuts
        case '[':
          e.preventDefault()
          store.toggleLeftSidebar()
          break
        case ']':
          e.preventDefault()
          store.toggleRightSidebar()
          break
      }

      // Ctrl+M — toggle both panels (minimize UI)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        store.toggleLeftSidebar()
        store.toggleRightSidebar()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
