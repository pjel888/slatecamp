import type { Meta, StoryObj } from '@storybook/react'
import { DotsThree } from '@phosphor-icons/react/dist/ssr'
import { Button } from './button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/card',
      },
    },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Daily wiki checkpoint</CardTitle>
        <CardDescription>
          Keep the surface warm and focused with a clear entry point.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="More actions">
            <DotsThree />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>12 article updates are ready for review.</p>
        <p>3 of them still need source verification before publishing.</p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">Last synced 8m ago</span>
        <Button size="sm">Review queue</Button>
      </CardFooter>
    </Card>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="grid w-[720px] max-w-full gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-1 pt-4">
          <CardTitle>Default card</CardTitle>
          <CardDescription>Baseline container for content blocks.</CardDescription>
        </CardContent>
      </Card>
      <Card variant="interactive" tabIndex={0}>
        <CardContent className="space-y-1 pt-4">
          <CardTitle>Interactive card</CardTitle>
          <CardDescription>Hover and focus states for navigable surfaces.</CardDescription>
        </CardContent>
      </Card>
      <Card variant="selected">
        <CardContent className="space-y-1 pt-4">
          <CardTitle>Selected card</CardTitle>
          <CardDescription>Used for active or chosen options.</CardDescription>
        </CardContent>
      </Card>
      <Card variant="ghost">
        <CardContent className="space-y-1 pt-4">
          <CardTitle>Ghost card</CardTitle>
          <CardDescription>Low-emphasis layout grouping without a border.</CardDescription>
        </CardContent>
      </Card>
    </div>
  ),
}
