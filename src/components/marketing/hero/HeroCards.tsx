'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Starburst,
  ReadinessDial,
} from '@/components/marketing/LandingPrimitives'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

/* ── Constants ── */

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

const SUBJECT_READINESS = [
  { label: 'Building Technology', value: 38, improved: 96 },
  { label: 'Professional Practice', value: 42, improved: 99 },
  { label: 'Structural Design', value: 35, improved: 98 },
  { label: 'Planning & Design', value: 47, improved: 99 },
] as const

/* ── Card 1: Board-Review Subject Coverage (Back Left) ── */

const BoardReviewSubjectCoverageCard = () => {
  const subjects = [
    { name: 'Building Technology', weight: '20%', color: 'bg-camp-cobalt' },
    { name: 'Structural Design', weight: '15%', color: 'bg-camp-cobalt' },
    { name: 'Utilities (MEPFS)', weight: '15%', color: 'bg-camp-cobalt' },
    { name: 'History of Architecture', weight: '15%', color: 'bg-camp-orange' },
    { name: 'Architectural Design', weight: '15%', color: 'bg-camp-orange' },
    { name: 'Professional Practice', weight: '10%', color: 'bg-camp-orange' },
    { name: 'Building Laws & Codes', weight: '10%', color: 'bg-camp-orange' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className='order-1 w-full max-w-[280px] rounded-md bg-linear-to-b from-white to-white/90 p-4 shadow-[0_10px_30px_rgba(24,24,27,0.06)] ring-1 ring-border-design transition-all duration-150 md:absolute md:left-5 md:-top-28 md:order-0 md:z-10 md:-rotate-3 md:hover:z-50 md:hover:-translate-y-2 md:hover:shadow-[0_18px_40px_rgba(24,24,27,0.14)]'
      aria-hidden='true'
    >
      <div className='mb-2.5 flex items-center gap-1.5 border-b border-border-design pb-2'>
        <Starburst className='h-3 w-3 text-camp-amber' />
        <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-extrabold uppercase tracking-[0.22em] text-text-2'>
          Board coverage
        </span>
      </div>
      <ul className='space-y-1.5'>
        {subjects.map((subject) => (
          <li
            key={subject.name}
            className='flex items-center justify-between gap-2 rounded-sm px-1.5 py-1 hover:bg-muted/70'
          >
            <div className='flex min-w-0 items-center gap-2'>
              <span
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  subject.color,
                )}
              />
              <span className='truncate text-[13px] font-medium leading-tight text-text-2'>
                {subject.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className='mt-2.5 border-t border-border-design pt-2 text-center'>
        <span className='text-[11px] font-medium text-text-2'>
          Seven subjects · study map preview
        </span>
      </div>
    </motion.div>
  )
}

/* ── Card 2: Mock Question (Back Right) ── */

const MockQuestionCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className='order-3 w-full max-w-[280px] rounded-md border border-border-design bg-white p-5 shadow-[0_10px_30px_rgba(24,24,27,0.06)] transition-all duration-150 md:absolute md:right-4 md:top-4 md:order-0 md:z-10 md:rotate-3 md:hover:z-50 md:hover:-translate-y-1.5'
    aria-hidden='true'
  >
    <div className='mb-2.5 flex items-center justify-between border-b border-border-design pb-2'>
      <div className='flex items-center gap-1.5'>
        <Starburst className='h-3 w-3 text-camp-amber' />
        <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-extrabold uppercase tracking-[0.22em] text-text-2'>
          Sample Question
        </span>
      </div>
      <span className='rounded bg-muted px-2 py-0.5 font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.1em] uppercase text-marketing-tertiary'>
        {MOCK_QUESTION.topic}
      </span>
    </div>
    <p className='mb-3 text-[12px] leading-snug text-ink'>
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
              isCorrect && 'border-emerald bg-success-50 text-emerald',
              isIncorrect && 'border-destructive bg-destructive-50 text-destructive',
              !isCorrect &&
                !isIncorrect &&
                'border-border-design bg-white text-foreground hover:bg-white',
            )}
          >
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                isCorrect && 'bg-emerald',
                isIncorrect && 'bg-destructive',
                !isCorrect && !isIncorrect && 'bg-muted-foreground',
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

/* ── Card 3: Readiness Snapshot (Front Center) ── */

const ConversionHookCard = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className='order-2 z-20 w-full max-w-[320px] rounded-md border border-border-design bg-white/90 p-6 shadow-[0_20px_50px_rgba(24,24,27,0.12)] backdrop-blur-sm transition-transform duration-150 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:hover:-translate-x-1/2 md:hover:-translate-y-[calc(50%+12px)] md:p-7 hover:rotate-1'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='mb-3 flex items-center gap-1.5 border-b border-border-design pb-2.5'>
        <Starburst className='h-3 w-3 text-camp-amber' />
        <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-extrabold uppercase tracking-[0.22em] text-text-2'>
          Readiness snapshot
        </span>
      </div>

      <h3 className='text-base font-semibold text-ink'>
        {isHovered ? 'A clearer study plan' : 'Know what to repair next'}
      </h3>

      <p className='mt-2 text-[12px] leading-snug text-text-2'>
        {isHovered
          ? 'This is what the map can feel like once weak topics are visible.'
          : 'Use SlateCamp after lecture or mock exams to find gaps while there is still time to repair them.'}
      </p>

      <div className='mt-3 flex items-center gap-3 rounded-md bg-white/80 p-3 ring-1 ring-border'>
        <ReadinessDial
          value={isHovered ? 98 : 42}
          label={isHovered ? 'Study plan clearer' : 'Repair list starting point'}
          showWarning={!isHovered}
          tone={isHovered ? 'success' : 'warning'}
        />
        <div className='space-y-1 text-[11px]'>
          <p
            className={cn(
              'font-medium',
              isHovered ? 'text-emerald-700' : 'text-ink',
            )}
          >
            Overall readiness: {isHovered ? '98%' : '42%'}
          </p>
          <p className='text-text-2'>
            {isHovered
              ? 'Same goal. Clearer priorities for what to review next.'
              : 'The useful moment is finding the gap before it becomes a surprise.'}
          </p>
        </div>
      </div>

      <div className='mt-3 space-y-2'>
        {SUBJECT_READINESS.map(({ label, value, improved }) => {
          const score = isHovered ? improved : value
          const barClass =
            score < 50
              ? 'bg-destructive'
              : score < 70
                ? 'bg-warning'
                : 'bg-emerald-500'

          return (
            <div key={label} className='space-y-1'>
              <div className='flex items-center justify-between text-[11px]'>
                <span className='truncate text-text-2'>{label}</span>
                <span
                  className={cn(
                    'font-medium',
                    isHovered ? 'text-emerald-700' : 'text-ink',
                  )}
                >
                  {score}%
                </span>
              </div>
              <div className='h-1.5 w-full rounded-full bg-muted'>
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

      <div className='mt-3 flex items-center justify-between text-[11px] text-text-2'>
        <Link
          href={isLoggedIn ? ROUTES.dashboard.analytics : ROUTES.auth.register}
          className='ml-auto inline-flex items-center gap-1 rounded-sm border border-border-design bg-white/80 px-3 py-1 font-medium text-primary transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-2xs'
          aria-label='Open your readiness dashboard'
        >
          Start Now
          <span aria-hidden='true'>→</span>
        </Link>
      </div>
    </motion.div>
  )
}

/* ── Exported HeroCards Composition ── */

export const HeroCards = ({ isLoggedIn }: { isLoggedIn: boolean }) => (
  <div
    id='hero-right'
    className='relative flex min-h-[320px] w-full flex-col items-center gap-4 md:col-span-5 md:min-h-[380px]  md:flex-row md:items-stretch md:justify-center md:gap-0'
  >
    <BoardReviewSubjectCoverageCard />
    <MockQuestionCard />
    <ConversionHookCard isLoggedIn={isLoggedIn} />
  </div>
)
