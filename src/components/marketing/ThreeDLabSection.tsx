import {
  FeatureSectionLayout,
  FeatureCheckItem,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'

/* ── 3D viewer mockup ── */

const ThreeDMockup = () => (
  <div className='relative overflow-hidden rounded-[10px] bg-[#1B7A3C] noise-heavy'>
    <div className='relative z-10'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div>
          <span className='inline-block rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px] text-white/70'>
            3D Lab · NBCP Setbacks
          </span>
          <div className='mt-1 text-[13px] font-bold text-white'>Residential — Corner Lot</div>
        </div>
        <span className='rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[11px] text-white/70'>
          PD 1096 § 706
        </span>
      </div>

      {/* SVG Viewport — isometric building footprint */}
      <div className='flex h-[160px] items-center justify-center px-4'>
        <svg viewBox='0 0 320 150' className='w-full max-w-[320px]'>
          {/* Lot outline */}
          <rect x='40' y='20' width='240' height='110' fill='none' stroke='white' strokeOpacity='0.2' strokeWidth='1' strokeDasharray='4 2' />

          {/* Setback lines */}
          <line x1='70' y1='20' x2='70' y2='130' stroke='#F5A623' strokeWidth='1' strokeDasharray='3 3' />
          <line x1='40' y1='45' x2='280' y2='45' stroke='#F5A623' strokeWidth='1' strokeDasharray='3 3' />
          <line x1='250' y1='20' x2='250' y2='130' stroke='#F5A623' strokeWidth='1' strokeDasharray='3 3' />

          {/* Building footprint */}
          <rect x='70' y='45' width='180' height='75' fill='white' fillOpacity='0.15' stroke='white' strokeOpacity='0.5' strokeWidth='1.5' />

          {/* 3D extrusion lines */}
          <line x1='70' y1='45' x2='55' y2='25' stroke='white' strokeOpacity='0.3' strokeWidth='1' />
          <line x1='250' y1='45' x2='235' y2='25' stroke='white' strokeOpacity='0.3' strokeWidth='1' />
          <line x1='250' y1='120' x2='235' y2='100' stroke='white' strokeOpacity='0.3' strokeWidth='1' />
          <rect x='55' y='25' width='180' height='75' fill='none' stroke='white' strokeOpacity='0.2' strokeWidth='1' />

          {/* Setback labels */}
          <text x='55' y='80' fill='#F5A623' fontSize='11' fontFamily='monospace' transform='rotate(-90 55 80)'>3.0m</text>
          <text x='150' y='40' fill='#F5A623' fontSize='11' fontFamily='monospace' textAnchor='middle'>4.5m</text>
          <text x='260' y='80' fill='#F5A623' fontSize='11' fontFamily='monospace' transform='rotate(90 260 80)'>2.0m</text>
        </svg>
      </div>

      {/* FAR Slider */}
      <div className='flex items-center gap-3 border-t border-white/10 px-4 py-3'>
        <span className='font-mono text-[11px] text-white/50'>FAR</span>
        <div className='relative flex-1'>
          <input
            type='range'
            min='1'
            max='5'
            step='0.1'
            defaultValue='3'
            className='w-full accent-[#F5A623]'
            aria-label='Floor Area Ratio'
          />
        </div>
        <span className='font-mono text-[11px] font-medium text-[#F5A623]'>3.0</span>
      </div>
    </div>
  </div>
)

/* ── 3D Lab Section ── */

export const ThreeDLabSection = () => (
  <FeatureSectionLayout dark flip>
    {/* Copy — left (visually right due to flip) */}
    <div>
      <SectionEyebrow label='3D Lab' dark />

      <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[34px]'>
        The only 3D building code viewer
        <br />
        in any Philippine review platform.
      </h2>

      <p className='mt-4 max-w-[440px] text-[14px] leading-relaxed text-white/55'>
        Memorizing setbacks and clearances from text alone is how students
        fail. Seeing them — dragging them, rotating them — is how they pass.
        The 3D Lab makes PD 1096 spatial, not abstract.
      </p>

      {/* Feature chips */}
      <div className='mt-5 flex flex-wrap gap-2'>
        <FeaturePill variant='muted-dark'>WebGL-powered</FeaturePill>
        <FeaturePill variant='amber'>Parametric controls</FeaturePill>
        <FeaturePill variant='muted-dark'>PD 1096 provisions</FeaturePill>
        <FeaturePill variant='muted-dark'>NBCP setbacks</FeaturePill>
      </div>

      {/* Check items */}
      <div className='mt-8 space-y-5'>
        <FeatureCheckItem
          title='Drag FAR — model updates in real time'
          description='Adjust Floor Area Ratio, lot coverage, or building height with a slider and watch the structure respond in real time.'
          accentColor='#F5A623'
          textDark
        />
        <FeatureCheckItem
          title='Linked directly to quiz questions'
          description='Get a setback question wrong? Open the 3D Lab straight from the explanation card and see the exact provision in 3D.'
          accentColor='#F5A623'
          textDark
        />
      </div>
    </div>

    {/* Mockup — right (visually left due to flip) */}
    <ThreeDMockup />
  </FeatureSectionLayout>
)
