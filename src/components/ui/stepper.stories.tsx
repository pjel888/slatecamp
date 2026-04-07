import type { Meta, StoryObj } from '@storybook/react'
import { Stepper } from './stepper'
import type { StepItem } from './stepper'

const meta = {
  title: 'UI/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: {
    steps: [],
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Step indicator for multi-step flows. Source: @/components/ui/stepper',
      },
    },
  },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

const threeSteps: StepItem[] = [
  { label: 'Account', description: 'Create your account', status: 'complete' },
  { label: 'Profile', description: 'Fill in your details', status: 'active' },
  { label: 'Confirm', description: 'Review and submit', status: 'upcoming' },
]

export const Horizontal: Story = {
  render: () => <Stepper steps={threeSteps} />,
}

export const Vertical: Story = {
  render: () => <Stepper steps={threeSteps} orientation="vertical" />,
}

export const AllComplete: Story = {
  render: () => (
    <Stepper
      steps={[
        { label: 'Account', status: 'complete' },
        { label: 'Profile', status: 'complete' },
        { label: 'Confirm', status: 'complete' },
      ]}
    />
  ),
}

export const ErrorState: Story = {
  render: () => (
    <Stepper
      steps={[
        { label: 'Account', status: 'complete' },
        { label: 'Payment', description: 'Card declined', status: 'error' },
        { label: 'Confirm', status: 'upcoming' },
      ]}
    />
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="space-y-8">
      <Stepper steps={threeSteps} />
      <Stepper steps={threeSteps} orientation="vertical" />
      <Stepper
        steps={[
          { label: 'Step 1', status: 'complete' },
          { label: 'Step 2', status: 'error' },
          { label: 'Step 3', status: 'upcoming' },
        ]}
      />
    </div>
  ),
}
