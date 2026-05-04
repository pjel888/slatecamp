import type { WikiMistakeCardRawProps } from '@/types/wiki'

/**
 * Normalize raw MDX props into the canonical WikiMistakeProps shape.
 *
 * Handles three conventions found across the article corpus:
 *   A) NEW (154 articles):  mistake, correction, context
 *   B) OLD (2 articles):    number, title, wrongValue, correctValue, explanation, sourceRef
 *   C) BODY (9 articles):   title, body
 */
function normalizeMistakeProps(index: number, raw: WikiMistakeCardRawProps) {
  const n = raw.number ?? index + 1

  if (raw.mistake || raw.correction || raw.context) {
    // Convention A: compose-step output
    return {
      number: n,
      title: raw.title || raw.mistake || 'Common Mistake',
      wrongValue: raw.mistake || raw.wrongValue || raw.title || 'Common error',
      correctValue: raw.correction || raw.correctValue || 'Review the correct approach',
      explanation: raw.context || raw.explanation || '',
      sourceRef: raw.sourceRef,
    }
  }

  if (raw.body) {
    // Convention C: title+body format
    return {
      number: n,
      title: raw.title || 'Common Mistake',
      wrongValue: raw.body,
      correctValue: 'Review the correct approach',
      explanation: raw.body,
      sourceRef: raw.sourceRef,
    }
  }

  // Convention B: original contract (or fallback)
  return {
    number: n,
    title: raw.title || 'Common Mistake',
    wrongValue: raw.wrongValue || 'Common error',
    correctValue: raw.correctValue || 'Review the correct approach',
    explanation: raw.explanation || '',
    sourceRef: raw.sourceRef,
  }
}

export const WikiMistakeCard = (raw: WikiMistakeCardRawProps & { __index?: number }) => {
  const props = normalizeMistakeProps(raw.__index ?? 0, raw)
  const { number, title, wrongValue, correctValue, explanation, sourceRef } = props
  return (
    <div className="not-prose border border-camp-red rounded-md overflow-hidden my-3">
      {/* Red header — full title, no truncation */}
      <div className="bg-camp-red px-4 py-2.5 flex items-start gap-2.5">
        <span className="font-[var(--font-dm-mono)] text-[11px] font-medium text-white/70 shrink-0 pt-px">
          #{number}
        </span>
        <span className="text-[13px] font-semibold text-white leading-snug">
          {title}
        </span>
      </div>

      {/* Body — stacked layout for full-length text */}
      <div className="p-4 bg-card space-y-3 dark:bg-wiki-ink">
        {/* Wrong / Correct side-by-side on wide, stacked on narrow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Wrong value */}
          <div>
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-camp-red mb-1">
              Students Write
            </div>
            <p className="text-[14px] font-semibold text-camp-red leading-snug">
              {wrongValue}
            </p>
          </div>

          {/* Correct value */}
          <div>
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-camp-green mb-1">
              Correct{sourceRef ? ` (${sourceRef} IRR)` : ''}
            </div>
            <p className="text-[14px] font-semibold text-camp-green leading-snug">
              {correctValue}
            </p>
          </div>
        </div>

        {/* Explanation — full text, never truncated */}
        <div className="pt-2 border-t border-wiki-divider dark:border-wiki-invert-divider">
          <p className="text-[13px] text-ink-muted leading-relaxed dark:text-wiki-muted">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  )
}
