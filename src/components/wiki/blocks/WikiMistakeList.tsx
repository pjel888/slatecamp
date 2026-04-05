import { WikiMistakeCard } from './WikiMistakeCard'
import { parseMdxProp } from '../shared/parse-mdx-prop'
import { transformMistakeString } from '../shared/transform-mistake-string'
import type { WikiMistakeProps } from '@/types/wiki'

export const WikiMistakeList = ({ mistakes = [] }: { mistakes?: WikiMistakeProps[] | string[] | string }) => {
  const raw = parseMdxProp<(WikiMistakeProps | string)[]>(mistakes, [])
  const parsed = raw.map((item, i) =>
    typeof item === 'string' ? transformMistakeString(item, i) : item
  )
  if (parsed.length === 0) return null
  return (
    <div className="not-prose">
      {parsed.map((m) => <WikiMistakeCard key={m.number} {...m} />)}
    </div>
  )
}
