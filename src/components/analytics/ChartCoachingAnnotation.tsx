'use client'
import { Lightbulb } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  variant?: 'insight' | 'warning' | 'success'
}

const STYLES = {
  insight: 'bg-[#EEF2FC] text-[#1535A8]',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-green-50 text-green-700',
}

export function ChartCoachingAnnotation({ text, variant = 'insight' }: Props) {
  return (
    <div className={cn('flex items-start gap-1.5 rounded-md px-2 py-1.5 mt-1', STYLES[variant])}>
      <SCIcon icon={Lightbulb} size="xs" className="mt-0.5 shrink-0" />
      <p className="text-xs leading-snug">{text}</p>
    </div>
  )
}
