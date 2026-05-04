import { WikiMistakeCard } from './WikiMistakeCard'
import { parseMdxProp } from '../shared/parse-mdx-prop'
import { transformMistakeString } from '../shared/transform-mistake-string'
import type { WikiMistakeCardRawProps } from '@/types/wiki'

export const WikiMistakeList = (props: { mistakes?: WikiMistakeCardRawProps[] | string[] | string; items?: WikiMistakeCardRawProps[] | string[] | string }): React.ReactElement | null => {
  // Accept both 'mistakes' and 'items' as prop name (content uses both)
  const rawValue: WikiMistakeCardRawProps[] | string[] | string | undefined =
    props.mistakes ?? props.items
  const raw = parseMdxProp<(WikiMistakeCardRawProps | string)[]>(rawValue, [])
  const parsed = raw.map((item, i) =>
    typeof item === 'string' ? transformMistakeString(item, i) : item
  )
  if (parsed.length === 0) return null
  return (
    <div className="not-prose">
      {parsed.map((m, i) => (
        <WikiMistakeCard key={i} __index={i} {...m} />
      ))}
    </div>
  )
}
