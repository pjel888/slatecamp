'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useQuizStore } from '@/stores/useQuizStore'
import { cn } from '@/lib/utils'
import { QuizHeader } from './QuizHeader'
import { QuizFooter } from './QuizFooter'
import { TimerDisplay } from './TimerDisplay'
import { TimerTicker } from './TimerTicker'
import { CalculatingResultsOverlay } from './CalculatingResultsOverlay'
import { QuestionSkeleton } from './QuestionSkeleton'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { QuizSessionConfig } from '@/types/quiz-config'

// ─── Dynamic Imports ─────────────────────────────────────────────────────────

const QuestionPalette = dynamic(() => import('./QuestionPalette').then(m => m.QuestionPalette), { ssr: false })
const ExitConfirmModal = dynamic(() => import('./ExitConfirmModal').then(m => m.ExitConfirmModal), { ssr: false })
const SubmitConfirmModal = dynamic(() => import('./SubmitConfirmModal').then(m => m.SubmitConfirmModal), { ssr: false })
const MicroBreakOverlay = dynamic(() => import('./MicroBreakOverlay').then(m => m.MicroBreakOverlay), { ssr: false })
const WikiSidePanel = dynamic(() => import('@/components/shared/WikiSidePanel').then(m => m.WikiSidePanel), { ssr: false })

// ─── Props ────────────────────────────────────────────────────────────────────

