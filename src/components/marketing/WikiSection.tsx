import Link from 'next/link'
import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { ROUTES } from '@/lib/constants'

const WikiMockup = () => (
  <div className='overflow-hidden rounded-[22px] border border-border-design bg-white shadow-sm'>
    <div className='flex items-center justify-between gap-3 border-b border-border-design px-4 py-3'>
      <div>
        <div className='font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[.15em] text-camp-green'>
          Knowledge Resource Preview
        </div>
        <span className='mt-1 block text-[13px] font-bold text-camp-black'>Setbacks and Buildable Envelope</span>
      </div>
      <span className='rounded-full bg-camp-green/10 px-2.5 py-1 text-[11px] font-semibold text-camp-green'>
        Free after signup
      </span>
    </div>

    <div className='border-b border-border-design bg-muted px-4 py-3'>
      <div className='mb-2 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[.15em] text-marketing-tertiary'>
        Jump to
      </div>
      {['What setback means', 'Where students get confused', 'Visual memory cue', 'Related quiz and 3D lab'].map((item) => (
        <div key={item} className='mb-1 rounded-sm border border-camp-green/20 px-2 py-1 text-[11px] text-camp-green'>
          {item}
        </div>
      ))}
    </div>

    <div className='px-4 py-4'>
      <h3 className='mb-2 text-[14px] font-bold text-camp-black'>Field-guide explanation</h3>
      <p className='mb-3 text-[12px] leading-relaxed text-text-2'>
        A setback is easier to remember when you picture the lot shrinking first. The remaining area is the buildable envelope: the zone where the main building mass can be studied before checking other limits.
      </p>
      <div className='mb-3 rounded-[10px] bg-camp-black px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-success-400'>
        Source trail: PD 1096 / NBCP locator attached where verified
      </div>
      <div className='flex flex-wrap items-center gap-1.5'>
        <FeaturePill variant='green'>PD 1096</FeaturePill>
        <FeaturePill variant='cobalt'>Building Technology</FeaturePill>
        <span className='text-[11px] text-camp-cobalt underline'>Related quiz + 3D preview →</span>
      </div>
    </div>
  </div>
)

export const WikiSection = () => (
  <div id='knowledge-resources' className='scroll-mt-24'>
    <FeatureSectionLayout flip amber>
      <StaggerParent>
        <StaggerItem>
          <SectionEyebrow label='Knowledge Resources' amber />
        </StaggerItem>

        <StaggerItem>
          <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] text-camp-black sm:text-[34px]'>
            Your architecture field guide for rules, terms, and topics that keep showing up.
          </h2>
        </StaggerItem>

        <StaggerItem>
          <p className='mt-4 max-w-[460px] text-[14px] leading-relaxed text-black/60'>
            SlateCamp turns scattered code provisions, lecture notes, class handouts, and practice mistakes into connected study pages: what the rule means, where it appears, why students miss it, and what to practice next.
          </p>
        </StaggerItem>

        <StaggerItem>
          <div className='mt-5 flex flex-wrap gap-2'>
            <FeaturePill variant='on-amber'>Source-backed where verified</FeaturePill>
            <FeaturePill variant='on-amber'>Linked to questions</FeaturePill>
            <FeaturePill variant='on-amber'>Visual memory cues</FeaturePill>
            <FeaturePill variant='on-amber'>Free after signup</FeaturePill>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className='mt-8 space-y-5'>
            <FeatureCheckItem
              title='Find the rule without drowning in PDFs'
              description='Start with a plain-language orientation, then follow the source trail where the locator is verified.'
              accentColor='var(--foreground)'
            />
            <FeatureCheckItem
              title='Move from reading to repair'
              description='Knowledge pages connect to quiz explanations and 3D examples so a weak topic becomes a clear next action.'
              accentColor='var(--foreground)'
            />
          </div>
          <Link
            href={ROUTES.auth.register}
            className='mt-7 inline-flex rounded-sm bg-camp-black px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-black/30'
          >
            Browse free resources after signup
          </Link>
        </StaggerItem>
      </StaggerParent>

      <ScrollReveal delay={0.15} y={0}>
        <WikiMockup />
      </ScrollReveal>
    </FeatureSectionLayout>
  </div>
)
