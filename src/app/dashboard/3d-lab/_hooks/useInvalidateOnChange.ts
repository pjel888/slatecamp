'use client'

import { useRegisterInvalidate } from '@/components/r3f/useRegisterInvalidate'
import { useLabStore } from '../_stores/labStore'

/**
 * Registers R3F invalidate() into the main lab store.
 * Call inside a Canvas child component.
 */
export function useInvalidateOnChange() {
  const setInvalidateFn = useLabStore((s) => s.setInvalidateFn)
  useRegisterInvalidate(setInvalidateFn)
}
