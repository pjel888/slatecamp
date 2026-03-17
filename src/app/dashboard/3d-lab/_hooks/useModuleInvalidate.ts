// src/app/dashboard/3d-lab/_hooks/useModuleInvalidate.ts
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

export function useModuleInvalidate(
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
) {
  const { invalidate } = useThree()
  const setInvalidateFn = useStore((s) => s.setInvalidateFn)

  useEffect(() => {
    setInvalidateFn(invalidate)
    return () => setInvalidateFn(null)
  }, [invalidate, setInvalidateFn])
}
