'use client'

import { useState } from 'react'

interface Dimension {
  id: string
  label: string
  p5: string
  p50: string
  p95: string
  y: number
  note: string
}

const MALE_DIMS: Dimension[] = [
  { id: 'stature', label: 'Stature (standing height)', p5: '1,618', p50: '1,740', p95: '1,867', y: 28, note: 'Full standing height, shoes off. The single most referenced body dimension in architectural design.' },
  { id: 'eye', label: 'Eye height (standing)', p5: '1,511', p50: '1,630', p95: '1,755', y: 60, note: 'Determines sight lines, counter heights for standing service, display case placement, and signage mounting heights.' },
  { id: 'shoulder', label: 'Shoulder height', p5: '1,352', p50: '1,468', p95: '1,585', y: 90, note: 'Upper limit of comfortable reach without raising the arm. Governs shelf heights and grab bar maximum.' },
  { id: 'elbow', label: 'Elbow height', p5: '1,026', p50: '1,105', p95: '1,190', y: 145, note: 'Counter height reference. Work surfaces for standing tasks should be 50–100 mm below elbow height.' },
  { id: 'hip', label: 'Hip breadth (standing)', p5: '310', p50: '351', p95: '401', y: 175, note: 'Determines minimum passage width. Two people passing = 2 × hip breadth + clearance.' },
  { id: 'knuckle', label: 'Knuckle height', p5: '716', p50: '775', p95: '840', y: 210, note: 'Handrail height reference. Railing height = knuckle height for comfortable grip during stair descent.' },
  { id: 'seated', label: 'Seated height (erect)', p5: '845', p50: '910', p95: '975', y: 260, note: 'Overall height when seated. Determines overhead clearance in theaters, auditoriums, and vehicle interiors.' },
  { id: 'seated-eye', label: 'Seated eye height', p5: '735', p50: '790', p95: '850', y: 278, note: 'Sight line when seated. Critical for theater riser design (isacoustic curve), classroom layouts, and display placement.' },
  { id: 'thigh', label: 'Thigh clearance (seated)', p5: '140', p50: '160', p95: '185', y: 298, note: 'Minimum clearance under desk or table for knee/thigh. Table aprons that reduce this dimension cause discomfort.' },
  { id: 'popliteal', label: 'Popliteal height (seat height)', p5: '395', p50: '435', p95: '480', y: 326, note: 'Back of knee to floor. Determines ideal seat height. Chair seat should equal popliteal height for feet flat on floor.' },
]

const FEMALE_DIMS: Dimension[] = [
  { id: 'stature', label: 'Stature (standing height)', p5: '1,508', p50: '1,622', p95: '1,737', y: 28, note: 'Average female stature is ~118 mm less than male. Design for the full range — 5th female to 95th male.' },
  { id: 'eye', label: 'Eye height (standing)', p5: '1,405', p50: '1,516', p95: '1,630', y: 60, note: 'Female 50th percentile eye height roughly equals male 5th percentile. Counter heights should accommodate both.' },
  { id: 'shoulder', label: 'Shoulder height', p5: '1,252', p50: '1,356', p95: '1,463', y: 90, note: 'Upper reach without extending arm. Impacts overhead storage, high shelving, and accessible reach maximums.' },
  { id: 'elbow', label: 'Elbow height', p5: '945', p50: '1,023', p95: '1,105', y: 145, note: 'Female elbow height ~82 mm lower than male. Kitchen counter heights of 850 mm suit the middle range.' },
  { id: 'hip', label: 'Hip breadth (standing)', p5: '310', p50: '370', p95: '438', y: 175, note: 'Female hip breadth at 95th percentile exceeds male. Seat widths should accommodate the 95th percentile female.' },
  { id: 'knuckle', label: 'Knuckle height', p5: '665', p50: '720', p95: '780', y: 210, note: 'Lower than male — handrails designed to male knuckle height work for female grip but may feel slightly high.' },
  { id: 'seated', label: 'Seated height (erect)', p5: '790', p50: '850', p95: '910', y: 260, note: 'Overhead clearance in seated venues must accommodate the tallest occupant (95th male), not the average.' },
  { id: 'seated-eye', label: 'Seated eye height', p5: '685', p50: '740', p95: '795', y: 278, note: 'Sight line ~50 mm lower than male. Theater riser calculations use the worst case (smallest eye height).' },
  { id: 'thigh', label: 'Thigh clearance (seated)', p5: '130', p50: '148', p95: '170', y: 298, note: 'Slightly less than male. Standard desk clearance of 680 mm accommodates both sexes comfortably.' },
  { id: 'popliteal', label: 'Popliteal height (seat height)', p5: '360', p50: '400', p95: '440', y: 326, note: 'Lower than male — chairs at 450 mm are too high for 5th percentile females (feet won\'t reach floor).' },
]

