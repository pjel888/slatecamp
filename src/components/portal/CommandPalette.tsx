'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Clock } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'

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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CommandPalette = ({ pages }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentPages, setRecentPages] = useState<RecentPage[]>([])
  const router = useRouter()
  const { getRecent } = useRecentPages(pages)

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

  /* Group pages by their group field */
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

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search components, status, tools..."
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

        {/* Recent pages — shown only when not actively searching */}
        {!isSearching && recentPages.length > 0 && (
          <CommandGroup heading="Recent">
            {recentPages.map((page) => (
              <CommandItem
                key={`recent-${page.href}`}
                value={`recent ${page.title} ${page.group}`}
                onSelect={() => handleSelect(page.href)}
              >
                <Clock className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm">{page.title}</span>
                <Badge variant="default" size="xs" className="ml-2 shrink-0">
                  {page.group}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* All pages grouped — always rendered so cmdk filtering works */}
        {[...grouped.entries()].map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((page) => (
              <CommandItem
                key={page.href}
                value={`${page.title} ${page.keywords ?? ''}`}
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
