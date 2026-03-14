'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  Flag,
  Delete,
  Timer,
  ExternalLink,
  Plus,
  MessageSquare,
  X,
  XCircle,
  AlertTriangle
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
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils'
import type { Question, QuizSession, Choice } from '@/types/app'
import { saveInteraction, updateQuizSession } from '@/lib/actions/quiz'

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
  onExit
}: QuizRendererProps) {
  const mode = session.test_mode
  // Decisions Step 1: Storm Mode Strictness
  const strictMode = mode === 'storm' || mode === 'proof_sim'
  
  const [currentIndex, setCurrentIndex] = useState(session.current_question_index || 0)
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initialAnswers: Record<string, string> = {}
    initialInteractions.forEach((i) => {
      initialAnswers[i.question_id] = i.selected_option_id
    })
    return initialAnswers
  })
  
  const [struckOptions, setStruckOptions] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {}
    questions.forEach(q => initial[q.question_id] = new Set())
    return initial
  })

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(() => {
    const initialFlags = new Set<string>()
    initialInteractions.forEach(i => {
      if (i.is_flagged) initialFlags.add(i.question_id)
    })
    return initialFlags
  })

  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(() => {
    const initialChecked = new Set<string>()
    initialInteractions.forEach((i) => {
      // In strict mode, we don't show feedback immediately
      if (!strictMode && i.selected_option_id && (mode === 'camp' || mode === 'chill' || mode === 'blindspot')) {
        initialChecked.add(i.question_id)
      }
    })
    return initialChecked
  })

  const [isSaving, setIsSaving] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [dwellTimeRemaining, setDwellTimeRemaining] = useState(0)
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)
  
  const lastSavedRef = useRef<string>(JSON.stringify({ answers, currentIndex, flaggedQuestions: Array.from(flaggedQuestions) }))
  const startTimeRef = useRef<number>(Date.now())

  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []

  // Step 2: Auto-submit on focus loss (Strict Mode)
  useEffect(() => {
    if (!strictMode || session.status === 'completed') return

    const handleFocusLoss = async () => {
      if (document.visibilityState === 'hidden' || !document.hasFocus()) {
        setIsAutoSubmitting(true)
        try {
          await updateQuizSession(session.session_id, {
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          // Force refresh or exit to show "cold score"
          onExit()
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
  }, [strictMode, session.session_id, session.status, onExit])

  useEffect(() => {
    if (strictMode) {
      const totalSeconds = questions.length * 120
      setCountdown(totalSeconds)
      const timer = setInterval(() => {
        setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [strictMode, questions.length])

  useEffect(() => {
    let timer: any
    if (!strictMode && checkedQuestions.has(currentQuestion?.question_id) && (mode === 'camp' || mode === 'blindspot')) {
      const isCorrect = answers[currentQuestion.question_id] === options.find(o => o.is_correct)?.id
      const dwellTime = isCorrect ? 3 : 5
      setDwellTimeRemaining(dwellTime)
      timer = setInterval(() => {
        setDwellTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [currentIndex, checkedQuestions, mode, strictMode])

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentState = JSON.stringify({ answers, currentIndex, flaggedQuestions: Array.from(flaggedQuestions) })
      if (currentState !== lastSavedRef.current) {
        await handleSave()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [answers, currentIndex, flaggedQuestions])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await updateQuizSession(session.session_id, {
        current_question_index: currentIndex,
      })

      const currentAnswer = answers[currentQuestion.question_id]
      const isFlagged = flaggedQuestions.has(currentQuestion.question_id)
      
      if (currentAnswer || isFlagged) {
        const selectedOption = options.find((o) => o.id === currentAnswer)
        await saveInteraction({
          session_id: session.session_id,
          question_id: currentQuestion.question_id,
          topic_id: currentQuestion.topic_id,
          selected_option_id: currentAnswer || null,
          is_correct: selectedOption?.is_correct ?? false,
          time_spent_ms: Date.now() - startTimeRef.current,
        } as any)
      }
      lastSavedRef.current = JSON.stringify({ answers, currentIndex, flaggedQuestions: Array.from(flaggedQuestions) })
    } catch (error) {
      console.error('Failed to auto-save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [session.session_id, currentIndex, answers, currentQuestion, options, flaggedQuestions])

  const handleChoiceSelect = (choiceId: string) => {
    if (!strictMode && checkedQuestions.has(currentQuestion.question_id)) return
    
    if (mode === 'chill') {
      setAnswers(prev => ({ ...prev, [currentQuestion.question_id]: choiceId }))
      setCheckedQuestions(prev => new Set(prev).add(currentQuestion.question_id))
      handleSave()
      return
    }
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: choiceId }))
  }

  const toggleStrikethrough = (choiceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!strictMode && checkedQuestions.has(currentQuestion.question_id)) return
    setStruckOptions(prev => {
      const currentSet = prev[currentQuestion.question_id] || new Set()
      const next = new Set(currentSet)
      if (next.has(choiceId)) next.delete(choiceId)
      else next.add(choiceId)
      return { ...prev, [currentQuestion.question_id]: next }
    })
  }

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(currentQuestion.question_id)) next.delete(currentQuestion.question_id)
      else next.add(currentQuestion.question_id)
      return next
    })
  }

  const handleCheckAnswer = () => {
    if (strictMode) {
      // In Storm mode, "Submit Answer" just saves and moves to next or stays recorded
      handleSave()
      handleNext()
      return
    }
    setCheckedQuestions((prev) => {
      const next = new Set(prev)
      next.add(currentQuestion.question_id)
      return next
    })
    handleSave()
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      startTimeRef.current = Date.now()
      setDwellTimeRemaining(0)
    } else if (strictMode) {
      // Final question in Storm mode
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async () => {
    setIsSaving(true)
    try {
      await updateQuizSession(session.session_id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      onExit()
    } catch (error) {
      console.error('Final submit failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      startTimeRef.current = Date.now()
      setDwellTimeRemaining(0)
    }
  }

  if (!currentQuestion) {
    return (
      <div className='flex min-h-screen items-center justify-center px-6'>
        <p className='text-zinc-500'>No questions in this session.</p>
      </div>
    )
  }

  const isChecked = !strictMode && checkedQuestions.has(currentQuestion.question_id)
  const selectedAnswer = answers[currentQuestion.question_id]
  const isFlagged = flaggedQuestions.has(currentQuestion.question_id)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Decisions Step 1: Pacing Alert inline with timer
  const isAheadOfPace = useMemo(() => {
    const elapsed = (questions.length * 120) - (countdown || 0)
    const expected = (currentIndex + 1) * 120
    return elapsed < expected
  }, [countdown, currentIndex, questions.length])

  return (
    <div className={cn(
      'flex flex-col min-h-screen max-w-5xl mx-auto px-6 py-8 gap-6 transition-colors duration-500',
      strictMode ? 'bg-zinc-50/50' : 'bg-white'
    )}>
      {/* Auto-submit overlay */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-zinc-200 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold text-zinc-900">Integrity Violation</h2>
            <p className="text-zinc-500 max-w-xs">Focus lost during Storm Mode. Session is being automatically submitted.</p>
          </div>
        </div>
      )}

      {/* 1. Top Bar - Mode & Progress */}
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
             <div className={cn(
               'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest',
               mode === 'camp' && 'bg-teal-100 text-teal-700',
               strictMode && 'bg-red-100 text-red-700',
               mode === 'chill' && 'bg-blue-100 text-blue-700',
               mode === 'blindspot' && 'bg-amber-100 text-amber-700',
             )}>
               {mode === 'proof_sim' ? 'Proof Simulation™' : `${mode} mode`}
             </div>
             <span className='text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400'>
               {currentQuestion.subject_id || 'Architecture'} • Question {currentIndex + 1} of {questions.length}
             </span>
          </div>
          
          <div className='flex items-center gap-4'>
            {(strictMode) && countdown !== null && (
              <div className={cn(
                'flex flex-col items-end gap-0.5'
              )}>
                <div className={cn(
                  'flex items-center gap-2 font-mono font-bold text-sm',
                  countdown < 300 ? 'text-red-500 animate-pulse' : 'text-zinc-600'
                )}>
                  <Timer className='h-4 w-4' />
                  {formatTime(countdown)}
                </div>
                {/* Decisions Step 1: Inline Pacing Alert */}
                <span className={cn(
                  'text-[8px] font-black uppercase tracking-tighter px-1 rounded',
                  isAheadOfPace ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                )}>
                  {isAheadOfPace ? 'Ahead of Pace' : 'Behind Pace'}
                </span>
              </div>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-red-600 font-bold text-[10px] uppercase tracking-widest">
                  <X className="h-3 w-3 mr-1" />
                  Exit Exam
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Exit exam?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress in this session will be lost. Are you sure you want to exit?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep going</AlertDialogCancel>
                  <AlertDialogAction onClick={onExit} className="bg-red-600 hover:bg-red-700">Exit exam</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className='h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/30'>
          <motion.div
            className={cn(
              'h-full transition-colors',
              mode === 'camp' ? 'bg-teal-500' : strictMode ? 'bg-red-500' : 'bg-blue-500'
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 2. Main Question Card */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        <div className='lg:col-span-8 space-y-6'>
          <div className='bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm'>
            <h2 className='text-xl md:text-2xl font-semibold text-zinc-900 leading-[1.4] tracking-tight mb-8'>
              {currentQuestion.text}
            </h2>

            <div className='flex flex-col gap-3'>
              {options.map((option, idx) => {
                const isSelected = selectedAnswer === option.id
                const isCorrect = option.is_correct === true
                const isStruck = struckOptions[currentQuestion.question_id]?.has(option.id)
                const letter = String.fromCharCode(65 + idx)

                // If checked, we highlight (Non-strict modes only)
                const showCorrect = isChecked && isCorrect
                const showWrong = isChecked && isSelected && !isCorrect

                return (
                  <button
                    key={option.id}
                    disabled={isChecked}
                    onClick={() => handleChoiceSelect(option.id)}
                    className={cn(
                      'flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 group min-h-[64px] relative overflow-hidden',
                      !isChecked && !isSelected && 'bg-white border-zinc-200 hover:border-zinc-400 hover:shadow-md',
                      !isChecked && isSelected && 'bg-zinc-900 border-zinc-900 text-white shadow-lg',
                      !isChecked && isStruck && 'opacity-40 grayscale-[80%]',

                      // Styling states (Feedback suppressed in strictMode)
                      showCorrect && 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-semibold',
                      showWrong && 'bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500',
                      
                      isChecked && !isCorrect && !isSelected && 'bg-white border-zinc-100 opacity-40 grayscale-[50%]',
                    )}
                  >
                    {isStruck && !isChecked && (
                      <div className='absolute inset-0 flex items-center px-4 pointer-events-none'>
                        <div className='w-full h-[2px] bg-zinc-400/50' />
                      </div>
                    )}

                    <div className={cn(
                      'w-7 h-7 shrink-0 rounded flex items-center justify-center text-[10px] font-black border transition-colors',
                      !isChecked && !isSelected && 'bg-zinc-50 border-zinc-200 text-zinc-400',
                      !isChecked && isSelected && 'bg-white/20 border-white/20 text-white',
                      
                      showCorrect && 'bg-emerald-500 border-emerald-400 text-white',
                      showWrong && 'bg-red-500 border-red-400 text-white',
                    )}>
                      {letter}
                    </div>

                    <span className='text-[14px] font-medium leading-snug flex-1'>
                      {option.text}
                    </span>

                    {!isChecked && (
                      <span
                        role='button'
                        tabIndex={0}
                        onClick={(e) => toggleStrikethrough(option.id, e)}
                        className='p-2 rounded-lg hover:bg-zinc-100 text-zinc-300 hover:text-zinc-600 transition-colors'
                      >
                        <Delete className='h-4 w-4' />
                      </span>
                    )}

                    {showCorrect && <Check className='h-5 w-5 text-emerald-600' strokeWidth={3} />}
                    {showWrong && <XCircle className='h-5 w-5 text-red-600' strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <div className='bg-zinc-900 rounded-2xl p-6 text-white shadow-xl shadow-zinc-200/50 space-y-6'>
             <div className='flex items-center justify-between'>
                <h3 className='text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500'>The Arsenal</h3>
                <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
             </div>

             <div className='grid grid-cols-2 gap-3'>
                <Button 
                  onClick={toggleFlag}
                  variant='secondary' 
                  className={cn(
                    'h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all',
                    isFlagged ? 'bg-amber-500 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                  )}
                >
                  <Flag className={cn('h-5 w-5', isFlagged && 'fill-current')} />
                  <span className='text-[9px] font-bold uppercase tracking-widest'>Flag Review</span>
                </Button>
                <Button 
                  variant='secondary' 
                  className='h-14 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 flex flex-col items-center justify-center gap-1'
                >
                  <MessageSquare className='h-5 w-5' />
                  <span className='text-[9px] font-bold uppercase tracking-widest'>Ask AI</span>
                </Button>
             </div>

             <div className='pt-4 border-t border-white/10'>
                {mode !== 'chill' && !isChecked ? (
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={!selectedAnswer}
                    className='w-full h-14 bg-white text-zinc-900 hover:bg-zinc-100 font-black rounded-xl text-sm shadow-lg'
                  >
                    {strictMode ? 'Record & Next' : 'Submit Answer'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={dwellTimeRemaining > 0 || (currentIndex === questions.length - 1 && mode !== 'chill')}
                    className={cn(
                      'w-full h-14 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2',
                      dwellTimeRemaining > 0 
                        ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 shadow-xl'
                    )}
                  >
                    {dwellTimeRemaining > 0 ? (
                      `Reviewing (${dwellTimeRemaining}s)`
                    ) : (
                      <>
                        {currentIndex === questions.length - 1 ? 'Finish Session' : 'Next Question'}
                        <ChevronRight className='h-4 w-4' />
                      </>
                    )}
                  </Button>
                )}
             </div>
          </div>

          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6'
              >
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 text-blue-600'>
                    <Info className='h-4 w-4' />
                    <h4 className='text-[10px] font-black uppercase tracking-widest'>
                      {mode === 'chill' ? 'Gentle Reorientation' : 'SME Rationale'}
                    </h4>
                  </div>
                  
                  <div className='space-y-4'>
                    <div className={cn(
                      'p-4 rounded-xl border',
                      mode === 'chill' ? 'bg-blue-50/30 border-blue-100' : 'bg-zinc-50 border-zinc-100'
                    )}>
                      <p className={cn(
                        'text-sm leading-relaxed font-medium',
                        mode === 'chill' ? 'text-zinc-600' : 'text-zinc-700'
                      )}>
                        {mode !== 'chill' && selectedAnswer !== options.find(o => o.is_correct)?.id && options.find(o => o.id === selectedAnswer)?.rationale && (
                           <span className='block mb-3 pb-3 border-b border-zinc-200 italic text-zinc-500'>
                             <span className='font-bold text-red-500 uppercase text-[9px] mr-2'>Common Misconception:</span>
                             {options.find(o => o.id === selectedAnswer)?.rationale}
                           </span>
                        )}
                        
                        {mode === 'chill' && selectedAnswer !== options.find(o => o.is_correct)?.id && (
                          <span className='italic block mb-2'>"Not quite — this one trips people up. The key thing to remember is..."</span>
                        )}
                        
                        {currentQuestion.rationale}
                      </p>
                    </div>

                    {mode !== 'chill' && (
                      <>
                        <Button variant='ghost' className='w-full justify-between h-auto py-3 px-4 rounded-xl bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-100 group'>
                          <span className='text-[10px] font-black uppercase tracking-widest flex items-center gap-2'>
                             <ExternalLink className='h-3 w-3' /> Teleport to Wiki
                          </span>
                          <ChevronRight className='h-3 w-3 group-hover:translate-x-1 transition-transform' />
                        </Button>
                        
                        <Button variant='outline' className='w-full justify-start h-auto py-3 px-4 rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 gap-3'>
                           <Plus className='h-4 w-4' />
                           <span className='text-[10px] font-black uppercase tracking-widest'>Add to Cheat Sheet</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className='mt-auto pt-8 flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={handleBack}
          disabled={currentIndex === 0}
          className='text-zinc-400 hover:text-zinc-900 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]'
        >
          <ChevronLeft className='mr-2 h-4 w-4' /> Previous
        </Button>

        <div className='flex gap-1.5'>
          {questions.map((_, i) => (
             <div 
               key={i} 
               className={cn(
                 'w-1.5 h-1.5 rounded-full transition-all',
                 i === currentIndex ? 'bg-zinc-900 w-4' : 
                 checkedQuestions.has(questions[i].question_id) ? 'bg-zinc-300' : 'bg-zinc-100'
               )}
             />
          ))}
        </div>
      </div>
    </div>
  )
}
