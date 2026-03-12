import { Starburst } from '@/components/marketing/LandingPrimitives'

export const SocialProofBar = () => (
  <>
    <section className='border-y border-charcoal/6 bg-white/60 p-2'>
      <div className='mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center'>
        <span className='text-[12px] font-medium text-graphite'>
          Engineered by Topnotchers
        </span>
        <span className='text-[12px] text-slate'>&middot;</span>
        <span className='text-[12px] font-medium text-graphite'>
          SME-Verified Content
        </span>
        <span className='text-[12px] text-slate'>&middot;</span>
        <span className='text-[12px] font-medium text-graphite'>
          Used by 500+ Architecture Students
        </span>
      </div>
    </section>

    <section className='px-6'>
      <div className='mx-auto my-2 flex max-w-[1200px] items-center gap-3'>
        <Starburst className='h-4 w-4 text-signal-amber' />
        <h2
          id='how-it-works-heading'
          className='font-mono text-[8px] tracking-[0.2em] uppercase text-slate'
        >
          TRUSTED BY STUDENTS AND PROFESSIONALS AT:
        </h2>
      </div>
    </section>
  </>
)
