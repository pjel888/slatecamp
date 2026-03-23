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
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ROUTES } from '@/lib/constants'

export function LandingPageFallback() {
  return (
    <div id='top' className='min-h-screen bg-[#F5F5F5]'>
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
          className='border-t border-[#E5E7EB] px-6 py-24'
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
