'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question, QuizSession } from '@/types/app'
import { saveInteraction, updateQuizSession } from '@/lib/actions/quiz'

interface Choice {
  id: string
  text: string
  is_correct: boolean
}

interface QuizRendererProps {
  session: QuizSession
  questions: Question[]
  initialInteractions: any[]
}

export function QuizRenderer({
  session,
  questions,
  initialInteractions,
}: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(
    session.current_question_index || 0,
  )
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initialAnswers: Record<string, string> = {}
    initialInteractions.forEach((i) => {
      initialAnswers[i.question_id] = i.selected_option_id
    })
    return initialAnswers
  })
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(() => {
    const initialChecked = new Set<string>()
    initialInteractions.forEach((i) => {
      if (i.selected_option_id) initialChecked.add(i.question_id)
    })
    return initialChecked
  })
  const [isSaving, setIsSaving] = useState(false)
  const lastSavedRef = useRef<string>(JSON.stringify({ answers, currentIndex }))
  const startTimeRef = useRef<number>(Date.now())

  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentState = JSON.stringify({ answers, currentIndex })
      if (currentState !== lastSavedRef.current) {
        await handleSave()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [answers, currentIndex])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Save current question index
      await updateQuizSession(session.session_id, {
        current_question_index: currentIndex,
      })

      // Save the current interaction if it exists
      const currentAnswer = answers[currentQuestion.question_id]
      if (currentAnswer) {
        const selectedOption = options.find((o) => o.id === currentAnswer)
        await saveInteraction({
          session_id: session.session_id,
          question_id: currentQuestion.question_id,
          topic_id: currentQuestion.topic_id,
          selected_option_id: currentAnswer,
          is_correct: selectedOption?.is_correct ?? false,
          time_spent_ms: Date.now() - startTimeRef.current,
        })
      }

      lastSavedRef.current = JSON.stringify({ answers, currentIndex })
    } catch (error) {
      console.error('Failed to auto-save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [session.session_id, currentIndex, answers, currentQuestion, options])

  const handleChoiceSelect = (choiceId: string) => {
    if (checkedQuestions.has(currentQuestion.question_id)) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.question_id]: choiceId }))
  }

  const handleCheckAnswer = () => {
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
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      startTimeRef.current = Date.now()
    }
  }

  const isChecked = checkedQuestions.has(currentQuestion.question_id)
  const selectedAnswer = answers[currentQuestion.question_id]

  // Helper to determine if a choice is correct (supports both schema styles)
  const isCorrectChoice = (option: any) => {
    if (option.is_correct === true || option.isCorrect === true) return true
    if (currentQuestion.correct_answer === option.id) return true
    return false
  }

  return (
    <div className='flex flex-col min-h-full max-w-5xl mx-auto px-6 py-8 gap-6'>
      {/* 1. Header & Progress Bar */}
      <div className='space-y-2'>
        <div className='flex justify-between items-end'>
          <span className='text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400'>
            Question {currentIndex + 1} of {questions.length}
          </span>
          {isSaving && (
            <span className='text-[9px] font-bold text-zinc-300 uppercase tracking-widest animate-pulse'>
              Syncing...
            </span>
          )}
        </div>
        <div className='h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/30'>
          <motion.div
            className='h-full bg-zinc-900'
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 2. Landscape Image (1920x1080 ratio) */}
      <div className='w-full aspect-video rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden relative group'>
        {(currentQuestion as any).prompt_image_url ? (
          <img
            src={(currentQuestion as any).prompt_image_url}
            alt='Question illustration'
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center flex-col gap-3'>
            <div className='w-12 h-12 rounded-full bg-white/50 flex items-center justify-center'>
              <Info className='h-6 w-6 text-zinc-300' />
            </div>
            <span className='text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]'>
              Illustration Area
            </span>
          </div>
        )}
      </div>

      {/* 3. Main Content Split */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[240px]'>
        {/* Left: Question */}
        <div className='bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-center'>
          <h2 className='text-xl font-semibold text-zinc-900 leading-[1.5] tracking-tight'>
            {currentQuestion.text}
          </h2>
        </div>

        {/* Right: Options */}
        <div className='flex flex-col gap-2'>
          {options.map((option) => {
            const isSelected = selectedAnswer === option.id
            const isCorrect = isCorrectChoice(option)

            return (
              <button
                key={option.id}
                disabled={isChecked}
                onClick={() => handleChoiceSelect(option.id)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group min-h-[60px]',
                  // BEFORE checking
                  !isChecked && !isSelected && 'bg-white border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/30',
                  !isChecked && isSelected && 'bg-zinc-900 border-zinc-900 text-white shadow-md',
                  
                  // AFTER checking
                  isChecked && isCorrect && 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-semibold',
                  isChecked && isSelected && !isCorrect && 'bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500',
                  isChecked && !isCorrect && !isSelected && 'bg-white border-zinc-100 opacity-40 grayscale-[50%]'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors',
                    !isChecked && !isSelected && 'bg-zinc-50 border-zinc-100 text-zinc-400',
                    !isChecked && isSelected && 'bg-white/10 border-white/20 text-white',
                    isChecked && isCorrect && 'bg-emerald-500 border-emerald-400 text-white',
                    isChecked && isSelected && !isCorrect && 'bg-red-500 border-red-400 text-white',
                    isChecked && !isSelected && !isCorrect && 'bg-zinc-50 border-zinc-100 text-zinc-300',
                  )}
                >
                  {option.id.toUpperCase()}
                </div>
                <span className='text-[13px] font-medium leading-tight'>
                  {option.text}
                </span>
                {isChecked && isCorrect && (
                  <Check
                    className='ml-auto h-4 w-4 text-emerald-600'
                    strokeWidth={3}
                  />
                )}
                {isChecked && isSelected && !isCorrect && (
                  <AlertCircle
                    className='ml-auto h-4 w-4 text-red-600'
                    strokeWidth={3}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Action Card */}
      <div className='bg-zinc-900 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl shadow-zinc-200'>
        <Button
          onClick={handleCheckAnswer}
          disabled={!selectedAnswer || isChecked}
          className={cn(
            'flex-1 h-12 font-bold transition-all rounded-xl',
            isChecked
              ? 'bg-zinc-800 text-zinc-500'
              : 'bg-white text-zinc-900 hover:bg-zinc-100',
          )}
        >
          Check Answer
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isChecked}
          className={cn(
            'flex-1 h-12 font-bold transition-all rounded-xl border',
            !isChecked
              ? 'bg-transparent border-zinc-800 text-zinc-700 cursor-not-allowed'
              : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700',
          )}
        >
          {currentIndex === questions.length - 1 ? 'Complete' : 'Next Question'}
          <ChevronRight className='ml-2 h-4 w-4' />
        </Button>
      </div>

      {/* 5. Explanation Card */}
      <AnimatePresence>
        {isChecked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm'
          >
            <div className='flex items-start gap-4'>
              <div className='bg-blue-50 p-2 rounded-xl shrink-0'>
                <Info className='h-5 w-5 text-blue-600' />
              </div>
              <div className='space-y-1'>
                <h4 className='text-[11px] font-bold uppercase tracking-widest text-zinc-400'>
                  Explanation
                </h4>
                <p className='text-[14px] text-zinc-600 leading-relaxed font-medium'>
                  {currentQuestion.rationale}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Back Button */}
      <div className='flex justify-start'>
        <Button
          variant='ghost'
          onClick={handleBack}
          disabled={currentIndex === 0}
          className='text-zinc-400 hover:text-zinc-900 h-auto p-0 text-[10px] font-bold uppercase tracking-widest'
        >
          <ChevronLeft className='mr-1 h-3 w-3' /> Back
        </Button>
      </div>
    </div>
  )
}
