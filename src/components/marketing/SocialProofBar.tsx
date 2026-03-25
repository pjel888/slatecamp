import { Starburst } from '@/components/marketing/LandingPrimitives'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

export const SocialProofBar = () => (
  <>
    <section className='border-y border-[#E5E7EB] bg-[#FFFFFF]/80 p-2'>
      <ScrollReveal y={0} duration={0.3}>
        <div className='mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center'>
          <span className='text-[12px] font-medium text-[#6B6B6B]'>
            Built for the Philippine ALE
          </span>
          <span className='text-[12px] text-[#9CA3AF]'>&middot;</span>
          <span className='text-[12px] font-medium text-[#6B6B6B]'>
            Every question mapped to the ALE syllabus
          </span>
          <span className='text-[12px] text-[#9CA3AF]'>&middot;</span>
          <span className='text-[12px] font-medium text-[#6B6B6B]'>
            Readiness Score powered by IRT
          </span>
        </div>
      </ScrollReveal>
    </section>

    <section className='px-6'>
      <div className='mx-auto my-2 flex max-w-[1200px] items-center gap-3'>
        <Starburst className='h-3 w-3 text-[#F5A623]' />
        <h2
          id='how-it-works-heading'
          className='font-mono text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B]'
        >
          Our trusted partners:
        </h2>
      </div>
    </section>
  </>
)
