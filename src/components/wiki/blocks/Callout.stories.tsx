import type { Meta, StoryObj } from '@storybook/react'
import { Callout } from './Callout'

const meta = {
  title: 'Wiki/Blocks/Callout',
  component: Callout,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/Callout',
      },
    },
  },
  args: {
    variant: 'note',
    title: 'Exam note',
    children:
      'Start from occupant load before you decide how many exits the floor actually needs.',
  },
} satisfies Meta<typeof Callout>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VariantMatrix: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <Callout variant="note">Use the baseline rule before testing exceptions.</Callout>
      <Callout variant="warning">Do not mix occupancy type with use group labels.</Callout>
      <Callout variant="tip">Check sprinkler assumptions before locking travel distance.</Callout>
      <Callout variant="example">A rated wall can change how the floor is reviewed.</Callout>
      <Callout variant="most-tested">
        Exit count and exit width are related, but they are not the same question.
      </Callout>
      <Callout variant="version-alert">
        Some accessibility values changed in the 2024 IRR and still appear in ALE distractors.
      </Callout>
    </div>
  ),
}
