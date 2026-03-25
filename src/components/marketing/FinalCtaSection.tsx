import Link from 'next/link'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export const FinalCtaSection = ({
  ctaHref,
  ctaLabel,
  isLoggedIn,
}: {
  ctaHref: string
  ctaLabel: string
  isLoggedIn: boolean
}) => (
  <section aria-label='Get started' className='px-6 pb-24'>
    <div className='relative mx-auto max-w-[1200px] overflow-hidden rounded-md bg-[#111111] px-8 py-20 text-center text-white noise'>
      <div className='relative z-10'>
        <ScrollReveal y={20} duration={0.4} delay={0}>
          <h2 className='font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-white'>
            The exam doesn&apos;t wait for you to feel ready.
          </h2>
        </ScrollReveal>
        <ScrollReveal y={12} duration={0.4} delay={0.1}>
          <p className='mx-auto mt-3 max-w-lg text-[15px] italic leading-relaxed text-white/55'>
            {isLoggedIn
              ? 'Your Readiness Score is waiting. Keep building toward it.'
              : 'SlateCamp shows you exactly where you stand, what to fix, and when you\u2019re genuinely ready. Start free \u2014 no card needed.'}
          </p>
        </ScrollReveal>
        <ScrollReveal y={12} duration={0.4} delay={0.15}>
          <Link
            href={ctaHref}
            className='mt-10 inline-flex rounded-sm bg-camp-cobalt px-8 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
          >
            {ctaLabel}
          </Link>
        </ScrollReveal>
      </div>
    </div>
  </section>
)
