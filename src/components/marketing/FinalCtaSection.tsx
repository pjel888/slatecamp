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
    <div className='relative mx-auto max-w-[1200px] overflow-hidden rounded-lg bg-camp-black px-8 py-20 text-center text-white noise'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,166,35,0.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.22),transparent_30%)]' />
      <div className='relative z-10'>
        <ScrollReveal y={20} duration={0.4} delay={0}>
          <p className='font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold uppercase tracking-[0.2em] text-camp-amber'>
            Start with clarity
          </p>
          <h2 className='mx-auto mt-4 max-w-3xl font-[family-name:var(--font-syne)] text-[clamp(1.9rem,3.8vw,3rem)] font-extrabold leading-tight text-white'>
            The danger is not having weak spots. The danger is discovering them too late.
          </h2>
        </ScrollReveal>
        <ScrollReveal y={12} duration={0.4} delay={0.1}>
          <p className='mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/60'>
            {isLoggedIn
              ? 'Your dashboard is ready. Keep turning uncertainty into a clearer study plan.'
              : 'Start with a free account, preview the resources, and build a study plan around what you actually need to repair. No credit card required.'}
          </p>
        </ScrollReveal>
        <ScrollReveal y={12} duration={0.4} delay={0.15}>
          <Link
            href={ctaHref}
            className='mt-10 inline-flex rounded-sm bg-camp-cobalt px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-150 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
          >
            {ctaLabel}
          </Link>
        </ScrollReveal>
      </div>
    </div>
  </section>
)
