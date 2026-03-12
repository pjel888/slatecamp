import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Instrument_Serif } from 'next/font/google'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { HeroHeadline } from '@/components/marketing/HeroHeadline'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { LogoMarquee } from '@/components/marketing/LogoMarquee'
import { TestimonialShowcase } from '@/components/marketing/TestimonialShowcase'
import { FloatingTestimonialMarquee } from '@/components/marketing/FloatingTestimonialMarquee'
import { ROUTES, siteConfig } from '@/lib/constants'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/* ── SEO Metadata ── */

export const metadata: Metadata = {
  title: `${siteConfig.name} — AI-Adaptive Architecture Board Exam Prep`,
  description:
    'Stop re-reading. Start remembering. AI-adaptive test prep with spaced repetition, active recall, 2,400+ practice questions, and real-time analytics — built for ALE and ARE success.',
  openGraph: {
    title: `${siteConfig.name} — Pass the Architecture Board Exam`,
    description:
      'AI-adaptive test prep with spaced repetition, active recall, and deep analytics built for architecture board exam success.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — AI-Adaptive Architecture Board Exam Prep`,
    description:
      'Stop re-reading. Start remembering. AI-powered test prep built for ALE and ARE success.',
  },
  keywords: [
    'architecture board exam prep',
    'ALE exam prep',
    'ARE exam prep',
    'architecture exam reviewer',
    'spaced repetition',
    'active recall',
    'SlateCamp',
  ],
  alternates: {
    canonical: '/',
  },
}

/* ═══════════════════════════════════════════════════
   Decorative & Mockup Components
   ═══════════════════════════════════════════════════ */

/** Noise texture overlay */
function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div
      className='pointer-events-none absolute inset-0'
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
      aria-hidden='true'
    />
  )
}

/** Subtle dotted grid overlay for hero/backgrounds */
function DottedGridOverlay() {
  return (
    <div
      className='pointer-events-none absolute inset-0'
      style={{
        backgroundImage:
          'radial-gradient(circle at center, rgba(29,29,31,0.07) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      aria-hidden='true'
    />
  )
}

/** Readiness score dial for hero conversion card */
function ReadinessDial({ value, label }: { value: number; label: string }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className='flex flex-col items-center'>
      <div className='relative h-[88px] w-[88px]'>
        <svg
          className='-rotate-90'
          width={88}
          height={88}
          viewBox='0 0 88 88'
          aria-hidden='true'
        >
          <circle
            cx={44}
            cy={44}
            r={radius}
            fill='none'
            stroke='var(--color-ash)'
            strokeWidth={6}
          />
          <circle
            cx={44}
            cy={44}
            r={radius}
            fill='none'
            stroke='var(--color-signal-amber)'
            strokeWidth={6}
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className='transition-[stroke-dashoffset] duration-500'
          />
        </svg>
        <span className='absolute inset-0 flex items-center justify-center text-[18px] font-bold text-charcoal'>
          {value}%
        </span>
      </div>
      <span className='mt-1 text-[11px] font-medium text-graphite'>
        {label}
      </span>
    </div>
  )
}

/** Starburst decorative mark */
function Starburst({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 28 28'
      fill='currentColor'
      aria-hidden='true'
    >
      <polygon points='14,0 16.1,8.9 23.9,4.1 19.1,11.9 28,14 19.1,16.1 23.9,23.9 16.1,19.1 14,28 11.9,19.1 4.1,23.9 8.9,16.1 0,14 8.9,11.9 4.1,4.1 11.9,8.9' />
    </svg>
  )
}

/** UI Mockup: Taxonomy heatmap grid */
function HeatmapMockup() {
  const cells = [
    '#34C759',
    '#34C759',
    '#ED8008',
    '#FF3B30',
    '#34C759',
    '#64748B',
    '#ED8008',
    '#34C759',
    '#34C759',
    '#ED8008',
    '#FF3B30',
    '#34C759',
    '#64748B',
    '#FF3B30',
    '#ED8008',
    '#34C759',
    '#34C759',
    '#ED8008',
    '#34C759',
    '#ED8008',
    '#64748B',
    '#FF3B30',
    '#ED8008',
    '#34C759',
    '#34C759',
    '#ED8008',
    '#34C759',
    '#ED8008',
    '#34C759',
    '#64748B',
  ]
  return (
    <div className='grid grid-cols-6 gap-1.5' aria-hidden='true'>
      {cells.map((color, i) => (
        <div
          key={i}
          className='aspect-square rounded-[3px]'
          style={{ backgroundColor: color, opacity: 0.85 }}
        />
      ))}
    </div>
  )
}

/** UI Mockup: Readiness score ring */
function ReadinessRing() {
  const pct = 78
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <svg viewBox='0 0 100 100' className='h-24 w-24' aria-hidden='true'>
      <circle
        cx='50'
        cy='50'
        r={r}
        fill='none'
        stroke='rgba(0,0,0,0.06)'
        strokeWidth='5'
      />
      <circle
        cx='50'
        cy='50'
        r={r}
        fill='none'
        stroke='#ED8008'
        strokeWidth='5'
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap='round'
        transform='rotate(-90 50 50)'
      />
      <text
        x='50'
        y='47'
        textAnchor='middle'
        fill='#1D1D1F'
        fontSize='22'
        fontWeight='700'
        fontFamily='system-ui, sans-serif'
      >
        78
      </text>
      <text
        x='50'
        y='62'
        textAnchor='middle'
        fill='rgba(0,0,0,0.3)'
        fontSize='7'
        letterSpacing='0.15em'
        fontFamily='system-ui, sans-serif'
      >
        READINESS
      </text>
    </svg>
  )
}

