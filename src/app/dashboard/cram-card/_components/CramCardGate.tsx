'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

type Props = {
  totalSessions: number
}

const SESSIONS_REQUIRED = 20

export const CramCardGate = ({ totalSessions }: Props) => {
  const progressPct = Math.min((totalSessions / SESSIONS_REQUIRED) * 100, 100)

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto py-10">
      {/* Eyebrow */}
      <p className="font-mono text-[9px] text-primary tracking-widest uppercase">
        YOUR CRAM CARD
      </p>

      <h2 className="text-xl font-semibold text-foreground leading-snug">
        Your card isn&apos;t ready yet
      </h2>

      {/* Body */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Complete 20 study sessions to unlock your Cram Card. Your card will show the numerical
        values you keep getting wrong — personalized to your gaps.
      </p>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Sessions completed</span>
          <span className="font-mono text-xs text-primary">
            {totalSessions}/{SESSIONS_REQUIRED}
          </span>
        </div>
        <div className="h-2 rounded-sm bg-border overflow-hidden">
          <div
            className="h-full rounded-sm bg-primary transition-all duration-150 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        href={ROUTES.dashboard.quiz}
        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-700 transition-colors duration-150 ease-out"
      >
        Start a session to get closer →
      </Link>
    </div>
  )
}
