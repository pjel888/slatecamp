'use client'

import { useState, useCallback } from 'react'
import { Lightbulb } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface HintButtonProps {
  hintText: string
  /** Whether this is a formative (practice) quiz — hints only for formative */
  isFormative: boolean
  onReveal?: () => void
}

export const HintButton = ({ hintText, isFormative, onReveal }: HintButtonProps) => {
  const [revealed, setRevealed] = useState(false)

  const handleReveal = useCallback(() => {
    setRevealed(true)
    onReveal?.()
  }, [onReveal])

  if (!isFormative) return null

  return (
    <div className="mt-2">
      {!revealed ? (
        <button
          type="button"
          onClick={handleReveal}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs text-[#4A5568] hover:text-[#1B3FC4]',
            'transition-colors duration-150 cursor-pointer',
          )}
          aria-expanded={revealed}
          aria-controls="hint-panel"
        >
          <Lightbulb size={14} weight="bold" aria-hidden="true" />
          Show hint
        </button>
      ) : (
        <div
          id="hint-panel"
          className={cn(
            'rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] px-3 py-2',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-150',
          )}
          role="note"
          aria-label="Question hint"
        >
          <div className="flex items-start gap-2">
            <Lightbulb size={14} weight="fill" className="text-[#D4951A] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-[#4A5568] leading-relaxed">{hintText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
