import type { Meta, StoryObj } from '@storybook/react'
import { ProcessFlow } from './ProcessFlow'

const meta = {
  title: 'Wiki/Blocks/Process Flow',
  component: ProcessFlow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/ProcessFlow',
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof ProcessFlow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ProcessFlow>
      <ol>
        <li><strong>Identify the occupancy.</strong> Do not skip the use-group check.</li>
        <li><strong>Calculate occupant load.</strong> Exit count and width follow from this.</li>
        <li><strong>Test the exceptions.</strong> Sprinklers and ratings can change the answer.</li>
      </ol>
    </ProcessFlow>
  ),
}
