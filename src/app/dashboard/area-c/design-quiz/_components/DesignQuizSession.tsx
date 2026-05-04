'use client'

import { useState, useCallback, useMemo } from 'react'
import { runWithLoading } from '@/hooks/useGlobalLoading'
import type { DesignScenario, HiddenTrap } from '@/lib/design-scenarios'
import { BriefPanel } from './BriefPanel'
import { QuestionCard } from './QuestionCard'
import { SolutionReveal } from './SolutionReveal'
import { ScenarioResults } from './ScenarioResults'
import { SubmitConfirmModal } from '@/components/quiz-v2/SubmitConfirmModal'
import type { QuestionForClient, QuizAnswerState, QuestionStatus } from '@/types/quiz-config'

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
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({})
  const [finished, setFinished] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)

  const question = scenario.questions[currentIndex]
  const trapsForCurrent = question
    ? getTrapsForQuestion(question.number, scenario.hidden_traps)
    : []

  // Map Design Scenario questions to the unified QuestionForClient type for the modal/reused components
  const unifiedQuestions: QuestionForClient[] = useMemo(() => {
    return scenario.questions.map((q, idx) => ({
      question_id: q.question_id,
      topic_id: '', // Placeholder for scenario questions
      difficulty: 0.5, // Placeholder for scenario questions
      position: idx + 1,
      stem: q.question_stem,
      image_url: null,
      image_alt_text: null,
      taxonomy_breadcrumb: 'Design Scenario',
      difficulty_label: 'Medium' as const,
      question_type: 'mcq' as const,
      options: (Array.isArray(q.options) ? q.options : []).map((o, oIdx) => ({
        id: oIdx.toString(),
        letter: String.fromCharCode(65 + oIdx) as 'A' | 'B' | 'C' | 'D',
        text: typeof o === 'string' ? o : o.text
      }))
    }))
  }, [scenario.questions])

  // Current unified question
  const currentUnifiedQuestion = unifiedQuestions[currentIndex]

  // Map internal answers to the unified QuizAnswerState for the modal
  const unifiedAnswers = useMemo(() => {
    const record: Record<string, QuizAnswerState> = {}
    answers.forEach(a => {
      const q = scenario.questions.find(sq => sq.number === a.questionNumber)
      if (q) {
        record[q.question_id] = {
          selectedOptionId: a.selectedIndex.toString(),
          confidenceLevel: null,
          isCorrect: a.correct,
          isSkipped: false,
          isFlagged: false,
          timeStartedMs: 0,
          timeSpentMs: 0,
          submittedAt: null,
          questionStatus: (a.correct !== null ? 'reviewed' : 'idle') as QuestionStatus,
        }
      }
    })
    return record
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
    runWithLoading(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setFinished(true)
      setIsCalculating(false)
    }, 'Calculating your results…')
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
      const current = prev[questionId] ?? []
      const next = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId]
      return { ...prev, [questionId]: next }
    })
  }, [])

  return (
    <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start'>
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
              eliminatedIds={new Set(eliminatedOptions[question.question_id] || [])}
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
