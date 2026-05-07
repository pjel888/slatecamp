import { ScrollReveal } from '@/components/motion/ScrollReveal'

const PROOF_LINES = [
  'Built around Philippine codes and board-review realities',
  'Licensure Examination for Architects readiness with clear educational boundaries',
  'Use beside your review center, books, notes, and mentors',
] as const

export const SocialProofBar = () => (
  <section className='border-y border-border-design bg-white/85 p-2'>
    <ScrollReveal y={0} duration={0.3}>
      <div className='mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center'>
        {PROOF_LINES.map((line, index) => (
          <span key={line} className='contents'>
            <span className='text-[12px] font-semibold text-text-2'>{line}</span>
            {index < PROOF_LINES.length - 1 && (
              <span className='text-[12px] text-gray-400'>&middot;</span>
            )}
          </span>
        ))}
      </div>
    </ScrollReveal>
  </section>
)
