import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { checkProofSimulationGate } from '@/lib/proof-simulation/gate'
import { checkFeatureAccess } from '@/lib/paywall/check-access'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

/**
 * Proof Simulation Page — UX Strategy Section 14
 *
 * Shows either:
 * - Locked state with two progress bars (node coverage + endurance window)
 * - Pre-simulation briefing when unlocked
 *
 * "The Proof Run mirrors the real ALE. 150 questions. 4 hours.
 *  No pause, no feedback. Start when you're ready."
 */

const ProofSimulationPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  // Feature gate
  const access = await checkFeatureAccess('proof_simulation')
  if (!access.allowed) redirect('/dashboard/upgrade')

  const gate = await checkProofSimulationGate(user.id)

  // Calculate percentages for progress bars
  const nodePercent = gate.nodesRequired > 0
    ? Math.min(100, Math.round((gate.nodesCovered / gate.nodesRequired) * 100))
    : 0
  const endurancePercent = gate.enduranceRequired > 0
    ? Math.min(100, Math.round((gate.enduranceWindow / gate.enduranceRequired) * 100))
    : 0

  return (
    <SharedPageLayout>
      <div className="mx-auto w-full max-w-xl">
        {!gate.allowed ? (
          /* ── Locked State — UX Strategy: two progress bars toward unlock ── */
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
              Full Exam Simulation
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#1A2332]">
              The Proof Run unlocks when you&apos;re ready
            </h1>
            <p className="mt-2 text-sm text-[#4A5568] leading-relaxed">
              150 questions. 4 hours. Real exam conditions. Two gates must be met before the simulation becomes available.
            </p>

            {/* Gate 1: Node Coverage */}
            <div className="mt-8 rounded-md border border-[#D4DAE3] bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1A2332]">
                  Topic Coverage
                </span>
                <span className="font-[family-name:var(--font-dm-mono)] text-xs text-[#4A5568]">
                  {gate.nodesCovered} / {gate.nodesRequired}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EEF2FC]">
                <div
                  className="h-2 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${nodePercent}%`,
                    backgroundColor: nodePercent >= 100 ? '#2D9F6F' : '#1B3FC4',
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#8896A7]">
                {nodePercent >= 100
                  ? 'Topic coverage requirement met'
                  : `${70}% of taxonomy nodes must be at Developing level or above`}
              </p>
            </div>

            {/* Gate 2: Endurance Window */}
            <div className="mt-3 rounded-md border border-[#D4DAE3] bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1A2332]">
                  Endurance Window
                </span>
                <span className="font-[family-name:var(--font-dm-mono)] text-xs text-[#4A5568]">
                  {gate.enduranceWindow} / {gate.enduranceRequired} items
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#EEF2FC]">
                <div
                  className="h-2 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${endurancePercent}%`,
                    backgroundColor: endurancePercent >= 100 ? '#2D9F6F' : '#E8853A',
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-[#8896A7]">
                {endurancePercent >= 100
                  ? 'Endurance requirement met'
                  : 'Must cover 80% of exam duration at sustained accuracy'}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center text-sm text-[#4A5568] hover:text-[#1A2332] transition-colors duration-150"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        ) : (
          /* ── Unlocked: Pre-Simulation Briefing ── */
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#2D9F6F]">
              Ready
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#1A2332]">
              Full Exam Simulation
            </h1>
            <p className="mt-4 text-base text-[#4A5568] leading-relaxed">
              The Proof Run mirrors the real ALE. 150 questions. 4 hours.
              No feedback until completion. Your result will be your most honest score.
              It will take time and attention. Start when you&apos;re ready.
            </p>

            <div className="mt-6 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
              <p className="text-sm text-[#4A5568]">
                Timer runs as a progress bar, not a countdown.
                One 10-minute pause is allowed. No answer changes after confirmation.
                Full review available after completion.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/dashboard/testing?mode=proof_sim"
                className="inline-flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
                style={{ backgroundColor: '#1B3FC4' }}
              >
                Begin Proof Run
              </Link>
              <Link
                href="/dashboard"
                className="text-center text-sm text-[#4A5568] hover:text-[#1A2332] transition-colors duration-150"
              >
                Not now — back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </SharedPageLayout>
  )
}

export default ProofSimulationPage
