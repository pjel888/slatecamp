import type { Meta, StoryObj } from '@storybook/react'
import { WrongAnswerBanner } from './WrongAnswerBanner'

const meta = {
  title: 'Wiki/Teaching/Wrong Answer Banner',
  component: WrongAnswerBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/WrongAnswerBanner',
      },
    },
  },
  args: {
    fromWrongAnswer: true,
    topicName: 'Travel Distance',
  },
} satisfies Meta<typeof WrongAnswerBanner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Hidden: Story = {
  args: {
    fromWrongAnswer: false,
  },
}
