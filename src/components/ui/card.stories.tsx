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

export const ElevatedOnCanvas: Story = {
  name: 'Elevated (shadow-card on bg-canvas)',
  render: () => (
    <div className="bg-canvas p-8 rounded-lg w-[720px] max-w-full">
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="elevated">
          <CardContent className="space-y-1 pt-4">
            <CardTitle>Elevated card</CardTitle>
            <CardDescription>
              Shadow-only separation on canvas background. No border needed.
            </CardDescription>
          </CardContent>
        </Card>
        <Card variant="interactive-elevated" tabIndex={0}>
          <CardContent className="space-y-1 pt-4">
            <CardTitle>Interactive elevated</CardTitle>
            <CardDescription>
              Hover lifts to shadow-sm. Focus ring on tab.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
}

export const ShadowComparison: Story = {
  name: 'Shadow vs Border Comparison',
  render: () => (
    <div className="flex gap-8 items-start">
      <div className="bg-canvas p-6 rounded-lg">
        <p className="text-xs text-muted-foreground mb-3">On bg-canvas</p>
        <Card variant="elevated" className="w-[240px]">
          <CardContent className="pt-4">
            <CardTitle>shadow-card</CardTitle>
            <CardDescription>Subtle shadow, no border</CardDescription>
          </CardContent>
        </Card>
      </div>
      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground mb-3">On bg-card</p>
        <Card className="w-[240px]">
          <CardContent className="pt-4">
            <CardTitle>border default</CardTitle>
            <CardDescription>Border fallback on white parent</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
}
