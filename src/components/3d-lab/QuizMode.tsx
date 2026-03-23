'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { useLabStore } from '@/stores/useLabStore'
import type { LabQuestion, HotspotData, QuizResult } from '@/types/3d-lab'

interface QuizModeProps {
  questions: LabQuestion[]
  hotspots: HotspotData[]
  moduleSlug: string
  onComplete: (results: QuizResult[]) => void
  onExit: () => void
}

type FeedbackState = 'none' | 'correct' | 'wrong'

export const QuizMode = ({
  questions,
  hotspots: _hotspots,
  moduleSlug: _moduleSlug,
  onComplete,
  onExit,
}: QuizModeProps) => {
  const addQuizResult = useLabStore((s) => s.addQuizResult)
  const quizResults = useLabStore((s) => s.quizResults)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState<number>(0)
  const [feedback, setFeedback] = useState<FeedbackState>('none')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [startTimeMs, setStartTimeMs] = useState(Date.now())
  const [flashBg, setFlashBg] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]
  const isAnswered = feedback !== 'none'

  // Reset slider default when question changes
  useEffect(() => {
    if (currentQuestion?.type === 'slider-adjust' && currentQuestion.correctValue !== undefined) {
      setSliderValue(currentQuestion.correctValue)
    }
    setStartTimeMs(Date.now())
    setFeedback('none')
    setFeedbackMessage('')
    setSelectedOptionId(null)
    setFlashBg(null)
  }, [currentIndex, currentQuestion])

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (isAnswered) return
      const timeMs = Date.now() - startTimeMs
      const correct = optionId === currentQuestion.correctOptionId

      const result: QuizResult = {
        questionId: currentQuestion.id,
        correct,
        selectedOptionId: optionId,
        timeMs,
      }
      addQuizResult(result)

      const correctOption = currentQuestion.options?.find(
        (o) => o.id === currentQuestion.correctOptionId
      )

      setSelectedOptionId(optionId)
      setFeedback(correct ? 'correct' : 'wrong')
      setFeedbackMessage(
        correct
          ? `Correct — ${correctOption?.text ?? ''}`
          : `Correct answer: ${correctOption?.text ?? ''}`
      )
      setFlashBg(correct ? 'rgba(45,159,111,0.12)' : 'rgba(214,69,69,0.12)')

      // Remove flash background after 500ms
      setTimeout(() => setFlashBg(null), 500)
    },
    [isAnswered, currentQuestion, startTimeMs, addQuizResult]
  )

  const handleSliderCheck = useCallback(() => {
    if (isAnswered || currentQuestion.correctValue === undefined) return
    const timeMs = Date.now() - startTimeMs
    const tolerance = (currentQuestion.correctValue * 0.1) || 5
    const correct = Math.abs(sliderValue - currentQuestion.correctValue) <= tolerance

    const result: QuizResult = {
      questionId: currentQuestion.id,
      correct,
      selectedValue: sliderValue,
      timeMs,
    }
    addQuizResult(result)

    setFeedback(correct ? 'correct' : 'wrong')
    setFeedbackMessage(
      correct
        ? `Correct — ${currentQuestion.correctValue}`
        : `Correct answer: ${currentQuestion.correctValue}`
    )
    setFlashBg(correct ? 'rgba(45,159,111,0.12)' : 'rgba(214,69,69,0.12)')
    setTimeout(() => setFlashBg(null), 500)
  }, [isAnswered, currentQuestion, sliderValue, startTimeMs, addQuizResult])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      // All questions done
      onComplete(quizResults)
    }
  }, [currentIndex, questions.length, quizResults, onComplete])

  if (!currentQuestion) return null

  const progress = (currentIndex / questions.length) * 100

  return (
    <>
      <style>{QUIZ_STYLES}</style>

      {/* Bottom sheet panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 250,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '512px',
            backgroundColor: flashBg
              ? flashBg
              : '#FFFFFF',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.14)',
            padding: '16px',
            maxHeight: '40vh',
            overflowY: 'auto',
            pointerEvents: 'auto',
            transition: 'background-color 150ms ease-out',
            animation: 'quiz-slide-up 200ms ease-out both',
          }}
        >
          {/* Header: question counter + progress */}
          <div style={{ marginBottom: '10px' }}>
            <p
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#8896A7',
                margin: '0 0 6px',
              }}
            >
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div
              style={{
                height: '2px',
                backgroundColor: '#EEF2FC',
                borderRadius: '1px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: '#1B3FC4',
                  transition: 'width 200ms ease-out',
                }}
              />
            </div>
          </div>

          {/* Question stem */}
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#1A2332',
              margin: '0 0 10px',
              lineHeight: 1.5,
            }}
          >
            {currentQuestion.stem}
          </p>

          {/* Multiple choice options */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id
                const isCorrect = option.id === currentQuestion.correctOptionId
                let bg = '#FFFFFF'
                let color = '#1A2332'
                let border = '1px solid #D4DAE3'
                let icon: React.ReactNode = null

                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    bg = '#2D9F6F'; color = '#FFFFFF'; border = '1px solid #2D9F6F'
                    icon = <CheckCircle size={14} color="#FFFFFF" weight="fill" style={{ flexShrink: 0 }} />
                  } else if (isSelected && !isCorrect) {
                    bg = '#D64545'; color = '#FFFFFF'; border = '1px solid #D64545'
                    icon = <XCircle size={14} color="#FFFFFF" weight="fill" style={{ flexShrink: 0 }} />
                  } else if (!isSelected && isCorrect) {
                    color = '#2D9F6F'; border = '1px solid #2D9F6F'
                  } else {
                    color = '#8896A7'; border = '1px solid #D4DAE3'
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(option.id)}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '11px',
                      lineHeight: 1.5,
                      borderRadius: '6px',
                      padding: '8px 12px',
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      width: '100%',
                      backgroundColor: bg,
                      color,
                      border,
                      transition: 'background-color 150ms ease-out, color 150ms ease-out',
                      opacity: isAnswered && !isSelected && !isCorrect ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (isAnswered) return
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EEF2FC'
                    }}
                    onMouseLeave={(e) => {
                      if (isAnswered) return
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'
                    }}
                  >
                    <span style={{ flex: 1 }}>{option.text}</span>
                    {icon}
                  </button>
                )
              })}
            </div>
          )}

          {/* Slider adjust */}
          {currentQuestion.type === 'slider-adjust' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              <input
                type="range"
                min={0}
                max={(currentQuestion.correctValue ?? 100) * 2}
                step={1}
                value={sliderValue}
                disabled={isAnswered}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#1B3FC4', cursor: isAnswered ? 'default' : 'pointer' }}
              />
              <p
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  color: '#1A2332',
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {sliderValue}
              </p>
              {!isAnswered && (
                <button
                  onClick={handleSliderCheck}
                  style={{
                    backgroundColor: '#1B3FC4',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1535A8'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1B3FC4'
                  }}
                >
                  Check
                </button>
              )}
            </div>
          )}

          {/* Hotspot click — prompt only, user taps the model */}
          {currentQuestion.type === 'hotspot-click' && (
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                color: '#4A5568',
                margin: '0 0 10px',
                lineHeight: 1.5,
              }}
            >
              Tap the correct hotspot on the model above.
            </p>
          )}

          {/* Feedback row */}
          {isAnswered && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                borderTop: '0.5px solid #D4DAE3',
                paddingTop: '10px',
                marginBottom: '10px',
                animation: 'quiz-fade-in 150ms ease-out both',
              }}
            >
              {feedback === 'correct' ? (
                <CheckCircle size={14} color="#2D9F6F" weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
              ) : (
                <XCircle size={14} color="#D64545" weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
              )}
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '11px',
                  color: feedback === 'correct' ? '#2D9F6F' : '#D64545',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {feedbackMessage}
              </p>
            </div>
          )}

          {/* Footer: next or exit */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {isAnswered && (
              <button
                onClick={handleNext}
                style={{
                  flex: 1,
                  backgroundColor: '#1B3FC4',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1535A8'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1B3FC4'
                }}
              >
                {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results'}
              </button>
            )}
            <button
              onClick={onExit}
              style={{
                backgroundColor: 'transparent',
                color: '#8896A7',
                border: '1px solid #D4DAE3',
                borderRadius: '6px',
                padding: '8px 12px',
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'color 150ms ease-out, border-color 150ms ease-out',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = '#1A2332'
                el.style.borderColor = '#8896A7'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.color = '#8896A7'
                el.style.borderColor = '#D4DAE3'
              }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const QUIZ_STYLES = `
@keyframes quiz-slide-up {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes quiz-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  [style*="quiz-slide-up"],
  [style*="quiz-fade-in"] {
    animation: none !important;
  }
}
`
