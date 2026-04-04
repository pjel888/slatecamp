import { GridFour, PaintBucket, MapTrifold } from '@phosphor-icons/react/dist/ssr'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { ToolCard } from '@/components/tools/ToolCard'
import { siteConfig } from '@/lib/constants/site'

export const metadata = {
  title: `Free Architecture Tools — ${siteConfig.name}`,
  description:
    'Browser-based calculators for architecture students and professionals. Floor tiles, wall paint, and lot plotter tools built for ALE exam prep.',
  keywords: [
    'architecture tools',
    'floor tile calculator',
    'wall paint calculator',
    'lot plotter',
    'ALE exam prep',
    'architecture licensure exam',
  ],
}

const TOOLS = [
  {
    icon: <GridFour size={22} weight='regular' />,
    title: 'Floor Tiles Calculator',
    description:
      'Calculate tile quantities, cut tiles, and waste percentage for any room.',
    href: '/tools/floor-tiles-calculator',
    tag: 'Estimating',
  },
  {
    icon: <PaintBucket size={22} weight='regular' />,
    title: 'Wall Paint Calculator',
    description:
      'Estimate paintable area, liters needed, and costs for wall surfaces.',
    href: '/tools/wall-paint-calculator',
    tag: 'Estimating',
  },
  {
    icon: <MapTrifold size={22} weight='regular' />,
    title: 'Lot Plotter',
    description:
      'Plot lot boundaries from TCT technical descriptions with bearings and distances.',
    href: '/tools/lot-plotter',
    tag: 'Site Planning',
  },
]

export default function ToolsHubPage() {
  return (
    <div className='min-h-screen bg-muted'>
      <MarketingNav activeRoute='/tools' />
      <main className='px-6 pt-32 pb-24 sm:pt-40'>
        <div className='mx-auto max-w-[1200px]'>
          {/* Hero */}
          <div className='mb-12 max-w-2xl'>
            <h1 className='font-display text-[clamp(2rem,5vw,3rem)] font-semibold text-foreground'>
              Free Architecture Tools
            </h1>
            <p className='mt-4 text-[17px] text-muted-foreground leading-relaxed'>
              Browser-based calculators for architecture students and professionals.
              Built for ALE exam prep.
            </p>
          </div>

          {/* Tool grid */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
