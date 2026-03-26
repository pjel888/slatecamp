// ─── Generation Effect: Answer Matching ──────────────────────────────────────
// Matches user-generated answers against correct values for non-MCQ question types.
// Supports numeric, short_text, and formula question types.

// ─── Types ───────────────────────────────────────────────────────────────────

export type GenerationQuestionType = 'numeric' | 'short_text' | 'formula'

export interface MatchResult {
  isCorrect: boolean
  closeness: number // 0–1, where 1 is exact match
}

export interface QuestionMatchData {
  question_type: string
  correct_value: number | null
  value_tolerance: number | null
  accepted_answers: string[] | null
  correct_option_id: string | null
}

// ─── Levenshtein Distance ────────────────────────────────────────────────────

/**
 * Computes Levenshtein edit distance between two strings.
 * Used for fuzzy matching on short_text generation answers.
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length
  const n = b.length

  // Early exits
  if (m === 0) return n
  if (n === 0) return m

  // Use single-row DP for O(min(m,n)) space
  let prev = Array.from({ length: n + 1 }, (_, i) => i)
  let curr = new Array<number>(n + 1)

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }

  return prev[n]
}

// ─── Numeric Answer Matching ─────────────────────────────────────────────────

/**
 * Parses a user-entered string into a number, stripping common formatting:
 * units, commas, whitespace, currency symbols, percent signs.
 * Returns null if unparseable.
 */
const parseNumericInput = (input: string): number | null => {
  // Strip whitespace, commas, currency symbols, unit suffixes
  const cleaned = input
    .trim()
    .replace(/[$%,]/g, '')
    .replace(/\s+/g, '')
    // Remove trailing unit-like text (e.g. "42.5 psi" -> "42.5")
    .replace(/[a-zA-Z]+$/, '')
    .trim()

  if (cleaned === '') return null

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Matches a numeric answer against the correct value within tolerance.
 * Closeness is 1 for exact match, decays linearly based on distance.
 */
export const matchNumericAnswer = (
  userAnswer: string,
  correctValue: number,
  tolerance: number,
): MatchResult => {
  const parsed = parseNumericInput(userAnswer)

  if (parsed === null) {
    return { isCorrect: false, closeness: 0 }
  }

  const diff = Math.abs(parsed - correctValue)
  const isCorrect = diff <= tolerance

  // Closeness: 1 at exact match, decays toward 0 as diff grows
  const denominator = Math.max(Math.abs(correctValue), 1)
  const closeness = Math.max(0, 1 - diff / denominator)

  return { isCorrect, closeness }
}

// ─── Short Text Answer Matching ──────────────────────────────────────────────

/**
 * Normalizes text for comparison: trim, lowercase, collapse whitespace.
 */
const normalizeText = (text: string): string =>
  text.trim().toLowerCase().replace(/\s+/g, ' ')

/**
 * Matches a short text answer against a list of accepted answers.
 * Tries exact match first, then fuzzy match (Levenshtein distance <= 2).
 */
export const matchShortTextAnswer = (
  userAnswer: string,
  acceptedAnswers: string[],
): MatchResult => {
  const normalized = normalizeText(userAnswer)

  if (normalized === '') {
    return { isCorrect: false, closeness: 0 }
  }

  // Pass 1: exact match after normalization
  for (const accepted of acceptedAnswers) {
    if (normalizeText(accepted) === normalized) {
      return { isCorrect: true, closeness: 1 }
    }
  }

  // Pass 2: fuzzy match — Levenshtein distance <= 2
  let bestCloseness = 0

  for (const accepted of acceptedAnswers) {
    const normalizedAccepted = normalizeText(accepted)
    const distance = levenshteinDistance(normalized, normalizedAccepted)
    const maxLen = Math.max(normalized.length, normalizedAccepted.length, 1)
    const closeness = Math.max(0, 1 - distance / maxLen)

    if (distance <= 2) {
      return { isCorrect: true, closeness }
    }

    if (closeness > bestCloseness) {
      bestCloseness = closeness
    }
  }

  return { isCorrect: false, closeness: bestCloseness }
}

// ─── Unified Router ──────────────────────────────────────────────────────────

/**
 * Routes to the appropriate matcher based on question_type.
 * For 'formula', treats as numeric (user enters computed result).
 * Falls back to incorrect for unknown types.
 */
export const matchGenerationAnswer = (
  questionType: string,
  userAnswer: string,
  question: QuestionMatchData,
): MatchResult => {
  switch (questionType) {
    case 'numeric':
    case 'formula': {
      const correctValue = question.correct_value
      if (correctValue === null || correctValue === undefined) {
        return { isCorrect: false, closeness: 0 }
      }
      const tolerance = question.value_tolerance ?? 0
      return matchNumericAnswer(userAnswer, correctValue, tolerance)
    }

    case 'short_text': {
      const acceptedAnswers = question.accepted_answers
      if (!acceptedAnswers || acceptedAnswers.length === 0) {
        return { isCorrect: false, closeness: 0 }
      }
      return matchShortTextAnswer(userAnswer, acceptedAnswers)
    }

    default:
      return { isCorrect: false, closeness: 0 }
  }
}
