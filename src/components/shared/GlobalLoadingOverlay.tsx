'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useGlobalLoadingStore } from '@/stores/useGlobalLoadingStore'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Delay before showing the overlay to prevent flicker for fast actions */
const SHOW_DELAY_MS = 200

/** Minimum amount of time the overlay stays visible once shown */
const MIN_VISIBLE_MS = 400

// ─── Rotating messages ───────────────────────────────────────────────────────

const FALLBACK_MESSAGES = [
  'Loading…',
  'Still working…',
  'Almost there…',
  'Just a moment…',
]

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * GlobalLoadingOverlay — Centralized frosted-glass loading overlay.
 *
 * Matches the visual design of `CalculatingResultsOverlay`:
 * - Frosted backdrop (`bg-background/85 backdrop-blur-md`)
 * - Centered card (`bg-card rounded-xl border border-border shadow-xl`)
 * - Spinner inside a circular badge
 * - Configurable message
 *
 * Mount the `<GlobalLoadingOverlay />` once at the root layout level.
 * Control it via `useGlobalLoading()` hook or `useGlobalLoadingStore()` store.
 */
export const GlobalLoadingOverlay = () => {
  const operations = useGlobalLoadingStore((s) => s.operations)
  const storeVisible = useGlobalLoadingStore((s) => s.visible)
  const activeMessage = useGlobalLoadingStore((s) => s.activeMessage)
  const reducedMotion = useReducedMotion()

  const [displayed, setDisplayed] = useState(false)
  const [delayedVisible, setDelayedVisible] = useState(false)
  const [rotatingMessage, setRotatingMessage] = useState('')

  const isLoading = operations.length > 0

  // ── Show/hide with delay and minimum duration ──────────────────────────

  useEffect(() => {
    if (isLoading && !delayedVisible) {
      // Start the show delay timer
      const showTimer = setTimeout(() => {
        setDelayedVisible(true)
      }, SHOW_DELAY_MS)
      return () => clearTimeout(showTimer)
    }

    if (!isLoading && delayedVisible) {
      // Enforce minimum visible duration
      const hideTimer = setTimeout(() => {
        setDelayedVisible(false)
      }, MIN_VISIBLE_MS)
      return () => clearTimeout(hideTimer)
    }
  }, [isLoading, delayedVisible])

  // ── Sync displayed state with delayed visibility ───────────────────────

  useEffect(() => {
    if (delayedVisible) {
      setDisplayed(true)
    } else if (!isLoading && !storeVisible) {
      // Only fully hide once the overlay is no longer needed
      const cleanup = setTimeout(() => setDisplayed(false), 300) // fade-out
      return () => clearTimeout(cleanup)
    }
  }, [delayedVisible, isLoading, storeVisible])

  // ── Rotate through fallback messages for long operations ──────────────

  useEffect(() => {
    if (!delayedVisible) return

    // Start rotating after the active message has been static for 3s
    const rotationTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setRotatingMessage(
          FALLBACK_MESSAGES[
            Math.floor(Math.random() * FALLBACK_MESSAGES.length)
          ],
        )
      }, 3000)
      return () => clearInterval(interval)
    }, 3000)

    return () => clearTimeout(rotationTimer)
  }, [delayedVisible])

  // ── Render ─────────────────────────────────────────────────────────────

  if (!displayed) return null

  const message = activeMessage || rotatingMessage || 'Loading…'

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-4 backdrop-blur-md',
        !reducedMotion && 'transition-opacity duration-300',
        delayedVisible ? 'opacity-100' : 'opacity-0',
      )}
      data-testid="global-loading-overlay"
      role="alert"
      aria-busy={delayedVisible ? 'true' : undefined}
      aria-label={message}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-50">
          <div className="h-8 w-8 rounded-full border-2 border-border-default border-t-camp-cobalt animate-spin" />
        </div>

        <p
          className="mt-5 text-sm leading-relaxed text-text-secondary"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
        </p>
      </div>
    </div>
  )
}
