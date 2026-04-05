import { cssVars } from '@/components/graphics/tokens'
import { Starburst } from '@/components/marketing/LandingPrimitives'

/* ── Shared split layout for feature sections ── */

export const FeatureSectionLayout = ({
  children,
  flip = false,
  dark = false,
  amber = false,
}: {
  children: React.ReactNode
  flip?: boolean
  dark?: boolean
  amber?: boolean
}) => (
  <section
    className={`border-t px-6 py-24 ${
      dark
        ? 'bg-camp-black border-white/10'
        : amber
          ? 'bg-camp-amber border-warning/40'
          : 'border-border-design bg-muted'
    }`}
  >
    <div
      className={`mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-12 md:grid-cols-2 ${
        flip ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1' : ''
      }`}
    >
      {children}
    </div>
  </section>
)

/* ── Reusable check item with accent badge ── */

export const FeatureCheckItem = ({
  title,
  description,
  accentColor = cssVars.primary,
  textDark = false,
}: {
  title: string
  description: string
  accentColor?: string
  textDark?: boolean
}) => (
  <div className='flex items-start gap-3'>
    <div
      className='flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold'
      style={{ background: accentColor, color: accentColor === cssVars.accent ? 'var(--foreground)' : 'white' }}
    >
      ✓
    </div>
    <div>
      <div className={`text-[13px] font-bold ${textDark ? 'text-white' : 'text-camp-black'}`}>
        {title}
      </div>
      <div className={`mt-1 text-[12px] leading-relaxed ${textDark ? 'text-white/50' : 'text-text-2'}`}>
        {description}
      </div>
    </div>
  </div>
)

/* ── Section eyebrow label ── */
// TODO: evaluate SectionHeader migration — marketing eyebrow has Starburst icon + dark/amber variants

export const SectionEyebrow = ({
  label,
  dark = false,
  amber = false,
}: {
  label: string
  dark?: boolean
  amber?: boolean
}) => (
  <div className='mb-5 flex items-center gap-2'>
    <Starburst className='h-3 w-3 text-camp-amber' />
    <span
      className={`font-mono text-[11px] tracking-[.2em] uppercase ${
        dark ? 'text-white/40' : amber ? 'text-black/50' : 'text-zinc-500'
      }`}
    >
      {label}
    </span>
  </div>
)

/* ── Feature pill chip ── */

export const FeaturePill = ({
  children,
  variant = 'cobalt',
}: {
  children: React.ReactNode
  variant?: 'cobalt' | 'amber' | 'green' | 'muted-light' | 'muted-dark' | 'on-amber'
}) => {
  const styles = {
    cobalt: 'border-camp-cobalt/25 bg-camp-cobalt/8 text-camp-cobalt',
    amber: 'border-camp-amber/25 bg-camp-amber/10 text-warning-700',
    green: 'border-camp-green/25 bg-camp-green/8 text-camp-green',
    'muted-light': 'border-border-design text-text-2',
    'muted-dark': 'border-white/15 text-white/50',
    'on-amber': 'border-black/20 bg-black/[0.08] text-camp-black',
  }

  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}
