'use client'

import { useEffect } from 'react'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { ModuleStoreState } from '../stores/createModuleStore'

/**
 * Calls store.reset() on unmount when the store was created with
 * resetOnUnmount: true. Place at the top level of the module component.
 *
 * Usage:
 *   const useMyStore = createModuleStore(defaults, { resetOnUnmount: true })
 *   // inside the component:
 *   useModuleLifecycle(useMyStore)
 */
export const useModuleLifecycle = (
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>,
  resetOnUnmount = true,
) => {
  const reset = useStore((s) => s.reset)

  useEffect(() => {
    if (!resetOnUnmount) return
    return () => {
      reset()
    }
  }, [resetOnUnmount, reset])
}
