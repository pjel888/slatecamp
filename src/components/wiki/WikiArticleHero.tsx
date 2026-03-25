import { cn } from '@/lib/utils'
import type { WikiArticleHeroProps } from '@/types/wiki'

const difficultyStyle = {
  Foundational: 'bg-[#EDFAF4] text-[#166534]',
  Intermediate: 'bg-[#FFF8E6] text-[#92400E]',
  Advanced: 'bg-[#FFF0EF] text-[#991B1B]',
} as const

export const WikiArticleHero = ({
  subject, difficulty, readTime, title, updatedNote, aleTestsYou
}: WikiArticleHeroProps) => {
  return (
    <header className="not-prose flex flex-col gap-3 mb-0">
      {/* Tag row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-[3px] bg-[#EEF3FD] text-camp-cobalt">
          {subject}
        </span>
        <span className={cn(
          "font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-[3px]",
          difficultyStyle[difficulty]
        )}>
          {difficulty}
        </span>
        <span className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest px-2 py-0.5 rounded-[3px] bg-[#F5F5F5] text-[#737370]">
          {readTime} read
        </span>
      </div>

      {/* Title — Syne 800 weight, only element using font-display */}
      <h1 className="font-[var(--font-display)] font-extrabold text-2xl sm:text-[30px] text-[#1A1A1A] leading-tight dark:text-[#E2E0D8]">
        {title}
      </h1>

      {/* Updated metadata */}
      <p className="font-[var(--font-dm-mono)] text-[11px] text-[#A8A8A5]">
        Updated: {updatedNote}
      </p>

      {/* ALE orientation banner — NOT a callout */}
      <div className="border-l-[3px] border-camp-cobalt bg-[#EEF3FD] rounded-r-lg px-4 py-3 dark:bg-[#1B3FC410]">
        <p className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-camp-cobalt mb-1">
          The ALE tests you to
        </p>
        <p className="text-sm text-[#3D3D3A] leading-relaxed dark:text-[#C8C6C0]">
          {aleTestsYou}
        </p>
      </div>

      {/* Hero divider — separates hero from article content */}
      <div className="border-t border-[#E0DED8] mt-7 dark:border-[#3A3835]" />
    </header>
  )
}
