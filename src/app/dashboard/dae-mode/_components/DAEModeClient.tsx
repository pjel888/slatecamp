'use client'

import { useState } from 'react'
import { WorkContextSelector } from './WorkContextSelector'
import { DAEQuizSession } from './DAEQuizSession'
import { saveDAEContexts, startDAESession } from '@/lib/actions/dae-mode'
import type { WorkContext, DAEQuestion } from '@/lib/actions/dae-mode'

// ─── Props ────────────────────────────────────────────────────────────────────

interface DAEModeClientProps {
  savedContexts: WorkContext[]
  userTier: 'free' | 'pro' | 'enterprise'
  dailyUsedCount: number
}

// ─── View states ──────────────────────────────────────────────────────────────

type View = 'hub' | 'session'

interface SessionState {
  sessionId: string
  questions: DAEQuestion[]
  totalQuestions: number
}

// ─── Component ────────────────────────────────────────────────────────────────

const DAEModeClient = ({
  savedContexts,
  userTier,
  dailyUsedCount,
}: DAEModeClientProps) => {
  const [view, setView] = useState<View>('hub')
  const [session, setSession] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFree = userTier === 'free'
  const dailyLimitReached = isFree && dailyUsedCount >= 5

  const handleBegin = async (contexts: WorkContext[]) => {
    setLoading(true)
    setError(null)

    // Persist selected contexts for next visit
    await saveDAEContexts(contexts)

    const result = await startDAESession(contexts)

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSession(result)
    setView('session')
    setLoading(false)
  }

  const handleExitSession = () => {
    setSession(null)
    setView('hub')
  }

  if (view === 'session' && session) {
    return (
      <DAEQuizSession
        sessionId={session.sessionId}
        questions={session.questions}
        onExit={handleExitSession}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[560px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-[22px] font-semibold text-foreground">
            DAE Maintenance Mode
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Stay current with the codes you use every day.
          </p>
        </div>

        {/* Free tier usage indicator */}
        {isFree && (
          <div className="mb-5 rounded-md border border-border bg-card px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground">Free plan</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {dailyUsedCount} of 5 questions used today
              </p>
            </div>
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    'w-2 h-2 rounded-full',
                    i < dailyUsedCount ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Daily limit reached */}
        {dailyLimitReached && (
          <div className="mb-5 rounded-md border border-warning/30 bg-warning-50 px-4 py-3">
            <p className="text-[13px] font-medium text-warning">Daily limit reached</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Upgrade to Pro for unlimited daily practice.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-md border border-destructive/20 bg-destructive-50 px-4 py-3">
            <p className="text-[13px] text-destructive">{error}</p>
          </div>
        )}

        {/* Context selector */}
        <div className="rounded-md border border-border bg-card px-4 py-5">
          <h2 className="text-[15px] font-semibold text-foreground mb-1">
            What are you working on this week?
          </h2>
          <WorkContextSelector
            initialSelected={savedContexts}
            onBegin={handleBegin}
            loading={loading || dailyLimitReached}
          />
        </div>

        {/* Session count context */}
        <p className="mt-4 text-[12px] text-muted-foreground text-center">
          10 questions per session · Filtered to your work context
        </p>
      </div>
    </div>
  )
}

DAEModeClient.displayName = 'DAEModeClient'

export { DAEModeClient }
