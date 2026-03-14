'use client'
import React, { useState, useEffect } from 'react'
import { TestingHub } from '@/components/dashboard/TestingHub'
import { QuizRenderer } from '@/components/dashboard/QuizRenderer'
import { ModeIntroScreen } from '@/components/dashboard/ModeIntroScreen'
import { createQuizSession, deleteQuizSession, getSessionQuestions, getSessionInteractions, getUserReadinessScore } from '@/lib/actions/quiz'
import type { QuizSession, Question, TaxonomyNode, TestMode } from '@/types/app'
import { useRouter, useSearchParams } from 'next/navigation'

interface CampDashboardProps {
  initialSession: QuizSession | null
  disciplineId: string
  disciplineName: string
  subjects: TaxonomyNode[]
  allQuestionIds: string[]
}

type ViewState = 'hub' | 'intro' | 'quiz'

export function CampDashboard({ 
  initialSession, 
  disciplineId, 
  disciplineName, 
  subjects,
  allQuestionIds 
}: CampDashboardProps) {
  const [session, setSession] = useState<QuizSession | null>(initialSession)
  const [questions, setQuestions] = useState<Question[]>([])
  const [interactions, setInteractions] = useState<any[]>([])
  const [view, setView] = useState<ViewState>('hub')
  const [loading, setLoading] = useState(false)
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [readinessScore, setReadinessScore] = useState(0)
  
  // Bug 3: Store config during orientation
  const [pendingConfig, setPendingConfig] = useState<{
    mode: string,
    count: number,
    subjectIds?: string[],
    instantFeedback?: boolean
  } | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    getUserReadinessScore().then(setReadinessScore)
  }, [])

  // Handle article-driven sessions
  useEffect(() => {
    const articleId = searchParams.get('articleId')
    if (articleId && !loading && view === 'hub') {
      handleStartSession({ mode: 'camp', count: 5 })
    }
  }, [searchParams])

  // Bug 3: Interstitial Intro Logic
  const handleStartSession = (config: { 
    mode: string, 
    subjectIds?: string[], 
    count?: number, 
    instantFeedback?: boolean 
  }) => {
    setPendingConfig({
      mode: config.mode,
      count: config.count || (config.mode === 'proof_sim' ? 100 : 10),
      subjectIds: config.subjectIds,
      instantFeedback: config.instantFeedback
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

      const shuffled = [...allQuestionIds].sort(() => 0.5 - Math.random())
      const selectedIds = shuffled.slice(0, pendingConfig.count)

      const newSession = await createQuizSession({
        discipline_id: disciplineId,
        test_mode: pendingConfig.mode as TestMode,
        question_ids: selectedIds,
        subject_ids: pendingConfig.subjectIds
      })

      const [qData, iData] = await Promise.all([
        getSessionQuestions(newSession.question_ids),
        getSessionInteractions(newSession.session_id)
      ])

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
        subjects={subjects}
        onStartSession={handleStartSession}
        onResumeSession={handleResumeSession}
        readinessScore={readinessScore}
      />
    )
  }

  if (view === 'intro' && pendingConfig) {
    return (
      <ModeIntroScreen 
        mode={pendingConfig.mode as TestMode}
        questionCount={pendingConfig.count}
        onStart={confirmStartSession}
        onBack={() => setView('hub')}
      />
    )
  }

  return (
    <div className="w-full h-full bg-zinc-50 overflow-y-auto">
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
