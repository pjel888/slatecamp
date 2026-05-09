'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { hapticSelect } from '@/lib/quiz/haptics'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlideToSubmitProps {
  onSubmit: () => void
  disabled?: boolean
  label?: string
  /** Optional replacement text once the submitted answer has been checked */
  checkedLabel?: string
  testId?: string
  /** Set to true when the answer has been checked and feedback is showing */
  checked?: boolean
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
  checkedLabel,
  testId,
  checked = false,
}: SlideToSubmitProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [trackWidth, setTrackWidth] = useState(0)

  // Measure track — ResizeObserver for reliable measurement on mount, resize, and layout shifts
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setTrackWidth(el.clientWidth - HANDLE_SIZE - TRACK_PADDING * 2)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const maxOffset = trackWidth
  const progress = maxOffset > 0 ? Math.min(1, offset / maxOffset) : 0
  const checkedText = checkedLabel ?? 'Answer checked'
  const accessibleLabel = completed && checked ? checkedText : label

  const handleComplete = useCallback(() => {
    if (completed) return
    setCompleted(true)
    hapticSelect()
    setTimeout(onSubmit, 200)
  }, [completed, onSubmit])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || completed) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setOffset(maxOffset)
        handleComplete()
      }
    },
    [completed, disabled, handleComplete, maxOffset],
  )

  const bind = useDrag(
    ({ movement: [mx], active, cancel }) => {
      if (disabled || completed) {
        cancel()
        return
      }

      // Re-measure if track not yet laid out (fast touch before effect fires)
      let currentMax = maxOffset
      if (currentMax <= 0 && trackRef.current) {
        currentMax = trackRef.current.clientWidth - HANDLE_SIZE - TRACK_PADDING * 2
        if (currentMax > 0) setTrackWidth(currentMax)
      }
      if (currentMax <= 0) {
        cancel()
        return
      }

      if (active) {
        setIsDragging(true)
        const clamped = Math.max(0, Math.min(mx, currentMax))
        setOffset(clamped)

        if (clamped / currentMax >= THRESHOLD_PERCENT) {
          hapticSelect()
        }
      } else {
        setIsDragging(false)
        if (offset / currentMax >= THRESHOLD_PERCENT) {
          setOffset(currentMax)
          handleComplete()
        } else {
          setOffset(0)
        }
      }
    },
    { axis: 'x', filterTaps: true, pointer: { capture: true } },
  )

  // Reset when checked goes from true → false (new question loaded)
  // or when disabled goes from true → false
  const prevCheckedRef = useRef(checked)
  const prevDisabledRef = useRef(disabled)
  useEffect(() => {
    const wasChecked = prevCheckedRef.current
    const wasDisabled = prevDisabledRef.current
    prevCheckedRef.current = checked
    prevDisabledRef.current = disabled

    // New question: checked was true (answer shown) and now it's false (fresh question)
    // OR disabled was true and now false
    if ((wasChecked && !checked) || (wasDisabled && !disabled)) {
      setOffset(0)
      setCompleted(false)
    }
  }, [disabled, checked])

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative flex items-center w-full rounded-md overflow-hidden select-none touch-none',
        'border border-border bg-surface-light',
        disabled && !completed && 'opacity-40 pointer-events-none',
        completed && 'border-primary bg-primary-50 pointer-events-none',
      )}
      style={{ height: HANDLE_SIZE + TRACK_PADDING * 2, padding: TRACK_PADDING }}
      aria-label={accessibleLabel}
      role="slider"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    >
      {/* Track fill — Cobalt gradient following the handle */}
      <div
        className="absolute inset-y-1 left-1 rounded-sm bg-primary/10"
        style={{
          width: `${Math.max(0, offset + HANDLE_SIZE)}px`,
          transition: isDragging ? 'none' : 'width 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Label — fades out as handle moves, shows "Checking..." when completed */}
      <span
        className="absolute inset-0 flex items-center justify-center text-[13px] font-medium pointer-events-none"
        style={{
          opacity: completed ? 1 : Math.max(0, 1 - progress * 2.5),
          transition: isDragging ? 'none' : 'opacity 200ms ease-out',
          color: completed ? '#1B3FC4' : '#8896A7',
        }}
      >
        {completed && !checked ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            Checking your answer...
          </span>
        ) : completed && checked ? (
          <span className="text-primary">{checkedText}</span>
        ) : (
          label
        )}
      </span>

      {/* Draggable handle — always shows arrow, stays at end when completed */}
      <div
        {...bind()}
        data-testid={testId ? `${testId}-handle` : undefined}
        className={cn(
          'relative z-10 flex items-center justify-center shrink-0 rounded-sm shadow-sm',
          completed
            ? 'cursor-default'
            : isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab',
        )}
        style={{
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          transform: `translateX(${offset}px)`,
          touchAction: 'none',
          backgroundColor: completed || isDragging ? '#1B3FC4' : undefined,
          color: completed || isDragging ? '#FFFFFF' : '#8896A7',
          border: completed || isDragging ? 'none' : '1px solid #D4DAE3',
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out',
        }}
        onMouseEnter={(e) => {
          if (!completed && !isDragging) {
            e.currentTarget.style.backgroundColor = '#1B3FC4'
            e.currentTarget.style.color = '#FFFFFF'
            e.currentTarget.style.border = 'none'
          }
        }}
        onMouseLeave={(e) => {
          if (!completed && !isDragging) {
            e.currentTarget.style.backgroundColor = ''
            e.currentTarget.style.color = '#8896A7'
            e.currentTarget.style.border = '1px solid #D4DAE3'
          }
        }}
        aria-hidden="true"
      >
        <ArrowRight size={18} weight="bold" />
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
          <ArrowRight size={12} weight="bold" className="text-primary" />
          <ArrowRight size={12} weight="bold" className="text-primary -ml-2" />
        </div>
      )}
    </div>
  )
}
