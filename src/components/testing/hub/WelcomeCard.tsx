'use client'

import Link from 'next/link'
import { BookOpen } from '@phosphor-icons/react/dist/ssr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const WelcomeCard = () => (
  <Card
    className="rounded-lg p-5 border-l-[3px] border-l-[var(--primary)] bg-[#EEF2FC] border border-[var(--border)]"
    style={{ borderLeftColor: 'var(--primary)' }}
    aria-label="Welcome to your study sessions"
  >
    <div className="flex items-start gap-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[var(--primary)]/10"
        aria-hidden="true"
      >
        <BookOpen className="h-4 w-4 text-[var(--primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-1"
          aria-hidden="true"
        >
          Getting started
        </p>
        <h2 className="text-[18px] font-semibold text-[var(--foreground)] leading-snug mb-2">
          Welcome to your study sessions
        </h2>
        <p className="text-[14px] font-normal text-[var(--text-secondary)] leading-relaxed mb-4">
          Camp Mode is the best place to start — you&apos;ll get instant
          feedback and explanations on every question. No timer, no pressure.
        </p>
        <Link
          href="/dashboard/testing/camp/setup"
          className="inline-flex items-center justify-center rounded-sm px-3 py-2 text-[13px] font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all duration-150 ease-out active:scale-[0.98]"
        >
          Start your first session
        </Link>
      </div>
    </div>
  </Card>
)

WelcomeCard.displayName = 'WelcomeCard'

export { WelcomeCard }
