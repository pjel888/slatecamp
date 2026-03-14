import Link from 'next/link'
import { Instrument_Serif } from 'next/font/google'
import { NoiseOverlay } from '@/components/marketing/LandingPrimitives'

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
  <section aria-label='Get started' className='px-6 pb-24'>
    <div className='relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl bg-blue-500 px-8 py-20 text-center text-white'>
      <NoiseOverlay opacity={0.02} />
      <div className='relative z-10'>
        <h2 className='text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold tracking-tight text-zinc-50'>
          Ready to pass your board exam?
        </h2>
        <p
          className={`${serif.className} mt-3 text-[17px] italic text-zinc-300`}
        >
          {isLoggedIn
            ? 'Head to your dashboard to continue studying.'
            : 'One platform. Everything verified. No doubt.'}
        </p>
        <Link
          href={ctaHref}
          className='mt-10 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-[15px] font-medium text-white transition-all duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2'
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  </section>
)
