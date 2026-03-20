import { WikiChangedPill } from './WikiChangedPill'
import type { WikiMistakeProps } from '@/types/wiki'

export const WikiMistakeCard = ({ number, title, wrongValue, correctValue, explanation, sourceRef }: WikiMistakeProps) => {
  const isChanged = !!sourceRef
  return (
    <div className="grid grid-cols-[28px_1fr] gap-2.5 border border-[#E0DED8] rounded-lg px-3.5 py-3 dark:border-[#3A3835]">
      <span className="font-[var(--font-dm-mono)] text-[11px] font-medium text-[#1B3FC4] pt-0.5">
        {String(number).padStart(2, '0')}
      </span>
      <div>
        <p className="font-sans text-[13px] font-semibold text-[#1A1A1A] mb-1 dark:text-[#E2E0D8]">{title}</p>
        <p className="font-sans text-xs text-[#1A1A1A] leading-relaxed dark:text-[#C8C6C0]">
          <span className="text-[#737370] dark:text-[#A8A8A5]">Wrong: </span>
          <span className="line-through text-[#E63329]">{wrongValue}</span>
          <span className="text-[#737370] mx-2 dark:text-[#A8A8A5]">→</span>
          <span className="text-[#737370] dark:text-[#A8A8A5]">Correct: </span>
          <span className="font-semibold text-[#1B3FC4]">{correctValue}</span>
          {isChanged && <WikiChangedPill className="ml-1.5" />}
        </p>
        <p className="font-sans text-[11px] text-[#737370] mt-1 leading-relaxed dark:text-[#A8A8A5]">
          {explanation}
        </p>
      </div>
    </div>
  )
}
