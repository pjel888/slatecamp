import type { Meta, StoryObj } from '@storybook/react'
import { RevealBlock } from './RevealBlock'

const meta = {
  title: 'Wiki/Blocks/Reveal Block',
  component: RevealBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/RevealBlock',
      },
    },
  },
  args: {
    prompt: 'Pause and recall the rule before revealing it.',
    label: 'Drag to reveal',
    children: (
      <p className="text-sm leading-7 text-text-secondary">
        A change in occupancy classification can force a new exit count, a different travel-distance check, and a fresh look at fire separation.
      </p>
    ),
  },
} satisfies Meta<typeof RevealBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PreRevealed: Story = {
  args: {
    defaultRevealed: true,
  },
}
