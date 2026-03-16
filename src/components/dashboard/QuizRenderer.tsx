'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question, QuizSession, Choice } from '@/types/app'
import { saveInteraction, updateQuizSession } from '@/lib/actions/quiz'
import { ResultsSummary } from './ResultsSummary'
import { useNoteContext } from '@/lib/context/note-context'
import { useRouter } from 'next/navigation'

import {
  QuizOverlay,
  QuizHeader,
  QuestionStem,
  OptionButton,
  FooterNavigator,
  TimerBar,
  RationaleDrawer,
  ConfirmSubmitSheet,
  AITutorDrawer,
} from '@/components/quiz'
import type { OptionState, QuestionDotState } from '@/components/quiz'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizRendererProps {
  session: QuizSession
  questions: Question[]
  initialInteractions: any[]
  onExit: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

// ─── LocalStorage helpers ────────────────────────────────────────────────────

const LS_KEY = (sessionId: string) => `slatecamp_quiz_${sessionId}`

function persistToLS(sessionId: string, state: {
  answers: Record<string, string>
  flags: string[]
  strikes: Record<string, string[]>
  currentIndex: number
}) {
  try {
    localStorage.setItem(LS_KEY(sessionId), JSON.stringify({ ...state, ts: Date.now() }))
  } catch { /* quota exceeded — silently skip */ }
}

function restoreFromLS(sessionId: string) {
  try {
    const raw = localStorage.getItem(LS_KEY(sessionId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearLS(sessionId: string) {
  try { localStorage.removeItem(LS_KEY(sessionId)) } catch { /* ignore */ }
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
  const router = useRouter()

  // ── Core state ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(() => session.current_question_index || 0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isRationaleVisible, setIsRationaleVisible] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isSubmitSheetOpen, setIsSubmitSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

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
    initialInteractions.forEach((i) => { if (i.is_flagged) init.add(i.question_id) })
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

  // answer change tracking for telemetry
  const answerChangesRef = useRef<Record<string, number>>({})

  // ── Timer ─────────────────────────────────────────────────────────────────
  const [countdown, setCountdown] = useState<number | null>(() => {
    if (!strictMode) return null
    return questions.length * 120
  })
  const totalTimerSeconds = questions.length * 120

  useEffect(() => {
    if (!strictMode) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          handleFinalSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [strictMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dwell time ───────────────────────────────────────────────────────────
  const [dwellTimeRemaining, setDwellTimeRemaining] = useState(0)
  const dwellTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startDwell = useCallback((isCorrect: boolean) => {
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current)
    const duration = isCorrect ? 3 : 5
    setDwellTimeRemaining(duration)
    dwellTimerRef.current = setInterval(() => {
      setDwellTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(dwellTimerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // ── Timing per question ───────────────────────────────────────────────────
  const startTimeRef = useRef<number>(Date.now())

  // ── Note context ──────────────────────────────────────────────────────────
  const { setAnchor, clearAnchor } = useNoteContext()
  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []
  const correctOptionId = currentQuestion?.correct_option_id ?? currentQuestion?.correct_answer

  useEffect(() => {
    if (!currentQuestion) return
    setAnchor({
      question_id: currentQuestion.question_id,
      question_text: currentQuestion.text,
      topic_id: currentQuestion.topic_id,
      session_id: session.session_id,
      source_url: '/dashboard/testing',
    })
    return () => clearAnchor()
  }, [currentQuestion?.question_id, session.session_id, setAnchor, clearAnchor])

  // ── Online/offline ────────────────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => { setIsOnline(false); setSaveStatus('offline') }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // ── beforeunload: sync LS write ───────────────────────────────────────────
  useEffect(() => {
    const onUnload = () => {
      persistToLS(session.session_id, {
        answers,
        flags: Array.from(flaggedQuestions),
        strikes: Object.fromEntries(
          Object.entries(struckOptions).map(([k, v]) => [k, Array.from(v)])
        ),
        currentIndex,
      })
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [session.session_id, answers, flaggedQuestions, struckOptions, currentIndex])

  // ── 10-second auto-save (CLAUDE.md mandate) ───────────────────────────────
  const saveQueueRef = useRef<(() => Promise<void>)[]>([])

  const flushSaveQueue = useCallback(async () => {
    while (saveQueueRef.current.length > 0) {
      const fn = saveQueueRef.current.shift()
      if (fn) await fn()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentQuestion) return

      // Always persist to LS synchronously
      persistToLS(session.session_id, {
        answers,
        flags: Array.from(flaggedQuestions),
        strikes: Object.fromEntries(
          Object.entries(struckOptions).map(([k, v]) => [k, Array.from(v)])
        ),
        currentIndex,
      })

      // Debounce DB write
      if (isOnline) {
        try {
          await updateQuizSession(session.session_id, { current_question_index: currentIndex })
        } catch { /* will retry next interval */ }
      }
    }, 10_000)
    return () => clearInterval(interval)
  }, [session.session_id, answers, flaggedQuestions, struckOptions, currentIndex, currentQuestion, isOnline])

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

  // ── Keyboard shortcuts: A/B/C/D to select options ─────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isCompleted || isSubmitSheetOpen) return
      const isChecked = checkedQuestions.has(currentQuestion?.question_id)
      if (isChecked) return

      const idx = ['a', 'b', 'c', 'd', 'e'].indexOf(e.key.toLowerCase())
      if (idx !== -1 && options[idx]) {
        handleChoiceSelect(options[idx].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentQuestion, options, checkedQuestions, isCompleted, isSubmitSheetOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save interaction to DB ─────────────────────────────────────────────────
  const persistInteraction = useCallback(async (qId: string, optionId: string | null, isFlagged: boolean, eliminatedCount: number) => {
    if (!isOnline) return
    const q = questions.find((q) => q.question_id === qId)
    if (!q) return

    setSaveStatus('saving')
    try {
      await saveInteraction({
        session_id: session.session_id,
        question_id: qId,
        topic_id: q.topic_id,
        selected_option_id: optionId,
        is_correct: (optionId || null) === (q.correct_option_id ?? q.correct_answer),
        time_spent_ms: Date.now() - startTimeRef.current,
        is_flagged: isFlagged,
        answer_changes: answerChangesRef.current[qId] || 0,
        options_eliminated: eliminatedCount,
      })
      setSaveStatus('saved')
    } catch (err) {
      console.error('saveInteraction failed:', err)
      setSaveStatus('error')
    }
  }, [session.session_id, questions, isOnline])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChoiceSelect = (choiceId: string) => {
    const qId = currentQuestion.question_id
    if (!strictMode && checkedQuestions.has(qId)) return

    // Track answer changes for telemetry
    if (answers[qId] && answers[qId] !== choiceId) {
      answerChangesRef.current[qId] = (answerChangesRef.current[qId] || 0) + 1
    }

    const next = { ...answers, [qId]: choiceId }
    setAnswers(next)

    // Persist to LS immediately
    persistToLS(session.session_id, {
      answers: next,
      flags: Array.from(flaggedQuestions),
      strikes: Object.fromEntries(Object.entries(struckOptions).map(([k, v]) => [k, Array.from(v)])),
      currentIndex,
    })

    // Chill mode: auto-reveal
    if (mode === 'chill') {
      setCheckedQuestions((prev) => new Set(prev).add(qId))
      setIsRationaleVisible(true)
      persistInteraction(qId, choiceId, flaggedQuestions.has(qId), struckOptions[qId]?.size || 0)
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

    if (strictMode) {
      persistInteraction(qId, answer || null, flaggedQuestions.has(qId), struckOptions[qId]?.size || 0)
      handleNext()
      return
    }

    setCheckedQuestions((prev) => new Set(prev).add(qId))
    setIsRationaleVisible(true)
    persistInteraction(qId, answer || null, flaggedQuestions.has(qId), struckOptions[qId]?.size || 0)

    const isCorrect = answer === correctOptionId
    if (mode === 'camp' || mode === 'blindspot') {
      startDwell(isCorrect)
    }
  }

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsRationaleVisible(false)
      setIsAIOpen(false)
      setDwellTimeRemaining(0)
      startTimeRef.current = Date.now()
    } else if (strictMode) {
      handleFinalSubmit()
    }
  }, [currentIndex, questions.length, strictMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsRationaleVisible(false)
      setIsAIOpen(false)
      setDwellTimeRemaining(0)
      startTimeRef.current = Date.now()
    }
  }

  const handleJump = (idx: number) => {
    if (strictMode) return
    setCurrentIndex(idx)
    setIsRationaleVisible(false)
    setIsAIOpen(false)
    setDwellTimeRemaining(0)
    startTimeRef.current = Date.now()
  }

  const handleFinalSubmit = async () => {
    setIsSaving(true)
    try {
      await updateQuizSession(session.session_id, { status: 'completed' })
    } catch (error) {
      console.error('Final submit DB update failed:', error)
      // Don't block the user — still show results even if DB write fails
    } finally {
      clearLS(session.session_id)
      setIsSaving(false)
      setIsSubmitSheetOpen(false)
      setIsCompleted(true)
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const isChecked = !strictMode && checkedQuestions.has(currentQuestion?.question_id)
  const selectedAnswer = answers[currentQuestion?.question_id]
  const isFlagged = flaggedQuestions.has(currentQuestion?.question_id)

  const isAheadOfPace = useMemo(() => {
    if (countdown === null) return true
    const elapsed = totalTimerSeconds - countdown
    const expected = (currentIndex + 1) * 120
    return elapsed < expected
  }, [countdown, currentIndex, totalTimerSeconds])

  const dots = useMemo(() => questions.map((q, idx) => {
    let state: QuestionDotState = 'unanswered'
    if (idx === currentIndex) state = 'current'
    else if (flaggedQuestions.has(q.question_id)) state = 'flagged'
    else if (answers[q.question_id]) state = 'answered'
    return { index: idx, state }
  }), [questions, currentIndex, answers, flaggedQuestions])

  const getOptionState = (option: Choice): OptionState => {
    const isSelected = selectedAnswer === option.id
    const isCorrect = option.id === correctOptionId
    const isStruck = struckOptions[currentQuestion?.question_id]?.has(option.id)

    if (!isChecked) {
      if (isSelected) return 'selected' // selection beats strikethrough
      if (isStruck) return 'struck'
      return 'default'
    }
    // Post-check states
    if (isCorrect) return 'correct'
    if (isSelected && !isCorrect) return 'wrong'
    return 'faded'
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isCompleted) {
    return (
      <ResultsSummary
        questions={questions}
        answers={answers}
        testMode={mode}
        onExit={onExit}
        onRestart={onExit}
      />
    )
  }

  if (!currentQuestion) return null

  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const flaggedCount = flaggedQuestions.size

  return (
    <QuizOverlay>
      {/* Integrity violation overlay (strict mode focus loss) */}
      {isAutoSubmitting && (
        <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg border border-zinc-200 text-center space-y-3 max-w-xs">
            <AlertTriangle className="h-10 w-10 text-zinc-700 mx-auto" />
            <h2 className="text-lg font-bold text-zinc-900">Session Submitted</h2>
            <p className="text-zinc-500 text-sm">Focus was lost during a strict-mode session. Your answers have been recorded.</p>
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
      />

      {/* Timer bar — strict mode only, sits below header */}
      {strictMode && countdown !== null && (
        <div className="shrink-0 px-5 py-2 border-b border-zinc-100 bg-[#FAFAF9] flex justify-center">
          <TimerBar
            totalSeconds={totalTimerSeconds}
            remainingSeconds={countdown}
            isAheadOfPace={isAheadOfPace}
          />
        </div>
      )}

      {/* Main scrollable body */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[740px] mx-auto px-5 py-8 space-y-6">
          {/* Question stem */}
          <QuestionStem
            text={currentQuestion.text}
            imageUrl={currentQuestion.prompt_image_url}
          />

          {/* Options */}
          <div className="space-y-2.5" role="group" aria-label="Answer options">
            {options.map((option, idx) => (
              <OptionButton
                key={option.id}
                letter={String.fromCharCode(65 + idx)}
                text={option.text}
                state={getOptionState(option)}
                isChecked={isChecked}
                onSelect={() => handleChoiceSelect(option.id)}
                onStrike={(e) => toggleStrikethrough(option.id, e)}
              />
            ))}
          </div>

          {/* Primary action */}
          <div className={cn(
            'flex items-center gap-3',
            (isChecked && !isRationaleVisible) ? 'justify-between' : 'justify-end'
          )}>
            {isChecked && !isRationaleVisible && (
              <button
                onClick={() => setIsRationaleVisible(true)}
                className="h-11 px-5 rounded-sm border border-blue-200 text-blue-600 hover:bg-blue-50 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Show Rationale
              </button>
            )}

            {mode !== 'chill' && !isChecked ? (
              // Check answer CTA
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer || isSaving}
                className={cn(
                  'h-11 px-8 rounded-sm font-black text-xs uppercase tracking-[0.15em] transition-all',
                  selectedAnswer && !isSaving
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed',
                )}
              >
                {isSaving ? 'Saving…' : strictMode ? 'Confirm & Next' : 'Check Answer'}
              </button>
            ) : (
              // Next CTA with dwell ring
              <div className="relative">
                <button
                  onClick={currentIndex === questions.length - 1
                    ? () => setIsSubmitSheetOpen(true)
                    : handleNext
                  }
                  className={cn(
                    'h-11 px-8 rounded-sm font-black text-xs uppercase tracking-[0.15em] transition-all',
                    'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200',
                    mode === 'chill' && 'bg-blue-600 text-white',
                  )}
                >
                  {currentIndex === questions.length - 1 ? 'Finish Session' : 'Next Question'}
                </button>
                {/* Dwell ring — decorative suggestion, not a lock */}
                {dwellTimeRemaining > 0 && (
                  <div
                    className="absolute -inset-1 rounded-sm pointer-events-none"
                    aria-hidden
                    title={`${dwellTimeRemaining}s — take a moment to review`}
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                      <rect
                        x="1" y="1" width="98" height="98"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-200"
                        strokeDasharray="392"
                        strokeDashoffset="0"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rationale drawer */}
      <RationaleDrawer
        rationale={currentQuestion.rationale}
        isVisible={isRationaleVisible}
        isCorrect={selectedAnswer === correctOptionId}
        onClose={() => setIsRationaleVisible(false)}
        onWikiClick={() => router.push(`/dashboard/wiki?nodeId=${currentQuestion.topic_id}`)}
        onAddNote={() => { /* note drawer — future */ }}
      />

      {/* AI Tutor drawer */}
      <AITutorDrawer
        question={currentQuestion}
        selectedOptionId={selectedAnswer}
        options={options}
        isVisible={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Footer navigator */}
      <FooterNavigator
        dots={dots}
        currentIndex={currentIndex}
        canGoBack={currentIndex > 0}
        canGoForward={
          mode === 'chill'
            ? true
            : isChecked  // strict mode: footer Next disabled — must use primary CTA
        }
        strictMode={strictMode}
        onPrev={handleBack}
        onNext={currentIndex === questions.length - 1
          ? () => setIsSubmitSheetOpen(true)
          : handleNext
        }
        onJump={handleJump}
      />

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
        onExit={() => { setIsSubmitSheetOpen(false); onExit() }}
      />
    </QuizOverlay>
  )
}
