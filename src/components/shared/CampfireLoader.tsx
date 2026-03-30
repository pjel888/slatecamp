'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ─── Branded loading messages — warm, campfire-themed ────────────────────────

const CAMPFIRE_MESSAGES = [
  'Setting up the campfire...',
  'Gathering your study materials...',
  'Warming up the questions...',
  'Preparing your trail...',
  'Lighting the lanterns...',
  'Stoking the embers...',
  'Rolling out the sleeping bags...',
  'Mapping your path forward...',
  'Sharpening your pencils...',
  'Brewing some focus...',
  'Unpacking your toolkit...',
  'Finding the best questions for you...',
  'Consulting the study guide...',
  'Calibrating difficulty...',
  'Arranging the firewood...',
  'Scouting the terrain ahead...',
  'Polishing your compass...',
  'Tuning the instruments...',
  'Getting everything just right...',
  'Almost there — hang tight...',
  'Tallying the score...',
  'Crunching the numbers...',
  'Reviewing your performance...',
  'Analyzing your trail progress...',
  'Polishing your results...',
]

const getRandomMessage = (exclude?: string): string => {
  const pool = exclude
    ? CAMPFIRE_MESSAGES.filter((m) => m !== exclude)
    : CAMPFIRE_MESSAGES
  return pool[Math.floor(Math.random() * pool.length)]
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CampfireLoaderProps {
  /** Override the rotating messages with a static one */
  staticMessage?: string
  /** How often to rotate messages (ms). Default 2500. */
  interval?: number
  /** Additional classes for the container */
  className?: string
  /** If true, renders as a fixed, blurred overlay instead of full-page content */
  isOverlay?: boolean
}

export const CampfireLoader = ({
  staticMessage,
  interval = 2500,
  className,
  isOverlay = false,
}: CampfireLoaderProps) => {
  // Use a deterministic initial state to avoid SSR hydration mismatches
  const [message, setMessage] = useState(
    staticMessage ?? CAMPFIRE_MESSAGES[0],
  )
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (staticMessage) return

    // Switch to a random message on mount
    setMessage(getRandomMessage(CAMPFIRE_MESSAGES[0]))

    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMessage((prev) => getRandomMessage(prev))
        setVisible(true)
      }, 150)
    }, interval)

    return () => clearInterval(timer)
  }, [staticMessage, interval])

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const content = (
    <div className="text-center">
      <div className="h-8 w-8 mx-auto mb-4 rounded-full border-2 border-border-default border-t-camp-cobalt animate-spin" />
      <p
        className="text-ink-secondary text-sm transition-opacity duration-150 ease-out h-5"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {message}
      </p>
    </div>
  )

  if (isOverlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[100] flex items-center justify-center',
          'bg-white/80 backdrop-blur-md',
          !prefersReducedMotion && 'animate-in fade-in duration-300 ease-out',
          className,
        )}
        role="alert"
        aria-busy="true"
        aria-label={staticMessage ?? 'Loading'}
      >
        {content}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        className ?? 'min-h-screen',
      )}
    >
      {content}
    </div>
  )
}
