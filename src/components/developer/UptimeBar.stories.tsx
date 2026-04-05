import type { Meta, StoryObj } from '@storybook/react'
import { UptimeBar } from './UptimeBar'

const meta = {
  title: 'Developer/UptimeBar',
  component: UptimeBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Source: @/components/developer/UptimeBar',
      },
    },
  },
  args: {
    uptimePercentage: '99.94%',
    days: [
      { date: '2026-03-01', status: 'ok' },
      { date: '2026-03-02', status: 'ok' },
      { date: '2026-03-03', status: 'degraded' },
      { date: '2026-03-04', status: 'ok' },
      { date: '2026-03-05', status: 'ok' },
      { date: '2026-03-06', status: 'outage' },
      { date: '2026-03-07', status: 'ok' },
      { date: '2026-03-08', status: 'ok' },
      { date: '2026-03-09', status: 'none' },
      { date: '2026-03-10', status: 'ok' },
    ],
  },
} satisfies Meta<typeof UptimeBar>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}
