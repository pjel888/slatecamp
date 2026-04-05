import type { Meta, StoryObj } from '@storybook/react'
import { PropTable } from './PropTable'

const meta = {
  title: 'Developer/PropTable',
  component: PropTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/developer/PropTable',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    ),
  ],
  args: {
    props: [
      { name: 'title', type: 'string', required: true, description: 'Visible section title.' },
      { name: 'variant', type: "'default' | 'quiet'", default: "'default'", description: 'Tone variant.' },
      { name: 'onSelect', type: '() => void', description: 'Selection callback.' },
    ],
  },
} satisfies Meta<typeof PropTable>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}
