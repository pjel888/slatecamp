'use client'

import { useState } from 'react'
import type { FlashCard as FlashCardType } from '@/lib/flash-cards'

interface FlashCardProps {
  card: FlashCardType
  onCorrect: () => void
  onWrong: () => void
  index: number
  total: number
}

export const FlashCard = ({
  card,
  onCorrect,
  onWrong,
  index,
  total,
}: FlashCardProps) => {
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => setFlipped((f) => !f)

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      {/* Progress */}
      <p className='text-sm text-[#4A5568] tabular-nums'>
        Card {index + 1} of {total}
      </p>

      {/* Card flip container */}
      <button
        type='button'
        onClick={handleFlip}
        aria-label={flipped ? 'Show question' : 'Reveal answer'}
        className='w-full max-w-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3FC4]'
        style={{ perspective: '1000px', minHeight: '220px' }}
      >
        <div
          className='relative w-full h-full transition-transform duration-300 motion-reduce:transition-none'
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '220px',
          }}
        >
          {/* Front */}
          <div
            className='absolute inset-0 flex flex-col items-center justify-center rounded-md border border-[#D4DAE3] bg-white p-6 text-center'
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className='text-xs font-medium text-[#8896A7] uppercase tracking-wide mb-3'>
              Question
            </span>
            <p className='text-lg font-medium text-[#1A2332] leading-snug'>
              {card.front}
            </p>
            <p className='mt-4 text-xs text-[#8896A7]'>Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className='absolute inset-0 flex flex-col items-center justify-center rounded-md border border-[#D4DAE3] bg-[#EEF2FC] p-6 text-center'
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className='text-xs font-medium text-[#1B3FC4] uppercase tracking-wide mb-3'>
              Answer
            </span>
            <p className='text-2xl font-semibold text-[#1A2332] leading-snug'>
              {card.back}
            </p>
            <p className='mt-3 text-xs text-[#4A5568]'>{card.code_ref}</p>
          </div>
        </div>
      </button>

      {/* Action buttons — only shown after flip */}
      {flipped && (
        <div className='flex gap-3 w-full max-w-xl'>
          <button
            type='button'
            onClick={() => {
              setFlipped(false)
              onWrong()
            }}
            className='flex-1 min-h-[44px] rounded-sm border border-[#D4DAE3] bg-white text-sm font-medium text-[#D64545] transition-colors duration-150 ease-out hover:bg-[#FDF0F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D64545]'
          >
            Need more review
          </button>
          <button
            type='button'
            onClick={() => {
              setFlipped(false)
              onCorrect()
            }}
            className='flex-1 min-h-[44px] rounded-sm border border-[#D4DAE3] bg-white text-sm font-medium text-[#2D9F6F] transition-colors duration-150 ease-out hover:bg-[#EDFAF4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D9F6F]'
          >
            Got it
          </button>
        </div>
      )}
    </div>
  )
}
