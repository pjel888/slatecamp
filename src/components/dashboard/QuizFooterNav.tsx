'use client'

import { FooterNavigator } from '@/components/quiz'
import type { QuestionDotState } from '@/components/quiz'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizFooterNavProps {
  dots: { index: number; state: QuestionDotState }[]
  currentIndex: number
  totalQuestions: number
  mode: string
  strictMode: boolean
  isChecked: boolean
  onPrev: () => void
  onNext: () => void
  onFinish: () => void
  onJump: (idx: number) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const QuizFooterNav = ({
  dots,
  currentIndex,
  totalQuestions,
  mode,
  strictMode,
  isChecked,
  onPrev,
  onNext,
  onFinish,
  onJump,
}: QuizFooterNavProps) => (
  <FooterNavigator
    dots={dots}
    currentIndex={currentIndex}
    canGoBack={currentIndex > 0}
    canGoForward={mode === 'chill' ? true : isChecked}
    strictMode={strictMode}
    onPrev={onPrev}
    onNext={
      currentIndex === totalQuestions - 1
        ? onFinish
        : onNext
    }
    onJump={onJump}
  />
)
