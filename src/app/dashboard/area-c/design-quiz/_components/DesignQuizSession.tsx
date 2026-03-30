'use client'

import { useState, useCallback, useMemo } from 'react'
import type { DesignScenario, HiddenTrap, DesignScenarioQuestion } from '@/lib/design-scenarios'
import { BriefPanel } from './BriefPanel'
import { QuestionCard } from './QuestionCard'
import { SolutionReveal } from './SolutionReveal'
import { ScenarioResults } from './ScenarioResults'
import { CalculatingResultsOverlay } from '@/components/quiz-v2/CalculatingResultsOverlay'
import { SubmitConfirmModal } from '@/components/quiz-v2/SubmitConfirmModal'
import type { QuestionForClient, QuizAnswerState } from '@/types/quiz-config'

type AnswerRecord = {
  questionNumber: number
  selectedIndex: number
  correct: boolean
  trapAffected: boolean
}

type DesignQuizSessionProps = {
  scenario: DesignScenario
}

const getTrapsForQuestion = (
  questionNumber: number,
  traps: HiddenTrap[],
): HiddenTrap[] =>
  traps.filter((t) => t.affected_questions.includes(questionNumber))

export const DesignQuizSession = ({ scenario }: DesignQuizSessionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [eliminatedOptions, setEliminatedOptions] = useState<Map<string, Set<string>>>(new Map())
  const [finished, setFinished] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)

  const question = scenario.questions[currentIndex]
  const trapsForCurrent = question
    ? getTrapsForQuestion(question.number, scenario.hidden_traps)
    : []

  // Map Design Scenario questions to the unified QuestionForClient type for the modal/reused components
  const unifiedQuestions: QuestionForClient[] = useMemo(() => {
    return scenario.questions.map(q => ({
      question_id: q.question_id,
      text: q.question_stem,
      options: (Array.isArray(q.options) ? q.options : []).map((o, idx) => ({
        id: idx.toString(),
        letter: String.fromCharCode(65 + idx),
        text: typeof o === 'string' ? o : o.text
      })),
      topic_id: 'design-quiz',
      difficulty: 0.5,
      question_number: q.number,
      question_type: 'mcq'
    }))
  }, [scenario.questions])

  // Current unified question
  const currentUnifiedQuestion = unifiedQuestions[currentIndex]

  // Map internal answers to the unified QuizAnswerState for the modal
  const unifiedAnswers = useMemo(() => {
    const map = new Map<string, QuizAnswerState>()
    answers.forEach(a => {
      const q = scenario.questions.find(sq => sq.number === a.questionNumber)
      if (q) {
        map.set(q.question_id, {
          selectedOptionId: a.selectedIndex.toString(),
          confidenceLevel: null,
          isSkipped: false,
          isFlagged: false,
          answerChanges: 0,
          timeSpentMs: 0
        })
      }
    })
    return map
  }, [answers, scenario.questions])

  const handleCheck = useCallback(() => {
    if (selectedIndex === null || !question) return
    setChecked(true)

    const isCorrect = selectedIndex === question.correct_answer_index
    const trapAffected = getTrapsForQuestion(question.number, scenario.hidden_traps).length > 0

    const record: AnswerRecord = {
      questionNumber: question.number,
      selectedIndex,
      correct: isCorrect,
      trapAffected,
    }

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionNumber !== question.number)
      return [...filtered, record]
    })
  }, [selectedIndex, question, scenario.hidden_traps])

  const handleFinish = useCallback(() => {
    setSubmitModalOpen(false)
    setIsCalculating(true)
    setTimeout(() => {
      setFinished(true)
      setIsCalculating(false)
    }, 1500)
  }, [])

  const handleNext = useCallback(() => {
    const isLast = currentIndex === scenario.questions.length - 1
    
    if (isLast) {
      if (answers.length === scenario.questions.length) {
        handleFinish()
      } else {
        setSubmitModalOpen(true)
      }
    } else {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      
      const nextQuestion = scenario.questions[nextIndex]
      const existing = answers.find(a => a.questionNumber === nextQuestion.number)
      if (existing) {
        setSelectedIndex(existing.selectedIndex)
        setChecked(true)
      } else {
        setSelectedIndex(null)
        setChecked(false)
      }
    }
  }, [currentIndex, scenario.questions, answers, handleFinish])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      
      const prevQuestion = scenario.questions[prevIndex]
      const existing = answers.find(a => a.questionNumber === prevQuestion.number)
      if (existing) {
        setSelectedIndex(existing.selectedIndex)
        setChecked(true)
      } else {
        setSelectedIndex(null)
        setChecked(false)
      }
    }
  }, [currentIndex, scenario.questions, answers])

  const handleReviewUnanswered = useCallback(() => {
    const firstUnanswered = scenario.questions.findIndex(q => 
      !answers.some(a => a.questionNumber === q.number)
    )
    if (firstUnanswered !== -1) {
      setCurrentIndex(firstUnanswered)
      setSelectedIndex(null)
      setChecked(false)
    }
    setSubmitModalOpen(false)
  }, [scenario.questions, answers])

  const toggleEliminate = useCallback((questionId: string, optionId: string) => {
    setEliminatedOptions(prev => {
      const next = new Map(prev)
      const set = new Set(next.get(questionId) || [])
      if (set.has(optionId)) set.delete(optionId)
      else set.add(optionId)
      next.set(questionId, set)
      return next
    })
  }, [])

  return (
    <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start'>
      {/* Calculating results overlay */}
      {isCalculating && <CalculatingResultsOverlay />}

      {/* Submit Confirmation Modal */}
      {submitModalOpen && (
        <SubmitConfirmModal
          questions={unifiedQuestions}
          answers={unifiedAnswers}
          flaggedSet={new Set()}
          currentIndex={currentIndex}
          onReviewUnanswered={handleReviewUnanswered}
          onSubmit={handleFinish}
          onClose={() => setSubmitModalOpen(false)}
        />
      )}

      {/* Left: Brief panel — sticky on desktop, stacked on mobile */}
      <div className='w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto'>
        <BriefPanel scenario={scenario} />
      </div>

      {/* Right: Question flow */}
      <div className='flex-1 min-w-0 flex flex-col gap-4'>
        {finished ? (
          <ScenarioResults scenario={scenario} answers={answers} />
        ) : question ? (
          <>
            <QuestionCard
              questionNumber={question.number}
              totalQuestions={scenario.questions.length}
              questionStem={question.question_stem}
              options={currentUnifiedQuestion.options.map(o => o.text)}
              selectedIndex={selectedIndex}
              eliminatedIds={eliminatedOptions.get(question.question_id) || new Set()}
              onSelect={setSelectedIndex}
              onCheck={handleCheck}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onToggleEliminate={(optionIdx) => toggleEliminate(question.question_id, optionIdx.toString())}
              checked={checked}
              isFirst={currentIndex === 0}
              isLast={currentIndex === scenario.questions.length - 1}
            />
            {checked && (
              <SolutionReveal
                question={question}
                selectedIndex={selectedIndex!}
                trapsForQuestion={trapsForCurrent}
                onNext={handleNext}
                isLast={currentIndex === scenario.questions.length - 1}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
