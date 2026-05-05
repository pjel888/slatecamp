import Link from 'next/link'
import { Calculator, ArrowRight, Exam } from '@phosphor-icons/react/dist/ssr'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'

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
  <PracticeLayout
    hero={{
      subtitle: 'Design: Development Controls',
      description:
        'Building code calculators and development control references.',
    }}
  >
    <div className='flex flex-col gap-3'>
      {TOOLS.map(({ href, icon: Icon, title, description, tags }) => (
        <Link
          key={href}
          href={href}
          className='group flex items-start gap-4 rounded-md border border-border bg-card p-4 transition-shadow duration-150 hover:shadow-sm'
        >
          <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary-50'>
            <Icon size={18} className='text-primary' weight='duotone' />
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-medium text-foreground'>
                {title}
              </span>
              <ArrowRight
                size={14}
                className='text-muted-foreground shrink-0 transition-transform duration-150 group-hover:translate-x-0.5'
              />
            </div>
            <p className='mt-0.5 text-xs leading-relaxed text-muted-foreground'>
              {description}
            </p>
            <div className='mt-2 flex flex-wrap gap-1'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-background text-muted-foreground border border-border'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  </PracticeLayout>
)

export default AreaCPage
