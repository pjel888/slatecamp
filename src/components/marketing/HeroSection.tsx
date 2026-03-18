'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
import { CaretRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

/* ── Dashboard Mockup Peek ── */

const DashboardPeek = () => (
  <div className='relative mx-auto w-full max-w-[900px] pt-2 landing-reveal landing-delay-2'>
    <div className='relative h-[140px] overflow-hidden rounded-t-[10px] border border-b-0 border-[#E8E4DC] bg-[#FFFDF7] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'>
      {/* Fake window chrome */}
      <div className='flex items-center gap-1.5 border-b border-[#E8E4DC] bg-[#F2F0EB] px-4 py-2.5'>
        <div className='h-2.5 w-2.5 rounded-full bg-[#E63329]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#F5A623]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#1B7A3C]' />
        <span className='ml-3 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#6B6B6B]'>
          SlateCamp Dashboard
        </span>
      </div>
      {/* Fake dashboard content */}
      <div className='flex gap-4 px-5 py-3'>
        {/* Sidebar */}
        <div className='hidden w-[140px] shrink-0 space-y-2 sm:block'>
          <div className='h-2 w-20 rounded bg-[#E8E4DC]' />
          <div className='h-2 w-16 rounded bg-[#E8E4DC]' />
          <div className='h-2 w-24 rounded bg-[#E8E4DC]' />
          <div className='h-2 w-20 rounded bg-[#E8E4DC]' />
        </div>
        {/* Main Content */}
        <div className='flex-1 space-y-2'>
          <div className='flex gap-3'>
            <div className='h-14 w-14 shrink-0 rounded-md bg-[#E8E4DC]' />
            <div className='flex-1 space-y-1.5 pt-1'>
              <div className='h-2.5 w-32 rounded bg-[#E8E4DC]' />
              <div className='h-2 w-48 rounded bg-[#E8E4DC]' />
            </div>
          </div>
          <div className='flex gap-2'>
            {[
              'bg-[#1B7A3C]',
              'bg-[#1B3FC4]',
              'bg-[#1B3FC4]',
              'bg-[#1B7A3C]',
              'bg-[#1B7A3C]',
              'bg-[#1B3FC4]',
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
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#FFFDF7] to-transparent' />
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
    status: 'In development',
    tone: 'upcoming' as const,
    category: 'health' as const,
  },
  {
    name: 'Master Plumber',
    status: 'Upcoming',
    tone: 'upcoming' as const,
    category: 'engineering' as const,
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
  'Syllabus-mapped to the ALE',
  'Real-time Readiness Score',
  'AI answers cite their sources',
] as const

/* ── Hero Cards Components ── */

// Card 1: Supported Exams (Back Left)
const ALESubjectCoverageCard = () => {
  const subjects = [
    { name: 'Building Technology', weight: '20%', color: 'bg-[#1B3FC4]' },
    { name: 'Structural Design', weight: '15%', color: 'bg-[#1B3FC4]' },
    { name: 'Utilities (MEPFS)', weight: '15%', color: 'bg-[#1B3FC4]' },
    { name: 'History of Architecture', weight: '15%', color: 'bg-[#E8853A]' },
    { name: 'Architectural Design', weight: '15%', color: 'bg-[#E8853A]' },
    { name: 'Professional Practice', weight: '10%', color: 'bg-[#E8853A]' },
    { name: 'Building Laws & Codes', weight: '10%', color: 'bg-[#E8853A]' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className='order-1 w-full max-w-[280px] rounded-md bg-linear-to-b from-[#FFFDF7] to-[#FFFDF7]/90 p-4 shadow-[0_10px_30px_rgba(24,24,27,0.06)] ring-1 ring-[#E8E4DC] transition-all duration-150 md:absolute md:left-5 md:-top-28 md:order-0 md:z-10 md:-rotate-3 md:hover:z-50 md:hover:-translate-y-2 md:hover:shadow-[0_18px_40px_rgba(24,24,27,0.14)]'
      aria-hidden='true'
    >
      <div className='mb-2.5 flex items-center gap-1.5 border-b border-[#E8E4DC] pb-2'>
        <Starburst className='h-3 w-3 text-[#F5A623]' />
        <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6B6B6B]'>
          ALE Coverage
        </span>
      </div>
      <ul className='space-y-1.5'>
        {subjects.map((subject) => (
          <li
            key={subject.name}
            className='flex items-center justify-between gap-2 rounded-sm px-1.5 py-1 hover:bg-[#F2F0EB]/70'
          >
            <div className='flex min-w-0 items-center gap-2'>
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  subject.color,
                )}
              />
              <span className='truncate text-[13px] font-medium leading-tight text-[#555]'>
                {subject.name}
              </span>
            </div>
            {/* <span className='shrink-0 font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums font-medium text-[#6B6B6B]'>
              {subject.weight}
            </span> */}
          </li>
        ))}
      </ul>
      <div className='mt-2.5 border-t border-[#E8E4DC] pt-2 text-center'>
        <span className='text-[11px] font-medium text-[#6B6B6B]'>
          All 7 subjects · Fully mapped
        </span>
      </div>
    </motion.div>
  )
}

// Card 2: Mock Question (Back Right)
const MockQuestionCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className='order-3 w-full max-w-[280px] rounded-md border border-[#E8E4DC] bg-[#FFFDF7] p-5 shadow-[0_10px_30px_rgba(24,24,27,0.06)] transition-all duration-150 md:absolute md:right-4 md:top-4 md:order-0 md:z-10 md:rotate-3 md:hover:z-50 md:hover:-translate-y-1.5'
      aria-hidden='true'
    >
      <div className='mb-2.5 flex items-center justify-between border-b border-[#E8E4DC] pb-2'>
        <div className='flex items-center gap-1.5'>
          <Starburst className='h-3 w-3 text-[#F5A623]' />
          <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6B6B6B]'>
            Sample Question
          </span>
        </div>
        <span className='rounded bg-[#F2F0EB] px-2 py-0.5 font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.1em] uppercase text-[#888]'>
          {MOCK_QUESTION.topic}
        </span>
      </div>
      <p className='mb-3 text-[12px] leading-snug text-[#18181B]'>
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
                'flex items-center gap-2 rounded-sm border px-2.5 py-1.5 text-[11px] transition-colors',
                isCorrect && 'border-[#2D9F6F] bg-[#EDFAF4] text-[#2D9F6F]',
                isIncorrect && 'border-[#D64545] bg-[#FDF0F0] text-[#D64545]',
                !isCorrect &&
                  !isIncorrect &&
                  'border-[#E8E4DC] bg-white text-zinc-800 hover:bg-[#FFFDF7]',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  isCorrect && 'bg-[#2D9F6F]',
                  isIncorrect && 'bg-[#D64545]',
                  !isCorrect && !isIncorrect && 'bg-zinc-400',
                )}
                aria-hidden='true'
              />
              {opt.label}
            </div>
          )
        })}
      </div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className='order-2 z-20 w-full max-w-[320px] rounded-md border border-[#E8E4DC] bg-[#FFFDF7]/90 p-6 shadow-[0_20px_50px_rgba(24,24,27,0.12)] backdrop-blur-sm transition-transform duration-150 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:hover:-translate-x-1/2 md:hover:-translate-y-[calc(50%+12px)] md:p-7 hover:rotate-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='mb-3 flex items-center gap-1.5 border-b border-[#E8E4DC] pb-2.5'>
        <Starburst className='h-3 w-3 text-[#F5A623]' />
        <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#6B6B6B]'>
          Readiness snapshot
        </span>
      </div>

      <h3 className='text-base font-semibold tracking-tight text-[#18181B]'>
        {isHovered ? "This is what's possible" : "Are you sure you'll pass?"}
      </h3>

      {/* Shared space for intro vs “this is what…” */}
      <p className='mt-2 text-[12px] leading-snug text-[#6B6B6B]'>
        {isHovered
          ? 'This is what your score can look like once SlateCamp is driving your review.'
          : 'Most students walk into the ALE not knowing where their gaps are. This is where you find out.'}
      </p>

      <div className='mt-3 flex items-center gap-3 rounded-md bg-white/80 p-3 ring-1 ring-zinc-100'>
        <ReadinessDial
          value={isHovered ? 98 : 42}
          label={isHovered ? 'Exam-ready' : 'At risk — typical starting score'}
          showWarning={!isHovered}
          tone={isHovered ? 'success' : 'warning'}
        />
        <div className='space-y-1 text-[11px]'>
          <p
            className={cn(
              'font-medium',
              isHovered ? 'text-emerald-700' : 'text-[#18181B]',
            )}
          >
            Overall readiness: {isHovered ? '98%' : '42%'}
          </p>
          {/* Shared space for “Most reviewees…” vs “Same exam…” */}
          <p className='text-[#6B6B6B]'>
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
              ? 'bg-[#D64545]'
              : score < 70
                ? 'bg-[#D4951A]'
                : 'bg-emerald-500'

          return (
            <div key={label} className='space-y-1'>
              <div className='flex items-center justify-between text-[11px]'>
                <span className='truncate text-[#555]'>{label}</span>
                <span
                  className={cn(
                    'font-medium',
                    isHovered ? 'text-emerald-700' : 'text-[#18181B]',
                  )}
                >
                  {score}%
                </span>
              </div>
              <div className='h-1.5 w-full rounded-full bg-[#F2F0EB]'>
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

      <div className='mt-3 flex items-center justify-between text-[11px] text-[#6B6B6B]'>
        <Link
          href={isLoggedIn ? ROUTES.ANALYTICS : ROUTES.REGISTER}
          className='ml-auto inline-flex items-center gap-1 rounded-sm border border-[#E8E4DC] bg-white/80 px-3 py-1 font-medium text-primary transition-colors hover:bg-[#EEF2FC] hover:text-[#1535A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-2xs'
          aria-label='Open your readiness dashboard'
        >
          Start Now
          <span aria-hidden='true'>→</span>
        </Link>
      </div>
    </motion.div>
  )
}

