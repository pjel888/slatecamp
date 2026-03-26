'use client'

import Link from 'next/link'
import {
  Lightning,
  BookOpen,
  ArrowsClockwise,
  Coffee,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedForwardCardsProps {
  recommendations: Recommendation[]
}

// ─── Icon + CTA mapping ──────────────────────────────────────────────────────

const CARD_CONFIG: Record<
  Recommendation['type'],
  {
    icon: typeof Lightning
    ctaLabel: string
    accentClass: string
    iconBgClass: string
  }
> = {
  quiz: {
    icon: Lightning,
    ctaLabel: 'Start 10-Question Session',
    accentClass: 'text-[#1B3FC4]',
    iconBgClass: 'bg-[#EEF2FC]',
  },
  wiki: {
    icon: BookOpen,
    ctaLabel: 'Open Article',
    accentClass: 'text-[#1B3FC4]',
    iconBgClass: 'bg-[#EEF2FC]',
  },
  review: {
    icon: ArrowsClockwise,
    ctaLabel: 'Start Review',
    accentClass: 'text-[#D4951A]',
    iconBgClass: 'bg-[#FEF8ED]',
  },
  rest: {
    icon: Coffee,
    ctaLabel: 'Take a Break',
    accentClass: 'text-[#4A5568]',
    iconBgClass: 'bg-[#F8F7F5]',
  },
}

// ─── Single card ──────────────────────────────────────────────────────────────

const FeedForwardCard = ({ rec }: { rec: Recommendation }) => {
  const config = CARD_CONFIG[rec.type]
  const Icon = config.icon
  const isRest = rec.type === 'rest'

  const cardContent = (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border border-[#D4DAE3] bg-white p-4 h-full',
        'transition-shadow duration-150 ease-out',
        !isRest && 'hover:shadow-sm',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-sm',
          config.iconBgClass,
        )}
      >
        <Icon size={18} weight="bold" className={config.accentClass} />
      </div>

      {/* Text — flex-1 fills available space so CTA is always pinned to bottom */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A2332] leading-snug line-clamp-2">
          {rec.title}
        </p>
        <p className="mt-1 text-xs text-[#4A5568] leading-relaxed line-clamp-2">
          {rec.description}
        </p>
      </div>

      {/* CTA — always at the bottom */}
      <span
        className={cn(
          'inline-flex items-center text-xs font-semibold shrink-0 mt-auto',
          isRest ? 'text-[#8896A7]' : config.accentClass,
        )}
      >
        {config.ctaLabel}
      </span>
    </div>
  )

  // Rest cards are not navigable
  if (isRest) {
    return cardContent
  }

  return (
    <Link
      href={rec.action.href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-2 rounded-md"
    >
      {cardContent}
    </Link>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FeedForwardCards = ({ recommendations }: FeedForwardCardsProps) => {
  if (recommendations.length === 0) return null

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8896A7]">
        Suggested Next Steps
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {recommendations.map((rec, idx) => (
          <FeedForwardCard key={`${rec.type}-${idx}`} rec={rec} />
        ))}
      </div>
    </div>
  )
}
