'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/portal/CodeBlock'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { ComponentShowcase } from '@/app/developer/_components/ComponentShowcase'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const brandColors = [
  { name: 'Camp Cobalt', hex: '#1B3FC4', var: '--camp-cobalt', tw: 'bg-[#1B3FC4]', usage: 'Primary actions, nav, links, active states' },
  { name: 'Camp Cobalt 50', hex: '#EEF2FC', var: '--slate-blue-50', tw: 'bg-[#EEF2FC]', usage: 'Active backgrounds, tints, hover states' },
  { name: 'Cobalt 700', hex: '#1535A8', var: '--accent-hover', tw: 'bg-[#1535A8]', usage: 'Hover / pressed cobalt states' },
  { name: 'Camp Orange', hex: '#E8853A', var: '--camp-orange', tw: 'bg-[#E8853A]', usage: 'Progress celebration, warm CTAs' },
  { name: 'Emerald', hex: '#2D9F6F', var: '--emerald', tw: 'bg-[#2D9F6F]', usage: 'Success, mastery, correct answers' },
  { name: 'Emerald 50', hex: '#EDFAF4', var: '--emerald-50', tw: 'bg-[#EDFAF4]', usage: 'Success backgrounds' },
  { name: 'Warm Red', hex: '#D64545', var: '--danger', tw: 'bg-[#D64545]', usage: 'Error, critical — always with context' },
  { name: 'Warm Red 50', hex: '#FDF0F0', var: '--quiz-wrong-bg', tw: 'bg-[#FDF0F0]', usage: 'Error backgrounds' },
  { name: 'Amber', hex: '#D4951A', var: '--warning', tw: 'bg-[#D4951A]', usage: 'Warning, developing skill' },
  { name: 'Amber 50', hex: '#FEF8ED', var: '--confidence-unsure', tw: 'bg-[#FEF8ED]', usage: 'Warning backgrounds' },
  { name: 'Info Blue', hex: '#3B82C8', var: '--info', tw: 'bg-[#3B82C8]', usage: 'Informational callouts' },
]

const surfaceColors = [
  { name: 'Surface Light', hex: '#F8F7F5', var: '--background', tw: 'bg-[#F8F7F5]', usage: 'Page background (warm white)' },
  { name: 'Surface Card', hex: '#FFFFFF', var: '--card', tw: 'bg-white', usage: 'Card backgrounds' },
  { name: 'Surface Focused', hex: '#F5F7FA', var: '--surface-focused', tw: 'bg-[#F5F7FA]', usage: 'Testing interface background (cool)' },
  { name: 'Surface Secondary', hex: '#F5F5F5', var: '--bg-secondary', tw: 'bg-[#F5F5F5]', usage: 'Muted surfaces, secondary backgrounds' },
  { name: 'Surface Tertiary', hex: '#EEF2FC', var: '--bg-tertiary', tw: 'bg-[#EEF2FC]', usage: 'Accent-tinted backgrounds' },
]

const inkColors = [
  { name: 'Ink Primary', hex: '#1A2332', var: '--text-primary', tw: 'bg-[#1A2332]', usage: 'Main text, headings' },
  { name: 'Ink Secondary', hex: '#4A5568', var: '--text-secondary', tw: 'bg-[#4A5568]', usage: 'Supporting text, descriptions' },
  { name: 'Ink Tertiary', hex: '#8896A7', var: '--text-tertiary', tw: 'bg-[#8896A7]', usage: 'Muted text, placeholders' },
  { name: 'Border Default', hex: '#D4DAE3', var: '--border', tw: 'bg-[#D4DAE3]', usage: 'Borders, dividers' },
]

