'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { SetupFlow } from '@/components/quiz-v2/setup/SetupFlow'
import { PredictionSlider, shouldShowPrediction } from '@/components/quiz-v2/PredictionSlider'
import { SlatecampLoader } from '@/components/shared/SlatecampLoader'
import type { QuizMode, QuizSessionConfig, TaxonomySubject } from '@/types/quiz-config'
import { startSession } from '@/lib/actions/quiz-v2'
import { useQuizStore } from '@/stores/useQuizStore'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'

interface SetupPageClientProps {
  mode: QuizMode
  subjects?: TaxonomySubject[]
}

type SetupPhase = 'setup' | 'creating' | 'prediction' | 'navigating'

export const SetupPageClient = ({ mode, subjects }: SetupPageClientProps) => {
  const router = useRouter()
  const [phase, setPhase] = useState<SetupPhase>('setup')
  const [error, setError] = useState<string | null>(null)
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null)

  // Reset store on setup mount to clear any leftover state from previous sessions
  useEffect(() => {
    useQuizStore.getState().reset()
    useQuizTimerStore.getState().resetTimer()
  }, [])

  const handleBegin = async (config: QuizSessionConfig) => {
    setPhase('creating')
    setError(null)
    try {
      const result = await startSession({ mode, config })
      if ('error' in result) {
        const actionError = result as { error: unknown; message?: string }
        setError(actionError.message ?? String(actionError.error))
        setPhase('setup')
        return
      }

      setCreatedSessionId(result.sessionId)

      // If this mode supports predictions, show the prediction slider
      if (shouldShowPrediction(mode)) {
        setPhase('prediction')
      } else {
        setPhase('navigating')
        router.push(`/quiz/${mode}/session/${result.sessionId}`)
      }
    } catch (err) {
      console.error('[quiz-setup] startSession failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setPhase('setup')
    }
  }

  const handlePredictionConfirm = useCallback(() => {
    if (!createdSessionId) return
    setPhase('navigating')
    router.push(`/quiz/${mode}/session/${createdSessionId}`)
  }, [createdSessionId, mode, router])

  const handleBack = () => {
    router.back()
  }

  if (phase === 'creating' || phase === 'navigating') {
    return <SlatecampLoader />
  }

  if (phase === 'prediction' && createdSessionId) {
    return (
      <div className="max-w-[560px] mx-auto px-4 py-8">
        <PredictionSlider
          sessionId={createdSessionId}
          mode={mode}
          onConfirm={handlePredictionConfirm}
        />
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="mx-auto max-w-[560px] px-4 pt-4">
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}
      <SetupFlow mode={mode} subjects={subjects} onBegin={handleBegin} onBack={handleBack} />
    </>
  )
}
