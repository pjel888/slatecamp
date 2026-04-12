import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AnalyticsChartContainer } from './analytics-chart-container'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const BuggyComponent = () => {
  throw new Error('Test error')
}

const meta = {
  title: 'Shared/AnalyticsChartContainer',
  component: AnalyticsChartContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof AnalyticsChartContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div className="p-8 bg-muted/20 rounded border">Actual Chart Content</div>,
  },
}

export const LoadingBar: Story = {
  args: {
    children: <div className="p-8 bg-muted/20 rounded border">Actual Chart Content</div>,
    skeletonType: 'bar',
    // In a real app, Suspense would trigger if children were still loading.
    // For storybook purposes, we wrap in a component that actually suspends if needed,
    // but here we can just show the fallback state if we manually force it.
  },
  // To show the loading state in storybook without real data fetching, 
  // we can use a wrapper that remains in a suspended state or just use the fallback prop directly if exposed.
  // Since we want to see the UI, we'll just use the fallback as the main render for this story.
  render: (args) => (
    <AnalyticsChartContainer {...args}>
      {/* This will never render because we'll wrap it in something that suspends */}
      <SuspenseBoundary>
        <div>Content</div>
      </SuspenseBoundary>
    </AnalyticsChartContainer>
  )
}

// Helper to force suspense
const SuspenseBoundary = ({ children }: { children: React.ReactNode }) => {
  throw new Promise(() => {}) // Never resolves
  return <>{children}</>
}

export const LoadingLine: Story = {
  args: {
    skeletonType: 'line',
  },
  render: (args) => (
    <AnalyticsChartContainer {...args}>
      <SuspenseBoundary>
        <div>Content</div>
      </SuspenseBoundary>
    </AnalyticsChartContainer>
  )
}

export const LoadingTable: Story = {
  args: {
    skeletonType: 'table',
  },
  render: (args) => (
    <AnalyticsChartContainer {...args}>
      <SuspenseBoundary>
        <div>Content</div>
      </SuspenseBoundary>
    </AnalyticsChartContainer>
  )
}

export const EmptyState: Story = {
  args: {
    children: (
      <ChartEmptyState 
        title="No activity recorded" 
        description="Start a study session to see your progress heatmap."
      />
    ),
  },
}

export const ErrorState: Story = {
  args: {
    fallbackHeight: 'h-[200px]',
  },
  render: (args) => (
    <AnalyticsChartContainer {...args}>
      <BuggyComponent />
    </AnalyticsChartContainer>
  )
}
