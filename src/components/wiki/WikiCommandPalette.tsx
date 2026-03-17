'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { searchWiki } from '@/lib/actions/wiki'
import { ROUTES } from '@/lib/constants/routes'
import type { WikiSearchResult } from '@/types/app'

export function WikiCommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WikiSearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Debounced live search — 200ms delay, min 2 characters
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchWiki(query, 6)
        setResults(data)
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false)
      setQuery('')
      router.push(ROUTES.WIKI_PAGE(slug))
    },
    [router],
  )

  const handleViewAll = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(ROUTES.WIKI_SEARCH(trimmed))
  }, [query, router])

  return (
    <>
      {/* Search bar trigger — visible on all wiki pages */}
      <button
        onClick={() => setOpen(true)}
        className='flex w-full items-center gap-3 rounded-sm border border-border/40 bg-secondary/30 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <SCIcon icon={MagnifyingGlass} size="sm" className='shrink-0' />
        <span className='flex-1 text-left'>Search wiki...</span>
        <kbd className='hidden sm:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground'>
          <span>⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder='Search wiki...'
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.length >= 2 && !isPending && results.length === 0 && (
            <CommandEmpty>No results for &ldquo;{query}&rdquo;</CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading='Pages'>
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.slug}
                  onSelect={() => handleSelect(result.slug)}
                >
                  <div className='flex flex-col gap-0.5 py-0.5 w-full'>
                    <span className='text-sm font-medium text-foreground'>
                      {result.title}
                    </span>
                    <span
                      className='text-xs text-muted-foreground line-clamp-1 [&_mark]:bg-warning/20 [&_mark]:text-foreground'
                      dangerouslySetInnerHTML={{ __html: result.headline }}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length >= 2 && (
            <CommandGroup>
              <CommandItem onSelect={handleViewAll} value='__view_all__'>
                <SCIcon icon={MagnifyingGlass} size="xs" className='mr-2 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  View all results for &ldquo;{query}&rdquo;
                </span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
