'use client'

import { useState, useEffect } from 'react'

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
}

export const CampfireLoader = ({ staticMessage, interval = 2500 }: CampfireLoaderProps) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto mb-4 rounded-full border-2 border-border-default border-t-camp-cobalt animate-spin" />
        <p
          className="text-ink-secondary text-sm transition-opacity duration-150 ease-out h-5"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {message}
        </p>
      </div>
    </div>
  )
}
