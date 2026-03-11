import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Instrument_Serif } from 'next/font/google'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { LogoMarquee } from '@/components/marketing/LogoMarquee'
import { TestimonialShowcase } from '@/components/marketing/TestimonialShowcase'
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
    <div className='relative mx-auto w-full max-w-[900px] pt-6'>
      <div
        className='relative overflow-hidden rounded-t-2xl border border-b-0 border-[#1D1D1F]/[0.08] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'
        style={{ height: '120px' }}
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
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Enter the Camp — Free'

  return (
    <div id='top' className='min-h-screen bg-[#F5F4F0]'>
      {/* ────────────────────── NAVIGATION ────────────────────── */}
      <MarketingNav activeRoute='/' logoScrollsToTop />

      <main>
        {/* ────────────────────── HERO ────────────────────── */}
        <section
          aria-label='Hero'
          className='relative flex flex-col overflow-hidden px-6 pb-0 pt-24 md:pt-26'
        >
          {/* Subtle warm gradient orb */}
          <div
            className='landing-orb pointer-events-none absolute right-[-10%] top-[-15%] h-[50vh] w-[50vh] rounded-full md:h-[45vw] md:w-[45vw]'
            style={{
              background:
                'radial-gradient(circle at 40% 45%, rgba(237,128,8,0.12) 0%, rgba(237,128,8,0.04) 35%, transparent 60%)',
              filter: 'blur(80px)',
            }}
            aria-hidden='true'
          />
          <NoiseOverlay opacity={0.02} />

          {/* Hero Content */}
          <div className='relative z-10 mx-auto w-full max-w-[1200px] '>
            <div className='grid grid-cols-1 items-end gap-8 md:grid-cols-12'>
              {/* Left: Giant headline */}
              <div className='md:col-span-7'>
                <div className='landing-reveal flex items-center gap-3'>
                  <Starburst className='h-4 w-4 text-[#ED8008]' />
                  <span className='font-mono text-[11px] tracking-[0.25em] uppercase text-[#ED8008]'>
                    From first year to board exam
                  </span>
                </div>

                <h1 className='landing-reveal landing-delay-1 mt-6 text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-[#1D1D1F]'>
                  Know you&apos;ll
                  <br />
                  pass
                  {/* <span className='relative inline-block'>
                    pass
                    <svg
                      className='pointer-events-none absolute'
                      style={{
                        left: '-6px',
                        top: '-3px',
                        width: 'calc(100% + 48px)',
                        height: 'calc(100% + 8px)',
                      }}
                      viewBox='0 0 100 40'
                      preserveAspectRatio='none'
                      fill='none'
                      aria-hidden='true'
                    >
                      <path
                        d='M6 22 C 18 5, 82 3, 94 18 C 96 22, 92 32, 50 35 C 20 34, 8 30, 6 24 Z'
                        stroke='#ED8008'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        fill='none'
                        transform='rotate(-3 50 20)'
                      />
                    </svg>
                  </span> */}
                  <span className='text-[#ED8008]'>.</span>
                </h1>

                <div>
                  {/* Replace exam anxiety with data-driven certainty. Stop relying
                  on scattered PDFs and blind memorization. SlateCamp is the
                  unified staging ground that maps your syllabus, tests your
                  weaknesses, and exposes your blind spots before test day. */}
                  <p className='landing-reveal landing-delay-2 mt-6 max-w-lg  text-sm leading-relaxed text-[#6E6E73]'>
                    Most reviewees walk into the exam hoping they studied the
                    right things. <br />{' '}
                  </p>
                  <p className='text-md font-bold'>
                    SlateCamp users walk in knowing.
                  </p>
                </div>
              </div>

              {/* Right: Description + CTA */}
              <div className='md:col-span-5 md:pb-2'>
                {/* <p
                  className={`landing-reveal landing-delay-3 ${serif.className} max-w-sm text-[19px] italic leading-relaxed text-[#6E6E73]`}
                >
                  Stop re-reading. Start remembering. AI-adaptive test prep that
                  adjusts to your ability in real-time.
                </p> */}

                <div className='landing-reveal landing-delay-4 mt-8 flex flex-wrap items-center gap-3'>
                  <Link
                    href={ctaHref}
                    className='rounded-full bg-[#ED8008] px-7 py-3 text-[15px] font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED8008] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F4F0]'
                  >
                    {ctaLabel}
                  </Link>
                  {!isLoggedIn && (
                    <Link
                      href={ROUTES.LOGIN}
                      className='rounded-full border border-[#1D1D1F]/12 px-7 py-3 text-[15px] font-medium text-[#6E6E73] transition-colors duration-150 hover:bg-[#1D1D1F]/5 hover:text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D1F]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F4F0]'
                    >
                      I have an account
                    </Link>
                  )}
                </div>

                <p className='landing-reveal landing-delay-5 mt-5 text-[12px] text-[#AEAEB2]'>
                  Free forever to start &middot; No credit card required
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className='landing-reveal landing-delay-6 mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#1D1D1F]/[0.06] pt-3'>
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
              <div className='landing-reveal landing-delay-3 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 transition-all duration-150 hover:-translate-y-0.5 md:col-start-3 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
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
                {isLoggedIn ? 'Go to Dashboard' : 'Enter the Camp — Free'}
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
