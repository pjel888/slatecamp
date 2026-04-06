import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { QuestionDotNavigator } from './question-dot-navigator'

const meta = {
  title: 'Shared/QuestionDotNavigator',
  component: QuestionDotNavigator,
  tags: ['autodocs'],
  args: {
    dots: [],
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/question-dot-navigator',
      },
    },
  },
} satisfies Meta<typeof QuestionDotNavigator>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <QuestionDotNavigator
      dots={[
        { index: 0, status: 'answered' },
        { index: 1, status: 'flagged' },
        { index: 2, status: 'current' },
        { index: 3, status: 'unanswered' },
        { index: 4, status: 'correct' },
        { index: 5, status: 'incorrect' },
      ]}
    />
  ),
}

export const Interactive: Story = {
  render: () => {
    const [currentIndex, setCurrentIndex] = React.useState(2)

    const dots: React.ComponentProps<typeof QuestionDotNavigator>['dots'] = Array.from(
      { length: 10 },
      (_, index) => ({
      index,
      status:
        index === currentIndex
          ? 'current'
          : index === 6
            ? 'flagged'
            : index < currentIndex
              ? 'answered'
              : 'unanswered',
      }),
    )

    return (
      <div className="space-y-3">
        <QuestionDotNavigator dots={dots} onDotClick={setCurrentIndex} />
        <p className="text-xs text-muted-foreground">Current question: {currentIndex + 1}</p>
      </div>
    )
  },
}
