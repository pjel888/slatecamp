'use client'

import { useState, useCallback, lazy, Suspense, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const fallback = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-[3px]">
      <div className="relative z-[1001] w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )

  const reviewModal = open ? (
    <Suspense fallback={fallback}>
      <WikiQuizModal
        nodeId={nodeId}
        topicName={topicName}
        articleSlug={articleSlug}
        articleTitle={articleTitle}
        articleId={articleId}
        onClose={handleClose}
      />
    </Suspense>
  ) : null

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

      {mounted && typeof document !== 'undefined' && reviewModal
        ? createPortal(reviewModal, document.body)
        : reviewModal}
    </>
  )
}
