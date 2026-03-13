import type { Metadata } from 'next'
import { hasAuthCookie } from '@/lib/supabase/server'
import { HeroSection } from '@/components/marketing/HeroSection'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { LogoMarquee } from '@/components/marketing/LogoMarquee'
import { TestimonialShowcase } from '@/components/marketing/TestimonialShowcase'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { PhilosophySection } from '@/components/marketing/PhilosophySection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'
import { SocialProofBar } from '@/components/marketing/SocialProofBar'
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ROUTES, siteConfig } from '@/lib/constants'

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
    'SlateCamp',
  ],
  alternates: {
    canonical: '/',
  },
}

export default async function LandingPage() {
  const hasSessionCookie = await hasAuthCookie()
  const isLoggedIn = hasSessionCookie

  const ctaHref = isLoggedIn ? ROUTES.DASHBOARD : ROUTES.REGISTER
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Join the Camp — Free'

  return (
    <div
      id='top'
      className='min-h-screen bg-zinc-100'
    >
      {/* ────────────────────── NAVIGATION ────────────────────── */}
      <MarketingNav activeRoute='/' logoScrollsToTop />

      <main>
        <HeroSection
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          isLoggedIn={isLoggedIn}
        />

        <SocialProofBar />

        <LogoMarquee />

        <BentoFeatureGrid />

        <HowItWorksSection />

        <PhilosophySection />

        {/* ────────────────────── TESTIMONIALS ────────────────────── */}
        <section
          aria-labelledby='testimonials-heading'
          className='border-t border-zinc-200 px-6 py-24'
        >
          <div className='mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <span className='text-amber-600'>
                <Starburst className='h-4 w-4' />
              </span>
              <h2
                id='testimonials-heading'
                className='font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-500'
              >
                What Students Say
              </h2>
            </div>
            <TestimonialShowcase />
          </div>
        </section>

        <FinalCtaSection
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          isLoggedIn={isLoggedIn}
        />
      </main>

      {/* ────────────────────── FOOTER ────────────────────── */}
      <MarketingFooter />
    </div>
  )
}
