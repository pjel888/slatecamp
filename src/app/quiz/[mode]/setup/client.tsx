'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SetupFlow } from '@/components/quiz-v2/setup/SetupFlow'
import { CampfireLoader } from '@/components/shared/CampfireLoader'
import type { QuizMode, QuizSessionConfig, TaxonomySubject } from '@/types/quiz-config'
import { startSession } from '@/lib/actions/quiz-v2'

interface SetupPageClientProps {
  mode: QuizMode
  subjects?: TaxonomySubject[]
}

export const SetupPageClient = ({ mode, subjects }: SetupPageClientProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleBegin = async (config: QuizSessionConfig) => {
    setLoading(true)
    setError(null)
    try {
      const result = await startSession({ mode, config })
      if ('error' in result) {
        setError(String((result as { error: unknown }).error))
        setLoading(false)
        return
      }
      router.push(`/quiz/${mode}/session/${result.sessionId}`)
    } catch (err) {
      console.error('[quiz-setup] startSession failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to start session')
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return <CampfireLoader />
  }

  return (
    <>
      {error && (
        <div className="mx-auto max-w-[560px] px-4 pt-4">
          <div className="rounded-md border border-[#D64545]/20 bg-[#FDF0F0] px-4 py-3 text-sm text-[#D64545]">
            {error}
          </div>
        </div>
      )}
      <SetupFlow mode={mode} subjects={subjects} onBegin={handleBegin} onBack={handleBack} />
    </>
  )
}
