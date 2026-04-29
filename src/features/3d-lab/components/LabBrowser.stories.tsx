import type { Meta, StoryObj } from '@storybook/react'
import { LabBrowser } from './LabBrowser'

const meta = {
  title: 'Patterns/3D Lab/Lab Browser',
  component: LabBrowser,
  parameters: {
    layout: 'fullscreen',
    appShell: {
      pathname: '/dashboard/3d-lab',
    },
    docs: {
      description: {
        component:
          'The canonical 3D Lab browser surface for module discovery. Storybook exercises the promoted feature component through the mocked Next router runtime.',
      },
    },
  },
  args: {
    basePath: '/dashboard/3d-lab',
  },
} satisfies Meta<typeof LabBrowser>

export default meta

type Story = StoryObj<typeof meta>

export const DashboardCatalog: Story = {}