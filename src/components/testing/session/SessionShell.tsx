'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, MapTrifold, X } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { QuizOverlay } from '@/components/quiz/QuizOverlay'
import { SaveIndicator } from '@/components/quiz/SaveIndicator'
import { ConfirmSubmitSheet } from '@/components/quiz/ConfirmSubmitSheet'
import { CampSessionBehavior } from './CampSessionBehavior'
import { StormSessionBehavior } from './StormSessionBehavior'
import { ChillSessionBehavior } from './ChillSessionBehavior'
import { StormTimerBar } from './StormTimerBar'
import { NavigatorOverlay } from './NavigatorOverlay'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants/routes'
import type { Question, QuizSession } from '@/types/app'
import type {
  AnswerState,
  ConfidenceTag,
  ErrorTag,
  ModeSource,
} from '@/types/testing'

import {
  saveTestingInteraction,
  completeTestingSession,
  updateSessionProgress,
} from '@/lib/actions/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingInteraction {
  question_id: string
  selected_option_id: string | null
  is_correct: boolean | null
  confidence: string | null
  error_type: string | null
  options_eliminated: number | null
  is_flagged: boolean | null
  time_spent_ms: number | null
  answer_changes: number | null
}

interface SessionShellProps {
  session: QuizSession
  questions: Question[]
  existingInteractions?: ExistingInteraction[]
  userId: string
}

// ─── Mode helpers ─────────────────────────────────────────────────────────────

const isStormLike = (source: ModeSource): boolean =>
  ['storm_mode', 'proof_simulation'].includes(source)

const isChillLike = (source: ModeSource): boolean =>
  source === 'chill_mode'

const buildEmptyAnswer = (questionId: string): AnswerState => ({
  questionId,
  selectedOptionId: null,
  isCorrect: null,
  confidenceTag: null,
  errorTags: [],
  eliminatedOptionIds: [],
  isFlagged: false,
  timeSpentMs: 0,
  answerChanges: 0,
})

// ─── Component ────────────────────────────────────────────────────────────────