const semanticColors = [
  { name: 'Quiz Correct BG', hex: '#EDFAF4', var: '--quiz-correct-bg', tw: 'bg-[#EDFAF4]', usage: 'Correct answer background' },
  { name: 'Quiz Correct Border', hex: '#2D9F6F', var: '--quiz-correct-border', tw: 'bg-[#2D9F6F]', usage: 'Correct answer border' },
  { name: 'Quiz Wrong BG', hex: '#FDF0F0', var: '--quiz-wrong-bg', tw: 'bg-[#FDF0F0]', usage: 'Wrong answer background' },
  { name: 'Quiz Wrong Border', hex: '#D64545', var: '--quiz-wrong-border', tw: 'bg-[#D64545]', usage: 'Wrong answer border' },
  { name: 'Quiz Selected BG', hex: '#EEF2FC', var: '--quiz-selected-bg', tw: 'bg-[#EEF2FC]', usage: 'Selected answer background' },
  { name: 'Quiz Selected Border', hex: '#1B3FC4', var: '--quiz-selected-border', tw: 'bg-[#1B3FC4]', usage: 'Selected answer border' },
  { name: 'Chart 1', hex: '#1B3FC4', var: '--chart-1', tw: 'bg-[#1B3FC4]', usage: 'Chart series 1' },
  { name: 'Chart 2', hex: '#2D9F6F', var: '--chart-2', tw: 'bg-[#2D9F6F]', usage: 'Chart series 2' },
  { name: 'Chart 3', hex: '#E8853A', var: '--chart-3', tw: 'bg-[#E8853A]', usage: 'Chart series 3' },
  { name: 'Chart 4', hex: '#D4951A', var: '--chart-4', tw: 'bg-[#D4951A]', usage: 'Chart series 4' },
  { name: 'Chart 5', hex: '#D64545', var: '--chart-5', tw: 'bg-[#D64545]', usage: 'Chart series 5' },
  { name: 'Readiness Danger', hex: '#D64545', var: '--readiness-danger', tw: 'bg-[#D64545]', usage: 'Readiness score: danger zone' },
  { name: 'Readiness Warning', hex: '#D4951A', var: '--readiness-warning', tw: 'bg-[#D4951A]', usage: 'Readiness score: warning zone' },
  { name: 'Readiness Good', hex: '#2D9F6F', var: '--readiness-good', tw: 'bg-[#2D9F6F]', usage: 'Readiness score: good zone' },
]

type ColorEntry = { name: string; hex: string; var: string; tw: string; usage: string }

const typographyRows = [
  { useCase: 'Page heading', font: 'Syne', weight: '800', size: '20px', tw: 'font-[family-name:var(--font-display)] font-extrabold text-xl' },
  { useCase: 'Section heading', font: 'Syne', weight: '700', size: '15px', tw: 'font-[family-name:var(--font-display)] font-bold text-[15px]' },
  { useCase: 'Eyebrow / label', font: 'DM Mono', weight: '500', size: '9px', tw: 'font-[family-name:var(--font-dm-mono)] font-medium text-[9px] uppercase tracking-[0.08em]' },
  { useCase: 'Code / data', font: 'DM Mono', weight: '400', size: '13px', tw: 'font-[family-name:var(--font-dm-mono)] text-[13px]' },
  { useCase: 'Stat number', font: 'DM Mono', weight: '500', size: '24px', tw: 'font-[family-name:var(--font-dm-mono)] font-medium text-2xl' },
  { useCase: 'Body text', font: 'Inter', weight: '400', size: '13px', tw: 'font-sans text-[13px]' },
  { useCase: 'Card title', font: 'Inter', weight: '500', size: '13px', tw: 'font-sans font-medium text-[13px]' },
  { useCase: 'Label / UI text', font: 'Inter', weight: '500', size: '11px', tw: 'font-sans font-medium text-[11px]' },
]

const spacingSteps = [4, 8, 12, 16, 20, 24, 32, 40]

const radiiSteps = [
  { label: 'sm', px: 6, usage: 'Buttons, inputs', tw: 'rounded-sm' },
  { label: 'md', px: 8, usage: 'Cards', tw: 'rounded-md' },
  { label: 'lg', px: 12, usage: 'Modals, dialogs', tw: 'rounded-lg' },
]

