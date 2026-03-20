'use client'

import {
  RationaleDrawer,
  AITutorDrawer,
  ErrorTypePrompt,
} from '@/components/quiz'
import type { Question, Choice } from '@/types/app'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizDrawersProps {
  currentQuestion: Question
  options: Choice[]
  correctOptionId: string | undefined
  selectedAnswer: string | undefined
  isChecked: boolean
  isRationaleVisible: boolean
  isAIOpen: boolean
  showErrorPrompt: boolean
  errorPromptQuestionId: string | null
  onRationaleClose: () => void
  onWikiClick: () => void
  onAddNote: () => void
  on3DLabClick: (() => void) | undefined
  onErrorTypeSelect: (errorType: string) => void
  onErrorTypeSkip: () => void
  onAIClose: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const QuizDrawers = ({
  currentQuestion,
  options,
  correctOptionId,
  selectedAnswer,
  isChecked,
  isRationaleVisible,
  isAIOpen,
  showErrorPrompt,
  errorPromptQuestionId,
  onRationaleClose,
  onWikiClick,
  onAddNote,
  on3DLabClick,
  onErrorTypeSelect,
  onErrorTypeSkip,
  onAIClose,
}: QuizDrawersProps) => (
  <>
    <RationaleDrawer
      rationale={currentQuestion.rationale}
      explanation={currentQuestion.explanation}
      codeCitation={currentQuestion.code_citation}
      correctAnswerText={
        isChecked && correctOptionId
          ? (options.find((o) => o.id === correctOptionId)?.text ?? null)
          : null
      }
      modelId={currentQuestion.model_id}
      isVisible={isRationaleVisible}
      isCorrect={selectedAnswer === correctOptionId}
      onClose={onRationaleClose}
      onWikiClick={onWikiClick}
      onAddNote={onAddNote}
      on3DLabClick={on3DLabClick}
    />
    {/* Error taxonomy prompt — shown after wrong answers in camp mode */}
    {showErrorPrompt && errorPromptQuestionId === currentQuestion.question_id && isRationaleVisible && selectedAnswer !== correctOptionId && (
      <div className="px-5 max-w-[900px] mx-auto">
        <ErrorTypePrompt
          onSelect={onErrorTypeSelect}
          onSkip={onErrorTypeSkip}
        />
      </div>
    )}
    <AITutorDrawer
      question={currentQuestion}
      selectedOptionId={selectedAnswer}
      options={options}
      isVisible={isAIOpen}
      onClose={onAIClose}
    />
  </>
)
