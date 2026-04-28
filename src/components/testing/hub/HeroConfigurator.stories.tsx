import type { Meta, StoryObj } from '@storybook/react'
import { HeroConfigurator } from './HeroConfigurator'

const mockSubjects = [
  { node_id: '1', name: 'Building Technology', subject_area: 'BT' },
  { node_id: '2', name: 'Structural Design', subject_area: 'SD' },
  { node_id: '3', name: 'History of Architecture', subject_area: 'HOA' },
  { node_id: '4', name: 'Professional Practice', subject_area: 'PP' },
  { node_id: '5', name: 'Utilities', subject_area: 'UT' },
]

const meta: Meta<typeof HeroConfigurator> = {
  title: 'Testing/Hub/HeroConfigurator',
  component: HeroConfigurator,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-background min-h-screen">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    initialSubjects: [],
  },
}

export const WithSubjects: Story = {
  args: {
    initialSubjects: mockSubjects,
  },
}

export const Loading: Story = {
  render: () => (
    <div className="p-8 bg-background">
      <HeroConfigurator initialSubjects={[]} />
    </div>
  )
}