export const BodyDimensionExplorer = () => {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [activeIdx, setActiveIdx] = useState(0)
  const dims = sex === 'male' ? MALE_DIMS : FEMALE_DIMS
  const active = dims[activeIdx]

  return (
    <div className="not-prose my-5 rounded-[10px] border border-[#E0DED8] overflow-hidden bg-white dark:bg-[#1A1A1A] dark:border-[#3A3835]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-br from-[#EEF3FD] to-[#E8EEFF] border-b border-[#E0DED8] dark:from-[#1B3FC4]/10 dark:to-[#1B3FC4]/5 dark:border-[#3A3835]">
        <div>
          <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-[#1B3FC4]">
            Interactive · Anthropometric Data Explorer
          </div>
          <div className="text-xs text-[#737370] mt-0.5 dark:text-[#A8A8A5]">
            Tap a dimension to see percentile values and design implications
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => { setSex('male'); setActiveIdx(0) }}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all duration-150 font-[var(--font-dm-mono)] uppercase tracking-[0.06em] ${
              sex === 'male'
                ? 'bg-[#1B3FC4] text-white'
                : 'bg-[#F5F5F5] text-[#737370] hover:text-[#1B3FC4] dark:bg-[#252420]'
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => { setSex('female'); setActiveIdx(0) }}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all duration-150 font-[var(--font-dm-mono)] uppercase tracking-[0.06em] ${
              sex === 'female'
                ? 'bg-[#1B3FC4] text-white'
                : 'bg-[#F5F5F5] text-[#737370] hover:text-[#1B3FC4] dark:bg-[#252420]'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row">
        {/* Dimension list */}
        <div className="flex-1 border-r border-[#ECEAE4] dark:border-[#3A3835]">
          {dims.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`w-full text-left px-5 py-2.5 border-b border-[#ECEAE4] transition-all duration-150 dark:border-[#3A3835] ${
                i === activeIdx
                  ? 'bg-[#EEF3FD] border-l-2 border-l-[#1B3FC4] dark:bg-[#1B3FC4]/10'
                  : 'hover:bg-[#F5F5F5] border-l-2 border-l-transparent dark:hover:bg-[#252420]'
              }`}
            >
              <div className={`text-[13px] font-medium ${i === activeIdx ? 'text-[#1B3FC4]' : 'text-[#1A1A1A] dark:text-[#E2E0D8]'}`}>
                {d.label}
              </div>
              <div className="font-[var(--font-dm-mono)] text-[11px] text-[#A8A8A5] mt-0.5">
                {d.p5} – {d.p95} mm
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="w-full sm:w-[320px] p-5">
          <div className="text-[15px] font-semibold text-[#1A1A1A] mb-3 dark:text-[#E2E0D8]">
            {active.label}
          </div>

          {/* Percentile cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: '5th %ile', val: active.p5, desc: 'Small' },
              { label: '50th %ile', val: active.p50, desc: 'Average' },
              { label: '95th %ile', val: active.p95, desc: 'Large' },
            ].map((p) => (
              <div key={p.label} className="bg-[#F5F5F5] rounded-lg p-3 text-center dark:bg-[#252420]">
                <div className="font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.08em] text-[#A8A8A5] mb-1">
                  {p.label}
                </div>
                <div className="font-[var(--font-dm-mono)] text-lg font-medium text-[#1B3FC4]">
                  {p.val}
                </div>
                <div className="text-[11px] text-[#A8A8A5] mt-0.5">mm</div>
              </div>
            ))}
          </div>

          {/* Design note */}
          <div className="bg-[#EEF3FD] rounded-lg p-3.5 text-[13px] text-[#3D3D3A] leading-relaxed dark:bg-[#1B3FC4]/10 dark:text-[#C8C6C0]">
            <div className="font-[var(--font-dm-mono)] text-[11px] uppercase tracking-[0.1em] text-[#1B3FC4] mb-1.5 font-medium">
              Design implication
            </div>
            {active.note}
          </div>
        </div>
      </div>
    </div>
  )
}
