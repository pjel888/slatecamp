'use client'

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
        ? 'bg-[#111111] border-white/10'
        : amber
          ? 'bg-[#F5A623] border-[#D4851A]/40'
          : 'border-[#E8E4DC] bg-[#F2F0EB]'
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
  accentColor = '#1B3FC4',
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
      style={{ background: accentColor, color: accentColor === '#F5A623' ? '#111' : '#fff' }}
    >
      ✓
    </div>
    <div>
      <div className={`text-[13px] font-bold ${textDark ? 'text-white' : 'text-[#111]'}`}>
        {title}
      </div>
      <div className={`mt-1 text-[12px] leading-relaxed ${textDark ? 'text-white/50' : 'text-[#6B6B6B]'}`}>
        {description}
      </div>
    </div>
  </div>
)

/* ── Section eyebrow label ── */

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
    <Starburst className='h-3 w-3 text-[#F5A623]' />
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
    cobalt: 'border-[#1B3FC4]/25 bg-[#1B3FC4]/8 text-[#1B3FC4]',
    amber: 'border-[#F5A623]/25 bg-[#F5A623]/10 text-[#9A6B15]',
    green: 'border-[#1B7A3C]/25 bg-[#1B7A3C]/8 text-[#1B7A3C]',
    'muted-light': 'border-[#E8E4DC] text-[#6B6B6B]',
    'muted-dark': 'border-white/15 text-white/50',
    'on-amber': 'border-black/20 bg-black/[0.08] text-[#111]',
  }

  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[variant]}`}>
      {children}
    </span>
  )
}
