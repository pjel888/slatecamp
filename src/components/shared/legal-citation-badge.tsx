import { cn } from '@/lib/utils'

type LegalCode = 'PD 1096' | 'RA 9514' | 'BP 344' | 'RA 9266' | 'NSCP' | 'BP 220' | 'PD 957'

interface LegalCitationBadgeProps {
  code: LegalCode
  href?: string
  className?: string
}

const codeConfig: Record<LegalCode, { label: string; bg: string; text: string }> = {
  'PD 1096': {
    label: 'NBCP',
    bg: 'bg-blue-50 dark:bg-blue-500/15',
    text: 'text-blue-800 dark:text-blue-300',
  },
  'RA 9514': {
    label: 'Fire Code',
    bg: 'bg-red-50 dark:bg-red-500/15',
    text: 'text-red-800 dark:text-red-300',
  },
  'BP 344': {
    label: 'Accessibility',
    bg: 'bg-purple-50 dark:bg-purple-500/15',
    text: 'text-purple-800 dark:text-purple-300',
  },
  'RA 9266': {
    label: 'Architecture Act',
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  NSCP: {
    label: 'NSCP',
    bg: 'bg-amber-50 dark:bg-amber-500/15',
    text: 'text-amber-800 dark:text-amber-300',
  },
  'BP 220': {
    label: 'BP 220',
    bg: 'bg-cyan-50 dark:bg-cyan-500/15',
    text: 'text-cyan-800 dark:text-cyan-300',
  },
  'PD 957': {
    label: 'PD 957',
    bg: 'bg-orange-50 dark:bg-orange-500/15',
    text: 'text-orange-800 dark:text-orange-300',
  },
}

const baseClasses =
  'font-mono text-[10px] font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-1'

const LegalCitationBadge = ({ code, href, className }: LegalCitationBadgeProps) => {
  const config = codeConfig[code]

  if (href) {
    return (
      <a
        href={href}
        data-slot="legal-citation-badge"
        className={cn(baseClasses, config.bg, config.text, 'hover:underline', className)}
      >
        {config.label}
      </a>
    )
  }

  return (
    <span
      data-slot="legal-citation-badge"
      className={cn(baseClasses, config.bg, config.text, className)}
    >
      {config.label}
    </span>
  )
}

export { LegalCitationBadge }
export type { LegalCitationBadgeProps, LegalCode }
