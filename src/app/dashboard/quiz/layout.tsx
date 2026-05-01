import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz | SlateCamp',
  description: 'Build mastery through guided study, timed practice, and exam simulations.',
}

const DashboardQuizLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default DashboardQuizLayout
