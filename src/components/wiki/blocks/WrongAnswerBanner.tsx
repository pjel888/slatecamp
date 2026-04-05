interface WrongAnswerBannerProps {
  fromWrongAnswer: boolean
  topicName: string | null
}

/**
 * Wrong-Answer Context Banner — UX Strategy Section 6
 * "You answered [wrong answer] on a question about [topic]. This article covers why."
 * Shown at the top of Wiki articles when arriving from a wrong answer.
 */

export const WrongAnswerBanner = ({ fromWrongAnswer, topicName }: WrongAnswerBannerProps) => {
  if (!fromWrongAnswer || !topicName) return null

  return (
    <div className="rounded-md border border-camp-orange bg-camp-orange/5 px-4 py-3 mb-6">
      <p className="text-sm text-text-primary">
        You answered a question about <span className="font-medium">{topicName}</span> incorrectly.
        This article covers why.
      </p>
    </div>
  )
}
