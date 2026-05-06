'use client'

import { WarningCircle } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

export type SidebarFooterNoticeKind = 'subscription-expiring' | 'payment-failed'

export interface SidebarFooterNoticeData {
  kind: SidebarFooterNoticeKind
  title: string
  description: string
}

interface SidebarFooterNoticeProps {
  expanded: boolean
  notice?: SidebarFooterNoticeData | null
}

const NOTICE_STYLES: Record<SidebarFooterNoticeKind, { dot: string; icon: string; text: string }> = {
  'subscription-expiring': {
    dot: 'bg-warning',
    icon: 'text-warning',
    text: 'text-gray-700',
  },
  'payment-failed': {
    dot: 'bg-destructive',
    icon: 'text-destructive',
    text: 'text-gray-800',
  },
}

export const SidebarFooterNotice = ({ expanded, notice }: SidebarFooterNoticeProps) => {
  if (!notice) return null

  const styles = NOTICE_STYLES[notice.kind]

  return (
    <div
      className={cn(
        'grid h-14 w-full grid-cols-[32px_minmax(0,1fr)] items-center overflow-hidden rounded-sm bg-white/70 ring-1 ring-gray-200/80',
        'transition-[background-color,box-shadow] duration-[180ms] ease-out motion-reduce:transition-none',
      )}
      aria-label={`${notice.title}. ${notice.description}`}
      title={`${notice.title}. ${notice.description}`}
    >
      <div className="flex h-14 w-8 shrink-0 items-center justify-center">
        <div className="relative flex size-5 items-center justify-center">
          <WarningCircle size={17} weight="regular" className={cn('shrink-0', styles.icon)} />
          <span
            aria-hidden="true"
            className={cn('absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-white', styles.dot)}
          />
        </div>
      </div>

      <div
        aria-hidden={!expanded}
        className={cn(
          'min-w-0 pr-2 transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:transform-none',
          expanded ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-1 opacity-0',
        )}
      >
        <p className={cn('truncate text-[11px] font-semibold leading-tight', styles.text)}>
          {notice.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-gray-500">
          {notice.description}
        </p>
      </div>
    </div>
  )
}
