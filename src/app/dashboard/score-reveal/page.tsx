import { redirect } from 'next/navigation'
import { getAssessmentResults } from '@/lib/actions/assessment'
import { recommendTrail } from '@/lib/queries/trails'
import { checkScoreRevealAccess, markScoreRevealed } from '@/lib/paywall/score-reveal'
import { trackServerEvent } from '@/lib/analytics-server'
import { createClient, getUser } from '@/lib/supabase/server'
import ScoreReveal from '@/components/assessment/ScoreReveal'

const ScoreRevealPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const results = await getAssessmentResults()
  if (!results) {
    redirect('/dashboard/assessment')
  }

  // Score reveal "shown once" enforcement for free users
  const revealAccess = await checkScoreRevealAccess(user.id)
  if (!revealAccess.canView) {
    redirect('/dashboard')
  }

  // Mark as shown (fire-and-forget) and track funnel event
  void markScoreRevealed(user.id)
  const scoreZone =
    results.score >= 75 ? 'high' : results.score >= 50 ? 'mid' : 'low'
  void trackServerEvent('score_reveal_viewed', {
    score: results.score,
    zone: scoreZone,
    is_first_view: true,
    time_to_render_ms: 0,
  })

  // Check retaker status and recommend trail in parallel
  const supabase = await createClient()
  const [{ data: stats }, recommendation] = await Promise.all([
    supabase
      .from('user_global_stats')
      .select('exam_attempt_number, previous_exam_result')
      .eq('user_id', user.id)
      .single(),
    recommendTrail(),
  ])

  const isRetaker =
    (stats?.exam_attempt_number && stats.exam_attempt_number > 1) ||
    stats?.previous_exam_result === 'failed'

  return (
    <main
      className="min-h-screen bg-muted"
    >
      <ScoreReveal
        score={results.score}
        subjectScores={results.subjectScores}
        recommendation={recommendation}
        isRetaker={!!isRetaker}
      />
    </main>
  )
}

export default ScoreRevealPage
