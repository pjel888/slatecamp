import { notFound } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import type { QuizSessionConfig, EndSessionResult, StaminaBlock, Recommendation } from '@/types/quiz-config'
import { MODE_PRESETS } from '@/lib/quiz/mode-presets'
import { analyzeStamina } from '@/lib/quiz/stamina-analysis'
import { getReviewData, getConfidenceMatrix } from '@/lib/actions/quiz-v2'
import { generateRecommendations } from '@/lib/actions/quiz-v2/generate-recommendations'
import ResultsDashboard from '@/components/quiz-v2/results/ResultsDashboard'
const PREDICTION_MODES = ['storm', 'full_exam', 'endurance']
const shouldShowPrediction = (mode: string) => PREDICTION_MODES.includes(mode)
import type { QuizMode } from '@/types/quiz-config'

interface ResultsPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

/** Results page — server-rendered with client islands for animations */
const QuizResultsPage = async ({ params }: ResultsPageProps) => {
  const { mode, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await getUser()
  if (!user) notFound()

  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, config, question_ids, started_at, completed_at')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const config: QuizSessionConfig = (session.config as QuizSessionConfig) ??
    MODE_PRESETS[mode as keyof typeof MODE_PRESETS] ?? MODE_PRESETS.camp

  // Check 24h delay for full_exam — compute from completed_at + config delay
  const delayHours = config.results.delayHours ?? 0
  if (delayHours > 0 && session.completed_at) {
    const resultsAvailableAt = new Date(
      new Date(session.completed_at).getTime() + delayHours * 60 * 60 * 1000,
    )
    if (resultsAvailableAt > new Date()) {
      const hoursLeft = Math.ceil((resultsAvailableAt.getTime() - Date.now()) / 3600000)
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-semibold text-ink-primary mb-3">
              Results Processing
            </h1>
            <p className="text-ink-secondary">
              Your exam simulation results will be available in {hoursLeft} hours.
            </p>
          </div>
        </div>
      )
    }
  }

  // Parallel: interactions, global stats, and prior snapshot are independent queries
  const [{ data: interactions }, { data: globalStats }, { data: priorSnapshot }] = await Promise.all([
    supabase
      .from('user_interactions')
      .select('question_id, is_correct, time_spent_ms')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', user.id)
      .lt('created_at', session.started_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const allInteractions = interactions ?? []
  const answeredCount = allInteractions.length
  const correctCount = allInteractions.filter(
    (i: { is_correct: boolean }) => i.is_correct,
  ).length

  const readinessScoreAfter = globalStats?.global_readiness_score ?? 0
  const readinessScoreBefore = priorSnapshot?.score ?? readinessScoreAfter

  const result: EndSessionResult = {
    score: {
      correct: correctCount,
      total: answeredCount,
      percent: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
    },
    subjectBreakdown: [],
    readinessScoreBefore,
    readinessScoreAfter,
    readinessScoreDelta: readinessScoreAfter - readinessScoreBefore,
    growthVsPrevious: null,
    resultsAvailableAt: new Date().toISOString(),
    trailDayCompleted: false,
    nextTrailDay: null,
    missedQuestionCount: ((session.question_ids as string[]) ?? []).length - answeredCount,
  }

  // Stamina blocks for extended/exam sessions
  let staminaBlocks: StaminaBlock[] | undefined
  if (config.results.showStaminaChart && allInteractions.length >= 50) {
    staminaBlocks = analyzeStamina(allInteractions)
  }

  // Parallel: review data, confidence matrix, prediction, and recommendations are independent
  const quizMode = mode as QuizMode

  const [reviewData, confidenceMatrix, predictionRow, recommendations] = await Promise.all([
    getReviewData(sessionId).catch(() => null),
    config.mode !== 'chill'
      ? getConfidenceMatrix(sessionId).catch(() => null)
      : Promise.resolve(null),
    shouldShowPrediction(quizMode)
      ? supabase
          .from('session_predictions')
          .select('prediction_score, postdiction_score')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }) => data)
      : Promise.resolve(null),
    generateRecommendations(user.id, sessionId, 3).catch((): Recommendation[] => []),
  ])

  const predictionData = predictionRow
    ? {
        predictionScore: predictionRow.prediction_score,
        postdictionScore: predictionRow.postdiction_score,
      }
    : null

  return (
    <ResultsDashboard
      sessionId={sessionId}
      result={result}
      config={config}
      staminaBlocks={staminaBlocks}
      confidenceMatrix={confidenceMatrix}
      reviewQuestions={reviewData?.questions ?? []}
      questionHistory={reviewData?.questionHistory}
      predictionData={predictionData}
      recommendations={recommendations}
    />
  )
}

export default QuizResultsPage
