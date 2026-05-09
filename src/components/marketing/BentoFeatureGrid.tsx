import Link from 'next/link'
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ROUTES } from '@/lib/constants'

const PATHS = [
  {
    index: 'A / Find',
    label: 'Knowledge resources',
    title: 'Open the topic before it becomes another loose note.',
    body: 'Use architecture guides, related concepts, and source notes where verified so a subject has a place in the map.',
    href: '#knowledge-resources',
    cta: 'See knowledge resources',
  },
  {
    index: 'B / Check',
    label: 'Practice paths',
    title: 'Check what stayed without turning review into panic.',
    body: 'Use diagnostics, drills, and simulations as separate practice paths. Missed-topic mappings appear where the product can support them honestly.',
    href: ROUTES.auth.register,
    cta: 'Start free',
  },
  {
    index: 'C / See',
    label: 'Visual tools',
    title: 'See spatial rules when text is not enough.',
    body: 'Use available visual examples and lab modules where account access supports it. The goal is comprehension, not spectacle.',
    href: '#three-d-lab-preview',
    cta: 'Preview visual tools',
  },
  {
    index: 'D / Revisit',
    label: 'Weak-topic signals',
    title: 'Turn uncertainty into the next calmer pass.',
    body: 'Use study signals to decide what to revisit next beside your books, notes, mentors, and review materials.',
    href: '#how-it-works',
    cta: 'Follow the loop',
  },
] as const

export const BentoFeatureGrid = () => (
  <section id='features' aria-labelledby='platform-paths-heading' className='relative scroll-mt-24 bg-page-bg px-6 py-18'>
    <div className='relative z-10 mx-auto max-w-[1200px]'>
      <div className='grid gap-8 border-y border-border-design py-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14'>
        <div>
          <div className='flex items-center gap-3'>
            <Starburst className='h-3 w-3 text-camp-amber' />
            <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold uppercase tracking-[0.2em] text-text-2'>
              Product paths
            </span>
          </div>
          <h2
            id='platform-paths-heading'
            className='mt-4 font-[family-name:var(--font-syne)] text-[clamp(2rem,4vw,3.35rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-camp-black'
          >
            Four ways back to a clearer architecture map.
          </h2>
          <p className='mt-4 max-w-xl text-[15px] leading-relaxed text-text-2'>
            SlateCamp is supplementary support: a field guide, practice surface, visual toolbelt, and weak-topic map for the moments when review starts to feel scattered.
          </p>
        </div>

        <div className='divide-y divide-border-design border-t border-border-design lg:border-t-0'>
          {PATHS.map((path) => (
            <article key={path.index} className='grid gap-4 py-6 sm:grid-cols-[122px_1fr_auto] sm:items-start'>
              <div>
                <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold uppercase tracking-[0.18em] text-camp-cobalt'>
                  {path.index}
                </span>
                <p className='mt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-text-2'>{path.label}</p>
              </div>
              <div>
                <h3 className='text-[20px] font-extrabold leading-tight text-camp-black'>{path.title}</h3>
                <p className='mt-2 max-w-2xl text-[13px] leading-relaxed text-text-2'>{path.body}</p>
              </div>
              <Link
                href={path.href}
                className='inline-flex min-h-10 items-center justify-center rounded-sm border border-border-design px-4 py-2 text-[12px] font-bold text-camp-black transition hover:border-camp-cobalt/35 hover:text-camp-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt/35 sm:justify-start'
              >
                {path.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
)
