'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Flag,
  Delete,
  Timer,
  ExternalLink,
  Plus,
  MessageSquare,
  X,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { Question, QuizSession, Choice } from '@/types/app'
import { saveInteraction, updateQuizSession } from '@/lib/actions/quiz'
import { ResultsSummary } from './ResultsSummary'

interface QuizRendererProps {
  session: QuizSession
  questions: Question[]
  initialInteractions: any[]
  onExit: () => void
}

export function QuizRenderer({
  session,
  questions,
  initialInteractions,
  onExit,
}: QuizRendererProps) {
  const mode = session.test_mode
  const strictMode = mode === 'storm' || mode === 'proof_sim'

  const [currentIndex, setCurrentIndex] = useState(
    session.current_question_index || 0,
  )
  const [isCompleted, setIsCompleted] = useState(false)
  const [isRationaleVisible, setIsRationaleVisible] = useState(false)

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initialAnswers: Record<string, string> = {}
    initialInteractions.forEach((i) => {
      initialAnswers[i.question_id] = i.selected_option_id
    })
    return initialAnswers
  })

  const [struckOptions, setStruckOptions] = useState<
    Record<string, Set<string>>
  >(() => {
    const initial: Record<string, Set<string>> = {}
    questions.forEach((q) => (initial[q.question_id] = new Set()))
    return initial
  })

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(() => {
    const initialFlags = new Set<string>()
    initialInteractions.forEach((i) => {
      if (i.is_flagged) initialFlags.add(i.question_id)
    })
    return initialFlags
  })

  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(() => {
    const initialChecked = new Set<string>()
    initialInteractions.forEach((i) => {
      if (
        !strictMode &&
        i.selected_option_id &&
        (mode === 'camp' || mode === 'chill' || mode === 'blindspot')
      ) {
        initialChecked.add(i.question_id)
      }
    })
    return initialChecked
  })

  const [isSaving, setIsSaving] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [dwellTimeRemaining, setDwellTimeRemaining] = useState(0)
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)

  const lastSavedRef = useRef<string>(
    JSON.stringify({
      answers,
      currentIndex,
      flaggedQuestions: Array.from(flaggedQuestions),
    }),
  )
  const startTimeRef = useRef<number>(Date.now())

  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []
  const correctOptionId =
    currentQuestion?.correct_option_id ?? currentQuestion?.correct_answer

  useEffect(() => {
    if (!strictMode || session.status === 'completed') return
    const handleFocusLoss = async () => {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        setIsAutoSubmitting(true)
        try {
          await updateQuizSession(session.session_id, { status: 'completed' })
          setIsCompleted(true)
        } catch (error) {
          console.error('Auto-submit failed:', error)
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

  useEffect(() => {
    if (strictMode) {
      const totalSeconds = questions.length * 120
      setCountdown(totalSeconds)
      const timer = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [strictMode, questions.length])

  useEffect(() => {
    let timer: any
    if (
      !strictMode &&
      checkedQuestions.has(currentQuestion?.question_id) &&
      (mode === 'camp' || mode === 'blindspot')
    ) {
      const isCorrect = answers[currentQuestion.question_id] === correctOptionId
      const dwellTime = isCorrect ? 3 : 5
      setDwellTimeRemaining(dwellTime)
      timer = setInterval(() => {
        setDwellTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [
    currentIndex,
    checkedQuestions,
    mode,
    strictMode,
    answers,
    currentQuestion?.question_id,
    correctOptionId,
  ])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await updateQuizSession(session.session_id, {
        current_question_index: currentIndex,
      })
      const currentAnswer = answers[currentQuestion.question_id]
      const isFlagged = flaggedQuestions.has(currentQuestion.question_id)
      if (currentAnswer || isFlagged) {
        await saveInteraction({
          session_id: session.session_id,
          question_id: currentQuestion.question_id,
          topic_id: currentQuestion.topic_id,
          selected_option_id: currentAnswer || null,
          is_correct: (currentAnswer || null) === correctOptionId,
          time_spent_ms: Date.now() - startTimeRef.current,
        } as any)
      }
      lastSavedRef.current = JSON.stringify({
        answers,
        currentIndex,
        flaggedQuestions: Array.from(flaggedQuestions),
      })
    } catch (error) {
      console.error('Failed to auto-save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [
    session.session_id,
    currentIndex,
    answers,
    currentQuestion,
    flaggedQuestions,
    correctOptionId,
  ])

  const handleChoiceSelect = (choiceId: string) => {
    if (!strictMode && checkedQuestions.has(currentQuestion.question_id)) return
    if (mode === 'chill') {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.question_id]: choiceId,
      }))
      setCheckedQuestions((prev) =>
        new Set(prev).add(currentQuestion.question_id),
      )
      setIsRationaleVisible(true)
      handleSave()
      return
    }
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: choiceId }))
  }

  const toggleStrikethrough = (choiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!strictMode && checkedQuestions.has(currentQuestion.question_id)) return
    setStruckOptions((prev) => {
      const currentSet = prev[currentQuestion.question_id] || new Set()
      const next = new Set(currentSet)
      if (next.has(choiceId)) next.delete(choiceId)
      else next.add(choiceId)
      return { ...prev, [currentQuestion.question_id]: next }
    })
  }

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion.question_id))
        next.delete(currentQuestion.question_id)
      else next.add(currentQuestion.question_id)
      return next
    })
  }

  const handleCheckAnswer = () => {
    if (strictMode) {
      handleSave()
      handleNext()
      return
    }
    setCheckedQuestions((prev) =>
      new Set(prev).add(currentQuestion.question_id),
    )
    setIsRationaleVisible(true)
    handleSave()
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsRationaleVisible(false)
      startTimeRef.current = Date.now()
      setDwellTimeRemaining(0)
    } else if (strictMode) {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async () => {
    setIsSaving(true)
    try {
      await updateQuizSession(session.session_id, { status: 'completed' })
      setIsCompleted(true)
    } catch (error) {
      console.error('Final submit failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsRationaleVisible(false)
      startTimeRef.current = Date.now()
      setDwellTimeRemaining(0)
    }
  }

  const isChecked =
    !strictMode && checkedQuestions.has(currentQuestion?.question_id)
  const selectedAnswer = answers[currentQuestion?.question_id]
  const isFlagged = flaggedQuestions.has(currentQuestion?.question_id)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isAheadOfPace = useMemo(() => {
    const elapsed = questions.length * 120 - (countdown || 0)
    const expected = (currentIndex + 1) * 120
    return elapsed < expected
  }, [countdown, currentIndex, questions.length])

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

  return (
    <div
      className={cn(
        'flex flex-col h-full max-w-6xl mx-auto px-6 overflow-hidden transition-colors duration-500',
        strictMode ? 'bg-zinc-50/50' : 'bg-white',
      )}
    >
      {isAutoSubmitting && (
        <div className='fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-white p-8 rounded-sm shadow-2xl border border-zinc-200 text-center space-y-4'>
            <AlertTriangle className='h-12 w-12 text-red-600 mx-auto animate-pulse' />
            <h2 className='text-xl font-bold text-zinc-900'>
              Integrity Violation
            </h2>
            <p className='text-zinc-500 text-sm max-w-xs'>
              Focus lost during Storm Mode. Session is being automatically
              submitted.
            </p>
          </div>
        </div>
      )}

      {/* 1. HEADER */}
      <header className='pt-6 shrink-0 space-y-4'>
        <div className='flex justify-between items-end'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <span className='text-[11px] font-bold uppercase tracking-widest text-zinc-900'>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div
                className={cn(
                  'px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest',
                  mode === 'camp' && 'bg-blue-600 text-white',
                  strictMode && 'bg-red-600 text-white',
                  mode === 'chill' && 'bg-blue-100 text-blue-700',
                  mode === 'blindspot' && 'bg-amber-100 text-amber-700',
                )}
              >
                {mode === 'proof_sim'
                  ? 'Proof Simulation™'
                  : mode === 'camp'
                    ? 'Camp Mode — Learning'
                    : mode === 'storm'
                      ? `Storm Mode: ${currentQuestion.subject_id || 'Exam'}`
                      : mode === 'chill'
                        ? 'Chill Mode'
                        : mode === 'blindspot'
                          ? 'Blindspot Mode'
                          : `${mode} mode`}
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {strictMode && countdown !== null && (
              <div className='flex items-center gap-3 bg-zinc-100 px-3 py-1.5 rounded-sm border border-zinc-200'>
                <div
                  className={cn(
                    'flex items-center gap-2 font-mono font-bold text-xs',
                    countdown < 300
                      ? 'text-red-500 animate-pulse'
                      : 'text-zinc-600',
                  )}
                >
                  <Timer className='h-3.5 w-3.5' />
                  {formatTime(countdown)}
                </div>
                <span
                  className={cn(
                    'text-[8px] font-black uppercase tracking-tighter px-1 rounded-sm',
                    isAheadOfPace
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-amber-600 bg-amber-50',
                  )}
                >
                  {isAheadOfPace ? 'Ahead' : 'Behind'}
                </span>
              </div>
            )}

            <div className='flex items-center gap-1'>
              <Button
                onClick={toggleFlag}
                variant='ghost'
                size='sm'
                className={cn(
                  'h-8 rounded-sm text-[9px] font-bold uppercase tracking-widest',
                  isFlagged
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-zinc-400 hover:bg-zinc-50',
                )}
              >
                <Flag
                  className={cn('h-3.5 w-3.5', isFlagged && 'fill-current')}
                />{' '}
                Flag
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 rounded-sm text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-50'
              >
                <MessageSquare className='h-3.5 w-3.5' /> AI
              </Button>
              <div className='w-px h-4 bg-zinc-200 mx-1' />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 text-zinc-400 hover:text-red-600 rounded-sm'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='rounded-sm'>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exit session?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className='rounded-sm'>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onExit}
                      className='bg-red-600 hover:bg-red-700 rounded-sm'
                    >
                      Exit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        <div className='h-1.5 w-full bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200/30'>
          <motion.div
            className={cn(
              'h-full transition-colors',
              mode === 'camp'
                ? 'bg-blue-600'
                : strictMode
                  ? 'bg-red-600'
                  : 'bg-blue-500',
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* 2. MAIN CONTENT - No scrolling body */}
      <main className='flex flex-col  py-2'>
        {/* HERO IMAGE */}
        <div className='shrink-0 max-h-[30vh] h-[200px] mb-2 w-full bg-zinc-100 border border-zinc-200 rounded-sm flex flex-col items-center justify-center text-zinc-400 relative overflow-hidden group mx-auto'>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
          <Info className='h-8 w-8 opacity-20 mb-2' />
          <span className='text-[10px] font-bold uppercase tracking-[0.3em] opacity-40'>
            Reference Material (16:9)
          </span>
        </div>

        {/* ACTION BAR - Right Aligned above content */}
        <div className='shrink-0 flex justify-end mb-2'>
          {isChecked && !isRationaleVisible && (
            <Button
              variant='outline'
              onClick={() => setIsRationaleVisible(true)}
              className='h-12 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-sm text-[10px] font-bold uppercase tracking-widest'
            >
              Show Rationale
            </Button>
          )}
          {mode !== 'chill' && !isChecked ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer || isSaving}
              className='w-full md:w-64 h-12 bg-blue-600 text-white hover:bg-blue-700 font-black rounded-sm text-xs shadow-xl shadow-blue-200/50 uppercase tracking-[0.2em]'
            >
              {isSaving
                ? 'Processing...'
                : strictMode
                  ? 'Confirm & Record'
                  : 'Check Answer'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={dwellTimeRemaining > 0}
              className={cn(
                'w-full md:w-64 h-12 font-black rounded-sm text-xs transition-all uppercase tracking-[0.2em] shadow-lg',
                dwellTimeRemaining > 0
                  ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              )}
            >
              {dwellTimeRemaining > 0
                ? `Reviewing (${dwellTimeRemaining}s)`
                : currentIndex === questions.length - 1
                  ? 'Finish Session'
                  : 'Next Question'}
            </Button>
          )}
        </div>

        {/* QUESTION & OPTIONS GRID - Flexible priority with internal scrolling */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 h-[300px] '>
          {/* QUESTION - Internal Scroll */}
          <div className='bg-zinc-50/50 p-6 rounded-sm border border-zinc-100 overflow-y-auto scrollbar-hide'>
            <h2 className='text-md md:text-md font-medium text-zinc-900 leading-relaxed tracking-tight'>
              {currentQuestion.text}
            </h2>
          </div>

          {/* OPTIONS - Internal Scroll */}
          <div className='flex flex-col gap-2.5 overflow-y-auto scrollbar-hide h-full '>
            {options.map((option, idx) => {
              const isSelected = selectedAnswer === option.id
              const isCorrect = option.id === correctOptionId
              const isStruck =
                struckOptions[currentQuestion.question_id]?.has(option.id)
              const letter = String.fromCharCode(65 + idx)
              const showCorrect = isChecked && isCorrect
              const showWrong = isChecked && isSelected && !isCorrect

              return (
                <button
                  key={option.id}
                  disabled={isChecked}
                  onClick={() => handleChoiceSelect(option.id)}
                  className={cn(
                    'flex h-fit items-center gap-4 p-4 rounded-sm border text-left transition-all duration-200 relative overflow-hidden shrink-0 flex-1',
                    !isChecked &&
                      !isSelected &&
                      'bg-white border-zinc-200 hover:border-blue-300 hover:bg-blue-50/10',
                    !isChecked &&
                      isSelected &&
                      'bg-blue-600 border-blue-600 text-white shadow-md',
                    !isChecked && isStruck && 'opacity-40 grayscale-[80%]',
                    showCorrect &&
                      'bg-emerald-50 border-emerald-500 text-emerald-900  ring-emerald-500 font-semibold',
                    showWrong &&
                      'bg-red-50 border-red-500 text-red-900  ring-red-500',
                    isChecked &&
                      !isCorrect &&
                      !isSelected &&
                      'bg-white border-zinc-100 opacity-40',
                  )}
                >
                  {isStruck && !isChecked && (
                    <div className='absolute inset-0 flex items-center px-4 pointer-events-none'>
                      <div className='w-full h-[2px] bg-zinc-400/50' />
                    </div>
                  )}
                  <div
                    className={cn(
                      'w-6 h-6 shrink-0 rounded-sm flex items-center justify-center text-[10px] font-black border transition-colors',
                      !isChecked &&
                        !isSelected &&
                        'bg-zinc-50 border-zinc-200 text-zinc-400',
                      !isChecked &&
                        isSelected &&
                        'bg-white/20 border-white/20 text-white',
                      showCorrect &&
                        'bg-emerald-500 border-emerald-400 text-white',
                      showWrong && 'bg-red-500 border-red-400 text-white',
                    )}
                  >
                    {letter}
                  </div>
                  <span className='text-[13px] font-medium flex-1'>
                    {option.text}
                  </span>
                  {!isChecked && (
                    <span
                      role='button'
                      tabIndex={0}
                      onClick={(e) => toggleStrikethrough(option.id, e)}
                      className='p-2 rounded-sm hover:bg-zinc-100 text-zinc-300 hover:text-zinc-600 transition-colors shrink-0'
                      aria-label={
                        isStruck ? 'Restore option' : 'Cross out option'
                      }
                    >
                      <Delete className='h-4 w-4' />
                    </span>
                  )}
                  {showCorrect && (
                    <Check
                      className='h-4 w-4 text-emerald-600'
                      strokeWidth={3}
                    />
                  )}
                  {showWrong && (
                    <XCircle className='h-4 w-4 text-red-600' strokeWidth={3} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* 3. SLIDE-UP EXPLANATION DRAWER */}
      <AnimatePresence>
        {isChecked && isRationaleVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='shrink-0 bg-blue-50/50 border-t border-blue-100 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden'
          >
            <div className='max-w-6xl mx-auto px-10 py-6 space-y-3 max-h-[35vh] overflow-y-auto'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-blue-600'>
                  <Info className='h-4 w-4' />
                  <h4 className='text-[10px] font-black uppercase tracking-widest'>
                    Rationale & Educational Context
                  </h4>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsRationaleVisible(false)}
                  className='h-6 w-6 p-0 rounded-full hover:bg-blue-100 text-blue-400'
                >
                  <X className='h-3.5 w-3.5' />
                </Button>
              </div>
              <div className='text-[13px] leading-relaxed text-zinc-700 italic pr-4'>
                {currentQuestion.rationale}
              </div>
              <div className='flex gap-2 pt-1'>
                <Button
                  variant='ghost'
                  className='h-7 px-3 rounded-sm bg-white text-blue-700 hover:bg-blue-100 text-[9px] font-black uppercase tracking-widest border border-blue-100 gap-2'
                >
                  <ExternalLink className='h-3 w-3' /> Wiki Reference
                </Button>
                <Button
                  variant='ghost'
                  className='h-7 px-3 rounded-sm bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-[9px] font-black uppercase tracking-widest gap-2'
                >
                  <Plus className='h-3 w-3' /> Add to Notes
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. FOOTER NAVIGATION */}
      <footer className='py-6 shrink-0 border-t border-zinc-100 flex items-center justify-between bg-white mt-auto'>
        <Button
          variant='ghost'
          onClick={handleBack}
          disabled={currentIndex === 0}
          className='text-zinc-400 hover:text-zinc-900 h-10 px-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em]'
        >
          <ChevronLeft className='mr-2 h-4 w-4' /> Previous Question
        </Button>

        <div className='flex items-center gap-3'>
          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleFinalSubmit}
              disabled={isSaving || (mode !== 'chill' && !isChecked)}
              className='bg-zinc-900 text-white hover:bg-black h-10 px-6 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg'
            >
              Finish Session
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={dwellTimeRemaining > 0}
              className=' bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em]'
            >
              Next Question <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
