'use client'

import { useState, useCallback } from 'react'
import { Info, X } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface CrammingNudgeProps {
  message: string
  className?: string
}

/**
 * Non-blocking coaching annotation shown when cramming is detected.
 *
 * Appears once per session as an amber informational nudge encouraging
 * distributed practice. Dismissable with "Got it" button.
 */
export const CrammingNudge = ({ message, className }: CrammingNudgeProps) => {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  if (dismissed) return null

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-[#D4951A]/20 bg-[#FEF8ED] px-3 py-2',
        'animate-in fade-in slide-in-from-top-1 duration-200',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <SCIcon
        icon={Info}
        size="sm"
        className="text-[#D4951A] mt-0.5 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#D4951A] leading-snug">
          Spacing suggestion
        </p>
        <p className="text-xs text-[#4A5568] mt-0.5 leading-snug">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm px-2 py-1',
          'text-[11px] font-medium text-[#D4951A]',
          'border border-[#D4951A]/25 bg-white/60',
          'transition-all duration-150 ease-out',
          'hover:bg-white hover:border-[#D4951A]/40',
          'shrink-0',
        )}
      >
        Got it
        <SCIcon icon={X} size="xs" />
      </button>
    </div>
  )
}
