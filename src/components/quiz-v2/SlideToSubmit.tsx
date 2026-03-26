'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { ArrowRight, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlideToSubmitProps {
  onSubmit: () => void
  disabled?: boolean
  label?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HANDLE_SIZE = 44
const TRACK_PADDING = 4
const THRESHOLD_PERCENT = 0.80

// ─── Component ────────────────────────────────────────────────────────────────

export const SlideToSubmit = ({
  onSubmit,
  disabled = false,
  label = 'Slide to submit',
}: SlideToSubmitProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [trackWidth, setTrackWidth] = useState(0)

  // Measure track on mount and resize
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.clientWidth - HANDLE_SIZE - TRACK_PADDING * 2)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const maxOffset = trackWidth
  const progress = maxOffset > 0 ? Math.min(1, offset / maxOffset) : 0
  const thresholdReached = progress >= THRESHOLD_PERCENT

  const handleComplete = useCallback(() => {
    if (completed) return
    setCompleted(true)
    navigator.vibrate?.(15)
    // Brief pause before firing submit for visual satisfaction
    setTimeout(onSubmit, 200)
  }, [completed, onSubmit])

  const bind = useDrag(
    ({ movement: [mx], active, cancel }) => {
      if (disabled || completed) {
        cancel()
        return
      }

      if (active) {
        setIsDragging(true)
        const clamped = Math.max(0, Math.min(mx, maxOffset))
        setOffset(clamped)

        // Haptic at threshold crossing
        if (clamped / maxOffset >= THRESHOLD_PERCENT) {
          navigator.vibrate?.(10)
        }
      } else {
        setIsDragging(false)
        if (offset / maxOffset >= THRESHOLD_PERCENT) {
          // Snap to end and submit
          setOffset(maxOffset)
          handleComplete()
        } else {
          // Snap back
          setOffset(0)
        }
      }
    },
    { axis: 'x', filterTaps: true },
  )

  // Reset when disabled changes (new question)
  useEffect(() => {
    setOffset(0)
    setCompleted(false)
  }, [disabled])

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative flex items-center w-full rounded-md overflow-hidden select-none touch-none',
        'border border-[#D4DAE3] bg-[#F8F7F5]',
        disabled && 'opacity-40 pointer-events-none',
        completed && 'border-[#1B3FC4] bg-[#EEF2FC]',
      )}
      style={{ height: HANDLE_SIZE + TRACK_PADDING * 2, padding: TRACK_PADDING }}
      aria-label={label}
      role="slider"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Track fill — Cobalt gradient following the handle */}
      <div
        className="absolute inset-y-1 left-1 rounded-sm bg-[#1B3FC4]/10"
        style={{
          width: `${Math.max(0, offset + HANDLE_SIZE)}px`,
          transition: isDragging ? 'none' : 'width 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Label — fades out as handle moves */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-[#8896A7] pointer-events-none"
        style={{
          opacity: completed ? 0 : Math.max(0, 1 - progress * 2.5),
          transition: isDragging ? 'none' : 'opacity 200ms ease-out',
        }}
      >
        {label}
      </span>

      {/* Checking answer — inline spinner + message after slide */}
      {completed && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-[13px] font-medium text-[#1B3FC4] pointer-events-none animate-in fade-in duration-200">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-[#1B3FC4]/20 border-t-[#1B3FC4] animate-spin" />
          Checking your answer...
        </span>
      )}

      {/* Draggable handle */}
      <div
        {...bind()}
        className={cn(
          'relative z-10 flex items-center justify-center shrink-0 rounded-sm cursor-grab active:cursor-grabbing',
          'shadow-sm',
          completed
            ? 'bg-[#1B3FC4] text-white'
            : thresholdReached && isDragging
              ? 'bg-[#1B3FC4] text-white'
              : 'bg-white text-[#1B3FC4] border border-[#D4DAE3]',
        )}
        style={{
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 150ms ease-out, color 150ms ease-out',
        }}
        aria-hidden="true"
      >
        {completed ? (
          <Check size={18} weight="bold" />
        ) : (
          <ArrowRight size={18} weight="bold" />
        )}
      </div>

      {/* End zone indicator — subtle chevrons */}
      {!completed && (
        <div
          className="absolute right-3 flex items-center gap-0.5 pointer-events-none"
          style={{
            opacity: Math.max(0.15, progress * 0.6),
            transition: isDragging ? 'none' : 'opacity 200ms ease-out',
          }}
        >
          <ArrowRight size={12} weight="bold" className="text-[#1B3FC4]" />
          <ArrowRight size={12} weight="bold" className="text-[#1B3FC4] -ml-2" />
        </div>
      )}
    </div>
  )
}
