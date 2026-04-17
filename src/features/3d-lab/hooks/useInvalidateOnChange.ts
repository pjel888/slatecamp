'use client'

import { useRegisterInvalidate } from '@/components/r3f/useRegisterInvalidate'
import { useLabStore } from '@/features/3d-lab/stores/legacyLabStore'

export const useInvalidateOnChange = () => {
  const setInvalidateFn = useLabStore((state) => state.setInvalidateFn)
  useRegisterInvalidate(setInvalidateFn)
}
