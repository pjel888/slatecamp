import Link from 'next/link'
import { HeroHeadline } from '@/components/marketing/HeroHeadline'
import { FloatingTestimonialMarquee } from '@/components/marketing/FloatingTestimonialMarquee'
import {
  Starburst,
  NoiseOverlay,
  DottedGridOverlay,
  ReadinessDial,
} from '@/components/marketing/LandingPrimitives'
import { ROUTES } from '@/lib/constants'

/* ── Dashboard mockup peek ── */

const DashboardPeek = () => (
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
          <div className='h-2 w-16 rounded bg-[#1f3055]/20' />
          <div className='h-2 w-24 rounded bg-[#1D1D1F]/[0.06]' />
          <div className='h-2 w-20 rounded bg-[#1D1D1F]/[0.06]' />
        </div>
        {/* Content area skeleton */}
        <div className='flex-1 space-y-2'>
          <div className='flex gap-3'>
            <div className='h-14 w-14 rounded-xl bg-[#1f3055]/10' />
            <div className='flex-1 space-y-1.5 pt-1'>
              <div className='h-2.5 w-32 rounded bg-[#1D1D1F]/[0.08]' />
              <div className='h-2 w-48 rounded bg-[#1D1D1F]/[0.04]' />
            </div>
          </div>
          <div className='flex gap-2'>
            {[
              '#34C759',
              '#1f3055',
              '#FF3B30',
              '#34C759',
              '#34C759',
              '#1f3055',
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

/* ── Stats bar items ── */

const STATS = [
  '2,400+ verified questions',
  'Built for ALE & ARE',
  'Spaced repetition engine',
  'Real-time analytics',
] as const

/* ── Stacked hero cards (right column) ── */

const HeroCards = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
  <div
    id='hero-right'
    className='relative flex min-h-[320px] w-full flex-col items-center gap-4 md:min-h-[380px] md:flex-row md:items-stretch md:justify-center md:gap-0 md:col-span-5'
  >
    {/* Card 2: Supported exams (back left) */}
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
          <span className='text-sm text-graphite'>Interior Design</span>
          <span className='text-[10px] text-slate'>In development</span>
        </li>
        <li className='flex items-center justify-between gap-2'>
          <span className='text-sm text-graphite'>Civil Engineering</span>
          <span className='text-[10px] text-slate'>Waitlist</span>
        </li>
        <li className='flex items-center justify-between gap-2'>
          <span className='text-sm text-graphite'>Nursing (PNLE)</span>
          <span className='text-[10px] text-slate'>Upcoming</span>
        </li>
      </ul>
    </div>

    {/* Card 3: Question mockup (back right) */}
    <div
      className='order-3 w-full max-w-[280px] rounded-xl border border-charcoal/10 bg-white p-5 shadow-2xl transition-all duration-300 md:absolute md:right-2 md:top-2 md:order-none md:z-10 md:rotate-3 md:hover:z-50 md:hover:-translate-y-2'
      aria-hidden='true'
    >
      <span className='mb-2 inline-block rounded bg-charcoal/8 px-2 py-0.5 text-[10px] font-medium text-charcoal'>
        Building Technology
      </span>
      <p className='mb-3 text-[12px] leading-snug text-charcoal'>
        What is the minimum required distance of a septic tank from a water
        distribution line under PD 1096?
      </p>
      <div className='space-y-1.5'>
        {([
          { label: '1.5 m', state: 'incorrect' },
          { label: '3.0 m', state: 'correct' },
          { label: '2.0 m', state: 'neutral' },
          { label: '4.5 m', state: 'neutral' },
        ] as const).map((opt) => (
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

    {/* Card 1: Conversion hook (front center) */}
    <div className='order-1 z-20 w-full max-w-[300px] rounded-xl border border-charcoal/10 bg-white p-6 shadow-2xl md:absolute md:left-1/2 md:top-[calc(50%+20px)] md:-translate-x-1/2 md:-translate-y-1/2'>
      <h3 className='text-lg font-bold tracking-tight text-charcoal'>
        Are you actually ready?
      </h3>
      <p className='mt-2 text-[13px] leading-snug text-graphite'>
        The board exam is unforgiving. Stop guessing and see exactly where you
        stand today.
      </p>
      <div className='mt-4 flex flex-col items-center gap-2'>
        <ReadinessDial value={64} label='Needs Work' />
        <Link
          href={isLoggedIn ? ROUTES.ANALYTICS : ROUTES.REGISTER}
          className='mt-2 w-full rounded-full bg-slate-300 px-5 py-2.5 text-center text-[14px] font-semibold text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-amber focus-visible:ring-offset-2'
        >
          Get Your Score
        </Link>
      </div>
    </div>
  </div>
)

/* ── Main Hero Section Export ── */

export const HeroSection = ({
  ctaHref,
  ctaLabel,
  isLoggedIn,
}: {
  ctaHref: string
  ctaLabel: string
  isLoggedIn: boolean
}) => (
  <section
    aria-label='Hero'
    className='relative flex flex-col overflow-hidden px-6 pb-0 pt-18 md:pt-20'
  >
    {/* Subtle warm gradient orb */}
    <div
      className='landing-orb pointer-events-none absolute right-[-10%] top-[-15%] h-[50vh] w-[50vh] rounded-full md:h-[45vw] md:w-[45vw]'
      style={{
        background:
          'radial-gradient(circle at 100% -20%, #1f3055 0%, #1f3055 35%, transparent 85%)',
        filter: 'blur(30px)',
      }}
      aria-hidden='true'
    />
    <DottedGridOverlay />
    <NoiseOverlay opacity={0.04} />

    {/* Floating testimonial cloud */}
    <FloatingTestimonialMarquee />

    {/* Hero Content */}
    <div className='relative z-10 mx-auto w-full max-w-[1200px]'>
      <div className='relative grid grid-cols-1 items-start gap-8 md:grid-cols-12 h-[600px]'>
        {/* Left: Giant headline */}
        <div className='md:col-span-7 h-full flex flex-col justify-start'>
          <div className='landing-reveal flex items-center gap-3'>
            <Starburst className='h-4 w-4 text-[#ED8008]' />
            <span className='font-mono text-[12px] tracking-[0.25em] font-bold uppercase text-[#1f3055]'>
              From first year to board exam
            </span>
          </div>

          <HeroHeadline />

          <div className='flex flex-col h-full justify-between mb-4'>
            <div>
              <p className='landing-reveal landing-delay-2 mt-6 max-w-lg text-sm leading-relaxed text-[#6E6E73]'>
                Most reviewees walk into the exam hoping they studied the right
                things. <br />{' '}
              </p>
              <p className='text-md font-bold'>
                SlateCamp users walk in knowing.
              </p>
            </div>

            <div className='landing-reveal landing-delay-4 mt-8 flex flex-col items-start justify-start gap-3'>
              <Link
                href={ctaHref}
                className='rounded-full bg-[#1f3055] px-7 py-3 text-[15px] font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3055] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F4F0]'
              >
                {ctaLabel}
              </Link>
              <p className='landing-reveal landing-delay-5 flex justify-start font-semibold text-[12px] text-[#755841]'>
                Free forever to start &middot; No credit card required
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className='landing-reveal landing-delay-6 mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#1D1D1F]/[0.06] pt-3'>
            {STATS.map((stat) => (
              <span
                key={stat}
                className='flex items-center gap-2 text-[12px] text-[#AEAEB2]'
              >
                <span
                  className='h-1 w-1 rounded-full bg-[#1f3055]'
                  aria-hidden='true'
                />
                {stat}
              </span>
            ))}
          </div>

          <DashboardPeek />
        </div>

        {/* Right: Stacked Cards */}
        <HeroCards isLoggedIn={isLoggedIn} />
      </div>
    </div>
  </section>
)
