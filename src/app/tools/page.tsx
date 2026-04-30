import { GridFour, PaintBucket, MapTrifold } from '@phosphor-icons/react/dist/ssr'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { ToolCard } from '@/components/tools/ToolCard'
import { siteConfig } from '@/lib/constants/site'
import { ROUTES } from '@/lib/routes'

export const metadata = {
  title: `Free Architecture Tools — ${siteConfig.name}`,
  description:
    'Browser-based calculators and 3D estimating tools for architecture students and professionals. Floor tiles, wall paint, lot plotting, CHB, drywall, flooring, and paint tools built for LEA exam prep.',
  keywords: [
    'architecture tools',
    'floor tile calculator',
    'wall paint calculator',
    'lot plotter',
    'LEA exam prep',
    'architecture licensure exam',
  ],
}

const TOOLS = [
  {
    icon: <GridFour size={22} weight='regular' />,
    title: 'Floor Tiles Calculator',
    description:
      'Calculate tile quantities, cut tiles, and waste percentage for any room.',
    href: ROUTES.calculators.floorTiles,
    tag: 'Estimating',
  },
  {
    icon: <PaintBucket size={22} weight='regular' />,
    title: 'Wall Paint Calculator',
    description:
      'Estimate paintable area, liters needed, and costs for wall surfaces.',
    href: ROUTES.calculators.wallPaint,
    tag: 'Estimating',
  },
  {
    icon: <MapTrifold size={22} weight='regular' />,
    title: 'Lot Plotter',
    description:
      'Plot lot boundaries from TCT technical descriptions with bearings and distances.',
    href: ROUTES.calculators.lotPlotter,
    tag: 'Site Planning',
  },
  {
    icon: <GridFour size={22} weight='regular' />,
    title: 'Tile Layout Visualizer',
    description: 'Estimate tile layouts with a 3D pattern preview and waste calculation.',
    href: ROUTES.calculators.flooring,
    tag: '3D Estimating',
  },
  {
    icon: <PaintBucket size={22} weight='regular' />,
    title: 'Paint Visualizer',
    description: 'Calculate paint for walls and ceilings with a 3D room preview.',
    href: ROUTES.calculators.paint,
    tag: '3D Estimating',
  },
  {
    icon: <GridFour size={22} weight='regular' />,
    title: 'Drywall Partition Estimator',
    description: 'Estimate boards, studs, and tracks for drywall partitions.',
    href: ROUTES.calculators.drywall,
    tag: '3D Estimating',
  },
  {
    icon: <GridFour size={22} weight='regular' />,
    title: 'CHB Wall Builder',
    description: 'Estimate hollow blocks, mortar, cement, sand, and rebar.',
    href: ROUTES.calculators.chb,
    tag: '3D Estimating',
  },
]

export default function ToolsHubPage() {
  return (
    <div className='min-h-screen bg-muted'>
      <MarketingNav activeRoute={ROUTES.calculators.root} />
      <main className='px-6 pt-32 pb-24 sm:pt-40'>
        <div className='mx-auto max-w-[1200px]'>
          {/* Hero */}
          <div className='mb-12 max-w-2xl'>
            <h1 className='font-display text-[clamp(2rem,5vw,3rem)] font-semibold text-foreground'>
              Free Architecture Tools
            </h1>
            <p className='mt-4 text-[17px] text-muted-foreground leading-relaxed'>
              Browser-based calculators and 3D estimating tools for architecture students and professionals.
              Built for LEA exam prep.
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
