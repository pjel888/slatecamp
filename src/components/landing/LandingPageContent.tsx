import { getUserIfPresent } from '@/lib/supabase/server'
import { HeroSection } from '@/components/marketing/HeroSection'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { ComparisonSection } from '@/components/marketing/ComparisonSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'
import { QuestionsSection } from '@/components/marketing/QuestionsSection'
import { ThreeDLabSection } from '@/components/marketing/ThreeDLabSection'
import { AnalyticsSection } from '@/components/marketing/AnalyticsSection'
import { WikiSection } from '@/components/marketing/WikiSection'
import { ScrollWipeContainer } from '@/components/motion/ScrollWipeContainer'
import { ROUTES } from '@/lib/constants'

export async function LandingPageContent() {
  const { data: { user } } = await getUserIfPresent()
  const isLoggedIn = !!user

  const ctaHref = isLoggedIn ? ROUTES.dashboard.wiki : ROUTES.auth.register
  const ctaLabel = 'Open the atlas'

  return (
    <div id='top' className='min-h-screen bg-page-bg'>
      <MarketingNav activeRoute='/' logoScrollsToTop isLoggedIn={isLoggedIn} />

      <main>
        <div className='relative z-10 shadow-[0_12px_48px_rgba(15,23,42,0.14)]'>
          <HeroSection
            ctaHref={ctaHref}
            ctaLabel={ctaLabel}
          />
        </div>

        <ScrollWipeContainer>
          <BentoFeatureGrid />
          <QuestionsSection />
        </ScrollWipeContainer>
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

      <MarketingFooter />
    </div>
  )
}