const shadowSteps = [
  { label: 'none', class: 'shadow-none', usage: 'Cards at rest' },
  { label: 'sm', class: 'shadow-sm', usage: 'Cards on hover' },
  { label: 'md', class: 'shadow-md', usage: 'Dropdowns' },
  { label: 'lg', class: 'shadow-lg', usage: 'Modals / dialogs' },
]

const allTokens: { token: string; light: string; dark: string; usage: string }[] = [
  { token: '--background', light: '#FFFFFF', dark: '#141B24', usage: 'Page background' },
  { token: '--foreground', light: '#1A2332', dark: '#E8ECF1', usage: 'Default text color' },
  { token: '--card', light: '#FFFFFF', dark: '#1C2433', usage: 'Card background' },
  { token: '--card-foreground', light: '#1A2332', dark: '#E8ECF1', usage: 'Card text' },
  { token: '--popover', light: '#FFFFFF', dark: '#1C2433', usage: 'Popover background' },
  { token: '--primary', light: '#1B3FC4', dark: '#5B7FE0', usage: 'Primary action color' },
  { token: '--primary-foreground', light: '#FFFFFF', dark: '#FFFFFF', usage: 'Text on primary' },
  { token: '--secondary', light: '#F5F5F5', dark: '#1C2433', usage: 'Secondary surface' },
  { token: '--muted', light: '#F5F5F5', dark: '#1C2433', usage: 'Muted backgrounds' },
  { token: '--muted-foreground', light: '#8896A7', dark: '#8896A7', usage: 'Muted / placeholder text' },
  { token: '--accent', light: '#F5F5F5', dark: '#1C2433', usage: 'Accent background' },
  { token: '--destructive', light: '#D64545', dark: '#E85C5C', usage: 'Destructive / danger' },
  { token: '--border', light: '#D4DAE3', dark: '#2A3444', usage: 'Default border color' },
  { token: '--input', light: '#D4DAE3', dark: '#2A3444', usage: 'Input border' },
  { token: '--ring', light: '#1B3FC4', dark: '#5B7FE0', usage: 'Focus ring' },
  { token: '--chart-1', light: '#1B3FC4', dark: '#5B7FE0', usage: 'Chart series 1' },
  { token: '--chart-2', light: '#2D9F6F', dark: '#4DBF8F', usage: 'Chart series 2' },
  { token: '--chart-3', light: '#E8853A', dark: '#F0A060', usage: 'Chart series 3' },
  { token: '--chart-4', light: '#D4951A', dark: '#E8B040', usage: 'Chart series 4' },
  { token: '--chart-5', light: '#D64545', dark: '#E85C5C', usage: 'Chart series 5' },
  { token: '--bg-primary', light: '#FFFFFF', dark: '#141B24', usage: 'Primary surface' },
  { token: '--bg-secondary', light: '#F5F5F5', dark: '#1C2433', usage: 'Secondary surface' },
  { token: '--bg-tertiary', light: '#EEF2FC', dark: '#2A3444', usage: 'Tertiary / accent surface' },
  { token: '--text-primary', light: '#1A2332', dark: '#E8ECF1', usage: 'Primary text' },
  { token: '--text-secondary', light: '#4A5568', dark: '#8896A7', usage: 'Secondary text' },
  { token: '--text-tertiary', light: '#8896A7', dark: '#6C7A8A', usage: 'Tertiary / muted text' },
  { token: '--accent-blue', light: '#1B3FC4', dark: '#5B7FE0', usage: 'Blue accent' },
  { token: '--accent-hover', light: '#1535A8', dark: '#7B9AEA', usage: 'Blue hover state' },
  { token: '--success', light: '#2D9F6F', dark: '#4DBF8F', usage: 'Success state' },
  { token: '--danger', light: '#D64545', dark: '#E85C5C', usage: 'Danger / error state' },
  { token: '--warning', light: '#D4951A', dark: '#E8B040', usage: 'Warning state' },
  { token: '--info', light: '#3B82C8', dark: '#5BA0E0', usage: 'Informational state' },
  { token: '--camp-orange', light: '#E8853A', dark: '#F0A060', usage: 'Camp Orange brand' },
  { token: '--emerald', light: '#2D9F6F', dark: '#4DBF8F', usage: 'Emerald / success brand' },
  { token: '--emerald-50', light: '#EDFAF4', dark: 'rgba(45,159,111,0.15)', usage: 'Emerald light tint' },
  { token: '--slate-blue-50', light: '#EEF2FC', dark: 'rgba(27,63,196,0.15)', usage: 'Cobalt light tint' },
  { token: '--surface-focused', light: '#F5F7FA', dark: '#1C2433', usage: 'Testing interface background' },
  { token: '--border-warm', light: 'rgba(232,133,58,0.15)', dark: 'rgba(232,133,58,0.2)', usage: 'Warm orange border tint' },
  { token: '--quiz-correct-bg', light: '#EDFAF4', dark: 'rgba(45,159,111,0.15)', usage: 'Correct answer background' },
  { token: '--quiz-correct-border', light: '#2D9F6F', dark: '#4DBF8F', usage: 'Correct answer border' },
  { token: '--quiz-wrong-bg', light: '#FDF0F0', dark: 'rgba(214,69,69,0.15)', usage: 'Wrong answer background' },
  { token: '--quiz-wrong-border', light: '#D64545', dark: '#E85C5C', usage: 'Wrong answer border' },
  { token: '--quiz-selected-bg', light: '#EEF2FC', dark: 'rgba(27,63,196,0.15)', usage: 'Selected answer background' },
  { token: '--quiz-selected-border', light: '#1B3FC4', dark: '#5B7FE0', usage: 'Selected answer border' },
  { token: '--transition-fast', light: '100ms ease-out', dark: '100ms ease-out', usage: 'Fast micro-interaction' },
  { token: '--transition-normal', light: '150ms ease-out', dark: '150ms ease-out', usage: 'Standard transition' },
  { token: '--transition-slow', light: '200ms ease-out', dark: '200ms ease-out', usage: 'Slow / deliberate transition' },
  { token: '--readiness-danger', light: '#D64545', dark: '#E85C5C', usage: 'Readiness score danger zone' },
  { token: '--readiness-warning', light: '#D4951A', dark: '#E8B040', usage: 'Readiness score warning zone' },
  { token: '--readiness-good', light: '#2D9F6F', dark: '#4DBF8F', usage: 'Readiness score good zone' },
  { token: '--sidebar', light: '#FFFFFF', dark: '#1C2433', usage: 'Sidebar background' },
  { token: '--sidebar-foreground', light: '#1A2332', dark: '#E8ECF1', usage: 'Sidebar text' },
  { token: '--sidebar-primary', light: '#1B3FC4', dark: '#5B7FE0', usage: 'Sidebar primary action' },
  { token: '--sidebar-accent', light: '#EEF2FC', dark: '#2A3444', usage: 'Sidebar active background' },
  { token: '--sidebar-border', light: '#D4DAE3', dark: '#2A3444', usage: 'Sidebar border' },
  { token: '--radius', light: '0.5rem', dark: '0.5rem', usage: 'Base radius (8px)' },
  { token: '--radius-sm', light: '0.375rem', dark: '0.375rem', usage: 'Small radius (6px) — buttons/inputs' },
  { token: '--radius-md', light: '0.5rem', dark: '0.5rem', usage: 'Medium radius (8px) — cards' },
  { token: '--radius-lg', light: '0.75rem', dark: '0.75rem', usage: 'Large radius (12px) — modals' },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const ColorSwatch = ({ color }: { color: ColorEntry }) => {
  const isDark = ['#1A2332', '#1B3FC4', '#1535A8', '#D64545', '#2D9F6F', '#D4951A', '#3B82C8', '#4A5568', '#8896A7'].includes(color.hex)

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="w-10 h-10 rounded-md border border-border flex-shrink-0"
        style={{ backgroundColor: color.hex }}
        title={color.hex}
      />
      <div>
        <p className="font-sans font-medium text-[11px] text-foreground leading-tight">{color.name}</p>
        <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground">{color.hex}</p>
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] text-muted-foreground/70 truncate max-w-[120px]">{color.var}</p>
        <p className="font-sans text-[10px] text-muted-foreground leading-tight mt-0.5">{color.usage}</p>
      </div>
    </div>
  )
}

