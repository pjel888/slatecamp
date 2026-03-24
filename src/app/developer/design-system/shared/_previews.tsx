'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Button Preview                                                     */
/* ------------------------------------------------------------------ */

const BTN_VARIANTS = [
  { label: 'Default', classes: 'bg-primary text-white hover:bg-[#1535A8]' },
  { label: 'Secondary', classes: 'bg-muted text-foreground hover:bg-muted/80' },
  { label: 'Ghost', classes: 'bg-transparent text-foreground hover:bg-muted' },
  { label: 'Destructive', classes: 'bg-red-600 text-white hover:bg-red-700' },
  { label: 'Outline', classes: 'border border-border bg-transparent text-foreground hover:bg-muted' },
  { label: 'Link', classes: 'bg-transparent text-primary underline underline-offset-4 hover:text-[#1535A8]' },
]

const BTN_SIZES: { label: string; classes: string }[] = [
  { label: 'xs', classes: 'px-2 py-0.5 text-[11px]' },
  { label: 'sm', classes: 'px-3 py-1 text-[12px]' },
  { label: 'md', classes: 'px-4 py-2 text-[13px]' },
  { label: 'lg', classes: 'px-6 py-2.5 text-[14px]' },
]

export const ButtonPreview = () => (
  <div className="w-full space-y-6">
    {/* Variants */}
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Variants
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {BTN_VARIANTS.map((v) => (
          <button
            key={v.label}
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-sm px-4 py-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer',
              v.classes,
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>

    {/* Sizes */}
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Sizes
      </p>
      <div className="flex flex-wrap items-end gap-3">
        {BTN_SIZES.map((s) => (
          <button
            key={s.label}
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-sm bg-primary text-white font-medium transition-colors duration-150 cursor-pointer',
              s.classes,
            )}
          >
            {s.label.toUpperCase()} Button
          </button>
        ))}
      </div>
    </div>

    {/* States */}
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        States
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm bg-primary text-white px-4 py-2 text-[13px] font-medium cursor-pointer"
        >
          Default
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-sm bg-primary text-white px-4 py-2 text-[13px] font-medium opacity-50 cursor-not-allowed"
        >
          Disabled
        </button>
      </div>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Badge Preview                                                      */
/* ------------------------------------------------------------------ */

const BADGE_VARIANTS = [
  { label: 'Default', bg: 'bg-muted', text: 'text-foreground' },
  { label: 'Success', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { label: 'Warning', bg: 'bg-amber-50', text: 'text-amber-700' },
  { label: 'Danger', bg: 'bg-red-50', text: 'text-red-700' },
  { label: 'Info', bg: 'bg-blue-50', text: 'text-blue-700' },
]

export const BadgePreview = () => (
  <div className="w-full space-y-6">
    {/* Standard badges */}
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Variants (sm)
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {BADGE_VARIANTS.map((v) => (
          <span
            key={v.label}
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium',
              v.bg,
              v.text,
            )}
          >
            {v.label}
          </span>
        ))}
      </div>
    </div>

    {/* Pill badges */}
    <div className="space-y-2">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Pill Variant
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {BADGE_VARIANTS.map((v) => (
          <span
            key={`pill-${v.label}`}
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium',
              v.bg,
              v.text,
            )}
          >
            {v.label}
          </span>
        ))}
      </div>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Card Preview                                                       */
/* ------------------------------------------------------------------ */

export const CardPreview = () => (
  <div className="flex flex-wrap items-start gap-4">
    {/* Default card */}
    <div className="w-64 bg-card border border-border rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          Session Summary
        </h3>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          42 questions answered across 3 topics with a 76% accuracy rate.
        </p>
      </div>
    </div>

    {/* Interactive card */}
    <div className="w-64 bg-card border border-border rounded-md overflow-hidden hover:shadow-sm hover:border-primary/30 transition-all duration-150 cursor-pointer">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Building Code
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[11px] font-medium">
            82%
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Interactive card — hover to see border and shadow transition.
        </p>
        <span className="inline-flex items-center mt-2 text-[12px] text-primary font-medium">
          Continue review &rarr;
        </span>
      </div>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Tooltip Preview                                                    */
/* ------------------------------------------------------------------ */

export const TooltipPreview = () => (
  <div className="flex flex-col items-center gap-1">
    {/* Static mock tooltip */}
    <div className="relative flex flex-col items-center">
      <div className="px-3 py-1.5 rounded-md bg-foreground text-background text-[12px] font-medium shadow-md">
        Exam readiness overview
      </div>
      {/* Arrow */}
      <div className="w-2 h-2 bg-foreground rotate-45 -mt-1" />
    </div>

    {/* Trigger button */}
    <button
      type="button"
      className="mt-1 inline-flex items-center justify-center rounded-sm border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground cursor-pointer"
    >
      Hover for tooltip
    </button>
  </div>
)

/* ------------------------------------------------------------------ */
/*  Skeleton Preview                                                   */
/* ------------------------------------------------------------------ */

export const SkeletonPreview = () => (
  <div className="w-full max-w-sm space-y-4">
    {/* Card-style skeleton */}
    <div className="flex items-start gap-3">
      {/* Circle (avatar placeholder) */}
      <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
      {/* Lines */}
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 w-3/4 rounded-sm bg-muted animate-pulse" />
        <div className="h-3 w-full rounded-sm bg-muted animate-pulse" />
        <div className="h-3 w-5/6 rounded-sm bg-muted animate-pulse" />
      </div>
    </div>

    {/* Standalone lines */}
    <div className="space-y-2">
      <div className="h-4 w-48 rounded-sm bg-muted animate-pulse" />
      <div className="h-4 w-32 rounded-sm bg-muted animate-pulse" />
      <div className="h-4 w-40 rounded-sm bg-muted animate-pulse" />
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  EmptyState Preview                                                 */
/* ------------------------------------------------------------------ */

export const EmptyStatePreview = () => (
  <div className="w-full max-w-sm flex flex-col items-center text-center py-8 px-4">
    {/* Icon */}
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <svg
        className="w-6 h-6 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
        />
      </svg>
    </div>

    {/* Title */}
    <h3 className="text-sm font-semibold text-foreground mb-1">
      No sessions yet
    </h3>

    {/* Description */}
    <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
      Start a practice session to track your progress and build exam readiness.
    </p>

    {/* Action */}
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-sm bg-primary text-white px-4 py-2 text-[13px] font-medium cursor-pointer hover:bg-[#1535A8] transition-colors duration-150"
    >
      Start Session
    </button>
  </div>
)
