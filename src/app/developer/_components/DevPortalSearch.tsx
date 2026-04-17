'use client'

import { useMemo } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { CommandPalette } from '@/components/portal'
import { ROUTES } from '@/lib/routes'

const STATIC_PAGES: { title: string; href: string; group: string; keywords: string }[] = [
  { title: 'Overview', href: ROUTES.developer.root, group: 'Portal', keywords: 'home portal dashboard' },
  { title: 'API Reference', href: ROUTES.developer.apiReference, group: 'Portal', keywords: 'endpoints routes actions webhooks' },
  { title: 'Architecture', href: ROUTES.developer.architecture, group: 'Portal', keywords: 'schema database auth deployment' },
  { title: 'Status Overview', href: ROUTES.developer.status, group: 'Status', keywords: 'health uptime services operational' },
  { title: 'Database Status', href: ROUTES.developer.statusDatabase, group: 'Status', keywords: 'postgres connections migrations rls' },
  { title: 'Infrastructure Status', href: ROUTES.developer.statusInfrastructure, group: 'Status', keywords: 'latency edge deployment api' },
  { title: 'Dev Tools', href: ROUTES.developer.tools, group: 'Tools', keywords: 'console database logs test utilities' },
  { title: 'Console', href: ROUTES.developer.console, group: 'Tools', keywords: 'flags impersonation system' },
  { title: 'Database Browser', href: ROUTES.developer.db, group: 'Tools', keywords: 'tables rls rows browse' },
  { title: 'Audit Logs', href: ROUTES.developer.logs, group: 'Tools', keywords: 'events actions history' },
  { title: 'Test Data', href: ROUTES.developer.testData, group: 'Tools', keywords: 'mock generator sessions seed' },
]

export const DevPortalSearch = () => {
  const pages = useMemo(() => STATIC_PAGES, [])

  return (
    <div className="relative ml-auto flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const isMac = navigator.platform.toUpperCase().includes('MAC')
          document.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'k',
              metaKey: isMac,
              ctrlKey: !isMac,
              bubbles: true,
            }),
          )
        }}
        className="flex w-[200px] cursor-pointer items-center gap-1.5 rounded-xs border border-white/10 bg-white/[0.06] px-2.5 py-1 transition-colors duration-150 hover:bg-white/[0.10]"
      >
        <MagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-white/30" />
        <span className="flex-1 text-left text-xs text-white/25">Search docs and tools...</span>
        <kbd className="rounded border border-white/10 px-1 py-px font-[family-name:var(--font-dm-mono)] text-[11px] text-white/25">
          ⌘K
        </kbd>
      </button>

      <CommandPalette pages={pages} />
    </div>
  )
}
