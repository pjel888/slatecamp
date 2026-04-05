'use client'

import * as React from 'react'
import { FileText, MagnifyingGlass, X, CaretRight } from '@phosphor-icons/react/dist/ssr'
import { SearchInput } from '@/components/ui/input'
import { searchWiki } from '@/lib/actions/wiki'
import { useWikiNavigation } from './WikiNavigationContext'
import { cn } from '@/lib/utils'

interface WikiSearchResult {
  id: string
  title: string
  slug: string
}

export const WikiFullSearch = () => {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<WikiSearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { navigate } = useWikiNavigation()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleSearch = React.useCallback(async (val: string) => {
    setQuery(val)
    if (val.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    setOpen(true)
    try {
      const data = await searchWiki(val)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSelect = (slug: string) => {
    navigate(`/dashboard/wiki/${slug}?highlight=${encodeURIComponent(query)}`)
    setOpen(false)
    setQuery('')
  }

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative px-3 py-2" ref={containerRef}>
      <SearchInput
        value={query}
        onChange={handleSearch}
        onClear={() => {
          setQuery('')
          setResults([])
          setOpen(false)
        }}
        placeholder="Search articles..."
        size="sm"
        loading={loading}
        className="bg-muted/40 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
      />

      {open && (query.length >= 2) && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-background border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.slug)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors group"
                >
                  <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  <span className="flex-1 text-xs font-medium text-foreground truncate">
                    {result.title}
                  </span>
                  <CaretRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">No articles found for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
