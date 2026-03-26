import Link from 'next/link'

export interface WikiItem {
  text: string
  type: string
  source_ref?: string
}

interface WikiItemRendererProps {
  items: WikiItem[]
  /** ale_id of the parent node — used for the 3D Lab CTA link */
  aleId?: string | null
  /** If true, renders "See this in the 3D Lab →" CTA above the items */
  threeDLabLinked?: boolean
}

/**
 * Renders typed wiki_items from taxonomy_tree.wiki_items (JSONB array).
 * Each item has a `type` that controls its visual treatment.
 * WARNING items use full Warm Red background — must be impossible to miss.
 */
export const WikiItemRenderer = ({ items, aleId, threeDLabLinked }: WikiItemRendererProps) => {
  if (!items || items.length === 0) return null

  return (
    <div className="space-y-3">
      {/* 3D Lab CTA — shown at the TOP of article content when three_d_lab_linked = true */}
      {threeDLabLinked && aleId && (
        <div className="mb-5">
          <Link
            href={`/dashboard/3d-lab?node=${aleId}`}
            className="inline-flex items-center gap-2 bg-[#1B3FC4] hover:bg-[#1535A8] text-white text-sm font-semibold px-4 py-2 rounded-sm transition-colors duration-150 ease-out"
          >
            See this in the 3D Lab
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      {items.map((item, i) => (
        <WikiItemRow key={i} item={item} />
      ))}
    </div>
  )
}

const WikiItemRow = ({ item }: { item: WikiItem }) => {
  switch (item.type) {
    case 'heading':
      return (
        <h2 className="font-semibold text-lg text-[#1B3FC4] border-b border-[#D4DAE3] pb-2 mb-3 mt-5 first:mt-0">
          {item.text}
        </h2>
      )

    case 'fact':
      return (
        <p className="text-sm text-[#1A2332] leading-relaxed">
          <span className="mr-2 text-[#1B3FC4] select-none" aria-hidden="true">•</span>
          {item.text}
        </p>
      )

    case 'definition': {
      // Expects text in the form "Term — Definition body" or just a plain definition
      const dashIndex = item.text.indexOf(' — ')
      if (dashIndex !== -1) {
        const term = item.text.slice(0, dashIndex)
        const body = item.text.slice(dashIndex + 3)
        return (
          <p className="text-sm text-[#1A2332] leading-relaxed">
            <strong className="font-semibold">{term}</strong>
            {' — '}
            {body}
          </p>
        )
      }
      return (
        <p className="text-sm text-[#1A2332] leading-relaxed">
          {item.text}
        </p>
      )
    }

    case 'formula':
      return (
        <div className="font-mono bg-[#F8F7F5] p-3 rounded-md border border-[#D4DAE3] text-sm text-[#1A2332] leading-relaxed overflow-x-auto">
          {item.text}
        </div>
      )

    case 'code_provision':
      return (
        <div className="border border-[#1B3FC4]/20 bg-[#EEF2FC] rounded-md p-3">
          {item.source_ref && (
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#1B3FC4] block mb-1">
              {item.source_ref}
            </span>
          )}
          <p className="text-sm text-[#1A2332] leading-relaxed">{item.text}</p>
        </div>
      )

    case 'detail':
      return (
        <p className="pl-4 text-xs text-[#4A5568] leading-relaxed">
          {item.text}
        </p>
      )

    case 'exam_tip':
      return (
        <div className="border border-[#D4951A]/20 bg-[#FEF8ED] rounded-md p-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#D4951A] block mb-1">
            Exam Tip
          </span>
          <p className="text-sm text-[#1A2332] leading-relaxed">{item.text}</p>
        </div>
      )

    case 'cross_ref': {
      // text is expected to be "Label|slug" or just a label (no link if no slug)
      const pipeIndex = item.text.indexOf('|')
      const label = pipeIndex !== -1 ? item.text.slice(0, pipeIndex) : item.text
      const slug = pipeIndex !== -1 ? item.text.slice(pipeIndex + 1) : null
      if (slug) {
        return (
          <div>
            <Link
              href={`/dashboard/wiki/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B3FC4] bg-[#EEF2FC] hover:bg-[#1B3FC4] hover:text-white px-2.5 py-1 rounded-sm transition-colors duration-150 ease-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {label}
            </Link>
          </div>
        )
      }
      return (
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4A5568] bg-[#F8F7F5] px-2.5 py-1 rounded-sm border border-[#D4DAE3]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {label}
          </span>
        </div>
      )
    }

    case 'warning':
      return (
        <div className="bg-[#D64545] text-white p-4 rounded-md">
          <span className="font-mono text-[9px] uppercase tracking-wider block mb-1 opacity-90">
            ⚠ Warning
          </span>
          <p className="text-sm leading-relaxed font-medium">{item.text}</p>
        </div>
      )

    default:
      // Graceful fallback for unknown types
      return (
        <p className="text-sm text-[#1A2332] leading-relaxed">
          {item.text}
        </p>
      )
  }
}
