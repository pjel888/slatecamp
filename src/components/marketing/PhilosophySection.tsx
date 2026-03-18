import { Instrument_Serif } from 'next/font/google'
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { siteConfig } from '@/lib/constants'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const PhilosophySection = () => (
  <section
    aria-label="Design philosophy"
    className="border-t border-zinc-200 px-6 py-24"
  >
    <div className="mx-auto max-w-[1200px] text-center">
      <Starburst className="mx-auto h-3 w-3 text-[#D4951A]" />
      <blockquote
        className={`${serif.className} mt-8 text-[clamp(2rem,4vw,3.5rem)] italic leading-[1.1] tracking-tight text-zinc-900`}
      >
        &ldquo;Less, but better.&rdquo;
      </blockquote>
      <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-zinc-600">
        {siteConfig.name} follows the Dieter Rams philosophy — every feature
        earns its place. No clutter. No gimmicks. Just the tools you need to
        pass.
      </p>
    </div>
  </section>
)
