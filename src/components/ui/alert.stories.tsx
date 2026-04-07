import type { Meta, StoryObj } from '@storybook/react'
import { Info, Warning, WarningCircle, CheckCircle, XCircle } from '@phosphor-icons/react/dist/ssr'
import { Alert, AlertTitle, AlertDescription } from './alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Dismissible alert with semantic variants. Source: @/components/ui/alert',
      },
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Default alert</AlertTitle>
      <AlertDescription>
        This is a neutral informational alert message.
      </AlertDescription>
    </Alert>
  ),
}

export const Info_: Story = {
  name: 'Info',
  render: () => (
    <Alert variant="info" icon={<Info weight="bold" />}>
      <AlertTitle>Info alert</AlertTitle>
      <AlertDescription>
        Change a few things up and try submitting again.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" icon={<XCircle weight="bold" />}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert variant="success" icon={<CheckCircle weight="bold" />}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your quiz results have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
}

export const Warning_: Story = {
  name: 'Warning',
  render: () => (
    <Alert variant="warning" icon={<Warning weight="bold" />}>
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your subscription will expire in 3 days.
      </AlertDescription>
    </Alert>
  ),
}

export const Dismissible: Story = {
  render: () => (
    <Alert variant="info" icon={<Info weight="bold" />} dismissible>
      <AlertTitle>Dismissible alert</AlertTitle>
      <AlertDescription>
        Click the close button to dismiss this alert.
      </AlertDescription>
    </Alert>
  ),
}

export const WithList: Story = {
  render: () => (
    <Alert variant="warning" icon={<WarningCircle weight="bold" />}>
      <AlertTitle>Ensure these requirements are met:</AlertTitle>
      <AlertDescription>
        <ul className="mt-1.5 list-disc list-inside space-y-1">
          <li>At least 10 characters</li>
          <li>At least one lowercase character</li>
          <li>At least one special character</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
}

export const AllVariants: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="grid gap-3">
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>Neutral informational alert.</AlertDescription>
      </Alert>
      <Alert variant="info" icon={<Info weight="bold" />}>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Informational context alert.</AlertDescription>
      </Alert>
      <Alert variant="success" icon={<CheckCircle weight="bold" />}>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed successfully.</AlertDescription>
      </Alert>
      <Alert variant="warning" icon={<Warning weight="bold" />}>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please review before proceeding.</AlertDescription>
      </Alert>
      <Alert variant="destructive" icon={<XCircle weight="bold" />} dismissible>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong. Try again.</AlertDescription>
      </Alert>
    </div>
  ),
}
