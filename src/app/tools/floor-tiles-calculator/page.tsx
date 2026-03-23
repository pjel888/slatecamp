import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { siteConfig } from '@/lib/constants/site'
import { FloorTilesPageClient } from './FloorTilesPageClient'

export const metadata: Metadata = {
  title: `Floor Tiles Calculator — Free Tool | ${siteConfig.name}`,
  description:
    'Calculate tile quantities, cut tiles, and waste percentage for any room. Free browser-based tool for architecture students and ALE exam prep.',
  keywords: [
    'tile calculator',
    'floor tiles estimating',
    'ALE exam',
    'architecture tools',
    'tile quantity takeoff',
  ],
}

const FloorTilesCalculatorPage = async () => {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <MarketingNav activeRoute='/tools' />
      <main className='flex-1 pt-20 pb-16 px-6'>
        <FloorTilesPageClient />
      </main>
      <MarketingFooter />
    </div>
  )
}

export default FloorTilesCalculatorPage
