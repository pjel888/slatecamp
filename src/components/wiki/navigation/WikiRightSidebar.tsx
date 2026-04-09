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
}: WikiRightSidebarProps) {
  const [feedbackGiven, setFeedbackGiven] = React.useState<'up' | 'down' | null>(null)
  const [linkCopied, setLinkCopied] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (articleId) {
      getUserArticleFeedback(articleId).then(setFeedbackGiven)
    }
  }, [articleId])

  const handleCopyLink = () => {
    const url = `${window.location.origin}${ROUTES.WIKI_PAGE(articleSlug)}`
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    })
  }

  const handleStudyInNotes = async () => {
    if (articleId) {
      await addWikiBookmark(articleId)
    }
    toast({
      variant: 'primary' as any,
      title: 'Saved this article in notes',
      description: 'You can now access it from your Notes workspace.',
    })
  }

  const handleFeedback = async (isHelpful: boolean) => {
    const type = isHelpful ? 'up' : 'down'
    if (feedbackGiven === type) {
      setFeedbackGiven(null)
      return
    }

    if (articleId) {
      const success = await submitArticleFeedback(articleId, isHelpful)
      if (success) {
        setFeedbackGiven(type)
        toast({
          title: 'Feedback received',
          description: 'Thank you for helping us improve SlateCamp.',
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

      {/* 3. Feedback + share */}
      <div className="mb-5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Feedback
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleFeedback(true)}
            className={cn(
              'p-1.5 rounded-sm transition-colors cursor-pointer',
              feedbackGiven === 'up'
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-muted-foreground hover:text-text-secondary hover:bg-muted',
            )}
            aria-label="Helpful"
          >
            <SCIcon icon={ThumbsUp} size="sm" weight={feedbackGiven === 'up' ? 'fill' : 'regular'} />
          </button>
          <button
            onClick={() => handleFeedback(false)}
            className={cn(
              'p-1.5 rounded-sm transition-colors cursor-pointer',
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
