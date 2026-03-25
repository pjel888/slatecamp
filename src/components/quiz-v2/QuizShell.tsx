'use client'

import { useState, useCallback } from 'react'
import { QuizHeader } from './QuizHeader'
import { QuizBody } from './QuizBody'
import { QuizFooter } from './QuizFooter'
import type {
  QuizSessionConfig,
  QuestionForClient,
  QuizAnswerState,
  FeedbackData,
} from '@/types/quiz-config'

// Store will be wired here once implemented
// import { useQuizStore } from '@/stores/useQuizStore'

interface QuizShellProps {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
}

const makeEmptyAnswerState = (): QuizAnswerState => ({
  selectedOptionId: null,
  confidenceLevel: null,
  isCorrect: null,
  isSkipped: false,
  isFlagged: false,
  timeStartedMs: Date.now(),
  timeSpentMs: 0,
  submittedAt: null,
})

export const QuizShell = ({ sessionId: _sessionId, config, questions }: QuizShellProps) => {
  // ── Local state (fallback until Zustand store is wired) ──────────────────
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, QuizAnswerState>>(
    () =>
      Object.fromEntries(
        questions.map(q => [q.question_id, makeEmptyAnswerState()]),
      ),
  )
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackData>>({})
  const [paletteOpen, setPaletteOpen] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.question_id] ?? makeEmptyAnswerState())
    : makeEmptyAnswerState()
  const currentFeedback = currentQuestion
    ? (feedbackMap[currentQuestion.question_id] ?? null)
    : null

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.question_id]: {
          ...(prev[currentQuestion.question_id] ?? makeEmptyAnswerState()),
          selectedOptionId: optionId,
        },
      }))
    },
    [currentQuestion],
  )

  const handleConfidenceChange = useCallback(
    (level: 1 | 2 | 3) => {
      if (!currentQuestion) return
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.question_id]: {
          ...(prev[currentQuestion.question_id] ?? makeEmptyAnswerState()),
          confidenceLevel: level,
        },
      }))
    },
    [currentQuestion],
  )

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || !currentAnswer.selectedOptionId) return

    // Mark submitted timestamp
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...(prev[currentQuestion.question_id] ?? makeEmptyAnswerState()),
        submittedAt: new Date().toISOString(),
        timeSpentMs: Date.now() - (prev[currentQuestion.question_id]?.timeStartedMs ?? Date.now()),
      },
    }))

    // For deferred/none feedback timing, skip feedback and advance
    if (config.feedback.timing !== 'immediate') {
      handleNext()
    }
    // For immediate feedback: the store/server action will populate feedbackMap
    // This will be wired via useQuizStore once available
  }, [currentQuestion, currentAnswer, config.feedback.timing])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }, [currentIndex, questions.length])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }, [currentIndex])

  const handleExit = useCallback(() => {
    // Navigation will be handled by store/router integration
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }, [])

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.question_id]: {
        ...(prev[currentQuestion.question_id] ?? makeEmptyAnswerState()),
        isFlagged: !(prev[currentQuestion.question_id]?.isFlagged ?? false),
      },
    }))
  }, [currentQuestion])

  if (!currentQuestion) return null

  const hasAnswered = currentAnswer.selectedOptionId !== null

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]" aria-label="Quiz session">
      <QuizHeader
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={questions.length}
        isFlagged={currentAnswer.isFlagged}
        onExit={handleExit}
        onToggleFlag={config.navigation.bookmarkEnabled ? handleToggleFlag : undefined}
        onOpenPalette={
          config.navigation.questionPalette ? () => setPaletteOpen(true) : undefined
        }
      />

      <main className="flex-1 overflow-hidden">
        <QuizBody
          question={currentQuestion}
          selectedOptionId={currentAnswer.selectedOptionId}
          confidenceLevel={currentAnswer.confidenceLevel}
          feedback={currentFeedback}
          config={config}
          onSelectOption={handleSelectOption}
          onConfidenceChange={handleConfidenceChange}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />
      </main>

      <QuizFooter
        config={config}
        currentPosition={currentIndex + 1}
        totalQuestions={questions.length}
        hasAnswered={hasAnswered}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {/* Palette placeholder — will be wired with QuestionPalette component */}
      {paletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Question palette"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-end"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="bg-white h-full w-72 shadow-lg p-6"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-sm text-[#4A5568]">Question palette — coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}
