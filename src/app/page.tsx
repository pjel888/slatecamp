import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Instrument_Serif } from 'next/font/google'
import { ArrowUpRight } from 'lucide-react'
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
    'Cerebro',
  ],
  alternates: {
    canonical: '/',
  },
}

/* ── Decorative elements ── */

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

function CircleArrow({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
        dark
          ? 'border-white/20 text-white hover:bg-white/10'
          : 'border-[#1D1D1F]/15 text-[#1D1D1F] hover:bg-[#1D1D1F]/5'
      }`}
      aria-hidden='true'
    >
      <ArrowUpRight size={16} strokeWidth={1.5} />
    </span>
  )
}

function Pill({
  children,
  dark = false,
}: {
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase ${
        dark
          ? 'border-white/20 text-white/70'
          : 'border-[#1D1D1F]/12 text-[#1D1D1F]/60'
      }`}
    >
      {children}
    </span>
  )
}

/* ── Page ── */

function LandingMarketingNav() {
  return <MarketingNav activeRoute='/' logoScrollsToTop />
}

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
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Start Reviewing — Free'

  return (
    <div id='top' className='min-h-screen bg-[#F5F4F0]'>
      {/* ────────────────────── NAVIGATION ────────────────────── */}
      <LandingMarketingNav />

      <main>
        {/* ────────────────────── HERO ────────────────────── */}
        <section
          aria-label='Hero'
          className='relative overflow-hidden px-6 pt-32 pb-16 sm:pt-40 sm:pb-20'
        >
          {/* ── Ambient Background Layer ── */}
          <div
            className='pointer-events-none absolute inset-0'
            aria-hidden='true'
          >
            {/* Gradient mesh — achromatic base with faint amber glow */}
            <div
              className='absolute inset-0'
              style={{
                background: [
                  'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(237,128,8,0.12), transparent)',
                  'radial-gradient(ellipse 60% 80% at 20% 80%, rgba(29,29,31,0.05), transparent)',
                  'radial-gradient(ellipse 50% 60% at 85% 30%, rgba(134,134,139,0.06), transparent)',
                ].join(', '),
              }}
            />
            {/* Film grain noise — tiled PNG for editorial paper texture */}
            <div
              className='absolute inset-0 opacity-[0.25]'
              style={{
                backgroundImage: 'url(/noise.png)',
                backgroundRepeat: 'repeat',
                backgroundSize: '128px 128px',
                mixBlendMode: 'overlay',
              }}
            />
          </div>

          {/* ── Content Layer ── */}
          <div className='relative z-10 mx-auto max-w-[1200px]'>
            <div className='landing-reveal flex items-center gap-3'>
              <Starburst className='h-5 w-5 text-[#ED8008]' />
              <span className='text-[12px] font-medium uppercase tracking-[0.15em] text-[#86868B]'>
                Board Exam Prep, Reimagined
              </span>
            </div>

            <h1 className='landing-reveal landing-delay-1 mt-8 max-w-3xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-tight text-[#1D1D1F]'>
              Stop re-reading.
              <br />
              <span className={`${serif.className} font-normal italic`}>
                Start remembering.
              </span>
            </h1>

            <p className='landing-reveal landing-delay-2 mt-6 max-w-lg text-balance text-[17px] leading-relaxed text-[#6E6E73]'>
              AI-adaptive test prep that adjusts to your ability in real-time.
              Spaced repetition, active recall, and deep analytics — built for
              architecture board exam success.
            </p>

            <div className='landing-reveal landing-delay-3 mt-10 flex flex-wrap items-center gap-3'>
              <Link
                href={ctaHref}
                className='rounded-full bg-[#ED8008] px-7 py-3 text-[15px] font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED8008] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F4F0]'
              >
                {ctaLabel}
              </Link>
              {!isLoggedIn && (
                <Link
                  href={ROUTES.LOGIN}
                  className='rounded-full border border-[#1D1D1F]/12 px-7 py-3 text-[15px] font-medium text-[#1D1D1F] transition-colors duration-150 hover:bg-[#1D1D1F]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D1F]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F4F0]'
                >
                  I have an account
                </Link>
              )}
            </div>

            <p className='landing-reveal landing-delay-4 mt-6 text-[12px] text-[#AEAEB2]'>
              Free to start &middot; No credit card required
            </p>
          </div>
        </section>

        {/* ────────────────────── SOCIAL PROOF ────────────────────── */}
        <section aria-label='Social proof' className='px-6 py-6'>
          <div className='mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#AEAEB2]'>
            <span className='flex items-center gap-1.5'>
              <span
                className='h-1.5 w-1.5 rounded-full bg-[#ED8008]'
                aria-hidden='true'
              />
              2,400+ practice questions
            </span>
            <span className='flex items-center gap-1.5'>
              <span
                className='h-1.5 w-1.5 rounded-full bg-[#ED8008]'
                aria-hidden='true'
              />
              Built for ALE &amp; ARE
            </span>
            <span className='flex items-center gap-1.5'>
              <span
                className='h-1.5 w-1.5 rounded-full bg-[#ED8008]'
                aria-hidden='true'
              />
              Trusted by architecture students
            </span>
          </div>
        </section>

        {/* ────────────────────── PARTNER LOGOS ────────────────────── */}
        <LogoMarquee />

        {/* ────────────────────── BENTO FEATURE GRID ────────────────────── */}
        <section
          id='features'
          aria-labelledby='features-heading'
          className='px-6 py-6'
        >
          <div className='mx-auto max-w-[1200px]'>
            <h2 id='features-heading' className='sr-only'>
              Features
            </h2>

            {/* Top row: 3 cols, side cards span 2 rows */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2'>
              {/* REVIEW MODE — dark, tall */}
              <div className='landing-reveal landing-delay-1 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 text-white transition-transform duration-150 hover:-translate-y-0.5 md:col-start-1 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='text-[11px] font-medium uppercase tracking-[0.2em] text-white/40'>
                      [ {siteConfig.name} ]
                    </span>
                    <Starburst className='h-5 w-5 text-[#ED8008]' />
                  </div>
                  <h3 className='mt-14 text-[28px] font-semibold leading-tight tracking-tight'>
                    Review Mode
                  </h3>
                  <p
                    className={`${serif.className} mt-2 text-[20px] italic leading-snug text-white/60`}
                  >
                    Doomscroll your way
                    <br />
                    to mastery.
                  </p>
                </div>
                <div className='mt-8 flex items-end justify-between'>
                  <div className='flex flex-wrap gap-2'>
                    <Pill dark>Active Recall</Pill>
                    <Pill dark>Stress-Free</Pill>
                  </div>
                  <CircleArrow dark />
                </div>
              </div>

              {/* STAT: 84% — light */}
              <div className='landing-reveal landing-delay-2 flex flex-col justify-between rounded-2xl border border-[#1D1D1F]/[0.06] bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-1'>
                <Starburst className='h-5 w-5 text-[#ED8008]' />
                <div className='mt-8'>
                  <span className='text-[72px] font-semibold leading-none tracking-tight text-[#1D1D1F]'>
                    84%
                  </span>
                  <p className='mt-3 max-w-[200px] text-[13px] leading-relaxed text-[#86868B]'>
                    of exam takers fail — but data-driven study can increase
                    pass rates by 30%.
                  </p>
                </div>
              </div>

              {/* SESSIONS MODE — dark, tall */}
              <div className='landing-reveal landing-delay-3 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 text-white transition-transform duration-150 hover:-translate-y-0.5 md:col-start-3 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='text-[11px] font-medium uppercase tracking-[0.2em] text-white/40'>
                      [ {siteConfig.name} ]
                    </span>
                    <CircleArrow dark />
                  </div>
                  <h3 className='mt-14 text-[28px] font-semibold leading-tight tracking-tight'>
                    Sessions Mode
                  </h3>
                  <p
                    className={`${serif.className} mt-2 text-[20px] italic leading-snug text-white/60`}
                  >
                    Every answer tracked.
                    <br />
                    Every weakness found.
                  </p>
                </div>
                <div className='mt-8'>
                  <p className='text-[13px] leading-relaxed text-white/40'>
                    Timed quizzes with full analytics. Track your performance
                    across domains, flag weak areas, and watch your readiness
                    score climb.
                  </p>
                  <div className='mt-4 flex gap-2'>
                    <Pill dark>Tracked</Pill>
                    <Pill dark>AI-Adaptive</Pill>
                  </div>
                </div>
              </div>

              {/* QUOTE — light, editorial */}
              <div className='landing-reveal landing-delay-4 flex flex-col justify-between rounded-2xl border border-[#1D1D1F]/[0.06] bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-2'>
                <p
                  className={`${serif.className} text-[20px] italic leading-snug text-[#1D1D1F]`}
                >
                  Great study tools aren&apos;t just functional — they&apos;re
                  intentional, adaptive, and built for{' '}
                  <span className='relative inline-block'>
                    impact.
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
                </p>
                <div className='mt-6 flex justify-end'>
                  <CircleArrow />
                </div>
              </div>
            </div>

            {/* Bottom row: 3 equal columns */}
            <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
              {/* 3D LIBRARY — amber */}
              <div className='landing-reveal landing-delay-5 flex flex-col justify-between rounded-2xl bg-[#ED8008] p-7 text-white transition-transform duration-150 hover:-translate-y-0.5'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-[22px] font-semibold leading-tight tracking-tight'>
                    3D Library
                  </h3>
                  <Starburst className='h-5 w-5 text-white/60' />
                </div>
                <div className='mt-16'>
                  <p
                    className={`${serif.className} text-[17px] italic leading-snug text-white/80`}
                  >
                    Visual learning,
                    <br />
                    built different.
                  </p>
                  <div className='mt-4 flex items-center justify-between'>
                    <Pill dark>3D Models</Pill>
                    <CircleArrow dark />
                  </div>
                </div>
              </div>

              {/* STAT: 2,400+ questions */}
              <div className='landing-reveal landing-delay-5 flex flex-col justify-between rounded-2xl border border-[#1D1D1F]/[0.06] bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5'>
                <div className='flex items-center justify-between'>
                  <Starburst className='h-4 w-4 text-[#ED8008]' />
                  <CircleArrow />
                </div>
                <div className='mt-8'>
                  <span className='text-[48px] font-semibold leading-none tracking-tight text-[#1D1D1F]'>
                    2,400+
                  </span>
                  <p className='mt-2 text-[13px] text-[#86868B]'>
                    questions across architecture
                    <br />
                    exam domains
                  </p>
                </div>
              </div>

              {/* AI-ADAPTIVE — dark */}
              <div className='landing-reveal landing-delay-6 flex flex-col justify-between rounded-2xl bg-[#1D1D1F] p-7 text-white transition-transform duration-150 hover:-translate-y-0.5'>
                <span className='text-[11px] font-medium uppercase tracking-[0.2em] text-white/40'>
                  About Us
                </span>
                <div className='mt-10'>
                  <h3 className='text-[22px] font-semibold leading-tight tracking-tight'>
                    AI-Adaptive
                    <br />
                    Learning
                  </h3>
                  <p className='mt-3 text-[13px] leading-relaxed text-white/50'>
                    Item Response Theory adjusts question difficulty to your
                    exact ability level. Every question is the right question.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────── HOW IT WORKS ────────────────────── */}
        <section
          id='how-it-works'
          aria-labelledby='how-it-works-heading'
          className='mt-14 border-t border-[#1D1D1F]/[0.06] bg-[#1D1D1F] px-6 py-24 text-white'
        >
          <div className='mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <Starburst className='h-4 w-4 text-[#ED8008]' />
              <h2
                id='how-it-works-heading'
                className='text-[12px] font-medium uppercase tracking-[0.15em] text-white/40'
              >
                How It Works
              </h2>
            </div>

            <div className='mt-16 grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-12'>
              {[
                {
                  num: '01',
                  title: 'Choose your mode',
                  desc: 'Review for low-pressure study, Sessions for tracked quizzes with full analytics.',
                },
                {
                  num: '02',
                  title: 'Answer questions',
                  desc: 'AI adapts difficulty in real-time. Spaced repetition schedules reviews at the perfect interval.',
                },
                {
                  num: '03',
                  title: 'Master the material',
                  desc: 'Watch your readiness score climb. Domain mastery radar shows exactly where you stand.',
                },
              ].map(({ num, title, desc }) => (
                <div key={num}>
                  <span
                    className='text-[48px] font-semibold leading-none tracking-tight text-white/[0.08]'
                    aria-hidden='true'
                  >
                    {num}
                  </span>
                  <h3 className='mt-4 text-[20px] font-semibold tracking-tight'>
                    {title}
                  </h3>
                  <p className='mt-3 text-[14px] leading-relaxed text-white/50'>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────── PHILOSOPHY ────────────────────── */}
        <section aria-label='Design philosophy' className='px-6 py-24'>
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
        <section aria-labelledby='testimonials-heading' className='px-6 pb-24'>
          <div className='mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <Starburst className='h-4 w-4 text-[#ED8008]' />
              <h2
                id='testimonials-heading'
                className='text-[12px] font-medium uppercase tracking-[0.15em] text-[#86868B]'
              >
                What Students Say
              </h2>
            </div>
            <TestimonialShowcase />
          </div>
        </section>

        {/* ────────────────────── FINAL CTA ────────────────────── */}
        <section aria-label='Get started' className='px-6 pb-24'>
          <div className='mx-auto max-w-[1200px] rounded-2xl bg-[#1D1D1F] px-8 py-20 text-center text-white'>
            <h2 className='text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight'>
              Ready to pass your board exam?
            </h2>
            <p
              className={`${serif.className} mt-3 text-[17px] italic text-white/50`}
            >
              {isLoggedIn
                ? 'Head to your dashboard to continue studying.'
                : 'Free to start. No credit card required.'}
            </p>
            <Link
              href={ctaHref}
              className='mt-10 inline-flex rounded-full bg-[#ED8008] px-8 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED8008] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D1D1F]'
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Create Free Account'}
            </Link>
          </div>
        </section>
      </main>

      {/* ────────────────────── FOOTER ────────────────────── */}
      <MarketingFooter />
    </div>
  )
}
