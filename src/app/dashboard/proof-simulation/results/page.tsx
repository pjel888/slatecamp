import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

/**
 * Proof Simulation Results — UX Strategy Section 14 (Steps 4-5)
 *
 * Two states based on timing:
 * 1. Cold Score (< 24 hours after completion):
 *    Single number. Zone color. "Detailed breakdown available tomorrow at [time].
 *    Let that sit tonight."
 *
 * 2. Full Analysis (>= 24 hours after completion):
 *    "Your daily score was 74. Your Proof Run returned 62. The 12-point gap is
 *    where preparation meets pressure."
 *
 * The 24-hour delay (Consolidation-Before-Analysis) is research-backed:
 * prevents panic-driven bad decisions from emotional processing.
 */

const getZoneColor = (score: number): string => {
  if (score < 40) return '#E63329'
  if (score < 70) return '#E8853A'
  if (score < 85) return '#1B7A3C'
  return '#1B3FC4'
}

const ProofSimulationResultsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>
}) => {
  const { session: sessionId } = await searchParams
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // Find the most recent proof simulation session
  const { data: proofSession } = await supabase
    .from('quiz_sessions')
    .select('session_id, completed_at, config')
    .eq('user_id', user.id)
    .eq('is_proof_simulation', true)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proofSession?.completed_at) {
    redirect('/dashboard/proof-simulation')
  }

  // Calculate time since completion
  const completedAt = new Date(proofSession.completed_at)
  const hoursSinceCompletion = (Date.now() - completedAt.getTime()) / (1000 * 60 * 60)
  const isFullAnalysisReady = hoursSinceCompletion >= 24

  // Get the proof score from readiness_score_snapshots
  const { data: snapshot } = await supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('session_id', proofSession.session_id)
    .eq('is_proof_simulation', true)
    .maybeSingle()

  const proofScore = Math.round(snapshot?.score ?? 0)
  const zoneColor = getZoneColor(proofScore)

  // Get the daily (non-proof) readiness score for comparison
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  const dailyScore = Math.round(stats?.global_readiness_score ?? 0)
  const pressureGap = dailyScore - proofScore

  // Calculate when full analysis unlocks
  const analysisUnlocksAt = new Date(completedAt.getTime() + 24 * 60 * 60 * 1000)
  const unlockTimeString = analysisUnlocksAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <SharedPageLayout>
      <div className="mx-auto w-full max-w-xl py-8">
        {!isFullAnalysisReady ? (
          /* ── Cold Score Delivery — the honest moment ── */
          <div className="text-center">
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-[#8896A7]">
              Proof Run Complete
            </p>

            {/* Single number. Zone color. */}
            <p
              className="mt-6 font-[family-name:var(--font-syne)] text-[72px] font-extrabold leading-none tabular-nums"
              style={{ color: zoneColor }}
            >
              {proofScore}%
            </p>

            {/* Passing threshold reference */}
            <div className="mt-6 mx-auto max-w-xs">
              <div className="h-2 w-full rounded-full bg-[#EEF2FC] relative">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, proofScore)}%`,
                    backgroundColor: zoneColor,
                  }}
                />
                {/* 70% passing threshold line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-[#1A2332]"
                  style={{ left: '70%' }}
                  title="Passing threshold"
                />
              </div>
              <p className="mt-1 text-xs text-[#8896A7] text-right" style={{ marginRight: '28%' }}>
                Passing
              </p>
            </div>

            {/* Delayed analysis message */}
            <p className="mt-8 text-base text-[#4A5568] max-w-sm mx-auto leading-relaxed">
              Detailed breakdown available tomorrow at {unlockTimeString}. Let that sit tonight.
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center justify-center rounded-sm px-8 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
              style={{ backgroundColor: '#1B3FC4' }}
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          /* ── Full Analysis — 24 hours later ── */
          <div>
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-[#8896A7]">
              Proof Run Analysis
            </p>

            <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#1A2332]">
              Your Proof Run
            </h1>

            {/* Score comparison */}
            <div className="mt-6 rounded-md border border-[#D4DAE3] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#8896A7]">Daily Score</p>
                  <p className="text-2xl font-bold text-[#1A2332]">{dailyScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#8896A7]">Pressure Gap</p>
                  <p className="text-2xl font-bold" style={{ color: pressureGap > 0 ? '#D64545' : '#2D9F6F' }}>
                    {pressureGap > 0 ? `-${pressureGap}` : `+${Math.abs(pressureGap)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8896A7]">Proof Score</p>
                  <p className="text-2xl font-bold" style={{ color: zoneColor }}>
                    {proofScore}%
                  </p>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <p className="mt-6 text-base text-[#4A5568] leading-relaxed">
              {pressureGap > 0
                ? `Your daily score was ${dailyScore}. Your Proof Run returned ${proofScore}. The ${pressureGap}-point gap is where preparation meets pressure. The next phase of the Trail is built around closing it.`
                : `Your Proof Run score of ${proofScore}% held steady under exam conditions. Your preparation is translating to performance under pressure.`
              }
            </p>

            {/* Full review CTA */}
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={`/dashboard/review?session=${proofSession.session_id}&review=true`}
                className="inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
                style={{ backgroundColor: '#1B3FC4' }}
              >
                Review All Questions
              </Link>
              <Link
                href="/dashboard"
                className="text-center text-sm text-[#4A5568] hover:text-[#1A2332] transition-colors duration-150"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </SharedPageLayout>
  )
}

export default ProofSimulationResultsPage
