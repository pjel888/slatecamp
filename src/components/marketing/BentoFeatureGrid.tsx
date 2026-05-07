import Link from 'next/link'
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ROUTES } from '@/lib/constants'

const PILLARS = [
  {
    label: 'Knowledge Resources',
    headline: 'Stop hunting through scattered PDFs.',
    body: 'Use source-backed explainers, code guides, field notes, and visual references built around architecture school, Philippine codes, and Licensure Examination for Architects review.',
    bullets: ['Code explainers for common review topics', 'Field-guide pages for fast orientation', 'Source-linked references where available'],
    cta: 'Browse free knowledge previews',
    href: '#knowledge-resources',
    tone: 'amber',
  },
  {
    label: 'Quizzes',
    headline: 'Know what stuck after lecture.',
    body: 'Practice with diagnostics, drills, simulations, and explanations that turn missed answers into the next topic to repair.',
    bullets: ['Free Readiness Score entry point', 'Weak-topic map after practice', 'Explanations tied back to resources'],
    cta: 'Get your free readiness score',
    href: ROUTES.auth.register,
    tone: 'cobalt',
  },
  {
    label: '3D Lab',
    headline: 'See spatial rules, not just numbers.',
    body: 'Explore interactive 3D examples for code, space, circulation, accessibility, and building concepts that are hard to learn from text alone.',
    bullets: ['Interactive examples for visual learners', 'Code and spatial concepts made visible', 'Useful for school, review, and practice'],
    cta: 'Preview the 3D Lab',
    href: '#three-d-lab-preview',
    tone: 'black',
  },
  {
    label: 'Free Tools',
    headline: 'Practical calculators, free from day one.',
    body: 'Use calculators and utilities for quick checks and study context: paint, tiles, CHB, drywall, lot/buildability, occupancy, egress, and more as they are released.',
    bullets: ['Useful before and after board review', 'Strong practical study surface', 'Clear educational boundaries'],
    cta: 'Open free tools',
    href: ROUTES.calculators.root,
    tone: 'green',
  },
] as const

const toneClass = {
  amber: 'bg-camp-amber text-camp-black border-warning/30',
  cobalt: 'bg-camp-cobalt text-white border-camp-cobalt',
  black: 'bg-camp-black text-white border-camp-black',
  green: 'bg-camp-green text-white border-camp-green',
} as const

export const BentoFeatureGrid = () => (
  <section id='features' aria-labelledby='platform-pillars-heading' className='relative scroll-mt-24 px-6 py-16'>
    <div className='relative z-10 mx-auto max-w-[1200px]'>
      <div className='max-w-3xl'>
        <div className='flex items-center gap-3'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold tracking-[0.2em] uppercase text-text-2'>
            What you get
          </span>
        </div>
        <h2
          id='platform-pillars-heading'
          className='mt-4 font-[family-name:var(--font-syne)] text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[0.98] text-camp-black'
        >
          A field guide, quiz buddy, 3D lab, and toolbelt in one place.
        </h2>
        <p className='mt-4 max-w-2xl text-[15px] leading-relaxed text-text-2'>
          SlateCamp is built for the moment after a lecture, mock exam, or study session when you need to know what stayed with you — and what to fix next.
        </p>
      </div>

      <div className='mt-10 grid grid-cols-1 gap-[12px] md:grid-cols-2'>
        {PILLARS.map((pillar) => (
          <article
            key={pillar.label}
            className={`group relative overflow-hidden rounded-[22px] border p-7 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 ${toneClass[pillar.tone]}`}
          >
            <div className='absolute right-[-32px] top-[-32px] h-32 w-32 rounded-full bg-white/15 blur-2xl' aria-hidden='true' />
            <div className='relative z-10'>
              <div className='flex items-center justify-between gap-4'>
                <span className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold tracking-[0.18em] uppercase opacity-60'>
                  {pillar.label}
                </span>
                <Starburst className='h-3 w-3 opacity-70' />
              </div>
              <h3 className='mt-8 max-w-[420px] font-[family-name:var(--font-syne)] text-[clamp(22px,2.6vw,32px)] font-extrabold leading-[1.05]'>
                {pillar.headline}
              </h3>
              <p className='mt-3 max-w-[520px] text-[13px] leading-relaxed opacity-70'>{pillar.body}</p>
              <ul className='mt-6 grid gap-2'>
                {pillar.bullets.map((bullet) => (
                  <li key={bullet} className='flex items-start gap-2 text-[12px] leading-relaxed opacity-85'>
                    <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70' aria-hidden='true' />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href={pillar.href}
                className='mt-7 inline-flex rounded-full border border-current/20 bg-white/15 px-4 py-2 text-[12px] font-bold transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30'
              >
                {pillar.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)
