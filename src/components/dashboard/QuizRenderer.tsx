'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Warning } from '@phosphor-icons/react'
import { getCorrectOptionId } from '@/lib/utils/question'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { Question, QuizSession, Choice } from '@/types/app'
import { updateQuizSession, savePreSessionConfidence, saveErrorType, checkAndGetRelearningQuestions, getSessionQuestions } from '@/lib/actions/quiz'
import {
  playCorrectSound,
  playCompletionSound,
} from '@/lib/audio/feedbackSounds'
import { ResultsSummary } from './ResultsSummary'
import { useNoteContext } from '@/lib/context/note-context'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

import {
  QuizOverlay,
  QuizHeader,
  QuestionStem,
  TimerBar,
  ConfirmSubmitSheet,
  QuestionMap,
  ConfidenceCheckScreen,
  RestudyLoop,
} from '@/components/quiz'
import type { QuestionDotState } from '@/components/quiz'
import type { ConfidenceLevel } from '@/components/quiz/ConfidenceToggle'

import {
  useQuizPersistence,
  persistToLS,
  clearLS,
} from '@/hooks/quiz/useQuizPersistence'
import { useQuizTimer } from '@/hooks/quiz/useQuizTimer'
import { useQuizTelemetry } from '@/hooks/quiz/useQuizTelemetry'

import { QuizOptions } from './QuizOptions'
import { QuizActionButtons } from './QuizActionButtons'
import { QuizDrawers } from './QuizDrawers'
import { QuizFooterNav } from './QuizFooterNav'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizRendererProps {
  session: QuizSession
  questions: Question[]
  initialInteractions: any[]
  onExit: () => void
}

// ─── LocalStorage helpers ────────────────────────────────────────────────────

const LS_KEY = (sessionId: string) => `slatecamp_quiz_${sessionId}`

