'use client'

import * as React from 'react'
import { Brain, ThumbsUp, ThumbsDown, LinkSimple, FileText } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { WikiTableOfContents } from './WikiTableOfContents'
import { WikiSourcesPopover } from '../shared/WikiSourcesPopover'
import { WikiRelatedPopover } from '../shared/WikiRelatedPopover'
import { ROUTES } from '@/lib/routes'
import { WikiQuizButton } from '../quiz/WikiQuizButton'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { WikiArticleSource } from '@/lib/actions/wiki-actions'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/hooks/use-toast'
import { addWikiBookmark } from '@/lib/actions/wiki-bookmarks'
import { submitArticleFeedback, getUserArticleFeedback } from '@/lib/actions/wiki-interactions'

interface RelatedTopic {
  slug: string
  title: string
}

interface WikiRightSidebarProps {
  practiceHref: string
  practiceLabel: string
  /** Taxonomy node ID for inline quiz modal */
  nodeId?: string
  /** Article ID for bookmarking */
  articleId?: string
  /** Topic name for the quiz modal header */
  topicName?: string
  relatedTopics?: RelatedTopic[]
  headings: TocHeading[]
  articleSlug: string
  scrollContainerId?: string
  sources?: WikiArticleSource[]
  disableUserActions?: boolean
}

export function WikiRightSidebar({
  practiceHref,
  practiceLabel,
  nodeId,
  articleId,
  topicName,
  relatedTopics = [],
  headings,
  articleSlug,
  scrollContainerId,
  sources = [],
  disableUserActions = false,
}: WikiRightSidebarProps) {
  const [feedbackGiven, setFeedbackGiven] = React.useState<'up' | 'down' | null>(null)
  const [linkCopied, setLinkCopied] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (!disableUserActions && articleId) {
      getUserArticleFeedback(articleId).then(setFeedbackGiven)
    }
  }, [articleId, disableUserActions])

  const handleCopyLink = () => {
    const url = `${window.location.origin}${ROUTES.wiki.article(articleSlug)}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const handleStudyInNotes = async () => {
    if (articleId) {
      const res = await addWikiBookmark(articleId)
      if (res.success) {
        toast({
          variant: 'primary' as any,
          title: 'Saved this article in notes',
          description: 'You can now access it from your Notes workspace.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to save bookmark',
          description: res.error || 'Please try again later.',
        })
      }
    }
  }

  const handleFeedback = async (isHelpful: boolean) => {
    const type = isHelpful ? 'up' : 'down'
    if (feedbackGiven === type) {
      setFeedbackGiven(null)
      return
    }

    if (articleId) {
      const res = await submitArticleFeedback(articleId, isHelpful)
      if (res.success) {
        setFeedbackGiven(type)
        toast({
          title: 'Feedback received',
          description: 'Thank you for helping us improve SlateCamp.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to submit feedback',
          description: res.error || 'Please try again later.',
        })
      }
    }
  }

  // Hard cap of 3 related topics
  const cappedRelated = relatedTopics.slice(0, 3)

  return (
    <div className="space-y-0">
      {/* 1. Review CTA — always opens inline quiz modal */}
      <div className="mb-5">
        <WikiQuizButton nodeId={nodeId ?? ''} topicName={topicName ?? 'This Topic'} articleSlug={articleSlug} />
      </div>

      {/* 1.5 Save to Notes Workspace */}
      {/* <div className="mb-5">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStudyInNotes}
          className="w-full justify-start gap-2 h-9 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all duration-200 group border-border/60 hover:border-primary/30 cursor-pointer"
        >
          <FileText size={14} className="group-hover:scale-110 transition-transform" />
          Study in Notes
        </Button>
      </div> */}

      {/* 2. Related topics — popover to avoid layout shift */}
      <WikiRelatedPopover topics={cappedRelated} />

      {!disableUserActions ? (
        <div className="mb-5">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Feedback
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback(true)}
              className={cn(
                'h-8 w-8 p-0 rounded-sm transition-colors cursor-pointer hover:bg-muted',
                feedbackGiven === 'up'
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                  : 'text-muted-foreground hover:text-text-secondary',
              )}
              aria-label="Helpful"
            >
              <SCIcon icon={ThumbsUp} size="sm" weight={feedbackGiven === 'up' ? 'fill' : 'regular'} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback(false)}
              className={cn(
                'h-8 w-8 p-0 rounded-sm transition-colors cursor-pointer hover:bg-muted',
                feedbackGiven === 'down'
                  ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600'
                  : 'text-muted-foreground hover:text-text-secondary',
              )}
              aria-label="Not helpful"
            >
              <SCIcon icon={ThumbsDown} size="sm" weight={feedbackGiven === 'down' ? 'fill' : 'regular'} />
            </Button>

            <Separator orientation="vertical" className="h-4 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="flex items-center gap-1 h-8 px-2 py-1.5 rounded-sm text-xs text-muted-foreground hover:text-text-secondary hover:bg-muted transition-colors"
              aria-label="Copy link to this article"
            >
              <SCIcon icon={LinkSimple} size="xs" />
              <span>{linkCopied ? 'Copied' : 'Share'}</span>
            </Button>
          </div>
        </div>
      ) : null}

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
