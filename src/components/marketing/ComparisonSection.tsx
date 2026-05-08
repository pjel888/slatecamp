import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'

const ATLAS_ROWS = [
  {
    moment: 'When a rule feels scattered',
    whatHappens: 'Start with a field-guide explanation that names the concept, the common confusion, and the next path forward.',
  },
  {
    moment: 'When confidence feels vague',
    whatHappens: 'Use a short check to see whether the topic stayed with you or only felt familiar while reading.',
  },
  {
    moment: 'When space is hard to imagine',
    whatHappens: 'Open a visual or 3D example so dimensions, clearances, and envelopes become easier to reason about.',
  },
  {
    moment: 'When you need a next step',
    whatHappens: 'Move from the weak spot to the related explanation, quiz, tool, or lab instead of rereading at random.',
  },
] as const

export const ComparisonSection = () => (
  <section aria-labelledby='atlas-value-heading' className='border-t border-border-design px-6 py-24'>
    <div className='mx-auto max-w-[1200px]'>
      <ScrollReveal delay={0}>
        <div className='flex items-center gap-3'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-text-2'>
            Personal architecture field guide
          </span>
        </div>

        <h2
          id='atlas-value-heading'
          className='mt-4 max-w-3xl font-[family-name:var(--font-syne)] text-[clamp(1.9rem,3.6vw,3rem)] font-extrabold leading-tight text-ink'
        >
          The value is not more noise. It is a clearer map of what to do next.
        </h2>

        <p className='mt-4 max-w-2xl text-[15px] leading-relaxed text-text-2'>
          SlateCamp is built for architecture learners who already have classes, books, mentors, notes, and deadlines. It gives those inputs a calmer structure: orient, visualize, check, and repair.
        </p>
      </ScrollReveal>

      <div className='mt-10 grid grid-cols-1 gap-3 md:grid-cols-4'>
        <StaggerParent className='contents'>
          {ATLAS_ROWS.map((row) => (
            <StaggerItem key={row.moment}>
              <article className='h-full rounded-[18px] border border-border-design bg-white p-5 shadow-sm'>
                <p className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-camp-cobalt'>
                  {row.moment}
                </p>
                <p className='mt-4 text-[13px] leading-relaxed text-text-2'>{row.whatHappens}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerParent>
      </div>

      <div className='mt-8 rounded-[18px] border border-camp-amber/25 bg-camp-amber/10 p-5'>
        <p className='text-[13px] font-semibold text-camp-black'>Trust boundary</p>
        <p className='mt-2 text-[13px] leading-relaxed text-text-2'>
          SlateCamp is an educational resource platform. Verify current code requirements, exam rules, and project decisions with primary authority documents or a qualified professional.
        </p>
      </div>
    </div>
  </section>
)
