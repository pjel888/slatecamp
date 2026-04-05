import { cn } from '@/lib/utils'
import type { WikiArticleHeroProps } from '@/types/wiki'

const difficultyStyle = {
  Foundational: 'bg-success-50 text-success-700',
  Intermediate: 'bg-signal-gold-light text-[var(--signal-gold-deep)]',
  Advanced: 'bg-destructive-50 text-destructive-700',
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

      {/* Title — Boldonse 400 weight, only element using font-display */}
      <h1 className={cn(
        "font-[var(--font-display)] font-extrabold text-2xl sm:text-[30px] text-wiki-ink leading-tight dark:text-wiki-invert-heading",
        isMinimal && "text-[8px] sm:text-[8px]"
      )}>
        {title}
      </h1>

      {/* Updated metadata */}
      {!isMinimal && (
        <p className="font-[var(--font-dm-mono)] text-[11px] text-wiki-muted">
          {updatedNote}
        </p>
      )}

      {/* Hero divider — separates hero from article content */}
      <div className={cn("border-t border-wiki-border mt-7 dark:border-wiki-invert-divider", isMinimal && "mt-2")} />

      {/* ALE orientation banner — NOT a callout */}
      {!isMinimal && (
        <div className="border border-camp-cobalt/20 bg-cobalt-light rounded-md px-4 py-3 dark:bg-primary/10">
          <p className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-camp-cobalt mb-1">
            The ALE tests you to
          </p>
          <p className="text-sm text-wiki-body leading-relaxed dark:text-wiki-invert-body">
            {aleTestsYou}
          </p>
        </div>
      )}


    </header>
  )
}
