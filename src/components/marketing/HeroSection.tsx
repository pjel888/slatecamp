'use client'

import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { AtlasAtmosphere } from '@/components/marketing/hero/AtlasFieldHero'
import {
  Starburst,
  NoiseOverlay,
} from '@/components/marketing/LandingPrimitives'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ROUTES } from '@/lib/constants'

const ATLAS_INDEX = [
  {
    code: '01 / Find',
    title: 'Open the topic',
    body: 'Start with the subject, related concepts, and source notes where they are verified.',
  },
  {
    code: '02 / Check',
    title: 'See what stayed',
    body: 'Use practice as a calm check, not as another reason to panic.',
  },
  {
    code: '03 / See',
    title: 'Make rules visible',
    body: 'Use available visual examples when spatial rules need more than text.',
  },
  {
    code: '04 / Revisit',
    title: 'Choose the next pass',
    body: 'Turn weak-topic signals into a clearer next step beside your notes and mentors.',
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
    aria-label='Architecture knowledge atlas for school, board season, and practice context.'
    className='relative isolate overflow-hidden bg-camp-black px-6 pb-14 pt-16 text-white sm:pt-20 lg:min-h-[calc(100vh-56px)] lg:pb-16 lg:pt-16'
  >
    <AtlasAtmosphere />
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(93,136,255,0.28),transparent_32%),radial-gradient(circle_at_88%_16%,rgba(232,133,58,0.22),transparent_28%),linear-gradient(135deg,rgba(6,16,29,0.64),rgba(6,16,29,0.96)_58%,rgba(6,16,29,1))]'
    />
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 opacity-[0.16] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.68)_1px,transparent_1px)] [background-size:24px_24px]'
    />
    <NoiseOverlay opacity={0.055} />

    <div className='relative z-10 mx-auto grid min-h-[calc(100vh-160px)] w-full max-w-[1240px] items-center gap-10 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.64fr)] lg:gap-12'>
      <div className='max-w-[760px] py-8 lg:py-16'>
        <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 flex items-center gap-2'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <span className='font-[family-name:var(--font-dm-mono)] text-[12px] font-semibold uppercase tracking-[0.24em] text-camp-amber'>
            Architecture knowledge atlas
          </span>
        </div>

        <h1 className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-100 motion-safe:duration-300 mt-5 font-[family-name:var(--font-geist-sans)] text-[clamp(3.1rem,8.2vw,7.2rem)] font-black leading-[0.86] tracking-[-0.072em] text-white'>
          Find where it fits. Know what to revisit.
        </h1>

        <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-200 motion-safe:duration-300 mt-7 max-w-[680px] text-[16px] font-semibold leading-relaxed text-white/74 sm:text-[19px]'>
          SlateCamp organizes architecture topics, source-aware references, visual explanations, practice paths, and weak-topic signals so scattered review feels like a map again.
        </p>

        <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-300 motion-safe:duration-300 mt-8 flex flex-wrap items-center gap-3'>
          <Link
            href={ctaHref}
            className='inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm bg-camp-amber px-7 py-3 text-[14px] font-bold text-camp-black transition-all duration-150 hover:bg-warning-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-amber focus-visible:ring-offset-2 focus-visible:ring-offset-camp-black'
          >
            {ctaLabel} <SCIcon icon={CaretRight} size='md' />
          </Link>
          <Link
            href={ROUTES.dashboard.wiki}
            className='inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm border border-white/20 bg-white/[0.06] px-7 py-3 text-[14px] font-semibold text-white/84 transition-all duration-150 hover:border-white/34 hover:bg-white/[0.10] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-camp-black'
          >
            Find a topic
          </Link>
        </div>

        <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-500 motion-safe:duration-300 mt-5 max-w-[660px] text-[13px] font-medium leading-relaxed text-white/64'>
          Use beside school, books, mentors, notes, review materials, and self-study. SlateCamp is an independent educational resource; verify current requirements with primary documents and qualified professionals.
        </p>
      </div>

      <aside
        aria-label='SlateCamp atlas path index'
        className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-300 motion-safe:duration-500 relative border-y border-white/16 py-2 lg:border-y-0 lg:border-l lg:py-0 lg:pl-8'
      >
        <div className='mb-4 flex items-center justify-between border-b border-white/12 pb-3 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.2em] text-white/42'>
          <span>Atlas index</span>
          <span>SC / 01</span>
        </div>
        <div className='divide-y divide-white/12'>
          {ATLAS_INDEX.map((item) => (
            <div key={item.code} className='grid gap-3 py-4 sm:grid-cols-[112px_1fr] lg:grid-cols-1 xl:grid-cols-[112px_1fr]'>
              <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold uppercase tracking-[0.18em] text-camp-amber/80'>
                {item.code}
              </span>
              <div>
                <p className='text-[17px] font-extrabold leading-tight text-white'>{item.title}</p>
                <p className='mt-1 text-[12px] font-medium leading-relaxed text-white/64'>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  </section>
)
