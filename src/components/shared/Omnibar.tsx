'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  MagnifyingGlass,
  FileText,
  ArrowRight,
  CircleNotch,
  BookOpen,
  Clock,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { AppleCloseButton } from '@/components/ui/AppleCloseButton'

interface SearchResult {
  article_id: string
  title: string
  slug: string
  content: string
}

export function Omnibar({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [history, setHistory] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null,
  )
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('slatecamp_search_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  // Search logic (Full-text)
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    // START SEARCHING IMMEDIATELY to prevent "No Results" flash
    setIsSearching(true)
    setResults([])

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('wiki_articles')
        .select('article_id, title, slug, content')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5)

      if (data) setResults(data as SearchResult[])
      // STOP SEARCHING ONLY AFTER FETCH IS DONE
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, supabase])

  const handleSelect = (item: SearchResult) => {
    // Save to history
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

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className='fixed inset-0 z-[100] bg-zinc-950/20 backdrop-blur-sm animate-in fade-in duration-200' />

        <DialogPrimitive.Popup className='fixed top-[15vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-3xl outline-none px-4 sm:px-0'>
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>Global Search</DialogPrimitive.Title>
            <DialogPrimitive.Description>
              Search for articles and subjects
            </DialogPrimitive.Description>
          </VisuallyHidden.Root>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className='w-full bg-white rounded-sm border border-zinc-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col'
          >
            <Command
              label='Global Search'
              shouldFilter={false}
              className='flex flex-col w-full'
            >
              {/* Header */}
              <div className='flex items-center px-5 border-b border-zinc-100 h-16 gap-4'>
                <SCIcon icon={MagnifyingGlass} size='md' className='text-zinc-400 shrink-0' />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder='Search for articles, subjects, or concepts...'
                  className='flex-1 bg-transparent border-none outline-none text-[16px] text-zinc-900 placeholder:text-zinc-400 h-full font-medium'
                />
                {isSearching && (
                  <SCIcon icon={CircleNotch} size='sm' className='text-zinc-400 animate-spin' />
                )}

                <div className='flex items-center gap-4 shrink-0'>
                  <div className='hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded text-[11px] font-bold text-zinc-400 tracking-tighter uppercase'>
                    ESC
                  </div>
                  <AppleCloseButton onClick={() => setOpen(false)} />
                </div>
              </div>

              {/* Main Content Area */}
              <div className='flex h-[400px]'>
                {/* Results List */}
                <Command.List className='flex-1 overflow-y-auto p-3 border-r border-zinc-50 scrollbar-hide'>
                  {query.length >= 2 ? (
                    <>
                      {isSearching ? (
                        <div className='flex flex-col items-center justify-center py-20 text-center'>
                          <SCIcon icon={CircleNotch} size='lg' className='text-zinc-300 animate-spin mb-3' />
                          <p className='text-[11px] font-bold text-zinc-400 uppercase tracking-widest'>
                            Searching Knowledge Base...
                          </p>
                        </div>
                      ) : (
                        <>
                          {results.length === 0 && (
                            <div className='py-12 text-center text-zinc-400 text-sm'>
                              No results found for "{query}"
                            </div>
                          )}
                          <Command.Group className='px-2'>
                            <div className='text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] px-2 py-3'>
                              Wiki Articles
                            </div>
                            {results.map((item) => (
                              <Item
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
                    <div className='flex flex-col items-center justify-center h-full text-center p-8'>
                      <SCIcon icon={MagnifyingGlass} size='xl' className='text-zinc-100 mb-4' />
                      <p className='text-zinc-400 text-sm font-medium'>
                        Type to discover syllabus content
                      </p>
                    </div>
                  )}
                </Command.List>

                {/* Sidebar Peek (Preview) */}
                <div className='hidden md:flex w-80 bg-zinc-50/50 p-8 flex-col overflow-hidden'>
                  <AnimatePresence mode='wait'>
                    {selectedResult ? (
                      <motion.div
                        key={selectedResult.article_id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className='space-y-5'
                      >
                        <div className='flex items-center gap-2 text-primary'>
                          <SCIcon icon={BookOpen} size='sm' />
                          <span className='text-[11px] font-bold uppercase tracking-widest'>
                            Article Preview
                          </span>
                        </div>
                        <h3 className='text-lg font-bold text-zinc-900 leading-tight'>
                          {selectedResult.title}
                        </h3>
                        <p className='text-[13px] text-zinc-500 leading-relaxed line-clamp-[10]'>
                          {selectedResult.content.replace(/[#*]/g, '')}
                        </p>
                        <div className='pt-2 flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-wider group cursor-pointer'>
                          Read full article{' '}
                          <SCIcon icon={ArrowRight} size='xs' className='transition-transform group-hover:translate-x-1' />
                        </div>
                      </motion.div>
                    ) : (
                      <div className='flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale'>
                        <SCIcon icon={BookOpen} size='2xl' className='text-zinc-300 mb-3' />
                        <p className='text-[13px] font-medium text-zinc-400'>
                          Select an item
                          <br />
                          to peek inside
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Horizontal Recent Activity Footer (Spans entire modal) */}
              {history.length > 0 && (
                <div className='bg-zinc-50 border-t border-zinc-100 p-4'>
                  <div className='flex items-center gap-2 mb-3 px-2'>
                    <SCIcon icon={Clock} size='xs' className='text-zinc-400' />
                    <span className='text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]'>
                      Recent Activity
                    </span>
                  </div>
                  <div className='flex items-center gap-2 overflow-x-auto scrollbar-hide px-1'>
                    {history.map((item) => (
                      <button
                        key={item.article_id}
                        onClick={() => handleSelect(item)}
                        className='flex-none flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-md hover:border-zinc-400 hover:shadow-sm transition-all max-w-[200px]'
                      >
                        <SCIcon icon={FileText} size='xs' className='text-zinc-400 shrink-0' />
                        <span className='text-[12px] font-medium text-zinc-700 truncate'>
                          {item.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Command>
          </motion.div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function Item({
  item,
  onSelect,
  onHover,
}: {
  item: SearchResult
  onSelect: (item: SearchResult) => void
  onHover: (item: SearchResult | null) => void
}) {
  return (
    <Command.Item
      onSelect={() => onSelect(item)}
      onMouseEnter={() => onHover(item)}
      className='flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer aria-selected:bg-zinc-100 transition-all group mb-1 outline-none'
    >
      <div className='bg-zinc-100 p-2.5 rounded-sm group-aria-selected:bg-white group-aria-selected:shadow-sm transition-all flex items-center justify-center'>
        <SCIcon icon={FileText} size='md' className='text-zinc-500' />
      </div>
      <div className='flex flex-col min-w-0'>
        <span className='text-sm font-semibold text-zinc-900 truncate'>
          {item.title}
        </span>
        <span className='text-[11px] text-zinc-400 truncate tracking-tight'>
          Wiki &bull; {item.slug}
        </span>
      </div>
    </Command.Item>
  )
}
