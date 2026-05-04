'use client'

import { useCallback, useMemo } from 'react'
import {
  useGlobalLoadingStore,
  generateOperationId,
} from '@/stores/useGlobalLoadingStore'

// ─── Options ─────────────────────────────────────────────────────────────────

export interface UseGlobalLoadingOptions {
  /** Custom message shown in the overlay. Default: "Loading…" */
  message?: string
  /** Optional operation ID prefix for debugging */
  prefix?: string
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useGlobalLoading — React hook for the global loading overlay.
 *
 * Provides:
 * - `isLoading` — whether the overlay is currently active
 * - `show(message?)` — show the overlay with an optional message
 * - `hide()` — hide the overlay
 * - `withLoading(fn, message?)` — wraps an async function with loading feedback
 * - `LoadingButtonProps` — convenience for creating LoadingButton-like behavior
 *
 * @example
 * ```tsx
 * const { withLoading } = useGlobalLoading()
 *
 * const handleSubmit = useCallback(() => {
 *   withLoading(saveData, 'Saving your changes…')
 * }, [withLoading])
 * ```
 */
export const useGlobalLoading = (options?: UseGlobalLoadingOptions) => {
  const store = useGlobalLoadingStore()

  // Stable operation ID for this hook instance
  const instanceId = useMemo(
    () => generateOperationId(options?.prefix ?? 'global'),
    [],
  )

  const show = useCallback(
    (message?: string) => {
      store.show(instanceId, message ?? options?.message)
    },
    [store, instanceId, options?.message],
  )

  const hide = useCallback(() => {
    store.hide(instanceId)
  }, [store, instanceId])

  const isLoading = store.operations.length > 0

  const withLoading = useCallback(
    async <T>(
      fn: () => Promise<T>,
      message?: string,
    ): Promise<T> => {
      show(message)
      try {
        return await fn()
      } finally {
        hide()
      }
    },
    [show, hide],
  )

  return { isLoading, show, hide, withLoading }
}

// ─── Standalone utility (for non-hook contexts) ──────────────────────────────

let standaloneIdCounter = 0

/**
 * runWithLoading — Invoke an async function with the global loading overlay.
 * Use this outside React hooks (event handlers, callbacks, etc.).
 *
 * @example
 * ```tsx
 * <button onClick={() => runWithLoading(saveAction, 'Saving…')}>
 *   Save
 * </button>
 * ```
 */
export const runWithLoading = async <T>(
  fn: () => Promise<T>,
  message?: string,
): Promise<T> => {
  const id = `standalone-${++standaloneIdCounter}-${Date.now().toString(36)}`
  const store = useGlobalLoadingStore.getState()
  store.show(id, message)
  try {
    return await fn()
  } finally {
    useGlobalLoadingStore.getState().hide(id)
  }
}

/**
 * createLoadingHandler — Wraps an async event handler with the global loading overlay.
 * Useful for button onClick handlers.
 *
 * @example
 * ```tsx
 * <button onClick={createLoadingHandler(handleLogin, 'Logging in…')}>
 *   Log In
 * </button>
 * ```
 */
export const createLoadingHandler = <T extends (...args: any[]) => Promise<any>>(
  handler: T,
  message?: string,
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  return async (...args: Parameters<T>) => {
    return runWithLoading(() => handler(...args), message)
  }
}
