'use server'

import { updateCalibrationScore } from '@/lib/actions/calibration-score-update'

/**
 * Post-session hooks — fire-and-forget tasks that run after a quiz session completes.
 * Called from end-session.ts after the session is marked complete.
 *
 * Each hook is non-critical: failures are caught and logged so they never
 * block the session completion flow.
 */
export const runPostSessionHooks = async (userId: string): Promise<void> => {
  // Calibration score snapshot (IMPL_03)
  try {
    await updateCalibrationScore(userId)
  } catch (err) {
    console.error('[POST_SESSION] Calibration score update failed:', {
      userId,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    })
  }

  // Future hooks can be added here:
  // - Stamina analysis
  // - Pacing trend snapshot
  // - Achievement checks
}
