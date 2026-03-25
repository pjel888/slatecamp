'use client'

import Link from 'next/link'
import type { SubjectFloorAlert as SubjectFloorAlertType } from '@/types/dashboard'

interface SubjectFloorAlertProps {
  alerts: SubjectFloorAlertType[]
}

export const SubjectFloorAlert = ({ alerts }: SubjectFloorAlertProps) => {
  if (alerts.length === 0) return null

  const worst = alerts[0]
  const otherCount = alerts.length - 1

  return (
    <div className="rounded-md border border-[destructive]/30 bg-[#FDF0F0] px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[destructive]/10">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[destructive]">
            <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="6" cy="8" r="0.5" fill="currentColor" />
            <line x1="6" y1="4.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[text-primary]">
            Subject below passing floor
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[text-secondary]">
            <span className="font-semibold text-[destructive]">{worst.subject}</span>
            {' '}is at{' '}
            <span className="font-mono font-semibold text-[destructive]">{worst.mastery}%</span>
            {' '}&mdash; the ALE requires a minimum of {worst.floorPct}% per subject.
            {otherCount > 0 && (
              <span className="text-[text-secondary]">
                {' '}{otherCount} other {otherCount === 1 ? 'subject' : 'subjects'} also below floor.
              </span>
            )}
            {' '}A high overall score won&apos;t compensate.
          </p>
          <Link
            href="/dashboard/testing/camp/setup"
            className="mt-1.5 inline-block text-[11px] font-medium text-[camp-cobalt] underline underline-offset-2"
          >
            Start a {worst.subject} review &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
