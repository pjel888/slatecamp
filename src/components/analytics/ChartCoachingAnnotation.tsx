'use client'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  text: string
  variant?: 'insight' | 'warning' | 'success'
}

const STYLES = {
  insight: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  success: 'bg-green-50 text-green-700',
}

export function ChartCoachingAnnotation({ text, variant = 'insight' }: Props) {
  return (
    <div className={cn('flex items-start gap-1.5 rounded-md px-2 py-1.5 mt-1', STYLES[variant])}>
      <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
      <p className="text-xs leading-snug">{text}</p>
    </div>
  )
}
