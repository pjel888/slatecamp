import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { siteConfig } from '@/lib/constants/site'
import { WallPaintPageClient } from './WallPaintPageClient'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = {
  title: `Wall Paint Calculator — Free Tool | ${siteConfig.name}`,
  description:
    'Estimate paintable wall area, liters of paint needed, and account for doors and windows. Free tool for architecture students and LEA exam prep.',
  keywords: [
    'paint calculator',
    'wall paint estimating',
    'LEA exam',
    'architecture tools',
    'paint coverage calculator',
  ],
}

const WallPaintCalculatorPage = async () => {
  return (
    <div className='min-h-screen bg-background'>
      <MarketingNav activeRoute={ROUTES.calculators.root} />
      <main className='mx-auto max-w-[1200px] px-6 pt-24 pb-16'>
        <WallPaintPageClient />
      </main>
      <MarketingFooter />
    </div>
  )
}

export default WallPaintCalculatorPage
