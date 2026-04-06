import { useRegisterInvalidate } from '@/components/r3f/useRegisterInvalidate'
import { useNBCPStore } from '../_stores/nbcpStore'

/**
 * Registers R3F invalidate() into the NBCP envelope store.
 * Call inside a Canvas child component.
 */
export function useNBCPInvalidateOnChange() {
  const setInvalidateFn = useNBCPStore((s) => s.setInvalidateFn)
  useRegisterInvalidate(setInvalidateFn)
}
