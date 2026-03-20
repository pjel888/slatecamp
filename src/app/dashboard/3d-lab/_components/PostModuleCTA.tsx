'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

interface PostModuleCTAProps {
  topicSlug?: string
  topicName: string
  questionsAnswered: number
  questionsCorrect: number
  aleQuestionCount?: number
}

export const PostModuleCTA = ({
  topicSlug,
  topicName,
  questionsAnswered,
  questionsCorrect,
  aleQuestionCount,
}: PostModuleCTAProps) => {
  const accuracy = questionsAnswered > 0
    ? Math.round((questionsCorrect / questionsAnswered) * 100)
    : 0

  return (
    <div className="p-4 bg-white border-t border-zinc-200">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-zinc-400 mb-2">
        Module Complete
      </p>
      <p className="text-[13px] text-zinc-600 mb-3">
        {questionsAnswered > 0
          ? `${questionsCorrect}/${questionsAnswered} in-canvas questions correct (${accuracy}%).`
          : 'Exploration complete.'
        }
        {aleQuestionCount != null && ` This topic typically appears as ~${aleQuestionCount} ALE questions per sitting.`}
      </p>
      {topicSlug && (
        <Link
          href={`${ROUTES.REVIEW}?topic=${topicSlug}&mode=camp&count=10`}
          className="block w-full py-2.5 bg-[#1B3FC4] text-white text-center text-[13px] font-medium rounded-sm hover:bg-[#1535A8] transition-colors duration-150"
        >
          Answer 10 questions on {topicName} in Camp Mode
        </Link>
      )}
    </div>
  )
}
