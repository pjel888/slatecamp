'use client'

import { useState, useCallback, lazy, Suspense, useRef } from 'react'
import { Brain } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
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
    requestAnimationFrame(() => {
      setIsLoading(false)
      buttonRef.current?.focus()
    })
  }, [])

  if (!nodeId) return null

  const fallback = (
    <Modal open onOpenChange={(nextOpen) => { if (!nextOpen) handleClose() }}>
      <ModalContent size="lg" role="dialog" aria-label="Loading wiki review">
        <ModalHeader showCloseButton={false}>
          <ModalTitle>Opening review…</ModalTitle>
        </ModalHeader>
        <ModalBody className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
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

      {reviewModal}
    </>
  )
}
