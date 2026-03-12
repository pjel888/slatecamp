import Link from 'next/link'
import { Instrument_Serif } from 'next/font/google'
import { NoiseOverlay } from '@/components/marketing/LandingPrimitives'
import { SLATECAMP_INK, SLATECAMP_AMBER, SLATECAMP_PAPER } from '@/lib/constants'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const FinalCtaSection = ({
  ctaHref,
  ctaLabel,
  isLoggedIn,
}: {
  ctaHref: string
  ctaLabel: string
  isLoggedIn: boolean
}) => (
  <section aria-label="Get started" className="px-6 pb-24">
    <div
      className="relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl px-8 py-20 text-center"
      style={{ backgroundColor: SLATECAMP_INK.main }}
    >
      <NoiseOverlay opacity={0.02} />
      <div className="relative z-10">
        <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight" style={{ color: SLATECAMP_PAPER.snow }}>
          Ready to pass your board exam?
        </h2>
        <p className={`${serif.className} mt-3 text-[17px] italic`} style={{ color: 'rgba(255,255,255,0.4)' }}>
          {isLoggedIn
            ? 'Head to your dashboard to continue studying.'
            : 'One platform. Everything verified. No doubt.'}
        </p>
        <Link
          href={ctaHref}
          className="mt-10 inline-flex rounded-full px-8 py-3.5 text-[15px] font-medium transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: SLATECAMP_AMBER.DEFAULT, color: SLATECAMP_PAPER.snow }}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  </section>
)
