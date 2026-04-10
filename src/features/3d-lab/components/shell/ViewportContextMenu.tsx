'use client'

// ViewportContextMenu — right-click context menu for 3D viewport
// Right-click on element: element-specific actions
// Right-click on empty space: navigation shortcuts
// Style: solid card (not glass) for readability

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

interface MenuAction {
  id: string
  label: string
  shortcut?: string
  icon?: ReactNode
  onClick: () => void
  destructive?: boolean
  dividerBefore?: boolean
}

const EMPTY_SPACE_ACTIONS: MenuAction[] = [
  { id: 'reset-camera', label: 'Reset Camera', shortcut: 'R', onClick: () => useViewportShellStore.getState().snapToPreset('reset', 'context-menu') },
  { id: 'zoom-to-fit', label: 'Zoom to Fit', shortcut: 'Z', onClick: () => useViewportShellStore.getState().snapToPreset('zoom-to-fit', 'context-menu') },
  { id: 'toggle-grid', label: 'Toggle Grid', shortcut: 'G', onClick: () => useViewportShellStore.getState().toggleGrid(), dividerBefore: true },
  { id: 'screenshot', label: 'Screenshot', shortcut: 'P', onClick: () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      try {
        const link = document.createElement('a')
        link.download = `slatecamp-screenshot-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch { /* handled by SceneToolbar */ }
    }
  }},
]

export const ViewportContextMenu = () => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleContextMenu = useCallback((e: MouseEvent) => {
    // Only handle right-clicks on the viewport area
    const target = e.target as HTMLElement
    if (!target.closest('[data-viewport-shell]') || target.closest('button') || target.closest('[role="menu"]')) {
      return
    }

    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setVisible(true)
  }, [])

  const handleDismiss = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleDismiss)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleDismiss)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleContextMenu, handleDismiss])

  if (!visible) return null

  return (
    <div
      className="fixed z-50 min-w-[180px] rounded-md border border-border bg-card py-1 shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      {EMPTY_SPACE_ACTIONS.map((action) => (
        <span key={action.id} className="contents">
          {action.dividerBefore && <div className="my-1 h-px bg-border" />}
          <button
            type="button"
            onClick={() => {
              action.onClick()
              handleDismiss()
            }}
            className={`flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors duration-100 ${
              action.destructive
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>{action.label}</span>
            {action.shortcut && (
              <span className="ml-4 text-[10px] text-muted-foreground font-mono">{action.shortcut}</span>
            )}
          </button>
        </span>
      ))}
    </div>
  )
}
