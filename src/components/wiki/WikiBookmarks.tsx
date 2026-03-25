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
import {
  getWikiBookmarks,
  addWikiBookmark,
  removeWikiBookmark,
} from '@/lib/actions/wiki-bookmarks'

interface Bookmark {
  articleId: string
  slug: string
  title: string
}

function useWikiBookmarks() {
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    getWikiBookmarks().then((rows) => {
      setBookmarks(
        rows.map((r) => ({
          articleId: r.article_id,
          slug: r.slug,
          title: r.title,
        })),
      )
      setLoaded(true)
    })
  }, [])

  const addBookmark = React.useCallback(
    (articleId: string, slug: string, title: string) => {
      setBookmarks((prev) => {
        if (prev.some((b) => b.articleId === articleId)) return prev
        return [{ articleId, slug, title }, ...prev]
      })
      addWikiBookmark(articleId).then((ok) => {
        if (!ok) {
          setBookmarks((prev) => prev.filter((b) => b.articleId !== articleId))
        }
      })
    },
    [],
  )

  const removeBookmark = React.useCallback((articleId: string) => {
    let removed: Bookmark | undefined
    setBookmarks((prev) => {
      removed = prev.find((b) => b.articleId === articleId)
      return prev.filter((b) => b.articleId !== articleId)
    })
    removeWikiBookmark(articleId).then((ok) => {
      if (!ok && removed) {
        setBookmarks((prev) => [...prev, removed!])
      }
    })
  }, [])

  const isBookmarked = React.useCallback(
    (articleId: string) => bookmarks.some((b) => b.articleId === articleId),
    [bookmarks],
  )

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, loaded }
}

interface WikiBookmarksProps {
  currentArticleId?: string
  currentSlug?: string
  currentTitle?: string
}

/**
 * Single bookmark icon: popover opens the saved list.
 * Toggle bookmark for current page via a button inside the popover header.
 */
export function WikiBookmarks({ currentArticleId, currentSlug, currentTitle }: WikiBookmarksProps) {
  const { bookmarks, addBookmark, removeBookmark, isBookmarked, loaded } = useWikiBookmarks()

  if (!loaded) return null

  const isSaved = currentArticleId ? isBookmarked(currentArticleId) : false

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
          className={isSaved ? 'text-[camp-orange]' : undefined}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        {/* Header with save/unsave toggle for current page */}
        <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-900">Bookmarks</p>
          {currentArticleId && currentSlug && currentTitle && (
            <button
              onClick={() =>
                isSaved
                  ? removeBookmark(currentArticleId)
                  : addBookmark(currentArticleId, currentSlug, currentTitle)
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
              <li key={b.articleId} className="group flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50">
                <Link
                  href={ROUTES.WIKI_PAGE(b.slug)}
                  className="flex-1 text-xs text-zinc-700 hover:text-zinc-900 truncate"
                >
                  {b.title}
                </Link>
                <button
                  onClick={() => removeBookmark(b.articleId)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-300 hover:text-[destructive] transition-opacity"
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
