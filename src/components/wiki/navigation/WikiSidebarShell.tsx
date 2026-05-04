'use client'

import * as React from 'react'
import { SidebarSimple } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

const WIDTH_KEY = 'wiki_sidebar_width'
const MIN_W = 180
const MAX_W = 480
const DEFAULT_W = 256

/**
 * Wraps the left sidebar with resize drag-handle and collapse toggle.
 * Persists width to localStorage. Collapse state is session-only
 * (always starts expanded on page load).
 */
export function WikiSidebarShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [width, setWidth] = React.useState(DEFAULT_W)
  const dragging = React.useRef(false)
  const startX = React.useRef(0)
  const startW = React.useRef(DEFAULT_W)

  React.useEffect(() => {
    try {
      const savedWidth = localStorage.getItem(WIDTH_KEY)
      if (savedWidth) setWidth(Math.min(MAX_W, Math.max(MIN_W, parseInt(savedWidth))))
    } catch {}
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    if (isCollapsed) return
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      const delta = ev.clientX - startX.current
      const next = Math.min(MAX_W, Math.max(MIN_W, startW.current + delta))
      setWidth(next)
    }

    const onUp = (ev: MouseEvent) => {
      dragging.current = false
      const delta = ev.clientX - startX.current
      const final = Math.min(MAX_W, Math.max(MIN_W, startW.current + delta))
      try { localStorage.setItem(WIDTH_KEY, String(final)) } catch {}
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="hidden md:flex print:!hidden h-full shrink-0">
      {/* Sidebar content */}
      <div
        className="h-full overflow-hidden transition-[width] duration-200 ease-in-out"
        style={{ width: isCollapsed ? 0 : width }}
      >
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        title="Drag to resize"
        className={[
          'relative shrink-0 h-full w-3 group',
          isCollapsed ? 'cursor-default' : 'cursor-col-resize',
        ].join(' ')}
      >
        {/* Visual line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:w-[3px] group-hover:bg-camp-cobalt transition-all duration-150" />
        {/* Grip dots */}
        {!isCollapsed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 gap-[3px] pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-border group-hover:bg-camp-cobalt transition-colors duration-150" />
            ))}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setIsCollapsed(p => !p)}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="shrink-0 border-r border-border bg-surface-muted/50 px-1.5 text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors z-10 cursor-pointer"
      >
        <SCIcon icon={SidebarSimple} size="sm" />
      </button>
    </div>
  )
}
