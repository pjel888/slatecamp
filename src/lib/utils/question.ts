/**
 * Normalizes question options from either format:
 * 1. Array format: [{id, letter, text}] — pass through
 * 2. Flat object format: {a: "text", b: "text", c: "text", d: "text", correct: "c", takeaway: "..."} — transform
 */
const OPTION_LETTERS = ['a', 'b', 'c', 'd'] as const

export interface NormalizedOption {
  id: string
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
}

export const normalizeOptions = (
  options: unknown,
): NormalizedOption[] => {
  // Already an array — assume normalized format
  if (Array.isArray(options)) {
    return options.map((o, i) => ({
      id: o.id ?? o.letter ?? OPTION_LETTERS[i],
      letter: (o.letter ?? OPTION_LETTERS[i]?.toUpperCase() ?? 'A') as 'A' | 'B' | 'C' | 'D',
      text: o.text ?? String(o),
    }))
  }

  // Flat object format: {a: "text", b: "text", ...}
  if (options && typeof options === 'object') {
    const obj = options as Record<string, unknown>
    return OPTION_LETTERS
      .filter((key) => key in obj && typeof obj[key] === 'string')
      .map((key, _i) => ({
        id: key,
        letter: key.toUpperCase() as 'A' | 'B' | 'C' | 'D',
        text: String(obj[key]),
      }))
  }

  return []
}

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
