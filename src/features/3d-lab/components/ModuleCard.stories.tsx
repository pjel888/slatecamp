import type { Meta, StoryObj } from '@storybook/react'
import { getModuleById } from '@/features/3d-lab/config/registry'
import { ModuleCard } from './ModuleCard'

const availableModule = getModuleById('site-development-controls')!
const plannedModule = {
  ...availableModule,
  status: 'planned' as const,
}

const meta = {
  title: 'Patterns/3D Lab/Module Card',
  component: ModuleCard,
  parameters: {
    layout: 'centered',
    appShell: {
      pathname: '/dashboard/3d-lab',
    },
    docs: {
      description: {
        component:
          'Reusable 3D Lab catalog card promoted out of the route-private browser library.',
      },
    },
  },
  args: {
    module: availableModule,
    basePath: '/dashboard/3d-lab',
  },
  render: (args) => (
    <div className="w-[320px]">
      <ModuleCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ModuleCard>

export default meta

type Story = StoryObj<typeof meta>

export const Available: Story = {}

export const ComingSoon: Story = {
  args: {
    module: plannedModule,
  },
}
