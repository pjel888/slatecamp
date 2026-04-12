import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DashboardMetricCard } from './dashboard-metric-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'

const meta = {
  title: 'Shared/DashboardMetricCard',
  component: DashboardMetricCard,
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardMetricCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    headerProps: {
      eyebrow: 'Performance',
      title: 'Monthly Readiness',
      subtitle: 'Based on last 30 days of activity',
    },
    children: (
      <div className="h-32 flex items-center justify-center bg-muted/20 rounded border border-dashed text-muted-foreground">
        Chart Placeholder
      </div>
    ),
  },
}

export const WithAction: Story = {
  args: {
    headerProps: {
      eyebrow: 'Activity',
      title: 'Recent Sessions',
      action: (
        <Button variant="ghost" size="xs" className="text-primary gap-1">
          View all <ArrowRight size={12} />
        </Button>
      ),
    },
    children: (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/10 border border-border/50">
            <span className="text-xs font-medium">Session #{i}</span>
            <span className="text-[10px] text-muted-foreground">2h ago</span>
          </div>
        ))}
      </div>
    ),
  },
}

export const WithFooter: Story = {
  args: {
    headerProps: {
      title: 'System Status',
    },
    children: (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        All systems operational
      </div>
    ),
    footer: (
      <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
        <span>Last checked: 5m ago</span>
        <span>Version v8.4.2</span>
      </div>
    ),
  },
}
