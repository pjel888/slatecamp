'use client'

import { SlatecampLoader } from '@/components/shared/SlatecampLoader'

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Full-screen blurred overlay shown during the results calculation transition.
 * Provides an emotional buffer and visual feedback while the server processes
 * the session and the results page is loading.
 */
export const CalculatingResultsOverlay = () => {
  return (
    <SlatecampLoader isOverlay />
  )
}
