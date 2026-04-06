import type { Meta, StoryObj } from '@storybook/react'
import { Info } from '@phosphor-icons/react/dist/ssr'
import { Button } from './button'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    children: null,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/tooltip',
      },
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" leftIcon={<Info />}>
          Citation rules
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Every wiki citation must resolve to a source that students can verify.
      </TooltipContent>
    </Tooltip>
  ),
}

export const PlacementExamples: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">Default placement</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">Secondary metadata</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Helpful but non-blocking guidance</TooltipContent>
      </Tooltip>
    </div>
  ),
}
