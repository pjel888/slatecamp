'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { FlashCard as FlashCardType, FlashCategory } from '@/lib/flash-cards'
import { FlashCard } from './FlashCard'

interface FlashSessionProps {
  category: FlashCategory
  cards: FlashCardType[]
}

export const FlashSession = ({ category, cards }: FlashSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [done, setDone] = useState(false)

  // Touch swipe state
  const touchStartX = useRef<number | null>(null)
  const currentCard = cards[currentIndex]

  const handleCorrect = useCallback(() => {
    setCorrect((c) => c + 1)
    if (currentIndex + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, cards.length])

  const handleWrong = useCallback(() => {
    setWrong((w) => w + 1)
    if (currentIndex + 1 >= cards.length) {
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, cards.length])

  // Keyboard navigation — arrow keys only work after card is flipped (answers handled by FlashCard)
  // We surface swipe hints to the user via the card component itself

  // Touch swipe handling at session level for broad swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    // Only trigger swipe if significant horizontal movement (>60px)
    if (Math.abs(deltaX) < 60) return
    if (deltaX < 0) {
      // swipe left = wrong
      handleWrong()
    } else {
      // swipe right = correct
      handleCorrect()
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setCorrect(0)
    setWrong(0)
    setDone(false)
  }

  if (done) {
    const total = correct + wrong
    const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0

    return (
      <div className='flex flex-col items-center gap-6 w-full max-w-xl mx-auto py-8'>
        <h2 className='text-xl font-semibold text-foreground'>Session complete</h2>

        <div className='w-full rounded-md border border-border bg-card p-6 flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-muted-foreground'>Accuracy</span>
            <span className='text-2xl font-semibold text-foreground tabular-nums'>
              {accuracyPct}%
            </span>
          </div>
          <div className='w-full h-2 rounded-full bg-border overflow-hidden'>
            <div
              className='h-2 rounded-full bg-success transition-all duration-300 motion-reduce:transition-none'
              style={{ width: `${accuracyPct}%` }}
            />
          </div>
          <div className='flex gap-4 text-sm'>
            <span className='text-success'>{correct} correct</span>
            <span className='text-destructive'>{wrong} to review</span>
            <span className='text-muted-foreground'>of {total} cards</span>
          </div>
        </div>

        <div className='flex gap-3 w-full'>
          <a
            href='/dashboard/flash'
            className='flex-1 min-h-[44px] flex items-center justify-center rounded-sm border border-border bg-card text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:bg-background'
          >
            All categories
          </a>
          <button
            type='button'
            onClick={handleRestart}
            className='flex-1 min-h-[44px] rounded-sm bg-primary text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          >
            Study again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='flex flex-col items-center gap-6 w-full max-w-xl mx-auto py-4'
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Category label */}
      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide self-start'>
        {category.label}
      </p>

      <FlashCard
        card={currentCard}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
        index={currentIndex}
        total={cards.length}
      />

      {/* Swipe hint — mobile only */}
      <p className='text-xs text-muted-foreground text-center md:hidden'>
        Swipe right = got it &nbsp;·&nbsp; Swipe left = review again
      </p>
    </div>
  )
}
