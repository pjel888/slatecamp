'use client'

import { useState, useRef, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { CheckCircle, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface SwipeableOptionProps {
  children: React.ReactNode
  isSelected: boolean
  isDisabled: boolean
  onSwipeComplete: () => void
}

const THRESHOLD_RATIO = 0.4
const VELOCITY_THRESHOLD = 0.3
const MAX_ROTATION_DEG = 3
const EXIT_DELAY_MS = 300

export const SwipeableOption = ({
  children,
  isSelected,
  isDisabled,
  onSwipeComplete,
}: SwipeableOptionProps) => {
  const [x, setX] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [swiped, setSwiped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hasCrossedThreshold = useRef(false)

  // Reset swipe state when option changes (e.g. new question)
  useEffect(() => {
    setX(0)
    setRotation(0)
    setSwiped(false)
    hasCrossedThreshold.current = false
  }, [isSelected])

  const cardWidth = cardRef.current?.offsetWidth ?? 300
  const threshold = cardWidth * THRESHOLD_RATIO
  const progress = Math.min(1, x / threshold)

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], active, cancel }) => {
      if (!isSelected || isDisabled || swiped) {
        cancel?.()
        return
      }

      // Only allow rightward swipes
      if (dx < 0 && mx < 0) {
        cancel?.()
        return
      }

      const clampedX = Math.max(0, mx)

      if (active) {
        setIsActive(true)
        setX(clampedX)
        setRotation(Math.min(MAX_ROTATION_DEG, clampedX * 0.02))

        // Haptic at threshold crossing
        if (clampedX >= threshold && !hasCrossedThreshold.current) {
          hasCrossedThreshold.current = true
          triggerHaptic()
        } else if (clampedX < threshold) {
          hasCrossedThreshold.current = false
        }
      } else {
        setIsActive(false)

        if (clampedX > threshold || vx > VELOCITY_THRESHOLD) {
          // Threshold crossed — exit and submit
          setSwiped(true)
          setTimeout(onSwipeComplete, EXIT_DELAY_MS)
        } else {
          // Snap back
          setX(0)
          setRotation(0)
          hasCrossedThreshold.current = false
        }
      }
    },
    { axis: 'x', filterTaps: true },
  )

  return (
    <div className="relative" ref={cardRef}>
      {/* Confirmation strip — behind the card */}
      <div
        className="absolute inset-0 rounded-md bg-primary flex items-center justify-center gap-2 text-white text-sm font-medium"
        style={{ opacity: progress }}
        aria-hidden="true"
      >
        <CheckCircle size={18} weight="fill" />
        Submitting…
      </div>

      {/* Swipeable card — on top */}
      <div
        {...(isSelected && !isDisabled ? bind() : {})}
        style={{
          transform: `translateX(${swiped ? '120%' : `${x}px`}) rotate(${rotation}deg)`,
          transition: isActive ? 'none' : swiped ? `transform ${EXIT_DELAY_MS}ms ease-out` : 'transform 200ms ease-out',
          touchAction: 'pan-y',
          userSelect: 'none',
          cursor: isSelected && !isDisabled ? 'grab' : undefined,
        }}
        className="relative"
      >
        {children}

        {/* Chevron affordance — only on selected, not disabled */}
        {isSelected && !isDisabled && (
          <div
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-primary transition-opacity duration-150',
              x > 8 ? 'opacity-100' : 'opacity-40',
            )}
            style={{
              animation: x < 4 ? 'swipe-pulse 1.8s ease-in-out infinite' : 'none',
            }}
            aria-hidden="true"
          >
            <CaretRight size={16} weight="bold" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes swipe-pulse {
          0%, 100% { opacity: 0.4; transform: translateY(-50%) translateX(0); }
          50% { opacity: 0.8; transform: translateY(-50%) translateX(2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes swipe-pulse {
            0%, 100% { opacity: 0.4; }
          }
        }
      `}</style>
    </div>
  )
}
