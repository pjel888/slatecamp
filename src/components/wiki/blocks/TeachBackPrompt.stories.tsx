import type { Meta, StoryObj } from '@storybook/react'
import { TeachBackPrompt } from './TeachBackPrompt'

const meta = {
  title: 'Wiki/Teaching/Teach Back Prompt',
  component: TeachBackPrompt,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/TeachBackPrompt',
      },
    },
  },
  args: {
    topicId: 'storybook-topic',
    topicName: 'Fire Safety Planning',
    entryPoint: 'wiki',
  },
} satisfies Meta<typeof TeachBackPrompt>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BlindspotEntry: Story = {
  args: {
    entryPoint: 'blindspot',
  },
}
