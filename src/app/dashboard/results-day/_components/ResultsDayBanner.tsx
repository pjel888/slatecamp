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
      className="rounded-md border border-[#1B3FC4]/20 bg-[#EEF2FC] px-4 py-3"
      role="alert"
      aria-label="PRC results notification"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#1B3FC4' }}
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
            <p className="text-sm font-medium text-[#1A2332]">
              PRC results are expected.
            </p>
            <p className="text-xs text-[#4A5568] mt-0.5">
              Have you checked{' '}
              <a
                href="https://online.prc.gov.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[#1B3FC4] transition-colors duration-150"
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
            className="rounded-sm bg-[#1B3FC4] px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8] disabled:opacity-60"
          >
            {isPassing ? 'Saving…' : 'I Passed!'}
          </button>
          <button
            type="button"
            onClick={handleNextCycle}
            disabled={isLoading}
            className="rounded-sm border border-[#D4DAE3] bg-white px-3 py-1.5 text-xs font-medium text-[#4A5568] transition-colors duration-150 ease-out hover:border-[#1B3FC4] hover:text-[#1B3FC4] disabled:opacity-60"
          >
            {isReviewing ? 'Saving…' : "I'll review again next cycle"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsDayBanner
