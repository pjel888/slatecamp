import { Info, Warning, Lightbulb, BookOpen } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

type CalloutVariant = 'note' | 'warning' | 'tip' | 'example'

const VARIANTS: Record<
  CalloutVariant,
  { icon: typeof Info; label: string; border: string; bg: string; iconColor: string; labelColor: string }
> = {
  note: {
    icon: Info,
    label: 'Note',
    border: 'border-[#3B82C8]/30',
    bg: 'bg-[#3B82C8]/5',
    iconColor: 'text-[#3B82C8]',
    labelColor: 'text-[#3B82C8]',
  },
  warning: {
    icon: Warning,
    label: 'Warning',
    border: 'border-[#D4951A]/30',
    bg: 'bg-[#FEF8ED]',
    iconColor: 'text-[#D4951A]',
    labelColor: 'text-[#D4951A]',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    border: 'border-[#2D9F6F]/30',
    bg: 'bg-[#EDFAF4]',
    iconColor: 'text-[#2D9F6F]',
    labelColor: 'text-[#2D9F6F]',
  },
  example: {
    icon: BookOpen,
    label: 'Example',
    border: 'border-[#1B3FC4]/20',
    bg: 'bg-[#EEF2FC]',
    iconColor: 'text-[#1B3FC4]',
    labelColor: 'text-[#1B3FC4]',
  },
}

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}

export function Callout({ variant = 'note', title, children }: CalloutProps) {
  const config = VARIANTS[variant]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'not-prose block my-6 rounded-md border-l-4 px-4 py-3',
        config.border,
        config.bg,
      )}
      role="note"
    >
      <span className="flex items-center gap-2 mb-1.5">
        <Icon size={16} weight="bold" className={config.iconColor} />
        <span className={cn('text-xs font-semibold uppercase tracking-wider', config.labelColor)}>
          {title || config.label}
        </span>
      </span>
      <span className="block text-sm text-zinc-700 leading-relaxed [&>p]:m-0 [&>p+p]:mt-2">
        {children}
      </span>
    </span>
  )
}

// Individual exports for MDX component mapping
export function Note({ children, title }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="note" title={title}>{children}</Callout>
}

export function Warn({ children, title }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="warning" title={title}>{children}</Callout>
}

export function Tip({ children, title }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="tip" title={title}>{children}</Callout>
}

export function Example({ children, title }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="example" title={title}>{children}</Callout>
}
