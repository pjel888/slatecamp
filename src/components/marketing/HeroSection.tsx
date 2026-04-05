'use client'

import Link from 'next/link'
import { HeroHeadline } from '@/components/marketing/HeroHeadline'
import {
  Starburst,
  NoiseOverlay,
  DottedGridOverlay,
} from '@/components/marketing/LandingPrimitives'
import { cn } from '@/lib/utils'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

import { DashboardPeek } from './hero/DashboardPeek'
import { HeroCards } from './hero/HeroCards'

/* ── Constants ── */

const STATS = [
  'Syllabus-mapped to the ALE',
  'Real-time Readiness Score',
  'AI answers cite their sources',
] as const

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

    {/* Hero Content */}
    <div className='relative z-10 mx-auto w-full max-w-[1200px]'>
      <div className='relative grid h-[600px] grid-cols-1 items-start gap-8 md:grid-cols-12 md:items-center'>
        {/* Left: Giant headline */}
        <div className='md:col-span-7 h-full flex flex-col justify-start '>
          <div className='mt-26'>
            <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 flex items-center gap-3'>
              <div
                className='flex flex-col gap-1 text-primary'
                aria-label='Professional ALE review platform.'
              >
                <div className='flex flex-row items-center gap-2 '>
                  <Starburst className='h-3 w-3' />
                  <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.22em] uppercase text-camp-cobalt'>
                    Professional ALE review platform.
                  </span>
                </div>
              </div>
            </div>

            <HeroHeadline />
          </div>

          <div className=' flex h-full flex-col justify-start pt-8'>
            <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-500 flex flex-col items-end justify-end gap-3'>
              <Link
                href={ctaHref}
                className='inline-flex items-center gap-2 whitespace-nowrap rounded-sm bg-camp-cobalt px-7 py-3 text-[14px] font-medium text-white transition-all duration-150 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
              >
                {ctaLabel} <SCIcon icon={CaretRight} size='md' />
              </Link>
              <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-700 flex justify-start text-[11px] font-semibold text-text-2'>
                Free to start &middot; No credit card required
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-[900ms] mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border-design pt-3'>
            {STATS.map((stat) => (
              <span
                key={stat}
                className='flex items-center gap-2 text-[12px] text-gray-400'
              >
                <span
                  className='h-1 w-1 rounded-full bg-camp-cobalt'
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
