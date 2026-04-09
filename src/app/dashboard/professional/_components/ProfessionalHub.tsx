'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { switchAccountMode } from '@/lib/actions/professional-mode'
import type { AccountMode } from '@/lib/actions/professional-mode'
import { ROUTES } from '@/lib/routes'

interface ProfessionalHubProps {
  accountMode: AccountMode
}

const ProfessionalHub = ({ accountMode }: ProfessionalHubProps) => {
  const [isSwitching, startSwitch] = useTransition()

  const handleReturnToReview = () => {
    startSwitch(async () => {
      await switchAccountMode('review_mode')
    })
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Professional Reference</h1>
        <p className="text-sm text-muted-foreground">
          The building codes you passed with are the building codes you'll practice with.
        </p>
      </div>

      {/* ── Main grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Wiki */}
        <Link
          href={ROUTES.wiki.root}
          className="rounded-md border border-border bg-card p-4 flex flex-col gap-2 shadow-none hover:shadow-sm transition-shadow duration-150 ease-out"
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">Knowledge Wiki</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Browse the full reference library — codes, standards, and practice fundamentals — organized the same way you studied.
          </p>
          <span className="text-xs font-medium text-primary mt-auto">Open Wiki →</span>
        </Link>

        {/* Code Update Alerts — placeholder */}
        <div className="rounded-md border border-border bg-background p-4 flex flex-col gap-2 shadow-none opacity-60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-warning-50 flex items-center justify-center shrink-0">
              <svg
                className="h-4 w-4 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">Code Update Alerts</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get notified when the codes and standards you practiced with are updated or amended.
          </p>
          <span className="text-xs text-muted-foreground mt-auto">Coming soon</span>
        </div>

        {/* CPD Tracker — placeholder */}
        <div className="rounded-md border border-border bg-background p-4 flex flex-col gap-2 shadow-none opacity-60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-success-50 flex items-center justify-center shrink-0">
              <svg
                className="h-4 w-4 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">CPD Tracker</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Log and track your Continuing Professional Development units required for PRC license renewal.
          </p>
          <span className="text-xs text-muted-foreground mt-auto">Coming soon</span>
        </div>

        {/* Campfire Community */}
        <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-2 shadow-none hover:shadow-sm transition-shadow duration-150 ease-out">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-foreground">Campfire Community</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Connect with fellow licensed professionals. Share practice insights, ask questions, and support the next cohort of reviewees.
          </p>
          <span className="text-xs text-muted-foreground mt-auto">Opening soon</span>
        </div>
      </div>

      {/* ── Mode switcher ───────────────────────────────── */}
      {accountMode === 'professional_mode' && (
        <div className="rounded-md border border-border bg-card px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-foreground">Returning to review?</p>
            <p className="text-xs text-muted-foreground">
              You can switch back to Study Mode at any time. Your progress is preserved.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReturnToReview}
            disabled={isSwitching}
            className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:border-primary hover:text-primary disabled:opacity-60 shrink-0"
          >
            {isSwitching ? 'Switching…' : 'Switch to Study Mode'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfessionalHub
