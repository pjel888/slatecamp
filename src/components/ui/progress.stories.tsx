import type { Meta, StoryObj } from '@storybook/react'
import { Progress, ProgressLabel, ProgressValue } from './progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 65, children: null },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <Progress value={65} />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px]">
      <Progress value={42}>
        <ProgressLabel>PD 1096 Mastery</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <Progress value={90}>
        <ProgressLabel>Mastered</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={55}>
        <ProgressLabel>Developing</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={20}>
        <ProgressLabel>Building</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
}
