// src/app/calculators/page.tsx
// Suite index page — Server Component. Renders tool card grid.
import Link from 'next/link'

const TOOLS = [
  {
    slug: 'flooring',
    label: 'FLOORING',
    title: 'Tile Layout Visualizer',
    subtitle: 'Estimate tiles with 3D pattern preview',
    ready: true,
  },
  {
    slug: 'paint',
    label: 'PAINT',
    title: 'Paint Visualizer',
    subtitle: 'Calculate paint for walls and ceilings',
    ready: true,
  },
  {
    slug: 'drywall',
    label: 'DRYWALL',
    title: 'Partition Estimator',
    subtitle: 'Studs, boards, and tracks in one view',
    ready: true,
  },
  {
    slug: 'chb',
    label: 'CHB WALL',
    title: 'CHB Wall Builder',
    subtitle: 'Hollow block, mortar, cement, and rebar estimation',
    ready: true,
  },
  {
    slug: 'plaster',
    label: 'PLASTER',
    title: 'Plastering Calculator',
    subtitle: 'Skim coat and plaster estimation',
    ready: false,
  },
] as const

export default function CalculatorsIndexPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        Estimation Tools
      </p>
      <h1 className="mt-1 font-sans text-2xl font-semibold text-foreground">
        3D Calculator Suite
      </h1>
      <p className="mt-1 font-sans text-sm text-muted-foreground">
        Free material estimation with interactive 3D preview
      </p>

      {/* Tool cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <div
            key={tool.slug}
            className={`rounded-md border border-border bg-card p-4 ${
              tool.ready
                ? 'border-l-4 border-l-primary'
                : 'opacity-60'
            }`}
          >
            <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
              {tool.label}
            </p>
            <h3 className="mt-1 font-sans text-sm font-medium text-foreground">
              {tool.title}
            </h3>
            <p className="mt-0.5 font-sans text-xs text-muted-foreground">
              {tool.subtitle}
            </p>
            {tool.ready ? (
              <Link
                href={`/calculators/${tool.slug}`}
                className="mt-3 inline-block font-sans text-xs text-primary hover:underline"
              >
                Start estimating &rarr;
              </Link>
            ) : (
              <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Coming soon
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ALE CTA */}
      <div className="mt-8 rounded-md border border-border border-l-4 border-l-camp-orange bg-card p-4">
        <p className="font-sans text-sm text-foreground">
          These calculations are tested in the ALE.
        </p>
        <p className="mt-0.5 font-sans text-xs text-muted-foreground">
          SlateCamp helps you master material estimation for the Architecture
          Licensure Examination.
        </p>
        <Link
          href="/pricing"
          className="mt-2 inline-block font-sans text-xs text-camp-orange hover:underline"
        >
          Learn more &rarr;
        </Link>
      </div>
    </main>
  )
}
