import Link from 'next/link'

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
    <div className='relative mx-auto max-w-[1200px] overflow-hidden rounded-[10px] bg-[#111111] px-8 py-20 text-center text-white noise'>
      <div className='relative z-10'>
        <h2 className='font-[family-name:var(--font-syne)] text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold tracking-tight text-white'>
          The exam doesn&apos;t wait for you to feel ready.
        </h2>
        <p className='mx-auto mt-3 max-w-lg text-[15px] italic leading-relaxed text-white/55'>
          {isLoggedIn
            ? 'Your Readiness Score is waiting. Keep building toward it.'
            : 'SlateCamp shows you exactly where you stand, what to fix, and when you\u2019re genuinely ready. Start free \u2014 no card needed.'}
        </p>
        <Link
          href={ctaHref}
          className='mt-10 inline-flex rounded-sm bg-[#1B3FC4] px-8 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:bg-[#1535A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-2'
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  </section>
)
