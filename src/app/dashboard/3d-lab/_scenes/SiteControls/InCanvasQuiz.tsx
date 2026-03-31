'use client'

import { useState, useEffect, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

interface QuizQuestion {
  question: string
  choices: string[]
  correctIndex: number
  position: [number, number, number]
}

function buildQuestions(
  tla: number,
  setbacks: { front: number; rear: number; left: number; right: number },
  tgfa: number,
  ambf: number,
  buildingHeight: number,
  lotWidth: number,
  lotDepth: number,
): (QuizQuestion | null)[] {
  const r = (v: number) => v.toFixed(1)

  return [
    // Step 0 — Locate
    {
      question: 'What is the TLA of this lot?',
      choices: [
        `${r(tla)} sqm`,
        `${r(tla * 1.5)} sqm`,
        `${r(tla * 0.5)} sqm`,
      ],
      correctIndex: 0,
      position: [lotWidth / 2, 1, lotDepth / 2],
    },
    // Step 1 — Setbacks
    {
      question: 'What is the minimum front setback for this zoning class?',
      choices: [
        `${r(setbacks.front)}m`,
        '2.0m',
        '5.0m',
      ],
      correctIndex: 0,
      position: [lotWidth / 2, 1, setbacks.front / 2],
    },
    // Step 2 — AMBF
    {
      question: 'What limits the AMBF — setbacks or PSO?',
      choices: [
        'Whichever is smaller',
        'Always setbacks',
        'Always PSO',
      ],
      correctIndex: 0,
      position: [lotWidth / 2, buildingHeight * 0.5 + 0.5, lotDepth / 2],
    },
    // Step 3 — Build Height
    {
      question: 'What is the total GFA for this building?',
      choices: [
        `${r(tgfa)} sqm`,
        `${r(ambf)} sqm`,
        `${r(tla)} sqm`,
      ],
      correctIndex: 0,
      position: [lotWidth / 2, buildingHeight + 1, lotDepth / 2],
    },
    // Step 4 — Open Space
    {
      question: 'What is PSO — a ratio or an area?',
      choices: [
        'A ratio (AMBF/TLA)',
        'An area in sqm',
        'A percentage of TOSL',
      ],
      correctIndex: 0,
      position: [lotWidth / 2, 0.5, lotDepth / 2],
    },
    // Step 5 — Sandbox: no quiz
    null,
  ]
}

export function InCanvasQuiz() {
  const tourStep = useSiteControlsStore((s) => s.tourStep)
  const computed = useSiteControlsStore((s) => s.computed)
  const inputs = useSiteControlsStore((s) => s.inputs)

  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset state and restart timer whenever tourStep changes
  useEffect(() => {
    setShowQuiz(false)
    setSelectedAnswer(null)
    setAnsweredCorrectly(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    if (dismissRef.current) clearTimeout(dismissRef.current)

    // No quiz for null (sandbox) or step 5
    if (tourStep === null || tourStep === 5) return

    timerRef.current = setTimeout(() => {
      setShowQuiz(true)
    }, 8000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (dismissRef.current) clearTimeout(dismissRef.current)
    }
  }, [tourStep])

  const questions = buildQuestions(
    computed.tla,
    computed.setbacks,
    computed.tgfa,
    computed.ambf,
    computed.buildingHeight,
    inputs.lotWidth,
    inputs.lotDepth,
  )

  // Guard: null step, step 5, quiz not yet visible, or already answered correctly
  if (tourStep === null || tourStep === 5) return null
  if (!showQuiz) return null
  if (answeredCorrectly) return null

  const question = questions[tourStep]
  if (!question) return null

  function handleChoice(index: number) {
    if (selectedAnswer !== null && answeredCorrectly) return
    if (!question) return

    setSelectedAnswer(index)

    if (index === question.correctIndex) {
      setAnsweredCorrectly(true)
      dismissRef.current = setTimeout(() => {
        setShowQuiz(false)
      }, 1500)
    }
  }

  function getButtonClass(index: number): string {
    const base =
      'w-full text-left rounded-sm border px-3 py-2 text-xs transition-colors duration-150 cursor-pointer'

    if (selectedAnswer === null) {
      return `${base} border-[#D4DAE3] text-[#4A5568] hover:bg-[#EEF2FC] hover:border-[#1B3FC4]`
    }

    if (index === question!.correctIndex) {
      return `${base} bg-[#EDFAF4] border-[#2D9F6F] text-[#2D9F6F]`
    }

    if (index === selectedAnswer) {
      return `${base} bg-[#FDF0F0] border-[#D64545] text-[#D64545]`
    }

    return `${base} border-[#D4DAE3] text-[#4A5568] opacity-50`
  }

  return (
    <Html
      position={question.position}
      center
      distanceFactor={10}
      zIndexRange={[100, 0]}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-md border border-[#D4DAE3] shadow-sm p-4 w-64">
        <p className="text-sm font-medium text-[#1A2332] mb-3">
          {question.question}
        </p>
        <div className="flex flex-col gap-2">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              className={getButtonClass(i)}
              onClick={() => handleChoice(i)}
              disabled={answeredCorrectly}
            >
              {choice}
            </button>
          ))}
        </div>
        {selectedAnswer !== null && answeredCorrectly && (
          <p className="text-xs font-medium text-[#2D9F6F] mt-2">Correct!</p>
        )}
        {selectedAnswer !== null && !answeredCorrectly && (
          <p className="text-xs font-medium text-[#D64545] mt-2">
            Not quite — try again.
          </p>
        )}
      </div>
    </Html>
  )
}