export const SessionShell = ({
  session,
  questions,
  existingInteractions = [],
  userId: _userId,
}: SessionShellProps) => {
  const router = useRouter()
  const sessionId = session.session_id
  const source: ModeSource = (session.config?.source ?? 'camp_mode') as ModeSource
  const timerEnabled: boolean = session.config?.timerEnabled ?? false
  const timerSeconds: number = session.config?.timerSeconds ?? questions.length * 60

  // ─── State ──────────────────────────────────────────────────────────────────

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    session.current_question_index ?? 0,
  )
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(() => {
    const map = new Map<string, AnswerState>()
    // Seed from existingInteractions for resume support
    for (const interaction of existingInteractions) {
      map.set(interaction.question_id, {
        questionId: interaction.question_id,
        selectedOptionId: interaction.selected_option_id,
        isCorrect: interaction.is_correct,
        confidenceTag: (interaction.confidence as ConfidenceTag | null) ?? null,
        errorTags: interaction.error_type ? ([interaction.error_type] as ErrorTag[]) : [],
        eliminatedOptionIds: [],
        isFlagged: interaction.is_flagged ?? false,
        timeSpentMs: interaction.time_spent_ms ?? 0,
        answerChanges: interaction.answer_changes ?? 0,
      })
    }
    return map
  })
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(() => {
    const set = new Set<string>()
    for (const interaction of existingInteractions) {
      if (interaction.selected_option_id !== null) set.add(interaction.question_id)
    }
    return set
  })
  const [stormConfirmedQuestions, setStormConfirmedQuestions] = useState<Set<string>>(new Set())
  const [showNavigator, setShowNavigator] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'offline'>('idle')
  const [isCompleting, setIsCompleting] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = JSON.parse(localStorage.getItem(`slatecamp_testing_${session.session_id}`) ?? '{}')
        if (typeof cached.remainingSeconds === 'number' && cached.remainingSeconds > 0) {
          return cached.remainingSeconds
        }
      } catch { /* ignore */ }
    }
    return timerSeconds
  })

  // Track time spent per question
  const questionStartTimeRef = useRef<number>(Date.now())
  const pendingSaveRef = useRef<AnswerState | null>(null)

  // LocalStorage key
  const localStorageKey = `slatecamp_testing_${sessionId}`

  // ─── LocalStorage persistence (backup) ────────────────────────────────────

  useEffect(() => {
    try {
      const snapshot = {
        currentIndex,
        answers: Object.fromEntries(answers),
        submittedQuestions: Array.from(submittedQuestions),
        stormConfirmedQuestions: Array.from(stormConfirmedQuestions),
        remainingSeconds,
      }
      localStorage.setItem(localStorageKey, JSON.stringify(snapshot))
    } catch {
      // Ignore storage errors
    }
  }, [currentIndex, answers, submittedQuestions, stormConfirmedQuestions, remainingSeconds, localStorageKey])

  // ─── Storm timer countdown ─────────────────────────────────────────────────

  useEffect(() => {
    if (!timerEnabled || !isStormLike(source)) return
    if (remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerEnabled, source]) // intentionally only on mount

  // ─── Auto-save every 10 seconds ───────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentQuestion = questions[currentIndex]
      if (!currentQuestion) return
      const answer = answers.get(currentQuestion.question_id)
      if (!answer || !answer.selectedOptionId) return

      setSaveStatus('saving')
      try {
        await saveTestingInteraction({
          sessionId,
          questionId: currentQuestion.question_id,
          selectedOptionId: answer.selectedOptionId,
          isCorrect: answer.isCorrect,
          confidenceTag: answer.confidenceTag,
          errorTags: answer.errorTags,
          eliminatedOptionIds: answer.eliminatedOptionIds,
          isFlagged: answer.isFlagged,
          timeSpentMs: answer.timeSpentMs,
          answerChanges: answer.answerChanges,
        })
        setSaveStatus('saved')
      } catch {
        setSaveStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error')
      }
    }, 10_000)

    return () => clearInterval(interval)
  }, [answers, currentIndex, questions, sessionId])

  // ─── Answer mutations ──────────────────────────────────────────────────────

  const currentQuestion = questions[currentIndex]
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.question_id) ?? null : null
  const isCurrentSubmitted = currentQuestion
    ? submittedQuestions.has(currentQuestion.question_id)
    : false
  const isCurrentStormConfirmed = currentQuestion
    ? stormConfirmedQuestions.has(currentQuestion.question_id)
    : false

  const getOrCreateAnswer = useCallback(
    (questionId: string): AnswerState => {
      return answers.get(questionId) ?? buildEmptyAnswer(questionId)
    },
    [answers],
  )

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return
      const qId = currentQuestion.question_id
      const prev = getOrCreateAnswer(qId)
      const wasAlreadySelected = prev.selectedOptionId === optionId
      const updated: AnswerState = {
        ...prev,
        selectedOptionId: wasAlreadySelected ? null : optionId,
        answerChanges: prev.selectedOptionId && !wasAlreadySelected ? prev.answerChanges + 1 : prev.answerChanges,
      }
      setAnswers((m) => new Map(m).set(qId, updated))
    },
    [currentQuestion, getOrCreateAnswer],
  )

  const handleStrikeOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return
      const qId = currentQuestion.question_id
      const prev = getOrCreateAnswer(qId)
      const eliminated = prev.eliminatedOptionIds.includes(optionId)
        ? prev.eliminatedOptionIds.filter((id) => id !== optionId)
        : [...prev.eliminatedOptionIds, optionId]
      setAnswers((m) => new Map(m).set(qId, { ...prev, eliminatedOptionIds: eliminated }))
    },
    [currentQuestion, getOrCreateAnswer],
  )

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return
    const qId = currentQuestion.question_id
    const prev = getOrCreateAnswer(qId)
    setAnswers((m) => new Map(m).set(qId, { ...prev, isFlagged: !prev.isFlagged }))
  }, [currentQuestion, getOrCreateAnswer])

  const handleConfidenceChange = useCallback(
    (tag: ConfidenceTag) => {
      if (!currentQuestion) return
      const qId = currentQuestion.question_id
      const prev = getOrCreateAnswer(qId)
      setAnswers((m) => new Map(m).set(qId, { ...prev, confidenceTag: tag }))
    },
    [currentQuestion, getOrCreateAnswer],
  )

  const handleErrorTagsChange = useCallback(
    (tags: ErrorTag[]) => {
      if (!currentQuestion) return
      const qId = currentQuestion.question_id
      const prev = getOrCreateAnswer(qId)
      setAnswers((m) => new Map(m).set(qId, { ...prev, errorTags: tags }))
    },
    [currentQuestion, getOrCreateAnswer],
  )

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleNavigate = useCallback(
    async (nextIndex: number) => {
      questionStartTimeRef.current = Date.now()
      setCurrentIndex(nextIndex)
      updateSessionProgress(sessionId, nextIndex).catch(() => {})
    },
    [sessionId],
  )

  // ─── Submit answer (Camp / Chill) ──────────────────────────────────────────

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion) return
    const qId = currentQuestion.question_id
    const prev = getOrCreateAnswer(qId)
    if (!prev.selectedOptionId) return

    const isCorrect = prev.selectedOptionId === currentQuestion.correct_option_id
    const timeSpentMs = Date.now() - questionStartTimeRef.current
    const updated: AnswerState = { ...prev, isCorrect, timeSpentMs }

    setAnswers((m) => new Map(m).set(qId, updated))
    setSubmittedQuestions((s) => new Set(s).add(qId))

    // Save immediately after submit
    setSaveStatus('saving')
    try {
      await saveTestingInteraction({
        sessionId,
        questionId: qId,
        selectedOptionId: updated.selectedOptionId,
        isCorrect: updated.isCorrect,
        confidenceTag: updated.confidenceTag,
        errorTags: updated.errorTags,
        eliminatedOptionIds: updated.eliminatedOptionIds,
        isFlagged: updated.isFlagged,
        timeSpentMs: updated.timeSpentMs,
        answerChanges: updated.answerChanges,
      })
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [currentQuestion, getOrCreateAnswer, sessionId, currentIndex])

  // ─── Storm: confirm & auto-advance ────────────────────────────────────────

  const handleStormConfirm = useCallback(async () => {
    if (!currentQuestion) return
    const qId = currentQuestion.question_id
    const prev = getOrCreateAnswer(qId)
    if (!prev.selectedOptionId) return

    const timeSpentMs = Date.now() - questionStartTimeRef.current
    const updated: AnswerState = { ...prev, timeSpentMs }

    setAnswers((m) => new Map(m).set(qId, updated))
    setStormConfirmedQuestions((s) => new Set(s).add(qId))

    try {
      await saveTestingInteraction({
        sessionId,
        questionId: qId,
        selectedOptionId: updated.selectedOptionId,
        isCorrect: null, // Storm: correctness deferred until debrief
        confidenceTag: null,
        errorTags: [],
        eliminatedOptionIds: updated.eliminatedOptionIds,
        isFlagged: updated.isFlagged,
        timeSpentMs: updated.timeSpentMs,
        answerChanges: updated.answerChanges,
      })
    } catch {
      // Non-blocking in Storm mode
    }

    // Auto-advance
    if (currentIndex < questions.length - 1) {
      handleNavigate(currentIndex + 1)
    } else {
      setShowConfirmSubmit(true)
    }
  }, [currentQuestion, getOrCreateAnswer, sessionId, currentIndex, questions.length, handleNavigate])

  // ─── Chill: skip ──────────────────────────────────────────────────────────

  const handleSkip = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      handleNavigate(currentIndex + 1)
    } else {
      setShowConfirmSubmit(true)
    }
  }, [currentIndex, questions.length, handleNavigate])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      handleNavigate(currentIndex + 1)
    } else {
      setShowConfirmSubmit(true)
    }
  }, [currentIndex, questions.length, handleNavigate])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) handleNavigate(currentIndex - 1)
  }, [currentIndex, handleNavigate])

  // ─── Complete session ──────────────────────────────────────────────────────

  const handleCompleteSession = useCallback(async () => {
    setIsCompleting(true)
    const result = await completeTestingSession(sessionId)
    if (result.error) {
      console.error('[SessionShell] completeTestingSession:', result.error)
      setIsCompleting(false)
      setSaveStatus('error')
      return
    }
    try { localStorage.removeItem(localStorageKey) } catch { /* ignore */ }
    router.push(ROUTES.TESTING_DEBRIEF(sessionId))
  }, [sessionId, localStorageKey, router])

  const handleExit = useCallback(() => {
    router.push(ROUTES.TESTING)
  }, [router])

  const handleTimerExpire = useCallback(() => {
    setShowConfirmSubmit(true)
  }, [])

  const isStorm = isStormLike(source)
  const isChill = isChillLike(source)

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept when navigator is open or confirm sheet is open
      if (showNavigator || showConfirmSubmit) return
      const canAdvance = isStorm ? isCurrentStormConfirmed : isCurrentSubmitted
      if (e.key === 'ArrowRight' && canAdvance) handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showNavigator, showConfirmSubmit, isCurrentSubmitted, isCurrentStormConfirmed, isStorm, handleNext, handlePrev])

  // ─── Derived counts ───────────────────────────────────────────────────────

  const answeredCount = Array.from(answers.values()).filter((a) => a.selectedOptionId).length
  const flaggedCount = Array.from(answers.values()).filter((a) => a.isFlagged).length
  const unansweredCount = questions.length - answeredCount
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isFlagged = currentAnswer?.isFlagged ?? false
  const answeredCountForChill = Array.from(submittedQuestions).length

  if (!currentQuestion) {
    return (
      <QuizOverlay aria-label="Testing session">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="max-w-sm space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">No Questions Available</h2>
            <p className="text-sm text-text-secondary">
              This session could not load any questions. This can happen when your discipline has no questions yet or the session was created with an empty question set.
            </p>
            <button
              type="button"
              onClick={handleExit}
              className="mt-4 h-9 px-6 rounded-sm bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#1535A8] transition-colors"
            >
              Back to Testing
            </button>
          </div>
        </div>
      </QuizOverlay>
    )
  }

  return (
    <QuizOverlay aria-label="Testing session">
      {/* Storm timer bar — absolute top, above everything */}
      {isStorm && timerEnabled && (
        <StormTimerBar
          totalSeconds={timerSeconds}
          remainingSeconds={remainingSeconds}
          onExpire={handleTimerExpire}
        />
      )}

      {/* Progress bar */}
      <div
        className="h-1 w-full bg-[#EEF2FC] shrink-0"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-label="Session progress"
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="shrink-0 border-b border-border bg-[#F5F7FA]">
        <div className="max-w-[720px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          {/* Left: counter */}
          <span className="text-[13px] font-bold text-text-primary tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>

          {/* Center: save indicator */}
          <div className="flex-1 flex justify-center">
            <SaveIndicator status={saveStatus} />
          </div>

          {/* Right: flag + navigator + exit */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleFlag}
              aria-label={isFlagged ? 'Remove flag' : 'Flag for review'}
              aria-pressed={isFlagged}
              className={cn(
                'flex items-center gap-1.5 h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
                isFlagged
                  ? 'bg-[#FEF8ED] text-warning border border-warning/20'
                  : 'text-text-tertiary hover:bg-[#EEF2FC] hover:text-text-secondary',
              )}
            >
              <SCIcon icon={Flag} size="xs" weight={isFlagged ? 'fill' : 'regular'} />
              <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNavigator(true)}
              aria-label="Open question navigator"
              aria-expanded={showNavigator}
              className="flex items-center gap-1.5 h-8 px-3 rounded-sm text-[11px] font-black uppercase tracking-widest text-text-tertiary hover:bg-[#EEF2FC] hover:text-text-secondary transition-colors"
            >
              <SCIcon icon={MapTrifold} size="xs" />
              <span className="hidden sm:inline">Navigator</span>
            </button>

            <div className="w-px h-4 bg-border mx-1" aria-hidden />

            <button
              type="button"
              onClick={handleExit}
              aria-label="Exit session"
              className="h-8 w-8 flex items-center justify-center rounded-sm text-text-tertiary hover:text-text-secondary hover:bg-[#EEF2FC] transition-colors"
            >
              <SCIcon icon={X} size="sm" />
            </button>
          </div>
        </div>
      </header>

      {/* Question area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-8 py-6">
          {isStorm ? (
            <StormSessionBehavior
              question={currentQuestion}
              answer={currentAnswer}
              isConfirmed={isCurrentStormConfirmed}
              onSelectOption={handleSelectOption}
              onStrikeOption={handleStrikeOption}
              onConfirm={handleStormConfirm}
            />
          ) : isChill ? (
            <ChillSessionBehavior
              question={currentQuestion}
              answer={currentAnswer}
              isSubmitted={isCurrentSubmitted}
              answeredCount={answeredCountForChill}
              subjectLabel={currentQuestion.subject_id ?? null}
              onSelectOption={handleSelectOption}
              onStrikeOption={handleStrikeOption}
              onSubmit={handleSubmitAnswer}
              onSkip={handleSkip}
              onEndSession={() => setShowConfirmSubmit(true)}
            />
          ) : (
            <CampSessionBehavior
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={questions.length}
              answer={currentAnswer}
              isSubmitted={isCurrentSubmitted}
              subjectLabel={currentQuestion.subject_id ?? null}
              onSelectOption={handleSelectOption}
              onStrikeOption={handleStrikeOption}
              onSubmit={handleSubmitAnswer}
              onConfidenceChange={handleConfidenceChange}
              onErrorTagsChange={handleErrorTagsChange}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-border bg-[#F5F7FA]">
        <div className="max-w-[720px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
          {/* Previous */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous question"
            className={cn(
              'flex items-center gap-2 h-9 px-4 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
              currentIndex > 0
                ? 'border border-border text-text-secondary hover:bg-[#EEF2FC]/50 hover:text-primary'
                : 'border border-border/50 text-text-tertiary/40 cursor-not-allowed',
            )}
          >
            ← Previous
          </button>

          {/* Chill: End Session always visible */}
          {isChill && (
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              aria-label="End session"
              className="h-9 px-4 rounded-sm border border-border text-text-tertiary hover:text-text-secondary hover:bg-[#F5F5F5] text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              End Session
            </button>
          )}

          {/* Next / Finish */}
          {!isChill && (
            <button
              type="button"
              onClick={
                currentIndex === questions.length - 1
                  ? () => setShowConfirmSubmit(true)
                  : handleNext
              }
              disabled={isStorm ? !isCurrentStormConfirmed : !isCurrentSubmitted}
              aria-label={currentIndex === questions.length - 1 ? 'Finish session' : 'Next question'}
              className={cn(
                'flex items-center gap-2 h-9 px-4 rounded-sm text-[11px] font-black uppercase tracking-widest transition-colors',
                (isStorm ? isCurrentStormConfirmed : isCurrentSubmitted)
                  ? 'bg-primary text-white hover:bg-[#1535A8]'
                  : 'bg-zinc-100 text-zinc-300 cursor-not-allowed',
              )}
            >
              {currentIndex === questions.length - 1 ? 'Finish →' : 'Next →'}
            </button>
          )}
        </div>
      </footer>

      {/* Navigator overlay */}
      {showNavigator && (
        <NavigatorOverlay
          totalQuestions={questions.length}
          answers={answers}
          questionIds={questions.map((q) => q.question_id)}
          currentIndex={currentIndex}
          onJump={handleNavigate}
          onClose={() => setShowNavigator(false)}
        />
      )}

      {/* Confirm submit sheet */}
      <ConfirmSubmitSheet
        isOpen={showConfirmSubmit}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        totalCount={questions.length}
        isSaving={isCompleting}
        onConfirm={handleCompleteSession}
        onCancel={() => setShowConfirmSubmit(false)}
        onExit={handleExit}
      />
    </QuizOverlay>
  )
}
