// src/features/3d-lab/stores/createModuleStore.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand'

export interface ModuleStoreOptions {
  /**
   * When true, the store resets params to defaults when the consuming
   * component unmounts. Wire up via useModuleLifecycle().
   */
  resetOnUnmount?: boolean
}

export interface ModuleStoreState {
  params: Record<string, number | boolean | string>
  activeAnnotation: string | null
  invalidateFn: (() => void) | null

  /** Internal flag — read by useModuleLifecycle to decide whether to reset on unmount. */
  resetOnUnmount: boolean

  setParam: (key: string, value: number | boolean | string) => void
  setParams: (patch: Record<string, number | boolean | string>) => void
  /** Updates annotation state only — does NOT trigger Canvas re-render. */
  setActiveAnnotation: (id: string | null) => void
  setInvalidateFn: (fn: (() => void) | null) => void
  reset: () => void
}

export const createModuleStore = (
  defaults: Record<string, number | boolean | string>,
  options: ModuleStoreOptions = {}
): UseBoundStore<StoreApi<ModuleStoreState>> => {
  const { resetOnUnmount = false } = options

  return create<ModuleStoreState>()((set, get) => ({
    params: { ...defaults },
    activeAnnotation: null,
    invalidateFn: null,
    resetOnUnmount,

    setParam: (key, value) => {
      set((s) => ({ params: { ...s.params, [key]: value } }))
      get().invalidateFn?.()
    },

    setParams: (patch) => {
      set((s) => ({ params: { ...s.params, ...patch } }))
      get().invalidateFn?.()
    },

    // Annotation selection is UI-only state — Canvas does not need to re-render.
    // Do NOT call invalidateFn() here.
    setActiveAnnotation: (id) => {
      set({ activeAnnotation: id })
    },

    setInvalidateFn: (fn) => set({ invalidateFn: fn }),

    reset: () => {
      set({ params: { ...defaults }, activeAnnotation: null })
      get().invalidateFn?.()
    },
  }))
}
