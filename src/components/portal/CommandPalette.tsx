'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const CommandPalette = ({ pages }: CommandPaletteProps) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

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

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search admin pages and navigate quickly"
    >
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
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
    </CommandDialog>
  )
}

export { CommandPalette }
export type { CommandPaletteProps }