/** UI Mockup: Quiz answer options */
function QuizMockup() {
  return (
    <div className='space-y-2' aria-hidden='true'>
      <div className='rounded-lg border border-[#1D1D1F]/[0.08] bg-white/40 px-4 py-2.5'>
        <div className='flex items-center gap-3'>
          <div className='h-3.5 w-3.5 shrink-0 rounded-full border border-[#1D1D1F]/20' />
          <div className='h-2 w-3/4 rounded-full bg-[#1D1D1F]/10' />
        </div>
      </div>
      <div className='rounded-lg border border-[#34C759]/30 bg-[#34C759]/10 px-4 py-2.5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#34C759]'>
            <svg
              className='h-2 w-2 text-white'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='h-2 w-2/3 rounded-full bg-[#34C759]/20' />
        </div>
      </div>
      <div className='rounded-lg border border-[#1D1D1F]/[0.08] bg-white/40 px-4 py-2.5'>
        <div className='flex items-center gap-3'>
          <div className='h-3.5 w-3.5 shrink-0 rounded-full border border-[#1D1D1F]/20' />
          <div className='h-2 w-5/6 rounded-full bg-[#1D1D1F]/10' />
        </div>
      </div>
      <div className='rounded-lg border border-[#FF3B30]/30 bg-[#FF3B30]/10 px-4 py-2.5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#FF3B30]'>
            <svg
              className='h-2 w-2 text-white'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='h-2 w-1/2 rounded-full bg-[#FF3B30]/20' />
        </div>
      </div>
    </div>
  )
}

