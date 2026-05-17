import type { Meta, StoryObj } from '@storybook/react'

import { CORPORATE_TIERS, INDIVIDUAL_TIERS } from '@/lib/constants/pricing'
import { PricingCard } from './PricingCard'

const meta = {
  title: 'Marketing/PricingCard',
  component: PricingCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Public pricing tier card. The CTA composes the shared Button primitive with a Next.js Link.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='w-full max-w-sm bg-canvas p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PricingCard>

export default meta
type Story = StoryObj<typeof meta>

export const FreeTier: Story = {
  args: {
    tier: INDIVIDUAL_TIERS[0],
  },
}

export const HighlightedTier: Story = {
  args: {
    tier: INDIVIDUAL_TIERS[1],
  },
}

export const CorporateTier: Story = {
  args: {
    tier: CORPORATE_TIERS[0],
  },
}
