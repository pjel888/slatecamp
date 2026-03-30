'use client'

import { CampfireLoader } from '@/components/shared/CampfireLoader'

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Full-screen blurred overlay shown during the results calculation transition.
 * Provides an emotional buffer and visual feedback while the server processes
 * the session and the results page is loading.
 */
export const CalculatingResultsOverlay = () => {
  return (
    <CampfireLoader isOverlay />
  )
}
