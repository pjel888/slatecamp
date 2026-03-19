'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/analytics'

interface ElaborativeInterrogationProps {
  question: string
  answer: string
  articleId?: string
}

export const ElaborativeInterrogation = ({
  question,
  answer,
  articleId,
}: ElaborativeInterrogationProps) => {
  const [isRevealed, setIsRevealed] = useState(false)

  const handleReveal = () => {
    setIsRevealed(true)
    trackEvent({
      event_name: 'ei_prompt_revealed',
      event_properties: { article_id: articleId },
    })
  }

  if (isRevealed) {
    return (
      <div className="not-prose my-6 p-4 bg-[#F2F0EB] border border-[#E8E4DC] rounded-md">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B] mb-2">
          Think About It
        </p>
        <p className="text-[15px] text-[#1A2332] font-medium leading-relaxed">
          {question}
        </p>
        <div className="mt-3 pt-3 border-t border-[#E8E4DC]">
          <div
            className="text-[14px] text-[#555555] leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="not-prose my-6 p-4 bg-[#EEF2FC] border border-[#1B3FC4]/15 rounded-md">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#6B6B6B] mb-2">
        Think About It
      </p>
      <p className="text-[15px] text-[#1A2332] font-medium leading-relaxed">
        {question}
      </p>
      <button
        type="button"
        onClick={handleReveal}
        className="mt-3 text-sm text-[#1B3FC4] font-medium hover:underline transition-colors"
      >
        Reveal answer →
      </button>
    </div>
  )
}
