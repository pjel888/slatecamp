import type { Meta, StoryObj } from '@storybook/react'
import { QuizHeader } from './QuizHeader'

const mockConfig = {
  mode: 'camp',
  timer: { visible: true, enabled: true, mode: 'countup' },
  navigation: { bookmarkEnabled: true, questionPalette: true },
} as any

const meta = {
  title: 'Quiz-v2/QuizHeader',
  component: QuizHeader,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof QuizHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Standard: Story = {
  args: {
    config: mockConfig,
    currentPosition: 5,
    totalQuestions: 20,
    onExit: () => console.log('Exit'),
    onToggleFlag: () => console.log('Toggle Flag'),
    onOpenPalette: () => console.log('Open Palette'),
  },
}

export const ExamMode: Story = {
  args: {
    ...Standard.args,
    config: {
      ...mockConfig,
      mode: 'full_exam',
      timer: { visible: true, enabled: true, mode: 'countdown' },
    } as any,
    currentPosition: 12,
    totalQuestions: 100,
  },
}

export const Flagged: Story = {
  args: {
    ...Standard.args,
    isFlagged: true,
  },
}

export const WithStreak: Story = {
  args: {
    ...Standard.args,
    // Note: streakCount comes from store, so this story depends on store state in real env
  },
}
