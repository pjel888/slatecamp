import type { Meta, StoryObj } from '@storybook/react'
import { WikiQuizModal } from './WikiQuizModal'
import { setWikiQuizMockBehavior } from '@/storybook/mocks/wiki-quiz'

const meta = {
  title: 'Wiki/Teaching/Wiki Quiz Modal',
  component: WikiQuizModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Source: @/components/wiki/quiz/WikiQuizModal',
      },
    },
  },
  args: {
    nodeId: 'storybook-topic',
    topicName: 'Fire Safety Planning',
    articleSlug: 'fire-separation-occupancy-exit-strategy',
    articleTitle: 'Fire Separation, Occupancy, and Exit Strategy',
    articleId: 'storybook-article-id',
    onClose: () => undefined,
  },
} satisfies Meta<typeof WikiQuizModal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    setWikiQuizMockBehavior('questions')
    return <WikiQuizModal {...args} />
  },
}

export const ErrorState: Story = {
  render: (args) => {
    setWikiQuizMockBehavior('error')
    return <WikiQuizModal {...args} />
  },
}

export const EmptyState: Story = {
  render: (args) => {
    setWikiQuizMockBehavior('empty')
    return <WikiQuizModal {...args} />
  },
}
