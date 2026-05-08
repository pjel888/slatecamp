'use client'

import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { AtlasFieldHero } from '@/components/marketing/hero/AtlasFieldHero'
import {
  Starburst,
  NoiseOverlay,
  DottedGridOverlay,
} from '@/components/marketing/LandingPrimitives'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants'

export const HeroSection = ({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string
  ctaLabel: string
}) => (
  <section
    aria-label='Architecture knowledge atlas for school, board readiness, and practice.'
    className='relative overflow-hidden bg-page-bg px-6 pb-10 pt-36 md:pt-36'
  >
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-[url("/images/dashboard/Dashboard-BG-Image.png")] bg-cover bg-bottom bg-no-repeat opacity-75'
    />
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-page-bg/35 via-page-bg/76 to-page-bg'
    />
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-y-0 left-0 z-0 w-[58%] bg-linear-to-r from-page-bg via-page-bg/84 to-transparent'
    />
    <div
      className='landing-orb pointer-events-none absolute right-[-8%] top-[-18%] h-[50vh] w-[50vh] rounded-full md:h-[42vw] md:w-[42vw]'
      style={{ filter: 'blur(34px)' }}
      aria-hidden='true'
    />
    <DottedGridOverlay />
    <NoiseOverlay opacity={0.035} />

    <div className='relative z-10 mx-auto w-full max-w-[1240px]'>
      <div className='grid min-h-[calc(100vh-144px)] items-center gap-7 py-2 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:py-0'>
        <div className='max-w-[680px]'>
          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 flex items-center gap-2'>
            <Starburst className='h-3 w-3 text-camp-amber' />
            <span className='font-[family-name:var(--font-dm-mono)] text-[12px] font-semibold tracking-[0.22em] uppercase text-camp-cobalt'>
              Architecture knowledge atlas
            </span>
          </div>

          <h1 className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-100 mt-4 font-[family-name:var(--font-geist-sans)] text-[clamp(2.65rem,5.8vw,4.82rem)] font-black leading-[0.94] tracking-[-0.052em] text-foreground'>
            Navigate architecture knowledge with confidence.
          </h1>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-200 mt-5 max-w-[600px] text-[16px] font-semibold leading-relaxed text-camp-black/85 sm:text-[18px]'>
            Source-backed resources, visual explanations, quizzes, 3D labs, and practical tools for school, boards, and practice.
          </p>

          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-300 mt-5 flex flex-wrap items-center gap-3'>
            <Link
              href={ctaHref}
              className='inline-flex items-center gap-2 whitespace-nowrap rounded-sm bg-camp-cobalt px-7 py-3 text-[14px] font-semibold text-white transition-all duration-150 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
            >
              {ctaLabel} <SCIcon icon={CaretRight} size='md' />
            </Link>
            <Link
              href={ROUTES.calculators.root}
              className='inline-flex items-center gap-2 whitespace-nowrap rounded-sm border border-border-design bg-white/80 px-7 py-3 text-[14px] font-semibold text-camp-black transition-all duration-150 hover:border-camp-cobalt/40 hover:text-camp-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
            >
              Try free tools
            </Link>
          </div>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-500 mt-4 max-w-[560px] text-[14px] font-semibold leading-relaxed text-camp-black'>
            Open the atlas to browse the topic map, jump into source-backed guides, check weak spots, and leave with the next useful step.
          </p>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-700 mt-2 max-w-[580px] text-[12px] font-bold leading-relaxed text-camp-black'>
            Free to start · No credit card required · Educational guidance with clear source boundaries
          </p>
        </div>

        <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:delay-300'>
          <AtlasFieldHero />
        </div>
      </div>
    </div>
  </section>
)
