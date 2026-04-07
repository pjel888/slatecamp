import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '@/components/ui/separator'

const FONTS = [
  { name: 'Atkinson Hyperlegible', var: '--font-sans', class: 'font-sans', role: 'Body text (default)' },
  { name: 'Plus Jakarta Sans', var: '--font-display', class: 'font-display', role: 'Display headings' },
  { name: 'DM Mono', var: '--font-dm-mono', class: 'font-dm-mono', role: 'Code, data values' },
  { name: 'Syne', var: '--font-syne', class: 'font-syne', role: 'Accent headings' },
  { name: 'Sora', var: '--font-sora', class: 'logo-sora', role: 'Logo text' },
]

const TYPE_SCALE = [
  { element: 'h1', size: '36px', weight: 'Bold', class: 'text-4xl font-bold font-display' },
  { element: 'h2', size: '22px', weight: 'Bold', class: 'text-[22px] font-bold tracking-tight' },
  { element: 'h3', size: '18px', weight: 'Semibold', class: 'text-lg font-semibold' },
  { element: 'h4', size: '15px', weight: 'Semibold', class: 'text-[15px] font-semibold text-foreground/80' },
  { element: 'Body', size: '15px', weight: 'Regular', class: 'text-[15px]' },
  { element: 'Small', size: '14px', weight: 'Regular', class: 'text-sm' },
  { element: 'Tiny', size: '12px', weight: 'Regular', class: 'text-xs' },
  { element: 'Caption', size: '10px', weight: 'Medium', class: 'text-[10px] font-medium' },
]

const Typography = () => (
  <div className="space-y-8 p-6">
    <div>
      <h2 className="font-display text-lg font-bold text-foreground">Typography</h2>
      <p className="text-sm text-muted-foreground">Atkinson Hyperlegible for body. Plus Jakarta Sans for display. DM Mono for code.</p>
      <Separator className="mt-2" />
    </div>

    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Font Families</h3>
      {FONTS.map((f) => (
        <div key={f.var} className="flex items-baseline gap-4 border-b border-border/30 pb-3">
          <span className={`text-xl ${f.class}`}>{f.name}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{f.var}</span>
          <span className="text-xs text-muted-foreground">{f.role}</span>
        </div>
      ))}
    </div>

    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Type Scale (Wiki Prose)</h3>
      {TYPE_SCALE.map((t) => (
        <div key={t.element} className="flex items-baseline gap-4">
          <span className="w-12 font-mono text-[10px] text-muted-foreground">{t.element}</span>
          <span className={`text-foreground ${t.class}`}>The quick brown fox jumps over the lazy dog</span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{t.size} / {t.weight}</span>
        </div>
      ))}
    </div>

    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Prose Wiki Preview</h3>
      <div className="prose prose-wiki dark:prose-invert max-w-[65ch]">
        <h2>Section Heading (h2)</h2>
        <p>
          This demonstrates the <strong>prose-wiki</strong> utility with Atkinson Hyperlegible at 15px,
          1.7 line-height, and 65ch max-width. Code like <code>calculateProbability()</code> uses DM Mono.
        </p>
        <h3>Subsection (h3)</h3>
        <p>
          Body text is optimized for long-form reading across 500+ deep-dive articles.
          The spacing and hierarchy are tuned for extended study sessions.
        </p>
      </div>
    </div>
  </div>
)

const meta: Meta = {
  title: 'Design System/Typography',
  component: Typography,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
