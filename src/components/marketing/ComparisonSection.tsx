import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'

const COMPANION_ROWS = [
  {
    moment: 'After lecture',
    whatHappens: 'You check if the topic stayed with you before it fades into vague confidence.',
  },
  {
    moment: 'After mock exams',
    whatHappens: 'You turn wrong answers into patterns instead of treating them as isolated mistakes.',
  },
  {
    moment: 'During self-study',
    whatHappens: 'You choose tonight’s highest-value topic instead of rereading everything at random.',
  },
  {
    moment: 'Before exam day',
    whatHappens: 'You reduce surprise by making weak spots visible while there is still time to repair them.',
  },
] as const

export const ComparisonSection = () => (
  <section aria-labelledby='companion-heading' className='border-t border-border-design px-6 py-24'>
    <div className='mx-auto max-w-[1200px]'>
      <ScrollReveal delay={0}>
        <div className='flex items-center gap-3'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-text-2'>
            Built beside your review system
          </span>
        </div>

        <h2
          id='companion-heading'
          className='mt-4 max-w-3xl font-[family-name:var(--font-syne)] text-[clamp(1.9rem,3.6vw,3rem)] font-extrabold leading-tight text-ink'
        >
          Review centers teach. SlateCamp helps you check what stuck.
        </h2>

        <p className='mt-4 max-w-2xl text-[15px] leading-relaxed text-text-2'>
          Use SlateCamp after lectures, mock exams, and self-study sessions to test retention, repair mistakes, and choose the next topic. It is the always-on companion beside your instructor, mentor, or review center.
        </p>
      </ScrollReveal>

      <div className='mt-10 grid grid-cols-1 gap-3 md:grid-cols-4'>
        <StaggerParent className='contents'>
          {COMPANION_ROWS.map((row) => (
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
        <p className='text-[13px] font-semibold text-camp-black'>Positioning guardrail</p>
        <p className='mt-2 text-[13px] leading-relaxed text-text-2'>
          SlateCamp supports architecture instruction. It does not replace instructors, review centers, official sources, local ordinances, or licensed professional judgment.
        </p>
      </div>
    </div>
  </section>
)
