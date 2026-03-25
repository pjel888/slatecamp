'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface FirstTimeTooltipProps {
  id: string
  children: React.ReactNode
  content: string
  placement?: Placement
}

export const FirstTimeTooltip = ({
  id,
  children,
  content,
  placement = 'top',
}: FirstTimeTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const storageKey = `slatecamp_tooltip_${id}`

  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey)
      if (!seen) setIsVisible(true)
    } catch {
      // localStorage unavailable — skip tooltip
    }
  }, [storageKey])

  const dismiss = () => {
    setIsVisible(false)
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // ignore
    }
  }

  const placementClasses: Record<Placement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-flex">
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-50 w-[280px] bg-[#EEF2FC] border border-[camp-cobalt]/20 rounded-md p-3 shadow-md',
            placementClasses[placement],
          )}
        >
          <p className="text-[12px] text-[#1535A8] leading-[1.6] mb-2">{content}</p>
          <button
            type="button"
            onClick={dismiss}
            className="text-[11px] font-black uppercase tracking-widest text-[camp-cobalt] hover:text-[#1535A8] transition-colors"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  )
}
