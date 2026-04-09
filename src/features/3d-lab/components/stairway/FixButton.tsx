'use client'

import { Button } from '@/components/ui/button'

interface FixButtonProps {
  onClick: () => void
  lawColor: string
}

const FixButton = ({ onClick, lawColor }: FixButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    className="h-6 px-2 text-xs font-medium shrink-0"
    style={{ color: lawColor }}
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
  >
    Fix →
  </Button>
)

export { FixButton }
export type { FixButtonProps }
