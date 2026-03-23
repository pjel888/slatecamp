'use client'

import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'

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
    className="relative border-t border-[#E5E7EB] px-6 py-24"
  >
    <div className="relative z-10 mx-auto max-w-[1200px]">
      <ScrollReveal>
        <div className="flex items-center gap-3">
          <Starburst className="h-3 w-3 text-[--camp-orange]" />
          <h2
            id="how-it-works-heading"
            className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B]"
          >
            How It Works
          </h2>
        </div>
      </ScrollReveal>

      <StaggerParent className="mt-16 grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-12">
        {STEPS.map(({ num, title, desc }) => (
          <StaggerItem key={num}>
            <span
              className="font-mono text-[56px] font-bold leading-none tracking-tighter text-[#E5E7EB]"
              aria-hidden="true"
            >
              {num}
            </span>
            <h3 className="mt-4 font-[family-name:var(--font-syne)] text-[20px] font-semibold tracking-tight text-[#18181B]">
              {title}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[#6B6B6B]">
              {desc}
            </p>
          </StaggerItem>
        ))}
      </StaggerParent>
    </div>
  </section>
)
