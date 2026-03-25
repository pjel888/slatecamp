// ─── Confidence Calibration (Doc 5 §8) ──────────────────────────────────────
// Tracks how well a student's confidence matches their actual accuracy

interface CalibrationInput {
  confidenceLevel: 1 | 2 | 3 | null
  isCorrect: boolean
}

export interface CalibrationResult {
  overconfidenceRate: number
  luckyGuessRate: number
  calibrationScore: number
  totalWithConfidence: number
  summary: string
}

/** Compute calibration metrics from a set of answers */
export const computeCalibration = (answers: CalibrationInput[]): CalibrationResult => {
  const withConfidence = answers.filter((a) => a.confidenceLevel !== null)

  if (withConfidence.length === 0) {
    return {
      overconfidenceRate: 0,
      luckyGuessRate: 0,
      calibrationScore: 0,
      totalWithConfidence: 0,
      summary: 'No confidence data available.',
    }
  }

  // Overconfident: said "Very sure" (3) but got it wrong
  const verySure = withConfidence.filter((a) => a.confidenceLevel === 3)
  const overconfident = verySure.filter((a) => !a.isCorrect)
  const overconfidenceRate = verySure.length > 0
    ? overconfident.length / verySure.length
    : 0

  // Lucky guess: said "Guessing" (1) but got it correct
  const guessing = withConfidence.filter((a) => a.confidenceLevel === 1)
  const luckyGuess = guessing.filter((a) => a.isCorrect)
  const luckyGuessRate = guessing.length > 0
    ? luckyGuess.length / guessing.length
    : 0

  // Calibration score: correlation between confidence and accuracy
  // Perfect calibration = 1.0 (high confidence → correct, low → wrong)
  let matchCount = 0
  for (const a of withConfidence) {
    const expectedCorrect = (a.confidenceLevel ?? 2) >= 2
    if (expectedCorrect === a.isCorrect) matchCount++
  }
  const calibrationScore = matchCount / withConfidence.length

  // Generate summary
  let summary = ''
  if (overconfidenceRate > 0.3) {
    summary = `You were overconfident ${Math.round(overconfidenceRate * 100)}% of the time when "Very sure." Focus on verifying before committing.`
  } else if (luckyGuessRate > 0.5) {
    summary = `${Math.round(luckyGuessRate * 100)}% of your guesses were correct — these topics need reinforcement to turn luck into mastery.`
  } else if (calibrationScore > 0.8) {
    summary = 'Your confidence closely matches your accuracy. Strong self-awareness.'
  } else {
    summary = 'Your confidence calibration is developing. Keep tracking to improve.'
  }

  return {
    overconfidenceRate,
    luckyGuessRate,
    calibrationScore,
    totalWithConfidence: withConfidence.length,
    summary,
  }
}
