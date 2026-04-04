import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

/* ── Wiki mockup ── */

const WikiMockup = () => (
  <div className='overflow-hidden rounded-md border border-border-design bg-white'>
    {/* Header */}
    <div className='flex items-center gap-2.5 border-b border-border-design px-4 py-3'>
      <div className='h-2 w-2 rounded-full bg-camp-green' />
      <span className='text-[13px] font-bold text-[#111]'>
        Building Technology — Firewall Requirements
      </span>
    </div>

    {/* Table of contents */}
    <div className='border-b border-border-design bg-muted px-4 py-3'>
      <div className='mb-1.5 font-mono text-[11px] uppercase tracking-[.15em] text-[#888]'>On this page</div>
      {['Definition & Purpose', 'Height Requirements', 'Construction Standards', 'Common Exam Questions'].map(
        (item) => (
          <div
            key={item}
            className='mb-1 border border-camp-green/20 rounded-sm px-2 text-[11px] text-camp-green'
          >
            {item}
          </div>
        ),
      )}
    </div>

    {/* Article body */}
    <div className='px-4 py-4'>
      <h3 className='mb-2 text-[14px] font-bold text-[#111]'>Height Requirements</h3>
      <p className='mb-3 text-[11px] leading-relaxed text-text-2'>
        A firewall must extend at least 0.50m above the highest point of the roof it protects.
        For buildings with combustible roofs, the firewall must project at least 0.60m above
        the roofline on both sides.
      </p>
      <div className='mb-3 rounded-[6px] bg-[#111] px-3 py-2 font-mono text-[11px] text-[#4ade80]'>
        PD 1096 § 1207 — Firewall Construction
      </div>
      <div className='flex flex-wrap items-center gap-1.5'>
        <FeaturePill variant='green'>PD 1096</FeaturePill>
        <FeaturePill variant='cobalt'>Building Technology</FeaturePill>
        <span className='text-[11px] text-camp-cobalt underline'>12 related questions →</span>
      </div>
    </div>
  </div>
)

/* ── Wiki Section ── */

export const WikiSection = () => (
  <FeatureSectionLayout flip amber>
    {/* Copy — right (visually right due to flip) */}
    <StaggerParent>
      <StaggerItem>
        <SectionEyebrow label='Wiki' amber />
      </StaggerItem>

      <StaggerItem>
        <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] text-[#111] sm:text-[34px]'>
          Every code provision, every principle.
          <br />
          Organized like an encyclopedia.
          <br />
          Cited like a reference.
        </h2>
      </StaggerItem>

      <StaggerItem>
        <p className='mt-4 max-w-[440px] text-[14px] leading-relaxed text-black/60'>
          No more hunting through PDFs. The SlateCamp Wiki maps every ALE
          topic to its source — PD 1096, RA 9266, NBCP, and more — with
          your personal notes workspace alongside.
        </p>
      </StaggerItem>

      {/* Feature chips */}
      <StaggerItem>
        <div className='mt-5 flex flex-wrap gap-2'>
          <FeaturePill variant='on-amber'>All ALE subjects covered</FeaturePill>
          <FeaturePill variant='on-amber'>Linked to questions</FeaturePill>
          <FeaturePill variant='on-amber'>Personal notes workspace</FeaturePill>
          <FeaturePill variant='on-amber'>PD 1096 · RA 9266 · NBCP</FeaturePill>
        </div>
      </StaggerItem>

      {/* Check items */}
      <StaggerItem>
        <div className='mt-8 space-y-5'>
          <FeatureCheckItem
            title='Linked directly to quiz questions'
            description='Tap any code citation in an explanation and jump straight to the full provision in the Wiki. Context and reference in one motion.'
            accentColor='#111111'
          />
          <FeatureCheckItem
            title='Your notes, your workspace'
            description='Add personal notes to any topic. Highlight what matters to you. Annotations stay private and sync across devices.'
            accentColor='#111111'
          />
        </div>
      </StaggerItem>
    </StaggerParent>

    {/* Mockup — left (visually left due to flip) */}
    <ScrollReveal delay={0.15} y={0}>
      <WikiMockup />
    </ScrollReveal>
  </FeatureSectionLayout>
)


