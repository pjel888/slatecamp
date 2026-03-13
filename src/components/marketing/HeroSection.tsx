'use client'

import { useState } from 'react'
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
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

/* ── Dashboard Mockup Peek ── */

const DashboardPeek = () => (
  <div className='relative mx-auto w-full max-w-[900px] pt-2 landing-reveal landing-delay-2'>
    <div className='relative h-[140px] overflow-hidden rounded-t-2xl border border-b-0 border-zinc-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'>
      {/* Fake window chrome */}
      <div className='flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5'>
        <div className='h-2.5 w-2.5 rounded-full bg-red-400' />
        <div className='h-2.5 w-2.5 rounded-full bg-amber-400' />
        <div className='h-2.5 w-2.5 rounded-full bg-green-500' />
        <span className='ml-3 text-[10px] text-zinc-500'>
          SlateCamp Dashboard
        </span>
      </div>
      {/* Fake dashboard content */}
      <div className='flex gap-4 px-5 py-3'>
        {/* Sidebar */}
        <div className='hidden w-[140px] shrink-0 space-y-2 sm:block'>
          <div className='h-2 w-20 rounded bg-zinc-200' />
          <div className='h-2 w-16 rounded bg-zinc-300' />
          <div className='h-2 w-24 rounded bg-zinc-200' />
          <div className='h-2 w-20 rounded bg-zinc-200' />
        </div>
        {/* Main Content */}
        <div className='flex-1 space-y-2'>
          <div className='flex gap-3'>
            <div className='h-14 w-14 shrink-0 rounded-xl bg-zinc-200' />
            <div className='flex-1 space-y-1.5 pt-1'>
              <div className='h-2.5 w-32 rounded bg-zinc-300' />
              <div className='h-2 w-48 rounded bg-zinc-200' />
            </div>
          </div>
          <div className='flex gap-2'>
            {[
              'bg-green-500',
              'bg-blue-600',
              'bg-blue-600',
              'bg-green-500',
              'bg-green-500',
              'bg-blue-600',
            ].map((colorClass, i) => (
              <div
                key={i}
                className={`h-6 w-6 shrink-0 rounded-full opacity-20 ${colorClass}`}
                role='img'
                aria-label={`Mockup element ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Gradient fade at the bottom */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white to-transparent' />
    </div>
  </div>
)

/* ── Constants for Reusable Components ── */

const SUPPORTED_EXAMS = [
  {
    name: 'Architecture (ALE)',
    status: 'Live',
    tone: 'live' as const,
    category: 'architecture' as const,
  },
  {
    name: 'Interior Design',
    status: 'In development',
    tone: 'upcoming' as const,
    category: 'architecture' as const,
  },
  {
    name: 'Civil Engineering',
    status: 'Waitlist',
    tone: 'upcoming' as const,
    category: 'engineering' as const,
  },
  {
    name: 'Chemical Engineering',
    status: 'Upcoming',
    tone: 'upcoming' as const,
    category: 'engineering' as const,
  },
  {
    name: 'Electrical Engineering',
    status: 'Upcoming',
    tone: 'upcoming' as const,
    category: 'engineering' as const,
  },
  {
    name: 'Nursing (PNLE)',
    status: 'Upcoming',
    tone: 'upcoming' as const,
    category: 'health' as const,
  },
  {
    name: 'Certified Public Accountant (CPALE)',
    status: 'Upcoming',
    tone: 'upcoming' as const,
    category: 'business' as const,
  },
  {
    name: 'Licensure Exam for Teachers (LET)',
    status: 'Upcoming',
    tone: 'upcoming' as const,
    category: 'education' as const,
  },
] as const

const MOCK_QUESTION = {
  topic: 'Building Technology',
  question:
    'What is the minimum required distance of a septic tank from a water distribution line under PD 1096?',
  options: [
    { label: '1.5 m', state: 'neutral' as const },
    { label: '2.0 m', state: 'neutral' as const },
    { label: '3.0 m', state: 'correct' as const },
    { label: '4.5 m', state: 'incorrect' as const },
  ] as const,
}

const STATS = [
  '2,400+ verified questions',
  'Built for ALE & ARE',
  'Spaced repetition engine',
  'Real-time analytics',
] as const

/* ── Hero Cards Components ── */

// Card 1: Supported Exams (Back Left)
const ExamsSupportedCard = () => (
  <div
    className='order-1 w-full max-w-[280px] rounded-xl bg-linear-to-b from-white/95 to-zinc-50/90 p-4 shadow-[0_10px_30px_rgba(24,24,27,0.06)] ring-1 ring-zinc-200/90 transition-all duration-150 md:absolute md:left-5 md:-top-28 md:order-0 md:z-10 md:-rotate-3 md:hover:z-50 md:hover:-translate-y-2 md:hover:shadow-[0_18px_40px_rgba(24,24,27,0.14)]'
    aria-hidden='true'
  >
    <p className='mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-zinc-500'>
      Supported exams
    </p>
    <ul className='space-y-1.75'>
      {SUPPORTED_EXAMS.slice(0, 6).map((exam) => {
        const isLive = exam.tone === 'live'
        const dotColor = isLive
          ? 'bg-emerald-600'
          : exam.category === 'engineering'
            ? 'bg-blue-600'
            : exam.category === 'health'
              ? 'bg-emerald-600'
              : exam.category === 'business'
                ? 'bg-amber-600'
                : exam.category === 'education'
                  ? 'bg-violet-600'
                  : 'bg-zinc-500'

        return (
          <li
            key={exam.name}
            className={cn(
              'flex items-center justify-between gap-2 rounded-md px-1.5 py-1',
              isLive
                ? 'bg-emerald-50 hover:bg-emerald-100/80'
                : 'hover:bg-zinc-100/70',
            )}
          >
            <div className='flex min-w-0 items-center gap-2'>
              <span
                className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColor)}
              />
              <span
                className={cn(
                  'truncate text-[13px] font-medium leading-tight',
                  isLive ? 'text-emerald-800' : 'text-zinc-700',
                )}
              >
                {exam.name}
              </span>
            </div>
            {exam.tone === 'live' ? (
              <span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-600' />
                Live
              </span>
            ) : (
              <span className='shrink-0 text-[10px] font-medium text-zinc-500'>
                {exam.status}
              </span>
            )}
          </li>
        )
      })}
      {SUPPORTED_EXAMS.length > 6 ? (
        <li className='mt-1 flex items-center justify-end text-[10px] font-medium text-zinc-500'>
          +{SUPPORTED_EXAMS.length - 6} more exams
        </li>
      ) : null}
    </ul>
  </div>
)

// Card 2: Mock Question (Back Right)
const MockQuestionCard = () => {
  return (
    <div
      className='order-3 w-full max-w-[280px] rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-[0_10px_30px_rgba(24,24,27,0.06)] transition-all duration-150 md:absolute md:right-4 md:top-4 md:order-0 md:z-10 md:rotate-3 md:hover:z-50 md:hover:-translate-y-1.5'
      aria-hidden='true'
    >
      <span className='mb-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-900'>
        {MOCK_QUESTION.topic}
      </span>
      <p className='mb-3 text-[12px] leading-snug text-zinc-900'>
        {MOCK_QUESTION.question}
      </p>
      <div className='space-y-1.5'>
        {MOCK_QUESTION.options.map((opt) => {
          const isCorrect = opt.state === 'correct'
          const isIncorrect = opt.state === 'incorrect'

          return (
            <div
              key={opt.label}
              className={cn(
                'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] transition-colors',
                isCorrect && 'border-green-400 bg-green-50 text-green-800',
                isIncorrect && 'border-red-400 bg-red-50 text-red-800',
                !isCorrect &&
                  !isIncorrect &&
                  'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  isCorrect && 'bg-green-600',
                  isIncorrect && 'bg-red-600',
                  !isCorrect && !isIncorrect && 'bg-zinc-400',
                )}
                aria-hidden='true'
              />
              {opt.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Card 3: Readiness Snapshot (Front Center)
const SUBJECT_READINESS = [
  { label: 'Building Technology', value: 38, improved: 96 },
  { label: 'Professional Practice', value: 42, improved: 99 },
  { label: 'Structural Design', value: 35, improved: 98 },
  { label: 'Planning & Design', value: 47, improved: 99 },
] as const

const ConversionHookCard = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className='order-2 z-20 w-full max-w-[320px] rounded-2xl border border-zinc-200 bg-zinc-50/90 p-6 shadow-[0_20px_50px_rgba(24,24,27,0.12)] backdrop-blur-sm transition-transform duration-150 md:absolute md:left-1/2 md:top-1/2 md:transform-[translate(-50%,-50%)] md:hover:transform-[translate(-50%,calc(-50%-12px))] md:p-7 hover:rotate-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='mb-2 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500'>
        <span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
        Readiness snapshot
      </div>

      <h3 className='text-base font-semibold tracking-tight text-zinc-900'>
        Are you actually ready?
      </h3>

      {/* Shared space for intro vs “this is what…” */}
      <p className='mt-2 text-[12px] leading-snug text-zinc-600'>
        {isHovered
          ? 'This is what your score can look like once SlateCamp is driving your review.'
          : 'A quick look at how your recent practice sessions are performing by subject.'}
      </p>

      <div className='mt-3 flex items-center gap-3 rounded-xl bg-white/80 p-3 ring-1 ring-zinc-100'>
        <ReadinessDial
          value={isHovered ? 98 : 42}
          label={isHovered ? 'Exam-ready' : 'At risk'}
          showWarning={!isHovered}
          tone={isHovered ? 'success' : 'warning'}
        />
        <div className='space-y-1 text-[11px]'>
          <p
            className={cn(
              'font-medium',
              isHovered ? 'text-emerald-700' : 'text-zinc-900',
            )}
          >
            Overall readiness: {isHovered ? '98%' : '42%'}
          </p>
          {/* Shared space for “Most reviewees…” vs “Same exam…” */}
          <p className='text-zinc-600'>
            {isHovered
              ? 'Same exam. Very different odds when you train with intent.'
              : 'Most reviewees sit here right before they realise where the gaps are.'}
          </p>
        </div>
      </div>

      <div className='mt-3 space-y-2'>
        {SUBJECT_READINESS.map(({ label, value, improved }) => {
          const score = isHovered ? improved : value
          const barClass =
            score < 50
              ? 'bg-red-600'
              : score < 70
                ? 'bg-amber-600'
                : 'bg-emerald-500'

          return (
            <div key={label} className='space-y-1'>
              <div className='flex items-center justify-between text-[11px]'>
                <span className='truncate text-zinc-700'>{label}</span>
                <span
                  className={cn(
                    'font-medium',
                    isHovered ? 'text-emerald-700' : 'text-zinc-900',
                  )}
                >
                  {score}%
                </span>
              </div>
              <div className='h-1.5 w-full rounded-full bg-zinc-100'>
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-[width] duration-200',
                    barClass,
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className='mt-3 flex items-center justify-between text-[11px] text-zinc-500'>
        <Link
          href={isLoggedIn ? ROUTES.ANALYTICS : ROUTES.REGISTER}
          className='ml-auto inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 text-2xs'
          aria-label='Open your readiness dashboard'
        >
          {isHovered ? 'See how SlateCamp gets you here' : 'Start now'}
          <span aria-hidden='true'>→</span>
        </Link>
      </div>
    </div>
  )
}

const HeroCards = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
  <div
    id='hero-right'
    className='relative flex min-h-[320px] w-full flex-col items-center gap-4 md:col-span-5 md:min-h-[380px] md:flex-row md:items-stretch md:justify-center md:gap-0'
  >
    <ExamsSupportedCard />
    <MockQuestionCard />
    <ConversionHookCard isLoggedIn={isLoggedIn} />
  </div>
)

/* ── Main Hero Section Export ── */

export const HeroSection = ({
  ctaHref,
  isLoggedIn,
}: {
  ctaHref: string
  isLoggedIn: boolean
}) => (
  <section
    aria-label='Hero'
    className='relative flex flex-col overflow-hidden px-6 pb-0 pt-18 md:pt-20'
  >
    <div
      className='landing-orb pointer-events-none absolute right-[-10%] top-[-15%] h-[50vh] w-[50vh] rounded-full md:h-[45vw] md:w-[45vw]'
      style={{
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
      <div className='relative grid h-[600px] grid-cols-1 items-start gap-8 md:grid-cols-12 md:items-center'>
        {/* Left: Giant headline */}
        <div className='md:col-span-7 h-full flex flex-col justify-start '>
          <div className='mt-26'>
            <div className='landing-reveal flex items-center gap-3'>
              <div
                className='flex flex-col gap-1 text-blue-500'
                aria-label='Board exam preparation platform.'
              >
                <div className='flex flex-row items-center gap-2'>
                  <Starburst className='h-4 w-4' />
                  <span className='font-mono text-[11px] tracking-[0.25em] font-bold uppercase'>
                    Board exam preparation platform.{' '}
                  </span>
                </div>
              </div>
            </div>

            <HeroHeadline />
          </div>

          <div className='mb-4 flex h-full flex-col justify-start'>
            <div>
              <p className='landing-reveal landing-delay-2 mt-6 max-w-lg text-sm leading-relaxed text-zinc-700 font-medium'>
                Study with precision. Pass with confidence.
              </p>
            </div>

            <div className='landing-reveal landing-delay-4 flex flex-col items-end justify-end gap-3'>
              <Link
                href={ctaHref}
                className='inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-7 py-3 text-[14px] font-medium text-white transition-all duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2'
              >
                Prove you&apos;re ready <ChevronRight />
              </Link>
              <p className='landing-reveal landing-delay-5 flex justify-start text-[10px] font-semibold text-zinc-500'>
                Free forever to start &middot; No credit card required
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className='landing-reveal landing-delay-6 mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-zinc-200 pt-3'>
            {STATS.map((stat) => (
              <span
                key={stat}
                className='flex items-center gap-2 text-[12px] text-zinc-400'
              >
                <span
                  className='h-1 w-1 rounded-full bg-zinc-900'
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
