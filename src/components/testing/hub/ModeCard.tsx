'use client'

import Link from 'next/link'
import { Crosshair, MagnifyingGlass, Lightning, Shield, Book, Leaf, GearSix, Barbell } from '@phosphor-icons/react/dist/ssr'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'
import type { ModeDefinition, ModeStats } from '@/types/testing'
import type { SimulationGateStatus } from '@/types/testing'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  book: ({ className, ...p }) => <Book className={className} {...p} />,
  leaf: ({ className, ...p }) => <Leaf className={className} {...p} />,
  target: ({ className, ...p }) => <Crosshair className={className} {...p} />,
  search: ({ className, ...p }) => <MagnifyingGlass className={className} {...p} />,
  settings: ({ className, ...p }) => <GearSix className={className} {...p} />,
  zap: ({ className, ...p }) => <Lightning className={className} {...p} />,
  shield: ({ className, ...p }) => <Shield className={className} {...p} />,
  dumbbell: ({ className, ...p }) => <Barbell className={className} {...p} />,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatLastAccuracy = (pct: number | null): string =>
  pct !== null ? `${Math.round(pct)}%` : '—'

const formatAvgQuestions = (avg: number | null): string =>
  avg !== null ? `${Math.round(avg)} avg` : ''

const buildStatsLine = (stats: ModeStats | null): string | null => {
  if (!stats) return null
  const { sessionCount, lastAccuracy, avgQuestionsPerSession } = stats
  if (sessionCount === 0) return null
  if (sessionCount < 5) {
    return `${sessionCount} session${sessionCount === 1 ? '' : 's'} completed`
  }
  const parts = [`${sessionCount} sessions`]
  if (lastAccuracy !== null) parts.push(`Last: ${formatLastAccuracy(lastAccuracy)}`)
  const avg = formatAvgQuestions(avgQuestionsPerSession)
  if (avg) parts.push(avg)
  return parts.join(' · ')
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModeCardProps {
  mode: ModeDefinition
  stats: ModeStats | null
  isLocked?: boolean
  lockProgress?: SimulationGateStatus | null
  userTier: 'free' | 'pro'
}

// ─── Component ────────────────────────────────────────────────────────────────

const ModeCard = ({
  mode,
  stats,
  isLocked = false,
  lockProgress = null,
  userTier,
}: ModeCardProps) => {
  const Icon = ICON_MAP[mode.icon] ?? ICON_MAP['book']
  const statsLine = buildStatsLine(stats)
  const sessionCount = stats?.sessionCount ?? 0

  const isZone3 = mode.zone === 3
  const accentColor = isZone3 ? 'var(--accent)' : 'var(--primary)'
  const showProBadge = mode.isPro && userTier === 'free'
  const MODE_KEY_TO_V2: Record<string, string> = {
    'focus-review': 'focused',
    simulation: 'fullexam',
    endurance: 'extended',
  }
  const v2Mode = MODE_KEY_TO_V2[mode.key] ?? mode.key
  const href = `/quiz/${v2Mode}/setup`

  const cardContent = (
    <>
      {/* Top row: icon + label + pro badge */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm"
          style={{
            backgroundColor: isZone3
              ? 'rgba(232, 133, 58, 0.1)'
              : 'rgba(27, 63, 196, 0.1)',
          }}
          aria-hidden="true"
        >
          <Icon
            className="h-3.5 w-3.5"
            // @ts-expect-error inline style on dynamic icon
            style={{ color: accentColor }}
            aria-hidden
          />
        </div>
        <span
          className="text-[13px] font-medium leading-none"
          style={{ color: 'var(--text-secondary)' }}
        >
          {mode.label}
        </span>
        {showProBadge && (
          <Badge variant="primary" size="sm" className="ml-auto">
            Pro
          </Badge>
        )}
      </div>

      {/* Character name */}
      <h3
        className="text-[17px] font-semibold leading-snug mb-1.5"
        style={{ color: 'var(--foreground)' }}
      >
        {mode.character}
      </h3>

      {/* Description */}
      <p
        className="text-[14px] font-normal leading-relaxed mb-3"
        style={{ color: 'var(--text-secondary)' }}
      >
        {mode.description}
      </p>

      {/* Stats / first session hint */}
      {!isLocked && (
        <p
          className="text-[12px] font-normal mb-4 min-h-[18px]"
          style={{
            color:
              sessionCount === 0
                ? 'var(--primary)'
                : 'var(--muted-foreground)',
          }}
          aria-label={
            sessionCount === 0
              ? 'No sessions yet'
              : statsLine ?? undefined
          }
        >
          {sessionCount === 0
            ? 'Start your first session'
            : statsLine}
        </p>
      )}

      {/* Locked state: progress toward gate */}
      {isLocked && lockProgress && (
        <div className="mb-4" aria-label="Unlock progress">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[12px] font-normal"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Readiness Score:{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {lockProgress.currentReadiness}%
              </span>{' '}
              /{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                {lockProgress.requiredReadiness}%
              </span>{' '}
              needed
            </span>
            <span
              className="text-[12px] font-normal"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {lockProgress.pointsNeeded} more point
              {lockProgress.pointsNeeded !== 1 ? 's' : ''} to unlock
            </span>
          </div>
          <div
            className="h-1 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--border-default)' }}
            role="progressbar"
            aria-valuenow={lockProgress.currentReadiness}
            aria-valuemin={0}
            aria-valuemax={lockProgress.requiredReadiness}
            aria-label={`Readiness: ${lockProgress.currentReadiness}% of ${lockProgress.requiredReadiness}% required`}
          >
            <div
              className="h-full rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${Math.min(
                  100,
                  (lockProgress.currentReadiness /
                    lockProgress.requiredReadiness) *
                    100
                )}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </div>
      )}

      {/* CTA button — always visible, only this is clickable */}
      {isLocked ? (
        <span
          className="inline-flex items-center justify-center rounded-sm w-full px-3 py-2 text-[13px] font-medium mt-auto bg-[#D4DAE3] text-[#8896A7] cursor-not-allowed"
        >
          Unlock at {lockProgress?.requiredReadiness ?? 65}% Readiness
        </span>
      ) : (
        <Link
          href={href}
          className={cn(
            'inline-flex items-center justify-center rounded-sm w-full px-3 py-2 text-[13px] font-medium transition-all duration-150 ease-out mt-auto',
            isZone3
              ? 'bg-[var(--accent)] text-white hover:opacity-90'
              : 'bg-[var(--primary)] text-white hover:opacity-90'
          )}
        >
          {mode.ctaLabel}
        </Link>
      )}
    </>
  )

  if (isLocked) {
    return (
      <div
        className="relative flex flex-col rounded-md border border-l-[3px] p-4"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--border-default)',
          borderLeftColor: accentColor,
        }}
        aria-label={`${mode.character} — locked. ${lockProgress?.pointsNeeded ?? 0} more readiness points needed.`}
        role="article"
      >
        {cardContent}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-md border border-l-[3px] p-4',
      )}
      style={{
        backgroundColor: 'var(--surface-card)',
        borderColor: 'var(--border-default)',
        borderLeftColor: accentColor,
      }}
      role="article"
      aria-label={`${mode.character} — ${mode.label}. ${mode.description}`}
    >
      {cardContent}
    </div>
  )
}

ModeCard.displayName = 'ModeCard'

export { ModeCard }
