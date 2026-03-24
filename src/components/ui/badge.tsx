'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckCircle2, AlertTriangle, HelpCircle, Flame, Zap, Eye, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Variants                                                           */
/* ------------------------------------------------------------------ */

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground border-transparent',
        primary: 'bg-primary/10 text-primary border-transparent',
        success:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
        warning:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
        danger:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30',
        info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
        purple:
          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30',
        orange:
          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
        outline: 'bg-transparent text-foreground border-border',
        // Legacy compat
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
        destructive:
          'bg-destructive/10 text-destructive border-transparent dark:bg-destructive/20',
        ghost: 'bg-transparent text-muted-foreground border-transparent hover:bg-muted',
        link: 'bg-transparent text-primary border-transparent underline-offset-4 hover:underline',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest [&>svg]:size-2.5',
        sm: 'px-2 py-0.5 text-[10px] font-medium [&>svg]:size-3',
        md: 'px-2.5 py-1 text-xs font-medium [&>svg]:size-3.5',
        lg: 'px-3 py-1 text-sm font-medium [&>svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pill?: boolean
  dot?: boolean
  icon?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'sm',
      pill = false,
      dot = false,
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(
        badgeVariants({ variant, size }),
        pill ? 'rounded-full' : 'rounded',
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
      )}
      {icon}
      {children}
      {dismissible && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss?.()
          }}
          className="ml-0.5 -mr-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" />
          </svg>
        </button>
      )}
    </span>
  ),
)
Badge.displayName = 'Badge'

/* ------------------------------------------------------------------ */
/*  Semantic Presets                                                    */
/* ------------------------------------------------------------------ */

const StatusBadge = ({ status }: { status: 'published' | 'draft' | 'archived' | 'active' }) => {
  const config = {
    published: { variant: 'success' as const, label: 'Published' },
    draft: { variant: 'warning' as const, label: 'Draft' },
    archived: { variant: 'default' as const, label: 'Archived' },
    active: { variant: 'primary' as const, label: 'Active' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant} size="sm" dot>{label}</Badge>
}

const VerificationBadge = ({ status, count }: { status: 'clean' | 'has_issues' | 'unverified'; count?: number }) => {
  const config = {
    clean: { variant: 'success' as const, label: 'Clean', icon: <CheckCircle2 /> },
    has_issues: { variant: 'danger' as const, label: count ? `${count} issues` : 'Has issues', icon: <AlertTriangle /> },
    unverified: { variant: 'default' as const, label: 'Unverified', icon: <HelpCircle /> },
  }
  const { variant, label, icon } = config[status]
  return <Badge variant={variant} size="sm" icon={icon}>{label}</Badge>
}

const DifficultyBadge = ({ level }: { level: 'foundational' | 'intermediate' | 'advanced' }) => {
  const config = {
    foundational: { variant: 'info' as const, label: 'Foundational' },
    intermediate: { variant: 'warning' as const, label: 'Intermediate' },
    advanced: { variant: 'danger' as const, label: 'Advanced' },
  }
  const { variant, label } = config[level]
  return <Badge variant={variant} size="sm">{label}</Badge>
}

const SessionModeBadge = ({ mode }: { mode: 'camp' | 'storm' | 'blindspot' | 'proof' }) => {
  const config = {
    camp: { variant: 'primary' as const, label: 'CAMP', icon: <Flame /> },
    storm: { variant: 'warning' as const, label: 'STORM', icon: <Zap /> },
    blindspot: { variant: 'purple' as const, label: 'BLINDSPOT', icon: <Eye /> },
    proof: { variant: 'orange' as const, label: 'PROOF', icon: <Award /> },
  }
  const { variant, label, icon } = config[mode]
  return <Badge variant={variant} size="xs" icon={icon} pill>{label}</Badge>
}

const MasteryBadge = ({ tier }: { tier: 'building' | 'developing' | 'proficient' | 'mastered' }) => {
  const config = {
    building: { variant: 'warning' as const, label: 'Building' },
    developing: { variant: 'info' as const, label: 'Developing' },
    proficient: { variant: 'success' as const, label: 'Proficient' },
    mastered: { variant: 'success' as const, label: 'Mastered' },
  }
  const { variant, label } = config[tier]
  return <Badge variant={variant} size="sm" dot>{label}</Badge>
}

export {
  Badge,
  badgeVariants,
  StatusBadge,
  VerificationBadge,
  DifficultyBadge,
  SessionModeBadge,
  MasteryBadge,
}
export type { BadgeProps }
