'use client'

import * as React from 'react'
import Link from 'next/link'
import { CaretRight, ArrowLeft, List, ListBullets } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/routes'
import { WikiReadingProgress } from './WikiReadingProgress'
import { WikiBookmarks } from './WikiBookmarks'
import { WikiSidebar } from './WikiSidebar'
import { useWikiDiscipline } from './WikiDisciplineContext'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { BreadcrumbItem } from '@/lib/actions/wiki-actions'

interface WikiHeaderClientProps {
  breadcrumbs: BreadcrumbItem[]
  articleId?: string
  articleTitle?: string
  articleSlug?: string
  scrollContainerId?: string
  disableUserActions?: boolean
  mobileActionsContent?: React.ReactNode
}

export function WikiHeaderClient({
  breadcrumbs,
  articleId,
  articleTitle,
  articleSlug,
  scrollContainerId,
  disableUserActions = false,
  mobileActionsContent,
}: WikiHeaderClientProps) {
  const { disciplineId, disciplineName } = useWikiDiscipline()
  return (
    <div className="w-full print:hidden">
      <div className="flex items-center justify-between px-4 h-10 gap-2">
        {/* Left: Mobile nav trigger → Back link → Breadcrumbs */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Mobile nav drawer trigger — visible below md */}
          {disciplineId && (
            <div className="md:hidden shrink-0">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <SCIcon icon={List} size="sm" />
                  <span className="sr-only">Open navigation</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <WikiSidebar
                    disciplineId={disciplineId}
                    disciplineName={disciplineName || 'Syllabus'}
                  />
                </SheetContent>
              </Sheet>
            </div>
          )}

          <Link
            href={ROUTES.WIKI}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-text-secondary transition-colors shrink-0"
            aria-label="Back to syllabus"
          >
            <SCIcon icon={ArrowLeft} size="xs" />
          </Link>

          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 min-w-0 overflow-hidden">
              <ol className="flex items-center gap-1 min-w-0">
                {breadcrumbs.map((crumb) => (
                  <li key={crumb.node_id} className="flex items-center gap-1 min-w-0">
                    <SCIcon icon={CaretRight} size="xs" className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {crumb.name}
                    </span>
                  </li>
                ))}
                {articleTitle && (
                  <li className="flex items-center gap-1 min-w-0">
                    <SCIcon icon={CaretRight} size="xs" className="text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                      {articleTitle}
                    </span>
                  </li>
                )}
              </ol>
            </nav>
          )}
        </div>

        {/* Right: Bookmarks → Mobile actions trigger */}
        <div className="flex items-center gap-1 shrink-0">
          {!disableUserActions ? (
            <WikiBookmarks
              currentArticleId={articleId}
              currentSlug={articleSlug}
              currentTitle={articleTitle}
            />
          ) : null}

          {/* Mobile actions drawer trigger — visible below lg */}
          {mobileActionsContent && (
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <SCIcon icon={ListBullets} size="sm" />
                  <span className="sr-only">Actions & table of contents</span>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0 overflow-y-auto">
                  {mobileActionsContent}
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>

      <WikiReadingProgress scrollContainerId={scrollContainerId} />
    </div>
  )
}
