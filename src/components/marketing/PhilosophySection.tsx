import { Instrument_Serif } from 'next/font/google'
import { Starburst } from '@/components/marketing/LandingPrimitives'
import { siteConfig, SLATECAMP_AMBER, SLATECAMP_INK, SLATECAMP_BORDER } from '@/lib/constants'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const PhilosophySection = () => (
  <section aria-label="Design philosophy" className="border-t px-6 py-24" style={{ borderColor: SLATECAMP_BORDER.DEFAULT }}>
    <div className="mx-auto max-w-[1200px] text-center">
      <Starburst className="mx-auto h-6 w-6" style={{ color: SLATECAMP_AMBER.DEFAULT }} />
      <blockquote className={`${serif.className} mt-8 text-[clamp(2rem,4vw,3.5rem)] italic leading-[1.1] tracking-tight`} style={{ color: SLATECAMP_INK.main }}>
        &ldquo;Less, but better.&rdquo;
      </blockquote>
      <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed" style={{ color: SLATECAMP_INK.subtle }}>
        {siteConfig.name} follows the Dieter Rams philosophy — every feature
        earns its place. No clutter. No gimmicks. Just the tools you need to
        pass.
      </p>
    </div>
  </section>
)
