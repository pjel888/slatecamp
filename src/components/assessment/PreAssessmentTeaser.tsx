'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

/**
 * Pre-Assessment Teaser — UX Strategy Section 4 (Step 2)
 *
 * 5 sample questions before account creation. Public, no auth.
 * After completion: "Create a free account to see your score."
 * The account gate becomes "save your results" not "sign up for a product."
 */

// Sample questions — representative of LEA subjects
const SAMPLE_QUESTIONS = [
  {
    id: 'sample-1',
    subject: 'Building Laws',
    text: 'What is the minimum setback distance from a property line for a residential building under PD 1096?',
    options: [
      { id: 'a', text: '2.0 meters' },
      { id: 'b', text: '3.0 meters' },
      { id: 'c', text: '4.5 meters' },
      { id: 'd', text: '5.0 meters' },
    ],
    correctId: 'a',
  },
  {
    id: 'sample-2',
    subject: 'Structural Design',
    text: 'In a reinforced concrete beam, what is the primary purpose of stirrups?',
    options: [
      { id: 'a', text: 'Increase flexural strength' },
      { id: 'b', text: 'Resist shear forces' },
      { id: 'c', text: 'Prevent corrosion of main bars' },
      { id: 'd', text: 'Reduce deflection' },
    ],
    correctId: 'b',
  },
  {
    id: 'sample-3',
    subject: 'Building Utilities',
    text: 'According to the National Plumbing Code, what is the minimum pipe diameter for a water closet drain?',
    options: [
      { id: 'a', text: '50mm (2 inches)' },
      { id: 'b', text: '75mm (3 inches)' },
      { id: 'c', text: '100mm (4 inches)' },
      { id: 'd', text: '150mm (6 inches)' },
    ],
    correctId: 'c',
  },
  {
    id: 'sample-4',
    subject: 'History of Architecture',
    text: 'The Pantheon in Rome is notable for which structural innovation?',
    options: [
      { id: 'a', text: 'Flying buttresses' },
      { id: 'b', text: 'Unreinforced concrete dome with oculus' },
      { id: 'c', text: 'Steel frame construction' },
      { id: 'd', text: 'Post-tensioned concrete' },
    ],
    correctId: 'b',
  },
  {
    id: 'sample-5',
    subject: 'Architectural Practice',
    text: 'Under RA 9266 (Architecture Act of 2004), who is authorized to sign and seal architectural documents in the Philippines?',
    options: [
      { id: 'a', text: 'Any licensed engineer' },
      { id: 'b', text: 'A registered and licensed architect' },
      { id: 'c', text: 'The building owner' },
      { id: 'd', text: 'A certified construction manager' },
    ],
    correctId: 'b',
  },
]

export const PreAssessmentTeaser = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [completed, setCompleted] = useState(false)

  const question = SAMPLE_QUESTIONS[currentIndex]
  const isLast = currentIndex === SAMPLE_QUESTIONS.length - 1
  const correctCount = Array.from(answers.entries()).filter(
    ([qId, optId]) => SAMPLE_QUESTIONS.find((q) => q.id === qId)?.correctId === optId,
  ).length

  const handleConfirm = () => {
    if (!selectedOption) return
    const newAnswers = new Map(answers)
    newAnswers.set(question.id, selectedOption)
    setAnswers(newAnswers)
    setShowResult(true)
  }

  const handleNext = () => {
    if (isLast) {
      setCompleted(true)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedOption(null)
    setShowResult(false)
  }

  // ── Completion: Account gate ──────────────────────────────
  if (completed) {
    const score = Math.round((correctCount / SAMPLE_QUESTIONS.length) * 100)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-text-tertiary">
            Sample complete
          </p>
          <p className="mt-4 font-[family-name:var(--font-boldonse)] text-3xl font-bold text-text-primary">
            {correctCount} of {SAMPLE_QUESTIONS.length} correct
          </p>
          <p className="mt-3 text-sm text-text-secondary max-w-xs mx-auto">
            That was just 5 questions across 5 subjects. The full diagnostic is 35 questions
            and gives you a complete Readiness Score.
          </p>
          <Link
            href={ROUTES.auth.register}
            className="mt-8 inline-flex w-full max-w-sm items-center justify-center rounded-sm px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            Create a free account to see your full score
          </Link>
          <Link
            href={ROUTES.home}
            className="mt-3 block text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  // ── Question UI ───────────────────────────────────────────
  const isCorrect = showResult && selectedOption === question.correctId

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-border px-5 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">Try SlateCamp</span>
          <span className="font-[family-name:var(--font-dm-mono)] text-xs text-text-tertiary">
            {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="shrink-0 h-1 bg-border/40">
        <div
          className="h-full bg-camp-cobalt transition-all duration-150 ease-out"
          style={{ width: `${((currentIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-camp-cobalt mb-3">
            {question.subject}
          </p>
          <h2 className="text-lg font-semibold text-text-primary leading-relaxed mb-6">
            {question.text}
          </h2>

          <div className="flex flex-col gap-2">
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id
              const isCorrectOption = option.id === question.correctId
              const showCorrect = showResult && isCorrectOption
              const showWrong = showResult && isSelected && !isCorrectOption

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => !showResult && setSelectedOption(option.id)}
                  disabled={showResult}
                  className={`w-full text-left rounded-sm border px-4 py-3 text-sm transition-colors duration-150 ${
                    showCorrect
                      ? 'border-emerald bg-success-50 text-text-primary'
                      : showWrong
                        ? 'border-destructive bg-destructive-50 text-text-primary'
                        : isSelected
                          ? 'border-camp-cobalt bg-primary-50 text-text-primary'
                          : 'border-border bg-white text-text-secondary hover:border-camp-cobalt hover:bg-primary-50/50'
                  }`}
                >
                  {option.text}
                </button>
              )
            })}
          </div>

          {/* Action */}
          <div className="mt-6">
            {!showResult ? (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedOption}
                className="w-full rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out disabled:opacity-40"
                style={{ backgroundColor: '#1B3FC4' }}
              >
                Confirm Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="w-full rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700"
                style={{ backgroundColor: '#1B3FC4' }}
              >
                {isLast ? 'See Results' : 'Next Question'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

