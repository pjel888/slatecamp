import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from '@/components/ui/separator'

const PALETTE = [
  { group: 'Primary (Camp Cobalt)', tokens: [
    { name: '--primary-50', class: 'bg-primary-50', label: '50' },
    { name: '--primary-100', class: 'bg-primary-100', label: '100' },
    { name: '--primary-200', class: 'bg-primary-200', label: '200' },
    { name: '--primary-300', class: 'bg-primary-300', label: '300' },
    { name: '--primary-400', class: 'bg-primary-400', label: '400' },
    { name: '--primary', class: 'bg-primary', label: '500' },
    { name: '--primary-600', class: 'bg-primary-600', label: '600' },
    { name: '--primary-700', class: 'bg-primary-700', label: '700' },
    { name: '--primary-800', class: 'bg-primary-800', label: '800' },
    { name: '--primary-900', class: 'bg-primary-900', label: '900' },
  ]},
  { group: 'Success (Emerald)', tokens: [
    { name: '--success-50', class: 'bg-success-50', label: '50' },
    { name: '--success', class: 'bg-success', label: '500' },
    { name: '--success-700', class: 'bg-success-700', label: '700' },
    { name: '--success-900', class: 'bg-success-900', label: '900' },
  ]},
  { group: 'Warning (Amber)', tokens: [
    { name: '--warning-50', class: 'bg-warning-50', label: '50' },
    { name: '--warning', class: 'bg-warning', label: '500' },
    { name: '--warning-700', class: 'bg-warning-700', label: '700' },
    { name: '--warning-900', class: 'bg-warning-900', label: '900' },
  ]},
  { group: 'Destructive (Warm Red)', tokens: [
    { name: '--destructive-50', class: 'bg-destructive-50', label: '50' },
    { name: '--destructive', class: 'bg-destructive', label: '500' },
    { name: '--destructive-700', class: 'bg-destructive-700', label: '700' },
    { name: '--destructive-900', class: 'bg-destructive-900', label: '900' },
  ]},
  { group: 'Surfaces', tokens: [
    { name: '--canvas', class: 'bg-canvas', label: 'Canvas' },
    { name: '--background', class: 'bg-background', label: 'Background' },
    { name: '--card', class: 'bg-card', label: 'Card' },
    { name: '--muted', class: 'bg-muted', label: 'Muted' },
  ]},
  { group: 'Borders', tokens: [
    { name: '--border', class: 'bg-border', label: 'Default' },
    { name: '--input', class: 'bg-input', label: 'Input' },
  ]},
]

const Swatch = ({ className, label }: { className: string; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`h-10 w-10 rounded-sm border border-border/30 ${className}`} />
    <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
  </div>
)

const ColorPalette = () => (
  <div className="space-y-8 p-6">
    <div>
      <h2 className="font-display text-lg font-bold text-foreground">SlateCamp Color Palette</h2>
      <p className="text-sm text-muted-foreground">Design tokens from globals.css — source of truth for all UI color decisions.</p>
      <Separator className="mt-2" />
    </div>
    {PALETTE.map((group) => (
      <div key={group.group} className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{group.group}</h3>
        <div className="flex flex-wrap gap-3">
          {group.tokens.map((t) => (
            <Swatch key={t.name} className={t.class} label={t.label} />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const meta: Meta = {
  title: 'Design System/Color Palette',
  component: ColorPalette,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}
