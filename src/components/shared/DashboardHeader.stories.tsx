import type { Meta, StoryObj } from '@storybook/react'
import { NoteContextProvider } from '@/lib/context/note-context'
import { DashboardHeader } from './DashboardHeader'

const meta = {
  title: 'Shared/DashboardHeader',
  component: DashboardHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NoteContextProvider>
        <Story />
      </NoteContextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Source: @/components/shared/DashboardHeader',
      },
    },
  },
} satisfies Meta<typeof DashboardHeader>

export default meta

type Story = StoryObj<typeof meta>

export const WikiRoute: Story = {
  parameters: {
    appShell: {
      pathname: '/dashboard/wiki',
    },
  },
}

export const AnalyticsRoute: Story = {
  parameters: {
    appShell: {
      pathname: '/dashboard/analytics',
    },
  },
}
