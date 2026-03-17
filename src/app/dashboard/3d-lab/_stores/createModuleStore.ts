// src/app/dashboard/3d-lab/_stores/createModuleStore.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand'

export interface ModuleStoreState {
  params: Record<string, number | boolean | string>
  activeAnnotation: string | null
  invalidateFn: (() => void) | null

  setParam: (key: string, value: number | boolean | string) => void
  setParams: (patch: Record<string, number | boolean | string>) => void
  setActiveAnnotation: (id: string | null) => void
  setInvalidateFn: (fn: (() => void) | null) => void
  reset: () => void
}

export function createModuleStore(
  defaults: Record<string, number | boolean | string>
): UseBoundStore<StoreApi<ModuleStoreState>> {
  return create<ModuleStoreState>()((set, get) => ({
    params: { ...defaults },
    activeAnnotation: null,
    invalidateFn: null,

    setParam: (key, value) => {
      set((s) => ({ params: { ...s.params, [key]: value } }))
      get().invalidateFn?.()
    },

    setParams: (patch) => {
      set((s) => ({ params: { ...s.params, ...patch } }))
      get().invalidateFn?.()
    },

    setActiveAnnotation: (id) => {
      set({ activeAnnotation: id })
      get().invalidateFn?.()
    },

    setInvalidateFn: (fn) => set({ invalidateFn: fn }),

    reset: () => {
      set({ params: { ...defaults }, activeAnnotation: null })
      get().invalidateFn?.()
    },
  }))
}
