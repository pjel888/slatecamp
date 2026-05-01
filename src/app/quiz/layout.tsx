import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz | SlateCamp',
  description: 'Practice questions and test your knowledge.',
}

/** Legacy redirect shell; canonical quiz UI lives under /dashboard/quiz. */
const QuizLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default QuizLayout
