'use client'

import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UnifiedTopBarProps, UserRole } from '@/types/layout'

// ── Helpers ──

const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const getRoleBadgeLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    student: 'Student',
    admin: 'Admin',
    ceo: 'CEO',
  }
  return labels[role]
}

const roleBadgeColors: Record<UserRole, string> = {
  student: 'bg-primary/10 text-primary',
  admin: 'bg-amber-500/10 text-amber-700',
  ceo: 'bg-emerald-500/10 text-emerald-700',
}

// ── Component ──

export const UnifiedTopBar = ({ displayName, role, onMenuToggle }: UnifiedTopBarProps) => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card shrink-0">
      {/* Left: hamburger (mobile) + greeting */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuToggle}
          className="lg:hidden flex items-center justify-center h-[44px] w-[44px] rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 ease-out -ml-2"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div>
          <h1 className="text-sm font-medium text-foreground">
            {getGreeting()}, {displayName}
          </h1>
          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
      </div>

      {/* Right: role badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-sm px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-widest',
            roleBadgeColors[role],
          )}
        >
          {getRoleBadgeLabel(role)}
        </span>
      </div>
    </header>
  )
}
