import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { QuizSessionConfig, EndSessionResult, StaminaBlock, Recommendation } from '@/types/quiz-config'
import { MODE_PRESETS } from '@/lib/quiz/mode-presets'
import { analyzeStamina } from '@/lib/quiz/stamina-analysis'
import { getReviewData, getConfidenceMatrix } from '@/lib/actions/quiz-v2'
import { generateRecommendations } from '@/lib/actions/quiz-v2/generate-recommendations'
const PREDICTION_MODES = ['storm', 'fullexam', 'extended']
const shouldShowPrediction = (mode: string) => PREDICTION_MODES.includes(mode)
import type { QuizMode } from '@/types/quiz-config'

interface ResultsPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

/** Results page — server-rendered with client islands for animations */
const QuizResultsPage = async ({ params }: ResultsPageProps) => {
  const { mode, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
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

  // Check 24h delay for fullexam — compute from completed_at + config delay
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

  // Fetch interactions — compute counts from actual data (not session columns)
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('question_id, is_correct, time_spent_ms')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const allInteractions = interactions ?? []
  const answeredCount = allInteractions.length
  const correctCount = allInteractions.filter(
    (i: { is_correct: boolean }) => i.is_correct,
  ).length

  // Get readiness score from user_global_stats (current value)
  const { data: globalStats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  const readinessScoreAfter = globalStats?.global_readiness_score ?? 0

  // Get the most recent snapshot before this session for delta calculation
  const { data: priorSnapshot } = await supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', user.id)
    .lt('created_at', session.started_at)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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

  // Fetch review data for inline question review
  let reviewData
  try {
    reviewData = await getReviewData(sessionId)
  } catch {
    // If review data fails to load, render with empty questions
    reviewData = null
  }

  // Fetch confidence matrix data (skip for chill mode — no confidence input)
  let confidenceMatrix = null
  if (config.mode !== 'chill') {
    try {
      confidenceMatrix = await getConfidenceMatrix(sessionId)
    } catch {
      // Non-critical — render without confidence matrix
      confidenceMatrix = null
    }
  }

  // Fetch prediction data if this mode supports predictions
  const quizMode = mode as QuizMode
  let predictionData: { predictionScore: number; postdictionScore: number | null } | null = null

  if (shouldShowPrediction(quizMode)) {
    const { data: prediction } = await supabase
      .from('session_predictions')
      .select('prediction_score, postdiction_score')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (prediction) {
      predictionData = {
        predictionScore: prediction.prediction_score,
        postdictionScore: prediction.postdiction_score,
      }
    }
  }

  // Generate feed-forward recommendations
  let recommendations: Recommendation[] = []
  try {
    recommendations = await generateRecommendations(user.id, sessionId, 3)
  } catch {
    // Non-critical — render without recommendations
    recommendations = []
  }

  const ResultsDashboard = (await import('@/components/quiz-v2/results/ResultsDashboard')).default

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
