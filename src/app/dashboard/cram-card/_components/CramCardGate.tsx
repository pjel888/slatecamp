'use client'

import Link from 'next/link'

type Props = {
  totalSessions: number
}

const SESSIONS_REQUIRED = 20

export const CramCardGate = ({ totalSessions }: Props) => {
  const progressPct = Math.min((totalSessions / SESSIONS_REQUIRED) * 100, 100)

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto py-10">
      {/* Eyebrow */}
      <p className="font-mono text-[9px] text-[#1B3FC4] tracking-widest uppercase">
        YOUR CRAM CARD
      </p>

      {/* Heading */}
      <h1 className="text-xl font-semibold text-[#1A2332] leading-snug">
        Your card isn&apos;t ready yet
      </h1>

      {/* Body */}
      <p className="text-sm text-[#4A5568] leading-relaxed">
        Complete 20 study sessions to unlock your Cram Card. Your card will show the numerical
        values you keep getting wrong — personalized to your gaps.
      </p>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#4A5568]">Sessions completed</span>
          <span className="font-mono text-xs text-[#1B3FC4]">
            {totalSessions}/{SESSIONS_REQUIRED}
          </span>
        </div>
        <div className="h-2 rounded-sm bg-[#D4DAE3] overflow-hidden">
          <div
            className="h-full rounded-sm bg-[#1B3FC4] transition-all duration-150 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/testing"
        className="inline-flex items-center gap-1 text-sm text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150 ease-out"
      >
        Start a session to get closer →
      </Link>
    </div>
  )
}
