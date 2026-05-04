import type { Meta, StoryObj } from '@storybook/react'
import { WikiQuizButton } from './WikiQuizButton'

const meta = {
  title: 'Wiki/Teaching/Wiki Quiz Button',
  component: WikiQuizButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/quiz/WikiQuizButton',
      },
    },
  },
  args: {
    nodeId: 'storybook-topic',
    topicName: 'Fire Safety Planning',
    articleTitle: 'Fire Separation, Occupancy, and Exit Strategy',
    articleId: 'storybook-article',
  },
  render: (args) => (
    <div className="w-full max-w-xs">
      <WikiQuizButton {...args} />
    </div>
  ),
} satisfies Meta<typeof WikiQuizButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}


