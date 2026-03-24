/**
 * Resolves the correct option ID for a question.
 * Handles both the current schema (correct_option_id) and legacy field (correct_answer).
 */
export const getCorrectOptionId = (question: { correct_option_id?: string | null; correct_answer?: string | null }): string | null =>
  question.correct_option_id ?? question.correct_answer ?? null

/**
 * Resolves the rationale field which can be either a plain string or a JSONB object
 * with per-option rationales: { a: "...", correct: "...", takeaway: "..." }
 */
export type RationaleData = string | Record<string, string | undefined> | null

export const resolveRationaleText = (raw: RationaleData): string => {
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  return raw.correct || Object.values(raw).find((v) => typeof v === 'string' && v.length > 0) || ''
}

export const resolveRationaleTakeaway = (raw: RationaleData): string | null => {
  if (!raw || typeof raw === 'string') return null
  return raw.takeaway || null
}
