'use client'
import React, { useState, useEffect } from 'react'
import { TestingHub } from '@/components/dashboard/TestingHub'
import { QuizRenderer } from '@/components/dashboard/QuizRenderer'
import { ModeIntroScreen } from '@/components/dashboard/ModeIntroScreen'
import { createQuizSession, deleteQuizSession, getSessionQuestions, getSessionInteractions, getUserReadinessScore, getQuestionsByTopic, getMostDecayedNode, selectContextualVariationQuestions } from '@/lib/actions/quiz'
import { trackEvent } from '@/lib/analytics'
import type { QuizSession, Question, TaxonomyNode, TestMode } from '@/types/app'
import type { ModeStats } from '@/lib/actions/testing'
import { useRouter, useSearchParams } from 'next/navigation'

interface CampDashboardProps {
  initialSession: QuizSession | null
  disciplineId: string
  disciplineName: string
  subjects: TaxonomyNode[]
  allQuestionIds: string[]
  modeStats: Record<string, ModeStats>
  totalCompletedSessions: number
}

type ViewState = 'hub' | 'intro' | 'quiz'

export function CampDashboard({
  initialSession,
  disciplineId,
  disciplineName,
  subjects,
  allQuestionIds,
  modeStats,
  totalCompletedSessions,
}: CampDashboardProps) {
  const [session, setSession] = useState<QuizSession | null>(initialSession)
  const [questions, setQuestions] = useState<Question[]>([])
  const [interactions, setInteractions] = useState<any[]>([])
  const [view, setView] = useState<ViewState>('hub')
  const [loading, setLoading] = useState(false)
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [readinessScore, setReadinessScore] = useState(0)
  const [decayedNode, setDecayedNode] = useState<{ nodeId: string; nodeName: string; masteryScore: number } | null>(null)
  
  // Bug 3: Store config during orientation
  const [pendingConfig, setPendingConfig] = useState<{
    mode: string,
    count: number,
    subjectIds?: string[],
    topicIds?: string[],
    instantFeedback?: boolean,
    config?: any
  } | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    getUserReadinessScore().then(setReadinessScore)
    getMostDecayedNode(disciplineId).then(setDecayedNode)
  }, [disciplineId])

  // Handle article-driven or targeted sessions
  useEffect(() => {
    const articleId = searchParams.get('articleId')
    const topicId = searchParams.get('topicId')
    const subjectId = searchParams.get('subjectId')

    if ((articleId || topicId || subjectId) && !loading && view === 'hub') {
      handleStartSession({ 
        mode: 'camp', 
        count: 5,
        topicIds: topicId ? [topicId] : undefined,
        subjectIds: subjectId ? [subjectId] : undefined,
        config: { isSubjectMode: true }
      })
    }
  }, [searchParams])

  // Bug 3: Interstitial Intro Logic
  const handleStartSession = (config: { 
    mode: string, 
    subjectIds?: string[], 
    topicIds?: string[],
    count?: number, 
    instantFeedback?: boolean,
    config?: any
  }) => {
    setPendingConfig({
      mode: config.mode,
      count: config.count || (config.mode === 'proof_sim' ? 100 : 10),
      subjectIds: config.subjectIds,
      topicIds: config.topicIds,
      instantFeedback: config.instantFeedback,
      config: config.config
    })
    setView('intro')
  }

  const confirmStartSession = async () => {
    if (!pendingConfig) return
    
    setLoading(true)
    try {
      if (session) {
        await deleteQuizSession(session.session_id)
      }

      let selectedIds: string[] = []

      // Feature 5: Contextual Variation — if flag is set and we have topic IDs
      if (pendingConfig.config?.contextual_variation && pendingConfig.topicIds?.length) {
        selectedIds = await selectContextualVariationQuestions(
          pendingConfig.topicIds,
          pendingConfig.count,
        )
      }

      // If we have targeted topics/subjects, fetch specific questions
      if (selectedIds.length === 0 && (pendingConfig.topicIds?.length || pendingConfig.subjectIds?.length)) {
        const targetId = pendingConfig.topicIds?.[0] || pendingConfig.subjectIds?.[0]
        if (targetId) {
          selectedIds = await getQuestionsByTopic(targetId, pendingConfig.count)
        }
      }

      // Fallback to general shuffle if no targeted questions found or provided
      if (selectedIds.length === 0) {
        const shuffled = [...allQuestionIds].sort(() => 0.5 - Math.random())
        selectedIds = shuffled.slice(0, pendingConfig.count)
      }

      const newSession = await createQuizSession({
        discipline_id: disciplineId,
        test_mode: pendingConfig.mode as TestMode,
        question_ids: selectedIds,
        subject_ids: pendingConfig.subjectIds,
        topic_ids: pendingConfig.topicIds,
        config: pendingConfig.config
      })

      const [qData, iData] = await Promise.all([
        getSessionQuestions(newSession.question_ids),
        getSessionInteractions(newSession.session_id)
      ])

      trackEvent({ event_name: 'quiz_session_started', event_properties: { test_mode: pendingConfig.mode, question_count: selectedIds.length }, session_id: newSession.session_id })

      setInstantFeedback(pendingConfig.instantFeedback !== false)
      setSession(newSession)
      setQuestions(qData)
      setInteractions(iData)
      setView('quiz')
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
      setPendingConfig(null)
    }
  }

  const handleResumeSession = async () => {
    if (!session) return
    setLoading(true)
    try {
      const [qData, iData] = await Promise.all([
        getSessionQuestions(session.question_ids),
        getSessionInteractions(session.session_id)
      ])
      setQuestions(qData)
      setInteractions(iData)
      setView('quiz')
    } catch (error) {
      console.error('Failed to resume session:', error)
    } finally {
      setLoading(false)
    }
  }

  // Bug 1: Exit handler passed to QuizRenderer
  const handleExitQuiz = () => {
    setView('hub')
    setSession(null)
    setQuestions([])
    setInteractions([])
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <div className="h-10 w-10 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 mt-4 font-medium tracking-tight">Preparing your session...</p>
      </div>
    )
  }

  if (view === 'hub') {
    return (
      <TestingHub
        initialSession={session}
        disciplineId={disciplineId}
        subjects={subjects}
        onStartSession={handleStartSession}
        onResumeSession={handleResumeSession}
        readinessScore={readinessScore}
        decayedNode={decayedNode}
        modeStats={modeStats}
        totalCompletedSessions={totalCompletedSessions}
      />
    )
  }

  if (view === 'intro' && pendingConfig) {
    return (
      <ModeIntroScreen 
        mode={pendingConfig.mode as TestMode}
        questionCount={pendingConfig.count}
        config={pendingConfig.config}
        onStart={confirmStartSession}
        onBack={() => setView('hub')}
      />
    )
  }

  return (
    <div className="w-full h-full bg-[#F8F7F5] overflow-y-auto">
      {session && (
        <QuizRenderer 
          session={session} 
          questions={questions} 
          initialInteractions={interactions}
          onExit={handleExitQuiz}
        />
      )}
    </div>
  )
}
