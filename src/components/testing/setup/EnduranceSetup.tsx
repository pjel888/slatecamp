'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

interface PreviousSession {
  session_id: string
  config: Record<string, unknown> | null
  completed_at: string | null
}

interface EnduranceSetupProps {
  userId: string
  previousSessions: PreviousSession[]
}

const EnduranceSetup = ({ previousSessions }: EnduranceSetupProps) => {
  const router = useRouter()
  const completedCount = previousSessions.length

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8">
      <Link
        href={ROUTES.TESTING}
        className="inline-flex items-center text-[14px] text-[#4A5568] hover:text-[#1B3FC4] transition-colors duration-150 ease-out mb-8"
      >
        ← Back to Review
      </Link>

      <div className="mb-8">
        <p className="text-[12px] font-medium uppercase tracking-wide text-[#8896A7] mb-1">
          Exam Readiness
        </p>
        <h1 className="text-[24px] font-semibold text-[#1A2332] mb-2">Design Endurance Training</h1>
        <p className="text-[15px] text-[#4A5568] leading-relaxed">
          Design is 40% of the ALE — and it&apos;s 3+ hours of scenario-based computation under pressure.
          Each scenario gives you a building brief with site data, then walks you through development
          controls calculations with hidden traps that mirror the real exam.
        </p>
      </div>

      <div className="space-y-6">
        {completedCount > 0 && (
          <div className="rounded-md border border-[#1B3FC4]/20 bg-[#EEF2FC] px-4 py-4">
            <p className="text-[13px] font-medium text-[#4A5568] mb-1">
              Progress
            </p>
            <p className="text-[14px] text-[#1A2332]">
              You&apos;ve completed{' '}
              <span className="font-medium">{completedCount} scenario sessions</span>.
              Each one builds your computation speed and trap awareness.
            </p>
          </div>
        )}

        <div className="rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-4 py-4">
          <p className="text-[14px] text-[#4A5568] leading-relaxed mb-3">
            12 design scenarios available — from single-family residence (foundational)
            to mixed-use high-rise (advanced). Each includes:
          </p>
          <ul className="text-[13px] text-[#4A5568] space-y-1.5 ml-4 list-disc">
            <li>Full building brief with site data and program</li>
            <li>Step-by-step computation questions (PSO, AMBF, TGFA, FLAR, etc.)</li>
            <li>Hidden traps that cascade across questions — just like the real ALE</li>
            <li>Solution breakdowns with code citations after each answer</li>
          </ul>
        </div>

        <Button
          variant="warmCta"
          size="lg"
          fullWidth
          onClick={() => router.push('/dashboard/area-c/design-quiz')}
          className="rounded-sm"
        >
          Choose a Scenario
        </Button>
      </div>
    </div>
  )
}

EnduranceSetup.displayName = 'EnduranceSetup'

export { EnduranceSetup }
