'use client'

import { useMemo, useState } from 'react'

const CLEARANCE_MM = 750
const SIDE_REAR_REFERENCE_MM = 1600

const LOT_PRESETS = [
  {
    label: 'Board-review lot',
    width: 12,
    depth: 20,
    front: 'sample front band',
    side: 'sample side band',
    rear: 'sample rear band',
  },
  {
    label: 'Narrow urban lot',
    width: 8,
    depth: 16,
    front: 'sample front band',
    side: 'sample side band',
    rear: 'sample rear band',
  },
  {
    label: 'Deeper practice lot',
    width: 14,
    depth: 24,
    front: 'sample front band',
    side: 'sample side band',
    rear: 'sample rear band',
  },
] as const

const EAVE_OPTIONS = [600, 800, 950, 1100] as const

type LotPresetIndex = 0 | 1 | 2

const formatMeters = (value: number) => `${value.toFixed(value % 1 === 0 ? 0 : 1)} m`

export const HeroCodeEnvelopeExplorer = () => {
  const [presetIndex, setPresetIndex] = useState<LotPresetIndex>(0)
  const [showSetbacks, setShowSetbacks] = useState(true)
  const [eaveProjection, setEaveProjection] = useState(800)

  const preset = LOT_PRESETS[presetIndex]
  const clearDistance = SIDE_REAR_REFERENCE_MM - eaveProjection
  const isCompliant = clearDistance >= CLEARANCE_MM
  const eaveVisualOffset = Math.min(32, Math.max(12, eaveProjection / 38))

  const dimensions = useMemo(() => {
    const frontBand = showSetbacks ? 2.4 : 0
    const rearBand = showSetbacks ? 2 : 0
    const sideBand = showSetbacks ? 1.5 : 0
    return {
      buildableWidth: Math.max(0, preset.width - sideBand * 2),
      buildableDepth: Math.max(0, preset.depth - frontBand - rearBand),
      frontBand,
      rearBand,
      sideBand,
    }
  }, [preset.depth, preset.width, showSetbacks])

  return (
    <div className='relative overflow-hidden rounded-[28px] border border-camp-cobalt/15 bg-camp-black p-3 shadow-[0_28px_80px_rgba(15,23,42,0.28)]'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,166,35,0.28),transparent_32%),radial-gradient(circle_at_90%_30%,rgba(59,130,246,0.34),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]' />
      <div className='relative overflow-hidden rounded-[22px] border border-white/10 bg-camp-black'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3'>
          <div>
            <p className='font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold tracking-[0.18em] uppercase text-camp-amber'>
              Code Envelope Explorer
            </p>
            <h2 className='mt-1 text-[15px] font-bold text-white'>
              Try a setback. Watch the buildable envelope change.
            </h2>
          </div>
          <div className='rounded-full border border-white/10 bg-white/8 px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-white/70'>
            PD 1096 / NBCP study preview
          </div>
        </div>

        <div className='grid gap-0 lg:grid-cols-[1fr_250px]'>
          <div className='relative min-h-[360px] overflow-hidden p-4 sm:p-6'>
            <div className='absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(126,179,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(126,179,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]' />
            <svg
              viewBox='0 0 420 310'
              className='relative z-10 h-full min-h-[318px] w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.32)]'
              role='img'
              aria-label='Educational isometric diagram showing lot lines, setback bands, a buildable envelope, and eave clearance from side and rear property lines.'
            >
              <defs>
                <linearGradient id='heroBuildingFace' x1='0' x2='1' y1='0' y2='1'>
                  <stop offset='0%' stopColor='#6EA8FF' stopOpacity='0.95' />
                  <stop offset='100%' stopColor='#1B3FC4' stopOpacity='0.95' />
                </linearGradient>
                <linearGradient id='heroRoof' x1='0' x2='1' y1='0' y2='1'>
                  <stop offset='0%' stopColor='#F9C46B' />
                  <stop offset='100%' stopColor='#F5A623' />
                </linearGradient>
                <pattern id='heroHatch' width='8' height='8' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
                  <line x1='0' x2='0' y1='0' y2='8' stroke='rgba(245,166,35,0.22)' strokeWidth='1' />
                </pattern>
              </defs>

              <rect x='34' y='34' width='340' height='220' rx='10' fill='rgba(9,22,42,0.78)' stroke='rgba(126,179,255,0.22)' />
              <rect x='34' y='34' width='340' height='220' rx='10' fill='none' stroke='rgba(255,255,255,0.34)' strokeDasharray='8 6' />
              <text x='44' y='26' fill='rgba(255,255,255,0.52)' fontSize='10' fontFamily='monospace'>PROPERTY LINE</text>

              {showSetbacks && (
                <g>
                  <rect x='34' y='34' width='340' height='38' fill='rgba(245,166,35,0.16)' />
                  <rect x='34' y='214' width='340' height='40' fill='rgba(245,166,35,0.12)' />
                  <rect x='34' y='34' width='34' height='220' fill='rgba(245,166,35,0.13)' />
                  <rect x='340' y='34' width='34' height='220' fill='rgba(245,166,35,0.13)' />
                  <rect x='68' y='72' width='272' height='142' rx='8' fill='url(#heroHatch)' stroke='rgba(245,166,35,0.72)' strokeWidth='1.5' />
                  <text x='204' y='150' fill='rgba(245,166,35,0.76)' fontSize='11' fontFamily='monospace' textAnchor='middle'>BUILDABLE ENVELOPE</text>
                  <text x='204' y='65' fill='rgba(245,166,35,0.7)' fontSize='9' fontFamily='monospace' textAnchor='middle'>SAMPLE SETBACK BAND</text>
                </g>
              )}

              <g transform='translate(128 100)'>
                <polygon points='0,54 112,16 210,62 100,112' fill='rgba(126,179,255,0.10)' stroke='rgba(126,179,255,0.25)' />
                <polygon points='30,54 116,25 178,56 94,90' fill='url(#heroBuildingFace)' />
                <polygon points='30,54 94,90 94,142 30,104' fill='#153c9f' />
                <polygon points='94,90 178,56 178,108 94,142' fill='#102d77' />
                <polygon points={`${30 - eaveVisualOffset},48 116,12 ${178 + eaveVisualOffset},50 94,94`} fill='url(#heroRoof)' stroke={isCompliant ? '#A7F3D0' : '#F87171'} strokeWidth='2' />
                <polygon points='50,68 74,58 74,90 50,102' fill='rgba(255,255,255,0.16)' />
                <polygon points='124,74 154,62 154,94 124,108' fill='rgba(255,255,255,0.14)' />
                <line x1={178 + eaveVisualOffset} y1='50' x2='236' y2='22' stroke={isCompliant ? '#A7F3D0' : '#F87171'} strokeWidth='1.5' strokeDasharray='4 4' />
                <line x1='236' y1='22' x2='236' y2='112' stroke='rgba(255,255,255,0.42)' strokeDasharray='6 5' />
                <text x='242' y='32' fill='rgba(255,255,255,0.56)' fontSize='9' fontFamily='monospace'>SIDE/REAR LINE</text>
              </g>

              <g>
                <line x1='306' y1='104' x2='364' y2='76' stroke={isCompliant ? '#A7F3D0' : '#F87171'} strokeWidth='1.5' />
                <path d='M306 104 l7 -1 l-5 -5' fill='none' stroke={isCompliant ? '#A7F3D0' : '#F87171'} strokeWidth='1.5' />
                <path d='M364 76 l-7 1 l5 5' fill='none' stroke={isCompliant ? '#A7F3D0' : '#F87171'} strokeWidth='1.5' />
                <rect x='250' y='52' width='144' height='36' rx='8' fill={isCompliant ? 'rgba(16,185,129,0.16)' : 'rgba(248,113,113,0.18)'} stroke={isCompliant ? 'rgba(167,243,208,0.42)' : 'rgba(248,113,113,0.48)'} />
                <text x='322' y='67' fill={isCompliant ? '#A7F3D0' : '#FCA5A5'} fontSize='10' fontFamily='monospace' textAnchor='middle'>
                  {clearDistance} mm clear
                </text>
                <text x='322' y='80' fill='rgba(255,255,255,0.48)' fontSize='8' fontFamily='monospace' textAnchor='middle'>
                  target: 750 mm minimum
                </text>
              </g>

              <g transform='translate(52 264)'>
                <rect x='0' y='0' width='316' height='32' rx='10' fill='rgba(255,255,255,0.08)' />
                <circle cx='18' cy='16' r='5' fill={isCompliant ? '#34D399' : '#F87171'} />
                <text x='32' y='20' fill='rgba(255,255,255,0.72)' fontSize='11' fontFamily='monospace'>
                  {isCompliant ? 'Compliant study state' : 'Too close in this study state'} · {showSetbacks ? 'Setbacks visible' : 'Eave rule only'}
                </text>
              </g>
            </svg>
          </div>

          <div className='border-t border-white/10 bg-white/[0.035] p-4 lg:border-l lg:border-t-0'>
            <div className='space-y-4'>
              <div>
                <p id='sample-lot-label' className='text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70'>Sample lot</p>
                <div className='mt-2 grid gap-2' role='radiogroup' aria-labelledby='sample-lot-label'>
                  {LOT_PRESETS.map((lot, index) => (
                    <button
                      key={lot.label}
                      type='button'
                      role='radio'
                      aria-checked={presetIndex === index}
                      onClick={() => setPresetIndex(index as LotPresetIndex)}
                      className={`rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                        presetIndex === index
                          ? 'border-camp-amber bg-camp-amber/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white/90'
                      }`}
                    >
                      <span className='block font-semibold'>{lot.label}</span>
                      <span className='font-[family-name:var(--font-dm-mono)] text-[11px] opacity-75'>
                        {formatMeters(lot.width)} × {formatMeters(lot.depth)} sample
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className='rounded-xl border border-white/10 bg-black/20 p-3'>
                <div className='flex items-center justify-between gap-3'>
                  <label htmlFor='eave-projection' className='text-[12px] font-semibold text-white'>
                    Eave projection
                  </label>
                  <output htmlFor='eave-projection' className='font-[family-name:var(--font-dm-mono)] text-[11px] text-camp-amber'>
                    {eaveProjection} mm
                  </output>
                </div>
                <input
                  id='eave-projection'
                  min='600'
                  max='1100'
                  step='50'
                  value={eaveProjection}
                  onChange={(event) => setEaveProjection(Number(event.target.value))}
                  type='range'
                  className='mt-3 w-full accent-camp-amber'
                />
                <div className='mt-2 flex justify-between text-[11px] text-white/60'>
                  {EAVE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type='button'
                      onClick={() => setEaveProjection(option)}
                      className='rounded px-1 py-0.5 hover:bg-white/10 hover:text-white/70'
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type='button'
                onClick={() => setShowSetbacks((value) => !value)}
                className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-left text-[12px] text-white transition hover:border-white/25'
                aria-pressed={showSetbacks}
              >
                <span>
                  <span className='block font-semibold'>Show setbacks</span>
                  <span className='text-[11px] text-white/70'>Toggle site-control bands and buildable envelope.</span>
                </span>
                <span className={`h-5 w-9 rounded-full p-0.5 transition ${showSetbacks ? 'bg-camp-amber' : 'bg-white/18'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition ${showSetbacks ? 'translate-x-4' : ''}`} />
                </span>
              </button>

              <div className='grid grid-cols-2 gap-2'>
                <div className='rounded-xl border border-white/10 bg-white/6 p-3'>
                  <p className='text-[11px] uppercase tracking-[0.16em] text-white/60'>Buildable width</p>
                  <p className='mt-1 font-[family-name:var(--font-dm-mono)] text-[18px] font-bold text-white'>
                    {formatMeters(dimensions.buildableWidth)}
                  </p>
                </div>
                <div className='rounded-xl border border-white/10 bg-white/6 p-3'>
                  <p className='text-[11px] uppercase tracking-[0.16em] text-white/60'>Buildable depth</p>
                  <p className='mt-1 font-[family-name:var(--font-dm-mono)] text-[18px] font-bold text-white'>
                    {formatMeters(dimensions.buildableDepth)}
                  </p>
                </div>
              </div>

              <div className='rounded-xl border border-camp-amber/20 bg-camp-amber/10 p-3'>
                <p className='font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.16em] text-camp-amber'>
                  Study guardrail
                </p>
                <p className='mt-1 text-[12px] leading-relaxed text-white/75' aria-live='polite'>
                  Rule VIII eave clearance is shown as a study visual. Setback bands are sample educational overlays until the verified source locator is attached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
