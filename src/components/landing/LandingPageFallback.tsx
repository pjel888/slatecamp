import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { CampLandingPage } from '@/components/landing/CampLandingPage'
import { ROUTES } from '@/lib/constants'

export function LandingPageFallback() {
  return (
    <div id='top' className='min-h-screen bg-page-bg'>
      <MarketingNav activeRoute='/' logoScrollsToTop isLoggedIn={false} />
      <main>
        <CampLandingPage
          ctaHref={ROUTES.auth.register}
          ctaLabel='Start Learning'
          isLoggedIn={false}
        />
      </main>
      <MarketingFooter />
    </div>
  )
}
