import type { Meta, StoryObj } from '@storybook/react'
import { ComparisonTable } from './ComparisonTable'

const meta = {
  title: 'Wiki/Blocks/Comparison Table',
  component: ComparisonTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/ComparisonTable',
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof ComparisonTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ComparisonTable>
      <table>
        <thead>
          <tr>
            <th>Condition</th>
            <th>Unsprinklered</th>
            <th>Sprinklered</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Travel distance</strong></td>
            <td>Baseline limit applies</td>
            <td>Extended limit may apply</td>
          </tr>
          <tr>
            <td><strong>Design implication</strong></td>
            <td>Exit placement tightens early</td>
            <td>Layout gets more flexibility</td>
          </tr>
          <tr>
            <td><strong>Exam trap</strong></td>
            <td>Forgetting occupancy load</td>
            <td>Forgetting the sprinkler exception</td>
          </tr>
        </tbody>
      </table>
    </ComparisonTable>
  ),
}
