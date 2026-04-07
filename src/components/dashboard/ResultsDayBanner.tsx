'use client'

import { useTransition } from 'react'
import { bannerConfirmPasser, bannerConfirmNonPasser } from '@/lib/actions/results-day'

const ResultsDayBanner = () => {
  const [isPassing, startPasserTransition] = useTransition()
  const [isReviewing, startNonPasserTransition] = useTransition()

  const handlePassed = () => {
    startPasserTransition(async () => {
      await bannerConfirmPasser()
    })
  }

  const handleNextCycle = () => {
    startNonPasserTransition(async () => {
      await bannerConfirmNonPasser()
    })
  }

  const isLoading = isPassing || isReviewing

  return (
    <div
      className="rounded-md border border-primary/20 bg-primary-50 px-4 py-3"
      role="alert"
      aria-label="PRC results notification"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
            aria-hidden
          >
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              PRC results are expected.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Have you checked{' '}
              <a
                href="https://online.prc.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-primary transition-colors duration-150"
              >
                online.prc.gov.ph
              </a>
              ?
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePassed}
            disabled={isLoading}
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700 disabled:opacity-60"
          >
            {isPassing ? 'Saving…' : 'I Passed!'}
          </button>
          <button
            type="button"
            onClick={handleNextCycle}
            disabled={isLoading}
            className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {isReviewing ? 'Saving…' : "I'll review again next cycle"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsDayBanner
