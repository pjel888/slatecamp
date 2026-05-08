import {
  FeatureSectionLayout,
  SectionEyebrow,
  FeaturePill,
  FeatureCheckItem,
} from '@/components/marketing/FeatureSectionLayout'
import { StaggerParent, StaggerItem } from '@/components/motion/StaggerChildren'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

const LOOP = [
  'Answer architecture board-style questions.',
  'Read the explanation and source-linked topic.',
  'See which subjects and topics need repair.',
  'Use a resource, 3D example, or another drill as the next step.',
  'Return to your notes, book, mentor, or study group with a clearer plan.',
] as const

const ReadinessMapMockup = () => (
  <div className='rounded-[22px] border border-border-design bg-white p-5 shadow-sm'>
    <div className='flex items-center justify-between gap-4'>
      <div>
        <div className='font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.16em] text-camp-cobalt'>
          Readiness map
        </div>
        <h3 className='mt-1 text-[18px] font-extrabold text-camp-black'>Tonight’s repair list</h3>
      </div>
      <div className='flex h-20 w-20 items-center justify-center rounded-full border-[7px] border-camp-amber/80 bg-camp-amber/10 text-center font-[family-name:var(--font-dm-mono)] text-[18px] font-extrabold text-camp-black'>
        74
      </div>
    </div>

    <div className='mt-5 space-y-3'>
      {[
        { topic: 'Setbacks and buildable envelope', status: 'Repair first', pct: 42, color: 'bg-camp-red' },
        { topic: 'PD 1096 light and ventilation', status: 'Review', pct: 63, color: 'bg-camp-amber' },
        { topic: 'Professional practice terms', status: 'Stable', pct: 82, color: 'bg-camp-green' },
      ].map((item) => (
        <div key={item.topic} className='rounded-[14px] border border-border-design p-3'>
          <div className='mb-2 flex items-center justify-between gap-3 text-[12px]'>
            <span className='font-semibold text-camp-black'>{item.topic}</span>
            <span className='font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.12em] text-text-2'>
              {item.status}
            </span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-muted'>
            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      ))}
    </div>

    <div className='mt-4 rounded-[14px] bg-camp-black p-4 text-white'>
      <p className='text-[12px] font-semibold text-camp-amber'>Weak spots are not the danger.</p>
      <p className='mt-1 text-[12px] leading-relaxed text-white/60'>
        The risk is finding them too late. Start with a free readiness check and turn uncertainty into a study plan.
      </p>
    </div>
  </div>
)

export const AnalyticsSection = () => (
  <FeatureSectionLayout>
    <StaggerParent>
      <StaggerItem>
        <SectionEyebrow label='Taking the boards?' />
      </StaggerItem>

      <StaggerItem>
        <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] text-camp-black sm:text-[34px]'>
          Turn review into a readiness map.
        </h2>
      </StaggerItem>

      <StaggerItem>
        <p className='mt-4 max-w-[460px] text-[14px] leading-relaxed text-text-2'>
          SlateCamp helps you see what you know, what you missed, and what to fix next before weak topics surprise you too late. It does not promise a board result; it gives you a clearer study conversation with yourself.
        </p>
      </StaggerItem>

      <StaggerItem>
        <div className='mt-5 flex flex-wrap gap-2'>
          <FeaturePill variant='cobalt'>Free readiness check</FeaturePill>
          <FeaturePill variant='amber'>Weak-topic repair list</FeaturePill>
          <FeaturePill variant='green'>Study-plan clarity</FeaturePill>
        </div>
      </StaggerItem>

      <StaggerItem>
        <div className='mt-8 space-y-4'>
          {LOOP.map((item, index) => (
            <FeatureCheckItem
              key={item}
              title={`Step ${index + 1}`}
              description={item}
              accentColor={index === 0 ? '#1B3FC4' : index === LOOP.length - 1 ? '#1B7A3C' : '#F5A623'}
            />
          ))}
        </div>
      </StaggerItem>
    </StaggerParent>

    <ScrollReveal delay={0.2} y={20}>
      <ReadinessMapMockup />
    </ScrollReveal>
  </FeatureSectionLayout>
)
