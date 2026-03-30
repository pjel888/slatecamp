'use client'

import { useState, lazy, Suspense } from 'react'
import { Brain } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'

const WikiQuizModal = lazy(() =>
  import('./WikiQuizModal').then((m) => ({ default: m.WikiQuizModal })),
)

interface WikiQuizButtonProps {
  nodeId: string
  topicName: string
  articleSlug?: string
}

export const WikiQuizButton = ({ nodeId, topicName, articleSlug }: WikiQuizButtonProps) => {
  const [open, setOpen] = useState(false)
  console.log('[WikiQuizButton] nodeId:', nodeId, 'topicName:', topicName)

  return (
    <>
      <Button
        size="sm"
        className="w-full font-bold rounded-sm shadow-sm active:scale-[0.98]"
        onClick={() => setOpen(true)}
      >
        <SCIcon icon={Brain} size="sm" className="mr-2" />
        Review this Topic
      </Button>

      {open && (
        <Suspense fallback={null}>
          <WikiQuizModal
            nodeId={nodeId}
            topicName={topicName}
            articleSlug={articleSlug}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </>
  )
}
