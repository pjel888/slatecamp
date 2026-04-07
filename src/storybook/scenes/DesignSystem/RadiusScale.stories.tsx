import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '@/components/ui/separator'

const RADII = [
  { name: 'rounded-none', value: '0px', class: 'rounded-none', usage: '—' },
  { name: 'rounded-xs', value: '2px', class: 'rounded-xs', usage: 'Badges, micro elements' },
  { name: 'rounded-sm', value: '4px', class: 'rounded-sm', usage: 'Buttons, inputs, chips' },
  { name: 'rounded-md', value: '6px', class: 'rounded-md', usage: 'Cards, panels' },
  { name: 'rounded-lg', value: '8px (MAX)', class: 'rounded-lg', usage: 'Modals, dialogs only' },
  { name: 'rounded-full', value: '9999px', class: 'rounded-full', usage: 'Avatars, pills' },
]

const RadiusScale = () => (
  <div className="space-y-8 p-6">
    <div>
      <h2 className="font-display text-lg font-bold text-foreground">Border Radius Scale</h2>
      <p className="text-sm text-muted-foreground">Minimal rounded corners. Max 8px (rounded-lg) for modals only. --radius-xl is capped at 8px.</p>
      <Separator className="mt-2" />
    </div>

    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {RADII.map((r) => (
        <div key={r.name} className="flex flex-col items-center gap-2">
          <div className={`h-16 w-16 border-2 border-primary bg-primary-50 ${r.class}`} />
          <span className="font-mono text-[11px] font-medium text-foreground">{r.name}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{r.value}</span>
          <span className="text-center text-[10px] text-muted-foreground">{r.usage}</span>
        </div>
      ))}
    </div>
  </div>
)

const meta: Meta = {
  title: 'Design System/Border Radius',
  component: RadiusScale,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
