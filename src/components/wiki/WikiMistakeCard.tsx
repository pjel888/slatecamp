import type { WikiMistakeProps } from '@/types/wiki'

export const WikiMistakeCard = ({ number, title, wrongValue, correctValue, explanation, sourceRef }: WikiMistakeProps) => {
  return (
    <div className="not-prose border border-[#E63329] rounded-[10px] overflow-hidden my-3">
      {/* Red header */}
      <div className="bg-[#E63329] px-4 py-2.5 flex items-center gap-2.5">
        <span className="font-[var(--font-dm-mono)] text-[11px] font-medium text-white/70">
          #{number}
        </span>
        <span className="text-[13px] font-semibold text-white">
          {title}
        </span>
      </div>

      {/* Body grid */}
      <div className="p-4 bg-white grid grid-cols-2 gap-3 dark:bg-[#1A1A1A]">
        {/* Wrong value */}
        <div>
          <div className="font-[var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.08em] text-[#E63329] mb-0.5">
            Students Write
          </div>
          <div className="text-base font-bold text-[#E63329] line-through">
            {wrongValue}
          </div>
        </div>

        {/* Correct value */}
        <div>
          <div className="font-[var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.08em] text-[#1B7A3C] mb-0.5">
            Correct{sourceRef ? ` (${sourceRef} IRR)` : ''}
          </div>
          <div className="text-base font-bold text-[#1B7A3C]">
            {correctValue}
          </div>
        </div>

        {/* Explanation */}
        <div className="col-span-2 pt-1 border-t border-[#ECEAE4] dark:border-[#3A3835]">
          <p className="text-[13px] text-[#737370] leading-relaxed dark:text-[#A8A8A5]">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  )
}