function restoreFromLS(sessionId: string) {
  try {
    const raw = localStorage.getItem(LS_KEY(sessionId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function QuizRenderer({
  session,
  questions,
  initialInteractions,
  onExit,
}: QuizRendererProps) {
  const mode = session.test_mode
  const strictMode = mode === 'storm' || mode === 'proof_sim'
  const showConfidenceCheck = mode === 'camp' || mode === 'storm'
  const router = useRouter()
  const sessionStartRef = useRef<number>(Date.now())

  // ── Pre-session confidence phase ────────────────────────────────────────
  const [confidencePhase, setConfidencePhase] = useState<'check' | 'quiz'>(
    showConfidenceCheck ? 'check' : 'quiz',
  )
  const [preSessionConfidence, setPreSessionConfidence] = useState<Record<string, number>>({})

  // ── Error taxonomy (post-wrong-answer prompt in camp mode) ─────────────
  const [showErrorPrompt, setShowErrorPrompt] = useState(false)
  const [errorPromptQuestionId, setErrorPromptQuestionId] = useState<string | null>(null)

  // ── Successive relearning (Feature 6) ───────────────────────────────────
  const [showRestudyLoop, setShowRestudyLoop] = useState(false)
  const [restudyQuestionIds, setRestudyQuestionIds] = useState<string[]>([])
  const [restudyTopicName, setRestudyTopicName] = useState('')
  const restudyCheckInFlight = useRef(false)

  // ── Core state ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(
    () => session.current_question_index || 0,
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [sessionDurationMs, setSessionDurationMs] = useState<number | undefined>()
  const [isRationaleVisible, setIsRationaleVisible] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isSubmitSheetOpen, setIsSubmitSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)

  // ── Quiz state — restored from LS on mount ───────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const ls = restoreFromLS(session.session_id)
    if (ls) return ls.answers
    const init: Record<string, string> = {}
    initialInteractions.forEach((i) => {
      if (i.selected_option_id) init[i.question_id] = i.selected_option_id
    })
    return init
  })

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(() => {
    const ls = restoreFromLS(session.session_id)
    if (ls) return new Set<string>(ls.flags)
    const init = new Set<string>()
    initialInteractions.forEach((i) => {
      if (i.is_flagged) init.add(i.question_id)
    })
    return init
  })

  const [struckOptions, setStruckOptions] = useState<Record<string, Set<string>>>(() => {
    const ls = restoreFromLS(session.session_id)
    if (ls) {
      const restored: Record<string, Set<string>> = {}
      Object.entries(ls.strikes || {}).forEach(([qId, arr]) => {
        restored[qId] = new Set(arr as string[])
      })
      return restored
    }
    const init: Record<string, Set<string>> = {}
    questions.forEach((q) => { init[q.question_id] = new Set() })
    return init
  })

  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(() => {
    const init = new Set<string>()
    initialInteractions.forEach((i) => {
      if (!strictMode && i.selected_option_id && (mode === 'camp' || mode === 'chill' || mode === 'blindspot')) {
        init.add(i.question_id)
      }
    })
    return init
  })

  // ── Confidence map (new metacognitive feature) ────────────────────────────
  const [confidenceMap, setConfidenceMap] = useState<Record<string, ConfidenceLevel>>({})

  // answer change tracking for telemetry
  const answerChangesRef = useRef<Record<string, number>>({})

  // Ref for programmatic scroll reset on question change
  const stemScrollRef = useRef<HTMLDivElement>(null)

  // ── Persistence hook ──────────────────────────────────────────────────────
  const getState = useCallback(() => ({
    answers,
    flags: Array.from(flaggedQuestions),
    strikes: Object.fromEntries(
      Object.entries(struckOptions).map(([k, v]) => [k, Array.from(v)]),
    ),
    currentIndex,
  }), [answers, flaggedQuestions, struckOptions, currentIndex])

  const {
    saveStatus,
    setSaveStatus,
    isOnline,
  } = useQuizPersistence({
    sessionId: session.session_id,
    getState,
  })

  // ── Timer hook ────────────────────────────────────────────────────────────
  const {
    countdown,
    totalTimerSeconds,
    isAheadOfPace,
    isTimerMinimized,
    setIsTimerMinimized,
    dwellTimeRemaining,
    startDwell,
    clearDwell,
    resetQuestionTimer,
    getQuestionElapsedMs,
  } = useQuizTimer({
    strictMode,
    totalQuestions: questions.length,
    currentIndex,
    onTimeUp: () => handleFinalSubmit(),
  })

  // ── Telemetry hook ────────────────────────────────────────────────────────
  const {
    trackNavigation,
    startRationaleTimer,
    getRationaleViewMs,
    persistInteraction,
  } = useQuizTelemetry({
    sessionId: session.session_id,
    questions,
    isOnline,
    setSaveStatus,
  })

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []
  const correctOptionId = getCorrectOptionId(currentQuestion ?? {})
  const isChecked = !strictMode && checkedQuestions.has(currentQuestion?.question_id)
  const selectedAnswer = answers[currentQuestion?.question_id]
  const isFlagged = flaggedQuestions.has(currentQuestion?.question_id)
  const confidence = confidenceMap[currentQuestion?.question_id] ?? null

  const dots = useMemo(
    () => questions.map((q, idx) => {
      let state: QuestionDotState = 'unanswered'
      if (idx === currentIndex) state = 'current'
      else if (flaggedQuestions.has(q.question_id)) state = 'flagged'
      else if (answers[q.question_id]) state = 'answered'
      return { index: idx, state }
    }),
    [questions, currentIndex, answers, flaggedQuestions],
  )

  const getOptionState = useCallback((option: Choice) => {
    const isSelected = selectedAnswer === option.id
    const isCorrectOpt = option.id === correctOptionId
    const isStruck = struckOptions[currentQuestion?.question_id]?.has(option.id)

    if (!isChecked) {
      if (isSelected) return 'selected' as const
      if (isStruck) return 'struck' as const
      return 'default' as const
    }
    if (isCorrectOpt) return 'correct' as const
    if (isSelected && !isCorrectOpt) return 'wrong' as const
    return 'faded' as const
  }, [selectedAnswer, correctOptionId, struckOptions, currentQuestion?.question_id, isChecked])

  // ── Note context ──────────────────────────────────────────────────────────
  const { setAnchor, clearAnchor } = useNoteContext()

  useEffect(() => {
    if (!currentQuestion) return
    setAnchor({
      question_id: currentQuestion.question_id,
      question_text: currentQuestion.text,
      topic_id: currentQuestion.topic_id,
      session_id: session.session_id,
      source_url: '/dashboard/review',
    })
    return () => clearAnchor()
  }, [currentQuestion?.question_id, session.session_id, setAnchor, clearAnchor])

  // ── Scroll left column to top on question change ──────────────────────────
  useEffect(() => {
    stemScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [currentIndex])

  // ── Focus loss in strict mode ─────────────────────────────────────────────
  useEffect(() => {
    if (!strictMode || session.status === 'completed') return
    const handleFocusLoss = async () => {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        setIsAutoSubmitting(true)
        try {
          await updateQuizSession(session.session_id, { status: 'completed' })
        } catch (error) {
          console.error('Auto-submit failed:', error)
        } finally {
          clearLS(session.session_id)
          setIsCompleted(true)
        }
      }
    }
    window.addEventListener('blur', handleFocusLoss)
    document.addEventListener('visibilitychange', handleFocusLoss)
    return () => {
      window.removeEventListener('blur', handleFocusLoss)
      document.removeEventListener('visibilitychange', handleFocusLoss)
    }
  }, [strictMode, session.session_id, session.status])

  // ── Keyboard shortcuts: A/B/C/D/E to select options ───────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isCompleted || isSubmitSheetOpen) return
      const qChecked = checkedQuestions.has(currentQuestion?.question_id)
      if (qChecked) return

      const idx = ['a', 'b', 'c', 'd', 'e'].indexOf(e.key.toLowerCase())
      if (idx !== -1 && options[idx]) {
        handleChoiceSelect(options[idx].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentQuestion, options, checkedQuestions, isCompleted, isSubmitSheetOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Track rationale visibility for telemetry ──────────────────────────────
  useEffect(() => {
    if (isRationaleVisible) {
      startRationaleTimer()
    }
  }, [isRationaleVisible, startRationaleTimer])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChoiceSelect = (choiceId: string) => {
    const qId = currentQuestion.question_id
    if (!strictMode && checkedQuestions.has(qId)) return

    if (answers[qId] && answers[qId] !== choiceId) {
      answerChangesRef.current[qId] = (answerChangesRef.current[qId] || 0) + 1
    }

    const next = { ...answers, [qId]: choiceId }
    setAnswers(next)

    // Persist to LS immediately
    persistToLS(session.session_id, {
      answers: next,
      flags: Array.from(flaggedQuestions),
      strikes: Object.fromEntries(
        Object.entries(struckOptions).map(([k, v]) => [k, Array.from(v)]),
      ),
      currentIndex,
    })

    // Chill mode: auto-reveal
    if (mode === 'chill') {
      setCheckedQuestions((prev) => new Set(prev).add(qId))
      const isCorrect = choiceId === correctOptionId
      if (isCorrect) playCorrectSound()
      setIsRationaleVisible(true)
      persistInteraction({
        questionId: qId,
        optionId: choiceId,
        isFlagged: flaggedQuestions.has(qId),
        eliminatedCount: struckOptions[qId]?.size || 0,
        confidence: confidenceMap[qId] ?? null,
        answerChanges: answerChangesRef.current[qId] || 0,
        timeSpentMs: getQuestionElapsedMs(),
      })
    }
  }

  const toggleStrikethrough = (choiceId: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    const qId = currentQuestion.question_id
    if (!strictMode && checkedQuestions.has(qId)) return
    setStruckOptions((prev) => {
      const currentSet = prev[qId] || new Set()
      const next = new Set(currentSet)
      if (next.has(choiceId)) next.delete(choiceId)
      else next.add(choiceId)
      return { ...prev, [qId]: next }
    })
  }

  const toggleFlag = () => {
    const qId = currentQuestion.question_id
    setFlaggedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }

  const handleCheckAnswer = () => {
    const qId = currentQuestion.question_id
    const answer = answers[qId]
    const rationaleMs = getRationaleViewMs()

    persistInteraction({
      questionId: qId,
      optionId: answer || null,
      isFlagged: flaggedQuestions.has(qId),
      eliminatedCount: struckOptions[qId]?.size || 0,
      confidence: confidenceMap[qId] ?? null,
      answerChanges: answerChangesRef.current[qId] || 0,
      timeSpentMs: getQuestionElapsedMs(),
      rationaleViewMs: rationaleMs,
    })

    if (strictMode) {
      handleNext()
      return
    }

    setCheckedQuestions((prev) => new Set(prev).add(qId))
    setIsRationaleVisible(true)

    const isCorrect = answer === correctOptionId
    if (isCorrect && !strictMode) playCorrectSound()
    if (mode === 'camp' || mode === 'blindspot') {
      startDwell(isCorrect)
    }

    // Error taxonomy: show prompt after wrong answers in camp mode
    if (!isCorrect && mode === 'camp') {
      setShowErrorPrompt(true)
      setErrorPromptQuestionId(currentQuestion.question_id)

      // Feature 6: Check for successive relearning trigger (async, non-blocking)
      if (!restudyCheckInFlight.current) {
        restudyCheckInFlight.current = true
        checkAndGetRelearningQuestions(
          currentQuestion.question_id,
          currentQuestion.topic_id,
          questions.map((q) => q.question_id),
        ).then((result) => {
          if (result.isRepeatFailure && result.restudyQuestionIds.length > 0) {
            setRestudyQuestionIds(result.restudyQuestionIds)
            setRestudyTopicName(currentQuestion.subject_id || currentQuestion.topic_id)
          }
          restudyCheckInFlight.current = false
        }).catch(() => {
          restudyCheckInFlight.current = false
        })
      }
    }
  }

  const handleNext = useCallback(() => {
    // Feature 6: If restudy questions are queued, show the loop first
    if (restudyQuestionIds.length > 0 && !showRestudyLoop) {
      setShowRestudyLoop(true)
      setIsRationaleVisible(false)
      setShowErrorPrompt(false)
      clearDwell()
      return
    }

    const prevIndex = currentIndex
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsRationaleVisible(false)
      setIsAIOpen(false)
      clearDwell()
      resetQuestionTimer()
      trackNavigation(prevIndex, currentIndex + 1)
    } else if (strictMode) {
      handleFinalSubmit()
    }
  }, [currentIndex, questions.length, strictMode, clearDwell, resetQuestionTimer, trackNavigation, restudyQuestionIds, showRestudyLoop]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestudyComplete = () => {
    setShowRestudyLoop(false)
    setRestudyQuestionIds([])
    setRestudyTopicName('')
    // Now advance to next question
    const prevIndex = currentIndex
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsRationaleVisible(false)
      setIsAIOpen(false)
      clearDwell()
      resetQuestionTimer()
      trackNavigation(prevIndex, currentIndex + 1)
    }
  }

  const handleBack = () => {
    const prevIndex = currentIndex
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsRationaleVisible(false)
      setIsAIOpen(false)
      clearDwell()
      resetQuestionTimer()
      trackNavigation(prevIndex, currentIndex - 1)
    }
  }

  const handleJump = (idx: number) => {
    if (strictMode) return
    const prevIndex = currentIndex
    setCurrentIndex(idx)
    setIsRationaleVisible(false)
    setIsAIOpen(false)
    clearDwell()
    resetQuestionTimer()
    trackNavigation(prevIndex, idx)
  }

  const handleFinalSubmit = async () => {
    setIsSaving(true)
    try {
      await updateQuizSession(session.session_id, { status: 'completed' })
    } catch (error) {
      console.error('Final submit DB update failed:', error)
    } finally {
      const duration = Date.now() - sessionStartRef.current
      trackEvent({ event_name: 'quiz_session_completed', event_properties: { test_mode: mode, score: Object.entries(answers).filter(([qId, ans]) => { const q = questions.find(qq => qq.question_id === qId); return q && ans === getCorrectOptionId(q) }).length, duration_ms: duration }, session_id: session.session_id })

      clearLS(session.session_id)
      setIsSaving(false)
      setIsSubmitSheetOpen(false)
      setSessionDurationMs(duration)
      playCompletionSound()
      setIsCompleted(true)
    }
  }

  // ── Derive unique subject names for confidence check ─────────────────────
  const subjectNamesForConfidence = useMemo(() => {
    const unique = new Set<string>()
    questions.forEach((q) => {
      if (q.subject_id) unique.add(q.subject_id)
    })
    return Array.from(unique)
  }, [questions])

  const handleConfidenceSubmit = async (ratings: Record<string, number>) => {
    setPreSessionConfidence(ratings)
    setConfidencePhase('quiz')
    // Fire and forget — never block quiz start
    savePreSessionConfidence(session.session_id, ratings).catch(() => {})
  }

  const handleConfidenceSkip = () => {
    setConfidencePhase('quiz')
    // Save empty ratings
    savePreSessionConfidence(session.session_id, {}).catch(() => {})
  }

  // ── Error taxonomy handler ──────────────────────────────────────────────
  const handleErrorTypeSelect = (errorType: string) => {
    if (errorPromptQuestionId) {
      saveErrorType(session.session_id, errorPromptQuestionId, errorType).catch(() => {})
    }
    setShowErrorPrompt(false)
    setErrorPromptQuestionId(null)
  }

  const handleErrorTypeSkip = () => {
    setShowErrorPrompt(false)
    setErrorPromptQuestionId(null)
  }

  const handleOpenSubmitSheet = () => setIsSubmitSheetOpen(true)

  // ── Render ────────────────────────────────────────────────────────────────

  if (confidencePhase === 'check' && !isCompleted) {
    return (
      <QuizOverlay>
        <ConfidenceCheckScreen
          subjectNames={subjectNamesForConfidence}
          onSubmit={handleConfidenceSubmit}
          onSkip={handleConfidenceSkip}
        />
      </QuizOverlay>
    )
  }

  if (isCompleted) {
    return (
      <ResultsSummary
        questions={questions}
        answers={answers}
        testMode={mode}
        sessionId={session.session_id}
        sessionDurationMs={sessionDurationMs}
        preSessionConfidence={preSessionConfidence}
        onExit={onExit}
        onRestart={onExit}
        onStartFocusedReview={(topicIds) => { onExit() }}
        onRetryWrongAnswers={(questionIds) => { onExit() }}
      />
    )
  }

  // Feature 6: Successive relearning loop overlay
  if (showRestudyLoop && restudyQuestionIds.length > 0) {
    return (
      <QuizOverlay>
        <RestudyLoop
          topicName={restudyTopicName}
          questionIds={restudyQuestionIds}
          onComplete={handleRestudyComplete}
        />
      </QuizOverlay>
    )
  }

  if (!currentQuestion) {
    return (
      <QuizOverlay>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 py-10">
          <div className="w-full max-w-sm text-center space-y-4">
            <SCIcon icon={Warning} size="xl" className="text-[#8896A7] mx-auto" />
            <h2 className="text-base font-semibold text-[#1A2332]">No questions loaded</h2>
            <p className="text-sm text-[#4A5568]">
              Something went wrong loading this session. Please go back and try again.
            </p>
            <button
              type="button"
              onClick={onExit}
              className="h-10 px-6 rounded-sm font-bold text-xs uppercase tracking-[0.15em] bg-[#1B3FC4] text-white hover:bg-[#1535A8] transition-colors"
            >
              Back to Review
            </button>
          </div>
        </div>
      </QuizOverlay>
    )
  }

  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const flaggedCount = flaggedQuestions.size

  return (
    <QuizOverlay>
      {/* Integrity violation overlay (strict mode focus loss) */}
      {isAutoSubmitting && (
        <div className='absolute inset-0 z-[100] bg-white/90 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg shadow-lg border border-border text-center space-y-3 max-w-xs'>
            <SCIcon icon={Warning} size='xl' className='text-[#4A5568] mx-auto' />
            <h2 className='text-lg font-bold text-[#1A2332]'>Session Recorded</h2>
            <p className='text-[#4A5568] text-sm'>
              Your session ended when focus left the window. All your answers have been saved.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <QuizHeader
        mode={mode}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        isFlagged={isFlagged}
        saveStatus={saveStatus}
        isSubjectMode={session.config?.isSubjectMode}
        isTargeted={session.config?.topic_ids?.length > 0}
        onFlag={toggleFlag}
        onAI={() => setIsAIOpen((prev) => !prev)}
        onExit={() => {
          if (strictMode) {
            handleFinalSubmit()
          } else {
            setIsSubmitSheetOpen(true)
          }
        }}
        questionMap={
          <QuestionMap
            dots={dots}
            currentIndex={currentIndex}
            onJump={handleJump}
            disabled={strictMode}
          />
        }
      />

      {/* Timer bar — strict mode only */}
      {strictMode && countdown !== null && (
        <div className='shrink-0 px-5 py-2 border-b border-border bg-[#F5F7FA] flex justify-center'>
          <TimerBar
            totalSeconds={totalTimerSeconds}
            remainingSeconds={countdown}
            isAheadOfPace={isAheadOfPace}
            isMinimized={isTimerMinimized}
            onToggleMinimize={() => setIsTimerMinimized((prev) => !prev)}
          />
        </div>
      )}

      {/* ═══ SPLIT-SCREEN CONTENT AREA ═══ */}
      <div className='flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-2'>
        {/* ─── LEFT COLUMN: Scrollable stem ─── */}
        <div
          ref={stemScrollRef}
          className='flex-1 lg:flex-none overflow-y-auto lg:border-r border-border'
        >
          <div className='max-w-[640px] mx-auto px-5 py-6 space-y-6'>
            <div key={currentIndex} className='animate-in fade-in duration-100'>
              <QuestionStem
                text={currentQuestion.text}
                imageUrl={currentQuestion.prompt_image_url}
              />
            </div>

            {/* Mobile only: options, actions, drawers inline below stem */}
            <div className='lg:hidden space-y-6'>
              <QuizOptions
                options={options}
                getOptionState={getOptionState}
                isChecked={isChecked}
                onSelect={handleChoiceSelect}
                onStrike={toggleStrikethrough}
              />
              <QuizActionButtons
                mode={mode}
                strictMode={strictMode}
                isChecked={isChecked}
                isRationaleVisible={isRationaleVisible}
                selectedAnswer={selectedAnswer}
                isSaving={isSaving}
                confidence={confidence}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                dwellTimeRemaining={dwellTimeRemaining}
                onConfidenceChange={(level) => setConfidenceMap((prev) => ({ ...prev, [currentQuestion.question_id]: level }))}
                onShowRationale={() => setIsRationaleVisible(true)}
                onCheckAnswer={handleCheckAnswer}
                onNext={handleNext}
                onFinish={handleOpenSubmitSheet}
              />
              <QuizDrawers
                currentQuestion={currentQuestion}
                options={options}
                correctOptionId={correctOptionId}
                selectedAnswer={selectedAnswer}
                isChecked={isChecked}
                isRationaleVisible={isRationaleVisible}
                isAIOpen={isAIOpen}
                showErrorPrompt={showErrorPrompt}
                errorPromptQuestionId={errorPromptQuestionId}
                onRationaleClose={() => setIsRationaleVisible(false)}
                onWikiClick={() => {
                  const isWrong = selectedAnswer !== correctOptionId
                  const base = `/dashboard/wiki?nodeId=${currentQuestion.topic_id}`
                  const params = isWrong ? `${base}&from=wrong-answer&topic=${encodeURIComponent(currentQuestion.text.slice(0, 60))}` : base
                  router.push(params)
                }}
                onAddNote={() => { /* note drawer — future */ }}
                on3DLabClick={
                  currentQuestion.model_id
                    ? () => router.push(`/dashboard/3d-lab?model=${currentQuestion.model_id}`)
                    : undefined
                }
                onErrorTypeSelect={handleErrorTypeSelect}
                onErrorTypeSkip={handleErrorTypeSkip}
                onAIClose={() => setIsAIOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Stationary options + drawers + nav (desktop) ─── */}
        <div className='hidden lg:flex flex-col'>
          <div className='flex-1 overflow-y-auto px-6 pt-6 pb-3 space-y-6'>
            <QuizOptions
              options={options}
              getOptionState={getOptionState}
              isChecked={isChecked}
              onSelect={handleChoiceSelect}
              onStrike={toggleStrikethrough}
            />
            <QuizActionButtons
              mode={mode}
              strictMode={strictMode}
              isChecked={isChecked}
              isRationaleVisible={isRationaleVisible}
              selectedAnswer={selectedAnswer}
              isSaving={isSaving}
              confidence={confidence}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              dwellTimeRemaining={dwellTimeRemaining}
              onConfidenceChange={(level) => setConfidenceMap((prev) => ({ ...prev, [currentQuestion.question_id]: level }))}
              onShowRationale={() => setIsRationaleVisible(true)}
              onCheckAnswer={handleCheckAnswer}
              onNext={handleNext}
              onFinish={handleOpenSubmitSheet}
            />
            <QuizDrawers
              currentQuestion={currentQuestion}
              options={options}
              correctOptionId={correctOptionId}
              selectedAnswer={selectedAnswer}
              isChecked={isChecked}
              isRationaleVisible={isRationaleVisible}
              isAIOpen={isAIOpen}
              showErrorPrompt={showErrorPrompt}
              errorPromptQuestionId={errorPromptQuestionId}
              onRationaleClose={() => setIsRationaleVisible(false)}
              onWikiClick={() => {
                const isWrong = selectedAnswer !== correctOptionId
                const base = `/dashboard/wiki?nodeId=${currentQuestion.topic_id}`
                const params = isWrong ? `${base}&from=wrong-answer&topic=${encodeURIComponent(currentQuestion.text.slice(0, 60))}` : base
                router.push(params)
              }}
              onAddNote={() => { /* note drawer — future */ }}
              on3DLabClick={
                currentQuestion.model_id
                  ? () => router.push(`/dashboard/3d-lab?model=${currentQuestion.model_id}`)
                  : undefined
              }
              onErrorTypeSelect={handleErrorTypeSelect}
              onErrorTypeSkip={handleErrorTypeSkip}
              onAIClose={() => setIsAIOpen(false)}
            />
          </div>
          <div className='shrink-0'>
            <QuizFooterNav
              dots={dots}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              mode={mode}
              strictMode={strictMode}
              isChecked={isChecked}
              onPrev={handleBack}
              onNext={handleNext}
              onFinish={handleOpenSubmitSheet}
              onJump={handleJump}
            />
          </div>
        </div>
      </div>

      {/* Mobile only: fixed bottom navigation bar */}
      <div className='lg:hidden'>
        <QuizFooterNav
          dots={dots}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          mode={mode}
          strictMode={strictMode}
          isChecked={isChecked}
          onPrev={handleBack}
          onNext={handleNext}
          onFinish={handleOpenSubmitSheet}
          onJump={handleJump}
        />
      </div>

      {/* Submit confirmation sheet */}
      <ConfirmSubmitSheet
        isOpen={isSubmitSheetOpen}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        totalCount={questions.length}
        isSaving={isSaving}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsSubmitSheetOpen(false)}
        onExit={() => {
          trackEvent({ event_name: 'quiz_session_abandoned', event_properties: { test_mode: mode, questions_answered: Object.keys(answers).length, total_questions: questions.length }, session_id: session.session_id })
          setIsSubmitSheetOpen(false)
          onExit()
        }}
      />
    </QuizOverlay>
  )
}
