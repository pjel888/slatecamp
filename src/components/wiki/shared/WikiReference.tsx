'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getWikiArticleBySlug } from '@/lib/actions/wiki-actions'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import { FileText, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface WikiReferenceProps {
  slug: string
  children: React.ReactNode
  className?: string
}

/**
 * WikiReference: The "Peek-View" component for wiki-to-wiki links.
 * Hover = Tooltip with a brief summary (ale_tests_you).
 * Click = Slide-out drawer with the full article (via Sheet).
 */
export function WikiReference({ slug, children, className }: WikiReferenceProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [summary, setSummary] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const fetchSummary = React.useCallback(async () => {
    if (summary) return
    setIsLoading(true)
    try {
      const article = await getWikiArticleBySlug(slug)
      if (article) {
        setSummary(article.ale_tests_you || 'No summary available.')
        setTitle(article.title)
      } else {
        setSummary('Article not found.')
      }
    } catch (err) {
      setSummary('Failed to load summary.')
    } finally {
      setIsLoading(false)
    }
  }, [slug, summary])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip.Provider delayDuration={400}>
        <Tooltip.Root onOpenChange={(open) => open && fetchSummary()}>
          <Tooltip.Trigger asChild>
            <SheetTrigger
              className={cn(
                'inline-flex items-center gap-0.5 font-medium text-camp-cobalt hover:underline decoration-camp-cobalt/30 underline-offset-2 transition-all',
                className
              )}
            >
              {children}
              <SCIcon icon={FileText} size="xs" className="opacity-40 group-hover:opacity-100" />
            </SheetTrigger>
          </Tooltip.Trigger>
          
          <Tooltip.Portal>
            <Tooltip.Content
              side="top"
              align="center"
              sideOffset={5}
              className="z-[100] w-64 p-3 bg-card border border-border rounded-md shadow-lg animate-in fade-in zoom-in-95 duration-150"
            >
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-2 w-full bg-muted animate-pulse rounded" />
                  <div className="h-2 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-foreground leading-tight">
                    {title || 'Loading...'}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                    {summary}
                  </p>
                  <div className="pt-1 flex items-center text-[10px] text-camp-cobalt font-medium">
                    Click to peek <ArrowRight size={10} className="ml-0.5" />
                  </div>
                </div>
              )}
              <Tooltip.Arrow className="fill-white border-t border-l border-border" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">
              {title || 'Loading Article...'}
            </SheetTitle>
            <Link 
              href={ROUTES.WIKI_PAGE(slug)}
              className="text-[11px] font-medium text-camp-cobalt hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Open full page
            </Link>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* 
              This is a simplified view of the article.
              In a real implementation, we'd use a dedicated Peek renderer
              or re-use the WikiArticle component with limited features.
          */}
          <iframe 
            src={`${ROUTES.WIKI_PAGE(slug)}?minimal=true`}
            className="w-full h-full border-none"
            title={`Peek: ${title}`}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
