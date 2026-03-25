'use client'

import { useMemo } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { CommandPalette } from '@/components/portal'
import { getAllComponents, DOMAIN_LABELS } from '@/lib/developer/componentRegistry'

/* ------------------------------------------------------------------ */
/*  Static pages (Status, Tools, Portal)                               */
/* ------------------------------------------------------------------ */

const STATIC_PAGES: { title: string; href: string; group: string; keywords: string }[] = [
  { title: 'Overview', href: '/developer', group: 'Portal', keywords: 'home portal dashboard' },
  { title: 'Design System', href: '/developer/design-system', group: 'Portal', keywords: 'colors typography tokens campfire' },
  { title: 'API Reference', href: '/developer/api-reference', group: 'Portal', keywords: 'endpoints routes actions webhooks' },
  { title: 'Architecture', href: '/developer/architecture', group: 'Portal', keywords: 'schema database auth deployment' },
  { title: 'Component Library', href: '/developer/components', group: 'Portal', keywords: 'ui primitives mdx widgets' },
  { title: 'Status Overview', href: '/developer/status', group: 'Status', keywords: 'health uptime services operational' },
  { title: 'Database Status', href: '/developer/status/database', group: 'Status', keywords: 'postgres connections migrations rls' },
  { title: 'Infrastructure Status', href: '/developer/status/infrastructure', group: 'Status', keywords: 'latency edge deployment api' },
  { title: 'Dev Tools', href: '/developer/tools', group: 'Tools', keywords: 'console database logs test utilities' },
  { title: 'Console', href: '/developer/tools/console', group: 'Tools', keywords: 'flags impersonation system' },
  { title: 'Database Browser', href: '/developer/tools/db', group: 'Tools', keywords: 'tables rls rows browse' },
  { title: 'Audit Logs', href: '/developer/tools/logs', group: 'Tools', keywords: 'events actions history' },
  { title: 'Test Data', href: '/developer/tools/test-data', group: 'Tools', keywords: 'mock generator sessions seed' },
  { title: 'Content Blocks', href: '/developer/design-system/content-blocks', group: 'Portal', keywords: 'pedagogical mdx blocks wiki articles' },
  { title: 'Interactive Widgets', href: '/developer/design-system/widgets', group: 'Portal', keywords: 'per-law interactive visualizers' },
]

/* ------------------------------------------------------------------ */
/*  Build pages array from component registry + statics                */
/* ------------------------------------------------------------------ */

const buildSearchPages = () => {
  const components = getAllComponents()

  const componentPages = components.map((c) => ({
    title: c.title,
    href: `/developer/design-system/${c.domain}/${c.slug}`,
    group: DOMAIN_LABELS[c.domain] ?? c.domain,
    keywords: [
      c.description,
      c.importPath,
      c.status,
      ...(c.tags ?? []),
    ].join(' '),
  }))

  return [...componentPages, ...STATIC_PAGES]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const DevPortalSearch = () => {
  const pages = useMemo(() => buildSearchPages(), [])

  return (
    <div className="relative ml-auto flex items-center gap-2">
      {/* Topbar search trigger — visual hint for Cmd+K */}
      <button
        type="button"
        onClick={() => {
          /* Dispatch synthetic Ctrl+K / Cmd+K to open the CommandPalette dialog.
             CommandPalette listens for both metaKey and ctrlKey. */
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
        className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-xs px-2.5 py-1 w-[200px] cursor-pointer hover:bg-white/[0.10] transition-colors duration-150"
      >
        <MagnifyingGlass className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <span className="text-white/25 text-xs flex-1 text-left">Search components...</span>
        <kbd className="font-[family-name:var(--font-dm-mono)] text-[11px] text-white/25 border border-white/10 px-1 py-px rounded">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette — handles its own Cmd+K / Ctrl+K shortcut */}
      <CommandPalette pages={pages} />
    </div>
  )
}
