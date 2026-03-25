'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { CaretDown, CaretRight, ThumbsUp, ThumbsDown, Flag } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// ContentSidebar
// ---------------------------------------------------------------------------
// Right-side content panel used for table of contents, article metadata,
// related content, etc. Intended to sit inside a flex layout alongside the
// main content area.
// ---------------------------------------------------------------------------

interface ContentSidebarProps {
  /** Optional heading displayed at the top of the sidebar. */
  title?: string
  children: React.ReactNode
  className?: string
  /** Stick to the top of the viewport on scroll. Default: true. */
  sticky?: boolean
}

const ContentSidebar = ({
  title,
  children,
  className,
  sticky = true,
}: ContentSidebarProps) => (
  <div
    className={cn(
      'w-64 shrink-0 border-l border-border bg-card',
      sticky && 'sticky top-0 h-screen overflow-y-auto',
      className,
    )}
  >
    {title && (
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground px-4 py-3 border-b border-border select-none">
        {title}
      </p>
    )}
    {children}
  </div>
)

// ---------------------------------------------------------------------------
// ContentSidebarSection
// ---------------------------------------------------------------------------

interface ContentSidebarSectionProps {
  title: string
  children: React.ReactNode
  /** Allow section to be collapsed. Default: false. */
  collapsible?: boolean
  /** Initial open state when collapsible. Default: true. */
  defaultOpen?: boolean
  className?: string
}

const ContentSidebarSection = ({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: ContentSidebarSectionProps) => {
  const [open, setOpen] = useState(defaultOpen)

  const heading = (
    <div
      className={cn(
        'flex items-center justify-between',
        collapsible && 'cursor-pointer select-none',
      )}
      {...(collapsible
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': open,
            onClick: () => setOpen((prev) => !prev),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen((prev) => !prev)
              }
            },
          }
        : {})}
    >
      <p className="text-xs font-medium text-foreground">{title}</p>
      {collapsible && (
        <CaretDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      )}
    </div>
  )

  return (
    <div className={cn('px-4 py-3 border-b border-border last:border-b-0', className)}>
      {heading}
      {(!collapsible || open) && <div className="mt-2">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ContentSidebarTocLink
// ---------------------------------------------------------------------------

interface ContentSidebarTocLinkProps {
  href: string
  children: React.ReactNode
  /** Highlight as the currently active section. Default: false. */
  active?: boolean
  /** Indentation depth level. Default: 0. */
  depth?: number
}

const ContentSidebarTocLink = ({
  href,
  children,
  active = false,
  depth = 0,
}: ContentSidebarTocLinkProps) => (
  <a
    href={href}
    style={{ paddingLeft: `${12 + depth * 12}px` }}
    className={cn(
      'block border-l-2 py-1 text-xs transition-colors duration-150',
      active
        ? 'border-primary text-primary font-medium'
        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
    )}
  >
    {children}
  </a>
)

// ---------------------------------------------------------------------------
// ContentSidebarFeedback
// ---------------------------------------------------------------------------

interface ContentSidebarFeedbackProps {
  onHelpful?: () => void
  onNotHelpful?: () => void
  onReport?: () => void
}

const ContentSidebarFeedback = ({
  onHelpful,
  onNotHelpful,
  onReport,
}: ContentSidebarFeedbackProps) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs text-muted-foreground">Was this helpful?</p>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onHelpful}
        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <ThumbsUp className="h-3.5 w-3.5" weight="regular" />
      </button>
      <button
        type="button"
        onClick={onNotHelpful}
        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <ThumbsDown className="h-3.5 w-3.5" weight="regular" />
      </button>
      <button
        type="button"
        onClick={onReport}
        className="flex h-7 items-center gap-1 rounded-sm border border-border px-2 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
      >
        <Flag className="h-3 w-3" weight="regular" />
        <span className="text-[11px]">Report</span>
      </button>
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// ContentSidebarSources
// ---------------------------------------------------------------------------

interface ContentSidebarSourcesProps {
  sources: Array<{ label: string; href?: string }>
  className?: string
}

const ContentSidebarSources = ({ sources, className }: ContentSidebarSourcesProps) => (
  <ol className={cn('list-decimal list-inside space-y-1', className)}>
    {sources.map((source, index) => (
      <li key={index} className="text-xs">
        {source.href ? (
          <a href={source.href} className="text-primary hover:underline">
            {source.label}
          </a>
        ) : (
          <span className="text-foreground">{source.label}</span>
        )}
      </li>
    ))}
  </ol>
)

// ---------------------------------------------------------------------------
// ContentSidebarPopover
// ---------------------------------------------------------------------------
// Compact trigger ("3 sources") that opens a fixed-size scrollable popover
// anchored to the right of the trigger text.
// ---------------------------------------------------------------------------

interface ContentSidebarPopoverProps {
  /** Trigger label, e.g. "3 sources" or "20 related articles" */
  label: string
  children: React.ReactNode
  /** Popover width in px. Default: 280 */
  width?: number
  /** Popover max height in px. Default: 320 */
  maxHeight?: number
  className?: string
}

const ContentSidebarPopover = ({
  label,
  children,
  width = 280,
  maxHeight = 320,
  className,
}: ContentSidebarPopoverProps) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'inline-flex items-center gap-1 text-xs text-primary transition-colors duration-150',
          'hover:text-primary/80',
          open && 'text-primary/80',
        )}
      >
        <span>{label}</span>
        <CaretRight
          className={cn(
            'h-3 w-3 transition-transform duration-150',
            open && 'rotate-90',
          )}
        />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-full top-0 z-50 mr-2 rounded-md border border-border bg-card shadow-md overflow-hidden animate-in fade-in duration-150"
          style={{ width, maxHeight }}
        >
          <div className="overflow-y-auto p-3" style={{ maxHeight }}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  ContentSidebar,
  ContentSidebarSection,
  ContentSidebarTocLink,
  ContentSidebarFeedback,
  ContentSidebarSources,
  ContentSidebarPopover,
}
export type {
  ContentSidebarProps,
  ContentSidebarSectionProps,
  ContentSidebarTocLinkProps,
  ContentSidebarFeedbackProps,
  ContentSidebarSourcesProps,
  ContentSidebarPopoverProps,
}
