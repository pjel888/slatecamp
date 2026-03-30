'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { QuizHeader } from './QuizHeader'
import { QuizBody } from './QuizBody'
import { QuizFooter } from './QuizFooter'
import { QuestionPalette } from './QuestionPalette'
import { ExitConfirmModal } from './ExitConfirmModal'
import { SubmitConfirmModal } from './SubmitConfirmModal'
import { MicroBreakOverlay } from './MicroBreakOverlay'
import { CalculatingResultsOverlay } from './CalculatingResultsOverlay'
import { TimerDisplay } from './TimerDisplay'
import { PacingNudge } from './PacingNudge'
import { WikiSidePanel } from '@/components/shared/WikiSidePanel'
import { endSession as endSessionAction } from '@/lib/actions/quiz-v2'
import { CampfireLoader } from '@/components/shared/CampfireLoader'
import type {
  QuizSessionConfig,
  QuestionForClient,
  FeedbackData,
} from '@/types/quiz-config'

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizShellProps {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export const QuizShell = ({ sessionId, config, questions }: QuizShellProps) => {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initializedRef = useRef(false)

  // ── Store state ───────────────────────────────────────────────────────────

  const status = useQuizStore((s) => s.status)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const totalQuestions = useQuizStore((s) => s.totalQuestions)
  const answers = useQuizStore((s) => s.answers)
  const timerState = useQuizStore((s) => s.timer)
  const feedbackState = useQuizStore((s) => s.feedback)
  const uiState = useQuizStore((s) => s.ui)
  const results = useQuizStore((s) => s.results)
  const storeQuestions = useQuizStore((s) => s.questions)
  const storeSessionId = useQuizStore((s) => s.sessionId)

  // ── Store actions (stable refs) ───────────────────────────────────────────

  const initSession = useQuizStore((s) => s.initSession)
  const getCurrentQuestion = useQuizStore((s) => s.getCurrentQuestion)
  const getAnsweredCount = useQuizStore((s) => s.getAnsweredCount)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const setConfidence = useQuizStore((s) => s.setConfidence)
  const submitCurrentAnswer = useQuizStore((s) => s.submitCurrentAnswer)
  const goNext = useQuizStore((s) => s.goNext)
  const goPrevious = useQuizStore((s) => s.goPrevious)
  const goToQuestion = useQuizStore((s) => s.goToQuestion)
  const toggleFlag = useQuizStore((s) => s.toggleFlag)
  const hideFeedback = useQuizStore((s) => s.hideFeedback)
  const startTimer = useQuizStore((s) => s.startTimer)
  const tickTimer = useQuizStore((s) => s.tickTimer)
  const togglePalette = useQuizStore((s) => s.togglePalette)
  const showExitModal = useQuizStore((s) => s.showExitModal)
  const hideExitModal = useQuizStore((s) => s.hideExitModal)
  const showSubmitModal = useQuizStore((s) => s.showSubmitModal)
  const hideSubmitModal = useQuizStore((s) => s.hideSubmitModal)
  const hideMicroBreak = useQuizStore((s) => s.hideMicroBreak)
  const endSession = useQuizStore((s) => s.endSession)

  // ── Initialize session on mount ───────────────────────────────────────────

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const storeState = useQuizStore.getState()

    // If store already has this session from localStorage hydration, resume
    if (storeState.sessionId === sessionId && storeState.questions.length > 0) {
      // Ensure status is active (not stuck on 'intro' after refresh)
      if (storeState.status === 'intro' || storeState.status === 'idle') {
        useQuizStore.setState({ status: 'active' })
      }
      return
    }

    // Fresh initialization
    initSession({
      sessionId,
      config,
      questions,
      totalQuestions: questions.length,
      readinessScoreBefore: 0,
    })

    // Start timer or set active
    if (config.timer.enabled) {
      startTimer(config.timer.totalSeconds ? config.timer.totalSeconds * 1000 : undefined)
    } else {
      useQuizStore.setState({ status: 'active' })
    }
  }, [sessionId, config, questions, initSession, startTimer])

  // ── Timer tick interval ───────────────────────────────────────────────────

  useEffect(() => {
    if (timerState.isRunning && !timerRef.current) {
      timerRef.current = setInterval(tickTimer, 1000)
    }
    if (!timerState.isRunning && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [timerState.isRunning, tickTimer])

  // ── Navigate to results when session ends ─────────────────────────────────

  useEffect(() => {
    if (status === 'results' && results && storeSessionId === sessionId) {
      router.push(`/quiz/${config.mode}/session/${sessionId}/results`)
    }
  }, [status, results, config.mode, sessionId, storeSessionId, router])

  // ── Derived data ──────────────────────────────────────────────────────────

  const currentQuestion = getCurrentQuestion()
  const currentAnswer = currentQuestion
    ? answers.get(currentQuestion.question_id)
    : undefined

  const flaggedSet = useMemo(() => {
    const set = new Set<string>()
    for (const [qid, ans] of answers) {
      if (ans.isFlagged) set.add(qid)
    }
    return set
  }, [answers])

  const feedbackData: FeedbackData | null =
    feedbackState.visible && feedbackState.questionId
      ? {
          questionId: feedbackState.questionId,
          isCorrect: feedbackState.isCorrect ?? false,
          correctOptionId: feedbackState.correctOptionId ?? '',
          rationale: feedbackState.rationale,
          wikiUrl: feedbackState.wikiUrl,
          errorDiagnostic: feedbackState.errorDiagnostic ?? null,
          closeness: feedbackState.closeness,
          correctAnswer: feedbackState.correctAnswer,
          questionType: feedbackState.questionType,
        }
      : null

  const elapsedSeconds = Math.floor(timerState.elapsedMs / 1000)
  const remainingSeconds =
    timerState.limitMs !== null
      ? Math.max(0, Math.floor((timerState.limitMs - timerState.elapsedMs) / 1000))
      : null

  // For MCQ: any selection counts. For generation: non-empty string counts.
  const hasAnswered = currentAnswer?.selectedOptionId != null && currentAnswer.selectedOptionId !== ''

  // ── Pressure level derived data ─────────────────────────────────────────
  const pressureLevel = config.pressure_level ?? 0
  const questionTimeMs = currentAnswer
    ? Date.now() - currentAnswer.timeStartedMs
    : 0

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return
      selectAnswer(currentQuestion.question_id, optionId)
    },
    [currentQuestion, selectAnswer],
  )

  const handleConfidenceChange = useCallback(
    (level: 1 | 2 | 3) => {
      if (!currentQuestion) return
      setConfidence(currentQuestion.question_id, level)
    },
    [currentQuestion, setConfidence],
  )

  const handleSubmit = useCallback(() => {
    submitCurrentAnswer()
  }, [submitCurrentAnswer])

  const handleNext = useCallback(() => {
    if (feedbackState.visible) {
      hideFeedback()
    }
    goNext()
  }, [feedbackState.visible, hideFeedback, goNext])

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return
    toggleFlag(currentQuestion.question_id)
  }, [currentQuestion, toggleFlag])

  const handleExitConfirm = useCallback(async () => {
    hideExitModal()
    try {
      const result = await endSessionAction({
        sessionId,
        endReason: 'user_exit',
      })
      endSession(result)
    } catch {
      router.push('/dashboard')
    }
  }, [sessionId, hideExitModal, endSession, router])

  const handleSubmitAll = useCallback(async () => {
    hideSubmitModal()
    useQuizStore.setState((s) => ({ ui: { ...s.ui, calculatingResults: true } }))
    try {
      const result = await endSessionAction({
        sessionId,
        endReason: 'completed',
      })
      endSession(result)
    } catch {
      router.push(`/quiz/${config.mode}/session/${sessionId}/results`)
    }
  }, [sessionId, config.mode, hideSubmitModal, endSession, router])

  const handleReviewUnanswered = useCallback(() => {
    hideSubmitModal()
    const state = useQuizStore.getState()
    const firstUnanswered = state.questions.findIndex((q) => {
      const a = state.answers.get(q.question_id)
      return (!a?.selectedOptionId || a.selectedOptionId === '') && !a?.isSkipped
    })
    if (firstUnanswered >= 0) {
      goToQuestion(firstUnanswered)
    }
  }, [hideSubmitModal, goToQuestion])

  const handleFooterNext = useCallback(() => {
    const isLast = currentIndex === totalQuestions - 1
    if (isLast) {
      const answeredCount = getAnsweredCount()
      // If not all answered (100% threshold), show confirmation modal
      if (answeredCount < totalQuestions) {
        showSubmitModal()
      } else {
        void handleSubmitAll()
      }
    } else {
      if (feedbackState.visible) {
        hideFeedback()
      }
      goNext()
    }
  }, [
    currentIndex,
    totalQuestions,
    getAnsweredCount,
    showSubmitModal,
    handleSubmitAll,
    feedbackState.visible,
    hideFeedback,
    goNext,
  ])

  const handlePacingAutoAdvance = useCallback(() => {
    if (!currentQuestion) return
    const state = useQuizStore.getState()
    const ans = state.answers.get(currentQuestion.question_id)
    if (ans && !ans.submittedAt && !ans.isSkipped) {
      // Mark as skipped and advance
      const next = new Map(state.answers)
      next.set(currentQuestion.question_id, {
        ...ans,
        isSkipped: true,
        timeSpentMs: Date.now() - ans.timeStartedMs,
      })
      useQuizStore.setState({ answers: next })
    }
    goNext()
  }, [currentQuestion, goNext])

  const handlePaletteJump = useCallback(
    (index: number) => {
      togglePalette()
      goToQuestion(index)
    },
    [togglePalette, goToQuestion],
  )

  // ── Loading state ─────────────────────────────────────────────────────────

  if (!currentQuestion || status === 'idle' || status === 'loading') {
    return <CampfireLoader />
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-surface-focused" aria-label="Quiz session">
      <QuizHeader
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={totalQuestions}
        isFlagged={currentAnswer?.isFlagged ?? false}
        elapsedSeconds={elapsedSeconds}
        remainingSeconds={remainingSeconds}
        onExit={showExitModal}
        onToggleFlag={config.navigation.bookmarkEnabled ? handleToggleFlag : undefined}
        onOpenPalette={config.navigation.questionPalette ? togglePalette : undefined}
        timerSlot={
          pressureLevel > 0 ? (
            <TimerDisplay
              pressureLevel={pressureLevel}
              totalTimeMs={timerState.limitMs}
              elapsedMs={timerState.elapsedMs}
            />
          ) : undefined
        }
      />

      <main className="flex-1 overflow-hidden relative">
        <QuizBody
          question={currentQuestion}
          selectedOptionId={currentAnswer?.selectedOptionId ?? null}
          confidenceLevel={(currentAnswer?.confidenceLevel as 1 | 2 | 3) ?? null}
          feedback={feedbackData}
          config={config}
          onSelectOption={handleSelectOption}
          onConfidenceChange={handleConfidenceChange}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />
        {/* Pacing nudge for pressure level 2+ */}
        {pressureLevel >= 2 && currentQuestion && (
          <PacingNudge
            pressureLevel={pressureLevel}
            difficultyLabel={currentQuestion.difficulty_label}
            questionTimeMs={questionTimeMs}
            onAutoAdvance={pressureLevel === 3 ? handlePacingAutoAdvance : undefined}
          />
        )}
      </main>

      <QuizFooter
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={totalQuestions}
        hasAnswered={hasAnswered}
        onPrevious={goPrevious}
        onNext={handleFooterNext}
      />

      {/* Question palette — slide-in panel */}
      {uiState.paletteOpen && (
        <QuestionPalette
          questions={storeQuestions}
          answers={answers}
          currentIndex={currentIndex}
          flaggedSet={flaggedSet}
          onJumpTo={handlePaletteJump}
          onClose={togglePalette}
        />
      )}

      {/* Exit confirmation dialog */}
      {uiState.exitModalOpen && (
        <ExitConfirmModal
          answeredCount={getAnsweredCount()}
          totalCount={totalQuestions}
          onContinue={hideExitModal}
          onExit={handleExitConfirm}
        />
      )}

      {/* Submit confirmation dialog */}
      {uiState.submitModalOpen && (
        <SubmitConfirmModal
          questions={storeQuestions}
          answers={answers}
          flaggedSet={flaggedSet}
          currentIndex={currentIndex}
          onReviewUnanswered={handleReviewUnanswered}
          onSubmit={handleSubmitAll}
          onClose={hideSubmitModal}
        />
      )}

      {/* Micro break overlay */}
      {uiState.microBreakVisible && (
        <MicroBreakOverlay
          questionsCompleted={getAnsweredCount()}
          breakDurationSeconds={config.breaks.breakDurationSeconds}
          onContinue={hideMicroBreak}
        />
      )}

      {/* Calculating results overlay */}
      {uiState.calculatingResults && <CalculatingResultsOverlay />}

      {/* Wiki panel — slide-in panel for citations */}
      {uiState.wikiPanelOpen && uiState.wikiPanelUrl && (
        <WikiSidePanel
          url={uiState.wikiPanelUrl}
          onClose={useQuizStore((s) => s.closeWikiPanel)}
        />
      )}
    </div>
  )
}
