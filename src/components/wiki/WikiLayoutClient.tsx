'use client'

import * as React from 'react'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'

const STORAGE_KEY = 'wiki_sidebar_collapsed'

interface WikiLayoutClientProps {
  disciplineId: string | null
  disciplineName: string
  children: React.ReactNode
}

export function WikiLayoutClient({
  disciplineId,
  disciplineName,
  children,
}: WikiLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw !== null) setIsCollapsed(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [mounted])

  React.useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed))
    } catch {
      // ignore
    }
  }, [mounted, isCollapsed])

  const toggle = () => setIsCollapsed((p) => !p)

  return (
    <div className='flex h-full w-full border border-zinc-200 overflow-hidden'>
      <div
        className={[
          'shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out',
          isCollapsed ? 'w-0 min-w-0' : 'w-64',
        ].join(' ')}
      >
        <WikiSidebar
          disciplineId={disciplineId!}
          disciplineName={disciplineName}
          collapsed={isCollapsed}
        />
      </div>
      <button
        type='button'
        onClick={toggle}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className='shrink-0 border-r border-zinc-200 bg-zinc-50/50 p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors'
      >
        {isCollapsed ? (
          <PanelLeft className='h-4 w-4' />
        ) : (
          <PanelLeftClose className='h-4 w-4' />
        )}
      </button>
      <div className='flex-1 min-w-0 h-full'>{children}</div>
    </div>
  )
}
