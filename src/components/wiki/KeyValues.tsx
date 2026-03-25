import { parseMdxProp } from './parse-mdx-prop'

interface KeyValueItem {
  value: string
  label: string
}

export const KeyValues = ({ items }: { items: KeyValueItem[] | string }) => {
  const parsed = parseMdxProp<KeyValueItem[]>(items, [])
  if (parsed.length === 0) return null
  return (
    <div className="not-prose grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 my-5">
      {parsed.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-[#E0DED8] rounded-[10px] px-4 py-4 text-center dark:bg-wiki-ink dark:border-[#3A3835]"
        >
          <div className="font-sans text-[28px] font-bold text-camp-cobalt leading-none mb-1">
            {item.value}
          </div>
          <div className="font-[var(--font-dm-mono)] text-[11px] text-ink-muted uppercase tracking-[0.06em] dark:text-[#A8A8A5]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
