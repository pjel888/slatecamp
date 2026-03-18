import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { RecommendedAction } from '@/types/dashboard'
import type { ReactNode } from 'react'

// ── Icons (inline SVG to avoid client bundle) ───────────────────────────────

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6.5 4.5v11l9-5.5-9-5.5z" fill="#4A5568" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 4h5.5a2.5 2.5 0 0 1 2.5 2.5V16a2 2 0 0 0-2-2H3V4zM17 4h-5.5A2.5 2.5 0 0 0 9 6.5V16a2 2 0 0 1 2-2h6V4z" stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CampfireIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2c0 3-3 5-3 8a3 3 0 0 0 6 0c0-3-3-5-3-8z" stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 16l-2 2M14 16l2 2M8 18h4" stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="#4A5568" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" stroke="#4A5568" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1" fill="#4A5568" />
    </svg>
  )
}

const ICON_MAP: Record<string, () => ReactNode> = {
  resume: PlayIcon,
  blindspot: TargetIcon,
  wiki_read: BookIcon,
  warmup: CampfireIcon,
}

// ── Component ───────────────────────────────────────────────────────────────

interface NextBestActionCardProps {
  action: RecommendedAction
}

export function NextBestActionCardNew({ action }: NextBestActionCardProps) {
  const Icon = ICON_MAP[action.type] ?? CampfireIcon

  return (
    <Card
      className="relative overflow-hidden border p-3 bg-white"
      style={{ borderColor: '#D4DAE3' }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
        style={{ backgroundColor: '#1B3FC4' }}
      />

      <div className="flex items-start gap-3 pl-2">
        <div className="mt-0.5 shrink-0">
          <Icon />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-tight"
            style={{ color: '#1A2332' }}
          >
            {action.title}
          </p>
          <p
            className="mt-0.5 text-xs leading-snug"
            style={{ color: '#4A5568' }}
          >
            {action.subtitle}
          </p>

          {/* Progress bar (resume only) */}
          {action.progress && (
            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-1 flex-1 rounded-full overflow-hidden"
                style={{ backgroundColor: '#D4DAE3' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((action.progress.current / action.progress.total) * 100)}%`,
                    backgroundColor: '#1B3FC4',
                  }}
                />
              </div>
              <span
                className="font-dm-mono text-[11px] font-medium"
                style={{ color: '#8896A7' }}
              >
                {action.progress.current}/{action.progress.total}
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <span
              className="font-dm-mono text-[11px]"
              style={{ color: '#8896A7' }}
            >
              ~{action.estimatedMinutes} min
            </span>
            <Link
              href={action.href}
              className="inline-flex items-center justify-center h-7 rounded-sm px-3 text-xs font-medium"
              style={{ backgroundColor: '#1B3FC4', color: '#FFFFFF' }}
            >
              {action.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

export function NextBestActionCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border p-3" style={{ borderColor: '#D4DAE3' }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-muted" />
      <div className="flex items-start gap-3 pl-2">
        <Skeleton className="h-5 w-5 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20 rounded-sm" />
          </div>
        </div>
      </div>
    </Card>
  )
}
