'use client'

import { WikiMistakeCard } from './WikiMistakeCard'
import { parseMdxProp } from './parse-mdx-prop'
import type { WikiMistakeProps } from '@/types/wiki'

export const WikiMistakeList = ({ mistakes = [] }: { mistakes?: WikiMistakeProps[] | string }) => {
  const parsed = parseMdxProp<WikiMistakeProps[]>(mistakes, [])
  if (parsed.length === 0) return null
  return (
    <div className="not-prose">
      {parsed.map((m) => <WikiMistakeCard key={m.number} {...m} />)}
    </div>
  )
}
