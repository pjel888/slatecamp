'use client'

import * as React from 'react'

export const DoorConfigurator = () => {
  const [width, setWidth] = React.useState(900)
  const [space, setSpace] = React.useState(1800)
  const [thresh, setThresh] = React.useState(0)
  const [hwH, setHwH] = React.useState(900)
  const [force, setForce] = React.useState(2.0)

  const issues: string[] = []
  const passes: string[] = []
  if (width < 900) issues.push('Clear width ' + width + 'mm < 900mm minimum (C.2.1)')
  else passes.push('Width ' + width + 'mm ✓')
  if (space < 1800) issues.push('Approach space ' + space + 'mm < 1,800mm minimum (C.2.6) — 2024 updated')
  else passes.push('Approach space ' + space + 'mm ✓')
  if (thresh > 12) issues.push('Threshold ' + thresh + 'mm exceeds 12mm maximum (C.3.1) — 2024 updated, was 19mm')
  else if (thresh > 6) passes.push('Threshold ' + thresh + 'mm ✓ — bevel required (gradient 1:8)')
  else passes.push('Threshold ' + thresh + 'mm ✓')
  if (hwH < 800 || hwH > 1000) issues.push('Hardware height ' + hwH + 'mm outside preferred 800–1,000mm range (C.2.11)')
  else passes.push('Hardware ' + hwH + 'mm ✓')
  if (force > 2.0) issues.push('Door closer force ' + force + 'kg exceeds 2.0kg maximum (C.2.4) — 2024 updated, was 4.0kg')
  else passes.push('Door closer ' + force + 'kg ✓')
  const ok = issues.length === 0

  const sc = 0.09, wX = 30, wY = 40, wH = 120
  const dPx = Math.min(width * sc, 80), spW = Math.min(space * sc, 120), tH = Math.min(thresh * 0.8, 8)
  const hardY = wY + wH - (hwH * sc), dSX = wX + 10, dEX = dSX + dPx
  const wOk = width >= 900, sOk = space >= 1800, tOk = thresh <= 12

  const fields = [
    { label: 'Clear width (mm)', val: width, set: setWidth, min: 500, max: 1200, step: 10 },
    { label: 'Approach space (mm)', val: space, set: setSpace, min: 900, max: 2400, step: 100 },
    { label: 'Threshold height (mm)', val: thresh, set: setThresh, min: 0, max: 25, step: 1 },
    { label: 'Hardware height (mm)', val: hwH, set: setHwH, min: 600, max: 1200, step: 50 },
    { label: 'Closer force (kg)', val: force, set: setForce, min: 0.5, max: 5.0, step: 0.1 },
  ]

  return (
    <div className="not-prose my-5 rounded-lg border border-[var(--widget-border)] bg-muted px-6 py-5">
      <div className="font-dm-mono text-[11px] uppercase tracking-[0.08em] text-camp-cobalt mb-2">Interactive — Door Compliance Configurator (2024 IRR)</div>
      <p className="text-[13px] text-[var(--widget-text)] mb-3.5">Enter your door parameters. All values are checked against the 2024 Revised IRR.</p>
      <div className="flex gap-3.5 flex-wrap mb-3.5">
        {fields.map(({ label, val, set, min, max, step }) => (
          <div key={label}>
            <label className="block text-[11px] font-semibold text-text-2 mb-1 uppercase">{label}</label>
            <input
              type="number"
              value={val}
              min={min}
              max={max}
              step={step}
              onChange={e => set(parseFloat(e.target.value) || 0)}
              className="w-[100px] px-2 py-1.5 border-[1.5px] border-[var(--widget-input-border)] rounded-md text-[13px] font-dm-mono"
            />
          </div>
        ))}
      </div>
      <div className={`rounded-md p-3 px-3.5 text-[12px] leading-[1.8] mb-3 ${ok ? 'bg-[var(--widget-success-bg)] border border-camp-green text-[var(--widget-success-ink)]' : 'bg-destructive-50 border border-camp-red text-[var(--widget-danger-ink)]'}`}>
        {ok ? (
          <>
            <strong className="text-camp-green">✓ All parameters compliant</strong> — meets 2024 BP 344 IRR.
            <br /><span className="text-text-2">{passes.join(' · ')}</span>
          </>
        ) : (
          <>
            <strong className="text-camp-red">✗ Non-compliant:</strong><br />
            {issues.map((x, i) => <span key={i}>• {x}<br /></span>)}
            {passes.length > 0 && <span className="text-text-2 text-[11px]">Passing: {passes.join(' · ')}</span>}
          </>
        )}
      </div>
      <svg width="100%" viewBox="0 0 480 200" className="max-w-[480px] block" role="img" aria-labelledby="door-viz-title">
        <title id="door-viz-title">Door compliance visualization — {ok ? 'all parameters compliant' : 'non-compliant'} with 2024 IRR</title>
        <rect x={wX} y={wY} width="10" height={wH} fill="#888" rx="2" />
        <line x1={dSX} y1={wY + wH / 2} x2={dEX} y2={wY + wH / 2} stroke={wOk ? '#1B7A3C' : '#E63329'} strokeWidth="3" />
        <path d={`M ${dEX} ${wY + wH / 2} Q ${dEX + 20} ${wY + wH / 2 - 30} ${dEX + 10} ${wY + wH / 2 - dPx * 0.9}`} fill="none" stroke={wOk ? '#1B7A3C' : '#E63329'} strokeWidth="0.8" strokeDasharray="4 2" />
        <line x1={dSX} y1={wY + wH + 10} x2={dEX} y2={wY + wH + 10} stroke={wOk ? '#1B7A3C' : '#E63329'} strokeWidth="1" />
        <text x={dSX + dPx / 2} y={wY + wH + 22} fontSize="9" fill={wOk ? '#1B7A3C' : '#E63329'} textAnchor="middle">{width}mm {wOk ? '✓' : '✗'}</text>
        <rect x={dSX} y={wY} width={spW} height={wH} fill={sOk ? 'rgba(27,122,60,0.08)' : 'rgba(230,51,41,0.08)'} stroke={sOk ? '#1B7A3C' : '#E63329'} strokeWidth="1" strokeDasharray="4 3" rx="2" />
        <text x={dSX + spW / 2} y={wY + wH / 2 - 8} fontSize="8" fill={sOk ? '#1B7A3C' : '#E63329'} textAnchor="middle">Approach</text>
        <text x={dSX + spW / 2} y={wY + wH / 2 + 4} fontSize="8" fill={sOk ? '#1B7A3C' : '#E63329'} textAnchor="middle">{space}mm {sOk ? '✓' : '✗ min 1800'}</text>
        {thresh > 0 && (
          <>
            <rect x={dSX} y={wY + wH - tH} width={dPx} height={tH} fill={tOk ? '#c0dd97' : '#F09595'} opacity="0.8" />
            <text x={dSX + dPx / 2} y={wY + wH + 36} fontSize="8" fill={tOk ? '#1B7A3C' : '#E63329'} textAnchor="middle">Threshold: {thresh}mm {tOk ? '✓' : '✗ max 12mm'}</text>
          </>
        )}
        <circle cx={dEX - 3} cy={hardY} r="4" fill="#E8853A" />
        <text x={dEX + 10} y={hardY + 4} fontSize="8" fill="#E8853A">HW: {hwH}mm</text>
      </svg>
    </div>
  )
}
