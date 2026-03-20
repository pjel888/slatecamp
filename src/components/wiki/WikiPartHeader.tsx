import type { WikiPartHeaderProps } from '@/types/wiki'

export const WikiPartHeader = ({ partNumber, title, subtitle }: WikiPartHeaderProps) => {
  return (
    <div className="not-prose mt-12 mb-5">
      <p className="font-[var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-[#1B3FC4] mb-1">
        Part {partNumber}
      </p>
      <h2 className="font-sans font-bold text-xl text-[#1A1A1A] leading-snug dark:text-[#E2E0D8]">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-xs text-[#737370] mt-1 dark:text-[#A8A8A5]">
          {subtitle}
        </p>
      )}
    </div>
  )
}
