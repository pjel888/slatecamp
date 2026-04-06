import type { Meta, StoryObj } from '@storybook/react'
import { ElaborativeInterrogation } from './ElaborativeInterrogation'
import { wikiElaborativeOptionsFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Teaching/Elaborative Interrogation',
  component: ElaborativeInterrogation,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/ElaborativeInterrogation',
      },
    },
  },
  args: {
    promptId: 'storybook-ei-prompt',
    articleId: 'storybook-article',
    question:
      'Why does changing occupancy classification force you to revisit egress assumptions?',
    answer:
      '<p>Occupancy changes can alter risk, density, and the exit rules the examiner expects you to apply.</p>',
    options: wikiElaborativeOptionsFixture,
  },
} satisfies Meta<typeof ElaborativeInterrogation>

export default meta

type Story = StoryObj<typeof meta>

export const MultipleChoice: Story = {}

export const AnsweredState: Story = {
  args: {
    existingResponse: {
      selected_option_index: 0,
      response_text: null,
      responded_at: '2026-04-06T09:30:00.000Z',
    },
  },
}

export const OpenEnded: Story = {
  args: {
    options: [],
    type: 'open',
    placeholder: 'Explain how occupant load changes the egress review.',
  },
}
