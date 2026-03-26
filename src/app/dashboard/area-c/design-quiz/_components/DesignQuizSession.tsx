'use client'

import { useState, useCallback } from 'react'
import type { DesignScenario, HiddenTrap } from '@/lib/design-scenarios'
import { BriefPanel } from './BriefPanel'
import { QuestionCard } from './QuestionCard'
import { SolutionReveal } from './SolutionReveal'
import { ScenarioResults } from './ScenarioResults'

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
  const [finished, setFinished] = useState(false)

  const question = scenario.questions[currentIndex]
  const trapsForCurrent = question
    ? getTrapsForQuestion(question.number, scenario.hidden_traps)
    : []

  const handleCheck = useCallback(() => {
    if (selectedIndex === null || !question) return
    setChecked(true)
  }, [selectedIndex, question])

  const handleNext = useCallback(() => {
    if (selectedIndex === null || !question) return

    const isCorrect = selectedIndex === question.correct_answer_index
    const trapAffected = getTrapsForQuestion(question.number, scenario.hidden_traps).length > 0

    const record: AnswerRecord = {
      questionNumber: question.number,
      selectedIndex,
      correct: isCorrect,
      trapAffected,
    }

    const updatedAnswers = [...answers, record]
    setAnswers(updatedAnswers)

    const nextIndex = currentIndex + 1
    if (nextIndex >= scenario.questions.length) {
      setFinished(true)
    } else {
      setCurrentIndex(nextIndex)
      setSelectedIndex(null)
      setChecked(false)
    }
  }, [selectedIndex, question, answers, currentIndex, scenario])

  return (
    <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 lg:items-start'>
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
              options={question.options.map((o: string | { text: string }) => typeof o === 'string' ? o : o.text)}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              onCheck={handleCheck}
              checked={checked}
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
