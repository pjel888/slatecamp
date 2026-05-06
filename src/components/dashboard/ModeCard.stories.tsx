import type { Meta, StoryObj } from '@storybook/react'
import { Brain, ClockCounterClockwise } from '@phosphor-icons/react/dist/ssr'

import { ModeCard } from './ModeCard'

const meta = {
  title: 'Dashboard/ModeCard',
  component: ModeCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dashboard quiz mode card. Uses shared Card and Badge primitives while preserving active-session actions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[360px] bg-canvas p-6'>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Focused Practice',
    subtitle: 'Adaptive mode',
    description: 'Practice targeted questions with smart difficulty and source-backed explanations.',
    icon: Brain,
    accentColor: 'bg-primary',
    primaryActionLabel: 'Start Practice',
    onPrimaryAction: () => undefined,
  },
} satisfies Meta<typeof ModeCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ActiveSession: Story = {
  args: {
    title: 'Endurance Review',
    subtitle: 'Mock board rhythm',
    description: 'Resume your timed review session or start fresh with a new attempt.',
    icon: ClockCounterClockwise,
    accentColor: 'bg-emerald-600',
    primaryActionLabel: 'Start Review',
    hasActiveSession: true,
    sessionCount: 7,
    lastPlayedAt: '2026-05-06T08:00:00.000Z',
    onSecondaryAction: () => undefined,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    title: 'Locked Mode',
    subtitle: 'Coming soon',
    description: 'This mode is unavailable while we finish calibration.',
  },
}
