'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getScoreColor } from '@/components/shared/score-display'

interface ScoreHeroProps {
  correct: number
  total: number
  score: number
}

const getScoreMessage = (score: number): string => {
  if (score >= 80) return "Strong session. You're locking this in."
  if (score >= 60) return 'Solid ground. A few gaps to close — check the breakdown below.'
  if (score >= 40) return "You found the edges of your knowledge. That's exactly the point."
  return 'Tough round. The explanations below are where the real learning happens.'
}

export const ScoreHero = ({ correct, total, score }: ScoreHeroProps) => {
  const colors = getScoreColor(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='text-center mb-10'
    >
      <div className={cn('text-[36px] font-extrabold tabular-nums', colors.text)}>
        {correct} of {total} correct — {score}%
      </div>
      <p className='text-ink-secondary mt-2 text-sm max-w-lg mx-auto'>
        {getScoreMessage(score)}
      </p>
    </motion.div>
  )
}
