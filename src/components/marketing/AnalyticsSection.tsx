import {
  FeatureSectionLayout,
  SectionEyebrow,
  FeaturePill,
} from '@/components/marketing/FeatureSectionLayout'

/* ── Readiness ring SVG ── */

const ReadinessRing = ({ value, className = '' }: { value: number; className?: string }) => {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className={`relative ${className}`}>
      <svg className='-rotate-90' width={80} height={80} viewBox='0 0 80 80' aria-hidden='true'>
        <circle cx={40} cy={40} r={radius} fill='none' stroke='#E8E4DC' strokeWidth={5} />
        <circle
          cx={40}
          cy={40}
          r={radius}
          fill='none'
          stroke='#F5A623'
          strokeWidth={5}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className='absolute inset-0 flex items-center justify-center font-mono text-[18px] font-extrabold text-[#111]'>
        {value}%
      </span>
    </div>
  )
}

/* ── Analytics mockup ── */

const AnalyticsMockup = () => (
  <div className='rounded-[10px] border border-[#E8E4DC] bg-[#FFFDF7] p-5'>
    {/* Overall score + ring */}
    <div className='mb-4 flex items-center gap-4'>
      <ReadinessRing value={75} className='h-20 w-20' />
      <div>
        <div className='text-[18px] font-extrabold text-[#111]'>Getting there</div>
        <div className='mt-1 text-[11px] leading-relaxed text-[#6B6B6B]'>
          2 subjects need targeted review before you&apos;re exam-ready.
        </div>
        <div className='mt-2 font-mono text-[11px] text-[#888]'>↑ +8 pts this week</div>
      </div>
    </div>

    {/* Stat mini-grid */}
    <div className='mb-4 grid grid-cols-2 gap-2'>
      {[
        { label: 'Questions', value: '847', sub: 'answered total', accent: undefined },
        { label: 'Streak', value: '12', sub: 'days active', accent: '#F5A623' },
      ].map((stat) => (
        <div key={stat.label} className='rounded-[8px] bg-[#F2F0EB] p-3'>
          <div className='font-mono text-[11px] uppercase tracking-[.12em] text-[#888]'>{stat.label}</div>
          <div className='mt-1 text-[20px] font-extrabold' style={{ color: stat.accent || '#111' }}>
            {stat.value}
          </div>
          <div className='text-[11px] text-[#888]'>{stat.sub}</div>
        </div>
      ))}
    </div>

    {/* Subject bars */}
    <div className='mb-2.5 font-mono text-[11px] uppercase tracking-[.15em] text-[#888]'>By Subject</div>
    {[
      { name: 'Structural Design', pct: 85, color: '#1B3FC4' },
      { name: 'Building Technology', pct: 62, color: '#F5A623' },
      { name: 'Architectural Theory', pct: 41, color: '#E63329' },
      { name: 'History of Arch.', pct: 73, color: '#F5A623' },
      { name: 'Utilities (MEPFS)', pct: 88, color: '#1B3FC4' },
    ].map((s) => (
      <div key={s.name} className='mb-2'>
        <div className='mb-1 flex justify-between font-mono text-[11px]'>
          <span className='text-[#888]'>{s.name}</span>
          <span style={{ color: s.color }}>{s.pct}%</span>
        </div>
        <div className='h-[5px] overflow-hidden rounded-full bg-[#E8E4DC]'>
          <div className='h-full rounded-full' style={{ width: `${s.pct}%`, background: s.color }} />
        </div>
      </div>
    ))}
  </div>
)

/* ── Score legend ── */

const ScoreLegend = () => (
  <div className='mt-6 rounded-[10px] border border-[#E8E4DC] bg-[#FFFDF7] p-4'>
    <div className='mb-3 text-[13px] font-bold text-[#111]'>What the score actually means</div>
    {[
      { range: '85–100%', label: 'Exam ready. Focus on weak spots.', color: '#1B3FC4' },
      { range: '60–84%', label: 'Getting there. Targeted review.', color: '#F5A623' },
      { range: 'Below 60%', label: 'At risk. Build the foundation.', color: '#E63329' },
    ].map((tier) => (
      <div key={tier.range} className='mb-2 flex items-center gap-3'>
        <div className='h-2 w-8 rounded-full' style={{ background: tier.color }} />
        <span className='text-[12px] text-[#111]'>
          <strong>{tier.range}</strong>{' '}
          <span className='text-[#6B6B6B]'>{tier.label}</span>
        </span>
      </div>
    ))}
  </div>
)

/* ── Analytics Section ── */

export const AnalyticsSection = () => (
  <FeatureSectionLayout>
    {/* Copy — left */}
    <div>
      <SectionEyebrow label='Analytics' />

      <h2 className='font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-[1.15] tracking-tight text-[#111] sm:text-[34px]'>
        Stop guessing. Your Readiness Score
        <br />
        tells you exactly where you stand.
      </h2>

      <p className='mt-4 max-w-[440px] text-[14px] leading-relaxed text-[#6B6B6B]'>
        Not a grade. A GPS. Live, subject-by-subject mastery data
        updated after every session — so you always know which
        topic needs work next.
      </p>

      {/* Feature chips */}
      <div className='mt-5 flex flex-wrap gap-2'>
        <FeaturePill variant='cobalt'>Live Readiness Score</FeaturePill>
        <FeaturePill variant='cobalt'>Subject heatmap</FeaturePill>
        <FeaturePill variant='cobalt'>Session history</FeaturePill>
        <FeaturePill variant='amber'>Stamina tracking</FeaturePill>
        <FeaturePill variant='cobalt'>Pacing calendar</FeaturePill>
      </div>

      <ScoreLegend />
    </div>

    {/* Mockup — right */}
    <AnalyticsMockup />
  </FeatureSectionLayout>
)
