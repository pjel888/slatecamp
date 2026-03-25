'use client'
import { Lightbulb } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  variant?: 'insight' | 'warning' | 'success'
}

const STYLES = {
  insight: 'bg-primary-50 text-primary-700',
  warning: 'bg-[#FEF8ED] text-warning',
  success: 'bg-[#EDFAF4] text-emerald',
}

export function ChartCoachingAnnotation({ text, variant = 'insight' }: Props) {
  return (
    <div className={cn('flex items-start gap-1.5 rounded-md px-2 py-1.5 mt-1', STYLES[variant])}>
      <SCIcon icon={Lightbulb} size="xs" className="mt-0.5 shrink-0" />
      <p className="text-xs leading-snug">{text}</p>
    </div>
  )
}
