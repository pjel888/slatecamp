import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz | SlateCamp',
  description: 'Practice questions and test your knowledge.',
}

/** Minimal layout for quiz pages — no dashboard sidebar, full focus */
const QuizLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-surface-light">
      {children}
    </div>
  )
}

export default QuizLayout
