import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { siteConfig } from '@/lib/constants/site'
import { LotPlotterClient } from './LotPlotterClient'

export const metadata: Metadata = {
  title: `Lot Plotter — TCT Technical Description Tool | ${siteConfig.name}`,
  description:
    'Plot lot boundaries from Transfer Certificate of Title (TCT) metes-and-bounds technical descriptions. Free tool for architecture students and LEA exam prep.',
  keywords: [
    'lot plotter',
    'TCT technical description',
    'metes and bounds',
    'LEA exam',
    'site planning',
    'survey plotter',
  ],
}

export default async function LotPlotterPage() {
  return (
    <div className='min-h-screen bg-background'>
      <MarketingNav activeRoute='/tools' />
      <main className='px-6 pt-32 pb-24 sm:pt-40'>
        <LotPlotterClient />
      </main>
      <MarketingFooter />
    </div>
  )
}
