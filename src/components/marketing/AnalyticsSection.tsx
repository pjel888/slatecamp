'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  FeatureSectionLayout,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'
import { palette, cssVars } from '@/components/graphics/tokens'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

/* ── Readiness ring SVG ── */

const ReadinessRing = ({ value, className = '' }: { value: number; className?: string }) => {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const ref = useRef<SVGCircleElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className={`relative ${className}`}>
      <svg className='-rotate-90' width={80} height={80} viewBox='0 0 80 80' aria-hidden='true'>
        <circle cx={40} cy={40} r={radius} fill='none' stroke={palette.borderDefault} strokeWidth={5} />
        <motion.circle
          ref={ref}
          cx={40}
          cy={40}
          r={radius}
          fill='none'
          stroke={palette.amber}
          strokeWidth={5}
          strokeLinecap='round'
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isInView ? offset : circumference }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <span className='absolute inset-0 flex items-center justify-center font-mono text-[18px] font-extrabold text-camp-black'>
        {value}%
      </span>
    </div>
  )
}

/* ── Animated mastery bar ── */

const AnimatedBar = ({ pct, color }: { pct: number; color: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className='h-full rounded-full'
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: isInView ? `${pct}%` : 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    />
  )
}

/* ── Analytics mockup ── */

const AnalyticsMockup = () => (
  <div className='rounded-md border border-border-design bg-white p-5'>
    {/* Overall score + ring */}
    <div className='mb-4 flex items-center gap-4'>
      <ReadinessRing value={75} className='h-20 w-20' />
      <div>
        <div className='text-[18px] font-extrabold text-camp-black'>Getting there</div>
        <div className='mt-1 text-[11px] leading-relaxed text-text-2'>
          2 subjects need targeted review before you&apos;re exam-ready.
        </div>
        <div className='mt-2 font-mono text-[11px] text-marketing-tertiary'>↑ +8 pts this week</div>
      </div>
    </div>

    {/* Stat mini-grid */}
    <div className='mb-4 grid grid-cols-2 gap-2'>
      {[
        { label: 'Questions', value: '847', sub: 'answered total', accent: undefined },
        { label: 'Streak', value: '12', sub: 'days active', accent: cssVars.accent },
      ].map((stat) => (
        <div key={stat.label} className='rounded-[8px] bg-muted p-3'>
          <div className='font-mono text-[11px] uppercase tracking-[.12em] text-marketing-tertiary'>{stat.label}</div>
          <div className='mt-1 text-[20px] font-extrabold' style={{ color: stat.accent || 'var(--foreground)' }}>
            {stat.value}
          </div>
          <div className='text-[11px] text-marketing-tertiary'>{stat.sub}</div>
        </div>
      ))}
    </div>

    {/* Subject bars */}
    <div className='mb-2.5 font-mono text-[11px] uppercase tracking-[.15em] text-marketing-tertiary'>By Subject</div>
    {[
      { name: 'Structural Design', pct: 85, color: palette.slateBlue },
      { name: 'Building Technology', pct: 62, color: palette.amber },
      { name: 'Architectural Theory', pct: 41, color: palette.warmRed },
      { name: 'History of Arch.', pct: 73, color: palette.amber },
      { name: 'Utilities (MEPFS)', pct: 88, color: palette.slateBlue },
    ].map((s) => (
      <div key={s.name} className='mb-2'>
        <div className='mb-1 flex justify-between font-mono text-[11px]'>
          <span className='text-marketing-tertiary'>{s.name}</span>
          <span style={{ color: s.color }}>{s.pct}%</span>
        </div>
        <div className='h-[5px] overflow-hidden rounded-full bg-border-design'>
          <AnimatedBar pct={s.pct} color={s.color} />
        </div>
      </div>
    ))}
  </div>
)

/* ── Score legend ── */

const ScoreLegend = () => (
  <div className='mt-6 rounded-md border border-border-design bg-white p-4'>
    <div className='mb-3 text-[13px] font-bold text-camp-black'>What the score actually means</div>
    {[
      { range: '85–100%', label: 'Exam ready. Focus on weak spots.', color: palette.slateBlue },
      { range: '60–84%', label: 'Getting there. Targeted review.', color: palette.amber },
      { range: 'Below 60%', label: 'At risk. Build the foundation.', color: palette.warmRed },
    ].map((tier) => (
      <div key={tier.range} className='mb-2 flex items-center gap-3'>
        <div className='h-2 w-8 rounded-full' style={{ background: tier.color }} />
        <span className='text-[12px] text-camp-black'>
          <strong>{tier.range}</strong>{' '}
          <span className='text-text-2'>{tier.label}</span>
        </span>
      </div>
    ))}
  </div>
)

/* ── Analytics Section ── */

export const AnalyticsSection = () => (
  <FeatureSectionLayout>
    {/* Copy — left */}
    <StaggerParent>
      {/* TODO: evaluate SectionHeader migration — uses marketing SectionEyebrow with Starburst icon */}
      <StaggerItem>
        <SectionEyebrow label='Analytics' />
      </StaggerItem>

      <StaggerItem>
        <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] text-camp-black sm:text-[34px]'>
          Stop guessing. Your Readiness Score
          <br />
          tells you exactly where you stand.
        </h2>
      </StaggerItem>

      <StaggerItem>
        <p className='mt-4 max-w-[440px] text-[14px] leading-relaxed text-text-2'>
          Not a grade. A GPS. Live, subject-by-subject mastery data
          updated after every session — so you always know which
          topic needs work next.
        </p>
      </StaggerItem>

      {/* Feature chips */}
      <StaggerItem>
        <div className='mt-5 flex flex-wrap gap-2'>
          <FeaturePill variant='cobalt'>Live Readiness Score</FeaturePill>
          <FeaturePill variant='cobalt'>Subject heatmap</FeaturePill>
          <FeaturePill variant='cobalt'>Session history</FeaturePill>
          <FeaturePill variant='amber'>Stamina tracking</FeaturePill>
          <FeaturePill variant='cobalt'>Pacing calendar</FeaturePill>
        </div>
      </StaggerItem>

      <StaggerItem>
        <ScoreLegend />
      </StaggerItem>
    </StaggerParent>

    {/* Mockup — right */}
    <ScrollReveal delay={0.2} y={20}>
      <AnalyticsMockup />
    </ScrollReveal>
  </FeatureSectionLayout>
)


