// src/stores/useGlobalLoadingStore.ts — Global loading overlay state (Zustand)
// Thread-safe operation tracking with concurrent operation support.

import { create } from 'zustand'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LoadingOperation {
  id: string
  message: string
  startedAt: number
}

interface GlobalLoadingState {
  /** Ordered list of active loading operations */
  operations: LoadingOperation[]

  /** Whether the overlay should be visible (after show delay) */
  visible: boolean

  /** The message to display (latest operation's message) */
  activeMessage: string

  /** Register a new loading operation */
  show: (id: string, message?: string) => void

  /** Remove a completed operation — only hides overlay when all operations are done */
  hide: (id: string) => void

  /** Check if any operations are active */
  isActive: () => boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_MESSAGE = 'Loading…'

// ─── Store ───────────────────────────────────────────────────────────────────

export const useGlobalLoadingStore = create<GlobalLoadingState>((set, get) => ({
  operations: [],
  visible: false,
  activeMessage: DEFAULT_MESSAGE,

  show: (id: string, message?: string) => {
    const { operations } = get()
    // Don't add duplicate operation IDs
    if (operations.some((op) => op.id === id)) return

    const newOperation: LoadingOperation = {
      id,
      message: message ?? DEFAULT_MESSAGE,
      startedAt: Date.now(),
    }

    set({
      operations: [...operations, newOperation],
      visible: true,
      activeMessage: message ?? DEFAULT_MESSAGE,
    })
  },

  hide: (id: string) => {
    const { operations } = get()
    const remaining = operations.filter((op) => op.id !== id)
    // Only clear if ALL operations are done
    if (remaining.length === 0) {
      set({ operations: [], visible: false, activeMessage: DEFAULT_MESSAGE })
    } else {
      // Update message to the most recent remaining operation
      set({
        operations: remaining,
        activeMessage: remaining[remaining.length - 1].message,
      })
    }
  },

  isActive: () => get().operations.length > 0,
}))

// ─── Helper: generate a unique operation ID ─────────────────────────────────

let counter = 0
export const generateOperationId = (prefix = 'loading'): string =>
  `${prefix}-${++counter}-${Date.now().toString(36)}`
