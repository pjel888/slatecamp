import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'

/* ── Quiz mockup (rendered UI, not an image) ── */

const QuizMockup = () => (
  <div className='overflow-hidden rounded-[10px] border border-[#E8E4DC] bg-white'>
    {/* Header — Cobalt with noise */}
    <div className='relative overflow-hidden bg-[#1B3FC4] px-4 py-3 noise-heavy'>
      <div className='relative z-10 flex items-center justify-between'>
        <div>
          <div className='font-mono text-[11px] tracking-[.18em] uppercase text-white/50'>
            Building Technology · Q14
          </div>
          <div className='mt-0.5 text-[13px] font-bold text-white'>
            Storm Mode — 18:42 remaining
          </div>
        </div>
        <div className='rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] text-white/70'>
          40 questions
        </div>
      </div>
    </div>

    {/* Question body */}
    <div className='p-4'>
      <p className='mb-3 text-[13px] font-semibold leading-snug text-[#111]'>
        Under PD 1096, what is the minimum ceiling height for habitable rooms
        on the ground floor of a residential building?
      </p>

      {/* Answer options */}
      {[
        { label: '2.00 meters', state: 'neutral' as const },
        { label: '2.70 meters', state: 'correct' as const },
        { label: '2.40 meters', state: 'selected' as const },
        { label: '3.00 meters', state: 'neutral' as const },
      ].map((opt) => (
        <div
          key={opt.label}
          className={`mb-1.5 flex items-center gap-2.5 rounded-[6px] border-[1.5px] px-3 py-2 text-[12px] ${
            opt.state === 'correct'
              ? 'border-[#1B7A3C] bg-[#f0fdf4] text-[#1B7A3C]'
              : opt.state === 'selected'
                ? 'border-[#1B3FC4] bg-[#EEF2FC] text-[#1B3FC4]'
                : 'border-[#E8E4DC] text-[#555]'
          }`}
        >
          <div
            className={`h-3 w-3 shrink-0 rounded-full border-[1.5px] border-current ${
              opt.state !== 'neutral' ? 'bg-current' : ''
            }`}
          />
          {opt.label}
          {opt.state === 'correct' && ' ✓'}
        </div>
      ))}

      {/* Explanation card */}
      <div className='mt-3 rounded-[8px] bg-[#F2F0EB] p-3'>
        <div className='mb-1.5 font-mono text-[11px] tracking-[.15em] uppercase text-[#1B3FC4]'>
          Explanation
        </div>
        <p className='text-[11px] leading-relaxed text-[#555]'>
          Section 808 of PD 1096 specifies that habitable rooms must have a minimum
          ceiling height of 2.70m on the ground floor, and 2.40m on floors above.
          This is a commonly tested provision.
        </p>
        <span className='mt-2 inline-block rounded-[4px] bg-[#1B3FC4] px-2 py-0.5 font-mono text-[11px] text-white'>
          PD 1096 § 808
        </span>
      </div>
    </div>
  </div>
)

/* ── Questions Section ── */

export const QuestionsSection = () => (
  <FeatureSectionLayout>
    {/* Copy — left */}
    <div>
      <SectionEyebrow label='Question Bank' />

      <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] tracking-tight text-[#111] sm:text-[34px]'>
        2,400+ questions built for
        <br />
        the ALE. Every single one.
      </h2>

      <p className='mt-4 max-w-[440px] text-[14px] leading-relaxed text-[#6B6B6B]'>
        Not recycled PDFs. Not scraped notes. Every question is written
        to the ALE syllabus, verified by licensed architects, and tagged
        to its exact PD 1096 provision.
      </p>

      {/* Feature chips */}
      <div className='mt-5 flex flex-wrap gap-2'>
        <FeaturePill variant='cobalt'>Image + diagram questions</FeaturePill>
        <FeaturePill variant='cobalt'>Code-cited explanations</FeaturePill>
        <FeaturePill variant='cobalt'>All 7 ALE subjects</FeaturePill>
        <FeaturePill variant='cobalt'>Difficulty calibrated by IRT</FeaturePill>
      </div>

      {/* Check items */}
      <div className='mt-8 space-y-5'>
        <FeatureCheckItem
          title='Wrong answers teach more than right ones'
          description='Every incorrect answer unlocks a full explanation citing the exact code provision. You learn the why, not just the what.'
          accentColor='#1B3FC4'
        />
        <FeatureCheckItem
          title='Three study modes'
          description='Review for low-pressure recall. Camp Mode for tracked sessions. Storm Mode for full exam simulation with a timer.'
          accentColor='#1B3FC4'
        />
        <FeatureCheckItem
          title='Spaced repetition built in'
          description="Questions you've mastered fade back. Questions you keep missing resurface until they stick. The SM-2 algorithm handles the schedule."
          accentColor='#F5A623'
        />
      </div>
    </div>

    {/* Mockup — right */}
    <QuizMockup />
  </FeatureSectionLayout>
)