const HeroCards = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
  <div
    id='hero-right'
    className='relative flex min-h-[320px] w-full flex-col items-center gap-4 md:col-span-5 md:min-h-[380px]  md:flex-row md:items-stretch md:justify-center md:gap-0'
  >
    <ALESubjectCoverageCard />
    <MockQuestionCard />
    <ConversionHookCard isLoggedIn={isLoggedIn} />
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
    {/* <FloatingTestimonialMarquee /> */}

    {/* Hero Content */}
    <div className='relative z-10 mx-auto w-full max-w-[1200px]'>
      <div className='relative grid h-[600px] grid-cols-1 items-start gap-8 md:grid-cols-12 md:items-center'>
        {/* Left: Giant headline */}
        <div className='md:col-span-7 h-full flex flex-col justify-start '>
          <div className='mt-26'>
            <div className='landing-reveal flex items-center gap-3'>
              <div
                className='flex flex-col gap-1 text-primary'
                aria-label='Board exam preparation platform.'
              >
                <div className='flex flex-row items-center gap-2 '>
                  <Starburst className='h-3 w-3' />
                  <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.22em] uppercase text-[#1B3FC4]'>
                    Board exam preparation platform.
                  </span>
                </div>
              </div>
            </div>

            <HeroHeadline />
          </div>

          <div className=' flex h-full flex-col justify-start pt-8'>
            <div className='landing-reveal landing-delay-4 flex flex-col items-end justify-end gap-3'>
              <Link
                href={ctaHref}
                className='inline-flex items-center gap-2 whitespace-nowrap rounded-sm bg-[#1B3FC4] px-7 py-3 text-[14px] font-medium text-white transition-all duration-150 hover:bg-[#1535A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-2'
              >
                {ctaLabel} <SCIcon icon={CaretRight} size='md' />
              </Link>
              <p className='landing-reveal landing-delay-5 flex justify-start text-[11px] font-semibold text-[#6B6B6B]'>
                Free to start &middot; No credit card required
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className='landing-reveal landing-delay-6 mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#E8E4DC] pt-3'>
            {STATS.map((stat) => (
              <span
                key={stat}
                className='flex items-center gap-2 text-[12px] text-[#9CA3AF]'
              >
                <span
                  className='h-1 w-1 rounded-full bg-[#1B3FC4]'
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
