import { useRegisterInvalidate } from '@/components/r3f/useRegisterInvalidate'
import type { ModuleStoreState } from '../stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

/**
 * Registers R3F invalidate() into a module-specific store.
 * Call inside a Canvas child component.
 */
export function useModuleInvalidate(
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
) {
  const setInvalidateFn = useStore((s) => s.setInvalidateFn)
  useRegisterInvalidate(setInvalidateFn)
}
