import type { Meta, StoryObj } from '@storybook/react'
import { Card } from '@/components/ui/card'

const LEVELS = [
  {
    name: 'L0 — Flat',
    class: 'shadow-none',
    desc: 'Content sections on canvas. No separation needed.',
  },
  {
    name: 'L1 — Resting (shadow-card)',
    class: 'shadow-card',
    desc: 'Cards and panels at rest on bg-canvas.',
  },
  {
    name: 'L2 — Hover (shadow-sm)',
    class: 'shadow-sm',
    desc: 'Cards on hover, interactive elements.',
  },
  {
    name: 'L3 — Floating (shadow-md)',
    class: 'shadow-md',
    desc: 'Dropdowns, popovers, floating panels.',
  },
  {
    name: 'L4 — Modal (shadow-lg)',
    class: 'shadow-lg',
    desc: 'Dialogs, sheets, modals.',
  },
]

const ShadowElevation = () => (
  <div className="space-y-8 p-6 bg-canvas min-h-screen">
    <div>
      <h2 className="font-display text-lg font-bold text-foreground">Shadow & Elevation</h2>
      <p className="text-sm text-muted-foreground">5-level elevation system. Cards on bg-canvas use shadow-card. Cards on white parents keep border-border/50.</p>
    </div>

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {LEVELS.map((level) => (
        <div key={level.name} className="space-y-2">
          <Card variant="ghost" className={`p-6 bg-card ${level.class}`}>
            <p className="text-sm font-medium text-foreground">{level.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{level.class}</p>
          </Card>
          <p className="text-xs text-muted-foreground">{level.desc}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Card-on-White Fallback</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">On bg-canvas (shadow only)</p>
          <div className="rounded-md bg-canvas p-4">
            <div className="rounded-md bg-card p-4 shadow-card">
              <p className="text-sm text-foreground">Shadow separation</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">On bg-card (border fallback)</p>
          <div className="rounded-md bg-card p-4">
            <div className="rounded-md bg-card p-4 border border-border/50">
              <p className="text-sm text-foreground">Border separation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const meta: Meta = {
  title: 'Design System/Shadow & Elevation',
  component: ShadowElevation,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
