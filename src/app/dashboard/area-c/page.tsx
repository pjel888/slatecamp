import Link from 'next/link'
import { Calculator, ArrowRight, Exam } from '@phosphor-icons/react/dist/ssr'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

export const metadata = { title: 'Design — Development Controls' }

const TOOLS = [
  {
    href: '/dashboard/area-c/calculator',
    icon: Calculator,
    title: 'Development Controls Calculator',
    description:
      'Compute AMBF, TGFA, PSO, occupant load, parking requirements, egress widths, and setbacks from PD 1096, BP 344, and RA 9514.',
    tags: ['PD 1096', 'BP 344', 'RA 9514'],
  },
  {
    href: '/dashboard/area-c/design-quiz',
    icon: Exam,
    title: 'Design Quiz',
    description:
      'Scenario-based computation questions tied to a shared design brief. Questions build on each other within each scenario.',
    tags: ['PD 1096', 'Computation', 'Scenarios'],
  },
]

const AreaCPage = () => (
  <SharedPageLayout>
    <div className='max-w-3xl mx-auto px-4 py-6 w-full'>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold text-foreground'>
          Design — Development Controls
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Reference tools for Philippine National Building Code calculations
          and development control requirements.
        </p>
      </div>

      <div className='flex flex-col gap-3'>
        {TOOLS.map(({ href, icon: Icon, title, description, tags }) => (
          <Link
            key={href}
            href={href}
            className='group flex items-start gap-4 rounded-md border bg-card p-4 transition-shadow duration-150 hover:shadow-sm'
            style={{ borderColor: '#D4DAE3' }}
          >
            <div
              className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm'
              style={{ background: '#EEF2FC' }}
            >
              <Icon size={18} style={{ color: '#1B3FC4' }} weight='duotone' />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between gap-2'>
                <span className='text-sm font-medium' style={{ color: '#1A2332' }}>
                  {title}
                </span>
                <ArrowRight
                  size={14}
                  style={{ color: '#8896A7' }}
                  className='shrink-0 transition-transform duration-150 group-hover:translate-x-0.5'
                />
              </div>
              <p className='mt-0.5 text-xs leading-relaxed' style={{ color: '#4A5568' }}>
                {description}
              </p>
              <div className='mt-2 flex flex-wrap gap-1'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide'
                    style={{ background: '#F8F7F5', color: '#8896A7', border: '1px solid #D4DAE3' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </SharedPageLayout>
)

export default AreaCPage
