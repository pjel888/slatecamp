import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Drills | SlateCamp',
  description: 'Build mastery through guided study, timed practice, and exam simulations.',
}

const DrillsLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default DrillsLayout
