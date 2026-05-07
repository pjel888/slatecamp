'use client'

import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { HeroCodeEnvelopeExplorer } from '@/components/marketing/hero/HeroCodeEnvelopeExplorer'
import {
  Starburst,
  NoiseOverlay,
  DottedGridOverlay,
} from '@/components/marketing/LandingPrimitives'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants'

const PROOF_PILLS = [
  'Source-backed explanations',
  'Licensure Examination for Architects readiness map',
  'Interactive 3D lab',
  'Free architecture tools',
] as const

const PLATFORM_PILLARS = [
  {
    title: 'Knowledge Resources',
    body: 'Find the rule, see the explanation, then connect it to quizzes and 3D examples.',
  },
  {
    title: 'Quizzes',
    body: 'Check what stuck after lecture, mock exams, and late-night study sessions.',
  },
  {
    title: '3D Lab',
    body: 'Turn spatial code topics into visible, inspectable study moments.',
  },
  {
    title: 'Free Tools',
    body: 'Use calculators and study utilities that stay useful beyond board review.',
  },
] as const

export const HeroSection = ({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string
  ctaLabel: string
}) => (
  <section
    aria-label='Architecture learning platform for school, Licensure Examination for Architects readiness, and practice.'
    className='relative overflow-hidden bg-page-bg px-6 pb-8 pt-20 md:pt-22'
  >
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-[url("/images/dashboard/Dashboard-BG-Image.png")] bg-cover bg-bottom bg-no-repeat opacity-45'
    />
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-page-bg/20 via-page-bg/65 to-page-bg'
    />
    <div
      className='landing-orb pointer-events-none absolute right-[-8%] top-[-18%] h-[50vh] w-[50vh] rounded-full md:h-[42vw] md:w-[42vw]'
      style={{ filter: 'blur(34px)' }}
      aria-hidden='true'
    />
    <DottedGridOverlay />
    <NoiseOverlay opacity={0.035} />

    <div className='relative z-10 mx-auto w-full max-w-[1240px]'>
      <div className='grid min-h-[calc(100vh-96px)] items-center gap-10 py-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-6'>
        <div className='max-w-[680px]'>
          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 flex items-center gap-2'>
            <Starburst className='h-3 w-3 text-camp-amber' />
            <span className='font-[family-name:var(--font-dm-mono)] text-[12px] font-semibold tracking-[0.22em] uppercase text-camp-cobalt'>
              Architecture learning platform
            </span>
          </div>

          <h1 className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-100 mt-5 font-[family-name:var(--font-geist-sans)] text-[clamp(3.1rem,8vw,6.4rem)] font-black leading-[0.9] tracking-[-0.055em] text-foreground'>
            Your architecture study companion.
          </h1>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-200 mt-6 max-w-[590px] text-[16px] font-medium leading-relaxed text-primary sm:text-[18px]'>
            Source-backed resources, quizzes, 3D labs, and free tools for architecture school,
            Licensure Examination for Architects readiness, and professional practice.
          </p>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-300 mt-4 max-w-[580px] rounded-2xl border border-white/70 bg-white/75 p-4 text-[15px] font-medium leading-relaxed text-camp-black shadow-sm backdrop-blur'>
            Built around Philippine codes, board-review realities, and the way students actually study: anxious after lecture, buried in notes, and looking for a reliable buddy that makes the hard parts visible.
          </p>

          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-500 mt-8 flex flex-wrap items-center gap-3'>
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
              Explore Free Tools
            </Link>
            <Link
              href='#knowledge-resources'
              className='text-[13px] font-semibold text-camp-cobalt underline decoration-camp-cobalt/25 underline-offset-4 hover:decoration-camp-cobalt'
            >
              Browse free knowledge previews
            </Link>
          </div>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-700 mt-3 max-w-[620px] text-[12px] font-bold leading-relaxed text-camp-black'>
            Free after signup where needed · No credit card required · Built to use beside your review center, school, books, and mentors
          </p>

          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:delay-500 mt-7 flex flex-wrap gap-2'>
            {PROOF_PILLS.map((pill) => (
              <span
                key={pill}
                className='rounded-full border border-camp-cobalt/15 bg-white/80 px-3 py-1.5 text-[12px] font-bold text-camp-black shadow-sm'
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:delay-300'>
          <HeroCodeEnvelopeExplorer />
        </div>
      </div>

      <div className='grid gap-3 border-t border-border-design/80 pt-4 sm:grid-cols-2 lg:grid-cols-4'>
        {PLATFORM_PILLARS.map((pillar) => (
          <div key={pillar.title} className='rounded-xl border border-border-design bg-white/75 p-4 shadow-sm backdrop-blur'>
            <h2 className='text-[13px] font-extrabold text-camp-black'>{pillar.title}</h2>
            <p className='mt-1 text-[12px] leading-relaxed text-text-2'>{pillar.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
