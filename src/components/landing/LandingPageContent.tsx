import { getUserIfPresent } from '@/lib/supabase/server'
import { HeroSection } from '@/components/marketing/HeroSection'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { ComparisonSection } from '@/components/marketing/ComparisonSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'
import { SocialProofBar } from '@/components/marketing/SocialProofBar'
import { QuestionsSection } from '@/components/marketing/QuestionsSection'
import { ThreeDLabSection } from '@/components/marketing/ThreeDLabSection'
import { AnalyticsSection } from '@/components/marketing/AnalyticsSection'
import { WikiSection } from '@/components/marketing/WikiSection'
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

        <BentoFeatureGrid />

        {/* ── Feature Sections ── */}
        <QuestionsSection />
        <ThreeDLabSection />
        <AnalyticsSection />
        <WikiSection />

        <HowItWorksSection />

        <ComparisonSection />

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
