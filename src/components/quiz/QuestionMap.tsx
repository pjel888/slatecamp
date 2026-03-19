'use client'

import { useState, useRef, useEffect } from 'react'
import { SquaresFour, X } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { QuestionDotState } from './FooterNavigator'

interface QuestionDot {
  index: number
  state: QuestionDotState
}

interface QuestionMapProps {
  dots: QuestionDot[]
  currentIndex: number
  onJump: (index: number) => void
  disabled?: boolean
}

export const QuestionMap = ({ dots, currentIndex, onJump, disabled }: QuestionMapProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [isOpen])

  const answered = dots.filter((d) => d.state === 'answered').length
  const flagged = dots.filter((d) => d.state === 'flagged').length

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label='Question map'
        aria-expanded={isOpen}
        className={cn(
          'flex items-center gap-1.5 h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
          isOpen
            ? 'bg-[#EEF2FC] text-primary border border-primary/20'
            : 'text-[#8896A7] hover:bg-[#EEF2FC] hover:text-[#4A5568]',
        )}
      >
        <SCIcon icon={SquaresFour} size='xs' />
        <span className='hidden sm:inline'>Map</span>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className='absolute top-full right-0 mt-2 z-50 w-[320px] bg-white border border-border rounded-md shadow-md'
          role='dialog'
          aria-label='Question navigator'
        >
          <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
            <span className='text-[11px] font-black uppercase tracking-widest text-[#8896A7]'>
              Question Map
            </span>
            <div className='flex items-center gap-3 text-[11px] font-bold text-[#8896A7]'>
              <span>{answered}/{dots.length} answered</span>
              {flagged > 0 && <span className='text-[#D4951A]'>{flagged} flagged</span>}
              <button
                onClick={() => setIsOpen(false)}
                className='h-5 w-5 flex items-center justify-center rounded-sm text-[#8896A7] hover:text-[#4A5568] hover:bg-zinc-100 transition-colors'
                aria-label='Close question map'
              >
                <SCIcon icon={X} size='xs' />
              </button>
            </div>
          </div>
          <div className='p-3 grid grid-cols-10 gap-1.5 max-h-[240px] overflow-y-auto'>
            {dots.map((dot) => (
              <button
                key={dot.index}
                onClick={() => {
                  if (!disabled) {
                    onJump(dot.index)
                    setIsOpen(false)
                  }
                }}
                disabled={disabled}
                aria-label={`Question ${dot.index + 1}${dot.state === 'flagged' ? ', flagged' : ''}${dot.state === 'answered' ? ', answered' : ''}${dot.index === currentIndex ? ', current' : ''}`}
                className={cn(
                  'w-7 h-7 rounded-sm text-[11px] font-bold flex items-center justify-center transition-all',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 outline-none',
                  !disabled && 'cursor-pointer hover:scale-110',
                  disabled && 'cursor-default',
                  dot.index === currentIndex && 'bg-primary text-white ring-2 ring-primary/30',
                  dot.state === 'answered' && dot.index !== currentIndex && 'bg-[#EEF2FC] text-[#1535A8] border border-[#1535A8]/20',
                  dot.state === 'flagged' && dot.index !== currentIndex && 'bg-[#FEF8ED] text-[#D4951A] border border-[#D4951A]/20',
                  dot.state === 'unanswered' && dot.index !== currentIndex && 'bg-zinc-50 text-[#8896A7] border border-border',
                )}
              >
                {dot.index + 1}
              </button>
            ))}
          </div>
          {/* Legend */}
          <div className='px-4 py-2.5 border-t border-border flex items-center gap-4 text-[11px] text-[#8896A7]'>
            <span className='flex items-center gap-1.5'>
              <span className='w-3 h-3 rounded-sm bg-primary' /> Current
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='w-3 h-3 rounded-sm bg-[#EEF2FC] border border-[#1535A8]/20' /> Answered
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='w-3 h-3 rounded-sm bg-[#FEF8ED] border border-[#D4951A]/20' /> Flagged
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
