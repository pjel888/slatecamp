'use client'

import * as React from 'react'
import { SidebarSimple } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'

const COLLAPSE_KEY = 'wiki_sidebar_collapsed'
const WIDTH_KEY = 'wiki_sidebar_width'
const MIN_W = 180
const MAX_W = 480
const DEFAULT_W = 256

interface WikiLayoutClientProps {
  disciplineId: string | null
  disciplineName: string
  children: React.ReactNode
}

export function WikiLayoutClient({ disciplineId, disciplineName, children }: WikiLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [width, setWidth] = React.useState(DEFAULT_W)
  const [mounted, setMounted] = React.useState(false)
  const dragging = React.useRef(false)
  const startX = React.useRef(0)
  const startW = React.useRef(DEFAULT_W)

  React.useEffect(() => {
    setMounted(true)
    try {
      const savedCollapsed = localStorage.getItem(COLLAPSE_KEY)
      if (savedCollapsed) setIsCollapsed(JSON.parse(savedCollapsed))
      const savedWidth = localStorage.getItem(WIDTH_KEY)
      if (savedWidth) setWidth(Math.min(MAX_W, Math.max(MIN_W, parseInt(savedWidth))))
    } catch {}
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(isCollapsed)) } catch {}
  }, [mounted, isCollapsed])

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

  if (!mounted) return null

  return (
    <div className='flex h-full w-full overflow-hidden border border-zinc-200 bg-background'>
      {/* Sidebar */}
      <div
        className='shrink-0 h-full overflow-hidden transition-[width] duration-200 ease-in-out'
        style={{ width: isCollapsed ? 0 : width }}
      >
        <WikiSidebar
          disciplineId={disciplineId!}
          disciplineName={disciplineName}
          collapsed={isCollapsed}
        />
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
        <div className='absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-zinc-200 group-hover:w-[3px] group-hover:bg-[#5B8BB8] transition-all duration-150' />
        {/* Grip dots — 2×3 grid centered on the handle */}
        {!isCollapsed && (
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-2 gap-[3px] pointer-events-none'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='w-[3px] h-[3px] rounded-full bg-zinc-300 group-hover:bg-[#5B8BB8] transition-colors duration-150' />
            ))}
          </div>
        )}
      </div>

      {/* Collapse toggle button */}
      <button
        type='button'
        onClick={() => setIsCollapsed(p => !p)}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className='shrink-0 border-r border-zinc-200 bg-zinc-50/50 px-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors z-10'
      >
        {isCollapsed ? <SCIcon icon={SidebarSimple} size="sm" /> : <SCIcon icon={SidebarSimple} size="sm" />}
      </button>

      {/* Article content */}
      <div className='flex-1 min-w-0 h-full overflow-y-auto'>
        {children}
      </div>
    </div>
  )
}
