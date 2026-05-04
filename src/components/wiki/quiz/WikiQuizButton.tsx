'use client'

import { useState, useCallback, lazy, Suspense, useRef } from 'react'
import { Brain } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WikiQuizModal = lazy(() =>
  import('./WikiQuizModal').then((m) => ({ default: m.WikiQuizModal })),
)

interface WikiQuizButtonProps {
  nodeId: string
  topicName: string
  articleSlug?: string
  articleTitle?: string
  articleId?: string
}

export const WikiQuizButton = ({ nodeId, topicName, articleSlug, articleTitle, articleId }: WikiQuizButtonProps) => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleOpen = useCallback(() => {
    if (isLoading || open) return
    setIsLoading(true)
    setOpen(true)
  }, [isLoading, open])

  const handleClose = useCallback(() => {
    setOpen(false)
    // Reset loading guard after modal unmounts (lazy chunk may still load)
    requestAnimationFrame(() => {
      setIsLoading(false)
      // Return focus to the button that opened the modal
      buttonRef.current?.focus()
    })
  }, [])

  // If no valid nodeId, button should not be rendered (parent handles this)
  if (!nodeId) return null

  return (
    <>
      <Button
        ref={buttonRef}
        size="sm"
        className={cn(
          'w-full font-bold rounded-sm shadow-sm active:scale-[0.98] transition-all duration-150',
          isLoading && 'opacity-70 cursor-wait'
        )}
        onClick={handleOpen}
        disabled={isLoading}
        aria-busy={isLoading}
      >
        <SCIcon icon={Brain} size="sm" className="mr-2" />
        {isLoading ? 'Opening review…' : 'Review this Topic'}
      </Button>

      {open && (
        <Suspense fallback={null}>
          <WikiQuizModal
            nodeId={nodeId}
            topicName={topicName}
            articleSlug={articleSlug}
            articleTitle={articleTitle}
            articleId={articleId}
            onClose={handleClose}
          />
        </Suspense>
      )}
    </>
  )
}
