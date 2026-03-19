/**
 * Churn Risk — DS Report triple-condition model:
 * 1. Score velocity ≤ 0 for 10+ consecutive days
 * 2. Last session > 5 days ago
 * 3. Exam date > 45 days away (low urgency)
 *
 * Risk: 0 (safe), 0.33, 0.67, or 1.0 (high risk)
 */

export const computeChurnRisk = (params: {
  scoreVelocity: number
  lastSessionAt: Date | null
  targetExamDate: Date | null
  velocityNegativeSinceDays: number
}): { risk: number; isHighRisk: boolean } => {
  const { lastSessionAt, targetExamDate, velocityNegativeSinceDays } = params

  let riskFactors = 0

  // Condition 1: velocity stalled 10+ days
  if (velocityNegativeSinceDays >= 10) riskFactors++

  // Condition 2: last session > 5 days ago
  if (lastSessionAt) {
    const daysSinceSession =
      (Date.now() - lastSessionAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceSession > 5) riskFactors++
  } else {
    riskFactors++ // never had a session
  }

  // Condition 3: exam > 45 days away (low urgency)
  if (targetExamDate) {
    const daysToExam =
      (targetExamDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysToExam > 45) riskFactors++
  } else {
    riskFactors++ // no exam date set (low commitment)
  }

  const risk = Math.round((riskFactors / 3) * 100) / 100
  return { risk, isHighRisk: riskFactors === 3 }
}
