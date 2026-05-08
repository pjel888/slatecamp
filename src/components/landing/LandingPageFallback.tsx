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

export function LandingPageFallback() {
  return (
    <div id='top' className='min-h-screen bg-page-bg'>
      <MarketingNav activeRoute='/' logoScrollsToTop isLoggedIn={false} showSecondaryNav={false} fixed={false} />
      <main>
        <HeroSection
          ctaHref={ROUTES.auth.register}
          ctaLabel='Open the atlas'
        />
        <SocialProofBar />
        <BentoFeatureGrid />
        <QuestionsSection />
        <ThreeDLabSection />
        <AnalyticsSection />
        <WikiSection />
        <HowItWorksSection />
        <ComparisonSection />
        <FinalCtaSection
          ctaHref={ROUTES.auth.register}
          ctaLabel='Open the atlas'
          isLoggedIn={false}
        />
      </main>
      <MarketingFooter />
    </div>
  )
}
