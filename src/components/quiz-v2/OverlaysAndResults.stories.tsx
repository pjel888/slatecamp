import type { Meta, StoryObj } from '@storybook/react'

import { CalculatingResultsOverlay } from './CalculatingResultsOverlay'
import { ExitConfirmModal } from './ExitConfirmModal'
import { MicroBreakOverlay } from './MicroBreakOverlay'
import { ScoreReveal } from './results/ScoreReveal'

const meta = {
  title: 'Quiz V2/Overlays And Results',
  component: CalculatingResultsOverlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Quiz-v2 overlay and result surfaces used during/after sessions. Added to close Storybook coverage gaps for overlays and results.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-canvas p-8'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CalculatingResultsOverlay>

export default meta
type Story = StoryObj<typeof meta>

export const CalculatingResults: Story = {}

export const MicroBreak: Story = {
  render: () => (
    <MicroBreakOverlay
      questionsCompleted={25}
      breakDurationSeconds={45}
      onContinue={() => undefined}
    />
  ),
}

export const ExitConfirmation: Story = {
  render: () => (
    <ExitConfirmModal
      answeredCount={18}
      totalCount={30}
      onContinue={() => undefined}
      onExit={() => undefined}
    />
  ),
}

export const ScoreRevealCard: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div className='w-[360px]'>
      <ScoreReveal percent={76} correct={38} total={50} growthDelta={6} />
    </div>
  ),
}
