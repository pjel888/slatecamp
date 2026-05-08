import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'

const STEPS = [
  {
    num: '01',
    title: 'Find the confusing topic',
    desc: 'Start from a code guide, quiz miss, 3D preview, or free tool when a topic feels vague.',
  },
  {
    num: '02',
    title: 'Check what stayed with you',
    desc: 'Use a short practice check to separate lucky confidence from topics that are actually stable.',
  },
  {
    num: '03',
    title: 'Repair the gap',
    desc: 'Jump to the explanation, visual guide, or calculator that makes the next study step obvious.',
  },
  {
    num: '04',
    title: 'Return with a plan',
    desc: 'Return to your book, notes, mentor, studio work, or study group knowing what to ask and what to practice.',
  },
] as const

export const HowItWorksSection = () => (
  <section id='how-it-works' aria-labelledby='how-it-works-heading' className='relative scroll-mt-24 border-t border-border-design px-6 py-24'>
    <div className='relative z-10 mx-auto max-w-[1200px]'>
      <ScrollReveal>
        <div className='flex items-center gap-3'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <h2
            id='how-it-works-heading'
            className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-text-2'
          >
            How SlateCamp helps
          </h2>
        </div>
        <p className='mt-4 max-w-2xl font-[family-name:var(--font-syne)] text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold leading-tight text-camp-black'>
          Follow a calmer loop: find the topic, understand the shape, check what stayed, then repair the next gap.
        </p>
      </ScrollReveal>

      <StaggerParent className='mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
        {STEPS.map(({ num, title, desc }) => (
          <StaggerItem key={num}>
            <article className='h-full rounded-[18px] border border-border-design bg-white p-6 shadow-sm'>
              <span className='font-[family-name:var(--font-dm-mono)] text-[40px] font-bold leading-none text-border-design' aria-hidden='true'>
                {num}
              </span>
              <h3 className='mt-4 font-[family-name:var(--font-syne)] text-[19px] font-extrabold text-ink'>
                {title}
              </h3>
              <p className='mt-3 text-[13px] leading-relaxed text-text-2'>{desc}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerParent>
    </div>
  </section>
)
