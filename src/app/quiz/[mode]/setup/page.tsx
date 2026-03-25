import { notFound } from 'next/navigation'
import type { QuizMode } from '@/types/quiz-config'
import { SetupPageClient } from './client'

const VALID_MODES: QuizMode[] = [
  'camp', 'chill', 'subject', 'focused', 'custom', 'storm', 'fullexam', 'extended',
]

interface SetupPageProps {
  params: Promise<{ mode: string }>
}

const QuizSetupPage = async ({ params }: SetupPageProps) => {
  const { mode } = await params

  if (!VALID_MODES.includes(mode as QuizMode)) {
    notFound()
  }

  return <SetupPageClient mode={mode as QuizMode} />
}

export default QuizSetupPage
