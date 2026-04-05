import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'

const COMPARISON_ROWS: readonly {
  dimension: string
  traditional: string
  slatecamp: string
  highlight?: boolean
}[] = [
  {
    dimension: 'Cost',
    traditional: '₱15,000 – ₱30,000',
    slatecamp: 'Free forever · Premium from ₱299/month',
  },
  {
    dimension: 'Schedule',
    traditional: 'Fixed classroom hours',
    slatecamp: 'Study on your schedule, on any device',
  },
  {
    dimension: 'Performance feedback',
    traditional: 'General scores on mock exams',
    slatecamp: 'Live Readiness Score by subject, updated every session',
  },
  {
    dimension: 'Content',
    traditional: 'Textbooks, lectures, handouts',
    slatecamp: 'Verified questions, 3D Lab, code-cited explanations',
  },
  {
    dimension: 'Personalization',
    traditional: 'Same syllabus for every student',
    slatecamp: 'Adapts to your specific weak areas',
  },
  {
    dimension: 'Availability',
    traditional: 'Metro Manila-heavy',
    slatecamp: 'Anywhere. Including your commute.',
  },
  {
    dimension: 'Readiness signal',
    traditional: '"Keep studying."',
    slatecamp: '"You\'re at 74%. Here\'s exactly what to fix."',
    highlight: true,
  },
] as const

export const ComparisonSection = () => (
  <section
    aria-labelledby='comparison-heading'
    className='border-t border-border-design px-6 py-24'
  >
    <div className='mx-auto max-w-[1200px]'>
      <ScrollReveal delay={0}>
        <div className='flex items-center gap-3'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <span className='font-mono text-[11px] tracking-[0.2em] uppercase text-text-2'>
            Two ways to prepare
          </span>
        </div>

        <h2
          id='comparison-heading'
          className='mt-4 font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-ink'
        >
          The old way. The better way.
        </h2>

        <p className='mt-3 max-w-lg text-[15px] leading-relaxed text-text-2'>
          Traditional review centers work. But there&apos;s one thing they
          can&apos;t tell you that SlateCamp can: exactly where your gaps are,
          right now, before exam day.
        </p>
      </ScrollReveal>

      {/* Table — desktop */}
      <div className='mt-10 hidden overflow-hidden rounded-md border border-border-design md:block'>
        {/* Header row */}
        <div className='grid grid-cols-[1fr_1fr_1fr] border-b border-border-design bg-white'>
          <div className='px-5 py-3 text-[12px] font-semibold text-text-2' />
          <div className='border-l border-border-design px-5 py-3 text-[12px] font-semibold text-text-2'>
            Traditional Review Center
          </div>
          <div className='border-l border-border-design bg-primary-50 px-5 py-3 text-[12px] font-semibold text-camp-cobalt'>
            SlateCamp
          </div>
        </div>
        {/* Data rows */}
        <StaggerParent>
          {COMPARISON_ROWS.map((row) => (
            <StaggerItem key={row.dimension}>
              <div
                className={`grid grid-cols-[1fr_1fr_1fr] border-b border-border-design last:border-0 ${
                  row.highlight ? 'bg-white' : ''
                }`}
              >
                <div className='px-5 py-3.5 text-[13px] font-medium text-ink'>
                  {row.dimension}
                </div>
                <div className='border-l border-border-design px-5 py-3.5 text-[13px] text-text-2'>
                  {row.traditional}
                </div>
                <div
                  className={`border-l border-border-design px-5 py-3.5 text-[13px] ${
                    row.highlight
                      ? 'font-medium text-camp-cobalt'
                      : 'text-text-2'
                  }`}
                >
                  {row.slatecamp}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerParent>
      </div>

      {/* Mobile: stacked cards */}
      <div className='mt-6 md:hidden'>
        <StaggerParent className='space-y-3'>
          {COMPARISON_ROWS.map((row) => (
            <StaggerItem key={row.dimension}>
              <div className='rounded-md border border-border-design p-4'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  {row.dimension}
                </p>
                <div className='mt-2 flex gap-4'>
                  <div className='flex-1'>
                    <p className='text-[11px] font-medium text-gray-400'>
                      Traditional
                    </p>
                    <p className='mt-0.5 text-[12px] text-text-2'>
                      {row.traditional}
                    </p>
                  </div>
                  <div className='flex-1'>
                    <p className='text-[11px] font-medium text-camp-cobalt'>
                      SlateCamp
                    </p>
                    <p
                      className={`mt-0.5 text-[12px] ${
                        row.highlight
                          ? 'font-medium text-camp-cobalt'
                          : 'text-ink'
                      }`}
                    >
                      {row.slatecamp}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerParent>
      </div>

      <p className='mt-6 text-[13px] text-gray-400'>
        SlateCamp isn&apos;t against review centers — many students use both.
        But if you want to know whether you&apos;re ready before exam day,
        SlateCamp is the only way to find out.
      </p>
    </div>
  </section>
)


