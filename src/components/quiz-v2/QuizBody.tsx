'use client'

import { QuestionColumn } from './QuestionColumn'
import { OptionsColumn } from './OptionsColumn'
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
  return (
    // IMMUTABLE two-column layout:
    // < md (768px): single column stacked
    // >= md: 50/50 split with vertical divider
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-120px)]">
      {/* Left: question */}
      <div className="p-4 md:p-6 lg:p-8 md:border-r md:border-[#D4DAE3] overflow-y-auto">
        <QuestionColumn
          question={question}
          confidenceLevel={confidenceLevel}
          showConfidence={config.feedback.showConfidenceRating}
          onConfidenceChange={onConfidenceChange}
        />
      </div>

      {/* Right: options */}
      <div className="p-4 md:p-6 lg:p-8 overflow-y-auto">
        <OptionsColumn
          question={question}
          selectedOptionId={selectedOptionId}
          feedback={feedback}
          config={config}
          onSelectOption={onSelectOption}
          onSubmit={onSubmit}
          onNext={onNext}
        />
      </div>
    </div>
  )
}
