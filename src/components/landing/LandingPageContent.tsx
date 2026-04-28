import { getUserIfPresent } from '@/lib/supabase/server'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { CampLandingPage } from '@/components/landing/CampLandingPage'
import { ROUTES } from '@/lib/constants'

export async function LandingPageContent() {
  const { data: { user } } = await getUserIfPresent()
  const isLoggedIn = !!user

  const ctaHref = isLoggedIn ? ROUTES.dashboard.root : ROUTES.auth.register
  const ctaLabel = isLoggedIn ? 'Go to Dashboard' : 'Start Learning'

  return (
    <div id='top' className='min-h-screen bg-page-bg'>
      {/* ────────────────────── NAVIGATION ────────────────────── */}
      <MarketingNav activeRoute='/' logoScrollsToTop isLoggedIn={isLoggedIn} />

      <main>
        <CampLandingPage
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
