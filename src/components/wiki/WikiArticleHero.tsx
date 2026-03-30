import { cn } from '@/lib/utils'
import type { WikiArticleHeroProps } from '@/types/wiki'

const difficultyStyle = {
  Foundational: 'bg-success-50 text-[#166534]',
  Intermediate: 'bg-signal-gold-light text-[#92400E]',
  Advanced: 'bg-[#FFF0EF] text-[#991B1B]',
} as const

export const WikiArticleHero = ({
  subject, difficulty, readTime, title, updatedNote, aleTestsYou, isMinimal
}: WikiArticleHeroProps) => {
  return (
    <header className={cn("not-prose flex flex-col gap-3 mb-0", isMinimal && "gap-2 mb-4")}>
      {/* Tag row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-[var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-[3px] bg-cobalt-light text-camp-cobalt">
          {subject}
        </span>
        <span className={cn(
          "font-[var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-[3px]",
          difficultyStyle[difficulty]
        )}>
          {difficulty}
        </span>
        {!isMinimal && (
          <span className="font-[var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-[3px] bg-muted text-ink-muted">
            {readTime} read
          </span>
        )}
      </div>

      {/* Title — Syne 800 weight, only element using font-display */}
      <h1 className={cn(
        "font-[var(--font-display)] font-extrabold text-2xl sm:text-[30px] text-wiki-ink leading-tight dark:text-[#E2E0D8]",
        isMinimal && "text-xl sm:text-xl"
      )}>
        {title}
      </h1>

      {/* Updated metadata */}
      {!isMinimal && (
        <p className="font-[var(--font-dm-mono)] text-[11px] text-[#A8A8A5]">
          {updatedNote}
        </p>
      )}

      {/* ALE orientation banner — NOT a callout */}
      {!isMinimal && (
        <div className="border border-camp-cobalt/20 bg-cobalt-light rounded-md px-4 py-3 dark:bg-[#1B3FC410]">
          <p className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-camp-cobalt mb-1">
            The ALE tests you to
          </p>
          <p className="text-sm text-[#3D3D3A] leading-relaxed dark:text-[#C8C6C0]">
            {aleTestsYou}
          </p>
        </div>
      )}

      {/* Hero divider — separates hero from article content */}
      <div className={cn("border-t border-[#E0DED8] mt-7 dark:border-[#3A3835]", isMinimal && "mt-2")} />
    </header>
  )
}
