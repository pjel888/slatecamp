import Link from 'next/link'
import { HeroHeadline } from '@/components/marketing/HeroHeadline'
import { FloatingTestimonialMarquee } from '@/components/marketing/FloatingTestimonialMarquee'
import {
  Starburst,
  NoiseOverlay,
  DottedGridOverlay,
  ReadinessDial,
} from '@/components/marketing/LandingPrimitives'
import {
  ROUTES,
  SLATECAMP_SAGE,
  SLATECAMP_INK,
  SLATECAMP_PAPER,
  SLATECAMP_BORDER,
  SLATECAMP_AMBER,
  hexToRgba,
} from '@/lib/constants'
import { cn, suggestCanonicalClasses } from '@/lib/utils'

/* ── Dashboard mockup peek ── */

const DashboardPeek = () => (
  <div className='relative mx-auto w-full max-w-[900px] pt-2 landing-reveal landing-delay-2'>
    <div
      className='relative overflow-hidden rounded-t-2xl border border-b-0 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
      style={{
        height: '140px',
        borderColor: SLATECAMP_BORDER.DEFAULT,
        backgroundColor: SLATECAMP_PAPER.snow,
      }}
    >
      {/* Fake window chrome */}
      <div
        className='flex items-center gap-1.5 border-b px-4 py-2.5'
        style={{
          borderColor: SLATECAMP_BORDER.DEFAULT,
          backgroundColor: SLATECAMP_PAPER.cool,
        }}
      >
        <div className='h-2.5 w-2.5 rounded-full bg-[#FF5F57]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#FEBC2E]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#28C840]' />
        <span
          className='ml-3 text-[10px]'
          style={{ color: hexToRgba(SLATECAMP_INK.main, 0.3) }}
        >
          SlateCamp Dashboard
        </span>
      </div>
      {/* Fake dashboard content */}
      <div className='flex gap-4 px-5 py-3'>
        <div className='hidden w-[140px] shrink-0 space-y-2 sm:block'>
          <div
            className='h-2 w-20 rounded'
            style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.06) }}
          />
          <div
            className='h-2 w-16 rounded'
            style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.2) }}
          />
          <div
            className='h-2 w-24 rounded'
            style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.06) }}
          />
          <div
            className='h-2 w-20 rounded'
            style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.06) }}
          />
        </div>
        <div className='flex-1 space-y-2'>
          <div className='flex gap-3'>
            <div
              className='h-14 w-14 rounded-xl'
              style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.1) }}
            />
            <div className='flex-1 space-y-1.5 pt-1'>
              <div
                className='h-2.5 w-32 rounded'
                style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.08) }}
              />
              <div
                className='h-2 w-48 rounded'
                style={{ backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.04) }}
              />
            </div>
          </div>
          <div className='flex gap-2'>
            {[
              SLATECAMP_SAGE.DEFAULT,
              SLATECAMP_INK.main,
              SLATECAMP_INK.main,
              SLATECAMP_SAGE.DEFAULT,
              SLATECAMP_SAGE.DEFAULT,
              SLATECAMP_INK.main,
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
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 h-12'
        style={{
          background: `linear-gradient(to top, ${SLATECAMP_PAPER.snow}, transparent)`,
        }}
      />
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
      className='order-2 w-full max-w-[280px] rounded-xl border bg-slatecamp-paper-cool p-5 shadow-[0_10px_30px_rgba(29,29,31,0.06)] transition-all duration-300 md:absolute md:left-4 md:top-4 md:order-none md:z-10 md:-rotate-3 md:hover:z-50 md:hover:-translate-y-1.5'
      style={{
        borderColor: hexToRgba(SLATECAMP_INK.main, 0.1),
      }}
      aria-hidden='true'
    >
      <p
        className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-slatecamp-ink-subtle'
      >
        Supported exams
      </p>
      <ul className='space-y-2.5'>
        <li className='flex items-center justify-between gap-2'>
          <span className='text-sm font-medium text-slatecamp-ink-main'>
            Architecture (ALE)
          </span>
          <span
            className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold'
            style={{
              backgroundColor: hexToRgba(SLATECAMP_SAGE.DEFAULT, 0.15),
              color: SLATECAMP_SAGE.DEFAULT,
            }}
          >
            <span
              className='h-1.5 w-1.5 rounded-full'
              style={{ backgroundColor: SLATECAMP_SAGE.DEFAULT }}
              aria-hidden
            />
            Live
          </span>
        </li>
        <li className='flex items-center justify-between gap-2'>
          <span className='text-sm text-slatecamp-ink-muted'>
            Interior Design
          </span>
          <span className='text-[10px] text-slatecamp-ink-subtle'>
            In development
          </span>
        </li>
        <li className='flex items-center justify-between gap-2'>
          <span className='text-sm text-slatecamp-ink-muted'>
            Civil Engineering
          </span>
          <span className='text-[10px] text-slatecamp-ink-subtle'>
            Waitlist
          </span>
        </li>
        <li className='flex items-center justify-between gap-2'>
          <span className='text-sm text-slatecamp-ink-muted'>
            Nursing (PNLE)
          </span>
          <span className='text-[10px] text-slatecamp-ink-subtle'>
            Upcoming
          </span>
        </li>
      </ul>
    </div>

    {/* Card 3: Question mockup (back right) */}
    <div
      className='order-3 w-full max-w-[280px] rounded-xl border bg-slatecamp-paper-cool p-5 shadow-[0_10px_30px_rgba(29,29,31,0.06)] transition-all duration-300 md:absolute md:right-4 md:top-4 md:order-none md:z-10 md:rotate-3 md:hover:z-50 md:hover:-translate-y-1.5'
      style={{
        borderColor: hexToRgba(SLATECAMP_INK.main, 0.1),
      }}
      aria-hidden='true'
    >
      <span
        className='mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium'
        style={{
          backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.08),
          color: SLATECAMP_INK.main,
        }}
      >
        Building Technology
      </span>
      <p className='mb-3 text-[12px] leading-snug text-slatecamp-ink-main'>
        What is the minimum required distance of a septic tank from a water
        distribution line under PD 1096?
      </p>
      <div className='space-y-1.5'>
        {(
          [
            { label: '1.5 m', state: 'incorrect' },
            { label: '3.0 m', state: 'correct' },
            { label: '2.0 m', state: 'neutral' },
            { label: '4.5 m', state: 'neutral' },
          ] as const
        ).map((opt) => (
          <div
            key={opt.label}
            className={suggestCanonicalClasses(
              'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] text-slatecamp-ink-main',
              opt.state === 'correct' && 'bg-transparent',
              opt.state === 'incorrect' && 'bg-transparent',
              opt.state === 'neutral' && 'bg-transparent',
            )}
            style={{
              borderColor:
                opt.state === 'correct'
                  ? hexToRgba(SLATECAMP_SAGE.DEFAULT, 0.4)
                  : opt.state === 'incorrect'
                    ? hexToRgba(SLATECAMP_INK.main, 0.3)
                    : hexToRgba(SLATECAMP_INK.main, 0.1),
              backgroundColor:
                opt.state === 'correct'
                  ? hexToRgba(SLATECAMP_SAGE.DEFAULT, 0.1)
                  : opt.state === 'incorrect'
                    ? hexToRgba(SLATECAMP_INK.main, 0.05)
                    : undefined,
            }}
          >
            <span
              className='h-2 w-2 shrink-0 rounded-full'
              style={{
                backgroundColor:
                  opt.state === 'correct'
                    ? SLATECAMP_SAGE.DEFAULT
                    : hexToRgba(
                        SLATECAMP_INK.main,
                        opt.state === 'incorrect' ? 0.5 : 0.3,
                      ),
              }}
              aria-hidden
            />
            {opt.label}
          </div>
        ))}
      </div>
    </div>

    {/* Card 1: Conversion hook (front center) */}
    <div
      className='order-1 z-20 w-full max-w-[300px] rounded-xl border bg-slatecamp-paper-snow p-6 shadow-[0_20px_50px_rgba(29,29,31,0.08)] md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:p-8'
      style={{
        borderColor: hexToRgba(SLATECAMP_INK.main, 0.1),
      }}
    >
      <h3
        className='text-lg font-bold tracking-tight text-slatecamp-ink-main'
      >
        Are you actually ready?
      </h3>
      <p className='mt-3 text-[13px] leading-snug text-slatecamp-ink-muted'>
        The board exam is unforgiving. Stop guessing and see exactly where you
        stand today.
      </p>
      <div className='mt-3 flex flex-col items-center gap-1.5'>
        <ReadinessDial value={64} label='Needs Work' />
        <Link
          href={isLoggedIn ? ROUTES.ANALYTICS : ROUTES.REGISTER}
          className='mt-2 w-full rounded-full px-5 py-2.5 text-center text-[14px] font-semibold transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          style={{
            backgroundColor: SLATECAMP_AMBER.DEFAULT,
            color: SLATECAMP_PAPER.snow,
          }}
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
      // style={{
      //   background: `radial-gradient(circle at 100% -20%, ${SLATECAMP_INK.main} 0%, ${SLATECAMP_INK.main} 35%, transparent 85%)`,
      //   filter: 'blur(30px)',
      // }}
      aria-hidden='true'
    />
    <DottedGridOverlay />
    <NoiseOverlay opacity={0.04} />

    {/* Floating testimonial cloud */}
    {/* <FloatingTestimonialMarquee /> */}

    {/* Hero Content */}
    <div className='relative z-10 mx-auto w-full max-w-[1200px]'>
      <div className='relative grid h-[600px] grid-cols-1 items-start gap-8 md:grid-cols-12 md:items-center'>
        {/* Left: Giant headline */}
        <div className='md:col-span-7 h-full flex flex-col justify-start '>
          <div className='landing-reveal flex items-center gap-3'>
            {/* #region agent log */}

            {/* #endregion */}
            <div
              style={{ color: SLATECAMP_SAGE.olive }}
              className='flex flex-row items-center gap-2'
            >
              <span>
                <Starburst className='h-4 w-4' />
              </span>
              <span
                className={cn(
                  'font-mono text-[12px] tracking-[0.25em] font-bold uppercase',
                )}
              >
                From first year to board exam
              </span>
            </div>
          </div>

          <HeroHeadline />

          <div className='flex flex-col h-full justify-between mb-4'>
            <div>
              <p
                className='landing-reveal landing-delay-2 mt-6 max-w-lg text-sm leading-relaxed'
                style={{ color: SLATECAMP_INK.muted }}
              >
                Most reviewees walk into the exam hoping they studied the right
                things. <br />{' '}
              </p>
              <p
                className='text-md font-bold'
                style={{ color: SLATECAMP_INK.main }}
              >
                SlateCamp users walk in knowing.
              </p>
            </div>

            <div className='landing-reveal landing-delay-4 mt-8 flex flex-col items-start justify-start gap-3'>
              <Link
                href={ctaHref}
                className='rounded-full px-7 py-3 text-[15px] font-medium transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                style={{
                  backgroundColor: SLATECAMP_AMBER.burntRedOrange,
                  color: SLATECAMP_PAPER.snow,
                }}
              >
                {ctaLabel}
              </Link>
              <p
                className='landing-reveal landing-delay-5 flex justify-start font-semibold text-[12px]'
                style={{ color: SLATECAMP_INK.subtle }}
              >
                Free forever to start &middot; No credit card required
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div
            className='landing-reveal landing-delay-6 mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t pt-3'
            style={{ borderColor: SLATECAMP_BORDER.DEFAULT }}
          >
            {STATS.map((stat) => (
              <span
                key={stat}
                className='flex items-center gap-2 text-[12px]'
                style={{ color: SLATECAMP_INK.faint }}
              >
                <span
                  className='h-1 w-1 rounded-full'
                  style={{ backgroundColor: SLATECAMP_INK.main }}
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
