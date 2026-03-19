import { createClient } from '@/lib/supabase/server'

/**
 * Compute accuracy-by-block for a completed session.
 * Divides interactions into 10-item blocks and computes accuracy per block.
 * Written to quiz_sessions.accuracy_by_block JSONB.
 */
export const computeAccuracyByBlock = (
  interactions: { question_order: number; is_correct: boolean }[],
): { block: number; correct: number; total: number; accuracy: number }[] => {
  const sorted = [...interactions].sort((a, b) => a.question_order - b.question_order)
  const blocks: { block: number; correct: number; total: number; accuracy: number }[] = []
  const BLOCK_SIZE = 10

  for (let i = 0; i < sorted.length; i += BLOCK_SIZE) {
    const chunk = sorted.slice(i, i + BLOCK_SIZE)
    const correct = chunk.filter(x => x.is_correct).length
    blocks.push({
      block: Math.floor(i / BLOCK_SIZE) + 1,
      correct,
      total: chunk.length,
      accuracy: Math.round((correct / chunk.length) * 100) / 100,
    })
  }

  return blocks
}

/**
 * Determine the reliable performance window (items before accuracy drops below 70%).
 * This is the "endurance window" — the student's current stamina limit.
 */
export const computeEnduranceWindow = (
  blocks: { block: number; accuracy: number; total: number }[],
): number => {
  let windowItems = 0
  for (const block of blocks) {
    if (block.accuracy >= 0.70) {
      windowItems += block.total
    } else {
      break // First block below 70% = endurance limit
    }
  }
  return windowItems
}

/**
 * Update endurance signals on user_computed_signals.
 * Called after an endurance session completes.
 */
export const updateEnduranceSignals = async (
  userId: string,
  sessionBlocks: { block: number; accuracy: number; total: number }[],
  isCalibrationWeek: boolean,
): Promise<void> => {
  try {
    const supabase = await createClient()
    const currentWindow = computeEnduranceWindow(sessionBlocks)

    const { data: signals } = await supabase
      .from('user_computed_signals')
      .select('endurance_baseline_items, endurance_window_items, endurance_target_items')
      .eq('user_id', userId)
      .single()

    const updates: Record<string, unknown> = {
      endurance_window_items: currentWindow,
      endurance_last_updated: new Date().toISOString(),
    }

    // First calibration week: set baseline
    if (isCalibrationWeek || !signals?.endurance_baseline_items) {
      updates.endurance_baseline_items = currentWindow
    }

    await supabase
      .from('user_computed_signals')
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
  } catch {
    // Silent — endurance signals are non-critical
  }
}