/** UI Mockup: Subject mastery bars */
function MasteryBars() {
  const subjects = [
    { name: 'Structural Design', pct: 85, color: '#34C759' },
    { name: 'Building Technology', pct: 62, color: '#ED8008' },
    { name: 'Architectural Theory', pct: 41, color: '#FF3B30' },
    { name: 'History of Arch.', pct: 73, color: '#ED8008' },
    { name: 'Utilities (MEPFS)', pct: 88, color: '#34C759' },
  ]
  return (
    <div className='space-y-3' aria-hidden='true'>
      {subjects.map((s) => (
        <div key={s.name}>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-[11px] text-white/40'>{s.name}</span>
            <span className='font-mono text-[11px] text-white/60'>
              {s.pct}%
            </span>
          </div>
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]'>
            <div
              className='h-full rounded-full'
              style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Pill badge — adapts to light / dark context */
function Pill({
  children,
  variant = 'dark',
}: {
  children: React.ReactNode
  variant?: 'light' | 'dark'
}) {
  const cls =
    variant === 'dark'
      ? 'border-white/10 text-white/50'
      : 'border-[#1D1D1F]/10 text-[#1D1D1F]/50'
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase ${cls}`}
    >
      {children}
    </span>
  )
}

/** Arrow circle button */
function CircleArrow({ variant = 'dark' }: { variant?: 'light' | 'dark' }) {
  const cls =
    variant === 'dark'
      ? 'border-white/10 text-white/40 hover:bg-white/5 hover:text-white/70'
      : 'border-[#1D1D1F]/10 text-[#1D1D1F]/40 hover:bg-[#1D1D1F]/5 hover:text-[#1D1D1F]/70'
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${cls}`}
      aria-hidden='true'
    >
      <ArrowUpRight size={14} strokeWidth={1.5} />
    </span>
  )
}

/** Dashboard mockup peeking from bottom of hero — scroll cue */
function DashboardPeek() {
  return (
    <div className='relative mx-auto w-full max-w-[900px] pt-2 landing-reveal landing-delay-2'>
      <div
        className='relative overflow-hidden rounded-t-2xl border border-b-0 border-[#1D1D1F]/[0.08] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
        style={{ height: '140px' }}
      >
        {/* Fake window chrome */}
        <div className='flex items-center gap-1.5 border-b border-[#1D1D1F]/[0.06] bg-[#FAFAF9] px-4 py-2.5'>
          <div className='h-2.5 w-2.5 rounded-full bg-[#FF5F57]' />
          <div className='h-2.5 w-2.5 rounded-full bg-[#FEBC2E]' />
          <div className='h-2.5 w-2.5 rounded-full bg-[#28C840]' />
          <span className='ml-3 text-[10px] text-[#1D1D1F]/30'>
            SlateCamp Dashboard
          </span>
        </div>
        {/* Fake dashboard content */}
        <div className='flex gap-4 px-5 py-3'>
          {/* Sidebar skeleton */}
          <div className='hidden w-[140px] shrink-0 space-y-2 sm:block'>
            <div className='h-2 w-20 rounded bg-[#1D1D1F]/[0.06]' />
            <div className='h-2 w-16 rounded bg-[#ED8008]/20' />
            <div className='h-2 w-24 rounded bg-[#1D1D1F]/[0.06]' />
            <div className='h-2 w-20 rounded bg-[#1D1D1F]/[0.06]' />
          </div>
          {/* Content area skeleton */}
          <div className='flex-1 space-y-2'>
            <div className='flex gap-3'>
              <div className='h-14 w-14 rounded-xl bg-[#ED8008]/10' />
              <div className='flex-1 space-y-1.5 pt-1'>
                <div className='h-2.5 w-32 rounded bg-[#1D1D1F]/[0.08]' />
                <div className='h-2 w-48 rounded bg-[#1D1D1F]/[0.04]' />
              </div>
            </div>
            <div className='flex gap-2'>
              {[
                '#34C759',
                '#ED8008',
                '#FF3B30',
                '#34C759',
                '#34C759',
                '#ED8008',
              ].map((c, i) => (
                <div
                  key={i}
                  className='h-6 w-6 rounded'
                  style={{ backgroundColor: c, opacity: 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Gradient fade at bottom */}
        <div className='pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent' />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════ */

export default async function LandingPage() {
  let isLoggedIn = false
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {
    isLoggedIn = false
  }

  const ctaHref = isLoggedIn ? ROUTES.DASHBOARD : ROUTES.REGISTER
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Join the Camp — Free'

  return (
    <div id='top' className='min-h-screen bg-[#F5F4F0]'>
      {/* ────────────────────── NAVIGATION ────────────────────── */}
      <MarketingNav activeRoute='/' logoScrollsToTop />

      <main>
        {/* ────────────────────── HERO ────────────────────── */}
        <section
          aria-label='Hero'
          className='relative flex flex-col overflow-hidden px-6 pb-0 pt-18 md:pt-20'
        >
          {/* Subtle warm gradient orb */}
          <div
            className='landing-orb pointer-events-none absolute right-[-10%] top-[-15%] h-[50vh] w-[50vh] rounded-full md:h-[45vw] md:w-[45vw] '
            style={{
              background:
                'radial-gradient(circle at 100% -20%, rgba(237,128,8,0.9) 0%, rgba(237,128,8,0.5) 35%, transparent 85%)',
              filter: 'blur(30px)',
            }}
            aria-hidden='true'
          />
          <DottedGridOverlay />
          <NoiseOverlay opacity={0.04} />

          {/* Floating testimonial cloud — organic particles behind hero content */}
          <FloatingTestimonialMarquee />

          {/* Hero Content */}
          <div className='relative z-10 mx-auto w-full max-w-[1200px]'>
            <div className='relative grid grid-cols-1 items-start gap-8 md:grid-cols-12 h-[350px]'>
              {/* Left: Giant headline */}
              <div className='md:col-span-7  h-full flex flex-col justify-start'>
                <div className='landing-reveal flex items-center gap-3'>
                  <Starburst className='h-4 w-4 text-[#ED8008]' />
                  <span className='font-mono text-[12px] tracking-[0.25em] font-bold uppercase text-[#ED8008]'>
                    From first year to board exam
                  </span>
                </div>

                <HeroHeadline />

                <div className='flex flex-col h-full justify-between  mb-4'>
                  <div>
                    <p className='landing-reveal landing-delay-2 mt-6 max-w-lg  text-sm leading-relaxed text-[#6E6E73]'>
                      Most reviewees walk into the exam hoping they studied the
                      right things. <br />{' '}
                    </p>
                    <p className='text-md font-bold'>
                      SlateCamp users walk in knowing.
                    </p>
                  </div>

                  <div className='landing-reveal landing-delay-4 mt-8 flex flex-col items-start justify-start gap-3   '>
                    <Link
                      href={ctaHref}
                      className='rounded-full bg-[#ED8008] px-7 py-3 text-[15px] font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED8008] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F4F0]'
                    >
                      {ctaLabel}
                    </Link>
                    <p className='landing-reveal landing-delay-5  flex justify-start font-semibold text-[12px] text-[#755841]'>
                      Free forever to start &middot; No credit card required
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Stacked Cards */}
              <div
                id='hero-right'
                className='relative flex min-h-[320px] w-full flex-col items-center gap-4 md:min-h-[380px] md:flex-row md:items-stretch md:justify-center md:gap-0 md:col-span-5'
              >
                {/* Card 2: Roadmap (back left on desktop) */}
                <div
                  className='order-2 w-full max-w-[280px] rounded-xl border border-charcoal/10 bg-white p-5 shadow-2xl transition-all duration-300 md:absolute md:left-2 md:top-2 md:order-none md:z-10 md:-rotate-3 md:hover:z-50 md:hover:-translate-y-2'
                  aria-hidden='true'
                >
                  <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-graphite'>
                    Supported exams
                  </p>
                  <ul className='space-y-2.5'>
                    <li className='flex items-center justify-between gap-2'>
                      <span className='text-sm font-medium text-charcoal'>
                        Architecture (ALE)
                      </span>
                      <span className='inline-flex items-center gap-1 rounded-full bg-signal-green/15 px-2 py-0.5 text-[10px] font-semibold text-signal-green'>
                        <span
                          className='h-1.5 w-1.5 rounded-full bg-signal-green'
                          aria-hidden
                        />
                        Live
                      </span>
                    </li>
                    <li className='flex items-center justify-between gap-2'>
                      <span className='text-sm text-graphite'>
                        Interior Design
                      </span>
                      <span className='text-[10px] text-slate'>
                        In development
                      </span>
                    </li>
                    <li className='flex items-center justify-between gap-2'>
                      <span className='text-sm text-graphite'>
                        Civil Engineering
                      </span>
                      <span className='text-[10px] text-slate'>Waitlist</span>
                    </li>
                    <li className='flex items-center justify-between gap-2'>
                      <span className='text-sm text-graphite'>
                        Nursing (PNLE)
                      </span>
                      <span className='text-[10px] text-slate'>Upcoming</span>
                    </li>
                  </ul>
                </div>

                {/* Card 3: Question mockup (back right on desktop) */}
                <div
                  className='order-3 w-full max-w-[280px] rounded-xl border border-charcoal/10 bg-white p-5 shadow-2xl transition-all duration-300 md:absolute md:right-2 md:top-2 md:order-none md:z-10 md:rotate-3 md:hover:z-50 md:hover:-translate-y-2'
                  aria-hidden='true'
                >
                  <span className='mb-2 inline-block rounded bg-charcoal/8 px-2 py-0.5 text-[10px] font-medium text-charcoal'>
                    Building Technology
                  </span>
                  <p className='mb-3 text-[12px] leading-snug text-charcoal'>
                    What is the minimum required distance of a septic tank from
                    a water distribution line under PD 1096?
                  </p>
                  <div className='space-y-1.5'>
                    {[
                      { label: '1.5 m', state: 'incorrect' as const },
                      { label: '3.0 m', state: 'correct' as const },
                      { label: '2.0 m', state: 'neutral' as const },
                      { label: '4.5 m', state: 'neutral' as const },
                    ].map((opt) => (
                      <div
                        key={opt.label}
                        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] ${
                          opt.state === 'correct'
                            ? 'border-signal-green/40 bg-signal-green/10 text-charcoal'
                            : opt.state === 'incorrect'
                              ? 'border-signal-red/30 bg-signal-red/5 text-charcoal'
                              : 'border-charcoal/10 bg-transparent text-charcoal'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            opt.state === 'correct'
                              ? 'bg-signal-green'
                              : opt.state === 'incorrect'
                                ? 'bg-signal-red'
                                : 'bg-charcoal/30'
                          }`}
                          aria-hidden
                        />
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 1: Conversion hook (front center on desktop) */}
                <div className='order-1 z-20 w-full max-w-[300px] rounded-xl border border-charcoal/10 bg-white p-6 shadow-2xl md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2'>
                  <h3 className='text-lg font-bold tracking-tight text-charcoal'>
                    Are you actually ready?
                  </h3>
                  <p className='mt-2 text-[13px] leading-snug text-graphite'>
                    The board exam is unforgiving. Stop guessing and see exactly
                    where you stand today.
                  </p>
                  <div className='mt-4 flex flex-col items-center gap-2'>
                    <ReadinessDial value={64} label='Needs Work' />
                    <Link
                      href={isLoggedIn ? ROUTES.ANALYTICS : ROUTES.REGISTER}
                      className='mt-2 w-full rounded-full bg-signal-amber px-5 py-2.5 text-center text-[14px] font-semibold text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-amber focus-visible:ring-offset-2'
                    >
                      Get Your Score
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className='landing-reveal landing-delay-6 mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#1D1D1F]/[0.06] pt-3'>
              {[
                '2,400+ verified questions',
                'Built for ALE & ARE',
                'Spaced repetition engine',
                'Real-time analytics',
              ].map((stat) => (
                <span
                  key={stat}
                  className='flex items-center gap-2 text-[12px] text-[#AEAEB2]'
                >
                  <span
                    className='h-1 w-1 rounded-full bg-[#ED8008]'
                    aria-hidden='true'
                  />
                  {stat}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll Cue — Dashboard mockup peeking from bottom */}
          <DashboardPeek />

          {/* Scroll indicator */}
          <div className='landing-reveal landing-delay-6 flex justify-center pb-2 pt-3'>
            <ChevronDown
              size={20}
              className='animate-bounce text-[#AEAEB2]'
              aria-hidden='true'
            />
          </div>
        </section>

        {/* ────────────────────── SOCIAL PROOF BAR ────────────────────── */}
        <section className='border-y border-[#1D1D1F]/[0.06] bg-white/60 p-2'>
          <div className='mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center'>
            <span className='text-[12px] font-medium text-[#6E6E73]'>
              Engineered by Topnotchers
            </span>
            <span className='text-[12px] text-[#AEAEB2]'>&middot;</span>
            <span className='text-[12px] font-medium text-[#6E6E73]'>
              SME-Verified Content
            </span>
            <span className='text-[12px] text-[#AEAEB2]'>&middot;</span>
            <span className='text-[12px] font-medium text-[#6E6E73]'>
              Used by 500+ Architecture Students
            </span>
          </div>
        </section>

        <section className='px-6'>
          <div className='mx-auto my-2 flex max-w-[1200px] items-center gap-3'>
            <Starburst className='h-4 w-4 text-[#ED8008]' />
            <h2
              id='how-it-works-heading'
              className='font-mono text-[8px] tracking-[0.2em] uppercase text-[#86868B]'
            >
              TRUSTED BY STUDENTS AND PROFESSIONALS AT:
            </h2>
          </div>
        </section>

        {/* ────────────────────── PARTNER LOGOS ────────────────────── */}
        <LogoMarquee />

        {/* ────────────────────── BENTO FEATURE GRID ────────────────────── */}
        <section
          id='features'
          aria-labelledby='features-heading'
          className='relative px-6 py-8'
        >
          <div className='relative z-10 mx-auto max-w-[1200px]'>
            <h2 id='features-heading' className='sr-only'>
              Features
            </h2>

            {/* Top row: 3 cols, side cards span 2 rows */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2'>
              {/* REVIEW MODE — dark product window with quiz mockup */}
              <div className='landing-reveal landing-delay-1 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 transition-all duration-150 hover:-translate-y-0.5 md:col-start-1 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/25'>
                      [ Review Mode ]
                    </span>
                    <Starburst className='h-4 w-4 text-[#ED8008]' />
                  </div>
                  <h3 className='mt-12 text-[26px] font-semibold leading-tight tracking-tight text-white'>
                    Doomscroll Your Way
                    <br />
                    to Mastery
                  </h3>
                  <p
                    className={`${serif.className} mt-2 text-[16px] italic leading-snug text-white/40`}
                  >
                    Zero-pressure active recall. No timer. No analytics. Just
                    you and the material.
                  </p>
                </div>
                <div className='mt-6'>
                  <QuizMockup />
                  <div className='mt-6 flex items-end justify-between'>
                    <div className='flex gap-2'>
                      <Pill variant='dark'>Active Recall</Pill>
                      <Pill variant='dark'>Stress-Free</Pill>
                    </div>
                    <CircleArrow variant='dark' />
                  </div>
                </div>
              </div>

              {/* STAT: 84% fail rate — light emphasis card */}
              <div
                className='landing-reveal landing-delay-2 flex flex-col justify-between rounded-2xl border border-[#1D1D1F]/[0.06] bg-white p-7 transition-all duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-1'
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <Starburst className='h-4 w-4 text-[#ED8008]' />
                <div className='mt-8'>
                  <span className='text-[72px] font-extrabold leading-none tracking-tighter text-[#1D1D1F]'>
                    84%
                  </span>
                  <p className='mt-3 max-w-[220px] text-[13px] leading-relaxed text-[#86868B]'>
                    of architecture examinees don&apos;t pass — but data-driven
                    study can increase pass rates by 30%.
                  </p>
                </div>
              </div>

              {/* ANALYTICS — dark product window with heatmap + ring */}
              <div className='landing-reveal landing-delay-3 flex flex-col justify-between rounded-2xl bg-[#1f1f1d] p-7 transition-all duration-150 hover:-translate-y-0.5 md:col-start-3 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/25'>
                      [ Analytics ]
                    </span>
                    <CircleArrow variant='dark' />
                  </div>
                  <h3 className='mt-12 text-[26px] font-semibold leading-tight tracking-tight text-white'>
                    Your Readiness,
                    <br />
                    Quantified
                  </h3>
                  <p
                    className={`${serif.className} mt-2 text-[16px] italic leading-snug text-white/40`}
                  >
                    Taxonomy heatmap shows exactly where you stand. Every node.
                    Every weakness. No hiding.
                  </p>
                </div>
                <div className='mt-6'>
                  <div className='flex items-center gap-5'>
                    <svg
                      viewBox='0 0 100 100'
                      className='h-24 w-24'
                      aria-hidden='true'
                    >
                      <circle
                        cx='50'
                        cy='50'
                        r='36'
                        fill='none'
                        stroke='rgba(255,255,255,0.06)'
                        strokeWidth='5'
                      />
                      <circle
                        cx='50'
                        cy='50'
                        r='36'
                        fill='none'
                        stroke='#ED8008'
                        strokeWidth='5'
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={
                          2 * Math.PI * 36 - (78 / 100) * 2 * Math.PI * 36
                        }
                        strokeLinecap='round'
                        transform='rotate(-90 50 50)'
                      />
                      <text
                        x='50'
                        y='47'
                        textAnchor='middle'
                        fill='white'
                        fontSize='22'
                        fontWeight='700'
                        fontFamily='system-ui, sans-serif'
                      >
                        78
                      </text>
                      <text
                        x='50'
                        y='62'
                        textAnchor='middle'
                        fill='rgba(255,255,255,0.3)'
                        fontSize='7'
                        letterSpacing='0.15em'
                        fontFamily='system-ui, sans-serif'
                      >
                        READINESS
                      </text>
                    </svg>
                    <div className='flex-1'>
                      <div
                        className='grid grid-cols-6 gap-1.5'
                        aria-hidden='true'
                      >
                        {[
                          '#34C759',
                          '#34C759',
                          '#ED8008',
                          '#FF3B30',
                          '#34C759',
                          '#64748B',
                          '#ED8008',
                          '#34C759',
                          '#34C759',
                          '#ED8008',
                          '#FF3B30',
                          '#34C759',
                          '#64748B',
                          '#FF3B30',
                          '#ED8008',
                          '#34C759',
                          '#34C759',
                          '#ED8008',
                          '#34C759',
                          '#ED8008',
                          '#64748B',
                          '#FF3B30',
                          '#ED8008',
                          '#34C759',
                        ].map((color, i) => (
                          <div
                            key={i}
                            className='aspect-square rounded-[3px]'
                            style={{ backgroundColor: color, opacity: 0.7 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 flex gap-2'>
                    <Pill variant='dark'>IRT-Calibrated</Pill>
                    <Pill variant='dark'>EMA-Weighted</Pill>
                  </div>
                </div>
              </div>

              {/* QUOTE — editorial card, light */}
              <div
                className='landing-reveal landing-delay-4 flex flex-col justify-between rounded-2xl border border-[#1D1D1F]/[0.06] bg-white p-7 transition-all duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-2'
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <p
                  className={`${serif.className} text-[19px] italic leading-snug text-[#1D1D1F]`}
                >
                  &ldquo;Trust the camp, put in the reps, and we will eliminate
                  the{' '}
                  <span className='relative inline-block'>
                    doubt.
                    <svg
                      className='pointer-events-none absolute'
                      style={{
                        left: '-6px',
                        top: '-3px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 6px)',
                      }}
                      viewBox='0 0 100 40'
                      preserveAspectRatio='none'
                      fill='none'
                      aria-hidden='true'
                    >
                      <ellipse
                        cx='50'
                        cy='20'
                        rx='47'
                        ry='17'
                        stroke='#ED8008'
                        strokeWidth='2'
                      />
                    </svg>
                  </span>
                  &rdquo;
                </p>
                <div className='mt-6 flex justify-end'>
                  <CircleArrow variant='light' />
                </div>
              </div>
            </div>

            {/* Bottom row: 3 equal columns */}
            <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
              {/* 3D LAB — amber accent */}
              <div className='landing-reveal landing-delay-5 flex flex-col justify-between rounded-2xl bg-[#ED8008] p-7 text-white transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-[22px] font-semibold leading-tight tracking-tight'>
                    3D Lab
                  </h3>
                  <Starburst className='h-5 w-5 text-white/50' />
                </div>
                <div className='mt-14'>
                  <p
                    className={`${serif.className} text-[17px] italic leading-snug text-white/80`}
                  >
                    Visual learning,
                    <br />
                    built different.
                  </p>
                  <p className='mt-3 text-[12px] leading-relaxed text-white/50'>
                    WebGL-powered models. Parametric sandbox. Drag Floor Area
                    Ratio — model responds in real time.
                  </p>
                  <div className='mt-4 flex items-center justify-between'>
                    <Pill variant='dark'>3D Models</Pill>
                    <CircleArrow variant='dark' />
                  </div>
                </div>
              </div>

              {/* SESSIONS MODE — dark product window */}
              <div className='landing-reveal landing-delay-5 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 transition-all duration-150 hover:-translate-y-0.5'>
                <div className='flex items-center justify-between'>
                  <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/25'>
                    [ Sessions ]
                  </span>
                  <CircleArrow variant='dark' />
                </div>
                <div className='mt-10'>
                  <h3 className='text-[22px] font-semibold leading-tight tracking-tight text-white'>
                    Every Answer
                    <br />
                    Tracked
                  </h3>
                  <p className='mt-3 text-[13px] leading-relaxed text-white/35'>
                    Timed quizzes with full analytics. Track performance across
                    domains. Watch your readiness score climb.
                  </p>
                  <div className='mt-4 flex gap-2'>
                    <Pill variant='dark'>Camp Mode</Pill>
                    <Pill variant='dark'>Storm Mode</Pill>
                  </div>
                </div>
              </div>

              {/* AI-ADAPTIVE — dark product window */}
              <div className='landing-reveal landing-delay-6 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 transition-all duration-150 hover:-translate-y-0.5'>
                <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-white/25'>
                  [ Bounded Intelligence ]
                </span>
                <div className='mt-10'>
                  <h3 className='text-[22px] font-semibold leading-tight tracking-tight text-white'>
                    AI That Cites
                    <br />
                    Its Sources
                  </h3>
                  <p className='mt-3 text-[13px] leading-relaxed text-white/35'>
                    Tethered to our verified database. Temperature 0.0. Every
                    response links to its exact source. If it&apos;s not in the
                    database, it says so.
                  </p>
                  <div className='mt-4 flex gap-2'>
                    <Pill variant='dark'>Zero-Hallucination</Pill>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-width analytics showcase — dark product window */}
            <div className='landing-reveal mt-3 rounded-2xl bg-[#1D1D1F] p-8'>
              <div className='grid grid-cols-1 items-center gap-8 md:grid-cols-2'>
                <div>
                  <span className='font-mono text-[10px] tracking-[0.2em] uppercase text-[#ED8008]'>
                    The Engine
                  </span>
                  <h3 className='mt-4 text-[28px] font-semibold leading-tight tracking-tight text-white'>
                    AI-Adaptive Learning
                  </h3>
                  <p className='mt-3 max-w-md text-[14px] leading-relaxed text-white/40'>
                    Item Response Theory adjusts question difficulty to your
                    exact ability level. Spaced repetition schedules reviews at
                    the mathematically optimal interval. Every question is the
                    right question.
                  </p>
                  <div className='mt-6 flex gap-2'>
                    <Pill variant='dark'>IRT Engine</Pill>
                    <Pill variant='dark'>SM-2 Algorithm</Pill>
                    <Pill variant='dark'>Lucky Guess Detector</Pill>
                  </div>
                </div>
                <div className='rounded-xl border border-white/[0.06] bg-white/[0.02] p-6'>
                  <div className='mb-4 flex items-center justify-between'>
                    <span className='font-mono text-[10px] tracking-[0.15em] uppercase text-white/30'>
                      Subject Mastery
                    </span>
                    <svg
                      viewBox='0 0 100 100'
                      className='h-16 w-16'
                      aria-hidden='true'
                    >
                      <circle
                        cx='50'
                        cy='50'
                        r='36'
                        fill='none'
                        stroke='rgba(255,255,255,0.06)'
                        strokeWidth='5'
                      />
                      <circle
                        cx='50'
                        cy='50'
                        r='36'
                        fill='none'
                        stroke='#ED8008'
                        strokeWidth='5'
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={
                          2 * Math.PI * 36 - (78 / 100) * 2 * Math.PI * 36
                        }
                        strokeLinecap='round'
                        transform='rotate(-90 50 50)'
                      />
                      <text
                        x='50'
                        y='47'
                        textAnchor='middle'
                        fill='white'
                        fontSize='22'
                        fontWeight='700'
                        fontFamily='system-ui, sans-serif'
                      >
                        78
                      </text>
                      <text
                        x='50'
                        y='62'
                        textAnchor='middle'
                        fill='rgba(255,255,255,0.3)'
                        fontSize='7'
                        letterSpacing='0.15em'
                        fontFamily='system-ui, sans-serif'
                      >
                        READINESS
                      </text>
                    </svg>
                  </div>
                  <MasteryBars />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── HOW IT WORKS ────────────────────── */}
        <section
          id='how-it-works'
          aria-labelledby='how-it-works-heading'
          className='relative border-t border-[#1D1D1F]/[0.06] px-6 py-24'
        >
          <div className='relative z-10 mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <Starburst className='h-4 w-4 text-[#ED8008]' />
              <h2
                id='how-it-works-heading'
                className='font-mono text-[11px] tracking-[0.2em] uppercase text-[#86868B]'
              >
                How It Works
              </h2>
            </div>

            <div className='mt-16 grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-12'>
              {[
                {
                  num: '01',
                  title: 'Choose your mode',
                  desc: 'Review for zero-pressure study. Camp for tracked learning. Storm for full exam simulation.',
                },
                {
                  num: '02',
                  title: 'Answer questions',
                  desc: 'AI adapts difficulty in real-time. Spaced repetition schedules reviews at the mathematically optimal interval.',
                },
                {
                  num: '03',
                  title: 'Master the material',
                  desc: 'Watch your readiness score climb. The taxonomy heatmap shows exactly where you stand — no hiding.',
                },
              ].map(({ num, title, desc }) => (
                <div key={num}>
                  <span
                    className='font-mono text-[56px] font-bold leading-none tracking-tighter text-[#1D1D1F]/[0.06]'
                    aria-hidden='true'
                  >
                    {num}
                  </span>
                  <h3 className='mt-4 text-[20px] font-semibold tracking-tight text-[#1D1D1F]'>
                    {title}
                  </h3>
                  <p className='mt-3 text-[14px] leading-relaxed text-[#86868B]'>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────── PHILOSOPHY ────────────────────── */}
        <section
          aria-label='Design philosophy'
          className='border-t border-[#1D1D1F]/[0.06] px-6 py-24'
        >
          <div className='mx-auto max-w-[1200px] text-center'>
            <Starburst className='mx-auto h-6 w-6 text-[#ED8008]' />
            <blockquote
              className={`${serif.className} mt-8 text-[clamp(2rem,4vw,3.5rem)] italic leading-[1.1] tracking-tight text-[#1D1D1F]`}
            >
              &ldquo;Less, but better.&rdquo;
            </blockquote>
            <p className='mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#86868B]'>
              {siteConfig.name} follows the Dieter Rams philosophy — every
              feature earns its place. No clutter. No gimmicks. Just the tools
              you need to pass.
            </p>
          </div>
        </section>

        {/* ────────────────────── TESTIMONIALS ────────────────────── */}
        <section
          aria-labelledby='testimonials-heading'
          className='border-t border-[#1D1D1F]/[0.06] px-6 py-24'
        >
          <div className='mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <Starburst className='h-4 w-4 text-[#ED8008]' />
              <h2
                id='testimonials-heading'
                className='font-mono text-[11px] tracking-[0.2em] uppercase text-[#86868B]'
              >
                What Students Say
              </h2>
            </div>
            <TestimonialShowcase />
          </div>
        </section>

        {/* ────────────────────── FINAL CTA ────────────────────── */}
        <section aria-label='Get started' className='px-6 pb-24'>
          <div className='relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl bg-[#1D1D1F] px-8 py-20 text-center'>
            <NoiseOverlay opacity={0.02} />
            <div className='relative z-10'>
              <h2 className='text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-white'>
                Ready to pass your board exam?
              </h2>
              <p
                className={`${serif.className} mt-3 text-[17px] italic text-white/40`}
              >
                {isLoggedIn
                  ? 'Head to your dashboard to continue studying.'
                  : 'One platform. Everything verified. No doubt.'}
              </p>
              <Link
                href={ctaHref}
                className='mt-10 inline-flex rounded-full bg-[#ED8008] px-8 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED8008] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D1D1F]'
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ────────────────────── FOOTER ────────────────────── */}
      <MarketingFooter />
    </div>
  )
}
