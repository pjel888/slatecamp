'use client'

import { useState } from 'react'
import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const OPTIONS = [
  'Because the table says so; memorize the value only.',
  'Because setbacks and clearances shape where the mass and overhang may sit.',
  'Because eaves are ignored if the lot is residential.',
  'Because the road right-of-way replaces all side and rear limits.',
] as const

const QuizPreview = () => {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const correctIndex = 1

  return (
    <div className='overflow-hidden rounded-[22px] border border-border-design bg-white shadow-sm'>
      <div className='relative overflow-hidden bg-camp-cobalt px-4 py-3 noise-heavy'>
        <div className='relative z-10 flex items-center justify-between gap-3'>
          <div>
            <div className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[.18em] uppercase text-white/50'>
              Building Technology · Preview
            </div>
            <div className='mt-0.5 text-[13px] font-bold text-white'>Setbacks and eave clearance</div>
          </div>
          <div className='rounded-full bg-white/15 px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-white/70'>
            Study preview
          </div>
        </div>
      </div>

      <div className='p-4 sm:p-5'>
        <p className='mb-4 text-[14px] font-semibold leading-snug text-camp-black'>
          A classmate keeps mixing up the eave clearance rule with setback bands. What should they understand first?
        </p>

        <fieldset className='space-y-2' role='radiogroup' aria-label='Quiz preview answer choices'>
          {OPTIONS.map((option, index) => {
            const isSelected = selected === index
            const isCorrect = submitted && index === correctIndex
            const isWrong = submitted && isSelected && index !== correctIndex
            return (
              <button
                key={option}
                type='button'
                role='radio'
                onClick={() => {
                  setSelected(index)
                  setSubmitted(false)
                }}
                className={`flex w-full items-start gap-3 rounded-[10px] border px-3 py-3 text-left text-[12px] leading-relaxed transition ${
                  isCorrect
                    ? 'border-camp-green bg-success-50 text-camp-green'
                    : isWrong
                      ? 'border-camp-red bg-red-50 text-camp-red'
                      : isSelected
                        ? 'border-camp-cobalt bg-primary-50 text-camp-cobalt'
                        : 'border-border-design text-text-2 hover:border-camp-cobalt/35 hover:bg-primary-50/40'
                }`}
                aria-checked={isSelected}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[9px] ${
                    isSelected || isCorrect ? 'border-current bg-current text-white' : 'border-current text-transparent'
                  }`}
                  aria-hidden='true'
                >
                  ✓
                </span>
                <span>{option}</span>
              </button>
            )
          })}
        </fieldset>

        <div className='mt-4 rounded-[14px] border border-border-design bg-muted p-2'>
          <button
            type='button'
            disabled={selected === null}
            onClick={() => setSubmitted(true)}
            className='flex w-full items-center justify-between rounded-[10px] bg-camp-black px-3 py-2 text-left text-[12px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40'
          >
            <span>{submitted ? 'Submitted' : 'Submit answer'}</span>
            <span className='flex h-6 w-20 items-center rounded-full bg-white/12 p-0.5' aria-hidden='true'>
              <span className={`h-5 w-5 rounded-full bg-camp-amber transition ${submitted ? 'translate-x-14' : ''}`} />
            </span>
          </button>
          <p className='mt-2 px-1 text-[10px] text-text-2'>
            Slide-style affordance shown visually; the button remains keyboard and screen-reader friendly.
          </p>
        </div>

        {submitted && (
          <div className='mt-4 rounded-[14px] border border-camp-green/20 bg-camp-green/8 p-4'>
            <div className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[.15em] uppercase text-camp-green'>
              Explanation
            </div>
            <p className='mt-2 text-[12px] leading-relaxed text-text-2'>
              Good practice does not stop at the answer. The next step is to separate the ideas: an overhang clearance rule protects the distance from side/rear property lines, while setback bands explain where the main building mass may sit.
            </p>
            <div className='mt-3 rounded-[10px] bg-white px-3 py-2 text-[11px] text-camp-cobalt'>
              Readiness signal: weak topic found · Setbacks and envelope visualization
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const QuestionsSection = () => (
  <FeatureSectionLayout>
    <StaggerParent>
      <StaggerItem>
        <SectionEyebrow label='Quizzes' />
      </StaggerItem>

      <StaggerItem>
        <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] text-camp-black sm:text-[34px]'>
          Every missed answer should become a next step, not just a red mark.
        </h2>
      </StaggerItem>

      <StaggerItem>
        <p className='mt-4 max-w-[460px] text-[14px] leading-relaxed text-text-2'>
          SlateCamp helps you check what stayed with you after lectures, handouts, mock exams, and self-study. When something breaks, the explanation points you to the topic to repair.
        </p>
      </StaggerItem>

      <StaggerItem>
        <div className='mt-5 flex flex-wrap gap-2'>
          <FeaturePill variant='cobalt'>Free readiness check</FeaturePill>
          <FeaturePill variant='cobalt'>Weak-topic map</FeaturePill>
          <FeaturePill variant='green'>Explanation first</FeaturePill>
          <FeaturePill variant='amber'>Diagnostics, drills, simulations</FeaturePill>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className='mt-8 space-y-5'>
          <FeatureCheckItem
            title='Check what stuck after lecture'
            description='Use SlateCamp after school lectures, mock exams, reading sessions, or self-study blocks to see what is actually staying with you.'
            accentColor='#1B3FC4'
          />
          <FeatureCheckItem
            title='Turn uncertainty into a repair list'
            description='Missed answers are grouped into topics so you know what to read, visualize, or drill next.'
            accentColor='#1B3FC4'
          />
          <FeatureCheckItem
            title='Keep exam practice separate from learning practice'
            description='Diagnostics, topic drills, and simulations stay as separate paths so each session has a clear purpose.'
            accentColor='#F5A623'
          />
        </div>
      </StaggerItem>
    </StaggerParent>

    <ScrollReveal delay={0.15} y={20}>
      <QuizPreview />
    </ScrollReveal>
  </FeatureSectionLayout>
)
