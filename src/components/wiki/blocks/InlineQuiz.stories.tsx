import type { Meta, StoryObj } from '@storybook/react'
import { InlineQuiz } from './InlineQuiz'
import { wikiInlineQuizOptionsFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Teaching/Inline Quiz',
  component: InlineQuiz,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/InlineQuiz',
      },
    },
  },
  args: {
    question: 'Which two values should you compare first when checking the minimum number of exits?',
    options: wikiInlineQuizOptionsFixture,
    rationale:
      'Occupant load establishes how much egress capacity the floor needs before you test the exceptions.',
  },
} satisfies Meta<typeof InlineQuiz>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
