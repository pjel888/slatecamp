import type { Meta, StoryObj } from '@storybook/react'
import { ALL_MODULES } from '@/features/3d-lab/config/registry'
import { ASSET_TAXONOMY } from '@/features/3d-lab/config/taxonomy'
import { CategoryGrid } from './CategoryGrid'

const moduleCounts = Object.keys(ASSET_TAXONOMY).reduce<Record<string, number>>(
  (counts, key) => {
    counts[key] = 0
    return counts
  },
  {},
)

for (const module of ALL_MODULES) {
  if (module.categoryId) {
    moduleCounts[module.categoryId] = (moduleCounts[module.categoryId] ?? 0) + 1
  }
}

const meta = {
  title: 'Patterns/3D Lab/Category Grid',
  component: CategoryGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Canonical 3D Lab category explorer promoted from the route-private dashboard browser surface.',
      },
    },
  },
  args: {
    moduleCounts,
    onCategorySelect: () => undefined,
  },
} satisfies Meta<typeof CategoryGrid>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
