'use client'

import PasserFlow from './PasserFlow'
import NonPasserFlow from './NonPasserFlow'

interface TopSubject {
  name: string
  score: number
}

interface ResultsDayClientProps {
  aleResult: string | null
  firstName: string | null
  readinessScore: number | null
  topSubjects: TopSubject[]
}

const ResultsDayClient = ({
  aleResult,
  firstName,
  readinessScore,
  topSubjects,
}: ResultsDayClientProps) => {
  if (aleResult === 'passed') {
    return <PasserFlow firstName={firstName} />
  }

  if (aleResult === 'failed') {
    return (
      <NonPasserFlow
        readinessScore={readinessScore}
        topSubjects={topSubjects}
      />
    )
  }

  // No result set yet — neutral state directing user to set outcome
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-md border border-[#D4DAE3] bg-white p-6 text-center">
        <p className="text-sm font-medium text-[#1A2332]">
          No result recorded yet.
        </p>
        <p className="mt-2 text-sm text-[#4A5568]">
          Return to your dashboard to update your result.
        </p>
      </div>
    </div>
  )
}

export default ResultsDayClient
