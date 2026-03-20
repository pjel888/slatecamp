/**
 * Resolves the correct option ID for a question.
 * Handles both the current schema (correct_option_id) and legacy field (correct_answer).
 */
export const getCorrectOptionId = (question: { correct_option_id?: string | null; correct_answer?: string | null }): string | null =>
  question.correct_option_id ?? question.correct_answer ?? null
