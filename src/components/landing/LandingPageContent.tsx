import { getUserIfPresent } from '@/lib/supabase/server'
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
import { ROUTES } from '@/lib/constants'

export async function LandingPageContent() {
  const { data: { user } } = await getUserIfPresent()
  const isLoggedIn = !!user

  const ctaHref = isLoggedIn ? ROUTES.dashboard.root : ROUTES.auth.register
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Get Your Free Readiness Score'

  return (
    <div id='top' className='min-h-screen bg-page-bg'>
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
          className='border-t border-border px-6 py-24'
        >
          <div className='mx-auto max-w-[1200px]'>
            {/* TODO: evaluate SectionHeader migration — custom Starburst icon + gap layout */}
            <div className='flex items-center gap-3'>
              <span className='text-camp-amber'>
                <Starburst className='h-4 w-4' />
              </span>
              <h2
                id='testimonials-heading'
                className='font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground'
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
