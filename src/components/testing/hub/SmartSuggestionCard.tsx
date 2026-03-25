'use client'

import Link from 'next/link'
import { AlertTriangle, Calendar, Target, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { SmartSuggestion, SuggestionVariant } from '@/types/testing'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const WaveIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 11.5a4.5 4.5 0 0 1 9 0" />
    <path d="M5.5 9.5C6.8 8.1 8.4 7 10 6.5" />
    <path d="M18.5 9.5C17.2 8.1 15.6 7 14 6.5" />
    <path d="M12 16v2" />
    <path d="M8 20h8" />
  </svg>
)

// ─── Variant config ───────────────────────────────────────────────────────────

interface VariantConfig {
  bg: string
  border: string
  accentBorder: string
  iconBg: string
  iconColor: string
  Icon: React.ComponentType<{ className?: string }>
}

const VARIANT_CONFIG: Record<SuggestionVariant, VariantConfig> = {
  blindspot: {
    bg: '#FDF0F0',
    border: '#D64545',
    accentBorder: '#D64545',
    iconBg: 'rgba(214, 69, 69, 0.1)',
    iconColor: '#D64545',
    Icon: ({ className }) => <AlertTriangle className={className} />,
  },
  'exam-countdown': {
    bg: '#FEF8ED',
    border: '#D4951A',
    accentBorder: '#D4951A',
    iconBg: 'rgba(212, 149, 26, 0.1)',
    iconColor: '#D4951A',
    Icon: ({ className }) => <Calendar className={className} />,
  },
  'weak-subject': {
    bg: '#EEF2FC',
    border: '#1B3FC4',
    accentBorder: '#1B3FC4',
    iconBg: 'rgba(27, 63, 196, 0.1)',
    iconColor: '#1B3FC4',
    Icon: ({ className }) => <Target className={className} />,
  },
  return: {
    bg: '#EEF2FC',
    border: '#1B3FC4',
    accentBorder: '#1B3FC4',
    iconBg: 'rgba(27, 63, 196, 0.1)',
    iconColor: '#1B3FC4',
    Icon: WaveIcon,
  },
}

// ─── Eyebrow labels ───────────────────────────────────────────────────────────

const EYEBROW_LABELS: Record<SuggestionVariant, string> = {
  blindspot: 'Focus Review',
  'exam-countdown': 'Exam Countdown',
  'weak-subject': 'Suggested Focus',
  return: 'Welcome back',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SmartSuggestionCardProps {
  suggestion: SmartSuggestion
}

const SmartSuggestionCard = ({ suggestion }: SmartSuggestionCardProps) => {
  const { variant, title, description, ctaLabel, ctaHref } = suggestion
  const config = VARIANT_CONFIG[variant]
  const eyebrow = EYEBROW_LABELS[variant]
  const { Icon } = config

  const isDestructive = variant === 'blindspot'

  return (
    <Card
      className="rounded-lg p-5 border-l-[3px]"
      style={{
        backgroundColor: config.bg,
        borderColor: 'var(--border)',
        borderLeftColor: config.accentBorder,
      }}
      role="complementary"
      aria-label={`${eyebrow}: ${title}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: config.iconBg }}
          aria-hidden="true"
        >
          <Icon
            className="h-4 w-4"
            // @ts-expect-error style prop on dynamic icon
            style={{ color: config.iconColor }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] font-medium uppercase tracking-wide mb-1"
            style={{ color: 'var(--muted-foreground)' }}
            aria-hidden="true"
          >
            {eyebrow}
          </p>
          <h2
            className="text-[17px] font-semibold leading-snug mb-1.5"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h2>
          <p
            className="text-[14px] font-normal leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </p>

          <Link
            href={ctaHref}
            aria-label={`${ctaLabel} — ${title}`}
            className={cn(
              'inline-flex items-center justify-center rounded-sm px-3 py-2 text-[13px] font-medium transition-all duration-150 ease-out active:scale-[0.98]',
              isDestructive
                ? 'bg-destructive text-white hover:bg-[#C03C3C]'
                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'
            )}
          >
            {ctaLabel}
            <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

SmartSuggestionCard.displayName = 'SmartSuggestionCard'

export { SmartSuggestionCard }
