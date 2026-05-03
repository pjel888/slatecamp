'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

interface PasserFlowProps {
  firstName: string | null
}

const SocialCard = ({ firstName }: { firstName: string | null }) => {
  const displayName = firstName ? `Arch. ${firstName}` : 'Arch.'

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-md p-8 text-center bg-primary"
      style={{ minHeight: '200px' }}
      aria-label="Shareable achievement card"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
        Licensure Examination for Architects (LEA)
      </p>
      <p className="text-2xl font-bold text-white leading-tight">
        {displayName}
      </p>
      <p className="mt-1 text-base font-semibold text-white/80">
        LEA Passer
      </p>
      <div
        className="mt-5 h-px w-16 bg-success"
        aria-hidden
      />
      <p className="mt-3 text-[11px] font-medium uppercase tracking-widest text-white/50">
        SlateCamp
      </p>
    </div>
  )
}

const PasserFlow = ({ firstName }: PasserFlowProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://slatecamp.ph/results-day')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — silent fail
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {/* Congratulations card */}
      <div className="rounded-md p-8 text-center bg-primary">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">
          Licensure Examination for Architects (LEA)
        </p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          Architect{firstName ? ` ${firstName}` : ''}. You did it.
        </h1>
        <p className="mt-3 text-sm text-white/75 leading-relaxed max-w-sm mx-auto">
          Your SlateCamp heatmap is now your professional reference library.
          The building codes you studied are the building codes you&apos;ll practice with.
        </p>
      </div>

      {/* Social share section */}
      <div className="rounded-md border border-border bg-card p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Share your achievement
          </p>
          <SocialCard firstName={firstName} />
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full rounded-sm border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-primary-50 hover:text-primary"
        >
          {copied ? 'Link copied!' : 'Copy share link'}
        </button>
      </div>

      {/* What's next */}
      <div className="rounded-md border border-border bg-card p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What&apos;s next
        </p>

        <Link
          href={ROUTES.dashboard.professional}
          className="flex items-center justify-between rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-primary-50"
        >
          <span>Open your Professional Reference hub</span>
          <svg
            className="h-4 w-4 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href={ROUTES.dashboard.root}
          className="flex items-center justify-between rounded-sm border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-primary-50"
        >
          <span>Go to your dashboard</span>
          <svg
            className="h-4 w-4 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default PasserFlow
