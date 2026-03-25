import { Info, Warning, Lightbulb, BookOpen, WarningDiamond, Target, Scales, X } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

/**
 * Unified Callout component — merges WikiCallout, WikiCalloutBox, and AlertBox
 * into a single variant-driven component with design-token colors and dark mode.
 */

type CalloutVariant =
  | 'note'
  | 'warning'
  | 'tip'
  | 'example'
  | 'info'
  | 'danger'
  | 'requirement'
  | 'most-tested'
  | 'ale-watch'
  | 'version-alert'
  | 'exam-tip'
  | 'authority'

interface VariantConfig {
  icon?: typeof Info
  label: string
  /** Border color — uses CSS custom properties for theme support */
  border: string
  /** Background color */
  bg: string
  /** Icon color */
  iconColor: string
  /** Label / eyebrow color */
  labelColor: string
  /** Whether to use the eyebrow-style layout (smaller mono label, no icon) */
  eyebrow?: boolean
  /** Whether body text should be italic (authority citations) */
  italic?: boolean
}

const VARIANTS: Record<CalloutVariant, VariantConfig> = {
  note: {
    icon: Info,
    label: 'Note',
    border: 'border-[var(--info)]/30',
    bg: 'bg-[var(--info)]/5',
    iconColor: 'text-[var(--info)]',
    labelColor: 'text-[var(--info)]',
  },
  info: {
    icon: Info,
    label: 'Info',
    border: 'border-[var(--text-secondary,#4A5568)]/20',
    bg: 'bg-[var(--surface-focused)]',
    iconColor: 'text-[var(--text-secondary,#4A5568)]',
    labelColor: 'text-[var(--text-secondary,#4A5568)]',
  },
  warning: {
    icon: Warning,
    label: 'Warning',
    border: 'border-[var(--warning)]/30',
    bg: 'bg-[var(--warning)]/5',
    iconColor: 'text-[var(--warning)]',
    labelColor: 'text-[var(--warning)]',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    border: 'border-[var(--success)]/30',
    bg: 'bg-[var(--success)]/5',
    iconColor: 'text-[var(--success)]',
    labelColor: 'text-[var(--success)]',
  },
  example: {
    icon: BookOpen,
    label: 'Example',
    border: 'border-[var(--primary)]/20',
    bg: 'bg-[var(--primary)]/5',
    iconColor: 'text-[var(--primary)]',
    labelColor: 'text-[var(--primary)]',
  },
  danger: {
    icon: WarningDiamond,
    label: 'Danger',
    border: 'border-[var(--destructive)]/30',
    bg: 'bg-[var(--destructive)]/5',
    iconColor: 'text-[var(--destructive)]',
    labelColor: 'text-[var(--destructive)]',
  },
  requirement: {
    icon: BookOpen,
    label: 'Requirement',
    border: 'border-[var(--primary)]/30',
    bg: 'bg-[var(--primary)]/5',
    iconColor: 'text-[var(--primary)]',
    labelColor: 'text-[var(--primary)]',
  },
  'exam-tip': {
    icon: Target,
    label: 'Exam Tip',
    border: 'border-[var(--primary)]',
    bg: 'bg-[var(--primary)]/5',
    iconColor: 'text-[var(--primary)]',
    labelColor: 'text-[var(--primary)]',
  },
  authority: {
    icon: Scales,
    label: 'Legal Authority',
    border: 'border-[var(--text-secondary,#4A5568)]/40',
    bg: 'bg-[var(--surface-focused)]',
    iconColor: 'text-[var(--text-secondary,#4A5568)]',
    labelColor: 'text-[var(--text-secondary,#4A5568)]',
    italic: true,
  },
  'most-tested': {
    label: 'Most-tested',
    border: 'border-[var(--primary)]',
    bg: 'bg-[var(--primary)]/5',
    iconColor: 'text-[var(--primary)]',
    labelColor: 'text-[var(--primary)]',
    eyebrow: true,
  },
  'ale-watch': {
    label: 'ALE Watch',
    border: 'border-[var(--color-signal-red)]',
    bg: 'bg-[var(--color-signal-red)]/5',
    iconColor: 'text-[var(--color-signal-red)]',
    labelColor: 'text-[var(--color-signal-red)]',
    eyebrow: true,
  },
  'version-alert': {
    label: 'Version alert \u2014 read first',
    border: 'border-[var(--color-signal-gold)]',
    bg: 'bg-[var(--color-signal-gold)]/5',
    iconColor: 'text-[var(--color-signal-gold)]',
    labelColor: 'text-[var(--warning)]',
    eyebrow: true,
  },
}

export interface CalloutProps {
  variant?: CalloutVariant
  /** Override the default label text */
  title?: string
  children: React.ReactNode
  className?: string
  /** Show a dismiss button in the upper-right corner */
  dismissible?: boolean
  /** Callback when the dismiss button is clicked. Presence implies dismissible. */
  onDismiss?: () => void
}

/**
 * Unified Callout — renders all callout/alert variants in one component.
 *
 * Standard variants (note, warning, tip, example, info, danger, requirement,
 * exam-tip, authority): icon + label + body layout.
 *
 * Eyebrow variants (most-tested, ale-watch, version-alert): small mono
 * eyebrow label + body layout (no icon).
 */
export const Callout = ({ variant = 'note', title, children, className, dismissible, onDismiss }: CalloutProps) => {
  const config = VARIANTS[variant]
  const showDismiss = dismissible || !!onDismiss

  if (config.eyebrow) {
    return (
      <div
        className={cn(
          'not-prose rounded-r-lg border-l-[3px] px-4 py-3 my-5',
          showDismiss && 'relative',
          config.border,
          config.bg,
          className,
        )}
        role="note"
      >
        {showDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className={cn(
              'absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors duration-150 opacity-60 hover:opacity-100',
              config.iconColor,
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <span
          className={cn(
            'block font-mono text-[11px] font-medium uppercase tracking-widest mb-1',
            config.labelColor,
          )}
        >
          {title || config.label}
        </span>
        <div className="text-sm text-foreground/80 leading-relaxed [&_strong]:font-semibold [&_strong]:text-foreground">
          {children}
        </div>
      </div>
    )
  }

  const Icon = config.icon!

  return (
    <span
      className={cn(
        'not-prose block my-6 rounded-md border-l-4 px-4 py-3',
        showDismiss && 'relative',
        config.border,
        config.bg,
        className,
      )}
      role="note"
    >
      {showDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className={cn(
            'absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-sm transition-colors duration-150 opacity-60 hover:opacity-100',
            config.iconColor,
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <span className="flex items-center gap-2 mb-1.5">
        <Icon size={16} weight="bold" className={config.iconColor} />
        <span className={cn('text-xs font-semibold uppercase tracking-wider', config.labelColor)}>
          {title || config.label}
        </span>
      </span>
      <span
        className={cn(
          'block text-sm text-foreground/80 leading-relaxed [&>p]:m-0 [&>p+p]:mt-2 [&>ol]:m-0 [&>ol]:pl-4 [&>ul]:m-0 [&>ul]:pl-4 [&_strong]:font-semibold [&_strong]:text-foreground',
          config.italic && 'italic [&_strong]:not-italic',
        )}
      >
        {children}
      </span>
    </span>
  )
}

// ── Backward-compatible named exports for MDX component mapping ──────────────

/** Note callout (blue info style) */
export const Note = ({ children, title, dismissible, onDismiss }: Omit<CalloutProps, 'variant'>) => (
  <Callout variant="note" title={title} dismissible={dismissible} onDismiss={onDismiss}>{children}</Callout>
)

/** Warning callout (amber) */
export const Warn = ({ children, title, dismissible, onDismiss }: Omit<CalloutProps, 'variant'>) => (
  <Callout variant="warning" title={title} dismissible={dismissible} onDismiss={onDismiss}>{children}</Callout>
)

/** Tip callout (green) */
export const Tip = ({ children, title, dismissible, onDismiss }: Omit<CalloutProps, 'variant'>) => (
  <Callout variant="tip" title={title} dismissible={dismissible} onDismiss={onDismiss}>{children}</Callout>
)

/** Example callout (cobalt) */
export const Example = ({ children, title, dismissible, onDismiss }: Omit<CalloutProps, 'variant'>) => (
  <Callout variant="example" title={title} dismissible={dismissible} onDismiss={onDismiss}>{children}</Callout>
)

// ── Alias for WikiCalloutBox backward compat ─────────────────────────────────

export const CalloutBox = ({
  type,
  children,
  dismissible,
  onDismiss,
}: {
  type: 'most-tested' | 'ale-watch' | 'version-alert'
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}) => <Callout variant={type} dismissible={dismissible} onDismiss={onDismiss}>{children}</Callout>

// ── Alias for AlertBox backward compat ───────────────────────────────────────

export const AlertBox = ({
  type = 'info',
  children,
}: {
  type?: 'requirement' | 'warning' | 'info' | 'danger'
  children: React.ReactNode
}) => <Callout variant={type}>{children}</Callout>

// ── Alias for ExamTip backward compat ────────────────────────────────────────

export const ExamTip = ({ children }: { children: React.ReactNode }) => (
  <Callout variant="exam-tip">{children}</Callout>
)

// ── Alias for AuthorityContent backward compat ───────────────────────────────

export const AuthorityContent = ({ children }: { children: React.ReactNode }) => (
  <Callout variant="authority">{children}</Callout>
)
