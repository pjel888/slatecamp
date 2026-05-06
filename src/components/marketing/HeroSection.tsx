'use client'

import Link from 'next/link'
import { HeroHeadline } from '@/components/marketing/HeroHeadline'
import {
  Starburst,
  NoiseOverlay,
  DottedGridOverlay,
} from '@/components/marketing/LandingPrimitives'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

/* ── Constants ── */

const STATS = [
  'Syllabus-mapped to the LEA',
  'Real-time Readiness Score',
  'Source-backed explanations',
] as const

/* ── Main Hero Section Export ── */

export const HeroSection = ({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string
  ctaLabel: string
}) => (
  <section
    aria-label='Hero'
    className='relative flex flex-col overflow-hidden bg-page-bg px-6 pb-0 pt-18 md:pt-20'
  >
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-[url("/images/dashboard/Dashboard-BG-Image.png")] bg-cover bg-bottom bg-no-repeat opacity-70'
    />
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-page-bg/35 via-page-bg/20 to-page-bg'
    />
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
      <div className='relative flex min-h-[600px] flex-col items-start'>
        {/* Giant headline */}
        <div className='flex h-full w-full max-w-[760px] flex-col justify-start'>
          <div className='mt-26'>
            <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 flex items-center gap-3'>
              <div
                className='flex flex-col gap-1 text-primary'
                aria-label='Professional LEA review platform.'
              >
                <div className='flex flex-row items-center gap-2 '>
                  <Starburst className='h-3 w-3' />
                  <span className='font-[family-name:var(--font-dm-mono)] text-[12px] font-semibold tracking-[0.22em] uppercase text-camp-cobalt'>
                    Licensure Examination Review for Architects
                  </span>
                </div>
                {/* <p className='text-[12px] font-semibold'>Review Platform</p> */}
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
        </div>
      </div>
    </div>
  </section>
)