interface BaseQuizShellProps {
  config: QuizSessionConfig
  children: ReactNode
  direction?: 'forward' | 'backward'
  showPacingNudge?: boolean
  pacingNudgeSlot?: ReactNode
  onExit: () => void
  onSubmitAll: () => void
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const useAnswersSnapshot = () => {
  const answersVersion = useQuizStore((s) => s.answersVersion)
  return useQuizStore.getState().answers
}

const WrappedQuestionPalette = ({ 
  questions, currentIndex, onJumpTo, onClose 
}: { 
  questions: any[], currentIndex: number, onJumpTo: (idx: number) => void, onClose: () => void 
}) => {
  const answers = useAnswersSnapshot()
  const flaggedSet = useQuizStore((s) => s.flaggedSet)
  return (
    <QuestionPalette
      questions={questions}
      answers={answers}
      currentIndex={currentIndex}
      flaggedSet={flaggedSet}
      onJumpTo={onJumpTo}
      onClose={onClose}
    />
  )
}

const WrappedSubmitModal = ({
  questions, currentIndex, onReviewUnanswered, onSubmit, onClose
}: {
  questions: any[], currentIndex: number, onReviewUnanswered: () => void, onSubmit: () => void, onClose: () => void
}) => {
  const answers = useAnswersSnapshot()
  const flaggedSet = useQuizStore((s) => s.flaggedSet)
  return (
    <SubmitConfirmModal
      questions={questions}
      answers={answers}
      flaggedSet={flaggedSet}
      currentIndex={currentIndex}
      onReviewUnanswered={onReviewUnanswered}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  )
}

/**
 * BaseQuizShell provides the common layout and modals for all quiz modes.
 * It does NOT handle session initialization or complex mode logic.
 */
export const BaseQuizShell = ({
  config,
  children,
  direction = 'forward',
  showPacingNudge,
  pacingNudgeSlot,
  onExit,
  onSubmitAll,
}: BaseQuizShellProps) => {
  const reducedMotion = useReducedMotion()

  // Granular store state
  const status = useQuizStore((s) => s.status)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const totalQuestions = useQuizStore((s) => s.totalQuestions)
  const storeQuestions = useQuizStore((s) => s.questions)
  const _hasHydrated = useQuizStore((s) => s._hasHydrated)

  // UI state
  const paletteOpen = useQuizStore((s) => s.ui.paletteOpen)
  const wikiPanelOpen = useQuizStore((s) => s.ui.wikiPanelOpen)
  const wikiPanelUrl = useQuizStore((s) => s.ui.wikiPanelUrl)
  const exitModalOpen = useQuizStore((s) => s.ui.exitModalOpen)
  const submitModalOpen = useQuizStore((s) => s.ui.submitModalOpen)
  const microBreakVisible = useQuizStore((s) => s.ui.microBreakVisible)
  const calculatingResults = useQuizStore((s) => s.ui.calculatingResults)

  // Granular answer state for header
  const currentAnswerIsFlagged = useQuizStore((s) => {
    const q = s.questions[s.currentIndex]
    return q ? s.answers[q.question_id]?.isFlagged : false
  })

  // Actions
  const toggleFlag = useQuizStore((s) => s.toggleFlag)
  const togglePalette = useQuizStore((s) => s.togglePalette)
  const showExitModal = useQuizStore((s) => s.showExitModal)
  const hideExitModal = useQuizStore((s) => s.hideExitModal)
  const showSubmitModal = useQuizStore((s) => s.showSubmitModal)
  const hideSubmitModal = useQuizStore((s) => s.hideSubmitModal)
  const hideMicroBreak = useQuizStore((s) => s.hideMicroBreak)
  const goToQuestion = useQuizStore((s) => s.goToQuestion)
  const goNext = useQuizStore((s) => s.goNext)
  const goPrevious = useQuizStore((s) => s.goPrevious)
  const closeWikiPanel = useQuizStore((s) => s.closeWikiPanel)
  const getAnsweredCount = useQuizStore((s) => s.getAnsweredCount)

  // Derived
  const pressureLevel = config.pressure_level ?? 0
  const currentQuestion = storeQuestions[currentIndex]
  const hasAnswered = useQuizStore((s) => {
    const q = s.questions[s.currentIndex]
    const a = q ? s.answers[q.question_id] : null
    return a?.selectedOptionId != null && a.selectedOptionId !== ''
  })

  // Handlers
  const handleToggleFlag = () => {
    if (currentQuestion) toggleFlag(currentQuestion.question_id)
  }

  const handlePaletteJump = (index: number) => {
    togglePalette()
    goToQuestion(index)
  }

  const handleReviewUnanswered = () => {
    hideSubmitModal()
    const firstUnanswered = storeQuestions.findIndex((q) => {
      const a = useQuizStore.getState().answers[q.question_id]
      return (!a?.selectedOptionId || a.selectedOptionId === '') && !a?.isSkipped
    })
    if (firstUnanswered >= 0) goToQuestion(firstUnanswered)
  }

  // Loading state
  if (!_hasHydrated || !currentQuestion || status === 'idle' || status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-surface-focused">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card">
          <div className="flex-1 h-1.5 rounded-full bg-border" />
        </div>
        <main className="flex-1">
          <QuestionSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-focused" aria-label="Quiz session">
      <TimerTicker />

      <QuizHeader
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={totalQuestions}
        isFlagged={currentAnswerIsFlagged}
        onExit={showExitModal}
        onToggleFlag={config.navigation.bookmarkEnabled ? handleToggleFlag : undefined}
        onOpenPalette={config.navigation.questionPalette ? togglePalette : undefined}
        timerSlot={
          pressureLevel > 0 ? (
            <TimerDisplay pressureLevel={pressureLevel} />
          ) : undefined
        }
      />

      <main className="flex-1 overflow-hidden relative">
        <div
          className={cn(
            'w-full h-full',
            !reducedMotion && 'animate-in fade-in duration-200 ease-out',
            !reducedMotion && direction === 'forward' && 'slide-in-from-right-2',
            !reducedMotion && direction === 'backward' && 'slide-in-from-left-2',
          )}
        >
          {children}
        </div>
        {showPacingNudge && pacingNudgeSlot}
      </main>

      <QuizFooter
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={totalQuestions}
        hasAnswered={hasAnswered}
        onPrevious={goPrevious}
        onNext={() => {
          const isLast = currentIndex === totalQuestions - 1
          if (isLast) {
            if (getAnsweredCount() < totalQuestions) showSubmitModal()
            else /* This will be handled by the specialized shell's next handler */ {}
          } else {
            goNext()
          }
        }}
      />

      {/* Exit confirmation dialog */}
      {exitModalOpen && (
        <ExitConfirmModal
          answeredCount={getAnsweredCount()}
          totalCount={totalQuestions}
          onContinue={hideExitModal}
          onExit={onExit}
        />
      )}

      {/* Submit confirmation dialog */}
      {submitModalOpen && (
        <WrappedSubmitModal
          questions={storeQuestions}
          currentIndex={currentIndex}
          onReviewUnanswered={handleReviewUnanswered}
          onSubmit={onSubmitAll}
          onClose={hideSubmitModal}
        />
      )}

      {microBreakVisible && (
        <MicroBreakOverlay
          questionsCompleted={getAnsweredCount()}
          breakDurationSeconds={config.breaks.breakDurationSeconds}
          onContinue={hideMicroBreak}
        />
      )}

      {calculatingResults && <CalculatingResultsOverlay />}

      {wikiPanelOpen && wikiPanelUrl && (
        <WikiSidePanel url={wikiPanelUrl} onClose={closeWikiPanel} />
      )}
    </div>
  )
}
