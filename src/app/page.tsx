import type { Metadata } from 'next'
import { Suspense } from 'react'
import { hasAuthCookie } from '@/lib/supabase/server'
import { HeroSection } from '@/components/marketing/HeroSection'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { LogoMarquee } from '@/components/marketing/LogoMarquee'
import { TestimonialShowcase } from '@/components/marketing/TestimonialShowcase'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { ComparisonSection } from '@/components/marketing/ComparisonSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'
import { SocialProofBar } from '@/components/marketing/SocialProofBar'
import { QuestionsSection } from '@/components/marketing/QuestionsSection'
import { ThreeDLabSection } from '@/components/marketing/ThreeDLabSection'
import { AnalyticsSection } from '@/components/marketing/AnalyticsSection'
import { WikiSection } from '@/components/marketing/WikiSection'
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ROUTES, siteConfig } from '@/lib/constants'

/* ── SEO Metadata ── */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${siteConfig.name} — Know Your ALE Readiness Before Exam Day`,
  description:
    'The only ALE prep platform with a Readiness Score, 3D building code viewer, 2,400+ verified questions, and a complete PD 1096 wiki — built for the Philippine Architecture Licensure Exam.',
  openGraph: {
    title: `${siteConfig.name} — The ALE Readiness Intelligence Platform`,
    description:
      'The only ALE prep platform with a real-time Readiness Score. Know exactly where you stand, what to fix, and when you\'re genuinely ready — before exam day.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Stop Studying Blind. Know Your Score.`,
    description:
      'The only ALE prep platform with a real-time Readiness Score. Know exactly where you stand, what to fix, and when you\'re genuinely ready — before exam day.',
  },
  keywords: [
    'architecture board exam prep',
    'ALE exam prep',
    'ARE exam prep',
    'architecture exam reviewer Philippines',
    'ALE readiness score',
    'architecture quiz app Philippines',
    'ALE 3D building code viewer',
    'PD 1096 reviewer',
    'architecture wiki Philippines',
    'spaced repetition architecture exam',
    'SlateCamp',
  ],
  alternates: {
    canonical: '/',
  },
}

async function LandingPageContent() {
  const hasSessionCookie = await hasAuthCookie()
  const isLoggedIn = hasSessionCookie

  const ctaHref = isLoggedIn ? ROUTES.DASHBOARD : ROUTES.REGISTER
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Join the Camp — Free'

  return (
    <div
      id='top'
      className='min-h-screen bg-[#F2F0EB]'
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

        {/* ── Feature Sections ── */}
        <QuestionsSection />
        <ThreeDLabSection />
        <AnalyticsSection />
        <WikiSection />

        <HowItWorksSection />

        <ComparisonSection />

        {/* ────────────────────── TESTIMONIALS ────────────────────── */}
        <section
          aria-labelledby='testimonials-heading'
          className='border-t border-[#E8E4DC] px-6 py-24'
        >
          <div className='mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <span className='text-[#F5A623]'>
                <Starburst className='h-4 w-4' />
              </span>
              <h2
                id='testimonials-heading'
                className='font-mono text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B]'
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

function LandingPageFallback() {
  return (
    <div id='top' className='min-h-screen bg-[#F2F0EB]'>
      <MarketingNav activeRoute='/' logoScrollsToTop />
      <main>
        <HeroSection
          ctaHref={ROUTES.REGISTER}
          ctaLabel='Join the Camp — Free'
          isLoggedIn={false}
        />
        <SocialProofBar />
        <LogoMarquee />
        <BentoFeatureGrid />
        <HowItWorksSection />
        <ComparisonSection />
        <section
          aria-labelledby='testimonials-heading'
          className='border-t border-[#E8E4DC] px-6 py-24'
        >
          <div className='mx-auto max-w-[1200px]'>
            <div className='flex items-center gap-3'>
              <span className='text-[#F5A623]'>
                <Starburst className='h-4 w-4' />
              </span>
              <h2
                id='testimonials-heading'
                className='font-mono text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B]'
              >
                What Students Say
              </h2>
            </div>
            <TestimonialShowcase />
          </div>
        </section>
        <FinalCtaSection
          ctaHref={ROUTES.REGISTER}
          ctaLabel='Join the Camp — Free'
          isLoggedIn={false}
        />
      </main>
      <MarketingFooter />
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LandingPageFallback />}>
      <LandingPageContent />
    </Suspense>
  )
}
