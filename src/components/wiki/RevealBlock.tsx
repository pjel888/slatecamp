'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useDrag } from '@use-gesture/react'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RevealBlockProps {
  /** The content to blur/reveal */
  children: React.ReactNode
  /** Prompt shown above the blurred content */
  prompt?: string
  /** Label for the reveal track */
  label?: string
  /** Initial blur radius in px. Default 12. */
  blurRadius?: number
  /** Whether to start revealed. Default false. */
  defaultRevealed?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HANDLE_SIZE = 28
const HANDLE_SIZE_MOBILE = 40
const TRACK_HEIGHT = 6

// ─── Component ────────────────────────────────────────────────────────────────

export const RevealBlock = ({
  children,
  prompt = 'Try to recall before revealing',
  label = 'Drag to reveal',
  blurRadius = 12,
  defaultRevealed = false,
}: RevealBlockProps) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(defaultRevealed ? 1 : 0)
  const [isDragging, setIsDragging] = useState(false)
  const [trackWidth, setTrackWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Measure track
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.clientWidth)
      }
      setIsMobile(window.innerWidth < 768)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const handleSize = isMobile ? HANDLE_SIZE_MOBILE : HANDLE_SIZE
  const maxOffset = Math.max(0, trackWidth - handleSize)

  const bind = useDrag(
    ({ movement: [mx], active, first, memo }) => {
      if (first) {
        // Store starting progress offset
        return progress * maxOffset
      }
      const startOffset = (memo as number) ?? 0
      const newOffset = Math.max(0, Math.min(startOffset + mx, maxOffset))
      const newProgress = maxOffset > 0 ? newOffset / maxOffset : 0

      setIsDragging(active)
      setProgress(newProgress)

      return memo
    },
    { axis: 'x', filterTaps: true },
  )

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = 0.1
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        setProgress((p) => Math.min(1, p + step))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        setProgress((p) => Math.max(0, p - step))
      } else if (e.key === 'Home') {
        e.preventDefault()
        setProgress(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setProgress(1)
      }
    },
    [],
  )

  // Toggle for quick reveal/hide
  const handleToggle = () => {
    setProgress(progress > 0.5 ? 0 : 1)
  }

  const currentBlur = blurRadius * (1 - progress)
  const isRevealed = progress > 0.95
  const isHidden = progress < 0.05

  return (
    <div className="my-4 rounded-md border border-border bg-white overflow-hidden">
      {/* Prompt header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-light border-b border-border">
        <div className="flex items-center gap-2">
          <EyeSlash
            size={14}
            weight="regular"
            className="text-muted-foreground shrink-0"
            aria-hidden="true"
          />
          <span className="text-[12px] font-medium text-text-secondary">
            {prompt}
          </span>
        </div>
        {/* Quick toggle button */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-medium',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            isRevealed
              ? 'text-primary hover:bg-primary-50'
              : 'text-muted-foreground hover:text-text-secondary',
          )}
          aria-label={isRevealed ? 'Hide content' : 'Reveal content'}
        >
          {isRevealed ? (
            <>
              <EyeSlash size={12} weight="regular" aria-hidden="true" />
              Hide
            </>
          ) : (
            <>
              <Eye size={12} weight="regular" aria-hidden="true" />
              Show
            </>
          )}
        </button>
      </div>

      {/* Blurred content area */}
      <div className="relative px-4 py-4">
        <div
          className="transition-[filter] duration-200 ease-out select-none"
          style={{
            filter: `blur(${currentBlur}px)`,
            transition: isDragging ? 'none' : 'filter 200ms ease-out',
          }}
          aria-hidden={!isRevealed}
        >
          {children}
        </div>

        {/* Overlay hint when fully hidden */}
        {isHidden && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[13px] text-muted-foreground bg-white/80 px-3 py-1.5 rounded-sm">
              {label}
            </span>
          </div>
        )}
      </div>

      {/* Slider track */}
      <div className="px-4 pb-4">
        <div
          ref={trackRef}
          className="relative flex items-center select-none touch-none"
          style={{ height: handleSize }}
          role="slider"
          aria-label={label}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={isRevealed ? 'Fully revealed' : isHidden ? 'Hidden' : `${Math.round(progress * 100)}% revealed`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {/* Track background */}
          <div
            className="absolute left-0 right-0 rounded-full bg-border"
            style={{ height: TRACK_HEIGHT, top: (handleSize - TRACK_HEIGHT) / 2 }}
          />

          {/* Track fill */}
          <div
            className="absolute left-0 rounded-full bg-primary/20"
            style={{
              height: TRACK_HEIGHT,
              top: (handleSize - TRACK_HEIGHT) / 2,
              width: `${progress * 100}%`,
              transition: isDragging ? 'none' : 'width 200ms ease-out',
            }}
          />

          {/* Handle — circular, different from SlideToSubmit */}
          <div
            {...bind()}
            className={cn(
              'absolute z-10 rounded-full flex items-center justify-center',
              'cursor-grab active:cursor-grabbing',
              'transition-shadow duration-150',
              'border-2 shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
              isRevealed
                ? 'bg-primary border-primary text-white'
                : 'bg-white border-border text-muted-foreground hover:border-primary/40 hover:shadow-md',
            )}
            style={{
              width: handleSize,
              height: handleSize,
              left: `calc(${progress * 100}% - ${progress * handleSize}px)`,
              transition: isDragging ? 'none' : 'left 200ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out',
            }}
            aria-hidden="true"
          >
            <Eye
              size={isMobile ? 16 : 14}
              weight={isRevealed ? 'fill' : 'regular'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
