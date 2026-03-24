'use client'

import { useEffect, useRef, useCallback } from 'react'
import { X } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { AnswerState, NavigatorCellState } from '@/types/testing'

interface NavigatorOverlayProps {
  totalQuestions: number
  answers: Map<string, AnswerState>
  questionIds: string[]
  currentIndex: number
  onJump: (index: number) => void
  onClose: () => void
}

const getCellState = (
  index: number,
  currentIndex: number,
  questionId: string,
  answers: Map<string, AnswerState>,
): NavigatorCellState => {
  if (index === currentIndex) return 'current'
  const answer = answers.get(questionId)
  if (!answer) return 'unanswered'
  if (answer.isFlagged) return 'flagged'
  if (answer.selectedOptionId) return 'answered'
  return 'unanswered'
}

export const NavigatorOverlay = ({
  totalQuestions,
  answers,
  questionIds,
  currentIndex,
  onJump,
  onClose,
}: NavigatorOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Close on Escape, focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const answeredCount = Array.from(answers.values()).filter((a) => a.selectedOptionId).length
  const flaggedCount = Array.from(answers.values()).filter((a) => a.isFlagged).length

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        aria-hidden
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Session Navigator"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#D4DAE3] rounded-t-lg"
        style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
      >
        <div className="max-w-[720px] mx-auto px-5 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-medium text-[#1A2332]">Session Navigator</h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigator"
              className="h-8 w-8 flex items-center justify-center rounded-md text-[#8896A7] hover:text-[#4A5568] hover:bg-[#F5F5F5] transition-colors"
            >
              <SCIcon icon={X} size="sm" />
            </button>
          </div>

          {/* Question grid */}
          <nav
            aria-label="Question list"
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
          >
            {questionIds.map((qId, index) => {
              const state = getCellState(index, currentIndex, qId, answers)
              return (
                <button
                  key={qId}
                  type="button"
                  onClick={() => {
                    onJump(index)
                    onClose()
                  }}
                  aria-label={`Question ${index + 1}${state === 'flagged' ? ', flagged' : ''}${state === 'answered' ? ', answered' : ''}${state === 'current' ? ', current' : ''}`}
                  aria-current={state === 'current' ? 'true' : undefined}
                  className={cn(
                    'h-11 w-full flex items-center justify-center rounded-md text-[12px] font-semibold transition-colors duration-150',
                    'focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-1 outline-none',
                    state === 'current' && 'bg-[#1B3FC4] text-white ring-2 ring-[#1B3FC4] ring-offset-2',
                    state === 'answered' && 'bg-[#1B3FC4] text-white',
                    state === 'flagged' && 'bg-[#D4951A] text-white',
                    state === 'unanswered' && 'bg-white border border-[#D4DAE3] text-[#8896A7] hover:border-[#1B3FC4]/30 hover:bg-[#EEF2FC]/50',
                  )}
                >
                  {index + 1}
                </button>
              )
            })}
          </nav>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-[#D4DAE3]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#1B3FC4]" aria-hidden />
              <span className="text-[11px] text-[#8896A7] font-medium">
                Answered ({answeredCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#D4951A]" aria-hidden />
              <span className="text-[11px] text-[#8896A7] font-medium">
                Flagged ({flaggedCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-white border border-[#D4DAE3]" aria-hidden />
              <span className="text-[11px] text-[#8896A7] font-medium">
                Unanswered ({totalQuestions - answeredCount})
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
