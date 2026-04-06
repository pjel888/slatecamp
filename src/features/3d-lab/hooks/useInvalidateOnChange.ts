'use client'

import { useRegisterInvalidate } from '@/components/r3f/useRegisterInvalidate'
import { useLabStore } from '@/app/dashboard/3d-lab/_stores/labStore'

export const useInvalidateOnChange = () => {
  const setInvalidateFn = useLabStore((state) => state.setInvalidateFn)
  useRegisterInvalidate(setInvalidateFn)
}
