import type { Meta, StoryObj } from '@storybook/react'
import RouteError from './RouteError'
import { Warning } from '@phosphor-icons/react/dist/ssr'
import { AlertTriangle } from 'lucide-react'

const meta: Meta<typeof RouteError> = {
  title: 'Shared/RouteError',
  component: RouteError,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    error: new Error('Something went wrong loading this page.'),
    reset: () => {
      // no-op for story
    },
  },
}

export default meta
type Story = StoryObj<typeof RouteError>

export const Default: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Your data is safe — try refreshing.',
    logTag: '[STORY ERROR]',
  },
}

export const WithBackLink: Story = {
  args: {
    title: 'Dashboard failed to load',
    message: 'Your progress data is safe. Try refreshing or return to the dashboard.',
    logTag: '[DASHBOARD ERROR]',
    backHref: '/dashboard',
    backLabel: 'Back to Dashboard',
  },
}

export const CardVariant: Story = {
  args: {
    title: 'Something went wrong loading analytics',
    message: 'An unexpected error occurred while loading your analytics data.',
    variant: 'card',
    icon: <AlertTriangle className="w-8 h-8 text-muted-foreground/60" />,
  },
}

export const WithWarningIcon: Story = {
  args: {
    title: 'The 3D Lab couldn\'t load',
    message: 'This may be a graphics compatibility issue. Try refreshing or return to the dashboard.',
    logTag: '[3D LAB ERROR]',
    backHref: '/dashboard',
    backLabel: 'Back to Dashboard',
  },
}

export const AdminError: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred in the admin area.',
    backHref: '/admin',
    backLabel: 'Back to Admin',
    logTag: '[ADMIN ERROR]',
    icon: (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <Warning size={24} className="text-destructive" />
      </div>
    ),
  },
}

export const DeveloperCardError: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred in the Developer Portal.',
    logTag: '[Developer Portal Error]',
    variant: 'card',
    icon: <Warning size={32} className="text-amber-500" />,
  },
}
