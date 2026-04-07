import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '@/components/ui/separator'

const SPACING = [
  { name: '--spacing-inline', value: '0.5rem (8px)', class: 'w-2', label: 'Inline' },
  { name: '--spacing-card', value: '1rem (16px)', class: 'w-4', label: 'Card' },
  { name: '--spacing-form-gap', value: '1rem (16px)', class: 'w-4', label: 'Form Gap' },
  { name: '--spacing-section', value: '1.5rem (24px)', class: 'w-6', label: 'Section' },
  { name: '--spacing-card-lg', value: '1.5rem (24px)', class: 'w-6', label: 'Card LG' },
]

const TAILWIND_SCALE = [
  { px: 4, class: 'w-1' },
  { px: 8, class: 'w-2' },
  { px: 12, class: 'w-3' },
  { px: 16, class: 'w-4' },
  { px: 20, class: 'w-5' },
  { px: 24, class: 'w-6' },
  { px: 32, class: 'w-8' },
]

const SpacingScale = () => (
  <div className="space-y-8 p-6">
    <div>
      <h2 className="font-display text-lg font-bold text-foreground">Spacing Scale</h2>
      <p className="text-sm text-muted-foreground">4px base grid. All spacing should be multiples of 4px.</p>
      <Separator className="mt-2" />
    </div>

    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Semantic Tokens</h3>
      {SPACING.map((s) => (
        <div key={s.name} className="flex items-center gap-4">
          <div className={`h-4 rounded-xs bg-primary ${s.class}`} />
          <span className="w-20 font-mono text-xs text-muted-foreground">{s.label}</span>
          <span className="text-xs text-foreground">{s.value}</span>
        </div>
      ))}
    </div>

    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Base Scale (4px grid)</h3>
      {TAILWIND_SCALE.map((s) => (
        <div key={s.px} className="flex items-center gap-4">
          <div className={`h-4 rounded-xs bg-primary-300 ${s.class}`} />
          <span className="w-20 font-mono text-xs text-muted-foreground">{s.px}px</span>
        </div>
      ))}
    </div>
  </div>
)

const meta: Meta = {
  title: 'Design System/Spacing Scale',
  component: SpacingScale,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
