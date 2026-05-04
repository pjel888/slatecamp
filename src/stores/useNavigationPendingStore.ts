// src/stores/useNavigationPendingStore.ts — Centralized navigation feedback state
// Tracks when a page-changing link has been clicked and navigation is in progress.
// Zustand store — no React context overhead, accessible outside hooks.

// ─── Constants ───────────────────────────────────────────────────────────────────

/** Maximum time (ms) a navigation can stay pending before forced reset */
export const NAVIGATION_TIMEOUT_MS = 10_000

// ─── Types ───────────────────────────────────────────────────────────────────────

export interface NavigationPendingState {
  /** The href of the destination being navigated to, or null */
  pendingHref: string | null
  /** Optional identifier for the clicked nav item (e.g. sidebar item id) */
  pendingId: string | null
  /** Timestamp when navigation started (ms since epoch) */
  startedAt: number | null
  /** Optional label describing what's loading */
  label: string | null
}

export interface NavigationPendingActions {
  /** Begin a navigation — marks the given href as pending */
  startNavigation: (href: string, options?: { id?: string; label?: string }) => void
  /** Complete the current navigation — clears pending state */
  finishNavigation: () => void
  /** Check if a specific href is currently the pending destination */
  isPendingHref: (href: string) => boolean
  /** Whether any navigation is currently pending */
  isNavigating: () => boolean
}

export type NavigationPendingStore = NavigationPendingState & NavigationPendingActions

// ─── Initial state ───────────────────────────────────────────────────────────────

const INITIAL_STATE: NavigationPendingState = {
  pendingHref: null,
  pendingId: null,
  startedAt: null,
  label: null,
}

// ─── Store ───────────────────────────────────────────────────────────────────────

import { create } from 'zustand'

export const useNavigationPendingStore = create<NavigationPendingStore>((set, get) => ({
  ...INITIAL_STATE,

  startNavigation: (href: string, options?: { id?: string; label?: string }) => {
    set({
      pendingHref: href,
      pendingId: options?.id ?? null,
      startedAt: Date.now(),
      label: options?.label ?? null,
    })
  },

  finishNavigation: () => {
    set({ ...INITIAL_STATE })
  },

  isPendingHref: (href: string): boolean => {
    return get().pendingHref === href
  },

  isNavigating: (): boolean => {
    return get().pendingHref !== null
  },
}))

/** Reset the store to initial state (for tests) */
export const resetNavigationPendingStore = () => {
  useNavigationPendingStore.setState({ ...INITIAL_STATE })
}
