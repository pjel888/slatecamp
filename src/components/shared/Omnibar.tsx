'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  MagnifyingGlass,
  CircleNotch,
  BookOpen,
  FileText,
  ArrowRight,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { motion, AnimatePresence } from 'framer-motion'
import { FloatingPanel } from '@/components/shared/floating-panel'
import { searchWikiArticles } from '@/lib/actions/wiki-actions'

interface SearchResult {
  article_id: string
  title: string
  slug: string
  snippet: string
  rank?: number
}

export const Omnibar = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [history, setHistory] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const router = useRouter()

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('slatecamp_search_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  // Hybrid Search logic (FTS + Semantic)
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        const data = await searchWikiArticles(query)
        if (data) setResults(data as SearchResult[])
      } catch (err) {
        console.error("Search failed:", err)
      } finally {
        setIsSearching(false)
      }
    }, 400) // Slightly longer debounce for hybrid search

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (item: SearchResult) => {
    const newHistory = [
      item,
      ...history.filter((h) => h.article_id !== item.article_id),
    ].slice(0, 5)
    setHistory(newHistory)
    localStorage.setItem('slatecamp_search_history', JSON.stringify(newHistory))

    setOpen(false)
    const highlightParam = query
      ? `?highlight=${encodeURIComponent(query)}`
      : ''
    router.push(`/dashboard/wiki/${item.slug}${highlightParam}`)
  }

  // Toggle open on Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  // Reset search when opening/closing
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setIsSearching(false)
      setSelectedResult(null)
    }
  }, [open])

  const handleClose = () => setOpen(false)

  return (
    <Command label="Global Search" shouldFilter={false} className="contents">
      <FloatingPanel
        open={open}
        onClose={handleClose}
        title="Search"
        backdrop="blur"
        position="top-center"
        width={768}
        draggable={false}
        footer={
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              Knowledge Base
            </span>
            {history.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {history.map((item) => (
                  <button
                    key={item.article_id}
                    onClick={() => handleSelect(item)}
                    className="flex-none flex items-center gap-2 px-2.5 py-1.5 bg-card border border-border rounded-sm hover:border-primary/30 hover:shadow-sm transition-all duration-150 max-w-[180px]"
                  >
                    <SCIcon icon={FileText} size="xs" className="text-muted-foreground shrink-0" />
                    <span className="text-[11px] font-medium text-foreground truncate">{item.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded-sm bg-muted border border-border font-mono">Ctrl+K</kbd>
              </p>
            )}
          </div>
        }
      >
        {/* Search input — inside body, using our input styling */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search articles, subjects, or concepts..."
              className="w-full h-9 rounded-sm border border-input bg-transparent pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
            />
            {isSearching && (
              <SCIcon
                icon={CircleNotch}
                size="sm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
              />
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0" style={{ height: 960 }}>
          {/* Results List */}
          <Command.List className="flex-1 overflow-y-auto p-3 border-r border-border/30 scrollbar-hide">
            {query.length >= 2 ? (
              <>
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <SCIcon
                      icon={CircleNotch}
                      size="lg"
                      className="text-muted-foreground/40 animate-spin mb-3"
                    />
                    <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                      Searching...
                    </p>
                  </div>
                ) : (
                  <>
                    {results.length === 0 && (
                      <div className="py-12 text-center text-muted-foreground text-sm">
                        No results found for &ldquo;{query}&rdquo;
                      </div>
                    )}
                    <Command.Group className="px-1">
                      <div className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-widest px-2 py-2">
                        Wiki Articles
                      </div>
                      {results.map((item) => (
                        <ResultItem
                          key={item.article_id}
                          item={item}
                          onSelect={handleSelect}
                          onHover={setSelectedResult}
                        />
                      ))}
                    </Command.Group>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <SCIcon
                  icon={MagnifyingGlass}
                  size="lg"
                  className="text-border mb-4"
                />
                <p className="text-muted-foreground text-sm font-medium">
                  Type to discover syllabus content
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 rounded-sm bg-muted border border-border text-[11px] font-mono">
                    Ctrl+K
                  </kbd>{' '}
                  anytime
                </p>
              </div>
            )}
          </Command.List>

          {/* Sidebar Peek (Preview) */}
          <div className="hidden md:flex w-80 bg-muted/30 p-6 flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedResult ? (
                <motion.div
                  key={selectedResult.article_id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-primary">
                    <SCIcon icon={BookOpen} size="sm" />
                    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest">
                      Article Preview
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {selectedResult.title}
                  </h3>
                  <div 
                    className="text-[13px] text-muted-foreground leading-relaxed line-clamp-[12] [&_mark]:bg-primary/20 [&_mark]:text-primary [&_mark]:font-medium [&_mark]:rounded-sm"
                    dangerouslySetInnerHTML={{ __html: selectedResult.snippet }}
                  />
                  <div className="pt-2 flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-wider group cursor-pointer">
                    Read full article{' '}
                    <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-1 shrink-0" />
                  </div>
                </motion.div>
              ) : (
                <div key="empty" className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                  <SCIcon
                    icon={BookOpen}
                    size="2xl"
                    className="text-muted-foreground/40 mb-3"
                  />
                  <p className="text-[13px] font-medium text-muted-foreground">
                    Select an item
                    <br />
                    to peek inside
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FloatingPanel>
    </Command>
  )
}

const ResultItem = ({
  item,
  onSelect,
  onHover,
}: {
  item: SearchResult
  onSelect: (item: SearchResult) => void
  onHover: (item: SearchResult | null) => void
}) => (
  <Command.Item
    onSelect={() => onSelect(item)}
    onMouseEnter={() => onHover(item)}
    className="flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer aria-selected:bg-muted transition-all duration-150 group mb-0.5 outline-none"
  >
    <div className="bg-muted p-2 rounded-md group-aria-selected:bg-card group-aria-selected:shadow-sm transition-all duration-150 flex items-center justify-center">
      <SCIcon icon={FileText} size="md" className="text-muted-foreground" />
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-sm font-semibold text-foreground truncate">
        {item.title}
      </span>
      <div 
        className="text-[11px] text-muted-foreground truncate [&_mark]:bg-primary/10 [&_mark]:text-primary [&_mark]:font-semibold"
        dangerouslySetInnerHTML={{ __html: item.snippet.replace(/<[^>]*>?/gm, (match) => match === '<mark>' || match === '</mark>' ? match : '') }}
      />
    </div>
    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-auto shrink-0" />
  </Command.Item>
)
