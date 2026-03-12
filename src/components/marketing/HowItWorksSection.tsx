import { Starburst } from '@/components/marketing/LandingPrimitives'
import { SLATECAMP_AMBER, SLATECAMP_INK, SLATECAMP_BORDER, hexToRgba } from '@/lib/constants'

const STEPS = [
  {
    num: '01',
    title: 'Choose your mode',
    desc: 'Review for zero-pressure study. Camp for tracked learning. Storm for full exam simulation.',
  },
  {
    num: '02',
    title: 'Answer questions',
    desc: 'AI adapts difficulty in real-time. Spaced repetition schedules reviews at the mathematically optimal interval.',
  },
  {
    num: '03',
    title: 'Master the material',
    desc: 'Watch your readiness score climb. The taxonomy heatmap shows exactly where you stand — no hiding.',
  },
] as const

export const HowItWorksSection = () => (
  <section
    id="how-it-works"
    aria-labelledby="how-it-works-heading"
    className="relative border-t px-6 py-24"
    style={{ borderColor: SLATECAMP_BORDER.DEFAULT }}
  >
    <div className="relative z-10 mx-auto max-w-[1200px]">
      <div className="flex items-center gap-3">
        <Starburst className="h-4 w-4" style={{ color: SLATECAMP_AMBER.DEFAULT }} />
        <h2 id="how-it-works-heading" className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: SLATECAMP_INK.subtle }}>
          How It Works
        </h2>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-12">
        {STEPS.map(({ num, title, desc }) => (
          <div key={num}>
            <span className="font-mono text-[56px] font-bold leading-none tracking-tighter" style={{ color: hexToRgba(SLATECAMP_INK.main, 0.1) }} aria-hidden="true">
              {num}
            </span>
            <h3 className="mt-4 text-[20px] font-semibold tracking-tight" style={{ color: SLATECAMP_INK.main }}>{title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: SLATECAMP_INK.subtle }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
