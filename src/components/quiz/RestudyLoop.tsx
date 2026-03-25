'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'
import { getCorrectOptionId } from '@/lib/utils/question'
import { getSessionQuestions } from '@/lib/actions/quiz'
import { QuestionStem } from './QuestionStem'
import { OptionButton } from './OptionButton'
import type { OptionState } from './OptionButton'

interface RestudyLoopProps {
  topicName: string
  questionIds: string[]
  onComplete: () => void
}

/**
 * Feature 6: Successive Relearning Loop
 * 3 rapid-fire questions on the same topic, shown inline after a repeat wrong answer.
 */
export const RestudyLoop = ({
  topicName,
  questionIds,
  onComplete,
}: RestudyLoopProps) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const [phase, setPhase] = useState<'transition' | 'active' | 'complete'>('transition')
  const [loading, setLoading] = useState(true)

  // Load questions
  useEffect(() => {
    if (questionIds.length === 0) {
      onComplete()
      return
    }
    getSessionQuestions(questionIds).then((qs) => {
      setQuestions(qs)
      setLoading(false)
      // Show transition for 1.5 seconds
      setTimeout(() => setPhase('active'), 1500)
    }).catch(() => {
      onComplete()
    })
  }, [questionIds]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentQuestion = questions[currentIdx]

  const handleSelect = (choiceId: string) => {
    if (isChecked) return
    setSelectedAnswer(choiceId)
  }

  const handleCheck = () => {
    setIsChecked(true)
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsChecked(false)
    } else {
      setPhase('complete')
      setTimeout(onComplete, 1500)
    }
  }

  const getOptionState = (option: Choice): OptionState => {
    const correctId = getCorrectOptionId(currentQuestion ?? {})
    if (!isChecked) {
      return selectedAnswer === option.id ? 'selected' : 'default'
    }
    if (option.id === correctId) return 'correct'
    if (selectedAnswer === option.id && option.id !== correctId) return 'wrong'
    return 'faded'
  }

  if (loading || phase === 'transition') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5 animate-in fade-in duration-200">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-text-tertiary mb-3">
          Quick Re-Study
        </p>
        <p className="text-base font-semibold text-text-primary text-center max-w-sm">
          You&apos;ve seen this concept before and it didn&apos;t stick. Three focused questions to fix that.
        </p>
        <p className="text-sm text-text-secondary mt-2">{topicName}</p>
      </div>
    )
  }

  if (phase === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5 animate-in fade-in duration-200">
        <p className="text-base font-semibold text-text-primary">Re-study complete.</p>
        <p className="text-sm text-text-secondary mt-1">Back to your session.</p>
      </div>
    )
  }

  if (!currentQuestion) {
    onComplete()
    return null
  }

  const options = (currentQuestion.options as unknown as Choice[]) || []
  const correctId = getCorrectOptionId(currentQuestion)

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-text-tertiary">
          Re-Study {currentIdx + 1} of {questions.length}
        </p>
        <span className="text-xs text-text-tertiary bg-primary-50 px-2 py-0.5 rounded-sm">
          {topicName}
        </span>
      </div>

      {/* Question */}
      <QuestionStem text={currentQuestion.text} imageUrl={currentQuestion.prompt_image_url} />

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((option, idx) => (
          <OptionButton
            key={option.id}
            letter={String.fromCharCode(65 + idx)}
            text={option.text}
            state={getOptionState(option)}
            isChecked={isChecked}
            onSelect={() => handleSelect(option.id)}
            onStrike={() => {}}
          />
        ))}
      </div>

      {/* Rationale (if checked and wrong) */}
      {isChecked && selectedAnswer !== correctId && currentQuestion.rationale && (
        <div className="p-3 bg-primary-50 border border-primary/10 rounded-md">
          <p className="text-[13px] text-text-secondary leading-relaxed">{typeof currentQuestion.rationale === 'string' ? currentQuestion.rationale : (currentQuestion.rationale as any)?.correct || ''}</p>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-end">
        {!isChecked ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className={cn(
              'h-10 px-6 rounded-sm font-bold text-xs uppercase tracking-[0.15em] transition-all',
              selectedAnswer
                ? 'bg-camp-cobalt text-white hover:bg-primary-700'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed',
            )}
          >
            Check
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="h-10 px-6 rounded-sm bg-camp-cobalt text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-primary-700 transition-all"
          >
            {currentIdx === questions.length - 1 ? 'Done' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
