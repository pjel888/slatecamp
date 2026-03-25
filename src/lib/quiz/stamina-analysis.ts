// ─── Stamina Analysis (Doc 5 §9) ────────────────────────────────────────────
// Analyzes accuracy over time blocks to detect cognitive fatigue

import type { StaminaBlock } from '@/types/quiz-config'

interface AnswerForStamina {
  is_correct: boolean | null
  time_spent_ms: number | null
}

/** Analyze stamina across blocks of questions */
export const analyzeStamina = (
  answers: AnswerForStamina[],
  blockSize: number = 25,
): StaminaBlock[] => {
  const blocks: StaminaBlock[] = []

  for (let i = 0; i < answers.length; i += blockSize) {
    const block = answers.slice(i, i + blockSize)
    const answered = block.filter((a) => a.is_correct !== null)
    const correct = answered.filter((a) => a.is_correct === true).length
    const totalTime = block.reduce((sum, a) => sum + (a.time_spent_ms ?? 0), 0)

    blocks.push({
      blockNumber: Math.floor(i / blockSize) + 1,
      questionRange: [i + 1, Math.min(i + blockSize, answers.length)],
      accuracy: answered.length > 0 ? correct / answered.length : 0,
      avgTimePerQuestion: answered.length > 0 ? totalTime / answered.length : 0,
    })
  }

  return blocks
}

/** Detect fatigue pattern from stamina blocks */
export const detectFatigue = (blocks: StaminaBlock[]) => {
  if (blocks.length < 2) {
    return { hasFatigue: false, accuracyDrop: 0, timeIncrease: 0 }
  }

  const firstBlock = blocks[0]
  const lastBlock = blocks[blocks.length - 1]

  const accuracyDrop = firstBlock.accuracy - lastBlock.accuracy
  const timeIncrease = lastBlock.avgTimePerQuestion > 0 && firstBlock.avgTimePerQuestion > 0
    ? (lastBlock.avgTimePerQuestion - firstBlock.avgTimePerQuestion) / firstBlock.avgTimePerQuestion
    : 0

  return {
    hasFatigue: accuracyDrop > 0.15 || timeIncrease > 0.30,
    accuracyDrop: Math.round(accuracyDrop * 100),
    timeIncrease: Math.round(timeIncrease * 100),
    message: accuracyDrop > 0.15
      ? `Your accuracy dropped ${Math.round(accuracyDrop * 100)}% in the final third. Extended Practice sessions can help build stamina.`
      : undefined,
  }
}
