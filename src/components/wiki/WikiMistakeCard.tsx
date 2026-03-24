import type { WikiMistakeProps } from '@/types/wiki'

export const WikiMistakeCard = ({ number, title, wrongValue, correctValue, explanation, sourceRef }: WikiMistakeProps) => {
  return (
    <div className="not-prose border border-[#E63329] rounded-md overflow-hidden my-3">
      {/* Red header — full title, no truncation */}
      <div className="bg-[#E63329] px-4 py-2.5 flex items-start gap-2.5">
        <span className="font-[var(--font-dm-mono)] text-[11px] font-medium text-white/70 shrink-0 pt-px">
          #{number}
        </span>
        <span className="text-[13px] font-semibold text-white leading-snug">
          {title}
        </span>
      </div>

      {/* Body — stacked layout for full-length text */}
      <div className="p-4 bg-white space-y-3 dark:bg-[#1A1A1A]">
        {/* Wrong / Correct side-by-side on wide, stacked on narrow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Wrong value */}
          <div>
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-[#E63329] mb-1">
              Students Write
            </div>
            <p className="text-[14px] font-semibold text-[#E63329] leading-snug">
              {wrongValue}
            </p>
          </div>

          {/* Correct value */}
          <div>
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B7A3C] mb-1">
              Correct{sourceRef ? ` (${sourceRef} IRR)` : ''}
            </div>
            <p className="text-[14px] font-semibold text-[#1B7A3C] leading-snug">
              {correctValue}
            </p>
          </div>
        </div>

        {/* Explanation — full text, never truncated */}
        <div className="pt-2 border-t border-[#ECEAE4] dark:border-[#3A3835]">
          <p className="text-[13px] text-[#737370] leading-relaxed dark:text-[#A8A8A5]">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  )
}
