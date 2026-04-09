'use client'

import { cn } from '@/lib/utils'

interface LawActivationDotProps {
  lawColor: string
  isActive: boolean
}

const LawActivationDot = ({ lawColor, isActive }: LawActivationDotProps) => (
  <span
    className={cn(
      'inline-block h-2 w-2 rounded-full transition-opacity duration-150 ease-out',
      isActive ? 'opacity-100' : 'opacity-30',
    )}
    style={{ backgroundColor: lawColor }}
    aria-hidden="true"
  />
)

export { LawActivationDot }
export type { LawActivationDotProps }
