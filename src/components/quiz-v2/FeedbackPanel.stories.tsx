import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FeedbackPanel } from './FeedbackPanel'

const mockQuestion = {
  question_id: 'q1',
  stem: 'What is the minimum width of a corridor in a residential building per PD 1096?',
  options: [
    { id: 'a', letter: 'A', text: '1.10 meters' },
    { id: 'b', letter: 'B', text: '1.20 meters' },
    { id: 'c', letter: 'C', text: '1.50 meters' },
    { id: 'd', letter: 'D', text: '0.90 meters' },
  ],
  taxonomy_breadcrumb: 'Building Laws > PD 1096',
} as any

const meta = {
  title: 'Quiz-v2/FeedbackPanel',
  component: FeedbackPanel,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedbackPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Correct: Story = {
  args: {
    feedback: {
      questionId: 'q1',
      isCorrect: true,
      correctOptionId: 'b',
      rationale: 'Rule VIII of the IRR of PD 1096 specifies a minimum corridor width of 1.20 meters for residential buildings.',
    } as any,
    question: mockQuestion,
    selectedOptionId: 'b',
    gatedDelayMs: 0,
    onNext: () => console.log('Next'),
  },
}

export const Incorrect: Story = {
  args: {
    feedback: {
      questionId: 'q1',
      isCorrect: false,
      correctOptionId: 'b',
      rationale: 'Rule VIII of the IRR of PD 1096 specifies a minimum corridor width of 1.20 meters for residential buildings.',
      errorDiagnostic: {
        category: 'misremembered_fact',
        message: 'You might be thinking of the requirement for BP 344 which has different clearances.',
      },
    } as any,
    question: mockQuestion,
    selectedOptionId: 'a',
    gatedDelayMs: 0,
    onNext: () => console.log('Next'),
  },
}

export const WithCountdown: Story = {
  args: {
    ...Incorrect.args,
    gatedDelayMs: 5000,
  },
}
