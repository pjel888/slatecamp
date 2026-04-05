'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useQuizStore } from '@/stores/useQuizStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { QuizHeader } from './QuizHeader'
import { QuizBody } from './QuizBody'
import { QuizFooter } from './QuizFooter'
import { TimerDisplay } from './TimerDisplay'
import { TimerTicker } from './TimerTicker'
import { PacingNudge } from './PacingNudge'
import { endSession as endSessionAction, getSessionQuestions } from '@/lib/actions/quiz-v2'
import { QuestionSkeleton } from './QuestionSkeleton'
import type { GestureSignalEvent } from '@/types/patent'
import type {
  QuizSessionConfig,
  QuestionForClient,
  FeedbackData,
} from '@/types/quiz-config'

// ─── Dynamic Imports (Boundary Realignment) ──────────────────────────────────

const QuestionPalette = dynamic(() => import('./QuestionPalette').then(m => m.QuestionPalette), { ssr: false })
const ExitConfirmModal = dynamic(() => import('./ExitConfirmModal').then(m => m.ExitConfirmModal), { ssr: false })
const SubmitConfirmModal = dynamic(() => import('./SubmitConfirmModal').then(m => m.SubmitConfirmModal), { ssr: false })
const MicroBreakOverlay = dynamic(() => import('./MicroBreakOverlay').then(m => m.MicroBreakOverlay), { ssr: false })
const CalculatingResultsOverlay = dynamic(() => import('./CalculatingResultsOverlay').then(m => m.CalculatingResultsOverlay), { ssr: false })
const WikiSidePanel = dynamic(() => import('@/components/shared/WikiSidePanel').then(m => m.WikiSidePanel), { ssr: false })

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuizShellProps {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
  allQuestionIds: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Isolated subscription for the palette to prevent Shell re-renders */
const WrappedQuestionPalette = ({ 
  questions, currentIndex, onJumpTo, onClose 
}: { 
  questions: QuestionForClient[], currentIndex: number, onJumpTo: (idx: number) => void, onClose: () => void 
}) => {
  const answers = useQuizStore(s => s.answers)
  const flaggedSet = useMemo(() => {
    const set = new Set<string>()
    for (const [qid, ans] of Object.entries(answers)) {
      if (ans.isFlagged) set.add(qid)
    }
    return set
  }, [answers])
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

/** Isolated subscription for the submit modal to prevent Shell re-renders */
const WrappedSubmitModal = ({
  questions, currentIndex, onReviewUnanswered, onSubmit, onClose
}: {
  questions: QuestionForClient[], currentIndex: number, onReviewUnanswered: () => void, onSubmit: () => void, onClose: () => void
}) => {
  const answers = useQuizStore(s => s.answers)
  const flaggedSet = useMemo(() => {
    const set = new Set<string>()
    for (const [qid, ans] of Object.entries(answers)) {
      if (ans.isFlagged) set.add(qid)
    }
    return set
  }, [answers])
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

export const QuizShell = ({ sessionId, config, questions, allQuestionIds }: QuizShellProps) => {
  const router = useRouter()
  const initializedRef = useRef(false)
  const directionRef = useRef<'forward' | 'backward'>('forward')
  const reducedMotion = useReducedMotion()

  // ── Store state (Granular Selectors to isolate re-renders) ────────────────

  const _hasHydrated = useQuizStore((s) => s._hasHydrated)
  const status = useQuizStore((s) => s.status)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const totalQuestions = useQuizStore((s) => s.totalQuestions)
  const addQuestions = useQuizStore((s) => s.addQuestions)

  // ── Background Hydration (Boundary Realignment) ──────────────────────────

  useEffect(() => {
    if (!_hasHydrated) return

    const remainingIds = allQuestionIds.slice(questions.length)
    if (remainingIds.length === 0) return

    // Fetch remainder in background batches of 50
    const BATCH_SIZE = 50
    const fetchRemaining = async () => {
      for (let i = 0; i < remainingIds.length; i += BATCH_SIZE) {
        const batchIds = remainingIds.slice(i, i + BATCH_SIZE)
        try {
          const batchData = await getSessionQuestions(sessionId, batchIds, questions.length + i)
          addQuestions(batchData)
        } catch (err) {
          console.error('Failed to fetch background questions:', err)
        }
      }
    }

    void fetchRemaining()
  }, [_hasHydrated, sessionId, allQuestionIds, questions.length, addQuestions])
  
  // Select only the current answer state to avoid re-rendering on other question updates
  // We use primitive selectors or carefully memoized objects
  const currentAnswerId = useQuizStore((s) => {
    const q = s.questions[s.currentIndex]
    return q ? s.answers[q.question_id]?.selectedOptionId : null
  })
  
  const currentAnswerConfidence = useQuizStore((s) => {
    const q = s.questions[s.currentIndex]
    return q ? s.answers[q.question_id]?.confidenceLevel : null
  })

  const currentAnswerIsFlagged = useQuizStore((s) => {
    const q = s.questions[s.currentIndex]
    return q ? s.answers[q.question_id]?.isFlagged : false
  })

  // Select only what's needed from timer
  const timerIsRunning = useQuizStore((s) => s.timer.isRunning)

  // Granular feedback state
  const feedbackVisible = useQuizStore((s) => s.feedback.visible)
  const feedbackQuestionId = useQuizStore((s) => s.feedback.questionId)
  const feedbackIsCorrect = useQuizStore((s) => s.feedback.isCorrect)
  const feedbackCorrectOptionId = useQuizStore((s) => s.feedback.correctOptionId)
  const feedbackRationale = useQuizStore((s) => s.feedback.rationale)
  const feedbackWikiUrl = useQuizStore((s) => s.feedback.wikiUrl)
  const feedbackErrorDiagnostic = useQuizStore((s) => s.feedback.errorDiagnostic)
  const feedbackCloseness = useQuizStore((s) => s.feedback.closeness)
  const feedbackCorrectAnswer = useQuizStore((s) => s.feedback.correctAnswer)
  const feedbackQuestionType = useQuizStore((s) => s.feedback.questionType)

  // Granular UI state
  const paletteOpen = useQuizStore((s) => s.ui.paletteOpen)
  const wikiPanelOpen = useQuizStore((s) => s.ui.wikiPanelOpen)
  const wikiPanelUrl = useQuizStore((s) => s.ui.wikiPanelUrl)
  const exitModalOpen = useQuizStore((s) => s.ui.exitModalOpen)
  const submitModalOpen = useQuizStore((s) => s.ui.submitModalOpen)
  const microBreakVisible = useQuizStore((s) => s.ui.microBreakVisible)
  const calculatingResults = useQuizStore((s) => s.ui.calculatingResults)

  const results = useQuizStore((s) => s.results)
  const storeQuestions = useQuizStore((s) => s.questions)
  const storeSessionId = useQuizStore((s) => s.sessionId)
  
  const reset = useQuizStore((s) => s.reset)
  const updateSettings = useQuizStore((s) => s.updateSettings)

  // ── Store actions (stable refs) ───────────────────────────────────────────

  const initSession = useQuizStore((s) => s.initSession)
  const getCurrentQuestion = useQuizStore((s) => s.getCurrentQuestion)
  const getAnsweredCount = useQuizStore((s) => s.getAnsweredCount)
  const getFlaggedSet = useQuizStore((s) => s.getFlaggedSet)
  const getFeedbackData = useQuizStore((s) => s.getFeedbackData)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const setConfidence = useQuizStore((s) => s.setConfidence)
  const submitCurrentAnswer = useQuizStore((s) => s.submitCurrentAnswer)
  const goNext = useQuizStore((s) => s.goNext)
  const goPrevious = useQuizStore((s) => s.goPrevious)
  const goToQuestion = useQuizStore((s) => s.goToQuestion)
  const toggleFlag = useQuizStore((s) => s.toggleFlag)
  const hideFeedback = useQuizStore((s) => s.hideFeedback)
  const startTimer = useQuizStore((s) => s.startTimer)
  const togglePalette = useQuizStore((s) => s.togglePalette)
  const showExitModal = useQuizStore((s) => s.showExitModal)
  const hideExitModal = useQuizStore((s) => s.hideExitModal)
  const showSubmitModal = useQuizStore((s) => s.showSubmitModal)
  const hideSubmitModal = useQuizStore((s) => s.hideSubmitModal)
  const hideMicroBreak = useQuizStore((s) => s.hideMicroBreak)
  const endSession = useQuizStore((s) => s.endSession)

  // ── Sync browser settings post-mount ─────────────────────────────────────

  useEffect(() => {
    // Standardize on a hydration-safe pattern for browser-dependent state
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    updateSettings({ reducedMotion: prefersReducedMotion })
  }, [updateSettings])

  // ── Initialize session on mount ───────────────────────────────────────────

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const storeState = useQuizStore.getState()

    if (storeState.sessionId === sessionId && storeState.questions.length > 0) {
      if (storeState.status === 'intro' || storeState.status === 'idle') {
        useQuizStore.setState({ status: 'active' })
      }
    } else {
      initSession({
        sessionId,
        config,
        questions,
        totalQuestions: questions.length,
        readinessScoreBefore: 0,
      })

      if (config.timer.enabled) {
        startTimer(config.timer.totalSeconds ? config.timer.totalSeconds * 1000 : undefined)
      } else {
        useQuizStore.setState({ status: 'active' })
      }
    }

    return () => {
      // Memory Cleanup Protocol: Flush heavy Maps/Sets when leaving the quiz
      // We check if the session is essentially "over" (results shown) or if 
      // the user is navigating away from an active session.
      const state = useQuizStore.getState()
      if (state.status === 'results' || state.status === 'idle') {
        reset()
      }
    }
  }, [sessionId, config, questions, initSession, startTimer, reset])

  // ── Navigate to results when session ends ─────────────────────────────────

  useEffect(() => {
    if (status === 'results' && results && storeSessionId === sessionId) {
      router.push(`/quiz/${config.mode}/session/${sessionId}/results`)
    }
  }, [status, results, config.mode, sessionId, storeSessionId, router])


  // ── Derived data ──────────────────────────────────────────────────────────

  const currentQuestion = getCurrentQuestion()
  const feedbackData = getFeedbackData()

  // For MCQ: any selection counts. For generation: non-empty string counts.
  const hasAnswered = currentAnswerId != null && currentAnswerId !== ''

  const pressureLevel = config.pressure_level ?? 0

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

  const handleSubmit = useCallback((signalTrace?: GestureSignalEvent[]) => {
    submitCurrentAnswer(signalTrace)
  }, [submitCurrentAnswer])

  const handleNext = useCallback(() => {
    directionRef.current = 'forward'
    if (feedbackVisible) {
      hideFeedback()
    }
    goNext()
  }, [feedbackVisible, hideFeedback, goNext])

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
      const a = state.answers[q.question_id]
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
      if (answeredCount < totalQuestions) {
        showSubmitModal()
      } else {
        void handleSubmitAll()
      }
    } else {
      directionRef.current = 'forward'
      if (feedbackVisible) {
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
    feedbackVisible,
    hideFeedback,
    goNext,
  ])

  const handlePrevious = useCallback(() => {
    directionRef.current = 'backward'
    goPrevious()
  }, [goPrevious])

  const handlePacingAutoAdvance = useCallback(() => {
    if (!currentQuestion) return
    const state = useQuizStore.getState()
    const ans = state.answers[currentQuestion.question_id]
    if (ans && !ans.submittedAt && !ans.isSkipped) {
      const next = {
        ...state.answers,
        [currentQuestion.question_id]: {
          ...ans,
          isSkipped: true,
          timeSpentMs: Date.now() - ans.timeStartedMs,
        },
      }
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

  if (!_hasHydrated || !currentQuestion || status === 'idle' || status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-surface-focused">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-white">
          <div className="flex-1 h-1.5 rounded-full bg-border" />
        </div>
        <main className="flex-1">
          <QuestionSkeleton />
        </main>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-surface-focused" aria-label="Quiz session">
      {/* 1Hz Pulse Isolation */}
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
            <TimerDisplay
              pressureLevel={pressureLevel}
            />
          ) : undefined
        }
      />

      <main className="flex-1 overflow-hidden relative">
        <div
          className={cn(
            'w-full h-full',
            !reducedMotion && 'animate-in fade-in duration-200 ease-out',
            !reducedMotion && directionRef.current === 'forward' && 'slide-in-from-right-2',
            !reducedMotion && directionRef.current === 'backward' && 'slide-in-from-left-2',
          )}
        >
          <QuizBody
            question={currentQuestion}
            selectedOptionId={currentAnswerId}
            confidenceLevel={(currentAnswerConfidence as 1 | 2 | 3) ?? null}
            feedback={feedbackData}
            config={config}
            onSelectOption={handleSelectOption}
            onConfidenceChange={handleConfidenceChange}
            onSubmit={handleSubmit}
            onNext={handleNext}
          />
        </div>
        {/* Pacing nudge for pressure level 2+ */}
        {pressureLevel >= 2 && currentQuestion && (
          <PacingNudge
            pressureLevel={pressureLevel}
            difficultyLabel={currentQuestion.difficulty_label}
            questionId={currentQuestion.question_id}
            onAutoAdvance={pressureLevel === 3 ? handlePacingAutoAdvance : undefined}
          />
        )}
      </main>

      <QuizFooter
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={totalQuestions}
        hasAnswered={hasAnswered}
        onPrevious={handlePrevious}
        onNext={handleFooterNext}
      />

      {/* Question palette — slide-in panel */}
      {paletteOpen && (
        <WrappedQuestionPalette
          questions={storeQuestions}
          currentIndex={currentIndex}
          onJumpTo={handlePaletteJump}
          onClose={togglePalette}
        />
      )}

      {/* Exit confirmation dialog */}
      {exitModalOpen && (
        <ExitConfirmModal
          answeredCount={getAnsweredCount()}
          totalCount={totalQuestions}
          onContinue={hideExitModal}
          onExit={handleExitConfirm}
        />
      )}

      {/* Submit confirmation dialog */}
      {submitModalOpen && (
        <WrappedSubmitModal
          questions={storeQuestions}
          currentIndex={currentIndex}
          onReviewUnanswered={handleReviewUnanswered}
          onSubmit={handleSubmitAll}
          onClose={hideSubmitModal}
        />
      )}

      {/* Micro break overlay */}
      {microBreakVisible && (
        <MicroBreakOverlay
          questionsCompleted={getAnsweredCount()}
          breakDurationSeconds={config.breaks.breakDurationSeconds}
          onContinue={hideMicroBreak}
        />
      )}

      {/* Calculating results overlay */}
      {calculatingResults && <CalculatingResultsOverlay />}

      {/* Wiki panel — slide-in panel for citations */}
      {wikiPanelOpen && wikiPanelUrl && (
        <WikiSidePanel
          url={wikiPanelUrl}
          onClose={useQuizStore((s) => s.closeWikiPanel)}
        />
      )}
    </div>
  )
}
