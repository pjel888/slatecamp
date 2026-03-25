'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Fuse from 'fuse.js'
import { Clock } from '@phosphor-icons/react/dist/ssr'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { getAllComponents, DOMAIN_LABELS } from '@/lib/developer/componentRegistry'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandPaletteProps {
  pages: { title: string; href: string; group: string; keywords?: string }[]
}

interface RecentPage {
  title: string
  href: string
  group: string
  timestamp: number
}

interface SearchableItem {
  name: string
  description: string
  domain: string
  tags: string[]
  path: string
  type: 'component' | 'page'
  group: string
}

/* ------------------------------------------------------------------ */
/*  HighlightMatch                                                     */
/* ------------------------------------------------------------------ */

const HighlightMatch = ({ text, indices }: { text: string; indices?: readonly [number, number][] }) => {
  if (!indices?.length) return <>{text}</>
  let lastIndex = 0
  const parts: React.ReactNode[] = []
  for (const [start, end] of indices) {
    if (start > lastIndex) parts.push(text.slice(lastIndex, start))
    parts.push(<span key={start} className="font-semibold text-foreground">{text.slice(start, end + 1)}</span>)
    lastIndex = end + 1
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}

/* ------------------------------------------------------------------ */
/*  Hook: useRecentPages                                               */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'admin-recent-pages'
const MAX_RECENT = 5

const useRecentPages = (
  pages: CommandPaletteProps['pages'],
) => {
  const pathname = usePathname()

  /* Save current pathname to recent pages whenever it changes */
  useEffect(() => {
    const matched = pages.find((p) => p.href === pathname)
    if (!matched) return

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const existing: RecentPage[] = raw ? JSON.parse(raw) : []

      /* Remove duplicate if already present */
      const filtered = existing.filter((r) => r.href !== matched.href)

      const next: RecentPage[] = [
        { title: matched.title, href: matched.href, group: matched.group, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT)

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* localStorage may be unavailable in some environments */
    }
  }, [pathname, pages])

  const getRecent = useCallback((): RecentPage[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }, [])

  return { getRecent }
}

/* ------------------------------------------------------------------ */
/*  Build search items from registry + pages                           */
/* ------------------------------------------------------------------ */

const buildSearchItems = (pages: CommandPaletteProps['pages']): SearchableItem[] => {
  const components = getAllComponents()

  const componentItems: SearchableItem[] = components.map((c) => ({
    name: c.title,
    description: c.description,
    domain: c.domain,
    tags: c.tags ?? [],
    path: `/developer/design-system/${c.domain}/${c.slug}`,
    type: 'component' as const,
    group: DOMAIN_LABELS[c.domain] ?? c.domain,
  }))

  const pageItems: SearchableItem[] = pages.map((p) => ({
    name: p.title,
    description: p.keywords ?? '',
    domain: p.group.toLowerCase(),
    tags: p.keywords?.split(' ') ?? [],
    path: p.href,
    type: 'page' as const,
    group: p.group,
  }))

  return [...componentItems, ...pageItems]
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CommandPalette = ({ pages }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentPages, setRecentPages] = useState<RecentPage[]>([])
  const router = useRouter()
  const { getRecent } = useRecentPages(pages)

  /* Build searchable items and Fuse index */
  const searchItems = useMemo(() => buildSearchItems(pages), [pages])

  const fuse = useMemo(() => new Fuse(searchItems, {
    keys: [
      { name: 'name', weight: 2.0 },
      { name: 'tags', weight: 1.5 },
      { name: 'description', weight: 1.0 },
      { name: 'domain', weight: 0.5 },
    ],
    threshold: 0.35,
    includeMatches: true,
    minMatchCharLength: 2,
  }), [searchItems])

  /* Load recent pages when palette opens */
  useEffect(() => {
    if (open) {
      setRecentPages(getRecent())
      setQuery('')
    }
  }, [open, getRecent])

  /* Keyboard shortcut: Cmd+K / Ctrl+K */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  /* Group pages by their group field (for default view) */
  const grouped = useMemo(() => {
    const map = new Map<string, typeof pages>()
    for (const page of pages) {
      const existing = map.get(page.group) ?? []
      existing.push(page)
      map.set(page.group, existing)
    }
    return map
  }, [pages])

  /* Navigate to selected page */
  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  const isSearching = query.trim().length > 0

  /* Fuse search results */
  const fuseResults = useMemo(() => {
    if (!isSearching) return []
    return fuse.search(query)
  }, [fuse, query, isSearching])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search components, status, tools..."
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search components, status, tools..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <span className="text-muted-foreground">No results found. Try a different search term.</span>
        </CommandEmpty>

        {/* Fuse search results — shown when actively searching */}
        {isSearching && fuseResults.length > 0 && (
          <CommandGroup heading="Results">
            {fuseResults.map((result) => {
              const nameMatch = result.matches?.find((m) => m.key === 'name')
              return (
                <CommandItem
                  key={result.item.path}
                  value={result.item.path}
                  onSelect={() => handleSelect(result.item.path)}
                >
                  <span className="flex-1 text-sm">
                    <HighlightMatch text={result.item.name} indices={nameMatch?.indices} />
                  </span>
                  <Badge variant="default" size="xs" className="ml-2 shrink-0">
                    {result.item.group}
                  </Badge>
                </CommandItem>
              )
            })}
          </CommandGroup>
        )}

        {/* Recent pages — shown only when not actively searching */}
        {!isSearching && recentPages.length > 0 && (
          <CommandGroup heading="Recent">
            {recentPages.map((page) => (
              <CommandItem
                key={`recent-${page.href}`}
                value={`recent-${page.href}`}
                onSelect={() => handleSelect(page.href)}
              >
                <Clock size={14} className="mr-2 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm">{page.title}</span>
                <Badge variant="default" size="xs" className="ml-2 shrink-0">
                  {page.group}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* All pages grouped — shown when not searching */}
        {!isSearching && [...grouped.entries()].map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((page) => (
              <CommandItem
                key={page.href}
                value={page.href}
                onSelect={() => handleSelect(page.href)}
              >
                <span className="flex-1 text-sm">{page.title}</span>
                <Badge variant="default" size="xs" className="ml-2 shrink-0">
                  {page.group}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>

      {/* Keyboard hints footer */}
      <div className="flex items-center justify-center gap-3 border-t border-border px-3 py-2">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-[family-name:var(--font-dm-mono)] text-[11px]">↑↓</kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-[family-name:var(--font-dm-mono)] text-[11px]">↵</kbd>
          Select
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-[family-name:var(--font-dm-mono)] text-[11px]">Esc</kbd>
          Close
        </span>
      </div>
    </CommandDialog>
  )
}

export { CommandPalette }
export type { CommandPaletteProps }
