'use client'

import * as React from 'react'
import Link from 'next/link'
import { Brain, ThumbsUp, ThumbsDown, LinkSimple, FileText } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { WikiTableOfContents } from './WikiTableOfContents'
import { WikiSourcesPopover } from './WikiSourcesPopover'
import { WikiRelatedPopover } from './WikiRelatedPopover'
import { ROUTES } from '@/lib/constants/routes'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { WikiArticleSource } from '@/lib/actions/wiki-actions'
import { cn } from '@/lib/utils'

interface RelatedTopic {
  slug: string
  title: string
}

interface WikiRightSidebarProps {
  practiceHref: string
  practiceLabel: string
  relatedTopics?: RelatedTopic[]
  headings: TocHeading[]
  articleSlug: string
  scrollContainerId?: string
  sources?: WikiArticleSource[]
}

export function WikiRightSidebar({
  practiceHref,
  practiceLabel,
  relatedTopics = [],
  headings,
  articleSlug,
  scrollContainerId,
  sources = [],
}: WikiRightSidebarProps) {
  const [feedbackGiven, setFeedbackGiven] = React.useState<'up' | 'down' | null>(null)
  const [linkCopied, setLinkCopied] = React.useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}${ROUTES.WIKI_PAGE(articleSlug)}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  // Hard cap of 3 related topics
  const cappedRelated = relatedTopics.slice(0, 3)

  return (
    <div className="space-y-0">
      {/* 1. Practice CTA — single button, always visible, fixed height */}
      <div className="mb-5">
        <Link href={practiceHref}>
          <Button
            size="sm"
            className="w-full font-bold rounded-sm shadow-sm active:scale-[0.98]"
          >
            <SCIcon icon={Brain} size="sm" className="mr-2" />
            {practiceLabel}
          </Button>
        </Link>
      </div>

      {/* 2. Related topics — popover to avoid layout shift */}
      <WikiRelatedPopover topics={cappedRelated} />

      {/* 3. Feedback + share */}
      <div className="mb-5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Feedback
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFeedbackGiven(feedbackGiven === 'up' ? null : 'up')}
            className={cn(
              'p-1.5 rounded-sm transition-colors',
              feedbackGiven === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-muted-foreground hover:text-text-secondary hover:bg-muted',
            )}
            aria-label="Helpful"
          >
            <SCIcon icon={ThumbsUp} size="sm" weight={feedbackGiven === 'up' ? 'fill' : 'regular'} />
          </button>
          <button
            onClick={() => setFeedbackGiven(feedbackGiven === 'down' ? null : 'down')}
            className={cn(
              'p-1.5 rounded-sm transition-colors',
              feedbackGiven === 'down'
                ? 'bg-red-50 text-red-500'
                : 'text-muted-foreground hover:text-text-secondary hover:bg-muted',
            )}
            aria-label="Not helpful"
          >
            <SCIcon icon={ThumbsDown} size="sm" weight={feedbackGiven === 'down' ? 'fill' : 'regular'} />
          </button>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2 py-1.5 rounded-sm text-xs text-muted-foreground hover:text-text-secondary hover:bg-muted transition-colors"
            aria-label="Copy link to this article"
          >
            <SCIcon icon={LinkSimple} size="xs" />
            <span>{linkCopied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 4. Sources popover */}
      <WikiSourcesPopover sources={sources} />

      {/* 5. On this page (ToC) — LAST, free to grow downward. Only rendered if headings exist. */}
      {headings.length > 0 && (
        <>
          <Separator className="mb-5" />
          <WikiTableOfContents headings={headings} scrollContainerId={scrollContainerId} />
        </>
      )}
    </div>
  )
}
