'use client'
import React, { useState, useEffect } from 'react'
import { TestingHub } from '@/components/dashboard/TestingHub'
import { QuizRenderer } from '@/components/dashboard/QuizRenderer'
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
  const [view, setView] = useState<'hub' | 'quiz'>('hub')
  const [loading, setLoading] = useState(false)
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [readinessScore, setReadinessScore] = useState(0)
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

  const handleStartSession = async (config: { 
    mode: string, 
    subjectIds?: string[], 
    count?: number, 
    instantFeedback?: boolean 
  }) => {
    setLoading(true)
    try {
      // If there's an existing session, delete it first to start fresh
      if (session) {
        await deleteQuizSession(session.session_id)
      }

      // 1. Filter and pick questions
      // For now, we'll just shuffle all and take 'count' (default 5 for Camp)
      const count = config.count || 5
      const shuffled = [...allQuestionIds].sort(() => 0.5 - Math.random())
      const selectedIds = shuffled.slice(0, count)

      // 2. Create the session
      const newSession = await createQuizSession({
        discipline_id: disciplineId,
        test_mode: config.mode as TestMode,
        question_ids: selectedIds,
        subject_ids: config.subjectIds
      })

      // 3. Prepare data
      const [qData, iData] = await Promise.all([
        getSessionQuestions(newSession.question_ids),
        getSessionInteractions(newSession.session_id)
      ])

      setInstantFeedback(config.instantFeedback !== false)
      setSession(newSession)
      setQuestions(qData)
      setInteractions(iData)
      setView('quiz')
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="w-full h-full bg-zinc-50 overflow-y-auto">
      {session && (
        <QuizRenderer 
          session={session} 
          questions={questions} 
          initialInteractions={interactions} 
        />
      )}
    </div>
  )
}
