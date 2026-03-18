'use client'

import * as React from 'react'
import Link from 'next/link'
import { BookmarkSimple, Trash } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ROUTES } from '@/lib/constants/routes'

interface Bookmark {
  slug: string
  title: string
  savedAt: number
}

const STORAGE_KEY = 'wiki_bookmarks'

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  } catch {}
}

export function useWikiBookmarks() {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setBookmarks(loadBookmarks())
  }, [])

  const addBookmark = React.useCallback((slug: string, title: string) => {
    setBookmarks(prev => {
      if (prev.some(b => b.slug === slug)) return prev
      const next = [{ slug, title, savedAt: Date.now() }, ...prev]
      saveBookmarks(next)
      return next
    })
  }, [])

  const removeBookmark = React.useCallback((slug: string) => {
    setBookmarks(prev => {
      const next = prev.filter(b => b.slug !== slug)
      saveBookmarks(next)
      return next
    })
  }, [])

  const isBookmarked = React.useCallback(
    (slug: string) => bookmarks.some(b => b.slug === slug),
    [bookmarks],
  )

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, mounted }
}

interface WikiBookmarksProps {
  currentSlug?: string
  currentTitle?: string
}

/**
 * Single bookmark icon: popover opens the saved list.
 * Toggle bookmark for current page via a button inside the popover header.
 */
export function WikiBookmarks({ currentSlug, currentTitle }: WikiBookmarksProps) {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked, mounted } = useWikiBookmarks()

  if (!mounted) return null

  const isSaved = currentSlug ? isBookmarked(currentSlug) : false

  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center justify-center h-7 w-7 p-0 rounded-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        aria-label="Bookmarks"
      >
        <SCIcon
          icon={BookmarkSimple}
          size="sm"
          weight={isSaved ? 'fill' : 'regular'}
          className={isSaved ? 'text-[#E8853A]' : undefined}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        {/* Header with save/unsave toggle for current page */}
        <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-900">Bookmarks</p>
          {currentSlug && currentTitle && (
            <button
              onClick={() =>
                isSaved ? removeBookmark(currentSlug) : addBookmark(currentSlug, currentTitle)
              }
              className="text-[11px] text-primary hover:text-[#1535A8] font-medium transition-colors"
            >
              {isSaved ? 'Unsave this page' : 'Save this page'}
            </button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-zinc-400">No bookmarks yet</p>
            <p className="text-[11px] text-zinc-300 mt-1">
              Save articles to quickly return to them later.
            </p>
          </div>
        ) : (
          <ul className="max-h-64 overflow-y-auto py-1">
            {bookmarks.map(b => (
              <li key={b.slug} className="group flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50">
                <Link
                  href={ROUTES.WIKI_PAGE(b.slug)}
                  className="flex-1 text-xs text-zinc-700 hover:text-zinc-900 truncate"
                >
                  {b.title}
                </Link>
                <button
                  onClick={() => removeBookmark(b.slug)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-300 hover:text-[#D64545] transition-opacity"
                  aria-label={`Remove ${b.title} from bookmarks`}
                >
                  <SCIcon icon={Trash} size="xs" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
