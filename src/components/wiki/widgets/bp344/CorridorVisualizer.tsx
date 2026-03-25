'use client'

import * as React from 'react'

export const CorridorVisualizer = () => {
  const [mode, setMode] = React.useState('single')
  const [cw, setCw] = React.useState(1500)
  const req = mode === 'single' ? 1500 : 1800
  const label = mode === 'single' ? 'Single wheelchair + ambulant (min 1,500 mm)' : 'Two wheelchairs passing (min 1,800 mm)'
  const ok = cw >= req
  const sc = 0.14, cPx = Math.max(Math.min(cw * sc, 240), 20), mPx = req * sc
  const sX = 80, wY = 40, wH = 80, wc1X = sX + 14, wc1Y = wY + wH / 2 - 14

  return (
    <div className="not-prose my-5 rounded-lg border border-[#d0cec7] bg-[#F5F5F5] px-6 py-5">
      <div className="font-dm-mono text-[11px] uppercase tracking-[0.08em] text-[camp-cobalt] mb-2">Interactive — Corridor Width Visualizer (2024 IRR)</div>
      <div className="flex gap-5 mb-3 flex-wrap items-center">
        <label className="flex items-center gap-2 text-[13px] text-[#444] cursor-pointer">
          <input type="radio" name="corr-mode" checked={mode === 'single'} onChange={() => setMode('single')} /> Single WC + ambulant
        </label>
        <label className="flex items-center gap-2 text-[13px] text-[#444] cursor-pointer">
          <input type="radio" name="corr-mode" checked={mode === 'double'} onChange={() => setMode('double')} /> Two wheelchairs
        </label>
        <div className="flex items-center gap-2">
          <label className="text-[12px] text-[#555]">Corridor width (mm):</label>
          <input
            type="number"
            value={cw}
            step={50}
            min={600}
            max={3000}
            onChange={e => setCw(parseFloat(e.target.value) || 0)}
            className="w-[90px] px-2 py-1.5 border-[1.5px] border-[#ccc] rounded-md text-[13px] font-dm-mono"
          />
        </div>
      </div>
      <svg width="100%" viewBox="0 0 480 160" className="max-w-[480px] block" role="img" aria-labelledby="corridor-viz-title">
        <title id="corridor-viz-title">Corridor width visualization showing {cw}mm width — {ok ? 'compliant' : 'non-compliant'} with 2024 IRR {req}mm minimum</title>
        <rect x={sX} y={wY} width="6" height={wH} fill="#888" rx="1" />
        <rect x={sX + cPx} y={wY} width="6" height={wH} fill="#888" rx="1" />
        <rect x={sX + 6} y={wY} width={cPx - 6} height={wH} fill={ok ? 'rgba(27,122,60,0.07)' : 'rgba(230,51,41,0.07)'} />
        <rect x={sX + 6} y={wY} width={Math.min(mPx, cPx - 6)} height={wH} fill="none" stroke="#1B3FC4" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
        <rect x={wc1X} y={wc1Y} width="28" height="28" rx="4" fill={ok ? '#1B3FC4' : '#E63329'} opacity="0.7" />
        <text x={wc1X + 14} y={wc1Y + 16} fontSize="8" fill="#fff" textAnchor="middle">WC</text>
        {mode === 'double' ? (
          <>
            <rect x={sX + cPx - 42} y={wc1Y} width="28" height="28" rx="4" fill={ok ? '#1B3FC4' : '#E63329'} opacity="0.7" />
            <text x={sX + cPx - 28} y={wc1Y + 16} fontSize="8" fill="#fff" textAnchor="middle">WC</text>
          </>
        ) : (
          <ellipse cx={sX + cPx - 20} cy={wY + wH / 2} rx="9" ry="14" fill={ok ? '#1B7A3C' : '#E63329'} opacity="0.6" />
        )}
        <line x1={sX + 6} y1={wY + wH + 12} x2={sX + cPx} y2={wY + wH + 12} stroke={ok ? '#1B7A3C' : '#E63329'} strokeWidth="1" />
        <text x={sX + cPx / 2} y={wY + wH + 24} fontSize="9" fill={ok ? '#1B7A3C' : '#E63329'} textAnchor="middle">{cw}mm {ok ? '✓' : '✗'}</text>
        <text x={sX + mPx / 2} y={wY - 8} fontSize="8" fill="#1B3FC4" textAnchor="middle" opacity="0.7">min {req}mm (2024)</text>
      </svg>
      <div className={`mt-2.5 text-[12px] px-3 py-2 rounded-md font-semibold ${ok ? 'bg-[#e8f5ee] border border-[#1B7A3C] text-[#1B7A3C]' : 'bg-[#fdf0ef] border border-[#E63329] text-[#E63329]'}`}>
        {ok ? `✓ ${cw}mm meets the 2024 IRR ${req}mm minimum for ${label}.` : `✗ ${cw}mm is below the 2024 IRR ${req}mm minimum. Deficit: ${req - cw}mm.`}
      </div>
    </div>
  )
}
