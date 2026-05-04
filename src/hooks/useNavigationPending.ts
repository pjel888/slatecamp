// src/hooks/useNavigationPending.ts — Centralized navigation feedback hook
// Wraps useNavigationPendingStore with pathname-change detection and fallback timeout.
// Provides a clean API for components to signal and observe navigation pending state.

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import {
  useNavigationPendingStore,
  NAVIGATION_TIMEOUT_MS,
} from '@/stores/useNavigationPendingStore'

// ─── Public interface ──────────────────────────────────────────────────────────

export interface UseNavigationPendingReturn {
  /** Whether any navigation is currently pending */
  isNavigating: boolean
  /** The href of the current pending navigation, or null */
  pendingHref: string | null
  /** The id of the current pending nav item, or null */
  pendingId: string | null
  /** Check if a specific href is the current pending destination */
  isPendingHref: (href: string) => boolean
  /** Start a navigation — marks the href as pending */
  startNavigation: (href: string, options?: { id?: string; label?: string }) => void
  /** Finish the current navigation — clears pending state */
  finishNavigation: () => void
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

/**
 * useNavigationPending — Centralized navigation feedback hook.
 *
 * Manages a pending-navigation state that components can subscribe to.
 * Automatically clears when:
 * 1. The pathname changes (navigation completed)
 * 2. A fallback timeout is reached (10s safety net)
 * 3. The clicked href matches the current pathname (no navigation needed)
 *
 * Also manages a `cursor-progress` class on `document.body` while navigating.
 *
 * @example
 * ```tsx
 * const nav = useNavigationPending()
 *
 * const handleClick = () => {
 *   nav.startNavigation('/dashboard/3d-lab', { id: '3d-lab' })
 * }
 *
 * // In render:
 * <Link
 *   aria-disabled={nav.isNavigating && !nav.isPendingHref(href)}
 *   className={nav.isPendingHref(href) ? 'pending' : ''}
 * />
 * ```
 */
export const useNavigationPending = (): UseNavigationPendingReturn => {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to store — pick individual fields to avoid unnecessary re-renders
  const pendingHref = useNavigationPendingStore((s) => s.pendingHref)
  const pendingId = useNavigationPendingStore((s) => s.pendingId)
  const startedAt = useNavigationPendingStore((s) => s.startedAt)

  const isNavigating = pendingHref !== null

  // Get raw store actions (stable references, no rerender)
  const storeStart = useNavigationPendingStore.getState().startNavigation
  const storeFinish = useNavigationPendingStore.getState().finishNavigation

  // ── Actions ─────────────────────────────────────────────────────────────

  const startNavigation = useCallback(
    (href: string, options?: { id?: string; label?: string }) => {
      // If the clicked href matches the current route, don't start navigation
      if (href === pathname) return
      storeStart(href, options)
    },
    [pathname, storeStart],
  )

  const finishNavigation = useCallback(() => {
    storeFinish()
    document.body.classList.remove('cursor-progress')
  }, [storeFinish])

  const isPendingHref = useCallback(
    (href: string): boolean => {
      return useNavigationPendingStore.getState().pendingHref === href
    },
    [],
  )

  // ── Clear on pathname change ────────────────────────────────────────────

  useEffect(() => {
    if (pathname !== prevPathnameRef.current && startedAt !== null) {
      // Pathname changed — navigation completed
      finishNavigation()
    }
    prevPathnameRef.current = pathname
  }, [pathname, finishNavigation, startedAt])

  // ── Fallback timeout ────────────────────────────────────────────────────

  useEffect(() => {
    if (pendingHref === null) {
      // Clear any stale timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      // Ensure body class is cleared
      document.body.classList.remove('cursor-progress')
      return
    }

    // Add cursor-progress class
    document.body.classList.add('cursor-progress')

    // Set fallback timeout
    timeoutRef.current = setTimeout(() => {
      if (useNavigationPendingStore.getState().pendingHref !== null) {
        finishNavigation()
      }
    }, NAVIGATION_TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [pendingHref, finishNavigation])

  // ── Cleanup on unmount ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      document.body.classList.remove('cursor-progress')
    }
  }, [])

  return {
    isNavigating,
    pendingHref,
    pendingId,
    isPendingHref,
    startNavigation,
    finishNavigation,
  }
}
