import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { siteConfig } from '@/lib/constants/site'
import { ROUTES } from '@/lib/routes'
import { PricingContent } from './pricing-content'

export const metadata = { title: `Pricing — ${siteConfig.name}` }

export default function PricingPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted">
      <MarketingNav activeRoute={ROUTES.pricing} />
      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full px-6 pt-[5.5rem] pb-4 sm:pt-24 lg:px-8">
          <PricingContent />
        </div>
      </main>
      <MarketingFooter compact />
    </div>
  )
}
