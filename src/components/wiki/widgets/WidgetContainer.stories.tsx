import type { Meta, StoryObj } from '@storybook/react'
import { WidgetContainer } from './WidgetContainer'

const meta = {
  title: 'Wiki/WidgetContainer',
  component: WidgetContainer,
  tags: ['autodocs'],
  args: {
    label: 'Widget',
    children: null,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Standardized container for all wiki interactive widgets. Source: @/components/wiki/widgets/WidgetContainer',
      },
    },
  },
} satisfies Meta<typeof WidgetContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <WidgetContainer label="Calculator">
      <div className="flex items-center justify-center h-32 bg-muted/30 rounded-sm text-sm text-muted-foreground">
        Widget content goes here
      </div>
    </WidgetContainer>
  ),
}

export const Interactive: Story = {
  render: () => (
    <WidgetContainer label="Interactive Drill" interactive>
      <div className="flex items-center justify-center h-32 bg-muted/30 rounded-sm text-sm text-muted-foreground">
        Hover to see shadow-sm elevation
      </div>
    </WidgetContainer>
  ),
}

export const WithContent: Story = {
  name: 'With Realistic Content',
  render: () => (
    <WidgetContainer label="Dimension Reference" interactive>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Standard door width</span>
          <span className="font-mono font-medium text-foreground">900mm</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Min. corridor width</span>
          <span className="font-mono font-medium text-foreground">1,120mm</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Handrail height</span>
          <span className="font-mono font-medium text-foreground">900mm</span>
        </div>
      </div>
    </WidgetContainer>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="space-y-4">
      <WidgetContainer label="Static Widget">
        <div className="h-20 bg-muted/30 rounded-sm" />
      </WidgetContainer>
      <WidgetContainer label="Interactive Widget" interactive>
        <div className="h-20 bg-muted/30 rounded-sm" />
      </WidgetContainer>
    </div>
  ),
}
