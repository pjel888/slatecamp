'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { InProgressSessionInfo } from '@/types/testing'

interface InProgressBannerProps {
  session: InProgressSessionInfo
  onAbandon?: () => void
}

const InProgressBanner = ({ session, onAbandon }: InProgressBannerProps) => {
  const [isAbandoning, setIsAbandoning] = useState(false)

  const SOURCE_TO_V2_MODE: Record<string, string> = {
    camp_mode: 'camp',
    chill_mode: 'chill',
    subject_mode: 'subject',
    focus_review: 'focused',
    custom_session: 'custom',
    storm_mode: 'storm',
    proof_simulation: 'fullexam',
    extended_practice: 'extended',
    assessment_quiz: 'camp',
    trail_quiz: 'camp',
    blindspot_queue: 'focused',
  }
  const v2Mode = SOURCE_TO_V2_MODE[session.source] ?? 'camp'
  const resumeHref = `/quiz/${v2Mode}/session/${session.sessionId}`

  const handleAbandon = () => {
    setIsAbandoning(true)
    onAbandon?.()
  }

  return (
    <div
      role="banner"
      aria-live="polite"
      aria-label="Session in progress"
      className="w-full border-b px-6 py-2.5"
      style={{
        backgroundColor: '#EEF2FC',
        borderBottomColor: 'rgba(27, 63, 196, 0.2)',
      }}
    >
      <div className="mx-auto flex max-w-[960px] items-center gap-3 flex-wrap">
        {/* Status dot */}
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)] animate-pulse"
          aria-hidden="true"
        />

        {/* Session info text */}
        <p
          className="text-[13px] font-normal flex-1 min-w-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          You have a session in progress —{' '}
          <span
            className="font-medium"
            style={{ color: 'var(--foreground)' }}
          >
            {session.modeLabel}
          </span>
          ,{' '}
          <span aria-label={`${session.currentIndex} of ${session.totalQuestions} questions answered`}>
            {session.currentIndex}/{session.totalQuestions} questions answered
          </span>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={resumeHref}
            className="inline-flex items-center justify-center rounded-sm px-2.5 py-1.5 text-[12px] font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all duration-150 ease-out"
          >
            Resume
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="xs"
                className="rounded-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                disabled={isAbandoning}
                aria-label="Abandon in-progress session"
              >
                Abandon
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="rounded-lg max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
                  Abandon this session?
                </AlertDialogTitle>
                <AlertDialogDescription
                  className="text-[14px] font-normal leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Your progress on this session will be lost. Any answers
                  you&apos;ve submitted are already saved to your mastery
                  data.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel
                  className="rounded-sm text-[13px]"
                >
                  Keep going
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="rounded-sm bg-destructive text-white hover:bg-[#C03C3C] text-[13px]"
                  onClick={handleAbandon}
                >
                  Yes, abandon
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

InProgressBanner.displayName = 'InProgressBanner'

export { InProgressBanner }
