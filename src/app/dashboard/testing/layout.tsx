import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Review & Testing | SlateCamp',
  description: 'Build mastery through guided study, timed practice, and exam simulations.',
}

const TestingLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default TestingLayout
