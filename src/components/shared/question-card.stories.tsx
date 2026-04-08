import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'
import { QuestionCard } from './question-card'

const options = [
  {
    id: 'a',
    label: 'A',
    text: 'A site analysis is optional if the lot has already been surveyed.',
  },
  {
    id: 'b',
    label: 'B',
    text: 'A site analysis should examine climate, access, context, and legal constraints before design decisions.',
    isCorrect: true,
  },
  {
    id: 'c',
    label: 'C',
    text: 'A site analysis only applies to projects larger than one hectare.',
  },
  {
    id: 'd',
    label: 'D',
    text: 'A site analysis is only used during final presentation boards.',
  },
]

const meta = {
  title: 'Shared/QuestionCard',
  component: QuestionCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/shared/question-card',
      },
    },
  },
  args: {
    variant: 'quiz',
    stem: '<p>Which statement best describes the role of site analysis in architectural planning?</p>',
    options,
  },
} satisfies Meta<typeof QuestionCard>

export default meta

type Story = StoryObj<typeof meta>

export const Quiz: Story = {
  render: (args) => {
    const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null)
    const [submitted, setSubmitted] = React.useState(false)

    return (
      <div className="w-[720px] max-w-full space-y-3">
        <QuestionCard
          {...args}
          variant="quiz"
          questionNumber={4}
          totalQuestions={20}
          selectedOptionId={selectedOptionId}
          onSelectOption={setSelectedOptionId}
          submitted={submitted}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setSubmitted(true)}
            disabled={!selectedOptionId || submitted}
          >
            Check answer
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedOptionId(null)
              setSubmitted(false)
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    )
  },
}

export const Review: Story = {
  args: {
    variant: 'review',
    userAnswerId: 'a',
    correctAnswerId: 'b',
    rationale:
      '<p>Site analysis informs design decisions by grounding them in context, constraints, and environmental conditions.</p>',
    questionNumber: 4,
    totalQuestions: 20,
  },
}

export const Preview: Story = {
  args: {
    variant: 'preview',
    metadata: {
      difficulty: 0.62,
      leaId: 'AR-PLN-014',
      topicName: 'Planning and Site Design',
      status: 'Published',
    },
    rationale:
      '<p>Preview mode highlights the correct answer and exposes the editorial metadata used in the question bank.</p>',
  },
}

export const Compact: Story = {
  args: {
    variant: 'compact',
    questionNumber: 12,
    stem: 'Which planning document establishes setback requirements for a residential lot?',
    metadata: {
      difficulty: 'Medium',
      status: 'Draft',
    },
  },
}
