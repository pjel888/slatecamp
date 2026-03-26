'use client'

import { QuestionColumn } from './QuestionColumn'
import { OptionsColumn } from './OptionsColumn'
import { GenerationInput } from './GenerationInput'
import type { GenerationQuestionType } from './GenerationInput'
import type { QuestionForClient, FeedbackData, QuizSessionConfig } from '@/types/quiz-config'

interface QuizBodyProps {
  question: QuestionForClient
  selectedOptionId: string | null
  confidenceLevel: 1 | 2 | 3 | null
  feedback: FeedbackData | null
  config: QuizSessionConfig
  onSelectOption: (optionId: string) => void
  onConfidenceChange: (level: 1 | 2 | 3) => void
  onSubmit: () => void
  onNext: () => void
}

/** Check if a question is a generation (non-MCQ) type */
const isGenerationType = (type: string | undefined): type is GenerationQuestionType =>
  type === 'numeric' || type === 'short_text' || type === 'formula'

export const QuizBody = ({
  question,
  selectedOptionId,
  confidenceLevel,
  feedback,
  config,
  onSelectOption,
  onConfidenceChange,
  onSubmit,
  onNext,
}: QuizBodyProps) => {
  const questionType = question.question_type ?? 'mcq'
  const isGeneration = isGenerationType(questionType)

  return (
    // IMMUTABLE two-column layout:
    // < md (768px): single column stacked
    // >= md: 50/50 split with vertical divider
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-120px)]">
      {/* Left: question */}
      <div className="p-4 md:p-6 lg:p-8 md:border-r md:border-[#D4DAE3] overflow-y-auto">
        <QuestionColumn
          question={question}
        />
      </div>

      {/* Right: options (MCQ) or generation input (numeric/short_text/formula) */}
      <div className="p-4 md:p-6 lg:p-8 overflow-y-auto">
        {isGeneration ? (
          <GenerationInput
            question={question}
            questionType={questionType}
            unit={question.unit ?? undefined}
            confidenceLevel={confidenceLevel}
            feedback={feedback}
            config={config}
            onSubmit={onSubmit}
            onConfidenceChange={onConfidenceChange}
            onNext={onNext}
          />
        ) : (
          <OptionsColumn
            question={question}
            selectedOptionId={selectedOptionId}
            confidenceLevel={confidenceLevel}
            feedback={feedback}
            config={config}
            onSelectOption={onSelectOption}
            onConfidenceChange={onConfidenceChange}
            onSubmit={onSubmit}
            onNext={onNext}
          />
        )}
      </div>
    </div>
  )
}
