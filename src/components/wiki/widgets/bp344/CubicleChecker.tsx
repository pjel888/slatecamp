'use client'

import * as React from 'react'

export const CubicleChecker = () => {
  const [w, setW] = React.useState(1800)
  const [d, setD] = React.useState(1800)
  const [door, setDoor] = React.useState(900)
  const [turn, setTurn] = React.useState(1800)
  const [swing, setSwing] = React.useState('out')

  const issues: string[] = []
  const passes: string[] = []
  if (w < 1800) issues.push(`Width ${w}mm < 1,800mm (C.6.3.a) — 2024: now square, was 1,700mm`)
  else passes.push(`Width ${w}mm ✓`)
  if (d < 1800) issues.push(`Depth ${d}mm < 1,800mm (C.6.3.a)`)
  else passes.push(`Depth ${d}mm ✓`)
  if (door < 900) issues.push(`Door ${door}mm < 900mm (C.2.1)`)
  else passes.push(`Door ${door}mm ✓`)
  if (turn < 1800) issues.push(`Turning space ${turn}mm < 1,800mm (C.6.3.i) — 2024 updated from 1,500mm`)
  else passes.push(`Turning ${turn}mm ✓`)
  if (swing === 'in') issues.push('Door swings inward — must swing outward (C.6.14)')
  else passes.push('Door swing outward ✓')
  const ok = issues.length === 0

  const sc = Math.min(160 / Math.max(w, 1), 160 / Math.max(d, 1))
  const cw = Math.round(w * sc), cd = Math.round(d * sc), tw = Math.round(turn * sc)
  const mPx = Math.round(1800 * sc), ox = 30, oy = 20
  const wOk = w >= 1800, dOk = d >= 1800, tOk = turn >= 1800, swOk = swing === 'out'
  const wcX = ox + Math.round(cw * 0.5), wcY = oy + Math.round(cd * 0.38)
  const clPx = Math.round(450 * sc), dPx = Math.round(door * sc), tsY = oy + cd + 22

  return (
    <div className="not-prose my-5 rounded-lg border border-[#d0cec7] bg-[#F5F5F5] px-6 py-5">
      <div className="font-dm-mono text-[11px] uppercase tracking-[0.08em] text-camp-cobalt mb-2">Interactive — Cubicle Compliance Checker (2024 IRR)</div>
      <div className="flex gap-3.5 flex-wrap mb-3">
        {([['Width (mm)', w, setW], ['Depth (mm)', d, setD], ['Door clear width (mm)', door, setDoor], ['Turning space (mm)', turn, setTurn]] as const).map(([lbl, val, set]) => (
          <div key={lbl as string}>
            <label className="block text-[11px] font-semibold text-[#555] mb-1 uppercase">{lbl as string}</label>
            <input
              type="number"
              value={val as number}
              step={50}
              min={500}
              max={2500}
              onChange={e => (set as (v: number) => void)(parseFloat(e.target.value) || 0)}
              className="w-[100px] px-2 py-1.5 border-[1.5px] border-[#ccc] rounded-md text-[13px] font-dm-mono"
            />
          </div>
        ))}
        <div>
          <label className="block text-[11px] font-semibold text-[#555] mb-1 uppercase">Door swing</label>
          <select
            value={swing}
            onChange={e => setSwing(e.target.value)}
            className="px-2 py-1.5 border-[1.5px] border-[#ccc] rounded-md text-[13px]"
          >
            <option value="out">Outward</option>
            <option value="in">Inward</option>
          </select>
        </div>
      </div>
      <div className={`rounded-md p-3 px-3.5 text-[12px] leading-[1.8] mb-3 ${ok ? 'bg-[#e8f5ee] border border-[#1B7A3C] text-[#0f4a24]' : 'bg-[#fdf0ef] border border-[#E63329] text-[#5a1a16]'}`}>
        {ok ? (
          <><strong className="text-[#1B7A3C]">✓ Compliant — 2024 IRR</strong><br />{passes.join(' · ')}</>
        ) : (
          <><strong className="text-[#E63329]">✗ Non-compliant:</strong><br />{issues.map((x, i) => <span key={i}>• {x}<br /></span>)}</>
        )}
      </div>
      <svg width="100%" viewBox="0 0 420 280" className="max-w-[420px] block" role="img" aria-labelledby="cubicle-viz-title">
        <title id="cubicle-viz-title">Cubicle layout visualization — {ok ? 'compliant' : 'non-compliant'} with 2024 IRR standards</title>
        <rect x={ox} y={oy} width={mPx} height={mPx} fill="none" stroke="#1B3FC4" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
        <text x={ox + mPx + 3} y={oy + mPx / 2} fontSize="7" fill="#1B3FC4" opacity="0.5" dominantBaseline="central">1800mm min</text>
        <rect x={ox} y={oy} width={cw} height={cd} fill={wOk && dOk ? 'rgba(27,122,60,0.07)' : 'rgba(230,51,41,0.07)'} stroke={wOk && dOk ? '#1B7A3C' : '#E63329'} strokeWidth="1.5" rx="2" />
        <ellipse cx={wcX} cy={wcY} rx="14" ry="18" fill="#fff" stroke="#aaa" strokeWidth="1" />
        <text x={wcX} y={wcY} fontSize="7" fill="#888" textAnchor="middle" dominantBaseline="central">WC</text>
        <line x1={ox} y1={wcY} x2={ox + clPx} y2={wcY} stroke="#E8853A" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x={ox + clPx / 2} y={wcY - 6} fontSize="7" fill="#E8853A" textAnchor="middle">450mm CL</text>
        <line x1={ox} y1={oy + cd} x2={ox + dPx} y2={oy + cd} stroke={swOk ? '#E8853A' : '#E63329'} strokeWidth="2.5" />
        <text x={ox + dPx / 2} y={oy + cd + 11} fontSize="7" fill={swOk ? '#E8853A' : '#E63329'} textAnchor="middle">{door}mm ({swOk ? '→ out ✓' : '← IN ✗'})</text>
        <line x1={ox} y1={oy - 8} x2={ox + cw} y2={oy - 8} stroke={wOk ? '#1B7A3C' : '#E63329'} strokeWidth="1" />
        <text x={ox + cw / 2} y={oy - 13} fontSize="9" fill={wOk ? '#1B7A3C' : '#E63329'} textAnchor="middle">{w}mm {wOk ? '✓' : '✗'}</text>
        <line x1={ox + cw + 8} y1={oy} x2={ox + cw + 8} y2={oy + cd} stroke={dOk ? '#1B7A3C' : '#E63329'} strokeWidth="1" />
        <text x={ox + cw + 12} y={oy + cd / 2} fontSize="9" fill={dOk ? '#1B7A3C' : '#E63329'} dominantBaseline="central">{d}mm {dOk ? '✓' : '✗'}</text>
        <rect x={ox} y={tsY} width={tw} height={Math.round(tw * 0.4)} fill={tOk ? 'rgba(27,122,60,0.08)' : 'rgba(230,51,41,0.08)'} stroke={tOk ? '#1B7A3C' : '#E63329'} strokeWidth="1" strokeDasharray="3 2" rx="2" />
        <text x={ox + tw / 2} y={tsY + Math.round(tw * 0.2)} fontSize="7" fill={tOk ? '#1B7A3C' : '#E63329'} textAnchor="middle" dominantBaseline="central">Turning: {turn}mm {tOk ? '✓' : '✗ min 1800'}</text>
      </svg>
    </div>
  )
}
