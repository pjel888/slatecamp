import type { Meta, StoryObj } from '@storybook/react'
import { WikiQuizModal } from './WikiQuizModal'

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
  render: (args) => <WikiQuizModal {...args} />,
} satisfies Meta<typeof WikiQuizModal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