const ColorSection = ({ title, colors }: { title: string; colors: ColorEntry[] }) => (
  <div className="mb-8">
    <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-3">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-5">
      {colors.map(c => <ColorSwatch key={c.var + c.name} color={c} />)}
    </div>
  </div>
)

const TokensTable = () => {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? allTokens.filter(t =>
        t.token.toLowerCase().includes(query.toLowerCase()) ||
        t.usage.toLowerCase().includes(query.toLowerCase()) ||
        t.light.toLowerCase().includes(query.toLowerCase())
      )
    : allTokens

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search tokens…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-8 h-8 text-[12px]"
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em] w-[220px]">Token</th>
              <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em] w-[140px]">Light</th>
              <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em] w-[140px]">Dark</th>
              <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Usage</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No tokens match &quot;{query}&quot;</td>
              </tr>
            ) : (
              filtered.map((t, i) => (
                <tr key={t.token} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-primary whitespace-nowrap">{t.token}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      {t.light.startsWith('#') && (
                        <span className="inline-block w-3 h-3 rounded-sm border border-border flex-shrink-0" style={{ backgroundColor: t.light }} />
                      )}
                      <span className="font-[family-name:var(--font-dm-mono)] text-foreground text-[11px]">{t.light}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      {t.dark.startsWith('#') && (
                        <span className="inline-block w-3 h-3 rounded-sm border border-border flex-shrink-0" style={{ backgroundColor: t.dark }} />
                      )}
                      <span className="font-[family-name:var(--font-dm-mono)] text-foreground text-[11px]">{t.dark}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{t.usage}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground">
        {filtered.length} of {allTokens.length} tokens
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DesignSystemPage() {
  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <p className="font-[family-name:var(--font-dm-mono)] font-medium text-[9px] uppercase tracking-[0.1em] text-muted-foreground mb-1">
          Visual Language
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight mb-1">
          Campfire Design System
        </h1>
        <p className="font-sans text-[13px] text-muted-foreground">
          Colors, typography, spacing, and design tokens for all SlateCamp interfaces.
        </p>
      </div>

      <Tabs defaultValue="colors">
        <TabsList variant="underline" className="w-full justify-start mb-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="spacing">Spacing &amp; Shadows</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        {/* ── Tab: Colors ── */}
        <TabsContent value="colors">
          <ColorSection title="Brand &amp; Signal" colors={brandColors} />
          <ColorSection title="Neutrals &amp; Surfaces" colors={surfaceColors} />
          <ColorSection title="Ink &amp; Borders" colors={inkColors} />
          <ColorSection title="Semantic — Quiz States &amp; Charts" colors={semanticColors} />

          <div className="mt-6">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-2">Usage</h3>
            <CodeBlock
              language="css"
              code={`/* Use CSS custom properties directly */
.my-element {
  background-color: var(--camp-cobalt);  /* #1B3FC4 */
  color: var(--text-primary);            /* #1A2332 */
  border-color: var(--border);           /* #D4DAE3 */
}

/* Or use Tailwind semantic tokens */
<div className="bg-primary text-foreground border-border" />`}
            />
          </div>
        </TabsContent>

        {/* ── Tab: Typography ── */}
        <TabsContent value="typography">
          <div className="mb-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-3">Type Scale</h3>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Use Case</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Font</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Weight</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Size</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Tailwind</th>
                  </tr>
                </thead>
                <tbody>
                  {typographyRows.map((row, i) => (
                    <tr key={row.useCase} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-3 py-2 font-sans text-[12px] text-foreground">{row.useCase}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.font}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.weight}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.size}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[10px] text-primary whitespace-nowrap">{row.tw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-4">Live Specimens</h3>
            <div className="space-y-5 border border-border rounded-md p-5">
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Syne 800 · 20px · Page Heading</p>
                <p className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground">Architecture &amp; Building Design</p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Syne 700 · 15px · Section Heading</p>
                <p className="font-[family-name:var(--font-display)] font-bold text-[15px] text-foreground">National Building Code · Chapter IV</p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">DM Mono 500 · 9px · Eyebrow</p>
                <p className="font-[family-name:var(--font-dm-mono)] font-medium text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Study Module · Structural Systems</p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">DM Mono 400 · 13px · Code/Data</p>
                <p className="font-[family-name:var(--font-dm-mono)] text-[13px] text-foreground">const readiness = theta / (1 + Math.exp(-a * (theta - b)))</p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">DM Mono 500 · 24px · Stat Number</p>
                <p className="font-[family-name:var(--font-dm-mono)] font-medium text-2xl text-foreground">78.4</p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Inter 400 · 13px · Body</p>
                <p className="font-sans text-[13px] text-foreground leading-relaxed">
                  The minimum clear width of a corridor in a residential occupancy must not be less than 1.10 meters, measured from the finished surface of the wall to the opposite finished surface.
                </p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Inter 500 · 13px · Card Title</p>
                <p className="font-sans font-medium text-[13px] text-foreground">Fire Safety Requirements — RA 9514</p>
              </div>
              <div className="border-t border-border" />
              <div>
                <p className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em] text-muted-foreground mb-1">Inter 500 · 11px · Label / UI</p>
                <p className="font-sans font-medium text-[11px] text-muted-foreground">42 topics covered · 3 h 20 min</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-2">Rules</h3>
            <ul className="space-y-1.5">
              {[
                'Minimum text size is 11px. Never use 8px, 9px, or 10px.',
                'Monospace (DM Mono) is ONLY for code, data values, and the Readiness Score number.',
                'Never use monospace on labels, categories, or metadata.',
                'Syne is only for headings — never body copy or labels.',
                'Maximum transition duration is 300ms (default: 150ms ease-out).',
              ].map(rule => (
                <li key={rule} className="flex gap-2 text-[12px] text-muted-foreground">
                  <span className="text-emerald-600 font-medium mt-px">·</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        {/* ── Tab: Spacing & Shadows ── */}
        <TabsContent value="spacing">
          <div className="mb-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-3">4px Grid</h3>
            <div className="space-y-2">
              {spacingSteps.map(px => (
                <div key={px} className="flex items-center gap-4">
                  <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground w-8 text-right flex-shrink-0">{px}</span>
                  <div
                    className="bg-primary/20 border border-primary/30 rounded-sm h-5 flex-shrink-0"
                    style={{ width: px * 2 }}
                  />
                  <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground">
                    p-{px / 4} · {px}px
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 font-sans text-[11px] text-muted-foreground">
              All spacing uses multiples of 4px. Use Tailwind&apos;s default scale: p-1 (4px), p-2 (8px), p-3 (12px), p-4 (16px), p-5 (20px), p-6 (24px), p-8 (32px), p-10 (40px).
            </p>
          </div>

          <div className="mb-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-3">Border Radii</h3>
            <div className="flex flex-wrap gap-6">
              {radiiSteps.map(r => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 border-2 border-primary/40 bg-primary/10"
                    style={{ borderRadius: r.px }}
                  />
                  <div className="text-center">
                    <p className="font-[family-name:var(--font-dm-mono)] font-medium text-[11px] text-foreground">rounded-{r.label}</p>
                    <p className="font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground">{r.px}px</p>
                    <p className="font-sans text-[10px] text-muted-foreground">{r.usage}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-[#FEF8ED] border border-[#D4951A]/30 rounded-md">
              <p className="font-sans text-[11px] text-[#7A5A0A]">
                <strong>Forbidden:</strong> rounded-xl, rounded-2xl, rounded-3xl on standard elements. Cap at rounded-lg (12px).
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-3">Shadow Scale</h3>
            <div className="flex flex-wrap gap-6">
              {shadowSteps.map(s => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className={`w-24 h-16 bg-card border border-border rounded-md ${s.class}`} />
                  <div className="text-center">
                    <p className="font-[family-name:var(--font-dm-mono)] font-medium text-[11px] text-foreground">{s.class}</p>
                    <p className="font-sans text-[10px] text-muted-foreground">{s.usage}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-[#FEF8ED] border border-[#D4951A]/30 rounded-md">
              <p className="font-sans text-[11px] text-[#7A5A0A]">
                <strong>Forbidden:</strong> shadow-xl, shadow-2xl on non-modal elements.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-2">Transitions</h3>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Token</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Value</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Tailwind</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { token: '--transition-fast', value: '100ms ease-out', tw: 'duration-100 ease-out', usage: 'Micro-interactions, icon swaps' },
                    { token: '--transition-normal', value: '150ms ease-out', tw: 'duration-150 ease-out', usage: 'Default — hover states, color changes' },
                    { token: '--transition-slow', value: '200ms ease-out', tw: 'duration-200 ease-out', usage: 'Panel reveals, mode switches' },
                  ].map((row, i) => (
                    <tr key={row.token} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-primary text-[11px]">{row.token}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.value}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.tw}</td>
                      <td className="px-3 py-2 font-sans text-[12px] text-muted-foreground">{row.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 font-sans text-[11px] text-muted-foreground">
              Maximum duration is 300ms. Never use duration-500, duration-700, or duration-1000. Never use bounce or spring easing (except framer-motion structural animations).
            </p>
          </div>
        </TabsContent>

        {/* ── Tab: Tokens ── */}
        <TabsContent value="tokens">
          <div className="mb-4">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-1">All CSS Custom Properties</h3>
            <p className="font-sans text-[12px] text-muted-foreground mb-4">
              All tokens are defined in <code className="font-[family-name:var(--font-dm-mono)] text-[11px] bg-muted px-1 py-0.5 rounded-sm">src/app/globals.css</code>. Light and dark values shown.
            </p>
            <TokensTable />
          </div>

          <div className="mt-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-2">Font Variables</h3>
            <div className="border border-border rounded-md overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Variable</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Value</th>
                    <th className="text-left px-3 py-2 font-[family-name:var(--font-dm-mono)] font-medium text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Tailwind Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { var: '--font-display', value: "'Syne', sans-serif", tw: "font-[family-name:var(--font-display)]" },
                    { var: '--font-dm-mono', value: "'DM Mono', monospace", tw: "font-[family-name:var(--font-dm-mono)]" },
                    { var: '--font-sans', value: "'Inter', system fallbacks", tw: "font-sans" },
                    { var: '--font-mono', value: "'SF Mono', 'JetBrains Mono', …", tw: "font-mono" },
                  ].map((row, i) => (
                    <tr key={row.var} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-primary text-[11px]">{row.var}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.value}</td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{row.tw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] text-foreground mb-2">Usage Example</h3>
            <CodeBlock
              language="tsx"
              code={`// Colors — prefer CSS vars or Tailwind semantic tokens
<div className="bg-background text-foreground border-border" />
<div style={{ color: 'var(--text-primary)' }} />

// Typography
<h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl" />
<p  className="font-[family-name:var(--font-dm-mono)] text-[9px] uppercase tracking-[0.08em]" />
<p  className="font-sans text-[13px]" />

// Spacing — always 4px grid multiples
<div className="p-3 gap-2 mb-4" />   {/* 12px · 8px · 16px */}

// Radii
<button className="rounded-sm" />    {/* 6px — buttons/inputs */}
<div    className="rounded-md" />    {/* 8px — cards */}
<dialog className="rounded-lg" />   {/* 12px — modals */}

// Transitions
<div className="transition-colors duration-150 ease-out" />`}
            />
          </div>
        </TabsContent>

        {/* ── Tab: Components ── */}
        <TabsContent value="components">
          <ComponentShowcase />
        </TabsContent>
      </Tabs>
    </div>
  )
}
