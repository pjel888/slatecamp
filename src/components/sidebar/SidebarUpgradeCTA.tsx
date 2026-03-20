'use client'

import Link from 'next/link'
import { Sparkle, Check } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useTier } from '@/lib/context/tier-context'
import { ROUTES } from '@/lib/constants/routes'
import type { SidebarUpgradeCTAProps } from './types'

// ---------------------------------------------------------------------------
// CTA Benefits (Campfire voice: growth-framed, not aggressive)
// ---------------------------------------------------------------------------

const CTA_BENEFITS = [
  'Unlimited practice sessions',
  'AI tutor feedback',
  'Advanced analytics',
]

// ---------------------------------------------------------------------------
// SidebarUpgradeCTA
// ---------------------------------------------------------------------------
{/* FRM-02: This slot can be replaced with partner/ad content for paid users */}

export const SidebarUpgradeCTA = ({ collapsed }: SidebarUpgradeCTAProps) => {
  const { effectiveTier } = useTier()
  const showCTA = effectiveTier === 'free'
  if (!showCTA) return null

  // Collapsed: sparkle icon with tooltip
  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={ROUTES.SETTINGS_BILLING}
              className="flex items-center justify-center rounded-sm p-1 transition-colors duration-150 hover:bg-[#FEF8ED]"
            >
              <SCIcon
                icon={Sparkle}
                size="sm"
                className="text-[#D4951A]"
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-[#1A2332] text-white font-medium text-xs"
          >
            Unlock more
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  // Expanded: feature teaser card
  return (
    <div className="rounded-md border border-border bg-[#F8F7F5] p-3 mb-2">
      <p className="text-[11px] font-semibold text-[#1A2332] mb-1.5">
        Unlock more
      </p>
      <ul className="space-y-1">
        {CTA_BENEFITS.map((benefit) => (
          <li
            key={benefit}
            className="text-[11px] text-[#4A5568] flex items-center gap-1.5"
          >
            <SCIcon
              icon={Check}
              size="xs"
              weight="bold"
              className="text-[#2D9F6F] shrink-0"
            />
            {benefit}
          </li>
        ))}
      </ul>
      <Link href={ROUTES.SETTINGS_BILLING}>
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-full mt-2 text-xs font-medium border-border text-[#4A5568] hover:bg-primary hover:text-white hover:border-primary transition-colors"
        >
          See plans
        </Button>
      </Link>
    </div>
  )
}
