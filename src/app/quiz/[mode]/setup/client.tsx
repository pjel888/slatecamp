'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SetupFlow } from '@/components/quiz-v2/setup/SetupFlow'
import type { QuizMode, QuizSessionConfig } from '@/types/quiz-config'
import { startSession } from '@/lib/actions/quiz-v2'

interface SetupPageClientProps {
  mode: QuizMode
}

export const SetupPageClient = ({ mode }: SetupPageClientProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBegin = async (config: QuizSessionConfig) => {
    setLoading(true)
    try {
      const result = await startSession({ mode, config })
      if ('error' in result) {
        setLoading(false)
        return
      }
      router.push(`/quiz/${mode}/session/${result.sessionId}`)
    } catch {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-border-default border-t-camp-cobalt animate-spin" />
          <p className="text-ink-secondary text-sm">Preparing your session...</p>
        </div>
      </div>
    )
  }

  return <SetupFlow mode={mode} onBegin={handleBegin} onBack={handleBack} />
}
