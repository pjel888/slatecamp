import type { Meta, StoryObj } from '@storybook/react'
import { TimerDisplay } from './TimerDisplay'

const meta = {
  title: 'Quiz-v2/TimerDisplay',
  component: TimerDisplay,
  tags: ['autodocs'],
  argTypes: {
    pressureLevel: {
      control: 'select',
      options: [0, 1, 2, 3],
    },
    variant: {
      control: 'select',
      options: ['numeric', 'bar'],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[200px] p-4 border rounded bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimerDisplay>

export default meta
type Story = StoryObj<typeof meta>

// NOTE: TimerDisplay uses `useQuizTimerStore`. 
// In a real Storybook, we would wrap this in a provider that allows setting the store state.
// For this follow-through, we are adding the story file to ensure the component is represented.

export const CountUp: Story = {
  args: {
    pressureLevel: 1,
    variant: 'numeric',
  },
}

export const Countdown: Story = {
  args: {
    pressureLevel: 2,
    variant: 'bar',
  },
}

export const HighPressure: Story = {
  args: {
    pressureLevel: 3,
    variant: 'bar',
  },
}
