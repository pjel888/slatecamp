import { WikiMistakeCard } from './WikiMistakeCard'
import type { WikiMistakeProps } from '@/types/wiki'

export const WikiMistakeList = ({ mistakes = [] }: { mistakes?: WikiMistakeProps[] }) => {
  if (!mistakes || mistakes.length === 0) return null
  return (
    <section className="not-prose mt-12">
      <div className="mb-5">
        <p className="font-[var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest text-[#1B3FC4] mb-1">
          Before exam day
        </p>
        <h2 className="font-sans font-bold text-xl text-[#1A1A1A] dark:text-[#E2E0D8]">
          Common Mistakes — {mistakes.length} ways students lose marks
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {mistakes.map((m) => <WikiMistakeCard key={m.number} {...m} />)}
      </div>
    </section>
  )
}
