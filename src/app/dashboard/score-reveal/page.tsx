import { redirect } from 'next/navigation'
import { getAssessmentResults } from '@/lib/actions/assessment'
import { recommendTrail } from '@/lib/actions/trails'
import { checkScoreRevealAccess, markScoreRevealed } from '@/lib/paywall/score-reveal'
import { trackServerEvent } from '@/lib/analytics-server'
import { getUser } from '@/lib/supabase/server'
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
    // Free user already saw the reveal — redirect to dashboard with locked state
    redirect('/dashboard')
  }

  // Mark as shown (fire-and-forget) and track funnel event
  void markScoreRevealed(user.id)
  void trackServerEvent('score_reveal_viewed', { score: results.score })

  const recommendation = await recommendTrail()

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: '#F8F7F5' }}
    >
      <ScoreReveal
        score={results.score}
        subjectScores={results.subjectScores}
        recommendation={recommendation}
      />
    </main>
  )
}

export default ScoreRevealPage
